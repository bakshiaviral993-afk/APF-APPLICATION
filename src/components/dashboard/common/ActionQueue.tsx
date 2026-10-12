import React from 'react';
import { Clock, ArrowUpRight, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export interface ActionQueueItem {
  id: string; // Case ID or Invoice ID
  title: string; // Project / Entity
  subtitle: string; // Builder / Tower / Vendor
  stageLabel: string;
  stageColor?: string;
  slaDaysRemaining: number;
  slaStatus: 'CLEAN' | 'WARNING' | 'BREACHED';
  keyMetric?: string;
  priority?: 'High' | 'Standard' | 'Urgent';
  actionLabel?: string;
  onAction: () => void;
}

interface ActionQueueProps {
  title: string;
  subtitle?: string;
  items: ActionQueueItem[];
  emptyMessage?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export const ActionQueue: React.FC<ActionQueueProps> = ({
  title,
  subtitle,
  items,
  emptyMessage = 'No cases currently pending your action. All assigned dockets are in order.',
  onViewAll,
  viewAllLabel = 'View full queue',
}) => {
  const getSlaBadge = (status: ActionQueueItem['slaStatus'], days: number) => {
    switch (status) {
      case 'BREACHED':
        return (
          <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            Breached ({Math.abs(days)}d)
          </span>
        );
      case 'WARNING':
        return (
          <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Due Soon ({days}d)
          </span>
        );
      case 'CLEAN':
      default:
        return (
          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
            {days}d SLA
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {onViewAll && items.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] font-bold text-sky-800 hover:text-sky-950 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{viewAllLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-slate-700">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Docket ID</th>
                <th className="py-2.5 px-3">Entity / Asset</th>
                <th className="py-2.5 px-3">Workflow Stage</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3">Key Metric / Risk</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={item.onAction}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800 group-hover:text-sky-800 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.stageColor || 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {item.stageLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getSlaBadge(item.slaStatus, item.slaDaysRemaining)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">
                    {item.keyMetric || 'Standard Flow'}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onAction();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-900 hover:bg-sky-950 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>{item.actionLabel || 'Open'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
