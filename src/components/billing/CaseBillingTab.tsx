import React, { useState } from 'react';
import { APFCase, UserAccount } from '../../types/apfTransaction';
import { billingStore } from '../../services/billingStore';
import { BillMaster, BillingEvent } from '../../types/billingTypes';
import { BillDetailModal } from './BillDetailModal';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { CreateDraftBillModal } from './CreateDraftBillModal';
import {
  DollarSign,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  CreditCard,
  Building2,
  Scale,
  Camera,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface CaseBillingTabProps {
  apfCase: APFCase;
  currentUser: UserAccount;
  onNavigateToBillingModule?: () => void;
}

export const CaseBillingTab: React.FC<CaseBillingTabProps> = ({
  apfCase,
  currentUser,
  onNavigateToBillingModule,
}) => {
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<BillMaster | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<BillMaster | null>(null);
  const [selectedEventForDraft, setSelectedEventForDraft] = useState<BillingEvent | null>(null);

  // Retrieve bills and events for this specific case
  const caseBills = billingStore.getBillsForCase(apfCase.id);
  const caseEvents = billingStore.getBillingEvents().filter((e) => e.caseId === apfCase.id);

  const valuerBill = caseBills.find((b) => b.vendorType === 'EXTERNAL_VALUER');
  const legalBill = caseBills.find((b) => b.vendorType === 'EXTERNAL_ADVOCATE');

  const valuerEvent = caseEvents.find((e) => e.vendorType === 'EXTERNAL_VALUER');
  const legalEvent = caseEvents.find((e) => e.vendorType === 'EXTERNAL_ADVOCATE');

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'SENT_TO_FINANCE':
      case 'PAYMENT_IN_PROCESS':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'APPROVED_FOR_PAYMENT':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'BILL_APPROVAL':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'INVOICE_SUBMITTED':
      case 'BILL_VERIFICATION':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'VENDOR_INVOICE_PENDING':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'DRAFT_BILL':
      case 'BILLING_ELIGIBLE':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'RETURNED_FOR_CORRECTION':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Overview Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Vendor Billing & Settlement Sub-Ledger
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
              {apfCase.id}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Automated billing eligibility tracking for external valuation agencies and empanelled law firms.
          </p>
        </div>

        {onNavigateToBillingModule && (
          <button
            type="button"
            onClick={onNavigateToBillingModule}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Open Central Billing Module</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid: Valuation Billing & Legal Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Valuation Billing */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-800 border border-sky-300 flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase">
                    1. External Valuer Billing
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Technical Appraisal & Site Inspection
                  </span>
                </div>
              </div>

              {valuerBill ? (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                    valuerBill.status
                  )}`}
                >
                  {valuerBill.status.replace(/_/g, ' ')}
                </span>
              ) : valuerEvent ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-300 uppercase">
                  ELIGIBLE FOR BILLING
                </span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200 uppercase">
                  PENDING SUBMISSION
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Valuation Agency
                </span>
                <div className="font-bold text-slate-900 text-xs">
                  {valuerBill?.vendorName ||
                    valuerEvent?.vendorName ||
                    apfCase.valuerAssignment?.vendorAgency ||
                    'Knight Frank (India) Private Limited'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Assignment: {valuerBill?.assignmentId || valuerEvent?.assignmentId || 'ASN-VAL-2026-001'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Report Status
                  </span>
                  <strong className="text-emerald-700">
                    {apfCase.valuationReport ? 'Submitted & Accepted' : 'In Progress'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Billing Trigger
                  </span>
                  <span className="font-semibold text-slate-800">
                    {valuerBill || valuerEvent ? 'Criteria Met ✓' : 'Awaiting CPA Acceptance'}
                  </span>
                </div>
              </div>

              {valuerBill ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Bill Docket ID:</span>
                    <strong className="font-mono text-sky-900">{valuerBill.id}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rate Card Schedule:</span>
                    <span className="font-mono text-slate-700">
                      {valuerBill.rateCardId} ({valuerBill.rateCardVersion})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tax Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {valuerBill.vendorInvoice?.invoiceNo || 'Pending Upload'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gross Invoice (w/ Tax):</span>
                    <strong className="font-mono text-slate-900">
                      ₹{valuerBill.grossInvoiceAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span className="font-bold text-emerald-900">Net Disbursed / Payable:</span>
                    <strong className="font-mono font-black text-emerald-700 text-sm">
                      ₹{valuerBill.netPayable.toLocaleString()}
                    </strong>
                  </div>
                  {valuerBill.paymentDetail && (
                    <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded">
                      UTR: <strong className="text-sky-900">{valuerBill.paymentDetail.utrNumber}</strong> • Date:{' '}
                      {valuerBill.paymentDetail.paymentDate}
                    </div>
                  )}
                </div>
              ) : valuerEvent ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                  <div className="text-[11px] text-amber-900 font-medium">
                    Technical appraisal accepted. Ready to generate draft bill from rate card{' '}
                    <strong>{valuerEvent.rateCardId}</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEventForDraft(valuerEvent)}
                    className="w-full py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Valuer Draft Bill</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px]">
                  Billing event will activate automatically once the external valuation report is accepted by CPA.
                </div>
              )}
            </div>
          </div>

          {valuerBill && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBillForDetail(valuerBill)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                View Bill Docket & Audit
              </button>
              {!valuerBill.vendorInvoice && (
                <button
                  type="button"
                  onClick={() => setSelectedBillForInvoice(valuerBill)}
                  className="px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Upload Invoice
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Legal Advocate Billing */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-800 border border-purple-300 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase">
                    2. External Legal Advocate Billing
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Full APF Title Scrutiny & 30-Year Search
                  </span>
                </div>
              </div>

              {legalBill ? (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                    legalBill.status
                  )}`}
                >
                  {legalBill.status.replace(/_/g, ' ')}
                </span>
              ) : legalEvent ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-300 uppercase">
                  ELIGIBLE FOR BILLING
                </span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200 uppercase">
                  PENDING SCRUTINY
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Empanelled Law Firm
                </span>
                <div className="font-bold text-slate-900 text-xs">
                  {legalBill?.vendorName ||
                    legalEvent?.vendorName ||
                    'Shardul Amarchand Mangaldas & Co.'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Assignment: {legalBill?.assignmentId || legalEvent?.assignmentId || 'ASN-LEG-2026-001'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Legal Review Status
                  </span>
                  <strong className="text-emerald-700">Accepted & Clear</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Billing Trigger
                  </span>
                  <span className="font-semibold text-slate-800">Criteria Met ✓</span>
                </div>
              </div>

              {legalBill ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Bill Docket ID:</span>
                    <strong className="font-mono text-sky-900">{legalBill.id}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rate Card Schedule:</span>
                    <span className="font-mono text-slate-700">
                      {legalBill.rateCardId} ({legalBill.rateCardVersion})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tax Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {legalBill.vendorInvoice?.invoiceNo || 'Pending Upload'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gross Invoice (w/ Tax):</span>
                    <strong className="font-mono text-slate-900">
                      ₹{legalBill.grossInvoiceAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span className="font-bold text-emerald-900">Net Disbursed / Payable:</span>
                    <strong className="font-mono font-black text-emerald-700 text-sm">
                      ₹{legalBill.netPayable.toLocaleString()}
                    </strong>
                  </div>
                  {legalBill.paymentDetail && (
                    <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded">
                      UTR: <strong className="text-sky-900">{legalBill.paymentDetail.utrNumber}</strong> • Date:{' '}
                      {legalBill.paymentDetail.paymentDate}
                    </div>
                  )}
                </div>
              ) : legalEvent ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                  <div className="text-[11px] text-amber-900 font-medium">
                    Legal report accepted. Ready to generate draft bill from rate card{' '}
                    <strong>{legalEvent.rateCardId}</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEventForDraft(legalEvent)}
                    className="w-full py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Advocate Draft Bill</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px]">
                  Billing event will activate automatically once the external legal due diligence report is accepted.
                </div>
              )}
            </div>
          </div>

          {legalBill && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBillForDetail(legalBill)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                View Bill Docket & Audit
              </button>
              {!legalBill.vendorInvoice && (
                <button
                  type="button"
                  onClick={() => setSelectedBillForInvoice(legalBill)}
                  className="px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Upload Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedBillForDetail && (
        <BillDetailModal
          bill={selectedBillForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedBillForDetail(null)}
          onRefresh={() => {}}
          onOpenInvoiceUpload={(b) => setSelectedBillForInvoice(b)}
        />
      )}

      {selectedBillForInvoice && (
        <InvoiceUploadModal
          bill={selectedBillForInvoice}
          onClose={() => setSelectedBillForInvoice(null)}
          currentUserName={currentUser.name}
          onSuccess={() => {
            setSelectedBillForInvoice(null);
          }}
        />
      )}

      {selectedEventForDraft && (
        <CreateDraftBillModal
          event={selectedEventForDraft}
          onClose={() => setSelectedEventForDraft(null)}
          currentUserName={currentUser.name}
          onSuccess={() => {
            setSelectedEventForDraft(null);
          }}
        />
      )}
    </div>
  );
};
