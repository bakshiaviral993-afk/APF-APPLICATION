import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { legalStore } from '../../services/legalStore';
import { apfStore } from '../../services/apfStore';
import { ExternalLegalSidebar, ExternalLegalView } from './ExternalLegalSidebar';
import { ExternalLegalDashboard } from './ExternalLegalDashboard';
import { ExternalLegalWorkspace } from './ExternalLegalWorkspace';
import { ExternalLegalBillingView } from './ExternalLegalBillingView';
import { ExternalLegalProfileView } from './ExternalLegalProfileView';
import { AssignmentAcceptDeclineModal } from './AssignmentAcceptDeclineModal';
import { AccessDeniedView } from './AccessDeniedView';
import { LegalQueryModal } from './LegalQueryModal';
import { LegalAssignment, LegalQueryItem } from '../../types/legalDueDiligence';
import {
  Scale,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  User,
  Building2,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface ExternalLegalPortalProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onSwitchUser?: (username: string) => void;
}

export const ExternalLegalPortal: React.FC<ExternalLegalPortalProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
}) => {
  const [activeView, setActiveView] = useState<ExternalLegalView>('DASHBOARD');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Modals
  const [acceptModalAssignment, setAcceptModalAssignment] = useState<LegalAssignment | null>(null);
  const [selectedQueryForThread, setSelectedQueryForThread] = useState<LegalQueryItem | null>(null);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // Subscribe to changes in legalStore
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = legalStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const vendorId = currentUser.vendorId || 'VND-LEGAL-001';
  const assignments = legalStore.getAssignments({ vendorId });
  const reports = legalStore.getAllReports();
  const queries = legalStore.getQueries(undefined, vendorId);

  const openQueriesCount = queries.filter((q) => q.status === 'INPUT_REQUIRED' || q.status === 'OPEN').length;
  const newAssignmentsCount = assignments.filter((a) => a.status === 'LEGAL_ASSIGNED').length;
  const billingEligibleCount = assignments.filter((a) => a.status === 'BILLING_ELIGIBLE').length;

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveView('DASHBOARD');
  };

  const handleBackToDashboard = () => {
    setActiveCaseId(null);
    setActiveView('DASHBOARD');
  };

  const handleRoleSwitch = (username: string) => {
    setIsRoleDropdownOpen(false);
    apfStore.login(username, 'Demo@123');
    if (onSwitchUser) onSwitchUser(username);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans">
      {/* Dedicated External Legal Top Header */}
      <header className="h-14 bg-[#0B1F33] text-white border-b border-slate-800 flex items-center justify-between px-3.5 sm:px-6 shrink-0 z-30 shadow-xs">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">PROVAL APF</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  External Legal Portal
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5">
                Advocate & Law Firm Underwriting Workstation
              </div>
            </div>
          </div>
        </div>

        {/* Center: Empanelment Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Empanelment Status:</span>
          <span className="text-emerald-400 font-bold">Active (#EMP-LEG-2024-042)</span>
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
              {(newAssignmentsCount > 0 || openQueriesCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs text-slate-800 z-50 animate-in fade-in-50">
                <div className="font-bold text-xs pb-2 border-b border-slate-200 flex justify-between items-center text-slate-900">
                  <span>Legal Notifications</span>
                  <span className="text-[10px] font-normal text-slate-400">Real-Time</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mt-1">
                  {newAssignmentsCount > 0 && (
                    <div className="py-2 space-y-0.5">
                      <div className="font-semibold text-amber-700">New APF Docket Assigned</div>
                      <p className="text-[11px] text-slate-600">
                        {newAssignmentsCount} new legal review assigned by Bank CPA awaiting acceptance.
                      </p>
                    </div>
                  )}
                  {openQueriesCount > 0 && (
                    <div className="py-2 space-y-0.5">
                      <div className="font-semibold text-sky-700">Query Updates</div>
                      <p className="text-[11px] text-slate-600">
                        {openQueriesCount} clarifications require attention or responses.
                      </p>
                    </div>
                  )}
                  {billingEligibleCount > 0 && (
                    <div className="py-2 space-y-0.5">
                      <div className="font-semibold text-emerald-700">Billing Ready</div>
                      <p className="text-[11px] text-slate-600">
                        {billingEligibleCount} review(s) approved by CPA. Expected fee ready for invoice upload.
                      </p>
                    </div>
                  )}
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
                <div className="text-[9px] text-sky-400 font-medium">
                  {currentUser.roleLabel || 'External Legal Advocate'}
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
                      <span className="text-[10px] text-slate-500">Initiate APF & Assign External Legal</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('legal.ext01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between bg-sky-50 text-sky-900 font-bold"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Adv. Ananya Deshmukh</span>
                      <span className="text-[10px] text-sky-700 font-normal">External Legal Advocate (Portal)</span>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('legalfirm.admin01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Adv. Sanjay Trivedi</span>
                      <span className="text-[10px] text-slate-500">Law Firm Admin (Managing Partner)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('legalfirm.user01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Adv. Siddharth Kulkarni</span>
                      <span className="text-[10px] text-slate-500">Associate Advocate (Dual Review)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('legal.int01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Adv. Meenakshi Sundaram</span>
                      <span className="text-[10px] text-slate-500">Internal Bank Legal Counsel</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('com01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">COM (Amitav Sen)</span>
                      <span className="text-[10px] text-slate-500">Checker • Credit Ops Manager</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('admin01')}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-xs">Admin (Siddharth Rao)</span>
                      <span className="text-[10px] text-slate-500">Master Governance</span>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 mt-2">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out of Legal Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Restricted Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <ExternalLegalSidebar
          currentUser={currentUser}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveCaseId(null);
            setActiveView(view);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={onLogout}
          openQueriesCount={openQueriesCount}
          newAssignmentsCount={newAssignmentsCount}
          billingEligibleCount={billingEligibleCount}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
          {/* Active Case Detail Workspace with Strict Authorization Guard */}
          {activeCaseId ? (
            (() => {
              const access = legalStore.validateCaseAccess(activeCaseId, currentUser);
              if (!access.allowed) {
                return (
                  <AccessDeniedView
                    caseId={activeCaseId}
                    currentUser={currentUser}
                    reason={access.reason}
                    onBack={handleBackToDashboard}
                  />
                );
              }
              return (
                <ExternalLegalWorkspace
                  caseId={activeCaseId}
                  currentUser={currentUser}
                  onBack={handleBackToDashboard}
                  onNavigateToBilling={() => {
                    setActiveCaseId(null);
                    setActiveView('BILLING_ELIGIBLE');
                  }}
                />
              );
            })()
          ) : activeView === 'DASHBOARD' || activeView === 'MY_ASSIGNMENTS' ? (
            <ExternalLegalDashboard
              currentUser={currentUser}
              assignments={assignments}
              reports={reports}
              onOpenCase={handleOpenCase}
              onAcceptDecline={(asn) => setAcceptModalAssignment(asn)}
              onNavigateToBilling={() => setActiveView('BILLING_ELIGIBLE')}
              onReallocate={(asnId, uid, uname) => {
                legalStore.reallocateAssignment(asnId, uid, uname, currentUser.name);
              }}
            />
          ) : activeView === 'QUERIES' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Need Input / Query Tray</h2>
                  <p className="text-xs text-slate-500">
                    Threaded communications and input requests with Bank CPA desk
                  </p>
                </div>
                <button
                  onClick={() => setIsQueryModalOpen(true)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Raise Clarification to CPA</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Query ID</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Case ID</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queries.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{q.id}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{q.category}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-sky-700">{q.caseId}</td>
                        <td className="py-3 px-3 max-w-[200px] truncate text-slate-700">{q.subject}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{q.priority}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'INPUT_RECEIVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedQueryForThread(q);
                              setIsQueryModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold cursor-pointer"
                          >
                            Open Thread
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeView === 'SUBMITTED_REPORTS' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submitted Legal Reports Archive</h2>
                <p className="text-xs text-slate-500">
                  Cryptographically sealed title scrutiny reports submitted to Bank Credit Operations
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Review ID</th>
                      <th className="py-2.5 px-3">APF Docket</th>
                      <th className="py-2.5 px-3">Builder & Project</th>
                      <th className="py-2.5 px-3">Version & Hash</th>
                      <th className="py-2.5 px-3">Opinion</th>
                      <th className="py-2.5 px-3">Submitted At</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports
                      .filter((r) => r.isLocked || r.status === 'LEGAL_SUBMITTED')
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">{r.id}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-sky-700">{r.caseId}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold block">{r.builderLegalName}</span>
                            <span className="text-[10px] text-slate-500">{r.projectName}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold">
                              {r.version}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {r.reportHash || 'SHA256:d8a9e7f6a5b4c3d2'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-800">{r.legalOpinion?.opinion}</td>
                          <td className="py-3 px-3 text-slate-600">{r.declaration?.submittedAt || r.reportDate}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenCase(r.caseId)}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Inspect Docket
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeView === 'BILLING_ELIGIBLE' ||
            activeView === 'MY_INVOICES' ||
            activeView === 'PAYMENT_STATUS' ? (
            <ExternalLegalBillingView
              currentUser={currentUser}
              onNavigateToCase={handleOpenCase}
            />
          ) : (
            <ExternalLegalProfileView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Acceptance / Decline Modal */}
      {acceptModalAssignment && (
        <AssignmentAcceptDeclineModal
          isOpen={!!acceptModalAssignment}
          onClose={() => setAcceptModalAssignment(null)}
          assignment={acceptModalAssignment}
          currentUser={currentUser}
          onAccepted={(upd) => {
            setAcceptModalAssignment(null);
            handleOpenCase(upd.caseId);
          }}
          onDeclined={() => {
            setAcceptModalAssignment(null);
          }}
        />
      )}

      {/* Query Modal */}
      {isQueryModalOpen && (
        <LegalQueryModal
          isOpen={isQueryModalOpen}
          onClose={() => {
            setIsQueryModalOpen(false);
            setSelectedQueryForThread(null);
          }}
          caseId={selectedQueryForThread?.caseId || activeCaseId || 'APF-2026-0001'}
          reviewId={selectedQueryForThread?.reviewId || 'LEG-REV-2026-001'}
          vendorId={vendorId}
          currentUser={currentUser}
          activeQuery={selectedQueryForThread}
        />
      )}
    </div>
  );
};
