import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  MapPin,
  FileCheck2,
  MessageSquare,
  Receipt,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { UserAccount } from '../../types/apfTransaction';

export type ExternalValuerNavView =
  | 'DASHBOARD'
  | 'MY_ASSIGNMENTS'
  | 'SITE_VISIT_QUEUE'
  | 'SUBMITTED_REPORTS'
  | 'QUERIES'
  | 'BILLING'
  | 'PROFILE';

interface ExternalValuerSidebarProps {
  currentUser: UserAccount;
  activeView: ExternalValuerNavView;
  onNavigate: (view: ExternalValuerNavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  pendingSiteVisitsCount?: number;
  openQueriesCount?: number;
  billingEligibleCount?: number;
}

export const ExternalValuerSidebar: React.FC<ExternalValuerSidebarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  pendingSiteVisitsCount = 0,
  openQueriesCount = 0,
  billingEligibleCount = 0,
}) => {
  return (
    <aside
      className={`bg-white border-r border-[#DCE3EB] transition-all duration-200 flex flex-col shrink-0 select-none z-30 shadow-xs ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-12 border-b border-[#DCE3EB] flex items-center justify-between px-3 bg-slate-50/70">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
            Valuer Workstation
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors mx-auto cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto text-xs font-medium">
        <button
          onClick={() => onNavigate('DASHBOARD')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'DASHBOARD'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard
            className={`w-4 h-4 shrink-0 ${activeView === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-400'}`}
          />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        <button
          onClick={() => onNavigate('MY_ASSIGNMENTS')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'MY_ASSIGNMENTS'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase
            className={`w-4 h-4 shrink-0 ${activeView === 'MY_ASSIGNMENTS' ? 'text-sky-400' : 'text-slate-400'}`}
          />
          {!isCollapsed && <span>My Assignments</span>}
        </button>

        <button
          onClick={() => onNavigate('SITE_VISIT_QUEUE')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'SITE_VISIT_QUEUE'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MapPin
              className={`w-4 h-4 shrink-0 ${activeView === 'SITE_VISIT_QUEUE' ? 'text-amber-400' : 'text-slate-400'}`}
            />
            {!isCollapsed && <span>Site Visit Queue</span>}
          </div>
          {!isCollapsed && pendingSiteVisitsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
              {pendingSiteVisitsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('SUBMITTED_REPORTS')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'SUBMITTED_REPORTS'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck2
            className={`w-4 h-4 shrink-0 ${activeView === 'SUBMITTED_REPORTS' ? 'text-emerald-400' : 'text-slate-400'}`}
          />
          {!isCollapsed && <span>Submitted Reports</span>}
        </button>

        <button
          onClick={() => onNavigate('QUERIES')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'QUERIES'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare
              className={`w-4 h-4 shrink-0 ${activeView === 'QUERIES' ? 'text-sky-400' : 'text-slate-400'}`}
            />
            {!isCollapsed && <span>Queries</span>}
          </div>
          {!isCollapsed && openQueriesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-900 font-bold text-[10px]">
              {openQueriesCount}
            </span>
          )}
        </button>

        <div className="pt-2 pb-1 px-2.5">
          {!isCollapsed ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Finance & Profile
            </span>
          ) : (
            <div className="h-px bg-slate-200 my-1" />
          )}
        </div>

        <button
          onClick={() => onNavigate('BILLING')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'BILLING'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Receipt
              className={`w-4 h-4 shrink-0 ${activeView === 'BILLING' ? 'text-emerald-400' : 'text-slate-400'}`}
            />
            {!isCollapsed && <span>Billing & Payments</span>}
          </div>
          {!isCollapsed && billingEligibleCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
              {billingEligibleCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('PROFILE')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeView === 'PROFILE'
              ? 'bg-[#0B1F33] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User
            className={`w-4 h-4 shrink-0 ${activeView === 'PROFILE' ? 'text-sky-400' : 'text-slate-400'}`}
          />
          {!isCollapsed && <span>Profile & Empanelment</span>}
        </button>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#DCE3EB] bg-slate-50/70">
        {!isCollapsed && (
          <div className="mb-2">
            <div className="text-[11px] font-bold text-[#172033] truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{currentUser.agencyOrDept}</div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
