import React, { useState } from 'react';
import { UserManagementAuditLog } from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { History, Search, Download, Filter, ShieldCheck, User } from 'lucide-react';

export const UserAuditTrailView: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<UserManagementAuditLog[]>(() =>
    userManagementStore.getAuditLogs()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchTerm.trim() ||
      log.targetUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fieldChanged.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || log.eventType === filterType;

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const headers = 'Log ID,Timestamp,Target User ID,Target User Name,Event Type,Field Changed,Old Value,New Value,Performed By,Role,Reason\n';
    const rows = filteredLogs.map((l) =>
      `"${l.id}","${l.eventTimestamp}","${l.targetUserId}","${l.targetUserName}","${l.eventType}","${l.fieldChanged}","${l.oldValue}","${l.newValue}","${l.performedBy}","${l.performedByRole}","${l.reason}"`
    );
    const csvContent = headers + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROVAL_RBAC_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-sky-700" />
            <span>Immutable RBAC & User Administration Audit Trail</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tamper-evident chronological log of all role mappings, privilege overrides, status shifts and credential actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by target user, actor, changed field, or rationale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
          >
            <option value="ALL">All Event Types</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_MODIFIED">USER_MODIFIED</option>
            <option value="ROLE_ADDED">ROLE_ADDED</option>
            <option value="USER_ACTIVATED">USER_ACTIVATED</option>
            <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
            <option value="USER_LOCKED">USER_LOCKED</option>
            <option value="USER_UNLOCKED">USER_UNLOCKED</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            <option value="CHANGE_REQUEST_APPROVED">CHANGE_REQUEST_APPROVED</option>
            <option value="CHANGE_REQUEST_REJECTED">CHANGE_REQUEST_REJECTED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Target User</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Field Modified</th>
                <th className="p-3">Previous State → New State</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Reason / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px]">
                    {log.id}
                  </td>
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {log.eventTimestamp}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <strong className="text-slate-900 block">{log.targetUserName}</strong>
                    <span className="text-slate-400 font-mono text-[10px]">{log.targetUserId}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 font-mono border border-slate-200">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                    {log.fieldChanged}
                  </td>
                  <td className="p-3 text-[11px]">
                    <span className="text-slate-400 line-through mr-1.5">{log.oldValue}</span>
                    <strong className="text-slate-900">{log.newValue}</strong>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 block">{log.performedBy}</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{log.performedByRole}]</span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs text-[11px] italic">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
