// src/components/explainability/ExplainabilityPanel.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { BarChart3, HelpCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const ExplainabilityPanel: React.FC = () => {
  const { getFeatureAttribution } = useTwinStore();
  const { drivers, topDriverSentence } = getFeatureAttribution();

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-primary" />
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
              Explainability // AI TreeSHAP Risk Driver Attribution
            </h2>
            <div className="text-[10px] text-teal-700 font-semibold font-mono">
              ENGINE: GRADIENT BOOSTED TREE-SHAP (4,000 ICMR/NHANES COHORTS)
            </div>
          </div>
        </div>
        <span className="text-xxs font-mono text-clinical-textMuted uppercase">
          STIFFNESS IMPACT (Δ kPa)
        </span>
      </div>

      {/* Top Driver Headline Box */}
      <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp mb-3 flex items-center gap-2 text-xs font-mono">
        <div className="w-1.5 h-6 bg-accent-secondary rounded-sharp shrink-0" />
        <p className="text-clinical-textPrimary font-semibold">{topDriverSentence}</p>
      </div>

      {/* Horizontal Bar Chart of Drivers */}
      <div className="space-y-2 flex-1">
        {drivers.map((d) => {
          const isAccelerating = d.direction === 'accelerating';
          return (
            <div key={d.featureKey} className="text-xxs font-mono">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-semibold text-clinical-textPrimary">{d.featureLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-clinical-textSecondary">{d.valueDisplay}</span>
                  <span
                    className={`font-bold tabular-nums px-1 py-0.2 rounded-sharp border ${
                      isAccelerating
                        ? 'text-status-critical bg-red-50 border-red-200'
                        : 'text-status-normal bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {isAccelerating ? `+${d.shapScore}` : d.shapScore} ({d.percentage}%)
                  </span>
                </div>
              </div>

              {/* Stacked Horizontal Contribution Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-sharp overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-200 rounded-sharp ${
                    isAccelerating ? 'bg-status-critical' : 'bg-status-normal'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, d.percentage))}%` }}
                />
              </div>

              <div className="text-xxs text-clinical-textMuted mt-0.5 truncate" title={d.clinicalDetail}>
                {d.clinicalDetail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
