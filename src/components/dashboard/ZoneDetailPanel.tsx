import React from 'react';
import {
  CloudRain,
  Droplets,
  Mountain,
  History,
  Clock,
  ExternalLink,
  FileText,
  AlertOctagon,
  X,
  ShieldAlert,
} from 'lucide-react';
import type { RiskZone } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface ZoneDetailPanelProps {
  zone: RiskZone | null;
  onClose: () => void;
  onViewZoneDetails: (zone: RiskZone) => void;
  onViewReports: (zone: RiskZone) => void;
  onTriggerAlert: (zone: RiskZone) => void;
}

export const ZoneDetailPanel: React.FC<ZoneDetailPanelProps> = ({
  zone,
  onClose,
  onViewZoneDetails,
  onViewReports,
  onTriggerAlert,
}) => {
  if (!zone) {
    return (
      <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-6 shadow-xs flex flex-col items-center justify-center text-center h-[260px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-emerald-950/70 flex items-center justify-center text-slate-400 dark:text-emerald-400 mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">
          No Sector Selected
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Click on any risk zone polygon on the map to inspect real-time geotechnical parameters and prediction windows.
        </p>
      </div>
    );
  }

  const riskInfo = getRiskColor(zone.riskLevel);

  return (
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-sm animate-in fade-in slide-in-from-right-2 relative">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-400 tracking-wider uppercase">
              {zone.sectorCode}
            </span>
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
            >
              {zone.riskLevel}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {zone.name.toUpperCase()}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Score & Prediction Banner */}
      <div className="flex items-center justify-between py-3 my-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Risk Score
          </span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {zone.riskScore !== null ? `${zone.riskScore}%` : <span className="text-lg text-slate-400 dark:text-slate-500">Unavailable</span>}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ color: riskInfo.strokeColor, backgroundColor: riskInfo.badgeBg }}
          >
            {zone.riskLevel} RISK
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Prediction Window
          </span>
          <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400 font-mono">
            {zone.predictionWindow}
          </span>
        </div>
      </div>

      {/* 4 Geotechnical / Environmental Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-3">
        {/* Rainfall */}
        <div className="bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Rainfall</span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
            {zone.rainfall24h !== null ? `${zone.rainfall24h} mm` : <span className="text-slate-400">N/A</span>} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/ 24h</span>
          </p>
        </div>

        {/* Soil Moisture */}
        <div className="bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
            <span>Soil Moisture</span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
            {zone.soilMoisture !== null ? `${zone.soilMoisture}%` : <span className="text-slate-400">N/A</span>}
          </p>
        </div>

        {/* Slope */}
        <div className="bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Mountain className="w-3.5 h-3.5 text-amber-500" />
            <span>Slope Angle</span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
            {zone.slopeAngle !== null ? `${zone.slopeAngle}°` : <span className="text-slate-400">N/A</span>}
          </p>
        </div>

        {/* Historical Events */}
        <div className="bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <History className="w-3.5 h-3.5 text-emerald-500" />
            <span>Historical</span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
            {zone.historicalEvents} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">events</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3 bg-slate-50 dark:bg-[#071711] p-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60">
        {zone.description}
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-emerald-900/60">
        <button
          onClick={() => onViewZoneDetails(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800/60 bg-white dark:bg-[#0c261c] hover:bg-slate-50 dark:hover:bg-[#123829] text-slate-900 dark:text-white text-[11px] font-bold transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-emerald-400" />
          <span>View Zone</span>
        </button>

        <button
          onClick={() => onViewReports(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800/60 bg-white dark:bg-[#0c261c] hover:bg-slate-50 dark:hover:bg-[#123829] text-slate-900 dark:text-white text-[11px] font-bold transition-colors shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-emerald-400" />
          <span>View Reports</span>
        </button>

        <button
          onClick={() => onTriggerAlert(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors shadow-xs"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-white" />
          <span>Trigger Alert</span>
        </button>
      </div>
    </div>
  );
};
