import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { RefreshDiffItem } from '../../types/discoveryTypes';
import { UserAccount } from '../../types/apfTransaction';

interface RefreshDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  entityType: 'BUILDER' | 'PROJECT';
  currentUser: UserAccount;
  onApplyChanges: (decisions: Record<string, 'ACCEPT_CHANGE' | 'KEEP_CURRENT' | 'SEND_FOR_REVIEW'>) => void;
}

export const RefreshDiffModal: React.FC<RefreshDiffModalProps> = ({
  isOpen,
  onClose,
  entityName,
  entityType,
  currentUser,
  onApplyChanges,
}) => {
  // Simulated dynamic diff items discovered during regulatory refresh
  const [diffItems, setDiffItems] = useState<RefreshDiffItem[]>([
    {
      field: 'totalOngoingProjects',
      label: 'Active RERA Registrations',
      oldValue: 12,
      newValue: 14,
      source: 'MahaRERA Live Directory',
      asOf: '2026-03-21',
      decision: 'ACCEPT_CHANGE',
    },
    {
      field: 'totalProjectsCompleted',
      label: 'Completed Projects Track Record',
      oldValue: 62,
      newValue: 64,
      source: 'MahaRERA Certified OC Register',
      asOf: '2026-03-15',
      decision: 'ACCEPT_CHANGE',
    },
    {
      field: 'netWorthCr',
      label: 'Audited Tangible Net Worth (Cr)',
      oldValue: '₹1,080.0 Cr (FY24)',
      newValue: '₹1,140.5 Cr (FY25 Audited)',
      source: 'MCA ROC Annual Filing MGT-7',
      asOf: '2026-01-31',
      decision: 'ACCEPT_CHANGE',
    },
    {
      field: 'registeredAddress',
      label: 'Registered Corporate Office',
      oldValue: 'City Point, Dhole Patil Road, Pune 411001',
      newValue: '2nd Floor, City Point, Dhole Patil Road, Pune 411001',
      source: 'MCA RoC Form INC-22',
      asOf: '2026-02-10',
      decision: 'KEEP_CURRENT',
    },
  ]);

  if (!isOpen) return null;

  const handleSetDecision = (
    field: string,
    decision: 'ACCEPT_CHANGE' | 'KEEP_CURRENT' | 'SEND_FOR_REVIEW'
  ) => {
    setDiffItems((prev) =>
      prev.map((item) => (item.field === field ? { ...item, decision } : item))
    );
  };

  const handleConfirm = () => {
    const decisions: Record<string, 'ACCEPT_CHANGE' | 'KEEP_CURRENT' | 'SEND_FOR_REVIEW'> = {};
    diffItems.forEach((d) => {
      decisions[d.field] = d.decision;
    });
    onApplyChanges(decisions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Regulatory Refresh & Reconciliation Diff
              </h3>
              <p className="text-xs text-slate-400">
                Target Entity: <strong className="text-slate-200">{entityName}</strong> | Last Refreshed: Today, 08:15 IST
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-slate-50">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero Silent Overwrite Principle:</span>
              <p className="mt-0.5 text-amber-800">
                Newly fetched regulatory values are compared against verified master records. No master data is overwritten automatically without affirmative CPA / COM endorsement.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Field Attribute</th>
                  <th className="py-2.5 px-4">Current Master Value</th>
                  <th className="py-2.5 px-4 text-indigo-700 font-bold">Fresh Discovered Value</th>
                  <th className="py-2.5 px-4">Source & As-Of</th>
                  <th className="py-2.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diffItems.map((item) => (
                  <tr key={item.field} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.label}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {String(item.oldValue)}
                    </td>

                    <td className="py-3 px-4 text-indigo-900 font-bold bg-indigo-50/40">
                      {String(item.newValue)}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div className="font-medium text-slate-700">{item.source}</div>
                      <div className="text-[10px] text-slate-400">As-of: {item.asOf}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleSetDecision(item.field, 'ACCEPT_CHANGE')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            item.decision === 'ACCEPT_CHANGE'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Accept Change
                        </button>
                        <button
                          onClick={() => handleSetDecision(item.field, 'KEEP_CURRENT')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            item.decision === 'KEEP_CURRENT'
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Keep Current
                        </button>
                        <button
                          onClick={() => handleSetDecision(item.field, 'SEND_FOR_REVIEW')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            item.decision === 'SEND_FOR_REVIEW'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Flag Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors"
          >
            DISCARD
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            APPLY GOVERNED REFRESH DECISIONS
          </button>
        </div>
      </div>
    </div>
  );
};
