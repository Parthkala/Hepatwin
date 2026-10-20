// src/components/timeline/TimelineScrubber.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { History, Calendar, CheckCircle2, ChevronRight, FileSpreadsheet, Building2 } from 'lucide-react';

export const TimelineScrubber: React.FC = () => {
  const { getActivePersona, timelineIndex, setTimelineIndex } = useTwinStore();
  const persona = getActivePersona();
  const timeline = persona.timeline;

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            Longitudinal Diagnostic Timeline // {timeline.length} Accredited Diagnostic Labs
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xxs font-mono text-clinical-textMuted">
          <span className="px-1.5 py-0.5 bg-slate-100 rounded-sharp border border-clinical-borderSubtle text-clinical-textSecondary font-bold">
            {timelineIndex + 1} of {timeline.length} Labs
          </span>
          <span>SCRUB TO RECALCULATE LIVE TWIN STATE</span>
        </div>
      </div>

      {/* Scrub Controls & Stepper */}
      <div className="space-y-3">
        {/* Timeline Slider Track */}
        <div className="px-1">
          <input
            type="range"
            min="0"
            max={timeline.length - 1}
            step="1"
            value={timelineIndex}
            onChange={(e) => setTimelineIndex(Number(e.target.value))}
            className="w-full accent-accent-primary cursor-pointer h-2 bg-slate-200 rounded-sharp"
          />
          {/* Dynamic Lab Milestones */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-flow-col md:auto-cols-fr gap-1 text-xxs font-mono text-clinical-textSecondary mt-2"
          >
            {timeline.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setTimelineIndex(idx)}
                className={`p-1.5 rounded-sharp border text-left transition-all ${
                  timelineIndex === idx
                    ? 'bg-teal-50 border-accent-primary text-teal-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-clinical-borderSubtle hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-accent-primary">Lab {idx + 1}</span>
                  <span className="text-clinical-textMuted">{item.monthOffset === 0 ? 'Now' : `M${item.monthOffset}`}</span>
                </div>
                <div className="text-[10px] text-clinical-textPrimary truncate mt-0.5">
                  {item.date}
                </div>
                <div className="text-[9px] text-clinical-textMuted truncate">
                  FIB-4: {item.fib4.toFixed(2)} ({item.metavirStage})
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Historical Milestone Detail Card */}
        {timeline[timelineIndex] && (
          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                <span className="font-bold text-clinical-textPrimary text-xs">
                  {timeline[timelineIndex].eventTitle}
                </span>
                <span className="text-xxs px-1.5 py-0.2 bg-white border border-clinical-borderSubtle rounded-sharp uppercase font-bold text-teal-800">
                  {timeline[timelineIndex].date}
                </span>
              </div>

              {/* Lab Accreditation Name */}
              {timeline[timelineIndex].labName && (
                <div className="flex items-center gap-1.5 text-xxs text-clinical-textSecondary font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                  <span>Facility: {timeline[timelineIndex].labName}</span>
                </div>
              )}

              <p className="text-xxs text-clinical-textSecondary leading-relaxed">
                {timeline[timelineIndex].summary}
              </p>
            </div>

            {/* Historical Snapshot Metrics & Calculations */}
            <div className="flex items-center gap-3 shrink-0 bg-white p-2.5 border border-clinical-borderSubtle rounded-sharp text-xxs">
              <div>
                <span className="text-clinical-textMuted block text-[10px]">HISTORICAL FIB-4:</span>
                <span className="font-bold text-clinical-textPrimary text-xs tabular-nums">
                  {timeline[timelineIndex].fib4.toFixed(2)}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-clinical-textMuted block text-[10px]">APRI:</span>
                <span className="font-bold text-clinical-textPrimary text-xs tabular-nums">
                  {timeline[timelineIndex].apri.toFixed(2)}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-clinical-textMuted block text-[10px]">STAGE:</span>
                <span className="font-bold text-accent-secondary text-xs">
                  {timeline[timelineIndex].metavirStage}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-clinical-textMuted block text-[10px]">ALT / AST / PLT:</span>
                <span className="font-bold text-clinical-textPrimary text-xs tabular-nums">
                  {timeline[timelineIndex].alt} / {timeline[timelineIndex].ast} / {timeline[timelineIndex].platelets}k
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
