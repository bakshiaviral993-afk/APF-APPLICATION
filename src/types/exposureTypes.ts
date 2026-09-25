// Bank-Grade Builder Exposure Types & Taxonomy per RBI Guidance & PROVAL Architecture

export type ExposureSourceType =
  | 'INTERNAL_CBS'
  | 'CRILC'
  | 'CIC'
  | 'NESL'
  | 'BORROWER_DECLARATION'
  | 'MCA_CHARGES'
  | 'AUDITED_FINANCIALS'
  | 'SANCTION_LETTER'
  | 'BANK_STATEMENT'
  | 'CERSAI'
  | 'RERA'
  | 'CREDIT_RATING';

export type ExposureBucketCategory =
  | 'DIRECT_BUILDER'
  | 'NON_FUND'
  | 'PROJECT_FINANCE'
  | 'GROUP'
  | 'EXISTING_APF'
  | 'RETAIL_PROJECT'
  | 'PIPELINE'
  | 'SECURITY'
  | 'GEOGRAPHY_CONCENTRATION'
  | 'ECOSYSTEM_RISK_FOOTPRINT';

export type ReconciliationStatus =
  | 'MATCHED'
  | 'PARTIAL_MATCH'
  | 'DECLARED_ONLY'
  | 'DISCOVERED_NOT_DECLARED'
  | 'STALE'
  | 'CONFLICT'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED';

export interface LenderFacilityDetail {
  facilityId: string;
  facilityName: string;
  facilityType: string;
  borrowerEntity: string;
  borrowerPan: string;
  mappedProject?: string;
  sanctionedLimitCr: number;
  currentOutstandingCr: number;
  undrawnAmountCr?: number;
  nonFundLimitCr?: number;
  securityDescription: string;
  mortgageRanking?: 'Exclusive First Charge' | 'Pari-Passu Charge' | 'Subordinate Charge' | 'Unsecured';
  escrowLien?: boolean;
  sanctionLetterRef?: string;
  sanctionDate?: string;
  maturityDate?: string;
  interestRate?: string;
  repaymentTrack?: 'Regular (Standard)' | 'SMA-0' | 'SMA-1' | 'SMA-2' | 'NPA' | 'Clean Track 24M';
  covenants?: string[];
  chargeStatus?: 'Registered in MCA' | 'Satisfaction Pending' | 'No Charge Filed' | 'Satisfied';
  mcaChargeId?: string;
  primarySource: ExposureSourceType;
  sourceLabel: string;
  asOfDate: string;
  verificationStatus: ReconciliationStatus;
  isPublicRatingEvidence?: boolean;
  isSimulatedBankData?: boolean;
  reviewerNotes?: string;
}

export interface LenderExposureGroup {
  lenderId: string;
  lenderName: string;
  institutionType: 'Public Sector Bank' | 'Private Bank' | 'Foreign Bank' | 'NBFC / HFC' | 'AIFI';
  totalSanctionedCr: number;
  totalOutstandingCr: number;
  totalNonFundCr: number;
  facilityCount: number;
  overallStatus: ReconciliationStatus;
  primarySecurity: string;
  lastVerificationDate: string;
  facilities: LenderFacilityDetail[];
}

export interface MCAChargeRecord {
  chargeId: string;
  chargeHolder: string;
  amountSecuredCr: number;
  propertyDescription: string;
  dateCreated: string;
  dateModified?: string;
  dateSatisfied?: string;
  satisfactionStatus: 'Active / Open' | 'Satisfied' | 'Under Modification';
  cersaiRef?: string;
  borrowerEntity: string;
  mappedLenderId?: string;
}

export interface PublicCreditRatingEvidence {
  ratingAgency: 'CRISIL' | 'ICRA' | 'CARE' | 'India Ratings';
  rationaleDate: string;
  entityName: string;
  ratedBankLoanFacilitiesCr: number;
  fundBasedCr: number;
  nonFundBasedCr: number;
  ratingGrade: string;
  outlook: 'Stable' | 'Positive' | 'Negative';
  publicLenderAnnexure: {
    lenderName: string;
    facilityType: string;
    ratedLimitCr: number;
  }[];
  regulatoryCaveat: string;
}

export interface ProjectTowerExposureSummary {
  towerId: string;
  towerName: string;
  floorsSanctioned: number;
  physicalProgressPct: number;
  totalUnits: number;
  retailLoansCount: number;
  retailSanctionedCr: number;
  retailDisbursedCr: number;
  retailOutstandingCr: number;
  adoptedValuationRateSqFt: number;
  constructionStage: string;
}

export interface ProjectExposure360Data {
  projectId: string;
  projectName: string;
  builderName: string;
  builderId: string;
  reraNumbers: string[];
  phases: string[];
  city: string;
  locality: string;
  constructionStage: string;
  projectFinanceDebt: {
    lenderName: string;
    facilityType: string;
    sanctionedCr: number;
    outstandingCr: number;
    undrawnCr: number;
    security: string;
    escrowAccount: string;
    escrowBank: string;
    repaymentStatus: string;
  }[];
  retailConcentration: {
    activeLoanCount: number;
    totalSanctionedCr: number;
    totalDisbursedCr: number;
    totalOutstandingCr: number;
    averageLtvPct: number;
    delinquencyCount: number;
    delinquencyCr: number;
    pipelineCount: number;
    pipelineSanctionCr: number;
  };
  inventory: {
    totalUnits: number;
    soldBookedUnits: number;
    unsoldUnits: number;
    mortgagedUnits: number;
    bankFundedUnits: number;
  };
  towerBreakdown: ProjectTowerExposureSummary[];
  securityCharges: {
    chargeId: string;
    chargeHolder: string;
    securedAmountCr: number;
    status: string;
    scope: string;
  }[];
  valuationMetrics: {
    adoptedRateSqFt: number;
    fairMarketValueCr: number;
    realizableValueCr: number;
    distressValueCr: number;
    validityDate: string;
    technicalGrade: string;
  };
  riskIndicators: {
    constructionDelayMonths: number;
    legalExceptionsCount: number;
    valuationVariancePct: number;
    fundingStressBand: 'Low' | 'Moderate' | 'Elevated';
    ewsAlerts: string[];
  };
}

export interface RelationshipGraphNode {
  id: string;
  type: 'GROUP' | 'ENTITY' | 'PROJECT' | 'LENDER' | 'FACILITY' | 'RETAIL_POOL';
  label: string;
  subLabel?: string;
  amountCr?: number;
  status?: string;
  category?: string;
}

export interface RelationshipGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship:
    | 'PARENT_OF'
    | 'DEVELOPING'
    | 'FUNDED_BY'
    | 'PLEDGED_SECURITY'
    | 'GUARANTEED_BY'
    | 'RETAIL_FINANCED';
  details?: string;
}

export interface MultiSourceReconciliationRow {
  reconciliationId: string;
  facilityTitle: string;
  lenderName: string;
  borrowerEntity: string;
  facilityType: string;
  declaredByBorrowerCr: number | null;
  bureauReportedCr: number | null;
  mcaChargeAmountCr: number | null;
  auditedFinancialsCr: number | null;
  internalCbsCr: number | null;
  reconciledGoldenOutstandingCr: number;
  varianceCr: number;
  status: ReconciliationStatus;
  corroborationSourcesCount: number;
  isException: boolean;
  exceptionReason?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SourceFreshnessItem {
  sourceType: ExposureSourceType;
  sourceName: string;
  asOfDate: string;
  ageDays: number;
  status: 'FRESH' | 'EXPIRING_SOON' | 'STALE' | 'MISSING';
  verificationStatus: 'VERIFIED' | 'SELF_DECLARED' | 'UNVERIFIED' | 'SYSTEM_LINKED';
  keyContribution: string;
  limitationNote: string;
  recordCount: number;
}

export interface FrozenExposureSnapshot {
  snapshotId: string;
  caseId: string;
  builderId: string;
  builderName: string;
  projectId: string;
  projectName: string;
  frozenAt: string;
  frozenBy: string;
  frozenRole: string;
  decisionStage: 'VALUATION_SUBMISSION' | 'CPA_SUBMISSION' | 'COM_ENDORSEMENT' | 'COMMITTEE_APPROVAL';
  
  // Headline KPIs
  directSanctionedCr: number;
  directOutstandingCr: number;
  projectFinanceCr: number;
  groupExposureCr: number;
  existingApfExposureCr: number;
  retailLinkedOutstandingCr: number;
  retailPipelineCr: number;
  postApprovalExposureCr: number;
  groupCapCr: number;
  limitUtilizationPct: number;
  
  // Governance
  freshnessScoreDays: number;
  reconciledFacilitiesCount: number;
  pendingExceptionsCount: number;
  isImmutable: boolean;
}
