import React, { useState } from 'react';
import {
  LegalDueDiligenceReport,
  LegalAssignment,
  LegalDocumentItem,
  TitleChainRow,
  EncumbranceItem,
  LitigationItem,
  LegalExceptionItem,
  LegalConditionItem,
  LegalOpinionType,
} from '../../types/legalDueDiligence';
import { legalStore } from '../../services/legalStore';
import { UserAccount } from '../../types/apfTransaction';
import { LegalQueryModal } from './LegalQueryModal';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  Send,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  MessageSquare,
  Eye,
  Plus,
  Trash2,
  Layers,
  FileCheck2,
  DollarSign,
  AlertCircle,
  Download,
} from 'lucide-react';

interface ExternalLegalWorkspaceProps {
  caseId: string;
  currentUser: UserAccount;
  onBack: () => void;
  onNavigateToBilling?: () => void;
}

export const ExternalLegalWorkspace: React.FC<ExternalLegalWorkspaceProps> = ({
  caseId,
  currentUser,
  onBack,
  onNavigateToBilling,
}) => {
  const [report, setReport] = useState<LegalDueDiligenceReport>(() =>
    legalStore.getOrCreateReport(caseId)
  );
  const [assignment, setAssignment] = useState<LegalAssignment | null>(() =>
    legalStore.getAssignment(caseId)
  );
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Rework notice if returned by CPA
  const isRework = report.status === 'LEGAL_REWORK';
  const isLocked = report.isLocked;

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSaveDraft = () => {
    try {
      const updated = legalStore.saveDraftReport(caseId, report);
      setReport({ ...updated });
      showNotification('Legal Due Diligence Draft saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save draft');
    }
  };

  const handleAuditDocumentView = (doc: LegalDocumentItem) => {
    legalStore.auditDocumentAccess({
      documentId: doc.id,
      documentName: doc.name,
      caseId,
      userId: currentUser.id,
      userName: currentUser.name,
      vendorId: currentUser.vendorId || 'VND-LEGAL-001',
      action: 'VIEW',
    });
    showNotification(`Audited: Opened ${doc.name} (Access logged in compliance audit vault)`);
  };

  const handleAuditDocumentDownload = (doc: LegalDocumentItem) => {
    legalStore.auditDocumentAccess({
      documentId: doc.id,
      documentName: doc.name,
      caseId,
      userId: currentUser.id,
      userName: currentUser.name,
      vendorId: currentUser.vendorId || 'VND-LEGAL-001',
      action: 'DOWNLOAD',
    });
    showNotification(`Audited: Downloaded certified copy of ${doc.name}`);
  };

  const handleSubmitFinalReport = () => {
    setSubmitError(null);

    // Validations
    if (!report.titleChainRows || report.titleChainRows.length === 0) {
      setSubmitError('Validation Failed: Title chain requires at least one registered instrument row.');
      return;
    }
    if (!report.legalOpinion?.opinion) {
      setSubmitError('Validation Failed: Final legal opinion must be selected.');
      return;
    }
    if (!report.declaration?.documentsReviewedConfirmed) {
      setSubmitError('Validation Failed: Advocate declaration checkbox is mandatory before cryptographic submission.');
      return;
    }

    try {
      const { report: submittedRep, assignment: submittedAsn, hash } = legalStore.submitLegalReport(
        caseId,
        {
          name: currentUser.name,
          role: currentUser.roleLabel || 'External Legal Advocate',
          firm: currentUser.firmName || assignment?.firmName || 'Demo Legal Associates',
          empanelmentNo: currentUser.empanelmentNumber || assignment?.empanelmentNo || 'EMP-LEG-2024-042',
        }
      );

      setReport({ ...submittedRep });
      setAssignment(submittedAsn);
      showNotification(`Legal Report submitted successfully! Cryptographic Hash: ${hash.slice(0, 16)}... Locked version V${submittedRep.version}.`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit report');
    }
  };

  const steps = [
    '1. Assignment',
    '2. Checklist',
    '3. Title Chain',
    '4. Ownership',
    '5. Dev Rights',
    '6. Encumbrance',
    '7. Litigation',
    '8. RERA / Approvals',
    '9. Exceptions',
    '10. Score & Opinion',
    '11. Documents Vault',
    '12. Preview & Sign',
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900">{report.id}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold border border-sky-200">
                {caseId}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  report.status === 'LEGAL_SUBMITTED'
                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    : isRework
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {report.status}
              </span>
              {isLocked && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1">
                  <Lock className="w-3 h-3 text-sky-400" /> Version Locked ({report.version})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {report.builderLegalName} • {report.projectName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsQueryModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>Request Input / Query CPA</span>
          </button>

          {!isLocked && (
            <button
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          )}

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Preview Report</span>
          </button>

          {!isLocked && (
            <button
              onClick={() => setActiveStep(12)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Proceed to Submit</span>
            </button>
          )}

          {report.status === 'BILLING_ELIGIBLE' && onNavigateToBilling && (
            <button
              onClick={onNavigateToBilling}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Billing Ready</span>
            </button>
          )}
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-center gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Rework Banner if returned by Bank */}
      {isRework && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-rose-900 font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>CPA Rework Notice: Version 1.0 Returned for Additional Scrutiny</span>
            </div>
            <span className="font-mono text-[10px] text-rose-700">Action Required</span>
          </div>
          <p className="text-rose-800 leading-relaxed">
            Observations from Bank Credit Ops:{' '}
            <strong>
              {assignment?.reworkObservations ||
                'Please verify the latest 2026 mutation entry regarding consortium charge carve-out and provide explicit opinion on Tower C mortgageability.'}
            </strong>
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
            <span>Original Version 1.0 has been preserved in audit ledger.</span>
            <span>•</span>
            <span>Current Editing Mode: <strong>Version 2.0 (Rework Draft)</strong></span>
          </div>
        </div>
      )}

      {/* 12-Step Horizontal Workflow Stepper */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-2 overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-1 min-w-[950px]">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCurrent = activeStep === stepNum;
            const isCompleted = activeStep > stepNum;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(stepNum)}
                className={`flex-1 py-2 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate text-center ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : isCompleted
                    ? 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-5 shadow-2xs text-xs space-y-4">
        {/* STEP 1: Assignment Particulars */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 1: Assignment Particulars & Project Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Builder Entity</span>
                <span className="font-bold text-slate-900 block mt-0.5">{report.builderLegalName}</span>
                <span className="text-[10px] text-slate-500">{report.builderPanCinGstin}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Project Name</span>
                <span className="font-bold text-slate-900 block mt-0.5">{report.projectName}</span>
                <span className="text-[10px] text-slate-500">RERA: {report.reraNumbers.join(', ')}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Site Location</span>
                <span className="font-medium text-slate-800 block mt-0.5 truncate">{report.projectAddress}</span>
                <span className="text-[10px] text-slate-500">Plot/Survey: {report.surveyPlotNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">SLA Due Date</span>
                <span className="font-bold text-sky-800 block mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  {report.slaDueDate?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500">Route: {report.legalRoute}</span>
              </div>
            </div>

            <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-sky-900 block">Phased Scope & Towers</span>
              <p className="text-slate-800">
                Phases: <strong>{report.phasesUnderReview.join(', ')}</strong> | Towers:{' '}
                <strong>{report.towersUnderReview.join(', ')}</strong> | Land Area: <strong>{report.landArea}</strong>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Document Checklist */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Section 2: Document Checklist & Title Instruments Examined
              </h3>
              <span className="text-xs text-slate-500">
                Total Documents: {report.documentsExamined?.length || 0}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Document Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Observation</th>
                    <th className="py-2 px-3 text-right">Audit & Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.documentsExamined?.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-900 block">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ref: {doc.documentRef || 'REC-REG-01'}</span>
                      </td>
                      <td className="py-2.5 px-3">{doc.category}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : doc.status === 'Missing'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{doc.observation || 'Verified on registry records.'}</td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <button
                          onClick={() => handleAuditDocumentView(doc)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAuditDocumentDownload(doc)}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: Title Chain Scrutiny */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Section 3: 30-Year Chain of Title & Flow of Devolution
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                Status: {report.titleChainStatus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Instrument</th>
                    <th className="py-2 px-3">Doc Date</th>
                    <th className="py-2 px-3">Registration No.</th>
                    <th className="py-2 px-3">Transferor (From)</th>
                    <th className="py-2 px-3">Transferee (To)</th>
                    <th className="py-2 px-3">Area Covered</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.titleChainRows?.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.instrumentType}</td>
                      <td className="py-2.5 px-3">{row.documentDate}</td>
                      <td className="py-2.5 px-3 font-mono">{row.registrationNumber}</td>
                      <td className="py-2.5 px-3">{row.transferor}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{row.transferee}</td>
                      <td className="py-2.5 px-3">{row.areaCovered}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Title Scrutiny Conclusion Summary
              </span>
              <p className="text-slate-800 leading-relaxed text-xs">{report.titleChainSummary}</p>
            </div>
          </div>
        )}

        {/* STEP 4: Ownership Verification */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 4: Ownership Verification & Land Record Matching
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Current Verified Legal Owner
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {report.ownershipVerification?.currentLegalOwner}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400">Ownership Nature:</span>
                    <span className="font-semibold block">{report.ownershipVerification?.ownershipNature}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Survey Match:</span>
                    <span className="font-semibold text-emerald-700 block">
                      {report.ownershipVerification?.surveyMatch}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Area & Boundary Verification
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Area Match:</span>
                    <span className="font-semibold text-emerald-700 block">
                      {report.ownershipVerification?.areaMatch}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Boundary Match:</span>
                    <span className="font-semibold text-emerald-700 block">
                      {report.ownershipVerification?.boundaryMatch}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                  {report.ownershipVerification?.observation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Development Rights */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 5: Development Agreement (DA) & Power of Attorney (POA) Scrutiny
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">DA Availability</span>
                <span className="font-bold text-emerald-700 block">
                  {report.developmentRights?.daAvailable}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Power of Attorney Status</span>
                <span className="font-bold text-emerald-700 block">
                  {report.developmentRights?.poaStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Development Rights Status</span>
                <span className="font-bold text-emerald-700 block">
                  {report.developmentRights?.developmentRightsStatus}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Development Mandate Summary
              </span>
              <p className="text-slate-800 leading-relaxed text-xs">{report.developmentRights?.summary}</p>
            </div>
          </div>
        )}

        {/* STEP 6: Encumbrance & Charges */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Section 6: Encumbrance, Mortgage Charges & CERSAI / MCA Scrutiny
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                Encumbrance: {report.encumbrancePresent}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <p className="text-slate-800 leading-relaxed text-xs">{report.encumbranceSummary}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Sub-Registrar 30-Year Search: <strong>Nil Adverse Entries</strong></span>
                <span>•</span>
                <span>MCA Company Index: <strong>Clean Release</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Litigation */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Section 7: Judicial Litigation, E-Courts & MahaRERA Search
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                Litigation: {report.litigationPresent}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <p className="text-slate-800 leading-relaxed text-xs">{report.litigationSummary}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <span>District Court Pune: <strong>No Injunction</strong></span>
                <span>•</span>
                <span>Bombay High Court: <strong>No Pending Appeals</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: RERA & Approvals */}
        {activeStep === 8 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 8: MahaRERA Consistency & Sanctioned Plan Approvals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Promoter Name Match</span>
                <span className="font-bold text-emerald-700 block">
                  {report.reraApprovalConsistency?.promoterNameMatch}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Project Name Match</span>
                <span className="font-bold text-emerald-700 block">
                  {report.reraApprovalConsistency?.projectNameMatch}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">RERA Legal Status</span>
                <span className="font-bold text-emerald-700 block">
                  {report.reraApprovalConsistency?.reraLegalStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Sanction Plan Match</span>
                <span className="font-bold text-emerald-700 block">
                  {report.reraApprovalConsistency?.sanctionedPlanConsistent}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Exceptions & Conditions */}
        {activeStep === 9 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 9: Legal Exceptions & Pre-Disbursement Covenants
            </h3>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-800 block">
                Standard Bank Legal Conditions
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {report.conditions?.map((cond, idx) => (
                  <div key={cond.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {idx + 1}. {cond.conditionText}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Due: {cond.dueStage} • Owner: {cond.owner} • Status: {cond.status}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      {cond.mandatoryOrAdvisory}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 10: Legal Score & Final Opinion */}
        {activeStep === 10 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 10: Algorithmic Legal Scorecard & Final Advocate Opinion
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Weighted Legal Score</span>
                  <span className="text-xl font-bold text-sky-700">
                    {report.legalScore?.finalLegalScore || 92} / 100
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Ownership Scrutiny (25%):</span>
                    <span className="font-semibold text-slate-900">{report.legalScore?.ownershipScore || 92}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30-Year Title Chain (25%):</span>
                    <span className="font-semibold text-slate-900">{report.legalScore?.titleChainScore || 90}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Development Rights (20%):</span>
                    <span className="font-semibold text-slate-900">{report.legalScore?.developmentRightsScore || 92}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encumbrance Verification (15%):</span>
                    <span className="font-semibold text-slate-900">{report.legalScore?.encumbranceScore || 95}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Litigation Scrutiny (10%):</span>
                    <span className="font-semibold text-slate-900">{report.legalScore?.litigationScore || 95}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Final Legal Scrutiny Opinion <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={isLocked}
                    value={report.legalOpinion?.opinion || 'Clear'}
                    onChange={(e) => {
                      const op = e.target.value as LegalOpinionType;
                      setReport({
                        ...report,
                        legalOpinion: {
                          ...report.legalOpinion,
                          opinion: op,
                        },
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-xs bg-white"
                  >
                    <option value="Clear">Clear (Recommended for APF Sanction)</option>
                    <option value="Conditional Clear">Conditional Clear (Pre-Disbursement Covenants)</option>
                    <option value="Rejected">Rejected (Defective Title / Adverse Charge)</option>
                    <option value="Refer / Escalate">Refer / Escalate to Senior Credit Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Advocate Recommendations for Bank Sanction
                  </label>
                  <textarea
                    rows={3}
                    disabled={isLocked}
                    value={report.legalOpinion?.recommendations || ''}
                    onChange={(e) =>
                      setReport({
                        ...report,
                        legalOpinion: {
                          ...report.legalOpinion,
                          recommendations: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 11: Documents & Evidence Vault */}
        {activeStep === 11 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 11: Restricted Legal Document Vault & Audited Evidence
            </h3>

            <p className="text-slate-600 text-xs">
              Every document view or download is cryptographically tracked in accordance with Bank Legal Firewall Policy.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {report.documentsExamined?.map((doc) => (
                <div key={doc.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Category: {doc.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAuditDocumentView(doc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                    >
                      View Audited
                    </button>
                    <button
                      onClick={() => handleAuditDocumentDownload(doc)}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 12: Preview & Sign */}
        {activeStep === 12 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Section 12: Final Reviewer Declaration & Cryptographic Submission
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Counsel Name</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Empanelled Firm</span>
                  <span className="font-bold text-slate-900">{currentUser.firmName || assignment?.firmName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Empanelment No</span>
                  <span className="font-mono text-slate-800">{assignment?.empanelmentNo || 'EMP-LEG-2024-042'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Report Version</span>
                  <span className="font-mono font-bold text-sky-700">{report.version}</span>
                </div>
              </div>

              {!isLocked ? (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={report.declaration?.documentsReviewedConfirmed || false}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          declaration: {
                            ...report.declaration,
                            documentsReviewedConfirmed: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I solemnly affirm that I have examined the 30-year title instruments, development agreements, MahaRERA filings, and local Sub-Registrar records. This Legal Due Diligence Opinion reflects true and independent scrutiny under Bar Council norms.
                    </span>
                  </label>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSubmitFinalReport}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Lock & Digitally Submit Legal Report</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Report Cryptographically Sealed & Submitted</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-600 truncate">
                    Hash: {report.reportHash || 'SHA256:d8a9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Current Owner: <strong>Bank Credit Processing Associate (CPA)</strong>. Awaiting CPA acceptance or query.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Query Modal */}
      <LegalQueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        caseId={caseId}
        reviewId={report.id}
        vendorId={currentUser.vendorId || assignment?.vendorId}
        currentUser={currentUser}
        onQueryUpdated={() => {
          showNotification('Query registered and dispatched to Bank CPA desk.');
        }}
      />

      {/* Report Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-3xl w-full p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  APF Legal Due Diligence & Title Scrutiny Docket Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-serif text-slate-800 leading-relaxed text-xs p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-center font-bold text-sm text-slate-900">
                PROVAL APF TITLE SCRUTINY & DUE DILIGENCE REPORT
              </div>
              <div className="text-center text-[10px] font-mono text-slate-500">
                REPORT REF: {report.id} | DOCKET: {caseId} | DATE: {report.reportDate}
              </div>

              <div className="pt-2 text-xs space-y-1">
                <div><strong>1. DEVELOPER / APPLICANT:</strong> {report.builderLegalName}</div>
                <div><strong>2. PROJECT NAME:</strong> {report.projectName}</div>
                <div><strong>3. SITE ADDRESS & SURVEY:</strong> {report.projectAddress} (Survey: {report.surveyPlotNumber})</div>
                <div><strong>4. MAHARERA NUMBER:</strong> {report.reraNumbers.join(', ')}</div>
                <div><strong>5. VERIFIED CURRENT OWNER:</strong> {report.ownershipVerification?.currentLegalOwner}</div>
                <div><strong>6. TITLE CHAIN CONCLUSION:</strong> {report.titleChainSummary}</div>
                <div><strong>7. DEVELOPMENT RIGHTS:</strong> {report.developmentRights?.summary}</div>
                <div><strong>8. ENCUMBRANCES:</strong> {report.encumbranceSummary}</div>
                <div><strong>9. LITIGATION:</strong> {report.litigationSummary}</div>
                <div><strong>10. FINAL LEGAL OPINION:</strong> <span className="font-bold text-emerald-800 uppercase">{report.legalOpinion?.opinion}</span></div>
                <div><strong>11. RECOMMENDATIONS:</strong> {report.legalOpinion?.recommendations}</div>
                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                  <strong>SCRUTINIZED BY:</strong> {currentUser.name} • {currentUser.firmName || assignment?.firmName} (Empanelment #{assignment?.empanelmentNo || 'EMP-LEG-2024-042'})
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
