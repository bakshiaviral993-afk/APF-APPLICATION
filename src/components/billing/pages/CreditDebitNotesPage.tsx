import React, { useState } from 'react';
import { BillMaster, DebitCreditNote } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CreditDebitNotesPageProps {
  bills: BillMaster[];
  onOpenIssueNoteModal: (bill: BillMaster) => void;
  onOpenBillDetail: (bill: BillMaster) => void;
  currentUser: string;
}

export const CreditDebitNotesPage: React.FC<CreditDebitNotesPageProps> = ({
  bills,
  onOpenIssueNoteModal,
  onOpenBillDetail,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT_NOTE' | 'DEBIT_NOTE'>('ALL');

  // Collect notes across bills
  const allNotes: { note: DebitCreditNote; bill: BillMaster }[] = [];
  bills.forEach((b) => {
    b.debitCreditNotes?.forEach((n) => {
      allNotes.push({ note: n, bill: b });
    });
  });

  const filteredNotes = allNotes.filter(({ note, bill }) => {
    if (typeFilter !== 'ALL' && note.noteType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        note.noteNo.toLowerCase().includes(q) ||
        bill.id.toLowerCase().includes(q) ||
        note.reason.toLowerCase().includes(q) ||
        bill.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-start justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">Credit & Debit Note Financial Adjustment Ledger</div>
            <div className="text-slate-300">
              Issuance of GST Credit Notes (vendor tariff downward adjustments, penalty deductions) and Debit Notes
              (supplemental site inspections, additional title search periods) linked to original tax vouchers.
            </div>
          </div>
        </div>
        {bills.length > 0 && (
          <button
            onClick={() => onOpenIssueNoteModal(bills[0])}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Adjustment Note
          </button>
        )}
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search note number, bill ref, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 w-60 sm:w-80"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Adjustment Notes</option>
            <option value="CREDIT_NOTE">Credit Notes (Downward / Deductions)</option>
            <option value="DEBIT_NOTE">Debit Notes (Upward / Supplemental)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredNotes.length}</span> adjustment notes
        </div>
      </div>

      {/* Master Notes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Note No.</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Original Bill</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3 text-right">Adjustment Amount</th>
                <th className="py-2.5 px-3 text-right">Tax Impact</th>
                <th className="py-2.5 px-3 text-right">Net Adjustment</th>
                <th className="py-2.5 px-3">ERP Adj Ref</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No credit or debit notes issued. All bill amounts are settled as originally calculated.
                  </td>
                </tr>
              ) : (
                filteredNotes.map(({ note, bill }) => {
                  const isCredit = note.noteType === 'CREDIT_NOTE';
                  return (
                    <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{note.noteNo}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCredit
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCredit ? 'CREDIT NOTE (-)' : 'DEBIT NOTE (+)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-800 font-medium">{bill.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[160px]">
                        {bill.vendorName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{note.noteDate}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold text-right">
                        ₹{note.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-right">
                        ₹{note.taxAdjustment.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-bold text-right ${
                          isCredit ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {isCredit ? `-₹${note.netAdjustment.toLocaleString()}` : `+₹${note.netAdjustment.toLocaleString()}`}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {note.erpRefNo || 'ERP-PENDING'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenBillDetail(bill)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] transition-colors"
                        >
                          Inspect Bill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
