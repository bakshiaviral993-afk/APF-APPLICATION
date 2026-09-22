import React from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen12_Project360: React.FC = () => {
  const { setCurrentScreen } = useAPF();

  const dueDiligenceItems = [
    { area: 'Legal', status: 'Clear with 2 conditions', color: 'bg-[#288049]' },
    { area: 'Technical', status: 'B / Watch progress', color: 'bg-[#c88a1b]' },
    { area: 'Valuation', status: 'Within 3.5% market', color: 'bg-[#288049]' },
    { area: 'Financial', status: 'DSCR 1.42x', color: 'bg-[#288049]' },
    { area: 'Exposure', status: 'Limit util. 84.2%', color: 'bg-[#c88a1b]' },
  ];

  const towers = [
    { name: 'Tower A', funded: '62/120 funded', pct: 52, exposure: '₹41.8 Cr' },
    { name: 'Tower B', funded: '54/96 funded', pct: 56, exposure: '₹38.5 Cr' },
    { name: 'Tower C', funded: '31/70 funded', pct: 44, exposure: '₹24.6 Cr' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Project 360</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Project, phase, tower, due diligence, exposure and monitoring
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* Project Identity Card */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102a43]">Alpha Towers - Pune</h2>
          <p className="text-xs text-[#627d98] mt-1 font-mono">
            RERA P52100012345 | Builder: ABC Developers | 3 Towers | 286 Units
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full text-xs font-semibold">
            APF Active
          </span>
          <span className="bg-[#fef3e0] text-[#b06000] px-3.5 py-1 rounded-full text-xs font-semibold">
            Risk 62
          </span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retail Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Retail Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹214 Cr</h2>
            <span className="text-xs font-semibold text-[#185d85]">318 loans</span>
          </div>
        </div>

        {/* Project Finance */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Project Finance</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹92 Cr</h2>
            <span className="text-xs font-semibold text-[#185d85]">2 lenders</span>
          </div>
        </div>

        {/* Construction */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Construction</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">76%</h2>
            <span className="text-xs font-bold text-[#b7791f]">vs 82% plan</span>
          </div>
        </div>

        {/* Unsold Inventory */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Unsold Inventory</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">64 units</h2>
            <span className="text-xs font-semibold text-[#185d85]">₹88 Cr value</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Due Diligence Status & Tower Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Diligence Status */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Due Diligence Status</h3>
          <div className="divide-y divide-[#edf2f7]">
            {dueDiligenceItems.map((item) => (
              <div key={item.area} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <span className="text-xs text-[#627d98] font-medium w-24">{item.area}</span>
                <span className="text-xs font-bold text-[#102a43] flex-1">{item.status}</span>
                <div className={`w-7 h-3 rounded-full ${item.color}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Tower Snapshot */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#102a43]">Tower Snapshot</h3>
            <button
              onClick={() => setCurrentScreen('15')}
              className="text-[11px] text-[#19638c] font-semibold hover:underline"
            >
              Open Heatmap →
            </button>
          </div>
          <div className="space-y-4">
            {towers.map((tower) => (
              <div
                key={tower.name}
                onClick={() => setCurrentScreen('15')}
                className="space-y-1.5 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[#102a43] font-bold">{tower.name}</span>
                    <span className="text-[#627d98] font-medium">{tower.funded}</span>
                  </div>
                  <span className="text-[#102a43] font-bold">{tower.exposure}</span>
                </div>
                <div className="w-full bg-[#e2e8f0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#19638c] rounded-full"
                    style={{ width: `${tower.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Card: Project Timeline & Early Warnings */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <h3 className="text-sm font-bold text-[#102a43] mb-6">Project Timeline &amp; Early Warnings</h3>

        {/* Horizontal Timeline Stepper */}
        <div className="relative flex items-center justify-between px-4 sm:px-12 my-6">
          {/* Horizontal Connecting Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#cbd5e1] -z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#288049] flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="text-[11px] text-[#627d98] font-medium">APF Approved</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#288049] flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="text-[11px] text-[#627d98] font-medium">Foundation</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#288049] flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="text-[11px] text-[#627d98] font-medium">Structure</span>
          </div>

          {/* Step 4: MEP (Warning) */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#c88a1b] flex items-center justify-center text-white text-[10px]">
              !
            </div>
            <span className="text-[11px] text-[#b7791f] font-bold">MEP</span>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#cbd5e1] border-2 border-white" />
            <span className="text-[11px] text-[#627d98] font-medium">Finishing</span>
          </div>

          {/* Step 6 */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-[#cbd5e1] border-2 border-white" />
            <span className="text-[11px] text-[#627d98] font-medium">Possession</span>
          </div>
        </div>

        {/* Warning Text */}
        <div className="mt-8 text-center sm:text-left">
          <p className="text-xs font-bold text-[#b7791f]">
            Warning: current construction progress is 6 percentage points behind plan; next technical review due in 12 days.
          </p>
        </div>
      </div>
    </div>
  );
};
