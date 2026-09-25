// Bank-Grade Builder & Project Exposure Types for PROVAL APF
// Reference: PROVAL_APF_10_Builder_Simulated_Exposure_Dataset & PROVAL_APF_Exposure_API_Demo_Response

export type ExposureFreshnessType =
  | 'LIVE'
  | 'NEAR REAL TIME'
  | 'AS-OF'
  | 'PUBLIC DISCLOSURE'
  | 'SIMULATED POC DATA'
  | 'NOT CONNECTED';

export type ExposureFetchStatus = 'FETCHED' | 'DEMO CONNECTED' | 'NOT CONNECTED' | 'FAILED';

export type DemoReconciliationStatus =
  | 'MATCHED'
  | 'PARTIAL MATCH'
  | 'DISCOVERED NOT DECLARED'
  | 'DECLARED ONLY'
  | 'STALE'
  | 'CONFLICT'
  | 'REVIEW REQUIRED'
  | 'VERIFIED';

export type ExposureRiskBand = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BuilderExposureSummary {
  builderId: string;
  builderName: string;
  city: string;
  directSanctionedCr: number;
  directOutstandingCr: number;
  nonFundCr: number;
  projectFinanceCr: number;
  existingApfCr: number;
  retailLinkedOutstandingCr: number;
  retailPipelineCr: number;
  groupExposureCr: number;
  proposedApfCr: number;
  postApprovalGroupExposureCr: number;
  limitCr: number;
  limitUtilizationPct: number;
  riskBand: ExposureRiskBand;
  pocLabel: 'SIMULATED POC DATA';
  lastRefresh?: string;
}

export interface DemoLenderFacility {
  facilityId: string;
  builderId: string;
  builderName: string;
  lender: string;
  facilityType: string;
  projectId: string | null;
  projectName?: string | null;
  sanctionCr: number;
  outstandingCr: number;
  undrawnCr: number;
  nonFundCr: number;
  security: string;
  source: string;
  asOf: string;
  pocLabel: 'SIMULATED POC DATA';
  status: DemoReconciliationStatus;
  borrowerEntity?: string;
}

export interface DemoProjectExposure {
  projectId: string;
  builderId: string;
  builderName: string;
  projectName: string;
  city: string;
  rera: string;
  towers: string[];
  projectFinanceSanctionCr: number;
  projectFinanceOutstandingCr: number;
  retailLoanCount: number;
  retailSanctionedCr: number;
  retailOutstandingCr: number;
  retailPipelineCr: number;
  constructionPct: number;
  valuationRatePsf: number;
  riskBand: ExposureRiskBand;
  pocLabel: 'SIMULATED POC DATA';
}

export interface DemoGroupEntity {
  entityId: string;
  builderId: string;
  builderName: string;
  entityName: string;
  entityType: 'Operating Company' | 'Project SPV' | 'Related Entity';
  linkedProjectId?: string;
  exposureCr: number;
  pocLabel: 'SIMULATED POC DATA';
}

export interface DemoSourceFetchStatus {
  source: string;
  status: ExposureFetchStatus;
  freshness: ExposureFreshnessType;
  asOf: string;
  message: string;
  lastFetchTime?: string;
}

export interface DemoReconciliationItem {
  id: string;
  builderId: string;
  builderName: string;
  exposureType: string;
  sourceA: string;
  valueA: number;
  sourceB: string;
  valueB: number;
  varianceCr: number;
  status: DemoReconciliationStatus;
  reason: string;
  pocLabel: 'SIMULATED POC DATA';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface BuilderExposureResponse {
  mode: 'DEMO';
  label: 'SIMULATED POC DATA';
  builderId: string;
  builderName: string;
  fetchedAt: string;
  summary: BuilderExposureSummary;
  facilities: DemoLenderFacility[];
  projects: DemoProjectExposure[];
  sources: DemoSourceFetchStatus[];
  reconciliation: DemoReconciliationItem[];
  groupEntities: DemoGroupEntity[];
}

export interface ExposureSnapshot {
  snapshotId: string;
  builderId: string;
  builderName: string;
  apfCaseId?: string;
  fetchDate: string;
  directSanctionedCr: number;
  directOutstandingCr: number;
  nonFundCr: number;
  projectFinanceCr: number;
  existingApfCr: number;
  retailLinkedOutstandingCr: number;
  retailPipelineCr: number;
  groupExposureCr: number;
  proposedApfCr: number;
  postApprovalExposureCr: number;
  limitCr: number;
  limitUtilizationPct: number;
  riskBand: string;
  sourceCount: number;
  reconciliationExceptionCount: number;
  createdBy: string;
  createdAt: string;
  pocLabel: 'SIMULATED POC DATA';
  isFrozen: boolean;
}

export interface ExposureService {
  fetchBuilderExposure(builderId: string): Promise<BuilderExposureResponse>;
  getExposureSnapshot(snapshotId: string): Promise<ExposureSnapshot | undefined>;
  getLenderExposure(builderId: string): Promise<DemoLenderFacility[]>;
  getProjectExposure(builderId: string): Promise<DemoProjectExposure[]>;
  getReconciliation(builderId: string): Promise<DemoReconciliationItem[]>;
  getGroupExposure(builderId: string): Promise<DemoGroupEntity[]>;
}
