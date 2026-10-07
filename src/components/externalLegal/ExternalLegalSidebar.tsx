import React from 'react';
import {
  Scale,
  LayoutDashboard,
  FileCheck2,
  MessageSquare,
  FileText,
  DollarSign,
  Receipt,
  CreditCard,
  Building2,
  FolderLock,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { UserAccount } from '../../types/apfTransaction';

export type ExternalLegalView =
  | 'DASHBOARD'
  | 'MY_ASSIGNMENTS'
  | 'QUERIES'
  | 'SUBMITTED_REPORTS'
  | 'BILLING_ELIGIBLE'
  | 'MY_INVOICES'
  | 'PAYMENT_STATUS'
  | 'EMPANELMENT_PROFILE'
  | 'DOCUMENTS'
  | 'USER_PROFILE';

interface ExternalLegalSidebarProps {
  currentUser: UserAccount;
  activeView: ExternalLegalView;
  onNavigate: (view: ExternalLegalView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  openQueriesCount?: number;
  newAssignmentsCount?: number;
  billingEligibleCount?: number;
}

export const ExternalLegalSidebar: React.FC<ExternalLegalSidebarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  openQueriesCount = 0,
  newAssignmentsCount = 0,
  billingEligibleCount = 0,
}) => {
  return (
    <aside
      className={`bg-white border-r border-[#DCE3EB] flex flex-col shrink-0 transition-all duration-200 z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3.5 border-b border-[#DCE3EB] flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F33] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Scale className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-[#172033] tracking-tight truncate">
                Legal Portal
              </div>
              <div className="text-[10px] text-sky-700 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{currentUser.firmName || 'Demo Legal Associates'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#0B1F33] text-white flex items-center justify-center mx-auto shadow-2xs">
            <Scale className="w-4 h-4 text-[#0EA5E9]" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium">
        {/* SECTION 1: WORKSPACE */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
          )}
          <nav className="space-y-0.5">
            <button
              onClick={() => onNavigate('DASHBOARD')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'DASHBOARD'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeView === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Dashboard</span>}
              </div>
            </button>

            <button
              onClick={() => onNavigate('MY_ASSIGNMENTS')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'MY_ASSIGNMENTS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className={`w-4 h-4 shrink-0 ${activeView === 'MY_ASSIGNMENTS' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>My Legal Assignments</span>}
              </div>
              {!isCollapsed && newAssignmentsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-sky-500 text-white">
                  {newAssignmentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('QUERIES')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'QUERIES'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeView === 'QUERIES' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Need Input / Queries</span>}
              </div>
              {!isCollapsed && openQueriesCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                  {openQueriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('SUBMITTED_REPORTS')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'SUBMITTED_REPORTS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 shrink-0 ${activeView === 'SUBMITTED_REPORTS' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Submitted Reports</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* SECTION 2: BILLING & PAYMENTS */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Billing & Settlements
            </div>
          )}
          <nav className="space-y-0.5">
            <button
              onClick={() => onNavigate('BILLING_ELIGIBLE')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'BILLING_ELIGIBLE'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className={`w-4 h-4 shrink-0 ${activeView === 'BILLING_ELIGIBLE' ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Billing Eligible</span>}
              </div>
              {!isCollapsed && billingEligibleCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                  {billingEligibleCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('MY_INVOICES')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'MY_INVOICES'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className={`w-4 h-4 shrink-0 ${activeView === 'MY_INVOICES' ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>My Invoices</span>}
              </div>
            </button>

            <button
              onClick={() => onNavigate('PAYMENT_STATUS')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'PAYMENT_STATUS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className={`w-4 h-4 shrink-0 ${activeView === 'PAYMENT_STATUS' ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Payment Status</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* SECTION 3: ACCOUNT & COMPLIANCE */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account & Credentials
            </div>
          )}
          <nav className="space-y-0.5">
            <button
              onClick={() => onNavigate('EMPANELMENT_PROFILE')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'EMPANELMENT_PROFILE'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 shrink-0 ${activeView === 'EMPANELMENT_PROFILE' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Empanelment Profile</span>}
              </div>
            </button>

            <button
              onClick={() => onNavigate('DOCUMENTS')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'DOCUMENTS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderLock className={`w-4 h-4 shrink-0 ${activeView === 'DOCUMENTS' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Documents & Vault</span>}
              </div>
            </button>

            <button
              onClick={() => onNavigate('USER_PROFILE')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'USER_PROFILE'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className={`w-4 h-4 shrink-0 ${activeView === 'USER_PROFILE' ? 'text-sky-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>User Profile</span>}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#DCE3EB] bg-slate-50/70">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300">
                {currentUser.avatarInitials || 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser.roleLabel || 'External Legal Advocate'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-md border border-rose-200 font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Portal</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="w-8 h-8 rounded-lg text-rose-700 hover:bg-rose-50 flex items-center justify-center mx-auto transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
