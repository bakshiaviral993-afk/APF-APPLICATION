import React from 'react';
import {
  FileCheck2,
  MapPin,
  ShieldAlert,
  Gavel,
  AlertTriangle,
  Scale,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';

export type LegalModuleId = 'MODULE_1' | 'MODULE_2' | 'ALL';

interface LegalSectionTabsProps {
  activeModule: LegalModuleId;
  onChangeModule: (mod: LegalModuleId) => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  report?: LegalDueDiligenceReport | null;
}

export const MOD_1_TABS = [
  { id: 'ALL_MOD_1', label: 'All Module 1 (Sec 1-9)', icon: FileSpreadsheet },
  { id: 'SEC_1_2', label: '1-2. Assignment & Builder', icon: MapPin },
  { id: 'SEC_3', label: '3. Documents (12 Checks)', icon: FileCheck2 },
  { id: 'SEC_4_5', label: '4-5. Land & 30-Yr Chain', icon: MapPin },
  { id: 'SEC_6_7', label: '6-7. Dev Rights & Charges', icon: ShieldAlert },
  { id: 'SEC_8_9', label: '8-9. Litigation & RERA', icon: Gavel },
];

export const MOD_2_TABS = [
  { id: 'ALL_MOD_2', label: 'All Module 2 (Sec 10-15)', icon: Scale },
  { id: 'SEC_VALUATION', label: '15. Valuation & Collateral', icon: TrendingUp },
  { id: 'SEC_10_11', label: '10-11. Exceptions & Covenants', icon: AlertTriangle },
  { id: 'SEC_12_14', label: '12-14. Scorecard & Sign-off', icon: Scale },
];

export const ALL_DOSSIER_TABS = [
  { id: 'ALL', label: 'All 15 Sections (Full Dossier)', icon: Layers },
  { id: 'SEC_VALUATION', label: '15. Valuation & Collateral', icon: TrendingUp },
  { id: 'SEC_1_2', label: '1-2. Assignment', icon: MapPin },
  { id: 'SEC_3', label: '3. Documents (12)', icon: FileCheck2 },
  { id: 'SEC_4_5', label: '4-5. 30-Yr Chain', icon: MapPin },
  { id: 'SEC_6_7', label: '6-7. Dev Rights', icon: ShieldAlert },
  { id: 'SEC_8_9', label: '8-9. Litigation', icon: Gavel },
  { id: 'SEC_10_11', label: '10-11. Exceptions', icon: AlertTriangle },
  { id: 'SEC_12_14', label: '12-14. Scorecard', icon: Scale },
];

export const LegalSectionTabs: React.FC<LegalSectionTabsProps> = ({
  activeModule,
  onChangeModule,
  activeSection,
  onSelectSection,
  report,
}) => {
  const verifiedDocCount =
    report?.documentsExamined?.filter((d) => d.status === 'Available').length || 11;
  const totalChargeCr =
    report?.encumbrances?.reduce((sum, item) => sum + (Number(item.chargeAmountCr) || 0), 0) || 0;
  const fmvCr = report?.valuationAlignment?.fairMarketValueCr || 244.8;
  const finalScore = report?.legalScore?.finalLegalScore || 91;

  const currentTabs =
    activeModule === 'MODULE_1'
      ? MOD_1_TABS
      : activeModule === 'MODULE_2'
      ? MOD_2_TABS
      : ALL_DOSSIER_TABS;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 space-y-2">
      {/* 2-Module Segmented Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* Module 1: Title & Statutory Verification */}
        <button
          type="button"
          onClick={() => {
            onChangeModule('MODULE_1');
            onSelectSection('ALL_MOD_1');
          }}
          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
            activeModule === 'MODULE_1'
              ? 'bg-slate-900 border-slate-900 text-white shadow-2xs ring-1 ring-slate-900'
              : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeModule === 'MODULE_1' ? 'bg-sky-400' : 'bg-slate-400'
                }`}
              />
              <span>Page 1: Title Verification</span>
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeModule === 'MODULE_1'
                  ? 'bg-slate-800 text-sky-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              Sec 1–9
            </span>
          </div>
          <div
            className={`text-[11px] mt-1 line-clamp-1 ${
              activeModule === 'MODULE_1' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {verifiedDocCount}/12 Docs · {report?.titleChainRows?.length || 4} Deeds · ₹{totalChargeCr.toFixed(1)} Cr Chg · {report?.litigations?.length || 0} Suits
          </div>
        </button>

        {/* Module 2: Risk Scoring, Valuation & Collateral Clearance */}
        <button
          type="button"
          onClick={() => {
            onChangeModule('MODULE_2');
            onSelectSection('ALL_MOD_2');
          }}
          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
            activeModule === 'MODULE_2'
              ? 'bg-slate-900 border-slate-900 text-white shadow-2xs ring-1 ring-slate-900'
              : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeModule === 'MODULE_2' ? 'bg-emerald-400' : 'bg-slate-400'
                }`}
              />
              <span>Page 2: Risk, Valuation & Sign-off</span>
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeModule === 'MODULE_2'
                  ? 'bg-slate-800 text-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              Sec 10–15
            </span>
          </div>
          <div
            className={`text-[11px] mt-1 line-clamp-1 ${
              activeModule === 'MODULE_2' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Score {finalScore}/100 · FMV ₹{fmvCr.toFixed(1)} Cr · SARFAESI Enforceable
          </div>
        </button>

        {/* Full Dossier Continuous View */}
        <button
          type="button"
          onClick={() => {
            onChangeModule('ALL');
            onSelectSection('ALL');
          }}
          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer sm:col-span-2 lg:col-span-1 ${
            activeModule === 'ALL'
              ? 'bg-slate-900 border-slate-900 text-white shadow-2xs ring-1 ring-slate-900'
              : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Audit Dossier</span>
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded ${
                activeModule === 'ALL'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              All 15 Sec
            </span>
          </div>
          <div
            className={`text-[11px] mt-1 line-clamp-1 ${
              activeModule === 'ALL' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Continuous audit stream with collapse/expand controls
          </div>
        </button>
      </div>

      {/* Secondary Sub-Section Jump Tabs */}
      <div className="pt-1.5 border-t border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1 shrink-0">
            {activeModule === 'MODULE_1'
              ? 'Module 1 Sections:'
              : activeModule === 'MODULE_2'
              ? 'Module 2 Sections:'
              : 'Jump Section:'}
          </span>
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectSection(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
