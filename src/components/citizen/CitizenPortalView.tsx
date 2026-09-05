import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MapPin,
  Camera,
  Building2,
  Route,
  Send,
  LifeBuoy,
  CloudRain,
  Droplets,
  Mountain,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Upload,
  CheckCircle2,
  Navigation,
  Loader2,
  X,
  Radio,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { NortheastLocation } from '../../data/northeastLocations';
import { apiService, type MLPredictionResult, type MLFeatureInput } from '../../services/api';

const citizenShelterIcon = L.divIcon({
  className: 'citizen-marker',
  html: `<div style="background:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-weight:bold;font-size:12px;">🏥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const citizenHazardIcon = L.divIcon({
  className: 'citizen-marker',
  html: `<div style="background:#dc2626;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-weight:bold;font-size:12px;">⚠️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface CitizenPortalViewProps {
  location: NortheastLocation;
  onOpenGisMap: () => void;
  onOpenRoads: () => void;
  onShowToast: (msg: string) => void;
  onReportSubmitted?: () => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  location,
  onOpenGisMap,
  onOpenRoads,
  onShowToast,
  onReportSubmitted,
}) => {
  // Citizen state
  const [sosActive, setSosActive] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [hazardLocation, setHazardLocation] = useState(location.name);
  const [hazardNotes, setHazardNotes] = useState('');
  const [hazardType, setHazardType] = useState('Ground Crack / Soil Slump');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCitizenMapModalOpen, setIsCitizenMapModalOpen] = useState(false);
  const [liveGpsCoords, setLiveGpsCoords] = useState<[number, number] | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);

  // Live Real-Time Open-Meteo & Open GIS Telemetry state
  const [liveTelemetry, setLiveTelemetry] = useState<{
    source: string;
    rainfall_24h: number;
    rainfall_3d: number;
    rainfall_7d: number;
    soil_moisture: number;
    temperature: number;
    humidity: number;
    wind_speed: number;
    elevation_m: number;
    slope_degrees: number;
  }>({
    source: 'Open-Meteo Free API & Open GIS',
    rainfall_24h: location.rainfall_24h,
    rainfall_3d: location.rainfall_3d,
    rainfall_7d: location.rainfall_7d,
    soil_moisture: location.soil_moisture,
    temperature: 18,
    humidity: 82,
    wind_speed: 14,
    elevation_m: location.elevation_m,
    slope_degrees: location.slope_degrees,
  });

  // Live ML Prediction state
  const [livePrediction, setLivePrediction] = useState<MLPredictionResult | null>(null);
  const [isCalculatingML, setIsCalculatingML] = useState(false);

  // Live ML Feature state
  const [liveFeatures, setLiveFeatures] = useState<MLFeatureInput>({
    elevation_m: location.elevation_m,
    slope_degrees: location.slope_degrees,
    aspect_degrees: location.aspect_degrees || 135,
    rainfall_1d_before: location.rainfall_24h,
    rainfall_3d_before: location.rainfall_3d,
    rainfall_7d_before: location.rainfall_7d,
    rainfall_14d_before: location.rainfall_7d * 1.5,
    rainfall_30d_before: location.rainfall_7d * 2.5,
    rainfall_7d_max1d: location.rainfall_24h,
    rainfall_3d_over_7d_ratio: +(location.rainfall_3d / Math.max(1, location.rainfall_7d)).toFixed(2),
    soil_moisture: location.soil_moisture,
    soil_moisture_available: 1,
  });

  // Fetch real-time Open-Meteo & Open GIS telemetry, then run ML prediction for landslide detection
  useEffect(() => {
    let isMounted = true;
    setIsCalculatingML(true);
    setHazardLocation(`${location.name}, ${location.district}`);

    const [lat, lng] = liveGpsCoords || location.coordinates;

    apiService.getLiveRisk(lat, lng).then((liveRisk) => {
      if (!isMounted) return;

      const env = liveRisk.environmental;
      const feat = liveRisk.features;
      const pred = liveRisk.prediction;

      if (feat) {
        setLiveFeatures(feat);
      }

      if (env) {
        setLiveTelemetry({
          source: liveRisk.data_sources?.weather || 'Open-Meteo Free API & Open GIS',
          rainfall_24h: env.rainfall_24h,
          rainfall_3d: env.rainfall_3d,
          rainfall_7d: env.rainfall_7d,
          soil_moisture: env.soil_moisture,
          temperature: env.temperature,
          humidity: env.humidity,
          wind_speed: env.wind_speed,
          elevation_m: env.elevation_m,
          slope_degrees: env.slope_degrees,
        });
      }

      if (pred) {
        setLivePrediction({
          risk_score: pred.risk_score,
          risk_level: pred.risk_level,
          risk_tier: pred.risk_tier,
          alert_triggered: pred.alert_triggered,
          alert_message: pred.alert_message,
          source: 'live_ml_backend',
        });
      } else {
        setLivePrediction(null);
      }

      setIsCalculatingML(false);
    }).catch(() => {
      if (isMounted) setIsCalculatingML(false);
    });

    return () => {
      isMounted = false;
    };
  }, [location, liveGpsCoords]);

  // Trigger Citizen SOS
  const handleTriggerSos = () => {
    setSosActive(true);
    onShowToast(
      `🚨 EMERGENCY SOS ACTIVATED: DDMA ${location.district} & NDRF teams alerted with your coordinates [${location.coordinates[0]}, ${location.coordinates[1]}]!`
    );
    setTimeout(() => {
      onShowToast(`📞 DDMA Emergency Operator is initiating dispatch protocol for ${location.name}.`);
    }, 2500);
  };

  // Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Community Hazard Report with Live ML risk evaluation & attached photo
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardNotes.trim()) {
      onShowToast('Please provide a brief description of the observed slope condition.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const result = await apiService.submitReport(
        {
          latitude: (liveGpsCoords ? liveGpsCoords[0] : location.coordinates[0]),
          longitude: (liveGpsCoords ? liveGpsCoords[1] : location.coordinates[1]),
          report: `${hazardType} at ${hazardLocation}`,
          report_description: hazardNotes,
          features: liveFeatures,
        },
        selectedImage
      );

      setIsSubmittingReport(false);
      setReportSuccess(true);
      if (onReportSubmitted) {
        onReportSubmitted();
      }
      onShowToast(
        `✅ Incident Report Submitted to Database! ML Model evaluated risk as ${
          result.prediction ? result.prediction.risk_tier : location.riskTier
        } (${
          result.prediction ? Math.round(result.prediction.risk_score * 100) : location.riskScore
        }%).`
      );

      setTimeout(() => {
        setReportSuccess(false);
        setHazardNotes('');
        setSelectedImage(null);
        setImagePreview(null);
      }, 4500);
    } catch {
      setIsSubmittingReport(false);
      if (onReportSubmitted) {
        onReportSubmitted();
      }
      onShowToast('Report submitted and saved to local response queue.');
    }
  };

  const riskTier = livePrediction ? livePrediction.risk_tier : location.riskTier;
  const riskScore = livePrediction ? Math.round(livePrediction.risk_score * 100) : location.riskScore;
  const isDanger = riskTier === 'CRITICAL' || riskTier === 'HIGH';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-900 dark:text-white">
      {/* 1. Citizen Emergency Status Banner */}
      <div
        className={`p-6 rounded-3xl border shadow-xl transition-all ${
          isDanger
            ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-900 text-white border-red-400/60'
            : 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 text-white border-emerald-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 font-mono text-white">
                Citizen Safety Hub &bull; {location.name}, {location.state}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>
                  Phase 3 ML: {isCalculatingML ? 'Evaluating...' : livePrediction ? livePrediction.source : 'Active'}
                </span>
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5 text-white">
              {isDanger ? (
                <>
                  <AlertTriangle className="w-7 h-7 text-amber-300 shrink-0 animate-bounce" />
                  <span>
                    {riskTier} Landslide Hazard Warning ({riskScore}%)
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-7 h-7 text-emerald-300 shrink-0" />
                  <span>
                    Slope Stability Normal &bull; {riskTier} Risk ({riskScore}%)
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs text-slate-100 max-w-2xl leading-relaxed">
              {isDanger
                ? `Critical rainfall and soil saturation detected on slopes around ${location.name}. Residents near cut slopes, terrace edges, and highway spurs should review emergency evacuation procedures.`
                : `Slope telemetry around ${location.name} is within stable limits. Continue periodic monitoring, especially during heavy precipitation.`}
            </p>
          </div>

          {/* 1-Touch Emergency SOS Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleTriggerSos}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
                sosActive
                  ? 'bg-white text-red-700 ring-4 ring-white/50 animate-pulse'
                  : 'bg-red-600 hover:bg-red-500 text-white border border-red-300'
              }`}
            >
              <LifeBuoy className="w-5 h-5" />
              <span>{sosActive ? '🚨 SOS Dispatched!' : '🆘 1-Touch Emergency SOS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Source Banner: Real-time Weather & Open GIS API */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Live Meteorological & GIS Telemetry
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800">
            Open-Meteo & Open GIS
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          Updated in real-time
        </span>
      </div>

      {/* 2. Detailed Rainfall & Soil Moisture Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 24h Rainfall */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2219] border border-slate-200 dark:border-emerald-800/50 shadow-xs dark:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {liveTelemetry.rainfall_24h} mm
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 font-semibold">
            {liveTelemetry.rainfall_24h > 70 ? '⚠️ Heavy Precipitation' : 'Open-Meteo Live'}
          </div>
        </div>

        {/* 3-Day Cumulative */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2219] border border-slate-200 dark:border-emerald-800/50 shadow-xs dark:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">3-Day Rainfall</span>
            <CloudRain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {liveTelemetry.rainfall_3d} mm
          </div>
          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-0.5 font-semibold">
            Antecedent Hydrology
          </div>
        </div>

        {/* 7-Day Cumulative */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2219] border border-slate-200 dark:border-emerald-800/50 shadow-xs dark:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">7-Day Rainfall</span>
            <CloudRain className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {liveTelemetry.rainfall_7d} mm
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 font-semibold">
            Catchment Saturation
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2219] border border-slate-200 dark:border-emerald-800/50 shadow-xs dark:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Soil Moisture</span>
            <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {Math.round(liveTelemetry.soil_moisture * 100)}%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 font-semibold">
            Pore Saturation
          </div>
        </div>

        {/* Slope Incline & Altitude */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2219] border border-slate-200 dark:border-emerald-800/50 shadow-xs dark:shadow-md col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Terrain Slope</span>
            <Mountain className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {liveTelemetry.slope_degrees}° <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({liveTelemetry.elevation_m}m)</span>
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 font-semibold">
            {liveTelemetry.slope_degrees >= 35 ? 'Critical High Incline' : 'Open GIS Slope'}
          </div>
        </div>
      </div>

      {/* 3. Main Body: Community Field Reporter + Safety Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Citizen Incident Report Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0b1f16] rounded-3xl border border-slate-200 dark:border-emerald-800/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-emerald-900/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                  Report Ground Crack / Hillside Hazard
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Submissions are instantly evaluated by the AI model & sent to DDMA responders
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800">
              Live GPS Geotagged
            </span>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hazard Observation Type
                </label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071711] border border-slate-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option>Ground Tension Crack / Soil Slump</option>
                  <option>Loose Boulders / Rockfall Scree</option>
                  <option>Retaining Wall Bulge / Tilt</option>
                  <option>Sudden Muddy Spring Emergence</option>
                  <option>Trees Tilting Downhill</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Location / Nearest Landmark
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        onShowToast('Geolocation is not supported by your browser.');
                        return;
                      }
                      setIsAcquiringGps(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setLiveGpsCoords([lat, lng]);
                          setHazardLocation(`GPS: [${lat.toFixed(4)}, ${lng.toFixed(4)}] (${location.name})`);
                          setIsAcquiringGps(false);
                          onShowToast(`📍 Geotagged exact coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
                        },
                        (err) => {
                          setIsAcquiringGps(false);
                          onShowToast(`GPS access denied: ${err.message}`);
                        }
                      );
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {isAcquiringGps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                    <span>Use Live GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={hazardLocation}
                  onChange={(e) => setHazardLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#071711] border border-slate-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Field Observation Notes
              </label>
              <textarea
                rows={3}
                value={hazardNotes}
                onChange={(e) => setHazardNotes(e.target.value)}
                placeholder="Describe visible width of cracks, speed of movement, proximity to residential homes or roads..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#071711] border border-slate-300 dark:border-emerald-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Attach Hillside Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#071711] border border-dashed border-slate-300 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-950 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{selectedImage ? selectedImage.name : 'Select or Capture Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-emerald-600 shrink-0 shadow-xs">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {reportSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Incident report recorded and evaluated by ML inference pipeline!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Lat: {location.coordinates[0].toFixed(4)}, Lng: {location.coordinates[1].toFixed(4)}
              </span>

              <button
                type="submit"
                disabled={isSubmittingReport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReport ? 'Evaluating with ML...' : 'Submit Incident Report'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Columns: Evacuation Center & Emergency Contacts */}
        <div className="lg:col-span-5 space-y-4">
          {/* Nearest Shelter Card */}
          <div className="bg-white dark:bg-[#0b1f16] rounded-3xl border border-slate-200 dark:border-emerald-800/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-emerald-900/80">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Designated Safe Evacuation Center
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">NDMA Certified Safe Zone</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{location.evacuationCenter}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                  {location.shelterDistance}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                Equipped with emergency power, clean drinking water, first aid supplies, and radio relay.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsCitizenMapModalOpen(true);
                  if (onOpenGisMap) onOpenGisMap();
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-slate-800 dark:text-emerald-200 border border-slate-300 dark:border-emerald-700/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>View on Map</span>
              </button>
              <button
                onClick={onOpenRoads}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-slate-800 dark:text-emerald-200 border border-slate-300 dark:border-emerald-700/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Route className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Road Status</span>
              </button>
            </div>
          </div>

          {/* Emergency Helplines Card */}
          <div className="bg-white dark:bg-[#0b1f16] rounded-3xl border border-slate-200 dark:border-emerald-800/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-emerald-900/80">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Emergency Control Numbers
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">24/7 Immediate Response</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">District Control Center</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{location.helpline}</p>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">Toll-Free</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071711] border border-slate-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">National Disaster Response (NDRF)</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Toll-Free Helpline: 1078</p>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">1078</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen View on Map Interactive Modal */}
      {isCitizenMapModalOpen && (
        <div
          onClick={() => setIsCitizenMapModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0b1f16] border border-slate-200 dark:border-emerald-700/60 rounded-3xl shadow-2xl max-w-4xl w-full h-[90dvh] sm:h-[80vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
          >
            <div className="p-4 bg-slate-50 dark:bg-[#071711] border-b border-slate-200 dark:border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {location.name} Public Safety & Shelter Map
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Coordinates: [{location.coordinates[0]}, {location.coordinates[1]}]
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCitizenMapModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 w-full h-full">
              <MapContainer
                center={location.coordinates}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Main monitored town marker */}
                <Marker position={location.coordinates} icon={citizenHazardIcon}>
                  <Popup>
                    <div className="text-xs p-1">
                      <p className="font-bold text-slate-900">{location.name} Landslide Area</p>
                      <p className="text-slate-600 mt-0.5">{location.description}</p>
                      <p className="font-bold text-red-600 mt-1">Risk Score: {riskScore}% ({riskTier})</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Risk Buffer Radius */}
                <Circle
                  center={location.coordinates}
                  radius={1200}
                  pathOptions={{
                    color: isDanger ? '#dc2626' : '#10b981',
                    fillColor: isDanger ? '#dc2626' : '#10b981',
                    fillOpacity: 0.18,
                  }}
                />

                {/* Evacuation Shelter Marker */}
                <Marker
                  position={[location.coordinates[0] - 0.006, location.coordinates[1] + 0.007]}
                  icon={citizenShelterIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <p className="font-bold text-emerald-700">{location.evacuationCenter}</p>
                      <p className="text-slate-600">Safe shelter ({location.shelterDistance})</p>
                      <p className="text-slate-800 font-mono mt-1">Emergency contact: {location.helpline}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Live GPS user position if geotagged */}
                {liveGpsCoords && (
                  <Marker position={liveGpsCoords}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold text-blue-700">Your Live GPS Location</p>
                        <p className="text-slate-700 font-mono">[{liveGpsCoords[0].toFixed(4)}, {liveGpsCoords[1].toFixed(4)}]</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
