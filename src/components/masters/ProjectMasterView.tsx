import React, { useState, useEffect } from 'react';
import { ProjectMaster, UserAccount, MasterAuditLog, BuilderMaster, PhaseMaster, TowerMaster } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { apfStore } from '../../services/apfStore';
import { ProjectStepperModal } from './ProjectStepperModal';
import { PhaseModal } from './PhaseModal';
import { MasterAuditModal } from './MasterAuditModal';
import { PendingMasterApprovalsModal } from './PendingMasterApprovalsModal';
import { DiscoverProjectsModal } from '../discovery/DiscoverProjectsModal';
import { DiscoverTowersModal } from '../discovery/DiscoverTowersModal';
import { RefreshDiffModal } from '../discovery/RefreshDiffModal';
import { SourceEvidenceDrawer } from '../discovery/SourceEvidenceDrawer';
import { canAccessExposureReport } from '../../utils/exposurePermissions';
import {
  MapPin,
  Plus,
  Search,
  Download,
  Clock,
  History,
  Edit,
  Power,
  ExternalLink,
  ShieldCheck,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  BarChart3,
  Building,
} from 'lucide-react';

interface ProjectMasterViewProps {
  currentUser?: UserAccount;
  onNavigateToTowers?: (projectId: string) => void;
  onNavigateToExposure?: (builderId: string) => void;
  onStartApfTransaction?: (builderId: string, projectId?: string) => void;
}

export const ProjectMasterView: React.FC<ProjectMasterViewProps> = ({
  currentUser: propUser,
  onNavigateToTowers,
  onNavigateToExposure,
  onStartApfTransaction,
}) => {
  const currentUser = propUser || apfStore.getCurrentUser();
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [builders, setBuilders] = useState<BuilderMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<'ALL' | 'Pune' | 'Mumbai'>('ALL');
  const [builderFilter, setBuilderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'TOWERS' | 'PROGRESS' | 'UNITS'>('NAME');

  // Modals
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectMaster | null>(null);

  // Discovery modals
  const [isDiscoverProjectsOpen, setIsDiscoverProjectsOpen] = useState(false);
  const [targetBuilderForProjects, setTargetBuilderForProjects] = useState<BuilderMaster | null>(null);
  const [isDiscoverTowersOpen, setIsDiscoverTowersOpen] = useState(false);
  const [targetProjectForTowers, setTargetProjectForTowers] = useState<ProjectMaster | null>(null);

  // Evidence & Refresh modals
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [evidenceDrawerData, setEvidenceDrawerData] = useState<{
    title: string;
    subtitle?: string;
    fields?: any;
    rawPayload?: string;
  } | null>(null);

  const [isRefreshDiffOpen, setIsRefreshDiffOpen] = useState(false);
  const [targetEntityForRefresh, setTargetEntityForRefresh] = useState<{
    name: string;
    type: 'BUILDER' | 'PROJECT';
  } | null>(null);

  // Phase modal
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [activeProjectIdForPhase, setActiveProjectIdForPhase] = useState('');

  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>([]);
  const [auditRecordName, setAuditRecordName] = useState('');
  const [auditRecordId, setAuditRecordId] = useState('');

  // Pending approvals modal
  const [approvalsModalOpen, setApprovalsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = () => {
    setProjects(masterStore.getProjects());
    setBuilders(masterStore.getBuilders());
    setPendingCount(masterStore.getPendingApprovals().length);
  };

  useEffect(() => {
    loadData();
    const unsub = masterStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsStepperOpen(true);
  };

  const handleOpenEdit = (p: ProjectMaster) => {
    setEditingProject(p);
    setIsStepperOpen(true);
  };

  const handleAddPhase = (projectId: string) => {
    setActiveProjectIdForPhase(projectId);
    setPhaseModalOpen(true);
  };

  const handleToggleActive = (p: ProjectMaster) => {
    if (!currentUser) return;
    const action = p.isActive ? 'Deactivate' : 'Reactivate';
    const reason = prompt(`Please state the reason to ${action} project "${p.projectName}":`);
    if (!reason || !reason.trim()) return;

    masterStore.toggleActive('Project', p.id, currentUser, reason.trim());
    loadData();
  };

  const handleViewAudit = (p: ProjectMaster) => {
    const history = masterStore.getAuditLogs('Project', p.id);
    setAuditLogs(history);
    setAuditRecordName(p.projectName);
    setAuditRecordId(p.id);
    setAuditModalOpen(true);
  };

  const handleExport = (format: 'CSV' | 'JSON') => {
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Project_Master_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Project ID', 'Project Name', 'Builder ID', 'City', 'Locality', 'MahaRERA Numbers', 'Status', 'Approval', 'Sanctioned Towers', 'Progress %'];
      const rows = filteredProjects.map((p) => [
        p.id,
        `"${p.projectName.replace(/"/g, '""')}"`,
        p.builderId,
        p.city,
        `"${p.locality.replace(/"/g, '""')}"`,
        `"${p.reraNumbers.join(', ')}"`,
        p.isActive ? 'ACTIVE' : 'INACTIVE',
        p.approvalStatus,
        p.totalSanctionedTowers,
        `${p.currentProgressPct || 0}%`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Project_Master_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Filters
  const filteredProjects = projects
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      const builder = builders.find((b) => b.id === p.builderId);
      const matchesSearch =
        p.projectName.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.reraNumbers.some((r) => r.toLowerCase().includes(q)) ||
        (builder && builder.legalName.toLowerCase().includes(q));

      const matchesCity = cityFilter === 'ALL' || p.city === cityFilter;
      const matchesBuilder = builderFilter === 'ALL' || p.builderId === builderFilter;
      const matchesStatus =
        statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? p.isActive : !p.isActive);

      return matchesSearch && matchesCity && matchesBuilder && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME') return a.projectName.localeCompare(b.projectName);
      if (sortBy === 'TOWERS') return (b.totalSanctionedTowers || 0) - (a.totalSanctionedTowers || 0);
      if (sortBy === 'PROGRESS') return (b.currentProgressPct || 0) - (a.currentProgressPct || 0);
      if (sortBy === 'UNITS') return (b.totalUnitsCount || 0) - (a.totalUnitsCount || 0);
      return 0;
    });

  const canCreateEdit = currentUser?.role === 'CPA' || currentUser?.role === 'ADMIN' || currentUser?.role === 'COM';
  const isChecker = currentUser?.role === 'COM' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Enterprise Master Data Management
            </span>
            <span className="text-xs text-slate-500 font-mono">Project & RERA Register</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">Project & Phased Development Master</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Relational parent-child architecture linked to Developer Entities, Statutory Clearances & Micro-Markets
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isChecker && (
            <button
              type="button"
              onClick={() => setApprovalsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Approvals</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => handleExport('CSV')}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1 border-r border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('JSON')}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              JSON
            </button>
          </div>

          {/* Refresh Project Data */}
          <button
            type="button"
            onClick={() => {
              setTargetEntityForRefresh({
                name: 'All Sanctioned Projects (MahaRERA)',
                type: 'PROJECT',
              });
              setIsRefreshDiffOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh active projects dataset against MahaRERA public registers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH DATA</span>
          </button>

          {/* FETCH PROJECTS (RERA) */}
          <button
            type="button"
            onClick={() => {
              const selectedB = builders.find((b) => b.id === builderFilter) || builders[0];
              if (selectedB) {
                setTargetBuilderForProjects(selectedB);
                setIsDiscoverProjectsOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>FETCH PROJECTS</span>
          </button>

          {canCreateEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#0c3148] hover:bg-[#15496b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Project, Locality, RERA, Developer..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={cityFilter}
            onChange={(e: any) => setCityFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Hubs (Pune & Mumbai)</option>
            <option value="Pune">Pune Hub Only</option>
            <option value="Mumbai">Mumbai Hub Only</option>
          </select>
        </div>

        <div>
          <select
            value={builderFilter}
            onChange={(e) => setBuilderFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Developers</option>
            {builders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.legalName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="NAME">Sort by Name</option>
            <option value="PROGRESS">Sort by Progress %</option>
            <option value="TOWERS">Sort by Towers</option>
            <option value="UNITS">Sort by Total Units</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
              <tr>
                <th className="p-3.5">Project ID & Name</th>
                <th className="p-3.5">Parent Developer</th>
                <th className="p-3.5">MahaRERA Numbers</th>
                <th className="p-3.5">Micro-Market</th>
                <th className="p-3.5">Phases & Towers</th>
                <th className="p-3.5">Progress & Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No project records match your filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const builder = builders.find((b) => b.id === p.builderId);
                  const phases = masterStore.getPhases({ projectId: p.id });
                  const towers = masterStore.getTowers({ projectId: p.id });

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${!p.isActive ? 'bg-slate-50/70 opacity-75' : ''}`}
                    >
                      {/* Project Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#102a43] flex items-center gap-1.5">
                          <MapPin className={`w-3.5 h-3.5 ${p.isActive ? 'text-[#19638c]' : 'text-slate-400'}`} />
                          <span>{p.projectName}</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#829ab1] flex items-center gap-1 mt-0.5">
                          <span>{p.id}</span>
                          <span>•</span>
                          <span>{p.projectType}</span>
                        </div>
                      </td>

                      {/* Parent Developer */}
                      <td className="p-3.5 font-semibold text-[#334e68]">
                        <div>{builder?.legalName || p.builderId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.builderId}</div>
                      </td>

                      {/* RERA */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#19638c] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{p.reraNumbers.join(', ')}</span>
                        </span>
                      </td>

                      {/* Micro-Market */}
                      <td className="p-3.5">
                        <div className="font-semibold text-[#102a43]">{p.locality}</div>
                        <div className="text-[10px] text-[#829ab1]">{p.city}</div>
                      </td>

                      {/* Phases & Towers */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{phases.length} Phases</span>
                          <span>•</span>
                          <span className="font-bold text-sky-700">{towers.length} Towers</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddPhase(p.id)}
                            className="text-sky-700 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" /> Phase
                          </button>
                          {onNavigateToTowers && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => onNavigateToTowers(p.id)}
                                className="text-slate-600 hover:text-slate-900 hover:underline"
                              >
                                View Towers
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Progress & Status */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, p.currentProgressPct || 0)}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-800">{p.currentProgressPct || 0}%</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {p.isActive ? (
                            <span className="text-emerald-700 font-semibold">Active</span>
                          ) : (
                            <span className="text-slate-400 font-semibold">Deactivated</span>
                          )}
                          {' • '}
                          <span className="font-medium text-slate-600">{p.approvalStatus}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* FETCH TOWERS (RERA) */}
                          <button
                            type="button"
                            onClick={() => {
                              setTargetProjectForTowers(p);
                              setIsDiscoverTowersOpen(true);
                            }}
                            title="Fetch Wings / Towers from Sanctioned Drawings"
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-[11px] font-bold transition-colors flex items-center gap-1 border border-indigo-200"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Fetch Towers</span>
                          </button>

                          {/* VIEW TOWERS */}
                          {onNavigateToTowers && (
                            <button
                              type="button"
                              onClick={() => onNavigateToTowers(p.id)}
                              title="View and Manage Tower Register"
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-colors flex items-center gap-1 border border-sky-200"
                            >
                              <Layers className="w-3.5 h-3.5 text-sky-600" />
                              <span>Towers</span>
                            </button>
                          )}

                          {/* VIEW EXPOSURE 360: Strictly restricted to CPA, COM, ACOM, RCOM, ZCOM, NCOM */}
                          {onNavigateToExposure && canAccessExposureReport(currentUser?.role) && (
                            <button
                              type="button"
                              onClick={() => onNavigateToExposure(p.builderId)}
                              title="View Project and Builder Exposure 360"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                            >
                              <BarChart3 className="w-4 h-4 text-indigo-600" />
                            </button>
                          )}

                          {/* VIEW SOURCE EVIDENCE */}
                          <button
                            type="button"
                            onClick={() => {
                              setEvidenceDrawerData({
                                title: p.projectName,
                                subtitle: `RERA: ${p.reraNumbers?.join(', ')} | Locality: ${p.locality || p.city}`,
                                fields: {
                                  projectName: {
                                    fieldKey: 'projectName',
                                    label: 'Sanctioned Project Title',
                                    value: p.projectName,
                                    sourceName: 'MahaRERA Project Registration Certificate',
                                    asOfDate: '2026-03-21',
                                    fetchTimestamp: '2026-03-21 09:35 IST',
                                    confidence: 1.0,
                                    freshness: 'LIVE',
                                    verificationStatus: 'VERIFIED',
                                    documentId: `CERT-${p.reraNumbers?.[0] || 'RERA'}`,
                                  },
                                  reraNumber: {
                                    fieldKey: 'reraNumber',
                                    label: 'MahaRERA Registration Number',
                                    value: p.reraNumbers || [],
                                    sourceName: 'MahaRERA Live Directory',
                                    asOfDate: '2026-03-21',
                                    fetchTimestamp: '2026-03-21 09:35 IST',
                                    confidence: 1.0,
                                    freshness: 'LIVE',
                                    verificationStatus: 'VERIFIED',
                                  },
                                  totalSanctionedTowers: {
                                    fieldKey: 'totalSanctionedTowers',
                                    label: 'Sanctioned Towers / Wings',
                                    value: p.totalSanctionedTowers || 1,
                                    sourceName: 'Municipal Corporation Sanction Layout Plan',
                                    asOfDate: '2026-02-28',
                                    fetchTimestamp: '2026-03-21 09:35 IST',
                                    confidence: 0.98,
                                    freshness: 'NEAR_REAL_TIME',
                                    verificationStatus: 'VERIFIED',
                                  },
                                  physicalProgress: {
                                    fieldKey: 'physicalProgress',
                                    label: 'Quarterly Physical Progress',
                                    value: `${p.currentProgressPct}%`,
                                    sourceName: 'MahaRERA Form 3 (Architect / Engineer Certificate)',
                                    asOfDate: '2026-01-31',
                                    fetchTimestamp: '2026-03-21 09:35 IST',
                                    confidence: 0.96,
                                    freshness: 'AS-OF',
                                    verificationStatus: 'VERIFIED',
                                  },
                                },
                              });
                              setIsEvidenceDrawerOpen(true);
                            }}
                            title="View Regulatory Evidence Provenance"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </button>

                          {/* REFRESH DATA */}
                          <button
                            type="button"
                            onClick={() => {
                              setTargetEntityForRefresh({
                                name: p.projectName,
                                type: 'PROJECT',
                              });
                              setIsRefreshDiffOpen(true);
                            }}
                            title="Refresh Project Data from MahaRERA"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                          >
                            <RefreshCw className="w-4 h-4 text-indigo-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewAudit(p)}
                            title="View Audit Trail"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {canCreateEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Project Details"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c3148] hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {currentUser?.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(p)}
                              title={p.isActive ? 'Deactivate Project' : 'Reactivate Project'}
                              className={`p-1.5 rounded-lg ${
                                p.isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {p.sourceUrl && (
                            <a
                              href={p.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50"
                              title="Verify on MahaRERA Portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Stepper Modal */}
      {currentUser && (
        <ProjectStepperModal
          isOpen={isStepperOpen}
          onClose={() => {
            setIsStepperOpen(false);
            setEditingProject(null);
          }}
          currentUser={currentUser}
          editProject={editingProject}
          onSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Phase Modal */}
      {currentUser && activeProjectIdForPhase && (
        <PhaseModal
          isOpen={phaseModalOpen}
          onClose={() => {
            setPhaseModalOpen(false);
            setActiveProjectIdForPhase('');
          }}
          currentUser={currentUser}
          projectId={activeProjectIdForPhase}
          onSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Audit History Modal */}
      <MasterAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        entityType="PROJECT"
        recordName={auditRecordName}
        recordId={auditRecordId}
        auditLogs={auditLogs}
      />

      {/* Pending Approvals Modal */}
      {currentUser && isChecker && (
        <PendingMasterApprovalsModal
          isOpen={approvalsModalOpen}
          onClose={() => setApprovalsModalOpen(false)}
          currentUser={currentUser}
          onApprovalsChanged={loadData}
        />
      )}

      {/* DISCOVER / FETCH PROJECTS MODAL */}
      {currentUser && targetBuilderForProjects && (
        <DiscoverProjectsModal
          isOpen={isDiscoverProjectsOpen}
          onClose={() => {
            setIsDiscoverProjectsOpen(false);
            setTargetBuilderForProjects(null);
          }}
          builder={targetBuilderForProjects}
          currentUser={currentUser}
          onProjectsImported={(savedProjects, openTowerDiscoveryFor) => {
            loadData();
            if (openTowerDiscoveryFor) {
              setTargetProjectForTowers(openTowerDiscoveryFor);
              setIsDiscoverTowersOpen(true);
            }
          }}
        />
      )}

      {/* DISCOVER / FETCH TOWERS MODAL */}
      {currentUser && targetProjectForTowers && (
        <DiscoverTowersModal
          isOpen={isDiscoverTowersOpen}
          onClose={() => {
            setIsDiscoverTowersOpen(false);
            setTargetProjectForTowers(null);
          }}
          project={targetProjectForTowers}
          currentUser={currentUser}
          onTowersCommitted={(savedTowers, startApf) => {
            loadData();
            if (startApf && onStartApfTransaction) {
              onStartApfTransaction(targetProjectForTowers.builderId, targetProjectForTowers.id);
            }
          }}
          onNavigateToExposure={onNavigateToExposure}
        />
      )}

      {/* SOURCE EVIDENCE DRAWER */}
      {evidenceDrawerData && (
        <SourceEvidenceDrawer
          isOpen={isEvidenceDrawerOpen}
          onClose={() => {
            setIsEvidenceDrawerOpen(false);
            setEvidenceDrawerData(null);
          }}
          title={evidenceDrawerData.title}
          subtitle={evidenceDrawerData.subtitle}
          fields={evidenceDrawerData.fields}
          rawPayload={evidenceDrawerData.rawPayload}
        />
      )}

      {/* REFRESH DIFF MODAL */}
      {currentUser && targetEntityForRefresh && (
        <RefreshDiffModal
          isOpen={isRefreshDiffOpen}
          onClose={() => {
            setIsRefreshDiffOpen(false);
            setTargetEntityForRefresh(null);
          }}
          entityName={targetEntityForRefresh.name}
          entityType={targetEntityForRefresh.type}
          currentUser={currentUser}
          onApplyChanges={() => {
            setIsRefreshDiffOpen(false);
            setTargetEntityForRefresh(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
