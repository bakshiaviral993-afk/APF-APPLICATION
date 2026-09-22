import React from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, UserCheck, XCircle, Clock } from 'lucide-react';
import { ExposureSourceBadge } from './ExposureSourceBadge';

export interface DecisionPackData {
  builderName: string;
  groupName: string;
  projectName: string;
  reraNumber: string;
  scopeTowers: string;
  technicalGrade: string;
  legalStatus: string;
  approvedRateSqFt: number;
  directExposureCr: number;
  groupExposureCr: number;
  groupLimitCr: number;
  projectLinkedRetailCr: number;
  pipelineExposureCr: number;
  postApprovalExposureCr: number;
  groupUtilPct: number;
  riskBand: 'Low' | 'Moderate' | 'High' | 'Critical';
  materialExceptions: string[];
  cpaRecommendation: string;
  comRecommendation: string;
}

interface DecisionPackProps {
  data: DecisionPackData;
  activeRole: string;
  currentDecision?: 'APPROVED' | 'CONDITIONAL' | 'DEFERRED' | 'REJECTED';
  onVoteDecision?: (decision: 'APPROVED' | 'CONDITIONAL' | 'DEFERRED' | 'REJECTED', notes: string) => void;
}

export const DecisionPack: React.FC<DecisionPackProps> = ({
  data,
  activeRole,
  currentDecision = 'CONDITIONAL',
  onVoteDecision,
}) => {
  const isApproverRole = activeRole === 'Approving Manager' || activeRole === 'Committee Member' || activeRole === 'Approver';

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf2f7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#102a43]">Comprehensive Credit Committee Decision Cockpit</h3>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30">
              SIMULATED POC DATA
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Holistic underwriting synthesis aggregating Technical, Legal, Valuation, Exposure, and Risk engines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              data.riskBand === 'Low'
                ? 'bg-[#e6f4ea] text-[#137333]'
                : data.riskBand === 'Moderate'
                ? 'bg-[#e8f1f5] text-[#19638c]'
                : 'bg-[#fce8e6] text-[#c5221f]'
            }`}
          >
            Risk Band: {data.riskBand}
          </span>
          <span className="px-2.5 py-1 bg-[#102a43] text-white rounded text-xs font-bold">
            Grade {data.technicalGrade}
          </span>
        </div>
      </div>

      {/* Synthesis Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Approved Rate</span>
          <span className="font-bold text-sm text-[#137333]">₹{data.approvedRateSqFt.toLocaleString()} / sq.ft</span>
        </div>
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Direct Builder Exp.</span>
          <span className="font-bold text-sm text-[#102a43]">₹{data.directExposureCr.toFixed(1)} Cr</span>
        </div>
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Project Linked Ret.</span>
          <span className="font-bold text-sm text-[#19638c]">₹{data.projectLinkedRetailCr.toFixed(1)} Cr</span>
        </div>
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Pipeline Exp.</span>
          <span className="font-bold text-sm text-[#b06000]">₹{data.pipelineExposureCr.toFixed(1)} Cr</span>
        </div>
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Post-Appr. Group</span>
          <span className="font-bold text-sm text-[#102a43]">₹{data.postApprovalExposureCr.toFixed(1)} Cr</span>
        </div>
        <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Group Cap Util.</span>
          <span className="font-bold text-sm text-[#19638c]">{data.groupUtilPct}% of ₹{data.groupLimitCr}Cr</span>
        </div>
      </div>

      {/* CPA & COM Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#102a43]">CPA Underwriting Recommendation</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f4ea] text-[#137333]">Favourable</span>
          </div>
          <p className="text-[#334e68] leading-relaxed">{data.cpaRecommendation}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#102a43]">COM Supervisory Endorsement</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1f5] text-[#19638c]">Endorsed with Covenants</span>
          </div>
          <p className="text-[#334e68] leading-relaxed">{data.comRecommendation}</p>
        </div>
      </div>

      {/* Material Exceptions */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Material Exceptions & Policy Deviations
        </span>
        <div className="space-y-1.5">
          {data.materialExceptions.map((ex, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-amber-50/50 border border-[#b06000]/30 text-xs text-[#b06000] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{ex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Committee Decision Voting Controls */}
      <div className="p-5 rounded-xl bg-[#f8fafc] border-2 border-[#19638c]/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-[#102a43]">Committee Sanction Decision</h4>
            <p className="text-xs text-[#627d98]">Maker-Checker quorum requirement: Minimum 2 of 3 voting members</p>
          </div>

          <span className="text-xs font-bold text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Quorum Reached (3 / 3 Members)
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { key: 'APPROVED', label: 'Approve Clean', color: 'bg-[#137333] text-white hover:bg-[#0f5b28]' },
            { key: 'CONDITIONAL', label: 'Approve with Conditions', color: 'bg-[#19638c] text-white hover:bg-[#145070]' },
            { key: 'DEFERRED', label: 'Defer for Clarification', color: 'bg-[#b06000] text-white hover:bg-[#8e4e00]' },
            { key: 'REJECTED', label: 'Reject APF Docket', color: 'bg-[#c5221f] text-white hover:bg-[#9e1b19]' },
          ].map((action) => (
            <button
              key={action.key}
              disabled={!isApproverRole}
              onClick={() => onVoteDecision && onVoteDecision(action.key as any, 'Formally voted in credit quorum.')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                currentDecision === action.key ? 'ring-2 ring-offset-2 ring-[#0c3148] ' + action.color : action.color
              } ${!isApproverRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {action.label}
            </button>
          ))}
        </div>

        {!isApproverRole && (
          <p className="text-[11px] text-[#627d98] italic">
            * Note: Voting buttons are disabled because active persona is {activeRole}. Switch to Approving Manager or Committee Member to submit votes.
          </p>
        )}
      </div>
    </div>
  );
};
