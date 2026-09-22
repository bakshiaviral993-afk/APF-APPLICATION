import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import {
  Search,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DEMO_COMPANIES, DEMO_BUILDER_GROUP } from '../../data/mockData';

export const Screen02_BuilderSearch: React.FC = () => {
  const { setCurrentScreen, setSelectedCompany, addAuditLog } = useAPF();
  const [searchTerm, setSearchTerm] = useState('ABC Developers / Apex Habitat');
  const [hasSearched, setHasSearched] = useState(true);

  const handleSelectCompany = (comp: any) => {
    setSelectedCompany(comp);
    addAuditLog('SELECT_BUILDER', comp.legalName, 'Selected builder and navigated to Builder 360');
    setCurrentScreen('03'); // Screen 03: Builder 360
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Builder Search & Onboarding</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Entity Resolution Engine
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            PAN, CIN, GSTIN, and MahaRERA duplicate checks before initiating fresh APF
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#627d98] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Builder Name, PAN (e.g. AABCA1234F), CIN, or RERA ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs sm:text-sm text-[#102a43] placeholder-[#829ab1] focus:outline-none focus:border-[#19638c] font-medium"
            />
          </div>
          <button
            onClick={() => setHasSearched(true)}
            className="px-5 py-2.5 bg-[#19638c] hover:bg-[#145070] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Repository</span>
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#627d98]">
          <span className="font-medium">Quick Demo Entities:</span>
          {['ABC Developers Pvt. Ltd.', 'Apex Habitat Private Limited', 'Apex Realty LLP', 'Alpha SPV Pvt Ltd'].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSearchTerm(chip);
                  setHasSearched(true);
                }}
                className="px-2.5 py-1 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334e68] border border-[#cbd5e1] transition-colors font-medium text-xs"
              >
                {chip}
              </button>
            )
          )}
        </div>
      </div>

      {/* Watchlist & Sanctions Banner */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#e6f4ea] text-[#137333] border border-[#137333]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#102a43]">Watchlist & RBI Defaulters Check: CLEAR</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#137333]/30">
                Live API Passed
              </span>
            </div>
            <p className="text-[#627d98] text-[11px] mt-0.5">
              Verified against CIBIL Defaulters List, MCA Disqualified Directors list, and OFAC/UN Sanctions.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-[11px] text-[#627d98] block font-medium">Deduplication Algorithm</span>
          <span className="font-mono text-[#19638c] font-semibold">Jaro-Winkler + PAN Token Match (98.4%)</span>
        </div>
      </div>

      {/* Search Results & Deduplication Matches */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#102a43]">
              Matching Builder Profiles ({DEMO_COMPANIES.length} Records Found)
            </h2>
            <span className="text-xs text-[#627d98]">
              Matched Group: <strong className="text-[#19638c] font-semibold">ABC Realty Group / Apex Habitat</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {DEMO_COMPANIES.map((company) => (
              <div
                key={company.id}
                className="p-5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#19638c] shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#102a43] text-base group-hover:text-[#19638c] transition-colors">
                      {company.id === 'COMP-01' ? 'ABC Developers Pvt. Ltd. (Apex Habitat)' : company.legalName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f5f9] text-[#486581] border border-[#cbd5e1]">
                      {company.entityType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
                      {company.roleInGroup}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#627d98] pt-1">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#829ab1]">PAN</span>
                      <span className="font-mono text-[#102a43] font-semibold">{company.pan}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#829ab1]">CIN / LLPIN</span>
                      <span className="font-mono text-[#102a43] font-semibold">{company.cin}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#829ab1]">RERA Promoter ID</span>
                      <span className="font-mono text-[#102a43] font-semibold">{company.reraPromoterId}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#829ab1]">Net Worth</span>
                      <span className="font-semibold text-[#137333]">₹{company.netWorthCr} Cr</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#627d98] flex items-center gap-2 pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#19638c]" />
                    <span>Promoters: {company.promoters.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#edf2f7]">
                  <div className="text-right">
                    <span className="text-[11px] text-[#627d98] block">Composite Risk Score</span>
                    <span className="text-sm font-bold text-[#b06000]">
                      {company.riskScore}/100 ({company.riskBand})
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectCompany(company)}
                    className="px-4 py-2 bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Open Builder 360</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
