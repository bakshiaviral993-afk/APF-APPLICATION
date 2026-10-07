import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Plus,
  FileCheck,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface ConditionsRegisterViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase?: (caseId: string) => void;
}

interface ConditionRecord {
  id: string;
  caseId: string;
  projectName: string;
  condition: string;
  sourceModule: 'TECHNICAL' | 'LEGAL' | 'EXPOSURE' | 'CREDIT';
  owner: string;
  dueStage: 'PRE_APPROVAL' | 'PRE_DISBURSEMENT' | 'POST_DISBURSEMENT' | 'MONITORING';
  blocking: boolean;
  status: 'OPEN' | 'IN_PROGRESS' | 'SATISFIED' | 'WAIVED' | 'CLOSED';
  evidence: string;
}

const INITIAL_CONDITIONS: ConditionRecord[] = [
  {
    id: 'CND-001',
    caseId: 'APF-2026-0001',
    projectName: 'Life Republic i Towers',
    condition: 'Furnish Project Finance Lender NOC from HDFC Bank prior to individual unit disbursements',
    sourceModule: 'LEGAL',
    owner: 'CPA / Legal Desk',
    dueStage: 'PRE_DISBURSEMENT',
    blocking: true,
    status: 'OPEN',
    evidence: 'Pending builder submission of registered tripartite release letter',
  },
  {
    id: 'CND-002',
    caseId: 'APF-2026-0001',
    projectName: 'Life Republic i Towers',
    condition: 'Submit quarterly architect Form 4 certificate verifying ongoing 15th-22nd slab casting milestones',
    sourceModule: 'TECHNICAL',
    owner: 'Technical Valuer / CPA',
    dueStage: 'MONITORING',
    blocking: false,
    status: 'IN_PROGRESS',
    evidence: 'Form 4 Q3 uploaded and certified by Structural Engineer',
  },
  {
    id: 'CND-003',
    caseId: 'APF-2026-0002',
    projectName: 'Rohan Abhilasha Phase 2',
    condition: 'Reconciliation of CERSAI charge satisfaction for prior construction loan of ₹45 Cr',
    sourceModule: 'EXPOSURE',
    owner: 'COM / Credit Desk',
    dueStage: 'PRE_APPROVAL',
    blocking: true,
    status: 'SATISFIED',
    evidence: 'CERSAI Form I Satisfaction certificate ID #78491823 verified',
  },
  {
    id: 'CND-004',
    caseId: 'APF-2026-0003',
    projectName: 'VTP Pegasus Phase 1',
    condition: 'Submission of supplementary search report covering index II for survey numbers 41/2 & 41/3',
    sourceModule: 'LEGAL',
    owner: 'External Legal Advocate',
    dueStage: 'PRE_DISBURSEMENT',
    blocking: true,
    status: 'OPEN',
    evidence: 'Advocate report draft received on 02-Oct-2026',
  },
  {
    id: 'CND-005',
    caseId: 'APF-2026-0002',
    projectName: 'Rohan Abhilasha Phase 2',
    condition: 'Maintain Escrow Account Master Agreement as per MahaRERA Sec 4(2)(l)(D)',
    sourceModule: 'CREDIT',
    owner: 'Branch Operations',
    dueStage: 'MONITORING',
    blocking: false,
    status: 'CLOSED',
    evidence: 'Designated 70% project escrow opened at Bank Nariman Point Branch',
  },
];

export const ConditionsRegisterView: React.FC<ConditionsRegisterViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
}) => {
  const [conditions, setConditions] = useState<ConditionRecord[]>(INITIAL_CONDITIONS);
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'OPEN' | 'PRE_APPROVAL' | 'PRE_DISBURSEMENT' | 'POST_DISBURSEMENT' | 'MONITORING' | 'CLOSED'
  >('ALL');
  const [search, setSearch] = useState('');

  const filtered = conditions.filter((c) => {
    const matchesSearch =
      c.condition.toLowerCase().includes(search.toLowerCase()) ||
      c.caseId.toLowerCase().includes(search.toLowerCase()) ||
      c.projectName.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'OPEN') return matchesSearch && (c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    if (activeTab === 'CLOSED') return matchesSearch && (c.status === 'CLOSED' || c.status === 'SATISFIED');
    return matchesSearch && c.dueStage === activeTab;
  });

  const handleToggleStatus = (id: string) => {
    setConditions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'OPEN' ? 'SATISFIED' : 'OPEN';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Conditions Register"
        pageTitle="Enterprise APF Conditions & Covenants Register"
        subtitle="Centralized tracking of pre-approval, pre-disbursement & ongoing monitoring conditions"
        breadcrumbs={[{ label: 'Decisioning', onClick: onBack }, { label: 'Conditions Register' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => alert('Add condition modal opened.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Condition</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Conditions</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{conditions.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700">Blocking Conditions</div>
          <div className="text-xl font-bold text-rose-900 mt-1">
            {conditions.filter((c) => c.blocking && c.status === 'OPEN').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Pre-Disbursement</div>
          <div className="text-xl font-bold text-amber-900 mt-1">
            {conditions.filter((c) => c.dueStage === 'PRE_DISBURSEMENT').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700">Ongoing Monitoring</div>
          <div className="text-xl font-bold text-sky-900 mt-1">
            {conditions.filter((c) => c.dueStage === 'MONITORING').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Satisfied / Waived</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">
            {conditions.filter((c) => c.status === 'SATISFIED' || c.status === 'CLOSED').length}
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search conditions, cases, covenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'OPEN', label: 'Open' },
            { id: 'PRE_APPROVAL', label: 'Pre-Approval' },
            { id: 'PRE_DISBURSEMENT', label: 'Pre-Disbursement' },
            { id: 'POST_DISBURSEMENT', label: 'Post-Disbursement' },
            { id: 'MONITORING', label: 'Monitoring' },
            { id: 'CLOSED', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Condition & Description</th>
                <th className="py-2.5 px-3">Case / Project</th>
                <th className="py-2.5 px-3">Source Module</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Due Stage</th>
                <th className="py-2.5 px-3">Blocking</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Evidence / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-slate-900">{item.condition}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => onOpenCase?.(item.caseId)}
                      className="font-mono font-bold text-sky-700 hover:underline block text-left"
                    >
                      {item.caseId}
                    </button>
                    <span className="text-[11px] text-slate-500">{item.projectName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.sourceModule}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {item.owner}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase">
                      {item.dueStage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.blocking ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        BLOCKING
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Non-blocking</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        item.status === 'SATISFIED' || item.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    <div className="truncate max-w-xs" title={item.evidence}>
                      {item.evidence}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
