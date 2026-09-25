import React, { useState, useEffect } from 'react';
import {
  Building,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { DiscoveredProjectData, FetchJob } from '../../types/discoveryTypes';
import { BuilderMaster, ProjectMaster, UserAccount } from '../../types/apfTransaction';
import { discoveryService } from '../../services/discoveryService';

interface DiscoverProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  builder: BuilderMaster;
  currentUser: UserAccount;
  onProjectsImported: (savedProjects: ProjectMaster[], openTowerDiscoveryFor?: ProjectMaster) => void;
}

export const DiscoverProjectsModal: React.FC<DiscoverProjectsModalProps> = ({
  isOpen,
  onClose,
  builder,
  currentUser,
  onProjectsImported,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [currentJob, setCurrentJob] = useState<FetchJob | null>(null);
  const [projects, setProjects] = useState<DiscoveredProjectData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && builder) {
      handleFetchProjects();
    }
  }, [isOpen, builder]);

  if (!isOpen) return null;

  const handleFetchProjects = async () => {
    setIsFetching(true);
    setProjects([]);
    setSelectedIds(new Set());

    try {
      const results = await discoveryService.discoverProjectsForBuilder(
        builder.id,
        builder.legalName,
        (job) => setCurrentJob({ ...job })
      );
      setProjects(results);
      // Auto-select all new / non-existing projects by default
      const initialSelected = new Set(results.map((p) => p.id));
      setSelectedIds(initialSelected);
    } catch (err) {
      console.error('Project discovery error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleSelectProject = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedIds(new Set(projects.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleImportProjects = (openTowerDiscoveryFor?: DiscoveredProjectData) => {
    const projectsToImport = projects.filter((p) => selectedIds.has(p.id));
    if (projectsToImport.length === 0) return;

    const saved = discoveryService.commitDiscoveredProjects(
      projectsToImport,
      builder.id,
      currentUser
    );

    let targetProject: ProjectMaster | undefined;
    if (openTowerDiscoveryFor) {
      targetProject = saved.find((p) => p.id === openTowerDiscoveryFor.id);
    } else if (saved.length > 0) {
      targetProject = saved[0];
    }

    onProjectsImported(saved, targetProject);
  };

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
                  MahaRERA & Developer Project Discovery
                </h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono">
                  {builder.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Builder: <strong className="text-slate-200">{builder.legalName}</strong> ({builder.city})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Status Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {isFetching ? 'Scanning MahaRERA & Corporate Filings...' : `Discovered ${projects.length} Regulatory Projects`}
                </div>
                <div className="text-xs text-slate-500">
                  Cross-referencing RERA promoters, registered addresses, and developer investor disclosures
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFetchProjects}
                disabled={isFetching}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>REFETCH DATA</span>
              </button>
            </div>
          </div>

          {/* Job status banner if running */}
          {currentJob && currentJob.status !== 'READY_FOR_REVIEW' && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300">{currentJob.currentStepMessage}</span>
                <span className="font-mono text-slate-400">{currentJob.progressPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${currentJob.progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Project List */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSelectAll(selectedIds.size !== projects.length)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    {selectedIds.size === projects.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedIds.size === projects.length
                        ? 'DESELECT ALL'
                        : `SELECT ALL (${projects.length})`}
                    </span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">
                    {selectedIds.size} of {projects.length} projects selected for import
                  </span>
                </div>

                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Linked automatically to Master Builder ID: {builder.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => {
                  const isSelected = selectedIds.has(project.id);

                  return (
                    <div
                      key={project.id}
                      onClick={() => toggleSelectProject(project.id)}
                      className={`bg-white rounded-xl p-5 border-2 transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h4 className="text-base font-bold text-slate-900">
                                {project.projectName}
                              </h4>
                              {project.alreadyExists && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                  EXISTS IN MASTER ({project.existingProjectId})
                                </span>
                              )}
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                RERA: {project.reraNumber}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {(project.confidence * 100).toFixed(0)}% Match
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{project.address}</span>
                              <span className="text-slate-400">({project.locality}, {project.city})</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                              <div className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="font-semibold">{project.totalTowers || 2} Towers</span>
                                <span className="text-slate-400">({project.totalUnits || 250} Units)</span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Valid till: <strong>{project.completionDate}</strong></span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                                {project.projectType}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                              <div className="font-medium text-slate-700">Construction / Authority Detail:</div>
                              <div>{project.constructionDetail}</div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                                <span>Source: {project.source}</span>
                                {project.sourceUrl && (
                                  <a
                                    href={project.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    <span>MahaRERA Cert</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Button */}
                        <div className="shrink-0 flex flex-col items-end space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImportProjects(project);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-indigo-200"
                          >
                            <span>IMPORT & FETCH TOWERS</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            CANCEL
          </button>

          <div className="flex items-center space-x-3">
            <button
              disabled={selectedIds.size === 0}
              onClick={() => handleImportProjects()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>IMPORT {selectedIds.size} SELECTED PROJECTS TO MASTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
