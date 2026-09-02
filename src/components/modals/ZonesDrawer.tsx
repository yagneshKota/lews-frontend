import React from 'react';
import {
  X,
  ShieldAlert,
  Crosshair,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#CBD5E1]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Monitored Risk Sectors
              </h3>
              <p className="text-[11px] text-[#64748B]">
                {zones.length} Geological Micro-Zones
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
                className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1B4332]/40 bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      {zone.sectorCode}
                    </span>
                    <h4 className="text-[13px] font-bold text-[#0F172A]">
                      {zone.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                  >
                    {zone.riskScore}% {zone.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 text-[11px]">
                  <div className="bg-[#F8FAFC] p-1.5 rounded-md border border-[#F1F5F9]">
                    <span className="text-[#64748B] text-[10px] block">Slope</span>
                    <strong className="text-[#0F172A]">{zone.slopeAngle}°</strong>
                  </div>
                  <div className="bg-[#F8FAFC] p-1.5 rounded-md border border-[#F1F5F9]">
                    <span className="text-[#64748B] text-[10px] block">Rainfall</span>
                    <strong className="text-[#0F172A]">{zone.rainfall24h}mm</strong>
                  </div>
                  <div className="bg-[#F8FAFC] p-1.5 rounded-md border border-[#F1F5F9]">
                    <span className="text-[#64748B] text-[10px] block">Moisture</span>
                    <strong className="text-[#0F172A]">{zone.soilMoisture}%</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                  <span className="text-[#1B4332] font-semibold flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-[#1B4332]" />
                    Focus on GIS Map &rarr;
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Pred: {zone.predictionWindow}
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
