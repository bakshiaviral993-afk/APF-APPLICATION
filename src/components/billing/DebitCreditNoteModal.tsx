import React, { useState } from 'react';
import { BillMaster } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { X, FileText, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DebitCreditNoteModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: () => void;
  currentUserName?: string;
}

export const DebitCreditNoteModal: React.FC<DebitCreditNoteModalProps> = ({
  bill,
  onClose,
  onSuccess,
  currentUserName = 'Amitav Sen (COM)',
}) => {
  const [noteType, setNoteType] = useState<'CREDIT_NOTE' | 'DEBIT_NOTE'>('CREDIT_NOTE');
  const [amount, setAmount] = useState<number>(5000);
  const [reason, setReason] = useState(
    'Vendor SLA deduction: 4-day delay in final valuation submission without prior extension'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const gstRate = bill.taxDetails.gstRatePct || 18;
  const taxAdjustment = Math.round((amount * gstRate) / 100);
  const netAdjustment = amount + taxAdjustment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Note adjustment amount must be greater than zero.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Reason for debit/credit note is mandatory.');
      return;
    }

    try {
      billingStore.issueDebitCreditNote(bill.id, {
        noteType,
        amount,
        taxAdjustment,
        reason: reason.trim(),
        approvedBy: currentUserName,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue note.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Issue Debit / Credit Note
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Bill #{bill.id} • {bill.vendorName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Note Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNoteType('CREDIT_NOTE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  noteType === 'CREDIT_NOTE'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Credit Note (Reduce Vendor Payable)
              </button>
              <button
                type="button"
                onClick={() => setNoteType('DEBIT_NOTE')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  noteType === 'DEBIT_NOTE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Debit Note (Increase / Extra Scope)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Base Adjustment Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                GST Tax Impact ({gstRate}%)
              </label>
              <input
                type="text"
                disabled
                value={`₹${taxAdjustment.toLocaleString()}`}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Total ERP Financial Impact:</span>
            <strong className="font-mono text-slate-900 text-sm">
              ₹{netAdjustment.toLocaleString()}
            </strong>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Justification & Statutory Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for debit/credit note adjustment..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Issue {noteType === 'CREDIT_NOTE' ? 'Credit Note' : 'Debit Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
