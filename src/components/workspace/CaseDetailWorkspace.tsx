import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
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
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VALUATION' | 'EXPOSURE' | 'APPROVAL' | 'AUDIT'>('OVERVIEW');

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar: Return & Case Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-xs font-bold text-[#334e68] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            SIMULATED POC DATA
          </span>
          <span className="text-xs text-[#829ab1] font-mono">ID: {c.id}</span>
        </div>
      </div>

      {/* Sticky Case Identification Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white bg-[#0c3148] px-2.5 py-0.5 rounded">
                {c.id}
              </span>
              <span className="text-xs font-mono font-bold text-[#19638c] bg-[#e8f1f5] px-2.5 py-0.5 rounded">
                {c.apfNumber}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-[#e6f4ea] px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MahaRERA: {project?.reraNumbers.join(', ')}</span>
              </span>
            </div>

            <h1 className="text-xl font-black text-[#102a43] mt-2">
              {builder?.legalName} — {project?.projectName}
            </h1>
            <p className="text-xs text-[#627d98] mt-0.5">
              Scope: {selectedTowers.map((t) => t.towerName).join(' & ')} • {project?.locality}, {project?.city} • Sourcing: {c.branch}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#829ab1] font-medium">Current Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
                {c.currentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#334e68]">
              <span className="font-semibold">Current Action Owner:</span>
              <span className="font-bold text-[#0c3148] bg-slate-100 px-2 py-0.5 rounded">
                {c.currentOwnerRole} ({c.currentOwnerName})
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Workflow Progress Stepper (Shows strictly real lifecycle progress) */}
        <div className="overflow-x-auto pt-1">
          <div className="flex items-center min-w-[840px] justify-between text-xs">
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
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                      step.done
                        ? 'bg-[#137333] text-white'
                        : isCurrent
                        ? 'bg-[#0c3148] text-white ring-4 ring-[#bae6fd] animate-pulse'
                        : 'bg-[#e2e8f0] text-[#829ab1]'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11px] whitespace-nowrap ${isCurrent ? 'font-bold text-[#0c3148]' : 'text-[#627d98]'}`}>
                    {step.label}
                  </span>
                  <span className="text-[9px] font-mono text-[#829ab1] uppercase">{step.role}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROLE ACTION CONTAINER: Appears ONLY when current user's role owns the activity */}
      <div className="bg-white rounded-2xl border-2 border-[#19638c] shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e2e8f0] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e8f1f5] text-[#19638c]">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#102a43]">
                Workflow Action Console
              </h2>
              <p className="text-xs text-[#627d98]">
                Required Next Step: {c.currentStatus.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#627d98]">You are signed in as:</span>
            <span className="text-xs font-black text-[#0c3148] bg-slate-100 px-2 py-1 rounded">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
        </div>

        {/* Action Form or Read-Only Banner */}
        {isActionOwner ? (
          <div className="space-y-4 pt-1">
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

            {/* 3. Valuer: Start Site Visit */}
            {c.currentStatus === 'VALUER_ACCEPTED' &&
              (currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER') && (
                <div className="bg-[#e0f2fe] p-5 rounded-xl border border-[#0369a1]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#0369a1] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>Ready to Commence Mobile Site Visit</span>
                      </h3>
                      <p className="text-xs text-[#102a43] mt-1">
                        Click below to lock your hardware GPS coordinates against project geofence [
                        {project?.latLong.lat}, {project?.latLong.lng}].
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white text-[#0369a1] text-xs font-bold border border-[#0369a1]/20">
                      Geofence: INSIDE_BOUNDARY (±3.2m)
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
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
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#627d98] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Viewing in <strong>Read-Only Mode</strong> as <strong>{currentUser.role}</strong>. Current stage
                is assigned to <strong>{c.currentOwnerRole}</strong> ({c.currentOwnerName}). Action controls
                are strictly restricted to the owner.
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-400">RBAC Enforced</span>
          </div>
        )}
      </div>

      {/* Dossier Tabs: Overview, Valuation, Exposure 360, Decision & LOS, Audit Trail */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        <div className="flex items-center border-b border-[#e2e8f0] px-4 bg-[#f8fafc] overflow-x-auto text-xs font-bold text-[#627d98]">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-[#19638c] text-[#19638c]'
                : 'border-transparent hover:text-[#102a43]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Overview & Scope</span>
          </button>

          <button
            onClick={() => setActiveTab('VALUATION')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'VALUATION'
                ? 'border-[#19638c] text-[#19638c]'
                : 'border-transparent hover:text-[#102a43]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Valuation & Evidence ({c.siteVisitEvidence?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPOSURE')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'EXPOSURE'
                ? 'border-[#19638c] text-[#19638c]'
                : 'border-transparent hover:text-[#102a43]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Exposure 360 {c.exposureSnapshot ? '✓' : '(Pending)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'APPROVAL'
                ? 'border-[#19638c] text-[#19638c]'
                : 'border-transparent hover:text-[#102a43]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Decision & LOS Payload</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'border-[#19638c] text-[#19638c]'
                : 'border-transparent hover:text-[#102a43]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Real-Time Audit Timeline ({c.auditTrail.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 text-xs text-[#102a43]">
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
                          <span>{towerUnits.length} Demo Units mapped</span>
                          <span className="font-mono">SIMULATED_POC_UNIT = true</span>
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
            <div className="space-y-6">
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
                <div className="py-12 text-center text-[#829ab1]">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">Valuation Report not yet submitted.</p>
                  <p className="text-[11px]">
                    Once the assigned valuer completes site inspection and clicks Submit, the full technical
                    report and geotagged annexures will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPOSURE 360 */}
          {activeTab === 'EXPOSURE' && (
            <div className="space-y-6">
              {c.exposureSnapshot ? (
                <div className="space-y-6">
                  {/* Summary Bar */}
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#cbd5e1] grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#829ab1] uppercase">Aggregate Group Exposure</span>
                      <div className="text-xl font-black text-[#102a43]">
                        ₹{c.exposureSnapshot.aggregateGroupExposureCr} Cr
                      </div>
                      <span className="text-[10px] text-[#627d98]">of ₹{c.exposureSnapshot.groupSanctionLimitCr} Cr Cap</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#829ab1] uppercase">Group Headroom</span>
                      <div className="text-xl font-black text-[#137333]">
                        ₹{c.exposureSnapshot.groupHeadroomCr.toFixed(1)} Cr
                      </div>
                      <span className="text-[10px] text-emerald-700">Available headroom</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#829ab1] uppercase">Existing Project APF</span>
                      <div className="text-xl font-black text-[#19638c]">
                        ₹{c.exposureSnapshot.existingApfExposureCr} Cr
                      </div>
                      <span className="text-[10px] text-[#627d98]">112 Live Mortgages</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#829ab1] uppercase">Proposed Retail APF</span>
                      <div className="text-xl font-black text-[#0c3148]">
                        ₹{c.exposureSnapshot.retailLinkedExposureCr} Cr
                      </div>
                      <span className="text-[10px] text-[#627d98]">Underwriting Scope</span>
                    </div>
                  </div>

                  {/* Exposure Buckets Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        Multi-Source Reconciled Exposure Ledger
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        ALL ENTRIES TAGGED SIMULATED POC DATA
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#cbd5e1] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase">
                          <tr>
                            <th className="p-3">Exposure Bucket</th>
                            <th className="p-3">Sanctioned</th>
                            <th className="p-3">Outstanding</th>
                            <th className="p-3">Source Channel</th>
                            <th className="p-3">As-Of Date</th>
                            <th className="p-3">Verification</th>
                            <th className="p-3">Facility Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {c.exposureSnapshot.buckets.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-[#102a43]">{b.category}</td>
                              <td className="p-3 font-mono font-semibold">₹{b.sanctionedCr.toFixed(1)} Cr</td>
                              <td className="p-3 font-mono font-bold text-[#19638c]">₹{b.outstandingCr.toFixed(1)} Cr</td>
                              <td className="p-3 text-[11px] text-[#627d98]">{b.source}</td>
                              <td className="p-3 font-mono text-[10px] text-[#829ab1]">{b.asOfDate}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                                  Reconciled
                                </span>
                              </td>
                              <td className="p-3 text-[11px] text-[#334e68]">{b.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#829ab1]">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">Exposure 360 will be generated automatically upon Valuer submission.</p>
                  <p className="text-[11px]">
                    Per the functional spec, multi-source exposure is reconciled when the independent report is logged.
                  </p>
                </div>
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
    </div>
  );
};
