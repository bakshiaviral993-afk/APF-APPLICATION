import React, { useState } from 'react';
import { UserAccount } from '../../../types/apfTransaction';
import { legalStore } from '../../../services/legalStore';
import { apfStore } from '../../../services/apfStore';
import { getBuilderById, getProjectById } from '../../../data/centralMasterData';
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
  Scale,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  RotateCcw,
  Receipt,
  CreditCard,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface ExternalLegalDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onNavigateToBilling?: () => void;
  onNavigateToWorkspace?: (assignmentId?: string) => void;
}

export const ExternalLegalDashboardView: React.FC<ExternalLegalDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onNavigateToBilling,
  onNavigateToWorkspace,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30_DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const vendorId = currentUser.vendorId || 'VND-LEGAL-001';
  // Strictly enforce RBAC: Only assignments belonging to this external firm
  const myAssignments = legalStore.getAssignments({ vendorId });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }, 400);
  };

  const newAssignmentsCount = myAssignments.filter((a) => a.status === 'LEGAL_ASSIGNED').length;
  const acceptedCount = myAssignments.filter((a) => a.status === 'LEGAL_ACCEPTED').length;
  const docReviewPendingCount = myAssignments.filter((a) => a.status === 'LEGAL_REVIEW_IN_PROGRESS').length;
  const needInputCount = 1;
  const inputReceivedCount = 1;
  const draftReportsCount = 1;
  const reworkCount = 0;
  const billingEligibleCount = myAssignments.filter((a) => a.status === 'LEGAL_ACCEPTED_BY_BANK' || a.status === 'BILLING_ELIGIBLE').length;

  const priorityItems: PriorityActionItem[] = [
    {
      id: 'EL-P1',
      type: 'APPROVAL_PENDING',
      title: 'Title Clearance Report Draft Pending Sign-off',
      description: 'Search report complete for Rohan Viti. Affix digital signature and transmit to Bank.',
      severity: 'info',
      count: 1,
      actionLabel: 'Open Legal Workspace',
      onAction: () => onNavigateToWorkspace?.(),
    },
  ];

  const assignmentStatusData = [
    { label: 'Accepted', value: Math.max(acceptedCount, 1), color: '#1667C1' },
    { label: 'In Review', value: Math.max(docReviewPendingCount, 1), color: '#0EA5E9' },
    { label: 'Approved', value: Math.max(billingEligibleCount, 1), color: '#15803D' },
  ];

  const tatTrendData = [
    { label: 'Case 01', value: 3.2, secondaryValue: 4.0 },
    { label: 'Case 02', value: 2.8, secondaryValue: 4.0 },
    { label: 'Case 03', value: 3.5, secondaryValue: 4.0 },
  ];

  const queueItems: ActionQueueItem[] = myAssignments.map((a) => {
    const apfCase = apfStore.getCaseById(a.caseId);
    const proj = apfCase ? getProjectById(apfCase.projectId) : undefined;
    const bld = apfCase ? getBuilderById(apfCase.builderId) : undefined;
    return {
      id: a.caseId,
      title: proj?.projectName || 'Project Title Review',
      subtitle: `${bld?.legalName || 'Builder'} • Due in 3 days`,
      stageLabel: a.status.replace(/_/g, ' '),
      slaDaysRemaining: 3,
      slaStatus: 'CLEAN',
      keyMetric: a.legalRoute || 'Drafting in Progress',
      actionLabel: 'Open Review',
      onAction: () => onNavigateToWorkspace?.(a.id),
    };
  });

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="My Legal Review Portfolio"
        subtitle="Empanelled Law Firm & Advocate Desk • Title Scrutiny, Search Reports & Invoicing"
        currentUser={currentUser}
        businessUnit={currentUser.firmName || 'Deshmukh & Associates Law Firm'}
        region="Bar Council Reg #MAH/3421/2012"
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
          label="New Assignments"
          value={newAssignmentsCount}
          contextNote="Awaiting acceptance"
          trend={{ value: 'Assigned by Bank', direction: 'neutral' }}
          drillDownLabel="View new"
          onDrillDown={() => onNavigateToWorkspace?.()}
          icon={<Scale className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Accepted"
          value={acceptedCount}
          contextNote="Active title searches"
          trend={{ value: 'SLA timer active', direction: 'neutral' }}
          drillDownLabel="View accepted"
          onDrillDown={() => onNavigateToWorkspace?.()}
          icon={<CheckCircle2 className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Review Pending"
          value={docReviewPendingCount}
          contextNote="Scrutinizing documents"
          trend={{ value: 'Search report in draft', direction: 'neutral' }}
          drillDownLabel="Open workspace"
          onDrillDown={() => onNavigateToWorkspace?.()}
          icon={<FileText className="w-4 h-4 text-slate-400" />}
        />
        <RiskKpiCard
          label="Need Input"
          value={needInputCount}
          contextNote="Clarification sent"
          trend={{ value: 'Awaiting Bank/Builder', direction: 'neutral' }}
          drillDownLabel="Query threads"
          onDrillDown={() => onNavigateToWorkspace?.()}
          riskSeverity={needInputCount > 0 ? 'medium' : 'none'}
        />
        <KpiCard
          label="Input Received"
          value={inputReceivedCount}
          contextNote="Builder replied"
          trend={{ value: 'Ready to continue', direction: 'up', isPositive: true }}
          drillDownLabel="Check replies"
          onDrillDown={() => onNavigateToWorkspace?.()}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Draft Reports"
          value={draftReportsCount}
          contextNote="Ready for signature"
          trend={{ value: '1 pending sign-off', direction: 'neutral' }}
          drillDownLabel="Open report"
          onDrillDown={() => onNavigateToWorkspace?.()}
          icon={<FileCheck2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Billing Eligible"
          value={billingEligibleCount}
          contextNote="Reports accepted by Bank"
          trend={{ value: 'Rate card: ₹45,000/report', direction: 'neutral' }}
          drillDownLabel="Invoice desk"
          onDrillDown={onNavigateToBilling}
          icon={<Receipt className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Payment Status"
          value={1}
          prefix="₹"
          suffix=" 45,000"
          contextNote="Settled via NEFT"
          trend={{ value: 'UTR #UTR-MH-98124', direction: 'up', isPositive: true }}
          drillDownLabel="View settlement"
          onDrillDown={onNavigateToBilling}
          icon={<CreditCard className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="My Legal Review Status"
          subtitle="Portfolio progress across assigned dockets"
        >
          <DonutChart
            data={assignmentStatusData}
            centerLabel="Cases"
            centerValue={myAssignments.length || 3}
          />
        </ChartCard>

        <ChartCard
          title="My Turnaround Time (Days)"
          subtitle="Search report completion vs Bank 4.0 Day SLA"
        >
          <LineTrendChart
            data={tatTrendData}
            primaryLabel="My TAT"
            secondaryLabel="SLA Target"
            valueSuffix="d"
            lineColor="#1667C1"
            secondaryLineColor="#94A3B8"
          />
        </ChartCard>
      </div>

      {/* Action Queue */}
      <ActionQueue
        title="My Assigned Title Scrutiny Dockets"
        subtitle="Mandatory 30-year title diligence assignments"
        items={queueItems}
        onViewAll={() => onNavigateToWorkspace?.()}
      />
    </RoleDashboardShell>
  );
};
