import React, { useState, useEffect } from 'react';
import { apfStore } from '../../services/apfStore';
import { queryStore } from '../../services/queryStore';
import { APFQuery } from '../../types/queryTypes';
import {
  APFCase,
  CaseStatus,
  UserAccount,
  SiteVisitEvidence,
  MarketComparable,
  ValuationReportData,
  ApprovalConditionItem,
} from '../../types/apfTransaction';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_TOWER_MASTER,
  CENTRAL_PHASE_MASTER,
  CENTRAL_UNIT_MASTER,
  getUnitsByTower,
} from '../../data/centralMasterData';
import { BuilderExposure360Report } from '../exposure/BuilderExposure360Report';
import { canAccessExposureReport, ExposureAccessRestrictedCard } from '../../utils/exposurePermissions';
import { PageHeaderNav } from '../common/PageHeaderNav';
import { RaiseQueryModal } from '../queries/RaiseQueryModal';
import { QueryDetailModal } from '../queries/QueryDetailModal';
import { ValuerMapPinModal } from '../maps/ValuerMapPinModal';
import { InteractiveSiteMapView } from '../maps/InteractiveSiteMapView';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Sliders,
  Send,
  Lock,
  Compass,
  DollarSign,
  Layers,
  History,
  Check,
  AlertCircle,
  Hash,
  MessageSquare,
  PlusCircle,
  HelpCircle,
  UserCheck,
  ShieldAlert,
  OctagonAlert,
  BellRing,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { ValuationReportDocPreview } from '../valuation/ValuationReportDocPreview';
import { ValuerCaseAppModule } from '../valuation/ValuerCaseAppModule';
import { getOrGenerateBankValuationReport } from '../../services/valuationCalculationEngine';

interface CaseDetailWorkspaceProps {
  caseId: string;
  currentUser: UserAccount;
  onBack: () => void;
}

export const CaseDetailWorkspace: React.FC<CaseDetailWorkspaceProps> = ({
  caseId,
  currentUser,
  onBack,
}) => {
  const c = apfStore.getCaseById(caseId);

  // Active tab inside dossier
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VALUATION' | 'EXPOSURE' | 'APPROVAL' | 'COMMUNICATION' | 'AUDIT'>('OVERVIEW');

  // Query Management State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [caseQueries, setCaseQueries] = useState<APFQuery[]>(() => queryStore.getQueriesForCase(caseId));

  // Google Maps Location Pin State
  const [showMapPinModal, setShowMapPinModal] = useState(false);
  const [showValuationDocModal, setShowValuationDocModal] = useState(false);
  const [showValuerWorkbenchModal, setShowValuerWorkbenchModal] = useState(false);
  const [isActionConsoleOpen, setIsActionConsoleOpen] = useState(true);

  useEffect(() => {
    const unsub = queryStore.subscribe(() => {
      setCaseQueries(queryStore.getQueriesForCase(caseId));
    });
    return unsub;
  }, [caseId]);

  // Local state for interactive actions
  // Valuer assignment
  const [valuerType, setValuerType] = useState<'Internal' | 'External' | 'Dual'>('External');
  const [assignedVendor, setAssignedVendor] = useState('Knight Frank Valuation Services LLP');
  const [assignedValuerName, setAssignedValuerName] = useState('M. K. Kulkarni (Empanelled Valuer)');
  const [assignedValuerId, setAssignedValuerId] = useState('USR-VAL-EXT-001');
  const [visitInstructions, setVisitInstructions] = useState('Inspect structural slab completion of Towers E & G. Verify approach road access from Hinjawadi Phase 1.');

  // Valuer Site Visit & Report
  const [adoptedRateSqFt, setAdoptedRateSqFt] = useState(7450);
  const [technicalGrade, setTechnicalGrade] = useState('A+');
  const [cpaNotes, setCpaNotes] = useState('Valuation matches micro-market rate ₹7,450/sq.ft. Structural progress verified 92%. Recommend submission to COM.');
  const [comNotes, setComNotes] = useState('Group exposure ₹484.7 Cr well within ₹600 Cr ceiling. Approved Towers E & G clear. Endorsed for Zonal Committee.');
  const [reworkRemarks, setReworkRemarks] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);

  // Geofence Breach Review Modal State (For CPA, COM, ACOM & Approver)
  const [breachReviewModal, setBreachReviewModal] = useState<{
    isOpen: boolean;
    decision: 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION' | 'REJECT_AND_DEMAND_PHYSICAL_VISIT';
    remarks: string;
  } | null>(null);

  // Approver decision
  const [decisionNotes, setDecisionNotes] = useState('Sanctioned retail APF limit of ₹150 Cr for Kolte-Patil Life Republic i Towers (Buildings E & G) with standard covenants.');
  const [conditions, setConditions] = useState<ApprovalConditionItem[]>([
    {
      id: 'CND-01',
      conditionText: 'Updated NOC from Project Finance Lender (Piramal Capital) before first disbursement.',
      responsibleRole: 'CPA / Branch Operations',
      dueDate: '2026-10-15',
      timing: 'Pre-Disbursement',
      isMandatory: true,
      status: 'Pending Verification',
    },
    {
      id: 'CND-02',
      conditionText: 'Tripartite Agreement (TPA) executed on builder registered template.',
      responsibleRole: 'Legal Reviewer',
      dueDate: '2026-10-30',
      timing: 'Pre-Disbursement',
      isMandatory: true,
      status: 'Pending Verification',
    },
    {
      id: 'CND-03',
      conditionText: 'Quarterly structural engineer certificate on slab casting progress.',
      responsibleRole: 'Technical Valuer',
      dueDate: '2026-12-31',
      timing: 'Post-Disbursement',
      isMandatory: false,
      status: 'Pending Verification',
    },
  ]);

  if (!c) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#cbd5e1] max-w-xl mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#102a43]">Case Not Found</h2>
        <p className="text-xs text-[#627d98] mt-1">The requested APF case ID does not exist.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#0c3148] text-white text-xs font-bold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === c.builderId);
  const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === c.projectId);
  const phase = CENTRAL_PHASE_MASTER.find((ph) => ph.id === c.phaseId);
  const selectedTowers = CENTRAL_TOWER_MASTER.filter((t) => c.selectedTowerIds.includes(t.id));

  // Determine if the logged-in user is the current action owner
  const isActionOwner = currentUser.role === c.currentOwnerRole;

  // --- Handlers for Real State Transitions ---

  // 1. CPA: Assign Valuer
  const handleAssignValuer = () => {
    apfStore.assignValuer(c.id, {
      valuerType,
      assignedUserId: assignedValuerId,
      assignedUserName: assignedValuerName,
      vendorAgency: assignedVendor,
      assignedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      slaDueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      scheduledVisitDate: new Date(Date.now() + 6 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      scopeTowerIds: c.selectedTowerIds,
      scopeTowerNames: selectedTowers.map((t) => t.towerName),
      instructions: visitInstructions,
      siteContactName: 'Mahesh Jadhav (Project Site Engineer)',
      siteContactPhone: '+91 98220 44912',
      conflictDeclared: true,
    });
  };

  // 2. Valuer: Accept Assignment
  const handleAcceptAssignment = () => {
    apfStore.acceptValuerAssignment(c.id);
  };

  // 3. Valuer: Start Site Visit
  const handleStartSiteVisit = () => {
    const lat = project?.latLong.lat || 18.6186;
    const lng = project?.latLong.lng || 73.7149;
    apfStore.startSiteVisit(c.id, lat, lng);
  };

  // 4. Valuer: Submit Valuation Report
  const handleSubmitValuationReport = () => {
    const defaultEvidence: SiteVisitEvidence[] = [
      {
        id: 'EVD-01',
        category: 'Entrance',
        title: 'Project Main Access Gate & Security Checkpoint',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lat: project?.latLong.lat || 18.6186,
        lng: project?.latLong.lng || 73.7149,
        accuracyMeters: 3.2,
        isInsideGeofence: true,
        capturedBy: currentUser.name,
        deviceSessionId: 'DEV-SM-S24-8821',
        notes: 'Four-lane access road clear. Entrance signage matches MahaRERA registered name.',
      },
      {
        id: 'EVD-02',
        category: 'RERA Board',
        title: 'Official MahaRERA Information Display Board',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lat: project?.latLong.lat || 18.6186,
        lng: project?.latLong.lng || 73.7149,
        accuracyMeters: 2.8,
        isInsideGeofence: true,
        capturedBy: currentUser.name,
        deviceSessionId: 'DEV-SM-S24-8821',
        notes: 'RERA Registration No. P52100022154 clearly displayed at site office.',
      },
      {
        id: 'EVD-03',
        category: 'Towers',
        title: 'Building E & Building G Superstructure View',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lat: project?.latLong.lat || 18.6186,
        lng: project?.latLong.lng || 73.7149,
        accuracyMeters: 3.5,
        isInsideGeofence: true,
        capturedBy: currentUser.name,
        deviceSessionId: 'DEV-SM-S24-8821',
        notes: '22 slabs cast. External plastering and primer coat completed. High workmanship.',
      },
      {
        id: 'EVD-04',
        category: 'Construction',
        title: 'Internal Apartment Finishing (Typical 2 BHK Unit)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lat: project?.latLong.lat || 18.6186,
        lng: project?.latLong.lng || 73.7149,
        accuracyMeters: 4.1,
        isInsideGeofence: true,
        capturedBy: currentUser.name,
        deviceSessionId: 'DEV-SM-S24-8821',
        notes: 'Vitrified tiles laid, CPVC plumbing pressure tested, electrical conduits concealed.',
      },
    ];

    const defaultComps: MarketComparable[] = [
      {
        id: 'CMP-01',
        projectName: 'Megapolis Mystic',
        developer: 'Pegasus Properties',
        distanceKm: '1.2 km',
        configuration: '2 BHK / 720 sq.ft',
        carpetAreaSqFt: 720,
        quotedRateSqFt: 7600,
        registeredRateSqFt: 7300,
        source: 'Sub-Registrar Haveli 18 / IGR Maharashtra',
        observationDate: '2026-08-14',
      },
      {
        id: 'CMP-02',
        projectName: 'Godrej 24',
        developer: 'Godrej Properties',
        distanceKm: '2.5 km',
        configuration: '2 BHK / 755 sq.ft',
        carpetAreaSqFt: 755,
        quotedRateSqFt: 8100,
        registeredRateSqFt: 7850,
        source: 'MahaRERA Q2 Quarterly Disclosure',
        observationDate: '2026-07-28',
      },
      {
        id: 'CMP-03',
        projectName: 'Tinsel Town',
        developer: 'Kohinoor Group',
        distanceKm: '1.8 km',
        configuration: '3 BHK / 1010 sq.ft',
        carpetAreaSqFt: 1010,
        quotedRateSqFt: 7700,
        registeredRateSqFt: 7400,
        source: 'IGR Agreement Value Analysis',
        observationDate: '2026-09-05',
      },
    ];

    const reportHash = 'sha256-' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const reportData: ValuationReportData = {
      reportVersion: 'v1.0-FINAL-SIGNED',
      reportHash,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      submittedBy: currentUser.name,
      adoptedBaseRateSqFt: adoptedRateSqFt,
      fairMarketValueCr: 215.4,
      realizableValueCr: 193.8,
      distressValueCr: 161.5,
      recommendedApfRateSqFt: adoptedRateSqFt,
      technicalGrade,
      locationScore: 4.6,
      constructionScore: 4.8,
      infrastructureScore: 4.4,
      marketabilityScore: 4.7,
      rateBand2BHK: `₹${(adoptedRateSqFt - 200).toLocaleString()} - ₹${adoptedRateSqFt.toLocaleString()}/sq.ft`,
      rateBand3BHK: `₹${adoptedRateSqFt.toLocaleString()} - ₹${(adoptedRateSqFt + 350).toLocaleString()}/sq.ft`,
      validityMonths: 6,
      keyObservations: [
        'Superstructure for Buildings E & G completely cast (22 floors each).',
        'Physical progress matches declared MahaRERA delivery schedule within 3% tolerance.',
        'No high-tension electrical cables or open drainage nullah within 150 meters.',
        'Active construction labour count observed: 86 personnel on site.',
      ],
      valuerRecommendation:
        'Fit for APF retail home loan funding. Recommended APF benchmark rate: ₹' +
        adoptedRateSqFt.toLocaleString() +
        '/sq.ft.',
      digitalSignature: 'Signed by M. K. Kulkarni (IBBI/RV/02/2019/11092) via DSC Class 3',
    };

    apfStore.submitValuationReport(c.id, reportData, defaultEvidence, defaultComps);
  };

  // 5. CPA: Send Back for Rework
  const handleSendBackRework = () => {
    if (!reworkRemarks.trim()) {
      alert('Mandatory rework remarks required.');
      return;
    }
    apfStore.cpaSendBackForRework(c.id, reworkRemarks);
    setShowReworkInput(false);
  };

  // 6. CPA: Submit to COM
  const handleCpaSubmitToCom = () => {
    apfStore.cpaSubmitToCom(c.id, cpaNotes);
  };

  // 7. COM: Submit to Approver
  const handleComSubmitToApprover = () => {
    apfStore.comSubmitToApprover(c.id, comNotes);
  };

  // 8. Approver: Make Decision
  const handleApproverDecision = (decision: 'APPROVED' | 'CONDITIONAL_APPROVAL' | 'REJECTED' | 'DEFERRED') => {
    apfStore.approverDecide(c.id, decision, decisionNotes, conditions);
  };

  // 9. Send to LOS
  const handleSendToLos = () => {
    apfStore.sendToLos(c.id);
  };

  // Stepper representation based strictly on actual progress
  const getWorkflowSteps = () => {
    return [
      { key: 'INITIATED', label: '1. CPA Initiation', role: 'CPA', done: true },
      {
        key: 'ASSIGNED_TO_VALUER',
        label: '2. Valuer Assignment',
        role: 'CPA',
        done: c.valuerAssignment !== undefined,
      },
      {
        key: 'VALUER_ACCEPTED',
        label: '3. Valuer Acceptance',
        role: c.valuerAssignment?.valuerType === 'Internal' ? 'INTERNAL_VALUER' : 'EXTERNAL_VALUER',
        done:
          c.currentStatus === 'VALUER_ACCEPTED' ||
          c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
          c.currentStatus === 'VALUATION_SUBMITTED' ||
          c.currentStatus === 'COM_REVIEW' ||
          c.currentStatus === 'PENDING_APPROVAL' ||
          c.currentStatus === 'APPROVED' ||
          c.currentStatus === 'CONDITIONAL_APPROVAL' ||
          c.currentStatus === 'SENT_TO_LOS' ||
          c.currentStatus === 'APF_ACTIVE',
      },
      {
        key: 'SITE_VISIT',
        label: '4. Mobile Site Visit (GPS)',
        role: 'VALUER',
        done:
          c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
          c.currentStatus === 'VALUATION_SUBMITTED' ||
          c.currentStatus === 'COM_REVIEW' ||
          c.currentStatus === 'PENDING_APPROVAL' ||
          c.currentStatus === 'APPROVED' ||
          c.currentStatus === 'CONDITIONAL_APPROVAL' ||
          c.currentStatus === 'SENT_TO_LOS' ||
          c.currentStatus === 'APF_ACTIVE',
      },
      {
        key: 'VALUATION_SUBMITTED',
        label: '5. Valuation Report',
        role: 'VALUER',
        done: c.valuationReport !== undefined,
      },
      {
        key: 'COM_REVIEW',
        label: '6. CPA & COM Review',
        role: 'CPA / COM',
        done:
          c.currentStatus === 'COM_REVIEW' ||
          c.currentStatus === 'PENDING_APPROVAL' ||
          c.currentStatus === 'APPROVED' ||
          c.currentStatus === 'CONDITIONAL_APPROVAL' ||
          c.currentStatus === 'SENT_TO_LOS' ||
          c.currentStatus === 'APF_ACTIVE',
      },
      {
        key: 'APPROVAL',
        label: '7. Sanction Decision',
        role: 'APPROVER',
        done: c.approvalDecision !== undefined,
      },
      {
        key: 'LOS',
        label: '8. Send to LOS Gateway',
        role: 'CPA / COM',
        done: c.currentStatus === 'SENT_TO_LOS' || c.currentStatus === 'APF_ACTIVE',
      },
      {
        key: 'APF_ACTIVE',
        label: '9. APF Active in LOS',
        role: 'LOS CORE',
        done: c.currentStatus === 'APF_ACTIVE',
      },
    ];
  };

  const steps = getWorkflowSteps();
  const blockingStatus = queryStore.hasBlockingQuery(c.id);

  return (
    <div className="space-y-3 max-w-7xl mx-auto pb-10">
      {/* Top Bar: Standardized PageHeaderNav with Back Button and Query Actions */}
      <PageHeaderNav
        moduleName="APF Underwriting Dossier"
        pageTitle={`${builder?.legalName || c.builderId} — ${project?.projectName || c.projectId}`}
        subtitle={`Case Ref: ${c.id} • APF #${c.apfNumber} • Sourcing: ${c.branch}`}
        badge={c.currentStatus.replace(/_/g, ' ')}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRaiseModal(true)}
              className="px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+ Raise Query</span>
            </button>
          </div>
        }
      />

      {/* Compact Case Identification & Progress Card */}
      <div className="bg-white px-3.5 py-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-white bg-[#0c3148] px-2 py-0.5 rounded">
                {c.id}
              </span>
              <span className="text-[11px] font-mono font-bold text-[#19638c] bg-[#e8f1f5] px-2 py-0.5 rounded">
                {c.apfNumber}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>MahaRERA: {project?.reraNumbers.join(', ')}</span>
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-tight">
              {builder?.legalName} — {project?.projectName}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Scope: {selectedTowers.map((t) => t.towerName).join(' & ')} • {project?.locality}, {project?.city} • Sourcing: {c.branch}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
                {c.currentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="font-medium text-slate-400">Owner:</span>
              <span className="font-semibold text-[#0c3148] bg-slate-100 px-1.5 py-0.2 rounded">
                {c.currentOwnerRole} ({c.currentOwnerName})
              </span>
            </div>
          </div>
        </div>

        {/* Compact Workflow Progress Stepper */}
        <div className="overflow-x-auto pt-0.5">
          <div className="flex items-center min-w-[760px] justify-between text-xs py-0.5">
            {steps.map((step, idx) => {
              const isCurrent =
                (c.currentStatus === 'INITIATED' && step.key === 'ASSIGNED_TO_VALUER') ||
                (c.currentStatus === 'ASSIGNED_TO_VALUER' && step.key === 'VALUER_ACCEPTED') ||
                (c.currentStatus === 'VALUER_ACCEPTED' && step.key === 'SITE_VISIT') ||
                (c.currentStatus === 'SITE_VISIT_IN_PROGRESS' && step.key === 'VALUATION_SUBMITTED') ||
                (c.currentStatus === 'VALUATION_SUBMITTED' && step.key === 'COM_REVIEW') ||
                (c.currentStatus === 'COM_REVIEW' && step.key === 'APPROVAL') ||
                (c.currentStatus === 'PENDING_APPROVAL' && step.key === 'APPROVAL') ||
                ((c.currentStatus === 'APPROVED' || c.currentStatus === 'CONDITIONAL_APPROVAL') && step.key === 'LOS') ||
                (c.currentStatus === 'APF_ACTIVE' && step.key === 'APF_ACTIVE');

              return (
                <div key={step.key} className="flex flex-col items-center group">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mb-0.5 transition-all ${
                      step.done
                        ? 'bg-[#137333] text-white'
                        : isCurrent
                        ? 'bg-[#0c3148] text-white ring-2 ring-[#bae6fd] animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap leading-tight ${isCurrent ? 'font-bold text-[#0c3148]' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">{step.role}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🚨 GEOFENCE BREACH & SITE ADDRESS MISMATCH SECURITY BANNER */}
      {c.latestGeofenceBreach && c.latestGeofenceBreach.status === 'ACTIVE_ALERT' && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 shadow-md space-y-3.5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                <OctagonAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                    🚨 Geofence Breach Alert: Valuer Location Mismatch with Registered Site Address
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-mono text-[11px] font-black uppercase">
                    {c.latestGeofenceBreach.distanceFromProjectMeters}m Deviation
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    Pinning Rejected & Blocked
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  Attempted by: <strong className="text-rose-950">{c.latestGeofenceBreach.attemptedBy}</strong> ({c.latestGeofenceBreach.attemptedRole}) at {c.latestGeofenceBreach.attemptedAt}
                </p>
              </div>
            </div>

            {/* Alerted Authorities Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Alert Dispatched To:</span>
              <span className="px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-300 font-bold text-[10px]">CPA</span>
              <span className="px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-300 font-bold text-[10px]">COM</span>
              <span className="px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-300 font-bold text-[10px]">ACOM (Approver)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-white/90 rounded-xl border border-rose-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Project Site Address</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {c.latestGeofenceBreach.projectAddress}
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                Anchor: {c.latestGeofenceBreach.projectLat.toFixed(5)}, {c.latestGeofenceBreach.projectLng.toFixed(5)} (500m Limit)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Attempted Pin Coordinates (Blocked)</span>
              <p className="font-mono font-bold text-rose-950 mt-0.5">
                [{c.latestGeofenceBreach.attemptedLat.toFixed(6)}, {c.latestGeofenceBreach.attemptedLng.toFixed(6)}]
              </p>
              <span className="text-[11px] text-rose-800">
                Deviation: <strong>{c.latestGeofenceBreach.distanceFromProjectMeters}m</strong> off-site boundary
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-rose-900 font-medium">
              Policy Enforcement: Valuer was blocked from updating the pin. Case workflow cannot proceed without authority review.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('COMMUNICATION')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  View Blocking Queries (
                  {
                    queryStore
                      .getQueriesForCase(c.id)
                      .filter((q) => q.isBlocking && q.status !== 'CLOSED' && q.status !== 'CANCELLED').length
                  }
                  )
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('VALUATION')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Inspect on Map</span>
              </button>

              {(currentUser.role === 'COM' || currentUser.role === 'APPROVER' || currentUser.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() =>
                    setBreachReviewModal({
                      isOpen: true,
                      decision: 'REJECT_AND_DEMAND_PHYSICAL_VISIT',
                      remarks: '',
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authority Reconcile / Sign-Off</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROLE ACTION CONTAINER: Appears ONLY when current user's role owns the activity */}
      <div className="bg-white rounded-xl border border-sky-900/30 shadow-2xs p-3 sm:p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-sky-50 text-sky-800">
              <Sliders className="w-3.5 h-3.5" />
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight flex items-center gap-2">
                <span>Workflow Action Console</span>
                <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                  {c.currentStatus.replace(/_/g, ' ')}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Assigned: <strong className="text-slate-800">{c.currentOwnerRole}</strong>
            </span>
            {isActionOwner && (
              <button
                type="button"
                onClick={() => setIsActionConsoleOpen(!isActionConsoleOpen)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
              >
                <span>{isActionConsoleOpen ? 'Collapse' : 'Expand Action Form'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActionConsoleOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Action Form or Read-Only Banner */}
        {isActionOwner ? (
          isActionConsoleOpen ? (
            <div className="space-y-3 pt-0.5">
              {/* Blocking Query Warning Banner */}
              {blockingStatus.isBlocked && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold text-xs text-rose-950 flex items-center gap-2 flex-wrap">
                      <span>Workflow Progression Blocked — Clarification Required</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-mono text-[9px] uppercase font-black">
                        Blocking Query Active
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">
                      &ldquo;{blockingStatus.blockingQuery?.subject}&rdquo; • Assigned to: <strong>{blockingStatus.blockingQuery?.assignedToRole}</strong>.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (blockingStatus.blockingQuery) {
                            setSelectedQueryId(blockingStatus.blockingQuery.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>View Blocking Query →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('COMMUNICATION')}
                        className="px-2.5 py-1 rounded-md bg-white border border-rose-300 text-rose-900 font-semibold hover:bg-rose-100 transition-colors text-xs"
                      >
                        Open Communication Tab
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. CPA: Assign Valuer */}
            {c.currentStatus === 'INITIATED' && currentUser.role === 'CPA' && (
              <div className="space-y-4">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#19638c] uppercase tracking-wider">
                      Assign Appraisal Valuer
                    </span>
                    <span className="text-[11px] text-[#627d98]">Dual / Single Panel Route</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">Valuer Type</label>
                      <select
                        value={valuerType}
                        onChange={(e) => setValuerType(e.target.value as any)}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-semibold bg-white"
                      >
                        <option value="External">External Panel Valuer</option>
                        <option value="Internal">Internal Technical Officer</option>
                        <option value="Dual">Dual Route (Joint Valuation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">Empanelled Agency</label>
                      <input
                        type="text"
                        value={assignedVendor}
                        onChange={(e) => setAssignedVendor(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-semibold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">Assigned Valuer User</label>
                      <input
                        type="text"
                        value={assignedValuerName}
                        onChange={(e) => setAssignedValuerName(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-semibold bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#334e68] mb-1">Special Inspection Instructions</label>
                    <textarea
                      rows={2}
                      value={visitInstructions}
                      onChange={(e) => setVisitInstructions(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAssignValuer}
                    className="px-5 py-2.5 bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Assign to Valuer Queue →</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Valuer: Accept Assignment */}
            {c.currentStatus === 'ASSIGNED_TO_VALUER' &&
              (currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER') && (
                <div className="bg-[#fef7e0] p-5 rounded-xl border border-[#b06000]/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <Compass className="w-5 h-5 text-[#b06000] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-[#b06000] uppercase tracking-wider">
                        Valuer Task Assignment Pending Acceptance
                      </h3>
                      <p className="text-xs text-[#102a43] mt-1">
                        You have been assigned the technical & physical appraisal of{' '}
                        <strong>{project?.projectName}</strong> for towers{' '}
                        <strong>{selectedTowers.map((t) => t.towerName).join(', ')}</strong>.
                      </p>
                      <p className="text-[11px] text-[#627d98] mt-1">
                        Instructions: {c.valuerAssignment?.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#b06000]/20">
                    <label className="flex items-center gap-2 text-xs text-[#334e68] cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#19638c]" />
                      <span>I declare no direct conflict of interest with developer {builder?.legalName}.</span>
                    </label>

                    <button
                      onClick={handleAcceptAssignment}
                      className="px-5 py-2 bg-[#b06000] hover:bg-[#8a4b00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Assignment & Lock Schedule</span>
                    </button>
                  </div>
                </div>
              )}

            {/* 3. Valuer: Start Site Visit & Google Maps Pinning */}
            {c.currentStatus === 'VALUER_ACCEPTED' &&
              (currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER') && (
                <div className="bg-[#e0f2fe] p-5 rounded-xl border border-[#0369a1]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#0369a1] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Ready to Commence Mobile Site Visit & Location Pinning</span>
                      </h3>
                      <p className="text-xs text-[#102a43] mt-1">
                        Pin your physical inspection spot on Google Maps to verify coordinates against the project 500m geofence [
                        {project?.latLong.lat}, {project?.latLong.lng}].
                      </p>
                    </div>
                    {c.valuerAssignment?.pinnedLocation ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Google Maps Pin Locked ({c.valuerAssignment.pinnedLocation.lat.toFixed(4)}, {c.valuerAssignment.pinnedLocation.lng.toFixed(4)})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-white text-[#0369a1] text-xs font-bold border border-[#0369a1]/20 self-start sm:self-auto">
                        Geofence: 500m Monitored Perimeter
                      </span>
                    )}
                  </div>

                  {c.valuerAssignment?.pinnedLocation && (
                    <div className="p-3 bg-white/90 rounded-xl border border-[#0369a1]/20 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                        <span>Lat: {c.valuerAssignment.pinnedLocation.lat.toFixed(6)}, Lng: {c.valuerAssignment.pinnedLocation.lng.toFixed(6)}</span>
                        <span className="text-emerald-700 font-bold">Accuracy: ±{c.valuerAssignment.pinnedLocation.accuracyMeters.toFixed(1)}m</span>
                      </div>
                      <div className="text-slate-800 font-medium">
                        📍 {c.valuerAssignment.pinnedLocation.address || 'Project Inspection Point'}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#0369a1]/20">
                    <button
                      type="button"
                      onClick={() => setShowMapPinModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{c.valuerAssignment?.pinnedLocation ? 'Update Pin on Google Maps' : '📍 Pin My Location on Google Maps'}</span>
                    </button>

                    <button
                      onClick={handleStartSiteVisit}
                      className="px-5 py-2.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Site Visit & Record GPS Lock →</span>
                    </button>
                  </div>
                </div>
              )}

            {/* 4. Valuer: Site Visit & Valuation Report Submission */}
            {(c.currentStatus === 'SITE_VISIT_IN_PROGRESS' || c.currentStatus === 'VALUATION_REWORK') &&
              (currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER') && (
                <div className="space-y-4">
                  {c.currentStatus === 'VALUATION_REWORK' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      <strong>CPA Rework Note:</strong>{' '}
                      {c.auditTrail.find((a) => a.action === 'SENT_BACK_FOR_REWORK')?.remarks || 'Please re-verify'}
                    </div>
                  )}

                  {/* Google Maps Pin Bar */}
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <MapPin className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>Physical Site Visit GPS Status</span>
                          {c.valuerAssignment?.pinnedLocation ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                              Google Maps Verified ({c.valuerAssignment.pinnedLocation.lat.toFixed(4)}, {c.valuerAssignment.pinnedLocation.lng.toFixed(4)})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                              Pin Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {c.valuerAssignment?.pinnedLocation?.address || 'Site inspection within project geofence boundary.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMapPinModal(true)}
                      className="px-3 py-1.5 bg-white border border-sky-300 hover:bg-sky-100 text-sky-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.valuerAssignment?.pinnedLocation ? 'View / Adjust Pin on Google Maps' : '📍 Pin Location on Google Maps'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                        Adopted Base APF Rate (₹/sq.ft) *
                      </label>
                      <input
                        type="number"
                        value={adoptedRateSqFt}
                        onChange={(e) => setAdoptedRateSqFt(Number(e.target.value))}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-bold text-[#102a43] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                        Technical Grading *
                      </label>
                      <select
                        value={technicalGrade}
                        onChange={(e) => setTechnicalGrade(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-bold text-[#102a43] bg-white"
                      >
                        <option value="A+">A+ (Tier 1 Construction / Impeccable)</option>
                        <option value="A">A (High Quality / Reputed)</option>
                        <option value="B+">B+ (Satisfactory / Minor Snags)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                        Fair Market Value (₹ Cr)
                      </label>
                      <div className="p-2 text-xs rounded-lg bg-[#f1f5f9] font-bold text-emerald-700">
                        ₹215.4 Cr (Realizable: ₹193.8 Cr)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#627d98]">
                      Upon submission, report will be cryptographically locked with SHA-256 hash.
                    </span>

                    <button
                      onClick={handleSubmitValuationReport}
                      className="px-5 py-2.5 bg-[#137333] hover:bg-[#0f5b28] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Submit Valuation Report & Return to CPA →</span>
                    </button>
                  </div>
                </div>
              )}

            {/* 5. CPA: Review Valuation & Exposure 360 */}
            {c.currentStatus === 'VALUATION_SUBMITTED' && currentUser.role === 'CPA' && (
              <div className="space-y-4">
                <div className="bg-[#e8f1f5] p-4 rounded-xl border border-[#19638c]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#19638c] uppercase tracking-wider">
                      CPA Technical & Exposure Review
                    </span>
                    <span className="text-[10px] font-mono text-[#627d98]">
                      Hash: {c.valuationReport?.reportHash.substring(0, 20)}...
                    </span>
                  </div>
                  <p className="text-xs text-[#102a43]">
                    Independent valuer has submitted report with adopted rate of{' '}
                    <strong>₹{c.valuationReport?.adoptedBaseRateSqFt.toLocaleString()}/sq.ft</strong> (Grade{' '}
                    {c.valuationReport?.technicalGrade}). Exposure 360 has been reconciled automatically.
                  </p>
                </div>

                {showReworkInput ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-rose-800">
                      Rework Remarks for Assigned Valuer *
                    </label>
                    <textarea
                      rows={2}
                      value={reworkRemarks}
                      onChange={(e) => setReworkRemarks(e.target.value)}
                      placeholder="Specify clarification needed on rate / slab count..."
                      className="w-full p-2 text-xs border border-rose-300 rounded-lg bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowReworkInput(false)}
                        className="px-3 py-1.5 text-xs text-[#627d98]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendBackRework}
                        className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg"
                      >
                        Confirm Send Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                      CPA Recommendation Notes (Mandatory for COM Submission)
                    </label>
                    <textarea
                      rows={2}
                      value={cpaNotes}
                      onChange={(e) => setCpaNotes(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-medium bg-white"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  {!showReworkInput && (
                    <button
                      onClick={() => setShowReworkInput(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Send Back to Valuer for Rework
                    </button>
                  )}

                  <button
                    onClick={handleCpaSubmitToCom}
                    className="px-5 py-2.5 bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Endorse & Submit to COM Review →</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. COM: Supervisory Review */}
            {c.currentStatus === 'COM_REVIEW' && currentUser.role === 'COM' && (
              <div className="space-y-4">
                <div className="bg-[#fef7e0] p-4 rounded-xl border border-[#b06000]/30 space-y-2">
                  <span className="font-bold text-xs text-[#b06000] uppercase tracking-wider block">
                    COM Supervisory Sanction Review
                  </span>
                  <p className="text-xs text-[#102a43]">
                    Review builder track record, group exposure headroom (Current: ₹
                    {c.exposureSnapshot?.groupHeadroomCr.toFixed(1)} Cr headroom), and CPA endorsement.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                    COM Endorsement / Credit Committee Note
                  </label>
                  <textarea
                    rows={2}
                    value={comNotes}
                    onChange={(e) => setComNotes(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-medium bg-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleComSubmitToApprover}
                    className="px-5 py-2.5 bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit to Approving Manager / Committee →</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. Approver: Decision Cockpit */}
            {c.currentStatus === 'PENDING_APPROVAL' &&
              (currentUser.role === 'APPROVER' || currentUser.role === 'COMMITTEE') && (
                <div className="space-y-4">
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#cbd5e1] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#102a43] uppercase tracking-wider">
                        Sanction Decision Cockpit
                      </span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded">
                        Quorum: 3 / 3 Voters Present
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#334e68] mb-1">
                        Sanction Terms & Decision Minutes
                      </label>
                      <textarea
                        rows={2}
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-[#cbd5e1] font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleApproverDecision('DEFERRED')}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors"
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => handleApproverDecision('REJECTED')}
                      className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproverDecision('CONDITIONAL_APPROVAL')}
                      className="px-5 py-2.5 bg-[#19638c] hover:bg-[#145070] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Approve with Conditions ({conditions.length})
                    </button>
                    <button
                      onClick={() => handleApproverDecision('APPROVED')}
                      className="px-5 py-2.5 bg-[#137333] hover:bg-[#0f5b28] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Approve Clean
                    </button>
                  </div>
                </div>
              )}

            {/* 8. Send to LOS Gateway */}
            {(c.currentStatus === 'APPROVED' || c.currentStatus === 'CONDITIONAL_APPROVAL') &&
              (currentUser.role === 'CPA' || currentUser.role === 'COM') && (
                <div className="space-y-4">
                  <div className="bg-[#e6f4ea] p-4 rounded-xl border border-[#137333]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#137333] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Case Sanctioned & Approved by Zonal Credit Committee</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-[#137333]">
                        Ready for Core LOS Gateway
                      </span>
                    </div>
                    <p className="text-xs text-[#102a43]">
                      Click below to generate and transmit the signed JSON payload directly to the Core Loan
                      Origination System via secure REST ESB.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSendToLos}
                      className="px-6 py-2.5 bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit to Core LOS Gateway →</span>
                    </button>
                  </div>
                </div>
              )}

            {/* 9. APF Active in LOS */}
            {c.currentStatus === 'APF_ACTIVE' && (
              <div className="bg-[#e6f4ea] p-5 rounded-xl border border-[#137333]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#137333] text-white flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#137333]">
                      APF Scheme Successfully Activated in Core LOS
                    </h3>
                    <p className="text-xs text-[#102a43] mt-0.5">
                      LOS APF ID: <strong className="font-mono text-emerald-900">{c.losResponse?.losApfId}</strong>{' '}
                      • Ack: {c.losResponse?.acknowledgementId}
                    </p>
                    <span className="text-[11px] text-[#627d98]">
                      All retail branches are now authorized to source home loans under this project scheme.
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-white border border-[#137333]/30 text-emerald-800 text-xs font-black">
                  ACTIVE & SOURCING
                </span>
              </div>
            )}
          </div>
        ) : null) : (
          <div className="p-2.5 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px]">
                Viewing in <strong>Read-Only Mode</strong> ({currentUser.role}). Next action assigned to <strong>{c.currentOwnerRole}</strong> ({c.currentOwnerName}).
              </span>
            </div>
            <span className="text-[9px] font-mono uppercase text-slate-400">RBAC</span>
          </div>
        )}
      </div>

      {/* Dossier Tabs: Overview, Valuation, Exposure 360, Decision & LOS, Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 px-3 bg-slate-50/70 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeTab === 'OVERVIEW'
                ? 'border-[#0c3148] text-[#0c3148] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Overview & Scope</span>
          </button>

          <button
            onClick={() => setActiveTab('VALUATION')}
            className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeTab === 'VALUATION'
                ? 'border-[#0c3148] text-[#0c3148] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Valuation ({c.siteVisitEvidence?.length || 0})</span>
          </button>

          {/* TAB 3 BUTTON: Restricted strictly to CPA, COM, ACOM, RCOM, ZCOM, NCOM. Valuers cannot access */}
          {canAccessExposureReport(currentUser.role) && (
            <button
              onClick={() => setActiveTab('EXPOSURE')}
              className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
                activeTab === 'EXPOSURE'
                  ? 'border-[#0c3148] text-[#0c3148] font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exposure 360 {c.exposureSnapshot ? '✓' : '(Pending)'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeTab === 'APPROVAL'
                ? 'border-[#0c3148] text-[#0c3148] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Decision & LOS</span>
          </button>

          <button
            onClick={() => setActiveTab('COMMUNICATION')}
            className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeTab === 'COMMUNICATION'
                ? 'border-[#0c3148] text-[#0c3148] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Queries ({caseQueries.length})</span>
            {blockingStatus.isBlocked && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Blocking query active" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs ${
              activeTab === 'AUDIT'
                ? 'border-[#0c3148] text-[#0c3148] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({c.auditTrail.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 text-xs text-slate-800">
          {/* TAB 1: OVERVIEW & SCOPE */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Builder Card */}
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
                  <h3 className="font-bold text-[#19638c] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Developer Entity Master</span>
                  </h3>
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-[#102a43]">{builder?.legalName}</div>
                    <div className="text-[#627d98]">Group: {builder?.groupName}</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2e8f0] font-mono text-[11px]">
                      <div>PAN: <strong className="text-[#102a43]">{builder?.pan}</strong></div>
                      <div>CIN: <strong className="text-[#102a43]">{builder?.cin}</strong></div>
                      <div>City: <strong className="text-[#102a43]">{builder?.city}</strong></div>
                      <div>Track: <strong className="text-emerald-700">{builder?.totalProjectsCompleted} Delivered</strong></div>
                    </div>
                  </div>
                </div>

                {/* Project Card */}
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
                  <h3 className="font-bold text-[#19638c] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Project & RERA Master</span>
                  </h3>
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-[#102a43]">{project?.projectName}</div>
                    <div className="text-[#627d98]">{project?.address}</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2e8f0] text-[11px]">
                      <div>RERA: <strong className="text-[#19638c] font-mono">{project?.reraNumbers.join(', ')}</strong></div>
                      <div>Type: <strong className="text-[#102a43]">{project?.projectType}</strong></div>
                      <div>Land Area: <strong className="text-[#102a43]">{project?.totalLandAreaAcres} Acres</strong></div>
                      <div>Coords: <strong className="font-mono">{project?.latLong.lat}, {project?.latLong.lng}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sanctioned Towers & Units */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#102a43] uppercase tracking-wider text-xs">
                  Underwriting Scope Towers ({selectedTowers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTowers.map((t) => {
                    const towerUnits = getUnitsByTower(t.id);
                    return (
                      <div key={t.id} className="p-4 rounded-xl border border-[#cbd5e1] bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#102a43]">{t.towerName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            {t.physicalProgressPct}% Physical Progress
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] text-[#627d98]">
                          <div>Sanctioned: <strong>{t.floorsSanctioned} Floors</strong></div>
                          <div>Constructed: <strong>{t.floorsConstructed} Floors</strong></div>
                          <div>Slabs: <strong>{t.slabsCompleted} Slabs</strong></div>
                        </div>

                        <p className="text-[11px] text-[#334e68] pt-1">
                          Current Stage: <strong>{t.constructionStage}</strong>
                        </p>

                        <div className="pt-2 border-t border-[#e2e8f0] text-[10px] text-[#829ab1] flex items-center justify-between">
                          <span>{towerUnits.length} Sanctioned Units mapped</span>
                          <span className="font-semibold text-emerald-700">VERIFIED IN CATALOGUE</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VALUATION & EVIDENCE */}
          {activeTab === 'VALUATION' && (
            <div className="space-y-4">
              {/* Technical Appraisal & Valuation Action Bar */}
              <div className="p-3 bg-slate-900 text-white rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                        Technical Appraisal & Valuation Dossier
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                        Field Catalogue Compliant
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Structural progress, direct comparable sales, infrastructure scores & digital verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {(currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER' || currentUser.role === 'CPA' || currentUser.role === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={() => setShowValuerWorkbenchModal(true)}
                      className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-md shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Valuer Workbench</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowValuationDocModal(true)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-md border border-white/20 shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-300" />
                    <span>Report Document</span>
                  </button>
                </div>
              </div>

              {c.valuationReport ? (
                <div className="space-y-6">
                  {/* Report Card */}
                  <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#cbd5e1] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2e8f0] gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white bg-[#137333] px-2 py-0.5 rounded">
                            LOCKED REPORT {c.valuationReport.reportVersion}
                          </span>
                          <span className="text-xs font-bold text-[#19638c]">
                            Grade {c.valuationReport.technicalGrade}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#102a43] mt-1">
                          Valuation Summary & Technical Rate Adoption
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-[#829ab1]">SHA-256 Report Signature</div>
                        <div className="font-mono text-[10px] text-[#334e68]">{c.valuationReport.reportHash}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-[#829ab1] uppercase">Adopted APF Rate</span>
                        <div className="text-lg font-black text-[#19638c]">
                          ₹{c.valuationReport.adoptedBaseRateSqFt.toLocaleString()}/sq.ft
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-[#829ab1] uppercase">Fair Market Value</span>
                        <div className="text-lg font-black text-[#137333]">
                          ₹{c.valuationReport.fairMarketValueCr} Cr
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-[#829ab1] uppercase">Realizable Value</span>
                        <div className="text-lg font-black text-[#102a43]">
                          ₹{c.valuationReport.realizableValueCr} Cr
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-[#829ab1] uppercase">Distress Value</span>
                        <div className="text-lg font-black text-rose-700">
                          ₹{c.valuationReport.distressValueCr} Cr
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#334e68] space-y-1 pt-1">
                      <p><strong>Valuer Recommendation:</strong> {c.valuationReport.valuerRecommendation}</p>
                      <p className="text-[11px] text-[#829ab1] font-mono">{c.valuationReport.digitalSignature}</p>
                    </div>
                  </div>

                  {/* Interactive Google Map & Geofence Section */}
                  <div className="space-y-2">
                    <InteractiveSiteMapView
                      caseData={c}
                      project={project}
                      canPin={
                        currentUser.role === 'EXTERNAL_VALUER' ||
                        currentUser.role === 'INTERNAL_VALUER' ||
                        currentUser.role === 'CPA' ||
                        currentUser.role === 'ADMIN'
                      }
                      onOpenPinModal={() => setShowMapPinModal(true)}
                    />
                  </div>

                  {/* Geotagged Site Evidence Gallery */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
                      Geotagged Mobile Inspection Evidence ({c.siteVisitEvidence?.length || 0})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {c.siteVisitEvidence?.map((ev) => (
                        <div key={ev.id} className="p-4 rounded-xl border border-[#cbd5e1] bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#19638c]">{ev.category}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                              Inside Geofence (±{ev.accuracyMeters}m)
                            </span>
                          </div>

                          <div className="font-bold text-xs text-[#102a43]">{ev.title}</div>
                          <p className="text-[11px] text-[#627d98]">{ev.notes}</p>

                          <div className="pt-2 border-t border-[#e2e8f0] text-[10px] font-mono text-[#829ab1] flex items-center justify-between">
                            <span>GPS: {ev.lat}, {ev.lng}</span>
                            <span>{ev.timestamp.substring(11, 19)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Comparables */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
                      Micro-Market Valuation Comparables
                    </h3>

                    <div className="overflow-x-auto border border-[#cbd5e1] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase">
                          <tr>
                            <th className="p-3">Comparable Project</th>
                            <th className="p-3">Developer</th>
                            <th className="p-3">Distance</th>
                            <th className="p-3">Typology</th>
                            <th className="p-3">Quoted Rate</th>
                            <th className="p-3">Registered IGR Rate</th>
                            <th className="p-3">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {c.marketComparables?.map((cmp) => (
                            <tr key={cmp.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-[#102a43]">{cmp.projectName}</td>
                              <td className="p-3 text-[#627d98]">{cmp.developer}</td>
                              <td className="p-3">{cmp.distanceKm}</td>
                              <td className="p-3">{cmp.configuration}</td>
                              <td className="p-3 font-semibold text-[#102a43]">₹{cmp.quotedRateSqFt}/sq.ft</td>
                              <td className="p-3 font-bold text-emerald-800">₹{cmp.registeredRateSqFt}/sq.ft</td>
                              <td className="p-3 text-[10px] text-[#829ab1]">{cmp.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Interactive Google Map with Pinning Access before submission */}
                  <InteractiveSiteMapView
                    caseData={c}
                    project={project}
                    canPin={
                      currentUser.role === 'EXTERNAL_VALUER' ||
                      currentUser.role === 'INTERNAL_VALUER' ||
                      currentUser.role === 'CPA' ||
                      currentUser.role === 'ADMIN'
                    }
                    onOpenPinModal={() => setShowMapPinModal(true)}
                  />

                  <div className="py-8 text-center text-[#829ab1] bg-white rounded-2xl border border-dashed border-slate-200">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-700">Valuation Report not yet submitted.</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                      Use the &quot;Pin My Location on Google Maps&quot; button above to record your site inspection coordinates within the 500m geofence perimeter.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPOSURE 360 (Guarded by Credit Operations Policy) */}
          {activeTab === 'EXPOSURE' && (
            <div className="space-y-6">
              {canAccessExposureReport(currentUser.role) ? (
                <BuilderExposure360Report
                  currentUser={currentUser}
                  caseId={c.id}
                  builderId={c.builderId}
                />
              ) : (
                <ExposureAccessRestrictedCard
                  currentRole={currentUser.role}
                  userName={currentUser.name}
                  onNavigateBack={() => setActiveTab('OVERVIEW')}
                  onNavigateToValuation={() => setActiveTab('VALUATION')}
                />
              )}
            </div>
          )}

          {/* TAB 4: DECISION & LOS PAYLOAD */}
          {activeTab === 'APPROVAL' && (
            <div className="space-y-6">
              {c.approvalDecision ? (
                <div className="space-y-6">
                  {/* Sanction Decision Box */}
                  <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#cbd5e1] space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                      <div>
                        <span className="text-xs font-bold text-white bg-[#137333] px-2.5 py-0.5 rounded">
                          DECISION: {c.approvalDecision.decision}
                        </span>
                        <div className="text-xs text-[#627d98] mt-1">
                          Sanctioned by: <strong>{c.approvalDecision.decidedBy}</strong> ({c.approvalDecision.decidedRole})
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#829ab1]">
                        {c.approvalDecision.decidedAt}
                      </div>
                    </div>

                    <p className="text-xs text-[#102a43]">
                      <strong>Sanction Minutes:</strong> {c.approvalDecision.decisionNotes}
                    </p>

                    {/* Registered Conditions */}
                    <div className="space-y-2 pt-2">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-[#334e68] block">
                        Registered Sanction Conditions & Covenants ({c.approvalDecision.conditions.length})
                      </span>
                      <div className="space-y-1.5">
                        {c.approvalDecision.conditions.map((cd) => (
                          <div
                            key={cd.id}
                            className="p-2.5 bg-white rounded-lg border border-[#e2e8f0] flex items-start justify-between text-xs gap-3"
                          >
                            <div>
                              <span className="font-semibold text-[#102a43]">{cd.conditionText}</span>
                              <div className="text-[10px] text-[#829ab1] mt-0.5">
                                Responsible: {cd.responsibleRole} • Due: {cd.dueDate}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 shrink-0">
                              {cd.timing}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LOS Payload & Response */}
                  {c.losPayload && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
                          Outbound LOS JSON Payload (REST Gateway)
                        </h3>
                        <span className="text-[10px] font-mono text-[#19638c]">
                          Idempotency: {c.losPayload.idempotencyKey}
                        </span>
                      </div>

                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72">
                        {JSON.stringify(c.losPayload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {c.losResponse && (
                    <div className="p-4 bg-[#e6f4ea] rounded-xl border border-[#137333]/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#137333]">
                          Core LOS Gateway Response: 201 CREATED
                        </span>
                        <span className="font-mono text-xs font-bold text-[#137333]">
                          {c.losResponse.losApfId}
                        </span>
                      </div>
                      <p className="text-xs text-[#102a43]">{c.losResponse.message}</p>
                      <span className="text-[10px] text-[#627d98] font-mono">
                        Ack Ref: {c.losResponse.acknowledgementId} • Received: {c.losResponse.receivedAt}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-[#829ab1]">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">Case has not yet reached Committee Sanction.</p>
                  <p className="text-[11px]">
                    Once COM recommends the docket, the Approving Manager will record the vote and covenants here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: COMMUNICATION & QUERIES */}
          {activeTab === 'COMMUNICATION' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#0a2540] uppercase tracking-wider">
                      In-App Case Communication & Query Resolution
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                      {caseQueries.length} Threads
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formal audit-tracked clarifications, blocking inputs, and inter-role communications for {c.id}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRaiseModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>+ Raise Query / Request Input</span>
                </button>
              </div>

              {/* Status Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Queries</span>
                  <span className="text-lg font-black text-slate-800">{caseQueries.length}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Need Input</span>
                  <span className="text-lg font-black text-amber-900">
                    {caseQueries.filter((q) => q.status === 'INPUT_REQUIRED').length}
                  </span>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Blocking Workflow</span>
                  <span className="text-lg font-black text-rose-900">
                    {caseQueries.filter((q) => q.isBlocking && q.status !== 'CLOSED' && q.status !== 'CANCELLED').length}
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Resolved / Closed</span>
                  <span className="text-lg font-black text-emerald-900">
                    {caseQueries.filter((q) => q.status === 'CLOSED').length}
                  </span>
                </div>
              </div>

              {/* Queries List */}
              <div className="space-y-3">
                {caseQueries.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No communication queries raised on this case.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Need clarification or additional documents? Click &quot;+ Raise Query / Request Input&quot; above.
                    </p>
                  </div>
                ) : (
                  caseQueries.map((q) => {
                    const isBlocking = q.isBlocking && q.status !== 'CLOSED' && q.status !== 'CANCELLED';
                    const lastMsg = q.messages[q.messages.length - 1];

                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQueryId(q.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-md ${
                          isBlocking
                            ? 'border-rose-300 ring-2 ring-rose-200/50 bg-rose-50/20'
                            : 'border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-[#0a2540]">{q.id}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {q.category}
                            </span>
                            {isBlocking && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Blocking Workflow</span>
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                q.status === 'INPUT_REQUIRED'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : q.status === 'INPUT_RECEIVED'
                                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                  : q.status === 'CLOSED'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {q.status.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400">{q.updatedAt}</span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 mt-2">{q.subject}</h4>

                        {lastMsg && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-medium">
                            <span className="font-bold text-[#0c3148]">{lastMsg.senderName} ({lastMsg.senderRole}):</span>{' '}
                            {lastMsg.message}
                          </p>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                            <span>Raised by: <strong className="text-slate-700">{q.raisedByUserRole} ({q.raisedByUserName})</strong></span>
                            <span>Assigned to: <strong className="text-[#0c3148] font-bold">{q.assignedToRole}</strong></span>
                            {q.relatedField && (
                              <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-medium border border-sky-200">
                                Ref: {q.relatedField}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQueryId(q.id);
                            }}
                            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 self-end sm:self-auto"
                          >
                            <span>Open Thread & Reply ({q.messages.length}) →</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TIMELINE */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <h3 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
                  Real-Time Chronological Audit Trail ({c.auditTrail.length} Events)
                </h3>
                <span className="text-[10px] text-[#829ab1]">Generated strictly by authenticated actions</span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#e2e8f0]">
                {c.auditTrail.map((evt) => (
                  <div key={evt.id} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#19638c] ring-4 ring-white" />
                    <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] w-full space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#102a43]">
                          {evt.actorName} ({evt.actorRole})
                        </span>
                        <span className="font-mono text-[10px] text-[#829ab1]">{evt.timestamp}</span>
                      </div>

                      <p className="text-xs text-[#334e68] font-medium">{evt.remarks}</p>

                      <div className="text-[10px] text-[#829ab1] font-mono pt-1 border-t border-[#edf2f7] flex items-center justify-between">
                        <span>Status: {evt.priorStatus} → {evt.newStatus}</span>
                        <span>{evt.deviceInfo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raise Query Modal */}
      {showRaiseModal && (
        <RaiseQueryModal
          isOpen={showRaiseModal}
          onClose={() => setShowRaiseModal(false)}
          currentUser={currentUser}
          caseId={c.id}
          builderId={c.builderId}
          builderName={builder?.legalName || c.builderId}
          projectId={c.projectId}
          projectName={project?.projectName || c.projectId}
        />
      )}

      {/* Query Detail Modal */}
      {selectedQueryId && (
        <QueryDetailModal
          isOpen={Boolean(selectedQueryId)}
          onClose={() => setSelectedQueryId(null)}
          query={queryStore.getQueryById(selectedQueryId) || null}
          currentUser={currentUser}
        />
      )}

      {/* Google Maps Valuer Location Pin Modal */}
      {showMapPinModal && (
        <ValuerMapPinModal
          isOpen={showMapPinModal}
          onClose={() => setShowMapPinModal(false)}
          caseData={c}
          project={project}
          onLocationPinned={(loc) => {
            // Updated location pinned
          }}
        />
      )}

      {/* Geofence Breach Authority Review Modal */}
      {breachReviewModal?.isOpen && c.latestGeofenceBreach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Geofence Compliance Review & Resolution</h3>
                  <p className="text-[11px] text-slate-300">Case ID: {c.id} • Registered Project: {project?.projectName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBreachReviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1.5">
                <div className="font-bold flex items-center justify-between">
                  <span>Reported Incident</span>
                  <span className="font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300 font-black">
                    ±{c.latestGeofenceBreach.distanceFromProjectMeters}m Deviation
                  </span>
                </div>
                <p>
                  Valuer <strong>{c.latestGeofenceBreach.attemptedBy}</strong> attempted to lock coordinates at [
                  {c.latestGeofenceBreach.attemptedLat.toFixed(5)}, {c.latestGeofenceBreach.attemptedLng.toFixed(5)}], which deviates from the project site address. The pin was blocked.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Authority Supervisory Action:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      breachReviewModal.decision === 'REJECT_AND_DEMAND_PHYSICAL_VISIT'
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="breachDecision"
                      checked={breachReviewModal.decision === 'REJECT_AND_DEMAND_PHYSICAL_VISIT'}
                      onChange={() =>
                        setBreachReviewModal({
                          ...breachReviewModal,
                          decision: 'REJECT_AND_DEMAND_PHYSICAL_VISIT',
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Enforce Strict Physical Re-Inspection & Maintain Blocking Query
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Reject deviation. Require the valuer to physically revisit the exact site coordinates or re-take geotagged inspection evidence.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      breachReviewModal.decision === 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION'
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="breachDecision"
                      checked={breachReviewModal.decision === 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION'}
                      onChange={() =>
                        setBreachReviewModal({
                          ...breachReviewModal,
                          decision: 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION',
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Supervisory Exception Override with Documented Justification
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Authority certifies physical inspection took place at peripheral boundary / entry gate. Resolves blocking queries and clears the active alert.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Authority Audit Remarks & Justification: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={breachReviewModal.remarks}
                  onChange={(e) =>
                    setBreachReviewModal({
                      ...breachReviewModal,
                      remarks: e.target.value,
                    })
                  }
                  placeholder="Enter detailed credit rationale, supervisory review notes, or instructions to valuer..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#19638c]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBreachReviewModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!breachReviewModal.remarks.trim()}
                  onClick={() => {
                    const success = apfStore.reviewGeofenceBreach(
                      c.id,
                      breachReviewModal.decision,
                      breachReviewModal.remarks,
                      currentUser
                    );
                    if (success) {
                      if (breachReviewModal.decision === 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION') {
                        const queries = queryStore.getQueriesForCase(c.id);
                        queries.forEach((q: APFQuery) => {
                          if (q.category === 'Valuation' || q.category === 'Technical' || q.subject.includes('Geofence')) {
                            queryStore.updateQueryStatus(
                              q.id,
                              'CLOSED',
                              currentUser,
                              `Authority Override: ${breachReviewModal.remarks}`
                            );
                          }
                        });
                      }
                      setBreachReviewModal(null);
                    }
                  }}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                    !breachReviewModal.remarks.trim()
                      ? 'bg-slate-400 cursor-not-allowed'
                      : breachReviewModal.decision === 'OVERRIDE_EXCEPTION_WITH_JUSTIFICATION'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm & Submit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Official Bank Valuation Report Document Preview Modal */}
      {showValuationDocModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Official Bank Technical & Valuation Report</span>
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {c.id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Field Catalogue Compliant • Bank Due Diligence Model • Version {c.valuationReport?.reportVersion || 'v1.0'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowValuationDocModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ValuationReportDocPreview
              reportData={getOrGenerateBankValuationReport(c)}
              onClose={() => setShowValuationDocModal(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Full 12-Section PROVAL Valuer App Workbench Modal */}
      {showValuerWorkbenchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[96vh] overflow-y-auto shadow-2xl relative p-4 sm:p-6">
            <ValuerCaseAppModule
              caseData={c}
              currentUser={currentUser}
              onBack={() => setShowValuerWorkbenchModal(false)}
              onSubmitSuccess={() => {
                setShowValuerWorkbenchModal(false);
              }}
              onRaiseQuery={() => {
                setShowRaiseModal(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
