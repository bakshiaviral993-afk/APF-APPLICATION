import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen25_AIUnderwriter: React.FC = () => {
  const { setActiveEvidence, addAuditLog, setCurrentScreen } = useAPF();
  const [draftAccepted, setDraftAccepted] = useState(false);

  const findings = [
    {
      severity: 'MEDIUM',
      severityColor: 'bg-[#fef3e0] text-[#b06000]',
      title: 'Construction progress behind plan',
      evidence: 'Actual 76% vs planned 82%; 2 consecutive delayed milestones.',
      action: 'Increase technical inspection frequency; retain disbursement control.',
      evidencePayload: {
        sourceType: 'Site Inspection Report' as const,
        sourceId: 'INSP-2026-09-02',
        documentTitle: 'Technical Due Diligence Report (Lender Engineer)',
        pageOrSection: 'Milestone Progress Matrix Section 4.2',
        asOfDate: '2026-09-02',
        extractedField: 'Physical: 76.0% | Certified Milestone: 82.0%',
        snippet: 'Tower A and Tower B experiencing 60-day delay in MEP installation and external plastering work.',
        confidenceScore: 0.96,
      },
    },
    {
      severity: 'HIGH',
      severityColor: 'bg-[#fce8e6] text-[#c53030]',
      title: 'Exposure reconciliation exception',
      evidence: '₹42 Cr NBFC facility appears in bureau/MCA but not borrower declaration.',
      action: 'Obtain sanction letter and updated debt schedule before committee.',
      evidencePayload: {
        sourceType: 'MCA Charge Filing' as const,
        sourceId: 'MCA-CHG-NBFC-42',
        documentTitle: 'CRILC & ROC Registry Charge Verification',
        pageOrSection: 'Secured Borrowings Table',
        asOfDate: '2026-09-05',
        extractedField: 'Discovered Borrowing: ₹42.0 Cr from NBFC X',
        snippet: 'Facility sanctioned against escrow receivables of Alpha Towers without bank parity consent.',
        confidenceScore: 0.99,
      },
    },
    {
      severity: 'LOW',
      severityColor: 'bg-[#e6f4ea] text-[#137333]',
      title: 'Valuation remains within market range',
      evidence: 'Approved rate ₹9,850/sq.ft vs comparable median ₹10,120/sq.ft.',
      action: 'No additional valuation condition proposed.',
      evidencePayload: {
        sourceType: 'Site Inspection Report' as const,
        sourceId: 'VAL-PUNE-2026-88',
        documentTitle: 'Independent Chartered Surveyor Valuation',
        pageOrSection: 'Comparative Sales Analysis p. 14',
        asOfDate: '2026-08-20',
        extractedField: 'Micro-market benchmark: ₹10,120/sq.ft',
        snippet: 'Current developer pricing is priced at a conservative 2.7% discount to nearby grade-A completions.',
        confidenceScore: 0.94,
      },
    },
    {
      severity: 'MEDIUM',
      severityColor: 'bg-[#fef3e0] text-[#b06000]',
      title: 'Group concentration approaching threshold',
      evidence: 'Post-approval group utilisation estimated at 84.2% of internal limit.',
      action: 'Route to zonal credit committee and add monitoring condition.',
      evidencePayload: {
        sourceType: 'Audited Financial Statement' as const,
        sourceId: 'RP-EXP-2026-01',
        documentTitle: 'Large Exposure Framework Group Limit Policy',
        pageOrSection: 'Real Estate Developer Exposure Cap',
        asOfDate: '2026-09-01',
        extractedField: 'Group Exposure: ₹505 Cr / ₹600 Cr Limit (84.2%)',
        snippet: 'Exposure exceeding 80% threshold mandates Zonal Committee sanction and fortnightly monitoring.',
        confidenceScore: 0.97,
      },
    },
  ];

  const handleAcceptDraft = () => {
    addAuditLog('ACCEPT_AI_UNDERWRITER_DRAFT', 'Case APF/MH/PUNE/2026/000145', 'Draft accepted and forwarded to Committee Cockpit');
    setDraftAccepted(true);
    setTimeout(() => {
      setCurrentScreen('26');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">AI Underwriter</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Evidence-backed underwriting observations; human decision remains authoritative
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#102a43]">Case APF/MH/PUNE/2026/000145</h2>
          <p className="text-xs text-[#627d98] mt-1 font-mono">
            Builder: ABC Developers | Project: Alpha Towers | Model run: 18 Sep 2026 11:42
          </p>
        </div>
        <div>
          <span className="border border-[#19638c] text-[#19638c] px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white inline-block">
            Evidence coverage 94%
          </span>
        </div>
      </div>

      {/* Middle Row: AI Findings (Left) & Underwriting Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: AI Findings */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">AI Findings</h3>
          <div className="space-y-4">
            {findings.map((finding, idx) => (
              <div
                key={idx}
                className="border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc]/50 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${finding.severityColor}`}>
                      {finding.severity}
                    </span>
                    <h4 className="text-xs font-bold text-[#102a43]">{finding.title}</h4>
                  </div>
                  <button
                    onClick={() => setActiveEvidence(finding.evidencePayload)}
                    className="text-[11px] text-[#19638c] hover:underline font-medium"
                  >
                    View Evidence
                  </button>
                </div>

                <div className="mt-2.5 text-xs space-y-1">
                  <p className="text-[#334155]">
                    <span className="font-semibold text-[#102a43]">Evidence: </span>
                    {finding.evidence}
                  </p>
                  <p className="text-[#627d98]">
                    <span className="font-semibold text-[#102a43]">Action: </span>
                    {finding.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Underwriting Summary */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102a43] mb-4">Underwriting Summary</h3>

            {/* Scores Table */}
            <div className="divide-y divide-[#edf2f7] text-xs">
              <div className="py-2.5 flex justify-between items-center first:pt-0">
                <span className="text-[#627d98] font-medium">Builder</span>
                <span className="text-[#137333] font-bold">82 / 100</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Legal</span>
                <span className="text-[#137333] font-bold">91 / 100</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Technical</span>
                <span className="text-[#b7791f] font-bold">78 / 100</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Valuation</span>
                <span className="text-[#137333] font-bold">84 / 100</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Financial</span>
                <span className="text-[#b7791f] font-bold">71 / 100</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Exposure</span>
                <span className="text-[#b7791f] font-bold">68 / 100</span>
              </div>
            </div>

            {/* Overall Risk Band */}
            <div className="my-4 pt-3 border-t border-[#edf2f7] flex justify-between items-center text-xs">
              <span className="text-[#627d98] font-medium">Overall Risk Band</span>
              <span className="text-[#b06000] font-bold">MEDIUM</span>
            </div>

            {/* Suggested Conditions */}
            <div className="mt-4 pt-3 border-t border-[#edf2f7]">
              <p className="text-xs font-bold text-[#102a43] mb-2">Suggested committee conditions:</p>
              <ul className="space-y-1.5 text-xs text-[#334155]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#19638c] font-bold">•</span>
                  <span>Resolve external debt variance</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#19638c] font-bold">•</span>
                  <span>Monthly construction monitoring</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#19638c] font-bold">•</span>
                  <span>Cap exposure at approved group limit</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#edf2f7] flex items-center gap-3">
            <button
              onClick={handleAcceptDraft}
              className="bg-[#288049] hover:bg-[#1e6337] text-white px-5 py-2 rounded-md text-xs font-medium transition-colors shadow-sm"
            >
              {draftAccepted ? 'Forwarded ✓' : 'Accept Draft'}
            </button>
            <button
              onClick={() => setCurrentScreen('26')}
              className="border border-[#cbd5e1] text-[#334155] hover:bg-slate-50 px-5 py-2 rounded-md text-xs font-medium transition-colors"
            >
              Edit / Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
