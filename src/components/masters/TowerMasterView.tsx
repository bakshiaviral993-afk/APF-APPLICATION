import React, { useState, useEffect } from 'react';
import {
  TowerMaster,
  ProjectMaster,
  PhaseMaster,
  BuilderMaster,
  UserAccount,
  MasterAuditLog,
  UnitMaster,
} from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { apfStore } from '../../services/apfStore';
import { TowerStepperModal } from './TowerStepperModal';
import { BulkUnitGenerateModal } from './BulkUnitGenerateModal';
import { MasterAuditModal } from './MasterAuditModal';
import { PendingMasterApprovalsModal } from './PendingMasterApprovalsModal';
import { DiscoverTowersModal } from '../discovery/DiscoverTowersModal';
import {
  Layers,
  Building,
  Plus,
  Search,
  Grid,
  History,
  Edit,
  Power,
  Clock,
  Download,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface TowerMasterViewProps {
  currentUser?: UserAccount;
  initialProjectId?: string;
}

export const TowerMasterView: React.FC<TowerMasterViewProps> = ({
  currentUser: propUser,
  initialProjectId,
}) => {
  const currentUser = propUser || apfStore.getCurrentUser();

  // Cascade Selectors
  const [builders, setBuilders] = useState<BuilderMaster[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [phases, setPhases] = useState<PhaseMaster[]>([]);

  const [selectedBuilderId, setSelectedBuilderId] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'ALL');
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('ALL');

  const [towers, setTowers] = useState<TowerMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTowerId, setExpandedTowerId] = useState<string | null>(null);

  // Modals
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [editingTower, setEditingTower] = useState<TowerMaster | null>(null);

  const [bulkGenOpen, setBulkGenOpen] = useState(false);
  const [activeTowerForBulk, setActiveTowerForBulk] = useState<TowerMaster | null>(null);

  // Tower Discovery Modal
  const [isDiscoverTowersOpen, setIsDiscoverTowersOpen] = useState(false);
  const [targetProjectForDiscovery, setTargetProjectForDiscovery] = useState<ProjectMaster | null>(null);

  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>([]);
  const [auditRecordName, setAuditRecordName] = useState('');
  const [auditRecordId, setAuditRecordId] = useState('');

  // Pending approvals modal
  const [approvalsModalOpen, setApprovalsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = () => {
    const bList = masterStore.getBuilders();
    setBuilders(bList);
    const pList = masterStore.getProjects();
    setProjects(pList);
    const phList = masterStore.getPhases();
    setPhases(phList);
    const tList = masterStore.getTowers();
    setTowers(tList);
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
    setEditingTower(null);
    setIsStepperOpen(true);
  };

  const handleOpenEdit = (t: TowerMaster) => {
    setEditingTower(t);
    setIsStepperOpen(true);
  };

  const handleOpenBulkGen = (t: TowerMaster) => {
    setActiveTowerForBulk(t);
    setBulkGenOpen(true);
  };

  const handleToggleActive = (t: TowerMaster) => {
    if (!currentUser) return;
    const action = t.isActive ? 'Deactivate' : 'Reactivate';
    const reason = prompt(`Please state the reason to ${action} tower "${t.towerName}":`);
    if (!reason || !reason.trim()) return;

    masterStore.toggleActive('Tower', t.id, currentUser, reason.trim());
    loadData();
  };

  const handleViewAudit = (t: TowerMaster) => {
    const history = masterStore.getAuditLogs('Tower', t.id);
    setAuditLogs(history);
    setAuditRecordName(t.towerName);
    setAuditRecordId(t.id);
    setAuditModalOpen(true);
  };

  const handleExport = () => {
    const headers = ['Tower ID', 'Tower Name', 'Project ID', 'Sanctioned Floors', 'Constructed Floors', 'Units', 'Base Rate', 'Progress %', 'Structure Type', 'Status'];
    const rows = filteredTowers.map((t) => [
      t.id,
      `"${t.towerName.replace(/"/g, '""')}"`,
      t.projectId,
      t.floorsSanctioned,
      t.floorsConstructed,
      t.totalUnits,
      t.baseRateSqFt,
      `${t.physicalProgressPct}%`,
      `"${t.structureType}"`,
      t.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tower_Master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filtered towers
  const filteredTowers = towers.filter((t) => {
    const q = searchTerm.toLowerCase();
    const proj = projects.find((p) => p.id === t.projectId);
    const matchesSearch =
      t.towerName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.towerCode && t.towerCode.toLowerCase().includes(q)) ||
      (proj && proj.projectName.toLowerCase().includes(q));

    const matchesBuilder =
      selectedBuilderId === 'ALL' || (proj && proj.builderId === selectedBuilderId);
    const matchesProject = selectedProjectId === 'ALL' || t.projectId === selectedProjectId;
    const matchesPhase = selectedPhaseId === 'ALL' || t.phaseId === selectedPhaseId;

    return matchesSearch && matchesBuilder && matchesProject && matchesPhase;
  });

  const canCreateEdit = currentUser?.role === 'CPA' || currentUser?.role === 'ADMIN' || currentUser?.role === 'COM';
  const isChecker = currentUser?.role === 'COM' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#19638c] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Enterprise Master Data Management
            </span>
            <span className="text-xs text-slate-500 font-mono">Structural & Unit Register</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">Tower, Wing & Unit Masters</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Maintain physical tower dimensions, slab sanctions, engineering specs & individual unit disbursement status
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

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* FETCH PHASE / TOWER DATA */}
          <button
            type="button"
            onClick={() => {
              const activeProj =
                projects.find((p) => p.id === selectedProjectId) || projects[0];
              if (activeProj) {
                setTargetProjectForDiscovery(activeProj);
                setIsDiscoverTowersOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>FETCH TOWER DATA</span>
          </button>

          {canCreateEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#0c3148] hover:bg-[#15496b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Tower</span>
            </button>
          )}
        </div>
      </div>

      {/* Relational Cascade Filtering Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Builder Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1. Developer Filter</label>
          <select
            value={selectedBuilderId}
            onChange={(e) => {
              setSelectedBuilderId(e.target.value);
              setSelectedProjectId('ALL');
              setSelectedPhaseId('ALL');
            }}
            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Developers</option>
            {builders.map((b) => (
              <option key={b.id} value={b.id}>
                {b.legalName}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">2. Project Filter</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedPhaseId('ALL');
            }}
            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Projects</option>
            {projects
              .filter((p) => selectedBuilderId === 'ALL' || p.builderId === selectedBuilderId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
          </select>
        </div>

        {/* Phase Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">3. Phase Filter</label>
          <select
            value={selectedPhaseId}
            onChange={(e) => setSelectedPhaseId(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Phases</option>
            {phases
              .filter((ph) => selectedProjectId === 'ALL' || ph.projectId === selectedProjectId)
              .map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.phaseName}
                </option>
              ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Towers</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tower Name / Wing / Code..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Towers List */}
      <div className="space-y-4">
        {filteredTowers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No towers match the selected cascade filters.
          </div>
        ) : (
          filteredTowers.map((t) => {
            const proj = projects.find((p) => p.id === t.projectId);
            const phase = phases.find((ph) => ph.id === t.phaseId);
            const units = masterStore.getUnits({ towerId: t.id });
            const isExpanded = expandedTowerId === t.id;
            const ineligibleUnitsCount = units.filter((u) => u.violationFlag || u.apfDisbursementStatus === 'Ineligible').length;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Tower Details */}
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 mt-0.5">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{t.towerName}</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t.id}
                        </span>
                        {t.wing && (
                          <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                            {t.wing}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {t.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700">Project: {proj?.projectName || t.projectId}</span>
                        <span>•</span>
                        <span>Phase: {phase?.phaseName || t.phaseId}</span>
                        <span>•</span>
                        <span>Tech: {t.structureType}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Sanctioned</span>
                          <span className="font-bold text-slate-800">{t.floorsSanctioned} Floors</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Slabs Poured</span>
                          <span className="font-bold text-emerald-700">
                            {t.slabsCompleted} Slabs ({t.physicalProgressPct}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Rate</span>
                          <span className="font-bold text-slate-800">₹{(t.baseRateSqFt || 7500).toLocaleString()}/SqFt</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Units Mapped</span>
                          <span className="font-bold text-sky-800 flex items-center gap-1">
                            <span>{units.length} Units</span>
                            {ineligibleUnitsCount > 0 && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1 rounded">
                                ({ineligibleUnitsCount} Blocked)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Bulk Generate Units */}
                    {canCreateEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenBulkGen(t)}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Bulk Generate Units</span>
                      </button>
                    )}

                    {/* Toggle Unit Matrix */}
                    <button
                      type="button"
                      onClick={() => setExpandedTowerId(isExpanded ? null : t.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Units' : `View Units (${units.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Audit Trail */}
                    <button
                      type="button"
                      onClick={() => handleViewAudit(t)}
                      title="View Audit History"
                      className="p-1.5 text-slate-400 hover:text-sky-700 rounded-lg hover:bg-sky-50"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    {/* Edit Tower */}
                    {canCreateEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        title="Edit Tower Parameters"
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Deactivate / Reactivate */}
                    {currentUser?.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        title={t.isActive ? 'Deactivate Tower' : 'Reactivate Tower'}
                        className={`p-1.5 rounded-lg ${
                          t.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Unit Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Units Master Matrix for {t.towerName} ({units.length} total)
                      </span>
                      {ineligibleUnitsCount > 0 && (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {ineligibleUnitsCount} Units Violate Sanctions — APF Disbursement Blocked
                        </span>
                      )}
                    </div>

                    {units.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                        No units generated yet. Click "Bulk Generate Units" above to populate all floor inventories.
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Unit No</th>
                              <th className="p-2.5">Floor</th>
                              <th className="p-2.5">Typology</th>
                              <th className="p-2.5">Carpet (SqFt)</th>
                              <th className="p-2.5">Agreement Val</th>
                              <th className="p-2.5">Floor Sanction</th>
                              <th className="p-2.5">APF Disbursement Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {units.slice(0, 30).map((u) => (
                              <tr
                                key={u.id}
                                className={u.violationFlag ? 'bg-rose-50/70 text-rose-900 font-medium' : 'hover:bg-slate-50'}
                              >
                                <td className="p-2.5 font-mono font-bold">{u.unitNumber}</td>
                                <td className="p-2.5">Floor {u.floorNumber}</td>
                                <td className="p-2.5">{u.configuration}</td>
                                <td className="p-2.5 font-mono">{u.carpetAreaSqFt}</td>
                                <td className="p-2.5 font-semibold">₹{u.agreementValueLakh} L</td>
                                <td className="p-2.5">
                                  {u.floorSanctioned ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
                                      Sanctioned
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800">
                                      UNSANCTIONED
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  {u.apfDisbursementStatus === 'Eligible' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Eligible for Loan
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                      Ineligible (Disbursement Blocked)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {units.length > 30 && (
                          <div className="p-2 bg-slate-50 text-center text-slate-500 text-[11px] border-t border-slate-200">
                            ...showing first 30 of {units.length} units
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stepper Modal for Tower */}
      {currentUser && (
        <TowerStepperModal
          isOpen={isStepperOpen}
          onClose={() => {
            setIsStepperOpen(false);
            setEditingTower(null);
          }}
          currentUser={currentUser}
          editTower={editingTower}
          defaultProjectId={selectedProjectId !== 'ALL' ? selectedProjectId : undefined}
          defaultPhaseId={selectedPhaseId !== 'ALL' ? selectedPhaseId : undefined}
          onSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Bulk Unit Generate Modal */}
      {currentUser && activeTowerForBulk && (
        <BulkUnitGenerateModal
          isOpen={bulkGenOpen}
          onClose={() => {
            setBulkGenOpen(false);
            setActiveTowerForBulk(null);
          }}
          currentUser={currentUser}
          tower={activeTowerForBulk}
          onGenerated={() => {
            loadData();
          }}
        />
      )}

      {/* Audit History Modal */}
      <MasterAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        entityType="TOWER"
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

      {/* Discover Towers Modal */}
      {currentUser && targetProjectForDiscovery && (
        <DiscoverTowersModal
          isOpen={isDiscoverTowersOpen}
          onClose={() => {
            setIsDiscoverTowersOpen(false);
            setTargetProjectForDiscovery(null);
          }}
          project={targetProjectForDiscovery}
          currentUser={currentUser}
          onTowersCommitted={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
