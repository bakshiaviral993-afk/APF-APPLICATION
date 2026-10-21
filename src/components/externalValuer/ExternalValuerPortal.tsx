import React, { useState, useEffect } from 'react';
import { UserAccount, APFCase } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import { ExternalValuerSidebar, ExternalValuerNavView } from './ExternalValuerSidebar';
import { ExternalValuerDashboard } from './ExternalValuerDashboard';
import { ValuerCaseAppModule } from '../valuation/ValuerCaseAppModule';
import { ValuerMapPinModal } from '../maps/ValuerMapPinModal';
import { AccessDeniedState } from '../common/EnterpriseStatusStates';
import { ExternalLegalBillingView } from '../externalLegal/ExternalLegalBillingView';
import {
  Calculator,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Building2,
  FileCheck2,
  Calendar,
  Lock,
  Layers,
  MapPin,
  Clock,
  Download,
  Camera,
  Upload,
  Eye,
  Sparkles,
} from 'lucide-react';
import { SiteVisitPhotoUploadModal } from '../valuation/SiteVisitPhotoUploadModal';
import {
  getProjectById,
  getBuilderById,
  getTowerById,
  CENTRAL_TOWER_MASTER,
} from '../../data/centralMasterData';

interface ExternalValuerPortalProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onSwitchUser?: (username: string) => void;
}

export const ExternalValuerPortal: React.FC<ExternalValuerPortalProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
}) => {
  const [activeView, setActiveView] = useState<ExternalValuerNavView>('DASHBOARD');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [siteVisitModalCaseId, setSiteVisitModalCaseId] = useState<string | null>(null);
  const [photoUploadModalCaseId, setPhotoUploadModalCaseId] = useState<string | null>(null);

  const [cases, setCases] = useState<APFCase[]>(() => apfStore.getAllCases());

  useEffect(() => {
    const unsub = apfStore.subscribe(() => {
      setCases(apfStore.getAllCases());
    });
    return unsub;
  }, []);

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
  };

  const handleBackToDashboard = () => {
    setActiveCaseId(null);
  };

  const handleRoleSwitch = (username: string) => {
    setIsRoleDropdownOpen(false);
    apfStore.login(username, 'Secure@123');
    if (onSwitchUser) onSwitchUser(username);
  };

  const activeCaseData = activeCaseId ? cases.find((c) => c.id === activeCaseId) : null;
  const siteVisitCase = siteVisitModalCaseId ? cases.find((c) => c.id === siteVisitModalCaseId) : null;

  // Validate case access: only Knight Frank / panel cases or assigned
  const isCaseAccessible = (c: APFCase | null | undefined): boolean => {
    if (!c) return false;
    return (
      c.valuerAssignment?.assignedUserId === currentUser.id ||
      c.valuerAssignment?.vendorAgency?.includes('Knight Frank') ||
      c.currentOwnerRole === 'EXTERNAL_VALUER' ||
      c.currentStatus.startsWith('VALUER_') ||
      c.currentStatus === 'ASSIGNED_TO_VALUER' ||
      c.currentStatus === 'SITE_VISIT_IN_PROGRESS' ||
      c.currentStatus === 'VALUATION_SUBMITTED' ||
      c.currentStatus === 'VALUATION_REWORK'
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans">
      {/* External Valuer Portal Header */}
      <header className="h-14 bg-[#0B1F33] text-white border-b border-slate-800 flex items-center justify-between px-3.5 sm:px-6 shrink-0 z-30 shadow-xs">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">PROVAL APF</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  External Valuer Portal
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5">
                Technical Appraisal & Real Estate Valuation Workstation
              </div>
            </div>
          </div>
        </div>

        {/* Center: Empanelment Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Empanelment Status:</span>
          <span className="text-emerald-400 font-bold">Active (#IBBI/VAL/APF/PN/2019/042)</span>
        </div>

        {/* Right Actions & Testing Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1"></span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs text-slate-800 z-50 animate-in fade-in-50">
                <div className="font-bold text-xs pb-2 border-b border-slate-200 flex justify-between items-center text-slate-900">
                  <span>Valuer Notifications</span>
                  <span className="text-[10px] font-normal text-slate-400">Real-Time</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mt-1 space-y-1">
                  <div className="py-2 space-y-0.5">
                    <div className="font-semibold text-amber-700">New Technical Docket Assigned</div>
                    <p className="text-[11px] text-slate-600">
                      Bank CPA assigned Life Republic (i Towers) for site inspection and appraisal.
                    </p>
                  </div>
                  <div className="py-2 space-y-0.5">
                    <div className="font-semibold text-sky-700">Site Geofence Verified</div>
                    <p className="text-[11px] text-slate-600">
                      GPS coordinates synchronized within 32m accuracy threshold.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Dropdown for Testing */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs cursor-pointer transition-colors"
            >
              <div className="text-left hidden sm:block">
                <div className="font-bold text-white text-[11px] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-amber-400 font-medium">
                  {currentUser.roleLabel || 'External Valuer'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs text-slate-800 z-50 animate-in fade-in-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 rounded">
                  Switch Active Role (Testing & Verification)
                </div>

                <div className="space-y-0.5 mt-1 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => handleRoleSwitch('cpa01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">CPA (Rohan Deshmukh)</span>
                      <span className="text-[10px] text-slate-500">Bank Console • Maker</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('valuer.ext01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between bg-amber-50 text-amber-900 font-bold"
                  >
                    <div>
                      <span className="font-semibold block text-xs">M. K. Kulkarni</span>
                      <span className="text-[10px] text-amber-700 font-normal">External Valuer (Active)</span>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('legal.ext01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Adv. Ananya Deshmukh</span>
                      <span className="text-[10px] text-slate-500">External Legal Advocate</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('com01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">COM (Amitav Sen)</span>
                      <span className="text-[10px] text-slate-500">Bank Console • Checker</span>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 mt-2">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out of Valuer Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <div className="flex flex-1 overflow-hidden">
        <ExternalValuerSidebar
          currentUser={currentUser}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveCaseId(null);
            setActiveView(view);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={onLogout}
          pendingSiteVisitsCount={cases.filter((c) => c.currentStatus === 'SITE_VISIT_IN_PROGRESS').length}
          billingEligibleCount={cases.filter((c) => c.currentStatus === 'VALUATION_SUBMITTED').length}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
          {activeCaseId ? (
            activeCaseData && isCaseAccessible(activeCaseData) ? (
              <ValuerCaseAppModule
                caseData={activeCaseData}
                currentUser={currentUser}
                onBack={handleBackToDashboard}
                onSubmitSuccess={handleBackToDashboard}
              />
            ) : (
              <AccessDeniedState
                caseId={activeCaseId}
                onBack={handleBackToDashboard}
              />
            )
          ) : activeView === 'BILLING' ? (
            <ExternalLegalBillingView currentUser={currentUser} onNavigateToCase={handleOpenCase} />
          ) : activeView === 'SITE_VISIT_QUEUE' ? (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <Camera className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Site Visit Inspections & Photo Documentation Desk
                      </h2>
                      <p className="text-xs text-slate-500">
                        Field inspection schedule, 500m geofence compliance verification, and on-site photographic evidence.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Active Queue:</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {cases.filter((c) => isCaseAccessible(c)).length} Assigned Projects
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases
                  .filter((c) => isCaseAccessible(c))
                  .map((c) => {
                    const proj = getProjectById(c.projectId);
                    const bld = getBuilderById(c.builderId);
                    const twrs = CENTRAL_TOWER_MASTER.filter((t) => c.selectedTowerIds.includes(t.id));
                    const photos = apfStore.getSiteVisitPhotos(c.id);
                    const isPinned = !!c.valuerAssignment?.pinnedLocation?.lat || !!c.siteVisitEvidence?.[0]?.lat;

                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                Case {c.id}
                              </span>
                              <h3 className="font-bold text-sm text-slate-900 mt-1">
                                {proj?.projectName || 'Project Inspection'}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                {bld?.legalName || 'Developer'} · {proj?.city || 'Pune'}
                              </p>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                photos.length >= 4
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {photos.length} Photos Attached
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                <strong>Assigned Towers:</strong> {twrs.map((t) => t.towerName).join(', ') || 'Phase 1 Towers'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{proj?.address || 'Baner-Pashan Link Road, Pune'}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span>Geofence Status:</span>
                              <span className={`font-bold ${isPinned ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isPinned ? '✓ Location Pinned on Site' : 'Pending GPS Verification'}
                              </span>
                            </div>
                          </div>

                          {/* Mini thumbnails preview */}
                          {photos.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                              {photos.slice(0, 4).map((ph) => (
                                <div
                                  key={ph.id}
                                  className="w-14 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200"
                                >
                                  {ph.photoUrl ? (
                                    <img src={ph.photoUrl} alt={ph.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                      <Camera className="w-4 h-4 opacity-50" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              {photos.length > 4 && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                  +{photos.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoUploadModalCaseId(c.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload Site Photos ({photos.length})</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSiteVisitModalCaseId(c.id)}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="Verify GPS Pin on Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-sky-700" />
                              <span>GPS Pin</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCase(c.id)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span>Open Dossier →</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : activeView === 'PROFILE' ? (
            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-[#DCE3EB] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EB]">
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Empanelled Valuer Profile</h2>
                  <p className="text-xs text-[#667085]">
                    Registration credentials, IBBI certification, and corporate bank ECS mandate.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Panel Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Valuation Entity
                  </div>
                  <div><strong>Legal Name:</strong> Knight Frank (India) Private Limited</div>
                  <div><strong>Registration:</strong> IBBI/VAL/APF/PN/2019/042</div>
                  <div><strong>PAN:</strong> AAACK5512L</div>
                  <div><strong>GSTIN:</strong> 27AAACK5512L1ZZ</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Banking & ECS Mandate
                  </div>
                  <div><strong>Bank Name:</strong> HDFC Bank Ltd</div>
                  <div><strong>Account:</strong> 50200048192841</div>
                  <div><strong>IFSC:</strong> HDFC0000007</div>
                  <div><strong>Branch:</strong> Senapati Bapat Road, Pune</div>
                </div>
              </div>
            </div>
          ) : (
            <ExternalValuerDashboard
              currentUser={currentUser}
              cases={cases}
              onOpenCase={handleOpenCase}
              onOpenSiteVisit={(cId) => setSiteVisitModalCaseId(cId)}
              onOpenPhotoUpload={(cId) => setPhotoUploadModalCaseId(cId)}
              onNavigateToBilling={() => setActiveView('BILLING')}
            />
          )}
        </main>
      </div>

      {/* GPS Geotagged Site Visit Modal */}
      {siteVisitModalCaseId && siteVisitCase && (
        <ValuerMapPinModal
          isOpen={true}
          caseData={siteVisitCase}
          onClose={() => setSiteVisitModalCaseId(null)}
          onLocationPinned={() => setSiteVisitModalCaseId(null)}
        />
      )}

      {/* Site Visit Photo Upload Modal */}
      {photoUploadModalCaseId && cases.find((c) => c.id === photoUploadModalCaseId) && (
        <SiteVisitPhotoUploadModal
          isOpen={true}
          caseData={cases.find((c) => c.id === photoUploadModalCaseId)!}
          onClose={() => setPhotoUploadModalCaseId(null)}
          onPhotosUpdated={() => setCases(apfStore.getAllCases())}
        />
      )}
    </div>
  );
};
