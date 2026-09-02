import React from 'react';
import {
  Mountain,
  Map,
  Layers,
  CloudRain,
  Route,
  Bell,
  FileSpreadsheet,
  Satellite,
  Ambulance,
  Settings,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavigate: (navId: string) => void;
  criticalAlertsCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isNew?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Landslide Command Hub', icon: Mountain },
  { id: 'live-risk-map', label: 'GIS 3D Topography Map', icon: Map },
  { id: 'slope-stability', label: 'Slope Stability & FoS', icon: Layers, isNew: true },
  { id: 'rainfall-threshold', label: 'I-D Rainfall Envelope', icon: CloudRain, isNew: true },
  { id: 'alerts', label: 'Landslide Alerts (CAP)', icon: Bell },
  { id: 'road-connectivity', label: 'Hill Highway Corridors', icon: Route },
  { id: 'insar-sensors', label: 'Borehole & InSAR Telemetry', icon: Satellite },
  { id: 'field-reports', label: 'Ground Geotag Reports', icon: FileSpreadsheet },
  { id: 'emergency-response', label: 'NDMA Evacuation SOPs', icon: Ambulance },
  { id: 'settings', label: 'Sensor Network Config', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  criticalAlertsCount,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between h-screen sticky top-0 select-none z-30 shadow-[1px_0_6px_rgba(0,0,0,0.03)]">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#F1F5F9] bg-gradient-to-b from-[#F0FDF4]/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] flex items-center justify-center text-white shadow-md shadow-[#1B4332]/20 ring-2 ring-[#D8F3DC]">
              <Mountain className="w-5 h-5 text-[#D8F3DC]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-[15px] tracking-tight text-[#0F172A]">
                  BHU-GUARD
                </h1>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#1B4332] text-white">
                  LEWS AI
                </span>
              </div>
              <p className="text-[10px] text-[#475569] font-medium leading-tight">
                Landslide Early Warning System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
            <span>Disaster Ops & Modeling</span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const badgeCount = item.id === 'alerts' ? criticalAlertsCount : item.badge;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-sm font-bold ring-1 ring-[#2D6A4F]'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#86EFAC]'
                        : 'text-[#64748B] group-hover:text-[#1B4332]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {item.isNew && !isActive && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase font-mono">
                      NEW
                    </span>
                  )}
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                        isActive
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status & SIH Team Info */}
      <div className="p-3 border-t border-[#F1F5F9] bg-[#FAFBFB] space-y-2.5">
        {/* Real-time Telemetry Node Status */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-2 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[10.5px] font-bold text-[#1E293B] leading-tight">
                GSI Sentinel-1 InSAR
              </p>
              <p className="text-[9.5px] text-[#64748B] leading-tight">
                Sub-cm SAR telemetry active
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>

        {/* SIH Team Credential Card */}
        <div className="flex items-center gap-2.5 p-1 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center text-[11px] font-black shadow-xs font-mono">
            SIH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#0F172A] truncate">
              SIH 2026 PS-01 Team
            </p>
            <p className="text-[9.5px] text-[#64748B] truncate">
              National LEWS AI Deployment
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
