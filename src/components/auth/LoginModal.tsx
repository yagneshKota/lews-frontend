import React, { useState } from 'react';
import {
  Shield,
  User,
  Settings,
  Building2,
  CheckCircle2,
  X,
  ArrowRight,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import type { UserProfile, UserRole } from '../../types/dashboard';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  govt: {
    id: 'usr-govt-01',
    name: 'Dr. Rajeshwar Sharma, IAS',
    role: 'govt',
    designation: 'District Magistrate & DDMA Chairman',
    department: 'District Disaster Management Authority (DDMA)',
    district: 'Tawang Command Center',
    phone: '+91 94360 XXXXX',
    avatarInitials: 'DM',
    badge: 'Govt Disaster Officer',
  },
  citizen: {
    id: 'usr-cit-01',
    name: 'Tenzing Norbu',
    role: 'citizen',
    designation: 'Local Resident & Community Volunteer',
    department: 'Tawang Sector 12 Ward Council',
    district: 'Tawang Valley',
    phone: '+91 98621 XXXXX',
    avatarInitials: 'TN',
    badge: 'Citizen / Resident',
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Ananya Deshmukh, Ph.D.',
    role: 'admin',
    designation: 'Chief Geoscientist & System Admin',
    department: 'Geological Survey of India (GSI) - LEWS Cell',
    district: 'National Telemetry Grid',
    phone: '+91 91100 XXXXX',
    avatarInitials: 'AD',
    badge: 'System & GSI Admin',
  },
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authStep, setAuthStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 1-Click Demo Login
  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(PRESET_USERS[role]);
      onClose();
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authStep === 'credentials') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setAuthStep('otp');
      }, 500);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(PRESET_USERS[selectedRole]);
        onClose();
      }, 500);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header with gradient branding */}
        <div className="bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
              <Shield className="w-6 h-6 text-[#D8F3DC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                  SIH 2026 PS-01
                </span>
                <span className="text-[11px] text-emerald-200 font-semibold">
                  Multi-Role Auth
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                BHU-GUARD LEWS Access Portal
              </h2>
              <p className="text-xs text-emerald-100">
                Select your role to access customized landslide tools & protocols
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Role Selection Cards */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-2.5">
              Select User Profile / Clearance Level
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Govt Officer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('govt');
                  setAuthStep('credentials');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'govt'
                    ? 'border-[#1B4332] bg-[#ECFDF5] ring-2 ring-[#1B4332]/20 shadow-xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-white flex items-center justify-center mb-2 shadow-xs">
                  <Building2 className="w-4 h-4 text-[#D8F3DC]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#0F172A] leading-tight">
                    Govt Officer
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                    DDMA / NDRF Ops
                  </p>
                </div>
                <span className="text-[9px] font-extrabold text-[#1B4332] mt-2 block uppercase font-mono">
                  Level 2 Clearance
                </span>
              </button>

              {/* 2. Citizen */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('citizen');
                  setAuthStep('credentials');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'citizen'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
                  <User className="w-4 h-4 text-blue-100" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#0F172A] leading-tight">
                    Citizen / Resident
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                    Public Safety Hub
                  </p>
                </div>
                <span className="text-[9px] font-extrabold text-blue-700 mt-2 block uppercase font-mono">
                  SOS & Alerts
                </span>
              </button>

              {/* 3. System Admin */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setAuthStep('credentials');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'admin'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20 shadow-xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center mb-2 shadow-xs">
                  <Settings className="w-4 h-4 text-purple-200" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#0F172A] leading-tight">
                    System Admin
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                    GSI / InSAR Tech
                  </p>
                </div>
                <span className="text-[9px] font-extrabold text-purple-700 mt-2 block uppercase font-mono">
                  Full Config
                </span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Login Banner for Hackathon Judges */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-amber-950">
                  SIH Quick 1-Click Demo Authentication
                </p>
                <p className="text-[10px] text-amber-800">
                  Instantly switch to <strong className="font-bold">{PRESET_USERS[selectedRole].name}</strong> ({PRESET_USERS[selectedRole].badge})
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin(selectedRole)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-all shrink-0 active:scale-95"
            >
              {loading ? 'Authenticating...' : '1-Click Login →'}
            </button>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {authStep === 'credentials' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#334155] flex items-center justify-between">
                    <span>
                      {selectedRole === 'govt'
                        ? 'Government Official ID / SPARROW ID'
                        : selectedRole === 'citizen'
                        ? 'Mobile Number / Aadhaar Virtual ID'
                        : 'GSI National Registry Username'}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      (Simulated: any text works)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        selectedRole === 'govt'
                          ? 'e.g. DDMA-TAWANG-084'
                          : selectedRole === 'citizen'
                          ? 'e.g. +91 98765 43210'
                          : 'e.g. gsi.admin@lews.gov.in'
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#334155] flex items-center justify-between">
                    <span>Password / Security Key</span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      Demo password: password123
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Security Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Simulated 6-digit OTP dispatched to registered device of <strong>{PRESET_USERS[selectedRole].name}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#334155] block">
                    Enter Verification OTP (Simulated: enter any 6 digits e.g. 748291)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="7 4 8 2 9 1"
                    className="w-full text-center tracking-widest text-lg font-mono font-bold px-3.5 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('credentials')}
                    className="w-1/3 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569]"
                  >
                    &larr; Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authorizing...' : 'Complete Sign In'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
