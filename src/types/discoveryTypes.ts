// Comprehensive Types for Intelligent Builder Discovery, Project/Tower Auto-Fetch & Exposure 360

export type DiscoverySourceType =
  // Public / Web Discoverable
  | 'MCA_MASTER'
  | 'MCA_CHARGES'
  | 'MAHA_RERA'
  | 'BUILDER_WEBSITE'
  | 'STOCK_EXCHANGE'
  | 'ANNUAL_REPORT'
  | 'RATING_AGENCY'
  | 'DEBT_DISCLOSURE'
  | 'REGULATORY_SOURCE'
  | 'WEB_SEARCH'
  // Restricted / Bank Authorized
  | 'CIC_BUREAU'
  | 'CRILC'
  | 'CERSAI'
  | 'INTERNAL_CBS'
  | 'LMS'
  | 'LOS'
  | 'EXISTING_APF'
  | 'BANK_DMS'
  | 'ACCOUNT_AGGREGATOR'
  | 'BORROWER_SANCTION'
  | 'BORROWER_DECLARATION';

export type FreshnessLabel =
  | 'LIVE'
  | 'NEAR_REAL_TIME'
  | 'AS_OF'
  | 'PUBLIC_DISCLOSURE'
  | 'NOT_CONNECTED'
  | 'SIMULATED_POC_DATA';

export type FetchJobStatus =
  | 'QUEUED'
  | 'SEARCHING'
  | 'FETCHING'
  | 'EXTRACTING'
  | 'MATCHING'
  | 'READY_FOR_REVIEW'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export interface SourceProgressItem {
  sourceType: DiscoverySourceType;
  sourceName: string;
  isRestricted: boolean;
  status: 'PENDING' | 'SEARCHING' | 'FETCHING' | 'COMPLETE' | 'NOT_CONNECTED' | 'FAILED';
  recordsFound: number;
  asOfDate?: string;
  durationMs?: number;
  notes?: string;
}

export interface FetchJob {
  jobId: string;
  targetType: 'BUILDER' | 'PROJECTS' | 'TOWERS' | 'EXPOSURE';
  targetId?: string;
  query: string;
  status: FetchJobStatus;
  progressPct: number;
  currentStepMessage: string;
  createdAt: string;
  completedAt?: string;
  sources: SourceProgressItem[];
}

export interface DiscoveredFieldProvenance<T = any> {
  fieldKey: string;
  label: string;
  value: T;
  originalValue?: T;
  editedValue?: T;
  sourceName: string;
  sourceType: DiscoverySourceType;
  sourceUrl?: string;
  documentId?: string;
  asOfDate: string;
  fetchTimestamp: string;
  confidence: number; // 0.0 - 1.0
  verificationStatus: 'VERIFIED' | 'PROPOSED' | 'EDITED' | 'REJECTED';
  decision: 'ACCEPT' | 'EDIT' | 'REJECT' | 'PENDING';
  freshness: FreshnessLabel;
  isEdited?: boolean;
}

export interface DuplicateBuilderMatch {
  isDuplicate: boolean;
  matchType: 'EXACT_PAN' | 'EXACT_CIN' | 'SIMILAR_NAME' | 'COMMON_PROMOTER';
  matchingField: string;
  matchedValue: string;
  existingBuilderId: string;
  existingBuilderName: string;
  message: string;
}

export interface DiscoveredBuilderData {
  id: string;
  legalName: string;
  tradeName: string;
  groupName: string;
  pan: string;
  cin: string;
  gst: string;
  reraPromoterName: string;
  sourceUrl: string;
  city: string;
  state: string;
  registeredAddress: string;
  establishedYear: number;
  entityType: string;
  promoters: string[];
  totalProjectsCompleted: number;
  totalOngoingProjects: number;
  netWorthCr?: number;
  turnoverCr?: number;
  fields: Record<string, DiscoveredFieldProvenance>;
  duplicateMatch?: DuplicateBuilderMatch;
  overallConfidence: number;
  fetchJobId: string;
}

export interface DiscoveredProjectData {
  id: string;
  builderId: string;
  projectName: string;
  reraNumber: string;
  reraNumbers: string[];
  promoterName: string;
  address: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latLong?: { lat: number; lng: number };
  registrationDate: string;
  completionDate: string;
  projectStatus: string;
  projectType: string;
  phaseName: string;
  totalTowers?: number;
  totalUnits?: number;
  constructionDetail?: string;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  confidence: number;
  selectedForImport: boolean;
  alreadyExists?: boolean;
  existingProjectId?: string;
}

export interface DiscoveredTowerData {
  towerId: string;
  projectId: string;
  phaseId?: string;
  towerName: string;
  buildingNumber?: string;
  wing?: string;
  floorsSanctioned: number;
  floorsConstructed: number;
  totalUnits: number;
  configuration: string;
  constructionStage: string;
  physicalProgressPct: number;
  ocStatus: 'Full OC Received' | 'Part OC Received' | 'Not Applied' | 'In Progress';
  expectedCompletion: string;
  isPartiallyAvailable: boolean; // Flagged if only tower count known, no fake names
  sourceRef: string;
  confidence: number;
}

export interface DiscoveredPhaseData {
  phaseId: string;
  projectId: string;
  phaseName: string;
  reraNumber: string;
  startDate: string;
  expectedCompletionDate: string;
  status: string;
  towers: DiscoveredTowerData[];
  towersCountDeclared: number;
  isPartiallyAvailable: boolean;
}

// Stage 9: Exposure Staging Model
export interface ExposureSourceRecord {
  sourceRecordId: string;
  builderId: string;
  borrowerEntityId: string;
  borrowerEntityName: string;
  borrowerPan?: string;
  sourceType: DiscoverySourceType;
  sourceName: string;
  externalReference?: string;
  lenderName: string;
  facilityType: string;
  sanctionLimitCr: number;
  outstandingCr: number;
  undrawnCr: number;
  nonFundAmountCr: number;
  security: string;
  projectReference?: string;
  chargeReference?: string;
  currency: string;
  asOfDate: string;
  fetchTimestamp: string;
  sourceUrl?: string;
  documentId?: string;
  confidence: number;
  verificationStatus: 'VERIFIED' | 'STAGED' | 'DISPUTED' | 'DUPLICATE' | 'EXCLUDED';
  freshness: FreshnessLabel;
  isRestricted: boolean;
  rawPayloadOrEvidence: string;
}

export interface RefreshDiffItem {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  source: string;
  asOf: string;
  decision: 'ACCEPT_CHANGE' | 'KEEP_CURRENT' | 'SEND_FOR_REVIEW';
}
