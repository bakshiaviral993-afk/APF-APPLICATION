// Stateful Transaction Store with LocalStorage Persistence
import {
  APFCase,
  CaseStatus,
  UserAccount,
  UserRole,
  ValuerAssignmentDetails,
  SiteVisitEvidence,
  MarketComparable,
  ValuationReportData,
  ExposureSnapshot,
  ApprovalConditionItem,
  LOSOutboundPayload,
  LOSResponseData,
  AuditEventItem,
} from '../types/apfTransaction';
import {
  DEMO_USERS,
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_TOWER_MASTER,
  CENTRAL_PHASE_MASTER,
} from '../data/centralMasterData';

const STORAGE_KEY_CASES = 'PROVAL_APF_CASES_V3';
const STORAGE_KEY_AUTH = 'PROVAL_APF_CURRENT_USER_V3';

// Initial Seed: 1 Baseline Scripted Demo Case (Life Republic – i Towers)
// Notice: IT STARTS AT 'INITIATED' so the presenter or CPA can assign the valuer live,
// OR they can click "+ New APF Case" to start a 100% fresh case!
export const INITIAL_SEED_CASES: APFCase[] = [
  {
    id: 'APF-2026-0001',
    apfNumber: 'APF/PUN/2026/0091',
    createdAt: '2026-09-21 09:30:00',
    createdBy: 'Rohan Deshmukh (CPA)',
    currentStatus: 'INITIATED',
    currentOwnerRole: 'CPA',
    currentOwnerName: 'Rohan Deshmukh',
    slaDueDate: '2026-09-23 18:00:00',
    priority: 'High',
    requestType: 'New APF',
    businessUnit: 'Retail Mortgage Assets',
    branch: 'Pune Main Branch (Code 0412)',
    proposedExposureCr: 85.0,
    requestedRetailSourcingLimitCr: 150.0,
    builderId: 'BLD-PUN-001',
    projectId: 'PRJ-PUN-001',
    phaseId: 'PHS-PUN-001-01',
    selectedTowerIds: ['TWR-PUN-001-E', 'TWR-PUN-001-G'],
    auditTrail: [
      {
        id: 'EVT-001',
        timestamp: '2026-09-21 09:30:15',
        actorName: 'Rohan Deshmukh',
        actorRole: 'CPA',
        action: 'APF_CASE_INITIATED',
        priorStatus: 'DRAFT',
        newStatus: 'INITIATED',
        remarks: 'New APF docket initiated for Kolte-Patil Life Republic i Towers (Buildings E & G). Clean MCA & MahaRERA pre-check.',
        deviceInfo: 'Chrome 128 / Windows 11 Enterprise (IP: 10.4.12.89)',
      },
    ],
  },
];

class APFTransactionStore {
  private cases: APFCase[] = [];
  private currentUser: UserAccount | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedAuth) {
        this.currentUser = JSON.parse(savedAuth);
      } else {
        // Default to CPA user for quick start
        this.currentUser = DEMO_USERS['cpa01'];
      }

      const savedCases = localStorage.getItem(STORAGE_KEY_CASES);
      if (savedCases) {
        this.cases = JSON.parse(savedCases);
      } else {
        this.cases = JSON.parse(JSON.stringify(INITIAL_SEED_CASES));
        this.saveCases();
      }
    } catch (e) {
      console.error('Failed to load APF store:', e);
      this.cases = JSON.parse(JSON.stringify(INITIAL_SEED_CASES));
      this.currentUser = DEMO_USERS['cpa01'];
    }
  }

  private saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(this.cases));
    } catch (e) {
      console.error('Failed to save APF cases:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- Auth & Session ---
  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public login(username: string, passwordHash: string): { success: boolean; error?: string } {
    const user = DEMO_USERS[username.trim().toLowerCase()];
    if (!user) {
      return { success: false, error: 'Invalid username. Try demo credentials e.g. cpa01, valuer.ext01, com01' };
    }
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid password. (Default is Demo@123)' };
    }

    const { passwordHash: _, ...authAccount } = user;
    this.currentUser = authAccount;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
    this.notify();
    return { success: true };
  }

  public quickSwitchUser(username: string): void {
    const user = DEMO_USERS[username.trim().toLowerCase()];
    if (user) {
      const { passwordHash: _, ...authAccount } = user;
      this.currentUser = authAccount;
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.notify();
  }

  // --- Case Queries ---
  public getAllCases(): APFCase[] {
    return [...this.cases];
  }

  public getCaseById(id: string): APFCase | undefined {
    return this.cases.find((c) => c.id === id);
  }

  public resetDemoData(): void {
    this.cases = JSON.parse(JSON.stringify(INITIAL_SEED_CASES));
    this.saveCases();
  }

  // --- Workflow Actions ---

  // 1. CPA: Create New Case
  public createNewCase(data: {
    builderId: string;
    projectId: string;
    phaseId: string;
    selectedTowerIds: string[];
    requestType: 'New APF' | 'Renewal' | 'Revaluation';
    businessUnit: string;
    branch: string;
    proposedExposureCr: number;
    requestedRetailSourcingLimitCr: number;
    priority: 'High' | 'Standard' | 'Urgent';
  }): APFCase {
    const user = this.currentUser || DEMO_USERS['cpa01'];
    const caseSeq = (this.cases.length + 1).toString().padStart(4, '0');
    const newCaseId = `APF-2026-${caseSeq}`;

    const newCase: APFCase = {
      id: newCaseId,
      apfNumber: `APF/PUN/2026/${caseSeq}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdBy: `${user.name} (${user.role})`,
      currentStatus: 'INITIATED',
      currentOwnerRole: 'CPA',
      currentOwnerName: user.name,
      slaDueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      priority: data.priority,
      requestType: data.requestType,
      businessUnit: data.businessUnit,
      branch: data.branch,
      proposedExposureCr: data.proposedExposureCr,
      requestedRetailSourcingLimitCr: data.requestedRetailSourcingLimitCr,
      builderId: data.builderId,
      projectId: data.projectId,
      phaseId: data.phaseId,
      selectedTowerIds: data.selectedTowerIds,
      auditTrail: [
        {
          id: `EVT-${Date.now()}-01`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actorName: user.name,
          actorRole: user.role,
          action: 'APF_CASE_INITIATED',
          priorStatus: 'DRAFT',
          newStatus: 'INITIATED',
          remarks: `Initiated APF case ${newCaseId} for project ${data.projectId}. Scope: ${data.selectedTowerIds.join(', ')}.`,
          deviceInfo: 'Web Banking Gateway / Session ID ' + Math.random().toString(36).substring(2, 8),
        },
      ],
    };

    this.cases.unshift(newCase);
    this.saveCases();
    return newCase;
  }

  // 2. CPA: Assign Valuer
  public assignValuer(caseId: string, assignment: ValuerAssignmentDetails): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser || DEMO_USERS['cpa01'];

    c.valuerAssignment = assignment;
    c.currentStatus = 'ASSIGNED_TO_VALUER';
    c.currentOwnerRole = assignment.valuerType === 'Internal' ? 'INTERNAL_VALUER' : 'EXTERNAL_VALUER';
    c.currentOwnerName = assignment.assignedUserName;

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'VALUER_ASSIGNED',
      priorStatus: 'INITIATED',
      newStatus: 'ASSIGNED_TO_VALUER',
      remarks: `Assigned ${assignment.valuerType} valuer: ${assignment.assignedUserName} (${assignment.vendorAgency}). SLA: ${assignment.slaDueDate}.`,
      deviceInfo: 'CPA Desktop Underwriting Hub',
    });

    this.saveCases();
    return true;
  }

  // 3. Valuer: Accept Assignment
  public acceptValuerAssignment(caseId: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.currentStatus = 'VALUER_ACCEPTED';
    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'ASSIGNMENT_ACCEPTED',
      priorStatus: 'ASSIGNED_TO_VALUER',
      newStatus: 'VALUER_ACCEPTED',
      remarks: `Valuer accepted scope for towers: ${c.valuerAssignment?.scopeTowerNames.join(', ')}. Conflict-of-interest declared clean.`,
      deviceInfo: 'Valuer Mobile Appraisal App v2.4 (Android 14)',
    });

    this.saveCases();
    return true;
  }

  // 4. Valuer: Start Site Visit (GPS lock)
  public startSiteVisit(caseId: string, gpsLat: number, gpsLng: number): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.currentStatus = 'SITE_VISIT_IN_PROGRESS';
    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'SITE_VISIT_STARTED',
      priorStatus: 'VALUER_ACCEPTED',
      newStatus: 'SITE_VISIT_IN_PROGRESS',
      remarks: `Mobile site inspection started at GPS [${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}]. Geofence: INSIDE_BOUNDARY (±3.2m accuracy).`,
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821) / GPS Hardware Lock',
    });

    this.saveCases();
    return true;
  }

  // 5. Valuer: Submit Valuation Report
  public submitValuationReport(
    caseId: string,
    report: ValuationReportData,
    evidence: SiteVisitEvidence[],
    comps: MarketComparable[]
  ): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.valuationReport = report;
    c.siteVisitEvidence = evidence;
    c.marketComparables = comps;
    c.currentStatus = 'VALUATION_SUBMITTED';
    c.currentOwnerRole = 'CPA';
    c.currentOwnerName = 'Rohan Deshmukh (CPA)';

    // AUTOMATIC EXPOSURE RECONCILIATION ENGINE:
    // Generate refreshed Exposure 360 immediately upon report submission!
    c.exposureSnapshot = this.generateExposureSnapshot(c, report.adoptedBaseRateSqFt);

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'VALUATION_REPORT_SUBMITTED',
      priorStatus: 'SITE_VISIT_IN_PROGRESS',
      newStatus: 'VALUATION_SUBMITTED',
      remarks: `Submitted independent valuation report (Grade ${report.technicalGrade}, Base Rate ₹${report.adoptedBaseRateSqFt.toLocaleString()}/sq.ft). Locked with SHA-256 hash: ${report.reportHash.substring(0, 24)}...`,
      deviceInfo: 'Valuer Portal Digital Signature Engine (Aadhaar eSign Class 3)',
    });

    this.saveCases();
    return true;
  }

  // 6. CPA: Rework
  public cpaSendBackForRework(caseId: string, remarks: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.currentStatus = 'VALUATION_REWORK';
    c.currentOwnerRole = c.valuerAssignment?.valuerType === 'Internal' ? 'INTERNAL_VALUER' : 'EXTERNAL_VALUER';
    c.currentOwnerName = c.valuerAssignment?.assignedUserName || 'Assigned Valuer';

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'SENT_BACK_FOR_REWORK',
      priorStatus: 'VALUATION_SUBMITTED',
      newStatus: 'VALUATION_REWORK',
      remarks: `CPA requested valuation rework: ${remarks}`,
      deviceInfo: 'CPA Underwriting Station',
    });

    this.saveCases();
    return true;
  }

  // 7. CPA: Submit to COM
  public cpaSubmitToCom(caseId: string, notes: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.cpaReviewNotes = notes;
    c.currentStatus = 'COM_REVIEW';
    c.currentOwnerRole = 'COM';
    c.currentOwnerName = 'Amitav Sen (COM)';

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'CPA_SUBMITTED_TO_COM',
      priorStatus: 'VALUATION_SUBMITTED',
      newStatus: 'COM_REVIEW',
      remarks: `CPA completed assessment and submitted to COM. Recommendation: ${notes}`,
      deviceInfo: 'CPA Desktop Underwriting Hub',
    });

    this.saveCases();
    return true;
  }

  // 8. COM: Submit to Approver / Committee
  public comSubmitToApprover(caseId: string, notes: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.comReviewNotes = notes;
    c.currentStatus = 'PENDING_APPROVAL';
    c.currentOwnerRole = 'APPROVER';
    c.currentOwnerName = 'Priya Sharma (Approving Manager)';

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'COM_ENDORSED_TO_APPROVER',
      priorStatus: 'COM_REVIEW',
      newStatus: 'PENDING_APPROVAL',
      remarks: `COM endorsed underwriting docket for Zonal Committee sanction. Note: ${notes}`,
      deviceInfo: 'COM Supervisory Console',
    });

    this.saveCases();
    return true;
  }

  // 9. Approver: Make Decision
  public approverDecide(
    caseId: string,
    decision: 'APPROVED' | 'CONDITIONAL_APPROVAL' | 'REJECTED' | 'DEFERRED',
    decisionNotes: string,
    conditions: ApprovalConditionItem[]
  ): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.currentStatus = decision;
    c.currentOwnerRole = 'CPA'; // Returns to CPA / COM to send to LOS
    c.currentOwnerName = 'Rohan Deshmukh (CPA)';

    c.approvalDecision = {
      decision,
      decidedBy: user.name,
      decidedRole: user.roleLabel,
      decidedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      quorumCount: 3,
      voters: ['Priya Sharma (Zonal Credit Head)', 'Vikram Malhotra (ZCC Member)', 'Amitav Sen (COM)'],
      decisionNotes,
      conditions,
    };

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: `SANCTION_DECISION_${decision}`,
      priorStatus: 'PENDING_APPROVAL',
      newStatus: decision,
      remarks: `Sanction Decision: ${decision}. Notes: ${decisionNotes}. Registered covenants: ${conditions.length}.`,
      deviceInfo: 'Zonal Credit Committee Digital Cockpit',
    });

    this.saveCases();
    return true;
  }

  // 10. Send to LOS
  public sendToLos(caseId: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    if (c.currentStatus !== 'APPROVED' && c.currentStatus !== 'CONDITIONAL_APPROVAL') {
      return false;
    }
    const user = this.currentUser!;

    const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
    const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
    const phase = CENTRAL_PHASE_MASTER.find((ph) => ph.id === c.phaseId);
    const towers = CENTRAL_TOWER_MASTER.filter((t) => c.selectedTowerIds.includes(t.id));

    const idempotencyKey = `IDEMP-${c.id}-${Date.now()}`;
    const payload: LOSOutboundPayload = {
      apfCaseId: c.id,
      apfNumber: c.apfNumber || `APF/PUN/2026/0091`,
      builderId: c.builderId,
      builderLegalName: builder?.legalName || 'Builder',
      builderGroupId: builder?.groupName || 'Group',
      projectId: c.projectId,
      projectName: project?.projectName || 'Project',
      reraNumbers: project?.reraNumbers || ['P52100022154'],
      approvedPhase: phase?.phaseName || 'Phase 1',
      approvedTowers: towers.map((t) => t.towerName),
      approvalStatus: c.currentStatus,
      approvalDate: c.approvalDecision?.decidedAt || new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      technicalGrade: c.valuationReport?.technicalGrade || 'A+',
      approvedValuationRate: c.valuationReport?.recommendedApfRateSqFt || 7450,
      rateMatrix: {
        '2 BHK': c.valuationReport?.rateBand2BHK || '₹7,200 - ₹7,500/sq.ft',
        '3 BHK': c.valuationReport?.rateBand3BHK || '₹7,450 - ₹7,800/sq.ft',
      },
      riskBand: 'Low (Tier 1 Builder)',
      approvalConditions: c.approvalDecision?.conditions.map((cd) => cd.conditionText) || [],
      exposureSnapshotId: c.exposureSnapshot?.snapshotId || 'EXP-SNAP-2026-001',
      documentRefs: [
        'DMS-RERA-P52100022154-CERT.pdf',
        'DMS-SANCTIONED-LAYOUT-REV4.pdf',
        'DMS-VALUATION-REPORT-FINAL-SIGNED.pdf',
        'DMS-ZCC-SANCTION-MINUTES.pdf',
      ],
      reportHash: c.valuationReport?.reportHash || 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      payloadVersion: '2.4.0',
      sourceSystem: 'PROVAL_APF_UNDERWRITING_ENGINE',
      idempotencyKey,
      sentBy: user.email,
      sentAt: new Date().toISOString(),
    };

    c.losPayload = payload;
    c.currentStatus = 'SENT_TO_LOS';

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}-SEND`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'SENT_TO_LOS',
      priorStatus: 'APPROVED',
      newStatus: 'SENT_TO_LOS',
      remarks: `LOS payload dispatched via mTLS REST Gateway. Idempotency Key: ${idempotencyKey}`,
      deviceInfo: 'Core LOS Enterprise Service Bus (ESB)',
    });

    // Simulated immediate LOS Acknowledgement (201 Created)
    const losResponse: LOSResponseData = {
      status: 'SUCCESS',
      losApfId: `LOS-APF-${Math.floor(10000 + Math.random() * 90000)}`,
      acknowledgementId: `ACK-${Date.now().toString().slice(-8)}`,
      message: 'APF Scheme successfully registered in Core Loan Origination System. Project open for retail branch login.',
      receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    c.losResponse = losResponse;
    c.currentStatus = 'APF_ACTIVE';
    c.currentOwnerRole = 'CPA';
    c.currentOwnerName = 'LOS System Interface (Active)';

    c.auditTrail.unshift({
      id: `EVT-${Date.now()}-ACK`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: 'LOS Gateway Service',
      actorRole: 'ADMIN',
      action: 'LOS_ACK_RECEIVED',
      priorStatus: 'SENT_TO_LOS',
      newStatus: 'APF_ACTIVE',
      remarks: `LOS Acknowledged scheme creation: ${losResponse.losApfId}. Scheme is now ACTIVE across all retail branches.`,
      deviceInfo: 'Core Banking CBS / FinnOne Gateway API Worker',
    });

    this.saveCases();
    return true;
  }

  // Exposure Generator
  private generateExposureSnapshot(c: APFCase, baseRateSqFt: number): ExposureSnapshot {
    const requestedRetailCr = c.requestedRetailSourcingLimitCr || 150.0;
    const directSanctionedCr = 45.0;
    const projectFinanceCr = 42.0;
    const existingApfCr = 214.2;
    const pipelineCr = 28.5;
    const aggregateGroupCr = 484.7;
    const groupLimitCr = 600.0;

    return {
      snapshotId: `EXP-${c.id}-${Date.now()}`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      directBuilderExposureCr: directSanctionedCr,
      projectFinanceExposureCr: projectFinanceCr,
      existingApfExposureCr: existingApfCr,
      retailLinkedExposureCr: requestedRetailCr,
      pipelineExposureCr: pipelineCr,
      aggregateGroupExposureCr: aggregateGroupCr,
      groupSanctionLimitCr: groupLimitCr,
      groupHeadroomCr: groupLimitCr - aggregateGroupCr,
      builderConcentrationPct: 14.8,
      cityConcentrationPct: 22.4,
      buckets: [
        {
          category: 'Direct Builder Exposure',
          sanctionedCr: 50.0,
          outstandingCr: directSanctionedCr,
          source: 'Core CBS Loan Master',
          asOfDate: '2026-09-18',
          freshness: 'T-3 Days',
          isReconciled: true,
          notes: 'Term Loan TL-2022-81 (Secured against Phase 1 land)',
          isSimulatedBankData: true,
        },
        {
          category: 'Project Finance Borrowings',
          sanctionedCr: 45.0,
          outstandingCr: projectFinanceCr,
          source: 'MCA Form CHG-1 & CRILC',
          asOfDate: '2026-09-02',
          freshness: 'T-19 Days',
          isReconciled: true,
          notes: 'Piramal Capital CF (Tower B Charge, Pari-Passu NOC required)',
          isSimulatedBankData: true,
        },
        {
          category: 'Existing APF Exposure (Retail)',
          sanctionedCr: 240.0,
          outstandingCr: existingApfCr,
          source: 'Retail Mortgage LMS',
          asOfDate: '2026-09-20',
          freshness: 'Real-Time',
          isReconciled: true,
          notes: '112 Active Home Loans across completed towers',
          isSimulatedBankData: true,
        },
        {
          category: 'Proposed Project-Linked APF',
          sanctionedCr: requestedRetailCr,
          outstandingCr: 0.0,
          source: 'Current Underwriting Request',
          asOfDate: '2026-09-21',
          freshness: 'Current',
          isReconciled: true,
          notes: 'Scope: Buildings E & G retail home loan sourcing',
          isSimulatedBankData: true,
        },
        {
          category: 'Pipeline Applications',
          sanctionedCr: 0.0,
          outstandingCr: pipelineCr,
          source: 'LOS In-flight Queue',
          asOfDate: '2026-09-21',
          freshness: 'Real-Time',
          isReconciled: false,
          notes: '18 logged home loan files awaiting sanction',
          isSimulatedBankData: true,
        },
        {
          category: 'Aggregate Group Exposure',
          sanctionedCr: groupLimitCr,
          outstandingCr: aggregateGroupCr,
          source: 'Group Intelligence Graph',
          asOfDate: '2026-09-15',
          freshness: 'T-6 Days',
          isReconciled: true,
          notes: 'Across 4 SPVs (80.7% utilization of ₹600 Cr Group Cap)',
          isSimulatedBankData: true,
        },
      ],
    };
  }
}

export const apfStore = new APFTransactionStore();
