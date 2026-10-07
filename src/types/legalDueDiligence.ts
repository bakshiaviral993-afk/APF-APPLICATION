// Central TypeScript Definitions for PROVAL APF Legal Due Diligence Module
// Aligned with PROVAL APF Legal Field Catalogue & Bank Legal Due Diligence Report Template

export type LegalRoute = 'Internal Legal' | 'External Advocate' | 'Dual Legal Review';

export type LegalRequestType =
  | 'New APF'
  | 'Renewal'
  | 'Legal Revalidation'
  | 'Tower Addition'
  | 'Phase Addition'
  | 'Rework';

export type LegalScopeType =
  | 'Full Project'
  | 'Phase'
  | 'Tower'
  | 'Land Parcel'
  | 'Renewal Review';

export type LegalReviewStatus =
  | 'LEGAL_ASSIGNMENT_PENDING'
  | 'LEGAL_ASSIGNED'
  | 'LEGAL_ACCEPTED'
  | 'LEGAL_DECLINED'
  | 'LEGAL_REVIEW_IN_PROGRESS'
  | 'LEGAL_REPORT_DRAFT'
  | 'LEGAL_SUBMITTED'
  | 'LEGAL_REWORK'
  | 'LEGAL_CLEAR'
  | 'LEGAL_CONDITIONAL_CLEAR'
  | 'LEGAL_REJECTED'
  | 'LEGAL_ACCEPTED_BY_BANK'
  | 'BILLING_ELIGIBLE';

export type LegalInputSubStatus = 'NONE' | 'INPUT_REQUIRED' | 'INPUT_RECEIVED';

export type LegalDocumentStatus =
  | 'Available'
  | 'Missing'
  | 'Expired'
  | 'Not Applicable'
  | 'Clarification Required';

export type DocumentCategoryType =
  | 'Ownership'
  | 'Development Rights'
  | 'Search'
  | 'Encumbrance'
  | 'Approvals'
  | 'Authority';

export interface LegalDocumentItem {
  id: string;
  category: DocumentCategoryType;
  name: string;
  status: LegalDocumentStatus;
  documentRef?: string;
  documentDate?: string;
  uploadedBy?: string;
  source?: string;
  observation?: string;
  hasQueryRaised?: boolean;
}

export type TitleInstrumentType =
  | 'Sale Deed'
  | 'Conveyance'
  | 'Gift Deed'
  | 'Release Deed'
  | 'Partition Deed'
  | 'Lease Deed'
  | 'Development Agreement'
  | 'JDA'
  | 'POA'
  | 'Other';

export type TitleChainRowStatus =
  | 'Verified'
  | 'Verified with Observation'
  | 'Unverified'
  | 'Defective';

export interface TitleChainRow {
  id: string;
  seqNo: number;
  instrumentType: TitleInstrumentType;
  documentDate: string;
  registrationNumber: string;
  transferor: string;
  transferee: string;
  surveyRef: string;
  areaCovered: string;
  status: TitleChainRowStatus;
  observation: string;
}

export type TitleChainOverallStatus =
  | 'Complete'
  | 'Complete with Observation'
  | 'Gap Identified'
  | 'Defective'
  | 'Unable to Verify';

export type MatchCheckResult = 'Yes' | 'Minor Mismatch' | 'Material Mismatch' | 'Unable to Verify';
export type BoundaryMatchResult = 'Yes' | 'Partial' | 'No' | 'Unable to Verify';
export type OwnershipNatureType = 'Freehold' | 'Leasehold' | 'Development Rights' | 'Joint Development' | 'Other';
export type OwnershipVerifiedResult = 'Yes' | 'Yes with Condition' | 'No' | 'Unable to Verify';

export interface OwnershipVerificationData {
  currentLegalOwner: string;
  ownerMatchesLandRecord: 'Yes' | 'Yes with Observation' | 'No' | 'Unable to Verify';
  surveyMatch: MatchCheckResult;
  areaMatch: MatchCheckResult;
  boundaryMatch: BoundaryMatchResult;
  ownershipNature: OwnershipNatureType;
  ownershipVerified: OwnershipVerifiedResult;
  observation: string;
}

export type PoaStatusType = 'Valid' | 'Invalid' | 'Expired' | 'Revoked' | 'Not Applicable' | 'Not Verified';
export type RightStatusType = 'Clearly Granted' | 'Granted with Restriction' | 'Not Granted' | 'Not Verified';
export type LandownerConsentType = 'Available' | 'Conditional' | 'Pending' | 'Not Required' | 'Not Verified';
export type DevelopmentRightsStatusType =
  | 'Sufficient'
  | 'Sufficient with Conditions'
  | 'Restricted'
  | 'Expired'
  | 'Disputed'
  | 'Not Established';

export interface DevelopmentRightsData {
  daAvailable: 'Yes' | 'No' | 'Not Applicable' | 'Clarification Required';
  poaStatus: PoaStatusType;
  rightToConstruct: RightStatusType;
  rightToMarket: RightStatusType;
  rightToSellUnits: RightStatusType;
  rightToReceiveConsideration: RightStatusType;
  landownerConsentStatus: LandownerConsentType;
  developmentRightsStatus: DevelopmentRightsStatusType;
  summary: string;
}

export type EncumbranceType =
  | 'Mortgage'
  | 'Charge'
  | 'Lien'
  | 'Court Attachment'
  | 'Lease'
  | 'Agreement'
  | 'Third-party Right'
  | 'Other';

export type EncumbranceReleaseStatus =
  | 'Open'
  | 'Satisfied'
  | 'Partially Satisfied'
  | 'Release Pending'
  | 'NOC Available'
  | 'Not Verified';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface EncumbranceItem {
  id: string;
  type: EncumbranceType;
  chargeHolder: string;
  chargeAmountCr: number;
  creationDate: string;
  propertyAffected: string;
  releaseStatus: EncumbranceReleaseStatus;
  nocRequired: 'Yes' | 'No' | 'Conditional' | 'Not Verified';
  severity: SeverityLevel;
  sourceDoc?: string;
  reconciledWithExposure?: boolean;
}

export type LitigationCaseType =
  | 'Civil'
  | 'Criminal'
  | 'Consumer'
  | 'RERA'
  | 'NCLT'
  | 'Revenue'
  | 'Municipal'
  | 'Arbitration'
  | 'Other';

export type LitigationStatus =
  | 'Pending'
  | 'Stayed'
  | 'Disposed'
  | 'Dismissed'
  | 'Settled'
  | 'Appeal Pending'
  | 'Not Verified';

export type ProjectImpactType = 'None' | 'Limited' | 'Material' | 'Critical' | 'Not Assessed';

export interface LitigationItem {
  id: string;
  caseType: LitigationCaseType;
  court: string;
  caseNumber: string;
  parties: string;
  subject: string;
  currentStatus: LitigationStatus;
  projectImpact: ProjectImpactType;
  severity: SeverityLevel;
  nextHearingDate?: string;
  sourceDoc?: string;
}

export interface ReraApprovalConsistencyData {
  promoterNameMatch: MatchCheckResult;
  projectNameMatch: MatchCheckResult;
  landDetailsMatch: MatchCheckResult;
  phaseTowerScopeMatch: 'Yes' | 'Partial' | 'No' | 'Not Verified';
  reraLegalStatus: 'Clear' | 'Clear with Observation' | 'Expired' | 'Mismatch' | 'Suspended' | 'Not Verified';
  sanctionedPlanConsistent: 'Yes' | 'Yes with Observation' | 'No' | 'Not Verified';
  ccOcScopeConsistent: 'Yes' | 'Partial' | 'No' | 'Not Applicable' | 'Not Verified';
  observations?: string;
}

export type ExceptionCategory =
  | 'Ownership'
  | 'Title'
  | 'Development Rights'
  | 'Encumbrance'
  | 'Litigation'
  | 'RERA'
  | 'Approval'
  | 'Authority'
  | 'Document'
  | 'Other';

export type DueStageType =
  | 'Before Legal Clear'
  | 'Before Approval'
  | 'Pre-Disbursement'
  | 'Post-Disbursement'
  | 'Monitoring';

export type ExceptionStatusType =
  | 'Open'
  | 'Input Required'
  | 'Input Received'
  | 'Resolved'
  | 'Waived with Authority'
  | 'Closed';

export interface LegalExceptionItem {
  id: string;
  category: ExceptionCategory;
  observation: string;
  severity: SeverityLevel;
  blocking: boolean;
  requiredAction: string;
  owner: 'Builder' | 'CPA' | 'COM' | 'Legal' | 'Valuer' | 'Credit' | 'Other';
  dueStage: DueStageType;
  evidenceRef?: string;
  status: ExceptionStatusType;
}

export type ConditionType =
  | 'Pre-Approval'
  | 'Pre-Disbursement'
  | 'Post-Disbursement'
  | 'Monitoring';

export type ConditionStatusType =
  | 'Open'
  | 'Evidence Submitted'
  | 'Under Review'
  | 'Closed'
  | 'Waived with Authority';

export interface LegalConditionItem {
  id: string;
  conditionText: string;
  conditionType: ConditionType;
  owner: 'Builder' | 'CPA' | 'COM' | 'Legal' | 'Credit' | 'Operations' | 'Other';
  dueStage: ConditionType;
  dueDate: string;
  mandatoryOrAdvisory: 'Mandatory' | 'Advisory';
  status: ConditionStatusType;
  closureEvidence?: string;
}

export interface LegalScoreWeights {
  ownershipWeightPct: number; // default 25%
  titleChainWeightPct: number; // default 25%
  developmentRightsWeightPct: number; // default 20%
  encumbranceWeightPct: number; // default 15%
  litigationWeightPct: number; // default 10%
  approvalConsistencyWeightPct: number; // default 5%
}

export interface LegalScoreData {
  ownershipScore: number; // 0-100
  titleChainScore: number; // 0-100
  developmentRightsScore: number; // 0-100
  encumbranceScore: number; // 0-100
  litigationScore: number; // 0-100
  approvalConsistencyScore: number; // 0-100
  finalLegalScore: number; // 0-100 derived
  weights: LegalScoreWeights;
}

export type LegalOpinionType = 'Clear' | 'Conditional Clear' | 'Rejected' | 'Refer / Escalate';
export type LegalRiskBand = 'Low' | 'Medium' | 'High' | 'Critical';

export interface LegalOpinionData {
  opinion: LegalOpinionType;
  riskBand: LegalRiskBand;
  observations: string;
  recommendations: string;
  rejectionReason?: string;
  escalationReason?: string;
}

export interface LegalDeclarationData {
  documentsReviewedConfirmed: boolean;
  opinionBasedOnAvailableRecordsConfirmed: boolean;
  reviewerName: string;
  reviewerRole: string;
  reviewerFirm?: string;
  empanelmentNo?: string;
  digitalSignatureHash: string;
  submittedAt: string;
}

export interface LegalEvidenceRef {
  id: string;
  documentTitle: string;
  versionOrDate: string;
  reviewedBy: string;
  remarks: string;
}

// Full Structured Legal Due Diligence Report Entity
export interface LegalDueDiligenceReport {
  id: string; // e.g. LEG-REV-2026-001
  caseId: string;
  version: string; // e.g. "v1.0"
  reportDate: string;
  status: LegalReviewStatus;
  subStatus: LegalInputSubStatus;

  // Header & Assignment
  requestType: LegalRequestType;
  legalRoute: LegalRoute;
  reviewerName: string;
  reviewerFirm: string;
  empanelmentNo: string;
  assignmentDate: string;
  slaDueDate: string;
  scopeType: LegalScopeType;
  phasesUnderReview: string[];
  towersUnderReview: string[];

  // Builder & Project Particulars (Auto-populated from Master)
  builderLegalName: string;
  builderGroup: string;
  builderPanCinGstin: string;
  projectName: string;
  reraNumbers: string[];
  projectAddress: string;
  surveyPlotNumber: string;
  landArea: string;

  // Section 3: Document Checklist
  documentsExamined: LegalDocumentItem[];

  // Section 4: Land Particulars & Verification
  landParticulars: {
    surveyMatch: MatchCheckResult;
    areaMatch: MatchCheckResult;
    boundaryMatch: BoundaryMatchResult;
    ownershipNature: OwnershipNatureType;
    ownershipVerified: OwnershipVerifiedResult;
    observations: string;
  };

  // Section 5: Title Chain
  titleChainRows: TitleChainRow[];
  titleChainStatus: TitleChainOverallStatus;
  titleChainSummary: string;

  // Section 6: Ownership Verification
  ownershipVerification: OwnershipVerificationData;

  // Section 7: Development Rights
  developmentRights: DevelopmentRightsData;

  // Section 8: Encumbrance / Charges
  encumbrancePresent: 'No' | 'Yes' | 'Not Verified';
  encumbrances: EncumbranceItem[];
  encumbranceSummary: string;
  exposureReconciliationStatus: 'MATCHED' | 'DISCREPANCY_FOUND' | 'NO_LENDER_EXPOSURE';
  exposureReconciliationNotes?: string;

  // Section 9: Litigation
  litigationPresent: 'No' | 'Yes - Low Risk' | 'Yes - Material' | 'Yes - Critical' | 'Verification Pending';
  litigations: LitigationItem[];
  litigationSummary: string;

  // Section 10: RERA & Approval Verification
  reraApprovalConsistency: ReraApprovalConsistencyData;

  // Section 11: Legal Exceptions
  exceptions: LegalExceptionItem[];

  // Section 12: Legal Conditions
  conditions: LegalConditionItem[];

  // Section 13: Legal Score
  legalScore: LegalScoreData;

  // Section 14: Legal Opinion
  legalOpinion: LegalOpinionData;

  // Section 15: Legal Title & Asset Valuation Alignment
  valuationAlignment?: LegalValuationAlignmentData;

  // Section 16: Reviewer Declaration & Sign-off
  declaration: LegalDeclarationData;

  // Section 17: Document Annexure / Evidence References
  evidenceReferences: LegalEvidenceRef[];

  // Tamper-Proof Cryptographic Lock
  isLocked: boolean;
  reportHash?: string;
  signedCertificateId?: string;

  // Rework tracking
  reworkHistory?: {
    version: string;
    returnedBy: string;
    returnedAt: string;
    reworkReasons: string[];
  }[];
}

export interface LegalValuationAlignmentData {
  valuationRequestId: string;
  adoptedBaseRateSqFt: number; // e.g. 7200
  recommendedApfRateSqFt: number; // e.g. 7000
  fairMarketValueCr: number; // e.g. 244.80
  realizableValueCr: number; // e.g. 220.32
  distressValueCr: number; // e.g. 195.84
  totalConstructedAreaSqFt?: number; // e.g. 340000
  technicalGrade: string; // e.g. 'A' or 'A+'
  legalHaircutPct: number; // e.g. 0% for Clear, 5% for Conditional
  netClearedLoanableCr: number; // derived net loanable / collateral value
  mortgageabilityStatus: string; // e.g. 'Eligible for First Pari-Passu / Exclusive Charge'
  sarfaesiEnforceability: string; // e.g. 'Confirmed Enforceable'
  valuerName: string;
  valuerAgency: string;
  valuerRegNo: string;
  inspectionDate: string;
  valuationDecision: string; // 'Recommended' | 'Recommended with Conditions'
  valuationValidity: string; // '90 Days'
  geofenceVerified: boolean;
  digitalSignature?: string;
  reportHash?: string;
  rateBand2BHK?: string;
  rateBand3BHK?: string;
  keyObservations?: string[];
}

export interface LegalEmpanelmentItem {
  id: string;
  empanelmentNo: string;
  name: string;
  firmName: string;
  type: 'INTERNAL' | 'EXTERNAL';
  city: string;
  state: string;
  practiceAreas: string[];
  activeCasesCount: number;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE';
  vendorId?: string;
  pan?: string;
  gstin?: string;
  barRegistration?: string;
  advocateRoster?: {
    userId: string;
    name: string;
    role: string;
    barNumber: string;
    email: string;
    mobile: string;
    activeCount: number;
  }[];
}

// Conflict of Interest Declaration Status
export type ConflictDeclarationStatus = 'No Conflict' | 'Potential Conflict' | 'Conflict Exists';

export interface ConflictDeclarationData {
  status: ConflictDeclarationStatus;
  remarks?: string;
  declaredBy: string;
  declaredAt: string;
  firmName?: string;
  barRegistration?: string;
}

// Legal Assignment Entity for Internal and External Routing
export interface LegalAssignment {
  id: string; // e.g. "LEG-ASN-2026-001"
  reviewId: string; // e.g. "LEG-REV-2026-001"
  caseId: string;
  vendorId: string; // e.g. "VND-LEGAL-001"
  firmName: string;
  empanelmentNo: string;
  assignedUserId: string; // e.g. "legal.ext01"
  assignedUserName: string;
  allocatedBy?: string;
  legalRoute: LegalRoute;
  scopeType: LegalScopeType;
  landParcels: string[];
  phaseNames: string[];
  towerNames: string[];
  slaDays: number;
  assignedAt: string;
  slaDueDate: string;
  status:
    | 'LEGAL_ASSIGNED'
    | 'LEGAL_ACCEPTED'
    | 'LEGAL_DECLINED'
    | 'LEGAL_REVIEW_IN_PROGRESS'
    | 'LEGAL_REPORT_DRAFT'
    | 'LEGAL_SUBMITTED'
    | 'LEGAL_REWORK'
    | 'LEGAL_ACCEPTED_BY_BANK'
    | 'BILLING_ELIGIBLE';
  specialInstructions?: string;
  requiredSearches: string[];
  requiredDocuments: string[];
  conflictDeclaration?: ConflictDeclarationData;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  currentVersion: number;
  submittedAt?: string;
  reportHash?: string;
  reworkObservations?: string;
  reworkDueDate?: string;
  billingEventId?: string;
}

// Legal Query / Request Input Model
export type LegalQueryCategory =
  | 'Missing Certified Deed'
  | 'Latest Search Report'
  | 'Lender NOC'
  | 'Landowner Confirmation'
  | 'Revised RERA Document'
  | 'Clarification of Survey Number'
  | 'Authority Document'
  | 'Revenue Map Mismatch'
  | 'Other';

export type LegalQueryStatus =
  | 'OPEN'
  | 'INPUT_REQUIRED'
  | 'INPUT_RECEIVED'
  | 'UNDER_REVIEW'
  | 'CLOSED'
  | 'REOPENED'
  | 'OVERDUE';

export interface LegalQueryResponse {
  id: string;
  sender: string;
  senderRole: string;
  message: string;
  timestamp: string;
  attachmentName?: string;
}

export interface LegalQueryItem {
  id: string; // e.g. "LEG-QRY-001"
  caseId: string;
  reviewId: string;
  vendorId: string;
  category: LegalQueryCategory;
  subject: string;
  inputRequired: string;
  assignedTo: 'CPA' | 'COM' | 'Developer' | 'Legal Advocate';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  relatedLegalSection:
    | 'Title Chain'
    | 'Ownership'
    | 'Development Rights'
    | 'Encumbrance'
    | 'Litigation'
    | 'RERA'
    | 'Document Checklist'
    | 'Exceptions & Conditions';
  status: LegalQueryStatus;
  raisedBy: string;
  raisedByRole: string;
  raisedAt: string;
  attachmentName?: string;
  responses: LegalQueryResponse[];
  closedAt?: string;
}

// Document Access & Download Audit Entry
export interface LegalDocumentAuditEntry {
  id: string;
  documentId: string;
  documentName: string;
  caseId: string;
  userId: string;
  userName: string;
  vendorId: string;
  action: 'VIEW' | 'DOWNLOAD';
  timestamp: string;
}

// Dual Legal Review Variance Analysis
export interface DualLegalReviewVariance {
  caseId: string;
  internalReviewId: string;
  externalReviewId: string;
  internalReviewer: string;
  externalReviewer: string;
  titleMatch: boolean;
  ownershipMatch: boolean;
  devRightsMatch: boolean;
  encumbranceMatch: boolean;
  litigationMatch: boolean;
  internalScore: number;
  externalScore: number;
  scoreDifference: number;
  internalOpinion: string;
  externalOpinion: string;
  hasOpinionVariance: boolean;
  varianceReasons: string[];
}
