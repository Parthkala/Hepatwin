// src/screens/AuthGatewayScreen.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../store/twinStore';
import { Stethoscope, User, Lock, ShieldCheck, Activity, HeartPulse, ChevronRight } from 'lucide-react';

export const AuthGatewayScreen: React.FC = () => {
  const { loginClinician, loginPatient, personas } = useTwinStore();

  const [selectedRole, setSelectedRole] = useState<'clinician' | 'patient'>('clinician');

  // Clinician Form State
  const [clinicianName, setClinicianName] = useState('Dr. Parth (Hepatology)');
  const [clinicianId, setClinicianId] = useState('NMC-IND-9281');
  const [clinicianPassword, setClinicianPassword] = useState('clinician123');

  // Patient Form State
  const [selectedPersonaId, setSelectedPersonaId] = useState(personas[0]?.id || '');
  const [patientPassword, setPatientPassword] = useState('patient123');

  const handleClinicianLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginClinician('clinician-auth-token-verified', clinicianName);
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = personas.find((p) => p.id === selectedPersonaId) || personas[0];
    loginPatient('patient-auth-token-verified', persona.name, persona.id);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between font-mono select-none">
      {/* Top Header */}
      <header className="bg-ink text-white border-b border-ink-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-primary rounded-sharp flex items-center justify-center font-bold text-white border border-teal-400/30">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider uppercase">HepaTwin</span>
              <span className="text-xxs px-1.5 py-0.5 bg-ink-light rounded-sharp text-clinical-textMuted border border-ink-border">
                SECURE AUTHENTICATION GATEWAY
              </span>
            </div>
            <div className="text-xxs text-slate-400">Clinical & Patient Digital Twin Platform</div>
          </div>
        </div>

        <div className="text-xxs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>DPDP Act 2023 & ICMR Clinical Data Security Standard</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card border border-clinical-borderStrong rounded-sharp p-6 shadow-xl">
          {/* Headline */}
          <div className="text-center pb-4 border-b border-clinical-borderSubtle">
            <h2 className="text-base font-bold text-clinical-textPrimary uppercase tracking-wider">
              Identity & Role Verification
            </h2>
            <p className="text-xxs text-clinical-textSecondary mt-1">
              Select your portal to authenticate into your dedicated digital twin environment
            </p>
          </div>

          {/* Portal Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2 my-5 p-1 bg-slate-100 border border-clinical-borderSubtle rounded-sharp text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('clinician')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-sharp font-bold transition-all ${
                selectedRole === 'clinician'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-clinical-textSecondary hover:text-clinical-textPrimary'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-accent-primary" />
              <span>Clinician Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-sharp font-bold transition-all ${
                selectedRole === 'patient'
                  ? 'bg-accent-secondary text-white shadow-sm'
                  : 'text-clinical-textSecondary hover:text-clinical-textPrimary'
              }`}
            >
              <User className="w-4 h-4 text-white" />
              <span>Patient Portal</span>
            </button>
          </div>

          {/* 1. CLINICIAN LOGIN FORM */}
          {selectedRole === 'clinician' ? (
            <form onSubmit={handleClinicianLogin} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-clinical-borderSubtle rounded-sharp text-xxs text-clinical-textSecondary">
                <strong>Clinician Environment:</strong> Access full patient cohort triage, what-if intervention simulator, non-invasive fibrosis calculators, and raw IoT telemetry.
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  Clinician Name & Designation
                </label>
                <input
                  type="text"
                  required
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary text-clinical-textPrimary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  National Medical Commission (NMC) License ID
                </label>
                <input
                  type="text"
                  required
                  value={clinicianId}
                  onChange={(e) => setClinicianId(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary text-clinical-textPrimary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={clinicianPassword}
                  onChange={(e) => setClinicianPassword(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary text-clinical-textPrimary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-primaryHover text-white font-bold rounded-sharp text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Enter Clinician Workstation</span>
              </button>
            </form>
          ) : (
            /* 2. PATIENT LOGIN FORM */
            <form onSubmit={handlePatientLogin} className="space-y-3 text-xs">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-sharp text-xxs text-amber-900">
                <strong>Patient Environment:</strong> Secure private access to your own liver digital twin, wearable sensor telemetry, 5-year trajectory simulator, and diet self-assessment. (Locked to your data only).
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  Select Your Patient Account
                </label>
                <select
                  value={selectedPersonaId}
                  onChange={(e) => setSelectedPersonaId(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-secondary text-clinical-textPrimary"
                >
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — {p.hepatitisType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  Patient Portal Password / OTP
                </label>
                <input
                  type="password"
                  required
                  value={patientPassword}
                  onChange={(e) => setPatientPassword(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-secondary text-clinical-textPrimary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent-secondary hover:bg-accent-secondaryHover text-white font-bold rounded-sharp text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 transition-colors"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Enter My Personal Twin Portal</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-clinical-borderSubtle px-6 py-2.5 text-xxs text-clinical-textSecondary flex flex-wrap items-center justify-between">
        <span>HepaTwin v2.4 Role-Based Access Control (RBAC) Architecture</span>
        <span>Synthetic sandbox cohort data, not for clinical diagnosis.</span>
      </footer>
    </div>
  );
};
