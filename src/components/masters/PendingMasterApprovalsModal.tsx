import React, { useState, useEffect } from 'react';
import { UserAccount, MasterApprovalItem } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Layers,
  Grid,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';

interface PendingMasterApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onViewEntity?: (entityType: string, entityId: string) => void;
  onApprovalsChanged?: () => void;
}

export const PendingMasterApprovalsModal: React.FC<PendingMasterApprovalsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onViewEntity,
  onApprovalsChanged,
}) => {
  const [approvals, setApprovals] = useState<MasterApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MasterApprovalItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const loadApprovals = () => {
    const list = masterStore.getPendingApprovals();
    setApprovals(list);
    if (selectedItem) {
      const stillExists = list.find((a) => a.id === selectedItem.id);
      setSelectedItem(stillExists || null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApprovals();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = (item: MasterApprovalItem) => {
    masterStore.approveMasterRecord(item.entityType, item.entityId, currentUser, actionNotes || 'Approved by Checker');
    setActionType(null);
    setSelectedItem(null);
    loadApprovals();
    onApprovalsChanged?.();
  };

  const handleReject = (item: MasterApprovalItem) => {
    if (!rejectionReason.trim()) {
      alert('Mandatory: Please provide a specific reason for rejection.');
      return;
    }
    masterStore.rejectMasterRecord(item.entityType, item.entityId, currentUser, rejectionReason.trim());
    setActionType(null);
    setSelectedItem(null);
    setRejectionReason('');
    loadApprovals();
    onApprovalsChanged?.();
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Builder':
        return Building;
      case 'Project':
        return Building;
      case 'Phase':
        return Layers;
      case 'Tower':
        return Layers;
      case 'Unit':
        return Grid;
      default:
        return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Master Data Maker-Checker Approvals</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {approvals.length} Pending
                </span>
              </div>
              <p className="text-xs text-[#8bb3cb]">
                Role: <span className="text-white font-semibold">{currentUser.role}</span> (Authorized Checker)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">All Master Data Up-to-Date</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                There are no pending master creations or modifications awaiting checker authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((item) => {
                const Icon = getEntityIcon(item.entityType);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {item.entityType}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800">{item.entityName}</h4>
                            <span className="font-mono text-[11px] text-slate-400">({item.entityId})</span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1">
                            {item.parentInfo && <span className="font-semibold text-slate-700">{item.parentInfo} • </span>}
                            <span>{item.changeSummary}</span>
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              Maker: <strong className="text-slate-700">{item.submittedBy}</strong>
                            </span>
                            <span>•</span>
                            <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'Recent'}</span>
                            {item.version && (
                              <>
                                <span>•</span>
                                <span className="font-mono font-bold text-sky-700">v{item.version}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {onViewEntity && (
                          <button
                            type="button"
                            onClick={() => onViewEntity(item.entityType, item.entityId)}
                            className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                            title="Inspect Master Record"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Inspect</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType('reject');
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType('approve');
                            setActionNotes('');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      </div>
                    </div>

                    {/* Inline Confirmation Drawer */}
                    {isSelected && actionType && (
                      <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                        {actionType === 'approve' ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Confirm Checker Approval for {item.entityType}: {item.entityName}
                            </div>
                            <input
                              type="text"
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                              placeholder="Optional remarks (e.g. Verified with municipal sanctions)"
                              className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActionType(null);
                                  setSelectedItem(null);
                                }}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(item)}
                                className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                              >
                                Authorize & Activate Master Record
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Reject Submission: Please state mandatory justification
                            </div>
                            <textarea
                              rows={2}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Mandatory reason for rejection (will be returned to Maker in audit trail)..."
                              className="w-full p-2 text-xs rounded border border-rose-300 bg-white focus:ring-2 focus:ring-rose-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActionType(null);
                                  setSelectedItem(null);
                                }}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(item)}
                                className="px-4 py-1.5 rounded bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                              >
                                Confirm Rejection
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Maker-Checker enforcement guarantees compliance with RBI / NHB Master Direction standards.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
