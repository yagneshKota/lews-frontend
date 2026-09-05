import React, { useState } from 'react';
import {
  X,
  Bell,
  Clock,
  MapPin,
} from 'lucide-react';
import type { Alert } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

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
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-600/30 border border-red-200 dark:border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Landslide Alerts & CAP Dispatch Hub
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 font-mono font-semibold">
                {alerts.length} Warnings Active in Northeast Monitoring Grid
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

        {/* Severity Filter Tabs */}
        <div className="p-3 border-b border-slate-200 dark:border-emerald-900/40 bg-slate-100/70 dark:bg-[#071711] flex items-center gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/60 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const riskColor = getRiskColor(alert.severity);

              return (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-emerald-800/40 bg-slate-50 dark:bg-[#0e271e] hover:border-emerald-500/60 hover:bg-white dark:hover:bg-[#112f24] transition-all cursor-pointer space-y-2.5 shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${riskColor.badgeBg} ${riskColor.badgeText} ${riskColor.badgeBorder}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                        #{alert.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {alert.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-emerald-900/60 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{alert.location}</span>
                    </span>

                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      Action: {alert.recommendedAction}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No alerts matching the selected severity filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
