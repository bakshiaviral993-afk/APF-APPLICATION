import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  FileCheck2,
} from 'lucide-react';

interface LegalInitiateNoticeCardProps {
  report: LegalDueDiligenceReport;
  isLocked: boolean;
  isEditing: boolean;
  onInitiateVerification: () => void;
  onUnlock: () => void;
  onToggleEdit: () => void;
}

export const LegalInitiateNoticeCard: React.FC<LegalInitiateNoticeCardProps> = ({
  report,
  isLocked,
  isEditing,
  onInitiateVerification,
  onUnlock,
  onToggleEdit,
}) => {
  const isInitiated =
    report.status !== 'LEGAL_ASSIGNMENT_PENDING' &&
    Boolean(report.reviewerName && report.reviewerName.trim() !== '');

  // If locked, render an alert strip so the user knows why inputs are locked
  if (isLocked) {
    return (
      <div className="bg-amber-50 border border-amber-300 text-amber-950 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-medium text-amber-900">
            Dossier is <strong className="font-bold">Locked & Signed</strong>. Click Unlock to edit any fields or add deeds.
          </span>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          className="h-7 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Unlock className="w-3 h-3" />
          <span>Unlock to Edit</span>
        </button>
      </div>
    );
  }

  // If not yet initiated, show an assignment callout strip
  if (!isInitiated) {
    return (
      <div className="bg-sky-50 border border-sky-300 text-sky-950 px-3.5 py-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Send className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Legal Verification Assignment Pending:</span>{' '}
            <span className="text-slate-600">
              Assign empanelled legal counsel and dispatch project documentation for 30-year title search.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onInitiateVerification}
          className="h-7 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Assign & Initiate</span>
        </button>
      </div>
    );
  }

  // When already initiated & unlocked, keep it completely hidden or an ultra-subtle 1-line badge
  // to avoid consuming any unnecessary vertical scroll space
  return null;
};
