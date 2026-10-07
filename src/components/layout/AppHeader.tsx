import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, UserRole } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import { masterStore } from '../../services/masterStore';
import { queryStore } from '../../services/queryStore';
import { DEMO_USERS } from '../../data/centralMasterData';
import {
  Menu,
  Building2,
  LogOut,
  Layers,
  MapPin,
  DollarSign,
  FileBarChart,
  User,
  Shield,
  RotateCcw,
  Clock,
  Grid,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  Building,
  UserCheck,
  Briefcase,
} from 'lucide-react';

interface AppHeaderProps {
  currentUser: UserAccount;
  activeView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  onOpenApprovals?: () => void;
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onLogout,
  onOpenApprovals,
  onToggleSidebar,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSystemsStatusOpen, setIsSystemsStatusOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [needInputCount, setNeedInputCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const systemsRef = useRef<HTMLDivElement>(null);

  const isChecker = currentUser.role === 'COM' || currentUser.role === 'ADMIN';

  useEffect(() => {
    const updateCounts = () => {
      setPendingCount(masterStore.getPendingApprovals().length);
      const qCounts = queryStore.getDashboardCounts(currentUser.role, currentUser.id);
      setNeedInputCount(qCounts.needInput);
    };
    updateCounts();

    const unsubM = masterStore.subscribe(updateCounts);
    const unsubQ = queryStore.subscribe(updateCounts);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (systemsRef.current && !systemsRef.current.contains(e.target as Node)) {
        setIsSystemsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubM();
      unsubQ();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentUser]);

  const handleRoleSwitch = (username: string) => {
    const targetUser = DEMO_USERS[username];
    if (targetUser) {
      apfStore.login(targetUser.username, 'Demo@123');
      setIsProfileDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="bg-[#0B1F33] text-white border-b border-[#1E3A5F] sticky top-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left: Hamburger Button & Bank Logo */}
            <div className="flex items-center gap-3 shrink-0">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  title="Toggle Navigation Sidebar"
                  className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden cursor-pointer"
                >
                  <Menu className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Enterprise Branding */}
              <div
                onClick={() => onNavigate('DASHBOARD')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className="w-8 h-8 rounded-md bg-[#1667C1] text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-white font-sans">
                      PROVAL <span className="text-[#0EA5E9] font-mono">APF</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      Bank Console
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
                    Approved Project Financial Underwriting Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Compact System Status Pill with Popover */}
            <div className="relative hidden md:block" ref={systemsRef}>
              <button
                type="button"
                onClick={() => setIsSystemsStatusOpen(!isSystemsStatusOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#132B45] hover:bg-[#1A385C] border border-[#23456C] text-xs text-slate-300 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <span className="font-medium text-[11px]">Systems Connected</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Systems Status Popover */}
              {isSystemsStatusOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-xl border border-[#DCE3EB] p-3 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                    Enterprise Integrations Status
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Core Banking Host</span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">LOS Origination Gateway</span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">DMS Document Vault</span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">MahaRERA Live Registry</span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Exposure Reconciliation (CRILC/MCA)</span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connected
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center">
                    SSL 256-Bit Encrypted • All Nodes Active
                  </div>
                </div>
              )}
            </div>

            {/* Right: Notifications & User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Need Input Communication Badge */}
              <button
                type="button"
                onClick={() => onNavigate('QUERY_TRAY')}
                title="Queries & Clarifications"
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  needInputCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-[#132B45] text-slate-300 hover:text-white hover:bg-[#1A385C] border border-[#23456C]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Queries</span>
                {needInputCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                    {needInputCount}
                  </span>
                )}
              </button>

              {/* Checker Pending Approvals Notification */}
              {isChecker && onOpenApprovals && (
                <button
                  type="button"
                  onClick={onOpenApprovals}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    pendingCount > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-[#132B45] text-slate-300 hover:text-white hover:bg-[#1A385C] border border-[#23456C]'
                  }`}
                  title="Master Data Pending Maker-Checker Approvals"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Approvals</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Profile & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md bg-[#132B45] hover:bg-[#1A385C] transition-colors border border-[#23456C] focus:outline-hidden cursor-pointer"
                >
                  <div className="w-7 h-7 rounded bg-[#1667C1] text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      <span>{currentUser.role}</span>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-xl border border-[#DCE3EB] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 z-50 text-xs">
                    {/* User summary card */}
                    <div className="px-4 py-3 bg-[#F5F7FA] border-b border-[#DCE3EB]">
                      <div className="font-semibold text-slate-900 text-sm">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-semibold text-[10px] border border-sky-200">
                          {currentUser.roleLabel || currentUser.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Unit: {currentUser.agencyOrDept || 'Pune Retail Operations'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Last Sign-In: Today, 11:30 AM IST
                      </div>
                    </div>

                    {/* Role Switcher only when POC_DEBUG_MODE is enabled */}
                    {(window as any).__POC_DEBUG_MODE__ === true && (
                      <>
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                          Debug Role Switcher (Dev Mode)
                        </div>

                        <div className="px-1.5 py-1 space-y-0.5 max-h-64 overflow-y-auto">
                          <button
                            onClick={() => handleRoleSwitch('cpa01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'CPA' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">CPA (Rohan Deshmukh)</span>
                              <span className="text-[10px] text-slate-500">Maker • Processing Associate</span>
                            </div>
                            {currentUser.role === 'CPA' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('com01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'COM' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">COM (Amitav Sen)</span>
                              <span className="text-[10px] text-slate-500">Checker • Credit Ops Manager</span>
                            </div>
                            {currentUser.role === 'COM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('acom01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'ACOM' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">ACOM (Priya Sharma)</span>
                              <span className="text-[10px] text-slate-500">Area Credit Ops Manager</span>
                            </div>
                            {currentUser.role === 'ACOM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('valuer.ext01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'EXTERNAL_VALUER' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">External Valuer (Knight Frank)</span>
                              <span className="text-[10px] text-slate-500">Technical Inspection & Valuation</span>
                            </div>
                            {currentUser.role === 'EXTERNAL_VALUER' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('legal.ext01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'EXTERNAL_LEGAL_ADVOCATE' ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">External Advocate (Adv. Ananya)</span>
                              <span className="text-[10px] text-slate-500">Demo Legal Associates • Legal Portal</span>
                            </div>
                            {currentUser.role === 'EXTERNAL_LEGAL_ADVOCATE' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('legalfirm.admin01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'EXTERNAL_LEGAL_FIRM_ADMIN' ? 'bg-teal-50 font-semibold text-teal-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">Law Firm Admin (Adv. Sanjay Trivedi)</span>
                              <span className="text-[10px] text-slate-500">Managing Partner • Legal Docket Pool</span>
                            </div>
                            {currentUser.role === 'EXTERNAL_LEGAL_FIRM_ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('legal.int01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'INTERNAL_LEGAL' ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">Internal Legal (Adv. Meenakshi)</span>
                              <span className="text-[10px] text-slate-500">Bank In-House Legal Cell</span>
                            </div>
                            {currentUser.role === 'INTERNAL_LEGAL' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('billing.maker01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'BILLING_MAKER' ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">Billing Maker (K. S. Nair)</span>
                              <span className="text-[10px] text-slate-500">Vendor Billing & Tax Withholding</span>
                            </div>
                            {currentUser.role === 'BILLING_MAKER' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                          </button>

                          <button
                            onClick={() => handleRoleSwitch('admin01')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between hover:bg-slate-100 ${
                              currentUser.role === 'ADMIN' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <span className="font-medium block text-xs">Admin (Siddharth Rao)</span>
                              <span className="text-[10px] text-slate-500">System Governance</span>
                            </div>
                            {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                          </button>
                        </div>
                      </>
                    )}

                    <div className="border-t border-[#DCE3EB] p-1.5">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile & Security Credentials</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out of Bank Terminal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden p-6 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <User className="w-4 h-4 text-[#0a2540]" />
                <span>User Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">User Name</span>
                <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">System User ID</span>
                <span className="font-mono text-slate-800">{currentUser.id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Role & Designation</span>
                <span className="font-semibold text-[#0a2540]">{currentUser.roleLabel || currentUser.role}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Agency / Department</span>
                <span className="font-medium text-slate-800">{currentUser.agencyOrDept}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Email</span>
                <span className="font-mono text-slate-800">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Session & Sign-In</span>
                <span className="font-mono text-slate-600">22-Sep-2026 11:30:14 AM IST (Active)</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0a2540] hover:bg-[#133d59] text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
