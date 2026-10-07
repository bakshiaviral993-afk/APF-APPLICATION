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
  BankValuationReportData,
} from '../types/apfTransaction';
import {
  DEMO_USERS,
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_TOWER_MASTER,
  CENTRAL_PHASE_MASTER,
} from '../data/centralMasterData';
import { demoExposureService } from './demoExposureService';

export type GeofenceAlertDispatcher = (params: {
  caseId: string;
  valuer: { id?: string; name: string; role: UserRole };
  attemptedLat: number;
  attemptedLng: number;
  distanceMeters: number;
  projectAddress: string;
  projectLat: number;
  projectLng: number;
  attemptedAddress?: string;
  notes?: string;
}) => { queryIds: string[]; breachId: string };

let _geofenceAlertDispatcher: GeofenceAlertDispatcher | null = null;
export const registerGeofenceAlertDispatcher = (dispatcher: GeofenceAlertDispatcher) => {
  _geofenceAlertDispatcher = dispatcher;
};

export interface RecordValuerPinResult {
  success: boolean;
  blocked?: boolean;
  error?: string;
  message?: string;
  distanceMeters?: number;
  breachId?: string;
  queryIds?: string[];
}

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
  {
    id: 'APF-2026-0002',
    apfNumber: 'APF/PUN/2026/0092',
    createdAt: '2026-09-21 11:15:00',
    createdBy: 'Rohan Deshmukh (CPA)',
    currentStatus: 'ASSIGNED_TO_VALUER',
    currentOwnerRole: 'EXTERNAL_VALUER',
    currentOwnerName: 'M. K. Kulkarni (Empanelled Valuer)',
    slaDueDate: '2026-09-24 17:00:00',
    priority: 'High',
    requestType: 'New APF',
    businessUnit: 'Retail Mortgage Assets',
    branch: 'Pune Main Branch (Code 0412)',
    proposedExposureCr: 120.0,
    requestedRetailSourcingLimitCr: 200.0,
    builderId: 'BLD-PUN-002',
    projectId: 'PRJ-PUN-002',
    phaseId: 'PHS-PUN-002-01',
    selectedTowerIds: ['TWR-PUN-002-A', 'TWR-PUN-002-B'],
    valuerAssignment: {
      valuerType: 'External',
      assignedUserId: 'USR-VAL-EXT-001',
      assignedUserName: 'M. K. Kulkarni (Empanelled Valuer)',
      vendorAgency: 'Knight Frank Valuation Services LLP',
      assignedAt: '2026-09-21 11:30:00',
      slaDueDate: '2026-09-24 17:00:00',
      scheduledVisitDate: '2026-09-23',
      scopeTowerIds: ['TWR-PUN-002-A', 'TWR-PUN-002-B'],
      scopeTowerNames: ['Tower Aspen', 'Tower Cedar'],
      instructions: 'Detailed technical & physical valuation inspection. Inspect RCC slab progress, boundary adherence & MahaRERA compliance.',
      siteContactName: 'Pradeep Joshi (Site Incharge)',
      siteContactPhone: '+91 98221 54321',
      conflictDeclared: true,
      pinnedLocation: {
        lat: 18.5284,
        lng: 73.7421,
        pinnedAt: '2026-09-22 10:15:00',
        pinnedBy: 'M. K. Kulkarni',
        pinnedByRole: 'EXTERNAL_VALUER',
        accuracyMeters: 3.5,
        address: 'Survey No. 34, Bavdhan / Paud Road, Pune',
        distanceFromProjectMeters: 42,
        isInsideGeofence: true,
      },
    },
    auditTrail: [
      {
        id: 'EVT-002-01',
        timestamp: '2026-09-21 11:15:00',
        actorName: 'Rohan Deshmukh',
        actorRole: 'CPA',
        action: 'APF_CASE_INITIATED',
        priorStatus: 'DRAFT',
        newStatus: 'INITIATED',
        remarks: 'Docket created for Shapoorji Pallonji Vanaha – Yahavi.',
        deviceInfo: 'CPA Workstation',
      },
      {
        id: 'EVT-002-02',
        timestamp: '2026-09-21 11:30:00',
        actorName: 'Rohan Deshmukh',
        actorRole: 'CPA',
        action: 'VALUER_ASSIGNED',
        priorStatus: 'INITIATED',
        newStatus: 'ASSIGNED_TO_VALUER',
        remarks: 'Assigned to Knight Frank Valuation Services LLP (M. K. Kulkarni) with 72-hour SLA TAT.',
        deviceInfo: 'Valuation Allocation Engine',
      },
    ],
  },
  {
    id: 'APF-2026-0003',
    apfNumber: 'APF/PUN/2026/0093',
    createdAt: '2026-09-20 14:00:00',
    createdBy: 'Rohan Deshmukh (CPA)',
    currentStatus: 'VALUATION_SUBMITTED',
    currentOwnerRole: 'CPA',
    currentOwnerName: 'Rohan Deshmukh',
    slaDueDate: '2026-09-25 18:00:00',
    priority: 'High',
    requestType: 'New APF',
    businessUnit: 'Retail Mortgage Assets',
    branch: 'Pune Main Branch (Code 0412)',
    proposedExposureCr: 95.0,
    requestedRetailSourcingLimitCr: 160.0,
    builderId: 'BLD-PUN-003',
    projectId: 'PRJ-PUN-003',
    phaseId: 'PHS-PUN-003-01',
    selectedTowerIds: ['TWR-PUN-003-A', 'TWR-PUN-003-B'],
    valuerAssignment: {
      valuerType: 'External',
      assignedUserId: 'USR-VAL-EXT-001',
      assignedUserName: 'M. K. Kulkarni (Empanelled Valuer)',
      vendorAgency: 'Knight Frank Valuation Services LLP',
      assignedAt: '2026-09-20 15:00:00',
      slaDueDate: '2026-09-22 18:00:00',
      scheduledVisitDate: '2026-09-21',
      scopeTowerIds: ['TWR-PUN-003-A', 'TWR-PUN-003-B'],
      scopeTowerNames: ['Tower 1', 'Tower 2'],
      instructions: 'Technical Site Visit and GPS verification',
      siteContactName: 'Ajay Kadam',
      siteContactPhone: '+91 98900 11223',
      conflictDeclared: true,
      pinnedLocation: {
        lat: 18.5089,
        lng: 73.9482,
        pinnedAt: '2026-09-21 11:20:00',
        pinnedBy: 'M. K. Kulkarni',
        pinnedByRole: 'EXTERNAL_VALUER',
        accuracyMeters: 2.8,
        address: 'Godrej Infinity, Keshavnagar, Mundhwa, Pune 411036',
        distanceFromProjectMeters: 35,
        isInsideGeofence: true,
      },
    },
    valuationReport: {
      reportVersion: 'v1.0',
      reportHash: 'a7f3e829c9b1d402e1b8c4d9e03f5a2b1c8e7d6f5a4b3c2d1e0f9a8b7c6d5e4f',
      submittedAt: '2026-09-22 16:45:00',
      submittedBy: 'M. K. Kulkarni (Empanelled Valuer)',
      adoptedBaseRateSqFt: 7200,
      fairMarketValueCr: 244.8,
      realizableValueCr: 220.3,
      distressValueCr: 195.8,
      recommendedApfRateSqFt: 7000,
      technicalGrade: 'A',
      locationScore: 4.5,
      constructionScore: 4.2,
      infrastructureScore: 4.0,
      marketabilityScore: 4.3,
      rateBand2BHK: '₹7,000 - ₹7,500',
      rateBand3BHK: '₹7,200 - ₹7,700',
      validityMonths: 3,
      keyObservations: [
        'Construction is on schedule with 16 of 22 slabs completed for Tower 1',
        'High marketability in Keshavnagar corridor with strong tech buyer demand',
        'No unauthorized deviation or structural infringement detected',
      ],
      valuerRecommendation: 'Recommended for Bank APF approval at base rate of ₹7,200/sq.ft. All statutory approvals verified.',
      digitalSignature: 'SHA256:e8b91a72d3c4... (Aadhaar eSign Class 3 - M. K. Kulkarni)',
    },
    auditTrail: [
      {
        id: 'EVT-003-01',
        timestamp: '2026-09-20 14:00:00',
        actorName: 'Rohan Deshmukh',
        actorRole: 'CPA',
        action: 'APF_CASE_INITIATED',
        priorStatus: 'DRAFT',
        newStatus: 'INITIATED',
        remarks: 'New APF docket for Godrej Infinity (Towers 1 & 2).',
        deviceInfo: 'CPA Workstation',
      },
      {
        id: 'EVT-003-02',
        timestamp: '2026-09-22 16:45:00',
        actorName: 'M. K. Kulkarni',
        actorRole: 'EXTERNAL_VALUER',
        action: 'VALUATION_REPORT_SUBMITTED',
        priorStatus: 'SITE_VISIT_IN_PROGRESS',
        newStatus: 'VALUATION_SUBMITTED',
        remarks: 'Submitted independent valuation report (Grade A, Base Rate ₹7,200/sq.ft). Geofence verified on Google Maps.',
        deviceInfo: 'Valuer Portal Digital Signature Engine',
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

  public saveCases() {
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

  // 4b. Valuer: Pin Location on Google Maps & Save Geotagged Evidence
  public recordValuerPinnedLocation(
    caseId: string,
    pinnedData: {
      lat: number;
      lng: number;
      accuracyMeters: number;
      address?: string;
      distanceFromProjectMeters?: number;
      isInsideGeofence: boolean;
      notes?: string;
    }
  ): RecordValuerPinResult {
    const c = this.getCaseById(caseId);
    if (!c) return { success: false, error: 'Case not found' };
    const user = this.currentUser || { name: 'Empanelled Valuer', role: 'EXTERNAL_VALUER' as const, id: 'VAL-01' };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Retrieve Project Master for site address & anchor coordinates verification
    const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId) || {
      projectName: 'Sanctioned Project Site',
      address: 'Sanctioned MahaRERA Project Site Perimeter',
      latLong: { lat: 18.6186, lng: 73.7149 },
    };

    const distMeters = Math.round(pinnedData.distanceFromProjectMeters ?? 0);
    const isMismatch = !pinnedData.isInsideGeofence || distMeters > 500;

    // STRICT ENFORCEMENT: If location does not match site address / exceeds geofence boundary,
    // DO NOT allow valuer to pin or update location. Dispatch immediate high-severity alerts to CPA, COM, ACOM & Approving Authority.
    if (isMismatch) {
      let breachResult: { queryIds: string[]; breachId: string } | undefined;

      if (_geofenceAlertDispatcher) {
        breachResult = _geofenceAlertDispatcher({
          caseId,
          valuer: { id: user.id, name: user.name, role: user.role },
          attemptedLat: pinnedData.lat,
          attemptedLng: pinnedData.lng,
          distanceMeters: distMeters,
          projectAddress: `${project.projectName} — ${project.address}`,
          projectLat: project.latLong.lat,
          projectLng: project.latLong.lng,
          attemptedAddress: pinnedData.address,
          notes: pinnedData.notes,
        });
      } else {
        // Fallback internal alert logging
        const breachId = `GF-BREACH-${Date.now()}`;
        const breachItem = {
          id: breachId,
          attemptedAt: now,
          attemptedBy: user.name,
          attemptedRole: user.role,
          attemptedLat: pinnedData.lat,
          attemptedLng: pinnedData.lng,
          distanceFromProjectMeters: distMeters,
          projectAddress: `${project.projectName} — ${project.address}`,
          projectLat: project.latLong.lat,
          projectLng: project.latLong.lng,
          attemptedAddress: pinnedData.address,
          status: 'ACTIVE_ALERT' as const,
          alertedRoles: ['CPA', 'COM', 'ACOM', 'APPROVER'] as ('CPA' | 'COM' | 'ACOM' | 'APPROVER')[],
          reasonNotes: pinnedData.notes,
        };

        if (!c.geofenceBreachAlerts) c.geofenceBreachAlerts = [];
        c.geofenceBreachAlerts.unshift(breachItem);
        c.latestGeofenceBreach = breachItem;

        c.auditTrail.unshift({
          id: `EVT-GF-BLOCK-${Date.now()}`,
          timestamp: now,
          actorName: user.name,
          actorRole: user.role,
          action: 'GEOLOCATION_MISMATCH_BREACH_ALERT',
          priorStatus: c.currentStatus,
          newStatus: c.currentStatus,
          remarks: `GEOFENCE MISMATCH BLOCKED: Valuer attempted to pin coordinates [${pinnedData.lat.toFixed(6)}, ${pinnedData.lng.toFixed(6)}] which does NOT match the registered project site address "${project.address}" (${distMeters}m deviation). Update was STRICTLY BLOCKED. Alerts sent to CPA, COM, ACOM & Approving Authorities.`,
          deviceInfo: 'Google Maps Geofence Compliance Engine',
        });

        this.saveCases();
        breachResult = { queryIds: [], breachId };
      }

      return {
        success: false,
        blocked: true,
        error: 'GEOFENCE_SITE_MISMATCH_PROHIBITED',
        distanceMeters: distMeters,
        breachId: breachResult?.breachId,
        queryIds: breachResult?.queryIds,
        message: `Pinning rejected: Selected coordinates are ${distMeters}m away from the sanctioned project site address: "${project.address}". Geofence breach alerts have been dispatched to CPA, COM, ACOM & Approving Authorities.`,
      };
    }

    // Inside Sanctioned Geofence: Pinning is Permitted
    if (!c.valuerAssignment) {
      c.valuerAssignment = {
        valuerType: 'External',
        assignedUserId: user.id || 'VAL-01',
        assignedUserName: user.name,
        vendorAgency: 'Colliers Valuation Services Pvt Ltd',
        assignedAt: now,
        slaDueDate: now,
        scheduledVisitDate: now,
        scopeTowerIds: c.selectedTowerIds,
        scopeTowerNames: ['Selected Towers'],
        instructions: 'Technical Site Visit and GPS verification',
        siteContactName: 'Site Supervisor',
        siteContactPhone: '+91 98220 12345',
        conflictDeclared: true,
      };
    }

    c.valuerAssignment.pinnedLocation = {
      lat: pinnedData.lat,
      lng: pinnedData.lng,
      pinnedAt: now,
      pinnedBy: user.name,
      pinnedByRole: user.role,
      accuracyMeters: pinnedData.accuracyMeters,
      address: pinnedData.address,
      distanceFromProjectMeters: pinnedData.distanceFromProjectMeters,
      isInsideGeofence: true,
      notes: pinnedData.notes,
    };

    if (!c.siteVisitEvidence) {
      c.siteVisitEvidence = [];
    }

    // Add or update the geotagged pin evidence
    const existingPinEvidenceIndex = c.siteVisitEvidence.findIndex(
      (ev) => ev.deviceSessionId === 'GMP-VALUER-PIN-SESSION'
    );

    const newEvidence = {
      id: `EV-${Date.now()}`,
      category: 'Construction' as const,
      title: 'Valuer Google Maps Geotagged Pin Lock (Verified Within Site Perimeter)',
      timestamp: now,
      lat: Number(pinnedData.lat.toFixed(6)),
      lng: Number(pinnedData.lng.toFixed(6)),
      accuracyMeters: pinnedData.accuracyMeters || 3.2,
      isInsideGeofence: true,
      capturedBy: user.name,
      deviceSessionId: 'GMP-VALUER-PIN-SESSION',
      notes:
        pinnedData.notes ||
        `Valuer verified and pinned location on Google Maps: ${pinnedData.address || `${pinnedData.lat.toFixed(5)}, ${pinnedData.lng.toFixed(5)}`}. Distance to project center: ${distMeters}m (Within 500m sanctioned perimeter).`,
    };

    if (existingPinEvidenceIndex >= 0) {
      c.siteVisitEvidence[existingPinEvidenceIndex] = newEvidence;
    } else {
      c.siteVisitEvidence.unshift(newEvidence);
    }

    // If case is in VALUER_ACCEPTED, automatically advance to SITE_VISIT_IN_PROGRESS upon pinning location
    const priorStatus = c.currentStatus;
    if (c.currentStatus === 'VALUER_ACCEPTED') {
      c.currentStatus = 'SITE_VISIT_IN_PROGRESS';
    }

    // Clear active breach warning if now verified inside geofence
    if (c.latestGeofenceBreach && c.latestGeofenceBreach.status === 'ACTIVE_ALERT') {
      c.latestGeofenceBreach.status = 'DISMISSED';
      c.latestGeofenceBreach.reviewRemarks = 'Resolved: Valuer successfully re-positioned and locked coordinates within the sanctioned project perimeter.';
    }

    c.auditTrail.unshift({
      id: `EVT-GMP-${Date.now()}`,
      timestamp: now,
      actorName: user.name,
      actorRole: user.role,
      action: 'VALUER_LOCATION_PINNED_GOOGLE_MAPS',
      priorStatus: priorStatus,
      newStatus: c.currentStatus,
      remarks: `Valuer verified and pinned coordinates on Google Maps: [${pinnedData.lat.toFixed(6)}, ${pinnedData.lng.toFixed(6)}]. Address: "${pinnedData.address || 'Sanctioned Site Area'}". Geofence: VERIFIED_INSIDE_BOUNDARY (Dist: ${distMeters}m).`,
      deviceInfo: 'Google Maps Platform Geolocation & Geofence Engine',
    });

    this.saveCases();
    return { success: true, message: 'Location verified and pinned successfully within project boundary.' };
  }

  // Review Geofence Breach (By COM, ACOM, or Approver)
  public reviewGeofenceBreach(
    caseId: string,
    decision: 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION' | 'REJECT_AND_DEMAND_PHYSICAL_VISIT',
    remarks: string,
    reviewerUser?: UserAccount
  ): boolean {
    const c = this.getCaseById(caseId);
    if (!c || !c.latestGeofenceBreach) return false;
    const reviewer = reviewerUser || this.currentUser || { name: 'Credit Operations Manager', role: 'COM' as const };
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    c.latestGeofenceBreach.status =
      decision === 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION'
        ? 'EXCEPTION_OVERRIDDEN'
        : 'REVIEWED_BY_COM';
    c.latestGeofenceBreach.reviewedBy = `${reviewer.name} (${reviewer.role})`;
    c.latestGeofenceBreach.reviewedAt = now;
    c.latestGeofenceBreach.reviewRemarks = remarks;

    c.auditTrail.unshift({
      id: `EVT-GF-REVIEW-${Date.now()}`,
      timestamp: now,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: `GEOFENCE_BREACH_${decision}`,
      priorStatus: c.currentStatus,
      newStatus: c.currentStatus,
      remarks: `${reviewer.role} reviewed geofence mismatch breach. Decision: ${decision}. Remarks: ${remarks}`,
      deviceInfo: 'PROVAL Credit Risk Governance Console',
    });

    this.saveCases();
    return true;
  }

  // 5. Valuer: Submit Valuation Report
  public submitValuationReport(
    caseId: string,
    report: ValuationReportData,
    evidence: SiteVisitEvidence[],
    comps: MarketComparable[],
    detailedBankReport?: BankValuationReportData
  ): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser!;

    c.valuationReport = report;
    c.siteVisitEvidence = evidence;
    c.marketComparables = comps;
    if (detailedBankReport) {
      c.bankValuationReport = detailedBankReport;
      c.detailedValuationReport = detailedBankReport;
    } else if ((c as any).detailedValuationReport) {
      c.bankValuationReport = (c as any).detailedValuationReport;
    }
    c.currentStatus = 'VALUATION_SUBMITTED';
    c.currentOwnerRole = 'CPA';
    c.currentOwnerName = 'Rohan Deshmukh (CPA)';

    // AUTOMATIC EXPOSURE RECONCILIATION ENGINE:
    // Generate refreshed Exposure 360 immediately upon report submission!
    c.exposureSnapshot = this.generateExposureSnapshot(c, report.adoptedBaseRateSqFt);
    try {
      // Freeze immutable snapshot in DemoExposureService for audit compliance
      demoExposureService.createOrFreezeSnapshot(c.builderId, c.id, `${user.name} (${user.role})`);
    } catch (e) {
      console.warn('Could not freeze snapshot in demoExposureService', e);
    }

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
      exposureSnapshotId:
        demoExposureService.getLatestSnapshotForBuilder(c.builderId)?.snapshotId ||
        c.exposureSnapshot?.snapshotId ||
        `EXPO-SNAP-${c.builderId}-001`,
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

  // Generalized status update helper
  public updateCaseStatus(caseId: string, newStatus: CaseStatus, remarks?: string): boolean {
    const c = this.getCaseById(caseId);
    if (!c) return false;
    const user = this.currentUser || DEMO_USERS['cpa01'];
    const priorStatus = c.currentStatus;

    c.currentStatus = newStatus;
    c.auditTrail.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: `STATUS_CHANGE_TO_${newStatus}`,
      priorStatus,
      newStatus,
      remarks: remarks || `Status transitioned to ${newStatus}`,
      deviceInfo: 'PROVAL APF Workstation Hub',
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
