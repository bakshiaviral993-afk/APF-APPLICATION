import React from 'react';
import { BillMaster, BillingEvent } from '../../../types/billingTypes';
import {
  Receipt,
  FileCheck2,
  Clock,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  Scale,
  ArrowRight,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
} from 'lucide-react';

interface BillingDashboardPageProps {
  bills: BillMaster[];
  events: BillingEvent[];
  onNavigateTab: (tab: any, filter?: string) => void;
  onOpenBillDetail: (bill: BillMaster) => void;
}

export const BillingDashboardPage: React.FC<BillingDashboardPageProps> = ({
  bills,
  events,
  onNavigateTab,
  onOpenBillDetail,
}) => {
  // Operational counts
  const eligibleEventsCount = events.filter((e) => e.billingStatus === 'BILLING_ELIGIBLE').length;
  const draftBillsCount = bills.filter((b) => b.status === 'DRAFT_BILL').length;
  const awaitingInvoiceCount = bills.filter((b) => b.status === 'VENDOR_INVOICE_PENDING').length;
  const invoiceSubmittedCount = bills.filter((b) => b.status === 'INVOICE_SUBMITTED').length;
  const makerQueueCount = bills.filter(
    (b) => b.status === 'BILL_VERIFICATION' || b.status === 'INVOICE_SUBMITTED'
  ).length;
  const checkerQueueCount = bills.filter((b) => b.status === 'BILL_APPROVAL').length;
  const erpPostedCount = bills.filter(
    (b) => b.status === 'SENT_TO_FINANCE' || b.status === 'ERP_POSTED'
  ).length;
  const paymentInProcessCount = bills.filter(
    (b) => b.status === 'PAYMENT_IN_PROCESS' || b.status === 'APPROVED_FOR_PAYMENT'
  ).length;
  const paidCount = bills.filter((b) => b.status === 'PAID').length;
  const returnedCount = bills.filter(
    (b) => b.status === 'RETURNED_FOR_CORRECTION' || b.status === 'INVOICE_RETURNED'
  ).length;
  const onHoldCount = bills.filter((b) => b.status === 'ON_HOLD' || b.holdDetail?.isHeld).length;
  const failedCount = bills.filter(
    (b) => b.status === 'ERP_FAILED' || b.status === 'PAYMENT_FAILED'
  ).length;

  // Financial values
  const eligibleValue = events
    .filter((e) => e.billingStatus === 'BILLING_ELIGIBLE')
    .reduce((sum, e) => sum + e.eligibleAmountBeforeTax, 0);

  const invoiceValue = bills
    .filter((b) => Boolean(b.vendorInvoice))
    .reduce((sum, b) => sum + (b.vendorInvoice?.grossAmount || 0), 0);

  const approvedValue = bills
    .filter(
      (b) =>
        b.status === 'APPROVED_FOR_PAYMENT' ||
        b.status === 'SENT_TO_FINANCE' ||
        b.status === 'ERP_POSTED' ||
        b.status === 'PAID'
    )
    .reduce((sum, b) => sum + b.netPayable, 0);

  const pendingSettlementValue = bills
    .filter((b) => b.status !== 'PAID' && b.status !== 'REJECTED' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.netPayable, 0);

  const paidThisMonthValue = bills
    .filter((b) => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.paymentDetail?.paidAmount || b.netPayable), 0);

  const paidThisFYValue = paidThisMonthValue * 4.6; // Annualized simulation

  const varianceCount = bills.filter(
    (b) => Boolean(b.vendorInvoice?.varianceAmount && Math.abs(b.vendorInvoice.varianceAmount) > 10)
  ).length;

  const reimbursementPendingCount = bills.filter((b) =>
    b.reimbursements?.some((r) => r.status === 'PENDING')
  ).length;

  // Technical vs Legal Split
  const techBills = bills.filter((b) => b.vendorType === 'EXTERNAL_VALUER');
  const legalBills = bills.filter((b) => b.vendorType === 'EXTERNAL_ADVOCATE');
  const techGross = techBills.reduce((s, b) => s + b.subtotalProfessionalFee, 0);
  const legalGross = legalBills.reduce((s, b) => s + b.subtotalProfessionalFee, 0);
  const totalGross = techGross + legalGross || 1;
  const techPercent = Math.round((techGross / totalGross) * 100);
  const legalPercent = 100 - techPercent;

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="flex items-center justify-between bg-sky-950 text-white px-4 py-2.5 rounded-xl shadow-xs border border-sky-800 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-slate-950 uppercase tracking-wider">
            SIMULATED POC BILLING DATA
          </span>
          <span className="text-slate-300">
            Unified billing engine for External Technical Valuers & Legal Advocates • Full audit trail active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-sky-300">GST Rule: 18% Standard • TDS: 10% u/s 194J</span>
        </div>
      </div>

      {/* Exception Notification Alert if variance or holds or ERP failures */}
      {(failedCount > 0 || onHoldCount > 0 || varianceCount > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950">Actionable Underwriting & Settlement Exceptions</div>
              <div className="text-amber-800">
                {failedCount > 0 && <span className="font-semibold text-rose-700 mr-3">● {failedCount} ERP/Payment Failed</span>}
                {onHoldCount > 0 && <span className="font-semibold text-amber-800 mr-3">● {onHoldCount} Administrative Holds</span>}
                {varianceCount > 0 && <span className="font-semibold text-indigo-800">● {varianceCount} Invoices with Fee Variance</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {failedCount > 0 && (
              <button
                onClick={() => onNavigateTab('FINANCE_ERP')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
              >
                Inspect ERP Failures →
              </button>
            )}
            <button
              onClick={() => onNavigateTab('QUEUE', 'ON_HOLD')}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Review Holds →
            </button>
          </div>
        </div>
      )}

      {/* Financial KPI Cards */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-sky-600" /> Financial Settlement Overview
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            onClick={() => onNavigateTab('QUEUE', 'ELIGIBLE')}
            className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-500 group-hover:text-sky-600 flex justify-between items-center">
              <span>Eligible Unbilled Value</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{eligibleValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{eligibleEventsCount} events pending draft creation</div>
          </div>

          <div
            onClick={() => onNavigateTab('VENDOR_INVOICES')}
            className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-500 group-hover:text-sky-600 flex justify-between items-center">
              <span>Vendor Claimed Gross</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{invoiceValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all uploaded tax invoices</div>
          </div>

          <div
            onClick={() => onNavigateTab('CHECKER_APPROVAL')}
            className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-500 group-hover:text-sky-600 flex justify-between items-center">
              <span>Approved Sanction Value</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-1">₹{approvedValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Checker authorized net payable</div>
          </div>

          <div
            onClick={() => onNavigateTab('PAYMENTS')}
            className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[11px] font-semibold text-slate-500 group-hover:text-sky-600 flex justify-between items-center">
              <span>Disbursed This Month</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="text-lg font-bold font-mono text-sky-700 mt-1">₹{paidThisMonthValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{paidCount} bills settled with bank UTR</div>
          </div>
        </div>
      </div>

      {/* Operational Lifecycle Pipeline (12 Stages) */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" /> Operational Bill Pipeline & Lifecycle Queues
          </span>
          <span className="text-[11px] font-normal text-slate-400">Click any card to drill into dedicated queue</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <div
            onClick={() => onNavigateTab('QUEUE', 'ELIGIBLE')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">1. Billing Eligible</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{eligibleEventsCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Report accepted</div>
          </div>

          <div
            onClick={() => onNavigateTab('QUEUE', 'DRAFT')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">2. Draft Bills</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{draftBillsCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Rate card applied</div>
          </div>

          <div
            onClick={() => onNavigateTab('QUEUE', 'AWAITING_INVOICE')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">3. Awaiting Invoice</div>
            <div className="text-xl font-bold font-mono text-amber-800 mt-1">{awaitingInvoiceCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">With external vendor</div>
          </div>

          <div
            onClick={() => onNavigateTab('VENDOR_INVOICES')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">4. Invoice Uploaded</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{invoiceSubmittedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tax invoice received</div>
          </div>

          <div
            onClick={() => onNavigateTab('MAKER_VERIFICATION')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">5. Maker Queue</div>
            <div className="text-xl font-bold font-mono text-blue-800 mt-1">{makerQueueCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Verification pending</div>
          </div>

          <div
            onClick={() => onNavigateTab('CHECKER_APPROVAL')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">6. Checker Queue</div>
            <div className="text-xl font-bold font-mono text-purple-800 mt-1">{checkerQueueCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sanction authorization</div>
          </div>

          <div
            onClick={() => onNavigateTab('FINANCE_ERP')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">7. ERP Posted</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{erpPostedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">SAP voucher booked</div>
          </div>

          <div
            onClick={() => onNavigateTab('PAYMENTS')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">8. In Payment</div>
            <div className="text-xl font-bold font-mono text-sky-800 mt-1">{paymentInProcessCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Treasury queue</div>
          </div>

          <div
            onClick={() => onNavigateTab('PAYMENTS')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">9. Fully Paid</div>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-1">{paidCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">UTR confirmed</div>
          </div>

          <div
            onClick={() => onNavigateTab('QUEUE', 'RETURNED')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">10. Returned</div>
            <div className="text-xl font-bold font-mono text-orange-800 mt-1">{returnedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Correction required</div>
          </div>

          <div
            onClick={() => onNavigateTab('QUEUE', 'ON_HOLD')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">11. On Hold</div>
            <div className="text-xl font-bold font-mono text-amber-800 mt-1">{onHoldCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Compliance/Doc query</div>
          </div>

          <div
            onClick={() => onNavigateTab('FINANCE_ERP')}
            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">12. ERP Failures</div>
            <div className="text-xl font-bold font-mono text-rose-800 mt-1">{failedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Retry required</div>
          </div>
        </div>
      </div>

      {/* Analytical Charts & Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Technical vs Legal Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>Technical vs Legal Spend Mix</span>
              <span className="text-[11px] font-normal text-slate-400">Total ₹{totalGross.toLocaleString()}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div style={{ width: `${techPercent}%` }} className="bg-sky-600 h-full" title={`Technical: ${techPercent}%`} />
                <div style={{ width: `${legalPercent}%` }} className="bg-indigo-600 h-full" title={`Legal: ${legalPercent}%`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                <div className="flex items-center gap-1.5 text-sky-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  Technical Valuers
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{techGross.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{techBills.length} bills ({techPercent}%)</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-indigo-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Legal Advocates
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{legalGross.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{legalBills.length} bills ({legalPercent}%)</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('REPORTS')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            View Cost Variance Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Turnaround Time & SLA Analytics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>SLA Performance & Turnaround</span>
              <span className="text-[11px] font-bold text-emerald-700">96.4% on track</span>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Vendor Invoice Upload TAT:</span>
                  <span className="font-semibold text-slate-800 font-mono">1.8 Days (Target ≤ 3d)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Maker Verification TAT:</span>
                  <span className="font-semibold text-slate-800 font-mono">0.9 Days (Target ≤ 1d)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Checker Sanction Approval TAT:</span>
                  <span className="font-semibold text-slate-800 font-mono">1.2 Days (Target ≤ 2d)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>End-to-End Payment Cycle:</span>
                  <span className="font-semibold text-slate-800 font-mono">4.2 Days (Target ≤ 7d)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('REPORTS')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            Inspect SLA Breach Analysis <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Vendors by Current Exposure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Top Empanelled Vendors</span>
              <span className="text-[11px] font-normal text-slate-400">By current active billing</span>
            </div>
            <div className="space-y-2.5">
              {bills.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenBillDetail(b)}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-sky-50/50 hover:border-sky-200 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-semibold text-slate-800 truncate text-xs">{b.vendorName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {b.id} • {b.serviceType}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold font-mono text-slate-900 text-xs">₹{b.netPayable.toLocaleString()}</div>
                    <span className="text-[9px] font-semibold text-sky-700 uppercase">{b.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('VENDORS')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            Manage Vendor Empanelment & KYC <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
