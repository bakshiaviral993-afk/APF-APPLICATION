import React, { useState } from 'react';
import {
  RotateCw,
  Download,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { UserAccount } from '../../../types/apfTransaction';

export type DateRangeOption = 'TODAY' | '7_DAYS' | '30_DAYS' | 'QUARTER' | 'FY' | 'CUSTOM';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  currentUser: UserAccount;
  businessUnit?: string;
  region?: string;
  selectedDateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastRefreshedAt: string;
  isAsOfData?: boolean;
  showExecutiveToggle?: boolean;
  isExecutiveMode?: boolean;
  onToggleExecutiveMode?: () => void;
  onExport?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  currentUser,
  businessUnit = 'Retail Mortgages & Project Finance',
  region = 'West Zone (Mumbai & Pune)',
  selectedDateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt,
  isAsOfData = true,
  showExecutiveToggle = false,
  isExecutiveMode = false,
  onToggleExecutiveMode,
  onExport,
}) => {
  const [showExportToast, setShowExportToast] = useState(false);

  const handleExportClick = () => {
    if (onExport) {
      onExport();
    } else {
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title and Metadata */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <span className="text-xs font-semibold text-slate-400">·</span>
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
              {currentUser.roleLabel || currentUser.role}
            </span>
            {isAsOfData && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                AS-OF CORE CBS
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
            <span>Operator: <strong className="text-slate-800">{currentUser.name}</strong></span>
            <span>·</span>
            <span>Unit: <strong className="text-slate-700">{businessUnit}</strong></span>
            <span>·</span>
            <span>Jurisdiction: <strong className="text-slate-700">{region}</strong></span>
            {subtitle && (
              <>
                <span>·</span>
                <span className="text-slate-500">{subtitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions: Date Filter, Refresh, Export, Exec toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Executive view toggle if applicable */}
          {showToggle(currentUser.role) && (
            <button
              type="button"
              onClick={onToggleExecutiveMode}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isExecutiveMode
                  ? 'bg-purple-900 text-white border-purple-950 shadow-2xs'
                  : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isExecutiveMode ? 'Exit Portfolio Mode' : 'Executive Portfolio'}</span>
            </button>
          )}

          {/* Date range selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
            {(
              [
                { id: 'TODAY', label: 'Today' },
                { id: '7_DAYS', label: '7D' },
                { id: '30_DAYS', label: '30D' },
                { id: 'QUARTER', label: 'QTD' },
                { id: 'FY', label: 'FY26' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDateRangeChange(opt.id)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                  selectedDateRange === opt.id
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh dashboard aggregates"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportClick}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export analytical snapshot to CSV / PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Last refreshed status and toast */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Aggregates · Last Updated: <strong>{lastRefreshedAt}</strong></span>
        </div>
        {showExportToast && (
          <span className="text-emerald-700 font-semibold animate-fade-in">
            ✓ Portfolio Analytics snapshot exported to CSV/PDF
          </span>
        )}
      </div>
    </div>
  );
};

function showToggle(role: string): boolean {
  return (
    role === 'COM' ||
    role === 'APPROVER' ||
    role === 'COMMITTEE' ||
    role === 'ADMIN'
  );
}
