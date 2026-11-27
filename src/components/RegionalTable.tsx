import { useMemo, useState } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { SINGAPORE_REGIONS } from '../data/psiService';
import { PsiSnapshot, RegionFilterId, RegionId } from '../types/psi';
import { getPm25Band, getPsiBand } from '../utils/airQuality';

interface RegionalTableProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionFilterId;
  onSelectRegion: (region: RegionFilterId) => void;
}

type SortKey = 'name' | 'psi24h' | 'pm25_1h' | 'pm25_24h' | 'pm10_24h' | 'o3_8h_max' | 'so2_24h';

export function RegionalTable({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: RegionalTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('psi24h');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = SINGAPORE_REGIONS.filter((region) => {
      if (!q) return true;
      return (
        region.name.toLowerCase().includes(q) ||
        region.stationName.toLowerCase().includes(q) ||
        region.towns.some((t) => t.toLowerCase().includes(q))
      );
    });

    return filtered.sort((a, b) => {
      const valA = a.id === 'north' || a.id === 'south' || a.id === 'east' || a.id === 'west' || a.id === 'central'
        ? sortKey === 'name'
          ? a.name
          : snapshot.regions[a.id][sortKey]
        : '';
      const valB = sortKey === 'name' ? b.name : snapshot.regions[b.id][sortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [searchQuery, sortKey, sortAsc, snapshot]);

  const renderSortHeader = (label: string, key: SortKey, alignRight = true) => (
    <th
      scope="col"
      className={`py-2.5 px-3 text-xs font-semibold text-slate-500 whitespace-nowrap ${
        alignRight ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={() => handleSort(key)}
        className={`inline-flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer ${
          alignRight ? 'flex-row-reverse' : ''
        }`}
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`w-3 h-3 ${sortKey === key ? 'text-slate-900' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
    </th>
  );

  return (
    <section
      aria-label="Regional station breakdown table"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Station Readings by Region
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search by town (e.g. Tampines, Jurong, Orchard) or click any row to inspect on the map
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter region or town..."
            aria-label="Filter region or town"
            className="w-full h-10 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
          <p className="text-sm text-slate-600">
            No Singapore regions or towns matched &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {renderSortHeader('Region', 'name', false)}
                <th
                  scope="col"
                  className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"
                >
                  Coverage Areas
                </th>
                {renderSortHeader('24h PSI', 'psi24h')}
                <th
                  scope="col"
                  className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"
                >
                  Air Quality Band
                </th>
                {renderSortHeader('1h PM2.5', 'pm25_1h')}
                {renderSortHeader('24h PM2.5', 'pm25_24h')}
                {renderSortHeader('PM10', 'pm10_24h')}
                {renderSortHeader('O₃ (8h)', 'o3_8h_max')}
                {renderSortHeader('SO₂ (24h)', 'so2_24h')}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((region) => {
                const reading = snapshot.regions[region.id as RegionId];
                const psiBand = getPsiBand(reading.psi24h);
                const pmBand = getPm25Band(reading.pm25_1h);
                const isSelected = selectedRegion === region.id;

                return (
                  <tr
                    key={region.id}
                    onClick={() =>
                      onSelectRegion(isSelected ? 'national' : (region.id as RegionId))
                    }
                    className={`h-11 transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {region.name}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 max-w-[260px] truncate">
                      {region.towns.slice(0, 4).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {reading.psi24h}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${psiBand.textClass}`}>
                        <span aria-hidden="true">{psiBand.symbol}</span>
                        <span>{psiBand.label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{reading.pm25_1h}</span>
                      <span className={`text-[11px] ml-1.5 ${pmBand.textClass}`}>
                        {pmBand.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {reading.pm25_24h}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {reading.pm10_24h}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {reading.o3_8h_max}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                      {reading.so2_24h}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
