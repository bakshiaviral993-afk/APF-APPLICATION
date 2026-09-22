import React from 'react';
import { useAPF } from '../../context/APFContext';
import { Coins, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

export const Screen13_ProjectFinanceExposure: React.FC = () => {
  const { setCurrentScreen, selectedProject, setActiveEvidence } = useAPF();

  const pfFacilities = [
    {
      lender: 'State Bank of India (Consortium Lead)',
      facility: 'Project Construction Term Loan',
      sanctionCr: 120.0,
      outstandingCr: 45.0,
      security: 'First charge on Land & receivables of Phase 1',
      escrowAccount: 'SBI BKC Escrow A/C #30829104812',
      discrepancy: false,
    },
    {
      lender: 'Piramal Capital & Housing Finance (NBFC X)',
      facility: 'Structured Project Loan',
      sanctionCr: 42.0,
      outstandingCr: 41.2,
      security: 'Mortgage over Tower B units 101 to 1004',
      escrowAccount: 'Axis Escrow A/C #91823001',
      discrepancy: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Project Finance Exposure & Escrow Register</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Wholesale Lender Covenants
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Project: Alpha Towers (Pune) • Total Project Debt: ₹86.2 Cr • Escrow Trapping & NOC Requirements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('14')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            View Phase / Tower Master (Screen 14) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="space-y-4">
        {pfFacilities.map((fac, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-xl border space-y-3 bg-white shadow-sm ${
              fac.discrepancy ? 'border-[#c5221f]/40 ring-1 ring-[#c5221f]/20' : 'border-[#e2e8f0]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    fac.discrepancy
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : 'bg-[#e8f1f5] text-[#19638c]'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">{fac.lender}</h3>
                  <span className="text-xs text-[#627d98]">{fac.facility}</span>
                </div>
              </div>
              {fac.discrepancy ? (
                <span className="px-2.5 py-1 rounded-md bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/30 text-xs font-bold">
                  UNDECLARED IN BORROWER DEBT SCHEDULE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 text-xs font-semibold">
                  Declared & Covenants Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#627d98] pt-1">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#829ab1]">Sanction Limit</span>
                <span className="font-bold text-[#102a43]">₹{fac.sanctionCr} Cr</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#829ab1]">Outstanding Debt</span>
                <span className="font-bold text-[#c5221f]">₹{fac.outstandingCr} Cr</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#829ab1]">Designated Escrow Account</span>
                <span className="font-mono text-[#102a43] font-medium">{fac.escrowAccount}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#829ab1]">Security Cover</span>
                <span className="text-[#334e68]">{fac.security}</span>
              </div>
            </div>

            {fac.discrepancy && (
              <div className="p-3 bg-[#fce8e6]/60 rounded-lg text-xs text-[#801412] flex items-center justify-between">
                <span>
                  <strong>Underwriting Condition:</strong> NOC and Release Deed must be executed prior to funding Tower B units.
                </span>
                <button
                  onClick={() =>
                    setActiveEvidence({
                      sourceType: 'Borrower Declaration',
                      sourceId: 'PIRAMAL-PF-42',
                      documentTitle: 'Piramal_Sanction_Letter_Alpha_Heights.pdf',
                      pageOrSection: 'Clause 7 - Covenants & Escrow',
                      asOfDate: '2024-11-22',
                      extractedField: 'Exclusive charge on Tower B units 101 to 1004',
                      snippet: 'Borrower shall not create any third-party mortgage on Tower B units without prior written consent.',
                      confidenceScore: 0.99,
                    })
                  }
                  className="text-[#c5221f] font-bold hover:underline shrink-0 ml-3"
                >
                  View Loan Agreement
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
