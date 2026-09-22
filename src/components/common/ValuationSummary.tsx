import React from 'react';
import { Award, ShieldCheck, CheckCircle2, FileText, Hash, Calendar, DollarSign } from 'lucide-react';
import { ExposureSourceBadge } from './ExposureSourceBadge';

export interface ValuationSummaryData {
  baseRateSqFt: number;
  marketValueCr: number;
  realizableValueCr: number;
  distressValueCr: number;
  technicalGrade: string;
  recommendedApfRateSqFt: number;
  validityPeriodMonths: number;
  valuerName: string;
  valuerAgency: string;
  empanelmentCode: string;
  submissionDate: string;
  reportVersion: string;
  reportHash: string;
  digitalSignatureId: string;
  rateBand2BHK: string;
  rateBand3BHK: string;
  floorRisePerFloor: number;
  facingPremium: string;
  riskObservations: string[];
}

interface ValuationSummaryProps {
  data: ValuationSummaryData;
}

export const ValuationSummary: React.FC<ValuationSummaryProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf2f7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102a43]">Valuation Summary & Formal Technical Grade</h3>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30">
              SIMULATED POC DATA
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Independent Technical Appraisal by {data.valuerAgency} ({data.empanelmentCode})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#e6f4ea] text-[#137333] border border-[#137333]/20 flex items-center gap-1 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Grade {data.technicalGrade}</span>
          </div>
          <span className="text-xs text-[#627d98] font-mono">Version {data.reportVersion}</span>
        </div>
      </div>

      {/* 4 Core Value Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-1">
          <span className="text-[11px] text-[#627d98] font-medium">Recommended APF Rate</span>
          <div className="text-xl font-bold font-mono text-[#137333]">
            ₹{data.recommendedApfRateSqFt.toLocaleString()} / sq.ft
          </div>
          <span className="text-[10px] text-[#627d98]">Adopted Base Rate</span>
        </div>

        <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-1">
          <span className="text-[11px] text-[#627d98] font-medium">Fair Market Value</span>
          <div className="text-xl font-bold font-mono text-[#102a43]">
            ₹{data.marketValueCr.toFixed(1)} Cr
          </div>
          <span className="text-[10px] text-[#627d98]">Total Inspected Scope</span>
        </div>

        <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-1">
          <span className="text-[11px] text-[#627d98] font-medium">Realizable Value (90%)</span>
          <div className="text-xl font-bold font-mono text-[#19638c]">
            ₹{data.realizableValueCr.toFixed(1)} Cr
          </div>
          <span className="text-[10px] text-[#627d98]">Orderly Liquidation</span>
        </div>

        <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-1">
          <span className="text-[11px] text-[#627d98] font-medium">Distress Value (75%)</span>
          <div className="text-xl font-bold font-mono text-[#b06000]">
            ₹{data.distressValueCr.toFixed(1)} Cr
          </div>
          <span className="text-[10px] text-[#627d98]">Forced SARFAESI Base</span>
        </div>
      </div>

      {/* Rate Matrix & Configuration Bands */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
        <div>
          <span className="text-[#627d98] block text-[11px] font-medium">2 BHK Approved Band</span>
          <span className="font-bold text-[#102a43]">{data.rateBand2BHK}</span>
        </div>
        <div>
          <span className="text-[#627d98] block text-[11px] font-medium">3 BHK Approved Band</span>
          <span className="font-bold text-[#102a43]">{data.rateBand3BHK}</span>
        </div>
        <div>
          <span className="text-[#627d98] block text-[11px] font-medium">Floor Rise & Premiums</span>
          <span className="font-bold text-[#102a43]">
            ₹{data.floorRisePerFloor}/floor • {data.facingPremium}
          </span>
        </div>
      </div>

      {/* Risk Observations */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Key Technical Observations
        </span>
        <ul className="text-xs space-y-1.5 text-[#334e68]">
          {data.riskObservations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Immutable Hash & Signature Footer */}
      <div className="pt-4 border-t border-[#edf2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#f8fafc] p-3 rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#102a43] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <span>Digitally Signed: {data.valuerName}</span>
          </div>
          <span className="font-mono text-[10px] text-[#627d98] block">
            SHA-256: {data.reportHash}
          </span>
        </div>

        <div className="text-right text-[11px] text-[#627d98]">
          <div>Submitted: <strong>{data.submissionDate}</strong></div>
          <div className="text-[#137333] font-semibold">Validity: {data.validityPeriodMonths} Months</div>
        </div>
      </div>
    </div>
  );
};
