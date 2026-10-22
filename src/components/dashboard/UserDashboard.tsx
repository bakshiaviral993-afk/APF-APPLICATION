import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { NavigationModule } from '../../types/navigation';
import { CpaDashboardView } from './roles/CpaDashboardView';
import { ComDashboardView } from './roles/ComDashboardView';
import { ApproverDashboardView } from './roles/ApproverDashboardView';
import { InternalValuerDashboardView } from './roles/InternalValuerDashboardView';
import { ExternalValuerDashboardView } from './roles/ExternalValuerDashboardView';
import { InternalLegalDashboardView } from './roles/InternalLegalDashboardView';
import { ExternalLegalDashboardView } from './roles/ExternalLegalDashboardView';
import { ExposureDashboardView } from './roles/ExposureDashboardView';
import { BillingMakerDashboardView } from './roles/BillingMakerDashboardView';
import { BillingCheckerDashboardView } from './roles/BillingCheckerDashboardView';
import { AdminDashboardView } from './roles/AdminDashboardView';
import { ExecutiveDashboardView } from './roles/ExecutiveDashboardView';

import { TatPipelineDashboardView } from './tat/TatPipelineDashboardView';
import { Clock, Layers, ShieldCheck } from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase: () => void;
  onNavigateToQueries?: (tab?: any) => void;
  onNavigateToModule?: (module: NavigationModule, caseId?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
  onNavigateToQueries,
  onNavigateToModule,
}) => {
  const [dashboardTab, setDashboardTab] = useState<'TAT_PIPELINE' | 'ROLE_WORKSPACE'>('TAT_PIPELINE');
  const [isExecutiveMode, setIsExecutiveMode] = useState(false);

  const handleNavigate = (module: NavigationModule, caseId?: string) => {
    if (onNavigateToModule) {
      onNavigateToModule(module, caseId);
    } else if (caseId) {
      onOpenCase(caseId);
    }
  };

  // If Executive mode is active for authorized management roles
  if (isExecutiveMode) {
    return (
      <ExecutiveDashboardView
        currentUser={currentUser}
        onOpenCase={onOpenCase}
        onNavigateToModule={handleNavigate}
        onExitExecutiveMode={() => setIsExecutiveMode(false)}
      />
    );
  }

  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'CPA':
        return (
          <CpaDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onInitiateNewCase={onInitiateNewCase}
            onNavigateToModule={handleNavigate}
            onNavigateToQueries={onNavigateToQueries}
            onToggleExecutiveMode={() => setIsExecutiveMode(true)}
          />
        );

      case 'COM':
      case 'ACOM':
      case 'RCOM':
      case 'ZCOM':
      case 'NCOM':
        return (
          <ComDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
            onToggleExecutiveMode={() => setIsExecutiveMode(true)}
          />
        );

      case 'APPROVER':
      case 'COMMITTEE':
        return (
          <ApproverDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
            onToggleExecutiveMode={() => setIsExecutiveMode(true)}
          />
        );

      case 'INTERNAL_VALUER':
        return (
          <InternalValuerDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
          />
        );

      case 'EXTERNAL_VALUER':
        return (
          <ExternalValuerDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onOpenSiteVisit={(caseId) => onOpenCase(caseId)}
            onNavigateToBilling={() => handleNavigate('BILLING')}
          />
        );

      case 'INTERNAL_LEGAL':
      case 'LEGAL':
        return (
          <InternalLegalDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
          />
        );

      case 'EXTERNAL_LEGAL_ADVOCATE':
      case 'EXTERNAL_LEGAL_FIRM_ADMIN':
      case 'EXTERNAL_LEGAL_FIRM_USER':
        return (
          <ExternalLegalDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToBilling={() => handleNavigate('BILLING')}
            onNavigateToWorkspace={(assignmentId) => handleNavigate('LEGAL_DD', assignmentId)}
          />
        );

      case 'BILLING_MAKER':
        return (
          <BillingMakerDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
          />
        );

      case 'BILLING_CHECKER':
        return (
          <BillingCheckerDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
          />
        );

      case 'ADMIN':
        return (
          <AdminDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onNavigateToModule={handleNavigate}
            onToggleExecutiveMode={() => setIsExecutiveMode(true)}
          />
        );

      default:
        return (
          <CpaDashboardView
            currentUser={currentUser}
            onOpenCase={onOpenCase}
            onInitiateNewCase={onInitiateNewCase}
            onNavigateToModule={handleNavigate}
            onNavigateToQueries={onNavigateToQueries}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Universal Dashboard View Switcher */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg">
          <button
            type="button"
            onClick={() => setDashboardTab('TAT_PIPELINE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              dashboardTab === 'TAT_PIPELINE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⏱ End-to-End TAT &amp; User Pending Matrix</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                dashboardTab === 'TAT_PIPELINE' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Initiate → Completion
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('ROLE_WORKSPACE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              dashboardTab === 'ROLE_WORKSPACE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Role Operational Workspace ({currentUser.role})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px] text-slate-600">Active SLA Surveillance &bull; 10-Day Mandate</span>
        </div>
      </div>

      {dashboardTab === 'TAT_PIPELINE' ? (
        <TatPipelineDashboardView
          currentUser={currentUser}
          onOpenCase={onOpenCase}
          onInitiateNewCase={onInitiateNewCase}
          onNavigateToModule={handleNavigate}
        />
      ) : (
        renderRoleDashboard()
      )}
    </div>
  );
};

export default UserDashboard;
