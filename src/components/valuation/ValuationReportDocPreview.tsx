import React, { useRef } from 'react';
import { BankValuationReportData } from '../../types/valuationCatalogue';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  FileText,
  Lock,
  Compass,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Shield,
  Eye,
  Info,
} from 'lucide-react';

interface ValuationReportDocPreviewProps {
  reportData: BankValuationReportData;
  onClose?: () => void;
  isPrintView?: boolean;
}

export const ValuationReportDocPreview: React.FC<ValuationReportDocPreviewProps> = ({
  reportData,
  onClose,
  isPrintView = false,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Valuation_Report_${reportData.caseId}_${reportData.reportVersion}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const d = reportData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-800 pb-16">
      {/* Action Header (hidden in print) */}
      {!isPrintView && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  BANK DUE DILIGENCE REPORT
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {d.reportVersion}
                </span>
                {d.isLocked && (
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> LOCKED & IMMUTABLE
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-white mt-0.5">
                PROVAL APF — Project Technical & Valuation Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT SHEET (Matches Word Template Design) */}
      <div
        ref={printAreaRef}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0"
      >
        {/* TOP INSTITUTIONAL WATERMARK / HEADER */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black tracking-widest uppercase text-sky-800 font-mono">
                PROVAL APF VALUATION FRAMEWORK
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                Project Technical & Valuation Report
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard Bank Template for APF / Approved Project Due Diligence
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] space-y-0.5 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-slate-200">
              <div><span className="text-slate-500">Case ID:</span> <strong className="text-slate-900">{d.caseId}</strong></div>
              <div><span className="text-slate-500">Request ID:</span> <strong className="text-slate-900">{d.valuationRequestId}</strong></div>
              <div><span className="text-slate-500">Version:</span> <strong className="text-slate-900">{d.reportVersion}</strong></div>
              <div><span className="text-slate-500">Date:</span> <strong className="text-slate-900">{d.submittedAt || new Date().toISOString().substring(0, 10)}</strong></div>
            </div>
          </div>
        </div>

        {/* SECTION 1: REPORT HEADER & ASSIGNMENT */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            1. Report Header & Assignment
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">APF Case ID</span>
              <div className="font-bold text-slate-900 font-mono">{d.caseId}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Valuation Request ID</span>
              <div className="font-bold text-slate-900 font-mono">{d.valuationRequestId}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Request Type</span>
              <div className="font-bold text-slate-900">{d.requestType}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Valuer Type</span>
              <div className="font-bold text-slate-900">{d.valuerType}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Valuer / Firm</span>
              <div className="font-bold text-slate-900">{d.valuerName} ({d.valuerFirm})</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Empanelment No.</span>
              <div className="font-bold text-slate-900 font-mono">{d.empanelmentNo}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Assignment Date / SLA</span>
              <div className="font-bold text-slate-900">{d.assignmentDate} / {d.slaDueDate}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Visit Type</span>
              <div className="font-bold text-slate-900">{d.visitType}</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BUILDER & PROJECT PARTICULARS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            2. Builder & Project Particulars
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Builder Legal Name & Group</td>
                  <td className="p-2.5 font-bold text-slate-900">{d.builderLegalName} <span className="text-slate-500 font-normal">({d.builderGroup})</span></td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Project Name</td>
                  <td className="p-2.5 font-bold text-slate-900">{d.projectName}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">RERA Registration</td>
                  <td className="p-2.5 font-mono text-sky-800 font-semibold">{d.reraNumbers?.join(', ')}</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Project Type / Segment</td>
                  <td className="p-2.5">{d.projectType} / {d.projectSegment}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Site Address</td>
                  <td className="p-2.5" colSpan={3}>{d.projectAddress}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Location Geo Details</td>
                  <td className="p-2.5">{d.cityDistrictStatePin}</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Assigned Scope</td>
                  <td className="p-2.5">
                    <strong>Phases:</strong> {d.assignedPhases?.join(', ')} | <strong>Towers:</strong> {d.assignedTowers?.join(', ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: SITE VISIT & GEO VERIFICATION */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            3. Site Visit & Geo Verification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Visit Window</span>
              <div className="font-semibold text-slate-900 font-mono text-[11px]">{d.visitStartDateTime} to {d.visitEndDateTime}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Captured Coordinates</span>
              <div className="font-semibold text-slate-900 font-mono text-[11px]">
                {d.latitude?.toFixed(5)}, {d.longitude?.toFixed(5)} (±{d.gpsAccuracyMeters}m)
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Geofence Compliance</span>
              <div className="font-bold flex items-center gap-1.5 mt-0.5">
                {d.geofenceResult === 'Inside' ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-200">
                    ✓ INSIDE PERIMETER
                  </span>
                ) : (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-mono text-[10px] border border-rose-200">
                    ⚠ {d.geofenceResult}
                  </span>
                )}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Address & Boundary Match</span>
              <div className="font-bold text-slate-900">{d.siteAddressMatch} | Boundary: {d.siteBoundaryVerified}</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <strong className="text-slate-700">Site Visit Remarks: </strong>
            <span className="text-slate-600">{d.siteVisitRemarks}</span>
          </div>
        </div>

        {/* SECTION 4: LAND & LOCATION ASSESSMENT */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            4. Land & Location Assessment
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Survey / CTS / Plot No.</td>
                  <td className="p-2.5 font-bold text-slate-900">{d.surveyCtsPlotNo}</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Land Area & Unit</td>
                  <td className="p-2.5 font-bold text-slate-900">{d.landArea} {d.landAreaUnit}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Ownership & Title</td>
                  <td className="p-2.5">{d.ownershipType}</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Possession / Access Status</td>
                  <td className="p-2.5 font-bold text-emerald-700">{d.possessionStatus}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Locality & Land Use</td>
                  <td className="p-2.5">{d.localityClassification} ({d.neighbourhoodLandUse})</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Approach Road & Width</td>
                  <td className="p-2.5">{d.approachRoadWidthMeters}m ({d.approachRoadCondition})</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Connectivity</td>
                  <td className="p-2.5">{d.connectivity}</td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Location Score</td>
                  <td className="p-2.5 font-bold text-sky-800">{d.locationScore} / 5.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: STATUTORY / PROJECT APPROVALS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            5. Statutory / Project Approvals
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5 text-left">Approval / License</th>
                  <th className="p-2.5 text-left">Status</th>
                  <th className="p-2.5 text-left">Reference / Order Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">RERA Registration</td>
                  <td className="p-2.5 font-bold text-emerald-700">{d.reraStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.reraRef}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Sanctioned Layout / Building Plan</td>
                  <td className="p-2.5 font-bold text-emerald-700">{d.sanctionedPlanStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.sanctionedPlanRef}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Commencement Certificate (CC)</td>
                  <td className="p-2.5 font-bold text-emerald-700">{d.commencementCertStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.commencementCertRef}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Occupancy Certificate (OC)</td>
                  <td className="p-2.5 text-slate-600">{d.ocStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.ocRef}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Environmental Clearance (EC)</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">{d.environmentClearanceStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.environmentClearanceRef}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Fire NOC / Provisional Approval</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">{d.fireApprovalStatus}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.fireApprovalRef}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">Major Approval Exceptions</td>
                  <td className="p-2.5 font-bold text-slate-800">{d.majorApprovalException}</td>
                  <td className="p-2.5 text-slate-600">{d.approvalRemarks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 6: TOWER-WISE CONSTRUCTION PROGRESS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            6. Tower-wise Construction Progress
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5 text-left">Tower</th>
                  <th className="p-2.5 text-center">Sanctioned Floors</th>
                  <th className="p-2.5 text-center">Constructed Floors</th>
                  <th className="p-2.5 text-left">Current Stage</th>
                  <th className="p-2.5 text-center">Actual %</th>
                  <th className="p-2.5 text-center">Expected %</th>
                  <th className="p-2.5 text-center">Delay Var %</th>
                  <th className="p-2.5 text-center">Labour</th>
                  <th className="p-2.5 text-center">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {d.towersProgress?.map((t) => (
                  <tr key={t.towerId}>
                    <td className="p-2.5 font-bold text-slate-900">{t.towerName}</td>
                    <td className="p-2.5 text-center font-mono">{t.sanctionedFloors}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-sky-800">{t.constructedFloors}</td>
                    <td className="p-2.5 font-semibold text-slate-700">{t.constructionStage}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">{t.physicalProgressPct}%</td>
                    <td className="p-2.5 text-center text-slate-500">{t.expectedProgressPct}%</td>
                    <td className="p-2.5 text-center font-bold">
                      {t.delayVariancePct > 5 ? (
                        <span className="text-rose-600">+{t.delayVariancePct}% (Delayed)</span>
                      ) : (
                        <span className="text-emerald-700">{t.delayVariancePct}% (On Track)</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center text-slate-700">{t.labourPresence}</td>
                    <td className="p-2.5 text-center font-bold text-sky-800">{t.structuralWorkmanshipQuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 7: TECHNICAL QUALITY & INFRASTRUCTURE */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            7. Technical Quality & Infrastructure
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Structural & Workmanship Quality:</span>
                <strong className="text-sky-800">{d.structuralWorkmanshipQuality} ({d.constructionQualityScore}/5)</strong>
              </div>
              <p className="text-[11px] text-slate-600">{d.workmanshipRemarks}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Safety & Housekeeping:</span>
                <strong className="text-slate-800">{d.safetyHousekeeping}</strong>
              </div>
              <p className="text-[11px] text-slate-600">{d.safetyRemarks}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Infrastructure Readiness:</span>
                <strong className="text-sky-800">{d.infrastructureReadiness} ({d.infraScore}/5)</strong>
              </div>
              <p className="text-[11px] text-slate-600">{d.infraRemarks}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Labour & Material Execution:</span>
                <strong className="text-slate-800">{d.labourPresence} / {d.materialAvailability}</strong>
              </div>
              <p className="text-[11px] text-slate-600">{d.executionRemarks}</p>
            </div>
          </div>
        </div>

        {/* SECTION 8: MARKETABILITY & DEMAND */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            8. Marketability & Demand
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Demand Level</td>
                  <td className="p-2.5 font-bold text-slate-900">{d.demandLevel} <span className="text-slate-500 font-normal">({d.demandRemarks})</span></td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/4">Competition Intensity</td>
                  <td className="p-2.5">{d.competitionIntensity} <span className="text-slate-500 font-normal">({d.competitionRemarks})</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Sales Velocity</td>
                  <td className="p-2.5 font-bold text-emerald-700">{d.salesVelocity} <span className="text-slate-500 font-normal">({d.salesRemarks})</span></td>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Inventory Position</td>
                  <td className="p-2.5">{d.inventoryPosition} <span className="text-slate-500 font-normal">({d.inventoryRemarks})</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-bold text-slate-600">Marketability Rating & Score</td>
                  <td className="p-2.5 font-bold text-sky-800" colSpan={3}>
                    {d.marketabilityRating} ({d.marketabilityScore} of 5.0)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 9: COMPARABLE MARKET EVIDENCE */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            9. Comparable Market Evidence
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5 text-left">Comparable Project</th>
                  <th className="p-2.5 text-left">Developer</th>
                  <th className="p-2.5 text-center">Distance</th>
                  <th className="p-2.5 text-left">Stage</th>
                  <th className="p-2.5 text-left">Config</th>
                  <th className="p-2.5 text-right">Quoted Rate</th>
                  <th className="p-2.5 text-right">Supported Rate</th>
                  <th className="p-2.5 text-left">Source</th>
                  <th className="p-2.5 text-right">Adjusted Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {d.comparables?.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2.5 font-bold text-slate-900">{c.comparableProjectName}</td>
                    <td className="p-2.5 text-slate-600">{c.developer}</td>
                    <td className="p-2.5 text-center font-mono">{c.distanceKm} km</td>
                    <td className="p-2.5">{c.projectStage}</td>
                    <td className="p-2.5">{c.configuration}</td>
                    <td className="p-2.5 text-right font-mono">₹{c.quotedRateSqFt.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono font-semibold text-emerald-800">₹{c.supportedRateSqFt.toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500">{c.rateSource}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-sky-800">₹{c.adjustedComparableRate.toLocaleString()}/sq.ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500 italic">
            * Comparable adjustment factors account for location differentials, construction stage, amenity matrix, and unit carpet size.
          </div>
        </div>

        {/* SECTION 10: VALUATION METHODOLOGY */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            10. Valuation Methodology
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-600 block">Primary Method:</span>
                <span className="font-bold text-slate-900 text-sm">{d.primaryMethod}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block">Secondary Method:</span>
                <span className="font-bold text-slate-900 text-sm">{d.secondaryMethod}</span>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">Methodology Rationale:</span>
              <p className="text-slate-600 leading-relaxed">{d.methodologyRationale}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <span className="font-bold text-emerald-800 block text-[11px] uppercase mb-1">
                  ▲ Factors Increasing Value
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {d.factorsIncreasingValue?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold text-rose-800 block text-[11px] uppercase mb-1">
                  ▼ Factors Reducing Value / Marketability
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {d.factorsReducingValue?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 11: VALUATION SUMMARY (Prominent Summary Table) */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700 flex items-center justify-between">
            <span>11. Valuation Summary</span>
            <span className="text-[10px] font-mono text-sky-800 font-bold">EXECUTIVE RISK & PRICING TABLE</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Builder Quoted Base Rate</span>
              <span className="text-base font-black text-slate-900 font-mono">₹{d.builderQuotedBaseRate?.toLocaleString()}/sq.ft</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Observed Market Range</span>
              <span className="text-base font-black text-slate-700 font-mono">₹{d.observedMarketRateLow?.toLocaleString()} - ₹{d.observedMarketRateHigh?.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Adopted Base Rate</span>
              <span className="text-lg font-black text-sky-900 font-mono">₹{d.adoptedBaseRate?.toLocaleString()}/sq.ft</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Recommended APF Rate</span>
              <span className="text-lg font-black text-emerald-900 font-mono">₹{d.recommendedApfRate?.toLocaleString()}/sq.ft</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-900 uppercase block">Fair Market Value (FMV)</span>
              <div className="text-2xl font-black text-emerald-900 font-mono mt-1">₹{d.marketValueCr} Cr</div>
              <span className="text-[10px] text-emerald-700">100% Benchmark Project Collateral</span>
            </div>
            <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Realizable Value (88%)</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">₹{d.realizableValueCr} Cr</div>
              <span className="text-[10px] text-slate-600">Orderly Liquidating Value</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl">
              <span className="text-[10px] font-bold text-rose-900 uppercase block">Distress Sale Value (72%)</span>
              <div className="text-2xl font-black text-rose-900 font-mono mt-1">₹{d.distressValueCr} Cr</div>
              <span className="text-[10px] text-rose-700">Forced Immediate Liquidation</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span><strong>Floor Rise:</strong> {d.floorRiseApplicable} ({d.floorRiseRate ? `₹${d.floorRiseRate}/floor` : 'N/A'})</span>
            <span><strong>PLC / View Premium:</strong> {d.plcApplicable} ({d.plcPremium ? `₹${d.plcPremium}/sq.ft` : 'N/A'})</span>
            <span><strong>Valuation Validity:</strong> {d.valuationValidity}</span>
          </div>
        </div>

        {/* SECTION 12: TECHNICAL SCORE, GRADE & RECOMMENDATION */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            12. Technical Score, Grade & Recommendation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Location</span>
              <span className="text-lg font-black text-slate-800">{d.locationScore}/5</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Construction</span>
              <span className="text-lg font-black text-slate-800">{d.constructionQualityScore}/5</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Infrastructure</span>
              <span className="text-lg font-black text-slate-800">{d.infraScore}/5</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Marketability</span>
              <span className="text-lg font-black text-slate-800">{d.marketabilityScore}/5</span>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">Technical Score</span>
              <span className="text-xl font-black text-sky-900">{d.finalTechnicalScore} / 100</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Technical Grade</span>
              <span className="text-2xl font-black text-emerald-900">{d.technicalGrade}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Valuation Decision:</span>
            <span className="px-3 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase font-mono">
              {d.valuationDecision}
            </span>
          </div>
        </div>

        {/* SECTION 13: RISKS, EXCEPTIONS & CONDITIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            13. Risks, Exceptions & Conditions
          </h3>
          {d.risks && d.risks.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5 text-left">Category</th>
                    <th className="p-2.5 text-left">Observation</th>
                    <th className="p-2.5 text-center">Severity</th>
                    <th className="p-2.5 text-left">Mitigation / Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {d.risks.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2.5 font-bold text-slate-800">{r.category}</td>
                      <td className="p-2.5 text-slate-700">{r.observation}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            r.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : r.severity === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{r.mitigationCondition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No material risks recorded.</p>
          )}

          {d.conditions && d.conditions.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
              <strong className="text-amber-900 block font-bold">Sanction Conditions / Special Caveats:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {d.conditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION 14: VALUER RECOMMENDATION & DECLARATION */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            14. Valuer Recommendation & Declaration
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div>
              <strong className="text-slate-800 block mb-1">Final Valuation Recommendation Narrative:</strong>
              <p className="text-slate-700 leading-relaxed font-sans">{d.valuerRecommendation}</p>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-slate-600 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>I confirm that I personally / through authorized assigned valuer physically visited the subject project/site as recorded.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>The observations and valuation are based on the documents, market evidence, and physical verification available.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Empanelled Valuer Sign-off</span>
                <strong className="text-slate-900 text-sm font-sans">{d.valuerName}</strong>
                <div className="text-slate-600">{d.valuerFirm}</div>
                <div className="text-[11px] text-slate-500">Reg: {d.empanelmentNo}</div>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Digital Certificate Hash</span>
                <span className="text-[10px] text-sky-800 break-all">{d.reportHash || 'SHA256-49FA8102-DSC3-9B4F817C'}</span>
                <div className="text-slate-500 text-[11px] mt-0.5 font-sans">
                  Submitted At: {d.submittedAt || new Date().toISOString().substring(0, 19)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 15: PHOTOGRAPHIC ANNEXURE */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-700">
            15. Photographic Annexure (Geo-Tagged Site Evidence)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {d.photos?.map((ph) => (
              <div key={ph.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 space-y-2">
                <div className="h-44 bg-slate-200 relative flex items-center justify-center text-slate-400">
                  <Camera className="w-10 h-10 opacity-30" />
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {ph.category}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 text-white p-2 rounded-lg text-[9px] font-mono space-y-0.5">
                    <div className="flex justify-between">
                      <span>GPS: {ph.lat?.toFixed(5)}, {ph.lng?.toFixed(5)}</span>
                      <span>±{ph.accuracyMeters}m Accuracy</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Case: {d.caseId}</span>
                      <span>Time: {ph.timestamp}</span>
                    </div>
                    <div className="text-slate-400 text-[8px] truncate">
                      Device: {ph.deviceSessionId} • Valuer: {ph.capturedBy}
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{ph.title}</div>
                  <p className="text-[11px] text-slate-600">{ph.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono">
          PROVAL APF VALUATION ENGINE • AUTOMATED BANK DUE DILIGENCE DOCKET • CONFIDENTIAL
        </div>
      </div>
    </div>
  );
};
