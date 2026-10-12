import React from 'react';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import { ExternalValuerDashboardView } from '../dashboard/roles/ExternalValuerDashboardView';

interface ExternalValuerDashboardProps {
  currentUser: UserAccount;
  cases: APFCase[];
  onOpenCase: (caseId: string) => void;
  onOpenSiteVisit: (caseId: string) => void;
  onNavigateToBilling?: () => void;
}

export const ExternalValuerDashboard: React.FC<ExternalValuerDashboardProps> = ({
  currentUser,
  onOpenCase,
  onOpenSiteVisit,
  onNavigateToBilling,
}) => {
  return (
    <ExternalValuerDashboardView
      currentUser={currentUser}
      onOpenCase={onOpenCase}
      onOpenSiteVisit={onOpenSiteVisit}
      onNavigateToBilling={onNavigateToBilling}
    />
  );
};
