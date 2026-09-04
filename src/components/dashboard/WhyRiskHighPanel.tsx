import React from 'react';
import {
  HelpCircle,
  CloudRain,
  Droplets,
  Mountain,
  Activity,
  History,
  Sparkles,
} from 'lucide-react';
import type { RiskFactorContribution } from '../../types/dashboard';

interface WhyRiskHighPanelProps {
  factors: RiskFactorContribution[];
}

const getFactorIcon = (category: string) => {
  switch (category) {
    case 'rainfall':
      return <CloudRain className="w-3.5 h-3.5 text-[#2563EB]" />;
    case 'soil':
      return <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />;
    case 'slope':
      return <Mountain className="w-3.5 h-3.5 text-[#9C4121]" />;
    case 'movement':
      return <Activity className="w-3.5 h-3.5 text-[#C2410C]" />;
    case 'historical':
    default:
      return <History className="w-3.5 h-3.5 text-[#64748B]" />;
  }
};

const getBarColor = (category: string) => {
  switch (category) {
    case 'rainfall':
      return 'bg-[#2563EB]';
    case 'soil':
      return 'bg-[#0284C7]';
    case 'slope':
      return 'bg-[#9C4121]';
    case 'movement':
      return 'bg-[#C2410C]';
    case 'historical':
    default:
      return 'bg-[#64748B]';
  }
};

export const WhyRiskHighPanel: React.FC<WhyRiskHighPanelProps> = ({
  factors,
}) => {
  return (
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              XAI Causal Trigger Attribution (SHAP Values)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Weighted geotechnical drivers triggering slope instability
            </p>
          </div>
        </div>
        <div title="SHAP (SHapley Additive exPlanations) values calculated from multi-layer geotechnical ensemble model">
          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
        </div>
      </div>

      {/* Contribution Horizontal Bars */}
      <div className="space-y-3 py-2.5">
        {factors.map((item) => {
          const barColorClass = getBarColor(item.category);

          return (
            <div key={item.factor} className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-slate-100 dark:bg-[#071711]">
                    {getFactorIcon(item.category)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.factor}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline font-mono">
                      ({item.metricValue})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {item.percentage}%
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">weight</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#071711] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColorClass}`}
                  style={{ width: `${item.percentage * 2.5}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span>Model: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">XGBoost-LEWS v2.4</strong> (GSI NLSM benchmarked)</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">SHAP R²: 0.94</span>
      </div>
    </div>
  );
};
