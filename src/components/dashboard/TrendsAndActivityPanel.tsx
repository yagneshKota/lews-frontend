import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Bar,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Bell,
  FileSpreadsheet,
  Camera,
  ArrowUpRight,
  WifiOff,
} from 'lucide-react';
import type { Alert, FieldReport, TrendPoint } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';
import { getFullImageUrl } from '../../services/api';

interface TrendsAndActivityPanelProps {
  trendData: TrendPoint[];
  alerts: Alert[];
  fieldReports: FieldReport[];
  onOpenAlerts: () => void;
  onOpenFieldReports: () => void;
  onSelectAlert: (alert: Alert) => void;
  onSelectReport: (report: FieldReport) => void;
}

export const TrendsAndActivityPanel: React.FC<TrendsAndActivityPanelProps> = ({
  trendData,
  alerts,
  fieldReports,
  onOpenAlerts,
  onOpenFieldReports,
  onSelectAlert,
  onSelectReport,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'riskTrend' | 'rainfallVsRisk'>('riskTrend');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left (7 Cols): Trend Analytics Charts */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-5 shadow-xs flex flex-col justify-between">
        {/* Header & Chart Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Temporal Analysis (24 Hours)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Hourly risk trajectory & precipitation correlation
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#071711] p-1 rounded-xl">
            <button
              onClick={() => setActiveChartTab('riskTrend')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                activeChartTab === 'riskTrend'
                  ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Risk Trend
            </button>
            <button
              onClick={() => setActiveChartTab('rainfallVsRisk')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                activeChartTab === 'rainfallVsRisk'
                  ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rainfall vs Risk
            </button>
          </div>
        </div>

        {/* Chart View Area */}
        <div className="h-56 w-full pt-3">
          {trendData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
              <WifiOff className="w-8 h-8" />
              <p className="text-[12px] font-semibold text-center">
                24h risk trend unavailable
              </p>
              <p className="text-[10px] text-center max-w-[200px]">
                Live telemetry required to generate hourly risk trajectory
              </p>
            </div>
          ) : activeChartTab === 'riskTrend' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  domain={[30, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Risk Level']}
                />
                <ReferenceLine
                  y={70}
                  label={{ value: 'High Risk (70%)', position: 'insideTopRight', fill: '#C2410C', fontSize: 10 }}
                  stroke="#F97316"
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#EA580C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#94A3B8"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#2563EB"
                  fontSize={10}
                  domain={[0, 120]}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `${val}mm`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="rainfall"
                  name="Rainfall (mm)"
                  fill="#93C5FD"
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="risk"
                  name="Risk Score (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart Subtext / Threshold Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/60 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-500" /> Landslide Risk Score
            </span>
            {activeChartTab === 'rainfallVsRisk' && (
              <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                <span className="w-2.5 h-2 bg-blue-300 rounded-xs" /> Cumulative Rain
              </span>
            )}
          </div>
          <span>Safe &lt; 50% &bull; Watch 50-70% &bull; High &gt; 70%</span>
        </div>
      </div>

      {/* Right (5 Cols): Compact Recent Alerts & Field Reports */}
      <div className="lg:col-span-5 grid grid-cols-1 gap-4">
        {/* Recent Alerts Feed */}
        <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-red-500" />
              <h4 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Recent Alerts
              </h4>
            </div>
            <button
              onClick={onOpenAlerts}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              View All ({alerts.length})
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 py-2">
            {alerts.slice(0, 3).map((alt) => {
              const riskInfo = getRiskColor(alt.severity);

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlert(alt)}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-emerald-900/60 hover:border-slate-300 dark:hover:border-emerald-700 bg-slate-50 dark:bg-[#071711] hover:bg-white dark:hover:bg-[#0f2a1e] transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                    >
                      {alt.severity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                        {alt.location}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {alt.riskScore}% risk &bull; {alt.timeAgo}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    Review &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Field Reports Feed */}
        <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-300 dark:border-emerald-800/60 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              <h4 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Recent Field Reports
              </h4>
            </div>
            <button
              onClick={onOpenFieldReports}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              View All ({fieldReports.length})
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 py-2">
            {fieldReports.slice(0, 2).map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 hover:border-slate-300 dark:hover:border-emerald-700 bg-slate-50 dark:bg-[#071711] hover:bg-white dark:hover:bg-[#0f2a1e] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {report.imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-emerald-700 shrink-0 bg-slate-200 dark:bg-emerald-950">
                      <img src={getFullImageUrl(report.imageUrl) || undefined} alt="Hazard" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {report.hazardType}
                      </span>
                      {report.hasPhotos && (
                        <span className="flex items-center gap-0.5 text-[9px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                          <Camera className="w-2.5 h-2.5" />
                          {report.photoCount || 1}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {report.location} &bull; by {report.observerName} ({report.timeAgo})
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  Inspect &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
