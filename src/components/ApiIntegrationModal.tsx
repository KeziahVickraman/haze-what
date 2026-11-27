import { useState } from 'react';
import { X } from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiIntegrationModal({ isOpen, onClose }: ApiIntegrationModalProps) {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  if (!isOpen) return null;

  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health?upstream=1');
      const data = await res.json();
      setHealthStatus(
        data.ok
          ? `OK · Upstream data.gov.sg status ${data.upstreamStatus}`
          : `Degraded · Upstream status ${data.upstreamStatus ?? 'unreachable'}`
      );
    } catch {
      setHealthStatus('Failed to reach /api/health');
    } finally {
      setCheckingHealth(false);
    }
  };

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
              Serverless API Endpoints
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connected to Singapore NEA data.gov.sg v2 real-time PSI API via root <code className="font-mono text-slate-700">/api</code> handlers.
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
            <div className="text-xs font-semibold text-slate-900 mb-1.5">
              1. Active Serverless Routes (<code className="font-mono">/api</code>)
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-800 space-y-1.5 overflow-x-auto">
              <div>GET /api/psi → https://api-open.data.gov.sg/v2/real-time/api/psi</div>
              <div>GET /api/health → Service &amp; upstream health probe</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 mb-1.5">
              2. Endpoint Diagnostics
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleCheckHealth()}
                disabled={checkingHealth}
                className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-60"
              >
                {checkingHealth ? 'Checking...' : 'Check /api/health'}
              </button>
              {healthStatus && (
                <span className="font-mono text-xs text-slate-700 tabular-nums">
                  {healthStatus}
                </span>
              )}
            </div>
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
