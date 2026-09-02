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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#CBD5E1]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                District Alerts Dispatch
              </h3>
              <p className="text-[11px] text-[#64748B]">
                {alerts.length} Total Warnings in Region
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="p-3 border-b border-[#F1F5F9] bg-[#FAFBFB] flex items-center gap-1">
          {['ALL', 'CRITICAL', 'HIGH', 'WATCH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                filterSeverity === sev
                  ? 'bg-[#1B4332] text-white'
                  : 'text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] text-[13px]">
              No alerts found for selected filter.
            </div>
          ) : (
            filteredAlerts.map((alt) => {
              const riskInfo = getRiskColor(alt.severity);

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlert(alt)}
                  className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1B4332]/40 bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                    >
                      {alt.severity} &bull; {alt.riskScore}% RISK
                    </span>
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alt.timeAgo}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                      {alt.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#1B4332]" />
                      {alt.location}
                    </p>
                  </div>

                  <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2">
                    {alt.summary}
                  </p>

                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                    <span className="text-[#1B4332] font-semibold flex items-center gap-1">
                      Review Directives &rarr;
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      Status: {alt.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
