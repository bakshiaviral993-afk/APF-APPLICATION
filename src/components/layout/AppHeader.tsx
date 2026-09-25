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
  const [pendingCount, setPendingCount] = useState(0);
  const [needInputCount, setNeedInputCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
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
      <header className="bg-[#0a2540] text-white border-b border-[#133d59] sticky top-0 z-40 shadow-xs">
        <div className="w-full px-3 sm:px-4">
          <div className="flex items-center justify-between h-13 sm:h-14 gap-3">
            {/* Left: Hamburger Button & Bank Logo */}
            <div className="flex items-center gap-3 shrink-0">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  title="Toggle Navigation Sidebar"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Enterprise Branding */}
              <div
                onClick={() => onNavigate('DASHBOARD')}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs border border-sky-400/30">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-white uppercase">
                      PROVAL APF
                    </span>
                    <span className="hidden sm:inline text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-900/70 text-sky-200 border border-sky-600/40">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-200/80 font-medium leading-none tracking-normal mt-0.5">
                    Technical Appraisal & Exposure Underwriting
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Notification Badges & User Profile Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Need Input Communication Badge */}
              <button
                type="button"
                onClick={() => onNavigate('QUERY_TRAY')}
                title="Query & Communication Tray"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  needInputCount > 0
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Queries</span>
                {needInputCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono">
                    {needInputCount}
                  </span>
                )}
              </button>

              {/* Checker Pending Approvals Notification */}
              {isChecker && onOpenApprovals && (
                <button
                  type="button"
                  onClick={onOpenApprovals}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pendingCount > 0
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 animate-pulse'
                      : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                  }`}
                  title="Master Data Pending Maker-Checker Approvals"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Approvals</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono">
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
                  className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-sky-500/30 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/20">
                    {currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <ChevronDown className="w-3 h-3 text-sky-300" />
                    </div>
                    <div className="text-[10px] text-sky-200/80 font-medium flex items-center gap-1">
                      <span>{currentUser.role}</span>
                      <span>•</span>
                      <span className="font-mono">22-Sep 11:30 AM</span>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50 text-xs">
                    {/* User summary card */}
                    <div className="px-4 py-3 bg-[#f8fafc] border-b border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
                          {currentUser.roleLabel || currentUser.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                        Last Sign-In: 22-Sep-2026 11:30:14 AM IST
                      </div>
                    </div>

                    {/* Quick Role Switcher for seamless testing */}
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role (One-Click)
                    </div>

                    <div className="px-2 space-y-0.5 max-h-80 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 rounded">
                        Credit Operations (Exposure Authorized)
                      </div>
                      <button
                        onClick={() => handleRoleSwitch('cpa01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'CPA' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">CPA (Rohan Deshmukh)</span>
                          <span className="text-[10px] text-slate-500">Maker • Processing Associate</span>
                        </div>
                        {currentUser.role === 'CPA' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('com01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'COM' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">COM (Amitav Sen)</span>
                          <span className="text-[10px] text-slate-500">Checker • Credit Ops Manager</span>
                        </div>
                        {currentUser.role === 'COM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('acom01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'ACOM' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">ACOM (Priya Sharma)</span>
                          <span className="text-[10px] text-slate-500">Area Credit Ops Manager</span>
                        </div>
                        {currentUser.role === 'ACOM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('rcom01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'RCOM' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">RCOM (Rajiv Mathur)</span>
                          <span className="text-[10px] text-slate-500">Regional Credit Ops Manager</span>
                        </div>
                        {currentUser.role === 'RCOM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('zcom01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'ZCOM' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">ZCOM (Vikram Malhotra)</span>
                          <span className="text-[10px] text-slate-500">Zonal Credit Ops Manager</span>
                        </div>
                        {currentUser.role === 'ZCOM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('ncom01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'NCOM' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">NCOM (Sanjiv Srivastava)</span>
                          <span className="text-[10px] text-slate-500">National Credit Ops Manager</span>
                        </div>
                        {currentUser.role === 'NCOM' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>

                      <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 rounded">
                        Valuers (Exposure Restricted)
                      </div>

                      <button
                        onClick={() => handleRoleSwitch('valuer.ext01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'EXTERNAL_VALUER' ? 'bg-rose-50 font-bold text-rose-900' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">External Valuer (Knight Frank)</span>
                          <span className="text-[10px] text-slate-500">Technical Site Visit & Evidence Only</span>
                        </div>
                        {currentUser.role === 'EXTERNAL_VALUER' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                      </button>

                      <button
                        onClick={() => handleRoleSwitch('valuer.int01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'INTERNAL_VALUER' ? 'bg-rose-50 font-bold text-rose-900' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">Internal Valuer (Direct Cell)</span>
                          <span className="text-[10px] text-slate-500">Technical Valuation & Civil Progress</span>
                        </div>
                        {currentUser.role === 'INTERNAL_VALUER' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                      </button>

                      <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 rounded">
                        Administration & Governance
                      </div>

                      <button
                        onClick={() => handleRoleSwitch('admin01')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-100 ${
                          currentUser.role === 'ADMIN' ? 'bg-sky-50 font-bold text-sky-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block text-xs">Master Admin</span>
                          <span className="text-[10px] text-slate-500">IT & Risk Governance</span>
                        </div>
                        {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      </button>
                    </div>

                    <div className="h-px bg-slate-200 my-1.5" />

                    <div className="px-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>View User Profile Details</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
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
