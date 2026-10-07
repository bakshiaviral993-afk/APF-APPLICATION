import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { Scale, CheckCircle2, AlertTriangle, FileText, ChevronRight, ShieldAlert } from 'lucide-react';
import { legalStore } from '../../services/legalStore';
import { LegalReportDocModal } from '../legal/LegalReportDocModal';

export const Screen18_LegalAI: React.FC = () => {
  const { setCurrentScreen, setActiveEvidence } = useAPF();
  const [showLegalDocModal, setShowLegalDocModal] = useState(false);

  const legalClauses = [
    {
      title: '30-Year Title Search & Chain of Ownership',
      counsel: 'Khaitan & Partners Advocates',
      status: 'Clean & Marketable',
      finding:
        'Clear title traced back to 1994 from original agricultural owner through registered conveyance deed Doc No. 4102/2018. Development agreement executed with ABC Developers (Apex Habitat SPV).',
      severity: 'Low',
    },
    {
      title: 'Pending Litigation: Dindoshi Civil Court Suit No. 1084/2025',
      counsel: 'Adv. Suresh Shah (Local Counsel)',
      status: 'Indemnity Required',
      finding:
        'Adjoining landholder filed suit claiming 0.4 acre boundary overlap on western periphery. Crucially, main project access is 30-meter Development Plan (DP) Road on south; project structure not affected.',
      severity: 'Medium',
    },
    {
      title: 'Commencement Certificate (CC) & Approvals',
      counsel: 'MCGM / BMC Planning Division',
      status: 'Valid up to 18th Slab',
      finding:
        'Commencement Certificate No. EB/4102/KW/CC valid for Phase 1 (Towers A, B, C, D) up to 18th floor. Further plinth re-validation required prior to 19th floor casting.',
      severity: 'Low',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Legal AI Due Diligence Workspace</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Legal Search & Encumbrance
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            AI synthesis of Title Search Reports, Development Agreements, Municipal CC Approvals, and City Civil Court litigation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLegalDocModal(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Formal APF Legal DD Report</span>
          </button>
          <button
            onClick={() => setCurrentScreen('19')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Technical AI Workspace (Screen 19) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Legal Items List */}
      <div className="space-y-4">
        {legalClauses.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    item.severity === 'Medium'
                      ? 'bg-[#fef7e0] text-[#b06000]'
                      : 'bg-[#e8f1f5] text-[#19638c]'
                  }`}
                >
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">{item.title}</h3>
                  <span className="text-xs text-[#627d98]">Opinion Counsel: {item.counsel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    item.severity === 'Medium'
                      ? 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30'
                      : 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/30'
                  }`}
                >
                  {item.status}
                </span>
                <button
                  onClick={() =>
                    setActiveEvidence({
                      sourceType: 'Title Search Report',
                      sourceId: `LEGAL-${idx + 1}`,
                      documentTitle: `${item.title.split(':')[0]}.pdf`,
                      pageOrSection: 'Page 4, Legal Opinion Paragraph 12',
                      asOfDate: '2026-08-15',
                      extractedField: item.status,
                      snippet: item.finding,
                      confidenceScore: 0.98,
                    })
                  }
                  className="px-3 py-1 bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#19638c] text-xs font-semibold rounded-md border border-[#cbd5e1] transition-colors"
                >
                  View Evidence
                </button>
              </div>
            </div>

            <p className="text-xs text-[#334e68] leading-relaxed">{item.finding}</p>
          </div>
        ))}
      </div>

      {showLegalDocModal && (
        <LegalReportDocModal
          isOpen={showLegalDocModal}
          onClose={() => setShowLegalDocModal(false)}
          report={legalStore.getOrCreateReport('APF-2026-0001')}
        />
      )}
    </div>
  );
};
