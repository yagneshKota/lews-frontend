import React, { useState } from 'react';
import {
  Settings,
  X,
  Sliders,
  Satellite,
  Save,
  Gauge,
} from 'lucide-react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  // Config state sliders
  const [alphaParam, setAlphaParam] = useState(18.5);
  const [betaParam, setBetaParam] = useState(0.42);
  const [porePressureLimit, setPorePressureLimit] = useState(45);
  const [inclinometerAlarmMm, setInclinometerAlarmMm] = useState(2.0);
  const [insarSyncFrequencyMin] = useState(15);
  const [capWebhookUrl, setCapWebhookUrl] = useState('https://cap.ndma.gov.in/api/v2/alerts/dispatch');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('✅ GSI LEWS System Parameters Updated: New I-D thresholds & IoT calibration applied.');
      onClose();
    }, 600);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Settings className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  LEWS System Administration & Calibration
                </h3>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-500 text-white">
                  GSI Admin
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Configure ML model weights, empirical I-D envelopes, and IoT telemetry thresholds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Empirical Rainfall Threshold Formula Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              <Sliders className="w-4 h-4 text-purple-700" />
              <span>GSI Empirical I-D Threshold Parameters (I = α · D⁻ᵝ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#334155]">
                  <span>Scaling Coefficient (α)</span>
                  <span className="font-mono text-purple-700">{alphaParam}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  step={0.5}
                  value={alphaParam}
                  onChange={(e) => setAlphaParam(Number(e.target.value))}
                  className="w-full accent-purple-700"
                />
                <span className="text-[10px] text-[#64748B] block">Default for Himalayas: 18.5</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#334155]">
                  <span>Duration Exponent (β)</span>
                  <span className="font-mono text-purple-700">{betaParam}</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.8}
                  step={0.02}
                  value={betaParam}
                  onChange={(e) => setBetaParam(Number(e.target.value))}
                  className="w-full accent-purple-700"
                />
                <span className="text-[10px] text-[#64748B] block">Default decay factor: 0.42</span>
              </div>
            </div>
          </div>

          {/* 2. Geotechnical Alarm Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              <Gauge className="w-4 h-4 text-purple-700" />
              <span>Geotechnical IoT Sensor Alarm Triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#334155]">
                  <span>Critical Pore Pressure (u-critical)</span>
                  <span className="font-mono text-indigo-700">{porePressureLimit} kPa</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={80}
                  value={porePressureLimit}
                  onChange={(e) => setPorePressureLimit(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-[#64748B] block">Triggers Red Shear Alert</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#334155]">
                  <span>Inclinometer Shear Alarm Rate</span>
                  <span className="font-mono text-orange-700">{inclinometerAlarmMm} mm/hr</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  value={inclinometerAlarmMm}
                  onChange={(e) => setInclinometerAlarmMm(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
                <span className="text-[10px] text-[#64748B] block">Borehole displacement limit</span>
              </div>
            </div>
          </div>

          {/* 3. InSAR & NDMA Webhook Gateway */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              <Satellite className="w-4 h-4 text-purple-700" />
              <span>InSAR Telemetry & NDMA CAP Broadcast API</span>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0F172A]">Sentinel-1 InSAR Satellite Ingest Sync</p>
                  <p className="text-[10px] text-[#64748B]">Interferometric SAR deformation frequency</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Every {insarSyncFrequencyMin} mins
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#334155]">
                  Common Alerting Protocol (CAP) Webhook Endpoint
                </label>
                <input
                  type="text"
                  value={capWebhookUrl}
                  onChange={(e) => setCapWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFBFB] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-white text-xs font-bold text-[#475569]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Applying Parameters...' : 'Save & Calibrate LEWS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
