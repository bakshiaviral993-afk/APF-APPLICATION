import React from 'react';
import { HardHat, CheckCircle2, AlertTriangle, Building, Wrench, Shield, Users } from 'lucide-react';

export interface TowerProgressData {
  towerName: string;
  floorsSanctioned: number;
  floorsConstructed: number;
  slabsCompleted: number;
  constructionStage: string;
  physicalProgress: number;
  expectedProgress: number;
  labourCount: number;
  machineryActive: string;
  workmanshipScore: number;
  safetyScore: number;
  deviationsObserved: string;
}

interface TowerProgressCardProps {
  tower: TowerProgressData;
}

export const TowerProgressCard: React.FC<TowerProgressCardProps> = ({ tower }) => {
  const progressVariance = tower.physicalProgress - tower.expectedProgress;
  const isDelayed = progressVariance < -5;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#e8f1f5] text-[#19638c]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#102a43]">{tower.towerName}</h4>
            <span className="text-xs text-[#627d98]">Current Stage: {tower.constructionStage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              isDelayed ? 'bg-[#fef7e0] text-[#b06000]' : 'bg-[#e6f4ea] text-[#137333]'
            }`}
          >
            {isDelayed ? `${progressVariance}% Delay Variance` : 'On Schedule'}
          </span>
          <span className="font-mono text-sm font-bold text-[#102a43]">{tower.physicalProgress}% Done</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[#627d98]">
          <span>Physical Inspected: <strong>{tower.physicalProgress}%</strong></span>
          <span>Target Scheduled: <strong>{tower.expectedProgress}%</strong></span>
        </div>
        <div className="w-full bg-[#f1f5f9] rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${isDelayed ? 'bg-[#b06000]' : 'bg-[#137333]'}`}
            style={{ width: `${Math.min(tower.physicalProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[11px]">Floors Sanctioned / Built</span>
          <span className="font-bold text-[#102a43]">
            {tower.floorsConstructed} of {tower.floorsSanctioned} Floors
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[11px]">RCC Slabs Cast</span>
          <span className="font-bold text-[#102a43]">{tower.slabsCompleted} Slabs</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[11px]">Labour Count on Site</span>
          <span className="font-bold text-[#102a43] flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#19638c]" />
            {tower.labourCount} Workers
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          <span className="text-[#627d98] block text-[11px]">Quality / Safety Score</span>
          <span className="font-bold text-[#137333]">
            {tower.workmanshipScore}/5.0 • {tower.safetyScore}/5.0
          </span>
        </div>
      </div>

      {/* Deviations / Machinery note */}
      <div className="text-xs text-[#334e68] bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span><strong>Machinery Active:</strong> {tower.machineryActive}</span>
        <span className="text-[#627d98]"><strong>Deviations:</strong> {tower.deviationsObserved}</span>
      </div>
    </div>
  );
};
