// Enterprise Master Data Store with Relational Hierarchy, Maker-Checker, Audit History, and Soft Delete
import {
  BuilderMaster,
  ProjectMaster,
  PhaseMaster,
  TowerMaster,
  UnitMaster,
  UserAccount,
  MasterAuditLog,
  MasterApprovalStatus,
  MasterApprovalItem,
  PromoterItem,
  FinancialYearRow,
  BankingRelationshipRow,
  StatutoryApprovalItem,
  TowerConfigurationRow,
  ReraRegistrationItem,
} from '../types/apfTransaction';
import {
  CENTRAL_BUILDER_MASTER,
  CENTRAL_PROJECT_MASTER,
  CENTRAL_PHASE_MASTER,
  CENTRAL_TOWER_MASTER,
  CENTRAL_UNIT_MASTER,
} from '../data/centralMasterData';

const STORAGE_KEY_MASTERS = 'PROVAL_APF_MASTERS_V3';
const STORAGE_KEY_AUDIT = 'PROVAL_APF_MASTER_AUDIT_V3';
const STORAGE_KEY_MAKER_CHECKER = 'PROVAL_APF_MAKER_CHECKER_FLAG_V3';

export interface DuplicateBuilderResult {
  isDuplicate: boolean;
  matchingField?: string;
  existingBuilder?: BuilderMaster;
  message?: string;
}

export interface DuplicateProjectResult {
  isDuplicate: boolean;
  matchingField?: string;
  existingProject?: ProjectMaster;
  message?: string;
}

class MasterDataStore {
  private builders: BuilderMaster[] = [];
  private projects: ProjectMaster[] = [];
  private phases: PhaseMaster[] = [];
  private towers: TowerMaster[] = [];
  private units: UnitMaster[] = [];
  private auditTrail: MasterAuditLog[] = [];
  private makerCheckerEnabled: boolean = true;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const mcFlag = localStorage.getItem(STORAGE_KEY_MAKER_CHECKER);
      this.makerCheckerEnabled = mcFlag !== null ? JSON.parse(mcFlag) : true;

      const savedMasters = localStorage.getItem(STORAGE_KEY_MASTERS);
      const savedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);

      if (savedAudit) {
        this.auditTrail = JSON.parse(savedAudit);
      } else {
        this.auditTrail = this.seedAuditTrail();
        this.saveAudit();
      }

      if (savedMasters) {
        const parsed = JSON.parse(savedMasters);
        this.builders = parsed.builders || [];
        this.projects = parsed.projects || [];
        this.phases = parsed.phases || [];
        this.towers = parsed.towers || [];
        this.units = parsed.units || [];
      } else {
        this.seedInitialMasters();
        this.saveMasters();
      }
    } catch (e) {
      console.error('Error loading master store:', e);
      this.seedInitialMasters();
      this.auditTrail = this.seedAuditTrail();
    }
  }

  private seedInitialMasters() {
    // Enrich baseline builder master
    this.builders = CENTRAL_BUILDER_MASTER.map((b) => ({
      ...b,
      tradeName: b.legalName.replace(/ (Developers|Realty|Properties|Group|Ltd|Limited)/gi, '').trim(),
      entityType: 'Public Limited',
      incorporationDate: `${b.establishedYear}-04-15`,
      yearsInBusiness: 2026 - b.establishedYear,
      registeredAddress: `Regd Office, Tower 2, Commercial Center, ${b.city}, Maharashtra`,
      corporateAddress: `Corporate HQ, Floor 14, Business Bay, ${b.city}, Maharashtra`,
      state: 'Maharashtra',
      pincode: b.city === 'Pune' ? '411001' : '400051',
      country: 'India',
      website: b.sourceUrl,
      isListed: true,
      stockSymbol: b.legalName.split(' ')[0].toUpperCase(),
      reraPromoterRegNo: `MahaRERA/PRM/${b.city.substring(0, 3).toUpperCase()}/${b.pan.substring(5, 9)}`,
      lei: `335800${b.pan}001928`,
      udyamMsme: `UDYAM-MH-12-00${b.id.replace(/\D/g, '')}`,
      kycVerificationStatus: 'Verified',
      kycVerifiedDate: '2026-01-15',
      primaryContactName: b.promoters[0] || 'Authorized Signatory',
      primaryContactDesignation: 'Managing Director',
      primaryContactMobile: '+91 98220 11223',
      primaryContactEmail: `investor@${b.groupName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      financeContact: 'Chief Financial Officer (cfo@group.com)',
      legalContact: 'VP — Corporate Legal Affairs',
      promoterList: b.promoters.map((p, idx) => ({
        id: `PRM-${b.id}-${idx + 1}`,
        name: p,
        din: `00${idx + 1}${b.establishedYear}`,
        pan: `AABCP${idx + 1}09${idx}K`,
        designation: idx === 0 ? 'Managing Director & Promoter' : 'Executive Director',
        shareholdingPct: idx === 0 ? 38.5 : 12.0,
        netWorthCr: 120.0 + idx * 45.0,
        experienceYears: 24 - idx * 3,
        relatedEntity: `${b.groupName} Holdings Pvt Ltd`,
        status: 'Active',
      })),
      delayedProjects: 0,
      cancelledProjects: 0,
      deliveredAreaMnSqFt: b.totalProjectsCompleted * 1.8,
      operatingCities: [b.city, b.city === 'Pune' ? 'Mumbai' : 'Pune', 'Bengaluru'],
      segments: ['Mid', 'Premium', 'Luxury'],
      internalRiskGrade: 'A+',
      creditBureauStatus: 'Clean',
      wilfulDefaulterFlag: false,
      npaSmaIndicator: false,
      ncltIndicator: false,
      litigationIndicator: false,
      regulatoryActionFlag: false,
      blacklistFlag: false,
      documentChecklist: {
        panVerified: true,
        cinVerified: true,
        gstVerified: true,
        reraVerified: true,
        auditedFinancialsUploaded: true,
        groupStructureChartUploaded: true,
        promoterKycUploaded: true,
      },
      financialHistory: [
        {
          fy: 'FY 2024-25',
          turnoverCr: 1850.0,
          ebitdaCr: 395.0,
          patCr: 210.0,
          netWorthCr: 1420.0,
          totalDebtCr: 680.0,
          securedDebtCr: 550.0,
          unsecuredDebtCr: 130.0,
          currentRatio: 1.85,
          debtEquityRatio: 0.48,
          dscr: 2.15,
          auditorName: 'Deloitte Haskins & Sells LLP',
          hasAuditQualification: false,
        },
        {
          fy: 'FY 2023-24',
          turnoverCr: 1620.0,
          ebitdaCr: 340.0,
          patCr: 175.0,
          netWorthCr: 1240.0,
          totalDebtCr: 710.0,
          securedDebtCr: 590.0,
          unsecuredDebtCr: 120.0,
          currentRatio: 1.72,
          debtEquityRatio: 0.57,
          dscr: 1.95,
          auditorName: 'Deloitte Haskins & Sells LLP',
          hasAuditQualification: false,
        },
      ],
      bankingRelationships: [
        {
          id: `BNK-${b.id}-01`,
          lender: 'Proval Bank',
          facilityType: 'Term Loan',
          sanctionedAmountCr: 80.0,
          outstandingAmountCr: 52.4,
          security: 'First charge on project land and escrow receivables',
          startDate: '2023-06-15',
          maturityDate: '2028-06-15',
          source: 'Bank Direct',
          asOfDate: '2026-09-15',
        },
        {
          id: `BNK-${b.id}-02`,
          lender: 'State Bank of India',
          facilityType: 'Construction Finance',
          sanctionedAmountCr: 120.0,
          outstandingAmountCr: 78.0,
          security: 'Pari-passu charge on unsold residential units',
          startDate: '2022-11-20',
          maturityDate: '2027-11-20',
          source: 'MCA Charges',
          asOfDate: '2026-08-30',
        },
      ],
      isActive: true,
      approvalStatus: 'APPROVED',
      version: 1,
      createdBy: 'System Seed Initializer',
      createdAt: '2026-09-01 09:00:00',
    }));

    // Enrich project master
    this.projects = CENTRAL_PROJECT_MASTER.map((p) => ({
      ...p,
      marketingName: p.projectName,
      projectSegment: 'Mid-Market',
      projectStatus: 'Under Construction',
      reraRegistrations: p.reraNumbers.map((r, idx) => ({
        id: `RERA-${p.id}-${idx + 1}`,
        reraNumber: r,
        registrationDate: '2022-04-10',
        expiryDate: '2027-12-31',
        status: 'Active',
        phaseName: `Phase ${idx + 1}`,
        reraUrl: `https://maharera.mahaonline.gov.in/project?reg=${r}`,
        promoterNameAsPerRera: CENTRAL_BUILDER_MASTER.find((b) => b.id === p.builderId)?.legalName,
      })),
      district: p.city,
      state: 'Maharashtra',
      pincode: p.city === 'Pune' ? '411057' : '400013',
      geofenceRadiusMeters: 450,
      zoneRegionBranch: `${p.city} Regional Asset Hub`,
      surveyNumber: 'Survey No. 74/1, 74/2',
      ctsNumber: 'CTS 1092',
      plotNumber: 'Plot C-1',
      landOwnershipType: 'Freehold',
      jointDevelopmentFlag: false,
      landOwnerName: CENTRAL_BUILDER_MASTER.find((b) => b.id === p.builderId)?.legalName,
      encumbranceFlag: false,
      existingMortgageChargeFlag: false,
      developmentAreaSqFt: p.totalLandAreaAcres * 43560 * 2.5,
      saleableAreaSqFt: p.totalLandAreaAcres * 43560 * 2.2,
      carpetAreaSqFt: p.totalLandAreaAcres * 43560 * 1.6,
      totalSanctionedTowers: 6,
      totalUnitsCount: 840,
      commercialUnitsCount: 24,
      parkingCount: 950,
      constructionStartDate: '2022-06-01',
      expectedCompletionDate: '2027-12-31',
      currentProgressPct: 78,
      constructionStage: 'Superstructure Complete & External Plastering',
      generalContractor: 'Shapoorji Pallonji Engineering & Construction',
      architect: 'Hafeez Contractor',
      structuralConsultant: 'JW Consultants LLP',
      pmcAgency: 'CBRE South Asia Pvt Ltd',
      siteContactName: 'Mahesh Jadhav (Project Site Engineer)',
      siteContactPhone: '+91 98220 44912',
      estimatedProjectCostCr: 450.0,
      landCostCr: 110.0,
      constructionCostCr: 260.0,
      promoterContributionCr: 140.0,
      debtFundingCr: 120.0,
      customerAdvancesCr: 190.0,
      currentProjectDebtCr: 68.0,
      escrowReraBank: 'HDFC Bank Ltd',
      escrowAccountNumber: '50200088921102',
      projectFinanceLenders: ['HDFC Bank', 'Piramal Capital'],
      totalUnitsLaunched: 600,
      soldBookedUnits: 495,
      unsoldUnits: 105,
      salesPct: 82.5,
      avgQuotedRateSqFt: p.city === 'Pune' ? 7600 : 28500,
      avgRealizedRateSqFt: p.city === 'Pune' ? 7450 : 27800,
      collectionPct: 88.2,
      inventoryValueCr: 95.0,
      existingApfFlag: true,
      existingApfNumber: `APF/${p.city.substring(0, 3).toUpperCase()}/2026/00${p.id.replace(/\D/g, '')}`,
      apfApprovalDate: '2025-08-10',
      apfExpiryDate: '2026-10-31',
      apfApprovedTowers: ['Tower E', 'Tower G'],
      apfApprovedRateSqFt: p.city === 'Pune' ? 7450 : 27500,
      apfApprovedLtvPct: 80,
      apfSourcingStatus: 'Active & Sourcing',
      statutoryApprovals: [
        {
          id: `APP-${p.id}-01`,
          approvalType: 'Sanction Plan',
          documentNumber: 'PMRDA/BP/2022/8821',
          issueDate: '2022-03-15',
          validityDate: '2027-03-14',
          issuingAuthority: 'Municipal Planning Authority',
          status: 'Approved',
        },
        {
          id: `APP-${p.id}-02`,
          approvalType: 'Commencement Certificate',
          documentNumber: 'CC/2022/PL-902',
          issueDate: '2022-05-20',
          validityDate: '2027-05-19',
          issuingAuthority: 'Local Municipal Body',
          status: 'Approved',
        },
        {
          id: `APP-${p.id}-03`,
          approvalType: 'Fire NOC',
          documentNumber: 'CFO/NOC/MH/2022/411',
          issueDate: '2022-04-11',
          validityDate: '2027-04-10',
          issuingAuthority: 'Chief Fire Officer',
          status: 'Approved',
        },
        {
          id: `APP-${p.id}-04`,
          approvalType: 'Environment Clearance',
          documentNumber: 'SEIAA/EC/2021/1192',
          issueDate: '2021-12-08',
          validityDate: '2028-12-07',
          issuingAuthority: 'State Environment Authority',
          status: 'Approved',
        },
      ],
      isActive: true,
      approvalStatus: 'APPROVED',
      version: 1,
      createdBy: 'System Seed Initializer',
      createdAt: '2026-09-01 09:00:00',
    }));

    // Enrich phases
    this.phases = CENTRAL_PHASE_MASTER.map((ph) => ({
      ...ph,
      phaseNumber: 'Phase 1',
      reraStartDate: '2022-04-10',
      reraExpiryDate: '2027-12-31',
      phaseStatus: 'Under Construction',
      phaseAreaSqFt: 380000,
      numberOfTowers: 2,
      numberOfUnits: 176,
      launchDate: '2022-05-01',
      currentProgressPct: 82,
      remarks: 'Civil structure complete. Internal electrical piping in progress.',
      isActive: true,
      approvalStatus: 'APPROVED',
      version: 1,
      createdBy: 'System Seed Initializer',
      createdAt: '2026-09-01 09:00:00',
    }));

    // Enrich towers
    this.towers = CENTRAL_TOWER_MASTER.map((t) => ({
      ...t,
      towerCode: t.towerName.replace('Tower ', 'TWR-'),
      buildingNumber: t.towerName.split(' ')[1] || 'E',
      wing: t.towerName.split(' ')[1] || 'E',
      reraTowerReference: `MahaRERA-${t.id}`,
      towerType: 'Residential',
      basementCount: 2,
      podiumCount: 1,
      hasGroundFloor: true,
      habitableFloors: t.floorsSanctioned - 2,
      refugeFloors: 2,
      unitsPerFloor: 4,
      passengerLifts: 3,
      serviceLifts: 1,
      staircases: 2,
      foundationCompletionDate: '2022-09-15',
      plinthCompletionDate: '2022-12-20',
      structuralCompletionDate: '2025-06-30',
      brickworkPct: 95,
      plasterPct: 90,
      mepPct: 75,
      finishingPct: 65,
      expectedCompletionDate: '2027-06-30',
      ocStatus: 'Not Applied',
      baseRateSqFt: 7450,
      floorRisePerFloor: 40,
      preferredLocationCharges: 250,
      viewPremiumSqFt: 150,
      parkingChargesLakh: 3.5,
      amenitiesChargesLakh: 2.5,
      structureType: 'Aluminium Formwork (Mivan)',
      foundationType: 'Raft Foundation',
      constructionQualityGrade: 'A+',
      fireSafetyStatus: 'Compliant & Tested',
      seismicZone: 'Zone III',
      structuralConsultant: 'JW Consultants LLP',
      majorObservations: [
        'High quality Mivan shuttering casting observed.',
        'Slab heights strictly adhere to approved building permissions.',
        'Clear access ramps with dual fire staircases.',
      ],
      lastVisitDate: '2026-08-20',
      lastProgressPct: t.physicalProgressPct,
      lastValuerName: 'M. K. Kulkarni',
      photoCount: 12,
      lastTechnicalGrade: 'A+',
      configurations: [
        {
          id: `CFG-${t.id}-2BHK`,
          configuration: '2 BHK',
          carpetAreaSqFt: 720,
          builtUpAreaSqFt: 936,
          saleableAreaSqFt: 1040,
          numberOfUnits: 44,
          builderQuotedRateSqFt: 7800,
          apfRecommendedRateSqFt: 7450,
        },
        {
          id: `CFG-${t.id}-3BHK`,
          configuration: '3 BHK',
          carpetAreaSqFt: 980,
          builtUpAreaSqFt: 1274,
          saleableAreaSqFt: 1420,
          numberOfUnits: 44,
          builderQuotedRateSqFt: 8100,
          apfRecommendedRateSqFt: 7750,
        },
      ],
      isActive: true,
      approvalStatus: 'APPROVED',
      version: 1,
      createdBy: 'System Seed Initializer',
      createdAt: '2026-09-01 09:00:00',
    }));

    // Enrich units
    this.units = CENTRAL_UNIT_MASTER.map((u) => ({
      ...u,
      builtUpAreaSqFt: Math.round(u.carpetAreaSqFt * 1.3),
      saleableAreaSqFt: Math.round(u.carpetAreaSqFt * 1.45),
      balconyAreaSqFt: 65,
      terraceAreaSqFt: 0,
      facing: 'East',
      viewType: 'Clubhouse View',
      parkingAllotted: 'Covered Stilt',
      builderQuotedRateSqFt: 7800,
      apfApprovedRateSqFt: 7450,
      mortgageStatus: u.loanAccountNumber ? 'Mortgaged to Proval Bank' : 'Clean',
      customerLoanLinkedFlag: !!u.loanAccountNumber,
      lenderName: u.loanAccountNumber ? 'Proval Bank' : undefined,
      sanctionAmountLakh: u.loanAccountNumber ? 52.0 : undefined,
      outstandingAmountLakh: u.loanAccountNumber ? 44.8 : undefined,
      duplicateFinanceAlert: false,
      isActive: true,
    }));
  }

  private seedAuditTrail(): MasterAuditLog[] {
    return [
      {
        id: 'LOG-001',
        entityType: 'BUILDER',
        entityId: 'BLD-PUN-001',
        entityName: 'Kolte-Patil Developers Ltd',
        action: 'CREATE',
        fieldChanged: 'ALL',
        oldValue: '-',
        newValue: 'Initial Master Baseline (Approved)',
        performedBy: 'Siddharth Rao (Admin)',
        performedByRole: 'ADMIN',
        timestamp: '2026-09-01 09:00:00',
        reason: 'Centralized Master Baseline Provisioning',
        approvalStatus: 'APPROVED',
      },
      {
        id: 'LOG-002',
        entityType: 'PROJECT',
        entityId: 'PRJ-PUN-001',
        entityName: 'Life Republic',
        action: 'CREATE',
        fieldChanged: 'ALL',
        oldValue: '-',
        newValue: 'Mapped to Kolte-Patil Developers Ltd',
        performedBy: 'Siddharth Rao (Admin)',
        performedByRole: 'ADMIN',
        timestamp: '2026-09-01 09:05:00',
        reason: 'RERA MahaRERA P52100022154 Verification Complete',
        approvalStatus: 'APPROVED',
      },
    ];
  }

  private saveMasters() {
    try {
      localStorage.setItem(
        STORAGE_KEY_MASTERS,
        JSON.stringify({
          builders: this.builders,
          projects: this.projects,
          phases: this.phases,
          towers: this.towers,
          units: this.units,
        })
      );
      this.notify();
    } catch (e) {
      console.error('Failed to save masters:', e);
    }
  }

  private saveAudit() {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditTrail));
    } catch (e) {
      console.error('Failed to save audit trail:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Maker-Checker Configuration ---
  public isMakerCheckerEnabled(): boolean {
    return this.makerCheckerEnabled;
  }

  public setMakerCheckerEnabled(enabled: boolean) {
    this.makerCheckerEnabled = enabled;
    localStorage.setItem(STORAGE_KEY_MAKER_CHECKER, JSON.stringify(enabled));
    this.notify();
  }

  // --- Duplicate Validations ---

  public checkDuplicateBuilder(
    pan: string,
    cin: string,
    gst: string,
    legalName: string,
    excludeId?: string
  ): DuplicateBuilderResult {
    const cleanPan = pan.trim().toUpperCase();
    const cleanCin = cin.trim().toUpperCase();
    const cleanGst = gst.trim().toUpperCase();
    const cleanName = legalName.trim().toLowerCase();

    for (const b of this.builders) {
      if (excludeId && b.id === excludeId) continue;
      if (cleanPan && b.pan.toUpperCase() === cleanPan) {
        return {
          isDuplicate: true,
          matchingField: 'PAN',
          existingBuilder: b,
          message: `Builder with PAN "${pan}" already exists: ${b.legalName} (${b.id})`,
        };
      }
      if (cleanCin && b.cin.toUpperCase() === cleanCin) {
        return {
          isDuplicate: true,
          matchingField: 'CIN',
          existingBuilder: b,
          message: `Builder with CIN "${cin}" already exists: ${b.legalName} (${b.id})`,
        };
      }
      if (cleanGst && b.gst.toUpperCase() === cleanGst) {
        return {
          isDuplicate: true,
          matchingField: 'GSTIN',
          existingBuilder: b,
          message: `Builder with GSTIN "${gst}" already exists: ${b.legalName} (${b.id})`,
        };
      }
      if (cleanName && b.legalName.toLowerCase() === cleanName) {
        return {
          isDuplicate: true,
          matchingField: 'Legal Name',
          existingBuilder: b,
          message: `Builder with exact Legal Name "${legalName}" already exists: ${b.id}`,
        };
      }
    }
    return { isDuplicate: false };
  }

  public checkDuplicateProject(
    builderId: string,
    projectName: string,
    reraNumbers: string[],
    excludeId?: string
  ): DuplicateProjectResult {
    const cleanName = projectName.trim().toLowerCase();
    const cleanReras = reraNumbers.map((r) => r.trim().toUpperCase());

    for (const p of this.projects) {
      if (excludeId && p.id === excludeId) continue;

      // Check RERA collision
      for (const r of cleanReras) {
        if (r && p.reraNumbers.some((pr) => pr.toUpperCase() === r)) {
          return {
            isDuplicate: true,
            matchingField: 'MahaRERA Registration Number',
            existingProject: p,
            message: `Project with MahaRERA number "${r}" already registered: ${p.projectName} (${p.id})`,
          };
        }
      }

      // Check Builder + Project Name collision
      if (p.builderId === builderId && p.projectName.toLowerCase() === cleanName) {
        return {
          isDuplicate: true,
          matchingField: 'Project Name under same Builder',
          existingProject: p,
          message: `Project "${projectName}" already exists under this builder (${p.id})`,
        };
      }
    }
    return { isDuplicate: false };
  }

  // --- Query Methods ---

  public getBuilders(options?: {
    activeOnly?: boolean;
    approvedOnly?: boolean;
    city?: string;
    search?: string;
  }): BuilderMaster[] {
    return this.builders.filter((b) => {
      if (options?.activeOnly && !b.isActive) return false;
      if (options?.approvedOnly && b.approvalStatus !== 'APPROVED') return false;
      if (options?.city && b.city !== options.city) return false;
      if (options?.search) {
        const q = options.search.toLowerCase();
        return (
          b.legalName.toLowerCase().includes(q) ||
          b.groupName.toLowerCase().includes(q) ||
          b.pan.toLowerCase().includes(q) ||
          b.cin.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  public getBuilderById(id: string): BuilderMaster | undefined {
    return this.builders.find((b) => b.id === id);
  }

  public getProjects(options?: {
    builderId?: string;
    activeOnly?: boolean;
    approvedOnly?: boolean;
    city?: string;
    search?: string;
  }): ProjectMaster[] {
    return this.projects.filter((p) => {
      if (options?.builderId && p.builderId !== options.builderId) return false;
      if (options?.activeOnly && !p.isActive) return false;
      if (options?.approvedOnly && p.approvalStatus !== 'APPROVED') return false;
      if (options?.city && p.city !== options.city) return false;
      if (options?.search) {
        const q = options.search.toLowerCase();
        return (
          p.projectName.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.reraNumbers.some((r) => r.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  public getProjectById(id: string): ProjectMaster | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getPhases(options?: {
    projectId?: string;
    activeOnly?: boolean;
    approvedOnly?: boolean;
  }): PhaseMaster[] {
    return this.phases.filter((ph) => {
      if (options?.projectId && ph.projectId !== options.projectId) return false;
      if (options?.activeOnly && !ph.isActive) return false;
      if (options?.approvedOnly && ph.approvalStatus !== 'APPROVED') return false;
      return true;
    });
  }

  public getPhaseById(id: string): PhaseMaster | undefined {
    return this.phases.find((ph) => ph.id === id);
  }

  public getTowers(options?: {
    phaseId?: string;
    projectId?: string;
    activeOnly?: boolean;
    approvedOnly?: boolean;
  }): TowerMaster[] {
    return this.towers.filter((t) => {
      if (options?.phaseId && t.phaseId !== options.phaseId) return false;
      if (options?.projectId && t.projectId !== options.projectId) return false;
      if (options?.activeOnly && !t.isActive) return false;
      if (options?.approvedOnly && t.approvalStatus !== 'APPROVED') return false;
      return true;
    });
  }

  public getTowerById(id: string): TowerMaster | undefined {
    return this.towers.find((t) => t.id === id);
  }

  public getUnits(options?: {
    towerId?: string;
    activeOnly?: boolean;
  }): UnitMaster[] {
    return this.units.filter((u) => {
      if (options?.towerId && u.towerId !== options.towerId) return false;
      if (options?.activeOnly && !u.isActive) return false;
      return true;
    });
  }

  public getUnitById(id: string): UnitMaster | undefined {
    return this.units.find((u) => u.id === id);
  }

  // --- CRUD: BUILDER ---

  public addBuilder(
    builderData: Partial<BuilderMaster>,
    user: UserAccount,
    overrideReason?: string
  ): BuilderMaster {
    const cityCode = builderData.city === 'Mumbai' ? 'MUM' : 'PUN';
    const nextSeq = this.builders.filter((b) => b.city === builderData.city).length + 1;
    const newId = `BLD-${cityCode}-${String(nextSeq).padStart(3, '0')}`;

    // Determine Maker-Checker status
    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : 'APPROVED';

    const newBuilder: BuilderMaster = {
      id: newId,
      legalName: builderData.legalName || 'New Developer Entity Ltd',
      tradeName: builderData.tradeName || builderData.legalName || 'Developer Brand',
      groupName: builderData.groupName || `${builderData.legalName} Group`,
      pan: builderData.pan?.toUpperCase() || 'AAACB1234D',
      cin: builderData.cin?.toUpperCase() || `U45200MH2020PLC${Math.floor(100000 + Math.random() * 900000)}`,
      gst: builderData.gst?.toUpperCase() || `27${builderData.pan}1Z5`,
      city: builderData.city || 'Pune',
      establishedYear: builderData.establishedYear || 2010,
      promoters: builderData.promoters || ['Director 1'],
      totalProjectsCompleted: builderData.totalProjectsCompleted || 0,
      totalOngoingProjects: builderData.totalOngoingProjects || 1,
      sourceUrl: builderData.sourceUrl || 'https://www.proval-bank.in/masters',
      isActive: true,
      approvalStatus,
      version: 1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...builderData,
    };

    this.builders.unshift(newBuilder);

    this.recordAudit({
      entityType: 'BUILDER',
      entityId: newBuilder.id,
      entityName: newBuilder.legalName,
      action: 'CREATE',
      fieldChanged: 'ALL',
      oldValue: '-',
      newValue: `Created builder with status ${approvalStatus}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: overrideReason || 'New Builder master record created',
      approvalStatus,
    });

    this.saveMasters();
    return newBuilder;
  }

  public updateBuilder(
    id: string,
    updates: Partial<BuilderMaster>,
    user: UserAccount,
    reason: string
  ): BuilderMaster {
    const idx = this.builders.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Builder not found');

    const old = this.builders[idx];
    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : (old.approvalStatus || 'APPROVED');

    const updated: BuilderMaster = {
      ...old,
      ...updates,
      version: (old.version || 1) + 1,
      updatedBy: `${user.name} (${user.role})`,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvalStatus,
    };

    this.builders[idx] = updated;

    this.recordAudit({
      entityType: 'BUILDER',
      entityId: id,
      entityName: updated.legalName,
      action: 'UPDATE',
      fieldChanged: Object.keys(updates).join(', '),
      oldValue: `v${old.version || 1}`,
      newValue: `v${updated.version}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || 'Master record updated',
      approvalStatus,
    });

    this.saveMasters();
    return updated;
  }

  public toggleBuilderActive(id: string, user: UserAccount, reason: string): boolean {
    const b = this.builders.find((x) => x.id === id);
    if (!b) return false;

    const prior = b.isActive !== false;
    b.isActive = !prior;
    b.version = (b.version || 1) + 1;
    b.updatedBy = `${user.name} (${user.role})`;
    b.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.recordAudit({
      entityType: 'BUILDER',
      entityId: id,
      entityName: b.legalName,
      action: b.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      fieldChanged: 'isActive',
      oldValue: String(prior),
      newValue: String(b.isActive),
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || (b.isActive ? 'Reactivated builder entity' : 'Soft deleted / deactivated builder entity'),
      approvalStatus: b.approvalStatus,
    });

    this.saveMasters();
    return true;
  }

  // --- CRUD: PROJECT ---

  public addProject(
    projectData: Partial<ProjectMaster>,
    user: UserAccount,
    overrideReason?: string
  ): ProjectMaster {
    if (!projectData.builderId) throw new Error('Parent Builder ID is mandatory.');

    const cityCode = projectData.city === 'Mumbai' ? 'MUM' : 'PUN';
    const nextSeq = this.projects.filter((p) => p.city === projectData.city).length + 1;
    const newId = `PRJ-${cityCode}-${String(nextSeq).padStart(3, '0')}`;

    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : 'APPROVED';

    const newProject: ProjectMaster = {
      id: newId,
      builderId: projectData.builderId,
      projectName: projectData.projectName || 'New Benchmark Development',
      marketingName: projectData.marketingName || projectData.projectName || 'Development',
      locality: projectData.locality || (projectData.city === 'Pune' ? 'Hinjawadi' : 'Worli'),
      city: projectData.city || 'Pune',
      reraNumbers: projectData.reraNumbers?.length ? projectData.reraNumbers : [`P521000${Math.floor(10000 + Math.random() * 90000)}`],
      address: projectData.address || `Survey No. 88, Near Metro Station, ${projectData.locality || 'Locality'}`,
      latLong: projectData.latLong || (projectData.city === 'Pune' ? { lat: 18.5912, lng: 73.7389 } : { lat: 19.0176, lng: 72.8561 }),
      projectType: projectData.projectType || 'Residential Township',
      totalLandAreaAcres: projectData.totalLandAreaAcres || 10.5,
      publicStatus: 'Under Construction (MahaRERA Registered)',
      sourceUrl: 'https://maharera.mahaonline.gov.in',
      sourceQuality: 'Verified via MahaRERA',
      isActive: true,
      approvalStatus,
      version: 1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...projectData,
    };

    this.projects.unshift(newProject);

    // Also auto-create initial Phase 1 for this new project to keep hierarchy intact
    const phaseId = `PHS-${newProject.id.replace('PRJ-', '')}-01`;
    const defaultPhase: PhaseMaster = {
      id: phaseId,
      projectId: newProject.id,
      phaseName: 'Phase 1',
      phaseNumber: 'Phase 1',
      reraNumber: newProject.reraNumbers[0] || 'P52100022199',
      sanctionDate: new Date().toISOString().substring(0, 10),
      expectedCompletionDate: '2028-12-31',
      phaseStatus: 'Under Construction',
      phaseAreaSqFt: Math.round(newProject.totalLandAreaAcres * 43560 * 1.5),
      numberOfTowers: 1,
      numberOfUnits: 80,
      currentProgressPct: 25,
      isActive: true,
      approvalStatus,
      version: 1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.phases.unshift(defaultPhase);

    this.recordAudit({
      entityType: 'PROJECT',
      entityId: newProject.id,
      entityName: newProject.projectName,
      action: 'CREATE',
      fieldChanged: 'ALL',
      oldValue: '-',
      newValue: `Created project under Builder ${newProject.builderId}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: overrideReason || 'New Project Master record created',
      approvalStatus,
    });

    this.saveMasters();
    return newProject;
  }

  public updateProject(
    id: string,
    updates: Partial<ProjectMaster>,
    user: UserAccount,
    reason: string
  ): ProjectMaster {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');

    const old = this.projects[idx];
    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : (old.approvalStatus || 'APPROVED');

    const updated: ProjectMaster = {
      ...old,
      ...updates,
      version: (old.version || 1) + 1,
      updatedBy: `${user.name} (${user.role})`,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvalStatus,
    };

    this.projects[idx] = updated;

    this.recordAudit({
      entityType: 'PROJECT',
      entityId: id,
      entityName: updated.projectName,
      action: 'UPDATE',
      fieldChanged: Object.keys(updates).join(', '),
      oldValue: `v${old.version || 1}`,
      newValue: `v${updated.version}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || 'Project record updated',
      approvalStatus,
    });

    this.saveMasters();
    return updated;
  }

  public toggleProjectActive(id: string, user: UserAccount, reason: string): boolean {
    const p = this.projects.find((x) => x.id === id);
    if (!p) return false;

    const prior = p.isActive !== false;
    p.isActive = !prior;
    p.version = (p.version || 1) + 1;
    p.updatedBy = `${user.name} (${user.role})`;
    p.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.recordAudit({
      entityType: 'PROJECT',
      entityId: id,
      entityName: p.projectName,
      action: p.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      fieldChanged: 'isActive',
      oldValue: String(prior),
      newValue: String(p.isActive),
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || (p.isActive ? 'Reactivated project' : 'Soft deleted / deactivated project'),
      approvalStatus: p.approvalStatus,
    });

    this.saveMasters();
    return true;
  }

  // --- CRUD: PHASE ---

  public addPhase(phaseData: Partial<PhaseMaster>, user: UserAccount): PhaseMaster {
    if (!phaseData.projectId) throw new Error('Parent Project ID is mandatory.');

    const projectPhases = this.phases.filter((ph) => ph.projectId === phaseData.projectId);
    const nextNum = projectPhases.length + 1;
    const cleanProjId = phaseData.projectId.replace('PRJ-', '');
    const newId = `PHS-${cleanProjId}-${String(nextNum).padStart(2, '0')}`;

    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : 'APPROVED';

    const newPhase: PhaseMaster = {
      id: newId,
      projectId: phaseData.projectId,
      phaseName: phaseData.phaseName || `Phase ${nextNum}`,
      phaseNumber: phaseData.phaseNumber || `Phase ${nextNum}`,
      reraNumber: phaseData.reraNumber || 'P52100022199',
      sanctionDate: phaseData.sanctionDate || new Date().toISOString().substring(0, 10),
      expectedCompletionDate: phaseData.expectedCompletionDate || '2028-12-31',
      phaseStatus: phaseData.phaseStatus || 'Under Construction',
      phaseAreaSqFt: phaseData.phaseAreaSqFt || 250000,
      numberOfTowers: phaseData.numberOfTowers || 1,
      numberOfUnits: phaseData.numberOfUnits || 88,
      currentProgressPct: phaseData.currentProgressPct || 30,
      remarks: phaseData.remarks || '',
      isActive: true,
      approvalStatus,
      version: 1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.phases.unshift(newPhase);

    this.recordAudit({
      entityType: 'PHASE',
      entityId: newPhase.id,
      entityName: newPhase.phaseName,
      action: 'CREATE',
      fieldChanged: 'ALL',
      oldValue: '-',
      newValue: `Created phase under project ${newPhase.projectId}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: 'New Phase added',
      approvalStatus,
    });

    this.saveMasters();
    return newPhase;
  }

  public updatePhase(id: string, updates: Partial<PhaseMaster>, user: UserAccount, reason: string): PhaseMaster {
    const idx = this.phases.findIndex((ph) => ph.id === id);
    if (idx === -1) throw new Error('Phase not found');

    const old = this.phases[idx];
    const updated: PhaseMaster = {
      ...old,
      ...updates,
      version: (old.version || 1) + 1,
      updatedBy: `${user.name} (${user.role})`,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.phases[idx] = updated;

    this.recordAudit({
      entityType: 'PHASE',
      entityId: id,
      entityName: updated.phaseName,
      action: 'UPDATE',
      fieldChanged: Object.keys(updates).join(', '),
      oldValue: `v${old.version || 1}`,
      newValue: `v${updated.version}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || 'Phase updated',
      approvalStatus: updated.approvalStatus,
    });

    this.saveMasters();
    return updated;
  }

  public togglePhaseActive(id: string, user: UserAccount, reason: string): boolean {
    const ph = this.phases.find((x) => x.id === id);
    if (!ph) return false;

    const prior = ph.isActive;
    ph.isActive = !prior;
    ph.version = (ph.version || 1) + 1;
    ph.updatedBy = `${user.name} (${user.role})`;
    ph.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.recordAudit({
      entityType: 'PHASE',
      entityId: id,
      entityName: ph.phaseName,
      action: ph.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      fieldChanged: 'isActive',
      oldValue: String(prior),
      newValue: String(ph.isActive),
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || (ph.isActive ? 'Reactivated phase' : 'Deactivated phase'),
      approvalStatus: ph.approvalStatus,
    });

    this.saveMasters();
    return true;
  }

  // --- CRUD: TOWER ---

  public addTower(towerData: Partial<TowerMaster>, user: UserAccount): TowerMaster {
    if (!towerData.projectId || !towerData.phaseId) {
      throw new Error('Parent Project ID and Phase ID are mandatory.');
    }

    const cleanProjId = towerData.projectId.replace('PRJ-', '');
    const cleanName = (towerData.towerName || 'Tower A').replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase() || 'A';
    const newId = `TWR-${cleanProjId}-${cleanName}-${Date.now().toString().slice(-3)}`;

    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : 'APPROVED';

    const newTower: TowerMaster = {
      id: newId,
      projectId: towerData.projectId,
      phaseId: towerData.phaseId,
      towerName: towerData.towerName || `Tower ${cleanName}`,
      towerCode: towerData.towerCode || `TWR-${cleanName}`,
      buildingNumber: towerData.buildingNumber || cleanName,
      wing: towerData.wing || cleanName,
      floorsSanctioned: towerData.floorsSanctioned || 22,
      floorsConstructed: towerData.floorsConstructed || 14,
      slabsCompleted: towerData.slabsCompleted || 14,
      totalUnits: towerData.totalUnits || 88,
      constructionStage: towerData.constructionStage || 'Superstructure in Progress',
      physicalProgressPct: towerData.physicalProgressPct || 65,
      expectedProgressPct: towerData.expectedProgressPct || 70,
      baseRateSqFt: towerData.baseRateSqFt || 7450,
      structureType: towerData.structureType || 'Aluminium Formwork (Mivan)',
      constructionQualityGrade: towerData.constructionQualityGrade || 'A+',
      isActive: true,
      approvalStatus,
      version: 1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...towerData,
    };

    this.towers.unshift(newTower);

    this.recordAudit({
      entityType: 'TOWER',
      entityId: newTower.id,
      entityName: newTower.towerName,
      action: 'CREATE',
      fieldChanged: 'ALL',
      oldValue: '-',
      newValue: `Created tower in Phase ${newTower.phaseId}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: 'New Tower Master record created',
      approvalStatus,
    });

    this.saveMasters();
    return newTower;
  }

  public updateTower(id: string, updates: Partial<TowerMaster>, user: UserAccount, reason: string): TowerMaster {
    const idx = this.towers.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tower not found');

    const old = this.towers[idx];
    const approvalStatus: MasterApprovalStatus =
      this.makerCheckerEnabled && user.role === 'CPA' ? 'PENDING_MASTER_APPROVAL' : (old.approvalStatus || 'APPROVED');

    const updated: TowerMaster = {
      ...old,
      ...updates,
      version: (old.version || 1) + 1,
      updatedBy: `${user.name} (${user.role})`,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvalStatus,
    };

    this.towers[idx] = updated;

    this.recordAudit({
      entityType: 'TOWER',
      entityId: id,
      entityName: updated.towerName,
      action: 'UPDATE',
      fieldChanged: Object.keys(updates).join(', '),
      oldValue: `v${old.version || 1}`,
      newValue: `v${updated.version}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || 'Tower updated',
      approvalStatus,
    });

    this.saveMasters();
    return updated;
  }

  public toggleTowerActive(id: string, user: UserAccount, reason: string): boolean {
    const t = this.towers.find((x) => x.id === id);
    if (!t) return false;

    const prior = t.isActive !== false;
    t.isActive = !prior;
    t.version = (t.version || 1) + 1;
    t.updatedBy = `${user.name} (${user.role})`;
    t.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.recordAudit({
      entityType: 'TOWER',
      entityId: id,
      entityName: t.towerName,
      action: t.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      fieldChanged: 'isActive',
      oldValue: String(prior),
      newValue: String(t.isActive),
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || (t.isActive ? 'Reactivated tower' : 'Deactivated tower'),
      approvalStatus: t.approvalStatus,
    });

    this.saveMasters();
    return true;
  }

  // --- CRUD & BULK GENERATE: UNITS ---

  public addUnit(unitData: Partial<UnitMaster>, user: UserAccount): UnitMaster {
    if (!unitData.towerId) throw new Error('Parent Tower ID is mandatory.');

    const newId = `UNT-${unitData.towerId.replace('TWR-', '')}-${unitData.unitNumber || '101'}`;
    const newUnit: UnitMaster = {
      id: newId,
      towerId: unitData.towerId,
      unitNumber: unitData.unitNumber || '101',
      floorNumber: unitData.floorNumber || 1,
      typology: unitData.typology || '2 BHK',
      carpetAreaSqFt: unitData.carpetAreaSqFt || 720,
      agreementValueLakh: unitData.agreementValueLakh || 65.5,
      status: unitData.status || 'Available',
      isSimulatedPocUnit: true,
      isActive: true,
      ...unitData,
    };

    this.units.unshift(newUnit);

    this.recordAudit({
      entityType: 'UNIT',
      entityId: newUnit.id,
      entityName: `Unit ${newUnit.unitNumber}`,
      action: 'CREATE',
      fieldChanged: 'ALL',
      oldValue: '-',
      newValue: `Created unit in Tower ${newUnit.towerId}`,
      performedBy: user.name,
      performedByRole: user.role,
      reason: 'Unit created',
      approvalStatus: 'APPROVED',
    });

    this.saveMasters();
    return newUnit;
  }

  public bulkGenerateUnits(
    paramsOrTowerId:
      | string
      | {
          towerId: string;
          startFloor: number;
          endFloor: number;
          unitsPerFloor: number;
          typology: string;
          carpetAreaSqFt: number;
          agreementValueLakh: number;
          prefix?: string;
        },
    unitsOrUser: any,
    maybeUser?: UserAccount
  ): UnitMaster[] {
    if (typeof paramsOrTowerId === 'string') {
      const towerId = paramsOrTowerId;
      const unitList = unitsOrUser as Partial<UnitMaster>[];
      const user = maybeUser || { id: 'USR-CPA-01', name: 'Priya Sharma', role: 'CPA', email: 'priya@proval.bank' } as UserAccount;
      const tower = this.getTowerById(towerId);

      const createdList: UnitMaster[] = unitList.map((u, idx) => {
        const uId = u.id || `UNT-${towerId.replace('TWR-', '')}-${u.unitNumber || idx + 1}`;
        return {
          id: uId,
          towerId,
          unitNumber: u.unitNumber || `U-${idx + 1}`,
          floorNumber: u.floorNumber || 1,
          wing: u.wing || tower?.wing || 'Wing A',
          typology: u.typology || u.configuration || '2 BHK',
          configuration: u.configuration || u.typology || '2 BHK',
          carpetAreaSqFt: u.carpetAreaSqFt || 750,
          builtUpAreaSqFt: u.builtUpAreaSqFt || Math.round((u.carpetAreaSqFt || 750) * 1.3),
          saleableAreaSqFt: u.saleableAreaSqFt || Math.round((u.carpetAreaSqFt || 750) * 1.45),
          agreementValueLakh: u.agreementValueLakh || 65,
          status: (u.status as any) || 'Available',
          isSimulatedPocUnit: true,
          isActive: u.isActive !== false,
          floorSanctioned: u.floorSanctioned !== false,
          violationFlag: !!u.violationFlag,
          apfDisbursementStatus: u.apfDisbursementStatus || 'Eligible',
          ...u,
        };
      });

      this.units.unshift(...createdList);
      if (tower) {
        tower.totalUnits = this.units.filter((u) => u.towerId === towerId).length;
      }

      this.recordAudit({
        entityType: 'UNIT',
        entityId: towerId,
        entityName: `Bulk Imported ${createdList.length} Units`,
        action: 'CREATE',
        fieldChanged: 'Bulk Units',
        oldValue: '-',
        newValue: `${createdList.length} Units generated`,
        performedBy: user.name,
        performedByRole: user.role,
        reason: `Bulk generation of units for Tower ${towerId}`,
        approvalStatus: 'APPROVED',
      });

      this.saveMasters();
      return createdList;
    }

    const { towerId, startFloor, endFloor, unitsPerFloor, typology, carpetAreaSqFt, agreementValueLakh, prefix } = paramsOrTowerId;
    const user = unitsOrUser as UserAccount;
    const tower = this.getTowerById(towerId);
    const towerPrefix = prefix || tower?.towerName.replace('Tower ', '') || 'E';

    const generatedUnits: UnitMaster[] = [];

    for (let floor = startFloor; floor <= endFloor; floor++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumFormatted = floor * 100 + u; // e.g. floor 1, unit 1 => 101; floor 20, unit 4 => 2004
        const unitLabel = `${towerPrefix}-${unitNumFormatted}`;
        const unitId = `UNT-${towerId.replace('TWR-', '')}-${unitNumFormatted}`;

        // Check if unit already exists
        const existing = this.units.find((x) => x.id === unitId || (x.towerId === towerId && x.unitNumber === unitLabel));
        if (existing) continue;

        const newUnit: UnitMaster = {
          id: unitId,
          towerId,
          unitNumber: unitLabel,
          floorNumber: floor,
          typology,
          carpetAreaSqFt,
          builtUpAreaSqFt: Math.round(carpetAreaSqFt * 1.3),
          saleableAreaSqFt: Math.round(carpetAreaSqFt * 1.45),
          agreementValueLakh,
          status: 'Available',
          isSimulatedPocUnit: true,
          isActive: true,
          facing: u % 2 === 0 ? 'East' : 'West',
          viewType: floor > 10 ? 'Clubhouse View' : 'Garden View',
          parkingAllotted: 'Covered Stilt',
          duplicateFinanceAlert: false,
          customerLoanLinkedFlag: false,
        };

        generatedUnits.push(newUnit);
      }
    }

    if (generatedUnits.length > 0) {
      this.units.unshift(...generatedUnits);

      // Update tower total units count
      if (tower) {
        tower.totalUnits = this.units.filter((u) => u.towerId === towerId).length;
      }

      this.recordAudit({
        entityType: 'UNIT',
        entityId: towerId,
        entityName: `Bulk Generated ${generatedUnits.length} units`,
        action: 'CREATE',
        fieldChanged: 'Bulk Units',
        oldValue: '-',
        newValue: `${generatedUnits.length} Units generated for floors ${startFloor} to ${endFloor}`,
        performedBy: user.name,
        performedByRole: user.role,
        reason: `Bulk generation of units under Tower ${towerId}`,
        approvalStatus: 'APPROVED',
      });

      this.saveMasters();
    }

    return generatedUnits;
  }

  public toggleUnitActive(id: string, user: UserAccount, reason: string): boolean {
    const u = this.units.find((x) => x.id === id);
    if (!u) return false;

    const prior = u.isActive;
    u.isActive = !prior;

    this.recordAudit({
      entityType: 'UNIT',
      entityId: id,
      entityName: `Unit ${u.unitNumber}`,
      action: u.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      fieldChanged: 'isActive',
      oldValue: String(prior),
      newValue: String(u.isActive),
      performedBy: user.name,
      performedByRole: user.role,
      reason: reason || (u.isActive ? 'Reactivated unit' : 'Deactivated unit'),
      approvalStatus: 'APPROVED',
    });

    this.saveMasters();
    return true;
  }

  // --- MAKER-CHECKER WORKFLOW: APPROVE / REJECT ---

  public approveMasterRecord(
    entityType: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER',
    id: string,
    user: UserAccount,
    remarks?: string
  ): boolean {
    let entityName = id;

    if (entityType === 'BUILDER') {
      const b = this.builders.find((x) => x.id === id);
      if (!b) return false;
      b.approvalStatus = 'APPROVED';
      b.updatedBy = `${user.name} (${user.role})`;
      b.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      entityName = b.legalName;
    } else if (entityType === 'PROJECT') {
      const p = this.projects.find((x) => x.id === id);
      if (!p) return false;
      p.approvalStatus = 'APPROVED';
      p.updatedBy = `${user.name} (${user.role})`;
      p.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      entityName = p.projectName;
    } else if (entityType === 'PHASE') {
      const ph = this.phases.find((x) => x.id === id);
      if (!ph) return false;
      ph.approvalStatus = 'APPROVED';
      entityName = ph.phaseName;
    } else if (entityType === 'TOWER') {
      const t = this.towers.find((x) => x.id === id);
      if (!t) return false;
      t.approvalStatus = 'APPROVED';
      t.updatedBy = `${user.name} (${user.role})`;
      t.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      entityName = t.towerName;
    }

    this.recordAudit({
      entityType,
      entityId: id,
      entityName,
      action: 'APPROVE',
      fieldChanged: 'approvalStatus',
      oldValue: 'PENDING_MASTER_APPROVAL',
      newValue: 'APPROVED',
      performedBy: user.name,
      performedByRole: user.role,
      reason: remarks || 'Checker approval granted. Entity is now active in APF production.',
      approvalStatus: 'APPROVED',
    });

    this.saveMasters();
    return true;
  }

  public rejectMasterRecord(
    entityType: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER',
    id: string,
    user: UserAccount,
    remarks: string
  ): boolean {
    let entityName = id;

    if (entityType === 'BUILDER') {
      const b = this.builders.find((x) => x.id === id);
      if (!b) return false;
      b.approvalStatus = 'REJECTED';
      entityName = b.legalName;
    } else if (entityType === 'PROJECT') {
      const p = this.projects.find((x) => x.id === id);
      if (!p) return false;
      p.approvalStatus = 'REJECTED';
      entityName = p.projectName;
    } else if (entityType === 'PHASE') {
      const ph = this.phases.find((x) => x.id === id);
      if (!ph) return false;
      ph.approvalStatus = 'REJECTED';
      entityName = ph.phaseName;
    } else if (entityType === 'TOWER') {
      const t = this.towers.find((x) => x.id === id);
      if (!t) return false;
      t.approvalStatus = 'REJECTED';
      entityName = t.towerName;
    }

    this.recordAudit({
      entityType,
      entityId: id,
      entityName,
      action: 'REJECT',
      fieldChanged: 'approvalStatus',
      oldValue: 'PENDING_MASTER_APPROVAL',
      newValue: 'REJECTED',
      performedBy: user.name,
      performedByRole: user.role,
      reason: remarks || 'Checker rejected master record changes.',
      approvalStatus: 'REJECTED',
    });

    this.saveMasters();
    return true;
  }

  public getPendingApprovals(): MasterApprovalItem[] {
    const list: MasterApprovalItem[] = [];

    this.builders
      .filter((b) => b.approvalStatus === 'PENDING_MASTER_APPROVAL')
      .forEach((b) => {
        list.push({
          id: b.id,
          entityId: b.id,
          entityType: 'BUILDER',
          entityName: b.legalName,
          name: b.legalName,
          submittedBy: b.updatedBy || b.createdBy || 'CPA Maker',
          createdBy: b.createdBy || 'CPA Maker',
          submittedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
          createdAt: b.createdAt || new Date().toISOString(),
          parentInfo: b.groupName,
          changeSummary: `Developer Entity (PAN: ${b.pan}, Group: ${b.groupName})`,
          summary: `Developer Entity (PAN: ${b.pan}, Group: ${b.groupName})`,
          version: b.version,
        });
      });

    this.projects
      .filter((p) => p.approvalStatus === 'PENDING_MASTER_APPROVAL')
      .forEach((p) => {
        const b = this.getBuilderById(p.builderId);
        list.push({
          id: p.id,
          entityId: p.id,
          entityType: 'PROJECT',
          entityName: p.projectName,
          name: p.projectName,
          submittedBy: p.updatedBy || p.createdBy || 'CPA Maker',
          createdBy: p.createdBy || 'CPA Maker',
          submittedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
          createdAt: p.createdAt || new Date().toISOString(),
          parentInfo: b?.legalName || p.builderId,
          changeSummary: `Project (City: ${p.city}, Towers: ${p.totalSanctionedTowers || '-'}, RERA: ${p.reraNumbers.join(', ')})`,
          summary: `Project (Builder: ${p.builderId}, RERA: ${p.reraNumbers.join(', ')})`,
          version: p.version,
        });
      });

    this.phases
      .filter((ph) => ph.approvalStatus === 'PENDING_MASTER_APPROVAL')
      .forEach((ph) => {
        const prj = this.getProjectById(ph.projectId);
        list.push({
          id: ph.id,
          entityId: ph.id,
          entityType: 'PHASE',
          entityName: ph.phaseName,
          name: ph.phaseName,
          submittedBy: ph.updatedBy || ph.createdBy || 'CPA Maker',
          createdBy: ph.createdBy || 'CPA Maker',
          submittedAt: ph.updatedAt || ph.createdAt || new Date().toISOString(),
          createdAt: ph.createdAt || new Date().toISOString(),
          parentInfo: prj?.projectName || ph.projectId,
          changeSummary: `Phase (RERA: ${ph.reraNumber})`,
          summary: `Phase (${ph.phaseName}, RERA: ${ph.reraNumber})`,
          version: ph.version,
        });
      });

    this.towers
      .filter((t) => t.approvalStatus === 'PENDING_MASTER_APPROVAL')
      .forEach((t) => {
        const prj = this.getProjectById(t.projectId);
        list.push({
          id: t.id,
          entityId: t.id,
          entityType: 'TOWER',
          entityName: t.towerName,
          name: t.towerName,
          submittedBy: t.updatedBy || t.createdBy || 'CPA Maker',
          createdBy: t.createdBy || 'CPA Maker',
          submittedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
          createdAt: t.createdAt || new Date().toISOString(),
          parentInfo: prj?.projectName || t.projectId,
          changeSummary: `Tower (Floors: ${t.floorsSanctioned}, Progress: ${t.physicalProgressPct}%)`,
          summary: `Tower (Project: ${t.projectId}, Floors: ${t.floorsSanctioned})`,
          version: t.version,
        });
      });

    return list;
  }

  // --- AUDIT HISTORY ---

  private recordAudit(entry: Omit<MasterAuditLog, 'id' | 'timestamp'>) {
    const logItem: MasterAuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry,
    };
    this.auditTrail.unshift(logItem);
    this.saveAudit();
  }

  public getAuditHistory(entityType?: string, entityId?: string): MasterAuditLog[] {
    return this.auditTrail.filter((item) => {
      if (entityType && item.entityType !== entityType) return false;
      if (entityId && item.entityId !== entityId) return false;
      return true;
    });
  }

  // --- EXPORT TO CSV ---

  public exportToCsv(entityType: 'BUILDER' | 'PROJECT' | 'TOWER' | 'UNIT') {
    let rows: any[] = [];
    let filename = `proval_${entityType.toLowerCase()}_master.csv`;

    if (entityType === 'BUILDER') {
      rows = this.builders.map((b) => ({
        BuilderID: b.id,
        LegalName: b.legalName,
        GroupName: b.groupName,
        PAN: b.pan,
        CIN: b.cin,
        GSTIN: b.gst,
        City: b.city,
        EstablishedYear: b.establishedYear,
        CompletedProjects: b.totalProjectsCompleted,
        OngoingProjects: b.totalOngoingProjects,
        RiskGrade: b.internalRiskGrade || 'A+',
        Status: b.isActive ? 'Active' : 'Inactive',
        ApprovalStatus: b.approvalStatus,
        CreatedBy: b.createdBy,
        CreatedAt: b.createdAt,
      }));
    } else if (entityType === 'PROJECT') {
      rows = this.projects.map((p) => {
        const builder = this.getBuilderById(p.builderId);
        const towers = this.getTowers({ projectId: p.id });
        return {
          ProjectID: p.id,
          BuilderID: p.builderId,
          BuilderName: builder?.legalName || p.builderId,
          ProjectName: p.projectName,
          MahaRERA: p.reraNumbers.join('; '),
          City: p.city,
          Locality: p.locality,
          ProjectType: p.projectType,
          TowersCount: towers.length,
          CurrentProgressPct: `${p.currentProgressPct || 70}%`,
          APFStatus: p.apfSourcingStatus || 'Active',
          Status: p.isActive ? 'Active' : 'Inactive',
          ApprovalStatus: p.approvalStatus,
        };
      });
    } else if (entityType === 'TOWER') {
      rows = this.towers.map((t) => {
        const prj = this.getProjectById(t.projectId);
        return {
          TowerID: t.id,
          ProjectID: t.projectId,
          ProjectName: prj?.projectName || t.projectId,
          PhaseID: t.phaseId,
          TowerName: t.towerName,
          SanctionedFloors: t.floorsSanctioned,
          ConstructedFloors: t.floorsConstructed,
          ProgressPct: `${t.physicalProgressPct}%`,
          ConstructionStage: t.constructionStage,
          QualityGrade: t.constructionQualityGrade || 'A+',
          OCStatus: t.ocStatus || 'Not Applied',
          Status: t.isActive ? 'Active' : 'Inactive',
          ApprovalStatus: t.approvalStatus,
        };
      });
    } else if (entityType === 'UNIT') {
      rows = this.units.map((u) => ({
        UnitID: u.id,
        TowerID: u.towerId,
        UnitNumber: u.unitNumber,
        FloorNumber: u.floorNumber,
        Typology: u.typology,
        CarpetAreaSqFt: u.carpetAreaSqFt,
        AgreementValueLakh: u.agreementValueLakh,
        BookingStatus: u.status,
        LoanLinked: u.customerLoanLinkedFlag ? 'Yes' : 'No',
        Borrower: u.borrowerName || '',
        LoanAccount: u.loanAccountNumber || '',
        Status: u.isActive ? 'Active' : 'Inactive',
      }));
    }

    if (rows.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows.map((r) => Object.values(r).map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Selectable Queries for Production APF Transactions (Active & Approved Only) ---
  public getSelectableBuilders(): BuilderMaster[] {
    return this.builders.filter(
      (b) => b.isActive !== false && (b.approvalStatus === 'APPROVED' || !b.approvalStatus)
    );
  }

  public getSelectableProjects(builderId?: string): ProjectMaster[] {
    return this.projects.filter((p) => {
      if (builderId && p.builderId !== builderId) return false;
      return p.isActive !== false && (p.approvalStatus === 'APPROVED' || !p.approvalStatus);
    });
  }

  public getSelectablePhases(projectId: string): PhaseMaster[] {
    return this.phases.filter(
      (ph) => ph.projectId === projectId && ph.isActive !== false && (ph.approvalStatus === 'APPROVED' || !ph.approvalStatus)
    );
  }

  public getSelectableTowers(projectId: string, phaseId?: string): TowerMaster[] {
    return this.towers.filter((t) => {
      if (t.projectId !== projectId) return false;
      if (phaseId && t.phaseId !== phaseId) return false;
      return t.isActive !== false && (t.approvalStatus === 'APPROVED' || !t.approvalStatus);
    });
  }

  // --- Generic Aliases ---
  public getAuditLogs(entityType?: string, entityId?: string): MasterAuditLog[] {
    return this.getAuditHistory(entityType?.toUpperCase(), entityId);
  }

  public toggleActive(
    entityType: 'BUILDER' | 'PROJECT' | 'PHASE' | 'TOWER' | 'UNIT' | 'Builder' | 'Project' | 'Phase' | 'Tower' | 'Unit',
    id: string,
    user: UserAccount,
    reason: string
  ): boolean {
    const typeUpper = entityType.toUpperCase();
    if (typeUpper === 'BUILDER') return this.toggleBuilderActive(id, user, reason);
    if (typeUpper === 'PROJECT') return this.toggleProjectActive(id, user, reason);
    if (typeUpper === 'TOWER') return this.toggleTowerActive(id, user, reason);
    if (typeUpper === 'UNIT') return this.toggleUnitActive(id, user, reason);
    return false;
  }

  // --- Reset to Demo Defaults ---
  public resetDemoMasters() {
    localStorage.removeItem(STORAGE_KEY_MASTERS);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    this.seedInitialMasters();
    this.auditTrail = this.seedAuditTrail();
    this.saveMasters();
    this.saveAudit();
    this.notify();
  }
}

export const masterStore = new MasterDataStore();
