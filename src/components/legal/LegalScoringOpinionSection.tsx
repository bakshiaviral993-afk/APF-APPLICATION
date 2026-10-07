import React from 'react';
import {
  LegalDueDiligenceReport,
  LegalOpinionType,
  LegalRiskBand,
} from '../../types/legalDueDiligence';
import { UserAccount } from '../../types/apfTransaction';
import { ShieldCheck, Award, Lock, CheckCircle2, FileCheck2, Scale } from 'lucide-react';
import { computeLegalScore } from '../../data/legalMasterData';

interface LegalScoringOpinionSectionProps {
  report: LegalDueDiligenceReport;
  currentUser: UserAccount;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onOpenSignModal: () => void;
}

export const LegalScoringOpinionSection: React.FC<LegalScoringOpinionSectionProps> = ({
  report,
  currentUser,
  isLocked,
  isEditing,
  onUpdate,
  onOpenSignModal,
}) => {
  const isInteractive = !isLocked && isEditing;
  const isLegalReviewerOrAdmin =
    currentUser.role === 'CPA' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'COM' ||
    currentUser.role === 'APPROVER';

  const handleScoreSliderChange = (key: keyof typeof report.legalScore, value: number) => {
    const updated = { ...report };
    const scoreObj = { ...updated.legalScore, [key]: Number(value) };
    const recalculated = computeLegalScore(scoreObj);
    updated.legalScore = recalculated;
    onUpdate(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
            12-14
          </span>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Component Scoring, Formal Opinion & Reviewer Sign-off
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Calculated Final Score:</span>
          <span className="text-sm font-mono font-black text-sky-900 bg-sky-100/80 px-2.5 py-0.5 rounded-lg border border-sky-300">
            {report.legalScore?.finalLegalScore || 0} / 100
          </span>
        </div>
      </div>

      <div className="p-2.5 sm:p-3 grid grid-cols-1 lg:grid-cols-3 gap-2.5 text-xs items-stretch">
        {/* Column 1: Component Scoring Sliders */}
        <div className="space-y-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Component Scoring (0-100)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Weighted Risk Model</span>
            </div>

            <div className="space-y-1.5">
              {/* Ownership */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">Land Ownership (25%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.ownershipScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.ownershipScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('ownershipScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              {/* Title Chain */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">30-Yr Title Chain (25%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.titleChainScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.titleChainScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('titleChainScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              {/* Development Rights */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">Development Rights (20%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.developmentRightsScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.developmentRightsScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('developmentRightsScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              {/* Encumbrance */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">Encumbrance & Mortgages (15%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.encumbranceScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.encumbranceScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('encumbranceScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              {/* Litigation */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">Litigation & Court Searches (10%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.litigationScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.litigationScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('litigationScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              {/* Approval Consistency */}
              <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold text-slate-700">RERA & Approval Consistency (5%)</span>
                  <strong className="font-mono font-bold text-sky-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-xs">
                    {report.legalScore?.approvalConsistencyScore || 0}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report.legalScore?.approvalConsistencyScore || 0}
                  disabled={isLocked}
                  onChange={(e) => handleScoreSliderChange('approvalConsistencyScore', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>
            </div>
          </div>

          <div className="p-2 bg-sky-50 rounded-lg border border-sky-200 text-[10px] text-sky-950 font-medium">
            Score changes dynamically recalculate the weighted legal score and update the underwriting opinion band.
          </div>
        </div>

        {/* Column 2: Formal Underwriting Opinion */}
        <div className="space-y-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Formal Underwriting Opinion
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {report.legalOpinion?.opinion || 'Clear'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Opinion Select */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Counsel Legal Opinion:
                </label>
                {isInteractive ? (
                  <select
                    value={report.legalOpinion?.opinion}
                    onChange={(e) => {
                      const updated = { ...report };
                      updated.legalOpinion.opinion = e.target.value as LegalOpinionType;
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Clear">Clear (Unconditional APF Approval)</option>
                    <option value="Conditional Clear">Conditional Clear (Subject to NOC/Covenants)</option>
                    <option value="Rejected">Rejected (Defective Title / Pre-emptory Injunction)</option>
                    <option value="Refer / Escalate">Refer / Escalate (Higher Authority Scrutiny)</option>
                  </select>
                ) : (
                  <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs">
                    {report.legalOpinion?.opinion}
                  </div>
                )}
              </div>

              {/* Risk Band Select */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Legal Risk Band:
                </label>
                {isInteractive ? (
                  <select
                    value={report.legalOpinion?.riskBand}
                    onChange={(e) => {
                      const updated = { ...report };
                      updated.legalOpinion.riskBand = e.target.value as LegalRiskBand;
                      onUpdate(updated);
                    }}
                    className="w-full h-8 px-2.5 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Risk</option>
                  </select>
                ) : (
                  <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs">
                    {report.legalOpinion?.riskBand} Risk
                  </div>
                )}
              </div>

              {/* Counsel Observations */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Counsel Scrutiny Observations:
                </label>
                {isInteractive ? (
                  <textarea
                    rows={3}
                    value={report.legalOpinion?.observations || ''}
                    onChange={(e) => {
                      const updated = { ...report };
                      updated.legalOpinion.observations = e.target.value;
                      onUpdate(updated);
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                  />
                ) : (
                  <p className="text-slate-800 leading-relaxed italic bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    {report.legalOpinion?.observations}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-100 rounded-lg text-[10px] text-slate-600">
            Opinion binds underwriter approvals and feeds directly into the decision workflow payload.
          </div>
        </div>

        {/* Column 3: Reviewer Declaration & Sign-off */}
        <div className="space-y-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Reviewer Declaration & Sign-off
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {report.isLocked ? 'Signed & Sealed' : 'Draft Mode'}
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Checkbox 1 */}
              <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={report.declaration?.documentsReviewedConfirmed ?? true}
                  disabled={isLocked}
                  onChange={(e) => {
                    const updated = { ...report };
                    updated.declaration.documentsReviewedConfirmed = e.target.checked;
                    onUpdate(updated);
                  }}
                  className="mt-0.5 text-sky-600 rounded w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  All 12 statutory document categories were examined to the full extent of available public records.
                </span>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={report.declaration?.opinionBasedOnAvailableRecordsConfirmed ?? true}
                  disabled={isLocked}
                  onChange={(e) => {
                    const updated = { ...report };
                    updated.declaration.opinionBasedOnAvailableRecordsConfirmed = e.target.checked;
                    onUpdate(updated);
                  }}
                  className="mt-0.5 text-sky-600 rounded w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  Legal opinion is certified based on certified mutation entries, Sub-Registrar search, and revenue records.
                </span>
              </label>

              {/* Digital Seal Details */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Digital Certifier:</span>
                  <strong className="text-slate-900 font-bold">
                    {report.declaration?.reviewerName || report.reviewerName}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Digital Seal Status:</span>
                  {report.isLocked ? (
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SHA-256 VERIFIED</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">Pending Execution</span>
                  )}
                </div>
                {report.reportHash && (
                  <div className="pt-1 border-t border-slate-100 font-mono text-[10px] text-slate-500 truncate" title={report.reportHash}>
                    Hash: {report.reportHash}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            {!isLocked && isLegalReviewerOrAdmin ? (
              <button
                type="button"
                onClick={onOpenSignModal}
                className="w-full h-8.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Execute Digital Signature & Lock Docket</span>
              </button>
            ) : isLocked ? (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Digitally Sealed & Immutable</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
