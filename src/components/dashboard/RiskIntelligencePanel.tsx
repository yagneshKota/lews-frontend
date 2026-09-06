import React from 'react';
import {
  TrendingUp,
  Clock,
  WifiOff,
  Sparkles,
  RadioTower,
} from 'lucide-react';
import type { District } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface RiskIntelligencePanelProps {
  district: District;
}

export const RiskIntelligencePanel: React.FC<RiskIntelligencePanelProps> = ({
  district,
}) => {
  const isUnavailable = district.riskDataStatus === 'UNAVAILABLE' || district.currentRisk === null;
  const riskInfo = getRiskColor(isUnavailable ? 'SAFE' : district.riskLevel);
  const score = district.currentRisk;

  // Calibrate semi-circular gauge SVG
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRisk = isUnavailable ? 0 : Math.min(100, Math.max(0, score ?? 0));
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (normalizedRisk / 100) * arcLength;

  return (
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Risk Intelligence
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Real-time model inference & early warning
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${isUnavailable
              ? 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              : `${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`
            }`}
        >
          {isUnavailable ? 'DATA UNAVAILABLE' : district.riskLevel}
        </span>
      </div>

      {/* Clean Calibrated Semi-Circular Gauge */}
      <div className="relative flex flex-col items-center justify-center pt-4 pb-2">
        <svg
          className="w-48 h-28 overflow-visible"
          viewBox="0 0 160 90"
        >
          {/* Background Track Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-emerald-950"
          />

          {/* Calibrated Threshold Markers */}
          <path d="M 80 10 L 80 18" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 40 32 L 46 38" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 120 32 L 114 38" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Active Colored Arc — hidden when unavailable */}
          {!isUnavailable && (
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              fill="none"
              stroke={riskInfo.strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Gauge Value */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center">
          {isUnavailable ? (
            <>
              <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
                <WifiOff className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
                LIVE DATA
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
                UNAVAILABLE
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                {score}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 block">
                Current Risk
              </span>
            </>
          )}
        </div>
      </div>

      {/* Risk Metrics Strip */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-emerald-900/60 text-[12px]">
        {/* Trend */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-[#071711]">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            24h Trend:
          </span>
          <span className="font-bold text-amber-600 dark:text-amber-400 text-right truncate max-w-[180px]">
            {district.riskTrend}
          </span>
        </div>

        {/* Prediction Window */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-[#071711]">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Prediction:
          </span>
          <span className="font-semibold text-slate-900 dark:text-white text-right truncate max-w-[170px]" title={district.predictionWindow}>
            {district.predictionWindow}
          </span>
        </div>

        {/* Data Source — replaces fake confidence */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-[#071711]">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[11px] font-medium">
            <RadioTower className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Data Source:
          </span>
          <span className={`font-bold text-[11px] ${isUnavailable ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isUnavailable ? 'Unavailable' : 'Open-Meteo + Copernicus DEM'}
          </span>
        </div>
      </div>
    </div>
  );
};
