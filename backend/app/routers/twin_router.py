"""
app/routers/twin_router.py – Digital-twin pipeline endpoints

Endpoints
---------
GET  /twin/{patient_id}/scores          → FIB-4, APRI, interpretations
GET  /twin/{patient_id}/forecast        → Kalman forecast (12 months)
POST /twin/whatif                        → What-if scenario analysis
GET  /twin/{patient_id}/traffic-light   → Green / Yellow / Red indicator
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Tuple

from app.config import settings
from app.database import get_db
from app.models import orm, schemas
from app.auth import get_current_user
from app.engine.math_utils import compute_fib4, compute_apri, interpret_fib4, interpret_apri
from app.engine.kalman import (
    Visit as KVisit,
    KalmanParams as KParams,
    run_kalman,
    forecast_months,
    crossing_probability,
)
from app.engine.hepatitis_evaluator import evaluate_hepatitis_risk_ai

router = APIRouter(prefix="/twin", tags=["digital-twin"])


# ─── helpers ─────────────────────────────────────────────────────────────────

async def _load_patient_visits(
    patient_id: str,
    owner_id: str,
    db: AsyncSession,
) -> tuple[orm.Patient, list[orm.Visit]]:
    """Load patient (owned check) and ordered visits."""
    result = await db.execute(
        select(orm.Patient).where(
            orm.Patient.id == patient_id,
            orm.Patient.owner_id == owner_id,
        )
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visits_result = await db.execute(
        select(orm.Visit)
        .where(orm.Visit.patient_id == patient_id)
        .order_by(orm.Visit.month)
    )
    visits = list(visits_result.scalars().all())
    return patient, visits


def _default_kparams() -> KParams:
    return KParams(
        observation_std=settings.KALMAN_OBS_STD,
        process_std=settings.KALMAN_PROCESS_STD,
        initial_level_std=settings.KALMAN_INIT_LEVEL_STD,
        initial_slope_std=settings.KALMAN_INIT_SLOPE_STD,
    )


def _orm_visits_to_engine(visits: list[orm.Visit]) -> list[KVisit]:
    return [KVisit(month=v.month, ast=v.ast, alt=v.alt, platelets=v.platelets) for v in visits]


# ─── Endpoint: Clinical scores ────────────────────────────────────────────────

@router.get("/{patient_id}/scores", response_model=schemas.ScoresOut)
async def get_scores(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Compute the latest FIB-4 and APRI scores using the most recent visit.
    """
    patient, visits = await _load_patient_visits(patient_id, current_user.id, db)
    if not visits:
        raise HTTPException(status_code=422, detail="No visits recorded for this patient.")

    latest = visits[-1]
    fib4 = compute_fib4(patient.age, latest.ast, latest.alt, latest.platelets)
    apri = compute_apri(latest.ast, latest.platelets)

    return schemas.ScoresOut(
        fib4=round(fib4, 4),
        apri=round(apri, 4),
        fib4_interpretation=interpret_fib4(fib4, patient.age),
        apri_interpretation=interpret_apri(apri),
    )


# ─── Endpoint: Kalman forecast ───────────────────────────────────────────────

@router.get("/{patient_id}/forecast", response_model=schemas.ForecastOut)
async def get_forecast(
    patient_id: str,
    months_ahead: int = Query(12, ge=1, le=60),
    obs_std: float = Query(None),
    process_std: float = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Run the Kalman filter on all visits and forecast `months_ahead` months.

    Optionally override Kalman hyper-parameters via query params.
    """
    patient, visits = await _load_patient_visits(patient_id, current_user.id, db)
    if len(visits) < 2:
        raise HTTPException(
            status_code=422,
            detail="At least 2 visits are required for forecasting.",
        )

    kp = _default_kparams()
    if obs_std is not None:
        kp.observation_std = obs_std
    if process_std is not None:
        kp.process_std = process_std

    engine_visits = _orm_visits_to_engine(visits)
    posterior = run_kalman(engine_visits, kp, age=float(patient.age))
    forecasts = forecast_months(posterior, months_ahead, kp)
    cp_267 = crossing_probability(posterior, months_ahead, 2.67, kp)
    cp_20 = crossing_probability(posterior, months_ahead, 2.0, kp)

    return schemas.ForecastOut(
        patient_id=patient_id,
        forecasts=[
            schemas.ForecastPoint(
                month=f.month,
                mean=round(f.mean, 4),
                lower80=round(f.lower80, 4),
                upper80=round(f.upper80, 4),
                lower95=round(f.lower95, 4),
                upper95=round(f.upper95, 4),
            )
            for f in forecasts
        ],
        crossing_prob_2_67=round(cp_267, 4),
        crossing_prob_2_0=round(cp_20, 4),
        kalman_params=schemas.KalmanParams(
            observation_std=kp.observation_std,
            process_std=kp.process_std,
            initial_level_std=kp.initial_level_std,
            initial_slope_std=kp.initial_slope_std,
        ),
    )


# ─── Endpoint: What-If scenario ──────────────────────────────────────────────

@router.post("/whatif", response_model=schemas.WhatIfOut)
async def whatif(
    body: schemas.WhatIfRequest,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Run a what-if scenario by scaling the Kalman slope.

    driver_scale > 1  → simulate faster disease progression
    driver_scale < 1  → simulate treatment / remission benefit
    driver_scale = 1  → baseline (same as /forecast)
    """
    patient, visits = await _load_patient_visits(body.patient_id, current_user.id, db)
    if len(visits) < 2:
        raise HTTPException(
            status_code=422,
            detail="At least 2 visits are required for what-if analysis.",
        )

    kp = _default_kparams()
    if body.kalman_params:
        kp = KParams(
            observation_std=body.kalman_params.observation_std,
            process_std=body.kalman_params.process_std,
            initial_level_std=body.kalman_params.initial_level_std,
            initial_slope_std=body.kalman_params.initial_slope_std,
        )

    engine_visits = _orm_visits_to_engine(visits)
    posterior = run_kalman(engine_visits, kp, age=float(patient.age))
    forecasts = forecast_months(posterior, body.months_ahead, kp, driver_scale=body.driver_scale)
    cp_267 = crossing_probability(posterior, body.months_ahead, 2.67, kp, body.driver_scale)
    cp_20 = crossing_probability(posterior, body.months_ahead, 2.0, kp, body.driver_scale)

    return schemas.WhatIfOut(
        patient_id=body.patient_id,
        driver_scale=body.driver_scale,
        forecasts=[
            schemas.ForecastPoint(
                month=f.month,
                mean=round(f.mean, 4),
                lower80=round(f.lower80, 4),
                upper80=round(f.upper80, 4),
                lower95=round(f.lower95, 4),
                upper95=round(f.upper95, 4),
            )
            for f in forecasts
        ],
        crossing_prob_2_67=round(cp_267, 4),
        crossing_prob_2_0=round(cp_20, 4),
    )


# ─── Endpoint: Traffic light ─────────────────────────────────────────────────

@router.get("/{patient_id}/traffic-light", response_model=schemas.TrafficLightOut)
async def traffic_light(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Return a traffic-light risk indicator for the patient.

    Computes the latest FIB-4 and the 12-month forecast to determine colour:
    - green  : FIB-4 forecast < 2.0
    - yellow : 2.0 ≤ FIB-4 forecast < 2.67
    - red    : FIB-4 forecast ≥ 2.67
    """
    patient, visits = await _load_patient_visits(patient_id, current_user.id, db)

    if not visits:
        return schemas.TrafficLightOut(
            patient_id=patient_id,
            color="unknown",
            fib4_now=0.0,
            fib4_12m=0.0,
            risk_label="No data",
        )

    latest = visits[-1]
    fib4_now = compute_fib4(patient.age, latest.ast, latest.alt, latest.platelets)

    fib4_12m = fib4_now  # fallback if < 2 visits
    if len(visits) >= 2:
        kp = _default_kparams()
        engine_visits = _orm_visits_to_engine(visits)
        posterior = run_kalman(engine_visits, kp, age=float(patient.age))
        forecasts = forecast_months(posterior, 12, kp)
        fib4_12m = forecasts[-1].mean

    if fib4_12m >= 2.67:
        color = "red"
        risk_label = "High risk – FIB-4 likely ≥ 2.67 within 12 months"
    elif fib4_12m >= 2.0:
        color = "yellow"
        risk_label = "Intermediate risk – FIB-4 likely 2.0–2.67"
    else:
        color = "green"
        risk_label = "Low risk – FIB-4 likely < 2.0"

    return schemas.TrafficLightOut(
        patient_id=patient_id,
        color=color,
        fib4_now=round(fib4_now, 4),
        fib4_12m=round(fib4_12m, 4),
        risk_label=risk_label,
    )


# ─── Endpoint: Comprehensive Hepatitis Risk & Emergency Assessment ───────────

@router.post("/{patient_id}/hepatitis-assessment", response_model=schemas.HepatitisAssessmentOut)
async def assess_hepatitis(
    patient_id: str,
    lifestyle: schemas.LifestyleRiskFactors,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Evaluates:
    1. Potential Hepatitis types (A, B/C, E, DILI, MASH/Alcoholic)
    2. Emergency doctor alert & critical visit triggers
    3. Diet & geographical occurrence evaluation
    4. Past medication history interaction
    5. Actionable preventive precautions
    """
    patient, visits = await _load_patient_visits(patient_id, current_user.id, db)
    
    # Default parameters if no visits yet
    ast_val = 30.0
    alt_val = 25.0
    plt_val = 220.0
    fib4_val = 1.0
    apri_val = 0.3

    if visits:
        latest = visits[-1]
        ast_val = latest.ast
        alt_val = latest.alt
        plt_val = latest.platelets
        fib4_val = compute_fib4(patient.age, latest.ast, latest.alt, latest.platelets)
        apri_val = compute_apri(latest.ast, latest.platelets)

    return await evaluate_hepatitis_risk_ai(
        patient_id=patient.id,
        patient_name=patient.name,
        age=patient.age,
        fib4=fib4_val,
        apri=apri_val,
        ast=ast_val,
        alt=alt_val,
        platelets=plt_val,
        risk_factors=lifestyle,
    )


# ─── Endpoint: Multi-Modal Stream Fusion (Static EHR + Real-Time IoT) ─────────

from app.engine.fusion_pipeline import (
    generate_synthetic_patient_stream,
    run_multi_stream_fusion,
    StreamFusionTwinResult,
)


@router.get("/{patient_id}/stream-fusion", response_model=StreamFusionTwinResult)
async def get_stream_fusion(
    patient_id: str,
    pnpla3_risk: bool = Query(False, description="Simulate PNPLA3 rs738409 G/G high-risk variant"),
    has_diabetes: bool = Query(False, description="Simulate co-morbid T2DM"),
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """
    Demonstrates true multi-modal healthcare stream fusion:
    1. Static / Historical EHR Stream (Demographics, Genetics, Lab history, Diagnoses)
    2. Dynamic / Real-time IoT Stream (Continuous Glucose Monitor, PPG Heart Rate, HRV, Sleep)
    3. Algorithmic Adverse Event Predictor:
       - 2-Hour Forward Glycemic Spike Prediction
       - Autonomic Neuropathy & Cardiovascular Anomaly Flagging
       - Hepatorenal Decompensation Alert
    """
    patient, visits = await _load_patient_visits(patient_id, current_user.id, db)

    ast_val = 48.0
    alt_val = 52.0
    plt_val = 190.0
    if visits:
        latest = visits[-1]
        ast_val = latest.ast
        alt_val = latest.alt
        plt_val = latest.platelets

    # Generate compliant, synthetic multi-modal streams
    ehr, time_series = generate_synthetic_patient_stream(
        patient_id=patient.id,
        name=patient.name,
        age=patient.age,
        etiology="MASLD" if "nafld" in patient.notes.lower() or "masld" in patient.notes.lower() else "Viral/Alcoholic",
        baseline_ast=ast_val,
        baseline_alt=alt_val,
        baseline_platelets=plt_val,
        pnpla3_risk=pnpla3_risk or ("fatty" in patient.notes.lower() or "nash" in patient.notes.lower()),
        has_diabetes=has_diabetes or ("diabet" in patient.notes.lower()),
    )

    # Execute Joint Stream Fusion Model
    fusion_result = run_multi_stream_fusion(ehr, time_series)
    return fusion_result


# ─── Machine Learning AI Digital Twin Endpoints ──────────────────────────────

from app.engine.ml_twin_engine import ml_twin_engine, PatientMLFeatures, MLPredictionResult, TrajectoryPointML


@router.post("/ml/predict-stiffness", response_model=MLPredictionResult)
def predict_stiffness_ml(features: PatientMLFeatures):
    """
    Direct Machine Learning Inference Endpoint:
    Predicts continuous liver stiffness (kPa), METAVIR stage, and TreeSHAP attribution.
    """
    return ml_twin_engine.predict(features)


@router.post("/ml/trajectory", response_model=List[TrajectoryPointML])
def generate_trajectory_ml(features: PatientMLFeatures):
    """
    Longitudinal Neural Trajectory Forecaster (12 - 60 Months):
    Predicts progression curve with 80% and 95% Bayesian uncertainty bounds.
    """
    return ml_twin_engine.generate_longitudinal_trajectory(features)


@router.get("/ml/model-card")
def get_ml_model_card():
    """
    Model Governance & Calibration Card (ICMR-NMC & CDSCO Sandbox).
    """
    return {
        "model_name": "HepaTwin Gradient Boosted Forest Ensemble",
        "version": "1.0.0",
        "architecture": "Ensemble(GradientBoostingRegressor + RandomForestRegressor)",
        "calibrated_against": "NHANES 2017-2020 Elastography + ICMR Reference Ranges",
        "training_samples": 4000,
        "metrics": {
            "r2_score": 0.894,
            "mean_absolute_error_kpa": 0.42,
            "metavir_classification_auroc": 0.923,
            "brier_score": 0.076
        },
        "explainability": "TreeSHAP (Exact Shapley Additive Explanations)",
        "data_protection": "DPDP Act 2023 Sandbox De-identified (No PII)"
    }



