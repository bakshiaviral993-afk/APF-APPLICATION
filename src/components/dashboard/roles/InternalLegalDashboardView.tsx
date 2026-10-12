import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { legalStore } from '../../../services/legalStore';
import { apfStore } from '../../../services/apfStore';
import { getBuilderById, getProjectById } from '../../../data/centralMasterData';
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
import { ExceptionPanel, ExceptionItem } from '../common/ExceptionPanel';
import {
  Scale,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck2,
  FileX,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface InternalLegalDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
}

export const InternalLegalDashboardView: React.FC<InternalLegalDashboardViewProps> = ({
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

  const assignments = legalStore.getAssignments();
  const reports = legalStore.getAllReports();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const newAssignmentsCount = assignments.filter((a) => a.status === 'LEGAL_ASSIGNED').length;
  const inReviewCount = assignments.filter((a) => a.status === 'LEGAL_REVIEW_IN_PROGRESS').length;
  const documentGapsCount = 3;
  const blockingExceptionsCount = 1;
  const conditionalClearCount = 2;
  const reworkCount = 0;
  const submittedCount = assignments.filter((a) => a.status === 'LEGAL_SUBMITTED' || a.status === 'LEGAL_ACCEPTED_BY_BANK').length;
  const slaBreachesCount = 0;

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'LEG-P1',
      type: 'LEGAL_BLOCKING',
      title: 'Consortium Mortgage Charge in ROC Index-II',
      description: 'Satisfaction deed registration copy required before retail mortgage docket release.',
      severity: 'danger',
      count: 1,
      actionLabel: 'Open Legal DD Module',
      onAction: () => onNavigateToModule('LEGAL_DD'),
    },
    {
      id: 'LEG-P2',
      type: 'BLOCKING_QUERY',
      title: 'Title Flow Deed Gap (1998–2004)',
      description: 'Missing link document between original agricultural holder and developer entity.',
      severity: 'warning',
      count: 1,
      actionLabel: 'Inspect Title Chain',
      onAction: () => onNavigateToModule('LEGAL_DD'),
    },
  ];

  const opinionMix = [
    { label: 'Clear & Marketable (Category A)', value: 6, color: '#15803D', onClick: () => onNavigateToModule('LEGAL_DD') },
    { label: 'Conditional Clear (Category B)', value: 3, color: '#0EA5E9', onClick: () => onNavigateToModule('LEGAL_DD') },
    { label: 'Rework / Deficient (Category C)', value: 1, color: '#D97706', onClick: () => onNavigateToModule('LEGAL_DD') },
  ];

  const deficiencyCategories = [
    { label: 'Prior Mortgage Release Deed', value: 4, color: '#D97706' },
    { label: 'Commencement Certificate Rev', value: 3, color: '#1667C1' },
    { label: 'Environmental Clearance NOC', value: 2, color: '#0EA5E9' },
    { label: 'Original Land Revenue 7/12', value: 2, color: '#15803D' },
  ];

  const queueItems: ActionQueueItem[] = assignments.slice(0, 4).map((a) => {
    const apfCase = apfStore.getCaseById(a.caseId);
    const proj = apfCase ? getProjectById(apfCase.projectId) : undefined;
    const bld = apfCase ? getBuilderById(apfCase.builderId) : undefined;
    return {
      id: a.caseId,
      title: proj?.projectName || 'Project Title Scrutiny',
      subtitle: `${bld?.legalName || 'Builder'} • ${a.assignedUserName}`,
      stageLabel: a.status.replace(/_/g, ' '),
      slaDaysRemaining: 2,
      slaStatus: 'CLEAN',
      keyMetric: a.legalRoute || '30-Yr Search Complete',
      actionLabel: 'Review Title',
      onAction: () => onNavigateToModule('LEGAL_DD', a.caseId),
    };
  });

  const exceptions: ExceptionItem[] = [
    {
      id: 'LEX-1',
      category: 'LEGAL',
      title: 'Pending Bank Consortium Release NOC',
      entityName: 'Pride World City',
      severity: 'CRITICAL',
      description: 'Lender consortium mortgage charge reflected in ROC index-II.',
      sourceModule: 'Legal Due Diligence',
      actionLabel: 'Resolve in Legal',
      onResolve: () => onNavigateToModule('LEGAL_DD'),
    },
  ];

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Legal Due Diligence Intelligence"
        subtitle="30-Year Title Search, Encumbrance Certificates, Litigation Triage & Title Clearance Reports"
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
          { id: 'LEGAL_ASSIGNED', label: 'Assigned' },
          { id: 'LEGAL_REVIEW_IN_PROGRESS', label: 'In Review' },
          { id: 'LEGAL_APPROVED', label: 'Approved' },
        ]}
      />

      {/* 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="New Assignments"
          value={newAssignmentsCount}
          contextNote="Awaiting review"
          trend={{ value: 'Advocate firms linked', direction: 'neutral' }}
          drillDownLabel="View assignments"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          icon={<Scale className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="In Review"
          value={inReviewCount}
          contextNote="Active title diligence"
          trend={{ value: 'Title chains mapped', direction: 'neutral' }}
          drillDownLabel="Reviewing cases"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          icon={<Search className="w-4 h-4 text-sky-600" />}
        />
        <RiskKpiCard
          label="Document Gaps"
          value={documentGapsCount}
          contextNote="Deficiency notices"
          trend={{ value: 'Builder notice sent', direction: 'neutral' }}
          drillDownLabel="Document gaps"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          riskSeverity="medium"
        />
        <RiskKpiCard
          label="Blocking Exceptions"
          value={blockingExceptionsCount}
          contextNote="Halts APF sanction"
          trend={{ value: 'Lender consortium charge', direction: 'neutral' }}
          drillDownLabel="Exceptions"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          riskSeverity="critical"
        />
        <KpiCard
          label="Conditional Clear"
          value={conditionalClearCount}
          contextNote="Pre-Disbursement covenants"
          trend={{ value: 'Tracked in register', direction: 'neutral' }}
          drillDownLabel="Conditions"
          onDrillDown={() => onNavigateToModule('CONDITIONS_REGISTER')}
          icon={<FileCheck2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Rework"
          value={reworkCount}
          contextNote="Reports sent back"
          trend={{ value: 'Zero rework items', direction: 'neutral', isPositive: true }}
          drillDownLabel="Rework queue"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          icon={<FileX className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Submitted"
          value={submittedCount}
          contextNote="Final title opinions"
          trend={{ value: '↑ 4 this month', direction: 'up', isPositive: true }}
          drillDownLabel="Approved opinions"
          onDrillDown={() => onNavigateToModule('LEGAL_DD')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="SLA Breaches"
          value={slaBreachesCount}
          contextNote="0 Breaches"
          trend={{ value: '100% on time', direction: 'up', isPositive: true }}
          drillDownLabel="SLA report"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Legal Opinion Distribution"
          subtitle="Clear vs Conditional vs Rework opinions"
          actionLabel="Legal records"
          onActionClick={() => onNavigateToModule('LEGAL_DD')}
        >
          <DonutChart
            data={opinionMix}
            centerLabel="Dossiers"
            centerValue={10}
          />
        </ChartCard>

        <ChartCard
          title="Top Document Deficiency Categories"
          subtitle="Frequency of missing title & clearance documents"
          actionLabel="View deficiencies"
          onActionClick={() => onNavigateToModule('LEGAL_DD')}
        >
          <BarChart
            data={deficiencyCategories}
            layout="horizontal"
          />
        </ChartCard>
      </div>

      {/* Queue & Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActionQueue
            title="Active Legal Diligence Queue"
            subtitle="Dockets undergoing advocate scrutiny & title report generation"
            items={queueItems}
            onViewAll={() => onNavigateToModule('LEGAL_DD')}
          />
        </div>
        <div>
          <ExceptionPanel exceptions={exceptions} />
        </div>
      </div>
    </RoleDashboardShell>
  );
};
