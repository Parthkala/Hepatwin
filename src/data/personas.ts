// src/data/personas.ts
import { generateSyntheticPersonas, PatientPersona, WhatIfParameters, TimelineEntry } from '../../scripts/generate-synthetic';

export type { PatientPersona, WhatIfParameters, TimelineEntry };

export const SYNTHETIC_PERSONAS: PatientPersona[] = generateSyntheticPersonas(42819);

export const ICMR_REFERENCE_RANGES = {
  alt: { name: 'Alanine Aminotransferase (ALT)', unit: 'U/L', normalMale: [7, 45], normalFemale: [7, 35], uln: 40 },
  ast: { name: 'Aspartate Aminotransferase (AST)', unit: 'U/L', normalMale: [8, 40], normalFemale: [8, 35], uln: 40 },
  platelets: { name: 'Platelet Count', unit: 'x10^9/L', normal: [150, 450], lowRiskCutoff: 150 },
  bilirubin: { name: 'Total Bilirubin', unit: 'mg/dL', normal: [0.2, 1.2], criticalCutoff: 2.0 },
  albumin: { name: 'Serum Albumin', unit: 'g/dL', normal: [3.5, 5.0], decompensatedCutoff: 3.5 },
  viralLoad: { name: 'Viral Load (HBV/HCV)', unit: 'IU/mL', target: 20 },
};
