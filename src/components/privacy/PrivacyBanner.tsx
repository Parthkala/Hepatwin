// src/components/privacy/PrivacyBanner.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const { privacyMode, togglePrivacyMode } = useTwinStore();

  return (
    <div className="bg-slate-100 border-t border-clinical-borderSubtle px-4 py-2 flex flex-wrap items-center justify-between text-xxs font-mono text-clinical-textSecondary gap-2">
      <div className="flex items-center gap-2">
        <FileCheck className="w-3.5 h-3.5 text-accent-primary" />
        <span>
          COMPLIANCE NOTICE: Data processed under India Digital Personal Data Protection (DPDP) Act 2023 sandbox framework.
        </span>
        {privacyMode && (
          <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 border border-amber-300 rounded-sharp font-bold">
            DE-IDENTIFICATION MASK ACTIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span>Synthetic cohort data, not for clinical use.</span>
        <span className="text-slate-300">|</span>
        <span>HepaTwin v2.4 Academic Hackathon Edition</span>
      </div>
    </div>
  );
};
