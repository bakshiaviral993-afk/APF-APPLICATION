import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, APFCase, BuilderMaster, ProjectMaster, PhaseMaster, TowerMaster } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import { masterStore } from '../../services/masterStore';
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
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Plus,
  CheckSquare,
  Square,
  Building,
} from 'lucide-react';

interface InitiateAPFPageProps {
  currentUser: UserAccount;
  onBack: () => void;
  onCaseCreated: (createdCase: APFCase) => void;
  initialBuilderId?: string;
  initialProjectId?: string;
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
  initialBuilderId,
  initialProjectId,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State: Builder -> Project -> Phase -> Tower -> Unit
  const [builders, setBuilders] = useState<BuilderMaster[]>(() => masterStore.getSelectableBuilders());
  const [selectedBuilderId, setSelectedBuilderId] = useState(initialBuilderId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [selectedTowerIds, setSelectedTowerIds] = useState<string[]>([]);
  const [selectedUnitCount, setSelectedUnitCount] = useState<number>(0);

  // Dependent Hierarchy Dynamic State & Loading Flags
  const [availableProjects, setAvailableProjects] = useState<ProjectMaster[]>([]);
  const [availablePhases, setAvailablePhases] = useState<PhaseMaster[]>([]);
  const [availableTowers, setAvailableTowers] = useState<TowerMaster[]>([]);

  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [isLoadingTowers, setIsLoadingTowers] = useState(false);
  const [isAutoHealingHierarchy, setIsAutoHealingHierarchy] = useState(false);

  // Multi-Tower vs Single Tower Selection Mode (Requirement 16)
  const [isMultiTowerMode, setIsMultiTowerMode] = useState(true);

  // Validation feedback (Requirement 17 & 18)
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  // Underwriting parameters
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
  const [uploadedDocs] = useState([
    { name: 'RERA_Registration_Certificate.pdf', size: '2.4 MB', status: 'VERIFIED' },
    { name: 'Sanctioned_Layout_Plan_Rev3.pdf', size: '14.8 MB', status: 'VERIFIED' },
    { name: 'Commencement_Certificate_Phase1.pdf', size: '3.1 MB', status: 'VERIFIED' },
  ]);

  // Sync with MasterStore updates
  useEffect(() => {
    const refreshStoreData = () => {
      setBuilders(masterStore.getSelectableBuilders());
      if (selectedBuilderId) {
        setAvailableProjects(masterStore.getSelectableProjects(selectedBuilderId));
      }
    };
    refreshStoreData();
    return masterStore.subscribe(refreshStoreData);
  }, [selectedBuilderId]);

  // Handle Initial Props (if opened with builder / project pre-selected)
  useEffect(() => {
    if (initialBuilderId && !selectedBuilderId) {
      setSelectedBuilderId(initialBuilderId);
      const projectsForBuilder = masterStore.getSelectableProjects(initialBuilderId);
      setAvailableProjects(projectsForBuilder);
    }
    if (initialProjectId && !selectedProjectId) {
      setSelectedProjectId(initialProjectId);
      loadPhases(initialProjectId);
    }
  }, [initialBuilderId, initialProjectId]);

  // Step 1 -> Step 2: When Builder changes, cascade reset child states & load projects
  const handleBuilderChange = (builderId: string) => {
    setSelectedBuilderId(builderId);
    // Cascade Reset Rule (Requirement 11)
    setSelectedProjectId('');
    setSelectedPhaseId('');
    setSelectedTowerIds([]);
    setSelectedUnitCount(0);
    setAvailablePhases([]);
    setAvailableTowers([]);
    setHierarchyError(null);

    if (builderId) {
      const projectsForBuilder = masterStore.getSelectableProjects(builderId);
      setAvailableProjects(projectsForBuilder);
    } else {
      setAvailableProjects([]);
    }
  };

  // Step 2: When Project changes, execute loadPhases(projectId) & cascade reset child states
  const loadPhases = (projectId: string) => {
    if (!projectId) {
      setAvailablePhases([]);
      setAvailableTowers([]);
      return;
    }

    setIsLoadingPhases(true);
    setHierarchyError(null);

    setTimeout(() => {
      let phases = masterStore.getSelectablePhases(projectId);
      let allProjectTowers = masterStore.getSelectableTowers(projectId);

      // Auto-heal / ensure hierarchy if child records are missing for discovered or existing projects
      if (phases.length === 0 || allProjectTowers.length === 0) {
        const ensured = masterStore.ensureProjectHierarchy(projectId);
        phases = ensured.phases;
        allProjectTowers = ensured.towers;
      }

      // Requirement 5: Handling Projects Without Phases
      // If no formal phase records exist but towers exist directly under Project_ID,
      // create a virtual "Not Applicable / Single Phase" entry so tower selection is never blocked.
      if (phases.length === 0 && allProjectTowers.length > 0) {
        phases = [
          {
            id: 'PHS-DEFAULT',
            projectId,
            builderId: selectedBuilderId,
            phaseName: 'Not Applicable / Single Phase (Full Project Development)',
            phaseNumber: 'Phase 1',
            reraNumber: masterStore.getProjectById(projectId)?.reraNumbers?.[0] || 'RERA-PROJECT-LEVEL',
            sanctionDate: '2022-01-15',
            expectedCompletionDate: '2027-12-31',
            phaseStatus: 'Under Construction',
            isActive: true,
            approvalStatus: 'APPROVED',
          },
        ];
      }

      setAvailablePhases(phases);
      setIsLoadingPhases(false);

      // Auto-select phase if exactly 1 phase exists
      if (phases.length === 1) {
        setSelectedPhaseId(phases[0].id);
        loadTowers(projectId, phases[0].id);
      }
    }, 150);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Cascade Reset Rule (Requirement 11)
    setSelectedPhaseId('');
    setSelectedTowerIds([]);
    setSelectedUnitCount(0);
    setAvailableTowers([]);
    setHierarchyError(null);

    if (projectId) {
      loadPhases(projectId);
    }
  };

  // Step 3: When Phase changes, execute loadTowers(projectId, phaseId) & cascade reset tower/units
  const loadTowers = (projectId: string, phaseId: string) => {
    if (!projectId) {
      setAvailableTowers([]);
      return;
    }

    setIsLoadingTowers(true);
    setHierarchyError(null);

    setTimeout(() => {
      // If virtual phase, query all towers for the project
      let towers: TowerMaster[] = [];
      if (phaseId === 'PHS-DEFAULT') {
        towers = masterStore.getSelectableTowers(projectId);
      } else {
        towers = masterStore.getSelectableTowers(projectId, phaseId);
        // Fallback: If no tower explicitly has phaseId, fallback to all towers for this project
        if (towers.length === 0) {
          towers = masterStore.getSelectableTowers(projectId);
        }
      }

      // If still 0 towers, auto-heal
      if (towers.length === 0) {
        const ensured = masterStore.ensureProjectHierarchy(projectId);
        towers = ensured.towers;
      }

      setAvailableTowers(towers);
      setIsLoadingTowers(false);

      // Auto-select first tower if only 1 tower available
      if (towers.length === 1) {
        setSelectedTowerIds([towers[0].id]);
        setSelectedUnitCount(towers[0].totalUnits || 48);
      }
    }, 150);
  };

  // Safeguard: when reaching Step 3, if project is selected but phases not loaded yet, trigger loadPhases
  useEffect(() => {
    if (currentStep === 3 && selectedProjectId && availablePhases.length === 0 && !isLoadingPhases) {
      loadPhases(selectedProjectId);
    }
  }, [currentStep, selectedProjectId]);

  const handlePhaseChange = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    // Cascade Reset Rule (Requirement 11)
    setSelectedTowerIds([]);
    setSelectedUnitCount(0);
    setHierarchyError(null);

    if (phaseId && selectedProjectId) {
      loadTowers(selectedProjectId, phaseId);
    } else {
      setAvailableTowers([]);
    }
  };

  // Tower Toggle / Selection (Single or Multi-select per Requirement 16)
  const handleToggleTower = (towerId: string) => {
    setHierarchyError(null);

    let updated: string[];
    if (isMultiTowerMode) {
      if (selectedTowerIds.includes(towerId)) {
        updated = selectedTowerIds.filter((id) => id !== towerId);
      } else {
        updated = [...selectedTowerIds, towerId];
      }
    } else {
      updated = [towerId];
    }

    setSelectedTowerIds(updated);

    // Compute total units from selected towers
    const count = updated.reduce((sum, tid) => {
      const t = masterStore.getTowerById(tid);
      const units = masterStore.getUnits({ towerId: tid });
      return sum + (units.length > 0 ? units.length : t?.totalUnits || 48);
    }, 0);

    setSelectedUnitCount(count);
  };

  // Fallback Action: 1-Click Auto-Heal / Generate Hierarchy from RERA (Requirement 6 & 13)
  const handleAutoHealHierarchy = () => {
    if (!selectedProjectId) return;
    setIsAutoHealingHierarchy(true);

    setTimeout(() => {
      const result = masterStore.ensureProjectHierarchy(selectedProjectId);
      setAvailablePhases(result.phases);

      if (result.phases.length > 0) {
        const firstPhase = result.phases[0];
        setSelectedPhaseId(firstPhase.id);
        const towers = masterStore.getSelectableTowers(selectedProjectId, firstPhase.id);
        setAvailableTowers(towers);
        if (towers.length > 0) {
          setSelectedTowerIds([towers[0].id]);
          setSelectedUnitCount(towers[0].totalUnits || 48);
        }
      }

      setIsAutoHealingHierarchy(false);
    }, 300);
  };

  // Selected Master Entities
  const selectedBuilder = useMemo(() => {
    return masterStore.getBuilderById(selectedBuilderId);
  }, [selectedBuilderId]);

  const selectedProject = useMemo(() => {
    return masterStore.getProjectById(selectedProjectId);
  }, [selectedProjectId]);

  const selectedPhase = useMemo(() => {
    if (selectedPhaseId === 'PHS-DEFAULT') {
      return { id: 'PHS-DEFAULT', phaseName: 'Not Applicable / Single Phase (Full Project Development)' };
    }
    return masterStore.getPhaseById(selectedPhaseId);
  }, [selectedPhaseId]);

  const selectedTowers = useMemo(() => {
    return selectedTowerIds
      .map((tid) => masterStore.getTowerById(tid))
      .filter((t): t is TowerMaster => Boolean(t));
  }, [selectedTowerIds]);

  // Pre-Submission Validation (Requirement 17 & 18)
  const handleSubmit = () => {
    if (!selectedBuilder || !selectedProject || selectedTowerIds.length === 0) {
      setHierarchyError('Please complete Builder, Project, and Tower selections before submission.');
      return;
    }

    // Backend / Service hierarchy validation
    for (const tid of selectedTowerIds) {
      const validation = masterStore.validateHierarchy(
        selectedBuilder.id,
        selectedProject.id,
        selectedPhaseId,
        tid
      );
      if (!validation.valid) {
        setHierarchyError(`Master hierarchy mismatch detected: ${validation.reason}`);
        return;
      }
    }

    const newCase = apfStore.createNewCase({
      builderId: selectedBuilder.id,
      projectId: selectedProject.id,
      phaseId: selectedPhaseId || 'PHS-DEFAULT',
      selectedTowerIds: selectedTowerIds,
      requestType: 'New APF',
      businessUnit: 'Retail Mortgage',
      branch: `${selectedProject.city || 'Regional'} Asset Hub`,
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
              onClick={() => alert('Draft docket state preserved in local workspace.')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
          </div>
        }
      />

      {/* Validation Mismatch Alert Banner (Requirement 17) */}
      {hierarchyError && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex items-start gap-3 text-xs text-rose-900 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold text-sm">Hierarchy Validation Warning:</strong>
            <p className="mt-0.5">{hierarchyError}</p>
          </div>
          <button
            onClick={() => setHierarchyError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        {/* Step 1: Builder */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Select Approved Builder Entity</h3>
                <p className="text-xs text-slate-500">
                  Select from Central Builder Master. Changing builder will cascade-reset projects, phases, and towers.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {builders.length} Approved Developers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Builder Group / Legal Entity *
                </label>
                <select
                  value={selectedBuilderId}
                  onChange={(e) => handleBuilderChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">-- Select Builder Entity --</option>
                  {builders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.legalName} ({b.city || 'India'}) · PAN: {b.pan}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBuilder ? (
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{selectedBuilder.legalName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      MASTER ID: {selectedBuilder.id}
                    </span>
                  </div>
                  <div className="text-slate-600">CIN: {selectedBuilder.cin} · PAN: {selectedBuilder.pan}</div>
                  <div className="flex items-center gap-2 pt-1 text-slate-500">
                    <span>Internal Risk Grade: <strong className="text-emerald-700">{selectedBuilder.internalRiskGrade || 'A+'}</strong></span>
                    <span>•</span>
                    <span>Operating Cities: <strong className="text-slate-800">{selectedBuilder.operatingCities?.join(', ') || selectedBuilder.city}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-lg p-3.5 border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-center">
                  Select a builder to view corporate overview and linked projects.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Project / RERA */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 2: Project & RERA Selection</h3>
                <p className="text-xs text-slate-500">
                  Projects dynamically linked to <strong>{selectedBuilder?.legalName || 'selected builder'}</strong> (Builder ID: {selectedBuilderId}).
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {availableProjects.length} Linked Projects Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  disabled={!selectedBuilderId}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">
                    {!selectedBuilderId ? 'Select Builder First' : '-- Select Project --'}
                  </option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} · {p.city}, {p.state || 'India'} ({p.reraNumbers?.[0] || 'RERA'})
                    </option>
                  ))}
                </select>
                {availableProjects.length === 0 && selectedBuilderId && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No approved projects linked to this builder. Use Master Data → Project Discovery to fetch nationwide projects.
                  </p>
                )}
              </div>

              {selectedProject ? (
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{selectedProject.projectName}</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {selectedProject.id}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProject.address || selectedProject.locality}, {selectedProject.city}, {selectedProject.state}</span>
                  </div>
                  <div className="text-slate-600">
                    RERA Registration: <span className="font-mono font-bold text-emerald-800">{selectedProject.reraNumbers?.join(', ') || 'RERA-ACTIVE'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-slate-500">
                    <span>Land Area: <strong className="text-slate-800">{selectedProject.totalLandAreaAcres} Acres</strong></span>
                    <span>•</span>
                    <span>Progress: <strong className="text-emerald-700">{selectedProject.currentProgressPct || 75}%</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-lg p-3.5 border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-center">
                  Select a project to inspect site coordinates, RERA certificate and child hierarchy.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Phase / Tower (CRITICAL FIX) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Step 3: Phased Development & Tower Units</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    (Project: <strong>{selectedProject?.projectName}</strong>)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select sanctioned phase and target towers. Multi-tower selection supported for composite APF dockets.
                </p>
              </div>

              {/* Multi-Tower Scope Toggle (Requirement 16) */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsMultiTowerMode(false)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    !isMultiTowerMode ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Single Tower
                </button>
                <button
                  type="button"
                  onClick={() => setIsMultiTowerMode(true)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    isMultiTowerMode ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Multi-Tower Scope
                </button>
              </div>
            </div>

            {/* Hierarchy Dropdowns: Phase & Tower */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Phase Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Development Phase *
                </label>

                {!selectedProjectId ? (
                  <select disabled className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                    <option>Select Project First</option>
                  </select>
                ) : isLoadingPhases ? (
                  <div className="flex items-center space-x-2 px-3 py-2 text-xs rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading phases from Master Repository...</span>
                  </div>
                ) : availablePhases.length > 0 ? (
                  <select
                    value={selectedPhaseId}
                    onChange={(e) => handlePhaseChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Sanctioned Phase --</option>
                    {availablePhases.map((ph) => (
                      <option key={ph.id} value={ph.id}>
                        {ph.phaseName} {ph.reraNumber ? `(${ph.reraNumber})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-2">
                    <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>No Phase records found for this project.</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Child hierarchy records are missing for Project ID: {selectedProjectId}.
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoHealHierarchy}
                      disabled={isAutoHealingHierarchy}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAutoHealingHierarchy ? 'Generating...' : '⚡ Fetch & Auto-Generate Phase & Towers'}</span>
                    </button>
                  </div>
                )}

                {selectedPhase && selectedPhaseId && (
                  <p className="text-[11px] text-slate-500">
                    Phase ID: <span className="font-mono font-semibold text-slate-700">{selectedPhaseId}</span>
                  </p>
                )}
              </div>

              {/* 2. Tower Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Sanctioned Tower / Wing *
                  </label>
                  {selectedTowerIds.length > 0 && (
                    <span className="text-[11px] font-bold text-indigo-700">
                      {selectedTowerIds.length} Tower{selectedTowerIds.length > 1 ? 's' : ''} Selected ({selectedUnitCount} Units)
                    </span>
                  )}
                </div>

                {!selectedPhaseId ? (
                  <select disabled className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                    <option>Select Phase First</option>
                  </select>
                ) : isLoadingTowers ? (
                  <div className="flex items-center space-x-2 px-3 py-2 text-xs rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading towers for Phase...</span>
                  </div>
                ) : availableTowers.length > 0 ? (
                  /* Cards / Checkbox list of towers */
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableTowers.map((t) => {
                      const isSelected = selectedTowerIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleToggleTower(t.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <span>{t.towerName}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {t.id}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {t.floorsSanctioned} Floors · {t.totalUnits || 48} Units · Stage: {t.constructionStage || 'Under Construction'}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700">
                            {t.physicalProgressPct || 70}% Progress
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-2">
                    <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>No Tower records found for this phase.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoHealHierarchy}
                      disabled={isAutoHealingHierarchy}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAutoHealingHierarchy ? 'Generating...' : '⚡ Generate Sanctioned Towers'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Hierarchy Summary Card */}
            {selectedTowers.length > 0 && (
              <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 text-xs space-y-2 animate-in fade-in">
                <div className="font-bold text-sky-950 flex items-center justify-between">
                  <span>Selected APF Docket Scope:</span>
                  <span className="font-mono text-sky-900 font-bold bg-sky-100 px-2.5 py-0.5 rounded border border-sky-300">
                    {selectedTowers.length} Sanctioned Tower{selectedTowers.length > 1 ? 's' : ''} Linked
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedTowers.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-sky-300 text-sky-900 font-medium text-xs shadow-2xs"
                    >
                      <Building className="w-3.5 h-3.5 text-sky-600" />
                      <strong>{t.towerName}</strong>
                      <span className="text-slate-400">({t.totalUnits || 48} units)</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sky-800 pt-1 text-[11px]">
                  <span>Total Unit Coverage: <strong className="font-bold text-sky-950">{selectedUnitCount} Residential Units</strong></span>
                  <span>•</span>
                  <span>Physical Stage: <strong>Superstructure / Internal Finishing</strong></span>
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
                  <option value="Knight Frank India Pvt Ltd">Knight Frank India Pvt Ltd (Tier 1 Global)</option>
                  <option value="CBRE South Asia Pvt Ltd">CBRE South Asia Pvt Ltd (Tier 1 Global)</option>
                  <option value="JLL India Advisory Services">JLL India Advisory Services (Tier 1 Global)</option>
                  <option value="Direct Engineering Valuation Cell">Direct Engineering Valuation Cell (Internal Panel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround SLA (Business Days)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={valuerSlaDays}
                  onChange={(e) => setValuerSlaDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valuer Special Instructions</label>
                <textarea
                  rows={2}
                  value={valuerSpecialInstructions}
                  onChange={(e) => setValuerSpecialInstructions(e.target.value)}
                  placeholder="e.g., Verify physical stage of Tower B 18th floor slab casting against architect Form 3..."
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
              <h3 className="text-sm font-bold text-slate-900">Step 6: Legal Search & Title Verification</h3>
              <p className="text-xs text-slate-500">Assign legal scrutiny and search report to empanelled advocate / firm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empanelled Legal Advocate / Firm</label>
                <select
                  value={legalFirm}
                  onChange={(e) => setLegalFirm(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Dua Associates & Partners">Dua Associates & Partners (Senior Corporate Panel)</option>
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
              <h3 className="text-sm font-bold text-slate-900">Step 8: Final Review & Master Hierarchy Verification</h3>
              <p className="text-xs text-slate-500">Review dossier summary before broadcasting to Valuer & Legal work queues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>Project & Asset Scope</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    HIERARCHY VALIDATED
                  </span>
                </div>
                <div>Builder: <strong className="text-slate-800">{selectedBuilder?.legalName}</strong> (ID: {selectedBuilderId})</div>
                <div>Project: <strong className="text-slate-800">{selectedProject?.projectName}</strong> (ID: {selectedProjectId})</div>
                <div>Phase: <strong className="text-slate-800">{selectedPhase?.phaseName}</strong></div>
                <div>
                  Towers: <strong className="text-indigo-800">{selectedTowers.map((t) => t.towerName).join(', ')}</strong>
                </div>
                <div>Units Under Sanction: <strong className="text-slate-800">{selectedUnitCount} Units</strong></div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-1.5">
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
                (currentStep === 3 && selectedTowerIds.length === 0)
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
