import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Clock,
  Search,
  ArrowRight,
} from 'lucide-react';
import { LegalDueDiligenceView } from './LegalDueDiligenceView';

interface LegalLandingViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onNavigateToExposure?: () => void;
  onNavigateToQueries?: () => void;
}

export const LegalLandingView: React.FC<LegalLandingViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
  onNavigateToExposure,
  onNavigateToQueries,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CLEAR' | 'CONDITIONAL' | 'IN_SCRUTINY'>('ALL');
  const [search, setSearch] = useState('');

  const activeCase = selectedCaseId ? apfStore.getCaseById(selectedCaseId) : null;

  const filteredCases = cases.filter((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const projName = proj?.projectName || '';
    const bldName = bld?.legalName || '';

    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase()) ||
      bldName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (selectedCaseId && activeCase) {
    const proj = getProjectById(activeCase.projectId);

    return (
      <div className="space-y-4 max-w-7xl mx-auto pb-12">
        <PageHeaderNav
          moduleName="Legal Due Diligence"
          pageTitle={`Legal Due Diligence Docket: ${activeCase.id}`}
          subtitle={`${proj?.projectName || 'Project'} • Empanelled Advocate Scrutiny & 30-Year Title Search`}
          breadcrumbs={[
            { label: 'Underwriting', onClick: () => setSelectedCaseId(null) },
            { label: 'Legal Due Diligence', onClick: () => setSelectedCaseId(null) },
            { label: activeCase.id },
          ]}
          onBack={() => setSelectedCaseId(null)}
          onGoHome={onBack}
        />

        <LegalDueDiligenceView
          caseId={selectedCaseId}
          currentUser={currentUser}
          onRaiseQuery={() => onNavigateToQueries?.()}
          onNavigateToExposure={() => onNavigateToExposure?.()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Legal Due Diligence"
        pageTitle="Legal Due Diligence & Title Scrutiny Desk"
        subtitle="30-year flow of title scrutiny • MahaRERA compliance • Encumbrance search • Advocate panel review"
        breadcrumbs={[{ label: 'Underwriting', onClick: onBack }, { label: 'Legal Due Diligence' }]}
        onBack={onBack}
        onGoHome={onBack}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Legal Dockets</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{cases.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Clear Title Opinion</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">2</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Conditional Clear</div>
          <div className="text-xl font-bold text-amber-900 mt-1">1</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700">Active Search / Scrutiny</div>
          <div className="text-xl font-bold text-sky-900 mt-1">1</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700">Open Legal Queries</div>
          <div className="text-xl font-bold text-rose-900 mt-1">2</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search legal docket by case, advocate, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'CLEAR', 'CONDITIONAL', 'IN_SCRUTINY'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Dockets' : f === 'CLEAR' ? 'Clear Title' : f === 'CONDITIONAL' ? 'Conditional' : 'In Scrutiny'}
            </button>
          ))}
        </div>
      </div>

      {/* Workload Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Docket ID</th>
                <th className="py-2.5 px-3">Project & Builder</th>
                <th className="py-2.5 px-3">Assigned Legal Firm / Advocate</th>
                <th className="py-2.5 px-3">Opinion Status</th>
                <th className="py-2.5 px-3">Encumbrance / Charges</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3 text-right">Legal Scrutiny</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const proj = getProjectById(c.projectId);
                const bld = getBuilderById(c.builderId);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{proj?.projectName || 'Project'}</div>
                      <div className="text-[11px] text-slate-500">{bld?.legalName || 'Builder'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      Dua Associates & Partners
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        CLEAR_WITH_CONDITIONS
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      CERSAI Verified (No adverse charge)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.slaDueDate ? c.slaDueDate.substring(0, 10) : '48h'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCaseId(c.id)}
                        className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Open 12-Section Scrutiny</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
