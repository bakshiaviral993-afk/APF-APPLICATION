// In-App Communication & Query Management Store with LocalStorage Persistence
import { APFQuery, QueryCategory, QueryPriority, QueryStatus, QueryMessage, QueryDashboardCounts } from '../types/queryTypes';
import { UserAccount, UserRole } from '../types/apfTransaction';
import { apfStore, registerGeofenceAlertDispatcher } from './apfStore';

const STORAGE_KEY_QUERIES = 'PROVAL_APF_QUERIES_V1';

// Pre-seeded realistic banking queries for the demo cases
const INITIAL_QUERIES: APFQuery[] = [
  {
    id: 'QRY-2026-0001',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    builderName: 'Kolte-Patil Developers Ltd',
    projectId: 'PRJ-PUN-001',
    projectName: 'Life Republic Phase 1',
    towerName: 'Tower A1 & A2',
    phaseName: 'Sector R1',
    raisedByUserId: 'usr-cpa-01',
    raisedByUserName: 'Rohan Deshmukh',
    raisedByUserRole: 'CPA',
    assignedToUserId: 'usr-val-ext-01',
    assignedToUserName: 'Vikram Joshi (Senior Valuer)',
    assignedToRole: 'EXTERNAL_VALUER',
    category: 'Valuation',
    subject: 'Micro-market comparable clarification for Tower A2 top floors',
    queryText: 'Please furnish registered IGR deed evidence or builder allotment rates supporting ₹7,450/sq.ft for upper floors in Tower A2.',
    priority: 'High',
    isBlocking: false,
    dueDate: '2026-09-24',
    slaHours: 24,
    relatedModule: 'Valuation',
    relatedField: 'Market Comparables / Base Rate',
    status: 'INPUT_REQUIRED',
    createdAt: '2026-09-22 10:30:00',
    updatedAt: '2026-09-22 10:30:00',
    messages: [
      {
        id: 'MSG-001',
        queryId: 'QRY-2026-0001',
        senderId: 'usr-cpa-01',
        senderName: 'Rohan Deshmukh',
        senderRole: 'CPA',
        timestamp: '2026-09-22 10:30:00',
        message: 'Please furnish registered IGR deed evidence or builder allotment rates supporting ₹7,450/sq.ft for upper floors in Tower A2.',
        statusChange: 'INPUT_REQUIRED',
      },
    ],
  },
  {
    id: 'QRY-2026-0002',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    builderName: 'Kolte-Patil Developers Ltd',
    projectId: 'PRJ-PUN-001',
    projectName: 'Life Republic Phase 1',
    towerName: 'Tower A1 & A2',
    phaseName: 'Sector R1',
    raisedByUserId: 'usr-com-01',
    raisedByUserName: 'Amitav Sen',
    raisedByUserRole: 'COM',
    assignedToUserId: 'usr-cpa-01',
    assignedToUserName: 'Rohan Deshmukh',
    assignedToRole: 'CPA',
    category: 'Exposure',
    subject: 'Confirmation on HDFC Bank consortium charge release letter',
    queryText: 'HDFC Bank project finance charge of ₹84.5 Cr is shown on MCA index. Has the No-Dues / Partial Release certificate been verified for Phase 1 towers?',
    priority: 'Critical',
    isBlocking: true,
    dueDate: '2026-09-23',
    slaHours: 12,
    relatedModule: 'Exposure 360',
    relatedField: 'MCA Charge Index / CERSAI',
    status: 'INPUT_RECEIVED',
    createdAt: '2026-09-22 09:15:00',
    updatedAt: '2026-09-22 11:42:00',
    messages: [
      {
        id: 'MSG-002',
        queryId: 'QRY-2026-0002',
        senderId: 'usr-com-01',
        senderName: 'Amitav Sen',
        senderRole: 'COM',
        timestamp: '2026-09-22 09:15:00',
        message: 'HDFC Bank project finance charge of ₹84.5 Cr is shown on MCA index. Has the No-Dues / Partial Release certificate been verified for Phase 1 towers?',
        statusChange: 'INPUT_REQUIRED',
      },
      {
        id: 'MSG-003',
        queryId: 'QRY-2026-0002',
        senderId: 'usr-cpa-01',
        senderName: 'Rohan Deshmukh',
        senderRole: 'CPA',
        timestamp: '2026-09-22 11:42:00',
        message: 'Verified. HDFC Bank issued Partial NOC dated 14-Aug-2026 releasing Towers A1 & A2 from the master charge. Escrow account details match CERSAI security ID 88921.',
        inputValue: 'NOC-HDFC-KP-2026-992.pdf verified; CERSAI ID 88921 valid',
        attachmentName: 'HDFC_Partial_Release_NOC.pdf',
        statusChange: 'INPUT_RECEIVED',
      },
    ],
  },
  {
    id: 'QRY-2026-0003',
    caseId: 'APF-2026-0002',
    builderId: 'BLD-PUN-002',
    builderName: 'Shapoorji Pallonji Real Estate',
    projectId: 'PRJ-PUN-002',
    projectName: 'Joyville Hinjawadi',
    towerName: 'Tower Aspen',
    phaseName: 'Phase 2',
    raisedByUserId: 'usr-val-ext-01',
    raisedByUserName: 'Vikram Joshi',
    raisedByUserRole: 'EXTERNAL_VALUER',
    assignedToUserId: 'usr-cpa-01',
    assignedToUserName: 'Rohan Deshmukh',
    assignedToRole: 'CPA',
    category: 'Technical',
    subject: 'Commencement Certificate (CC) extension copy required for 21st to 25th slabs',
    queryText: 'During site visit, slab work is active up to 23rd floor. Please provide PMC sanctioned height clearance / CC copy beyond 20 floors.',
    priority: 'High',
    isBlocking: false,
    dueDate: '2026-09-25',
    slaHours: 48,
    relatedModule: 'Tower Master',
    relatedField: 'Commencement Certificate / Slabs',
    status: 'OPEN',
    createdAt: '2026-09-22 08:30:00',
    updatedAt: '2026-09-22 08:30:00',
    messages: [
      {
        id: 'MSG-004',
        queryId: 'QRY-2026-0003',
        senderId: 'usr-val-ext-01',
        senderName: 'Vikram Joshi',
        senderRole: 'EXTERNAL_VALUER',
        timestamp: '2026-09-22 08:30:00',
        message: 'During site visit, slab work is active up to 23rd floor. Please provide PMC sanctioned height clearance / CC copy beyond 20 floors.',
        statusChange: 'OPEN',
      },
    ],
  },
  {
    id: 'QRY-2026-0004',
    caseId: 'APF-2026-0003',
    builderId: 'BLD-MUM-001',
    builderName: 'Macrotech Developers Ltd (Lodha)',
    projectId: 'PRJ-MUM-001',
    projectName: 'Lodha Park Towers',
    towerName: 'Tower Gold & Kiara',
    phaseName: 'Phase 1',
    raisedByUserId: 'usr-appr-01',
    raisedByUserName: 'Priya Sharma',
    raisedByUserRole: 'APPROVER',
    assignedToUserId: 'usr-com-01',
    assignedToUserName: 'Amitav Sen',
    assignedToRole: 'COM',
    category: 'Exposure',
    subject: 'Single Group concentration limit headroom calculation',
    queryText: 'Lodha group has 14 approved schemes with our bank. Confirm that additional ₹50 Cr retail pipeline will not breach 15% tier-1 capital prudential cap.',
    priority: 'Normal',
    isBlocking: false,
    dueDate: '2026-09-26',
    slaHours: 72,
    relatedModule: 'Exposure 360',
    relatedField: 'Group Exposure Cap',
    status: 'CLOSED',
    createdAt: '2026-09-20 14:00:00',
    updatedAt: '2026-09-21 16:30:00',
    closedAt: '2026-09-21 16:30:00',
    closedBy: 'Amitav Sen (COM)',
    messages: [
      {
        id: 'MSG-005',
        queryId: 'QRY-2026-0004',
        senderId: 'usr-appr-01',
        senderName: 'Priya Sharma',
        senderRole: 'APPROVER',
        timestamp: '2026-09-20 14:00:00',
        message: 'Lodha group has 14 approved schemes with our bank. Confirm that additional ₹50 Cr retail pipeline will not breach 15% tier-1 capital prudential cap.',
        statusChange: 'OPEN',
      },
      {
        id: 'MSG-006',
        queryId: 'QRY-2026-0004',
        senderId: 'usr-com-01',
        senderName: 'Amitav Sen',
        senderRole: 'COM',
        timestamp: '2026-09-21 16:30:00',
        message: 'Headroom verified. Lodha Group current bank utilization is ₹1,420 Cr against sanctioned ceiling of ₹2,000 Cr (71% utilized). Headroom of ₹580 Cr exists, well within RBI single group norms.',
        statusChange: 'CLOSED',
      },
    ],
  },
];

class QueryStore {
  private queries: APFQuery[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadQueries();
  }

  private loadQueries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUERIES);
      if (raw) {
        this.queries = JSON.parse(raw);
      } else {
        this.queries = INITIAL_QUERIES;
        this.saveQueries();
      }
    } catch (e) {
      console.error('Failed to load queries from storage', e);
      this.queries = INITIAL_QUERIES;
    }
  }

  private saveQueries() {
    try {
      localStorage.setItem(STORAGE_KEY_QUERIES, JSON.stringify(this.queries));
      this.notify();
    } catch (e) {
      console.error('Failed to save queries to storage', e);
    }
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getAllQueries(): APFQuery[] {
    return [...this.queries];
  }

  public getQueriesForCase(caseId: string): APFQuery[] {
    return this.queries.filter((q) => q.caseId === caseId);
  }

  public getQueryById(id: string): APFQuery | undefined {
    return this.queries.find((q) => q.id === id);
  }

  public hasBlockingQuery(caseId: string): { isBlocked: boolean; blockingQuery?: APFQuery } {
    const blocking = this.queries.find(
      (q) => q.caseId === caseId && q.isBlocking && q.status !== 'CLOSED' && q.status !== 'CANCELLED'
    );
    return {
      isBlocked: Boolean(blocking),
      blockingQuery: blocking,
    };
  }

  public getDashboardCounts(userRole: UserRole, userId?: string): QueryDashboardCounts {
    // Need Input: queries assigned to this role or user that are awaiting input
    const needInput = this.queries.filter((q) => {
      if (q.status === 'CLOSED' || q.status === 'CANCELLED') return false;
      const roleMatch = q.assignedToRole === userRole;
      const userMatch = userId ? q.assignedToUserId === userId : true;
      return (roleMatch || userMatch) && (q.status === 'INPUT_REQUIRED' || q.status === 'OPEN' || q.status === 'ASSIGNED');
    }).length;

    // Input Received: queries raised by this user/role that have received an answer
    const inputReceived = this.queries.filter((q) => {
      const raisedByMe = q.raisedByUserRole === userRole;
      return raisedByMe && q.status === 'INPUT_RECEIVED';
    }).length;

    const openQueries = this.queries.filter(
      (q) => q.status !== 'CLOSED' && q.status !== 'CANCELLED'
    ).length;

    const overdueQueries = this.queries.filter((q) => {
      if (q.status === 'CLOSED' || q.status === 'CANCELLED') return false;
      return new Date(q.dueDate).getTime() < Date.now();
    }).length;

    const queriesRaisedByMe = this.queries.filter(
      (q) => q.raisedByUserRole === userRole || (userId && q.raisedByUserId === userId)
    ).length;

    const queriesAssignedToMe = this.queries.filter(
      (q) => q.assignedToRole === userRole || (userId && q.assignedToUserId === userId)
    ).length;

    return {
      needInput,
      inputReceived,
      openQueries,
      overdueQueries,
      queriesRaisedByMe,
      queriesAssignedToMe,
    };
  }

  public raiseQuery(params: {
    caseId: string;
    builderId: string;
    builderName: string;
    projectId: string;
    projectName: string;
    towerName?: string;
    phaseName?: string;
    currentUser: UserAccount;
    assignedToRole: UserRole;
    assignedToUserId?: string;
    assignedToUserName?: string;
    category: QueryCategory;
    subject: string;
    queryText: string;
    priority: QueryPriority;
    isBlocking: boolean;
    dueDate?: string;
    slaHours?: number;
    relatedModule?: string;
    relatedField?: string;
    attachmentName?: string;
  }): APFQuery {
    const queryNum = this.queries.length + 1;
    const queryId = `QRY-2026-${String(queryNum).padStart(4, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dueDate =
      params.dueDate ||
      new Date(Date.now() + (params.slaHours || 24) * 3600 * 1000)
        .toISOString()
        .substring(0, 10);

    const initialMessage: QueryMessage = {
      id: `MSG-${Date.now()}`,
      queryId,
      senderId: params.currentUser.id,
      senderName: params.currentUser.name,
      senderRole: params.currentUser.role,
      timestamp: now,
      message: params.queryText,
      attachmentName: params.attachmentName,
      statusChange: 'INPUT_REQUIRED',
    };

    const newQuery: APFQuery = {
      id: queryId,
      caseId: params.caseId,
      builderId: params.builderId,
      builderName: params.builderName,
      projectId: params.projectId,
      projectName: params.projectName,
      towerName: params.towerName,
      phaseName: params.phaseName,
      raisedByUserId: params.currentUser.id,
      raisedByUserName: params.currentUser.name,
      raisedByUserRole: params.currentUser.role,
      assignedToRole: params.assignedToRole,
      assignedToUserId: params.assignedToUserId,
      assignedToUserName: params.assignedToUserName,
      category: params.category,
      subject: params.subject,
      queryText: params.queryText,
      priority: params.priority,
      isBlocking: params.isBlocking,
      dueDate,
      slaHours: params.slaHours || 24,
      relatedModule: params.relatedModule,
      relatedField: params.relatedField,
      attachmentName: params.attachmentName,
      status: 'INPUT_REQUIRED',
      createdAt: now,
      updatedAt: now,
      messages: [initialMessage],
    };

    this.queries.unshift(newQuery);
    this.saveQueries();

    // Also log event in case audit trail
    try {
      const c = apfStore.getCaseById(params.caseId);
      if (c) {
        c.auditTrail.unshift({
          id: `EVT-QRY-${Date.now()}`,
          timestamp: now,
          actorName: params.currentUser.name,
          actorRole: params.currentUser.role,
          action: 'QUERY_RAISED',
          priorStatus: c.currentStatus,
          newStatus: c.currentStatus,
          remarks: `${params.currentUser.role} raised query [${queryId}]: "${params.subject}" to ${params.assignedToRole}. Sub-status: INPUT_REQUIRED. ${params.isBlocking ? '(BLOCKING)' : '(INFORMATIONAL)'}`,
          deviceInfo: 'PROVAL Query & Communication Module',
        });
        apfStore.saveCases();
      }
    } catch (e) {
      console.warn('Could not log query event to case audit trail', e);
    }

    return newQuery;
  }

  // Automatic High-Severity Geofence Breach Alert to CPA, COM, ACOM & Approving Authorities
  public raiseGeofenceBreachAlert(params: {
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
  }): { queryIds: string[]; breachId: string } {
    const c = apfStore.getCaseById(params.caseId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const breachId = `GF-BREACH-${Date.now()}`;
    const distanceFormatted = Math.round(params.distanceMeters);

    // Authority targets: CPA, COM, ACOM & Approving Authority
    const alertAuthorities: { role: UserRole; roleDesignation: string; userName: string; userId: string }[] = [
      {
        role: 'CPA',
        roleDesignation: 'Central Processing Associate (CPA - Processing Maker)',
        userName: 'Rohan Deshmukh',
        userId: 'USR-CPA-001',
      },
      {
        role: 'COM',
        roleDesignation: 'Credit Operations Manager (COM - Credit Checker)',
        userName: 'Amitav Sen',
        userId: 'USR-COM-001',
      },
      {
        role: 'APPROVER',
        roleDesignation: 'Area Credit Manager & Approving Authority (ACOM)',
        userName: 'Priya Sharma',
        userId: 'USR-APP-001',
      },
    ];

    const generatedQueryIds: string[] = [];

    alertAuthorities.forEach((target, idx) => {
      const queryNum = this.queries.length + 1;
      const queryId = `QRY-GF-${String(queryNum).padStart(4, '0')}`;
      generatedQueryIds.push(queryId);

      const subject = `🚨 GEOFENCE BREACH: Valuer location mismatch with site address (${distanceFormatted}m deviation)`;
      const queryText = `URGENT SECURITY ALERT TO ${target.roleDesignation}:
Valuer ${params.valuer.name} (${params.valuer.role}) attempted to pin or update coordinates to [${params.attemptedLat.toFixed(6)}, ${params.attemptedLng.toFixed(6)}] which does NOT match the registered project site address:
"${params.projectAddress}" (Sanctioned Coordinates: ${params.projectLat.toFixed(6)}, ${params.projectLng.toFixed(6)}).

GEOFENCE BREACH METRICS:
• Physical Deviation: ${distanceFormatted} meters (Allowed tolerance limit: 500m)
• Attempted Pin Address/Locality: ${params.attemptedAddress || 'Unverified Off-Site Location'}
• Valuer Inspection Notes: "${params.notes || 'No remarks provided'}"

POLICY ACTION ENFORCED:
The location pinning was STRICTLY REJECTED and BLOCKED by the geofence compliance engine. Valuers are prohibited from pinning or updating off-site coordinates.
Workflow progression is halted under high-priority compliance hold until CPA, COM, and ACOM / Approving Authorities review the discrepancy.`;

      const initialMessage: QueryMessage = {
        id: `MSG-GF-${Date.now()}-${idx}`,
        queryId,
        senderId: params.valuer.id || 'SYS-GEOFENCE-GUARD',
        senderName: `Geofence Compliance Engine (${params.valuer.name})`,
        senderRole: params.valuer.role,
        timestamp: now,
        message: queryText,
        statusChange: 'INPUT_REQUIRED',
      };

      const newQuery: APFQuery = {
        id: queryId,
        caseId: params.caseId,
        builderId: c?.builderId || 'BLD-GEN',
        builderName: 'Builder Enterprise',
        projectId: c?.projectId || 'PRJ-GEN',
        projectName: params.projectAddress || 'Project Site',
        towerName: 'All Towers (Physical Site Mismatch)',
        phaseName: 'Geofence Verification Area',
        raisedByUserId: params.valuer.id || 'VAL-01',
        raisedByUserName: `${params.valuer.name} [Automated Breach Flag]`,
        raisedByUserRole: params.valuer.role,
        assignedToRole: target.role,
        assignedToUserId: target.userId,
        assignedToUserName: target.userName,
        category: 'Technical',
        subject,
        queryText,
        priority: 'Critical',
        isBlocking: true,
        dueDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString().substring(0, 10),
        slaHours: 12,
        relatedModule: 'Valuation & Geofence',
        relatedField: 'Project Lat/Long & Physical Inspection Address',
        status: 'INPUT_REQUIRED',
        createdAt: now,
        updatedAt: now,
        messages: [initialMessage],
      };

      this.queries.unshift(newQuery);
    });

    this.saveQueries();

    // Attach incident details to the APF Case and Audit Trail
    if (c) {
      if (!c.geofenceBreachAlerts) {
        c.geofenceBreachAlerts = [];
      }

      const breachItem = {
        id: breachId,
        attemptedAt: now,
        attemptedBy: params.valuer.name,
        attemptedRole: params.valuer.role,
        attemptedLat: params.attemptedLat,
        attemptedLng: params.attemptedLng,
        distanceFromProjectMeters: distanceFormatted,
        projectAddress: params.projectAddress,
        projectLat: params.projectLat,
        projectLng: params.projectLng,
        attemptedAddress: params.attemptedAddress,
        status: 'ACTIVE_ALERT' as const,
        alertedRoles: ['CPA', 'COM', 'ACOM', 'APPROVER'] as ('CPA' | 'COM' | 'ACOM' | 'APPROVER')[],
        reasonNotes: params.notes,
      };

      c.geofenceBreachAlerts.unshift(breachItem);
      c.latestGeofenceBreach = breachItem;

      c.auditTrail.unshift({
        id: `EVT-GF-BLOCK-${Date.now()}`,
        timestamp: now,
        actorName: params.valuer.name,
        actorRole: params.valuer.role,
        action: 'GEOLOCATION_MISMATCH_BREACH_ALERT',
        priorStatus: c.currentStatus,
        newStatus: c.currentStatus,
        remarks: `CRITICAL GEOFENCE VIOLATION BLOCKED: Valuer attempted to pin coordinates [${params.attemptedLat.toFixed(6)}, ${params.attemptedLng.toFixed(6)}] which does NOT match the registered project site address "${params.projectAddress}" (${distanceFormatted}m deviation). Pinning was PROHIBITED & BLOCKED. Formal high-severity alerts dispatched to CPA, COM, ACOM & Approving Authorities.`,
        deviceInfo: 'Google Maps Geofence Compliance Engine',
      });

      apfStore.saveCases();
    }

    return { queryIds: generatedQueryIds, breachId };
  }

  public submitInput(params: {
    queryId: string;
    currentUser: UserAccount;
    message: string;
    inputValue?: string;
    attachmentName?: string;
  }): boolean {
    const q = this.getQueryById(params.queryId);
    if (!q) return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newMsg: QueryMessage = {
      id: `MSG-${Date.now()}`,
      queryId: q.id,
      senderId: params.currentUser.id,
      senderName: params.currentUser.name,
      senderRole: params.currentUser.role,
      timestamp: now,
      message: params.message,
      inputValue: params.inputValue,
      attachmentName: params.attachmentName,
      statusChange: 'INPUT_RECEIVED',
    };

    q.messages.push(newMsg);
    q.status = 'INPUT_RECEIVED';
    q.updatedAt = now;
    this.saveQueries();

    // Log to case timeline
    try {
      const c = apfStore.getCaseById(q.caseId);
      if (c) {
        c.auditTrail.unshift({
          id: `EVT-INPUT-${Date.now()}`,
          timestamp: now,
          actorName: params.currentUser.name,
          actorRole: params.currentUser.role,
          action: 'INPUT_SUBMITTED',
          priorStatus: c.currentStatus,
          newStatus: c.currentStatus,
          remarks: `${params.currentUser.role} submitted input on query [${q.id}]. Sub-status: INPUT_RECEIVED. Remarks: ${params.message}`,
          deviceInfo: 'PROVAL Query & Communication Module',
        });
        apfStore.saveCases();
      }
    } catch (e) {
      console.warn('Could not log input event to case audit trail', e);
    }

    return true;
  }

  public updateQueryStatus(
    queryId: string,
    newStatus: QueryStatus,
    currentUser: UserAccount,
    remarks: string
  ): boolean {
    const q = this.getQueryById(queryId);
    if (!q) return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    q.status = newStatus;
    q.updatedAt = now;
    if (newStatus === 'CLOSED') {
      q.closedAt = now;
      q.closedBy = `${currentUser.name} (${currentUser.role})`;
    }

    q.messages.push({
      id: `MSG-${Date.now()}`,
      queryId: q.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      timestamp: now,
      message: remarks,
      statusChange: newStatus,
    });

    this.saveQueries();

    // Log to case timeline
    try {
      const c = apfStore.getCaseById(q.caseId);
      if (c) {
        c.auditTrail.unshift({
          id: `EVT-QSTAT-${Date.now()}`,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: `QUERY_STATUS_${newStatus}`,
          priorStatus: c.currentStatus,
          newStatus: c.currentStatus,
          remarks: `${currentUser.role} updated query [${q.id}] status to ${newStatus}. Note: ${remarks}`,
          deviceInfo: 'PROVAL Query & Communication Module',
        });
        apfStore.saveCases();
      }
    } catch (e) {
      console.warn('Could not log query status event to case audit trail', e);
    }

    return true;
  }

  public resetDemoQueries() {
    this.queries = INITIAL_QUERIES;
    this.saveQueries();
  }
}

export const queryStore = new QueryStore();

// Register the cross-module alert dispatcher
registerGeofenceAlertDispatcher((params) => queryStore.raiseGeofenceBreachAlert(params));
