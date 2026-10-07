import React from 'react';
import { LegalDueDiligenceReport, LegalRoute, LegalRequestType } from '../../types/legalDueDiligence';

interface LegalAssignmentSectionProps {
  report: LegalDueDiligenceReport;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
}

export const LegalAssignmentSection: React.FC<LegalAssignmentSectionProps> = ({
  report,
  isLocked,
  isEditing,
  onUpdate,
}) => {
  const isInteractive = !isLocked && isEditing;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
            1-2
          </span>
          <span>Assignment & Builder Master Particulars</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Statutory Scrutiny
        </span>
      </div>

      <div className="p-2.5 sm:p-3 grid grid-cols-1 lg:grid-cols-2 gap-2.5 text-xs">
        {/* Card 1: Assignment Scope */}
        <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              1. Legal Review Assignment & Advocate Scope
            </span>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              Interactive
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Legal Route */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Legal Route:
              </label>
              {isInteractive ? (
                <select
                  value={report.legalRoute}
                  onChange={(e) => onUpdate({ ...report, legalRoute: e.target.value as LegalRoute })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="External Advocate">External Advocate</option>
                  <option value="Internal Legal">Internal Legal Cell</option>
                  <option value="Dual Legal Review">Dual Legal Review</option>
                </select>
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs">
                  {report.legalRoute}
                </div>
              )}
            </div>

            {/* Request Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Request Type:
              </label>
              {isInteractive ? (
                <select
                  value={report.requestType}
                  onChange={(e) => onUpdate({ ...report, requestType: e.target.value as LegalRequestType })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="New APF">New APF</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Legal Revalidation">Legal Revalidation</option>
                  <option value="Tower Addition">Tower Addition</option>
                  <option value="Phase Addition">Phase Addition</option>
                  <option value="Rework">Rework</option>
                </select>
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs">
                  {report.requestType}
                </div>
              )}
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Reviewer / Advocate:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.reviewerName}
                  onChange={(e) => onUpdate({ ...report, reviewerName: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs truncate">
                  {report.reviewerName}
                </div>
              )}
            </div>

            {/* Reviewer Firm */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Law Firm / Bureau:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.reviewerFirm}
                  onChange={(e) => onUpdate({ ...report, reviewerFirm: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs truncate">
                  {report.reviewerFirm}
                </div>
              )}
            </div>

            {/* Empanelment No */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Empanelment Number:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.empanelmentNo}
                  onChange={(e) => onUpdate({ ...report, empanelmentNo: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-mono font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-mono text-slate-900 text-xs">
                  {report.empanelmentNo}
                </div>
              )}
            </div>

            {/* SLA Due Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                SLA Scrutiny Due Date:
              </label>
              {isInteractive ? (
                <input
                  type="date"
                  value={report.slaDueDate?.split(' ')[0] || ''}
                  onChange={(e) => onUpdate({ ...report, slaDueDate: `${e.target.value} 18:00:00` })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-rose-700 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-mono font-bold text-rose-700 text-xs">
                  {report.slaDueDate}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Builder & Land Master Identifiers */}
        <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              2. Builder Legal Entity & Site Demarcation
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Verified Land
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Legal Entity */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Developer Legal Name:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.builderLegalName}
                  onChange={(e) => onUpdate({ ...report, builderLegalName: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs truncate">
                  {report.builderLegalName}
                </div>
              )}
            </div>

            {/* Builder Group */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Developer Group:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.builderGroup}
                  onChange={(e) => onUpdate({ ...report, builderGroup: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-bold text-slate-900 text-xs truncate">
                  {report.builderGroup}
                </div>
              )}
            </div>

            {/* Survey Plot Number */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Survey / Plot / Gat No:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.surveyPlotNumber}
                  onChange={(e) => onUpdate({ ...report, surveyPlotNumber: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-mono font-bold text-slate-900 text-xs truncate">
                  {report.surveyPlotNumber}
                </div>
              )}
            </div>

            {/* Land Area */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Sanctioned Land Area:
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.landArea}
                  onChange={(e) => onUpdate({ ...report, landArea: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-semibold text-slate-900 text-xs">
                  {report.landArea}
                </div>
              )}
            </div>

            {/* Identifiers (CIN / PAN) */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Corporate Identifiers (PAN / CIN / GSTIN):
              </label>
              {isInteractive ? (
                <input
                  type="text"
                  value={report.builderPanCinGstin}
                  onChange={(e) => onUpdate({ ...report, builderPanCinGstin: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-mono text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              ) : (
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg flex items-center font-mono text-slate-800 text-[11px] truncate">
                  {report.builderPanCinGstin}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
