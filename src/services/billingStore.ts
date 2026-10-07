// Reactive Store for PROVAL APF Vendor Billing & Payment Management
// Covers External Valuers and External Legal Advocates

import {
  VendorBillingProfile,
  RateCardMaster,
  BillingEvent,
  BillMaster,
  BillLineItem,
  ReimbursementClaim,
  VendorInvoice,
  FinancePostingDetail,
  PaymentDetail,
  DebitCreditNote,
  BillingQuery,
  BillingAuditEvent,
  VendorType,
  BillingStatus,
} from '../types/billingTypes';
import { apfStore } from './apfStore';
import { legalStore } from './legalStore';

// Initial Vendor Profiles
export const INITIAL_VENDOR_PROFILES: VendorBillingProfile[] = [
  {
    id: 'VND-VAL-001',
    vendorType: 'EXTERNAL_VALUER',
    legalName: 'Knight Frank (India) Private Limited',
    tradeName: 'Knight Frank India Valuation Desk',
    pan: 'AAACK5512L',
    gstin: '27AAACK5512L1ZZ',
    cin: 'U74140MH1995PTC093081',
    empanelmentNo: 'IBBI/VAL/APF/PN/2019/042',
    empanelmentValidity: '2028-12-31',
    registeredAddress: 'Pavilion Mall, 4th Floor, Senapati Bapat Road, Pune, Maharashtra 411016',
    billingAddress: 'Pavilion Mall, 4th Floor, Senapati Bapat Road, Pune, Maharashtra 411016',
    state: 'Maharashtra',
    stateCode: '27',
    pin: '411016',
    bankAccount: {
      accountHolder: 'Knight Frank India Pvt Ltd - APF Valuation Ops',
      bankName: 'HDFC Bank Ltd',
      branch: 'Senapati Bapat Road Branch, Pune',
      accountNo: '50200048192841',
      ifsc: 'HDFC0000007',
      isVerified: true,
      verifiedAt: '2026-01-15',
    },
    gstRegistered: true,
    gstRegistrationType: 'Regular',
    panVerified: true,
    isMsme: false,
    tdsCategory: '194J - Professional & Technical Fees',
    tdsRuleCode: 'TDS_194J_10',
    tdsRatePct: 10,
    hasLowerTdsCertificate: false,
    vendorComplianceStatus: 'COMPLIANT',
    vendorInvoiceRequired: true,
    irnRequired: true,
    rateCardId: 'RC-VAL-001',
    reimbursementAllowed: true,
    approvalThreshold: 75000,
    isActive: true,
  },
  {
    id: 'VND-VAL-002',
    vendorType: 'EXTERNAL_VALUER',
    legalName: 'Demo Valuation Services Private Limited',
    tradeName: 'Demo Technical Appraisal Cell',
    pan: 'AABCD8821K',
    gstin: '27AABCD8821K1Z5',
    cin: 'U74999PN2020PTC192084',
    empanelmentNo: 'IBBI/VAL/APF/PN/2021/088',
    empanelmentValidity: '2027-06-30',
    registeredAddress: '102 Synergy Business Hub, Baner Road, Pune, Maharashtra 411045',
    billingAddress: '102 Synergy Business Hub, Baner Road, Pune, Maharashtra 411045',
    state: 'Maharashtra',
    stateCode: '27',
    pin: '411045',
    bankAccount: {
      accountHolder: 'Demo Valuation Services Pvt Ltd',
      bankName: 'ICICI Bank Ltd',
      branch: 'Baner Branch, Pune',
      accountNo: '003905018274',
      ifsc: 'ICIC0000039',
      isVerified: true,
      verifiedAt: '2026-02-10',
    },
    gstRegistered: true,
    gstRegistrationType: 'Regular',
    panVerified: true,
    isMsme: true,
    udyamNo: 'UDYAM-MH-26-0048192',
    tdsCategory: '194J - Professional & Technical Fees',
    tdsRuleCode: 'TDS_194J_10',
    tdsRatePct: 10,
    hasLowerTdsCertificate: false,
    vendorComplianceStatus: 'COMPLIANT',
    vendorInvoiceRequired: true,
    irnRequired: false,
    rateCardId: 'RC-VAL-001',
    reimbursementAllowed: true,
    approvalThreshold: 50000,
    isActive: true,
  },
  {
    id: 'VND-LEG-001',
    vendorType: 'EXTERNAL_ADVOCATE',
    legalName: 'Shardul Amarchand Mangaldas & Co.',
    tradeName: 'SAM Legal Real Estate Underwriting',
    pan: 'AAAFS9920M',
    gstin: '27AAAFS9920M1ZX',
    empanelmentNo: 'EMP/LEG/BLR/2022/019',
    empanelmentValidity: '2028-09-30',
    registeredAddress: 'Express Towers, 23rd Floor, Nariman Point, Mumbai, Maharashtra 400021',
    billingAddress: 'Amar Business Park, 6th Floor, Baner, Pune, Maharashtra 411045',
    state: 'Maharashtra',
    stateCode: '27',
    pin: '411045',
    bankAccount: {
      accountHolder: 'Shardul Amarchand Mangaldas and Co Partners',
      bankName: 'Axis Bank Ltd',
      branch: 'Corporate Banking Branch, Mumbai',
      accountNo: '918020084729184',
      ifsc: 'UTIB0000004',
      isVerified: true,
      verifiedAt: '2026-01-20',
    },
    gstRegistered: true,
    gstRegistrationType: 'Regular',
    panVerified: true,
    isMsme: false,
    tdsCategory: '194J - Legal Professional Fees',
    tdsRuleCode: 'TDS_194J_10',
    tdsRatePct: 10,
    hasLowerTdsCertificate: false,
    vendorComplianceStatus: 'COMPLIANT',
    vendorInvoiceRequired: true,
    irnRequired: true,
    rateCardId: 'RC-LEG-001',
    reimbursementAllowed: true,
    approvalThreshold: 100000,
    isActive: true,
  },
  {
    id: 'VND-LEGAL-001',
    vendorType: 'EXTERNAL_ADVOCATE',
    legalName: 'Demo Legal Associates LLP',
    tradeName: 'Demo Legal Associates • Title Scrutiny & Real Estate Practice',
    pan: 'AAEFD7712P',
    gstin: '27AAEFD7712P1ZR',
    cin: 'AAI-8821',
    empanelmentNo: 'EMP-LEG-2024-042',
    empanelmentValidity: '2027-11-30',
    registeredAddress: '404 Court Chamber, Shivaji Nagar, Pune, Maharashtra 411005',
    billingAddress: '404 Court Chamber, Shivaji Nagar, Pune, Maharashtra 411005',
    state: 'Maharashtra',
    stateCode: '27',
    pin: '411005',
    bankAccount: {
      accountHolder: 'Demo Legal Associates LLP',
      bankName: 'State Bank of India',
      branch: 'Shivaji Nagar, Pune',
      accountNo: '38192847192',
      ifsc: 'SBIN0000455',
      isVerified: true,
      verifiedAt: '2026-03-01',
    },
    gstRegistered: true,
    gstRegistrationType: 'Regular',
    panVerified: true,
    isMsme: true,
    udyamNo: 'UDYAM-MH-26-0091823',
    tdsCategory: '194J - Legal Professional Fees',
    tdsRuleCode: 'TDS_194J_10',
    tdsRatePct: 10,
    hasLowerTdsCertificate: false,
    vendorComplianceStatus: 'COMPLIANT',
    vendorInvoiceRequired: true,
    irnRequired: false,
    rateCardId: 'RC-LEG-001',
    reimbursementAllowed: true,
    approvalThreshold: 80000,
    isActive: true,
  },
  {
    id: 'VND-LEG-002',
    vendorType: 'EXTERNAL_ADVOCATE',
    legalName: 'Demo Legal Associates LLP',
    tradeName: 'Demo Title Search & Conveyancing Firm',
    pan: 'AAEFD7712P',
    gstin: '27AAEFD7712P1ZR',
    cin: 'AAI-8821',
    empanelmentNo: 'EMP-LEG-2024-042',
    empanelmentValidity: '2027-11-30',
    registeredAddress: '404 Court Chamber, Shivaji Nagar, Pune, Maharashtra 411005',
    billingAddress: '404 Court Chamber, Shivaji Nagar, Pune, Maharashtra 411005',
    state: 'Maharashtra',
    stateCode: '27',
    pin: '411005',
    bankAccount: {
      accountHolder: 'Demo Legal Associates LLP',
      bankName: 'State Bank of India',
      branch: 'Shivaji Nagar, Pune',
      accountNo: '38192847192',
      ifsc: 'SBIN0000455',
      isVerified: true,
      verifiedAt: '2026-03-01',
    },
    gstRegistered: true,
    gstRegistrationType: 'Regular',
    panVerified: true,
    isMsme: true,
    udyamNo: 'UDYAM-MH-26-0091823',
    tdsCategory: '194J - Legal Professional Fees',
    tdsRuleCode: 'TDS_194J_10',
    tdsRatePct: 10,
    hasLowerTdsCertificate: false,
    vendorComplianceStatus: 'COMPLIANT',
    vendorInvoiceRequired: true,
    irnRequired: false,
    rateCardId: 'RC-LEG-001',
    reimbursementAllowed: true,
    approvalThreshold: 60000,
    isActive: true,
  },
];

// Initial Rate Card Master
export const INITIAL_RATE_CARDS: RateCardMaster[] = [
  {
    id: 'RC-VAL-001',
    vendorType: 'EXTERNAL_VALUER',
    vendorCategory: 'Empanelled IBBI Valuation Panel',
    title: 'Standard APF Technical Appraisal & Valuation Rate Card (West Region)',
    bankCode: 'BHFL-APF',
    region: 'West - Maharashtra & Goa',
    state: 'Maharashtra',
    city: 'Pune / Mumbai / MMR',
    serviceType: 'APF Initial Technical + Valuation',
    projectType: 'All',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    feeBasis: 'Hybrid',
    baseFee: 25000, // Base project fee covering first 2 towers
    additionalTowerRate: 7500, // Per additional tower beyond 2
    additionalPhaseRate: 10000,
    additionalUnitRate: 150,
    additionalVisitRate: 5000,
    priorityFee: 3500,
    travelRules: 'Up to 35km within municipal limits included; ₹12/km beyond boundary with toll receipt',
    reimbursementRules: 'Actuals on outstation travel & IGR searches subject to pre-approval cap',
    maxReimbursementCap: 15000,
    taxRuleCode: 'GST_18',
    gstRatePct: 18,
    tdsRatePct: 10,
    approvalStatus: 'APPROVED',
    version: 'v2026.1',
  },
  {
    id: 'RC-VAL-002',
    vendorType: 'EXTERNAL_VALUER',
    vendorCategory: 'Large Integrated Township Panel',
    title: 'Mega Township & High-Rise Multi-Cluster Valuation Schedule',
    bankCode: 'BHFL-APF',
    region: 'National',
    state: 'All',
    serviceType: 'APF Initial Technical + Valuation',
    projectType: 'Township / Multi-Phase',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    feeBasis: 'Per Tower',
    baseFee: 40000,
    additionalTowerRate: 10000,
    additionalPhaseRate: 15000,
    additionalUnitRate: 200,
    additionalVisitRate: 6000,
    priorityFee: 5000,
    travelRules: 'Economy flight / Train 2AC + Hotel at actuals for Tier 2/3 locations with pre-approval',
    reimbursementRules: 'Drone photography & structural audit tests pre-approved up to ₹25,000',
    maxReimbursementCap: 25000,
    taxRuleCode: 'GST_18',
    gstRatePct: 18,
    tdsRatePct: 10,
    approvalStatus: 'APPROVED',
    version: 'v2026.1',
  },
  {
    id: 'RC-LEG-001',
    vendorType: 'EXTERNAL_ADVOCATE',
    vendorCategory: 'Empanelled High Court Law Firms',
    title: 'Standard APF Legal Due Diligence & 30-Year Title Search Schedule',
    bankCode: 'BHFL-APF',
    region: 'West - Maharashtra',
    state: 'Maharashtra',
    city: 'Pune / Mumbai',
    serviceType: 'Full APF Legal Due Diligence',
    projectType: 'All',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    feeBasis: 'Hybrid',
    baseFee: 35000, // Covers 30-yr title chain, revenue scrutiny, basic litigation search
    additionalTowerRate: 5000,
    additionalPhaseRate: 8000,
    additionalUnitRate: 0,
    additionalVisitRate: 4000,
    priorityFee: 5000,
    travelRules: 'Local conveyance included in base fee',
    reimbursementRules: 'Sub-registrar official search challan fees, index-II certified copy charges at actuals',
    maxReimbursementCap: 20000,
    taxRuleCode: 'GST_18',
    gstRatePct: 18,
    tdsRatePct: 10,
    approvalStatus: 'APPROVED',
    version: 'v2026.1',
  },
  {
    id: 'RC-LEG-002',
    vendorType: 'EXTERNAL_ADVOCATE',
    vendorCategory: 'Senior Counsel Legal Panel',
    title: 'Complex Multi-Owner / Slum Rehabilitation / SRA Legal Scrutiny',
    bankCode: 'BHFL-APF',
    region: 'West - Maharashtra',
    state: 'Maharashtra',
    serviceType: 'Full APF Legal Due Diligence',
    projectType: 'Redevelopment / SRA',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    feeBasis: 'Per Land Parcel',
    baseFee: 55000,
    additionalTowerRate: 8000,
    additionalPhaseRate: 12000,
    additionalUnitRate: 0,
    additionalVisitRate: 6000,
    priorityFee: 8000,
    travelRules: 'Court search travel across taluka registries reimbursed at actuals',
    reimbursementRules: 'Revenue court & High Court search challans at actuals',
    maxReimbursementCap: 30000,
    taxRuleCode: 'GST_18',
    gstRatePct: 18,
    tdsRatePct: 10,
    approvalStatus: 'APPROVED',
    version: 'v2026.1',
  },
];

// Seeded Sample Bills for Demonstration
export const INITIAL_BILLS: BillMaster[] = [
  {
    id: 'BIL-2026-0001',
    billingEventId: 'EVT-2026-0001',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    builderLegalName: 'Kolte-Patil Developers Ltd.',
    projectId: 'PRJ-PUN-001',
    projectName: 'Life Republic i Towers',
    towerIds: ['TOW-001', 'TOW-002', 'TOW-003', 'TOW-004'],
    towerNames: ['Tower A (Onyx)', 'Tower B (Sapphire)', 'Tower C (Emerald)', 'Tower D (Diamond)'],
    assignmentId: 'ASN-VAL-2026-001',
    vendorId: 'VND-VAL-001',
    vendorName: 'Knight Frank (India) Private Limited',
    vendorType: 'EXTERNAL_VALUER',
    serviceType: 'APF Initial Technical + Valuation',
    rateCardId: 'RC-VAL-001',
    rateCardVersion: 'v2026.1',
    rateCardSnapshot: {
      feeBasis: 'Hybrid',
      baseFee: 25000,
      additionalTowerRate: 7500,
      additionalVisitRate: 5000,
      gstRatePct: 18,
      tdsRatePct: 10,
    },
    lineItems: [
      {
        id: 'L1',
        service: 'Base Project Technical Appraisal & Valuation (Towers A & B)',
        quantity: 1,
        unitRate: 25000,
        amount: 25000,
        taxCode: 'GST_18',
        remarks: 'Base scope includes 30km perimeter geofence & valuation report',
      },
      {
        id: 'L2',
        service: 'Additional Tower Structural & Progress Verification (Towers C & D)',
        quantity: 2,
        unitRate: 7500,
        amount: 15000,
        taxCode: 'GST_18',
        remarks: 'Tower C (Emerald) and Tower D (Diamond) additional scope',
      },
      {
        id: 'L3',
        service: 'Approved Local Conveyance / Site Visit Fuel',
        quantity: 1,
        unitRate: 2500,
        amount: 2500,
        taxCode: 'GST_18',
        remarks: 'Hinjewadi Phase 1 & 2 boundary travel with toll receipts',
        isReimbursement: true,
      },
    ],
    subtotalProfessionalFee: 40000,
    approvedReimbursementAmount: 2500,
    grossAmountBeforeTax: 42500,
    taxDetails: {
      gstRatePct: 18,
      cgstAmount: 3825,
      sgstAmount: 3825,
      igstAmount: 0,
      totalTax: 7650,
      isInterState: false,
    },
    grossInvoiceAmount: 50150,
    tdsDetails: {
      sectionCode: '194J',
      ratePct: 10,
      tdsAmount: 4000, // 10% on professional fees (₹40,000)
    },
    otherDeductions: [],
    netPayable: 46150,
    status: 'PAID',
    vendorInvoice: {
      invoiceNo: 'KF-PUN-APF-2026-081',
      invoiceDate: '2026-09-18',
      invoiceAmount: 42500,
      taxAmount: 7650,
      grossAmount: 50150,
      irnNumber: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f',
      qrCodeAck: 'NIC-EINV-2026-98124',
      invoiceDocName: 'Knight_Frank_Invoice_KF-PUN-081.pdf',
      uploadedAt: '2026-09-19 11:20:00',
      uploadedBy: 'M. K. Kulkarni (Valuer Lead)',
      varianceAmount: 0,
      isVarianceAccepted: true,
      bankDetailsConfirmed: true,
    },
    reimbursements: [
      {
        id: 'RMB-01',
        billId: 'BIL-2026-0001',
        expenseType: 'Local Conveyance',
        claimedAmount: 2500,
        approvedAmount: 2500,
        rejectedAmount: 0,
        expenseDate: '2026-09-14',
        receiptDocName: 'Fastag_Toll_Receipt_Pune_Hinjewadi.pdf',
        purpose: 'Site visit for GPS boundary verification',
        isPreApproved: true,
        status: 'APPROVED',
      },
    ],
    makerVerification: {
      verifiedBy: 'Rohan Deshmukh (CPA)',
      verifiedAt: '2026-09-20 14:15:00',
      remarks: 'Valuation report accepted. Tower progress reconciled with MahaRERA.',
    },
    checkerApproval: {
      approvedBy: 'Amitav Sen (COM)',
      approvedAt: '2026-09-21 16:30:00',
      remarks: 'Sanctioned as per rate card RC-VAL-001. No fee variance.',
    },
    financePosting: {
      idempotencyKey: 'IDEMP-APF-BIL-0001-2026',
      erpDocNo: 'ERP-SAP-2026-90812',
      voucherNo: 'VCH-981204',
      glCode: 'GL-542100-VALUATION-FEES',
      costCenter: 'CC-APF-WEST-RETAIL',
      branchRegion: 'Pune Hub',
      postedAt: '2026-09-22 10:15:00',
      postedBy: 'System Auto-ERP Bridge',
      postingStatus: 'POSTED',
      responseMessage: 'Voucher posted successfully in SAP FI-AP module.',
      payloadVersion: 'v2.1',
    },
    paymentDetail: {
      utrNumber: 'HDFCR9202609240019284',
      paymentDate: '2026-09-24',
      paymentMethod: 'RTGS',
      paidAmount: 46150,
      withheldAmount: 4000,
      bankRefNumber: 'CMS-HDFC-99182',
      deductionNotes: 'TDS u/s 194J deducted @ 10% (₹4,000) deposited to Form 26AS.',
      paymentAdviceDocName: 'Payment_Advice_BIL-2026-0001.pdf',
      status: 'RECONCILED',
    },
    debitCreditNotes: [],
    queries: [],
    createdAt: '2026-09-16 10:00:00',
    updatedAt: '2026-09-24 16:00:00',
  },
  {
    id: 'BIL-2026-0002',
    billingEventId: 'EVT-2026-0002',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    builderLegalName: 'Kolte-Patil Developers Ltd.',
    projectId: 'PRJ-PUN-001',
    projectName: 'Life Republic i Towers',
    towerIds: ['TOW-001', 'TOW-002', 'TOW-003', 'TOW-004'],
    towerNames: ['Tower A (Onyx)', 'Tower B (Sapphire)', 'Tower C (Emerald)', 'Tower D (Diamond)'],
    assignmentId: 'ASN-LEG-2026-001',
    vendorId: 'VND-LEG-001',
    vendorName: 'Shardul Amarchand Mangaldas & Co.',
    vendorType: 'EXTERNAL_ADVOCATE',
    serviceType: 'Full APF Legal Due Diligence',
    rateCardId: 'RC-LEG-001',
    rateCardVersion: 'v2026.1',
    rateCardSnapshot: {
      feeBasis: 'Hybrid',
      baseFee: 35000,
      additionalTowerRate: 5000,
      additionalVisitRate: 4000,
      gstRatePct: 18,
      tdsRatePct: 10,
    },
    lineItems: [
      {
        id: 'L1',
        service: '30-Year Title Search & Land Scrutiny (Survey No. 74/1 & 74/2)',
        quantity: 1,
        unitRate: 35000,
        amount: 35000,
        taxCode: 'GST_18',
        remarks: 'Full 15-section title scrutiny report and search certificate',
      },
      {
        id: 'L2',
        service: 'Additional Tower Scope Verification (Towers C & D)',
        quantity: 2,
        unitRate: 5000,
        amount: 10000,
        taxCode: 'GST_18',
        remarks: 'Allotment agreement template and RERA declaration verification',
      },
      {
        id: 'L3',
        service: 'Certified Copy / Sub-Registrar Official Search Challan Reimbursement',
        quantity: 1,
        unitRate: 6400,
        amount: 6400,
        taxCode: 'GST_18',
        remarks: 'Haveli Sub-Registrar Index-II search receipts from 1996 to 2026',
        isReimbursement: true,
      },
    ],
    subtotalProfessionalFee: 45000,
    approvedReimbursementAmount: 6400,
    grossAmountBeforeTax: 51400,
    taxDetails: {
      gstRatePct: 18,
      cgstAmount: 4626,
      sgstAmount: 4626,
      igstAmount: 0,
      totalTax: 9252,
      isInterState: false,
    },
    grossInvoiceAmount: 60652,
    tdsDetails: {
      sectionCode: '194J',
      ratePct: 10,
      tdsAmount: 4500, // 10% on professional fees
    },
    otherDeductions: [],
    netPayable: 56152,
    status: 'INVOICE_SUBMITTED',
    vendorInvoice: {
      invoiceNo: 'SAM-PUN-2026-904',
      invoiceDate: '2026-09-22',
      invoiceAmount: 51400,
      taxAmount: 9252,
      grossAmount: 60652,
      irnNumber: '4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a',
      invoiceDocName: 'SAM_Legal_Invoice_904.pdf',
      uploadedAt: '2026-09-23 15:45:00',
      uploadedBy: 'Adv. S. K. Mehra (Partner)',
      varianceAmount: 0,
      isVarianceAccepted: true,
      bankDetailsConfirmed: true,
    },
    reimbursements: [
      {
        id: 'RMB-02',
        billId: 'BIL-2026-0002',
        expenseType: 'Government Search Fee',
        claimedAmount: 6400,
        approvedAmount: 6400,
        rejectedAmount: 0,
        expenseDate: '2026-09-18',
        receiptDocName: 'Sub_Registrar_Govt_Challan_Chit.pdf',
        purpose: 'Official Index-II computer search fee 30 years',
        isPreApproved: true,
        status: 'APPROVED',
      },
    ],
    makerVerification: {
      verifiedBy: 'Rohan Deshmukh (CPA)',
      verifiedAt: '2026-09-24 11:00:00',
      remarks: 'Title search verified. Search fee challans attached and validated.',
    },
    debitCreditNotes: [],
    queries: [],
    createdAt: '2026-09-20 09:30:00',
    updatedAt: '2026-09-24 11:00:00',
  },
  {
    id: 'BIL-2026-0003',
    billingEventId: 'EVT-2026-0003',
    caseId: 'APF-2026-0002',
    builderId: 'BLD-PUN-002',
    builderLegalName: 'Rohan Builders & Developers',
    projectId: 'PRJ-PUN-002',
    projectName: 'Rohan Abhilasha Phase 2',
    towerIds: ['TOW-005', 'TOW-006'],
    towerNames: ['Building A1', 'Building A2'],
    assignmentId: 'ASN-VAL-2026-002',
    vendorId: 'VND-VAL-002',
    vendorName: 'Demo Valuation Services Private Limited',
    vendorType: 'EXTERNAL_VALUER',
    serviceType: 'APF Initial Technical + Valuation',
    rateCardId: 'RC-VAL-001',
    rateCardVersion: 'v2026.1',
    rateCardSnapshot: {
      feeBasis: 'Hybrid',
      baseFee: 25000,
      additionalTowerRate: 7500,
      additionalVisitRate: 5000,
      gstRatePct: 18,
      tdsRatePct: 10,
    },
    lineItems: [
      {
        id: 'L1',
        service: 'Base Project Technical Appraisal & Valuation (Buildings A1 & A2)',
        quantity: 1,
        unitRate: 25000,
        amount: 25000,
        taxCode: 'GST_18',
        remarks: 'Wagholi site inspection and 18-month construction milestone verification',
      },
    ],
    subtotalProfessionalFee: 25000,
    approvedReimbursementAmount: 0,
    grossAmountBeforeTax: 25000,
    taxDetails: {
      gstRatePct: 18,
      cgstAmount: 2250,
      sgstAmount: 2250,
      igstAmount: 0,
      totalTax: 4500,
      isInterState: false,
    },
    grossInvoiceAmount: 29500,
    tdsDetails: {
      sectionCode: '194J',
      ratePct: 10,
      tdsAmount: 2500,
    },
    otherDeductions: [],
    netPayable: 27000,
    status: 'BILL_APPROVAL', // Waiting for Checker COM Approval
    vendorInvoice: {
      invoiceNo: 'DVS-2026-118',
      invoiceDate: '2026-09-21',
      invoiceAmount: 25000,
      taxAmount: 4500,
      grossAmount: 29500,
      invoiceDocName: 'DVS_Invoice_118.pdf',
      uploadedAt: '2026-09-22 17:00:00',
      uploadedBy: 'Rajesh Verma (Lead Valuer)',
      varianceAmount: 0,
      isVarianceAccepted: true,
      bankDetailsConfirmed: true,
    },
    reimbursements: [],
    makerVerification: {
      verifiedBy: 'Rohan Deshmukh (CPA)',
      verifiedAt: '2026-09-23 10:30:00',
      remarks: 'Verified against Rate Card RC-VAL-001. No variance.',
    },
    debitCreditNotes: [],
    queries: [],
    createdAt: '2026-09-20 14:00:00',
    updatedAt: '2026-09-23 10:30:00',
  },
  {
    id: 'BIL-2026-0004',
    billingEventId: 'EVT-2026-0004',
    caseId: 'APF-2026-0002',
    builderId: 'BLD-PUN-002',
    builderLegalName: 'Rohan Builders & Developers',
    projectId: 'PRJ-PUN-002',
    projectName: 'Rohan Abhilasha Phase 2',
    towerIds: ['TOW-005', 'TOW-006'],
    towerNames: ['Building A1', 'Building A2'],
    assignmentId: 'ASN-LEG-2026-002',
    vendorId: 'VND-LEG-002',
    vendorName: 'Demo Legal Associates LLP',
    vendorType: 'EXTERNAL_ADVOCATE',
    serviceType: 'Full APF Legal Due Diligence',
    rateCardId: 'RC-LEG-001',
    rateCardVersion: 'v2026.1',
    rateCardSnapshot: {
      feeBasis: 'Hybrid',
      baseFee: 35000,
      additionalTowerRate: 5000,
      additionalVisitRate: 4000,
      gstRatePct: 18,
      tdsRatePct: 10,
    },
    lineItems: [
      {
        id: 'L1',
        service: '30-Year Title Search & Mutation Register Scrutiny',
        quantity: 1,
        unitRate: 35000,
        amount: 35000,
        taxCode: 'GST_18',
        remarks: 'Wagholi agricultural-to-non-agricultural title clearance certificate',
      },
    ],
    subtotalProfessionalFee: 35000,
    approvedReimbursementAmount: 0,
    grossAmountBeforeTax: 35000,
    taxDetails: {
      gstRatePct: 18,
      cgstAmount: 3150,
      sgstAmount: 3150,
      igstAmount: 0,
      totalTax: 6300,
      isInterState: false,
    },
    grossInvoiceAmount: 41300,
    tdsDetails: {
      sectionCode: '194J',
      ratePct: 10,
      tdsAmount: 3500,
    },
    otherDeductions: [],
    netPayable: 37800,
    status: 'SENT_TO_FINANCE', // Sent to ERP
    vendorInvoice: {
      invoiceNo: 'DLA-2026-042',
      invoiceDate: '2026-09-21',
      invoiceAmount: 35000,
      taxAmount: 6300,
      grossAmount: 41300,
      invoiceDocName: 'Demo_Legal_Invoice_042.pdf',
      uploadedAt: '2026-09-22 18:00:00',
      uploadedBy: 'Adv. Nitin Patil',
      varianceAmount: 0,
      isVarianceAccepted: true,
      bankDetailsConfirmed: true,
    },
    reimbursements: [],
    makerVerification: {
      verifiedBy: 'Rohan Deshmukh (CPA)',
      verifiedAt: '2026-09-23 11:30:00',
      remarks: 'Title opinion verified and accepted.',
    },
    checkerApproval: {
      approvedBy: 'Amitav Sen (COM)',
      approvedAt: '2026-09-23 16:00:00',
      remarks: 'Sanctioned for ERP transmission.',
    },
    financePosting: {
      idempotencyKey: 'IDEMP-APF-BIL-0004-2026',
      erpDocNo: 'ERP-SAP-2026-90884',
      voucherNo: 'VCH-981240',
      glCode: 'GL-542200-LEGAL-FEES',
      costCenter: 'CC-APF-WEST-RETAIL',
      branchRegion: 'Pune Hub',
      postedAt: '2026-09-24 09:30:00',
      postedBy: 'Amitav Sen (COM)',
      postingStatus: 'POSTED',
      responseMessage: 'Voucher posted into SAP accounts payable queue.',
      payloadVersion: 'v2.1',
    },
    debitCreditNotes: [],
    queries: [],
    createdAt: '2026-09-20 15:00:00',
    updatedAt: '2026-09-24 09:30:00',
  },
];

// Initial Billing Events
export const INITIAL_BILLING_EVENTS: BillingEvent[] = [
  {
    id: 'EVT-2026-0001',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    projectId: 'PRJ-PUN-001',
    phaseId: 'PH-01',
    towerIds: ['TOW-001', 'TOW-002', 'TOW-003', 'TOW-004'],
    assignmentId: 'ASN-VAL-2026-001',
    vendorId: 'VND-VAL-001',
    vendorName: 'Knight Frank (India) Private Limited',
    vendorType: 'EXTERNAL_VALUER',
    serviceType: 'APF Initial Technical + Valuation',
    serviceSubType: '4 High-Rise Towers (22 Floors)',
    completionDate: '2026-09-15',
    reportId: 'REP-VAL-2026-001',
    reportVersion: 'v1.0-FINAL-SIGNED',
    acceptedDate: '2026-09-16',
    eligibleAmountBeforeTax: 40000,
    rateCardId: 'RC-VAL-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'PAID',
    isExternal: true,
    createdAt: '2026-09-16 10:00:00',
  },
  {
    id: 'EVT-2026-0002',
    caseId: 'APF-2026-0001',
    builderId: 'BLD-PUN-001',
    projectId: 'PRJ-PUN-001',
    towerIds: ['TOW-001', 'TOW-002', 'TOW-003', 'TOW-004'],
    assignmentId: 'ASN-LEG-2026-001',
    vendorId: 'VND-LEG-001',
    vendorName: 'Shardul Amarchand Mangaldas & Co.',
    vendorType: 'EXTERNAL_ADVOCATE',
    serviceType: 'Full APF Legal Due Diligence',
    serviceSubType: '30-Year Title Search & SARFAESI Scrutiny',
    completionDate: '2026-09-19',
    reportId: 'LEG-REV-2026-0001',
    reportVersion: 'v1.0-SIGNED',
    acceptedDate: '2026-09-20',
    eligibleAmountBeforeTax: 45000,
    rateCardId: 'RC-LEG-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'INVOICE_SUBMITTED',
    isExternal: true,
    createdAt: '2026-09-20 09:30:00',
  },
  {
    id: 'EVT-2026-0003',
    caseId: 'APF-2026-0002',
    builderId: 'BLD-PUN-002',
    projectId: 'PRJ-PUN-002',
    towerIds: ['TOW-005', 'TOW-006'],
    assignmentId: 'ASN-VAL-2026-002',
    vendorId: 'VND-VAL-002',
    vendorName: 'Demo Valuation Services Private Limited',
    vendorType: 'EXTERNAL_VALUER',
    serviceType: 'APF Initial Technical + Valuation',
    serviceSubType: '2 Residential Towers (Buildings A1 & A2)',
    completionDate: '2026-09-19',
    reportId: 'REP-VAL-2026-002',
    reportVersion: 'v1.0-FINAL',
    acceptedDate: '2026-09-20',
    eligibleAmountBeforeTax: 25000,
    rateCardId: 'RC-VAL-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'BILL_APPROVAL',
    isExternal: true,
    createdAt: '2026-09-20 14:00:00',
  },
  {
    id: 'EVT-2026-0004',
    caseId: 'APF-2026-0002',
    builderId: 'BLD-PUN-002',
    projectId: 'PRJ-PUN-002',
    towerIds: ['TOW-005', 'TOW-006'],
    assignmentId: 'ASN-LEG-2026-002',
    vendorId: 'VND-LEG-002',
    vendorName: 'Demo Legal Associates LLP',
    vendorType: 'EXTERNAL_ADVOCATE',
    serviceType: 'Full APF Legal Due Diligence',
    serviceSubType: 'Title Clearance & Encumbrance Certificate',
    completionDate: '2026-09-19',
    reportId: 'LEG-REV-2026-0002',
    reportVersion: 'v1.0-FINAL',
    acceptedDate: '2026-09-20',
    eligibleAmountBeforeTax: 35000,
    rateCardId: 'RC-LEG-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'SENT_TO_FINANCE',
    isExternal: true,
    createdAt: '2026-09-20 15:00:00',
  },
  {
    // New Eligible activity waiting for Draft Bill creation
    id: 'EVT-2026-0005',
    caseId: 'APF-2026-0003',
    builderId: 'BLD-PUN-003',
    projectId: 'PRJ-PUN-003',
    towerIds: ['TOW-007', 'TOW-008', 'TOW-009'],
    assignmentId: 'ASN-VAL-2026-003',
    vendorId: 'VND-VAL-001',
    vendorName: 'Knight Frank (India) Private Limited',
    vendorType: 'EXTERNAL_VALUER',
    serviceType: 'APF Initial Technical + Valuation',
    serviceSubType: '3 Towers (Towers 1, 2, 3 - VTP Pegasus)',
    completionDate: '2026-09-22',
    reportId: 'REP-VAL-2026-003',
    reportVersion: 'v1.0-SIGNED',
    acceptedDate: '2026-09-23',
    eligibleAmountBeforeTax: 32500, // Base 25k + 1 add tower 7.5k
    rateCardId: 'RC-VAL-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'BILLING_ELIGIBLE',
    isExternal: true,
    createdAt: '2026-09-23 16:30:00',
  },
  {
    // Legal report accepted for Case 3, ready for billing
    id: 'EVT-2026-0006',
    caseId: 'APF-2026-0003',
    builderId: 'BLD-PUN-003',
    projectId: 'PRJ-PUN-003',
    towerIds: ['TOW-007', 'TOW-008', 'TOW-009'],
    assignmentId: 'ASN-LEG-2026-003',
    vendorId: 'VND-LEG-001',
    vendorName: 'Shardul Amarchand Mangaldas & Co.',
    vendorType: 'EXTERNAL_ADVOCATE',
    serviceType: 'Full APF Legal Due Diligence',
    serviceSubType: 'VTP Pegasus Phase 1 Kharadi Title Scrutiny',
    completionDate: '2026-09-23',
    reportId: 'LEG-REV-2026-0003',
    reportVersion: 'v1.0-SIGNED',
    acceptedDate: '2026-09-24',
    eligibleAmountBeforeTax: 40000,
    rateCardId: 'RC-LEG-001',
    rateCardVersion: 'v2026.1',
    billingStatus: 'BILLING_ELIGIBLE',
    isExternal: true,
    createdAt: '2026-09-24 12:00:00',
  },
];

class BillingStore {
  private vendorProfiles: VendorBillingProfile[] = [...INITIAL_VENDOR_PROFILES];
  private rateCards: RateCardMaster[] = [...INITIAL_RATE_CARDS];
  private billingEvents: BillingEvent[] = [...INITIAL_BILLING_EVENTS];
  private bills: BillMaster[] = [...INITIAL_BILLS];
  private auditEvents: BillingAuditEvent[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initAuditLog();
    this.syncEligibilityFromCases();
  }

  private initAuditLog() {
    this.auditEvents = [
      {
        id: 'AUD-001',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'ELIGIBILITY_DETERMINED',
        user: 'System Engine',
        role: 'SYSTEM',
        timestamp: '2026-09-16 10:00:00',
        description: 'External Valuer report verified and accepted by CPA. Billable event registered.',
      },
      {
        id: 'AUD-002',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'DRAFT_BILL_GENERATED',
        user: 'Rohan Deshmukh',
        role: 'CPA',
        timestamp: '2026-09-16 10:15:00',
        description: 'Draft bill generated from Rate Card RC-VAL-001.',
      },
      {
        id: 'AUD-003',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'INVOICE_UPLOADED',
        user: 'M. K. Kulkarni',
        role: 'EXTERNAL_VALUER',
        timestamp: '2026-09-19 11:20:00',
        description: 'Vendor uploaded tax invoice KF-PUN-APF-2026-081 (Gross ₹50,150). Zero variance.',
      },
      {
        id: 'AUD-004',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'BILL_VERIFIED_BY_MAKER',
        user: 'Rohan Deshmukh',
        role: 'CPA',
        timestamp: '2026-09-20 14:15:00',
        description: 'Maker verification completed. Rate and tower count verified.',
      },
      {
        id: 'AUD-005',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'BILL_APPROVED_BY_CHECKER',
        user: 'Amitav Sen',
        role: 'COM',
        timestamp: '2026-09-21 16:30:00',
        description: 'Checker approval granted. Passed within credit threshold of ₹75,000.',
      },
      {
        id: 'AUD-006',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'SENT_TO_FINANCE_ERP',
        user: 'System Auto-Bridge',
        role: 'SYSTEM',
        timestamp: '2026-09-22 10:15:00',
        description: 'Dispatched to SAP FI-AP. ERP Document No: ERP-SAP-2026-90812.',
      },
      {
        id: 'AUD-007',
        billId: 'BIL-2026-0001',
        caseId: 'APF-2026-0001',
        eventType: 'PAYMENT_PROCESSED',
        user: 'Treasury Ops',
        role: 'FINANCE',
        timestamp: '2026-09-24 15:30:00',
        description: 'RTGS disbursed. UTR: HDFCR9202609240019284. Net paid: ₹46,150. TDS: ₹4,000.',
      },
    ];
  }

  // Subscribe to store updates
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Determine eligibility automatically from APF transaction workflow & legal reports
  syncEligibilityFromCases() {
    const cases = apfStore.getAllCases();

    cases.forEach((c) => {
      // 1. External Valuer Eligibility:
      // Criteria: Assignment is external, report submitted & accepted by CPA/COM, no billing rework blocking
      const valuerAssignment = c.valuerAssignment;
      const isExternalValuer =
        valuerAssignment &&
        Boolean(valuerAssignment.assignedUserId || valuerAssignment.vendorAgency) &&
        !valuerAssignment.vendorAgency?.toLowerCase().includes('internal');

      const isValuationCompleted =
        c.currentStatus === 'VALUATION_SUBMITTED' ||
        c.currentStatus === 'COM_REVIEW' ||
        c.currentStatus === 'PENDING_APPROVAL' ||
        c.currentStatus === 'APPROVED' ||
        c.currentStatus === 'CONDITIONAL_APPROVAL' ||
        c.currentStatus === 'SENT_TO_LOS' ||
        c.currentStatus === 'APF_ACTIVE';

      if (isExternalValuer && isValuationCompleted) {
        const existingEvent = this.billingEvents.find(
          (e) => e.caseId === c.id && e.vendorType === 'EXTERNAL_VALUER'
        );

        if (!existingEvent) {
          const profile = this.vendorProfiles.find((p) => p.vendorType === 'EXTERNAL_VALUER') || this.vendorProfiles[0];
          const rateCard = this.rateCards.find((r) => r.vendorType === 'EXTERNAL_VALUER') || this.rateCards[0];
          const towerCount = c.selectedTowerIds?.length || 2;
          const additionalTowers = Math.max(0, towerCount - 2);
          const eligibleFee = rateCard.baseFee + additionalTowers * rateCard.additionalTowerRate;

          const newEvent: BillingEvent = {
            id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            caseId: c.id,
            builderId: c.builderId,
            projectId: c.projectId,
            towerIds: c.selectedTowerIds || [],
            assignmentId: (valuerAssignment as any)?.id || `ASN-VAL-${c.id}`,
            vendorId: profile.id,
            vendorName: valuerAssignment?.vendorAgency || profile.legalName,
            vendorType: 'EXTERNAL_VALUER',
            serviceType: 'APF Initial Technical + Valuation',
            serviceSubType: `${towerCount} Towers Sanctioned Scope`,
            completionDate: (c as any).submittedAt ? (c as any).submittedAt.split(' ')[0] : c.createdAt.split('T')[0],
            reportId: c.valuationReport?.reportHash ? `REP-${c.id}` : `REP-VAL-${c.id}`,
            reportVersion: 'v1.0-FINAL-SIGNED',
            acceptedDate: new Date().toISOString().split('T')[0],
            eligibleAmountBeforeTax: eligibleFee,
            rateCardId: rateCard.id,
            rateCardVersion: rateCard.version,
            billingStatus: 'BILLING_ELIGIBLE',
            isExternal: true,
            createdAt: new Date().toISOString(),
          };

          this.billingEvents.push(newEvent);
        }
      }

      // 2. External Legal Advocate Eligibility:
      const legalReports = legalStore.getAllReports();
      const caseLegalReport = legalReports.find((l: any) => l.caseId === c.id || l.id === `LEG-${c.id}`);

      if (caseLegalReport) {
        const isExternalLegal =
          caseLegalReport.legalRoute === 'External Advocate' ||
          Boolean(caseLegalReport.reviewerFirm && !caseLegalReport.reviewerFirm.toLowerCase().includes('internal'));

        const isLegalCompleted =
          caseLegalReport.status === 'LEGAL_SUBMITTED' ||
          caseLegalReport.status === 'LEGAL_CLEAR' ||
          caseLegalReport.status === 'LEGAL_CONDITIONAL_CLEAR';

        if (isExternalLegal && isLegalCompleted) {
          const existingLegalEvent = this.billingEvents.find(
            (e) => e.caseId === c.id && e.vendorType === 'EXTERNAL_ADVOCATE'
          );

          if (!existingLegalEvent) {
            const profile = this.vendorProfiles.find((p) => p.vendorType === 'EXTERNAL_ADVOCATE') || this.vendorProfiles[2];
            const rateCard = this.rateCards.find((r) => r.vendorType === 'EXTERNAL_ADVOCATE') || this.rateCards[2];

            const newLegalEvent: BillingEvent = {
              id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              caseId: c.id,
              builderId: c.builderId,
              projectId: c.projectId,
              towerIds: c.selectedTowerIds || [],
              assignmentId: `ASN-LEG-${c.id}`,
              vendorId: profile.id,
              vendorName: caseLegalReport.reviewerFirm || profile.legalName,
              vendorType: 'EXTERNAL_ADVOCATE',
              serviceType: 'Full APF Legal Due Diligence',
              serviceSubType: '30-Year Title Scrutiny & Encumbrance Review',
              completionDate: caseLegalReport.reportDate || new Date().toISOString().split('T')[0],
              reportId: caseLegalReport.id,
              reportVersion: 'v1.0-SIGNED',
              acceptedDate: new Date().toISOString().split('T')[0],
              eligibleAmountBeforeTax: rateCard.baseFee,
              rateCardId: rateCard.id,
              rateCardVersion: rateCard.version,
              billingStatus: 'BILLING_ELIGIBLE',
              isExternal: true,
              createdAt: new Date().toISOString(),
            };

            this.billingEvents.push(newLegalEvent);
          }
        }
      }
    });
  }

  // Getters
  getAllBills(): BillMaster[] {
    return [...this.bills];
  }

  getBills(): BillMaster[] {
    return this.getAllBills();
  }

  generateDraftBill(eventId: string, creatorName: string = 'Rohan Deshmukh (CPA)'): BillMaster {
    return this.createDraftBill(eventId, creatorName);
  }

  submitVendorInvoice(
    billId: string,
    invoiceData: {
      invoiceNo: string;
      invoiceDate: string;
      invoiceAmount: number;
      taxAmount: number;
      grossAmount?: number;
      irnNumber?: string;
      invoiceDocName?: string;
      uploadedBy?: string;
      varianceAmount?: number;
      isVarianceAccepted?: boolean;
      varianceRemarks?: string;
      bankDetailsConfirmed?: boolean;
    },
    uploaderName: string = 'Vendor Representative'
  ): BillMaster {
    return this.uploadVendorInvoice(billId, {
      invoiceNo: invoiceData.invoiceNo,
      invoiceDate: invoiceData.invoiceDate,
      invoiceAmount: invoiceData.invoiceAmount,
      taxAmount: invoiceData.taxAmount,
      irnNumber: invoiceData.irnNumber,
      invoiceDocName: invoiceData.invoiceDocName,
      uploaderName: invoiceData.uploadedBy || uploaderName,
      varianceRemarks: invoiceData.varianceRemarks,
    });
  }

  notifyListeners(): void {
    this.notify();
  }

  getBillById(id: string): BillMaster | undefined {
    return this.bills.find((b) => b.id === id);
  }

  getBillsForCase(caseId: string): BillMaster[] {
    return this.bills.filter((b) => b.caseId === caseId);
  }

  getBillingEvents(): BillingEvent[] {
    return [...this.billingEvents];
  }

  getBillingEventsForCase(caseId: string): BillingEvent[] {
    return this.billingEvents.filter((e) => e.caseId === caseId);
  }

  createOrUpdateLegalBillingEvent(event: BillingEvent): void {
    const existingIdx = this.billingEvents.findIndex(
      (e) => e.caseId === event.caseId && e.vendorType === 'EXTERNAL_ADVOCATE'
    );
    if (existingIdx >= 0) {
      this.billingEvents[existingIdx] = { ...this.billingEvents[existingIdx], ...event };
    } else {
      this.billingEvents.push(event);
    }
    this.notify();
  }

  getVendorProfiles(): VendorBillingProfile[] {
    return [...this.vendorProfiles];
  }

  getVendorProfileById(id: string): VendorBillingProfile | undefined {
    return this.vendorProfiles.find((p) => p.id === id);
  }

  getRateCards(): RateCardMaster[] {
    return [...this.rateCards];
  }

  getRateCardById(id: string): RateCardMaster | undefined {
    return this.rateCards.find((r) => r.id === id);
  }

  getAuditEvents(billId?: string): BillingAuditEvent[] {
    if (billId) {
      return this.auditEvents.filter((a) => a.billId === billId);
    }
    return [...this.auditEvents];
  }

  // Operations
  createDraftBill(
    eventId: string,
    creatorName: string = 'Rohan Deshmukh (CPA)'
  ): BillMaster {
    const event = this.billingEvents.find((e) => e.id === eventId);
    if (!event) throw new Error(`Billing event ${eventId} not found`);

    // Prevent duplicate bill creation
    const existingBill = this.bills.find((b) => b.billingEventId === eventId);
    if (existingBill) {
      return existingBill;
    }

    const vendorProfile = this.vendorProfiles.find((v) => v.id === event.vendorId) || this.vendorProfiles[0];
    const rateCard = this.rateCards.find((r) => r.id === event.rateCardId) || this.rateCards[0];

    const towerCount = event.towerIds?.length || 2;
    const additionalTowers = Math.max(0, towerCount - 2);

    const lineItems: BillLineItem[] = [
      {
        id: 'L1',
        service: event.serviceType,
        description: `Base professional fee for project under Rate Card ${rateCard.id}`,
        quantity: 1,
        unitRate: rateCard.baseFee,
        amount: rateCard.baseFee,
        taxCode: rateCard.taxRuleCode,
        remarks: 'Base contract fee',
      },
    ];

    if (additionalTowers > 0 && rateCard.additionalTowerRate > 0) {
      lineItems.push({
        id: 'L2',
        service: 'Additional Tower Scope Verification',
        description: `${additionalTowers} towers beyond base 2 towers @ ₹${rateCard.additionalTowerRate.toLocaleString()}/tower`,
        quantity: additionalTowers,
        unitRate: rateCard.additionalTowerRate,
        amount: additionalTowers * rateCard.additionalTowerRate,
        taxCode: rateCard.taxRuleCode,
        remarks: 'Tower expansion fee',
      });
    }

    const subtotalProf = lineItems.reduce((acc, item) => acc + item.amount, 0);
    const approvedReimb = 0;
    const grossBeforeTax = subtotalProf + approvedReimb;
    const gstRate = rateCard.gstRatePct || 18;
    const isInterState = vendorProfile.stateCode !== '27'; // Assuming bank Maharashtra is 27

    const totalTax = Math.round((grossBeforeTax * gstRate) / 100);
    const cgst = isInterState ? 0 : Math.round(totalTax / 2);
    const sgst = isInterState ? 0 : Math.round(totalTax / 2);
    const igst = isInterState ? totalTax : 0;
    const grossInvoice = grossBeforeTax + totalTax;

    const tdsRate = vendorProfile.hasLowerTdsCertificate
      ? vendorProfile.lowerTdsRatePct || 2
      : vendorProfile.tdsRatePct || 10;
    const tdsAmount = Math.round((subtotalProf * tdsRate) / 100);
    const netPayable = grossInvoice - tdsAmount;

    const newBillId = `BIL-2026-${String(this.bills.length + 1).padStart(4, '0')}`;

    const newBill: BillMaster = {
      id: newBillId,
      billingEventId: event.id,
      caseId: event.caseId,
      builderId: event.builderId,
      builderLegalName: 'Developer Partner',
      projectId: event.projectId,
      projectName: 'APF Approved Project',
      towerIds: event.towerIds,
      towerNames: event.towerIds.map((t, idx) => `Tower ${String.fromCharCode(65 + idx)}`),
      assignmentId: event.assignmentId,
      vendorId: event.vendorId,
      vendorName: event.vendorName,
      vendorType: event.vendorType,
      serviceType: event.serviceType,
      rateCardId: rateCard.id,
      rateCardVersion: rateCard.version,
      rateCardSnapshot: {
        feeBasis: rateCard.feeBasis,
        baseFee: rateCard.baseFee,
        additionalTowerRate: rateCard.additionalTowerRate,
        additionalVisitRate: rateCard.additionalVisitRate,
        gstRatePct: rateCard.gstRatePct,
        tdsRatePct: tdsRate,
      },
      lineItems,
      subtotalProfessionalFee: subtotalProf,
      approvedReimbursementAmount: approvedReimb,
      grossAmountBeforeTax: grossBeforeTax,
      taxDetails: {
        gstRatePct: gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalTax,
        isInterState,
      },
      grossInvoiceAmount: grossInvoice,
      tdsDetails: {
        sectionCode: vendorProfile.tdsCategory.split(' ')[0] || '194J',
        ratePct: tdsRate,
        tdsAmount,
      },
      otherDeductions: [],
      netPayable,
      reimbursements: [],
      status: 'DRAFT_BILL',
      debitCreditNotes: [],
      queries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update billing event status
    event.billingStatus = 'DRAFT_BILL';

    this.bills.unshift(newBill);

    // Audit log
    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: newBill.id,
      caseId: newBill.caseId,
      eventType: 'DRAFT_BILL_GENERATED',
      user: creatorName,
      role: 'CPA',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Draft bill ${newBill.id} generated for ${newBill.vendorName} against event ${event.id}.`,
    });

    this.notify();
    return newBill;
  }

  // Update line items in draft bill
  updateDraftBill(billId: string, lineItems: BillLineItem[], updater: string = 'CPA'): BillMaster {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.lineItems = [...lineItems];
    this.recalculateBill(bill.id);

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'DRAFT_BILL_GENERATED',
      user: updater,
      role: 'CPA',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Draft bill line items updated. New gross before tax: ₹${bill.grossAmountBeforeTax.toLocaleString()}.`,
    });

    this.notify();
    return bill;
  }

  // Recalculate bill
  recalculateBill(billId: string): BillMaster {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const subtotalProf = bill.lineItems
      .filter((l) => !l.isReimbursement)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const approvedReimb = bill.reimbursements
      .filter((r) => r.status === 'APPROVED' || r.status === 'PARTIALLY_APPROVED')
      .reduce((sum, r) => sum + Number(r.approvedAmount || 0), 0);

    const grossBeforeTax = subtotalProf + approvedReimb;
    const gstRate = bill.taxDetails.gstRatePct || 18;
    const totalTax = Math.round((grossBeforeTax * gstRate) / 100);

    const isInterState = bill.taxDetails.isInterState;
    bill.taxDetails.totalTax = totalTax;
    bill.taxDetails.cgstAmount = isInterState ? 0 : Math.round(totalTax / 2);
    bill.taxDetails.sgstAmount = isInterState ? 0 : Math.round(totalTax / 2);
    bill.taxDetails.igstAmount = isInterState ? totalTax : 0;

    bill.subtotalProfessionalFee = subtotalProf;
    bill.approvedReimbursementAmount = approvedReimb;
    bill.grossAmountBeforeTax = grossBeforeTax;
    bill.grossInvoiceAmount = grossBeforeTax + totalTax;

    const tdsRate = bill.tdsDetails.ratePct || 10;
    bill.tdsDetails.tdsAmount = Math.round((subtotalProf * tdsRate) / 100);

    const deductionsSum = bill.otherDeductions.reduce((sum, d) => sum + d.amount, 0);
    bill.netPayable = bill.grossInvoiceAmount - bill.tdsDetails.tdsAmount - deductionsSum;
    bill.updatedAt = new Date().toISOString();

    return bill;
  }

  // Submit bill to vendor for invoice upload
  submitBillForVendorInvoice(billId: string, user: string = 'Rohan Deshmukh (CPA)'): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.status = 'VENDOR_INVOICE_PENDING';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'VENDOR_INVOICE_PENDING';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'DRAFT_BILL_GENERATED',
      user,
      role: 'CPA',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Bill submitted to vendor portal. Pending tax invoice upload.`,
    });

    this.notify();
  }

  // Upload vendor invoice with variance calculation
  uploadVendorInvoice(
    billId: string,
    invoiceData: {
      invoiceNo: string;
      invoiceDate: string;
      invoiceAmount: number;
      taxAmount: number;
      irnNumber?: string;
      invoiceDocName?: string;
      uploaderName: string;
      varianceRemarks?: string;
    }
  ): BillMaster {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    // Check duplicate invoice number for same vendor
    const duplicate = this.bills.find(
      (b) =>
        b.id !== billId &&
        b.vendorId === bill.vendorId &&
        b.vendorInvoice?.invoiceNo.toLowerCase() === invoiceData.invoiceNo.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Duplicate Invoice Error: Invoice No. ${invoiceData.invoiceNo} already exists for this vendor on Bill ${duplicate.id}`);
    }

    const systemGross = bill.grossInvoiceAmount;
    const vendorGross = Number(invoiceData.invoiceAmount) + Number(invoiceData.taxAmount);
    const variance = vendorGross - systemGross;

    bill.vendorInvoice = {
      invoiceNo: invoiceData.invoiceNo,
      invoiceDate: invoiceData.invoiceDate,
      invoiceAmount: invoiceData.invoiceAmount,
      taxAmount: invoiceData.taxAmount,
      grossAmount: vendorGross,
      irnNumber: invoiceData.irnNumber,
      invoiceDocName: invoiceData.invoiceDocName || `${invoiceData.invoiceNo}_Invoice.pdf`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploadedBy: invoiceData.uploaderName,
      varianceAmount: variance,
      isVarianceAccepted: Math.abs(variance) <= 10, // Tolerates minor rounding diffs
      varianceRemarks: invoiceData.varianceRemarks,
      bankDetailsConfirmed: true,
    };

    bill.status = 'INVOICE_SUBMITTED';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'INVOICE_SUBMITTED';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: variance !== 0 ? 'VARIANCE_DETECTED' : 'INVOICE_UPLOADED',
      user: invoiceData.uploaderName,
      role: bill.vendorType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Vendor invoice ${invoiceData.invoiceNo} uploaded. Gross: ₹${vendorGross.toLocaleString()}. Variance: ${
        variance >= 0 ? `+₹${variance}` : `-₹${Math.abs(variance)}`
      }.`,
    });

    this.notify();
    return bill;
  }

  // Reimbursement claims
  addReimbursementClaim(
    billId: string,
    claim: {
      expenseType: any;
      claimedAmount: number;
      expenseDate: string;
      receiptDocName?: string;
      purpose: string;
      isPreApproved?: boolean;
      remarks?: string;
    }
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const newClaim: ReimbursementClaim = {
      id: `RMB-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      billId,
      expenseType: claim.expenseType,
      claimedAmount: claim.claimedAmount,
      approvedAmount: claim.isPreApproved ? claim.claimedAmount : 0,
      rejectedAmount: 0,
      expenseDate: claim.expenseDate,
      receiptDocName: claim.receiptDocName || 'Expense_Receipt.pdf',
      purpose: claim.purpose,
      isPreApproved: Boolean(claim.isPreApproved),
      remarks: claim.remarks,
      status: claim.isPreApproved ? 'APPROVED' : 'PENDING',
    };

    bill.reimbursements.push(newClaim);
    this.recalculateBill(billId);

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId,
      caseId: bill.caseId,
      eventType: 'REIMBURSEMENT_CLAIMED',
      user: bill.vendorName,
      role: bill.vendorType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Reimbursement claim added for ${claim.expenseType}: ₹${claim.claimedAmount.toLocaleString()}.`,
    });

    this.notify();
  }

  reviewReimbursementClaim(
    billId: string,
    claimId: string,
    approvedAmount: number,
    remarks: string,
    reviewer: string = 'CPA'
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const claim = bill.reimbursements.find((r) => r.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    claim.approvedAmount = approvedAmount;
    claim.rejectedAmount = Math.max(0, claim.claimedAmount - approvedAmount);
    claim.status =
      approvedAmount === claim.claimedAmount
        ? 'APPROVED'
        : approvedAmount > 0
        ? 'PARTIALLY_APPROVED'
        : 'REJECTED';
    claim.remarks = remarks;

    this.recalculateBill(billId);
    this.notify();
  }

  // Maker verification
  verifyBillMaker(
    billId: string,
    verifierName: string = 'Rohan Deshmukh (CPA)',
    remarks: string,
    overrideReason?: string
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.makerVerification = {
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remarks: remarks || 'Maker verified against technical milestones and rate card.',
      overrideReason,
    };

    bill.status = 'BILL_APPROVAL'; // Forwarded to Checker Queue

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'BILL_APPROVAL';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'BILL_VERIFIED_BY_MAKER',
      user: verifierName,
      role: 'CPA',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Maker verification completed. Remarks: ${remarks}${overrideReason ? ` | Override: ${overrideReason}` : ''}`,
    });

    this.notify();
  }

  // Return bill to vendor for correction
  returnBillToVendor(billId: string, user: string, reason: string): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.status = 'RETURNED_FOR_CORRECTION';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'RETURNED_FOR_CORRECTION';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'BILL_RETURNED',
      user,
      role: 'CPA',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Bill returned to vendor for correction. Reason: ${reason}`,
      reason,
    });

    this.notify();
  }

  // Reject bill
  rejectBill(billId: string, user: string, reason: string): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.status = 'REJECTED';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'REJECTED';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'BILL_REJECTED',
      user,
      role: 'COM',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Bill rejected by authority. Reason: ${reason}`,
      reason,
    });

    this.notify();
  }

  // Checker approval
  approveBillChecker(
    billId: string,
    approverName: string = 'Amitav Sen (COM)',
    remarks: string
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.checkerApproval = {
      approvedBy: approverName,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remarks: remarks || 'Sanctioned for payment as per financial delegation matrix.',
    };

    bill.status = 'APPROVED_FOR_PAYMENT';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'APPROVED_FOR_PAYMENT';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'BILL_APPROVED_BY_CHECKER',
      user: approverName,
      role: 'COM',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Checker approval granted by ${approverName}. Net payable ₹${bill.netPayable.toLocaleString()}.`,
    });

    this.notify();
  }

  // Send to Finance / ERP integration
  sendToFinanceERP(
    billId: string,
    senderName: string = 'Amitav Sen (COM)',
    costCenter: string = 'CC-APF-WEST-RETAIL'
  ): { erpDocNo: string; voucherNo: string } {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    if (bill.financePosting?.postingStatus === 'POSTED') {
      throw new Error(`Duplicate ERP Posting Prevention: Bill ${billId} is already posted under ERP Doc ${bill.financePosting.erpDocNo}`);
    }

    const idempotencyKey = `IDEMP-APF-${bill.id}-${Date.now()}`;
    const erpDocNo = `ERP-SAP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const voucherNo = `VCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const glCode =
      bill.vendorType === 'EXTERNAL_VALUER'
        ? 'GL-542100-VALUATION-FEES'
        : 'GL-542200-LEGAL-FEES';

    bill.financePosting = {
      idempotencyKey,
      erpDocNo,
      voucherNo,
      glCode,
      costCenter,
      branchRegion: 'Pune Hub / West Cluster',
      postedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      postedBy: senderName,
      postingStatus: 'POSTED',
      responseMessage: 'Voucher posted successfully in SAP S/4HANA Accounts Payable module.',
      payloadVersion: 'v2.1',
    };

    bill.status = 'SENT_TO_FINANCE';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'SENT_TO_FINANCE';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'SENT_TO_FINANCE_ERP',
      user: senderName,
      role: 'COM',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Dispatched to Finance ERP. Generated Doc No: ${erpDocNo}, Voucher: ${voucherNo}.`,
    });

    this.notify();
    return { erpDocNo, voucherNo };
  }

  // Record payment from Finance
  recordPayment(
    billId: string,
    payment: {
      utrNumber: string;
      paymentMethod: any;
      paidAmount: number;
      paymentDate: string;
      bankRef?: string;
      deductionNotes?: string;
    }
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    bill.paymentDetail = {
      utrNumber: payment.utrNumber,
      paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod || 'RTGS',
      paidAmount: payment.paidAmount,
      withheldAmount: bill.tdsDetails.tdsAmount,
      bankRefNumber: payment.bankRef || `CMS-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      deductionNotes: payment.deductionNotes || `TDS u/s ${bill.tdsDetails.sectionCode} deducted @ ${bill.tdsDetails.ratePct}%`,
      paymentAdviceDocName: `Payment_Advice_${bill.id}.pdf`,
      status: 'RECONCILED',
    };

    bill.status = 'PAID';

    const event = this.billingEvents.find((e) => e.id === bill.billingEventId);
    if (event) event.billingStatus = 'PAID';

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId: bill.id,
      caseId: bill.caseId,
      eventType: 'PAYMENT_PROCESSED',
      user: 'Finance Treasury Ops',
      role: 'FINANCE',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Disbursed via ${payment.paymentMethod}. UTR: ${payment.utrNumber}. Amount: ₹${payment.paidAmount.toLocaleString()}.`,
    });

    this.notify();
  }

  // Issue Debit / Credit Note
  issueDebitCreditNote(
    billId: string,
    note: {
      noteType: 'CREDIT_NOTE' | 'DEBIT_NOTE';
      reason: string;
      amount: number;
      taxAdjustment: number;
      approvedBy: string;
    }
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const newNote: DebitCreditNote = {
      id: `DCN-${Date.now()}`,
      billId,
      noteType: note.noteType,
      noteNo: `CN-2026-${Math.floor(100 + Math.random() * 900)}`,
      noteDate: new Date().toISOString().split('T')[0],
      reason: note.reason,
      amount: note.amount,
      taxAdjustment: note.taxAdjustment,
      netAdjustment: note.amount + note.taxAdjustment,
      approvalStatus: 'APPROVED',
      approvedBy: note.approvedBy,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      erpRefNo: `ERP-ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    bill.debitCreditNotes.push(newNote);

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId,
      caseId: bill.caseId,
      eventType: 'DEBIT_CREDIT_NOTE_ISSUED',
      user: note.approvedBy,
      role: 'COM',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `${note.noteType} issued: ₹${note.amount.toLocaleString()} for ${note.reason}.`,
    });

    this.notify();
  }

  // Raise query on bill
  raiseQuery(
    billId: string,
    queryData: {
      subject: string;
      category: any;
      message: string;
      senderName: string;
      senderRole: string;
      urgency?: any;
    }
  ): BillingQuery {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const newQuery: BillingQuery = {
      id: `B-QRY-${Date.now()}`,
      billId,
      caseId: bill.caseId,
      vendorId: bill.vendorId,
      vendorName: bill.vendorName,
      subject: queryData.subject,
      category: queryData.category || 'Invoice Variance',
      status: 'OPEN',
      urgency: queryData.urgency || 'NORMAL',
      messages: [
        {
          id: `MSG-${Date.now()}`,
          senderId: 'USR-CURR',
          senderName: queryData.senderName,
          senderRole: queryData.senderRole,
          message: queryData.message,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bill.queries.push(newQuery);

    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      billId,
      caseId: bill.caseId,
      eventType: 'QUERY_RAISED',
      user: queryData.senderName,
      role: queryData.senderRole,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Query opened: "${queryData.subject}" (${queryData.category}).`,
    });

    this.notify();
    return newQuery;
  }

  // Reply to query
  replyQuery(
    billId: string,
    queryId: string,
    reply: {
      senderName: string;
      senderRole: string;
      text: string;
    }
  ): void {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error(`Bill ${billId} not found`);

    const query = bill.queries.find((q) => q.id === queryId);
    if (!query) throw new Error(`Query ${queryId} not found`);

    query.messages.push({
      id: `MSG-${Date.now()}`,
      senderId: 'USR-CURR',
      senderName: reply.senderName,
      senderRole: reply.senderRole,
      message: reply.text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    query.updatedAt = new Date().toISOString();
    this.notify();
  }

  // Update Rate Card
  updateRateCard(updated: RateCardMaster): void {
    const index = this.rateCards.findIndex((r) => r.id === updated.id);
    if (index >= 0) {
      this.rateCards[index] = { ...updated };
    } else {
      this.rateCards.push(updated);
    }
    this.notify();
  }

  // Update Vendor Profile
  updateVendorProfile(updated: VendorBillingProfile): void {
    const index = this.vendorProfiles.findIndex((v) => v.id === updated.id);
    if (index >= 0) {
      this.vendorProfiles[index] = { ...updated };
    } else {
      this.vendorProfiles.push(updated);
    }
    this.notify();
  }

  // Reset to initial demo state
  resetDemoData() {
    this.vendorProfiles = [...INITIAL_VENDOR_PROFILES];
    this.rateCards = [...INITIAL_RATE_CARDS];
    this.billingEvents = [...INITIAL_BILLING_EVENTS];
    this.bills = [...INITIAL_BILLS];
    this.initAuditLog();
    this.syncEligibilityFromCases();
    this.notify();
  }
}

export const billingStore = new BillingStore();
