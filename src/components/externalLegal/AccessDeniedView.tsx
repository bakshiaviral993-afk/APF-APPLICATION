import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, Building2 } from 'lucide-react';
import { UserAccount } from '../../types/apfTransaction';

interface AccessDeniedViewProps {
  caseId?: string;
  currentUser: UserAccount;
  reason?: string;
  onBack: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  caseId,
  currentUser,
  reason,
  onBack,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-rose-200 shadow-sm max-w-lg w-full p-6 text-center space-y-4 animate-in fade-in-50">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Security Firewall & Data Isolation Active
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Access Denied</h2>
          <p className="text-xs text-slate-500 mt-1">
            Unauthorized APF Case Docket Access Attempt
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Requested Case Docket:</span>
            <span className="font-mono font-bold text-slate-800">{caseId || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Logged-In Counsel:</span>
            <span className="font-medium text-slate-800">{currentUser.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Authorized Firm:</span>
            <span className="font-medium text-slate-800">{currentUser.firmName || 'Demo Legal Associates'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Vendor ID:</span>
            <span className="font-mono text-slate-800">{currentUser.vendorId || 'VND-LEGAL-001'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Security Policy:</span>
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Section 5 Multi-Tenant Isolation
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {reason ||
            'Under bank credit policy and statutory confidentiality safeguards, external legal counsels may only inspect and scrutinize APF dockets specifically assigned to their firm and profile.'}
        </p>

        <div className="pt-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Authorized Legal Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
