import React from 'react';
import { useAPF } from '../../context/APFContext';
import { DollarSign, TrendingDown, Sliders, ChevronRight } from 'lucide-react';

export const Screen22_FinancialAssessment: React.FC = () => {
  const { setCurrentScreen, selectedProject } = useAPF();

  const stressScenarios = [
    { scenario: 'Base Case (Current)', salesPrice: '₹18,500/sq.ft', salesVelocity: '18 units/mo', peakDeficit: '₹14.2 Cr', escrowSurplus: '₹64.5 Cr', viability: 'Strong' },
    { scenario: 'Stress Scenario 1: Sales Drop 25%', salesPrice: '₹18,500/sq.ft', salesVelocity: '13 units/mo', peakDeficit: '₹28.4 Cr', escrowSurplus: '₹41.0 Cr', viability: 'Sufficient' },
    { scenario: 'Stress Scenario 2: Price Drop 10% + Cost +15%', salesPrice: '₹16,650/sq.ft', salesVelocity: '14 units/mo', peakDeficit: '₹44.8 Cr', escrowSurplus: '₹18.2 Cr', viability: 'Borderline' },
    { scenario: 'Severe Stress: 12-Month Prolonged Halt', salesPrice: '₹16,500/sq.ft', salesVelocity: '8 units/mo', peakDeficit: '₹68.0 Cr', escrowSurplus: '₹2.1 Cr', viability: 'Deficit Risk' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Project Financial Viability & Cash Flow Stress Test</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Dynamic DCF Engine
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Quarter-by-quarter project cash inflows from receivables vs construction outflows and debt servicing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('23')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Exposure Engine & Limits (Screen 23) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* 4 Inflow/Outflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Total Project Inflows</span>
          <div className="text-2xl font-bold text-[#137333]">₹462.5 Cr</div>
          <span className="text-[11px] text-[#627d98]">Sold + Unsold Realization</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Total Construction Outflows</span>
          <div className="text-2xl font-bold text-[#102a43]">₹320.0 Cr</div>
          <span className="text-[11px] text-[#627d98]">Civil + MEP + Finishing</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Net Project Cash Surplus</span>
          <div className="text-2xl font-bold text-[#137333]">₹142.5 Cr</div>
          <span className="text-[11px] text-[#137333] font-semibold">Positive Equity Buffer</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Project DSCR</span>
          <div className="text-2xl font-bold text-[#19638c]">1.65x</div>
          <span className="text-[11px] text-[#627d98]">Comfortably exceeds 1.25x</span>
        </div>
      </div>

      {/* Sensitivity Scenarios Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Sensitivity & Stress Testing Scenarios</h3>
          <span className="text-xs text-[#627d98]">RBI Housing Finance Stress Guidelines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Stress Simulation Case</th>
                <th className="py-3 px-4">Sales Realization</th>
                <th className="py-3 px-4">Sales Velocity</th>
                <th className="py-3 px-4">Peak Cash Deficit</th>
                <th className="py-3 px-4">Projected Escrow Buffer</th>
                <th className="py-3 px-4 text-right">Project Viability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {stressScenarios.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#102a43]">{s.scenario}</td>
                  <td className="py-3.5 px-4 font-medium">{s.salesPrice}</td>
                  <td className="py-3.5 px-4">{s.salesVelocity}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#c5221f]">{s.peakDeficit}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#137333]">{s.escrowSurplus}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        s.viability === 'Strong'
                          ? 'bg-[#e6f4ea] text-[#137333]'
                          : s.viability === 'Sufficient'
                          ? 'bg-[#e8f1f5] text-[#19638c]'
                          : s.viability === 'Borderline'
                          ? 'bg-[#fef7e0] text-[#b06000]'
                          : 'bg-[#fce8e6] text-[#c5221f]'
                      }`}
                    >
                      {s.viability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
