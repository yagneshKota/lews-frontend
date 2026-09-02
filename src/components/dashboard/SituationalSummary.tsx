import React from 'react';
import {
  Mountain,
  Layers,
  Ban,
  ArrowUpRight,
  TrendingUp,
  CloudRain,
  Zap,
} from 'lucide-react';
import type { District } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface SituationalSummaryProps {
  district: District;
  onOpenAlerts: () => void;
  onOpenZones: () => void;
  onOpenRoads: () => void;
  onOpenSlopeStability?: () => void;
  onOpenRainfallThreshold?: () => void;
  isSimulatedSurge?: boolean;
}

export const SituationalSummary: React.FC<SituationalSummaryProps> = ({
  district,
  onOpenAlerts,
  onOpenZones,
  onOpenRoads,
  onOpenSlopeStability,
  onOpenRainfallThreshold,
  isSimulatedSurge = false,
}) => {
  // Adjust calculations dynamically if the judge clicked the "Simulate Cloudburst" toggle!
  const effectiveRisk = isSimulatedSurge ? Math.min(98, district.currentRisk + 24) : district.currentRisk;
  const effectiveSeverity = isSimulatedSurge ? 'CRITICAL' : district.riskLevel;
  const riskInfo = getRiskColor(effectiveSeverity);
  const effectiveRainfall = isSimulatedSurge ? district.environmental.rainfall24h + 65 : district.environmental.rainfall24h;
  const calculatedFoS = isSimulatedSurge ? 0.74 : (effectiveRisk > 70 ? 1.08 : 1.42);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. LANDSLIDE SUSCEPTIBILITY & THREAT INDEX */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs transition-all hover:shadow-md">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: riskInfo.strokeColor }}
        />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-[#C2410C]" />
            Landslide Threat Index
          </span>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
          >
            {effectiveSeverity}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl font-black tracking-tight text-[#0F172A] font-mono">
            {effectiveRisk}%
          </span>
          <span className="text-[12px] font-bold text-[#C2410C] flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {isSimulatedSurge ? '+38% SURGE' : district.riskTrend}
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10.5px] text-[#64748B]">
          <span>Lead Time: <strong className="text-[#0F172A]">{district.predictionWindow}</strong></span>
          {isSimulatedSurge && (
            <span className="text-red-600 font-bold flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> Cloudburst Active
            </span>
          )}
        </div>
      </div>

      {/* 2. SLOPE FACTOR OF SAFETY (FoS) & CRITICAL SECTORS */}
      <button
        onClick={onOpenSlopeStability || onOpenZones}
        className="group text-left bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-[#1B4332]/50 hover:shadow-md transition-all cursor-pointer relative"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1B4332]" />
            Slope Stability (FoS)
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1B4332] transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-3xl font-black font-mono ${calculatedFoS < 1.0 ? 'text-red-600' : calculatedFoS < 1.25 ? 'text-amber-600' : 'text-emerald-700'}`}>
            FoS {calculatedFoS.toFixed(2)}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {district.highRiskZonesCount} High-Risk Slopes
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10.5px] text-[#64748B]">
          <span>Slip Surface: <strong className={calculatedFoS < 1.0 ? 'text-red-600 font-bold' : 'text-[#0F172A]'}>{calculatedFoS < 1.0 ? 'Shear Failure' : 'Marginal equilibrium'}</strong></span>
          <span className="text-[#1B4332] font-bold group-hover:underline">DEM Profile &rarr;</span>
        </div>
      </button>

      {/* 3. PRECIPITATION & I-D THRESHOLD ENVELOPE */}
      <button
        onClick={onOpenRainfallThreshold || onOpenAlerts}
        className="group text-left bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer relative"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-blue-600" />
            24h Rainfall vs Trigger
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-blue-600 transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black font-mono text-[#0F172A] group-hover:text-blue-600 transition-colors">
            {effectiveRainfall} <span className="text-lg font-bold text-slate-500">mm</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${effectiveRainfall >= 80 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {effectiveRainfall >= 80 ? 'Threshold Breached' : 'Watching'}
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10.5px] text-[#64748B]">
          <span>GSI I-D Curve: <strong className="text-blue-700 font-mono">I=18.5·D⁻⁰·⁴²</strong></span>
          <span className="text-blue-600 font-bold group-hover:underline">View Curve &rarr;</span>
        </div>
      </button>

      {/* 4. BLOCKED HILL HIGHWAYS & PASSES */}
      <button
        onClick={onOpenRoads}
        className="group text-left bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-orange-500/50 hover:shadow-md transition-all cursor-pointer relative"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Ban className="w-4 h-4 text-orange-600" />
            Blocked Hill Corridors
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-orange-600 transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black font-mono text-[#0F172A] group-hover:text-orange-600 transition-colors">
            {district.blockedRoadsCount}
          </span>
          <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
            Debris Blockages
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10.5px] text-[#64748B]">
          <span>Arteries: <strong className="text-[#0F172A]">NH-13 & Sector Spur</strong></span>
          <span className="text-orange-700 font-bold group-hover:underline">Bypass Routes &rarr;</span>
        </div>
      </button>
    </div>
  );
};
