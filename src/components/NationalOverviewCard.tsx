import { REGION_BY_ID } from '../data/psiService';
import { MetricView, PsiSnapshot, RegionFilterId, RegionId } from '../types/psi';
import { getPm25Band, getPsiBand } from '../utils/airQuality';

interface NationalOverviewCardProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionFilterId;
  metricView: MetricView;
  isLoading: boolean;
  onResetToNational: () => void;
}

export function NationalOverviewCard({
  snapshot,
  selectedRegion,
  metricView,
  isLoading,
  onResetToNational,
}: NationalOverviewCardProps) {
  const regionIds: RegionId[] = ['north', 'south', 'east', 'west', 'central'];

  const allPsi = regionIds.map((id) => snapshot.regions[id].psi24h);
  const allPm25 = regionIds.map((id) => snapshot.regions[id].pm25_1h);

  const minPsi = Math.min(...allPsi);
  const maxPsi = Math.max(...allPsi);
  const minPm = Math.min(...allPm25);
  const maxPm = Math.max(...allPm25);

  const isNational = selectedRegion === 'national';
  const activeRegionMeta = !isNational ? REGION_BY_ID[selectedRegion] : null;
  const activeReadings = !isNational ? snapshot.regions[selectedRegion] : null;

  // For National view, NEA uses the highest regional reading to determine national band advisory
  const primaryPsi = activeReadings ? activeReadings.psi24h : maxPsi;
  const primaryPm25 = activeReadings ? activeReadings.pm25_1h : maxPm;

  const psiBand = getPsiBand(primaryPsi);
  const pmBand = getPm25Band(primaryPm25);

  // Compute averages for National sub-indices
  const avg = (getter: (id: RegionId) => number, decimals = 0) => {
    const sum = regionIds.reduce((acc, id) => acc + getter(id), 0);
    const val = sum / regionIds.length;
    return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
  };

  if (isLoading) {
    return (
      <section
        aria-label="Reading summary loading"
        className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full min-h-[460px] animate-pulse"
      >
        <div className="space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-14 w-48 bg-slate-200 rounded" />
          <div className="h-5 w-40 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3 py-6 border-y border-slate-100">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
        <div className="h-20 bg-slate-100 rounded" />
      </section>
    );
  }

  return (
    <section
      aria-label="Current air quality summary"
      className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-xs font-medium text-slate-500">
            {isNational ? (
              <span>All Singapore · 5 NEA Stations</span>
            ) : (
              <span>
                {activeRegionMeta?.name} Region · {activeRegionMeta?.stationName}
              </span>
            )}
          </div>
          {!isNational && (
            <button
              type="button"
              onClick={onResetToNational}
              className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-600 rounded"
            >
              View National
            </button>
          )}
        </div>

        <div className="mb-5">
          <div className="text-xs text-slate-500 mb-1">
            {metricView === 'psi24h' ? '24-hour PSI' : '1-hour PM2.5'}
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metricView === 'psi24h'
                ? isNational
                  ? minPsi === maxPsi
                    ? `${maxPsi}`
                    : `${minPsi}–${maxPsi}`
                  : activeReadings?.psi24h
                : isNational
                ? minPm === maxPm
                  ? `${maxPm}`
                  : `${minPm}–${maxPm}`
                : activeReadings?.pm25_1h}
            </span>
            {metricView === 'pm25_1h' && (
              <span className="font-mono text-sm text-slate-500">µg/m³</span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-sm font-semibold">
            {metricView === 'psi24h' ? (
              <span className={`${psiBand.textClass} inline-flex items-center gap-1.5`}>
                <span aria-hidden="true">{psiBand.symbol}</span>
                <span>{psiBand.label}</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-600 font-normal font-mono text-xs tabular-nums">
                  Band {psiBand.rangeLabel}
                </span>
              </span>
            ) : (
              <span className={`${pmBand.textClass} inline-flex items-center gap-1.5`}>
                <span aria-hidden="true">{pmBand.symbol}</span>
                <span>{pmBand.label}</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-600 font-normal font-mono text-xs tabular-nums">
                  {pmBand.rangeLabel}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Pollutant sub-index grid separated by hairline borders */}
        <div className="border-t border-slate-200 pt-4 pb-5">
          <div className="text-xs font-medium text-slate-500 mb-3">
            {isNational ? 'National Station Averages' : `${activeRegionMeta?.name} Pollutant Sub-Indices`}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5">
            <div>
              <dt className="text-xs text-slate-500">
                {metricView === 'psi24h' ? '1-hr PM2.5' : '24-hr PSI'}
              </dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {metricView === 'psi24h' ? (
                  <>
                    {activeReadings ? activeReadings.pm25_1h : avg((id) => snapshot.regions[id].pm25_1h)}
                    <span className="text-xs font-normal text-slate-500 ml-1">µg/m³</span>
                  </>
                ) : (
                  activeReadings ? activeReadings.psi24h : maxPsi
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">24-hr PM2.5</dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {activeReadings ? activeReadings.pm25_24h : avg((id) => snapshot.regions[id].pm25_24h)}
                <span className="text-xs font-normal text-slate-500 ml-1">µg/m³</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">24-hr PM10</dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {activeReadings ? activeReadings.pm10_24h : avg((id) => snapshot.regions[id].pm10_24h)}
                <span className="text-xs font-normal text-slate-500 ml-1">µg/m³</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">8-hr Ozone (O₃)</dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {activeReadings ? activeReadings.o3_8h_max : avg((id) => snapshot.regions[id].o3_8h_max)}
                <span className="text-xs font-normal text-slate-500 ml-1">µg/m³</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">24-hr SO₂</dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {activeReadings ? activeReadings.so2_24h : avg((id) => snapshot.regions[id].so2_24h)}
                <span className="text-xs font-normal text-slate-500 ml-1">µg/m³</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">8-hr CO</dt>
              <dd className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
                {activeReadings
                  ? activeReadings.co_8h_max.toFixed(2)
                  : avg((id) => snapshot.regions[id].co_8h_max, 2)}
                <span className="text-xs font-normal text-slate-500 ml-1">mg/m³</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Active Health Guidance & Meteorological Note (Clean hairline box, zero border-l-4) */}
      <div className={`rounded-lg border ${psiBand.borderClass} ${psiBand.surfaceClass} p-4`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className={`text-xs font-semibold ${psiBand.textClass}`}>
            Active Health Guidance
          </span>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Vis {snapshot.wind.visibilityKm.toFixed(1)} km · Wind {snapshot.wind.directionLabel}{' '}
            {snapshot.wind.speedKmh} km/h
          </span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed">{psiBand.healthyAdvice}</p>
        {activeRegionMeta && (
          <p className="text-xs text-slate-600 mt-2">
            Coverage: {activeRegionMeta.towns.join(', ')}
          </p>
        )}
      </div>
    </section>
  );
}
