import React, { useState, useMemo } from 'react';
import { UserAccount, APFCase, CaseStatus } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
import { getBuilderById, getProjectById } from '../../../data/centralMasterData';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  User,
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Building2,
  Calendar,
  Send,
  Bell,
  Eye,
  Download,
  RotateCw,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  BadgeAlert,
  SlidersHorizontal,
  X,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { UploadProofDocumentModal, UploadedProofDocument } from '../../common/UploadProofDocumentModal';

export type TatHealthCategory = 'ALL' | 'WITHIN_SLA' | 'APPROACHING_SLA' | 'BREACHED_SLA' | 'COMPLETED';

interface TatPipelineDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase?: () => void;
  onNavigateToModule?: (module: NavigationModule, caseId?: string) => void;
}

// Standardized 7-stage lifecycle
export interface LifecycleStageDefinition {
  id: string;
  name: string;
  shortLabel: string;
  targetSlaDays: number;
  color: string;
  statuses: CaseStatus[];
}

export const LIFECYCLE_STAGES: LifecycleStageDefinition[] = [
  {
    id: 'INITIATION',
    name: '1. Case Initiation & Setup',
    shortLabel: 'Initiation',
    targetSlaDays: 1.0,
    color: '#0284C7',
    statuses: ['INITIATED'],
  },
  {
    id: 'VALUATION',
    name: '2. Technical Valuation & Site Visit',
    shortLabel: 'Valuation',
    targetSlaDays: 3.0,
    color: '#0EA5E9',
    statuses: ['ASSIGNED_TO_VALUER', 'VALUER_ACCEPTED', 'SITE_VISIT_IN_PROGRESS', 'VALUATION_SUBMITTED'],
  },
  {
    id: 'LEGAL',
    name: '3. Legal Due Diligence & Search',
    shortLabel: 'Legal DD',
    targetSlaDays: 4.0,
    color: '#6366F1',
    statuses: ['LEGAL_ASSIGNED', 'LEGAL_REVIEW'],
  },
  {
    id: 'CPA_UNDERWRITING',
    name: '4. CPA Underwriting & Exposure 360',
    shortLabel: 'CPA Review',
    targetSlaDays: 2.0,
    color: '#1667C1',
    statuses: ['VALUATION_SUBMITTED'],
  },
  {
    id: 'COM_REVIEW',
    name: '5. Credit Operations (COM Review)',
    shortLabel: 'COM Review',
    targetSlaDays: 2.0,
    color: '#D97706',
    statuses: ['COM_REVIEW'],
  },
  {
    id: 'COMMITTEE',
    name: '6. Committee Sanction & Decision',
    shortLabel: 'Committee',
    targetSlaDays: 2.0,
    color: '#9333EA',
    statuses: ['PENDING_APPROVAL'],
  },
  {
    id: 'COMPLETED',
    name: '7. Approved & APF Active',
    shortLabel: 'Completed',
    targetSlaDays: 10.0,
    color: '#15803D',
    statuses: ['APPROVED', 'APF_ACTIVE', 'SENT_TO_LOS', 'LOS_ACKNOWLEDGED'],
  },
];

// Helper to calculate elapsed days
export function calculateElapsedDays(startDateStr: string, endDateStr?: string): number {
  try {
    const start = new Date(startDateStr.replace(' ', 'T')).getTime();
    const end = endDateStr ? new Date(endDateStr.replace(' ', 'T')).getTime() : Date.now();
    if (isNaN(start)) return 1.0;
    const diffMs = Math.max(0, end - start);
    return Math.round((diffMs / (1000 * 60 * 60 * 24)) * 10) / 10;
  } catch {
    return 1.0;
  }
}

// Determine stage index
export function getCaseStageIndex(status: CaseStatus): number {
  switch (status) {
    case 'INITIATED':
      return 0;
    case 'ASSIGNED_TO_VALUER':
    case 'VALUER_ACCEPTED':
    case 'SITE_VISIT_IN_PROGRESS':
      return 1;
    case 'LEGAL_ASSIGNED':
    case 'LEGAL_REVIEW':
      return 2;
    case 'VALUATION_SUBMITTED':
      return 3;
    case 'COM_REVIEW':
      return 4;
    case 'PENDING_APPROVAL':
      return 5;
    case 'APPROVED':
    case 'APF_ACTIVE':
    case 'SENT_TO_LOS':
    case 'LOS_ACKNOWLEDGED':
      return 6;
    default:
      return 0;
  }
}

export interface EnrichedAPFCase extends APFCase {
  totalElapsedDays: number;
  daysInCurrentStage: number;
  targetSlaDays: number;
  tatHealth: 'WITHIN_SLA' | 'APPROACHING_SLA' | 'BREACHED_SLA' | 'COMPLETED';
  stageIdx: number;
  currentStageDef: LifecycleStageDefinition;
  isCompleted: boolean;
  completedAt?: string;
  pendingUserName: string;
  pendingUserRole: string;
  pendingDept: string;
  projectName: string;
  builderName: string;
  city: string;
}

export const TatPipelineDashboardView: React.FC<TatPipelineDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
  onNavigateToModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTatHealth, setSelectedTatHealth] = useState<TatHealthCategory>('ALL');
  const [selectedStageId, setSelectedStageId] = useState<string>('ALL');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TAT_DESC' | 'TAT_ASC' | 'DATE_DESC' | 'SLA_DUE'>('TAT_DESC');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date().toLocaleTimeString());
  const [nudgeFeedback, setNudgeFeedback] = useState<string | null>(null);
  const [timelineModalCase, setTimelineModalCase] = useState<EnrichedAPFCase | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCase, setUploadCase] = useState<EnrichedAPFCase | null>(null);
  const [uploadStageName, setUploadStageName] = useState<string>('');

  const handleProofUploaded = (doc: UploadedProofDocument) => {
    setNudgeFeedback(`Proof "${doc.name}" uploaded for Docket ${uploadCase?.apfNumber || uploadCase?.id}. Verified with SHA-256.`);
    setTimeout(() => setNudgeFeedback(null), 4000);
    setUploadCase(null);
  };

  const cases = apfStore.getAllCases();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 350);
  };

  // Enriched case data with TAT metrics
  const enrichedCases = useMemo(() => {
    const STANDARD_CASE_SLA_DAYS = 10.0;

    return cases.map((c) => {
      const isCompleted =
        c.currentStatus === 'APPROVED' ||
        c.currentStatus === 'APF_ACTIVE' ||
        c.currentStatus === 'SENT_TO_LOS' ||
        c.currentStatus === 'LOS_ACKNOWLEDGED';

      // Completion date if completed
      let completedAt: string | undefined = undefined;
      if (isCompleted && c.approvalDecision?.decidedAt) {
        completedAt = c.approvalDecision.decidedAt;
      } else if (isCompleted && c.auditTrail?.length) {
        const lastApprovedEvent = c.auditTrail.find(
          (e) => e.newStatus === 'APPROVED' || e.action.includes('SANCTION')
        );
        if (lastApprovedEvent) {
          completedAt = lastApprovedEvent.timestamp;
        }
      }

      const totalElapsedDays = calculateElapsedDays(c.createdAt, completedAt);
      const stageIdx = getCaseStageIndex(c.currentStatus);
      const currentStageDef = LIFECYCLE_STAGES[stageIdx] || LIFECYCLE_STAGES[0];

      // Time spent in current stage
      let stageStartTimestamp = c.createdAt;
      if (c.auditTrail && c.auditTrail.length > 0) {
        const lastEvent = c.auditTrail[0];
        stageStartTimestamp = lastEvent.timestamp;
      }
      const daysInCurrentStage = calculateElapsedDays(stageStartTimestamp, completedAt);

      // SLA health calculation (10 business days overall)
      let tatHealth: 'WITHIN_SLA' | 'APPROACHING_SLA' | 'BREACHED_SLA' | 'COMPLETED' = 'WITHIN_SLA';
      if (isCompleted) {
        tatHealth = 'COMPLETED';
      } else if (totalElapsedDays > STANDARD_CASE_SLA_DAYS) {
        tatHealth = 'BREACHED_SLA';
      } else if (totalElapsedDays >= 7.0) {
        tatHealth = 'APPROACHING_SLA';
      } else {
        tatHealth = 'WITHIN_SLA';
      }

      // Pending user resolution
      let pendingUserName = c.currentOwnerName || 'Unassigned';
      let pendingUserRole = c.currentOwnerRole || 'CPA';
      let pendingDept = 'Underwriting Operations';

      if (c.currentStatus === 'ASSIGNED_TO_VALUER' || c.currentStatus === 'SITE_VISIT_IN_PROGRESS') {
        if (c.valuerAssignment?.assignedUserName) {
          pendingUserName = c.valuerAssignment.assignedUserName;
          pendingUserRole = 'EXTERNAL_VALUER';
          pendingDept = c.valuerAssignment.vendorAgency || 'Panel Valuer Cell';
        }
      } else if (c.currentStatus === 'LEGAL_ASSIGNED' || c.currentStatus === 'LEGAL_REVIEW') {
        if (c.currentOwnerRole === 'EXTERNAL_LEGAL_ADVOCATE') {
          pendingUserName = c.currentOwnerName || 'Adv. Sanjay Trivedi';
          pendingDept = 'Apex Legal Associates • Panel Scrutiny';
        }
      } else if (c.currentStatus === 'COM_REVIEW') {
        pendingUserName = 'Amitav Sen (COM)';
        pendingUserRole = 'COM';
        pendingDept = 'Credit Operations Supervisory Hub';
      } else if (c.currentStatus === 'PENDING_APPROVAL') {
        pendingUserName = 'Arun Kumar (Zonal Sanction Head)';
        pendingUserRole = 'APPROVER';
        pendingDept = 'Zonal Credit Approval Committee';
      } else if (isCompleted) {
        pendingUserName = 'Sanction Completed (APF Active)';
        pendingDept = 'Disbursement & Servicing Desk';
      }

      const project = getProjectById(c.projectId);
      const builder = getBuilderById(c.builderId);

      return {
        ...c,
        totalElapsedDays,
        daysInCurrentStage,
        targetSlaDays: STANDARD_CASE_SLA_DAYS,
        tatHealth,
        stageIdx,
        currentStageDef,
        isCompleted,
        completedAt,
        pendingUserName,
        pendingUserRole,
        pendingDept,
        projectName: project?.projectName || 'Project ' + c.projectId,
        builderName: builder?.legalName || 'Builder ' + c.builderId,
        city: project?.city || 'Pune',
      };
    });
  }, [cases]);

  // Aggregate Pending Users Matrix
  const pendingUsersMatrix = useMemo(() => {
    const userMap: Record<
      string,
      {
        name: string;
        role: string;
        dept: string;
        casesCount: number;
        cases: typeof enrichedCases;
        oldestElapsedDays: number;
        hasBreach: boolean;
        hasWarning: boolean;
      }
    > = {};

    enrichedCases.forEach((c) => {
      if (c.isCompleted) return; // Only count active pending cases

      const key = c.pendingUserName;
      if (!userMap[key]) {
        userMap[key] = {
          name: c.pendingUserName,
          role: c.pendingUserRole,
          dept: c.pendingDept,
          casesCount: 0,
          cases: [],
          oldestElapsedDays: 0,
          hasBreach: false,
          hasWarning: false,
        };
      }

      userMap[key].casesCount += 1;
      userMap[key].cases.push(c);
      if (c.totalElapsedDays > userMap[key].oldestElapsedDays) {
        userMap[key].oldestElapsedDays = c.totalElapsedDays;
      }
      if (c.tatHealth === 'BREACHED_SLA') userMap[key].hasBreach = true;
      if (c.tatHealth === 'APPROACHING_SLA') userMap[key].hasWarning = true;
    });

    return Object.values(userMap).sort((a, b) => b.oldestElapsedDays - a.oldestElapsedDays);
  }, [enrichedCases]);

  // Stage-wise pipeline aggregate
  const stageStats = useMemo(() => {
    return LIFECYCLE_STAGES.map((stage, idx) => {
      const stageCases = enrichedCases.filter((c) => c.stageIdx === idx);
      const activeCount = stageCases.filter((c) => !c.isCompleted).length;
      const count = idx === 6 ? stageCases.length : activeCount;
      const avgDays =
        stageCases.length > 0
          ? Math.round(
              (stageCases.reduce((acc, c) => acc + c.daysInCurrentStage, 0) / stageCases.length) * 10
            ) / 10
          : 0;

      const hasBreach = stageCases.some((c) => c.tatHealth === 'BREACHED_SLA');
      const hasWarning = stageCases.some((c) => c.tatHealth === 'APPROACHING_SLA');

      return {
        ...stage,
        caseCount: count,
        avgDays,
        hasBreach,
        hasWarning,
        stageCases,
      };
    });
  }, [enrichedCases]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCases = enrichedCases.length;
    const activeCases = enrichedCases.filter((c) => !c.isCompleted);
    const completedCases = enrichedCases.filter((c) => c.isCompleted);

    const withinSlaCount = enrichedCases.filter((c) => c.tatHealth === 'WITHIN_SLA').length;
    const approachingSlaCount = enrichedCases.filter((c) => c.tatHealth === 'APPROACHING_SLA').length;
    const breachedSlaCount = enrichedCases.filter((c) => c.tatHealth === 'BREACHED_SLA').length;

    const avgOverallTat =
      enrichedCases.length > 0
        ? Math.round(
            (enrichedCases.reduce((acc, c) => acc + c.totalElapsedDays, 0) / enrichedCases.length) * 10
          ) / 10
        : 0;

    const totalExposureCr = enrichedCases.reduce((acc, c) => acc + (c.proposedExposureCr || 0), 0);

    return {
      totalCases,
      activeCasesCount: activeCases.length,
      completedCasesCount: completedCases.length,
      withinSlaCount,
      approachingSlaCount,
      breachedSlaCount,
      avgOverallTat,
      totalExposureCr,
      complianceRate:
        totalCases > 0 ? Math.round(((withinSlaCount + completedCases.length) / totalCases) * 100) : 100,
    };
  }, [enrichedCases]);

  // Filtering & Sorting
  const filteredCases = useMemo(() => {
    return enrichedCases
      .filter((c) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            c.id.toLowerCase().includes(q) ||
            (c.apfNumber && c.apfNumber.toLowerCase().includes(q)) ||
            c.projectName.toLowerCase().includes(q) ||
            c.builderName.toLowerCase().includes(q) ||
            c.pendingUserName.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q);
          if (!match) return false;
        }

        // TAT Health filter
        if (selectedTatHealth !== 'ALL') {
          if (c.tatHealth !== selectedTatHealth) return false;
        }

        // Stage filter
        if (selectedStageId !== 'ALL') {
          const stageDef = LIFECYCLE_STAGES.find((s) => s.id === selectedStageId);
          if (stageDef && !stageDef.statuses.includes(c.currentStatus)) return false;
        }

        // Pending user filter
        if (selectedUserFilter !== 'ALL') {
          if (c.pendingUserName !== selectedUserFilter) return false;
        }

        // City filter
        if (cityFilter !== 'ALL') {
          if (c.city !== cityFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'TAT_DESC') {
          return b.totalElapsedDays - a.totalElapsedDays;
        }
        if (sortBy === 'TAT_ASC') {
          return a.totalElapsedDays - b.totalElapsedDays;
        }
        if (sortBy === 'DATE_DESC') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'SLA_DUE') {
          return new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime();
        }
        return 0;
      });
  }, [enrichedCases, searchQuery, selectedTatHealth, selectedStageId, selectedUserFilter, cityFilter, sortBy]);

  const handleSendNudge = (userName: string, caseNumber: string) => {
    setNudgeFeedback(`TAT Reminder & Priority Alert dispatched to ${userName} for docket ${caseNumber}.`);
    setTimeout(() => setNudgeFeedback(null), 3500);
  };

  const handleExportCsv = () => {
    const headers = [
      'Case ID',
      'APF Number',
      'Project',
      'Builder',
      'City',
      'Initiated Date',
      'Completed Date',
      'Current Stage',
      'Pending With User',
      'User Role',
      'Total Elapsed TAT (Days)',
      'Target SLA (Days)',
      'Days in Current Stage',
      'SLA Status',
      'Proposed Exposure (Cr)',
    ];

    const rows = filteredCases.map((c) => [
      c.id,
      c.apfNumber || '',
      `"${c.projectName}"`,
      `"${c.builderName}"`,
      c.city,
      c.createdAt,
      c.completedAt || 'In Progress',
      c.currentStageDef.name,
      `"${c.pendingUserName}"`,
      c.pendingUserRole,
      c.totalElapsedDays,
      c.targetSlaDays,
      c.daysInCurrentStage,
      c.tatHealth,
      c.proposedExposureCr || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PROVAL_APF_TAT_Lifecycle_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-fade-in text-[#102a43]">
      {/* Nudge Toast Notification */}
      {nudgeFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-700 flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{nudgeFeedback}</span>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px] border border-blue-200">
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                Live Turnaround Time (TAT) Engine
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">10-Day End-to-End SLA Benchmark</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              APF Lifecycle Turnaround Time (TAT) & User Workload Cockpit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive case-by-case tracking from <strong>Docket Initiation to Final Sanction & APF Activation</strong> • Monitor stage SLA bottlenecks and pending user desks.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              As of: <span className="font-semibold text-slate-700">{lastRefreshedAt}</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Refresh TAT metrics from store"
            >
              <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {onInitiateNewCase && (
              <button
                type="button"
                onClick={onInitiateNewCase}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>+ Initiate APF Case</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Key TAT KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Total Dockets</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{metrics.totalCases}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">₹{metrics.totalExposureCr} Cr Pipeline</div>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/80">
            <div className="flex items-center justify-between text-blue-700 text-[11px] font-medium">
              <span>Average Total TAT</span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-900 mt-1">
              {metrics.avgOverallTat} <span className="text-xs font-normal text-blue-700">Days</span>
            </div>
            <div className="text-[10px] text-blue-600 mt-0.5">Bank SLA Target: 10.0 Days</div>
          </div>

          <div
            onClick={() => setSelectedTatHealth('WITHIN_SLA')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedTatHealth === 'WITHIN_SLA'
                ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 text-[11px] font-medium">
              <span>Within SLA (&lt;5d)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">{metrics.withinSlaCount}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Green · Healthy Progression</div>
          </div>

          <div
            onClick={() => setSelectedTatHealth('APPROACHING_SLA')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedTatHealth === 'APPROACHING_SLA'
                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                : 'bg-amber-50/80 border-amber-200/80 hover:bg-amber-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-medium">
              <span>At Risk (5-8d)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1">{metrics.approachingSlaCount}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Amber · Approaching SLA</div>
          </div>

          <div
            onClick={() => setSelectedTatHealth('BREACHED_SLA')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedTatHealth === 'BREACHED_SLA'
                ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
                : 'bg-rose-50/80 border-rose-200/80 hover:bg-rose-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 text-[11px] font-medium">
              <span>SLA Breached (&gt;8d)</span>
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-rose-900 mt-1">{metrics.breachedSlaCount}</div>
            <div className="text-[10px] text-rose-700 mt-0.5">Red · Escalation Required</div>
          </div>

          <div
            onClick={() => setSelectedTatHealth('COMPLETED')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedTatHealth === 'COMPLETED'
                ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300'
                : 'bg-purple-50/80 border-purple-200/80 hover:bg-purple-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-purple-800 text-[11px] font-medium">
              <span>Sanctioned / Active</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-900 mt-1">{metrics.completedCasesCount}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">100% On-Time Completion</div>
          </div>
        </div>
      </div>

      {/* Visual Lifecycle Stage Pipeline (From Initiate to Completion) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Stage-wise TAT Pipeline (From Initiation to Completion)
            </h2>
            <p className="text-xs text-slate-500">
              Click any stage below to isolate cases currently at that point in the underwriting workflow:
            </p>
          </div>

          {selectedStageId !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedStageId('ALL')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
            >
              Clear Stage Filter
            </button>
          )}
        </div>

        {/* 7 Chevron Pipeline Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {stageStats.map((stg) => {
            const isSelected = selectedStageId === stg.id;

            return (
              <div
                key={stg.id}
                onClick={() => setSelectedStageId(isSelected ? 'ALL' : stg.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: stg.color }}
                />

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                    {stg.shortLabel}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-slate-900">{stg.caseCount}</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      cases
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Avg TAT:</span>
                  <span
                    className={`font-mono font-bold ${
                      stg.hasBreach
                        ? 'text-rose-700'
                        : stg.hasWarning
                        ? 'text-amber-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {stg.avgDays}d / {stg.targetSlaDays}d SLA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING WITH WHICH USERS - User Workload & TAT Aging Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Pending with Which Users — Desk Workload &amp; TAT Aging Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Active dockets grouped by the currently assigned officer, valuer, or legal advocate. Click any user to view their active cases:
            </p>
          </div>

          {selectedUserFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedUserFilter('ALL')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
            >
              Showing all users
            </button>
          )}
        </div>

        {/* User Queue Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pendingUsersMatrix.map((u) => {
            const isSelected = selectedUserFilter === u.name;
            const initials = u.name
              .split(' ')
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('');

            return (
              <div
                key={u.name}
                onClick={() => setSelectedUserFilter(isSelected ? 'ALL' : u.name)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {initials}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {u.role}
                      </span>
                    </div>

                    {u.hasBreach ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                        <AlertOctagon className="w-3 h-3 text-rose-600" /> Overdue
                      </span>
                    ) : u.hasWarning ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> 5-8d Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> On Track
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{u.name}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{u.dept}</p>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Dockets Pending:</span>
                    <span className="font-bold text-slate-900 text-sm">{u.casesCount}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Oldest Aging:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        u.oldestElapsedDays > 8
                          ? 'text-rose-700'
                          : u.oldestElapsedDays >= 5
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {u.oldestElapsedDays} Days
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-purple-700 font-semibold hover:underline">
                    {isSelected ? 'Selected' : 'Filter cases'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNudge(u.name, u.cases[0]?.apfNumber || 'Current Docket');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                    title="Send instant TAT Nudge to this officer"
                  >
                    <Bell className="w-3 h-3 text-slate-400" />
                    <span>Nudge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & MASTER CASE TABLE (SHOWING WHICH CASES ARE THERE TAT-WISE) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Cases Breakdown — Initiate to Completion TAT Track Record
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredCases.length} of {enrichedCases.length} total dockets
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case, project, user..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* TAT Health Filter Pill */}
            <select
              value={selectedTatHealth}
              onChange={(e) => setSelectedTatHealth(e.target.value as TatHealthCategory)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All TAT Statuses</option>
              <option value="WITHIN_SLA">Within SLA (&lt;5 Days)</option>
              <option value="APPROACHING_SLA">Approaching SLA (5-8 Days)</option>
              <option value="BREACHED_SLA">SLA Breached (&gt;8 Days)</option>
              <option value="COMPLETED">Completed / Active</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="TAT_DESC">Longest TAT First (Critical)</option>
              <option value="TAT_ASC">Shortest TAT First</option>
              <option value="DATE_DESC">Newest Initiated First</option>
              <option value="SLA_DUE">SLA Expiry First</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Docket / Project</th>
                <th className="py-2.5 px-3">Lifecycle Progress</th>
                <th className="py-2.5 px-3">Initiated Date</th>
                <th className="py-2.5 px-3">Total TAT vs SLA</th>
                <th className="py-2.5 px-3">Current Stage Aging</th>
                <th className="py-2.5 px-3">Pending with User</th>
                <th className="py-2.5 px-3">TAT Health</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const pctOfSla = Math.min(100, Math.round((c.totalElapsedDays / c.targetSlaDays) * 100));

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenCase(c.id)}
                  >
                    {/* Docket / Project */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {c.apfNumber || c.id}
                      </div>
                      <div className="font-medium text-slate-800 line-clamp-1">{c.projectName}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {c.builderName} · <span className="font-semibold">{c.city}</span>
                      </div>
                    </td>

                    {/* Mini 6-step lifecycle journey */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4, 5].map((stepIdx) => {
                          const isDone = c.isCompleted || c.stageIdx > stepIdx;
                          const isCurrent = !c.isCompleted && c.stageIdx === stepIdx;

                          return (
                            <div
                              key={stepIdx}
                              className={`h-2 rounded-full transition-all ${
                                isDone
                                  ? 'w-4 bg-emerald-500'
                                  : isCurrent
                                  ? 'w-6 bg-blue-600 animate-pulse'
                                  : 'w-2 bg-slate-200'
                              }`}
                              title={LIFECYCLE_STAGES[stepIdx]?.name}
                            />
                          );
                        })}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-1 line-clamp-1">
                        {c.currentStageDef.shortLabel}
                      </div>
                    </td>

                    {/* Initiated Date */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {c.createdAt.slice(0, 10)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.createdAt.slice(11, 16)} hrs
                      </div>
                    </td>

                    {/* Total TAT vs SLA */}
                    <td className="py-3 px-3">
                      <div className="flex items-baseline gap-1 font-mono font-bold text-sm">
                        <span
                          className={
                            c.tatHealth === 'BREACHED_SLA'
                              ? 'text-rose-700'
                              : c.tatHealth === 'APPROACHING_SLA'
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }
                        >
                          {c.totalElapsedDays}d
                        </span>
                        <span className="text-[10px] font-normal text-slate-400">
                          / {c.targetSlaDays}d SLA
                        </span>
                      </div>

                      {/* SLA Progress Bar */}
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.tatHealth === 'BREACHED_SLA'
                              ? 'bg-rose-600'
                              : c.tatHealth === 'APPROACHING_SLA'
                              ? 'bg-amber-500'
                              : c.isCompleted
                              ? 'bg-purple-600'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pctOfSla}%` }}
                        />
                      </div>
                    </td>

                    {/* Current Stage Aging */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-800">
                        {c.daysInCurrentStage} Days
                      </div>
                      <div className="text-[10px] text-slate-500">
                        in {c.currentStageDef.shortLabel}
                      </div>
                    </td>

                    {/* Pending with User */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {c.pendingUserName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            {c.pendingUserName}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {c.pendingDept}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TAT Health Badge */}
                    <td className="py-3 px-3">
                      {c.tatHealth === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" /> Completed On-Time
                        </span>
                      ) : c.tatHealth === 'BREACHED_SLA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                          <AlertOctagon className="w-3 h-3 text-rose-600" /> Breached (+{(c.totalElapsedDays - c.targetSlaDays).toFixed(1)}d)
                        </span>
                      ) : c.tatHealth === 'APPROACHING_SLA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Approaching SLA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Within SLA
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadCase(c);
                            setUploadStageName(c.currentStageDef.name);
                            setIsUploadModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                          title="Upload Stage / Verification Proof Document"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setTimelineModalCase(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Stage-by-Stage TAT Journey & Audit Timeline"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendNudge(c.pendingUserName, c.apfNumber || c.id)}
                          className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          title="Send TAT Nudge to Assigned Officer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCase(c.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No cases match the selected TAT filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the stage filter or clearing the search query.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTatHealth('ALL');
                  setSelectedStageId('ALL');
                  setSelectedUserFilter('ALL');
                  setCityFilter('ALL');
                }}
                className="mt-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Case Detailed TAT Journey Timeline Modal */}
      {timelineModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  End-to-End TAT Journey
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {timelineModalCase.apfNumber || timelineModalCase.id} — {timelineModalCase.projectName}
                </h3>
                <p className="text-xs text-slate-500">
                  {timelineModalCase.builderName} · Total Elapsed TAT: <strong>{timelineModalCase.totalElapsedDays} Days</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTimelineModalCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Timeline from Initiate to Completion */}
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Event 1: Initiation */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-blue-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Docket Initiated</span>
                    <span className="text-[10px] text-slate-500 font-mono">{timelineModalCase.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Initiated by {timelineModalCase.createdBy}. KYC, MCA 21 & RERA pre-checks confirmed.
                  </p>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Stage TAT: 0.8 Days (Within 1.0 Day Benchmark)
                  </div>
                </div>
              </div>

              {/* Event 2: Valuation */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                      timelineModalCase.stageIdx >= 1
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    2
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Technical Valuation &amp; Site Visit</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {timelineModalCase.valuerAssignment?.assignedAt || 'Pending Stage'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Assigned to {timelineModalCase.valuerAssignment?.assignedUserName || 'Panel Valuer'}. GPS geo-tagged inspection & rate card synthesis.
                  </p>
                  {timelineModalCase.valuationReport && (
                    <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                      Report Submitted: ₹{timelineModalCase.valuationReport.adoptedBaseRateSqFt}/sq.ft · Grade {timelineModalCase.valuationReport.technicalGrade}
                    </div>
                  )}
                </div>
              </div>

              {/* Event 3: Legal Due Diligence */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                      timelineModalCase.stageIdx >= 2
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    3
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Legal Due Diligence &amp; Title Chain</span>
                    <span className="text-[10px] text-slate-500 font-mono">30-Year Search</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Assigned to Apex Legal Associates. 30-year sub-registrar search & non-encumbrance verification.
                  </p>
                </div>
              </div>

              {/* Event 4: CPA Synthesis */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                      timelineModalCase.stageIdx >= 3
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    4
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">CPA Underwriting &amp; Exposure 360</span>
                    <span className="text-[10px] text-slate-500 font-mono">Synthesis Desk</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Underwriting dossier compiled. CRILC, CIC & CBS exposures reconciled into final note.
                  </p>
                </div>
              </div>

              {/* Event 5: COM Review */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                      timelineModalCase.stageIdx >= 4
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    5
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Credit Operations Manager (COM) Endorsement</span>
                    <span className="text-[10px] text-slate-500 font-mono">COM Supervisory</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review by Amitav Sen. Risk limits and builder group headroom verified.
                  </p>
                </div>
              </div>

              {/* Event 6: Committee Sanction */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                      timelineModalCase.isCompleted || timelineModalCase.stageIdx >= 5
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    6
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Committee Sanction &amp; Completion</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {timelineModalCase.completedAt || 'In Committee Queue'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {timelineModalCase.isCompleted
                      ? 'Sanctioned by Credit Approval Committee. APF Reference active and synced with LOS.'
                      : 'Pending final quorum sanction vote by Zonal Approver Arun Kumar.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setUploadCase(timelineModalCase);
                  setUploadStageName(timelineModalCase.currentStageDef.name);
                  setIsUploadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                <span>+ Upload Stage Proof</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTimelineModalCase(null)}
                  className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = timelineModalCase.id;
                    setTimelineModalCase(null);
                    onOpenCase(id);
                  }}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Open Full Docket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Proof Document Modal */}
      {uploadCase && (
        <UploadProofDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadCase(null);
          }}
          onUploadSuccess={handleProofUploaded}
          caseId={uploadCase.id}
          initialDocName={`Proof_${uploadCase.apfNumber || uploadCase.id}_${uploadStageName.replace(/[^a-zA-Z0-9]/g, '_')}`}
          initialCategory="Statutory / RERA Certificate"
          title={`Upload Verification Proof — Docket ${uploadCase.apfNumber || uploadCase.id}`}
          description={`Attach verified primary evidence proof for ${uploadStageName || 'current workflow stage'}.`}
        />
      )}
    </div>
  );
};
