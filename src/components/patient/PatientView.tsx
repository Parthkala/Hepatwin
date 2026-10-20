// src/components/patient/PatientView.tsx
import React from 'react';
import { useTwinStore, ActiveNavTab } from '../../store/twinStore';
import { 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Radio,
  Sliders,
  Activity,
  Layers,
  History,
  FileSpreadsheet,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ArrowRight,
  Moon,
  Utensils,
  BookOpen
} from 'lucide-react';
import { PatientSelfAssessment } from './PatientSelfAssessment';
import { IndianDietGuidanceCard } from './IndianDietGuidanceCard';
import { PatientAwarenessEducation } from './PatientAwarenessEducation';
import { StreamFusionDashboard } from '../dashboard/StreamFusionDashboard';
import { WhatIfWorkspace } from '../simulation/WhatIfWorkspace';
import { TrajectoryChart } from '../trajectory/TrajectoryChart';
import { LiverSchematic } from '../twin/LiverSchematic';
import { FibrosisIndicesCard } from '../indices/FibrosisIndicesCard';
import { TrafficLightCard } from '../status/TrafficLightCard';
import { BiomarkerPanel } from '../biomarkers/BiomarkerPanel';
import { TimelineScrubber } from '../timeline/TimelineScrubber';
import { LongitudinalDiagnosticSummaryTable } from '../timeline/LongitudinalDiagnosticSummaryTable';
import { ExplainabilityPanel } from '../explainability/ExplainabilityPanel';
import { HepatitisTypesMatrix } from '../dashboard/HepatitisTypesMatrix';

const PATIENT_NAV_TABS: {
  id: ActiveNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}[] = [
  { id: 'overview', label: 'Overview', icon: Activity, hotkey: '1' },
  { id: 'twin', label: 'HepaTwin & Assessment', icon: Layers, hotkey: '2' },
  { id: 'culinary', label: 'Culinary Guidance', icon: Utensils, hotkey: '3' },
  { id: 'simulate', label: 'What-If Simulator', icon: Sliders, hotkey: '4' },
  { id: 'timeline', label: 'Lab Timeline', icon: History, hotkey: '5' },
  { id: 'streamFusion', label: 'IoT Stream', icon: Radio, hotkey: '6' },
  { id: 'reports', label: 'Reports & Clinical Audit', icon: FileSpreadsheet, hotkey: '7' },
];

export const PatientView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    getActivePersona,
    getFibrosisMetrics,
    whatIf,
    patientUser,
    setIsAuthModalOpen,
    setAuthModalInitialTab,
  } = useTwinStore();

  const persona = getActivePersona();
  const metrics = getFibrosisMetrics();

  return (
    <div className="max-w-7xl mx-auto space-y-3 font-mono select-none">
      {/* Patient Greeting & Status Header Card */}
      <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-clinical-borderSubtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xxs text-accent-secondary uppercase font-bold tracking-wider">
                Personal Liver Digital Twin Portal
              </span>
              <span className="text-xxs px-2 py-0.5 rounded-sharp bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                PATIENT INDEPENDENT MONITOR
              </span>
            </div>
            <h1 className="text-xl font-bold text-clinical-textPrimary mt-0.5">
              Welcome, {persona.name}
            </h1>
            <p className="text-xs text-clinical-textSecondary mt-0.5">
              Medical Condition: <span className="font-semibold text-clinical-textPrimary">{persona.hepatitisType}</span> • Twin ID: <span className="font-semibold">{persona.id}</span> • {persona.age}y / {persona.sex}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xxs text-clinical-textMuted block">Active Twin Health:</span>
              <span
                className={`px-3 py-1 rounded-sharp text-xs font-bold text-white inline-block ${
                  metrics.overallRiskLevel === 'critical'
                    ? 'bg-status-critical'
                    : metrics.overallRiskLevel === 'caution'
                    ? 'bg-status-caution'
                    : 'bg-status-normal'
                }`}
              >
                {metrics.overallRiskLevel === 'normal'
                  ? 'Stable / Low Risk'
                  : metrics.overallRiskLevel === 'caution'
                  ? 'Mild Inflammation'
                  : 'Attention Needed'}
              </span>
            </div>

            {/* Patient Auth Badge & Switch Twin */}
            <div className="pl-3 border-l border-clinical-borderSubtle flex items-center gap-1.5 text-xs">
              <span className="text-xxs text-clinical-textMuted hidden sm:inline">Signed in as:</span>
              <span className="font-bold text-teal-800">{patientUser || persona.name}</span>
              <button
                onClick={() => {
                  setAuthModalInitialTab('patient');
                  setIsAuthModalOpen(true);
                }}
                className="text-xxs px-2 py-1 rounded-sharp border border-clinical-borderStrong hover:bg-slate-100 font-semibold"
                title="Switch Patient Twin Account"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* 4 Quick Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
            <div className="flex items-center gap-2 text-teal-700 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Homeostatic Reserve</span>
            </div>
            <div className="text-2xl font-bold text-clinical-textPrimary">
              {metrics.homeostaticReserveIndex}%
            </div>
            <p className="text-xxs text-clinical-textSecondary mt-1">
              Functional liver reserve capacity to process nutrients and clear biological metabolites.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
            <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
              <Heart className="w-4 h-4" />
              <span>Medication Adherence</span>
            </div>
            <div className="text-2xl font-bold text-clinical-textPrimary">
              {whatIf.antiviralAdherencePercent}%
            </div>
            <p className="text-xxs text-clinical-textSecondary mt-1">
              Antiviral regimen compliance prevents chronic transaminase elevation and fibrosis.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
              <Moon className="w-4 h-4" />
              <span>Sleep & Circadian Rhythm</span>
            </div>
            <div className="text-2xl font-bold text-clinical-textPrimary">
              {whatIf.sleepHoursPerDay || 7} <span className="text-xs font-normal text-clinical-textSecondary">hrs/night</span>
            </div>
            <p className="text-xxs text-clinical-textSecondary mt-1">
              {(whatIf.sleepHoursPerDay || 7) >= 7 ? 'Optimal circadian hepatic cellular repair.' : 'Suboptimal sleep; steatosis risk.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp">
            <div className="flex items-center gap-2 text-cyan-700 font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Recommended Action</span>
            </div>
            <div className="text-xs font-bold text-clinical-textPrimary mt-1">
              {metrics.recommendedAction}
            </div>
          </div>
        </div>

        {/* Interactive Clinical Navigation Tab Bar for Patient */}
        <div className="mt-3 pt-3 border-t border-clinical-borderSubtle flex flex-wrap gap-2 text-xs">
          {PATIENT_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sharp font-bold transition-all text-left ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100 hover:text-clinical-textPrimary'
                }`}
                title={`${tab.label} (Alt+${tab.hotkey})`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className="hidden sm:inline text-xxs opacity-60 ml-0.5">
                  [{tab.hotkey}]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Comprehensive Health Dashboard & Awareness Centerpiece) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Prominent Awareness Section - Apple of Eye on Site Entry */}
          <div className="relative pt-2">
            <div className="absolute top-2 left-4 z-10 -translate-y-1/2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-bold tracking-wider shadow-sm border border-teal-300">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                FEATURED CENTERPIECE • PATIENT AWARENESS & MORAL EMPOWERMENT
              </span>
            </div>
            <PatientAwarenessEducation />
          </div>

          <TrafficLightCard />
          <BiomarkerPanel />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <FibrosisIndicesCard />
            <ExplainabilityPanel />
          </div>

          {/* Quick Shortcuts to Culinary Guidance & HepaTwin Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-sharp flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Dedicated Culinary Guidance</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sharp bg-emerald-100 text-emerald-800 font-bold">
                    INASL ALIGNED
                  </span>
                </div>
                <p className="text-xxs text-slate-700 mt-2 leading-relaxed">
                  Tailored Indian nutrition (+Add Haldi, Amla, Methi; −Subtract Vanaspati, Samosas, Mithai) alongside the strict Hepatitis Abstinence Protocol and meal scheduling.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex justify-end">
                <button
                  onClick={() => setActiveTab('culinary')}
                  className="text-xxs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-sharp border border-emerald-300 shadow-xs"
                >
                  <span>Open Dedicated Culinary Guidance Tab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-sharp flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-sky-200">
                  <span className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-700" />
                    <span>HepaTwin & Self-Assessment Hub</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sharp bg-sky-100 text-sky-800 font-bold">
                    COUINAUD SEGMENTS
                  </span>
                </div>
                <p className="text-xxs text-slate-700 mt-2 leading-relaxed">
                  Inspect your anatomical 3D Couinaud liver segments and complete the 8-category lifestyle & symptom assessment to update your digital twin.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-sky-200/60 flex justify-end">
                <button
                  onClick={() => setActiveTab('twin')}
                  className="text-xxs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-sharp border border-sky-300 shadow-xs"
                >
                  <span>Launch HepaTwin & Assessment</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HEPATWIN & SELF-ASSESSMENT (Anatomical Twin + Questionnaire) */}
      {/* ========================================================================= */}
      {activeTab === 'twin' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 h-[460px]">
              <LiverSchematic />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-3">
              <FibrosisIndicesCard />
              <BiomarkerPanel />
            </div>
          </div>
          <TrafficLightCard />

          {/* Self-Assessment Questionnaire moved directly into HepaTwin tab */}
          <div className="pt-2">
            <PatientSelfAssessment />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CULINARY GUIDANCE (Dedicated Indian Diet & Abstinence Protocol) */}
      {/* ========================================================================= */}
      {activeTab === 'culinary' && (
        <div className="space-y-4">
          <IndianDietGuidanceCard />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SIMULATE (What-If Lifestyle & Medication Simulator + 5-Yr Forecast) */}
      {/* ========================================================================= */}
      {activeTab === 'simulate' && (
        <div className="space-y-3">
          <WhatIfWorkspace />
          <div className="h-[380px]">
            <TrajectoryChart />
          </div>
          <ExplainabilityPanel />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TIMELINE (Accredited Longitudinal Lab Timeline Scrubber) */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {/* Interactive Lab Timeline Scrubber */}
          <TimelineScrubber />

          {/* Recalculated Lab Values & Morphology at Selected Lab Visit */}
          <BiomarkerPanel />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5 h-[410px]">
              <LiverSchematic />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-3">
              <FibrosisIndicesCard />
              <TrafficLightCard />
            </div>
          </div>

          {/* Accredited Diagnostic Facilities Longitudinal History Summary Table */}
          <LongitudinalDiagnosticSummaryTable />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DUAL-STREAM IOT FUSION (Live Wearable CGM + PPG Telemetry) */}
      {/* ========================================================================= */}
      {activeTab === 'streamFusion' && (
        <div className="space-y-4">
          <StreamFusionDashboard />
          <HepatitisTypesMatrix />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REPORTS & CLINICAL AUDIT (ICMR Diagnostic Guidelines) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-3 font-mono">
          <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-clinical-textPrimary pb-2 border-b border-clinical-borderSubtle">
              Personal Liver Health Summary & Diagnostic Audit
            </h3>
            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-clinical-textSecondary">Audit Framework:</span>
                <span className="font-bold text-teal-700">ICMR-NMC Standard Guideline (2026)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textSecondary">Regulatory Compliance:</span>
                <span className="font-bold text-emerald-700">DPDP Act 2023 Sandbox De-identified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinical-textSecondary">Digital Twin Engine:</span>
                <span className="font-bold">Monotone Cubic Hermite Interpolator + SHAP Attribution</span>
              </div>
            </div>

            <BiomarkerPanel />
            <TrafficLightCard />
            <LongitudinalDiagnosticSummaryTable />
          </div>
        </div>
      )}
    </div>
  );
};
