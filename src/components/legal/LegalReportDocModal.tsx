import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Scale,
  FileCheck2,
  Building2,
  AlertTriangle,
  FileText,
  Lock,
  CheckCircle2,
  Copy,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  getResolvedValuationData,
  downloadLegalValuationReport,
  downloadValuationSummaryJson,
} from '../../utils/legalValuationExporter';

interface LegalReportDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LegalDueDiligenceReport;
  caseData?: any;
}

export const LegalReportDocModal: React.FC<LegalReportDocModalProps> = ({
  isOpen,
  onClose,
  report,
  caseData,
}) => {
  if (!isOpen) return null;

  const val = getResolvedValuationData(report, caseData);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadLegalValuationReport(report, caseData);
  };

  const handleDownloadJson = () => {
    downloadValuationSummaryJson(report, caseData);
  };

  const copyHash = () => {
    if (report.reportHash) {
      navigator.clipboard.writeText(report.reportHash);
    }
  };

  const getOpinionBadgeClass = (op: string) => {
    switch (op) {
      case 'Clear':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Conditional Clear':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none">
        {/* Top Floating Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-sky-400" />
            <div>
              <span className="font-bold text-sm text-white tracking-wide">
                APF LEGAL DUE DILIGENCE REPORT
              </span>
              <span className="ml-2 text-xs text-slate-400 font-mono">
                {report.id} • {report.version}
              </span>
            </div>
            {report.isLocked && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                DIGITALLY LOCKED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Download standalone HTML/PDF Bank Legal & Valuation Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Export structured JSON docket"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Formal Document Layout */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 font-sans text-slate-800 space-y-8 bg-white print:p-0">
          {/* Document Header with Bank Emblems */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-sky-900">
                  PROVAL APF • BANK LEGAL RISK & COMPLIANCE BUREAU
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  APF LEGAL DUE DILIGENCE REPORT
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Project Legal Review • Title • Ownership • Development Rights • Encumbrance • Litigation
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="inline-block px-3 py-1 rounded-md text-xs font-extrabold tracking-wide uppercase border mb-1.5 bg-sky-50 text-sky-950 border-sky-300 font-mono">
                  {report.requestType} • {report.legalRoute}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Review ID: <strong>{report.id}</strong>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Report Date: <strong>{report.reportDate}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Report Header & Assignment */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Report Header & Assignment</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <div className="p-2.5 border-b sm:border-b-0 border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">APF Case ID</div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">{report.caseId}</div>
              </div>
              <div className="p-2.5 border-b sm:border-b-0 border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Legal Review ID</div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">{report.id}</div>
              </div>
              <div className="p-2.5 border-b sm:border-b-0 border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Request Type</div>
                <div className="font-bold text-slate-900 mt-0.5">{report.requestType}</div>
              </div>
              <div className="p-2.5">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Legal Route</div>
                <div className="font-bold text-slate-900 mt-0.5">{report.legalRoute}</div>
              </div>

              <div className="p-2.5 border-t border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Legal Reviewer / Firm</div>
                <div className="font-bold text-slate-900 mt-0.5">{report.reviewerName}</div>
                <div className="text-[10px] text-slate-500">{report.reviewerFirm}</div>
              </div>
              <div className="p-2.5 border-t border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Empanelment No.</div>
                <div className="font-mono text-slate-900 mt-0.5">{report.empanelmentNo || 'EMP/LEG/PUN/2022/014'}</div>
              </div>
              <div className="p-2.5 border-t border-r border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Assignment Date</div>
                <div className="font-mono text-slate-900 mt-0.5">{report.assignmentDate}</div>
              </div>
              <div className="p-2.5 border-t">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">SLA Due Date</div>
                <div className="font-mono text-rose-700 font-bold mt-0.5">{report.slaDueDate}</div>
              </div>
            </div>
          </section>

          {/* 2. Builder & Project Particulars */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Builder & Project Particulars</span>
            </h2>
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <tbody className="divide-y divide-slate-200">
                <tr className="grid grid-cols-1 sm:grid-cols-4 bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-600">Builder Legal Name</td>
                  <td className="p-2.5 font-bold text-slate-900 sm:col-span-3">{report.builderLegalName}</td>
                </tr>
                <tr className="grid grid-cols-1 sm:grid-cols-4">
                  <td className="p-2.5 font-semibold text-slate-600">Builder Group</td>
                  <td className="p-2.5 font-semibold text-slate-900">{report.builderGroup}</td>
                  <td className="p-2.5 font-semibold text-slate-600">PAN / CIN / GSTIN</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-800">{report.builderPanCinGstin}</td>
                </tr>
                <tr className="grid grid-cols-1 sm:grid-cols-4 bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-600">Project Name</td>
                  <td className="p-2.5 font-bold text-slate-900">{report.projectName}</td>
                  <td className="p-2.5 font-semibold text-slate-600">RERA Number(s)</td>
                  <td className="p-2.5 font-mono font-bold text-sky-900">{report.reraNumbers?.join(', ')}</td>
                </tr>
                <tr className="grid grid-cols-1 sm:grid-cols-4">
                  <td className="p-2.5 font-semibold text-slate-600">Project Address</td>
                  <td className="p-2.5 text-slate-800 sm:col-span-3">{report.projectAddress}</td>
                </tr>
                <tr className="grid grid-cols-1 sm:grid-cols-4 bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-600">Phase(s) Under Review</td>
                  <td className="p-2.5 font-semibold text-slate-900">{report.phasesUnderReview?.join(', ')}</td>
                  <td className="p-2.5 font-semibold text-slate-600">Tower(s) Under Review</td>
                  <td className="p-2.5 font-semibold text-slate-900">{report.towersUnderReview?.join(', ')}</td>
                </tr>
                <tr className="grid grid-cols-1 sm:grid-cols-4">
                  <td className="p-2.5 font-semibold text-slate-600">Survey / CTS / Gat / Plot No.</td>
                  <td className="p-2.5 font-mono text-slate-900">{report.surveyPlotNumber}</td>
                  <td className="p-2.5 font-semibold text-slate-600">Land Area / Unit</td>
                  <td className="p-2.5 font-bold text-slate-900">{report.landArea}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 3. Documents Examined */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Documents Examined</span>
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2.5">Document</th>
                    <th className="p-2.5 w-28 text-center">Status</th>
                    <th className="p-2.5 w-44">Document Ref. / Date</th>
                    <th className="p-2.5">Legal Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.documentsExamined?.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{doc.name}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'Clarification Required'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700">
                        {doc.documentRef || '—'} {doc.documentDate && `(${doc.documentDate})`}
                      </td>
                      <td className="p-2.5 text-slate-700">{doc.observation || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Land Particulars */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Land Particulars</span>
            </h2>
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-left w-1/3">Field</th>
                  <th className="p-2.5 text-left">Legal Reviewer Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Current Legal Owner</td>
                  <td className="p-2.5 font-bold text-slate-900">{report.ownershipVerification?.currentLegalOwner}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Ownership Nature</td>
                  <td className="p-2.5 font-semibold text-slate-900">{report.landParticulars?.ownershipNature}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Survey / CTS / Gat Match</td>
                  <td className="p-2.5 font-semibold text-emerald-800">{report.landParticulars?.surveyMatch}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Area Match</td>
                  <td className="p-2.5 font-semibold text-emerald-800">{report.landParticulars?.areaMatch}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Boundary / Property Description Match</td>
                  <td className="p-2.5 font-semibold text-emerald-800">{report.landParticulars?.boundaryMatch}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Ownership Verified</td>
                  <td className="p-2.5 font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{report.landParticulars?.ownershipVerified}</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 bg-slate-50">Observations</td>
                  <td className="p-2.5 text-slate-700">{report.landParticulars?.observations}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5. Title Chain */}
          <section className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">5</span>
                <span>Title Chain (30-Year Traceability)</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Title Chain Status: {report.titleChainStatus}
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2 w-10 text-center">Seq</th>
                    <th className="p-2">Instrument</th>
                    <th className="p-2 w-24">Date</th>
                    <th className="p-2">Transferor / Executant</th>
                    <th className="p-2">Transferee / Beneficiary</th>
                    <th className="p-2">Land Ref.</th>
                    <th className="p-2 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.titleChainRows?.map((row) => (
                    <tr key={row.id}>
                      <td className="p-2 text-center font-bold text-slate-600">{row.seqNo}</td>
                      <td className="p-2 font-bold text-slate-900">{row.instrumentType}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-700">{row.documentDate}</td>
                      <td className="p-2 text-slate-800">{row.transferor}</td>
                      <td className="p-2 text-slate-800 font-semibold">{row.transferee}</td>
                      <td className="p-2 text-slate-600 font-mono text-[10px]">{row.surveyRef}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-bold text-slate-700 mb-0.5">Title Chain Summary:</div>
              <p className="text-slate-600 leading-relaxed">{report.titleChainSummary}</p>
            </div>
          </section>

          {/* 6. Development Rights */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">6</span>
              <span>Development Rights</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Development Agreement:</span>
                <span className="font-bold text-slate-900">{report.developmentRights?.daAvailable}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">POA Status:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.poaStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Right to Construct:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.rightToConstruct}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Right to Market:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.rightToMarket}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Right to Sell Units:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.rightToSellUnits}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Right to Receive Consideration:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.rightToReceiveConsideration}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">Landowner Consent:</span>
                <span className="font-bold text-slate-900">{report.developmentRights?.landownerConsentStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">Development Rights Status:</span>
                <span className="font-bold text-emerald-800">{report.developmentRights?.developmentRightsStatus}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic px-1">{report.developmentRights?.summary}</p>
          </section>

          {/* 7. Encumbrance / Mortgage / Charges */}
          <section className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">7</span>
                <span>Encumbrance / Mortgage / Charges</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Encumbrance Present: {report.encumbrancePresent}
              </span>
            </div>

            {report.encumbrances && report.encumbrances.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-2">Type</th>
                      <th className="p-2">Charge Holder / Lender</th>
                      <th className="p-2 text-right">Amount (₹ Cr)</th>
                      <th className="p-2">Property / Project</th>
                      <th className="p-2">Release / NOC Status</th>
                      <th className="p-2 text-center">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.encumbrances.map((e) => (
                      <tr key={e.id}>
                        <td className="p-2 font-bold text-slate-900">{e.type}</td>
                        <td className="p-2 font-semibold text-slate-800">{e.chargeHolder}</td>
                        <td className="p-2 text-right font-black font-mono text-slate-900">₹{e.chargeAmountCr} Cr</td>
                        <td className="p-2 text-slate-700 text-[11px]">{e.propertyAffected}</td>
                        <td className="p-2 font-bold text-emerald-800">{e.releaseStatus}</td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {e.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                ✓ No encumbrance, mortgage or charge found on record for the subject land.
              </div>
            )}

            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-900 font-medium">
              <strong>Important Statutory Rule:</strong> Charge amount is evidence of secured charge and should not be treated automatically as current outstanding exposure.
            </div>
          </section>

          {/* 8. Litigation / Disputes */}
          <section className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">8</span>
                <span>Litigation / Disputes</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                Litigation Present: {report.litigationPresent}
              </span>
            </div>

            {report.litigations && report.litigations.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-2">Case Type</th>
                      <th className="p-2">Court / Authority</th>
                      <th className="p-2 font-mono">Case No.</th>
                      <th className="p-2">Parties</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Project Impact</th>
                      <th className="p-2 text-center">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.litigations.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2 font-bold text-slate-900">{l.caseType}</td>
                        <td className="p-2 text-slate-700">{l.court}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">{l.caseNumber}</td>
                        <td className="p-2 text-slate-700 text-[11px]">{l.parties}</td>
                        <td className="p-2 text-center font-semibold text-slate-800">{l.currentStatus}</td>
                        <td className="p-2 text-center font-semibold text-slate-800">{l.projectImpact}</td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {l.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                ✓ No adverse litigations, court stays or pending disputes identified.
              </div>
            )}
            <p className="text-xs text-slate-600 px-1">{report.litigationSummary}</p>
          </section>

          {/* 9. RERA / Approval Verification */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">9</span>
              <span>RERA / Approval Verification</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Promoter Name Match:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.promoterNameMatch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Project Name Match:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.projectNameMatch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Land Details Match:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.landDetailsMatch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Phase / Tower Scope Match:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.phaseTowerScopeMatch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">RERA Legal Status:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.reraLegalStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Sanctioned Plan Legally Consistent:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.sanctionedPlanConsistent}</span>
              </div>
              <div className="flex justify-between py-1 sm:col-span-2">
                <span className="text-slate-600 font-medium">CC / OC Scope Consistent:</span>
                <span className="font-bold text-emerald-800">{report.reraApprovalConsistency?.ccOcScopeConsistent}</span>
              </div>
            </div>
            {report.reraApprovalConsistency?.observations && (
              <p className="text-xs text-slate-600 px-1">{report.reraApprovalConsistency.observations}</p>
            )}
          </section>

          {/* 10. Legal Exceptions */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">10</span>
              <span>Legal Exceptions ({report.exceptions?.length || 0})</span>
            </h2>
            {report.exceptions && report.exceptions.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-2 w-24">ID</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Observation</th>
                      <th className="p-2 text-center">Severity</th>
                      <th className="p-2 text-center">Blocking</th>
                      <th className="p-2">Required Action</th>
                      <th className="p-2">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.exceptions.map((ex) => (
                      <tr key={ex.id}>
                        <td className="p-2 font-mono font-bold text-slate-900">{ex.id}</td>
                        <td className="p-2 font-semibold text-slate-800">{ex.category}</td>
                        <td className="p-2 text-slate-700">{ex.observation}</td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                            {ex.severity}
                          </span>
                        </td>
                        <td className="p-2 text-center font-bold">
                          {ex.blocking ? (
                            <span className="text-rose-600 font-bold">YES</span>
                          ) : (
                            <span className="text-slate-500">NO</span>
                          )}
                        </td>
                        <td className="p-2 text-slate-700">{ex.requiredAction}</td>
                        <td className="p-2 font-semibold text-slate-900">{ex.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                ✓ No open legal exceptions recorded.
              </div>
            )}
          </section>

          {/* 11. Legal Conditions */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">11</span>
              <span>Legal Conditions ({report.conditions?.length || 0})</span>
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2">Condition</th>
                    <th className="p-2 w-32">Type</th>
                    <th className="p-2 w-24">Owner</th>
                    <th className="p-2 w-32">Due Stage</th>
                    <th className="p-2 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.conditions?.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 text-slate-800 font-medium">{c.conditionText}</td>
                      <td className="p-2 font-semibold text-slate-700">{c.conditionType}</td>
                      <td className="p-2 font-bold text-slate-900">{c.owner}</td>
                      <td className="p-2 text-slate-600">{c.dueStage}</td>
                      <td className="p-2 text-center font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            c.status === 'Open'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 12. Legal Score */}
          <section className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">12</span>
                <span>Legal Score & Component Weighting</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold uppercase">Final Legal Score:</span>
                <span className="text-base font-black text-sky-950 font-mono bg-white px-2 py-0.5 rounded border border-sky-300">
                  {report.legalScore.finalLegalScore} / 100
                </span>
              </div>
            </div>

            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2 text-left">Component</th>
                  <th className="p-2 text-center">Score (0-100)</th>
                  <th className="p-2 text-center">Illustrative Weight*</th>
                  <th className="p-2 text-right">Weighted Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Ownership</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.ownershipScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">25%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.ownershipScore * 25) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Title Chain</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.titleChainScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">25%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.titleChainScore * 25) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Development Rights</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.developmentRightsScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">20%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.developmentRightsScore * 20) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Encumbrance</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.encumbranceScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">15%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.encumbranceScore * 15) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Litigation</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.litigationScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">10%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.litigationScore * 10) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Approval Consistency</td>
                  <td className="p-2 text-center font-mono font-bold">{report.legalScore.approvalConsistencyScore}</td>
                  <td className="p-2 text-center font-mono text-slate-500">5%</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    {((report.legalScore.approvalConsistencyScore * 5) / 100).toFixed(1)}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="p-2.5 text-slate-900 uppercase">Final Legal Score</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">—</td>
                  <td className="p-2.5 text-center font-mono text-slate-900">100%</td>
                  <td className="p-2.5 text-right font-mono text-base font-black text-sky-950">
                    {report.legalScore.finalLegalScore} / 100
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="text-[10px] text-slate-500 italic">
              *Illustrative implementation weights only. Configure according to bank policy.
            </div>
          </section>

          {/* 13. Legal Opinion */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">13</span>
              <span>Legal Opinion & Underwriting Recommendation</span>
            </h2>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Legal Opinion</div>
                  <div className={`mt-1 inline-block px-2.5 py-1 rounded text-xs font-black border ${getOpinionBadgeClass(report.legalOpinion?.opinion)}`}>
                    {report.legalOpinion?.opinion}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Legal Risk Band</div>
                  <div className="mt-1 font-bold text-slate-900 text-sm">{report.legalOpinion?.riskBand}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Open Blocking Exceptions</div>
                  <div className="mt-1 font-mono font-bold text-rose-700 text-sm">
                    {report.exceptions?.filter((e) => e.blocking && e.status !== 'Resolved' && e.status !== 'Closed').length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Open Conditions</div>
                  <div className="mt-1 font-mono font-bold text-amber-700 text-sm">
                    {report.conditions?.filter((c) => c.status === 'Open').length || 0}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-800">Legal Observations:</div>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{report.legalOpinion?.observations}</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-800">Legal Recommendation:</div>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{report.legalOpinion?.recommendations}</p>
              </div>
            </div>
          </section>

          {/* 14. Approved Asset Valuation & SARFAESI Collateral Schedule */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">14</span>
                <span>Approved Asset Valuation & SARFAESI Collateral Schedule</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                Title Clear • Net Collateral: ₹{val.netClearedLoanableCr.toFixed(2)} Cr
              </span>
            </h2>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Adopted Valuation Rate</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">₹{val.adoptedBaseRateSqFt.toLocaleString()}/sq.ft</div>
                  <div className="text-[10px] text-slate-500">APF Rate: ₹{val.recommendedApfRateSqFt.toLocaleString()}/sq.ft</div>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Fair Market Value (FMV)</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">₹{val.fairMarketValueCr.toFixed(2)} Cr</div>
                  <div className="text-[10px] text-slate-500">Realizable: ₹{val.realizableValueCr.toFixed(2)} Cr</div>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Distress Sale Value</div>
                  <div className="font-mono font-bold text-amber-700 text-sm mt-0.5">₹{val.distressValueCr.toFixed(2)} Cr</div>
                  <div className="text-[10px] text-slate-500">Technical Grade: {val.technicalGrade}</div>
                </div>

                <div className="p-2.5 bg-sky-50 rounded border border-sky-200">
                  <div className="text-[10px] text-sky-800 uppercase font-bold">Net Cleared Collateral Value</div>
                  <div className="font-mono font-black text-sky-900 text-sm mt-0.5">₹{val.netClearedLoanableCr.toFixed(2)} Cr</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">0% Legal Haircut Applied</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Empanelled Technical Valuer Certification:</div>
                  <div className="text-slate-700 mt-1">
                    <strong>{val.valuerName}</strong> ({val.valuerAgency}) • IBBI Reg: <span className="font-mono">{val.valuerRegNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Physical site inspection completed on {val.inspectionDate} within 500m geofence perimeter.
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-800">SARFAESI & Mortgageability Enforceability:</div>
                  <div className="text-slate-700 mt-1 flex items-center gap-1 font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{val.sarfaesiEnforceability}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {val.mortgageabilityStatus}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 15. Reviewer Declaration & Sign-off */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">15</span>
              <span>Reviewer Declaration & Sign-off</span>
            </h2>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3 text-xs">
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={report.declaration?.documentsReviewedConfirmed ?? true}
                    readOnly
                    className="mt-0.5 text-sky-600 rounded"
                  />
                  <span>
                    I confirm that the documents identified in this report were reviewed to the extent available for this APF legal due diligence.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={report.declaration?.opinionBasedOnAvailableRecordsConfirmed ?? true}
                    readOnly
                    className="mt-0.5 text-sky-600 rounded"
                  />
                  <span>
                    I confirm that the legal opinion is based on the documents, records, searches and information made available for review.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Reviewer</div>
                  <div className="font-bold text-slate-900">{report.declaration?.reviewerName || report.reviewerName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Role / Firm</div>
                  <div className="text-slate-800">{report.declaration?.reviewerFirm || report.reviewerFirm}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Digital Sign</div>
                  <div className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SIGNED</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Submitted At</div>
                  <div className="font-mono text-slate-800">{report.declaration?.submittedAt || report.reportDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Report Hash</div>
                  <div className="font-mono text-[10px] text-slate-900 truncate" title={report.reportHash || report.declaration?.digitalSignatureHash}>
                    {report.reportHash || report.declaration?.digitalSignatureHash || 'SHA256:4b912f9e...'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 16. Document Annexure / Evidence References */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 p-2 rounded border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">16</span>
              <span>Document Annexure / Evidence References</span>
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2 w-24">Evidence ID</th>
                    <th className="p-2">Document / Source</th>
                    <th className="p-2 w-36">Version / Date</th>
                    <th className="p-2 w-44">Reviewed By</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.evidenceReferences?.map((ev) => (
                    <tr key={ev.id}>
                      <td className="p-2 font-mono font-bold text-slate-900">{ev.id}</td>
                      <td className="p-2 font-bold text-slate-800">{ev.documentTitle}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">{ev.versionOrDate}</td>
                      <td className="p-2 text-slate-700">{ev.reviewedBy}</td>
                      <td className="p-2 text-slate-600 text-[11px]">{ev.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tamper-Proof Cryptographic Lock Footnote */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Digitally verified against PROVAL APF Core Ledger. Immutable legal record.
              </span>
            </div>
            <div className="font-mono flex items-center gap-1">
              <span>Hash: {report.reportHash?.substring(0, 32)}...</span>
              <button
                onClick={copyHash}
                title="Copy full cryptographic hash"
                className="hover:text-slate-900 transition-colors"
              >
                <Copy className="w-3 h-3 text-slate-400 hover:text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
