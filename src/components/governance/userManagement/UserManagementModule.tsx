import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { UserAccountExtended } from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { PageHeaderNav } from '../../common/PageHeaderNav';
import { UserListView } from './UserListView';
import { CreateUserModal } from './CreateUserModal';
import { UserDetailModal } from './UserDetailModal';
import { RoleManagementView } from './RoleManagementView';
import { ModuleOperationMasterView } from './ModuleOperationMasterView';
import { MakerCheckerQueueView } from './MakerCheckerQueueView';
import { SodRulesView } from './SodRulesView';
import { UserAuditTrailView } from './UserAuditTrailView';
import {
  Users,
  Shield,
  Layers,
  Clock,
  Scale,
  History,
  UserPlus,
} from 'lucide-react';

interface UserManagementModuleProps {
  currentUser: UserAccount;
  onBack: () => void;
  initialTab?: 'USERS' | 'ROLES' | 'MASTERS' | 'MAKER_CHECKER' | 'SOD' | 'AUDIT';
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  currentUser,
  onBack,
  initialTab = 'USERS',
}) => {
  const [activeTab, setActiveTab] = useState<
    'USERS' | 'ROLES' | 'MASTERS' | 'MAKER_CHECKER' | 'SOD' | 'AUDIT'
  >(initialTab);

  const [users, setUsers] = useState<UserAccountExtended[]>(() =>
    userManagementStore.getUsers()
  );

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccountExtended | null>(
    null
  );
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'success' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Subscribe to store updates
  useEffect(() => {
    const handleUpdate = () => {
      setUsers(userManagementStore.getUsers());
    };
    return userManagementStore.subscribe(handleUpdate);
  }, []);

  const pendingChangesCount = userManagementStore
    .getChangeRequests()
    .filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-14">
      {/* Page Header */}
      <PageHeaderNav
        moduleName="User Management"
        pageTitle="Platform Identity, Granular RBAC & Access Control Governance"
        subtitle="Manage platform users, roles, module access and operating permissions."
        breadcrumbs={[{ label: 'Governance', onClick: onBack }, { label: 'User Management' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Create User</span>
          </button>
        }
      />

      {/* Toast */}
      {feedbackToast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in duration-150 ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <span>{feedbackToast.message}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'USERS', label: 'User Directory', icon: Users, count: users.length },
          { id: 'ROLES', label: 'Role Management', icon: Shield },
          { id: 'MASTERS', label: 'Module & Operation Master', icon: Layers },
          {
            id: 'MAKER_CHECKER',
            label: 'Maker-Checker Queue',
            icon: Clock,
            badge: pendingChangesCount > 0 ? pendingChangesCount : undefined,
            badgeColor: 'bg-amber-500 text-slate-950 font-bold',
          },
          { id: 'SOD', label: 'Segregation of Duties (SoD)', icon: Scale },
          { id: 'AUDIT', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'USERS' && (
        <UserListView
          currentUser={currentUser}
          users={users}
          onCreateUser={() => setIsCreateModalOpen(true)}
          onViewUser={(user) => {
            setSelectedUserForDetail(user);
            setIsDetailEditMode(false);
          }}
          onEditUser={(user) => {
            setSelectedUserForDetail(user);
            setIsDetailEditMode(true);
          }}
          onNavigateToMakerChecker={() => setActiveTab('MAKER_CHECKER')}
        />
      )}

      {activeTab === 'ROLES' && <RoleManagementView currentUser={currentUser} />}

      {activeTab === 'MASTERS' && <ModuleOperationMasterView />}

      {activeTab === 'MAKER_CHECKER' && (
        <MakerCheckerQueueView currentUser={currentUser} />
      )}

      {activeTab === 'SOD' && <SodRulesView currentUser={currentUser} />}

      {activeTab === 'AUDIT' && <UserAuditTrailView />}

      {/* Modal 1: Create User Wizard */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        currentUser={currentUser}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={(newUser, requiresApproval) => {
          setUsers(userManagementStore.getUsers());
          if (requiresApproval) {
            showToast(
              `User account ${newUser.fullName} created and routed to Maker-Checker approval queue.`,
              'warning'
            );
          } else {
            showToast(`User account ${newUser.fullName} successfully provisioned and active.`);
          }
        }}
      />

      {/* Modal 2: User Detail & Edit Drawer/Modal */}
      {selectedUserForDetail && (
        <UserDetailModal
          user={selectedUserForDetail}
          currentUser={currentUser}
          initialEditMode={isDetailEditMode}
          onClose={() => setSelectedUserForDetail(null)}
          onUserSaved={(updatedUser, requiresApproval) => {
            setUsers(userManagementStore.getUsers());
            if (requiresApproval) {
              showToast(
                `Changes for ${updatedUser.fullName} submitted to Maker-Checker queue for review.`,
                'warning'
              );
            } else {
              showToast(`User changes committed successfully.`);
            }
          }}
        />
      )}
    </div>
  );
};
