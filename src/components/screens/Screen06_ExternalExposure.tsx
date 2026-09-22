import React from 'react';
import { useAPF } from '../../context/APFContext';
import { FileSpreadsheet, AlertTriangle, ShieldCheck, ChevronRight, ExternalLink } from 'lucide-react';
import { DEMO_EXPOSURE_SOURCES } from '../../data/mockData';

export const Screen06_ExternalExposure: React.FC = () => {
  const { setCurrentScreen, setActiveEvidence } = useAPF();

  const bureauRecords = DEMO_EXPOSURE_SOURCES.filter(
    (s) => s.sourceSystem === 'CIBIL / CRILC' || s.lenderName.includes('Piramal') || s.lenderName.includes('SBI')
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">External Credit Exposure (CRILC & CIBIL)</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Central Registry Data
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Standardized commercial credit bureau feeds with date of reporting and asset classification (SMA-0/1/2/NPA)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('07')}
            className="px-3.5 py-2 rounded-lg bg-[#c53b47] hover:bg-[#a52834] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Reconcile in Exposure Engine (Screen 07) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Main Table Box */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Central Repository of Large Credits (CRILC Tape)</h3>
          <span className="text-xs text-[#627d98]">As-of: 2026-08-31 • Source: RBI / TransUnion CIBIL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Lender Institution</th>
                <th className="py-3 px-4">Facility Type</th>
                <th className="py-3 px-4">Sanction (₹ Cr)</th>
                <th className="py-3 px-4">Outstanding (₹ Cr)</th>
                <th className="py-3 px-4">Asset Classification</th>
                <th className="py-3 px-4">Overdue / DPD</th>
                <th className="py-3 px-4">As-Of Date</th>
                <th className="py-3 px-4 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {bureauRecords.map((rec) => {
                const isDiscovered = rec.status === 'Discovered';
                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isDiscovered ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span>{rec.lenderName}</span>
                        {isDiscovered && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/30">
                            UNDECLARED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#486581] font-medium">{rec.facilityType}</td>
                    <td className="py-3.5 px-4 font-bold text-[#102a43]">₹{rec.sanctionAmountCr} Cr</td>
                    <td className="py-3.5 px-4 font-bold text-[#102a43]">₹{rec.outstandingAmountCr} Cr</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        Standard (0 DPD)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#137333]">0 Days</td>
                    <td className="py-3.5 px-4 text-[#627d98] font-mono">{rec.asOfDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          setActiveEvidence({
                            sourceType: 'Credit Bureau / CRILC',
                            sourceId: rec.id,
                            documentTitle: rec.documentRef,
                            pageOrSection: 'Commercial Credit Section 4',
                            asOfDate: rec.asOfDate,
                            extractedField: `Outstanding: ₹${rec.outstandingAmountCr} Cr`,
                            snippet: rec.securityDetails,
                            confidenceScore: 0.98,
                          })
                        }
                        className="text-[11px] text-[#19638c] hover:underline font-semibold"
                      >
                        View Proof
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
