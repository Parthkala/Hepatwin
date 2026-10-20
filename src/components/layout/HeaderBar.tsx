// src/components/layout/HeaderBar.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Database, 
  Radio, 
  FileText,
  UserCheck,
  Stethoscope,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const {
    getActivePersona,
    personas,
    selectedPersonaId,
    selectPersona,
    privacyMode,
    togglePrivacyMode,
    activeRole,
    setIsAddPatientModalOpen,
    clinicianUser,
    patientUser,
    logoutToGateway,
  } = useTwinStore();

  const persona = getActivePersona();

  return (
    <header className="bg-ink text-white border-b border-ink-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-none">
      {/* Brand & Persona Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-sharp flex items-center justify-center font-bold tracking-tight text-white border border-teal-400/30">
            H
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider uppercase">HepaTwin</span>
              <span className="text-xxs px-1.5 py-0.5 bg-ink-light rounded-sharp text-clinical-textMuted border border-ink-border font-mono">
                {activeRole === 'physician' ? 'CLINICIAN WORKSTATION' : 'PATIENT TWIN PORTAL'}
              </span>
            </div>
            <div className="text-xxs text-slate-400 font-mono">LIVER DIGITAL TWIN ENGINE</div>
          </div>
        </div>

        {/* Persona Switcher Dropdown: Clinician has full cohort access; Patient is locked to their own twin */}
        <div className="h-6 w-px bg-ink-border mx-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
            {activeRole === 'physician' ? 'Cohort:' : 'My Twin:'}
          </span>

          {activeRole === 'physician' ? (
            <select
              value={selectedPersonaId}
              onChange={(e) => selectPersona(e.target.value)}
              className="bg-ink-light border border-ink-border text-xs text-white rounded-sharp px-2.5 py-1 font-mono focus:outline-none focus:border-accent-primary cursor-pointer hover:bg-ink-light/80 max-w-xs"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {privacyMode ? p.maskedName : p.name} — {p.age}y ({p.hepatitisType})
                </option>
              ))}
            </select>
          ) : (
            <span className="bg-ink-light border border-ink-border text-xs text-amber-300 rounded-sharp px-2.5 py-1 font-mono font-bold">
              {persona.name} ({persona.id})
            </span>
          )}
        </div>
      </div>

      {/* Patient Demographic Vitals Strip */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">ID:</span>
          <span className="text-white font-semibold">{privacyMode ? 'P-XXXXX' : persona.id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">DEMO:</span>
          <span className="text-white">
            {persona.age}y / {persona.sex}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">DX:</span>
          <span className="px-1.5 py-0.5 bg-accent-primary/20 text-teal-300 border border-accent-primary/50 rounded-sharp text-xxs font-semibold">
            {persona.hepatitisType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <span className="text-slate-400">TENURE:</span>
          <span className="text-white">{persona.monthsSinceDiagnosis}m post-dx</span>
        </div>
      </div>

      {/* Linked Sources, Sync & Controls */}
      <div className="flex items-center gap-3">
        {/* Active Authenticated User Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-ink-light border border-ink-border rounded-sharp text-xxs font-mono text-slate-300">
          {activeRole === 'physician' ? (
            <>
              <Stethoscope className="w-3 h-3 text-teal-400" />
              <span className="text-teal-300 font-semibold">{clinicianUser || 'Dr. Parth'}</span>
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-accent-secondary" />
              <span className="text-amber-300 font-semibold">{patientUser || persona.name}</span>
            </>
          )}
        </div>

        {/* Linked Data Sources Badge */}
        <div className="hidden xl:flex items-center gap-3 bg-ink-light/60 px-2.5 py-1 border border-ink-border rounded-sharp text-xxs font-mono text-slate-300">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-teal-400" />
            <span>{persona.linkedDataSources.labReports} Labs</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>IoT Live</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{persona.linkedDataSources.ehrRecords} EHR</span>
          </span>
        </div>

        {/* Privacy Toggle (DPDP Act 2023) */}
        <button
          onClick={togglePrivacyMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sharp text-xs font-mono transition-colors border ${
            privacyMode
              ? 'bg-amber-950/40 border-status-caution text-amber-300'
              : 'bg-ink-light border-ink-border text-slate-300 hover:text-white'
          }`}
          title="Toggle Indian DPDP Act 2023 Compliant De-identification Mode"
        >
          {privacyMode ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-status-caution" />
              <span>De-identified</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Identified</span>
            </>
          )}
        </button>

        {/* Logout to Login Gateway Button */}
        <button
          onClick={logoutToGateway}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-ink-light hover:bg-rose-950/40 border border-ink-border hover:border-rose-700 text-slate-300 hover:text-rose-300 rounded-sharp font-mono text-xs transition-colors"
          title="Logout & Return to Login Gateway"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
