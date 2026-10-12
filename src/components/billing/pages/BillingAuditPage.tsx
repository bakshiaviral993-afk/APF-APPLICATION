import React, { useState } from 'react';
import { BillingAuditEvent } from '../../../types/billingTypes';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Clock,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface BillingAuditPageProps {
  auditEvents: BillingAuditEvent[];
}

export const BillingAuditPage: React.FC<BillingAuditPageProps> = ({ auditEvents }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');

  const filteredEvents = auditEvents.filter((ev) => {
    if (eventTypeFilter !== 'ALL' && ev.eventType !== eventTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.id.toLowerCase().includes(q) ||
        ev.billId.toLowerCase().includes(q) ||
        ev.caseId.toLowerCase().includes(q) ||
        ev.user.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-start justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <History className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">Immutable Financial & Underwriting Audit Trail</div>
            <div className="text-slate-300">
              Cryptographically timestamped audit log capturing every state transition: eligibility determination,
              draft generation, invoice verification, maker/checker sign-offs, ERP vouchers, and RTGS disbursements.
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by bill, user, action or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-64 sm:w-88"
            />
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Event Types</option>
            <option value="ELIGIBILITY_DETERMINED">Eligibility Determined</option>
            <option value="DRAFT_BILL_GENERATED">Draft Bill Generated</option>
            <option value="INVOICE_UPLOADED">Invoice Uploaded</option>
            <option value="BILL_VERIFIED_BY_MAKER">Maker Verification</option>
            <option value="BILL_APPROVED_BY_CHECKER">Checker Approval</option>
            <option value="SENT_TO_FINANCE_ERP">ERP Dispatched</option>
            <option value="PAYMENT_PROCESSED">Payment Disbursed</option>
            <option value="BILL_RETURNED">Bill Returned / Hold</option>
            <option value="QUERY_RAISED">Query Opened</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Logged <span className="font-semibold text-slate-800 font-mono">{filteredEvents.length}</span> immutable events
        </div>
      </div>

      {/* Audit Timeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Action</th>
                <th className="py-2.5 px-3">Bill Ref</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">User & Authority</th>
                <th className="py-2.5 px-3">Audit Log Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
                    No audit records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{ev.id}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{ev.timestamp}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {ev.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-800">{ev.billId}</td>
                    <td className="py-2.5 px-3 text-slate-700">{ev.caseId}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-slate-900">{ev.user}</span>{' '}
                      <span className="text-[10px] text-slate-400 font-mono">[{ev.role}]</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 leading-normal max-w-md">
                      {ev.description}
                      {ev.reason && (
                        <div className="text-amber-800 text-[10px] font-semibold mt-0.5">
                          Reason: {ev.reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
