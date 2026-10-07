import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import {
  Building2,
  User,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react';

interface ExternalLegalProfileViewProps {
  currentUser: UserAccount;
}

export const ExternalLegalProfileView: React.FC<ExternalLegalProfileViewProps> = ({
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'FIRM' | 'ADVOCATES' | 'BANK' | 'COMPLIANCE'>('FIRM');
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const advocates = [
    {
      name: 'Adv. Sanjay Trivedi',
      role: 'Managing Partner / Law Firm Admin',
      userId: 'legalfirm.admin01',
      barNumber: 'MAH/1820/2005',
      experience: '21 Years',
      email: 'sanjay.trivedi@demolegal.in',
      mobile: '+91 98220 18492',
      status: 'ACTIVE',
      lastLogin: 'Today, 09:15 AM',
      activeCases: 2,
    },
    {
      name: 'Adv. Ananya Deshmukh',
      role: 'Senior Title Scrutiny Advocate',
      userId: 'legal.ext01',
      barNumber: 'MAH/4921/2012',
      experience: '14 Years',
      email: 'ananya.deshmukh@demolegal.in',
      mobile: '+91 98221 44021',
      status: 'ACTIVE',
      lastLogin: 'Active Now',
      activeCases: 3,
    },
    {
      name: 'Adv. Siddharth Kulkarni',
      role: 'Associate Advocate (Revenue Scrutiny)',
      userId: 'legalfirm.user01',
      barNumber: 'MAH/7391/2018',
      experience: '8 Years',
      email: 'siddharth.kulkarni@demolegal.in',
      mobile: '+91 94220 55198',
      status: 'ACTIVE',
      lastLogin: 'Yesterday, 04:30 PM',
      activeCases: 1,
    },
    {
      name: 'Adv. Priya Nair',
      role: 'Associate Advocate (RERA & Commercial)',
      userId: 'legalfirm.user02',
      barNumber: 'MAH/8920/2020',
      experience: '6 Years',
      email: 'priya.nair@demolegal.in',
      mobile: '+91 98229 01842',
      status: 'ACTIVE',
      lastLogin: '02-Oct-2026',
      activeCases: 0,
    },
  ];

  const complianceDocs = [
    {
      title: 'PAN Card Verification Certificate',
      refNo: 'AAEFD7712P',
      status: 'VERIFIED',
      fileName: 'PAN_AAEFD7712P_Verified.pdf',
      verifiedDate: '12-Jan-2024',
    },
    {
      title: 'GSTIN Regular Registration Form (GST REG-06)',
      refNo: '27AAEFD7712P1ZR',
      status: 'VERIFIED',
      fileName: 'GST_Registration_27AAEFD7712P1ZR.pdf',
      verifiedDate: '12-Jan-2024',
    },
    {
      title: 'Bank Empanelment Sanction Letter',
      refNo: 'EMP-LEG-2024-042',
      status: 'ACTIVE',
      fileName: 'BHFL_Empanelment_Letter_EMP-LEG-2024-042.pdf',
      verifiedDate: '15-Mar-2024',
      validity: '30-Nov-2027',
    },
    {
      title: 'Bar Council of Maharashtra & Goa Registration',
      refNo: 'MAH/1820/2005',
      status: 'VERIFIED',
      fileName: 'Bar_Council_Reg_MAH_1820_2005.pdf',
      verifiedDate: '10-Feb-2024',
    },
    {
      title: 'Treasury Disbursal Mandate & Cancelled Cheque',
      refNo: 'SBIN0000455 / 38192847192',
      status: 'VERIFIED',
      fileName: 'Cancelled_Cheque_SBI_38192847192.pdf',
      verifiedDate: '01-Mar-2026',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] p-4.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 border border-slate-700 shadow-2xs">
            <Building2 className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#172033]">
                {currentUser.firmName || 'Demo Legal Associates'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Empanelled Tier-1 Legal Partner
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5 flex flex-wrap items-center gap-2">
              <span>Empanelment No: <strong>EMP-LEG-2024-042</strong></span>
              <span>•</span>
              <span>Validity: <strong>30-Nov-2027</strong></span>
              <span>•</span>
              <span>Vendor ID: <strong>VND-LEGAL-001</strong></span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditSuccess('Empanelment profile verified with Central Bank Master Record.');
            setTimeout(() => setEditSuccess(null), 4000);
          }}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Verify Master Sync
        </button>
      </div>

      {editSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{editSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#DCE3EB] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('FIRM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'FIRM' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Firm Profile & Jurisdiction</span>
          </button>

          <button
            onClick={() => setActiveTab('ADVOCATES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'ADVOCATES' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Advocate Users ({advocates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BANK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'BANK' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bank & Statutory Details</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'COMPLIANCE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Compliance Documents ({complianceDocs.length})</span>
          </button>
        </div>

        {/* Tab 1: Firm Profile */}
        {activeTab === 'FIRM' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                  Firm Entity & Corporate KYC
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Legal Entity Name</span>
                    <span className="font-semibold text-slate-800">Demo Legal Associates LLP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Registration Type</span>
                    <span className="font-semibold text-slate-800">LLP (LLPIN: AAI-8821)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">PAN Number</span>
                    <span className="font-mono font-semibold text-slate-800">AAEFD7712P</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">GSTIN</span>
                    <span className="font-mono font-semibold text-slate-800">27AAEFD7712P1ZR</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                  Registered Address & Contacts
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>404 Court Chamber, Shivaji Nagar, Pune, Maharashtra 411005</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>+91 20 2553 1892 / +91 98220 18492</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>contact@demolegal.in / rohan.admin@demolegal.in</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">Approved Practice Areas & Jurisdictions</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  '30-Year Title Search & Root Scrutiny',
                  'MahaRERA Project & Promoter Due Diligence',
                  'Revenue Land Law & 7/12 Mutation Analysis',
                  'Irrevocable Development Agreements & POA',
                  'Consortium Lender Mortgage Scrutiny',
                  'DRT & High Court Litigation Clearance',
                  'SRA / Redevelopment Alienation Rights',
                ].map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Advocate Users */}
        {activeTab === 'ADVOCATES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#DCE3EB] text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Advocate Name</th>
                  <th className="py-2.5 px-3">Bar Registration</th>
                  <th className="py-2.5 px-3">Role & Experience</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Active Dockets</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3EB]">
                {advocates.map((adv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{adv.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{adv.userId}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800 font-medium">
                      {adv.barNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium block">{adv.role}</span>
                      <span className="text-[10px] text-slate-400">{adv.experience} practice</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-700 block">{adv.email}</span>
                      <span className="text-[10px] text-slate-400">{adv.mobile}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold text-[10px] border border-sky-200">
                        {adv.activeCases} Active
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        {adv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Bank & Statutory Details */}
        {activeTab === 'BANK' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-slate-900 text-xs">
                    Disbursal Bank Account Details (RTGS / NEFT / CMS)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  VERIFIED BY TREASURY
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-medium block">
                    Account Beneficiary
                  </span>
                  <span className="font-semibold text-slate-900">Demo Legal Associates LLP</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-medium block">
                    Bank Name & Branch
                  </span>
                  <span className="font-semibold text-slate-900">State Bank of India</span>
                  <span className="text-[10px] text-slate-500 block">Shivaji Nagar, Pune</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-medium block">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-slate-900">38192847192</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-medium block">
                    IFSC Code
                  </span>
                  <span className="font-mono font-bold text-slate-900">SBIN0000455</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs">TDS & Statutory Tax Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">TDS Section</span>
                  <span className="font-bold text-slate-800">194J - Professional Legal Fees</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Statutory Rate: 10%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">GST Registration</span>
                  <span className="font-bold text-slate-800">Regular Taxpayer (18%)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">CGST 9% + SGST 9%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">MSME / Udyam</span>
                  <span className="font-bold text-slate-800">UDYAM-MH-26-0091823</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Micro Entity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compliance Documents */}
        {activeTab === 'COMPLIANCE' && (
          <div className="p-4 space-y-3 text-xs">
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {complianceDocs.map((doc, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>Ref: {doc.refNo}</span>
                        <span>•</span>
                        <span>File: {doc.fileName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading verified compliance document: ${doc.fileName}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
