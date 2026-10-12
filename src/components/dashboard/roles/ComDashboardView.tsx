import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
import { queryStore } from '../../../services/queryStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_TOWER_MASTER,
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../../data/centralMasterData';
import { RoleDashboardShell } from '../common/RoleDashboardShell';
import { DashboardHeader, DateRangeOption } from '../common/DashboardHeader';
import { DashboardFilterBar, DashboardFilterState } from '../common/DashboardFilterBar';
import { PriorityActionStrip, PriorityActionItem } from '../common/PriorityActionStrip';
import { KpiCard, TrendKpiCard, RiskKpiCard } from '../common/KpiCard';
import {
  ChartCard,
  LineTrendChart,
  BarChart,
  DonutChart,
  HeatmapGrid,
} from '../common/InteractiveCharts';
import { ActionQueue, ActionQueueItem } from '../common/ActionQueue';
import { ExceptionPanel, ExceptionItem } from '../common/ExceptionPanel';
import { RecentActivity, ActivityEvent } from '../common/RecentActivity';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  Send,
  HelpCircle,
} from 'lucide-react';

interface ComDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
  onToggleExecutiveMode?: () => void;
}

export const ComDashboardView: React.FC<ComDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToModule,
  onToggleExecutiveMode,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const [filters, setFilters] = useState<DashboardFilterState>({
    searchQuery: '',
    city: 'ALL',
    riskBand: 'ALL',
    stageFilter: 'ALL',
  });

  const cases = apfStore.getAllCases();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    if (filters.city !== 'ALL' && proj?.city !== filters.city) return false;
    if (filters.stageFilter !== 'ALL' && c.currentStatus !== filters.stageFilter) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        (proj?.projectName && proj.projectName.toLowerCase().includes(q)) ||
        (bld?.legalName && bld.legalName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calculate Metrics
  const pendingComReviewCount = filteredCases.filter(
    (c) => c.currentStatus === 'COM_REVIEW' || c.currentStatus === 'VALUATION_SUBMITTED'
  ).length;
  const readyForApprovalCount = filteredCases.filter(
    (c) => c.currentStatus === 'PENDING_APPROVAL' || c.currentStatus === 'COM_REVIEW'
  ).length;
  const highRiskCasesCount = 2; // e.g. cases with exposure > 80% or open litigation
  const exposureExceptionsCount = 1; // Group exposure headroom tight
  const legalExceptionsCount = 2; // Consortium NOC condition
  const conditionalClearCount = 3;
  const slaBreachesCount = 0; // COM queue 100% within SLA
  const returnedCasesCount = 1; // returned to CPA for verification

  // Priority Attention Items
  const priorityItems: PriorityActionItem[] = [
    {
      id: 'COM-P1',
      type: 'APPROVAL_PENDING',
      title: `${pendingComReviewCount} Dossiers Awaiting COM Endorsement`,
      description: 'CPA has synthesized technical & legal packs. Forward to Credit Committee with COM remarks.',
      severity: 'info',
      count: pendingComReviewCount,
      actionLabel: 'Open COM Review Desk',
      onAction: () => onNavigateToModule('COM_REVIEW'),
    },
    {
      id: 'COM-P2',
      type: 'EXPOSURE_MISMATCH',
      title: 'Godrej Properties Group Limit Near Ceiling',
      description: 'Current exposure ₹68.5 Cr / ₹80 Cr (85.6%). Requires Zonal Head sign-off on APF-2026-0001.',
      severity: 'warning',
      count: 1,
      actionLabel: 'Review Exposure Headroom',
      onAction: () => onNavigateToModule('EXPOSURE'),
    },
    {
      id: 'COM-P3',
      type: 'LEGAL_BLOCKING',
      title: 'Consortium NOC Mandatory Condition',
      description: 'Mandatory Pre-Disbursement condition must be stamped onto Approval Docket.',
      severity: 'danger',
      count: 1,
      actionLabel: 'Conditions Register',
      onAction: () => onNavigateToModule('CONDITIONS_REGISTER'),
    },
  ];

  // Charts
  const riskBandDonut = [
    { label: 'Low Risk (Tier 1)', value: 5, color: '#15803D', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Medium Risk (Tier 2)', value: 3, color: '#0EA5E9', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'High Risk (Watchlist)', value: 2, color: '#D97706', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Critical Review', value: 1, color: '#C62828', onClick: () => onNavigateToModule('COM_REVIEW') },
  ];

  const cpaRecommendationMix = [
    { label: 'Standard Approval', value: 6, color: '#15803D', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Conditional Sanction', value: 3, color: '#0EA5E9', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Restricted LTV (70%)', value: 2, color: '#D97706', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Return for Rework', value: 1, color: '#C62828', onClick: () => onNavigateToModule('COM_REVIEW') },
  ];

  const topBuilderExposureData = [
    { label: 'Godrej Properties', value: 68.5, sublabel: 'Limit ₹80 Cr · Headroom ₹11.5 Cr', color: '#D97706', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Rohan Builders', value: 42.1, sublabel: 'Limit ₹65 Cr · Headroom ₹22.9 Cr', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Kolte-Patil Dev.', value: 38.4, sublabel: 'Limit ₹60 Cr · Headroom ₹21.6 Cr', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Pride Purple Group', value: 24.2, sublabel: 'Limit ₹45 Cr · Headroom ₹20.8 Cr', color: '#15803D', onClick: () => onNavigateToModule('EXPOSURE') },
  ];

  // Action Queue for COM
  const actionQueueItems: ActionQueueItem[] = filteredCases.slice(0, 5).map((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const twr = c.selectedTowerIds[0] ? getTowerById(c.selectedTowerIds[0]) : undefined;

    return {
      id: c.id,
      title: proj?.projectName || 'Project Docket',
      subtitle: `${bld?.legalName || 'Builder'} • ${twr?.towerName || 'Towers'}`,
      stageLabel: c.currentStatus === 'COM_REVIEW' ? 'Pending COM Sign-off' : c.currentStatus.replace(/_/g, ' '),
      stageColor: c.currentStatus === 'COM_REVIEW' ? 'bg-purple-100 text-purple-900 border border-purple-200' : undefined,
      slaDaysRemaining: 3,
      slaStatus: 'CLEAN',
      keyMetric: `Grade: A · Rate: ₹7,450/sq.ft`,
      priority: c.priority,
      actionLabel: 'COM Endorsement',
      onAction: () => onNavigateToModule('COM_REVIEW', c.id),
    };
  });

  const exceptions: ExceptionItem[] = [
    {
      id: 'EX-C1',
      category: 'EXPOSURE',
      title: 'Unreconciled ROC Charge Entry (₹12.0 Cr)',
      entityName: 'Pride World City',
      severity: 'HIGH',
      description: 'Lender charge satisfied on Ministry portal but satisfaction certificate not attached to title docket.',
      sourceModule: 'Exposure 360',
      actionLabel: 'Reconcile',
      onResolve: () => onNavigateToModule('EXPOSURE'),
    },
    {
      id: 'EX-C2',
      category: 'LEGAL',
      title: 'Title Condition: Pre-Disbursement CA Form-3',
      entityName: 'Rohan Viti',
      severity: 'MEDIUM',
      description: 'Mandatory escrow tracking condition added by Internal Legal advocate.',
      sourceModule: 'Legal Due Diligence',
      actionLabel: 'Review Condition',
      onResolve: () => onNavigateToModule('CONDITIONS_REGISTER'),
    },
  ];

  const activityEvents: ActivityEvent[] = [
    {
      id: 'ACT-C1',
      actor: 'Rajesh Nair',
      actorRole: 'CPA',
      action: 'completed underwriting synthesis for',
      target: 'APF-2026-0001',
      timestamp: '25 mins ago',
      type: 'report',
    },
    {
      id: 'ACT-C2',
      actor: 'K. S. Verma',
      actorRole: 'Legal Head',
      action: 'approved title clearance report for',
      target: 'APF-2026-0002',
      timestamp: '1 hour ago',
      type: 'approval',
    },
  ];

  return (
    <RoleDashboardShell>
      {/* 1. Header */}
      <DashboardHeader
        title="COM Portfolio Review"
        subtitle="Credit Operations Supervisory Desk • Risk Bands, Exposure Caps & Committee Endorsements"
        currentUser={currentUser}
        selectedDateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
        onToggleExecutiveMode={onToggleExecutiveMode}
      />

      {/* 2. Priority Action Strip */}
      <PriorityActionStrip items={priorityItems} />

      {/* 3. Filters */}
      <DashboardFilterBar
        filters={filters}
        onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onReset={() =>
          setFilters({
            searchQuery: '',
            city: 'ALL',
            riskBand: 'ALL',
            stageFilter: 'ALL',
          })
        }
        stages={[
          { id: 'COM_REVIEW', label: 'COM Review' },
          { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
          { id: 'APPROVED', label: 'Approved' },
          { id: 'SENT_TO_LOS', label: 'Dispatched to LOS' },
        ]}
      />

      {/* 4. KPI Cards Grid (8 High-Value KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Pending COM Review"
          value={pendingComReviewCount}
          contextNote="Awaiting supervisory check"
          trend={{ value: '2 dockets prioritized', direction: 'neutral' }}
          drillDownLabel="Open review desk"
          onDrillDown={() => onNavigateToModule('COM_REVIEW')}
          icon={<ShieldCheck className="w-4 h-4 text-purple-600" />}
          riskSeverity={pendingComReviewCount > 0 ? 'medium' : 'none'}
        />
        <KpiCard
          label="Ready for Approval"
          value={readyForApprovalCount}
          contextNote="Ready for Approver Cockpit"
          trend={{ value: 'Ready for sanction', direction: 'up', isPositive: true }}
          drillDownLabel="Approver cockpit"
          onDrillDown={() => onNavigateToModule('APPROVAL_COCKPIT')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <RiskKpiCard
          label="High Risk Cases"
          value={highRiskCasesCount}
          contextNote="Tight headroom / watch"
          trend={{ value: '2 watchlist builders', direction: 'neutral' }}
          drillDownLabel="Risk filter"
          onDrillDown={() => onNavigateToModule('COM_REVIEW')}
          riskSeverity="high"
        />
        <RiskKpiCard
          label="Exposure Exceptions"
          value={exposureExceptionsCount}
          contextNote="Group limits > 80%"
          trend={{ value: 'Godrej Group limit', direction: 'neutral' }}
          drillDownLabel="Exposure 360"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          riskSeverity="medium"
        />
        <KpiCard
          label="Legal Exceptions"
          value={legalExceptionsCount}
          contextNote="Title search conditions"
          trend={{ value: 'All with mitigation', direction: 'neutral' }}
          drillDownLabel="Conditions register"
          onDrillDown={() => onNavigateToModule('CONDITIONS_REGISTER')}
          icon={<Scale className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Conditional Clear"
          value={conditionalClearCount}
          contextNote="Pre/Post disb covenants"
          trend={{ value: 'Tracked in register', direction: 'neutral' }}
          drillDownLabel="View conditions"
          onDrillDown={() => onNavigateToModule('CONDITIONS_REGISTER')}
          icon={<FileCheck2 className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="SLA Breaches"
          value={slaBreachesCount}
          contextNote="0 Breaches across COM"
          trend={{ value: '100% TAT Compliance', direction: 'up', isPositive: true }}
          drillDownLabel="SLA report"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Returned Cases"
          value={returnedCasesCount}
          contextNote="Sent back to CPA"
          trend={{ value: 'Rectification in progress', direction: 'neutral' }}
          drillDownLabel="CPA queue"
          onDrillDown={() => onNavigateToModule('CPA_REVIEW')}
          icon={<HelpCircle className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* 5. Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut: Cases by Risk Band */}
        <ChartCard
          title="Cases by Risk Rating Band"
          subtitle="Portfolio categorization by underwriting score"
          actionLabel="Filter by risk"
          onActionClick={() => onNavigateToModule('COM_REVIEW')}
        >
          <DonutChart
            data={riskBandDonut}
            centerLabel="Cases"
            centerValue={11}
          />
        </ChartCard>

        {/* Donut: CPA Recommendation Mix */}
        <ChartCard
          title="CPA Recommendation Mix"
          subtitle="Proposed sanction structures submitted to COM"
          actionLabel="View dossier mix"
          onActionClick={() => onNavigateToModule('COM_REVIEW')}
        >
          <DonutChart
            data={cpaRecommendationMix}
            centerLabel="Dockets"
            centerValue={12}
          />
        </ChartCard>

        {/* Top Builder Exposure */}
        <ChartCard
          title="Top Builder Group Exposure (₹ Cr)"
          subtitle="Direct loans & APF limits vs Bank Headroom"
          actionLabel="Exposure 360"
          onActionClick={() => onNavigateToModule('EXPOSURE')}
        >
          <BarChart
            data={topBuilderExposureData}
            layout="horizontal"
            valuePrefix="₹"
            valueSuffix=" Cr"
          />
        </ChartCard>
      </div>

      {/* 6. Action Queue & Risk Exception Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActionQueue
            title="COM Review Queue — Credit Operations Oversight"
            subtitle="Dockets ready for final supervisory sign-off & committee recommendation"
            items={actionQueueItems}
            onViewAll={() => onNavigateToModule('COM_REVIEW')}
          />
        </div>

        <div className="space-y-4">
          <ExceptionPanel exceptions={exceptions} />
          <RecentActivity events={activityEvents} />
        </div>
      </div>
    </RoleDashboardShell>
  );
};
