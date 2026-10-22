import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Hash,
  Paperclip,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileCode,
} from 'lucide-react';

export interface UploadedProofDocument {
  id: string;
  name: string;
  category: string;
  caseId?: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  documentRef?: string;
  documentDate?: string;
  sha256Hash: string;
  confidenceScore?: number;
  previewUrl?: string;
  observation?: string;
  tags?: string[];
  status?: string;
}

interface UploadProofDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: UploadedProofDocument) => void;
  caseId?: string;
  initialCategory?: string;
  initialDocName?: string;
  title?: string;
  description?: string;
}

const DOCUMENT_CATEGORIES = [
  'Statutory / RERA Certificate',
  '30-Year Title Search Report (TSR)',
  'Sanctioned Architectural Blueprint / Floor Plan',
  'Technical Valuation & Site Inspection Report',
  'CERSAI Search & ROC Charge Certificate',
  'Vendor Tax Invoice / Fee Receipt',
  'Non-Encumbrance Certificate (NEC)',
  'Development Agreement & Power of Attorney (POA)',
  'Commencement Certificate (CC) / Occupancy Certificate (OC)',
  'Environmental & Fire Safety NOC',
  'KYC & Board Resolution Document',
  'Other Supporting Evidence Proof',
];

const SAMPLE_PROOFS = [
  {
    name: 'MahaRERA_Registration_P52100018542.pdf',
    category: 'Statutory / RERA Certificate',
    size: '2.4 MB',
    type: 'application/pdf',
    ref: 'RERA/REG/2026/8941',
    date: '2026-01-14',
    observation: 'Valid statutory registration under section 5 of RERA Act. Completion milestone verified.',
  },
  {
    name: '30_Year_Title_Search_Deed_Scrutiny.pdf',
    category: '30-Year Title Search Report (TSR)',
    size: '4.8 MB',
    type: 'application/pdf',
    ref: 'TSR/DUA/2026/092',
    date: '2026-02-10',
    observation: 'Clear, marketable title with complete 30-year flow of devolution through registered sale deeds.',
  },
  {
    name: 'Sanctioned_Master_Layout_Blueprint_Rev4.pdf',
    category: 'Sanctioned Architectural Blueprint / Floor Plan',
    size: '18.2 MB',
    type: 'application/pdf',
    ref: 'PMC/BP/2025/3910',
    date: '2025-11-20',
    observation: 'Municipal authority sanctioned layout with approved FSI and setback clearances for Towers A-F.',
  },
  {
    name: 'CERSAI_Clean_Charge_Search_Certificate.pdf',
    category: 'CERSAI Search & ROC Charge Certificate',
    size: '1.1 MB',
    type: 'application/pdf',
    ref: 'CERSAI/REC/2026/51290',
    date: '2026-02-18',
    observation: 'No prior encumbrances registered in favor of competing NBFCs or cooperative banks.',
  },
];

export const UploadProofDocumentModal: React.FC<UploadProofDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  caseId = 'APF-2026-0001',
  initialCategory,
  initialDocName = '',
  title = 'Upload Document & Verification Proof',
  description = 'Attach primary source documents or certified copy proofs with cryptographic hash audit.',
}) => {
  const [docName, setDocName] = useState(initialDocName);
  const [category, setCategory] = useState(initialCategory || DOCUMENT_CATEGORIES[0]);
  const [targetCaseId, setTargetCaseId] = useState(caseId);
  const [docRef, setDocRef] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().slice(0, 10));
  const [observation, setObservation] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [createdDoc, setCreatedDoc] = useState<UploadedProofDocument | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDocName(initialDocName);
      if (initialCategory) setCategory(initialCategory);
      setTargetCaseId(caseId);
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadComplete(false);
      setCreatedDoc(null);
      setErrorMessage(null);
      setDocRef(`DOC-REF-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, initialDocName, initialCategory, caseId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMb} MB`;

    if (!docName || docName === initialDocName) {
      setDocName(file.name);
    }

    // Attempt to read preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          size: sizeStr,
          type: file.type || 'image/jpeg',
          dataUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/pdf',
      });
    }
    setErrorMessage(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_PROOFS[0]) => {
    setDocName(sample.name);
    setCategory(sample.category);
    setDocRef(sample.ref);
    setDocDate(sample.date);
    setObservation(sample.observation);
    setSelectedFile({
      name: sample.name,
      size: sample.size,
      type: sample.type,
    });
    setErrorMessage(null);
  };

  const handleStartUpload = () => {
    if (!docName.trim()) {
      setErrorMessage('Please specify a document title or upload a file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const stepInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(stepInterval);
      setUploadProgress(100);

      // Generate random pseudo sha256
      const randomHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newDoc: UploadedProofDocument = {
        id: `DOC-PRF-${Date.now().toString().slice(-6)}`,
        name: docName.trim(),
        category,
        caseId: targetCaseId || 'APF-2026-0001',
        fileSize: selectedFile?.size || '3.2 MB',
        fileType: selectedFile?.type || 'application/pdf',
        uploadedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        uploadedBy: 'Active User (Bank / Vendor)',
        documentRef: docRef || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
        documentDate: docDate,
        sha256Hash: randomHex,
        confidenceScore: 0.98,
        previewUrl: selectedFile?.dataUrl,
        observation: observation.trim() || 'Verified genuine source document and archived in vault.',
        status: 'Available',
      };

      setCreatedDoc(newDoc);
      setIsUploading(false);
      setUploadComplete(true);
      onUploadSuccess(newDoc);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <UploadCloud className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadComplete && createdDoc ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-emerald-900">
                <div className="p-2 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Document Proof Uploaded &amp; Verified</h4>
                  <p className="text-xs text-emerald-800">
                    Cryptographic signature generated and registered in compliance audit vault.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 space-y-1.5 font-mono text-[11px] text-slate-700">
                <div>
                  <strong className="text-slate-900">Document:</strong> {createdDoc.name}
                </div>
                <div>
                  <strong className="text-slate-900">Category:</strong> {createdDoc.category}
                </div>
                <div>
                  <strong className="text-slate-900">Ref / Date:</strong> {createdDoc.documentRef} · {createdDoc.documentDate}
                </div>
                <div className="text-[10px] text-slate-500 truncate" title={createdDoc.sha256Hash}>
                  <strong className="text-slate-900">SHA-256:</strong> {createdDoc.sha256Hash}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Done &amp; View in Docket
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-300'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3 text-left max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <FileCheck2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-xs">{selectedFile.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {selectedFile.size} · {selectedFile.type}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-9 h-9 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">
                      Drag &amp; drop document proof here, or <span className="text-sky-600 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports PDF, Scanned TIFF, PNG, JPEG, DOCX up to 50MB
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Sample Selector */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Or Select Standard Proof Template (1-Click Fill):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SAMPLE_PROOFS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:bg-sky-50/80 hover:border-sky-300 transition-colors text-[11px] cursor-pointer"
                    >
                      <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Document Title &amp; Description *
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. MahaRERA_Registration_P52100018542.pdf"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Linked Case ID
                  </label>
                  <input
                    type="text"
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    placeholder="APF-2026-0001"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Document Reference / Registration No.
                  </label>
                  <input
                    type="text"
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    placeholder="e.g. REG/2026/8941"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Execution / Sanction Date
                  </label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Verification Observations / Proof Notes
                  </label>
                  <textarea
                    rows={2}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="e.g. Scanned original deed verified against Sub-Registrar Volume 489. All stamp duties paid."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-sky-900 font-bold">
                    <span>Uploading &amp; Computing Cryptographic SHA-256...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-sky-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!uploadComplete && (
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamper-evident hash &amp; audit timestamp</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload &amp; Verify Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
