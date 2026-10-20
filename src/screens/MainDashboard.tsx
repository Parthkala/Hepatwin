// src/screens/MainDashboard.tsx
import React from 'react';
import { useTwinStore } from '../store/twinStore';
import { HeaderBar } from '../components/layout/HeaderBar';
import { LeftRailNav } from '../components/layout/LeftRailNav';
import { LiverSchematic } from '../components/twin/LiverSchematic';
import { BiomarkerPanel } from '../components/biomarkers/BiomarkerPanel';
import { FibrosisIndicesCard } from '../components/indices/FibrosisIndicesCard';
import { TrajectoryChart } from '../components/trajectory/TrajectoryChart';
import { WhatIfWorkspace } from '../components/simulation/WhatIfWorkspace';
import { ExplainabilityPanel } from '../components/explainability/ExplainabilityPanel';
import { TrafficLightCard } from '../components/status/TrafficLightCard';
import { TimelineScrubber } from '../components/timeline/TimelineScrubber';
import { LongitudinalDiagnosticSummaryTable } from '../components/timeline/LongitudinalDiagnosticSummaryTable';
import { PrivacyBanner } from '../components/privacy/PrivacyBanner';
import { PatientView } from '../components/patient/PatientView';
import { AddPatientModal } from '../components/ui/AddPatientModal';
import { ClinicalAuthModal } from '../components/ui/ClinicalAuthModal';
import { StreamFusionDashboard } from '../components/dashboard/StreamFusionDashboard';
import { HepatitisRiskAssessment } from '../components/dashboard/HepatitisRiskAssessment';
import { HepatitisTypesMatrix } from '../components/dashboard/HepatitisTypesMatrix';
import { IndianDietGuidanceCard } from '../components/patient/IndianDietGuidanceCard';
import { usePatientStore } from '../store/patientStore';
import { ShieldCheck, Heart, Moon, Sparkles, Utensils, BookOpen, ArrowRight } from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const { activeRole, activeTab, getFibrosisMetrics, whatIf } = useTwinStore();
  const { selectedPatient, patients, selectPatient } = usePatientStore();

  const metrics = getFibrosisMetrics();

  // Ensure patient store is initialized for stream fusion
  React.useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
      selectPatient(patients[0].id);
    }
  }, [patients, selectedPatient, selectPatient]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-clinical-textPrimary selection:bg-accent-primary selection:text-white">
      {/* 1. Patient Header Bar */}
      <HeaderBar />

      {/* Main Body with Left Rail Nav */}
      <div className="flex-1 flex overflow-hidden">
        <LeftRailNav />

        {/* Content Area with Active Tab Switching */}
        <main className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeRole === 'patient' ? (
            <PatientView />
          ) : (
            <>
              {/* TAB 1: OVERVIEW (Full Terminal View) */}
              {activeTab === 'overview' && (
                <>
                  {/* Clinician Overview Vitals: Homeostatic Reserve, Medication Adherence, Sleep & Action */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                    <div className="p-3 bg-card border border-clinical-borderSubtle rounded-sharp">
                      <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Homeostatic Reserve</span>
                      </div>
                      <div className="text-2xl font-bold text-clinical-textPrimary">
                        {metrics.homeostaticReserveIndex}%
                      </div>
                      <p className="text-xxs text-clinical-textSecondary mt-1">
                        Functional hepatic metabolic reserve capacity.
                      </p>
                    </div>

                    <div className="p-3 bg-card border border-clinical-borderSubtle rounded-sharp">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                        <Heart className="w-4 h-4" />
                        <span>Medication Adherence</span>
                      </div>
                      <div className="text-2xl font-bold text-clinical-textPrimary">
                        {whatIf.antiviralAdherencePercent}%
                      </div>
                      <p className="text-xxs text-clinical-textSecondary mt-1">
                        Compliance with prescribed antiviral / clinical regimen.
                      </p>
                    </div>

                    <div className="p-3 bg-card border border-clinical-borderSubtle rounded-sharp">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
                        <Moon className="w-4 h-4" />
                        <span>Sleep & Circadian Rhythm</span>
                      </div>
                      <div className="text-2xl font-bold text-clinical-textPrimary">
                        {whatIf.sleepHoursPerDay || 7} <span className="text-xs font-normal text-clinical-textSecondary">hrs/night</span>
                      </div>
                      <p className="text-xxs text-clinical-textSecondary mt-1">
                        {(whatIf.sleepHoursPerDay || 7) >= 7 ? 'Optimal circadian hepatic repair.' : 'Suboptimal sleep; steatosis risk.'}
                      </p>
                    </div>

                    <div className="p-3 bg-card border border-clinical-borderSubtle rounded-sharp">
                      <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Recommended Action</span>
                      </div>
                      <div className="text-xs font-bold text-clinical-textPrimary mt-1 line-clamp-2">
                        {metrics.recommendedAction}
                      </div>
                      <p className="text-xxs text-clinical-textSecondary mt-1">
                        Protocol: ICMR-NMC Standard (2026)
                      </p>
                    </div>
                  </div>

                  <TrafficLightCard />
                  <BiomarkerPanel />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    <div className="lg:col-span-5 h-[410px]">
                      <LiverSchematic />
                    </div>
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <FibrosisIndicesCard />
                      <ExplainabilityPanel />
                    </div>
                  </div>

                  {/* Clinician Awareness & Culinary Status Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-sharp flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Patient Culinary Guidance & Abstinence Status</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sharp bg-emerald-100 text-emerald-800 font-bold">
                            INASL PROTOCOL
                          </span>
                        </div>
                        <p className="text-xxs text-slate-700 mt-2 leading-relaxed">
                          Prescribed therapeutic diet (+Add Haldi, Amla, Methi, Moringa; −Subtract Vanaspati, Samosas, Mithai, Achaar). 
                          Strict zero-alcohol and hepatotoxic medication warnings active.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 flex justify-end">
                        <button
                          onClick={() => useTwinStore.getState().setActiveTab('culinary')}
                          className="text-xxs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white px-2 py-0.5 rounded-sharp border border-emerald-300"
                        >
                          <span>Review Culinary Prescription</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-sharp flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-teal-200">
                          <span className="font-bold text-teal-950 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                            <span>Patient Moral & Physical Awareness Status</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sharp bg-teal-100 text-teal-800 font-bold uppercase">
                            {whatIf.vaccinationStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xxs text-slate-700 mt-2 leading-relaxed">
                          Active education modules deployed for hepatic regeneration biology, psychological destigmatization, and household transmission barriers.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-teal-200/60 flex justify-end">
                        <span className="text-xxs font-semibold text-teal-800">
                          Hepatitis A & B Vaccine Compliance: Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <TimelineScrubber />
                </>
              )}

              {/* TAB 2: TWIN PANEL (Fallback / Overview Redirect) */}
              {activeTab === 'twin' && (
                <div className="space-y-3">
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
                </div>
              )}

              {/* TAB 3: SIMULATE (What-If Workspace & Trajectory Analysis) */}
              {activeTab === 'simulate' && (
                <div className="space-y-3">
                  <WhatIfWorkspace />
                  <div className="h-[380px]">
                    <TrajectoryChart />
                  </div>
                  <ExplainabilityPanel />
                </div>
              )}

              {/* TAB 4: TIMELINE (Longitudinal Scrubber & Historical Markers) */}
              {activeTab === 'timeline' && (
                <div className="space-y-3">
                  <TimelineScrubber />
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
                  <LongitudinalDiagnosticSummaryTable />
                </div>
              )}

              {/* TAB 5: DUAL-STREAM IOT FUSION (Previous Version Telemetry & Adverse Events) */}
              {activeTab === 'streamFusion' && (
                <div className="space-y-4">
                  <StreamFusionDashboard />
                  <HepatitisTypesMatrix />
                </div>
              )}

              {/* TAB 6: CULINARY GUIDANCE (Indian Clinical Diet Prescription) */}
              {activeTab === 'culinary' && (
                <div className="space-y-4 font-mono">
                  <IndianDietGuidanceCard />
                </div>
              )}

              {/* TAB 7: REPORTS & CLINICAL AUDIT */}
              {activeTab === 'reports' && (
                <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-5 space-y-4 font-mono">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-clinical-textPrimary pb-2 border-b border-clinical-borderSubtle">
                    Clinical Digital Twin Longitudinal Summary Report
                  </h3>
                  <div className="p-4 bg-slate-50 border border-clinical-borderSubtle rounded-sharp text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-clinical-textSecondary">Audit Framework:</span>
                      <span className="font-bold text-teal-700">ICMR-NMC Standard Guideline (2026)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-clinical-textSecondary">Regulatory Compliance:</span>
                      <span className="font-bold text-emerald-700">DPDP Act 2023 Sandbox De-identified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-clinical-textSecondary">Diagnostic Engine:</span>
                      <span className="font-bold">Monotone Cubic Hermite Interpolator + SHAP Attribution</span>
                    </div>
                  </div>
                  <BiomarkerPanel />
                  <TrafficLightCard />
                  <LongitudinalDiagnosticSummaryTable />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddPatientModal />
      <ClinicalAuthModal />

      {/* 10. DPDP Act 2023 Compliant Privacy & Synthetic Footer Banner */}
      <PrivacyBanner />
    </div>
  );
};
