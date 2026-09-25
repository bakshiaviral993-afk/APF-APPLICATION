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
} from '../types/demoExposureTypes';
import {
  DEMO_EXPOSURE_SUMMARIES,
  DEMO_LENDER_FACILITIES,
  DEMO_PROJECT_EXPOSURES,
  DEMO_GROUP_ENTITIES,
  DEMO_SOURCE_FETCH_STATUSES,
  DEMO_RECONCILIATION_ITEMS,
} from '../data/demoExposureDataset';

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
    const summary = DEMO_EXPOSURE_SUMMARIES[builderId] || DEMO_EXPOSURE_SUMMARIES['BLD-PUN-001'];
    const lastFetch = this.fetchTimestamps[builderId];
    return {
      ...summary,
      lastRefresh: lastFetch || summary.lastRefresh || '2026-09-21',
    };
  }

  public getAllSummaries(): Record<string, BuilderExposureSummary> {
    const result: Record<string, BuilderExposureSummary> = {};
    for (const id in DEMO_EXPOSURE_SUMMARIES) {
      result[id] = this.getBuilderSummary(id);
    }
    return result;
  }

  public async getLenderExposure(builderId: string): Promise<DemoLenderFacility[]> {
    const facilities = DEMO_LENDER_FACILITIES.filter((f) => f.builderId === builderId);
    if (facilities.length > 0) return facilities;
    // Fallback to first builder if requested builder not found
    return DEMO_LENDER_FACILITIES.filter((f) => f.builderId === 'BLD-PUN-001');
  }

  public async getProjectExposure(builderId: string): Promise<DemoProjectExposure[]> {
    const projects = DEMO_PROJECT_EXPOSURES.filter((p) => p.builderId === builderId);
    if (projects.length > 0) return projects;
    return DEMO_PROJECT_EXPOSURES.filter((p) => p.builderId === 'BLD-PUN-001');
  }

  public async getGroupExposure(builderId: string): Promise<DemoGroupEntity[]> {
    const entities = DEMO_GROUP_ENTITIES.filter((g) => g.builderId === builderId);
    if (entities.length > 0) return entities;
    return DEMO_GROUP_ENTITIES.filter((g) => g.builderId === 'BLD-PUN-001');
  }

  public async getReconciliation(builderId: string): Promise<DemoReconciliationItem[]> {
    const baseItems = DEMO_RECONCILIATION_ITEMS.filter((r) => r.builderId === builderId);
    const items = baseItems.length > 0 ? baseItems : DEMO_RECONCILIATION_ITEMS.filter((r) => r.builderId === 'BLD-PUN-001');

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
