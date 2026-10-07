import React, { useState } from 'react';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import { queryStore } from '../../services/queryStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
} from '../../data/centralMasterData';
import {
  Inbox,
  CheckCircle2,
  MapPin,
  FileEdit,
  HelpCircle,
  FileCheck2,
  RotateCcw,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Building2,
  Calendar,
  Layers,
  Camera,
  Eye,
} from 'lucide-react';

interface ExternalValuerDashboardProps {
  currentUser: UserAccount;
  cases: APFCase[];
  onOpenCase: (caseId: string) => void;
  onOpenSiteVisit: (caseId: string) => void;
  onNavigateToBilling?: () => void;
}

export const ExternalValuerDashboard: React.FC<ExternalValuerDashboardProps> = ({
  currentUser,
  cases,
  onOpenCase,
  onOpenSiteVisit,
  onNavigateToBilling,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Filter cases visible to this external valuer / panel
  const valuerCases = cases.filter((c) => {
    return (
      c.valuerAssignment?.assignedUserId === currentUser.id ||
      c.valuerAssignment?.vendorAgency?.includes('Knight Frank') ||
      c.currentOwnerRole === 'EXTERNAL_VALUER' ||
      c.currentStatus.startsWith('VALUER_') ||
      c.currentStatus === 'ASSIGNED_TO_VALUER' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
      c.currentStatus === 'VALUATION_SUBMITTED' ||
      c.currentStatus === 'VALUATION_REWORK'
    );
  });

  // Calculate 9 KPI Metrics requested in Section 9
  const newAssignmentsCount = valuerCases.filter(
    (c) => c.currentStatus === 'ASSIGNED_TO_VALUER'
  ).length;

  const acceptedCount = valuerCases.filter(
    (c) => c.currentStatus === 'VALUER_ACCEPTED'
  ).length;

  const siteVisitPendingCount = valuerCases.filter(
    (c) => c.currentStatus === 'SITE_VISIT_IN_PROGRESS'
  ).length;

  const draftReportsCount = valuerCases.filter(
    (c) => c.currentStatus === 'VALUER_ACCEPTED' && !c.valuationReport
  ).length;

  const needInputCount = queryStore.getDashboardCounts(currentUser.role, currentUser.id).needInput;

  const submittedCount = valuerCases.filter(
    (c) =>
      c.currentStatus === 'VALUATION_SUBMITTED' ||
      c.currentStatus === 'COM_REVIEW' ||
      c.currentStatus === 'APPROVED' ||
      c.currentStatus === 'APF_ACTIVE'
  ).length;

  const reworkCount = valuerCases.filter(
    (c) => c.currentStatus === 'VALUATION_REWORK'
  ).length;

  const billingEligibleCount = valuerCases.filter(
    (c) =>
      c.currentStatus === 'VALUATION_SUBMITTED' ||
      c.currentStatus === 'APPROVED' ||
      c.currentStatus === 'APF_ACTIVE'
  ).length;

  const paymentInProcessCount = 1; // 1 batch currently in processing

  // Filtered case list
  const filteredCases = valuerCases.filter((c) => {
    if (selectedFilter === 'NEW' && c.currentStatus !== 'ASSIGNED_TO_VALUER') return false;
    if (selectedFilter === 'ACCEPTED' && c.currentStatus !== 'VALUER_ACCEPTED') return false;
    if (selectedFilter === 'VISIT_PENDING' && c.currentStatus !== 'SITE_VISIT_IN_PROGRESS') return false;
    if (selectedFilter === 'SUBMITTED' && c.currentStatus !== 'VALUATION_SUBMITTED') return false;
    if (selectedFilter === 'REWORK' && c.currentStatus !== 'VALUATION_REWORK') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Workstation Header */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#172033]">
              Technical Valuation Underwriting Queue
            </h1>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Active Panel Desk
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Empanelled Valuer: <strong>{currentUser.name}</strong> • Knight Frank Valuation Services LLP (#EMP-VAL-PUN-001)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {billingEligibleCount > 0 && onNavigateToBilling && (
            <button
              onClick={onNavigateToBilling}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>{billingEligibleCount} Dockets Eligible for Fee Invoicing</span>
            </button>
          )}
        </div>
      </div>

      {/* 9 KPI Cards as specified in Section 9 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {/* 1. New Assignments */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'NEW' ? 'ALL' : 'NEW')}
          className={`bg-white p-3 rounded-lg border transition-all cursor-pointer shadow-xs hover:border-[#1667C1] ${
            selectedFilter === 'NEW' ? 'ring-2 ring-[#1667C1] border-transparent' : 'border-[#DCE3EB]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              New Assign
            </span>
            <Inbox className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{newAssignmentsCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">Pending Acceptance</div>
        </div>

        {/* 2. Accepted */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'ACCEPTED' ? 'ALL' : 'ACCEPTED')}
          className={`bg-white p-3 rounded-lg border transition-all cursor-pointer shadow-xs hover:border-[#1667C1] ${
            selectedFilter === 'ACCEPTED' ? 'ring-2 ring-[#1667C1] border-transparent' : 'border-[#DCE3EB]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Accepted
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{acceptedCount}</div>
          <div className="text-[10px] text-sky-700 font-medium mt-0.5">In Progress</div>
        </div>

        {/* 3. Site Visit Pending */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'VISIT_PENDING' ? 'ALL' : 'VISIT_PENDING')}
          className={`bg-white p-3 rounded-lg border transition-all cursor-pointer shadow-xs hover:border-[#1667C1] ${
            selectedFilter === 'VISIT_PENDING' ? 'ring-2 ring-[#1667C1] border-transparent' : 'border-[#DCE3EB]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Site Visits
            </span>
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{siteVisitPendingCount}</div>
          <div className="text-[10px] text-indigo-700 font-medium mt-0.5">GPS Verification</div>
        </div>

        {/* 4. Draft Reports */}
        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Drafts
            </span>
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{draftReportsCount}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Unsaved Changes</div>
        </div>

        {/* 5. Need Input */}
        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Need Input
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{needInputCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">Bank Queries</div>
        </div>

        {/* 6. Submitted */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
          className={`bg-white p-3 rounded-lg border transition-all cursor-pointer shadow-xs hover:border-[#1667C1] ${
            selectedFilter === 'SUBMITTED' ? 'ring-2 ring-[#1667C1] border-transparent' : 'border-[#DCE3EB]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Submitted
            </span>
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-[#172033] font-mono">{submittedCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Under Bank Review</div>
        </div>

        {/* 7. Rework */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'REWORK' ? 'ALL' : 'REWORK')}
          className={`bg-white p-3 rounded-lg border transition-all cursor-pointer shadow-xs hover:border-[#1667C1] ${
            selectedFilter === 'REWORK' ? 'ring-2 ring-[#1667C1] border-transparent' : 'border-[#DCE3EB]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Rework
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono">{reworkCount}</div>
          <div className="text-[10px] text-rose-700 font-medium mt-0.5">Observation Sent</div>
        </div>

        {/* 8. Billing Eligible */}
        <div
          onClick={onNavigateToBilling}
          className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-xs cursor-pointer hover:border-emerald-500"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Billing Ready
            </span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">{billingEligibleCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Rate Card Ready</div>
        </div>

        {/* 9. Payment In Process */}
        <div
          onClick={onNavigateToBilling}
          className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-xs cursor-pointer hover:border-sky-500"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">
              Payment In Proc
            </span>
            <CreditCard className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-sky-800 font-mono">{paymentInProcessCount}</div>
          <div className="text-[10px] text-sky-700 font-medium mt-0.5">ERP Dispatched</div>
        </div>
      </div>

      {/* Main Table: Assignment ID | APF Case | Builder | Project | Scope | Status | SLA | My Action */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-[#DCE3EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Active Valuation Dockets ({filteredCases.length})
            </h2>
            {selectedFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedFilter('ALL')}
                className="text-[10px] text-sky-700 hover:underline font-semibold"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search docket, project, or builder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#DCE3EB] focus:outline-none focus:ring-1 focus:ring-[#1667C1] text-[#172033]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-[#DCE3EB]">
              <tr>
                <th className="py-2.5 px-3">Assignment ID</th>
                <th className="py-2.5 px-3">APF Case</th>
                <th className="py-2.5 px-3">Builder</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Scope</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SLA Due</th>
                <th className="py-2.5 px-3 text-right">My Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EB]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-700">No active assignments in this queue</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      New technical appraisal dockets assigned by Bank CPA will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
                  const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
                  const assignmentId = c.valuerAssignment?.assignedUserId
                    ? `VAL-ASN-${c.id.replace('APF-', '')}`
                    : `VAL-DIR-${c.id.replace('APF-', '')}`;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sky-800 text-[11px]">
                        {assignmentId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#172033]">{c.id}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.apfNumber || 'PENDING'}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {builder?.legalName || c.builderId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{project?.projectName || c.projectId}</div>
                        <div className="text-[10px] text-slate-500">{project?.locality || project?.city || 'Pune'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-700 font-medium">
                          {c.selectedTowerIds ? `${c.selectedTowerIds.length} Towers` : 'Full Phase'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.currentStatus === 'ASSIGNED_TO_VALUER'
                              ? 'bg-amber-100 text-amber-900'
                              : c.currentStatus === 'VALUER_ACCEPTED'
                              ? 'bg-sky-100 text-sky-900'
                              : c.currentStatus === 'SITE_VISIT_IN_PROGRESS'
                              ? 'bg-indigo-100 text-indigo-900'
                              : c.currentStatus === 'VALUATION_SUBMITTED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : c.currentStatus === 'VALUATION_REWORK'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.currentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.slaDueDate ? c.slaDueDate.split(' ')[0] : '3 Days'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.currentStatus === 'SITE_VISIT_IN_PROGRESS' && (
                            <button
                              onClick={() => onOpenSiteVisit(c.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded cursor-pointer flex items-center gap-1"
                              title="Record GPS Geotagged Site Visit"
                            >
                              <MapPin className="w-3 h-3 text-indigo-600" />
                              <span>GPS Visit</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenCase(c.id)}
                            className="px-3 py-1 text-xs font-semibold bg-[#0B1F33] hover:bg-[#1667C1] text-white rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Open Docket</span>
                            <ArrowRight className="w-3 h-3" />
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
    </div>
  );
};
