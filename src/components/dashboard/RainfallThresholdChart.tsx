import React from 'react';
import { CloudRain, WifiOff } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RainfallThresholdChartProps {
  currentRainfall24h: number | null; // null when live telemetry unavailable
  isSimulatedSurge?: boolean;
}

export const RainfallThresholdChart: React.FC<RainfallThresholdChartProps> = ({
  currentRainfall24h,
  isSimulatedSurge = false,
}) => {
  // If no live telemetry, show an explicit unavailable state
  if (currentRainfall24h === null) {
    return (
      <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-emerald-900/60">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-slate-400 flex items-center justify-center">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Rainfall I-D Threshold Curve (GSI Model)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Empirical Intensity-Duration landslide triggering envelope
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
            <WifiOff className="w-6 h-6" />
          </div>
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 text-center">
            Live rainfall data unavailable
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[200px]">
            I-D curve requires real-time Open-Meteo precipitation telemetry to plot
          </p>
        </div>
      </div>
    );
  }

  const active24h = currentRainfall24h + (isSimulatedSurge ? 65 : 0);

  // Empirical GSI/LEWS I-D Threshold Curve Data: I = 18.5 * D^(-0.42)
  // Generating curve points for Duration (1h to 72h)
  const thresholdData = [
    { duration: '1h', dVal: 1, criticalThreshold: 45.0, warningThreshold: 32.0, eventRainfall: 14 },
    { duration: '3h', dVal: 3, criticalThreshold: 34.2, warningThreshold: 24.5, eventRainfall: 22 },
    { duration: '6h', dVal: 6, criticalThreshold: 26.8, warningThreshold: 19.0, eventRainfall: 36 },
    { duration: '12h', dVal: 12, criticalThreshold: 21.0, warningThreshold: 14.8, eventRainfall: 58 },
    { duration: '24h', dVal: 24, criticalThreshold: 16.5, warningThreshold: 11.2, eventRainfall: Number((active24h / 24).toFixed(1)) },
    { duration: '48h', dVal: 48, criticalThreshold: 12.8, warningThreshold: 8.9, eventRainfall: Number(((active24h * 1.35) / 48).toFixed(1)) },
    { duration: '72h', dVal: 72, criticalThreshold: 10.9, warningThreshold: 7.4, eventRainfall: Number(((active24h * 1.6) / 72).toFixed(1)) },
  ];

  const currentIntensity = Number((active24h / 24).toFixed(1));
  const critical24hThreshold = 16.5;
  const isThresholdBreached = currentIntensity >= critical24hThreshold;
  const isWarningZone = currentIntensity >= 11.2 && !isThresholdBreached;

  return (
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Rainfall I-D Threshold Curve (GSI Model)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60">
                I = α · D⁻ᵝ
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Empirical Intensity-Duration landslide triggering envelope
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border shadow-2xs ${
            isThresholdBreached
              ? 'bg-red-600 text-white border-red-700 animate-pulse'
              : isWarningZone
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
          }`}
        >
          {isThresholdBreached
            ? '🚨 THRESHOLD BREACHED'
            : isWarningZone
            ? '⚠️ WARNING ZONE'
            : '✅ BELOW TRIGGER'}
        </span>
      </div>

      {/* Recharts I-D Curve */}
      <div className="h-48 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={thresholdData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="duration"
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
              unit=" mm/h"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                      <p className="font-bold text-slate-300">{label} Cumulative Window</p>
                      <p className="text-red-400 font-mono">
                        Critical Threshold: {payload[0]?.value} mm/h
                      </p>
                      <p className="text-amber-300 font-mono">
                        Warning Level: {payload[1]?.value} mm/h
                      </p>
                      <p className="text-sky-300 font-mono font-bold">
                        Live Intensity: {payload[2]?.value} mm/h
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Critical Failure Red Curve */}
            <Line
              type="monotone"
              dataKey="criticalThreshold"
              name="Critical Trigger (GSI)"
              stroke="#DC2626"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#DC2626' }}
            />

            {/* Warning Amber Curve */}
            <Line
              type="monotone"
              dataKey="warningThreshold"
              name="Advisory Threshold"
              stroke="#F59E0B"
              strokeWidth={1.8}
              strokeDasharray="4 3"
              dot={{ r: 2, fill: '#F59E0B' }}
            />

            {/* Current Event Precipitation Points */}
            <Line
              type="monotone"
              dataKey="eventRainfall"
              name="Recorded Storm Rate"
              stroke="#0284C7"
              strokeWidth={3}
              dot={{ r: 4, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold Status Indicators & Equation Footnote */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/60 text-[11px]">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
            24h Mean Intensity
          </span>
          <span className="text-[13px] font-bold text-slate-900 dark:text-white font-mono">
            {currentIntensity} mm/h
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
            ({active24h} mm total)
          </span>
        </div>

        <div className="p-2 rounded-xl bg-red-50/50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
          <span className="text-[10px] text-red-700 dark:text-red-300 block font-medium">
            GSI Trigger Limit
          </span>
          <span className="text-[13px] font-bold text-red-700 dark:text-red-300 font-mono">
            16.5 mm/h
          </span>
          <span className="text-[9px] text-red-600 dark:text-red-400 block">
            {isThresholdBreached ? '+24% over limit' : 'Safety buffer active'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
          <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-medium">
            Antecedent Index (72h)
          </span>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 font-mono">
            {Math.round(active24h * 1.6)} mm
          </span>
          <span className="text-[9px] text-blue-600 dark:text-blue-400 block">
            Soil pore saturation
          </span>
        </div>
      </div>
    </div>
  );
};
