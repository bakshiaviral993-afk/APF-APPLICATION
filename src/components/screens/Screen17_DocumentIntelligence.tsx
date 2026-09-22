import React from 'react';
import { useAPF } from '../../context/APFContext';
import { FileSearch, Upload, FileText, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { DEMO_DOCUMENTS, DemoDocument } from '../../data/mockData';

export const Screen17_DocumentIntelligence: React.FC = () => {
  const { setCurrentScreen, setActiveEvidence } = useAPF();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Document Intelligence & OCR Hub</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI OCR EXTRACTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated entity resolution and clause extraction across Title Deeds, RERA certificates, Site Engineer Reports & ROC Filings.
          </p>
        </div>

        <button
          onClick={() => setCurrentScreen('18')}
          className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          Open Legal AI Workspace (Screen 18)
        </button>
      </div>

      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Ingested Document Repository</h3>
          <span className="text-xs text-slate-400">{DEMO_DOCUMENTS.length} Documents Processed</span>
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
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {DEMO_DOCUMENTS.map((doc: DemoDocument) => (
                <tr key={doc.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{doc.title}</span>
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
                    <button
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
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium transition-colors"
                    >
                      Inspect OCR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
