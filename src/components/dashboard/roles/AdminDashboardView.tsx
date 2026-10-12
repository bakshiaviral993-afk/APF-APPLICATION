import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
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
  Users,
  Building2,
  Settings,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  Activity,
  FileCheck2,
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
  onToggleExecutiveMode?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
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

  const pendingMasterApprovals = masterStore.getPendingApprovals();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'ADM-P1',
      type: 'APPROVAL_PENDING',
      title: `${pendingMasterApprovals.length} Master Maker-Checker Approvals Pending`,
      description: 'Builder KYC / Project sanction amendments awaiting dual-control verification.',
      severity: 'info',
      count: pendingMasterApprovals.length,
      actionLabel: 'Open Master Approvals',
      onAction: () => onNavigateToModule('BUILDER_MASTER'),
    },
    {
      id: 'ADM-P2',
      type: 'BILLING_EXCEPTION',
      title: 'Empanelment Expiry Alert: CBRE Technical Services',
      description: 'Vendor empanelment agreement expires in 14 days. Renewal dossier required.',
      severity: 'warning',
      count: 1,
      actionLabel: 'Inspect Vendor Register',
      onAction: () => onNavigateToModule('VENDOR_MANAGEMENT'),
    },
  ];

  const roleDistributionData = [
    { label: 'Bank Underwriting (CPA)', value: 12, color: '#1667C1' },
    { label: 'Credit Operations (COM)', value: 6, color: '#0EA5E9' },
    { label: 'Credit Approvers', value: 4, color: '#6366F1' },
    { label: 'External Valuers', value: 18, color: '#15803D' },
    { label: 'External Legal Advocates', value: 14, color: '#D97706' },
  ];

  const usageTrendData = [
    { label: 'Mon', value: 124, secondaryValue: 110 },
    { label: 'Tue', value: 142, secondaryValue: 110 },
    { label: 'Wed', value: 168, secondaryValue: 110 },
    { label: 'Thu', value: 155, secondaryValue: 110 },
    { label: 'Fri', value: 172, secondaryValue: 110 },
  ];

  const queueItems: ActionQueueItem[] = pendingMasterApprovals.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.entityName,
    subtitle: `${p.entityType} • Created by ${p.submittedBy || 'Admin'}`,
    stageLabel: 'Pending Dual Control',
    stageColor: 'bg-amber-100 text-amber-900 border border-amber-200',
    slaDaysRemaining: 1,
    slaStatus: 'CLEAN',
    keyMetric: p.changeSummary || 'Master Entity Update',
    actionLabel: 'Verify',
    onAction: () => onNavigateToModule('BUILDER_MASTER'),
  }));

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Platform Administration"
        subtitle="User Management, RBAC Matrix, Empanelled Vendor Directory & System Audits"
        currentUser={currentUser}
        selectedDateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
        showExecutiveToggle={true}
        onToggleExecutiveMode={onToggleExecutiveMode}
      />

      <PriorityActionStrip items={priorityItems} />

      {/* 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active Users"
          value={54}
          contextNote="Internal bank staff"
          trend={{ value: '↑ 3 new onboarded', direction: 'up', isPositive: true }}
          drillDownLabel="User directory"
          onDrillDown={() => onNavigateToModule('ADMIN_CONFIG')}
          icon={<Users className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="External Vendors"
          value={32}
          contextNote="Valuers & Legal firms"
          trend={{ value: 'All KYC verified', direction: 'neutral' }}
          drillDownLabel="Vendor directory"
          onDrillDown={() => onNavigateToModule('VENDOR_MANAGEMENT')}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <RiskKpiCard
          label="Master Changes"
          value={pendingMasterApprovals.length}
          contextNote="Maker-Checker dual control"
          trend={{ value: 'Awaiting dual sign', direction: 'neutral' }}
          drillDownLabel="Master approvals"
          onDrillDown={() => onNavigateToModule('BUILDER_MASTER')}
          riskSeverity={pendingMasterApprovals.length > 0 ? 'medium' : 'none'}
        />
        <RiskKpiCard
          label="Expiring Empanelments"
          value={1}
          contextNote="Next 30 days"
          trend={{ value: 'CBRE Technical Services', direction: 'neutral' }}
          drillDownLabel="Vendor compliance"
          onDrillDown={() => onNavigateToModule('VENDOR_MANAGEMENT')}
          riskSeverity="high"
        />
        <KpiCard
          label="Config Changes"
          value={0}
          contextNote="Pending deployment"
          trend={{ value: 'Config in sync', direction: 'neutral', isPositive: true }}
          drillDownLabel="Configuration"
          onDrillDown={() => onNavigateToModule('ADMIN_CONFIG')}
          icon={<Settings className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Integration Alerts"
          value={0}
          contextNote="LOS / CBS Gateways"
          trend={{ value: 'All gateways healthy', direction: 'up', isPositive: true }}
          drillDownLabel="LOS engine"
          onDrillDown={() => onNavigateToModule('LOS_INTEGRATIONS')}
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Audit Exceptions"
          value={0}
          contextNote="Security event logs"
          trend={{ value: 'Zero policy violations', direction: 'up', isPositive: true }}
          drillDownLabel="Audit stream"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Failed Jobs"
          value={0}
          contextNote="Background sync workers"
          trend={{ value: '100% Success rate', direction: 'up', isPositive: true }}
          drillDownLabel="Job logs"
          onDrillDown={() => onNavigateToModule('ADMIN_CONFIG')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Active Platform User Roles Distribution"
          subtitle="Proval APF platform access breakdown across internal and external desks"
          actionLabel="Manage roles"
          onActionClick={() => onNavigateToModule('ADMIN_CONFIG')}
        >
          <DonutChart
            data={roleDistributionData}
            centerLabel="Users"
            centerValue={54}
          />
        </ChartCard>

        <ChartCard
          title="Daily Active Operations Usage Trend"
          subtitle="Daily transaction actions across bank desks"
          actionLabel="Usage metrics"
          onActionClick={() => onNavigateToModule('REPORTS')}
        >
          <LineTrendChart
            data={usageTrendData}
            primaryLabel="Daily Events"
            secondaryLabel="Baseline"
            lineColor="#1667C1"
            secondaryLineColor="#94A3B8"
          />
        </ChartCard>
      </div>

      {/* Queue */}
      <ActionQueue
        title="Pending Master Data Dual-Control Approvals"
        subtitle="Maker-Checker modifications to core Builder, Project and Tower masters"
        items={queueItems}
        onViewAll={() => onNavigateToModule('BUILDER_MASTER')}
      />
    </RoleDashboardShell>
  );
};
