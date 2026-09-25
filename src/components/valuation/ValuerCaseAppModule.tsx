import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Camera,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Layers,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import {
  BankValuationReportData,
  TowerProgressRecord,
  ValuationComparableRecord,
  RiskExceptionRecord,
  ValuationPhotoEvidence,
} from '../../types/valuationCatalogue';
import { VALUATION_LOV_MASTER, BANK_VALUATION_RULES } from '../../data/valuationLovMaster';
import {
  initializeValuationDraftFromCase,
  calculateDelayVariance,
  calculateAdjustedComparableRate,
  calculateTechnicalScoreAndGrade,
  calculateValuationValues,
  generateReportHash,
  validateValuationSubmission,
} from '../../services/valuationCalculationEngine';
import { apfStore } from '../../services/apfStore';
import {
  CENTRAL_PROJECT_MASTER,
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PHASE_MASTER,
  CENTRAL_TOWER_MASTER,
} from '../../data/centralMasterData';
import { ValuationReportDocPreview } from './ValuationReportDocPreview';
import { InteractiveSiteMapView } from '../maps/InteractiveSiteMapView';
import { ValuerMapPinModal } from '../maps/ValuerMapPinModal';

interface ValuerCaseAppModuleProps {
  caseData: APFCase;
  currentUser: UserAccount;
  onBack: () => void;
  onSubmitSuccess?: () => void;
  onRaiseQuery?: () => void;
}

export type ValuerTabKey =
  | 'ASSIGNMENT'
  | 'START_VISIT'
  | 'LAND_LOCATION'
  | 'APPROVALS'
  | 'TOWER_PROGRESS'
  | 'QUALITY_INFRA'
  | 'MARKETABILITY'
  | 'COMPARABLES'
  | 'VALUATION'
  | 'RISK_RECOMMENDATION'
  | 'PHOTOS_EVIDENCE'
  | 'PREVIEW_SUBMIT';

export const ValuerCaseAppModule: React.FC<ValuerCaseAppModuleProps> = ({
  caseData,
  currentUser,
  onBack,
  onSubmitSuccess,
  onRaiseQuery,
}) => {
  const [activeTab, setActiveTab] = useState<ValuerTabKey>('ASSIGNMENT');
  const [showMapPinModal, setShowMapPinModal] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Find associated master records
  const builder = CENTRAL_BUILDER_MASTER.find((b) => b.id === caseData.builderId);
  const project = CENTRAL_PROJECT_MASTER.find((p) => p.id === caseData.projectId);
  const phase = CENTRAL_PHASE_MASTER.find((ph) => ph.id === caseData.phaseId);
  const towers = CENTRAL_TOWER_MASTER.filter((t) => caseData.selectedTowerIds.includes(t.id));

  // Initialize or load draft
  const [formData, setFormData] = useState<BankValuationReportData>(() => {
    // Check if case already has detailed valuation report stored
    const existing = (caseData as any).detailedValuationReport;
    if (existing) return existing;
    return initializeValuationDraftFromCase(caseData, builder, project, phase, towers, currentUser);
  });

  // Keep derived values synchronized
  const syncDerivedValues = (data: BankValuationReportData): BankValuationReportData => {
    // 1. Tower delays
    const updatedTowers = data.towersProgress.map((t) => ({
      ...t,
      delayVariancePct: calculateDelayVariance(t.expectedProgressPct, t.physicalProgressPct),
    }));

    // 2. Comparable adjusted rates
    const updatedComps = data.comparables.map((c) => ({
      ...c,
      adjustedComparableRate: calculateAdjustedComparableRate(c),
    }));

    // 3. Technical Score & Grade
    const avgCon =
      updatedTowers.length > 0
        ? updatedTowers.reduce((acc, t) => acc + (t.constructionQualityScore || 4), 0) / updatedTowers.length
        : data.constructionQualityScore;

    const techCalc = calculateTechnicalScoreAndGrade({
      locationScore: data.locationScore,
      constructionQualityScore: avgCon,
      infraScore: data.infraScore,
      marketabilityScore: data.marketabilityScore,
    });

    // 4. Valuation Values
    const valCalc = calculateValuationValues(
      data.adoptedBaseRate,
      data.totalSaleableAreaSqFt || 340000,
      data.floorRiseApplicable === 'Yes' ? data.floorRiseRate : 0,
      data.plcApplicable === 'Yes' ? data.plcPremium : 0
    );

    return {
      ...data,
      towersProgress: updatedTowers,
      comparables: updatedComps,
      finalTechnicalScore: techCalc.score100,
      technicalGrade: techCalc.grade,
      marketValueCr: valCalc.marketValueCr,
      realizableValueCr: valCalc.realizableValueCr,
      distressValueCr: valCalc.distressValueCr,
      recommendedApfRate: valCalc.recommendedApfRate,
    };
  };

  const handleUpdate = (updates: Partial<BankValuationReportData>) => {
    setFormData((prev) => {
      const merged = { ...prev, ...updates };
      return syncDerivedValues(merged);
    });
  };

  const handleSaveDraft = () => {
    const updated = { ...formData, isLocked: false };
    (caseData as any).detailedValuationReport = updated;
    apfStore.saveCases();
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // Workflow: Accept Assignment
  const handleAcceptAssignment = () => {
    apfStore.acceptValuerAssignment(caseData.id);
    handleUpdate({
      visitType: 'Initial',
      visitStartDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    setActiveTab('START_VISIT');
  };

  // Workflow: Start Site Visit with GPS lock
  const handleStartSiteVisit = () => {
    const lat = project?.latLong.lat || 18.6186;
    const lng = project?.latLong.lng || 73.7149;
    apfStore.startSiteVisit(caseData.id, lat, lng);
    handleUpdate({
      latitude: lat,
      longitude: lng,
      gpsAccuracyMeters: 3.2,
      geofenceResult: 'Inside',
      siteAddressMatch: 'Match',
      siteBoundaryVerified: 'Yes',
      visitStartDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    setActiveTab('LAND_LOCATION');
  };

  // Workflow: Final Submission
  const handleSubmitReport = () => {
    const validation = validateValuationSubmission(formData);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);

    if (!validation.isValid) {
      alert(`Please resolve ${validation.errors.length} validation item(s) before submitting.`);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const hash = generateReportHash(formData);

    const finalizedReport: BankValuationReportData = {
      ...formData,
      isLocked: true,
      submittedAt: now,
      submittedBy: `${currentUser.name} (${currentUser.role})`,
      reportHash: hash,
    };

    // Store full bank valuation report
    (caseData as any).detailedValuationReport = finalizedReport;

    // Call store method to advance case status to VALUATION_SUBMITTED and refresh exposure
    apfStore.submitValuationReport(
      caseData.id,
      {
        reportVersion: finalizedReport.reportVersion,
        reportHash: hash,
        submittedAt: now,
        submittedBy: finalizedReport.submittedBy || `${currentUser.name} (${currentUser.role})`,
        adoptedBaseRateSqFt: finalizedReport.adoptedBaseRate,
        fairMarketValueCr: finalizedReport.marketValueCr,
        realizableValueCr: finalizedReport.realizableValueCr,
        distressValueCr: finalizedReport.distressValueCr,
        recommendedApfRateSqFt: finalizedReport.recommendedApfRate,
        technicalGrade: finalizedReport.technicalGrade,
        locationScore: finalizedReport.locationScore,
        constructionScore: finalizedReport.constructionQualityScore,
        infrastructureScore: finalizedReport.infraScore,
        marketabilityScore: finalizedReport.marketabilityScore,
        rateBand2BHK: `₹${finalizedReport.adoptedBaseRate - 200} - ₹${finalizedReport.adoptedBaseRate + 300}`,
        rateBand3BHK: `₹${finalizedReport.adoptedBaseRate} - ₹${finalizedReport.adoptedBaseRate + 500}`,
        validityMonths: 3,
        keyObservations: finalizedReport.conditions,
        valuerRecommendation: finalizedReport.valuerRecommendation,
        digitalSignature: finalizedReport.digitalSignature,
      },
      finalizedReport.photos as any,
      finalizedReport.comparables as any,
      finalizedReport
    );

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  // Tab definitions
  const tabs: { key: ValuerTabKey; label: string; number: number }[] = [
    { key: 'ASSIGNMENT', label: 'Assignment', number: 1 },
    { key: 'START_VISIT', label: 'Start Visit', number: 2 },
    { key: 'LAND_LOCATION', label: 'Land & Location', number: 3 },
    { key: 'APPROVALS', label: 'Approvals', number: 4 },
    { key: 'TOWER_PROGRESS', label: 'Tower Progress', number: 5 },
    { key: 'QUALITY_INFRA', label: 'Quality & Infra', number: 6 },
    { key: 'MARKETABILITY', label: 'Marketability', number: 7 },
    { key: 'COMPARABLES', label: 'Comparables', number: 8 },
    { key: 'VALUATION', label: 'Valuation', number: 9 },
    { key: 'RISK_RECOMMENDATION', label: 'Risk & Decision', number: 10 },
    { key: 'PHOTOS_EVIDENCE', label: 'Photos & GPS', number: 11 },
    { key: 'PREVIEW_SUBMIT', label: 'Preview & Submit', number: 12 },
  ];

  const currentTabIdx = tabs.findIndex((t) => t.key === activeTab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-slate-800">
      {/* TOP INSTITUTIONAL HEADER BAR */}
      <div className="bg-[#0c3148] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onBack}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back</span>
            </button>
            <span className="text-[10px] font-mono uppercase bg-sky-900/60 text-sky-200 px-2 py-0.5 rounded border border-sky-700/50">
              VALUER APPRAISAL MODULE
            </span>
            <span className="text-xs text-sky-200 font-mono">Case: {caseData.id}</span>
            <span className="text-xs text-emerald-400 font-bold font-mono">Status: {caseData.currentStatus}</span>
          </div>

          <h1 className="text-xl font-black mt-2 text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>{formData.projectName} — {formData.builderLegalName}</span>
          </h1>
          <p className="text-xs text-sky-200 mt-0.5">
            Phase: {formData.assignedPhases?.join(', ')} • Assigned Towers: {formData.assignedTowers?.join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRaiseQuery && (
            <button
              onClick={onRaiseQuery}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Raise Query / Request Input</span>
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setActiveTab('PREVIEW_SUBMIT')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Report</span>
          </button>
        </div>
      </div>

      {/* REWORK BANNER (If case was returned for rework) */}
      {caseData.currentStatus === 'VALUATION_REWORK' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-amber-950 text-xs uppercase tracking-wider font-bold">
                REWORK REQUESTED BY CPA:
              </strong>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                VERSION 2.0 DRAFT
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Please review the notes and adjust comparable evidence, tower progress, or adopted rate before resubmitting.
              The prior submitted report version 1.0 remains locked in audit history.
            </p>
          </div>
        </div>
      )}

      {/* TOAST CONFIRMATION */}
      {isSavedToast && (
        <div className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold fixed top-5 right-5 shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Draft data saved successfully</span>
        </div>
      )}

      {/* 12-STEP HORIZONTAL NAVIGATION PILLS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-[#0c3148] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                  activeTab === tab.key ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.number}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        {/* TAB 1: ASSIGNMENT */}
        {activeTab === 'ASSIGNMENT' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">Tab 1: Assignment Scope & Master Details</h2>
                <p className="text-xs text-slate-500">
                  System-populated fields from Builder Master, Project Master, and CPA Workflow assignment.
                </p>
              </div>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded font-mono">
                AUTO-POPULATED • READ-ONLY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-sky-800 uppercase tracking-wider text-[11px] block">
                  Assignment Identification
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">APF Case ID:</span> <div className="font-bold font-mono">{formData.caseId}</div></div>
                  <div><span className="text-slate-500">Request ID:</span> <div className="font-bold font-mono">{formData.valuationRequestId}</div></div>
                  <div><span className="text-slate-500">Request Type:</span> <div className="font-bold">{formData.requestType}</div></div>
                  <div><span className="text-slate-500">Valuer Type:</span> <div className="font-bold">{formData.valuerType}</div></div>
                  <div><span className="text-slate-500">Empanelment No:</span> <div className="font-bold font-mono">{formData.empanelmentNo}</div></div>
                  <div><span className="text-slate-500">SLA Due Date:</span> <div className="font-bold text-rose-700">{formData.slaDueDate}</div></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-sky-800 uppercase tracking-wider text-[11px] block">
                  Builder & Project Master
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Builder Name:</span> <div className="font-bold">{formData.builderLegalName}</div></div>
                  <div><span className="text-slate-500">Builder Group:</span> <div className="font-bold">{formData.builderGroup}</div></div>
                  <div><span className="text-slate-500">Project Name:</span> <div className="font-bold">{formData.projectName}</div></div>
                  <div><span className="text-slate-500">RERA Registration:</span> <div className="font-bold font-mono text-sky-800">{formData.reraNumbers?.join(', ')}</div></div>
                  <div className="col-span-2"><span className="text-slate-500">Site Address:</span> <div className="font-semibold">{formData.projectAddress}</div></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-sky-800 uppercase tracking-wider text-[11px] block">
                Assigned Scope & Towers
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.assignedTowers?.map((tName) => (
                  <span key={tName} className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800">
                    🏢 {tName}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION TO ACCEPT */}
            {caseData.currentStatus === 'ASSIGNED_TO_VALUER' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Assignment Pending Acceptance</h4>
                  <p className="text-[11px] text-emerald-700">Click Accept to confirm scope and proceed with physical site visit.</p>
                </div>
                <button
                  onClick={handleAcceptAssignment}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Accept Assignment →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: START VISIT */}
        {activeTab === 'START_VISIT' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">Tab 2: Start Site Visit & GPS Geofence Verification</h2>
                <p className="text-xs text-slate-500">
                  Capture visit timestamp, device coordinates, and verify 500m project geofence compliance.
                </p>
              </div>
              <button
                onClick={() => setShowMapPinModal(true)}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Verify on Google Maps</span>
              </button>
            </div>

            {/* Interactive Map */}
            <div className="space-y-2">
              <InteractiveSiteMapView
                caseData={caseData}
                project={project}
                canPin={true}
                onOpenPinModal={() => setShowMapPinModal(true)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Visit Start Timestamp</span>
                <input
                  type="text"
                  value={formData.visitStartDateTime}
                  onChange={(e) => handleUpdate({ visitStartDateTime: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Captured Coordinates</span>
                <div className="font-mono font-bold text-slate-900 text-xs bg-white border border-slate-300 rounded-lg p-2">
                  {formData.latitude?.toFixed(5)}, {formData.longitude?.toFixed(5)} (±{formData.gpsAccuracyMeters}m)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Geofence Compliance</span>
                <select
                  value={formData.geofenceResult}
                  onChange={(e) => handleUpdate({ geofenceResult: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                >
                  {VALUATION_LOV_MASTER.geofenceResult.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Site Address Match</label>
                <select
                  value={formData.siteAddressMatch}
                  onChange={(e) => handleUpdate({ siteAddressMatch: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.siteAddressMatch.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Site Boundary Verified</label>
                <select
                  value={formData.siteBoundaryVerified}
                  onChange={(e) => handleUpdate({ siteBoundaryVerified: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.siteBoundaryVerified.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Site Visit Observation Remarks</label>
                <textarea
                  rows={2}
                  value={formData.siteVisitRemarks}
                  onChange={(e) => handleUpdate({ siteVisitRemarks: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            {caseData.currentStatus === 'VALUER_ACCEPTED' && (
              <button
                onClick={handleStartSiteVisit}
                className="w-full py-3 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-sky-300" />
                <span>Lock GPS Coordinates & Start Inspection</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: LAND & LOCATION */}
        {activeTab === 'LAND_LOCATION' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 3: Land & Location Assessment</h2>
              <p className="text-xs text-slate-500">
                Land reference, title, access status, locality classification, and connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Survey / CTS / Gat / Plot No.</label>
                <input
                  type="text"
                  value={formData.surveyCtsPlotNo}
                  onChange={(e) => handleUpdate({ surveyCtsPlotNo: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Land Area</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.landArea}
                  onChange={(e) => handleUpdate({ landArea: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Land Area Unit</label>
                <select
                  value={formData.landAreaUnit}
                  onChange={(e) => handleUpdate({ landAreaUnit: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.landAreaUnit.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ownership Type</label>
                <select
                  value={formData.ownershipType}
                  onChange={(e) => handleUpdate({ ownershipType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.ownershipType.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Possession / Access Status</label>
                <select
                  value={formData.possessionStatus}
                  onChange={(e) => handleUpdate({ possessionStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.possessionStatus.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Locality Classification</label>
                <select
                  value={formData.localityClassification}
                  onChange={(e) => handleUpdate({ localityClassification: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.localityClassification.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Approach Road Width (Meters)</label>
                <input
                  type="number"
                  value={formData.approachRoadWidthMeters}
                  onChange={(e) => handleUpdate({ approachRoadWidthMeters: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Approach Road Condition</label>
                <select
                  value={formData.approachRoadCondition}
                  onChange={(e) => handleUpdate({ approachRoadCondition: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.approachRoadCondition.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Connectivity</label>
                <select
                  value={formData.connectivity}
                  onChange={(e) => handleUpdate({ connectivity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.connectivity.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Neighbourhood Land Use</label>
                <select
                  value={formData.neighbourhoodLandUse}
                  onChange={(e) => handleUpdate({ neighbourhoodLandUse: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.neighbourhoodLandUse.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location Score (1 - 5)</label>
                <select
                  value={formData.locationScore}
                  onChange={(e) => handleUpdate({ locationScore: parseInt(e.target.value) || 3 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-sky-800"
                >
                  {VALUATION_LOV_MASTER.scoreOneToFive.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPROVALS */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 4: Statutory & Project Approvals</h2>
              <p className="text-xs text-slate-500">
                Verification of RERA, Sanctioned Plan, Commencement Certificate, and environmental approvals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">RERA Registration Status</label>
                <select
                  value={formData.reraStatus}
                  onChange={(e) => handleUpdate({ reraStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.reraStatus.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="RERA Reference details..."
                  value={formData.reraRef}
                  onChange={(e) => handleUpdate({ reraRef: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Sanctioned Plan Available</label>
                <select
                  value={formData.sanctionedPlanStatus}
                  onChange={(e) => handleUpdate({ sanctionedPlanStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.sanctionedPlanAvailable.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Sanction plan order no..."
                  value={formData.sanctionedPlanRef}
                  onChange={(e) => handleUpdate({ sanctionedPlanRef: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Commencement Certificate (CC)</label>
                <select
                  value={formData.commencementCertStatus}
                  onChange={(e) => handleUpdate({ commencementCertStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.commencementCertStatus.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="CC reference no..."
                  value={formData.commencementCertRef}
                  onChange={(e) => handleUpdate({ commencementCertRef: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">OC / Part OC Status</label>
                <select
                  value={formData.ocStatus}
                  onChange={(e) => handleUpdate({ ocStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.ocStatus.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="OC status note..."
                  value={formData.ocRef}
                  onChange={(e) => handleUpdate({ ocRef: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                <label className="block font-bold text-slate-700">Major Approval Exception</label>
                <select
                  value={formData.majorApprovalException}
                  onChange={(e) => handleUpdate({ majorApprovalException: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                >
                  {VALUATION_LOV_MASTER.majorApprovalException.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Remarks for approval exception..."
                  value={formData.approvalRemarks}
                  onChange={(e) => handleUpdate({ approvalRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TOWER PROGRESS */}
        {activeTab === 'TOWER_PROGRESS' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 5: Tower-wise Construction Progress</h2>
              <p className="text-xs text-slate-500">
                Repeatable for each assigned tower. Floor count, stage, physical % vs expected %, and derived delay variance.
              </p>
            </div>

            <div className="space-y-4">
              {formData.towersProgress?.map((t, idx) => (
                <div key={t.towerId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-700" />
                      <span>{t.towerName}</span>
                    </span>
                    <span className="text-xs font-bold font-mono text-sky-800">
                      Sanctioned: {t.sanctionedFloors} Floors
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Constructed Floors</label>
                      <input
                        type="number"
                        value={t.constructedFloors}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const next = [...formData.towersProgress];
                          next[idx].constructedFloors = val;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Construction Stage</label>
                      <select
                        value={t.constructionStage}
                        onChange={(e) => {
                          const next = [...formData.towersProgress];
                          next[idx].constructionStage = e.target.value;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                      >
                        {VALUATION_LOV_MASTER.constructionStage.map((o) => (
                          <option key={o.code} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Actual Physical %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={t.physicalProgressPct}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...formData.towersProgress];
                          next[idx].physicalProgressPct = val;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expected Progress %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={t.expectedProgressPct}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...formData.towersProgress];
                          next[idx].expectedProgressPct = val;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Derived Delay Variance</span>
                      <div className="font-bold text-xs p-2 rounded-lg bg-white border border-slate-200">
                        Variance: {t.delayVariancePct}% {t.delayVariancePct > 0 ? '(Behind Schedule)' : '(On/Ahead)'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Workmanship Quality</label>
                      <select
                        value={t.structuralWorkmanshipQuality}
                        onChange={(e) => {
                          const next = [...formData.towersProgress];
                          next[idx].structuralWorkmanshipQuality = e.target.value;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                      >
                        {VALUATION_LOV_MASTER.workmanshipQuality.map((o) => (
                          <option key={o.code} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Deviation Observed</label>
                      <select
                        value={t.deviationObserved}
                        onChange={(e) => {
                          const next = [...formData.towersProgress];
                          next[idx].deviationObserved = e.target.value;
                          handleUpdate({ towersProgress: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                      >
                        {VALUATION_LOV_MASTER.deviationObserved.map((o) => (
                          <option key={o.code} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: QUALITY & INFRASTRUCTURE */}
        {activeTab === 'QUALITY_INFRA' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 6: Quality, Safety & Infrastructure Readiness</h2>
              <p className="text-xs text-slate-500">
                Evaluation of structural finishes, safety protocol, site infra, and execution adequacy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Structural Quality Score (1 - 5)</label>
                <select
                  value={formData.constructionQualityScore}
                  onChange={(e) => handleUpdate({ constructionQualityScore: parseInt(e.target.value) || 4 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-sky-800"
                >
                  {VALUATION_LOV_MASTER.scoreOneToFive.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  placeholder="Structural workmanship remarks..."
                  value={formData.workmanshipRemarks}
                  onChange={(e) => handleUpdate({ workmanshipRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Safety & Housekeeping</label>
                <select
                  value={formData.safetyHousekeeping}
                  onChange={(e) => handleUpdate({ safetyHousekeeping: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.safetyHousekeeping.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  placeholder="Safety protocol remarks..."
                  value={formData.safetyRemarks}
                  onChange={(e) => handleUpdate({ safetyRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Infrastructure Readiness Score (1 - 5)</label>
                <select
                  value={formData.infraScore}
                  onChange={(e) => handleUpdate({ infraScore: parseInt(e.target.value) || 4 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-sky-800"
                >
                  {VALUATION_LOV_MASTER.scoreOneToFive.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  placeholder="Internal roads, water, sewage readiness..."
                  value={formData.infraRemarks}
                  onChange={(e) => handleUpdate({ infraRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Labour & Material Availability</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.labourPresence}
                    onChange={(e) => handleUpdate({ labourPresence: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                  >
                    {VALUATION_LOV_MASTER.labourPresence.map((o) => (
                      <option key={o.code} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={formData.materialAvailability}
                    onChange={(e) => handleUpdate({ materialAvailability: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                  >
                    {VALUATION_LOV_MASTER.materialAvailability.map((o) => (
                      <option key={o.code} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Material & labour observations..."
                  value={formData.executionRemarks}
                  onChange={(e) => handleUpdate({ executionRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MARKETABILITY */}
        {activeTab === 'MARKETABILITY' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 7: Marketability & Micro-Market Demand</h2>
              <p className="text-xs text-slate-500">
                Demand velocity, competition density, unsold inventory position, and marketability score.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-bold text-slate-700">Demand Level</label>
                <select
                  value={formData.demandLevel}
                  onChange={(e) => handleUpdate({ demandLevel: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.demandLevel.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Demand rationale..."
                  value={formData.demandRemarks}
                  onChange={(e) => handleUpdate({ demandRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-bold text-slate-700">Competition Intensity</label>
                <select
                  value={formData.competitionIntensity}
                  onChange={(e) => handleUpdate({ competitionIntensity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.competitionIntensity.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nearby projects & price competition..."
                  value={formData.competitionRemarks}
                  onChange={(e) => handleUpdate({ competitionRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-bold text-slate-700">Sales Velocity</label>
                <select
                  value={formData.salesVelocity}
                  onChange={(e) => handleUpdate({ salesVelocity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.salesVelocity.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Absorption velocity observation..."
                  value={formData.salesRemarks}
                  onChange={(e) => handleUpdate({ salesRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-bold text-slate-700">Inventory Position</label>
                <select
                  value={formData.inventoryPosition}
                  onChange={(e) => handleUpdate({ inventoryPosition: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.inventoryPosition.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Unsold stock observation..."
                  value={formData.inventoryRemarks}
                  onChange={(e) => handleUpdate({ inventoryRemarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-900 block text-xs">Marketability Score (1 - 5)</span>
                  <span className="text-[11px] text-sky-700">Feeds into the final bank technical grade</span>
                </div>
                <select
                  value={formData.marketabilityScore}
                  onChange={(e) => handleUpdate({ marketabilityScore: parseInt(e.target.value) || 4 })}
                  className="bg-white border border-sky-300 rounded-lg p-2 font-bold text-sm text-sky-900"
                >
                  {VALUATION_LOV_MASTER.scoreOneToFive.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: COMPARABLES */}
        {activeTab === 'COMPARABLES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">Tab 8: Comparable Market Evidence Grid</h2>
                <p className="text-xs text-slate-500">
                  Minimum recommended: 3 comparable records. Adjusted rate is calculated automatically.
                </p>
              </div>
              <button
                onClick={() => {
                  const newComp: ValuationComparableRecord = {
                    id: `CMP-${Date.now()}`,
                    comparableProjectName: 'New Comparable Project',
                    developer: 'Local Developer',
                    distanceKm: 1.5,
                    projectStage: 'Under Construction',
                    configuration: '2 BHK',
                    carpetAreaSqFt: 750,
                    quotedRateSqFt: 7500,
                    supportedRateSqFt: 7200,
                    rateSource: 'Registered Transaction',
                    observationDate: new Date().toISOString().substring(0, 10),
                    locationAdjPct: 0,
                    stageAdjPct: 0,
                    amenitiesAdjPct: 0,
                    sizeAdjPct: 0,
                    adjustedComparableRate: 7200,
                  };
                  handleUpdate({ comparables: [...formData.comparables, newComp] });
                }}
                className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Comparable</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.comparables?.map((comp, idx) => (
                <div key={comp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Comparable #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const next = formData.comparables.filter((_, i) => i !== idx);
                        handleUpdate({ comparables: next });
                      }}
                      className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={comp.comparableProjectName}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].comparableProjectName = e.target.value;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Developer</label>
                      <input
                        type="text"
                        value={comp.developer}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].developer = e.target.value;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Distance (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={comp.distanceKm}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].distanceKm = parseFloat(e.target.value) || 0;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Stage</label>
                      <select
                        value={comp.projectStage}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].projectStage = e.target.value;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        {VALUATION_LOV_MASTER.comparableProjectStage.map((o) => (
                          <option key={o.code} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Quoted Rate/sq.ft</label>
                      <input
                        type="number"
                        value={comp.quotedRateSqFt}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].quotedRateSqFt = parseInt(e.target.value) || 0;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Supported Rate/sq.ft</label>
                      <input
                        type="number"
                        value={comp.supportedRateSqFt}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].supportedRateSqFt = parseInt(e.target.value) || 0;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Rate Source</label>
                      <select
                        value={comp.rateSource}
                        onChange={(e) => {
                          const next = [...formData.comparables];
                          next[idx].rateSource = e.target.value;
                          handleUpdate({ comparables: next });
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        {VALUATION_LOV_MASTER.rateSource.map((o) => (
                          <option key={o.code} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-sky-800 mb-1">Derived Adjusted Rate</span>
                      <div className="font-mono font-bold text-xs p-2 rounded-lg bg-sky-50 text-sky-900 border border-sky-200">
                        ₹{comp.adjustedComparableRate?.toLocaleString()}/sq.ft
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: VALUATION */}
        {activeTab === 'VALUATION' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 9: Valuation Methodology, Pricing & Derivation</h2>
              <p className="text-xs text-slate-500">
                Set adopted base rate, premiums, methodology, and review bank calculated values.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Builder Quoted Base Rate</label>
                <input
                  type="number"
                  value={formData.builderQuotedBaseRate}
                  onChange={(e) => handleUpdate({ builderQuotedBaseRate: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Observed Market Low</label>
                <input
                  type="number"
                  value={formData.observedMarketRateLow}
                  onChange={(e) => handleUpdate({ observedMarketRateLow: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Observed Market High</label>
                <input
                  type="number"
                  value={formData.observedMarketRateHigh}
                  onChange={(e) => handleUpdate({ observedMarketRateHigh: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-sky-800 mb-1">Adopted Base Rate (sq.ft)</label>
                <input
                  type="number"
                  value={formData.adoptedBaseRate}
                  onChange={(e) => handleUpdate({ adoptedBaseRate: parseInt(e.target.value) || 0 })}
                  className="w-full border-2 border-sky-600 rounded-lg p-2 text-xs font-mono font-black text-sky-900 bg-sky-50"
                />
              </div>
            </div>

            {/* Derived Bank Valuation Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Derived Value Calculation (Bank Configured Factors)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Market Value</span>
                  <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">₹{formData.marketValueCr} Cr</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Realizable Value (88%)</span>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">₹{formData.realizableValueCr} Cr</div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Distress Value (72%)</span>
                  <div className="text-xl font-black text-rose-700 font-mono mt-0.5">₹{formData.distressValueCr} Cr</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Valuation Method</label>
                <select
                  value={formData.primaryMethod}
                  onChange={(e) => handleUpdate({ primaryMethod: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.primaryValuationMethod.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Secondary Valuation Method</label>
                <select
                  value={formData.secondaryMethod}
                  onChange={(e) => handleUpdate({ secondaryMethod: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  {VALUATION_LOV_MASTER.secondaryValuationMethod.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Methodology Rationale</label>
                <textarea
                  rows={3}
                  value={formData.methodologyRationale}
                  onChange={(e) => handleUpdate({ methodologyRationale: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: RISK & RECOMMENDATION */}
        {activeTab === 'RISK_RECOMMENDATION' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 10: Technical Score, Risks & Decision</h2>
              <p className="text-xs text-slate-500">
                Automated grade derivation, risk exceptions, and final valuer recommendation.
              </p>
            </div>

            {/* Score & Grade Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Calculated Technical Score</span>
                <div className="text-xl font-black text-sky-900 mt-0.5">{formData.finalTechnicalScore} / 100</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Assigned Technical Grade</span>
                <div className="text-2xl font-black text-emerald-950 mt-0.5">{formData.technicalGrade}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Valuation Decision</label>
                <select
                  value={formData.valuationDecision}
                  onChange={(e) => handleUpdate({ valuationDecision: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                >
                  {VALUATION_LOV_MASTER.technicalDecision.map((o) => (
                    <option key={o.code} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Structured Risks Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Key Risks & Exceptions</span>
                <button
                  onClick={() => {
                    const newRisk: RiskExceptionRecord = {
                      id: `RSK-${Date.now()}`,
                      category: 'Construction',
                      observation: 'Observed variance in finishing timeline.',
                      severity: 'Low',
                      evidenceRef: 'Site Inspection Report',
                      mitigationCondition: 'Builder committed extra labour shifts.',
                    };
                    handleUpdate({ risks: [...(formData.risks || []), newRisk] });
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Risk</span>
                </button>
              </div>

              {formData.risks?.map((r, rIdx) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Category</span>
                    <input
                      type="text"
                      value={r.category}
                      onChange={(e) => {
                        const next = [...formData.risks];
                        next[rIdx].category = e.target.value;
                        handleUpdate({ risks: next });
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Severity</span>
                    <select
                      value={r.severity}
                      onChange={(e) => {
                        const next = [...formData.risks];
                        next[rIdx].severity = e.target.value as any;
                        handleUpdate({ risks: next });
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block">Observation</span>
                    <input
                      type="text"
                      value={r.observation}
                      onChange={(e) => {
                        const next = [...formData.risks];
                        next[rIdx].observation = e.target.value;
                        handleUpdate({ risks: next });
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Valuer Recommendation Narrative (Mandatory)
              </label>
              <textarea
                rows={3}
                value={formData.valuerRecommendation}
                onChange={(e) => handleUpdate({ valuerRecommendation: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs leading-relaxed"
                placeholder="Comprehensive independent recommendation..."
              />
            </div>
          </div>
        )}

        {/* TAB 11: PHOTOS & EVIDENCE */}
        {activeTab === 'PHOTOS_EVIDENCE' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900">Tab 11: Photographic Annexure & Geo-tagged Evidence</h2>
              <p className="text-xs text-slate-500">
                Entrance, RERA display, towers, progress close-ups, and approach road.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.photos?.map((ph, pIdx) => (
                <div key={ph.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{ph.title}</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono">
                      {ph.category}
                    </span>
                  </div>
                  <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 relative">
                    <Camera className="w-8 h-8 opacity-40" />
                    <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-600 bg-white/80 px-1 rounded">
                      GPS: {ph.lat?.toFixed(4)}, {ph.lng?.toFixed(4)}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={ph.notes}
                    onChange={(e) => {
                      const next = [...formData.photos];
                      next[pIdx].notes = e.target.value;
                      handleUpdate({ photos: next });
                    }}
                    placeholder="Evidence description..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: PREVIEW & SUBMIT */}
        {activeTab === 'PREVIEW_SUBMIT' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Tab 12: Preview Generated Report & Final Sign-Off</h2>
                <p className="text-xs text-slate-500">
                  Deterministically generated directly from your structured inputs. Review, check declarations, and submit.
                </p>
              </div>
            </div>

            {/* Validation Errors Box */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-1 text-xs text-rose-900">
                <strong className="block font-bold">Please correct the following before submission:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* FULL REPORT PREVIEW */}
            <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50">
              <ValuationReportDocPreview reportData={formData} isPrintView={true} />
            </div>

            {/* DECLARATIONS */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 space-y-3 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
                Valuer Statutory Declarations
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationSiteVisitConfirmed}
                  onChange={(e) => handleUpdate({ declarationSiteVisitConfirmed: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-sky-700"
                />
                <span className="text-slate-700 font-semibold">
                  I confirm that I personally / physically inspected the assigned project/site as recorded.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationTrueEvidenceConfirmed}
                  onChange={(e) => handleUpdate({ declarationTrueEvidenceConfirmed: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-sky-700"
                />
                <span className="text-slate-700 font-semibold">
                  I confirm that the observations, rates, and valuation are based on documents, site observations, and evidence available.
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveDraft}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Save Draft
              </button>

              <button
                onClick={handleSubmitReport}
                disabled={!formData.declarationSiteVisitConfirmed || !formData.declarationTrueEvidenceConfirmed}
                className="px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Valuation Report (Digitally Sign & Lock)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM FOOTER FOR EASY SEQUENTIAL NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              ← Back to Case
            </button>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Step {currentTabIdx + 1} of {tabs.length}: {tabs[currentTabIdx].label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentTabIdx > 0 && (
              <button
                onClick={() => setActiveTab(tabs[currentTabIdx - 1].key)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                ← Previous
              </button>
            )}

            {currentTabIdx < tabs.length - 1 ? (
              <button
                onClick={() => setActiveTab(tabs[currentTabIdx + 1].key)}
                className="px-5 py-2 rounded-xl bg-[#0c3148] hover:bg-sky-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitReport}
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps Pin Verification Modal */}
      {showMapPinModal && (
        <ValuerMapPinModal
          isOpen={showMapPinModal}
          onClose={() => setShowMapPinModal(false)}
          caseData={caseData}
          project={project}
          onLocationPinned={(loc) => {
            setShowMapPinModal(false);
            if (loc && loc.lat) {
              handleUpdate({
                latitude: loc.lat,
                longitude: loc.lng,
                geofenceResult: 'Inside',
              });
            }
          }}
        />
      )}
    </div>
  );
};
