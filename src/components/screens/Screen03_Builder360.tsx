import React from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen03_Builder360: React.FC = () => {
  const { setCurrentScreen } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Builder 360</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Single view of identity, connected entities, exposure, projects and risk
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* Main Builder Banner Card */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102a43]">ABC Developers Pvt. Ltd.</h2>
          <p className="text-xs text-[#627d98] mt-1 font-mono">
            CIN U70100PN2012PTC000001 | PAN AAAAA1234A | Group: ABC Realty Group
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full text-xs font-semibold">
            Risk: MEDIUM
          </span>
          <button
            onClick={() => setCurrentScreen('07')}
            className="bg-[#fef3e0] text-[#b06000] hover:bg-amber-100 px-3.5 py-1 rounded-full text-xs font-semibold transition-colors"
          >
            Exposure Review
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Direct Exposure</p>
          <h3 className="text-2xl font-bold text-[#102a43] tracking-tight mt-2">₹390 Cr</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Retail Linked</p>
          <h3 className="text-2xl font-bold text-[#102a43] tracking-tight mt-2">₹620 Cr</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Projects</p>
          <h3 className="text-2xl font-bold text-[#102a43] tracking-tight mt-2">11</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Delayed Projects</p>
          <h3 className="text-2xl font-bold text-[#102a43] tracking-tight mt-2">2</h3>
        </div>
      </div>

      {/* Middle Row: Builder Intelligence Summary & Exposure by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Intelligence Summary */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Builder Intelligence Summary</h3>
          <ul className="space-y-3.5 text-xs text-[#102a43] font-medium my-auto">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0d818a] shrink-0" />
              <span>11 active projects across 3 cities</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0d818a] shrink-0" />
              <span>2 projects delayed &gt;6 months</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0d818a] shrink-0" />
              <span>Group leverage increased in latest FY</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0d818a] shrink-0" />
              <span>External exposure variance: ₹42 Cr</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#0d818a] shrink-0" />
              <span>Recommended: enhanced monitoring</span>
            </li>
          </ul>
        </div>

        {/* Exposure by Source */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Exposure by Source</h3>
          <div className="space-y-4">
            {/* Internal bank */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#627d98] font-medium">Internal bank</span>
                <span className="text-[#102a43] font-bold">₹86 Cr</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#19638c] rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            {/* Credit bureau */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#627d98] font-medium">Credit bureau</span>
                <span className="text-[#102a43] font-bold">₹441 Cr</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#0d818a] rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            {/* Declared */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#627d98] font-medium">Declared</span>
                <span className="text-[#102a43] font-bold">₹465 Cr</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#c88a1b] rounded-full" style={{ width: '93%' }} />
              </div>
            </div>

            {/* Financial statements */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#627d98] font-medium">Financial statements</span>
                <span className="text-[#102a43] font-bold">₹486 Cr</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#553c9a] rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Project Portfolio & Connected Entity Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Portfolio */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Project Portfolio</h3>
          <div className="divide-y divide-[#edf2f7]">
            {/* Alpha Towers */}
            <div
              onClick={() => setCurrentScreen('12')}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors first:pt-0"
            >
              <span className="text-xs font-bold text-[#102a43] hover:text-[#19638c]">Alpha Towers</span>
              <span className="text-xs text-[#627d98]">Pune</span>
              <span className="text-xs font-medium text-[#102a43]">₹214 Cr</span>
              <span className="text-xs font-bold text-[#137333]">On Track</span>
            </div>

            {/* Beta Greens */}
            <div className="py-3 flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[#102a43]">Beta Greens</span>
              <span className="text-xs text-[#627d98]">Mumbai</span>
              <span className="text-xs font-medium text-[#102a43]">₹176 Cr</span>
              <span className="text-xs font-bold text-[#c88a1b]">Delayed</span>
            </div>

            {/* Gamma City */}
            <div className="py-3 flex items-center justify-between px-2 last:pb-0">
              <span className="text-xs font-bold text-[#102a43]">Gamma City</span>
              <span className="text-xs text-[#627d98]">NCR</span>
              <span className="text-xs font-medium text-[#102a43]">₹112 Cr</span>
              <span className="text-xs font-bold text-[#c88a1b]">Watchlist</span>
            </div>
          </div>
        </div>

        {/* Connected Entity Snapshot */}
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Connected Entity Snapshot</h3>
          <div className="divide-y divide-[#edf2f7]">
            {/* ABC Realty Pvt Ltd */}
            <div className="py-3 flex items-center justify-between first:pt-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e8f1f5] text-[#19638c] font-bold text-xs flex items-center justify-center">
                  AB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102a43]">ABC Realty Pvt Ltd</h4>
                  <p className="text-[11px] text-[#627d98]">Promoter-linked</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#102a43]">₹180 Cr</span>
            </div>

            {/* Alpha SPV Pvt Ltd */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e8f1f5] text-[#19638c] font-bold text-xs flex items-center justify-center">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102a43]">Alpha SPV Pvt Ltd</h4>
                  <p className="text-[11px] text-[#627d98]">Project SPV</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#102a43]">₹92 Cr</span>
            </div>

            {/* ABC Homes LLP */}
            <div className="py-3 flex items-center justify-between last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e8f1f5] text-[#19638c] font-bold text-xs flex items-center justify-center">
                  AB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102a43]">ABC Homes LLP</h4>
                  <p className="text-[11px] text-[#627d98]">Common directors</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#102a43]">₹48 Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
