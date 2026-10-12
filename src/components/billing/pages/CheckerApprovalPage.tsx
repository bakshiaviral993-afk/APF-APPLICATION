import React, { useState } from 'react';
import { BillMaster } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Building2,
  Printer,
  Eye,
  FileCheck2,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

interface CheckerApprovalPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  onOpenHoldModal: (bill: BillMaster) => void;
  currentUser: string;
}

export const CheckerApprovalPage: React.FC<CheckerApprovalPageProps> = ({
  bills,
  onOpenBillDetail,
  onOpenPrintModal,
  onOpenHoldModal,
  currentUser,
}) => {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [checkerRemarks, setCheckerRemarks] = useState<string>(
    'Sanctioned for payment as per financial delegation matrix. Maker verification accepted.'
  );

  const approvalBills = bills.filter((b) => b.status === 'BILL_APPROVAL');
  const selectedBill = approvalBills.find((b) => b.id === selectedBillId) || approvalBills[0] || null;

  // Enforce Maker != Checker
  const isMakerSameAsChecker = selectedBill
    ? !billingStore.validateMakerChecker(selectedBill.id, currentUser).isValid
    : false;

  const handleApprove = (billId: string) => {
    const val = billingStore.validateMakerChecker(billId, currentUser);
    if (!val.isValid) {
      alert(`Approval Blocked: ${val.error}`);
      return;
    }

    try {
      billingStore.approveBillChecker(billId, currentUser || 'Amitav Sen (COM)', checkerRemarks);
      alert(`Bill ${billId} successfully approved for payment. Status: APPROVED_FOR_PAYMENT.`);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReturnToMaker = (billId: string) => {
    const reason = prompt('Specify instruction for Maker re-verification:');
    if (reason) {
      // Revert status to BILL_VERIFICATION
      const bill = billingStore.getBillById(billId);
      if (bill) {
        bill.status = 'BILL_VERIFICATION';
        alert(`Bill ${billId} returned to Maker Queue.`);
      }
    }
  };

  const handleReject = (billId: string) => {
    const reason = prompt('Specify rejection reason:');
    if (reason) {
      billingStore.rejectBill(billId, currentUser || 'Amitav Sen (COM)', reason);
      alert(`Bill ${billId} rejected.`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3.5 text-xs text-purple-900">
        <ShieldCheck className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-purple-950">Checker Sanction & Authorization Authority</div>
          <div>
            Independent supervisor verifies Maker audit, checks financial delegation limits, and authorizes
            disbursements. Enforces strict segregation of duties (Maker ≠ Checker).
          </div>
        </div>
      </div>

      {approvalBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <div className="text-base font-semibold text-slate-800">Checker Approval Queue is Empty</div>
          <div className="text-xs text-slate-500 mt-1">
            No bills currently awaiting sanction authorization.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bills Left Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
              <span>Pending Checker Sanction ({approvalBills.length})</span>
            </div>

            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {approvalBills.map((b) => {
                const isSelected = selectedBill?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBillId(b.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-400 shadow-xs'
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
                        <span className="font-mono font-bold text-purple-900">
                          ₹{b.netPayable.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Maker: {b.makerVerification?.verifiedBy?.split(' ')[0] || 'Verified'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sanction Authorization Panel */}
          {selectedBill && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-base font-bold text-slate-900 font-mono">{selectedBill.id}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedBill.vendorName} • Net: ₹{selectedBill.netPayable.toLocaleString()}
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
                    Inspect Full Dossier →
                  </button>
                </div>
              </div>

              {/* Segregation of Duties Warning */}
              {isMakerSameAsChecker && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-950">Segregation of Duties Violation</div>
                    <div>
                      You ({currentUser}) are recorded as the Maker who verified this bill. Under bank policy,
                      the Checker approval must be performed by a different officer. Self-approval is blocked.
                    </div>
                  </div>
                </div>
              )}

              {/* Maker Verification Record Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Maker Verification Record</div>
                <div className="text-slate-800">
                  Verified By: <span className="font-semibold">{selectedBill.makerVerification?.verifiedBy}</span> on{' '}
                  <span className="font-mono">{selectedBill.makerVerification?.verifiedAt}</span>
                </div>
                <div className="text-slate-600 italic">
                  "{selectedBill.makerVerification?.remarks || 'Rate and milestones verified.'}"
                </div>
              </div>

              {/* Financial Breakup Snapshot */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Gross Professional Fee</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                    ₹{selectedBill.subtotalProfessionalFee.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">GST + Reimbursements</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                    ₹{(selectedBill.taxDetails.totalTax + selectedBill.approvedReimbursementAmount).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-[10px] text-purple-800 uppercase font-bold">Authorized Net Payable</div>
                  <div className="text-sm font-bold font-mono text-purple-900 mt-1">
                    ₹{selectedBill.netPayable.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Checker Remarks */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Checker Approval Sanction Memo</label>
                <textarea
                  rows={2}
                  value={checkerRemarks}
                  onChange={(e) => setCheckerRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReturnToMaker(selectedBill.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return to Maker
                  </button>

                  <button
                    onClick={() => onOpenHoldModal(selectedBill)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Hold
                  </button>

                  <button
                    onClick={() => handleReject(selectedBill.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>

                <button
                  disabled={isMakerSameAsChecker}
                  onClick={() => handleApprove(selectedBill.id)}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                    isMakerSameAsChecker
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-purple-700 hover:bg-purple-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" /> Sanction & Authorize Payment
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
