// src/components/ui/AddPatientModal.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { UserPlus, X, Activity, HeartPulse, FileText } from 'lucide-react';

export const AddPatientModal: React.FC = () => {
  const { isAddPatientModalOpen, setIsAddPatientModalOpen, addNewPatient } = useTwinStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('42');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [hepatitisType, setHepatitisType] = useState<'Hepatitis B' | 'Hepatitis C' | 'NASH / Fatty Liver Overlap'>('Hepatitis B');
  const [region, setRegion] = useState('Bengaluru, Karnataka');
  const [alt, setAlt] = useState('56');
  const [ast, setAst] = useState('48');
  const [platelets, setPlatelets] = useState('180');
  const [viralLoad, setViralLoad] = useState('2400');
  const [clinicalNotes, setClinicalNotes] = useState('Initial workup for elevated liver enzymes and viral surveillance.');

  if (!isAddPatientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addNewPatient({
      name: name.trim(),
      age: Number(age) || 40,
      sex,
      region,
      hepatitisType,
      clinicalNotes,
      baselineBiomarkers: {
        alt: { value: Number(alt) || 45 } as any,
        ast: { value: Number(ast) || 40 } as any,
        platelets: { value: Number(platelets) || 200 } as any,
        viralLoad: { value: Number(viralLoad) || 500 } as any,
      } as any,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-card border border-clinical-borderStrong rounded-sharp p-5 w-full max-w-xl shadow-2xl text-clinical-textPrimary font-mono max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-clinical-borderSubtle mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-clinical-textPrimary">
                Register New Patient & Calibrate Digital Twin
              </h3>
              <p className="text-xxs text-clinical-textSecondary">
                Creates a new personalized in-silico physiological replica in the cohort
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddPatientModalOpen(false)}
            className="text-clinical-textMuted hover:text-clinical-textPrimary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div className="space-y-2">
            <span className="text-xxs uppercase tracking-wider font-bold text-accent-primary block">
              1. Demographics & Clinical Profile
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xxs text-clinical-textSecondary mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Etiology / DX</label>
                <select
                  value={hepatitisType}
                  onChange={(e) => setHepatitisType(e.target.value as any)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                >
                  <option value="Hepatitis B">Hepatitis B</option>
                  <option value="Hepatitis C">Hepatitis C</option>
                  <option value="NASH / Fatty Liver Overlap">NASH / Fatty Liver Overlap</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Region / Location</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Baseline Biomarkers */}
          <div className="space-y-2 pt-2 border-t border-clinical-borderSubtle">
            <span className="text-xxs uppercase tracking-wider font-bold text-accent-primary block">
              2. Initial Laboratory Biomarkers (ICMR Reference Calibration)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">ALT (U/L)</label>
                <input
                  type="number"
                  required
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">AST (U/L)</label>
                <input
                  type="number"
                  required
                  value={ast}
                  onChange={(e) => setAst(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Platelets (10⁹/L)</label>
                <input
                  type="number"
                  required
                  value={platelets}
                  onChange={(e) => setPlatelets(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xxs text-clinical-textSecondary mb-1">Viral Load (IU/mL)</label>
                <input
                  type="number"
                  required
                  value={viralLoad}
                  onChange={(e) => setViralLoad(e.target.value)}
                  className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div className="pt-2 border-t border-clinical-borderSubtle">
            <label className="block text-xxs text-clinical-textSecondary mb-1">
              EHR Clinical Summary & Comorbidities
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full border border-clinical-borderStrong rounded-sharp p-2 text-xs font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-clinical-borderSubtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddPatientModalOpen(false)}
              className="px-3 py-1.5 border border-clinical-borderStrong text-clinical-textSecondary hover:text-clinical-textPrimary rounded-sharp font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent-primary hover:bg-accent-primaryHover text-white font-bold rounded-sharp font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Instantiate Patient Twin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
