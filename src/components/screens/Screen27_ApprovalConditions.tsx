import React from 'react';
import { useAPF } from '../../context/APFContext';
import { Award, CheckCircle2, ShieldCheck, Printer, Download, Clock } from 'lucide-react';

export const Screen27_ApprovalConditions: React.FC = () => {
  const { setCurrentScreen, selectedProject, selectedCompany, committeeDecision } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">APF Approval & Digital Sanction Certificate</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">
              Governed Certificate
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            APF Code: {selectedProject.apfCode} • Validity: 12 Months • Status: {committeeDecision?.decision || 'Approved with Conditions'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('28')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Monitoring Radar (Screen 28) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="bg-white p-8 rounded-2xl border-2 border-[#19638c]/40 shadow-md space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-[#edf2f7] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#19638c] uppercase tracking-widest block">
              NATIONAL CREDIT UNDERWRITING COMMITTEE
            </span>
            <h2 className="text-xl font-bold text-[#102a43] mt-1">Approved Project Financial (APF) Sanction Letter</h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-[#19638c] block">{selectedProject.apfCode}</span>
            <span className="text-xs text-[#627d98]">Date: 2026-09-18</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#334e68] leading-relaxed">
          <p>
            This certifies that <strong>Alpha Towers - Pune (Apex Greens)</strong>, developed by{' '}
            <strong>ABC Developers Pvt. Ltd. (Apex Habitat SPV)</strong> (MahaRERA: P52100012345), situated at Hinjawadi Phase 1, Pune, has been appraised and formally approved for retail mortgage home loan tie-ups under the bank’s builder finance underwriting program.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
          <div>
            <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Approved Sourcing Rate</span>
            <span className="font-bold text-[#102a43]">₹18,500 / sq.ft</span>
          </div>
          <div>
            <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Maximum Retail LTV</span>
            <span className="font-bold text-[#102a43]">75.0% (Strict Cap)</span>
          </div>
          <div>
            <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Designated Project Escrow</span>
            <span className="font-mono font-bold text-[#19638c]">SBI BKC #30829104812</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-[#edf2f7] pt-4">
          <h4 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">Mandatory Approval Conditions</h4>
          <ul className="text-xs space-y-1.5 text-[#334e68]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
              <span>
                <strong>Tower B Mortgages:</strong> Unit-level NOC from wholesale lender (Piramal Capital) must be on record prior to each individual retail disbursement.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
              <span>
                <strong>Disbursement Milestone:</strong> Disbursements strictly linked to independent CEAI civil engineer slab-casting milestone certificates.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
              <span>
                <strong>Quarterly RERA & Litigation Filing:</strong> Builder to furnish updated CA Certificate (Form 3) and litigation status every quarter.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
