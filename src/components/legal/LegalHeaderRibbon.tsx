import React from 'react';
import { LegalDueDiligenceReport } from '../../types/legalDueDiligence';
import { UserAccount } from '../../types/apfTransaction';
import {
  Scale,
  Send,
  Unlock,
  Edit3,
  Save,
  FileText,
  ShieldCheck,
  MessageSquare,
  Lock,
  Clock,
  Award,
  Download,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface LegalHeaderRibbonProps {
  report: LegalDueDiligenceReport;
  currentUser: UserAccount;
  isLocked: boolean;
  isEditing: boolean;
  onInitiateVerification: () => void;
  onUnlock: () => void;
  onToggleEdit: () => void;
  onSaveDraft: () => void;
  onOpenDocModal: () => void;
  onOpenSignModal: () => void;
  onDownloadReport?: () => void;
  onRaiseQuery?: (category: string, subject: string) => void;
}

export const LegalHeaderRibbon: React.FC<LegalHeaderRibbonProps> = ({
  report,
  currentUser,
  isLocked,
  isEditing,
  onInitiateVerification,
  onUnlock,
  onToggleEdit,
  onSaveDraft,
  onOpenDocModal,
  onOpenSignModal,
  onDownloadReport,
  onRaiseQuery,
}) => {
  const isLegalReviewerOrAdmin =
    currentUser.role === 'CPA' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'COM' ||
    currentUser.role === 'APPROVER';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEGAL_CLEAR':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
      case 'LEGAL_CONDITIONAL_CLEAR':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/80';
      case 'LEGAL_REVIEW_IN_PROGRESS':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Low':
        return 'text-emerald-400 font-bold';
      case 'Medium':
        return 'text-amber-400 font-bold';
      case 'High':
      case 'Critical':
        return 'text-rose-400 font-bold';
      default:
        return 'text-slate-300';
    }
  };

  const valRate = report.valuationAlignment?.adoptedBaseRateSqFt || 7200;
  const valFmv = report.valuationAlignment?.fairMarketValueCr || 244.8;

  return (
    <div className="bg-slate-900 text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-800 shadow-md space-y-1.5">
      {/* Row 1: Brand Title, Identifiers & Compact Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        {/* Left: Compact Title & Status Badges in a single tight row */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <Scale className="w-3.5 h-3.5" />
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase whitespace-nowrap">
            Legal Due Diligence Dossier
          </h3>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold shrink-0">
            {report.id}
          </span>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getStatusColor(
              report.status
            )}`}
          >
            {report.status.replace(/_/g, ' ')}
          </span>

          {isLocked ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 shrink-0">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>LOCKED</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1 shrink-0">
              <Edit3 className="w-2.5 h-2.5 text-sky-400" />
              <span>EDITABLE</span>
            </span>
          )}
        </div>

        {/* Right: High-Density Unified Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {/* Primary Download Report Button */}
          {onDownloadReport && (
            <button
              type="button"
              onClick={onDownloadReport}
              title="Download formal Legal Due Diligence & Valuation Report (HTML / PDF print)"
              className="h-7 px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1 border border-sky-400 cursor-pointer active:scale-98"
            >
              <Download className="w-3 h-3 text-white shrink-0" />
              <span className="whitespace-nowrap">Download Report</span>
            </button>
          )}

          {/* Initiate Verification Button */}
          <button
            type="button"
            onClick={onInitiateVerification}
            title="Assign advocate, set SLA, configure scope and dispatch documents"
            className="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 active:scale-98 cursor-pointer"
          >
            <Send className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">Initiate</span>
          </button>

          {/* Unlock Button if Locked */}
          {isLocked ? (
            <button
              type="button"
              onClick={onUnlock}
              className="h-7 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Unlock className="w-3 h-3 shrink-0" />
              <span>Unlock</span>
            </button>
          ) : (
            <>
              {/* Edit Mode Toggle */}
              <button
                type="button"
                onClick={onToggleEdit}
                className={`h-7 px-2 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  isEditing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                <Edit3 className="w-3 h-3 shrink-0" />
                <span>{isEditing ? 'Editing' : 'View'}</span>
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={onSaveDraft}
                className="h-7 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-[11px] rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Save</span>
              </button>
            </>
          )}

          {/* Formal PDF Report Modal */}
          <button
            type="button"
            onClick={onOpenDocModal}
            className="h-7 px-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-[11px] rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Docket</span>
          </button>

          {/* Digital Sign Button */}
          {!isLocked && isLegalReviewerOrAdmin && (
            <button
              type="button"
              onClick={onOpenSignModal}
              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>Sign</span>
            </button>
          )}

          {/* Raise Query */}
          {onRaiseQuery && (
            <button
              type="button"
              onClick={() => onRaiseQuery('Legal', `Legal Clarification for ${report.id}`)}
              className="h-7 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Raise Legal Query"
            >
              <MessageSquare className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Query</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Slimline Metadata Strip (Counsel, SLA, Valuation & Score) */}
      <div className="pt-1.5 border-t border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-1.5 text-[11px] text-slate-300">
        {/* Counsel & SLA Information */}
        <div className="flex items-center gap-1.5 flex-wrap text-slate-400">
          <span>Counsel:</span>
          <strong className="text-white font-medium">{report.reviewerName}</strong>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 truncate max-w-[200px]" title={report.reviewerFirm}>
            {report.reviewerFirm}
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-sky-300">{report.empanelmentNo}</span>
          <span className="text-slate-600">·</span>
          <span>
            Route: <strong className="text-slate-200">{report.legalRoute}</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-rose-300 font-medium">
            <Clock className="w-2.5 h-2.5 text-rose-400" />
            <span>SLA: <strong className="font-mono text-white">{report.slaDueDate}</strong></span>
          </span>
        </div>

        {/* Valuation & Legal Score Micro-Chips */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Valuation:</span>
            <span className="font-mono font-bold text-emerald-400">₹{valFmv.toFixed(1)} Cr</span>
            <span className="text-slate-500 font-mono">(@ ₹{valRate.toLocaleString()}/sf)</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
            <Award className="w-2.5 h-2.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Score:</span>
            <span className="font-mono font-bold text-sky-400">
              {report.legalScore?.finalLegalScore || 0}/100
            </span>
            <span className="text-slate-600">·</span>
            <span className={getRiskColor(report.legalOpinion?.riskBand)}>
              {report.legalOpinion?.riskBand || 'Low'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
