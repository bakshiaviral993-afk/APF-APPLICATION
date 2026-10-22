import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import {
  FileSearch,
  Upload,
  UploadCloud,
  FileText,
  CheckCircle2,
  ChevronRight,
  Eye,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDocument } from '../../data/mockData';
import { UploadProofDocumentModal, UploadedProofDocument } from '../common/UploadProofDocumentModal';

export const Screen17_DocumentIntelligence: React.FC = () => {
  const { setCurrentScreen, setActiveEvidence, addAuditLog } = useAPF();
  const [documents, setDocuments] = useState<SampleDocument[]>(SAMPLE_DOCUMENTS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadContextDoc, setUploadContextDoc] = useState<SampleDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUploadSuccess = (newDoc: UploadedProofDocument) => {
    let cat: SampleDocument['category'] = 'Title Search Report';
    const lower = newDoc.category.toLowerCase();
    if (lower.includes('rera') || lower.includes('statutory')) {
      cat = 'RERA Public Registry';
    } else if (lower.includes('site') || lower.includes('valuation') || lower.includes('blueprint')) {
      cat = 'Site Inspection Report';
    } else if (lower.includes('cersai') || lower.includes('charge') || lower.includes('mca')) {
      cat = 'MCA Charge Filing';
    } else if (lower.includes('financial') || lower.includes('invoice')) {
      cat = 'Audited Financial Statement';
    } else if (lower.includes('crilc') || lower.includes('bureau')) {
      cat = 'Credit Bureau / CRILC';
    } else if (lower.includes('declaration') || lower.includes('kyc')) {
      cat = 'Borrower Declaration';
    }

    const newSampleDoc: SampleDocument = {
      id: newDoc.id,
      title: newDoc.name,
      category: cat,
      pages: Math.floor(Math.random() * 8) + 1,
      uploadedAt: newDoc.uploadedAt,
      confidence: newDoc.confidenceScore || 0.98,
      extractedFields: {
        'Doc Ref': newDoc.documentRef || 'REF-VERIFIED',
        'Execution Date': newDoc.documentDate || '2026-02-15',
        'Verification Hash': newDoc.sha256Hash.substring(0, 16) + '...',
        'Scrutiny Note': newDoc.observation || 'Verified primary record with clear audit trail.',
      },
    };

    setDocuments((prev) => [newSampleDoc, ...prev]);
    addAuditLog('DOC_PROOF_UPLOAD', newDoc.id, `Uploaded verified proof: ${newDoc.name} (${newDoc.category})`);
    showToast(`Proof document "${newDoc.name}" ingested with 98% OCR confidence score.`);
    setUploadContextDoc(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-in fade-in duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Document Intelligence &amp; OCR Hub</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI OCR EXTRACTION &amp; PROOF VERIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated entity resolution, proof upload verification and clause extraction across Title Deeds, RERA certificates, Site Engineer Reports &amp; ROC Filings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setUploadContextDoc(null);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Upload Document Proof</span>
          </button>

          <button
            onClick={() => setCurrentScreen('18')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Open Legal AI Workspace (Screen 18)
          </button>
        </div>
      </div>

      {/* Quick Intake Banner / Dropzone */}
      <div
        onClick={() => {
          setUploadContextDoc(null);
          setIsUploadModalOpen(true);
        }}
        className="p-4 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Upload New Primary Source or Certified Proof Document</h4>
            <p className="text-[11px] text-slate-400">
              Drag and drop any deed, layout plan, RERA certificate, or inspection proof for optical character parsing &amp; tamper-proof audit hashing.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 cursor-pointer"
        >
          Browse Files
        </button>
      </div>

      {/* Ingested Document Repository */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Ingested Document Repository</h3>
          <span className="text-xs text-slate-400">{documents.length} Documents Processed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Document Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Pages</th>
                <th className="py-2.5 px-3">Ingested At</th>
                <th className="py-2.5 px-3">OCR Confidence</th>
                <th className="py-2.5 px-3">Extracted Metadata</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {documents.map((doc: SampleDocument) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{doc.category}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{doc.pages}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{doc.uploadedAt}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                    {Math.round(doc.confidence * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                    {Object.entries(doc.extractedFields)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadContextDoc(doc);
                          setIsUploadModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="Upload revised proof document"
                      >
                        <UploadCloud className="w-3 h-3 text-sky-400" />
                        <span>Upload Proof</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveEvidence({
                            sourceType: doc.category,
                            sourceId: doc.id,
                            documentTitle: doc.title,
                            pageOrSection: 'Page 1-4 Extract',
                            asOfDate: doc.uploadedAt,
                            extractedField: JSON.stringify(doc.extractedFields),
                            snippet: `Document verification for ${doc.title} under ${doc.category}. Extracted details: ${JSON.stringify(
                              doc.extractedFields
                            )}`,
                            confidenceScore: doc.confidence,
                          })
                        }
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Inspect OCR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Proof Document Modal */}
      <UploadProofDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        initialDocName={uploadContextDoc ? `Proof_Update_${uploadContextDoc.title}` : ''}
        initialCategory={uploadContextDoc?.category || 'Statutory / RERA Certificate'}
        title={uploadContextDoc ? `Upload Proof for ${uploadContextDoc.title}` : 'Upload Document Proof for AI OCR Analysis'}
        description="Ingest primary deed, blueprint, or statutory clearance proofs with bounding coordinate resolution."
      />
    </div>
  );
};
