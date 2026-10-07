import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  Files,
  FileCheck2,
  Download,
  UploadCloud,
  Search,
  Filter,
  Eye,
  Lock,
  History,
  CheckCircle2,
} from 'lucide-react';

interface DocumentVaultViewProps {
  currentUser: UserAccount;
  onBack: () => void;
}

interface VaultDoc {
  id: string;
  name: string;
  caseId: string;
  category: 'PROJECT' | 'TECHNICAL' | 'LEGAL' | 'EXPOSURE' | 'APPROVAL' | 'BILLING';
  version: string;
  type: string;
  uploadedBy: string;
  date: string;
  status: 'CURRENT' | 'SUPERSEDED';
  sha256Hash: string;
  visibility: 'CONFIDENTIAL' | 'INTERNAL' | 'VENDOR_SHARED';
}

const MOCK_DOCS: VaultDoc[] = [
  {
    id: 'DOC-2026-001',
    name: 'MahaRERA_Registration_P52100018542.pdf',
    caseId: 'APF-2026-0001',
    category: 'PROJECT',
    version: 'v1.2',
    type: 'Statutory Clearance',
    uploadedBy: 'cpa.desk01',
    date: '14-Jan-2026',
    status: 'CURRENT',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    visibility: 'INTERNAL',
  },
  {
    id: 'DOC-2026-002',
    name: 'Sanctioned_Floor_Plan_Wing_A.pdf',
    caseId: 'APF-2026-0001',
    category: 'TECHNICAL',
    version: 'v2.0',
    type: 'Architectural Blueprint',
    uploadedBy: 'valuer.kf01',
    date: '02-Feb-2026',
    status: 'CURRENT',
    sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    visibility: 'VENDOR_SHARED',
  },
  {
    id: 'DOC-2026-003',
    name: 'Title_Search_Report_30_Years.pdf',
    caseId: 'APF-2026-0001',
    category: 'LEGAL',
    version: 'v1.0',
    type: 'Title Search (TSR)',
    uploadedBy: 'legal.ext01',
    date: '10-Feb-2026',
    status: 'CURRENT',
    sha256Hash: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72',
    visibility: 'INTERNAL',
  },
  {
    id: 'DOC-2026-004',
    name: 'CERSAI_Charge_Verification_Certificate.pdf',
    caseId: 'APF-2026-0002',
    category: 'EXPOSURE',
    version: 'v1.1',
    type: 'CERSAI Search Report',
    uploadedBy: 'credit.com01',
    date: '15-Feb-2026',
    status: 'CURRENT',
    sha256Hash: '675354a30e8c71d603a1d94f30c33a9ed183636f88ec8ff007324c45305fb79b',
    visibility: 'CONFIDENTIAL',
  },
  {
    id: 'DOC-2026-005',
    name: 'APF_Sanction_Certificate_Signed.pdf',
    caseId: 'APF-2026-0001',
    category: 'APPROVAL',
    version: 'v1.0',
    type: 'Sanction Letter',
    uploadedBy: 'approver.sr01',
    date: '20-Feb-2026',
    status: 'CURRENT',
    sha256Hash: '127909bc736a5fae5ff242ab11b339478f731a57c0a969634e0edc91e550e50f',
    visibility: 'INTERNAL',
  },
  {
    id: 'DOC-2026-006',
    name: 'Tax_Invoice_INV_KF_2026_091.pdf',
    caseId: 'APF-2026-0001',
    category: 'BILLING',
    version: 'v1.0',
    type: 'Vendor Tax Invoice',
    uploadedBy: 'valuer.kf01',
    date: '22-Feb-2026',
    status: 'CURRENT',
    sha256Hash: '8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4',
    visibility: 'INTERNAL',
  },
];

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [docs] = useState<VaultDoc[]>(MOCK_DOCS);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = docs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.caseId.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Document Vault"
        pageTitle="Centralized APF Document & Evidence Vault"
        subtitle="Versioned document repository • Cryptographic hash audit • Project, Legal, Technical & Billing files"
        breadcrumbs={[{ label: 'Governance', onClick: onBack }, { label: 'Document Vault' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => alert('Document upload dialog opened.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ Upload Document</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name, case ID, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Files' },
            { id: 'PROJECT', label: 'Project' },
            { id: 'TECHNICAL', label: 'Technical' },
            { id: 'LEGAL', label: 'Legal' },
            { id: 'EXPOSURE', label: 'Exposure' },
            { id: 'APPROVAL', label: 'Approval' },
            { id: 'BILLING', label: 'Billing' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Document Name</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Uploaded By</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SHA-256 Hash</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{d.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{d.id} · {d.type}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    {d.caseId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                    {d.version}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {d.uploadedBy}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {d.date}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                    {d.sha256Hash.substring(0, 12)}...
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => alert(`Previewing ${d.name}`)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading ${d.name}`)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
