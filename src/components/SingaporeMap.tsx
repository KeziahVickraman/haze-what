import { useState } from 'react';
import { Compass } from 'lucide-react';
import { SINGAPORE_REGIONS } from '../data/psiService';
import { MetricView, PsiSnapshot, RegionFilterId, RegionId } from '../types/psi';
import { getPm25Band, getPsiBand, PSI_BANDS } from '../utils/airQuality';

interface SingaporeMapProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionFilterId;
  metricView: MetricView;
  onSelectRegion: (region: RegionFilterId) => void;
}

/**
 * Stylized geographic zone polygons overlaid on Singapore mainland
 * (viewBox 0 0 800 470) for interactive region click targets.
 */
const REGION_ZONES: Record<RegionId, string> = {
  north: 'M 255,95 L 485,88 L 535,155 L 465,195 L 330,192 L 245,165 Z',
  west: 'M 80,210 L 245,165 L 330,192 L 320,305 L 145,355 L 75,280 Z',
  central: 'M 330,192 L 465,195 L 498,275 L 430,295 L 320,305 Z',
  east: 'M 465,195 L 535,155 L 718,175 L 690,285 L 498,275 Z',
  south: 'M 320,305 L 430,295 L 498,275 L 485,375 L 325,388 L 280,350 Z',
};

export function SingaporeMap({
  snapshot,
  selectedRegion,
  metricView,
  onSelectRegion,
}: SingaporeMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  const getRegionDisplay = (id: RegionId) => {
    const reading = snapshot.regions[id];
    if (metricView === 'psi24h') {
      const band = getPsiBand(reading.psi24h);
      return {
        value: reading.psi24h,
        unit: 'PSI',
        bandLabel: band.label,
        hex: band.hex,
        tintHex: band.tintHex,
        strokeHex: band.strokeHex,
        symbol: band.symbol,
      };
    }
    const band = getPm25Band(reading.pm25_1h);
    return {
      value: reading.pm25_1h,
      unit: 'µg/m³',
      bandLabel: band.label,
      hex: band.hex,
      tintHex: '#F8FAFC',
      strokeHex: band.hex,
      symbol: band.symbol,
    };
  };

  const handleRegionClick = (id: RegionId) => {
    onSelectRegion(selectedRegion === id ? 'national' : id);
  };

  const hoveredMeta = hoveredRegion
    ? SINGAPORE_REGIONS.find((r) => r.id === hoveredRegion)
    : null;

  return (
    <section
      id="regional-map"
      aria-label="Singapore regional air quality map"
      className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Singapore Regional Stations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a region on the map to inspect local pollutant readings and 24-hour trends
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
            <Compass className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>
              {snapshot.wind.monsoonPhase} · {snapshot.wind.directionLabel}{' '}
              {snapshot.wind.speedKmh} km/h
            </span>
          </span>
          {selectedRegion !== 'national' && (
            <button
              type="button"
              onClick={() => onSelectRegion('national')}
              className="px-2.5 py-1.5 min-h-[32px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Selection
            </button>
          )}
        </div>
      </div>

      {/* Interactive SVG Map Stage */}
      <div className="relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
        <svg
          viewBox="0 0 800 460"
          role="img"
          aria-label="Map of Singapore showing 5 NEA air quality monitoring regions"
          className="w-full h-auto block select-none"
        >
          <defs>
            <pattern id="seaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.6"
              />
            </pattern>
            <clipPath id="mainlandClip">
              <path d="M 96,265 C 86,246 86,222 104,205 C 128,184 166,184 198,176 C 228,168 242,140 264,124 C 296,100 342,96 382,102 C 420,108 456,122 486,144 C 514,164 552,172 596,178 C 648,185 692,190 712,208 C 724,220 714,244 684,258 C 646,276 594,288 544,296 C 498,303 472,326 442,344 C 406,366 364,368 326,356 C 288,344 260,322 216,320 C 174,318 142,334 114,322 C 94,314 104,282 96,265 Z" />
            </clipPath>
          </defs>

          {/* Straits ocean background & lat/lon grid */}
          <rect width="800" height="460" fill="#F1F5F9" />
          <rect width="800" height="460" fill="url(#seaGrid)" />

          {/* Subtle geographic coordinate labels */}
          <text x="16" y="24" className="fill-slate-400 text-[10px] font-mono">
            1.47°N · 103.60°E
          </text>
          <text x="688" y="446" className="fill-slate-400 text-[10px] font-mono">
            1.22°N · 104.05°E
          </text>
          <text x="348" y="42" className="fill-slate-400 text-[11px] tracking-widest uppercase font-medium">
            Johor Strait
          </text>
          <text x="342" y="438" className="fill-slate-400 text-[11px] tracking-widest uppercase font-medium">
            Singapore Strait
          </text>

          {/* Singapore Mainland base silhouette */}
          <path
            d="M 96,265 C 86,246 86,222 104,205 C 128,184 166,184 198,176 C 228,168 242,140 264,124 C 296,100 342,96 382,102 C 420,108 456,122 486,144 C 514,164 552,172 596,178 C 648,185 692,190 712,208 C 724,220 714,244 684,258 C 646,276 594,288 544,296 C 498,303 472,326 442,344 C 406,366 364,368 326,356 C 288,344 260,322 216,320 C 174,318 142,334 114,322 C 94,314 104,282 96,265 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Interactive Regional Color Sectors clipped to Mainland */}
          <g clipPath="url(#mainlandClip)">
            {SINGAPORE_REGIONS.map((region) => {
              const info = getRegionDisplay(region.id);
              const isSelected = selectedRegion === region.id;
              const isHovered = hoveredRegion === region.id;
              return (
                <path
                  key={region.id}
                  d={REGION_ZONES[region.id]}
                  fill={info.hex}
                  fillOpacity={isSelected ? 0.24 : isHovered ? 0.18 : 0.11}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="cursor-pointer transition-opacity duration-150"
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              );
            })}
          </g>

          {/* Mainland perimeter crisp stroke */}
          <path
            d="M 96,265 C 86,246 86,222 104,205 C 128,184 166,184 198,176 C 228,168 242,140 264,124 C 296,100 342,96 382,102 C 420,108 456,122 486,144 C 514,164 552,172 596,178 C 648,185 692,190 712,208 C 724,220 714,244 684,258 C 646,276 594,288 544,296 C 498,303 472,326 442,344 C 406,366 364,368 326,356 C 288,344 260,322 216,320 C 174,318 142,334 114,322 C 94,314 104,282 96,265 Z"
            fill="none"
            stroke="#64748B"
            strokeWidth="1.5"
            pointerEvents="none"
          />

          {/* Offshore Islands: Jurong Island, Sentosa, Pulau Ubin, Pulau Tekong */}
          <path
            d="M 164,338 L 222,332 L 246,354 L 198,376 L 154,358 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <text x="196" y="388" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Jurong Island
          </text>

          <path
            d="M 358,366 L 392,369 L 386,382 L 352,377 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <text x="372" y="395" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Sentosa
          </text>

          <path
            d="M 556,138 L 604,132 L 614,148 L 566,154 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <text x="584" y="126" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Pulau Ubin
          </text>

          <path
            d="M 634,126 L 678,120 L 686,154 L 642,160 Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <text x="662" y="114" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Pulau Tekong
          </text>

          {/* Subtle Central Catchment Reserve / Expressways geographic cue */}
          <path
            d="M 332,190 Q 374,174 402,202 Q 388,236 346,228 Z"
            fill="#E2E8F0"
            fillOpacity="0.65"
            pointerEvents="none"
          />
          <path
            d="M 140,256 Q 285,222 418,244 T 658,224"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 4"
            pointerEvents="none"
          />
          <path
            d="M 392,126 Q 406,225 404,332"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 4"
            pointerEvents="none"
          />

          {/* Wind Direction Vector Compass in Top-Right of Map */}
          <g transform="translate(722, 66)">
            <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="0" y="-17" textAnchor="middle" className="fill-slate-400 text-[8px] font-mono">
              N
            </text>
            <g transform={`rotate(${snapshot.wind.bearingDeg})`}>
              <line x1="0" y1="12" x2="0" y2="-11" stroke="#0284C7" strokeWidth="2" />
              <polygon points="0,-14 -4,-6 4,-6" fill="#0284C7" />
            </g>
            <text x="0" y="42" textAnchor="middle" className="fill-slate-600 text-[10px] font-mono font-medium">
              {snapshot.wind.directionLabel} {snapshot.wind.speedKmh}km/h
            </text>
          </g>

          {/* 5 Interactive Regional Station Readout Cards */}
          {SINGAPORE_REGIONS.map((region) => {
            const info = getRegionDisplay(region.id);
            const isSelected = selectedRegion === region.id;
            const isHovered = hoveredRegion === region.id;

            return (
              <g
                key={region.id}
                transform={`translate(${region.mapX}, ${region.mapY})`}
                onClick={() => handleRegionClick(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                role="button"
                tabIndex={0}
                aria-label={`${region.name} region: ${info.value} ${info.unit}, ${info.bandLabel}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRegionClick(region.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                {/* Selection ring */}
                {isSelected && (
                  <rect
                    x="-54"
                    y="-34"
                    width="108"
                    height="68"
                    rx="10"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                )}

                {/* Station Card */}
                <rect
                  x="-50"
                  y="-30"
                  width="100"
                  height="60"
                  rx="8"
                  fill="#FFFFFF"
                  stroke={isSelected || isHovered ? info.hex : '#CBD5E1'}
                  strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                />

                {/* Top color indicator bar inside card */}
                <rect
                  x="-50"
                  y="-30"
                  width="100"
                  height="5"
                  rx="2"
                  fill={info.hex}
                />

                <text
                  x="0"
                  y="-10"
                  textAnchor="middle"
                  className="fill-slate-600 text-[11px] font-semibold"
                >
                  {region.name}
                </text>

                <text
                  x="0"
                  y="11"
                  textAnchor="middle"
                  className="fill-slate-900 text-[18px] font-bold font-mono tabular-nums"
                >
                  {info.value}
                </text>

                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={info.strokeHex}
                  className="text-[9.5px] font-semibold"
                >
                  {info.bandLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Subtle Hover Inspection Bar */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          {hoveredMeta ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{hoveredMeta.name} Station:</span>
              <span>{hoveredMeta.towns.slice(0, 4).join(', ')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-500">
                {hoveredMeta.latitude.toFixed(3)}°N, {hoveredMeta.longitude.toFixed(3)}°E
              </span>
            </div>
          ) : (
            <span>
              Click any region card on the map to filter the summary and 24-hour trend chart.
            </span>
          )}
          <span className="font-mono text-slate-400 tabular-nums">
            Metric: {metricView === 'psi24h' ? '24-hr PSI' : '1-hr PM2.5 (µg/m³)'}
          </span>
        </div>
      </div>

      {/* NEA Official PSI Band Scale Legend */}
      <div className="mt-4 pt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="font-medium text-slate-500">NEA 24-hr PSI Scale:</span>
        {PSI_BANDS.map((band) => (
          <div key={band.key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`w-2.5 h-2.5 rounded-xs shrink-0 ${band.bgClass}`}
              aria-hidden="true"
            />
            <span className="font-mono tabular-nums text-slate-700">{band.rangeLabel}</span>
            <span className="text-slate-500">{band.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
