export type ScreenId =
  | '01' | '02' | '03' | '04' | '05'
  | '06' | '07' | '08' | '09' | '10'
  | '11' | '12' | '13' | '14' | '15'
  | '16' | '17' | '18' | '19' | '20'
  | '21' | '22' | '23' | '24' | '25'
  | '26' | '27' | '28' | '29' | '30'
  | 'flow';

export type UserRole =
  | 'CPA'
  | 'COM'
  | 'Internal Valuer'
  | 'External Valuer'
  | 'Legal Reviewer'
  | 'Approving Manager'
  | 'Committee Member'
  | 'Risk/Credit Viewer'
  | 'Auditor/Admin Viewer'
  | 'LOS Integration Service'
  | 'Management'
  | 'Risk'
  | 'Credit'
  | 'Business'
  | 'Legal'
  | 'Technical'
  | 'Valuation'
  | 'Committee'
  | 'Monitoring'
  | 'Admin';

export interface EvidenceSnippet {
  sourceType: 'Borrower Declaration' | 'Credit Bureau / CRILC' | 'MCA Charge Filing' | 'Site Inspection Report' | 'Title Search Report' | 'Audited Financial Statement' | 'RERA Public Registry';
  sourceId: string;
  documentTitle: string;
  pageOrSection: string;
  asOfDate: string;
  extractedField: string;
  snippet: string;
  confidenceScore: number;
}

export interface AIObservation {
  id: string;
  agentId: 'Document Agent' | 'Legal Agent' | 'Technical Agent' | 'Financial Agent' | 'Exposure Agent' | 'Risk Agent' | 'Monitoring Agent' | 'APF Underwriter Orchestrator' | 'Committee Pack Agent';
  domain: 'Legal' | 'Technical' | 'Financial' | 'Exposure' | 'Risk' | 'Underwriter';
  observationTitle: string;
  observationText: string;
  evidenceList: EvidenceSnippet[];
  riskCategory: 'Credit Risk' | 'Legal Risk' | 'Project Execution' | 'Governance / Compliance' | 'Market / Valuation';
  riskSeverity: 'Critical' | 'High' | 'Medium' | 'Low';
  impactSummary: string;
  recommendedAction: string;
  userDecision: 'PENDING' | 'ACCEPTED' | 'EDITED' | 'REJECTED';
  editedText?: string;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  executionId: string;
}

export interface ExposureSourceItem {
  id: string;
  sourceSystem: 'Borrower Declaration' | 'CIBIL / CRILC' | 'MCA Charge Index' | 'Audited Balance Sheet' | 'Internal CBS/LOS';
  lenderName: string;
  facilityType: 'Term Loan' | 'Project Finance' | 'Working Capital / Overdraft' | 'NCD / Debt' | 'Corporate Loan';
  sanctionAmountCr: number;
  outstandingAmountCr: number;
  undrawnAmountCr: number;
  asOfDate: string;
  chargeId?: string;
  securityDetails: string;
  documentRef: string;
  status: 'Reported' | 'Discovered' | 'Verified';
}

export interface ReconciledFacility {
  id: string;
  lenderName: string;
  facilityType: string;
  declaredSanctionCr: number;
  declaredOutstandingCr: number;
  externalSanctionCr: number;
  externalOutstandingCr: number;
  mcaChargeCr: number;
  varianceCr: number;
  variancePct: number;
  isUndeclared: boolean;
  status: 'Matched' | 'Undeclared Discrepancy' | 'Variance Review' | 'Golden Approved';
  goldenSanctionCr: number;
  goldenOutstandingCr: number;
  ruleExplanation: string;
  matchedSources: string[];
  auditedBy?: string;
  auditedAt?: string;
  overrideReason?: string;
}

export interface UnitItem {
  id: string;
  unitNumber: string;
  towerId: string;
  towerName: string;
  floor: number;
  configuration: '2 BHK' | '3 BHK' | '4 BHK' | 'Penthouse';
  carpetAreaSqFt: number;
  agreementValueLakh: number;
  marketValuationLakh: number;
  status: 'Funded' | 'Pipeline' | 'Delinquent' | 'Booked' | 'Unsold';
  borrowerName?: string;
  loanAccountNo?: string;
  sanctionAmountLakh?: number;
  disbursedAmountLakh?: number;
  outstandingAmountLakh?: number;
  ltvPct?: number;
  dpdBucket?: '0 DPD' | '1-30 DPD' | '31-60 DPD' | '61-90 DPD' | '90+ DPD';
  valuationDeviationPct?: number;
}

export interface TowerItem {
  id: string;
  projectId: string;
  name: string;
  floors: number;
  unitsCount: number;
  fundedUnits: number;
  delinquentUnits: number;
  pipelineUnits: number;
  unsoldUnits: number;
  constructionStage: string;
  progressPct: number;
  plannedProgressPct: number;
  delayMonths: number;
}

export interface ProjectEntity {
  id: string;
  apfCode: string;
  name: string;
  builderId: string;
  builderName: string;
  groupId: string;
  groupName: string;
  city: string;
  microMarket: string;
  reraNumber: string;
  launchDate: string;
  completionDate: string;
  totalPhases: number;
  totalTowers: number;
  totalUnits: number;
  bookedUnits: number;
  approvedLtvPct: number;
  totalProjectCostCr: number;
  internalRetailSanctionCr: number;
  internalRetailDisbursedCr: number;
  internalRetailOutstandingCr: number;
  externalProjectFinanceDebtCr: number;
  constructionActualPct: number;
  constructionPlanPct: number;
  riskBand: 'Low' | 'Moderate' | 'High' | 'Critical';
  openEWSCount: number;
  apfStatus: 'Approved' | 'Under Review' | 'Watchlist' | 'Suspended';
}

export interface BuilderGroup {
  id: string;
  name: string;
  totalGroupExposureCr: number;
  directBuilderExposureCr: number;
  retailLinkedExposureCr: number;
  pipelineExposureCr: number;
  groupLimitCr: number;
  overallLimitCr?: number;
  totalNetWorthCr?: number;
  limitUtilisationPct: number;
  riskGrade: 'A' | 'BBB+' | 'BBB-' | 'BB';
  activeProjectsCount: number;
  totalUnitsCount: number;
  headquarters: string;
  establishedYear: number;
}

export interface BuilderCompany {
  id: string;
  groupId: string;
  legalName: string;
  entityType: 'Private Limited' | 'LLP' | 'Special Purpose Vehicle (SPV)';
  cin: string;
  pan: string;
  gstin: string;
  reraPromoterId: string;
  roleInGroup: 'Parent Flagship' | 'Co-Developer / Partner' | 'Project Execution SPV';
  netWorthCr: number;
  totalBorrowingsCr: number;
  directBankExposureCr: number;
  riskScore: number;
  riskBand: 'Green' | 'Amber' | 'Red';
  promoters: string[];
}

export interface PromoterProfile {
  id: string;
  name: string;
  din: string;
  pan: string;
  designation: string;
  experienceYears: number;
  shareholdingPct: number;
  cibilScore: number;
  otherDirectorships: number;
  litigationFlags: number;
  politicallyExposed: boolean;
  guaranteeGivenCr: number;
}

export interface MCACharge {
  chargeId: string;
  chargeHolder: string;
  sanctionedAmountCr: number;
  creationDate: string;
  status: 'Open' | 'Satisfied';
  assetsUnderCharge: string;
  sourceDocRef: string;
  reconciledWithFacilityId?: string;
  isUndeclaredInApp: boolean;
}

export type CommitteeDecisionType = 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED';

export interface EWSEvent {
  id: string;
  title: string;
  category: 'Construction Delay' | 'Retail Delinquency' | 'Charge Discrepancy' | 'RERA Compliance' | 'Market Absorption';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  triggerDate: string;
  projectId: string;
  projectName: string;
  description: string;
  source?: string;
  dateDetected?: string;
  remediationAction?: string;
  metrics: {
    planned?: string;
    actual?: string;
    variance?: string;
    linkedExposureCr?: number;
    impactedUnits?: number;
  };
  recommendedAction: string;
  status: 'Active' | 'Acknowledged' | 'Task Created' | 'Resolved';
  assignedTo?: string;
}

export interface CommitteePack {
  caseId: string;
  apfCode: string;
  builderName: string;
  projectName: string;
  requestType: 'Fresh APF Approval' | 'Limit Enhancement' | 'Annual Renewal';
  compositeScore: number;
  riskBand: string;
  directExposureCr: number;
  currentRetailExposureCr: number;
  proposedRetailLimitCr: number;
  postApprovalGroupExposureCr: number;
  groupLimitCapCr: number;
  policyExceptions: Array<{
    code: string;
    title: string;
    description: string;
    severity: 'High' | 'Critical';
    isOverridden: boolean;
    overrideReason?: string;
  }>;
  conditions: Array<{
    id: string;
    type: 'Precedent' | 'Subsequent';
    description: string;
    owner: string;
    dueDate: string;
    isMandatory: boolean;
    status: 'Open' | 'Closed' | 'Waived';
  }>;
  decisionStatus: 'PENDING_DECISION' | 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED';
  approvalAuthorityLevel: string;
  approvalQuorum: string[];
  decisionNotes?: string;
  recordedBy?: string;
  recordedAt?: string;
}
