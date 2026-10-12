import React, { useState } from 'react';
import { BillMaster, ReimbursementClaim, ReimbursementCategory } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';

interface ReimbursementsPageProps {
  bills: BillMaster[];
  onOpenAddClaimModal: (bill: BillMaster) => void;
  onOpenBillDetail: (bill: BillMaster) => void;
  currentUser: string;
}

export const ReimbursementsPage: React.FC<ReimbursementsPageProps> = ({
  bills,
  onOpenAddClaimModal,
  onOpenBillDetail,
  currentUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all reimbursement claims from bills
  const allClaims: { claim: ReimbursementClaim; bill: BillMaster }[] = [];
  bills.forEach((b) => {
    b.reimbursements?.forEach((r) => {
      allClaims.push({ claim: r, bill: b });
    });
  });

  const filteredClaims = allClaims.filter(({ claim, bill }) => {
    if (statusFilter === 'PENDING' && claim.status !== 'PENDING') return false;
    if (statusFilter === 'APPROVED' && claim.status !== 'APPROVED' && claim.status !== 'PARTIALLY_APPROVED')
      return false;
    if (statusFilter === 'REJECTED' && claim.status !== 'REJECTED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        claim.id.toLowerCase().includes(q) ||
        bill.id.toLowerCase().includes(q) ||
        claim.purpose.toLowerCase().includes(q) ||
        claim.expenseType.toLowerCase().includes(q) ||
        bill.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApproveClaim = (billId: string, claimId: string, claimedAmount: number) => {
    billingStore.reviewReimbursementClaim(
      billId,
      claimId,
      claimedAmount,
      'Approved at actuals with verified official challans and receipts.',
      currentUser || 'Billing Officer'
    );
    alert(`Reimbursement claim ${claimId} fully approved for ₹${claimedAmount.toLocaleString()}.`);
  };

  const handlePartialApproveClaim = (billId: string, claimId: string, claimedAmount: number) => {
    const input = prompt(
      `Enter approved amount (Claimed: ₹${claimedAmount.toLocaleString()}):`,
      String(Math.round(claimedAmount * 0.8))
    );
    if (input) {
      const approved = Number(input);
      const remarks = prompt('Enter audit remarks for partial approval: ') || 'Disallowed excess tariff per policy cap';
      billingStore.reviewReimbursementClaim(billId, claimId, approved, remarks, currentUser || 'Billing Officer');
      alert(`Claim ${claimId} partially approved for ₹${approved.toLocaleString()}.`);
    }
  };

  const handleRejectClaim = (billId: string, claimId: string) => {
    const remarks = prompt('Enter rejection reason: ') || 'Receipt illegible / expenses unapproved';
    billingStore.reviewReimbursementClaim(billId, claimId, 0, remarks, currentUser || 'Billing Officer');
    alert(`Claim ${claimId} rejected.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5 text-xs text-amber-900">
        <Receipt className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950">Out-of-Pocket Reimbursements & Search Fee Audit Desk</div>
          <div>
            Audits out-of-pocket expenses (outstation conveyance, Sub-Registrar challans, 30-year Index-II certified
            copies, court registry fees). Validates supporting vouchers before inclusion into the bill taxable base.
          </div>
        </div>
      </div>

      {/* Filter and Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by claim ID, bill, vendor, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 w-60 sm:w-80"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Claims ({allClaims.length})</option>
            <option value="PENDING">Pending Audit</option>
            <option value="APPROVED">Approved / Partially Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredClaims.length}</span> claims
        </div>
      </div>

      {/* Claims Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Claim ID</th>
                <th className="py-2.5 px-3">Bill ID</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Claimed</th>
                <th className="py-2.5 px-3 text-right">Approved</th>
                <th className="py-2.5 px-3">Receipt Document</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No reimbursement claims found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(({ claim, bill }) => {
                  const isPending = claim.status === 'PENDING';
                  const isApproved = claim.status === 'APPROVED' || claim.status === 'PARTIALLY_APPROVED';

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{claim.id}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-800 font-medium">{bill.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[160px]">
                        {bill.vendorName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {claim.expenseType}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {claim.purpose}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{claim.expenseDate}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-900 font-bold text-right">
                        ₹{claim.claimedAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-right">
                        ₹{claim.approvedAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {claim.receiptDocName || 'Expense_Receipt.pdf'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            PENDING AUDIT
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {claim.status}
                          </span>
                        )}
                        {claim.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveClaim(bill.id, claim.id, claim.claimedAmount)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePartialApproveClaim(bill.id, claim.id, claim.claimedAmount)}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-[11px] transition-colors"
                              >
                                Partial
                              </button>
                              <button
                                onClick={() => handleRejectClaim(bill.id, claim.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onOpenBillDetail(bill)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors"
                            title="Inspect Bill"
                          >
                            <FileText className="w-4 h-4" />
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
