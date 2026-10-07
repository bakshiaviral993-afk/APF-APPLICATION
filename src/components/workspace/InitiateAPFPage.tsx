import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_PHASE_MASTER,
  CENTRAL_TOWER_MASTER,
  CENTRAL_UNIT_MASTER,
  getProjectsByBuilder,
  getPhasesByProject,
  getTowersByProject,
  getTowersByPhase,
  getUnitsByTower,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Building2,
  MapPin,
  Layers,
  FileCheck,
  Compass,
  Scale,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

interface InitiateAPFPageProps {
  currentUser: UserAccount;
  onBack: () => void;
  onCaseCreated: (createdCase: APFCase) => void;
}

const STEPS = [
  { id: 1, label: 'Builder', icon: Building2 },
  { id: 2, label: 'Project / RERA', icon: MapPin },
  { id: 3, label: 'Phase / Tower', icon: Layers },
  { id: 4, label: 'Scope', icon: Compass },
  { id: 5, label: 'Valuation Route', icon: FileCheck },
  { id: 6, label: 'Legal Route', icon: Scale },
  { id: 7, label: 'Documents', icon: UploadCloud },
  { id: 8, label: 'Review & Submit', icon: CheckCircle2 },
];

export const InitiateAPFPage: React.FC<InitiateAPFPageProps> = ({
  currentUser,
  onBack,
  onCaseCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedBuilderId, setSelectedBuilderId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [selectedTowerId, setSelectedTowerId] = useState('');
  const [selectedUnitCount, setSelectedUnitCount] = useState<number>(0);
  const [appraisalScope, setAppraisalScope] = useState('FULL_COMMERCIAL_RESIDENTIAL');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('NORMAL');

  // Valuation routing
  const [valuationAgency, setValuationAgency] = useState('Knight Frank India Pvt Ltd');
  const [valuerSlaDays, setValuerSlaDays] = useState(5);
  const [valuerSpecialInstructions, setValuerSpecialInstructions] = useState('');

  // Legal routing
  const [legalFirm, setLegalFirm] = useState('Dua Associates & Partners');
  const [legalScope, setLegalScope] = useState('FULL_30_YEAR_SEARCH');
  const [legalSlaDays, setLegalSlaDays] = useState(7);

  // Documents
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'RERA_Registration_Certificate.pdf', size: '2.4 MB', status: 'VERIFIED' },
    { name: 'Sanctioned_Layout_Plan_Rev3.pdf', size: '14.8 MB', status: 'VERIFIED' },
    { name: 'Commencement_Certificate_Phase1.pdf', size: '3.1 MB', status: 'VERIFIED' },
  ]);

  // Derived datasets
  const availableProjects = selectedBuilderId
    ? getProjectsByBuilder(selectedBuilderId)
    : [];
  const availablePhases = selectedProjectId
    ? getPhasesByProject(selectedProjectId)
    : [];
  const availableTowers = selectedPhaseId
    ? getTowersByPhase(selectedPhaseId).length > 0
      ? getTowersByPhase(selectedPhaseId)
      : getTowersByProject(selectedProjectId)
    : selectedProjectId
    ? getTowersByProject(selectedProjectId)
    : [];
  const availableUnits = selectedTowerId
    ? getUnitsByTower(selectedTowerId)
    : [];

  const handleBuilderChange = (builderId: string) => {
    setSelectedBuilderId(builderId);
    setSelectedProjectId('');
    setSelectedPhaseId('');
    setSelectedTowerId('');
    setSelectedUnitCount(0);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedPhaseId('');
    setSelectedTowerId('');
    setSelectedUnitCount(0);
  };

  const handlePhaseChange = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setSelectedTowerId('');
    setSelectedUnitCount(0);
  };

  const handleTowerChange = (towerId: string) => {
    setSelectedTowerId(towerId);
    const units = getUnitsByTower(towerId);
    setSelectedUnitCount(units.length);
  };

  const selectedBuilder = CENTRAL_BUILDER_MASTER.find((b) => b.id === selectedBuilderId);
  const selectedProject = CENTRAL_PROJECT_MASTER.find((p) => p.id === selectedProjectId);
  const selectedTower = CENTRAL_TOWER_MASTER.find((t) => t.id === selectedTowerId);

  const handleSubmit = () => {
    if (!selectedBuilder || !selectedProject || !selectedTower) return;

    const newCase = apfStore.createNewCase({
      builderId: selectedBuilder.id,
      projectId: selectedProject.id,
      phaseId: selectedPhaseId || 'PHS-PUN-001-A',
      selectedTowerIds: [selectedTower.id],
      requestType: 'New APF',
      businessUnit: 'Retail Mortgage',
      branch: 'Pune Metro Hub',
      proposedExposureCr: 75.0,
      requestedRetailSourcingLimitCr: 100.0,
      priority: priority === 'URGENT' ? 'Urgent' : priority === 'HIGH' ? 'High' : 'Standard',
    });

    onCaseCreated(newCase);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Initiate APF"
        pageTitle="Initiate New APF Underwriting Docket"
        subtitle="Step-by-step master-synchronized project intake, valuation routing & legal assignment"
        breadcrumbs={[
          { label: 'Workspace', onClick: onBack },
          { label: 'My APF Cases', onClick: onBack },
          { label: 'Initiate APF' },
        ]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => alert('Draft saved successfully.')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
          </div>
        }
      />

      {/* 8-Step Navigation Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isCompleted && setCurrentStep(step.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px] font-mono">0{step.id}</span>
                </div>
                <span className="text-[11px] leading-tight truncate w-full">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        {/* Step 1: Builder */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 1: Select Approved Builder Entity</h3>
              <p className="text-xs text-slate-500">
                Choose from the synchronized Central Builder Master. Ensure promoter KYC and risk grades are current.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Builder Group / Legal Entity *
                </label>
                <select
                  value={selectedBuilderId}
                  onChange={(e) => handleBuilderChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="">-- Select Builder --</option>
                  {CENTRAL_BUILDER_MASTER.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.legalName} ({b.pan}) · Grade: {b.internalRiskGrade || 'A'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBuilder && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedBuilder.legalName}</div>
                  <div className="text-slate-600">CIN: {selectedBuilder.cin} · PAN: {selectedBuilder.pan}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-500">Internal Grade:</span>
                    <strong className="text-emerald-700 font-bold">{selectedBuilder.internalRiskGrade || 'A'}</strong>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">Group Exposure:</span>
                    <strong className="text-slate-800">₹{selectedBuilder.totalExposureCr || 0} Cr</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Project / RERA */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 2: Project & MahaRERA Selection</h3>
              <p className="text-xs text-slate-500">
                Projects linked to {selectedBuilder?.legalName || 'selected builder'}. Verify RERA registration validity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Name *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="">-- Select Project --</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} ({p.reraNumbers?.join(', ') || 'RERA'}) - {p.city}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedProject.projectName}</div>
                  <div className="text-slate-600">Location: {selectedProject.address || selectedProject.locality}, {selectedProject.city}</div>
                  <div className="text-slate-600">RERA No: <span className="font-mono">{selectedProject.reraNumbers?.join(', ') || 'P52100018542'}</span></div>
                  <div className="text-slate-600">Category: Residential · Land: {selectedProject.totalLandAreaAcres} Acres</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Phase / Tower */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 3: Phased Development & Tower Units</h3>
              <p className="text-xs text-slate-500">
                Specify target Wing/Tower for APF sanction and unit coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phase *</label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => handlePhaseChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Select Phase --</option>
                  {availablePhases.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.phaseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tower / Wing *</label>
                <select
                  value={selectedTowerId}
                  onChange={(e) => handleTowerChange(e.target.value)}
                  disabled={!selectedPhaseId}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                >
                  <option value="">-- Select Tower --</option>
                  {availableTowers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Floors: {t.floors}, Slabs: {t.slabsCast}/{t.floors})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Units</label>
                <input
                  type="number"
                  value={selectedUnitCount}
                  onChange={(e) => setSelectedUnitCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>

            {selectedTower && (
              <div className="bg-sky-50 rounded-lg p-3 border border-sky-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-950">{selectedTower.towerName}</span>
                  <span className="text-sky-700 ml-2">Construction Progress: {selectedTower.physicalProgressPct || 62.5}%</span>
                </div>
                <div className="font-mono text-sky-900 font-bold">
                  Units in Master: {availableUnits.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Scope & Priority */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 4: Appraisal Scope & Underwriting Priority</h3>
              <p className="text-xs text-slate-500">Define the assessment framework and SLA urgency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriting Scope</label>
                <select
                  value={appraisalScope}
                  onChange={(e) => setAppraisalScope(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="FULL_COMMERCIAL_RESIDENTIAL">Full Technical, Legal & Exposure Underwriting</option>
                  <option value="TECHNICAL_VALUATION_ONLY">Technical Valuation Only</option>
                  <option value="LEGAL_SCRUTINY_ONLY">Legal Scrutiny & Title Search Only</option>
                  <option value="FAST_TRACK_PRE_APPROVED">Fast-Track Existing Category A Builder APF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        priority === p
                          ? p === 'URGENT'
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Valuation Route */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 5: Valuation Route & Agency Assignment</h3>
              <p className="text-xs text-slate-500">Route assignment to an empanelled technical valuation agency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empanelled Valuation Agency</label>
                <select
                  value={valuationAgency}
                  onChange={(e) => setValuationAgency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Knight Frank India Pvt Ltd">Knight Frank India Pvt Ltd (Grade A+ Panel)</option>
                  <option value="CBRE South Asia Pvt Ltd">CBRE South Asia Pvt Ltd (Grade A+ Panel)</option>
                  <option value="JLL Property Consultants">JLL Property Consultants (Grade A Panel)</option>
                  <option value="Cushman & Wakefield">Cushman & Wakefield India (Grade A Panel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valuation Turnaround (SLA Days)</label>
                <input
                  type="number"
                  value={valuerSlaDays}
                  onChange={(e) => setValuerSlaDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Valuer Instructions</label>
                <textarea
                  rows={2}
                  value={valuerSpecialInstructions}
                  onChange={(e) => setValuerSpecialInstructions(e.target.value)}
                  placeholder="e.g. Verify Mivan shuttering progress on 14th slab and check access road ROW width."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Legal Route */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 6: Legal Route & Law Firm Assignment</h3>
              <p className="text-xs text-slate-500">Assign 30-year title verification to empanelled advocate / law firm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empanelled Law Firm / Advocate</label>
                <select
                  value={legalFirm}
                  onChange={(e) => setLegalFirm(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Dua Associates & Partners">Dua Associates & Partners (Grade A Law Firm)</option>
                  <option value="Shardul Amarchand Mangaldas">Shardul Amarchand Mangaldas & Co (Panel A+)</option>
                  <option value="Adv. Rajesh K. Sharma & Associates">Adv. Rajesh K. Sharma & Associates (High Court Panel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Scrutiny Scope</label>
                <select
                  value={legalScope}
                  onChange={(e) => setLegalScope(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="FULL_30_YEAR_SEARCH">Full 30-Year Search & Devolution Scrutiny</option>
                  <option value="15_YEAR_SEARCH_EXTENSION">15-Year Search (Phase Extension)</option>
                  <option value="SUPPLEMENTARY_LEGAL_OPINION">Supplementary Search & Title Re-verification</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Documents */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 7: Mandatory Document Repository</h3>
              <p className="text-xs text-slate-500">Initial intake documents verified against Project Vault.</p>
            </div>

            <div className="space-y-2">
              {uploadedDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">{doc.name}</span>
                    <span className="text-slate-400 font-mono">({doc.size})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
              Drag & Drop additional title deeds, sanctioned layout blueprints or NOCs here
            </div>
          </div>
        )}

        {/* Step 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 8: Final Review & Docket Dispatch</h3>
              <p className="text-xs text-slate-500">Review dossier summary before broadcasting to Valuer & Legal work queues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Project & Asset Details</div>
                <div>Builder: <strong className="text-slate-800">{selectedBuilder?.legalName}</strong></div>
                <div>Project: <strong className="text-slate-800">{selectedProject?.projectName}</strong></div>
                <div>Tower: <strong className="text-slate-800">{selectedTower?.towerName}</strong></div>
                <div>Units Under Sanction: <strong className="text-slate-800">{selectedUnitCount}</strong></div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Assignments & SLA</div>
                <div>Valuer: <strong className="text-slate-800">{valuationAgency}</strong> ({valuerSlaDays} days SLA)</div>
                <div>Legal: <strong className="text-slate-800">{legalFirm}</strong> ({legalSlaDays} days SLA)</div>
                <div>Priority: <strong className="text-slate-800">{priority}</strong></div>
                <div>Attached Documents: <strong className="text-slate-800">{uploadedDocs.length} files</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              disabled={
                (currentStep === 1 && !selectedBuilderId) ||
                (currentStep === 2 && !selectedProjectId) ||
                (currentStep === 3 && !selectedTowerId)
              }
              onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Dispatch APF Case</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
