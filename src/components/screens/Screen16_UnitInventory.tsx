import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { Grid, Search, Filter, ChevronRight, User } from 'lucide-react';
import { DEMO_UNITS } from '../../data/mockData';

export const Screen16_UnitInventory: React.FC = () => {
  const { setCurrentScreen, setSelectedUnit } = useAPF();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = DEMO_UNITS.filter((u) => {
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (
      searchTerm &&
      !u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(u.borrowerName && u.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Unit Inventory Master Register</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              400 Units Tabular Search
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Complete inventory tracking across Tower A through Tower F with borrower name, loan account and mortgage status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('15')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            View Heatmap Matrix (Screen 15) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Unit No (e.g. B-701) or Borrower Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs text-[#102a43] placeholder-[#829ab1] font-medium focus:outline-none focus:border-[#19638c]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs text-[#102a43] font-medium focus:outline-none focus:border-[#19638c]"
        >
          <option value="ALL">All Unit Statuses</option>
          <option value="Funded">Funded Current</option>
          <option value="Delinquent">Funded Delinquent (SMA / NPA)</option>
          <option value="Pipeline">Pipeline Sanctioned / Logged</option>
          <option value="Booked">Booked by Buyer</option>
          <option value="Unsold">Available Unsold</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-4 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">
            Showing {filtered.length} of {DEMO_UNITS.length} Units
          </h3>
          <span className="text-xs text-[#627d98]">Real-Time Core Banking Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Unit No</th>
                <th className="py-3 px-4">Typology</th>
                <th className="py-3 px-4">Carpet Area</th>
                <th className="py-3 px-4">Agreement Value</th>
                <th className="py-3 px-4">Bank Exposure</th>
                <th className="py-3 px-4">Borrower Name</th>
                <th className="py-3 px-4">Unit Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {filtered.map((u) => {
                const isDelinquent = u.status === 'Delinquent';
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isDelinquent ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#102a43]">{u.unitNumber}</td>
                    <td className="py-3 px-4 text-[#486581] font-medium">{u.configuration}</td>
                    <td className="py-3 px-4 text-[#486581]">{u.carpetAreaSqFt} sq.ft</td>
                    <td className="py-3 px-4 font-bold">₹{u.agreementValueLakh} L</td>
                    <td className="py-3 px-4 font-bold text-[#19638c]">
                      {u.sanctionAmountLakh ? `₹${u.sanctionAmountLakh} L` : '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#102a43]">{u.borrowerName || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'Funded'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : u.status === 'Delinquent'
                            ? 'bg-[#fce8e6] text-[#c5221f]'
                            : u.status === 'Pipeline'
                            ? 'bg-[#e8f1f5] text-[#19638c]'
                            : 'bg-[#f1f5f9] text-[#627d98]'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUnit(u);
                          setCurrentScreen('15');
                        }}
                        className="text-[11px] text-[#19638c] hover:underline font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
