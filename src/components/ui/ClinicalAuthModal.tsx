// src/components/ui/ClinicalAuthModal.tsx
import React, { useState, useEffect } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Lock, UserCheck, ShieldCheck, X, Stethoscope, User, HeartPulse } from 'lucide-react';

export const ClinicalAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginClinician,
    loginPatient,
    authModalInitialTab,
    personas,
  } = useTwinStore();

  const [activeTab, setActiveTab] = useState<'clinician' | 'patient'>('clinician');

  // Clinician Form State
  const [clinicianName, setClinicianName] = useState('Dr. Parth (Hepatology)');
  const [clinicianPassword, setClinicianPassword] = useState('clinician123');
  const [clinicianId, setClinicianId] = useState('NMC-IND-9281');

  // Patient Form State
  const [selectedPersonaId, setSelectedPersonaId] = useState(personas[0]?.id || '');
  const [patientPassword, setPatientPassword] = useState('patient123');

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalInitialTab);
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  if (!isAuthModalOpen) return null;

  const handleClinicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginClinician('auth-token-verified', clinicianName);
    setIsAuthModalOpen(false);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = personas.find((p) => p.id === selectedPersonaId) || personas[0];
    loginPatient('patient-token-verified', persona.name, persona.id);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-ink border border-ink-border rounded-sharp p-5 w-full max-w-md shadow-2xl text-white font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-border mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              HepaTwin Access & Authentication
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-ink-light border border-ink-border rounded-sharp mb-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('clinician')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sharp transition-colors ${
              activeTab === 'clinician'
                ? 'bg-accent-primary text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinician Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sharp transition-colors ${
              activeTab === 'patient'
                ? 'bg-accent-secondary text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>
        </div>

        {/* TAB 1: CLINICIAN LOGIN FORM */}
        {activeTab === 'clinician' && (
          <form onSubmit={handleClinicianSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-xxs text-slate-400 mb-1">
                Clinician Full Name & Designation
              </label>
              <input
                type="text"
                required
                value={clinicianName}
                onChange={(e) => setClinicianName(e.target.value)}
                className="w-full bg-ink-light border border-ink-border rounded-sharp p-2 text-white focus:outline-none focus:border-accent-primary font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xxs text-slate-400 mb-1">
                National Medical Commission (NMC) / Council ID
              </label>
              <input
                type="text"
                required
                value={clinicianId}
                onChange={(e) => setClinicianId(e.target.value)}
                className="w-full bg-ink-light border border-ink-border rounded-sharp p-2 text-white focus:outline-none focus:border-accent-primary font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xxs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={clinicianPassword}
                onChange={(e) => setClinicianPassword(e.target.value)}
                className="w-full bg-ink-light border border-ink-border rounded-sharp p-2 text-white focus:outline-none focus:border-accent-primary font-mono text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-accent-primary hover:bg-accent-primaryHover text-white font-bold rounded-sharp transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Login as Clinician</span>
              </button>
            </div>

            <div className="pt-2 text-xxs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Full physician access: cohort triage, what-if, indices & raw telemetry.</span>
            </div>
          </form>
        )}

        {/* TAB 2: PATIENT LOGIN FORM */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-xxs text-slate-400 mb-1">
                Select Your Patient Account
              </label>
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full bg-ink-light border border-ink-border rounded-sharp p-2 text-white focus:outline-none focus:border-accent-secondary font-mono text-xs"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.hepatitisType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xxs text-slate-400 mb-1">
                Patient Portal Password / OTP
              </label>
              <input
                type="password"
                required
                value={patientPassword}
                onChange={(e) => setPatientPassword(e.target.value)}
                className="w-full bg-ink-light border border-ink-border rounded-sharp p-2 text-white focus:outline-none focus:border-accent-secondary font-mono text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-accent-secondary hover:bg-accent-secondaryHover text-white font-bold rounded-sharp transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Access My Personal Digital Twin</span>
              </button>
            </div>

            <div className="pt-2 text-xxs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Independent monitoring: live IoT stream, what-if simulator & self-assessment.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
