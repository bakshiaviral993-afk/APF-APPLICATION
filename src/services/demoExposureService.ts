// Bank-Grade Demo Exposure Service
// Supports all 10 Builders (5 Pune, 5 Mumbai)
// Manages simulated fetch, reconciliation, and immutable Exposure Snapshots

import {
  BuilderExposureResponse,
  BuilderExposureSummary,
  DemoLenderFacility,
  DemoProjectExposure,
  DemoGroupEntity,
  DemoSourceFetchStatus,
  DemoReconciliationItem,
  ExposureSnapshot,
  ExposureService,
  DemoReconciliationStatus,
  ExposureRiskBand,
} from '../types/demoExposureTypes';
import {
  DEMO_EXPOSURE_SUMMARIES,
  DEMO_LENDER_FACILITIES,
  DEMO_PROJECT_EXPOSURES,
  DEMO_GROUP_ENTITIES,
  DEMO_SOURCE_FETCH_STATUSES,
  DEMO_RECONCILIATION_ITEMS,
} from '../data/demoExposureDataset';
import { masterStore } from './masterStore';

const STORAGE_KEY_EXPOSURE_SNAPSHOTS = 'PROVAL_APF_EXPOSURE_SNAPSHOTS_V1';
const STORAGE_KEY_EXPOSURE_RECONCILIATION = 'PROVAL_APF_EXPOSURE_RECON_V1';
const STORAGE_KEY_BUILDER_FETCH_TIMESTAMPS = 'PROVAL_APF_BUILDER_FETCH_TIMESTAMPS_V1';

class DemoExposureServiceImpl implements ExposureService {
  private snapshots: ExposureSnapshot[] = [];
  private reconciliationOverrides: Record<string, DemoReconciliationItem> = {};
  private fetchTimestamps: Record<string, string> = {};

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const snapData = localStorage.getItem(STORAGE_KEY_EXPOSURE_SNAPSHOTS);
      if (snapData) {
        this.snapshots = JSON.parse(snapData);
      }
    } catch (e) {
      console.warn('Failed to load exposure snapshots from storage', e);
    }

    try {
      const reconData = localStorage.getItem(STORAGE_KEY_EXPOSURE_RECONCILIATION);
      if (reconData) {
        this.reconciliationOverrides = JSON.parse(reconData);
      }
    } catch (e) {
      console.warn('Failed to load reconciliation overrides', e);
    }

    try {
      const timeData = localStorage.getItem(STORAGE_KEY_BUILDER_FETCH_TIMESTAMPS);
      if (timeData) {
        this.fetchTimestamps = JSON.parse(timeData);
      }
    } catch (e) {
      console.warn('Failed to load fetch timestamps', e);
    }
  }

  private saveSnapshots() {
    try {
      localStorage.setItem(STORAGE_KEY_EXPOSURE_SNAPSHOTS, JSON.stringify(this.snapshots));
    } catch (e) {
      console.error('Failed to save exposure snapshots', e);
    }
  }

  private saveReconciliation() {
    try {
      localStorage.setItem(STORAGE_KEY_EXPOSURE_RECONCILIATION, JSON.stringify(this.reconciliationOverrides));
    } catch (e) {
      console.error('Failed to save reconciliation overrides', e);
    }
  }

  private saveFetchTimestamps() {
    try {
      localStorage.setItem(STORAGE_KEY_BUILDER_FETCH_TIMESTAMPS, JSON.stringify(this.fetchTimestamps));
    } catch (e) {
      console.error('Failed to save fetch timestamps', e);
    }
  }

  public getBuilderSummary(builderId: string): BuilderExposureSummary {
    const lastFetch = this.fetchTimestamps[builderId];
    if (DEMO_EXPOSURE_SUMMARIES[builderId]) {
      const summary = DEMO_EXPOSURE_SUMMARIES[builderId];
      return {
        ...summary,
        lastRefresh: lastFetch || summary.lastRefresh || '2026-09-21',
      };
    }

    // Dynamic resolution for new / fetched builder from MasterStore
    const b = masterStore.getBuilderById(builderId);
    if (b) {
      const directOut = b.totalExposureCr || 120.0;
      const directSanc = Math.round(directOut * 1.35 * 10) / 10;
      const nonFund = 24.5;
      const projFin = Math.round(directOut * 0.65 * 10) / 10;
      const existApf = 45.0;
      const retailOut = Math.round(directOut * 1.55 * 10) / 10;
      const retailPipe = 28.0;
      const grpExpo = Math.round(directOut * 2.1 * 10) / 10;
      const proposed = 35.0;
      const postAppr = Math.round((grpExpo + proposed) * 10) / 10;
      const limit = Math.round(directOut * 3.0 * 10) / 10;
      const utilPct = Math.round((grpExpo / limit) * 1000) / 10;
      const riskBand: ExposureRiskBand =
        b.internalRiskGrade?.startsWith('A')
          ? 'LOW'
          : b.internalRiskGrade?.startsWith('B')
          ? 'MEDIUM'
          : 'HIGH';

      return {
        builderId: b.id,
        builderName: b.legalName,
        city: b.city,
        directSanctionedCr: directSanc,
        directOutstandingCr: directOut,
        nonFundCr: nonFund,
        projectFinanceCr: projFin,
        existingApfCr: existApf,
        retailLinkedOutstandingCr: retailOut,
        retailPipelineCr: retailPipe,
        groupExposureCr: grpExpo,
        proposedApfCr: proposed,
        postApprovalGroupExposureCr: postAppr,
        limitCr: limit,
        limitUtilizationPct: utilPct,
        riskBand,
        pocLabel: 'SIMULATED POC DATA',
        lastRefresh: lastFetch || new Date().toISOString().replace('T', ' ').slice(0, 10),
      };
    }

    const fallback = DEMO_EXPOSURE_SUMMARIES['BLD-PUN-001'];
    return {
      ...fallback,
      lastRefresh: lastFetch || fallback.lastRefresh || '2026-09-21',
    };
  }

  public getAllSummaries(): Record<string, BuilderExposureSummary> {
    const result: Record<string, BuilderExposureSummary> = {};
    for (const id in DEMO_EXPOSURE_SUMMARIES) {
      result[id] = this.getBuilderSummary(id);
    }
    const storeBuilders = masterStore.getBuilders();
    for (const b of storeBuilders) {
      if (!result[b.id]) {
        result[b.id] = this.getBuilderSummary(b.id);
      }
    }
    return result;
  }

  public async getLenderExposure(builderId: string): Promise<DemoLenderFacility[]> {
    const facilities = DEMO_LENDER_FACILITIES.filter((f) => f.builderId === builderId);
    if (facilities.length > 0) return facilities;

    const b = masterStore.getBuilderById(builderId);
    if (b) {
      const directOut = b.totalExposureCr || 120.0;
      return [
        {
          facilityId: `FAC-${b.id}-001`,
          builderId: b.id,
          builderName: b.legalName,
          lender: 'State Bank of India (Consortium Lead)',
          facilityType: 'Term Loan / Project CF',
          projectId: null,
          sanctionCr: Math.round(directOut * 0.55 * 10) / 10,
          outstandingCr: Math.round(directOut * 0.42 * 10) / 10,
          undrawnCr: Math.round(directOut * 0.13 * 10) / 10,
          nonFundCr: 0,
          security: 'Pari-passu first charge on project land & receivables',
          source: 'MCA 21 Index of Charges & Bureau Registers',
          asOf: '2026-03-31',
          pocLabel: 'SIMULATED POC DATA',
          status: 'VERIFIED',
          borrowerEntity: b.legalName,
        },
        {
          facilityId: `FAC-${b.id}-002`,
          builderId: b.id,
          builderName: b.legalName,
          lender: 'HDFC Bank Ltd',
          facilityType: 'Construction Finance',
          projectId: null,
          sanctionCr: Math.round(directOut * 0.45 * 10) / 10,
          outstandingCr: Math.round(directOut * 0.35 * 10) / 10,
          undrawnCr: Math.round(directOut * 0.1 * 10) / 10,
          nonFundCr: 0,
          security: 'First exclusive charge on Phase inventory & escrow account',
          source: 'MCA 21 Index of Charges & Bureau Registers',
          asOf: '2026-03-31',
          pocLabel: 'SIMULATED POC DATA',
          status: 'VERIFIED',
          borrowerEntity: b.legalName,
        },
        {
          facilityId: `FAC-${b.id}-003`,
          builderId: b.id,
          builderName: b.legalName,
          lender: 'ICICI Bank Ltd',
          facilityType: 'Bank Guarantee / Non-Fund',
          projectId: null,
          sanctionCr: 25.0,
          outstandingCr: 12.0,
          undrawnCr: 13.0,
          nonFundCr: 20.0,
          security: 'First pari-passu charge on movable assets and corporate guarantee',
          source: 'MCA 21 Index of Charges & Bureau Registers',
          asOf: '2026-03-31',
          pocLabel: 'SIMULATED POC DATA',
          status: 'VERIFIED',
          borrowerEntity: b.legalName,
        },
        {
          facilityId: `FAC-${b.id}-004`,
          builderId: b.id,
          builderName: b.legalName,
          lender: 'Axis Bank Ltd',
          facilityType: 'Working Capital Line',
          projectId: null,
          sanctionCr: 30.0,
          outstandingCr: Math.round(directOut * 0.23 * 10) / 10,
          undrawnCr: Math.round((30.0 - directOut * 0.23) * 10) / 10,
          nonFundCr: 5.0,
          security: 'Hypothecation of general receivables and promoter guarantee',
          source: 'MCA 21 Index of Charges & Bureau Registers',
          asOf: '2026-03-31',
          pocLabel: 'SIMULATED POC DATA',
          status: 'VERIFIED',
          borrowerEntity: b.legalName,
        },
      ];
    }

    // Fallback to first builder if requested builder not found
    return DEMO_LENDER_FACILITIES.filter((f) => f.builderId === 'BLD-PUN-001');
  }

  public async getProjectExposure(builderId: string): Promise<DemoProjectExposure[]> {
    const projects = DEMO_PROJECT_EXPOSURES.filter((p) => p.builderId === builderId);
    if (projects.length > 0) return projects;

    const b = masterStore.getBuilderById(builderId);
    if (b) {
      const storeProjects = masterStore.getProjects({ builderId });
      if (storeProjects.length > 0) {
        return storeProjects.map((p, idx) => {
          const towerNames = masterStore.getTowers({ projectId: p.id }).map((t) => t.towerName);
          return {
            projectId: p.id,
            builderId: b.id,
            builderName: b.legalName,
            projectName: p.projectName,
            city: p.city,
            rera: p.reraNumbers[0] || 'P52100052957',
            towers: towerNames.length > 0 ? towerNames : ['Tower A', 'Tower B'],
            projectFinanceSanctionCr: 120.0 + idx * 25,
            projectFinanceOutstandingCr: 85.0 + idx * 15,
            retailLoanCount: 38 + idx * 10,
            retailSanctionedCr: 110.0 + idx * 20,
            retailOutstandingCr: 72.0 + idx * 12,
            retailPipelineCr: 28.0 + idx * 5,
            constructionPct: 65,
            valuationRatePsf: 7500,
            riskBand: 'LOW' as ExposureRiskBand,
            pocLabel: 'SIMULATED POC DATA',
          };
        });
      }

      return [
        {
          projectId: `PRJ-${b.id}-001`,
          builderId: b.id,
          builderName: b.legalName,
          projectName: `${b.tradeName || b.legalName} Horizon Phase 1`,
          city: b.city,
          rera: 'P52100098412',
          towers: ['Tower 1 - ALFA', 'Tower 2 - BETA'],
          projectFinanceSanctionCr: 110.0,
          projectFinanceOutstandingCr: 65.0,
          retailLoanCount: 32,
          retailSanctionedCr: 88.0,
          retailOutstandingCr: 58.0,
          retailPipelineCr: 22.0,
          constructionPct: 60,
          valuationRatePsf: 7200,
          riskBand: 'LOW' as ExposureRiskBand,
          pocLabel: 'SIMULATED POC DATA',
        },
      ];
    }

    return DEMO_PROJECT_EXPOSURES.filter((p) => p.builderId === 'BLD-PUN-001');
  }

  public async getGroupExposure(builderId: string): Promise<DemoGroupEntity[]> {
    const entities = DEMO_GROUP_ENTITIES.filter((g) => g.builderId === builderId);
    if (entities.length > 0) return entities;

    const b = masterStore.getBuilderById(builderId);
    if (b) {
      const directOut = b.totalExposureCr || 120.0;
      return [
        {
          entityId: `GRP-${b.id}-01`,
          builderId: b.id,
          builderName: b.legalName,
          entityName: b.legalName,
          entityType: 'Operating Company',
          exposureCr: directOut,
          pocLabel: 'SIMULATED POC DATA',
        },
        {
          entityId: `GRP-${b.id}-02`,
          builderId: b.id,
          builderName: b.legalName,
          entityName: `${b.tradeName || b.legalName} Projects LLP`,
          entityType: 'Project SPV',
          exposureCr: Math.round(directOut * 0.45 * 10) / 10,
          pocLabel: 'SIMULATED POC DATA',
        },
        {
          entityId: `GRP-${b.id}-03`,
          builderId: b.id,
          builderName: b.legalName,
          entityName: `${b.groupName || b.legalName} Infrastructure Pvt Ltd`,
          entityType: 'Related Entity',
          exposureCr: 25.0,
          pocLabel: 'SIMULATED POC DATA',
        },
      ];
    }

    return DEMO_GROUP_ENTITIES.filter((g) => g.builderId === 'BLD-PUN-001');
  }

  public async getReconciliation(builderId: string): Promise<DemoReconciliationItem[]> {
    const baseItems = DEMO_RECONCILIATION_ITEMS.filter((r) => r.builderId === builderId);
    let items = baseItems;

    if (items.length === 0) {
      const b = masterStore.getBuilderById(builderId);
      if (b) {
        items = [
          {
            id: `REC-${b.id}-001`,
            builderId: b.id,
            builderName: b.legalName,
            exposureType: 'Consortium Term Loan Facility',
            sourceA: 'MCA-21 Form CHG-1 Index of Charges',
            valueA: 65.0,
            sourceB: 'Internal Core Banking & Lead Lender Sanction',
            valueB: 65.0,
            status: 'VERIFIED',
            varianceCr: 0,
            reason: 'Pari-passu charge matches MCA registration certificate and bank sanction ledger.',
            pocLabel: 'SIMULATED POC DATA',
          },
          {
            id: `REC-${b.id}-002`,
            builderId: b.id,
            builderName: b.legalName,
            exposureType: 'MahaRERA Project Escrow Cashflows',
            sourceA: 'MahaRERA Form 3 Chartered Accountant Certification',
            valueA: 70.0,
            sourceB: 'Designated Escrow Account Statement (SBI)',
            valueB: 70.0,
            status: 'MATCHED',
            varianceCr: 0,
            reason: 'Statutory 70% project escrow deposits strictly reconciled without deviation.',
            pocLabel: 'SIMULATED POC DATA',
          },
          {
            id: `REC-${b.id}-003`,
            builderId: b.id,
            builderName: b.legalName,
            exposureType: 'CERSAI Security Interest Register',
            sourceA: 'CERSAI Asset-Based Security Filing Report',
            valueA: 110.0,
            sourceB: 'Proval APF Title Search & Consortium NOC',
            valueB: 110.0,
            status: 'VERIFIED',
            varianceCr: 0,
            reason: 'CERSAI registration details corroborate clean consortium charge hierarchy.',
            pocLabel: 'SIMULATED POC DATA',
          },
          {
            id: `REC-${b.id}-004`,
            builderId: b.id,
            builderName: b.legalName,
            exposureType: 'CRILC / CIC Corporate Credit Bureau Profile',
            sourceA: 'RBI CRILC Special Mention Category Report',
            valueA: 0.0,
            sourceB: 'TransUnion CIBIL Commercial Score & Summary',
            valueB: 0.0,
            status: 'MATCHED',
            varianceCr: 0,
            reason: 'Zero overdue, zero default across all banking facilities nationwide.',
            pocLabel: 'SIMULATED POC DATA',
          },
        ];
      } else {
        items = DEMO_RECONCILIATION_ITEMS.filter((r) => r.builderId === 'BLD-PUN-001');
      }
    }

    return items.map((item) => {
      const override = this.reconciliationOverrides[item.id];
      if (override) {
        return { ...item, ...override };
      }
      return item;
    });
  }

  public async getSourceFetchStatuses(builderId: string): Promise<DemoSourceFetchStatus[]> {
    const lastFetch = this.fetchTimestamps[builderId] || '2026-09-21 14:15 IST';
    const list = DEMO_SOURCE_FETCH_STATUSES[builderId] || DEMO_SOURCE_FETCH_STATUSES.DEFAULT;
    return list.map((s) => ({
      ...s,
      lastFetchTime: lastFetch,
    }));
  }

  public async fetchBuilderExposure(builderId: string): Promise<BuilderExposureResponse> {
    const summary = this.getBuilderSummary(builderId);
    const facilities = await this.getLenderExposure(builderId);
    const projects = await this.getProjectExposure(builderId);
    const sources = await this.getSourceFetchStatuses(builderId);
    const reconciliation = await this.getReconciliation(builderId);
    const groupEntities = await this.getGroupExposure(builderId);

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
    this.fetchTimestamps[builderId] = now;
    this.saveFetchTimestamps();

    return {
      mode: 'DEMO',
      label: 'SIMULATED POC DATA',
      builderId,
      builderName: summary.builderName,
      fetchedAt: now,
      summary,
      facilities,
      projects,
      sources,
      reconciliation,
      groupEntities,
    };
  }

  public async getExposureSnapshot(snapshotId: string): Promise<ExposureSnapshot | undefined> {
    return this.snapshots.find((s) => s.snapshotId === snapshotId);
  }

  public getSnapshotsForCase(caseId: string): ExposureSnapshot[] {
    return this.snapshots.filter((s) => s.apfCaseId === caseId);
  }

  public getLatestSnapshotForBuilder(builderId: string): ExposureSnapshot | undefined {
    const list = this.snapshots.filter((s) => s.builderId === builderId);
    if (list.length === 0) return undefined;
    return list[list.length - 1];
  }

  public createOrFreezeSnapshot(
    builderId: string,
    apfCaseId?: string,
    actorName: string = 'System (CPA Engine)'
  ): ExposureSnapshot {
    const summary = this.getBuilderSummary(builderId);
    const reconItems = DEMO_RECONCILIATION_ITEMS.filter((r) => r.builderId === builderId);
    const exceptionCount = reconItems.filter((r) => r.status === 'REVIEW REQUIRED' || r.status === 'CONFLICT').length;

    const seq = (this.snapshots.filter((s) => s.builderId === builderId).length + 1)
      .toString()
      .padStart(3, '0');
    const snapshotId = `EXPO-SNAP-${builderId}-${seq}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const snapshot: ExposureSnapshot = {
      snapshotId,
      builderId,
      builderName: summary.builderName,
      apfCaseId,
      fetchDate: now,
      directSanctionedCr: summary.directSanctionedCr,
      directOutstandingCr: summary.directOutstandingCr,
      nonFundCr: summary.nonFundCr,
      projectFinanceCr: summary.projectFinanceCr,
      existingApfCr: summary.existingApfCr,
      retailLinkedOutstandingCr: summary.retailLinkedOutstandingCr,
      retailPipelineCr: summary.retailPipelineCr,
      groupExposureCr: summary.groupExposureCr,
      proposedApfCr: summary.proposedApfCr,
      postApprovalExposureCr: summary.postApprovalGroupExposureCr,
      limitCr: summary.limitCr,
      limitUtilizationPct: summary.limitUtilizationPct,
      riskBand: summary.riskBand,
      sourceCount: 9,
      reconciliationExceptionCount: exceptionCount,
      createdBy: actorName,
      createdAt: now,
      pocLabel: 'SIMULATED POC DATA',
      isFrozen: true,
    };

    this.snapshots.push(snapshot);
    this.saveSnapshots();
    return snapshot;
  }

  public updateReconciliationItem(
    reconId: string,
    newStatus: DemoReconciliationStatus,
    notes: string,
    reviewerName: string = 'Credit Processing Associate (CPA)'
  ): DemoReconciliationItem | undefined {
    const original = DEMO_RECONCILIATION_ITEMS.find((r) => r.id === reconId);
    if (!original) return undefined;

    const updated: DemoReconciliationItem = {
      ...original,
      status: newStatus,
      reviewerNotes: notes,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    this.reconciliationOverrides[reconId] = updated;
    this.saveReconciliation();
    return updated;
  }

  public getLastFetchTimestamp(builderId: string): string | undefined {
    return this.fetchTimestamps[builderId];
  }
}

export const demoExposureService = new DemoExposureServiceImpl();
