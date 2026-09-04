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
      return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Pending dispatch':
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Standby':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    case 'Completed':
    default:
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
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
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Recommended Actions
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Operational disaster-management decision support directives
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
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
              className="group p-3 rounded-xl border border-slate-200 dark:border-emerald-900/60 hover:border-emerald-500/50 bg-slate-50 dark:bg-[#071711] hover:bg-white dark:hover:bg-[#0f2a1e] transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 shadow-2xs ${priorityClass}`}
                >
                  P{act.priority}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{act.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}
                >
                  {act.status}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Decision Support Action Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60">
        <button
          onClick={onOpenEmergencyResponse}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Ambulance className="w-4 h-4 text-emerald-200" />
          <span>OPEN EMERGENCY RESPONSE</span>
        </button>
      </div>
    </div>
  );
};
