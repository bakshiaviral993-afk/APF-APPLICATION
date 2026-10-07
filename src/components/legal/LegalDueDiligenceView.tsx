import React, { useState, useEffect } from 'react';
import {
  LegalDueDiligenceReport,
  TitleChainRow,
  EncumbranceItem,
  LitigationItem,
  LegalExceptionItem,
  LegalConditionItem,
  TitleChainRowStatus,
} from '../../types/legalDueDiligence';
import { UserAccount } from '../../types/apfTransaction';
import { legalStore } from '../../services/legalStore';
import { LegalHeaderRibbon } from './LegalHeaderRibbon';
import { LegalInitiateNoticeCard } from './LegalInitiateNoticeCard';
import { LegalKpiStatsBar } from './LegalKpiStatsBar';
import { LegalSectionTabs, LegalModuleId } from './LegalSectionTabs';
import { LegalAssignmentSection } from './LegalAssignmentSection';
import { LegalDocumentsSection } from './LegalDocumentsSection';
import { LegalLandTitleSection } from './LegalLandTitleSection';
import { LegalDevRightsEncumbranceSection } from './LegalDevRightsEncumbranceSection';
import { LegalLitigationReraSection } from './LegalLitigationReraSection';
import { LegalExceptionsConditionsSection } from './LegalExceptionsConditionsSection';
import { LegalScoringOpinionSection } from './LegalScoringOpinionSection';
import { LegalValuationSection } from './LegalValuationSection';
import { LegalReportDocModal } from './LegalReportDocModal';
import { InitiateLegalVerificationModal } from './InitiateLegalVerificationModal';
import {
  downloadLegalValuationReport,
  downloadValuationSummaryJson,
} from '../../utils/legalValuationExporter';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  FileText,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface LegalDueDiligenceViewProps {
  caseId: string;
  currentUser: UserAccount;
  caseData?: any;
  builderData?: any;
  projectData?: any;
  onRaiseQuery?: (category: string, subject: string) => void;
  onNavigateToExposure?: () => void;
}

export const LegalDueDiligenceView: React.FC<LegalDueDiligenceViewProps> = ({
  caseId,
  currentUser,
  caseData,
  builderData,
  projectData,
  onRaiseQuery,
  onNavigateToExposure,
}) => {
  const [report, setReport] = useState<LegalDueDiligenceReport | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [activeModule, setActiveModule] = useState<LegalModuleId>('MODULE_1');
  const [activeSection, setActiveSection] = useState<string>('ALL_MOD_1');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (secKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secKey]: !prev[secKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedSections({});
  };

  const handleCollapseAll = () => {
    setCollapsedSections({
      SEC_1_2: true,
      SEC_3: true,
      SEC_4_5: true,
      SEC_6_7: true,
      SEC_8_9: true,
      SEC_10_11: true,
      SEC_12_14: true,
      SEC_VALUATION: false,
    });
  };

  const handleDownloadReport = () => {
    if (report) {
      downloadLegalValuationReport(report, caseData);
    }
  };

  // Form states for adding items
  const [newTitleRow, setNewTitleRow] = useState<Partial<TitleChainRow>>({
    instrumentType: 'Sale Deed',
    documentDate: '',
    registrationNumber: '',
    transferor: '',
    transferee: '',
    surveyRef: '',
    areaCovered: '',
    status: 'Verified',
    observation: '',
  });

  const [newEncumbrance, setNewEncumbrance] = useState<Partial<EncumbranceItem>>({
    type: 'Mortgage',
    chargeHolder: '',
    chargeAmountCr: 0,
    creationDate: '',
    propertyAffected: '',
    releaseStatus: 'Release Pending',
    nocRequired: 'Yes',
    severity: 'Medium',
  });

  const [newLitigation, setNewLitigation] = useState<Partial<LitigationItem>>({
    caseType: 'Civil',
    court: '',
    caseNumber: '',
    parties: '',
    subject: '',
    currentStatus: 'Pending',
    projectImpact: 'Limited',
    severity: 'Low',
  });

  const [newException, setNewException] = useState<Partial<LegalExceptionItem>>({
    category: 'Encumbrance',
    observation: '',
    severity: 'Medium',
    blocking: false,
    requiredAction: '',
    owner: 'CPA',
    dueStage: 'Pre-Disbursement',
    status: 'Open',
  });

  const [newCondition, setNewCondition] = useState<Partial<LegalConditionItem>>({
    conditionText: '',
    conditionType: 'Pre-Disbursement',
    owner: 'Operations',
    dueStage: 'Pre-Disbursement',
    dueDate: '',
    mandatoryOrAdvisory: 'Mandatory',
    status: 'Open',
  });

  // Modal open states for sub-items
  const [showAddTitleModal, setShowAddTitleModal] = useState(false);
  const [showAddEncModal, setShowAddEncModal] = useState(false);
  const [showAddLitModal, setShowAddLitModal] = useState(false);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [showAddCondModal, setShowAddCondModal] = useState(false);

  useEffect(() => {
    const load = () => {
      const r = legalStore.getOrCreateReport(caseId, caseData, builderData, projectData);
      setReport(JSON.parse(JSON.stringify(r)));
    };
    load();

    const unsub = legalStore.subscribe(load);
    return unsub;
  }, [caseId, caseData, builderData, projectData]);

  if (!report) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p className="font-semibold text-slate-700">Loading Legal Due Diligence Dossier...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving 30-year search records and statutory approval checks.</p>
      </div>
    );
  }

  const isLocked = Boolean(report.isLocked);

  const handleUpdate = (updatedReport: LegalDueDiligenceReport) => {
    setReport(updatedReport);
    legalStore.saveReport(updatedReport);
  };

  const handleUnlock = () => {
    try {
      const unlocked = legalStore.unlockReport(caseId, 'Reviewer edit session initiated');
      setReport(JSON.parse(JSON.stringify(unlocked)));
      setIsEditing(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveDraft = () => {
    if (report) {
      legalStore.saveReport(report);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    }
  };

  const handleSignAndLock = () => {
    try {
      const signed = legalStore.lockAndSignReport(
        caseId,
        currentUser.name,
        currentUser.roleLabel || currentUser.role,
        currentUser.agencyOrDept || 'Legal Counsel Bureau'
      );
      setReport(JSON.parse(JSON.stringify(signed)));
      setShowSignModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Row Handlers
  const handleAddTitleRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleRow.transferor || !newTitleRow.transferee) {
      alert('Please provide transferor and transferee names.');
      return;
    }
    const count = (report.titleChainRows?.length || 0) + 1;
    legalStore.addTitleChainRow(caseId, {
      seqNo: count,
      instrumentType: (newTitleRow.instrumentType as any) || 'Sale Deed',
      documentDate: newTitleRow.documentDate || new Date().toISOString().split('T')[0],
      registrationNumber: newTitleRow.registrationNumber || 'Doc Reg Under Process',
      transferor: newTitleRow.transferor,
      transferee: newTitleRow.transferee,
      surveyRef: newTitleRow.surveyRef || report.surveyPlotNumber,
      areaCovered: newTitleRow.areaCovered || report.landArea,
      status: (newTitleRow.status as TitleChainRowStatus) || 'Verified',
      observation: newTitleRow.observation || 'Verified registered instrument',
    });
    setShowAddTitleModal(false);
    setNewTitleRow({
      instrumentType: 'Sale Deed',
      documentDate: '',
      registrationNumber: '',
      transferor: '',
      transferee: '',
      surveyRef: '',
      areaCovered: '',
      status: 'Verified',
      observation: '',
    });
  };

  const handleAddEncumbrance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncumbrance.chargeHolder || !newEncumbrance.chargeAmountCr) {
      alert('Please fill in charge holder and amount.');
      return;
    }
    legalStore.addEncumbrance(caseId, {
      type: (newEncumbrance.type as any) || 'Mortgage',
      chargeHolder: newEncumbrance.chargeHolder,
      chargeAmountCr: Number(newEncumbrance.chargeAmountCr),
      creationDate: newEncumbrance.creationDate || new Date().toISOString().split('T')[0],
      propertyAffected: newEncumbrance.propertyAffected || report.projectName,
      releaseStatus: (newEncumbrance.releaseStatus as any) || 'Release Pending',
      nocRequired: (newEncumbrance.nocRequired as any) || 'Yes',
      severity: (newEncumbrance.severity as any) || 'Medium',
      sourceDoc: 'Lender Charge Record',
      reconciledWithExposure: true,
    });
    setShowAddEncModal(false);
    setNewEncumbrance({
      type: 'Mortgage',
      chargeHolder: '',
      chargeAmountCr: 0,
      creationDate: '',
      propertyAffected: '',
      releaseStatus: 'Release Pending',
      nocRequired: 'Yes',
      severity: 'Medium',
    });
  };

  const handleAddLitigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLitigation.court || !newLitigation.caseNumber) {
      alert('Please provide court and case number.');
      return;
    }
    legalStore.addLitigation(caseId, {
      caseType: (newLitigation.caseType as any) || 'Civil',
      court: newLitigation.court,
      caseNumber: newLitigation.caseNumber,
      parties: newLitigation.parties || 'Dispute Parties',
      subject: newLitigation.subject || 'Boundary/Title dispute',
      currentStatus: (newLitigation.currentStatus as any) || 'Pending',
      projectImpact: (newLitigation.projectImpact as any) || 'Limited',
      severity: (newLitigation.severity as any) || 'Low',
    });
    setShowAddLitModal(false);
    setNewLitigation({
      caseType: 'Civil',
      court: '',
      caseNumber: '',
      parties: '',
      subject: '',
      currentStatus: 'Pending',
      projectImpact: 'Limited',
      severity: 'Low',
    });
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newException.observation) {
      alert('Please provide exception observation.');
      return;
    }
    legalStore.addException(caseId, {
      category: (newException.category as any) || 'Encumbrance',
      observation: newException.observation,
      severity: (newException.severity as any) || 'Medium',
      blocking: Boolean(newException.blocking),
      requiredAction: newException.requiredAction || 'Clarification required from developer',
      owner: (newException.owner as any) || 'CPA',
      dueStage: (newException.dueStage as any) || 'Pre-Disbursement',
      status: 'Open',
    });
    setShowAddExModal(false);
    setNewException({
      category: 'Encumbrance',
      observation: '',
      severity: 'Medium',
      blocking: false,
      requiredAction: '',
      owner: 'CPA',
      dueStage: 'Pre-Disbursement',
      status: 'Open',
    });
  };

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.conditionText) {
      alert('Please specify condition text.');
      return;
    }
    legalStore.addCondition(caseId, {
      conditionText: newCondition.conditionText,
      conditionType: (newCondition.conditionType as any) || 'Pre-Disbursement',
      owner: (newCondition.owner as any) || 'Operations',
      dueStage: (newCondition.dueStage as any) || 'Pre-Disbursement',
      dueDate:
        newCondition.dueDate ||
        new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      mandatoryOrAdvisory: (newCondition.mandatoryOrAdvisory as any) || 'Mandatory',
      status: 'Open',
    });
    setShowAddCondModal(false);
    setNewCondition({
      conditionText: '',
      conditionType: 'Pre-Disbursement',
      owner: 'Operations',
      dueStage: 'Pre-Disbursement',
      dueDate: '',
      mandatoryOrAdvisory: 'Mandatory',
      status: 'Open',
    });
  };

  return (
    <div className="space-y-3">
      {/* 1. Legal Action Header Ribbon with Standout "Initiate Legal Verification" & "Download" */}
      <LegalHeaderRibbon
        report={report}
        currentUser={currentUser}
        isLocked={isLocked}
        isEditing={isEditing}
        onInitiateVerification={() => setShowInitiateModal(true)}
        onUnlock={handleUnlock}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSaveDraft={handleSaveDraft}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        onOpenSignModal={() => setShowSignModal(true)}
        onDownloadReport={handleDownloadReport}
        onRaiseQuery={onRaiseQuery}
      />

      {/* 2. Compact Status Callout if Verification is Pending or Locked */}
      <LegalInitiateNoticeCard
        report={report}
        isLocked={isLocked}
        isEditing={isEditing}
        onInitiateVerification={() => setShowInitiateModal(true)}
        onUnlock={handleUnlock}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />

      {/* 3. Save Success Notice Banner */}
      {saveSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Legal Due Diligence Draft saved successfully to repository.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            Calculated score: {report.legalScore?.finalLegalScore}/100
          </span>
        </div>
      )}

      {/* 4. KPI Stats Bar: Uniform 7-card grid with fixed height & Valuation KPI */}
      <LegalKpiStatsBar
        report={report}
        onDownloadReport={handleDownloadReport}
        onSelectValuation={() => {
          setActiveModule('MODULE_2');
          setActiveSection('SEC_VALUATION');
        }}
      />

      {/* 5. 2-Module Segmented Navigation Bar */}
      <div>
        <LegalSectionTabs
          activeModule={activeModule}
          onChangeModule={(mod) => {
            setActiveModule(mod);
            if (mod === 'MODULE_1') setActiveSection('ALL_MOD_1');
            else if (mod === 'MODULE_2') setActiveSection('ALL_MOD_2');
            else setActiveSection('ALL');
          }}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          report={report}
        />
      </div>

      {/* Full Dossier View Controls for Scroll Reduction */}
      {activeModule === 'ALL' && (
        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>Continuous Audit Dossier: Showing all 15 statutory sections</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCollapseAll}
              title="Collapse all sections to 1-line summary bars to avoid scrolling"
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronUp className="w-3 h-3 text-slate-500" />
              <span>Collapse All</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand all sections"
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span>Expand All</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleDownloadReport}
              title="Download formal Legal & Valuation Report (HTML / PDF)"
              className="px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Structured Sections Grids */}
      <div className="space-y-2.5">
        {/* ========================================================
            MODULE 1 (PAGE 1): Title & Statutory Verification
            Sections 1 through 9
        ======================================================== */}
        {(activeModule === 'MODULE_1' || activeModule === 'ALL') && (
          <>
            {/* Section 1 & 2: Assignment & Builder Particulars */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_1' || activeSection === 'SEC_1_2') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_1_2'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_1_2')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        1-2
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Assignment & Builder Master Particulars
                      </span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {report.builderLegalName} • {report.surveyPlotNumber}
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalAssignmentSection
                    report={report}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                  />
                )}
              </div>
            )}

            {/* Section 3: Documents Examined */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_1' || activeSection === 'SEC_3') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_3'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_3')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        3
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Documents Examined Checklist (12 Categories)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {report.documentsExamined?.filter((d) => d.status === 'Available').length || 11} / 12 Verified
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalDocumentsSection
                    report={report}
                    caseId={caseId}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onRaiseQuery={onRaiseQuery}
                    onOpenDocModal={() => setIsDocModalOpen(true)}
                  />
                )}
              </div>
            )}

            {/* Section 4 & 5: Land Particulars & Title Chain */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_1' || activeSection === 'SEC_4_5') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_4_5'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_4_5')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        4-5
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Land Particulars & 30-Year Chain of Title
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {report.titleChainStatus} ({report.titleChainRows?.length || 0} Instruments)
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalLandTitleSection
                    report={report}
                    caseId={caseId}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onOpenAddTitleModal={() => setShowAddTitleModal(true)}
                  />
                )}
              </div>
            )}

            {/* Section 6 & 7: Development Rights & Encumbrances */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_1' || activeSection === 'SEC_6_7') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_6_7'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_6_7')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        6-7
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Development Rights & Encumbrance Charges
                      </span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {report.developmentRights?.developmentRightsStatus || 'Clear'} • {report.encumbrances?.length || 0} Charges
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalDevRightsEncumbranceSection
                    report={report}
                    caseId={caseId}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onOpenAddEncModal={() => setShowAddEncModal(true)}
                  />
                )}
              </div>
            )}

            {/* Section 8 & 9: Litigation & RERA Verification */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_1' || activeSection === 'SEC_8_9') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_8_9'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_8_9')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        8-9
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Litigation & RERA Approval Consistency
                      </span>
                      <span className="text-[10px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {report.litigations?.length || 0} Suits • RERA {report.reraApprovalConsistency?.reraLegalStatus || 'Clear'}
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalLitigationReraSection
                    report={report}
                    caseId={caseId}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onOpenAddLitModal={() => setShowAddLitModal(true)}
                  />
                )}
              </div>
            )}

            {/* Workflow Transition Card: Bottom of Module 1 */}
            {activeModule === 'MODULE_1' && (
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Module 1 (Title Verification & Scrutiny) Reviewed</div>
                    <div className="text-[11px] text-slate-500">
                      All 9 title instruments, documents examined, encumbrance charges, and litigation checked.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModule('MODULE_2');
                      setActiveSection('ALL_MOD_2');
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed to Page 2: Risk Scoring & Valuation</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================
            MODULE 2 (PAGE 2): Risk Scoring, Valuation & Clearance
            Sections 15, 10-11, 12-14
        ======================================================== */}
        {(activeModule === 'MODULE_2' || activeModule === 'ALL') && (
          <>
            {/* Section 15: Legal Title & Asset Valuation Clearance */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_2' || activeSection === 'SEC_VALUATION') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_VALUATION'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_VALUATION')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        15
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Legal Title & Asset Valuation Clearance
                      </span>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        FMV ₹{(report.valuationAlignment?.fairMarketValueCr || 244.8).toFixed(1)} Cr • Rate ₹{(report.valuationAlignment?.adoptedBaseRateSqFt || 7200).toLocaleString()}/sf
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalValuationSection
                    report={report}
                    caseData={caseData}
                    onOpenDocModal={() => setIsDocModalOpen(true)}
                  />
                )}
              </div>
            )}

            {/* Section 10 & 11: Legal Exceptions & Conditions */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_2' || activeSection === 'SEC_10_11') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_10_11'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_10_11')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        10-11
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Legal Exceptions & Pre-Disbursement Conditions
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        0 Blocking • {report.conditions?.length || 0} Conditions
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalExceptionsConditionsSection
                    report={report}
                    caseId={caseId}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onOpenAddExModal={() => setShowAddExModal(true)}
                    onOpenAddCondModal={() => setShowAddCondModal(true)}
                  />
                )}
              </div>
            )}

            {/* Section 12, 13 & 14: Score, Opinion & Sign-off */}
            {(activeSection === 'ALL' || activeSection === 'ALL_MOD_2' || activeSection === 'SEC_12_14') && (
              <div>
                {activeModule === 'ALL' && collapsedSections['SEC_12_14'] ? (
                  <div
                    onClick={() => toggleSectionCollapse('SEC_12_14')}
                    className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                        12-14
                      </span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Component Scoring, Formal Opinion & Reviewer Sign-off
                      </span>
                      <span className="text-[10px] font-mono text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                        Score: {report.legalScore?.finalLegalScore || 0}/100 • {report.legalOpinion?.opinion}
                      </span>
                    </div>
                    <button type="button" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer">
                      <span>Expand</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <LegalScoringOpinionSection
                    report={report}
                    currentUser={currentUser}
                    isLocked={isLocked}
                    isEditing={isEditing}
                    onUpdate={handleUpdate}
                    onOpenSignModal={() => setShowSignModal(true)}
                  />
                )}
              </div>
            )}

            {/* Workflow Transition Card: Bottom of Module 2 */}
            {activeModule === 'MODULE_2' && (
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('MODULE_1');
                    setActiveSection('ALL_MOD_1');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Page 1: Title Verification</span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Legal & Valuation Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDocModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Formal Docket</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: Formal Document Modal (Print / Export View) */}
      {isDocModalOpen && (
        <LegalReportDocModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          report={report}
          caseData={caseData}
        />
      )}

      {/* MODAL 2: Initiate Legal Verification Modal */}
      {showInitiateModal && (
        <InitiateLegalVerificationModal
          isOpen={showInitiateModal}
          onClose={() => setShowInitiateModal(false)}
          caseId={caseId}
          caseData={caseData}
          builderData={builderData}
          projectData={projectData}
          currentReport={report}
          onSuccess={(updatedReport) => {
            setReport(updatedReport);
            setIsEditing(true);
            setSaveSuccessNotice(true);
            setTimeout(() => setSaveSuccessNotice(false), 3000);
          }}
        />
      )}

      {/* MODAL 3: Digital Sign & Lock Confirmation Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lock & Sign Legal Report</h3>
                <p className="text-xs text-slate-500">Tamper-proof cryptographic seal on Case {caseId}</p>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Notice of Legal Finality:</p>
              <p className="leading-relaxed">
                Signing this APF Legal Due Diligence Report will lock all 15 sections, generate an immutable SHA-256 report hash, and stamp your digital credentials into the core audit log.
              </p>
            </div>

            <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Reviewer:</span>
                <strong className="text-slate-900 font-bold">{currentUser.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role / Authority:</span>
                <strong className="text-slate-900 font-bold">{currentUser.roleLabel || currentUser.role}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empanelment No:</span>
                <strong className="text-slate-900 font-mono">{report.empanelmentNo}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignAndLock}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Sign Docket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Title Row Modal */}
      {showAddTitleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddTitleRow}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Title Chain Instrument</h3>
              <button
                type="button"
                onClick={() => setShowAddTitleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Instrument Type
                </label>
                <select
                  value={newTitleRow.instrumentType}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, instrumentType: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Sale Deed">Sale Deed</option>
                  <option value="Conveyance">Conveyance Deed</option>
                  <option value="Development Agreement">Development Agreement</option>
                  <option value="POA">Power of Attorney</option>
                  <option value="Gift Deed">Gift Deed</option>
                  <option value="Release Deed">Release Deed</option>
                  <option value="Partition Deed">Partition Deed</option>
                  <option value="Other">Other Instrument</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Document Date
                </label>
                <input
                  type="date"
                  required
                  value={newTitleRow.documentDate}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, documentDate: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Registration / Doc Number
                </label>
                <input
                  type="text"
                  placeholder="Doc No. 4102/2018 Sub-Registrar Haveli"
                  value={newTitleRow.registrationNumber}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, registrationNumber: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Transferor / Executant
                </label>
                <input
                  type="text"
                  required
                  placeholder="Transferor name"
                  value={newTitleRow.transferor}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, transferor: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Transferee / Beneficiary
                </label>
                <input
                  type="text"
                  required
                  placeholder="Transferee name"
                  value={newTitleRow.transferee}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, transferee: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Survey Reference
                </label>
                <input
                  type="text"
                  value={newTitleRow.surveyRef}
                  placeholder={report.surveyPlotNumber}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, surveyRef: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Status
                </label>
                <select
                  value={newTitleRow.status}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, status: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Verified">Verified</option>
                  <option value="Verified with Observation">Verified with Observation</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Defective">Defective</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Legal Observation
                </label>
                <input
                  type="text"
                  placeholder="Observation on execution, stamp duty, mutation"
                  value={newTitleRow.observation}
                  onChange={(e) =>
                    setNewTitleRow({ ...newTitleRow, observation: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddTitleModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Deed
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: Add Encumbrance Modal */}
      {showAddEncModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEncumbrance}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Encumbrance / Charge</h3>
              <button
                type="button"
                onClick={() => setShowAddEncModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Charge Type
                </label>
                <select
                  value={newEncumbrance.type}
                  onChange={(e) =>
                    setNewEncumbrance({ ...newEncumbrance, type: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Mortgage">Mortgage</option>
                  <option value="Charge">Charge</option>
                  <option value="Lien">Lien</option>
                  <option value="Court Attachment">Court Attachment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Amount (₹ Cr)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="75.00"
                  value={newEncumbrance.chargeAmountCr || ''}
                  onChange={(e) =>
                    setNewEncumbrance({
                      ...newEncumbrance,
                      chargeAmountCr: Number(e.target.value),
                    })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Charge Holder / Lender
                </label>
                <input
                  type="text"
                  required
                  placeholder="HDFC Bank Limited / State Bank of India"
                  value={newEncumbrance.chargeHolder}
                  onChange={(e) =>
                    setNewEncumbrance({ ...newEncumbrance, chargeHolder: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Release / NOC Status
                </label>
                <select
                  value={newEncumbrance.releaseStatus}
                  onChange={(e) =>
                    setNewEncumbrance({
                      ...newEncumbrance,
                      releaseStatus: e.target.value as any,
                    })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="NOC Available">NOC Available</option>
                  <option value="Release Pending">Release Pending</option>
                  <option value="Satisfied">Satisfied</option>
                  <option value="Open">Open</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Severity
                </label>
                <select
                  value={newEncumbrance.severity}
                  onChange={(e) =>
                    setNewEncumbrance({ ...newEncumbrance, severity: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddEncModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Charge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: Add Litigation Modal */}
      {showAddLitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddLitigation}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Litigation / Dispute</h3>
              <button
                type="button"
                onClick={() => setShowAddLitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Case Type
                </label>
                <select
                  value={newLitigation.caseType}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, caseType: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Civil">Civil Suit</option>
                  <option value="RERA">MahaRERA Complaint</option>
                  <option value="Consumer">Consumer Dispute</option>
                  <option value="NCLT">NCLT / Insolvency</option>
                  <option value="Revenue">Revenue Appeal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Court / Forum
                </label>
                <input
                  type="text"
                  required
                  placeholder="Civil Court Pune / High Court of Bombay"
                  value={newLitigation.court}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, court: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Case Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Special Civil Suit 418/2024"
                  value={newLitigation.caseNumber}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, caseNumber: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Parties
                </label>
                <input
                  type="text"
                  placeholder="Plaintiff vs Defendant"
                  value={newLitigation.parties}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, parties: e.target.value })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Project Impact
                </label>
                <select
                  value={newLitigation.projectImpact}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, projectImpact: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="None">None</option>
                  <option value="Limited">Limited</option>
                  <option value="Material">Material</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Severity
                </label>
                <select
                  value={newLitigation.severity}
                  onChange={(e) =>
                    setNewLitigation({ ...newLitigation, severity: e.target.value as any })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddLitModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Lawsuit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: Add Exception Modal */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddException}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Raise Legal Exception</h3>
              <button
                type="button"
                onClick={() => setShowAddExModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newException.category}
                    onChange={(e) =>
                      setNewException({ ...newException, category: e.target.value as any })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Ownership">Ownership</option>
                    <option value="Title">Title Chain</option>
                    <option value="Development Rights">Development Rights</option>
                    <option value="Encumbrance">Encumbrance</option>
                    <option value="Litigation">Litigation</option>
                    <option value="RERA">RERA</option>
                    <option value="Approval">Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Severity
                  </label>
                  <select
                    value={newException.severity}
                    onChange={(e) =>
                      setNewException({ ...newException, severity: e.target.value as any })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Observation / Deficiency
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail the specific deficiency or exception..."
                  value={newException.observation}
                  onChange={(e) =>
                    setNewException({ ...newException, observation: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  id="blocking"
                  checked={Boolean(newException.blocking)}
                  onChange={(e) =>
                    setNewException({ ...newException, blocking: e.target.checked })
                  }
                  className="text-rose-600 rounded w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Is this a Blocking Exception? (Prevents APF clear until resolved)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Required Action
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Furnish lender NOC"
                    value={newException.requiredAction}
                    onChange={(e) =>
                      setNewException({ ...newException, requiredAction: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Owner
                  </label>
                  <select
                    value={newException.owner}
                    onChange={(e) =>
                      setNewException({ ...newException, owner: e.target.value as any })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CPA">CPA</option>
                    <option value="Builder">Builder</option>
                    <option value="Legal">Legal Counsel</option>
                    <option value="COM">COM</option>
                    <option value="Valuer">Valuer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddExModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Exception
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 8: Add Condition Modal */}
      {showAddCondModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCondition}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Legal Condition</h3>
              <button
                type="button"
                onClick={() => setShowAddCondModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                  Condition Text
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify legal condition / undertaking required..."
                  value={newCondition.conditionText}
                  onChange={(e) =>
                    setNewCondition({ ...newCondition, conditionText: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Condition Type
                  </label>
                  <select
                    value={newCondition.conditionType}
                    onChange={(e) =>
                      setNewCondition({
                        ...newCondition,
                        conditionType: e.target.value as any,
                      })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Pre-Approval">Pre-Approval</option>
                    <option value="Pre-Disbursement">Pre-Disbursement</option>
                    <option value="Post-Disbursement">Post-Disbursement</option>
                    <option value="Monitoring">Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold uppercase mb-1">
                    Owner
                  </label>
                  <select
                    value={newCondition.owner}
                    onChange={(e) =>
                      setNewCondition({ ...newCondition, owner: e.target.value as any })
                    }
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Operations">Operations Cell</option>
                    <option value="Builder">Builder</option>
                    <option value="Legal">Legal Counsel</option>
                    <option value="CPA">CPA</option>
                    <option value="COM">COM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddCondModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Condition
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
