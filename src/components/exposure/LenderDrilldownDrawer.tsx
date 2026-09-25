import React from 'react';
import { LenderExposureGroup, LenderFacilityDetail } from '../../types/exposureTypes';
import {
  X,
  Building,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  Layers,
  ArrowUpRight,
  Lock,
} from 'lucide-react';

interface LenderDrilldownDrawerProps {
  lender: LenderExposureGroup | null;
  onClose: () => void;
}

export const LenderDrilldownDrawer: React.FC<LenderDrilldownDrawerProps> = ({ lender, onClose }) => {
  if (!lender) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 bg-[#0c3148] text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 font-bold">
                {lender.institutionType}
              </span>
              <span className="text-xs text-sky-200 font-mono">Lender ID: {lender.lenderId}</span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-300" />
              <span>{lender.lenderName}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Comprehensive facility inspection, charge perfection, covenants and repayment behavior
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="bg-[#f1f5f9] p-4 border-b border-[#cbd5e1] grid grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#627d98] uppercase">Total Sanctioned</span>
            <div className="text-base font-black text-[#102a43] mt-0.5">₹{lender.totalSanctionedCr.toFixed(1)} Cr</div>
            <span className="text-[10px] text-slate-500 font-mono">{lender.facilityCount} Facilities</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#627d98] uppercase">Current Outstanding</span>
            <div className="text-base font-black text-[#19638c] mt-0.5">₹{lender.totalOutstandingCr.toFixed(1)} Cr</div>
            <span className="text-[10px] text-emerald-700 font-bold">Verified Golden</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#627d98] uppercase">Non-Fund Facilities</span>
            <div className="text-base font-black text-[#829ab1] mt-0.5">₹{lender.totalNonFundCr.toFixed(1)} Cr</div>
            <span className="text-[10px] text-slate-500">Bank Guarantees / LC</span>
          </div>
        </div>

        {/* Scrollable Facility List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#102a43]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#334e68] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#19638c]" />
              <span>Registered Credit Facilities ({lender.facilities.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-[#829ab1]">
              Verified as of: {lender.lastVerificationDate}
            </span>
          </div>

          {lender.facilities.map((fac) => (
            <div
              key={fac.facilityId}
              className="p-5 rounded-xl border border-[#cbd5e1] bg-white shadow-2xs space-y-4 hover:border-[#19638c] transition-colors"
            >
              {/* Facility Title & Status */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {fac.facilityId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        fac.verificationStatus === 'MATCHED' || fac.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {fac.verificationStatus}
                    </span>
                    {fac.escrowLien && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Escrow Trapped
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#102a43] mt-1.5">{fac.facilityName}</h4>
                  <div className="text-[11px] text-[#627d98] mt-0.5">
                    Borrower: <strong className="text-[#102a43]">{fac.borrowerEntity}</strong> ({fac.borrowerPan})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#829ab1] uppercase font-bold">Outstanding</div>
                  <div className="text-lg font-black text-[#19638c]">₹{fac.currentOutstandingCr.toFixed(1)} Cr</div>
                  <div className="text-[10px] text-slate-500">of ₹{fac.sanctionedLimitCr.toFixed(1)} Cr Sanction</div>
                </div>
              </div>

              {/* Grid of Attributes */}
              <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                <div>
                  <span className="text-[#829ab1] block text-[10px]">Mapped Asset / Project</span>
                  <strong className="text-[#102a43]">{fac.mappedProject || 'Corporate Level (Unallocated)'}</strong>
                </div>

                <div>
                  <span className="text-[#829ab1] block text-[10px]">Repayment Behavior (DPD)</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {fac.repaymentTrack || 'Regular (0 DPD)'}
                  </span>
                </div>

                <div>
                  <span className="text-[#829ab1] block text-[10px]">Sanction Letter Ref</span>
                  <span className="font-mono text-[#334e68]">{fac.sanctionLetterRef || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-[#829ab1] block text-[10px]">Interest Rate / Pricing</span>
                  <span className="font-medium text-[#334e68]">{fac.interestRate || 'MCLR Linked'}</span>
                </div>

                <div>
                  <span className="text-[#829ab1] block text-[10px]">Primary Evidence Source</span>
                  <span className="text-[#19638c] font-semibold">{fac.sourceLabel}</span>
                </div>

                <div>
                  <span className="text-[#829ab1] block text-[10px]">Evidence As-Of Date</span>
                  <span className="font-mono text-[#334e68]">{fac.asOfDate}</span>
                </div>
              </div>

              {/* Security & Charge Information */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#829ab1] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#19638c]" />
                  <span>Security Perfection & Mortgage Ranking</span>
                </span>
                <p className="text-[11px] text-[#334e68] bg-amber-50/50 p-2.5 rounded-md border border-amber-200/60">
                  <strong className="text-amber-900 font-semibold">{fac.mortgageRanking}: </strong>
                  {fac.securityDescription}
                </p>
                {fac.mcaChargeId && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#627d98] pt-1">
                    <span>ROC Charge Filing: <strong>{fac.mcaChargeId}</strong></span>
                    <span className="text-emerald-700 font-bold">{fac.chargeStatus}</span>
                  </div>
                )}
              </div>

              {/* Covenants */}
              {fac.covenants && fac.covenants.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase text-[#829ab1]">Governing Sanction Covenants</span>
                  <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-700">
                    {fac.covenants.map((cov, idx) => (
                      <li key={idx}>{cov}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviewer / Underwriter Commentary */}
              {fac.reviewerNotes && (
                <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200 text-[11px] text-blue-950">
                  <strong className="font-semibold">Reconciliation & Risk Note: </strong>
                  {fac.reviewerNotes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#cbd5e1] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#829ab1]">
            SIMULATED POC DATA • Multi-Source Corroboration Stack
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0c3148] text-white text-xs font-bold rounded-lg hover:bg-[#102a43] transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
