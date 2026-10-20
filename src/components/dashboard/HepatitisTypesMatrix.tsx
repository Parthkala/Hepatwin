// src/components/dashboard/HepatitisTypesMatrix.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { evaluateAllHepatitisTypes, HepatitisTypeAssessment } from '../../model/hepatitisTypes';
import { Activity, ShieldAlert, ShieldCheck, AlertCircle, Info, Stethoscope, ChevronRight } from 'lucide-react';

export const HepatitisTypesMatrix: React.FC = () => {
  const { getActivePersona, whatIf } = useTwinStore();
  const persona = getActivePersona();
  const bio = persona.baselineBiomarkers;

  const [selectedType, setSelectedType] = useState<string>('HDV');

  const assessments = evaluateAllHepatitisTypes(
    persona.hepatitisType,
    persona.age,
    bio.alt.value,
    bio.ast.value,
    bio.platelets.value,
    bio.viralLoad.value,
    whatIf,
    persona.hepatitisType.includes('Hepatitis B')
  );

  const activeAssessment = assessments.find((a) => a.code === selectedType) || assessments[0];

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-50 text-status-critical border-red-300';
      case 'Moderate':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-50 text-status-normal border-emerald-300';
    }
  };

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 shadow-none space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-primary" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-clinical-textPrimary">
            Multi-Viral Hepatitis Matrix // Types A, B, C, D, E, DILI & NASH
          </h3>
        </div>
        <span className="text-xxs text-clinical-textMuted">
          DIFFERENTIAL DIAGNOSIS & EXPOSURE TRIAGE
        </span>
      </div>

      {/* Grid of all 7 Hepatitis Etiologies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2">
        {assessments.map((item) => {
          const isSelected = selectedType === item.code;
          return (
            <button
              key={item.code}
              onClick={() => setSelectedType(item.code)}
              className={`p-2.5 rounded-sharp border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-accent-primary bg-teal-50/50 shadow-sm'
                  : 'border-clinical-borderSubtle bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-clinical-textPrimary">
                    Type {item.code}
                  </span>
                  <span className={`text-xxs px-1.5 py-0.2 rounded-sharp border font-bold uppercase ${getBadgeStyle(item.riskLevel)}`}>
                    {item.riskLevel}
                  </span>
                </div>
                <div className="text-xxs text-clinical-textSecondary truncate font-medium">
                  {item.type}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-clinical-borderSubtle flex items-baseline justify-between">
                <span className="text-xxs text-clinical-textMuted">Risk Prob:</span>
                <span className="font-bold text-xs tabular-nums text-clinical-textPrimary">
                  {item.probabilityPercentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Hepatitis Deep-Dive Clinical Card */}
      <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-clinical-borderSubtle">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-clinical-textPrimary">
              {activeAssessment.type}
            </span>
            <span className={`text-xxs px-2 py-0.5 rounded-sharp border font-bold uppercase ${getBadgeStyle(activeAssessment.riskLevel)}`}>
              {activeAssessment.riskLevel} Risk ({activeAssessment.probabilityPercentage}%)
            </span>
          </div>
          <span className="text-xxs text-clinical-textMuted">
            Transmission: {activeAssessment.transmissionMode}
          </span>
        </div>

        {/* Clinical Rationale & Trigger Drivers */}
        <div className="space-y-1">
          <span className="text-xxs font-bold text-clinical-textSecondary uppercase block">
            Etiological Drivers & Clinical Triggers:
          </span>
          <ul className="text-xxs space-y-1 list-disc list-inside text-clinical-textPrimary">
            {activeAssessment.triggerReasons.map((reason, idx) => (
              <li key={idx} className="leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Clinical Action */}
        <div className="pt-2 border-t border-clinical-borderSubtle flex items-start gap-2 text-xxs">
          <span className="font-bold text-teal-800 uppercase shrink-0 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-accent-primary" />
            Physician Protocol:
          </span>
          <span className="text-clinical-textPrimary font-semibold">
            {activeAssessment.clinicalAction}
          </span>
        </div>
      </div>
    </div>
  );
};
