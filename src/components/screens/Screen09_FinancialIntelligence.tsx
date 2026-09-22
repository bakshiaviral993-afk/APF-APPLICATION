import React from 'react';
import { useAPF } from '../../context/APFContext';
import { TrendingUp, DollarSign, PieChart, ChevronRight, FileSpreadsheet } from 'lucide-react';

export const Screen09_FinancialIntelligence: React.FC = () => {
  const { setCurrentScreen, selectedCompany } = useAPF();

  const financialYears = [
    { year: 'FY 2025-26 (Audited)', revenue: 342.5, ebitda: 78.2, pat: 42.1, dscr: '1.48x', debtEquity: '1.24x', netWorth: 142.8 },
    { year: 'FY 2024-25 (Audited)', revenue: 295.0, ebitda: 64.0, pat: 34.5, dscr: '1.39x', debtEquity: '1.38x', netWorth: 118.2 },
    { year: 'FY 2023-24 (Audited)', revenue: 240.2, ebitda: 51.5, pat: 26.8, dscr: '1.31x', debtEquity: '1.52x', netWorth: 96.5 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Financial Intelligence & Ratios</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Audited Statements Analysis
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Entity: ABC Developers Pvt. Ltd. (Apex Habitat) • 3-Year Audited Trend • Cash flow velocity & debt coverage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('10')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            View Builder Risk Scorecard (Screen 10) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Net Worth (FY26)</span>
          <div className="text-2xl font-bold text-[#137333]">₹142.8 Cr</div>
          <span className="text-[11px] font-semibold text-[#137333]">+20.8% YoY</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Debt Service Coverage (DSCR)</span>
          <div className="text-2xl font-bold text-[#102a43]">1.48x</div>
          <span className="text-[11px] text-[#627d98]">Benchmark &gt; 1.25x</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Debt / Equity Ratio</span>
          <div className="text-2xl font-bold text-[#102a43]">1.24x</div>
          <span className="text-[11px] text-[#137333] font-medium">Deleveraging trend</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Operating Cash Flow</span>
          <div className="text-2xl font-bold text-[#137333]">₹68.4 Cr</div>
          <span className="text-[11px] text-[#137333] font-medium">Positive Liquidity</span>
        </div>
      </div>

      {/* 3-Year Audited Financial Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Audited Balance Sheet & P&L Extraction (3-Year History)</h3>
          <span className="text-xs text-[#627d98]">Auditor: BSR & Co. LLP (Statutory Auditors)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Financial Year</th>
                <th className="py-3 px-4">Revenue from Ops (₹ Cr)</th>
                <th className="py-3 px-4">EBITDA (₹ Cr)</th>
                <th className="py-3 px-4">PAT (₹ Cr)</th>
                <th className="py-3 px-4">DSCR</th>
                <th className="py-3 px-4">Debt / Equity</th>
                <th className="py-3 px-4">Tangible Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {financialYears.map((fy) => (
                <tr key={fy.year} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#102a43]">{fy.year}</td>
                  <td className="py-3.5 px-4 font-bold">₹{fy.revenue} Cr</td>
                  <td className="py-3.5 px-4 font-semibold text-[#137333]">₹{fy.ebitda} Cr</td>
                  <td className="py-3.5 px-4 font-medium">₹{fy.pat} Cr</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#19638c]">{fy.dscr}</td>
                  <td className="py-3.5 px-4 font-mono">{fy.debtEquity}</td>
                  <td className="py-3.5 px-4 font-bold text-[#137333]">₹{fy.netWorth} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
