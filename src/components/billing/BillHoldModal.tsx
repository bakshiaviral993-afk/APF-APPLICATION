import React, { useState } from 'react';
import { BillMaster } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';

interface BillHoldModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: string;
}

export const BillHoldModal: React.FC<BillHoldModalProps> = ({
  bill,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const isCurrentlyHeld = Boolean(bill.holdDetail?.isHeld);
  const [reason, setReason] = useState(bill.holdDetail?.reason || '');
  const [category, setCategory] = useState<string>(bill.holdDetail?.category || 'DOCUMENT_DEFICIENCY');
  const [expectedResolutionDate, setExpectedResolutionDate] = useState(
    bill.holdDetail?.expectedResolutionDate || '2026-10-25'
  );
  const [remarks, setRemarks] = useState(bill.holdDetail?.remarks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleHold = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isCurrentlyHeld) {
        billingStore.releaseBillHold(bill.id, currentUser || 'Operations Officer', remarks);
      } else {
        billingStore.putBillOnHold(
          bill.id,
          currentUser || 'Operations Officer',
          reason || 'Document validation deficiency flagged during verification',
          category as any,
          expectedResolutionDate,
          remarks
        );
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error toggling hold: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isCurrentlyHeld
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
              }`}
            >
              {isCurrentlyHeld ? <PlayCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-base font-semibold text-white">
                {isCurrentlyHeld ? 'Release Administrative Hold' : 'Place Bill On Hold'}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {bill.id} • {bill.vendorName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleToggleHold} className="p-6 space-y-4 text-xs text-slate-700">
          {isCurrentlyHeld ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-900">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hold Status Active
              </div>
              <div>
                Placed on hold by <span className="font-semibold">{bill.holdDetail?.heldBy}</span> on{' '}
                <span className="font-semibold">{bill.holdDetail?.heldAt}</span> for reason:{' '}
                <span className="font-semibold">{bill.holdDetail?.reason}</span>.
              </div>
              <div className="text-[11px] text-emerald-800">
                Releasing this hold will automatically restore the bill to its appropriate workflow queue.
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
              <div className="font-semibold flex items-center gap-1.5 text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Executive Hold Policy
              </div>
              <div>
                Placing a bill on hold suspends maker verification, checker approval, ERP posting, and payments until
                investigations or compliance checks are cleared.
              </div>
            </div>
          )}

          {!isCurrentlyHeld && (
            <>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Hold Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="DOCUMENT_DEFICIENCY">Document Deficiency / Incomplete Evidence</option>
                  <option value="RATE_DISPUTE">Rate Card Tariff Dispute</option>
                  <option value="COMPLIANCE_CHECK">Vendor Compliance / IBBI Empanelment Inquiry</option>
                  <option value="BANK_INQUIRY">Bank Account / IFSC Penny Drop Re-verification</option>
                  <option value="FRAUD_ALERT">Audit Alert / Risk Investigation</option>
                  <option value="OTHER">Other Administrative Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Primary Hold Reason *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Sub-registrar search fee challan missing for 2018-2022"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Resolution Date</label>
                <input
                  type="date"
                  value={expectedResolutionDate}
                  onChange={(e) => setExpectedResolutionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              {isCurrentlyHeld ? 'Release Justification & Clearance Notes *' : 'Remarks / Instructions'}
            </label>
            <textarea
              rows={3}
              required={isCurrentlyHeld}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isCurrentlyHeld
                  ? 'Confirming receipt of certified search challans. Hold cleared for Maker review...'
                  : 'Add instructions for vendor desk or auditor...'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
                isCurrentlyHeld
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isCurrentlyHeld ? 'Release Hold & Resume Workflow' : 'Confirm Place On Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
