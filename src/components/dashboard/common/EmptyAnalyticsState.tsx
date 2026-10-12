import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface EmptyAnalyticsStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center shadow-2xs space-y-3">
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-50 text-slate-400 mx-auto">
        {icon || <ShieldCheck className="w-8 h-8 text-emerald-600" />}
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
