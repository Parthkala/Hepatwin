import { create } from 'zustand';
import { patientsApi, twinApi, authApi } from '../api/client';

export interface Visit {
  id: string;
  patient_id: string;
  month: number;
  ast: number;
  alt: number;
  platelets: number;
  created_at?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  notes?: string;
  created_at?: string;
  visits?: Visit[];
}

export interface Scores {
  fib4: number;
  apri: number;
  fib4_interpretation: string;
  apri_interpretation: string;
}

export interface ForecastPoint {
  month: number;
  mean: number;
  lower80: number;
  upper80: number;
  lower95: number;
  upper95: number;
}

export interface TrafficLightData {
  patient_id: string;
  color: 'green' | 'yellow' | 'red' | 'unknown';
  fib4_now: number;
  fib4_12m: number;
  risk_label: string;
}

export interface HepatitisTypeRisk {
  hepatitis_type: string;
  risk_level: 'Low' | 'Moderate' | 'High';
  probability_percentage: number;
  trigger_reasons: string[];
  key_transmission_mode: string;
}

export interface EmergencyAlert {
  is_emergency: boolean;
  alert_level: 'info' | 'warning' | 'critical';
  urgency_message: string;
  doctor_visit_recommended: boolean;
  reasons: string[];
}

export interface PhysicalSymptoms {
  jaundice_eyes_or_skin: boolean;
  dark_urine: boolean;
  pale_clay_stool: boolean;
  right_upper_quadrant_pain: boolean;
  severe_fatigue_or_malaise: boolean;
  nausea_or_appetite_loss: boolean;
  pruritus_itching: boolean;
  fever_or_joint_pain: boolean;
}

export interface WearableVitals {
  resting_heart_rate?: number;
  hrv_ms?: number;
  sleep_score?: number;
  daily_steps?: number;
  body_temp_c?: number;
}

export interface DigitalTwinPhysiologicalState {
  twin_id: string;
  virtual_biomarker_state: string;
  homeostatic_reserve_index: number;
  wearable_stress_level: string;
  projected_decompensation_window_months?: number;
}

export interface HepatitisAssessmentData {
  twin_state: DigitalTwinPhysiologicalState;
  overall_summary: string;
  type_risks: HepatitisTypeRisk[];
  emergency_alert: EmergencyAlert;
  precautions: string[];
  ai_clinical_rationale?: string;
}

export interface LifestyleFactors {
  symptoms: PhysicalSymptoms;
  wearables: WearableVitals;
  known_hepatitis_b_positive: boolean;
  high_fat_or_sugar_diet: boolean;
  raw_shellfish_or_street_food: boolean;
  undercooked_pork_or_game: boolean;
  contaminated_water_risk: boolean;
  alcohol_intake_frequency: string;
  travel_locations: string[];
  past_medications: string[];
  heavy_acetaminophen_or_nsaids: boolean;
  herbal_or_unregulated_supplements: boolean;
  blood_transfusion_or_tattoo: boolean;
  needle_or_surgical_exposure: boolean;
}

interface PatientState {
  // Theme & Privacy
  darkMode: boolean;
  privacyMode: boolean;
  toggleDarkMode: () => void;
  togglePrivacy: () => void;

  // Auth
  token: string | null;
  user: string | null;
  login: (token: string, user: string) => void;
  logout: () => void;

  // Data
  patients: Patient[];
  selectedPatient: Patient | null;
  visits: Visit[];
  scores: Scores | null;
  forecast: ForecastPoint[];
  trafficLight: TrafficLightData | null;
  whatIfForecast: ForecastPoint[] | null;
  whatIfDriverScale: number;
  hepatitisAssessment: HepatitisAssessmentData | null;
  lifestyleFactors: LifestyleFactors;
  streamFusionResult: any | null;
  
  // Loading & Error States
  loading: boolean;
  backendConnected: boolean;
  error: string | null;

  // Actions
  fetchPatients: () => Promise<void>;
  selectPatient: (id: string) => Promise<void>;
  addPatient: (data: { name: string; age: number; notes?: string }) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addVisit: (data: { month: number; ast: number; alt: number; platelets: number }) => Promise<void>;
  deleteVisit: (visitId: string) => Promise<void>;
  runWhatIf: (driverScale: number, monthsAhead?: number) => Promise<void>;
  resetWhatIf: () => void;
  evaluateHepatitis: (factors?: Partial<LifestyleFactors>) => Promise<void>;
  fetchStreamFusion: (pnpla3Risk?: boolean, hasDiabetes?: boolean) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  darkMode: false,
  privacyMode: false,
  toggleDarkMode: () => {
    set((state) => {
      const next = !state.darkMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: next };
    });
  },
  togglePrivacy: () => set((state) => ({ privacyMode: !state.privacyMode })),

  token: localStorage.getItem('token'),
  user: localStorage.getItem('username'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
    set({ token, user });
    get().fetchPatients();
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({
      token: null,
      user: null,
      patients: [],
      selectedPatient: null,
      visits: [],
      scores: null,
      forecast: [],
      trafficLight: null,
      whatIfForecast: null,
    });
  },

  patients: [],
  selectedPatient: null,
  visits: [],
  scores: null,
  forecast: [],
  trafficLight: null,
  whatIfForecast: null,
  whatIfDriverScale: 1.0,
  hepatitisAssessment: null,
  lifestyleFactors: {
    symptoms: {
      jaundice_eyes_or_skin: false,
      dark_urine: false,
      pale_clay_stool: false,
      right_upper_quadrant_pain: false,
      severe_fatigue_or_malaise: false,
      nausea_or_appetite_loss: false,
      pruritus_itching: false,
      fever_or_joint_pain: false,
    },
    wearables: {
      resting_heart_rate: 72,
      hrv_ms: 54,
      sleep_score: 82,
      daily_steps: 6400,
      body_temp_c: 36.8,
    },
    known_hepatitis_b_positive: false,
    high_fat_or_sugar_diet: false,
    raw_shellfish_or_street_food: false,
    undercooked_pork_or_game: false,
    contaminated_water_risk: false,
    alcohol_intake_frequency: 'None',
    travel_locations: [],
    past_medications: [],
    heavy_acetaminophen_or_nsaids: false,
    herbal_or_unregulated_supplements: false,
    blood_transfusion_or_tattoo: false,
    needle_or_surgical_exposure: false,
  },
  streamFusionResult: null,
  loading: false,
  backendConnected: false,
  error: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const patients = await patientsApi.list();
      set({ patients, backendConnected: true, loading: false });
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Backend is alive, but requests require clinician login
        set({ backendConnected: true, loading: false });
      } else {
        console.warn('Backend unavailable, operating in fallback/offline mode:', err.message);
        set({ backendConnected: false, loading: false });
      }
    }
  },

  selectPatient: async (id: string) => {
    const patient = get().patients.find((p) => p.id === id) || null;
    set({
      selectedPatient: patient,
      visits: [],
      scores: null,
      forecast: [],
      trafficLight: null,
      whatIfForecast: null,
      whatIfDriverScale: 1.0,
      hepatitisAssessment: null,
      streamFusionResult: null,
      loading: true,
      error: null,
    });

    if (!patient) {
      set({ loading: false });
      return;
    }

    // Trigger Stream Fusion
    get().fetchStreamFusion();

    try {
      // Fetch visits
      const visits = await patientsApi.listVisits(patient.id);
      set({ visits });

      if (visits.length > 0) {
        // Fetch scores
        try {
          const scores = await twinApi.getScores(patient.id);
          set({ scores });
        } catch (e) {
          console.error('Scores fetch failed:', e);
        }

        // Fetch Traffic Light
        try {
          const trafficLight = await twinApi.getTrafficLight(patient.id);
          set({ trafficLight });
        } catch (e) {
          console.error('Traffic light fetch failed:', e);
        }

        // Fetch Forecast if visits >= 2
        if (visits.length >= 2) {
          try {
            const forecastRes = await twinApi.getForecast(patient.id);
            set({ forecast: forecastRes.forecasts || [] });
          } catch (e) {
            console.error('Forecast fetch failed:', e);
          }
        }

        // Run Hepatitis Risk Assessment
        try {
          await get().evaluateHepatitis();
        } catch (e) {
          console.error('Hepatitis evaluation trigger failed:', e);
        }
      }
    } catch (err: any) {
      console.error('Failed to load patient details from backend:', err);
    } finally {
      set({ loading: false });
    }
  },

  addPatient: async (data) => {
    set({ loading: true });
    try {
      const newPatient = await patientsApi.create(data);
      set((state) => ({
        patients: [...state.patients, newPatient],
        loading: false,
      }));
      get().selectPatient(newPatient.id);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      // Offline fallback
      const localPatient: Patient = {
        id: `local-${Date.now()}`,
        name: data.name,
        age: data.age,
        notes: data.notes || '',
        visits: [],
      };
      set((state) => ({
        patients: [...state.patients, localPatient],
      }));
      get().selectPatient(localPatient.id);
    }
  },

  deletePatient: async (id: string) => {
    try {
      await patientsApi.delete(id);
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err);
    }
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== id),
      selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
    }));
  },

  addVisit: async (data) => {
    const { selectedPatient } = get();
    if (!selectedPatient) return;

    set({ loading: true });
    try {
      await patientsApi.addVisit(selectedPatient.id, data);
      await get().selectPatient(selectedPatient.id);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteVisit: async (visitId: string) => {
    const { selectedPatient } = get();
    if (!selectedPatient) return;

    try {
      await patientsApi.deleteVisit(selectedPatient.id, visitId);
      await get().selectPatient(selectedPatient.id);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  runWhatIf: async (driverScale: number, monthsAhead = 12) => {
    const { selectedPatient, visits } = get();
    if (!selectedPatient || visits.length < 2) return;

    set({ loading: true, whatIfDriverScale: driverScale });
    try {
      const res = await twinApi.runWhatIf(selectedPatient.id, driverScale, monthsAhead);
      set({ whatIfForecast: res.forecasts, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  resetWhatIf: () => set({ whatIfForecast: null, whatIfDriverScale: 1.0 }),

  evaluateHepatitis: async (factors?: Partial<LifestyleFactors>) => {
    const { selectedPatient, lifestyleFactors } = get();
    if (!selectedPatient) return;

    const mergedFactors = { ...lifestyleFactors, ...(factors || {}) };
    set({ lifestyleFactors: mergedFactors, loading: true });

    try {
      const assessment = await twinApi.assessHepatitis(selectedPatient.id, mergedFactors);
      set({ hepatitisAssessment: assessment, loading: false });
    } catch (err: any) {
      console.error('Hepatitis risk assessment failed:', err);
      set({ error: err.message, loading: false });
    }
  },

  fetchStreamFusion: async (pnpla3Risk = false, hasDiabetes = false) => {
    const { selectedPatient } = get();
    if (!selectedPatient) return;

    set({ loading: true });
    try {
      const res = await twinApi.getStreamFusion(selectedPatient.id, pnpla3Risk, hasDiabetes);
      set({ streamFusionResult: res, loading: false });
    } catch (err: any) {
      console.error('Multi-modal stream fusion failed:', err);
      set({ error: err.message, loading: false });
    }
  },
}));
