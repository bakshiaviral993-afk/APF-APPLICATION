import React, { useState, useEffect } from 'react';
import { apfStore } from './services/apfStore';
import { UserAccount } from './types/apfTransaction';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppHeader } from './components/layout/AppHeader';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CaseDetailWorkspace } from './components/workspace/CaseDetailWorkspace';
import { BuilderMasterView } from './components/masters/BuilderMasterView';
import { ProjectMasterView } from './components/masters/ProjectMasterView';
import { GlobalExposureView } from './components/views/GlobalExposureView';
import { NewCaseModal } from './components/modals/NewCaseModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => apfStore.getCurrentUser());
  const [activeView, setActiveView] = useState<
    'DASHBOARD' | 'MY_CASES' | 'BUILDER_MASTER' | 'PROJECT_MASTER' | 'EXPOSURE' | 'REPORTS' | 'CASE_DETAIL'
  >('DASHBOARD');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
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
        activeView={activeView === 'CASE_DETAIL' ? 'DASHBOARD' : activeView}
        onNavigate={(view) => {
          setActiveCaseId(null);
          setActiveView(view);
        }}
        onLogout={handleLogout}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'CASE_DETAIL' && activeCaseId ? (
          <CaseDetailWorkspace
            caseId={activeCaseId}
            currentUser={currentUser}
            onBack={handleBackToDashboard}
          />
        ) : activeView === 'BUILDER_MASTER' ? (
          <BuilderMasterView />
        ) : activeView === 'PROJECT_MASTER' ? (
          <ProjectMasterView />
        ) : activeView === 'EXPOSURE' ? (
          <GlobalExposureView />
        ) : (
          <UserDashboard
            currentUser={currentUser}
            onOpenCase={handleOpenCase}
            onInitiateNewCase={() => setIsNewCaseModalOpen(true)}
          />
        )}
      </main>

      {/* CPA Initiation Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
};

export default App;
