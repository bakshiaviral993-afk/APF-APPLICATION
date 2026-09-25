import React, { useState, useEffect } from 'react';
import { apfStore } from './services/apfStore';
import { UserAccount } from './types/apfTransaction';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppHeader } from './components/layout/AppHeader';
import { EnterpriseSidebar, NavigationModule } from './components/layout/EnterpriseSidebar';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CaseDetailWorkspace } from './components/workspace/CaseDetailWorkspace';
import { BuilderMasterView } from './components/masters/BuilderMasterView';
import { ProjectMasterView } from './components/masters/ProjectMasterView';
import { TowerMasterView } from './components/masters/TowerMasterView';
import { GlobalExposureView } from './components/views/GlobalExposureView';
import { QueryTrayView } from './components/queries/QueryTrayView';
import { NewCaseModal } from './components/modals/NewCaseModal';
import { PendingMasterApprovalsModal } from './components/masters/PendingMasterApprovalsModal';
import { PageHeaderNav } from './components/common/PageHeaderNav';

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

  const handleCaseCreated = (newCaseId: string) => {
    setIsNewCaseModalOpen(false);
    handleOpenCase(newCaseId);
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
          onInitiateCase={() => setIsNewCaseModalOpen(true)}
          onOpenApprovals={() => setIsGlobalApprovalsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 lg:p-4 bg-slate-50/70">
          {activeView === 'CASE_DETAIL' && activeCaseId ? (
            <CaseDetailWorkspace
              caseId={activeCaseId}
              currentUser={currentUser}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'BUILDER_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Builder Master"
                pageTitle="Builder Entity Master"
                subtitle="Centralized Master Data Management • Corporate KYC & Exposure Limits"
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <BuilderMasterView
                currentUser={currentUser}
                onNavigateToProjects={(builderId) => {
                  setActiveView('PROJECT_MASTER');
                }}
                onNavigateToExposure={(builderId) => {
                  if (builderId) setSelectedBuilderIdForExposure(builderId);
                  setActiveView('EXPOSURE');
                }}
                onStartApfTransaction={(builderId, projectId) => {
                  setIsNewCaseModalOpen(true);
                }}
              />
            </div>
          ) : activeView === 'PROJECT_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Project Master"
                pageTitle="Project & Phased Development Master"
                subtitle="Statutory Clearances, MahaRERA & Phased Registrations"
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
                onStartApfTransaction={(builderId, projectId) => {
                  setIsNewCaseModalOpen(true);
                }}
              />
            </div>
          ) : activeView === 'TOWER_MASTER' ? (
            <div>
              <PageHeaderNav
                moduleName="Tower Master"
                pageTitle="Tower, Wing & Unit Masters"
                subtitle="Structural sanctions, slab casting stages & individual unit status"
                onBack={() => setActiveView('PROJECT_MASTER')}
                onGoHome={handleBackToDashboard}
              />
              <TowerMasterView
                currentUser={currentUser}
                initialProjectId={selectedProjectIdForTowers}
              />
            </div>
          ) : activeView === 'EXPOSURE' ? (
            <div>
              <PageHeaderNav
                moduleName="Exposure 360"
                pageTitle="Enterprise Exposure Reconciliation 360"
                subtitle="Multi-Source External Debt & Group Financial Consolidation"
                onBack={handleBackToDashboard}
                onGoHome={handleBackToDashboard}
              />
              <GlobalExposureView
                currentUser={currentUser}
                initialBuilderId={selectedBuilderIdForExposure}
                onNavigateBack={handleBackToDashboard}
                onNavigateToValuation={() => setActiveView('MY_CASES')}
              />
            </div>
          ) : activeView === 'QUERY_TRAY' ? (
            <QueryTrayView
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onBack={handleBackToDashboard}
            />
          ) : activeView === 'MY_CASES' ? (
            <UserDashboard
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onInitiateNewCase={() => setIsNewCaseModalOpen(true)}
              onNavigateToQueries={(tab) => setActiveView('QUERY_TRAY')}
            />
          ) : (
            <UserDashboard
              currentUser={currentUser}
              onOpenCase={handleOpenCase}
              onInitiateNewCase={() => setIsNewCaseModalOpen(true)}
              onNavigateToQueries={(tab) => setActiveView('QUERY_TRAY')}
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
