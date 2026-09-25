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
} from 'lucide-react';
import { ValuationReportDocPreview } from '../valuation/ValuationReportDocPreview';
import { getOrGenerateBankValuationReport } from '../../services/valuationCalculationEngine';

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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">
            APF ACTIVE
          </span>
        );
      case 'APPROVED':
      case 'CONDITIONAL_APPROVAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">
            {status.replace('_', ' ')}
          </span>
        );
      case 'SENT_TO_LOS':
      case 'LOS_ACKNOWLEDGED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
            LOS DISPATCHED
          </span>
        );
      case 'VALUATION_SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
            VALUATION SUBMITTED
          </span>
        );
      case 'SITE_VISIT_IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 animate-pulse border border-amber-300">
            SITE VISIT (GPS)
          </span>
        );
      case 'ASSIGNED_TO_VALUER':
      case 'VALUER_ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            VALUER QUEUE
          </span>
        );
      case 'COM_REVIEW':
      case 'PENDING_APPROVAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            CREDIT SANCTION
          </span>
        );
      case 'VALUATION_REWORK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            REWORK REQUIRED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
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
      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-md bg-[#0c3148] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0c3148] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/80">
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
              className="px-2.5 py-1.5 rounded-md bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New APF Case</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo cases to initial baseline state?')) {
                apfStore.resetDemoData();
                queryStore.resetDemoQueries();
              }
            }}
            title="Reset to baseline demo transaction queue"
            className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Compact Enterprise KPI Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {/* KPI 1: Total Visible */}
        <div
          onClick={() => setFilterTab('ALL')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs ${
            filterTab === 'ALL'
              ? 'border-sky-700 ring-2 ring-sky-700/15'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 truncate">
              Total Cases
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              {totalVisible}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">All Records</span>
          </div>
        </div>

        {/* KPI 2: Action Required */}
        <div
          onClick={() => setFilterTab('MY_ACTIONS')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs ${
            filterTab === 'MY_ACTIONS'
              ? 'border-amber-600 ring-2 ring-amber-600/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
              Pending Action
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-amber-900 tracking-tight leading-none">
              {myPendingActions}
            </div>
            {myPendingActions > 0 ? (
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                Actionable
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Up to date</span>
            )}
          </div>
        </div>

        {/* KPI 3: Valuer Underwriting */}
        <div
          onClick={() => setFilterTab('VALUER_QUEUE')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs ${
            filterTab === 'VALUER_QUEUE'
              ? 'border-indigo-600 ring-2 ring-indigo-600/20'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
              Valuer Queue
            </span>
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-indigo-950 tracking-tight leading-none">
              {valuerQueueCount}
            </div>
            <span className="text-[10px] text-indigo-600 font-medium">Site & Desk</span>
          </div>
        </div>

        {/* KPI 4: Valuation Submitted / Review */}
        <div
          onClick={() => setFilterTab('VAL_SUBMITTED')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs ${
            filterTab === 'VAL_SUBMITTED'
              ? 'border-cyan-600 ring-2 ring-cyan-600/20'
              : 'border-slate-200 hover:border-cyan-300'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
              Val Submitted
            </span>
            <FileText className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-cyan-950 tracking-tight leading-none">
              {valSubmittedCount}
            </div>
            <span className="text-[10px] text-cyan-700 font-medium">Ready for CPA</span>
          </div>
        </div>

        {/* KPI 5: Sanctions & Approvals */}
        <div
          onClick={() => setFilterTab('APPROVED')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs ${
            filterTab === 'APPROVED'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
              Approved
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-emerald-950 tracking-tight leading-none">
              {approvedCount}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Sanctioned</span>
          </div>
        </div>

        {/* KPI 6: In-App Queries & Communication */}
        <div
          onClick={() => {
            if (onNavigateToQueries) onNavigateToQueries('ALL');
          }}
          className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
              Live Queries
            </span>
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              {queryCounts.openQueries}
            </div>
            {queryCounts.needInput > 0 ? (
              <span className="text-[9px] font-bold text-rose-800 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                {queryCounts.needInput} Urgent
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">In Sync</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Cases Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-2.5 px-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Cases Queue ({filteredCases.length})
            </span>
            <span className="text-xs text-slate-300">|</span>
            <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                  filterTab === 'ALL' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All ({totalVisible})
              </button>
              <button
                onClick={() => setFilterTab('MY_ACTIONS')}
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                  filterTab === 'MY_ACTIONS' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
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
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                  filterTab === 'VALUER_QUEUE' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Valuer ({valuerQueueCount})
              </button>
              <button
                onClick={() => setFilterTab('VAL_SUBMITTED')}
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                  filterTab === 'VAL_SUBMITTED' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Val Submitted ({valSubmittedCount})
              </button>
              <button
                onClick={() => setFilterTab('COM_REVIEW')}
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                  filterTab === 'COM_REVIEW' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Credit Review ({comReviewCount})
              </button>
              <button
                onClick={() => setFilterTab('APPROVED')}
                className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                  filterTab === 'APPROVED' ? 'bg-[#0c3148] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Approved ({approvedCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Case, Builder, Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-600 focus:outline-none text-slate-800 bg-white"
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
    </div>
  );
};
