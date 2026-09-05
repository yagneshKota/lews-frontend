import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Building2,
  FileSpreadsheet,
  Route,
  Compass,
} from 'lucide-react';
import type {
  District,
  RiskZone,
} from '../../../types/dashboard';
import { getRiskColor } from '../../../utils/riskUtils';

// Helper component to smoothly pan/zoom when selected district changes or reset is clicked
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Invalidate size when container expands or contracts on desktop and mobile
const MapResizeController: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const timer1 = setTimeout(() => map.invalidateSize(), 50);
    const timer2 = setTimeout(() => map.invalidateSize(), 200);
    const timer3 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isFullscreen, map]);
  return null;
};

// Custom SVG HTML Icons for Leaflet markers to ensure clean, crisp rendering
const createCustomIcon = (
  bg: string,
  border: string,
  iconSvg: string,
  isPulsing: boolean = false
) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: ${bg};
        border: 2px solid ${border};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15), 0 2px 4px -2px rgba(0,0,0,0.1);
        cursor: pointer;
      ">
        ${isPulsing ? `<div style="position: absolute; inset: -4px; border-radius: 10px; border: 2px solid ${border}; animation: subtle-pulse 2s infinite ease-in-out; opacity: 0.7;"></div>` : ''}
        ${iconSvg}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

const sensorIcon = (status: string) =>
  createCustomIcon(
    status === 'CRITICAL' ? '#FEE2E2' : '#EFF6FF',
    status === 'CRITICAL' ? '#DC2626' : '#2563EB',
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${status === 'CRITICAL' ? '#DC2626' : '#2563EB'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    status === 'CRITICAL'
  );

const facilityIcon = (type: string) =>
  createCustomIcon(
    '#FFFFFF',
    type === 'HOSPITAL' ? '#16A34A' : '#475569',
    type === 'HOSPITAL'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12m-6-6h12"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/></svg>`
  );

const fieldReportIcon = (severity: string) =>
  createCustomIcon(
    severity === 'CRITICAL' ? '#FEF2F2' : '#FEF3C7',
    severity === 'CRITICAL' ? '#DC2626' : '#D97706',
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${severity === 'CRITICAL' ? '#DC2626' : '#D97706'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    severity === 'CRITICAL'
  );

interface GisMapPanelProps {
  district: District;
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onTriggerAlertModal: (zone: RiskZone) => void;
}

export const GisMapPanel: React.FC<GisMapPanelProps> = ({
  district,
  selectedZone,
  onSelectZone,
  onTriggerAlertModal,
}) => {
  const [mapLayer, setMapLayer] = useState<'topo' | 'satellite' | 'terrain'>('topo');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const [visibleLayers, setVisibleLayers] = useState({
    riskZones: true,
    roads: true,
    sensors: true,
    facilities: true,
    fieldReports: true,
  });

  const toggleLayer = (layerKey: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Close fullscreen on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const tileConfig = {
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      name: 'Topographic / Relief',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      name: 'High-Res Satellite',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
      name: 'Elevation Contours (OpenTopo)',
    },
  };

  return (
    <div
      className={`relative bg-[#F1F5F9] dark:bg-[#071711] rounded-2xl border border-slate-300 dark:border-emerald-800/60 overflow-hidden shadow-md flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] rounded-none shadow-2xl h-[100dvh] w-screen max-w-full max-h-full overflow-hidden'
          : 'h-[540px] w-full'
      }`}
    >
      {/* Map Header Bar */}
      <div className="bg-white/95 dark:bg-[#0b1f16]/95 backdrop-blur-xs px-4 py-2.5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <div>
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{district.name} GIS Live Risk Map</span>
              <span className="text-[10px] font-medium text-slate-600 dark:text-emerald-300 bg-slate-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-emerald-800 font-mono">
                Elev. ~{district.riskZones[0]?.elevation || 2800}m
              </span>
              {isFullscreen && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono">
                  Full View
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Layer switcher button */}
          <div className="relative">
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c261c] hover:bg-slate-50 dark:hover:bg-[#123829] border border-slate-300 dark:border-emerald-700/60 rounded-lg shadow-2xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Layers</span>
            </button>

            {/* Layer Popover Menu */}
            {showLayersMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#0c221a] rounded-xl border border-slate-200 dark:border-emerald-700/70 shadow-lg p-3 z-50 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/80 mb-1.5">
                    Base Imagery
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {(['topo', 'satellite', 'terrain'] as const).map((layer) => (
                      <button
                        key={layer}
                        onClick={() => {
                          setMapLayer(layer);
                          setShowLayersMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[12px] rounded-md transition-colors flex items-center justify-between ${
                          mapLayer === layer
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>{tileConfig[layer].name}</span>
                        {mapLayer === layer && <span className="text-[10px]">●</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-emerald-900/60" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/80 mb-1.5">
                    Map Layers
                  </p>
                  <div className="space-y-1.5 text-[12px] text-slate-700 dark:text-slate-300">
                    {[
                      { key: 'riskZones', label: 'Risk Heat Polygons', icon: Eye },
                      { key: 'roads', label: 'Roads & Blockages', icon: Route },
                      { key: 'sensors', label: 'IoT Sensor Nodes', icon: Activity },
                      { key: 'facilities', label: 'Hospitals & Shelters', icon: Building2 },
                      { key: 'fieldReports', label: 'Field Incident Reports', icon: FileSpreadsheet },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 dark:hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={visibleLayers[item.key as keyof typeof visibleLayers]}
                          onChange={() => toggleLayer(item.key as keyof typeof visibleLayers)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Map Fullscreen'}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg shadow-2xs transition-colors border ${
              isFullscreen
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 ring-2 ring-red-400/30'
                : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c261c] hover:bg-slate-50 dark:hover:bg-[#123829] border-slate-300 dark:border-emerald-700/60'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={district.center}
          zoom={district.zoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController center={district.center} zoom={district.zoom} />
          <MapResizeController isFullscreen={isFullscreen} />

          <TileLayer
            key={mapLayer}
            attribution={tileConfig[mapLayer].attribution}
            url={tileConfig[mapLayer].url}
            maxZoom={18}
          />

          {/* 1. Risk Heat Polygons */}
          {visibleLayers.riskZones &&
            district.riskZones.map((zone) => {
              const riskColors = getRiskColor(zone.riskLevel);
              const isSelected = selectedZone?.id === zone.id;

              return (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: isSelected ? '#0F172A' : riskColors.strokeColor,
                    fillColor: riskColors.fillColor,
                    fillOpacity: isSelected ? 0.65 : 0.42,
                    weight: isSelected ? 3.5 : 2,
                    dashArray: isSelected ? undefined : '2, 3',
                  }}
                  eventHandlers={{
                    click: () => {
                      onSelectZone(zone);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-3 min-w-[200px] text-left">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[12px] font-bold text-[#0F172A]">
                          {zone.name}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${riskColors.badgeBg} ${riskColors.badgeText} ${riskColors.badgeBorder}`}
                        >
                          {zone.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] mb-2">
                        Risk Score: <strong className="text-[#0F172A]">{zone.riskScore}%</strong> | Slope: <strong>{zone.slopeAngle}°</strong>
                      </p>
                      <button
                        onClick={() => onSelectZone(zone)}
                        className="w-full py-1 bg-[#1B4332] text-white text-[11px] font-semibold rounded-md hover:bg-[#2D6A4F] transition-colors"
                      >
                        Inspect Zone Detail
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {/* 2. Road Network & Blockages */}
          {visibleLayers.roads &&
            district.roads.map((road) => (
              <Polyline
                key={road.id}
                positions={road.coordinates}
                pathOptions={{
                  color:
                    road.status === 'BLOCKED'
                      ? '#DC2626'
                      : road.status === 'RESTRICTED'
                      ? '#D97706'
                      : '#16A34A',
                  weight: road.status === 'BLOCKED' ? 4.5 : 3,
                  dashArray: road.status === 'BLOCKED' ? '6, 4' : undefined,
                  opacity: 0.9,
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[220px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-[#0F172A]">
                        {road.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          road.status === 'BLOCKED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {road.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] mb-1">
                      {road.blockageReason}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Est. Clearance: <strong>{road.clearanceEstimate}</strong>
                    </p>
                  </div>
                </Popup>
              </Polyline>
            ))}

          {/* 3. Sensor Nodes */}
          {visibleLayers.sensors &&
            district.sensors.map((sensor) => (
              <Marker
                key={sensor.id}
                position={sensor.coordinates}
                icon={sensorIcon(sensor.status)}
              >
                <Popup>
                  <div className="p-2.5 min-w-[190px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[12px] font-bold text-[#0F172A]">
                        {sensor.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#334155] font-mono font-semibold">
                      {sensor.value}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1.5 pt-1.5 border-t border-[#F1F5F9]">
                      <span>Battery: {sensor.battery}%</span>
                      <span>Ping: {sensor.lastPing}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 4. Facilities */}
          {visibleLayers.facilities &&
            district.facilities.map((fac) => (
              <Marker
                key={fac.id}
                position={fac.coordinates}
                icon={facilityIcon(fac.type)}
              >
                <Popup>
                  <div className="p-2.5 min-w-[200px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[12px] font-bold text-[#0F172A]">
                        {fac.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569]">
                      Capacity: <strong>{fac.occupancy} / {fac.capacity}</strong> beds
                    </p>
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Emergency Contact: <span className="font-mono text-[#0F172A]">{fac.contact}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 5. Field Reports */}
          {visibleLayers.fieldReports &&
            district.fieldReports.map((report) => (
              <Marker
                key={report.id}
                position={report.coordinates}
                icon={fieldReportIcon(report.severity)}
              >
                <Popup>
                  <div className="p-3 min-w-[230px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#DC2626] uppercase">
                        {report.hazardType}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {report.timeAgo}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#334155] mb-2 leading-relaxed">
                      "{report.notes}"
                    </p>
                    <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                      Observer: <strong>{report.observerName}</strong> ({report.designation})
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs border border-[#CBD5E1] rounded-xl p-3 shadow-md max-w-xs text-left">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1B4332]" />
              Map Legend
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-[#22C55E]/60 border border-[#16A34A]" />
              <span className="text-[#334155]">SAFE Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-[#F59E0B]/60 border border-[#D97706]" />
              <span className="text-[#334155]">WATCH Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-[#F97316]/60 border border-[#EA580C]" />
              <span className="text-[#334155]">HIGH Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-[#EF4444]/60 border border-[#DC2626]" />
              <span className="text-[#334155]">CRITICAL</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-[#F1F5F9]">
              <div className="w-4 h-1 bg-[#DC2626] rounded-full border border-dashed border-white" />
              <span className="text-[#334155] text-[10px]">Blocked Road / Highway</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Quick Pill */}
        {selectedZone && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#CBD5E1] rounded-xl px-3.5 py-2 shadow-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping" />
            <div>
              <p className="text-[12px] font-bold text-[#0F172A] leading-tight">
                {selectedZone.name}
              </p>
              <p className="text-[10px] text-[#64748B]">
                Active Selection ({selectedZone.riskScore}% Risk)
              </p>
            </div>
            <button
              onClick={() => onTriggerAlertModal(selectedZone)}
              className="ml-1 px-2.5 py-1 bg-[#DC2626] text-white text-[10px] font-bold rounded-md hover:bg-[#B91C1C] transition-colors"
            >
              Trigger Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
