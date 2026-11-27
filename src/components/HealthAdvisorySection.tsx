import { useState } from 'react';
import { PsiSnapshot, RegionFilterId, RegionId } from '../types/psi';
import { getPsiBand, PSI_BANDS } from '../utils/airQuality';

interface HealthAdvisorySectionProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionFilterId;
}

type AdvisoryAudience = 'healthy' | 'sensitive' | 'outdoor' | 'mask';

const AUDIENCE_TABS: Array<{ id: AdvisoryAudience; label: string }> = [
  { id: 'healthy', label: 'General Public' },
  { id: 'sensitive', label: 'Vulnerable Groups' },
  { id: 'outdoor', label: 'Schools & Outdoor' },
  { id: 'mask', label: 'N95 & Indoor Air' },
];

export function HealthAdvisorySection({
  snapshot,
  selectedRegion,
}: HealthAdvisorySectionProps) {
  const [audience, setAudience] = useState<AdvisoryAudience>('healthy');

  const regionIds: RegionId[] = ['north', 'south', 'east', 'west', 'central'];
  const effectivePsi =
    selectedRegion === 'national'
      ? Math.max(...regionIds.map((id) => snapshot.regions[id].psi24h))
      : snapshot.regions[selectedRegion].psi24h;

  const activeBand = getPsiBand(effectivePsi);

  return (
    <section
      id="advisory"
      aria-label="NEA health advisory matrix"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            NEA Health & Activity Advisory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Current active guidance highlighted for{' '}
            <span className="font-medium text-slate-700">
              {selectedRegion === 'national'
                ? 'National Peak'
                : `${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} Region`}
            </span>{' '}
            (PSI <span className="font-mono tabular-nums">{effectivePsi}</span> · {activeBand.label})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {AUDIENCE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAudience(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                audience === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PSI_BANDS.map((band) => {
          const isCurrent = band.key === activeBand.key;
          const guidanceText =
            audience === 'healthy'
              ? band.healthyAdvice
              : audience === 'sensitive'
              ? band.sensitiveAdvice
              : audience === 'outdoor'
              ? band.outdoorAdvice
              : band.maskAndIndoorAdvice;

          return (
            <div
              key={band.key}
              className={`rounded-lg border p-4 flex flex-col justify-between transition-colors ${
                isCurrent
                  ? `${band.surfaceClass} ${band.borderClass}`
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold inline-flex items-center gap-1.5 ${band.textClass}`}>
                    <span aria-hidden="true">{band.symbol}</span>
                    <span>{band.label}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {band.rangeLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{guidanceText}</p>
              </div>

              {isCurrent && (
                <div className="mt-3 pt-2.5 border-t border-slate-900/10 text-[11px] font-semibold text-slate-800">
                  Active Advisory Level
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
