// Central Type Definitions for PROVAL APF Real-Time Transaction Workflow

export type UserRole =
  | 'CPA'
  | 'INTERNAL_VALUER'
  | 'EXTERNAL_VALUER'
  | 'COM'
  | 'APPROVER'
  | 'COMMITTEE'
  | 'ADMIN';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  agencyOrDept: string;
  email: string;
  avatarInitials: string;
}

export type CaseStatus =
  | 'DRAFT'
  | 'INITIATED'
  | 'ASSIGNED_TO_VALUER'
  | 'VALUER_ACCEPTED'
  | 'SITE_VISIT_IN_PROGRESS'
  | 'VALUATION_SUBMITTED'
  | 'VALUATION_REWORK'
  | 'COM_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CONDITIONAL_APPROVAL'
  | 'REJECTED'
  | 'DEFERRED'
  | 'SENT_TO_LOS'
  | 'LOS_ACKNOWLEDGED'
  | 'APF_ACTIVE';

// Central Master Data Models
export interface BuilderMaster {
  id: string; // e.g. BLD-PUN-001
  legalName: string;
  groupName: string;
  pan: string;
  cin: string;
  gst: string;
  city: 'Pune' | 'Mumbai';
  establishedYear: number;
  promoters: string[];
  totalProjectsCompleted: number;
  totalOngoingProjects: number;
  sourceUrl: string;
}

export interface ProjectMaster {
  id: string; // e.g. PRJ-PUN-001
  builderId: string;
  projectName: string;
  locality: string;
  city: 'Pune' | 'Mumbai';
  reraNumbers: string[];
  address: string;
  latLong: { lat: number; lng: number };
  projectType: 'Residential Township' | 'High-Rise Luxury' | 'Mid-Segment Residential' | 'Integrated Development';
  totalLandAreaAcres: number;
  publicStatus: string;
  sourceUrl: string;
  sourceQuality: string;
}

export interface PhaseMaster {
  id: string; // e.g. PHS-PUN-001-01
  projectId: string;
  phaseName: string;
  reraNumber: string;
  sanctionDate: string;
  expectedCompletionDate: string;
}

export interface TowerMaster {
  id: string; // e.g. TWR-PUN-001-E
  phaseId: string;
  projectId: string;
  towerName: string;
  floorsSanctioned: number;
  floorsConstructed: number;
  slabsCompleted: number;
  totalUnits: number;
  constructionStage: string;
  physicalProgressPct: number;
  expectedProgressPct: number;
}

export interface UnitMaster {
  id: string; // e.g. UNT-PUN-001-E-101
  towerId: string;
  unitNumber: string;
  floorNumber: number;
  typology: string; // e.g. '2 BHK' | '3 BHK'
  carpetAreaSqFt: number;
  agreementValueLakh: number;
  status: 'Available' | 'Booked' | 'Funded' | 'Delinquent';
  borrowerName?: string;
  loanAccountNumber?: string;
  isSimulatedPocUnit: boolean;
}

// Transaction Workflow Models
export interface ValuerAssignmentDetails {
  valuerType: 'Internal' | 'External' | 'Dual';
  assignedUserId: string;
  assignedUserName: string;
  vendorAgency: string;
  assignedAt: string;
  slaDueDate: string;
  scheduledVisitDate: string;
  scopeTowerIds: string[];
  scopeTowerNames: string[];
  instructions: string;
  siteContactName: string;
  siteContactPhone: string;
  conflictDeclared: boolean;
}

export interface SiteVisitEvidence {
  id: string;
  category: 'Entrance' | 'RERA Board' | 'Towers' | 'Construction' | 'Approach Road' | 'Surroundings';
  title: string;
  timestamp: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  isInsideGeofence: boolean;
  capturedBy: string;
  deviceSessionId: string;
  notes: string;
}

export interface MarketComparable {
  id: string;
  projectName: string;
  developer: string;
  distanceKm: string;
  configuration: string;
  carpetAreaSqFt: number;
  quotedRateSqFt: number;
  registeredRateSqFt: number;
  source: string;
  observationDate: string;
}

export interface ValuationReportData {
  reportVersion: string;
  reportHash: string;
  submittedAt: string;
  submittedBy: string;
  adoptedBaseRateSqFt: number;
  fairMarketValueCr: number;
  realizableValueCr: number;
  distressValueCr: number;
  recommendedApfRateSqFt: number;
  technicalGrade: string; // e.g. 'A+' | 'A' | 'B+'
  locationScore: number; // out of 5
  constructionScore: number;
  infrastructureScore: number;
  marketabilityScore: number;
  rateBand2BHK: string;
  rateBand3BHK: string;
  validityMonths: number;
  keyObservations: string[];
  valuerRecommendation: string;
  digitalSignature: string;
}

export interface ExposureBucketItem {
  category: string;
  sanctionedCr: number;
  outstandingCr: number;
  source: string;
  asOfDate: string;
  freshness: string;
  isReconciled: boolean;
  notes: string;
  isSimulatedBankData: boolean;
}

export interface ExposureSnapshot {
  snapshotId: string;
  generatedAt: string;
  directBuilderExposureCr: number;
  projectFinanceExposureCr: number;
  existingApfExposureCr: number;
  retailLinkedExposureCr: number;
  pipelineExposureCr: number;
  aggregateGroupExposureCr: number;
  groupSanctionLimitCr: number;
  groupHeadroomCr: number;
  builderConcentrationPct: number;
  cityConcentrationPct: number;
  buckets: ExposureBucketItem[];
}

export interface ApprovalConditionItem {
  id: string;
  conditionText: string;
  responsibleRole: string;
  dueDate: string;
  timing: 'Pre-Disbursement' | 'Post-Disbursement';
  isMandatory: boolean;
  status: 'Complied' | 'Pending Verification' | 'Waived';
}

export interface ApprovalDecisionData {
  decision: 'APPROVED' | 'CONDITIONAL_APPROVAL' | 'REJECTED' | 'DEFERRED';
  decidedBy: string;
  decidedRole: string;
  decidedAt: string;
  quorumCount: number;
  voters: string[];
  decisionNotes: string;
  conditions: ApprovalConditionItem[];
}

export interface LOSOutboundPayload {
  apfCaseId: string;
  apfNumber: string;
  builderId: string;
  builderLegalName: string;
  builderGroupId: string;
  projectId: string;
  projectName: string;
  reraNumbers: string[];
  approvedPhase: string;
  approvedTowers: string[];
  approvalStatus: string;
  approvalDate: string;
  expiryDate: string;
  technicalGrade: string;
  approvedValuationRate: number;
  rateMatrix: Record<string, string>;
  riskBand: string;
  approvalConditions: string[];
  exposureSnapshotId: string;
  documentRefs: string[];
  reportHash: string;
  payloadVersion: string;
  sourceSystem: string;
  idempotencyKey: string;
  sentBy: string;
  sentAt: string;
}

export interface LOSResponseData {
  status: 'SUCCESS' | 'FAILED';
  losApfId: string;
  acknowledgementId: string;
  message: string;
  receivedAt: string;
}

export interface AuditEventItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  priorStatus: CaseStatus;
  newStatus: CaseStatus;
  remarks: string;
  deviceInfo: string;
}

export interface APFCase {
  id: string; // e.g. APF-2026-0001
  apfNumber?: string;
  createdAt: string;
  createdBy: string;
  currentStatus: CaseStatus;
  currentOwnerRole: UserRole;
  currentOwnerName: string;
  slaDueDate: string;
  priority: 'High' | 'Standard' | 'Urgent';

  // Request details
  requestType: 'New APF' | 'Renewal' | 'Revaluation';
  businessUnit: string;
  branch: string;
  proposedExposureCr: number;
  requestedRetailSourcingLimitCr: number;

  // Master References (IDs)
  builderId: string;
  projectId: string;
  phaseId: string;
  selectedTowerIds: string[];

  // Sub-objects created during lifecycle
  valuerAssignment?: ValuerAssignmentDetails;
  siteVisitEvidence?: SiteVisitEvidence[];
  marketComparables?: MarketComparable[];
  valuationReport?: ValuationReportData;
  exposureSnapshot?: ExposureSnapshot;
  cpaReviewNotes?: string;
  comReviewNotes?: string;
  approvalDecision?: ApprovalDecisionData;
  losPayload?: LOSOutboundPayload;
  losResponse?: LOSResponseData;
  auditTrail: AuditEventItem[];
}
