import React, { useState } from 'react';
import { BillMaster, ReimbursementCategory } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { X, Receipt, Upload, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';

interface ReimbursementClaimModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReimbursementClaimModal: React.FC<ReimbursementClaimModalProps> = ({
  bill,
  onClose,
  onSuccess,
}) => {
  const [expenseType, setExpenseType] = useState<ReimbursementCategory>('Government Search Fee');
  const [claimedAmount, setClaimedAmount] = useState<number>(3500);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [receiptDocName, setReceiptDocName] = useState('Govt_Challan_Official_Receipt.pdf');
  const [isPreApproved, setIsPreApproved] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimedAmount <= 0) {
      setErrorMsg('Claimed amount must be greater than zero.');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('Please specify the business purpose for this reimbursement expense.');
      return;
    }

    try {
      billingStore.addReimbursementClaim(bill.id, {
        expenseType,
        claimedAmount,
        expenseDate,
        purpose: purpose.trim(),
        receiptDocName,
        isPreApproved,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit reimbursement claim.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Submit Reimbursement Claim
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bill Ref: {bill.id} • {bill.vendorName}
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
            <label className="block text-slate-700 font-bold mb-1">
              Reimbursement Expense Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as ReimbursementCategory)}
              className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              <option value="Travel">Travel (Outstation Inspection)</option>
              <option value="Local Conveyance">Local Conveyance / Fuel / Tolls</option>
              <option value="Government Search Fee">Government Search Fee (IGR / Sub-Registrar)</option>
              <option value="Registration / Certified Copy Fee">Registration / Certified Copy Fee</option>
              <option value="Courier">Courier / Notary / Franking</option>
              <option value="Printing / Documentation">Printing / Documentation / Blueprints</option>
              <option value="Other Approved Expense">Other Approved Expense</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Claimed Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Expense Incurred Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Business Purpose & Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Haveli taluka Sub-Registrar Index-II 30-year online search receipt"
              className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Official Challan / Receipt Proof Document
            </label>
            <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-800">{receiptDocName}</span>
              <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Attached
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isPreApproved}
              onChange={(e) => setIsPreApproved(e.target.checked)}
              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-[11px] text-slate-700 font-medium">
              Pre-approved under Rate Card reimbursement policy cap
            </span>
          </label>

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
              className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Add Reimbursement Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
