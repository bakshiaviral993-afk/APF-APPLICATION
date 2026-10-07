import React from 'react';
import { LegalDueDiligenceReport, LegalDocumentItem } from '../../types/legalDueDiligence';
import { FileCheck2, MessageSquare, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { legalStore } from '../../services/legalStore';

interface LegalDocumentsSectionProps {
  report: LegalDueDiligenceReport;
  caseId: string;
  isLocked: boolean;
  isEditing: boolean;
  onUpdate: (updated: LegalDueDiligenceReport) => void;
  onRaiseQuery?: (category: string, subject: string) => void;
  onOpenDocModal: () => void;
}

export const LegalDocumentsSection: React.FC<LegalDocumentsSectionProps> = ({
  report,
  caseId,
  isLocked,
  isEditing,
  onUpdate,
  onRaiseQuery,
  onOpenDocModal,
}) => {
  const verifiedCount =
    report.documentsExamined?.filter((d) => d.status === 'Available').length || 0;
  const totalCount = report.documentsExamined?.length || 12;

  const handleStatusChange = (docId: string, status: any) => {
    legalStore.updateDocumentStatus(caseId, docId, { status });
  };

  const handleRefChange = (docId: string, docRef: string) => {
    legalStore.updateDocumentStatus(caseId, docId, { documentRef: docRef });
  };

  const handleObservationChange = (docId: string, observation: string) => {
    legalStore.updateDocumentStatus(caseId, docId, { observation });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Clarification Required':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Expired':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Not Applicable':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
            3
          </span>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Documents Examined Checklist (12 Categories)
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.8 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-emerald-700 font-black">{verifiedCount}</span> / {totalCount} Verified
          </span>
          <button
            type="button"
            onClick={onOpenDocModal}
            className="h-7 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] rounded-lg border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-sky-700" />
            <span>Scrutiny Certificate</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="py-2 px-3 w-1/3">Document Category & Name</th>
              <th className="py-2 px-3 w-44 text-center">Verification Status</th>
              <th className="py-2 px-3 w-48">Document Ref / Date</th>
              <th className="py-2 px-3">Legal Scrutiny Observations</th>
              <th className="py-2 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {report.documentsExamined?.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Name */}
                <td className="py-2 px-3">
                  <div className="flex items-start gap-2">
                    <FileCheck2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 leading-snug">{doc.name}</div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {doc.category}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status Dropdown */}
                <td className="py-2 px-3 text-center">
                  <select
                    value={doc.status}
                    disabled={isLocked}
                    onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                    className={`h-7.5 text-[11px] font-bold px-2 rounded-lg border focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer ${getStatusBadgeStyle(
                      doc.status
                    )}`}
                  >
                    <option value="Available">Available (Verified)</option>
                    <option value="Missing">Missing (Deficient)</option>
                    <option value="Expired">Expired</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Clarification Required">Clarification Required</option>
                  </select>
                </td>

                {/* Ref & Date */}
                <td className="py-2 px-3">
                  {!isLocked && isEditing ? (
                    <input
                      type="text"
                      value={doc.documentRef || ''}
                      placeholder="Doc No. / Date"
                      onChange={(e) => handleRefChange(doc.id, e.target.value)}
                      className="w-full h-7.5 px-2 text-[11px] font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  ) : (
                    <div>
                      <div className="font-mono text-slate-800 text-[11px] font-medium truncate">
                        {doc.documentRef || '—'}
                      </div>
                      {doc.documentDate && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Date: {doc.documentDate}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Observation */}
                <td className="py-2 px-3">
                  {!isLocked && isEditing ? (
                    <input
                      type="text"
                      value={doc.observation || ''}
                      placeholder="Observation on execution, mutation, encumbrance"
                      onChange={(e) => handleObservationChange(doc.id, e.target.value)}
                      className="w-full h-7.5 px-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  ) : (
                    <div className="text-slate-700 text-xs leading-relaxed truncate" title={doc.observation || 'Verified on municipal & land records.'}>
                      {doc.observation || 'Verified on municipal & land records.'}
                    </div>
                  )}
                </td>

                {/* Query Action */}
                <td className="py-2 px-3 text-center">
                  {onRaiseQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        onRaiseQuery('Legal', `Legal Clarification on ${doc.name}: ${doc.documentRef || ''}`)
                      }
                      title="Raise clarification query to builder/CPA"
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-amber-700 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
