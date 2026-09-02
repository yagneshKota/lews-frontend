import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { District } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface RiskIntelligencePanelProps {
  district: District;
}

export const RiskIntelligencePanel: React.FC<RiskIntelligencePanelProps> = ({
  district,
}) => {
  const riskInfo = getRiskColor(district.riskLevel);
  const score = district.currentRisk;

  // Calibrate semi-circular gauge SVG
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRisk = Math.min(100, Math.max(0, score));
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (normalizedRisk / 100) * arcLength;

  return (
    <div className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
              Risk Intelligence
            </h3>
            <p className="text-[10px] text-[#64748B]">
              Real-time model inference & early warning
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
        >
          {district.riskLevel}
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
          />

          {/* Calibrated Threshold Markers */}
          <path
            d="M 80 10 L 80 18"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 40 32 L 46 38"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 120 32 L 114 38"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
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
        </svg>

        {/* Center Gauge Value */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A] block leading-none">
            {score}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mt-1 block">
            Current Risk
          </span>
        </div>
      </div>

      {/* Risk Metrics Strip */}
      <div className="space-y-2 pt-2 border-t border-[#F1F5F9] text-[12px]">
        {/* Trend */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#FAFBFB]">
          <span className="text-[#64748B] flex items-center gap-1.5 text-[11px] font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#C2410C]" />
            24h Trend:
          </span>
          <span className="font-bold text-[#C2410C]">
            {district.riskTrend}
          </span>
        </div>

        {/* Prediction */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#FAFBFB]">
          <span className="text-[#64748B] flex items-center gap-1.5 text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
            Prediction:
          </span>
          <span className="font-semibold text-[#0F172A] text-right truncate max-w-[170px]" title={district.predictionWindow}>
            {district.predictionWindow}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#FAFBFB]">
          <span className="text-[#64748B] flex items-center gap-1.5 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Model Confidence:
          </span>
          <span className="font-bold text-[#166534]">
            {district.confidence}%
          </span>
        </div>
      </div>
    </div>
  );
};
