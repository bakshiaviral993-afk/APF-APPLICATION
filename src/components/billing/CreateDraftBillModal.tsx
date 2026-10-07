import React, { useState } from 'react';
import { BillingEvent, RateCardMaster, BillLineItem } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import {
  X,
  FileText,
  Calculator,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Send,
  Save,
  Layers,
} from 'lucide-react';

interface CreateDraftBillModalProps {
  event: BillingEvent;
  onClose: () => void;
  onSuccess: (billId: string) => void;
  currentUserName?: string;
}

export const CreateDraftBillModal: React.FC<CreateDraftBillModalProps> = ({
  event,
  onClose,
  onSuccess,
  currentUserName = 'Rohan Deshmukh (CPA)',
}) => {
  const rateCards = billingStore.getRateCards();
  const matchingRateCard =
    rateCards.find((r) => r.id === event.rateCardId) ||
    rateCards.find((r) => r.vendorType === event.vendorType) ||
    rateCards[0];

  const [selectedRateCardId, setSelectedRateCardId] = useState(matchingRateCard.id);
  const activeRateCard = rateCards.find((r) => r.id === selectedRateCardId) || matchingRateCard;

  // Initialize line items
  const [lineItems, setLineItems] = useState<BillLineItem[]>(() => {
    const items: BillLineItem[] = [];

    // Base Fee
    items.push({
      id: 'L1',
      service:
        event.vendorType === 'EXTERNAL_VALUER'
          ? `Base Technical Appraisal & Valuation (${event.serviceType})`
          : `Full APF Legal Due Diligence & Title Search (${event.serviceType})`,
      quantity: 1,
      unitRate: activeRateCard.baseFee,
      amount: activeRateCard.baseFee,
      taxCode: activeRateCard.taxRuleCode,
      remarks: `Includes initial scope under ${activeRateCard.feeBasis} schedule`,
    });

    // Additional Towers if > 1
    const towerCount = event.towerIds?.length || 1;
    if (towerCount > 2 && activeRateCard.additionalTowerRate > 0) {
      const extraTowers = towerCount - 2;
      items.push({
        id: 'L2',
        service: `Additional Tower Scope Verification (${extraTowers} towers)`,
        quantity: extraTowers,
        unitRate: activeRateCard.additionalTowerRate,
        amount: extraTowers * activeRateCard.additionalTowerRate,
        taxCode: activeRateCard.taxRuleCode,
        remarks: `Covers extra structural sanctions and unit matrices`,
      });
    }

    return items;
  });

  const [reimbursementAmount, setReimbursementAmount] = useState<number>(0);
  const [reimbursementRemarks, setReimbursementRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recalculate Totals
  const subtotalProfessional = lineItems.reduce((acc, curr) => acc + curr.amount, 0);
  const grossBeforeTax = subtotalProfessional + reimbursementAmount;
  const gstRate = activeRateCard.gstRatePct;
  const totalTax = Math.round((grossBeforeTax * gstRate) / 100);
  const grossInvoice = grossBeforeTax + totalTax;
  const tdsRate = activeRateCard.tdsRatePct;
  const tdsAmount = Math.round((subtotalProfessional * tdsRate) / 100);
  const netPayable = grossInvoice - tdsAmount;

  // Line item manipulation
  const handleItemChange = (idx: number, field: keyof BillLineItem, val: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? parseFloat(val) || 0 : updated[idx].quantity;
      const r = field === 'unitRate' ? parseFloat(val) || 0 : updated[idx].unitRate;
      updated[idx].amount = Math.round(q * r);
    }
    setLineItems(updated);
  };

  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      {
        id: `L-${Date.now()}`,
        service: 'Additional Site Inspection / Scope Revisit',
        quantity: 1,
        unitRate: activeRateCard.additionalVisitRate || 5000,
        amount: activeRateCard.additionalVisitRate || 5000,
        taxCode: activeRateCard.taxRuleCode,
        remarks: 'Extra visit authorized by credit manager',
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleGenerate = (sendForInvoice: boolean) => {
    try {
      // Create draft bill via billing store
      const bill = billingStore.generateDraftBill(event.id, currentUserName);

      // Apply line items & active rate card snapshot
      bill.rateCardId = activeRateCard.id;
      bill.rateCardVersion = activeRateCard.version;
      bill.lineItems = [...lineItems];
      bill.subtotalProfessionalFee = subtotalProfessional;
      bill.approvedReimbursementAmount = reimbursementAmount;
      bill.grossAmountBeforeTax = grossBeforeTax;
      bill.taxDetails = {
        gstRatePct: gstRate,
        cgstAmount: Math.round(totalTax / 2),
        sgstAmount: Math.round(totalTax / 2),
        igstAmount: 0,
        totalTax,
        isInterState: false,
      };
      bill.grossInvoiceAmount = grossInvoice;
      bill.tdsDetails = {
        sectionCode: '194J',
        ratePct: tdsRate,
        tdsAmount,
      };
      bill.netPayable = netPayable;

      if (sendForInvoice) {
        bill.status = 'VENDOR_INVOICE_PENDING';
      }

      billingStore.notifyListeners();
      onSuccess(bill.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate draft bill.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                Generate Draft Bill from Rate Card
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Event: {event.id} • {event.vendorName} ({event.serviceType})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Workflow & Assignment Header Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">APF Case</span>
              <strong className="text-slate-900">{event.caseId}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Vendor Type</span>
              <span className="font-semibold">
                {event.vendorType === 'EXTERNAL_VALUER' ? 'External Valuer' : 'External Legal Counsel'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Completion Date</span>
              <span className="font-mono">{event.completionDate}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Accepted Date</span>
              <span className="font-mono text-emerald-700 font-bold">{event.acceptedDate}</span>
            </div>
          </div>

          {/* Rate Card Selector */}
          <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="block text-sky-950 font-bold text-xs">
                Select Approved Rate Card Schedule
              </label>
              <p className="text-[11px] text-slate-500">
                Determines base professional fee, additional tower rates & statutory tax rules
              </p>
            </div>
            <select
              value={selectedRateCardId}
              onChange={(e) => setSelectedRateCardId(e.target.value)}
              className="h-8 px-3 rounded-lg border border-sky-300 bg-white font-mono text-xs text-sky-900 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
            >
              {rateCards
                .filter((r) => r.vendorType === event.vendorType)
                .map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.id} - {rc.title} (Base: ₹{rc.baseFee.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Billable Service Line Items
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-8">#</th>
                  <th className="py-2 px-3">Service Scope Description</th>
                  <th className="py-2 px-3 w-20 text-center">Qty</th>
                  <th className="py-2 px-3 w-28 text-right">Unit Rate (₹)</th>
                  <th className="py-2 px-3 w-28 text-right">Amount (₹)</th>
                  <th className="py-2 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.service}
                        onChange={(e) => handleItemChange(idx, 'service', e.target.value)}
                        className="w-full h-7 px-2 border border-slate-200 rounded text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={item.remarks || ''}
                        placeholder="Remarks / scope details"
                        onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)}
                        className="w-full h-6 px-2 mt-1 border border-slate-100 rounded text-[10px] text-slate-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 h-7 px-2 border border-slate-200 rounded text-center font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={item.unitRate}
                        onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                        className="w-24 h-7 px-2 border border-slate-200 rounded text-right font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lineItems.length <= 1}
                        className="p-1 text-slate-300 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pre-Approved Reimbursement Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                Allowed Reimbursements (Government Fees, Certified Searches, Outstation Travel)
              </span>
              <span className="text-[10px] text-slate-500">
                Max Allowed Cap: ₹{activeRateCard.maxReimbursementCap.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Claimed & Approved Reimbursement Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={activeRateCard.maxReimbursementCap}
                  value={reimbursementAmount}
                  onChange={(e) => setReimbursementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Reimbursement Purpose / Receipt Ref
                </label>
                <input
                  type="text"
                  value={reimbursementRemarks}
                  onChange={(e) => setReimbursementRemarks(e.target.value)}
                  placeholder="e.g. Sub-Registrar Index-II search challan receipts"
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Financial Calculation Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1.5">
              Financial Summary & Statutory Withholding
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Professional Fee</span>
                <strong className="text-slate-900 font-mono text-sm">
                  ₹{subtotalProfessional.toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">GST ({gstRate}%)</span>
                <strong className="text-sky-800 font-mono text-sm">
                  ₹{totalTax.toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Gross Invoice</span>
                <strong className="text-slate-900 font-mono text-sm">
                  ₹{grossInvoice.toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 text-[10px] font-bold block">Net Payable to Vendor</span>
                <strong className="text-emerald-700 font-mono text-base font-black">
                  ₹{netPayable.toLocaleString()}
                </strong>
                <span className="text-[10px] text-rose-700 block font-mono">
                  -₹{tdsAmount.toLocaleString()} (TDS u/s 194J)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft Bill</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              className="px-5 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Vendor Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
