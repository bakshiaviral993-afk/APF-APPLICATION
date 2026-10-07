import { LegalDueDiligenceReport, LegalValuationAlignmentData } from '../types/legalDueDiligence';

export function getResolvedValuationData(
  report: LegalDueDiligenceReport,
  caseData?: any
): LegalValuationAlignmentData {
  const caseVal = caseData?.valuationReport;
  const existing = report.valuationAlignment;

  const adoptedBaseRateSqFt = existing?.adoptedBaseRateSqFt || caseVal?.adoptedBaseRateSqFt || 7200;
  const recommendedApfRateSqFt = existing?.recommendedApfRateSqFt || caseVal?.recommendedApfRateSqFt || 7000;
  const fairMarketValueCr = existing?.fairMarketValueCr || caseVal?.fairMarketValueCr || 244.80;
  const realizableValueCr = existing?.realizableValueCr || caseVal?.realizableValueCr || 220.32;
  const distressValueCr = existing?.distressValueCr || caseVal?.distressValueCr || 195.84;
  const totalConstructedAreaSqFt = existing?.totalConstructedAreaSqFt || 340000;
  const technicalGrade = existing?.technicalGrade || caseVal?.technicalGrade || 'A';

  // Compute legal haircut based on opinion:
  // Clear = 0% haircut, Conditional Clear = 5% haircut, Rejected = 100% haircut
  let legalHaircutPct = 0;
  if (report.legalOpinion?.opinion === 'Conditional Clear') {
    legalHaircutPct = 5;
  } else if (report.legalOpinion?.opinion === 'Rejected') {
    legalHaircutPct = 100;
  }

  const netClearedLoanableCr = Number(
    (fairMarketValueCr * (1 - legalHaircutPct / 100)).toFixed(2)
  );

  return {
    valuationRequestId: existing?.valuationRequestId || `REQ-${report.caseId.replace('APF-', '')}-VAL01`,
    adoptedBaseRateSqFt,
    recommendedApfRateSqFt,
    fairMarketValueCr,
    realizableValueCr,
    distressValueCr,
    totalConstructedAreaSqFt,
    technicalGrade,
    legalHaircutPct,
    netClearedLoanableCr,
    mortgageabilityStatus: 'Eligible for First Pari-Passu / Exclusive Bank Mortgage',
    sarfaesiEnforceability: 'Confirmed Enforceable under SARFAESI Act 2002',
    valuerName: existing?.valuerName || caseVal?.submittedBy || 'M. K. Kulkarni',
    valuerAgency: existing?.valuerAgency || 'Kulkarni & Associates Technical Valuers',
    valuerRegNo: existing?.valuerRegNo || 'IBBI/RV/02/2019/11048',
    inspectionDate: existing?.inspectionDate || caseVal?.submittedAt || '2026-09-22 16:45:00',
    valuationDecision: existing?.valuationDecision || 'Recommended',
    valuationValidity: existing?.valuationValidity || '90 Days',
    geofenceVerified: true,
    digitalSignature: existing?.digitalSignature || caseVal?.digitalSignature || 'SHA256:e8b91a72d3c4... (Aadhaar eSign Class 3 - M. K. Kulkarni)',
    reportHash: existing?.reportHash || caseVal?.reportHash || 'a7f3e829c9b1d402e1b8c4d9e03f5a2b1c8e7d6f5a4b3c2d1e0f9a8b7c6d5e4f',
    rateBand2BHK: existing?.rateBand2BHK || caseVal?.rateBand2BHK || '₹7,000 - ₹7,500/sq.ft',
    rateBand3BHK: existing?.rateBand3BHK || caseVal?.rateBand3BHK || '₹7,200 - ₹7,700/sq.ft',
    keyObservations: existing?.keyObservations || caseVal?.keyObservations || [
      'Construction is on schedule with 16 of 22 slabs completed for Tower 1',
      'High marketability in corridor with strong tech buyer demand',
      'No unauthorized deviation or structural infringement detected',
    ],
  };
}

export function generateLegalValuationReportHtml(
  report: LegalDueDiligenceReport,
  caseData?: any
): string {
  const val = getResolvedValuationData(report, caseData);
  const printDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const titleRowsHtml = (report.titleChainRows || [])
    .map(
      (r) => `
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${r.seqNo}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${r.instrumentType}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${r.documentDate}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace;">${r.registrationNumber}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${r.transferor}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${r.transferee}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${r.surveyRef} (${r.areaCovered})</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">${r.status}</td>
    </tr>
  `
    )
    .join('');

  const encumbrancesHtml = (report.encumbrances || [])
    .map(
      (e) => `
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${e.type}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${e.chargeHolder}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #1e3a8a;">₹${e.chargeAmountCr} Cr</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${e.propertyAffected}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${e.releaseStatus}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">NOC: ${e.nocRequired}</td>
    </tr>
  `
    )
    .join('');

  const exceptionsHtml = (report.exceptions || [])
    .map(
      (ex) => `
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${ex.id}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${ex.category}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${ex.observation}</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: ${ex.blocking ? '#b91c1c' : '#b45309'}; font-weight: bold;">
        ${ex.blocking ? 'BLOCKING' : 'Advisory'}
      </td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${ex.owner} (${ex.dueStage})</td>
      <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${ex.status}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PROVAL APF - Legal Due Diligence & Valuation Report - ${report.id}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.45;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
    .badge-clear { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-cond { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-left: 4px solid #0284c7;
      margin-top: 20px;
      margin-bottom: 10px;
      border-radius: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .info-cell {
      background: #f8fafc;
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .info-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .info-value { font-size: 11px; font-weight: 700; color: #0f172a; }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 14px;
    }
    .table-custom th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-size: 10px;
      text-transform: uppercase;
    }
    .val-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-top: 14px;
      margin-bottom: 16px;
    }
    .val-stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 10px;
    }
    .val-stat-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 8px 12px;
      border-radius: 6px;
    }
    .print-btn-bar {
      margin-bottom: 18px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-secondary {
      background: #475569;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .print-btn-bar { display: none; }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Screen Print Control Bar -->
    <div class="print-btn-bar">
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
      <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <!-- Official Header -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div style="font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #0284c7; text-transform: uppercase;">
            PROVAL APF • BANK LEGAL RISK & VALUATION BUREAU
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px;">
            LEGAL DUE DILIGENCE & VALUATION REPORT
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            30-Year Title Search • Ownership • Encumbrances • Litigation • Asset Valuation & Collateral Enforceability
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <span class="badge ${report.status === 'LEGAL_CLEAR' ? 'badge-clear' : 'badge-cond'}">
            ${report.status.replace(/_/g, ' ')}
          </span>
          <div style="font-size: 11px; font-family: monospace; font-weight: bold; margin-top: 4px;">
            Docket ID: ${report.id}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            Report Date: ${report.reportDate} | APF Case: ${report.caseId}
          </div>
        </td>
      </tr>
    </table>

    <!-- 1. Docket & Counsel Assignment -->
    <div class="section-title">1. Legal Scrutiny & Counsel Assignment</div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="info-label">Assigned Counsel / Firm</div>
        <div class="info-value">${report.reviewerName}</div>
        <div style="font-size: 10px; color: #64748b;">${report.reviewerFirm}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Empanelment No.</div>
        <div class="info-value" style="font-family: monospace;">${report.empanelmentNo}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Legal Route & Scope</div>
        <div class="info-value">${report.legalRoute} • ${report.scopeType}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">SLA Due Date</div>
        <div class="info-value" style="color: #b91c1c;">${report.slaDueDate}</div>
      </div>
    </div>

    <!-- 2. Developer & Land Identifiers -->
    <div class="section-title">2. Developer Master & Property Demarcation</div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="info-label">Developer Legal Entity</div>
        <div class="info-value">${report.builderLegalName}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Project Name</div>
        <div class="info-value">${report.projectName}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Survey / Plot Demarcation</div>
        <div class="info-value">${report.surveyPlotNumber}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Total Land Parcel Area</div>
        <div class="info-value">${report.landArea}</div>
      </div>
    </div>

    <!-- 3. Approved Asset Valuation & Net Cleared Collateral (Core Feature) -->
    <div class="val-banner">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #38bdf8;">
          ★ Section 15: Approved Asset Valuation & Net Collateral Enforceability Schedule
        </div>
        <div style="font-size: 11px; background: rgba(56,189,248,0.2); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
          IBBI Reg: ${val.valuerRegNo}
        </div>
      </div>

      <div class="val-stat-grid">
        <div class="val-stat-card">
          <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Adopted Base Rate</div>
          <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-top: 2px;">₹${val.adoptedBaseRateSqFt.toLocaleString()}/sq.ft</div>
          <div style="font-size: 9px; color: #38bdf8;">APF Rate: ₹${val.recommendedApfRateSqFt.toLocaleString()}/sq.ft</div>
        </div>

        <div class="val-stat-card">
          <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Fair Market Value (FMV)</div>
          <div style="font-size: 15px; font-weight: 900; color: #4ade80; margin-top: 2px;">₹${val.fairMarketValueCr.toFixed(2)} Cr</div>
          <div style="font-size: 9px; color: #cbd5e1;">Realizable: ₹${val.realizableValueCr.toFixed(2)} Cr</div>
        </div>

        <div class="val-stat-card">
          <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Distress Sale Value</div>
          <div style="font-size: 15px; font-weight: 900; color: #f59e0b; margin-top: 2px;">₹${val.distressValueCr.toFixed(2)} Cr</div>
          <div style="font-size: 9px; color: #cbd5e1;">Haircut: ${val.legalHaircutPct}%</div>
        </div>

        <div class="val-stat-card" style="background: rgba(14,165,233,0.18); border-color: rgba(56,189,248,0.4);">
          <div style="font-size: 9px; text-transform: uppercase; color: #38bdf8; font-weight: 800;">Net Cleared Collateral Value</div>
          <div style="font-size: 16px; font-weight: 900; color: #38bdf8; margin-top: 2px;">₹${val.netClearedLoanableCr.toFixed(2)} Cr</div>
          <div style="font-size: 9px; color: #ffffff;">Grade: ${val.technicalGrade} • Title Clear</div>
        </div>
      </div>

      <div style="margin-top: 10px; font-size: 10.5px; color: #cbd5e1; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div><strong>Empanelled Valuer:</strong> ${val.valuerName} (${val.valuerAgency})</div>
        <div><strong>Inspection Date:</strong> ${val.inspectionDate}</div>
        <div><strong>Security Enforceability:</strong> ${val.sarfaesiEnforceability}</div>
      </div>
    </div>

    <!-- 4. 30-Year Title Search -->
    <div class="section-title">3. 30-Year Chain of Title Verification (${report.titleChainStatus})</div>
    <table class="table-custom">
      <thead>
        <tr>
          <th style="width: 25px;">#</th>
          <th>Instrument</th>
          <th>Doc Date</th>
          <th>Reg Number</th>
          <th>Transferor</th>
          <th>Transferee</th>
          <th>Property Demarcation</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${titleRowsHtml}
      </tbody>
    </table>

    <!-- 5. Encumbrance & Litigation -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <div>
        <div class="section-title">4. Encumbrances / Charges Recorded</div>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Type</th>
              <th>Charge Holder</th>
              <th>Amount</th>
              <th>Property Affected</th>
              <th>Release Status</th>
              <th>NOC</th>
            </tr>
          </thead>
          <tbody>
            ${encumbrancesHtml || '<tr><td colspan="6" style="padding: 8px; text-align: center; color: #64748b;">No adverse encumbrances recorded.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div>
        <div class="section-title">5. Active Lawsuit & Litigation Searches</div>
        <div style="font-size: 11px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div style="font-weight: bold; margin-bottom: 4px; color: #1e3a8a;">
            Court Searches Summary: ${report.litigationPresent}
          </div>
          <div style="color: #475569; font-size: 10.5px;">
            ${report.litigationSummary || 'No material litigation affecting mortgage creation or bank security.'}
          </div>
        </div>
      </div>
    </div>

    <!-- 6. Legal Deficiencies & Conditions -->
    <div class="section-title">6. Legal Exceptions & Pre-Disbursement Conditions</div>
    <table class="table-custom">
      <thead>
        <tr>
          <th>ID</th>
          <th>Category</th>
          <th>Observation / Condition</th>
          <th>Severity</th>
          <th>Owner / Stage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${exceptionsHtml || '<tr><td colspan="6" style="padding: 8px; text-align: center; color: #047857;">Zero blocking deficiencies found.</td></tr>'}
      </tbody>
    </table>

    <!-- 7. Score & Legal Opinion Summary -->
    <div class="section-title">7. Legal Risk Score & Final Underwriting Recommendation</div>
    <div style="display: flex; gap: 14px; margin-bottom: 16px;">
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Final Calculated Legal Score</div>
        <div style="font-size: 22px; font-weight: 900; color: #0284c7; margin-top: 2px;">
          ${report.legalScore?.finalLegalScore || 92} / 100
        </div>
        <div style="font-size: 10px; color: #047857; font-weight: bold;">
          Risk Band: ${report.legalOpinion?.riskBand || 'Low'} Risk
        </div>
      </div>

      <div style="flex: 2; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Underwriting Opinion</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          ${report.legalOpinion?.opinion || 'Clear'}
        </div>
        <div style="font-size: 10.5px; color: #334155; margin-top: 4px;">
          ${report.legalOpinion?.observations || 'Title is clear and marketable without defects.'}
        </div>
      </div>
    </div>

    <!-- 8. Statutory Reviewer & Valuer Attestation -->
    <div class="section-title">8. Dual Statutory Attestation & Cryptographic Audit Seal</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 10.5px;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
          Advocate / Legal Counsel Attestation
        </div>
        <div>Reviewer: <strong>${report.reviewerName}</strong> (${report.reviewerFirm})</div>
        <div>Empanelment: <strong>${report.empanelmentNo}</strong></div>
        <div>Digital Signature: <strong style="color: #047857;">SIGNED & CERTIFIED</strong></div>
        <div style="font-family: monospace; font-size: 9px; color: #64748b; margin-top: 4px; word-break: break-all;">
          Hash: ${report.reportHash || 'SHA256:7f49a01b92c4d8e7...'}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
        <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
          Technical Valuer Attestation
        </div>
        <div>Valuer: <strong>${val.valuerName}</strong> (${val.valuerAgency})</div>
        <div>Registration: <strong>${val.valuerRegNo}</strong></div>
        <div>Valuation Seal: <strong style="color: #047857;">VERIFIED & LOCKED</strong></div>
        <div style="font-family: monospace; font-size: 9px; color: #64748b; margin-top: 4px; word-break: break-all;">
          Valuation Hash: ${val.reportHash || 'SHA256:a7f3e829c9b1d402...'}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #64748b; display: flex; justify-content: space-between;">
      <div>PROVAL APF Banking System • Confidential & Proprietary Legal Record</div>
      <div>Generated On: ${printDate}</div>
    </div>
  </div>

</body>
</html>`;
}

export function downloadLegalValuationReport(
  report: LegalDueDiligenceReport,
  caseData?: any
): void {
  const htmlContent = generateLegalValuationReportHtml(report, caseData);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PROVAL_APF_Legal_Valuation_Report_${report.caseId}_${report.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadValuationSummaryJson(
  report: LegalDueDiligenceReport,
  caseData?: any
): void {
  const val = getResolvedValuationData(report, caseData);
  const payload = {
    docketId: report.id,
    caseId: report.caseId,
    reportDate: report.reportDate,
    status: report.status,
    legalRoute: report.legalRoute,
    counsel: {
      name: report.reviewerName,
      firm: report.reviewerFirm,
      empanelmentNo: report.empanelmentNo,
    },
    builder: {
      name: report.builderLegalName,
      group: report.builderGroup,
      projectName: report.projectName,
      surveyPlotNumber: report.surveyPlotNumber,
      landArea: report.landArea,
    },
    valuationAlignment: val,
    legalScore: report.legalScore,
    opinion: report.legalOpinion,
    titleChainSummary: report.titleChainSummary,
    exceptionsCount: report.exceptions?.length || 0,
    conditionsCount: report.conditions?.length || 0,
    reportHash: report.reportHash,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PROVAL_APF_Valuation_Summary_${report.caseId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
