import React from 'react';
import { useAPF } from '../../context/APFContext';
import {
  FileText,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  Copy,
} from 'lucide-react';

export const EvidenceDrawer: React.FC = () => {
  const { activeEvidence, setActiveEvidence, addAuditLog } = useAPF();

  if (!activeEvidence) return null;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(activeEvidence.snippet);
    addAuditLog('COPY_EVIDENCE_SNIPPET', activeEvidence.sourceId, 'Copied OCR text snippet to clipboard');
  };

  const confidencePct = Math.round(activeEvidence.confidenceScore * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">Bank AI Evidence Inspector</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {activeEvidence.sourceId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Verifiable Source Provenance & Document OCR Coordinates</p>
            </div>
          </div>
          <button
            onClick={() => setActiveEvidence(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Provenance Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] block">Source Category</span>
              <span className="font-semibold text-slate-200 mt-0.5 inline-block">{activeEvidence.sourceType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Document Reference</span>
              <span className="font-semibold text-indigo-300 mt-0.5 inline-block">{activeEvidence.documentTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Page / Section / Clause</span>
              <span className="font-mono text-slate-200 mt-0.5 inline-block">{activeEvidence.pageOrSection}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">As-Of Reporting Date</span>
              <span className="font-semibold text-amber-300 mt-0.5 inline-block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {activeEvidence.asOfDate}
              </span>
            </div>
          </div>

          {/* AI Extraction Confidence */}
          <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-medium text-slate-200">Optical Character & Field Extraction Confidence</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">{confidencePct}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confidencePct >= 95 ? 'bg-emerald-500' : confidencePct >= 85 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Extraction audited by Document Agent v2.4 against OCR vector bounding coordinates.
            </p>
          </div>

          {/* Extracted Key Field */}
          <div>
            <span className="font-semibold text-slate-300 block mb-1.5">Governed Field Extraction:</span>
            <div className="p-3 rounded-md bg-slate-950 border border-indigo-900/60 font-mono text-indigo-200 text-xs">
              {activeEvidence.extractedField}
            </div>
          </div>

          {/* Source Document Excerpt with Highlighting */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300">Source Document Bounding Box Snippet:</span>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Snippet</span>
              </button>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 relative font-serif text-slate-300 leading-relaxed text-xs">
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                OCR Box #8821
              </div>
              <p className="p-2 bg-yellow-500/10 border-l-2 border-yellow-400 text-yellow-100 rounded-r">
                "{activeEvidence.snippet}"
              </p>
            </div>
          </div>

          {/* Governance Notice */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-normal">
              Bank Underwriting Standard Rule 4.1: All AI observations must be grounded in immutable primary source documents. An authorized credit or risk officer may accept, edit, or reject the resulting analysis before inclusion in the final credit committee pack.
            </p>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Audit Lineage Ref: <span className="font-mono text-slate-300">LIN-{activeEvidence.sourceId}</span>
          </div>
          <button
            onClick={() => setActiveEvidence(null)}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
