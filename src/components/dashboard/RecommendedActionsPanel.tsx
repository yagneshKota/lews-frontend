import React from 'react';
import {
  Ambulance,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { RecommendedAction } from '../../types/dashboard';

interface RecommendedActionsPanelProps {
  actions: RecommendedAction[];
  onSelectAction: (action: RecommendedAction) => void;
  onOpenEmergencyResponse: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Patrol active':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Pending dispatch':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Standby':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Completed':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

const getPriorityBadge = (priority: number) => {
  switch (priority) {
    case 1:
      return 'bg-[#DC2626] text-white';
    case 2:
      return 'bg-[#EA580C] text-white';
    case 3:
    default:
      return 'bg-[#D97706] text-white';
  }
};

export const RecommendedActionsPanel: React.FC<RecommendedActionsPanelProps> = ({
  actions,
  onSelectAction,
  onOpenEmergencyResponse,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
              Recommended Actions
            </h3>
            <p className="text-[10px] text-[#64748B]">
              Operational disaster-management decision support directives
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[#1B4332] bg-[#D8F3DC]/60 px-2 py-0.5 rounded-md border border-[#B7E4C7]">
          {actions.length} Action Items
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 py-3">
        {actions.map((act) => {
          const priorityClass = getPriorityBadge(act.priority);
          const statusClass = getStatusBadge(act.status);

          return (
            <div
              key={act.id}
              onClick={() => onSelectAction(act)}
              className="group p-3 rounded-lg border border-[#E2E8F0] hover:border-[#1B4332]/40 bg-[#FAFBFB] hover:bg-white transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 shadow-2xs ${priorityClass}`}
                >
                  P{act.priority}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#1B4332] transition-colors truncate">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    Location: <span className="font-semibold text-[#334155]">{act.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}
                >
                  {act.status}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1B4332] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Decision Support Action Button */}
      <div className="pt-2 border-t border-[#F1F5F9]">
        <button
          onClick={onOpenEmergencyResponse}
          className="w-full py-2.5 px-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Ambulance className="w-4 h-4 text-[#D8F3DC]" />
          <span>OPEN EMERGENCY RESPONSE</span>
        </button>
      </div>
    </div>
  );
};
