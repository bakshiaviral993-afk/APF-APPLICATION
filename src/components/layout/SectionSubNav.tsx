import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { ScreenId, UserRole } from '../../types/apf';
import {
  Compass,
  ChevronDown,
  UserCheck,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  History,
} from 'lucide-react';

interface ScreenMeta {
  id: ScreenId;
  title: string;
  badge?: string;
  isKeyDemo?: boolean;
}

interface SectionNavConfig {
  sectionId: string;
  sectionLabel: string;
  screens: ScreenMeta[];
}

const SECTION_CONFIGS: Record<string, SectionNavConfig> = {
  'control-tower': {
    sectionId: 'control-tower',
    sectionLabel: 'Control Tower',
    screens: [
      { id: '01', title: 'Executive Control Tower', isKeyDemo: true },
      { id: 'flow', title: 'End-to-End APF Flow (10 Projects)', badge: 'Interactive' },
    ],
  },
  builders: {
    sectionId: 'builders',
    sectionLabel: 'Builders',
    screens: [
      { id: '03', title: 'Builder 360', isKeyDemo: true },
      { id: '02', title: 'Search & Onboarding', isKeyDemo: true },
      { id: '04', title: 'Promoter 360' },
      { id: '05', title: 'Group Structure Graph', isKeyDemo: true },
      { id: '09', title: 'Financial Intelligence' },
      { id: '10', title: 'Builder Risk Score' },
    ],
  },
  projects: {
    sectionId: 'projects',
    sectionLabel: 'Projects',
    screens: [
      { id: '12', title: 'Project 360 (Alpha Towers)', isKeyDemo: true },
      { id: '15', title: 'Tower Exposure Heatmap', isKeyDemo: true },
      { id: '11', title: 'Project Registration' },
      { id: '13', title: 'Project Finance Exposure' },
      { id: '14', title: 'Phase & Tower Master' },
      { id: '16', title: 'Unit Inventory (400 Units)' },
    ],
  },
  exposure: {
    sectionId: 'exposure',
    sectionLabel: 'Exposure',
    screens: [
      { id: '07', title: 'Exposure Reconciliation', badge: '₹42 Cr Discrepancy', isKeyDemo: true },
      { id: '06', title: 'External Credit Exposure (CIC/CRILC)' },
      { id: '08', title: 'MCA Charge Intelligence' },
      { id: '15', title: 'Tower Heatmap' },
      { id: '23', title: 'Exposure Engine' },
    ],
  },
  'due-diligence': {
    sectionId: 'due-diligence',
    sectionLabel: 'Due Diligence',
    screens: [
      { id: '18', title: 'Legal AI Workspace' },
      { id: '19', title: 'Technical AI Workspace' },
      { id: '20', title: 'Valuation Intelligence' },
      { id: '17', title: 'Document Intelligence Hub' },
      { id: '21', title: 'Market Intelligence' },
      { id: '22', title: 'Financial Assessment' },
    ],
  },
  'risk-ai': {
    sectionId: 'risk-ai',
    sectionLabel: 'Risk & AI',
    screens: [
      { id: '25', title: 'AI Underwriter Workspace', badge: 'Evidence-First', isKeyDemo: true },
      { id: '24', title: 'Risk Engine (Weighted Model)' },
    ],
  },
  committee: {
    sectionId: 'committee',
    sectionLabel: 'Committee',
    screens: [
      { id: '26', title: 'Committee Decision Cockpit', isKeyDemo: true },
      { id: '27', title: 'Approval & Conditions Maker-Checker', isKeyDemo: true },
    ],
  },
  monitoring: {
    sectionId: 'monitoring',
    sectionLabel: 'Monitoring',
    screens: [
      { id: '28', title: 'Monitoring & Early Warning (EWS)', isKeyDemo: true },
      { id: '29', title: 'Renewal & Suspension Workspace' },
    ],
  },
  admin: {
    sectionId: 'admin',
    sectionLabel: 'Admin & Portfolio',
    screens: [
      { id: '30', title: 'Portfolio Intelligence (Cross-Portfolio)' },
    ],
  },
};

export const SectionSubNav: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    currentRole,
    setCurrentRole,
    isTourOpen,
    setIsTourOpen,
    setIsAuditLogOpen,
  } = useAPF();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Determine current active section
  let activeSectionKey = 'control-tower';
  for (const [key, conf] of Object.entries(SECTION_CONFIGS)) {
    if (conf.screens.some((s) => s.id === currentScreen)) {
      activeSectionKey = key;
      break;
    }
  }

  const activeConfig = SECTION_CONFIGS[activeSectionKey] || SECTION_CONFIGS['control-tower'];

  const availableRoles: { role: UserRole; label: string; defaultScreen: ScreenId }[] = [
    { role: 'Business', label: 'Relationship Manager (Business / RM)', defaultScreen: '02' },
    { role: 'Credit', label: 'Credit Underwriter (Credit / Case)', defaultScreen: '26' },
    { role: 'Risk', label: 'Risk Manager (Risk / Exposure)', defaultScreen: '01' },
    { role: 'Committee', label: 'Credit Committee Member', defaultScreen: '26' },
    { role: 'Legal', label: 'Legal Due Diligence Officer', defaultScreen: '18' },
    { role: 'Technical', label: 'Technical Inspector / Engineer', defaultScreen: '19' },
    { role: 'Valuation', label: 'Valuation Specialist', defaultScreen: '20' },
    { role: 'Monitoring', label: 'Post-Approval EWS & Monitoring', defaultScreen: '28' },
    { role: 'Admin', label: 'System Admin / Configuration', defaultScreen: '30' },
    { role: 'Management', label: 'Senior Executive / Management', defaultScreen: '01' },
  ];

  const handleSelectRole = (r: { role: UserRole; defaultScreen: ScreenId }) => {
    setCurrentRole(r.role);
    setRoleDropdownOpen(false);
  };

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-6 py-2.5 shadow-xs mb-5 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Section screens selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
          <span className="text-[11px] font-bold text-[#627d98] uppercase tracking-wider mr-1 shrink-0">
            {activeConfig.sectionLabel}:
          </span>
          {activeConfig.screens.map((screen) => {
            const isActive = currentScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#19638c] text-white shadow-xs font-semibold'
                    : 'bg-[#f8fafc] text-[#486581] hover:bg-[#edf2f7] hover:text-[#102a43] border border-[#e2e8f0]'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#627d98]'
                  }`}
                >
                  {screen.id}
                </span>
                <span>{screen.title}</span>
                {screen.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {screen.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Role Switcher & Quick Demo Tour button */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* 20-min POC Demo Tour button */}
          <button
            onClick={() => setIsTourOpen(!isTourOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
              isTourOpen
                ? 'bg-indigo-900 text-white border border-indigo-700'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Toggle 20-Minute Bank POC Demo Script Walkthrough"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">20-Min POC Script</span>
          </button>

          {/* Interactive Role Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#edf2f7] border border-[#cbd5e1] rounded-lg text-xs font-medium text-[#102a43] transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#19638c]" />
              <span className="text-[#627d98] text-[11px]">Role:</span>
              <span className="font-bold text-[#102a43]">{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#627d98]" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-72 bg-white border border-[#cbd5e1] rounded-xl shadow-xl z-50 py-1.5 text-xs divide-y divide-[#edf2f7]">
                  <div className="px-3 py-2 bg-[#f8fafc]">
                    <p className="font-bold text-[#102a43] text-[11px] uppercase tracking-wider">
                      Switch Active Bank Role (RBAC)
                    </p>
                    <p className="text-[10px] text-[#627d98] mt-0.5">
                      Updates view permissions, maker-checker authority and default work queue
                    </p>
                  </div>
                  <div className="py-1">
                    {availableRoles.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => handleSelectRole(item)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#f0f4f8] transition-colors ${
                          currentRole === item.role
                            ? 'bg-[#e8f1f5] font-bold text-[#19638c]'
                            : 'text-[#334e68]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-medium truncate">{item.label}</p>
                          <p className="text-[10px] text-[#829ab1]">Default: Screen #{item.defaultScreen}</p>
                        </div>
                        {currentRole === item.role && (
                          <CheckCircle2 className="w-4 h-4 text-[#19638c] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
