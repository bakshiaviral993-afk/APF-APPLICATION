import React, { useState, useEffect } from 'react';
import { useAPF } from '../../context/APFContext';
import { masterStore } from '../../services/masterStore';
import { ProjectMaster, PhaseMaster, TowerMaster } from '../../types/apfTransaction';
import {
  Building,
  Layers,
  MapPin,
  FileCheck,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const Screen12_Project360: React.FC = () => {
  const { setCurrentScreen } = useAPF();
  const [projects, setProjects] = useState<ProjectMaster[]>(() => masterStore.getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'PRJ-PUN-001');
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'RERA' | 'Land' | 'Phases' | 'Towers' | 'Approvals' | 'Construction' | 'Documents'
  >('Overview');

  useEffect(() => {
    const unsub = masterStore.subscribe(() => {
      const pList = masterStore.getProjects();
      setProjects(pList);
      if (!selectedProjectId && pList.length > 0) {
        setSelectedProjectId(pList[0].id);
      }
    });
    return unsub;
  }, [selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const phases = selectedProject ? masterStore.getPhases({ projectId: selectedProject.id }) : [];
  const towers = selectedProject ? masterStore.getTowers({ projectId: selectedProject.id }) : [];
  const builder = selectedProject ? masterStore.getBuilderById(selectedProject.builderId) : undefined;

  const handleAutoHeal = () => {
    if (selectedProject) {
      masterStore.ensureProjectHierarchy(selectedProject.id);
    }
  };

  const tabs = [
    'Overview',
    'RERA',
    'Land',
    'Phases',
    'Towers',
    'Approvals',
    'Construction',
    'Documents',
  ] as const;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project 360 Comprehensive Dossier</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Master-Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single view for Project, Phase, Tower hierarchy, statutory sanctions, RERA disclosures & monitoring.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Switch Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName} ({p.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <>
          {/* Project Identity Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">{selectedProject.projectName}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {selectedProject.id}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  APF Approved
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Developer: <strong className="text-slate-800">{builder?.legalName || selectedProject.builderId}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-slate-800">{selectedProject.city}, {selectedProject.state}</strong></span>
                <span>•</span>
                <span>Primary RERA: <strong className="text-indigo-700 font-mono">{selectedProject.reraNumbers?.[0] || 'RERA-REGISTERED'}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAutoHeal}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verify Hierarchy</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Requirement 14) */}
          <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs">
            <div className="flex items-center space-x-1 overflow-x-auto text-xs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                  {tab === 'Phases' && ` (${phases.length})`}
                  {tab === 'Towers' && ` (${towers.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            {/* 1. Overview */}
            {activeTab === 'Overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold">Total Land Area</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">{selectedProject.totalLandAreaAcres} Acres</div>
                    <span className="text-[11px] text-slate-400">Sanctioned layout</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold">Total Towers / Wings</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">{towers.length} Towers</div>
                    <span className="text-[11px] text-indigo-600 font-semibold">{phases.length} Phases Registered</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold">Physical Progress</span>
                    <div className="text-lg font-bold text-emerald-700 mt-1">{selectedProject.currentProgressPct || 75}%</div>
                    <span className="text-[11px] text-slate-400">Quarterly Form 3</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold">Project Type</span>
                    <div className="text-lg font-bold text-slate-900 mt-1">{selectedProject.projectType}</div>
                    <span className="text-[11px] text-slate-400">{selectedProject.locality}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">Site & Technical Address</h3>
                    <p className="text-slate-600">{selectedProject.address || selectedProject.locality}</p>
                    <div className="text-slate-500">City / District: <strong className="text-slate-700">{selectedProject.city}, {selectedProject.district || selectedProject.city}</strong></div>
                    <div className="text-slate-500">State / Pincode: <strong className="text-slate-700">{selectedProject.state} - {selectedProject.pincode || '411001'}</strong></div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">Consultants & Key Agencies</h3>
                    <div className="text-slate-600">Architect: <strong className="text-slate-800">{selectedProject.architect || 'Hafeez Contractor & Associates'}</strong></div>
                    <div className="text-slate-600">Structural Consultant: <strong className="text-slate-800">{selectedProject.structuralConsultant || 'JW Consultants LLP'}</strong></div>
                    <div className="text-slate-600">PMC: <strong className="text-slate-800">{selectedProject.pmcAgency || 'CBRE Project Management'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RERA */}
            {activeTab === 'RERA' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Registered RERA Identifiers & Promoters</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {selectedProject.reraNumbers?.map((r, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <div className="font-mono font-bold text-indigo-700 text-sm">{r}</div>
                        <div className="text-slate-500 mt-0.5">Promoter per RERA: {builder?.legalName || 'Authorized Developer'}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                        Active & Valid
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Land */}
            {activeTab === 'Land' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Land Title & Encumbrance Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                    <div>Survey / Gat Number: <strong className="text-slate-800">{selectedProject.surveyNumber || 'Survey 74/1, 74/2'}</strong></div>
                    <div>CTS Number: <strong className="text-slate-800">{selectedProject.ctsNumber || 'CTS 1092'}</strong></div>
                    <div>Ownership Type: <strong className="text-slate-800">{selectedProject.landOwnershipType || 'Freehold Title'}</strong></div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                    <div>Encumbrance Status: <strong className="text-emerald-700">Clear / Search Complete</strong></div>
                    <div>Existing Mortgage Charge: <strong className="text-slate-800">{selectedProject.existingMortgageChargeFlag ? 'Yes (Pari-Passu)' : 'No Open Charge'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Phases (Requirement 14) */}
            {activeTab === 'Phases' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Project Development Phases</h3>
                    <p className="text-xs text-slate-500">Phased RERA approvals linked to Project ID: {selectedProject.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoHeal}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Phase Data</span>
                  </button>
                </div>

                {phases.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Phase ID & Name</th>
                          <th className="p-3">RERA Registration</th>
                          <th className="p-3">Sanction Date</th>
                          <th className="p-3">Completion Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Towers Linked</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {phases.map((ph) => {
                          const linkedTowers = towers.filter((t) => t.phaseId === ph.id);
                          return (
                            <tr key={ph.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">
                                <div>{ph.phaseName}</div>
                                <span className="font-mono text-[10px] text-slate-400">{ph.id}</span>
                              </td>
                              <td className="p-3 font-mono text-indigo-700">{ph.reraNumber || 'RERA-REGISTERED'}</td>
                              <td className="p-3 text-slate-600">{ph.sanctionDate || '2022-04-10'}</td>
                              <td className="p-3 text-slate-600">{ph.expectedCompletionDate || '2027-12-31'}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                                  {ph.phaseStatus || 'Under Construction'}
                                </span>
                              </td>
                              <td className="p-3 text-right font-bold text-slate-800">
                                {linkedTowers.length > 0 ? `${linkedTowers.length} Towers` : `${towers.length} (Project Total)`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Phase Records Available</h4>
                    <p className="text-xs text-slate-500">
                      This project does not have child phase records staged in Master Data.
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoHeal}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fetch / Add Phase & Tower Data</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. Towers (Requirement 14: Project, Phase, Tower, Status) */}
            {activeTab === 'Towers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tower & Wing Master Register</h3>
                    <p className="text-xs text-slate-500">Sanctioned wings and structural milestones for {selectedProject.projectName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoHeal}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Tower</span>
                  </button>
                </div>

                {towers.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Project</th>
                          <th className="p-3">Phase</th>
                          <th className="p-3">Tower</th>
                          <th className="p-3">Sanctioned Floors</th>
                          <th className="p-3">Units</th>
                          <th className="p-3">Construction Stage</th>
                          <th className="p-3">Progress %</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {towers.map((t) => {
                          const ph = phases.find((p) => p.id === t.phaseId);
                          return (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="p-3 font-medium text-slate-700">{selectedProject.projectName}</td>
                              <td className="p-3 font-medium text-slate-600">{ph ? ph.phaseName : 'Main Project'}</td>
                              <td className="p-3 font-bold text-slate-900">
                                <div>{t.towerName}</div>
                                <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                              </td>
                              <td className="p-3 text-slate-700">{t.floorsSanctioned} Floors</td>
                              <td className="p-3 text-slate-700">{t.totalUnits || 48} Units</td>
                              <td className="p-3 text-slate-600">{t.constructionStage || 'Superstructure Complete'}</td>
                              <td className="p-3 font-bold text-emerald-700">{t.physicalProgressPct || 70}%</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                                  {t.approvalStatus || 'APPROVED'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Tower Records Found</h4>
                    <p className="text-xs text-slate-500">
                      Child tower sanctions are not yet mapped to this project.
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoHeal}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fetch / Add Phase & Tower Data</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 6. Approvals */}
            {activeTab === 'Approvals' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Statutory Clearances & NOCs</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 flex justify-between bg-slate-50">
                    <span className="font-bold text-slate-800">Municipal Sanction Plan</span>
                    <span className="text-emerald-700 font-bold">Approved</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-800">Commencement Certificate</span>
                    <span className="text-emerald-700 font-bold">Approved (CC Full)</span>
                  </div>
                  <div className="p-3 flex justify-between bg-slate-50">
                    <span className="font-bold text-slate-800">Environment Clearance (SEIAA)</span>
                    <span className="text-emerald-700 font-bold">Valid till 2028</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="font-bold text-slate-800">Chief Fire Officer NOC</span>
                    <span className="text-emerald-700 font-bold">Compliant & Tested</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Construction */}
            {activeTab === 'Construction' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Quarterly Construction Stage & Milestones</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Current Milestone: Superstructure Finishing</div>
                  <p className="text-slate-600">
                    Slab casting complete up to 20th floor across primary wings. Brickwork, internal plastering and plumbing shafts active.
                  </p>
                </div>
              </div>
            )}

            {/* 8. Documents */}
            {activeTab === 'Documents' && (
              <div className="space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Project Master Vault Documents</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">RERA_Sanctioned_Layout_Blueprint.pdf</span>
                    </div>
                    <span className="text-slate-400 font-mono">14.2 MB</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">Commencement_Certificate_Full.pdf</span>
                    </div>
                    <span className="text-slate-400 font-mono">4.8 MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
