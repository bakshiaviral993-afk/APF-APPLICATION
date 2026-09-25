import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { queryStore } from '../../services/queryStore';
import {
  LayoutDashboard,
  FolderPlus,
  Briefcase,
  Building2,
  MapPin,
  Grid,
  DollarSign,
  MessageSquare,
  FileBarChart,
  CheckSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileSearch,
  Users,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { canAccessExposureReport } from '../../utils/exposurePermissions';

export type NavigationModule =
  | 'DASHBOARD'
  | 'MY_CASES'
  | 'BUILDER_MASTER'
  | 'PROJECT_MASTER'
  | 'TOWER_MASTER'
  | 'EXPOSURE'
  | 'QUERY_TRAY'
  | 'REPORTS'
  | 'CASE_DETAIL';

interface EnterpriseSidebarProps {
  currentUser: UserAccount;
  activeView: NavigationModule;
  onNavigate: (view: NavigationModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onInitiateCase?: () => void;
  onOpenApprovals?: () => void;
}

export const EnterpriseSidebar: React.FC<EnterpriseSidebarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onInitiateCase,
  onOpenApprovals,
}) => {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [needInputCount, setNeedInputCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      setPendingApprovalsCount(masterStore.getPendingApprovals().length);
      const qCounts = queryStore.getDashboardCounts(currentUser.role, currentUser.id);
      setNeedInputCount(qCounts.needInput);
    };
    updateCounts();

    const unsubM = masterStore.subscribe(updateCounts);
    const unsubQ = queryStore.subscribe(updateCounts);
    return () => {
      unsubM();
      unsubQ();
    };
  }, [currentUser]);

  const role = currentUser.role;
  const isCpa = role === 'CPA';
  const isCom = role === 'COM';
  const isValuer = role === 'EXTERNAL_VALUER' || role === 'INTERNAL_VALUER';
  const isApprover = role === 'APPROVER';
  const isAdmin = role === 'ADMIN';

  // Master access rule: All Master access is available to CPA, COM, and ADMIN
  const hasMasterAccess = isCpa || isCom || isAdmin;

  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col shrink-0 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Collapse Toggle */}
      <div className="h-12 border-b border-slate-200 flex items-center justify-between px-3.5 bg-[#f8fafc]">
        {!isCollapsed && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0c3148]">
            One-Collateral APF
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto text-xs font-semibold">
        {/* Core Underwriting Navigation */}
        <button
          onClick={() => onNavigate('DASHBOARD')}
          title="Dashboard / Overview"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            activeView === 'DASHBOARD'
              ? 'bg-[#0c3148] text-white shadow-xs font-bold'
              : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        <button
          onClick={() => onNavigate('MY_CASES')}
          title="My APF Cases Queue"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            activeView === 'MY_CASES'
              ? 'bg-[#0c3148] text-white shadow-xs font-bold'
              : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>My APF Cases</span>}
        </button>

        {/* CPA specific actions */}
        {isCpa && onInitiateCase && (
          <button
            onClick={onInitiateCase}
            title="Initiate New APF Case"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sky-800 bg-sky-50/80 hover:bg-sky-100 transition-colors border border-sky-200 font-bold"
          >
            <FolderPlus className="w-4 h-4 shrink-0 text-sky-700" />
            {!isCollapsed && <span>+ Initiate APF Case</span>}
          </button>
        )}

        {/* In-App Communication / Query Tray */}
        <button
          onClick={() => onNavigate('QUERY_TRAY')}
          title="Query & Communication Tray"
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
            activeView === 'QUERY_TRAY'
              ? 'bg-[#0c3148] text-white shadow-xs font-bold'
              : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Query / Communication</span>}
          </div>
          {!isCollapsed && needInputCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {needInputCount}
            </span>
          )}
        </button>

        {/* Masters Section (Available to CPA and COM!) */}
        {hasMasterAccess && (
          <>
            <div className="pt-3 pb-1 px-3">
              {!isCollapsed ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Master Records (CPA / COM)
                </span>
              ) : (
                <div className="h-px bg-slate-200 my-1" />
              )}
            </div>

            <button
              onClick={() => onNavigate('BUILDER_MASTER')}
              title="Builder Entity Master"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'BUILDER_MASTER'
                  ? 'bg-[#0c3148] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Builder Master</span>}
            </button>

            <button
              onClick={() => onNavigate('PROJECT_MASTER')}
              title="Project & Phase Master"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'PROJECT_MASTER'
                  ? 'bg-[#0c3148] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Project Master</span>}
            </button>

            <button
              onClick={() => onNavigate('TOWER_MASTER')}
              title="Tower & Unit Configuration Master"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'TOWER_MASTER'
                  ? 'bg-[#0c3148] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Tower & Units</span>}
            </button>

            {/* Checker Maker-Checker Queue (COM / ADMIN) */}
            {(isCom || isAdmin) && onOpenApprovals && (
              <button
                onClick={onOpenApprovals}
                title="Pending Master Maker-Checker Approvals"
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                  {!isCollapsed && <span>Master Approvals</span>}
                </div>
                {!isCollapsed && pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}
          </>
        )}

        {/* Intelligence & Analytics */}
        <div className="pt-3 pb-1 px-3">
          {!isCollapsed ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {canAccessExposureReport(currentUser.role) ? 'Intelligence & Exposure' : 'Reports & Intelligence'}
            </span>
          ) : (
            <div className="h-px bg-slate-200 my-1" />
          )}
        </div>

        {/* Exposure 360: Strictly available ONLY to CPA, COM, ACOM, RCOM, ZCOM, NCOM. Hidden for Valuers. */}
        {canAccessExposureReport(currentUser.role) && (
          <button
            onClick={() => onNavigate('EXPOSURE')}
            title="Builder Exposure 360 & Reconciliation (Authorized Credit Operations)"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeView === 'EXPOSURE'
                ? 'bg-[#0c3148] text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Exposure 360</span>}
          </button>
        )}

        <button
          onClick={() => onNavigate('REPORTS')}
          title="Executive MIS Reports & LOS Logs"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            activeView === 'REPORTS'
              ? 'bg-[#0c3148] text-white shadow-xs font-bold'
              : 'text-slate-700 hover:bg-sky-50 hover:text-[#0c3148]'
          }`}
        >
          <FileBarChart className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Reports & Audit</span>}
        </button>
      </nav>

      {/* Sidebar Footer: System Status */}
      <div className="p-3 border-t border-slate-200 bg-[#f8fafc] text-[11px] text-slate-500">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>System Gateway Online</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Role: <strong className="text-[#0c3148]">{currentUser.role}</strong>
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Gateway Online" />
          </div>
        )}
      </div>
    </aside>
  );
};
