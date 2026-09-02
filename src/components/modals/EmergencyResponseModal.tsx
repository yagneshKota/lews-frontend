import React, { useState } from 'react';
import {
  X,
  Ambulance,
  Shield,
  Radio,
  Truck,
  Building2,
} from 'lucide-react';
import type { District } from '../../types/dashboard';

interface EmergencyResponseModalProps {
  district: District;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyResponseModal: React.FC<EmergencyResponseModalProps> = ({
  district,
  isOpen,
  onClose,
}) => {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Activate District Emergency Operations Center (DEOC) Level 2 Protocol', done: true, time: '13:30' },
    { id: 2, text: 'Issue CAP Multi-Channel Broadcast to Tawang Sector 12 and Sela Corridor', done: true, time: '13:45' },
    { id: 3, text: 'Pre-position NDRF 12th Bn Quick Response Team at Jaswant Post', done: true, time: '14:05' },
    { id: 4, text: 'Mobilize BRO heavy wheel loaders for NH-13 Km 46 debris clearance', done: false, time: 'Pending' },
    { id: 5, text: 'Open Community Evacuation Center B with diesel gensets and drinking water', done: false, time: 'Pending' },
    { id: 6, text: 'Instruct local police to maintain strict vehicular curfew on Sector 12 Ring Spur', done: false, time: 'Pending' },
  ]);

  if (!isOpen) return null;

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Ambulance className="w-5 h-5 text-[#D8F3DC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight">
                  District Disaster Management Response Center
                </h3>
                <span className="text-[10px] font-extrabold bg-[#F97316] text-white px-2 py-0.5 rounded-md">
                  LEVEL 2 ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[#D8F3DC]/80 font-medium mt-0.5">
                {district.name} &bull; Incident Command Unified Operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Resource Readiness Grid */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mb-2.5">
              Staged Agencies & Inter-Agency Force Assets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#1B4332]" />
                    NDRF 12th Bn
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Mobilized
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">42 Personnel &bull; 2 Dog Squads</p>
                <p className="text-[10px] text-[#334155] mt-1 font-mono">Radio: TAC-CH-2</p>
              </div>

              <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#EA580C]" />
                    BRO Task Force
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    On-Site
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">3 Excavators &bull; 2 Wheel Loaders</p>
                <p className="text-[10px] text-[#334155] mt-1 font-mono">Location: Km 46.2</p>
              </div>

              <div className="p-3.5 bg-[#FAFBFB] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#2563EB]" />
                    DDMA Medical Unit
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    Standby
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">4 ALS Ambulances &bull; 2 Trauma Kits</p>
                <p className="text-[10px] text-[#334155] mt-1 font-mono">Base: Civil Hospital</p>
              </div>
            </div>
          </div>

          {/* Operational Incident Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#64748B]">
                Standard Operating Incident Checklist
              </h4>
              <span className="text-[11px] text-[#1B4332] font-semibold">
                {checklist.filter((c) => c.done).length} of {checklist.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    item.done
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                      : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 rounded text-[#1B4332] focus:ring-[#1B4332]"
                    />
                    <span className={`text-[12px] font-medium ${item.done ? 'line-through text-[#15803D]' : 'text-[#0F172A]'}`}>
                      {item.text}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Encrypted Inter-Agency Frequency: <strong>148.550 MHz</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[12px] font-bold rounded-lg transition-colors shadow-xs"
          >
            Save & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
