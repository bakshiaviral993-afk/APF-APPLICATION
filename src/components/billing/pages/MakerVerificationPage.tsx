import React, { useState } from 'react';
import { BillMaster } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  ShieldAlert,
  Search,
  AlertTriangle,
  Building2,
  Eye,
  ArrowRight,
  Printer,
  Scale,
} from 'lucide-react';

interface MakerVerificationPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  onOpenRaiseQueryModal: (bill: BillMaster) => void;
  onOpenHoldModal: (bill: BillMaster) => void;
  onOpenRecomputeModal: (bill: BillMaster) => void;
  currentUser: string;
}

export const MakerVerificationPage: React.FC<MakerVerificationPageProps> = ({
  bills,
  onOpenBillDetail,
  onOpenPrintModal,
  onOpenRaiseQueryModal,
  onOpenHoldModal,
  onOpenRecomputeModal,
  currentUser,
}) => {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [makerRemarks, setMakerRemarks] = useState<string>(
    'Verified against technical appraisal report, sanctioned tower scope, and Schedule B rate card tariff.'
  );

  const pendingBills = bills.filter(
    (b) => b.status === 'INVOICE_SUBMITTED' || b.status === 'BILL_VERIFICATION'
  );

  const selectedBill = pendingBills.find((b) => b.id === selectedBillId) || pendingBills[0] || null;

  const handleVerify = (billId: string) => {
    try {
      billingStore.verifyBillMaker(billId, currentUser || 'Rohan Deshmukh (CPA)', makerRemarks);
      alert(`Bill ${billId} successfully verified and forwarded to Checker Approval Queue.`);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleReturnToVendor = (billId: string) => {
    const reason = prompt('Specify return reason for vendor correction (e.g. GSTIN typo, missing search fee receipt):');
    if (reason) {
      billingStore.returnBillToVendor(billId, currentUser || 'Rohan Deshmukh (CPA)', reason);
      alert(`Bill ${billId} returned to vendor.`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3.5 text-xs text-blue-900">
        <FileCheck2 className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-blue-950">Maker Underwriting & Billing Verification Desk</div>
          <div>
            Maker verifies service completion evidence, rate card calculations, vendor tax invoice validity,
            TDS applicability u/s 194J, and reimbursement receipts prior to submitting for Checker authorization.
          </div>
        </div>
      </div>

      {pendingBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <div className="text-base font-semibold text-slate-800">Maker Verification Queue is Clean</div>
          <div className="text-xs text-slate-500 mt-1">
            All submitted vendor invoices have been validated and forwarded to Checker.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bills Left Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
              <span>Pending Maker Action ({pendingBills.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Select bill to inspect checklist</span>
            </div>

            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {pendingBills.map((b) => {
                const isSelected = selectedBill?.id === b.id;
                const hasVariance = Boolean(
                  b.vendorInvoice?.varianceAmount && Math.abs(b.vendorInvoice.varianceAmount) > 10
                );

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBillId(b.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-xs">{b.id}</span>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {b.caseId}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 text-xs mt-1 truncate">
                      {b.vendorName}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5">{b.serviceType}</div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Net Payable:</span>{' '}
                        <span className="font-mono font-bold text-sky-800">
                          ₹{b.netPayable.toLocaleString()}
                        </span>
                      </div>
                      {hasVariance ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Fee Variance: +₹{b.vendorInvoice?.varianceAmount}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Rate Match (₹0)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Verification Checklist & Actions */}
          {selectedBill && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-base font-bold text-slate-900 font-mono">{selectedBill.id}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedBill.vendorName} • {selectedBill.projectName}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenPrintModal(selectedBill)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Print Bill Summary"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenBillDetail(selectedBill)}
                    className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Full Dossier →
                  </button>
                </div>
              </div>

              {/* 8-Point Verification Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Maker Verification Checklist
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Report Acceptance</div>
                      <div className="text-[10px] text-slate-500">Accepted by CPA/COM on file</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Tower Scope & Sanction</div>
                      <div className="text-[10px] text-slate-500">{selectedBill.towerNames.length} towers verified</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Rate Card Tariff Match</div>
                      <div className="text-[10px] text-slate-500">Base ₹{selectedBill.rateCardSnapshot.baseFee.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Bank Account & IFSC</div>
                      <div className="text-[10px] text-slate-500">Penny drop verified via Core Bank</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">TDS Deduction Section</div>
                      <div className="text-[10px] text-slate-500">Sec {selectedBill.tdsDetails.sectionCode} @ {selectedBill.tdsDetails.ratePct}%</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800">Reimbursement Vouchers</div>
                      <div className="text-[10px] text-slate-500">₹{selectedBill.approvedReimbursementAmount.toLocaleString()} approved</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Maker Sign-off Notes & Remarks</label>
                <textarea
                  rows={2}
                  value={makerRemarks}
                  onChange={(e) => setMakerRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReturnToVendor(selectedBill.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return to Vendor
                  </button>

                  <button
                    onClick={() => onOpenRaiseQueryModal(selectedBill)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Raise Query
                  </button>

                  <button
                    onClick={() => onOpenHoldModal(selectedBill)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Put On Hold
                  </button>
                </div>

                <button
                  onClick={() => handleVerify(selectedBill.id)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" /> Verify & Forward to Checker
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
