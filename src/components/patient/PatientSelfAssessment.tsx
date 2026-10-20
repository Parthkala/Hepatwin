// src/components/patient/PatientSelfAssessment.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { 
  ClipboardCheck, 
  Droplet, 
  Utensils, 
  Wine, 
  Pill, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Info,
  Moon,
  Syringe,
  Activity,
  Heart,
  CheckCircle2
} from 'lucide-react';

export const PatientSelfAssessment: React.FC = () => {
  const { whatIf, updateWhatIf, getFibrosisMetrics, getActivePersona } = useTwinStore();
  const metrics = getFibrosisMetrics();
  const persona = getActivePersona();

  // Questionnaire States
  const [waterSource, setWaterSource] = useState<'ro_filtered' | 'boiled' | 'municipal_tap' | 'open_well_untreated'>('ro_filtered');
  const [foodHabit, setFoodHabit] = useState<'home_cooked' | 'regular_street_food' | 'raw_shellfish' | 'pork_or_game'>('home_cooked');
  const [drinkingPattern, setDrinkingPattern] = useState<'never' | 'social_monthly' | 'weekend_binge' | 'daily_habitual'>('never');
  const [alcoholUnits, setAlcoholUnits] = useState<number>(whatIf.alcoholUnitsPerWeek);
  const [travelExposure, setTravelExposure] = useState<string>('Local / Metro area');
  
  // NEW: Sleep duration & circadian quality
  const [sleepHours, setSleepHours] = useState<number>(whatIf.sleepHoursPerDay || 7);
  const [sleepQuality, setSleepQuality] = useState<'regular' | 'disrupted' | 'night_shift'>('regular');

  // NEW: Binge eating habit (Fatty liver / steatosis trigger)
  const [bingeEating, setBingeEating] = useState<'never' | 'occasional' | 'frequent' | 'severe'>(
    whatIf.bingeEatingHabit === 'frequent' ? 'frequent' : whatIf.bingeEatingHabit === 'occasional' ? 'occasional' : 'never'
  );

  // NEW: Hepatitis vaccination status
  const [vaccineStatus, setVaccineStatus] = useState<'fully_vaccinated' | 'partially_vaccinated' | 'unvaccinated' | 'unknown'>(
    whatIf.vaccinationStatus || 'partially_vaccinated'
  );

  // NEW: Chronic medical history & medications (Diabetes, Cardiac, DILI risks)
  const [chronicMeds, setChronicMeds] = useState<{
    diabetes: boolean;
    cardiac: boolean;
    paracetamol: boolean;
    herbalRemedies: boolean;
  }>({
    diabetes: whatIf.hasDiabetesHistory || false,
    cardiac: whatIf.hasCardiacHistory || false,
    paracetamol: false,
    herbalRemedies: false,
  });

  // Self-Reported Symptoms
  const [symptoms, setSymptoms] = useState<{
    jaundice: boolean;
    darkUrine: boolean;
    paleStool: boolean;
    rightRibPain: boolean;
    severeFatigue: boolean;
  }>({
    jaundice: false,
    darkUrine: false,
    paleStool: false,
    rightRibPain: false,
    severeFatigue: false,
  });

  // Calculate Real-Time Patient Risk Score, Fatty Liver Probability & Clinical Differential
  const calculateSelfAssessment = () => {
    let riskScore = 15;
    const flags: string[] = [];
    const recommendedTests: string[] = [];
    let fattyLiverRisk: 'Low' | 'Moderate' | 'High' = 'Low';

    // 1. Water source evaluation (Hepatitis A & E enteric transmission)
    if (waterSource === 'open_well_untreated' || waterSource === 'municipal_tap') {
      riskScore += 25;
      flags.push('Unfiltered or untreated drinking water significantly raises exposure to Hepatitis A and Hepatitis E.');
      recommendedTests.push('IgM anti-HAV & IgM anti-HEV blood tests');
    }

    // 2. Food habit evaluation (Shellfish, undercooked pork, street vendors)
    if (foodHabit === 'raw_shellfish') {
      riskScore += 30;
      flags.push('Raw or undercooked shellfish (clams, oysters) is a primary vector for acute Hepatitis A.');
      recommendedTests.push('Hepatitis A Serology');
    } else if (foodHabit === 'pork_or_game') {
      riskScore += 30;
      flags.push('Undercooked pork or liver meat carries zoonotic Hepatitis E (Genotype 3/4).');
      recommendedTests.push('Hepatitis E Serology');
    } else if (foodHabit === 'regular_street_food') {
      riskScore += 18;
      flags.push('Frequent street food in unhygienic conditions increases fecal-oral enteric pathogen risk.');
    }

    // 3. Drinking habit schedule
    if (drinkingPattern === 'daily_habitual' || alcoholUnits > 14) {
      riskScore += 35;
      flags.push(`Heavy or regular alcohol intake (${alcoholUnits} units/wk) causes toxic hepatocyte injury and accelerates fibrosis.`);
    } else if (drinkingPattern === 'weekend_binge') {
      riskScore += 20;
      flags.push('Binge drinking triggers acute metabolic stress and liver steatosis.');
    }

    // 4. Binge eating & Fatty Liver (NAFLD/MASLD) Detection
    if (bingeEating === 'frequent' || bingeEating === 'severe') {
      riskScore += 25;
      fattyLiverRisk = 'High';
      flags.push('Frequent binge eating / late-night ultra-processed calorie spikes detected: High probability of Hepatic Steatosis (Fatty Liver). Overloads de novo lipogenesis.');
      recommendedTests.push('Ultrasound Abdomen & FibroScan Controlled Attenuation Parameter (CAP)');
    } else if (bingeEating === 'occasional') {
      riskScore += 10;
      fattyLiverRisk = 'Moderate';
      flags.push('Occasional binge eating detected; monitor postprandial glucose and hepatic lipid accumulation.');
    }

    // 5. Sleep duration & Circadian hepatic health
    if (sleepHours < 6 || sleepQuality === 'night_shift') {
      riskScore += 18;
      flags.push('Sleep deprivation (<6h) or circadian shift work impairs nighttime hepatic lipid clearance and downregulates metabolic repair enzymes.');
    } else if (sleepHours >= 7 && sleepHours <= 8) {
      riskScore = Math.max(5, riskScore - 5); // Restorative bonus
    }

    // 6. Hepatitis Vaccination Status
    if (vaccineStatus === 'unvaccinated' || vaccineStatus === 'unknown') {
      riskScore += 20;
      flags.push('CRITICAL PRECAUTION: Unvaccinated for Hepatitis. Risk of acute viral superinfection that can precipitate hepatic decompensation.');
      recommendedTests.push('Urgent Hepatitis A & Hepatitis B Vaccination Series');
    }

    // 7. Chronic Medical History & Medications (Diabetes, Cardiac, DILI)
    if (chronicMeds.diabetes) {
      riskScore += 18;
      fattyLiverRisk = fattyLiverRisk === 'Low' ? 'Moderate' : 'High';
      flags.push('Type 2 Diabetes / Insulin Resistance synergizes with liver disease, drastically accelerating fibrosis progression.');
      recommendedTests.push('HbA1c & Fasting Insulin');
    }
    if (chronicMeds.cardiac) {
      riskScore += 12;
      flags.push('Cardiac / Hypertension history: regular cardiovascular-hepatic monitoring advised for statin safety and vascular health.');
    }
    if (chronicMeds.paracetamol) {
      riskScore += 20;
      flags.push('High-dose paracetamol (>2g/day) risks acute acetaminophen hepatotoxicity.');
    }
    if (chronicMeds.herbalRemedies) {
      riskScore += 18;
      flags.push('Unregulated Ayurvedic churnas, fat-burners, or unmonitored herbal remedies carry high Drug-Induced Liver Injury (DILI) risk.');
    }

    // 8. Symptoms
    const symptomCount = Object.values(symptoms).filter(Boolean).length;
    if (symptoms.jaundice || symptoms.darkUrine) {
      riskScore += 35;
      flags.push('EMERGENCY: Jaundice or dark urine indicates acute cholestasis / hyperbilirubinemia. Immediate clinical consult required.');
      recommendedTests.push('Immediate Serum Bilirubin & Emergency LFT');
    }
    if (symptoms.rightRibPain) {
      riskScore += 15;
      flags.push('Right Upper Quadrant pain indicates acute hepatic swelling stretching Glisson’s capsule.');
    }

    const urgencyLevel = riskScore >= 65 || symptoms.jaundice ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low';

    return {
      riskScore: Math.min(100, riskScore),
      urgencyLevel,
      fattyLiverRisk,
      flags,
      recommendedTests,
      symptomCount,
    };
  };

  const result = calculateSelfAssessment();

  // Synchronize with global what-if workspace & digital twin
  const handleApplyHabitsToTwin = () => {
    updateWhatIf({
      alcoholUnitsPerWeek: alcoholUnits,
      dietQualityScore: foodHabit === 'home_cooked' ? 85 : foodHabit === 'regular_street_food' ? 45 : 35,
      sleepHoursPerDay: sleepHours,
      bingeEatingHabit: bingeEating === 'severe' || bingeEating === 'frequent' ? 'frequent' : bingeEating === 'occasional' ? 'occasional' : 'never',
      vaccinationStatus: vaccineStatus === 'unknown' ? 'unvaccinated' : vaccineStatus,
      hasDiabetesHistory: chronicMeds.diabetes,
      hasCardiacHistory: chronicMeds.cardiac,
      takesRegularMedications: chronicMeds.diabetes || chronicMeds.cardiac,
    });
  };

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 shadow-none space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-accent-secondary" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-clinical-textPrimary">
              Independent Patient Self-Assessment Questionnaire
            </h3>
            <p className="text-xxs text-clinical-textSecondary">
              Evaluates drinking water, diet, binge eating (fatty liver risk), sleep duration, hepatitis vaccination & medical history
            </p>
          </div>
        </div>
        <span className="text-xxs font-bold px-2 py-0.5 rounded-sharp bg-teal-50 text-teal-800 border border-teal-200">
          CONFIDENTIAL PATIENT PORTAL
        </span>
      </div>

      {/* 8-Section Questionnaire Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Question 1: Water Source */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Primary Drinking Water Source</span>
          </label>
          <div className="space-y-1.5 text-xxs">
            {[
              { id: 'ro_filtered', label: 'RO / UV Purified Water (Safe, treated)' },
              { id: 'boiled', label: 'Boiled Tap Water (Safe from enteric viruses)' },
              { id: 'municipal_tap', label: 'Direct Tap Water / Municipal Unfiltered' },
              { id: 'open_well_untreated', label: 'Untreated Well / Borewell (High HAV/HEV Risk)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded-sharp border cursor-pointer transition-colors ${
                  waterSource === opt.id
                    ? 'bg-blue-50/70 border-blue-400 text-blue-900 font-bold'
                    : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="waterSource"
                  checked={waterSource === opt.id}
                  onChange={() => setWaterSource(opt.id as any)}
                  className="accent-accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 2: Food & Ingestion Habit */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Typical Dining & Street Food Habit</span>
          </label>
          <div className="space-y-1.5 text-xxs">
            {[
              { id: 'home_cooked', label: 'Fresh Home-Cooked Indian Meals (Low risk)' },
              { id: 'regular_street_food', label: 'Frequent Street Food / Chaat (>3 times/week)' },
              { id: 'raw_shellfish', label: 'Raw Shellfish / Raw Seafood (Hep A vector)' },
              { id: 'pork_or_game', label: 'Undercooked Pork / Liver Sausages (Hep E vector)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded-sharp border cursor-pointer transition-colors ${
                  foodHabit === opt.id
                    ? 'bg-amber-50/70 border-amber-400 text-amber-900 font-bold'
                    : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="foodHabit"
                  checked={foodHabit === opt.id}
                  onChange={() => setFoodHabit(opt.id as any)}
                  className="accent-accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 3: Binge Eating Habit (Fatty Liver Detection) */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-rose-600" />
              <span>3. Binge Eating & Late-Night Snacking</span>
            </span>
            <span className="text-[10px] text-rose-800 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              FATTY LIVER / STEATOSIS CHECK
            </span>
          </label>
          <div className="space-y-1.5 text-xxs">
            {[
              { id: 'never', label: 'No Binge Eating (Controlled meal portions, no late-night binging)' },
              { id: 'occasional', label: 'Occasional Late-Night Heavy Meals (1-2 times/week)' },
              { id: 'frequent', label: 'Frequent Binge Eating / Uncontrolled Heavy Snacks (>3 times/week)' },
              { id: 'severe', label: 'Severe Ultra-Processed / Sugary Binging (High Steatosis Risk)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded-sharp border cursor-pointer transition-colors ${
                  bingeEating === opt.id
                    ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                    : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="bingeEating"
                  checked={bingeEating === opt.id}
                  onChange={() => setBingeEating(opt.id as any)}
                  className="accent-rose-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 4: Sleep Duration & Circadian Rest */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Sleep Duration & Circadian Quality</span>
            </span>
            <span className="text-[10px] text-indigo-800 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              HEPATIC REPAIR FACTOR
            </span>
          </label>
          <div className="space-y-2 text-xxs">
            <div className="flex justify-between items-center bg-white p-2 border border-clinical-borderSubtle rounded-sharp">
              <span className="font-semibold text-clinical-textPrimary">Average Sleep Hours / Night:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-28 accent-indigo-600 cursor-pointer"
                />
                <span className="font-bold text-indigo-900 w-12 text-right">{sleepHours} hrs</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1">
              {[
                { id: 'regular', label: 'Regular Night Sleep' },
                { id: 'disrupted', label: 'Interrupted Sleep' },
                { id: 'night_shift', label: 'Night Shift Work' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSleepQuality(opt.id as any)}
                  className={`p-1.5 rounded-sharp border text-center transition-colors ${
                    sleepQuality === opt.id
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-950 font-bold'
                      : 'bg-white border-clinical-borderSubtle text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question 5: Alcohol Consumption */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center gap-1.5">
            <Wine className="w-3.5 h-3.5 text-purple-600" />
            <span>5. Alcohol Consumption Schedule</span>
          </label>
          <div className="space-y-1.5 text-xxs">
            {[
              { id: 'never', label: 'Complete Teetotaler / 100% Abstinent (Zero alcohol)' },
              { id: 'social_monthly', label: 'Occasional Social (1-2 drinks/month)' },
              { id: 'weekend_binge', label: 'Weekend Binge (3-6 drinks in single sitting)' },
              { id: 'daily_habitual', label: 'Daily or Regular Habitual Drinking' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded-sharp border cursor-pointer transition-colors ${
                  drinkingPattern === opt.id
                    ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold'
                    : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="drinkingPattern"
                  checked={drinkingPattern === opt.id}
                  onChange={() => {
                    setDrinkingPattern(opt.id as any);
                    if (opt.id === 'never') setAlcoholUnits(0);
                    else if (opt.id === 'social_monthly') setAlcoholUnits(2);
                    else if (opt.id === 'weekend_binge') setAlcoholUnits(8);
                    else setAlcoholUnits(18);
                  }}
                  className="accent-accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {drinkingPattern !== 'never' && (
            <div className="pt-2 border-t border-clinical-borderSubtle flex items-center justify-between text-xxs">
              <span className="text-clinical-textSecondary">Specific Units/Week:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={alcoholUnits}
                onChange={(e) => setAlcoholUnits(Number(e.target.value))}
                className="w-20 border border-clinical-borderStrong rounded-sharp p-1 text-center font-bold text-clinical-textPrimary"
              />
            </div>
          )}
        </div>

        {/* Question 6: Hepatitis Vaccination Status */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-teal-600" />
              <span>6. Hepatitis Vaccination Status</span>
            </span>
            <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
              IMMUNIZATION CHECK
            </span>
          </label>
          <div className="space-y-1.5 text-xxs">
            {[
              { id: 'fully_vaccinated', label: 'Fully Vaccinated for Hep A & B (Completed full 3-dose series)' },
              { id: 'partially_vaccinated', label: 'Partially Vaccinated (Received 1 or 2 doses, booster pending)' },
              { id: 'unvaccinated', label: 'Unvaccinated for Hepatitis B & A (No protection)' },
              { id: 'unknown', label: 'Unknown / Never Tested for Hepatitis Antibodies' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded-sharp border cursor-pointer transition-colors ${
                  vaccineStatus === opt.id
                    ? 'bg-teal-50/70 border-teal-400 text-teal-950 font-bold'
                    : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="vaccineStatus"
                  checked={vaccineStatus === opt.id}
                  onChange={() => setVaccineStatus(opt.id as any)}
                  className="accent-accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 7: Chronic Medical History & Prescription Medications */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2 md:col-span-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              <span>7. Medical History & Regular Prescription Drugs (Diabetes, Cardiac, DILI Risks)</span>
            </span>
            <span className="text-xxs font-normal text-clinical-textMuted">CHECK ALL THAT APPLY</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xxs">
            <label className={`flex items-start gap-2 p-2 rounded-sharp border cursor-pointer ${chronicMeds.diabetes ? 'bg-amber-50 border-amber-400 font-bold text-amber-950' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={chronicMeds.diabetes}
                onChange={(e) => setChronicMeds({ ...chronicMeds, diabetes: e.target.checked })}
                className="accent-amber-600 mt-0.5"
              />
              <div>
                <span className="block font-bold">Type 2 Diabetes</span>
                <span className="text-[10px] text-slate-500">Metformin, SGLT2i, Insulin</span>
              </div>
            </label>

            <label className={`flex items-start gap-2 p-2 rounded-sharp border cursor-pointer ${chronicMeds.cardiac ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-950' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={chronicMeds.cardiac}
                onChange={(e) => setChronicMeds({ ...chronicMeds, cardiac: e.target.checked })}
                className="accent-indigo-600 mt-0.5"
              />
              <div>
                <span className="block font-bold">Cardiac / BP History</span>
                <span className="text-[10px] text-slate-500">Statins, Beta Blockers, ACEi</span>
              </div>
            </label>

            <label className={`flex items-start gap-2 p-2 rounded-sharp border cursor-pointer ${chronicMeds.paracetamol ? 'bg-rose-50 border-rose-400 font-bold text-rose-950' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={chronicMeds.paracetamol}
                onChange={(e) => setChronicMeds({ ...chronicMeds, paracetamol: e.target.checked })}
                className="accent-rose-600 mt-0.5"
              />
              <div>
                <span className="block font-bold">High Paracetamol/NSAIDs</span>
                <span className="text-[10px] text-slate-500">&gt;2g/day or regular Brufen</span>
              </div>
            </label>

            <label className={`flex items-start gap-2 p-2 rounded-sharp border cursor-pointer ${chronicMeds.herbalRemedies ? 'bg-red-50 border-red-400 font-bold text-red-950' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={chronicMeds.herbalRemedies}
                onChange={(e) => setChronicMeds({ ...chronicMeds, herbalRemedies: e.target.checked })}
                className="accent-red-600 mt-0.5"
              />
              <div>
                <span className="block font-bold">Untested Churnas/Herbs</span>
                <span className="text-[10px] text-slate-500">Desi kaadha, gym fat-burners</span>
              </div>
            </label>
          </div>
        </div>

        {/* Question 8: Physical Symptoms Self-Check */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2 md:col-span-2">
          <label className="font-bold text-xs text-clinical-textPrimary flex items-center justify-between">
            <span>8. Physical Symptoms Self-Check</span>
            <span className="text-xxs font-normal text-clinical-textMuted">CHECK ALL THAT APPLY</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xxs">
            <label className={`p-2 rounded-sharp border cursor-pointer transition-colors ${symptoms.jaundice ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={symptoms.jaundice}
                onChange={(e) => setSymptoms({ ...symptoms, jaundice: e.target.checked })}
                className="mr-1.5 accent-amber-600"
              />
              <span>Yellow Eyes or Skin (Jaundice)</span>
            </label>

            <label className={`p-2 rounded-sharp border cursor-pointer transition-colors ${symptoms.darkUrine ? 'bg-amber-100 border-amber-400 font-bold text-amber-900' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={symptoms.darkUrine}
                onChange={(e) => setSymptoms({ ...symptoms, darkUrine: e.target.checked })}
                className="mr-1.5 accent-amber-600"
              />
              <span>Dark Tea-Colored Urine</span>
            </label>

            <label className={`p-2 rounded-sharp border cursor-pointer transition-colors ${symptoms.paleStool ? 'bg-slate-200 border-slate-400 font-bold text-slate-900' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={symptoms.paleStool}
                onChange={(e) => setSymptoms({ ...symptoms, paleStool: e.target.checked })}
                className="mr-1.5 accent-slate-600"
              />
              <span>Pale / Clay Stools</span>
            </label>

            <label className={`p-2 rounded-sharp border cursor-pointer transition-colors ${symptoms.rightRibPain ? 'bg-red-100 border-red-400 font-bold text-red-900' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={symptoms.rightRibPain}
                onChange={(e) => setSymptoms({ ...symptoms, rightRibPain: e.target.checked })}
                className="mr-1.5 accent-red-600"
              />
              <span>Right Upper Rib Pain</span>
            </label>

            <label className={`p-2 rounded-sharp border cursor-pointer transition-colors ${symptoms.severeFatigue ? 'bg-purple-100 border-purple-400 font-bold text-purple-900' : 'bg-white border-clinical-borderSubtle'}`}>
              <input
                type="checkbox"
                checked={symptoms.severeFatigue}
                onChange={(e) => setSymptoms({ ...symptoms, severeFatigue: e.target.checked })}
                className="mr-1.5 accent-purple-600"
              />
              <span>Severe Daytime Fatigue</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dynamic Results Card & Action Panel */}
      <div className="p-3.5 bg-slate-50 border border-clinical-borderStrong rounded-sharp space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-clinical-borderSubtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-secondary" />
            <span className="font-bold text-clinical-textPrimary uppercase">
              Evaluation Result & Clinical Risk Classification
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xxs text-clinical-textSecondary">Fatty Liver Possibility:</span>
              <span className={`px-2 py-0.5 rounded-sharp font-bold text-xxs uppercase ${
                result.fattyLiverRisk === 'High'
                  ? 'bg-red-100 text-status-critical border border-red-300'
                  : result.fattyLiverRisk === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-status-normal border border-emerald-300'
              }`}>
                {result.fattyLiverRisk} Risk
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xxs text-clinical-textSecondary">Overall Urgency:</span>
              <span
                className={`px-2.5 py-0.5 rounded-sharp font-bold text-xxs uppercase ${
                  result.urgencyLevel === 'High'
                    ? 'bg-status-critical text-white'
                    : result.urgencyLevel === 'Moderate'
                    ? 'bg-status-caution text-white'
                    : 'bg-status-normal text-white'
                }`}
              >
                {result.urgencyLevel} Urgency ({result.riskScore}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Flags */}
        {result.flags.length > 0 && (
          <div className="space-y-1.5 text-xxs">
            <span className="font-bold text-clinical-textPrimary block">Diagnostic Findings & Health Alerts:</span>
            <ul className="space-y-1">
              {result.flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Tests */}
        {result.recommendedTests.length > 0 && (
          <div className="pt-2 border-t border-clinical-borderSubtle text-xxs flex flex-wrap items-center gap-2">
            <span className="font-bold text-teal-800">Suggested Laboratory Confirmations:</span>
            {result.recommendedTests.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-white border border-teal-300 text-teal-900 rounded-sharp font-semibold">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Synchronize Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleApplyHabitsToTwin}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-sharp font-bold text-xs transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Habits & Interventions to Live Twin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
