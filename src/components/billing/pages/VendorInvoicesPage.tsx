import React, { useState } from 'react';
import { BillMaster } from '../../../types/billingTypes';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';

interface VendorInvoicesPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenUploadInvoiceModal: (bill: BillMaster) => void;
  onOpenRaiseQueryModal: (bill: BillMaster) => void;
}

export const VendorInvoicesPage: React.FC<VendorInvoicesPageProps> = ({
  bills,
  onOpenBillDetail,
  onOpenUploadInvoiceModal,
  onOpenRaiseQueryModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [varianceFilter, setVarianceFilter] = useState<'ALL' | 'MATCH' | 'VARIANCE'>('ALL');

  const invoiceBills = bills.filter((b) => {
    if (!b.vendorInvoice) return false;
    if (varianceFilter === 'MATCH' && b.vendorInvoice.varianceAmount !== 0) return false;
    if (
      varianceFilter === 'VARIANCE' &&
      (!b.vendorInvoice.varianceAmount || Math.abs(b.vendorInvoice.varianceAmount) <= 10)
    )
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.vendorInvoice.invoiceNo.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Controls & Variance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Invoices Uploaded
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {bills.filter((b) => Boolean(b.vendorInvoice)).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Signed PDF & IRN verified</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Exact Fee Matches (₹0 Diff)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {bills.filter((b) => b.vendorInvoice && b.vendorInvoice.varianceAmount === 0).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fully aligned with bank rate card</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Outside Tolerance (&gt; ₹10)
          </div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1">
            {
              bills.filter(
                (b) => b.vendorInvoice && Math.abs(b.vendorInvoice.varianceAmount || 0) > 10
              ).length
            }
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Queries / Exception tray flagged</div>
        </div>
      </div>

      {/* Filter and Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice number, vendor, or case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-60 sm:w-80"
            />
          </div>

          <select
            value={varianceFilter}
            onChange={(e) => setVarianceFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Invoices</option>
            <option value="MATCH">Zero Variance Only</option>
            <option value="VARIANCE">Fee Variance Exceptions</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{invoiceBills.length}</span> verified vendor invoices
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Invoice No.</th>
                <th className="py-2.5 px-3">Bill ID</th>
                <th className="py-2.5 px-3">Vendor / Firm</th>
                <th className="py-2.5 px-3">Uploaded Date</th>
                <th className="py-2.5 px-3 text-right">System Expected</th>
                <th className="py-2.5 px-3 text-right">Vendor Claimed</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-center">Variance Tolerance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoiceBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No vendor invoices found matching the current search filters.
                  </td>
                </tr>
              ) : (
                invoiceBills.map((b) => {
                  const inv = b.vendorInvoice!;
                  const systemGross = b.grossInvoiceAmount;
                  const vendorGross = inv.grossAmount;
                  const variance = inv.varianceAmount || 0;
                  const isMatch = Math.abs(variance) <= 10;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNo}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Date: {inv.invoiceDate}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-800 font-semibold">{b.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.vendorName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {inv.invoiceDocName || 'Invoice.pdf'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {inv.uploadedAt.split(' ')[0]}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 text-right">
                        ₹{systemGross.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">
                        ₹{vendorGross.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {variance === 0 ? (
                          <span className="text-emerald-700">₹0</span>
                        ) : variance > 0 ? (
                          <span className="text-amber-700">+₹{variance.toLocaleString()}</span>
                        ) : (
                          <span className="text-sky-700">-₹{Math.abs(variance).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isMatch ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            OUTSIDE TOLERANCE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenBillDetail(b)}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] transition-colors"
                          >
                            Inspect Dossier
                          </button>
                          {!isMatch && (
                            <button
                              onClick={() => onOpenRaiseQueryModal(b)}
                              className="px-2 py-1 text-amber-800 bg-amber-100 hover:bg-amber-200 rounded font-medium text-[11px] transition-colors flex items-center gap-1"
                              title="Raise Billing Query"
                            >
                              <MessageSquare className="w-3 h-3" /> Query
                            </button>
                          )}
                        </div>
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
