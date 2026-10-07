import React, { useState } from 'react';
import { BillMaster, BillingQuery } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import {
  X,
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';

interface BillQueryModalProps {
  bill: BillMaster;
  onClose: () => void;
  onSuccess: () => void;
  currentUserName?: string;
  currentUserRole?: string;
}

export const BillQueryModal: React.FC<BillQueryModalProps> = ({
  bill,
  onClose,
  onSuccess,
  currentUserName = 'Rohan Deshmukh (CPA)',
  currentUserRole = 'CPA',
}) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(
    bill.queries[0]?.id || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(bill.queries.length === 0);

  // New query fields
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<any>('Invoice Variance');
  const [urgency, setUrgency] = useState<any>('NORMAL');
  const [newMsg, setNewMsg] = useState('');

  // Reply message
  const [replyText, setReplyText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedQuery = bill.queries.find((q) => q.id === selectedQueryId);

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !newMsg.trim()) {
      setErrorMsg('Subject and query message are mandatory.');
      return;
    }

    try {
      const q = billingStore.raiseQuery(bill.id, {
        subject: subject.trim(),
        category,
        urgency,
        message: newMsg.trim(),
        senderName: currentUserName,
        senderRole: currentUserRole,
      });
      setIsCreatingNew(false);
      setSelectedQueryId(q.id);
      setSubject('');
      setNewMsg('');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to raise query.');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueryId || !replyText.trim()) return;

    try {
      billingStore.replyQuery(bill.id, selectedQueryId, {
        senderName: currentUserName,
        senderRole: currentUserRole,
        text: replyText.trim(),
      });
      setReplyText('');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post reply.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Billing Clarification & Queries
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Docket #{bill.id} • {bill.vendorName} ({bill.projectName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar list + Active thread */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-[380px] overflow-hidden text-xs">
          {/* Query Threads List */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Queries ({bill.queries.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setSelectedQueryId(null);
                }}
                className="px-2 py-0.5 rounded bg-sky-900 text-white font-bold text-[10px] hover:bg-sky-800 cursor-pointer"
              >
                + New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {bill.queries.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-[11px]">
                  No active queries on this docket.
                </div>
              ) : (
                bill.queries.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQueryId(q.id);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full text-left p-3 transition-colors cursor-pointer block ${
                      selectedQueryId === q.id && !isCreatingNew
                        ? 'bg-white border-l-3 border-sky-600 shadow-2xs'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{q.id}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          q.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 truncate mt-1">{q.subject}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {q.category} • {q.messages.length} msg(s)
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Pane: Thread or New Query */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {errorMsg && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold">
                  Dismiss
                </button>
              </div>
            )}

            {isCreatingNew ? (
              <form onSubmit={handleCreateQuery} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5">
                <h4 className="font-bold text-slate-900 text-sm">Raise Clarification / Query</h4>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Subject / Concern <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Discrepancy in billed tower inspection count"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Invoice Variance">Invoice Variance</option>
                      <option value="GSTIN/PAN Mismatch">GSTIN / PAN Mismatch</option>
                      <option value="Missing Receipt">Missing Receipt / Proof</option>
                      <option value="Rate Card Dispute">Rate Card Scope Dispute</option>
                      <option value="Payment Issue">Payment Issue / Delay</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="NORMAL">Normal SLA (48 hrs)</option>
                      <option value="URGENT">Urgent (Billing Blocking)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Detailed Query Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Describe the discrepancy, specific invoice line item, or missing documents required from the vendor..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    Send Query to Vendor
                  </button>
                </div>
              </form>
            ) : selectedQuery ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active Query Header */}
                <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{selectedQuery.subject}</h4>
                    <span className="text-[10px] text-slate-500">
                      Category: <strong>{selectedQuery.category}</strong> • Opened:{' '}
                      {selectedQuery.createdAt.substring(0, 10)}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedQuery.urgency === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedQuery.urgency}
                  </span>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedQuery.messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {m.senderName}{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            ({m.senderRole})
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply bar */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type clarification reply..."
                    className="flex-1 h-8 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="h-8 px-4 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-xs shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Select a query from the left or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
