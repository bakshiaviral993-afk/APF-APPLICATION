import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ExceptionItem {
  id: string;
  category: 'LEGAL' | 'TECHNICAL' | 'EXPOSURE' | 'QUERY' | 'BILLING' | 'LOS';
  title: string;
  entityName: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  description: string;
  sourceModule: string;
  actionLabel: string;
  onResolve: () => void;
}

interface ExceptionPanelProps {
  title?: string;
  exceptions: ExceptionItem[];
  emptyMessage?: string;
}

export const ExceptionPanel: React.FC<ExceptionPanelProps> = ({
  title = 'Critical Risk & Exception Radar',
  exceptions,
  emptyMessage = 'No active underwriting or operational exceptions. All risk checks passed.',
}) => {
  const getSeverityBadge = (severity: ExceptionItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            High Priority
          </span>
        );
      case 'MEDIUM':
      default:
        return (
          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Watch
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 font-mono">
          {exceptions.length} Item{exceptions.length === 1 ? '' : 's'}
        </span>
      </div>

      {exceptions.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
          <p className="font-semibold text-slate-700">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 space-y-2">
          {exceptions.map((exc) => (
            <div
              key={exc.id}
              onClick={exc.onResolve}
              className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {getSeverityBadge(exc.severity)}
                  <strong className="text-xs font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                    {exc.title}
                  </strong>
                  <span className="text-[11px] text-slate-500">({exc.entityName})</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{exc.description}</p>
                <div className="text-[10px] text-slate-400">Source: {exc.sourceModule}</div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  exc.onResolve();
                }}
                className="self-start sm:self-center px-2.5 py-1 text-[11px] font-bold text-sky-800 hover:text-sky-950 border border-slate-300 rounded-md hover:bg-white flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{exc.actionLabel}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
