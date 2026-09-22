import React from 'react';
import { useAPF } from '../../context/APFContext';
import { PieChart, TrendingUp, ShieldCheck, MapPin, BarChart2, ChevronRight } from 'lucide-react';

export const Screen30_PortfolioIntelligence: React.FC = () => {
  const { setCurrentScreen } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Portfolio Intelligence & Exposure Analytics</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              National Aggregation
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Total Approved APF Portfolio: ₹14,850 Cr • 142 Approved Projects across 48 Builder Groups
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('01')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Return to Control Tower (Screen 01) →
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
          <span className="text-xs text-[#627d98] font-medium">Total Approved APF Footprint</span>
          <div className="text-2xl font-bold text-[#102a43]">₹14,850 Cr</div>
          <span className="text-[11px] text-[#137333] font-semibold">+8.4% YoY growth</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Retail Mortgages Funded</span>
          <div className="text-2xl font-bold text-[#137333]">₹8,920 Cr</div>
          <span className="text-[11px] text-[#627d98]">48,200 home loan units</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Portfolio Delinquency Rate</span>
          <div className="text-2xl font-bold text-[#137333]">0.94%</div>
          <span className="text-[11px] text-[#627d98]">Benchmark: 1.45%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">High Risk APFs Under Watch</span>
          <div className="text-2xl font-bold text-[#b06000]">6 Projects (4.2%)</div>
          <span className="text-[11px] text-[#b06000] font-medium">EWS surveillance active</span>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#102a43]">Micro-Market Portfolio Distribution</h3>
          <div className="space-y-3 text-xs">
            {[
              { city: 'Mumbai MMR', share: '32.5%', amount: '₹4,820 Cr', pct: 65 },
              { city: 'Bengaluru Tech Corridor', share: '24.1%', amount: '₹3,580 Cr', pct: 48 },
              { city: 'Pune IT Park West', share: '18.2%', amount: '₹2,700 Cr', pct: 36 },
              { city: 'NCR (Gurugram & Noida)', share: '15.4%', amount: '₹2,290 Cr', pct: 30 },
              { city: 'Hyderabad HITEC', share: '9.8%', amount: '₹1,460 Cr', pct: 20 },
            ].map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[#102a43]">
                  <span className="font-semibold">{m.city}</span>
                  <span className="font-mono text-[#627d98]">
                    {m.amount} ({m.share})
                  </span>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                  <div className="bg-[#19638c] h-2 rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#102a43]">Top 5 Builder Group Exposures</h3>
          <div className="space-y-3 text-xs">
            {[
              { group: 'ABC Realty Group (Apex)', limit: '₹600 Cr', drawn: '₹505 Cr', util: '84.2%' },
              { group: 'Lodha Crown Group', limit: '₹950 Cr', drawn: '₹720 Cr', util: '75.8%' },
              { group: 'Godrej Landmark Properties', limit: '₹1,200 Cr', drawn: '₹840 Cr', util: '70.0%' },
              { group: 'Prestige Estates Group', limit: '₹850 Cr', drawn: '₹680 Cr', util: '80.0%' },
              { group: 'Brigade Enterprises', limit: '₹700 Cr', drawn: '₹510 Cr', util: '72.9%' },
            ].map((g, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="font-bold text-[#102a43] block">{g.group}</span>
                  <span className="text-[11px] text-[#627d98]">Sanctioned Cap: {g.limit}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#102a43] block">{g.drawn}</span>
                  <span className="text-[11px] font-semibold text-[#19638c]">{g.util} Utilized</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
