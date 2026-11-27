export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central';

export type RegionFilterId = 'national' | RegionId;

export type MetricView = 'psi24h' | 'pm25_1h';

export type ScenarioId =
  | 'live'
  | 'current'
  | 'moderate-haze'
  | 'unhealthy-haze'
  | 'severe-haze';

export type PsiBandKey =
  | 'good'
  | 'moderate'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export type Pm25BandKey = 'normal' | 'elevated' | 'high' | 'very-high';

export interface RegionMetadata {
  id: RegionId;
  name: string;
  shortName: string;
  stationName: string;
  latitude: number;
  longitude: number;
  /** SVG viewport coordinates (800x500 viewBox) */
  mapX: number;
  mapY: number;
  towns: string[];
}

export interface PollutantReadings {
  psi24h: number;
  pm25_1h: number;
  pm25_24h: number;
  pm10_24h: number;
  so2_24h: number;
  co_8h_max: number;
  o3_8h_max: number;
  no2_1h_max: number;
}

export interface HourlyDataPoint {
  hourLabel: string;
  isoTimestamp: string;
  regions: Record<RegionId, { psi24h: number; pm25_1h: number }>;
}

export interface WindInfo {
  directionLabel: string;
  bearingDeg: number;
  speedKmh: number;
  monsoonPhase: string;
  visibilityKm: number;
}

export interface PsiSnapshot {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  updatedAtIso: string;
  updatedAtDisplay: string;
  wind: WindInfo;
  regions: Record<RegionId, PollutantReadings>;
  hourlyTrend: HourlyDataPoint[];
}

/**
 * Mirrors Singapore NEA data.gov.sg v2 PSI API item structure
 * Endpoint: https://api-open.data.gov.sg/v2/real-time/api/psi
 */
export interface NeaPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: {
    psi_twenty_four_hourly: Record<RegionId, number>;
    pm25_twenty_four_hourly: Record<RegionId, number>;
    pm10_twenty_four_hourly: Record<RegionId, number>;
    so2_twenty_four_hourly: Record<RegionId, number>;
    co_eight_hour_max: Record<RegionId, number>;
    o3_eight_hour_max: Record<RegionId, number>;
    no2_one_hour_max: Record<RegionId, number>;
  };
}

export interface NeaDataGovPsiResponse {
  code: number;
  data: {
    regionMetadata: Array<{
      name: RegionId;
      labelLocation: { latitude: number; longitude: number };
    }>;
    items: NeaPsiItem[];
  };
}

export interface ServerPsiApiResponse {
  ok: boolean;
  source: string;
  endpoint: string;
  fetchedAt: string;
  regionMetadata: Array<{
    name: RegionId;
    labelLocation: { latitude: number; longitude: number };
  }>;
  latest: NeaPsiItem | null;
  items: NeaPsiItem[];
  error?: string;
}
