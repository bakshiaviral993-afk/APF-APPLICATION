import React, { useState } from 'react';
import { VendorBillingProfile, VendorType } from '../../types/billingTypes';
import { billingStore } from '../../services/billingStore';
import { X, Building2, Save, AlertCircle, ShieldCheck } from 'lucide-react';

interface VendorProfileModalProps {
  profile?: VendorBillingProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VendorProfileModal: React.FC<VendorProfileModalProps> = ({
  profile,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!profile;
  const rateCards = billingStore.getRateCards();

  const [vendorType, setVendorType] = useState<VendorType>(
    profile?.vendorType || 'EXTERNAL_VALUER'
  );
  const [legalName, setLegalName] = useState(profile?.legalName || '');
  const [tradeName, setTradeName] = useState(profile?.tradeName || '');
  const [pan, setPan] = useState(profile?.pan || '');
  const [gstin, setGstin] = useState(profile?.gstin || '');
  const [cin, setCin] = useState(profile?.cin || '');
  const [empanelmentNo, setEmpanelmentNo] = useState(profile?.empanelmentNo || '');
  const [empanelmentValidity, setEmpanelmentValidity] = useState(
    profile?.empanelmentValidity || '2028-12-31'
  );
  const [registeredAddress, setRegisteredAddress] = useState(profile?.registeredAddress || '');
  const [billingAddress, setBillingAddress] = useState(profile?.billingAddress || '');
  const [state, setState] = useState(profile?.state || 'Maharashtra');
  const [stateCode, setStateCode] = useState(profile?.stateCode || '27');
  const [pin, setPin] = useState(profile?.pin || '411016');

  // Bank
  const [accountHolder, setAccountHolder] = useState(
    profile?.bankAccount?.accountHolder || ''
  );
  const [bankName, setBankName] = useState(profile?.bankAccount?.bankName || 'HDFC Bank Ltd');
  const [branch, setBranch] = useState(profile?.bankAccount?.branch || 'Pune Central');
  const [accountNo, setAccountNo] = useState(profile?.bankAccount?.accountNo || '');
  const [ifsc, setIfsc] = useState(profile?.bankAccount?.ifsc || 'HDFC0000007');

  // Tax/Compliance
  const [gstRegistered, setGstRegistered] = useState(profile?.gstRegistered ?? true);
  const [panVerified, setPanVerified] = useState(profile?.panVerified ?? true);
  const [isMsme, setIsMsme] = useState(profile?.isMsme ?? false);
  const [udyamNo, setUdyamNo] = useState(profile?.udyamNo || '');
  const [tdsCategory, setTdsCategory] = useState(
    profile?.tdsCategory || '194J - Professional & Technical Fees'
  );
  const [tdsRatePct, setTdsRatePct] = useState<number>(profile?.tdsRatePct || 10);
  const [irnRequired, setIrnRequired] = useState(profile?.irnRequired ?? true);
  const [rateCardId, setRateCardId] = useState(
    profile?.rateCardId || (vendorType === 'EXTERNAL_VALUER' ? 'RC-VAL-001' : 'RC-LEG-001')
  );
  const [approvalThreshold, setApprovalThreshold] = useState<number>(
    profile?.approvalThreshold || 75000
  );
  const [complianceStatus, setComplianceStatus] = useState<any>(
    profile?.vendorComplianceStatus || 'COMPLIANT'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim() || !pan.trim()) {
      setErrorMsg('Vendor Legal Name and PAN are mandatory.');
      return;
    }

    try {
      const payload: VendorBillingProfile = {
        id: profile?.id || `VND-${vendorType === 'EXTERNAL_VALUER' ? 'VAL' : 'LEG'}-${Date.now().toString().slice(-3)}`,
        vendorType,
        legalName: legalName.trim(),
        tradeName: tradeName.trim() || legalName.trim(),
        pan: pan.trim().toUpperCase(),
        gstin: gstin.trim().toUpperCase(),
        cin: cin.trim() || undefined,
        empanelmentNo: empanelmentNo.trim() || `EMP/${vendorType}/${Date.now().toString().slice(-4)}`,
        empanelmentValidity,
        registeredAddress: registeredAddress.trim() || 'Head Office Address',
        billingAddress: billingAddress.trim() || registeredAddress.trim(),
        state,
        stateCode,
        pin,
        bankAccount: {
          accountHolder: accountHolder.trim() || legalName.trim(),
          bankName,
          branch,
          accountNo: accountNo.trim() || '50200012345678',
          ifsc: ifsc.trim().toUpperCase(),
          isVerified: true,
          verifiedAt: new Date().toISOString().split('T')[0],
        },
        gstRegistered,
        gstRegistrationType: gstRegistered ? 'Regular' : 'Unregistered',
        panVerified,
        isMsme,
        udyamNo: isMsme ? udyamNo.trim() || 'UDYAM-MH-26-001' : undefined,
        tdsCategory,
        tdsRuleCode: 'TDS_194J_10',
        tdsRatePct,
        hasLowerTdsCertificate: false,
        vendorComplianceStatus: complianceStatus,
        vendorInvoiceRequired: true,
        irnRequired,
        rateCardId,
        reimbursementAllowed: true,
        approvalThreshold,
        isActive: true,
      };

      billingStore.updateVendorProfile(payload);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vendor profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                {isEditing ? `Edit Vendor Profile: ${profile?.id}` : 'Create Vendor Billing Profile'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statutory PAN, GSTIN, Bank Accounts & Withholding Rules
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
              <label className="block text-slate-700 font-bold mb-1">Compliance Status</label>
              <select
                value={complianceStatus}
                onChange={(e) => setComplianceStatus(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="COMPLIANT">COMPLIANT (Active)</option>
                <option value="DOCUMENT_PENDING">DOCUMENT_PENDING</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Legal Registered Entity Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Knight Frank (India) Private Limited"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Trade / Desk Name</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="e.g. Knight Frank Valuation Desk"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Empanelment No.</label>
              <input
                type="text"
                value={empanelmentNo}
                onChange={(e) => setEmpanelmentNo(e.target.value)}
                placeholder="e.g. IBBI/VAL/APF/PN/2019/042"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Income Tax PAN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="e.g. AAACK5512L"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AAACK5512L1ZZ"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs uppercase"
              />
            </div>

            {/* Bank details */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-2">
                Bank Disbursement Account (Penny-Drop Verified)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    placeholder="e.g. 50200048192841"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    placeholder="e.g. HDFC0000007"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Contract & Threshold */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Default Rate Card</label>
              <select
                value={rateCardId}
                onChange={(e) => setRateCardId(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
              >
                {rateCards
                  .filter((r) => r.vendorType === vendorType)
                  .map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.id} - {rc.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Approval Threshold (₹) (Dual Sign-off beyond this)
              </label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(parseFloat(e.target.value) || 0)}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 font-mono text-xs"
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
              Save Vendor Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
