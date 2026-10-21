import React, { useState, useEffect, useMemo } from 'react';
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
  Globe2,
  Filter,
  Check,
  Tag,
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

  // Post-fetch Geographic & Attribute Filters (Defaults to ALL per requirement 4)
  const [stateFilter, setStateFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [reraAuthFilter, setReraAuthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectTypeFilter, setProjectTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Import mode: default is to import child hierarchy (phases + towers) per Requirement 7
  const [importChildHierarchy, setImportChildHierarchy] = useState(true);
  const [showCoveragePanel, setShowCoveragePanel] = useState(true);

  // Reset filters and fetch when builder changes (Requirement 8)
  useEffect(() => {
    if (isOpen && builder) {
      setStateFilter('ALL');
      setCityFilter('ALL');
      setReraAuthFilter('ALL');
      setStatusFilter('ALL');
      setProjectTypeFilter('ALL');
      setSearchTerm('');
      handleFetchProjects();
    }
  }, [isOpen, builder?.id]);

  if (!isOpen) return null;

  const handleFetchProjects = async () => {
    setIsFetching(true);
    setProjects([]);
    setSelectedIds(new Set());

    try {
      // Default Fetch Scope: ALL INDIA (no city or branch filter automatically inherited)
      const results = await discoveryService.discoverProjectsForBuilder(
        builder.id,
        builder.legalName,
        (job) => setCurrentJob({ ...job })
      );
      setProjects(results);
      // Auto-select all discovered projects by default
      const initialSelected = new Set(results.map((p) => p.id));
      setSelectedIds(initialSelected);
    } catch (err) {
      console.error('Project discovery error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // Derive unique filter options from fetched results
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.state) set.add(p.state);
    });
    return Array.from(set).sort();
  }, [projects]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (stateFilter === 'ALL' || p.state?.toLowerCase() === stateFilter.toLowerCase()) {
        if (p.city) set.add(p.city);
      }
    });
    return Array.from(set).sort();
  }, [projects, stateFilter]);

  const availableReraAuthorities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.reraAuthority) set.add(p.reraAuthority);
    });
    return Array.from(set).sort();
  }, [projects]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.projectStatus) set.add(p.projectStatus);
    });
    return Array.from(set).sort();
  }, [projects]);

  const availableProjectTypes = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.projectType) set.add(p.projectType);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Filtered project list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (stateFilter !== 'ALL' && p.state?.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }
      if (cityFilter !== 'ALL' && p.city?.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }
      if (reraAuthFilter !== 'ALL' && p.reraAuthority !== reraAuthFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && p.projectStatus !== statusFilter) {
        return false;
      }
      if (projectTypeFilter !== 'ALL' && p.projectType !== projectTypeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = p.projectName.toLowerCase().includes(q);
        const matchLoc = p.locality?.toLowerCase().includes(q) || false;
        const matchCity = p.city?.toLowerCase().includes(q) || false;
        const matchRera = p.reraNumber?.toLowerCase().includes(q) || p.reraNumbers?.some((r) => r.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchCity && !matchRera) {
          return false;
        }
      }
      return true;
    });
  }, [projects, stateFilter, cityFilter, reraAuthFilter, statusFilter, projectTypeFilter, searchTerm]);

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
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleImportProjects = (openTowerDiscoveryFor?: DiscoveredProjectData) => {
    const projectsToImport = projects.filter((p) => selectedIds.has(p.id));
    if (projectsToImport.length === 0) return;

    // Commit projects with child data (phases & towers) per Requirement 7
    const saved = discoveryService.commitDiscoveredProjects(
      projectsToImport,
      builder.id,
      currentUser,
      { importChildData: importChildHierarchy }
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  All-India Builder Project Discovery & Hierarchy Auto-Fetch
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-0.5 rounded font-mono font-bold">
                  ALL INDIA SCOPE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Target Builder: <strong className="text-white font-semibold">{builder.legalName}</strong> (HQ: {builder.city || 'India'}) · Master ID: <span className="font-mono text-indigo-300">{builder.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/70">
          {/* Status & Scope Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{isFetching ? 'Scanning All-India Regulatory Portals...' : `Discovered ${projects.length} Projects across India`}</span>
                  {!isFetching && projects.length > 0 && (
                    <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {availableStates.length} States · {availableCities.length} Cities
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  Default fetch scope is nationwide (Country: India, State: ALL, City: ALL). Search is not restricted by login branch.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCoveragePanel((prev) => !prev)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-indigo-200 cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showCoveragePanel ? 'Hide Source Coverage' : 'Coverage Panel'}</span>
              </button>
              <button
                onClick={handleFetchProjects}
                disabled={isFetching}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>REFETCH ALL-INDIA</span>
              </button>
            </div>
          </div>

          {/* Project Discovery Source Coverage View (Requirement 10) */}
          {showCoveragePanel && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Project Discovery Coverage Matrix
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (Central Regulatory Connectors & Fallback Dataset)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Discovery covers all Indian states. Unconnected state RERAs fall back to Central Project Master.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Maharashtra RERA</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Gujarat RERA</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Haryana RERA</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Karnataka RERA</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Not Connected
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Telangana RERA</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Not Connected
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-slate-600 font-medium">Builder Website / MCA</span>
                  <span className="font-bold text-indigo-700 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Available
                  </span>
                </div>
              </div>
            </div>
          )}

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
                {currentJob.sources.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="truncate">{s.sourceName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post-Fetch Geographic & Attribute Filter Bar (Requirement 4) */}
          {projects.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Geographic & Project Filters (Optional)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStateFilter('ALL');
                    setCityFilter('ALL');
                    setReraAuthFilter('ALL');
                    setStatusFilter('ALL');
                    setProjectTypeFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                >
                  Reset to ALL INDIA
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Project, Locality, RERA..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* State Filter */}
                <div>
                  <select
                    value={stateFilter}
                    onChange={(e) => {
                      setStateFilter(e.target.value);
                      setCityFilter('ALL');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                  >
                    <option value="ALL">State: ALL ({availableStates.length})</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                  >
                    <option value="ALL">City: ALL ({availableCities.length})</option>
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RERA Authority Filter */}
                <div>
                  <select
                    value={reraAuthFilter}
                    onChange={(e) => setReraAuthFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                  >
                    <option value="ALL">RERA: ALL</option>
                    {availableReraAuthorities.map((auth) => (
                      <option key={auth} value={auth}>
                        {auth}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                  >
                    <option value="ALL">Status: ALL</option>
                    {availableStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Child Hierarchy Import Setting (Requirement 7) */}
          <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-indigo-950">Child Data Synchronization Mode:</span>
                <p className="text-indigo-800 text-[11px]">
                  Configured to populate Phase and Tower masters automatically upon import so they are immediately selectable during APF initiation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importChildHierarchy}
                  onChange={() => setImportChildHierarchy(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-800">Import Project + Phases + Towers (Recommended)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={!importChildHierarchy}
                  onChange={() => setImportChildHierarchy(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600">Import Project Only</span>
              </label>
            </div>
          </div>

          {/* Project List */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSelectAll(selectedIds.size !== filteredProjects.length)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedIds.size === filteredProjects.length
                        ? 'DESELECT ALL'
                        : `SELECT ALL (${filteredProjects.length})`}
                    </span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">
                    Showing {filteredProjects.length} of {projects.length} nationwide projects · {selectedIds.size} selected
                  </span>
                </div>

                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Linked to Master Builder ID: {builder.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {filteredProjects.map((project) => {
                  const isSelected = selectedIds.has(project.id);
                  const isBranchMatch = currentUser.agencyOrDept?.toLowerCase().includes(project.city.toLowerCase());

                  return (
                    <div
                      key={project.id}
                      onClick={() => toggleSelectProject(project.id)}
                      className={`bg-white rounded-xl p-4 sm:p-5 border-2 transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                          <div className="mt-1">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>

                          <div className="space-y-2 flex-1 min-w-0">
                            {/* Title & Badges */}
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                                {project.projectName}
                              </h4>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {project.id}
                              </span>
                              {project.alreadyExists && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                  EXISTS IN MASTER ({project.existingProjectId})
                                </span>
                              )}
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                {project.reraAuthority || 'RERA'}: {project.reraNumber}
                              </span>
                              <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded border border-indigo-200">
                                {project.city}, {project.state}
                              </span>
                              {isBranchMatch ? (
                                <span className="bg-sky-50 text-sky-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-200">
                                  Your Branch City ({project.city})
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                                  Nationwide Discovery (Branch: {project.city})
                                </span>
                              )}
                            </div>

                            {/* Address & Locality */}
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{project.address}</span>
                              <span className="text-slate-400 font-medium">({project.locality}, {project.city}, {project.state})</span>
                            </p>

                            {/* Project Specs: Phases, Towers, Completion, Status */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                              <div className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="font-bold text-slate-800">{project.totalTowers || 2} Sanctioned Towers</span>
                                <span className="text-slate-400 font-medium">({project.totalUnits || 250} Units across {project.phaseCount || 1} Phases)</span>
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
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-emerald-700">
                                {project.projectStatus}
                              </span>
                            </div>

                            {/* Regulatory Evidence Details */}
                            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                              <div className="font-medium text-slate-700">Construction & Authority Detail:</div>
                              <div>{project.constructionDetail}</div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                                <span>Source: {project.source} (As of {project.sourceDate || '2026-03'})</span>
                                {project.sourceUrl && (
                                  <a
                                    href={project.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                                  >
                                    <span>Verify on {project.reraAuthority || 'RERA'} Portal</span>
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImportProjects(project);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-indigo-200 cursor-pointer"
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
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Projects Found Matching Filter</h4>
              <p className="text-xs text-slate-500">
                Adjust your state, city or keyword filters to view all projects associated with {builder.legalName}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStateFilter('ALL');
                  setCityFilter('ALL');
                  setReraAuthFilter('ALL');
                  setStatusFilter('ALL');
                  setProjectTypeFilter('ALL');
                  setSearchTerm('');
                }}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-indigo-700"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              disabled={selectedIds.size === 0}
              onClick={() => handleImportProjects()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>
                IMPORT {selectedIds.size} SELECTED PROJECTS
                {importChildHierarchy ? ' + PHASES & TOWERS' : ''}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
