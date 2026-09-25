import React, { useState, useEffect } from 'react';
import { queryStore } from '../../services/queryStore';
import { APFQuery, QueryCategory, QueryPriority, QueryStatus } from '../../types/queryTypes';
import { UserAccount } from '../../types/apfTransaction';
import { QueryDetailModal } from './QueryDetailModal';
import { RaiseQueryModal } from './RaiseQueryModal';
import {
  ArrowLeft,
  Search,
  Filter,
  MessageSquare,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RotateCcw,
  Shield,
  Eye,
  Send,
  Building,
} from 'lucide-react';

interface QueryTrayViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase?: (caseId: string) => void;
  initialTab?: 'MY_PENDING' | 'INPUT_RECEIVED' | 'RAISED_BY_ME' | 'ALL' | 'CLOSED';
}

export const QueryTrayView: React.FC<QueryTrayViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
  initialTab = 'MY_PENDING',
}) => {
  const [queries, setQueries] = useState<APFQuery[]>(() => queryStore.getAllQueries());
  const [activeTab, setActiveTab] = useState<
    'MY_PENDING' | 'INPUT_RECEIVED' | 'RAISED_BY_ME' | 'ALL' | 'CLOSED'
  >(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedQuery, setSelectedQuery] = useState<APFQuery | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  useEffect(() => {
    const unsub = queryStore.subscribe(() => {
      setQueries(queryStore.getAllQueries());
      if (selectedQuery) {
        const refreshed = queryStore.getQueryById(selectedQuery.id);
        if (refreshed) setSelectedQuery(refreshed);
      }
    });
    return unsub;
  }, [selectedQuery]);

  const counts = queryStore.getDashboardCounts(currentUser.role, currentUser.id);

  // Filter queries based on active tab and search/filter parameters
  const filteredQueries = queries.filter((q) => {
    // Tab filters
    if (activeTab === 'MY_PENDING') {
      const isAssigned =
        q.assignedToRole === currentUser.role || q.assignedToUserId === currentUser.id;
      if (!isAssigned) return false;
      if (q.status === 'CLOSED' || q.status === 'CANCELLED') return false;
    } else if (activeTab === 'INPUT_RECEIVED') {
      const isRaised =
        q.raisedByUserRole === currentUser.role || q.raisedByUserId === currentUser.id;
      if (!isRaised || q.status !== 'INPUT_RECEIVED') return false;
    } else if (activeTab === 'RAISED_BY_ME') {
      const isRaised =
        q.raisedByUserRole === currentUser.role || q.raisedByUserId === currentUser.id;
      if (!isRaised) return false;
    } else if (activeTab === 'CLOSED') {
      if (q.status !== 'CLOSED') return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && q.category !== categoryFilter) return false;

    // Priority filter
    if (priorityFilter !== 'ALL' && q.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const matchId = q.id.toLowerCase().includes(search);
      const matchCase = q.caseId.toLowerCase().includes(search);
      const matchSubject = q.subject.toLowerCase().includes(search);
      const matchBuilder = q.builderName.toLowerCase().includes(search);
      const matchProject = q.projectName.toLowerCase().includes(search);
      const matchRole = q.assignedToRole.toLowerCase().includes(search);
      return matchId || matchCase || matchSubject || matchBuilder || matchProject || matchRole;
    }

    return true;
  });

  const handleOpenDetail = (q: APFQuery) => {
    setSelectedQuery(q);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case 'INPUT_REQUIRED':
      case 'OPEN':
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            NEED INPUT
          </span>
        );
      case 'INPUT_RECEIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
            INPUT RECEIVED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            UNDER REVIEW
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            CLOSED
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

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-8">
      {/* Top Breadcrumb & Page Navigation Bar with Mandatory Back Button */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="h-3.5 w-px bg-slate-300" />
          <nav className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              Home
            </button>
            <span className="text-slate-400">/</span>
            <span className="bg-[#0c3148] text-white px-2 py-0.5 rounded font-semibold text-[11px] shadow-2xs">
              Query & Communication Tray
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRaiseModalOpen(true)}
            className="px-3 py-1.5 rounded-md bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>+ Raise New Query</span>
          </button>
        </div>
      </div>

      {/* Enterprise Communication Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        <div
          onClick={() => setActiveTab('MY_PENDING')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'MY_PENDING'
              ? 'bg-[#0c3148] text-white border-[#0c3148]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'MY_PENDING' ? 'text-amber-300' : 'text-amber-800'}`}>
              Need Input
            </span>
            <Clock className={`w-3.5 h-3.5 ${activeTab === 'MY_PENDING' ? 'text-amber-300' : 'text-amber-600'}`} />
          </div>
          <div className={`text-xl font-bold mt-0.5 ${activeTab === 'MY_PENDING' ? 'text-amber-300' : 'text-amber-600'}`}>
            {counts.needInput}
          </div>
          <span className={`text-[10px] ${activeTab === 'MY_PENDING' ? 'text-slate-300' : 'text-slate-500'}`}>
            Assigned to me
          </span>
        </div>

        <div
          onClick={() => setActiveTab('INPUT_RECEIVED')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'INPUT_RECEIVED'
              ? 'bg-[#0c3148] text-white border-[#0c3148]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'INPUT_RECEIVED' ? 'text-sky-300' : 'text-sky-800'}`}>
              Input Received
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'INPUT_RECEIVED' ? 'text-sky-300' : 'text-sky-600'}`} />
          </div>
          <div className={`text-xl font-bold mt-0.5 ${activeTab === 'INPUT_RECEIVED' ? 'text-sky-300' : 'text-sky-600'}`}>
            {counts.inputReceived}
          </div>
          <span className={`text-[10px] ${activeTab === 'INPUT_RECEIVED' ? 'text-slate-300' : 'text-slate-500'}`}>
            Ready to review
          </span>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'ALL'
              ? 'bg-[#0c3148] text-white border-[#0c3148]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-600'}`}>
              Open Queries
            </span>
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold mt-0.5">{counts.openQueries}</div>
          <span className={`text-[10px] ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            All active cases
          </span>
        </div>

        <div
          onClick={() => setActiveTab('RAISED_BY_ME')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'RAISED_BY_ME'
              ? 'bg-[#0c3148] text-white border-[#0c3148]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'RAISED_BY_ME' ? 'text-indigo-300' : 'text-indigo-800'}`}>
              Raised by Me
            </span>
            <Send className={`w-3.5 h-3.5 ${activeTab === 'RAISED_BY_ME' ? 'text-indigo-300' : 'text-indigo-600'}`} />
          </div>
          <div className={`text-xl font-bold mt-0.5 ${activeTab === 'RAISED_BY_ME' ? 'text-indigo-300' : 'text-indigo-600'}`}>
            {counts.queriesRaisedByMe}
          </div>
          <span className={`text-[10px] ${activeTab === 'RAISED_BY_ME' ? 'text-slate-300' : 'text-slate-500'}`}>
            Outbound tickets
          </span>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Overdue
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{counts.overdueQueries}</div>
          <span className="text-[10px] text-slate-500">Breached SLA TAT</span>
        </div>

        <div
          onClick={() => setActiveTab('CLOSED')}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'CLOSED'
              ? 'bg-[#0c3148] text-white border-[#0c3148]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'CLOSED' ? 'text-emerald-300' : 'text-emerald-800'}`}>
              Closed
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'CLOSED' ? 'text-emerald-300' : 'text-emerald-600'}`} />
          </div>
          <div className={`text-xl font-bold mt-0.5 ${activeTab === 'CLOSED' ? 'text-emerald-300' : 'text-emerald-600'}`}>
            {queries.filter((q) => q.status === 'CLOSED').length}
          </div>
          <span className={`text-[10px] ${activeTab === 'CLOSED' ? 'text-slate-300' : 'text-slate-500'}`}>
            Audit archived
          </span>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Sub-tabs header */}
        <div className="p-2.5 px-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('MY_PENDING')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'MY_PENDING'
                  ? 'bg-[#0c3148] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>My Pending</span>
              {counts.needInput > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black">
                  {counts.needInput}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('INPUT_RECEIVED')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'INPUT_RECEIVED'
                  ? 'bg-[#0c3148] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Input Received</span>
              {counts.inputReceived > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-400 text-slate-900 text-[9px] font-black">
                  {counts.inputReceived}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('RAISED_BY_ME')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'RAISED_BY_ME'
                  ? 'bg-[#0c3148] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Raised by Me ({counts.queriesRaisedByMe})
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-[#0c3148] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All Case Queries ({counts.openQueries})
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'CLOSED'
                  ? 'bg-[#0c3148] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Closed ({queries.filter((q) => q.status === 'CLOSED').length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1 px-2 text-xs rounded-md border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Valuation">Valuation</option>
              <option value="Exposure">Exposure</option>
              <option value="Technical">Technical</option>
              <option value="Legal">Legal</option>
              <option value="Builder Data">Builder Data</option>
              <option value="Project Data">Project Data</option>
              <option value="Documents">Documents</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1 px-2 text-xs rounded-md border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>

            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table of Queries */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Query ID</th>
                <th className="py-2 px-3">Case & Project</th>
                <th className="py-2 px-3">From → To</th>
                <th className="py-2 px-3">Category & Subject</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">SLA Due</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No queries found in this view.</p>
                    <p className="text-[11px]">
                      Use the "+ Raise New Query" button or switch tabs to view other communication logs.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQueries.map((q) => {
                  const isAssignedToMe =
                    q.assignedToRole === currentUser.role || q.assignedToUserId === currentUser.id;

                  return (
                    <tr
                      key={q.id}
                      onClick={() => handleOpenDetail(q)}
                      className={`hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                        isAssignedToMe && q.status === 'INPUT_REQUIRED' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{q.id}</span>
                          {q.isBlocking && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Blocking Query" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {q.createdAt.substring(5, 16)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sky-800 flex items-center gap-1">
                          <span>{q.caseId}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 font-medium truncate max-w-xs">
                          {q.projectName}
                        </div>
                        <div className="text-[10px] text-slate-400">{q.builderName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-semibold text-slate-800">
                          {q.raisedByUserName}
                          <span className="text-[10px] text-slate-500 font-mono ml-1">
                            ({q.raisedByUserRole})
                          </span>
                        </div>
                        <div className="text-[10px] text-sky-700 font-medium">
                          → {q.assignedToRole}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          {q.category}
                        </div>
                        <div className="font-semibold text-slate-900 truncate" title={q.subject}>
                          {q.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {q.queryText}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-900'
                                : q.priority === 'High'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {q.priority}
                          </span>
                          {q.isBlocking && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                              LOCK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(q.status)}</td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{q.dueDate}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{q.slaHours}h SLA</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(q);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                            isAssignedToMe && q.status === 'INPUT_REQUIRED'
                              ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isAssignedToMe && q.status === 'INPUT_REQUIRED' ? (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Submit Input</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>View Thread</span>
                            </>
                          )}
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

      {/* Query Detail Modal */}
      {selectedQuery && (
        <QueryDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedQuery(null);
          }}
          query={selectedQuery}
          currentUser={currentUser}
          onQueryUpdated={() => {
            setQueries(queryStore.getAllQueries());
          }}
        />
      )}

      {/* Raise Query Modal */}
      {isRaiseModalOpen && (
        <RaiseQueryModal
          isOpen={isRaiseModalOpen}
          onClose={() => setIsRaiseModalOpen(false)}
          currentUser={currentUser}
          caseId="APF-2026-0001"
          builderId="BLD-PUN-001"
          builderName="Kolte-Patil Developers Ltd"
          projectId="PRJ-PUN-001"
          projectName="Life Republic Phase 1"
          onQueryCreated={(qid) => {
            setQueries(queryStore.getAllQueries());
            const created = queryStore.getQueryById(qid);
            if (created) {
              setSelectedQuery(created);
              setIsDetailModalOpen(true);
            }
          }}
        />
      )}
    </div>
  );
};
