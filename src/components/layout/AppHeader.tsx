import React from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import {
  Building2,
  LogOut,
  Layers,
  MapPin,
  DollarSign,
  FileBarChart,
  User,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface AppHeaderProps {
  currentUser: UserAccount;
  activeView: 'DASHBOARD' | 'MY_CASES' | 'BUILDER_MASTER' | 'PROJECT_MASTER' | 'EXPOSURE' | 'REPORTS';
  onNavigate: (view: 'DASHBOARD' | 'MY_CASES' | 'BUILDER_MASTER' | 'PROJECT_MASTER' | 'EXPOSURE' | 'REPORTS') => void;
  onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onLogout,
}) => {
  const isExternalValuer = currentUser.role === 'EXTERNAL_VALUER';

  return (
    <header className="bg-[#0c3148] text-white border-b border-[#1a4a66] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            onClick={() => onNavigate('DASHBOARD')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#19638c] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>PROVAL APF Intelligence</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-sky-900 text-sky-200 border border-sky-700">
                  Bank POC
                </span>
              </div>
              <p className="text-[10px] text-[#8bb3cb] font-mono leading-none">
                Underwriting & Transaction Workflow
              </p>
            </div>
          </div>

          {/* Role-Aware Navigation Menus */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => onNavigate('DASHBOARD')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeView === 'DASHBOARD'
                  ? 'bg-[#19638c] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('MY_CASES')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeView === 'MY_CASES'
                  ? 'bg-[#19638c] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>My Cases</span>
            </button>

            {/* Masters: Hidden from external valuer */}
            {!isExternalValuer && (
              <>
                <button
                  onClick={() => onNavigate('BUILDER_MASTER')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeView === 'BUILDER_MASTER'
                      ? 'bg-[#19638c] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Builder Master</span>
                </button>

                <button
                  onClick={() => onNavigate('PROJECT_MASTER')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeView === 'PROJECT_MASTER'
                      ? 'bg-[#19638c] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Project Master</span>
                </button>

                <button
                  onClick={() => onNavigate('EXPOSURE')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeView === 'EXPOSURE'
                      ? 'bg-[#19638c] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Exposure 360</span>
                </button>
              </>
            )}
          </nav>

          {/* User Session & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                <span>{currentUser.name}</span>
              </div>
              <div className="text-[10px] text-[#8bb3cb] font-semibold flex items-center justify-end gap-1">
                <Shield className="w-3 h-3 text-sky-400" />
                <span>Role: {currentUser.role}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign out of current role"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
