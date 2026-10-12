import React, { useState } from 'react';
import { BillMaster } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Building2,
  ShieldCheck,
  Server,
  ArrowRight,
  Database,
  Printer,
} from 'lucide-react';

interface FinanceErpPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  currentUser: string;
}

export const FinanceErpPage: React.FC<FinanceErpPageProps> = ({
  bills,
  onOpenBillDetail,
  onOpenPrintModal,
  currentUser,
}) => {
  const [subTab, setSubTab] = useState<'ALL' | 'READY_TO_POST' | 'POSTED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Ready to post: APPROVED_FOR_PAYMENT
  const readyToPostBills = bills.filter((b) => b.status === 'APPROVED_FOR_PAYMENT');
  const postedBills = bills.filter(
    (b) => b.status === 'SENT_TO_FINANCE' || b.status === 'ERP_POSTED' || b.status === 'PAID'
  );
  const failedBills = bills.filter(
    (b) => b.status === 'ERP_FAILED' || b.financePosting?.postingStatus === 'FAILED'
  );

  const displayedBills = bills.filter((b) => {
    if (subTab === 'READY_TO_POST' && b.status !== 'APPROVED_FOR_PAYMENT') return false;
    if (
      subTab === 'POSTED' &&
      b.status !== 'SENT_TO_FINANCE' &&
      b.status !== 'ERP_POSTED' &&
      b.status !== 'PAID'
    )
      return false;
    if (
      subTab === 'FAILED' &&
      b.status !== 'ERP_FAILED' &&
      b.financePosting?.postingStatus !== 'FAILED'
    )
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        (b.financePosting?.erpDocNo && b.financePosting.erpDocNo.toLowerCase().includes(q)) ||
        (b.financePosting?.voucherNo && b.financePosting.voucherNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handlePostToERP = (billId: string) => {
    try {
      const result = billingStore.sendToFinanceERP(billId, currentUser || 'Amitav Sen (COM)');
      alert(`ERP Voucher Posted Successfully! Voucher: ${result.voucherNo}, Doc: ${result.erpDocNo}`);
    } catch (err: any) {
      alert(`ERP Posting Error: ${err.message}`);
    }
  };

  const handleRetryERP = (billId: string) => {
    try {
      const result = billingStore.retryFinanceERP(billId, currentUser || 'Finance Bridge');
      alert(`ERP Retry #${(billingStore.getBillById(billId)?.financePosting?.retryCount || 1)} Succeeded! Voucher: ${result.voucherNo}`);
    } catch (err: any) {
      alert(`Retry Failed: ${err.message}`);
    }
  };

  const handleSimulateFailure = (billId: string) => {
    billingStore.failFinanceERP(
      billId,
      currentUser || 'Finance Bridge',
      'SAP-ERR-GL-LOCKED',
      'General Ledger account temporarily locked during month-end closing run.'
    );
    alert(`Simulated ERP failure triggered for Bill ${billId}. Moved to ERP Error Queue.`);
  };

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3.5 text-xs text-teal-900">
        <Server className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-teal-950">SAP S/4HANA Accounts Payable Gateway & GL Voucher Engine</div>
          <div>
            Posts approved bills into General Ledger with cost centers (CC-APF-WEST-RETAIL) and GL accounts
            (GL-542100 for Valuation, GL-542200 for Legal). Enforces idempotency to block duplicate disbursements.
          </div>
        </div>
      </div>

      {/* Subtabs and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'ALL' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Postings ({bills.length})
          </button>

          <button
            onClick={() => setSubTab('READY_TO_POST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'READY_TO_POST'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Ready for ERP</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subTab === 'READY_TO_POST' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {readyToPostBills.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('POSTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'POSTED' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Successfully Posted</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subTab === 'POSTED' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {postedBills.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('FAILED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'FAILED'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>ERP Error Queue</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subTab === 'FAILED' ? 'bg-rose-800 text-white' : 'bg-rose-200 text-rose-800'
              }`}
            >
              {failedBills.length}
            </span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ERP doc, voucher, or bill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 w-56 sm:w-72"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Bill Ref</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">GL Account Code</th>
                <th className="py-2.5 px-3">Cost Center</th>
                <th className="py-2.5 px-3 text-right">Net Payable</th>
                <th className="py-2.5 px-3">ERP Voucher No.</th>
                <th className="py-2.5 px-3">Posting Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No bills found in this ERP status view.
                  </td>
                </tr>
              ) : (
                displayedBills.map((b) => {
                  const fp = b.financePosting;
                  const isReady = b.status === 'APPROVED_FOR_PAYMENT';
                  const isFailed = b.status === 'ERP_FAILED' || fp?.postingStatus === 'FAILED';
                  const isPosted = fp?.postingStatus === 'POSTED' || fp?.postingStatus === 'ACKNOWLEDGED';

                  const glCode =
                    fp?.glCode ||
                    (b.vendorType === 'EXTERNAL_VALUER'
                      ? 'GL-542100-VALUATION-FEES'
                      : 'GL-542200-LEGAL-FEES');

                  const costCenter = fp?.costCenter || 'CC-APF-WEST-RETAIL';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.vendorName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.serviceType}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">{glCode}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">{costCenter}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                        ₹{b.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {fp?.voucherNo ? (
                          <div>
                            <span className="font-semibold text-teal-800">{fp.voucherNo}</span>
                            <div className="text-[10px] text-slate-400">{fp.erpDocNo}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not booked</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPosted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                            POSTED
                          </span>
                        )}
                        {isReady && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            SANCTIONED / READY
                          </span>
                        )}
                        {isFailed && (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              FAILED (RETRY QUEUE)
                            </span>
                            {fp?.errorCode && (
                              <div className="text-[10px] text-rose-700 font-mono mt-0.5">{fp.errorCode}</div>
                            )}
                          </div>
                        )}
                        {!isPosted && !isReady && !isFailed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isReady && (
                            <button
                              onClick={() => handlePostToERP(b.id)}
                              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Send className="w-3 h-3" /> Post to SAP
                            </button>
                          )}

                          {isFailed && (
                            <button
                              onClick={() => handleRetryERP(b.id)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry Posting
                            </button>
                          )}

                          {isPosted && (
                            <button
                              onClick={() => handleSimulateFailure(b.id)}
                              title="Simulate transient error to test retry queue"
                              className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-rose-600 rounded border border-slate-200"
                            >
                              Simulate Fail
                            </button>
                          )}

                          <button
                            onClick={() => onOpenPrintModal(b)}
                            className="p-1 text-slate-500 hover:text-sky-600 rounded transition-colors"
                            title="Print Voucher Advice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
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
