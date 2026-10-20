// src/components/patient/PatientAwarenessEducation.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Syringe, 
  Users, 
  HelpCircle, 
  Smile, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen,
  Info
} from 'lucide-react';

export const PatientAwarenessEducation: React.FC = () => {
  const { getActivePersona, whatIf, updateWhatIf } = useTwinStore();
  const persona = getActivePersona();

  const [activeTab, setActiveTab] = useState<'physical' | 'moral' | 'precautions' | 'vaccine'>('physical');

  // Handle vaccination status update directly
  const handleVaccineStatusChange = (status: 'unvaccinated' | 'partially_vaccinated' | 'fully_vaccinated') => {
    updateWhatIf({ vaccinationStatus: status });
  };

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 pt-5 shadow-none space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-accent-secondary" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wider text-clinical-textPrimary uppercase">
                Patient Awareness & Holistic Well-Being Guide
              </h2>
              <span className="text-xxs px-2 py-0.5 rounded-sharp bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                PHYSICAL & MORAL EMPOWERMENT
              </span>
            </div>
            <p className="text-xxs text-clinical-textSecondary mt-0.5">
              Understanding your condition, dispelling stigma, household transmission precautions, and hepatitis vaccination
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 text-xxs font-mono">
          <button
            onClick={() => setActiveTab('physical')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'physical'
                ? 'bg-ink text-white'
                : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>1. Physical Understanding</span>
          </button>
          <button
            onClick={() => setActiveTab('moral')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'moral'
                ? 'bg-ink text-white'
                : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>2. Moral & Mental Strength</span>
          </button>
          <button
            onClick={() => setActiveTab('precautions')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'precautions'
                ? 'bg-ink text-white'
                : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>3. Household Precautions</span>
          </button>
          <button
            onClick={() => setActiveTab('vaccine')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'vaccine'
                ? 'bg-ink text-white'
                : 'bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100'
            }`}
          >
            <Syringe className="w-3 h-3 text-accent-primary" />
            <span>4. Vaccination Hub</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PHYSICAL UNDERSTANDING */}
      {/* ========================================================================= */}
      {activeTab === 'physical' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-sharp flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-teal-950 uppercase text-xs">
                Your Liver's Superpower: Remarkable Biological Regeneration
              </h4>
              <p className="text-xxs text-teal-900 mt-1 leading-relaxed">
                The human liver is the only internal organ capable of full cellular regeneration. Even when injured by viruses or fatty deposits, 
                arresting ongoing injury (through consistent daily antivirals, complete alcohol abstinence, and antioxidant nutrition) allows 
                healthy hepatocytes to replicate and reverse fibrous stiffness over 12–24 months.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xxs">
            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-1">
              <span className="font-bold text-clinical-textPrimary text-xs block">What is {persona.hepatitisType}?</span>
              <p className="text-slate-600 leading-relaxed">
                {persona.hepatitisType.includes('B') && (
                  <>Hepatitis B is caused by the HBV virus affecting liver cells. While it can persist chronically, modern oral antivirals (Tenofovir/Entecavir) reliably shut down viral replication to undetectable levels, allowing normal life expectancy.</>
                )}
                {persona.hepatitisType.includes('C') && (
                  <>Hepatitis C is caused by an RNA virus. Today, revolutionary Direct-Acting Antivirals (DAAs) cure over 95% of patients in just 12 weeks with once-daily oral pills without injections.</>
                )}
                {persona.hepatitisType.includes('NASH') && (
                  <>Non-Alcoholic Steatohepatitis (NASH/MASH) occurs when excess calories, sugar, and visceral fat cause fat droplets to accumulate inside liver cells, triggering inflammation. It is fully reversible with weight loss, sleep, and an Indian low-glycemic diet.</>
                )}
                {!persona.hepatitisType.includes('B') && !persona.hepatitisType.includes('C') && !persona.hepatitisType.includes('NASH') && (
                  <>Your liver condition is an active inflammatory state. Continuous monitoring of your transaminases (ALT/AST) and FIB-4 score ensures timely therapeutic intervention before irreversible damage occurs.</>
                )}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-1">
              <span className="font-bold text-clinical-textPrimary text-xs block">Key Symptoms to Track</span>
              <ul className="text-slate-600 space-y-1 list-disc pl-3">
                <li><strong className="text-slate-800">Urine & Eyes:</strong> Dark tea-colored urine or yellowing of the sclera (white of eyes) signals rising bilirubin.</li>
                <li><strong className="text-slate-800">Fatigue Levels:</strong> Chronic daytime lethargy reflects impaired glycogen synthesis.</li>
                <li><strong className="text-slate-800">Abdominal Swelling:</strong> Ankle puffiness or bloating may signal fluid retention (ascites).</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-1">
              <span className="font-bold text-clinical-textPrimary text-xs block">Why Adherence is Everything</span>
              <p className="text-slate-600 leading-relaxed">
                Missing antiviral doses allows the virus to rapidly resume replication and can induce viral drug resistance. 
                Maintaining <strong className="text-teal-800">&gt;90% adherence</strong> guarantees viral suppression and protects your homeostatic reserve.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MORAL & MENTAL STRENGTH */}
      {/* ========================================================================= */}
      {activeTab === 'moral' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-sharp flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 uppercase text-xs">
                Dispelling Stigma: Hepatitis is a Medical Condition, Not a Moral Label
              </h4>
              <p className="text-xxs text-amber-900 mt-1 leading-relaxed">
                Millions of individuals across India and the world live healthy, fulfilling lives with viral or metabolic hepatitis. 
                You did not choose this condition. Having hepatitis carries zero moral fault. With modern medicine and self-discipline, 
                you can protect yourself and your loved ones completely.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xxs">
            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-1.5">
              <span className="font-bold text-clinical-textPrimary text-xs block">Daily Moral Commitments</span>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>I take my medication with gratitude and respect for my body every single day.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>I choose fresh, nourishing Indian foods that give my liver the tools to heal.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>I refuse alcohol, protecting my liver without shame or peer pressure.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>I communicate transparently with my hepatologist and follow clinical guidance.</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-1.5">
              <span className="font-bold text-clinical-textPrimary text-xs block">What CANNOT Transmit Viral Hepatitis</span>
              <p className="text-slate-600 leading-relaxed">
                Educating your family eliminates fear. Hepatitis B and C are <strong className="text-clinical-textPrimary">NOT spread</strong> by:
              </p>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 pt-1">
                <span className="p-1 bg-white border border-clinical-borderSubtle rounded-sharp">❌ Hugging or shaking hands</span>
                <span className="p-1 bg-white border border-clinical-borderSubtle rounded-sharp">❌ Eating together / sharing plates</span>
                <span className="p-1 bg-white border border-clinical-borderSubtle rounded-sharp">❌ Coughing or sneezing</span>
                <span className="p-1 bg-white border border-clinical-borderSubtle rounded-sharp">❌ Using the same bathroom</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HOUSEHOLD PRECAUTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'precautions' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-blue-50/60 border border-blue-300 rounded-sharp flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950 uppercase text-xs">
                Essential Household Precautions & Family Safety Barrier
              </h4>
              <p className="text-xxs text-blue-900 mt-1 leading-relaxed">
                Hepatitis B and C are transmitted exclusively through blood-to-blood and mucosal contact. 
                Implementing these simple domestic habits ensures 100% transmission protection for your spouse, children, and parents:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xxs">
            <div className="p-3 bg-white border border-clinical-borderSubtle rounded-sharp space-y-2">
              <span className="font-bold text-clinical-textPrimary text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-primary" />
                <span>Strict Personal Hygiene Checklist</span>
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">1. Dedicated Toiletries:</strong>
                  Never share razors, electric trimmers, nail clippers, toothbrushes, or tongue cleaners. Micro-cuts can harbor viral particles.
                </div>
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">2. Managing Accidental Bleeds:</strong>
                  Always clean your own cuts. Disinfect any blood spill on tiles or counters with a fresh 1:10 dilution of household bleach (sodium hypochlorite) in water.
                </div>
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">3. Medical & Dental Safety:</strong>
                  Inform your dentist, surgeon, or tattoo artist of your hepatitis status so they ensure standard universal sterilization precautions.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border border-clinical-borderSubtle rounded-sharp space-y-2">
              <span className="font-bold text-clinical-textPrimary text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Family Screening & Intimate Protection</span>
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">1. Household Contact Testing:</strong>
                  All immediate family members (spouse, children, siblings living together) must get tested for HBsAg and Anti-HBs antibody levels.
                </div>
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">2. Spousal Vaccination:</strong>
                  Spouses of patients with Hepatitis B must receive the complete 3-dose Hepatitis B vaccine series and confirm Anti-HBs titer &gt;10 mIU/mL.
                </div>
                <div className="p-1.5 bg-slate-50 border rounded-sharp">
                  <strong className="text-clinical-textPrimary block">3. Barrier Protection:</strong>
                  Use latex barrier protection during sexual intimacy until your doctor confirms undetectable viral load and your partner is confirmed vaccinated.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VACCINATION HUB */}
      {/* ========================================================================= */}
      {activeTab === 'vaccine' && (
        <div className="space-y-3 text-xs">
          {/* Active Vaccination Status Selector */}
          <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-clinical-textPrimary flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-accent-primary" />
                <span>Your Hepatitis Vaccination Status:</span>
              </span>
              <span className={`text-xxs px-2 py-0.5 rounded-sharp font-bold uppercase ${
                whatIf.vaccinationStatus === 'fully_vaccinated'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : whatIf.vaccinationStatus === 'partially_vaccinated'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {whatIf.vaccinationStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xxs">
              {[
                { 
                  id: 'fully_vaccinated', 
                  title: 'Fully Vaccinated', 
                  desc: 'Completed full 3-dose series + Anti-HBs titer >10 mIU/mL confirmed.',
                  badge: 'Protected'
                },
                { 
                  id: 'partially_vaccinated', 
                  title: 'Partially Vaccinated', 
                  desc: 'Received 1 or 2 doses only; booster or follow-up dose pending.',
                  badge: 'Incomplete'
                },
                { 
                  id: 'unvaccinated', 
                  title: 'Unvaccinated / Unknown', 
                  desc: 'Never received Hepatitis vaccine or antibody levels unknown.',
                  badge: 'Urgent Action'
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVaccineStatusChange(opt.id as any)}
                  className={`p-2.5 rounded-sharp border text-left transition-all ${
                    whatIf.vaccinationStatus === opt.id
                      ? 'bg-teal-50 border-accent-primary text-teal-950 shadow-sm font-semibold'
                      : 'bg-white border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs">{opt.title}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded-sharp border">{opt.badge}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Vaccine Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xxs">
            <div className="p-3 bg-white border border-clinical-borderSubtle rounded-sharp space-y-1.5">
              <span className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Hepatitis B Vaccine Schedule</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                Recombinant Hepatitis B vaccine consists of a 3-dose intramuscular series at:
                <br />• <strong className="text-slate-800">Dose 1:</strong> Baseline date (Month 0)
                <br />• <strong className="text-slate-800">Dose 2:</strong> 1 month after Dose 1
                <br />• <strong className="text-slate-800">Dose 3:</strong> 6 months after Dose 1
                <br />Check Anti-HBs titer 1-2 months after the 3rd dose to confirm protection (&gt;10 mIU/mL).
              </p>
            </div>

            <div className="p-3 bg-white border border-clinical-borderSubtle rounded-sharp space-y-1.5">
              <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Hepatitis A Vaccine for Chronic Patients</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                If you already have any chronic liver disease (Hepatitis B, C, or NASH), getting an acute Hepatitis A infection 
                from contaminated water can cause lethal acute-on-chronic liver failure. 
                <strong className="text-blue-950 block mt-1">
                  The 2-dose Hepatitis A inactivated vaccine (given 6 months apart) is clinically mandatory.
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
