// Exposure Store: Governed Multi-Source Exposure State & Snapshot Freezing

import {
  LenderExposureGroup,
  LenderFacilityDetail,
  MCAChargeRecord,
  PublicCreditRatingEvidence,
  ProjectExposure360Data,
  MultiSourceReconciliationRow,
  SourceFreshnessItem,
  RelationshipGraphNode,
  RelationshipGraphEdge,
  FrozenExposureSnapshot,
  ReconciliationStatus,
} from '../types/exposureTypes';
import {
  KOLTE_PATIL_CRISIL_EVIDENCE,
  LODHA_CRISIL_EVIDENCE,
  KOLTE_PATIL_LENDER_EXPOSURE,
  KOLTE_PATIL_MCA_CHARGES,
  KOLTE_PATIL_PROJECT_EXPOSURE,
  KOLTE_PATIL_RECONCILIATION_MATRIX,
  SOURCE_FRESHNESS_STACK,
  KOLTE_PATIL_RELATIONSHIP_NODES,
  KOLTE_PATIL_RELATIONSHIP_EDGES,
} from '../data/builderExposureData';

class ExposureService {
  private selectedBuilderKey: 'KOLTE_PATIL' | 'LODHA' = 'KOLTE_PATIL';
  private reconciliationRows: MultiSourceReconciliationRow[] = [...KOLTE_PATIL_RECONCILIATION_MATRIX];
  private lenderExposureGroups: LenderExposureGroup[] = [...KOLTE_PATIL_LENDER_EXPOSURE];
  private frozenSnapshots: Record<string, FrozenExposureSnapshot> = {};
  private listeners: (() => void)[] = [];

  constructor() {
    // Initialize with a default frozen snapshot for Case APF-2026-0001
    this.frozenSnapshots['APF-2026-0001'] = {
      snapshotId: 'EXP-SNP-2026-0001-VAL01',
      caseId: 'APF-2026-0001',
      builderId: 'BLD-PUN-001',
      builderName: 'Kolte-Patil Developers Limited',
      projectId: 'PRJ-PUN-001',
      projectName: 'Kolte-Patil Life Republic (Sector R2 - i Towers)',
      frozenAt: '2026-09-21 14:30:00',
      frozenBy: 'M. K. Kulkarni (Empanelled Valuer)',
      frozenRole: 'EXTERNAL_VALUER',
      decisionStage: 'VALUATION_SUBMISSION',
      directSanctionedCr: 144.0,
      directOutstandingCr: 98.4,
      projectFinanceCr: 42.0,
      groupExposureCr: 321.1,
      existingApfExposureCr: 214.2,
      retailLinkedOutstandingCr: 214.2,
      retailPipelineCr: 28.5,
      postApprovalExposureCr: 364.2,
      groupCapCr: 600.0,
      limitUtilizationPct: 60.7,
      freshnessScoreDays: 12,
      reconciledFacilitiesCount: 8,
      pendingExceptionsCount: 1,
      isImmutable: true,
    };
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getSelectedBuilderKey(): 'KOLTE_PATIL' | 'LODHA' {
    return this.selectedBuilderKey;
  }

  public setSelectedBuilderKey(key: 'KOLTE_PATIL' | 'LODHA') {
    this.selectedBuilderKey = key;
    this.notify();
  }

  public getPublicRatingEvidence(): PublicCreditRatingEvidence {
    return this.selectedBuilderKey === 'KOLTE_PATIL' ? KOLTE_PATIL_CRISIL_EVIDENCE : LODHA_CRISIL_EVIDENCE;
  }

  public getLenderExposureGroups(): LenderExposureGroup[] {
    return this.lenderExposureGroups;
  }

  public getMCACharges(): MCAChargeRecord[] {
    return KOLTE_PATIL_MCA_CHARGES;
  }

  public getProjectExposure(): ProjectExposure360Data {
    return KOLTE_PATIL_PROJECT_EXPOSURE;
  }

  public getReconciliationRows(): MultiSourceReconciliationRow[] {
    return this.reconciliationRows;
  }

  public getSourceFreshness(): SourceFreshnessItem[] {
    return SOURCE_FRESHNESS_STACK;
  }

  public getRelationshipGraph(): { nodes: RelationshipGraphNode[]; edges: RelationshipGraphEdge[] } {
    return {
      nodes: KOLTE_PATIL_RELATIONSHIP_NODES,
      edges: KOLTE_PATIL_RELATIONSHIP_EDGES,
    };
  }

  public getFrozenSnapshot(caseId: string): FrozenExposureSnapshot | undefined {
    return this.frozenSnapshots[caseId];
  }

  public updateReconciliationStatus(
    reconciliationId: string,
    newStatus: ReconciliationStatus,
    reviewerNotes: string,
    actorName: string
  ) {
    this.reconciliationRows = this.reconciliationRows.map((row) => {
      if (row.reconciliationId === reconciliationId) {
        return {
          ...row,
          status: newStatus,
          isException: newStatus === 'REVIEW_REQUIRED' || newStatus === 'CONFLICT',
          reviewerNotes,
          reviewedBy: actorName,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      }
      return row;
    });
    this.notify();
  }

  public freezeSnapshot(
    caseId: string,
    builderId: string,
    builderName: string,
    projectId: string,
    projectName: string,
    actorName: string,
    actorRole: string,
    stage: 'VALUATION_SUBMISSION' | 'CPA_SUBMISSION' | 'COM_ENDORSEMENT' | 'COMMITTEE_APPROVAL',
    proposedIncrementalCr: number = 150.0
  ): FrozenExposureSnapshot {
    const directSanctioned = 144.0;
    const directOutstanding = 98.4;
    const projectFinance = 42.0;
    const groupExposure = 321.1;
    const existingApf = 214.2;
    const pipeline = 28.5;
    const groupCap = 600.0;
    const postApproval = existingApf + proposedIncrementalCr;
    const utilization = Math.round(((groupExposure + proposedIncrementalCr) / groupCap) * 100);

    const snapshotId = `EXP-SNP-${caseId}-${Date.now().toString().slice(-6)}`;
    const snapshot: FrozenExposureSnapshot = {
      snapshotId,
      caseId,
      builderId,
      builderName,
      projectId,
      projectName,
      frozenAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      frozenBy: actorName,
      frozenRole: actorRole,
      decisionStage: stage,
      directSanctionedCr: directSanctioned,
      directOutstandingCr: directOutstanding,
      projectFinanceCr: projectFinance,
      groupExposureCr: groupExposure,
      existingApfExposureCr: existingApf,
      retailLinkedOutstandingCr: existingApf,
      retailPipelineCr: pipeline,
      postApprovalExposureCr: postApproval,
      groupCapCr: groupCap,
      limitUtilizationPct: utilization,
      freshnessScoreDays: 14,
      reconciledFacilitiesCount: this.reconciliationRows.length,
      pendingExceptionsCount: this.reconciliationRows.filter((r) => r.isException).length,
      isImmutable: true,
    };

    this.frozenSnapshots[caseId] = snapshot;
    this.notify();
    return snapshot;
  }
}

export const exposureStore = new ExposureService();
