import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import { TrendingUp, Download } from 'lucide-react';

interface LegalKpiStatsBarProps {
  report: LegalDueDiligenceReport;
  onDownloadReport?: () => void;
  onSelectValuation?: () => void;
}

export const LegalKpiStatsBar: React.FC<LegalKpiStatsBarProps> = ({
  report,
  onDownloadReport,
  onSelectValuation,
}) => {
  const openBlockingExCount =
    report.exceptions?.filter(
      (e) => e.blocking && e.status !== 'Resolved' && e.status !== 'Closed'
    ).length || 0;

  const totalChargeCr =
    report.encumbrances?.reduce((sum, item) => sum + (Number(item.chargeAmountCr) || 0), 0) || 0;

  const valFmv = report.valuationAlignment?.fairMarketValueCr || 244.80;
  const valRate = report.valuationAlignment?.adoptedBaseRateSqFt || 7200;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
      {/* 1. 30-Yr Title Chain */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          30-Yr Title Chain
        </div>
        <div
          className="text-xs font-bold text-slate-900 mt-0.5 truncate"
          title={`${report.titleChainStatus} (${report.titleChainRows?.length || 0} Instruments)`}
        >
          {report.titleChainStatus} ({report.titleChainRows?.length || 0} Deeds)
        </div>
      </div>

      {/* 2. Development Rights */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          Development Rights
        </div>
        <div
          className="text-xs font-bold text-emerald-800 mt-0.5 truncate"
          title={report.developmentRights?.developmentRightsStatus || 'Clear & Irrevocable'}
        >
          {report.developmentRights?.developmentRightsStatus || 'Clear & Irrevocable'}
        </div>
      </div>

      {/* 3. Encumbrances */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          Encumbrances
        </div>
        <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
          {report.encumbrances?.length || 0} Reg (₹{totalChargeCr.toFixed(1)} Cr)
        </div>
      </div>

      {/* 4. Active Lawsuits */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          Litigation Searches
        </div>
        <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
          {report.litigations?.length || 0} Case(s) Active
        </div>
      </div>

      {/* 5. Blocking Exceptions */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          Blocking Deficiencies
        </div>
        <div
          className={`text-xs font-mono font-bold mt-0.5 ${
            openBlockingExCount > 0 ? 'text-rose-600 font-black' : 'text-emerald-700'
          }`}
        >
          {openBlockingExCount > 0 ? `${openBlockingExCount} Deficiencies` : '0 Blocking'}
        </div>
      </div>

      {/* 6. Legal Opinion */}
      <div className="bg-white p-2.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[58px]">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          Legal Opinion
        </div>
        <div
          className="text-xs font-bold text-sky-900 mt-0.5 truncate"
          title={report.legalOpinion?.opinion || 'Clear'}
        >
          {report.legalOpinion?.opinion || 'Clear'}
        </div>
      </div>

      {/* 7. Approved Valuation & Download */}
      <div
        onClick={onSelectValuation}
        className="bg-sky-50/70 p-2.5 sm:px-3 sm:py-2 rounded-xl border border-sky-200 shadow-2xs flex flex-col justify-between min-h-[58px] cursor-pointer hover:bg-sky-100/70 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-sky-800 uppercase font-bold tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-600" />
            <span>Valuation</span>
          </span>
          {onDownloadReport && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadReport();
              }}
              title="Download Valuation Report"
              className="text-sky-700 hover:text-sky-900 p-0.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 truncate flex items-center justify-between">
          <span>₹{valFmv.toFixed(1)} Cr</span>
          <span className="text-[10px] text-sky-700 font-sans font-semibold">
            ₹{valRate.toLocaleString()}/sf
          </span>
        </div>
      </div>
    </div>
  );
};
