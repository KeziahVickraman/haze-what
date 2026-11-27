export interface ServerlessRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ServerlessResponse {
  setHeader(name: string, value: string): unknown;
  status(code: number): ServerlessResponse;
  json(body: unknown): unknown;
}

const NEA_PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const checkUpstream = req.query?.upstream === '1';
  if (!checkUpstream) {
    return res.status(200).json({
      ok: true,
      service: 'sg-hazemonitor-api',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const response = await fetch(NEA_PSI_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    return res.status(response.ok ? 200 : 502).json({
      ok: response.ok,
      service: 'sg-hazemonitor-api',
      upstreamStatus: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({
      ok: false,
      service: 'sg-hazemonitor-api',
      upstreamStatus: 0,
      timestamp: new Date().toISOString(),
    });
  }
}
