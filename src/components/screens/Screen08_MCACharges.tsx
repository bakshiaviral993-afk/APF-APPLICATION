import React from 'react';
import { useAPF } from '../../context/APFContext';
import { FileCheck, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

export const Screen08_MCACharges: React.FC = () => {
  const { setCurrentScreen, setActiveEvidence } = useAPF();

  const charges = [
    {
      chargeId: 'CHG-2024-91823',
      chargeHolder: 'Piramal Capital & Housing Finance Limited (NBFC X)',
      amountCr: 42.0,
      creationDate: '2024-11-22',
      status: 'Open / Unsatisfied',
      property: 'Specific Mortgage over Tower B, Alpha Heights (Alpha Towers), units 101 through 1004',
      isDiscrepancy: true,
    },
    {
      chargeId: 'CHG-2023-41029',
      chargeHolder: 'State Bank of India (SBI)',
      amountCr: 120.0,
      creationDate: '2023-04-10',
      status: 'Open / Pari-Passu',
      property: 'First pari-passu charge over Project Land (CTS 812/A, Kanjurmarg West) & future receivables',
      isDiscrepancy: false,
    },
    {
      chargeId: 'CHG-2022-10822',
      chargeHolder: 'HDFC Bank Limited',
      amountCr: 80.0,
      creationDate: '2022-09-15',
      status: 'Open / Working Capital',
      property: 'Exclusive charge on hypothecated corporate inventory and movable machinery',
      isDiscrepancy: false,
    },
    {
      chargeId: 'CHG-2020-00412',
      chargeHolder: 'Axis Bank Limited',
      amountCr: 45.0,
      creationDate: '2020-02-14',
      status: 'Open',
      property: 'Second charge on cash flows of Alpha SPV Noida',
      isDiscrepancy: false,
    },
    {
      chargeId: 'CHG-2018-77182',
      chargeHolder: 'ICICI Bank',
      amountCr: 35.0,
      creationDate: '2018-05-11',
      status: 'Satisfied (CHG-4 Filed 2023-01-19)',
      property: 'Earlier land acquisition loan (Satisfaction registered on MCA portal)',
      isDiscrepancy: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">MCA Charge Intelligence</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Registrar of Companies (ROC)
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Registered security charges under Section 77 of Companies Act. Tracks collateral encumbrances and lender security claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('07')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Reconcile with Facilities (Screen 07) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Banner */}
      <div className="p-4 rounded-xl bg-[#fce8e6] border border-[#c5221f]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#c5221f] shrink-0" />
          <div>
            <span className="font-bold text-[#c5221f]">
              Critical MCA Charge Discovered: CHG-2024-91823 (₹42.0 Cr)
            </span>
            <p className="text-[#801412] mt-0.5">
              Charge created in favour of Piramal Capital (NBFC X) on Tower B units is NOT disclosed in the builder's self-declaration schedule.
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setActiveEvidence({
              sourceType: 'MCA Charge Filing',
              sourceId: 'CHG-2024-91823',
              documentTitle: 'ROC Charge Filing CHG-1_202491823.pdf',
              pageOrSection: 'Instrument of Charge - Clause 3',
              asOfDate: '2024-11-22',
              extractedField: 'Mortgage over Tower B (Alpha Heights) units 101 to 1004',
              snippet:
                'Charge created in favour of Piramal Capital & Housing Finance Limited for term borrowing of ₹42,00,00,000/- secured against unsold inventory of Tower B.',
              confidenceScore: 0.99,
            })
          }
          className="px-3 py-1.5 bg-[#c5221f] hover:bg-[#a51a17] text-white rounded-md font-semibold shrink-0 transition-colors shadow-xs"
        >
          Inspect ROC Filing
        </button>
      </div>

      {/* Charges Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">Registered Charges Index (MCA21 API Feed)</h3>
          <span className="text-xs text-[#627d98]">CIN: U45200MH2011PTC219084</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">Charge ID</th>
                <th className="py-3 px-4">Charge Holder (Lender)</th>
                <th className="py-3 px-4">Amount (₹ Cr)</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4">Property / Collateral Charged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {charges.map((chg) => (
                <tr
                  key={chg.chargeId}
                  className={`hover:bg-slate-50 transition-colors ${
                    chg.isDiscrepancy ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#19638c]">{chg.chargeId}</td>
                  <td className="py-3.5 px-4 font-bold">{chg.chargeHolder}</td>
                  <td className="py-3.5 px-4 font-bold">₹{chg.amountCr} Cr</td>
                  <td className="py-3.5 px-4 font-mono text-[#627d98]">{chg.creationDate}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-[#486581]" title={chg.property}>
                    {chg.property}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        chg.isDiscrepancy
                          ? 'bg-[#fce8e6] text-[#c5221f]'
                          : chg.status.includes('Satisfied')
                          ? 'bg-[#f1f5f9] text-[#627d98]'
                          : 'bg-[#e6f4ea] text-[#137333]'
                      }`}
                    >
                      {chg.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        setActiveEvidence({
                          sourceType: 'MCA Charge Filing',
                          sourceId: chg.chargeId,
                          documentTitle: `ROC_Charge_${chg.chargeId}.pdf`,
                          pageOrSection: 'Form CHG-1 Page 1',
                          asOfDate: chg.creationDate,
                          extractedField: `Charge Amount: ₹${chg.amountCr} Cr`,
                          snippet: chg.property,
                          confidenceScore: 0.99,
                        })
                      }
                      className="text-[11px] text-[#19638c] hover:underline font-semibold"
                    >
                      View CHG-1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
