import React, { useState, useEffect } from 'react';
import { CENTRAL_BUILDER_MASTER } from '../../data/centralMasterData';
import { BuilderExposure360Report } from '../exposure/BuilderExposure360Report';
import { DollarSign, ShieldAlert, BarChart3, TrendingUp, AlertCircle, Building2, Layers, ArrowRight } from 'lucide-react';
import { UserAccount } from '../../types/apfTransaction';
import { canAccessExposureReport, ExposureAccessRestrictedCard } from '../../utils/exposurePermissions';

interface GlobalExposureViewProps {
  currentUser?: UserAccount;
  initialBuilderId?: string;
  onNavigateBack?: () => void;
  onNavigateToValuation?: () => void;
}

export const GlobalExposureView: React.FC<GlobalExposureViewProps> = ({
  currentUser,
  initialBuilderId = 'BLD-PUN-001',
  onNavigateBack,
  onNavigateToValuation,
}) => {
  const [activeTab, setActiveTab] = useState<'BUILDER_360' | 'GROUP_CAPS'>('BUILDER_360');
  const [selectedBuilderId, setSelectedBuilderId] = useState<string>(initialBuilderId);

  useEffect(() => {
    if (initialBuilderId) {
      setSelectedBuilderId(initialBuilderId);
    }
  }, [initialBuilderId]);

  // Strict RBAC Access Barrier: Valuers cannot access exposure reports
  if (!canAccessExposureReport(currentUser?.role)) {
    return (
      <ExposureAccessRestrictedCard
        currentRole={currentUser?.role}
        userName={currentUser?.name}
        onNavigateBack={onNavigateBack}
        onNavigateToValuation={onNavigateToValuation}
      />
    );
  }

  const groupCaps = [
    { group: 'Kolte-Patil Group', builderId: 'BLD-PUN-001', capCr: 600, utilizedCr: 484.7, activeApfs: 4, rating: 'A+', risk: 'Low' },
    { group: 'Shapoorji Pallonji Group', builderId: 'BLD-PUN-002', capCr: 1200, utilizedCr: 840.0, activeApfs: 8, rating: 'AA-', risk: 'Low' },
    { group: 'Godrej Properties Group', builderId: 'BLD-PUN-003', capCr: 1500, utilizedCr: 910.0, activeApfs: 11, rating: 'AAA', risk: 'Low' },
    { group: 'Mahindra Lifespaces Group', builderId: 'BLD-PUN-004', capCr: 800, utilizedCr: 420.0, activeApfs: 5, rating: 'AA+', risk: 'Low' },
    { group: 'VTP Realty Group', builderId: 'BLD-PUN-005', capCr: 450, utilizedCr: 310.5, activeApfs: 3, rating: 'A', risk: 'Moderate' },
    { group: 'Lodha Group (Macrotech)', builderId: 'BLD-MUM-001', capCr: 2000, utilizedCr: 1420.0, activeApfs: 14, rating: 'AA', risk: 'Low' },
    { group: 'Oberoi Realty Group', builderId: 'BLD-MUM-002', capCr: 1000, utilizedCr: 550.0, activeApfs: 6, rating: 'AA+', risk: 'Low' },
    { group: 'Rustomjee Group (Keystone)', builderId: 'BLD-MUM-003', capCr: 650, utilizedCr: 410.0, activeApfs: 4, rating: 'A+', risk: 'Low' },
    { group: 'Runwal Group', builderId: 'BLD-MUM-004', capCr: 500, utilizedCr: 340.0, activeApfs: 3, rating: 'A', risk: 'Moderate' },
    { group: 'Raymond Realty Group', builderId: 'BLD-MUM-005', capCr: 400, utilizedCr: 180.0, activeApfs: 2, rating: 'A+', risk: 'Low' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#f1f5f9] p-1.5 rounded-2xl border border-[#cbd5e1] max-w-md">
        <button
          onClick={() => setActiveTab('BUILDER_360')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'BUILDER_360'
              ? 'bg-[#0c3148] text-white shadow-xs'
              : 'text-[#627d98] hover:text-[#102a43]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Builder Exposure 360</span>
        </button>

        <button
          onClick={() => setActiveTab('GROUP_CAPS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'GROUP_CAPS'
              ? 'bg-[#0c3148] text-white shadow-xs'
              : 'text-[#627d98] hover:text-[#102a43]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Group Portfolio Caps</span>
        </button>
      </div>

      {activeTab === 'BUILDER_360' ? (
        <BuilderExposure360Report currentUser={currentUser} builderId={selectedBuilderId} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded-md">
                  Portfolio Governance
                </span>
                <span className="text-xs text-[#829ab1] font-mono">10 Builder Groups</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#102a43] mt-0.5">
                Group Exposure 360 & Concentration Limits
              </h1>
              <p className="text-xs text-[#627d98] mt-0.5">
                Internal prudential bank limits, sanctioned credit lines, and available headroom
              </p>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                RESTRICTED PRUDENTIAL LIMITS
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
                  <tr>
                    <th className="py-2.5 px-3">Developer Group</th>
                    <th className="py-2.5 px-3">Group Cap (₹ Cr)</th>
                    <th className="py-2.5 px-3">Utilized Exposure (₹ Cr)</th>
                    <th className="py-2.5 px-3">Headroom (₹ Cr)</th>
                    <th className="py-2.5 px-3">Utilization %</th>
                    <th className="py-2.5 px-3">Approved APFs</th>
                    <th className="py-2.5 px-3">Internal Rating</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {groupCaps.map((g, idx) => {
                    const headroom = g.capCr - g.utilizedCr;
                    const utilPct = Math.round((g.utilizedCr / g.capCr) * 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-[#102a43] flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#19638c]" />
                          <span>{g.group}</span>
                        </td>

                        <td className="p-3.5 font-mono font-bold">₹{g.capCr} Cr</td>

                        <td className="p-3.5 font-mono font-bold text-[#19638c]">
                          ₹{g.utilizedCr.toFixed(1)} Cr
                        </td>

                        <td className="p-3.5 font-mono font-bold text-emerald-700">
                          ₹{headroom.toFixed(1)} Cr
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  utilPct > 85 ? 'bg-amber-500' : 'bg-[#19638c]'
                                }`}
                                style={{ width: `${utilPct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-semibold">{utilPct}%</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-[#334e68]">{g.activeApfs} Schemes</td>

                        <td className="p-3.5 font-bold text-[#102a43]">{g.rating}</td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedBuilderId(g.builderId);
                              setActiveTab('BUILDER_360');
                            }}
                            className="px-2.5 py-1 rounded bg-[#e8f1f5] text-[#19638c] font-bold text-[10px] hover:bg-[#19638c] hover:text-white transition-colors"
                          >
                            Inspect 360 →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
