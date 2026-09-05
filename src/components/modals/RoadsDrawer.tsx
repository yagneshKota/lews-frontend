import React from 'react';
import {
  X,
  Truck,
  Route,
  Clock,
} from 'lucide-react';
import type { Road } from '../../types/dashboard';

interface RoadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roads: Road[];
}

export const RoadsDrawer: React.FC<RoadsDrawerProps> = ({
  isOpen,
  onClose,
  roads,
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
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-600/30 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hill Highway & Transit Corridor Status
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 font-mono font-semibold">
                BRO / NHIDCL Himalayan Arteries & Sinking Zones
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

        {/* Roads List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {roads.map((road) => {
            const isBlocked = road.status === 'BLOCKED';
            const isRestricted = road.status === 'RESTRICTED';

            return (
              <div
                key={road.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-emerald-800/40 bg-slate-50 dark:bg-[#0e271e] hover:border-emerald-500/50 hover:bg-white dark:hover:bg-[#112f24] transition-all space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {road.name}
                      </h4>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                        {road.highwayCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {road.blockageReason}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      isBlocked
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40'
                        : isRestricted
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
                    }`}
                  >
                    {road.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-emerald-900/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Alt: {road.bypassRouteName || 'None'}</span>
                  </span>

                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Clearance: {road.clearanceEstimate}</span>
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
