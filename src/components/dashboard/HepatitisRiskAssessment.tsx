import React, { useState } from 'react';
import { usePatientStore, LifestyleFactors } from '../../store/patientStore';

export const HepatitisRiskAssessment: React.FC = () => {
  const {
    selectedPatient,
    hepatitisAssessment,
    lifestyleFactors,
    evaluateHepatitis,
    loading,
  } = usePatientStore();

  const [factors, setFactors] = useState<LifestyleFactors>(lifestyleFactors);
  const [newLocation, setNewLocation] = useState('');
  const [newMed, setNewMed] = useState('');
  const [activeTab, setActiveTab] = useState<'twin' | 'symptoms' | 'wearables' | 'exposures'>('twin');

  if (!selectedPatient) return null;

  const handleSymptomToggle = (symptomKey: keyof typeof factors.symptoms) => {
    setFactors((prev) => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptomKey]: !prev.symptoms[symptomKey],
      },
    }));
  };

  const handleExposureToggle = (key: keyof LifestyleFactors) => {
    if (typeof factors[key] === 'boolean') {
      setFactors((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleWearableChange = (key: keyof typeof factors.wearables, value: number) => {
    setFactors((prev) => ({
      ...prev,
      wearables: {
        ...prev.wearables,
        [key]: isNaN(value) ? undefined : value,
      },
    }));
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    setFactors((prev) => ({
      ...prev,
      travel_locations: [...prev.travel_locations, newLocation.trim()],
    }));
    setNewLocation('');
  };

  const handleRemoveLocation = (index: number) => {
    setFactors((prev) => ({
      ...prev,
      travel_locations: prev.travel_locations.filter((_, i) => i !== index),
    }));
  };

  const handleAddMed = () => {
    if (!newMed.trim()) return;
    setFactors((prev) => ({
      ...prev,
      past_medications: [...prev.past_medications, newMed.trim()],
    }));
    setNewMed('');
  };

  const handleRemoveMed = (index: number) => {
    setFactors((prev) => ({
      ...prev,
      past_medications: prev.past_medications.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAndEvaluate = () => {
    evaluateHepatitis(factors);
  };

  const alert = hepatitisAssessment?.emergency_alert;
  const twin = hepatitisAssessment?.twin_state;

  return (
    <div className="space-y-4">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Dynamic Patient Digital Twin Header & Physiological Replica */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-blue-700/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-2xl shadow-inner">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide">
                  Virtual Physiological Twin: {selectedPatient.name}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {twin?.virtual_biomarker_state || 'Calibrated & Active'}
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Dynamic in-silico liver replica synchronizing EHR laboratory panels with real-time biometric telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-blue-300 block">Homeostatic Reserve</span>
              <span className="text-lg font-black text-white font-mono">
                {twin?.homeostatic_reserve_index !== undefined ? `${twin.homeostatic_reserve_index}%` : '85%'}
              </span>
            </div>
            <div className="text-right pl-3 border-l border-blue-700/50">
              <span className="text-[11px] text-blue-300 block">Wearable Stress</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {twin?.wearable_stress_level || 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Clinical Rationale Card */}
        {hepatitisAssessment?.ai_clinical_rationale && (
          <div className="mt-4 p-3 bg-blue-950/60 rounded-xl border border-blue-500/30 text-xs text-blue-100 flex items-start gap-2.5">
            <span className="text-base mt-0.5">🤖</span>
            <div>
              <span className="font-semibold text-blue-300 block mb-0.5">
                AI Twin Physiological Synthesis (Powered by Clinical Intelligence):
              </span>
              <p className="leading-relaxed opacity-95">
                {hepatitisAssessment.ai_clinical_rationale}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Emergency Doctor Alert Banner */}
      {/* ───────────────────────────────────────────────────────────── */}
      {alert && alert.doctor_visit_recommended && (
        <div
          className={`rounded-2xl p-5 border shadow-sm transition-all ${
            alert.alert_level === 'critical'
              ? 'bg-red-50 border-red-300 dark:bg-red-950/60 dark:border-red-800 text-red-900 dark:text-red-200'
              : 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">
              {alert.alert_level === 'critical' ? '🚨' : '⚠️'}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  {alert.alert_level === 'critical'
                    ? 'Emergency Doctor Visit Recommended'
                    : 'Clinical Follow-up Advisory'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    alert.alert_level === 'critical'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  Action Required
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed opacity-95">
                {alert.urgency_message}
              </p>

              {alert.reasons && alert.reasons.length > 0 && (
                <ul className="mt-2.5 space-y-1 text-xs list-disc list-inside opacity-90 font-mono text-[11px]">
                  {alert.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Personalized Twin Input & Telemetry Center */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('twin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'twin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📊 Hepatitis Predictions
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'symptoms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🩺 Physical Symptoms
            </button>
            <button
              onClick={() => setActiveTab('wearables')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wearables'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⌚ Wearable Biometrics
            </button>
            <button
              onClick={() => setActiveTab('exposures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'exposures'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🌍 Diet, Travel & Meds
            </button>
          </div>

          <button
            onClick={handleSaveAndEvaluate}
            disabled={loading}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            {loading ? 'Evaluating...' : '⚡ Re-Run Twin Simulation'}
          </button>
        </div>

        {/* TAB 1: HEPATITIS PREDICTIONS & MATRIX */}
        {activeTab === 'twin' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {hepatitisAssessment?.type_risks?.map((item) => {
                const badgeColor =
                  item.risk_level === 'High'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                    : item.risk_level === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';

                return (
                  <div
                    key={item.hepatitis_type}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-gray-50/50 dark:bg-gray-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                          {item.hepatitis_type}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase shrink-0 ${badgeColor}`}
                        >
                          {item.risk_level} ({item.probability_percentage}%)
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 italic">
                        Vector: {item.key_transmission_mode}
                      </p>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 block">
                          Contributing Factors:
                        </span>
                        <ul className="text-[11px] space-y-0.5 text-gray-600 dark:text-gray-400">
                          {item.trigger_reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-blue-500">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Precautions & Preventive Guidance */}
            {hepatitisAssessment?.precautions && hepatitisAssessment.precautions.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Personalized Medical & Preventive Precautions</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {hepatitisAssessment.precautions.map((prec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2.5 rounded-lg text-emerald-900 dark:text-emerald-200"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PHYSICAL SYMPTOMS INTAKE */}
        {activeTab === 'symptoms' && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                Physical Symptom Self-Report (Hepatic Markers)
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Please check any physical signs the patient is currently experiencing:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.jaundice_eyes_or_skin}
                  onChange={() => handleSymptomToggle('jaundice_eyes_or_skin')}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-amber-700 dark:text-amber-400">🟡 Jaundice (Yellowing of eyes or skin)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.dark_urine}
                  onChange={() => handleSymptomToggle('dark_urine')}
                  className="rounded text-blue-600"
                />
                <span className="font-medium">☕ Dark, Tea-Colored or Brownish Urine</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.pale_clay_stool}
                  onChange={() => handleSymptomToggle('pale_clay_stool')}
                  className="rounded text-blue-600"
                />
                <span className="font-medium">⚪ Pale, Light, or Clay-Colored Stools</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.right_upper_quadrant_pain}
                  onChange={() => handleSymptomToggle('right_upper_quadrant_pain')}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-rose-700 dark:text-rose-400">🔴 Right Upper Quadrant Pain (Under Right Ribs)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.severe_fatigue_or_malaise}
                  onChange={() => handleSymptomToggle('severe_fatigue_or_malaise')}
                  className="rounded text-blue-600"
                />
                <span>Severe Unexplained Fatigue or General Malaise</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.nausea_or_appetite_loss}
                  onChange={() => handleSymptomToggle('nausea_or_appetite_loss')}
                  className="rounded text-blue-600"
                />
                <span>Nausea, Vomiting, or Appetite Loss</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.pruritus_itching}
                  onChange={() => handleSymptomToggle('pruritus_itching')}
                  className="rounded text-blue-600"
                />
                <span>Pruritus (Persistent Itching Without Rash)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={factors.symptoms.fever_or_joint_pain}
                  onChange={() => handleSymptomToggle('fever_or_joint_pain')}
                  className="rounded text-blue-600"
                />
                <span>Low-Grade Fever or Arthralgia (Joint Pain)</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: WEARABLE TELEMETRY (REAL-TIME SMARTWATCH INTEGRATION) */}
        {activeTab === 'wearables' && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                Real-Time Wearable Telemetry Feed (Smartwatch / Biosensors)
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Synchronizes continuous physiological signals into the digital twin's homeostatic reserve model:
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] text-gray-500 mb-1">Resting Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={factors.wearables.resting_heart_rate || ''}
                  onChange={(e) => handleWearableChange('resting_heart_rate', parseInt(e.target.value, 10))}
                  placeholder="72"
                  className="w-full text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-transparent dark:text-white"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] text-gray-500 mb-1">HRV (Heart Rate Variability, ms)</label>
                <input
                  type="number"
                  value={factors.wearables.hrv_ms || ''}
                  onChange={(e) => handleWearableChange('hrv_ms', parseInt(e.target.value, 10))}
                  placeholder="55"
                  className="w-full text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-transparent dark:text-white"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] text-gray-500 mb-1">Sleep Recovery Score (0-100)</label>
                <input
                  type="number"
                  value={factors.wearables.sleep_score || ''}
                  onChange={(e) => handleWearableChange('sleep_score', parseInt(e.target.value, 10))}
                  placeholder="85"
                  className="w-full text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-transparent dark:text-white"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] text-gray-500 mb-1">Daily Steps</label>
                <input
                  type="number"
                  value={factors.wearables.daily_steps || ''}
                  onChange={(e) => handleWearableChange('daily_steps', parseInt(e.target.value, 10))}
                  placeholder="7500"
                  className="w-full text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-transparent dark:text-white"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] text-gray-500 mb-1">Body Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={factors.wearables.body_temp_c || ''}
                  onChange={(e) => handleWearableChange('body_temp_c', parseFloat(e.target.value))}
                  placeholder="36.8"
                  className="w-full text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-transparent dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIET, TRAVEL, AND PAST MEDICATIONS */}
        {activeTab === 'exposures' && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-4">
            {/* Hepatitis B & D Specific Prerequisite */}
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-950 dark:text-indigo-200">
                <input
                  type="checkbox"
                  checked={factors.known_hepatitis_b_positive}
                  onChange={() => handleExposureToggle('known_hepatitis_b_positive')}
                  className="rounded text-indigo-600"
                />
                <span>Patient is known Hepatitis B (HBsAg) Positive (Required for Hepatitis D Delta Virus susceptibility)</span>
              </label>
            </div>

            {/* Diet & Ingestion */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Dietary & Ingestion Exposures
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={factors.contaminated_water_risk}
                    onChange={() => handleExposureToggle('contaminated_water_risk')}
                    className="rounded text-blue-600"
                  />
                  <span>Untreated Tap Water / Unboiled Ice (HAV/HEV)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={factors.raw_shellfish_or_street_food}
                    onChange={() => handleExposureToggle('raw_shellfish_or_street_food')}
                    className="rounded text-blue-600"
                  />
                  <span>Raw Shellfish / Unsanitary Street Food (HAV)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={factors.undercooked_pork_or_game}
                    onChange={() => handleExposureToggle('undercooked_pork_or_game')}
                    className="rounded text-blue-600"
                  />
                  <span>Undercooked Pork / Liver / Game Meat (HEV)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={factors.high_fat_or_sugar_diet}
                    onChange={() => handleExposureToggle('high_fat_or_sugar_diet')}
                    className="rounded text-blue-600"
                  />
                  <span>High-Fat / Refined Sugar Diet (NASH/MASH)</span>
                </label>
              </div>
            </div>

            {/* Alcohol Ingestion */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alcohol Ingestion Frequency
              </label>
              <select
                value={factors.alcohol_intake_frequency}
                onChange={(e) =>
                  setFactors((prev) => ({ ...prev, alcohol_intake_frequency: e.target.value }))
                }
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-transparent dark:text-white"
              >
                <option value="None" className="dark:bg-gray-800">None / Abstinent</option>
                <option value="Occasional" className="dark:bg-gray-800">Occasional (Social &lt;1/mo)</option>
                <option value="Moderate" className="dark:bg-gray-800">Moderate (1-2 drinks/week)</option>
                <option value="Frequent" className="dark:bg-gray-800">Frequent (3-5 drinks/week)</option>
                <option value="Heavy" className="dark:bg-gray-800">Heavy (&gt;14 drinks/week or binge)</option>
              </select>
            </div>

            {/* Travel Occurrence */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Travel History / Visited Regions
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Endemic tropical area, flood-affected region"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-transparent dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg font-semibold hover:bg-gray-300"
                >
                  + Add Place
                </button>
              </div>

              {factors.travel_locations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {factors.travel_locations.map((loc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2.5 py-0.5 rounded-full"
                    >
                      📍 {loc}
                      <button
                        onClick={() => handleRemoveLocation(i)}
                        className="hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Past Medications */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Past & Active Medications Ingestion
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Methotrexate, High-dose Statin, Anti-TB drugs, Amiodarone"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-transparent dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMed}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg font-semibold hover:bg-gray-300"
                  >
                    + Add Drug
                  </button>
                </div>

                {factors.past_medications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {factors.past_medications.map((med, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-2.5 py-0.5 rounded-full"
                      >
                        💊 {med}
                        <button
                          onClick={() => handleRemoveMed(i)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={factors.heavy_acetaminophen_or_nsaids}
                      onChange={() => handleExposureToggle('heavy_acetaminophen_or_nsaids')}
                      className="rounded text-blue-600"
                    />
                    <span>High-Dose Paracetamol / NSAIDs (&gt;2g/day)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={factors.herbal_or_unregulated_supplements}
                      onChange={() => handleExposureToggle('herbal_or_unregulated_supplements')}
                      className="rounded text-blue-600"
                    />
                    <span>Herbal Remedies / Anabolic Supplements</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
