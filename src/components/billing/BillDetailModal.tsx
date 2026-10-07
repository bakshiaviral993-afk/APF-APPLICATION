import React, { useState } from 'react';
import { BillMaster } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { UserAccount } from '../../types/apfTransaction';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Building2,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  DollarSign,
  Layers,
  ArrowRight,
  MessageSquare,
  History,
  FileCheck2,
  Info,
} from 'lucide-react';

interface BillDetailModalProps {
  bill: BillMaster;
  currentUser: UserAccount;
  onClose: () => void;
  onRefresh?: () => void;
  onOpenInvoiceUpload?: (bill: BillMaster) => void;
  onOpenQueryModal?: (bill: BillMaster) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  bill,
  currentUser,
  onClose,
  onRefresh,
  onOpenInvoiceUpload,
  onOpenQueryModal,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ERP_PAYLOAD' | 'AUDIT' | 'PAYMENT_ADVICE'>('DETAILS');
  const [makerRemarks, setMakerRemarks] = useState('');
  const [makerOverride, setMakerOverride] = useState('');
  const [checkerRemarks, setCheckerRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isMaker = currentUser.role === 'CPA' || currentUser.role === 'ADMIN';
  const isChecker =
    currentUser.role === 'COM' ||
    currentUser.role === 'ACOM' ||
    currentUser.role === 'RCOM' ||
    currentUser.role === 'ZCOM' ||
    currentUser.role === 'NCOM' ||
    currentUser.role === 'APPROVER' ||
    currentUser.role === 'ADMIN';

  const handleMakerVerify = () => {
    try {
      billingStore.verifyBillMaker(bill.id, currentUser.name, makerRemarks, makerOverride);
      setActionSuccess('Bill verified successfully by Maker! Forwarded to Checker Approval.');
      setIsVerifying(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckerApprove = () => {
    try {
      billingStore.approveBillChecker(bill.id, currentUser.name, checkerRemarks);
      setActionSuccess('Bill approved by Checker! Ready for Finance / ERP transmission.');
      setIsApproving(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendToFinance = () => {
    try {
      const res = billingStore.sendToFinanceERP(bill.id, currentUser.name);
      setActionSuccess(`Dispatched to ERP! Voucher No: ${res.voucherNo}, ERP Doc: ${res.erpDocNo}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSimulatePayment = () => {
    try {
      const utr = `RTGS${Date.now().toString().slice(-12)}`;
      billingStore.recordPayment(bill.id, {
        utrNumber: utr,
        paymentMethod: 'RTGS',
        paidAmount: bill.netPayable,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      setActionSuccess(`Payment processed successfully! UTR: ${utr}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'SENT_TO_FINANCE':
      case 'PAYMENT_IN_PROCESS':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'APPROVED_FOR_PAYMENT':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'BILL_APPROVAL':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'INVOICE_SUBMITTED':
      case 'BILL_VERIFICATION':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'VENDOR_INVOICE_PENDING':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'DRAFT_BILL':
      case 'BILLING_ELIGIBLE':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'RETURNED_FOR_CORRECTION':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white uppercase font-sans">
                  Vendor Bill Docket: {bill.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {bill.caseId}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(bill.status)}`}>
                  {bill.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {bill.vendorName} ({bill.vendorType === 'EXTERNAL_VALUER' ? 'Valuation Agency' : 'Legal Law Firm'}) •{' '}
                {bill.projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-1 rounded border border-sky-800">
              AUDITED FIN-TECH LEDGER
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between overflow-x-auto text-xs font-semibold text-slate-600 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('DETAILS')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'DETAILS'
                  ? 'border-sky-600 text-sky-900 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Bill Breakdown & Calculation
            </button>
            <button
              onClick={() => setActiveTab('ERP_PAYLOAD')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'ERP_PAYLOAD'
                  ? 'border-sky-600 text-sky-900 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Finance / ERP Payload
            </button>
            <button
              onClick={() => setActiveTab('PAYMENT_ADVICE')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'PAYMENT_ADVICE'
                  ? 'border-sky-600 text-sky-900 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Payment Advice & UTR
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'AUDIT'
                  ? 'border-sky-600 text-sky-900 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail
            </button>
          </div>

          <div className="flex items-center gap-2 py-1">
            {onOpenQueryModal && (
              <button
                type="button"
                onClick={() => onOpenQueryModal(bill)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Queries ({bill.queries.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'DETAILS' && (
            <>
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Assignment Context */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    APF Case & Project
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{bill.projectName}</div>
                  <div className="text-slate-600 text-[11px]">Builder: {bill.builderLegalName}</div>
                  <div className="text-slate-500 text-[10px]">
                    Towers: {bill.towerNames.join(', ')} ({bill.towerIds.length} Towers)
                  </div>
                  <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    Case Ref: {bill.caseId} • Assignment: {bill.assignmentId}
                  </div>
                </div>

                {/* Card 2: Vendor Details & Rate Card */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Vendor & Contract Rate Card
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate" title={bill.vendorName}>
                    {bill.vendorName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Applied Rate Card:{' '}
                    <strong className="text-sky-800 font-mono font-bold">{bill.rateCardId}</strong> ({bill.rateCardVersion})
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Fee Basis: <span className="font-bold">{bill.rateCardSnapshot.feeBasis}</span> (Base: ₹{bill.rateCardSnapshot.baseFee.toLocaleString()})
                  </div>
                  <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                    Addl Tower: ₹{bill.rateCardSnapshot.additionalTowerRate.toLocaleString()} • GST: {bill.taxDetails.gstRatePct}%
                  </div>
                </div>

                {/* Card 3: Financial Summary Box */}
                <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200/80 space-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-sky-800">
                      <span>Net Payable</span>
                      <span className="font-mono text-xs">INR (₹)</span>
                    </div>
                    <div className="text-2xl font-black text-sky-950 font-mono mt-0.5">
                      ₹{bill.netPayable.toLocaleString()}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-sky-200/60 space-y-0.5 text-[11px] text-slate-700">
                    <div className="flex justify-between">
                      <span>Gross Invoice:</span>
                      <strong className="font-mono">₹{bill.grossInvoiceAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>TDS u/s {bill.tdsDetails.sectionCode} ({bill.tdsDetails.ratePct}%):</span>
                      <strong className="font-mono">-₹{bill.tdsDetails.tdsAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Contract Fee Calculation Line Items (from Rate Card {bill.rateCardId})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Professional Subtotal: ₹{bill.subtotalProfessionalFee.toLocaleString()}
                  </span>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3">Service Description</th>
                      <th className="py-2 px-3 w-20 text-center">Qty</th>
                      <th className="py-2 px-3 w-28 text-right">Unit Rate (₹)</th>
                      <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                      <th className="py-2 px-3 w-24 text-center">Tax Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bill.lineItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{item.service}</div>
                          {item.remarks && <div className="text-[10px] text-slate-500 mt-0.5">{item.remarks}</div>}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-medium">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">₹{item.unitRate.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.taxCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/70 border-t border-slate-200 text-slate-700 text-xs">
                    <tr>
                      <td colSpan={4} className="py-1.5 px-3 font-semibold text-right">
                        Professional Fee Subtotal:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{bill.subtotalProfessionalFee.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-1.5 px-3 font-semibold text-right">
                        Approved Reimbursements (Government Searches / Conveyance):
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{bill.approvedReimbursementAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-1.5 px-3 font-semibold text-right">
                        Gross Before Tax:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{bill.grossAmountBeforeTax.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-1.5 px-3 font-semibold text-right text-sky-800">
                        GST @ {bill.taxDetails.gstRatePct}% ({bill.taxDetails.isInterState ? 'IGST' : 'CGST 9% + SGST 9%'}):
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-sky-900">
                        ₹{bill.taxDetails.totalTax.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-slate-100/80 font-bold">
                      <td colSpan={4} className="py-2 px-3 text-right uppercase text-slate-900">
                        Gross Invoice Amount:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-sm text-slate-950">
                        ₹{bill.grossInvoiceAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="text-rose-700">
                      <td colSpan={4} className="py-1.5 px-3 font-semibold text-right">
                        Less: TDS Withholding u/s {bill.tdsDetails.sectionCode} @ {bill.tdsDetails.ratePct}%:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        -₹{bill.tdsDetails.tdsAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-950 font-bold border-t border-emerald-200">
                      <td colSpan={4} className="py-2 px-3 text-right uppercase text-emerald-900 text-xs">
                        Net Amount Payable to Vendor:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-base font-black text-emerald-700">
                        ₹{bill.netPayable.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Vendor Invoice Match & Variance Section */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-sky-700" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Vendor Tax Invoice Verification & Variance Check
                    </span>
                  </div>
                  {bill.vendorInvoice ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Invoice Uploaded ({bill.vendorInvoice.invoiceNo})
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Awaiting Tax Invoice Upload
                    </span>
                  )}
                </div>

                {bill.vendorInvoice ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900">Invoice: {bill.vendorInvoice.invoiceNo}</div>
                      <div className="text-slate-600">Dated: {bill.vendorInvoice.invoiceDate}</div>
                      <div className="text-slate-600">
                        Base Amount: <strong className="font-mono">₹{bill.vendorInvoice.invoiceAmount.toLocaleString()}</strong> + Tax: <strong className="font-mono">₹{bill.vendorInvoice.taxAmount.toLocaleString()}</strong>
                      </div>
                      <div className="text-slate-900 font-bold">
                        Vendor Gross: <span className="font-mono text-sm">₹{bill.vendorInvoice.grossAmount.toLocaleString()}</span>
                      </div>
                      {bill.vendorInvoice.irnNumber && (
                        <div className="text-[10px] text-slate-400 font-mono truncate" title={bill.vendorInvoice.irnNumber}>
                          IRN: {bill.vendorInvoice.irnNumber}
                        </div>
                      )}
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                      bill.vendorInvoice.varianceAmount === 0
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/60 border-amber-300'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">System vs Invoice Variance</span>
                          {bill.vendorInvoice.varianceAmount === 0 ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              ✓ 0 Variance (Exact Match)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                              ⚠ Variance Detected: ₹{bill.vendorInvoice.varianceAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          System Gross: ₹{bill.grossInvoiceAmount.toLocaleString()} vs Vendor Gross: ₹{bill.vendorInvoice.grossAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Bank Details: <strong className="text-emerald-700">✓ Confirmed & Verified on Record</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-slate-600">The draft bill is approved for invoice generation. Vendor needs to upload tax invoice.</p>
                    {onOpenInvoiceUpload && (
                      <button
                        type="button"
                        onClick={() => onOpenInvoiceUpload(bill)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Upload Vendor Invoice Now</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Maker & Checker Workflow Sign-off Container */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Maker-Checker Verification & Financial Authorization
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Two-Tier Bank Internal Controls
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Tier 1: Maker Verification */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">1. Maker Verification (CPA)</span>
                      {bill.makerVerification ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    {bill.makerVerification ? (
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div>Verified by: <strong className="text-slate-900">{bill.makerVerification.verifiedBy}</strong></div>
                        <div>Timestamp: <span className="font-mono text-slate-500">{bill.makerVerification.verifiedAt}</span></div>
                        <div className="italic text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100">
                          "{bill.makerVerification.remarks}"
                        </div>
                      </div>
                    ) : isMaker ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={makerRemarks}
                          onChange={(e) => setMakerRemarks(e.target.value)}
                          placeholder="Verification remarks (e.g. Rate card verified, towers reconciled with MahaRERA)..."
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={handleMakerVerify}
                          className="w-full py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Verify & Submit to Checker
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">Maker sign-off required from CPA desk.</p>
                    )}
                  </div>

                  {/* Tier 2: Checker Approval */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">2. Checker Approval (COM / Credit Ops)</span>
                      {bill.checkerApproval ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    {bill.checkerApproval ? (
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div>Approved by: <strong className="text-slate-900">{bill.checkerApproval.approvedBy}</strong></div>
                        <div>Timestamp: <span className="font-mono text-slate-500">{bill.checkerApproval.approvedAt}</span></div>
                        <div className="italic text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100">
                          "{bill.checkerApproval.remarks}"
                        </div>
                      </div>
                    ) : isChecker && bill.status === 'BILL_APPROVAL' ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={checkerRemarks}
                          onChange={(e) => setCheckerRemarks(e.target.value)}
                          placeholder="Credit Ops approval notes & authorization remarks..."
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={handleCheckerApprove}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Approve for Payment Disbursal
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        {bill.status === 'APPROVED_FOR_PAYMENT' || bill.status === 'SENT_TO_FINANCE' || bill.status === 'PAID'
                          ? 'Approved for ERP transmission.'
                          : 'Awaiting maker verification first.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ERP_PAYLOAD' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-xs text-white">SAP / Oracle ERP Outbound AP Payload</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">API Standard: REST v2.1 • Idempotent</span>
                </div>

                <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-sky-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
{JSON.stringify(
  {
    header: {
      billId: bill.id,
      vendorCode: bill.vendorId,
      vendorLegalName: bill.vendorName,
      pan: 'AAACK5512L',
      gstin: '27AAACK5512L1ZZ',
      costCenter: 'CC-APF-WEST-RETAIL',
      glAccountCode:
        bill.vendorType === 'EXTERNAL_VALUER' ? 'GL-542100-VALUATION-FEES' : 'GL-542200-LEGAL-FEES',
      currency: 'INR',
    },
    amounts: {
      subtotalFee: bill.subtotalProfessionalFee,
      approvedReimbursements: bill.approvedReimbursementAmount,
      grossInvoiceAmount: bill.grossInvoiceAmount,
      tdsWithholdingSection: bill.tdsDetails.sectionCode,
      tdsRatePct: bill.tdsDetails.ratePct,
      tdsDeducted: bill.tdsDetails.tdsAmount,
      netPayableVendor: bill.netPayable,
    },
    context: {
      apfCaseId: bill.caseId,
      builderId: bill.builderId,
      projectId: bill.projectId,
      assignmentId: bill.assignmentId,
      rateCardRef: bill.rateCardId,
    },
    invoiceAttachment: bill.vendorInvoice
      ? {
          invoiceNo: bill.vendorInvoice.invoiceNo,
          invoiceDate: bill.vendorInvoice.invoiceDate,
          irn: bill.vendorInvoice.irnNumber || 'N/A',
        }
      : null,
    controls: {
      verifiedBy: bill.makerVerification?.verifiedBy || 'Pending',
      approvedBy: bill.checkerApproval?.approvedBy || 'Pending',
      idempotencyHash: `IDEMP-${bill.id}-${bill.grossInvoiceAmount}`,
    },
  },
  null,
  2
)}
                </pre>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Status:{' '}
                    <strong className="text-white">
                      {bill.financePosting?.postingStatus || 'Awaiting Authorization'}
                    </strong>{' '}
                    {bill.financePosting && (
                      <span className="font-mono text-emerald-400">
                        (Doc: {bill.financePosting.erpDocNo} • Voucher: {bill.financePosting.voucherNo})
                      </span>
                    )}
                  </div>
                  {bill.status === 'APPROVED_FOR_PAYMENT' && (
                    <button
                      type="button"
                      onClick={handleSendToFinance}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post to SAP S/4HANA Accounts Payable</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYMENT_ADVICE' && (
            <div className="space-y-4">
              {bill.paymentDetail ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase">Electronic Payment Advice & Remittance Slip</h4>
                      <p className="text-[11px] text-slate-500">BHFL Core Treasury Direct Disbursement Settlement</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                      Disbursed & Reconciled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Payment Date</span>
                      <strong className="text-slate-900">{bill.paymentDetail.paymentDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Disbursed Amount</span>
                      <strong className="text-emerald-700 text-sm">₹{bill.paymentDetail.paidAmount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Payment Route</span>
                      <strong className="text-slate-900">{bill.paymentDetail.paymentMethod}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">UTR / Transaction Ref</span>
                      <strong className="text-sky-800 font-bold">{bill.paymentDetail.utrNumber}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="text-slate-600 font-sans">
                      Tax Deduction: <strong>TDS u/s {bill.tdsDetails.sectionCode} @ {bill.tdsDetails.ratePct}% (₹{bill.paymentDetail.withheldAmount.toLocaleString()})</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      TDS Certificate (Form 16A) will be dispatched to registered email at the end of the fiscal quarter.
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => alert(`Simulated download: Payment_Advice_${bill.id}.pdf with digital bank seal.`)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Remittance Advice PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Payment In Progress</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      {bill.status === 'SENT_TO_FINANCE'
                        ? 'Bill is posted to ERP AP queue. Awaiting treasury bank clearing.'
                        : 'Bill must be approved and sent to Finance before payment can be executed.'}
                    </p>
                  </div>
                  {bill.status === 'SENT_TO_FINANCE' && (
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Simulate Core Treasury RTGS Disbursal</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Immutable Billing Audit Trail (Cryptographic Action Hash)
              </div>
              <div className="space-y-2">
                {billingStore.getAuditEvents(bill.id).map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{evt.eventType.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[10px] text-slate-500">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-700">{evt.description}</p>
                    <div className="text-[10px] text-slate-400">
                      User: <strong className="text-slate-600">{evt.user}</strong> ({evt.role})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            Bill ID: <strong className="font-mono text-slate-800">{bill.id}</strong> • Event: {bill.billingEventId}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
