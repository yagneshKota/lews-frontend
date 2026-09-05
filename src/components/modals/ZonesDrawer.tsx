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
        className="bg-white dark:bg-[#0b1b15] border border-slate-200 dark:border-emerald-500/30 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 dark:text-white overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-gradient-to-r dark:from-emerald-950 dark:via-[#0a231b] dark:to-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-600/30 border border-orange-200 dark:border-orange-500/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Monitored Landslide Hazard Sectors
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 font-mono font-semibold">
                {zones.length} Active Geological Micro-Zones in Sector
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zones List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {zones.map((zone) => {
            const riskColor = getRiskColor(zone.riskLevel);

            return (
              <div
                key={zone.id}
                onClick={() => {
                  onSelectZone(zone);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-emerald-800/40 bg-slate-50 dark:bg-[#0e271e] hover:border-emerald-500/60 hover:bg-white dark:hover:bg-[#112f24] transition-all cursor-pointer space-y-3 shadow-xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${riskColor.badgeBg} ${riskColor.badgeText} ${riskColor.badgeBorder}`}
                    >
                      {zone.riskLevel}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {zone.sectorCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <span className="text-slate-900 dark:text-white font-extrabold">{zone.riskScore}%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Risk</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {zone.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {zone.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-emerald-900/60 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    <span>{zone.rainfall24h} mm</span>
                  </span>

                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{zone.soilMoisture}%</span>
                  </span>

                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>{zone.slopeAngle}° slope</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Est. Evac Facility: <strong className="text-slate-700 dark:text-slate-200">{zone.nearestFacility}</strong>
                  </span>

                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Target on GIS &rarr;</span>
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
