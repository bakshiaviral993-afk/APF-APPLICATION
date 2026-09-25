import React from 'react';
import { Building2, MapPin, ShieldCheck, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { RealProjectSeed } from '../../data/realProjects';

interface CaseHeaderProps {
  projectSeed: RealProjectSeed;
  caseId?: string;
  apfStatus?: string;
  currentOwnerRole?: string;
  currentOwnerName?: string;
  onProjectChange?: (seed: RealProjectSeed) => void;
  availableProjects?: RealProjectSeed[];
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  projectSeed,
  caseId = 'APF-PUN-01-2026-0091',
  apfStatus = 'Under Review',
  currentOwnerRole = 'CPA',
  currentOwnerName = 'Mr. Rohan Deshmukh',
}) => {
  const isApproved = apfStatus === 'APPROVED' || apfStatus === 'APF Active';
  const isConditional = apfStatus.includes('Conditional');

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#cbd5e1] shadow-xs px-6 py-3.5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Case Identity & Real Project Identity */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#0c3148] text-white font-mono text-[11px] font-bold tracking-wider">
              {caseId}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#e8f1f5] text-[#19638c] text-[11px] font-bold border border-[#19638c]/20">
              {projectSeed.city.toUpperCase()} CLUSTER
            </span>
            <span className="text-xs text-[#627d98]">
              Source: <a href={projectSeed.sourceUrl} target="_blank" rel="noreferrer" className="text-[#19638c] underline">{projectSeed.sourceQuality}</a>
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-bold text-[#102a43] tracking-tight">
              {projectSeed.project}
            </h2>
            <span className="text-xs text-[#627d98] font-medium">
              by <strong className="text-[#102a43]">{projectSeed.developer}</strong> ({projectSeed.developerGroup})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#486581]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#627d98]" />
              {projectSeed.locality}, {projectSeed.city}
            </span>
            <span>•</span>
            <span>
              MahaRERA: <strong className="font-mono text-[#102a43]">{projectSeed.reraNumbers.join(', ')}</strong>
            </span>
            <span>•</span>
            <span>
              Scope: <strong className="text-[#102a43]">{projectSeed.towers.join(' & ')}</strong> ({projectSeed.totalUnits} Units)
            </span>
          </div>
        </div>

        {/* Right: Status and Current Activity Owner */}
        <div className="flex flex-wrap items-center gap-3 lg:self-center">
          {/* Status Badge */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#627d98] block">APF Status</span>
            <span
              className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                isApproved
                  ? 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30'
                  : isConditional
                  ? 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30'
                  : 'bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/30'
              }`}
            >
              {apfStatus}
            </span>
          </div>

          <div className="h-8 w-px bg-[#e2e8f0] hidden sm:block" />

          {/* Current Activity Owner */}
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#627d98] block">Current Action Owner</span>
            <span className="font-bold text-[#0c3148] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {currentOwnerRole}: {currentOwnerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
