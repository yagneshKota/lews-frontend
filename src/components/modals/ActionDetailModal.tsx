import React, { useState } from 'react';
import {
  X,
  MapPin,
} from 'lucide-react';
import type { RecommendedAction } from '../../types/dashboard';

interface ActionDetailModalProps {
  action: RecommendedAction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (actionId: string, status: any) => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
  action,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>('Pending dispatch');

  React.useEffect(() => {
    if (action) {
      setCurrentStatus(action.status);
    }
  }, [action]);

  if (!isOpen || !action) return null;

  const handleStatusChange = (newStatus: any) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(action.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center text-[12px] font-bold">
              P{action.priority}
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Recommended Decision Directive
              </span>
              <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                {action.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-[12px]">
          <div>
            <span className="text-[#64748B] font-medium block mb-1">Location / Target Segment:</span>
            <div className="p-2.5 bg-[#FAFBFB] rounded-lg border border-[#E2E8F0] flex items-center gap-2 text-[#0F172A] font-semibold">
              <MapPin className="w-4 h-4 text-[#1B4332]" />
              <span>{action.location}</span>
            </div>
          </div>

          <div>
            <span className="text-[#64748B] font-medium block mb-1">Operational Protocol Details:</span>
            <p className="p-3 bg-[#FAFBFB] rounded-lg border border-[#E2E8F0] text-[#334155] leading-relaxed">
              {action.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-[#FAFBFB] rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block mb-0.5">Assigned Agency:</span>
              <strong className="text-[#0F172A] text-[11px] block">{action.assignedAgency}</strong>
            </div>

            <div className="p-2.5 bg-[#FAFBFB] rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block mb-0.5">Target Completion:</span>
              <strong className="text-[#C2410C] text-[11px] block">{action.targetCompletion}</strong>
            </div>
          </div>

          {/* Status Update Trigger */}
          <div>
            <span className="text-[#64748B] font-bold uppercase tracking-wider text-[10px] block mb-2">
              Update Dispatch Status
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Pending dispatch', 'Patrol active', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`py-2 px-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                    currentStatus === st
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                      : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[12px] font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
