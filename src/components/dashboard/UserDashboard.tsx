import React, { useState, useEffect } from 'react';
import { apfStore } from '../../services/apfStore';
import { queryStore } from '../../services/queryStore';
import { APFCase, CaseStatus, UserAccount } from '../../types/apfTransaction';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_TOWER_MASTER,
} from '../../data/centralMasterData';
import {
  FolderPlus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  RotateCcw,
  ArrowUpRight,
  Shield,
  Layers,
  MessageSquare,
  Lock,
  Download,
  CheckSquare,
  FileText,
  Camera,
  X,
  Sparkles,
  Scale,
  Receipt,
  Users,
  DollarSign,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { ValuationReportDocPreview } from '../valuation/ValuationReportDocPreview';
import { getOrGenerateBankValuationReport } from '../../services/valuationCalculationEngine';
import { legalStore } from '../../services/legalStore';
import { masterStore } from '../../services/masterStore';
import { billingStore } from '../../services/billingStore';
import { LegalReportDocModal } from '../legal/LegalReportDocModal';

interface UserDashboardProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase: () => void;
  onNavigateToQueries?: (tab?: any) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
  onNavigateToQueries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewReportCase, setPreviewReportCase] = useState<APFCase | null>(null);
  const [previewLegalCaseId, setPreviewLegalCaseId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<
    | 'ALL'
    | 'MY_ACTIONS'
    | 'INITIATED'
    | 'VALUER_QUEUE'
    | 'VAL_SUBMITTED'
    | 'COM_REVIEW'
    | 'APPROVED'
    | 'SENT_TO_LOS'
    | 'REWORK'
    | 'NEED_INPUT'
  >('ALL');

  const [cases, setCases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [queryCounts, setQueryCounts] = useState(() =>
    queryStore.getDashboardCounts(currentUser.role, currentUser.id)
  );

  useEffect(() => {
    const unsubCases = apfStore.subscribe(() => {
      setCases(apfStore.getAllCases());
    });
    const unsubQueries = queryStore.subscribe(() => {
      setQueryCounts(queryStore.getDashboardCounts(currentUser.role, currentUser.id));
    });

    return () => {
      unsubCases();
      unsubQueries();
    };
  }, [currentUser]);

  // Role filtering rules:
  // External valuer can only see cases assigned to them or unassigned in their panel queue
  const visibleCases = cases.filter((c) => {
    if (currentUser.role === 'EXTERNAL_VALUER') {
      return (
        c.valuerAssignment?.assignedUserId === currentUser.id ||
        c.valuerAssignment?.vendorAgency.includes('Knight Frank') ||
        c.currentOwnerRole === 'EXTERNAL_VALUER'
      );
    }
    return true; // Bank staff (CPA, COM, Approver, Admin) can view all cases
  });

  // Calculate Metrics
  const totalVisible = visibleCases.length;
  const myPendingActions = visibleCases.filter((c) => c.currentOwnerRole === currentUser.role).length;
  const initiatedCount = visibleCases.filter((c) => c.currentStatus === 'INITIATED').length;
  const valuerQueueCount = visibleCases.filter(
    (c) =>
      c.currentStatus === 'ASSIGNED_TO_VALUER' ||
      c.currentStatus === 'VALUER_ACCEPTED' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS'
  ).length;
  const valSubmittedCount = visibleCases.filter((c) => c.currentStatus === 'VALUATION_SUBMITTED').length;
  const comReviewCount = visibleCases.filter((c) => c.currentStatus === 'COM_REVIEW' || c.currentStatus === 'PENDING_APPROVAL').length;
  const approvedCount = visibleCases.filter(
    (c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'CONDITIONAL_APPROVAL'
  ).length;
  const sentToLosCount = visibleCases.filter(
    (c) =>
      c.currentStatus === 'SENT_TO_LOS' ||
      c.currentStatus === 'LOS_ACKNOWLEDGED' ||
      c.currentStatus === 'APF_ACTIVE'
  ).length;
  const reworkCount = visibleCases.filter((c) => c.currentStatus === 'VALUATION_REWORK').length;

  // Role-specific Metrics across Modules
  const legalAssignments = legalStore.getAssignments();
  const legalQueries = legalStore.getQueries();
  const bills = billingStore.getBills();
  const billingEvents = billingStore.getBillingEvents();
  const pendingMasterApprovals = masterStore.getPendingApprovals();
  const legalPendingCount = legalAssignments.filter(
    (a) => a.status === 'LEGAL_ASSIGNED' || a.status === 'LEGAL_REVIEW_IN_PROGRESS'
  ).length;
  const exposureReviewCount = visibleCases.filter(
    (c) => c.currentStatus === 'COM_REVIEW' || c.currentStatus === 'VALUATION_SUBMITTED'
  ).length;

  // Filtered list based on search and tab
  const filteredCases = visibleCases.filter((c) => {
    // Check blocking query
    const hasBlocking = queryStore.hasBlockingQuery(c.id).isBlocked;

    // Tab filter
    if (filterTab === 'MY_ACTIONS' && c.currentOwnerRole !== currentUser.role) return false;
    if (filterTab === 'INITIATED' && c.currentStatus !== 'INITIATED') return false;
    if (
      filterTab === 'VALUER_QUEUE' &&
      c.currentStatus !== 'ASSIGNED_TO_VALUER' &&
      c.currentStatus !== 'VALUER_ACCEPTED' &&
      c.currentStatus !== 'SITE_VISIT_IN_PROGRESS'
    )
      return false;
    if (filterTab === 'VAL_SUBMITTED' && c.currentStatus !== 'VALUATION_SUBMITTED') return false;
    if (filterTab === 'COM_REVIEW' && c.currentStatus !== 'COM_REVIEW' && c.currentStatus !== 'PENDING_APPROVAL')
      return false;
    if (
      filterTab === 'APPROVED' &&
      c.currentStatus !== 'APPROVED' &&
      c.currentStatus !== 'CONDITIONAL_APPROVAL' &&
      c.currentStatus !== 'APF_ACTIVE'
    )
      return false;
    if (
      filterTab === 'SENT_TO_LOS' &&
      c.currentStatus !== 'SENT_TO_LOS' &&
      c.currentStatus !== 'LOS_ACKNOWLEDGED' &&
      c.currentStatus !== 'APF_ACTIVE'
    )
      return false;
    if (filterTab === 'REWORK' && c.currentStatus !== 'VALUATION_REWORK') return false;
    if (filterTab === 'NEED_INPUT' && !hasBlocking) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
    const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
    return (
      c.id.toLowerCase().includes(q) ||
      (c.apfNumber && c.apfNumber.toLowerCase().includes(q)) ||
      (builder?.legalName && builder.legalName.toLowerCase().includes(q)) ||
      (project?.projectName && project.projectName.toLowerCase().includes(q)) ||
      c.currentStatus.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'APF_ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>APF ACTIVE</span>
          </span>
        );
      case 'APPROVED':
      case 'CONDITIONAL_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
      case 'SENT_TO_LOS':
      case 'LOS_ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>LOS DISPATCHED</span>
          </span>
        );
      case 'VALUATION_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-900 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            <span>VALUATION SUBMITTED</span>
          </span>
        );
      case 'SITE_VISIT_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>SITE VISIT (GPS)</span>
          </span>
        );
      case 'ASSIGNED_TO_VALUER':
      case 'VALUER_ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>VALUER QUEUE</span>
          </span>
        );
      case 'COM_REVIEW':
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>CREDIT SANCTION</span>
          </span>
        );
      case 'VALUATION_REWORK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>REWORK REQUIRED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Case ID', 'APF Number', 'Builder', 'Project', 'Status', 'Owner', 'Due Date'];
    const rows = filteredCases.map((c) => {
      const b = CENTRAL_BUILDER_MASTER.find((x) => x.id === c.builderId);
      const p = CENTRAL_PROJECT_MASTER.find((x) => x.id === c.projectId);
      return [
        c.id,
        c.apfNumber,
        `"${(b?.legalName || c.builderId).replace(/"/g, '""')}"`,
        `"${(p?.projectName || c.projectId).replace(/"/g, '""')}"`,
        c.currentStatus,
        c.currentOwnerRole,
        c.slaDueDate,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `APF_Cases_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-8 font-sans">
      {/* Enterprise Executive Header Bar */}
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-white/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 tracking-tight leading-none font-sans">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80">
                {currentUser.roleLabel || currentUser.role}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UID: {currentUser.id}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-none">
              {currentUser.agencyOrDept} • Underwriting Desk & Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {currentUser.role === 'CPA' && (
            <button
              onClick={onInitiateNewCase}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>New APF Case</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo cases to initial baseline state?')) {
                apfStore.resetDemoData();
                queryStore.resetDemoQueries();
              }
            }}
            title="Reset to baseline demo transaction queue"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Compact Enterprise Role-Based KPI Metric Grid */}
      {currentUser.role === 'CPA' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* 1. Total Cases */}
          <div
            onClick={() => setFilterTab('ALL')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs relative overflow-hidden ${
              filterTab === 'ALL' ? 'border-[#1667C1] bg-sky-50/20 ring-1 ring-sky-500/20' : 'border-[#DCE3EB]'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Total Cases</div>
            <div className="text-xl font-bold text-[#172033] mt-1 font-mono">{totalVisible}</div>
            <div className="text-[10px] text-slate-400 font-medium">All APF Docket</div>
          </div>

          {/* 2. Pending Action */}
          <div
            onClick={() => setFilterTab('MY_ACTIONS')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs relative overflow-hidden ${
              filterTab === 'MY_ACTIONS' ? 'border-amber-600 bg-amber-50/20 ring-1 ring-amber-500/20' : 'border-[#DCE3EB]'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Pending Action</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{myPendingActions}</div>
            <div className="text-[10px] text-amber-700 font-medium">CPA Actionable</div>
          </div>

          {/* 3. Valuer Queue */}
          <div
            onClick={() => setFilterTab('VALUER_QUEUE')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs relative overflow-hidden ${
              filterTab === 'VALUER_QUEUE' ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500/20' : 'border-[#DCE3EB]'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Valuer Queue</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{valuerQueueCount}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Site & Desk Appraisal</div>
          </div>

          {/* 4. Legal Pending */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">Legal Pending</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">{legalPendingCount}</div>
            <div className="text-[10px] text-sky-600 font-medium">Title Scrutiny Docket</div>
          </div>

          {/* 5. Exposure Review */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Exposure Review</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{exposureReviewCount}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Exposure 360 Scan</div>
          </div>

          {/* 6. Live Queries */}
          <div
            onClick={() => onNavigateToQueries && onNavigateToQueries('ALL')}
            className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs cursor-pointer hover:border-slate-400"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">Live Queries</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{queryCounts.openQueries}</div>
            <div className="text-[10px] text-rose-600 font-medium">{queryCounts.needInput} Urgent Input</div>
          </div>

          {/* 7. Approved / Sent to LOS */}
          <div
            onClick={() => setFilterTab('APPROVED')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs relative overflow-hidden ${
              filterTab === 'APPROVED' ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/20' : 'border-[#DCE3EB]'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 truncate">Approved / LOS</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{approvedCount + sentToLosCount}</div>
            <div className="text-[10px] text-emerald-700 font-medium">Sanctioned Dockets</div>
          </div>
        </div>
      ) : currentUser.role === 'COM' || currentUser.role === 'ACOM' || currentUser.role === 'RCOM' || currentUser.role === 'ZCOM' || currentUser.role === 'NCOM' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Cases Pending Review */}
          <div
            onClick={() => setFilterTab('COM_REVIEW')}
            className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs cursor-pointer hover:border-[#1667C1]"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Cases Pending Review</div>
            <div className="text-xl font-bold text-[#172033] mt-1 font-mono">{comReviewCount}</div>
            <div className="text-[10px] text-sky-700 font-medium">Credit Ops Check</div>
          </div>

          {/* 2. Exposure Reconciliation */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Exposure Reconciliation</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{exposureReviewCount}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Group Cap Audit</div>
          </div>

          {/* 3. Credit Review */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Credit Review</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'COM_REVIEW').length}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Checker Clearance</div>
          </div>

          {/* 4. Pending Approval Pack */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Pending Approval Pack</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{pendingMasterApprovals.length}</div>
            <div className="text-[10px] text-amber-700 font-medium">Maker-Checker Pack</div>
          </div>

          {/* 5. Legal Exceptions */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">Legal Exceptions</div>
            <div className="text-xl font-bold text-rose-900 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_REWORK' || a.status === 'LEGAL_SUBMITTED').length}</div>
            <div className="text-[10px] text-rose-600 font-medium">Title Variance</div>
          </div>

          {/* 6. Queries */}
          <div
            onClick={() => onNavigateToQueries && onNavigateToQueries('ALL')}
            className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs cursor-pointer hover:border-slate-400"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">Live Queries</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{queryCounts.openQueries}</div>
            <div className="text-[10px] text-slate-500 font-medium">Operational Queries</div>
          </div>
        </div>
      ) : currentUser.role === 'INTERNAL_LEGAL' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. New Legal Assignments */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">New Assignments</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_ASSIGNED').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Awaiting Intake</div>
          </div>

          {/* 2. In Review */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">In Review</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_REVIEW_IN_PROGRESS' || a.status === 'LEGAL_ACCEPTED').length}</div>
            <div className="text-[10px] text-sky-600 font-medium">Title Chain Scrutiny</div>
          </div>

          {/* 3. Need Input */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Need Input</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{legalQueries.filter((q) => q.status === 'INPUT_REQUIRED').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Clarifications</div>
          </div>

          {/* 4. Rework */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">Rework</div>
            <div className="text-xl font-bold text-rose-900 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_REWORK').length}</div>
            <div className="text-[10px] text-rose-600 font-medium">Observations Sent</div>
          </div>

          {/* 5. Submitted */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Submitted</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_SUBMITTED').length}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Under Bank Review</div>
          </div>

          {/* 6. Approved */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Approved</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{legalAssignments.filter((a) => a.status === 'LEGAL_ACCEPTED_BY_BANK' || a.status === 'BILLING_ELIGIBLE').length}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Clear Marketable</div>
          </div>
        </div>
      ) : currentUser.role === 'INTERNAL_VALUER' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. New Assignments */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">New Assignments</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'ASSIGNED_TO_VALUER').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Technical Appraisal</div>
          </div>

          {/* 2. Site Visits Due */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Site Visits Due</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'SITE_VISIT_IN_PROGRESS').length}</div>
            <div className="text-[10px] text-indigo-600 font-medium">GPS Coordinates</div>
          </div>

          {/* 3. Draft Reports */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">Draft Reports</div>
            <div className="text-xl font-bold text-[#172033] mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'VALUER_ACCEPTED').length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Work in Progress</div>
          </div>

          {/* 4. Submitted */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Submitted</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{valSubmittedCount}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Reports Dispatched</div>
          </div>

          {/* 5. Need Input */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Need Input</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{queryCounts.needInput}</div>
            <div className="text-[10px] text-amber-600 font-medium">Clarifications</div>
          </div>

          {/* 6. Rework */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">Rework</div>
            <div className="text-xl font-bold text-rose-900 mt-1 font-mono">{reworkCount}</div>
            <div className="text-[10px] text-rose-600 font-medium">Re-evaluation Due</div>
          </div>
        </div>
      ) : currentUser.role === 'APPROVER' || currentUser.role === 'COMMITTEE' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Cases Awaiting Decision */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Awaiting Decision</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'PENDING_APPROVAL' || c.currentStatus === 'COM_REVIEW').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Sanction Cockpit</div>
          </div>

          {/* 2. High Risk */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">High Risk</div>
            <div className="text-xl font-bold text-rose-900 mt-1 font-mono">{cases.filter((c) => c.priority === 'High' || c.priority === 'Urgent').length}</div>
            <div className="text-[10px] text-rose-600 font-medium">Red Flag Deviations</div>
          </div>

          {/* 3. Legal Variance */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">Legal Variance</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">{legalStore.getAllReports().filter((r) => r.legalRoute === 'Dual Legal Review').length || 1}</div>
            <div className="text-[10px] text-sky-600 font-medium">Dual Scrutiny Compare</div>
          </div>

          {/* 4. Exposure Variance */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Exposure Variance</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">1</div>
            <div className="text-[10px] text-indigo-600 font-medium">Delta vs Core Banking</div>
          </div>

          {/* 5. Approval Pending */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Approval Pending</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'PENDING_APPROVAL').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Level 2 Mandate</div>
          </div>

          {/* 6. LOS Pending */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">LOS Pending</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{cases.filter((c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'SENT_TO_LOS').length}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Ready for Dispatch</div>
          </div>
        </div>
      ) : currentUser.role === 'BILLING_MAKER' || currentUser.role === 'BILLING_CHECKER' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Eligible for Billing */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Eligible for Billing</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{billingEvents.filter((e) => e.billingStatus === 'BILLING_ELIGIBLE').length}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Completed Milestones</div>
          </div>

          {/* 2. Invoices Pending */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Invoices Pending</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{bills.filter((b) => b.status === 'INVOICE_SUBMITTED').length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Vendor Tax Invoices</div>
          </div>

          {/* 3. Maker Queue */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">Maker Queue</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">{bills.filter((b) => b.status === 'BILL_VERIFICATION' || b.status === 'INVOICE_SUBMITTED').length}</div>
            <div className="text-[10px] text-sky-600 font-medium">3-Way Matching</div>
          </div>

          {/* 4. Checker Queue */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Checker Queue</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{bills.filter((b) => b.status === 'BILL_APPROVAL').length}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Approval Trays</div>
          </div>

          {/* 5. ERP Posted */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">ERP Posted</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">{bills.filter((b) => b.status === 'SENT_TO_FINANCE').length}</div>
            <div className="text-[10px] text-sky-600 font-medium">Voucher Created</div>
          </div>

          {/* 6. Paid */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">Paid</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">{bills.filter((b) => b.status === 'PAID').length}</div>
            <div className="text-[10px] text-emerald-600 font-medium">UTR Disbursed</div>
          </div>
        </div>
      ) : (
        /* Admin Landing */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Master Updates */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Master Updates</div>
            <div className="text-xl font-bold text-[#172033] mt-1 font-mono">{pendingMasterApprovals.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Pending Approvals</div>
          </div>

          {/* 2. Active Users */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 truncate">Active Users</div>
            <div className="text-xl font-bold text-sky-950 mt-1 font-mono">14</div>
            <div className="text-[10px] text-sky-600 font-medium">Provisioned Roles</div>
          </div>

          {/* 3. Vendor Empanelment */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">Vendor Empanelment</div>
            <div className="text-xl font-bold text-indigo-950 mt-1 font-mono">{billingStore.getVendorProfiles().length}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Active Vendors</div>
          </div>

          {/* 4. Audit Exceptions */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 truncate">Audit Exceptions</div>
            <div className="text-xl font-bold text-rose-900 mt-1 font-mono">{queryCounts.overdueQueries}</div>
            <div className="text-[10px] text-rose-600 font-medium">SLA Breaches</div>
          </div>

          {/* 5. Pending Config Changes */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate">Pending Config Changes</div>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">{pendingMasterApprovals.length}</div>
            <div className="text-[10px] text-amber-600 font-medium">Registry Changes</div>
          </div>

          {/* 6. System Alerts */}
          <div className="p-2.5 rounded-lg border border-[#DCE3EB] bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">System Alerts</div>
            <div className="text-xl font-bold text-emerald-950 mt-1 font-mono">0</div>
            <div className="text-[10px] text-emerald-600 font-medium">All Gateways Healthy</div>
          </div>
        </div>
      )}

      {/* Main Cases Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-2 px-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-sans">
              Cases Queue
            </span>
            <span className="text-xs text-slate-300">|</span>
            {/* Segmented Filter Control */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/80 rounded-lg text-xs overflow-x-auto">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalVisible})
              </button>
              <button
                onClick={() => setFilterTab('MY_ACTIONS')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  filterTab === 'MY_ACTIONS'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Pending</span>
                {myPendingActions > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black">
                    {myPendingActions}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterTab('VALUER_QUEUE')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  filterTab === 'VALUER_QUEUE'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valuer ({valuerQueueCount})
              </button>
              <button
                onClick={() => setFilterTab('VAL_SUBMITTED')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  filterTab === 'VAL_SUBMITTED'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Val Submitted ({valSubmittedCount})
              </button>
              <button
                onClick={() => setFilterTab('COM_REVIEW')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  filterTab === 'COM_REVIEW'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Credit Review ({comReviewCount})
              </button>
              <button
                onClick={() => setFilterTab('APPROVED')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  filterTab === 'APPROVED'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({approvedCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Case, Builder, Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300/90 focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-800 bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Case Ref</th>
                <th className="py-2 px-3">Builder / Developer</th>
                <th className="py-2 px-3">Project & Towers</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Query</th>
                <th className="py-2 px-3">Action Owner</th>
                <th className="py-2 px-3">SLA TAT</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <Layers className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                    <p className="font-semibold text-slate-600 text-xs">No cases found in this filter tab.</p>
                    <p className="text-[11px]">
                      {currentUser.role === 'CPA'
                        ? 'Click "New APF Case" above to start a new transaction.'
                        : 'Switch to another filter or check pending queues.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
                  const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
                  const towers = CENTRAL_TOWER_MASTER.filter((t) => c.selectedTowerIds.includes(t.id));
                  const isActionOwner = c.currentOwnerRole === currentUser.role;
                  const caseQueries = queryStore.getQueriesForCase(c.id);
                  const blockingStatus = queryStore.hasBlockingQuery(c.id);
                  const needInputQueries = caseQueries.filter(
                    (q) => q.status === 'INPUT_REQUIRED' || q.status === 'OPEN'
                  );

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onOpenCase(c.id)}
                      className={`hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                        isActionOwner ? 'bg-sky-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono">
                        <div className="font-bold text-[#0a2540] flex items-center gap-1.5 leading-tight">
                          <span>{c.id}</span>
                          {c.priority === 'High' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="High Priority" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono leading-tight">{c.apfNumber}</div>
                      </td>

                      <td className="py-2 px-3">
                        <div className="font-bold text-[#0a2540] leading-tight">
                          {builder?.legalName || c.builderId}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">{builder?.groupName}</div>
                      </td>

                      <td className="py-2 px-3">
                        <div className="font-bold text-sky-800 leading-tight">
                          {project?.projectName || c.projectId}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {towers.map((t) => t.towerName).join(', ') || 'All Towers'}
                        </div>
                      </td>

                      <td className="py-2 px-3">{getStatusBadge(c.currentStatus)}</td>

                      <td className="py-2 px-3">
                        {blockingStatus.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>BLOCKED</span>
                          </span>
                        ) : needInputQueries.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{needInputQueries.length} Open</span>
                          </span>
                        ) : caseQueries.some((q) => q.status === 'INPUT_RECEIVED') ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                            <CheckCircle2 className="w-3 h-3 text-sky-600" />
                            <span>Input Recd</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1 leading-tight">
                          <Shield className="w-3 h-3 text-sky-700" />
                          <span>{c.currentOwnerRole}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">{c.currentOwnerName}</div>
                      </td>

                      <td className="py-2 px-3 font-mono text-[10px] text-slate-600">
                        <div className="flex items-center gap-1 text-emerald-700 leading-tight font-medium">
                          <Clock className="w-3 h-3" />
                          <span>28h left</span>
                        </div>
                        <span className="text-[9px] text-slate-400 leading-tight">Due {c.slaDueDate.substring(5, 16)}</span>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(c.valuationReport || c.bankValuationReport || c.detailedValuationReport || c.currentStatus === 'VALUATION_SUBMITTED' || c.currentStatus === 'COM_REVIEW' || c.currentStatus === 'APPROVED' || c.currentStatus === 'SENT_TO_LOS') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewReportCase(c);
                              }}
                              className="px-2 py-0.5 rounded text-xs font-semibold transition-all inline-flex items-center gap-1 bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200 shadow-2xs"
                              title="Preview Official Bank Valuation Report Document"
                            >
                              <FileText className="w-3 h-3 text-sky-600" />
                              <span>Val Doc</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewLegalCaseId(c.id);
                            }}
                            className="px-2 py-0.5 rounded text-xs font-semibold transition-all inline-flex items-center gap-1 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 shadow-2xs"
                            title="Preview APF Legal Due Diligence Report Docket"
                          >
                            <Scale className="w-3 h-3 text-sky-700" />
                            <span>Legal Doc</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCase(c.id);
                            }}
                            className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all inline-flex items-center gap-1 ${
                              isActionOwner
                                ? 'bg-[#0c3148] text-white hover:bg-[#19638c] shadow-2xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>{isActionOwner ? 'Action' : 'Open'}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Report Document Preview Modal */}
      {previewReportCase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Official Bank Technical & Valuation Report</span>
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {previewReportCase.id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Field Catalogue Compliant • Bank Due Diligence Model • Version {previewReportCase.valuationReport?.reportVersion || 'v1.0'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewReportCase(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ValuationReportDocPreview
              reportData={getOrGenerateBankValuationReport(previewReportCase)}
              onClose={() => setPreviewReportCase(null)}
            />
          </div>
        </div>
      )}

      {/* Legal Due Diligence Formal Report Modal */}
      {previewLegalCaseId && (
        <LegalReportDocModal
          isOpen={Boolean(previewLegalCaseId)}
          onClose={() => setPreviewLegalCaseId(null)}
          report={legalStore.getOrCreateReport(previewLegalCaseId)}
        />
      )}
    </div>
  );
};
