import React from 'react';
import {
  X,
  Ban,
  Truck,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#CBD5E1]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Highway & Road Connectivity
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Trans-Arunachal & Arterial Passages
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

        {/* Roads List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {roads.map((road) => {
            const isBlocked = road.status === 'BLOCKED';
            const isRestricted = road.status === 'RESTRICTED';

            return (
              <div
                key={road.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      {road.highwayCode}
                    </span>
                    <h4 className="text-[13px] font-bold text-[#0F172A]">
                      {road.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isBlocked
                        ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                        : isRestricted
                        ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                    }`}
                  >
                    {road.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#475569] leading-relaxed bg-[#FAFBFB] p-2.5 rounded-lg border border-[#F1F5F9]">
                  <strong>Incident:</strong> {road.blockageReason}
                </p>

                <div className="space-y-1 text-[11px] text-[#334155]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Est. Clearance Time:</span>
                    <strong className="text-[#0F172A]">{road.clearanceEstimate}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Bypass Status:</span>
                    <span className={road.bypassAvailable ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {road.bypassAvailable ? road.bypassRouteName : 'No Bypass Route'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span>Last status check: {road.lastUpdated}</span>
                  <span className="flex items-center gap-1 text-[#1B4332] font-semibold">
                    <Truck className="w-3 h-3" /> BRO Clearing Unit Active
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
