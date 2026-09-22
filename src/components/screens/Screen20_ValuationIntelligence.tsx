import React from 'react';
import { useAPF } from '../../context/APFContext';
import { BadgePercent, TrendingUp, DollarSign, ChevronRight } from 'lucide-react';

export const Screen20_ValuationIntelligence: React.FC = () => {
  const { setCurrentScreen, selectedProject } = useAPF();

  const comparables = [
    { project: 'Apex Greens / Alpha Towers (Subject)', developer: 'Apex Habitat', rate: 18500, distance: '—', premium: 'Baseline', approved: true },
    { project: 'Runwal Bliss', developer: 'Runwal Group', rate: 19200, distance: '0.8 km', premium: '+3.7%', approved: true },
    { project: 'Lodha Aurum Grand', developer: 'Lodha Crown', rate: 19800, distance: '1.2 km', premium: '+7.0%', approved: true },
    { project: 'Godrej Platinum', developer: 'Godrej Properties', rate: 21500, distance: '2.1 km', premium: '+16.2%', approved: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Valuation Intelligence & Price Realism</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">
              Approved Base Rate
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Micro-market price benchmarking, registration circle rates (Ready Reckoner), and developer pricing realism
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('21')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Market Intelligence (Screen 21) →
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
          <span className="text-xs text-[#627d98] font-medium">Approved Base Rate</span>
          <div className="text-2xl font-bold text-[#137333]">₹18,500 / sq.ft</div>
          <span className="text-[11px] text-[#627d98]">Carpet Area basis</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Govt Ready Reckoner (Circle Rate)</span>
          <div className="text-2xl font-bold text-[#102a43]">₹14,200 / sq.ft</div>
          <span className="text-[11px] text-[#137333] font-semibold">1.30x Market Premium</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Max Sourcing Rate Allowed</span>
          <div className="text-2xl font-bold text-[#19638c]">₹19,800 / sq.ft</div>
          <span className="text-[11px] text-[#627d98]">Upper threshold cap</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Approved Bank LTV Cap</span>
          <div className="text-2xl font-bold text-[#102a43]">75.0%</div>
          <span className="text-[11px] text-[#627d98]">Strict cap (No 80% deviation)</span>
        </div>
      </div>

      {/* Comparables Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Micro-Market Valuation Comparables</h3>
          <span className="text-xs text-[#627d98]">Source: Propstack & Knight Frank API</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Developer</th>
                <th className="py-3 px-4">Distance from Site</th>
                <th className="py-3 px-4">Average Realization Rate</th>
                <th className="py-3 px-4">Premium vs Subject</th>
                <th className="py-3 px-4 text-right">Bank Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {comparables.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#102a43]">{c.project}</td>
                  <td className="py-3.5 px-4 text-[#486581]">{c.developer}</td>
                  <td className="py-3.5 px-4 text-[#627d98]">{c.distance}</td>
                  <td className="py-3.5 px-4 font-bold">₹{c.rate.toLocaleString()} / sq.ft</td>
                  <td className="py-3.5 px-4 font-semibold text-[#19638c]">{c.premium}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                      APF Active
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
