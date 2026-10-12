// TypeScript Definitions for PROVAL APF Vendor Billing & Payment Module
// Covers External Valuers / Valuation Agencies & External Legal Advocates / Law Firms

export type VendorType = 'EXTERNAL_VALUER' | 'EXTERNAL_ADVOCATE';

export type BillingStatus =
  | 'SERVICE_COMPLETED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_ACCEPTED'
  | 'BILLING_ELIGIBLE'
  | 'DRAFT_BILL'
  | 'VENDOR_INVOICE_PENDING'
  | 'INVOICE_SUBMITTED'
  | 'INVOICE_VARIANCE'
  | 'INVOICE_RETURNED'
  | 'INVOICE_RESUBMITTED'
  | 'INVOICE_ACCEPTED'
  | 'BILL_VERIFICATION'
  | 'BILL_APPROVAL'
  | 'APPROVED_FOR_PAYMENT'
  | 'SENT_TO_FINANCE'
  | 'ERP_POSTED'
  | 'ERP_FAILED'
  | 'ERP_RETRY'
  | 'PAYMENT_SCHEDULED'
  | 'PAYMENT_IN_PROCESS'
  | 'PAID'
  | 'PAYMENT_CONFIRMATION_RECEIVED'
  | 'RETURNED_FOR_CORRECTION'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'HOLD_RELEASED'
  | 'RECOMPUTATION_REQUESTED'
  | 'PARTIALLY_PAID'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export type FeeBasis =
  | 'Per Project'
  | 'Per Assignment'
  | 'Per Tower'
  | 'Per Phase'
  | 'Per Unit'
  | 'Per Visit'
  | 'Fixed Fee'
  | 'Slab Based'
  | 'Hybrid'
  | 'Per Land Parcel'
  | 'Per Survey / CTS / Gat'
  | 'Per Search Period'
  | 'Per Legal Opinion';

export type ValuerServiceType =
  | 'APF Initial Technical + Valuation'
  | 'Technical Only'
  | 'Valuation Only'
  | 'Revaluation'
  | 'Renewal Inspection'
  | 'Additional Tower'
  | 'Additional Phase'
  | 'Revisit'
  | 'Reinspection'
  | 'Rework Visit'
  | 'Progress Monitoring Visit'
  | 'Market Rate Update'
  | 'Desktop Valuation'
  | 'Site Valuation';

export type LegalServiceType =
  | 'Full APF Legal Due Diligence'
  | 'Title Search / Search Report'
  | 'Title Chain Review'
  | 'Ownership Verification'
  | 'Development Rights Review'
  | 'Encumbrance / Charge Review'
  | 'Litigation Search'
  | 'RERA / Approval Legal Review'
  | 'Renewal Legal Review'
  | 'Additional Land Parcel'
  | 'Additional Phase'
  | 'Additional Tower Scope'
  | 'Supplemental Legal Opinion'
  | 'Document Revalidation'
  | 'Lender NOC Review'
  | 'Rework / Additional Opinion'
  | 'Local Search / Sub-Registrar Search';

export type ReimbursementCategory =
  | 'Travel'
  | 'Local Conveyance'
  | 'Government Search Fee'
  | 'Registration / Certified Copy Fee'
  | 'Courier'
  | 'Printing / Documentation'
  | 'Other Approved Expense';

export interface VendorBankAccount {
  accountHolder: string;
  bankName: string;
  branch: string;
  accountNo: string;
  ifsc: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface VendorBillingProfile {
  id: string; // e.g. VND-VAL-001
  vendorType: VendorType;
  legalName: string;
  tradeName: string;
  pan: string;
  gstin: string;
  cin?: string;
  empanelmentNo: string;
  empanelmentValidity: string;
  registeredAddress: string;
  billingAddress: string;
  state: string;
  stateCode: string;
  pin: string;
  bankAccount: VendorBankAccount;
  gstRegistered: boolean;
  gstRegistrationType: 'Regular' | 'Composition' | 'SEZ' | 'Unregistered';
  panVerified: boolean;
  isMsme: boolean;
  udyamNo?: string;
  tdsCategory: string; // e.g. '194J - Professional & Technical Fees'
  tdsRuleCode: string; // 'TDS_194J_10' or 'TDS_194J_2'
  tdsRatePct: number;
  hasLowerTdsCertificate: boolean;
  lowerTdsCertificateNo?: string;
  lowerTdsRatePct?: number;
  vendorComplianceStatus: 'COMPLIANT' | 'DOCUMENT_PENDING' | 'EXPIRED' | 'BLOCKED';
  vendorInvoiceRequired: boolean;
  irnRequired: boolean; // E-Invoicing mandate
  rateCardId: string;
  reimbursementAllowed: boolean;
  approvalThreshold: number; // In INR e.g. 50000
  isActive: boolean;
}

export interface RateCardMaster {
  id: string; // e.g. RC-VAL-001
  vendorType: VendorType;
  vendorCategory: string; // e.g. 'Tier 1 IBBI International Firm', 'Local Advocate Panel'
  specificVendorId?: string; // Optional vendor override
  title: string;
  bankCode: string;
  region: string; // 'National', 'West - Maharashtra', etc.
  state: string;
  city?: string;
  serviceType: string;
  projectType: string; // 'Residential', 'Commercial', 'Plotted', 'All'
  effectiveFrom: string;
  effectiveTo: string;
  feeBasis: FeeBasis;
  baseFee: number;
  additionalTowerRate: number;
  additionalPhaseRate: number;
  additionalUnitRate: number;
  additionalVisitRate: number;
  priorityFee: number;
  travelRules: string;
  reimbursementRules: string;
  maxReimbursementCap: number;
  taxRuleCode: string; // 'GST_18'
  gstRatePct: number;
  tdsRatePct: number;
  approvalStatus: 'APPROVED' | 'DRAFT' | 'SUPERSEDED';
  version: string;
}

export interface BillingEvent {
  id: string; // e.g. EVT-2026-0001
  caseId: string;
  builderId: string;
  projectId: string;
  phaseId?: string;
  towerIds: string[];
  assignmentId: string;
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  serviceType: string;
  serviceSubType?: string;
  completionDate: string;
  reportId: string;
  reportVersion: string;
  acceptedDate: string;
  eligibleAmountBeforeTax: number;
  rateCardId: string;
  rateCardVersion: string;
  billingStatus: BillingStatus;
  isExternal: boolean;
  reworkRequired?: boolean;
  reworkReason?: string;
  reworkFeeAllowed?: boolean;
  vendorUserId?: string;
  billingEligibilityDate?: string;
  billingPolicyRule?: string;
  sourceModule?: 'TECHNICAL_VALUATION' | 'LEGAL_DD';
  isBillable?: boolean;
  nonBillableReason?: string;
  createdAt: string;
}

export interface BillLineItem {
  id: string;
  service: string;
  description?: string;
  quantity: number;
  unitRate: number;
  amount: number;
  taxCode: string;
  remarks?: string;
  isReimbursement?: boolean;
}

export interface ReimbursementClaim {
  id: string;
  billId: string;
  expenseType: ReimbursementCategory;
  claimedAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  expenseDate: string;
  receiptDocName?: string;
  receiptDocUrl?: string;
  purpose: string;
  isPreApproved: boolean;
  remarks?: string;
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED';
}

export interface VendorInvoice {
  invoiceNo: string;
  invoiceDate: string;
  invoiceAmount: number;
  taxAmount: number;
  grossAmount: number;
  irnNumber?: string;
  qrCodeAck?: string;
  invoiceDocUrl?: string;
  invoiceDocName?: string;
  uploadedAt: string;
  uploadedBy: string;
  varianceAmount: number; // vendor invoice - system calculated gross
  isVarianceAccepted?: boolean;
  varianceRemarks?: string;
  bankDetailsConfirmed: boolean;
}

export interface TaxRuleMaster {
  id: string;
  ruleCode: string;
  taxRuleCode: string;
  gstRuleCode: string;
  withholdingRuleCode: string;
  tdsRuleCode: string;
  placeOfSupplyRule: string;
  vendorCategory: string;
  effectiveFrom: string;
  effectiveTo: string;
  cgstRatePct: number;
  sgstRatePct: number;
  igstRatePct: number;
  tdsRatePct: number;
  applicability: string;
  approvalStatus: 'APPROVED' | 'DRAFT' | 'SUPERSEDED';
  description: string;
}

export interface RecomputationRecord {
  id: string;
  calculationVersion: number;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  oldAmount: number;
  newAmount: number;
  changedRuleOrQty: string;
  status:
    | 'RECOMPUTATION_REQUESTED'
    | 'RECOMPUTATION_IN_PROGRESS'
    | 'RECOMPUTATION_COMPLETED'
    | 'RECOMPUTATION_FAILED';
  approvalNotes?: string;
}

export interface HoldRecord {
  isHeld: boolean;
  reason: string;
  category: 'DOCUMENT_DEFICIENCY' | 'RATE_DISPUTE' | 'COMPLIANCE_CHECK' | 'BANK_INQUIRY' | 'FRAUD_ALERT' | 'OTHER';
  heldBy: string;
  heldAt: string;
  expectedResolutionDate?: string;
  remarks: string;
  releasedBy?: string;
  releasedAt?: string;
}

export interface PeriodicBillSummary {
  periodMonth: string;
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  totalBillsCount: number;
  totalCasesCount: number;
  totalGrossFee: number;
  totalTax: number;
  totalNetPayable: number;
  bills: BillMaster[];
}

export interface FinancePostingDetail {
  idempotencyKey: string;
  erpDocNo: string;
  voucherNo: string;
  glCode: string;
  costCenter: string;
  branchRegion: string;
  postedAt: string;
  postedBy: string;
  postingStatus: 'POSTED' | 'ACKNOWLEDGED' | 'FAILED' | 'RETRY';
  responseMessage: string;
  payloadVersion: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  lastRetryAt?: string;
}

export interface PaymentDetail {
  utrNumber: string;
  paymentDate: string;
  paymentMethod: 'NEFT' | 'RTGS' | 'ACH' | 'DIRECT_CREDIT';
  paidAmount: number;
  withheldAmount: number;
  bankRefNumber: string;
  deductionNotes?: string;
  paymentAdviceDocName?: string;
  status: 'PROCESSED' | 'FAILED' | 'RECONCILED';
}

export interface DebitCreditNote {
  id: string;
  billId: string;
  noteType: 'CREDIT_NOTE' | 'DEBIT_NOTE';
  noteNo: string;
  noteDate: string;
  reason: string;
  amount: number;
  taxAdjustment: number;
  netAdjustment: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  erpRefNo?: string;
}

export interface BillingQueryMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  attachmentName?: string;
}

export interface BillingQuery {
  id: string;
  billId: string;
  caseId: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  category: 'Invoice Variance' | 'GSTIN/PAN Mismatch' | 'Missing Receipt' | 'Rate Card Dispute' | 'Payment Issue' | 'Other';
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  urgency: 'NORMAL' | 'URGENT';
  messages: BillingQueryMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BillMaster {
  id: string; // e.g. BIL-2026-0001
  billingEventId: string;
  caseId: string;
  builderId: string;
  builderLegalName: string;
  projectId: string;
  projectName: string;
  towerIds: string[];
  towerNames: string[];
  assignmentId: string;
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  serviceType: string;
  rateCardId: string;
  rateCardVersion: string;
  rateCardSnapshot: {
    feeBasis: FeeBasis;
    baseFee: number;
    additionalTowerRate: number;
    additionalVisitRate: number;
    gstRatePct: number;
    tdsRatePct: number;
  };
  lineItems: BillLineItem[];
  subtotalProfessionalFee: number;
  approvedReimbursementAmount: number;
  grossAmountBeforeTax: number;
  taxDetails: {
    gstRatePct: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTax: number;
    isInterState: boolean;
  };
  grossInvoiceAmount: number;
  tdsDetails: {
    sectionCode: string;
    ratePct: number;
    tdsAmount: number;
  };
  otherDeductions: {
    reason: string;
    amount: number;
  }[];
  netPayable: number;
  vendorInvoice?: VendorInvoice;
  reimbursements: ReimbursementClaim[];
  status: BillingStatus;
  makerVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    remarks: string;
    overrideReason?: string;
  };
  checkerApproval?: {
    approvedBy: string;
    approvedAt: string;
    remarks: string;
  };
  financePosting?: FinancePostingDetail;
  paymentDetail?: PaymentDetail;
  debitCreditNotes: DebitCreditNote[];
  queries: BillingQuery[];
  recomputationHistory?: RecomputationRecord[];
  holdDetail?: HoldRecord;
  paymentAdviceStatus?:
    | 'PAYMENT_ADVICE_GENERATED'
    | 'PAYMENT_ADVICE_SENT'
    | 'PAYMENT_ADVICE_RECEIVED'
    | 'PAYMENT_CONFIRMATION_RECEIVED';
  hsnSacCode?: string;
  billingPeriod?: string;
  isConsolidated?: boolean;
  associatedCaseIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BillingAuditEvent {
  id: string;
  billId: string;
  caseId: string;
  eventType:
    | 'ELIGIBILITY_DETERMINED'
    | 'DRAFT_BILL_GENERATED'
    | 'RATE_CARD_APPLIED'
    | 'REIMBURSEMENT_CLAIMED'
    | 'INVOICE_UPLOADED'
    | 'VARIANCE_DETECTED'
    | 'BILL_VERIFIED_BY_MAKER'
    | 'BILL_APPROVED_BY_CHECKER'
    | 'BILL_RETURNED'
    | 'BILL_REJECTED'
    | 'SENT_TO_FINANCE_ERP'
    | 'ERP_ACKNOWLEDGED'
    | 'PAYMENT_PROCESSED'
    | 'DEBIT_CREDIT_NOTE_ISSUED'
    | 'QUERY_RAISED';
  user: string;
  role: string;
  timestamp: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}
