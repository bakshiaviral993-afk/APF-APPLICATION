import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
import { masterStore } from '../../../services/masterStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
} from '../../../data/centralMasterData';
import { RoleDashboardShell } from '../common/RoleDashboardShell';
import { DashboardHeader, DateRangeOption } from '../common/DashboardHeader';
import { KpiCard, TrendKpiCard, RiskKpiCard } from '../common/KpiCard';
import {
  ChartCard,
  LineTrendChart,
  BarChart,
  DonutChart,
} from '../common/InteractiveCharts';
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
  onExitExecutiveMode?: () => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToModule,
  onExitExecutiveMode,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const cases = apfStore.getAllCases();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const activeProjectsCount = masterStore.getProjects().length;
  const activeBuildersCount = masterStore.getBuilders().length;

  const portfolioTrend = [
    { label: 'Q1 25', value: 120, secondaryValue: 100 },
    { label: 'Q2 25', value: 145, secondaryValue: 125 },
    { label: 'Q3 25', value: 168, secondaryValue: 150 },
    { label: 'Q4 25', value: 185, secondaryValue: 170 },
    { label: 'Q1 26', value: 215, secondaryValue: 195 },
  ];

  const cityDistribution = [
    { label: 'Pune Metro (East)', value: 88.5, color: '#1667C1' },
    { label: 'Pune Metro (West)', value: 65.2, color: '#0EA5E9' },
    { label: 'Mumbai MMR', value: 48.0, color: '#6366F1' },
    { label: 'PCMC Industrial Corridor', value: 37.5, color: '#15803D' },
  ];

  const riskDistribution = [
    { label: 'Low Risk (Tier 1)', value: 8, color: '#15803D' },
    { label: 'Moderate Risk (Tier 2)', value: 3, color: '#0EA5E9' },
    { label: 'Watchlist / Tight Cap', value: 1, color: '#D97706' },
  ];

  return (
    <RoleDashboardShell>
      <div className="bg-purple-950 text-white p-3 rounded-xl border border-purple-800 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Award className="w-4 h-4 text-purple-400" />
          <span className="font-bold">Executive Board View (Read-Only)</span>
          <span className="text-purple-300">· Comprehensive APF Portfolio Intelligence & Risk Concentration</span>
        </div>
        {onExitExecutiveMode && (
          <button
            type="button"
            onClick={onExitExecutiveMode}
            className="text-[11px] font-bold text-purple-200 hover:text-white bg-purple-900/80 hover:bg-purple-900 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Exit Executive View
          </button>
        )}
      </div>

      <DashboardHeader
        title="APF Portfolio Intelligence"
        subtitle="Executive Management Briefing • Sourcing Capacity, Asset Quality & Concentration Risk"
        currentUser={currentUser}
        selectedDateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
      />

      {/* 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active APF Portfolio"
          value={239.2}
          prefix="₹"
          suffix=" Cr"
          contextNote="Retail sourcing limits"
          trend={{ value: '↑ 14.8% YoY growth', direction: 'up', isPositive: true }}
          drillDownLabel="Portfolio MIS"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Approved Projects"
          value={activeProjectsCount}
          contextNote="MahaRERA certified"
          trend={{ value: 'Across 6 clusters', direction: 'neutral' }}
          drillDownLabel="Projects master"
          onDrillDown={() => onNavigateToModule('PROJECT_MASTER')}
          icon={<Layers className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Active Builders"
          value={activeBuildersCount}
          contextNote="Corporate relationships"
          trend={{ value: 'Tier 1 & Tier 2 entities', direction: 'neutral' }}
          drillDownLabel="Builders master"
          onDrillDown={() => onNavigateToModule('BUILDER_MASTER')}
          icon={<Building2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Group Exposure"
          value={191.2}
          prefix="₹"
          suffix=" Cr"
          contextNote="Consolidated corporate"
          trend={{ value: 'Headroom: ₹58.8 Cr', direction: 'neutral' }}
          drillDownLabel="Exposure 360"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<ShieldAlert className="w-4 h-4 text-purple-600" />}
        />
        <KpiCard
          label="Retail Linked"
          value={74.7}
          prefix="₹"
          suffix=" Cr"
          contextNote="Disbursed mortgage loans"
          trend={{ value: '1,420 retail accounts', direction: 'up', isPositive: true }}
          drillDownLabel="Mortgage linkage"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        />
        <RiskKpiCard
          label="High-Risk APFs"
          value={1}
          contextNote="Strict monitoring"
          trend={{ value: 'Zero NPA linkages', direction: 'neutral', isPositive: true }}
          drillDownLabel="Risk radar"
          onDrillDown={() => onNavigateToModule('EXPOSURE')}
          riskSeverity="medium"
        />
        <KpiCard
          label="Approval TAT"
          value={2.8}
          suffix=" Days"
          contextNote="Average across milestones"
          trend={{ value: '↓ 12% faster vs Q4', direction: 'down', isPositive: true }}
          drillDownLabel="TAT analytics"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<Clock className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="APFs Expiring Soon"
          value={1}
          contextNote="Renewal within 60 days"
          trend={{ value: 'Annual renewal triggered', direction: 'neutral' }}
          drillDownLabel="Expiry forecast"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="APF Portfolio Volume Growth (₹ Cr)"
          subtitle="Quarterly retail disbursement potential sanctioned"
          actionLabel="View history"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <LineTrendChart
            data={portfolioTrend}
            primaryLabel="Sanctioned APF Limit"
            secondaryLabel="Disbursement Target"
            valuePrefix="₹"
            valueSuffix=" Cr"
            lineColor="#1667C1"
            secondaryLineColor="#15803D"
          />
        </ChartCard>

        <ChartCard
          title="Geographical APF Concentration"
          subtitle="Regional distribution of sanctioned retail limit"
          actionLabel="Cluster breakdown"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <BarChart
            data={cityDistribution}
            layout="horizontal"
            valuePrefix="₹"
            valueSuffix=" Cr"
          />
        </ChartCard>

        <ChartCard
          title="Portfolio Risk Scorecard"
          subtitle="Approved schemes by internal bank underwriting risk rating"
          actionLabel="Risk report"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <DonutChart
            data={riskDistribution}
            centerLabel="Schemes"
            centerValue={12}
          />
        </ChartCard>
      </div>
    </RoleDashboardShell>
  );
};
