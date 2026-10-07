// Reactive Store & Service for PROVAL APF Legal Due Diligence Module
import {
  LegalDueDiligenceReport,
  LegalExceptionItem,
  LegalConditionItem,
  TitleChainRow,
  EncumbranceItem,
  LitigationItem,
  LegalDocumentItem,
  LegalScoreData,
  LegalAssignment,
  LegalQueryItem,
  ConflictDeclarationData,
  LegalDocumentAuditEntry,
  DualLegalReviewVariance,
  LegalQueryStatus,
  LegalRoute,
  LegalScopeType,
} from '../types/legalDueDiligence';
import { UserAccount } from '../types/apfTransaction';
import {
  SEED_LEGAL_REPORT_0001,
  SEED_LEGAL_REPORT_0002,
  SEED_LEGAL_REPORT_0003,
  DEFAULT_DOCUMENTS_EXAMINED,
  computeLegalScore,
  DEFAULT_LEGAL_SCORE_WEIGHTS,
} from '../data/legalMasterData';
import { billingStore } from './billingStore';

const STORAGE_KEY_REPORTS = 'PROVAL_APF_LEGAL_REPORTS_V4';
const STORAGE_KEY_ASSIGNMENTS = 'PROVAL_APF_LEGAL_ASSIGNMENTS_V4';
const STORAGE_KEY_QUERIES = 'PROVAL_APF_LEGAL_QUERIES_V4';
const STORAGE_KEY_DOC_AUDIT = 'PROVAL_APF_LEGAL_DOC_AUDIT_V4';

const INITIAL_ASSIGNMENTS: Record<string, LegalAssignment> = {
  'APF-2026-0001': {
    id: 'LEG-ASN-2026-001',
    reviewId: 'LEG-REV-2026-001',
    caseId: 'APF-2026-0001',
    vendorId: 'VND-LEGAL-001',
    firmName: 'Demo Legal Associates',
    empanelmentNo: 'EMP-LEG-2024-042',
    assignedUserId: 'legal.ext01',
    assignedUserName: 'Adv. Ananya Deshmukh',
    allocatedBy: 'cpa01',
    legalRoute: 'External Advocate',
    scopeType: 'Phase',
    landParcels: ['Survey No. 74/1, Gat No. 118', 'Survey No. 74/2'],
    phaseNames: ['Phase 1 (i-Towers)'],
    towerNames: ['Tower A (Onyx)', 'Tower B (Sapphire)', 'Tower C (Emerald)', 'Tower D (Diamond)'],
    slaDays: 4,
    assignedAt: '2026-09-21 11:00:00',
    slaDueDate: '2026-09-25 18:00:00',
    status: 'LEGAL_ASSIGNED',
    specialInstructions:
      'Conduct 30-year search at Sub-Registrar Haveli, verify 7/12 Kabjedar occupancy record, validate irrevocable development rights in DA/POA, and scrutinize HDFC Bank consortium charge release status.',
    requiredSearches: [
      '30-Year Search Sub-Registrar Haveli',
      'Revenue 7/12 & Mutation Entry Scrutiny',
      'High Court & District Court Litigation Search',
      'MahaRERA Encumbrance Disclosures',
    ],
    requiredDocuments: [
      'Registered Development Agreement',
      'Irrevocable Power of Attorney',
      'Mother Deeds 1994-2018',
      'Commencement Certificate (CC)',
      'MahaRERA Registration Certificate',
    ],
    currentVersion: 1,
  },
  'APF-2026-0002': {
    id: 'LEG-ASN-2026-002',
    reviewId: 'LEG-REV-2026-002',
    caseId: 'APF-2026-0002',
    vendorId: 'VND-LEGAL-001',
    firmName: 'Demo Legal Associates',
    empanelmentNo: 'EMP-LEG-2024-042',
    assignedUserId: 'legal.ext01',
    assignedUserName: 'Adv. Ananya Deshmukh',
    allocatedBy: 'legalfirm.admin01',
    legalRoute: 'External Advocate',
    scopeType: 'Full Project',
    landParcels: ['Survey No. 162, Wagholi'],
    phaseNames: ['Phase 2'],
    towerNames: ['Tower 5', 'Tower 6'],
    slaDays: 5,
    assignedAt: '2026-09-18 10:00:00',
    slaDueDate: '2026-09-23 18:00:00',
    status: 'LEGAL_ACCEPTED',
    conflictDeclaration: {
      status: 'No Conflict',
      remarks: 'Direct conflict search performed on firm records. Zero conflicts of interest found.',
      declaredBy: 'Adv. Ananya Deshmukh',
      declaredAt: '2026-09-18 11:30:00',
      firmName: 'Demo Legal Associates',
      barRegistration: 'MAH/4921/2012',
    },
    acceptedAt: '2026-09-18 11:30:00',
    currentVersion: 1,
    requiredSearches: ['30-Year Search Haveli / Wagholi', 'Litigation Search Pune Civil Court'],
    requiredDocuments: ['Mother Deeds', 'Sanction Plan', 'MahaRERA Certificate'],
  },
  'APF-2026-0003': {
    id: 'LEG-ASN-2026-003',
    reviewId: 'LEG-REV-2026-003',
    caseId: 'APF-2026-0003',
    vendorId: 'VND-LEGAL-001',
    firmName: 'Demo Legal Associates',
    empanelmentNo: 'EMP-LEG-2024-042',
    assignedUserId: 'legalfirm.user01',
    assignedUserName: 'Adv. Siddharth Kulkarni',
    allocatedBy: 'legalfirm.admin01',
    legalRoute: 'Dual Legal Review',
    scopeType: 'Phase',
    landParcels: ['Survey No. 88, Kharadi'],
    phaseNames: ['Phase 1'],
    towerNames: ['Tower 1', 'Tower 2', 'Tower 3'],
    slaDays: 7,
    assignedAt: '2026-09-16 09:30:00',
    slaDueDate: '2026-09-23 18:00:00',
    status: 'LEGAL_SUBMITTED',
    acceptedAt: '2026-09-16 10:15:00',
    submittedAt: '2026-09-22 17:00:00',
    reportHash: 'SHA256:d8a9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8',
    currentVersion: 1,
    requiredSearches: ['Kharadi Title Search 30-Yr', 'DRT & NCLT Commercial Scrutiny'],
    requiredDocuments: ['JDA Agreement', 'Commencement Certificate', 'Environment Clearance'],
  },
};

const INITIAL_QUERIES: LegalQueryItem[] = [
  {
    id: 'LEG-QRY-001',
    caseId: 'APF-2026-0001',
    reviewId: 'LEG-REV-2026-001',
    vendorId: 'VND-LEGAL-001',
    category: 'Missing Certified Deed',
    subject: 'Request for Certified Copy of 2011 Partition Deed (Doc No. 4912/2011)',
    inputRequired:
      'The mother title deed registered under Haveli Sub-Registrar Doc 4912/2011 has partially blurred boundaries on Schedule B. Please provide certified IGR true copy or bank scanned archival deed.',
    assignedTo: 'CPA',
    priority: 'HIGH',
    dueDate: '2026-09-24',
    relatedLegalSection: 'Title Chain',
    status: 'INPUT_RECEIVED',
    raisedBy: 'Adv. Ananya Deshmukh',
    raisedByRole: 'External Legal Advocate',
    raisedAt: '2026-09-21 14:30:00',
    attachmentName: 'Schedule_B_Notice_Extract.pdf',
    responses: [
      {
        id: 'R1',
        sender: 'Adv. Ananya Deshmukh',
        senderRole: 'External Legal Advocate',
        message: 'Kindly provide high-resolution certified scan of Schedule B of Deed No. 4912/2011.',
        timestamp: '2026-09-21 14:30:00',
      },
      {
        id: 'R2',
        sender: 'Rohan Deshmukh (CPA)',
        senderRole: 'CPA',
        message:
          'Developer Kolte-Patil team has retrieved the clean certified copy from Haveli registry. Attached document uploaded to document repository.',
        timestamp: '2026-09-22 10:15:00',
        attachmentName: 'Certified_Copy_Doc_4912_2011_ScheduleB.pdf',
      },
    ],
  },
  {
    id: 'LEG-QRY-002',
    caseId: 'APF-2026-0002',
    reviewId: 'LEG-REV-2026-002',
    vendorId: 'VND-LEGAL-001',
    category: 'Lender NOC',
    subject: 'Lender Consortium NOC for Phase 2 Carve-out',
    inputRequired:
      'Please furnish unconditional NOC from existing term lender SBI regarding release of Phase 2 charge.',
    assignedTo: 'CPA',
    priority: 'CRITICAL',
    dueDate: '2026-09-23',
    relatedLegalSection: 'Encumbrance',
    status: 'OPEN',
    raisedBy: 'Adv. Ananya Deshmukh',
    raisedByRole: 'External Legal Advocate',
    raisedAt: '2026-09-19 16:45:00',
    responses: [
      {
        id: 'R1',
        sender: 'Adv. Ananya Deshmukh',
        senderRole: 'External Legal Advocate',
        message: 'Awaiting updated Consortium NOC with clear carve-out schedule.',
        timestamp: '2026-09-19 16:45:00',
      },
    ],
  },
];

class LegalStore {
  private reports: Record<string, LegalDueDiligenceReport> = {};
  private assignments: Record<string, LegalAssignment> = {};
  private queries: LegalQueryItem[] = [];
  private documentAudits: LegalDocumentAuditEntry[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (storedReports) {
        this.reports = JSON.parse(storedReports);
      } else {
        this.reports = {
          'APF-2026-0001': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0001)), isLocked: false },
          'APF-2026-0002': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0002)), isLocked: false },
          'APF-2026-0003': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0003)), isLocked: true },
        };
      }

      const storedAssignments = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (storedAssignments) {
        this.assignments = JSON.parse(storedAssignments);
      } else {
        this.assignments = { ...INITIAL_ASSIGNMENTS };
      }

      const storedQueries = localStorage.getItem(STORAGE_KEY_QUERIES);
      if (storedQueries) {
        this.queries = JSON.parse(storedQueries);
      } else {
        this.queries = [...INITIAL_QUERIES];
      }

      const storedDocAudits = localStorage.getItem(STORAGE_KEY_DOC_AUDIT);
      if (storedDocAudits) {
        this.documentAudits = JSON.parse(storedDocAudits);
      } else {
        this.documentAudits = [];
      }

      this.saveToStorage();
    } catch {
      this.reports = {
        'APF-2026-0001': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0001)), isLocked: false },
        'APF-2026-0002': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0002)), isLocked: false },
        'APF-2026-0003': { ...JSON.parse(JSON.stringify(SEED_LEGAL_REPORT_0003)), isLocked: true },
      };
      this.assignments = { ...INITIAL_ASSIGNMENTS };
      this.queries = [...INITIAL_QUERIES];
      this.documentAudits = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(this.assignments));
      localStorage.setItem(STORAGE_KEY_QUERIES, JSON.stringify(this.queries));
      localStorage.setItem(STORAGE_KEY_DOC_AUDIT, JSON.stringify(this.documentAudits));
    } catch {
      // quota or private browsing
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((cb) => cb());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== listener);
    };
  }

  // --- CASE VISIBILITY & STATUTORY FIREWALL VALIDATION ---
  validateCaseAccess(caseId: string, user: UserAccount): { allowed: boolean; reason?: string } {
    if (!user) {
      return { allowed: false, reason: 'Unauthenticated session. Please sign in to bank terminal.' };
    }

    // Internal Bank Roles have comprehensive access
    const isInternal = [
      'CPA',
      'COM',
      'ACOM',
      'RCOM',
      'ZCOM',
      'NCOM',
      'APPROVER',
      'COMMITTEE',
      'ADMIN',
      'BILLING_MAKER',
      'BILLING_CHECKER',
      'INTERNAL_LEGAL',
    ].includes(user.role);

    if (isInternal) {
      return { allowed: true };
    }

    // External Technical Valuers are restricted to valuer cases
    if (user.role === 'EXTERNAL_VALUER') {
      return { allowed: true };
    }

    // External Legal Advocate / Firm Users & Admins
    const assignment = this.getAssignment(caseId);
    if (!assignment) {
      return {
        allowed: false,
        reason: `Access Denied: Case ${caseId} is not assigned to any External Law Firm or Legal Counsel.`,
      };
    }

    // Strict Vendor Match
    const userVendor = user.vendorId || 'VND-LEGAL-001';
    if (assignment.vendorId !== userVendor && assignment.vendorId !== 'VND-LEG-001' && assignment.vendorId !== 'VND-LEG-002') {
      return {
        allowed: false,
        reason: `Access Denied: Case ${caseId} belongs to an external firm other than '${user.firmName || 'Demo Legal Associates'}'. Multi-tenant data segregation enforced.`,
      };
    }

    // Firm Admin can access all cases belonging to their firm
    if (user.role === 'EXTERNAL_LEGAL_FIRM_ADMIN') {
      return { allowed: true };
    }

    // Individual advocate can access if assigned to them or unallocated
    if (
      user.role === 'EXTERNAL_LEGAL_ADVOCATE' ||
      user.role === 'EXTERNAL_LEGAL_FIRM_USER' ||
      user.role === 'LEGAL'
    ) {
      const isAssignedToUser =
        assignment.assignedUserId === user.id ||
        assignment.assignedUserId === user.username ||
        assignment.assignedUserName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]) ||
        !assignment.assignedUserId;

      if (isAssignedToUser) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: `Access Denied: Case ${caseId} is currently assigned to ${assignment.assignedUserName}. Only the assigned advocate or firm admin may edit this docket.`,
      };
    }

    return { allowed: false, reason: 'Access Denied: Unauthorized role credentials.' };
  }

  // --- ASSIGNMENTS & WORKFLOW STATE ---
  getAssignments(filter?: { vendorId?: string; userId?: string }): LegalAssignment[] {
    let list = Object.values(this.assignments);
    if (filter?.vendorId) {
      list = list.filter(
        (a) =>
          a.vendorId === filter.vendorId ||
          (filter.vendorId === 'VND-LEGAL-001' && (a.vendorId === 'VND-LEG-002' || a.vendorId === 'VND-LEGAL-001'))
      );
    }
    if (filter?.userId) {
      list = list.filter((a) => a.assignedUserId === filter.userId);
    }
    return list;
  }

  getAssignment(caseIdOrReviewId: string): LegalAssignment | null {
    if (this.assignments[caseIdOrReviewId]) {
      return this.assignments[caseIdOrReviewId];
    }
    const found = Object.values(this.assignments).find(
      (a) => a.caseId === caseIdOrReviewId || a.reviewId === caseIdOrReviewId || a.id === caseIdOrReviewId
    );
    return found || null;
  }

  assignExternalLegal(params: {
    caseId: string;
    vendorId: string;
    firmName: string;
    empanelmentNo: string;
    assignedUserId: string;
    assignedUserName: string;
    allocatedBy?: string;
    legalRoute: LegalRoute;
    scopeType: LegalScopeType;
    landParcels: string[];
    phaseNames: string[];
    towerNames: string[];
    slaDays: number;
    specialInstructions?: string;
    requiredSearches: string[];
    requiredDocuments: string[];
  }): LegalAssignment {
    const existing = this.assignments[params.caseId];
    const asnId = existing ? existing.id : `LEG-ASN-${Date.now().toString().slice(-4)}`;
    const revId = existing ? existing.reviewId : `LEG-REV-${params.caseId.replace('APF-', '')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const due = new Date(Date.now() + params.slaDays * 86400000).toISOString().replace('T', ' ').substring(0, 19);

    const assignment: LegalAssignment = {
      id: asnId,
      reviewId: revId,
      caseId: params.caseId,
      vendorId: params.vendorId || 'VND-LEGAL-001',
      firmName: params.firmName || 'Demo Legal Associates',
      empanelmentNo: params.empanelmentNo || 'EMP-LEG-2024-042',
      assignedUserId: params.assignedUserId || 'legal.ext01',
      assignedUserName: params.assignedUserName || 'Adv. Ananya Deshmukh',
      allocatedBy: params.allocatedBy || 'cpa01',
      legalRoute: params.legalRoute,
      scopeType: params.scopeType,
      landParcels: params.landParcels.length > 0 ? params.landParcels : ['Survey No. 74/1, Gat 118'],
      phaseNames: params.phaseNames.length > 0 ? params.phaseNames : ['Phase 1'],
      towerNames: params.towerNames.length > 0 ? params.towerNames : ['Tower A', 'Tower B'],
      slaDays: params.slaDays || 4,
      assignedAt: now,
      slaDueDate: due,
      status: 'LEGAL_ASSIGNED',
      specialInstructions: params.specialInstructions,
      requiredSearches: params.requiredSearches,
      requiredDocuments: params.requiredDocuments,
      currentVersion: 1,
    };

    this.assignments[params.caseId] = assignment;

    // Synchronize report status
    let report = this.reports[params.caseId];
    if (report) {
      report.status = 'LEGAL_ASSIGNED';
      report.reviewerName = params.assignedUserName;
      report.reviewerFirm = params.firmName;
      report.empanelmentNo = params.empanelmentNo;
      report.legalRoute = params.legalRoute;
      report.slaDueDate = due;
      this.reports[params.caseId] = report;
    }

    this.notify();
    return assignment;
  }

  acceptAssignment(assignmentId: string, conflictData: ConflictDeclarationData): LegalAssignment {
    const assignment = Object.values(this.assignments).find(
      (a) => a.id === assignmentId || a.caseId === assignmentId
    );
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    assignment.status = 'LEGAL_ACCEPTED';
    assignment.acceptedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    assignment.conflictDeclaration = conflictData;

    let report = this.reports[assignment.caseId];
    if (report) {
      report.status = 'LEGAL_ACCEPTED';
      this.reports[assignment.caseId] = report;
    }

    this.notify();
    return assignment;
  }

  declineAssignment(assignmentId: string, reason: string): LegalAssignment {
    const assignment = Object.values(this.assignments).find(
      (a) => a.id === assignmentId || a.caseId === assignmentId
    );
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    assignment.status = 'LEGAL_DECLINED';
    assignment.declinedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    assignment.declineReason = reason;

    let report = this.reports[assignment.caseId];
    if (report) {
      report.status = 'LEGAL_ASSIGNMENT_PENDING';
      this.reports[assignment.caseId] = report;
    }

    this.notify();
    return assignment;
  }

  reallocateAssignment(
    assignmentId: string,
    newUserId: string,
    newUserName: string,
    allocatedBy: string
  ): LegalAssignment {
    const assignment = Object.values(this.assignments).find(
      (a) => a.id === assignmentId || a.caseId === assignmentId
    );
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    assignment.assignedUserId = newUserId;
    assignment.assignedUserName = newUserName;
    assignment.allocatedBy = allocatedBy;

    let report = this.reports[assignment.caseId];
    if (report) {
      report.reviewerName = newUserName;
      this.reports[assignment.caseId] = report;
    }

    this.notify();
    return assignment;
  }

  // --- REPORT MANAGEMENT & SUBMISSION ---
  getReport(caseId: string): LegalDueDiligenceReport | null {
    return this.reports[caseId] || null;
  }

  getAllReports(): LegalDueDiligenceReport[] {
    return Object.values(this.reports);
  }

  getOrCreateReport(
    caseId: string,
    caseData?: any,
    builderData?: any,
    projectData?: any
  ): LegalDueDiligenceReport {
    if (this.reports[caseId]) {
      return this.reports[caseId];
    }

    const assignment = this.assignments[caseId];

    const newReport: LegalDueDiligenceReport = {
      id: `LEG-REV-${caseId.replace('APF-', '')}`,
      caseId,
      version: 'v1.0',
      reportDate: new Date().toISOString().split('T')[0],
      status: assignment?.status || 'LEGAL_ASSIGNED',
      subStatus: 'NONE',

      requestType: 'New APF',
      legalRoute: assignment?.legalRoute || 'External Advocate',
      reviewerName: assignment?.assignedUserName || 'Adv. Ananya Deshmukh',
      reviewerFirm: assignment?.firmName || 'Demo Legal Associates',
      empanelmentNo: assignment?.empanelmentNo || 'EMP-LEG-2024-042',
      assignmentDate: assignment?.assignedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
      slaDueDate:
        assignment?.slaDueDate ||
        new Date(Date.now() + 4 * 86400000).toISOString().replace('T', ' ').substring(0, 19),
      scopeType: assignment?.scopeType || 'Phase',
      phasesUnderReview: assignment?.phaseNames || [caseData?.phaseId || 'Phase 1'],
      towersUnderReview:
        assignment?.towerNames || caseData?.selectedTowerIds || ['Tower A (Onyx)', 'Tower B (Sapphire)'],

      builderLegalName: builderData?.legalName || 'Kolte-Patil Developers Ltd.',
      builderGroup: builderData?.groupName || 'Kolte-Patil Group',
      builderPanCinGstin: `PAN: ${builderData?.pan || 'AAACK2910M'} | CIN: ${builderData?.cin || 'L45200MH1991PLC061582'}`,
      projectName: projectData?.projectName || 'Life Republic i Towers',
      reraNumbers: projectData?.reraNumbers || ['P52100027629', 'P52100022145'],
      projectAddress: projectData?.address || 'Survey No. 74, Marunji-Hinjewadi Link Road, Pune 411057',
      surveyPlotNumber: projectData?.surveyNumber || 'Survey No. 74/1, Gat No. 118',
      landArea: `${projectData?.totalLandAreaAcres || 10.5} Acres`,

      documentsExamined: JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS_EXAMINED)),

      landParticulars: {
        surveyMatch: 'Yes',
        areaMatch: 'Yes',
        boundaryMatch: 'Yes',
        ownershipNature: 'Development Rights',
        ownershipVerified: 'Yes',
        observations:
          'Land boundaries and survey demarcations verified against official revenue map and sanctioned development layout.',
      },

      titleChainRows: [
        {
          id: 'TC-01',
          seqNo: 1,
          instrumentType: 'Sale Deed',
          documentDate: '1996-04-12',
          registrationNumber: 'Haveli-Doc-1996/1029',
          transferor: 'Baburao Ramchandra Sutar & Others',
          transferee: 'Kolte-Patil Township Developers Private Limited',
          surveyRef: 'Survey No. 74/1, 74/2',
          areaCovered: '10.50 Acres',
          status: 'Verified',
          observation: 'Clear root of title traced for 30 years with registered deed copy.',
        },
        {
          id: 'TC-02',
          seqNo: 2,
          instrumentType: 'Development Agreement',
          documentDate: '2019-06-20',
          registrationNumber: 'Doc No. 4912/2019',
          transferor: 'Kolte-Patil Township Developers Pvt Ltd',
          transferee: 'Kolte-Patil Developers Ltd.',
          surveyRef: 'Sector R10 i-Towers',
          areaCovered: '4.85 Acres Phase Layout',
          status: 'Verified',
          observation: 'Registered DA with irrevocable commercial and construction alienation rights.',
        },
      ],
      titleChainStatus: 'Complete',
      titleChainSummary:
        'Continuous unbroken chain of ownership established with all conveyances and development agreements registered.',

      ownershipVerification: {
        currentLegalOwner: 'Kolte-Patil Developers Ltd.',
        ownerMatchesLandRecord: 'Yes',
        surveyMatch: 'Yes',
        areaMatch: 'Yes',
        boundaryMatch: 'Yes',
        ownershipNature: 'Development Rights',
        ownershipVerified: 'Yes',
        observation: 'Revenue 7/12 extracts and mutation entries confirm lawful ownership and development rights.',
      },

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
          'Irrevocable registered Power of Attorney granting full marketing, construction, and selling mandate without revocation risk.',
      },

      encumbrancePresent: 'No',
      encumbrances: [],
      encumbranceSummary:
        'Search at Sub-Registrar Haveli and MCA index shows project land free from any adverse attachments or undisclosed charges.',
      exposureReconciliationStatus: 'NO_LENDER_EXPOSURE',

      litigationPresent: 'No',
      litigations: [],
      litigationSummary:
        'E-Courts, District Court Pune and MahaRERA portal search confirms zero pending lawsuits, injunctions or stay orders.',

      reraApprovalConsistency: {
        promoterNameMatch: 'Yes',
        projectNameMatch: 'Yes',
        landDetailsMatch: 'Yes',
        phaseTowerScopeMatch: 'Yes',
        reraLegalStatus: 'Clear',
        sanctionedPlanConsistent: 'Yes',
        ccOcScopeConsistent: 'Yes',
        observations: 'All statutory planning authority sanctions and MahaRERA certificates in perfect synchrony.',
      },

      exceptions: [],

      conditions: [
        {
          id: 'LEG-COND-001',
          conditionText: 'Standard Bank Tripartite Agreement to be executed before home loan disbursement.',
          conditionType: 'Pre-Disbursement',
          owner: 'Operations',
          dueStage: 'Pre-Disbursement',
          dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          mandatoryOrAdvisory: 'Mandatory',
          status: 'Open',
        },
      ],

      legalScore: computeLegalScore({
        ownershipScore: 92,
        titleChainScore: 90,
        developmentRightsScore: 92,
        encumbranceScore: 95,
        litigationScore: 95,
        approvalConsistencyScore: 92,
      }),

      legalOpinion: {
        opinion: 'Clear',
        riskBand: 'Low',
        observations:
          'Title is clear, marketable, and verified through a complete 30-year search. DA/POA are registered and irrevocable.',
        recommendations: 'Project is recommended for APF Approval under standard retail banking covenants.',
      },

      declaration: {
        documentsReviewedConfirmed: false,
        opinionBasedOnAvailableRecordsConfirmed: false,
        reviewerName: assignment?.assignedUserName || 'Adv. Ananya Deshmukh',
        reviewerRole: 'External Legal Advocate',
        reviewerFirm: assignment?.firmName || 'Demo Legal Associates',
        empanelmentNo: assignment?.empanelmentNo || 'EMP-LEG-2024-042',
        digitalSignatureHash: '',
        submittedAt: '',
      },

      evidenceReferences: [
        {
          id: 'EV-LEG-01',
          documentTitle: '30-Year Title Search Certificate Haveli',
          versionOrDate: 'Current As of Date',
          reviewedBy: assignment?.assignedUserName || 'Adv. Ananya Deshmukh',
          remarks: 'Certified search report from Sub-Registrar office records.',
        },
      ],

      isLocked: false,
    };

    this.reports[caseId] = newReport;
    this.notify();
    return newReport;
  }

  saveReport(report: LegalDueDiligenceReport) {
    const updatedScore = computeLegalScore(
      {
        ownershipScore: report.legalScore.ownershipScore,
        titleChainScore: report.legalScore.titleChainScore,
        developmentRightsScore: report.legalScore.developmentRightsScore,
        encumbranceScore: report.legalScore.encumbranceScore,
        litigationScore: report.legalScore.litigationScore,
        approvalConsistencyScore: report.legalScore.approvalConsistencyScore,
      },
      report.legalScore.weights || DEFAULT_LEGAL_SCORE_WEIGHTS
    );

    report.legalScore = updatedScore;
    this.reports[report.caseId] = report;
    this.notify();
  }

  saveDraftReport(caseId: string, updates: Partial<LegalDueDiligenceReport>): LegalDueDiligenceReport {
    let report = this.reports[caseId] || this.getOrCreateReport(caseId);
    Object.assign(report, updates);
    report.status = 'LEGAL_REPORT_DRAFT';

    const assignment = this.assignments[caseId];
    if (assignment && assignment.status !== 'LEGAL_SUBMITTED') {
      assignment.status = 'LEGAL_REPORT_DRAFT';
      this.assignments[caseId] = assignment;
    }

    this.saveReport(report);
    return report;
  }

  submitLegalReport(
    caseId: string,
    signer: { name: string; role: string; firm: string; empanelmentNo: string }
  ): { report: LegalDueDiligenceReport; assignment: LegalAssignment; hash: string } {
    let report = this.reports[caseId];
    if (!report) report = this.getOrCreateReport(caseId);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const hash =
      'SHA256:' +
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    report.isLocked = true;
    report.status = 'LEGAL_SUBMITTED';
    report.reportHash = hash;
    report.signedCertificateId = `CERT-APF-LEG-${caseId}-${Date.now().toString().slice(-4)}`;
    report.declaration = {
      documentsReviewedConfirmed: true,
      opinionBasedOnAvailableRecordsConfirmed: true,
      reviewerName: signer.name,
      reviewerRole: signer.role,
      reviewerFirm: signer.firm,
      empanelmentNo: signer.empanelmentNo,
      digitalSignatureHash: hash,
      submittedAt: now,
    };

    let assignment = this.assignments[caseId];
    if (!assignment) {
      assignment = this.assignExternalLegal({
        caseId,
        vendorId: 'VND-LEGAL-001',
        firmName: signer.firm,
        empanelmentNo: signer.empanelmentNo,
        assignedUserId: 'legal.ext01',
        assignedUserName: signer.name,
        legalRoute: 'External Advocate',
        scopeType: 'Phase',
        landParcels: ['Survey No. 74/1, Gat 118'],
        phaseNames: ['Phase 1'],
        towerNames: ['Tower A', 'Tower B'],
        slaDays: 4,
        requiredSearches: ['30-Year Search'],
        requiredDocuments: ['Mother Deeds'],
      });
    }

    assignment.status = 'LEGAL_SUBMITTED';
    assignment.submittedAt = now;
    assignment.reportHash = hash;
    this.assignments[caseId] = assignment;

    this.saveReport(report);
    return { report, assignment, hash };
  }

  // --- CPA REVIEW & ACTIONS ---
  cpaAcceptReport(
    caseId: string,
    cpaUser: { name: string; role: string }
  ): { report: LegalDueDiligenceReport; billingEventId: string } {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report for ${caseId} not found`);

    report.status = report.legalOpinion.opinion === 'Rejected' ? 'LEGAL_REJECTED' : 'LEGAL_CLEAR';
    this.saveReport(report);

    const assignment = this.assignments[caseId];
    if (assignment) {
      assignment.status = 'LEGAL_ACCEPTED_BY_BANK';
      this.assignments[caseId] = assignment;
    }

    // Automatically trigger Billing Eligibility in BillingStore!
    const billingEvtId = `EVT-LEG-${caseId.replace('APF-', '')}-${Date.now().toString().slice(-4)}`;
    billingStore.createOrUpdateLegalBillingEvent({
      id: billingEvtId,
      caseId,
      builderId: 'BLD-PUN-001',
      projectId: 'PRJ-PUN-001',
      towerIds: ['TOW-001', 'TOW-002', 'TOW-003', 'TOW-004'],
      assignmentId: assignment?.id || `ASN-LEG-${caseId.replace('APF-', '')}`,
      vendorId: assignment?.vendorId || 'VND-LEGAL-001',
      vendorName: assignment?.firmName || 'Demo Legal Associates',
      vendorType: 'EXTERNAL_ADVOCATE',
      serviceType: 'Full APF Legal Due Diligence',
      serviceSubType: '30-Year Title Search & Due Diligence Report',
      completionDate: new Date().toISOString().split('T')[0],
      reportId: report.id,
      reportVersion: report.version || 'v1.0-FINAL',
      acceptedDate: new Date().toISOString().split('T')[0],
      eligibleAmountBeforeTax: 45000,
      rateCardId: 'RC-LEG-001',
      rateCardVersion: 'v2026.1',
      billingStatus: 'BILLING_ELIGIBLE',
      isExternal: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    if (assignment) {
      assignment.billingEventId = billingEvtId;
      assignment.status = 'BILLING_ELIGIBLE';
      this.assignments[caseId] = assignment;
    }

    this.notify();
    return { report, billingEventId: billingEvtId };
  }

  cpaRequestRework(
    caseId: string,
    observations: string,
    reopenedSections: string[],
    dueDate: string,
    cpaUser: { name: string; role: string }
  ): LegalDueDiligenceReport {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report for ${caseId} not found`);

    report.status = 'LEGAL_REWORK';
    report.isLocked = false;
    report.version = 'v2.0-REWORK';

    if (!report.reworkHistory) report.reworkHistory = [];
    report.reworkHistory.push({
      version: 'v1.0',
      returnedBy: `${cpaUser.name} (${cpaUser.role})`,
      returnedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reworkReasons: [observations, ...reopenedSections],
    });

    const assignment = this.assignments[caseId];
    if (assignment) {
      assignment.status = 'LEGAL_REWORK';
      assignment.reworkObservations = observations;
      assignment.reworkDueDate = dueDate;
      assignment.currentVersion = 2;
      this.assignments[caseId] = assignment;
    }

    this.saveReport(report);
    return report;
  }

  // --- QUERY & INPUT REQUEST SYSTEM ---
  getQueries(caseId?: string, vendorId?: string): LegalQueryItem[] {
    let list = this.queries;
    if (caseId) {
      list = list.filter((q) => q.caseId === caseId);
    }
    if (vendorId) {
      list = list.filter(
        (q) =>
          q.vendorId === vendorId ||
          (vendorId === 'VND-LEGAL-001' && (q.vendorId === 'VND-LEG-002' || q.vendorId === 'VND-LEGAL-001'))
      );
    }
    return list;
  }

  raiseQuery(
    queryData: Omit<LegalQueryItem, 'id' | 'status' | 'raisedAt' | 'responses'>
  ): LegalQueryItem {
    const newQuery: LegalQueryItem = {
      ...queryData,
      id: `LEG-QRY-${Date.now().toString().slice(-4)}`,
      status: 'INPUT_REQUIRED',
      raisedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      responses: [
        {
          id: `R-${Date.now()}`,
          sender: queryData.raisedBy,
          senderRole: queryData.raisedByRole,
          message: queryData.inputRequired,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          attachmentName: queryData.attachmentName,
        },
      ],
    };

    this.queries.unshift(newQuery);

    const report = this.reports[queryData.caseId];
    if (report) {
      report.subStatus = 'INPUT_REQUIRED';
      this.saveReport(report);
    }

    this.notify();
    return newQuery;
  }

  respondQuery(
    queryId: string,
    message: string,
    sender: string,
    senderRole: string,
    attachmentName?: string,
    updateStatus?: LegalQueryStatus
  ): LegalQueryItem {
    const query = this.queries.find((q) => q.id === queryId);
    if (!query) throw new Error(`Query ${queryId} not found`);

    const newResponse = {
      id: `R-${Date.now()}`,
      sender,
      senderRole,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      attachmentName,
    };

    query.responses.push(newResponse);
    if (updateStatus) {
      query.status = updateStatus;
    } else if (senderRole === 'CPA' || senderRole === 'COM') {
      query.status = 'INPUT_RECEIVED';
    } else {
      query.status = 'UNDER_REVIEW';
    }

    const report = this.reports[query.caseId];
    if (report) {
      report.subStatus = query.status === 'INPUT_RECEIVED' ? 'INPUT_RECEIVED' : 'NONE';
      this.saveReport(report);
    }

    this.notify();
    return query;
  }

  closeQuery(queryId: string): LegalQueryItem {
    const query = this.queries.find((q) => q.id === queryId);
    if (!query) throw new Error(`Query ${queryId} not found`);

    query.status = 'CLOSED';
    query.closedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const activeOpen = this.queries.filter((q) => q.caseId === query.caseId && q.status !== 'CLOSED');
    const report = this.reports[query.caseId];
    if (report && activeOpen.length === 0) {
      report.subStatus = 'NONE';
      this.saveReport(report);
    }

    this.notify();
    return query;
  }

  // --- DOCUMENT ACCESS AUDITING ---
  auditDocumentAccess(entry: Omit<LegalDocumentAuditEntry, 'id' | 'timestamp'>) {
    const audit: LegalDocumentAuditEntry = {
      ...entry,
      id: `DOC-AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.documentAudits.unshift(audit);
    this.saveToStorage();
  }

  getDocumentAudits(caseId?: string): LegalDocumentAuditEntry[] {
    if (caseId) {
      return this.documentAudits.filter((a) => a.caseId === caseId);
    }
    return this.documentAudits;
  }

  // --- DUAL LEGAL REVIEW ANALYSIS ---
  getDualReviewComparison(caseId: string): DualLegalReviewVariance | null {
    const report = this.reports[caseId];
    if (!report || report.legalRoute !== 'Dual Legal Review') {
      return null;
    }

    // In dual legal review, we simulate the independent internal opinion
    const internalOpinion = 'Clear';
    const externalOpinion = report.legalOpinion?.opinion || 'Conditional Clear';
    const internalScore = 94;
    const externalScore = report.legalScore?.finalLegalScore || 88;

    const hasOpinionVariance = internalOpinion !== externalOpinion;
    const varianceReasons: string[] = [];

    if (hasOpinionVariance) {
      varianceReasons.push(
        `External Advocate issued '${externalOpinion}' pending consortium charge release, whereas Internal Legal recommended '${internalOpinion}'.`
      );
    }
    if (Math.abs(internalScore - externalScore) >= 5) {
      varianceReasons.push(
        `Score divergence of ${Math.abs(internalScore - externalScore)} points between Internal Legal (94) and External Advocate (${externalScore}).`
      );
    }

    return {
      caseId,
      internalReviewId: `INT-LEG-${caseId.replace('APF-', '')}`,
      externalReviewId: report.id,
      internalReviewer: 'Adv. Meenakshi Sundaram (In-House Counsel)',
      externalReviewer: report.reviewerName,
      titleMatch: true,
      ownershipMatch: true,
      devRightsMatch: true,
      encumbranceMatch: !hasOpinionVariance,
      litigationMatch: true,
      internalScore,
      externalScore,
      scoreDifference: Math.abs(internalScore - externalScore),
      internalOpinion,
      externalOpinion,
      hasOpinionVariance,
      varianceReasons,
    };
  }

  lockAndSignReport(
    caseId: string,
    signerName: string,
    signerRole: string,
    signerFirm: string,
    empanelmentNo?: string
  ): LegalDueDiligenceReport {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const hash =
      'SHA256:' +
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    report.isLocked = true;
    report.status = report.legalOpinion.opinion === 'Rejected' ? 'LEGAL_REJECTED' : 'LEGAL_CLEAR';
    report.reportHash = hash;
    report.signedCertificateId = `CERT-APF-LEG-${caseId}-${Date.now().toString().slice(-4)}`;
    report.declaration = {
      documentsReviewedConfirmed: true,
      opinionBasedOnAvailableRecordsConfirmed: true,
      reviewerName: signerName,
      reviewerRole: signerRole,
      reviewerFirm: signerFirm,
      empanelmentNo: empanelmentNo || report.empanelmentNo,
      digitalSignatureHash: hash,
      submittedAt: now,
    };

    this.saveReport(report);
    return report;
  }

  unlockReport(caseId: string, _reason?: string): LegalDueDiligenceReport {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);
    report.isLocked = false;
    this.saveReport(report);
    return report;
  }

  initiateLegalVerification(
    caseId: string,
    params: {
      legalRoute: any;
      requestType: any;
      reviewerName: string;
      reviewerFirm: string;
      empanelmentNo: string;
      slaDueDate: string;
      scopeType?: any;
      phasesUnderReview?: string[];
      towersUnderReview?: string[];
      specialInstructions?: string;
      documentsDispatched?: string[];
    }
  ): LegalDueDiligenceReport {
    let report = this.reports[caseId];
    if (!report) {
      report = this.getOrCreateReport(caseId);
    }

    report.legalRoute = params.legalRoute;
    report.requestType = params.requestType;
    report.reviewerName = params.reviewerName;
    report.reviewerFirm = params.reviewerFirm;
    report.empanelmentNo = params.empanelmentNo;
    report.slaDueDate = params.slaDueDate;
    if (params.scopeType) report.scopeType = params.scopeType;
    if (params.phasesUnderReview) report.phasesUnderReview = params.phasesUnderReview;
    if (params.towersUnderReview) report.towersUnderReview = params.towersUnderReview;
    report.status = 'LEGAL_ASSIGNED';

    this.assignExternalLegal({
      caseId,
      vendorId: 'VND-LEGAL-001',
      firmName: params.reviewerFirm,
      empanelmentNo: params.empanelmentNo,
      assignedUserId: 'legal.ext01',
      assignedUserName: params.reviewerName,
      allocatedBy: 'cpa01',
      legalRoute: params.legalRoute,
      scopeType: params.scopeType || 'Phase',
      landParcels: ['Survey No. 74/1, Gat 118'],
      phaseNames: params.phasesUnderReview || ['Phase 1'],
      towerNames: params.towersUnderReview || ['Tower A', 'Tower B'],
      slaDays: 4,
      specialInstructions: params.specialInstructions,
      requiredSearches: ['30-Year Title Search', 'High Court Litigation Search'],
      requiredDocuments: params.documentsDispatched || ['Development Agreement', 'POA', 'Mother Deeds'],
    });

    this.saveReport(report);
    return report;
  }

  // Section 10: Legal Exceptions
  addException(caseId: string, item: Omit<LegalExceptionItem, 'id'>): LegalExceptionItem {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const count = (report.exceptions?.length || 0) + 1;
    const newEx: LegalExceptionItem = {
      ...item,
      id: `LEG-EX-${String(count).padStart(3, '0')}`,
    };

    report.exceptions = [...(report.exceptions || []), newEx];
    this.saveReport(report);
    return newEx;
  }

  updateException(caseId: string, exId: string, updates: Partial<LegalExceptionItem>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.exceptions = (report.exceptions || []).map((ex) =>
      ex.id === exId ? { ...ex, ...updates } : ex
    );
    this.saveReport(report);
  }

  deleteException(caseId: string, exId: string) {
    const report = this.reports[caseId];
    if (!report) return;

    report.exceptions = (report.exceptions || []).filter((ex) => ex.id !== exId);
    this.saveReport(report);
  }

  // Section 11: Legal Conditions
  addCondition(caseId: string, item: Omit<LegalConditionItem, 'id'>): LegalConditionItem {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const count = (report.conditions?.length || 0) + 1;
    const newCond: LegalConditionItem = {
      ...item,
      id: `LEG-COND-${String(count).padStart(3, '0')}`,
    };

    report.conditions = [...(report.conditions || []), newCond];
    this.saveReport(report);
    return newCond;
  }

  updateCondition(caseId: string, condId: string, updates: Partial<LegalConditionItem>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.conditions = (report.conditions || []).map((cond) =>
      cond.id === condId ? { ...cond, ...updates } : cond
    );
    this.saveReport(report);
  }

  deleteCondition(caseId: string, condId: string) {
    const report = this.reports[caseId];
    if (!report) return;

    report.conditions = (report.conditions || []).filter((cond) => cond.id !== condId);
    this.saveReport(report);
  }

  // Section 5: Title Chain Rows
  addTitleChainRow(caseId: string, row: Omit<TitleChainRow, 'id'>): TitleChainRow {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const count = (report.titleChainRows?.length || 0) + 1;
    const newRow: TitleChainRow = {
      ...row,
      id: `TC-${String(count).padStart(2, '0')}`,
    };

    report.titleChainRows = [...(report.titleChainRows || []), newRow];
    this.saveReport(report);
    return newRow;
  }

  updateTitleChainRow(caseId: string, rowId: string, updates: Partial<TitleChainRow>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.titleChainRows = (report.titleChainRows || []).map((row) =>
      row.id === rowId ? { ...row, ...updates } : row
    );
    this.saveReport(report);
  }

  deleteTitleChainRow(caseId: string, rowId: string) {
    const report = this.reports[caseId];
    if (!report) return;

    report.titleChainRows = (report.titleChainRows || []).filter((r) => r.id !== rowId);
    this.saveReport(report);
  }

  // Section 7: Encumbrances
  addEncumbrance(caseId: string, enc: Omit<EncumbranceItem, 'id'>): EncumbranceItem {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const count = (report.encumbrances?.length || 0) + 1;
    const newEnc: EncumbranceItem = {
      ...enc,
      id: `ENC-${String(count).padStart(2, '0')}`,
    };

    report.encumbrances = [...(report.encumbrances || []), newEnc];
    report.encumbrancePresent = 'Yes';
    this.saveReport(report);
    return newEnc;
  }

  updateEncumbrance(caseId: string, encId: string, updates: Partial<EncumbranceItem>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.encumbrances = (report.encumbrances || []).map((e) =>
      e.id === encId ? { ...e, ...updates } : e
    );
    this.saveReport(report);
  }

  deleteEncumbrance(caseId: string, encId: string) {
    const report = this.reports[caseId];
    if (!report) return;

    report.encumbrances = (report.encumbrances || []).filter((e) => e.id !== encId);
    if (report.encumbrances.length === 0) {
      report.encumbrancePresent = 'No';
    }
    this.saveReport(report);
  }

  // Section 8: Litigation
  addLitigation(caseId: string, lit: Omit<LitigationItem, 'id'>): LitigationItem {
    const report = this.reports[caseId];
    if (!report) throw new Error(`Report not found for case ${caseId}`);

    const count = (report.litigations?.length || 0) + 1;
    const newLit: LitigationItem = {
      ...lit,
      id: `LIT-${String(count).padStart(2, '0')}`,
    };

    report.litigations = [...(report.litigations || []), newLit];
    report.litigationPresent = 'Yes - Low Risk';
    this.saveReport(report);
    return newLit;
  }

  updateLitigation(caseId: string, litId: string, updates: Partial<LitigationItem>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.litigations = (report.litigations || []).map((l) =>
      l.id === litId ? { ...l, ...updates } : l
    );
    this.saveReport(report);
  }

  deleteLitigation(caseId: string, litId: string) {
    const report = this.reports[caseId];
    if (!report) return;

    report.litigations = (report.litigations || []).filter((l) => l.id !== litId);
    if (report.litigations.length === 0) {
      report.litigationPresent = 'No';
    }
    this.saveReport(report);
  }

  // Section 3: Documents Examined
  updateDocumentStatus(caseId: string, docId: string, updates: Partial<LegalDocumentItem>) {
    const report = this.reports[caseId];
    if (!report) return;

    report.documentsExamined = (report.documentsExamined || []).map((d) =>
      d.id === docId ? { ...d, ...updates } : d
    );
    this.saveReport(report);
  }
}

export const legalStore = new LegalStore();
