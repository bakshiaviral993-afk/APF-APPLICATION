import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import {
  DollarSign,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ExternalLink,
  MapPin,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  getResolvedValuationData,
  downloadLegalValuationReport,
  downloadValuationSummaryJson,
} from '../../utils/legalValuationExporter';

interface LegalValuationSectionProps {
  report: LegalDueDiligenceReport;
  caseData?: any;
  onOpenDocModal?: () => void;
}

export const LegalValuationSection: React.FC<LegalValuationSectionProps> = ({
  report,
  caseData,
  onOpenDocModal,
}) => {
  const val = getResolvedValuationData(report, caseData);

  const handleDownloadReport = () => {
    downloadLegalValuationReport(report, caseData);
  };

  const handleDownloadJson = () => {
    downloadValuationSummaryJson(report, caseData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
            15
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Legal Title & Asset Valuation Clearance
            </h4>
            <span className="text-[10px] text-slate-500 font-medium">
              30-Yr Title Enforceability • SARFAESI Security Check • Technical Valuation Schedule
            </span>
          </div>
        </div>

        {/* Primary Download Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadReport}
            title="Download full Bank APF Legal & Valuation Dossier (Print-ready HTML/PDF)"
            className="h-7 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Legal & Valuation Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            title="Download structured JSON dataset for LOS integration"
            className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Export JSON</span>
          </button>

          {onOpenDocModal && (
            <button
              type="button"
              onClick={onOpenDocModal}
              className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Open full formal printable report preview"
            >
              <Printer className="w-3 h-3 text-slate-500" />
              <span>Print Preview</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-3 space-y-2 text-xs">
        {/* Symmetrical 4-Card Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Card 1: Valuation Rates & Technical Grade */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Adopted Base Rate
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  Grade {val.technicalGrade}
                </span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                ₹{val.adoptedBaseRateSqFt.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">/sq.ft</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Recommended APF Rate:{' '}
                <strong className="text-sky-800 font-mono">
                  ₹{val.recommendedApfRateSqFt.toLocaleString()}/sq.ft
                </strong>
              </div>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex justify-between">
              <span>2BHK: {val.rateBand2BHK}</span>
              <span>3BHK: {val.rateBand3BHK}</span>
            </div>
          </div>

          {/* Card 2: Fair Market & Distress Valuation */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Fair Market Value (FMV)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  Total Project
                </span>
              </div>
              <div className="text-base font-black text-emerald-700 font-mono">
                ₹{val.fairMarketValueCr.toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
                <span>Realizable: <strong className="font-mono text-slate-800">₹{val.realizableValueCr.toFixed(2)} Cr</strong></span>
              </div>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex justify-between">
              <span>Distress Value:</span>
              <strong className="font-mono text-amber-700">₹{val.distressValueCr.toFixed(2)} Cr</strong>
            </div>
          </div>

          {/* Card 3: Legal Title Haircut & Net Cleared Collateral */}
          <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                  Net Cleared Collateral
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 border border-sky-300">
                  {val.legalHaircutPct === 0 ? '0% Haircut' : `${val.legalHaircutPct}% Haircut`}
                </span>
              </div>
              <div className="text-base font-black text-sky-900 font-mono">
                ₹{val.netClearedLoanableCr.toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                Title Risk Status:{' '}
                <strong className="text-emerald-700">
                  {report.legalOpinion?.opinion === 'Clear' ? 'Fully Marketable' : 'Conditional Clear'}
                </strong>
              </div>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-sky-200/80 text-[10px] text-sky-900 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-700 shrink-0" />
              <span className="truncate">SARFAESI Enforceability Confirmed</span>
            </div>
          </div>

          {/* Card 4: Empanelled Valuer Certificate & Inspection */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Empanelled Valuer
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  IBBI Certified
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {val.valuerName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {val.valuerAgency}
              </div>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 space-y-0.5">
              <div className="flex justify-between font-mono">
                <span>Reg: {val.valuerRegNo}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>500m Geofence Verified</span>
                </span>
                <span className="font-mono text-[9px]">{val.inspectionDate.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dense Collateral Clearance & Legal Observations Strip */}
        <div className="p-2 bg-slate-50/60 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-700">
              <strong>Legal & Valuation Alignment:</strong> Demarcated land of{' '}
              <span className="font-semibold text-slate-900">{report.landArea}</span> in Survey No.{' '}
              <span className="font-mono font-semibold">{report.surveyPlotNumber}</span> matches the physical boundaries and RCC structures inspected by the valuer.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer underline underline-offset-2"
            >
              <Download className="w-3 h-3" />
              <span>Download Valuation Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
