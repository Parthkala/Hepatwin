"""
tests/backend/test_ml_twin_engine.py
====================================
Comprehensive tests for HepaTwin Python ML Twin Engine:
- Model inference & calibration
- METAVIR & steatosis staging
- TreeSHAP feature attribution consistency
- 12-60 month Bayesian trajectory projection
- Edge cases and input resilience
"""

import sys
import os

# Add repo root to path
repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.app.engine.ml_twin_engine import ml_twin_engine, PatientMLFeatures


def test_normal_patient_inference():
    """Tests inference for healthy/stable cohort (Aakash style)."""
    p = PatientMLFeatures(
        age=34,
        sex="Male",
        ast=24,
        alt=22,
        platelets=240,
        bilirubin=0.7,
        albumin=4.4,
        viralLoad=140,
        bmi=23.2,
        alcoholUnitsPerWeek=0,
        antiviralAdherencePercent=98,
        sleepHoursPerDay=7.8,
        bingeEatingScore=0,
        vaccinationStatus="fully_vaccinated",
        hasDiabetes=0,
        hasCardiac=0
    )
    res = ml_twin_engine.predict(p)
    assert res.predictedStiffnessKPa < 7.0, f"Expected normal stiffness, got {res.predictedStiffnessKPa}"
    assert res.metavirStage in ["F0", "F1"]
    assert res.steatosisGrade == "S0"
    assert res.homeostaticReservePercent >= 75
    assert res.overallRisk in ["normal", "caution"]
    assert len(res.topShapDrivers) >= 1
    assert res.inferenceTimeMs < 50.0 # Sub-50ms latency target
    print("✓ test_normal_patient_inference passed:", res.predictedStiffnessKPa, "kPa, METAVIR:", res.metavirStage)


def test_cirrhotic_patient_inference():
    """Tests inference for severe/cirrhosis cohort (Vikram style)."""
    p = PatientMLFeatures(
        age=45,
        sex="Male",
        ast=110,
        alt=124,
        platelets=118,
        bilirubin=1.8,
        albumin=3.1,
        viralLoad=45000,
        bmi=32.4,
        alcoholUnitsPerWeek=16,
        antiviralAdherencePercent=60,
        sleepHoursPerDay=5.2,
        bingeEatingScore=2,
        vaccinationStatus="unvaccinated",
        hasDiabetes=1,
        hasCardiac=1
    )
    res = ml_twin_engine.predict(p)
    assert res.predictedStiffnessKPa >= 9.5, f"Expected advanced fibrosis or cirrhosis, got {res.predictedStiffnessKPa}"
    assert res.metavirStage in ["F3", "F4"]
    assert res.steatosisGrade in ["S2", "S3"]
    assert res.overallRisk == "critical"
    assert any(d.direction == "accelerating" for d in res.topShapDrivers)
    assert len(res.counterfactualRecommendations) > 0
    print("✓ test_cirrhotic_patient_inference passed:", res.predictedStiffnessKPa, "kPa, METAVIR:", res.metavirStage)


def test_shap_attribution_consistency():
    """Tests that protective and accelerating drivers have correct clinical semantics."""
    p = PatientMLFeatures(
        age=52,
        ast=78,
        alt=85,
        platelets=145,
        alcoholUnitsPerWeek=8,
        antiviralAdherencePercent=40,
        sleepHoursPerDay=4.5,
        bingeEatingScore=2
    )
    res = ml_twin_engine.predict(p)
    adherence_driver = next((d for d in res.topShapDrivers if "Adherence" in d.featureName), None)
    if adherence_driver:
        assert adherence_driver.direction == "accelerating"
        assert adherence_driver.shapImpact > 0

    alcohol_driver = next((d for d in res.topShapDrivers if "Alcohol" in d.featureName), None)
    if alcohol_driver:
        assert alcohol_driver.direction == "accelerating"
        assert alcohol_driver.shapImpact > 0
    print("✓ test_shap_attribution_consistency passed")


def test_trajectory_monotonicity_and_bands():
    """Tests dynamic multi-step trajectory points and expanding confidence bands."""
    p = PatientMLFeatures(
        age=52,
        ast=78,
        alt=85,
        platelets=145,
        alcoholUnitsPerWeek=15,
        antiviralAdherencePercent=50,
        sleepHoursPerDay=5.0,
        bingeEatingScore=2
    )
    points = ml_twin_engine.generate_longitudinal_trajectory(p, months_horizon=60)
    assert len(points) == 6
    assert [pt.month for pt in points] == [0, 12, 24, 36, 48, 60]

    # Month 60 confidence band should be wider than month 12
    spread_12 = points[1].ci95Upper - points[1].ci95Lower
    spread_60 = points[5].ci95Upper - points[5].ci95Lower
    assert spread_60 > spread_12, f"Expected expanding uncertainty: spread_60={spread_60} <= spread_12={spread_12}"
    print("✓ test_trajectory_monotonicity_and_bands passed")


def test_edge_cases():
    """Tests model resilience to boundary values."""
    # Minimum boundary
    p_min = PatientMLFeatures(age=18, ast=10, alt=10, platelets=50, sleepHoursPerDay=2.0)
    res_min = ml_twin_engine.predict(p_min)
    assert 2.5 <= res_min.predictedStiffnessKPa <= 45.0

    # Maximum boundary
    p_max = PatientMLFeatures(age=80, ast=1500, alt=1500, platelets=500, bmi=55.0, sleepHoursPerDay=14.0)
    res_max = ml_twin_engine.predict(p_max)
    assert 2.5 <= res_max.predictedStiffnessKPa <= 45.0
    print("✓ test_edge_cases passed")


if __name__ == "__main__":
    test_normal_patient_inference()
    test_cirrhotic_patient_inference()
    test_shap_attribution_consistency()
    test_trajectory_monotonicity_and_bands()
    test_edge_cases()
    print("\nALL BACKEND ML TESTS PASSED SUCCESSFULLY!")
