import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

export interface DashboardFilterState {
  searchQuery: string;
  city: 'ALL' | 'Pune' | 'Mumbai';
  riskBand: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stageFilter: string;
}

interface DashboardFilterBarProps {
  filters: DashboardFilterState;
  onFilterChange: (newFilters: Partial<DashboardFilterState>) => void;
  onReset: () => void;
  stages?: { id: string; label: string }[];
  builders?: { id: string; name: string }[];
  showRiskFilter?: boolean;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  stages = [],
  showRiskFilter = true,
}) => {
  const activeCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.city !== 'ALL' ? 1 : 0) +
    (filters.riskBand !== 'ALL' ? 1 : 0) +
    (filters.stageFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-[260px] flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search case, builder, project..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">City:</span>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ city: e.target.value as any })}
            className="h-8 px-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Cities</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        {/* Risk Band */}
        {showRiskFilter && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Risk:</span>
            <select
              value={filters.riskBand}
              onChange={(e) => onFilterChange({ riskBand: e.target.value as any })}
              className="h-8 px-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Risk Bands</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Watch</option>
            </select>
          </div>
        )}

        {/* Stage Filter */}
        {stages.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Stage:</span>
            <select
              value={filters.stageFilter}
              onChange={(e) => onFilterChange({ stageFilter: e.target.value })}
              className="h-8 px-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset ({activeCount})</span>
        </button>
      )}
    </div>
  );
};
