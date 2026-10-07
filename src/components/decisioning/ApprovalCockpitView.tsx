import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Scale,
  FileSearch,
  DollarSign,
  Cpu,
  ListTodo,
  FileText,
  Lock,
} from 'lucide-react';

interface ApprovalCockpitViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onNavigateToConditions?: () => void;
}

export const ApprovalCockpitView: React.FC<ApprovalCockpitViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
  onNavigateToConditions,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'APF-2026-0001');
  const [approvalNotes, setApprovalNotes] = useState('Approved by Credit Sanction Committee. All statutory MahaRERA clearances verified.');

  const activeCase = apfStore.getCaseById(selectedCaseId) || cases[0];

  const handleDecision = (decisionType: 'APPROVE' | 'APPROVE_CONDITIONS' | 'REJECT' | 'DEFER') => {
    if (!activeCase) return;

    if (decisionType === 'APPROVE' || decisionType === 'APPROVE_CONDITIONS') {
      apfStore.updateCaseStatus(
        activeCase.id,
        'APPROVED',
        `Sanctioned by ${currentUser.name} (${currentUser.role}): ${approvalNotes}`
      );
      alert(`Case ${activeCase.id} successfully APPROVED! Ready for LOS dispatch.`);
    } else if (decisionType === 'REJECT') {
      apfStore.updateCaseStatus(
        activeCase.id,
        'REJECTED',
        `Rejected by Approver: ${approvalNotes}`
      );
      alert(`Case ${activeCase.id} rejected and sent for rework.`);
    } else {
      alert(`Case ${activeCase.id} marked as DEFERRED pending additional risk review.`);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Approval Cockpit"
        pageTitle="Executive Sanction & Committee Cockpit"
        subtitle="Final Delegated Authority Decision • Full-Pack Synthesized Underwriting Sanction"
        breadcrumbs={[{ label: 'Decisioning', onClick: onBack }, { label: 'Approval Cockpit' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Select Docket:</span>
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
        <div className="space-y-4">
          {/* Section 1: Case Summary Header */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                  {activeCase.id}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-1">
                  {getProjectById(activeCase.projectId)?.projectName || 'Project'}
                </h2>
                <div className="text-xs text-slate-500">
                  Builder: <strong className="text-slate-800">{getBuilderById(activeCase.builderId)?.legalName || 'Builder'}</strong> · Tower: <strong className="text-slate-800">{getTowerById(activeCase.selectedTowerIds[0])?.towerName || 'Tower'}</strong> · Units Under Sanction: <strong className="text-slate-800">80</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  Current Stage: {activeCase.currentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Recommended APF Rate</span>
                <strong className="text-sky-800 text-sm">₹7,200 / sq.ft</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Project Fair Value</span>
                <strong className="text-slate-900 text-sm">₹324.50 Cr</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Title Finding</span>
                <strong className="text-emerald-700 text-sm">Clear with Conditions</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Consolidated Risk Score</span>
                <strong className="text-emerald-700 text-sm">84 / 100 (Low Risk)</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Technical, Legal, Exposure & Risk Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-100">
                <FileSearch className="w-3.5 h-3.5 text-sky-600" />
                <span>Technical Appraisal</span>
              </div>
              <div>Agency: <strong>Knight Frank</strong></div>
              <div>Stage: <strong>62.5% Complete</strong></div>
              <div>Quality Grade: <strong className="text-emerald-700">A (Superior)</strong></div>
              <div>Distressed Value: <strong>₹243.30 Cr</strong></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Legal Scrutiny</span>
              </div>
              <div>Counsel: <strong>Dua Associates</strong></div>
              <div>Search Period: <strong>30 Years</strong></div>
              <div>Litigation: <strong className="text-emerald-700">0 Suits</strong></div>
              <div>CERSAI: <strong className="text-emerald-700">Clean</strong></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-100">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exposure Position</span>
              </div>
              <div>Bank Direct: <strong>₹65.00 Cr</strong></div>
              <div>Consortium: <strong>₹220.40 Cr</strong></div>
              <div>Proposed APF: <strong>₹75.00 Cr</strong></div>
              <div>Headroom: <strong className="text-emerald-700">₹80.00 Cr</strong></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>Risk & EWS</span>
              </div>
              <div>Risk Grade: <strong className="text-emerald-700">A+</strong></div>
              <div>EWS Status: <strong className="text-emerald-700">GREEN</strong></div>
              <div>Sales Velocity: <strong>14 units/mo</strong></div>
              <div>Receivables: <strong>₹118.00 Cr</strong></div>
            </div>
          </div>

          {/* Section 3: Recommendations & Conditions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                CPA & COM Recommendations
              </h3>
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-xs text-sky-950 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>CPA Recommendation</span>
                  <span className="text-[10px] text-sky-700">VERIFIED</span>
                </div>
                <p className="text-sky-900 text-[11px]">Recommended APF Sanction at ₹7,200/sq.ft based on 14th slab completion.</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>COM Recommendation</span>
                  <span className="text-[10px] text-purple-700">ESCALATED</span>
                </div>
                <p className="text-purple-900 text-[11px]">Recommending approval subject to Lender NOC condition prior to individual retail disbursements.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Covenants & Conditions (2)
                </h3>
                <button
                  type="button"
                  onClick={onNavigateToConditions}
                  className="text-[11px] font-semibold text-sky-700 hover:underline"
                >
                  Conditions Register
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-950">
                  <div className="font-bold flex items-center justify-between">
                    <span>Lender NOC from HDFC Bank</span>
                    <span className="text-[9px] bg-amber-200 px-1.5 py-0.5 rounded font-bold">PRE-DISBURSEMENT</span>
                  </div>
                  <p className="text-[11px] text-amber-900 mt-1">Builder to submit formal NOC and tripartite release letter.</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                  <div className="font-bold flex items-center justify-between">
                    <span>Architect Form 4 Certificate</span>
                    <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded font-bold">MONITORING</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Quarterly submission of MahaRERA Form 4 certification.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Final Executive Actions */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sanction Decision & Authority Signature
            </h3>
            <textarea
              rows={2}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Enter committee resolution number, approval comments or special covenants..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => handleDecision('DEFER')}
                className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Defer Case</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('REJECT')}
                className="px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject & Rework</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('APPROVE_CONDITIONS')}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve with Conditions</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Issue APF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
