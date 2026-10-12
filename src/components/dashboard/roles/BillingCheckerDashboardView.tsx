import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { NavigationModule } from '../../../types/navigation';
import { billingStore } from '../../../services/billingStore';
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
  Receipt,
  FileCheck2,
  CheckCircle2,
  Clock,
  CreditCard,
  Send,
  AlertTriangle,
  Building2,
} from 'lucide-react';

interface BillingCheckerDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
}

export const BillingCheckerDashboardView: React.FC<BillingCheckerDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToModule,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const bills = billingStore.getBills();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const pendingCheckerCount = bills.filter((b) => b.status === 'BILL_VERIFICATION' || b.status === 'INVOICE_SUBMITTED').length;
  const approvedTodayCount = 2;
  const sentToErpCount = bills.filter((b) => b.status === 'SENT_TO_FINANCE' || b.status === 'APPROVED_FOR_PAYMENT').length;
  const erpFailuresCount = 0;
  const paymentInProcessCount = 1;
  const paidThisMonthCount = 3;
  const onHoldCount = 0;

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'BC-P1',
      type: 'APPROVAL_PENDING',
      title: `${pendingCheckerCount} Vendor Invoices Awaiting Checker Authorization`,
      description: 'Maker verification complete. Review GST/TDS split and approve for ERP payment voucher.',
      severity: 'info',
      count: pendingCheckerCount,
      actionLabel: 'Open Checker Desk',
      onAction: () => onNavigateToModule('BILLING'),
    },
  ];

  const approvalTrend = [
    { label: 'W1', value: 3, secondaryValue: 0 },
    { label: 'W2', value: 5, secondaryValue: 0 },
    { label: 'W3', value: 4, secondaryValue: 0 },
    { label: 'W4', value: 6, secondaryValue: 0 },
  ];

  const vendorTypeDonut = [
    { label: 'Technical Valuers', value: 142500, color: '#1667C1' },
    { label: 'Legal Law Firms', value: 95000, color: '#0EA5E9' },
  ];

  const queueItems: ActionQueueItem[] = bills.slice(0, 4).map((b) => ({
    id: b.id,
    title: b.vendorName,
    subtitle: `${b.projectName} • Invoice: ${b.vendorInvoice?.invoiceNo || 'INV-2026-001'}`,
    stageLabel: b.status === 'BILL_VERIFICATION' ? 'Pending Checker Sign' : b.status.replace(/_/g, ' '),
    stageColor: 'bg-purple-100 text-purple-900 border border-purple-200',
    slaDaysRemaining: 2,
    slaStatus: 'CLEAN',
    keyMetric: `Net: ₹${(b.netPayable || b.subtotalProfessionalFee).toLocaleString()}`,
    actionLabel: 'Authorize',
    onAction: () => onNavigateToModule('BILLING'),
  }));

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Billing Approval & Settlement — Checker Desk"
        subtitle="Final Vendor Fee Authorization, Finance ERP Voucher Export & Bank Settlement Ledger"
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
          label="Pending Checker"
          value={pendingCheckerCount}
          contextNote="Awaiting sign-off"
          trend={{ value: 'Priority payment run', direction: 'neutral' }}
          drillDownLabel="Open queue"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Receipt className="w-4 h-4 text-purple-600" />}
          riskSeverity={pendingCheckerCount > 0 ? 'medium' : 'none'}
        />
        <KpiCard
          label="Approved Today"
          value={approvedTodayCount}
          contextNote="Signed by Checker"
          trend={{ value: 'Vouchers created', direction: 'up', isPositive: true }}
          drillDownLabel="Today's batch"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Approved Amount"
          value={237500}
          prefix="₹"
          contextNote="Current batch total"
          trend={{ value: 'Ready for ERP push', direction: 'neutral' }}
          drillDownLabel="Batch breakdown"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<CreditCard className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Sent to ERP"
          value={sentToErpCount}
          contextNote="SAP / Oracle vouchers"
          trend={{ value: 'STP Integration active', direction: 'up', isPositive: true }}
          drillDownLabel="ERP ledger"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Send className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="ERP Failures"
          value={erpFailuresCount}
          contextNote="0 Sync errors"
          trend={{ value: '100% STP Success', direction: 'up', isPositive: true }}
          drillDownLabel="Sync health"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Payment In Process"
          value={paymentInProcessCount}
          contextNote="NEFT / RTGS staging"
          trend={{ value: 'UTR pending generation', direction: 'neutral' }}
          drillDownLabel="Settlements"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          label="Paid This Month"
          value={paidThisMonthCount}
          contextNote="Settled invoices"
          trend={{ value: '↑ 3 settled this cycle', direction: 'up', isPositive: true }}
          drillDownLabel="Paid ledger"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="On Hold"
          value={onHoldCount}
          contextNote="Disputed bills"
          trend={{ value: 'Zero disputed items', direction: 'neutral', isPositive: true }}
          drillDownLabel="Hold queue"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Vendor Type Fee Split (₹)"
          subtitle="Valuer inspections vs Legal title opinions"
          actionLabel="Billing desk"
          onActionClick={() => onNavigateToModule('BILLING')}
        >
          <DonutChart
            data={vendorTypeDonut}
            centerLabel="Total Fee"
            centerValue="₹2.37L"
          />
        </ChartCard>

        <ChartCard
          title="Weekly Checker Authorization Trend"
          subtitle="Volume of authorized vendor payment vouchers"
          actionLabel="View vouchers"
          onActionClick={() => onNavigateToModule('BILLING')}
        >
          <LineTrendChart
            data={approvalTrend}
            primaryLabel="Approved"
            valueSuffix=" Bills"
            lineColor="#15803D"
          />
        </ChartCard>
      </div>

      {/* Action Queue */}
      <ActionQueue
        title="Invoices Awaiting Checker Authorization"
        subtitle="Review tax calculation, vendor bank mandate and confirm release to Finance ERP"
        items={queueItems}
        onViewAll={() => onNavigateToModule('BILLING')}
      />
    </RoleDashboardShell>
  );
};
