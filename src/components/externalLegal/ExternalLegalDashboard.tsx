import React, { useState } from 'react';
import {
  LegalAssignment,
  LegalDueDiligenceReport,
} from '../../types/legalDueDiligence';
import { UserAccount } from '../../types/apfTransaction';
import {
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck2,
  DollarSign,
  CreditCard,
  Building2,
  ArrowRight,
  Filter,
  Search,
  UserCheck,
  ShieldCheck,
  Send,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExternalLegalDashboardProps {
  currentUser: UserAccount;
  assignments: LegalAssignment[];
  reports: LegalDueDiligenceReport[];
  onOpenCase: (caseId: string) => void;
  onAcceptDecline: (assignment: LegalAssignment) => void;
  onNavigateToBilling: () => void;
  onReallocate?: (assignmentId: string, newUserId: string, newUserName: string) => void;
}

export const ExternalLegalDashboard: React.FC<ExternalLegalDashboardProps> = ({
  currentUser,
  assignments,
  reports,
  onOpenCase,
  onAcceptDecline,
  onNavigateToBilling,
  onReallocate,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'ACTIVE' | 'SUBMITTED' | 'BILLING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvocateAllocation, setSelectedAdvocateAllocation] = useState<Record<string, string>>({});

  // Compute 10 KPI Counts
  const newAssignmentsCount = assignments.filter((a) => a.status === 'LEGAL_ASSIGNED').length;
  const acceptedCount = assignments.filter((a) => a.status === 'LEGAL_ACCEPTED').length;
  const docReviewPendingCount = reports.filter((r) =>
    (r.documentsExamined || []).some((d) => d.status === 'Missing' || d.status === 'Clarification Required')
  ).length;
  const needInputCount = assignments.filter((a) => {
    const r = reports.find((rep) => rep.caseId === a.caseId);
    return r?.subStatus === 'INPUT_REQUIRED';
  }).length;
  const inputReceivedCount = assignments.filter((a) => {
    const r = reports.find((rep) => rep.caseId === a.caseId);
    return r?.subStatus === 'INPUT_RECEIVED';
  }).length;
  const legalDraftCount = assignments.filter((a) => a.status === 'LEGAL_REPORT_DRAFT').length;
  const reworkCount = assignments.filter((a) => a.status === 'LEGAL_REWORK').length;
  const submittedCount = assignments.filter(
    (a) => a.status === 'LEGAL_SUBMITTED' || a.status === 'LEGAL_ACCEPTED_BY_BANK'
  ).length;
  const billingEligibleCount = assignments.filter((a) => a.status === 'BILLING_ELIGIBLE').length;
  const paymentInProcessCount = 1; // Seeded sample

  // Filter list
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reviewId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assignedUserName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'ACTION_REQUIRED') {
      return a.status === 'LEGAL_ASSIGNED' || a.status === 'LEGAL_REWORK';
    }
    if (filterTab === 'ACTIVE') {
      return (
        a.status === 'LEGAL_ACCEPTED' ||
        a.status === 'LEGAL_REVIEW_IN_PROGRESS' ||
        a.status === 'LEGAL_REPORT_DRAFT'
      );
    }
    if (filterTab === 'SUBMITTED') {
      return a.status === 'LEGAL_SUBMITTED' || a.status === 'LEGAL_ACCEPTED_BY_BANK';
    }
    if (filterTab === 'BILLING') {
      return a.status === 'BILLING_ELIGIBLE';
    }
    return true;
  });

  const getStatusBadge = (status: LegalAssignment['status']) => {
    switch (status) {
      case 'LEGAL_ASSIGNED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> New Assignment
          </span>
        );
      case 'LEGAL_ACCEPTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-600" /> Accepted
          </span>
        );
      case 'LEGAL_REPORT_DRAFT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Scrutiny Draft
          </span>
        );
      case 'LEGAL_SUBMITTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 flex items-center gap-1">
            <FileText className="w-3 h-3 text-indigo-600" /> Report Submitted
          </span>
        );
      case 'LEGAL_REWORK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Rework Required
          </span>
        );
      case 'BILLING_ELIGIBLE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-600" /> Billing Eligible
          </span>
        );
      case 'LEGAL_ACCEPTED_BY_BANK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            Accepted by Bank
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const isFirmAdmin = currentUser.role === 'EXTERNAL_LEGAL_FIRM_ADMIN';

  return (
    <div className="space-y-4">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-4.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#172033]">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs text-[#667085] flex items-center gap-2 mt-0.5">
              <span>{currentUser.firmName || 'Demo Legal Associates'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Empanelment Active (#EMP-LEG-2024-042)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {newAssignmentsCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{newAssignmentsCount} New Assignment(s) Awaiting Acceptance</span>
            </div>
          )}
          {reworkCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{reworkCount} Rework Notice(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* 10 Operational KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">1. New</span>
          <span className="text-lg font-bold text-amber-600 block mt-0.5">{newAssignmentsCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">2. Accepted</span>
          <span className="text-lg font-bold text-sky-700 block mt-0.5">{acceptedCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">3. Doc Pending</span>
          <span className="text-lg font-bold text-slate-700 block mt-0.5">{docReviewPendingCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">4. Need Input</span>
          <span className="text-lg font-bold text-amber-600 block mt-0.5">{needInputCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">5. Input Recvd</span>
          <span className="text-lg font-bold text-emerald-600 block mt-0.5">{inputReceivedCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">6. Legal Draft</span>
          <span className="text-lg font-bold text-indigo-600 block mt-0.5">{legalDraftCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">7. Rework</span>
          <span className="text-lg font-bold text-rose-600 block mt-0.5">{reworkCount}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#DCE3EB] shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block truncate">8. Submitted</span>
          <span className="text-lg font-bold text-slate-900 block mt-0.5">{submittedCount}</span>
        </div>

        <div
          onClick={onNavigateToBilling}
          className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 shadow-2xs cursor-pointer hover:bg-emerald-100/70 transition-colors"
        >
          <span className="text-[10px] font-bold text-emerald-800 block truncate">9. Bill Eligible</span>
          <span className="text-lg font-bold text-emerald-700 block mt-0.5">{billingEligibleCount}</span>
        </div>

        <div
          onClick={onNavigateToBilling}
          className="bg-sky-50/70 p-3 rounded-lg border border-sky-200 shadow-2xs cursor-pointer hover:bg-sky-100/70 transition-colors"
        >
          <span className="text-[10px] font-bold text-sky-800 block truncate">10. Payment Proc</span>
          <span className="text-lg font-bold text-sky-700 block mt-0.5">{paymentInProcessCount}</span>
        </div>
      </div>

      {/* Main Legal Review & Assignment Table */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-2xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="px-4 py-3 border-b border-[#DCE3EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Assignments ({assignments.length})
            </button>
            <button
              onClick={() => setFilterTab('ACTION_REQUIRED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === 'ACTION_REQUIRED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Action Required ({newAssignmentsCount + reworkCount})
            </button>
            <button
              onClick={() => setFilterTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === 'ACTIVE'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              In Progress ({acceptedCount + legalDraftCount})
            </button>
            <button
              onClick={() => setFilterTab('SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === 'SUBMITTED'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              Submitted / Historical ({submittedCount})
            </button>
            <button
              onClick={() => setFilterTab('BILLING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === 'BILLING'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Billing Eligible ({billingEligibleCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Case, Review ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#DCE3EB] text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Legal Review ID</th>
                <th className="py-2.5 px-3">APF Case</th>
                <th className="py-2.5 px-3">Builder</th>
                <th className="py-2.5 px-3">Project & Scope</th>
                <th className="py-2.5 px-3">Assigned Advocate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SLA Target</th>
                <th className="py-2.5 px-3">Query Status</th>
                <th className="py-2.5 px-3 text-right">My Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3EB]">
              {filteredAssignments.map((a) => {
                const report = reports.find((r) => r.caseId === a.caseId);
                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{a.reviewId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{a.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-sky-700 block">{a.caseId}</span>
                      <span className="text-[10px] text-slate-500">{a.legalRoute}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                        {report?.builderLegalName || 'Kolte-Patil Developers Ltd.'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {report?.builderGroup || 'Kolte-Patil Group'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                        {report?.projectName || 'Life Republic i Towers'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Scope: {a.scopeType} • {a.phaseNames.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isFirmAdmin && onReallocate ? (
                        <div className="space-y-1">
                          <span className="font-medium text-slate-900 block text-[11px]">
                            {a.assignedUserName}
                          </span>
                          <select
                            value={selectedAdvocateAllocation[a.id] || a.assignedUserId}
                            onChange={(e) => {
                              const newUid = e.target.value;
                              setSelectedAdvocateAllocation({
                                ...selectedAdvocateAllocation,
                                [a.id]: newUid,
                              });
                              const newName =
                                newUid === 'legal.ext01'
                                  ? 'Adv. Ananya Deshmukh'
                                  : newUid === 'legalfirm.user01'
                                  ? 'Adv. Siddharth Kulkarni'
                                  : 'Adv. Sanjay Trivedi';
                              onReallocate(a.id, newUid, newName);
                            }}
                            className="text-[10px] p-1 border border-slate-200 rounded bg-slate-50 font-medium"
                          >
                            <option value="legal.ext01">Adv. Ananya Deshmukh</option>
                            <option value="legalfirm.user01">Adv. Siddharth Kulkarni</option>
                            <option value="legalfirm.admin01">Adv. Sanjay Trivedi</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-900 block">{a.assignedUserName}</span>
                          <span className="text-[10px] text-slate-400">{a.firmName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(a.status)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{a.slaDueDate?.split(' ')[0]}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Commitment: {a.slaDays} days</span>
                    </td>
                    <td className="py-3 px-3">
                      {report?.subStatus === 'INPUT_REQUIRED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Need Input
                        </span>
                      ) : report?.subStatus === 'INPUT_RECEIVED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Input Received
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {a.status === 'LEGAL_ASSIGNED' ? (
                        <button
                          onClick={() => onAcceptDecline(a)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <span>Accept / Decline</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : a.status === 'BILLING_ELIGIBLE' ? (
                        <button
                          onClick={onNavigateToBilling}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Upload Invoice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenCase(a.caseId)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <span>Open Scrutiny</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
