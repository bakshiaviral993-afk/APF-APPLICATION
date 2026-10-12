import React from 'react';
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  FileX,
  CreditCard,
  Send,
} from 'lucide-react';

export interface PriorityActionItem {
  id: string;
  type:
    | 'SLA_BREACH'
    | 'BLOCKING_QUERY'
    | 'APPROVAL_PENDING'
    | 'EXPOSURE_MISMATCH'
    | 'LEGAL_BLOCKING'
    | 'LOS_FAILURE'
    | 'BILLING_EXCEPTION';
  title: string;
  description: string;
  severity: 'danger' | 'warning' | 'info';
  count?: number;
  actionLabel: string;
  onAction: () => void;
}

interface PriorityActionStripProps {
  items: PriorityActionItem[];
}

export const PriorityActionStrip: React.FC<PriorityActionStripProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const getIcon = (type: PriorityActionItem['type']) => {
    switch (type) {
      case 'SLA_BREACH':
        return <Clock className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'BLOCKING_QUERY':
        return <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'APPROVAL_PENDING':
        return <AlertTriangle className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'EXPOSURE_MISMATCH':
        return <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'LEGAL_BLOCKING':
        return <FileX className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'LOS_FAILURE':
        return <Send className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'BILLING_EXCEPTION':
        return <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />;
    }
  };

  const getCardStyle = (severity: PriorityActionItem['severity']) => {
    switch (severity) {
      case 'danger':
        return 'bg-rose-50/70 border-rose-200/90 text-rose-950 hover:border-rose-300';
      case 'warning':
        return 'bg-amber-50/70 border-amber-200/90 text-amber-950 hover:border-amber-300';
      case 'info':
      default:
        return 'bg-sky-50/70 border-sky-200/90 text-sky-950 hover:border-sky-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        <span>Priority Attention Queue ({items.length} urgent items)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={item.onAction}
            className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs flex flex-col justify-between group ${getCardStyle(
              item.severity
            )}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <strong className="text-xs font-bold leading-tight line-clamp-1">
                    {item.title}
                  </strong>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 shrink-0">
                    {item.count}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 pl-6">
                {item.description}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-sky-900 group-hover:text-sky-950">
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
