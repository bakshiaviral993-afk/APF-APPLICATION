import React from 'react';
import { CENTRAL_BUILDER_MASTER } from '../../data/centralMasterData';
import { Building2, ExternalLink, ShieldCheck } from 'lucide-react';

export const BuilderMasterView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded-md">
              Central Master Data
            </span>
            <span className="text-xs text-[#829ab1] font-mono">Single Source of Truth</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">Builder Entity Master</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            10 Institutional Developers (5 Pune, 5 Mumbai) • Normalized relational records
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
              <tr>
                <th className="p-3.5">Builder ID & Name</th>
                <th className="p-3.5">Group Affiliation</th>
                <th className="p-3.5">PAN & CIN</th>
                <th className="p-3.5">City & Estd</th>
                <th className="p-3.5">Track Record</th>
                <th className="p-3.5">Promoter Board</th>
                <th className="p-3.5 text-right">Official Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {CENTRAL_BUILDER_MASTER.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-[#102a43] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#19638c]" />
                      <span>{b.legalName}</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#829ab1]">{b.id}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-[#19638c]">{b.groupName}</td>
                  <td className="p-3.5 font-mono text-[11px] text-[#334e68]">
                    <div>PAN: {b.pan}</div>
                    <div className="text-[10px] text-[#829ab1]">CIN: {b.cin}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-[#102a43]">{b.city}</div>
                    <div className="text-[10px] text-[#829ab1]">Since {b.establishedYear}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-800">
                    <div>{b.totalProjectsCompleted} Delivered</div>
                    <div className="text-[10px] text-[#627d98]">{b.totalOngoingProjects} Ongoing</div>
                  </td>
                  <td className="p-3.5 text-[11px] text-[#334e68]">
                    {b.promoters.join(', ')}
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href={b.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#19638c] hover:underline font-semibold"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
