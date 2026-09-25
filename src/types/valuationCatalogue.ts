/**
 * PROVAL APF - PROJECT TECHNICAL & VALUATION REPORT
 * Field Catalogue & Typed Data Model for Bank Due Diligence
 * Based on PROVAL_APF_Valuation_Report_Field_Catalogue.xlsx & Bank Report Template
 */

export interface TowerProgressRecord {
  towerId: string;
  towerName: string;
  sanctionedFloors: number;
  constructedFloors: number;
  slabsCompleted: number;
  constructionStage: string; // LOV
  physicalProgressPct: number;
  expectedProgressPct: number;
  delayVariancePct: number; // Derived: expectedProgressPct - physicalProgressPct
  labourPresence: string; // LOV
  materialAvailability: string; // LOV
  structuralWorkmanshipQuality: string; // LOV
  constructionQualityScore: number; // 1-5
  safetyHousekeeping: string; // LOV
  deviationObserved: string; // LOV (No | Minor | Material | Critical)
  deviationRemarks?: string;
  deviationPhotoUrl?: string;
  infrastructureReadiness: string; // LOV
  infrastructureScore: number; // 1-5
}

export interface ValuationComparableRecord {
  id: string;
  comparableProjectName: string;
  developer: string;
  distanceKm: number;
  projectStage: string; // LOV
  configuration: string; // LOV
  carpetAreaSqFt: number;
  quotedRateSqFt: number;
  supportedRateSqFt: number;
  rateSource: string; // LOV
  observationDate: string;
  locationAdjPct: number;
  stageAdjPct: number;
  amenitiesAdjPct: number;
  sizeAdjPct: number;
  adjustedComparableRate: number; // Derived
  adjustmentRationale?: string;
}

export interface RiskExceptionRecord {
  id: string;
  category: string; // LOV
  observation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  evidenceRef: string;
  mitigationCondition: string;
}

export interface ValuationPhotoEvidence {
  id: string;
  category: 'Project Entrance' | 'RERA Board' | 'Assigned Tower' | 'Construction Progress' | 'Approach Road' | 'Surroundings' | 'Amenities' | 'Deviation Evidence';
  towerId?: string;
  title: string;
  timestamp: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  isInsideGeofence: boolean;
  capturedBy: string;
  valuerId: string;
  deviceSessionId: string;
  notes: string;
  photoUrl?: string;
  evidenceId: string;
}

export interface BankValuationReportData {
  // 1. Report Header & Assignment
  caseId: string;
  valuationRequestId: string;
  requestType: string; // LOV
  valuerType: 'Internal' | 'External' | 'Dual';
  valuerName: string;
  valuerFirm: string;
  empanelmentNo: string;
  assignmentDate: string;
  slaDueDate: string;
  visitType: string; // LOV
  reportVersion: string; // e.g. "v1.0" or "v2.0 (Rework)"
  reportHash?: string;
  submittedAt?: string;
  submittedBy?: string;
  isLocked: boolean;

  // 2. Builder & Project Particulars
  builderId: string;
  builderLegalName: string;
  builderGroup: string;
  projectId: string;
  projectName: string;
  reraNumbers: string[];
  projectAddress: string;
  cityDistrictStatePin: string;
  projectType: string; // LOV
  projectSegment: string; // LOV
  assignedPhases: string[];
  assignedTowers: string[];

  // 3. Site Visit & Geo Verification
  visitStartDateTime: string;
  visitEndDateTime: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  geofenceResult: 'Inside' | 'Outside' | 'Unable to Validate';
  outsideGeofenceReason?: string;
  outsideGeofencePhotoRef?: string;
  siteAddressMatch: 'Match' | 'Minor Variation' | 'Major Variation';
  addressMatchRemarks?: string;
  siteBoundaryVerified: 'Yes' | 'No' | 'Partially';
  boundaryRemarks?: string;
  siteVisitRemarks: string;
  deviceSessionId: string;

  // 4. Land & Location Assessment
  surveyCtsPlotNo: string;
  landArea: number;
  landAreaUnit: 'Sq.m' | 'Sq.ft' | 'Acre' | 'Hectare';
  ownershipType: string; // LOV
  possessionStatus: string; // LOV
  localityClassification: string; // LOV
  approachRoadWidthMeters: number;
  approachRoadCondition: string; // LOV
  connectivity: string; // LOV
  neighbourhoodLandUse: string; // LOV
  locationScore: number; // 1-5

  // 5. Statutory / Project Approvals
  reraStatus: string; // LOV
  reraRef: string;
  sanctionedPlanStatus: string; // LOV
  sanctionedPlanRef: string;
  commencementCertStatus: string; // LOV
  commencementCertRef: string;
  ocStatus: string; // LOV
  ocRef: string;
  environmentClearanceStatus: string; // LOV
  environmentClearanceRef: string;
  fireApprovalStatus: string; // LOV
  fireApprovalRef: string;
  majorApprovalException: string; // LOV (None | Minor | Material | Critical)
  approvalRemarks: string;

  // 6. Tower-wise Construction Progress
  towersProgress: TowerProgressRecord[];

  // 7. Technical Quality & Infrastructure
  structuralWorkmanshipQuality: string; // LOV
  workmanshipRemarks: string;
  constructionQualityScore: number; // 1-5
  safetyHousekeeping: string; // LOV
  safetyRemarks: string;
  deviationObserved: string; // LOV
  deviationRemarks: string;
  infrastructureReadiness: string; // LOV
  infraScore: number; // 1-5
  infraRemarks: string;
  labourPresence: string; // LOV
  materialAvailability: string; // LOV
  executionRemarks: string;

  // 8. Marketability & Demand
  demandLevel: string; // LOV
  demandRemarks: string;
  competitionIntensity: string; // LOV
  competitionRemarks: string;
  salesVelocity: string; // LOV
  salesRemarks: string;
  inventoryPosition: string; // LOV
  inventoryRemarks: string;
  marketabilityRating: string; // LOV
  marketabilityScore: number; // 1-5

  // 9. Comparable Market Evidence
  comparables: ValuationComparableRecord[];

  // 10. Valuation Methodology
  primaryMethod: string; // LOV
  secondaryMethod: string; // LOV
  methodologyRationale: string;
  factorsIncreasingValue: string[]; // Multi-select
  factorsReducingValue: string[]; // Multi-select

  // 11. Valuation Summary
  builderQuotedBaseRate: number;
  observedMarketRateLow: number;
  observedMarketRateHigh: number;
  adoptedBaseRate: number;
  floorRiseApplicable: 'Yes' | 'No';
  floorRiseRate: number;
  plcApplicable: 'Yes' | 'No';
  plcPremium: number;
  totalSaleableAreaSqFt?: number;
  landCostCr?: number;
  constructionCostCr?: number;
  inventoryValueCr?: number;
  marketValueCr: number;
  realizableValueCr: number;
  distressValueCr: number;
  recommendedApfRate: number;
  valuationValidity: string; // LOV

  // 12. Technical Score, Grade & Recommendation
  finalTechnicalScore: number; // out of 100 or 5.0
  technicalGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  valuationDecision: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended' | 'Refer / Escalate';

  // 13. Risks, Exceptions & Conditions
  risks: RiskExceptionRecord[];
  conditions: string[];

  // 14. Valuer Recommendation & Declaration
  valuerRecommendation: string;
  declarationSiteVisitConfirmed: boolean;
  declarationTrueEvidenceConfirmed: boolean;
  digitalSignature: string;

  // 15. Photographic Annexure
  photos: ValuationPhotoEvidence[];

  // Rework / Audit metadata
  reworkNotesFromCpa?: string;
  isReworkVersion?: boolean;
}
