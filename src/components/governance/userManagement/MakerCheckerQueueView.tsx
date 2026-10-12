import React, { useState } from 'react';
import { UserAccessChangeRequest } from '../../../types/userManagementTypes';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

interface MakerCheckerQueueViewProps {
  currentUser: UserAccount;
}

export const MakerCheckerQueueView: React.FC<MakerCheckerQueueViewProps> = ({ currentUser }) => {
  const [changeRequests, setChangeRequests] = useState<UserAccessChangeRequest[]>(() =>
    userManagementStore.getChangeRequests()
  );
  const [selectedReq, setSelectedReq] = useState<UserAccessChangeRequest | null>(null);
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingRequests = changeRequests.filter((r) => r.status === 'PENDING_APPROVAL');
  const processedRequests = changeRequests.filter((r) => r.status !== 'PENDING_APPROVAL');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApprove = (req: UserAccessChangeRequest) => {
    setErrorMsg(null);
    try {
      userManagementStore.approveChangeRequest(
        req.id,
        { name: currentUser.name, role: currentUser.role },
        reviewerRemarks || 'Approved after verification of authorization and SoD rules.'
      );
      setChangeRequests(userManagementStore.getChangeRequests());
      setSelectedReq(null);
      setReviewerRemarks('');
      showToast(`Change request ${req.id} approved successfully. Target user access is now active.`);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleReject = (req: UserAccessChangeRequest) => {
    setErrorMsg(null);
    try {
      userManagementStore.rejectChangeRequest(
        req.id,
        { name: currentUser.name, role: currentUser.role },
        reviewerRemarks || 'Declined based on bank security access policy.'
      );
      setChangeRequests(userManagementStore.getChangeRequests());
      setSelectedReq(null);
      setReviewerRemarks('');
      showToast(`Change request ${req.id} rejected.`);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400">✕</button>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-amber-900">
              Maker-Checker Dual Authorization Framework
            </strong>
            <p className="text-amber-800/90 mt-0.5 text-[11px]">
              Sensitive roles (Admin, Approver, Committee, Billing Checker) and administrative overrides
              require independent reviewer sign-off. Makers cannot self-approve.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300">
            {pendingRequests.length} Pending Actions
          </span>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Authorization Requests ({pendingRequests.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Reviewer Desk: {currentUser.role}</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700">No pending access requests</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All administrative user access changes have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => {
              const isMaker = req.requestedBy === currentUser.name;

              return (
                <div key={req.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                          {req.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {req.summary}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {req.changeType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Target User: <strong>{req.targetUserName}</strong> ({req.targetUserEmail})
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>Requested by: <strong className="text-slate-800">{req.requestedBy}</strong> ({req.requestedByRole})</div>
                      <div>{req.requestedAt}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <strong className="text-slate-700 block text-[11px]">Justification / Business Reason:</strong>
                    <p className="text-slate-600 italic">"{req.reason}"</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    {isMaker ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Maker Restriction: You cannot approve or reject your own request.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Reviewer remarks..."
                          value={selectedReq?.id === req.id ? reviewerRemarks : ''}
                          onChange={(e) => {
                            setSelectedReq(req);
                            setReviewerRemarks(e.target.value);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-64 focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          onClick={() => handleApprove(req)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60">
            <h3 className="font-bold text-slate-900 text-sm">Recently Processed Authorizations</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {processedRequests.map((req) => (
              <div key={req.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{req.id}</span>
                    <strong className="text-slate-800">{req.summary}</strong>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target: {req.targetUserName} • Reviewed by {req.reviewedBy} ({req.reviewedByRole}) on {req.reviewedAt}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 italic max-w-xs text-right">
                  "{req.reviewerRemarks}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
