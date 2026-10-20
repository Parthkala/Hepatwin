// src/components/status/TrafficLightCard.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const TrafficLightCard: React.FC = () => {
  const { getFibrosisMetrics } = useTwinStore();
  const metrics = getFibrosisMetrics();

  const getStatusConfig = () => {
    switch (metrics.overallRiskLevel) {
      case 'critical':
        return {
          title: 'CRITICAL / ADVANCED FIBROSIS HAZARD',
          bg: 'bg-red-50/70',
          border: 'border-status-critical',
          text: 'text-status-critical',
          icon: AlertCircle,
          badgeText: 'HIGH RISK (F3-F4)',
        };
      case 'caution':
        return {
          title: 'CAUTION / INDETERMINATE PROGRESSION',
          bg: 'bg-amber-50/70',
          border: 'border-status-caution',
          text: 'text-amber-700',
          icon: AlertTriangle,
          badgeText: 'MODERATE RISK (F1-F2)',
        };
      default:
        return {
          title: 'NORMAL / STABLE REMISSION',
          bg: 'bg-emerald-50/70',
          border: 'border-status-normal',
          text: 'text-status-normal',
          icon: CheckCircle2,
          badgeText: 'LOW RISK (F0-F1)',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`p-3 rounded-sharp border-2 ${config.bg} ${config.border} flex flex-col justify-between shadow-none`}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.text} shrink-0`} />
          <span className="text-xs font-bold font-mono tracking-wider uppercase text-clinical-textPrimary">
            {config.title}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-sharp font-mono text-xxs font-bold text-white ${
            metrics.overallRiskLevel === 'critical'
              ? 'bg-status-critical'
              : metrics.overallRiskLevel === 'caution'
              ? 'bg-status-caution'
              : 'bg-status-normal'
          }`}
        >
          {config.badgeText}
        </span>
      </div>

      <div className="my-2 space-y-1 text-xs font-mono">
        <div className="text-clinical-textPrimary font-semibold leading-snug">
          {metrics.riskReason}
        </div>
      </div>

      <div className="pt-2 border-t border-black/10 flex items-start gap-2 text-xxs font-mono">
        <span className="font-bold text-clinical-textPrimary uppercase shrink-0 flex items-center gap-1">
          <ArrowRight className="w-3 h-3 text-accent-primary" />
          Recommended Clinical Action:
        </span>
        <span className="text-clinical-textSecondary">{metrics.recommendedAction}</span>
      </div>
    </div>
  );
};
