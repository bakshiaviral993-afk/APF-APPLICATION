import React from 'react';
import { useAPF } from '../../context/APFContext';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Award } from 'lucide-react';

export const Screen10_BuilderRiskScore: React.FC = () => {
  const { setCurrentScreen, selectedCompany } = useAPF();

  const scoreDrivers = [
    { factor: 'Delivery Track Record & On-Time OC', score: 18, max: 25, status: 'Satisfactory (Minor project delays)' },
    { factor: 'Promoter Standing & CIBIL Hygiene', score: 23, max: 25, status: 'Strong (Promoter score 785)' },
    { factor: 'Financial Leverage & DSCR Cover', score: 19, max: 25, status: 'Good (DSCR 1.48x, D/E 1.24x)' },
    { factor: 'Transparency & Debt Disclosure', score: 12, max: 25, status: 'Warning (Discovered ₹42 Cr undeclared loan)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Builder Composite Risk Scorecard</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20">
              Internal Credit Rating
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Entity: ABC Developers Pvt. Ltd. (Apex Habitat) • Model: Real Estate Developer Quantitative Rating (V4.2)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('11')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Proceed to Project Registration (Screen 11) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Main Scorecard Summary Box */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-[#fef7e0] border-2 border-[#b06000]/30 text-[#b06000] text-center min-w-[110px]">
            <span className="text-3xl font-black block">72</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">OUT OF 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#102a43]">Credit Risk Grade: MEDIUM (Amber)</h3>
              <span className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#486581] text-xs font-mono font-bold">
                Investment Grade (BBB+)
              </span>
            </div>
            <p className="text-xs text-[#627d98] mt-1 max-w-xl leading-relaxed">
              Acceptable counterparty risk for retail mortgage tie-ups. Sourcing sanctioned with milestone-based disbursement covenants due to transparency penalty on undeclared facility.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0 bg-[#f8fafc] p-3.5 rounded-lg border border-[#e2e8f0]">
          <span className="text-xs text-[#627d98] font-medium">Recommended APF Policy</span>
          <span className="px-3 py-1.5 rounded bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20 text-xs font-bold text-center">
            Approve with Precedent Covenants
          </span>
        </div>
      </div>

      {/* Factor Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreDrivers.map((d, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#102a43]">{d.factor}</span>
              <span className="font-mono font-bold text-[#19638c]">
                {d.score} / {d.max} pts
              </span>
            </div>
            <div className="w-full bg-[#e2e8f0] rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  d.score < 15 ? 'bg-[#c5221f]' : d.score < 20 ? 'bg-[#b06000]' : 'bg-[#137333]'
                }`}
                style={{ width: `${(d.score / d.max) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#627d98]">{d.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
