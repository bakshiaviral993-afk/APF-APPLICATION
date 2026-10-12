import React, { useState } from 'react';
import { BillMaster } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { RefreshCw, X, AlertTriangle, History, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RecomputationModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: (updatedBill: BillMaster) => void;
  currentUser: string;
}

export const RecomputationModal: React.FC<RecomputationModalProps> = ({
  bill,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [reasonCategory, setReasonCategory] = useState<string>('Rate Card Revision');
  const [changedRuleOrQty, setChangedRuleOrQty] = useState<string>(
    'Rate card updated to new tariff schedule with revised tower scope formula'
  );
  const [rateAdjustmentPercent, setRateAdjustmentPercent] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewGross = Math.round(bill.subtotalProfessionalFee * (1 + rateAdjustmentPercent / 100));
  const previewTax = Math.round((previewGross + bill.approvedReimbursementAmount) * (bill.taxDetails.gstRatePct / 100));
  const previewTds = Math.round(previewGross * (bill.tdsDetails.ratePct / 100));
  const previewNet = previewGross + bill.approvedReimbursementAmount + previewTax - previewTds;
  const variance = previewNet - bill.netPayable;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullReason = `${reasonCategory}: ${notes || changedRuleOrQty}`;
      const updated = billingStore.recomputeBill(
        bill.id,
        currentUser || 'Billing Officer',
        fullReason,
        changedRuleOrQty,
        rateAdjustmentPercent
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(`Error recomputing bill: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">Bill Recomputation Engine</div>
              <div className="text-xs text-slate-400 font-mono">
                {bill.id} • Current Version: v{(bill.recomputationHistory?.length || 0) + 1}.0
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-amber-900 space-y-1">
              <div className="font-semibold text-amber-950">Bank-Grade Calculation Audit Policy</div>
              <div>
                Recomputation recalculates professional fees and taxes while strictly preserving previous versions.
                Historical invoices, TDS certificates, and SAP vouchers are never overwritten.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Recomputation Reason *</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-sky-500"
              >
                <option value="Rate Card Revision">Rate Card Revision / Master Update</option>
                <option value="Tower Scope Correction">Tower / Phase Scope Count Correction</option>
                <option value="Distance & Travel Tariff Revision">Distance / Outstation Travel Tariff Adjustment</option>
                <option value="Reimbursement Audit Revision">Reimbursement Audit Disallowance / Correction</option>
                <option value="Policy & Executive Override">Policy / Credit Committee Tariff Override</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Fee Tariff Adjustment (% on Professional Fee)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={rateAdjustmentPercent}
                  onChange={(e) => setRateAdjustmentPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. 5 or -10"
                />
                <span className="font-semibold text-slate-500">%</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Enter positive for increment, negative for decrement, or 0 to keep rates.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Changed Rule / Scope Parameters *</label>
            <input
              type="text"
              required
              value={changedRuleOrQty}
              onChange={(e) => setChangedRuleOrQty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 font-medium"
              placeholder="e.g. Revised from 2 to 4 towers under Clause 4.2 of Schedule B"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Audit Justification & Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
              placeholder="Add justification for committee and internal audit records..."
            />
          </div>

          {/* Before vs After Impact Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Financial Impact Preview
            </div>
            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Current Net Payable</div>
                <div className="text-sm font-bold font-mono text-slate-800">
                  ₹{bill.netPayable.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Recomputed Net Payable</div>
                <div className="text-sm font-bold font-mono text-sky-700">
                  ₹{previewNet.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Variance Impact</div>
                <div
                  className={`text-sm font-bold font-mono ${
                    variance > 0 ? 'text-amber-700' : variance < 0 ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {variance > 0 ? `+₹${variance.toLocaleString()}` : `₹${variance.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Recomputations if any */}
          {bill.recomputationHistory && bill.recomputationHistory.length > 0 && (
            <div className="space-y-1.5 border-t border-slate-200 pt-3">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-slate-500" /> Historical Recomputations (
                {bill.recomputationHistory.length})
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {bill.recomputationHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2 bg-slate-100 rounded text-[11px] flex items-center justify-between font-mono"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">v{rec.calculationVersion}.0</span> •{' '}
                      {rec.requestedBy} • {rec.reason}
                    </div>
                    <div className="text-slate-700 font-semibold">
                      ₹{rec.oldAmount.toLocaleString()} → ₹{rec.newAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isSubmitting ? 'Calculating...' : 'Execute Recomputation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
