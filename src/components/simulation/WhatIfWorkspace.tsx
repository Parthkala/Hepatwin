// src/components/simulation/WhatIfWorkspace.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Sliders, RotateCcw, Zap, Moon, Utensils, Activity } from 'lucide-react';

export const WhatIfWorkspace: React.FC = () => {
  const { whatIf, updateWhatIf, resetWhatIf } = useTwinStore();

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-clinical-borderSubtle">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-secondary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            What-If Workspace // Real-time Interventions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xxs font-mono text-slate-400">UPDATES &lt;100ms</span>
          <button
            onClick={resetWhatIf}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sharp border border-clinical-borderSubtle text-xxs font-mono text-clinical-textSecondary hover:text-clinical-textPrimary hover:border-clinical-borderStrong"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* 1. Alcohol Intake */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">Alcohol Intake</span>
            <span
              className={`font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs ${
                whatIf.alcoholUnitsPerWeek > 14
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : whatIf.alcoholUnitsPerWeek > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-status-normal border-emerald-200'
              }`}
            >
              {whatIf.alcoholUnitsPerWeek} units/wk
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={whatIf.alcoholUnitsPerWeek}
            onChange={(e) => updateWhatIf({ alcoholUnitsPerWeek: Number(e.target.value) })}
            className="w-full accent-accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>0 (Abstinent)</span>
            <span>14 (Threshold)</span>
            <span>30+ (Toxic)</span>
          </div>
        </div>

        {/* 2. Antiviral Adherence */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">Antiviral Adherence</span>
            <span
              className={`font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs ${
                whatIf.antiviralAdherencePercent >= 90
                  ? 'bg-emerald-50 text-status-normal border-emerald-200'
                  : whatIf.antiviralAdherencePercent >= 70
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-50 text-status-critical border-red-200'
              }`}
            >
              {whatIf.antiviralAdherencePercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={whatIf.antiviralAdherencePercent}
            onChange={(e) => updateWhatIf({ antiviralAdherencePercent: Number(e.target.value) })}
            className="w-full accent-accent-primary cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>0% (Discontinued)</span>
            <span>80% (Acceptable)</span>
            <span>100% (Sustained)</span>
          </div>
        </div>

        {/* 3. Body Mass Index (BMI) */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">BMI (Metabolic Adiposity)</span>
            <span
              className={`font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs ${
                whatIf.bmi >= 30
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : whatIf.bmi >= 25
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-status-normal border-emerald-200'
              }`}
            >
              {whatIf.bmi.toFixed(1)} kg/m²
            </span>
          </div>
          <input
            type="range"
            min="18.5"
            max="40"
            step="0.5"
            value={whatIf.bmi}
            onChange={(e) => updateWhatIf({ bmi: Number(e.target.value) })}
            className="w-full accent-accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>18.5 (Normal)</span>
            <span>25 (Overweight)</span>
            <span>35+ (Obese)</span>
          </div>
        </div>

        {/* 4. Weekly Exercise Minutes */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">Weekly Exercise</span>
            <span className="font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs bg-slate-100 text-clinical-textPrimary">
              {whatIf.weeklyExerciseMinutes} mins/wk
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="15"
            value={whatIf.weeklyExerciseMinutes}
            onChange={(e) => updateWhatIf({ weeklyExerciseMinutes: Number(e.target.value) })}
            className="w-full accent-accent-primary cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>0 (Sedentary)</span>
            <span>150 (WHO Target)</span>
            <span>300 (Active)</span>
          </div>
        </div>

        {/* 5. Diet Quality Score */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">Anti-Inflammatory Diet</span>
            <span className="font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs bg-slate-100 text-clinical-textPrimary">
              {whatIf.dietQualityScore} / 100
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={whatIf.dietQualityScore}
            onChange={(e) => updateWhatIf({ dietQualityScore: Number(e.target.value) })}
            className="w-full accent-accent-primary cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>10 (Ultra-processed)</span>
            <span>50 (Moderate)</span>
            <span>100 (Mediterranean)</span>
          </div>
        </div>

        {/* 6. Hepatitis B / Superinfection Vaccination */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary">Vaccination / Immunization</span>
            <span className="font-bold text-xxs font-mono uppercase text-teal-700">
              {whatIf.vaccinationStatus.replace('_', ' ')}
            </span>
          </div>
          <select
            value={whatIf.vaccinationStatus}
            onChange={(e) => updateWhatIf({ vaccinationStatus: e.target.value as any })}
            className="w-full bg-white border border-clinical-borderSubtle text-xs font-mono p-1 rounded-sharp text-clinical-textPrimary"
          >
            <option value="fully_vaccinated">Fully Vaccinated (HAV/HBV)</option>
            <option value="partially_vaccinated">Partially Vaccinated (Incomplete series)</option>
            <option value="unvaccinated">Unvaccinated (High-risk exposure)</option>
          </select>
          <div className="text-xxs font-mono text-clinical-textMuted mt-1">
            Prevents acute fulminant Delta or HAV coinfection
          </div>
        </div>

        {/* 7. Sleep Duration & Circadian Repair */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sleep & Circadian Rhythm</span>
            </span>
            <span
              className={`font-bold tabular-nums px-1.5 py-0.2 rounded-sharp border text-xxs ${
                (whatIf.sleepHoursPerDay || 7) < 6
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : (whatIf.sleepHoursPerDay || 7) <= 8.5
                  ? 'bg-emerald-50 text-status-normal border-emerald-200'
                  : 'bg-slate-100 text-clinical-textPrimary border-slate-200'
              }`}
            >
              {whatIf.sleepHoursPerDay || 7} hrs/night
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={whatIf.sleepHoursPerDay || 7}
            onChange={(e) => updateWhatIf({ sleepHoursPerDay: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-sharp"
          />
          <div className="flex justify-between text-xxs font-mono text-clinical-textMuted mt-1">
            <span>4h (Severe Deprivation)</span>
            <span>7.5h (Optimal Repair)</span>
            <span>10h (Extended)</span>
          </div>
        </div>

        {/* 8. Binge Eating & Fatty Liver Trigger */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-rose-600" />
              <span>Binge Eating / Steatosis</span>
            </span>
            <span
              className={`font-bold text-xxs font-mono uppercase px-1.5 py-0.2 rounded-sharp border ${
                whatIf.bingeEatingHabit === 'frequent'
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : whatIf.bingeEatingHabit === 'occasional'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-status-normal border-emerald-200'
              }`}
            >
              {whatIf.bingeEatingHabit || 'Never'}
            </span>
          </div>
          <select
            value={whatIf.bingeEatingHabit || 'never'}
            onChange={(e) => updateWhatIf({ bingeEatingHabit: e.target.value as any })}
            className="w-full bg-white border border-clinical-borderSubtle text-xs font-mono p-1 rounded-sharp text-clinical-textPrimary"
          >
            <option value="never">Never (Portion controlled)</option>
            <option value="occasional">Occasional (1-2x/week)</option>
            <option value="frequent">Frequent (&gt;3x/week - Steatosis Risk)</option>
          </select>
          <div className="text-xxs font-mono text-clinical-textMuted mt-1">
            Overloads de novo lipogenesis and drives hepatic steatosis (NAFLD)
          </div>
        </div>

        {/* 9. Medical History & Chronic Comorbidities */}
        <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="font-semibold text-clinical-textPrimary flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Chronic Comorbidities</span>
            </span>
            <span className="text-xxs text-slate-500 font-mono">
              {whatIf.hasDiabetesHistory ? 'Diabetes Active' : 'No Diabetes'}
            </span>
          </div>
          <div className="space-y-1.5 pt-1 text-xxs font-mono">
            <label className="flex items-center gap-2 cursor-pointer bg-white p-1 rounded border border-clinical-borderSubtle">
              <input
                type="checkbox"
                checked={whatIf.hasDiabetesHistory || false}
                onChange={(e) => updateWhatIf({ hasDiabetesHistory: e.target.checked })}
                className="accent-amber-600"
              />
              <span>Type 2 Diabetes (Accelerates Fibrosis)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white p-1 rounded border border-clinical-borderSubtle">
              <input
                type="checkbox"
                checked={whatIf.hasCardiacHistory || false}
                onChange={(e) => updateWhatIf({ hasCardiacHistory: e.target.checked })}
                className="accent-indigo-600"
              />
              <span>Cardiac / Hypertension Regimen</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
