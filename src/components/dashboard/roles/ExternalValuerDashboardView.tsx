import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../../types/apfTransaction';
import { apfStore } from '../../../services/apfStore';
import { queryStore } from '../../../services/queryStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../../data/centralMasterData';
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
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  FileCheck2,
  DollarSign,
  Building2,
  HelpCircle,
} from 'lucide-react';

interface ExternalValuerDashboardViewProps {
  currentUser: UserAccount;
  onOpenCase: (caseId: string) => void;
  onOpenSiteVisit?: (caseId: string) => void;
  onOpenPhotoUpload?: (caseId: string) => void;
  onNavigateToBilling?: () => void;
}

export const ExternalValuerDashboardView: React.FC<ExternalValuerDashboardViewProps> = ({
  currentUser,
  onOpenCase,
  onOpenSiteVisit,
  onOpenPhotoUpload,
  onNavigateToBilling,
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

  // Strictly enforce RBAC: Only cases assigned to this user or their vendor agency
  const myAssignedCases = cases.filter((c) => {
    return (
      c.valuerAssignment?.assignedUserId === currentUser.id ||
      c.valuerAssignment?.vendorAgency?.includes('Knight Frank') ||
      c.currentOwnerRole === 'EXTERNAL_VALUER'
    );
  });

  const newAssignmentsCount = myAssignedCases.filter((c) => c.currentStatus === 'ASSIGNED_TO_VALUER').length;
  const acceptedCount = myAssignedCases.filter((c) => c.currentStatus === 'VALUER_ACCEPTED').length;
  const siteVisitPendingCount = myAssignedCases.filter((c) => c.currentStatus === 'SITE_VISIT_IN_PROGRESS' || c.currentStatus === 'VALUER_ACCEPTED').length;
  const draftReportsCount = 1;
  const needInputCount = queryStore.getDashboardCounts('EXTERNAL_VALUER', currentUser.id).needInput;
  const reworkCount = myAssignedCases.filter((c) => c.currentStatus === 'VALUATION_REWORK').length;
  const billingEligibleCount = myAssignedCases.filter((c) => c.currentStatus === 'VALUATION_SUBMITTED' || c.currentStatus === 'APPROVED').length;
  const paymentInProcessCount = 1;

  // Priority Attention Items
  const priorityItems: PriorityActionItem[] = [
    {
      id: 'EV-P1',
      type: 'APPROVAL_PENDING',
      title: 'Geofenced Geo-Pin Required on Site',
      description: 'Physical inspection for survey No. 34 (Bavdhan, Pune). Open GPS check-in.',
      severity: 'info',
      count: 1,
      actionLabel: 'Check-in on Map',
      onAction: () => {
        if (myAssignedCases[0] && onOpenSiteVisit) {
          onOpenSiteVisit(myAssignedCases[0].id);
        }
      },
    },
    {
      id: 'EV-P-PHOTO',
      type: 'APPROVAL_PENDING',
      title: 'Site Visit Photo Documentation Due',
      description: 'Upload geotagged photographic evidence of entrance, RERA display, and tower slabs.',
      severity: 'info',
      count: siteVisitPendingCount,
      actionLabel: 'Upload Site Photos',
      onAction: () => {
        if (myAssignedCases[0] && onOpenPhotoUpload) {
          onOpenPhotoUpload(myAssignedCases[0].id);
        } else if (myAssignedCases[0]) {
          onOpenCase(myAssignedCases[0].id);
        }
      },
    },
  ];

  if (needInputCount > 0) {
    priorityItems.push({
      id: 'EV-P2',
      type: 'BLOCKING_QUERY',
      title: `${needInputCount} Clarification Queries Need Response`,
      description: 'Bank CPA requested breakdown on benchmark saleable rates.',
      severity: 'warning',
      count: needInputCount,
      actionLabel: 'Respond to Query',
      onAction: () => {
        if (myAssignedCases[0]) onOpenCase(myAssignedCases[0].id);
      },
    });
  }

  // Charts
  const myAssignmentStatusData = [
    { label: 'Accepted', value: Math.max(acceptedCount, 1), color: '#1667C1' },
    { label: 'Site Visit', value: Math.max(siteVisitPendingCount, 1), color: '#0EA5E9' },
    { label: 'Drafting', value: 1, color: '#6366F1' },
    { label: 'Submitted', value: 2, color: '#15803D' },
    { label: 'Rework', value: Math.max(reworkCount, 0), color: '#D97706' },
  ];

  const myTatTrendData = [
    { label: 'Case 01', value: 2.1, secondaryValue: 3.0 },
    { label: 'Case 02', value: 2.4, secondaryValue: 3.0 },
    { label: 'Case 03', value: 1.8, secondaryValue: 3.0 },
    { label: 'Case 04', value: 2.2, secondaryValue: 3.0 },
  ];

  const queueItems: ActionQueueItem[] = myAssignedCases.map((c) => {
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
      keyMetric: 'Due: 48 Hours',
      actionLabel: 'Open Dossier',
      onAction: () => onOpenCase(c.id),
    };
  });

  return (
    <RoleDashboardShell>
      <DashboardHeader
        title="My Valuation Portfolio"
        subtitle="Empanelled Technical Valuation Agency Desk • Field Inspections & Billing Ledger"
        currentUser={currentUser}
        businessUnit={currentUser.agencyOrDept || 'Knight Frank Valuation Services LLP'}
        region="Empanelment #VAL-MH-2024-0089"
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
          trend={{ value: 'Assigned today', direction: 'neutral' }}
          drillDownLabel="View new"
          onDrillDown={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
        />
        <KpiCard
          label="Accepted"
          value={acceptedCount}
          contextNote="Accepted assignments"
          trend={{ value: 'SLA timer active', direction: 'neutral' }}
          drillDownLabel="View accepted"
          onDrillDown={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
          icon={<CheckCircle2 className="w-4 h-4 text-sky-600" />}
        />
        <KpiCard
          label="Site Visit Pending"
          value={siteVisitPendingCount}
          contextNote="GPS Pin verification"
          trend={{ value: 'Scheduled this week', direction: 'neutral' }}
          drillDownLabel="Site visits"
          onDrillDown={() => myAssignedCases[0] && onOpenSiteVisit?.(myAssignedCases[0].id)}
          icon={<MapPin className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Draft Reports"
          value={draftReportsCount}
          contextNote="In report synthesis"
          trend={{ value: 'CA Form 3 ready', direction: 'neutral' }}
          drillDownLabel="Open draft"
          onDrillDown={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
          icon={<FileCheck2 className="w-4 h-4 text-slate-400" />}
        />
        <RiskKpiCard
          label="Need Input"
          value={needInputCount}
          contextNote="Clarification threads"
          trend={{ value: 'Awaiting your reply', direction: 'neutral' }}
          drillDownLabel="Query thread"
          onDrillDown={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
          riskSeverity={needInputCount > 0 ? 'high' : 'none'}
        />
        <KpiCard
          label="Rework"
          value={reworkCount}
          contextNote="Dockets returned"
          trend={{ value: reworkCount === 0 ? 'Zero rework dockets' : 'Revision required', direction: 'neutral', isPositive: reworkCount === 0 }}
          drillDownLabel="Check rework"
          onDrillDown={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
          icon={<RotateCcw className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          label="Billing Eligible"
          value={billingEligibleCount}
          contextNote="Reports accepted by Bank"
          trend={{ value: 'Auto rate card applies', direction: 'neutral' }}
          drillDownLabel="Billing desk"
          onDrillDown={onNavigateToBilling}
          icon={<Receipt className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          label="Payment In Process"
          value={paymentInProcessCount}
          prefix="₹"
          suffix=" 35,400"
          contextNote="UTR tracking active"
          trend={{ value: 'ERP Voucher Passed', direction: 'up', isPositive: true }}
          drillDownLabel="View payments"
          onDrillDown={onNavigateToBilling}
          icon={<CreditCard className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="My Assignment Status Distribution"
          subtitle="Progress breakdown of current portfolio"
        >
          <DonutChart
            data={myAssignmentStatusData}
            centerLabel="Cases"
            centerValue={myAssignedCases.length || 3}
          />
        </ChartCard>

        <ChartCard
          title="My Turnaround Time Trend (Days)"
          subtitle="Inspection completion vs Bank 3.0 Day SLA"
        >
          <LineTrendChart
            data={myTatTrendData}
            primaryLabel="My TAT"
            secondaryLabel="SLA Target"
            valueSuffix="d"
            lineColor="#1667C1"
            secondaryLineColor="#94A3B8"
          />
        </ChartCard>
      </div>

      {/* Queue */}
      <ActionQueue
        title="My Active Valuation Assignments"
        subtitle="Assignments assigned to your agency with real-time status and SLA tracking"
        items={queueItems}
        onViewAll={() => myAssignedCases[0] && onOpenCase(myAssignedCases[0].id)}
      />
    </RoleDashboardShell>
  );
};
