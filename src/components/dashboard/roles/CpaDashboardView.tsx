import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
import { queryStore } from '../../../services/queryStore';
import { legalStore } from '../../../services/legalStore';
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
  FunnelChart,
  HeatmapGrid,
} from '../common/InteractiveCharts';
import { ActionQueue, ActionQueueItem } from '../common/ActionQueue';
import { ExceptionPanel, ExceptionItem } from '../common/ExceptionPanel';
import { RecentActivity, ActivityEvent } from '../common/RecentActivity';
import {
  FileText,
  Clock,
  Scale,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Inbox,
} from 'lucide-react';

interface CpaDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onInitiateNewCase: () => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
  onNavigateToQueries?: (tab?: any) => void;
  onToggleExecutiveMode?: () => void;
}

export const CpaDashboardView: React.FC<CpaDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onInitiateNewCase,
  onNavigateToModule,
  onNavigateToQueries,
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
  const allQueries = queryStore.getAllQueries();

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
  const activeCasesCount = filteredCases.length;
  const pendingMyActionCount = filteredCases.filter(
    (c) => c.currentOwnerRole === 'CPA'
  ).length;
  const technicalPendingCount = filteredCases.filter(
    (c) =>
      c.currentStatus === 'ASSIGNED_TO_VALUER' ||
      c.currentStatus === 'VALUER_ACCEPTED' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS'
  ).length;
  const legalPendingCount = legalStore.getAssignments().filter(
    (a) => a.status === 'LEGAL_ASSIGNED' || a.status === 'LEGAL_REVIEW_IN_PROGRESS'
  ).length;
  const exposureReviewPending = filteredCases.filter(
    (c) => c.currentStatus === 'VALUATION_SUBMITTED'
  ).length;
  const blockingQueriesCount = allQueries.filter((q) => q.isBlocking && q.status !== 'CLOSED' && q.status !== 'CANCELLED').length;
  const readyForComCount = filteredCases.filter(
    (c) => c.currentStatus === 'VALUATION_SUBMITTED' || c.currentStatus === 'COM_REVIEW'
  ).length;
  const slaBreachesCount = filteredCases.filter((c) => {
    const dueDate = new Date(c.slaDueDate).getTime();
    return dueDate < Date.now() && c.currentStatus !== 'APPROVED' && c.currentStatus !== 'APF_ACTIVE';
  }).length;

  // Priority Attention Items
  const priorityItems: PriorityActionItem[] = [];

  if (blockingQueriesCount > 0) {
    priorityItems.push({
      id: 'P-QRY',
      type: 'BLOCKING_QUERY',
      title: `${blockingQueriesCount} Blocking Queries Pending`,
      description: 'Underwriting halted until external advocate / valuer input is received.',
      severity: 'warning',
      count: blockingQueriesCount,
      actionLabel: 'Resolve in Query Tray',
      onAction: () => onNavigateToModule('QUERY_TRAY'),
    });
  }

  if (slaBreachesCount > 0) {
    priorityItems.push({
      id: 'P-SLA',
      type: 'SLA_BREACH',
      title: `${slaBreachesCount} Cases Breaching TAT SLA`,
      description: 'Turnaround time exceeded bank mandate for Tier-1 Project clearance.',
      severity: 'danger',
      count: slaBreachesCount,
      actionLabel: 'View Breached Cases',
      onAction: () => onNavigateToModule('MY_CASES'),
    });
  }

  if (readyForComCount > 0) {
    priorityItems.push({
      id: 'P-COM',
      type: 'APPROVAL_PENDING',
      title: `${readyForComCount} Cases Ready for CPA Dossier Submission`,
      description: 'Valuation & Legal clearance complete. Synthesize CPA pack for COM review.',
      severity: 'info',
      count: readyForComCount,
      actionLabel: 'Open CPA Review Desk',
      onAction: () => onNavigateToModule('CPA_REVIEW'),
    });
  }

  // Funnel Data: APF Lifecycle
  const funnelStages = [
    { stage: '1. Initiated', count: activeCasesCount, conversionPct: 100, color: '#1667C1', onClick: () => onNavigateToModule('MY_CASES') },
    { stage: '2. Valuation & Legal', count: activeCasesCount - 1, conversionPct: 92, color: '#0EA5E9', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { stage: '3. CPA Synthesis', count: pendingMyActionCount + 2, conversionPct: 80, color: '#0284C7', onClick: () => onNavigateToModule('CPA_REVIEW') },
    { stage: '4. COM Endorsement', count: readyForComCount, conversionPct: 65, color: '#6366F1', onClick: () => onNavigateToModule('COM_REVIEW') },
    { stage: '5. Committee Sanction', count: filteredCases.filter((c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'APF_ACTIVE').length, conversionPct: 52, color: '#15803D', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
  ];

  // Stage Distribution Donut
  const stageDonutData = [
    { label: 'Underwriting', value: technicalPendingCount + legalPendingCount, color: '#0EA5E9', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'CPA Review', value: Math.max(pendingMyActionCount, 1), color: '#1667C1', onClick: () => onNavigateToModule('CPA_REVIEW') },
    { label: 'COM Review', value: Math.max(readyForComCount, 1), color: '#6366F1', onClick: () => onNavigateToModule('COM_REVIEW') },
    { label: 'Sanctioned / Active', value: 3, color: '#15803D', onClick: () => onNavigateToModule('MY_CASES') },
    { label: 'Rework / Query', value: Math.max(blockingQueriesCount, 1), color: '#D97706', onClick: () => onNavigateToModule('QUERY_TRAY') },
  ];

  // TAT Trend Data
  const tatTrendData = [
    { label: 'W1', value: 4.8, secondaryValue: 5.0 },
    { label: 'W2', value: 4.2, secondaryValue: 5.0 },
    { label: 'W3', value: 3.6, secondaryValue: 5.0 },
    { label: 'W4', value: 3.1, secondaryValue: 5.0 },
    { label: 'W5', value: 2.8, secondaryValue: 5.0 },
  ];

  // Builder Exposure Watch Bar
  const builderExposureData = [
    { label: 'Godrej', value: 68.5, sublabel: 'Limit ₹80 Cr (85.6%)', color: '#D97706', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Rohan', value: 42.1, sublabel: 'Limit ₹65 Cr (64.7%)', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Kolte-P', value: 38.4, sublabel: 'Limit ₹60 Cr (64.0%)', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Pride', value: 24.2, sublabel: 'Limit ₹45 Cr (53.7%)', color: '#15803D', onClick: () => onNavigateToModule('EXPOSURE') },
    { label: 'Kumar', value: 18.0, sublabel: 'Limit ₹40 Cr (45.0%)', color: '#15803D', onClick: () => onNavigateToModule('EXPOSURE') },
  ];

  // Action Queue Items for CPA
  const actionQueueItems: ActionQueueItem[] = filteredCases.slice(0, 5).map((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const twr = c.selectedTowerIds[0] ? getTowerById(c.selectedTowerIds[0]) : undefined;
    const isDue = new Date(c.slaDueDate).getTime() < Date.now();

    return {
      id: c.id,
      title: proj?.projectName || 'Project Docket',
      subtitle: `${bld?.legalName || 'Builder'} • ${twr?.towerName || 'Towers'}`,
      stageLabel: c.currentStatus.replace(/_/g, ' '),
      slaDaysRemaining: isDue ? -1 : 2,
      slaStatus: isDue ? 'BREACHED' : 'CLEAN',
      keyMetric: `Rate: ₹7,450/sq.ft`,
      priority: c.priority,
      actionLabel: c.currentOwnerRole === 'CPA' ? 'Review & Submit' : 'Inspect',
      onAction: () => {
        if (c.currentOwnerRole === 'CPA' || c.currentStatus === 'VALUATION_SUBMITTED') {
          onNavigateToModule('CPA_REVIEW', c.id);
        } else {
          onOpenCase(c.id);
        }
      },
    };
  });

  // Exceptions
  const exceptions: ExceptionItem[] = [
    {
      id: 'EX-01',
      category: 'LEGAL',
      title: 'Missing Consortium NOC from State Bank',
      entityName: 'Pride World City (Twr E)',
      severity: 'CRITICAL',
      description: 'Lender consortium mortgage charge reflected in ROC index-II without formal no-dues release.',
      sourceModule: 'Legal Due Diligence',
      actionLabel: 'Open Legal Pack',
      onResolve: () => onNavigateToModule('LEGAL_DD'),
    },
    {
      id: 'EX-02',
      category: 'TECHNICAL',
      title: 'RCC Plinth Variance > 5%',
      entityName: 'Rohan Viti (Twr B)',
      severity: 'HIGH',
      description: 'Valuer pinned location noted slab progress divergence vs MahaRERA QPR submission.',
      sourceModule: 'Technical Valuation',
      actionLabel: 'Inspect Site Visit',
      onResolve: () => onNavigateToModule('VALUATION_MODULE'),
    },
    {
      id: 'EX-03',
      category: 'EXPOSURE',
      title: 'Group Headroom Below 15%',
      entityName: 'Godrej Properties Group',
      severity: 'HIGH',
      description: 'Proposed retail sourcing ₹18.5 Cr reduces residual corporate limit headroom to ₹11.5 Cr.',
      sourceModule: 'Exposure 360',
      actionLabel: 'Check Headroom',
      onResolve: () => onNavigateToModule('EXPOSURE'),
    },
  ];

  // Recent Activity
  const activityEvents: ActivityEvent[] = [
    {
      id: 'ACT-01',
      actor: 'M. K. Kulkarni',
      actorRole: 'Valuer',
      action: 'uploaded signed valuation report for',
      target: 'APF-2026-0001',
      timestamp: '12 mins ago',
      type: 'report',
    },
    {
      id: 'ACT-02',
      actor: 'Adv. S. Deshmukh',
      actorRole: 'Legal',
      action: 'raised title search clarification query on',
      target: 'APF-2026-0002',
      timestamp: '45 mins ago',
      type: 'query',
    },
    {
      id: 'ACT-03',
      actor: 'Amit Sharma',
      actorRole: 'COM',
      action: 'endorsed and passed to Credit Committee',
      target: 'APF-2026-0003',
      timestamp: '2 hours ago',
      type: 'approval',
    },
  ];

  return (
    <RoleDashboardShell>
      {/* 1. Header */}
      <DashboardHeader
        title="CPA Command Center"
        subtitle="End-to-End Underwriting Throughput, Quality SLAs & Docket Routing"
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
          { id: 'INITIATED', label: 'Initiated' },
          { id: 'ASSIGNED_TO_VALUER', label: 'Valuer Queue' },
          { id: 'VALUATION_SUBMITTED', label: 'Valuation Submitted' },
          { id: 'COM_REVIEW', label: 'COM Review' },
          { id: 'APPROVED', label: 'Approved' },
        ]}
      />

      {/* 4. KPI Cards Grid (8 High-Value KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active APF Cases"
          value={activeCasesCount}
          contextNote="Under active appraisal"
          trend={{ value: '↑ 2 this week', direction: 'up', isPositive: true }}
          drillDownLabel="View cases"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          icon={<FileText className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Pending My Action"
          value={pendingMyActionCount}
          contextNote="Requires CPA review"
          trend={{ value: '3 dockets waiting', direction: 'neutral' }}
          drillDownLabel="Open review desk"
          onDrillDown={() => onNavigateToModule('CPA_REVIEW')}
          icon={<Inbox className="w-4 h-4 text-sky-600" />}
          riskSeverity={pendingMyActionCount > 0 ? 'medium' : 'none'}
        />
        <KpiCard
          label="Technical Pending"
          value={technicalPendingCount}
          contextNote="Valuer inspections"
          trend={{ value: 'Avg TAT 2.8d', direction: 'down', isPositive: true }}
          drillDownLabel="Technical desk"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Legal Pending"
          value={legalPendingCount}
          contextNote="Title searches"
          trend={{ value: '1 Title search gap', direction: 'neutral' }}
          drillDownLabel="Legal module"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          icon={<Scale className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Exposure Review"
          value={exposureReviewPending}
          contextNote="Headroom & multi-lender"
          trend={{ value: 'Group limits verified', direction: 'neutral' }}
          drillDownLabel="Exposure 360"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
        />
        <RiskKpiCard
          label="Blocking Queries"
          value={blockingQueriesCount}
          contextNote="Halts approval"
          trend={{ value: 'Needs urgent reply', direction: 'up', isPositive: false }}
          drillDownLabel="Query inbox"
          onDrillDown={() => onNavigateToModule('QUERY_TRAY')}
          riskSeverity={blockingQueriesCount > 0 ? 'critical' : 'none'}
        />
        <KpiCard
          label="Ready for COM"
          value={readyForComCount}
          contextNote="Pack ready for sign-off"
          trend={{ value: '↑ 2 ready today', direction: 'up', isPositive: true }}
          drillDownLabel="COM queue"
          onDrillDown={() => onNavigateToModule('COM_REVIEW')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <RiskKpiCard
          label="SLA Breaches"
          value={slaBreachesCount}
          contextNote="TAT > 5 bank days"
          trend={{ value: slaBreachesCount > 0 ? 'Requires escalation' : '100% On Time', direction: slaBreachesCount > 0 ? 'up' : 'down', isPositive: slaBreachesCount === 0 }}
          drillDownLabel="SLA monitor"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          riskSeverity={slaBreachesCount > 0 ? 'critical' : 'none'}
        />
      </div>

      {/* 5. Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Chart: APF Pipeline */}
        <ChartCard
          title="APF Pipeline Funnel"
          subtitle="Conversion velocity across appraisal milestones"
          actionLabel="View all stages"
          onActionClick={() => onNavigateToModule('MY_CASES')}
        >
          <FunnelChart stages={funnelStages} />
        </ChartCard>

        {/* Donut Chart: Stage Distribution */}
        <ChartCard
          title="Case Stage Distribution"
          subtitle="Active dockets categorized by workflow owner"
          actionLabel="Open breakdown"
          onActionClick={() => onNavigateToModule('MY_CASES')}
        >
          <DonutChart
            data={stageDonutData}
            centerLabel="Cases"
            centerValue={activeCasesCount}
          />
        </ChartCard>

        {/* Line Chart: TAT Trend */}
        <ChartCard
          title="Underwriting TAT Trend (Days)"
          subtitle="Actual turnaround time vs 5-day bank SLA"
          actionLabel="SLA metrics"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <LineTrendChart
            data={tatTrendData}
            primaryLabel="Actual TAT"
            secondaryLabel="SLA Target"
            valueSuffix="d"
            lineColor="#1667C1"
            secondaryLineColor="#94A3B8"
          />
        </ChartCard>
      </div>

      {/* 6. Secondary Analytics Row: Builder Exposure Watch & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Top Builder Exposure Watch"
          subtitle="Direct outstanding vs Sanctioned Group Limit (₹ Cr)"
          actionLabel="Exposure 360"
          onActionClick={() => onNavigateToModule('EXPOSURE')}
        >
          <BarChart
            data={builderExposureData}
            layout="horizontal"
            valuePrefix="₹"
            valueSuffix=" Cr"
          />
        </ChartCard>

        <ChartCard
          title="SLA Risk & Ageing Matrix"
          subtitle="Dockets categorized by age and risk rating"
          actionLabel="Triage ageing"
          onActionClick={() => onNavigateToModule('MY_CASES')}
        >
          <HeatmapGrid
            rows={['Tier 1 Builders', 'Tier 2 Builders', 'Affordable Segment']}
            cols={['< 2 Days', '2–4 Days', '5+ Days (Breach)']}
            cells={[
              { row: 'Tier 1 Builders', col: '< 2 Days', value: 4, status: 'clean' },
              { row: 'Tier 1 Builders', col: '2–4 Days', value: 2, status: 'watch' },
              { row: 'Tier 1 Builders', col: '5+ Days (Breach)', value: 0, status: 'clean' },
              { row: 'Tier 2 Builders', col: '< 2 Days', value: 2, status: 'clean' },
              { row: 'Tier 2 Builders', col: '2–4 Days', value: 3, status: 'watch' },
              { row: 'Tier 2 Builders', col: '5+ Days (Breach)', value: 1, status: 'breached' },
              { row: 'Affordable Segment', col: '< 2 Days', value: 1, status: 'clean' },
              { row: 'Affordable Segment', col: '2–4 Days', value: 1, status: 'watch' },
              { row: 'Affordable Segment', col: '5+ Days (Breach)', value: 0, status: 'clean' },
            ]}
            onCellClick={() => onNavigateToModule('MY_CASES')}
          />
        </ChartCard>
      </div>

      {/* 7. Action Queue & Risk Exception Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Action Queue */}
        <div className="lg:col-span-2">
          <ActionQueue
            title="My Action Queue — CPA Underwriting Desk"
            subtitle="Prioritized dockets awaiting checklist verification & synthesis"
            items={actionQueueItems}
            onViewAll={() => onNavigateToModule('MY_CASES')}
          />
        </div>

        {/* Right Col: Exceptions & Recent Stream */}
        <div className="space-y-4">
          <ExceptionPanel exceptions={exceptions} />
          <RecentActivity events={activityEvents} />
        </div>
      </div>
    </RoleDashboardShell>
  );
};
