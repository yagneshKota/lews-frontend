import React from 'react';
import {
  Mountain,
  Map,
  Route,
  Bell,
  FileSpreadsheet,
  Ambulance,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavigate: (navId: string) => void;
  criticalAlertsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Landslide Command Hub', icon: Mountain },
  { id: 'live-risk-map', label: 'High-Risk Zones & Map', icon: Map },
  { id: 'alerts', label: 'Landslide Alerts (CAP)', icon: Bell },
  { id: 'road-connectivity', label: 'Hill Highway Corridors', icon: Route },
  { id: 'field-reports', label: 'Ground Incident Reports', icon: FileSpreadsheet },
  { id: 'emergency-response', label: 'NDMA Evacuation SOPs', icon: Ambulance },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  criticalAlertsCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`w-64 bg-[#071610] border-r border-emerald-900/60 flex flex-col justify-between h-screen fixed md:sticky top-0 select-none z-50 md:z-20 shadow-2xl text-white transition-transform duration-200 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-emerald-900/60 bg-gradient-to-b from-emerald-950/60 to-[#071610] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-[#0d2a1f] flex items-center justify-center text-white shadow-lg shadow-emerald-950/80 border border-emerald-400/30 ring-1 ring-emerald-500/20">
                <Mountain className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-[15px] tracking-tight text-white">
                    BHU-GUARD
                  </h1>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 border border-emerald-600/40">
                    LEWS
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/80 font-mono leading-tight">
                  Northeast Telemetry Grid
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 flex items-center justify-between">
            <span>Disaster Ops & Modeling</span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const badgeCount = item.id === 'alerts' ? criticalAlertsCount : item.badge;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/80 font-bold border border-emerald-400/30 ring-1 ring-emerald-400/30'
                    : 'text-slate-300 hover:bg-[#0f291e] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-emerald-400 group-hover:text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {badgeCount !== undefined && badgeCount > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      isActive
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-red-600/30 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-emerald-900/60 bg-[#06120d] space-y-2">
        {/* Real-time Telemetry Node Status */}
        <div className="bg-[#0b1f16] border border-emerald-800/40 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">
                GSI Sentinel-1 InSAR
              </p>
              <p className="text-[9.5px] text-emerald-400/80 leading-tight font-mono">
                ML Pipeline Active
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        {/* System Info Card */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
          <div className="w-7 h-7 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center text-[10px] font-black font-mono">
            NE
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white truncate">
              LEWS Core Grid
            </p>
            <p className="text-[9.5px] text-slate-400 truncate">
              Landslide Early Warning
            </p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};
