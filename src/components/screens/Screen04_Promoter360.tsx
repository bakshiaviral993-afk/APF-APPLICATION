import React from 'react';
import { useAPF } from '../../context/APFContext';
import { UserCheck, ShieldAlert, Building2, Briefcase, FileText, ChevronRight, ExternalLink } from 'lucide-react';

export const Screen04_Promoter360: React.FC = () => {
  const { setCurrentScreen, selectedCompany } = useAPF();

  const promoters = [
    {
      name: 'Vikramaditya Singhania',
      din: '01849201',
      pan: 'ABVPS1829K',
      role: 'Managing Director & Key Promoter',
      shareholding: '62.5%',
      cibilScore: 785,
      watchlistStatus: 'Clean / No Adverse Hits',
      directorships: [
        'ABC Developers Pvt. Ltd. (Apex Habitat)',
        'Apex Realty LLP',
        'Singhania Holdings SPV',
        'Aura Infrastructures Ltd (Resigned 2021)',
      ],
      litigationCount: 0,
      guaranteesGiven: '₹145.0 Cr Personal Guarantees',
    },
    {
      name: 'Rajeshwari Rao',
      din: '02918472',
      pan: 'AABPR9182L',
      role: 'Whole-Time Executive Director',
      shareholding: '27.5%',
      cibilScore: 762,
      watchlistStatus: 'Clean / No Adverse Hits',
      directorships: ['ABC Developers Pvt. Ltd.', 'Alpha SPV Pvt Ltd'],
      litigationCount: 0,
      guaranteesGiven: '₹65.0 Cr Personal Guarantees',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Promoter & Director 360</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              UBO & Background Verification
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Ultimate Beneficial Ownership (UBO), MCA DIN records, personal credit scores, and cross-company liability tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('05')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            View Group Hierarchy Graph →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Promoters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promoters.map((p, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf2f7] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#102a43]">{p.name}</h3>
                  <span className="text-xs text-[#627d98]">{p.role}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#e6f4ea] text-[#137333] border border-[#137333]/30 text-xs font-bold">
                CIBIL {p.cibilScore}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Director ID (DIN)</span>
                <span className="font-mono font-semibold text-[#102a43]">{p.din}</span>
              </div>
              <div>
                <span className="text-[#829ab1] block text-[10px] uppercase font-bold">PAN</span>
                <span className="font-mono font-semibold text-[#102a43]">{p.pan}</span>
              </div>
              <div>
                <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Equity Shareholding</span>
                <span className="font-bold text-[#19638c]">{p.shareholding}</span>
              </div>
              <div>
                <span className="text-[#829ab1] block text-[10px] uppercase font-bold">Watchlist / Sanctions</span>
                <span className="text-[#137333] font-semibold">{p.watchlistStatus}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#edf2f7] text-xs">
              <span className="text-[#829ab1] block text-[10px] uppercase font-bold">
                Cross-Directorships (MCA Registry)
              </span>
              <ul className="space-y-1 text-[#334e68]">
                {p.directorships.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#19638c] inline-block shrink-0" />
                    <span className="font-medium">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-1">
              <span className="text-[#627d98] block text-[11px] font-medium">Personal Guarantees Enforced</span>
              <span className="font-bold text-[#b06000]">{p.guaranteesGiven}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
