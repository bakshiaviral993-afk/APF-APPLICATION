import React, { useState, useEffect } from 'react';
import { apfStore } from '../../services/apfStore';
import { queryStore } from '../../services/queryStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Search,
  FolderPlus,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface MyCasesPageProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase: () => void;
  onBack: () => void;
}

export const MyCasesPage: React.FC<MyCasesPageProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
  onBack,
}) => {
  const [cases, setCases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  useEffect(() => {
    const unsub = apfStore.subscribe(() => {
      setCases(apfStore.getAllCases());
    });
    return unsub;
  }, []);

  const filteredCases = cases.filter((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const projName = proj?.projectName || '';
    const bldName = bld?.legalName || '';

    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || c.currentStatus === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'SENT_TO_LOS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Sent to LOS</span>;
      case 'VALUATION_IN_PROGRESS':
      case 'ASSIGNED_TO_VALUER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">Valuation In Progress</span>;
      case 'VALUATION_SUBMITTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Valuation Submitted</span>;
      case 'COM_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">COM Review</span>;
      case 'VALUATION_REWORK':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Rework</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="My APF Cases"
        pageTitle="APF Underwriting Cases Queue"
        subtitle="End-to-end docket lifecycle tracking • Valuation, Legal & Multi-source Exposure"
        breadcrumbs={[{ label: 'Workspace', onClick: onBack }, { label: 'My APF Cases' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          currentUser.role === 'CPA' && (
            <button
              type="button"
              onClick={onInitiateNewCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Initiate APF</span>
            </button>
          )
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Dockets</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{cases.length}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Valuation Queue</div>
          <div className="text-xl font-bold text-amber-900 mt-1">
            {cases.filter((c) => c.currentStatus.includes('VALU')).length}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700">COM Review</div>
          <div className="text-xl font-bold text-purple-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'COM_REVIEW').length}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Approved</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'SENT_TO_LOS').length}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700">Sent to LOS</div>
          <div className="text-xl font-bold text-indigo-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'SENT_TO_LOS').length}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700">Rework Needed</div>
          <div className="text-xl font-bold text-rose-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'VALUATION_REWORK').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Case ID, Builder, Project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Cases' },
            { id: 'INITIATED', label: 'Initiated' },
            { id: 'ASSIGNED_TO_VALUER', label: 'Valuation' },
            { id: 'COM_REVIEW', label: 'COM Review' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'SENT_TO_LOS', label: 'LOS Dispatched' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStageFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                stageFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Builder</th>
                <th className="py-2.5 px-3">Project & Tower</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">SLA Due</th>
                <th className="py-2.5 px-3">Query Status</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCases.map((c) => {
                const proj = getProjectById(c.projectId);
                const bld = getBuilderById(c.builderId);
                const twr = getTowerById(c.selectedTowerIds[0]);

                const queryCount = queryStore.getQueriesForCase(c.id).length;
                const hasPendingQuery = queryStore.getQueriesForCase(c.id).some((q) => q.status === 'INPUT_REQUIRED');

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {c.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {bld?.legalName || 'Builder'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{proj?.projectName || 'Project'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{twr?.towerName || 'Tower'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {getStageBadge(c.currentStatus)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {c.currentOwnerRole}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.slaDueDate ? c.slaDueDate.substring(0, 10) : '48h'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {hasPendingQuery ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Input Needed
                        </span>
                      ) : queryCount > 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {queryCount} Queries
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {c.createdAt ? c.createdAt.substring(0, 10) : 'Today'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenCase(c.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                    No cases match the selected filters or query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
