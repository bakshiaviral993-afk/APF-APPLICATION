import React, { useState } from 'react';
import { RateCardMaster, VendorType } from '../../../types/billingTypes';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Building2,
  Scale,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface RateCardsPageProps {
  rateCards: RateCardMaster[];
  onOpenEditRateCard: (card: RateCardMaster) => void;
  onOpenCreateRateCard: () => void;
}

export const RateCardsPage: React.FC<RateCardsPageProps> = ({
  rateCards,
  onOpenEditRateCard,
  onOpenCreateRateCard,
}) => {
  const [vendorTypeFilter, setVendorTypeFilter] = useState<'ALL' | VendorType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = rateCards.filter((rc) => {
    if (vendorTypeFilter !== 'ALL' && rc.vendorType !== vendorTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rc.id.toLowerCase().includes(q) ||
        rc.title.toLowerCase().includes(q) ||
        rc.vendorCategory.toLowerCase().includes(q) ||
        rc.serviceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-start justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">Version-Controlled Rate Card Master Engine</div>
            <div className="text-slate-300">
              Parametric billing schedules governing Technical Valuations and Legal Due Diligence across all
              clusters. Historical bills freeze active rate-card snapshots and remain immutable upon master updates.
            </div>
          </div>
        </div>
        <button
          onClick={onOpenCreateRateCard}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Rate Schedule
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rate cards by ID, title, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 w-60 sm:w-80"
            />
          </div>

          <select
            value={vendorTypeFilter}
            onChange={(e) => setVendorTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Disciplines</option>
            <option value="EXTERNAL_VALUER">Technical Valuers</option>
            <option value="EXTERNAL_ADVOCATE">Legal Advocates</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredCards.length}</span> active rate schedules
        </div>
      </div>

      {/* Rate Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((rc) => {
          const isValuer = rc.vendorType === 'EXTERNAL_VALUER';
          return (
            <div
              key={rc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{rc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {rc.version}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isValuer
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {isValuer ? 'Technical' : 'Legal'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    APPROVED
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-800 mt-2">{rc.title}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Category: {rc.vendorCategory} • Region: {rc.region}
                </div>

                {/* Tariff Parameters Table */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Base Contract Fee</div>
                    <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                      ₹{rc.baseFee.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{rc.feeBasis}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Per Addl Tower</div>
                    <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                      ₹{rc.additionalTowerRate.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Beyond base 2</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Taxes & TDS</div>
                    <div className="text-sm font-bold font-mono text-sky-800 mt-0.5">
                      GST {rc.gstRatePct}%
                    </div>
                    <div className="text-[9px] text-amber-700 font-semibold mt-0.5">TDS {rc.tdsRatePct}%</div>
                  </div>
                </div>

                {/* Policy Clauses */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="line-clamp-1">
                    <span className="font-semibold text-slate-700">Travel Rule:</span> {rc.travelRules}
                  </div>
                  <div className="line-clamp-1">
                    <span className="font-semibold text-slate-700">Reimbursement Cap:</span> Up to ₹
                    {rc.maxReimbursementCap.toLocaleString()} ({rc.reimbursementRules})
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Validity: {rc.effectiveFrom} to {rc.effectiveTo}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Tax Rule: {rc.taxRuleCode}</span>
                <button
                  onClick={() => onOpenEditRateCard(rc)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Configure Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
