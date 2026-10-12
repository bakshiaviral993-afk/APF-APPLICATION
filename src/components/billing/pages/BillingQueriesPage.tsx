import React, { useState } from 'react';
import { BillMaster, BillingQuery } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  User,
  Paperclip,
} from 'lucide-react';

interface BillingQueriesPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  currentUser: string;
}

export const BillingQueriesPage: React.FC<BillingQueriesPageProps> = ({
  bills,
  onOpenBillDetail,
  currentUser,
}) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Collect all queries
  const allQueries: { query: BillingQuery; bill: BillMaster }[] = [];
  bills.forEach((b) => {
    b.queries?.forEach((q) => {
      allQueries.push({ query: q, bill: b });
    });
  });

  const filteredQueries = allQueries.filter(({ query, bill }) => {
    if (statusFilter === 'OPEN' && query.status !== 'OPEN') return false;
    if (statusFilter === 'RESOLVED' && query.status !== 'RESOLVED' && query.status !== 'CLOSED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        query.subject.toLowerCase().includes(q) ||
        bill.id.toLowerCase().includes(q) ||
        query.category.toLowerCase().includes(q) ||
        query.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeSelection =
    allQueries.find(({ query }) => query.id === selectedQueryId) || filteredQueries[0] || null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSelection) return;

    billingStore.replyQuery(activeSelection.bill.id, activeSelection.query.id, {
      senderName: currentUser || 'Billing Officer',
      senderRole: 'BANK_OPERATIONS',
      text: replyText.trim(),
    });

    setReplyText('');
  };

  const handleToggleResolve = (billId: string, queryId: string) => {
    const bill = billingStore.getBillById(billId);
    if (!bill) return;
    const q = bill.queries.find((item) => item.id === queryId);
    if (q) {
      q.status = q.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
      billingStore.notifyListeners();
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3.5 text-xs text-indigo-900">
        <MessageSquare className="w-5 h-5 text-indigo-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-indigo-950">Vendor Billing Exception & Query Collaboration Tray</div>
          <div>
            Facilitates structured inquiry and dispute resolution regarding fee variances, missing search challans,
            GSTIN mismatches, and rate card tariff discrepancies between Bank Maker/Checker and External Vendors.
          </div>
        </div>
      </div>

      {allQueries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <div className="text-base font-semibold text-slate-800">No Billing Queries Raised</div>
          <div className="text-xs text-slate-500 mt-1">All invoices are aligned without open clarification requests.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Query List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Inquiries ({filteredQueries.length})
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Inquiries</option>
                <option value="OPEN">Open Only</option>
                <option value="RESOLVED">Resolved Only</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {filteredQueries.map(({ query, bill }) => {
                const isSelected = activeSelection?.query.id === query.id;
                const isOpen = query.status === 'OPEN';

                return (
                  <div
                    key={query.id}
                    onClick={() => setSelectedQueryId(query.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[220px]">
                        {query.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isOpen ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {query.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-1">
                      <span>{bill.id}</span> • <span>{query.vendorName}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                      <span className="text-indigo-800 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                        {query.category}
                      </span>
                      <span className="text-slate-400 font-mono">{query.messages.length} messages</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Thread & Reply */}
          {activeSelection && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 max-h-[80vh]">
              <div>
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-base font-bold text-slate-900">{activeSelection.query.subject}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Bill: <span className="font-mono text-sky-800 font-bold">{activeSelection.bill.id}</span> •
                      Vendor: <span className="font-semibold text-slate-700">{activeSelection.query.vendorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleToggleResolve(activeSelection.bill.id, activeSelection.query.id)
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        activeSelection.query.status === 'OPEN'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {activeSelection.query.status === 'OPEN' ? 'Mark Resolved' : 'Re-open'}
                    </button>
                    <button
                      onClick={() => onOpenBillDetail(activeSelection.bill)}
                      className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium"
                    >
                      Inspect Bill →
                    </button>
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
                  {activeSelection.query.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-normal font-mono">
                            ({msg.senderRole})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official clarification response to vendor desk..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
