import React, { useState } from 'react';
import {
  LegalRoute,
  LegalRequestType,
  LegalScopeType,
  LegalDueDiligenceReport,
} from '../../types/legalDueDiligence';
import { LEGAL_EMPANELMENT_MASTER } from '../../data/legalMasterData';
import { legalStore } from '../../services/legalStore';
import {
  Scale,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  Send,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

interface InitiateLegalVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseData?: any;
  builderData?: any;
  projectData?: any;
  currentReport?: LegalDueDiligenceReport | null;
  onSuccess: (updatedReport: LegalDueDiligenceReport) => void;
}

const DEFAULT_DOCKET_DOCS = [
  '30-Year Title Search & Non-Encumbrance Certificate (NEC)',
  'Mother Title Deeds & Registered Sale Deeds (1994-2018)',
  'Latest 7/12 Extracts & Certified Mutation Entries (Ferfar No. 18294)',
  'Development Agreement (DA) & Irrevocable Power of Attorney (POA)',
  'Sanctioned Layout, Building Plans & Commencement Certificate (CC)',
  'MahaRERA Registration Certificate & Disclosures',
  'Construction Finance Lender NOC & MCA Charge Search',
  'Civil Court & Revenue Litigation Search Certificate',
];

export const InitiateLegalVerificationModal: React.FC<InitiateLegalVerificationModalProps> = ({
  isOpen,
  onClose,
  caseId,
  caseData,
  builderData,
  projectData,
  currentReport,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const defaultEmp = LEGAL_EMPANELMENT_MASTER[0];

  const [legalRoute, setLegalRoute] = useState<LegalRoute>(
    (currentReport?.legalRoute as LegalRoute) || 'External Advocate'
  );
  const [selectedEmpId, setSelectedEmpId] = useState<string>(defaultEmp.id);
  const [reviewerName, setReviewerName] = useState<string>(
    currentReport?.reviewerName || defaultEmp.name
  );
  const [reviewerFirm, setReviewerFirm] = useState<string>(
    currentReport?.reviewerFirm || defaultEmp.firmName
  );
  const [empanelmentNo, setEmpanelmentNo] = useState<string>(
    currentReport?.empanelmentNo || defaultEmp.empanelmentNo
  );
  const [requestType, setRequestType] = useState<LegalRequestType>(
    currentReport?.requestType || 'New APF'
  );
  const [scopeType, setScopeType] = useState<LegalScopeType>(
    currentReport?.scopeType || 'Phase'
  );

  const defaultDue = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
  const [slaDueDate, setSlaDueDate] = useState<string>(
    currentReport?.slaDueDate?.split(' ')[0] || defaultDue
  );

  const [selectedDocs, setSelectedDocs] = useState<string[]>(DEFAULT_DOCKET_DOCS);
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Please conduct a 30-year search at Sub-Registrar Haveli, verify 7/12 Kabjedar occupancy record, validate irrevocable development rights in DA/POA, and scrutinize HDFC Bank consortium charge release status.'
  );

  const handleEmpanelledChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = LEGAL_EMPANELMENT_MASTER.find((e) => e.id === empId);
    if (emp) {
      setReviewerName(emp.name);
      setReviewerFirm(emp.firmName);
      setEmpanelmentNo(emp.empanelmentNo);
      if (emp.type === 'INTERNAL') {
        setLegalRoute('Internal Legal');
      } else {
        setLegalRoute('External Advocate');
      }
    }
  };

  const handleSetPresetSla = (days: number) => {
    const d = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    setSlaDueDate(d);
  };

  const toggleDoc = (docName: string) => {
    if (selectedDocs.includes(docName)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== docName));
    } else {
      setSelectedDocs([...selectedDocs, docName]);
    }
  };

  const handleSelectAllDocs = () => setSelectedDocs(DEFAULT_DOCKET_DOCS);
  const handleClearAllDocs = () => setSelectedDocs([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = legalStore.initiateLegalVerification(caseId, {
      legalRoute,
      requestType,
      reviewerName,
      reviewerFirm,
      empanelmentNo,
      slaDueDate: `${slaDueDate} 18:00:00`,
      scopeType,
      phasesUnderReview: caseData?.phasesUnderReview || ['Phase 1'],
      towersUnderReview: caseData?.selectedTowerIds || ['Tower A', 'Tower B', 'Building E', 'Building G'],
      specialInstructions,
      documentsDispatched: selectedDocs,
    });

    onSuccess(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Initiate Legal Verification & Advocate Docket
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700/50">
                  {caseId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Assign empanelled legal counsel, define title scrutiny scope, and dispatch statutory record docket
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Snapshot Strip */}
        <div className="bg-sky-50/70 px-5 py-2.5 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-800" />
            <span className="text-slate-600 font-medium">Developer:</span>
            <strong className="text-slate-900">
              {builderData?.legalName || currentReport?.builderLegalName || 'Kolte-Patil Developers Ltd'}
            </strong>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Project:</span>{' '}
            <strong className="text-sky-900">
              {projectData?.projectName || currentReport?.projectName || 'Life Republic (Phase 1)'}
            </strong>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Underwriting Scope:</span>{' '}
            <span className="font-mono text-slate-800 font-bold">Towers E, F, G, H</span>
          </div>
        </div>

        {/* Initiation Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* 1. Legal Review Route */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              1. Legal Review Route *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'External Advocate', label: 'External Advocate', desc: 'Empanelled Law Firm' },
                { id: 'Internal Legal', label: 'Internal Legal Cell', desc: 'In-House Bank Counsel' },
                { id: 'Dual Legal Review', label: 'Dual Legal Review', desc: 'External + Internal Sign-off' },
              ].map((route) => (
                <button
                  type="button"
                  key={route.id}
                  onClick={() => setLegalRoute(route.id as LegalRoute)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    legalRoute === route.id
                      ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-400/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{route.label}</span>
                    {legalRoute === route.id && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    {route.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Select Empanelled Advocate / Law Firm */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-700" />
                <span>2. Select Empanelled Legal Counsel & Law Firm *</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Accredited Panel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEGAL_EMPANELMENT_MASTER.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => handleEmpanelledChange(emp.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedEmpId === emp.id
                      ? 'bg-white border-sky-600 ring-2 ring-sky-400/20 shadow-xs'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1 rounded">
                      ★ {emp.rating}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate">{emp.firmName}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{emp.city} ({emp.type})</span>
                    <span className="font-mono">{emp.empanelmentNo}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Reviewer Input Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Counsel Name</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Law Firm</label>
                <input
                  type="text"
                  required
                  value={reviewerFirm}
                  onChange={(e) => setReviewerFirm(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Empanelment No.</label>
                <input
                  type="text"
                  required
                  value={empanelmentNo}
                  onChange={(e) => setEmpanelmentNo(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Request Type & SLA Turnaround */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                3. Legal Request Type *
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as LegalRequestType)}
                className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
              >
                <option value="New APF">New APF (Primary Project Scrutiny)</option>
                <option value="Renewal">Annual APF Renewal</option>
                <option value="Legal Revalidation">Legal Revalidation (Post Lapse/Sanction Change)</option>
                <option value="Tower Addition">Tower Addition / Subsequent Wings</option>
                <option value="Phase Addition">Phase Extension Underwriting</option>
                <option value="Rework">Rework / Query Resolution</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  4. SLA Due Date *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetPresetSla(3)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    +3d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetSla(5)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    +5d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetSla(7)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    +7d
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={slaDueDate}
                  onChange={(e) => setSlaDueDate(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 5. Documents Docket Checklist to Dispatch */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-sky-700" />
                <span>5. Statutory Document Docket to Dispatch ({selectedDocs.length} Selected)</span>
              </label>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={handleSelectAllDocs}
                  className="text-sky-700 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleClearAllDocs}
                  className="text-slate-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
              {DEFAULT_DOCKET_DOCS.map((docName, idx) => {
                const isChecked = selectedDocs.includes(docName);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                      isChecked ? 'bg-white text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(docName)}
                      className="mt-0.5 text-sky-600 rounded"
                    />
                    <span className="text-[11px] leading-tight">{docName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Special Underwriting Instructions */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              6. Specific Instructions & Focus Areas for Counsel
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white leading-relaxed"
              placeholder="Specify requirements e.g. check mutation entries, examine court proceedings..."
            />
          </div>

          {/* Notice & Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Initiating legal verification unlocks all 15 sections for interactive scrutiny.</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Docket & Initiate Verification →</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
