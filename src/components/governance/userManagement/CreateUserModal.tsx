import React, { useState, useMemo } from 'react';
import {
  UserAccountExtended,
  UserType,
  BusinessScope,
  RoleDefinition,
} from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  X,
  UserPlus,
  Shield,
  Building,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Layers,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onClose: () => void;
  onUserCreated: (createdUser: UserAccountExtended, requiresApproval: boolean) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUserCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State - Step 1: Basic Information
  const [staffId, setStaffId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [employeeVendorId, setEmployeeVendorId] = useState('');
  const [userType, setUserType] = useState<UserType>('INTERNAL_BANK');

  // Form State - Step 2: Organization / Vendor
  // Internal:
  const [businessUnit, setBusinessUnit] = useState('Retail Mortgages & APF Operations');
  const [department, setDepartment] = useState('Credit Processing & Underwriting (CPA)');
  const [branch, setBranch] = useState('Shivajinagar Central Operations Hub');
  const [region, setRegion] = useState('Pune');
  const [zone, setZone] = useState('West Zone');
  const [reportingManager, setReportingManager] = useState('Rajesh K. Verma (COM)');
  // External:
  const [firmName, setFirmName] = useState('');
  const [empanelmentNumber, setEmpanelmentNumber] = useState('');
  const [approvedRegion, setApprovedRegion] = useState('Pune & Mumbai MMR');
  const [serviceCategory, setServiceCategory] = useState('Category A Valuer');
  const [barCouncilNumber, setBarCouncilNumber] = useState('');

  // Form State - Step 3: Role Assignment
  const [primaryRole, setPrimaryRole] = useState('CPA');
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);

  // Form State - Step 4: Business Scope
  const [scopeLevel, setScopeLevel] = useState<'ALL_INDIA' | 'ZONE' | 'REGION' | 'CITY' | 'BRANCH' | 'VENDOR_ISOLATED'>('REGION');
  const [selectedCities, setSelectedCities] = useState<string[]>(['Pune']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['Shivajinagar Central']);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available roles from store
  const allRoles: RoleDefinition[] = userManagementStore.getRoles();

  // Segregation of Duties check
  const sodCheck = useMemo(() => {
    const rolesList = [primaryRole, ...additionalRoles];
    return userManagementStore.checkSodConflicts(rolesList);
  }, [primaryRole, additionalRoles]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!staffId.trim()) newErrors.staffId = 'Staff / User ID is required';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid corporate email is required';
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (userType === 'INTERNAL_BANK') {
      if (!department.trim()) newErrors.department = 'Department is required';
      if (!region.trim()) newErrors.region = 'Region is required';
    } else {
      if (!firmName.trim()) newErrors.firmName = 'Vendor / Law Firm Name is required';
      if (!empanelmentNumber.trim()) newErrors.empanelmentNumber = 'Empanelment number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!primaryRole) newErrors.primaryRole = 'Primary role is mandatory';

    if (sodCheck.hasCriticalConflict) {
      newErrors.sod = 'Segregation of Duties (SoD) critical conflict detected! Cannot assign mutually conflicting roles.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleToggleAdditionalRole = (roleKey: string) => {
    setAdditionalRoles((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const handleSubmit = () => {
    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
    const isInternal = userType === 'INTERNAL_BANK';

    const businessScope: BusinessScope = {
      scopeLevel: isInternal ? scopeLevel : 'VENDOR_ISOLATED',
      allIndia: isInternal && scopeLevel === 'ALL_INDIA',
      zones: isInternal ? [zone] : [],
      regions: isInternal ? [region] : [approvedRegion],
      states: ['Maharashtra'],
      cities: isInternal ? selectedCities : [region],
      branches: isInternal ? selectedBranches : [],
      businessUnits: isInternal ? [businessUnit] : [],
      products: ['Home Loan APF', 'Project Construction Finance'],
      isVendorRestricted: !isInternal,
      vendorId: !isInternal ? `VND-${firmName.slice(0, 3).toUpperCase()}-01` : undefined,
      firmName: !isInternal ? firmName : undefined,
      empanelmentNumber: !isInternal ? empanelmentNumber : undefined,
      assignedCasesOnly: !isInternal,
      approvedRegions: !isInternal ? [approvedRegion] : undefined,
      approvedServiceTypes: !isInternal ? [serviceCategory] : undefined,
    };

    const userData = {
      staffId: staffId.trim(),
      username: email.split('@')[0],
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      fullName,
      email: email.trim(),
      mobile: mobile.trim(),
      userType,
      status: 'ACTIVE' as const,
      primaryRole,
      additionalRoles,
      businessUnit: isInternal ? businessUnit : undefined,
      department: isInternal ? department : `${serviceCategory} Empaneled`,
      branch: isInternal ? branch : undefined,
      region: isInternal ? region : approvedRegion,
      zone: isInternal ? zone : undefined,
      reportingManager: isInternal ? reportingManager : undefined,
      vendorId: !isInternal ? `VND-${firmName.slice(0, 3).toUpperCase()}-01` : undefined,
      firmName: !isInternal ? firmName : undefined,
      empanelmentNumber: !isInternal ? empanelmentNumber : undefined,
      approvedServiceCategory: !isInternal ? serviceCategory : undefined,
      barCouncilNumber: !isInternal && barCouncilNumber ? barCouncilNumber : undefined,
      customOverrides: [],
      businessScope,
      security: {
        failedLoginAttempts: 0,
        maxFailedAttemptsAllowed: 5,
        isLocked: false,
        lastPasswordChangeAt: new Date().toISOString().slice(0, 10),
        passwordExpiresInDays: 90,
        forcePasswordChangeOnNextLogin: true,
        mfaEnabled: true,
        mfaMethod: 'SMS_OTP' as const,
        sessionTimeoutMinutes: 15,
      },
    };

    try {
      const result = userManagementStore.createUser(userData, {
        name: currentUser.name,
        role: currentUser.role,
      });

      onUserCreated(result.user, result.requiresApproval);
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  Step {currentStep} of 4
                </span>
                <span className="text-xs text-slate-400">Enterprise User Provisioning</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">Create Platform User</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          {[
            { num: 1, label: 'Basic Information' },
            { num: 2, label: 'Organization & Vendor' },
            { num: 3, label: 'Role Assignment & SoD' },
            { num: 4, label: 'Scope & Confirmation' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? 'bg-sky-600 text-white shadow-xs'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span
                className={`${
                  currentStep === s.num
                    ? 'text-slate-900 font-bold'
                    : currentStep > s.num
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {s.num < 4 && <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                <strong className="block">Step 1 — Basic Identification & Account Category</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Enter personnel staff credentials and select internal banking desk or external empanelled vendor firm.
                </p>
              </div>

              {/* User Type Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  User Type / Operational Entity *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'INTERNAL_BANK', label: 'Internal Bank User', desc: 'CPA, COM, Valuer, Legal, Approver' },
                    { id: 'EXTERNAL_VALUER', label: 'External Valuer', desc: 'IBBI Registered Civil Valuer' },
                    { id: 'EXTERNAL_VALUATION_AGENCY_USER', label: 'Valuation Agency User', desc: 'Empaneled Technical Agency' },
                    { id: 'EXTERNAL_LEGAL_ADVOCATE', label: 'External Legal Advocate', desc: 'High Court / Bar Empaneled' },
                    { id: 'EXTERNAL_LEGAL_FIRM_USER', label: 'External Legal Firm Staff', desc: 'Associate Attorney' },
                    { id: 'EXTERNAL_LEGAL_FIRM_ADMIN', label: 'External Legal Firm Admin', desc: 'Managing Partner / Partner' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setUserType(t.id as UserType)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        userType === t.id
                          ? 'border-sky-500 bg-sky-50/70 shadow-2xs ring-1 ring-sky-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <strong className="text-slate-900 block text-xs">{t.label}</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Staff ID / User ID *
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="e.g. STF-84912"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  {errors.staffId && <p className="text-rose-600 text-[10px] mt-1">{errors.staffId}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Employee / Vendor Badge ID
                  </label>
                  <input
                    type="text"
                    value={employeeVendorId}
                    onChange={(e) => setEmployeeVendorId(e.target.value)}
                    placeholder="e.g. EMP-9921 / VND-882"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Corporate Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firstname.lastname@bank.in"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Anand"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  {errors.firstName && <p className="text-rose-600 text-[10px] mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kumar"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Kulkarni"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  {errors.lastName && <p className="text-rose-600 text-[10px] mt-1">{errors.lastName}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Mobile Phone (MFA OTP) *
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98200 XXXXX"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  {errors.mobile && <p className="text-rose-600 text-[10px] mt-1">{errors.mobile}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Organization / Vendor Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                <strong className="block">Step 2 — Organization Structure & Empanelment Parameters</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  {userType === 'INTERNAL_BANK'
                    ? 'Map reporting hierarchy, branch office, operations desk and approval line.'
                    : 'Attach vendor empanelment reference, approved operational jurisdiction and category.'}
                </p>
              </div>

              {userType === 'INTERNAL_BANK' ? (
                /* Internal Bank Fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Business Unit</label>
                    <input
                      type="text"
                      value={businessUnit}
                      onChange={(e) => setBusinessUnit(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Department *</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                    {errors.department && <p className="text-rose-600 text-[10px] mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Location</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Region *</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                    {errors.region && <p className="text-rose-600 text-[10px] mt-1">{errors.region}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Zone</label>
                    <input
                      type="text"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* External Vendor Fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Empaneled Vendor / Legal Firm Name *
                    </label>
                    <input
                      type="text"
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      placeholder="e.g. Veritas Law Partners / Apex Engineering Valuers LLP"
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                    {errors.firmName && <p className="text-rose-600 text-[10px] mt-1">{errors.firmName}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Empanelment Number *
                    </label>
                    <input
                      type="text"
                      value={empanelmentNumber}
                      onChange={(e) => setEmpanelmentNumber(e.target.value)}
                      placeholder="e.g. EMP-VAL-2024-8841"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                    {errors.empanelmentNumber && <p className="text-rose-600 text-[10px] mt-1">{errors.empanelmentNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Approved Region Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={approvedRegion}
                      onChange={(e) => setApprovedRegion(e.target.value)}
                      placeholder="e.g. Pune Urban, PCMC, Mumbai MMR"
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Empanelment Service Category
                    </label>
                    <input
                      type="text"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      placeholder="e.g. Category A Valuer / High Court Title Search"
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Bar Council / IBBI Registration No.
                    </label>
                    <input
                      type="text"
                      value={barCouncilNumber}
                      onChange={(e) => setBarCouncilNumber(e.target.value)}
                      placeholder="e.g. MAH/4102/2012 or IBBI/RV/06/2021/11928"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Role Assignment & SoD Conflicts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                <strong className="block">Step 3 — Primary Role, Additional Roles & Segregation of Duties</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Select mandatory Primary Role and optional secondary roles. The system automatically inspects for
                  cross-desk Segregation of Duties (SoD) conflicts.
                </p>
              </div>

              {/* SoD Conflict Alert */}
              {sodCheck.conflicts.length > 0 && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    sodCheck.hasCriticalConflict
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      sodCheck.hasCriticalConflict ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                  <div>
                    <strong className="block text-xs">
                      {sodCheck.hasCriticalConflict
                        ? 'CRITICAL SoD CONFLICT DETECTED — BLOCKED'
                        : 'SoD POLICY WARNING'}
                    </strong>
                    <div className="space-y-1 mt-1 text-[11px]">
                      {sodCheck.conflicts.map((c) => (
                        <p key={c.id}>
                          • <span className="font-bold">{c.ruleCode}</span>: {c.description} —{' '}
                          <em>{c.rationale}</em>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Role Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Primary Role (Mandatory) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {allRoles.map((r) => {
                    const isSelected = primaryRole === r.roleKey;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setPrimaryRole(r.roleKey)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-400 font-bold text-sky-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{r.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          {r.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.primaryRole && (
                  <p className="text-rose-600 text-[10px] mt-1">{errors.primaryRole}</p>
                )}
              </div>

              {/* Additional Roles Multi-Select */}
              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Additional Secondary Roles (Optional Bank Policy)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allRoles
                    .filter((r) => r.roleKey !== primaryRole)
                    .map((r) => {
                      const isChecked = additionalRoles.includes(r.roleKey);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-sky-50 border-sky-300 font-bold text-sky-900'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAdditionalRole(r.roleKey)}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span>{r.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Business Scope Mapping & Final Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                <strong className="block">Step 4 — Business Scope Mapping & Access Summary</strong>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Define geographical or vendor isolation boundary. Confirm all parameters before issuing credentials.
                </p>
              </div>

              {userType === 'INTERNAL_BANK' ? (
                /* Scope level for internal user */
                <div className="space-y-3">
                  <label className="block text-slate-700 font-bold">
                    Geographical Authorization Scope
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'ALL_INDIA', label: 'All India', desc: 'Central risk & corporate view' },
                      { id: 'ZONE', label: 'Zonal Scope', desc: `${zone} across all regions` },
                      { id: 'REGION', label: 'Regional Scope', desc: `${region} Cluster` },
                      { id: 'BRANCH', label: 'Branch Scope', desc: 'Single branch files only' },
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setScopeLevel(sc.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          scopeLevel === sc.id
                            ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500 font-bold text-sky-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <strong className="block text-xs">{sc.label}</strong>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{sc.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* External vendor isolation */
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Vendor Boundary Isolation Enforced</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    External vendor users are strictly constrained to <strong>Own Vendor Firm data only</strong> and{' '}
                    <strong>specifically allocated valuation / legal task assignments</strong>. Zero access to internal
                    credit exposure caps or bank committee memos.
                  </p>
                </div>
              )}

              {/* Review Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-slate-900 block text-xs">User Provisioning Summary:</strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">User Name:</span>
                    <strong className="text-slate-800">{firstName} {lastName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Staff / User ID:</span>
                    <strong className="text-slate-800 font-mono">{staffId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Primary Role:</span>
                    <strong className="text-sky-700">{primaryRole}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Entity Type:</span>
                    <strong className="text-slate-800">{userType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department / Firm:</span>
                    <strong className="text-slate-800">
                      {userType === 'INTERNAL_BANK' ? department : firmName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Scope:</span>
                    <strong className="text-slate-800">
                      {userType === 'INTERNAL_BANK' ? `${scopeLevel} (${region})` : 'Vendor Isolated'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Maker-Checker notice */}
              {['ADMIN', 'APPROVER', 'COMMITTEE', 'BILLING_CHECKER'].includes(primaryRole) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Sensitive Role Notice: Assigning <strong>{primaryRole}</strong> will route through the{' '}
                    <strong>Admin Checker Approval Queue</strong> before full activation.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            {currentStep > 1 && <ChevronLeft className="w-4 h-4" />}
            <span>{currentStep === 1 ? 'Cancel' : 'Previous Step'}</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Provision User</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
