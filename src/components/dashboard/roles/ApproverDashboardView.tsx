import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { apfStore } from '../../../services/apfStore';
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
} from '../common/InteractiveCharts';
import { ActionQueue, ActionQueueItem } from '../common/ActionQueue';
import { ExceptionPanel, ExceptionItem } from '../common/ExceptionPanel';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  Building2,
  ArrowUpRight,
  Send,
  ShieldCheck,
  Award,
  Layers,
  XCircle,
} from 'lucide-react';

interface ApproverDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
  onToggleExecutiveMode?: () => void;
}

export const ApproverDashboardView: React.FC<ApproverDashboardViewProps> = ({
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
  const awaitingDecisionCount = filteredCases.filter(
    (c) => c.currentStatus === 'COM_REVIEW' || c.currentStatus === 'PENDING_APPROVAL'
  ).length;
  const approvedTotalCount = filteredCases.filter(
    (c) => c.currentStatus === 'APPROVED' || c.currentStatus === 'CONDITIONAL_APPROVAL' || c.currentStatus === 'APF_ACTIVE'
  ).length;
  const losPendingCount = filteredCases.filter(
    (c) => c.currentStatus === 'APPROVED'
  ).length;
  const highRiskCasesCount = 1;
  const conditionalApprovalsCount = 2;
  const deferredCount = 1;
  const rejectedCount = 0;

  // Priority Attention Items
  const priorityItems: PriorityActionItem[] = [
    {
      id: 'APP-P1',
      type: 'APPROVAL_PENDING',
      title: `${awaitingDecisionCount} Dockets Ready for Sanction Vote`,
      description: 'COM and CPA recommendations complete with clean valuation grade and clear 30-year title.',
      severity: 'info',
      count: awaitingDecisionCount,
      actionLabel: 'Open Approval Cockpit',
      onAction: () => onNavigateToModule('APPROVAL_COCKPIT'),
    },
    {
      id: 'APP-P2',
      type: 'LOS_FAILURE',
      title: `${losPendingCount} Sanctioned Cases Pending LOS STP Dispatch`,
      description: 'Approved dockets awaiting one-click transmission to core CBS / FinnOne mortgage gateway.',
      severity: 'warning',
      count: losPendingCount,
      actionLabel: 'Dispatch in LOS Engine',
      onAction: () => onNavigateToModule('LOS_INTEGRATIONS'),
    },
  ];

  // Charts
  const approvalOutcomeTrend = [
    { label: 'Oct 01', value: 3, secondaryValue: 0 },
    { label: 'Oct 02', value: 5, secondaryValue: 1 },
    { label: 'Oct 03', value: 4, secondaryValue: 0 },
    { label: 'Oct 04', value: 6, secondaryValue: 1 },
    { label: 'Oct 05', value: 7, secondaryValue: 0 },
  ];

  const riskBandDistribution = [
    { label: 'Tier 1 Prime (A+)', value: 6, color: '#15803D', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
    { label: 'Tier 2 Established (A)', value: 4, color: '#0EA5E9', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
    { label: 'Standard Affordable (B+)', value: 2, color: '#D97706', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
  ];

  const cityDistribution = [
    { label: 'Pune East (Kharadi/Viman)', value: 42.0, color: '#1667C1', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
    { label: 'Pune West (Bavdhan/Baner)', value: 36.5, color: '#0EA5E9', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
    { label: 'Mumbai MMR (Thane/Kalyan)', value: 28.0, color: '#6366F1', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
    { label: 'Pune PCMC (Ravet/Wakad)', value: 19.5, color: '#15803D', onClick: () => onNavigateToModule('APPROVAL_COCKPIT') },
  ];

  // Executive Decision Cards (Docket highlights)
  const decisionCards = filteredCases.slice(0, 3).map((c) => {
    const proj = getProjectById(c.projectId);
    const bld = getBuilderById(c.builderId);
    const twr = c.selectedTowerIds[0] ? getTowerById(c.selectedTowerIds[0]) : undefined;

    return {
      id: c.id,
      builder: bld?.legalName || 'Builder',
      project: proj?.projectName || 'Project',
      tower: twr?.towerName || 'Sanctioned Tower',
      techScore: '92% (Grade A)',
      legalScore: 'Clear Title (30 Yrs)',
      exposureRisk: 'Within Limit (Headroom ₹26 Cr)',
      overallRisk: 'LOW',
      requestedApfRate: '₹7,450 / sq.ft',
      recommendation: 'APPROVE WITH STANDARD CONDITIONS',
      onApprove: () => onNavigateToModule('APPROVAL_COCKPIT', c.id),
    };
  });

  return (
    <RoleDashboardShell>
      {/* 1. Header */}
      <DashboardHeader
        title="Credit Approval Intelligence"
        subtitle="Executive Sanctions & Delegated Authority Decision Cockpit"
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
        ]}
      />

      {/* 4. KPI Cards Grid (8 High-Value KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Awaiting Decision"
          value={awaitingDecisionCount}
          contextNote="In Approval Queue"
          trend={{ value: 'Ready for vote', direction: 'neutral' }}
          drillDownLabel="Open cockpit"
          onDrillDown={() => onNavigateToModule('APPROVAL_COCKPIT')}
          icon={<Award className="w-4 h-4 text-purple-600" />}
          riskSeverity={awaitingDecisionCount > 0 ? 'medium' : 'none'}
        />
        <KpiCard
          label="Approval Value"
          value={185.2}
          prefix="₹"
          suffix=" Cr"
          contextNote="Active dockets pool"
          trend={{ value: '↑ 12% vs last month', direction: 'up', isPositive: true }}
          drillDownLabel="View portfolio"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          icon={<Building2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Conditional Approvals"
          value={conditionalApprovalsCount}
          contextNote="Pre/Post disb covenants"
          trend={{ value: 'Tracked in register', direction: 'neutral' }}
          drillDownLabel="Conditions register"
          onDrillDown={() => onNavigateToModule('CONDITIONS_REGISTER')}
          icon={<CheckCircle2 className="w-4 h-4 text-sky-600" />}
        />
        <RiskKpiCard
          label="High Risk Cases"
          value={highRiskCasesCount}
          contextNote="Requires quorum scrutiny"
          trend={{ value: '1 Watchlist builder', direction: 'neutral' }}
          drillDownLabel="Inspect risk"
          onDrillDown={() => onNavigateToModule('APPROVAL_COCKPIT')}
          riskSeverity="high"
        />
        <KpiCard
          label="Deferred Cases"
          value={deferredCount}
          contextNote="Pending clarifications"
          trend={{ value: 'Query sent to CPA', direction: 'neutral' }}
          drillDownLabel="Review deferred"
          onDrillDown={() => onNavigateToModule('APPROVAL_COCKPIT')}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          label="Rejected"
          value={rejectedCount}
          contextNote="Sanction declined"
          trend={{ value: 'Clean underwriting', direction: 'neutral' }}
          drillDownLabel="Rejection audit"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<XCircle className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="LOS STP Pending"
          value={losPendingCount}
          contextNote="Ready for Core CBS"
          trend={{ value: 'Ready for dispatch', direction: 'up', isPositive: true }}
          drillDownLabel="LOS gateway"
          onDrillDown={() => onNavigateToModule('LOS_INTEGRATIONS')}
          icon={<Send className="w-4 h-4 text-purple-600" />}
        />
        <KpiCard
          label="Total Approved"
          value={approvedTotalCount}
          contextNote="Active APF dockets"
          trend={{ value: '100% STP Success', direction: 'up', isPositive: true }}
          drillDownLabel="Active schemes"
          onDrillDown={() => onNavigateToModule('MY_CASES')}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* 5. Executive Decision Cards: Dockets awaiting sign-off */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Executive Decision Spotlight — High-Priority Dockets
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Synthesized Underwriting Dockets Ready for Final Sanction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {decisionCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl border-2 border-slate-200 hover:border-sky-300 p-4 shadow-2xs space-y-3 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-[11px] font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {card.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {card.overallRisk} RISK
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{card.project}</h4>
                  <div className="text-xs text-slate-500">{card.builder} · {card.tower}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Technical Grade</span>
                    <strong className="text-slate-800">{card.techScore}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Legal Opinion</span>
                    <strong className="text-slate-800">{card.legalScore}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Sanction Rate Matrix</span>
                    <strong className="text-sky-900 font-mono">{card.requestedApfRate}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={card.onApprove}
                className="w-full py-2 px-3 bg-sky-900 hover:bg-sky-950 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Enter Approval Cockpit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart: Approvals Trend */}
        <ChartCard
          title="Sanction Volume Trend (Weekly)"
          subtitle="Sanctioned dockets vs Deferred/Rework"
          actionLabel="View history"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <LineTrendChart
            data={approvalOutcomeTrend}
            primaryLabel="Sanctioned"
            secondaryLabel="Deferred"
            lineColor="#15803D"
            secondaryLineColor="#D97706"
          />
        </ChartCard>

        {/* Donut: Proposed APF by Risk Band */}
        <ChartCard
          title="Portfolio by Risk Rating Band"
          subtitle="Risk rating distribution of approved pool"
          actionLabel="Risk breakdown"
          onActionClick={() => onNavigateToModule('APPROVAL_COCKPIT')}
        >
          <DonutChart
            data={riskBandDistribution}
            centerLabel="Cases"
            centerValue={12}
          />
        </ChartCard>

        {/* Bar Chart: City Concentration */}
        <ChartCard
          title="City & Micro-Market Exposure (₹ Cr)"
          subtitle="Geographic concentration limits"
          actionLabel="Exposure 360"
          onActionClick={() => onNavigateToModule('EXPOSURE')}
        >
          <BarChart
            data={cityDistribution}
            layout="horizontal"
            valuePrefix="₹"
            valueSuffix=" Cr"
          />
        </ChartCard>
      </div>
    </RoleDashboardShell>
  );
};
