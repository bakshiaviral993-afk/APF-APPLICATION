import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

export interface RiskFlagItem {
  id: string;
  category: 'Credit Risk' | 'Legal Risk' | 'Project Execution' | 'Governance / Compliance' | 'Market / Valuation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  summary: string;
  sourceDoc: string;
  recommendedMitigation: string;
}

interface RiskFlagProps {
  flag: RiskFlagItem;
  onViewSource?: (sourceDoc: string) => void;
}

export const RiskFlag: React.FC<RiskFlagProps> = ({ flag, onViewSource }) => {
  const isCritical = flag.severity === 'Critical';
  const isHigh = flag.severity === 'High';
  const isMedium = flag.severity === 'Medium';

  return (
    <div
      className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
        isCritical
          ? 'bg-rose-50/40 border-[#c5221f]/30'
          : isHigh
          ? 'bg-amber-50/40 border-[#b06000]/30'
          : 'bg-[#f8fafc] border-[#e2e8f0]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isCritical
                ? 'bg-[#fce8e6] text-[#c5221f]'
                : isHigh
                ? 'bg-[#fef7e0] text-[#b06000]'
                : 'bg-[#e8f1f5] text-[#19638c]'
            }`}
          >
            {flag.severity}
          </span>
          <span className="text-[11px] text-[#627d98] font-medium">{flag.category}</span>
        </div>

        <span className="font-mono text-[10px] text-[#829ab1]">{flag.id}</span>
      </div>

      <h4 className="font-bold text-xs text-[#102a43]">{flag.title}</h4>
      <p className="text-[#334e68] leading-relaxed">{flag.summary}</p>

      <div className="pt-2 border-t border-[#edf2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="text-[#627d98]">
          <strong>Mitigation:</strong> {flag.recommendedMitigation}
        </div>

        {onViewSource && (
          <button
            onClick={() => onViewSource(flag.sourceDoc)}
            className="text-[#19638c] font-semibold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Evidence: {flag.sourceDoc}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
