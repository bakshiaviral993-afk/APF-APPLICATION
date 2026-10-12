import {
  UserAccountExtended,
  RoleDefinition,
  ModuleDefinition,
  OperationDefinition,
  SodRule,
  UserManagementAuditLog,
  UserAccessChangeRequest,
  UserAccountStatus,
  OperationId,
  UserPermissionOverride,
  BusinessScope,
} from '../types/userManagementTypes';
import {
  INITIAL_USER_ACCOUNTS,
  SYSTEM_DEFAULT_ROLES,
  SYSTEM_MODULES,
  SYSTEM_OPERATIONS,
  SYSTEM_SOD_RULES,
  INITIAL_USER_AUDIT_LOGS,
} from '../data/userManagementDataset';

const STORAGE_USERS = 'proval_users_v2';
const STORAGE_ROLES = 'proval_roles_v2';
const STORAGE_AUDIT = 'proval_user_audit_v2';
const STORAGE_CHANGES = 'proval_user_change_requests_v2';
const STORAGE_MC_FLAG = 'proval_user_mc_enabled_v2';

export class UserManagementStore {
  private users: UserAccountExtended[] = [];
  private roles: RoleDefinition[] = [];
  private modules: ModuleDefinition[] = [];
  private operations: OperationDefinition[] = [];
  private sodRules: SodRule[] = [];
  private auditLogs: UserManagementAuditLog[] = [];
  private changeRequests: UserAccessChangeRequest[] = [];
  private makerCheckerEnabled: boolean = true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.modules = [...SYSTEM_MODULES];
    this.operations = [...SYSTEM_OPERATIONS];
    this.sodRules = [...SYSTEM_SOD_RULES];
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...INITIAL_USER_ACCOUNTS];
      }

      const storedRoles = localStorage.getItem(STORAGE_ROLES);
      if (storedRoles) {
        this.roles = JSON.parse(storedRoles);
      } else {
        this.roles = [...SYSTEM_DEFAULT_ROLES];
      }

      const storedAudit = localStorage.getItem(STORAGE_AUDIT);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [...INITIAL_USER_AUDIT_LOGS];
      }

      const storedChanges = localStorage.getItem(STORAGE_CHANGES);
      if (storedChanges) {
        this.changeRequests = JSON.parse(storedChanges);
      } else {
        // Initial sample pending requests for Maker-Checker showcase
        this.changeRequests = [
          {
            id: 'CHG-2026-0001',
            targetUserId: 'USR-CPA-001',
            targetUserName: 'Vikramaditya Joshi',
            targetUserEmail: 'vikram.joshi@proval.bank.in',
            changeType: 'MODIFY_PERMISSIONS',
            summary: 'Grant User Override: Freeze Snapshot on Exposure 360',
            details: {
              operationsGranted: ['FREEZE'],
              modulesAdded: ['MOD_EXPOSURE_360'],
            },
            reason: 'Senior CPA lead required to seal credit exposure snapshots during quarterly audit closure.',
            requestedBy: 'System Administrator',
            requestedByRole: 'ADMIN',
            requestedAt: '2026-10-10 11:45 IST',
            status: 'PENDING_APPROVAL',
          },
          {
            id: 'CHG-2026-0002',
            targetUserId: 'USR-LCK-001',
            targetUserName: 'Deepak V. Sawant',
            targetUserEmail: 'deepak.sawant@proval.bank.in',
            changeType: 'ACCOUNT_UNLOCK',
            summary: 'Unlock account and reset failed password lockout counter',
            details: {
              statusChange: { from: 'LOCKED', to: 'ACTIVE' },
            },
            reason: 'Identity verified over verified corporate branch call; IT security ticket SEC-8891 approved.',
            requestedBy: 'Rajesh K. Verma',
            requestedByRole: 'COM',
            requestedAt: '2026-10-11 14:15 IST',
            status: 'PENDING_APPROVAL',
          },
        ];
      }

      const storedMcFlag = localStorage.getItem(STORAGE_MC_FLAG);
      if (storedMcFlag !== null) {
        this.makerCheckerEnabled = JSON.parse(storedMcFlag);
      }
    } catch (e) {
      console.error('Failed to load UserManagement data from storage', e);
      this.users = [...INITIAL_USER_ACCOUNTS];
      this.roles = [...SYSTEM_DEFAULT_ROLES];
      this.auditLogs = [...INITIAL_USER_AUDIT_LOGS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_ROLES, JSON.stringify(this.roles));
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_CHANGES, JSON.stringify(this.changeRequests));
      localStorage.setItem(STORAGE_MC_FLAG, JSON.stringify(this.makerCheckerEnabled));
    } catch (e) {
      console.error('Failed to save UserManagement data to storage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error notifying user store listener', e);
      }
    });
  }

  // --- Read Operations ---
  public getUsers(): UserAccountExtended[] {
    return [...this.users];
  }

  public getUserById(id: string): UserAccountExtended | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getRoles(): RoleDefinition[] {
    return [...this.roles];
  }

  public getRoleById(id: string): RoleDefinition | undefined {
    return this.roles.find((r) => r.id === id || r.roleKey === id);
  }

  public getModules(): ModuleDefinition[] {
    return [...this.modules];
  }

  public getModuleById(id: string): ModuleDefinition | undefined {
    return this.modules.find((m) => m.id === id || m.navigationModuleKey === id);
  }

  public getOperations(): OperationDefinition[] {
    return [...this.operations];
  }

  public getSodRules(): SodRule[] {
    return [...this.sodRules];
  }

  public getAuditLogs(userId?: string): UserManagementAuditLog[] {
    if (userId) {
      return this.auditLogs.filter((a) => a.targetUserId === userId);
    }
    return [...this.auditLogs];
  }

  public getChangeRequests(): UserAccessChangeRequest[] {
    return [...this.changeRequests];
  }

  public isMakerCheckerEnabled(): boolean {
    return this.makerCheckerEnabled;
  }

  public setMakerCheckerEnabled(enabled: boolean) {
    this.makerCheckerEnabled = enabled;
    this.saveToStorage();
  }

  // --- Segregation of Duties (SoD) Conflict Detection ---
  public checkSodConflicts(rolesList: string[]): {
    hasCriticalConflict: boolean;
    conflicts: SodRule[];
  } {
    const conflicts: SodRule[] = [];
    for (const rule of this.sodRules) {
      const hasA = rolesList.includes(rule.roleA);
      const hasB = rolesList.includes(rule.roleB);
      if (hasA && hasB) {
        conflicts.push(rule);
      }
    }
    const hasCriticalConflict = conflicts.some((c) => c.severity === 'CRITICAL_BLOCK');
    return { hasCriticalConflict, conflicts };
  }

  // --- Effective Permission Resolution ---
  // Merges: Primary Role Permissions + Additional Roles Permissions + User Custom Overrides
  public getEffectiveUserPermissions(user: UserAccountExtended): {
    permissions: Record<string, {
      operations: OperationId[];
      inheritedFromRoles: Record<OperationId, string[]>;
      overriddenOperations: Record<OperationId, { granted: boolean; reason?: string }>;
    }>;
  } {
    const result: Record<string, {
      operations: OperationId[];
      inheritedFromRoles: Record<OperationId, string[]>;
      overriddenOperations: Record<OperationId, { granted: boolean; reason?: string }>;
    }> = {};

    const allUserRoles = [user.primaryRole, ...user.additionalRoles];

    // Initialize all modules
    for (const mod of this.modules) {
      result[mod.id] = {
        operations: [],
        inheritedFromRoles: {} as Record<OperationId, string[]>,
        overriddenOperations: {} as Record<OperationId, { granted: boolean; reason?: string }>,
      };
    }

    // Accumulate from roles
    for (const rKey of allUserRoles) {
      const roleDef = this.roles.find((r) => r.roleKey === rKey || r.id === rKey);
      if (!roleDef) continue;

      for (const modId in roleDef.permissions) {
        const ops = roleDef.permissions[modId] || [];
        if (!result[modId]) {
          result[modId] = {
            operations: [],
            inheritedFromRoles: {} as Record<OperationId, string[]>,
            overriddenOperations: {} as Record<OperationId, { granted: boolean; reason?: string }>,
          };
        }
        for (const op of ops) {
          if (!result[modId].inheritedFromRoles[op]) {
            result[modId].inheritedFromRoles[op] = [];
          }
          if (!result[modId].inheritedFromRoles[op].includes(roleDef.name)) {
            result[modId].inheritedFromRoles[op].push(roleDef.name);
          }
          if (!result[modId].operations.includes(op)) {
            result[modId].operations.push(op);
          }
        }
      }
    }

    // Apply User-Level Overrides
    for (const override of user.customOverrides || []) {
      const mod = result[override.moduleId];
      if (!mod) continue;

      mod.overriddenOperations[override.operationId] = {
        granted: override.granted,
        reason: override.reason,
      };

      if (override.granted) {
        if (!mod.operations.includes(override.operationId)) {
          mod.operations.push(override.operationId);
        }
      } else {
        mod.operations = mod.operations.filter((op) => op !== override.operationId);
      }
    }

    return { permissions: result };
  }

  // Check if user has specific module + operation permission
  public hasUserPermission(user: UserAccountExtended, moduleId: string, operationId: OperationId): boolean {
    const { permissions } = this.getEffectiveUserPermissions(user);
    const mod = permissions[moduleId];
    if (!mod) return false;
    return mod.operations.includes(operationId);
  }

  // --- Write Operations ---
  public createUser(
    userData: Omit<UserAccountExtended, 'id' | 'createdAt' | 'updatedAt' | 'avatarInitials' | 'createdBy' | 'updatedBy'>,
    performedBy: { name: string; role: string }
  ): { user: UserAccountExtended; requiresApproval: boolean; changeRequest?: UserAccessChangeRequest } {
    const newId = `USR-${userData.primaryRole.slice(0, 3)}-${String(this.users.length + 1).padStart(3, '0')}`;
    const initials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
    const timestamp = new Date().toISOString();

    const isSensitiveRole = ['ADMIN', 'APPROVER', 'COMMITTEE', 'BILLING_CHECKER'].includes(userData.primaryRole);

    const newUser: UserAccountExtended = {
      ...userData,
      id: newId,
      createdAt: timestamp,
      createdBy: performedBy.name,
      updatedAt: timestamp,
      updatedBy: performedBy.name,
      avatarInitials: initials,
      status: (this.makerCheckerEnabled && isSensitiveRole) ? 'PENDING_APPROVAL' : userData.status,
    };

    let changeRequest: UserAccessChangeRequest | undefined;

    if (this.makerCheckerEnabled && isSensitiveRole) {
      changeRequest = {
        id: `CHG-${Date.now().toString().slice(-4)}`,
        targetUserId: newUser.id,
        targetUserName: newUser.fullName,
        targetUserEmail: newUser.email,
        changeType: 'CREATE_USER',
        summary: `New User Provisioning for sensitive role ${newUser.primaryRole}`,
        details: {
          newValue: newUser,
          rolesAdded: [newUser.primaryRole, ...newUser.additionalRoles],
        },
        reason: 'Enterprise governance requires independent checker sign-off for sensitive role creation.',
        requestedBy: performedBy.name,
        requestedByRole: performedBy.role,
        requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
        status: 'PENDING_APPROVAL',
      };
      this.changeRequests.unshift(changeRequest);
      newUser.pendingChangeRequestId = changeRequest.id;
    }

    this.users.unshift(newUser);

    // Audit Log
    this.addAuditLog({
      targetUserId: newUser.id,
      targetUserName: newUser.fullName,
      eventType: 'USER_CREATED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'ACCOUNT',
      oldValue: 'NONE',
      newValue: `Created as ${newUser.primaryRole} (${newUser.status})`,
      reason: 'User account provisioned via Enterprise User Management',
    });

    this.saveToStorage();
    return {
      user: newUser,
      requiresApproval: !!changeRequest,
      changeRequest,
    };
  }

  public updateUser(
    updatedUser: UserAccountExtended,
    performedBy: { name: string; role: string },
    reason: string,
    diffSummary?: {
      rolesChanged?: boolean;
      modulesChanged?: boolean;
      scopeChanged?: boolean;
      statusChanged?: boolean;
      summaryList?: string[];
    }
  ): { user: UserAccountExtended; requiresApproval: boolean; changeRequest?: UserAccessChangeRequest } {
    const existingIndex = this.users.findIndex((u) => u.id === updatedUser.id);
    if (existingIndex === -1) {
      throw new Error(`User with ID ${updatedUser.id} not found.`);
    }

    const previous = this.users[existingIndex];
    const isSensitiveRole = ['ADMIN', 'APPROVER', 'COMMITTEE', 'BILLING_CHECKER'].includes(updatedUser.primaryRole) ||
      ['ADMIN', 'APPROVER', 'COMMITTEE', 'BILLING_CHECKER'].includes(previous.primaryRole);

    let changeRequest: UserAccessChangeRequest | undefined;

    // Check if sensitive maker-checker routing required
    if (this.makerCheckerEnabled && isSensitiveRole && performedBy.role !== 'SYSTEM_ADMIN_BYPASS') {
      changeRequest = {
        id: `CHG-${Date.now().toString().slice(-4)}`,
        targetUserId: updatedUser.id,
        targetUserName: updatedUser.fullName,
        targetUserEmail: updatedUser.email,
        changeType: diffSummary?.rolesChanged ? 'MODIFY_ROLES' : 'MODIFY_PERMISSIONS',
        summary: diffSummary?.summaryList?.join('; ') || `Account modification for ${updatedUser.fullName}`,
        details: {
          oldValue: previous,
          newValue: updatedUser,
        },
        reason: reason || 'Enterprise modification requires checker authorization.',
        requestedBy: performedBy.name,
        requestedByRole: performedBy.role,
        requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
        status: 'PENDING_APPROVAL',
      };

      this.changeRequests.unshift(changeRequest);
      // Mark user as having pending change
      updatedUser.pendingChangeRequestId = changeRequest.id;
    }

    updatedUser.updatedAt = new Date().toISOString();
    updatedUser.updatedBy = performedBy.name;
    this.users[existingIndex] = updatedUser;

    this.addAuditLog({
      targetUserId: updatedUser.id,
      targetUserName: updatedUser.fullName,
      eventType: 'USER_MODIFIED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'PROFILE_PERMISSIONS',
      oldValue: `${previous.primaryRole} [${previous.status}]`,
      newValue: `${updatedUser.primaryRole} [${updatedUser.status}]`,
      reason: reason || 'User record updated',
    });

    this.saveToStorage();
    return {
      user: updatedUser,
      requiresApproval: !!changeRequest,
      changeRequest,
    };
  }

  public setUserStatus(
    userId: string,
    newStatus: UserAccountStatus,
    performedBy: { name: string; role: string },
    reason: string
  ): UserAccountExtended {
    const user = this.getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const oldStatus = user.status;
    user.status = newStatus;
    user.updatedAt = new Date().toISOString();
    user.updatedBy = performedBy.name;

    if (newStatus === 'LOCKED') {
      user.security.isLocked = true;
      user.security.lockedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST';
      user.security.lockedReason = reason || 'Administrative lockout';
    } else if (oldStatus === 'LOCKED' && newStatus === 'ACTIVE') {
      user.security.isLocked = false;
      user.security.failedLoginAttempts = 0;
      user.security.lockedReason = undefined;
    }

    this.addAuditLog({
      targetUserId: user.id,
      targetUserName: user.fullName,
      eventType: newStatus === 'ACTIVE' ? 'USER_ACTIVATED' : newStatus === 'INACTIVE' ? 'USER_DEACTIVATED' : 'USER_LOCKED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'STATUS',
      oldValue: oldStatus,
      newValue: newStatus,
      reason: reason || `Status changed to ${newStatus}`,
    });

    this.saveToStorage();
    return user;
  }

  public resetUserPassword(
    userId: string,
    performedBy: { name: string; role: string }
  ): { tempPassword: string; user: UserAccountExtended } {
    const user = this.getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const tempPassword = `Proval@${Math.floor(100000 + Math.random() * 900000)}`;
    user.security.lastPasswordChangeAt = new Date().toISOString().slice(0, 10);
    user.security.forcePasswordChangeOnNextLogin = true;
    user.security.failedLoginAttempts = 0;
    user.updatedAt = new Date().toISOString();
    user.updatedBy = performedBy.name;

    this.addAuditLog({
      targetUserId: user.id,
      targetUserName: user.fullName,
      eventType: 'PASSWORD_RESET',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'CREDENTIALS',
      oldValue: 'HASHED_SECRET',
      newValue: 'TEMPORARY_TOKEN_ISSUED',
      reason: 'Administrative self-service / helpdesk credential reset',
    });

    this.saveToStorage();
    return { tempPassword, user };
  }

  public unlockUser(
    userId: string,
    performedBy: { name: string; role: string }
  ): UserAccountExtended {
    const user = this.getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    user.status = 'ACTIVE';
    user.security.isLocked = false;
    user.security.failedLoginAttempts = 0;
    user.security.lockedReason = undefined;
    user.updatedAt = new Date().toISOString();
    user.updatedBy = performedBy.name;

    this.addAuditLog({
      targetUserId: user.id,
      targetUserName: user.fullName,
      eventType: 'USER_UNLOCKED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'LOCKOUT_STATE',
      oldValue: 'LOCKED',
      newValue: 'UNLOCKED_ACTIVE',
      reason: 'Administrative account unlock after identity validation',
    });

    this.saveToStorage();
    return user;
  }

  public lockUser(
    userId: string,
    performedBy: { name: string; role: string },
    reason?: string
  ): UserAccountExtended {
    return this.setUserStatus(userId, 'LOCKED', performedBy, reason || 'Manual administrative lockout');
  }

  // --- Role Management Operations ---
  public createRole(
    roleData: Omit<RoleDefinition, 'id' | 'usersCount'>,
    performedBy: { name: string; role: string }
  ): RoleDefinition {
    const newId = `ROLE_${roleData.roleKey.toUpperCase()}`;
    const newRole: RoleDefinition = {
      ...roleData,
      id: newId,
      usersCount: 0,
    };
    this.roles.push(newRole);

    this.addAuditLog({
      targetUserId: newRole.id,
      targetUserName: newRole.name,
      eventType: 'ROLE_ADDED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'ROLE_MASTER',
      oldValue: 'NONE',
      newValue: newRole.name,
      reason: 'New custom role definition registered in RBAC matrix',
    });

    this.saveToStorage();
    return newRole;
  }

  public updateRole(
    updatedRole: RoleDefinition,
    performedBy: { name: string; role: string }
  ): RoleDefinition {
    const idx = this.roles.findIndex((r) => r.id === updatedRole.id);
    if (idx === -1) throw new Error(`Role ${updatedRole.id} not found`);

    this.roles[idx] = updatedRole;

    this.addAuditLog({
      targetUserId: updatedRole.id,
      targetUserName: updatedRole.name,
      eventType: 'ROLE_ADDED',
      performedBy: performedBy.name,
      performedByRole: performedBy.role,
      fieldChanged: 'ROLE_PERMISSIONS_MATRIX',
      oldValue: 'PREVIOUS_MATRIX',
      newValue: 'UPDATED_MATRIX',
      reason: `Updated permissions matrix for role ${updatedRole.name}`,
    });

    this.saveToStorage();
    return updatedRole;
  }

  // --- Maker-Checker Approval Operations ---
  public approveChangeRequest(
    requestId: string,
    checker: { name: string; role: string },
    remarks: string
  ): UserAccessChangeRequest {
    const req = this.changeRequests.find((r) => r.id === requestId);
    if (!req) throw new Error(`Change Request ${requestId} not found`);

    if (req.requestedBy === checker.name) {
      throw new Error('Maker-Checker Segregation of Duties violation: Maker cannot approve own request!');
    }

    req.status = 'APPROVED';
    req.reviewedBy = checker.name;
    req.reviewedByRole = checker.role;
    req.reviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST';
    req.reviewerRemarks = remarks || 'Approved after compliance and SoD verification.';

    // Apply target user changes if they were pending
    const user = this.getUserById(req.targetUserId);
    if (user) {
      if (user.status === 'PENDING_APPROVAL') {
        user.status = 'ACTIVE';
      }
      user.pendingChangeRequestId = undefined;

      // If details had newValue, update full object
      if (req.details?.newValue) {
        const uIdx = this.users.findIndex((u) => u.id === user.id);
        if (uIdx !== -1) {
          this.users[uIdx] = {
            ...req.details.newValue,
            status: 'ACTIVE',
            pendingChangeRequestId: undefined,
            updatedAt: new Date().toISOString(),
            updatedBy: checker.name,
          };
        }
      }
    }

    this.addAuditLog({
      targetUserId: req.targetUserId,
      targetUserName: req.targetUserName,
      eventType: 'CHANGE_REQUEST_APPROVED',
      performedBy: checker.name,
      performedByRole: checker.role,
      fieldChanged: 'MAKER_CHECKER_APPROVAL',
      oldValue: 'PENDING_APPROVAL',
      newValue: 'APPROVED',
      reason: remarks || 'Maker-checker access modification officially signed off by checker',
    });

    this.saveToStorage();
    return req;
  }

  public rejectChangeRequest(
    requestId: string,
    checker: { name: string; role: string },
    remarks: string
  ): UserAccessChangeRequest {
    const req = this.changeRequests.find((r) => r.id === requestId);
    if (!req) throw new Error(`Change Request ${requestId} not found`);

    if (req.requestedBy === checker.name) {
      throw new Error('Maker-Checker Segregation of Duties violation: Maker cannot reject own request!');
    }

    req.status = 'REJECTED';
    req.reviewedBy = checker.name;
    req.reviewedByRole = checker.role;
    req.reviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST';
    req.reviewerRemarks = remarks || 'Decline request based on risk policy.';

    const user = this.getUserById(req.targetUserId);
    if (user) {
      user.pendingChangeRequestId = undefined;
      if (user.status === 'PENDING_APPROVAL') {
        user.status = 'INACTIVE';
      }
    }

    this.addAuditLog({
      targetUserId: req.targetUserId,
      targetUserName: req.targetUserName,
      eventType: 'CHANGE_REQUEST_REJECTED',
      performedBy: checker.name,
      performedByRole: checker.role,
      fieldChanged: 'MAKER_CHECKER_REJECTION',
      oldValue: 'PENDING_APPROVAL',
      newValue: 'REJECTED',
      reason: remarks || 'Rejected by authorized checker',
    });

    this.saveToStorage();
    return req;
  }

  // --- Audit Trail ---
  private addAuditLog(entry: Omit<UserManagementAuditLog, 'id' | 'eventTimestamp'>) {
    const log: UserManagementAuditLog = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-6)}`,
      eventTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
    };
    this.auditLogs.unshift(log);
  }
}

export const userManagementStore = new UserManagementStore();
