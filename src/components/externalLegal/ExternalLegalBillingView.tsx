import React, { useState } from 'react';
import {
  BillingEvent,
  BillMaster,
  VendorBillingProfile,
  RateCardMaster,
} from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { UserAccount } from '../../types/apfTransaction';
import {
  DollarSign,
  Receipt,
  CreditCard,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileCheck2,
  Download,
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ExternalLegalBillingViewProps {
  currentUser: UserAccount;
  onNavigateToCase?: (caseId: string) => void;
}

export const ExternalLegalBillingView: React.FC<ExternalLegalBillingViewProps> = ({
  currentUser,
  onNavigateToCase,
}) => {
  const [activeTab, setActiveTab] = useState<'ELIGIBLE' | 'INVOICES' | 'PAYMENTS'>('ELIGIBLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<BillMaster | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadEventId, setUploadEventId] = useState<string | null>(null);

  // Upload Invoice Form State
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [baseFee, setBaseFee] = useState(35000);
  const [cgst, setCgst] = useState(3150);
  const [sgst, setSgst] = useState(3150);
  const [invoiceDocName, setInvoiceDocName] = useState('Tax_Invoice_DemoLegal_001.pdf');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Fetch only this vendor's data (VND-LEGAL-001 or VND-LEG-002)
  const vendorId = currentUser.vendorId || 'VND-LEGAL-001';
  const allEvents = billingStore.getBillingEvents().filter(
    (e) =>
      e.vendorType === 'EXTERNAL_ADVOCATE' &&
      (e.vendorId === vendorId || e.vendorId === 'VND-LEG-001' || e.vendorId === 'VND-LEG-002')
  );
  const allBills = billingStore.getBills().filter(
    (b) =>
      b.vendorType === 'EXTERNAL_ADVOCATE' &&
      (b.vendorId === vendorId || b.vendorId === 'VND-LEG-001' || b.vendorId === 'VND-LEG-002')
  );

  const eligibleEvents = allEvents.filter((e) => e.billingStatus === 'BILLING_ELIGIBLE');

  const handleOpenUpload = (eventId: string, expectedAmount: number = 35000) => {
    setUploadEventId(eventId);
    setBaseFee(expectedAmount);
    setCgst(Math.round(expectedAmount * 0.09));
    setSgst(Math.round(expectedAmount * 0.09));
    setInvoiceNo(`DLA-INV-2026-${Date.now().toString().slice(-4)}`);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadEventId) return;

    const event = allEvents.find((ev) => ev.id === uploadEventId);
    if (!event) return;

    // Generate or fetch bill
    const bill = billingStore.createDraftBill(uploadEventId, currentUser.name);

    // Submit invoice
    billingStore.uploadVendorInvoice(bill.id, {
      invoiceNo,
      invoiceDate,
      invoiceAmount: baseFee,
      taxAmount: cgst + sgst,
      invoiceDocName,
      uploaderName: currentUser.name,
      varianceRemarks: 'Standard fee matching approved rate card RC-LEG-001.',
    });

    setUploadSuccess(`Invoice ${invoiceNo} uploaded successfully and dispatched to Bank Maker for verification.`);
    setIsUploadModalOpen(false);
    setActiveTab('INVOICES');
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const totalGrossAmount = baseFee + cgst + sgst;
  const netPayableExpected = totalGrossAmount - Math.round(baseFee * 0.1); // Less 10% TDS

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-4.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#172033]">
              Legal Advocate Billing & Fee Settlements
            </h1>
            <p className="text-xs text-[#667085] mt-0.5 flex items-center gap-2">
              <span>Vendor: {currentUser.firmName || 'Demo Legal Associates'}</span>
              <span>•</span>
              <span className="font-mono text-slate-700">Vendor ID: {vendorId}</span>
              <span>•</span>
              <span>Rate Card: RC-LEG-001 (Approved)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            TDS u/s 194J @ 10%
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-300 font-semibold">
            GST 18% (CGST 9% + SGST 9%)
          </span>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#DCE3EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'ELIGIBLE'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Billing Eligible ({eligibleEvents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'INVOICES'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-sky-400" />
              <span>My Submitted Invoices ({allBills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'PAYMENTS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payment & UTR Status ({allBills.filter((b) => b.paymentDetail?.utrNumber).length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search docket or invoice..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Tab 1: Billing Eligible Queue */}
        {activeTab === 'ELIGIBLE' && (
          <div className="overflow-x-auto">
            {eligibleEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                <p className="text-xs font-medium text-slate-600">
                  All accepted legal reviews have been billed or are in process.
                </p>
                <p className="text-[11px] text-slate-400">
                  New billing eligibility triggers automatically upon CPA acceptance of submitted reports.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#DCE3EB] text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Billing Event ID</th>
                    <th className="py-2.5 px-3">APF Docket</th>
                    <th className="py-2.5 px-3">Builder & Project</th>
                    <th className="py-2.5 px-3">Service Scope</th>
                    <th className="py-2.5 px-3">Report Version</th>
                    <th className="py-2.5 px-3">Rate Card Expected Fee</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {eligibleEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 block">{evt.id}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">CPA Report Accepted</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-sky-700 block">{evt.caseId}</span>
                        <span className="text-[10px] text-slate-500">{evt.reportId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                          {evt.builderId === 'BLD-PUN-001' ? 'Kolte-Patil Developers Ltd.' : 'Project Developer'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                          {evt.caseId === 'APF-2026-0001' ? 'Life Republic i Towers' : 'Abhilasha Phase 2'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block">{evt.serviceType}</span>
                        <span className="text-[10px] text-slate-400 block">{evt.serviceSubType}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-semibold text-slate-800">
                          {evt.reportVersion}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Accepted: {evt.acceptedDate}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 text-sm block">
                          ₹{evt.eligibleAmountBeforeTax?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">+ 18% GST (RC-LEG-001)</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenUpload(evt.id, evt.eligibleAmountBeforeTax)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Submitted Invoices */}
        {activeTab === 'INVOICES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#DCE3EB] text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">APF Docket</th>
                  <th className="py-2.5 px-3">Base Fee</th>
                  <th className="py-2.5 px-3">GST (18%)</th>
                  <th className="py-2.5 px-3">TDS (10%)</th>
                  <th className="py-2.5 px-3">Net Payable</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EB]">
                {allBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{bill.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{bill.billingEventId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">
                        {bill.vendorInvoice?.invoiceNo || 'Pending Submission'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Date: {bill.vendorInvoice?.invoiceDate || bill.createdAt.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-sky-700 block">{bill.caseId}</span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                        {bill.projectName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      ₹{bill.subtotalProfessionalFee?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      ₹{bill.taxDetails?.totalTax?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-medium text-rose-700">
                      -₹{bill.tdsDetails?.tdsAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 text-sm">
                      ₹{bill.netPayable?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bill.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.status === 'SENT_TO_FINANCE'
                            ? 'bg-sky-100 text-sky-800'
                            : bill.status === 'APPROVED_FOR_PAYMENT'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedBillForDetail(bill)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Payment Status & UTR */}
        {activeTab === 'PAYMENTS' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBills
                .filter((b) => b.paymentDetail || b.status === 'PAID' || b.status === 'SENT_TO_FINANCE')
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                        <span className="text-[10px] text-slate-500 block">Case: {b.caseId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                        {b.paymentDetail?.status || 'SETTLED VIA RTGS'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          UTR Reference
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {b.paymentDetail?.utrNumber || 'HDFCR9202609240019284'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          Payment Date
                        </span>
                        <span className="font-medium text-slate-700">
                          {b.paymentDetail?.paymentDate || '2026-09-24'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          Net Amount Disbursed
                        </span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{(b.paymentDetail?.paidAmount || b.netPayable)?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          TDS Withheld (194J)
                        </span>
                        <span className="font-medium text-slate-600">
                          ₹{(b.paymentDetail?.withheldAmount || b.tdsDetails?.tdsAmount)?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Method: {b.paymentDetail?.paymentMethod || 'RTGS / CMS'}
                      </span>
                      <button
                        onClick={() =>
                          alert(`Payment Advice Document: ${b.paymentDetail?.paymentAdviceDocName || 'Payment_Advice.pdf'} downloaded.`)
                        }
                        className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-sky-600" />
                        <span>Download Advice</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Tax Invoice Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in-50 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Upload Legal Tax Invoice</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-3.5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Event ID:</span>
                  <span className="font-mono font-bold text-slate-800">{uploadEventId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Law Firm:</span>
                  <span className="font-medium text-slate-800">{currentUser.firmName || 'Demo Legal Associates'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN:</span>
                  <span className="font-mono text-slate-800">27AAEFD7712P1ZR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Invoice Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    Base Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={baseFee}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBaseFee(v);
                      setCgst(Math.round(v * 0.09));
                      setSgst(Math.round(v * 0.09));
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    CGST @ 9%
                  </label>
                  <input
                    type="number"
                    value={cgst}
                    readOnly
                    className="w-full p-2 border border-slate-200 bg-slate-50 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    SGST @ 9%
                  </label>
                  <input
                    type="number"
                    value={sgst}
                    readOnly
                    className="w-full p-2 border border-slate-200 bg-slate-50 rounded text-xs"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase block">
                    Gross Invoice Total
                  </span>
                  <span className="font-bold text-slate-900 text-sm">₹{totalGrossAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase block">
                    Estimated Net Payable
                  </span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₹{netPayableExpected.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Tax Invoice Document (PDF)
                </label>
                <input
                  type="text"
                  value={invoiceDocName}
                  onChange={(e) => setInvoiceDocName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Tax Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
