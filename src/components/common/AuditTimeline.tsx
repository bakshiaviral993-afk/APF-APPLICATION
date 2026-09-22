import React from 'react';
import { Clock, User, ShieldCheck, FileCheck, ArrowRight, Laptop, Smartphone } from 'lucide-react';

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  priorStatus: string;
  newStatus: string;
  remarks: string;
  deviceSession?: string;
  documentRef?: string;
}

interface AuditTimelineProps {
  events?: AuditTimelineEvent[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  const defaultEvents: AuditTimelineEvent[] = events || [
    {
      id: 'AUD-08',
      timestamp: '2026-09-19 14:15:22 IST',
      actor: 'System / LOS Gateway',
      role: 'LOS Integration Service',
      action: 'LOS_ACK_RECEIVED',
      priorStatus: 'SENT_TO_LOS',
      newStatus: 'APF_ACTIVE',
      remarks: 'LOS acknowledged payload. Generated LOS_APF_ID = LOS-APF-88231. Scheme active for branch sourcing.',
      deviceSession: 'API Service Worker (Idempotency token: 9b1deb4d)',
      documentRef: 'LOS-APF-88231-ACK.json',
    },
    {
      id: 'AUD-07',
      timestamp: '2026-09-19 14:02:11 IST',
      actor: 'Mr. Rohan Deshmukh',
      role: 'CPA',
      action: 'TRANSMIT_TO_LOS',
      priorStatus: 'APPROVED',
      newStatus: 'SENT_TO_LOS',
      remarks: 'Compiled golden underwriting payload with approved rate ₹7,450/sq.ft and SHA-256 report hash.',
      deviceSession: 'Chrome 128 / Windows 11 Enterprise (IP: 10.4.12.89)',
      documentRef: 'APF-PUN-01-PAYLOAD-v1.0.json',
    },
    {
      id: 'AUD-06',
      timestamp: '2026-09-19 13:45:00 IST',
      actor: 'Zonal Credit Committee',
      role: 'Committee Member',
      action: 'APPROVE_WITH_CONDITIONS',
      priorStatus: 'PENDING_APPROVAL',
      newStatus: 'APPROVED',
      remarks: 'Quorum reached (3 of 3 members voted). Approved with conditions: Wholesale NOC & CEAI certificate.',
      deviceSession: 'Enterprise Underwriting Portal (Session: ZCC-2026-881)',
      documentRef: 'ZCC-MINUTES-APF-PUN-01.pdf',
    },
    {
      id: 'AUD-05',
      timestamp: '2026-09-19 12:30:18 IST',
      actor: 'Mr. Amitav Sen',
      role: 'COM',
      action: 'ENDORSE_AND_SUBMIT',
      priorStatus: 'COM_REVIEW',
      newStatus: 'PENDING_APPROVAL',
      remarks: 'Supervisory review complete. Verified 83.5% group exposure headroom and Piramal NOC covenant.',
      deviceSession: 'Firefox 130 / macOS 15 (IP: 10.4.11.45)',
      documentRef: 'COM-ENDORSEMENT-PACK.pdf',
    },
    {
      id: 'AUD-04',
      timestamp: '2026-09-19 11:45:10 IST',
      actor: 'Ar. Rajesh Deshpande',
      role: 'Valuer',
      action: 'VALUATION_REPORT_SUBMISSION',
      priorStatus: 'SITE_VISIT_COMPLETED',
      newStatus: 'VALUATION_SUBMITTED',
      remarks: 'Valuation report generated with Grade A+, adopted rate ₹7,450/sq.ft. Locked with SHA-256 hash.',
      deviceSession: 'Samsung Galaxy S24 Ultra (IMEI: ...8821) / GPS Geofence Valid',
      documentRef: 'VALUATION-REPORT-PUN-01-v1.0.pdf',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
        <div>
          <h4 className="text-sm font-bold text-[#102a43]">Immutable Audit Trail & Activity Timeline</h4>
          <p className="text-xs text-[#627d98]">Cryptographic provenance recording every state change, actor, and device fingerprint</p>
        </div>
        <span className="text-xs text-[#137333] font-bold bg-[#e6f4ea] px-2 py-0.5 rounded">
          Integrity Verified ✓
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
        {defaultEvents.map((evt) => (
          <div key={evt.id} className="relative space-y-1.5">
            {/* Timeline Dot */}
            <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#19638c] border-2 border-white shadow-xs" />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#102a43]">{evt.action.replace(/_/g, ' ')}</span>
                <span className="px-1.5 py-0.2 rounded font-bold uppercase text-[10px] bg-[#e8f1f5] text-[#19638c]">
                  {evt.role}
                </span>
                <span className="text-[#627d98]">by <strong>{evt.actor}</strong></span>
              </div>

              <span className="text-[11px] font-mono text-[#829ab1] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {evt.timestamp}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#627d98]">
              <span className="font-mono bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[10px]">{evt.priorStatus}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="font-mono font-bold text-[#137333] bg-[#e6f4ea] px-1.5 py-0.5 rounded text-[10px]">{evt.newStatus}</span>
            </div>

            <p className="text-xs text-[#334e68] leading-relaxed bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
              {evt.remarks}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#627d98]">
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3" />
                {evt.deviceSession}
              </span>
              {evt.documentRef && (
                <span className="font-mono text-[#19638c] font-semibold underline">
                  {evt.documentRef}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
