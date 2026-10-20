// src/components/trajectory/TrajectoryChart.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export const TrajectoryChart: React.FC = () => {
  const { getTrajectory, getFibrosisMetrics } = useTwinStore();
  const { points, headline, driverImpact } = getTrajectory();
  const metrics = getFibrosisMetrics();

  // Custom Clinical Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-ink border border-ink-border text-white p-2.5 rounded-sharp font-mono text-xxs shadow-md">
          <div className="font-bold text-teal-300 border-b border-ink-border pb-1 mb-1">
            PROJECTED TIMELINE: +{label} MONTHS
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Projected Fibrosis Score:</span>
              <span className="text-amber-400 font-bold">{data.projectedScore}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">95% Confidence Band:</span>
              <span className="text-slate-200">
                {data.ci95Lower} - {data.ci95Upper}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">80% Confidence Band:</span>
              <span className="text-slate-200">
                {data.ci80Lower} - {data.ci80Upper}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-ink-border">
              <span className="text-slate-400">Metavir Prediction:</span>
              <span className="text-white font-bold">{data.stageLabel}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            Trajectory Forecast // 12-60 Month Projected Fibrosis Score
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xxs font-mono">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-accent-primary inline-block" />
            <span className="text-clinical-textSecondary">Actual / Baseline</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-accent-secondary inline-block" />
            <span className="text-clinical-textSecondary">Projected (What-If)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-slate-300/40 inline-block rounded-sharp" />
            <span className="text-clinical-textSecondary">80% / 95% CI</span>
          </span>
        </div>
      </div>

      {/* Trajectory Recharts Graph */}
      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E2E6EA" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#7A8C9E"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(m) => `M+${m}`}
            />
            <YAxis
              domain={[0, 6]}
              stroke="#7A8C9E"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              ticks={[1.30, 2.20, 3.25, 4.50]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Metavir Cutoff Reference Lines */}
            <ReferenceLine
              y={3.25}
              stroke="#C8102E"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: 'F3/F4 Cutoff (3.25)',
                position: 'right',
                fill: '#C8102E',
                fontSize: 9,
                fontFamily: 'IBM Plex Mono',
              }}
            />
            <ReferenceLine
              y={1.30}
              stroke="#00873C"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: 'F0/F1 Cutoff (1.30)',
                position: 'right',
                fill: '#00873C',
                fontSize: 9,
                fontFamily: 'IBM Plex Mono',
              }}
            />

            {/* 95% Confidence Band (Solid at 18% opacity) */}
            <Area
              type="monotone"
              dataKey="ci95Upper"
              stroke="none"
              fill="#006D77"
              fillOpacity={0.12}
            />
            <Area
              type="monotone"
              dataKey="ci95Lower"
              stroke="none"
              fill="#FFFFFF"
              fillOpacity={1.0}
            />

            {/* 80% Confidence Band */}
            <Area
              type="monotone"
              dataKey="ci80Upper"
              stroke="none"
              fill="#006D77"
              fillOpacity={0.18}
            />
            <Area
              type="monotone"
              dataKey="ci80Lower"
              stroke="none"
              fill="#FFFFFF"
              fillOpacity={1.0}
            />

            {/* Projected Score Line (Dashed Orange #E36414) */}
            <Line
              type="monotone"
              dataKey="projectedScore"
              stroke="#E36414"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#E36414' }}
              activeDot={{ r: 5 }}
            />

            {/* Baseline Current Marker */}
            <Line
              type="monotone"
              dataKey="actualScore"
              stroke="#006D77"
              strokeWidth={3}
              dot={{ r: 5, fill: '#006D77' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Dynamic Clinical Summary */}
      <div className="mt-2 p-2 bg-slate-50 border border-clinical-borderSubtle rounded-sharp flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          {driverImpact === 'accelerating' ? (
            <AlertTriangle className="w-4 h-4 text-status-critical shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-status-normal shrink-0" />
          )}
          <span className="text-clinical-textPrimary">{headline}</span>
        </div>
        <span className="text-xxs text-clinical-textMuted uppercase shrink-0 font-bold">
          LATENCY &lt; 50ms
        </span>
      </div>
    </div>
  );
};
