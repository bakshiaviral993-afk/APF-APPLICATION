import React, { useState } from 'react';
import { BillMaster } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  Building2,
  DollarSign,
  Download,
  Send,
  Eye,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface PaymentsPageProps {
  bills: BillMaster[];
  onOpenBillDetail: (bill: BillMaster) => void;
  onOpenPrintModal: (bill: BillMaster) => void;
  currentUser: string;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  bills,
  onOpenBillDetail,
  onOpenPrintModal,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Filter bills in finance / payment stage
  const paymentEligibleBills = bills.filter(
    (b) =>
      b.status === 'SENT_TO_FINANCE' ||
      b.status === 'ERP_POSTED' ||
      b.status === 'PAYMENT_IN_PROCESS' ||
      b.status === 'PAID'
  );

  const displayedBills = paymentEligibleBills.filter((b) => {
    if (statusFilter === 'PAID' && b.status !== 'PAID') return false;
    if (statusFilter === 'PENDING' && b.status === 'PAID') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        (b.paymentDetail?.utrNumber && b.paymentDetail.utrNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRecordPayment = (bill: BillMaster) => {
    const utr = prompt(
      `Enter Core Banking RTGS / NEFT UTR Reference for Bill ${bill.id}:`,
      `HDFCR9${new Date().toISOString().slice(0, 10).replace(/-/g, '')}00${Math.floor(1000 + Math.random() * 9000)}`
    );
    if (utr) {
      billingStore.recordPayment(bill.id, {
        utrNumber: utr,
        paymentMethod: 'RTGS',
        paidAmount: bill.netPayable,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      // Auto-trigger payment advice generation
      billingStore.generatePaymentAdvice(bill.id, currentUser || 'Treasury Officer');
      alert(`Payment recorded successfully! UTR: ${utr}. Payment Advice generated.`);
    }
  };

  const handleGenerateAdvice = (billId: string) => {
    billingStore.generatePaymentAdvice(billId, currentUser || 'Treasury Officer');
    alert(`Payment Advice dispatched to vendor portal for Bill ${billId}.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3.5 text-xs text-sky-900">
        <CreditCard className="w-5 h-5 text-sky-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-sky-950">Treasury Core Banking Disbursements & Payment Advice Desk</div>
          <div>
            Direct bank settlements processed via NEFT / RTGS with UTR logging, TDS certificate generation,
            and automated Payment Advice dispatch to external valuer and legal portals.
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
              placeholder="Search by Bill ID, vendor, or UTR number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-60 sm:w-80"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Payment Records</option>
            <option value="PENDING">Pending Disbursement</option>
            <option value="PAID">Disbursed with UTR</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{displayedBills.length}</span> payment records
        </div>
      </div>

      {/* Payment Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Bill ID</th>
                <th className="py-2.5 px-3">Vendor / Account Holder</th>
                <th className="py-2.5 px-3">Settlement Account</th>
                <th className="py-2.5 px-3 text-right">Net Payable</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Bank UTR / Ref</th>
                <th className="py-2.5 px-3">Payment Advice Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No payment records match the current filter.
                  </td>
                </tr>
              ) : (
                displayedBills.map((b) => {
                  const isPaid = b.status === 'PAID';
                  const vendorProfile = billingStore.getVendorProfileById(b.vendorId);
                  const bankAcc = vendorProfile?.bankAccount;
                  const adviceStatus = b.paymentAdviceStatus || (isPaid ? 'PAYMENT_ADVICE_SENT' : 'PENDING');

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.vendorName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">PAN: {vendorProfile?.pan || 'AAACK5512L'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-medium text-slate-800">{bankAcc?.accountNo || '50200048192841'}</div>
                        <div className="text-[10px] text-slate-500">
                          {bankAcc?.bankName || 'HDFC Bank'} ({bankAcc?.ifsc || 'HDFC0000007'})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                        ₹{b.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            DISBURSED / PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            READY FOR DISBURSEMENT
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {b.paymentDetail?.utrNumber ? (
                          <div>
                            <span className="font-semibold text-sky-800">{b.paymentDetail.utrNumber}</span>
                            <div className="text-[10px] text-slate-400">Date: {b.paymentDetail.paymentDate}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending UTR</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {adviceStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid ? (
                            <button
                              onClick={() => handleRecordPayment(b)}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <CreditCard className="w-3 h-3" /> Disburse
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateAdvice(b.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                              title="Re-send Payment Advice"
                            >
                              Advice
                            </button>
                          )}
                          <button
                            onClick={() => onOpenPrintModal(b)}
                            className="p-1 text-slate-500 hover:text-sky-600 rounded transition-colors"
                            title="Print Advice Memo"
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
