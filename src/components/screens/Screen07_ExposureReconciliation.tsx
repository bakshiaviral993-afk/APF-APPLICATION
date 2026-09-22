import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';

export const Screen07_ExposureReconciliation: React.FC = () => {
  const { setActiveEvidence, addAuditLog, setCurrentScreen } = useAPF();
  const [taskCreated, setTaskCreated] = useState(false);

  const facilities = [
    {
      name: 'Bank A - Term Loan',
      declared: '₹75 Cr',
      bureau: '₹72 Cr',
      mca: 'Charge',
      financials: '₹73.8 Cr',
      internal: '₹0',
      status: 'Matched',
      statusColor: 'bg-[#288049] text-white',
    },
    {
      name: 'Bank B - CC',
      declared: '₹50 Cr',
      bureau: '₹48 Cr',
      mca: 'Charge',
      financials: '₹49.1 Cr',
      internal: '₹0',
      status: 'Matched',
      statusColor: 'bg-[#288049] text-white',
    },
    {
      name: 'NBFC X - Project Loan',
      declared: '—',
      bureau: '₹42 Cr',
      mca: 'Charge',
      financials: '₹41.6 Cr',
      internal: '₹0',
      status: 'Undeclared',
      statusColor: 'bg-[#c53b47] text-white',
      isException: true,
    },
    {
      name: 'Our Bank - Project Loan',
      declared: '₹86 Cr',
      bureau: '₹86 Cr',
      mca: 'Charge',
      financials: '₹86 Cr',
      internal: '₹86 Cr',
      status: 'Internal',
      statusColor: 'bg-[#19638c] text-white',
    },
    {
      name: 'Debentures',
      declared: '₹120 Cr',
      bureau: '₹118 Cr',
      mca: 'Trustee',
      financials: '₹120 Cr',
      internal: '₹0',
      status: 'Review',
      statusColor: 'bg-[#c88a1b] text-white',
    },
  ];

  const handleCreateException = () => {
    addAuditLog(
      'CREATE_EXCEPTION_TASK',
      'NBFC X - Project Loan',
      'Created Exception Task for undeclared ₹42 Cr facility detected in bureau & MCA'
    );
    setTaskCreated(true);
    setTimeout(() => setTaskCreated(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Exposure Reconciliation</h1>
            <button
              onClick={() => setCurrentScreen('15')}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f1f5] text-[#19638c] hover:bg-[#d9e8f0] transition-colors"
            >
              View Tower Heatmap →
            </button>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Compare declared, discovered and internal facilities without double counting
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Declared Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Declared Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹465 Cr</h2>
            <span className="text-xs font-semibold text-[#b7791f]">As of 05 Sep</span>
          </div>
        </div>

        {/* System Observed */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">System Observed</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹507 Cr</h2>
            <span className="text-xs font-bold text-[#c53030]">₹42 Cr variance</span>
          </div>
        </div>

        {/* Reconciled Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Reconciled Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹486 Cr</h2>
            <span className="text-xs font-semibold text-[#19638c]">Pending 1 item</span>
          </div>
        </div>

        {/* Group Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Group Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹710 Cr</h2>
            <span className="text-xs font-semibold text-[#553c9a]">Across 6 entities</span>
          </div>
        </div>
      </div>

      {/* Main Table Card: Facility Reconciliation Workbench */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#edf2f7]">
          <h3 className="text-sm font-bold text-[#102a43]">Facility Reconciliation Workbench</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf2f7] text-[#627d98] text-xs font-medium bg-[#f8fafc]/60">
                <th className="py-3 px-6">Lender / Facility</th>
                <th className="py-3 px-4">Declared</th>
                <th className="py-3 px-4">Bureau</th>
                <th className="py-3 px-4">MCA</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Internal</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-xs text-[#102a43]">
              {facilities.map((fac) => (
                <tr
                  key={fac.name}
                  className={`hover:bg-slate-50 transition-colors ${
                    fac.isException ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-6 font-bold flex items-center gap-2">
                    <span>{fac.name}</span>
                    {fac.isException && (
                      <button
                        onClick={() =>
                          setActiveEvidence({
                            sourceType: 'MCA Charge Filing',
                            sourceId: 'CHG-NBFC-42',
                            documentTitle: 'ROC MCA Charge CHG-1 & CRILC Tape',
                            pageOrSection: 'Mortgage Register Section 77',
                            asOfDate: '2026-09-05',
                            extractedField: 'Charge Amount: ₹42.0 Cr | Lender: NBFC X',
                            snippet:
                              'Discovered un-cleared construction finance charge registered in favour of NBFC X secured against project receivables...',
                            confidenceScore: 0.99,
                          })
                        }
                        className="text-[10px] text-indigo-600 underline hover:text-indigo-800 font-normal"
                      >
                        (evidence)
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium">{fac.declared}</td>
                  <td className="py-3.5 px-4 font-medium">{fac.bureau}</td>
                  <td className="py-3.5 px-4 text-[#627d98]">{fac.mca}</td>
                  <td className="py-3.5 px-4 font-medium">{fac.financials}</td>
                  <td className="py-3.5 px-4 font-medium">{fac.internal}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-semibold min-w-[76px] text-center ${fac.statusColor}`}
                    >
                      {fac.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: AI Reconciliation Finding & Button */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="border border-[#e2e8f0] rounded-lg p-4 max-w-2xl bg-[#f8fafc]/60">
          <p className="text-xs font-bold text-[#102a43]">AI Reconciliation Finding</p>
          <h4 className="text-xs sm:text-sm font-bold text-[#102a43] mt-1">
            Undeclared NBFC X facility detected across bureau and MCA. Amount aligns with financial statements.
          </h4>
          <p className="text-xs text-[#627d98] mt-1">
            Recommended action: obtain latest sanction letter and borrower confirmation before committee submission.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleCreateException}
            className="bg-[#19638c] hover:bg-[#145070] text-white px-5 py-2.5 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Create Exception Task
          </button>
          {taskCreated && (
            <span className="text-xs text-[#137333] font-semibold animate-fade-in">
              ✓ Exception Task Created in Workflow!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
