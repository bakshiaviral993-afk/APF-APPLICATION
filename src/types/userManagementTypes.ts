// Enterprise Granular RBAC, User Management & Access Control Types
// Access Hierarchy: USER -> ROLE -> MODULE -> OPERATION -> BUSINESS SCOPE -> CASE / VENDOR AUTHORIZATION

export type UserType =
  | 'INTERNAL_BANK'
  | 'EXTERNAL_VALUER'
  | 'EXTERNAL_VALUATION_AGENCY_USER'
  | 'EXTERNAL_LEGAL_ADVOCATE'
  | 'EXTERNAL_LEGAL_FIRM_USER'
  | 'EXTERNAL_LEGAL_FIRM_ADMIN';

export type UserAccountStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'LOCKED'
  | 'PENDING_APPROVAL'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'DRAFT';

export type ModuleGroupId =
  | 'WORKSPACE'
  | 'MASTER_DATA'
  | 'UNDERWRITING'
  | 'DECISIONING'
  | 'OPERATIONS'
  | 'GOVERNANCE';

export type OperationId =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'SAVE'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'RETURN'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'DEACTIVATE'
  | 'REACTIVATE'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'EXPORT'
  | 'FETCH'
  | 'REFRESH'
  | 'RECONCILE'
  | 'FREEZE'
  | 'RAISE_QUERY'
  | 'RESPOND_QUERY'
  | 'CLOSE_QUERY'
  | 'GENERATE_REPORT'
  | 'SEND_TO_LOS'
  | 'VERIFY'
  | 'MAKER_APPROVE'
  | 'CHECKER_APPROVE'
  | 'POST_TO_ERP'
  | 'PROCESS_PAYMENT';

export interface OperationDefinition {
  id: OperationId;
  name: string;
  description: string;
  isSensitive?: boolean;
  isActive: boolean;
}

export interface ModuleDefinition {
  id: string; // e.g., 'APF_CASES', 'EXPOSURE_360', 'USER_MANAGEMENT'
  navigationModuleKey: string; // e.g. 'MY_CASES', 'EXPOSURE', 'USER_MANAGEMENT'
  name: string;
  groupId: ModuleGroupId;
  groupName: string;
  parentModuleId?: string;
  description: string;
  sortOrder: number;
  supportedOperations: OperationId[];
  isActive: boolean;
}

export type RoleType = 'INTERNAL' | 'EXTERNAL' | 'SYSTEM_ADMIN';

export interface RoleDefinition {
  id: string; // e.g., 'ROLE_CPA', 'ROLE_COM', 'ROLE_ADMIN'
  name: string;
  roleKey: string; // e.g., 'CPA', 'COM', 'ADMIN', 'EXTERNAL_VALUER'
  roleType: RoleType;
  description: string;
  isActive: boolean;
  isSystemRole?: boolean;
  // Module ID -> Set of allowed operations
  permissions: Record<string, OperationId[]>;
  usersCount?: number;
}

// User-level override representation
export interface UserPermissionOverride {
  moduleId: string;
  operationId: OperationId;
  granted: boolean; // true = explicitly granted, false = explicitly revoked
  reason?: string;
  approvedBy?: string;
}

// Business Scope Mapping
export interface BusinessScope {
  scopeLevel: 'ALL_INDIA' | 'ZONE' | 'REGION' | 'CITY' | 'BRANCH' | 'VENDOR_ISOLATED';
  // For Internal Bank Users
  allIndia: boolean;
  zones: string[]; // e.g., ['West Zone', 'North Zone']
  regions: string[]; // e.g., ['Maharashtra', 'NCR']
  states: string[];
  cities: string[]; // e.g., ['Pune', 'Mumbai']
  branches: string[]; // e.g., ['Shivajinagar Branch', 'Bandra Kurla Branch']
  businessUnits: string[]; // e.g., ['Retail Mortgages', 'Affordable Housing']
  products: string[]; // e.g., ['Home Loan APF', 'Commercial Developer Line']
  
  // For External Vendors
  isVendorRestricted: boolean;
  vendorId?: string;
  firmName?: string;
  empanelmentNumber?: string;
  assignedCasesOnly: boolean;
  approvedRegions?: string[];
  approvedServiceTypes?: string[];
}

export interface UserSecurityProfile {
  failedLoginAttempts: number;
  maxFailedAttemptsAllowed: number;
  isLocked: boolean;
  lockedAt?: string;
  lockedReason?: string;
  lastLoginAt?: string;
  lastPasswordChangeAt: string;
  passwordExpiresInDays: number;
  forcePasswordChangeOnNextLogin: boolean;
  mfaEnabled: boolean;
  mfaMethod: 'SMS_OTP' | 'AUTHENTICATOR_APP' | 'EMAIL_OTP' | 'HARDWARE_TOKEN';
  sessionTimeoutMinutes: number;
}

export interface UserLoginHistoryEntry {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  deviceBrowser: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED_LOCKOUT' | 'MFA_CHALLENGE';
  failureReason?: string;
}

export interface UserAccountExtended {
  id: string; // USR-CPA-001
  staffId: string; // Staff/Emp ID e.g. STF-84912
  username: string; // login identifier
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  userType: UserType;
  status: UserAccountStatus;
  
  // Role assignment
  primaryRole: string; // e.g. 'CPA'
  additionalRoles: string[]; // e.g. ['BILLING_MAKER']
  
  // Organization Details (Internal)
  businessUnit?: string;
  department: string;
  branch?: string;
  region: string;
  zone?: string;
  reportingManager?: string;
  reportingManagerId?: string;
  
  // Vendor / Empanelment Details (External)
  vendorId?: string;
  firmName?: string;
  empanelmentNumber?: string;
  empanelmentValidUntil?: string;
  approvedServiceCategory?: string;
  barCouncilNumber?: string;
  
  // Granular Permissions
  customOverrides: UserPermissionOverride[];
  businessScope: BusinessScope;
  
  // Security & Compliance
  security: UserSecurityProfile;
  
  // Metadata & Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  avatarInitials: string;
  
  // Maker-Checker tracking
  pendingChangeRequestId?: string;
}

// Maker-Checker for User Administration
export type AccessChangeType =
  | 'CREATE_USER'
  | 'MODIFY_ROLES'
  | 'MODIFY_PERMISSIONS'
  | 'MODIFY_SCOPE'
  | 'STATUS_CHANGE'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_UNLOCK';

export type ChangeRequestStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_FOR_CORRECTION';

export interface UserAccessChangeRequest {
  id: string; // CHG-2026-0001
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  changeType: AccessChangeType;
  summary: string;
  details: {
    oldValue?: any;
    newValue?: any;
    rolesAdded?: string[];
    rolesRemoved?: string[];
    modulesAdded?: string[];
    modulesRemoved?: string[];
    operationsGranted?: string[];
    operationsRevoked?: string[];
    scopeDiff?: string;
    statusChange?: { from: UserAccountStatus; to: UserAccountStatus };
  };
  reason: string;
  requestedBy: string;
  requestedByRole: string;
  requestedAt: string;
  status: ChangeRequestStatus;
  reviewedBy?: string;
  reviewedByRole?: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
}

// Segregation of Duties (SOD) Conflict Rule
export interface SodRule {
  id: string;
  ruleCode: string;
  roleA: string;
  roleB: string;
  severity: 'CRITICAL_BLOCK' | 'WARNING_WITH_OVERRIDE';
  description: string;
  rationale: string;
}

// User Management Audit Log
export interface UserManagementAuditLog {
  id: string;
  eventTimestamp: string;
  targetUserId: string;
  targetUserName: string;
  eventType:
    | 'USER_CREATED'
    | 'USER_MODIFIED'
    | 'ROLE_ADDED'
    | 'ROLE_REMOVED'
    | 'MODULE_GRANTED'
    | 'MODULE_REVOKED'
    | 'OPERATION_GRANTED'
    | 'OPERATION_REVOKED'
    | 'SCOPE_CHANGED'
    | 'USER_ACTIVATED'
    | 'USER_DEACTIVATED'
    | 'USER_LOCKED'
    | 'USER_UNLOCKED'
    | 'PASSWORD_RESET'
    | 'SOD_OVERRIDE_RECORDED'
    | 'CHANGE_REQUEST_SUBMITTED'
    | 'CHANGE_REQUEST_APPROVED'
    | 'CHANGE_REQUEST_REJECTED';
  performedBy: string;
  performedByRole: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  reason: string;
  ipAddress?: string;
}
