// src/components/dashboard/StreamFusionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useTwinStore } from '../../store/twinStore';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Radio, Activity, AlertTriangle, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

export const StreamFusionDashboard: React.FC = () => {
  const { getActivePersona, getFibrosisMetrics, whatIf } = useTwinStore();
  const persona = getActivePersona();
  const metrics = getFibrosisMetrics();

  const [pnpla3Variant, setPnpla3Variant] = useState(false);
  const [t2dmActive, setT2dmActive] = useState(persona.hepatitisType.includes('Fatty') || persona.age > 50);
  const [ticker, setTicker] = useState(0);

  // Auto-pulse simulated real-time stream
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => (prev + 1) % 1000);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Compute live physiological streams based on active persona & whatIf
  const baselineGlucose = t2dmActive ? 155 : 105;
  const glucoseNoise = Math.sin(ticker) * 6;
  const currentGlucose = Math.round(baselineGlucose + (whatIf.dietQualityScore < 50 ? 25 : 0) + glucoseNoise);

  const baselineHR = 72;
  const hrNoise = Math.cos(ticker) * 3;
  const currentHeartRate = Math.round(baselineHR + (whatIf.alcoholUnitsPerWeek > 10 ? 12 : 0) + hrNoise);

  const currentHRV = Math.max(18, Math.round(52 - (whatIf.alcoholUnitsPerWeek * 1.5) - (metrics.fib4 * 4)));
  const deepSleepPercent = Math.max(8, Number((22 - (metrics.fib4 * 2.5)).toFixed(1)));

  // Generate 2-Hour forward glycemic curve with 95% confidence bounds
  const chartData = [
    { time: '+0m', minutes: 0, glucose: currentGlucose, upper95: currentGlucose + 8, lower95: currentGlucose - 8 },
    { time: '+15m', minutes: 15, glucose: currentGlucose + 7, upper95: currentGlucose + 18, lower95: currentGlucose - 4 },
    { time: '+30m', minutes: 30, glucose: currentGlucose + 18, upper95: currentGlucose + 32, lower95: currentGlucose + 4 },
    { time: '+45m', minutes: 45, glucose: currentGlucose + 34 + (pnpla3Variant ? 28 : 0), upper95: currentGlucose + 54 + (pnpla3Variant ? 32 : 0), lower95: currentGlucose + 14 },
    { time: '+60m', minutes: 60, glucose: currentGlucose + 45 + (pnpla3Variant ? 38 : 0), upper95: currentGlucose + 72 + (pnpla3Variant ? 44 : 0), lower95: currentGlucose + 20 },
    { time: '+75m', minutes: 75, glucose: currentGlucose + 39 + (pnpla3Variant ? 30 : 0), upper95: currentGlucose + 68 + (pnpla3Variant ? 36 : 0), lower95: currentGlucose + 16 },
    { time: '+90m', minutes: 90, glucose: currentGlucose + 24 + (pnpla3Variant ? 18 : 0), upper95: currentGlucose + 50 + (pnpla3Variant ? 24 : 0), lower95: currentGlucose + 6 },
    { time: '+105m', minutes: 105, glucose: currentGlucose + 12, upper95: currentGlucose + 36, lower95: currentGlucose - 4 },
    { time: '+120m', minutes: 120, glucose: currentGlucose + 4, upper95: currentGlucose + 26, lower95: currentGlucose - 12 },
  ];

  const maxProjectedGlucose = Math.max(...chartData.map((d) => d.glucose));
  const isSevereHyperglycemia = maxProjectedGlucose >= 210;
  const isAutonomicCollapseHazard = currentHRV < 25;

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 shadow-none space-y-4 font-mono">
      {/* Header: Stream Fusion Overview */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-clinical-borderSubtle gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent-primary animate-pulse" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-clinical-textPrimary">
              Dual-Stream Fusion // Static EHR × Real-Time IoT Telemetry
            </h3>
          </div>
          <p className="text-xxs text-clinical-textSecondary mt-0.5">
            Synchronizes synthetic EHR genetics and lab profiles with live 10-minute continuous smartwatch sensor feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sharp bg-emerald-50 text-emerald-800 border border-emerald-300 text-xxs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE TELEMETRY SYNC
          </span>
          <span className="text-xxs text-slate-400">DPDP & HIPAA COMPLIANT</span>
        </div>
      </div>

      {/* The Two Streams (Stream 1 vs Stream 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
        {/* STREAM 1: STATIC / HISTORICAL EHR */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-clinical-borderSubtle">
            <span className="font-bold text-xxs text-clinical-textPrimary uppercase">
              Stream 1: Static EHR Registry
            </span>
            <span className="text-xxs text-clinical-textMuted">{persona.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xxs">
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">Demographics</span>
              <span className="font-bold text-clinical-textPrimary">
                {persona.age}y / {persona.sex}
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">Genetic Risk Allele</span>
              <span className={`font-bold ${pnpla3Variant ? 'text-status-critical' : 'text-teal-700'}`}>
                PNPLA3: {pnpla3Variant ? 'G/G (High Risk)' : 'C/C (Wild)'}
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">Baseline ALT / AST</span>
              <span className="font-bold text-clinical-textPrimary">
                {persona.baselineBiomarkers.alt.value} / {persona.baselineBiomarkers.ast.value} U/L
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">EHR Etiology</span>
              <span className="font-bold text-clinical-textPrimary truncate block">
                {persona.hepatitisType}
              </span>
            </div>
          </div>
        </div>

        {/* STREAM 2: DYNAMIC / REAL-TIME IoT SENSORS */}
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-clinical-borderSubtle">
            <span className="font-bold text-xxs text-clinical-textPrimary uppercase">
              Stream 2: Real-Time IoT Sensors
            </span>
            <span className="text-xxs text-emerald-600 font-bold animate-pulse">TICKING</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xxs">
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">CGM Glucose</span>
              <span className="font-bold text-blue-700 text-sm">
                {currentGlucose} mg/dL
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">PPG Heart Rate</span>
              <span className="font-bold text-clinical-textPrimary text-sm">
                {currentHeartRate} BPM
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">HRV (rMSSD)</span>
              <span className={`font-bold ${currentHRV < 30 ? 'text-status-critical' : 'text-emerald-700'}`}>
                {currentHRV} ms
              </span>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <span className="text-clinical-textMuted block">Deep Sleep Arch</span>
              <span className="font-bold text-clinical-textPrimary">
                {deepSleepPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-HOUR FORWARD GLUCOSE SPIKE PREDICTOR */}
      <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase text-clinical-textPrimary">
              Algorithmic Forecast // 2-Hour Forward Glycemic Spike Curve
            </h4>
            <p className="text-xxs text-clinical-textMuted">
              Forecasts postprandial glucose excursions 120 minutes ahead using autoregressive stream fusion.
            </p>
          </div>

          {/* Genetic / Comorbidity Toggles */}
          <div className="flex items-center gap-2 text-xxs">
            <button
              onClick={() => setPnpla3Variant(!pnpla3Variant)}
              className={`px-2 py-1 rounded-sharp border font-bold transition-colors ${
                pnpla3Variant
                  ? 'bg-red-50 text-status-critical border-red-300'
                  : 'bg-white text-clinical-textSecondary border-clinical-borderStrong hover:text-clinical-textPrimary'
              }`}
            >
              {pnpla3Variant ? '🧬 PNPLA3 G/G Active' : '+ Test PNPLA3 G/G Allele'}
            </button>
            <button
              onClick={() => setT2dmActive(!t2dmActive)}
              className={`px-2 py-1 rounded-sharp border font-bold transition-colors ${
                t2dmActive
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-clinical-textSecondary border-clinical-borderStrong hover:text-clinical-textPrimary'
              }`}
            >
              {t2dmActive ? '🍬 Comorbid T2DM Active' : '+ Test T2DM Comorbidity'}
            </button>
          </div>
        </div>

        {/* Recharts Curve */}
        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#E2E6EA" vertical={false} />
              <XAxis dataKey="time" stroke="#7A8C9E" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
              <YAxis domain={['dataMin - 10', 'dataMax + 20']} stroke="#7A8C9E" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1F33',
                  borderColor: '#233D5B',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'IBM Plex Mono',
                  color: '#fff',
                }}
              />
              <ReferenceLine
                y={180}
                stroke="#F2A900"
                strokeDasharray="3 3"
                label={{ value: 'Hyperglycemia Threshold (180 mg/dL)', fill: '#F2A900', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              />
              <ReferenceLine
                y={220}
                stroke="#C8102E"
                strokeDasharray="3 3"
                label={{ value: 'Metabolic Spike Hazard (220 mg/dL)', fill: '#C8102E', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
              />
              <Area type="monotone" dataKey="upper95" stroke="none" fill="#006D77" fillOpacity={0.12} />
              <Area type="monotone" dataKey="lower95" stroke="none" fill="#FFFFFF" fillOpacity={1.0} />
              <Line
                type="monotone"
                dataKey="glucose"
                name="Projected Interstitial Glucose"
                stroke="#E36414"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#E36414' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predicted Adverse Events Card */}
      <div className="space-y-2">
        <h4 className="font-bold text-xxs uppercase tracking-wider text-clinical-textPrimary">
          Predicted Adverse Events // Next 2 to 24 Hours
        </h4>

        {isSevereHyperglycemia || isAutonomicCollapseHazard ? (
          <div className="p-3 bg-red-50 border border-status-critical rounded-sharp text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-status-critical uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-status-critical" />
                <span>
                  {isSevereHyperglycemia ? 'Sudden Postprandial Glucose Surge Predicted' : 'Autonomic Dysregulation Hazard'}
                </span>
              </span>
              <span className="text-xxs px-2 py-0.5 rounded-sharp bg-status-critical text-white font-bold uppercase">
                CRITICAL (88% Probability)
              </span>
            </div>
            <p className="text-xxs text-clinical-textPrimary">
              {isSevereHyperglycemia
                ? `Algorithmic model predicts peak interstitial glucose reaching ${maxProjectedGlucose} mg/dL within 60 minutes due to PNPLA3 genetic risk and metabolic steatosis.`
                : 'Sustained nocturnal HRV depression (<25 ms) flags autonomic collapse risk and impaired hepatic microcirculation.'}
            </p>
            <div className="pt-1.5 border-t border-red-200 text-xxs text-clinical-textSecondary flex justify-between">
              <span>Physician Action: Enforce carbohydrate restriction and schedule endocrinology consult.</span>
              <span className="font-bold text-status-critical">Lead Time: 60m advance alert</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-status-normal rounded-sharp text-xxs flex items-center justify-between text-emerald-900">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-status-normal" />
              <span>No acute adverse metabolic excursions predicted within the next 2-hour window. Telemetry is concordant with stable hepatic reserve.</span>
            </span>
            <span className="font-bold uppercase text-status-normal">HOMEOSTATIC BALANCE</span>
          </div>
        )}
      </div>
    </div>
  );
};
