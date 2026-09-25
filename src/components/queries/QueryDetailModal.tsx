import React, { useState } from 'react';
import { APFQuery, QueryStatus } from '../../types/queryTypes';
import { UserAccount } from '../../types/apfTransaction';
import { queryStore } from '../../services/queryStore';
import {
  X,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  RotateCcw,
  Shield,
  Building,
  FileText,
} from 'lucide-react';

interface QueryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: APFQuery | null;
  currentUser: UserAccount;
  onQueryUpdated?: () => void;
}

export const QueryDetailModal: React.FC<QueryDetailModalProps> = ({
  isOpen,
  onClose,
  query,
  currentUser,
  onQueryUpdated,
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [statusRemark, setStatusRemark] = useState('');

  if (!isOpen || !query) return null;

  const isAssignedToUser =
    query.assignedToRole === currentUser.role ||
    (query.assignedToUserId && query.assignedToUserId === currentUser.id);

  const isRaisedByUser =
    query.raisedByUserRole === currentUser.role ||
    query.raisedByUserId === currentUser.id;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    queryStore.submitInput({
      queryId: query.id,
      currentUser,
      message: replyMessage.trim(),
      inputValue: inputValue.trim() || undefined,
      attachmentName: attachmentName.trim() || undefined,
    });

    setReplyMessage('');
    setInputValue('');
    setAttachmentName('');
    if (onQueryUpdated) onQueryUpdated();
  };

  const handleStatusChange = (newStatus: QueryStatus) => {
    const remark = statusRemark.trim() || `Status updated to ${newStatus} by ${currentUser.name}`;
    queryStore.updateQueryStatus(query.id, newStatus, currentUser, remark);
    setStatusRemark('');
    if (onQueryUpdated) onQueryUpdated();
  };

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case 'INPUT_REQUIRED':
      case 'OPEN':
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            NEED INPUT
          </span>
        );
      case 'INPUT_RECEIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
            INPUT RECEIVED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            UNDER REVIEW
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            CLOSED / RESOLVED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Navy Header */}
        <div className="bg-[#0a2540] text-white px-6 py-4 flex items-center justify-between border-b border-[#133d59]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">{query.id}</h2>
                {getStatusBadge(query.status)}
                {query.isBlocking && (
                  <span className="px-2 py-0.2 rounded bg-rose-900/80 text-rose-200 text-[10px] font-bold border border-rose-700">
                    BLOCKING
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sky-200/80 mt-0.5 font-medium">{query.subject}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Context Metadata Bar */}
        <div className="bg-[#f8fafc] px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Case / Project</span>
            <span className="font-bold text-slate-800">{query.caseId}</span>
            <span className="text-[11px] text-slate-600 block">{query.projectName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">From → To</span>
            <span className="font-semibold text-slate-800">
              {query.raisedByUserName} ({query.raisedByUserRole})
            </span>
            <span className="text-[11px] text-sky-700 block">→ {query.assignedToRole}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Category / SLA</span>
            <span className="font-bold text-slate-800">{query.category}</span>
            <span className="text-[11px] text-slate-600 block">Due: {query.dueDate}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Related Module</span>
            <span className="font-semibold text-slate-800">
              {query.relatedModule || 'General Case'}{' '}
              {query.relatedField ? `(${query.relatedField})` : ''}
            </span>
          </div>
        </div>

        {/* Blocking Alert Warning if Active */}
        {query.isBlocking && query.status !== 'CLOSED' && (
          <div className="bg-rose-50 px-6 py-2.5 border-b border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              This is a BLOCKING query. The APF workflow action console for case {query.caseId} is paused
              until this input is submitted and marked closed/reviewed.
            </span>
          </div>
        )}

        {/* Threaded Message History */}
        <div className="p-6 max-h-80 overflow-y-auto space-y-4 bg-slate-50/50">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
            Audit-Protected Communication Thread • Non-Deletable
          </div>

          {query.messages.map((msg, idx) => {
            const isMe = msg.senderRole === currentUser.role;
            return (
              <div
                key={msg.id || idx}
                className={`p-4 rounded-xl border transition-all text-xs ${
                  isMe
                    ? 'bg-sky-50/70 border-sky-200 ml-6 sm:ml-12'
                    : 'bg-white border-slate-200 mr-6 sm:mr-12'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-700" />
                    <span className="font-bold text-slate-900">{msg.senderName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                      {msg.senderRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                {msg.inputValue && (
                  <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                    <span className="font-bold text-[10px] uppercase tracking-wider block text-emerald-800">
                      Input Value Provided:
                    </span>
                    <span className="font-semibold">{msg.inputValue}</span>
                  </div>
                )}

                {msg.attachmentName && (
                  <div className="mt-2 flex items-center gap-1.5 text-sky-800 bg-sky-100/60 px-2.5 py-1 rounded-md w-fit text-[11px] font-semibold border border-sky-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachment: {msg.attachmentName}</span>
                  </div>
                )}

                {msg.statusChange && (
                  <div className="mt-1 text-[10px] text-slate-500 font-mono">
                    Status transitioned to: <strong>{msg.statusChange}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reply & Input Submission Form */}
        {query.status !== 'CLOSED' ? (
          <form onSubmit={handleSendReply} className="p-6 bg-white border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Submit Input / Send Reply
              </label>
              <span className="text-[11px] text-slate-500">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.role})
              </span>
            </div>

            <textarea
              rows={2}
              placeholder="Type your response, clarification, or input..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Input Value / Document Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sanctioned Rate: ₹7,450/sq.ft, NOC #8892"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Attach Evidence File (Optional)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Evidence filename"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachmentName(`Evidence_Att_${Date.now().toString().slice(-4)}.pdf`)}
                    className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] whitespace-nowrap"
                  >
                    Simulate Attach
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* Status transitions */}
                {(isRaisedByUser || currentUser.role === 'COM' || currentUser.role === 'ADMIN') && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('CLOSED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Close Query</span>
                  </button>
                )}

                {query.status === 'INPUT_RECEIVED' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('UNDER_REVIEW')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-bold transition-colors"
                  >
                    Mark Under Review
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Input →</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Query is closed and resolved. History is archived for audit.</span>
            </div>

            {(isRaisedByUser || currentUser.role === 'COM' || currentUser.role === 'ADMIN') && (
              <button
                type="button"
                onClick={() => handleStatusChange('REOPENED')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Query</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
