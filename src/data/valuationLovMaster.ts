/**
 * PROVAL APF - Bank Configurable LOV Master & Scoring Configuration
 * Source of truth: PROVAL_APF_Valuation_Report_Field_Catalogue.xlsx
 */

export interface LovOption {
  code: string;
  label: string;
  scoreWeight?: number;
  description?: string;
}

export const VALUATION_LOV_MASTER = {
  requestType: [
    { code: 'NEW_APF', label: 'New APF' },
    { code: 'RENEWAL', label: 'Renewal' },
    { code: 'REVALUATION', label: 'Revaluation' },
    { code: 'TOWER_ADDITION', label: 'Tower Addition' },
    { code: 'RATE_REVISION', label: 'Rate Revision' },
  ],

  valuerType: [
    { code: 'INTERNAL', label: 'Internal' },
    { code: 'EXTERNAL', label: 'External' },
    { code: 'DUAL', label: 'Dual' },
  ],

  visitType: [
    { code: 'INITIAL', label: 'Initial' },
    { code: 'REVISIT', label: 'Revisit' },
    { code: 'REWORK', label: 'Rework' },
    { code: 'RENEWAL_INSPECTION', label: 'Renewal Inspection' },
  ],

  projectType: [
    { code: 'RESIDENTIAL', label: 'Residential' },
    { code: 'COMMERCIAL', label: 'Commercial' },
    { code: 'MIXED_USE', label: 'Mixed Use' },
    { code: 'PLOTTED', label: 'Plotted' },
    { code: 'REDEVELOPMENT', label: 'Redevelopment' },
    { code: 'OTHER', label: 'Other' },
  ],

  projectSegment: [
    { code: 'AFFORDABLE', label: 'Affordable' },
    { code: 'MID', label: 'Mid' },
    { code: 'PREMIUM', label: 'Premium' },
    { code: 'LUXURY', label: 'Luxury' },
    { code: 'MIXED', label: 'Mixed' },
  ],

  geofenceResult: [
    { code: 'INSIDE', label: 'Inside' },
    { code: 'OUTSIDE', label: 'Outside' },
    { code: 'UNABLE_TO_VALIDATE', label: 'Unable to Validate' },
  ],

  siteAddressMatch: [
    { code: 'MATCH', label: 'Match' },
    { code: 'MINOR_VARIATION', label: 'Minor Variation' },
    { code: 'MAJOR_VARIATION', label: 'Major Variation' },
  ],

  siteBoundaryVerified: [
    { code: 'YES', label: 'Yes' },
    { code: 'NO', label: 'No' },
    { code: 'PARTIALLY', label: 'Partially' },
  ],

  landAreaUnit: [
    { code: 'SQ_M', label: 'Sq.m' },
    { code: 'SQ_FT', label: 'Sq.ft' },
    { code: 'ACRE', label: 'Acre' },
    { code: 'HECTARE', label: 'Hectare' },
  ],

  ownershipType: [
    { code: 'FREEHOLD', label: 'Freehold' },
    { code: 'LEASEHOLD', label: 'Leasehold' },
    { code: 'DEVELOPMENT_RIGHTS', label: 'Development Rights' },
    { code: 'JOINT_DEVELOPMENT', label: 'Joint Development' },
    { code: 'OTHER', label: 'Other' },
  ],

  possessionStatus: [
    { code: 'CLEAR', label: 'Clear' },
    { code: 'PARTIAL', label: 'Partial' },
    { code: 'DISPUTED', label: 'Disputed' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  localityClassification: [
    { code: 'PRIME', label: 'Prime' },
    { code: 'ESTABLISHED', label: 'Established' },
    { code: 'DEVELOPING', label: 'Developing' },
    { code: 'EMERGING', label: 'Emerging' },
    { code: 'REMOTE', label: 'Remote' },
  ],

  approachRoadCondition: [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Good' },
    { code: 'AVERAGE', label: 'Average' },
    { code: 'POOR', label: 'Poor' },
  ],

  connectivity: [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Good' },
    { code: 'AVERAGE', label: 'Average' },
    { code: 'POOR', label: 'Poor' },
  ],

  neighbourhoodLandUse: [
    { code: 'RESIDENTIAL', label: 'Residential' },
    { code: 'COMMERCIAL', label: 'Commercial' },
    { code: 'MIXED', label: 'Mixed' },
    { code: 'INDUSTRIAL', label: 'Industrial' },
    { code: 'INSTITUTIONAL', label: 'Institutional' },
    { code: 'OTHER', label: 'Other' },
  ],

  scoreOneToFive: [
    { code: '1', label: '1 - Poor' },
    { code: '2', label: '2 - Below Average' },
    { code: '3', label: '3 - Average' },
    { code: '4', label: '4 - Good' },
    { code: '5', label: '5 - Excellent' },
  ],

  reraStatus: [
    { code: 'VALID', label: 'Valid' },
    { code: 'EXPIRED', label: 'Expired' },
    { code: 'EXTENSION_APPLIED', label: 'Extension Applied' },
    { code: 'SUSPENDED', label: 'Suspended' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  sanctionedPlanAvailable: [
    { code: 'YES', label: 'Yes' },
    { code: 'NO', label: 'No' },
    { code: 'PARTIAL', label: 'Partial' },
  ],

  commencementCertStatus: [
    { code: 'AVAILABLE', label: 'Available' },
    { code: 'PARTIAL', label: 'Partial / Stage-wise' },
    { code: 'NOT_AVAILABLE', label: 'Not Available' },
    { code: 'NOT_APPLICABLE', label: 'Not Applicable' },
  ],

  ocStatus: [
    { code: 'OC_AVAILABLE', label: 'OC Available' },
    { code: 'PART_OC', label: 'Part OC' },
    { code: 'NOT_AVAILABLE', label: 'Not Available' },
    { code: 'NOT_APPLICABLE', label: 'Not Applicable' },
  ],

  environmentClearance: [
    { code: 'AVAILABLE', label: 'Available' },
    { code: 'PENDING', label: 'Pending' },
    { code: 'NOT_APPLICABLE', label: 'Not Applicable' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  fireApproval: [
    { code: 'AVAILABLE', label: 'Available' },
    { code: 'PENDING', label: 'Pending' },
    { code: 'NOT_APPLICABLE', label: 'Not Applicable' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  majorApprovalException: [
    { code: 'NONE', label: 'None' },
    { code: 'MINOR', label: 'Minor' },
    { code: 'MATERIAL', label: 'Material' },
    { code: 'CRITICAL', label: 'Critical' },
  ],

  constructionStage: [
    { code: 'EXCAVATION', label: 'Excavation' },
    { code: 'FOUNDATION', label: 'Foundation' },
    { code: 'PLINTH', label: 'Plinth' },
    { code: 'RCC_STRUCTURE', label: 'RCC Structure' },
    { code: 'BRICKWORK', label: 'Brickwork' },
    { code: 'PLASTER', label: 'Plaster' },
    { code: 'MEP', label: 'MEP' },
    { code: 'FINISHING', label: 'Finishing' },
    { code: 'COMPLETED', label: 'Completed' },
    { code: 'OCCUPIED', label: 'Occupied' },
  ],

  labourPresence: [
    { code: 'HIGH', label: 'High' },
    { code: 'ADEQUATE', label: 'Adequate' },
    { code: 'LOW', label: 'Low' },
    { code: 'NEGLIGIBLE', label: 'Negligible' },
    { code: 'NO_ACTIVITY', label: 'No Activity' },
  ],

  materialAvailability: [
    { code: 'ADEQUATE', label: 'Adequate' },
    { code: 'PARTIALLY_ADEQUATE', label: 'Partially Adequate' },
    { code: 'INADEQUATE', label: 'Inadequate' },
    { code: 'NOT_OBSERVED', label: 'Not Observed' },
  ],

  workmanshipQuality: [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Good' },
    { code: 'SATISFACTORY', label: 'Satisfactory' },
    { code: 'BELOW_AVERAGE', label: 'Below Average' },
    { code: 'POOR', label: 'Poor' },
  ],

  safetyHousekeeping: [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Good' },
    { code: 'SATISFACTORY', label: 'Satisfactory' },
    { code: 'POOR', label: 'Poor' },
    { code: 'CRITICAL', label: 'Critical' },
  ],

  deviationObserved: [
    { code: 'NO', label: 'No' },
    { code: 'MINOR', label: 'Minor' },
    { code: 'MATERIAL', label: 'Material' },
    { code: 'CRITICAL', label: 'Critical' },
  ],

  infrastructureReadiness: [
    { code: 'COMPLETE', label: 'Complete' },
    { code: 'SUBSTANTIALLY_COMPLETE', label: 'Substantially Complete' },
    { code: 'PARTIAL', label: 'Partial' },
    { code: 'INITIAL', label: 'Initial' },
    { code: 'NOT_STARTED', label: 'Not Started' },
  ],

  demandLevel: [
    { code: 'VERY_HIGH', label: 'Very High' },
    { code: 'HIGH', label: 'High' },
    { code: 'MODERATE', label: 'Moderate' },
    { code: 'LOW', label: 'Low' },
    { code: 'VERY_LOW', label: 'Very Low' },
  ],

  competitionIntensity: [
    { code: 'LOW', label: 'Low' },
    { code: 'MODERATE', label: 'Moderate' },
    { code: 'HIGH', label: 'High' },
    { code: 'VERY_HIGH', label: 'Very High' },
  ],

  salesVelocity: [
    { code: 'VERY_STRONG', label: 'Very Strong' },
    { code: 'STRONG', label: 'Strong' },
    { code: 'MODERATE', label: 'Moderate' },
    { code: 'WEAK', label: 'Weak' },
    { code: 'VERY_WEAK', label: 'Very Weak' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  inventoryPosition: [
    { code: 'LOW_UNSOLD', label: 'Low Unsold' },
    { code: 'MODERATE', label: 'Moderate' },
    { code: 'HIGH_UNSOLD', label: 'High Unsold' },
    { code: 'NOT_VERIFIED', label: 'Not Verified' },
  ],

  marketabilityRating: [
    { code: 'EXCELLENT', label: 'Excellent' },
    { code: 'GOOD', label: 'Good' },
    { code: 'AVERAGE', label: 'Average' },
    { code: 'WEAK', label: 'Weak' },
    { code: 'POOR', label: 'Poor' },
  ],

  comparableProjectStage: [
    { code: 'NEW_LAUNCH', label: 'New Launch' },
    { code: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
    { code: 'NEAR_COMPLETION', label: 'Near Completion' },
    { code: 'READY', label: 'Ready' },
    { code: 'RESALE', label: 'Resale' },
  ],

  configuration: [
    { code: '1_BHK', label: '1 BHK' },
    { code: '2_BHK', label: '2 BHK' },
    { code: '2.5_BHK', label: '2.5 BHK' },
    { code: '3_BHK', label: '3 BHK' },
    { code: '3.5_BHK', label: '3.5 BHK' },
    { code: '4_BHK', label: '4 BHK' },
    { code: 'DUPLEX', label: 'Duplex' },
    { code: 'PENTHOUSE', label: 'Penthouse' },
    { code: 'COMMERCIAL', label: 'Commercial' },
    { code: 'OTHER', label: 'Other' },
  ],

  rateSource: [
    { code: 'BUILDER_QUOTE', label: 'Builder Quote' },
    { code: 'BROKER_QUOTE', label: 'Broker Quote' },
    { code: 'REGISTERED_TRANSACTION', label: 'Registered Transaction' },
    { code: 'BANK_DATABASE', label: 'Bank Database' },
    { code: 'PORTAL', label: 'Portal' },
    { code: 'OTHER', label: 'Other' },
  ],

  yesNo: [
    { code: 'YES', label: 'Yes' },
    { code: 'NO', label: 'No' },
  ],

  valuationValidity: [
    { code: '30_DAYS', label: '30 Days' },
    { code: '60_DAYS', label: '60 Days' },
    { code: '90_DAYS', label: '90 Days' },
    { code: '180_DAYS', label: '180 Days' },
    { code: '1_YEAR', label: '1 Year' },
    { code: 'CUSTOM', label: 'Custom' },
  ],

  primaryValuationMethod: [
    { code: 'MARKET_COMPARISON', label: 'Market Comparison' },
    { code: 'COST_APPROACH', label: 'Cost Approach' },
    { code: 'RESIDUAL_METHOD', label: 'Residual Method' },
    { code: 'INCOME_APPROACH', label: 'Income Approach' },
    { code: 'HYBRID', label: 'Hybrid' },
  ],

  secondaryValuationMethod: [
    { code: 'NONE', label: 'None' },
    { code: 'MARKET_COMPARISON', label: 'Market Comparison' },
    { code: 'COST_APPROACH', label: 'Cost Approach' },
    { code: 'RESIDUAL_METHOD', label: 'Residual Method' },
    { code: 'INCOME_APPROACH', label: 'Income Approach' },
  ],

  factorsIncreasingValue: [
    'Prime Micro-market Location',
    'High Connectivity & Metro Proximity',
    'Established Builder Brand Equity',
    'Comprehensive Modern Amenities',
    'Advanced Construction Progress & Slabs',
    'Strong End-user & Investor Demand',
    'Clear Title & Pre-approved Statutory Licenses',
    'Superior Construction Quality & Finishes',
  ],

  factorsReducingValue: [
    'Construction Progress Delay Variance',
    'Submarket Supply Overhang',
    'Constrained Approach Road Width / Access',
    'Pending Environmental or Fire NOCs',
    'High Unsold Inventory in Sector',
    'Aggressive Builder Quoted Pricing Above Prevailing Market',
    'Nearby Civic Infrastructure Deficiencies',
    'Developer Financing / Cash Flow Stress',
  ],

  technicalGrade: [
    { code: 'A+', label: 'A+' },
    { code: 'A', label: 'A' },
    { code: 'B', label: 'B' },
    { code: 'C', label: 'C' },
    { code: 'D', label: 'D' },
  ],

  technicalDecision: [
    { code: 'RECOMMENDED', label: 'Recommended' },
    { code: 'RECOMMENDED_WITH_CONDITIONS', label: 'Recommended with Conditions' },
    { code: 'NOT_RECOMMENDED', label: 'Not Recommended' },
    { code: 'REFER_ESCALATE', label: 'Refer / Escalate' },
  ],

  riskCategory: [
    { code: 'LOCATION', label: 'Location' },
    { code: 'LAND', label: 'Land' },
    { code: 'APPROVAL', label: 'Approval' },
    { code: 'CONSTRUCTION', label: 'Construction' },
    { code: 'QUALITY', label: 'Quality' },
    { code: 'DELAY', label: 'Delay' },
    { code: 'MARKET', label: 'Market' },
    { code: 'VALUATION', label: 'Valuation' },
    { code: 'INVENTORY', label: 'Inventory' },
    { code: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { code: 'OTHER', label: 'Other' },
  ],

  riskSeverity: [
    { code: 'LOW', label: 'Low' },
    { code: 'MEDIUM', label: 'Medium' },
    { code: 'HIGH', label: 'High' },
    { code: 'CRITICAL', label: 'Critical' },
  ],
};

/**
 * Bank-configurable Calculation Parameters
 */
export const BANK_VALUATION_RULES = {
  REALIZABLE_VALUE_FACTOR: 0.88, // 88% of Market Value
  DISTRESS_VALUE_FACTOR: 0.72,   // 72% of Market Value (Forced Sale)
  
  // Weights for final technical score calculation (sum = 100)
  WEIGHTS: {
    location: 0.25,      // 25%
    construction: 0.35,  // 35%
    infrastructure: 0.20,// 20%
    marketability: 0.20, // 20%
  },

  // Score to Grade thresholds (on a scale of 0-100)
  GRADE_THRESHOLDS: [
    { grade: 'A+', minScore: 85 },
    { grade: 'A', minScore: 75 },
    { grade: 'B', minScore: 60 },
    { grade: 'C', minScore: 50 },
    { grade: 'D', minScore: 0 },
  ],
};
