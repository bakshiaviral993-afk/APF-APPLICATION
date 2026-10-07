import React, { useState, useEffect } from 'react';
import { apfStore } from './services/apfStore';
import { UserAccount } from './types/apfTransaction';
import { NavigationModule } from './types/navigation';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppHeader } from './components/layout/AppHeader';
import { EnterpriseSidebar } from './components/layout/EnterpriseSidebar';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CaseDetailWorkspace } from './components/workspace/CaseDetailWorkspace';
import { MyCasesPage } from './components/workspace/MyCasesPage';
import { InitiateAPFPage } from './components/workspace/InitiateAPFPage';
import { BuilderMasterView } from './components/masters/BuilderMasterView';
import { ProjectMasterView } from './components/masters/ProjectMasterView';
import { TowerMasterView } from './components/masters/TowerMasterView';
import { ValuationLandingView } from './components/valuation/ValuationLandingView';
import { LegalLandingView } from './components/legal/LegalLandingView';
import { GlobalExposureView } from './components/views/GlobalExposureView';
import { CpaReviewView } from './components/decisioning/CpaReviewView';
import { ComReviewView } from './components/decisioning/ComReviewView';
import { ApprovalCockpitView } from './components/decisioning/ApprovalCockpitView';
import { ConditionsRegisterView } from './components/decisioning/ConditionsRegisterView';
import { VendorManagementView } from './components/vendors/VendorManagementView';
import { BillingModuleView } from './components/billing/BillingModuleView';
import { LosIntegrationsView } from './components/operations/LosIntegrationsView';
import { DocumentVaultView } from './components/governance/DocumentVaultView';
import { ReportsLandingView } from './components/reports/ReportsLandingView';
import { AdminConfigurationView } from './components/governance/AdminConfigurationView';
import { QueryTrayView } from './components/queries/QueryTrayView';
import { NewCaseModal } from './components/modals/NewCaseModal';
import { PendingMasterApprovalsModal } from './components/masters/PendingMasterApprovalsModal';
import { PageHeaderNav } from './components/common/PageHeaderNav';
import { ExternalLegalPortal } from './components/externalLegal/ExternalLegalPortal';
import { ExternalValuerPortal } from './components/externalValuer/ExternalValuerPortal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => apfStore.getCurrentUser());
  const [activeView, setActiveView] = useState<NavigationModule>('DASHBOARD');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [selectedProjectIdForTowers, setSelectedProjectIdForTowers] = useState<string | undefined>(undefined);
  const [selectedBuilderIdForExposure, setSelectedBuilderIdForExposure] = useState<string>('BLD-PUN-001');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isGlobalApprovalsModalOpen, setIsGlobalApprovalsModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to store state changes
  useEffect(() => {
    const unsubscribe = apfStore.subscribe(() => {
      setCurrentUser(apfStore.getCurrentUser());
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveView('CASE_DETAIL');
  };

  const handleBackToDashboard = () => {
    setActiveCaseId(null);
    setActiveView('DASHBOARD');
  };

  const handleCaseCreated = (createdCase: any) => {
    setIsNewCaseModalOpen(false);
    const cId = typeof createdCase === 'string' ? createdCase : createdCase.id;
    handleOpenCase(cId);
  };

  const handleLogout = () => {
    apfStore.logout();
    setCurrentUser(null);
    setActiveCaseId(null);
    setActiveView('DASHBOARD');
  };

  const handleNavigateToTowers = (projectId: string) => {
    setSelectedProjectIdForTowers(projectId);
    setActiveView('TOWER_MASTER');
  };

  const handleNavigateToModule = (module: NavigationModule, caseId?: string) => {
    if (caseId) {
      setActiveCaseId(caseId);
    }
    setActiveView(module);
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setCurrentUser(apfStore.getCurrentUser());
          setActiveView('DASHBOARD');
        }}
      />
    );
  }

  // Mandatory role-based separation: External Legal users access dedicated External Legal Portal
  const isExternalLegal =
    currentUser.role === 'EXTERNAL_LEGAL_ADVOCATE' ||
    currentUser.role === 'EXTERNAL_LEGAL_FIRM_ADMIN' ||
    currentUser.role === 'EXTERNAL_LEGAL_FIRM_USER';

  if (isExternalLegal) {
    return (
      <ExternalLegalPortal
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={(_username) => {
          setCurrentUser(apfStore.getCurrentUser());
        }}
      />
    );
  }

  // Mandatory role-based separation: External Valuer users access dedicated External Valuer Portal
  const isExternalValuer = currentUser.role === 'EXTERNAL_VALUER';

  if (isExternalValuer) {
    return (
      <ExternalValuerPortal
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={(_username) => {
          setCurrentUser(apfStore.getCurrentUser());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f6f9] text-[#102a43] flex flex-col font-sans">
      {/* Top Application Header */}
      <AppHeader
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveCaseId(null);
          if (view !== 'TOWER_MASTER') {
            setSelectedProjectIdForTowers(undefined);
          }
          setActiveView(view);
        }}
        onLogout={handleLogout}
        onOpenApprovals={() => setIsGlobalApprovalsModalOpen(true)}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Page Body with Collapsible Enterprise Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <EnterpriseSidebar
          currentUser={currentUser}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveCaseId(null);
            if (view !== 'TOWER_MASTER') {
              setSelectedProjectIdForTowers(undefined);
            }
            setActiveView(view);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onInitiateCase={() => setActiveView('INITIATE_APF')}
          onOpenApprovals={() => setIsGlobalApprovalsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 lg:p-4 bg-slate-50/70">
          {/* Level 1: Workspace */}
          {activeView === 'CASE_DETAIL' && activeCaseId ? (
            <CaseDetailWorkspace
              caseId={activeCaseId}
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onNavigateToModule={handleNavigateToModule}
            />
          ) : activeView === 'MY_CASES' ? (
            <MyCasesPage
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onInitiateNewCase={() => setActiveView('INITIATE_APF')}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'INITIATE_APF' ? (
            <InitiateAPFPage
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onCaseCreated={handleCaseCreated}
            />
          ) : activeView === 'QUERY_TRAY' ? (
            <QueryTrayView
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onBack={handleBackToDashboard}
            />
          ) : /* Level 1: Master Data */
          activeView === 'BUILDER_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Builder Management"
                pageTitle="Builder Entity Master & Group Portfolio"
                subtitle="Centralized Master Data • KYC, Promoter Screening & Group Limits"
                breadcrumbs={[{ label: 'Master Data', onClick: handleBackToDashboard }, { label: 'Builder Management' }]}
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <BuilderMasterView
                currentUser={currentUser}
                onNavigateToProjects={(_builderId) => {
                  setActiveView('PROJECT_MASTER');
                }}
                onNavigateToExposure={(builderId) => {
                  if (builderId) setSelectedBuilderIdForExposure(builderId);
                  setActiveView('EXPOSURE');
                }}
                onStartApfTransaction={(_builderId, _projectId) => {
                  setActiveView('INITIATE_APF');
                }}
              />
            </div>
          ) : activeView === 'PROJECT_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Project Management"
                pageTitle="Project & Phased Development Master"
                subtitle="Statutory Clearances, MahaRERA & Phased Registrations"
                breadcrumbs={[{ label: 'Master Data', onClick: handleBackToDashboard }, { label: 'Project Management' }]}
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <ProjectMasterView
                currentUser={currentUser}
                onNavigateToTowers={handleNavigateToTowers}
                onNavigateToExposure={(builderId) => {
                  if (builderId) setSelectedBuilderIdForExposure(builderId);
                  setActiveView('EXPOSURE');
                }}
                onStartApfTransaction={(_builderId, _projectId) => {
                  setActiveView('INITIATE_APF');
                }}
              />
            </div>
          ) : activeView === 'TOWER_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Towers & Units"
                pageTitle="Tower, Wing & Unit Configuration Masters"
                subtitle="Structural sanctions, slab casting stages & individual unit status"
                breadcrumbs={[{ label: 'Master Data', onClick: handleBackToDashboard }, { label: 'Towers & Units' }]}
                onBack={() => setActiveView('PROJECT_MASTER')}
                onGoHome={handleBackToDashboard}
              />
              <TowerMasterView
                currentUser={currentUser}
                initialProjectId={selectedProjectIdForTowers}
              />
            </div>
          ) : /* Level 1: Underwriting */
          activeView === 'VALUATION_MODULE' ? (
            <ValuationLandingView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
            />
          ) : activeView === 'LEGAL_DD' ? (
            <LegalLandingView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
              onNavigateToExposure={() => setActiveView('EXPOSURE')}
              onNavigateToQueries={() => setActiveView('QUERY_TRAY')}
            />
          ) : activeView === 'EXPOSURE' ? (
            <div>
              <PageHeaderNav
                moduleName="Exposure 360"
                pageTitle="Enterprise Exposure Reconciliation 360"
                subtitle="Multi-Source External Debt & Group Financial Consolidation"
                breadcrumbs={[{ label: 'Underwriting', onClick: handleBackToDashboard }, { label: 'Exposure 360' }]}
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <GlobalExposureView
                currentUser={currentUser}
                initialBuilderId={selectedBuilderIdForExposure}
                onNavigateBack={handleBackToDashboard}
                onNavigateToValuation={() => setActiveView('VALUATION_MODULE')}
              />
            </div>
          ) : /* Level 1: Decisioning */
          activeView === 'CPA_REVIEW' ? (
            <CpaReviewView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
              onNavigateToQueries={() => setActiveView('QUERY_TRAY')}
            />
          ) : activeView === 'COM_REVIEW' ? (
            <ComReviewView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
              onNavigateToApproval={() => setActiveView('APPROVAL_COCKPIT')}
              onNavigateToQueries={() => setActiveView('QUERY_TRAY')}
            />
          ) : activeView === 'APPROVAL_COCKPIT' ? (
            <ApprovalCockpitView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
              onNavigateToConditions={() => setActiveView('CONDITIONS_REGISTER')}
            />
          ) : activeView === 'CONDITIONS_REGISTER' ? (
            <ConditionsRegisterView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
            />
          ) : /* Level 1: Operations */
          activeView === 'VENDOR_MANAGEMENT' ? (
            <VendorManagementView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'BILLING' ? (
            <div className="space-y-3">
              <PageHeaderNav
                moduleName="Billing & Payments"
                pageTitle="Vendor Billing & Settlement Desk"
                subtitle="External Valuers & Legal Advocates • Rate Card Engine • Maker-Checker • Finance ERP • UTR Tracking"
                breadcrumbs={[{ label: 'Operations', onClick: handleBackToDashboard }, { label: 'Billing & Payments' }]}
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <div className="max-w-7xl mx-auto pb-10">
                <BillingModuleView
                  currentUser={currentUser}
                  onNavigateToCase={(caseId) => handleOpenCase(caseId)}
                />
              </div>
            </div>
          ) : activeView === 'LOS_INTEGRATIONS' ? (
            <LosIntegrationsView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onOpenCase={handleOpenCase}
            />
          ) : /* Level 1: Governance */
          activeView === 'DOCUMENT_VAULT' ? (
            <DocumentVaultView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'REPORTS' ? (
            <ReportsLandingView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'ADMIN_CONFIG' ? (
            <AdminConfigurationView
              currentUser={currentUser}
              onBack={handleBackToDashboard}
            />
          ) : (
            /* Default: DASHBOARD (role-based overview) */
            <UserDashboard
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onInitiateNewCase={() => setActiveView('INITIATE_APF')}
              onNavigateToQueries={() => setActiveView('QUERY_TRAY')}
            />
          )}
        </main>
      </div>

      {/* CPA Initiation Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />

      {/* Global Master Data Maker-Checker Approvals Modal */}
      {isGlobalApprovalsModalOpen && (
        <PendingMasterApprovalsModal
          isOpen={isGlobalApprovalsModalOpen}
          onClose={() => setIsGlobalApprovalsModalOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default App;
