import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { UserRole, ScreenId } from '../../types/apf';
import { REAL_10_PROJECTS, RealProjectSeed } from '../../data/realProjects';
import {
  ShieldAlert,
  Search,
  SlidersHorizontal,
  ChevronRight,
  History,
  Building2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuditLog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuditLog }) => {
  const {
    currentRole,
    setCurrentRole,
    currentScreen,
    setCurrentScreen,
    setIsAuditLogOpen,
  } = useAPF();

  // 10 Required Banking Roles
  const roles: UserRole[] = [
    'CPA',
    'COM',
    'Internal Valuer',
    'External Valuer',
    'Legal Reviewer',
    'Approving Manager',
    'Committee Member',
    'Risk/Credit Viewer',
    'Auditor/Admin Viewer',
    'LOS Integration Service',
  ];

  // 25 Specific Required Connected Screens mapped to ScreenId / routes
  const screenOptions: { id: ScreenId | string; label: string; stage?: string }[] = [
    { id: 'flow', label: '★ 16-Stage Transaction Journey (Interactive)', stage: 'Primary Demo' },
    { id: '01', label: '02. Executive APF Control Tower', stage: 'Overview' },
    { id: '02', label: '03. APF Case Search / Master List', stage: 'Initiation' },
    { id: '11', label: '04. New APF Initiation Docket', stage: 'Initiation' },
    { id: '03', label: '05. Builder Search / Builder 360', stage: 'Builder' },
    { id: '12', label: '06. Project 360 Overview', stage: 'Project' },
    { id: 'flow', label: '07. Valuer Assignment', stage: 'Valuation' },
    { id: 'flow', label: '08. Valuer Mobile Task List', stage: 'Mobile' },
    { id: 'flow', label: '09. Mobile Site Visit Start / GPS Lock', stage: 'Mobile' },
    { id: '14', label: '10. Site Visit Project / Tower Capture', stage: 'Inspection' },
    { id: '17', label: '11. Photo / Video Evidence Capture', stage: 'Evidence' },
    { id: '21', label: '12. Market Comparables Grid', stage: 'Valuation' },
    { id: '20', label: '13. Valuation Working & Benchmarks', stage: 'Valuation' },
    { id: 'flow', label: '14. Valuation Report Preview', stage: 'Report' },
    { id: 'flow', label: '15. Valuer Final Report Submission', stage: 'Submit' },
    { id: '25', label: '16. CPA Review Workspace & AI Underwriter', stage: 'Review' },
    { id: '06', label: '17. Builder / Group / Project Exposure 360', stage: 'Exposure' },
    { id: '07', label: '18. Exposure Reconciliation (Golden Record)', stage: 'Reconciliation' },
    { id: 'flow', label: '19. COM Supervisory Review Workspace', stage: 'Supervisory' },
    { id: '26', label: '20. Committee / Approval Cockpit', stage: 'Approval' },
    { id: '27', label: '21. Sanction Conditions & Covenants', stage: 'Conditions' },
    { id: '22', label: '22. Financial Assessment & Send to LOS', stage: 'LOS Handoff' },
    { id: 'flow', label: '23. LOS Request / Response Gateway Monitor', stage: 'LOS Monitor' },
    { id: 'flow', label: '24. APF Case Timeline & Audit Trail', stage: 'Audit' },
    { id: '28', label: '25. Monitoring & Early Warning System (EWS)', stage: 'Monitoring' },
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentRole(e.target.value as UserRole);
  };

  const handleScreenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentScreen(e.target.value as ScreenId);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#cbd5e1] shadow-xs text-[#102a43] px-5 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left Side: Brand & Mode Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentScreen('flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              currentScreen === 'flow'
                ? 'bg-[#19638c] text-white ring-2 ring-[#19638c]/30'
                : 'bg-[#0c3148] hover:bg-[#19638c] text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>End-to-End Transaction Demo</span>
            <span className="bg-emerald-400 text-[#0c3148] text-[9px] px-1 py-0.2 rounded font-black uppercase">
              16 Steps
            </span>
          </button>

          {/* Quick Screen Jump Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#627d98]">
            <span className="text-[11px] font-semibold text-[#486581] hidden sm:inline">Screen:</span>
            <select
              value={currentScreen}
              onChange={handleScreenChange}
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#102a43] focus:outline-none focus:ring-1 focus:ring-[#19638c]"
            >
              {screenOptions.map((opt, idx) => (
                <option key={idx} value={opt.id}>
                  {opt.label} ({opt.stage})
                </option>
              ))}
            </select>
          </div>

          <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 hidden md:inline-block">
            SIMULATED POC DATA
          </span>
        </div>

        {/* Right Side: Role Persona Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
          {/* Active Role Switcher */}
          <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-2.5 py-1 rounded-lg border border-[#cbd5e1] text-xs">
            <span className="text-[11px] font-bold text-[#627d98] uppercase tracking-wider">Role Persona:</span>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="bg-transparent font-bold text-[#0c3148] focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Trail Modal Launcher */}
          <button
            onClick={() => {
              if (onOpenAuditLog) onOpenAuditLog();
              else setIsAuditLogOpen(true);
            }}
            className="px-2.5 py-1 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#334e68] flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#19638c]" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>
    </header>
  );
};
