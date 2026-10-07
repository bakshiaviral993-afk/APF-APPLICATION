import React from 'react';
import {
  LegalDueDiligenceReport,
  OwnershipNatureType,
  OwnershipVerifiedResult,
  MatchCheckResult,
  BoundaryMatchResult,
} from '../../types/legalDueDiligence';
import { Plus, Trash2, CheckCircle2, MapPin, Building2 } from 'lucide-react';
import { legalStore } from '../../services/legalStore';

interface LegalLandTitleSectionProps {
  report: LegalDueDiligenceReport;
  caseId: string;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onOpenAddTitleModal: () => void;
}

export const LegalLandTitleSection: React.FC<LegalLandTitleSectionProps> = ({
  report,
  caseId,
  isLocked,
  isEditing,
  onUpdate,
  onOpenAddTitleModal,
}) => {
  const isInteractive = !isLocked && isEditing;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
            4-5
          </span>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Land Particulars & 30-Year Chain of Title
          </h4>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {report.titleChainStatus} ({report.titleChainRows?.length || 0} Instruments)
          </span>
          {!isLocked && (
            <button
              type="button"
              onClick={onOpenAddTitleModal}
              className="h-7 px-2.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Deed</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-3 space-y-2.5">
        {/* Section 4: 4-Box Uniform Grid for Land Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {/* Box 1: Legal Owner */}
          <div className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between min-h-[88px]">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              1. Current Legal Owner:
            </label>
            {isInteractive ? (
              <input
                type="text"
                value={report.ownershipVerification?.currentLegalOwner || ''}
                onChange={(e) => {
                  const updated = { ...report };
                  if (updated.ownershipVerification) {
                    updated.ownershipVerification.currentLegalOwner = e.target.value;
                  }
                  onUpdate(updated);
                }}
                className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            ) : (
              <div className="text-xs font-bold text-slate-900 mt-auto leading-tight">
                {report.ownershipVerification?.currentLegalOwner}
              </div>
            )}
          </div>

          {/* Box 2: Ownership Nature & Verification */}
          <div className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between min-h-[88px]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                2. Ownership Nature:
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Verified: {report.landParticulars?.ownershipVerified}
              </span>
            </div>
            {isInteractive ? (
              <div className="grid grid-cols-2 gap-1.5 mt-auto">
                <select
                  value={report.landParticulars?.ownershipNature || 'Freehold'}
                  onChange={(e) => {
                    const updated = { ...report };
                    if (updated.landParticulars) {
                      updated.landParticulars.ownershipNature = e.target.value as OwnershipNatureType;
                    }
                    onUpdate(updated);
                  }}
                  className="h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                  <option value="Development Rights">Dev Rights</option>
                  <option value="Government Grant">Govt Grant</option>
                </select>

                <select
                  value={report.landParticulars?.ownershipVerified || 'Yes'}
                  onChange={(e) => {
                    const updated = { ...report };
                    if (updated.landParticulars) {
                      updated.landParticulars.ownershipVerified = e.target.value as OwnershipVerifiedResult;
                    }
                    onUpdate(updated);
                  }}
                  className="h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="Yes">Yes (Clear)</option>
                  <option value="No">No (Defect)</option>
                  <option value="Under Review">Review</option>
                </select>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-900 mt-auto">
                {report.landParticulars?.ownershipNature} (Verified: {report.landParticulars?.ownershipVerified})
              </div>
            )}
          </div>

          {/* Box 3: Survey & Area Match */}
          <div className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between min-h-[88px]">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              3. Survey & Area Match:
            </label>
            {isInteractive ? (
              <div className="grid grid-cols-2 gap-1.5 mt-auto">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Survey:</span>
                  <select
                    value={report.landParticulars?.surveyMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.landParticulars) {
                        updated.landParticulars.surveyMatch = e.target.value as MatchCheckResult;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-[11px] font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Area:</span>
                  <select
                    value={report.landParticulars?.areaMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.landParticulars) {
                        updated.landParticulars.areaMatch = e.target.value as MatchCheckResult;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-[11px] font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Survey: {report.landParticulars?.surveyMatch} · Area: {report.landParticulars?.areaMatch}</span>
              </div>
            )}
          </div>

          {/* Box 4: Boundary Match */}
          <div className="bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between min-h-[88px]">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              4. Boundary Demarcation Check:
            </label>
            {isInteractive ? (
              <select
                value={report.landParticulars?.boundaryMatch || 'Yes'}
                onChange={(e) => {
                  const updated = { ...report };
                  if (updated.landParticulars) {
                    updated.landParticulars.boundaryMatch = e.target.value as BoundaryMatchResult;
                  }
                  onUpdate(updated);
                }}
                className="w-full h-8 px-2.5 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden mt-auto"
              >
                <option value="Yes">Yes (Matches Sanctioned Plan)</option>
                <option value="No">No (Demarcation Discrepancy)</option>
                <option value="Partial">Partial Overlap</option>
              </select>
            ) : (
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Boundary: {report.landParticulars?.boundaryMatch}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Title Chain Table */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Chronological 30-Year Title Instruments ({report.titleChainRows?.length || 0})
            </span>
            <span className="text-[10px] text-slate-500">
              Verified from Sub-Registrar records & Mutation Entries
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-1.5 px-2 w-10 text-center">Seq</th>
                  <th className="py-1.5 px-2.5 w-36">Instrument Type</th>
                  <th className="py-1.5 px-2.5 w-28">Doc Date</th>
                  <th className="py-1.5 px-2.5">Transferor (Executant)</th>
                  <th className="py-1.5 px-2.5">Transferee (Beneficiary)</th>
                  <th className="py-1.5 px-2.5 w-40">Land Reference</th>
                  <th className="py-1.5 px-2.5 w-24 text-center">Status</th>
                  {!isLocked && <th className="py-1.5 px-2 w-8 text-center"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.titleChainRows?.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-1.5 px-2 text-center font-bold text-slate-500 font-mono">{row.seqNo}</td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-900">{row.instrumentType}</td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-700 text-[11px]">{row.documentDate}</td>
                    <td className="py-1.5 px-2.5 text-slate-800 font-medium truncate max-w-[180px]">{row.transferor}</td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-900 truncate max-w-[180px]">{row.transferee}</td>
                    <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-600">
                      {row.surveyRef} ({row.areaCovered})
                    </td>
                    <td className="py-1.5 px-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                    {!isLocked && (
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => legalStore.deleteTitleChainRow(caseId, row.id)}
                          title="Remove deed row"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Title Chain Narrative */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              Title Chain Legal Scrutiny Narrative:
            </span>
            {isInteractive ? (
              <textarea
                rows={2}
                value={report.titleChainSummary || ''}
                onChange={(e) => onUpdate({ ...report, titleChainSummary: e.target.value })}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed italic text-xs">
                {report.titleChainSummary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
