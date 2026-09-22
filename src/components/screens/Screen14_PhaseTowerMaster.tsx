import React from 'react';
import { useAPF } from '../../context/APFContext';
import { Layers, Building, ChevronRight } from 'lucide-react';
import { DEMO_TOWERS } from '../../data/mockData';

export const Screen14_PhaseTowerMaster: React.FC = () => {
  const { setCurrentScreen, setSelectedTower } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Phase & Tower Master Architecture</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Building Metrics
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            6 Towers • 400 Total Units • Slab height milestones, CC sanctions, and RERA completion dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('15')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Tower Heatmap (Screen 15) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Tower Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEMO_TOWERS.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              setSelectedTower(t);
              setCurrentScreen('15');
            }}
            className="bg-white p-6 rounded-xl border border-[#e2e8f0] hover:border-[#19638c] shadow-sm cursor-pointer transition-all space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#102a43] text-base group-hover:text-[#19638c] transition-colors">
                {t.name}
              </h3>
              <span className="text-xs font-mono font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded">
                {t.floors} Floors
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#627d98]">
                <span>Total Units:</span>
                <span className="font-semibold text-[#102a43]">{t.unitsCount} Units</span>
              </div>
              <div className="flex justify-between text-[#627d98]">
                <span>Physical Progress:</span>
                <span className="font-bold text-[#137333]">{t.progressPct}%</span>
              </div>
              <div className="flex justify-between text-[#627d98]">
                <span>Construction Stage:</span>
                <span className="text-[#334e68] font-medium">{t.constructionStage}</span>
              </div>
              <div className="flex justify-between text-[#627d98]">
                <span>Schedule Variance:</span>
                <span className={`font-mono font-medium ${t.delayMonths > 0 ? 'text-[#b06000]' : 'text-[#137333]'}`}>
                  {t.delayMonths > 0 ? `+${t.delayMonths} mo delay` : 'On Schedule'}
                </span>
              </div>
            </div>

            <div className="w-full bg-[#f1f5f9] rounded-full h-2">
              <div
                className="bg-[#19638c] h-2 rounded-full transition-all"
                style={{ width: `${t.progressPct}%` }}
              />
            </div>

            <button className="w-full py-1.5 bg-[#f8fafc] group-hover:bg-[#19638c] group-hover:text-white text-[#19638c] rounded-lg text-xs font-semibold transition-colors border border-[#e2e8f0] group-hover:border-[#19638c]">
              View Unit Exposure Matrix →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
