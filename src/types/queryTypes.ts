// Types for the PROVAL APF In-App Communication / Query Workflow Module
import { UserRole } from './apfTransaction';

export type QueryCategory =
  | 'Builder Data'
  | 'Project Data'
  | 'Tower Data'
  | 'Legal'
  | 'Technical'
  | 'Valuation'
  | 'Exposure'
  | 'Documents'
  | 'Approval'
  | 'LOS'
  | 'Other';

export type QueryPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export type QueryStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'INPUT_REQUIRED'
  | 'INPUT_RECEIVED'
  | 'UNDER_REVIEW'
  | 'CLOSED'
  | 'REOPENED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface QueryMessage {
  id: string;
  queryId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  timestamp: string;
  message: string;
  attachmentName?: string;
  attachmentUrl?: string;
  inputValue?: string;
  statusChange?: QueryStatus;
}

export interface APFQuery {
  id: string; // e.g. QRY-2026-001
  caseId: string; // e.g. APF-2026-0001
  builderId: string;
  builderName: string;
  projectId: string;
  projectName: string;
  towerName?: string;
  phaseName?: string;

  // Originator
  raisedByUserId: string;
  raisedByUserName: string;
  raisedByUserRole: UserRole;

  // Recipient
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedToRole: UserRole;

  category: QueryCategory;
  subject: string;
  queryText: string;
  priority: QueryPriority;
  isBlocking: boolean; // If true, blocks APF workflow transition until resolved

  dueDate: string;
  slaHours: number;
  attachmentName?: string;

  relatedModule?: string; // e.g. 'Valuation', 'Exposure 360', 'Tower Master'
  relatedField?: string; // e.g. 'Adopted Base Rate', 'MahaRERA Cert'

  status: QueryStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;

  messages: QueryMessage[];
}

export interface QueryDashboardCounts {
  needInput: number;
  inputReceived: number;
  openQueries: number;
  overdueQueries: number;
  queriesRaisedByMe: number;
  queriesAssignedToMe: number;
}
