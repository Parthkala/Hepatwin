// src/store/twinStore.ts
import { create } from 'zustand';
import { SYNTHETIC_PERSONAS, PatientPersona, WhatIfParameters, TimelineEntry } from '../data/personas';
import { evaluateClinicalRisk, FibrosisMetrics } from '../model/fibrosis';
import { generateFibrosisTrajectory, TrajectoryPoint } from '../model/trajectory';
import { computeFeatureAttribution, DriverContribution } from '../model/explainability';

export type ActiveNavTab = 'overview' | 'twin' | 'simulate' | 'timeline' | 'streamFusion' | 'reports' | 'culinary';
export type ActiveRole = 'physician' | 'patient';

// SSR & Test-safe storage wrapper
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Ignore storage errors in restricted frames
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

interface TwinState {
  // Navigation & Role
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  activeRole: ActiveRole | null; // null means on the login gateway
  setActiveRole: (role: ActiveRole | null) => void;

  // Personas
  personas: PatientPersona[];
  selectedPersonaId: string;
  selectPersona: (id: string) => void;
  addNewPatient: (patient: Partial<PatientPersona>) => void;

  // Modals & Panels
  isAddPatientModalOpen: boolean;
  setIsAddPatientModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'clinician' | 'patient';
  setAuthModalInitialTab: (tab: 'clinician' | 'patient') => void;

  // Auth: Clinician Credentials
  clinicianUser: string | null;
  clinicianToken: string | null;
  loginClinician: (token: string, username: string) => void;
  logoutClinician: () => void;

  // Auth: Patient Credentials & Independent Access
  patientUser: string | null;
  patientToken: string | null;
  patientAssignedPersonaId: string | null;
  loginPatient: (token: string, username: string, personaId: string) => void;
  logoutPatient: () => void;

  // Global Logout to Gateway
  logoutToGateway: () => void;

  // Privacy Mode (DPDP Act 2023)
  privacyMode: boolean;
  togglePrivacyMode: () => void;

  // Selected Twin Region for SVG inspection
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;

  // What-If Workspace
  whatIf: WhatIfParameters;
  updateWhatIf: (partial: Partial<WhatIfParameters>) => void;
  resetWhatIf: () => void;

  // Scrubbable Timeline Index
  timelineIndex: number;
  setTimelineIndex: (index: number) => void;

  // Derived Getters
  getActivePersona: () => PatientPersona;
  getActiveTimelineEntry: () => TimelineEntry;
  getFibrosisMetrics: () => FibrosisMetrics;
  getTrajectory: () => { points: TrajectoryPoint[]; headline: string; driverImpact: string };
  getFeatureAttribution: () => { drivers: DriverContribution[]; topDriverSentence: string };
}

export const useTwinStore = create<TwinState>((set, get) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Read saved session or default to null (gateway landing)
  activeRole: (safeStorage.getItem('active_role') as ActiveRole) || null,
  setActiveRole: (role) => {
    if (role) {
      safeStorage.setItem('active_role', role);
    } else {
      safeStorage.removeItem('active_role');
    }
    set({ activeRole: role });
  },

  personas: SYNTHETIC_PERSONAS,
  selectedPersonaId: SYNTHETIC_PERSONAS[0].id,
  selectPersona: (id) => {
    // If user is patient, lock them to their assigned persona
    if (get().activeRole === 'patient') {
      const assignedId = get().patientAssignedPersonaId || get().personas[0].id;
      if (id !== assignedId) return;
    }

    const p = get().personas.find((item) => item.id === id) || get().personas[0];
    set({
      selectedPersonaId: id,
      whatIf: { ...p.currentWhatIf },
      timelineIndex: p.timeline.length - 1,
      selectedRegion: null,
    });
  },

  isAddPatientModalOpen: false,
  setIsAddPatientModalOpen: (open) => set({ isAddPatientModalOpen: open }),

  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  authModalInitialTab: 'clinician',
  setAuthModalInitialTab: (tab) => set({ authModalInitialTab: tab }),

  // Clinician Auth
  clinicianUser: safeStorage.getItem('clinician_user'),
  clinicianToken: safeStorage.getItem('clinician_token'),
  loginClinician: (token, username) => {
    safeStorage.setItem('clinician_token', token);
    safeStorage.setItem('clinician_user', username);
    safeStorage.setItem('active_role', 'physician');
    set({ clinicianToken: token, clinicianUser: username, activeRole: 'physician' });
  },
  logoutClinician: () => {
    safeStorage.removeItem('clinician_token');
    safeStorage.removeItem('clinician_user');
    safeStorage.removeItem('active_role');
    set({ clinicianToken: null, clinicianUser: null, activeRole: null });
  },

  // Patient Auth
  patientUser: safeStorage.getItem('patient_user'),
  patientToken: safeStorage.getItem('patient_token'),
  patientAssignedPersonaId: safeStorage.getItem('patient_assigned_persona_id'),
  loginPatient: (token, username, personaId) => {
    safeStorage.setItem('patient_token', token);
    safeStorage.setItem('patient_user', username);
    safeStorage.setItem('patient_assigned_persona_id', personaId);
    safeStorage.setItem('active_role', 'patient');

    const targetPersona = get().personas.find((p) => p.id === personaId) || get().personas[0];

    set({
      patientToken: token,
      patientUser: username,
      patientAssignedPersonaId: personaId,
      selectedPersonaId: personaId,
      whatIf: { ...targetPersona.currentWhatIf },
      timelineIndex: targetPersona.timeline.length - 1,
      activeRole: 'patient',
    });
  },
  logoutPatient: () => {
    safeStorage.removeItem('patient_token');
    safeStorage.removeItem('patient_user');
    safeStorage.removeItem('patient_assigned_persona_id');
    safeStorage.removeItem('active_role');
    set({ patientToken: null, patientUser: null, patientAssignedPersonaId: null, activeRole: null });
  },

  // Global Exit / Logout
  logoutToGateway: () => {
    safeStorage.removeItem('active_role');
    set({ activeRole: null });
  },

  addNewPatient: (newPatient) => {
    const id = `HT-IND-${Math.floor(1000 + Math.random() * 9000)}`;
    const age = Number(newPatient.age) || 40;
    const name = newPatient.name || 'Anonymous Patient';
    const hepatitisType = (newPatient.hepatitisType as any) || 'Hepatitis B';
    const alt = Number(newPatient.baselineBiomarkers?.alt?.value) || 45;
    const ast = Number(newPatient.baselineBiomarkers?.ast?.value) || 42;
    const platelets = Number(newPatient.baselineBiomarkers?.platelets?.value) || 200;

    const patientRecord: PatientPersona = {
      id,
      name,
      maskedName: `P-${id.split('-')[2]} (De-identified)`,
      age,
      sex: (newPatient.sex as any) || 'Male',
      contact: '+91 98765-43210',
      maskedContact: '+91 •••••-•••••',
      occupation: newPatient.occupation || 'Self-employed',
      region: newPatient.region || 'New Delhi, India',
      hepatitisType,
      monthsSinceDiagnosis: Number(newPatient.monthsSinceDiagnosis) || 12,
      linkedDataSources: {
        labReports: 3,
        wearableSync: true,
        ehrRecords: 8,
      },
      lastSyncTime: 'Just now (New profile registered)',
      baselineBiomarkers: {
        alt: {
          value: alt,
          unit: 'U/L',
          baseline: alt,
          deltaPercent: 0,
          normalRange: [7, 45],
          abnormal: alt > 45,
          status: alt > 65 ? 'critical' : alt > 45 ? 'caution' : 'normal',
        },
        ast: {
          value: ast,
          unit: 'U/L',
          baseline: ast,
          deltaPercent: 0,
          normalRange: [8, 40],
          abnormal: ast > 40,
          status: ast > 60 ? 'critical' : ast > 40 ? 'caution' : 'normal',
        },
        platelets: {
          value: platelets,
          unit: 'x10^9/L',
          baseline: platelets,
          deltaPercent: 0,
          normalRange: [150, 450],
          abnormal: platelets < 150,
          status: platelets < 130 ? 'critical' : platelets < 150 ? 'caution' : 'normal',
        },
        bilirubin: {
          value: 1.0,
          unit: 'mg/dL',
          baseline: 1.0,
          deltaPercent: 0,
          normalRange: [0.2, 1.2],
          abnormal: false,
          status: 'normal',
        },
        albumin: {
          value: 4.2,
          unit: 'g/dL',
          baseline: 4.2,
          deltaPercent: 0,
          normalRange: [3.5, 5.0],
          abnormal: false,
          status: 'normal',
        },
        viralLoad: {
          value: Number(newPatient.baselineBiomarkers?.viralLoad?.value) || 1200,
          unit: 'IU/mL',
          baseline: 1200,
          deltaPercent: 0,
          normalRange: [0, 20],
          abnormal: true,
          status: 'caution',
        },
      },
      currentWhatIf: {
        alcoholUnitsPerWeek: 2,
        antiviralAdherencePercent: 85,
        bmi: 25.5,
        weeklyExerciseMinutes: 90,
        dietQualityScore: 60,
        vaccinationStatus: 'partially_vaccinated',
        sleepHoursPerDay: 7,
        bingeEatingHabit: 'never',
        hasDiabetesHistory: false,
        hasCardiacHistory: false,
        takesRegularMedications: false,
      },
      timeline: [
        {
          id: `T-${id}-1`,
          monthOffset: 0,
          date: new Date().toISOString().split('T')[0],
          eventTitle: 'Intake Registration & Baseline Calibration',
          eventType: 'visit',
          summary: `Initial clinical digital twin creation for ${name}. Transaminases: ALT ${alt}, AST ${ast}, Platelets ${platelets}.`,
          fib4: Number(((age * ast) / (platelets * Math.sqrt(alt))).toFixed(2)),
          apri: Number((((ast / 40) / platelets) * 100).toFixed(2)),
          metavirStage: alt > 80 || platelets < 130 ? 'F2' : 'F1',
          alt,
          ast,
          platelets,
        },
      ],
      clinicalNotes: newPatient.clinicalNotes || 'New digital twin registered in cohort.',
    };

    set((state) => ({
      personas: [patientRecord, ...state.personas],
      selectedPersonaId: id,
      whatIf: { ...patientRecord.currentWhatIf },
      timelineIndex: 0,
      isAddPatientModalOpen: false,
      activeTab: 'overview',
    }));
  },

  privacyMode: false,
  togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),

  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  whatIf: { ...SYNTHETIC_PERSONAS[0].currentWhatIf },
  updateWhatIf: (partial) =>
    set((state) => ({
      whatIf: { ...state.whatIf, ...partial },
    })),
  resetWhatIf: () => {
    const current = get().getActivePersona();
    set({ whatIf: { ...current.currentWhatIf } });
  },

  timelineIndex: SYNTHETIC_PERSONAS[0].timeline.length - 1,
  setTimelineIndex: (index) => set({ timelineIndex: index }),

  getActivePersona: () => {
    const { personas, selectedPersonaId } = get();
    return personas.find((p) => p.id === selectedPersonaId) || personas[0];
  },

  getActiveTimelineEntry: () => {
    const persona = get().getActivePersona();
    const idx = Math.min(get().timelineIndex, persona.timeline.length - 1);
    return persona.timeline[idx] || persona.timeline[persona.timeline.length - 1];
  },

  getFibrosisMetrics: () => {
    const persona = get().getActivePersona();
    const entry = get().getActiveTimelineEntry();
    const bio = persona.baselineBiomarkers;

    // Use current timeline scrub values if scrubbed, else baseline
    const alt = entry ? entry.alt : bio.alt.value;
    const ast = entry ? entry.ast : bio.ast.value;
    const platelets = entry ? entry.platelets : bio.platelets.value;
    const bilirubin = bio.bilirubin.value;
    const albumin = bio.albumin.value;
    const viralLoad = bio.viralLoad.value;

    return evaluateClinicalRisk(
      persona.age,
      ast,
      alt,
      platelets,
      bilirubin,
      albumin,
      viralLoad
    );
  },

  getTrajectory: () => {
    const metrics = get().getFibrosisMetrics();
    const whatIf = get().whatIf;
    return generateFibrosisTrajectory(metrics.fib4, whatIf);
  },

  getFeatureAttribution: () => {
    const metrics = get().getFibrosisMetrics();
    const whatIf = get().whatIf;
    const persona = get().getActivePersona();
    return computeFeatureAttribution(whatIf, metrics.fib4, persona.baselineBiomarkers.viralLoad.value);
  },
}));
