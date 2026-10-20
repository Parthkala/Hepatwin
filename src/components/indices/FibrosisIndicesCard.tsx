// src/components/indices/FibrosisIndicesCard.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Calculator, Info, ExternalLink } from 'lucide-react';

export const FibrosisIndicesCard: React.FC = () => {
  const { getFibrosisMetrics, getActivePersona } = useTwinStore();
  const metrics = getFibrosisMetrics();
  const persona = getActivePersona();

  const [hoveredIndex, setHoveredIndex] = useState<'fib4' | 'apri' | null>(null);

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            Computed Non-Invasive Fibrosis Indices
          </h2>
        </div>
        <span className="text-xxs font-mono text-clinical-textMuted">HOVER FOR FORMULA</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* FIB-4 Card */}
        <div
          onMouseEnter={() => setHoveredIndex('fib4')}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp hover:border-clinical-borderStrong transition-all cursor-help"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-clinical-textPrimary">FIB-4 INDEX</span>
            <span
              className={`text-xxs font-mono px-1.5 py-0.5 rounded-sharp font-bold border ${
                metrics.fib4Category === 'high'
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : metrics.fib4Category === 'indeterminate'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-status-normal border-emerald-200'
              }`}
            >
              {metrics.fib4Category.toUpperCase()} RISK
            </span>
          </div>

          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-clinical-textPrimary">
              {metrics.fib4.toFixed(2)}
            </span>
            <span className="text-xxs font-mono text-clinical-textMuted">
              {metrics.fib4 < 1.30 ? '< 1.30 (Rule-out)' : metrics.fib4 <= 3.25 ? '1.30 - 3.25 (Indeterminate)' : '> 3.25 (Rule-in)'}
            </span>
          </div>

          <div className="text-xxs font-mono text-clinical-textSecondary">
            Predictive value: {metrics.fib4 < 1.30 ? 'NPV >90% for advanced fibrosis' : metrics.fib4 > 3.25 ? 'PPV >65% for F3-F4 bridging/cirrhosis' : 'Requires VCTE FibroScan confirmation'}
          </div>

          {/* Hover Formula Tooltip */}
          {hoveredIndex === 'fib4' && (
            <div className="absolute z-20 bottom-full left-0 mb-2 w-80 p-2.5 bg-ink text-white text-xxs font-mono rounded-sharp shadow-lg border border-ink-border">
              <div className="font-bold text-teal-300 mb-1">FIB-4 FORMULA (Sterling et al. 2006):</div>
              <div className="bg-ink-light p-1.5 rounded-sharp border border-ink-border text-center text-xs text-amber-300 font-semibold mb-1">
                (Age × AST) ÷ (Platelets [10⁹/L] × √ALT)
              </div>
              <div className="text-slate-300 leading-relaxed">
                Calculated: ({persona.age} × AST) ÷ (PLT × √ALT) = <span className="text-white font-bold">{metrics.fib4}</span>
              </div>
            </div>
          )}
        </div>

        {/* APRI Card */}
        <div
          onMouseEnter={() => setHoveredIndex('apri')}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp hover:border-clinical-borderStrong transition-all cursor-help"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-clinical-textPrimary">APRI SCORE</span>
            <span
              className={`text-xxs font-mono px-1.5 py-0.5 rounded-sharp font-bold border ${
                metrics.apriCategory === 'high'
                  ? 'bg-red-50 text-status-critical border-red-200'
                  : metrics.apriCategory === 'indeterminate'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-status-normal border-emerald-200'
              }`}
            >
              {metrics.apriCategory.toUpperCase()} RISK
            </span>
          </div>

          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-clinical-textPrimary">
              {metrics.apri.toFixed(2)}
            </span>
            <span className="text-xxs font-mono text-clinical-textMuted">
              {metrics.apri < 0.5 ? '< 0.50 (Low risk)' : metrics.apri <= 1.5 ? '0.50 - 1.50 (Intermediate)' : '> 1.50 (High F2-F4 risk)'}
            </span>
          </div>

          <div className="text-xxs font-mono text-clinical-textSecondary">
            {metrics.apri > 1.5 ? 'Significant risk of bridging fibrosis / cirrhosis' : 'Low probability of significant fibrosis (Metavir < F2)'}
          </div>

          {/* Hover Formula Tooltip */}
          {hoveredIndex === 'apri' && (
            <div className="absolute z-20 bottom-full right-0 mb-2 w-80 p-2.5 bg-ink text-white text-xxs font-mono rounded-sharp shadow-lg border border-ink-border">
              <div className="font-bold text-teal-300 mb-1">APRI FORMULA (Wai et al. 2003):</div>
              <div className="bg-ink-light p-1.5 rounded-sharp border border-ink-border text-center text-xs text-amber-300 font-semibold mb-1">
                ((AST / AST_ULN) / Platelets [10⁹/L]) × 100
              </div>
              <div className="text-slate-300 leading-relaxed">
                AST ULN standardized to 40 U/L per ICMR guidelines. Calculated APRI = <span className="text-white font-bold">{metrics.apri}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
