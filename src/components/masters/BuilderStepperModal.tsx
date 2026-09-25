import React, { useState, useEffect } from 'react';
import { BuilderMaster, UserAccount, PromoterItem, FinancialYearRow, BankingRelationshipRow } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { DuplicateAlertModal } from './DuplicateAlertModal';
import {
  X,
  Building2,
  Users,
  TrendingUp,
  Landmark,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface BuilderStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  editBuilder?: BuilderMaster | null;
  onSaved: (builder: BuilderMaster) => void;
}

export const BuilderStepperModal: React.FC<BuilderStepperModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  editBuilder,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Basic Details & KYC
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [entityType, setEntityType] = useState<'Private Limited' | 'Public Limited' | 'LLP' | 'Partnership' | 'Sole Proprietorship'>('Public Limited');
  const [incorporationDate, setIncorporationDate] = useState('2005-04-15');
  const [yearsInBusiness, setYearsInBusiness] = useState(21);
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [corporateAddress, setCorporateAddress] = useState('');
  const [city, setCity] = useState<'Pune' | 'Mumbai'>('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('411001');
  const [country, setCountry] = useState('India');
  const [website, setWebsite] = useState('https://');
  const [isListed, setIsListed] = useState(true);
  const [stockSymbol, setStockSymbol] = useState('');

  // Reg & KYC
  const [pan, setPan] = useState('');
  const [cin, setCin] = useState('');
  const [gst, setGst] = useState('');
  const [reraPromoterRegNo, setReraPromoterRegNo] = useState('');
  const [lei, setLei] = useState('');
  const [udyamMsme, setUdyamMsme] = useState('');
  const [kycVerificationStatus, setKycVerificationStatus] = useState<'Verified' | 'Pending' | 'Rejected'>('Verified');

  // Contacts
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactDesignation, setPrimaryContactDesignation] = useState('Managing Director');
  const [primaryContactMobile, setPrimaryContactMobile] = useState('');
  const [primaryContactEmail, setPrimaryContactEmail] = useState('');
  const [financeContact, setFinanceContact] = useState('');
  const [legalContact, setLegalContact] = useState('');

  // Promoters
  const [promoters, setPromoters] = useState<PromoterItem[]>([
    {
      id: '1',
      name: 'Promoter / Managing Director',
      din: '00192831',
      pan: 'AABCP1092K',
      designation: 'Managing Director & Promoter',
      shareholdingPct: 42.5,
      netWorthCr: 150.0,
      experienceYears: 22,
      relatedEntity: 'Group Holdings Ltd',
      status: 'Active',
    },
  ]);

  // Profile
  const [totalProjectsCompleted, setTotalProjectsCompleted] = useState(12);
  const [totalOngoingProjects, setTotalOngoingProjects] = useState(4);
  const [deliveredAreaMnSqFt, setDeliveredAreaMnSqFt] = useState(8.5);

  // Financials
  const [financials, setFinancials] = useState<FinancialYearRow[]>([
    {
      fy: 'FY 2024-25',
      turnoverCr: 1250.0,
      ebitdaCr: 280.0,
      patCr: 145.0,
      netWorthCr: 980.0,
      totalDebtCr: 420.0,
      securedDebtCr: 360.0,
      unsecuredDebtCr: 60.0,
      currentRatio: 1.82,
      debtEquityRatio: 0.43,
      dscr: 2.1,
      auditorName: 'KPMG India',
      hasAuditQualification: false,
    },
  ]);

  // Banking
  const [banking, setBanking] = useState<BankingRelationshipRow[]>([
    {
      id: '1',
      lender: 'Proval Bank',
      facilityType: 'Term Loan',
      sanctionedAmountCr: 75.0,
      outstandingAmountCr: 42.5,
      security: 'First pari-passu charge on project cashflows and land',
      startDate: '2023-06-15',
      maturityDate: '2028-06-15',
      source: 'Bank Direct',
      asOfDate: '2026-09-15',
    },
  ]);

  // Risk & Compliance
  const [internalRiskGrade, setInternalRiskGrade] = useState<'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'BBB' | 'Below Investment Grade'>('A+');
  const [creditBureauStatus, setCreditBureauStatus] = useState<'Clean' | 'Minor Delinquency' | 'SMA-0' | 'SMA-1' | 'SMA-2' | 'Defaulter'>('Clean');
  const [wilfulDefaulterFlag, setWilfulDefaulterFlag] = useState(false);
  const [npaSmaIndicator, setNpaSmaIndicator] = useState(false);
  const [ncltIndicator, setNcltIndicator] = useState(false);
  const [litigationIndicator, setLitigationIndicator] = useState(false);
  const [regulatoryActionFlag, setRegulatoryActionFlag] = useState(false);
  const [blacklistFlag, setBlacklistFlag] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [riskRemarks, setRiskRemarks] = useState('Satisfactory operational track record in western region.');

  // Documents
  const [docChecks, setDocChecks] = useState({
    panVerified: true,
    cinVerified: true,
    gstVerified: true,
    reraVerified: true,
    auditedFinancialsUploaded: true,
    groupStructureChartUploaded: true,
    promoterKycUploaded: true,
  });

  // Edit reason
  const [editReason, setEditReason] = useState('');

  // Duplicate Check Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [duplicateField, setDuplicateField] = useState('');
  const [duplicateRecordId, setDuplicateRecordId] = useState('');
  const [duplicateRecordName, setDuplicateRecordName] = useState('');

  // Initialize form when opened or editBuilder changes
  useEffect(() => {
    if (editBuilder) {
      setLegalName(editBuilder.legalName || '');
      setTradeName(editBuilder.tradeName || '');
      setGroupName(editBuilder.groupName || '');
      setEntityType(editBuilder.entityType || 'Public Limited');
      setIncorporationDate(editBuilder.incorporationDate || '2010-01-01');
      setYearsInBusiness(editBuilder.yearsInBusiness || 15);
      setRegisteredAddress(editBuilder.registeredAddress || '');
      setCorporateAddress(editBuilder.corporateAddress || '');
      setCity(editBuilder.city || 'Pune');
      setState(editBuilder.state || 'Maharashtra');
      setPincode(editBuilder.pincode || '411001');
      setWebsite(editBuilder.website || 'https://');
      setIsListed(!!editBuilder.isListed);
      setStockSymbol(editBuilder.stockSymbol || '');
      setPan(editBuilder.pan || '');
      setCin(editBuilder.cin || '');
      setGst(editBuilder.gst || '');
      setReraPromoterRegNo(editBuilder.reraPromoterRegNo || '');
      setLei(editBuilder.lei || '');
      setUdyamMsme(editBuilder.udyamMsme || '');
      setKycVerificationStatus(editBuilder.kycVerificationStatus || 'Verified');
      setPrimaryContactName(editBuilder.primaryContactName || '');
      setPrimaryContactDesignation(editBuilder.primaryContactDesignation || 'Managing Director');
      setPrimaryContactMobile(editBuilder.primaryContactMobile || '');
      setPrimaryContactEmail(editBuilder.primaryContactEmail || '');
      setFinanceContact(editBuilder.financeContact || '');
      setLegalContact(editBuilder.legalContact || '');
      setTotalProjectsCompleted(editBuilder.totalProjectsCompleted || 0);
      setTotalOngoingProjects(editBuilder.totalOngoingProjects || 0);
      setDeliveredAreaMnSqFt(editBuilder.deliveredAreaMnSqFt || 5.0);
      if (editBuilder.promoterList?.length) {
        setPromoters(editBuilder.promoterList);
      }
      if (editBuilder.financialHistory?.length) {
        setFinancials(editBuilder.financialHistory);
      }
      if (editBuilder.bankingRelationships?.length) {
        setBanking(editBuilder.bankingRelationships);
      }
      setInternalRiskGrade(editBuilder.internalRiskGrade || 'A+');
      setCreditBureauStatus(editBuilder.creditBureauStatus || 'Clean');
      setWilfulDefaulterFlag(!!editBuilder.wilfulDefaulterFlag);
      setNpaSmaIndicator(!!editBuilder.npaSmaIndicator);
      setNcltIndicator(!!editBuilder.ncltIndicator);
      setLitigationIndicator(!!editBuilder.litigationIndicator);
      setRegulatoryActionFlag(!!editBuilder.regulatoryActionFlag);
      setBlacklistFlag(!!editBuilder.blacklistFlag);
      setBlacklistReason(editBuilder.blacklistReason || '');
      setRiskRemarks(editBuilder.riskRemarks || '');
      if (editBuilder.documentChecklist) {
        setDocChecks(editBuilder.documentChecklist);
      }
      setEditReason('Annual master data refresh & KYC updates');
    } else {
      // Defaults for brand new builder
      setLegalName('');
      setTradeName('');
      setGroupName('');
      setPan('');
      setCin('');
      setGst('');
      setPrimaryContactName('');
      setPrimaryContactMobile('');
      setPrimaryContactEmail('');
      setRegisteredAddress('Suite 400, Corporate Gateway, Bandra-Kurla Complex');
      setCorporateAddress('Suite 400, Corporate Gateway, Bandra-Kurla Complex');
    }
    setCurrentStep(1);
  }, [editBuilder, isOpen]);

  if (!isOpen) return null;

  // Promoters handlers
  const handleAddPromoter = () => {
    setPromoters([
      ...promoters,
      {
        id: String(Date.now()),
        name: '',
        din: '',
        pan: '',
        designation: 'Director',
        shareholdingPct: 10.0,
        netWorthCr: 50.0,
        experienceYears: 15,
        relatedEntity: '',
        status: 'Active',
      },
    ]);
  };

  const handleRemovePromoter = (id: string) => {
    if (promoters.length > 1) {
      setPromoters(promoters.filter((p) => p.id !== id));
    }
  };

  // Financials handlers
  const handleAddFinancial = () => {
    setFinancials([
      ...financials,
      {
        fy: `FY 202${3 - financials.length}-2${4 - financials.length}`,
        turnoverCr: 1000.0,
        ebitdaCr: 200.0,
        patCr: 110.0,
        netWorthCr: 850.0,
        totalDebtCr: 350.0,
        securedDebtCr: 300.0,
        unsecuredDebtCr: 50.0,
        currentRatio: 1.7,
        debtEquityRatio: 0.41,
        dscr: 2.0,
        auditorName: 'Statutory Auditor LLP',
        hasAuditQualification: false,
      },
    ]);
  };

  // Banking handlers
  const handleAddBanking = () => {
    setBanking([
      ...banking,
      {
        id: String(Date.now()),
        lender: 'State Bank of India',
        facilityType: 'Construction Finance',
        sanctionedAmountCr: 50.0,
        outstandingAmountCr: 32.0,
        security: 'Exclusive charge on unsold residential units',
        startDate: '2023-01-01',
        maturityDate: '2027-12-31',
        source: 'MCA Charges',
        asOfDate: '2026-09-01',
      },
    ]);
  };

  // Save Submission
  const handleSubmit = (overrideReason?: string) => {
    // Validation
    if (!legalName.trim() || !pan.trim() || !cin.trim() || !gst.trim()) {
      alert('Please fill in mandatory fields: Legal Name, PAN, CIN, and GSTIN.');
      setCurrentStep(1);
      return;
    }

    // If new builder, check duplicates
    if (!editBuilder && !overrideReason) {
      const dupCheck = masterStore.checkDuplicateBuilder(pan, cin, gst, legalName);
      if (dupCheck.isDuplicate && dupCheck.existingBuilder) {
        setDuplicateMessage(dupCheck.message || 'Duplicate identified.');
        setDuplicateField(dupCheck.matchingField || 'Identity Field');
        setDuplicateRecordId(dupCheck.existingBuilder.id);
        setDuplicateRecordName(dupCheck.existingBuilder.legalName);
        setDuplicateModalOpen(true);
        return;
      }
    }

    const payload: Partial<BuilderMaster> = {
      legalName: legalName.trim(),
      tradeName: tradeName.trim() || legalName.trim(),
      groupName: groupName.trim() || `${legalName.trim()} Group`,
      entityType,
      incorporationDate,
      yearsInBusiness: Number(yearsInBusiness) || 10,
      registeredAddress,
      corporateAddress,
      city,
      state,
      pincode,
      country,
      website,
      isListed,
      stockSymbol,
      pan: pan.trim().toUpperCase(),
      cin: cin.trim().toUpperCase(),
      gst: gst.trim().toUpperCase(),
      reraPromoterRegNo,
      lei,
      udyamMsme,
      kycVerificationStatus,
      kycVerifiedDate: '2026-09-20',
      primaryContactName,
      primaryContactDesignation,
      primaryContactMobile,
      primaryContactEmail,
      financeContact,
      legalContact,
      promoters: promoters.map((p) => p.name || 'Promoter'),
      promoterList: promoters,
      totalProjectsCompleted: Number(totalProjectsCompleted) || 0,
      totalOngoingProjects: Number(totalOngoingProjects) || 1,
      deliveredAreaMnSqFt: Number(deliveredAreaMnSqFt) || 5.0,
      financialHistory: financials,
      bankingRelationships: banking,
      internalRiskGrade,
      creditBureauStatus,
      wilfulDefaulterFlag,
      npaSmaIndicator,
      ncltIndicator,
      litigationIndicator,
      regulatoryActionFlag,
      blacklistFlag,
      blacklistReason,
      riskRemarks,
      documentChecklist: docChecks,
    };

    if (editBuilder) {
      const saved = masterStore.updateBuilder(
        editBuilder.id,
        payload,
        currentUser,
        editReason || 'Updated builder master via UI'
      );
      onSaved(saved);
    } else {
      const created = masterStore.addBuilder(payload, currentUser, overrideReason);
      onSaved(created);
    }

    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Basic & KYC', icon: Building2 },
    { num: 2, label: 'Promoters', icon: Users },
    { num: 3, label: 'Financials', icon: TrendingUp },
    { num: 4, label: 'Banking', icon: Landmark },
    { num: 5, label: 'Risk & Bureau', icon: ShieldCheck },
    { num: 6, label: 'Documents', icon: FileCheck2 },
    { num: 7, label: 'Review & Submit', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-900/70 text-[#8bb3cb]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {editBuilder ? `Edit Builder: ${editBuilder.legalName}` : 'Add New Builder Master'}
                </h2>
                {editBuilder && (
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-800 text-sky-200 font-mono">
                    {editBuilder.id} • v{editBuilder.version}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8bb3cb]">
                Central Enterprise Master • Maker-Checker & Duplicate Governed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {stepsList.map((st) => {
              const Icon = st.icon;
              const isActive = currentStep === st.num;
              const isDone = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0c3148] text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>
                    {st.num}. {st.label}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-slate-500 ml-4 hidden sm:block">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Basic & KYC */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal Entity Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Kolte-Patil Developers Ltd"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Brand Name</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="e.g. Kolte-Patil"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Kolte-Patil Group"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entity Type</label>
                  <select
                    value={entityType}
                    onChange={(e: any) => setEntityType(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
                  >
                    <option value="Public Limited">Public Limited</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hub City</label>
                  <select
                    value={city}
                    onChange={(e: any) => setCity(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              {/* KYC Numbers */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Statutory Registrations & Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PAN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="AAACB1234D"
                      maxLength={10}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CIN / LLPIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cin}
                      onChange={(e) => setCin(e.target.value.toUpperCase())}
                      placeholder="L45200MH1991PLC061111"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GSTIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={gst}
                      onChange={(e) => setGst(e.target.value.toUpperCase())}
                      placeholder="27AAACB1234D1Z5"
                      maxLength={15}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      MahaRERA Promoter Reg No
                    </label>
                    <input
                      type="text"
                      value={reraPromoterRegNo}
                      onChange={(e) => setReraPromoterRegNo(e.target.value)}
                      placeholder="e.g. PRM-MH-PUN-0091"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LEI Code (RBI &gt; ₹50 Cr)</label>
                    <input
                      type="text"
                      value={lei}
                      onChange={(e) => setLei(e.target.value)}
                      placeholder="e.g. 335800AAACB1234D19"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Listed Company?</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={isListed}
                          onChange={(e) => setIsListed(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span>Public Listed (BSE / NSE)</span>
                      </label>
                      {isListed && (
                        <input
                          type="text"
                          value={stockSymbol}
                          onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                          placeholder="Ticker: KOLTEPATIL"
                          className="p-1 px-2 text-xs rounded border border-slate-300 font-mono uppercase w-32"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Address</label>
                  <textarea
                    rows={2}
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="Registered Office as per MCA..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate HQ Address</label>
                  <textarea
                    rows={2}
                    value={corporateAddress}
                    onChange={(e) => setCorporateAddress(e.target.value)}
                    placeholder="Corporate Headquarters Address..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Primary Contact */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Key Executive Name</label>
                  <input
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="Managing Director Name"
                    className="w-full p-2 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Designation</label>
                  <input
                    type="text"
                    value={primaryContactDesignation}
                    onChange={(e) => setPrimaryContactDesignation(e.target.value)}
                    className="w-full p-2 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Direct Mobile</label>
                  <input
                    type="text"
                    value={primaryContactMobile}
                    onChange={(e) => setPrimaryContactMobile(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full p-2 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    placeholder="md@builder.com"
                    className="w-full p-2 text-xs rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Promoters */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Promoters & Key Executive Directors</h3>
                  <p className="text-xs text-slate-500">
                    Maintain board composition, equity stakes, and individual net worth declarations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPromoter}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Promoter / Director
                </button>
              </div>

              <div className="space-y-3">
                {promoters.map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Director #{idx + 1}</span>
                      {promoters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePromoter(p.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].name = e.target.value;
                            setPromoters(updated);
                          }}
                          placeholder="Director Name"
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">DIN (Director ID)</label>
                        <input
                          type="text"
                          value={p.din}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].din = e.target.value;
                            setPromoters(updated);
                          }}
                          placeholder="00192831"
                          className="w-full p-2 rounded border border-slate-300 font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Individual PAN</label>
                        <input
                          type="text"
                          value={p.pan}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].pan = e.target.value.toUpperCase();
                            setPromoters(updated);
                          }}
                          placeholder="AABCP1234D"
                          className="w-full p-2 rounded border border-slate-300 font-mono uppercase bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Designation</label>
                        <input
                          type="text"
                          value={p.designation}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].designation = e.target.value;
                            setPromoters(updated);
                          }}
                          placeholder="Managing Director"
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Equity Holding %</label>
                        <input
                          type="number"
                          value={p.shareholdingPct}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].shareholdingPct = Number(e.target.value);
                            setPromoters(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Net Worth (₹ Cr)</label>
                        <input
                          type="number"
                          value={p.netWorthCr}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].netWorthCr = Number(e.target.value);
                            setPromoters(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          value={p.experienceYears}
                          onChange={(e) => {
                            const updated = [...promoters];
                            updated[idx].experienceYears = Number(e.target.value);
                            setPromoters(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Status</label>
                        <select
                          value={p.status}
                          onChange={(e: any) => {
                            const updated = [...promoters];
                            updated[idx].status = e.target.value;
                            setPromoters(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Resigned">Resigned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Financials */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Audited Financial Track Record (Yearly)</h3>
                  <p className="text-xs text-slate-500">
                    Annual turnover, leverage parameters, EBITDA, and statutory audit compliance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFinancial}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Financial Year
                </button>
              </div>

              <div className="space-y-3">
                {financials.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{f.fy}</span>
                      <span className="text-[11px] text-slate-500">Auditor: {f.auditorName}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Revenue / Turnover (₹ Cr)</label>
                        <input
                          type="number"
                          value={f.turnoverCr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].turnoverCr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">EBITDA (₹ Cr)</label>
                        <input
                          type="number"
                          value={f.ebitdaCr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].ebitdaCr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">PAT (₹ Cr)</label>
                        <input
                          type="number"
                          value={f.patCr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].patCr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Net Worth (₹ Cr)</label>
                        <input
                          type="number"
                          value={f.netWorthCr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].netWorthCr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Total Debt (₹ Cr)</label>
                        <input
                          type="number"
                          value={f.totalDebtCr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].totalDebtCr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Debt / Equity Ratio</label>
                        <input
                          type="number"
                          step="0.01"
                          value={f.debtEquityRatio}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].debtEquityRatio = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">DSCR</label>
                        <input
                          type="number"
                          step="0.05"
                          value={f.dscr}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].dscr = Number(e.target.value);
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Audit Qualification?</label>
                        <select
                          value={f.hasAuditQualification ? 'Yes' : 'No'}
                          onChange={(e) => {
                            const updated = [...financials];
                            updated[idx].hasAuditQualification = e.target.value === 'Yes';
                            setFinancials(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="No">No (Clean Report)</option>
                          <option value="Yes">Yes (Qualified)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Banking Relationships */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Lender Banking Facilities & Encumbrances</h3>
                  <p className="text-xs text-slate-500">
                    Existing commercial facilities, project loans, and MCA charge registrations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBanking}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Banking Facility
                </button>
              </div>

              <div className="space-y-3">
                {banking.map((b, idx) => (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Lender / Institution</label>
                        <input
                          type="text"
                          value={b.lender}
                          onChange={(e) => {
                            const updated = [...banking];
                            updated[idx].lender = e.target.value;
                            setBanking(updated);
                          }}
                          placeholder="e.g. Proval Bank"
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Facility Type</label>
                        <select
                          value={b.facilityType}
                          onChange={(e: any) => {
                            const updated = [...banking];
                            updated[idx].facilityType = e.target.value;
                            setBanking(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        >
                          <option value="Term Loan">Term Loan</option>
                          <option value="Construction Finance">Construction Finance</option>
                          <option value="Working Capital">Working Capital</option>
                          <option value="Overdraft">Overdraft</option>
                          <option value="NCD">NCD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Sanctioned (₹ Cr)</label>
                        <input
                          type="number"
                          value={b.sanctionedAmountCr}
                          onChange={(e) => {
                            const updated = [...banking];
                            updated[idx].sanctionedAmountCr = Number(e.target.value);
                            setBanking(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Outstanding (₹ Cr)</label>
                        <input
                          type="number"
                          value={b.outstandingAmountCr}
                          onChange={(e) => {
                            const updated = [...banking];
                            updated[idx].outstandingAmountCr = Number(e.target.value);
                            setBanking(updated);
                          }}
                          className="w-full p-2 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Security / Charge Description</label>
                      <input
                        type="text"
                        value={b.security}
                        onChange={(e) => {
                          const updated = [...banking];
                          updated[idx].security = e.target.value;
                          setBanking(updated);
                        }}
                        placeholder="e.g. Pari-passu first charge on project land and escrow receivables"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Risk & Bureau */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Risk, Credit Bureau & Regulatory Flags</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Internal Risk Grade</label>
                  <select
                    value={internalRiskGrade}
                    onChange={(e: any) => setInternalRiskGrade(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="AAA">AAA (Extremely Low Risk)</option>
                    <option value="AA+">AA+ (Superior Quality)</option>
                    <option value="AA">AA (Very High Safety)</option>
                    <option value="AA-">AA- (High Safety)</option>
                    <option value="A+">A+ (Strong Operational Resilience)</option>
                    <option value="A">A (Adequate Safety)</option>
                    <option value="BBB">BBB (Moderate Risk)</option>
                    <option value="Below Investment Grade">Below Investment Grade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit Bureau / CIBIL Commercial</label>
                  <select
                    value={creditBureauStatus}
                    onChange={(e: any) => setCreditBureauStatus(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Clean">Clean (No Delinquencies)</option>
                    <option value="Minor Delinquency">Minor Technical Delay (&lt;30 days)</option>
                    <option value="SMA-0">SMA-0 (1-30 days overdue)</option>
                    <option value="SMA-1">SMA-1 (31-60 days overdue)</option>
                    <option value="SMA-2">SMA-2 (61-90 days overdue)</option>
                    <option value="Defaulter">NPA / Defaulter</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Mandatory Governance & Litigation Checks
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={wilfulDefaulterFlag}
                      onChange={(e) => setWilfulDefaulterFlag(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-medium text-slate-700">RBI Wilful Defaulter</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={npaSmaIndicator}
                      onChange={(e) => setNpaSmaIndicator(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">CRILC SMA / NPA Flag</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={ncltIndicator}
                      onChange={(e) => setNcltIndicator(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-medium text-slate-700">IBC / NCLT Proceedings</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={litigationIndicator}
                      onChange={(e) => setLitigationIndicator(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">High-Court Litigation</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={regulatoryActionFlag}
                      onChange={(e) => setRegulatoryActionFlag(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-medium text-slate-700">MahaRERA Regulatory Action</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                    <input
                      type="checkbox"
                      checked={blacklistFlag}
                      onChange={(e) => setBlacklistFlag(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-medium text-slate-700">Negative / Blacklist Flag</span>
                  </label>
                </div>

                {blacklistFlag && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-rose-700 mb-1">
                      Blacklist Justification / Negative Reason <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={blacklistReason}
                      onChange={(e) => setBlacklistReason(e.target.value)}
                      placeholder="Specify cause for blacklisting or caution advisory..."
                      className="w-full p-2 text-xs rounded border border-rose-300 bg-rose-50/50 text-rose-900"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Risk Underwriting Remarks</label>
                <textarea
                  rows={2}
                  value={riskRemarks}
                  onChange={(e) => setRiskRemarks(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Documents & KYC Verification */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Master Document Verification Checklist</h3>
              <p className="text-xs text-slate-500">
                Confirm receipt and verification of original certified documents prior to maker-checker submission
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                {Object.entries(docChecks).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    panVerified: 'Permanent Account Number (PAN) Card Verified against NSDL',
                    cinVerified: 'Certificate of Incorporation & MCA Master Data Verified',
                    gstVerified: 'GSTIN Registration Certificate Verified on GST Portal',
                    reraVerified: 'MahaRERA Promoter Certificate & Project Listing Validated',
                    auditedFinancialsUploaded: 'Audited Financial Statements for last 2 FYs with Notes',
                    groupStructureChartUploaded: 'Certified Group Corporate Chart with Beneficial Ownership',
                    promoterKycUploaded: 'Promoters / Directors KYC (PAN + Aadhaar/Passport)',
                  };
                  return (
                    <label key={key} className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setDocChecks({ ...docChecks, [key]: e.target.checked })}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="font-medium text-slate-700">{labels[key] || key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs">
                <div className="flex items-center justify-between font-bold text-sm mb-1 text-sky-950">
                  <span>{legalName || 'Developer Legal Name'}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-800 font-mono text-xs">
                    {city} • {internalRiskGrade} Risk Grade
                  </span>
                </div>
                <p className="text-sky-800">
                  PAN: <span className="font-mono font-bold">{pan || 'N/A'}</span> • CIN:{' '}
                  <span className="font-mono font-bold">{cin || 'N/A'}</span> • GSTIN:{' '}
                  <span className="font-mono font-bold">{gst || 'N/A'}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Promoters</span>
                    <span className="font-bold text-slate-800">{promoters.length} Registered</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Financial Years</span>
                    <span className="font-bold text-slate-800">{financials.length} Recorded</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lenders</span>
                    <span className="font-bold text-slate-800">{banking.length} Active Facilities</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bureau Status</span>
                    <span className="font-bold text-emerald-700">{creditBureauStatus}</span>
                  </div>
                </div>
              </div>

              {/* Maker-Checker notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Maker-Checker Policy Enforcement:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {masterStore.isMakerCheckerEnabled()
                      ? currentUser.role === 'CPA'
                        ? 'As a CPA (Maker), this record will be submitted in "PENDING_MASTER_APPROVAL" status. A COM or Admin Checker must review and approve it before it becomes active for APF dockets.'
                        : 'As an Admin/COM, this master record will be directly approved and activated immediately.'
                      : 'Maker-Checker enforcement is currently toggled OFF. Record will be immediately APPROVED and ACTIVE.'}
                  </p>
                </div>
              </div>

              {editBuilder && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Log Reason for Changes <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Added new banking relationship and updated FY 2024-25 financials"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="px-5 py-2 rounded-lg bg-[#0c3148] text-white text-xs font-bold hover:bg-[#15496b] shadow-xs flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {editBuilder ? 'Save Modifications' : 'Submit Builder Master'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="POSSIBLE DUPLICATE BUILDER DETECTED"
        message={duplicateMessage}
        matchingField={duplicateField}
        existingRecordId={duplicateRecordId}
        existingRecordName={duplicateRecordName}
        onContinueWithOverride={(reason) => {
          setDuplicateModalOpen(false);
          handleSubmit(reason);
        }}
      />
    </div>
  );
};
