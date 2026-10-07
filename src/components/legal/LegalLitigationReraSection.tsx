import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import { Plus, Trash2, Gavel, CheckCircle2, ShieldCheck } from 'lucide-react';
import { legalStore } from '../../services/legalStore';

interface LegalLitigationReraSectionProps {
  report: LegalDueDiligenceReport;
  caseId: string;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onOpenAddLitModal: () => void;
}

export const LegalLitigationReraSection: React.FC<LegalLitigationReraSectionProps> = ({
  report,
  caseId,
  isLocked,
  isEditing,
  onUpdate,
  onOpenAddLitModal,
}) => {
  const isInteractive = !isLocked && isEditing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch">
      {/* Section 8: Litigation & Court Searches */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                8
              </span>
              <span>Litigation Searches & Court Record Check</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                {report.litigations?.length || 0} Records ({report.litigationPresent})
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={onOpenAddLitModal}
                  className="h-7 px-2.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lawsuit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            {report.litigations && report.litigations.length > 0 ? (
              <div className="space-y-2">
                {report.litigations.map((lit) => (
                  <div
                    key={lit.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs">{lit.caseNumber}</span>
                        <span className="text-[10px] font-medium text-slate-500">({lit.court})</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                          {lit.caseType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Parties: <strong className="text-slate-800">{lit.parties}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Subject: {lit.subject} · Impact: <strong className="text-slate-700">{lit.projectImpact}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-blue-900 bg-blue-50 border border-blue-200">
                        {lit.currentStatus}
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => legalStore.deleteLitigation(caseId, lit.id)}
                          title="Remove litigation entry"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No adverse pending civil suits, writ petitions, or stay orders on record.</span>
              </div>
            )}
          </div>
        </div>

        {/* Litigation Summary Narrative */}
        <div className="p-2.5 sm:p-3 pt-0">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            Litigation Search Summary Narrative:
          </label>
          {isInteractive ? (
            <textarea
              rows={2}
              value={report.litigationSummary || ''}
              onChange={(e) => onUpdate({ ...report, litigationSummary: e.target.value })}
              className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          ) : (
            <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
              {report.litigationSummary}
            </p>
          )}
        </div>
      </div>

      {/* Section 9: RERA & Statutory Approval Checks */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                9
              </span>
              <span>RERA & Statutory Approval Checks</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              {report.reraApprovalConsistency?.reraLegalStatus || 'Active & Compliant'}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            {/* 6-Field Matching Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-200/90">
              {/* Promoter Match */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Promoter Name Match:
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.promoterNameMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.promoterNameMatch = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Consistent)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.promoterNameMatch}
                  </div>
                )}
              </div>

              {/* Project Name Match */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Project Name Match:
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.projectNameMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.projectNameMatch = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Consistent)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.projectNameMatch}
                  </div>
                )}
              </div>

              {/* Land Details Match */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Land Details Match:
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.landDetailsMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.landDetailsMatch = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Consistent)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.landDetailsMatch}
                  </div>
                )}
              </div>

              {/* Phase / Tower Scope Match */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Scope Match (Phase/Tower):
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.phaseTowerScopeMatch || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.phaseTowerScopeMatch = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Sanctioned Scope)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.phaseTowerScopeMatch}
                  </div>
                )}
              </div>

              {/* Sanctioned Plan Consistent */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Sanctioned Plan Consistency:
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.sanctionedPlanConsistent || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.sanctionedPlanConsistent = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Fully Sanctioned)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial Sanction</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.sanctionedPlanConsistent}
                  </div>
                )}
              </div>

              {/* CC / OC Scope */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  CC / OC Consistency:
                </label>
                {isInteractive ? (
                  <select
                    value={report.reraApprovalConsistency?.ccOcScopeConsistent || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.reraApprovalConsistency) {
                        updated.reraApprovalConsistency.ccOcScopeConsistent = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Consistent with Plinth)</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.reraApprovalConsistency?.ccOcScopeConsistent}
                  </div>
                )}
              </div>
            </div>

            {/* RERA Observations */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                RERA Compliance Scrutiny Observations:
              </label>
              {isInteractive ? (
                <textarea
                  rows={2}
                  value={report.reraApprovalConsistency?.observations || ''}
                  onChange={(e) => {
                    const updated = { ...report };
                    if (updated.reraApprovalConsistency) {
                      updated.reraApprovalConsistency.observations = e.target.value;
                    }
                    onUpdate(updated);
                  }}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                  {report.reraApprovalConsistency?.observations}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
