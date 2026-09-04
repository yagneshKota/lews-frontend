import React from 'react';
import {
  X,
  ShieldAlert,
  Crosshair,
  Droplets,
  CloudRain,
  Compass,
} from 'lucide-react';
import type { RiskZone } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface ZonesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  zones: RiskZone[];
  onSelectZone: (zone: RiskZone) => void;
}

export const ZonesDrawer: React.FC<ZonesDrawerProps> = ({
  isOpen,
  onClose,
  zones,
  onSelectZone,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1b15] border border-emerald-500/30 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-150 text-white overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#0a231b] to-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Monitored Landslide Hazard Sectors
              </h3>
              <p className="text-[11px] text-emerald-300/80 font-mono">
                {zones.length} Active Geological Micro-Zones in Sector
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-emerald-900/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zones List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {zones.map((zone) => {
            const riskInfo = getRiskColor(zone.riskLevel);

            return (
              <div
                key={zone.id}
                onClick={() => {
                  onSelectZone(zone);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-emerald-800/40 bg-[#0e271e] hover:border-emerald-500/60 hover:bg-[#112f24] transition-all cursor-pointer space-y-3 shadow-xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {zone.name}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {zone.sectorCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {zone.description}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                  >
                    {zone.riskScore}% {zone.riskLevel}
                  </span>
                </div>

                {/* Geotechnical metrics strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-900/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>{zone.rainfall24h} mm (24h)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    <span>{zone.soilMoisture}% Sat.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>{zone.slopeAngle}° Slope</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                  <span>{zone.populationAtRisk} population at risk</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Select & Locate on Map →</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
