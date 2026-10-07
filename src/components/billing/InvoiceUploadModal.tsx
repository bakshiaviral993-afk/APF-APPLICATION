import React, { useState } from 'react';
import { BillMaster } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Building2,
  CreditCard,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface InvoiceUploadModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: () => void;
  isVendorUser?: boolean;
  currentUserName?: string;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadModalProps> = ({
  bill,
  onClose,
  onSuccess,
  isVendorUser = false,
  currentUserName = 'Vendor Representative',
}) => {
  const [invoiceNo, setInvoiceNo] = useState(
    bill.vendorInvoice?.invoiceNo || `${bill.vendorType === 'EXTERNAL_VALUER' ? 'VAL' : 'LEG'}-INV-${Date.now().toString().slice(-6)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(
    bill.vendorInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );
  const [invoiceAmount, setInvoiceAmount] = useState<number>(
    bill.vendorInvoice?.invoiceAmount || bill.grossAmountBeforeTax
  );
  const [taxAmount, setTaxAmount] = useState<number>(
    bill.vendorInvoice?.taxAmount || bill.taxDetails.totalTax
  );
  const [irnNumber, setIrnNumber] = useState(
    bill.vendorInvoice?.irnNumber ||
      '3e9a8f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f'
  );
  const [fileName, setFileName] = useState(
    bill.vendorInvoice?.invoiceDocName || `${bill.id}_Tax_Invoice_Signed.pdf`
  );
  const [bankDetailsConfirmed, setBankDetailsConfirmed] = useState(true);
  const [varianceReason, setVarianceReason] = useState(
    bill.vendorInvoice?.varianceRemarks || ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculatedGross = invoiceAmount + taxAmount;
  const systemGross = bill.grossInvoiceAmount;
  const varianceAmount = calculatedGross - systemGross;
  const hasVariance = Math.abs(varianceAmount) > 1; // More than 1 rupee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!invoiceNo.trim()) {
      setErrorMsg('Invoice Number is mandatory.');
      return;
    }

    if (!invoiceDate) {
      setErrorMsg('Invoice Date is mandatory.');
      return;
    }

    if (invoiceAmount <= 0) {
      setErrorMsg('Invoice amount must be greater than zero.');
      return;
    }

    if (!bankDetailsConfirmed) {
      setErrorMsg('Please confirm vendor bank account details.');
      return;
    }

    if (hasVariance && !varianceReason.trim()) {
      setErrorMsg('Please provide a justification for the invoice variance.');
      return;
    }

    try {
      billingStore.submitVendorInvoice(
        bill.id,
        {
          invoiceNo: invoiceNo.trim(),
          invoiceDate,
          invoiceAmount,
          taxAmount,
          grossAmount: calculatedGross,
          irnNumber: irnNumber.trim() || undefined,
          invoiceDocName: fileName,
          uploadedBy: currentUserName,
          varianceAmount,
          isVarianceAccepted: Math.abs(varianceAmount) <= 100, // within auto-tolerance
          varianceRemarks: varianceReason.trim() || undefined,
          bankDetailsConfirmed,
        },
        currentUserName
      );

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit invoice.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Upload Vendor Tax Invoice
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Docket #{bill.id} • {bill.vendorName} ({bill.projectName})
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
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Rate Card & System Calculated Baseline */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                System Rate Card Baseline:
              </span>
              <span className="font-mono font-bold text-sky-800">
                {bill.rateCardId} ({bill.rateCardVersion})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Base Professional:</span>
                <strong className="font-mono text-slate-900">
                  ₹{bill.subtotalProfessionalFee.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Reimbursements:</span>
                <strong className="font-mono text-slate-900">
                  ₹{bill.approvedReimbursementAmount.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">System Gross (w/ Tax):</span>
                <strong className="font-mono text-emerald-700">
                  ₹{bill.grossInvoiceAmount.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Vendor Invoice Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. INV-2026-0042"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Invoice Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Taxable Professional Fee (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={invoiceAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setInvoiceAmount(val);
                  setTaxAmount(Math.round(val * (bill.taxDetails.gstRatePct / 100)));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                GST Tax Amount (₹) ({bill.taxDetails.gstRatePct}%)
              </label>
              <input
                type="number"
                min={0}
                value={taxAmount}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                E-Invoice IRN (Invoice Reference Number) / QR Code Ref
              </label>
              <input
                type="text"
                value={irnNumber}
                onChange={(e) => setIrnNumber(e.target.value)}
                placeholder="64-character statutory NIC IRN hash"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Variance Warning Indicator */}
          {hasVariance && (
            <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>INVOICE VARIANCE DETECTED</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">System Gross:</span>
                  <strong className="font-mono text-slate-800">
                    ₹{systemGross.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Claimed Gross:</span>
                  <strong className="font-mono text-amber-900">
                    ₹{calculatedGross.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Variance:</span>
                  <strong
                    className={`font-mono font-bold ${
                      varianceAmount > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {varianceAmount > 0 ? `+₹${varianceAmount.toLocaleString()}` : `-₹${Math.abs(varianceAmount).toLocaleString()}`}
                  </strong>
                </div>
              </div>
              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  Justification / Variance Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={hasVariance}
                  value={varianceReason}
                  onChange={(e) => setVarianceReason(e.target.value)}
                  placeholder="e.g. Additional site re-inspection ordered by credit manager"
                  className="w-full h-8 px-3 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* File Attachment & Bank Confirmation */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Digitally Signed Tax Invoice PDF
              </label>
              <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {fileName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to attach
                </span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
              <input
                type="checkbox"
                checked={bankDetailsConfirmed}
                onChange={(e) => setBankDetailsConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-[11px] text-slate-700 leading-snug">
                I confirm that bank settlement should be routed directly to the verified empaneled bank
                account of <strong>{bill.vendorName}</strong>.
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-xs">
              <span className="text-slate-500">Gross Invoice Payable:</span>{' '}
              <strong className="font-mono text-slate-900 text-sm">
                ₹{calculatedGross.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Submit Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
