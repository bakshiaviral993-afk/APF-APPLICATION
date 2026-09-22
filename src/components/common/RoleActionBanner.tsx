import React from 'react';
import { ShieldCheck, ShieldAlert, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/apf';

interface RoleActionBannerProps {
  currentStageLabel: string;
  requiredRole: string;
  activeRole: string;
  onSwitchToRequiredRole: () => void;
  actionSummary: string;
}

export const RoleActionBanner: React.FC<RoleActionBannerProps> = ({
  currentStageLabel,
  requiredRole,
  activeRole,
  onSwitchToRequiredRole,
  actionSummary,
}) => {
  const isAuthorized =
    activeRole === requiredRole ||
    (requiredRole === 'Valuer' && (activeRole === 'Internal Valuer' || activeRole === 'External Valuer')) ||
    (requiredRole === 'Approver' && (activeRole === 'Approving Manager' || activeRole === 'Committee Member'));

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isAuthorized
          ? 'bg-[#e8f1f5]/80 border-[#19638c]/40 text-[#102a43]'
          : 'bg-[#fef7e0]/90 border-[#b06000]/40 text-[#102a43]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            isAuthorized ? 'bg-[#19638c] text-white' : 'bg-[#b06000] text-white'
          }`}
        >
          {isAuthorized ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627d98]">
              Workflow Security & Entitlement
            </span>
            <span className="text-[10px] px-2 py-0.2 rounded font-bold uppercase bg-white border border-[#cbd5e1] text-[#102a43]">
              Stage: {currentStageLabel}
            </span>
          </div>

          <h3 className="text-sm font-bold text-[#102a43] mt-0.5">
            {isAuthorized ? (
              <span className="text-[#137333] flex items-center gap-1.5">
                Authorized: You are logged in as {activeRole} (Action Owner)
              </span>
            ) : (
              <span className="text-[#b06000] flex items-center gap-1.5">
                Read-Only Access: Viewing as {activeRole}. Required Role: {requiredRole}
              </span>
            )}
          </h3>

          <p className="text-xs text-[#486581] mt-0.5">
            {actionSummary}. Bank policy permits full dossier visibility to all entitled roles while restricting state transitions strictly to the assigned owner.
          </p>
        </div>
      </div>

      {!isAuthorized && (
        <button
          onClick={onSwitchToRequiredRole}
          className="self-start sm:self-center px-4 py-2 bg-[#0c3148] hover:bg-[#19638c] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Switch to {requiredRole} Persona</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
