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

  // Role-Specific Analytical Dashboards
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
      // Fallback to CPA Command Center for standard underwriting staff
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

export default UserDashboard;
