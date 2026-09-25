import React, { useState, useEffect } from 'react';
import {
  Building2,
  Database,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Layers,
  Lock,
  Clock,
  ArrowRight,
  Eye,
  ChevronRight,
  Filter,
  Search,
  Info,
  ExternalLink,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  DollarSign,
  X,
  FileCode,
  Tag,
  Check,
} from 'lucide-react';
import { CENTRAL_BUILDER_MASTER } from '../../data/centralMasterData';
import { demoExposureService } from '../../services/demoExposureService';
import { FetchExposureDrawer } from './FetchExposureDrawer';
import { canAccessExposureReport, ExposureAccessRestrictedCard } from '../../utils/exposurePermissions';
import {
  BuilderExposureResponse,
  BuilderExposureSummary,
  DemoLenderFacility,
  DemoProjectExposure,
  DemoGroupEntity,
  DemoSourceFetchStatus,
  DemoReconciliationItem,
  ExposureSnapshot,
  DemoReconciliationStatus,
} from '../../types/demoExposureTypes';

interface BuilderExposure360ReportProps {
  currentUser?: any;
  builderId?: string;
  caseId?: string;
  onDecisionMade?: (decision: string, snapshotId: string) => void;
}

type TabType =
  | 'SUMMARY'
  | 'LENDERS'
  | 'PROJECTS'
  | 'GROUP'
  | 'SOURCES'
  | 'RECONCILIATION'
  | 'AUDIT';

export const BuilderExposure360Report: React.FC<BuilderExposure360ReportProps> = ({
  currentUser,
  builderId: initialBuilderId,
  caseId = 'APF-2026-0001',
  onDecisionMade,
}) => {
  // Selected builder state (defaults to passed builder or BLD-PUN-001)
  const [selectedBuilderId, setSelectedBuilderId] = useState<string>(
    initialBuilderId || 'BLD-PUN-001'
  );

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('SUMMARY');

  // Fetch Drawer open
  const [isFetchDrawerOpen, setIsFetchDrawerOpen] = useState(false);

  // Data states
  const [summary, setSummary] = useState<BuilderExposureSummary>(
    demoExposureService.getBuilderSummary(selectedBuilderId)
  );
  const [facilities, setFacilities] = useState<DemoLenderFacility[]>([]);
  const [projects, setProjects] = useState<DemoProjectExposure[]>([]);
  const [groupEntities, setGroupEntities] = useState<DemoGroupEntity[]>([]);
  const [sources, setSources] = useState<DemoSourceFetchStatus[]>([]);
  const [reconciliationItems, setReconciliationItems] = useState<DemoReconciliationItem[]>([]);
  const [frozenSnapshot, setFrozenSnapshot] = useState<ExposureSnapshot | undefined>(undefined);

  // Drilldown states
  const [selectedLenderModal, setSelectedLenderModal] = useState<string | null>(null);
  const [selectedProjectForTowers, setSelectedProjectForTowers] = useState<DemoProjectExposure | null>(null);

  // Reconciliation reviewer modal
  const [editingReconItem, setEditingReconItem] = useState<DemoReconciliationItem | null>(null);
  const [newReconStatus, setNewReconStatus] = useState<DemoReconciliationStatus>('VERIFIED');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Search & filter
  const [lenderSearch, setLenderSearch] = useState('');
  const [reconFilter, setReconFilter] = useState<string>('ALL');

  // Refresh trigger counter
  const [dataVersion, setDataVersion] = useState(0);

  // Load data for the selected builder
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const s = demoExposureService.getBuilderSummary(selectedBuilderId);
      const facs = await demoExposureService.getLenderExposure(selectedBuilderId);
      const prjs = await demoExposureService.getProjectExposure(selectedBuilderId);
      const grp = await demoExposureService.getGroupExposure(selectedBuilderId);
      const srcs = await demoExposureService.getSourceFetchStatuses(selectedBuilderId);
      const recons = await demoExposureService.getReconciliation(selectedBuilderId);
      const snap = demoExposureService.getLatestSnapshotForBuilder(selectedBuilderId);

      if (isMounted) {
        setSummary(s);
        setFacilities(facs);
        setProjects(prjs);
        setGroupEntities(grp);
        setSources(srcs);
        setReconciliationItems(recons);
        setFrozenSnapshot(snap);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedBuilderId, dataVersion]);

  // When initialBuilderId changes externally
  useEffect(() => {
    if (initialBuilderId && initialBuilderId !== selectedBuilderId) {
      setSelectedBuilderId(initialBuilderId);
    }
  }, [initialBuilderId]);

  const handleFetchComplete = (resp: BuilderExposureResponse, snapshot?: ExposureSnapshot) => {
    setSummary(resp.summary);
    setFacilities(resp.facilities);
    setProjects(resp.projects);
    setGroupEntities(resp.groupEntities);
    setSources(resp.sources);
    setReconciliationItems(resp.reconciliation);
    if (snapshot) setFrozenSnapshot(snapshot);
    setDataVersion((v) => v + 1);
  };

  const handleSaveReconReview = () => {
    if (!editingReconItem) return;
    demoExposureService.updateReconciliationItem(
      editingReconItem.id,
      newReconStatus,
      reviewerNotes || 'Verified against bank core bureau records.',
      currentUser?.name || 'Credit Underwriter'
    );
    setSaveSuccessMsg(`Exception #${editingReconItem.id} marked as ${newReconStatus}`);
    setEditingReconItem(null);
    setDataVersion((v) => v + 1);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleFreezeCurrentSnapshot = () => {
    const snap = demoExposureService.createOrFreezeSnapshot(
      selectedBuilderId,
      caseId,
      currentUser?.name || 'Credit Processing Associate (CPA)'
    );
    setFrozenSnapshot(snap);
    setSaveSuccessMsg(`New Immutable Snapshot #${snap.snapshotId} generated and frozen.`);
    if (onDecisionMade) {
      onDecisionMade('SNAPSHOT_GENERATED', snap.snapshotId);
    }
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Filter facilities
  const filteredFacilities = facilities.filter(
    (f) =>
      f.lender.toLowerCase().includes(lenderSearch.toLowerCase()) ||
      f.facilityType.toLowerCase().includes(lenderSearch.toLowerCase()) ||
      (f.projectName && f.projectName.toLowerCase().includes(lenderSearch.toLowerCase())) ||
      (f.borrowerEntity && f.borrowerEntity.toLowerCase().includes(lenderSearch.toLowerCase()))
  );

  // Group facilities by Lender for drilldown
  const distinctLenders = Array.from(new Set(facilities.map((f) => f.lender)));
  const lenderDrilldownFacilities = facilities.filter((f) => f.lender === selectedLenderModal);
  const lenderTotalSanction = lenderDrilldownFacilities.reduce((sum, f) => sum + f.sanctionCr, 0);
  const lenderTotalOutstanding = lenderDrilldownFacilities.reduce((sum, f) => sum + f.outstandingCr, 0);
  const lenderTotalNonFund = lenderDrilldownFacilities.reduce((sum, f) => sum + f.nonFundCr, 0);
  const lenderProjectLinked = lenderDrilldownFacilities.filter((f) => f.projectId).reduce((sum, f) => sum + f.outstandingCr, 0);

  // Filter reconciliation
  const filteredReconItems = reconciliationItems.filter((r) => {
    if (reconFilter === 'EXCEPTIONS') return r.status === 'REVIEW REQUIRED' || r.status === 'CONFLICT';
    if (reconFilter === 'MATCHED') return r.status === 'MATCHED' || r.status === 'VERIFIED';
    if (reconFilter === 'PARTIAL') return r.status === 'PARTIAL MATCH';
    return true;
  });

  const pendingExceptionsCount = reconciliationItems.filter(
    (r) => r.status === 'REVIEW REQUIRED' || r.status === 'CONFLICT'
  ).length;

  // Strict RBAC Enforcement: Valuers have no access to Exposure Report
  if (!canAccessExposureReport(currentUser?.role)) {
    return (
      <ExposureAccessRestrictedCard
        currentRole={currentUser?.role}
        userName={currentUser?.name}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP GOVERNANCE BANNER & CONTROLS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 font-mono">
                RBI MULTILATERAL EXPOSURE FRAMEWORK
              </span>
              <span className="text-xs text-slate-500 font-mono">Case ID: {caseId}</span>
              {frozenSnapshot ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-emerald-700" /> FROZEN SNAPSHOT #{frozenSnapshot.snapshotId}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-amber-700" /> LIVE RECONCILED WORKING DRAFT
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-sky-700" />
              <span>Builder Exposure 360 & Multilateral Reconciliation</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Consolidated debt profile, consortium lender positions, project financing, and retail concentration limits
            </p>
          </div>

          {/* Builder Selector & Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Builder Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-300">
              <span className="text-[11px] font-bold text-slate-600 pl-1.5">Builder:</span>
              <select
                value={selectedBuilderId}
                onChange={(e) => setSelectedBuilderId(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {CENTRAL_BUILDER_MASTER.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.legalName} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            {/* PRIMARY FETCH EXPOSURE BUTTON */}
            <button
              type="button"
              onClick={() => setIsFetchDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-sky-200" />
              <span>FETCH EXPOSURE</span>
            </button>

            {/* FREEZE SNAPSHOT BUTTON */}
            <button
              type="button"
              onClick={handleFreezeCurrentSnapshot}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300"
              title="Freeze an immutable audit snapshot for APF approval"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Freeze Snapshot</span>
            </button>
          </div>
        </div>

        {/* Enterprise Multi-Source Exposure Status Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0c3148] shrink-0" />
            <span>
              <strong>Consolidated Group Exposure Stack:</strong> Corroborated across MCA-21, CERSAI, and Credit Bureau registers.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500 font-mono">
            <span>Last Reconciled: {summary.lastRefresh || '2026-09-21'}</span>
          </div>
        </div>

        {/* Notification Toast */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Builder Quick Snapshot Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-500 text-[11px]">Developer Entity:</span>{' '}
              <strong className="text-slate-900">{summary.builderName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">City:</span>{' '}
              <strong className="text-slate-900">{summary.city}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Direct O/S:</span>{' '}
              <strong className="text-slate-900 font-mono">₹{summary.directOutstandingCr} Cr</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Group Exposure:</span>{' '}
              <strong className="text-slate-900 font-mono">₹{summary.groupExposureCr} Cr</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Group Cap:</span>{' '}
              <strong className="text-slate-900 font-mono">₹{summary.limitCr} Cr</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Risk Band:</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                summary.riskBand === 'LOW'
                  ? 'bg-emerald-100 text-emerald-800'
                  : summary.riskBand === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {summary.riskBand} RISK
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION (7 Mandatory Tabs) */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold bg-white rounded-t-2xl px-2">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'SUMMARY'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Exposure Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('LENDERS')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'LENDERS'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Lender-wise Exposure</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {facilities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'PROJECTS'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Project-wise Exposure</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {projects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('GROUP')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'GROUP'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Group Exposure</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {groupEntities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SOURCES')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'SOURCES'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Source Fetch Status</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
            9 Sources
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RECONCILIATION')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'RECONCILIATION'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reconciliation</span>
          {pendingExceptionsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {pendingExceptionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-3.5 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit / Source Evidence</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: EXPOSURE SUMMARY (13 KPI CARDS) */}
      {activeTab === 'SUMMARY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Card 1: Direct Sanctioned */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Direct Sanctioned</span>
                <span className="text-[10px] text-slate-400 font-mono">Consortium</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ₹{summary.directSanctionedCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Consortium Line</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 2: Direct Outstanding */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Direct Outstanding</span>
                <span className="text-[10px] text-slate-400 font-mono">CRILC</span>
              </div>
              <div className="text-lg font-bold text-sky-900 font-mono">
                ₹{summary.directOutstandingCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>CIC / CRILC</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 3: Non-Fund Exposure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Non-Fund Exposure</span>
                <span className="text-[10px] text-slate-400 font-mono">CBS BG/LC</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ₹{summary.nonFundCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Internal CBS / BG LC</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 4: Project Finance Exposure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Project Finance</span>
                <span className="text-[10px] text-slate-400 font-mono">Lead Bank</span>
              </div>
              <div className="text-lg font-bold text-indigo-900 font-mono">
                ₹{summary.projectFinanceCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>CRILC / Lead Bank</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 5: Existing APF Exposure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Existing APF Exposure</span>
                <span className="text-[10px] text-slate-400 font-mono">Portfolio</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ₹{summary.existingApfCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>APF Database</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 6: Retail Linked Outstanding */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Retail Linked O/S</span>
                <span className="text-[10px] text-slate-400 font-mono">LMS</span>
              </div>
              <div className="text-lg font-bold text-teal-800 font-mono">
                ₹{summary.retailLinkedOutstandingCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Retail Loan LMS</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 7: Retail Pipeline */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Retail Pipeline</span>
                <span className="text-[10px] text-slate-400 font-mono">In-Flight</span>
              </div>
              <div className="text-lg font-bold text-slate-700 font-mono">
                ₹{summary.retailPipelineCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>In-flight Tracker</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 8: Group Exposure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Group Exposure</span>
                <span className="text-[10px] text-slate-400 font-mono">Rollup</span>
              </div>
              <div className="text-lg font-bold text-purple-900 font-mono">
                ₹{summary.groupExposureCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Rollup Hierarchy</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Card 9: Proposed APF */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Proposed APF</span>
                <span className="text-[10px] text-amber-700 font-semibold">TICKET</span>
              </div>
              <div className="text-lg font-bold text-amber-900 font-mono">
                ₹{summary.proposedApfCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Case: {caseId}</span>
                <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> PROPOSED
                </span>
              </div>
            </div>

            {/* Card 10: Post-Approval Group Exposure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Post-Approval Group</span>
                <span className="text-[10px] text-rose-700 font-semibold">PRO-FORMA</span>
              </div>
              <div className="text-lg font-bold text-rose-900 font-mono">
                ₹{summary.postApprovalGroupExposureCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Pro-Forma Aggregation</span>
                <span className="text-slate-600 font-semibold">DECISION</span>
              </div>
            </div>

            {/* Card 11: Exposure Limit (Cap) */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Prudential Cap</span>
                <span className="text-[10px] text-emerald-700 font-semibold">BOARD</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ₹{summary.limitCr} Cr
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Headroom: ₹{summary.limitCr - summary.postApprovalGroupExposureCr} Cr</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> APPROVED
                </span>
              </div>
            </div>

            {/* Card 12: Limit Utilization & Risk Band */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Limit Utilization</span>
                <span
                  className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${
                    summary.riskBand === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {summary.riskBand} RISK
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {summary.limitUtilizationPct}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-1 rounded-full ${
                    summary.limitUtilizationPct > 85 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, summary.limitUtilizationPct)}%` }}
                />
              </div>
              <div className="pt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Post-Sanction Headroom:</span>
                <span className="font-mono font-bold text-slate-800">
                  {Math.round((100 - summary.limitUtilizationPct) * 10) / 10}%
                </span>
              </div>
            </div>
          </div>

          {/* Golden Rules Summary Card */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              <span>PROVAL Golden Record Exposure Principles</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-sky-900">
              <div className="bg-white p-3 rounded-lg border border-sky-100">
                <div className="font-bold text-slate-900">1. Charges vs Outstanding</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  MCA charge registration reflects mortgage collateral cap, NOT current outstanding debit balance.
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-sky-100">
                <div className="font-bold text-slate-900">2. Retail vs Corporate Debt</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Retail individual homebuyer loans are NOT counted as builder balance sheet corporate debt.
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-sky-100">
                <div className="font-bold text-slate-900">3. Single Facility Dedup</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  A facility co-reported by CRILC, CIC, and Borrower Declaration is resolved into 1 Golden Facility.
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-sky-100">
                <div className="font-bold text-slate-900">4. Immutable Snapshots</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Approval decisions freeze the exact exposure state, locking the decision snapshot against later refreshes.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LENDER-WISE EXPOSURE */}
      {activeTab === 'LENDERS' && (
        <div className="space-y-4">
          {/* Search bar & summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lender, facility type, or project..."
                value={lenderSearch}
                onChange={(e) => setLenderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Showing <strong>{filteredFacilities.length}</strong> facilities across <strong>{distinctLenders.length}</strong> lenders</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Lender</th>
                    <th className="p-3.5">Facility Type</th>
                    <th className="p-3.5">Borrower Entity</th>
                    <th className="p-3.5">Linked Project</th>
                    <th className="p-3.5 text-right">Sanction (₹ Cr)</th>
                    <th className="p-3.5 text-right">Outstanding (₹ Cr)</th>
                    <th className="p-3.5 text-right">Undrawn (₹ Cr)</th>
                    <th className="p-3.5 text-right">Non-Fund (₹ Cr)</th>
                    <th className="p-3.5">Security</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">As-of</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFacilities.map((fac) => (
                    <tr
                      key={fac.facilityId}
                      className="hover:bg-sky-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLenderModal(fac.lender)}
                    >
                      <td className="p-3.5 font-bold text-slate-900">
                        {fac.lender}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {fac.facilityType}
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px]">
                        {fac.borrowerEntity || summary.builderName}
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {fac.projectName ? (
                          <span className="text-sky-800 font-semibold">{fac.projectName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Corporate Level</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{fac.sanctionCr}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-sky-900">
                        ₹{fac.outstandingCr}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">
                        ₹{fac.undrawnCr}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">
                        {fac.nonFundCr > 0 ? `₹${fac.nonFundCr}` : '—'}
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px] max-w-[140px] truncate" title={fac.security}>
                        {fac.security}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                          {fac.source}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {fac.asOf}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            fac.status === 'VERIFIED' || fac.status === 'MATCHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {fac.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLenderModal(fac.lender);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-colors border border-sky-200"
                        >
                          View Drilldown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT-WISE EXPOSURE */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Prudential Separation:</strong> Project Finance loans are developer liabilities secured by project cash flows. Retail home loans are individual retail borrower loans and are tracked separately for project concentration.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((prj) => (
              <div key={prj.projectId} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                        {prj.projectId}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">RERA: {prj.rera}</span>
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        ACTIVE APF
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1">{prj.projectName}</h3>
                    <p className="text-xs text-slate-400">Developer: {prj.builderName} • {prj.city}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProjectForTowers(prj)}
                      className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tower Drilldown ({prj.towers.length} Towers)</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">PF Sanction</div>
                    <div className="text-lg font-black text-slate-900 font-mono">₹{prj.projectFinanceSanctionCr} Cr</div>
                    <div className="text-[10px] text-slate-500 mt-1">Project Finance Line</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">PF Outstanding</div>
                    <div className="text-lg font-black text-sky-900 font-mono">₹{prj.projectFinanceOutstandingCr} Cr</div>
                    <div className="text-[10px] text-slate-500 mt-1">Current Balance</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Retail Sanctioned</div>
                    <div className="text-lg font-black text-teal-900 font-mono">₹{prj.retailSanctionedCr} Cr</div>
                    <div className="text-[10px] text-slate-500 mt-1">{prj.retailLoanCount} Home Loans</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Retail Outstanding</div>
                    <div className="text-lg font-black text-teal-800 font-mono">₹{prj.retailOutstandingCr} Cr</div>
                    <div className="text-[10px] text-slate-500 mt-1">Disbursed Portfolio</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Retail Pipeline</div>
                    <div className="text-lg font-black text-amber-800 font-mono">₹{prj.retailPipelineCr} Cr</div>
                    <div className="text-[10px] text-slate-500 mt-1">In-Flight Files</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Construction / Rate</div>
                    <div className="text-lg font-black text-slate-900 font-mono">{prj.constructionPct}%</div>
                    <div className="text-[10px] text-slate-500 mt-1">₹{prj.valuationRatePsf.toLocaleString()} / sq ft</div>
                  </div>
                </div>

                {/* Towers pill strip */}
                <div className="px-6 pb-6 pt-0 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">Registered Towers:</span>
                  {prj.towers.map((tower, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold"
                    >
                      {tower}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GROUP EXPOSURE */}
      {activeTab === 'GROUP' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Connected Group Legal Entities Structure</h3>
                <p className="text-xs text-slate-500">
                  Parent developer group hierarchy: Operating Company → Project SPV → Related Entities
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Aggregate Group Exposure:</span>
                <div className="text-xl font-black text-purple-900 font-mono">
                  ₹{summary.groupExposureCr} Cr
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Entity ID</th>
                    <th className="p-3.5">Entity Legal Name</th>
                    <th className="p-3.5">Entity Classification</th>
                    <th className="p-3.5">Linked Project ID</th>
                    <th className="p-3.5 text-right">Exposure (₹ Cr)</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupEntities.map((ent) => (
                    <tr key={ent.entityId} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono text-slate-600">{ent.entityId}</td>
                      <td className="p-3.5 font-bold text-slate-900">{ent.entityName}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ent.entityType === 'Operating Company'
                              ? 'bg-blue-100 text-blue-800'
                              : ent.entityType === 'Project SPV'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {ent.entityType}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {ent.linkedProjectId || '—'}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-purple-900">
                        ₹{ent.exposureCr} Cr
                      </td>
                      <td className="p-3.5 text-slate-500">Corporate Master Rollup</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200">
                          CORROBORATED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Post-Approval Decision Impact */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">Group Cap:</span>{' '}
                <strong className="text-slate-900 font-mono">₹{summary.limitCr} Cr</strong>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">Post-Approval Group Exposure:</span>{' '}
                <strong className="text-rose-900 font-mono">₹{summary.postApprovalGroupExposureCr} Cr</strong>
              </div>
              <div>
                <span className="text-slate-500">Post-Sanction Headroom:</span>{' '}
                <strong className="text-emerald-700 font-mono">
                  ₹{summary.limitCr - summary.postApprovalGroupExposureCr} Cr ({Math.round((1 - summary.limitUtilizationPct / 100) * 100)}%)
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOURCE FETCH STATUS */}
      {activeTab === 'SOURCES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multilateral Source Feed Status (9 Sources)</h3>
              <p className="text-xs text-slate-500">
                Freshness audit trail, real-time connectivity status, and confidence levels
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFetchDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Sources</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">{src.source}</span>
                    <div className="text-[10px] text-slate-500 font-mono">As of: {src.asOf}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      src.status === 'FETCHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : src.status === 'DEMO CONNECTED'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {src.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{src.message}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-semibold">Freshness:</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                    {src.freshness}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Last Fetch:</span>
                  <span>{src.lastFetchTime || '2026-09-21 14:15 IST'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RECONCILIATION */}
      {activeTab === 'RECONCILIATION' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Status:</span>
              <div className="flex items-center gap-1 text-xs">
                {['ALL', 'EXCEPTIONS', 'MATCHED', 'PARTIAL'].map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setReconFilter(flt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      reconFilter === flt
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Pending Exceptions: <strong className="text-rose-700">{pendingExceptionsCount}</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Exception ID</th>
                  <th className="p-3.5">Exposure Type</th>
                  <th className="p-3.5">Source A</th>
                  <th className="p-3.5 text-right">Value A (₹ Cr)</th>
                  <th className="p-3.5">Source B</th>
                  <th className="p-3.5 text-right">Value B (₹ Cr)</th>
                  <th className="p-3.5 text-right">Variance (₹ Cr)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Reason / Note</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReconItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono text-slate-600">{item.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{item.exposureType}</td>
                    <td className="p-3.5 text-slate-700">{item.sourceA}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{item.valueA} Cr
                    </td>
                    <td className="p-3.5 text-slate-700">{item.sourceB}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-sky-900">
                      ₹{item.valueB} Cr
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-800">
                      ₹{item.varianceCr} Cr
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          item.status === 'MATCHED' || item.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'PARTIAL MATCH'
                            ? 'bg-sky-100 text-sky-800'
                            : item.status === 'REVIEW REQUIRED' || item.status === 'CONFLICT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-xs">
                      {item.reason}
                      {item.reviewerNotes && (
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                          Reviewer: {item.reviewerNotes} ({item.reviewedBy})
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReconItem(item);
                          setNewReconStatus(item.status);
                          setReviewerNotes(item.reviewerNotes || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-colors border border-sky-200"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT / SOURCE EVIDENCE */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          {/* Frozen Snapshot Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded">
                    COMPLIANCE ARTIFACT
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Immutable Decision Record</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  APF Approval Exposure Snapshot (`EXPOSURE_SNAPSHOT`)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Locked prior to approval decisioning. Later exposure refreshes will not alter this baseline snapshot.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFreezeCurrentSnapshot}
                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Generate New Audit Snapshot</span>
              </button>
            </div>

            {frozenSnapshot ? (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      Snapshot ID: <span className="text-sky-700">{frozenSnapshot.snapshotId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Created by: {frozenSnapshot.createdBy} • {frozenSnapshot.createdAt}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> IMMUTABLE & FROZEN
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Direct O/S:</span>
                    <div className="font-mono font-bold text-slate-900">₹{frozenSnapshot.directOutstandingCr} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Project Finance:</span>
                    <div className="font-mono font-bold text-slate-900">₹{frozenSnapshot.projectFinanceCr} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Existing APF:</span>
                    <div className="font-mono font-bold text-slate-900">₹{frozenSnapshot.existingApfCr} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Group Exposure:</span>
                    <div className="font-mono font-bold text-slate-900">₹{frozenSnapshot.groupExposureCr} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Limit / Utilization:</span>
                    <div className="font-mono font-bold text-slate-900">₹{frozenSnapshot.limitCr} Cr ({frozenSnapshot.limitUtilizationPct}%)</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Risk Grade:</span>
                    <div className="font-mono font-bold text-amber-800">{frozenSnapshot.riskBand}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Sources Checked:</span>
                    <div className="font-mono font-bold text-slate-900">{frozenSnapshot.sourceCount} Sources</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Recon Exceptions:</span>
                    <div className="font-mono font-bold text-slate-900">{frozenSnapshot.reconciliationExceptionCount} Items</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                <Lock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">No snapshot frozen yet for this session.</p>
                <p className="mt-1">Click "Generate New Audit Snapshot" to lock the current working draft into compliance storage.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS & DRAWERS */}

      {/* Realistic Staged Fetch Drawer */}
      <FetchExposureDrawer
        isOpen={isFetchDrawerOpen}
        builderId={selectedBuilderId}
        builderName={summary.builderName}
        caseId={caseId}
        onClose={() => setIsFetchDrawerOpen(false)}
        onFetchComplete={handleFetchComplete}
        onNavigateToTab={(tab) => {
          if (tab === 'SUMMARY') setActiveTab('SUMMARY');
          if (tab === 'RECONCILIATION') setActiveTab('RECONCILIATION');
          if (tab === 'LENDER') setActiveTab('LENDERS');
          if (tab === 'PROJECT') setActiveTab('PROJECTS');
        }}
      />

      {/* Lender Drilldown Modal */}
      {selectedLenderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded">
                  LENDER EXPOSURE DRILLDOWN
                </span>
                <h3 className="text-lg font-bold mt-1 text-white">{selectedLenderModal}</h3>
                <p className="text-xs text-slate-400">Builder: {summary.builderName}</p>
              </div>
              <button
                onClick={() => setSelectedLenderModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Aggregate totals for this lender */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Sanction</span>
                  <div className="text-base font-black text-slate-900 font-mono">₹{lenderTotalSanction.toFixed(1)} Cr</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Outstanding</span>
                  <div className="text-base font-black text-sky-900 font-mono">₹{lenderTotalOutstanding.toFixed(1)} Cr</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Non-Fund</span>
                  <div className="text-base font-black text-slate-700 font-mono">₹{lenderTotalNonFund.toFixed(1)} Cr</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Project Linked</span>
                  <div className="text-base font-black text-indigo-900 font-mono">₹{lenderProjectLinked.toFixed(1)} Cr</div>
                </div>
              </div>

              {/* Individual facilities table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Facility ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Project</th>
                      <th className="p-3 text-right">Sanction</th>
                      <th className="p-3 text-right">Outstanding</th>
                      <th className="p-3">Security</th>
                      <th className="p-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lenderDrilldownFacilities.map((f) => (
                      <tr key={f.facilityId} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600">{f.facilityId}</td>
                        <td className="p-3 font-semibold text-slate-900">{f.facilityType}</td>
                        <td className="p-3 text-slate-700">{f.projectName || 'Corporate'}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">₹{f.sanctionCr} Cr</td>
                        <td className="p-3 text-right font-mono font-bold text-sky-900">₹{f.outstandingCr} Cr</td>
                        <td className="p-3 text-[11px] text-slate-600">{f.security}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{f.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-b-2xl border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLenderModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tower Drilldown Modal */}
      {selectedProjectForTowers && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded">
                  PROJECT TOWER BREAKDOWN
                </span>
                <h3 className="text-lg font-bold mt-1 text-white">{selectedProjectForTowers.projectName}</h3>
                <p className="text-xs text-slate-400">RERA: {selectedProjectForTowers.rera}</p>
              </div>
              <button
                onClick={() => setSelectedProjectForTowers(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Individual tower delivery schedule, construction stage, and retail home loan approvals:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProjectForTowers.towers.map((tower, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{tower}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        APPROVED
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Construction %:</span>
                        <strong className="text-slate-800">{selectedProjectForTowers.constructionPct}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Retail Exposure:</span>
                        <strong className="text-teal-800">
                          ₹{Math.round((selectedProjectForTowers.retailOutstandingCr / selectedProjectForTowers.towers.length) * 10) / 10} Cr
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-b-2xl border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProjectForTowers(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Review Modal */}
      {editingReconItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reconcile Exception #{editingReconItem.id}</h3>
                <p className="text-xs text-slate-500">{editingReconItem.exposureType} Variance</p>
              </div>
              <button
                onClick={() => setEditingReconItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source A ({editingReconItem.sourceA}):</span>
                  <strong className="font-mono text-slate-900">₹{editingReconItem.valueA} Cr</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source B ({editingReconItem.sourceB}):</span>
                  <strong className="font-mono text-slate-900">₹{editingReconItem.valueB} Cr</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Variance:</span>
                  <strong className="font-mono text-amber-800">₹{editingReconItem.varianceCr} Cr</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status:</label>
                <select
                  value={newReconStatus}
                  onChange={(e) => setNewReconStatus(e.target.value as DemoReconciliationStatus)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-bold"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="MATCHED">MATCHED</option>
                  <option value="PARTIAL MATCH">PARTIAL MATCH</option>
                  <option value="REVIEW REQUIRED">REVIEW REQUIRED</option>
                  <option value="CONFLICT">CONFLICT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reviewer Notes:</label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Enter credit reconciliation note (e.g. Charge is security collateral, actual drawn per CRILC accepted)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingReconItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReconReview}
                className="px-4 py-2 rounded-xl bg-sky-700 text-white text-xs font-bold hover:bg-sky-800"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
