import type { ServerlessRequest, ServerlessResponse } from './health.ts';

const NEA_PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface UpstreamRegionMetadata {
  name: string;
  labelLocation: { latitude: number; longitude: number };
}

interface UpstreamPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: Record<string, Record<string, number>>;
}

interface UpstreamPsiPayload {
  code: number;
  data?: {
    regionMetadata?: UpstreamRegionMetadata[];
    items?: UpstreamPsiItem[];
  };
  errorMsg?: string;
}

function getSgtDateString(offsetDays = 0): string {
  const now = new Date();
  const shifted = new Date(now.getTime() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(shifted);

  const year = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

async function fetchFromDataGov(dateParam?: string): Promise<UpstreamPsiPayload> {
  const url = new URL(NEA_PSI_ENDPOINT);
  if (dateParam) {
    url.searchParams.set('date', dateParam);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Upstream HTTP ${response.status}`);
  }

  const payload = (await response.json()) as UpstreamPsiPayload;
  if (payload.code !== 0 || !payload.data || !Array.isArray(payload.data.items)) {
    throw new Error(payload.errorMsg || 'Unexpected upstream PSI payload structure');
  }

  return payload;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const rawDate = Array.isArray(req.query?.date)
    ? req.query?.date[0]
    : req.query?.date;

  if (rawDate !== undefined && !DATE_PARAM_REGEX.test(rawDate)) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid date parameter. Expected YYYY-MM-DD.',
    });
  }

  try {
    if (rawDate) {
      const payload = await fetchFromDataGov(rawDate);
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
      return res.status(200).json({
        ok: true,
        source: 'data.gov.sg',
        endpoint: NEA_PSI_ENDPOINT,
        fetchedAt: new Date().toISOString(),
        regionMetadata: payload.data?.regionMetadata ?? [],
        items: payload.data?.items ?? [],
      });
    }

    const todaySgt = getSgtDateString(0);
    const yesterdaySgt = getSgtDateString(-1);

    // Fetch latest snapshot + today's hourly items in parallel
    const [latestPayload, todayPayload] = await Promise.all([
      fetchFromDataGov(),
      fetchFromDataGov(todaySgt).catch(() => null),
    ]);

    const latestItems = latestPayload.data?.items ?? [];
    let combinedItems = todayPayload?.data?.items ?? latestItems;

    // Top up with yesterday's hourly items if today has fewer than 24 hours
    if (combinedItems.length < 24) {
      const yesterdayPayload = await fetchFromDataGov(yesterdaySgt).catch(() => null);
      if (yesterdayPayload?.data?.items?.length) {
        combinedItems = [...combinedItems, ...yesterdayPayload.data.items];
      }
    }

    // Deduplicate by timestamp and sort chronologically, keeping latest 24 hours
    const byTimestamp = new Map<string, UpstreamPsiItem>();
    for (const item of [...latestItems, ...combinedItems]) {
      if (item?.timestamp) {
        byTimestamp.set(item.timestamp, item);
      }
    }

    const sortedHourly = Array.from(byTimestamp.values())
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
      .slice(-24);

    const latest = sortedHourly[sortedHourly.length - 1] ?? latestItems[0] ?? null;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({
      ok: true,
      source: 'data.gov.sg',
      endpoint: NEA_PSI_ENDPOINT,
      fetchedAt: new Date().toISOString(),
      regionMetadata: latestPayload.data?.regionMetadata ?? [],
      latest,
      items: sortedHourly,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream request failed';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      ok: false,
      error: 'Unable to retrieve live PSI readings from data.gov.sg.',
      detail: message,
    });
  }
}
