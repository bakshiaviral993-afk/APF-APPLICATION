import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { Sliders, ShieldCheck, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { DEMO_BUILDER_GROUP } from '../../data/mockData';

export const Screen23_ExposureEngine: React.FC = () => {
  const { setCurrentScreen, selectedGroup, reconciledFacilities } = useAPF();
  const [additionalRetailSim, setAdditionalRetailSim] = useState<number>(50.0);

  const goldenSanction = reconciledFacilities.reduce((sum, f) => sum + f.goldenSanctionCr, 0);
  const currentTotalGroup = 245.0 + 42.0 + 214.2; // ~501.2 Cr
  const groupLimit = DEMO_BUILDER_GROUP.overallLimitCr || DEMO_BUILDER_GROUP.groupLimitCr || 600.0;
  const currentUtilPct = Math.round((currentTotalGroup / groupLimit) * 100);

  const simulatedTotal = currentTotalGroup + additionalRetailSim;
  const simulatedUtilPct = Math.round((simulatedTotal / groupLimit) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Exposure Engine & Group Limit Simulator</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Prudential Limits
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Group: ABC Realty Group / Apex Habitat • Sanctioned Group Cap: ₹{groupLimit} Cr • Headroom Simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('24')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Composite Risk Engine (Screen 24) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* 4 Exposure Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Total Group Limit</span>
          <div className="text-2xl font-bold text-[#102a43]">₹{groupLimit} Cr</div>
          <span className="text-[11px] text-[#627d98]">Board approved umbrella</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Governed Group Exposure</span>
          <div className="text-2xl font-bold text-[#b06000]">₹{currentTotalGroup.toFixed(1)} Cr</div>
          <span className="text-[11px] text-[#627d98]">{currentUtilPct}% Utilized</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Current Available Headroom</span>
          <div className="text-2xl font-bold text-[#137333]">₹{(groupLimit - currentTotalGroup).toFixed(1)} Cr</div>
          <span className="text-[11px] text-[#137333] font-semibold">Room for proposed APF</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-1">
          <span className="text-xs text-[#627d98] font-medium">Simulated Utilization</span>
          <div className={`text-2xl font-bold ${simulatedUtilPct > 95 ? 'text-[#c5221f]' : 'text-[#19638c]'}`}>
            {simulatedUtilPct}%
          </div>
          <span className="text-[11px] text-[#627d98]">Post ₹{additionalRetailSim} Cr sourcing</span>
        </div>
      </div>

      {/* Simulator Control Slider Box */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#102a43]">Interactive Retail Loan Sourcing Simulation</h3>
            <p className="text-xs text-[#627d98]">
              Simulate incremental home loan portfolio disbursement to model group limit stress.
            </p>
          </div>
          <span className="text-base font-bold font-mono text-[#19638c]">
            +₹{additionalRetailSim.toFixed(1)} Cr Sourcing
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="120"
          step="5"
          value={additionalRetailSim}
          onChange={(e) => setAdditionalRetailSim(parseFloat(e.target.value))}
          className="w-full accent-[#19638c] cursor-pointer"
        />

        <div className="flex justify-between text-xs text-[#627d98]">
          <span>+₹10 Cr (Conservative)</span>
          <span>+₹50 Cr (Expected APF 1st Year)</span>
          <span>+₹120 Cr (Exhaust Headroom)</span>
        </div>
      </div>
    </div>
  );
};
