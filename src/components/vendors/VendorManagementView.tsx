import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Users2,
  Building2,
  Scale,
  Award,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  DollarSign,
  Plus,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface VendorManagementViewProps {
  currentUser: UserAccount;
  onBack: () => void;
}

interface VendorRecord {
  id: string;
  name: string;
  category: 'VALUER_AGENCY' | 'INDIVIDUAL_VALUER' | 'LEGAL_FIRM' | 'ADVOCATE';
  empanelmentGrade: 'A+' | 'A' | 'B';
  empanelmentStatus: 'ACTIVE' | 'UNDER_REVIEW' | 'EXPIRED';
  licenseNumber: string;
  geography: string;
  activeAssignments: number;
  completedYtd: number;
  slaAdherencePct: number;
  rateCardTier: string;
  validUntil: string;
}

const MOCK_VENDORS: VendorRecord[] = [
  {
    id: 'VEN-VAL-001',
    name: 'Knight Frank India Pvt Ltd',
    category: 'VALUER_AGENCY',
    empanelmentGrade: 'A+',
    empanelmentStatus: 'ACTIVE',
    licenseNumber: 'IBBI/RV-E/02/2019/108',
    geography: 'Mumbai MMR, Pune, Bengaluru',
    activeAssignments: 6,
    completedYtd: 42,
    slaAdherencePct: 98.4,
    rateCardTier: 'Tier 1 Metro (₹25,000 + GST)',
    validUntil: '31-Mar-2027',
  },
  {
    id: 'VEN-VAL-002',
    name: 'CBRE South Asia Pvt Ltd',
    category: 'VALUER_AGENCY',
    empanelmentGrade: 'A+',
    empanelmentStatus: 'ACTIVE',
    licenseNumber: 'IBBI/RV-E/01/2018/104',
    geography: 'National Pan-India',
    activeAssignments: 4,
    completedYtd: 38,
    slaAdherencePct: 97.2,
    rateCardTier: 'Tier 1 Metro (₹25,000 + GST)',
    validUntil: '31-Dec-2026',
  },
  {
    id: 'VEN-LEG-001',
    name: 'Dua Associates & Partners',
    category: 'LEGAL_FIRM',
    empanelmentGrade: 'A+',
    empanelmentStatus: 'ACTIVE',
    licenseNumber: 'BCI/ND/1986/442',
    geography: 'Maharashtra, Delhi NCR, Karnataka',
    activeAssignments: 5,
    completedYtd: 51,
    slaAdherencePct: 99.1,
    rateCardTier: 'Full Search Tier (₹35,000 + GST)',
    validUntil: '30-Jun-2027',
  },
  {
    id: 'VEN-LEG-002',
    name: 'Adv. Rajesh K. Sharma & Associates',
    category: 'ADVOCATE',
    empanelmentGrade: 'A',
    empanelmentStatus: 'ACTIVE',
    licenseNumber: 'MAH/2004/1892',
    geography: 'Pune, PCMC, Nashik',
    activeAssignments: 3,
    completedYtd: 29,
    slaAdherencePct: 95.8,
    rateCardTier: 'High Court Senior (₹20,000 + GST)',
    validUntil: '31-Mar-2026',
  },
  {
    id: 'VEN-VAL-003',
    name: 'Er. Sandeep Joshi (Chartered Engineer)',
    category: 'INDIVIDUAL_VALUER',
    empanelmentGrade: 'A',
    empanelmentStatus: 'ACTIVE',
    licenseNumber: 'IOV/F-12044',
    geography: 'Pune & Western Maharashtra',
    activeAssignments: 2,
    completedYtd: 24,
    slaAdherencePct: 94.5,
    rateCardTier: 'Individual Standard (₹15,000 + GST)',
    validUntil: '30-Sep-2026',
  },
];

export const VendorManagementView: React.FC<VendorManagementViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [vendors] = useState<VendorRecord[]>(MOCK_VENDORS);
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'VALUERS' | 'LEGAL' | 'EMPANELMENT' | 'PERFORMANCE' | 'RATE_CARDS'
  >('ALL');
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.geography.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'VALUERS') return matchesSearch && (v.category === 'VALUER_AGENCY' || v.category === 'INDIVIDUAL_VALUER');
    if (activeTab === 'LEGAL') return matchesSearch && (v.category === 'LEGAL_FIRM' || v.category === 'ADVOCATE');
    return matchesSearch;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Vendor Management"
        pageTitle="Empanelled Valuers & Legal Counsel Repository"
        subtitle="Independent third-party empanelment • IBBI & Bar Council compliance • Performance SLA benchmarks"
        breadcrumbs={[{ label: 'Operations', onClick: onBack }, { label: 'Vendor Management' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => alert('Add vendor empanelment modal.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Empanel New Vendor</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Empanelled Partners</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{vendors.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700">Valuation Agencies & Valuers</div>
          <div className="text-xl font-bold text-sky-900 mt-1">3</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700">Legal Firms & Advocates</div>
          <div className="text-xl font-bold text-indigo-900 mt-1">2</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Avg TAT Compliance</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">97.4%</div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor by name, license, geography..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Vendors' },
            { id: 'VALUERS', label: 'Valuers & Agencies' },
            { id: 'LEGAL', label: 'Legal Firms & Advocates' },
            { id: 'RATE_CARDS', label: 'Rate Cards' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Vendor Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">License / Registration</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Active Dockets</th>
                <th className="py-2.5 px-3">SLA Adherence</th>
                <th className="py-2.5 px-3">Empanelment Valid</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {v.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                      {v.empanelmentGrade}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {v.licenseNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {v.geography}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {v.activeAssignments} active
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-700 font-bold">{v.slaAdherencePct}%</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {v.validUntil}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedVendorId(v.id)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View 360</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Detail Drawer */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-bold">
                  {selectedVendor.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedVendor.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendorId(null)}
                className="text-slate-400 hover:text-slate-900 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">Empanelment Details</div>
                <div>Grade: <strong className="text-emerald-700">{selectedVendor.empanelmentGrade}</strong></div>
                <div>Category: <strong className="text-slate-800">{selectedVendor.category}</strong></div>
                <div>Registration: <strong className="font-mono text-slate-800">{selectedVendor.licenseNumber}</strong></div>
                <div>Empanelment Validity: <strong className="text-slate-800">{selectedVendor.validUntil}</strong></div>
                <div>Rate Card: <strong className="text-sky-700">{selectedVendor.rateCardTier}</strong></div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">Performance Metrics</div>
                <div>Active Assignments: <strong>{selectedVendor.activeAssignments}</strong></div>
                <div>Completed YTD: <strong>{selectedVendor.completedYtd}</strong></div>
                <div>SLA Adherence: <strong className="text-emerald-700">{selectedVendor.slaAdherencePct}%</strong></div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVendorId(null)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
