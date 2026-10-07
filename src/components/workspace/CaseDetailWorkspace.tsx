import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { queryStore } from '../../services/queryStore';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import { NavigationModule } from '../../types/navigation';
import {
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Building2,
  Clock,
  ShieldCheck,
  FileSearch,
  Scale,
  DollarSign,
  MessageSquare,
  Files,
  Receipt,
  History,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { RaiseQueryModal } from '../queries/RaiseQueryModal';

interface CaseDetailWorkspaceProps {
  caseId: string;
  currentUser: UserAccount;
  onBack: () => void;
  onNavigateToModule?: (module: NavigationModule, caseId?: string) => void;
}

export const CaseDetailWorkspace: React.FC<CaseDetailWorkspaceProps> = ({
  caseId,
  currentUser,
  onBack,
  onNavigateToModule,
}) => {
  const c = apfStore.getCaseById(caseId);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'TECHNICAL' | 'LEGAL' | 'EXPOSURE' | 'APPROVAL' | 'QUERIES' | 'DOCUMENTS' | 'BILLING' | 'AUDIT'
  >('OVERVIEW');
  const [showQueryModal, setShowQueryModal] = useState(false);

  if (!c) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-xl mx-auto mt-10">
        <h3 className="text-base font-bold text-slate-800">Case Docket Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Docket ID {caseId} does not exist or has been archived.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const project = getProjectById(c.projectId);
  const builder = getBuilderById(c.builderId);
  const tower = getTowerById(c.selectedTowerIds[0]);
  const queries = queryStore.getQueriesForCase(c.id);

  const navigate = (mod: NavigationModule) => {
    if (onNavigateToModule) {
      onNavigateToModule(mod, c.id);
    } else {
      alert(`Navigate to ${mod} for Case ${c.id}`);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Page Header Nav with Breadcrumb */}
      <PageHeaderNav
        moduleName="Case Workspace"
        pageTitle={`Case Dossier: ${c.id}`}
        subtitle={`${project?.projectName || 'Project'} • ${builder?.legalName || 'Builder'} • ${tower?.towerName || 'Tower'}`}
        breadcrumbs={[
          { label: 'Workspace', onClick: onBack },
          { label: 'My APF Cases', onClick: onBack },
          { label: c.id },
          { label: activeTab.charAt(0) + activeTab.slice(1).toLowerCase() },
        ]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQueryModal(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Raise Query</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('CPA_REVIEW')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>CPA Review Pack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {/* Case Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {c.id}
              </span>
              <span className="text-xs font-bold text-slate-500">·</span>
              <h1 className="text-base font-extrabold text-slate-900">{project?.projectName || 'Project'}</h1>
              <span className="text-xs font-semibold text-slate-500">by {builder?.legalName || 'Builder'}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span>Phase & Tower: <strong className="text-slate-800">{tower?.towerName || 'Tower'}</strong></span>
              <span>·</span>
              <span>Units Under Sanction: <strong className="text-slate-800">80</strong></span>
              <span>·</span>
              <span>Initiated By: <strong className="text-slate-800">{c.createdBy}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              Stage: {c.currentStatus}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Desk: {c.currentOwnerRole}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              SLA Due: {c.slaDueDate ? c.slaDueDate.substring(0, 10) : '48h'}
            </span>
          </div>
        </div>

        {/* 9 Workspace Navigation Tabs */}
        <div className="flex items-center gap-1 pt-3 overflow-x-auto text-xs">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: Building2 },
            { id: 'TECHNICAL', label: 'Technical', icon: FileSearch },
            { id: 'LEGAL', label: 'Legal', icon: Scale },
            { id: 'EXPOSURE', label: 'Exposure', icon: DollarSign },
            { id: 'APPROVAL', label: 'Approval', icon: ShieldCheck },
            { id: 'QUERIES', label: 'Queries', icon: MessageSquare },
            { id: 'DOCUMENTS', label: 'Documents', icon: Files },
            { id: 'BILLING', label: 'Billing', icon: Receipt },
            { id: 'AUDIT', label: 'Audit', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs">
                <span className="text-slate-400 block text-[10px]">Recommended APF Rate</span>
                <strong className="text-sky-800 text-sm font-bold">₹7,200 / sq.ft</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs">
                <span className="text-slate-400 block text-[10px]">Fair Market Value</span>
                <strong className="text-slate-900 text-sm font-bold">₹324.50 Cr</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs">
                <span className="text-slate-400 block text-[10px]">Title Opinion</span>
                <strong className="text-emerald-700 text-sm font-bold">Clear w/ Cond.</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs">
                <span className="text-slate-400 block text-[10px]">Open Exceptions</span>
                <strong className="text-amber-700 text-sm font-bold">1 Pre-Disb.</strong>
              </div>
            </div>

            {/* Summarized Underwriting Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Technical Card */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <FileSearch className="w-4 h-4 text-sky-600" />
                    <span>Technical Valuation</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Grade A
                  </span>
                </div>
                <div>Status: <strong className="text-slate-800">Submitted</strong></div>
                <div>Agency: <strong className="text-slate-800">{c.valuerAssignment?.vendorAgency || 'Knight Frank India'}</strong></div>
                <div>Site Visit: <strong className="text-emerald-700">Complete (GPS Geotagged)</strong></div>
                <div>Progress: <strong className="text-slate-800">62.5% Slabs Cast</strong></div>
                <button
                  type="button"
                  onClick={() => navigate('VALUATION_MODULE')}
                  className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Technical Valuation Module</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </div>

              {/* Legal Card */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Legal Due Diligence</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Clear Title
                  </span>
                </div>
                <div>Status: <strong className="text-slate-800">Clear with 2 Covenants</strong></div>
                <div>Counsel: <strong className="text-slate-800">Dua Associates & Partners</strong></div>
                <div>Search Scope: <strong className="text-slate-800">30 Years Continuous</strong></div>
                <div>Litigation Check: <strong className="text-emerald-700">Clean / Zero Pending</strong></div>
                <button
                  type="button"
                  onClick={() => navigate('LEGAL_DD')}
                  className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Legal Due Diligence Module</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Actions & Queries */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Underwriting Actions</h3>
              <button
                type="button"
                onClick={() => navigate('CPA_REVIEW')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Synthesize CPA Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('APPROVAL_COCKPIT')}
                className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Approval Cockpit</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('EXPOSURE')}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>View Exposure 360</span>
              </button>
            </div>

            {/* Queries summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Case Queries ({queries.length})</h4>
                <button
                  type="button"
                  onClick={() => navigate('QUERY_TRAY')}
                  className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                >
                  Query Tray
                </button>
              </div>
              {queries.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No open queries on this docket</div>
              ) : (
                <div className="space-y-1.5">
                  {queries.map((q) => (
                    <div key={q.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800">{q.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">To: {q.assignedToRole} · {q.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: TECHNICAL */}
      {activeTab === 'TECHNICAL' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technical Valuation Summary</h3>
              <p className="text-xs text-slate-500">Physical inspection, construction progress & Fair Market Valuation</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('VALUATION_MODULE')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Technical Valuation Module</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Valuation Agency</span>
              <strong className="text-slate-800 text-sm">Knight Frank India Pvt Ltd</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Site Visit Status</span>
              <strong className="text-emerald-700 text-sm">Completed (GPS Geotagged)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Engineering Grade</span>
              <strong className="text-emerald-700 text-sm">Grade A (Superior)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Recommended APF Rate</span>
              <strong className="text-sky-700 text-sm">₹7,200 / sq.ft</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: LEGAL */}
      {activeTab === 'LEGAL' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Legal Due Diligence Summary</h3>
              <p className="text-xs text-slate-500">30-year flow of title, encumbrance search & advocate opinion</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('LEGAL_DD')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Legal Due Diligence Module</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Legal Counsel</span>
              <strong className="text-slate-800 text-sm">Dua Associates & Partners</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Title Opinion</span>
              <strong className="text-emerald-700 text-sm">Clear with 2 Covenants</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Litigation Scrutiny</span>
              <strong className="text-emerald-700 text-sm">0 Pending Suits</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">CERSAI Status</span>
              <strong className="text-emerald-700 text-sm">Clean Registry</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: EXPOSURE */}
      {activeTab === 'EXPOSURE' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Builder Exposure 360 Summary</h3>
              <p className="text-xs text-slate-500">Direct Bank Exposure, Consortium Debt & Group Financial Health</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('EXPOSURE')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Exposure 360 Module</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Group Sanctioned</span>
              <strong className="text-slate-800 text-sm">₹420.00 Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Current Outstanding</span>
              <strong className="text-slate-800 text-sm">₹285.40 Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Proposed Retail APF</span>
              <strong className="text-emerald-700 text-sm">₹75.00 Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Post-Approval Headroom</span>
              <strong className="text-sky-700 text-sm">₹80.00 Cr (Within Limit)</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: APPROVAL */}
      {activeTab === 'APPROVAL' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sanction Decision & Authority Record</h3>
              <p className="text-xs text-slate-500">Committee Cockpit, Sanction Letters & Conditions</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('APPROVAL_COCKPIT')}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Approval Cockpit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Current Sanction State: {c.currentStatus}</div>
            <p className="text-slate-600">
              All underwriting assessments (Technical Grade A, Legal Title Clear, Exposure Low Risk) are verified. Click above to execute final committee decision.
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: QUERIES */}
      {activeTab === 'QUERIES' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Queries & Clarifications Tray</h3>
              <p className="text-xs text-slate-500">Formal inquiries exchanged between Valuer, Legal, CPA & COM</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('QUERY_TRAY')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Full Query Tray</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {queries.map((q) => (
              <div key={q.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">{q.subject}</strong>
                  <span className="text-slate-500 text-[11px]">Raised by {q.raisedByUserName} · To {q.assignedToRole}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Case Documents & Evidence</h3>
              <p className="text-xs text-slate-500">RERA certificates, title deeds, blueprints & sanction letters</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('DOCUMENT_VAULT')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Document Vault</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-800 block">RERA_Registration_P52100018542.pdf</strong>
              <span className="text-slate-400 text-[10px] font-mono">v1.2 · Verified Clearance</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-800 block">Title_Search_Report_30_Years.pdf</strong>
              <span className="text-slate-400 text-[10px] font-mono">v1.0 · Dua Associates & Partners</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: BILLING */}
      {activeTab === 'BILLING' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vendor Billing & Settlement</h3>
              <p className="text-xs text-slate-500">Valuation & Legal professional fee settlement</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('BILLING')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Billing & Payments Module</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Technical Valuation Fee</span>
              <strong className="text-slate-900">₹25,000 + 18% GST (Knight Frank)</strong>
              <span className="text-emerald-700 block text-[10px] mt-1 font-bold">Approved for Payment</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Legal Scrutiny Fee</span>
              <strong className="text-slate-900">₹35,000 + 18% GST (Dua Associates)</strong>
              <span className="text-emerald-700 block text-[10px] mt-1 font-bold">Disbursed (UTR #98124)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Case Audit History</h3>
              <p className="text-xs text-slate-500">Full timeline of role transitions and action timestamps</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('REPORTS')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Reports & Audit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between">
              <div>
                <strong className="text-slate-900">APF Case Initiated</strong>
                <p className="text-slate-500 text-[11px]">Assigned to Knight Frank India & Dua Associates</p>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">14-Jan-2026 10:30</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between">
              <div>
                <strong className="text-slate-900">Technical Valuation Report Uploaded</strong>
                <p className="text-slate-500 text-[11px]">Fair market value: ₹324.50 Cr</p>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">18-Jan-2026 15:45</span>
            </div>
          </div>
        </div>
      )}

      {/* Raise Query Modal */}
      {showQueryModal && (
        <RaiseQueryModal
          isOpen={showQueryModal}
          onClose={() => setShowQueryModal(false)}
          caseId={c.id}
          builderId={c.builderId}
          builderName={builder?.legalName || 'Builder'}
          projectId={c.projectId}
          projectName={project?.projectName || 'Project'}
          towerName={tower?.towerName}
          currentUser={currentUser}
          onQueryCreated={() => setShowQueryModal(false)}
        />
      )}
    </div>
  );
};
