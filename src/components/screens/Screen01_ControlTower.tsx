import React from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen01_ControlTower: React.FC = () => {
  const { setCurrentScreen } = useAPF();

  const pipelineStages = [
    { name: 'Initiated', count: 84, height: 130 },
    { name: 'Legal', count: 61, height: 95 },
    { name: 'Technical', count: 49, height: 76 },
    { name: 'Risk', count: 33, height: 52 },
    { name: 'Committee', count: 18, height: 28 },
    { name: 'Approved', count: 72, height: 112 },
  ];

  const cityConcentration = [
    { city: 'Pune', pct: 82, color: 'bg-[#19638c]' },
    { city: 'Mumbai', pct: 67, color: 'bg-[#0d818a]' },
    { city: 'NCR', pct: 54, color: 'bg-[#c88a1b]' },
    { city: 'Bengaluru', pct: 41, color: 'bg-[#553c9a]' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Executive APF Control Tower</h1>
          <p className="text-xs text-[#627d98] mt-0.5">Portfolio health, exposure, risk and approval pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('flow')}
            className="bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>End-to-End APF Flow (10 Projects) →</span>
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved APF Portfolio */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Approved APF Portfolio</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹18,420 Cr</h2>
            <span className="text-xs font-semibold text-[#137333]">+3.4% MoM</span>
          </div>
        </div>

        {/* Retail Linked Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Retail Linked Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹11,760 Cr</h2>
            <span className="text-xs font-semibold text-[#185d85]">63.8% of APF</span>
          </div>
        </div>

        {/* High-Risk Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">High-Risk Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹840 Cr</h2>
            <span className="text-xs font-bold text-[#c53030]">4.6%</span>
          </div>
        </div>

        {/* APFs Expiring <90 Days */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">APFs Expiring &lt;90 Days</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹1,110 Cr</h2>
            <span className="text-xs font-bold text-[#b7791f]">37 projects</span>
          </div>
        </div>
      </div>

      {/* Middle Row: APF Pipeline by Stage & Risk and Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* APF Pipeline by Stage */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">APF Pipeline by Stage</h3>
          <div className="pt-6 pb-2 flex items-end justify-between px-4 sm:px-8 h-52">
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-[#102a43]">{stage.count}</span>
                <div
                  style={{ height: `${stage.height}px` }}
                  className="w-10 sm:w-12 bg-[#19638c] rounded-t-sm transition-all hover:bg-[#145070]"
                />
                <span className="text-xs text-[#627d98] mt-1 text-center">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Concentration */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Risk & Concentration</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-3">
            {/* Donut Gauge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-[#e2e8f0]"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Red Risk Slice */}
                  <path
                    className="text-[#c53030]"
                    strokeDasharray="4.6, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-bold text-[#102a43] leading-none">4.6%</span>
                  <span className="text-[10px] text-[#627d98] font-medium mt-1">High Risk</span>
                </div>
              </div>
            </div>

            {/* City Concentration Bars */}
            <div className="flex-1 w-full space-y-3.5">
              {cityConcentration.map((c) => (
                <div key={c.city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#627d98] font-medium">{c.city}</span>
                    <span className="text-[#102a43] font-bold">{c.pct}%</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Priority Alerts & Actions */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <h3 className="text-sm font-bold text-[#102a43] mb-4">Priority Alerts & Actions</h3>
        <div className="divide-y divide-[#edf2f7]">
          {/* Row 1 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="bg-[#c53b47] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md min-w-[64px] text-center">
                Critical
              </span>
              <span className="text-sm font-bold text-[#102a43]">RERA expired for 2 projects</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12">
              <span className="text-xs text-[#627d98] font-medium">₹126 Cr linked exposure</span>
              <button
                onClick={() => setCurrentScreen('28')}
                className="border border-[#19638c] text-[#19638c] hover:bg-[#19638c] hover:text-white px-3.5 py-1 text-xs font-medium rounded-md transition-colors"
              >
                Review now
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="bg-[#c88a1b] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md min-w-[64px] text-center">
                High
              </span>
              <span className="text-sm font-bold text-[#102a43]">Builder exposure variance &gt;10%</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12">
              <span className="text-xs text-[#627d98] font-medium">₹42 Cr unresolved</span>
              <button
                onClick={() => setCurrentScreen('07')}
                className="border border-[#19638c] text-[#19638c] hover:bg-[#19638c] hover:text-white px-3.5 py-1 text-xs font-medium rounded-md transition-colors"
              >
                Reconcile
              </button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="bg-[#c88a1b] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md min-w-[64px] text-center">
                High
              </span>
              <span className="text-sm font-bold text-[#102a43]">Construction delay &gt;90 days</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12">
              <span className="text-xs text-[#627d98] font-medium">7 projects</span>
              <button
                onClick={() => setCurrentScreen('28')}
                className="border border-[#19638c] text-[#19638c] hover:bg-[#19638c] hover:text-white px-3.5 py-1 text-xs font-medium rounded-md transition-colors"
              >
                Open monitoring
              </button>
            </div>
          </div>

          {/* Row 4 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="bg-[#19638c] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md min-w-[64px] text-center">
                Medium
              </span>
              <span className="text-sm font-bold text-[#102a43]">APF renewal due within 30 days</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12">
              <span className="text-xs text-[#627d98] font-medium">12 projects</span>
              <button
                onClick={() => setCurrentScreen('29')}
                className="border border-[#19638c] text-[#19638c] hover:bg-[#19638c] hover:text-white px-3.5 py-1 text-xs font-medium rounded-md transition-colors"
              >
                Initiate renewal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
