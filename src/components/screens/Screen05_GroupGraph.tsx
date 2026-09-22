import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { Network, Building2, ChevronRight, ShieldCheck, ArrowDownRight, Layers, CheckCircle2 } from 'lucide-react';
import { DEMO_COMPANIES, DEMO_BUILDER_GROUP } from '../../data/mockData';

export const Screen05_GroupGraph: React.FC = () => {
  const { setCurrentScreen, setSelectedCompany, addAuditLog } = useAPF();
  const [selectedNode, setSelectedNode] = useState<string>('ABC Developers Pvt. Ltd.');
  const [spvConfirmed, setSpvConfirmed] = useState(false);

  const handleConfirmSPV = () => {
    setSpvConfirmed(true);
    addAuditLog('CONFIRM_SPV_LINK', 'Alpha SPV Pvt Ltd', 'Confirmed SPV entity link; updated group limit utilisation to 84.2%');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Group Corporate Structure Graph</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Legal Entity Architecture
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Group Parent: ABC Realty Group / Apex Habitat • Sanctioned Group Cap: ₹{DEMO_BUILDER_GROUP.overallLimitCr || 600} Cr
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('06')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            View External Credit Bureau Exposure →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy Graph */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-6">
        {/* Parent / Holding Level */}
        <div className="flex flex-col items-center">
          <div className="p-5 rounded-xl bg-[#e8f1f5] border-2 border-[#19638c] max-w-md w-full text-center space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-[#19638c] uppercase tracking-wider">
              Ultimate Holding Entity
            </span>
            <h3 className="text-lg font-bold text-[#102a43]">ABC Realty Group (Apex Habitat)</h3>
            <p className="text-xs text-[#627d98]">
              HQ: BKC Mumbai • Total Net Worth: ₹{DEMO_BUILDER_GROUP.totalNetWorthCr || 280.0} Cr
            </p>
            <div className="pt-2 flex justify-center gap-3 text-xs font-semibold">
              <span className="text-[#102a43]">Group Exposure: ₹{spvConfirmed ? '505 Cr (84.2%)' : '484.5 Cr (80.8%)'}</span>
              <span className="text-[#627d98]">•</span>
              <span className="text-[#137333]">Group Limit: ₹600 Cr</span>
            </div>
          </div>
          <div className="w-0.5 h-8 bg-[#cbd5e1]" />
        </div>

        {/* Operating & SPV Children */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DEMO_COMPANIES.map((comp) => {
            const isSelected = selectedNode === comp.legalName;
            const displayName = comp.id === 'COMP-01' ? 'ABC Developers Pvt. Ltd.' : comp.id === 'COMP-03' ? 'Alpha SPV Pvt Ltd' : comp.legalName;
            return (
              <div
                key={comp.id}
                onClick={() => setSelectedNode(comp.legalName)}
                className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-white border-[#19638c] shadow-md ring-2 ring-[#19638c]/20'
                    : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1f5] text-[#19638c]">
                    {comp.roleInGroup}
                  </span>
                  <span className="text-[11px] font-mono text-[#627d98]">{comp.entityType}</span>
                </div>

                <h4 className="font-bold text-[#102a43] text-sm">{displayName}</h4>

                <div className="text-xs text-[#627d98] space-y-1 pt-2 border-t border-[#edf2f7] text-[11px]">
                  <div className="flex justify-between">
                    <span>CIN:</span>
                    <span className="font-mono text-[#102a43] font-medium">{comp.cin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAN:</span>
                    <span className="font-mono text-[#102a43] font-medium">{comp.pan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Worth:</span>
                    <span className="font-bold text-[#137333]">₹{comp.netWorthCr} Cr</span>
                  </div>
                </div>

                {comp.id === 'COMP-03' && !spvConfirmed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmSPV();
                    }}
                    className="w-full mt-2 py-1.5 bg-[#b06000] hover:bg-[#8f4e00] text-white rounded text-xs font-semibold transition-colors shadow-xs"
                  >
                    Confirm SPV Link (+₹92 Cr)
                  </button>
                )}

                {comp.id === 'COMP-03' && spvConfirmed && (
                  <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-[#137333] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SPV Link Confirmed in Group</span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCompany(comp);
                    setCurrentScreen('03');
                  }}
                  className="w-full mt-1 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#19638c] rounded text-xs font-semibold transition-colors"
                >
                  Inspect in Builder 360 →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
