import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  MessageSquare,
  FileCheck,
  Scale,
  DollarSign,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { RaiseQueryModal } from '../queries/RaiseQueryModal';

interface ComReviewViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onNavigateToApproval?: () => void;
  onNavigateToQueries?: () => void;
}

export const ComReviewView: React.FC<ComReviewViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
  onNavigateToApproval,
  onNavigateToQueries,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'APF-2026-0001');
  const [comNotes, setComNotes] = useState(
    'Credit Operations Manager review completed. Technical progress of 62.5% is on schedule. Legal 30-year chain clear of encumbrances. Group exposure is within approved delegation. Pre-disbursement conditions are vetted and accepted. Recommending for Final Approval Cockpit.'
  );
  const [showQueryModal, setShowQueryModal] = useState(false);

  const activeCase = apfStore.getCaseById(selectedCaseId) || cases[0];

  const handleSubmitForApproval = () => {
    if (activeCase) {
      apfStore.updateCaseStatus(activeCase.id, 'APPROVED', 'COM approved docket and escalated to Committee Sanction');
      alert(`Case ${activeCase.id} successfully escalated to Approval Cockpit!`);
      if (onNavigateToApproval) onNavigateToApproval();
    }
  };

  const handleReturnToCpa = () => {
    alert(`Case ${activeCase.id} returned to CPA desk for additional verification.`);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="COM Review"
        pageTitle="Credit Operations Manager (COM) Second-Line Review"
        subtitle="Independent supervisory review • Multi-risk engine alignment • Escalation to Approval Cockpit"
        breadcrumbs={[{ label: 'Decisioning', onClick: onBack }, { label: 'COM Review' }]}
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
          {/* Left 2 Cols: Comprehensive Overview */}
          <div className="lg:col-span-2 space-y-4">
            {/* CPA Recommendation Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-700" />
                <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">CPA Desk Recommendation</h4>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed font-medium">
                "Technical site visit confirms Mivan slab casting up to 14th floor. 30-year title devolution verified with clear title deed. Group exposure within Board approved threshold. Recommend for Credit Operations Manager approval."
              </p>
              <div className="mt-2 text-[10px] text-sky-700 font-semibold">
                Submitted by CPA Underwriter · Verified with 2 Pre-Disbursement Conditions
              </div>
            </div>

            {/* Technical & Legal Synthesized Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-900">
                  <span>Technical Assessment</span>
                  <span className="text-emerald-700">Grade A</span>
                </div>
                <div>Fair Market Value: <strong className="text-slate-900">₹324.50 Cr</strong></div>
                <div>Physical Stage: <strong className="text-slate-900">62.5% Complete</strong></div>
                <div>Sanctioned APF Rate: <strong className="text-sky-700">₹7,200 / sq.ft</strong></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-900">
                  <span>Legal Due Diligence</span>
                  <span className="text-emerald-700">Clear Title</span>
                </div>
                <div>Title Search: <strong className="text-slate-900">30 Years Continuous</strong></div>
                <div>Litigation: <strong className="text-emerald-700">Clean / Zero Pending</strong></div>
                <div>MahaRERA Validity: <strong className="text-slate-900 font-mono">P52100018542</strong></div>
              </div>
            </div>

            {/* Exposure & Risk Intelligence */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Risk Intelligence & Exposure Health</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Risk Band: LOW (Score 84/100)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Direct Bank Exposure</span>
                  <strong className="text-slate-900 text-sm">₹65.00 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">External CF Consortia</span>
                  <strong className="text-slate-900 text-sm">₹220.40 Cr</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Total Group Debt</span>
                  <strong className="text-emerald-700 text-sm">₹285.40 Cr</strong>
                </div>
              </div>
            </div>

            {/* Conditions Summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Conditions Review</h4>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
                  <span>1. Builder to furnish Lender NOC from HDFC Bank prior to individual disbursements</span>
                  <span className="font-bold text-[10px] uppercase bg-amber-200 px-1.5 py-0.5 rounded">Pre-Disbursement</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
                  <span>2. Quarterly Form 4 architect certificate submission</span>
                  <span className="font-bold text-[10px] uppercase bg-slate-200 px-1.5 py-0.5 rounded">Monitoring</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: COM Action Box */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">COM Assessment & Decision</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">COM Recommendation Notes *</label>
                <textarea
                  rows={6}
                  value={comNotes}
                  onChange={(e) => setComNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-sans focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubmitForApproval}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Committee Sanction</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQueryModal(true)}
                  className="w-full py-2 px-3 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Raise Clarification Query</span>
                </button>

                <button
                  type="button"
                  onClick={handleReturnToCpa}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Return to CPA</span>
                </button>
              </div>
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
