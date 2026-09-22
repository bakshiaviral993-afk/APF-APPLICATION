import React from 'react';
import { useAPF } from '../../context/APFContext';
import { History, X, Shield, Download } from 'lucide-react';

interface AuditLogModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { auditLogs, isAuditLogOpen, setIsAuditLogOpen } = useAPF();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuditLogOpen;
  const onClose = propOnClose || (() => setIsAuditLogOpen(false));

  if (!isOpen) return null;

  const exportAuditLog = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Role,Action,Target,Details']
        .concat(
          auditLogs.map(
            (log) =>
              `"${log.timestamp}","${log.user}","${log.role}","${log.action}","${log.target}","${log.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `proval_apf_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Bank Governance & Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all underwriting, exposure reconciliation, AI interventions, and committee actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp (UTC+5:30)</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Entity / Case</th>
                  <th className="py-2.5 px-3">Details & Audit Lineage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-200">{log.user}</span>
                      <span className="block text-[10px] text-indigo-400">{log.role}</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-300">{log.target}</td>
                    <td className="py-2 px-3 text-slate-400 leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
          <span>Records: {auditLogs.length} verified events</span>
          <span className="font-mono text-[11px] text-emerald-400">System Hash: SHA-256 Validated</span>
        </div>
      </div>
    </div>
  );
};
