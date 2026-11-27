import { useMemo, useState } from 'react';
import { REGION_BY_ID, SINGAPORE_REGIONS } from '../data/psiService';
import { MetricView, PsiSnapshot, RegionFilterId, RegionId } from '../types/psi';

interface TrendChartProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionFilterId;
  metricView: MetricView;
}

const REGION_SERIES_COLORS: Record<RegionId, { stroke: string; dotClass: string; label: string }> = {
  north: { stroke: '#0284C7', dotClass: 'bg-sky-600', label: 'North' },
  south: { stroke: '#0D9488', dotClass: 'bg-teal-600', label: 'South' },
  east: { stroke: '#059669', dotClass: 'bg-emerald-600', label: 'East' },
  west: { stroke: '#D97706', dotClass: 'bg-amber-600', label: 'West' },
  central: { stroke: '#4F46E5', dotClass: 'bg-indigo-600', label: 'Central' },
};

export function TrendChart({ snapshot, selectedRegion, metricView }: TrendChartProps) {
  const [compareAll, setCompareAll] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = snapshot.hourlyTrend;
  const regionIds: RegionId[] = ['north', 'south', 'east', 'west', 'central'];

  const chartBounds = useMemo(() => {
    let maxVal = metricView === 'psi24h' ? 60 : 40;
    data.forEach((pt) => {
      regionIds.forEach((id) => {
        const v = metricView === 'psi24h' ? pt.regions[id].psi24h : pt.regions[id].pm25_1h;
        if (v > maxVal) maxVal = v;
      });
    });
    const ceiling = Math.ceil((maxVal * 1.15) / 10) * 10;
    return { min: 0, max: ceiling };
  }, [data, metricView]);

  const width = 760;
  const height = 240;
  const padLeft = 44;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return padLeft;
    return padLeft + (index / (data.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const ratio = (val - chartBounds.min) / (chartBounds.max - chartBounds.min || 1);
    return padTop + plotH - ratio * plotH;
  };

  const getValueForPoint = (ptIndex: number, id: RegionId) => {
    const pt = data[ptIndex];
    return metricView === 'psi24h' ? pt.regions[id].psi24h : pt.regions[id].pm25_1h;
  };

  const getNationalPeakForPoint = (ptIndex: number) => {
    return Math.max(...regionIds.map((id) => getValueForPoint(ptIndex, id)));
  };

  const activeSeries: Array<{
    key: string;
    label: string;
    stroke: string;
    dotClass: string;
    values: number[];
  }> = useMemo(() => {
    if (compareAll) {
      return SINGAPORE_REGIONS.map((r) => ({
        key: r.id,
        label: r.name,
        stroke: REGION_SERIES_COLORS[r.id].stroke,
        dotClass: REGION_SERIES_COLORS[r.id].dotClass,
        values: data.map((_, idx) => getValueForPoint(idx, r.id)),
      }));
    }

    if (selectedRegion === 'national') {
      return [
        {
          key: 'national',
          label: 'National Peak',
          stroke: '#0F172A',
          dotClass: 'bg-slate-900',
          values: data.map((_, idx) => getNationalPeakForPoint(idx)),
        },
      ];
    }

    const meta = REGION_BY_ID[selectedRegion];
    return [
      {
        key: selectedRegion,
        label: meta.name,
        stroke: REGION_SERIES_COLORS[selectedRegion].stroke,
        dotClass: REGION_SERIES_COLORS[selectedRegion].dotClass,
        values: data.map((_, idx) => getValueForPoint(idx, selectedRegion)),
      },
    ];
  }, [compareAll, selectedRegion, data, metricView]);

  const yTicks = useMemo(() => {
    const step = Math.max(10, Math.ceil(chartBounds.max / 4 / 10) * 10);
    const ticks: number[] = [];
    for (let v = 0; v <= chartBounds.max; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [chartBounds.max]);

  const thresholdLines = useMemo(() => {
    const lines =
      metricView === 'psi24h'
        ? [
            { value: 50, label: '50 Good', color: '#059669' },
            { value: 100, label: '100 Moderate', color: '#0284C7' },
            { value: 200, label: '200 Unhealthy', color: '#D97706' },
          ]
        : [
            { value: 55, label: '55 Elevated', color: '#D97706' },
            { value: 150, label: '150 High', color: '#EA580C' },
          ];
    return lines.filter((l) => l.value > 0 && l.value <= chartBounds.max);
  }, [metricView, chartBounds.max]);

  const activeIdx = hoveredIndex !== null ? hoveredIndex : data.length - 1;
  const activeHourLabel = data[activeIdx]?.hourLabel ?? '--:--';

  return (
    <section
      id="trends"
      aria-label="24-hour pollutant trend chart"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            24-Hour{' '}
            {metricView === 'psi24h'
              ? 'PSI'
              : snapshot.scenarioId === 'live'
              ? '24-hr PM2.5'
              : '1-hr PM2.5'}{' '}
            Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {compareAll
              ? 'Comparing all 5 NEA reporting regions over the past 24 hours'
              : selectedRegion === 'national'
              ? 'National peak hourly trajectory across all stations'
              : `Hourly trajectory for ${REGION_BY_ID[selectedRegion].name} (${REGION_BY_ID[selectedRegion].stationName})`}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setCompareAll(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              compareAll
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Regions
          </button>
          <button
            type="button"
            onClick={() => setCompareAll(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !compareAll
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {selectedRegion === 'national'
              ? 'National Peak'
              : `${REGION_BY_ID[selectedRegion].name} Focus`}
          </button>
        </div>
      </div>

      {/* Interactive Crosshair Readout Strip */}
      <div className="mb-3 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-mono font-semibold text-slate-800 tabular-nums">
          {hoveredIndex !== null ? `Hour ${activeHourLabel} SGT` : `Latest ${activeHourLabel} SGT`}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {activeSeries.map((s) => (
            <div key={s.key} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-xs ${s.dotClass}`} aria-hidden="true" />
              <span className="text-slate-600">{s.label}:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {s.values[activeIdx]}
                {metricView === 'pm25_1h' ? ' µg/m³' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Crisp SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="24-hour hourly air quality line chart"
          className="w-full h-auto block cursor-crosshair select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal grid ticks */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* NEA Band Threshold Reference Lines */}
          {thresholdLines.map((t) => {
            const y = getY(t.value);
            return (
              <g key={t.value}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={t.color}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <text
                  x={width - padRight}
                  y={y - 4}
                  textAnchor="end"
                  fill={t.color}
                  className="text-[9.5px] font-mono font-medium"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* X-axis timestamps every 3 hours */}
          {data.map((pt, idx) => {
            if (idx % 3 !== 0 && idx !== data.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={pt.hourLabel}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-mono tabular-nums"
              >
                {pt.hourLabel}
              </text>
            );
          })}

          {/* Single-series subtle area fill when not comparing all */}
          {!compareAll && activeSeries.length === 1 && (
            <path
              d={
                activeSeries[0].values
                  .map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(v)}`)
                  .join(' ') +
                ` L ${getX(data.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`
              }
              fill={activeSeries[0].stroke}
              fillOpacity="0.08"
            />
          )}

          {/* Data Polylines */}
          {activeSeries.map((s) => {
            const isHighlighted = !compareAll || selectedRegion === s.key;
            const pathD = s.values
              .map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(v).toFixed(1)}`)
              .join(' ');
            return (
              <path
                key={s.key}
                d={pathD}
                fill="none"
                stroke={s.stroke}
                strokeWidth={isHighlighted ? 2.4 : 1.6}
                strokeOpacity={
                  compareAll && selectedRegion !== 'national' && selectedRegion !== s.key
                    ? 0.35
                    : 1
                }
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* Active Crosshair Vertical Line & Markers */}
          <line
            x1={getX(activeIdx)}
            y1={padTop}
            x2={getX(activeIdx)}
            y2={padTop + plotH}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {activeSeries.map((s) => (
            <circle
              key={`dot-${s.key}`}
              cx={getX(activeIdx)}
              cy={getY(s.values[activeIdx])}
              r="3.5"
              fill="#FFFFFF"
              stroke={s.stroke}
              strokeWidth="2"
            />
          ))}

          {/* Invisible hit columns for smooth snapping */}
          {data.map((pt, idx) => {
            const colWidth = plotW / data.length;
            const x = getX(idx) - colWidth / 2;
            return (
              <rect
                key={`hit-${pt.hourLabel}`}
                x={Math.max(padLeft, x)}
                y={padTop}
                width={colWidth}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
