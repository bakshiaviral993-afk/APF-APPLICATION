// Central Master Data and Seed Templates for PROVAL APF Legal Due Diligence
import {
  LegalDueDiligenceReport,
  LegalEmpanelmentItem,
  LegalDocumentItem,
  TitleChainRow,
  EncumbranceItem,
  LitigationItem,
  LegalExceptionItem,
  LegalConditionItem,
  LegalScoreData,
} from '../types/legalDueDiligence';

// Master List of Empanelled Legal Counsel & Advocate Firms
export const LEGAL_EMPANELMENT_MASTER: LegalEmpanelmentItem[] = [
  {
    id: 'LEG-EMP-001',
    empanelmentNo: 'EMP/LEG/PUN/2022/014',
    name: 'Adv. Suresh Shah & Associates',
    firmName: 'Shah & Partners Law Firm',
    type: 'EXTERNAL',
    city: 'Pune',
    state: 'Maharashtra',
    practiceAreas: ['RERA Compliance', '30-Yr Title Search', 'Revenue Land Law', 'JDA Structuring'],
    activeCasesCount: 14,
    rating: 4.9,
    status: 'ACTIVE',
  },
  {
    id: 'LEG-EMP-002',
    empanelmentNo: 'EMP/LEG/MUM/2021/008',
    name: 'Khaitan & Partners Advocates',
    firmName: 'Khaitan & Partners LLP',
    type: 'EXTERNAL',
    city: 'Mumbai',
    state: 'Maharashtra',
    practiceAreas: ['Consortium Lending', 'Title Chain Scrutiny', 'NCLT & DRT Litigation', 'Mortgage Charges'],
    activeCasesCount: 22,
    rating: 4.95,
    status: 'ACTIVE',
  },
  {
    id: 'LEG-EMP-003',
    empanelmentNo: 'EMP/LEG/INT/2023/001',
    name: 'Adv. Meenakshi Sundaram',
    firmName: 'ProVal In-House Legal Counsel Cell',
    type: 'INTERNAL',
    city: 'Pune',
    state: 'Maharashtra',
    practiceAreas: ['Internal APF Legal Clearances', 'Sanction Covenants', 'POA Verification'],
    activeCasesCount: 8,
    rating: 4.85,
    status: 'ACTIVE',
  },
  {
    id: 'LEG-EMP-004',
    empanelmentNo: 'EMP/LEG/BLR/2022/019',
    name: 'Shardul Amarchand & Associates',
    firmName: 'Shardul Amarchand Mangaldas & Co.',
    type: 'EXTERNAL',
    city: 'Bengaluru',
    state: 'Karnataka',
    practiceAreas: ['Commercial Property Title', 'Joint Development Rights', 'Environmental Clearance'],
    activeCasesCount: 11,
    rating: 4.9,
    status: 'ACTIVE',
  },
  {
    id: 'LEG-EMP-DEMO',
    empanelmentNo: 'EMP-LEG-2024-042',
    name: 'Demo Legal Associates',
    firmName: 'Demo Legal Associates',
    type: 'EXTERNAL',
    city: 'Pune',
    state: 'Maharashtra',
    practiceAreas: [
      'APF Title Search & Due Diligence',
      'MahaRERA Regulatory Compliance',
      'Revenue Records & Ferfar Scrutiny',
      'Development Agreement & POA Analysis',
      'Encumbrance & Mortgage Search',
    ],
    activeCasesCount: 6,
    rating: 4.96,
    status: 'ACTIVE',
    vendorId: 'VND-LEGAL-001',
    pan: 'AAEFD7712P',
    gstin: '27AAEFD7712P1ZR',
    barRegistration: 'MAH/1820/2005',
    advocateRoster: [
      {
        userId: 'legalfirm.admin01',
        name: 'Adv. Sanjay Trivedi',
        role: 'Managing Partner / Firm Admin',
        barNumber: 'MAH/1820/2005',
        email: 'sanjay.trivedi@demolegal.in',
        mobile: '+91 98220 18492',
        activeCount: 2,
      },
      {
        userId: 'legal.ext01',
        name: 'Adv. Ananya Deshmukh',
        role: 'Senior Title Advocate',
        barNumber: 'MAH/4921/2012',
        email: 'ananya.deshmukh@demolegal.in',
        mobile: '+91 98221 44021',
        activeCount: 3,
      },
      {
        userId: 'legalfirm.user01',
        name: 'Adv. Siddharth Kulkarni',
        role: 'Associate Advocate',
        barNumber: 'MAH/7391/2018',
        email: 'siddharth.kulkarni@demolegal.in',
        mobile: '+91 94220 55198',
        activeCount: 1,
      },
    ],
  },
];

// Default weights for Legal Score
export const DEFAULT_LEGAL_SCORE_WEIGHTS = {
  ownershipWeightPct: 25,
  titleChainWeightPct: 25,
  developmentRightsWeightPct: 20,
  encumbranceWeightPct: 15,
  litigationWeightPct: 10,
  approvalConsistencyWeightPct: 5,
};

export function computeLegalScore(
  scores: {
    ownershipScore: number;
    titleChainScore: number;
    developmentRightsScore: number;
    encumbranceScore: number;
    litigationScore: number;
    approvalConsistencyScore: number;
  },
  weights = DEFAULT_LEGAL_SCORE_WEIGHTS
): LegalScoreData {
  const weighted =
    (scores.ownershipScore * weights.ownershipWeightPct +
      scores.titleChainScore * weights.titleChainWeightPct +
      scores.developmentRightsScore * weights.developmentRightsWeightPct +
      scores.encumbranceScore * weights.encumbranceWeightPct +
      scores.litigationScore * weights.litigationWeightPct +
      scores.approvalConsistencyScore * weights.approvalConsistencyWeightPct) /
    100;

  return {
    ...scores,
    finalLegalScore: Math.round(weighted * 10) / 10,
    weights,
  };
}

// Master Standard Checklist of Documents Examined (12 Categories)
export const DEFAULT_DOCUMENTS_EXAMINED: LegalDocumentItem[] = [
  {
    id: 'DOC-LEG-01',
    category: 'Ownership',
    name: 'Mother Deed / Ancestral Title Instrument',
    status: 'Available',
    documentRef: 'Deed Reg No. 1402/1994 Sub-Registrar Haveli',
    documentDate: '1994-04-18',
    uploadedBy: 'Kolte-Patil Legal Cell',
    source: 'Pune District Land Registry',
    observation: 'Traced original title from predecessor owner Sh. Narayanrao Patil; clear non-encumbered transfer.',
  },
  {
    id: 'DOC-LEG-02',
    category: 'Ownership',
    name: 'Sale Deed / Conveyance Deed',
    status: 'Available',
    documentRef: 'Doc No. 4102/2018 Book-I Vol 891',
    documentDate: '2018-06-12',
    uploadedBy: 'Adv. Suresh Shah',
    source: 'Registrar of Assurances Pune',
    observation: 'Validly registered conveyance in favour of Kolte-Patil I-Ven SPV with full consideration paid.',
  },
  {
    id: 'DOC-LEG-03',
    category: 'Ownership',
    name: 'Property Card / 7-12 / Record of Rights',
    status: 'Available',
    documentRef: 'Mutation Entry No. 18294 / 7-12 Extract',
    documentDate: '2026-08-10',
    uploadedBy: 'Adv. Suresh Shah',
    source: 'Mahabhulekh Land Records Maharashtra',
    observation: 'Latest computerised 7/12 extract shows Kolte-Patil I-Ven Township Ltd in Kabjedar column; no other claims.',
  },
  {
    id: 'DOC-LEG-04',
    category: 'Ownership',
    name: 'Mutation / Revenue Record',
    status: 'Available',
    documentRef: 'Ferfar No. 18294 certified by Talathi',
    documentDate: '2018-09-04',
    uploadedBy: 'Kolte-Patil Legal Cell',
    source: 'Revenue Department Mulshi',
    observation: 'Mutation completed without appeals or objections within statutory notice period.',
  },
  {
    id: 'DOC-LEG-05',
    category: 'Development Rights',
    name: 'Development Agreement / JDA',
    status: 'Available',
    documentRef: 'Reg. DA No. 6612/2019',
    documentDate: '2019-02-14',
    uploadedBy: 'Adv. Suresh Shah',
    source: 'Sub-Registrar Haveli No. 14',
    observation: 'Clear, irrevocable development rights granted to developer for entire Phase 1 layout.',
  },
  {
    id: 'DOC-LEG-06',
    category: 'Development Rights',
    name: 'Power of Attorney (Registered & Irrevocable)',
    status: 'Available',
    documentRef: 'Reg. Gen POA No. 6613/2019',
    documentDate: '2019-02-14',
    uploadedBy: 'Adv. Suresh Shah',
    source: 'Sub-Registrar Haveli No. 14',
    observation: 'Irrevocable POA coupled with interest under Sec 202 Contract Act; right to sell and execute agreements.',
  },
  {
    id: 'DOC-LEG-07',
    category: 'Search',
    name: 'Search Report / Encumbrance Certificate (30 Years)',
    status: 'Available',
    documentRef: 'SR-KHAITAN-PUN-2026-89',
    documentDate: '2026-08-20',
    uploadedBy: 'Khaitan & Partners',
    source: 'Sub-Registrar Search Haveli 1-18',
    observation: 'Search carried out from 1996 to 2026 (30 years). Title clean & marketable with specific disclosed charge.',
  },
  {
    id: 'DOC-LEG-08',
    category: 'Encumbrance',
    name: 'MCA Charge / Lender NOC',
    status: 'Clarification Required',
    documentRef: 'MCA SRN: F81920192 / HDFC Bank NOC',
    documentDate: '2026-07-15',
    uploadedBy: 'Kolte-Patil Finance Desk',
    source: 'Ministry of Corporate Affairs Portal',
    observation: 'Exclusive construction finance charge in favour of HDFC Bank Ltd. Conditional NOC for retail home loans received.',
  },
  {
    id: 'DOC-LEG-09',
    category: 'Approvals',
    name: 'Sanctioned Plan / Layout',
    status: 'Available',
    documentRef: 'PMRDA/BP/2020/LR-8812',
    documentDate: '2020-11-20',
    uploadedBy: 'Kolte-Patil Technical Cell',
    source: 'Pune Metropolitan Region Development Authority',
    observation: 'Master layout and building plans sanctioned for Towers E, F, G, H with total 24 floors.',
  },
  {
    id: 'DOC-LEG-10',
    category: 'Approvals',
    name: 'Commencement Certificate (CC)',
    status: 'Available',
    documentRef: 'CC No. PMRDA/CC/2021/3349',
    documentDate: '2021-03-18',
    uploadedBy: 'Kolte-Patil Technical Cell',
    source: 'PMRDA Building Permission Dept',
    observation: 'Full CC granted up to top floor slab (24th floor) for Towers E & G under current APF review.',
  },
  {
    id: 'DOC-LEG-11',
    category: 'Authority',
    name: 'RERA Registration Certificate',
    status: 'Available',
    documentRef: 'MahaRERA Reg: P52100027629',
    documentDate: '2021-01-10',
    uploadedBy: 'Kolte-Patil Legal Cell',
    source: 'Maharashtra Real Estate Regulatory Authority',
    observation: 'Registration valid up to 2027-12-31; verified on MahaRERA official portal with nil encumbrance remarks.',
  },
  {
    id: 'DOC-LEG-12',
    category: 'Approvals',
    name: 'Environment / Fire NOC / Part OC',
    status: 'Available',
    documentRef: 'SEAC-III-2019/CR-142/TC-2',
    documentDate: '2019-10-24',
    uploadedBy: 'Kolte-Patil Technical Cell',
    source: 'State Environment Impact Assessment Authority (SEIAA)',
    observation: 'Environmental clearance and provisional fire safety CFO NOC valid and compliant.',
  },
];

// Baseline Seed Report for Case APF-2026-0001
export const SEED_LEGAL_REPORT_0001: LegalDueDiligenceReport = {
  id: 'LEG-REV-2026-0001',
  caseId: 'APF-2026-0001',
  version: 'v1.0',
  reportDate: '2026-09-22',
  status: 'LEGAL_CLEAR',
  subStatus: 'NONE',

  // 1. Report Header & Assignment
  requestType: 'New APF',
  legalRoute: 'External Advocate',
  reviewerName: 'Adv. Suresh Shah',
  reviewerFirm: 'Shah & Partners Law Firm',
  empanelmentNo: 'EMP/LEG/PUN/2022/014',
  assignmentDate: '2026-09-21 10:00:00',
  slaDueDate: '2026-09-24 18:00:00',
  scopeType: 'Phase',
  phasesUnderReview: ['Phase 1 - Life Republic Sector R1'],
  towersUnderReview: ['Tower E (i-Tower E)', 'Tower G (i-Tower G)'],

  // 2. Builder & Project Particulars
  builderLegalName: 'Kolte-Patil Developers Limited',
  builderGroup: 'Kolte-Patil Group',
  builderPanCinGstin: 'PAN: AABCK4921E | CIN: L45200MH1991PLC061407 | GST: 27AABCK4921E1Z6',
  projectName: 'Life Republic - i Towers (Sector R1)',
  reraNumbers: ['P52100027629', 'P52100017116'],
  projectAddress: 'Survey No. 74, Hinjawadi-Marunji Link Road, Marunji, Pune 411057',
  surveyPlotNumber: 'Survey No. 74, Hissa No. 1/1, 1/2, 2, Gat No. 118',
  landArea: '14.28 Acres (Phase 1 Sector R1 Scope)',

  // 3. Documents Examined
  documentsExamined: DEFAULT_DOCUMENTS_EXAMINED,

  // 4. Land Particulars
  landParticulars: {
    surveyMatch: 'Yes',
    areaMatch: 'Yes',
    boundaryMatch: 'Yes',
    ownershipNature: 'Freehold',
    ownershipVerified: 'Yes',
    observations:
      'The land under development corresponds exactly to Survey No. 74 (Part) and Gat No. 118 as per verified village revenue survey sheet and 7/12 extract. Boundaries physically demarcated on North by 30m DP road, South by Sector R2, East by internal township spine road, West by open green buffer.',
  },

  // 5. Title Chain
  titleChainRows: [
    {
      id: 'TC-01',
      seqNo: 1,
      instrumentType: 'Sale Deed',
      documentDate: '1994-04-18',
      registrationNumber: 'Doc No. 1402/1994',
      transferor: 'Sh. Narayanrao Tukaram Patil & Others',
      transferee: 'M/s I-Ven Realty Private Limited',
      surveyRef: 'S.No. 74, Hissa 1/1, 1/2',
      areaCovered: '18.50 Acres',
      status: 'Verified',
      observation: 'Ancestral agricultural land purchased with clear mutation entry No. 11048 recorded.',
    },
    {
      id: 'TC-02',
      seqNo: 2,
      instrumentType: 'Conveyance',
      documentDate: '2010-09-15',
      registrationNumber: 'Doc No. 5819/2010',
      transferor: 'M/s I-Ven Realty Private Limited',
      transferee: 'Kolte-Patil I-Ven Township Limited (SPV)',
      surveyRef: 'S.No. 74 & Gat No. 118',
      areaCovered: '18.50 Acres',
      status: 'Verified',
      observation: 'Corporate restructuring transfer approved by Bombay High Court Scheme of Amalgamation.',
    },
    {
      id: 'TC-03',
      seqNo: 3,
      instrumentType: 'Development Agreement',
      documentDate: '2018-06-12',
      registrationNumber: 'Doc No. 4102/2018',
      transferor: 'Kolte-Patil I-Ven Township Limited',
      transferee: 'Kolte-Patil Developers Limited',
      surveyRef: 'Sector R1 (Part of S.No. 74)',
      areaCovered: '14.28 Acres',
      status: 'Verified',
      observation: 'Registered Development Agreement with full consideration and revenue sharing provisions.',
    },
    {
      id: 'TC-04',
      seqNo: 4,
      instrumentType: 'POA',
      documentDate: '2018-06-12',
      registrationNumber: 'Doc No. 4103/2018',
      transferor: 'Kolte-Patil I-Ven Township Limited',
      transferee: 'Kolte-Patil Developers Limited',
      surveyRef: 'Sector R1 (Towers E, F, G, H)',
      areaCovered: '14.28 Acres',
      status: 'Verified',
      observation: 'Irrevocable Registered General Power of Attorney with full rights to market, sell and execute deeds.',
    },
  ],
  titleChainStatus: 'Complete',
  titleChainSummary:
    'The 30-year title search demonstrates an unbroken, clear, and marketable chain of ownership from 1994 to date without any gaps or defective alienations. All instruments have been duly registered with appropriate stamp duty payment in Maharashtra.',

  // 6. Ownership Verification
  ownershipVerification: {
    currentLegalOwner: 'Kolte-Patil I-Ven Township Limited (Landowner) / Kolte-Patil Developers Limited (Developer)',
    ownerMatchesLandRecord: 'Yes',
    surveyMatch: 'Yes',
    areaMatch: 'Yes',
    boundaryMatch: 'Yes',
    ownershipNature: 'Development Rights',
    ownershipVerified: 'Yes',
    observation:
      'Title ownership and development rights are legally established. 7/12 extract correctly reflects Kolte-Patil I-Ven Township Ltd as occupant and Kolte-Patil Developers Ltd holds irrevocable registered development rights.',
  },

  // 7. Development Rights
  developmentRights: {
    daAvailable: 'Yes',
    poaStatus: 'Valid',
    rightToConstruct: 'Clearly Granted',
    rightToMarket: 'Clearly Granted',
    rightToSellUnits: 'Clearly Granted',
    rightToReceiveConsideration: 'Clearly Granted',
    landownerConsentStatus: 'Available',
    developmentRightsStatus: 'Sufficient',
    summary:
      'The Development Agreement dated 12/06/2018 read with Irrevocable POA confers absolute, unrestricted rights upon Kolte-Patil Developers Ltd to construct, market, enter into agreements with unit purchasers, receive sales proceeds into RERA designated account, and execute registered conveyances in favour of unit owners/society.',
  },

  // 8. Encumbrance / Charges
  encumbrancePresent: 'Yes',
  encumbrances: [
    {
      id: 'ENC-01',
      type: 'Mortgage',
      chargeHolder: 'HDFC Bank Limited (Consortium Lead)',
      chargeAmountCr: 75.0,
      creationDate: '2021-08-14',
      propertyAffected: 'Phase 1 - Land & Structure of Sector R1 (Towers E to H)',
      releaseStatus: 'NOC Available',
      nocRequired: 'Yes',
      severity: 'Medium',
      sourceDoc: 'MCA Charge ID: 100481920 / HDFC NOC Ref: HDFC/RE/PUN/2026/112',
      reconciledWithExposure: true,
    },
  ],
  encumbranceSummary:
    'Existing project construction finance charge of ₹75.00 Cr in favour of HDFC Bank Ltd. Formal tripartite permission/NOC dated 15/07/2026 obtained for retail home loan disbursements and unit-level mortgage creation.',
  exposureReconciliationStatus: 'MATCHED',
  exposureReconciliationNotes:
    'Matched with internal Treasury Exposure 360: Direct project debt shows ₹75.0 Cr sanctioned with current outstanding ₹42.8 Cr.',

  // 9. Litigation / Disputes
  litigationPresent: 'Yes - Low Risk',
  litigations: [
    {
      id: 'LIT-01',
      caseType: 'Civil',
      court: 'Senior Civil Division Court, Pune',
      caseNumber: 'Special Civil Suit No. 418/2024',
      parties: 'Kashinath Patil vs Kolte-Patil Developers Ltd & Ors',
      subject: 'Injunction claim on 0.25 acre boundary periphery along western stream',
      currentStatus: 'Pending',
      projectImpact: 'Limited',
      severity: 'Low',
      nextHearingDate: '2026-11-15',
      sourceDoc: 'High Court e-Courts Portal Pune Civil Court Case Status',
    },
  ],
  litigationSummary:
    'A civil suit for boundary demarcation of 0.25 acre is pending. The interim stay was vacated by the Honble Court on 12/03/2025. Towers E & G under APF review are located over 280 meters away from the disputed western stream boundary and remain completely unaffected.',

  // 10. RERA & Approval Verification
  reraApprovalConsistency: {
    promoterNameMatch: 'Yes',
    projectNameMatch: 'Yes',
    landDetailsMatch: 'Yes',
    phaseTowerScopeMatch: 'Yes',
    reraLegalStatus: 'Clear',
    sanctionedPlanConsistent: 'Yes',
    ccOcScopeConsistent: 'Yes',
    observations:
      'Promoter name on MahaRERA portal matches Kolte-Patil Developers Ltd. Total land area, survey numbers and towers (E & G) fully align with PMRDA sanctioned plan and commencement certificates.',
  },

  // 11. Legal Exceptions
  exceptions: [
    {
      id: 'LEG-EX-001',
      category: 'Encumbrance',
      observation:
        'HDFC Bank construction finance charge of ₹75 Cr registered on MCA portal requires standard tripartite agreement and NOC prior to individual mortgage creation.',
      severity: 'Medium',
      blocking: false,
      requiredAction:
        'Collect project-specific Lender NOC from HDFC Bank permitting individual mortgage and confirming deposit of sales into designated RERA account.',
      owner: 'CPA',
      dueStage: 'Pre-Disbursement',
      status: 'Resolved',
      evidenceRef: 'HDFC NOC Ref: HDFC/RE/PUN/2026/112',
    },
  ],

  // 12. Legal Conditions
  conditions: [
    {
      id: 'LEG-COND-001',
      conditionText:
        'Bank tripartite agreement format to be executed with builder and unit buyer acknowledging bank first mortgage lien.',
      conditionType: 'Pre-Disbursement',
      owner: 'Operations',
      dueStage: 'Pre-Disbursement',
      dueDate: '2026-12-31',
      mandatoryOrAdvisory: 'Mandatory',
      status: 'Open',
    },
    {
      id: 'LEG-COND-002',
      conditionText:
        'Builder to furnish valid Occupancy Certificate (Full/Part OC) prior to final disbursement of 10% retention.',
      conditionType: 'Post-Disbursement',
      owner: 'Builder',
      dueStage: 'Post-Disbursement',
      dueDate: '2027-06-30',
      mandatoryOrAdvisory: 'Mandatory',
      status: 'Open',
    },
    {
      id: 'LEG-COND-003',
      conditionText:
        'Quarterly search at Sub-Registrar Haveli to be updated to monitor for any adverse attachments or third-party claims.',
      conditionType: 'Monitoring',
      owner: 'Legal',
      dueStage: 'Monitoring',
      dueDate: '2027-03-31',
      mandatoryOrAdvisory: 'Advisory',
      status: 'Open',
    },
  ],

  // 13. Legal Score
  legalScore: computeLegalScore({
    ownershipScore: 95,
    titleChainScore: 94,
    developmentRightsScore: 92,
    encumbranceScore: 88,
    litigationScore: 85,
    approvalConsistencyScore: 96,
  }),

  // 14. Legal Opinion
  legalOpinion: {
    opinion: 'Conditional Clear',
    riskBand: 'Low',
    observations:
      'The developer has established a clear, marketable, and unencumbered title to the project land for a period exceeding 30 years. All municipal and town planning sanctions from PMRDA and MahaRERA registrations are current and legally valid. The existing construction charge in favour of HDFC Bank is covered by a valid conditional release NOC.',
    recommendations:
      'The project Life Republic - i Towers (Buildings E & G) is recommended for APF Approval subject to standard tripartite execution and adherence to pre-disbursement lender NOC conditions.',
  },

  // 15. Reviewer Declaration & Sign-off
  declaration: {
    documentsReviewedConfirmed: true,
    opinionBasedOnAvailableRecordsConfirmed: true,
    reviewerName: 'Adv. Suresh Shah',
    reviewerRole: 'Empanelled Legal Counsel & Advocate',
    reviewerFirm: 'Shah & Partners Law Firm (High Court of Bombay)',
    empanelmentNo: 'EMP/LEG/PUN/2022/014',
    digitalSignatureHash: 'SHA256:7e91b40283c78d0f191bce9842a6c8e3170e5124aa76191c4d8723b7eef098a1',
    submittedAt: '2026-09-22 14:15:30',
  },

  // 16. Document Annexure / Evidence References
  evidenceReferences: [
    {
      id: 'EV-LEG-01',
      documentTitle: '30-Year Title Search Report (Haveli Pune)',
      versionOrDate: 'v1.0 (2026-08-20)',
      reviewedBy: 'Adv. Suresh Shah',
      remarks: 'Primary search certificate from 1996 to 2026.',
    },
    {
      id: 'EV-LEG-02',
      documentTitle: 'MahaRERA Registration Certificate P52100027629',
      versionOrDate: 'Cert No. 27629 (2021-01-10)',
      reviewedBy: 'Adv. Suresh Shah',
      remarks: 'Verified online with QR code authentication.',
    },
    {
      id: 'EV-LEG-03',
      documentTitle: 'PMRDA Commencment Certificate & Sanctioned Plans',
      versionOrDate: 'CC/2021/3349 (2021-03-18)',
      reviewedBy: 'Ar. Rajesh Deshpande / Legal Cell',
      remarks: 'Structural sanction for Towers E & G.',
    },
    {
      id: 'EV-LEG-04',
      documentTitle: 'HDFC Bank Lender NOC for Retail Housing Finance',
      versionOrDate: 'Ref HDFC/RE/PUN/2026/112 (2026-07-15)',
      reviewedBy: 'Adv. Suresh Shah',
      remarks: 'Ceding first charge on individual retail units sold.',
    },
  ],

  isLocked: false,
  reportHash: 'SHA256:4b912f9e31a89c8a004f128d8b9e671239aa82716ef28d61a84f39bc0298131e',
  signedCertificateId: 'CERT-APF-LEG-2026-PUN-0842',
};

// Seed Report for Case APF-2026-0002
export const SEED_LEGAL_REPORT_0002: LegalDueDiligenceReport = {
  ...SEED_LEGAL_REPORT_0001,
  id: 'LEG-REV-2026-0002',
  caseId: 'APF-2026-0002',
  version: 'v1.0',
  reportDate: '2026-09-23',
  status: 'LEGAL_REVIEW_IN_PROGRESS',
  subStatus: 'INPUT_REQUIRED',
  builderLegalName: 'Rohan Builders & Developers Pvt Ltd',
  builderGroup: 'Rohan Group',
  builderPanCinGstin: 'PAN: AABCR7821B | CIN: U45200PN1993PTC073911 | GST: 27AABCR7821B1Z3',
  projectName: 'Rohan Abhilasha (Phase 2)',
  reraNumbers: ['P52100000482'],
  projectAddress: 'Gat No. 1293 to 1300, Wagholi, Taluka Haveli, Pune 412207',
  surveyPlotNumber: 'Gat No. 1293, 1294, 1295/1',
  landArea: '8.75 Acres',
  phasesUnderReview: ['Phase 2 - Towers A & B'],
  towersUnderReview: ['Tower A (Wings 1-2)', 'Tower B (Wings 3-4)'],
  isLocked: false,
};

// Seed Report for Case APF-2026-0003
export const SEED_LEGAL_REPORT_0003: LegalDueDiligenceReport = {
  ...SEED_LEGAL_REPORT_0001,
  id: 'LEG-REV-2026-0003',
  caseId: 'APF-2026-0003',
  version: 'v1.0',
  reportDate: '2026-09-24',
  status: 'LEGAL_ASSIGNED',
  subStatus: 'NONE',
  builderLegalName: 'VTP Realty Private Limited',
  builderGroup: 'VTP Group',
  builderPanCinGstin: 'PAN: AABCV3918M | CIN: U70102PN2015PTC156902 | GST: 27AABCV3918M1Z8',
  projectName: 'VTP Pegasus (Phase 1)',
  reraNumbers: ['P52100026783'],
  projectAddress: 'New Kharadi - Wagholi Road, Pune 412207',
  surveyPlotNumber: 'Survey No. 48/1A, 48/2',
  landArea: '12.00 Acres',
  phasesUnderReview: ['Phase 1 - Towers 1, 2, 3'],
  towersUnderReview: ['Tower 1', 'Tower 2', 'Tower 3'],
  isLocked: false,
};
