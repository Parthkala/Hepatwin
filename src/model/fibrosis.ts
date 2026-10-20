// src/model/fibrosis.ts
/**
 * Clinical Fibrosis Indices and Risk Calculations
 *
 * Implements standard non-invasive hepatology scoring models:
 * 1. FIB-4 = (Age x AST) / (Platelets [10^9/L] x sqrt(ALT))
 * 2. APRI  = ((AST / AST_ULN) / Platelets [10^9/L]) x 100
 *
 * Based on Sterling et al. (Hepatology 2006) and Wai et al. (Hepatology 2003).
 * AST Upper Limit of Normal (ULN) default is 40 U/L per standard clinical convention.
 *
 * Proof of concept for decision support. Not a medical device.
 */

export interface FibrosisMetrics {
  fib4: number;
  fib4Category: 'low' | 'indeterminate' | 'high';
  apri: number;
  apriCategory: 'low' | 'indeterminate' | 'high';
  metavirStage: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
  steatosisGrade: 'S0' | 'S1' | 'S2' | 'S3';
  homeostaticReserveIndex: number; // 0 - 100%
  overallRiskLevel: 'normal' | 'caution' | 'critical';
  riskReason: string;
  recommendedAction: string;
}

export function computeFIB4(age: number, ast: number, alt: number, platelets: number): number {
  if (platelets <= 0 || alt <= 0) return 0;
  const fib4 = (age * ast) / (platelets * Math.sqrt(alt));
  return Number(fib4.toFixed(2));
}

export function computeAPRI(ast: number, platelets: number, astULN: number = 40): number {
  if (platelets <= 0 || astULN <= 0) return 0;
  const apri = ((ast / astULN) / platelets) * 100;
  return Number(apri.toFixed(2));
}

export function evaluateClinicalRisk(
  age: number,
  ast: number,
  alt: number,
  platelets: number,
  bilirubin: number,
  albumin: number,
  viralLoad: number
): FibrosisMetrics {
  const fib4 = computeFIB4(age, ast, alt, platelets);
  const apri = computeAPRI(ast, platelets, 40);

  // FIB-4 Cutoffs: < 1.30 or < 1.45 (low/rule-out), 1.45-3.25 (indeterminate), > 3.25 (high/F3-F4 rule-in)
  // Age > 65 cutoff adjusts to 2.0
  const fib4LowCutoff = age >= 65 ? 2.0 : 1.30;
  const fib4Category: 'low' | 'indeterminate' | 'high' =
    fib4 < fib4LowCutoff ? 'low' : fib4 <= 3.25 ? 'indeterminate' : 'high';

  // APRI Cutoffs: < 0.5 (low), 0.5 - 1.5 (indeterminate), > 1.5 (high risk of significant fibrosis F2-F4)
  const apriCategory: 'low' | 'indeterminate' | 'high' =
    apri < 0.5 ? 'low' : apri <= 1.5 ? 'indeterminate' : 'high';

  // Estimate METAVIR Stage based on concordant non-invasive scores
  let metavirStage: 'F0' | 'F1' | 'F2' | 'F3' | 'F4' = 'F0';
  if (fib4 >= 3.65 || apri >= 2.0) {
    metavirStage = platelets < 100 || bilirubin > 2.5 ? 'F4' : 'F3';
  } else if (fib4 >= 2.20 || apri >= 1.0) {
    metavirStage = 'F2';
  } else if (fib4 >= 1.30 || apri >= 0.5) {
    metavirStage = 'F1';
  } else {
    metavirStage = 'F0';
  }

  // Steatosis grade (surrogate based on transaminases + typical profile)
  let steatosisGrade: 'S0' | 'S1' | 'S2' | 'S3' = 'S0';
  if (alt > 100) steatosisGrade = 'S3';
  else if (alt > 65) steatosisGrade = 'S2';
  else if (alt > 40) steatosisGrade = 'S1';

  // Homeostatic Reserve Index (synthetic capacity score 0-100)
  // High albumin, normal bilirubin, normal platelets maintain high reserve
  const albFactor = Math.min(1.0, Math.max(0, (albumin - 2.5) / 2.0));
  const biliFactor = Math.min(1.0, Math.max(0, (3.0 - bilirubin) / 2.0));
  const pltFactor = Math.min(1.0, Math.max(0, platelets / 250));
  const fibFactor = Math.max(0, 1.0 - (fib4 / 5.0));

  const homeostaticReserveIndex = Math.round(
    (albFactor * 30 + biliFactor * 25 + pltFactor * 25 + fibFactor * 20)
  );

  // Clinical Traffic Light Risk
  let overallRiskLevel: 'normal' | 'caution' | 'critical' = 'normal';
  let riskReason = 'Stable hepatic biomarkers within target suppression range.';
  let recommendedAction = 'Continue routine annual ultrasound surveillance and biannual LFTs.';

  if (fib4 > 3.25 || apri > 1.5 || platelets < 120 || bilirubin >= 2.0) {
    overallRiskLevel = 'critical';
    riskReason = `High risk of advanced bridging fibrosis / cirrhosis (FIB-4 ${fib4}, APRI ${apri}, Platelets ${platelets}k).`;
    recommendedAction = 'Urgent FibroScan (VCTE) referral, upper GI endoscopy for variceal screening, and hepatology specialist consultation.';
  } else if (fib4 >= 1.30 || apri >= 0.70 || alt > 60 || viralLoad > 2000) {
    overallRiskLevel = 'caution';
    riskReason = `Indeterminate fibrosis with active hepatocellular inflammation (ALT ${alt} U/L, FIB-4 ${fib4}).`;
    recommendedAction = 'Repeat liver panel in 8-12 weeks, consider second-line biomarker (ELF / FibroScan), and enforce strict adherence.';
  }

  return {
    fib4,
    fib4Category,
    apri,
    apriCategory,
    metavirStage,
    steatosisGrade,
    homeostaticReserveIndex: Math.min(100, Math.max(10, homeostaticReserveIndex)),
    overallRiskLevel,
    riskReason,
    recommendedAction
  };
}
