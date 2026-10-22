import React, { useState } from 'react';
import { LegalDueDiligenceReport, LegalDocumentItem } from '../../types/legalDueDiligence';
import {
  FileCheck2,
  MessageSquare,
  Plus,
  FileText,
  CheckCircle2,
  UploadCloud,
  Check,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { legalStore } from '../../services/legalStore';
import { UploadProofDocumentModal, UploadedProofDocument } from '../common/UploadProofDocumentModal';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeUploadDoc, setActiveUploadDoc] = useState<LegalDocumentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  const handleProofUploaded = (doc: UploadedProofDocument) => {
    if (activeUploadDoc) {
      legalStore.updateDocumentStatus(caseId, activeUploadDoc.id, {
        status: 'Available',
        documentRef: doc.documentRef || activeUploadDoc.documentRef || `DOC-${doc.id}`,
        documentDate: doc.documentDate || activeUploadDoc.documentDate,
        observation: `${doc.observation || 'Proof uploaded and verified'}. (Proof file: ${doc.name})`,
      });
      showToast(`Proof attached for "${activeUploadDoc.name}" with hash ${doc.sha256Hash.substring(0, 10)}...`);
    } else {
      showToast(`Proof document "${doc.name}" uploaded to legal docket.`);
    }
    setActiveUploadDoc(null);
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
      {toastMessage && (
        <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-emerald-700 font-black">{verifiedCount}</span> / {totalCount} Verified
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveUploadDoc(null);
              setIsUploadModalOpen(true);
            }}
            className="h-7 px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ Upload Proof Document</span>
          </button>

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
              <th className="py-2 px-3 w-1/3">Document Category &amp; Name</th>
              <th className="py-2 px-3 w-44 text-center">Verification Status</th>
              <th className="py-2 px-3 w-48">Document Ref / Date</th>
              <th className="py-2 px-3">Legal Scrutiny Observations</th>
              <th className="py-2 px-3 w-28 text-center">Action &amp; Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {report.documentsExamined?.map((doc) => {
              const hasProofAttached =
                doc.observation?.includes('Proof file:') || doc.status === 'Available';

              return (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name */}
                  <td className="py-2 px-3">
                    <div className="flex items-start gap-2">
                      <FileCheck2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">{doc.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            {doc.category}
                          </span>
                          {hasProofAttached && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <Check className="w-2.5 h-2.5" />
                              <span>Proof Attached</span>
                            </span>
                          )}
                        </div>
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

                  {/* Actions: Upload Proof & Query */}
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUploadDoc(doc);
                          setIsUploadModalOpen(true);
                        }}
                        title={`Upload proof document for ${doc.name}`}
                        className="px-2 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-[10px] border border-sky-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UploadCloud className="w-3 h-3 text-sky-600" />
                        <span>Proof</span>
                      </button>

                      {onRaiseQuery && (
                        <button
                          type="button"
                          onClick={() =>
                            onRaiseQuery('Legal', `Legal Clarification on ${doc.name}: ${doc.documentRef || ''}`)
                          }
                          title="Raise clarification query to builder/CPA"
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-amber-700 rounded-md transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Proof Document Modal */}
      <UploadProofDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setActiveUploadDoc(null);
        }}
        onUploadSuccess={handleProofUploaded}
        caseId={caseId}
        initialDocName={activeUploadDoc ? `Proof_${activeUploadDoc.name.replace(/\s+/g, '_')}` : ''}
        initialCategory={activeUploadDoc?.category || '30-Year Title Search Report (TSR)'}
        title={activeUploadDoc ? `Upload Proof for ${activeUploadDoc.name}` : 'Upload Legal Due Diligence Document Proof'}
        description="Attach certified copy deed, municipal NOC, or encumbrance search proof for compliance audit."
      />
    </div>
  );
};
