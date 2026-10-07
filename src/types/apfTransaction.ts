// Central Type Definitions for PROVAL APF Real-Time Transaction Workflow

import { BankValuationReportData } from './valuationCatalogue';
export type { BankValuationReportData };

export type UserRole =
  | 'CPA'
  | 'INTERNAL_VALUER'
  | 'EXTERNAL_VALUER'
  | 'COM'
  | 'ACOM'
  | 'RCOM'
  | 'ZCOM'
  | 'NCOM'
  | 'APPROVER'
  | 'COMMITTEE'
  | 'LEGAL'
  | 'INTERNAL_LEGAL'
  | 'EXTERNAL_LEGAL_ADVOCATE'
  | 'EXTERNAL_LEGAL_FIRM_ADMIN'
  | 'EXTERNAL_LEGAL_FIRM_USER'
  | 'BILLING_MAKER'
  | 'BILLING_CHECKER'
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
  vendorId?: string;
  firmName?: string;
  empanelmentNumber?: string;
  empanelmentStatus?: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  barCouncilNumber?: string;
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

// Master Maker-Checker Approval Status
export type MasterApprovalStatus = 'APPROVED' | 'PENDING_MASTER_APPROVAL' | 'REJECTED';

// Detailed Sub-entities for Masters
export interface PromoterItem {
  id: string;
  name: string;
  din?: string;
  pan?: string;
  designation: string;
  shareholdingPct: number;
  netWorthCr?: number;
  experienceYears?: number;
  relatedEntity?: string;
  status: 'Active' | 'Resigned';
}

export interface FinancialYearRow {
  fy: string; // e.g. 'FY 2024-25'
  turnoverCr: number;
  ebitdaCr: number;
  patCr: number;
  netWorthCr: number;
  totalDebtCr: number;
  securedDebtCr: number;
  unsecuredDebtCr: number;
  currentRatio: number;
  debtEquityRatio: number;
  dscr: number;
  auditorName: string;
  hasAuditQualification: boolean;
  documentRef?: string;
}

export interface BankingRelationshipRow {
  id: string;
  lender: string;
  facilityType: 'Term Loan' | 'Working Capital' | 'Construction Finance' | 'Overdraft' | 'NCD';
  sanctionedAmountCr: number;
  outstandingAmountCr: number;
  security: string;
  startDate: string;
  maturityDate: string;
  source: 'MCA Charges' | 'CIBIL Commercial' | 'Bank Direct' | 'CRILC';
  asOfDate: string;
}

export interface ReraRegistrationItem {
  id: string;
  reraNumber: string;
  registrationDate: string;
  expiryDate: string;
  status: 'Active' | 'Revoked' | 'Extended' | 'Completed';
  phaseName: string;
  reraUrl?: string;
  promoterNameAsPerRera?: string;
}

export interface StatutoryApprovalItem {
  id: string;
  approvalType:
    | 'Sanction Plan'
    | 'Commencement Certificate'
    | 'Environment Clearance'
    | 'Fire NOC'
    | 'Airport NOC'
    | 'Municipal Approval'
    | 'Water Approval'
    | 'Electricity Approval'
    | 'OC / Part OC'
    | 'Other';
  documentNumber: string;
  issueDate: string;
  validityDate: string;
  issuingAuthority: string;
  status: 'Approved' | 'In Progress' | 'Exempted' | 'Expired';
  remarks?: string;
}

export interface TowerConfigurationRow {
  id: string;
  configuration: '1 BHK' | '2 BHK' | '2.5 BHK' | '3 BHK' | '4 BHK' | 'Penthouse' | 'Retail / Commercial';
  carpetAreaSqFt: number;
  builtUpAreaSqFt: number;
  saleableAreaSqFt: number;
  numberOfUnits: number;
  builderQuotedRateSqFt: number;
  apfRecommendedRateSqFt: number;
}

// Master Audit Event Log
export interface MasterAuditLog {
  id: string;
  entityType: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER' | 'UNIT';
  entityId: string;
  entityName?: string;
  action: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'APPROVE' | 'REJECT';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  reason?: string;
  approvalStatus?: MasterApprovalStatus;
}

// Central Master Data Models
export interface BuilderMaster {
  id: string; // e.g. BLD-PUN-001
  legalName: string;
  tradeName?: string;
  groupName: string;
  establishedYear: number;
  entityType?: 'Private Limited' | 'Public Limited' | 'LLP' | 'Partnership' | 'Sole Proprietorship';
  incorporationDate?: string;
  yearsInBusiness?: number;
  registeredAddress?: string;
  corporateAddress?: string;
  city: 'Pune' | 'Mumbai';
  state?: string;
  pincode?: string;
  country?: string;
  website?: string;
  isListed?: boolean;
  stockSymbol?: string;
  totalExposureCr?: number;

  // Registration & KYC
  pan: string;
  cin: string;
  gst: string;
  reraPromoterRegNo?: string;
  lei?: string;
  udyamMsme?: string;
  kycVerificationStatus?: 'Verified' | 'Pending' | 'Rejected';
  kycVerifiedDate?: string;

  // Contacts
  primaryContactName?: string;
  primaryContactDesignation?: string;
  primaryContactMobile?: string;
  primaryContactEmail?: string;
  financeContact?: string;
  legalContact?: string;

  // Promoters & Directors
  promoters: string[]; // string list for compatibility
  promoterList?: PromoterItem[];

  // Profile & Track record
  totalProjectsCompleted: number;
  totalOngoingProjects: number;
  delayedProjects?: number;
  cancelledProjects?: number;
  deliveredAreaMnSqFt?: number;
  operatingCities?: string[];
  segments?: ('Affordable' | 'Mid' | 'Premium' | 'Luxury' | 'Mixed Use')[];

  // Financials & Banking
  financialHistory?: FinancialYearRow[];
  bankingRelationships?: BankingRelationshipRow[];

  // Risk & Compliance
  internalRiskGrade?: 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'BBB' | 'Below Investment Grade';
  creditBureauStatus?: 'Clean' | 'Minor Delinquency' | 'SMA-0' | 'SMA-1' | 'SMA-2' | 'Defaulter';
  wilfulDefaulterFlag?: boolean;
  npaSmaIndicator?: boolean;
  ncltIndicator?: boolean;
  litigationIndicator?: boolean;
  regulatoryActionFlag?: boolean;
  blacklistFlag?: boolean;
  blacklistReason?: string;
  riskRemarks?: string;

  // Documents
  documentChecklist?: {
    panVerified: boolean;
    cinVerified: boolean;
    gstVerified: boolean;
    reraVerified: boolean;
    auditedFinancialsUploaded: boolean;
    groupStructureChartUploaded: boolean;
    promoterKycUploaded: boolean;
  };

  // System & Metadata
  isActive?: boolean;
  approvalStatus?: MasterApprovalStatus;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  sourceUrl: string;
}

export interface ProjectMaster {
  id: string; // e.g. PRJ-PUN-001
  builderId: string;
  projectName: string;
  marketingName?: string;
  projectType: 'Residential Township' | 'High-Rise Luxury' | 'Mid-Segment Residential' | 'Integrated Development';
  projectSegment?: 'Affordable' | 'Mid-Market' | 'Premium' | 'Ultra Luxury' | 'Commercial';
  projectStatus?: 'Under Construction' | 'Advanced Stage' | 'Newly Launched' | 'Partially Delivered' | 'Completed';

  // RERA
  reraNumbers: string[]; // string array for compatibility
  reraRegistrations?: ReraRegistrationItem[];

  // Location / Geography
  locality: string;
  city: 'Pune' | 'Mumbai';
  district?: string;
  state?: string;
  pincode?: string;
  address: string;
  landmark?: string;
  latLong: { lat: number; lng: number };
  geofenceRadiusMeters?: number;
  zoneRegionBranch?: string;

  // Land & Title
  surveyNumber?: string;
  ctsNumber?: string;
  gatNumber?: string;
  plotNumber?: string;
  totalLandAreaAcres: number;
  landOwnershipType?: 'Freehold' | 'Leasehold' | 'Joint Development Agreement' | 'Development Rights';
  jointDevelopmentFlag?: boolean;
  landOwnerName?: string;
  encumbranceFlag?: boolean;
  existingMortgageChargeFlag?: boolean;

  // Project Size
  developmentAreaSqFt?: number;
  saleableAreaSqFt?: number;
  carpetAreaSqFt?: number;
  totalSanctionedTowers?: number;
  totalUnitsCount?: number;
  commercialUnitsCount?: number;
  parkingCount?: number;

  // Construction Details
  constructionStartDate?: string;
  expectedCompletionDate?: string;
  currentProgressPct?: number;
  constructionStage?: string;
  generalContractor?: string;
  architect?: string;
  structuralConsultant?: string;
  pmcAgency?: string;
  siteContactName?: string;
  siteContactPhone?: string;

  // Statutory Approvals
  statutoryApprovals?: StatutoryApprovalItem[];

  // Project Financials
  estimatedProjectCostCr?: number;
  landCostCr?: number;
  constructionCostCr?: number;
  promoterContributionCr?: number;
  debtFundingCr?: number;
  customerAdvancesCr?: number;
  currentProjectDebtCr?: number;
  escrowReraBank?: string;
  escrowAccountNumber?: string;
  projectFinanceLenders?: string[];

  // Sales & Inventory
  totalUnitsLaunched?: number;
  soldBookedUnits?: number;
  unsoldUnits?: number;
  cancelledUnits?: number;
  salesPct?: number;
  avgQuotedRateSqFt?: number;
  avgRealizedRateSqFt?: number;
  collectionPct?: number;
  inventoryValueCr?: number;

  // APF Status
  existingApfFlag?: boolean;
  existingApfNumber?: string;
  apfApprovalDate?: string;
  apfExpiryDate?: string;
  apfApprovedTowers?: string[];
  apfApprovedRateSqFt?: number;
  apfApprovedLtvPct?: number;
  apfSourcingStatus?: 'Active & Sourcing' | 'Restricted' | 'Suspended' | 'New Request';

  // System & Metadata
  isActive?: boolean;
  approvalStatus?: MasterApprovalStatus;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  publicStatus: string;
  sourceUrl: string;
  sourceQuality: string;
}

export interface PhaseMaster {
  id: string; // e.g. PHS-PUN-001-01
  projectId: string;
  phaseName: string;
  phaseNumber?: string;
  reraNumber: string;
  reraStartDate?: string;
  reraExpiryDate?: string;
  sanctionDate: string;
  expectedCompletionDate: string;
  phaseStatus?: 'Planning' | 'Under Construction' | 'Nearing Completion' | 'Ready with OC';
  phaseAreaSqFt?: number;
  numberOfTowers?: number;
  numberOfUnits?: number;
  launchDate?: string;
  currentProgressPct?: number;
  remarks?: string;

  // System & Metadata
  isActive?: boolean;
  approvalStatus?: MasterApprovalStatus;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TowerMaster {
  id: string; // e.g. TWR-PUN-001-E
  phaseId: string;
  projectId: string;
  towerName: string;
  towerCode?: string;
  buildingNumber?: string;
  wing?: string;
  reraTowerReference?: string;

  // Structure
  towerType?: 'Residential' | 'Commercial' | 'Mixed';
  basementCount?: number;
  podiumCount?: number;
  hasGroundFloor?: boolean;
  habitableFloors?: number;
  refugeFloors?: number;
  floorsSanctioned: number;
  floorsConstructed: number;
  slabsCompleted: number;
  totalUnits: number;
  unitsPerFloor?: number;
  passengerLifts?: number;
  serviceLifts?: number;
  staircases?: number;

  // Construction
  constructionStage: string;
  physicalProgressPct: number;
  expectedProgressPct: number;
  foundationCompletionDate?: string;
  plinthCompletionDate?: string;
  structuralCompletionDate?: string;
  brickworkPct?: number;
  plasterPct?: number;
  mepPct?: number;
  finishingPct?: number;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  ocStatus?: 'Full OC' | 'Part OC' | 'Applied' | 'Not Applied';
  ocNumber?: string;
  ocDate?: string;

  // Configuration rows
  configurations?: TowerConfigurationRow[];

  // Pricing
  baseRateSqFt?: number;
  floorRisePerFloor?: number;
  preferredLocationCharges?: number;
  viewPremiumSqFt?: number;
  parkingChargesLakh?: number;
  amenitiesChargesLakh?: number;

  // Technical
  structureType?: string;
  foundationType?: 'Pile Foundation' | 'Raft Foundation' | 'Isolated Footing';
  constructionQualityGrade?: 'A+' | 'A' | 'B+' | 'B';
  fireSafetyStatus?: 'Compliant & Tested' | 'Under Installation' | 'Pending NOC';
  seismicZone?: 'Zone III' | 'Zone IV';
  structuralConsultant?: string;
  majorObservations?: string[];

  // Site Visit Summary
  lastVisitDate?: string;
  lastProgressPct?: number;
  lastValuerName?: string;
  lastGpsLocation?: { lat: number; lng: number };
  photoCount?: number;
  lastTechnicalGrade?: string;

  // System & Metadata
  isActive?: boolean;
  approvalStatus?: MasterApprovalStatus;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface UnitMaster {
  id: string; // e.g. UNT-PUN-001-E-101
  towerId: string;
  unitNumber: string;
  floorNumber: number;
  wing?: string;
  typology?: string; // e.g. '2 BHK' | '3 BHK'
  configuration?: string;
  carpetAreaSqFt: number;
  builtUpAreaSqFt?: number;
  saleableAreaSqFt?: number;
  balconyAreaSqFt?: number;
  terraceAreaSqFt?: number;
  facing?: 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West';
  viewType?: 'Clubhouse View' | 'Garden View' | 'Road View' | 'Internal Courtyard' | 'Hill View';
  parkingAllotted?: 'Covered Stilt' | 'Open' | 'Basement Level 1' | 'None';
  builderQuotedRateSqFt?: number;
  apfApprovedRateSqFt?: number;
  agreementValueLakh: number;
  status: 'Available' | 'Booked' | 'Funded' | 'Delinquent';
  customerLoanLinkedFlag?: boolean;
  borrowerName?: string;
  loanAccountNumber?: string;
  lenderName?: string;
  sanctionAmountLakh?: number;
  outstandingAmountLakh?: number;
  mortgageStatus?: 'Clean' | 'Mortgaged to Proval Bank' | 'External Mortgage' | 'NOC Required';
  duplicateFinanceAlert?: boolean;
  isSimulatedPocUnit: boolean;
  isActive?: boolean;
  floorSanctioned?: boolean;
  violationFlag?: boolean;
  violationRemarks?: string;
  apfDisbursementStatus?: 'Eligible' | 'Ineligible';
  version?: number;
  approvalStatus?: MasterApprovalStatus;
}

export interface MasterApprovalItem {
  id: string;
  entityType: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER';
  entityId: string;
  entityName: string;
  name?: string;
  parentInfo?: string;
  changeSummary?: string;
  summary?: string;
  submittedBy?: string;
  createdBy?: string;
  submittedAt?: string;
  createdAt?: string;
  version?: number;
}

export interface ValuerPinnedLocation {
  lat: number;
  lng: number;
  pinnedAt: string;
  pinnedBy: string;
  pinnedByRole?: UserRole;
  accuracyMeters: number;
  address?: string;
  distanceFromProjectMeters?: number;
  isInsideGeofence: boolean;
  notes?: string;
}

export interface GeofenceBreachAlert {
  id: string;
  attemptedAt: string;
  attemptedBy: string;
  attemptedRole: UserRole;
  attemptedLat: number;
  attemptedLng: number;
  distanceFromProjectMeters: number;
  projectAddress: string;
  projectLat: number;
  projectLng: number;
  attemptedAddress?: string;
  status: 'ACTIVE_ALERT' | 'REVIEWED_BY_COM' | 'EXCEPTION_OVERRIDDEN' | 'DISMISSED';
  alertedRoles: readonly ('CPA' | 'COM' | 'ACOM' | 'APPROVER')[] | ('CPA' | 'COM' | 'ACOM' | 'APPROVER')[];
  reasonNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
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
  pinnedLocation?: ValuerPinnedLocation;
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
  bankValuationReport?: BankValuationReportData;
  detailedValuationReport?: BankValuationReportData;
  exposureSnapshot?: ExposureSnapshot;
  cpaReviewNotes?: string;
  comReviewNotes?: string;
  approvalDecision?: ApprovalDecisionData;
  losPayload?: LOSOutboundPayload;
  losResponse?: LOSResponseData;
  latestGeofenceBreach?: GeofenceBreachAlert;
  geofenceBreachAlerts?: GeofenceBreachAlert[];
  auditTrail: AuditEventItem[];
}
