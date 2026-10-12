import React, { useState } from 'react';
import { BillMaster, BillingEvent, VendorType } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  FileText,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Send,
  Eye,
  AlertTriangle,
  Printer,
  ShieldAlert,
  XCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface BillingQueuePageProps {
  bills: BillMaster[];
  events: BillingEvent[];
  initialSubTab?: 'ELIGIBLE' | 'DRAFT' | 'AWAITING_INVOICE' | 'RETURNED' | 'ON_HOLD' | 'CANCELLED';
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  onOpenRecomputeModal: (bill: BillMaster) => void;
  onOpenHoldModal: (bill: BillMaster) => void;
  onCreateDraftBillModal: (event: BillingEvent) => void;
  currentUser: string;
}

export const BillingQueuePage: React.FC<BillingQueuePageProps> = ({
  bills,
  events,
  initialSubTab = 'ELIGIBLE',
  onOpenBillDetail,
  onOpenPrintModal,
  onOpenRecomputeModal,
  onOpenHoldModal,
  onCreateDraftBillModal,
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'ELIGIBLE' | 'DRAFT' | 'AWAITING_INVOICE' | 'RETURNED' | 'ON_HOLD' | 'CANCELLED'
  >(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState<'ALL' | VendorType>('ALL');

  // Filtered collections
  const eligibleEvents = events.filter((e) => {
    if (e.billingStatus !== 'BILLING_ELIGIBLE') return false;
    if (vendorTypeFilter !== 'ALL' && e.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.caseId.toLowerCase().includes(q) ||
        e.vendorName.toLowerCase().includes(q) ||
        e.serviceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const draftBills = bills.filter((b) => {
    if (b.status !== 'DRAFT_BILL') return false;
    if (vendorTypeFilter !== 'ALL' && b.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.caseId.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const awaitingInvoiceBills = bills.filter((b) => {
    if (b.status !== 'VENDOR_INVOICE_PENDING') return false;
    if (vendorTypeFilter !== 'ALL' && b.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.caseId.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const returnedBills = bills.filter((b) => {
    if (b.status !== 'RETURNED_FOR_CORRECTION' && b.status !== 'INVOICE_RETURNED') return false;
    if (vendorTypeFilter !== 'ALL' && b.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.caseId.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const onHoldBills = bills.filter((b) => {
    if (b.status !== 'ON_HOLD' && !b.holdDetail?.isHeld) return false;
    if (vendorTypeFilter !== 'ALL' && b.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.caseId.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const cancelledEvents = events.filter((e) => {
    if (e.billingStatus !== 'CANCELLED') return false;
    if (vendorTypeFilter !== 'ALL' && e.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.caseId.toLowerCase().includes(q) ||
        e.vendorName.toLowerCase().includes(q) ||
        (e.nonBillableReason && e.nonBillableReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleQuickSubmitForInvoice = (billId: string) => {
    billingStore.submitBillForVendorInvoice(billId, currentUser);
  };

  const handleCancelBillingEvent = (eventId: string) => {
    const reason = prompt('Specify cancellation reason (e.g. duplicate assignment, report rejected, vendor decline):');
    if (reason) {
      billingStore.cancelBillingEvent(eventId, reason, 'NON_BILLABLE');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('ELIGIBLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'ELIGIBLE'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Eligible Events</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'ELIGIBLE' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {events.filter((e) => e.billingStatus === 'BILLING_ELIGIBLE').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'DRAFT'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Draft Bills</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'DRAFT' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bills.filter((b) => b.status === 'DRAFT_BILL').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('AWAITING_INVOICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'AWAITING_INVOICE'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Awaiting Vendor Invoice</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'AWAITING_INVOICE'
                  ? 'bg-sky-800 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bills.filter((b) => b.status === 'VENDOR_INVOICE_PENDING').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('RETURNED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'RETURNED'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Returned Bills</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'RETURNED' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bills.filter((b) => b.status === 'RETURNED_FOR_CORRECTION' || b.status === 'INVOICE_RETURNED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ON_HOLD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'ON_HOLD'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>On Hold</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'ON_HOLD' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bills.filter((b) => b.status === 'ON_HOLD' || b.holdDetail?.isHeld).length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'CANCELLED'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Cancelled / Non-Billable</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'CANCELLED' ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {events.filter((e) => e.billingStatus === 'CANCELLED').length}
            </span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by case, bill or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-52 sm:w-64"
            />
          </div>

          <select
            value={vendorTypeFilter}
            onChange={(e) => setVendorTypeFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Vendors</option>
            <option value="EXTERNAL_VALUER">Technical Valuers</option>
            <option value="EXTERNAL_ADVOCATE">Legal Advocates</option>
          </select>
        </div>
      </div>

      {/* Main Queue Tables */}
      {activeSubTab === 'ELIGIBLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Accepted Reports Qualified for System Bill Generation ({eligibleEvents.length})
            </div>
            <div className="text-[11px] text-slate-500">
              Automatic eligibility triggered upon CPA/COM sign-off of valuation / legal due diligence
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Event Ref</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Vendor / Empanelment</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Service Scope</th>
                  <th className="py-2.5 px-3">Accepted Date</th>
                  <th className="py-2.5 px-3">Rate Card</th>
                  <th className="py-2.5 px-3 text-right">Expected Fee</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {eligibleEvents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No billing-eligible events pending. All accepted reports have draft bills created.
                    </td>
                  </tr>
                ) : (
                  eligibleEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{evt.id}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">{evt.caseId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{evt.vendorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {evt.vendorId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            evt.vendorType === 'EXTERNAL_VALUER'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {evt.vendorType === 'EXTERNAL_VALUER' ? 'Technical' : 'Legal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{evt.serviceType}</div>
                        {evt.serviceSubType && (
                          <div className="text-[10px] text-slate-500">{evt.serviceSubType}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{evt.acceptedDate}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                        {evt.rateCardId} ({evt.rateCardVersion})
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                        ₹{evt.eligibleAmountBeforeTax.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          ELIGIBLE
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onCreateDraftBillModal(evt)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Create Draft Bill
                          </button>
                          <button
                            onClick={() => handleCancelBillingEvent(evt.id)}
                            title="Cancel / Non-billable"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* DRAFT BILLS SUB-TAB */}
      {activeSubTab === 'DRAFT' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Draft Bills with Frozen Tariff Schedules ({draftBills.length})
            </div>
            <div className="text-[11px] text-slate-500">
              Submit to vendor portal to invite vendor tax invoice and e-invoice upload
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Scope / Towers</th>
                  <th className="py-2.5 px-3 text-right">Professional Fee</th>
                  <th className="py-2.5 px-3 text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 text-right">TDS (10%)</th>
                  <th className="py-2.5 px-3 text-right">Net Payable</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {draftBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No draft bills in queue. Create drafts from the Eligible Events tab.
                    </td>
                  </tr>
                ) : (
                  draftBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800">{b.caseId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.vendorName}</div>
                        <div className="text-[10px] text-slate-500">{b.serviceType}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{b.projectName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {b.towerNames.length} Towers ({b.towerNames.join(', ')})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 text-right">
                        ₹{b.subtotalProfessionalFee.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-right">
                        +₹{b.taxDetails.totalTax.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 text-right">
                        -₹{b.tdsDetails.tdsAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800 text-right">
                        ₹{b.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenBillDetail(b)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 rounded hover:bg-slate-100 transition-colors"
                            title="Inspect Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenPrintModal(b)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 rounded hover:bg-slate-100 transition-colors"
                            title="Print Bank Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenRecomputeModal(b)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50 transition-colors"
                            title="Recompute Bill"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenHoldModal(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Put On Hold"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickSubmitForInvoice(b.id)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Send className="w-3 h-3" /> Dispatch to Vendor
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

      {/* AWAITING INVOICE SUB-TAB */}
      {activeSubTab === 'AWAITING_INVOICE' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Dispatched to Vendor Portal — Awaiting Tax Invoice ({awaitingInvoiceBills.length})
            </div>
            <div className="text-[11px] text-slate-500">
              Vendors can log in to upload signed GST invoice, IRN e-invoice & reimbursement receipts
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Bill Ref</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Vendor Name</th>
                  <th className="py-2.5 px-3">Expected Gross</th>
                  <th className="py-2.5 px-3">Expected Net</th>
                  <th className="py-2.5 px-3">Dispatched At</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {awaitingInvoiceBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No bills currently awaiting vendor invoices.
                    </td>
                  </tr>
                ) : (
                  awaitingInvoiceBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800">{b.caseId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.vendorName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Empanelment active</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        ₹{b.grossInvoiceAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800">
                        ₹{b.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {b.updatedAt ? b.updatedAt.split('T')[0] : '2026-09-22'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          AWAITING VENDOR INVOICE
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenBillDetail(b)}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] transition-colors"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => onOpenPrintModal(b)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
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

      {/* RETURNED & ON HOLD & CANCELLED VIEWS */}
      {(activeSubTab === 'RETURNED' || activeSubTab === 'ON_HOLD' || activeSubTab === 'CANCELLED') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {activeSubTab === 'RETURNED' && `Bills Returned for Correction (${returnedBills.length})`}
              {activeSubTab === 'ON_HOLD' && `Administrative & Compliance Holds (${onHoldBills.length})`}
              {activeSubTab === 'CANCELLED' && `Cancelled & Non-Billable Events (${cancelledEvents.length})`}
            </div>
          </div>

          <div className="p-6 text-center text-xs text-slate-500">
            {activeSubTab === 'RETURNED' && returnedBills.length === 0 && (
              <div className="py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-slate-700">No Returned Bills</div>
                <div className="text-slate-400 mt-0.5">All submitted invoices have cleared initial acceptance.</div>
              </div>
            )}

            {activeSubTab === 'ON_HOLD' && (
              <div className="divide-y divide-slate-200 text-left">
                {onHoldBills.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">No bills currently on hold.</div>
                ) : (
                  onHoldBills.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 font-mono">
                          {b.id} • {b.vendorName}
                        </div>
                        <div className="text-rose-700 font-medium mt-0.5">
                          Hold Reason: {b.holdDetail?.reason || 'Compliance clarification'} (Category:{' '}
                          {b.holdDetail?.category})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Held by {b.holdDetail?.heldBy} on {b.holdDetail?.heldAt}
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenHoldModal(b)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs"
                      >
                        Release Hold
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSubTab === 'CANCELLED' && (
              <div className="divide-y divide-slate-200 text-left">
                {cancelledEvents.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">No cancelled billing events recorded.</div>
                ) : (
                  cancelledEvents.map((e) => (
                    <div key={e.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 font-mono">
                          {e.id} • {e.caseId} • {e.vendorName}
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          Non-billable reason: <span className="font-medium text-rose-700">{e.nonBillableReason || 'Service Cancelled'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                        NON-BILLABLE
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
