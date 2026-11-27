import { X } from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiIntegrationModal({ isOpen, onClose }: ApiIntegrationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="api-modal-title" className="font-display text-lg font-semibold text-slate-900">
              API Integration Contract
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Frontend data layer is structured to match Singapore NEA data.gov.sg v2 endpoints.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <div className="text-xs font-semibold text-slate-900 mb-1">
              1. Official NEA Real-Time Endpoints
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-800 space-y-1 overflow-x-auto">
              <div>GET https://api-open.data.gov.sg/v2/real-time/api/psi</div>
              <div>GET https://api-open.data.gov.sg/v2/real-time/api/pm25</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 mb-1">
              2. Ready-to-Wire Adapter Function
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Replace the scenario call in <code className="font-mono text-slate-800">src/App.tsx</code> with{' '}
              <code className="font-mono text-slate-800">mapNeaApiResponseToSnapshot()</code> exported from{' '}
              <code className="font-mono text-slate-800">src/data/psiService.ts</code>.
            </p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3.5 font-mono text-xs overflow-x-auto leading-relaxed">
{`const res = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi');
const json: NeaDataGovPsiResponse = await res.json();
const snapshot = mapNeaApiResponseToSnapshot(json);`}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
