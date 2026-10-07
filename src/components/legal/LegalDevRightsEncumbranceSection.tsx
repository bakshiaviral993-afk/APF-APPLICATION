import React from 'react';
import {
  LegalDueDiligenceReport,
  DevelopmentRightsStatusType,
  PoaStatusType,
  RightStatusType,
  LandownerConsentType,
} from '../../types/legalDueDiligence';
import { Plus, Trash2, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { legalStore } from '../../services/legalStore';

interface LegalDevRightsEncumbranceSectionProps {
  report: LegalDueDiligenceReport;
  caseId: string;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onOpenAddEncModal: () => void;
}

export const LegalDevRightsEncumbranceSection: React.FC<LegalDevRightsEncumbranceSectionProps> = ({
  report,
  caseId,
  isLocked,
  isEditing,
  onUpdate,
  onOpenAddEncModal,
}) => {
  const isInteractive = !isLocked && isEditing;

  const totalChargeCr =
    report.encumbrances?.reduce((sum, item) => sum + (Number(item.chargeAmountCr) || 0), 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch">
      {/* Section 6: Development Rights */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                6
              </span>
              <span>Development Rights Checklist</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {report.developmentRights?.developmentRightsStatus || 'Clear & Irrevocable'}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-200/90">
              {/* Development Agreement */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Development Agreement:
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.daAvailable || 'Yes'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.daAvailable = e.target.value as any;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Yes">Yes (Registered DA)</option>
                    <option value="No">No</option>
                    <option value="Conditional">Conditional</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs">
                    {report.developmentRights?.daAvailable}
                  </div>
                )}
              </div>

              {/* POA Status */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Power of Attorney (POA):
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.poaStatus || 'Valid'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.poaStatus = e.target.value as PoaStatusType;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Valid">Valid & Irrevocable</option>
                    <option value="Revoked">Revoked</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Expired">Expired</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.developmentRights?.poaStatus}
                  </div>
                )}
              </div>

              {/* Right to Construct */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Right to Construct:
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.rightToConstruct || 'Clearly Granted'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.rightToConstruct = e.target.value as RightStatusType;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Clearly Granted">Clearly Granted</option>
                    <option value="Subject to Condition">Subject to Condition</option>
                    <option value="Not Granted">Not Granted</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.developmentRights?.rightToConstruct}
                  </div>
                )}
              </div>

              {/* Right to Market */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Right to Market:
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.rightToMarket || 'Clearly Granted'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.rightToMarket = e.target.value as RightStatusType;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Clearly Granted">Clearly Granted</option>
                    <option value="Subject to Condition">Subject to Condition</option>
                    <option value="Not Granted">Not Granted</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.developmentRights?.rightToMarket}
                  </div>
                )}
              </div>

              {/* Right to Sell Units */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Right to Sell Units:
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.rightToSellUnits || 'Clearly Granted'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.rightToSellUnits = e.target.value as RightStatusType;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Clearly Granted">Clearly Granted</option>
                    <option value="Subject to Condition">Subject to Condition</option>
                    <option value="Not Granted">Not Granted</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.developmentRights?.rightToSellUnits}
                  </div>
                )}
              </div>

              {/* Right to Consideration */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Right to Consideration:
                </label>
                {isInteractive ? (
                  <select
                    value={report.developmentRights?.rightToReceiveConsideration || 'Clearly Granted'}
                    onChange={(e) => {
                      const updated = { ...report };
                      if (updated.developmentRights) {
                        updated.developmentRights.rightToReceiveConsideration = e.target.value as RightStatusType;
                      }
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Clearly Granted">Clearly Granted</option>
                    <option value="Subject to Condition">Subject to Condition</option>
                    <option value="Not Granted">Not Granted</option>
                  </select>
                ) : (
                  <div className="h-8 px-2 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-emerald-800 text-xs">
                    {report.developmentRights?.rightToReceiveConsideration}
                  </div>
                )}
              </div>
            </div>

            {/* Dev Rights Summary */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Development Rights Legal Scrutiny Summary:
              </label>
              {isInteractive ? (
                <textarea
                  rows={2}
                  value={report.developmentRights?.summary || ''}
                  onChange={(e) => {
                    const updated = { ...report };
                    if (updated.developmentRights) {
                      updated.developmentRights.summary = e.target.value;
                    }
                    onUpdate(updated);
                  }}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                  {report.developmentRights?.summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Encumbrance & Mortgages */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                7
              </span>
              <span>Encumbrance & Mortgage Charges</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {report.encumbrances?.length || 0} Charges (₹{totalChargeCr.toFixed(1)} Cr)
              </span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={onOpenAddEncModal}
                  className="h-7 px-2.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Charge</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 space-y-2 text-xs">
            {report.encumbrances && report.encumbrances.length > 0 ? (
              <div className="space-y-2">
                {report.encumbrances.map((enc) => (
                  <div
                    key={enc.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{enc.chargeHolder}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                          {enc.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Charge Amount: <strong className="text-slate-900 font-mono font-bold">₹{enc.chargeAmountCr} Cr</strong> · Release: <span className="font-semibold text-slate-800">{enc.releaseStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-800 bg-emerald-50 border border-emerald-200">
                        {enc.releaseStatus}
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => legalStore.deleteEncumbrance(caseId, enc.id)}
                          title="Remove charge"
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
                <span>Property is free from registered bank mortgages or attachment orders.</span>
              </div>
            )}
          </div>
        </div>

        {/* Banking Rule Banner at Card Bottom */}
        <div className="p-2.5 m-2.5 sm:m-3 mt-0 bg-amber-50/80 text-amber-950 text-[11px] rounded-xl border border-amber-200 font-medium flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Statutory Banking Rule:</strong> Registered charge indicates secured security interest. Retail disbursements require specific Lender NOC ceding prior charge on units.
          </span>
        </div>
      </div>
    </div>
  );
};
