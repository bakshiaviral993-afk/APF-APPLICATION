import React, { useState, useEffect } from 'react';
import { ProjectMaster, UserAccount, BuilderMaster, StatutoryApprovalItem, ReraRegistrationItem } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { DuplicateAlertModal } from './DuplicateAlertModal';
import {
  X,
  Building,
  MapPin,
  Layers,
  FileCheck,
  Hammer,
  DollarSign,
  PieChart,
  Files,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface ProjectStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  editProject?: ProjectMaster | null;
  defaultBuilderId?: string;
  onSaved: (project: ProjectMaster) => void;
  onRequestAddBuilder?: () => void;
}

export const ProjectStepperModal: React.FC<ProjectStepperModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  editProject,
  defaultBuilderId,
  onSaved,
  onRequestAddBuilder,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Available Builders
  const [builders, setBuilders] = useState<BuilderMaster[]>([]);

  // Step 1: Project Details
  const [builderId, setBuilderId] = useState(defaultBuilderId || '');
  const [projectName, setProjectName] = useState('');
  const [marketingName, setMarketingName] = useState('');
  const [projectType, setProjectType] = useState<'Residential Township' | 'High-Rise Luxury' | 'Mid-Segment Residential' | 'Integrated Development'>('Residential Township');
  const [projectSegment, setProjectSegment] = useState<'Affordable' | 'Mid-Market' | 'Premium' | 'Ultra Luxury' | 'Commercial'>('Mid-Market');
  const [projectStatus, setProjectStatus] = useState<'Under Construction' | 'Advanced Stage' | 'Newly Launched' | 'Partially Delivered' | 'Completed'>('Under Construction');

  // Step 2: RERA & Location
  const [reraList, setReraList] = useState<string[]>(['P52100022154']);
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState<'Pune' | 'Mumbai'>('Pune');
  const [district, setDistrict] = useState('Pune');
  const [pincode, setPincode] = useState('411057');
  const [landmark, setLandmark] = useState('Near IT Park');
  const [lat, setLat] = useState(18.5912);
  const [lng, setLng] = useState(73.7389);
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(450);

  // Step 3: Land & Title
  const [surveyNumber, setSurveyNumber] = useState('Survey No. 74/1');
  const [ctsNumber, setCtsNumber] = useState('CTS 1092');
  const [plotNumber, setPlotNumber] = useState('Plot C-1');
  const [totalLandAreaAcres, setTotalLandAreaAcres] = useState(12.5);
  const [landOwnershipType, setLandOwnershipType] = useState<'Freehold' | 'Leasehold' | 'Joint Development Agreement' | 'Development Rights'>('Freehold');
  const [jointDevelopmentFlag, setJointDevelopmentFlag] = useState(false);
  const [landOwnerName, setLandOwnerName] = useState('');
  const [encumbranceFlag, setEncumbranceFlag] = useState(false);
  const [existingMortgageChargeFlag, setExistingMortgageChargeFlag] = useState(false);

  // Step 4: Size & Phases
  const [totalSanctionedTowers, setTotalSanctionedTowers] = useState(6);
  const [totalUnitsCount, setTotalUnitsCount] = useState(720);
  const [commercialUnitsCount, setCommercialUnitsCount] = useState(18);
  const [parkingCount, setParkingCount] = useState(850);
  const [initialPhaseName, setInitialPhaseName] = useState('Phase 1 (Sector R1)');

  // Step 5: Statutory Approvals
  const [approvals, setApprovals] = useState<StatutoryApprovalItem[]>([
    {
      id: '1',
      approvalType: 'Sanction Plan',
      documentNumber: 'PMRDA/BP/2022/8821',
      issueDate: '2022-03-15',
      validityDate: '2027-03-14',
      issuingAuthority: 'PMRDA / Municipal Corp',
      status: 'Approved',
    },
    {
      id: '2',
      approvalType: 'Commencement Certificate',
      documentNumber: 'CC/2022/PL-902',
      issueDate: '2022-05-20',
      validityDate: '2027-05-19',
      issuingAuthority: 'Local Planning Authority',
      status: 'Approved',
    },
    {
      id: '3',
      approvalType: 'Fire NOC',
      documentNumber: 'CFO/NOC/MH/2022/411',
      issueDate: '2022-04-11',
      validityDate: '2027-04-10',
      issuingAuthority: 'Chief Fire Officer',
      status: 'Approved',
    },
  ]);

  // Step 6: Construction
  const [constructionStartDate, setConstructionStartDate] = useState('2022-06-01');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2027-12-31');
  const [currentProgressPct, setCurrentProgressPct] = useState(75);
  const [constructionStage, setConstructionStage] = useState('Superstructure Complete & External Plastering');
  const [generalContractor, setGeneralContractor] = useState('Shapoorji Pallonji Engineering');
  const [architect, setArchitect] = useState('Hafeez Contractor');
  const [structuralConsultant, setStructuralConsultant] = useState('JW Consultants LLP');
  const [pmcAgency, setPmcAgency] = useState('CBRE South Asia');
  const [siteContactName, setSiteContactName] = useState('Mahesh Jadhav');
  const [siteContactPhone, setSiteContactPhone] = useState('+91 98220 44912');

  // Step 7: Project Financials
  const [estimatedProjectCostCr, setEstimatedProjectCostCr] = useState(420.0);
  const [landCostCr, setLandCostCr] = useState(110.0);
  const [constructionCostCr, setConstructionCostCr] = useState(250.0);
  const [promoterContributionCr, setPromoterContributionCr] = useState(130.0);
  const [debtFundingCr, setDebtFundingCr] = useState(110.0);
  const [customerAdvancesCr, setCustomerAdvancesCr] = useState(180.0);
  const [currentProjectDebtCr, setCurrentProjectDebtCr] = useState(65.0);
  const [escrowReraBank, setEscrowReraBank] = useState('HDFC Bank Ltd');
  const [escrowAccountNumber, setEscrowAccountNumber] = useState('50200088921102');

  // Step 8: Sales & Inventory
  const [totalUnitsLaunched, setTotalUnitsLaunched] = useState(600);
  const [soldBookedUnits, setSoldBookedUnits] = useState(480);
  const [unsoldUnits, setUnsoldUnits] = useState(120);
  const [salesPct, setSalesPct] = useState(80.0);
  const [avgQuotedRateSqFt, setAvgQuotedRateSqFt] = useState(7600);
  const [avgRealizedRateSqFt, setAvgRealizedRateSqFt] = useState(7450);
  const [collectionPct, setCollectionPct] = useState(88.0);
  const [inventoryValueCr, setInventoryValueCr] = useState(92.0);

  // Step 9: Documents Checklist
  const [docChecklist, setDocChecklist] = useState({
    reraCert: true,
    layoutPlan: true,
    sanctionPlan: true,
    commencementCert: true,
    titleSearchReport: true,
    daPoa: true,
    architectCert: true,
    costSheet: true,
  });

  // Step 10: Review & edit reason
  const [editReason, setEditReason] = useState('');

  // Duplicate Check Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [duplicateField, setDuplicateField] = useState('');
  const [duplicateRecordId, setDuplicateRecordId] = useState('');
  const [duplicateRecordName, setDuplicateRecordName] = useState('');

  useEffect(() => {
    const loaded = masterStore.getBuilders();
    setBuilders(loaded);
    if (!builderId && loaded.length > 0) {
      setBuilderId(defaultBuilderId || loaded[0].id);
    }
  }, [isOpen, defaultBuilderId]);

  useEffect(() => {
    if (editProject) {
      setBuilderId(editProject.builderId);
      setProjectName(editProject.projectName);
      setMarketingName(editProject.marketingName || editProject.projectName);
      setProjectType(editProject.projectType);
      setProjectSegment(editProject.projectSegment || 'Mid-Market');
      setProjectStatus(editProject.projectStatus || 'Under Construction');
      setReraList(editProject.reraNumbers || ['P52100022154']);
      setAddress(editProject.address);
      setLocality(editProject.locality);
      setCity(editProject.city);
      setDistrict(editProject.district || editProject.city);
      setPincode(editProject.pincode || '411057');
      setLandmark(editProject.landmark || 'Near Metro');
      setLat(editProject.latLong?.lat || 18.5912);
      setLng(editProject.latLong?.lng || 73.7389);
      setGeofenceRadiusMeters(editProject.geofenceRadiusMeters || 450);
      setTotalLandAreaAcres(editProject.totalLandAreaAcres || 10.0);
      setSurveyNumber(editProject.surveyNumber || 'Survey 74');
      setCtsNumber(editProject.ctsNumber || 'CTS 102');
      setPlotNumber(editProject.plotNumber || 'Plot C-1');
      setLandOwnershipType(editProject.landOwnershipType || 'Freehold');
      setJointDevelopmentFlag(!!editProject.jointDevelopmentFlag);
      setLandOwnerName(editProject.landOwnerName || '');
      setTotalSanctionedTowers(editProject.totalSanctionedTowers || 4);
      setTotalUnitsCount(editProject.totalUnitsCount || 450);
      setCommercialUnitsCount(editProject.commercialUnitsCount || 10);
      setParkingCount(editProject.parkingCount || 500);
      if (editProject.statutoryApprovals?.length) {
        setApprovals(editProject.statutoryApprovals);
      }
      setConstructionStartDate(editProject.constructionStartDate || '2022-01-01');
      setExpectedCompletionDate(editProject.expectedCompletionDate || '2027-12-31');
      setCurrentProgressPct(editProject.currentProgressPct || 70);
      setConstructionStage(editProject.constructionStage || 'Superstructure');
      setGeneralContractor(editProject.generalContractor || 'Contractor');
      setArchitect(editProject.architect || 'Architect');
      setStructuralConsultant(editProject.structuralConsultant || 'Consultant');
      setPmcAgency(editProject.pmcAgency || 'PMC Agency');
      setSiteContactName(editProject.siteContactName || '');
      setSiteContactPhone(editProject.siteContactPhone || '');
      setEstimatedProjectCostCr(editProject.estimatedProjectCostCr || 350.0);
      setLandCostCr(editProject.landCostCr || 80.0);
      setConstructionCostCr(editProject.constructionCostCr || 220.0);
      setPromoterContributionCr(editProject.promoterContributionCr || 100.0);
      setDebtFundingCr(editProject.debtFundingCr || 90.0);
      setCustomerAdvancesCr(editProject.customerAdvancesCr || 150.0);
      setEscrowReraBank(editProject.escrowReraBank || 'HDFC Bank');
      setEscrowAccountNumber(editProject.escrowAccountNumber || '');
      setTotalUnitsLaunched(editProject.totalUnitsLaunched || 400);
      setSoldBookedUnits(editProject.soldBookedUnits || 320);
      setUnsoldUnits(editProject.unsoldUnits || 80);
      setSalesPct(editProject.salesPct || 80.0);
      setAvgQuotedRateSqFt(editProject.avgQuotedRateSqFt || 7500);
      setAvgRealizedRateSqFt(editProject.avgRealizedRateSqFt || 7350);
      setCollectionPct(editProject.collectionPct || 85.0);
      setInventoryValueCr(editProject.inventoryValueCr || 60.0);
      setEditReason('Comprehensive quarterly project progress update');
    } else {
      setProjectName('');
      setMarketingName('');
      setAddress('Survey 88, Near Metro Station');
      setLocality('Hinjawadi Phase 1');
      setReraList(['P521000' + Math.floor(10000 + Math.random() * 90000)]);
    }
    setCurrentStep(1);
  }, [editProject, isOpen]);

  if (!isOpen) return null;

  const currentSelectedBuilder = builders.find((b) => b.id === builderId);

  // RERA handlers
  const handleAddRera = () => {
    setReraList([...reraList, `P521000${Math.floor(10000 + Math.random() * 90000)}`]);
  };

  const handleRemoveRera = (index: number) => {
    if (reraList.length > 1) {
      setReraList(reraList.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = (overrideReason?: string) => {
    if (!builderId) {
      alert('Please select a parent Builder entity.');
      setCurrentStep(1);
      return;
    }
    if (!projectName.trim() || !locality.trim() || reraList.length === 0) {
      alert('Please fill mandatory fields: Project Name, Locality, and at least 1 MahaRERA registration number.');
      setCurrentStep(1);
      return;
    }

    // Duplicate Check for new project
    if (!editProject && !overrideReason) {
      const dupCheck = masterStore.checkDuplicateProject(builderId, projectName, reraList);
      if (dupCheck.isDuplicate && dupCheck.existingProject) {
        setDuplicateMessage(dupCheck.message || 'Duplicate identified.');
        setDuplicateField(dupCheck.matchingField || 'RERA / Project Name');
        setDuplicateRecordId(dupCheck.existingProject.id);
        setDuplicateRecordName(dupCheck.existingProject.projectName);
        setDuplicateModalOpen(true);
        return;
      }
    }

    const payload: Partial<ProjectMaster> = {
      builderId,
      projectName: projectName.trim(),
      marketingName: marketingName.trim() || projectName.trim(),
      projectType,
      projectSegment,
      projectStatus,
      reraNumbers: reraList.filter((r) => r.trim() !== ''),
      address,
      locality,
      city,
      district,
      pincode,
      landmark,
      latLong: { lat: Number(lat) || 18.59, lng: Number(lng) || 73.73 },
      geofenceRadiusMeters: Number(geofenceRadiusMeters) || 450,
      totalLandAreaAcres: Number(totalLandAreaAcres) || 5.0,
      surveyNumber,
      ctsNumber,
      plotNumber,
      landOwnershipType,
      jointDevelopmentFlag,
      landOwnerName: landOwnerName || currentSelectedBuilder?.legalName,
      encumbranceFlag,
      existingMortgageChargeFlag,
      totalSanctionedTowers: Number(totalSanctionedTowers) || 2,
      totalUnitsCount: Number(totalUnitsCount) || 200,
      commercialUnitsCount: Number(commercialUnitsCount) || 0,
      parkingCount: Number(parkingCount) || 250,
      statutoryApprovals: approvals,
      constructionStartDate,
      expectedCompletionDate,
      currentProgressPct: Number(currentProgressPct) || 0,
      constructionStage,
      generalContractor,
      architect,
      structuralConsultant,
      pmcAgency,
      siteContactName,
      siteContactPhone,
      estimatedProjectCostCr: Number(estimatedProjectCostCr) || 100,
      landCostCr: Number(landCostCr) || 25,
      constructionCostCr: Number(constructionCostCr) || 65,
      promoterContributionCr: Number(promoterContributionCr) || 30,
      debtFundingCr: Number(debtFundingCr) || 30,
      customerAdvancesCr: Number(customerAdvancesCr) || 40,
      currentProjectDebtCr: Number(currentProjectDebtCr) || 20,
      escrowReraBank,
      escrowAccountNumber,
      totalUnitsLaunched: Number(totalUnitsLaunched) || 180,
      soldBookedUnits: Number(soldBookedUnits) || 120,
      unsoldUnits: Number(unsoldUnits) || 60,
      salesPct: Number(salesPct) || 66.6,
      avgQuotedRateSqFt: Number(avgQuotedRateSqFt) || 7500,
      avgRealizedRateSqFt: Number(avgRealizedRateSqFt) || 7400,
      collectionPct: Number(collectionPct) || 85.0,
      inventoryValueCr: Number(inventoryValueCr) || 45.0,
    };

    if (editProject) {
      const saved = masterStore.updateProject(
        editProject.id,
        payload,
        currentUser,
        editReason || 'Updated project master parameters'
      );
      onSaved(saved);
    } else {
      const created = masterStore.addProject(payload, currentUser, overrideReason);
      onSaved(created);
    }

    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Identity', icon: Building },
    { num: 2, label: 'RERA & Location', icon: MapPin },
    { num: 3, label: 'Land & Title', icon: Layers },
    { num: 4, label: 'Size & Phases', icon: Layers },
    { num: 5, label: 'Approvals', icon: FileCheck },
    { num: 6, label: 'Construction', icon: Hammer },
    { num: 7, label: 'Financials', icon: DollarSign },
    { num: 8, label: 'Sales & Inventory', icon: PieChart },
    { num: 9, label: 'Documents', icon: Files },
    { num: 10, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-900/70 text-[#8bb3cb]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {editProject ? `Edit Project: ${editProject.projectName}` : 'Add New Project Master'}
                </h2>
                {editProject && (
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-800 text-sky-200 font-mono">
                    {editProject.id} • v{editProject.version}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8bb3cb]">
                Central Enterprise Master • Strict Relational Hierarchy (Builder → Project)
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

        {/* Stepper Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {stepsList.map((st) => {
              const Icon = st.icon;
              const isActive = currentStep === st.num;
              const isDone = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0c3148] text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.num}. {st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Project Identity */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Parent Developer / Builder Entity <span className="text-rose-500">*</span>
                  </label>
                  {onRequestAddBuilder && (
                    <button
                      type="button"
                      onClick={onRequestAddBuilder}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Create New Builder First
                    </button>
                  )}
                </div>
                <select
                  value={builderId}
                  onChange={(e) => setBuilderId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white font-semibold text-slate-800"
                >
                  <option value="">-- Select Parent Builder --</option>
                  {builders.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.legalName} ({b.id}) • {b.city} • PAN: {b.pan}
                    </option>
                  ))}
                </select>

                {currentSelectedBuilder && (
                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Group</span>
                      <span className="font-semibold text-slate-700">{currentSelectedBuilder.groupName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">CIN</span>
                      <span className="font-mono text-slate-700">{currentSelectedBuilder.cin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Grade</span>
                      <span className="font-bold text-emerald-700">{currentSelectedBuilder.internalRiskGrade || 'A+'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Life Republic"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marketing / Brand Name</label>
                  <input
                    type="text"
                    value={marketingName}
                    onChange={(e) => setMarketingName(e.target.value)}
                    placeholder="e.g. Life Republic by Kolte-Patil"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e: any) => setProjectType(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Residential Township">Residential Township</option>
                    <option value="High-Rise Luxury">High-Rise Luxury</option>
                    <option value="Mid-Segment Residential">Mid-Segment Residential</option>
                    <option value="Integrated Development">Integrated Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Segment</label>
                  <select
                    value={projectSegment}
                    onChange={(e: any) => setProjectSegment(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Affordable">Affordable</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Premium">Premium</option>
                    <option value="Ultra Luxury">Ultra Luxury</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Public Status</label>
                  <select
                    value={projectStatus}
                    onChange={(e: any) => setProjectStatus(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Newly Launched">Newly Launched</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Advanced Stage">Advanced Stage</option>
                    <option value="Partially Delivered">Partially Delivered</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RERA & Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* RERA Registrations */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      MahaRERA Registration Numbers <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Add multiple registrations for phased developments</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRera}
                    className="px-2.5 py-1 rounded bg-sky-100 text-sky-700 text-xs font-bold flex items-center gap-1 hover:bg-sky-200"
                  >
                    <Plus className="w-3 h-3" /> Add RERA Number
                  </button>
                </div>

                <div className="space-y-2">
                  {reraList.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={r}
                        onChange={(e) => {
                          const updated = [...reraList];
                          updated[idx] = e.target.value.toUpperCase();
                          setReraList(updated);
                        }}
                        placeholder="P52100022154"
                        className="flex-1 p-2 text-xs rounded-lg border border-slate-300 font-mono uppercase bg-white"
                      />
                      {reraList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRera(idx)}
                          className="text-rose-500 hover:text-rose-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Locality / Micro-Market <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Hinjawadi Phase 1"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City Hub</label>
                  <select
                    value={city}
                    onChange={(e: any) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Postal Site Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot/Survey number, road name, nearby landmark..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Geofence Radius (Meters)</label>
                  <input
                    type="number"
                    value={geofenceRadiusMeters}
                    onChange={(e) => setGeofenceRadiusMeters(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Land & Title */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Land Title, Survey Details & Ownership</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Survey Number</label>
                  <input
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTS Number</label>
                  <input
                    type="text"
                    value={ctsNumber}
                    onChange={(e) => setCtsNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={totalLandAreaAcres}
                    onChange={(e) => setTotalLandAreaAcres(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Ownership Type</label>
                  <select
                    value={landOwnershipType}
                    onChange={(e: any) => setLandOwnershipType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Freehold">Freehold (Clear Title)</option>
                    <option value="Leasehold">Leasehold (MIDC / CIDCO)</option>
                    <option value="Joint Development Agreement">Joint Development Agreement (JDA)</option>
                    <option value="Development Rights">Development Rights Agreement (DRA)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Owner Name as per 7/12 Extract</label>
                  <input
                    type="text"
                    value={landOwnerName}
                    onChange={(e) => setLandOwnerName(e.target.value)}
                    placeholder="Owner / Society Name"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                  <input
                    type="checkbox"
                    checked={jointDevelopmentFlag}
                    onChange={(e) => setJointDevelopmentFlag(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-semibold text-slate-700">Joint Development Agreement (JDA)</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                  <input
                    type="checkbox"
                    checked={encumbranceFlag}
                    onChange={(e) => setEncumbranceFlag(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-700">Prior Encumbrance / Existing Charge</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Size & Phases */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Project Master Scale & Phasing Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Sanctioned Towers</label>
                  <input
                    type="number"
                    value={totalSanctionedTowers}
                    onChange={(e) => setTotalSanctionedTowers(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Residential Units</label>
                  <input
                    type="number"
                    value={totalUnitsCount}
                    onChange={(e) => setTotalUnitsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commercial Units</label>
                  <input
                    type="number"
                    value={commercialUnitsCount}
                    onChange={(e) => setCommercialUnitsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parking Slots</label>
                  <input
                    type="number"
                    value={parkingCount}
                    onChange={(e) => setParkingCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <span className="text-xs font-bold text-sky-950 block mb-1">Automatic Phase 1 Provisioning</span>
                <p className="text-[11px] text-sky-800 mb-2">
                  When creating this project, an initial Phase 1 will be automatically seeded in the Phase Master hierarchy.
                </p>
                <div>
                  <label className="block font-semibold text-sky-900 mb-1">Phase 1 Name</label>
                  <input
                    type="text"
                    value={initialPhaseName}
                    onChange={(e) => setInitialPhaseName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-sky-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Approvals */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Statutory Approvals & NOCs</h3>
                  <p className="text-slate-500">Government sanctions, CC, IOD, fire, and airport clearances</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {approvals.map((app, idx) => (
                  <div key={app.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="font-bold text-slate-700 block">{app.approvalType}</span>
                      <span className="text-[11px] text-slate-500">{app.issuingAuthority}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Document No</span>
                      <input
                        type="text"
                        value={app.documentNumber}
                        onChange={(e) => {
                          const updated = [...approvals];
                          updated[idx].documentNumber = e.target.value;
                          setApprovals(updated);
                        }}
                        className="w-full p-1.5 rounded border border-slate-300 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Valid Until</span>
                      <input
                        type="date"
                        value={app.validityDate}
                        onChange={(e) => {
                          const updated = [...approvals];
                          updated[idx].validityDate = e.target.value;
                          setApprovals(updated);
                        }}
                        className="w-full p-1.5 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                      <select
                        value={app.status}
                        onChange={(e: any) => {
                          const updated = [...approvals];
                          updated[idx].status = e.target.value;
                          setApprovals(updated);
                        }}
                        className="w-full p-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="Approved">Approved</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Exempted">Exempted</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Construction */}
          {currentStep === 6 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Construction Timelines, Consultants & Progress</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Construction Start Date</label>
                  <input
                    type="date"
                    value={constructionStartDate}
                    onChange={(e) => setConstructionStartDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Completion Date</label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Physical Progress %</label>
                  <input
                    type="number"
                    value={currentProgressPct}
                    onChange={(e) => setCurrentProgressPct(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-sky-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Stage of Construction</label>
                <input
                  type="text"
                  value={constructionStage}
                  onChange={(e) => setConstructionStage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">General Contractor</label>
                  <input
                    type="text"
                    value={generalContractor}
                    onChange={(e) => setGeneralContractor(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Architectural Firm</label>
                  <input
                    type="text"
                    value={architect}
                    onChange={(e) => setArchitect(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Structural Consultant</label>
                  <input
                    type="text"
                    value={structuralConsultant}
                    onChange={(e) => setStructuralConsultant(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PMC Agency</label>
                  <input
                    type="text"
                    value={pmcAgency}
                    onChange={(e) => setPmcAgency(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Site Engineer Contact Name</label>
                  <input
                    type="text"
                    value={siteContactName}
                    onChange={(e) => setSiteContactName(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Site Contact Mobile</label>
                  <input
                    type="text"
                    value={siteContactPhone}
                    onChange={(e) => setSiteContactPhone(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Financials */}
          {currentStep === 7 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Project Budget, Funding Means & Escrow Accounts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Cost (₹ Cr)</label>
                  <input
                    type="number"
                    value={estimatedProjectCostCr}
                    onChange={(e) => setEstimatedProjectCostCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Cost (₹ Cr)</label>
                  <input
                    type="number"
                    value={landCostCr}
                    onChange={(e) => setLandCostCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Construction Cost (₹ Cr)</label>
                  <input
                    type="number"
                    value={constructionCostCr}
                    onChange={(e) => setConstructionCostCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Promoter Equity (₹ Cr)</label>
                  <input
                    type="number"
                    value={promoterContributionCr}
                    onChange={(e) => setPromoterContributionCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Debt Funding (₹ Cr)</label>
                  <input
                    type="number"
                    value={debtFundingCr}
                    onChange={(e) => setDebtFundingCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Advances (₹ Cr)</label>
                  <input
                    type="number"
                    value={customerAdvancesCr}
                    onChange={(e) => setCustomerAdvancesCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MahaRERA Designated Escrow Bank</label>
                  <input
                    type="text"
                    value={escrowReraBank}
                    onChange={(e) => setEscrowReraBank(e.target.value)}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RERA Escrow Account Number</label>
                  <input
                    type="text"
                    value={escrowAccountNumber}
                    onChange={(e) => setEscrowAccountNumber(e.target.value)}
                    placeholder="50200088921102"
                    className="w-full p-2 rounded border border-slate-300 font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Sales & Inventory */}
          {currentStep === 8 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Sales Velocity, Pricing & Inventory Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Launched</label>
                  <input
                    type="number"
                    value={totalUnitsLaunched}
                    onChange={(e) => setTotalUnitsLaunched(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sold / Booked Units</label>
                  <input
                    type="number"
                    value={soldBookedUnits}
                    onChange={(e) => setSoldBookedUnits(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unsold Units</label>
                  <input
                    type="number"
                    value={unsoldUnits}
                    onChange={(e) => setUnsoldUnits(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sales %</label>
                  <input
                    type="number"
                    value={salesPct}
                    onChange={(e) => setSalesPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Quoted Rate (₹/SqFt)</label>
                  <input
                    type="number"
                    value={avgQuotedRateSqFt}
                    onChange={(e) => setAvgQuotedRateSqFt(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Realized Rate (₹/SqFt)</label>
                  <input
                    type="number"
                    value={avgRealizedRateSqFt}
                    onChange={(e) => setAvgRealizedRateSqFt(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collection %</label>
                  <input
                    type="number"
                    value={collectionPct}
                    onChange={(e) => setCollectionPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unsold Inventory Value (₹ Cr)</label>
                  <input
                    type="number"
                    value={inventoryValueCr}
                    onChange={(e) => setInventoryValueCr(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Documents Checklist */}
          {currentStep === 9 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Project Master Documentation & Legal Search</h3>
              <p className="text-slate-500">
                Confirm receipt and legal verification of technical, land title, and RERA dockets
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                {Object.entries(docChecklist).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    reraCert: 'MahaRERA Project Registration Certificate & Quarterly Filings',
                    layoutPlan: 'Sanctioned Master Layout Plan with Municipal DP Remarks',
                    sanctionPlan: 'Sanctioned Architectural Building Floor Plans (All Towers)',
                    commencementCert: 'Commencement Certificate (CC) up to Top Sanctioned Slab',
                    titleSearchReport: 'Advocate Title Search Report for 30 Years Clear Marketable Title',
                    daPoa: 'Development Agreement (DA) & Registered Power of Attorney (POA)',
                    architectCert: 'Architect Progress Certificate (Form 1 / Form 4)',
                    costSheet: 'Detailed Project Cost Estimate & CA Certificate (Form 3)',
                  };
                  return (
                    <label key={key} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setDocChecklist({ ...docChecklist, [key]: e.target.checked })}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="font-medium text-slate-700">{labels[key] || key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 10: Review & Submit */}
          {currentStep === 10 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                <div className="flex items-center justify-between font-bold text-sm mb-1 text-sky-950">
                  <span>{projectName || 'Project Name'}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-800 font-mono text-xs">
                    {city} • {projectType}
                  </span>
                </div>
                <p className="text-sky-800">
                  Parent Builder: <span className="font-bold">{currentSelectedBuilder?.legalName || builderId}</span> •
                  RERA: <span className="font-mono font-bold">{reraList.join(', ')}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Sanctioned Towers</span>
                    <span className="font-bold text-slate-800">{totalSanctionedTowers} Towers</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Residential Units</span>
                    <span className="font-bold text-slate-800">{totalUnitsCount} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Progress</span>
                    <span className="font-bold text-emerald-700">{currentProgressPct}% Done</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Escrow Bank</span>
                    <span className="font-bold text-slate-800">{escrowReraBank}</span>
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
                        ? 'As a CPA (Maker), this project will be submitted in "PENDING_MASTER_APPROVAL" status. A COM or Admin Checker must approve it before it can be selected in production APF dockets.'
                        : 'As an Admin/COM, this project will be directly approved and activated immediately.'
                      : 'Maker-Checker is currently OFF. Record will be immediately APPROVED and ACTIVE.'}
                  </p>
                </div>
              </div>

              {editProject && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Log Reason for Changes <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Updated RERA completion date and sales inventory status"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
                {editProject ? 'Save Project Changes' : 'Submit Project Master'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="POSSIBLE DUPLICATE PROJECT DETECTED"
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
