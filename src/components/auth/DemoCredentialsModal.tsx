import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Search,
  Building2,
  Scale,
  Calculator,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  KeyRound,
  Info,
} from 'lucide-react';

interface DemoUserItem {
  key: string;
  name: string;
  role: string;
  roleTitle: string;
  deptOrAgency: string;
  portal: 'BANK' | 'VALUER' | 'LEGAL';
  description: string;
  avatarInitials: string;
}

export const DEMO_PERSONAS: DemoUserItem[] = [
  // Bank Console
  {
    key: 'cpa01',
    name: 'Rohan Deshmukh',
    role: 'CPA',
    roleTitle: 'Credit Processing Associate (Maker)',
    deptOrAgency: 'Pune Retail Lending Branch • Operations Desk',
    portal: 'BANK',
    description: 'Initiate APF dockets, allocate Valuers & Legal Counsel, Review Exposure 360, Dispatch to LOS.',
    avatarInitials: 'RD',
  },
  {
    key: 'com01',
    name: 'Amitav Sen',
    role: 'COM',
    roleTitle: 'Credit Operations Manager (Checker)',
    deptOrAgency: 'Credit Operations & Supervisory Hub',
    portal: 'BANK',
    description: 'Supervisory reconciliation, Exposure 360 sign-off, rate verification, endorse to Approver.',
    avatarInitials: 'AS',
  },
  {
    key: 'legal.int01',
    name: 'Adv. Meenakshi Sundaram',
    role: 'INTERNAL_LEGAL',
    roleTitle: 'Internal Bank Legal Counsel',
    deptOrAgency: 'Bank In-House Legal Cell & Title Risk Bureau',
    portal: 'BANK',
    description: 'Internal Title Clearances, Dual Review Variance Analysis, Special Sanction Covenants.',
    avatarInitials: 'MS',
  },
  {
    key: 'valuer.int01',
    name: 'Ar. Rajesh Deshpande',
    role: 'INTERNAL_VALUER',
    roleTitle: 'Internal Technical Valuer & Architect',
    deptOrAgency: 'Direct Technical Appraisal & Engineering Cell',
    portal: 'BANK',
    description: 'Internal engineering inspections, structural review, cost verification, benchmark validation.',
    avatarInitials: 'RD',
  },
  {
    key: 'approver01',
    name: 'Priya Sharma',
    role: 'APPROVER',
    roleTitle: 'Zonal Approving Authority',
    deptOrAgency: 'Retail Risk Sanctions Cockpit',
    portal: 'BANK',
    description: 'Credit Sanction Cockpit, condition compliance, multi-tier exposure sanction authority.',
    avatarInitials: 'PS',
  },
  {
    key: 'committee01',
    name: 'Vikram Malhotra',
    role: 'COMMITTEE',
    roleTitle: 'Zonal Credit Committee Member',
    deptOrAgency: 'Credit Sanction Committee (ZCC)',
    portal: 'BANK',
    description: 'High-exposure group credit deliberation, policy deviations, large ticket APF endorsements.',
    avatarInitials: 'VM',
  },
  {
    key: 'billing.maker01',
    name: 'K. S. Nair',
    role: 'BILLING_MAKER',
    roleTitle: 'Billing Operations Maker',
    deptOrAgency: 'Retail Loan Accounting & Vendor Finance',
    portal: 'BANK',
    description: 'Milestone validation, fee calculations, TDS under 194J verification, 3-way invoice matching.',
    avatarInitials: 'KN',
  },
  {
    key: 'billing.checker01',
    name: 'Sunita Iyer',
    role: 'BILLING_CHECKER',
    roleTitle: 'Billing Operations Checker',
    deptOrAgency: 'Accounts Payable & Treasury Sanctions',
    portal: 'BANK',
    description: 'Disbursement endorsement, payment batch approvals, ERP finance voucher dispatching.',
    avatarInitials: 'SI',
  },
  {
    key: 'admin01',
    name: 'Siddharth Rao',
    role: 'ADMIN',
    roleTitle: 'APF System Administrator',
    deptOrAgency: 'Core Banking IT & Risk Governance',
    portal: 'BANK',
    description: 'Master registry maintenance, user provisioning, system security audit & gateway monitoring.',
    avatarInitials: 'SR',
  },

  // External Valuer Portal
  {
    key: 'valuer.ext01',
    name: 'M. K. Kulkarni',
    role: 'EXTERNAL_VALUER',
    roleTitle: 'Empanelled Panel Valuer',
    deptOrAgency: 'Knight Frank Valuation Services LLP',
    portal: 'VALUER',
    description: 'Site visit execution with GPS geotagging, valuation grid, evidence repository, and fee claims.',
    avatarInitials: 'MK',
  },
  {
    key: 'valuer.agency01',
    name: 'S. K. Singhal',
    role: 'EXTERNAL_VALUER',
    roleTitle: 'Valuation Agency Managing Partner',
    deptOrAgency: 'Knight Frank Valuation Services LLP',
    portal: 'VALUER',
    description: 'Agency docket distribution, valuer team oversight, submitted appraisal archives, agency billing.',
    avatarInitials: 'SS',
  },

  // External Legal Portal
  {
    key: 'legal.ext01',
    name: 'Adv. Ananya Deshmukh',
    role: 'EXTERNAL_LEGAL_ADVOCATE',
    roleTitle: 'Empanelled External Legal Advocate',
    deptOrAgency: 'Demo Legal Associates • Title Scrutiny Panel',
    portal: 'LEGAL',
    description: '12-step legal due diligence, 30-year title flow, search reports, conflict declaration, legal opinion.',
    avatarInitials: 'AD',
  },
  {
    key: 'legalfirm.admin01',
    name: 'Adv. Sanjay Trivedi',
    role: 'EXTERNAL_LEGAL_FIRM_ADMIN',
    roleTitle: 'Law Firm Admin (Managing Partner)',
    deptOrAgency: 'Demo Legal Associates LLP',
    portal: 'LEGAL',
    description: 'Law firm case allocation, advocate performance monitoring, empanelment profile, tax invoicing.',
    avatarInitials: 'ST',
  },
  {
    key: 'legalfirm.user01',
    name: 'Adv. Siddharth Kulkarni',
    role: 'EXTERNAL_LEGAL_FIRM_USER',
    roleTitle: 'Associate Legal Counsel',
    deptOrAgency: 'Demo Legal Associates LLP',
    portal: 'LEGAL',
    description: 'Revenue records review, dual review scrutinies, sub-registrar search verification.',
    avatarInitials: 'SK',
  },
];

interface DemoCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (username: string, portal: 'BANK' | 'VALUER' | 'LEGAL') => void;
  defaultPortal?: 'BANK' | 'VALUER' | 'LEGAL';
}

export const DemoCredentialsModal: React.FC<DemoCredentialsModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
  defaultPortal = 'BANK',
}) => {
  const [activeTab, setActiveTab] = useState<'BANK' | 'VALUER' | 'LEGAL'>(defaultPortal);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = DEMO_PERSONAS.filter((p) => {
    if (p.portal !== activeTab) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.roleTitle.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.deptOrAgency.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#DCE3EB] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DCE3EB] flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F33] text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#172033]">Demo Personas & Credentials</h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  POC DEMO ACCESS ONLY
                </span>
              </div>
              <p className="text-[11px] text-[#667085]">
                Select any enterprise persona to instantly populate credentials and enter the targeted portal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Filter Tabs */}
        <div className="p-3 border-b border-[#DCE3EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('BANK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'BANK'
                  ? 'bg-white text-[#0B1F33] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Bank Console</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {DEMO_PERSONAS.filter((p) => p.portal === 'BANK').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('VALUER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'VALUER'
                  ? 'bg-white text-[#0B1F33] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>External Valuer</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {DEMO_PERSONAS.filter((p) => p.portal === 'VALUER').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('LEGAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'LEGAL'
                  ? 'bg-white text-[#0B1F33] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>External Legal</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {DEMO_PERSONAS.filter((p) => p.portal === 'LEGAL').length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search persona or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#DCE3EB] focus:outline-none focus:ring-1 focus:ring-[#1667C1] text-[#172033]"
            />
          </div>
        </div>

        {/* Personas List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No demo personas match the search filter.
            </div>
          ) : (
            filtered.map((persona) => (
              <div
                key={persona.key}
                onClick={() => onSelectPersona(persona.key, persona.portal)}
                className="bg-white p-3.5 rounded-lg border border-[#DCE3EB] hover:border-[#1667C1] hover:shadow-xs transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 group-hover:bg-sky-50 group-hover:border-sky-200 group-hover:text-sky-800 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                    {persona.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#172033] group-hover:text-[#1667C1]">
                        {persona.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {persona.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Username: {persona.key}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                      {persona.roleTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {persona.deptOrAgency}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-1">
                      {persona.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 group-hover:bg-[#0B1F33] text-slate-700 group-hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Use Credentials</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DCE3EB] bg-white flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Default demo password for all accounts: <strong>Demo@123</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
