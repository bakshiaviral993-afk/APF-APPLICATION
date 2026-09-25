import React from 'react';
import { ShieldAlert, Database, Calendar, CheckCircle2 } from 'lucide-react';

interface ExposureSourceBadgeProps {
  source: string;
  sourceDate?: string;
  freshness?: string;
  isSimulated?: boolean;
  isReconciled?: boolean;
  className?: string;
}

export const ExposureSourceBadge: React.FC<ExposureSourceBadgeProps> = ({
  source,
  sourceDate = '2026-09-02',
  freshness = 'T-18 Days',
  isSimulated = true,
  isReconciled = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 text-[11px] ${className}`}>
      <span className="px-1.5 py-0.5 rounded font-mono font-medium bg-[#f1f5f9] text-[#334e68] border border-[#cbd5e1] flex items-center gap-1">
        <Database className="w-3 h-3 text-[#19638c]" />
        {source}
      </span>
      {sourceDate && (
        <span className="text-[#627d98] flex items-center gap-0.5">
          <Calendar className="w-3 h-3" />
          {sourceDate} ({freshness})
        </span>
      )}
      {isReconciled && (
        <span className="px-1.5 py-0.5 rounded font-semibold bg-[#e6f4ea] text-[#137333] flex items-center gap-0.5">
          <CheckCircle2 className="w-3 h-3" />
          Reconciled
        </span>
      )}
    </div>
  );
};
