import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface ApprovalConditionItem {
  id: string;
  category: 'Pre-Disbursement' | 'Post-Sanction' | 'Continuous Monitoring';
  conditionText: string;
  complianceResponsibility: string;
  targetTimeline: string;
  status: 'Complied' | 'Pending Verification' | 'Waived';
}

interface ApprovalConditionTableProps {
  conditions?: ApprovalConditionItem[];
}

export const ApprovalConditionTable: React.FC<ApprovalConditionTableProps> = ({ conditions }) => {
  const defaultConditions: ApprovalConditionItem[] = conditions || [
    {
      id: 'COND-01',
      category: 'Pre-Disbursement',
      conditionText: 'Unit-level NOC from existing wholesale lender (Piramal Capital) prior to individual retail disbursement on Building E & G.',
      complianceResponsibility: 'Credit Operations / CPA',
      targetTimeline: 'Before 1st Disbursement',
      status: 'Complied',
    },
    {
      id: 'COND-02',
      category: 'Pre-Disbursement',
      conditionText: 'Collection of independent Civil Engineer / CEAI progress certificate verifying slab casting completion before milestone release.',
      complianceResponsibility: 'Technical / Valuer',
      targetTimeline: 'At each construction slab demand',
      status: 'Pending Verification',
    },
    {
      id: 'COND-03',
      category: 'Continuous Monitoring',
      conditionText: 'Quarterly submission of RERA Form 3 (CA Certificate) and Escrow Account SBI #30829104812 bank statement reconciliation.',
      complianceResponsibility: 'Developer / Relationship Manager',
      targetTimeline: 'Within 15 days of quarter end',
      status: 'Complied',
    },
    {
      id: 'COND-04',
      category: 'Post-Sanction',
      conditionText: 'Advocate search report search refresh at Sub-Registrar Haveli office at 6-month interval.',
      complianceResponsibility: 'Legal Reviewer',
      targetTimeline: 'Semi-annually',
      status: 'Pending Verification',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-3">
      <div className="p-4 border-b border-[#edf2f7] flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-[#102a43]">Governed Sanction Conditions & Covenants</h4>
          <p className="text-xs text-[#627d98]">Mandatory policy compliance requirements enforceable before disbursements</p>
        </div>
        <span className="text-xs text-[#627d98] font-mono">{defaultConditions.length} Conditions Registered</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
            <tr>
              <th className="py-3 px-4">Ref ID</th>
              <th className="py-3 px-4">Condition Type</th>
              <th className="py-3 px-4">Condition Specification</th>
              <th className="py-3 px-4">Responsible Role</th>
              <th className="py-3 px-4">Timeline</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
            {defaultConditions.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-[#19638c]">{c.id}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1f5] text-[#19638c]">
                    {c.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium max-w-md text-[#334e68] leading-relaxed">
                  {c.conditionText}
                </td>
                <td className="py-3.5 px-4 text-[#627d98] font-semibold">{c.complianceResponsibility}</td>
                <td className="py-3.5 px-4 text-[#627d98]">{c.targetTimeline}</td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      c.status === 'Complied'
                        ? 'bg-[#e6f4ea] text-[#137333]'
                        : 'bg-[#fef7e0] text-[#b06000]'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
