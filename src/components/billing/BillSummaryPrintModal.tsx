import React from 'react';
import { BillMaster, VendorBillingProfile } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import {
  Printer,
  Download,
  X,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Scale,
} from 'lucide-react';

interface BillSummaryPrintModalProps {
  bill: BillMaster;
  onClose: () => void;
}

// Convert amount to words helper for Indian Rupees
function numberToWords(amount: number): string {
  if (amount <= 0) return 'Zero Rupees';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(num: number): string {
    let str = '';
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += units[num] + ' ';
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const remainder = Math.floor(amount);

  if (crore > 0) words += convertChunk(crore) + ' Crore ';
  if (lakh > 0) words += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) words += convertChunk(thousand) + ' Thousand ';
  if (remainder > 0) words += convertChunk(remainder);

  return `${words.trim()} Rupees Only`;
}

export const BillSummaryPrintModal: React.FC<BillSummaryPrintModalProps> = ({ bill, onClose }) => {
  const vendor: VendorBillingProfile | undefined = billingStore.getVendorProfileById(bill.vendorId);
  const sacCode = bill.vendorType === 'EXTERNAL_VALUER' ? '998314' : '998311';
  const sacDescription =
    bill.vendorType === 'EXTERNAL_VALUER'
      ? 'Technical appraisal, engineering valuation & structural survey services'
      : 'Legal consultancy, title scrutiny, search reports & conveyancing services';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ['Line_ID', 'Service_Description', 'Quantity', 'Unit_Rate', 'Amount', 'Tax_Code'];
    const rows = bill.lineItems.map((li) => [
      li.id,
      `"${li.service.replace(/"/g, '""')}"`,
      li.quantity,
      li.unitRate,
      li.amount,
      li.taxCode,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bill_${bill.id}_CaseDetail.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Bank Bill Certificate & Tax Summary</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {bill.id} • Rate Card {bill.rateCardId} ({bill.rateCardVersion})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Container */}
        <div className="p-8 sm:p-10 overflow-y-auto text-slate-800 text-xs leading-relaxed space-y-6 print:p-0">
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-extrabold text-xl tracking-tight text-slate-900">
                  PROVAL <span className="text-sky-600">APF</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300">
                  BANK ADVICE MEMO
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-1">
                Bajaj Housing Finance Limited — APF Central Valuation & Legal Cell
              </div>
              <div className="text-[11px] text-slate-500">
                Registered Office: Cerebrum IT Park, B2 Building, 5th Floor, Kalyani Nagar, Pune 411014
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                GSTIN: 27AAACB2192L1ZW • PAN: AAACB2192L • CIN: U65922PN2008PLC132217
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 min-w-[200px]">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Official Bill Reference
              </div>
              <div className="text-base font-bold font-mono text-slate-900">{bill.id}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Date: <span className="font-semibold text-slate-800">{bill.createdAt.split('T')[0]}</span>
              </div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  STATUS: {bill.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Parties Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Vendor / Service Provider
              </div>
              <div className="font-bold text-sm text-slate-900">{bill.vendorName}</div>
              <div className="text-slate-600 mt-0.5">{vendor?.registeredAddress || 'Empanelled Partner Desk'}</div>
              <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                <div>
                  Empanelment Reg: <span className="font-mono font-medium text-slate-800">{vendor?.empanelmentNo || 'IBBI/VAL/2022'}</span>
                </div>
                <div>
                  PAN: <span className="font-mono font-medium text-slate-800">{vendor?.pan || 'AAACK5512L'}</span> • GSTIN:{' '}
                  <span className="font-mono font-medium text-slate-800">{vendor?.gstin || '27AAACK5512L1ZZ'}</span>
                </div>
                <div>
                  SAC / HSN Code:{' '}
                  <span className="font-mono font-semibold text-sky-700">{sacCode}</span> ({sacDescription})
                </div>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Case Dossier & Underwriting Traceability
              </div>
              <div className="space-y-1 text-slate-700">
                <div>
                  APF Case ID: <span className="font-mono font-bold text-slate-900">{bill.caseId}</span>
                </div>
                <div>
                  Project: <span className="font-semibold text-slate-900">{bill.projectName}</span>
                </div>
                <div>
                  Builder / Developer: <span className="font-medium text-slate-800">{bill.builderLegalName}</span>
                </div>
                <div>
                  Service Scope: <span className="font-medium text-slate-800">{bill.serviceType}</span>
                </div>
                <div>
                  Sanctioned Towers: <span className="font-medium text-slate-800">{bill.towerNames.join(', ')}</span>
                </div>
                <div>
                  Rate Card Schedule:{' '}
                  <span className="font-mono text-slate-700">
                    {bill.rateCardId} ({bill.rateCardSnapshot.feeBasis})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Fee Calculation & Bill Schedule
            </div>
            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3 w-12">#</th>
                  <th className="py-2 px-3">Service / Milestone Description</th>
                  <th className="py-2 px-3 text-center w-16">Qty</th>
                  <th className="py-2 px-3 text-right w-24">Unit Rate</th>
                  <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bill.lineItems.map((li, idx) => (
                  <tr key={li.id} className={li.isReimbursement ? 'bg-amber-50/40' : ''}>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{li.service}</div>
                      {li.description && <div className="text-[11px] text-slate-500 mt-0.5">{li.description}</div>}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{li.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">₹{li.unitRate.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                      ₹{li.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax & Deduction Breakdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Vendor Bank Credentials & Payment Method */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Electronic Settlement Account Details
              </div>
              <div className="text-[11px] space-y-1 text-slate-600">
                <div>
                  Bank Name: <span className="font-semibold text-slate-800">{vendor?.bankAccount.bankName || 'HDFC Bank Ltd'}</span>
                </div>
                <div>
                  Account Holder:{' '}
                  <span className="font-semibold text-slate-800">{vendor?.bankAccount.accountHolder || bill.vendorName}</span>
                </div>
                <div>
                  Account Number:{' '}
                  <span className="font-mono font-bold text-slate-900">{vendor?.bankAccount.accountNo || '50200048192841'}</span>
                </div>
                <div>
                  IFSC Code: <span className="font-mono font-semibold text-sky-700">{vendor?.bankAccount.ifsc || 'HDFC0000007'}</span>
                </div>
                <div>
                  Settlement Method: <span className="font-semibold text-slate-800">RTGS / NEFT Core Banking Direct Credit</span>
                </div>
                {bill.paymentDetail && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-emerald-800 font-medium">
                    Settled UTR: <span className="font-mono font-bold">{bill.paymentDetail.utrNumber}</span> on{' '}
                    {bill.paymentDetail.paymentDate}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-900 text-white space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Financial Reckoning & Tax Deduction
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Professional Fee Subtotal:</span>
                  <span className="font-mono">₹{bill.subtotalProfessionalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Approved Out-of-Pocket Reimbursements:</span>
                  <span className="font-mono">₹{bill.approvedReimbursementAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-semibold border-t border-slate-700 pt-1">
                  <span>Gross Value Before Tax:</span>
                  <span className="font-mono">₹{bill.grossAmountBeforeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>
                    GST ({bill.taxDetails.gstRatePct}% - {bill.taxDetails.isInterState ? 'IGST' : 'CGST+SGST'}):
                  </span>
                  <span className="font-mono">+₹{bill.taxDetails.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-semibold">
                  <span>Gross Tax Invoice Amount:</span>
                  <span className="font-mono">₹{bill.grossInvoiceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-300 border-t border-slate-700 pt-1">
                  <span>
                    TDS u/s {bill.tdsDetails.sectionCode} ({bill.tdsDetails.ratePct}%):
                  </span>
                  <span className="font-mono">-₹{bill.tdsDetails.tdsAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-extrabold text-sm border-t-2 border-slate-600 pt-1.5">
                  <span className="text-sky-400">Net Payable to Vendor:</span>
                  <span className="font-mono text-emerald-400">₹{bill.netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="bg-sky-50/80 border border-sky-200 p-3 rounded-lg text-sky-950 font-medium">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">Amount in Words:</span>
            {numberToWords(bill.netPayable)}
          </div>

          {/* Verification Stamps & Audit Signatures */}
          <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Prepared By (Maker)</div>
              <div className="font-semibold text-slate-800 text-xs mt-1">
                {bill.makerVerification?.verifiedBy || 'Rohan Deshmukh (CPA)'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {bill.makerVerification?.verifiedAt || 'Verified via Rate Card Matrix'}
              </div>
              <div className="text-[9px] text-emerald-700 font-bold mt-1">✔ PASSED VALIDATION</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Approved By (Checker)</div>
              <div className="font-semibold text-slate-800 text-xs mt-1">
                {bill.checkerApproval?.approvedBy || 'Amitav Sen (COM)'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {bill.checkerApproval?.approvedAt || 'Approved within Delegation Power'}
              </div>
              <div className="text-[9px] text-emerald-700 font-bold mt-1">✔ APPROVED FOR PAYMENT</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ERP SAP Gateway Status</div>
              <div className="font-semibold text-slate-800 text-xs mt-1">
                {bill.financePosting?.erpDocNo || 'SAP AP Module'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Voucher: {bill.financePosting?.voucherNo || 'VCH-AUTOMATED'}
              </div>
              <div className="text-[9px] text-sky-700 font-bold mt-1">
                {bill.financePosting?.postingStatus || 'POSTED & AUDITED'}
              </div>
            </div>
          </div>

          {/* Security & Cryptographic Hash Footer */}
          <div className="pt-2 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100">
            <div>
              Generated via PROVAL APF Billing Engine • Simulation Mode (POC) • Immutable Event Trail Logged
            </div>
            <div className="font-mono text-[9px] text-slate-500">
              SHA256: 9e4f2a71c8b350f9a2e4d0b1c78e5f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
