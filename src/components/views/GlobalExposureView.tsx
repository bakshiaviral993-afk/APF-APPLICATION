import React from 'react';
import { CENTRAL_BUILDER_MASTER } from '../../data/centralMasterData';
import { DollarSign, ShieldAlert, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export const GlobalExposureView: React.FC = () => {
  const groupCaps = [
    { group: 'Kolte-Patil Group', capCr: 600, utilizedCr: 484.7, activeApfs: 4, rating: 'A+', risk: 'Low' },
    { group: 'Shapoorji Pallonji Group', capCr: 1200, utilizedCr: 840.0, activeApfs: 8, rating: 'AA-', risk: 'Low' },
    { group: 'Godrej Properties Group', capCr: 1500, utilizedCr: 910.0, activeApfs: 11, rating: 'AAA', risk: 'Low' },
    { group: 'Mahindra Lifespaces Group', capCr: 800, utilizedCr: 420.0, activeApfs: 5, rating: 'AA+', risk: 'Low' },
    { group: 'VTP Realty Group', capCr: 450, utilizedCr: 310.5, activeApfs: 3, rating: 'A', risk: 'Moderate' },
    { group: 'Lodha Group (Macrotech)', capCr: 2000, utilizedCr: 1420.0, activeApfs: 14, rating: 'AA', risk: 'Low' },
    { group: 'Oberoi Realty Group', capCr: 1000, utilizedCr: 550.0, activeApfs: 6, rating: 'AA+', risk: 'Low' },
    { group: 'Rustomjee Group (Keystone)', capCr: 650, utilizedCr: 410.0, activeApfs: 4, rating: 'A+', risk: 'Low' },
    { group: 'Runwal Group', capCr: 500, utilizedCr: 340.0, activeApfs: 3, rating: 'A', risk: 'Moderate' },
    { group: 'Raymond Realty Group', capCr: 400, utilizedCr: 180.0, activeApfs: 2, rating: 'A+', risk: 'Low' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded-md">
              Portfolio Governance
            </span>
            <span className="text-xs text-[#829ab1] font-mono">10 Builder Groups</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">
            Group Exposure 360 & Concentration Limits
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Internal prudential bank limits, sanctioned credit lines, and available headroom
          </p>
        </div>

        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
            RESTRICTED BANK METRICS: SIMULATED POC DATA
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
              <tr>
                <th className="p-3.5">Developer Group</th>
                <th className="p-3.5">Group Cap (₹ Cr)</th>
                <th className="p-3.5">Utilized Exposure (₹ Cr)</th>
                <th className="p-3.5">Headroom (₹ Cr)</th>
                <th className="p-3.5">Utilization %</th>
                <th className="p-3.5">Approved APFs</th>
                <th className="p-3.5">Internal Rating</th>
                <th className="p-3.5 text-right">Risk Band</th>
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
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          g.risk === 'Low'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {g.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
