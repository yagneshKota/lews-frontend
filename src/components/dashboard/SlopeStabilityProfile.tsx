import { Mountain } from 'lucide-react';
import type { RiskZone } from '../../types/dashboard';

interface SlopeStabilityProfileProps {
  zone: RiskZone | null;
  isSimulatedSurge?: boolean;
}

export const SlopeStabilityProfile: React.FC<SlopeStabilityProfileProps> = ({
  zone,
  isSimulatedSurge = false,
}) => {
  if (!zone) return null;

  // Compute geotechnical Factor of Safety (FoS) based on slope angle, soil moisture, and simulated rainfall
  const slopeAngle = zone.slopeAngle || 38;
  const moisture = Math.min(100, (zone.soilMoisture || 65) + (isSimulatedSurge ? 22 : 0));
  const rainfall = (zone.rainfall24h || 75) + (isSimulatedSurge ? 65 : 0);

  // Approximate FoS: Fs = (c' + (gamma * z * cos^2(beta) - u) * tan(phi)) / (gamma * z * sin(beta) * cos(beta))
  // Normalized for UI display:
  const baseFoS = Math.max(
    0.62,
    Number((1.65 - (slopeAngle / 55) * 0.55 - (moisture / 100) * 0.48 - (rainfall / 200) * 0.35).toFixed(2))
  );

  const fosStatus =
    baseFoS < 1.0
      ? { label: 'CRITICAL FAILURE (SLIP DETECTED)', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-600 text-white' }
      : baseFoS < 1.25
      ? { label: 'MARGINALLY STABLE (HIGH RISK)', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-600 text-white' }
      : { label: 'STABLE SLOPE', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-600 text-white' };

  // Calculate pore water pressure (u in kPa) and shear strain
  const porePressureKPa = Math.round(18 + (moisture / 100) * 42);
  const shearDisplacementMm = isSimulatedSurge ? 16.4 : (zone.riskScore > 75 ? 8.2 : 2.1);
  const tensionCrackDepthM = isSimulatedSurge ? 2.8 : (zone.riskScore > 75 ? 1.4 : 0.3);

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332] flex items-center justify-center text-[#D8F3DC] shadow-xs">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
                Geotechnical Slope Cross-Section (DEM)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {zone.sectorCode}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              Subsurface slip surface & Factor of Safety (FoS) analysis
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${fosStatus.badge} shadow-2xs`}>
          FoS: {baseFoS.toFixed(2)}
        </span>
      </div>

      {/* Interactive Geotechnical Cross-Section Diagram (SVG) */}
      <div className="relative my-3 bg-gradient-to-b from-[#F0FDF4]/30 via-[#F8FAFC] to-[#F1F5F9] rounded-xl p-3 border border-[#E2E8F0] overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] font-mono bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200 text-slate-600">
          <span>Slope: <strong className="text-[#0F172A]">{slopeAngle}°</strong></span>
          <span>•</span>
          <span>Elev: <strong className="text-[#0F172A]">{zone.elevation}m</strong></span>
        </div>

        <svg viewBox="0 0 420 180" className="w-full h-44">
          <defs>
            {/* Soil Gradient */}
            <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.85" />
            </linearGradient>

            {/* Bedrock Pattern */}
            <pattern id="bedrockPattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#475569" strokeWidth="2" />
            </pattern>

            {/* Saturation Water Wave */}
            <linearGradient id="waterTableGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Sky / Air Region Background */}
          <rect x="0" y="0" width="420" height="180" fill="transparent" />

          {/* 1. Stable Bedrock Layer (Bottom Substratum) */}
          <polygon
            points="0,180 420,180 420,140 280,120 150,90 0,60"
            fill="#334155"
            opacity="0.95"
          />
          <polygon
            points="0,180 420,180 420,140 280,120 150,90 0,60"
            fill="url(#bedrockPattern)"
            opacity="0.25"
          />
          <text x="320" y="165" fill="#E2E8F0" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
            IMPERVIOUS BEDROCK
          </text>

          {/* 2. Saturated Overburden / Colluvium Soil Layer */}
          <polygon
            points="0,60 150,90 280,120 420,140 420,105 260,75 120,40 0,15"
            fill="url(#soilGradient)"
          />

          {/* 3. Phreatic / Pore Water Saturation Table */}
          <path
            d="M 0 45 Q 140 75 270 100 T 420 125"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          <text x="18" y="40" fill="#0369A1" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
            Pore Water Line (u={porePressureKPa} kPa)
          </text>

          {/* 4. Critical Shear Slip Plane (Curved Failure Arc) */}
          <path
            d="M 70 24 Q 180 85 360 115"
            fill="none"
            stroke={baseFoS < 1.0 ? '#DC2626' : '#EA580C'}
            strokeWidth="3.5"
            strokeDasharray={baseFoS < 1.0 ? 'none' : '6 3'}
            className={baseFoS < 1.0 ? 'animate-pulse' : ''}
          />

          {/* 5. Failure Vector Arrows */}
          <g transform="translate(230, 80) rotate(26)">
            <line x1="0" y1="0" x2="36" y2="0" stroke="#DC2626" strokeWidth="2.5" />
            <polygon points="36,-4 44,0 36,4" fill="#DC2626" />
            <text x="0" y="-8" fill="#991B1B" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
              Shear Slip: {shearDisplacementMm} mm
            </text>
          </g>

          {/* 6. Tension Crack Crown Warning */}
          <line x1="70" y1="12" x2="70" y2="35" stroke="#991B1B" strokeWidth="2" />
          <line x1="66" y1="12" x2="74" y2="12" stroke="#991B1B" strokeWidth="2" />
          <circle cx="70" cy="12" r="3" fill="#DC2626" />
          <text x="76" y="16" fill="#991B1B" fontSize="8.5" fontWeight="bold">
            Crown Crack ({tensionCrackDepthM}m deep)
          </text>

          {/* 7. Borehole Inclinometer Sensor Array Indicator */}
          <line x1="200" y1="50" x2="200" y2="110" stroke="#10B981" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="195" y="44" width="10" height="10" rx="2" fill="#10B981" />
          <text x="175" y="40" fill="#047857" fontSize="8" fontWeight="bold">
            Borehole S-04
          </text>

          {/* 8. Mountain Surface Contour Line */}
          <path
            d="M 0 15 L 120 40 L 260 75 L 420 105"
            fill="none"
            stroke="#1B4332"
            strokeWidth="2.5"
          />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]/70 inline-block" />
            <span>Colluvium Overburden</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#0284C7] inline-block" />
            <span>Pore Pressure Line</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#DC2626] inline-block" />
            <span>Failure Slip Plane</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-emerald-500 inline-block" />
            <span>IoT Inclinometer</span>
          </div>
        </div>
      </div>

      {/* Geotechnical Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#F1F5F9]">
        <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#64748B] uppercase block">
            Pore Pressure (u)
          </span>
          <span className="text-[13px] font-extrabold text-[#0284C7] font-mono">
            {porePressureKPa} kPa
          </span>
          <span className="text-[9px] text-[#64748B] block mt-0.5">
            Hydrostatic load
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#64748B] uppercase block">
            Shear Strain
          </span>
          <span className={`text-[13px] font-extrabold font-mono ${shearDisplacementMm > 5 ? 'text-red-600' : 'text-amber-600'}`}>
            {shearDisplacementMm} mm/d
          </span>
          <span className="text-[9px] text-[#64748B] block mt-0.5">
            Borehole drift
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-bold text-[#64748B] uppercase block">
            Factor of Safety
          </span>
          <span className={`text-[13px] font-extrabold font-mono ${fosStatus.color}`}>
            FoS {baseFoS.toFixed(2)}
          </span>
          <span className="text-[9px] text-[#64748B] block mt-0.5">
            {baseFoS < 1.0 ? 'Failure plane' : 'Equilibrium state'}
          </span>
        </div>
      </div>
    </div>
  );
};
