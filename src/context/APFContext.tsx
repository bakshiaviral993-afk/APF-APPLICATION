import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ScreenId,
  UserRole,
  BuilderGroup,
  BuilderCompany,
  ProjectEntity,
  TowerItem,
  UnitItem,
  ReconciledFacility,
  AIObservation,
  EWSEvent,
  CommitteePack,
  EvidenceSnippet,
} from '../types/apf';
import {
  DEMO_BUILDER_GROUP,
  DEMO_COMPANIES,
  DEMO_PROJECTS,
  DEMO_TOWERS,
  DEMO_UNITS,
  DEMO_RECONCILED_FACILITIES,
  DEMO_AI_OBSERVATIONS,
  DEMO_EWS_EVENTS,
  DEMO_COMMITTEE_PACK,
} from '../data/mockData';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  details: string;
}

interface APFContextType {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Entity Hierarchy Context
  selectedGroup: BuilderGroup;
  selectedCompany: BuilderCompany;
  selectedProject: ProjectEntity;
  selectedTower: TowerItem | null;
  selectedUnit: UnitItem | null;
  setSelectedGroup: (group: BuilderGroup) => void;
  setSelectedCompany: (company: BuilderCompany) => void;
  setSelectedProject: (project: ProjectEntity) => void;
  setSelectedTower: (tower: TowerItem | null) => void;
  setSelectedUnit: (unit: UnitItem | null) => void;

  // Exposure & Reconciliation
  reconciledFacilities: ReconciledFacility[];
  approveGoldenRecord: (id: string, reason?: string) => void;
  overrideReconciliation: (id: string, goldenSanction: number, goldenOutstanding: number, reason: string) => void;

  // AI Underwriting & Observations
  aiObservations: AIObservation[];
  updateObservationDecision: (
    id: string,
    decision: 'ACCEPTED' | 'EDITED' | 'REJECTED',
    note?: string,
    editedText?: string
  ) => void;

  // Committee Decisions
  committeePack: CommitteePack;
  committeeDecision: {
    decision: string;
    voterName: string;
    voterRole: string;
    date: string;
    notes?: string;
  } | null;
  setCommitteeDecision: (decision: any) => void;
  recordCommitteeDecision: (
    status: 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED',
    notes: string
  ) => void;
  toggleConditionStatus: (conditionId: string, status: 'Open' | 'Closed' | 'Waived') => void;
  addCondition: (newCond: {
    type: 'Precedent' | 'Subsequent';
    description: string;
    owner: string;
    dueDate: string;
    isMandatory: boolean;
  }) => void;

  // Monitoring & EWS
  ewsEvents: EWSEvent[];
  acknowledgeEWS: (id: string) => void;
  createTaskFromEWS: (id: string, assignee: string) => void;

  // Evidence Inspector
  activeEvidence: EvidenceSnippet | null;
  setActiveEvidence: (evidence: EvidenceSnippet | null) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  isAuditLogOpen: boolean;
  setIsAuditLogOpen: (open: boolean) => void;
  addAuditLog: (action: string, target: string, details: string) => void;

  // Guided Demo Tour (1 to 9 steps)
  tourStep: number;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  goToTourStep: (step: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
}

const APFContext = createContext<APFContextType | undefined>(undefined);

export const APFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('01');
  const [currentRole, setCurrentRole] = useState<UserRole>('Credit');

  // Entity hierarchy
  const [selectedGroup, setSelectedGroup] = useState<BuilderGroup>(DEMO_BUILDER_GROUP);
  const [selectedCompany, setSelectedCompany] = useState<BuilderCompany>(DEMO_COMPANIES[0]);
  const [selectedProject, setSelectedProject] = useState<ProjectEntity>(DEMO_PROJECTS[0]);
  const [selectedTower, setSelectedTower] = useState<TowerItem | null>(DEMO_TOWERS[1]); // Tower B by default
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(DEMO_UNITS[85]); // Sample unit in Tower B

  // Reconciled facilities
  const [reconciledFacilities, setReconciledFacilities] = useState<ReconciledFacility[]>(DEMO_RECONCILED_FACILITIES);

  // AI observations
  const [aiObservations, setAIObservations] = useState<AIObservation[]>(DEMO_AI_OBSERVATIONS);

  // Committee Pack
  const [committeePack, setCommitteePack] = useState<CommitteePack>(DEMO_COMMITTEE_PACK);
  const [committeeDecision, setCommitteeDecision] = useState<{
    decision: string;
    voterName: string;
    voterRole: string;
    date: string;
    notes?: string;
  } | null>({
    decision: 'APPROVED_WITH_CONDITIONS',
    voterName: 'Executive Credit Committee Quorum',
    voterRole: 'Chief Credit Officer & CRO',
    date: '2026-09-18',
    notes: 'Approved subject to mandatory pre-disbursement NOC from Piramal Capital on Tower B.',
  });

  // EWS
  const [ewsEvents, setEWSEvents] = useState<EWSEvent[]>(DEMO_EWS_EVENTS);

  // Active evidence modal
  const [activeEvidence, setActiveEvidence] = useState<EvidenceSnippet | null>(null);

  // Tour
  const [tourStep, setTourStep] = useState<number>(1);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(true);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);

  // Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-001',
      timestamp: '2026-09-18 09:12:00',
      user: 'R. Mehta',
      role: 'Credit',
      action: 'INGEST_EVIDENCE',
      target: 'MCA Charge Filing CHG-2024-91823',
      details: 'Discovered ₹42.0 Cr open charge with Piramal Capital',
    },
    {
      id: 'AUD-002',
      timestamp: '2026-09-18 09:30:15',
      user: 'A. Bakshi',
      role: 'Risk',
      action: 'FLAG_DISCREPANCY',
      target: 'Facility RECON-04',
      details: 'Created golden record adjustment for undeclared NBFC debt',
    },
  ]);

  const addAuditLog = (action: string, target: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `${currentRole} User`,
      role: currentRole,
      action,
      target,
      details,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const approveGoldenRecord = (id: string, reason?: string) => {
    setReconciledFacilities(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Golden Approved',
            auditedBy: `${currentRole} Officer`,
            auditedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            overrideReason: reason || item.overrideReason || 'Approved by authorized credit officer',
          };
        }
        return item;
      })
    );
    addAuditLog('APPROVE_GOLDEN_RECORD', `Facility ${id}`, reason || 'Approved golden record baseline');
  };

  const overrideReconciliation = (
    id: string,
    goldenSanction: number,
    goldenOutstanding: number,
    reason: string
  ) => {
    setReconciledFacilities(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            goldenSanctionCr: goldenSanction,
            goldenOutstandingCr: goldenOutstanding,
            status: 'Golden Approved',
            overrideReason: reason,
            auditedBy: `${currentRole} Officer`,
            auditedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return item;
      })
    );
    addAuditLog('OVERRIDE_RECONCILIATION', `Facility ${id}`, `Updated golden values to Sanc: ₹${goldenSanction}Cr, O/S: ₹${goldenOutstanding}Cr. Reason: ${reason}`);
  };

  const updateObservationDecision = (
    id: string,
    decision: 'ACCEPTED' | 'EDITED' | 'REJECTED',
    note?: string,
    editedText?: string
  ) => {
    setAIObservations(prev =>
      prev.map(obs => {
        if (obs.id === id) {
          return {
            ...obs,
            userDecision: decision,
            reviewerNote: note || obs.reviewerNote,
            editedText: editedText || obs.editedText,
            reviewedBy: `${currentRole} Lead`,
            reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return obs;
      })
    );
    addAuditLog('AI_DECISION', `Observation ${id}`, `Decision set to ${decision}. Note: ${note || 'None'}`);
  };

  const recordCommitteeDecision = (
    status: 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED',
    notes: string
  ) => {
    setCommitteePack(prev => ({
      ...prev,
      decisionStatus: status,
      decisionNotes: notes,
      recordedBy: `${currentRole} - Quorum Authorized`,
      recordedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }));
    addAuditLog('COMMITTEE_DECISION', `Case ${committeePack.caseId}`, `Final Decision: ${status}. Notes: ${notes}`);
  };

  const toggleConditionStatus = (conditionId: string, status: 'Open' | 'Closed' | 'Waived') => {
    setCommitteePack(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => (c.id === conditionId ? { ...c, status } : c)),
    }));
    addAuditLog('CONDITION_UPDATE', `Condition ${conditionId}`, `Status changed to ${status}`);
  };

  const addCondition = (newCond: {
    type: 'Precedent' | 'Subsequent';
    description: string;
    owner: string;
    dueDate: string;
    isMandatory: boolean;
  }) => {
    const id = `COND-${String(committeePack.conditions.length + 1).padStart(2, '0')}`;
    setCommitteePack(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id,
          ...newCond,
          status: 'Open',
        },
      ],
    }));
    addAuditLog('ADD_CONDITION', id, `New ${newCond.type} condition: ${newCond.description}`);
  };

  const acknowledgeEWS = (id: string) => {
    setEWSEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'Acknowledged' } : e))
    );
    addAuditLog('EWS_ACKNOWLEDGE', id, 'Alert acknowledged by surveillance officer');
  };

  const createTaskFromEWS = (id: string, assignee: string) => {
    setEWSEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, status: 'Task Created', assignedTo: assignee } : e))
    );
    addAuditLog('EWS_TASK_CREATED', id, `Surveillance action task assigned to ${assignee}`);
  };

  // Demo Tour Step navigation mapped to Section 8 of blueprint
  const TOUR_STEP_SCREENS: Record<number, ScreenId> = {
    1: '02', // Search ABC Developers (Apex Habitat)
    2: '03', // Builder 360
    3: '07', // Exposure Reconciliation (₹42 Cr undeclared NBFC)
    4: '12', // Project 360 (Alpha Towers)
    5: '15', // Tower Heatmap
    6: '25', // AI Underwriter (Accept/Edit/Reject)
    7: '26', // Committee Cockpit
    8: '27', // Approve with Conditions & Maker-Checker
    9: '28', // Monitoring & EWS alert
  };

  const goToTourStep = (step: number) => {
    if (step >= 1 && step <= 9) {
      setTourStep(step);
      const targetScreen = TOUR_STEP_SCREENS[step];
      if (targetScreen) {
        setCurrentScreen(targetScreen);
      }
    }
  };

  const nextTourStep = () => {
    if (tourStep < 9) {
      goToTourStep(tourStep + 1);
    }
  };

  const prevTourStep = () => {
    if (tourStep > 1) {
      goToTourStep(tourStep - 1);
    }
  };

  return (
    <APFContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        currentRole,
        setCurrentRole,
        selectedGroup,
        selectedCompany,
        selectedProject,
        selectedTower,
        selectedUnit,
        setSelectedGroup,
        setSelectedCompany,
        setSelectedProject,
        setSelectedTower,
        setSelectedUnit,
        reconciledFacilities,
        approveGoldenRecord,
        overrideReconciliation,
        aiObservations,
        updateObservationDecision,
        committeePack,
        committeeDecision,
        setCommitteeDecision,
        recordCommitteeDecision,
        toggleConditionStatus,
        addCondition,
        ewsEvents,
        acknowledgeEWS,
        createTaskFromEWS,
        activeEvidence,
        setActiveEvidence,
        auditLogs,
        isAuditLogOpen,
        setIsAuditLogOpen,
        addAuditLog,
        tourStep,
        isTourOpen,
        setIsTourOpen,
        goToTourStep,
        nextTourStep,
        prevTourStep,
      }}
    >
      {children}
    </APFContext.Provider>
  );
};

export const useAPF = (): APFContextType => {
  const context = useContext(APFContext);
  if (!context) {
    throw new Error('useAPF must be used within an APFProvider');
  }
  return context;
};
