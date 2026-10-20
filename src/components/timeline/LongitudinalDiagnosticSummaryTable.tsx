// src/components/timeline/LongitudinalDiagnosticSummaryTable.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Building2 } from 'lucide-react';

export const LongitudinalDiagnosticSummaryTable: React.FC = () => {
  const { getActivePersona } = useTwinStore();
  const persona = getActivePersona();

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 text-xs font-mono">
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-clinical-borderSubtle">
        <Building2 className="w-4 h-4 text-accent-secondary" />
        <h3 className="font-bold text-clinical-textPrimary uppercase">
          Longitudinal Diagnostic Summary Across {persona.timeline.length} Accredited Labs
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xxs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-clinical-textSecondary border-b border-clinical-borderSubtle">
              <th className="p-2">Visit</th>
              <th className="p-2">Date</th>
              <th className="p-2">Accredited Facility</th>
              <th className="p-2">AST (U/L)</th>
              <th className="p-2">ALT (U/L)</th>
              <th className="p-2">Platelets</th>
              <th className="p-2">FIB-4</th>
              <th className="p-2">APRI</th>
              <th className="p-2">Metavir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clinical-borderSubtle">
            {persona.timeline.map((entry, idx) => (
              <tr 
                key={entry.id} 
                className={`hover:bg-teal-50/50 transition-colors ${
                  entry.monthOffset === 0 ? 'bg-amber-50/40 font-semibold' : ''
                }`}
              >
                <td className="p-2 font-bold text-accent-primary">Lab {idx + 1}</td>
                <td className="p-2">{entry.date}</td>
                <td className="p-2 font-semibold text-clinical-textPrimary">
                  {entry.labName || 'Diagnostic Center'}
                </td>
                <td className="p-2 tabular-nums">{entry.ast}</td>
                <td className="p-2 tabular-nums">{entry.alt}</td>
                <td className="p-2 tabular-nums">{entry.platelets}k</td>
                <td className="p-2 tabular-nums font-bold text-teal-800">{entry.fib4.toFixed(2)}</td>
                <td className="p-2 tabular-nums">{entry.apri.toFixed(2)}</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-sharp bg-slate-100 border border-clinical-borderSubtle font-bold">
                    {entry.metavirStage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
