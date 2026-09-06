import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  Smartphone,
  Megaphone,
  MonitorCheck,
  CheckCircle2,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import type { RiskZone } from '../../types/dashboard';
import { dashboardService } from '../../services/dashboardService';

interface TriggerAlertModalProps {
  zone: RiskZone | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (broadcastId: string) => void;
}

export const TriggerAlertModal: React.FC<TriggerAlertModalProps> = ({
  zone,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'cap_network',
    'sms_geofence',
    'siren',
  ]);
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // Sync state when zone changes or modal opens
  React.useEffect(() => {
    if (zone) {
      setSeverity(zone.riskLevel);
      setCustomMessage(
        `GeoAlert WARNING: High landslide threat detected in ${zone.name}. Slope movement & heavy precipitation indicate imminent slope instability within ${zone.predictionWindow}. Residents in lower terraces advised to move to designated community shelters immediately.`
      );
      setBroadcastResult(null);
    }
  }, [zone, isOpen]);

  if (!isOpen || !zone) return null;

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((c) => c !== channelId)
        : [...prev, channelId]
    );
  };

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      const res = await dashboardService.triggerEmergencyAlert({
        zoneId: zone.id,
        zoneName: zone.name,
        severity,
        channels: selectedChannels,
        message: customMessage,
      });
      setBroadcastResult(res.broadcastId);
      setTimeout(() => {
        onSuccess(res.broadcastId);
        setIsBroadcasting(false);
        setBroadcastResult(null);
        onClose();
      }, 1400);
    } catch {
      setIsBroadcasting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#DC2626] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Emergency Alert Protocol Broadcast
              </h3>
              <p className="text-[11px] text-red-100 font-medium">
                National Disaster Management Framework &bull; Common Alerting Protocol (CAP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Target Zone Quick Summary */}
          <div className="p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B]">
                Target Monitored Sector
              </span>
              <h4 className="text-[14px] font-extrabold text-[#7F1D1D]">
                {zone.name} ({zone.sectorCode})
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#991B1B]">Est. Population</span>
              <p className="text-[13px] font-bold text-[#7F1D1D]">
                {zone.populationAtRisk} citizens
              </p>
            </div>
          </div>

          {/* Broadcast Channels Selection */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
              Select Dissemination Channels
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cap_network', name: 'National CAP Gateway', desc: 'Integrated Disaster Alert Feed', icon: Radio },
                { id: 'sms_geofence', name: 'Cell Broadcast / SMS', desc: 'Geofenced telecom blast', icon: Smartphone },
                { id: 'siren', name: 'Physical Siren Network', desc: 'Acoustic valley warning horns', icon: Megaphone },
                { id: 'vms_signs', name: 'Highway VMS Displays', desc: 'Variable message electronic boards', icon: MonitorCheck },
              ].map((ch) => {
                const isChecked = selectedChannels.includes(ch.id);
                const Icon = ch.icon;

                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1E3A8A]'
                        : 'bg-[#FAFBFB] border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 ${isChecked ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
                    <div>
                      <p className="text-[12px] font-bold leading-tight text-[#0F172A]">
                        {ch.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] leading-tight mt-0.5">
                        {ch.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert Message Textarea */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
              Broadcast Message Content
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[12px] text-[#0F172A] focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] focus:outline-none"
            />
          </div>

          {/* Confirmation note */}
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            By issuing this alert, all selected channels will receive instantaneous dispatches and district field response teams will be automatically notified.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F8FAFC] px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isBroadcasting}
            className="px-4 py-2 text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleBroadcast}
            disabled={isBroadcasting || selectedChannels.length === 0}
            className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12px] font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isBroadcasting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting Alert...</span>
              </>
            ) : broadcastResult ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Dispatched ({broadcastResult})</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>CONFIRM & BROADCAST</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
