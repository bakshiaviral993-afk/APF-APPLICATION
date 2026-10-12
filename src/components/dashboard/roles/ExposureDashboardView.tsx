import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
} from '../../../data/centralMasterData';
import { masterStore } from '../../../services/masterStore';
import { RoleDashboardShell } from '../common/RoleDashboardShell';
import { DashboardHeader, DateRangeOption } from '../common/DashboardHeader';
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
  ShieldAlert,
  Building2,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Scale,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

interface ExposureDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, builderId?: string) => void;
}

export const ExposureDashboardView: React.FC<ExposureDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToModule,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'EXP-P1',
      type: 'EXPOSURE_MISMATCH',
      title: 'Godrej Properties Group Limit Ceiling (85.6%)',
      description: 'Total Direct + Retail Linked exposure ₹68.5 Cr against approved group limit ₹80 Cr.',
      severity: 'warning',
      count: 1,
      actionLabel: 'Open Exposure 360',
      onAction: () => onNavigateToModule('EXPOSURE', 'BLD-PUN-001'),
    },
    {
      id: 'EXP-P2',
      type: 'LEGAL_BLOCKING',
      title: 'Unmatched ROC Charge vs Consortium Lender (₹12 Cr)',
      description: 'MahaRERA escrow declaration reflects SBI charge not reconciled with Ministry filings.',
      severity: 'danger',
      count: 1,
      actionLabel: 'Reconcile Charges',
      onAction: () => onNavigateToModule('EXPOSURE'),
    },
  ];

  const topBuildersData = [
    { label: 'Godrej Properties', value: 68.5, sublabel: 'Limit ₹80 Cr (85.6%)', color: '#D97706', onClick: () => onNavigateToModule('EXPOSURE', 'BLD-PUN-001') },
    { label: 'Rohan Builders', value: 42.1, sublabel: 'Limit ₹65 Cr (64.7%)', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE', 'BLD-PUN-002') },
    { label: 'Kolte-Patil Dev.', value: 38.4, sublabel: 'Limit ₹60 Cr (64.0%)', color: '#1667C1', onClick: () => onNavigateToModule('EXPOSURE', 'BLD-PUN-003') },
    { label: 'Pride Purple Group', value: 24.2, sublabel: 'Limit ₹45 Cr (53.7%)', color: '#15803D', onClick: () => onNavigateToModule('EXPOSURE', 'BLD-PUN-004') },
  ];

  const lenderExposureDonut = [
    { label: 'Proval Bank Direct', value: 92.5, color: '#1667C1' },
    { label: 'State Bank Consortium', value: 48.0, color: '#0EA5E9' },
    { label: 'HDFC Bank Ltd', value: 32.5, color: '#6366F1' },
    { label: 'ICICI Bank Ltd', value: 18.2, color: '#15803D' },
  ];

  const builderQueueItems: ActionQueueItem[] = masterStore.getBuilders().slice(0, 6).map((b) => ({
    id: b.id,
    title: b.legalName,
    subtitle: `${b.groupName} • ${b.city}`,
    stageLabel: `Risk Grade: ${b.internalRiskGrade || 'AA'}`,
    stageColor: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    slaDaysRemaining: 0,
    slaStatus: 'CLEAN',
    keyMetric: `Exposure: ₹${(b.totalExposureCr || 42).toFixed(1)} Cr`,
    actionLabel: 'Exposure 360',
    onAction: () => onNavigateToModule('EXPOSURE', b.id),
  }));

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Builder Exposure Intelligence"
        subtitle="Multi-Source External Debt Consolidation, Consortium Reconciliation & Group Limits"
        currentUser={currentUser}
        selectedDateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
      />

      <PriorityActionStrip items={priorityItems} />

      {/* 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Direct Outstanding"
          value={173.2}
          prefix="₹"
          suffix=" Cr"
          contextNote="Proval Bank book"
          trend={{ value: '4 Active builder facilities', direction: 'neutral' }}
          drillDownLabel="View direct"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<Building2 className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Project Finance"
          value={98.5}
          prefix="₹"
          suffix=" Cr"
          contextNote="Construction loans"
          trend={{ value: 'All standard assets', direction: 'neutral' }}
          drillDownLabel="CF facilities"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<DollarSign className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Group Exposure"
          value={191.2}
          prefix="₹"
          suffix=" Cr"
          contextNote="Consolidated corporate"
          trend={{ value: 'Headroom ₹58.8 Cr', direction: 'neutral' }}
          drillDownLabel="Group limits"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<ShieldAlert className="w-4 h-4 text-purple-600" />}
        />
        <KpiCard
          label="Retail Linked"
          value={74.7}
          prefix="₹"
          suffix=" Cr"
          contextNote="Retail home loans"
          trend={{ value: '1,420 Retail buyers', direction: 'up', isPositive: true }}
          drillDownLabel="Retail linkages"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Proposed APF"
          value={48.5}
          prefix="₹"
          suffix=" Cr"
          contextNote="Under appraisal"
          trend={{ value: '3 Dockets pending', direction: 'neutral' }}
          drillDownLabel="Appraisal queue"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Post-Approval"
          value={239.7}
          prefix="₹"
          suffix=" Cr"
          contextNote="Simulated peak load"
          trend={{ value: 'Within Board threshold', direction: 'neutral' }}
          drillDownLabel="Stress test"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<ShieldAlert className="w-4 h-4 text-slate-400" />}
        />
        <RiskKpiCard
          label="Unreconciled"
          value={12.0}
          prefix="₹"
          suffix=" Cr"
          contextNote="ROC satisfaction gap"
          trend={{ value: '1 charge pending release', direction: 'neutral' }}
          drillDownLabel="Reconcile"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          riskSeverity="high"
        />
        <KpiCard
          label="High Risk Builders"
          value={0}
          contextNote="NPA / SMA indicators: 0"
          trend={{ value: '100% Clean Portfolios', direction: 'up', isPositive: true }}
          drillDownLabel="Risk grades"
          onDrillDown={() => onNavigateToModule('BUILDER_MASTER')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Top Builders by Exposure & Utilization"
          subtitle="Direct outstanding vs Sanctioned limit (₹ Cr)"
          actionLabel="Exposure 360"
          onActionClick={() => onNavigateToModule('EXPOSURE')}
        >
          <BarChart
            data={topBuildersData}
            layout="horizontal"
            valuePrefix="₹"
            valueSuffix=" Cr"
          />
        </ChartCard>

        <ChartCard
          title="Lender Consortium Exposure Distribution"
          subtitle="Multi-lender loan commitments on APF projects"
          actionLabel="Lender breakup"
          onActionClick={() => onNavigateToModule('EXPOSURE')}
        >
          <DonutChart
            data={lenderExposureDonut}
            centerLabel="Total Cr"
            centerValue="₹191.2 Cr"
          />
        </ChartCard>
      </div>

      {/* Action Queue */}
      <ActionQueue
        title="Builder Entities Portfolio Desk"
        subtitle="Click any builder to inspect live multi-source debt reconciliation 360"
        items={builderQueueItems}
        onViewAll={() => onNavigateToModule('BUILDER_MASTER')}
      />
    </RoleDashboardShell>
  );
};
