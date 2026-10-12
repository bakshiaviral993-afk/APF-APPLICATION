import React, { useState } from 'react';
import {
  RoleDefinition,
  RoleType,
  OperationId,
} from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  Shield,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  Copy,
  Save,
  CheckSquare,
  Square,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from 'lucide-react';

interface RoleManagementViewProps {
  currentUser: UserAccount;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({ currentUser }) => {
  const [roles, setRoles] = useState<RoleDefinition[]>(() => userManagementStore.getRoles());
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'ROLE_CPA');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state for selected role's permissions matrix
  const [editingPermissions, setEditingPermissions] = useState<Record<string, OperationId[]>>({});
  const [isMatrixDirty, setIsMatrixDirty] = useState(false);
  const [copySourceRoleId, setCopySourceRoleId] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Reference lists from store
  const allModules = userManagementStore.getModules();
  const allOperations = userManagementStore.getOperations();

  // Find active selected role
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Initialize editingPermissions whenever selectedRoleId changes
  React.useEffect(() => {
    if (selectedRole) {
      setEditingPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || {})));
      setIsMatrixDirty(false);
    }
  }, [selectedRoleId]);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Toggle single operation for a module
  const handleToggleOperation = (moduleId: string, opId: OperationId) => {
    setEditingPermissions((prev) => {
      const currentOps = prev[moduleId] ? [...prev[moduleId]] : [];
      let updated: OperationId[];
      if (currentOps.includes(opId)) {
        updated = currentOps.filter((o) => o !== opId);
      } else {
        updated = [...currentOps, opId];
      }
      setIsMatrixDirty(true);
      return {
        ...prev,
        [moduleId]: updated,
      };
    });
  };

  // Select all operations for a module
  const handleSelectAllModuleOps = (moduleId: string) => {
    const mod = allModules.find((m) => m.id === moduleId);
    if (!mod) return;
    setEditingPermissions((prev) => ({
      ...prev,
      [moduleId]: [...mod.supportedOperations],
    }));
    setIsMatrixDirty(true);
  };

  // Clear all operations for a module
  const handleClearModuleOps = (moduleId: string) => {
    setEditingPermissions((prev) => ({
      ...prev,
      [moduleId]: [],
    }));
    setIsMatrixDirty(true);
  };

  // Global Select All
  const handleSelectAllGlobal = () => {
    const next: Record<string, OperationId[]> = {};
    for (const m of allModules) {
      next[m.id] = [...m.supportedOperations];
    }
    setEditingPermissions(next);
    setIsMatrixDirty(true);
  };

  // Global Clear All
  const handleClearAllGlobal = () => {
    const next: Record<string, OperationId[]> = {};
    for (const m of allModules) {
      next[m.id] = [];
    }
    setEditingPermissions(next);
    setIsMatrixDirty(true);
  };

  // Copy From Another Role
  const handleCopyFromRole = () => {
    if (!copySourceRoleId) return;
    const sourceRole = roles.find((r) => r.id === copySourceRoleId);
    if (!sourceRole) return;
    setEditingPermissions(JSON.parse(JSON.stringify(sourceRole.permissions)));
    setIsMatrixDirty(true);
    showToast(`Permissions cloned from ${sourceRole.name}`);
  };

  // Reset to original
  const handleReset = () => {
    if (selectedRole) {
      setEditingPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || {})));
      setIsMatrixDirty(false);
      showToast('Matrix reset to saved configuration');
    }
  };

  // Save Role Matrix
  const handleSaveMatrix = () => {
    if (!selectedRole) return;
    const updatedRole: RoleDefinition = {
      ...selectedRole,
      permissions: editingPermissions,
    };
    try {
      userManagementStore.updateRole(updatedRole, {
        name: currentUser.name,
        role: currentUser.role,
      });
      setRoles(userManagementStore.getRoles());
      setIsMatrixDirty(false);
      showToast(`Permissions matrix committed successfully for ${selectedRole.name}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roleKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group modules by module group
  const groupedModules = allModules.reduce((acc, m) => {
    acc[m.groupName] = acc[m.groupName] || [];
    acc[m.groupName].push(m);
    return acc;
  }, {} as Record<string, typeof allModules>);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-slate-400">✕</button>
        </div>
      )}

      {/* Main Container: Split 1/3 Roles List and 2/3 Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Role List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-700" />
                  <span>Platform Roles Master</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enterprise roles assigned to internal desks & external vendors
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Role List Cards */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredRoles.map((r) => {
                const isSelected = selectedRoleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-xs font-bold">{r.name}</strong>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          r.roleType === 'INTERNAL'
                            ? 'bg-sky-100 text-sky-800'
                            : r.roleType === 'EXTERNAL'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.roleType}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {r.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span className="font-mono">{r.roleKey}</span>
                      <span className="font-semibold text-slate-600">
                        {r.usersCount ?? 1} Users Mapped
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Module-Operation Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            {/* Header with Role Details and Matrix Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-mono">
                    {selectedRole?.roleKey}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">ID: {selectedRole?.id}</span>
                  {isMatrixDirty && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                      ● Unsaved Matrix Changes
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedRole?.name} — Operating Privileges Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRole?.description}</p>
              </div>

              {/* Action Buttons: Save, Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={!isMatrixDirty}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  Reset
                </button>

                <button
                  onClick={handleSaveMatrix}
                  disabled={!isMatrixDirty}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Save Matrix
                </button>
              </div>
            </div>

            {/* Quick Bulk Operations & Clone Bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllGlobal}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAllGlobal}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Clone / Copy from Role */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-semibold">Copy from:</span>
                <select
                  value={copySourceRoleId}
                  onChange={(e) => setCopySourceRoleId(e.target.value)}
                  className="py-1 px-2 rounded border border-slate-300 bg-white text-xs"
                >
                  <option value="">Select Role to Copy...</option>
                  {roles
                    .filter((r) => r.id !== selectedRoleId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleCopyFromRole}
                  disabled={!copySourceRoleId}
                  className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] disabled:opacity-50 cursor-pointer"
                >
                  <Copy className="w-3 h-3 inline mr-1" />
                  Apply
                </button>
              </div>
            </div>

            {/* Granular Module x Operation Matrix */}
            <div className="space-y-5 max-h-[520px] overflow-y-auto pr-1">
              {Object.entries(groupedModules).map(([groupName, modules]) => (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-black uppercase text-sky-900 tracking-wider">
                      {groupName} Modules
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {modules.length} Functional Areas
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {modules.map((m) => {
                      const grantedOps = editingPermissions[m.id] || [];

                      return (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-slate-900 text-xs font-bold">{m.name}</strong>
                              <p className="text-[10px] text-slate-400 mt-0.5">{m.description}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleSelectAllModuleOps(m.id)}
                                className="text-[10px] text-sky-700 hover:underline font-bold"
                              >
                                All
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => handleClearModuleOps(m.id)}
                                className="text-[10px] text-slate-400 hover:underline font-semibold"
                              >
                                None
                              </button>
                            </div>
                          </div>

                          {/* Checkboxes / Pills for each supported operation */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {m.supportedOperations.map((opId) => {
                              const isGranted = grantedOps.includes(opId);
                              return (
                                <button
                                  key={opId}
                                  type="button"
                                  onClick={() => handleToggleOperation(m.id, opId)}
                                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isGranted
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isGranted ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <span className="w-3 h-3 inline-block rounded-xs border border-slate-300" />
                                  )}
                                  <span>{opId}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
