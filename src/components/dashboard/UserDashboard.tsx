import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
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
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'MY_ACTIONS' | 'IN_PROGRESS' | 'APPROVED' | 'REWORK'>('ALL');
  const allCases = apfStore.getAllCases();

  // Role filtering rules:
  // External valuer can only see cases assigned to them or unassigned in their panel queue
  const visibleCases = allCases.filter((c) => {
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
  const inProgress = visibleCases.filter(
    (c) =>
      c.currentStatus === 'INITIATED' ||
      c.currentStatus === 'ASSIGNED_TO_VALUER' ||
      c.currentStatus === 'VALUER_ACCEPTED' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
      c.currentStatus === 'COM_REVIEW' ||
      c.currentStatus === 'PENDING_APPROVAL'
  ).length;
  const submitted = visibleCases.filter((c) => c.currentStatus === 'VALUATION_SUBMITTED').length;
  const approved = visibleCases.filter((c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'CONDITIONAL_APPROVAL').length;
  const activeApf = visibleCases.filter((c) => c.currentStatus === 'APF_ACTIVE').length;
  const sentToLos = visibleCases.filter((c) => c.currentStatus === 'SENT_TO_LOS' || c.currentStatus === 'LOS_ACKNOWLEDGED' || c.currentStatus === 'APF_ACTIVE').length;
  const reworkCount = visibleCases.filter((c) => c.currentStatus === 'VALUATION_REWORK').length;

  // Filtered list based on search and tab
  const filteredCases = visibleCases.filter((c) => {
    // Tab filter
    if (filterTab === 'MY_ACTIONS' && c.currentOwnerRole !== currentUser.role) return false;
    if (filterTab === 'IN_PROGRESS' && (c.currentStatus === 'APF_ACTIVE' || c.currentStatus === 'APPROVED')) return false;
    if (filterTab === 'APPROVED' && c.currentStatus !== 'APPROVED' && c.currentStatus !== 'CONDITIONAL_APPROVAL' && c.currentStatus !== 'APF_ACTIVE') return false;
    if (filterTab === 'REWORK' && c.currentStatus !== 'VALUATION_REWORK') return false;

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
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">APF ACTIVE</span>;
      case 'APPROVED':
      case 'CONDITIONAL_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">{status.replace('_', ' ')}</span>;
      case 'SENT_TO_LOS':
      case 'LOS_ACKNOWLEDGED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">LOS DISPATCHED</span>;
      case 'VALUATION_SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f1f5] text-[#19638c]">VALUATION SUBMITTED</span>;
      case 'SITE_VISIT_IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#0369a1] animate-pulse">SITE VISIT ACTIVE</span>;
      case 'ASSIGNED_TO_VALUER':
      case 'VALUER_ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20">VALUER QUEUE</span>;
      case 'COM_REVIEW':
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef7e0] text-[#b06000]">CREDIT SANCTION</span>;
      case 'VALUATION_REWORK':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">REWORK REQUIRED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getActionHintForCurrentUser = (c: APFCase) => {
    const isOwner = c.currentOwnerRole === currentUser.role;
    if (!isOwner) {
      return (
        <span className="text-[11px] text-[#829ab1] flex items-center gap-1 italic">
          <span>Awaiting {c.currentOwnerRole}</span>
        </span>
      );
    }

    switch (c.currentStatus) {
      case 'INITIATED':
        return <span className="text-[11px] font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded">Assign Valuer</span>;
      case 'ASSIGNED_TO_VALUER':
        return <span className="text-[11px] font-bold text-[#b06000] bg-[#fef7e0] px-2 py-0.5 rounded">Accept Assignment</span>;
      case 'VALUER_ACCEPTED':
        return <span className="text-[11px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded">Start Site Visit (GPS)</span>;
      case 'SITE_VISIT_IN_PROGRESS':
        return <span className="text-[11px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded">Submit Valuation</span>;
      case 'VALUATION_SUBMITTED':
        return <span className="text-[11px] font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded">Review Valuation & 360</span>;
      case 'COM_REVIEW':
        return <span className="text-[11px] font-bold text-[#b06000] bg-[#fef7e0] px-2 py-0.5 rounded">COM Endorsement</span>;
      case 'PENDING_APPROVAL':
        return <span className="text-[11px] font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded">Approval Cockpit</span>;
      case 'APPROVED':
      case 'CONDITIONAL_APPROVAL':
        return <span className="text-[11px] font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded">Send to LOS</span>;
      case 'APF_ACTIVE':
        return <span className="text-[11px] font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded">Active in LOS</span>;
      default:
        return <span className="text-[11px] font-medium text-[#627d98]">Action Required</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded-md">
              {currentUser.roleLabel}
            </span>
            <span className="text-xs text-[#829ab1] font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            {currentUser.agencyOrDept} • Real-time APF Underwriting Queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'CPA' && (
            <button
              onClick={onInitiateNewCase}
              className="px-4 py-2.5 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ New APF Case</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset all demo cases to initial state? Masters will be preserved.')) {
                apfStore.resetDemoData();
              }
            }}
            title="Reset to baseline demo transaction queue"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 8 Bank Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => setFilterTab('ALL')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterTab === 'ALL' ? 'bg-[#0c3148] text-white border-[#0c3148]' : 'bg-white text-[#102a43] border-[#e2e8f0] hover:border-[#19638c]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterTab === 'ALL' ? 'text-[#8bb3cb]' : 'text-[#627d98]'}`}>
            Total Visible
          </span>
          <div className="text-xl font-black mt-0.5">{totalVisible}</div>
          <span className={`text-[10px] ${filterTab === 'ALL' ? 'text-slate-300' : 'text-[#829ab1]'}`}>All active</span>
        </div>

        <div
          onClick={() => setFilterTab('MY_ACTIONS')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterTab === 'MY_ACTIONS' ? 'bg-[#19638c] text-white border-[#19638c]' : 'bg-white text-[#102a43] border-[#e2e8f0] hover:border-[#19638c]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterTab === 'MY_ACTIONS' ? 'text-sky-200' : 'text-[#19638c]'}`}>
            My Pending
          </span>
          <div className="text-xl font-black mt-0.5 text-amber-500">{myPendingActions}</div>
          <span className={`text-[10px] ${filterTab === 'MY_ACTIONS' ? 'text-sky-200' : 'text-[#829ab1]'}`}>Action owner</span>
        </div>

        <div
          onClick={() => setFilterTab('IN_PROGRESS')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterTab === 'IN_PROGRESS' ? 'bg-sky-800 text-white border-sky-800' : 'bg-white text-[#102a43] border-[#e2e8f0] hover:border-[#19638c]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterTab === 'IN_PROGRESS' ? 'text-sky-200' : 'text-[#627d98]'}`}>
            In Progress
          </span>
          <div className="text-xl font-black mt-0.5">{inProgress}</div>
          <span className={`text-[10px] ${filterTab === 'IN_PROGRESS' ? 'text-sky-200' : 'text-[#829ab1]'}`}>Underway</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#627d98]">Submitted</span>
          <div className="text-xl font-black text-[#102a43] mt-0.5">{submitted}</div>
          <span className="text-[10px] text-[#829ab1]">Valuations</span>
        </div>

        <div
          onClick={() => setFilterTab('APPROVED')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterTab === 'APPROVED' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-[#102a43] border-[#e2e8f0] hover:border-[#19638c]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterTab === 'APPROVED' ? 'text-emerald-200' : 'text-[#137333]'}`}>
            Approved
          </span>
          <div className="text-xl font-black mt-0.5 text-[#137333]">{approved}</div>
          <span className={`text-[10px] ${filterTab === 'APPROVED' ? 'text-emerald-200' : 'text-[#829ab1]'}`}>By Committee</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#19638c]">Sent to LOS</span>
          <div className="text-xl font-black text-[#19638c] mt-0.5">{sentToLos}</div>
          <span className="text-[10px] text-[#829ab1]">{activeApf} APF Active</span>
        </div>

        <div
          onClick={() => setFilterTab('REWORK')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            filterTab === 'REWORK' ? 'bg-rose-800 text-white border-rose-800' : 'bg-white text-[#102a43] border-[#e2e8f0] hover:border-[#19638c]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${filterTab === 'REWORK' ? 'text-rose-200' : 'text-rose-700'}`}>
            Rework
          </span>
          <div className="text-xl font-black mt-0.5 text-rose-600">{reworkCount}</div>
          <span className={`text-[10px] ${filterTab === 'REWORK' ? 'text-rose-200' : 'text-[#829ab1]'}`}>Exceptions</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#137333]">SLA On Track</span>
          <div className="text-xl font-black text-[#137333] mt-0.5">100%</div>
          <span className="text-[10px] text-[#829ab1]">0 Breached</span>
        </div>
      </div>

      {/* Main Cases Table Section */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
              Cases Queue ({filteredCases.length})
            </span>
            <span className="text-xs text-[#829ab1]">|</span>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  filterTab === 'ALL' ? 'bg-[#0c3148] text-white' : 'text-[#627d98] hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('MY_ACTIONS')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                  filterTab === 'MY_ACTIONS' ? 'bg-[#19638c] text-white' : 'text-[#627d98] hover:bg-slate-200'
                }`}
              >
                <span>My Pending Actions</span>
                {myPendingActions > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#102a43] text-[10px] font-black">
                    {myPendingActions}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterTab('IN_PROGRESS')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  filterTab === 'IN_PROGRESS' ? 'bg-sky-800 text-white' : 'text-[#627d98] hover:bg-slate-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterTab('APPROVED')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  filterTab === 'APPROVED' ? 'bg-emerald-800 text-white' : 'text-[#627d98] hover:bg-slate-200'
                }`}
              >
                Approved / Active
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#829ab1]" />
            <input
              type="text"
              placeholder="Search Case ID, Builder, Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#19638c] focus:outline-none text-[#102a43]"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] uppercase text-[10px] tracking-wider font-bold border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4">Case ID & Number</th>
                <th className="py-3 px-4">Builder / Developer</th>
                <th className="py-3 px-4">Project & Towers</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Current Owner</th>
                <th className="py-3 px-4">Required Action</th>
                <th className="py-3 px-4">SLA TAT</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#829ab1]">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No cases found in this filter tab.</p>
                    <p className="text-[11px]">
                      {currentUser.role === 'CPA'
                        ? 'Click "+ New APF Case" above to start a new transaction.'
                        : 'Switch to another tab or log in as CPA to initiate transactions.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
                  const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
                  const towers = CENTRAL_TOWER_MASTER.filter((t) => c.selectedTowerIds.includes(t.id));
                  const isActionOwner = c.currentOwnerRole === currentUser.role;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onOpenCase(c.id)}
                      className={`hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                        isActionOwner ? 'bg-sky-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#102a43] flex items-center gap-1.5">
                          <span>{c.id}</span>
                          {c.priority === 'High' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="High Priority" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#829ab1] font-mono">{c.apfNumber}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#102a43]">
                          {builder?.legalName || c.builderId}
                        </div>
                        <div className="text-[10px] text-[#829ab1]">{builder?.groupName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#19638c]">
                          {project?.projectName || c.projectId}
                        </div>
                        <div className="text-[10px] text-[#627d98]">
                          {towers.map((t) => t.towerName).join(', ') || 'All Towers'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(c.currentStatus)}</td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#102a43] flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#19638c]" />
                          <span>{c.currentOwnerRole}</span>
                        </div>
                        <div className="text-[10px] text-[#829ab1]">{c.currentOwnerName}</div>
                      </td>

                      <td className="py-3.5 px-4">{getActionHintForCurrentUser(c)}</td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#627d98]">
                        <div className="flex items-center gap-1 text-emerald-700">
                          <Clock className="w-3 h-3" />
                          <span>28h left</span>
                        </div>
                        <span className="text-[9px] text-[#829ab1]">Due: {c.slaDueDate.substring(5, 16)}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCase(c.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                            isActionOwner
                              ? 'bg-[#19638c] text-white hover:bg-[#145070] shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{isActionOwner ? 'Take Action' : 'Open'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
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
