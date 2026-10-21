import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
import {
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
} from '../common/InteractiveCharts';
import { ActionQueue, ActionQueueItem } from '../common/ActionQueue';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Camera,
  RotateCcw,
  HelpCircle,
  FileText,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface InternalValuerDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
}

export const InternalValuerDashboardView: React.FC<InternalValuerDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToModule,
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

  const valuerCases = cases.filter((c) => {
    return (
      c.currentStatus.includes('VALUER') ||
      c.currentStatus === 'INITIATED' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
      c.currentStatus === 'VALUATION_SUBMITTED' ||
      c.currentStatus === 'VALUATION_REWORK'
    );
  });

  // Calculate Metrics
  const newAssignmentsCount = valuerCases.filter((c) => c.currentStatus === 'ASSIGNED_TO_VALUER' || c.currentStatus === 'INITIATED').length;
  const siteVisitsDueCount = valuerCases.filter((c) => c.currentStatus === 'VALUER_ACCEPTED' || c.currentStatus === 'SITE_VISIT_IN_PROGRESS').length;
  const visitsTodayCount = 1;
  const draftReportsCount = 2;
  const reworkCount = valuerCases.filter((c) => c.currentStatus === 'VALUATION_REWORK').length;
  const needInputCount = 1;
  const submittedCount = valuerCases.filter((c) => c.currentStatus === 'VALUATION_SUBMITTED').length;
  const slaBreachesCount = 0;

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'VAL-P1',
      type: 'APPROVAL_PENDING',
      title: 'Site Visit Geofenced Geo-Pin Due Today',
      description: 'Physical inspection for Pride World City (Tower E). Geofence validation required on site.',
      severity: 'info',
      count: 1,
      actionLabel: 'Open 12-Step Inspection',
      onAction: () => onNavigateToModule('VALUATION_MODULE'),
    },
    {
      id: 'VAL-P-PHOTO',
      type: 'APPROVAL_PENDING',
      title: 'Site Visit Photo Documentation Required',
      description: 'Upload on-site physical inspection evidence with timestamped forensic stamps for assigned projects.',
      severity: 'info',
      count: siteVisitsDueCount,
      actionLabel: 'Open Valuations',
      onAction: () => onNavigateToModule('VALUATION_MODULE'),
    },
  ];

  // Charts
  const gradeDistribution = [
    { label: 'Grade A+ (90-100%)', value: 5, color: '#15803D', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'Grade A (80-89%)', value: 4, color: '#0EA5E9', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'Grade B+ (70-79%)', value: 2, color: '#D97706', onClick: () => onNavigateToModule('VALUATION_MODULE') },
  ];

  const stageDistribution = [
    { label: 'Plinth Complete', value: 2, color: '#94A3B8', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'RCC Structure 50%', value: 4, color: '#1667C1', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'Finishing & MEP', value: 3, color: '#0EA5E9', onClick: () => onNavigateToModule('VALUATION_MODULE') },
    { label: 'Ready for OC', value: 2, color: '#15803D', onClick: () => onNavigateToModule('VALUATION_MODULE') },
  ];

  const tatTrend = [
    { label: 'Week 1', value: 3.2, secondaryValue: 3.5 },
    { label: 'Week 2', value: 2.9, secondaryValue: 3.5 },
    { label: 'Week 3', value: 2.6, secondaryValue: 3.5 },
    { label: 'Week 4', value: 2.3, secondaryValue: 3.5 },
  ];

  const queueItems: ActionQueueItem[] = valuerCases.slice(0, 4).map((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const twr = c.selectedTowerIds[0] ? getTowerById(c.selectedTowerIds[0]) : undefined;

    return {
      id: c.id,
      title: proj?.projectName || 'Project Inspection',
      subtitle: `${bld?.legalName || 'Builder'} • ${twr?.towerName || 'Towers'}`,
      stageLabel: c.currentStatus.replace(/_/g, ' '),
      slaDaysRemaining: 2,
      slaStatus: 'CLEAN',
      keyMetric: `Slab Progress: 62.5%`,
      actionLabel: 'Inspect',
      onAction: () => onNavigateToModule('VALUATION_MODULE', c.id),
    };
  });

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Technical Valuation Workbench"
        subtitle="Civil Engineering Inspections, Slab Casting Verifications & Valuation Certificates"
        currentUser={currentUser}
        selectedDateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
      />

      <PriorityActionStrip items={priorityItems} />

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
          { id: 'ASSIGNED_TO_VALUER', label: 'Assigned' },
          { id: 'SITE_VISIT_IN_PROGRESS', label: 'Site Visit' },
          { id: 'VALUATION_SUBMITTED', label: 'Submitted' },
        ]}
      />

      {/* 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="New Assignments"
          value={newAssignmentsCount}
          contextNote="Awaiting acceptance"
          trend={{ value: 'Assigned by CPA', direction: 'neutral' }}
          drillDownLabel="Open assignments"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Site Visits Due"
          value={siteVisitsDueCount}
          contextNote="Field audits scheduled"
          trend={{ value: 'Geofenced GPS tracking', direction: 'neutral' }}
          drillDownLabel="Visit schedule"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<MapPin className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Visits Today"
          value={visitsTodayCount}
          contextNote="Today's inspection agenda"
          trend={{ value: 'Survey No. 34 Bavdhan', direction: 'neutral' }}
          drillDownLabel="Today's itinerary"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<Calendar className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Draft Reports"
          value={draftReportsCount}
          contextNote="Form 3 CA & rate analysis"
          trend={{ value: 'In drafting stage', direction: 'neutral' }}
          drillDownLabel="Draft reports"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<FileText className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Rework Required"
          value={reworkCount}
          contextNote="Clarification requested"
          trend={{ value: reworkCount === 0 ? 'Clean reports' : 'Needs revision', direction: 'neutral', isPositive: reworkCount === 0 }}
          drillDownLabel="Rework queue"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<RotateCcw className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          label="Need Input"
          value={needInputCount}
          contextNote="Builder architectural query"
          trend={{ value: 'Pending sanction drawings', direction: 'neutral' }}
          drillDownLabel="Query thread"
          onDrillDown={() => onNavigateToModule('QUERY_TRAY')}
          icon={<HelpCircle className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Submitted"
          value={submittedCount}
          contextNote="Dossiers with CPA/COM"
          trend={{ value: '↑ 3 this week', direction: 'up', isPositive: true }}
          drillDownLabel="Submitted certs"
          onDrillDown={() => onNavigateToModule('VALUATION_MODULE')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="SLA Breaches"
          value={slaBreachesCount}
          contextNote="0 Breaches (100% on-time)"
          trend={{ value: 'Avg TAT 2.3 Days', direction: 'up', isPositive: true }}
          drillDownLabel="SLA report"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Technical Grade Distribution"
          subtitle="Civil quality and adherence scoring"
          actionLabel="View scores"
          onActionClick={() => onNavigateToModule('VALUATION_MODULE')}
        >
          <DonutChart
            data={gradeDistribution}
            centerLabel="Reports"
            centerValue={11}
          />
        </ChartCard>

        <ChartCard
          title="Construction Stage Breakdown"
          subtitle="Physical progress stages across projects"
          actionLabel="Stages breakdown"
          onActionClick={() => onNavigateToModule('VALUATION_MODULE')}
        >
          <BarChart
            data={stageDistribution}
            layout="horizontal"
          />
        </ChartCard>

        <ChartCard
          title="Valuation TAT Trend (Days)"
          subtitle="Average turnaround time vs 3.5d benchmark"
          actionLabel="TAT details"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <LineTrendChart
            data={tatTrend}
            primaryLabel="Actual TAT"
            secondaryLabel="Benchmark"
            valueSuffix="d"
            lineColor="#1667C1"
            secondaryLineColor="#94A3B8"
          />
        </ChartCard>
      </div>

      {/* Upcoming Site Visits Queue */}
      <ActionQueue
        title="Upcoming Site Visits & Technical Inspections"
        subtitle="Mandatory physical inspections with geofencing validation"
        items={queueItems}
        onViewAll={() => onNavigateToModule('VALUATION_MODULE')}
      />
    </RoleDashboardShell>
  );
};
