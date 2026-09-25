import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  ShieldCheck,
  Building2,
  ExternalLink,
  X,
  FileSpreadsheet,
  Download,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { demoExposureService } from '../../services/demoExposureService';
import { BuilderExposureResponse, ExposureSnapshot } from '../../types/demoExposureTypes';

interface FetchExposureDrawerProps {
  isOpen: boolean;
  builderId: string;
  builderName?: string;
  caseId?: string;
  onClose: () => void;
  onFetchComplete: (response: BuilderExposureResponse, snapshot?: ExposureSnapshot) => void;
  onNavigateToTab?: (tab: 'SUMMARY' | 'RECONCILIATION' | 'LENDER' | 'PROJECT') => void;
}

type FetchStage =
  | 'QUEUED'
  | 'FETCHING SOURCES'
  | 'EXTRACTING'
  | 'MATCHING'
  | 'RECONCILING'
  | 'READY'
  | 'COMPLETED';

interface SourceItemProgress {
  name: string;
  category: string;
  status: 'PENDING' | 'LOADING' | 'FETCHED' | 'DEMO CONNECTED';
  detail: string;
}

export const FetchExposureDrawer: React.FC<FetchExposureDrawerProps> = ({
  isOpen,
  builderId,
  builderName,
  caseId,
  onClose,
  onFetchComplete,
  onNavigateToTab,
}) => {
  const [currentStage, setCurrentStage] = useState<FetchStage>('QUEUED');
  const [progressPct, setProgressPct] = useState<number>(5);
  const [sources, setSources] = useState<SourceItemProgress[]>([
    { name: 'MCA Charges', category: 'RoC Index of Charges', status: 'PENDING', detail: 'Ministry of Corporate Affairs CHG-1/CHG-4 filings' },
    { name: 'Credit Rating Disclosure', category: 'Rating Agency Rationale', status: 'PENDING', detail: 'CRISIL / ICRA Bank Loan Rating Annexures' },
    { name: 'Audited Financials', category: 'Auditor Notes', status: 'PENDING', detail: 'FY25 Annual Report & Borrowing Disclosures' },
    { name: 'Borrower Declaration', category: 'Self Indebtedness', status: 'PENDING', detail: 'Promoter / CA Certified Indebtedness Statement' },
    { name: 'CIC (CIBIL)', category: 'Commercial Bureau', status: 'PENDING', detail: 'TransUnion Commercial Credit Facility Records' },
    { name: 'CRILC', category: 'RBI Large Credits Repository', status: 'PENDING', detail: 'RBI Large Credits Exposure (₹5 Cr+)' },
    { name: 'CERSAI', category: 'Asset Registry', status: 'PENDING', detail: 'Registered Equitable Mortgages & Security Filings' },
    { name: 'Internal CBS / LMS', category: 'Proval Core Banking', status: 'PENDING', detail: 'Internal Corporate Loan Limits & Non-Fund LCs' },
    { name: 'LOS / Retail LMS', category: 'Retail Project Finance', status: 'PENDING', detail: 'Retail Home Loan Portfolio & In-flight Pipeline' },
  ]);
  const [resultData, setResultData] = useState<BuilderExposureResponse | null>(null);
  const [frozenSnapshot, setFrozenSnapshot] = useState<ExposureSnapshot | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Run the staged workflow whenever opened
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStage('QUEUED');
    setProgressPct(8);
    setResultData(null);
    setFrozenSnapshot(null);

    // Reset sources
    setSources([
      { name: 'MCA Charges', category: 'RoC Index of Charges', status: 'PENDING', detail: 'Ministry of Corporate Affairs CHG-1/CHG-4 filings' },
      { name: 'Credit Rating Disclosure', category: 'Rating Agency Rationale', status: 'PENDING', detail: 'CRISIL / ICRA Bank Loan Rating Annexures' },
      { name: 'Audited Financials', category: 'Auditor Notes', status: 'PENDING', detail: 'FY25 Annual Report & Borrowing Disclosures' },
      { name: 'Borrower Declaration', category: 'Self Indebtedness', status: 'PENDING', detail: 'Promoter / CA Certified Indebtedness Statement' },
      { name: 'CIC (CIBIL)', category: 'Commercial Bureau', status: 'PENDING', detail: 'TransUnion Commercial Credit Facility Records' },
      { name: 'CRILC', category: 'RBI Large Credits Repository', status: 'PENDING', detail: 'RBI Large Credits Exposure (₹5 Cr+)' },
      { name: 'CERSAI', category: 'Asset Registry', status: 'PENDING', detail: 'Registered Equitable Mortgages & Security Filings' },
      { name: 'Internal CBS / LMS', category: 'Proval Core Banking', status: 'PENDING', detail: 'Internal Corporate Loan Limits & Non-Fund LCs' },
      { name: 'LOS / Retail LMS', category: 'Retail Project Finance', status: 'PENDING', detail: 'Retail Home Loan Portfolio & In-flight Pipeline' },
    ]);

    // Timer stages
    const t1 = setTimeout(() => {
      setCurrentStage('FETCHING SOURCES');
      setProgressPct(25);
      setSources((prev) =>
        prev.map((s, i) =>
          i < 4
            ? { ...s, status: 'FETCHED' }
            : i === 4
            ? { ...s, status: 'LOADING' }
            : s
        )
      );
    }, 900);

    const t2 = setTimeout(() => {
      setCurrentStage('EXTRACTING');
      setProgressPct(50);
      setSources((prev) =>
        prev.map((s, i) =>
          i < 4
            ? { ...s, status: 'FETCHED' }
            : i < 7
            ? { ...s, status: 'DEMO CONNECTED' }
            : i === 7
            ? { ...s, status: 'LOADING' }
            : s
        )
      );
    }, 1800);

    const t3 = setTimeout(() => {
      setCurrentStage('MATCHING');
      setProgressPct(70);
      setSources((prev) =>
        prev.map((s) => ({
          ...s,
          status: s.name.includes('CIC') || s.name.includes('CRILC') || s.name.includes('CERSAI') || s.name.includes('Internal') || s.name.includes('LOS')
            ? 'DEMO CONNECTED'
            : 'FETCHED',
        }))
      );
    }, 2700);

    const t4 = setTimeout(() => {
      setCurrentStage('RECONCILING');
      setProgressPct(88);
    }, 3500);

    const t5 = setTimeout(async () => {
      setCurrentStage('READY');
      setProgressPct(95);

      const resp = await demoExposureService.fetchBuilderExposure(builderId);
      const snapshot = demoExposureService.createOrFreezeSnapshot(
        builderId,
        caseId,
        'Credit Processing Associate (CPA Engine)'
      );

      setResultData(resp);
      setFrozenSnapshot(snapshot);
      setCurrentStage('COMPLETED');
      setProgressPct(100);
      onFetchComplete(resp, snapshot);
    }, 4300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, builderId]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    setIsExporting(true);
    if (resultData) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resultData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `EXPOSURE_360_${builderId}_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-800/80">
                PROVAL EXPOSURE 360 ENGINE
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/60">
                POC DEMO MODE
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" />
              <span>Multi-Source Exposure Fetch Workflow</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Builder ID: <span className="font-mono text-sky-300 font-semibold">{builderId}</span> {builderName ? `• ${builderName}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Prominent POC Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>POC DEMO MODE:</strong> All exposure values, balances, and charges are SIMULATED POC DATA for bank workflow demonstration.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            NO LIVE CIC/CRILC
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Bar & Stage Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${currentStage !== 'COMPLETED' ? 'animate-spin' : ''}`} />
                Workflow Status: <span className="text-sky-800 font-mono uppercase font-black">{currentStage}</span>
              </span>
              <span className="font-mono font-bold text-sky-700">{progressPct}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Stages Step Indicator */}
            <div className="grid grid-cols-6 gap-1 pt-1 text-[10px] font-mono text-center text-slate-500">
              <div className={`p-1 rounded ${progressPct >= 10 ? 'bg-sky-100 text-sky-800 font-bold' : ''}`}>1. Queued</div>
              <div className={`p-1 rounded ${progressPct >= 30 ? 'bg-sky-100 text-sky-800 font-bold' : ''}`}>2. Fetch</div>
              <div className={`p-1 rounded ${progressPct >= 50 ? 'bg-sky-100 text-sky-800 font-bold' : ''}`}>3. Extract</div>
              <div className={`p-1 rounded ${progressPct >= 70 ? 'bg-sky-100 text-sky-800 font-bold' : ''}`}>4. Match</div>
              <div className={`p-1 rounded ${progressPct >= 88 ? 'bg-sky-100 text-sky-800 font-bold' : ''}`}>5. Recon</div>
              <div className={`p-1 rounded ${progressPct === 100 ? 'bg-emerald-100 text-emerald-800 font-bold' : ''}`}>6. Done</div>
            </div>
          </div>

          {/* Staged Source Feed Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Multilateral Data Sources (9 Checked)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Live API / Simulated Adapters</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {sources.map((src, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{src.name}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                        {src.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{src.detail}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    {src.status === 'PENDING' && (
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" /> Queued
                      </span>
                    )}
                    {src.status === 'LOADING' && (
                      <span className="text-[11px] text-sky-600 font-mono font-bold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-600" /> Fetching...
                      </span>
                    )}
                    {src.status === 'FETCHED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fetched
                      </span>
                    )}
                    {src.status === 'DEMO CONNECTED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" /> Demo Connected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Card */}
          {currentStage === 'COMPLETED' && resultData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-950">EXPOSURE FETCH COMPLETED</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Data extracted across 9 sources, reconciled against golden-record rules, and frozen into immutable snapshot.
                  </p>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sources Checked</div>
                  <div className="text-base font-black text-slate-800 font-mono">9 / 9</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Facilities Found</div>
                  <div className="text-base font-black text-slate-800 font-mono">{resultData.facilities.length} Facilities</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Exceptions</div>
                  <div className="text-base font-black text-amber-700 font-mono">
                    {resultData.reconciliation.filter((r) => r.status === 'REVIEW REQUIRED' || r.status === 'CONFLICT').length}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Golden Status</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">READY FOR REVIEW</div>
                </div>
              </div>

              {/* Frozen Snapshot Pill */}
              {frozenSnapshot && (
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 text-xs flex items-center justify-between font-mono">
                  <div>
                    <span className="text-slate-500">Immutable Snapshot ID:</span>{' '}
                    <strong className="text-slate-900 font-black">{frozenSnapshot.snapshotId}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    LOCKED FOR AUDIT
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!resultData || isExporting}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
            </button>

            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToTab('RECONCILIATION');
                  onClose();
                }}
                disabled={currentStage !== 'COMPLETED'}
                className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
                <span>View Reconciliation</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('SUMMARY');
                onClose();
              }}
              disabled={currentStage !== 'COMPLETED'}
              className="px-4 py-2 rounded-xl bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <span>View Exposure 360</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
