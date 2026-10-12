import React, { useState, useMemo } from 'react';
import {
  UserAccountExtended,
  UserPermissionOverride,
  BusinessScope,
  UserAccountStatus,
  OperationId,
} from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  X,
  Edit2,
  Save,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Layers,
  MapPin,
  Clock,
  History,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check,
  UserCheck,
} from 'lucide-react';

interface UserDetailModalProps {
  user: UserAccountExtended;
  currentUser: UserAccount;
  initialEditMode?: boolean;
  onClose: () => void;
  onUserSaved: (updatedUser: UserAccountExtended, requiresApproval: boolean) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  currentUser,
  initialEditMode = false,
  onClose,
  onUserSaved,
}) => {
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [activeTab, setActiveTab] = useState<
    | 'PROFILE'
    | 'ROLES'
    | 'MODULES'
    | 'OPERATIONS'
    | 'SCOPE'
    | 'SECURITY'
    | 'LOGIN_HISTORY'
    | 'AUDIT'
  >('PROFILE');

  // Editable form state initialized from user
  const [firstName, setFirstName] = useState(user.firstName);
  const [middleName, setMiddleName] = useState(user.middleName || '');
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile);
  const [status, setStatus] = useState<UserAccountStatus>(user.status);
  const [department, setDepartment] = useState(user.department);
  const [branch, setBranch] = useState(user.branch || '');
  const [region, setRegion] = useState(user.region);
  const [zone, setZone] = useState(user.zone || '');
  const [reportingManager, setReportingManager] = useState(user.reportingManager || '');

  // External fields
  const [firmName, setFirmName] = useState(user.firmName || '');
  const [empanelmentNumber, setEmpanelmentNumber] = useState(user.empanelmentNumber || '');
  const [barCouncilNumber, setBarCouncilNumber] = useState(user.barCouncilNumber || '');

  // Roles state
  const [primaryRole, setPrimaryRole] = useState(user.primaryRole);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([...user.additionalRoles]);

  // Overrides state (array of UserPermissionOverride)
  const [customOverrides, setCustomOverrides] = useState<UserPermissionOverride[]>(
    user.customOverrides ? [...user.customOverrides] : []
  );

  // Business scope state
  const [scope, setScope] = useState<BusinessScope>({ ...user.businessScope });

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reference data from store
  const allRoles = userManagementStore.getRoles();
  const allModules = userManagementStore.getModules();
  const allOperations = userManagementStore.getOperations();

  // SoD Conflict check for current roles in form
  const sodCheck = useMemo(() => {
    return userManagementStore.checkSodConflicts([primaryRole, ...additionalRoles]);
  }, [primaryRole, additionalRoles]);

  // Effective permissions for preview
  const previewUserObj = useMemo(() => {
    return {
      ...user,
      primaryRole,
      additionalRoles,
      customOverrides,
    };
  }, [user, primaryRole, additionalRoles, customOverrides]);

  const effectivePermissions = useMemo(() => {
    return userManagementStore.getEffectiveUserPermissions(previewUserObj);
  }, [previewUserObj]);

  // Detect differences between current form and original user
  const diffSummary = useMemo(() => {
    const rolesChanged =
      primaryRole !== user.primaryRole ||
      additionalRoles.length !== user.additionalRoles.length ||
      additionalRoles.some((r) => !user.additionalRoles.includes(r));

    const statusChanged = status !== user.status;
    const scopeChanged = JSON.stringify(scope) !== JSON.stringify(user.businessScope);
    const overridesChanged =
      JSON.stringify(customOverrides) !== JSON.stringify(user.customOverrides);

    const summaryList: string[] = [];
    if (rolesChanged) {
      summaryList.push(
        `Primary Role: ${user.primaryRole} → ${primaryRole} (Additional: ${additionalRoles.join(', ') || 'None'})`
      );
    }
    if (statusChanged) {
      summaryList.push(`Status changed from ${user.status} to ${status}`);
    }
    if (scopeChanged) {
      summaryList.push(`Business Scope changed to ${scope.scopeLevel}`);
    }
    if (overridesChanged) {
      summaryList.push(`${customOverrides.length} User Overrides configured`);
    }

    return {
      hasChanges:
        rolesChanged ||
        statusChanged ||
        scopeChanged ||
        overridesChanged ||
        firstName !== user.firstName ||
        lastName !== user.lastName ||
        department !== user.department,
      rolesChanged,
      statusChanged,
      scopeChanged,
      overridesChanged,
      summaryList,
    };
  }, [
    primaryRole,
    additionalRoles,
    status,
    scope,
    customOverrides,
    firstName,
    lastName,
    department,
    user,
  ]);

  // Override toggle handler
  const handleToggleOverride = (
    moduleId: string,
    operationId: OperationId,
    currentlyGranted: boolean
  ) => {
    if (!isEditMode) return;

    setCustomOverrides((prev) => {
      const existingIdx = prev.findIndex(
        (o) => o.moduleId === moduleId && o.operationId === operationId
      );

      // If exists, toggle or remove
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        if (existing.granted === currentlyGranted) {
          // Remove override entirely (revert to role inheritance)
          return prev.filter((_, idx) => idx !== existingIdx);
        } else {
          // Flip granted status
          const updated = [...prev];
          updated[existingIdx] = {
            ...existing,
            granted: !existing.granted,
          };
          return updated;
        }
      } else {
        // Add new explicit override flipping current role inherited value
        return [
          ...prev,
          {
            moduleId,
            operationId,
            granted: !currentlyGranted,
            reason: `Explicit administrator override configured by ${currentUser.name}`,
          },
        ];
      }
    });
  };

  const handleOpenConfirm = () => {
    setSaveError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSaveError('Mandatory profile fields (Name, Email) cannot be blank.');
      return;
    }
    if (sodCheck.hasCriticalConflict) {
      setSaveError(
        'Segregation of Duties (SoD) critical conflict detected! Conflicting roles cannot be saved.'
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const updatedUserObj: UserAccountExtended = {
      ...user,
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      status,
      department,
      branch: branch || undefined,
      region,
      zone: zone || undefined,
      reportingManager: reportingManager || undefined,
      firmName: firmName || undefined,
      empanelmentNumber: empanelmentNumber || undefined,
      barCouncilNumber: barCouncilNumber || undefined,
      primaryRole,
      additionalRoles,
      customOverrides,
      businessScope: scope,
    };

    try {
      const result = userManagementStore.updateUser(
        updatedUserObj,
        { name: currentUser.name, role: currentUser.role },
        changeReason || 'User profile, roles & permissions modification',
        diffSummary
      );

      setShowConfirmModal(false);
      setIsEditMode(false);
      onUserSaved(result.user, result.requiresApproval);
    } catch (err: any) {
      setSaveError(err.message);
    }
  };

  const auditHistory = userManagementStore.getAuditLogs(user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-base">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 font-mono">
                  {user.id} • {user.staffId}
                </span>
                <span className="text-xs text-slate-400">{user.userType}</span>
                {isEditMode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded animate-pulse">
                    EDIT MODE ACTIVE
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>{user.fullName}</span>
                <span className="text-xs font-normal text-slate-300">({user.email})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit User</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel Edit
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8-Tab Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'PROFILE', label: '1. Profile' },
            { id: 'ROLES', label: '2. Roles & SoD' },
            { id: 'MODULES', label: '3. Module Access' },
            { id: 'OPERATIONS', label: '4. Operations & Overrides' },
            { id: 'SCOPE', label: '5. Business Scope' },
            { id: 'SECURITY', label: '6. Security & Credentials' },
            { id: 'LOGIN_HISTORY', label: '7. Login History' },
            { id: 'AUDIT', label: '8. Audit History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-900 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: Profile */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">First Name</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Middle Name</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Last Name</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Corporate Email</label>
                  <input
                    type="email"
                    disabled={!isEditMode}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                  <select
                    disabled={!isEditMode}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="LOCKED">LOCKED</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Organization or Vendor Details */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">
                  {user.userType === 'INTERNAL_BANK'
                    ? 'Internal Bank Department & Reporting Line'
                    : 'External Vendor / Empanelment Information'}
                </h4>
                {user.userType === 'INTERNAL_BANK' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Department</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Branch</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Region</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Reporting Manager</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={reportingManager}
                        onChange={(e) => setReportingManager(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Firm / Agency Name</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Empanelment Number</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={empanelmentNumber}
                        onChange={(e) => setEmpanelmentNumber(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Bar / IBBI Number</label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={barCouncilNumber}
                        onChange={(e) => setBarCouncilNumber(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-50 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Roles & SoD */}
          {activeTab === 'ROLES' && (
            <div className="space-y-4">
              {/* SoD Conflict Alert */}
              {sodCheck.conflicts.length > 0 && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    sodCheck.hasCriticalConflict
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      sodCheck.hasCriticalConflict ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                  <div>
                    <strong className="block text-xs">
                      {sodCheck.hasCriticalConflict
                        ? 'CRITICAL Segregation of Duties (SoD) CONFLICT DETECTED'
                        : 'SoD POLICY WARNING'}
                    </strong>
                    <div className="space-y-1 mt-1 text-[11px]">
                      {sodCheck.conflicts.map((c) => (
                        <p key={c.id}>
                          • <span className="font-bold">{c.ruleCode}</span>: {c.description} ({c.rationale})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Primary Role (Mandatory)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {allRoles.map((r) => {
                    const isSelected = primaryRole === r.roleKey;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={!isEditMode}
                        onClick={() => setPrimaryRole(r.roleKey)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-400 font-bold text-sky-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 disabled:opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{r.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          {r.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Additional Roles (Assigned under Dual-Hatting policy)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allRoles
                    .filter((r) => r.roleKey !== primaryRole)
                    .map((r) => {
                      const isChecked = additionalRoles.includes(r.roleKey);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                            isChecked
                              ? 'bg-sky-50 border-sky-300 font-bold text-sky-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          } ${!isEditMode ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            disabled={!isEditMode}
                            checked={isChecked}
                            onChange={() => {
                              if (!isEditMode) return;
                              setAdditionalRoles((prev) =>
                                prev.includes(r.roleKey)
                                  ? prev.filter((k) => k !== r.roleKey)
                                  : [...prev, r.roleKey]
                              );
                            }}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span>{r.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Module Permissions */}
          {activeTab === 'MODULES' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900">
                <strong className="block text-xs">Module Level Authorization Overview</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Displays whether this user has view or operating entitlement in each enterprise module.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allModules.map((mod) => {
                  const perm = effectivePermissions.permissions[mod.id];
                  const hasAccess = perm && perm.operations.length > 0;

                  return (
                    <div
                      key={mod.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        hasAccess
                          ? 'bg-white border-slate-200/90 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{mod.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{mod.groupName}]</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {mod.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {hasAccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {perm.operations.length} Ops Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            No Access
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Operations & Granular Overrides */}
          {activeTab === 'OPERATIONS' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <strong className="block text-xs">Granular 3-Level Access Matrix</strong>
                  <span className="text-[11px] text-slate-300">
                    ROLE → MODULE → OPERATION • Green = Role Inherited • Blue = Override Granted • Red = Override Revoked
                  </span>
                </div>
                {isEditMode && (
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded">
                    Click any operation pill to override
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {allModules.map((mod) => {
                  const perm = effectivePermissions.permissions[mod.id];
                  if (!perm) return null;

                  return (
                    <div
                      key={mod.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <strong className="text-slate-900 text-xs">{mod.name}</strong>
                          <span className="text-[11px] text-slate-400 ml-2 font-mono">
                            {mod.groupName}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {perm.operations.length} of {mod.supportedOperations.length} operations enabled
                        </span>
                      </div>

                      {/* Operation Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {mod.supportedOperations.map((opId) => {
                          const isAllowed = perm.operations.includes(opId);
                          const isOverridden = !!perm.overriddenOperations[opId];
                          const overrideData = perm.overriddenOperations[opId];
                          const inheritedRoles = perm.inheritedFromRoles[opId] || [];

                          let pillStyle = '';
                          if (isOverridden) {
                            if (overrideData?.granted) {
                              pillStyle = 'bg-sky-100 text-sky-900 border-sky-300 ring-1 ring-sky-400';
                            } else {
                              pillStyle = 'bg-rose-100 text-rose-800 border-rose-300 line-through opacity-70';
                            }
                          } else if (isAllowed) {
                            pillStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                          } else {
                            pillStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                          }

                          return (
                            <button
                              key={opId}
                              type="button"
                              disabled={!isEditMode}
                              onClick={() => handleToggleOverride(mod.id, opId, isAllowed)}
                              title={
                                isOverridden
                                  ? `User Override: ${overrideData?.reason || (overrideData?.granted ? 'Explicitly Granted' : 'Explicitly Revoked')}`
                                  : isAllowed
                                  ? `Inherited from: ${inheritedRoles.join(', ')}`
                                  : 'Not permitted by role or override'
                              }
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${pillStyle} ${
                                isEditMode ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'
                              }`}
                            >
                              <span>{opId}</span>
                              {isOverridden && (
                                <span className="text-[9px] px-1 rounded bg-white/70 font-mono">
                                  {overrideData?.granted ? '+USR' : '-REV'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Business Scope */}
          {activeTab === 'SCOPE' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900">
                <strong className="block text-xs">Geographical & Operational Boundary</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Determines which cases and dossiers this user is legally authorized to view or decide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Scope Level</span>
                  <strong className="text-base text-slate-900 block font-mono">{scope.scopeLevel}</strong>
                  <p className="text-[11px] text-slate-500">
                    {scope.allIndia
                      ? 'Unrestricted pan-India access across all zones and branches.'
                      : `Restricted to ${scope.regions.join(', ') || scope.scopeLevel}.`}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Authorized Regions & Cities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(scope.regions.length > 0 ? scope.regions : [user.region]).map((rg) => (
                      <span key={rg} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-xs">
                        {rg}
                      </span>
                    ))}
                    {scope.cities.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {scope.isVendorRestricted && (
                  <div className="sm:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Strict External Vendor Firewall Active</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      User is restricted to Vendor ID <strong>{scope.vendorId}</strong>. Cannot access cases belonging
                      to competitor firms or unallocated bank files.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Security & Credentials */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Lockout Status</span>
                  <strong className={`text-base block mt-1 ${user.security.isLocked ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {user.security.isLocked ? 'Account Locked' : 'Unlocked / Normal'}
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Failed login attempts: {user.security.failedLoginAttempts} / {user.security.maxFailedAttemptsAllowed}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Multi-Factor Authentication</span>
                  <strong className="text-base text-slate-900 block mt-1">
                    {user.security.mfaEnabled ? 'Enforced (MFA)' : 'Disabled'}
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1">Method: {user.security.mfaMethod}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Password Expiration</span>
                  <strong className="text-base text-slate-900 block mt-1">
                    {user.security.passwordExpiresInDays} Days Cycle
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1">Last changed: {user.security.lastPasswordChangeAt}</p>
                </div>
              </div>

              {/* Security Actions Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <strong className="text-slate-900 block text-xs">Self-Service & Helpdesk Security Controls</strong>
                  <span className="text-[11px] text-slate-500">Immediate identity recovery operations</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.security.isLocked ? (
                    <button
                      onClick={() => {
                        userManagementStore.unlockUser(user.id, {
                          name: currentUser.name,
                          role: currentUser.role,
                        });
                        alert('Account unlocked.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Unlock Account
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        userManagementStore.lockUser(user.id, {
                          name: currentUser.name,
                          role: currentUser.role,
                        }, 'Manual administrative lock');
                        alert('Account locked.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      Lock Account
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const res = userManagementStore.resetUserPassword(user.id, {
                        name: currentUser.name,
                        role: currentUser.role,
                      });
                      alert(`Temporary password issued: ${res.tempPassword}`);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Login History */}
          {activeTab === 'LOGIN_HISTORY' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Recent Authentication Events (Last 30 Days)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">IP Address</th>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5">Device & Browser</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5">{user.security.lastLoginAt || '2026-10-12 09:30 IST'}</td>
                      <td className="p-2.5 text-slate-700">10.14.88.21</td>
                      <td className="p-2.5 text-slate-700">{user.region}, India</td>
                      <td className="p-2.5 text-slate-700">Chrome 131 on Windows 11 Enterprise</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5">2026-10-11 14:10 IST</td>
                      <td className="p-2.5 text-slate-700">10.14.88.21</td>
                      <td className="p-2.5 text-slate-700">{user.region}, India</td>
                      <td className="p-2.5 text-slate-700">Chrome 131 on Windows 11 Enterprise</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5">2026-10-10 11:22 IST</td>
                      <td className="p-2.5 text-slate-700">10.14.88.21</td>
                      <td className="p-2.5 text-slate-700">{user.region}, India</td>
                      <td className="p-2.5 text-slate-700">Chrome 131 on Windows 11 Enterprise</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: Audit History */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Immutable Audit Log for this User</h4>
              {auditHistory.length === 0 ? (
                <p className="text-slate-400 italic">No historical audit modifications recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditHistory.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 font-mono">[{log.eventType}]</span>
                        <span className="text-slate-400 font-mono">{log.eventTimestamp}</span>
                      </div>
                      <p className="text-slate-700 text-xs">
                        <strong>{log.fieldChanged}</strong>: {log.oldValue} → {log.newValue}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Performed By: {log.performedBy} ({log.performedByRole})</span>
                        <span>Reason: {log.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions in Edit Mode */}
        {isEditMode && (
          <div className="p-4 border-t border-slate-200 bg-slate-100/80 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
            <div className="text-xs text-slate-600">
              {diffSummary.hasChanges ? (
                <span className="text-amber-800 font-bold">
                  ● Unsaved changes detected: {diffSummary.summaryList.length} parameters modified
                </span>
              ) : (
                <span>No changes made yet</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleOpenConfirm}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-sky-400" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal (Requirement 10) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Save User Changes?</h3>
                <p className="text-xs text-slate-500">
                  Review the summary of modifications before committing to the enterprise master.
                </p>
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {saveError}
              </div>
            )}

            {/* Summary List */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <strong className="block text-slate-800">Change Summary:</strong>
              {diffSummary.summaryList.length === 0 ? (
                <p className="text-slate-500 italic">Profile details updated without role/permission shifts.</p>
              ) : (
                <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[11px]">
                  {diffSummary.summaryList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Justification for Change *
              </label>
              <textarea
                rows={2}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g. Authorized under Delegation of Financial Powers policy amendment #DFP-2026-Q3"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
