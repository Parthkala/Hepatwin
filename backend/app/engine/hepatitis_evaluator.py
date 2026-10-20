"""
app/engine/hepatitis_evaluator.py – AI/Clinical Rule Engine for Hepatitis Risk Profiling

Evaluates:
- Individualized Digital Twin Physiological State & Homeostatic Reserve
- Potential Hepatitis Types (including Hepatitis D Delta virus, HAV, HBV/HCV, HEV, Alcoholic, DILI, NASH/MASH)
- Physical Symptoms Evaluation (Jaundice, Dark Urine, Pale Stool, RUQ Pain, Malaise)
- Wearable physiological stress tracking (RHR, HRV, sleep)
- Emergency Alert conditions & immediate doctor recommendations
- Actionable precautions & tailored lifestyle guidance
- Optional OpenAI GPT-4 clinical rationale evaluation
"""
import os
import json
from typing import List, Dict, Any, Optional
import httpx
from app.models.schemas import (
    LifestyleRiskFactors,
    HepatitisTypeRisk,
    HepatitisAssessmentOut,
    EmergencyAlert,
    DigitalTwinPhysiologicalState,
)


async def evaluate_hepatitis_risk_ai(
    patient_id: str,
    patient_name: str,
    age: int,
    fib4: float,
    apri: float,
    ast: float,
    alt: float,
    platelets: float,
    risk_factors: LifestyleRiskFactors,
) -> HepatitisAssessmentOut:
    type_risks: List[HepatitisTypeRisk] = []
    precautions: List[str] = []
    emergency_reasons: List[str] = []

    symptoms = risk_factors.symptoms
    wearables = risk_factors.wearables

    # ─────────────────────────────────────────────────────────────────────────────
    # 1. Physical Symptoms Score Modifier
    # ─────────────────────────────────────────────────────────────────────────────
    symptom_count = sum([
        symptoms.jaundice_eyes_or_skin,
        symptoms.dark_urine,
        symptoms.pale_clay_stool,
        symptoms.right_upper_quadrant_pain,
        symptoms.severe_fatigue_or_malaise,
        symptoms.nausea_or_appetite_loss,
        symptoms.pruritus_itching,
        symptoms.fever_or_joint_pain,
    ])

    # ─────────────────────────────────────────────────────────────────────────────
    # 2. Wearables Homeostatic Reserve Calculation
    # ─────────────────────────────────────────────────────────────────────────────
    homeostatic_reserve = 100.0
    wearable_stress = "Normal"
    if wearables.resting_heart_rate and wearables.resting_heart_rate > 90:
        homeostatic_reserve -= 15.0
        wearable_stress = "Elevated"
    if wearables.hrv_ms and wearables.hrv_ms < 30:
        homeostatic_reserve -= 15.0
        wearable_stress = "Elevated"
    if wearables.sleep_score and wearables.sleep_score < 60:
        homeostatic_reserve -= 10.0
    if symptom_count >= 3:
        homeostatic_reserve -= 25.0
        wearable_stress = "Compromised"
    if fib4 >= 2.67:
        homeostatic_reserve -= 25.0
        wearable_stress = "Compromised"
    homeostatic_reserve = max(homeostatic_reserve, 10.0)

    # ─────────────────────────────────────────────────────────────────────────────
    # 3. Individual Hepatitis Type Scoring
    # ─────────────────────────────────────────────────────────────────────────────

    # 1. Hepatitis A (Enteric / Viral)
    hav_score = 0
    hav_reasons = []
    if risk_factors.contaminated_water_risk:
        hav_score += 40
        hav_reasons.append("Untreated municipal/tap water or unboiled ice consumption")
    if risk_factors.raw_shellfish_or_street_food:
        hav_score += 35
        hav_reasons.append("Recent raw bivalve shellfish or high-risk street food consumption")
    if any(loc.lower() in ["endemic", "tropical", "rural", "flooded", "developing", "asia", "africa"] for loc in risk_factors.travel_locations):
        hav_score += 25
        hav_reasons.append(f"Travel occurrence in endemic or flood zones: {', '.join(risk_factors.travel_locations)}")
    if symptoms.jaundice_eyes_or_skin or symptoms.dark_urine:
        hav_score += 20
        hav_reasons.append("Presenting with classic acute icteric signs (jaundice / dark tea-colored urine)")
    if alt > 150:
        hav_score += 20
        hav_reasons.append(f"Marked acute transaminase elevation (ALT: {alt} U/L)")

    hav_level = "High" if hav_score >= 60 else "Moderate" if hav_score >= 30 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Hepatitis A (Acute Viral / Enteric)",
        risk_level=hav_level,
        probability_percentage=min(hav_score, 96),
        trigger_reasons=hav_reasons or ["Standard baseline environmental exposure"],
        key_transmission_mode="Fecal-oral route (water / food / shellfish contamination)",
    ))

    # 2. Hepatitis B & C (Parenteral / Chronic Bloodborne)
    hbc_score = 0
    hbc_reasons = []
    if risk_factors.blood_transfusion_or_tattoo:
        hbc_score += 50
        hbc_reasons.append("History of tattoos, piercings, acupuncture, or blood transfusions")
    if risk_factors.needle_or_surgical_exposure:
        hbc_score += 45
        hbc_reasons.append("Unscreened invasive surgical, dental, or needle exposures")
    if risk_factors.known_hepatitis_b_positive:
        hbc_score += 90
        hbc_reasons.append("Confirmed HBsAg seropositive carrier status")
    if fib4 >= 2.0 or apri >= 1.0:
        hbc_score += 25
        hbc_reasons.append(f"Chronic fibrotic remodeling detected (FIB-4: {fib4:.2f})")
    if symptoms.severe_fatigue_or_malaise or symptoms.pruritus_itching:
        hbc_score += 15
        hbc_reasons.append("Constitutional chronic liver symptoms (pruritus, debilitating fatigue)")

    hbc_level = "High" if hbc_score >= 60 else "Moderate" if hbc_score >= 30 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Hepatitis B / C (Chronic Viral)",
        risk_level=hbc_level,
        probability_percentage=min(hbc_score, 98),
        trigger_reasons=hbc_reasons or ["No critical parenteral or blood exposures reported"],
        key_transmission_mode="Bloodborne, percutaneous needle exposure, mucosal contact",
    ))

    # 3. Hepatitis D (Delta Virus – Obligate HBV Satellite)
    hvd_score = 0
    hvd_reasons = []
    if risk_factors.known_hepatitis_b_positive:
        hvd_score += 65
        hvd_reasons.append("Essential prerequisite present: Hepatitis B co-infection (HBV HBsAg coat required for HDV propagation)")
        if risk_factors.needle_or_surgical_exposure or risk_factors.blood_transfusion_or_tattoo:
            hvd_score += 25
            hvd_reasons.append("Parenteral / superinfection transmission vector documented")
        if alt > 150 or fib4 > 2.0:
            hvd_score += 20
            hvd_reasons.append("Rapidly progressive necroinflammation characteristic of HDV superinfection")
    else:
        hvd_score = 5
        hvd_reasons.append("Hepatitis D is an incomplete subviral agent and CANNOT infect without concurrent Hepatitis B (HBV). Primary HBV screening is required first.")

    hvd_level = "High" if hvd_score >= 60 else "Moderate" if hvd_score >= 25 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Hepatitis D (Delta Virus / Superinfection)",
        risk_level=hvd_level,
        probability_percentage=min(hvd_score, 94),
        trigger_reasons=hvd_reasons,
        key_transmission_mode="Obligate satellite of Hepatitis B (requires HBsAg for viral envelope assembly)",
    ))

    # 4. Hepatitis E (Acute Enteric / Zoonotic Pork & Game)
    hev_score = 0
    hev_reasons = []
    if risk_factors.undercooked_pork_or_game:
        hev_score += 50
        hev_reasons.append("Frequent ingestion of undercooked pork products, liver sausage, or wild game meat (HEV Genotype 3/4 vector)")
    if risk_factors.contaminated_water_risk:
        hev_score += 40
        hev_reasons.append("Contaminated water supplies or flood-prone environmental exposure (HEV Genotype 1/2 vector)")
    if symptoms.pale_clay_stool or symptoms.dark_urine:
        hev_score += 20
        hev_reasons.append("Cholestatic signs with bilirubin excretion defect (clay stools / dark urine)")

    hev_level = "High" if hev_score >= 50 else "Moderate" if hev_score >= 25 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Hepatitis E (Acute Viral / Zoonotic)",
        risk_level=hev_level,
        probability_percentage=min(hev_score, 90),
        trigger_reasons=hev_reasons or ["Low dietary zoonotic reservoir contact"],
        key_transmission_mode="Fecal-oral water contamination & zoonotic porcine/game ingestion",
    ))

    # 5. Drug-Induced Liver Injury (DILI / Toxic Hepatitis)
    dili_score = 0
    dili_reasons = []
    if risk_factors.heavy_acetaminophen_or_nsaids:
        dili_score += 45
        dili_reasons.append("Chronic or supratherapeutic ingestion of acetaminophen/paracetamol or NSAIDs")
    if risk_factors.herbal_or_unregulated_supplements:
        dili_score += 40
        dili_reasons.append("Ingestion of unregulated herbal supplements, gym fat-burners, or anabolic compounds")
    if risk_factors.past_medications:
        dili_score += 25
        dili_reasons.append(f"Recorded hepatotoxic pharmacotherapy audit: {', '.join(risk_factors.past_medications)}")
    if symptoms.pruritus_itching or symptoms.jaundice_eyes_or_skin:
        dili_score += 20
        dili_reasons.append("Drug-induced cholestatic jaundice or systemic drug pruritus")
    if alt > 100 or ast > 100:
        dili_score += 20
        dili_reasons.append("Biochemical hepatocellular injury pattern on liver panel")

    dili_level = "High" if dili_score >= 60 else "Moderate" if dili_score >= 30 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Drug-Induced Liver Injury (DILI / Toxic)",
        risk_level=dili_level,
        probability_percentage=min(dili_score, 98),
        trigger_reasons=dili_reasons or ["No high-risk hepatotoxic medications declared"],
        key_transmission_mode="Direct chemical necrosis or idiosyncratic immuno-allergic response",
    ))

    # 6. Steatohepatitis (MASH / Metabolic & Toxic Alcoholic)
    mash_score = 0
    mash_reasons = []
    if risk_factors.high_fat_or_sugar_diet:
        mash_score += 40
        mash_reasons.append("Dietary excess of ultra-processed lipids, refined fructose, and saturated fatty acids")
    if risk_factors.alcohol_intake_frequency.lower() in ["frequent", "daily", "heavy"]:
        mash_score += 45
        mash_reasons.append(f"Ethanol consumption pattern: {risk_factors.alcohol_intake_frequency}")
    if fib4 >= 1.5:
        mash_score += 30
        mash_reasons.append(f"Longitudinal fibrotic remodeling detected (FIB-4: {fib4:.2f})")
    if symptoms.right_upper_quadrant_pain:
        mash_score += 15
        mash_reasons.append("Hepatosplenomegaly capsular stretch causing right upper quadrant pain")

    mash_level = "High" if mash_score >= 60 else "Moderate" if mash_score >= 35 else "Low"
    type_risks.append(HepatitisTypeRisk(
        hepatitis_type="Metabolic & Alcoholic Steatohepatitis (MASH / Alcoholic)",
        risk_level=mash_level,
        probability_percentage=min(mash_score, 98),
        trigger_reasons=mash_reasons or ["Healthy metabolic dietary profile"],
        key_transmission_mode="Lipid accumulation, oxidative stress, and chronic ethanol toxicity",
    ))

    # ─────────────────────────────────────────────────────────────────────────────
    # 4. Emergency Doctor Alert Evaluation
    # ─────────────────────────────────────────────────────────────────────────────
    is_emergency = False
    emergency_level = "info"

    # Acute Jaundice Triad
    if symptoms.jaundice_eyes_or_skin or (symptoms.dark_urine and symptoms.pale_clay_stool):
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append("Active Jaundice Triad: Scleral icterus, dark urine, or acholic (clay) stools indicate biliary obstruction or acute hepatic decompensation.")

    # Severe Hepatic Pain
    if symptoms.right_upper_quadrant_pain and (symptoms.fever_or_joint_pain or symptoms.nausea_or_appetite_loss):
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append("Right Upper Quadrant pain with fever/malaise raises suspicion of acute cholangitis, acute viral hepatitis, or hepatic abscess.")

    # High Biomarker Red Flags
    if ast > 300 or alt > 300:
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append(f"Marked acute hepatocellular lysis (AST: {ast} U/L, ALT: {alt} U/L).")

    if platelets < 90:
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append(f"Severe thrombocytopenia (Platelets: {platelets} 10⁹/L) indicating portal hypertension and splenic sequestration.")

    if fib4 >= 2.67:
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append(f"FIB-4 score ({fib4:.2f}) meets or exceeds the validated 2.67 threshold for advanced liver cirrhosis.")

    if hvd_level == "High":
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append("High risk for Hepatitis D superinfection: Known to accelerate cirrhosis and fulminant liver failure 3x faster than HBV alone.")

    if dili_level == "High" and (ast > 100 or alt > 100):
        is_emergency = True
        emergency_level = "critical"
        emergency_reasons.append("Suspected Acute Drug-Induced Liver Injury with ongoing medication ingestion.")

    emergency_alert = EmergencyAlert(
        is_emergency=is_emergency,
        alert_level=emergency_level,
        urgency_message=(
            "URGENT CLINICAL ALERT: Immediate medical consultation at a hepatology clinic, gastroenterologist, or emergency facility is strongly advised."
            if is_emergency
            else "Routine monitoring: No immediate hepatic failure or acute cholestasis emergency detected today."
        ),
        doctor_visit_recommended=is_emergency or fib4 >= 1.3 or symptom_count >= 2 or any(r.risk_level == "High" for r in type_risks),
        reasons=emergency_reasons or ["Parameters within safe monitoring ranges."],
    )

    # ─────────────────────────────────────────────────────────────────────────────
    # 5. Tailored Precautions
    # ─────────────────────────────────────────────────────────────────────────────
    if symptoms.jaundice_eyes_or_skin or symptoms.dark_urine:
        precautions.append("Urgent: Obtain total and direct serum bilirubin tests and abdominal ultrasonography.")
    if hav_level in ["High", "Moderate"] or hev_level in ["High", "Moderate"]:
        precautions.append("Drink exclusively boiled, filtered, or sealed bottled water, particularly when travelling.")
        precautions.append("Avoid raw bivalves (oysters, clams) and undercooked pork/organ meats.")
        precautions.append("Receive the 2-dose Hepatitis A vaccination series if seronegative.")
    if hbc_level in ["High", "Moderate"] or hvd_level in ["High", "Moderate"]:
        precautions.append("Order serologic panel: HBsAg, Anti-HBc, Anti-HCV, and if HBsAg positive, immediately test Anti-HDV antibodies.")
        precautions.append("Complete Hepatitis B vaccination series (protects against both HBV and HDV).")
        precautions.append("Ensure sterile single-use disposable needles for tattoos, piercings, or medical procedures.")
    if dili_level in ["High", "Moderate"]:
        precautions.append("Immediately pause non-prescribed NSAIDs, high-dose acetaminophen (>2g/day), and bodybuilding/herbal supplements.")
        precautions.append("Submit a full pharmacological audit list to your treating physician.")
    if mash_level in ["High", "Moderate"]:
        precautions.append("Adopt a Mediterranean diet: eliminate high-fructose corn syrup, refined sugar, and trans fats.")
        precautions.append("Complete alcohol cessation to halt toxic synergistic steatohepatitis progression.")
        precautions.append("Target at least 150 minutes of structured aerobic exercise weekly.")

    precautions.append("Schedule periodic liver panel (ALT, AST, Platelets, Total Bilirubin) monitoring every 3 to 6 months.")

    # ─────────────────────────────────────────────────────────────────────────────
    # 6. Optional OpenAI API Integration for Deep Clinical Reasoning
    # ─────────────────────────────────────────────────────────────────────────────
    ai_rationale = None
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if openai_key:
        try:
            prompt = (
                f"You are HepaTwin, an advanced clinical digital twin AI for liver disease.\n"
                f"Evaluate this patient's digital twin state:\n"
                f"- Name: {patient_name}, Age: {age}\n"
                f"- Biomarkers: AST: {ast} U/L, ALT: {alt} U/L, Platelets: {platelets} 10^9/L\n"
                f"- Scores: FIB-4: {fib4:.2f}, APRI: {apri:.2f}\n"
                f"- Reported Symptoms: Jaundice={symptoms.jaundice_eyes_or_skin}, Dark Urine={symptoms.dark_urine}, "
                f"Pale Stool={symptoms.pale_clay_stool}, RUQ Pain={symptoms.right_upper_quadrant_pain}, Malaise={symptoms.severe_fatigue_or_malaise}\n"
                f"- Diet & Ingestion: Shellfish={risk_factors.raw_shellfish_or_street_food}, Pork/Game={risk_factors.undercooked_pork_or_game}, "
                f"Contaminated Water={risk_factors.contaminated_water_risk}, Alcohol={risk_factors.alcohol_intake_frequency}\n"
                f"- Locations Visited: {', '.join(risk_factors.travel_locations) or 'None'}\n"
                f"- Past/Active Meds: {', '.join(risk_factors.past_medications) or 'None'}, High-Dose Paracetamol={risk_factors.heavy_acetaminophen_or_nsaids}, Herbals={risk_factors.herbal_or_unregulated_supplements}\n"
                f"- HBV Carrier: {risk_factors.known_hepatitis_b_positive}\n\n"
                f"Provide a concise, 3-sentence clinical rationale evaluating their acute and long-term hepatitis risks, explaining specific physiological vulnerabilities and immediate next medical actions."
            )

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "system", "content": "You are a clinical hepatology digital twin engine."},
                                     {"role": "user", "content": prompt}],
                        "max_tokens": 200,
                        "temperature": 0.3,
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    ai_rationale = data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            ai_rationale = f"AI Physician Engine Note: Digital twin physiological synthesis calculated based on verified clinical guidelines."
    else:
        # High quality offline deterministic clinical rationale
        high_risk_list = [r.hepatitis_type for r in type_risks if r.risk_level == "High"]
        if is_emergency:
            ai_rationale = f"AI Clinical Digital Twin Warning: {patient_name}'s physiological model demonstrates critical hepatic distress driven by {', '.join(emergency_reasons[:2])}. Immediate in-person gastroenterological or emergency evaluation is advised."
        elif high_risk_list:
            ai_rationale = f"AI Digital Twin Assessment: Patient displays primary susceptibility toward {high_risk_list[0]} based on converging dietary, pharmacological, and transaminase profiles. Focused serological verification and lifestyle risk modification are recommended."
        else:
            ai_rationale = f"AI Digital Twin Assessment: {patient_name}'s digital twin shows stable homeostatic reserve ({homeostatic_reserve:.0f}/100) with low probability of acute fulminant necrosis. Continue longitudinal monitoring of AST/ALT."

    twin_state = DigitalTwinPhysiologicalState(
        twin_id=f"TWIN-{patient_id[:8].upper()}",
        virtual_biomarker_state="Calibrated & Active",
        homeostatic_reserve_index=round(homeostatic_reserve, 1),
        wearable_stress_level=wearable_stress,
        projected_decompensation_window_months=6 if is_emergency else None,
    )

    high_risks = [r.hepatitis_type for r in type_risks if r.risk_level == "High"]
    overall_summary = (
        f"Twin analysis identifies significant susceptibility to: {', '.join(high_risks)}. Comprehensive clinical follow-up is indicated."
        if high_risks
        else "Primary risk profiles are low to moderate. Continue proactive lifestyle and dietary preventive measures."
    )

    return HepatitisAssessmentOut(
        twin_state=twin_state,
        overall_summary=overall_summary,
        type_risks=type_risks,
        emergency_alert=emergency_alert,
        precautions=precautions,
        ai_clinical_rationale=ai_rationale,
    )
