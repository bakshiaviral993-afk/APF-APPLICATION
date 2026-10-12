import React, { useState } from 'react';
import { VendorBillingProfile, VendorType } from '../../../types/billingTypes';
import { billingStore } from '../../../services/billingStore';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Edit2,
  XCircle,
  FileCheck,
  Lock,
  Unlock,
} from 'lucide-react';

interface VendorsGovernancePageProps {
  vendors: VendorBillingProfile[];
  onOpenVendorProfileModal: (vendor: VendorBillingProfile) => void;
  currentUser: string;
}

export const VendorsGovernancePage: React.FC<VendorsGovernancePageProps> = ({
  vendors,
  onOpenVendorProfileModal,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | VendorType>('ALL');

  const filteredVendors = vendors.filter((v) => {
    if (typeFilter !== 'ALL' && v.vendorType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.legalName.toLowerCase().includes(q) ||
        v.pan.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q) ||
        v.empanelmentNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleBlock = (vendor: VendorBillingProfile) => {
    const isCurrentlyBlocked = vendor.vendorComplianceStatus === 'BLOCKED';
    const newStatus = isCurrentlyBlocked ? 'COMPLIANT' : 'BLOCKED';
    billingStore.updateVendorProfile({
      ...vendor,
      vendorComplianceStatus: newStatus as any,
    });
    alert(
      `Vendor ${vendor.legalName} is now ${newStatus}. ${
        newStatus === 'BLOCKED' ? 'Billing is BLOCKED until cleared.' : 'Billing re-enabled.'
      }`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-start justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">Empanelled Vendor Master & Regulatory Compliance Desk</div>
            <div className="text-slate-300">
              Validates IBBI valuer empanelment, Bar Council advocate practicing certificates, GSTIN regular status,
              Income Tax PAN, MSME Udyam registration, and Penny Drop bank account validation.
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
              placeholder="Search by vendor ID, firm name, PAN, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-64 sm:w-80"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Disciplines</option>
            <option value="EXTERNAL_VALUER">Technical Valuers</option>
            <option value="EXTERNAL_ADVOCATE">Legal Advocates</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredVendors.length}</span> empanelled vendors
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((v) => {
          const isValuer = v.vendorType === 'EXTERNAL_VALUER';
          const isBlocked = v.vendorComplianceStatus === 'BLOCKED';
          const isCompliant = v.vendorComplianceStatus === 'COMPLIANT';

          return (
            <div
              key={v.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all flex flex-col justify-between space-y-4 ${
                isBlocked ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{v.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isValuer
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {isValuer ? 'Technical Valuer' : 'Legal Advocate'}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isBlocked
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {v.vendorComplianceStatus}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm mt-2">{v.legalName}</div>
                {v.tradeName && <div className="text-xs text-slate-500 italic mt-0.5">{v.tradeName}</div>}

                {/* Empanelment and Registrations */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Empanelment No:</span>
                    <span className="font-mono font-medium text-slate-800">{v.empanelmentNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validity:</span>
                    <span className="font-mono text-slate-800">{v.empanelmentValidity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Income Tax PAN:</span>
                    <span className="font-mono font-semibold text-slate-800">{v.pan}</span> (Verified)
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">GSTIN:</span>
                    <span className="font-mono font-semibold text-slate-800">{v.gstin}</span>
                  </div>
                </div>

                {/* Bank Account Snapshot */}
                <div className="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Penny Drop Verified Bank Credentials
                  </div>
                  <div className="text-slate-800">
                    <span className="font-semibold">{v.bankAccount.bankName}</span> • A/C No:{' '}
                    <span className="font-mono font-bold">{v.bankAccount.accountNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    IFSC: {v.bankAccount.ifsc} • Holder: {v.bankAccount.accountHolder}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleBlock(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isBlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Clear & Unblock
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Block Billing
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenVendorProfileModal(v)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile & Rate Card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
