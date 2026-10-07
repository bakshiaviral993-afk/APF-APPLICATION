import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Settings,
  Users,
  Shield,
  Sliders,
  DollarSign,
  Clock,
  Layers,
  FileCode2,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface AdminConfigurationViewProps {
  currentUser: UserAccount;
  onBack: () => void;
}

export const AdminConfigurationView: React.FC<AdminConfigurationViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'USERS_ROLES'
    | 'PERMISSIONS'
    | 'LOV_MASTER'
    | 'SCORE_MASTER'
    | 'SLA_RULES'
    | 'RATE_CARDS'
    | 'TAX_RULES'
    | 'APPROVAL_MATRIX'
    | 'INTEGRATION_CFG'
    | 'NOTIFICATIONS'
  >('USERS_ROLES');

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Admin Configuration"
        pageTitle="System Administration & Enterprise Governance Configuration"
        subtitle="Role-based access matrix • Master LOV dictionaries • Score engine weights • Rate card tables"
        breadcrumbs={[{ label: 'Governance', onClick: onBack }, { label: 'Admin Configuration' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => alert('Configuration changes committed and active across all instances.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-sky-400" />
            <span>Save Configuration</span>
          </button>
        }
      />

      {/* Configuration Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'USERS_ROLES', label: 'Users & Roles' },
          { id: 'PERMISSIONS', label: 'RBAC Permissions' },
          { id: 'LOV_MASTER', label: 'LOV Master' },
          { id: 'SCORE_MASTER', label: 'Score Master' },
          { id: 'SLA_RULES', label: 'SLA Rules' },
          { id: 'RATE_CARDS', label: 'Rate Cards' },
          { id: 'TAX_RULES', label: 'Tax Rules' },
          { id: 'APPROVAL_MATRIX', label: 'Approval Matrix' },
          { id: 'INTEGRATION_CFG', label: 'Integrations' },
          { id: 'NOTIFICATIONS', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'USERS_ROLES' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">User Accounts & Assigned Roles (Active Directory / SSO Mapped)</h3>
            <span className="text-slate-500 font-mono">14 User Accounts Provisioned</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'usr-cpa-01', name: 'Vikram Joshi', email: 'vikram.joshi@bank.internal', role: 'CPA', dept: 'Underwriting' },
              { id: 'usr-com-01', name: 'Rajesh K. Verma', email: 'rajesh.verma@bank.internal', role: 'COM', dept: 'Credit Operations' },
              { id: 'usr-leg-int-01', name: 'Adv. Sneha Deshmukh', email: 'sneha.deshmukh@bank.internal', role: 'INTERNAL_LEGAL', dept: 'Legal Operations' },
              { id: 'usr-val-int-01', name: 'Er. Anand Kulkarni', email: 'anand.kulkarni@bank.internal', role: 'INTERNAL_VALUER', dept: 'Technical Valuations' },
              { id: 'usr-appr-01', name: 'Sunil Rao', email: 'sunil.rao@bank.internal', role: 'APPROVER', dept: 'Credit Committee' },
              { id: 'usr-bill-mkr-01', name: 'Pooja Nair', email: 'pooja.nair@bank.internal', role: 'BILLING_MAKER', dept: 'Finance & Accounts' },
              { id: 'usr-bill-chk-01', name: 'Harish Mehta', email: 'harish.mehta@bank.internal', role: 'BILLING_CHECKER', dept: 'Finance & Accounts' },
              { id: 'usr-adm-01', name: 'System Administrator', email: 'admin.apf@bank.internal', role: 'ADMIN', dept: 'IT & Security' },
            ].map((u) => (
              <div key={u.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">{u.name}</strong>
                  <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    {u.dept}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'APPROVAL_MATRIX' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900">Delegated Sanction Authority Matrix</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <strong className="text-slate-800">Level 1: Credit Operations Manager (COM)</strong>
                <p className="text-slate-500 text-[11px]">Sanction authority for Cat A/A+ builders up to ₹50 Cr retail APF exposure</p>
              </div>
              <span className="font-mono font-bold text-slate-900">Up to ₹50 Cr</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <strong className="text-slate-800">Level 2: Zonal Credit Committee (ZCC)</strong>
                <p className="text-slate-500 text-[11px]">Sanction authority for Cat A & B builders up to ₹150 Cr retail APF exposure</p>
              </div>
              <span className="font-mono font-bold text-slate-900">Up to ₹150 Cr</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <strong className="text-slate-800">Level 3: Executive Committee of the Board (ECB)</strong>
                <p className="text-slate-500 text-[11px]">All exposures exceeding ₹150 Cr or cases with NCLT / legal exception covenants</p>
              </div>
              <span className="font-mono font-bold text-emerald-800">&gt; ₹150 Cr & Exceptions</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RATE_CARDS' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900">Empanelled Professional Rate Card Tables</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <strong className="text-slate-800">Tier 1 Metro Technical Valuation (Agencies)</strong>
                <p className="text-slate-500 text-[11px]">Knight Frank, CBRE, JLL - Comprehensive site visit & appraisal</p>
              </div>
              <span className="font-mono font-bold text-slate-900">₹25,000 + 18% GST</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <strong className="text-slate-800">Tier 1 Full 30-Year Legal Title Search (Law Firms)</strong>
                <p className="text-slate-500 text-[11px]">Dua Associates, Shardul Amarchand - Search report & final opinion</p>
              </div>
              <span className="font-mono font-bold text-slate-900">₹35,000 + 18% GST</span>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'USERS_ROLES' && activeTab !== 'APPROVAL_MATRIX' && activeTab !== 'RATE_CARDS' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-8 shadow-2xs text-center text-xs text-slate-500 space-y-2">
          <Settings className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">Active Enterprise Configuration Engine</div>
          <p className="max-w-md mx-auto text-slate-500">
            Parameters under this module are synchronized with the central configuration repository and enforce automated business validation rules.
          </p>
        </div>
      )}
    </div>
  );
};
