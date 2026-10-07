import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import { Plus, Trash2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { legalStore } from '../../services/legalStore';

interface LegalExceptionsConditionsSectionProps {
  report: LegalDueDiligenceReport;
  caseId: string;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onOpenAddExModal: () => void;
  onOpenAddCondModal: () => void;
}

export const LegalExceptionsConditionsSection: React.FC<LegalExceptionsConditionsSectionProps> = ({
  report,
  caseId,
  isLocked,
  isEditing,
  onUpdate,
  onOpenAddExModal,
  onOpenAddCondModal,
}) => {
  const isInteractive = !isLocked && isEditing;

  const handleExStatusChange = (exId: string, status: any) => {
    legalStore.updateException(caseId, exId, { status });
  };

  const handleCondStatusChange = (condId: string, status: any) => {
    legalStore.updateCondition(caseId, condId, { status });
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Medium':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch">
      {/* Section 10: Legal Exceptions & Deficiencies */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                10
              </span>
              <span>Legal Exceptions & Title Deficiencies</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {report.exceptions?.length || 0} Recorded
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={onOpenAddExModal}
                  className="h-7 px-2.5 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-bold border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Raise Exception</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            {report.exceptions && report.exceptions.length > 0 ? (
              <div className="space-y-2">
                {report.exceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{ex.id}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-bold">
                          {ex.category}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getSeverityStyle(ex.severity)}`}>
                          {ex.severity}
                        </span>
                        {ex.blocking && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white shadow-2xs">
                            BLOCKING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 font-medium">Owner: <strong>{ex.owner}</strong></span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => legalStore.deleteException(caseId, ex.id)}
                            title="Delete exception"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{ex.observation}</p>

                    <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="truncate">
                        Action: <strong className="text-slate-900">{ex.requiredAction}</strong>
                      </div>
                      {isInteractive ? (
                        <select
                          value={ex.status}
                          onChange={(e) => handleExStatusChange(ex.id, e.target.value)}
                          className="h-6.5 px-2 text-[10px] font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="In Clarification">In Clarification</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Waived">Waived</option>
                        </select>
                      ) : (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                          {ex.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No blocking exceptions or unresolved legal defects identified.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 11: Legal Conditions & Covenants */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                11
              </span>
              <span>Sanction Legal Conditions & Covenants</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-900 border border-sky-200">
                {report.conditions?.length || 0} Registered
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={onOpenAddCondModal}
                  className="h-7 px-2.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            {report.conditions && report.conditions.length > 0 ? (
              <div className="space-y-2">
                {report.conditions.map((cond) => (
                  <div
                    key={cond.id}
                    className="p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sky-900 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                          {cond.conditionType}
                        </span>
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                          {cond.mandatoryOrAdvisory}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600">Owner: <strong>{cond.owner}</strong></span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => legalStore.deleteCondition(caseId, cond.id)}
                            title="Remove condition"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                      {cond.conditionText}
                    </p>

                    <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div>
                        Due Stage: <strong className="text-slate-800">{cond.dueStage}</strong> ({cond.dueDate})
                      </div>
                      {isInteractive ? (
                        <select
                          value={cond.status}
                          onChange={(e) => handleCondStatusChange(cond.id, e.target.value)}
                          className="h-6.5 px-2 text-[10px] font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="Satisfied">Satisfied</option>
                          <option value="Waived">Waived</option>
                        </select>
                      ) : (
                        <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                          {cond.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-xs border border-slate-200">
                No specific pre-disbursement legal covenants required for this docket.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
