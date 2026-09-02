import React from 'react';
import {
  X,
  ShieldAlert,
  Mountain,
  CloudRain,
  Activity,
  Building2,
  Users,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';
import type { RiskZone, Sensor } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface ZoneDetailModalProps {
  zone: RiskZone | null;
  sensors: Sensor[];
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: (zone: RiskZone) => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  sensors,
  isOpen,
  onClose,
  onTriggerAlert,
}) => {
  if (!isOpen || !zone) return null;

  const riskInfo = getRiskColor(zone.riskLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                {zone.sectorCode}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
              >
                {zone.riskLevel}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
              {zone.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Metric Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Risk Score</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A]">
                {zone.riskScore}%
              </p>
              <span className="text-[10px] text-[#C2410C] font-semibold">
                Confidence: {zone.confidence}%
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
                <Mountain className="w-3.5 h-3.5 text-[#9C4121]" />
                <span>Elevation & Slope</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A]">
                {zone.slopeAngle}°
              </p>
              <span className="text-[10px] text-[#64748B]">
                {zone.elevation}m AMSL
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
                <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>24h Rainfall</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A]">
                {zone.rainfall24h} mm
              </p>
              <span className="text-[10px] text-[#2563EB]">
                Moisture: {zone.soilMoisture}%
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mb-1">
                <Users className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>At-Risk Pop.</span>
              </div>
              <p className="text-xl font-extrabold text-[#0F172A]">
                {zone.populationAtRisk}
              </p>
              <span className="text-[10px] text-[#64748B]">
                Citizens in zone
              </span>
            </div>
          </div>

          {/* Geological & Risk Description */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Geotechnical Profile & Hazard Summary
            </h4>
            <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E8F0] text-[12px] text-[#334155] leading-relaxed">
              <p>{zone.description}</p>
              <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">
                  Historical recorded landslide occurrences: <strong className="text-[#0F172A]">{zone.historicalEvents} events</strong>
                </span>
                <span className="text-[#C2410C] font-semibold">
                  Prediction timeframe: {zone.predictionWindow}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Sensors Telemetry */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center justify-between">
              <span>Connected In-Situ Sensors ({zone.sensorsCount} nodes)</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Real-time active
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sensors.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <p className="font-bold text-[#0F172A] text-[11px]">{s.name}</p>
                      <p className="text-[10px] text-[#64748B] font-mono">{s.value}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      s.status === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Facilities Nearby */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
              Nearest Emergency Infrastructure
            </h4>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#475569] font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Designated Emergency Facility:
                </span>
                <strong className="text-[#0F172A]">{zone.nearestFacility}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A]"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onTriggerAlert(zone);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12px] font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Trigger Zone Emergency Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
