import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen26_CommitteeCockpit: React.FC = () => {
  const { addAuditLog, setCommitteeDecision, committeeDecision, setCurrentScreen } = useAPF();
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  const scores = [
    { label: 'Builder', score: 82, color: 'bg-[#288049]' },
    { label: 'Legal', score: 91, color: 'bg-[#288049]' },
    { label: 'Technical', score: 78, color: 'bg-[#c88a1b]' },
    { label: 'Valuation', score: 84, color: 'bg-[#288049]' },
    { label: 'Financial', score: 71, color: 'bg-[#c88a1b]' },
    { label: 'Exposure', score: 68, color: 'bg-[#c88a1b]' },
  ];

  const handleAction = (decision: 'Approved' | 'Approved with Conditions' | 'Deferred' | 'Rejected') => {
    setCommitteeDecision({
      status: decision === 'Approved' ? 'APPROVED' : decision === 'Approved with Conditions' ? 'CONDITIONAL_APPROVAL' : decision === 'Deferred' ? 'DEFERRED' : 'REJECTED',
      decidedBy: 'Zonal Credit Committee (Maker: RM-4102 | Checker: ZCC-Head-09)',
      decidedAt: new Date().toISOString(),
      comments: `Committee consensus: ${decision} with mandatory maker-checker signoff.`,
      conditionsAcknowledged: true,
    });

    addAuditLog('COMMITTEE_VOTE', 'Case APF/MH/PUNE/2026/000145', `Voted: ${decision}`);
    setDecisionFeedback(`Decision recorded: ${decision}`);
    setTimeout(() => setDecisionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Committee Decision Cockpit</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            All material facts, exceptions, exposure impact and conditions on one screen
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <h2 className="text-lg font-bold text-[#102a43]">Alpha Towers - APF Approval</h2>
        <p className="text-xs text-[#627d98] mt-1 font-mono">
          Requested APF limit ₹85 Cr | Group exposure post-approval ₹505 Cr | Internal group limit ₹600 Cr
        </p>
      </div>

      {/* 6 Scores Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {scores.map((item) => (
          <div key={item.label} className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <span className="text-xs text-[#627d98] font-medium">{item.label}</span>
            <div className="my-2">
              <span className="text-2xl font-bold text-[#102a43]">{item.score}</span>
            </div>
            <div className={`w-full h-1.5 rounded-full ${item.color}`} />
          </div>
        ))}
      </div>

      {/* Middle Row: Decision Summary & Material Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Summary */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Decision Summary</h3>
          <div className="divide-y divide-[#edf2f7] text-xs">
            <div className="py-2.5 flex justify-between items-center first:pt-0">
              <span className="text-[#627d98] font-medium">Risk Band</span>
              <span className="text-[#b06000] font-bold">MEDIUM</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#627d98] font-medium">Policy Exceptions</span>
              <span className="text-[#102a43] font-bold">2</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#627d98] font-medium">Open Conditions</span>
              <span className="text-[#102a43] font-bold">3</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#627d98] font-medium">Exposure Utilisation</span>
              <span className="text-[#102a43] font-bold">84.2%</span>
            </div>
            <div className="py-2.5 flex justify-between items-center last:pb-0">
              <span className="text-[#627d98] font-medium">Approval Authority</span>
              <span className="text-[#102a43] font-bold">Zonal Credit Committee</span>
            </div>
          </div>
        </div>

        {/* Material Exceptions */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Material Exceptions</h3>
          <div className="space-y-3.5 text-xs">
            {/* Red dot */}
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c53030] mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-[#102a43]">Exposure variance</h4>
                <p className="text-[#627d98] mt-0.5">₹42 Cr external facility requires reconciliation</p>
              </div>
            </div>

            {/* Amber dot 1 */}
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c88a1b] mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-[#102a43]">Construction delay</h4>
                <p className="text-[#627d98] mt-0.5">6 pp behind approved plan</p>
              </div>
            </div>

            {/* Amber dot 2 */}
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c88a1b] mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-[#102a43]">Legal condition</h4>
                <p className="text-[#627d98] mt-0.5">Updated NOC required before next disbursement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Committee Action */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <h3 className="text-sm font-bold text-[#102a43] mb-4">Committee Action</h3>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleAction('Approved')}
            className="bg-[#288049] hover:bg-[#1e6337] text-white px-7 py-2.5 rounded-lg font-medium text-xs transition-colors shadow-sm"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction('Approved with Conditions')}
            className="bg-[#19638c] hover:bg-[#145070] text-white px-7 py-2.5 rounded-lg font-medium text-xs transition-colors shadow-sm"
          >
            Approve with Conditions
          </button>
          <button
            onClick={() => handleAction('Deferred')}
            className="bg-[#c88a1b] hover:bg-[#a67115] text-white px-7 py-2.5 rounded-lg font-medium text-xs transition-colors shadow-sm"
          >
            Defer
          </button>
          <button
            onClick={() => handleAction('Rejected')}
            className="bg-[#c53b47] hover:bg-[#a52833] text-white px-7 py-2.5 rounded-lg font-medium text-xs transition-colors shadow-sm"
          >
            Reject
          </button>
          <button
            onClick={() => setCurrentScreen('flow')}
            className="bg-[#0c3148] hover:bg-[#1a4a66] text-white px-5 py-2.5 rounded-lg font-medium text-xs transition-colors shadow-sm ml-auto flex items-center gap-1.5"
          >
            <span>Proceed to Send to LOS →</span>
          </button>
        </div>

        {decisionFeedback && (
          <div className="mt-3 p-2 bg-[#e6f4ea] text-[#137333] text-xs font-semibold rounded-md inline-block animate-fade-in">
            ✓ {decisionFeedback}
          </div>
        )}

        <p className="text-[11px] text-[#627d98] mt-4">
          Mandatory: committee note + maker-checker confirmation + unresolved exception acknowledgement.
        </p>
      </div>
    </div>
  );
};
