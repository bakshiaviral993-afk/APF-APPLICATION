import React from 'react';
import { TrendingUp, MapPin, Database, Award } from 'lucide-react';
import { ExposureSourceBadge } from './ExposureSourceBadge';

export interface MarketComparableItem {
  project: string;
  developer: string;
  distanceKm: number | string;
  configuration: string;
  carpetAreaSqFt: number;
  quotedRateSqFt: number;
  registeredRateSqFt: number;
  source: string;
  sourceDate: string;
  salesVelocityUnitsMo: number;
  unsoldUnits: number;
  premiumVsSubjectPct: number;
}

interface ComparableGridProps {
  subjectProjectName: string;
  subjectRate: number;
  comparables?: MarketComparableItem[];
}

export const ComparableGrid: React.FC<ComparableGridProps> = ({
  subjectProjectName,
  subjectRate,
  comparables,
}) => {
  const defaultComps: MarketComparableItem[] = comparables || [
    {
      project: `${subjectProjectName} (Subject APF)`,
      developer: 'Kolte-Patil Developers Ltd',
      distanceKm: '—',
      configuration: '2 & 3 BHK',
      carpetAreaSqFt: 780,
      quotedRateSqFt: 7800,
      registeredRateSqFt: 7450,
      source: 'RERA QPR Form 3 & Developer Price Sheet',
      sourceDate: '2026-09-02',
      salesVelocityUnitsMo: 14,
      unsoldUnits: 38,
      premiumVsSubjectPct: 0,
    },
    {
      project: 'Rohan Ananta',
      developer: 'Rohan Builders',
      distanceKm: '1.2 km',
      configuration: '2 BHK',
      carpetAreaSqFt: 710,
      quotedRateSqFt: 7900,
      registeredRateSqFt: 7520,
      source: 'MahaRERA & IGR Registration Data',
      sourceDate: '2026-08-15',
      salesVelocityUnitsMo: 11,
      unsoldUnits: 45,
      premiumVsSubjectPct: +0.9,
    },
    {
      project: 'Godrej 24',
      developer: 'Godrej Properties',
      distanceKm: '2.4 km',
      configuration: '2 & 3 BHK',
      carpetAreaSqFt: 840,
      quotedRateSqFt: 8500,
      registeredRateSqFt: 8100,
      source: 'Propstack & Registered Deeds',
      sourceDate: '2026-08-28',
      salesVelocityUnitsMo: 18,
      unsoldUnits: 62,
      premiumVsSubjectPct: +8.7,
    },
    {
      project: 'Megapolis Sparklet',
      developer: 'Kumar Properties / Pegasus',
      distanceKm: '2.8 km',
      configuration: '2 BHK',
      carpetAreaSqFt: 690,
      quotedRateSqFt: 7400,
      registeredRateSqFt: 7150,
      source: 'IGR Stamp Duty Index II',
      sourceDate: '2026-07-30',
      salesVelocityUnitsMo: 9,
      unsoldUnits: 28,
      premiumVsSubjectPct: -4.0,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102a43]">Micro-Market Valuation Comparables</h3>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30">
              SIMULATED POC DATA
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Micro-Market: Marunji / Hinjawadi Phase 1 • Verified transaction evidence vs developer quoted rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#627d98]">Adopted Base Rate:</span>
          <span className="font-mono font-bold text-sm text-[#137333]">₹{subjectRate.toLocaleString()} / sq.ft</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
            <tr>
              <th className="py-3 px-4">Project & Developer</th>
              <th className="py-3 px-4">Distance</th>
              <th className="py-3 px-4">Config / Area</th>
              <th className="py-3 px-4">Quoted Rate</th>
              <th className="py-3 px-4">Reg. Trans. Rate</th>
              <th className="py-3 px-4">Variance vs Subject</th>
              <th className="py-3 px-4">Sales Velocity</th>
              <th className="py-3 px-4 text-right">Data Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
            {defaultComps.map((c, i) => {
              const isSubject = i === 0;
              return (
                <tr
                  key={i}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSubject ? 'bg-[#e8f1f5]/40 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#102a43] block">{c.project}</span>
                    <span className="text-[11px] text-[#627d98]">{c.developer}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#486581]">{c.distanceKm}</td>
                  <td className="py-3.5 px-4 text-[#486581]">
                    {c.configuration} ({c.carpetAreaSqFt} sq.ft)
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#627d98]">
                    ₹{c.quotedRateSqFt.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-[#102a43]">
                    ₹{c.registeredRateSqFt.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.premiumVsSubjectPct === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f5f9] text-[#627d98]">
                        Baseline
                      </span>
                    ) : c.premiumVsSubjectPct > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1f5] text-[#19638c]">
                        +{c.premiumVsSubjectPct}% Premium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fef7e0] text-[#b06000]">
                        {c.premiumVsSubjectPct}% Discount
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#137333]">{c.salesVelocityUnitsMo} units/mo</span>
                    <span className="block text-[10px] text-[#627d98]">{c.unsoldUnits} unsold units</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] text-[#627d98] block truncate max-w-[140px] ml-auto">
                      {c.source}
                    </span>
                    <span className="text-[10px] text-[#829ab1]">{c.sourceDate}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
