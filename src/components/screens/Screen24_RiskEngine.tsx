import React from 'react';
import { useAPF } from '../../context/APFContext';
import { ShieldAlert, AlertOctagon, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

export const Screen24_RiskEngine: React.FC = () => {
  const { setCurrentScreen, selectedProject, selectedCompany } = useAPF();

  const hardStopRules = [
    { rule: 'RBI Wilful Defaulter / CIBIL Defaulters List', status: 'PASS', impact: 'Hard Stop (Non-negotiable)' },
    { rule: 'RERA Registration Revocation or De-registration Order', status: 'PASS', impact: 'Hard Stop (Non-negotiable)' },
    { rule: 'Insolvency / NCLT IBC Section 7/9 Petition Admitted', status: 'PASS', impact: 'Hard Stop (Non-negotiable)' },
    { rule: 'Unsatisfactory Title Search / Disputed Primary Access', status: 'PASS', impact: 'Hard Stop (30m DP Road Clear)' },
    { rule: 'Discrepancy in External Debt Disclosure > ₹5 Cr', status: 'FLAGGED', impact: 'Requires Golden Recon & Quorum (Breached)' },
    { rule: 'Construction Delay > 180 Days without RERA Extension', status: 'REVIEW', impact: 'Covenant Condition Linked (126 Days delay)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Composite Risk Engine & Hard-Stop Policy Rules</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/20">
              Policy Compliance Gateway
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Automated hard-stop gatekeeper enforcing credit policy rules before underwriting docket submission
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('25')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open AI Underwriter Workspace (Screen 25) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Rules Compliance Box */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
          <h3 className="text-sm font-bold text-[#102a43]">Hard-Stop Policy Compliance Audit</h3>
          <span className="text-xs text-[#627d98]">Policy Norm: Retail Mortgage APF Norms 2026</span>
        </div>

        <div className="space-y-3">
          {hardStopRules.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                r.status === 'FLAGGED'
                  ? 'bg-rose-50/40 border-[#c5221f]/40'
                  : r.status === 'REVIEW'
                  ? 'bg-amber-50/40 border-[#b06000]/40'
                  : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#102a43] block">{r.rule}</span>
                <span className="text-[11px] text-[#627d98]">{r.impact}</span>
              </div>

              <div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    r.status === 'PASS'
                      ? 'bg-[#e6f4ea] text-[#137333]'
                      : r.status === 'FLAGGED'
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : 'bg-[#fef7e0] text-[#b06000]'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
