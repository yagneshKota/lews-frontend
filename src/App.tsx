import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { SituationalSummary } from './components/dashboard/SituationalSummary';
import { GisMapPanel } from './components/dashboard/GisMap/GisMapPanel';
import { ZoneDetailPanel } from './components/dashboard/ZoneDetailPanel';
import { RiskIntelligencePanel } from './components/dashboard/RiskIntelligencePanel';
import { SlopeStabilityProfile } from './components/dashboard/SlopeStabilityProfile';
import { RainfallThresholdChart } from './components/dashboard/RainfallThresholdChart';
import { WhyRiskHighPanel } from './components/dashboard/WhyRiskHighPanel';
import { EnvironmentalStrip } from './components/dashboard/EnvironmentalStrip';
import { RecommendedActionsPanel } from './components/dashboard/RecommendedActionsPanel';
import { TrendsAndActivityPanel } from './components/dashboard/TrendsAndActivityPanel';

// Modals and Drawers
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
import type { District, RiskZone, RecommendedAction, UserProfile } from './types/dashboard';
import { CheckCircle2, Mountain, Zap } from 'lucide-react';

export function App() {
  // Frontend-only authentication: login is deliberately simulated for the prototype.
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.govt);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  // Navigation State
  const [activeNav, setActiveNav] = useState('dashboard');

  // Selected District
  const [selectedDistrictId, setSelectedDistrictId] = useState('tawang');
  const [districtData, setDistrictData] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Risk Zone (for Map & Detail Panel)
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  // Hackathon Cloudburst Surge Simulation State
  const [isSimulatedSurge, setIsSimulatedSurge] = useState(false);

  // Modals and Drawers States
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

  // Fetch district data when selection changes
  useEffect(() => {
    let isMounted = true;
    dashboardService.getDistrictData(selectedDistrictId).then((data) => {
      if (isMounted) {
        setDistrictData(data);
        if (data.riskZones.length > 0) {
          setSelectedZone(data.riskZones[0]);
        } else {
          setSelectedZone(null);
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDistrictId]);

  // Toggle Live Cloudburst Simulation for Hackathon Demonstrations
  const handleToggleSimulateSurge = () => {
    const nextState = !isSimulatedSurge;
    setIsSimulatedSurge(nextState);
    if (nextState) {
      showToast(
        '⚡ SIMULATION ENGAGED: Cloudburst (+80mm/h) & Micro-Seismic drift active! Threat level escalated to CRITICAL.'
      );
    } else {
      showToast('Simulation reset: Baseline GSI/IMD telemetry restored.');
    }
  };

  // Handle Sidebar Navigation
  const handleNavigate = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'settings') {
      if (currentUser.role === 'admin') {
        setIsAdminConfigOpen(true);
      } else {
        showToast('System calibration is restricted to verified GSI administrators.');
      }
      return;
    }
    if (navId === 'alerts') {
      setIsAlertsDrawerOpen(true);
    } else if (navId === 'risk-zones' || navId === 'live-risk-map') {
      setIsZonesDrawerOpen(true);
    } else if (navId === 'road-connectivity') {
      setIsRoadsDrawerOpen(true);
    } else if (navId === 'emergency-response') {
      setIsEmergencyResponseOpen(true);
    } else if (navId === 'field-reports') {
      setIsFieldReportsOpen(true);
    } else if (navId === 'slope-stability') {
      showToast('Switched focus to Geotechnical Slope Stability (FoS) & Slip Surface analysis.');
    } else if (navId === 'rainfall-threshold') {
      showToast('Switched focus to GSI Intensity-Duration (I-D) Threshold Model.');
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

  if (loading || !districtData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-[#1B4332]/20">
            <Mountain className="w-7 h-7 text-[#D8F3DC]" />
          </div>
          <p className="text-sm font-extrabold text-[#0F172A] tracking-tight">
            BHU-GUARD AI &bull; LEWS Operations Hub
          </p>
          <p className="text-xs text-[#64748B] font-mono">
            Connecting to GSI Satellite & Ground Telemetry Nodes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1E293B]">
      <LoginModal
        isOpen={isLoginOpen}
        currentUser={currentUser}
        onClose={() => isAuthenticated && setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsLoginOpen(false);
          setActiveNav(user.role === 'citizen' ? 'citizen-safety' : 'dashboard');
          showToast(`Welcome, ${user.name.split(',')[0]}. ${user.badge} access is active.`);
        }}
      />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1B4332] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-4 border border-[#2D6A4F] max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Left Navigation Sidebar */}
      {currentUser.role !== 'citizen' && (
        <Sidebar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          criticalAlertsCount={districtData.criticalAlertsCount + (isSimulatedSurge ? 2 : 0)}
        />
      )}

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header with SIH Hackathon PS-01 & Simulation Controls */}
        <TopHeader
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={setSelectedDistrictId}
          activeAlertsCount={districtData.criticalAlertsCount + (isSimulatedSurge ? 2 : 0)}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          onOpenSearch={() => { }}
          isSimulatedSurge={isSimulatedSurge}
          onToggleSimulateSurge={handleToggleSimulateSurge}
          onTriggerInstantAlert={() => {
            if (selectedZone) {
              handleOpenTriggerAlert(selectedZone);
            } else if (districtData.riskZones.length > 0) {
              handleOpenTriggerAlert(districtData.riskZones[0]);
            }
          }}
          user={currentUser}
          onOpenAccount={() => setIsLoginOpen(true)}
          onSignOut={() => {
            setIsAuthenticated(false);
            setIsLoginOpen(true);
          }}
        />

        {/* 3. Main Dashboard Body */}
        <main className="flex-1 p-5 md:p-6 space-y-6 max-w-[1440px] w-full mx-auto">
          {currentUser.role === 'citizen' ? (
            <CitizenPortalView
              district={districtData}
              isSimulatedSurge={isSimulatedSurge}
              onOpenGisMap={() => setIsZonesDrawerOpen(true)}
              onOpenRoads={() => setIsRoadsDrawerOpen(true)}
              onShowToast={showToast}
            />
          ) : <>
          {/* Header Banner & Live Protocol Indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-white via-[#F8FAFC] to-[#F1F5F9] p-4 rounded-2xl border border-[#CBD5E1] shadow-2xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-0.5">
                <span className="font-bold text-[#1B4332]">{districtData.name}</span>
                <span>/</span>
                <span>Landslide Early Warning & Hazard Risk Assessment</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#0F172A]">
                {districtData.name} Landslide Threat & Geotechnical Operations
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Multi-sensor InSAR, IoT Inclinometers, and GSI Empirical I-D Threshold Monitoring
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isSimulatedSurge && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-[11px] font-extrabold animate-pulse shadow-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Cloudburst Event Active</span>
                </div>
              )}
              <span className="text-[11px] font-semibold text-[#334155] bg-white px-3 py-1.5 rounded-xl border border-[#CBD5E1] shadow-2xs">
                Protocol: <strong className="text-[#1B4332]">Monsoon Vigilance 2026 (GSI-LEWS)</strong>
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
              onOpenSlopeStability={() => setActiveNav('slope-stability')}
              onOpenRainfallThreshold={() => setActiveNav('rainfall-threshold')}
              isSimulatedSurge={isSimulatedSurge}
            />
          </section>

          {/* SECTION 2 — Core GIS 3D Topography Map + Right Geotechnical Analysis Column */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns (~58%): GIS Map & Selected Zone Detail Panel */}
            <div className="lg:col-span-7 space-y-4">
              <GisMapPanel
                district={districtData}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                onTriggerAlertModal={handleOpenTriggerAlert}
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

            {/* Right 5 Columns (~42%): Geotechnical Factor of Safety, XAI, and Risk Intelligence */}
            <div className="lg:col-span-5 space-y-4">
              {/* Geotechnical Slope Cross-Section (DEM Profile & Factor of Safety) */}
              <SlopeStabilityProfile
                zone={selectedZone || districtData.riskZones[0]}
                isSimulatedSurge={isSimulatedSurge}
              />

              {/* Current Risk Intelligence Gauge */}
              <RiskIntelligencePanel district={districtData} />

              {/* Why is the Risk High? (XAI SHAP Values) */}
              <WhyRiskHighPanel factors={districtData.explainability} />
            </div>
          </section>

          {/* SECTION 3 — Real-Time IoT Environmental Telemetry Strip */}
          <section>
            <EnvironmentalStrip
              data={districtData.environmental}
              isSimulatedSurge={isSimulatedSurge}
            />
          </section>

          {/* SECTION 4 — Empirical I-D Rainfall Threshold Curve & 24h Trends Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 5 Columns: GSI Intensity-Duration (I-D) Threshold Model */}
            <div className="lg:col-span-5">
              <RainfallThresholdChart
                currentRainfall24h={districtData.environmental.rainfall24h}
                isSimulatedSurge={isSimulatedSurge}
              />
            </div>

            {/* Right 7 Columns: Recommended Actions & Task Force Dispatch */}
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
          </>}
        </main>
      </div>

      {/* Modals & Drawers */}
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
