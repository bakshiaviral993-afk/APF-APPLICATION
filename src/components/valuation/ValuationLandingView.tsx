import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  FileSearch,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Building2,
  ArrowRight,
  Filter,
  Search,
  ShieldAlert,
  Sliders,
  DollarSign,
  Layers,
  Save,
  Check,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { ValuerCaseAppModule } from './ValuerCaseAppModule';

interface ValuationLandingViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
}

const VALUATION_STEPS = [
  'Assignment',
  'Start Site Visit',
  'Land & Location',
  'Approvals',
  'Tower Progress',
  'Quality & Infrastructure',
  'Marketability',
  'Comparables',
  'Valuation',
  'Risk & Recommendation',
  'Photos & Evidence',
  'Preview & Submit',
];

export const ValuationLandingView: React.FC<ValuationLandingViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED'>('ALL');
  const [search, setSearch] = useState('');

  const activeCase = selectedCaseId ? apfStore.getCaseById(selectedCaseId) : null;

  const filteredCases = cases.filter((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const projName = proj?.projectName || '';
    const bldName = bld?.legalName || '';
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase()) ||
      bldName.toLowerCase().includes(search.toLowerCase());
    if (filter === 'PENDING') return matchesSearch && (c.currentStatus.includes('VALUER') || c.currentStatus.includes('IN_PROGRESS'));
    if (filter === 'SUBMITTED') return matchesSearch && c.currentStatus.includes('SUBMITTED');
    return matchesSearch;
  });

  // If a case is selected for 12-step valuation workflow
  if (selectedCaseId && activeCase) {
    const proj = getProjectById(activeCase.projectId);
    const twr = getTowerById(activeCase.selectedTowerIds[0]);

    return (
      <div className="space-y-4 max-w-7xl mx-auto pb-12">
        <PageHeaderNav
          moduleName="Technical Valuation"
          pageTitle={`Technical Appraisal Workflow: ${activeCase.id}`}
          subtitle={`${proj?.projectName || 'Project'} • ${twr?.towerName || 'Tower'} · 12-Step Underwriting Methodology`}
          breadcrumbs={[
            { label: 'Underwriting', onClick: () => setSelectedCaseId(null) },
            { label: 'Technical Valuation', onClick: () => setSelectedCaseId(null) },
            { label: activeCase.id },
            { label: `Step ${activeStep}: ${VALUATION_STEPS[activeStep - 1]}` },
          ]}
          onBack={() => setSelectedCaseId(null)}
          onGoHome={onBack}
          rightActions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close Workflow
              </button>
              <button
                type="button"
                onClick={() => alert('Draft saved successfully to valuation repository.')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>
            </div>
          }
        />

        {/* 12-Step Visual Indicator */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-1 min-w-[900px]">
            {VALUATION_STEPS.map((stepName, idx) => {
              const stepNumber = idx + 1;
              const isCurrent = stepNumber === activeStep;
              const isPast = stepNumber < activeStep;

              return (
                <button
                  key={stepName}
                  type="button"
                  onClick={() => setActiveStep(stepNumber)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 text-xs'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px]">
                    {isPast ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <span>{stepNumber}.</span>}
                  </div>
                  <div className="text-[11px] truncate">{stepName}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body Content using ValuerCaseAppModule with Step controls */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                Step {activeStep} of 12
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-1">{VALUATION_STEPS[activeStep - 1]}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeStep < 12) {
                    setActiveStep((prev) => prev + 1);
                  } else {
                    alert('Valuation report submitted to CPA queue!');
                    setSelectedCaseId(null);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                {activeStep === 12 ? 'Submit Report' : 'Save & Continue →'}
              </button>
            </div>
          </div>

          {/* Integrated Workbench Component */}
          <ValuerCaseAppModule
            caseData={activeCase}
            currentUser={currentUser}
            onBack={() => setSelectedCaseId(null)}
          />
        </div>
      </div>
    );
  }

  // Module Landing Page
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Technical Valuation"
        pageTitle="Technical Valuation & Physical Appraisal Desk"
        subtitle="12-step structured engineering methodology • Drone/Site Inspection • Progress Certification"
        breadcrumbs={[{ label: 'Underwriting', onClick: onBack }, { label: 'Technical Valuation' }]}
        onBack={onBack}
        onGoHome={onBack}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Valuations</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{cases.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Site Visits Due</div>
          <div className="text-xl font-bold text-amber-900 mt-1">2</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700">Draft Reports</div>
          <div className="text-xl font-bold text-sky-900 mt-1">1</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700">In Bank Review</div>
          <div className="text-xl font-bold text-purple-900 mt-1">1</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Certified & Complete</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">3</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Case, Project, Builder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'PENDING', 'SUBMITTED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Valuations' : f === 'PENDING' ? 'Active Workload' : 'Submitted'}
            </button>
          ))}
        </div>
      </div>

      {/* Workload Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Project & Tower</th>
                <th className="py-2.5 px-3">Valuation Agency</th>
                <th className="py-2.5 px-3">Stage / Progress</th>
                <th className="py-2.5 px-3">Market Value (Est.)</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3 text-right">Appraisal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const proj = getProjectById(c.projectId);
                const bld = getBuilderById(c.builderId);
                const twr = getTowerById(c.selectedTowerIds[0]);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{proj?.projectName || 'Project'}</div>
                      <div className="text-[11px] text-slate-500">{bld?.legalName || 'Builder'} · {twr?.towerName || 'Tower'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {c.valuerAssignment?.vendorAgency || 'Knight Frank India Pvt Ltd'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {c.currentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      ₹{c.valuationReport ? (c.valuationReport.fairMarketValueCr).toFixed(2) : '312.50'} Cr
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.slaDueDate ? c.slaDueDate.substring(0, 10) : '48h'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setActiveStep(1);
                        }}
                        className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Open 12-Step Valuation</span>
                        <ArrowRight className="w-3 h-3" />
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
