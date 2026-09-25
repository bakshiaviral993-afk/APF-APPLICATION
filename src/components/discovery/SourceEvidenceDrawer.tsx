import React from 'react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  Clock,
  FileText,
  Lock,
  Globe,
  Database,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { DiscoveredFieldProvenance, FreshnessLabel } from '../../types/discoveryTypes';

interface SourceEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields?: Record<string, DiscoveredFieldProvenance>;
  rawPayload?: string;
}

export const SourceEvidenceDrawer: React.FC<SourceEvidenceDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  rawPayload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Regulatory Source Evidence & Provenance
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {title} {subtitle && `— ${subtitle}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Authoritative Data Provenance Model:</span>
              <p className="mt-0.5 text-emerald-800">
                Every field in PROVAL maintains immutable source attribution, digital certificate references, extraction timestamps, and freshness classifications per RBI master guidelines.
              </p>
            </div>
          </div>

          {fields && Object.values(fields).length > 0 ? (
            <div className="space-y-4">
              {Object.values(fields).map((f) => (
                <div
                  key={f.fieldKey}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {f.label}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {Array.isArray(f.value) ? f.value.join(', ') : String(f.value)}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                      {f.freshness}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary Source:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        {f.sourceName}
                        {f.sourceUrl && (
                          <a
                            href={f.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </span>
                    </div>

                    {f.documentId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Document / SRN Ref:</span>
                        <span className="font-mono text-slate-700">{f.documentId}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">As-of Regulatory Date:</span>
                      <span className="font-mono text-slate-700">{f.asOfDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ingestion Timestamp:</span>
                      <span className="font-mono text-slate-500 text-[11px]">{f.fetchTimestamp}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Extraction Confidence:</span>
                      <span className="font-bold text-emerald-700">{(f.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rawPayload ? (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {rawPayload}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No evidence fields staged.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            CLOSE EVIDENCE VIEW
          </button>
        </div>
      </div>
    </div>
  );
};
