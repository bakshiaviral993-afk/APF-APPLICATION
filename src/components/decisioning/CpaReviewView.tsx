import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { queryStore } from '../../services/queryStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  MessageSquare,
  Scale,
  FileSearch,
  DollarSign,
  ListTodo,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { RaiseQueryModal } from '../queries/RaiseQueryModal';

interface CpaReviewViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onNavigateToQueries?: () => void;
}

export const CpaReviewView: React.FC<CpaReviewViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
  onNavigateToQueries,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'APF-2026-0001');
  const [cpaNotes, setCpaNotes] = useState(
    'Technical site visit confirms Mivan slab casting up to 14th floor. 30-year title devolution verified with clear title deed. Group exposure within Board approved threshold (₹420 Cr vs ₹500 Cr limit). Recommend for Credit Operations Manager approval.'
  );
  const [showQueryModal, setShowQueryModal] = useState(false);

  const activeCase = apfStore.getCaseById(selectedCaseId) || cases[0];
  const queries = activeCase ? queryStore.getQueriesForCase(activeCase.id) : [];

  const handleReturnToValuer = () => {
    alert(`Case ${activeCase.id} returned to Technical Valuer for rate reconsideration.`);
  };

  const handleReturnToLegal = () => {
    alert(`Case ${activeCase.id} returned to Legal Firm for supplementary search confirmation.`);
  };

  const handleSubmitToCom = () => {
    if (activeCase) {
      apfStore.updateCaseStatus(activeCase.id, 'COM_REVIEW', 'CPA submitted case to Credit Operations Manager review with positive recommendation');
      alert(`Case ${activeCase.id} successfully escalated to COM Review queue!`);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="CPA Review"
        pageTitle="Central Processing Agency (CPA) Underwriting Scrutiny"
        subtitle="Cross-module reconciliation • Valuation, Legal & Exposure synthesis • COM submission pack"
        breadcrumbs={[{ label: 'Decisioning', onClick: onBack }, { label: 'CPA Review' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Active Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="h-8 px-2.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xs focus:ring-2 focus:ring-sky-500"
            >
              {cases.map((c) => {
                const p = getProjectById(c.projectId);
                const b = getBuilderById(c.builderId);
                return (
                  <option key={c.id} value={c.id}>
                    {c.id} · {p?.projectName || 'Project'} ({b?.legalName || 'Builder'})
                  </option>
                );
              })}
            </select>
          </div>
        }
      />

      {activeCase && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Synthesis Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Technical Summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">1. Technical Valuation Summary</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Grade A · Completed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Valuer Agency</span>
                  <strong className="text-slate-800">Knight Frank India</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Physical Progress</span>
                  <strong className="text-emerald-700">62.5% Complete</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Fair Market Value</span>
                  <strong className="text-slate-900">₹324.50 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Recommended APF Rate</span>
                  <strong className="text-sky-700">₹7,200 / sq.ft</strong>
                </div>
              </div>
            </div>

            {/* Legal Summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">2. Legal Due Diligence Summary</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Clear with 2 Covenants
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Legal Counsel</span>
                  <strong className="text-slate-800">Dua Associates</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Title Search Period</span>
                  <strong className="text-slate-800">30 Years (1995-2025)</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Litigation Check</span>
                  <strong className="text-emerald-700">0 Adverse Suits</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">CERSAI Status</span>
                  <strong className="text-emerald-700">Clean Search</strong>
                </div>
              </div>
            </div>

            {/* Exposure Summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">3. Exposure 360 Reconciliation</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                  Reconciled
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Group Sanctioned</span>
                  <strong className="text-slate-800">₹420.00 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Current Outstanding</span>
                  <strong className="text-slate-800">₹285.40 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Proposed Retail APF</span>
                  <strong className="text-emerald-700">₹75.00 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Post-Approval Headroom</span>
                  <strong className="text-sky-700 font-bold">₹80.00 Cr (Within Limit)</strong>
                </div>
              </div>
            </div>

            {/* Exceptions & Conditions */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">4. Open Approval Conditions & Exceptions</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  2 Pre-Disbursement Conditions
                </span>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 mt-0.5">BLOCKING</span>
                  <div>
                    <strong className="text-slate-800">Lender NOC from HDFC Bank</strong>
                    <p className="text-slate-500 text-[11px]">Builder must furnish Project Finance Lender release NOC for Tower 2 prior to individual mortgage disbursements.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-200 text-sky-900 mt-0.5">POST-SANCTION</span>
                  <div>
                    <strong className="text-slate-800">Quarterly Architect Certificate</strong>
                    <p className="text-slate-500 text-[11px]">Submission of Form 4 architect certificate for ongoing slab milestone verification.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Col: CPA Actions & Notes */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <ClipboardList className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">CPA Underwriter Decision</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CPA Recommendation Notes *</label>
                <textarea
                  rows={6}
                  value={cpaNotes}
                  onChange={(e) => setCpaNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-sans focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubmitToCom}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Submit to COM for Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQueryModal(true)}
                  className="w-full py-2 px-3 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Raise Formal Query</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleReturnToValuer}
                    className="py-1.5 px-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Return to Valuer</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReturnToLegal}
                    className="py-1.5 px-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Return to Legal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Queries for this Case */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Queries ({queries.length})</h4>
                <button
                  type="button"
                  onClick={onNavigateToQueries}
                  className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              {queries.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No open queries on this docket</div>
              ) : (
                <div className="space-y-1.5">
                  {queries.map((q) => (
                    <div key={q.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800">{q.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">To: {q.assignedToRole} · {q.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQueryModal && activeCase && (
        <RaiseQueryModal
          isOpen={showQueryModal}
          onClose={() => setShowQueryModal(false)}
          caseId={activeCase.id}
          builderId={activeCase.builderId}
          builderName={getBuilderById(activeCase.builderId)?.legalName || 'Builder'}
          projectId={activeCase.projectId}
          projectName={getProjectById(activeCase.projectId)?.projectName || 'Project'}
          currentUser={currentUser}
          onQueryCreated={() => setShowQueryModal(false)}
        />
      )}
    </div>
  );
};
