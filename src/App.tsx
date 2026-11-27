import { useState } from 'react';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { NationalOverviewCard } from './components/NationalOverviewCard';
import { RegionalTable } from './components/RegionalTable';
import { SingaporeMap } from './components/SingaporeMap';
import { TopBar } from './components/TopBar';
import { TrendChart } from './components/TrendChart';
import {
  getSnapshotForScenario,
  SCENARIO_OPTIONS,
  simulateRefreshSnapshot,
} from './data/psiService';
import { MetricView, PsiSnapshot, RegionFilterId, ScenarioId } from './types/psi';

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('moderate-haze');
  const [snapshot, setSnapshot] = useState<PsiSnapshot>(() =>
    getSnapshotForScenario('moderate-haze')
  );
  const [selectedRegion, setSelectedRegion] = useState<RegionFilterId>('national');
  const [metricView, setMetricView] = useState<MetricView>('psi24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleScenarioChange = (nextScenario: ScenarioId) => {
    setScenarioId(nextScenario);
    setSnapshot(getSnapshotForScenario(nextScenario));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setSnapshot((prev) => simulateRefreshSnapshot(prev));
      setIsRefreshing(false);
    }, 320);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar isRefreshing={isRefreshing} onRefresh={handleRefresh} />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Workspace Overview Header & Controls */}
        <section
          id="overview"
          aria-label="Dashboard controls and status"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2"
        >
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Singapore Air Quality &amp; Haze Tracker
            </h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <span className="font-mono tabular-nums text-slate-700">
                Updated {snapshot.updatedAtDisplay}
              </span>
              <span aria-hidden="true">·</span>
              <span>5 NEA Monitoring Regions</span>
              <span aria-hidden="true">·</span>
              <span>Frontend Preview Data</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Metric Toggle */}
            <div
              role="group"
              aria-label="Display metric"
              className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setMetricView('psi24h')}
                className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  metricView === 'psi24h'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24-hr PSI
              </button>
              <button
                type="button"
                onClick={() => setMetricView('pm25_1h')}
                className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  metricView === 'pm25_1h'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-hr PM2.5
              </button>
            </div>

            {/* Scenario Preview Selector */}
            <div
              role="group"
              aria-label="Haze condition scenario preview"
              className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
            >
              {SCENARIO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.shortDescription}
                  onClick={() => handleScenarioChange(opt.id)}
                  className={`px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    scenarioId === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Primary Focal Row: National/Regional Overview + Interactive Singapore Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4">
            <NationalOverviewCard
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              metricView={metricView}
              isLoading={isRefreshing}
              onResetToNational={() => setSelectedRegion('national')}
            />
          </div>
          <div className="lg:col-span-8">
            <SingaporeMap
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              metricView={metricView}
              onSelectRegion={setSelectedRegion}
            />
          </div>
        </div>

        {/* 24-Hour Trend Chart */}
        <TrendChart
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          metricView={metricView}
        />

        {/* Regional Breakdown Table */}
        <RegionalTable
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* NEA Health Advisory Matrix */}
        <HealthAdvisorySection snapshot={snapshot} selectedRegion={selectedRegion} />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            SG HazeMonitor · Singapore 24-hr PSI &amp; 1-hr PM2.5 Regional Tracker (NEA Band Scale)
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="text-slate-700 font-medium hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              API Connection Guide
            </button>
          </div>
        </div>
      </footer>

      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
