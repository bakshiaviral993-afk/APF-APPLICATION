import React from 'react';
import { Building2, Layers, AlertTriangle, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { ExposureSourceBadge } from './ExposureSourceBadge';

export interface ExposureBucket {
  label: string;
  amountCr: number;
  source: string;
  sourceDate: string;
  freshness: string;
  isReconciled: boolean;
  notes: string;
}

interface BuilderExposureCardProps {
  builderName: string;
  groupName: string;
  buckets?: ExposureBucket[];
}

export const BuilderExposureCard: React.FC<BuilderExposureCardProps> = ({
  builderName,
  groupName,
  buckets,
}) => {
  const defaultBuckets: ExposureBucket[] = buckets || [
    {
      label: 'Direct Builder Exposure',
      amountCr: 45.0,
      source: 'CBS Loan Master',
      sourceDate: '2026-09-15',
      freshness: 'T-5 Days',
      isReconciled: true,
      notes: 'Term Loan TL-2022-81 (Secured against Phase 1 land)',
    },
    {
      label: 'Project Finance Exposure',
      amountCr: 42.0,
      source: 'MCA Form CHG-1 & CRILC',
      sourceDate: '2026-09-02',
      freshness: 'T-18 Days',
      isReconciled: true,
      notes: 'Piramal Capital CF (Tower B Charge)',
    },
    {
      label: 'Existing APF Exposure',
      amountCr: 214.2,
      source: 'Retail Mortgage LMS',
      sourceDate: '2026-09-18',
      freshness: 'Real-time',
      isReconciled: true,
      notes: '112 Active Home Loans across completed towers',
    },
    {
      label: 'Retail Project-Linked Exposure',
      amountCr: 85.0,
      source: 'APF Underwriting Ledger',
      sourceDate: '2026-09-18',
      freshness: 'Current Request',
      isReconciled: true,
      notes: 'Proposed APF limit for Building E & G',
    },
    {
      label: 'Pipeline Exposure',
      amountCr: 28.5,
      source: 'LOS In-flight Queue',
      sourceDate: '2026-09-19',
      freshness: 'Today',
      isReconciled: false,
      notes: '18 logged home loan files awaiting sanction',
    },
    {
      label: 'Group / Connected Exposure',
      amountCr: 501.2,
      source: 'Group Intelligence Graph',
      sourceDate: '2026-09-15',
      freshness: 'T-5 Days',
      isReconciled: true,
      notes: 'Across 4 SPVs (83.5% of ₹600 Cr Group Cap)',
    },
  ];

  const totalGovernedCr = defaultBuckets.reduce((acc, b) => acc + b.amountCr, 0);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102a43]">Exposure 360 & Concentration Footprint</h3>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Entity: <strong>{builderName}</strong> ({groupName}) • Automated multi-source reconciliation
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#627d98]">Total Governed Footprint</span>
          <div className="text-xl font-bold font-mono text-[#102a43]">₹{totalGovernedCr.toFixed(1)} Cr</div>
        </div>
      </div>

      {/* Grid of Exposure Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultBuckets.map((b, i) => (
          <div key={i} className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-[#102a43]">{b.label}</span>
              <span className="font-mono font-bold text-sm text-[#19638c]">₹{b.amountCr.toFixed(1)} Cr</span>
            </div>

            <p className="text-[11px] text-[#486581]">{b.notes}</p>

            <ExposureSourceBadge
              source={b.source}
              sourceDate={b.sourceDate}
              freshness={b.freshness}
              isReconciled={b.isReconciled}
              isSimulated={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
