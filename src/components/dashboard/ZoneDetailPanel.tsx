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
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col items-center justify-center text-center h-[260px]">
        <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-[13px] font-bold text-[#0F172A]">
          No Sector Selected
        </h3>
        <p className="text-[11px] text-[#64748B] max-w-xs mt-1">
          Click on any risk zone polygon on the map to inspect real-time geotechnical parameters and prediction windows.
        </p>
      </div>
    );
  }

  const riskInfo = getRiskColor(zone.riskLevel);

  return (
    <div className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-sm animate-in fade-in slide-in-from-right-2 relative">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase">
              {zone.sectorCode}
            </span>
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
            >
              {zone.riskLevel}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mt-0.5">
            {zone.name.toUpperCase()}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Score & Prediction Banner */}
      <div className="flex items-center justify-between py-3 my-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Risk Score
          </span>
          <span className="text-3xl font-extrabold text-[#0F172A]">
            {zone.riskScore}%
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ color: riskInfo.strokeColor, backgroundColor: riskInfo.badgeBg }}
          >
            {zone.riskLevel} RISK
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-[#64748B] flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-[#94A3B8]" />
            Prediction Window
          </span>
          <span className="text-[12px] font-bold text-[#C2410C]">
            {zone.predictionWindow}
          </span>
        </div>
      </div>

      {/* 4 Geotechnical / Environmental Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-3">
        {/* Rainfall */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
            <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Rainfall</span>
          </div>
          <p className="text-[13px] font-bold text-[#0F172A]">
            {zone.rainfall24h} mm <span className="text-[10px] font-normal text-[#64748B]">/ 24h</span>
          </p>
        </div>

        {/* Soil Moisture */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
            <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Soil Moisture</span>
          </div>
          <p className="text-[13px] font-bold text-[#0F172A]">
            {zone.soilMoisture}%
          </p>
        </div>

        {/* Slope */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
            <Mountain className="w-3.5 h-3.5 text-[#9C4121]" />
            <span>Slope Angle</span>
          </div>
          <p className="text-[13px] font-bold text-[#0F172A]">
            {zone.slopeAngle}°
          </p>
        </div>

        {/* Historical Events */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
            <History className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Historical Events</span>
          </div>
          <p className="text-[13px] font-bold text-[#0F172A]">
            {zone.historicalEvents} <span className="text-[10px] font-normal text-[#64748B]">recorded</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-[#475569] leading-relaxed mb-3 bg-[#FAFBFB] p-2 rounded-lg border border-[#F1F5F9]">
        {zone.description}
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#F1F5F9]">
        <button
          onClick={() => onViewZoneDetails(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-[11px] font-bold transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
          <span>View Zone</span>
        </button>

        <button
          onClick={() => onViewReports(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-[11px] font-bold transition-colors shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-[#64748B]" />
          <span>View Reports</span>
        </button>

        <button
          onClick={() => onTriggerAlert(zone)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold transition-colors shadow-xs"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-white" />
          <span>Trigger Alert</span>
        </button>
      </div>
    </div>
  );
};
