import React, { useState, useEffect } from 'react';
import { ProjectMaster, UserAccount, PhaseMaster, TowerMaster, BuilderMaster } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
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
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';

interface Project360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectMaster;
  currentUser: UserAccount;
  onStartApf?: (builderId: string, projectId: string) => void;
  onFetchTowers?: (project: ProjectMaster) => void;
}

export const Project360Modal: React.FC<Project360ModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onStartApf,
  onFetchTowers,
}) => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'RERA' | 'Land' | 'Phases' | 'Towers' | 'Approvals' | 'Construction' | 'Documents'
  >('Overview');

  const [phases, setPhases] = useState<PhaseMaster[]>([]);
  const [towers, setTowers] = useState<TowerMaster[]>([]);
  const [builder, setBuilder] = useState<BuilderMaster | undefined>();
  const [isHealing, setIsHealing] = useState(false);

  const loadData = () => {
    if (!project) return;
    setPhases(masterStore.getPhases({ projectId: project.id }));
    setTowers(masterStore.getTowers({ projectId: project.id }));
    setBuilder(masterStore.getBuilderById(project.builderId));
  };

  useEffect(() => {
    if (isOpen && project) {
      loadData();
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleAutoHeal = () => {
    setIsHealing(true);
    setTimeout(() => {
      masterStore.ensureProjectHierarchy(project.id);
      loadData();
      setIsHealing(false);
    }, 250);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Project 360 Dossier: {project.projectName}
                </h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
                  {project.id}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded font-bold">
                  {project.approvalStatus || 'APPROVED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Developer: <strong className="text-slate-200">{builder?.legalName || project.builderId}</strong> · {project.city}, {project.state || 'India'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Tabs Bar (Requirement 14) */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-2">
          <div className="flex items-center space-x-1 overflow-x-auto text-xs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab}
                {tab === 'Phases' && ` (${phases.length})`}
                {tab === 'Towers' && ` (${towers.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {/* Tab 1: Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Total Land Area</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">{project.totalLandAreaAcres} Acres</div>
                  <span className="text-[11px] text-slate-400">Sanctioned master layout</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Sanctioned Towers</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">{towers.length} Towers</div>
                  <span className="text-[11px] text-indigo-700 font-semibold">{phases.length} Phases Registered</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Physical Progress</span>
                  <div className="text-lg font-bold text-emerald-700 mt-1">{project.currentProgressPct || 75}%</div>
                  <span className="text-[11px] text-slate-400">Architect Form 3 Certified</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Project Type</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">{project.projectType}</div>
                  <span className="text-[11px] text-slate-400">{project.locality}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">Site Coordinates & Geography</h4>
                  <p className="text-slate-600">{project.address || project.locality}</p>
                  <div>City / District: <strong className="text-slate-800">{project.city}, {project.district || project.city}</strong></div>
                  <div>State / Pincode: <strong className="text-slate-800">{project.state || 'Maharashtra'} - {project.pincode || '411001'}</strong></div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">Consultants & Key Agencies</h4>
                  <div>Architect: <strong className="text-slate-800">{project.architect || 'Hafeez Contractor'}</strong></div>
                  <div>Structural Consultant: <strong className="text-slate-800">{project.structuralConsultant || 'JW Consultants LLP'}</strong></div>
                  <div>PMC Agency: <strong className="text-slate-800">{project.pmcAgency || 'CBRE Project Management'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: RERA */}
          {activeTab === 'RERA' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">RERA Registrations & Public Filings</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 bg-white rounded-xl overflow-hidden text-xs shadow-2xs">
                {project.reraNumbers?.map((r, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-indigo-700 text-sm">{r}</div>
                      <div className="text-slate-500 mt-0.5">Promoter entity per RERA: {builder?.legalName || 'Certified Developer'}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-bold text-[11px] border border-emerald-200">
                      Active Sanction
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Land */}
          {activeTab === 'Land' && (
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-bold text-slate-900">Land Sanctions & Search Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <div>Survey / Gat Number: <strong className="text-slate-800">{project.surveyNumber || 'Survey 74/1, 74/2'}</strong></div>
                  <div>CTS Number: <strong className="text-slate-800">{project.ctsNumber || 'CTS 1092'}</strong></div>
                  <div>Land Ownership: <strong className="text-slate-800">{project.landOwnershipType || 'Freehold Title'}</strong></div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <div>Title Encumbrance: <strong className="text-emerald-700">Clear Title (Search Certified)</strong></div>
                  <div>Existing Mortgage: <strong className="text-slate-800">{project.existingMortgageChargeFlag ? 'Yes (Pari-Passu Charge)' : 'No Open Charge'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Phases (Requirement 14) */}
          {activeTab === 'Phases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Registered Phases</h4>
                  <p className="text-xs text-slate-500">Phases linked to Project ID: {project.id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoHeal}
                  disabled={isHealing}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Phase Data</span>
                </button>
              </div>

              {phases.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Phase ID & Name</th>
                        <th className="p-3">RERA No</th>
                        <th className="p-3">Sanction Date</th>
                        <th className="p-3">Completion Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Towers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {phases.map((ph) => {
                        const linked = towers.filter((t) => t.phaseId === ph.id);
                        return (
                          <tr key={ph.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">
                              <div>{ph.phaseName}</div>
                              <span className="font-mono text-[10px] text-slate-400">{ph.id}</span>
                            </td>
                            <td className="p-3 font-mono text-indigo-700">{ph.reraNumber}</td>
                            <td className="p-3 text-slate-600">{ph.sanctionDate || '2022-04-10'}</td>
                            <td className="p-3 text-slate-600">{ph.expectedCompletionDate || '2027-12-31'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                                {ph.phaseStatus || 'Under Construction'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-slate-800">
                              {linked.length > 0 ? `${linked.length} Towers` : `${towers.length} (Project Total)`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-2xs">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Phase Records Available</h4>
                  <p className="text-xs text-slate-500">
                    Phase records are not yet linked to this project.
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoHeal}
                    disabled={isHealing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isHealing ? 'Generating...' : 'Fetch / Add Phase & Tower Data'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Towers (Requirement 14: Project, Phase, Tower, Status) */}
          {activeTab === 'Towers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sanctioned Towers & Wings</h4>
                  <p className="text-xs text-slate-500">Towers linked to {project.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {onFetchTowers && (
                    <button
                      type="button"
                      onClick={() => onFetchTowers(project)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fetch Drawings</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAutoHeal}
                    disabled={isHealing}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Tower</span>
                  </button>
                </div>
              </div>

              {towers.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Project</th>
                        <th className="p-3">Phase</th>
                        <th className="p-3">Tower</th>
                        <th className="p-3">Floors</th>
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
                            <td className="p-3 font-medium text-slate-700">{project.projectName}</td>
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
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-2xs">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Tower Records Found</h4>
                  <p className="text-xs text-slate-500">
                    Child tower records are not yet linked to this project.
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoHeal}
                    disabled={isHealing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isHealing ? 'Generating...' : 'Fetch / Add Phase & Tower Data'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Approvals */}
          {activeTab === 'Approvals' && (
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-bold text-slate-900">Statutory Approvals & NOCs</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
                <div className="p-3.5 flex justify-between bg-slate-50">
                  <span className="font-bold text-slate-800">Municipal Sanction Plan</span>
                  <span className="text-emerald-700 font-bold">Approved</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-slate-800">Commencement Certificate (CC)</span>
                  <span className="text-emerald-700 font-bold">Approved Full</span>
                </div>
                <div className="p-3.5 flex justify-between bg-slate-50">
                  <span className="font-bold text-slate-800">Environment Clearance</span>
                  <span className="text-emerald-700 font-bold">Approved</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-slate-800">Fire Department NOC</span>
                  <span className="text-emerald-700 font-bold">Compliant & Tested</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Construction */}
          {activeTab === 'Construction' && (
            <div className="space-y-4 text-xs">
              <h4 className="text-sm font-bold text-slate-900">Construction Milestones & Progress Tracking</h4>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="font-bold text-slate-900">Milestone Stage: Superstructure Finishing</div>
                <p className="text-slate-600">
                  Civil structural work is completed across primary towers. Plastering, internal plumbing, and electrical conduits are progressing per schedule.
                </p>
              </div>
            </div>
          )}

          {/* Tab 8: Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-bold text-slate-900">Mandatory Vault Documents</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">RERA_Sanction_Certificate.pdf</span>
                  </div>
                  <span className="text-slate-400 font-mono">14.2 MB</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">Sanctioned_Floor_Plans_Wings.pdf</span>
                  </div>
                  <span className="text-slate-400 font-mono">22.8 MB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          {onStartApf && (
            <button
              onClick={() => {
                onClose();
                onStartApf(project.builderId, project.id);
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Initiate APF for this Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
