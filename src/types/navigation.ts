export type NavigationModule =
  // Workspace
  | 'DASHBOARD'
  | 'MY_CASES'
  | 'INITIATE_APF'
  | 'QUERY_TRAY'
  // Master Data
  | 'BUILDER_MASTER'
  | 'PROJECT_MASTER'
  | 'TOWER_MASTER'
  // Underwriting
  | 'VALUATION_MODULE'
  | 'LEGAL_DD'
  | 'EXPOSURE'
  // Decisioning
  | 'CPA_REVIEW'
  | 'COM_REVIEW'
  | 'APPROVAL_COCKPIT'
  | 'CONDITIONS_REGISTER'
  // Operations
  | 'VENDOR_MANAGEMENT'
  | 'BILLING'
  | 'LOS_INTEGRATIONS'
  // Governance
  | 'DOCUMENT_VAULT'
  | 'REPORTS'
  | 'ADMIN_CONFIG'
  // Case Detail Workspace
  | 'CASE_DETAIL';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}
