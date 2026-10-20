// src/components/biomarkers/BiomarkerPanel.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface BiomarkerItemProps {
  label: string;
  abbreviation: string;
  value: number;
  unit: string;
  baseline: number;
  normalRange: [number, number];
  status: 'normal' | 'caution' | 'critical';
  deltaPercent: number;
  clinicalNote: string;
}

const BiomarkerCell: React.FC<BiomarkerItemProps> = ({
  label,
  abbreviation,
  value,
  unit,
  baseline,
  normalRange,
  status,
  deltaPercent,
  clinicalNote,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'critical':
        return 'text-status-critical bg-red-50 border-red-200';
      case 'caution':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-status-normal bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="p-2.5 bg-card border border-clinical-borderSubtle rounded-sharp flex flex-col justify-between hover:border-clinical-borderStrong transition-colors">
      {/* Header & Range */}
      <div className="flex items-center justify-between text-xxs font-mono">
        <span className="font-bold text-clinical-textPrimary uppercase">{abbreviation}</span>
        <span className="text-clinical-textMuted font-mono">
          Ref: {normalRange[0]}-{normalRange[1]} {unit}
        </span>
      </div>

      {/* Large Tabular Number */}
      <div className="my-1 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono tabular-nums text-clinical-textPrimary tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className="text-xs text-clinical-textSecondary font-mono">{unit}</span>
      </div>

      {/* Baseline Deviation & Trend */}
      <div className="pt-1.5 border-t border-clinical-borderSubtle flex items-center justify-between text-xxs font-mono">
        <div className="flex items-center gap-1 text-clinical-textSecondary">
          <span>Base: {baseline}</span>
        </div>
        <div className="flex items-center gap-1">
          {deltaPercent > 0 ? (
            <span className="flex items-center text-status-critical font-bold">
              <ArrowUpRight className="w-3 h-3" />
              +{deltaPercent.toFixed(1)}%
            </span>
          ) : deltaPercent < 0 ? (
            <span className="flex items-center text-status-normal font-bold">
              <ArrowDownRight className="w-3 h-3" />
              {deltaPercent.toFixed(1)}%
            </span>
          ) : (
            <span className="flex items-center text-clinical-textMuted font-medium">
              <Minus className="w-3 h-3" />
              0.0%
            </span>
          )}
          <span className={`px-1 py-0.2 rounded-sharp border text-xxs uppercase font-bold ${getStatusBadge()}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="text-xxs text-clinical-textMuted mt-1 truncate" title={clinicalNote}>
        {clinicalNote}
      </div>
    </div>
  );
};

export const BiomarkerPanel: React.FC = () => {
  const { getActivePersona, getActiveTimelineEntry } = useTwinStore();
  const persona = getActivePersona();
  const timelineEntry = getActiveTimelineEntry();
  const bio = persona.baselineBiomarkers;

  // Use values from timeline scrubber if timeline is scrubbed, else persona baseline
  const currentAlt = timelineEntry ? timelineEntry.alt : bio.alt.value;
  const currentAst = timelineEntry ? timelineEntry.ast : bio.ast.value;
  const currentPlatelets = timelineEntry ? timelineEntry.platelets : bio.platelets.value;

  const biomarkers: BiomarkerItemProps[] = [
    {
      label: 'Alanine Aminotransferase',
      abbreviation: 'ALT',
      value: currentAlt,
      unit: bio.alt.unit,
      baseline: bio.alt.baseline,
      normalRange: bio.alt.normalRange,
      status: currentAlt > 70 ? 'critical' : currentAlt > 45 ? 'caution' : 'normal',
      deltaPercent: Number((((currentAlt - bio.alt.baseline) / bio.alt.baseline) * 100).toFixed(1)),
      clinicalNote: 'Hepatocyte cytosolic membrane integrity marker',
    },
    {
      label: 'Aspartate Aminotransferase',
      abbreviation: 'AST',
      value: currentAst,
      unit: bio.ast.unit,
      baseline: bio.ast.baseline,
      normalRange: bio.ast.normalRange,
      status: currentAst > 60 ? 'critical' : currentAst > 40 ? 'caution' : 'normal',
      deltaPercent: Number((((currentAst - bio.ast.baseline) / bio.ast.baseline) * 100).toFixed(1)),
      clinicalNote: 'Mitochondrial and parenchymal necrosis index',
    },
    {
      label: 'Platelet Count',
      abbreviation: 'PLT',
      value: currentPlatelets,
      unit: bio.platelets.unit,
      baseline: bio.platelets.baseline,
      normalRange: bio.platelets.normalRange,
      status: currentPlatelets < 130 ? 'critical' : currentPlatelets < 150 ? 'caution' : 'normal',
      deltaPercent: Number((((currentPlatelets - bio.platelets.baseline) / bio.platelets.baseline) * 100).toFixed(1)),
      clinicalNote: 'Surrogate indicator of portal hypertension & splenomegaly',
    },
    {
      label: 'Total Bilirubin',
      abbreviation: 'TBIL',
      value: bio.bilirubin.value,
      unit: bio.bilirubin.unit,
      baseline: bio.bilirubin.baseline,
      normalRange: bio.bilirubin.normalRange,
      status: bio.bilirubin.value >= 2.0 ? 'critical' : bio.bilirubin.value > 1.2 ? 'caution' : 'normal',
      deltaPercent: bio.bilirubin.deltaPercent,
      clinicalNote: 'Biliary excretory and clearance capacity',
    },
    {
      label: 'Serum Albumin',
      abbreviation: 'ALB',
      value: bio.albumin.value,
      unit: bio.albumin.unit,
      baseline: bio.albumin.baseline,
      normalRange: bio.albumin.normalRange,
      status: bio.albumin.value < 3.5 ? 'caution' : 'normal',
      deltaPercent: bio.albumin.deltaPercent,
      clinicalNote: 'Major synthetic protein output index',
    },
    {
      label: 'Circulating Viral Load',
      abbreviation: 'VL',
      value: bio.viralLoad.value,
      unit: bio.viralLoad.unit,
      baseline: bio.viralLoad.baseline,
      normalRange: bio.viralLoad.normalRange,
      status: bio.viralLoad.status,
      deltaPercent: bio.viralLoad.deltaPercent,
      clinicalNote: 'Target suppression <20 IU/mL under oral antiviral therapy',
    },
  ];

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 shadow-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            Biomarker Laboratory Profile // ICMR Standard Reference
          </h2>
        </div>
        <div className="text-xxs font-mono text-clinical-textMuted">
          SOURCE: SYNTHETIC ICMR COHORT
        </div>
      </div>

      {/* High density 6-cell grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {biomarkers.map((b) => (
          <BiomarkerCell key={b.abbreviation} {...b} />
        ))}
      </div>
    </div>
  );
};
