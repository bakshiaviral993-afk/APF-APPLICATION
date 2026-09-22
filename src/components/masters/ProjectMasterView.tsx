import React from 'react';
import { CENTRAL_PROJECT_MASTER, CENTRAL_BUILDER_MASTER, CENTRAL_TOWER_MASTER } from '../../data/centralMasterData';
import { MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const ProjectMasterView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded-md">
              Central Master Data
            </span>
            <span className="text-xs text-[#829ab1] font-mono">10 Real Projects</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">Project & RERA Master</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            5 Pune + 5 Mumbai benchmark developments with validated MahaRERA numbers and coordinates
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
              <tr>
                <th className="p-3.5">Project ID & Name</th>
                <th className="p-3.5">Developer Legal Entity</th>
                <th className="p-3.5">MahaRERA Number</th>
                <th className="p-3.5">City & Locality</th>
                <th className="p-3.5">Project Typology</th>
                <th className="p-3.5">Towers Mapped</th>
                <th className="p-3.5 text-right">RERA / Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {CENTRAL_PROJECT_MASTER.map((p) => {
                const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === p.builderId);
                const towers = CENTRAL_TOWER_MASTER.filter((t) => t.projectId === p.id);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#102a43] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#19638c]" />
                        <span>{p.projectName}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#829ab1]">{p.id}</div>
                    </td>

                    <td className="p-3.5 font-semibold text-[#334e68]">
                      {builder?.legalName || p.builderId}
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{p.reraNumbers.join(', ')}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-[#102a43]">{p.locality}</div>
                      <div className="text-[10px] text-[#829ab1]">{p.city}</div>
                    </td>

                    <td className="p-3.5 text-[#334e68]">
                      <div>{p.projectType}</div>
                      <div className="text-[10px] text-[#829ab1]">{p.totalLandAreaAcres} Acres</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-[#102a43]">{towers.length} Sanctioned</div>
                      <div className="text-[10px] text-[#627d98]">
                        {towers.map((t) => t.towerName).join(', ')}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#19638c] hover:underline font-semibold"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
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
