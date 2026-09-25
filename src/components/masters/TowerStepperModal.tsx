import React, { useState, useEffect } from 'react';
import {
  TowerMaster,
  UserAccount,
  BuilderMaster,
  ProjectMaster,
  PhaseMaster,
  TowerConfigurationRow,
} from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import {
  X,
  Building2,
  Layers,
  Grid,
  Hammer,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
} from 'lucide-react';

interface TowerStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  editTower?: TowerMaster | null;
  defaultProjectId?: string;
  defaultPhaseId?: string;
  onSaved: (tower: TowerMaster) => void;
}

export const TowerStepperModal: React.FC<TowerStepperModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  editTower,
  defaultProjectId,
  defaultPhaseId,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Master Lists for Cascade
  const [builders, setBuilders] = useState<BuilderMaster[]>([]);
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [phases, setPhases] = useState<PhaseMaster[]>([]);

  // Step 1: Identity & Cascade
  const [selectedBuilderId, setSelectedBuilderId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [selectedPhaseId, setSelectedPhaseId] = useState(defaultPhaseId || '');
  const [towerName, setTowerName] = useState('Tower E');
  const [towerCode, setTowerCode] = useState('TWR-E');
  const [buildingNumber, setBuildingNumber] = useState('Building 1');
  const [wing, setWing] = useState('Wing E');
  const [reraTowerReference, setReraTowerReference] = useState('');

  // Step 2: Structure
  const [towerType, setTowerType] = useState<'Residential' | 'Commercial' | 'Mixed'>('Residential');
  const [basementCount, setBasementCount] = useState(2);
  const [podiumCount, setPodiumCount] = useState(1);
  const [habitableFloors, setHabitableFloors] = useState(20);
  const [refugeFloors, setRefugeFloors] = useState(2);
  const [floorsSanctioned, setFloorsSanctioned] = useState(22);
  const [floorsConstructed, setFloorsConstructed] = useState(18);
  const [slabsCompleted, setSlabsCompleted] = useState(18);
  const [totalUnits, setTotalUnits] = useState(88);
  const [unitsPerFloor, setUnitsPerFloor] = useState(4);
  const [passengerLifts, setPassengerLifts] = useState(3);
  const [serviceLifts, setServiceLifts] = useState(1);
  const [staircases, setStaircases] = useState(2);

  // Step 3: Configurations
  const [configs, setConfigs] = useState<TowerConfigurationRow[]>([
    {
      id: '1',
      configuration: '2 BHK',
      carpetAreaSqFt: 720,
      builtUpAreaSqFt: 936,
      saleableAreaSqFt: 1044,
      numberOfUnits: 44,
      builderQuotedRateSqFt: 7800,
      apfRecommendedRateSqFt: 7450,
    },
    {
      id: '2',
      configuration: '3 BHK',
      carpetAreaSqFt: 980,
      builtUpAreaSqFt: 1274,
      saleableAreaSqFt: 1420,
      numberOfUnits: 44,
      builderQuotedRateSqFt: 8100,
      apfRecommendedRateSqFt: 7750,
    },
  ]);

  // Step 4: Construction
  const [constructionStage, setConstructionStage] = useState('Superstructure & Brickwork in Progress');
  const [physicalProgressPct, setPhysicalProgressPct] = useState(72);
  const [expectedProgressPct, setExpectedProgressPct] = useState(75);
  const [brickworkPct, setBrickworkPct] = useState(85);
  const [plasterPct, setPlasterPct] = useState(70);
  const [mepPct, setMepPct] = useState(60);
  const [finishingPct, setFinishingPct] = useState(45);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2027-06-30');
  const [ocStatus, setOcStatus] = useState<'Full OC' | 'Part OC' | 'Applied' | 'Not Applied'>('Not Applied');
  const [ocNumber, setOcNumber] = useState('');
  const [ocDate, setOcDate] = useState('');

  // Step 5: Pricing
  const [baseRateSqFt, setBaseRateSqFt] = useState(7450);
  const [floorRisePerFloor, setFloorRisePerFloor] = useState(40);
  const [preferredLocationCharges, setPreferredLocationCharges] = useState(200);
  const [viewPremiumSqFt, setViewPremiumSqFt] = useState(150);
  const [parkingChargesLakh, setParkingChargesLakh] = useState(3.5);
  const [amenitiesChargesLakh, setAmenitiesChargesLakh] = useState(2.5);

  // Step 6: Technical & Engineering
  const [structureType, setStructureType] = useState<'RCC Framed' | 'Aluminium Formwork (Mivan)' | 'Precast Concrete' | 'Steel Composite'>('Aluminium Formwork (Mivan)');
  const [foundationType, setFoundationType] = useState<'Pile Foundation' | 'Raft Foundation' | 'Isolated Footing'>('Raft Foundation');
  const [constructionQualityGrade, setConstructionQualityGrade] = useState<'A+' | 'A' | 'B+' | 'B'>('A+');
  const [fireSafetyStatus, setFireSafetyStatus] = useState<'Compliant & Tested' | 'Under Installation' | 'Pending NOC'>('Under Installation');
  const [seismicZone, setSeismicZone] = useState<'Zone III' | 'Zone IV'>('Zone III');
  const [structuralConsultant, setStructuralConsultant] = useState('JW Consultants LLP');
  const [majorObservations, setMajorObservations] = useState('Clean monolithic Mivan casting with uniform slab thickness.');

  // Step 7: Edit Reason
  const [editReason, setEditReason] = useState('');

  // Cascade Loading
  useEffect(() => {
    const bList = masterStore.getBuilders();
    setBuilders(bList);
    if (!selectedBuilderId && bList.length > 0) {
      const initBuilder = defaultProjectId
        ? masterStore.getProjectById(defaultProjectId)?.builderId || bList[0].id
        : bList[0].id;
      setSelectedBuilderId(initBuilder);
    }
  }, [isOpen, defaultProjectId]);

  useEffect(() => {
    if (selectedBuilderId) {
      const pList = masterStore.getProjects({ builderId: selectedBuilderId });
      setProjects(pList);
      if (pList.length > 0) {
        const pId = defaultProjectId && pList.some((p) => p.id === defaultProjectId) ? defaultProjectId : pList[0].id;
        setSelectedProjectId(pId);
      } else {
        setSelectedProjectId('');
        setPhases([]);
        setSelectedPhaseId('');
      }
    }
  }, [selectedBuilderId, defaultProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      const phList = masterStore.getPhases({ projectId: selectedProjectId });
      setPhases(phList);
      if (phList.length > 0) {
        const phId = defaultPhaseId && phList.some((ph) => ph.id === defaultPhaseId) ? defaultPhaseId : phList[0].id;
        setSelectedPhaseId(phId);
      } else {
        setSelectedPhaseId('');
      }
    }
  }, [selectedProjectId, defaultPhaseId]);

  // Edit Mode Initialization
  useEffect(() => {
    if (editTower) {
      const proj = masterStore.getProjectById(editTower.projectId);
      if (proj) {
        setSelectedBuilderId(proj.builderId);
        setSelectedProjectId(editTower.projectId);
        setSelectedPhaseId(editTower.phaseId);
      }
      setTowerName(editTower.towerName);
      setTowerCode(editTower.towerCode || 'TWR-E');
      setBuildingNumber(editTower.buildingNumber || 'Building 1');
      setWing(editTower.wing || 'Wing E');
      setReraTowerReference(editTower.reraTowerReference || '');
      setTowerType(editTower.towerType || 'Residential');
      setFloorsSanctioned(editTower.floorsSanctioned);
      setFloorsConstructed(editTower.floorsConstructed);
      setSlabsCompleted(editTower.slabsCompleted);
      setTotalUnits(editTower.totalUnits);
      setConstructionStage(editTower.constructionStage);
      setPhysicalProgressPct(editTower.physicalProgressPct);
      setExpectedProgressPct(editTower.expectedProgressPct);
      setBrickworkPct(editTower.brickworkPct || 80);
      setPlasterPct(editTower.plasterPct || 70);
      setMepPct(editTower.mepPct || 60);
      setFinishingPct(editTower.finishingPct || 40);
      setExpectedCompletionDate(editTower.expectedCompletionDate || '2027-06-30');
      setOcStatus(editTower.ocStatus || 'Not Applied');
      setBaseRateSqFt(editTower.baseRateSqFt || 7450);
      setFloorRisePerFloor(editTower.floorRisePerFloor || 40);
      setStructureType((editTower.structureType as any) || 'Aluminium Formwork (Mivan)');
      setConstructionQualityGrade(editTower.constructionQualityGrade || 'A+');
      if (editTower.configurations?.length) {
        setConfigs(editTower.configurations);
      }
      setEditReason('Quarterly valuation and structural milestone refresh');
    }
    setCurrentStep(1);
  }, [editTower, isOpen]);

  if (!isOpen) return null;

  const handleAddConfig = () => {
    setConfigs([
      ...configs,
      {
        id: String(Date.now()),
        configuration: '2 BHK',
        carpetAreaSqFt: 750,
        builtUpAreaSqFt: 975,
        saleableAreaSqFt: 1088,
        numberOfUnits: 22,
        builderQuotedRateSqFt: baseRateSqFt,
        apfRecommendedRateSqFt: baseRateSqFt - 150,
      },
    ]);
  };

  const handleRemoveConfig = (id: string) => {
    if (configs.length > 1) {
      setConfigs(configs.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!selectedProjectId || !selectedPhaseId || !towerName.trim()) {
      alert('Please select Project, Phase, and provide Tower Name.');
      setCurrentStep(1);
      return;
    }

    const payload: Partial<TowerMaster> = {
      projectId: selectedProjectId,
      phaseId: selectedPhaseId,
      towerName: towerName.trim(),
      towerCode: towerCode.trim(),
      buildingNumber,
      wing,
      reraTowerReference,
      towerType,
      basementCount: Number(basementCount) || 0,
      podiumCount: Number(podiumCount) || 0,
      habitableFloors: Number(habitableFloors) || floorsSanctioned,
      refugeFloors: Number(refugeFloors) || 0,
      floorsSanctioned: Number(floorsSanctioned) || 20,
      floorsConstructed: Number(floorsConstructed) || 0,
      slabsCompleted: Number(slabsCompleted) || 0,
      totalUnits: Number(totalUnits) || 80,
      unitsPerFloor: Number(unitsPerFloor) || 4,
      passengerLifts: Number(passengerLifts) || 2,
      serviceLifts: Number(serviceLifts) || 1,
      staircases: Number(staircases) || 2,
      constructionStage,
      physicalProgressPct: Number(physicalProgressPct) || 0,
      expectedProgressPct: Number(expectedProgressPct) || 0,
      brickworkPct: Number(brickworkPct) || 0,
      plasterPct: Number(plasterPct) || 0,
      mepPct: Number(mepPct) || 0,
      finishingPct: Number(finishingPct) || 0,
      expectedCompletionDate,
      ocStatus,
      ocNumber,
      ocDate,
      configurations: configs,
      baseRateSqFt: Number(baseRateSqFt) || 7000,
      floorRisePerFloor: Number(floorRisePerFloor) || 40,
      preferredLocationCharges: Number(preferredLocationCharges) || 0,
      viewPremiumSqFt: Number(viewPremiumSqFt) || 0,
      parkingChargesLakh: Number(parkingChargesLakh) || 0,
      amenitiesChargesLakh: Number(amenitiesChargesLakh) || 0,
      structureType,
      foundationType,
      constructionQualityGrade,
      fireSafetyStatus,
      seismicZone,
      structuralConsultant,
      majorObservations: [majorObservations],
    };

    if (editTower) {
      const saved = masterStore.updateTower(
        editTower.id,
        payload,
        currentUser,
        editReason || 'Updated tower master parameters'
      );
      onSaved(saved);
    } else {
      const created = masterStore.addTower(payload, currentUser);
      onSaved(created);
    }

    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Identity', icon: Building2 },
    { num: 2, label: 'Structure', icon: Layers },
    { num: 3, label: 'Config', icon: Grid },
    { num: 4, label: 'Construction', icon: Hammer },
    { num: 5, label: 'Pricing', icon: DollarSign },
    { num: 6, label: 'Technical', icon: ShieldCheck },
    { num: 7, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-900/70 text-[#8bb3cb]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {editTower ? `Edit Tower: ${editTower.towerName}` : 'Add New Tower Master'}
                </h2>
                {editTower && (
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-800 text-sky-200 font-mono">
                    {editTower.id} • v{editTower.version}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8bb3cb]">
                Central Enterprise Master • Hierarchy: Builder → Project → Phase → Tower
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
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
          {/* STEP 1: Identity & Hierarchy */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Relational Parent Selection (Builder → Project → Phase)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      1. Builder <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedBuilderId}
                      onChange={(e) => setSelectedBuilderId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {builders.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.legalName} ({b.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      2. Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.projectName} ({p.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3. Phase <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedPhaseId}
                      onChange={(e) => setSelectedPhaseId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {phases.length === 0 ? (
                        <option value="">No phases found</option>
                      ) : (
                        phases.map((ph) => (
                          <option key={ph.id} value={ph.id}>
                            {ph.phaseName} ({ph.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tower Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={towerName}
                    onChange={(e) => setTowerName(e.target.value)}
                    placeholder="e.g. Tower E (Sector 1)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tower Code</label>
                  <input
                    type="text"
                    value={towerCode}
                    onChange={(e) => setTowerCode(e.target.value)}
                    placeholder="TWR-E"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building / Wing</label>
                  <input
                    type="text"
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    placeholder="Wing E"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MahaRERA Tower Reference / Identifier</label>
                <input
                  type="text"
                  value={reraTowerReference}
                  onChange={(e) => setReraTowerReference(e.target.value)}
                  placeholder="e.g. MahaRERA Building Reference No. B-05"
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Structure */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Structural Height, Basements & Slab Sanctions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tower Type</label>
                  <select
                    value={towerType}
                    onChange={(e: any) => setTowerType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sanctioned Floors</label>
                  <input
                    type="number"
                    value={floorsSanctioned}
                    onChange={(e) => setFloorsSanctioned(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floors Constructed</label>
                  <input
                    type="number"
                    value={floorsConstructed}
                    onChange={(e) => setFloorsConstructed(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slabs Completed</label>
                  <input
                    type="number"
                    value={slabsCompleted}
                    onChange={(e) => setSlabsCompleted(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Units in Tower</label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Per Floor</label>
                  <input
                    type="number"
                    value={unitsPerFloor}
                    onChange={(e) => setUnitsPerFloor(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Basements</label>
                  <input
                    type="number"
                    value={basementCount}
                    onChange={(e) => setBasementCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Podiums</label>
                  <input
                    type="number"
                    value={podiumCount}
                    onChange={(e) => setPodiumCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passenger Lifts</label>
                  <input
                    type="number"
                    value={passengerLifts}
                    onChange={(e) => setPassengerLifts(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service / Fire Lifts</label>
                  <input
                    type="number"
                    value={serviceLifts}
                    onChange={(e) => setServiceLifts(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staircases</label>
                  <input
                    type="number"
                    value={staircases}
                    onChange={(e) => setStaircases(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Unit Typology & Area Configurations</h3>
                  <p className="text-slate-500">Typical carpet areas, loading percentages, and unit counts per type</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddConfig}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Typology Row
                </button>
              </div>

              <div className="space-y-3">
                {configs.map((c, idx) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Typology #{idx + 1}</span>
                      {configs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveConfig(c.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Type</label>
                        <select
                          value={c.configuration}
                          onChange={(e: any) => {
                            const updated = [...configs];
                            updated[idx].configuration = e.target.value;
                            setConfigs(updated);
                          }}
                          className="w-full p-1.5 rounded border border-slate-300 bg-white"
                        >
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="2.5 BHK">2.5 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="4 BHK">4 BHK</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Retail / Commercial">Retail / Commercial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Carpet (SqFt)</label>
                        <input
                          type="number"
                          value={c.carpetAreaSqFt}
                          onChange={(e) => {
                            const updated = [...configs];
                            const val = Number(e.target.value);
                            updated[idx].carpetAreaSqFt = val;
                            updated[idx].builtUpAreaSqFt = Math.round(val * 1.3);
                            updated[idx].saleableAreaSqFt = Math.round(val * 1.45);
                            setConfigs(updated);
                          }}
                          className="w-full p-1.5 rounded border border-slate-300 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Saleable (SqFt)</label>
                        <input
                          type="number"
                          value={c.saleableAreaSqFt}
                          onChange={(e) => {
                            const updated = [...configs];
                            updated[idx].saleableAreaSqFt = Number(e.target.value);
                            setConfigs(updated);
                          }}
                          className="w-full p-1.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Number of Units</label>
                        <input
                          type="number"
                          value={c.numberOfUnits}
                          onChange={(e) => {
                            const updated = [...configs];
                            updated[idx].numberOfUnits = Number(e.target.value);
                            setConfigs(updated);
                          }}
                          className="w-full p-1.5 rounded border border-slate-300 bg-white font-bold text-sky-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Construction */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Construction Milestone Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Stage Description</label>
                  <input
                    type="text"
                    value={constructionStage}
                    onChange={(e) => setConstructionStage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overall Progress %</label>
                  <input
                    type="number"
                    value={physicalProgressPct}
                    onChange={(e) => setPhysicalProgressPct(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-sky-700"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Brickwork %</label>
                  <input
                    type="number"
                    value={brickworkPct}
                    onChange={(e) => setBrickworkPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Plastering %</label>
                  <input
                    type="number"
                    value={plasterPct}
                    onChange={(e) => setPlasterPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">MEP & Electrical %</label>
                  <input
                    type="number"
                    value={mepPct}
                    onChange={(e) => setMepPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Internal Finishing %</label>
                  <input
                    type="number"
                    value={finishingPct}
                    onChange={(e) => setFinishingPct(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupancy Certificate (OC) Status</label>
                  <select
                    value={ocStatus}
                    onChange={(e: any) => setOcStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Not Applied">Not Applied</option>
                    <option value="Applied">Applied (Pending Inspection)</option>
                    <option value="Part OC">Part OC Received</option>
                    <option value="Full OC">Full OC Received</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Handover Date</label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">OC Document Number</label>
                  <input
                    type="text"
                    value={ocNumber}
                    onChange={(e) => setOcNumber(e.target.value)}
                    placeholder="If OC obtained..."
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Pricing */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Pricing Schedules & Premiums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Rate (₹/SqFt)</label>
                  <input
                    type="number"
                    value={baseRateSqFt}
                    onChange={(e) => setBaseRateSqFt(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Rise (₹/floor)</label>
                  <input
                    type="number"
                    value={floorRisePerFloor}
                    onChange={(e) => setFloorRisePerFloor(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Location Charges (₹/SqFt)</label>
                  <input
                    type="number"
                    value={preferredLocationCharges}
                    onChange={(e) => setPreferredLocationCharges(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">View Premium (₹/SqFt)</label>
                  <input
                    type="number"
                    value={viewPremiumSqFt}
                    onChange={(e) => setViewPremiumSqFt(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parking Cost (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={parkingChargesLakh}
                    onChange={(e) => setParkingChargesLakh(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clubhouse / Amenities (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={amenitiesChargesLakh}
                    onChange={(e) => setAmenitiesChargesLakh(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Technical */}
          {currentStep === 6 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800">Engineering & Quality Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Structure Type</label>
                  <select
                    value={structureType}
                    onChange={(e: any) => setStructureType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Aluminium Formwork (Mivan)">Aluminium Formwork (Mivan)</option>
                    <option value="RCC Framed">RCC Framed Structure</option>
                    <option value="Precast Concrete">Precast Concrete</option>
                    <option value="Steel Composite">Steel Composite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Foundation Type</label>
                  <select
                    value={foundationType}
                    onChange={(e: any) => setFoundationType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Raft Foundation">Raft Foundation</option>
                    <option value="Pile Foundation">Pile Foundation</option>
                    <option value="Isolated Footing">Isolated Footing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Construction Quality Grade</label>
                  <select
                    value={constructionQualityGrade}
                    onChange={(e: any) => setConstructionQualityGrade(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-emerald-700"
                  >
                    <option value="A+">A+ (Premium Superior)</option>
                    <option value="A">A (Standard Compliant)</option>
                    <option value="B+">B+ (Acceptable Average)</option>
                    <option value="B">B (Minor Tolerances Observed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Observation Notes</label>
                <textarea
                  rows={2}
                  value={majorObservations}
                  onChange={(e) => setMajorObservations(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                <div className="flex items-center justify-between font-bold text-sm mb-1 text-sky-950">
                  <span>{towerName || 'Tower Name'}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-800 font-mono text-xs">
                    {floorsSanctioned} Floors • {totalUnits} Units
                  </span>
                </div>
                <p className="text-sky-800">
                  Parent Project: <span className="font-bold">{selectedProjectId}</span> •
                  Phase: <span className="font-mono font-bold">{selectedPhaseId}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Slabs Completed</span>
                    <span className="font-bold text-slate-800">{slabsCompleted} Slabs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Progress</span>
                    <span className="font-bold text-emerald-700">{physicalProgressPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Base Rate</span>
                    <span className="font-bold text-slate-800">₹{baseRateSqFt.toLocaleString()}/SqFt</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Structure</span>
                    <span className="font-bold text-slate-800">{structureType}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Maker-Checker Policy Enforcement:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {masterStore.isMakerCheckerEnabled()
                      ? currentUser.role === 'CPA'
                        ? 'Submitted as "PENDING_MASTER_APPROVAL". Must be checker-approved by COM / Admin before valuation allocation.'
                        : 'Record will be directly approved and activated immediately.'
                      : 'Maker-Checker is currently OFF. Record will be immediately APPROVED and ACTIVE.'}
                  </p>
                </div>
              </div>

              {editTower && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Log Reason for Changes <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Updated slab construction progress after engineer site visit"
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
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {editTower ? 'Save Tower Changes' : 'Submit Tower Master'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
