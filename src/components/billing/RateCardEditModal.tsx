import React, { useState } from 'react';
import { RateCardMaster, VendorType, FeeBasis } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { X, Layers, Save, AlertCircle } from 'lucide-react';

interface RateCardEditModalProps {
  rateCard?: RateCardMaster | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RateCardEditModal: React.FC<RateCardEditModalProps> = ({
  rateCard,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!rateCard;

  const [vendorType, setVendorType] = useState<VendorType>(
    rateCard?.vendorType || 'EXTERNAL_VALUER'
  );
  const [vendorCategory, setVendorCategory] = useState(
    rateCard?.vendorCategory || 'Empanelled IBBI Valuation Panel'
  );
  const [title, setTitle] = useState(rateCard?.title || '');
  const [region, setRegion] = useState(rateCard?.region || 'West - Maharashtra & Goa');
  const [state, setState] = useState(rateCard?.state || 'Maharashtra');
  const [city, setCity] = useState(rateCard?.city || 'Pune / Mumbai / MMR');
  const [serviceType, setServiceType] = useState(
    rateCard?.serviceType || 'APF Initial Technical + Valuation'
  );
  const [projectType, setProjectType] = useState(rateCard?.projectType || 'All');
  const [effectiveFrom, setEffectiveFrom] = useState(
    rateCard?.effectiveFrom || '2026-01-01'
  );
  const [effectiveTo, setEffectiveTo] = useState(rateCard?.effectiveTo || '2026-12-31');
  const [feeBasis, setFeeBasis] = useState<FeeBasis>(rateCard?.feeBasis || 'Hybrid');
  const [baseFee, setBaseFee] = useState<number>(rateCard?.baseFee || 25000);
  const [additionalTowerRate, setAdditionalTowerRate] = useState<number>(
    rateCard?.additionalTowerRate || 7500
  );
  const [additionalPhaseRate, setAdditionalPhaseRate] = useState<number>(
    rateCard?.additionalPhaseRate || 10000
  );
  const [additionalUnitRate, setAdditionalUnitRate] = useState<number>(
    rateCard?.additionalUnitRate || 150
  );
  const [additionalVisitRate, setAdditionalVisitRate] = useState<number>(
    rateCard?.additionalVisitRate || 5000
  );
  const [priorityFee, setPriorityFee] = useState<number>(rateCard?.priorityFee || 3500);
  const [travelRules, setTravelRules] = useState(
    rateCard?.travelRules || 'Up to 35km within municipal limits included; ₹12/km beyond'
  );
  const [reimbursementRules, setReimbursementRules] = useState(
    rateCard?.reimbursementRules ||
      'Actuals on outstation travel & IGR searches subject to pre-approval cap'
  );
  const [maxReimbursementCap, setMaxReimbursementCap] = useState<number>(
    rateCard?.maxReimbursementCap || 15000
  );
  const [gstRatePct, setGstRatePct] = useState<number>(rateCard?.gstRatePct || 18);
  const [tdsRatePct, setTdsRatePct] = useState<number>(rateCard?.tdsRatePct || 10);
  const [version, setVersion] = useState(rateCard?.version || 'v2026.2');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Rate Card Title is mandatory.');
      return;
    }

    try {
      const payload: RateCardMaster = {
        id: rateCard?.id || `RC-${vendorType === 'EXTERNAL_VALUER' ? 'VAL' : 'LEG'}-${Date.now().toString().slice(-4)}`,
        vendorType,
        vendorCategory,
        title: title.trim(),
        bankCode: 'BHFL-APF',
        region,
        state,
        city,
        serviceType,
        projectType,
        effectiveFrom,
        effectiveTo,
        feeBasis,
        baseFee,
        additionalTowerRate,
        additionalPhaseRate,
        additionalUnitRate,
        additionalVisitRate,
        priorityFee,
        travelRules,
        reimbursementRules,
        maxReimbursementCap,
        taxRuleCode: 'GST_18',
        gstRatePct,
        tdsRatePct,
        approvalStatus: 'APPROVED',
        version,
      };

      billingStore.updateRateCard(payload);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save rate card.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                {isEditing ? `Edit Rate Card: ${rateCard?.id}` : 'Create New Approved Rate Card'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statutory Bank Rate Card Master • Valuers & Legal Advocates
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Vendor Discipline</label>
              <select
                value={vendorType}
                onChange={(e) => setVendorType(e.target.value as VendorType)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="EXTERNAL_VALUER">External Valuer / Valuation Agency</option>
                <option value="EXTERNAL_ADVOCATE">External Legal Advocate / Law Firm</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Fee Basis</label>
              <select
                value={feeBasis}
                onChange={(e) => setFeeBasis(e.target.value as FeeBasis)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="Hybrid">Hybrid (Base + Addl Towers/Visits)</option>
                <option value="Per Project">Per Project</option>
                <option value="Per Assignment">Per Assignment</option>
                <option value="Per Tower">Per Tower</option>
                <option value="Per Phase">Per Phase</option>
                <option value="Per Unit">Per Unit</option>
                <option value="Per Visit">Per Visit</option>
                <option value="Fixed Fee">Fixed Fee</option>
                <option value="Slab Based">Slab Based</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Rate Card Schedule Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Standard APF Technical Appraisal & Valuation Rate Card"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Region / Jurisdiction</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Vendor Category / Panel</label>
              <input
                type="text"
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Base Fee (₹) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                required
                min={0}
                value={baseFee}
                onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Addl. Tower Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={additionalTowerRate}
                onChange={(e) => setAdditionalTowerRate(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Addl. Site Visit Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={additionalVisitRate}
                onChange={(e) => setAdditionalVisitRate(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Max Reimbursement Cap (₹)</label>
              <input
                type="number"
                min={0}
                value={maxReimbursementCap}
                onChange={(e) => setMaxReimbursementCap(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">GST Rate (%)</label>
              <input
                type="number"
                value={gstRatePct}
                onChange={(e) => setGstRatePct(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">TDS Withholding u/s 194J (%)</label>
              <input
                type="number"
                value={tdsRatePct}
                onChange={(e) => setTdsRatePct(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Travel & Outstation Policy</label>
              <input
                type="text"
                value={travelRules}
                onChange={(e) => setTravelRules(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Save Rate Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
