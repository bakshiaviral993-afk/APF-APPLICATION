import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { REAL_10_PROJECTS, RealProjectSeed } from '../../data/realProjects';

export type TransactionStep =
  | 'DRAFT'
  | 'INITIATED'
  | 'VALUER_ASSIGNMENT_PENDING'
  | 'ASSIGNED_TO_VALUER'
  | 'VALUER_ACCEPTED'
  | 'SITE_VISIT_IN_PROGRESS'
  | 'SITE_VISIT_COMPLETED'
  | 'VALUATION_REPORT_DRAFT'
  | 'VALUATION_SUBMITTED'
  | 'CPA_REVIEW'
  | 'COM_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'LOS_SEND_PENDING'
  | 'SENT_TO_LOS'
  | 'LOS_ACKNOWLEDGED';

export type ActiveRole = 'CPA' | 'Valuer' | 'COM' | 'Approver' | 'System';

interface StepMeta {
  key: TransactionStep;
  seq: number;
  label: string;
  role: ActiveRole;
  description: string;
}

const STEP_DEFINITIONS: StepMeta[] = [
  { key: 'DRAFT', seq: 1, label: 'Draft', role: 'CPA', description: 'Master search, duplicate & caution checks' },
  { key: 'INITIATED', seq: 2, label: 'Initiated', role: 'CPA', description: 'Scope, documents & valuation route' },
  { key: 'VALUER_ASSIGNMENT_PENDING', seq: 3, label: 'Assign Valuer', role: 'CPA', description: 'Route, vendor, SLA & conflict check' },
  { key: 'ASSIGNED_TO_VALUER', seq: 4, label: 'Assigned', role: 'Valuer', description: 'Notification, scope & acceptance' },
  { key: 'VALUER_ACCEPTED', seq: 5, label: 'Accepted', role: 'Valuer', description: 'Site window locked & GPS tracking on' },
  { key: 'SITE_VISIT_IN_PROGRESS', seq: 6, label: 'Site Visit', role: 'Valuer', description: 'Mobile geotagged tower inspection' },
  { key: 'SITE_VISIT_COMPLETED', seq: 7, label: 'Inspection Done', role: 'Valuer', description: 'Civil, labour & quality scores verified' },
  { key: 'VALUATION_REPORT_DRAFT', seq: 8, label: 'Report Draft', role: 'Valuer', description: 'Comparables, adjustments & rate matrix' },
  { key: 'VALUATION_SUBMITTED', seq: 9, label: 'Report Submitted', role: 'CPA', description: 'SHA-256 hash locked & Exposure 360 refreshed' },
  { key: 'CPA_REVIEW', seq: 10, label: 'CPA Review', role: 'CPA', description: 'Review report, evidence & prep decision pack' },
  { key: 'COM_REVIEW', seq: 11, label: 'COM Review', role: 'COM', description: 'Supervisory review, exception check & endorsement' },
  { key: 'PENDING_APPROVAL', seq: 12, label: 'Committee', role: 'Approver', description: 'Comprehensive decision pack review & voting' },
  { key: 'APPROVED', seq: 13, label: 'Approved', role: 'CPA', description: 'Conditions registered & LOS handoff unlocked' },
  { key: 'LOS_SEND_PENDING', seq: 14, label: 'LOS Ready', role: 'CPA', description: 'Payload validation, checksum & confirmation' },
  { key: 'SENT_TO_LOS', seq: 15, label: 'Sent to LOS', role: 'System', description: 'API transmission with idempotency token' },
  { key: 'LOS_ACKNOWLEDGED', seq: 16, label: 'APF Active', role: 'System', description: 'LOS ACK received & project live for sourcing' },
];

export const ScreenTransactionFlow: React.FC = () => {
  const { addAuditLog } = useAPF();

  // Selected project seed (Default: Scripted Case PUN-01 Kolte-Patil Life Republic i Towers)
  const [selectedProjectSeed, setSelectedProjectSeed] = useState<RealProjectSeed>(REAL_10_PROJECTS[0]);

  // Current Transaction Step
  const [currentStep, setCurrentStep] = useState<TransactionStep>('VALUATION_SUBMITTED');

  // Role Simulator (Current Active User)
  const [simulatedRole, setSimulatedRole] = useState<ActiveRole>('CPA');

  // Master Search / Pre-Check State
  const [preCheckRun, setPreCheckRun] = useState<boolean>(true);

  // Valuer Assignment Form State
  const [valuerType, setValuerType] = useState<'Internal' | 'External' | 'Dual'>('External');
  const [assignedValuerName, setAssignedValuerName] = useState('Knight Frank Valuation Services LLP');
  const [conflictDeclared, setConflictDeclared] = useState(true);
  const [visitWindow, setVisitWindow] = useState('19-Sep-2026 to 22-Sep-2026');
  const [siteRepName, setSiteRepName] = useState('Mr. Sanjay Deshmukh (Project Head) | +91 98220 11234');

  // Valuer Site Visit State
  const [activeTowerTab, setActiveTowerTab] = useState<string>('Building E');
  const [workmanshipScore, setWorkmanshipScore] = useState<number>(4.5);
  const [safetyScore, setSafetyScore] = useState<number>(4.2);
  const [infraScore, setInfraScore] = useState<number>(4.6);
  const [adoptedBaseRate, setAdoptedBaseRate] = useState<number>(selectedProjectSeed.baseRateSqFt);
  const [valuerDecision, setValuerDecision] = useState<'Acceptable' | 'Conditional' | 'Reject'>('Acceptable');
  const [reportVersion, setReportVersion] = useState<string>('v1.0');
  const [reportHash, setReportHash] = useState<string>('sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  // Rework Modal State
  const [isReworkModalOpen, setIsReworkModalOpen] = useState<boolean>(false);
  const [reworkReason, setReworkReason] = useState<string>('');
  const [reworkInitiator, setReworkInitiator] = useState<'CPA' | 'COM'>('CPA');

  // Committee Decision State
  const [committeeVote, setCommitteeVote] = useState<'APPROVED' | 'CONDITIONAL' | 'DEFERRED' | 'REJECTED'>('CONDITIONAL');
  const [committeeNotes, setCommitteeNotes] = useState(
    'Approved with conditions: 1) Obtain prior lender NOC for pari-passu escrow charge on Building E & G. 2) Quarterly Lender Engineer inspection prior to tranche disbursements.'
  );

  // LOS Transmission State
  const [losAckId, setLosAckId] = useState<string | null>('LOS-APF-88231');
  const [losIsTransmitting, setLosIsTransmitting] = useState<boolean>(false);
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);

  const currentStepObj = STEP_DEFINITIONS.find((s) => s.key === currentStep)!;
  const currentStepIndex = STEP_DEFINITIONS.findIndex((s) => s.key === currentStep);

  // Security Rule: Workflow action is enabled ONLY for the role who owns that activity
  const isActionOwner = simulatedRole === currentStepObj.role;

  const handleNextStep = () => {
    if (currentStepIndex < STEP_DEFINITIONS.length - 1) {
      const nextStep = STEP_DEFINITIONS[currentStepIndex + 1];
      setCurrentStep(nextStep.key);
      setSimulatedRole(nextStep.role);
      addAuditLog('TRANSACTION_STEP_ADVANCE', `Case ${selectedProjectSeed.caseSeedId}`, `Moved to ${nextStep.label} by ${nextStep.role}`);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = STEP_DEFINITIONS[currentStepIndex - 1];
      setCurrentStep(prevStep.key);
      setSimulatedRole(prevStep.role);
    }
  };

  const handleSendToLos = () => {
    setLosIsTransmitting(true);
    setTimeout(() => {
      setLosIsTransmitting(false);
      setLosAckId('LOS-APF-88231');
      setCurrentStep('LOS_ACKNOWLEDGED');
      addAuditLog('LOS_HANDOFF_SUCCESS', selectedProjectSeed.project, 'LOS payload acknowledged with LOS_APF_ID = LOS-APF-88231. APF marked ACTIVE.');
    }, 1300);
  };

  const handleTriggerRework = () => {
    if (!reworkReason) return;
    setReportVersion('v1.1 (Reworked)');
    setReportHash(`sha256-mod-${Math.random().toString(36).substring(2, 10)}98fc1c`);
    setCurrentStep('VALUATION_REPORT_DRAFT');
    setSimulatedRole('Valuer');
    setIsReworkModalOpen(false);
    addAuditLog('VALUATION_REWORK_REQUESTED', selectedProjectSeed.project, `${reworkInitiator} requested rework: ${reworkReason}`);
  };

  // LOS JSON Payload matching specification
  const losPayload = {
    apfCaseId: `APF-${selectedProjectSeed.caseSeedId}-2026-0091`,
    apfNumber: `APF/${selectedProjectSeed.city.toUpperCase()}/${selectedProjectSeed.caseSeedId}/2026/0189`,
    builderId: `BLD-${selectedProjectSeed.developer.replace(/[^A-Z]/gi, '').slice(0, 8).toUpperCase()}`,
    builderLegalName: selectedProjectSeed.developer,
    builderGroupId: selectedProjectSeed.developerGroup,
    projectId: `PRJ-${selectedProjectSeed.caseSeedId}-01`,
    projectName: selectedProjectSeed.project,
    reraNumbers: selectedProjectSeed.reraNumbers,
    approvedPhases: ['Phase 1 (i Towers)'],
    approvedTowers: selectedProjectSeed.towers,
    approvalStatus: committeeVote === 'APPROVED' ? 'APPROVED' : 'CONDITIONAL',
    approvalDate: '2026-09-18',
    expiryDate: '2027-09-17',
    technicalGrade: 'A+',
    approvedValuationRate: adoptedBaseRate,
    rateMatrix: {
      '2BHK': adoptedBaseRate,
      '3BHK': Math.round(adoptedBaseRate * 1.027),
      floorRisePerFloorAbove5: 50,
      amenityViewPremiumPerSqFt: 150,
      carParkingSlotPrice: 400000,
    },
    marketValueCr: Math.round(((selectedProjectSeed.totalUnits * 950 * adoptedBaseRate) / 10000000) * 10) / 10,
    realizableValueCr: Math.round(((selectedProjectSeed.totalUnits * 950 * adoptedBaseRate) / 10000000) * 0.9 * 10) / 10,
    distressValueCr: Math.round(((selectedProjectSeed.totalUnits * 950 * adoptedBaseRate) / 10000000) * 0.75 * 10) / 10,
    riskBand: 'LOW_MEDIUM',
    conditions: [
      {
        id: 'COND-01',
        type: 'PRE_DISBURSEMENT',
        condition: 'Obtain prior lender NOC for pari-passu escrow charge on Building E & G.',
        owner: 'Legal Operations',
        status: 'OPEN',
      },
      {
        id: 'COND-02',
        type: 'STAGE_LINKED',
        condition: 'Quarterly Lender Engineer inspection prior to tranche disbursements.',
        owner: 'Technical Cell',
        status: 'MONITORED',
      },
    ],
    exposureSnapshotId: `EXP-SNP-${selectedProjectSeed.caseSeedId}-20260918-0930`,
    documentRefs: [
      'DMS-RERA-CERT-P52100022154.pdf',
      'DMS-SANCTION-PLAN-LAYOUT-REV4.pdf',
      'DMS-VALUATION-REPORT-FINAL-SIGNED.pdf',
      'DMS-COMMITTEE-MINUTES-ZCC-09.pdf',
    ],
    reportHash: reportHash,
    payloadVersion: '1.0.0',
    sourceSystem: 'PROVAL_APF',
    idempotencyKey: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    sentBy: 'cpa.pune@proval.bank',
    sendTimestamp: new Date().toISOString(),
    losAcknowledgementId: currentStep === 'LOS_ACKNOWLEDGED' ? 'LOS-APF-88231' : null,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Scripted Demo Case Indicator */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0c3148] text-white text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wide">
              END-TO-END APF TRANSACTION
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">
              Scripted Demo Case: Kolte-Patil Life Republic
            </span>
            <span className="text-xs font-mono text-[#627d98]">Case ID: APF-PUN-01-2026-0091</span>
          </div>
          <h1 className="text-2xl font-bold text-[#102a43] mt-1.5 tracking-tight">
            {selectedProjectSeed.project}
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            <strong>{selectedProjectSeed.developer}</strong> • {selectedProjectSeed.locality}, {selectedProjectSeed.city} •
            MahaRERA: <span className="font-mono text-[#19638c] font-semibold">{selectedProjectSeed.reraNumbers.join(', ')}</span> • Towers: <span className="text-[#102a43] font-semibold">{selectedProjectSeed.towers.join(' & ')}</span>
          </p>
        </div>

        {/* Real Project Seed Selector & Role Simulator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#627d98] uppercase tracking-wider">
              Project Seed (10 Real Projects):
            </label>
            <select
              value={selectedProjectSeed.caseSeedId}
              onChange={(e) => {
                const found = REAL_10_PROJECTS.find((p) => p.caseSeedId === e.target.value);
                if (found) {
                  setSelectedProjectSeed(found);
                  setAdoptedBaseRate(found.baseRateSqFt);
                  addAuditLog('SWITCH_PROJECT_SEED', found.project, `Loaded ${found.caseSeedId} from real seed registry.`);
                }
              }}
              className="mt-0.5 text-xs font-semibold bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 py-2 text-[#102a43] focus:outline-none focus:ring-1 focus:ring-[#19638c]"
            >
              <optgroup label="Pune Real Projects (5)">
                {REAL_10_PROJECTS.filter((p) => p.city === 'Pune').map((p) => (
                  <option key={p.caseSeedId} value={p.caseSeedId}>
                    {p.caseSeedId}: {p.developer} - {p.project}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Mumbai Real Projects (5)">
                {REAL_10_PROJECTS.filter((p) => p.city === 'Mumbai').map((p) => (
                  <option key={p.caseSeedId} value={p.caseSeedId}>
                    {p.caseSeedId}: {p.developer} - {p.project}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#627d98] uppercase tracking-wider">
              Simulator Active Persona:
            </label>
            <div className="mt-0.5 flex bg-[#f1f5f9] p-1 rounded-lg border border-[#cbd5e1]">
              {(['CPA', 'Valuer', 'COM', 'Approver', 'System'] as ActiveRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setSimulatedRole(r)}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                    simulatedRole === r
                      ? 'bg-[#0c3148] text-white shadow-xs'
                      : 'text-[#627d98] hover:text-[#102a43]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Role Entitlement Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg text-xs text-[#0369a1]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
          <span>
            <strong>Bank Security Policy:</strong> Case is visible to all entitled users. Active stage:{' '}
            <span className="font-bold uppercase underline">{currentStepObj.label}</span> (Assigned Action Owner:{' '}
            <span className="font-bold text-[#0c3148]">{currentStepObj.role}</span>).
          </span>
        </div>
        {!isActionOwner ? (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            <span>Viewing as <strong>{simulatedRole}</strong> (Read-Only)</span>
            <button
              onClick={() => setSimulatedRole(currentStepObj.role)}
              className="bg-[#0c3148] hover:bg-[#19638c] text-white text-[11px] px-2 py-0.5 rounded font-medium"
            >
              Switch to {currentStepObj.role}
            </button>
          </div>
        ) : (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            ✓ Logged in as authorized action owner ({currentStepObj.role})
          </span>
        )}
      </div>

      {/* 16-Step Horizontal Progress Stepper */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[1020px] text-xs">
          {STEP_DEFINITIONS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                onClick={() => {
                  setCurrentStep(step.key);
                  setSimulatedRole(step.role);
                }}
                className={`flex flex-col items-center cursor-pointer group px-1.5 py-1 rounded transition-all ${
                  isCurrent ? 'bg-[#f0fdf4] font-bold text-[#15803d]' : 'text-[#627d98] hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                    isCompleted
                      ? 'bg-[#15803d] text-white'
                      : isCurrent
                      ? 'bg-[#0c3148] text-white ring-4 ring-[#bae6fd]'
                      : 'bg-[#e2e8f0] text-[#64748b]'
                  }`}
                >
                  {isCompleted ? '✓' : step.seq}
                </div>
                <span className="text-[11px] whitespace-nowrap text-center">{step.label}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8] font-mono">
                  {step.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-6">
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#19638c] uppercase tracking-wider">
                Step {currentStepObj.seq} of 16
              </span>
              <span className="text-xs font-mono text-[#94a3b8]">|</span>
              <span className="text-xs font-semibold text-[#627d98]">Action Owner: {currentStepObj.role}</span>
              <span className="text-xs font-mono text-[#94a3b8]">|</span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Report {reportVersion}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#102a43] mt-0.5">{currentStepObj.label}</h2>
            <p className="text-xs text-[#627d98] mt-0.5">{currentStepObj.description}</p>
          </div>

          {/* Quick Step Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-1.5 text-xs font-medium text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg disabled:opacity-40"
            >
              ← Previous Step
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === STEP_DEFINITIONS.length - 1}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#0c3148] hover:bg-[#19638c] rounded-lg disabled:opacity-40"
            >
              Next Step →
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 1: CPA INITIATION & PRE-CHECKS (Seq 1 & 2) */}
        {/* ============================================================ */}
        {(currentStep === 'DRAFT' || currentStep === 'INITIATED') && (
          <div className="space-y-6">
            {/* Automated Master Search & Caution Pre-Checks */}
            <div className="border border-[#cbd5e1] rounded-xl p-4 bg-[#f8fafc] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider flex items-center gap-2">
                  <span>Automated Master Search &amp; Caution List Checks</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </h3>
                <span className="text-[11px] text-[#627d98] font-mono">Hierarchy: Builder → Group → Project → Phase → Tower</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627d98] font-medium">Duplicate APF Check</span>
                    <span className="text-emerald-700 font-bold">PASS ✓</span>
                  </div>
                  <p className="text-[11px] text-[#102a43] font-semibold mt-1">No active APF on Buildings E &amp; G</p>
                  <p className="text-[10px] text-[#94a3b8]">Unique case identifier assigned</p>
                </div>

                <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627d98] font-medium">Duplicate Builder Check</span>
                    <span className="text-emerald-700 font-bold">MATCHED ✓</span>
                  </div>
                  <p className="text-[11px] text-[#102a43] font-semibold mt-1">CIN: {selectedProjectSeed.cinPan.split(' / ')[0]}</p>
                  <p className="text-[10px] text-[#94a3b8]">Matched with central builder master</p>
                </div>

                <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627d98] font-medium">RBI / IBA Caution List</span>
                    <span className="text-emerald-700 font-bold">CLEAR ✓</span>
                  </div>
                  <p className="text-[11px] text-[#102a43] font-semibold mt-1">Zero wilful defaulter tags</p>
                  <p className="text-[10px] text-[#94a3b8]">Screened across 3 key directors</p>
                </div>

                <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627d98] font-medium">Existing Project Check</span>
                    <span className="text-emerald-700 font-bold">CONFIRMED ✓</span>
                  </div>
                  <p className="text-[11px] text-[#102a43] font-semibold mt-1">MahaRERA: {selectedProjectSeed.reraNumbers[0]}</p>
                  <p className="text-[10px] text-[#94a3b8]">Active RERA certificate verified</p>
                </div>
              </div>
            </div>

            {/* Scope Selection Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <label className="text-xs font-semibold text-[#627d98]">Request Type</label>
                <select className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43] font-medium">
                  <option>New APF (Fresh Approval)</option>
                  <option>Annual Renewal</option>
                  <option>Scope Expansion (New Towers)</option>
                  <option>Revalidation</option>
                </select>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <label className="text-xs font-semibold text-[#627d98]">Branch / Asset Centre</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedProjectSeed.city} Zonal Office - Hinjawadi Branch`}
                  className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43] font-medium"
                />
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <label className="text-xs font-semibold text-[#627d98]">Requested APF Effective Date</label>
                <input
                  type="date"
                  defaultValue="2026-09-18"
                  className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43] font-medium"
                />
              </div>
            </div>

            {/* Builder & Project Specifics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Builder Entity &amp; Governance
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Developer Legal Name:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.developer}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Group Name:</span>
                    <span className="font-semibold text-[#102a43]">{selectedProjectSeed.developerGroup}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">CIN / PAN:</span>
                    <span className="font-mono text-[#102a43]">{selectedProjectSeed.cinPan}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Key Directors / DIN:</span>
                    <span className="text-right text-[#102a43]">{selectedProjectSeed.directors.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Project Scope &amp; Towers Requested
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Project Name:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.project}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">MahaRERA Registration:</span>
                    <span className="font-mono text-[#19638c] font-bold">
                      {selectedProjectSeed.reraNumbers.join(' | ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Requested Towers:</span>
                    <span className="font-bold text-[#19638c]">{selectedProjectSeed.towers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Total Units / Stage:</span>
                    <span className="text-[#102a43]">
                      {selectedProjectSeed.totalUnits} units • {selectedProjectSeed.constructionStage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Initiation Documents */}
            <div className="border border-[#e2e8f0] p-4 rounded-lg">
              <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider mb-3">
                Mandatory Initiation Documents Attached (DMS Staged)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { name: 'MahaRERA Registration Certificate', size: '2.4 MB', date: '12-Sep-2026' },
                  { name: 'Sanctioned Layout & Tower Plans', size: '14.8 MB', date: '08-Sep-2026' },
                  { name: 'Commencement Certificate (CC)', size: '1.8 MB', date: '05-Sep-2026' },
                  { name: 'Title Search Report (30 Years Clear)', size: '6.2 MB', date: '14-Sep-2026' },
                  { name: 'CA Certified Project Cost & Funding', size: '3.1 MB', date: '01-Sep-2026' },
                  { name: 'Designated Escrow Account Agreement', size: '4.5 MB', date: '10-Sep-2026' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-2 p-2.5 bg-[#f8fafc] rounded border border-[#e2e8f0]">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-[#102a43] truncate">{doc.name}</p>
                      <p className="text-[10px] text-[#627d98]">{doc.size} • Uploaded {doc.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={!isActionOwner}
                onClick={() => {
                  setCurrentStep('VALUER_ASSIGNMENT_PENDING');
                  setSimulatedRole('CPA');
                  addAuditLog('SUBMIT_INITIATION', selectedProjectSeed.project, 'CPA submitted initiation pack with pre-checks clear.');
                }}
                className="bg-[#0c3148] hover:bg-[#19638c] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
              >
                Submit Initiation &amp; Proceed to Valuer Assignment →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 2: VALUER ASSIGNMENT (Seq 3 & 4) */}
        {/* ============================================================ */}
        {(currentStep === 'VALUER_ASSIGNMENT_PENDING' || currentStep === 'ASSIGNED_TO_VALUER') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignment Form */}
              <div className="space-y-4 border border-[#e2e8f0] p-5 rounded-lg">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Valuer Selection &amp; Route
                </h3>

                <div>
                  <label className="text-xs font-semibold text-[#627d98]">Valuation Route</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['Internal', 'External', 'Dual'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setValuerType(type)}
                        className={`py-2 text-xs font-semibold rounded border ${
                          valuerType === type
                            ? 'bg-[#0c3148] text-white border-[#0c3148]'
                            : 'bg-white text-[#627d98] border-[#cbd5e1] hover:bg-slate-50'
                        }`}
                      >
                        {type} Valuer
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#627d98]">Empanelled Valuer / Agency</label>
                  <select
                    value={assignedValuerName}
                    onChange={(e) => setAssignedValuerName(e.target.value)}
                    className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43] font-medium"
                  >
                    <option>Knight Frank Valuation Services LLP (Empanelled A+ • Valid till 31-Dec-2027)</option>
                    <option>CBRE South Asia Pvt. Ltd. (Empanelled A+ • Valid till 30-Nov-2027)</option>
                    <option>Apex Chartered Surveyors &amp; Valuers (Empanelled A • Valid till 30-Jun-2027)</option>
                    <option>Bank In-House Technical Valuer (Pune Zone)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#627d98]">Site Visit Window</label>
                    <input
                      type="text"
                      value={visitWindow}
                      onChange={(e) => setVisitWindow(e.target.value)}
                      className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#627d98]">SLA Due Date</label>
                    <input
                      type="text"
                      readOnly
                      value="23-Sep-2026 (72 Hrs Policy SLA)"
                      className="w-full mt-1 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded p-2 text-[#102a43] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#627d98]">Site Contact / Representative</label>
                  <input
                    type="text"
                    value={siteRepName}
                    onChange={(e) => setSiteRepName(e.target.value)}
                    className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43]"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conflictDeclared}
                      onChange={(e) => setConflictDeclared(e.target.checked)}
                      className="w-4 h-4 text-[#19638c] rounded"
                    />
                    <span className="text-xs text-[#334155] font-medium">
                      Mandatory declaration: Valuer confirms no conflict of interest with builder, SPV, or contractors.
                    </span>
                  </label>
                </div>
              </div>

              {/* Assignment Scope Summary */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Assigned Inspection Scope
                </h3>
                <div className="text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Project &amp; Location:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.project} ({selectedProjectSeed.locality})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Scope Towers:</span>
                    <span className="font-bold text-[#19638c]">{selectedProjectSeed.towers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Geofence Centroid:</span>
                    <span className="font-mono text-[#102a43]">
                      {selectedProjectSeed.latLong.lat}° N, {selectedProjectSeed.latLong.lng}° E (Radius: 250m)
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Total Units in Scope:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.totalUnits} Units</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                  <strong>Special Bank Instructions:</strong>
                  <ul className="list-disc ml-4 mt-1 space-y-0.5">
                    <li>Verify RCC staging and top slab completion on both towers.</li>
                    <li>Inspect RERA public notice board at gate and take geotagged photo.</li>
                    <li>Cross-check actual civil status with latest quarterly RERA progress filing.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {currentStep === 'VALUER_ASSIGNMENT_PENDING' ? (
                <button
                  disabled={!isActionOwner}
                  onClick={() => {
                    setCurrentStep('ASSIGNED_TO_VALUER');
                    setSimulatedRole('Valuer');
                    addAuditLog('ASSIGN_VALUER', assignedValuerName, `Assigned for ${selectedProjectSeed.project}`);
                  }}
                  className="bg-[#0c3148] hover:bg-[#19638c] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  Confirm Valuer Assignment &amp; Send Notification →
                </button>
              ) : (
                <button
                  disabled={!isActionOwner}
                  onClick={() => {
                    setCurrentStep('SITE_VISIT_IN_PROGRESS');
                    setSimulatedRole('Valuer');
                    addAuditLog('VALUER_ACCEPT', assignedValuerName, 'Valuer accepted assignment and initialized mobile site visit session.');
                  }}
                  className="bg-[#15803d] hover:bg-[#166534] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  Valuer Accept Assignment &amp; Launch Mobile Site Inspection →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 3: VALUER MOBILE SITE VISIT & VALUATION (Seq 5-8) */}
        {/* ============================================================ */}
        {(currentStep === 'VALUER_ACCEPTED' ||
          currentStep === 'SITE_VISIT_IN_PROGRESS' ||
          currentStep === 'SITE_VISIT_COMPLETED' ||
          currentStep === 'VALUATION_REPORT_DRAFT') && (
          <div className="space-y-6">
            {/* Live GPS & Device Evidence Header */}
            <div className="bg-[#0c3148] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                      Live Geofenced Mobile Site Inspection Active
                    </h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      GEOFENCE MATCHED (0.04 km)
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    Lat/Long: {selectedProjectSeed.latLong.lat}° N, {selectedProjectSeed.latLong.lng}° E • Accuracy: 3.2m (Threshold: &lt;10m) • Time: 18-Sep-2026 10:14:22 IST
                  </p>
                </div>
              </div>
              <div className="text-xs text-right text-slate-300 font-mono">
                <div>Device: Samsung Knox SM-G998B (Session #KNX-9921)</div>
                <div>Authenticated Valuer: valuer.pune@proval.bank</div>
              </div>
            </div>

            {/* Tower Selection Tab */}
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
              <span className="text-xs font-semibold text-[#627d98]">Tower Inspection View:</span>
              {selectedProjectSeed.towers.map((tower) => (
                <button
                  key={tower}
                  onClick={() => setActiveTowerTab(tower)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    activeTowerTab === tower
                      ? 'bg-[#19638c] text-white'
                      : 'bg-[#f1f5f9] text-[#627d98] hover:text-[#102a43]'
                  }`}
                >
                  {tower}
                </button>
              ))}
            </div>

            {/* Tower Detailed Inspection Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Approvals & Land */}
              <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Site Approvals &amp; Boundary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">RERA Board Displayed:</span>
                    <span className="text-emerald-700 font-bold">YES (Photo Captured)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Sanction Plan on Site:</span>
                    <span className="text-emerald-700 font-bold">VERIFIED</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#627d98]">Approach Road Width:</span>
                    <span className="font-bold text-[#102a43]">24m Concrete Arterial</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Boundary Demarcation:</span>
                    <span className="text-emerald-700 font-bold">CLEAR &amp; FENCED</span>
                  </div>
                </div>
              </div>

              {/* Civil Progress by Tower */}
              <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Civil Progress ({activeTowerTab})
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">Floors Sanctioned / Done:</span>
                    <span className="font-bold text-[#102a43]">22 / 22 Floors Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">Physical Progress:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#19638c] h-full"
                      style={{ width: `${selectedProjectSeed.physicalProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">Labour Presence:</span>
                    <span className="text-emerald-700 font-bold">140 Workers on Site</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">Machinery / Equipment:</span>
                    <span className="font-medium text-[#102a43]">2 Hoists + Batching Plant</span>
                  </div>
                </div>
              </div>

              {/* Quality & Technical Rating */}
              <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  Quality &amp; Technical Rating
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#627d98]">Workmanship Quality:</span>
                    <span className="font-bold text-[#102a43]">{workmanshipScore} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#627d98]">Safety &amp; Housekeeping:</span>
                    <span className="font-bold text-[#102a43]">{safetyScore} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#627d98]">Infrastructure Readiness:</span>
                    <span className="font-bold text-[#102a43]">{infraScore} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#f1f5f9]">
                    <span className="text-[#627d98]">Assigned Technical Grade:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                      A+ (Prime Asset)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8 Mandatory Photographs (With Exact Geo-Tag Stamping) */}
            <div className="border border-[#e2e8f0] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                  8 Mandatory Geotagged Photographs (Tamper-Proof Metadata)
                </h3>
                <span className="text-[10px] text-[#627d98] font-mono">
                  Linked: Case ID + Tower + Lat/Long + Timestamp + Valuer ID
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
                {[
                  { tag: 'Project Entrance', time: '10:14', code: 'ENTRANCE' },
                  { tag: 'RERA Board', time: '10:18', code: 'RERA_BRD' },
                  { tag: 'Approach Road', time: '10:22', code: 'APPR_ROAD' },
                  { tag: 'Project Boundary', time: '10:27', code: 'BOUNDARY' },
                  { tag: 'Building E & G', time: '10:33', code: 'TOWERS' },
                  { tag: 'Slab / Close-up', time: '10:41', code: 'SLAB_CLOSE' },
                  { tag: 'Amenities / Club', time: '10:48', code: 'AMENITIES' },
                  { tag: 'Surrounding Dev', time: '10:55', code: 'SURROUND' },
                ].map((photo, i) => (
                  <div key={photo.tag} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="h-16 bg-slate-200 rounded flex flex-col items-center justify-center text-slate-400 font-mono text-[9px] relative overflow-hidden">
                      <span className="font-bold text-[#0c3148]">CAM_STAMP</span>
                      <span className="text-[8px] text-slate-500">18.618°N 73.714°E</span>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-semibold text-[#102a43] text-[10px] truncate">{photo.tag}</p>
                      <p className="text-[9px] text-emerald-700 font-mono font-bold mt-0.5">
                        ✓ Stamped ({photo.time})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Comparables Matrix & Adjustments */}
            <div className="border border-[#e2e8f0] p-4 rounded-lg space-y-3">
              <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                Market Comparables &amp; Adjustment Engine
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[#627d98] border-b border-[#cbd5e1]">
                      <th className="p-2 font-semibold">Comparable Project</th>
                      <th className="p-2 font-semibold">Distance</th>
                      <th className="p-2 font-semibold">Developer</th>
                      <th className="p-2 font-semibold">Stage</th>
                      <th className="p-2 font-semibold">Quoted Rate</th>
                      <th className="p-2 font-semibold">Evidence / Reg. Rate</th>
                      <th className="p-2 font-semibold">Adjustment Factor</th>
                      <th className="p-2 font-semibold">Derived Benchmark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#102a43]">
                    <tr>
                      <td className="p-2 font-bold">Megapolis Saffron</td>
                      <td className="p-2">0.8 km</td>
                      <td className="p-2">Pegasus Properties</td>
                      <td className="p-2">Ready / Near Poss.</td>
                      <td className="p-2">₹7,500 / sq.ft</td>
                      <td className="p-2 font-semibold">₹7,250 / sq.ft</td>
                      <td className="p-2 text-emerald-700">+2.7% (Brand)</td>
                      <td className="p-2 font-bold">₹7,445 / sq.ft</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold">Godrej 24</td>
                      <td className="p-2">1.4 km</td>
                      <td className="p-2">Godrej Properties</td>
                      <td className="p-2">Under Construction</td>
                      <td className="p-2">₹8,100 / sq.ft</td>
                      <td className="p-2 font-semibold">₹7,750 / sq.ft</td>
                      <td className="p-2 text-rose-700">-3.8% (Stage)</td>
                      <td className="p-2 font-bold">₹7,455 / sq.ft</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold">Kasturi Apostrophe</td>
                      <td className="p-2">2.1 km</td>
                      <td className="p-2">Kasturi Housing</td>
                      <td className="p-2">Finishing Phase</td>
                      <td className="p-2">₹8,400 / sq.ft</td>
                      <td className="p-2 font-semibold">₹8,050 / sq.ft</td>
                      <td className="p-2 text-rose-700">-7.4% (Luxury Spec)</td>
                      <td className="p-2 font-bold">₹7,454 / sq.ft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Valuation Workings & Output */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-lg space-y-4">
              <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                Valuation Report Outputs &amp; Recommended Rates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-[#627d98] font-semibold">Adopted Base Rate (₹/sq.ft)</label>
                  <input
                    type="number"
                    value={adoptedBaseRate}
                    onChange={(e) => setAdoptedBaseRate(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43]"
                  />
                  <span className="text-[10px] text-[#627d98]">Market Quoted: ₹{selectedProjectSeed.marketRateSqFt}</span>
                </div>

                <div>
                  <label className="text-[#627d98] font-semibold">Market Value (MV)</label>
                  <p className="mt-1 font-bold text-sm text-[#102a43]">
                    ₹{((selectedProjectSeed.totalUnits * 950 * adoptedBaseRate) / 10000000).toFixed(1)} Cr
                  </p>
                  <span className="text-[10px] text-[#627d98]">Area: {selectedProjectSeed.totalUnits * 950} sq.ft</span>
                </div>

                <div>
                  <label className="text-[#627d98] font-semibold">Realizable Value (RV 90%)</label>
                  <p className="mt-1 font-bold text-sm text-[#102a43]">
                    ₹{(((selectedProjectSeed.totalUnits * 950 * adoptedBaseRate) / 10000000) * 0.9).toFixed(1)} Cr
                  </p>
                  <span className="text-[10px] text-[#627d98]">Bank Standard Policy (90%)</span>
                </div>

                <div>
                  <label className="text-[#627d98] font-semibold">Valuer Recommendation</label>
                  <select
                    value={valuerDecision}
                    onChange={(e) => setValuerDecision(e.target.value as any)}
                    className="w-full mt-1 font-bold text-xs bg-white border border-[#cbd5e1] rounded p-2 text-[#102a43]"
                  >
                    <option value="Acceptable">Acceptable for APF</option>
                    <option value="Conditional">Conditional Approval</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#627d98] border-t border-[#e2e8f0] gap-2">
                <div>
                  Report SHA-256 Checksum: <code className="font-mono text-[10px] text-[#0c3148]">{reportHash}</code>
                </div>
                <div>Digitally Signed: Knight Frank Certified Valuer (Reg. IBBI/RV/02/2019/1102)</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={!isActionOwner}
                onClick={() => {
                  setCurrentStep('VALUATION_SUBMITTED');
                  setSimulatedRole('CPA');
                  addAuditLog('VALUATION_SUBMITTED', selectedProjectSeed.project, `Valuer submitted report at ₹${adoptedBaseRate}/sq.ft. Triggered automated Exposure 360 refresh.`);
                }}
                className="bg-[#15803d] hover:bg-[#166534] text-white px-7 py-3 rounded-lg text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                Submit Report from Site (Lock Report &amp; Refresh Exposure 360) →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 4: EXPOSURE REFRESH & CPA / COM REVIEW (Seq 9-11) */}
        {/* ============================================================ */}
        {(currentStep === 'VALUATION_SUBMITTED' || currentStep === 'CPA_REVIEW' || currentStep === 'COM_REVIEW') && (
          <div className="space-y-6">
            {/* Automatic Refresh Indicator */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                <div>
                  <h4 className="font-bold text-sm">Automated Exposure 360 Refresh Triggered</h4>
                  <p className="text-emerald-700">
                    Valuation report submitted. Direct builder debt, project finance, retail linked exposure and group concentration updated with live source provenance.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-700 text-white font-mono font-bold rounded-full self-start sm:self-auto text-[11px]">
                SYNC TIMESTAMP: TODAY 10:58 IST
              </span>
            </div>

            {/* Builder Exposure 360 with Source Provenance Beside Every Figure */}
            <div className="border border-[#e2e8f0] p-5 rounded-xl bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider flex items-center gap-2">
                  <span>Builder Exposure 360 &amp; Source Provenance</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-semibold">
                    [SIMULATED - DEMO DATA]
                  </span>
                </h3>
                <span className="text-[11px] text-[#627d98]">Real Entity Identity: {selectedProjectSeed.developer}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. Direct Builder Exposure */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Direct Builder Exposure</span>
                    <span className="text-base font-bold text-[#102a43]">₹{selectedProjectSeed.existingExposureCr} Cr</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Sanctioned:</span>
                      <span className="font-semibold text-[#102a43]">₹390.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Utilized:</span>
                      <span className="font-semibold text-[#102a43]">₹320.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Undrawn Limits:</span>
                      <span className="font-semibold text-[#102a43]">₹70.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Non-Fund Facilities (BG/LC):</span>
                      <span className="font-semibold text-[#102a43]">₹45.0 Cr</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">Internal CBS — 17 Sep 2026</span>
                  </div>
                </div>

                {/* 2. Project Finance Exposure */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Project Finance Debt</span>
                    <span className="text-base font-bold text-[#102a43]">₹92.0 Cr</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Mapped SPV / Project:</span>
                      <span className="font-semibold text-[#102a43]">Life Republic SPV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facility Type:</span>
                      <span className="font-semibold text-[#102a43]">Construction Finance</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className="font-semibold text-[#102a43]">Escrow Charge on Phase 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proposed APF Limit:</span>
                      <span className="font-bold text-[#19638c]">₹{selectedProjectSeed.proposedExposureCr} Cr</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">MCA Charge — 07 Sep 2026</span>
                  </div>
                </div>

                {/* 3. Existing APF Exposure */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Existing Bank APFs</span>
                    <span className="text-base font-bold text-[#102a43]">₹240.0 Cr</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Active Approved Projects:</span>
                      <span className="font-semibold text-[#102a43]">4 Projects</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired APFs:</span>
                      <span className="font-semibold text-[#102a43]">1 Project (Renewed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suspended / Caution:</span>
                      <span className="font-semibold text-emerald-700">0 Projects</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disbursement Status:</span>
                      <span className="font-semibold text-[#102a43]">Normal Peformance</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">APF Master DB — 18 Sep 2026</span>
                  </div>
                </div>

                {/* 4. Retail Project Exposure */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Retail Project Loans</span>
                    <span className="text-base font-bold text-[#102a43]">₹214.0 Cr</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Total Retail Accounts Sourced:</span>
                      <span className="font-semibold text-[#102a43]">184 Borrowers</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Outstanding:</span>
                      <span className="font-semibold text-[#102a43]">₹168.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pipeline Sanctions:</span>
                      <span className="font-semibold text-[#102a43]">₹32.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delinquency (&gt;90 DPD):</span>
                      <span className="font-bold text-emerald-700">0.8% (Benchmark: &lt;2%)</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">LMS / Retail Tape — 15 Sep 2026</span>
                  </div>
                </div>

                {/* 5. Group Exposure */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Group Exposure</span>
                    <span className="text-base font-bold text-[#102a43]">₹505.0 Cr</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Internal Group Limit:</span>
                      <span className="font-semibold text-[#102a43]">₹{selectedProjectSeed.groupLimitCr}.0 Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pre-Approval Limit Utilisation:</span>
                      <span className="font-semibold text-[#102a43]">70.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post-Approval Group Utilisation:</span>
                      <span className="font-bold text-amber-700">84.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connected SPVs:</span>
                      <span className="font-semibold text-[#102a43]">6 Entities</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">CRILC / CIC — 31 Aug 2026</span>
                  </div>
                </div>

                {/* 6. Concentration & Geography */}
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#102a43]">Geography &amp; Segment</span>
                    <span className="text-base font-bold text-[#102a43]">{selectedProjectSeed.city} Zone</span>
                  </div>
                  <div className="space-y-1 text-[#627d98] text-[11px]">
                    <div className="flex justify-between">
                      <span>Zonal Concentration:</span>
                      <span className="font-semibold text-[#102a43]">82.0% of Pune Cap</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Developer Segment:</span>
                      <span className="font-semibold text-[#102a43]">Mid-Income Housing</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Borrower Declaration:</span>
                      <span className="font-semibold text-[#102a43]">₹465.0 Cr Declared</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reconciled Variance:</span>
                      <span className="font-semibold text-emerald-700">Reconciled / Matched</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                    <span className="text-[#627d98]">Source Provenance:</span>
                    <span className="font-semibold text-[#19638c]">Borrower Decl. — 10 Sep 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CPA & COM Review Dialogue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPA Action Card */}
              <div className="border border-[#e2e8f0] p-5 rounded-xl bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                    CPA Review &amp; Recommendation
                  </h4>
                  <span className="text-[11px] font-mono text-[#627d98]">Assigned: Aviral Bakshi</span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed">
                  Valuer site inspection complete. Rate adopted at ₹{adoptedBaseRate}/sq.ft is fully grounded in micro-market transaction evidence. Post-approval group exposure will stand at ₹505 Cr (84.2% of cap). Recommend conditional approval with prior lender NOC condition.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    disabled={!isActionOwner || currentStep !== 'VALUATION_SUBMITTED' && currentStep !== 'CPA_REVIEW'}
                    onClick={() => {
                      setCurrentStep('COM_REVIEW');
                      setSimulatedRole('COM');
                      addAuditLog('CPA_RECOMMEND', selectedProjectSeed.project, 'CPA accepted report and forwarded recommendation to COM.');
                    }}
                    className="bg-[#0c3148] hover:bg-[#19638c] text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Accept Report &amp; Forward to COM →
                  </button>
                  <button
                    disabled={!isActionOwner}
                    onClick={() => {
                      setReworkInitiator('CPA');
                      setIsReworkModalOpen(true);
                    }}
                    className="border border-rose-300 text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Send Back to Valuer (Rework)
                  </button>
                </div>
              </div>

              {/* COM Supervisory Review Card */}
              <div className="border border-[#e2e8f0] p-5 rounded-xl bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                    COM Supervisory Endorsement
                  </h4>
                  <span className="text-[11px] font-mono text-[#627d98]">Supervised: Credit Operations Manager</span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed">
                  Supervisory review confirmed. No material discrepancy in RERA area. Group exposure exceeds 80% guideline threshold; therefore, approval authority resides with the Zonal Credit Committee.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    disabled={!isActionOwner || currentStep !== 'COM_REVIEW'}
                    onClick={() => {
                      setCurrentStep('PENDING_APPROVAL');
                      setSimulatedRole('Approver');
                      addAuditLog('COM_ENDORSE', selectedProjectSeed.project, 'COM endorsed and escalated decision pack to Committee.');
                    }}
                    className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Endorse &amp; Create Committee Decision Pack →
                  </button>
                  <button
                    disabled={!isActionOwner || currentStep !== 'COM_REVIEW'}
                    onClick={() => {
                      setReworkInitiator('COM');
                      setIsReworkModalOpen(true);
                    }}
                    className="border border-amber-300 text-amber-800 hover:bg-amber-50 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Return for Rework
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 5: APPROVAL COMMITTEE DECISION PACK (Seq 12-13) */}
        {/* ============================================================ */}
        {(currentStep === 'PENDING_APPROVAL' || currentStep === 'APPROVED') && (
          <div className="space-y-6">
            {/* The Unified Decision Pack Cockpit */}
            <div className="border border-[#cbd5e1] p-5 rounded-xl bg-white shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2e8f0] gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#102a43] uppercase tracking-wider">
                    Zonal Credit Committee Decision Pack (Alpha Case)
                  </h3>
                  <p className="text-xs text-[#627d98]">
                    Single cockpit containing all material legal, technical, valuation, exposure and risk facts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#627d98]">Quorum: 3 of 3 Members Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* 6 Underwriting Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Builder Track', score: 82, grade: 'Tier 1' },
                  { label: 'Legal Opinion', score: 91, grade: 'Clear 30-Yr' },
                  { label: 'Technical Progress', score: 86, grade: 'Grade A+' },
                  { label: 'Valuation & Rate', score: 84, grade: '₹7,450/sq.ft' },
                  { label: 'Financial Health', score: 74, grade: 'Adequate' },
                  { label: 'Exposure & Limits', score: 72, grade: '84.2% Cap' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-center">
                    <span className="text-[11px] text-[#627d98] font-medium">{item.label}</span>
                    <p className="text-2xl font-bold text-[#102a43] my-1">{item.score}</p>
                    <span className="text-[10px] font-semibold text-[#19638c] bg-[#e0f2fe] px-2 py-0.5 rounded">
                      {item.grade}
                    </span>
                  </div>
                ))}
              </div>

              {/* Key Summary Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2 border border-[#e2e8f0] p-4 rounded-lg bg-slate-50/50">
                  <h4 className="font-bold text-[#0c3148] uppercase tracking-wider text-[11px]">
                    Transaction &amp; Scope Summary
                  </h4>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Project &amp; Developer:</span>
                    <span className="font-bold text-[#102a43]">{selectedProjectSeed.project} • {selectedProjectSeed.developer}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">RERA &amp; Location:</span>
                    <span className="font-mono text-[#19638c]">{selectedProjectSeed.reraNumbers[0]} ({selectedProjectSeed.locality})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Approved Towers:</span>
                    <span className="font-semibold text-[#102a43]">{selectedProjectSeed.towers.join(', ')} (480 Units)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Adopted Base Rate:</span>
                    <span className="font-bold text-[#102a43]">₹{adoptedBaseRate} / sq.ft</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Realizable Value (RV):</span>
                    <span className="font-bold text-[#102a43]">₹321.8 Cr (90% Policy RV)</span>
                  </div>
                </div>

                <div className="space-y-2 border border-[#e2e8f0] p-4 rounded-lg bg-slate-50/50">
                  <h4 className="font-bold text-[#0c3148] uppercase tracking-wider text-[11px]">
                    Exposure &amp; Governance Summary
                  </h4>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Proposed Project Sourcing:</span>
                    <span className="font-bold text-[#19638c]">₹{selectedProjectSeed.proposedExposureCr}.0 Cr Limit</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Retail Sourcing Cap:</span>
                    <span className="font-bold text-[#102a43]">₹{selectedProjectSeed.retailLimitCr}.0 Cr Pre-Approved</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Group Exposure Utilisation:</span>
                    <span className="font-bold text-amber-700">₹505 Cr / ₹600 Cr Limit (84.2%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">CPA Recommendation:</span>
                    <span className="font-medium text-emerald-700">Recommended by Aviral Bakshi</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">COM Supervisory Action:</span>
                    <span className="font-medium text-emerald-700">Endorsed for Zonal Committee Quorum</span>
                  </div>
                </div>
              </div>

              {/* Committee Decision Action Box */}
              <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0c3148] uppercase tracking-wider">
                    Record Committee Vote &amp; Decision
                  </label>
                  <span className="text-xs text-[#627d98]">Authority: Zonal Credit Committee</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCommitteeVote('APPROVED')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      committeeVote === 'APPROVED'
                        ? 'bg-emerald-700 text-white shadow'
                        : 'bg-white border border-[#cbd5e1] text-[#334155]'
                    }`}
                  >
                    Approve (Unconditional)
                  </button>
                  <button
                    onClick={() => setCommitteeVote('CONDITIONAL')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      committeeVote === 'CONDITIONAL'
                        ? 'bg-[#19638c] text-white shadow'
                        : 'bg-white border border-[#cbd5e1] text-[#334155]'
                    }`}
                  >
                    Approve with Conditions
                  </button>
                  <button
                    onClick={() => setCommitteeVote('DEFERRED')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      committeeVote === 'DEFERRED'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-white border border-[#cbd5e1] text-[#334155]'
                    }`}
                  >
                    Defer Case
                  </button>
                  <button
                    onClick={() => setCommitteeVote('REJECTED')}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      committeeVote === 'REJECTED'
                        ? 'bg-rose-700 text-white shadow'
                        : 'bg-white border border-[#cbd5e1] text-[#334155]'
                    }`}
                  >
                    Reject
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#627d98]">Mandatory Committee Conditions &amp; Minutes</label>
                  <textarea
                    rows={3}
                    value={committeeNotes}
                    onChange={(e) => setCommitteeNotes(e.target.value)}
                    className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded-lg p-3 text-[#102a43] focus:outline-none focus:ring-1 focus:ring-[#19638c]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={!isActionOwner}
                onClick={() => {
                  setCurrentStep('LOS_SEND_PENDING');
                  setSimulatedRole('CPA');
                  addAuditLog('COMMITTEE_DECISION_EXECUTED', selectedProjectSeed.project, `Committee decision recorded: ${committeeVote}. Returned to CPA/COM for LOS handoff.`);
                }}
                className="bg-[#0c3148] hover:bg-[#19638c] text-white px-7 py-3 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
              >
                Execute Approval &amp; Return to CPA/COM for LOS Handoff →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* WORKSPACE VIEW 6: CPA/COM SEND TO LOS & ACKNOWLEDGEMENT (Seq 14-16) */}
        {/* ============================================================ */}
        {(currentStep === 'LOS_SEND_PENDING' ||
          currentStep === 'SENT_TO_LOS' ||
          currentStep === 'LOS_ACKNOWLEDGED') && (
          <div className="space-y-6">
            {/* Status Header */}
            {currentStep === 'LOS_ACKNOWLEDGED' ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="font-bold text-sm">APF Successfully Activated in Bank LOS!</h4>
                    <p className="text-xs text-emerald-800">
                      LOS Acknowledgement ID: <strong className="font-mono">{losAckId}</strong> • APF Number:{' '}
                      <strong className="font-mono">{losPayload.apfNumber}</strong> • Live for mortgage origination
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-full">
                  APF ACTIVE
                </span>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 shadow-xs">
                <div>
                  <h4 className="font-bold text-sm">Approved APF Case Ready for LOS Handoff</h4>
                  <p className="text-xs text-blue-700">
                    Committee decision registered. Approved master, rate matrix, conditions, and DMS references compiled.
                  </p>
                </div>
                <button
                  onClick={() => setShowPayloadModal(true)}
                  className="bg-[#0c3148] hover:bg-[#19638c] text-white text-xs px-3.5 py-1.5 rounded-lg font-medium shadow-xs"
                >
                  Inspect Full JSON Payload
                </button>
              </div>
            )}

            {/* Structured LOS Payload Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-[#e2e8f0] p-4 rounded-xl space-y-2 text-xs bg-[#f8fafc]">
                <h4 className="font-bold text-[#0c3148] uppercase tracking-wider text-[11px]">
                  1. Master Identifiers
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">APF Case ID:</span>
                    <span className="font-mono font-bold text-[#102a43]">{losPayload.apfCaseId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Generated APF No:</span>
                    <span className="font-mono font-bold text-[#19638c]">{losPayload.apfNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Builder Legal Name:</span>
                    <span className="font-semibold text-[#102a43] truncate max-w-[150px]">{losPayload.builderLegalName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Project &amp; RERA:</span>
                    <span className="font-semibold text-[#102a43] truncate max-w-[150px]">{losPayload.projectName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Approved Towers:</span>
                    <span className="font-bold text-[#19638c]">{losPayload.approvedTowers.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#e2e8f0] p-4 rounded-xl space-y-2 text-xs bg-[#f8fafc]">
                <h4 className="font-bold text-[#0c3148] uppercase tracking-wider text-[11px]">
                  2. Rate Matrix &amp; Valuation
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Approved Base Rate:</span>
                    <span className="font-bold text-[#102a43]">₹{losPayload.approvedValuationRate} / sq.ft</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">3BHK Configuration:</span>
                    <span className="font-semibold text-[#102a43]">₹{losPayload.rateMatrix['3BHK']} / sq.ft</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Floor Rise Rule:</span>
                    <span className="text-[#102a43]">₹50 / sq.ft above 5th floor</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Technical Grade:</span>
                    <span className="font-bold text-emerald-700">{losPayload.technicalGrade}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Realizable Value:</span>
                    <span className="font-bold text-[#102a43]">₹{losPayload.realizableValueCr} Cr</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#e2e8f0] p-4 rounded-xl space-y-2 text-xs bg-[#f8fafc]">
                <h4 className="font-bold text-[#0c3148] uppercase tracking-wider text-[11px]">
                  3. Integrity &amp; Audit Trail
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Report Hash:</span>
                    <span className="font-mono text-[10px] text-[#102a43] truncate max-w-[140px]">{losPayload.reportHash}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Idempotency Key:</span>
                    <span className="font-mono text-[10px] text-[#102a43] truncate max-w-[140px]">{losPayload.idempotencyKey}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Sent By User:</span>
                    <span className="font-semibold text-[#102a43]">{losPayload.sentBy}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e2e8f0]">
                    <span className="text-[#627d98]">Payload Version:</span>
                    <span className="font-semibold text-[#102a43]">v{losPayload.payloadVersion}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#627d98]">Audit Trail Stamped:</span>
                    <span className="text-emerald-700 font-bold">YES ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEND TO LOS ACTION BUTTON */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
              <div className="text-xs text-[#627d98]">
                {currentStep === 'LOS_ACKNOWLEDGED' ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ LOS Acknowledgement persisted: {losAckId} (APF Active)
                  </span>
                ) : (
                  <span>
                    Button enabled for <strong>CPA / COM</strong> following approval. Transmits cryptographic payload to core LOS.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep !== 'LOS_ACKNOWLEDGED' ? (
                  <button
                    disabled={losIsTransmitting || (!isActionOwner && simulatedRole !== 'COM')}
                    onClick={handleSendToLos}
                    className="bg-[#15803d] hover:bg-[#166534] text-white px-8 py-3 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2.5 disabled:opacity-50"
                  >
                    {losIsTransmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Secure Payload to Bank LOS API...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">🚀</span>
                        <span>SEND TO LOS</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentStep('DRAFT');
                      setSimulatedRole('CPA');
                      addAuditLog('TRANSACTION_RESTART', selectedProjectSeed.project, 'Restarted scripted demo case from Step 1.');
                    }}
                    className="bg-[#0c3148] hover:bg-[#19638c] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm"
                  >
                    Reset &amp; Run Transaction Again (Step 1)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rework Modal Dialog */}
      {isReworkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#cbd5e1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <h3 className="text-sm font-bold text-[#102a43]">
                {reworkInitiator} Request Rework from Valuer
              </h3>
              <button
                onClick={() => setIsReworkModalOpen(false)}
                className="text-[#627d98] hover:text-[#102a43] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#627d98]">
              Specify the precise observation or exception requiring valuer clarification. The system will create a new report version (v1.1) and re-assign the task to the valuer.
            </p>

            <div>
              <label className="text-xs font-semibold text-[#102a43]">Rework Reason / Observation</label>
              <textarea
                rows={4}
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
                placeholder="e.g. Please clarify discrepancy between RERA carpet area and physical surveyed carpet area on Building G floor 18..."
                className="w-full mt-1 text-xs bg-white border border-[#cbd5e1] rounded-lg p-3 text-[#102a43] focus:outline-none focus:ring-1 focus:ring-[#19638c]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsReworkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#627d98] hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!reworkReason}
                onClick={handleTriggerRework}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg disabled:opacity-50"
              >
                Submit Rework Order &amp; Re-open Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOS Payload JSON Modal */}
      {showPayloadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-[#cbd5e1] overflow-hidden">
            <div className="p-4 bg-[#0c3148] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded">
                  LOS PAYLOAD V1.0.0
                </span>
                <h3 className="text-sm font-bold">Standard Bank LOS Integration Schema</h3>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-[11px] bg-[#0f172a] text-[#38bdf8] leading-relaxed">
              <pre>{JSON.stringify(losPayload, null, 2)}</pre>
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#cbd5e1] flex justify-between items-center text-xs">
              <span className="text-[#627d98]">
                Payload Checksum: <strong className="font-mono text-[#102a43]">{reportHash.slice(0, 24)}...</strong>
              </span>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-2 bg-[#0c3148] text-white font-bold rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
