// src/model/hepatitisTypes.ts
/**
 * Comprehensive Multi-Viral Hepatitis Profiling Engine (Types A, B, C, D, E, DILI, NASH/MASH)
 * 
 * Implements clinical rule and scoring logic for:
 * - Hepatitis A (HAV): Fecal-oral, contaminated water/shellfish, acute icteric pattern
 * - Hepatitis B (HBV): Bloodborne, perinatal, chronic fibrotic remodeling
 * - Hepatitis C (HCV): Parenteral, post-transfusion, rising transaminases
 * - Hepatitis D (HDV Delta Virus): Obligate satellite requiring HBV HBsAg surface antigen
 * - Hepatitis E (HEV): Zoonotic pork/game, contaminated water, acute cholestatic jaundice
 * - Drug-Induced Liver Injury (DILI): Supratherapeutic paracetamol, NSAIDs, hepatotoxic meds
 * - NASH / MASH Steatohepatitis: Metabolic adiposity, PNPLA3 genetics, insulin resistance
 */

import { WhatIfParameters } from '../../scripts/generate-synthetic';

export interface HepatitisTypeAssessment {
  type: string;
  code: 'HAV' | 'HBV' | 'HCV' | 'HDV' | 'HEV' | 'DILI' | 'NASH';
  riskLevel: 'Low' | 'Moderate' | 'High';
  probabilityPercentage: number;
  transmissionMode: string;
  triggerReasons: string[];
  clinicalAction: string;
}

export function evaluateAllHepatitisTypes(
  primaryEtiology: string,
  age: number,
  alt: number,
  ast: number,
  platelets: number,
  viralLoad: number,
  whatIf: WhatIfParameters,
  knownHbvPositive: boolean = false
): HepatitisTypeAssessment[] {
  const isHbvPrimary = primaryEtiology.includes('Hepatitis B') || knownHbvPositive;
  const isHcvPrimary = primaryEtiology.includes('Hepatitis C');
  const isNashPrimary = primaryEtiology.includes('Fatty') || primaryEtiology.includes('NASH');

  const assessments: HepatitisTypeAssessment[] = [];

  // 1. HEPATITIS A (HAV)
  let havScore = 12;
  const havReasons: string[] = [];
  if (whatIf.vaccinationStatus === 'unvaccinated') {
    havScore += 35;
    havReasons.push('Unvaccinated for Hepatitis A (susceptible in endemic regions)');
  }
  if (whatIf.dietQualityScore < 40) {
    havScore += 25;
    havReasons.push('High-risk street food or unsanitary dietary ingestion');
  }
  if (alt > 90) {
    havScore += 20;
    havReasons.push(`Acute transaminase flare (ALT ${alt} U/L)`);
  }
  assessments.push({
    type: 'Hepatitis A (Acute Viral Enteric)',
    code: 'HAV',
    riskLevel: havScore >= 60 ? 'High' : havScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(95, havScore),
    transmissionMode: 'Fecal-oral route (contaminated water, raw shellfish, unhygienic food)',
    triggerReasons: havReasons.length ? havReasons : ['Standard community baseline risk'],
    clinicalAction: 'Screen IgM anti-HAV antibody; administer 2-dose HAV vaccine series if seronegative.',
  });

  // 2. HEPATITIS B (HBV)
  let hbvScore = isHbvPrimary ? 92 : 15;
  const hbvReasons: string[] = [];
  if (isHbvPrimary) {
    hbvReasons.push('Confirmed HBsAg seropositive chronic carrier');
    if (whatIf.antiviralAdherencePercent < 80) {
      hbvReasons.push(`Suboptimal antiviral adherence (${whatIf.antiviralAdherencePercent}%) allows breakthrough viral replication`);
    } else {
      hbvReasons.push(`Sustained antiviral adherence (${whatIf.antiviralAdherencePercent}%) suppressing viral activity`);
    }
    if (viralLoad > 2000) {
      hbvReasons.push(`High circulating HBV DNA (${viralLoad.toLocaleString()} IU/mL)`);
    }
  } else {
    if (whatIf.vaccinationStatus === 'unvaccinated') {
      hbvScore += 25;
      hbvReasons.push('Unvaccinated for Hepatitis B');
    }
  }
  assessments.push({
    type: 'Hepatitis B (Chronic Parenteral)',
    code: 'HBV',
    riskLevel: hbvScore >= 60 ? 'High' : hbvScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(98, hbvScore),
    transmissionMode: 'Bloodborne, percutaneous needle exposure, perinatal transmission',
    triggerReasons: hbvReasons.length ? hbvReasons : ['No chronic HBsAg exposure reported'],
    clinicalAction: isHbvPrimary
      ? 'Ensure 100% daily Tenofovir/Entecavir adherence; monitor annual HCC AFP & ultrasound.'
      : 'Complete 3-dose recombinant HBV immunization series.',
  });

  // 3. HEPATITIS C (HCV)
  let hcvScore = isHcvPrimary ? 88 : 10;
  const hcvReasons: string[] = [];
  if (isHcvPrimary) {
    hcvReasons.push('Chronic HCV RNA replication with transaminase inflammation');
    if (alt > 65 || ast > 55) {
      hcvReasons.push(`Active hepatocellular necrosis (ALT ${alt} U/L, AST ${ast} U/L)`);
    }
    if (platelets < 150) {
      hcvReasons.push(`Thrombocytopenia (${platelets}k) indicating evolving portal hypertension`);
    }
  }
  assessments.push({
    type: 'Hepatitis C (Chronic Bloodborne)',
    code: 'HCV',
    riskLevel: hcvScore >= 60 ? 'High' : hcvScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(96, hcvScore),
    transmissionMode: 'Direct parenteral blood contact, unscreened transfusions, past invasive exposure',
    triggerReasons: hcvReasons.length ? hcvReasons : ['No direct parenteral blood risk factors documented'],
    clinicalAction: isHcvPrimary
      ? '12-week course of pan-genotypic Direct-Acting Antivirals (Sofosbuvir + Velpatasvir) for >95% SVR cure.'
      : 'Routine screening indicated only in high-risk blood transfusion history.',
  });

  // 4. HEPATITIS D (HDV - Delta Virus)
  let hdvScore = 5;
  const hdvReasons: string[] = [];
  if (isHbvPrimary) {
    hdvScore = 55;
    hdvReasons.push('CRITICAL PREREQUISITE PRESENT: Hepatitis B (HBV) carrier state');
    hdvReasons.push('HDV is a defective subviral agent requiring HBV HBsAg envelope coat for viral assembly');
    if (alt > 80 || platelets < 140) {
      hdvScore += 25;
      hdvReasons.push('Severe transaminase activity and thrombocytopenia typical of HDV superinfection');
    }
  } else {
    hdvReasons.push('IMMUNE TO DELTA: Hepatitis D CANNOT propagate without active Hepatitis B (HBsAg negative)');
  }
  assessments.push({
    type: 'Hepatitis D (Delta Virus Superinfection)',
    code: 'HDV',
    riskLevel: hdvScore >= 60 ? 'High' : hdvScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(92, hdvScore),
    transmissionMode: 'Obligate coinfection or superinfection with Hepatitis B',
    triggerReasons: hdvReasons,
    clinicalAction: isHbvPrimary
      ? 'Order anti-HDV total antibody and HDV RNA PCR test; evaluate for Bulevirtide therapy if positive.'
      : 'Protected against HDV by Hepatitis B negativity and vaccination.',
  });

  // 5. HEPATITIS E (HEV)
  let hevScore = 15;
  const hevReasons: string[] = [];
  if (whatIf.dietQualityScore < 50) {
    hevScore += 25;
    hevReasons.push('Dietary exposure to unpasteurized pork products or contaminated communal water');
  }
  if (alt > 80) {
    hevScore += 20;
    hevReasons.push('Acute hepatic transaminase elevation consistent with enteric viral hepatitis');
  }
  assessments.push({
    type: 'Hepatitis E (Acute Enteric & Zoonotic)',
    code: 'HEV',
    riskLevel: hevScore >= 50 ? 'High' : hevScore >= 25 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(88, hevScore),
    transmissionMode: 'Fecal-oral waterborne epidemics (HEV 1/2) and undercooked pork/game zoonosis (HEV 3/4)',
    triggerReasons: hevReasons.length ? hevReasons : ['Low zoonotic and unboiled water exposure profile'],
    clinicalAction: 'Screen IgM anti-HEV; avoid undercooked pork and ensure boiled/filtered drinking water.',
  });

  // 6. DRUG-INDUCED LIVER INJURY (DILI)
  let diliScore = 15;
  const diliReasons: string[] = [];
  if (whatIf.alcoholUnitsPerWeek > 14) {
    diliScore += 30;
    diliReasons.push(`High alcohol intake (${whatIf.alcoholUnitsPerWeek} units/wk) depletes glutathione reserve`);
  }
  if (alt > 100 || ast > 80) {
    diliScore += 30;
    diliReasons.push(`Marked transaminase elevation (ALT ${alt} U/L) indicative of toxic hepatocellular injury`);
  }
  assessments.push({
    type: 'Drug-Induced Liver Injury (DILI / Toxic)',
    code: 'DILI',
    riskLevel: diliScore >= 60 ? 'High' : diliScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(94, diliScore),
    transmissionMode: 'Supratherapeutic paracetamol, NSAIDs, unregulated herbal remedies, statin toxicity',
    triggerReasons: diliReasons.length ? diliReasons : ['No acute hepatotoxic pharmacotherapy interaction detected'],
    clinicalAction: 'Review full medication profile; discontinue non-essential supplements and avoid >2g/day paracetamol.',
  });

  // 7. NASH / MASH (Steatohepatitis)
  let nashScore = isNashPrimary ? 85 : 20;
  const nashReasons: string[] = [];
  if (whatIf.bmi >= 30) {
    nashScore += 30;
    nashReasons.push(`Metabolic obesity (BMI ${whatIf.bmi} kg/m²) compounding steatohepatitis`);
  } else if (whatIf.bmi >= 25) {
    nashScore += 15;
    nashReasons.push(`Overweight BMI (${whatIf.bmi} kg/m²)`);
  }
  if (whatIf.weeklyExerciseMinutes < 60) {
    nashScore += 20;
    nashReasons.push('Sedentary lifestyle worsening peripheral insulin resistance');
  }
  assessments.push({
    type: 'NASH / MASH (Metabolic Steatohepatitis)',
    code: 'NASH',
    riskLevel: nashScore >= 60 ? 'High' : nashScore >= 35 ? 'Moderate' : 'Low',
    probabilityPercentage: Math.min(98, nashScore),
    transmissionMode: 'Insulin resistance, PNPLA3 genetic risk allele, high-fat/fructose dietary overload',
    triggerReasons: nashReasons.length ? nashReasons : ['Healthy metabolic profile with low adiposity'],
    clinicalAction: 'Target 7-10% weight loss, Mediterranean dietary pattern, and 150 mins/week moderate exercise.',
  });

  return assessments;
}
