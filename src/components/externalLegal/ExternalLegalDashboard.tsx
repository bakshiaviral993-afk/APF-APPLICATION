import React from 'react';
import {
  LegalAssignment,
  LegalDueDiligenceReport,
} from '../../types/legalDueDiligence';
import { UserAccount } from '../../types/apfTransaction';
import { ExternalLegalDashboardView } from '../dashboard/roles/ExternalLegalDashboardView';

interface ExternalLegalDashboardProps {
  currentUser: UserAccount;
  assignments: LegalAssignment[];
  reports: LegalDueDiligenceReport[];
  onOpenCase: (caseId: string) => void;
  onAcceptDecline: (assignment: LegalAssignment) => void;
  onNavigateToBilling: () => void;
  onReallocate?: (assignmentId: string, newUserId: string, newUserName: string) => void;
}

export const ExternalLegalDashboard: React.FC<ExternalLegalDashboardProps> = ({
  currentUser,
  assignments,
  reports,
  onOpenCase,
  onAcceptDecline,
  onNavigateToBilling,
}) => {
  return (
    <ExternalLegalDashboardView
      currentUser={currentUser}
      onOpenCase={onOpenCase}
      onNavigateToBilling={onNavigateToBilling}
      onNavigateToWorkspace={(assignmentId) => {
        if (assignmentId) {
          const matched = assignments.find((a) => a.id === assignmentId);
          if (matched) {
            onOpenCase(matched.caseId);
            return;
          }
        }
        if (assignments[0]) {
          onOpenCase(assignments[0].caseId);
        }
      }}
    />
  );
};
