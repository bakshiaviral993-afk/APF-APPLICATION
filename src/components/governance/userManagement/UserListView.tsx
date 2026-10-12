import React, { useState, useMemo } from 'react';
import {
  UserAccountExtended,
  UserType,
  UserAccountStatus,
} from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  Search,
  Filter,
  Plus,
  Download,
  RotateCw,
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  KeyRound,
  Unlock,
  Lock,
  ShieldAlert,
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface UserListViewProps {
  currentUser: UserAccount;
  users: UserAccountExtended[];
  onCreateUser: () => void;
  onViewUser: (user: UserAccountExtended) => void;
  onEditUser: (user: UserAccountExtended) => void;
  onNavigateToMakerChecker?: () => void;
}

export const UserListView: React.FC<UserListViewProps> = ({
  currentUser,
  users,
  onCreateUser,
  onViewUser,
  onEditUser,
  onNavigateToMakerChecker,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterUserType, setFilterUserType] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterInternalExternal, setFilterInternalExternal] = useState<'ALL' | 'INTERNAL' | 'EXTERNAL'>('ALL');

  // Multi-selection for bulk operations
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Status message toast
  const [statusNotification, setStatusNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Unique options for filter dropdowns
  const availableRoles = useMemo(() => {
    const set = new Set(users.map((u) => u.primaryRole));
    return Array.from(set).sort();
  }, [users]);

  const availableDepartments = useMemo(() => {
    const set = new Set(users.map((u) => u.department).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  const availableRegions = useMemo(() => {
    const set = new Set(users.map((u) => u.region).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const searchMatch =
        !searchTerm.trim() ||
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.firmName && u.firmName.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // Role filter
      if (filterRole !== 'ALL' && u.primaryRole !== filterRole && !u.additionalRoles.includes(filterRole)) {
        return false;
      }

      // User Type filter
      if (filterUserType !== 'ALL' && u.userType !== filterUserType) {
        return false;
      }

      // Internal / External toggle
      if (filterInternalExternal === 'INTERNAL' && u.userType !== 'INTERNAL_BANK') {
        return false;
      }
      if (filterInternalExternal === 'EXTERNAL' && u.userType === 'INTERNAL_BANK') {
        return false;
      }

      // Department
      if (filterDepartment !== 'ALL' && u.department !== filterDepartment) {
        return false;
      }

      // Region
      if (filterRegion !== 'ALL' && u.region !== filterRegion) {
        return false;
      }

      // Status
      if (filterStatus !== 'ALL' && u.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [
    users,
    searchTerm,
    filterRole,
    filterUserType,
    filterInternalExternal,
    filterDepartment,
    filterRegion,
    filterStatus,
  ]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleToggleStatus = (user: UserAccountExtended) => {
    const targetStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      userManagementStore.setUserStatus(
        user.id,
        targetStatus,
        { name: currentUser.name, role: currentUser.role },
        `Administrative status change from User List table`
      );
      showNotification(`User ${user.fullName} status updated to ${targetStatus}`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleUnlockUser = (user: UserAccountExtended) => {
    try {
      userManagementStore.unlockUser(user.id, {
        name: currentUser.name,
        role: currentUser.role,
      });
      showNotification(`Account for ${user.fullName} successfully unlocked.`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleResetPassword = (user: UserAccountExtended) => {
    try {
      const { tempPassword } = userManagementStore.resetUserPassword(user.id, {
        name: currentUser.name,
        role: currentUser.role,
      });
      showNotification(`Temporary password issued for ${user.fullName}: ${tempPassword}`, 'warning');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleBulkActivate = () => {
    let count = 0;
    selectedUserIds.forEach((id) => {
      userManagementStore.setUserStatus(
        id,
        'ACTIVE',
        { name: currentUser.name, role: currentUser.role },
        'Bulk activation'
      );
      count++;
    });
    setSelectedUserIds([]);
    showNotification(`Successfully activated ${count} user accounts.`);
  };

  const handleBulkDeactivate = () => {
    let count = 0;
    selectedUserIds.forEach((id) => {
      userManagementStore.setUserStatus(
        id,
        'INACTIVE',
        { name: currentUser.name, role: currentUser.role },
        'Bulk deactivation'
      );
      count++;
    });
    setSelectedUserIds([]);
    showNotification(`Successfully deactivated ${count} user accounts.`, 'warning');
  };

  const handleExportCSV = () => {
    const headers = 'User ID,Staff ID,Full Name,Email,User Type,Primary Role,Department,Region,Status,Last Login\n';
    const rows = filteredUsers.map((u) =>
      `"${u.id}","${u.staffId}","${u.fullName}","${u.email}","${u.userType}","${u.primaryRole}","${u.department}","${u.region}","${u.status}","${u.security.lastLoginAt || 'Never'}"`
    );
    const csvContent = headers + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROVAL_User_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showNotification('Exported user list to CSV file.');
  };

  // Status Pill Styling
  const getStatusBadge = (status: UserAccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Lock className="w-3 h-3 text-rose-600" />
            Locked
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Approval
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertTriangle className="w-3 h-3 text-purple-600" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // User Type Display Label
  const formatUserType = (type: UserType) => {
    switch (type) {
      case 'INTERNAL_BANK':
        return { label: 'Bank Internal', badge: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'EXTERNAL_VALUER':
        return { label: 'External Valuer', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'EXTERNAL_VALUATION_AGENCY_USER':
        return { label: 'Valuation Agency', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'EXTERNAL_LEGAL_ADVOCATE':
        return { label: 'Legal Advocate', badge: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'EXTERNAL_LEGAL_FIRM_USER':
        return { label: 'Legal Firm Staff', badge: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'EXTERNAL_LEGAL_FIRM_ADMIN':
        return { label: 'Legal Firm Admin', badge: 'bg-purple-50 text-purple-900 border-purple-200' };
      default:
        return { label: type, badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Quick stats
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const externalCount = users.filter((u) => u.userType !== 'INTERNAL_BANK').length;
  const pendingCount = users.filter((u) => u.status === 'PENDING_APPROVAL').length;
  const lockedCount = users.filter((u) => u.status === 'LOCKED').length;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {statusNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : statusNotification.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotification.message}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Provisioned</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Enterprise accounts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Users</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Authorized & live</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>External Vendors</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{externalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Valuers & Advocates</p>
        </div>

        <div
          onClick={onNavigateToMakerChecker}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Maker-Checker queue →</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Locked Accounts</span>
            <Lock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{lockedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Security lockout</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header & Primary Actions */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100/70 px-2.5 py-0.5 rounded-md border border-sky-200">
                Governance & RBAC
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {filteredUsers.length} of {users.length} Users
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-700" />
              <span>User Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage platform users, roles, module access and operating permissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={() => showNotification('User directory synchronized with Active Directory & Core Master.')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>

            <button
              onClick={onCreateUser}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Create User</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          {/* Top Row: Search and Internal/External Toggle */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by User Name, Staff ID, Email, Role or Vendor Firm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Internal / External Segmented Control */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
              <button
                onClick={() => setFilterInternalExternal('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterInternalExternal === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setFilterInternalExternal('INTERNAL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterInternalExternal === 'INTERNAL'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internal Bank
              </button>
              <button
                onClick={() => setFilterInternalExternal('EXTERNAL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterInternalExternal === 'EXTERNAL'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                External Vendors
              </button>
            </div>
          </div>

          {/* Bottom Row: Granular Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {/* Role Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Primary Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Roles</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                User Type
              </label>
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Types</option>
                <option value="INTERNAL_BANK">Internal Bank User</option>
                <option value="EXTERNAL_VALUER">External Valuer</option>
                <option value="EXTERNAL_VALUATION_AGENCY_USER">Valuation Agency</option>
                <option value="EXTERNAL_LEGAL_ADVOCATE">Legal Advocate</option>
                <option value="EXTERNAL_LEGAL_FIRM_USER">Legal Firm User</option>
                <option value="EXTERNAL_LEGAL_FIRM_ADMIN">Legal Firm Admin</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Departments</option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Region
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Regions</option>
                {availableRegions.map((rg) => (
                  <option key={rg} value={rg}>
                    {rg}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOCKED">Locked</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar (Visible when rows selected) */}
          {selectedUserIds.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  {selectedUserIds.length}
                </span>
                <span>Users selected for bulk operations</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkActivate}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Bulk Activate
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Bulk Deactivate
                </button>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedUserIds.length === filteredUsers.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">User Name</th>
                <th className="py-3 px-3">User Type</th>
                <th className="py-3 px-3">Primary Role</th>
                <th className="py-3 px-3">Department / Firm</th>
                <th className="py-3 px-3">Branch / Region</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Login</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">No platform users match the chosen criteria</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try clearing search filters or create a new user profile.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const typeMeta = formatUserType(u.userType);
                  const isSelected = selectedUserIds.includes(u.id);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>

                      {/* User ID / Staff ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div>{u.id}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.staffId}</div>
                      </td>

                      {/* User Name + Avatar + Email */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.userType === 'INTERNAL_BANK'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            }`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.customOverrides && u.customOverrides.length > 0 && (
                                <span
                                  title={`${u.customOverrides.length} User Overrides applied`}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                                >
                                  +{u.customOverrides.length} Override
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User Type */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeMeta.badge}`}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      {/* Primary Role & Addl Roles */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {u.primaryRole}
                        </span>
                        {u.additionalRoles.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            +{u.additionalRoles.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Department / Firm */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[170px]">
                          {u.userType === 'INTERNAL_BANK' ? u.department : u.firmName || u.department}
                        </div>
                        {u.empanelmentNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Emp: {u.empanelmentNumber}
                          </div>
                        )}
                      </td>

                      {/* Branch / Region */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{u.region}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {u.branch || u.businessScope.scopeLevel}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(u.status)}</td>

                      {/* Last Login */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {u.security.lastLoginAt ? (
                          u.security.lastLoginAt
                        ) : (
                          <span className="text-slate-400 italic">Never logged in</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="relative inline-flex items-center gap-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => onViewUser(u)}
                            title="View Full User Dossier"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditUser(u)}
                            title="Edit User Permissions & Scope"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                          </button>

                          {/* Activate / Deactivate Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* More dropdown */}
                          <button
                            onClick={() =>
                              setActionMenuOpenId(actionMenuOpenId === u.id ? null : u.id)
                            }
                            title="More Actions"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {actionMenuOpenId === u.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left animate-in fade-in zoom-in-95">
                              {u.status === 'LOCKED' && (
                                <button
                                  onClick={() => {
                                    handleUnlockUser(u);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Unlock Account</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  handleResetPassword(u);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                                <span>Reset Password</span>
                              </button>

                              <button
                                onClick={() => {
                                  onViewUser(u);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                                <span>Audit & Permissions</span>
                              </button>

                              <button
                                onClick={() => {
                                  userManagementStore.setUserStatus(
                                    u.id,
                                    'LOCKED',
                                    { name: currentUser.name, role: currentUser.role },
                                    'Manual security lock from User List action menu'
                                  );
                                  showNotification(`User ${u.fullName} is now locked.`);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <Lock className="w-3.5 h-3.5 text-rose-500" />
                                <span>Lock Account</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-800">{users.length}</strong> registered bank and external
            vendor credentials.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono mt-2 sm:mt-0">
            <span>Enterprise RBAC Engine v2.4</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Active Directory SSO Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
