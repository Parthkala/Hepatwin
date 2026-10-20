// scripts/generate-synthetic.ts
/**
 * Deterministic synthetic clinical data generator for HepaTwin.
 * Uses a seedable Linear Congruential Generator (LCG) to generate reproducible,
 * realistic patient cohorts adhering to ICMR reference ranges and Indian clinical profiles.
 *
 * NOT FOR CLINICAL USE. PROOF OF CONCEPT DECISION SUPPORT ONLY.
 */

export interface BiomarkerValue {
  value: number;
  unit: string;
  baseline: number;
  deltaPercent: number;
  normalRange: [number, number];
  abnormal: boolean;
  status: 'normal' | 'caution' | 'critical';
}

export interface BiomarkerProfile {
  alt: BiomarkerValue; // U/L
  ast: BiomarkerValue; // U/L
  platelets: BiomarkerValue; // 10^9 / L
  bilirubin: BiomarkerValue; // mg/dL
  albumin: BiomarkerValue; // g/dL
  viralLoad: BiomarkerValue; // IU/mL
}

export interface WhatIfParameters {
  alcoholUnitsPerWeek: number; // units/week (1 unit = 10g ethanol)
  antiviralAdherencePercent: number; // 0 - 100%
  bmi: number; // kg/m^2
  weeklyExerciseMinutes: number; // mins/week
  dietQualityScore: number; // 0 - 100 (Mediterranean/anti-inflammatory plant balance)
  vaccinationStatus: 'unvaccinated' | 'partially_vaccinated' | 'fully_vaccinated';
  sleepHoursPerDay?: number; // 4 - 10 hrs (circadian hepatic repair)
  bingeEatingHabit?: 'never' | 'occasional' | 'frequent';
  hasDiabetesHistory?: boolean;
  hasCardiacHistory?: boolean;
  takesRegularMedications?: boolean;
}

export interface TimelineEntry {
  id: string;
  monthOffset: number; // e.g. -24, -18, -12, -6, 0 (current)
  date: string;
  eventTitle: string;
  eventType: 'lab' | 'medication' | 'visit' | 'imaging';
  summary: string;
  fib4: number;
  apri: number;
  metavirStage: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
  alt: number;
  ast: number;
  platelets: number;
  labName?: string;
}

export interface PatientPersona {
  id: string;
  name: string;
  maskedName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  contact: string;
  maskedContact: string;
  occupation: string;
  region: string;
  hepatitisType: 'Hepatitis B' | 'Hepatitis C' | 'NASH / Fatty Liver Overlap';
  monthsSinceDiagnosis: number;
  linkedDataSources: {
    labReports: number;
    wearableSync: boolean;
    ehrRecords: number;
  };
  lastSyncTime: string;
  baselineBiomarkers: BiomarkerProfile;
  currentWhatIf: WhatIfParameters;
  timeline: TimelineEntry[];
  clinicalNotes: string;
}

class SeededPRNG {
  private m: number = 0x80000000; // 2^31
  private a: number = 1103515245;
  private c: number = 12345;
  private state: number;

  constructor(seed: number) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  nextFloat(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  range(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }
}

export function generateSyntheticPersonas(seed: number = 42819): PatientPersona[] {
  const prng = new SeededPRNG(seed);

  // Persona A: 34yo, Chronic Hepatitis B, stable, high adherence
  // 6 Longitudinal Labs from Month -25 to Current
  const personaA: PatientPersona = {
    id: "HT-IND-3401",
    name: "Aakash Deshmukh",
    maskedName: "P-3401 (De-identified)",
    age: 34,
    sex: "Male",
    contact: "+91 98201-44912",
    maskedContact: "+91 •••••-•••••",
    occupation: "Software Quality Analyst",
    region: "Pune, Maharashtra",
    hepatitisType: "Hepatitis B",
    monthsSinceDiagnosis: 28,
    linkedDataSources: {
      labReports: 6,
      wearableSync: true,
      ehrRecords: 14,
    },
    lastSyncTime: "12 mins ago (Real-time IoT & EHR linked)",
    baselineBiomarkers: {
      alt: {
        value: 36,
        unit: "U/L",
        baseline: 38,
        deltaPercent: -5.3,
        normalRange: [7, 45],
        abnormal: false,
        status: "normal",
      },
      ast: {
        value: 31,
        unit: "U/L",
        baseline: 34,
        deltaPercent: -8.8,
        normalRange: [8, 40],
        abnormal: false,
        status: "normal",
      },
      platelets: {
        value: 235,
        unit: "x10^9/L",
        baseline: 240,
        deltaPercent: -2.1,
        normalRange: [150, 450],
        abnormal: false,
        status: "normal",
      },
      bilirubin: {
        value: 0.9,
        unit: "mg/dL",
        baseline: 0.95,
        deltaPercent: -5.3,
        normalRange: [0.2, 1.2],
        abnormal: false,
        status: "normal",
      },
      albumin: {
        value: 4.4,
        unit: "g/dL",
        baseline: 4.3,
        deltaPercent: 2.3,
        normalRange: [3.5, 5.0],
        abnormal: false,
        status: "normal",
      },
      viralLoad: {
        value: 140,
        unit: "IU/mL",
        baseline: 2800,
        deltaPercent: -95.0,
        normalRange: [0, 20],
        abnormal: true,
        status: "caution",
      },
    },
    currentWhatIf: {
      alcoholUnitsPerWeek: 0,
      antiviralAdherencePercent: 96,
      bmi: 23.4,
      weeklyExerciseMinutes: 180,
      dietQualityScore: 82,
      vaccinationStatus: "fully_vaccinated",
      sleepHoursPerDay: 7.5,
      bingeEatingHabit: "never",
      hasDiabetesHistory: false,
      hasCardiacHistory: false,
      takesRegularMedications: false,
    },
    timeline: [
      {
        id: "T-A-1",
        monthOffset: -25,
        date: "2024-09-12",
        eventTitle: "Lab 1: Initial HBV Screening & Serology",
        eventType: "lab",
        labName: "Dr. Lal PathLabs (Shivaji Nagar, Pune)",
        summary: "ALT 92 U/L, AST 78 U/L, Platelets 205k. HBsAg Positive. HBV DNA: 240,000 IU/mL. Initiating antiviral therapy.",
        fib4: 1.54,
        apri: 0.95,
        metavirStage: "F1",
        alt: 92,
        ast: 78,
        platelets: 205,
      },
      {
        id: "T-A-2",
        monthOffset: -20,
        date: "2025-02-15",
        eventTitle: "Lab 2: 5-Month Early On-Treatment Response",
        eventType: "lab",
        labName: "Metropolis Healthcare (Deccan Gymkhana, Pune)",
        summary: "ALT 68 U/L, AST 54 U/L, Platelets 214k. HBV DNA decreased to 18,500 IU/mL under daily Tenofovir alafenamide (TAF).",
        fib4: 1.04,
        apri: 0.63,
        metavirStage: "F1",
        alt: 68,
        ast: 54,
        platelets: 214,
      },
      {
        id: "T-A-3",
        monthOffset: -15,
        date: "2025-07-20",
        eventTitle: "Lab 3: Mid-Year Biochemical Panel",
        eventType: "lab",
        labName: "Apollo Diagnostics (Kothrud, Pune)",
        summary: "ALT 52 U/L, AST 44 U/L, Platelets 222k. Liver enzymes trending steadily towards target normalization range.",
        fib4: 0.93,
        apri: 0.50,
        metavirStage: "F0",
        alt: 52,
        ast: 44,
        platelets: 222,
      },
      {
        id: "T-A-4",
        monthOffset: -10,
        date: "2025-12-10",
        eventTitle: "Lab 4: 1-Year Complete Viral Suppression Check",
        eventType: "lab",
        labName: "SRL Diagnostics / Agilus Diagnostics (Pune)",
        summary: "ALT 42 U/L, AST 36 U/L, Platelets 228k. HBV DNA suppressed to 380 IU/mL. FibroScan LSM 5.2 kPa confirms preserved liver stiffness.",
        fib4: 0.83,
        apri: 0.39,
        metavirStage: "F0",
        alt: 42,
        ast: 36,
        platelets: 228,
      },
      {
        id: "T-A-5",
        monthOffset: -5,
        date: "2026-05-18",
        eventTitle: "Lab 5: 18-Month Routine HCC & Hepatic Panel",
        eventType: "lab",
        labName: "Thyrocare Technologies (Pune Center)",
        summary: "ALT 38 U/L, AST 33 U/L, Platelets 232k. Serum AFP normal (2.4 ng/mL). Ultrasonography unremarkable.",
        fib4: 0.78,
        apri: 0.36,
        metavirStage: "F0",
        alt: 38,
        ast: 33,
        platelets: 232,
      },
      {
        id: "T-A-6",
        monthOffset: 0,
        date: "2026-10-18",
        eventTitle: "Lab 6: Present Clinical Surveillance Panel",
        eventType: "lab",
        labName: "Ruby Hall Clinic Pathology Lab (Pune)",
        summary: "ALT 36 U/L, AST 31 U/L, Platelets 235k. Full virologic suppression, excellent synthetic capacity, minimal fibrogenesis.",
        fib4: 0.74,
        apri: 0.33,
        metavirStage: "F0",
        alt: 36,
        ast: 31,
        platelets: 235,
      },
    ],
    clinicalNotes: "Patient compliant with daily Tenofovir. Minimal baseline fibrosis. Recommend continuing annual HCC surveillance and biannual LFT monitoring.",
  };

  // Persona B: 52yo, Chronic Hepatitis C, rising transaminases, moderate fibrosis (F2)
  // 6 Longitudinal Labs from Month -22 to Current
  const personaB: PatientPersona = {
    id: "HT-IND-5202",
    name: "Sunita Roy",
    maskedName: "P-5202 (De-identified)",
    age: 52,
    sex: "Female",
    contact: "+91 97410-23841",
    maskedContact: "+91 •••••-•••••",
    occupation: "School Vice Principal",
    region: "Kolkata, West Bengal",
    hepatitisType: "Hepatitis C",
    monthsSinceDiagnosis: 22,
    linkedDataSources: {
      labReports: 6,
      wearableSync: true,
      ehrRecords: 22,
    },
    lastSyncTime: "34 mins ago (EHR + Lab Ingestion active)",
    baselineBiomarkers: {
      alt: {
        value: 78,
        unit: "U/L",
        baseline: 58,
        deltaPercent: 34.5,
        normalRange: [7, 45],
        abnormal: true,
        status: "caution",
      },
      ast: {
        value: 68,
        unit: "U/L",
        baseline: 49,
        deltaPercent: 38.7,
        normalRange: [8, 40],
        abnormal: true,
        status: "caution",
      },
      platelets: {
        value: 145,
        unit: "x10^9/L",
        baseline: 168,
        deltaPercent: -13.7,
        normalRange: [150, 450],
        abnormal: true,
        status: "caution",
      },
      bilirubin: {
        value: 1.4,
        unit: "mg/dL",
        baseline: 1.1,
        deltaPercent: 27.3,
        normalRange: [0.2, 1.2],
        abnormal: true,
        status: "caution",
      },
      albumin: {
        value: 3.6,
        unit: "g/dL",
        baseline: 3.9,
        deltaPercent: -7.7,
        normalRange: [3.5, 5.0],
        abnormal: false,
        status: "normal",
      },
      viralLoad: {
        value: 640000,
        unit: "IU/mL",
        baseline: 480000,
        deltaPercent: 33.3,
        normalRange: [0, 15],
        abnormal: true,
        status: "critical",
      },
    },
    currentWhatIf: {
      alcoholUnitsPerWeek: 3,
      antiviralAdherencePercent: 65,
      bmi: 26.8,
      weeklyExerciseMinutes: 60,
      dietQualityScore: 54,
      vaccinationStatus: "partially_vaccinated",
      sleepHoursPerDay: 6.5,
      bingeEatingHabit: "occasional",
      hasDiabetesHistory: false,
      hasCardiacHistory: true,
      takesRegularMedications: true,
    },
    timeline: [
      {
        id: "T-B-1",
        monthOffset: -22,
        date: "2024-12-14",
        eventTitle: "Lab 1: Post-Operative HCV Screening",
        eventType: "lab",
        labName: "Suraksha Diagnostic Center (Kolkata)",
        summary: "ALT 52 U/L, AST 45 U/L, Platelets 175k. Anti-HCV positive. HCV RNA 380,000 IU/mL. Prescribed Sofosbuvir + Velpatasvir.",
        fib4: 1.85,
        apri: 0.64,
        metavirStage: "F1",
        alt: 52,
        ast: 45,
        platelets: 175,
      },
      {
        id: "T-B-2",
        monthOffset: -18,
        date: "2025-04-10",
        eventTitle: "Lab 2: Treatment Adherence Review",
        eventType: "lab",
        labName: "Peerless Hospital Clinical Lab (Kolkata)",
        summary: "ALT 58 U/L, AST 49 U/L, Platelets 168k. Missed multiple doses during family illness. HCV RNA: 480,000 IU/mL.",
        fib4: 2.12,
        apri: 0.73,
        metavirStage: "F1",
        alt: 58,
        ast: 49,
        platelets: 168,
      },
      {
        id: "T-B-3",
        monthOffset: -13,
        date: "2025-09-18",
        eventTitle: "Lab 3: Hepatic Transaminase Flare",
        eventType: "lab",
        labName: "Dr. Lal PathLabs (Salt Lake, Kolkata)",
        summary: "ALT 66 U/L, AST 56 U/L, Platelets 160k. Active periportal inflammation. Patient counseled on adherence importance.",
        fib4: 2.38,
        apri: 0.88,
        metavirStage: "F2",
        alt: 66,
        ast: 56,
        platelets: 160,
      },
      {
        id: "T-B-4",
        monthOffset: -9,
        date: "2026-01-22",
        eventTitle: "Lab 4: 1-Year Viral Load & Platelet Dip",
        eventType: "lab",
        labName: "AMRI Hospitals Diagnostic Wing (Dhakuria, Kolkata)",
        summary: "ALT 70 U/L, AST 61 U/L, Platelets 154k. Platelets nearing low cutoff. Ultrasound shows early parenchymal coarse echotexture.",
        fib4: 2.45,
        apri: 0.99,
        metavirStage: "F2",
        alt: 70,
        ast: 61,
        platelets: 154,
      },
      {
        id: "T-B-5",
        monthOffset: -4,
        date: "2026-06-12",
        eventTitle: "Lab 5: Pre-Treatment Recalibration Panel",
        eventType: "lab",
        labName: "Medica Super Specialty Hospital Lab (Kolkata)",
        summary: "ALT 74 U/L, AST 64 U/L, Platelets 150k. Thrombocytopenia worsening. FIB-4 = 2.62 confirms persistent F2 fibrosis.",
        fib4: 2.62,
        apri: 1.07,
        metavirStage: "F2",
        alt: 74,
        ast: 64,
        platelets: 150,
      },
      {
        id: "T-B-6",
        monthOffset: 0,
        date: "2026-10-18",
        eventTitle: "Lab 6: Current Clinical Staging Panel",
        eventType: "lab",
        labName: "Apollo Multispeciality Hospitals (EM Bypass, Kolkata)",
        summary: "ALT 78 U/L, AST 68 U/L, Platelets 145k. Active HCV replication (640,000 IU/mL). Moderate risk of progression to bridging fibrosis.",
        fib4: 2.76,
        apri: 1.17,
        metavirStage: "F2",
        alt: 78,
        ast: 68,
        platelets: 145,
      },
    ],
    clinicalNotes: "Patient has genotype 3 HCV with suboptimal DAA adherence. Rising transaminases and mild thrombocytopenia indicate active periportal inflammation. Priority: ensure 100% antiviral adherence to halt fibrosis.",
  };

  // Persona C: 45yo, MASLD/NASH + Hepatitis overlap, high-risk, F3 trajectory
  // 6 Longitudinal Labs from Month -36 to Current
  const personaC: PatientPersona = {
    id: "HT-IND-4503",
    name: "Vikram Malhotra",
    maskedName: "P-4503 (De-identified)",
    age: 45,
    sex: "Male",
    contact: "+91 98112-70924",
    maskedContact: "+91 •••••-•••••",
    occupation: "Senior Logistics Executive",
    region: "Gurugram, Haryana",
    hepatitisType: "NASH / Fatty Liver Overlap",
    monthsSinceDiagnosis: 36,
    linkedDataSources: {
      labReports: 6,
      wearableSync: true,
      ehrRecords: 29,
    },
    lastSyncTime: "4 mins ago (Continuous Telemetry & CGM synced)",
    baselineBiomarkers: {
      alt: {
        value: 124,
        unit: "U/L",
        baseline: 92,
        deltaPercent: 34.8,
        normalRange: [7, 45],
        abnormal: true,
        status: "critical",
      },
      ast: {
        value: 110,
        unit: "U/L",
        baseline: 78,
        deltaPercent: 41.0,
        normalRange: [8, 40],
        abnormal: true,
        status: "critical",
      },
      platelets: {
        value: 118,
        unit: "x10^9/L",
        baseline: 142,
        deltaPercent: -16.9,
        normalRange: [150, 450],
        abnormal: true,
        status: "critical",
      },
      bilirubin: {
        value: 2.1,
        unit: "mg/dL",
        baseline: 1.6,
        deltaPercent: 31.3,
        normalRange: [0.2, 1.2],
        abnormal: true,
        status: "critical",
      },
      albumin: {
        value: 3.2,
        unit: "g/dL",
        baseline: 3.5,
        deltaPercent: -8.6,
        normalRange: [3.5, 5.0],
        abnormal: true,
        status: "caution",
      },
      viralLoad: {
        value: 28400,
        unit: "IU/mL",
        baseline: 12000,
        deltaPercent: 136.7,
        normalRange: [0, 20],
        abnormal: true,
        status: "critical",
      },
    },
    currentWhatIf: {
      alcoholUnitsPerWeek: 16,
      antiviralAdherencePercent: 45,
      bmi: 32.4,
      weeklyExerciseMinutes: 20,
      dietQualityScore: 32,
      vaccinationStatus: "unvaccinated",
      sleepHoursPerDay: 5.5,
      bingeEatingHabit: "frequent",
      hasDiabetesHistory: true,
      hasCardiacHistory: true,
      takesRegularMedications: true,
    },
    timeline: [
      {
        id: "T-C-1",
        monthOffset: -36,
        date: "2023-10-12",
        eventTitle: "Lab 1: Annual Executive Health Checkup",
        eventType: "lab",
        labName: "Max Super Speciality Hospital (Gurugram)",
        summary: "ALT 68 U/L, AST 54 U/L, Platelets 185k. Grade II fatty liver on sonography. Incidental HBsAg positive. Advised lifestyle modification.",
        fib4: 2.15,
        apri: 0.73,
        metavirStage: "F1",
        alt: 68,
        ast: 54,
        platelets: 185,
      },
      {
        id: "T-C-2",
        monthOffset: -28,
        date: "2024-06-18",
        eventTitle: "Lab 2: Cardiometabolic Screening",
        eventType: "lab",
        labName: "Fortis Memorial Research Institute (FMRI Gurugram)",
        summary: "ALT 78 U/L, AST 64 U/L, Platelets 172k. HbA1c 8.2%, BMI 30.8. Ongoing heavy alcohol intake (~14 units/week).",
        fib4: 2.47,
        apri: 0.93,
        metavirStage: "F2",
        alt: 78,
        ast: 64,
        platelets: 172,
      },
      {
        id: "T-C-3",
        monthOffset: -21,
        date: "2025-01-20",
        eventTitle: "Lab 3: Hepatic Necroinflammation Check",
        eventType: "lab",
        labName: "Medanta - The Medicity Pathology (Gurugram)",
        summary: "ALT 88 U/L, AST 72 U/L, Platelets 158k. Steatohepatitis progression. ALT and AST persistently twice normal.",
        fib4: 2.82,
        apri: 1.14,
        metavirStage: "F2",
        alt: 88,
        ast: 72,
        platelets: 158,
      },
      {
        id: "T-C-4",
        monthOffset: -14,
        date: "2025-08-14",
        eventTitle: "Lab 4: Progressive Thrombocytopenia & LFT",
        eventType: "lab",
        labName: "Dr. Lal PathLabs National Reference Lab (Rohini/NCR)",
        summary: "ALT 98 U/L, AST 82 U/L, Platelets 142k. Platelets drop below 150k indicating early portal congestion. Bilirubin rising to 1.6 mg/dL.",
        fib4: 3.12,
        apri: 1.44,
        metavirStage: "F2",
        alt: 98,
        ast: 82,
        platelets: 142,
      },
      {
        id: "T-C-5",
        monthOffset: -7,
        date: "2026-03-24",
        eventTitle: "Lab 5: Advanced Bridging Fibrosis Alert",
        eventType: "lab",
        labName: "Apollo Spectra Hospitals Lab (Gurugram)",
        summary: "ALT 112 U/L, AST 96 U/L, Platelets 130k. FIB-4 = 3.42 crosses advanced fibrosis cutoff. AST/ALT ratio inverting.",
        fib4: 3.42,
        apri: 1.85,
        metavirStage: "F3",
        alt: 112,
        ast: 96,
        platelets: 130,
      },
      {
        id: "T-C-6",
        monthOffset: 0,
        date: "2026-10-18",
        eventTitle: "Lab 6: High-Risk Decompensation Surveillance",
        eventType: "lab",
        labName: "Artemis Hospitals Diagnostic Services (Gurugram)",
        summary: "ALT 124 U/L, AST 110 U/L, Platelets 118k. Severe thrombocytopenia, elevated bilirubin (2.1), FIB-4 = 3.76 indicates advanced F3 fibrosis.",
        fib4: 3.76,
        apri: 2.33,
        metavirStage: "F3",
        alt: 124,
        ast: 110,
        platelets: 118,
      },
    ],
    clinicalNotes: "CRITICAL: Patient exhibits aggressive dual-insult hepatic injury (Steatohepatitis MASH + uncontrolled HBV replication + high alcohol consumption). Imminent risk of bridging fibrosis progression (F3 to F4 cirrhosis). Needs immediate FibroScan and alcohol cessation protocol.",
  };

  return [personaA, personaB, personaC];
}
