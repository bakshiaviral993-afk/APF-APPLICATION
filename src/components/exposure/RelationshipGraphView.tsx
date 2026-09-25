import React, { useState } from 'react';
import {
  RelationshipGraphNode,
  RelationshipGraphEdge,
} from '../../types/exposureTypes';
import {
  Building2,
  GitFork,
  Landmark,
  Layers,
  Link,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  Info,
  Users,
} from 'lucide-react';

interface RelationshipGraphViewProps {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
}

export const RelationshipGraphView: React.FC<RelationshipGraphViewProps> = ({ nodes, edges }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('PRJ-ITOWERS');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const connectedEdges = edges.filter(
    (e) => e.source === selectedNodeId || e.target === selectedNodeId
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-[#e2e8f0]">
          <div>
            <h3 className="text-sm font-bold text-[#102a43] flex items-center gap-2">
              <GitFork className="w-4 h-4 text-[#19638c]" />
              <span>Builder → Project → Lender Multilateral Relationship Graph</span>
            </h3>
            <p className="text-xs text-[#627d98] mt-0.5">
              Structural entity resolution: Developer parent, SPVs, underlying projects, project finance lenders and retail mortgage pools
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Connected Security & Guarantees
            </span>
          </div>
        </div>

        {/* Visual Hierarchical Canvas */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tree View Structure (8 cols) */}
          <div className="lg:col-span-8 bg-[#f8fafc] p-6 rounded-xl border border-[#cbd5e1] overflow-x-auto space-y-6">
            {/* Level 1: Group Level */}
            <div className="flex justify-center">
              {nodes
                .filter((n) => n.type === 'GROUP')
                .map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedNodeId(group.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all w-80 text-center shadow-xs ${
                      selectedNodeId === group.id
                        ? 'border-[#0c3148] bg-[#0c3148] text-white shadow-md'
                        : 'border-[#cbd5e1] bg-white text-[#102a43] hover:border-[#19638c]'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                      {group.category}
                    </span>
                    <h4 className="font-black text-sm mt-0.5">{group.label}</h4>
                    <div className="text-xs font-mono mt-1 opacity-90">
                      Cap: ₹{group.amountCr} Cr • Consolidated
                    </div>
                  </div>
                ))}
            </div>

            {/* Downward Connector Line */}
            <div className="w-0.5 h-6 bg-[#94a3b8] mx-auto" />

            {/* Level 2: Developer Entities & SPVs */}
            <div className="grid grid-cols-3 gap-4">
              {nodes
                .filter((n) => n.type === 'ENTITY')
                .map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => setSelectedNodeId(entity.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all shadow-2xs ${
                      selectedNodeId === entity.id
                        ? 'border-[#19638c] bg-[#19638c] text-white shadow-md'
                        : 'border-[#cbd5e1] bg-white text-[#102a43] hover:border-[#19638c]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>{entity.category}</span>
                      <span>{entity.id}</span>
                    </div>
                    <h5 className="font-bold text-xs mt-1 leading-snug">{entity.label}</h5>
                    <div className="text-[11px] font-mono font-semibold mt-1">
                      Direct: ₹{entity.amountCr} Cr
                    </div>
                  </div>
                ))}
            </div>

            {/* Downward Connector Line */}
            <div className="w-0.5 h-6 bg-[#94a3b8] mx-auto" />

            {/* Level 3: Projects */}
            <div className="grid grid-cols-2 gap-4">
              {nodes
                .filter((n) => n.type === 'PROJECT')
                .map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedNodeId(proj.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all shadow-xs ${
                      selectedNodeId === proj.id
                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-md'
                        : 'border-[#cbd5e1] bg-white text-[#102a43] hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>{proj.category}</span>
                      <span className="font-bold">{proj.id}</span>
                    </div>
                    <h5 className="font-black text-xs mt-1">{proj.label}</h5>
                    <p className="text-[10px] opacity-85 mt-0.5">{proj.subLabel}</p>
                    <div className="text-xs font-mono font-bold mt-1.5 flex items-center justify-between pt-1 border-t border-current/20">
                      <span>Mapped Project Debt</span>
                      <span>₹{proj.amountCr} Cr</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Downward Connector Line */}
            <div className="w-0.5 h-6 bg-[#94a3b8] mx-auto" />

            {/* Level 4: Lenders & Retail Mortgage Pools */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#627d98] block text-center">
                Financing Lenders & Project-Linked Retail Concentration
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nodes
                  .filter((n) => n.type === 'LENDER' || n.type === 'RETAIL_POOL')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNodeId(item.id)}
                      className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                        selectedNodeId === item.id
                          ? item.type === 'RETAIL_POOL'
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                            : 'border-amber-600 bg-amber-600 text-white shadow-md'
                          : 'border-[#cbd5e1] bg-white hover:border-[#19638c]'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase block opacity-80">
                        {item.category}
                      </span>
                      <strong className="block text-[11px] font-bold mt-0.5 leading-tight">
                        {item.label}
                      </strong>
                      <span className="text-[11px] font-mono font-bold block mt-1">
                        ₹{item.amountCr} Cr
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Node Inspector Panel (4 cols) */}
          <div className="lg:col-span-4 bg-[#f8fafc] p-5 rounded-xl border border-[#cbd5e1] space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#19638c] flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Entity & Relationship Inspector</span>
            </h4>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-[#cbd5e1] space-y-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {selectedNode.type}
                  </span>
                  <h5 className="font-black text-sm text-[#102a43]">{selectedNode.label}</h5>
                  <p className="text-[11px] text-[#627d98]">{selectedNode.subLabel}</p>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                    <span className="text-[#829ab1]">Utilized / Cap:</span>
                    <strong className="text-base font-black text-[#19638c]">
                      ₹{selectedNode.amountCr} Cr
                    </strong>
                  </div>
                </div>

                {/* Multilateral Linkages */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#334e68] uppercase tracking-wider block">
                    Active Multilateral Linkages ({connectedEdges.length})
                  </span>
                  <div className="space-y-2">
                    {connectedEdges.map((edge) => (
                      <div
                        key={edge.id}
                        className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-[#19638c]">{edge.relationship}</span>
                          <span className="text-slate-400 font-mono">{edge.id}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#102a43]">
                          {edge.source} → {edge.target}
                        </div>
                        <p className="text-[10px] text-[#627d98]">{edge.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promoter / Director Governance Callout */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <strong className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5" /> Common Directors & Corporate Guarantees
                  </strong>
                  <p className="text-[10px]">
                    Cross-entity guarantee executed by Rajesh Patil & Milind Patil covering Sector R1 & R2 credit facilities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Select any node in the tree to inspect multilateral linkages.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
