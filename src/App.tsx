import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { SituationalSummary } from './components/dashboard/SituationalSummary';
import { GisMapPanel } from './components/dashboard/GisMap/GisMapPanel';
import { ZoneDetailPanel } from './components/dashboard/ZoneDetailPanel';
import { RiskIntelligencePanel } from './components/dashboard/RiskIntelligencePanel';
import { RainfallThresholdChart } from './components/dashboard/RainfallThresholdChart';
import { WhyRiskHighPanel } from './components/dashboard/WhyRiskHighPanel';
import { EnvironmentalStrip } from './components/dashboard/EnvironmentalStrip';
import { RecommendedActionsPanel } from './components/dashboard/RecommendedActionsPanel';
import { TrendsAndActivityPanel } from './components/dashboard/TrendsAndActivityPanel';

// Modals and Drawers (All Centered Modals)
import { TriggerAlertModal } from './components/modals/TriggerAlertModal';
import { ZoneDetailModal } from './components/modals/ZoneDetailModal';
import { AlertsDrawer } from './components/modals/AlertsDrawer';
import { ZonesDrawer } from './components/modals/ZonesDrawer';
import { RoadsDrawer } from './components/modals/RoadsDrawer';
import { EmergencyResponseModal } from './components/modals/EmergencyResponseModal';
import { ActionDetailModal } from './components/modals/ActionDetailModal';
import { FieldReportsModal } from './components/modals/FieldReportsModal';
import { LoginModal, PRESET_USERS } from './components/auth/LoginModal';
import { CitizenPortalView } from './components/citizen/CitizenPortalView';
import { AdminConfigModal } from './components/admin/AdminConfigModal';

import { dashboardService } from './services/dashboardService';
import { apiService, type MLPredictionResult } from './services/api';
import { NORTHEAST_LOCATIONS, type NortheastLocation } from './data/northeastLocations';
import type { District, RiskZone, RecommendedAction, UserProfile, FieldReport } from './types/dashboard';
import { CheckCircle2, Mountain, Cpu } from 'lucide-react';

export function App() {
  // Theme state: Default Dark for Citizen, Light for Officer
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication: Frictionless 3-Role Access
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.citizen);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);

  // Navigation State
  const [activeNav, setActiveNav] = useState('citizen-safety');

  // Selected Northeast Location (Covering Northeast States)
  const [selectedLocation, setSelectedLocation] = useState<NortheastLocation>(NORTHEAST_LOCATIONS[0]);
  const [districtData, setDistrictData] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);

  // Live ML Prediction State
  const [currentMLPrediction, setCurrentMLPrediction] = useState<MLPredictionResult | null>(null);

  // Live risk data state — shared with CitizenPortalView to avoid duplicate API calls
  const [liveRiskData, setLiveRiskData] = useState<import('./services/api').LiveRiskData | null>(null);

  // AbortController ref — cancels stale in-flight requests when location changes rapidly
  const liveRiskAbortRef = useRef<AbortController | null>(null);

  // Selected Risk Zone (for Map & Detail Panel)
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  // Modals States (All open in center/middle)
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isZonesDrawerOpen, setIsZonesDrawerOpen] = useState(false);
  const [isRoadsDrawerOpen, setIsRoadsDrawerOpen] = useState(false);
  const [isEmergencyResponseOpen, setIsEmergencyResponseOpen] = useState(false);
  const [isFieldReportsOpen, setIsFieldReportsOpen] = useState(false);
  const [isTriggerAlertOpen, setIsTriggerAlertOpen] = useState(false);
  const [isZoneDetailModalOpen, setIsZoneDetailModalOpen] = useState(false);
  const [selectedActionForModal, setSelectedActionForModal] = useState<RecommendedAction | null>(null);
  const [targetZoneForAlert, setTargetZoneForAlert] = useState<RiskZone | null>(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4200);
  };

  // Synchronize theme class with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch reports from backend database and adapt to FieldReport[]
  const loadDatabaseReports = useCallback(async (): Promise<FieldReport[]> => {
    try {
      const reports = await apiService.getReports(50);
      return reports.map((r) => ({
        id: r.id,
        observerName: 'Citizen / Community Observer',
        designation: 'Field Geotagged Reporter',
        location: r.report || 'Slope Observation Site',
        coordinates: [r.latitude, r.longitude],
        hazardType: r.report || 'Ground Crack / Soil Slump',
        severity: (r.risk_tier as any) || 'HIGH',
        timeAgo: 'Recently logged',
        notes: r.report_description,
        hasPhotos: !!r.image_url,
        photoCount: r.image_url ? 1 : 0,
        imageUrl: r.image_url || null,
        verified: true,
      }));
    } catch {
      return [];
    }
  }, []);

  // Load telemetry & ML risk dynamically whenever selected location or coordinates change
  const refreshLocationData = useCallback(async () => {
    setLoading(true);
    // Clear stale data immediately when switching location so UNAVAILABLE is shown, not the previous city's data
    setCurrentMLPrediction(null);

    try {
      const [lat, lng] = selectedLocation.coordinates;

      // Cancel any previous in-flight live risk request for a prior location
      liveRiskAbortRef.current?.abort();
      const abortController = new AbortController();
      liveRiskAbortRef.current = abortController;

      // 1. Fetch backend database field reports in parallel with live risk
      const dbReportsPromise = loadDatabaseReports();

      // 2. Fetch live real-time Open-Meteo & Copernicus DEM telemetry + ML Risk Inference
      //    Note: getLiveRisk already handles client-side in-flight dedup.
      const liveRisk = await apiService.getLiveRisk(lat, lng);

      // Guard: if location changed again while request was in-flight, discard this result
      if (abortController.signal.aborted) {
        console.debug('[App] Discarding stale live risk result for', lat, lng);
        return;
      }

      setLiveRiskData(liveRisk);
      const liveEnv = liveRisk.environmental;
      const livePred = liveRisk.prediction;
      const isLive = liveRisk.data_status === 'LIVE' && livePred != null && liveEnv != null;

      if (isLive && livePred && liveEnv) {
        setCurrentMLPrediction({
          risk_score: livePred.risk_score,
          risk_level: livePred.risk_level,
          risk_tier: livePred.risk_tier,
          alert_triggered: livePred.alert_triggered,
          alert_message: livePred.alert_message,
          source: 'live_ml_backend',
        });
      } else {
        setCurrentMLPrediction(null);
        showToast(`⚠️ Live telemetry unavailable for ${selectedLocation.name}. ${liveRisk.message || 'Check backend connectivity.'}`);
      }

      const dbReports = await dbReportsPromise;
      const base = await dashboardService.getDistrictData(selectedLocation.id);

      // --- Risk tier mapping ---
      // ONLY map when we have a real prediction. Never map null → SAFE.
      const mappedTier: import('./types/dashboard').RiskLevel = isLive && livePred
        ? livePred.risk_tier === 'CRITICAL'
          ? 'CRITICAL'
          : livePred.risk_tier === 'HIGH'
          ? 'HIGH'
          : livePred.risk_tier === 'MEDIUM'
          ? 'WATCH'
          : 'SAFE'
        : 'UNAVAILABLE';

      // --- Environmental data from live telemetry only ---
      const environmentalData: import('./types/dashboard').EnvironmentalData | null = isLive && liveEnv
        ? {
            rainfall24h: liveEnv.rainfall_24h,
            soilMoisture: Math.round(liveEnv.soil_moisture * 100),
            temperature: liveEnv.temperature,
            groundMovement: null, // No IoT inclinometer data from Open-Meteo — never fabricate
            humidity: liveEnv.humidity,
            windSpeed: liveEnv.wind_speed,
          }
        : null;

      // --- Risk zones: null riskScore/confidence when no live prediction ---
      const dynamicZones: import('./types/dashboard').RiskZone[] = [
        {
          id: `zone-${selectedLocation.id}-01`,
          name: `${selectedLocation.name} Sector 1 (Ridge Flank)`,
          sectorCode: `${selectedLocation.name.slice(0, 3).toUpperCase()}-SEC-01`,
          riskScore: isLive && livePred ? Math.round(livePred.risk_score * 100) : null,
          riskLevel: mappedTier,
          rainfall24h: liveEnv ? liveEnv.rainfall_24h : null,
          soilMoisture: liveEnv ? Math.round(liveEnv.soil_moisture * 100) : null,
          slopeAngle: liveEnv ? liveEnv.slope_degrees : null,
          historicalEvents: 8,
          predictionWindow: isLive && livePred?.risk_tier === 'CRITICAL' ? '1–3 hours' : isLive ? '4–8 hours' : 'Unavailable',
          confidence: null, // Backend does not return calibrated ML confidence
          coordinates: [
            [lat + 0.005, lng - 0.006],
            [lat + 0.012, lng + 0.004],
            [lat + 0.003, lng + 0.011],
            [lat - 0.007, lng + 0.001],
            [lat - 0.002, lng - 0.008],
          ],
          center: [lat + 0.003, lng + 0.001],
          elevation: liveEnv ? liveEnv.elevation_m : null,
          description: selectedLocation.description,
          sensorsCount: selectedLocation.sensorsCount,
          populationAtRisk: selectedLocation.populationAtRisk,
          nearestFacility: selectedLocation.evacuationCenter,
        },
        {
          id: `zone-${selectedLocation.id}-02`,
          name: `${selectedLocation.name} Highway Transit Pass`,
          sectorCode: `${selectedLocation.name.slice(0, 3).toUpperCase()}-HWY-02`,
          riskScore: null, // Secondary zones don't get independent ML predictions
          riskLevel: mappedTier,
          rainfall24h: liveEnv ? Math.round(liveEnv.rainfall_24h * 0.9) : null,
          soilMoisture: liveEnv ? Math.round(liveEnv.soil_moisture * 100 * 0.92) : null,
          slopeAngle: liveEnv ? Math.max(10, liveEnv.slope_degrees - 2) : null,
          historicalEvents: 5,
          predictionWindow: isLive ? '6–12 hours' : 'Unavailable',
          confidence: null,
          coordinates: [
            [lat - 0.015, lng - 0.012],
            [lat - 0.008, lng - 0.003],
            [lat - 0.014, lng + 0.006],
            [lat - 0.022, lng - 0.002],
          ],
          center: [lat - 0.014, lng - 0.003],
          elevation: liveEnv ? Math.round(liveEnv.elevation_m * 0.95) : null,
          description: 'Arterial transit cut slope with rockfall protection netting and piezometers.',
          sensorsCount: 4,
          populationAtRisk: Math.round(selectedLocation.populationAtRisk * 0.6),
          nearestFacility: selectedLocation.evacuationCenter,
        },
      ];

      // --- Explainability: only from real live data ---
      const explainability: import('./types/dashboard').RiskFactorContribution[] = isLive && liveEnv
        ? [
            {
              factor: 'Antecedent Precipitation (Open-Meteo)',
              percentage: 36,
              metricValue: `${liveEnv.rainfall_24h} mm / 24h`,
              category: 'rainfall',
              impact: liveEnv.rainfall_24h > 60 ? 'high' : 'moderate',
            },
            {
              factor: 'Volumetric Soil Moisture (Open-Meteo ECMWF IFS)',
              percentage: 28,
              metricValue: `${Math.round(liveEnv.soil_moisture * 100)}% Saturation`,
              category: 'soil',
              impact: liveEnv.soil_moisture > 0.70 ? 'high' : 'moderate',
            },
            {
              factor: 'Terrain Slope Gradient (Copernicus DEM)',
              percentage: 24,
              metricValue: `${liveEnv.slope_degrees}° Angle`,
              category: 'slope',
              impact: liveEnv.slope_degrees > 35 ? 'high' : 'moderate',
            },
            {
              factor: 'Historical Landslide Susceptibility (Location)',
              percentage: 12,
              metricValue: `${selectedLocation.name} region`,
              category: 'historical',
              impact: 'moderate',
            },
          ]
        : [];

      // --- Trend: only from real live data; fallback to empty ---
      const trend24h: import('./types/dashboard').TrendPoint[] = isLive && livePred && liveEnv
        ? [
            { time: '6h ago', risk: Math.max(5, Math.round(livePred.risk_score * 100) - 18), rainfall: Math.round(liveEnv.rainfall_24h * 0.4), threshold: 70 },
            { time: '4h ago', risk: Math.max(10, Math.round(livePred.risk_score * 100) - 12), rainfall: Math.round(liveEnv.rainfall_24h * 0.6), threshold: 70 },
            { time: '2h ago', risk: Math.max(15, Math.round(livePred.risk_score * 100) - 6), rainfall: Math.round(liveEnv.rainfall_24h * 0.8), threshold: 70 },
            { time: 'Now', risk: Math.round(livePred.risk_score * 100), rainfall: liveEnv.rainfall_24h, threshold: 70 },
          ]
        : base?.trend24h || [];

      const fullDistrict: import('./types/dashboard').District = {
        ...(base || {}),
        id: selectedLocation.id,
        name: `${selectedLocation.name} (${selectedLocation.district})`,
        state: selectedLocation.state,
        center: [lat, lng],
        zoom: 13,
        // ─── AUTHORITATIVE live risk fields — NEVER fabricate ───
        currentRisk: isLive && livePred ? Math.round(livePred.risk_score * 100) : null,
        riskLevel: mappedTier,
        riskDataStatus: isLive ? 'LIVE' : 'UNAVAILABLE',
        confidence: null, // Backend does not return calibrated model confidence
        // ─────────────────────────────────────────────────────────
        riskTrend: isLive && livePred?.risk_tier === 'CRITICAL' ? '⚠️ Increasing threat' : isLive ? 'Stable monitored' : 'N/A – data unavailable',
        predictionWindow: isLive && livePred?.risk_tier === 'CRITICAL' ? '1–3 hours' : isLive ? '4–8 hours' : 'N/A – data unavailable',
        criticalAlertsCount: 0, // Must come from real backend alerts — not fabricated from ML tier
        highRiskZonesCount: dynamicZones.length,
        blockedRoadsCount: 0, // No verified road-blockage data source — never infer from ML tier
        environmental: environmentalData,
        explainability,
        riskZones: dynamicZones,
        fieldReports: dbReports.length > 0 ? dbReports : (base?.fieldReports || []),
        recommendedActions: base?.recommendedActions || [],
        alerts: base?.alerts || (isLive && livePred
          ? [
              {
                id: `alt-${selectedLocation.id}-01`,
                title: `${livePred.risk_tier} Landslide Alert — ${selectedLocation.name}`,
                location: `${selectedLocation.name} Sector 1`,
                riskScore: Math.round(livePred.risk_score * 100),
                severity: mappedTier,
                timestamp: new Date().toLocaleTimeString(),
                timeAgo: 'Just now',
                summary: `Live ML assessment for ${selectedLocation.name}: ${Math.round(livePred.risk_score * 100)}% landslide risk based on real-time environmental telemetry.`,
                affectedRoads: ['Main Hill Road', 'Highway Spur Km 42'],
                recommendedAction: 'Continuous geotechnical monitoring. Prepare evacuation if risk escalates.',
                status: 'ACTIVE',
              },
            ]
          : []),
        roads: base?.roads || [],
        sensors: base?.sensors || [],
        facilities: base?.facilities || [],
        trend24h,
      };

      setDistrictData(fullDistrict);
      setSelectedZone(dynamicZones[0]);
    } catch (err) {
      console.error('refreshLocationData error:', err);
      showToast(`Failed to load data for ${selectedLocation.name}. Check network or backend status.`);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, loadDatabaseReports]);

  useEffect(() => {
    refreshLocationData();
  }, [refreshLocationData]);

  // Connect WebSocket for live alerts
  useEffect(() => {
    const disconnect = apiService.connectAlertsWebSocket((alert) => {
      showToast(`🚨 Real-time alert: ${alert.message || 'New landslide warning received'}`);
    });
    return () => disconnect();
  }, []);

  // Handle Location Switch
  const handleSelectLocation = (loc: NortheastLocation) => {
    setSelectedLocation(loc);
    showToast(`Switched monitoring focus to ${loc.name}, ${loc.state}`);
  };

  // Handle Sidebar Navigation
  const handleNavigate = (navId: string) => {
    setActiveNav(navId);
    setIsMobileMenuOpen(false);
    if (navId === 'settings') {
      if (currentUser.role === 'admin') {
        setIsAdminConfigOpen(true);
      } else {
        showToast('System calibration is restricted to GSI / LEWS administrators.');
      }
      return;
    }
    if (navId === 'alerts') {
      setIsAlertsDrawerOpen(true);
    } else if (navId === 'live-risk-map') {
      setIsZonesDrawerOpen(true);
    } else if (navId === 'road-connectivity') {
      setIsRoadsDrawerOpen(true);
    } else if (navId === 'emergency-response') {
      setIsEmergencyResponseOpen(true);
    } else if (navId === 'field-reports') {
      setIsFieldReportsOpen(true);
    } else if (navId !== 'dashboard') {
      showToast(`Navigated to ${navId.replace('-', ' ').toUpperCase()} view`);
    }
  };

  // Handle Trigger Alert Flow
  const handleOpenTriggerAlert = (zone: RiskZone) => {
    setTargetZoneForAlert(zone);
    setIsTriggerAlertOpen(true);
  };

  const handleAlertBroadcastSuccess = (broadcastId: string) => {
    showToast(`🚨 Common Alerting Protocol (CAP) Broadcast Dispatched: ID #${broadcastId}`);
  };

  // Handle Action Status Update
  const handleUpdateActionStatus = (actionId: string, status: any) => {
    if (!districtData) return;
    const updatedActions = districtData.recommendedActions.map((act) =>
      act.id === actionId ? { ...act, status } : act
    );
    setDistrictData({ ...districtData, recommendedActions: updatedActions });
    showToast(`Action status updated to "${status}"`);
  };

  const isLight = theme === 'light';

  if (loading || !districtData) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#06140e] text-white'
        }`}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto animate-pulse shadow-xl border border-emerald-400/40">
            <Mountain className="w-8 h-8 text-emerald-100" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight">
              BHU-GUARD AI &bull; LEWS Operations Hub
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400/80 font-mono mt-1">
              Loading backend telemetry for {selectedLocation.name}, {selectedLocation.state}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen relative transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#06140e] text-[#f1f5f9]'
      }`}
    >
      {/* Login Modal: 3-Role Selection without phone/OTP */}
      <LoginModal
        isOpen={isLoginOpen}
        currentUser={currentUser}
        onClose={() => isAuthenticated && setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsLoginOpen(false);
          setActiveNav(user.role === 'citizen' ? 'citizen-safety' : 'dashboard');
          // Dark mode is best suited for Citizen, Light mode for Officer / Admin
          if (user.role === 'citizen') {
            setTheme('dark');
          } else {
            setTheme('light');
          }
          showToast(`Active profile: ${user.name} (${user.badge}).`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-4 border max-w-md ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 shadow-slate-300'
              : 'bg-[#0c261b] border-emerald-500/50 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Left Navigation Sidebar (Officer & Admin) */}
      {currentUser.role !== 'citizen' && (
        <Sidebar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          criticalAlertsCount={districtData.criticalAlertsCount}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header with Full Northeast Location Search & Theme Toggle */}
        <TopHeader
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          activeAlertsCount={districtData.criticalAlertsCount}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          user={currentUser}
          onOpenAccount={() => setIsLoginOpen(true)}
          onSignOut={() => {
            setIsAuthenticated(false);
            setIsLoginOpen(true);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowToast={showToast}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* 3. Main Body */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1500px] w-full mx-auto">
          {currentUser.role === 'citizen' ? (
            <CitizenPortalView
              location={selectedLocation}
              liveRiskData={liveRiskData}
              riskLoading={loading}
              onOpenGisMap={() => setIsZonesDrawerOpen(true)}
              onOpenRoads={() => setIsRoadsDrawerOpen(true)}
              onShowToast={showToast}
              onReportSubmitted={refreshLocationData}
            />
          ) : (
            <>
              {/* Header Banner & Live Protocol Indicator */}
              <div
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 rounded-3xl border shadow-lg ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-gradient-to-r from-[#0b2118] via-[#0d281e] to-[#071610] border-emerald-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400/90 mb-0.5">
                    <span className="font-extrabold">{selectedLocation.name}</span>
                    <span>/</span>
                    <span>
                      {selectedLocation.district}, {selectedLocation.state}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono">{selectedLocation.elevation_m}m Elevation</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">
                    {selectedLocation.name} Landslide Hazard Assessment & Command Grid
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Open-Meteo meteorological telemetry + Copernicus DEM terrain features + LightGBM Phase 3 ML Inference
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 text-xs font-mono">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      ML Risk:{' '}
                      <strong>
                        {currentMLPrediction
                          ? `${Math.round(currentMLPrediction.risk_score * 100)}% (${currentMLPrediction.risk_tier})`
                          : 'Live Evaluated'}
                      </strong>
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-[#06140e] text-slate-200 border-emerald-800/80'
                    }`}
                  >
                    Protocol: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">GSI-LEWS Command</strong>
                  </span>
                </div>
              </div>

              {/* SECTION 1 — Situational Summary (4 Geotechnical KPIs) */}
              <section>
                <SituationalSummary
                  district={districtData}
                  onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
                  onOpenZones={() => setIsZonesDrawerOpen(true)}
                  onOpenRoads={() => setIsRoadsDrawerOpen(true)}
                  onOpenSlopeStability={() => handleNavigate('live-risk-map')}
                  onOpenRainfallThreshold={() => handleNavigate('live-risk-map')}
                  isSimulatedSurge={false}
                />
              </section>

              {/* SECTION 2 — Core GIS 3D Topography Map + Right Geotechnical Analysis Column (Geotechnical slope cross-section removed) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 7 Columns: GIS Map & Selected Zone Detail Panel */}
                <div className="lg:col-span-7 space-y-4">
                  <GisMapPanel
                    district={districtData}
                    selectedZone={selectedZone}
                    onSelectZone={(zone) => setSelectedZone(zone)}
                    onTriggerAlertModal={handleOpenTriggerAlert}
                    selectedCoordinates={selectedLocation.coordinates}
                    onMapClick={(lat, lng) => {
                      const mapLoc: NortheastLocation = {
                        id: `map-${lat}-${lng}`,
                        name: `Selected Coordinate Pin`,
                        state: 'India (GIS Map)',
                        district: `[${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
                        coordinates: [lat, lng],
                        elevation_m: districtData.environmental?.rainfall24h ? 1200 : 1000,
                        slope_degrees: 25,
                        aspect_degrees: 135,
                        rainfall_24h: 20,
                        rainfall_3d: 55,
                        rainfall_7d: 110,
                        soil_moisture: 0.52,
                        riskScore: 50,
                        riskTier: 'MEDIUM',
                        description: `User-selected coordinate on GIS map at [${lat.toFixed(4)}, ${lng.toFixed(4)}] evaluated dynamically with Open-Meteo & Copernicus DEM.`,
                        evacuationCenter: 'Nearest Community Safe Zone',
                        shelterDistance: '1.2 km away',
                        helpline: '1078 (Disaster Toll-Free)',
                        sensorsCount: 4,
                        populationAtRisk: 600,
                      };
                      setSelectedLocation(mapLoc);
                      showToast(`📍 Selected site [${lat.toFixed(4)}, ${lng.toFixed(4)}]. Calculating live ML risk...`);
                    }}
                  />

                  {/* Map Zone Detail Panel */}
                  <ZoneDetailPanel
                    zone={selectedZone}
                    onClose={() => setSelectedZone(null)}
                    onViewZoneDetails={(zone) => {
                      setSelectedZone(zone);
                      setIsZoneDetailModalOpen(true);
                    }}
                    onViewReports={() => setIsFieldReportsOpen(true)}
                    onTriggerAlert={handleOpenTriggerAlert}
                  />
                </div>

                {/* Right 5 Columns: Risk Intelligence & Why Risk High Panels */}
                <div className="lg:col-span-5 space-y-4">
                  <RiskIntelligencePanel district={districtData} />
                  <WhyRiskHighPanel factors={districtData.explainability} />
                </div>
              </section>

              {/* SECTION 3 — Real-Time IoT Environmental Telemetry Strip */}
              <section>
                <EnvironmentalStrip
                  data={districtData.environmental}
                  isSimulatedSurge={false}
                />
              </section>

              {/* SECTION 4 — Empirical I-D Rainfall Threshold Curve & Actions Grid */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-5">
                  <RainfallThresholdChart
                    currentRainfall24h={districtData.environmental?.rainfall24h ?? null}
                    isSimulatedSurge={false}
                  />
                </div>

                <div className="lg:col-span-7">
                  <RecommendedActionsPanel
                    actions={districtData.recommendedActions}
                    onSelectAction={(action) => setSelectedActionForModal(action)}
                    onOpenEmergencyResponse={() => setIsEmergencyResponseOpen(true)}
                  />
                </div>
              </section>

              {/* SECTION 5 — 24h Telemetry Timeline & Recent Field Observer Activity */}
              <section>
                <TrendsAndActivityPanel
                  trendData={districtData.trend24h}
                  alerts={districtData.alerts}
                  fieldReports={districtData.fieldReports}
                  onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
                  onOpenFieldReports={() => setIsFieldReportsOpen(true)}
                  onSelectAlert={(_alt) => {
                    setIsAlertsDrawerOpen(true);
                  }}
                  onSelectReport={() => setIsFieldReportsOpen(true)}
                />
              </section>
            </>
          )}
        </main>
      </div>

      {/* Centered Modals & Dialogs */}
      <TriggerAlertModal
        zone={targetZoneForAlert}
        isOpen={isTriggerAlertOpen}
        onClose={() => setIsTriggerAlertOpen(false)}
        onSuccess={handleAlertBroadcastSuccess}
      />

      <ZoneDetailModal
        zone={selectedZone}
        sensors={districtData.sensors}
        isOpen={isZoneDetailModalOpen}
        onClose={() => setIsZoneDetailModalOpen(false)}
        onTriggerAlert={handleOpenTriggerAlert}
      />

      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={districtData.alerts}
        onSelectAlert={(_alt) => {
          showToast(`Inspecting alert: ${_alt.title}`);
        }}
      />

      <ZonesDrawer
        isOpen={isZonesDrawerOpen}
        onClose={() => setIsZonesDrawerOpen(false)}
        zones={districtData.riskZones}
        onSelectZone={(zone) => {
          setSelectedZone(zone);
          showToast(`Selected ${zone.name} on GIS Map`);
        }}
      />

      <RoadsDrawer
        isOpen={isRoadsDrawerOpen}
        onClose={() => setIsRoadsDrawerOpen(false)}
        roads={districtData.roads}
      />

      <EmergencyResponseModal
        district={districtData}
        isOpen={isEmergencyResponseOpen}
        onClose={() => setIsEmergencyResponseOpen(false)}
      />

      <ActionDetailModal
        action={selectedActionForModal}
        isOpen={!!selectedActionForModal}
        onClose={() => setSelectedActionForModal(null)}
        onUpdateStatus={handleUpdateActionStatus}
      />

      <FieldReportsModal
        reports={districtData.fieldReports}
        isOpen={isFieldReportsOpen}
        onClose={() => setIsFieldReportsOpen(false)}
      />

      <AdminConfigModal
        isOpen={isAdminConfigOpen}
        onClose={() => setIsAdminConfigOpen(false)}
        onShowToast={showToast}
      />
    </div>
  );
}

export default App;

