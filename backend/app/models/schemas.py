"""
app/models/schemas.py – Pydantic v2 request/response schemas
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    username: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# ─── Patient ─────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    age: int = Field(..., ge=0, le=130)
    notes: str = ""


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    age: Optional[int] = Field(None, ge=0, le=130)
    notes: Optional[str] = None


class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    age: int
    notes: str
    created_at: datetime


# ─── Visit ───────────────────────────────────────────────────────────────────

class VisitCreate(BaseModel):
    month: int = Field(..., ge=0, description="Months since first visit (0-indexed)")
    ast: float = Field(..., gt=0, le=10_000, description="AST in U/L")
    alt: float = Field(..., gt=0, le=10_000, description="ALT in U/L")
    platelets: float = Field(..., gt=0, le=2_000, description="Platelets in 10⁹/L")


class VisitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    patient_id: str
    month: int
    ast: float
    alt: float
    platelets: float
    created_at: datetime


# ─── Clinical scores ─────────────────────────────────────────────────────────

class ScoresOut(BaseModel):
    fib4: float
    apri: float
    fib4_interpretation: str   # "low" | "indeterminate" | "high"
    apri_interpretation: str


# ─── Kalman / Forecast ───────────────────────────────────────────────────────

class KalmanParams(BaseModel):
    observation_std: float = Field(0.2, gt=0)
    process_std: float = Field(0.1, gt=0)
    initial_level_std: float = Field(1.0, gt=0)
    initial_slope_std: float = Field(0.5, gt=0)


class ForecastPoint(BaseModel):
    month: int
    mean: float
    lower80: float
    upper80: float
    lower95: float
    upper95: float


class ForecastOut(BaseModel):
    patient_id: str
    forecasts: List[ForecastPoint]
    crossing_prob_2_67: float = Field(
        ..., description="Probability FIB-4 > 2.67 within forecast horizon"
    )
    crossing_prob_2_0: float = Field(
        ..., description="Probability FIB-4 > 2.0 within forecast horizon"
    )
    kalman_params: KalmanParams


# ─── What-If ─────────────────────────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    patient_id: str
    driver_scale: float = Field(
        1.0, ge=0.0, le=5.0,
        description="Multiplier applied to the Kalman slope (>1 = faster progression)",
    )
    months_ahead: int = Field(12, ge=1, le=60)
    kalman_params: Optional[KalmanParams] = None


class WhatIfOut(BaseModel):
    patient_id: str
    driver_scale: float
    forecasts: List[ForecastPoint]
    crossing_prob_2_67: float
    crossing_prob_2_0: float


# ─── Traffic light ───────────────────────────────────────────────────────────

class TrafficLightOut(BaseModel):
    patient_id: str
    color: str          # "green" | "yellow" | "red" | "unknown"
    fib4_now: float
    fib4_12m: float
    risk_label: str


class PhysicalSymptoms(BaseModel):
    # Core hepatic signs
    jaundice_eyes_or_skin: bool = Field(False, description="Yellowing of the eyes (scleral icterus) or skin")
    dark_urine: bool = Field(False, description="Dark, tea-colored, or brownish urine")
    pale_clay_stool: bool = Field(False, description="Light, pale, or clay-colored bowel movements")
    right_upper_quadrant_pain: bool = Field(False, description="Ache, tenderness, or fullness under the right rib cage")
    severe_fatigue_or_malaise: bool = Field(False, description="Extreme unexplained exhaustion or general illness")
    nausea_or_appetite_loss: bool = Field(False, description="Loss of appetite, food aversion, or nausea")
    pruritus_itching: bool = Field(False, description="Generalized persistent skin itching without rash")
    fever_or_joint_pain: bool = Field(False, description="Low-grade fever or arthralgia")


class WearableVitals(BaseModel):
    resting_heart_rate: Optional[int] = Field(None, description="Current resting BPM from wearable smartwatch")
    hrv_ms: Optional[int] = Field(None, description="Heart Rate Variability in ms (autonomic stress indicator)")
    sleep_score: Optional[int] = Field(None, description="Sleep recovery score 0-100")
    daily_steps: Optional[int] = Field(None, description="Physical activity steps today")
    body_temp_c: Optional[float] = Field(None, description="Wearable skin/body temperature in °C")


class LifestyleRiskFactors(BaseModel):
    # Physical Symptoms
    symptoms: PhysicalSymptoms = Field(default_factory=PhysicalSymptoms)

    # Wearable Physiological Feed
    wearables: WearableVitals = Field(default_factory=WearableVitals)

    # Hepatitis D Specific Co-infection Factor
    known_hepatitis_b_positive: bool = Field(False, description="Prior or concurrent Hepatitis B surface antigen (HBsAg) positive status")

    # Diet & Ingestion
    high_fat_or_sugar_diet: bool = Field(False, description="Frequent fast food, refined carbohydrates or saturated fat")
    raw_shellfish_or_street_food: bool = Field(False, description="Raw seafood, oysters, or unsanitary street food")
    undercooked_pork_or_game: bool = Field(False, description="Undercooked pork, wild boar, or liver (HEV vector)")
    contaminated_water_risk: bool = Field(False, description="Exposure to untreated water or unboiled ice (HAV/HEV vector)")
    alcohol_intake_frequency: str = Field("None", description="None | Occasional | Moderate | Frequent | Heavy")

    # Geographical Occurrence / Travel
    travel_locations: List[str] = Field(default_factory=list, description="Recent visited cities/regions (e.g. endemic tropical, flood-prone areas)")
    
    # Medication & Parenteral History
    past_medications: List[str] = Field(default_factory=list, description="Past/ongoing drugs e.g. Statins, Methotrexate, Anti-TB, Amiodarone")
    heavy_acetaminophen_or_nsaids: bool = Field(False, description="Chronic/high-dose paracetamol, ibuprofen, diclofenac")
    herbal_or_unregulated_supplements: bool = Field(False, description="Bodybuilding, weight-loss, or unverified herbal remedies")
    blood_transfusion_or_tattoo: bool = Field(False, description="Tattoos, piercings, acupuncture, or pre-screening transfusions")
    needle_or_surgical_exposure: bool = Field(False, description="Invasive dental/surgical procedures or needle exposures")


class HepatitisTypeRisk(BaseModel):
    hepatitis_type: str
    risk_level: str       # "Low" | "Moderate" | "High"
    probability_percentage: int
    trigger_reasons: List[str]
    key_transmission_mode: str


class EmergencyAlert(BaseModel):
    is_emergency: bool
    alert_level: str       # "info" | "warning" | "critical"
    urgency_message: str
    doctor_visit_recommended: bool
    reasons: List[str]


class DigitalTwinPhysiologicalState(BaseModel):
    twin_id: str
    virtual_biomarker_state: str   # "Calibrated & Active"
    homeostatic_reserve_index: float  # 0 to 100
    wearable_stress_level: str        # "Normal" | "Elevated" | "Compromised"
    projected_decompensation_window_months: Optional[int]


class HepatitisAssessmentOut(BaseModel):
    twin_state: DigitalTwinPhysiologicalState
    overall_summary: str
    type_risks: List[HepatitisTypeRisk]
    emergency_alert: EmergencyAlert
    precautions: List[str]
    ai_clinical_rationale: Optional[str] = None


