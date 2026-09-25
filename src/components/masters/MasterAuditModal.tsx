import React, { useState, useEffect } from 'react';
import { masterStore } from '../../services/masterStore';
import { MasterAuditLog } from '../../types/apfTransaction';
import { X, History, Shield, Clock, Filter, ArrowRight } from 'lucide-react';

interface MasterAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER' | 'UNIT';
  entityId?: string;
  entityName?: string;
  recordName?: string;
  recordId?: string;
  auditLogs?: MasterAuditLog[];
}

export const MasterAuditModal: React.FC<MasterAuditModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  recordName,
  recordId,
  auditLogs,
}) => {
  const effectiveId = entityId || recordId;
  const effectiveName = entityName || recordName;
  const [logs, setLogs] = useState<MasterAuditLog[]>(auditLogs || []);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      if (auditLogs && auditLogs.length > 0) {
        setLogs(auditLogs);
      } else {
        setLogs(masterStore.getAuditHistory(entityType, effectiveId));
      }
    }
  }, [isOpen, entityType, effectiveId, auditLogs]);

  if (!isOpen) return null;

  const filtered = logs.filter((l) => (filterAction === 'ALL' ? true : l.action === filterAction));

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'UPDATE':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'ACTIVATE':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'DEACTIVATE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'APPROVE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'REJECT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-900/60 text-[#8bb3cb]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Master Audit & Governance Trail
                {entityId && (
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-800 text-sky-200 font-mono">
                    {entityId}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#8bb3cb]">
                {entityName ? `${entityName} • ` : ''}Immutable, tamper-evident audit logs with field diffs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Filter by Action:</span>
            {['ALL', 'CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE', 'APPROVE', 'REJECT'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  filterAction === act
                    ? 'bg-[#0c3148] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Total Entries: {filtered.length}
          </div>
        </div>

        {/* Audit List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No audit log records found for this filter criteria.</p>
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {log.entityType}: {log.entityName || log.entityId}
                    </span>
                    {log.fieldChanged && log.fieldChanged !== 'ALL' && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                        Field: {log.fieldChanged}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                {/* Diff */}
                {(log.oldValue || log.newValue) && log.fieldChanged !== 'ALL' && (
                  <div className="grid grid-cols-2 gap-2 my-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Old Value
                      </span>
                      <span className="font-mono text-slate-600 break-words">{log.oldValue || '-'}</span>
                    </div>
                    <div className="border-l border-slate-100 pl-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
                        New Value <ArrowRight className="w-3 h-3 text-emerald-500" />
                      </span>
                      <span className="font-mono text-emerald-800 font-semibold break-words">
                        {log.newValue || '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Reason & Actor */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">Remarks / Reason:</span>
                    <span className="italic text-slate-600">{log.reason || 'Standard master maintenance'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                    <Shield className="w-3.5 h-3.5 text-sky-700" />
                    <span>
                      {log.performedBy} ({log.performedByRole})
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Compliant with RBI Risk Governance & Bank MDM Audit Mandates</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};
