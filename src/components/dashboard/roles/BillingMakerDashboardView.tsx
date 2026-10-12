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
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  CreditCard,
} from 'lucide-react';

interface BillingMakerDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToModule: (module: NavigationModule, caseId?: string) => void;
}

export const BillingMakerDashboardView: React.FC<BillingMakerDashboardViewProps> = ({
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

  const billingEligibleCount = bills.filter((b) => b.status === 'BILLING_ELIGIBLE').length;
  const invoicePendingCount = bills.filter((b) => b.status === 'VENDOR_INVOICE_PENDING').length;
  const invoiceSubmittedCount = bills.filter((b) => b.status === 'INVOICE_SUBMITTED').length;
  const verificationQueueCount = bills.filter((b) => b.status === 'BILL_VERIFICATION' || b.status === 'INVOICE_SUBMITTED').length;
  const invoiceVarianceCount = bills.filter((b) => Boolean(b.vendorInvoice?.varianceAmount && b.vendorInvoice.varianceAmount > 0)).length;
  const reimbursementPendingCount = bills.filter((b) => Boolean(b.reimbursements && b.reimbursements.length > 0)).length;
  const returnedCount = 0;
  const slaBreachCount = 0;

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'BM-P1',
      type: 'BILLING_EXCEPTION',
      title: `${verificationQueueCount} Invoices Awaiting Maker Verification`,
      description: 'Check rate card conformity, GSTIN match, and deliverables before forwarding to Checker.',
      severity: 'info',
      count: verificationQueueCount,
      actionLabel: 'Verify in Billing Desk',
      onAction: () => onNavigateToModule('BILLING'),
    },
  ];

  if (invoiceVarianceCount > 0) {
    priorityItems.push({
      id: 'BM-P2',
      type: 'BILLING_EXCEPTION',
      title: `${invoiceVarianceCount} Rate Card Variance Alert`,
      description: 'Vendor invoice quoted higher rate than empanelled rate card without pre-approval.',
      severity: 'warning',
      count: invoiceVarianceCount,
      actionLabel: 'Resolve Variance',
      onAction: () => onNavigateToModule('BILLING'),
    });
  }

  const billsByStageData = [
    { label: 'Eligible', value: Math.max(billingEligibleCount, 2), color: '#94A3B8' },
    { label: 'Submitted', value: Math.max(invoiceSubmittedCount, 3), color: '#1667C1' },
    { label: 'Verified', value: 2, color: '#0EA5E9' },
    { label: 'Checker Approved', value: 4, color: '#15803D' },
  ];

  const vendorBillingBar = [
    { label: 'Knight Frank Valuation', value: 82500, color: '#1667C1' },
    { label: 'Deshmukh Law Firm', value: 45000, color: '#0EA5E9' },
    { label: 'CBRE Technical Services', value: 35000, color: '#6366F1' },
    { label: 'Verma & Associates', value: 25000, color: '#15803D' },
  ];

  const queueItems: ActionQueueItem[] = bills.slice(0, 4).map((b) => ({
    id: b.id,
    title: b.vendorName,
    subtitle: `${b.projectName} • Case ${b.caseId}`,
    stageLabel: b.status.replace(/_/g, ' '),
    slaDaysRemaining: 2,
    slaStatus: 'CLEAN',
    keyMetric: `₹${(b.netPayable || b.subtotalProfessionalFee).toLocaleString()}`,
    actionLabel: 'Verify Bill',
    onAction: () => onNavigateToModule('BILLING'),
  }));

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="Billing Operations — Maker Desk"
        subtitle="Vendor Invoice Verification, Rate Card Audit Engine & Tax Compliance Validation"
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
          label="Billing Eligible"
          value={billingEligibleCount}
          contextNote="Reports accepted"
          trend={{ value: 'Auto-rate card applies', direction: 'neutral' }}
          drillDownLabel="Open eligible"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Receipt className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Invoice Pending"
          value={invoicePendingCount}
          contextNote="Awaiting vendor upload"
          trend={{ value: 'Automated reminders', direction: 'neutral' }}
          drillDownLabel="Pending list"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Invoice Submitted"
          value={invoiceSubmittedCount}
          contextNote="Uploaded by vendor"
          trend={{ value: 'Ready for maker audit', direction: 'neutral' }}
          drillDownLabel="Review invoices"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<FileCheck2 className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Verification Queue"
          value={verificationQueueCount}
          contextNote="In Maker queue"
          trend={{ value: 'Priority check', direction: 'neutral' }}
          drillDownLabel="Open queue"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <RiskKpiCard
          label="Invoice Variance"
          value={invoiceVarianceCount}
          contextNote="Rate card divergence"
          trend={{ value: invoiceVarianceCount > 0 ? 'Requires waiver' : 'Zero variance', direction: 'neutral' }}
          drillDownLabel="Variance desk"
          onDrillDown={() => onNavigateToModule('BILLING')}
          riskSeverity={invoiceVarianceCount > 0 ? 'high' : 'none'}
        />
        <KpiCard
          label="Reimbursements"
          value={reimbursementPendingCount}
          contextNote="Out of pocket travel"
          trend={{ value: 'Toll & travel receipts', direction: 'neutral' }}
          drillDownLabel="Reimbursements"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<DollarSign className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Returned"
          value={returnedCount}
          contextNote="Sent back for correction"
          trend={{ value: '0 Returned bills', direction: 'neutral', isPositive: true }}
          drillDownLabel="Returned queue"
          onDrillDown={() => onNavigateToModule('BILLING')}
          icon={<RotateCcw className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="SLA Breaches"
          value={slaBreachCount}
          contextNote="0 Breaches"
          trend={{ value: '100% TAT adherence', direction: 'up', isPositive: true }}
          drillDownLabel="SLA report"
          onDrillDown={() => onNavigateToModule('REPORTS')}
          icon={<Clock className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Invoices by Operational Lifecycle Stage"
          subtitle="Pipeline progression from report sign-off to ERP voucher"
          actionLabel="Billing module"
          onActionClick={() => onNavigateToModule('BILLING')}
        >
          <DonutChart
            data={billsByStageData}
            centerLabel="Bills"
            centerValue={bills.length || 7}
          />
        </ChartCard>

        <ChartCard
          title="Vendor Invoicing Volume (₹ Value)"
          subtitle="Total fees generated by empanelled valuation & legal vendors"
          actionLabel="View all vendors"
          onActionClick={() => onNavigateToModule('VENDOR_MANAGEMENT')}
        >
          <BarChart
            data={vendorBillingBar}
            layout="horizontal"
            valuePrefix="₹"
          />
        </ChartCard>
      </div>

      {/* Queue */}
      <ActionQueue
        title="Maker Verification Queue"
        subtitle="Vendor invoices awaiting mathematical validation, tax audit and checker forwarding"
        items={queueItems}
        onViewAll={() => onNavigateToModule('BILLING')}
      />
    </RoleDashboardShell>
  );
};
