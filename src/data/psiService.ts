import {
  HourlyDataPoint,
  NeaDataGovPsiResponse,
  NeaPsiItem,
  PollutantReadings,
  PsiSnapshot,
  RegionId,
  RegionMetadata,
  ScenarioId,
  ServerPsiApiResponse,
} from '../types/psi';

export const SINGAPORE_REGIONS: RegionMetadata[] = [
  {
    id: 'north',
    name: 'North',
    shortName: 'North',
    stationName: 'Woodlands / Yishun',
    latitude: 1.41803,
    longitude: 103.82,
    mapX: 392,
    mapY: 132,
    towns: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Admiralty', 'Marsiling'],
  },
  {
    id: 'west',
    name: 'West',
    shortName: 'West',
    stationName: 'Jurong West / Choa Chu Kang',
    latitude: 1.35735,
    longitude: 103.7,
    mapX: 196,
    mapY: 238,
    towns: ['Jurong West', 'Jurong East', 'Tuas', 'Choa Chu Kang', 'Bukit Batok', 'Clementi', 'Boon Lay'],
  },
  {
    id: 'central',
    name: 'Central',
    shortName: 'Central',
    stationName: 'Toa Payoh / Bishan',
    latitude: 1.35735,
    longitude: 103.82,
    mapX: 416,
    mapY: 244,
    towns: ['Toa Payoh', 'Bishan', 'Ang Mo Kio', 'Orchard', 'Novena', 'Serangoon', 'Kallang'],
  },
  {
    id: 'east',
    name: 'East',
    shortName: 'East',
    stationName: 'Tampines / Changi',
    latitude: 1.35735,
    longitude: 103.94,
    mapX: 604,
    mapY: 224,
    towns: ['Tampines', 'Pasir Ris', 'Bedok', 'Changi', 'Punggol', 'Sengkang', 'Marine Parade'],
  },
  {
    id: 'south',
    name: 'South',
    shortName: 'South',
    stationName: 'Marina Bay / Bukit Merah',
    latitude: 1.29587,
    longitude: 103.82,
    mapX: 404,
    mapY: 332,
    towns: ['Marina Bay', 'Bukit Merah', 'Queenstown', 'Sentosa', 'Telok Blangah', 'Tanjong Pagar'],
  },
];

export const REGION_BY_ID: Record<RegionId, RegionMetadata> = {
  north: SINGAPORE_REGIONS[0],
  west: SINGAPORE_REGIONS[1],
  central: SINGAPORE_REGIONS[2],
  east: SINGAPORE_REGIONS[3],
  south: SINGAPORE_REGIONS[4],
};

export interface ScenarioOption {
  id: ScenarioId;
  label: string;
  shortDescription: string;
}

export const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'live',
    label: 'Live NEA Feed',
    shortDescription: 'Real-time data from data.gov.sg via /api/psi',
  },
  {
    id: 'current',
    label: 'Clear Monsoon',
    shortDescription: 'Simulated inter-monsoon baseline (Good to low Moderate)',
  },
  {
    id: 'moderate-haze',
    label: 'Moderate Haze',
    shortDescription: 'Simulated southwest wind drift carrying mild smoke haze',
  },
  {
    id: 'unhealthy-haze',
    label: 'Unhealthy Episode',
    shortDescription: 'Simulated sustained transboundary smoke plume across West & Central',
  },
  {
    id: 'severe-haze',
    label: 'Severe Haze Alert',
    shortDescription: 'Simulated peak transboundary haze event',
  },
];

function buildHourlySeries(
  baseByRegion: Record<RegionId, { psi: number; pm25: number }>,
  waveAmplitude: number,
  pmWaveAmplitude: number
): HourlyDataPoint[] {
  const hours: HourlyDataPoint[] = [];
  const baseDate = new Date('2026-11-26T00:00:00+08:00');

  for (let i = 0; i < 24; i++) {
    const dt = new Date(baseDate.getTime() + i * 3600 * 1000);
    const hourStr = `${String(i).padStart(2, '0')}:00`;
    const phase = Math.sin(((i - 6) / 24) * Math.PI * 2);
    const fineDetail = Math.cos((i / 6) * Math.PI) * 0.25;

    const makeVal = (region: RegionId, offsetMultiplier: number) => {
      const base = baseByRegion[region];
      const psiVal = Math.max(
        12,
        Math.round(base.psi + (phase + fineDetail * offsetMultiplier) * waveAmplitude)
      );
      const pmVal = Math.max(
        4,
        Math.round(base.pm25 + (phase * 1.15 + fineDetail * offsetMultiplier) * pmWaveAmplitude)
      );
      return { psi24h: psiVal, pm25_1h: pmVal };
    };

    hours.push({
      hourLabel: hourStr,
      isoTimestamp: dt.toISOString(),
      regions: {
        north: makeVal('north', 0.8),
        south: makeVal('south', 1.1),
        east: makeVal('east', 0.6),
        west: makeVal('west', 1.3),
        central: makeVal('central', 1.0),
      },
    });
  }

  return hours;
}

const SCENARIO_DATA: Record<
  Exclude<ScenarioId, 'live'>,
  Omit<PsiSnapshot, 'updatedAtIso' | 'updatedAtDisplay'>
> = {
  current: {
    scenarioId: 'current',
    scenarioLabel: 'Clear Monsoon',
    wind: {
      directionLabel: 'NE',
      bearingDeg: 42,
      speedKmh: 14,
      monsoonPhase: 'Northeast Monsoon',
      visibilityKm: 12.5,
    },
    regions: {
      north: { psi24h: 44, pm25_1h: 14, pm25_24h: 13, pm10_24h: 24, so2_24h: 4, co_8h_max: 0.42, o3_8h_max: 29, no2_1h_max: 22 },
      south: { psi24h: 49, pm25_1h: 18, pm25_24h: 16, pm10_24h: 28, so2_24h: 6, co_8h_max: 0.51, o3_8h_max: 33, no2_1h_max: 29 },
      east: { psi24h: 41, pm25_1h: 12, pm25_24h: 11, pm10_24h: 21, so2_24h: 3, co_8h_max: 0.38, o3_8h_max: 27, no2_1h_max: 19 },
      west: { psi24h: 52, pm25_1h: 21, pm25_24h: 18, pm10_24h: 31, so2_24h: 8, co_8h_max: 0.56, o3_8h_max: 36, no2_1h_max: 31 },
      central: { psi24h: 47, pm25_1h: 16, pm25_24h: 15, pm10_24h: 26, so2_24h: 5, co_8h_max: 0.48, o3_8h_max: 31, no2_1h_max: 26 },
    },
    hourlyTrend: buildHourlySeries(
      {
        north: { psi: 41, pm25: 13 },
        south: { psi: 46, pm25: 16 },
        east: { psi: 38, pm25: 11 },
        west: { psi: 49, pm25: 19 },
        central: { psi: 44, pm25: 15 },
      },
      5,
      4
    ),
  },
  'moderate-haze': {
    scenarioId: 'moderate-haze',
    scenarioLabel: 'Moderate Haze',
    wind: {
      directionLabel: 'SW',
      bearingDeg: 225,
      speedKmh: 11,
      monsoonPhase: 'Southwest Monsoon',
      visibilityKm: 7.2,
    },
    regions: {
      north: { psi24h: 74, pm25_1h: 44, pm25_24h: 34, pm10_24h: 54, so2_24h: 9, co_8h_max: 0.78, o3_8h_max: 48, no2_1h_max: 38 },
      south: { psi24h: 82, pm25_1h: 52, pm25_24h: 39, pm10_24h: 61, so2_24h: 11, co_8h_max: 0.89, o3_8h_max: 52, no2_1h_max: 42 },
      east: { psi24h: 68, pm25_1h: 38, pm25_24h: 31, pm10_24h: 49, so2_24h: 7, co_8h_max: 0.71, o3_8h_max: 44, no2_1h_max: 33 },
      west: { psi24h: 89, pm25_1h: 61, pm25_24h: 43, pm10_24h: 67, so2_24h: 14, co_8h_max: 0.96, o3_8h_max: 56, no2_1h_max: 46 },
      central: { psi24h: 79, pm25_1h: 49, pm25_24h: 37, pm10_24h: 58, so2_24h: 10, co_8h_max: 0.84, o3_8h_max: 51, no2_1h_max: 40 },
    },
    hourlyTrend: buildHourlySeries(
      {
        north: { psi: 69, pm25: 40 },
        south: { psi: 77, pm25: 47 },
        east: { psi: 64, pm25: 35 },
        west: { psi: 83, pm25: 55 },
        central: { psi: 74, pm25: 44 },
      },
      10,
      11
    ),
  },
  'unhealthy-haze': {
    scenarioId: 'unhealthy-haze',
    scenarioLabel: 'Unhealthy Episode',
    wind: {
      directionLabel: 'SSW',
      bearingDeg: 205,
      speedKmh: 9,
      monsoonPhase: 'Southwest Monsoon',
      visibilityKm: 3.6,
    },
    regions: {
      north: { psi24h: 132, pm25_1h: 108, pm25_24h: 79, pm10_24h: 112, so2_24h: 18, co_8h_max: 1.42, o3_8h_max: 74, no2_1h_max: 56 },
      south: { psi24h: 148, pm25_1h: 129, pm25_24h: 91, pm10_24h: 126, so2_24h: 22, co_8h_max: 1.65, o3_8h_max: 81, no2_1h_max: 64 },
      east: { psi24h: 118, pm25_1h: 92, pm25_24h: 68, pm10_24h: 98, so2_24h: 15, co_8h_max: 1.28, o3_8h_max: 68, no2_1h_max: 49 },
      west: { psi24h: 164, pm25_1h: 146, pm25_24h: 102, pm10_24h: 141, so2_24h: 26, co_8h_max: 1.84, o3_8h_max: 86, no2_1h_max: 69 },
      central: { psi24h: 141, pm25_1h: 119, pm25_24h: 85, pm10_24h: 119, so2_24h: 20, co_8h_max: 1.54, o3_8h_max: 78, no2_1h_max: 61 },
    },
    hourlyTrend: buildHourlySeries(
      {
        north: { psi: 121, pm25: 98 },
        south: { psi: 137, pm25: 118 },
        east: { psi: 109, pm25: 84 },
        west: { psi: 152, pm25: 134 },
        central: { psi: 131, pm25: 109 },
      },
      18,
      24
    ),
  },
  'severe-haze': {
    scenarioId: 'severe-haze',
    scenarioLabel: 'Severe Haze Alert',
    wind: {
      directionLabel: 'SW',
      bearingDeg: 218,
      speedKmh: 7,
      monsoonPhase: 'Southwest Monsoon',
      visibilityKm: 1.4,
    },
    regions: {
      north: { psi24h: 238, pm25_1h: 212, pm25_24h: 174, pm10_24h: 228, so2_24h: 31, co_8h_max: 2.35, o3_8h_max: 104, no2_1h_max: 79 },
      south: { psi24h: 268, pm25_1h: 249, pm25_24h: 198, pm10_24h: 256, so2_24h: 37, co_8h_max: 2.68, o3_8h_max: 112, no2_1h_max: 86 },
      east: { psi24h: 214, pm25_1h: 186, pm25_24h: 153, pm10_24h: 204, so2_24h: 27, co_8h_max: 2.11, o3_8h_max: 96, no2_1h_max: 72 },
      west: { psi24h: 312, pm25_1h: 288, pm25_24h: 226, pm10_24h: 294, so2_24h: 44, co_8h_max: 3.04, o3_8h_max: 121, no2_1h_max: 94 },
      central: { psi24h: 256, pm25_1h: 231, pm25_24h: 186, pm10_24h: 241, so2_24h: 34, co_8h_max: 2.52, o3_8h_max: 108, no2_1h_max: 83 },
    },
    hourlyTrend: buildHourlySeries(
      {
        north: { psi: 221, pm25: 198 },
        south: { psi: 249, pm25: 232 },
        east: { psi: 199, pm25: 173 },
        west: { psi: 289, pm25: 269 },
        central: { psi: 238, pm25: 215 },
      },
      26,
      36
    ),
  },
};

export function formatSgtTimestamp(date: Date): string {
  return (
    new Intl.DateTimeFormat('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore',
    }).format(date) + ' SGT'
  );
}

function formatSgtHour(isoString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  }).format(new Date(isoString));
}

export function getSnapshotForScenario(scenarioId: Exclude<ScenarioId, 'live'>): PsiSnapshot {
  const base = SCENARIO_DATA[scenarioId];
  const now = new Date();
  return {
    ...base,
    updatedAtIso: now.toISOString(),
    updatedAtDisplay: formatSgtTimestamp(now),
  };
}

export function simulateRefreshSnapshot(prev: PsiSnapshot): PsiSnapshot {
  const now = new Date();
  const nextRegions = { ...prev.regions };

  (Object.keys(nextRegions) as RegionId[]).forEach((regionId) => {
    const cur = nextRegions[regionId];
    const deltaPsi = Math.floor(Math.random() * 5) - 2;
    const deltaPm = Math.floor(Math.random() * 7) - 3;
    nextRegions[regionId] = {
      ...cur,
      psi24h: Math.max(10, cur.psi24h + deltaPsi),
      pm25_1h: Math.max(4, cur.pm25_1h + deltaPm),
      pm25_24h: Math.max(4, cur.pm25_24h + Math.round(deltaPm * 0.4)),
      pm10_24h: Math.max(8, cur.pm10_24h + deltaPsi),
    };
  });

  const nextTrend = prev.hourlyTrend.map((point, idx) => {
    if (idx !== prev.hourlyTrend.length - 1) return point;
    return {
      ...point,
      regions: {
        north: { psi24h: nextRegions.north.psi24h, pm25_1h: nextRegions.north.pm25_1h },
        south: { psi24h: nextRegions.south.psi24h, pm25_1h: nextRegions.south.pm25_1h },
        east: { psi24h: nextRegions.east.psi24h, pm25_1h: nextRegions.east.pm25_1h },
        west: { psi24h: nextRegions.west.psi24h, pm25_1h: nextRegions.west.pm25_1h },
        central: { psi24h: nextRegions.central.psi24h, pm25_1h: nextRegions.central.pm25_1h },
      },
    };
  });

  return {
    ...prev,
    updatedAtIso: now.toISOString(),
    updatedAtDisplay: formatSgtTimestamp(now),
    regions: nextRegions,
    hourlyTrend: nextTrend,
  };
}

function mapItemsToHourlyTrend(items: NeaPsiItem[]): HourlyDataPoint[] {
  const regionIds: RegionId[] = ['north', 'south', 'east', 'west', 'central'];
  return items.map((item) => {
    const regions = regionIds.reduce((acc, id) => {
      acc[id] = {
        psi24h: item.readings.psi_twenty_four_hourly[id] ?? 0,
        pm25_1h: item.readings.pm25_twenty_four_hourly[id] ?? 0,
      };
      return acc;
    }, {} as Record<RegionId, { psi24h: number; pm25_1h: number }>);

    return {
      hourLabel: formatSgtHour(item.timestamp),
      isoTimestamp: item.timestamp,
      regions,
    };
  });
}

function mapSingleItemToRegions(item: NeaPsiItem): Record<RegionId, PollutantReadings> {
  const r = item.readings;
  const regionIds: RegionId[] = ['north', 'south', 'east', 'west', 'central'];

  return regionIds.reduce((acc, id) => {
    acc[id] = {
      psi24h: r.psi_twenty_four_hourly[id] ?? 0,
      pm25_1h: r.pm25_twenty_four_hourly[id] ?? 0,
      pm25_24h: r.pm25_twenty_four_hourly[id] ?? 0,
      pm10_24h: r.pm10_twenty_four_hourly[id] ?? 0,
      so2_24h: r.so2_twenty_four_hourly[id] ?? 0,
      co_8h_max: r.co_eight_hour_max[id] ?? 0,
      o3_8h_max: r.o3_eight_hour_max[id] ?? 0,
      no2_1h_max: r.no2_one_hour_max[id] ?? 0,
    };
    return acc;
  }, {} as Record<RegionId, PollutantReadings>);
}

export async function fetchLivePsiSnapshot(): Promise<PsiSnapshot> {
  const response = await fetch('/api/psi', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const payload = (await response.json()) as ServerPsiApiResponse;
  if (!payload.ok || !payload.latest) {
    throw new Error(payload.error || 'No live PSI readings returned');
  }

  const updatedDate = new Date(payload.latest.updatedTimestamp || payload.latest.timestamp);
  const regions = mapSingleItemToRegions(payload.latest);
  const hourlyTrend = mapItemsToHourlyTrend(payload.items.length ? payload.items : [payload.latest]);

  const maxPsi = Math.max(
    regions.north.psi24h,
    regions.south.psi24h,
    regions.east.psi24h,
    regions.west.psi24h,
    regions.central.psi24h
  );

  // Estimate visibility cleanly from current PSI band when live endpoint doesn't provide meteorological visibility
  const estimatedVisibility =
    maxPsi <= 50 ? 12.0 : maxPsi <= 100 ? 7.5 : maxPsi <= 200 ? 3.8 : 1.5;

  return {
    scenarioId: 'live',
    scenarioLabel: 'Live NEA Feed',
    updatedAtIso: payload.latest.updatedTimestamp,
    updatedAtDisplay: formatSgtTimestamp(updatedDate),
    wind: {
      directionLabel: 'NE',
      bearingDeg: 42,
      speedKmh: 12,
      monsoonPhase: 'data.gov.sg Live PSI',
      visibilityKm: estimatedVisibility,
    },
    regions,
    hourlyTrend,
  };
}

export function mapNeaApiResponseToSnapshot(
  payload: NeaDataGovPsiResponse
): PsiSnapshot {
  const latest = payload.data.items[0];
  const updatedDate = new Date(latest.updatedTimestamp);

  return {
    scenarioId: 'live',
    scenarioLabel: 'Live NEA Feed',
    updatedAtIso: latest.updatedTimestamp,
    updatedAtDisplay: formatSgtTimestamp(updatedDate),
    wind: {
      directionLabel: 'NE',
      bearingDeg: 42,
      speedKmh: 12,
      monsoonPhase: 'data.gov.sg Live PSI',
      visibilityKm: 10.0,
    },
    regions: mapSingleItemToRegions(latest),
    hourlyTrend: mapItemsToHourlyTrend(payload.data.items),
  };
}
