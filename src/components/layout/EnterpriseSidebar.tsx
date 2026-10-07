import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { queryStore } from '../../services/queryStore';
import { billingStore } from '../../services/billingStore';
import { NavigationModule } from '../../types/navigation';
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Scale,
  Receipt,
  FileSearch,
  CheckCircle2,
  ListTodo,
  FileCode2,
  Files,
  Settings,
  Users2,
  ClipboardList,
} from 'lucide-react';
import { canAccessExposureReport } from '../../utils/exposurePermissions';

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
  const [pendingBillingCount, setPendingBillingCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      setPendingApprovalsCount(masterStore.getPendingApprovals().length);
      const qCounts = queryStore.getDashboardCounts(currentUser.role, currentUser.id);
      setNeedInputCount(qCounts.needInput);
      const b = billingStore.getBills();
      setPendingBillingCount(
        b.filter(
          (item: any) =>
            item.status === 'INVOICE_SUBMITTED' ||
            item.status === 'BILL_VERIFICATION' ||
            item.status === 'BILL_APPROVAL'
        ).length
      );
    };
    updateCounts();

    const unsubM = masterStore.subscribe(updateCounts);
    const unsubQ = queryStore.subscribe(updateCounts);
    const unsubB = billingStore.subscribe(updateCounts);
    return () => {
      unsubM();
      unsubQ();
      unsubB();
    };
  }, [currentUser]);

  const role = currentUser.role;
  const isCpa = role === 'CPA';
  const isCom = role === 'COM';
  const isApprover = role === 'APPROVER' || role === 'COMMITTEE';
  const isBilling = role === 'BILLING_MAKER' || role === 'BILLING_CHECKER';
  const isAdmin = role === 'ADMIN';

  // Role permissions for groups
  const canAccessMasters = isCpa || isCom || isAdmin;
  const canAccessCpaReview = isCpa || isAdmin;
  const canAccessComReview = isCom || isAdmin;
  const canAccessApprovalCockpit = isApprover || isCom || isAdmin;
  const canAccessBilling = isBilling || isCpa || isCom || isAdmin;
  const canAccessVendors = isBilling || isCpa || isCom || isAdmin;
  const canAccessLos = isCpa || isCom || isAdmin;

  const NavItem = ({
    target,
    icon: Icon,
    label,
    badge,
    badgeColor = 'bg-sky-500 text-white',
    activeColor = 'text-sky-400',
  }: {
    target: NavigationModule;
    icon: any;
    label: string;
    badge?: number | string;
    badgeColor?: string;
    activeColor?: string;
  }) => {
    const isActive = activeView === target;
    return (
      <button
        type="button"
        onClick={() => onNavigate(target)}
        title={label}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-slate-900 text-white shadow-2xs font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? activeColor : 'text-slate-400'}`} />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && badge !== undefined && (
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const GroupHeader = ({ label }: { label: string }) => {
    if (isCollapsed) {
      return <div className="h-px bg-slate-200 my-2" />;
    }
    return (
      <div className="pt-2.5 pb-1 px-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
    );
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 transition-all duration-200 flex flex-col shrink-0 select-none z-30 shadow-2xs ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header / Collapse Toggle */}
      <div className="h-12 border-b border-slate-200/80 flex items-center justify-between px-3 bg-slate-50/60">
        {!isCollapsed && (
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-800">
            PROVAL APF Console
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

      {/* Navigation Groups */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {/* Level 1: Workspace */}
        <GroupHeader label="Workspace" />
        <NavItem target="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
        <NavItem target="MY_CASES" icon={Briefcase} label="My APF Cases" />
        {isCpa && (
          <NavItem
            target="INITIATE_APF"
            icon={FolderPlus}
            label="Initiate APF"
            activeColor="text-sky-300"
          />
        )}
        <NavItem
          target="QUERY_TRAY"
          icon={MessageSquare}
          label="Queries & Clarifications"
          badge={needInputCount > 0 ? needInputCount : undefined}
          badgeColor="bg-amber-500 text-slate-950"
          activeColor="text-amber-400"
        />

        {/* Level 1: Master Data */}
        {canAccessMasters && (
          <>
            <GroupHeader label="Master Data" />
            <NavItem target="BUILDER_MASTER" icon={Building2} label="Builder Management" />
            <NavItem target="PROJECT_MASTER" icon={MapPin} label="Project Management" />
            <NavItem target="TOWER_MASTER" icon={Grid} label="Towers & Units" />
          </>
        )}

        {/* Level 1: Underwriting */}
        <GroupHeader label="Underwriting" />
        <NavItem target="VALUATION_MODULE" icon={FileSearch} label="Technical Valuation" />
        <NavItem target="LEGAL_DD" icon={Scale} label="Legal Due Diligence" />
        {canAccessExposureReport(currentUser.role) && (
          <NavItem
            target="EXPOSURE"
            icon={DollarSign}
            label="Exposure 360"
            activeColor="text-emerald-400"
          />
        )}

        {/* Level 1: Decisioning */}
        <GroupHeader label="Decisioning" />
        {canAccessCpaReview && (
          <NavItem target="CPA_REVIEW" icon={ClipboardList} label="CPA Review" activeColor="text-sky-400" />
        )}
        {canAccessComReview && (
          <NavItem target="COM_REVIEW" icon={ShieldCheck} label="COM Review" activeColor="text-indigo-400" />
        )}
        {canAccessApprovalCockpit && (
          <NavItem
            target="APPROVAL_COCKPIT"
            icon={CheckCircle2}
            label="Approval Cockpit"
            activeColor="text-emerald-400"
          />
        )}
        <NavItem target="CONDITIONS_REGISTER" icon={ListTodo} label="Conditions Register" />

        {/* Level 1: Operations */}
        <GroupHeader label="Operations" />
        {canAccessVendors && (
          <NavItem target="VENDOR_MANAGEMENT" icon={Users2} label="Vendor Management" />
        )}
        {canAccessBilling && (
          <NavItem
            target="BILLING"
            icon={Receipt}
            label="Billing & Payments"
            badge={pendingBillingCount > 0 ? pendingBillingCount : undefined}
            badgeColor="bg-emerald-500 text-slate-950"
            activeColor="text-emerald-400"
          />
        )}
        {canAccessLos && (
          <NavItem target="LOS_INTEGRATIONS" icon={FileCode2} label="LOS / Integrations" />
        )}

        {/* Level 1: Governance */}
        <GroupHeader label="Governance" />
        <NavItem target="DOCUMENT_VAULT" icon={Files} label="Documents" />
        <NavItem target="REPORTS" icon={FileBarChart} label="Reports & Audit" />
        {isAdmin && (
          <NavItem target="ADMIN_CONFIG" icon={Settings} label="Configuration" />
        )}

        {/* Maker-Checker Approvals Modal Shortcut for COM/ADMIN */}
        {(isCom || isAdmin) && onOpenApprovals && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenApprovals}
              title="Pending Master Approvals"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-amber-950 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                {!isCollapsed && <span>Pending Approvals</span>}
              </div>
              {!isCollapsed && pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-slate-200/90 bg-slate-50/70 text-[11px] text-slate-500">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[10px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Connected</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Desk: <strong className="text-slate-700 font-semibold">{currentUser.role}</strong>
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Gateway Connected" />
          </div>
        )}
      </div>
    </aside>
  );
};
