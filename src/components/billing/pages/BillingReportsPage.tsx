import React, { useState } from 'react';
import { BillMaster, BillingEvent } from '../../../types/billingTypes';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  FileText,
  TrendingUp,
  Receipt,
  Scale,
  CreditCard,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';

interface BillingReportsPageProps {
  bills: BillMaster[];
  events: BillingEvent[];
}

export type BillingReportType =
  | 'VENDOR_WISE'
  | 'SERVICE_WISE'
  | 'TECH_VS_LEGAL'
  | 'MONTHLY_BILLING'
  | 'INVOICE_VARIANCE'
  | 'PAYMENT_AGEING'
  | 'MAKER_TAT'
  | 'CHECKER_TAT'
  | 'VENDOR_INVOICE_TAT'
  | 'RETURNED_REASONS'
  | 'REIMBURSEMENTS'
  | 'TAX_SUMMARY'
  | 'ERP_FAILURES'
  | 'PAID_OUTSTANDING'
  | 'CREDIT_DEBIT_NOTES';

export const BillingReportsPage: React.FC<BillingReportsPageProps> = ({ bills, events }) => {
  const [selectedReport, setSelectedReport] = useState<BillingReportType>('VENDOR_WISE');

  const handleExportCsv = () => {
    let headers: string[] = ['Column 1', 'Column 2', 'Column 3', 'Column 4'];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'VENDOR_WISE') {
      headers = ['Vendor_ID', 'Vendor_Name', 'Discipline', 'Total_Bills', 'Gross_Fee', 'Tax', 'Net_Payable'];
      const vendorMap = new Map<string, { name: string; type: string; count: number; gross: number; tax: number; net: number }>();
      bills.forEach((b) => {
        const item = vendorMap.get(b.vendorId) || {
          name: b.vendorName,
          type: b.vendorType === 'EXTERNAL_VALUER' ? 'Technical' : 'Legal',
          count: 0,
          gross: 0,
          tax: 0,
          net: 0,
        };
        item.count += 1;
        item.gross += b.subtotalProfessionalFee;
        item.tax += b.taxDetails.totalTax;
        item.net += b.netPayable;
        vendorMap.set(b.vendorId, item);
      });
      vendorMap.forEach((val, key) => {
        rows.push([key, `"${val.name}"`, val.type, val.count, val.gross, val.tax, val.net]);
      });
    } else {
      headers = ['Bill_ID', 'Case_ID', 'Vendor_Name', 'Status', 'Gross', 'Net'];
      rows = bills.map((b) => [b.id, b.caseId, `"${b.vendorName}"`, b.status, b.grossInvoiceAmount, b.netPayable]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PROVAL_Billing_Report_${selectedReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-start justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">PROVAL APF Billing Intelligence & Operational Reports</div>
            <div className="text-slate-300">
              14 bank-grade analytical reports spanning vendor expenditure, SLA turnaround, invoice variance,
              payment ageing, and ERP reconciliation.
            </div>
          </div>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export Selected CSV
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'VENDOR_WISE', label: '1. Vendor-wise Billing' },
          { id: 'SERVICE_WISE', label: '2. Service-wise Spend' },
          { id: 'TECH_VS_LEGAL', label: '3. Technical vs Legal' },
          { id: 'MONTHLY_BILLING', label: '4. Monthly Trend' },
          { id: 'INVOICE_VARIANCE', label: '5. Fee Variance' },
          { id: 'PAYMENT_AGEING', label: '6. Payment Ageing' },
          { id: 'MAKER_TAT', label: '7. Maker TAT' },
          { id: 'CHECKER_TAT', label: '8. Checker TAT' },
          { id: 'VENDOR_INVOICE_TAT', label: '9. Invoice Upload TAT' },
          { id: 'REIMBURSEMENTS', label: '10. Reimbursements' },
          { id: 'TAX_SUMMARY', label: '11. GST & TDS Tax' },
          { id: 'ERP_FAILURES', label: '12. ERP Failures' },
          { id: 'PAID_OUTSTANDING', label: '13. Paid vs Outstanding' },
          { id: 'CREDIT_DEBIT_NOTES', label: '14. Adjustment Notes' },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReport(rep.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedReport === rep.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* Render Selected Report View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="font-bold text-slate-800 text-sm">
            {selectedReport === 'VENDOR_WISE' && 'Vendor-wise Cumulative Billing Breakdown'}
            {selectedReport === 'SERVICE_WISE' && 'Service Type Fee Distribution'}
            {selectedReport === 'TECH_VS_LEGAL' && 'Technical Valuers vs Legal Advocates Portfolio Share'}
            {selectedReport === 'MONTHLY_BILLING' && 'Monthly Billing & Disbursement Run-rate'}
            {selectedReport === 'INVOICE_VARIANCE' && 'Expected Fee vs Claimed Invoice Variance Analysis'}
            {selectedReport === 'PAYMENT_AGEING' && 'Payment Outstanding Ageing Schedule'}
            {selectedReport === 'MAKER_TAT' && 'Maker Verification SLA Compliance & Turnaround Time'}
            {selectedReport === 'CHECKER_TAT' && 'Checker Sanction SLA Turnaround Time'}
            {selectedReport === 'VENDOR_INVOICE_TAT' && 'Vendor Tax Invoice Upload Turnaround Time'}
            {selectedReport === 'REIMBURSEMENTS' && 'Category-wise Reimbursement Claim Analysis'}
            {selectedReport === 'TAX_SUMMARY' && 'GST Liability & Income Tax TDS (Sec 194J) Register'}
            {selectedReport === 'ERP_FAILURES' && 'SAP S/4HANA ERP Posting Failure & Retry Log'}
            {selectedReport === 'PAID_OUTSTANDING' && 'Disbursed vs In-Flight Outstanding Summary'}
            {selectedReport === 'CREDIT_DEBIT_NOTES' && 'Credit & Debit Note Financial Adjustments'}
          </div>
          <span className="text-xs text-slate-400 font-mono">As of {new Date().toISOString().split('T')[0]}</span>
        </div>

        {/* Dynamic Aggregated Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Dimension / Metric</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-center">Volume / Cases</th>
                <th className="py-2.5 px-3 text-right">Gross Fee (₹)</th>
                <th className="py-2.5 px-3 text-right">Tax (GST) (₹)</th>
                <th className="py-2.5 px-3 text-right">TDS (194J) (₹)</th>
                <th className="py-2.5 px-3 text-right">Net Payable (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{b.vendorName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{b.serviceType}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">1 Case ({b.caseId})</td>
                  <td className="py-2.5 px-3 text-right text-slate-800">₹{b.subtotalProfessionalFee.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">₹{b.taxDetails.totalTax.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700">-₹{b.tdsDetails.tdsAmount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-800">₹{b.netPayable.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
