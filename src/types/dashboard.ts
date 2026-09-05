export type RiskLevel = 'SAFE' | 'WATCH' | 'HIGH' | 'CRITICAL';
export type UserRole = 'govt' | 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  district: string;
  phone?: string;
  avatarInitials: string;
  badge: string;
}

export interface EnvironmentalData {
  rainfall24h: number; // in mm
  soilMoisture: number; // in %
  temperature: number; // in °C
  groundMovement: number; // in mm/hr
  humidity: number; // in %
  windSpeed: number; // in km/h
}

export interface RiskFactorContribution {
  factor: string;
  percentage: number;
  metricValue: string;
  category: 'rainfall' | 'soil' | 'slope' | 'movement' | 'historical';
  impact: 'high' | 'moderate' | 'low';
}

export interface RecommendedAction {
  id: string;
  priority: number;
  title: string;
  location: string;
  status: 'Pending dispatch' | 'Patrol active' | 'Standby' | 'Completed';
  actionType: 'INSPECT' | 'MONITOR' | 'PREPARE_EVACUATION' | 'ROAD_CLOSURE';
  description: string;
  assignedAgency: string;
  targetCompletion: string;
}

export interface RiskZone {
  id: string;
  name: string;
  sectorCode: string;
  riskScore: number;
  riskLevel: RiskLevel;
  rainfall24h: number;
  soilMoisture: number;
  slopeAngle: number;
  historicalEvents: number;
  predictionWindow: string;
  confidence: number;
  coordinates: [number, number][]; // Polygon coordinates [lat, lng]
  center: [number, number];
  elevation: number; // in meters
  description: string;
  sensorsCount: number;
  populationAtRisk: number;
  nearestFacility: string;
}

export interface Alert {
  id: string;
  title: string;
  location: string;
  riskScore: number;
  severity: RiskLevel;
  timestamp: string;
  timeAgo: string;
  summary: string;
  affectedRoads: string[];
  recommendedAction: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface Road {
  id: string;
  name: string;
  highwayCode: string;
  status: 'BLOCKED' | 'RESTRICTED' | 'CLEAR';
  blockageReason: string;
  coordinates: [number, number][]; // Polyline coordinates [lat, lng]
  affectedLengthKm: number;
  clearanceEstimate: string;
  bypassAvailable: boolean;
  bypassRouteName: string;
  lastUpdated: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: 'RAIN_GAUGE' | 'SOIL_MOISTURE' | 'INCLINOMETER' | 'PIEZOMETER' | 'CRACKMETER';
  coordinates: [number, number];
  value: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  battery: number;
  lastPing: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'EVACUATION_CENTER' | 'DISASTER_BASE' | 'ARMY_CAMP';
  coordinates: [number, number];
  capacity: number;
  occupancy: number;
  contact: string;
}

export interface FieldReport {
  id: string;
  observerName: string;
  designation: string;
  location: string;
  coordinates: [number, number];
  hazardType: string;
  severity: RiskLevel;
  timeAgo: string;
  notes: string;
  hasPhotos: boolean;
  photoCount?: number;
  imageUrl?: string | null;
  verified: boolean;
}

export interface TrendPoint {
  time: string;
  risk: number;
  rainfall: number;
  threshold: number;
}

export interface District {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  currentRisk: number;
  riskLevel: RiskLevel;
  riskTrend: string;
  predictionWindow: string;
  confidence: number;
  criticalAlertsCount: number;
  highRiskZonesCount: number;
  blockedRoadsCount: number;
  environmental: EnvironmentalData;
  explainability: RiskFactorContribution[];
  recommendedActions: RecommendedAction[];
  riskZones: RiskZone[];
  alerts: Alert[];
  roads: Road[];
  sensors: Sensor[];
  facilities: Facility[];
  fieldReports: FieldReport[];
  trend24h: TrendPoint[];
}
