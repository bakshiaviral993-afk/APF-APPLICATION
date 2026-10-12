import React, { useState } from 'react';
import { BillMaster, BillingEvent, VendorBillingProfile } from '../../../types/billingTypes';
import { UserAccount } from '../../../types/apfTransaction';
import { billingStore } from '../../../services/billingStore';
import {
  Building2,
  FileText,
  Upload,
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  Plus,
  Eye,
  Send,
  HelpCircle,
} from 'lucide-react';

interface VendorPortalPageProps {
  currentUser: UserAccount;
  bills: BillMaster[];
  events: BillingEvent[];
  vendors: VendorBillingProfile[];
  onOpenUploadInvoiceModal: (bill: BillMaster) => void;
  onOpenAddClaimModal: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  onOpenBillDetail: (bill: BillMaster) => void;
}

export const VendorPortalPage: React.FC<VendorPortalPageProps> = ({
  currentUser,
  bills,
  events,
  vendors,
  onOpenUploadInvoiceModal,
  onOpenAddClaimModal,
  onOpenPrintModal,
  onOpenBillDetail,
}) => {
  // Determine default vendor from current user or fallback
  const defaultVendorId =
    currentUser.vendorId ||
    (currentUser.role === 'EXTERNAL_VALUER' ? 'VND-VAL-001' : 'VND-LEG-001');

  const [activeVendorId, setActiveVendorId] = useState<string>(defaultVendorId);
  const [vendorTab, setVendorTab] = useState<
    'OVERVIEW' | 'ELIGIBLE' | 'INVOICES' | 'REIMBURSEMENTS' | 'QUERIES' | 'PAYMENT_ADVICE'
  >('OVERVIEW');

  const activeVendor = vendors.find((v) => v.id === activeVendorId) || vendors[0];

  // Strictly filter data to ONLY this active vendor
  const vendorBills = bills.filter((b) => b.vendorId === activeVendorId);
  const vendorEvents = events.filter((e) => e.vendorId === activeVendorId);

  // Vendor KPIs
  const eligibleEvents = vendorEvents.filter((e) => e.billingStatus === 'BILLING_ELIGIBLE');
  const expectedFeeTotal = eligibleEvents.reduce((s, e) => s + e.eligibleAmountBeforeTax, 0);

  const awaitingInvoices = vendorBills.filter((b) => b.status === 'VENDOR_INVOICE_PENDING');
  const submittedInvoices = vendorBills.filter(
    (b) =>
      b.status === 'INVOICE_SUBMITTED' ||
      b.status === 'BILL_VERIFICATION' ||
      b.status === 'BILL_APPROVAL'
  );
  const approvedBills = vendorBills.filter(
    (b) =>
      b.status === 'APPROVED_FOR_PAYMENT' ||
      b.status === 'SENT_TO_FINANCE' ||
      b.status === 'ERP_POSTED'
  );
  const paidBills = vendorBills.filter((b) => b.status === 'PAID');
  const returnedBills = vendorBills.filter(
    (b) => b.status === 'RETURNED_FOR_CORRECTION' || b.status === 'INVOICE_RETURNED'
  );

  const openQueries = vendorBills.flatMap((b) => b.queries || []).filter((q) => q.status === 'OPEN');

  return (
    <div className="space-y-5">
      {/* Vendor Profile Switcher & Identification */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{activeVendor.legalName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {activeVendor.vendorType === 'EXTERNAL_VALUER' ? 'VALUER PANEL' : 'LEGAL COUNSEL'}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Empanelment Reg: <span className="font-mono text-white">{activeVendor.empanelmentNo}</span> • GSTIN:{' '}
              <span className="font-mono text-white">{activeVendor.gstin}</span>
            </div>
          </div>
        </div>

        {/* Demo Vendor Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400 px-2">Simulate Vendor:</span>
          <select
            value={activeVendorId}
            onChange={(e) => setActiveVendorId(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-medium border border-slate-600 focus:ring-1 focus:ring-sky-500"
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.legalName} ({v.vendorType === 'EXTERNAL_VALUER' ? 'Valuer' : 'Legal'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'Dashboard & Summary' },
          { id: 'ELIGIBLE', label: `Billing Eligible (${eligibleEvents.length})` },
          { id: 'INVOICES', label: `My Invoices (${vendorBills.length})` },
          { id: 'REIMBURSEMENTS', label: 'Reimbursement Claims' },
          { id: 'QUERIES', label: `Bank Inquiries (${openQueries.length})` },
          { id: 'PAYMENT_ADVICE', label: `Settlements & Payment Advice (${paidBills.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVendorTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              vendorTab === tab.id
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {vendorTab === 'OVERVIEW' && (
        <div className="space-y-5">
          {/* Vendor Financial KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Unbilled Expected Fee</div>
              <div className="text-xl font-bold font-mono text-sky-800 mt-1">
                ₹{expectedFeeTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{eligibleEvents.length} assignments ready for invoice</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">In Bank Verification</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {submittedInvoices.length} Invoices
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Under Maker / Checker review</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-purple-700 uppercase">Sanctioned for Payment</div>
              <div className="text-xl font-bold font-mono text-purple-800 mt-1">
                {approvedBills.length} Bills
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Scheduled for Core Banking transfer</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase">Disbursed into Account</div>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                ₹{paidBills.reduce((s, b) => s + b.netPayable, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{paidBills.length} settlements credited</div>
            </div>
          </div>

          {/* Actionable Tasks List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Action Items Requiring Vendor Attention
            </div>

            {awaitingInvoices.length > 0 ? (
              <div className="space-y-2">
                {awaitingInvoices.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-950">
                        Tax Invoice Required for Bill {b.id} ({b.projectName})
                      </div>
                      <div className="text-amber-800 mt-0.5">
                        Bank calculated expected fee: <span className="font-mono font-bold">₹{b.grossInvoiceAmount.toLocaleString()}</span>.
                        Upload your signed GST invoice and IRN e-invoice to initiate verification.
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenUploadInvoiceModal(b)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Tax Invoice
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                No pending invoice upload requests. All assignments are up to date.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ELIGIBLE TAB */}
      {vendorTab === 'ELIGIBLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Completed Assignments Qualified for Billing ({eligibleEvents.length})
            </div>
            <div className="text-xs text-slate-500">
              Expected fee calculated using rate card {activeVendor.rateCardId}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Event Ref</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Service Scope</th>
                  <th className="py-2.5 px-3">Accepted Date</th>
                  <th className="py-2.5 px-3 text-right">Bank Expected Fee</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {eligibleEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No unbilled assignments pending.
                    </td>
                  </tr>
                ) : (
                  eligibleEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{evt.id}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{evt.caseId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{evt.serviceType}</div>
                        <div className="text-[10px] text-slate-500">{evt.serviceSubType}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{evt.acceptedDate}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                        ₹{evt.eligibleAmountBeforeTax.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-slate-400 text-[11px] italic">
                          Awaiting Bank Draft Generation
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MY INVOICES TAB */}
      {vendorTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Your Invoice No.</th>
                  <th className="py-2.5 px-3 text-right">Gross Claimed</th>
                  <th className="py-2.5 px-3 text-right">TDS (10%)</th>
                  <th className="py-2.5 px-3 text-right">Net Payable</th>
                  <th className="py-2.5 px-3">Lifecycle Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendorBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No invoices uploaded yet.
                    </td>
                  </tr>
                ) : (
                  vendorBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800">{b.caseId}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {b.vendorInvoice?.invoiceNo ? (
                          <span className="font-semibold text-slate-800">{b.vendorInvoice.invoiceNo}</span>
                        ) : (
                          <span className="text-amber-700 italic">Not Uploaded</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 text-right">
                        ₹{b.grossInvoiceAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 text-right">
                        -₹{b.tdsDetails.tdsAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800 text-right">
                        ₹{b.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'VENDOR_INVOICE_PENDING' && (
                            <button
                              onClick={() => onOpenUploadInvoiceModal(b)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-[11px]"
                            >
                              Upload
                            </button>
                          )}
                          <button
                            onClick={() => onOpenPrintModal(b)}
                            className="p-1 text-slate-500 hover:text-sky-600 rounded"
                            title="Download Bank Advice Memo"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenBillDetail(b)}
                            className="p-1 text-slate-500 hover:text-sky-600 rounded"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENT ADVICE TAB */}
      {vendorTab === 'PAYMENT_ADVICE' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Disbursed Bank Settlements & Official Payment Advices
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Credited to A/C: {activeVendor.bankAccount.accountNo} ({activeVendor.bankAccount.bankName})
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {paidBills.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No disbursed payments recorded yet for this vendor profile.
              </div>
            ) : (
              paidBills.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-sm">
                      Bill {b.id} • {b.projectName}
                    </div>
                    <div className="text-slate-600 mt-1">
                      UTR Number: <span className="font-mono font-bold text-emerald-800">{b.paymentDetail?.utrNumber}</span> •
                      Disbursed Date: <span className="font-mono">{b.paymentDetail?.paymentDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Net Amount Credited: <span className="font-bold text-slate-900 font-mono">₹{b.netPayable.toLocaleString()}</span> (TDS Deducted: ₹{b.tdsDetails.tdsAmount.toLocaleString()})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPrintModal(b)}
                      className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Advice PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REIMBURSEMENTS TAB */}
      {vendorTab === 'REIMBURSEMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-3">
          <Receipt className="w-8 h-8 text-amber-600 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">Out-of-Pocket Reimbursement Uploads</div>
          <div className="max-w-md mx-auto">
            Upload certified search fee challans, official court registry fees, or approved conveyance receipts to
            include in your billing submissions.
          </div>
          {vendorBills.length > 0 && (
            <button
              onClick={() => onOpenAddClaimModal(vendorBills[0])}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Reimbursement Voucher
            </button>
          )}
        </div>
      )}

      {/* QUERIES TAB */}
      {vendorTab === 'QUERIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-2">
          <MessageSquare className="w-8 h-8 text-indigo-600 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">Bank Exception & Clarification Requests</div>
          <div className="max-w-md mx-auto">
            {openQueries.length > 0
              ? `You have ${openQueries.length} open clarification queries from the bank Maker desk.`
              : 'All your submitted invoices are in order without pending inquiries.'}
          </div>
        </div>
      )}
    </div>
  );
};
