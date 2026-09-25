import React, { useState, useEffect } from 'react';
import { BuilderMaster, ProjectMaster, TowerMaster, UserAccount, MasterAuditLog } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { apfStore } from '../../services/apfStore';
import { BuilderStepperModal } from './BuilderStepperModal';
import { MasterAuditModal } from './MasterAuditModal';
import { PendingMasterApprovalsModal } from './PendingMasterApprovalsModal';
import { DiscoverBuilderModal } from '../discovery/DiscoverBuilderModal';
import { DiscoverProjectsModal } from '../discovery/DiscoverProjectsModal';
import { DiscoverTowersModal } from '../discovery/DiscoverTowersModal';
import { SourceEvidenceDrawer } from '../discovery/SourceEvidenceDrawer';
import { RefreshDiffModal } from '../discovery/RefreshDiffModal';
import { FetchExposureDrawer } from '../exposure/FetchExposureDrawer';
import { canAccessExposureReport } from '../../utils/exposurePermissions';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  History,
  Edit,
  Power,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  FileText,
  Building,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
  ArrowRight,
  Database,
  BarChart3,
} from 'lucide-react';

interface BuilderMasterViewProps {
  currentUser?: UserAccount;
  onNavigateToProjects?: (builderId: string) => void;
  onNavigateToExposure?: (builderId: string) => void;
  onStartApfTransaction?: (builderId: string, projectId?: string) => void;
}

export const BuilderMasterView: React.FC<BuilderMasterViewProps> = ({
  currentUser: propUser,
  onNavigateToProjects,
  onNavigateToExposure,
  onStartApfTransaction,
}) => {
  const currentUser = propUser || apfStore.getCurrentUser();
  const [builders, setBuilders] = useState<BuilderMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<'ALL' | 'Pune' | 'Mumbai'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'APPROVED' | 'PENDING_MASTER_APPROVAL' | 'REJECTED'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'ESTD' | 'COMPLETED' | 'EXPOSURE'>('NAME');

  // Modals
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [editingBuilder, setEditingBuilder] = useState<BuilderMaster | null>(null);

  // Discovery workflow modals
  const [isDiscoverBuilderOpen, setIsDiscoverBuilderOpen] = useState(false);
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

  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>([]);
  const [auditRecordName, setAuditRecordName] = useState('');
  const [auditRecordId, setAuditRecordId] = useState('');

  // Pending approvals modal
  const [approvalsModalOpen, setApprovalsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch Exposure Drawer
  const [isFetchExposureOpen, setIsFetchExposureOpen] = useState(false);
  const [fetchBuilderTarget, setFetchBuilderTarget] = useState<string>('BLD-PUN-001');
  const [fetchBuilderNameTarget, setFetchBuilderNameTarget] = useState<string>('');

  const loadData = () => {
    const list = masterStore.getBuilders();
    setBuilders(list);
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
    setEditingBuilder(null);
    setIsStepperOpen(true);
  };

  const handleOpenEdit = (b: BuilderMaster) => {
    setEditingBuilder(b);
    setIsStepperOpen(true);
  };

  const handleToggleActive = (b: BuilderMaster) => {
    if (!currentUser) return;
    const action = b.isActive ? 'Deactivate' : 'Reactivate';
    const reason = prompt(`Please state the reason to ${action} builder "${b.legalName}":`);
    if (!reason || !reason.trim()) return;

    masterStore.toggleActive('Builder', b.id, currentUser, reason.trim());
    loadData();
  };

  const handleViewAudit = (b: BuilderMaster) => {
    const history = masterStore.getAuditLogs('Builder', b.id);
    setAuditLogs(history);
    setAuditRecordName(b.legalName);
    setAuditRecordId(b.id);
    setAuditModalOpen(true);
  };

  const handleExport = (format: 'CSV' | 'JSON') => {
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(builders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Builder_Master_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV Export
      const headers = ['ID', 'Legal Name', 'Group', 'PAN', 'CIN', 'City', 'Status', 'Approval Status', 'Completed Projects', 'Ongoing Projects'];
      const rows = filteredBuilders.map((b) => [
        b.id,
        `"${b.legalName.replace(/"/g, '""')}"`,
        `"${b.groupName.replace(/"/g, '""')}"`,
        b.pan,
        b.cin,
        b.city,
        b.isActive ? 'ACTIVE' : 'INACTIVE',
        b.approvalStatus,
        b.totalProjectsCompleted,
        b.totalOngoingProjects,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Builder_Master_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Filter & Sort
  const filteredBuilders = builders
    .filter((b) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        b.legalName.toLowerCase().includes(q) ||
        b.groupName.toLowerCase().includes(q) ||
        b.pan.toLowerCase().includes(q) ||
        b.cin.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.promoters.some((p) => p.toLowerCase().includes(q));

      const matchesCity = cityFilter === 'ALL' || b.city === cityFilter;
      const matchesStatus =
        statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? b.isActive : !b.isActive);
      const matchesApproval = approvalFilter === 'ALL' || b.approvalStatus === approvalFilter;

      return matchesSearch && matchesCity && matchesStatus && matchesApproval;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME') return a.legalName.localeCompare(b.legalName);
      if (sortBy === 'ESTD') return a.establishedYear - b.establishedYear;
      if (sortBy === 'COMPLETED') return b.totalProjectsCompleted - a.totalProjectsCompleted;
      if (sortBy === 'EXPOSURE') return (b.totalExposureCr || 0) - (a.totalExposureCr || 0);
      return 0;
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
            <span className="text-xs text-slate-500 font-mono">Single Source of Truth</span>
          </div>
          <h1 className="text-2xl font-black text-[#102a43] mt-1">Builder Entity Master</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Maintain institutional developer entities, KYC, financials, corporate banking & statutory parameters
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pending Approvals button for Checkers / Admins */}
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

          {/* Export button */}
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

          {/* Refresh Master Data */}
          <button
            type="button"
            onClick={() => {
              setTargetEntityForRefresh({
                name: 'All Registered Developers (MCA/RERA)',
                type: 'BUILDER',
              });
              setIsRefreshDiffOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh active builder dataset against MCA RoC and MahaRERA registries"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH DATA</span>
          </button>

          {/* DISCOVER BUILDER */}
          <button
            type="button"
            onClick={() => setIsDiscoverBuilderOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>DISCOVER BUILDER</span>
          </button>

          {/* PRIMARY FETCH EXPOSURE BUTTON: Strictly restricted to CPA, COM, ACOM, RCOM, ZCOM, NCOM */}
          {canAccessExposureReport(currentUser?.role) && (
            <button
              type="button"
              onClick={() => {
                const defaultId = builders[0]?.id || 'BLD-PUN-001';
                const defaultName = builders[0]?.legalName || '';
                setFetchBuilderTarget(defaultId);
                setFetchBuilderNameTarget(defaultName);
                setIsFetchExposureOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Fetch and reconcile multilateral builder exposure"
            >
              <Database className="w-4 h-4 text-sky-200" />
              <span>FETCH EXPOSURE</span>
            </button>
          )}

          {/* + Add New Builder */}
          {canCreateEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#0c3148] hover:bg-[#15496b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Builder</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Builder, Group, PAN, CIN, Promoter..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        {/* City Filter */}
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

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Active & Inactive</option>
            <option value="ACTIVE">Active Records Only</option>
            <option value="INACTIVE">Deactivated Records</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="NAME">Sort by Name</option>
            <option value="COMPLETED">Sort by Delivered Projects</option>
            <option value="ESTD">Sort by Established Year</option>
            <option value="EXPOSURE">Sort by Bank Exposure</option>
          </select>
        </div>
      </div>

      {/* Builder Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f5f9] text-[#334e68] font-bold text-[10px] uppercase border-b border-[#e2e8f0]">
              <tr>
                <th className="p-3.5">Builder ID & Name</th>
                <th className="p-3.5">Group & CIN</th>
                <th className="p-3.5">PAN & GSTIN</th>
                <th className="p-3.5">City & Estd</th>
                <th className="p-3.5">Track Record</th>
                <th className="p-3.5">Status & Approval</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredBuilders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No builder records match your current filters.
                  </td>
                </tr>
              ) : (
                filteredBuilders.map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50 transition-colors ${!b.isActive ? 'bg-slate-50/70 opacity-75' : ''}`}
                  >
                    {/* Builder Info */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#102a43] flex items-center gap-1.5">
                        <Building2 className={`w-3.5 h-3.5 ${b.isActive ? 'text-[#19638c]' : 'text-slate-400'}`} />
                        <span>{b.legalName}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#829ab1] flex items-center gap-1 mt-0.5">
                        <span>{b.id}</span>
                        <span>•</span>
                        <span>v{b.version}</span>
                      </div>
                    </td>

                    {/* Group & CIN */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#19638c]">{b.groupName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{b.cin}</div>
                    </td>

                    {/* PAN & GSTIN */}
                    <td className="p-3.5 font-mono text-[11px] text-[#334e68]">
                      <div>PAN: {b.pan}</div>
                      <div className="text-[10px] text-[#829ab1]">
                        GSTIN: {b.gst ? b.gst.slice(0, 10) + '...' : 'N/A'}
                      </div>
                    </td>

                    {/* City & Estd */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#102a43]">{b.city}</div>
                      <div className="text-[10px] text-[#829ab1]">Since {b.establishedYear}</div>
                    </td>

                    {/* Track Record */}
                    <td className="p-3.5 font-semibold text-emerald-800">
                      <div>{b.totalProjectsCompleted} Delivered</div>
                      <div className="text-[10px] text-[#627d98]">{b.totalOngoingProjects} Ongoing</div>
                    </td>

                    {/* Status & Approval */}
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        {b.isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                            DEACTIVATED
                          </span>
                        )}

                        {b.approvalStatus === 'APPROVED' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-100 text-sky-800">
                            APPROVED
                          </span>
                        )}
                        {b.approvalStatus === 'PENDING_MASTER_APPROVAL' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> PENDING
                          </span>
                        )}
                        {b.approvalStatus === 'REJECTED' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-100 text-rose-800">
                            REJECTED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* VIEW / FETCH PROJECTS */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetBuilderForProjects(b);
                            setIsDiscoverProjectsOpen(true);
                          }}
                          title="View or Fetch Projects from MahaRERA"
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-colors flex items-center gap-1 border border-sky-200"
                        >
                          <Layers className="w-3.5 h-3.5 text-sky-600" />
                          <span>Projects</span>
                        </button>

                        {/* FETCH EXPOSURE & EXPOSURE 360: Strictly restricted to CPA, COM, ACOM, RCOM, ZCOM, NCOM */}
                        {canAccessExposureReport(currentUser?.role) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setFetchBuilderTarget(b.id);
                                setFetchBuilderNameTarget(b.legalName);
                                setIsFetchExposureOpen(true);
                              }}
                              title="Fetch and Reconcile Multilateral Exposure"
                              className="px-2.5 py-1.5 rounded-lg bg-sky-100 text-sky-900 hover:bg-sky-200 text-[11px] font-bold transition-colors flex items-center gap-1 border border-sky-300"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-sky-700" />
                              <span>Fetch Exposure</span>
                            </button>

                            {onNavigateToExposure && (
                              <button
                                type="button"
                                onClick={() => onNavigateToExposure(b.id)}
                                title="View Multilateral Builder Exposure 360"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-[11px] font-bold transition-colors flex items-center gap-1 border border-indigo-200"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Exposure 360</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* VIEW SOURCE EVIDENCE */}
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceDrawerData({
                              title: b.legalName,
                              subtitle: `PAN: ${b.pan} | CIN: ${b.cin}`,
                              fields: {
                                legalName: {
                                  fieldKey: 'legalName',
                                  label: 'Legal Entity Name',
                                  value: b.legalName,
                                  sourceName: 'MCA RoC Company Master',
                                  asOfDate: '2026-03-21',
                                  fetchTimestamp: '2026-03-21 09:30 IST',
                                  confidence: 0.99,
                                  freshness: 'LIVE',
                                  verificationStatus: 'VERIFIED',
                                  documentId: 'SRN-MCA-2026-9921',
                                },
                                pan: {
                                  fieldKey: 'pan',
                                  label: 'Permanent Account Number',
                                  value: b.pan,
                                  sourceName: 'NSDL Income Tax PAN API',
                                  asOfDate: '2026-03-21',
                                  fetchTimestamp: '2026-03-21 09:30 IST',
                                  confidence: 1.0,
                                  freshness: 'LIVE',
                                  verificationStatus: 'VERIFIED',
                                },
                                cin: {
                                  fieldKey: 'cin',
                                  label: 'Corporate Identification Number',
                                  value: b.cin,
                                  sourceName: 'Ministry of Corporate Affairs',
                                  asOfDate: '2026-03-21',
                                  fetchTimestamp: '2026-03-21 09:30 IST',
                                  confidence: 0.99,
                                  freshness: 'LIVE',
                                  verificationStatus: 'VERIFIED',
                                },
                                promoterNames: {
                                  fieldKey: 'promoterNames',
                                  label: 'Promoters & Designated Directors',
                                  value: b.promoters,
                                  sourceName: 'MCA Signatory Details & MahaRERA Form 1',
                                  asOfDate: '2026-03-15',
                                  fetchTimestamp: '2026-03-21 09:30 IST',
                                  confidence: 0.97,
                                  freshness: 'AS-OF',
                                  verificationStatus: 'VERIFIED',
                                },
                                registeredOffice: {
                                  fieldKey: 'registeredOffice',
                                  label: 'Registered Office Address',
                                  value: b.registeredAddress || `${b.city}, Maharashtra, India`,
                                  sourceName: 'MCA RoC Form INC-22',
                                  asOfDate: '2026-03-01',
                                  fetchTimestamp: '2026-03-21 09:30 IST',
                                  confidence: 0.98,
                                  freshness: 'NEAR_REAL_TIME',
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
                              name: b.legalName,
                              type: 'BUILDER',
                            });
                            setIsRefreshDiffOpen(true);
                          }}
                          title="Refresh Entity Data from MCA & RERA"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                        >
                          <RefreshCw className="w-4 h-4 text-indigo-600" />
                        </button>

                        {/* Audit History */}
                        <button
                          type="button"
                          onClick={() => handleViewAudit(b)}
                          title="View Immutable Audit Trail"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        {canCreateEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Builder Parameters"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c3148] hover:bg-slate-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Deactivate / Reactivate */}
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(b)}
                            title={b.isActive ? 'Deactivate Builder' : 'Reactivate Builder'}
                            className={`p-1.5 rounded-lg ${
                              b.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        {/* Official Website */}
                        {b.sourceUrl && (
                          <a
                            href={b.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50"
                            title="Open Official Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stepper Modal for Create / Edit Builder */}
      {currentUser && (
        <BuilderStepperModal
          isOpen={isStepperOpen}
          onClose={() => {
            setIsStepperOpen(false);
            setEditingBuilder(null);
          }}
          currentUser={currentUser}
          editBuilder={editingBuilder}
          onSaved={() => {
            loadData();
          }}
        />
      )}

      {/* Audit History Modal */}
      <MasterAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        entityType="BUILDER"
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

      {/* 1. DISCOVER BUILDER MODAL */}
      {currentUser && (
        <DiscoverBuilderModal
          isOpen={isDiscoverBuilderOpen}
          onClose={() => setIsDiscoverBuilderOpen(false)}
          currentUser={currentUser}
          onBuilderSaved={(savedBuilder, proceedToProjects) => {
            loadData();
            if (proceedToProjects) {
              setTargetBuilderForProjects(savedBuilder);
              setIsDiscoverProjectsOpen(true);
            }
          }}
        />
      )}

      {/* 2. DISCOVER / FETCH PROJECTS MODAL */}
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
            } else if (onNavigateToProjects) {
              onNavigateToProjects(targetBuilderForProjects.id);
            }
          }}
        />
      )}

      {/* 3. DISCOVER / FETCH TOWERS MODAL */}
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

      {/* 4. SOURCE EVIDENCE DRAWER */}
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

      {/* 5. REFRESH DIFF & RECONCILIATION MODAL */}
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
          onApplyChanges={(decisions) => {
            setIsRefreshDiffOpen(false);
            setTargetEntityForRefresh(null);
            loadData();
          }}
        />
      )}

      {/* 6. FETCH EXPOSURE DRAWER */}
      <FetchExposureDrawer
        isOpen={isFetchExposureOpen}
        builderId={fetchBuilderTarget}
        builderName={fetchBuilderNameTarget}
        onClose={() => setIsFetchExposureOpen(false)}
        onFetchComplete={(resp, snapshot) => {
          // Update data or notify
        }}
        onNavigateToTab={(tab) => {
          setIsFetchExposureOpen(false);
          if (onNavigateToExposure) {
            onNavigateToExposure(fetchBuilderTarget);
          }
        }}
      />
    </div>
  );
};
