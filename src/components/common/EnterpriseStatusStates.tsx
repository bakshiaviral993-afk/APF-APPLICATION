import React from 'react';
import { ShieldAlert, Inbox, Clock, LogIn, ArrowRight, PhoneCall, RefreshCw } from 'lucide-react';

interface EmptyAssignmentsStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyAssignmentsState: React.FC<EmptyAssignmentsStateProps> = ({
  title = 'No active assignments',
  description = 'You currently do not have any active cases assigned in this queue. When cases are allocated to your desk or empanelled agency, they will appear here automatically.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white border border-[#DCE3EB] rounded-xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
        {icon || <Inbox className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-[#172033] mb-1.5">{title}</h3>
      <p className="text-xs text-[#667085] leading-relaxed mb-6">{description}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  caseId?: string;
  onBack?: () => void;
  onContactSupport?: () => void;
}

export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  title = 'You do not have access to this case',
  description = 'This case docket is restricted under bank information security and vendor isolation policy. Please contact the APF operations team if you believe this is an error.',
  caseId,
  onBack,
  onContactSupport,
}) => {
  return (
    <div className="bg-white border border-rose-200 rounded-xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
        <ShieldAlert className="w-7 h-7 text-rose-500" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mb-2 inline-block">
        Security Exception • HTTP 403
      </span>
      <h3 className="text-lg font-bold text-[#172033] mb-2">{title}</h3>
      {caseId && (
        <div className="inline-block text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 mb-3">
          Docket ID: {caseId}
        </div>
      )}
      <p className="text-xs text-[#667085] leading-relaxed mb-6">{description}</p>
      <div className="flex items-center justify-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        )}
        {onContactSupport && (
          <button
            onClick={onContactSupport}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            <span>Contact APF Desk</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface SessionExpiredModalProps {
  isOpen: boolean;
  onReLogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onReLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#DCE3EB] max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in-50 zoom-in-95">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-[#172033] mb-1">Session Expired</h3>
        <p className="text-xs text-[#667085] mb-6">
          Your secure underwriting session has timed out due to inactivity in accordance with bank security protocols. Please sign in again to continue your session safely.
        </p>
        <button
          onClick={onReLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Continue</span>
        </button>
      </div>
    </div>
  );
};
