import React, { useState, useEffect } from 'react';
import {
  BillMaster,
  BillingEvent,
  RateCardMaster,
  VendorBillingProfile,
  BillingAuditEvent,
} from '../../types/billingTypes';
import { UserAccount } from '../../types/apfTransaction';
import { billingStore } from '../../services/billingStore';

// 14 Dedicated Page Components
import { BillingDashboardPage } from './pages/BillingDashboardPage';
import { BillingQueuePage } from './pages/BillingQueuePage';
import { VendorInvoicesPage } from './pages/VendorInvoicesPage';
import { MakerVerificationPage } from './pages/MakerVerificationPage';
import { CheckerApprovalPage } from './pages/CheckerApprovalPage';
import { FinanceErpPage } from './pages/FinanceErpPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { RateCardsPage } from './pages/RateCardsPage';
import { ReimbursementsPage } from './pages/ReimbursementsPage';
import { BillingQueriesPage } from './pages/BillingQueriesPage';
import { CreditDebitNotesPage } from './pages/CreditDebitNotesPage';
import { VendorsGovernancePage } from './pages/VendorsGovernancePage';
import { BillingReportsPage } from './pages/BillingReportsPage';
import { BillingAuditPage } from './pages/BillingAuditPage';
import { VendorPortalPage } from './pages/VendorPortalPage';

// Modals
import { BillDetailModal } from './BillDetailModal';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { CreateDraftBillModal } from './CreateDraftBillModal';
import { ReimbursementClaimModal } from './ReimbursementClaimModal';
import { DebitCreditNoteModal } from './DebitCreditNoteModal';
import { BillQueryModal } from './BillQueryModal';
import { RateCardEditModal } from './RateCardEditModal';
import { VendorProfileModal } from './VendorProfileModal';
import { BillSummaryPrintModal } from './BillSummaryPrintModal';
import { RecomputationModal } from './RecomputationModal';
import { BillHoldModal } from './BillHoldModal';

import {
  LayoutDashboard,
  Layers,
  FileText,
  FileCheck2,
  ShieldCheck,
  Server,
  CreditCard,
  Settings,
  Receipt,
  MessageSquare,
  RotateCcw,
  Building2,
  BarChart3,
  History,
  UserCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

export type BillingNavTab =
  | 'DASHBOARD'
  | 'QUEUE'
  | 'VENDOR_INVOICES'
  | 'MAKER_VERIFICATION'
  | 'CHECKER_APPROVAL'
  | 'FINANCE_ERP'
  | 'PAYMENTS'
  | 'RATE_CARDS'
  | 'REIMBURSEMENTS'
  | 'QUERIES'
  | 'DEBIT_CREDIT_NOTES'
  | 'VENDORS'
  | 'REPORTS'
  | 'AUDIT'
  | 'VENDOR_PORTAL'
  // Legacy tab aliases for backwards compatibility
  | 'ELIGIBLE'
  | 'DRAFT_BILLS'
  | 'VERIFICATION'
  | 'APPROVAL'
  | 'SENT_TO_FINANCE'
  | 'PAYMENT_STATUS'
  | 'VENDOR_PROFILES'
  | 'MY_ASSIGNMENTS'
  | 'UPLOAD_INVOICE';

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
  // Store reactive states
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

  // Map initialTab to normalized activeTab
  const normalizeTab = (tab: BillingNavTab): BillingNavTab => {
    if (isVendorRole) return 'VENDOR_PORTAL';
    if (tab === 'ELIGIBLE' || tab === 'DRAFT_BILLS') return 'QUEUE';
    if (tab === 'VERIFICATION') return 'MAKER_VERIFICATION';
    if (tab === 'APPROVAL') return 'CHECKER_APPROVAL';
    if (tab === 'SENT_TO_FINANCE') return 'FINANCE_ERP';
    if (tab === 'PAYMENT_STATUS') return 'PAYMENTS';
    if (tab === 'VENDOR_PROFILES') return 'VENDORS';
    if (tab === 'MY_ASSIGNMENTS' || tab === 'UPLOAD_INVOICE') return 'VENDOR_PORTAL';
    return tab;
  };

  const [activeTab, setActiveTab] = useState<BillingNavTab>(() => normalizeTab(initialTab));
  const [queueSubTab, setQueueSubTab] = useState<
    'ELIGIBLE' | 'DRAFT' | 'AWAITING_INVOICE' | 'RETURNED' | 'ON_HOLD' | 'CANCELLED'
  >('ELIGIBLE');

  // Modals state
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<BillMaster | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<BillMaster | null>(null);
  const [selectedBillForRecompute, setSelectedBillForRecompute] = useState<BillMaster | null>(null);
  const [selectedBillForHold, setSelectedBillForHold] = useState<BillMaster | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<BillMaster | null>(null);
  const [selectedEventForDraft, setSelectedEventForDraft] = useState<BillingEvent | null>(null);
  const [selectedBillForClaim, setSelectedBillForClaim] = useState<BillMaster | null>(null);
  const [selectedBillForNote, setSelectedBillForNote] = useState<BillMaster | null>(null);
  const [selectedBillForQuery, setSelectedBillForQuery] = useState<BillMaster | null>(null);
  const [selectedRateCardForEdit, setSelectedRateCardForEdit] = useState<RateCardMaster | null>(null);
  const [selectedVendorForProfile, setSelectedVendorForProfile] = useState<VendorBillingProfile | null>(
    null
  );

  // Dynamic Badges
  const makerPendingCount = bills.filter(
    (b) => b.status === 'INVOICE_SUBMITTED' || b.status === 'BILL_VERIFICATION'
  ).length;
  const checkerPendingCount = bills.filter((b) => b.status === 'BILL_APPROVAL').length;
  const erpFailuresCount = bills.filter(
    (b) => b.status === 'ERP_FAILED' || b.financePosting?.postingStatus === 'FAILED'
  ).length;
  const openQueriesCount = bills.flatMap((b) => b.queries || []).filter((q) => q.status === 'OPEN').length;

  const handleNavigateTab = (tab: BillingNavTab, subFilter?: string) => {
    setActiveTab(tab);
    if (tab === 'QUEUE' && subFilter) {
      setQueueSubTab(subFilter as any);
    }
  };

  return (
    <div className="space-y-4">
      {/* 14 Pages Top Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DASHBOARD'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>1. Dashboard</span>
            </button>

            {/* 2. Billing Queue */}
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'QUEUE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Billing Queue</span>
            </button>

            {/* 3. Vendor Invoices */}
            <button
              onClick={() => setActiveTab('VENDOR_INVOICES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'VENDOR_INVOICES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Vendor Invoices</span>
            </button>

            {/* 4. Maker Verification */}
            <button
              onClick={() => setActiveTab('MAKER_VERIFICATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'MAKER_VERIFICATION'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>4. Maker</span>
              {makerPendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'MAKER_VERIFICATION'
                      ? 'bg-blue-900 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {makerPendingCount}
                </span>
              )}
            </button>

            {/* 5. Checker Approval */}
            <button
              onClick={() => setActiveTab('CHECKER_APPROVAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'CHECKER_APPROVAL'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>5. Checker</span>
              {checkerPendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'CHECKER_APPROVAL'
                      ? 'bg-purple-900 text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {checkerPendingCount}
                </span>
              )}
            </button>

            {/* 6. Finance & ERP */}
            <button
              onClick={() => setActiveTab('FINANCE_ERP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'FINANCE_ERP'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>6. Finance & ERP</span>
              {erpFailuresCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {erpFailuresCount}!
                </span>
              )}
            </button>

            {/* 7. Payments */}
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'PAYMENTS'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>7. Payments</span>
            </button>

            {/* 8. Rate Cards */}
            <button
              onClick={() => setActiveTab('RATE_CARDS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'RATE_CARDS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>8. Rate Cards</span>
            </button>

            {/* 9. Reimbursements */}
            <button
              onClick={() => setActiveTab('REIMBURSEMENTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'REIMBURSEMENTS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>9. Reimbursements</span>
            </button>

            {/* 10. Billing Queries */}
            <button
              onClick={() => setActiveTab('QUERIES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'QUERIES'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>10. Queries</span>
              {openQueriesCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'QUERIES' ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {openQueriesCount}
                </span>
              )}
            </button>

            {/* 11. Credit / Debit Notes */}
            <button
              onClick={() => setActiveTab('DEBIT_CREDIT_NOTES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DEBIT_CREDIT_NOTES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>11. Credit/Debit Notes</span>
            </button>

            {/* 12. Vendors */}
            <button
              onClick={() => setActiveTab('VENDORS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'VENDORS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>12. Vendors</span>
            </button>

            {/* 13. Reports */}
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'REPORTS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>13. Reports</span>
            </button>

            {/* 14. Audit */}
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'AUDIT'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>14. Audit</span>
            </button>
          </div>

          {/* Right Action: External Vendor Portal Preview */}
          <div className="shrink-0 pl-2 border-l border-slate-200">
            <button
              onClick={() => setActiveTab(activeTab === 'VENDOR_PORTAL' ? 'DASHBOARD' : 'VENDOR_PORTAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                activeTab === 'VENDOR_PORTAL'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{activeTab === 'VENDOR_PORTAL' ? 'Exit Vendor Portal' : 'Vendor Portal View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Body Routing */}
      <div className="pb-8">
        {activeTab === 'DASHBOARD' && (
          <BillingDashboardPage
            bills={bills}
            events={events}
            onNavigateTab={handleNavigateTab}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
          />
        )}

        {activeTab === 'QUEUE' && (
          <BillingQueuePage
            bills={bills}
            events={events}
            initialSubTab={queueSubTab}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
            onOpenRecomputeModal={(b) => setSelectedBillForRecompute(b)}
            onOpenHoldModal={(b) => setSelectedBillForHold(b)}
            onCreateDraftBillModal={(e) => setSelectedEventForDraft(e)}
          />
        )}

        {activeTab === 'VENDOR_INVOICES' && (
          <VendorInvoicesPage
            bills={bills}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenUploadInvoiceModal={(b) => setSelectedBillForInvoice(b)}
            onOpenRaiseQueryModal={(b) => setSelectedBillForQuery(b)}
          />
        )}

        {activeTab === 'MAKER_VERIFICATION' && (
          <MakerVerificationPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
            onOpenRaiseQueryModal={(b) => setSelectedBillForQuery(b)}
            onOpenHoldModal={(b) => setSelectedBillForHold(b)}
            onOpenRecomputeModal={(b) => setSelectedBillForRecompute(b)}
          />
        )}

        {activeTab === 'CHECKER_APPROVAL' && (
          <CheckerApprovalPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
            onOpenHoldModal={(b) => setSelectedBillForHold(b)}
          />
        )}

        {activeTab === 'FINANCE_ERP' && (
          <FinanceErpPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
          />
        )}

        {activeTab === 'PAYMENTS' && (
          <PaymentsPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
          />
        )}

        {activeTab === 'RATE_CARDS' && (
          <RateCardsPage
            rateCards={rateCards}
            onOpenEditRateCard={(card) => setSelectedRateCardForEdit(card)}
            onOpenCreateRateCard={() => {
              const newCard: RateCardMaster = {
                id: `RC-NEW-${Date.now()}`,
                vendorType: 'EXTERNAL_VALUER',
                vendorCategory: 'Empanelled IBBI Technical Panel',
                title: 'New Parametric Appraisal Schedule',
                bankCode: 'BHFL-APF',
                region: 'National',
                state: 'Maharashtra',
                serviceType: 'APF Initial Technical + Valuation',
                projectType: 'Residential',
                effectiveFrom: '2026-04-01',
                effectiveTo: '2027-03-31',
                feeBasis: 'Hybrid',
                baseFee: 30000,
                additionalTowerRate: 8000,
                additionalPhaseRate: 12000,
                additionalUnitRate: 150,
                additionalVisitRate: 5000,
                priorityFee: 4000,
                travelRules: 'Standard city limits included; ₹12/km beyond',
                reimbursementRules: 'Actuals on pre-approved searches up to ₹15,000',
                maxReimbursementCap: 15000,
                taxRuleCode: 'GST_18',
                gstRatePct: 18,
                tdsRatePct: 10,
                approvalStatus: 'DRAFT',
                version: 'v2026.2',
              };
              billingStore.updateRateCard(newCard);
              setSelectedRateCardForEdit(newCard);
            }}
          />
        )}

        {activeTab === 'REIMBURSEMENTS' && (
          <ReimbursementsPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenAddClaimModal={(b) => setSelectedBillForClaim(b)}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
          />
        )}

        {activeTab === 'QUERIES' && (
          <BillingQueriesPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
          />
        )}

        {activeTab === 'DEBIT_CREDIT_NOTES' && (
          <CreditDebitNotesPage
            bills={bills}
            currentUser={currentUser.name}
            onOpenIssueNoteModal={(b) => setSelectedBillForNote(b)}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
          />
        )}

        {activeTab === 'VENDORS' && (
          <VendorsGovernancePage
            vendors={vendorProfiles}
            currentUser={currentUser.name}
            onOpenVendorProfileModal={(v) => setSelectedVendorForProfile(v)}
          />
        )}

        {activeTab === 'REPORTS' && <BillingReportsPage bills={bills} events={events} />}

        {activeTab === 'AUDIT' && <BillingAuditPage auditEvents={auditEvents} />}

        {activeTab === 'VENDOR_PORTAL' && (
          <VendorPortalPage
            currentUser={currentUser}
            bills={bills}
            events={events}
            vendors={vendorProfiles}
            onOpenUploadInvoiceModal={(b) => setSelectedBillForInvoice(b)}
            onOpenAddClaimModal={(b) => setSelectedBillForClaim(b)}
            onOpenPrintModal={(b) => setSelectedBillForPrint(b)}
            onOpenBillDetail={(b) => setSelectedBillForDetail(b)}
          />
        )}
      </div>

      {/* Modals Mounting */}
      {selectedBillForDetail && (
        <BillDetailModal
          bill={selectedBillForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedBillForDetail(null)}
          onRefresh={() => setSelectedBillForDetail(billingStore.getBillById(selectedBillForDetail.id) || null)}
          onOpenInvoiceUpload={(b: BillMaster) => {
            setSelectedBillForDetail(null);
            setSelectedBillForInvoice(b);
          }}
          onOpenQueryModal={(b: BillMaster) => {
            setSelectedBillForDetail(null);
            setSelectedBillForQuery(b);
          }}
        />
      )}

      {selectedBillForPrint && (
        <BillSummaryPrintModal
          bill={selectedBillForPrint}
          onClose={() => setSelectedBillForPrint(null)}
        />
      )}

      {selectedBillForRecompute && (
        <RecomputationModal
          bill={selectedBillForRecompute}
          currentUser={currentUser.name}
          onClose={() => setSelectedBillForRecompute(null)}
          onSuccess={(updated: BillMaster) => setSelectedBillForDetail(updated)}
        />
      )}

      {selectedBillForHold && (
        <BillHoldModal
          bill={selectedBillForHold}
          currentUser={currentUser.name}
          onClose={() => setSelectedBillForHold(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedBillForInvoice && (
        <InvoiceUploadModal
          bill={selectedBillForInvoice}
          onClose={() => setSelectedBillForInvoice(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedEventForDraft && (
        <CreateDraftBillModal
          event={selectedEventForDraft}
          onClose={() => setSelectedEventForDraft(null)}
          onSuccess={(billId: string) => {
            setSelectedEventForDraft(null);
            const created = billingStore.getBillById(billId);
            if (created) setSelectedBillForDetail(created);
          }}
        />
      )}

      {selectedBillForClaim && (
        <ReimbursementClaimModal
          bill={selectedBillForClaim}
          onClose={() => setSelectedBillForClaim(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedBillForNote && (
        <DebitCreditNoteModal
          bill={selectedBillForNote}
          onClose={() => setSelectedBillForNote(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedBillForQuery && (
        <BillQueryModal
          bill={selectedBillForQuery}
          onClose={() => setSelectedBillForQuery(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedRateCardForEdit && (
        <RateCardEditModal
          rateCard={selectedRateCardForEdit}
          onClose={() => setSelectedRateCardForEdit(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedVendorForProfile && (
        <VendorProfileModal
          profile={selectedVendorForProfile}
          onClose={() => setSelectedVendorForProfile(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
