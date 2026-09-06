import React, { useState } from 'react';
import {
  User,
  Settings,
  Building2,
  CheckCircle2,
  X,
  Mountain,
} from 'lucide-react';
import type { UserProfile, UserRole } from '../../types/dashboard';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    id: 'usr-cit-01',
    name: 'Citizen',
    role: 'citizen',
    designation: 'Public Safety Portal',
    department: 'Community Reporting Grid',
    district: 'Northeast Region',
    phone: 'Resident ID: CIT-NE',
    avatarInitials: 'CZ',
    badge: 'Citizen',
  },
  govt: {
    id: 'usr-govt-01',
    name: 'Officer',
    role: 'govt',
    designation: 'Disaster Management Officer',
    department: 'DDMA & Response Operations',
    district: 'Disaster Command Center',
    phone: 'Officer Badge: DM-NE',
    avatarInitials: 'OF',
    badge: 'Officer',
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Admin',
    role: 'admin',
    designation: 'System & Model Administrator',
    department: 'GSI & GeoAlert Control Grid',
    district: 'National GeoAlert Network',
    phone: 'Admin ID: AD-NE',
    avatarInitials: 'AD',
    badge: 'Admin',
  },
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      onLoginSuccess(PRESET_USERS[role]);
      onClose();
    }, 280);
  };

  const handleConfirmLogin = () => {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      onLoginSuccess(PRESET_USERS[selectedRole]);
      onClose();
    }, 250);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1b15] border border-emerald-500/30 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-white"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] p-6 relative border-b border-emerald-600/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-emerald-400/30 shadow-lg">
              <Mountain className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono tracking-wide">
                  GeoAlert Disaster Ops
                </span>
                <span className="text-[11px] text-emerald-200 font-medium">
                  Landslide Early Warning
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                GeoAlert Access Portal
              </h2>
              <p className="text-xs text-emerald-200/90">
                Select your role to access customized landslide tools & protocols
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body: 3 Roles */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/90">
              Select User Role (1-Click Instant Access)
            </p>
            <span className="text-[11px] text-slate-400 font-mono">No phone/OTP required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Citizen */}
            <button
              type="button"
              onClick={() => handleSelectRole('citizen')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                selectedRole === 'citizen'
                  ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/40 shadow-lg shadow-blue-950/50'
                  : 'border-emerald-900/50 bg-[#0d231b]/70 hover:border-blue-500/50 hover:bg-[#112c22]'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center mb-3">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-extrabold text-white">Citizen</p>
                  {selectedRole === 'citizen' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-blue-200 font-medium mt-0.5 leading-tight">
                  Public Safety & Alerts
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-900/40 space-y-1">
                <p className="text-[10px] text-slate-300 leading-snug">
                  • Live Northeast rainfall
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • Real-time hazard tier
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • 1-Click field report
                </p>
                <span className="inline-block text-[9px] font-bold text-blue-400 uppercase font-mono mt-1">
                  Resident Access
                </span>
              </div>
            </button>

            {/* 2. Officer */}
            <button
              type="button"
              onClick={() => handleSelectRole('govt')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                selectedRole === 'govt'
                  ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                  : 'border-emerald-900/50 bg-[#0d231b]/70 hover:border-emerald-500/50 hover:bg-[#112c22]'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-extrabold text-white">Officer</p>
                  {selectedRole === 'govt' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-emerald-200 font-medium mt-0.5 leading-tight">
                  DDMA / NDRF Ops
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-900/40 space-y-1">
                <p className="text-[10px] text-slate-300 leading-snug">
                  • 3D GIS topography map
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • Slope FoS & I-D curves
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • CAP evacuation dispatch
                </p>
                <span className="inline-block text-[9px] font-bold text-emerald-400 uppercase font-mono mt-1">
                  Officer Level 2
                </span>
              </div>
            </button>

            {/* 3. Admin */}
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                selectedRole === 'admin'
                  ? 'border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50'
                  : 'border-emerald-900/50 bg-[#0d231b]/70 hover:border-purple-500/50 hover:bg-[#112c22]'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center mb-3">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-extrabold text-white">Admin</p>
                  {selectedRole === 'admin' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-purple-200 font-medium mt-0.5 leading-tight">
                  GSI & System Config
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-purple-900/40 space-y-1">
                <p className="text-[10px] text-slate-300 leading-snug">
                  • Open GIS & Satellite Calibration
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • ML inference thresholds
                </p>
                <p className="text-[10px] text-slate-300 leading-snug">
                  • Telemetry nodes control
                </p>
                <span className="inline-block text-[9px] font-bold text-purple-400 uppercase font-mono mt-1">
                  Root Admin
                </span>
              </div>
            </button>
          </div>

          {/* Active Selection Details Card */}
          <div className="p-4 rounded-2xl bg-[#081711] border border-emerald-900/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                  selectedRole === 'admin'
                    ? 'bg-purple-700'
                    : selectedRole === 'citizen'
                    ? 'bg-blue-600'
                    : 'bg-emerald-600'
                }`}
              >
                {PRESET_USERS[selectedRole].avatarInitials}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {PRESET_USERS[selectedRole].name}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 font-mono">
                    {PRESET_USERS[selectedRole].badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {PRESET_USERS[selectedRole].designation} &bull; {PRESET_USERS[selectedRole].department}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSwitching}
              onClick={handleConfirmLogin}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <span>{isSwitching ? 'Launching...' : 'Continue →'}</span>
            </button>
          </div>

          {/* Real-time system banner */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LightGBM Model &bull; Postgre GeoAlert Schema &bull; 8 Northeast States</span>
            </div>
            <span className="font-mono text-emerald-400 text-[10px]">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
