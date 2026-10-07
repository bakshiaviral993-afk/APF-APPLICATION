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
} from 'lucide-react';

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
    apfStore.login(username, 'Demo@123');
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
    </div>
  );
};
