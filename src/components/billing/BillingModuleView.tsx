import React, { useState, useEffect } from 'react';
import {
  BillMaster,
  BillingEvent,
  RateCardMaster,
  VendorBillingProfile,
  BillingStatus,
  VendorType,
  ReimbursementClaim,
  DebitCreditNote,
  BillingAuditEvent,
} from '../../types/billingTypes';
import { UserAccount } from '../../types/apfTransaction';
import { billingStore } from '../../services/billingStore';
import { BillDetailModal } from './BillDetailModal';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { CreateDraftBillModal } from './CreateDraftBillModal';
import { ReimbursementClaimModal } from './ReimbursementClaimModal';
import { DebitCreditNoteModal } from './DebitCreditNoteModal';
import { BillQueryModal } from './BillQueryModal';
import { RateCardEditModal } from './RateCardEditModal';
import { VendorProfileModal } from './VendorProfileModal';
import {
  LayoutDashboard,
  Zap,
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Send,
  CreditCard,
  AlertTriangle,
  Layers,
  Building2,
  Receipt,
  FileCheck,
  BarChart3,
  History,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Download,
  Eye,
  RefreshCw,
  Scale,
  DollarSign,
  AlertCircle,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

export type BillingNavTab =
  | 'DASHBOARD'
  | 'ELIGIBLE'
  | 'DRAFT_BILLS'
  | 'VENDOR_INVOICES'
  | 'VERIFICATION'
  | 'APPROVAL'
  | 'SENT_TO_FINANCE'
  | 'PAYMENT_STATUS'
  | 'REJECTED'
  | 'RATE_CARDS'
  | 'VENDOR_PROFILES'
  | 'REIMBURSEMENTS'
  | 'DEBIT_CREDIT_NOTES'
  | 'REPORTS'
  | 'AUDIT'
  // Vendor-specific tabs
  | 'MY_ASSIGNMENTS'
  | 'MY_DRAFT_BILLS'
  | 'UPLOAD_INVOICE'
  | 'MY_SUBMITTED'
  | 'QUERIES';

interface BillingModuleViewProps {
  currentUser: UserAccount;
  initialTab?: BillingNavTab;
  onNavigateToCase?: (caseId: string) => void;
}

export const BillingModuleView: React.FC<BillingModuleViewProps> = ({
  currentUser,
  initialTab = 'DASHBOARD',
  onNavigateToCase,
}) => {
  // Store state
  const [bills, setBills] = useState<BillMaster[]>(() => billingStore.getBills());
  const [events, setEvents] = useState<BillingEvent[]>(() => billingStore.getBillingEvents());
  const [rateCards, setRateCards] = useState<RateCardMaster[]>(() => billingStore.getRateCards());
  const [vendorProfiles, setVendorProfiles] = useState<VendorBillingProfile[]>(() =>
    billingStore.getVendorProfiles()
  );
  const [auditEvents, setAuditEvents] = useState<BillingAuditEvent[]>(() =>
    billingStore.getAuditEvents()
  );

  // Subscribe to changes in billingStore
  useEffect(() => {
    const unsub = billingStore.subscribe(() => {
      setBills(billingStore.getBills());
      setEvents(billingStore.getBillingEvents());
      setRateCards(billingStore.getRateCards());
      setVendorProfiles(billingStore.getVendorProfiles());
      setAuditEvents(billingStore.getAuditEvents());
    });
    return unsub;
  }, []);

  // Is current user an external vendor?
  const isVendorRole =
    currentUser.role === 'EXTERNAL_VALUER' ||
    currentUser.role === 'LEGAL' ||
    (currentUser as any).role === 'EXTERNAL_ADVOCATE';

  // Allow toggling vendor preview mode for bank users to inspect vendor experience
  const [vendorPortalMode, setVendorPortalMode] = useState(isVendorRole);
  const [activeTab, setActiveTab] = useState<BillingNavTab>(
    isVendorRole ? 'MY_ASSIGNMENTS' : initialTab
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState<'ALL' | VendorType>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<BillMaster | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<BillMaster | null>(null);
  const [selectedEventForDraft, setSelectedEventForDraft] = useState<BillingEvent | null>(null);
  const [selectedBillForReimbursement, setSelectedBillForReimbursement] = useState<BillMaster | null>(null);
  const [selectedBillForNote, setSelectedBillForNote] = useState<BillMaster | null>(null);
  const [selectedBillForQuery, setSelectedBillForQuery] = useState<BillMaster | null>(null);
  const [selectedRateCardForEdit, setSelectedRateCardForEdit] = useState<RateCardMaster | null | 'NEW'>(null);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<VendorBillingProfile | null | 'NEW'>(null);

  // Success Notification
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Filter bills based on search & filters
  const filteredBills = bills.filter((b) => {
    // If in vendor portal mode, only show bills for that vendor type / name
    if (vendorPortalMode) {
      if (currentUser.role === 'EXTERNAL_VALUER' || currentUser.name.includes('Valuer') || currentUser.agencyOrDept.includes('Valuation')) {
        if (b.vendorType !== 'EXTERNAL_VALUER') return false;
      } else if (currentUser.role === 'LEGAL' || currentUser.name.includes('Shah') || currentUser.agencyOrDept.includes('Law')) {
        if (b.vendorType !== 'EXTERNAL_ADVOCATE') return false;
      }
    }

    if (vendorTypeFilter !== 'ALL' && b.vendorType !== vendorTypeFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.id.toLowerCase().includes(q) ||
        b.caseId.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        b.projectName.toLowerCase().includes(q) ||
        b.builderLegalName.toLowerCase().includes(q) ||
        b.vendorInvoice?.invoiceNo.toLowerCase().includes(q) ||
        b.paymentDetail?.utrNumber.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Eligible events (those that have no bill yet or in BILLING_ELIGIBLE)
  const eligibleEvents = events.filter((e) => {
    if (vendorPortalMode) {
      if (currentUser.role === 'EXTERNAL_VALUER') {
        if (e.vendorType !== 'EXTERNAL_VALUER') return false;
      } else if (currentUser.role === 'LEGAL') {
        if (e.vendorType !== 'EXTERNAL_ADVOCATE') return false;
      }
    }
    if (vendorTypeFilter !== 'ALL' && e.vendorType !== vendorTypeFilter) return false;
    return e.billingStatus === 'BILLING_ELIGIBLE';
  });

  // Calculate Metrics for Dashboard
  const countEligible = eligibleEvents.length;
  const countDraft = bills.filter((b) => b.status === 'DRAFT_BILL').length;
  const countInvoicePending = bills.filter((b) => b.status === 'VENDOR_INVOICE_PENDING').length;
  const countInvoiceSubmitted = bills.filter((b) => b.status === 'INVOICE_SUBMITTED').length;
  const countPendingVerification = bills.filter((b) => b.status === 'BILL_VERIFICATION' || b.status === 'INVOICE_SUBMITTED').length;
  const countPendingApproval = bills.filter((b) => b.status === 'BILL_APPROVAL').length;
  const countApprovedForPayment = bills.filter((b) => b.status === 'APPROVED_FOR_PAYMENT').length;
  const countSentToFinance = bills.filter((b) => b.status === 'SENT_TO_FINANCE').length;
  const countPaid = bills.filter((b) => b.status === 'PAID').length;
  const countReturned = bills.filter((b) => b.status === 'RETURNED_FOR_CORRECTION' || b.status === 'REJECTED').length;
  const countVariances = bills.filter(
    (b) => b.vendorInvoice && Math.abs(b.vendorInvoice.varianceAmount) > 0
  ).length;

  const totalDisbursed = bills
    .filter((b) => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.paymentDetail?.paidAmount || b.netPayable), 0);
  const totalPendingPayment = bills
    .filter((b) => b.status === 'APPROVED_FOR_PAYMENT' || b.status === 'SENT_TO_FINANCE')
    .reduce((sum, b) => sum + b.netPayable, 0);

  // Status Badge Helper
  const getStatusBadge = (status: BillingStatus) => {
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
    <div className="space-y-4 font-sans text-xs">
      {/* Alert Banner */}
      {alertMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-sky-950 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  {vendorPortalMode
                    ? 'Vendor Billing & Payment Portal'
                    : 'APF External Vendor Billing & Payment Module'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                  {vendorPortalMode ? 'External Vendor Desk' : 'Enterprise Treasury / Core APF'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Automated eligibility from APF workflow • Rate Card calculation • Maker-Checker sign-off • SAP/Oracle ERP integration • Payment advice tracking
              </p>
            </div>
          </div>

          {/* Quick Actions / Role Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                billingStore.syncEligibilityFromCases();
                showAlert('Synchronized billing eligibility with all completed APF cases!');
              }}
              title="Recheck completed APF valuation & legal assignments for billing eligibility"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-700" />
              <span>Sync Eligibility</span>
            </button>

            {/* Toggle Vendor Portal View */}
            <button
              type="button"
              onClick={() => {
                const next = !vendorPortalMode;
                setVendorPortalMode(next);
                setActiveTab(next ? 'MY_ASSIGNMENTS' : 'DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                vendorPortalMode
                  ? 'bg-amber-100 border border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{vendorPortalMode ? 'Switch to Bank View' : 'Vendor Portal View'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 pt-3 overflow-x-auto text-xs font-semibold text-slate-600 no-scrollbar">
          {!vendorPortalMode ? (
            // Full Bank Billing Menu
            <>
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Billing Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('ELIGIBLE')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'ELIGIBLE'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Eligible for Billing</span>
                {countEligible > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {countEligible}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('DRAFT_BILLS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'DRAFT_BILLS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Draft Bills</span>
                {countDraft > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                    {countDraft}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('VENDOR_INVOICES')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'VENDOR_INVOICES'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Vendor Invoices</span>
                {countInvoiceSubmitted > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500 text-white">
                    {countInvoiceSubmitted}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'VERIFICATION'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Verification (Maker)</span>
                {countPendingVerification > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {countPendingVerification}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('APPROVAL')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'APPROVAL'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Pending Approval (Checker)</span>
                {countPendingApproval > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                    {countPendingApproval}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('SENT_TO_FINANCE')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'SENT_TO_FINANCE'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Sent to Finance / ERP</span>
                {countSentToFinance > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-200 text-sky-950">
                    {countSentToFinance}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('PAYMENT_STATUS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'PAYMENT_STATUS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Status</span>
                {countPaid > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    {countPaid}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'REJECTED'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Rejected / Returned</span>
                {countReturned > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {countReturned}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('RATE_CARDS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'RATE_CARDS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Rate Card Master</span>
              </button>

              <button
                onClick={() => setActiveTab('VENDOR_PROFILES')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'VENDOR_PROFILES'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Vendor Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab('REIMBURSEMENTS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'REIMBURSEMENTS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Reimbursements</span>
              </button>

              <button
                onClick={() => setActiveTab('DEBIT_CREDIT_NOTES')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'DEBIT_CREDIT_NOTES'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Debit / Credit Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('REPORTS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'REPORTS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Billing Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'AUDIT'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </>
          ) : (
            // External Vendor Menu
            <>
              <button
                onClick={() => setActiveTab('MY_ASSIGNMENTS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'MY_ASSIGNMENTS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>My Billable Assignments</span>
                {eligibleEvents.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {eligibleEvents.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('MY_DRAFT_BILLS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'MY_DRAFT_BILLS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>My Draft Bills</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_SUBMITTED')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'MY_SUBMITTED'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>My Submitted Bills & Invoices</span>
              </button>

              <button
                onClick={() => setActiveTab('PAYMENT_STATUS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'PAYMENT_STATUS'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Status & Remittance</span>
              </button>

              <button
                onClick={() => setActiveTab('QUERIES')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'QUERIES'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Query / Communication</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div
              onClick={() => setActiveTab('ELIGIBLE')}
              className="bg-white p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Eligible</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{countEligible}</div>
              <div className="text-[10px] text-slate-500 truncate">Awaiting draft bill</div>
            </div>

            <div
              onClick={() => setActiveTab('DRAFT_BILLS')}
              className="bg-white p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Draft Bills</span>
                <FileText className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{countDraft}</div>
              <div className="text-[10px] text-slate-500 truncate">System calculated</div>
            </div>

            <div
              onClick={() => setActiveTab('VENDOR_INVOICES')}
              className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Inv. Pending</span>
                <Upload className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{countInvoicePending}</div>
              <div className="text-[10px] text-slate-500 truncate">Awaiting vendor</div>
            </div>

            <div
              onClick={() => setActiveTab('VERIFICATION')}
              className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-800">
                <span>Maker Queue</span>
                <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-950 font-mono">
                {countPendingVerification}
              </div>
              <div className="text-[10px] text-amber-800 truncate">Pending verification</div>
            </div>

            <div
              onClick={() => setActiveTab('APPROVAL')}
              className="bg-white p-3 rounded-xl border border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-purple-800">
                <span>Checker Queue</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-950 font-mono">
                {countPendingApproval}
              </div>
              <div className="text-[10px] text-purple-800 truncate">Dual threshold sign-off</div>
            </div>

            <div
              onClick={() => setActiveTab('SENT_TO_FINANCE')}
              className="bg-white p-3 rounded-xl border border-sky-200 bg-sky-50/30 hover:border-sky-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-sky-800">
                <span>ERP Posted</span>
                <Send className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-xl font-black text-sky-950 font-mono">{countSentToFinance}</div>
              <div className="text-[10px] text-sky-800 truncate">SAP S/4HANA sync</div>
            </div>

            <div
              onClick={() => setActiveTab('PAYMENT_STATUS')}
              className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800">
                <span>Paid / Disbursed</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-950 font-mono">{countPaid}</div>
              <div className="text-[10px] text-emerald-800 truncate">₹{(totalDisbursed / 100000).toFixed(2)} Lakhs</div>
            </div>
          </div>

          {/* Variance & Reimbursement Highlight Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/90 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Invoice Variances Under Review
                </div>
                <div className="text-lg font-black text-amber-950 font-mono mt-0.5">
                  {countVariances} Invoices
                </div>
                <div className="text-[11px] text-amber-800">
                  Tolerance checked against approved rate cards
                </div>
              </div>
              <AlertTriangle className="w-7 h-7 text-amber-500 opacity-80" />
            </div>

            <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200/90 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Pending Treasury Settlement
                </div>
                <div className="text-lg font-black text-sky-950 font-mono mt-0.5">
                  ₹{totalPendingPayment.toLocaleString()}
                </div>
                <div className="text-[11px] text-sky-800">
                  Approved & awaiting RTGS / NEFT batch
                </div>
              </div>
              <DollarSign className="w-7 h-7 text-sky-600 opacity-80" />
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/90 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Disbursed to Vendors (FY 26-27)
                </div>
                <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">
                  ₹{totalDisbursed.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-800">
                  Direct UTR reconciliation complete
                </div>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-600 opacity-80" />
            </div>
          </div>

          {/* Master Bills Table */}
          {renderBillsTable(filteredBills)}
        </div>
      )}

      {/* 2. ELIGIBLE FOR BILLING VIEW */}
      {(activeTab === 'ELIGIBLE' || activeTab === 'MY_ASSIGNMENTS') && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Billable APF Assignments & Completed Milestones
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Eligibility Trigger: External assignment + Technical / Legal report submitted + CPA/COM accepted report + No open rework block.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
              {eligibleEvents.length} Billable Service Event(s)
            </span>
          </div>

          {eligibleEvents.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 space-y-2">
              <Zap className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">No pending unbilled events found.</p>
              <p className="text-xs">
                All completed valuation and legal assignments have already been drafted or paid. Click "Sync Eligibility" to re-check case triggers.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Event Ref</th>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Builder & Project</th>
                    <th className="py-2.5 px-3">Vendor / Firm</th>
                    <th className="py-2.5 px-3">Service Scope</th>
                    <th className="py-2.5 px-3">Completed & Accepted</th>
                    <th className="py-2.5 px-3 text-right">Eligible Base (₹)</th>
                    <th className="py-2.5 px-3 text-center">Trigger Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eligibleEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-900">{evt.id}</td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => onNavigateToCase && onNavigateToCase(evt.caseId)}
                          className="font-mono text-sky-800 hover:underline font-bold"
                        >
                          {evt.caseId}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{evt.projectId}</div>
                        <div className="text-[10px] text-slate-500">Builder: {evt.builderId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{evt.vendorName}</div>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {evt.vendorType === 'EXTERNAL_VALUER' ? 'External Valuer' : 'External Counsel'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{evt.serviceType}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Report #{evt.reportId} ({evt.reportVersion})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>Completed: {evt.completionDate}</div>
                        <div className="text-emerald-700 font-semibold text-[10px]">
                          Accepted: {evt.acceptedDate}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{evt.eligibleAmountBeforeTax.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          ELIGIBLE FOR BILLING
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEventForDraft(evt)}
                          className="px-3 py-1 bg-sky-900 hover:bg-sky-800 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Generate Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. DRAFT BILLS VIEW */}
      {(activeTab === 'DRAFT_BILLS' || activeTab === 'MY_DRAFT_BILLS') && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Draft Bills & Rate Card Calculations</h3>
              <p className="text-slate-500 text-[11px]">
                Bills generated from Rate Cards awaiting vendor invoice or submission
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded-lg">
              {bills.filter((b) => b.status === 'DRAFT_BILL' || b.status === 'VENDOR_INVOICE_PENDING').length} Draft(s)
            </span>
          </div>

          {renderBillsTable(
            bills.filter(
              (b) => b.status === 'DRAFT_BILL' || b.status === 'VENDOR_INVOICE_PENDING'
            )
          )}
        </div>
      )}

      {/* 4. VENDOR INVOICES VIEW */}
      {(activeTab === 'VENDOR_INVOICES' || activeTab === 'MY_SUBMITTED') && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Vendor Tax Invoices & Variance Audit</h3>
              <p className="text-slate-500 text-[11px]">
                Uploaded GST Tax Invoices, IRN acknowledgements, and tolerance reconciliation
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-300 rounded-lg">
              {bills.filter((b) => b.vendorInvoice).length} Uploaded Invoice(s)
            </span>
          </div>

          {renderBillsTable(bills.filter((b) => b.vendorInvoice))}
        </div>
      )}

      {/* 5. PENDING VERIFICATION (MAKER) VIEW */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                Billing Maker Queue — Scrutiny & Verification
              </h3>
              <p className="text-amber-800 text-[11px]">
                CPA verifies report acceptance, cross-checks vendor invoice against rate card line items, validates reimbursement challans, and signs off.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg">
              {countPendingVerification} Action Required
            </span>
          </div>

          {renderBillsTable(
            bills.filter(
              (b) => b.status === 'INVOICE_SUBMITTED' || b.status === 'BILL_VERIFICATION'
            )
          )}
        </div>
      )}

      {/* 6. PENDING APPROVAL (CHECKER) VIEW */}
      {activeTab === 'APPROVAL' && (
        <div className="space-y-4">
          <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-purple-950 text-sm">
                Billing Checker Queue — Supervisory Financial Approval
              </h3>
              <p className="text-purple-800 text-[11px]">
                COM / Committee reviews Maker findings, financial threshold compliance, and authorizes SAP/Oracle ERP posting.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-lg">
              {countPendingApproval} Approvals Pending
            </span>
          </div>

          {renderBillsTable(bills.filter((b) => b.status === 'BILL_APPROVAL'))}
        </div>
      )}

      {/* 7. SENT TO FINANCE / ERP VIEW */}
      {activeTab === 'SENT_TO_FINANCE' && (
        <div className="space-y-4">
          <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sky-950 text-sm">
                Finance & ERP Integration Ledger (SAP S/4HANA & Oracle Financials)
              </h3>
              <p className="text-sky-800 text-[11px]">
                Dispatched AP payment payloads with GL cost centers, voucher numbers, and idempotency guarantees.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-sky-100 text-sky-900 border border-sky-300 rounded-lg">
              {countSentToFinance} Transmitted
            </span>
          </div>

          {renderBillsTable(bills.filter((b) => b.status === 'SENT_TO_FINANCE' || b.financePosting))}
        </div>
      )}

      {/* 8. PAYMENT STATUS VIEW */}
      {activeTab === 'PAYMENT_STATUS' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                Disbursement & Payment Settlement Status
              </h3>
              <p className="text-emerald-800 text-[11px]">
                Bank UTR references, payment advice vouchers, and TDS deposit reconciliation.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg">
                Total Paid: ₹{totalDisbursed.toLocaleString()}
              </span>
            </div>
          </div>

          {renderBillsTable(bills.filter((b) => b.status === 'PAID' || b.paymentDetail))}
        </div>
      )}

      {/* 9. REJECTED / RETURNED BILLS */}
      {activeTab === 'REJECTED' && (
        <div className="space-y-4">
          <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-rose-950 text-sm">Rejected & Returned Bills Exception Desk</h3>
              <p className="text-rose-800 text-[11px]">
                Bills returned to vendors for rate card correction, missing search receipts, or invalid IRN.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-lg">
              {countReturned} Exceptions
            </span>
          </div>

          {renderBillsTable(
            bills.filter(
              (b) => b.status === 'RETURNED_FOR_CORRECTION' || b.status === 'REJECTED'
            )
          )}
        </div>
      )}

      {/* 10. RATE CARD MASTER VIEW */}
      {activeTab === 'RATE_CARDS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Approved Rate Card Schedule Master
              </h3>
              <p className="text-slate-500 text-[11px]">
                Versioned fee schedules for External Valuers & Legal Advocates (Never overwritten; immutable history)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRateCardForEdit('NEW')}
              className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Rate Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rateCards.map((rc) => (
              <div
                key={rc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-900 text-xs">{rc.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {rc.version}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      {rc.approvalStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRateCardForEdit(rc)}
                    className="text-xs text-sky-700 hover:underline font-bold"
                  >
                    Edit Schedule
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{rc.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Discipline:{' '}
                    <strong>
                      {rc.vendorType === 'EXTERNAL_VALUER' ? 'Valuation Agency' : 'Legal Law Firm'}
                    </strong>{' '}
                    • {rc.region}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Base Fee</span>
                    <strong className="font-mono text-slate-900">₹{rc.baseFee.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Addl. Tower</span>
                    <strong className="font-mono text-slate-900">
                      ₹{rc.additionalTowerRate.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Addl. Visit</span>
                    <strong className="font-mono text-slate-900">
                      ₹{rc.additionalVisitRate.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>
                    Fee Basis: <strong className="text-slate-800">{rc.feeBasis}</strong> • Max Reimbursement Cap:{' '}
                    <strong className="font-mono">₹{rc.maxReimbursementCap.toLocaleString()}</strong>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Travel Policy: {rc.travelRules}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Effective: {rc.effectiveFrom} to {rc.effectiveTo} • GST: {rc.gstRatePct}% • TDS u/s 194J: {rc.tdsRatePct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. VENDOR PROFILES VIEW */}
      {activeTab === 'VENDOR_PROFILES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Empaneled Vendor Billing & Compliance Profiles
              </h3>
              <p className="text-slate-500 text-[11px]">
                Statutory PAN, GSTIN, verified bank accounts, MSME, and TDS withholding profiles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVendorForEdit('NEW')}
              className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {vendorProfiles.map((v) => (
              <div
                key={v.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-900 text-xs">{v.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        v.vendorComplianceStatus === 'COMPLIANT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {v.vendorComplianceStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedVendorForEdit(v)}
                    className="text-xs text-sky-700 hover:underline font-bold"
                  >
                    Edit Profile
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{v.legalName}</h4>
                  <div className="text-[11px] text-slate-500">
                    Trade: {v.tradeName} ({v.vendorType === 'EXTERNAL_VALUER' ? 'External Valuer' : 'Legal Advocate'})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">PAN (Verified)</span>
                    <strong>{v.pan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">GSTIN</span>
                    <strong>{v.gstin}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200 font-sans">
                    <span className="text-slate-400 text-[10px] block">Verified Bank Account</span>
                    <span className="font-mono font-bold text-slate-900">
                      {v.bankAccount.bankName} • A/C: {v.bankAccount.accountNo} ({v.bankAccount.ifsc})
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Empanelment: {v.empanelmentNo}</span>
                  <span>Approval Threshold: ₹{v.approvalThreshold.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. REIMBURSEMENTS VIEW */}
      {activeTab === 'REIMBURSEMENTS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Out-of-Pocket Reimbursement Claims Ledger
              </h3>
              <p className="text-slate-500 text-[11px]">
                Travel expenses, Sub-Registrar search challans, certified copy charges & pre-approvals
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3">Expense Date</th>
                  <th className="py-2.5 px-3">Business Purpose & Proof</th>
                  <th className="py-2.5 px-3 text-right">Claimed (₹)</th>
                  <th className="py-2.5 px-3 text-right">Approved (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.flatMap((b) =>
                  b.reimbursements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-900">{r.id}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {r.billId}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.expenseType}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.expenseDate}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{r.purpose}</div>
                        {r.receiptDocName && (
                          <div className="text-[10px] text-sky-700 font-mono flex items-center gap-1 mt-0.5">
                            <Receipt className="w-3 h-3" />
                            <span>{r.receiptDocName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{r.claimedAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{r.approvedAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {r.status}
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

      {/* 13. DEBIT / CREDIT NOTES VIEW */}
      {activeTab === 'DEBIT_CREDIT_NOTES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Vendor Debit & Credit Note Register
              </h3>
              <p className="text-slate-500 text-[11px]">
                Statutory GST post-invoice financial adjustments, delay penalties, and scope additions
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Note ID</th>
                  <th className="py-2.5 px-3">Note Ref</th>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Justification</th>
                  <th className="py-2.5 px-3 text-right">Adjustment (₹)</th>
                  <th className="py-2.5 px-3 text-right">ERP Doc</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.flatMap((b) =>
                  b.debitCreditNotes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-900">{n.id}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{n.noteNo}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800">{n.billId}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.noteType === 'CREDIT_NOTE'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {n.noteType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{n.noteDate}</td>
                      <td className="py-2.5 px-3 text-slate-800">{n.reason}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{n.netAdjustment.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {n.erpRefNo || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {n.approvalStatus}
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

      {/* 14. REPORTS & ANALYTICS VIEW */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Vendor Expenditure & Statutory Tax Analytics
            </h3>
            <p className="text-slate-500 text-[11px]">
              Spend breakdown by vendor panel, discipline, GST input credit, and Section 194J TDS deposits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Spend Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                Spend Breakdown by Vendor
              </h4>
              <div className="space-y-2">
                {vendorProfiles.map((vp) => {
                  const vendorBills = bills.filter((b) => b.vendorId === vp.id);
                  const totalGross = vendorBills.reduce((acc, curr) => acc + curr.grossInvoiceAmount, 0);
                  const totalPaid = vendorBills
                    .filter((b) => b.status === 'PAID')
                    .reduce((acc, curr) => acc + (curr.paymentDetail?.paidAmount || curr.netPayable), 0);

                  return (
                    <div
                      key={vp.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{vp.legalName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {vp.id} • {vendorBills.length} Bill(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-slate-900">
                          ₹{totalGross.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold font-mono">
                          Paid: ₹{totalPaid.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tax & Withholding Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                Statutory Tax & Withholding Summary
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block">
                    GST Input Tax Credit (ITC)
                  </span>
                  <div className="text-lg font-black font-mono text-sky-950 mt-1">
                    ₹
                    {bills
                      .reduce((acc, b) => acc + b.taxDetails.totalTax, 0)
                      .toLocaleString()}
                  </div>
                  <span className="text-[10px] text-sky-700 mt-1 block">
                    Eligible for GSTR-2B ITC setoff
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">
                    TDS Withheld u/s 194J (10%)
                  </span>
                  <div className="text-lg font-black font-mono text-rose-950 mt-1">
                    ₹
                    {bills
                      .reduce((acc, b) => acc + b.tdsDetails.tdsAmount, 0)
                      .toLocaleString()}
                  </div>
                  <span className="text-[10px] text-rose-700 mt-1 block">
                    Deposit via Challan ITNS 281
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. AUDIT TRAIL VIEW */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Immutable Vendor Billing & Payment Audit Trail
            </h3>
            <p className="text-slate-500 text-[11px]">
              Chronological cryptographic log of eligibility, draft generation, maker review, checker authorization, and SAP dispatch.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
            {auditEvents.map((evt) => (
              <div key={evt.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {evt.eventType}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{evt.description}</p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5 font-mono">
                    <span>Officer: {evt.user}</span>
                    <span>•</span>
                    <span>Role: {evt.role}</span>
                    <span>•</span>
                    <span>Bill Ref: {evt.billId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. VENDOR QUERIES TAB */}
      {activeTab === 'QUERIES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Vendor Billing Clarifications & Inquiries
              </h3>
              <p className="text-slate-500 text-[11px]">
                Direct bank-vendor communication threads regarding invoices, rate cards, and variance explanations.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            {bills
              .filter((b) => b.queries && b.queries.length > 0)
              .map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      Docket #{b.id} — {b.projectName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {b.queries.length} active query thread(s) • Last updated: {b.updatedAt}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBillForQuery(b)}
                    className="px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Open Messages ({b.queries.length})
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Bill Detail / Dossier Modal */}
      {selectedBillForDetail && (
        <BillDetailModal
          bill={selectedBillForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedBillForDetail(null)}
          onRefresh={() => setBills(billingStore.getBills())}
          onOpenInvoiceUpload={(b) => setSelectedBillForInvoice(b)}
          onOpenQueryModal={(b) => setSelectedBillForQuery(b)}
        />
      )}

      {/* Vendor Invoice Upload Modal */}
      {selectedBillForInvoice && (
        <InvoiceUploadModal
          bill={selectedBillForInvoice}
          onClose={() => setSelectedBillForInvoice(null)}
          isVendorUser={vendorPortalMode}
          currentUserName={currentUser.name}
          onSuccess={() => {
            setSelectedBillForInvoice(null);
            setBills(billingStore.getBills());
            showAlert('Vendor invoice uploaded and variance analysis recorded successfully!');
          }}
        />
      )}

      {/* Generate Draft Bill Modal */}
      {selectedEventForDraft && (
        <CreateDraftBillModal
          event={selectedEventForDraft}
          onClose={() => setSelectedEventForDraft(null)}
          currentUserName={currentUser.name}
          onSuccess={(billId) => {
            setSelectedEventForDraft(null);
            setBills(billingStore.getBills());
            setEvents(billingStore.getBillingEvents());
            showAlert(`Draft bill ${billId} generated successfully from approved rate card!`);
          }}
        />
      )}

      {/* Reimbursement Claim Modal */}
      {selectedBillForReimbursement && (
        <ReimbursementClaimModal
          bill={selectedBillForReimbursement}
          onClose={() => setSelectedBillForReimbursement(null)}
          onSuccess={() => {
            setSelectedBillForReimbursement(null);
            setBills(billingStore.getBills());
            showAlert('Reimbursement claim submitted successfully!');
          }}
        />
      )}

      {/* Debit / Credit Note Modal */}
      {selectedBillForNote && (
        <DebitCreditNoteModal
          bill={selectedBillForNote}
          onClose={() => setSelectedBillForNote(null)}
          currentUserName={currentUser.name}
          onSuccess={() => {
            setSelectedBillForNote(null);
            setBills(billingStore.getBills());
            showAlert('Debit / Credit Note issued successfully and adjusted against bill!');
          }}
        />
      )}

      {/* Query / Communication Modal */}
      {selectedBillForQuery && (
        <BillQueryModal
          bill={selectedBillForQuery}
          onClose={() => setSelectedBillForQuery(null)}
          currentUserName={currentUser.name}
          currentUserRole={currentUser.role}
          onSuccess={() => {
            setBills(billingStore.getBills());
          }}
        />
      )}

      {/* Rate Card Edit Modal */}
      {selectedRateCardForEdit && (
        <RateCardEditModal
          rateCard={selectedRateCardForEdit === 'NEW' ? null : selectedRateCardForEdit}
          onClose={() => setSelectedRateCardForEdit(null)}
          onSuccess={() => {
            setSelectedRateCardForEdit(null);
            setRateCards(billingStore.getRateCards());
            showAlert('Rate Card schedule saved successfully!');
          }}
        />
      )}

      {/* Vendor Profile Modal */}
      {selectedVendorForEdit && (
        <VendorProfileModal
          profile={selectedVendorForEdit === 'NEW' ? null : selectedVendorForEdit}
          onClose={() => setSelectedVendorForEdit(null)}
          onSuccess={() => {
            setSelectedVendorForEdit(null);
            setVendorProfiles(billingStore.getVendorProfiles());
            showAlert('Vendor billing profile saved successfully!');
          }}
        />
      )}
    </div>
  );

  // Helper table renderer
  function renderBillsTable(list: BillMaster[]) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Filters & Search Bar */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bill ID, Case, Vendor, Invoice #..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={vendorTypeFilter}
              onChange={(e) => setVendorTypeFilter(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Vendor Types</option>
              <option value="EXTERNAL_VALUER">External Valuer</option>
              <option value="EXTERNAL_ADVOCATE">External Legal Counsel</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="BILLING_ELIGIBLE">Billing Eligible</option>
              <option value="DRAFT_BILL">Draft Bill</option>
              <option value="VENDOR_INVOICE_PENDING">Invoice Pending</option>
              <option value="INVOICE_SUBMITTED">Invoice Submitted</option>
              <option value="BILL_VERIFICATION">Bill Verification</option>
              <option value="BILL_APPROVAL">Bill Approval</option>
              <option value="APPROVED_FOR_PAYMENT">Approved for Payment</option>
              <option value="SENT_TO_FINANCE">Sent to Finance</option>
              <option value="PAID">Paid</option>
              <option value="RETURNED_FOR_CORRECTION">Returned</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {list.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No bills found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Vendor & Discipline</th>
                  <th className="py-2.5 px-3">Project / Builder</th>
                  <th className="py-2.5 px-3">Invoice Details</th>
                  <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                  <th className="py-2.5 px-3 text-right">Net Payable (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-950">
                      <button
                        type="button"
                        onClick={() => setSelectedBillForDetail(bill)}
                        className="text-sky-900 hover:text-sky-700 hover:underline cursor-pointer"
                      >
                        {bill.id}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => onNavigateToCase && onNavigateToCase(bill.caseId)}
                        className="font-mono text-slate-700 hover:text-sky-800 font-semibold"
                      >
                        {bill.caseId}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]" title={bill.vendorName}>
                        {bill.vendorName}
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {bill.vendorType === 'EXTERNAL_VALUER' ? 'Valuation Agency' : 'Legal Law Firm'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[160px]">
                        {bill.projectName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                        {bill.builderLegalName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {bill.vendorInvoice ? (
                        <div>
                          <div className="font-mono font-semibold text-slate-900">
                            {bill.vendorInvoice.invoiceNo}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Dated: {bill.vendorInvoice.invoiceDate}
                          </div>
                          {bill.vendorInvoice.varianceAmount !== 0 && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                              Variance: ₹{bill.vendorInvoice.varianceAmount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBillForInvoice(bill)}
                          className="text-[10px] font-bold text-sky-800 hover:underline cursor-pointer"
                        >
                          + Upload Invoice
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{bill.grossInvoiceAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                      ₹{bill.netPayable.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                          bill.status
                        )}`}
                      >
                        {bill.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBillForDetail(bill)}
                          title="View Bill Dossier & Calculations"
                          className="p-1 rounded text-slate-500 hover:text-sky-900 hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!bill.vendorInvoice && (
                          <button
                            type="button"
                            onClick={() => setSelectedBillForInvoice(bill)}
                            title="Upload Vendor Invoice"
                            className="p-1 rounded text-sky-600 hover:text-sky-800 hover:bg-sky-50 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedBillForReimbursement(bill)}
                          title="Add Reimbursement Claim"
                          className="p-1 rounded text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedBillForNote(bill)}
                          title="Issue Debit / Credit Note"
                          className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-50 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedBillForQuery(bill)}
                          title="Raise / View Query"
                          className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
};
