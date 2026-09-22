import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_PHASE_MASTER,
  CENTRAL_TOWER_MASTER,
  getProjectsByBuilder,
  getPhasesByProject,
  getTowersByProject,
} from '../../data/centralMasterData';
import {
  X,
  Building2,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (newCaseId: string) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onCaseCreated,
}) => {
  // Cascading Master State
  const [selectedBuilderId, setSelectedBuilderId] = useState(CENTRAL_BUILDER_MASTER[0].id);
  const projectsForBuilder = getProjectsByBuilder(selectedBuilderId);
  const [selectedProjectId, setSelectedProjectId] = useState(projectsForBuilder[0]?.id || '');

  // Update project when builder changes
  const handleBuilderChange = (bId: string) => {
    setSelectedBuilderId(bId);
    const prjs = getProjectsByBuilder(bId);
    if (prjs.length > 0) {
      setSelectedProjectId(prjs[0].id);
      const phs = getPhasesByProject(prjs[0].id);
      setSelectedPhaseId(phs[0]?.id || '');
      const twrs = getTowersByProject(prjs[0].id);
      setSelectedTowerIds(twrs.map((t) => t.id));
    } else {
      setSelectedProjectId('');
      setSelectedPhaseId('');
      setSelectedTowerIds([]);
    }
  };

  const phasesForProject = getPhasesByProject(selectedProjectId);
  const [selectedPhaseId, setSelectedPhaseId] = useState(phasesForProject[0]?.id || '');

  const towersForProject = getTowersByProject(selectedProjectId);
  const [selectedTowerIds, setSelectedTowerIds] = useState<string[]>(
    towersForProject.map((t) => t.id)
  );

  // Update phases & towers when project changes
  const handleProjectChange = (pId: string) => {
    setSelectedProjectId(pId);
    const phs = getPhasesByProject(pId);
    setSelectedPhaseId(phs[0]?.id || '');
    const twrs = getTowersByProject(pId);
    setSelectedTowerIds(twrs.map((t) => t.id));
  };

  // Request details
  const [requestType, setRequestType] = useState<'New APF' | 'Renewal' | 'Revaluation'>('New APF');
  const [businessUnit, setBusinessUnit] = useState('Retail Mortgage Assets');
  const [branch, setBranch] = useState('Pune Main Branch (Code 0412)');
  const [priority, setPriority] = useState<'High' | 'Standard' | 'Urgent'>('High');
  const [proposedExposureCr, setProposedExposureCr] = useState<number>(85);
  const [requestedRetailSourcingLimitCr, setRequestedRetailSourcingLimitCr] = useState<number>(150);

  const [documentChecks, setDocumentChecks] = useState({
    reraCert: true,
    sanctionPlan: true,
    ccCert: true,
    titleDoc: true,
    financialDoc: true,
  });

  if (!isOpen) return null;

  const currentBuilder = CENTRAL_BUILDER_MASTER.find((b) => b.id === selectedBuilderId);
  const currentProject = CENTRAL_PROJECT_MASTER.find((p) => p.id === selectedProjectId);

  const toggleTower = (tId: string) => {
    if (selectedTowerIds.includes(tId)) {
      if (selectedTowerIds.length > 1) {
        setSelectedTowerIds(selectedTowerIds.filter((id) => id !== tId));
      }
    } else {
      setSelectedTowerIds([...selectedTowerIds, tId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilderId || !selectedProjectId || !selectedPhaseId || selectedTowerIds.length === 0) {
      alert('Please select valid Builder, Project, Phase, and at least one Tower.');
      return;
    }

    const createdCase = apfStore.createNewCase({
      builderId: selectedBuilderId,
      projectId: selectedProjectId,
      phaseId: selectedPhaseId,
      selectedTowerIds,
      requestType,
      businessUnit,
      branch,
      proposedExposureCr,
      requestedRetailSourcingLimitCr,
      priority,
    });

    onCaseCreated(createdCase.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-900/60 text-[#8bb3cb]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Initiate New APF Underwriting Case</h2>
              <p className="text-[11px] text-[#8bb3cb]">
                CPA Initiation • Driven 100% from Centralized Relational Master
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-[#102a43]">
          {/* Section 1: Central Builder Master */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
              <span className="font-bold uppercase tracking-wider text-[#19638c] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>1. Select Builder (Central Master)</span>
              </span>
              <span className="text-[10px] text-[#829ab1] font-mono">ID: {selectedBuilderId}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#334e68] mb-1">Developer Legal Entity *</label>
                <select
                  value={selectedBuilderId}
                  onChange={(e) => handleBuilderChange(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs focus:ring-2 focus:ring-[#19638c]"
                >
                  {CENTRAL_BUILDER_MASTER.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.legalName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Group Affiliation</label>
                <input
                  type="text"
                  readOnly
                  value={currentBuilder?.groupName || ''}
                  className="w-full p-2 rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] text-[#627d98] font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2">
                <div>
                  <span className="text-[10px] font-bold text-[#829ab1] uppercase">PAN</span>
                  <div className="font-mono font-bold text-[#334e68]">{currentBuilder?.pan}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#829ab1] uppercase">CIN</span>
                  <div className="font-mono font-bold text-[#334e68]">{currentBuilder?.cin}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#829ab1] uppercase">Track Record</span>
                  <div className="font-bold text-emerald-700">
                    {currentBuilder?.totalProjectsCompleted} Delivered / {currentBuilder?.totalOngoingProjects} Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Central Project & Tower Master */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
              <span className="font-bold uppercase tracking-wider text-[#19638c] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>2. Project, Phase & Tower Hierarchy</span>
              </span>
              <span className="text-[10px] text-[#829ab1] font-mono">Relational Cascade</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#334e68] mb-1">Project Name (Linked to Builder) *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs focus:ring-2 focus:ring-[#19638c]"
                >
                  {projectsForBuilder.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} — {p.locality}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">RERA Number(s)</label>
                <div className="p-2 rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] text-[#19638c] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentProject?.reraNumbers.join(', ')}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Phase Master *</label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => setSelectedPhaseId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs focus:ring-2 focus:ring-[#19638c]"
                >
                  {phasesForProject.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.phaseName} ({ph.reraNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Tower Scope * (Multi-Select)</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {towersForProject.map((t) => {
                    const isChecked = selectedTowerIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => toggleTower(t.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all border ${
                          isChecked
                            ? 'bg-[#19638c] text-white border-[#19638c] shadow-2xs'
                            : 'bg-white text-[#627d98] border-[#cbd5e1] hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {t.towerName} ({t.floorsSanctioned} Floors)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Request & Limits */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-3">
            <div className="border-b border-[#e2e8f0] pb-2">
              <span className="font-bold uppercase tracking-wider text-[#19638c]">
                3. Underwriting Scope & Financial Caps
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#334e68] mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs"
                >
                  <option value="New APF">New APF Scheme</option>
                  <option value="Renewal">Renewal / Extension</option>
                  <option value="Revaluation">Periodic Revaluation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Priority SLA</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs"
                >
                  <option value="High">High (24-48 Hours)</option>
                  <option value="Standard">Standard (72 Hours)</option>
                  <option value="Urgent">Urgent Fast-Track (24 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Branch Sourcing Code</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Proposed Bank Exposure (₹ Cr)</label>
                <input
                  type="number"
                  value={proposedExposureCr}
                  onChange={(e) => setProposedExposureCr(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-bold text-[#102a43] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Retail Sourcing Limit (₹ Cr)</label>
                <input
                  type="number"
                  value={requestedRetailSourcingLimitCr}
                  onChange={(e) => setRequestedRetailSourcingLimitCr(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#cbd5e1] bg-white font-bold text-emerald-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334e68] mb-1">Target Business TAT</label>
                <div className="p-2 rounded-lg bg-[#f1f5f9] text-[#627d98] font-bold">
                  Within 48 Hours
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Document Checklist */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <span className="font-bold uppercase tracking-wider text-[#19638c] block">
              4. Mandatory Legal & Sanction Documents (Pre-Checked)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {Object.entries(documentChecks).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#e2e8f0] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setDocumentChecks({ ...documentChecks, [key]: e.target.checked })
                    }
                    className="rounded text-[#19638c] focus:ring-0"
                  />
                  <span className="text-[11px] font-semibold text-[#334e68]">
                    {key === 'reraCert'
                      ? 'RERA Certificate'
                      : key === 'sanctionPlan'
                      ? 'Sanctioned Layout Plan'
                      : key === 'ccCert'
                      ? 'Commencement Cert (CC)'
                      : key === 'titleDoc'
                      ? 'Title Clearance Report'
                      : 'Audited Financials / Escrow'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#627d98] hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Create Case & Open Valuation Assignment →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
