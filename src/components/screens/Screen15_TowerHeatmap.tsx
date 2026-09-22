import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';

interface UnitInfo {
  unitCode: string;
  floor: number;
  unitNum: number;
  status: 'Unfunded' | 'Sanctioned' | 'Part Disb.' | 'Fully Disb.' | 'Delinquent';
  customer: string;
  sanction: string;
  outstanding: string;
  ltv: string;
  approvedRate: string;
  latestMarket: string;
  dpd: string;
  mortgage: string;
  lastValuation: string;
}

export const Screen15_TowerHeatmap: React.FC = () => {
  const { setActiveEvidence, setCurrentScreen } = useAPF();
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('0804');

  // Colors according to screenshot:
  // Unfunded: light gray #e2e8f0
  // Sanctioned: light blue #85b6d2
  // Part Disb.: amber/gold #e5a84b
  // Fully Disb.: green #52a677
  // Delinquent: red #cb5a5e
  const statusColorMap = {
    Unfunded: 'bg-[#e2e8f0] text-[#64748b]',
    Sanctioned: 'bg-[#85b6d2] text-white',
    'Part Disb.': 'bg-[#e5a84b] text-white',
    'Fully Disb.': 'bg-[#52a677] text-white',
    Delinquent: 'bg-[#cb5a5e] text-white',
  };

  // Generate 12 floors x 8 units
  const units: UnitInfo[] = [];
  for (let floor = 12; floor >= 1; floor--) {
    for (let u = 1; u <= 8; u++) {
      const padFloor = floor < 10 ? `0${floor}` : `${floor}`;
      const padUnit = `0${u}`;
      const code = `${padFloor}${padUnit}`;

      let status: UnitInfo['status'] = 'Unfunded';
      if (code === '0804' || code === '0402' || code === '1106' || code === '0207') {
        status = 'Delinquent';
      } else if (u % 3 === 0) {
        status = 'Fully Disb.';
      } else if (u % 2 === 0) {
        status = 'Part Disb.';
      } else if (floor > 6) {
        status = 'Sanctioned';
      } else {
        status = 'Unfunded';
      }

      units.push({
        unitCode: code,
        floor,
        unitNum: u,
        status,
        customer: code === '0804' ? 'Masked Borrower' : `Borrower ${code}`,
        sanction: code === '0804' ? '₹72.0 L' : '₹68.5 L',
        outstanding: code === '0804' ? '₹61.4 L' : '₹45.0 L',
        ltv: code === '0804' ? '74%' : '68%',
        approvedRate: '₹9,850/sq.ft',
        latestMarket: '₹10,200/sq.ft',
        dpd: code === '0804' ? '37 days' : status === 'Delinquent' ? '45 days' : '0 days',
        mortgage: 'Registered',
        lastValuation: '14 Aug 2026',
      });
    }
  }

  const selectedUnit = units.find((u) => u.unitCode === selectedUnitCode) || units[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Tower Exposure Heatmap</h1>
            <button
              onClick={() => setCurrentScreen('07')}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f1f5] text-[#19638c] hover:bg-[#d9e8f0] transition-colors"
            >
              ← Back to Exposure
            </button>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Unit-level funding, value and risk concentration
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
        {/* Tower A Exposure */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Tower A Exposure</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">₹41.8 Cr</h2>
            <span className="text-xs font-semibold text-[#185d85]">62 funded</span>
          </div>
        </div>

        {/* Average LTV */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Average LTV</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">68%</h2>
            <span className="text-xs font-semibold text-[#288049]">Policy cap 80%</span>
          </div>
        </div>

        {/* Construction */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Construction</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">76%</h2>
            <span className="text-xs font-bold text-[#b7791f]">Plan 82%</span>
          </div>
        </div>

        {/* Delinquent Units */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Delinquent Units</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">4</h2>
            <span className="text-xs font-bold text-[#c53030]">₹2.6 Cr O/S</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Unit Map & Selected Unit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Unit Map */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-[#102a43]">Interactive Unit Map</h3>
              {/* Legend matching screenshot */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#627d98]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#e2e8f0] inline-block" />
                  <span>Unfunded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#85b6d2] inline-block" />
                  <span>Sanctioned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#e5a84b] inline-block" />
                  <span>Part Disb.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#52a677] inline-block" />
                  <span>Fully Disb.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#cb5a5e] inline-block" />
                  <span>Delinquent</span>
                </div>
              </div>
            </div>

            {/* Grid Matrix: 12 Floors x 8 Units */}
            <div className="space-y-1.5 pt-2">
              {Array.from({ length: 12 }, (_, idx) => {
                const floor = 12 - idx;
                const floorUnits = units.filter((u) => u.floor === floor);
                return (
                  <div key={floor} className="flex items-center gap-1.5">
                    <span className="w-6 text-[11px] font-mono text-[#627d98] text-right pr-1">
                      {floor < 10 ? `0${floor}` : floor}
                    </span>
                    <div className="grid grid-cols-8 gap-1.5 flex-1">
                      {floorUnits.map((u) => {
                        const isSelected = u.unitCode === selectedUnitCode;
                        return (
                          <button
                            key={u.unitCode}
                            onClick={() => setSelectedUnitCode(u.unitCode)}
                            className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                              statusColorMap[u.status]
                            } ${
                              isSelected
                                ? 'ring-2 ring-offset-1 ring-[#19638c] scale-105 shadow-sm font-extrabold z-10'
                                : 'hover:opacity-90'
                            }`}
                          >
                            {u.unitCode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Unit Details Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102a43] mb-4">
              Selected Unit - A-{selectedUnit.unitCode}
            </h3>

            <div className="divide-y divide-[#edf2f7] text-xs">
              <div className="py-2.5 flex justify-between items-center first:pt-0">
                <span className="text-[#627d98] font-medium">Status</span>
                <span
                  className={`font-bold ${
                    selectedUnit.status === 'Delinquent' ? 'text-[#c53030]' : 'text-[#102a43]'
                  }`}
                >
                  {selectedUnit.status}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Customer</span>
                <span className="text-[#102a43] font-medium">{selectedUnit.customer}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Sanction</span>
                <span className="text-[#102a43] font-bold">{selectedUnit.sanction}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Outstanding</span>
                <span className="text-[#102a43] font-bold">{selectedUnit.outstanding}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">LTV</span>
                <span className="text-[#102a43] font-bold">{selectedUnit.ltv}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Approved Rate</span>
                <span className="text-[#102a43] font-medium">{selectedUnit.approvedRate}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Latest Market</span>
                <span className="text-[#102a43] font-medium">{selectedUnit.latestMarket}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">DPD</span>
                <span className="text-[#c53030] font-bold">{selectedUnit.dpd}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Mortgage</span>
                <span className="text-[#102a43] font-medium">{selectedUnit.mortgage}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center last:pb-0">
                <span className="text-[#627d98] font-medium">Last Valuation</span>
                <span className="text-[#102a43] font-medium">{selectedUnit.lastValuation}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() =>
                setActiveEvidence({
                  sourceType: 'Borrower Declaration',
                  sourceId: `LOAN-A-${selectedUnit.unitCode}`,
                  documentTitle: `Retail Loan Account A-${selectedUnit.unitCode}`,
                  pageOrSection: 'Disbursement & DPD Ledger',
                  asOfDate: '2026-09-18',
                  extractedField: `Sanction: ${selectedUnit.sanction} | DPD: ${selectedUnit.dpd}`,
                  snippet: `Borrower record indicates delinquency of ${selectedUnit.dpd}. Mortgage lien registered with Sub-Registrar Haveli-4 Pune.`,
                  confidenceScore: 0.98,
                })
              }
              className="w-full bg-[#19638c] hover:bg-[#145070] text-white py-2.5 rounded-md text-xs font-medium transition-colors shadow-sm text-center"
            >
              Open Loan &amp; Risk Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
