import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Camera,
  BellRing,
  Building2,
  Route,
  CheckCircle2,
  Shield,
  Send,
  MessageSquare,
  LifeBuoy,
  Zap,
} from 'lucide-react';
import type { District, RiskZone, Facility, Road } from '../../types/dashboard';

interface CitizenPortalViewProps {
  district: District;
  onOpenGisMap: () => void;
  onOpenRoads: () => void;
  onShowToast: (msg: string) => void;
  isSimulatedSurge?: boolean;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  district,
  onOpenGisMap,
  onOpenRoads,
  onShowToast,
  isSimulatedSurge = false,
}) => {
  // Citizen interactive states
  const [sosActive, setSosActive] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [hazardLocation, setHazardLocation] = useState('Upper Ridge Terrace Road, Sector 12');
  const [hazardNotes, setHazardNotes] = useState('');
  const [hazardType, setHazardType] = useState('Ground Crack & Soil Slump');
  const [smsSubscribed, setSmsSubscribed] = useState(true);
  const [whatsappSubscribed, setWhatsappSubscribed] = useState(true);

  // Trigger Citizen SOS
  const handleTriggerSos = () => {
    setSosActive(true);
    onShowToast('🚨 EMERGENCY SOS DISPATCHED: District Disaster Control Room & NDRF unit notified with your live GPS location!');
    setTimeout(() => {
      onShowToast('📞 DDMA Emergency Operator is establishing voice contact via VHF / Mobile...');
    }, 2500);
  };

  // Submit Community Hazard Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportSuccess(true);
      onShowToast('✅ Hazard Report Submitted: Geotagged and assigned to PWD Geotechnical Patrol.');
      setTimeout(() => {
        setReportSuccess(false);
        setHazardNotes('');
      }, 4000);
    }, 600);
  };

  // Send Test WhatsApp / SMS Alert
  const handleSendTestSms = () => {
    onShowToast('📱 [SIMULATED SMS] LEWS ALERT: Moderate landslide risk in Sector 12. Heavy rainfall expected next 4 hrs. Avoid NH-13 Km 46.');
  };

  const currentRisk = isSimulatedSurge ? 94 : district.currentRisk;
  const isDanger = currentRisk >= 75;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Citizen Emergency Header & Status Banner */}
      <div className={`p-6 rounded-3xl border shadow-md text-white transition-all ${
        isDanger
          ? 'bg-gradient-to-r from-red-700 via-red-800 to-rose-900 border-red-600'
          : 'bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#1B4332] border-[#2D6A4F]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-mono">
                Citizen Safety Portal &bull; {district.name}
              </span>
              {isSimulatedSurge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                  ⚡ CLOUDBURST ALERT
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isDanger
                ? '⚠️ High Landslide Danger in Your Sector'
                : '✅ Moderate Weather Vigilance Advisory'}
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              {isDanger
                ? 'High precipitation and ground instability detected. Residents near steep terraces are advised to stay alert and review evacuation routes.'
                : 'All arterial roads currently monitored. Keep emergency numbers saved and report visible hillside cracks.'}
            </p>
          </div>

          {/* 1-Touch Emergency SOS Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleTriggerSos}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
                sosActive
                  ? 'bg-white text-red-700 ring-4 ring-white/50 animate-pulse'
                  : 'bg-red-600 hover:bg-red-500 text-white border border-red-400'
              }`}
            >
              <LifeBuoy className="w-5 h-5" />
              <span>{sosActive ? '🚨 SOS Dispatched!' : '🆘 1-Touch Emergency SOS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Grid of Quick Citizen Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Community Landslide Reporter & Nearest Shelters */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive Report Landslide Hazard Form */}
          <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                    Report Hillside Hazard / Ground Crack
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Submit crowd-sourced field observations directly to DDMA Geotechnical Cell
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Citizen Science
              </span>
            </div>

            {reportSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-extrabold text-emerald-950">
                  Hazard Report Dispatched to PWD & NDRF!
                </h4>
                <p className="text-xs text-emerald-800">
                  Tracking ID: <strong>#CIT-HAZ-{Math.floor(1000 + Math.random() * 9000)}</strong>. A verification drone is scheduled.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#334155]">
                      Observation Type
                    </label>
                    <select
                      value={hazardType}
                      onChange={(e) => setHazardType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A]"
                    >
                      <option>Ground Crack & Soil Slump</option>
                      <option>Rockfall on Roadway</option>
                      <option>Mudflow / Slurry Runoff</option>
                      <option>Retaining Wall Bulging</option>
                      <option>Sudden Spring Water Turbidity</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#334155]">
                      Location / Road Milepost
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={hazardLocation}
                        onChange={(e) => setHazardLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A]"
                      />
                      <MapPin className="w-3.5 h-3.5 text-[#1B4332] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#334155]">
                    Observations / Estimated Crack Width
                  </label>
                  <textarea
                    rows={2}
                    value={hazardNotes}
                    onChange={(e) => setHazardNotes(e.target.value)}
                    placeholder="e.g. Longitudinal tension crack across uphill slope, approx 15cm wide, opened after morning rain..."
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] placeholder-slate-400"
                    required
                  />
                </div>

                {/* Simulated Photo Attachment Pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Photo Attached: <strong>hill_crack_02.jpg</strong> (2.4 MB &bull; GPS Tagged)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Auto-Geotagged
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? 'Uploading Geotag...' : 'Submit Citizen Hazard Observation'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Nearest Community Shelters & Relief Bases */}
          <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                  Designated Evacuation Shelters
                </h3>
              </div>
              <button
                onClick={onOpenGisMap}
                className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"
              >
                <span>View on GIS Map &rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {district.facilities.slice(0, 4).map((fac) => (
                <div
                  key={fac.id}
                  className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] truncate">
                      {fac.name}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {fac.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Capacity: <strong>{fac.capacity} people</strong></span>
                    <span>Free: <strong className="text-emerald-700">{fac.capacity - fac.occupancy} beds</strong></span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-[#1B4332]" />
                    Emergency Contact: <strong className="text-slate-700">{fac.contact}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Alert Subscriptions & Road Status */}
        <div className="lg:col-span-5 space-y-5">
          {/* SMS & WhatsApp Disaster Broadcast Subscriptions */}
          <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                  CAP Alert Subscriptions
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Direct early warning to your mobile device
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* SMS Alert Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">SMS Geofence Alerts</p>
                  <p className="text-[10px] text-[#64748B]">+91 98621 XXXXX (Registered)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsSubscribed(!smsSubscribed)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    smsSubscribed ? 'bg-[#1B4332]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      smsSubscribed ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* WhatsApp Alert Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">WhatsApp Broadcast</p>
                  <p className="text-[10px] text-[#64748B]">Immediate siren & audio voice memo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappSubscribed(!whatsappSubscribed)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    whatsappSubscribed ? 'bg-[#1B4332]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      whatsappSubscribed ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Test SMS Notification Button */}
              <button
                type="button"
                onClick={handleSendTestSms}
                className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Simulate Test Mobile Alert</span>
              </button>
            </div>
          </div>

          {/* Hill Highway & Pass Status Card */}
          <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Route className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                  Road & Transit Advisory
                </h3>
              </div>
              <button
                onClick={onOpenRoads}
                className="text-xs font-bold text-orange-700 hover:underline"
              >
                All Roads &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {district.roads.slice(0, 3).map((road) => (
                <div
                  key={road.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0F172A]">{road.name}</p>
                    <p className="text-[10px] text-[#64748B]">{road.blockageReason}</p>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      road.status === 'BLOCKED'
                        ? 'bg-red-100 text-red-700'
                        : road.status === 'RESTRICTED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {road.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
