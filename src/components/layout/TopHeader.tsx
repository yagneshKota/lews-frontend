import { useState } from 'react';
import {
  ChevronDown,
  RefreshCw,
  Bell,
  Mountain,
  Zap,
  Radio,
  Satellite,
} from 'lucide-react';
import { AVAILABLE_DISTRICTS } from '../../services/dashboardService';
import { getRiskColor } from '../../utils/riskUtils';

interface TopHeaderProps {
  selectedDistrictId: string;
  onSelectDistrict: (id: string) => void;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenSearch: () => void;
  isSimulatedSurge: boolean;
  onToggleSimulateSurge: () => void;
  onTriggerInstantAlert: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  activeAlertsCount,
  onOpenAlerts,
  isSimulatedSurge,
  onToggleSimulateSurge,
  onTriggerInstantAlert,
}) => {
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentDistrict =
    AVAILABLE_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
    AVAILABLE_DISTRICTS[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-5 py-3 sticky top-0 z-20 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: District Switcher + SIH PS-01 Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* SIH Hackathon Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-xs">
            <span className="text-[10px] font-extrabold tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
              SIH 2026
            </span>
            <span className="text-[11px] font-bold tracking-tight">
              PS-01: AI Landslide Early Warning (LEWS)
            </span>
          </div>

          {/* District Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-left transition-colors shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                <Mountain className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-extrabold text-[#0F172A]">
                    {currentDistrict.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
                <p className="text-[10px] font-semibold text-[#64748B] -mt-0.5">
                  {currentDistrict.state}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {districtDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#F1F5F9] flex items-center justify-between">
                  <span>Select Himalayan / Ghats District</span>
                  <span className="text-[9px] text-[#1B4332]">6 Monitored</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                  {AVAILABLE_DISTRICTS.map((dist) => {
                    const riskInfo = getRiskColor(dist.riskLevel);
                    const isSelected = dist.id === selectedDistrictId;

                    return (
                      <button
                        key={dist.id}
                        onClick={() => {
                          onSelectDistrict(dist.id);
                          setDistrictDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                          isSelected ? 'bg-[#ECFDF5] font-semibold' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-bold text-[#0F172A]">
                              {dist.name}
                            </p>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B]">{dist.state}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                        >
                          {dist.risk}% {dist.riskLevel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* GSI & ISRO Bhuvan Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Satellite className="w-3.5 h-3.5 text-emerald-700" />
            <span>GSI & ISRO Bhuvan InSAR Online</span>
          </div>
        </div>

        {/* Center/Right: Hackathon Demo Simulator + Actions */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* SIMULATION TRIGGER BUTTON FOR SIH EVALUATION DEMO */}
          <button
            onClick={onToggleSimulateSurge}
            title="Simulate sudden Monsoon Cloudburst (+80mm/h) & Earthquake to demonstrate real-time risk escalation"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSimulatedSurge
                ? 'bg-red-600 text-white animate-pulse border border-red-700 ring-2 ring-red-400/40'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-110 border border-amber-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {isSimulatedSurge
                ? '⚡ Cloudburst Surge Active (+80mm/h)'
                : '⚡ Simulate Cloudburst Surge'}
            </span>
          </button>

          {/* Instant CAP Emergency Broadcast Button */}
          <button
            onClick={onTriggerInstantAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-all shadow-xs border border-[#2D6A4F]"
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Dispatch CAP Alert</span>
          </button>

          {/* Refresh telemetry */}
          <button
            onClick={handleRefresh}
            title="Refresh Geological Telemetry"
            className={`p-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] hover:text-[#1B4332] hover:bg-white transition-all ${
              isRefreshing ? 'animate-spin text-[#1B4332]' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Active Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            title="View Active Landslide Alerts"
            className="relative p-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#DC2626] text-white text-[9px] font-extrabold animate-bounce">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
