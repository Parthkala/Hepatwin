// src/components/twin/LiverSchematic.tsx
import React from 'react';
import { useTwinStore } from '../../store/twinStore';
import { Layers, Info, AlertTriangle } from 'lucide-react';

interface LiverRegion {
  id: string;
  name: string;
  subsegments: string;
  pathD: string;
  baseStageOffset: number; // 0, 1, 2 depending on vulnerability
}

export const LiverSchematic: React.FC = () => {
  const { getFibrosisMetrics, selectedRegion, setSelectedRegion } = useTwinStore();
  const metrics = getFibrosisMetrics();

  // Map fibrosis stage F0-F4 to color codes
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'F0':
        return '#00873C'; // Normal deep green
      case 'F1':
        return '#5C9E31'; // Mild yellow-green
      case 'F2':
        return '#F2A900'; // Moderate Caution Amber
      case 'F3':
        return '#E36414'; // Severe Burnt Orange
      case 'F4':
        return '#C8102E'; // Cirrhosis Critical Red
      default:
        return '#006D77';
    }
  };

  const currentStage = metrics.metavirStage;

  // Anatomical Liver Segments (Couinaud segments represented in stylised clinical vector)
  const regions: LiverRegion[] = [
    {
      id: 'right-anterior',
      name: 'Right Anterior Sector (Segments V & VIII)',
      subsegments: 'Seg V / VIII — High metabolic and postprandial perfusion',
      pathD: 'M 190,40 C 260,35 320,70 330,130 C 335,170 310,210 260,230 C 220,245 190,220 185,170 C 182,130 185,80 190,40 Z',
      baseStageOffset: 0,
    },
    {
      id: 'right-posterior',
      name: 'Right Posterior Sector (Segments VI & VII)',
      subsegments: 'Seg VI / VII — Prone to steatotic accumulation & fibrosis stiffening',
      pathD: 'M 330,130 C 365,160 365,220 330,250 C 295,275 250,265 260,230 C 310,210 335,170 330,130 Z',
      baseStageOffset: 0,
    },
    {
      id: 'left-medial',
      name: 'Left Medial Segment (Segment IV - Quadrate Lobe)',
      subsegments: 'Seg IV — Periportal zone and hilar junction',
      pathD: 'M 140,55 C 170,45 190,40 185,170 C 180,210 150,235 125,230 C 110,225 115,160 125,110 C 130,85 135,70 140,55 Z',
      baseStageOffset: 0,
    },
    {
      id: 'left-lateral',
      name: 'Left Lateral Sector (Segments II & III)',
      subsegments: 'Seg II / III — Subcapsular region and marginal elasticity',
      pathD: 'M 140,55 C 100,65 60,95 40,140 C 20,185 30,220 65,235 C 95,245 110,225 125,230 C 115,160 130,85 140,55 Z',
      baseStageOffset: 0,
    },
    {
      id: 'caudate',
      name: 'Caudate Lobe (Segment I - Deep Venous Drainage)',
      subsegments: 'Seg I — Independent inferior vena cava drainage; hypertrophies in F4',
      pathD: 'M 160,110 C 180,105 195,120 190,145 C 185,165 165,165 155,145 C 150,130 155,115 160,110 Z',
      baseStageOffset: metrics.metavirStage === 'F4' ? 1 : 0,
    },
  ];

  const activeRegionData = regions.find((r) => r.id === selectedRegion) || regions[0];

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-3 flex flex-col h-full shadow-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-clinical-borderSubtle">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-clinical-textPrimary uppercase">
            Central Twin Panel // Hepatic Structural Morphology
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xxs font-mono">
          <span className="text-clinical-textSecondary">State:</span>
          <span
            className="px-2 py-0.5 rounded-sharp font-bold text-white text-xxs"
            style={{ backgroundColor: getStageColor(currentStage) }}
          >
            METAVIR {currentStage}
          </span>
        </div>
      </div>

      {/* Interactive Anatomical SVG Schematic */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-50 border border-clinical-borderSubtle rounded-sharp p-2">
        <svg
          viewBox="0 0 390 280"
          className="w-full max-w-[340px] h-auto drop-shadow-none cursor-pointer select-none"
        >
          <defs>
            {/* Clean subtle crosshatch pattern for severe fibrosis stages */}
            <pattern id="fibrosisHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Liver Parenchymal Segments */}
          {regions.map((region) => {
            const isSelected = selectedRegion === region.id;
            const fillColor = getStageColor(currentStage);

            return (
              <g
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className="transition-all duration-200 group"
              >
                <path
                  d={region.pathD}
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.95 : 0.82}
                  stroke={isSelected ? '#0B1F33' : '#FFFFFF'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-colors hover:brightness-110"
                />
                {/* Apply hatch texture for advanced stages (F3/F4) */}
                {(currentStage === 'F3' || currentStage === 'F4') && (
                  <path
                    d={region.pathD}
                    fill="url(#fibrosisHatch)"
                    stroke="transparent"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}

          {/* Portal Triad / Gallbladder anatomical landmark */}
          <ellipse cx="178" cy="180" rx="9" ry="16" fill="#006D77" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 178,164 Q 185,150 190,135" stroke="#006D77" strokeWidth="2.5" fill="none" strokeDasharray="2,2" />
          
          <text x="182" y="210" fontSize="9" fontFamily="IBM Plex Mono" fill="#0B1F33" fontWeight="600">
            HILUM
          </text>
        </svg>

        {/* Dynamic Stage Pill Overlay */}
        <div className="absolute top-2 right-2 bg-white/95 border border-clinical-borderSubtle px-2 py-1 rounded-sharp text-xxs font-mono space-y-0.5 shadow-none">
          <div className="text-clinical-textMuted uppercase">Parenchymal Stiffness</div>
          <div className="font-bold text-clinical-textPrimary">
            {metrics.metavirStage === 'F0' && 'F0: Normal (<5.8 kPa)'}
            {metrics.metavirStage === 'F1' && 'F1: Mild (5.8 - 7.0 kPa)'}
            {metrics.metavirStage === 'F2' && 'F2: Significant (7.1 - 9.4 kPa)'}
            {metrics.metavirStage === 'F3' && 'F3: Advanced Bridging (9.5 - 12.4 kPa)'}
            {metrics.metavirStage === 'F4' && 'F4: Cirrhosis (>12.5 kPa)'}
          </div>
        </div>
      </div>

      {/* Region Inspection Sub-panel */}
      <div className="mt-2.5 p-2 bg-slate-50 border border-clinical-borderSubtle rounded-sharp text-xs font-mono">
        <div className="flex items-center justify-between text-xxs text-clinical-textMuted uppercase pb-1 mb-1 border-b border-clinical-borderSubtle">
          <span>Active Anatomical Sector</span>
          <span className="text-accent-primary font-bold">CLICK REGION TO INSPECT</span>
        </div>
        <div className="font-bold text-clinical-textPrimary text-xs">{activeRegionData.name}</div>
        <div className="text-xxs text-clinical-textSecondary mt-0.5">{activeRegionData.subsegments}</div>
        <div className="mt-1.5 flex items-center gap-3 text-xxs">
          <span className="text-clinical-textMuted">Microvascular status:</span>
          <span className="font-semibold text-clinical-textPrimary">
            {metrics.metavirStage === 'F4' ? 'Sinusoidal capillarization / portal hypertension' : 'Preserved fenestrated endothelium'}
          </span>
        </div>
      </div>
    </div>
  );
};
