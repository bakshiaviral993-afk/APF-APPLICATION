import React, { useState } from 'react';
import {
  LegalAssignment,
  ConflictDeclarationStatus,
} from '../../types/legalDueDiligence';
import { legalStore } from '../../services/legalStore';
import { UserAccount } from '../../types/apfTransaction';
import {
  Scale,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

interface AssignmentAcceptDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: LegalAssignment;
  currentUser: UserAccount;
  onAccepted: (updated: LegalAssignment) => void;
  onDeclined: (updated: LegalAssignment) => void;
}

export const AssignmentAcceptDeclineModal: React.FC<AssignmentAcceptDeclineModalProps> = ({
  isOpen,
  onClose,
  assignment,
  currentUser,
  onAccepted,
  onDeclined,
}) => {
  const [actionTab, setActionTab] = useState<'ACCEPT' | 'DECLINE'>('ACCEPT');
  const [conflictStatus, setConflictStatus] = useState<ConflictDeclarationStatus>('No Conflict');
  const [conflictRemarks, setConflictRemarks] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if ((conflictStatus === 'Potential Conflict' || conflictStatus === 'Conflict Exists') && !conflictRemarks.trim()) {
      setError('Please provide detailed remarks regarding the identified conflict or potential relationship.');
      return;
    }

    if (conflictStatus === 'Conflict Exists') {
      setError('Acceptance is blocked due to direct Conflict of Interest. Please decline assignment or contact Credit Operations.');
      return;
    }

    if (!declarationConfirmed) {
      setError('Please check the confirmation declaration before submitting acceptance.');
      return;
    }

    try {
      const updated = legalStore.acceptAssignment(assignment.id, {
        status: conflictStatus,
        remarks: conflictRemarks,
        declaredBy: currentUser.name,
        declaredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        firmName: currentUser.firmName || assignment.firmName,
        barRegistration: currentUser.barCouncilNumber || 'MAH/4921/2012',
      });
      onAccepted(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to accept assignment');
    }
  };

  const handleDecline = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!declineReason.trim()) {
      setError('Mandatory: Please specify a clear reason for declining this legal assignment.');
      return;
    }

    try {
      const updated = legalStore.declineAssignment(assignment.id, declineReason);
      onDeclined(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to decline assignment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in-50 my-6">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Legal Assignment Acceptance & Review</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {assignment.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bank Legal Due Diligence & Conflict of Interest Assessment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Assignment Particulars Summary Card */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">APF Case ID</span>
                <span className="font-bold text-slate-800 font-mono">{assignment.caseId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scope Type</span>
                <span className="font-medium text-slate-800">{assignment.scopeType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">SLA Commitment</span>
                <span className="font-bold text-sky-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" /> {assignment.slaDays} Business Days
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Due Date</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {assignment.slaDueDate?.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assigned Advocate</span>
                <span className="font-semibold text-slate-900">{assignment.assignedUserName}</span>
                <span className="text-[10px] text-slate-500 block">{assignment.firmName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scope Coverage</span>
                <span className="text-slate-800 font-medium block">
                  Phases: {assignment.phaseNames.join(', ')}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Towers: {assignment.towerNames.join(', ')}
                </span>
              </div>
            </div>

            {assignment.specialInstructions && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Bank CPA Instructions
                </span>
                <p className="text-slate-700 mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-200 text-[11px]">
                  {assignment.specialInstructions}
                </p>
              </div>
            )}

            {assignment.requiredSearches && assignment.requiredSearches.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Required Searches & Certifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assignment.requiredSearches.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Tabs: Accept or Decline */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActionTab('ACCEPT');
                setError(null);
              }}
              className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                actionTab === 'ACCEPT'
                  ? 'border-sky-600 text-sky-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accept Assignment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActionTab('DECLINE');
                setError(null);
              }}
              className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                actionTab === 'DECLINE'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Decline Assignment</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 animate-in fade-in-50">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {actionTab === 'ACCEPT' ? (
            <form onSubmit={handleAccept} className="space-y-4">
              {/* Conflict of Interest Declaration */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    Section 9: Mandatory Conflict of Interest Declaration
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                    Conflict Status (Rule: Independent Legal Due Diligence)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                        conflictStatus === 'No Conflict'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="conflict"
                        value="No Conflict"
                        checked={conflictStatus === 'No Conflict'}
                        onChange={() => setConflictStatus('No Conflict')}
                        className="sr-only"
                      />
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          conflictStatus === 'No Conflict' ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span>No Conflict</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                        conflictStatus === 'Potential Conflict'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="conflict"
                        value="Potential Conflict"
                        checked={conflictStatus === 'Potential Conflict'}
                        onChange={() => setConflictStatus('Potential Conflict')}
                        className="sr-only"
                      />
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${
                          conflictStatus === 'Potential Conflict' ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span>Potential Conflict</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                        conflictStatus === 'Conflict Exists'
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="conflict"
                        value="Conflict Exists"
                        checked={conflictStatus === 'Conflict Exists'}
                        onChange={() => setConflictStatus('Conflict Exists')}
                        className="sr-only"
                      />
                      <ShieldAlert
                        className={`w-3.5 h-3.5 ${
                          conflictStatus === 'Conflict Exists' ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      />
                      <span>Conflict Exists</span>
                    </label>
                  </div>
                </div>

                {(conflictStatus === 'Potential Conflict' || conflictStatus === 'Conflict Exists') && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Conflict Remarks & Mitigation Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={conflictRemarks}
                      onChange={(e) => setConflictRemarks(e.target.value)}
                      placeholder="Specify nature of past representation, family interest, or concurrent promoter engagement..."
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                    />
                    {conflictStatus === 'Conflict Exists' && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-1">
                        Bank Policy: Direct conflicts strictly preclude acceptance. Please decline this assignment.
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationConfirmed}
                      onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600">
                      I, <strong>{currentUser.name}</strong>, representing <strong>{currentUser.firmName || assignment.firmName}</strong>, hereby accept this assignment, confirm independence under Bar Council regulations, and commit to delivering the Title Scrutiny & Legal Report within <strong>{assignment.slaDays} business days</strong>.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={conflictStatus === 'Conflict Exists'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Acceptance & Start SLA</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDecline} className="space-y-4">
              <div className="border border-rose-200 rounded-lg p-3.5 space-y-3 bg-rose-50/50">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Decline Assignment Reason (Mandatory)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Declining returns this assignment to the Bank Credit Processing Associate (CPA) with full audit logging for reallocation.
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Select or Enter Reason for Declining
                  </label>
                  <select
                    onChange={(e) => setDeclineReason(e.target.value)}
                    value={declineReason}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white mb-2"
                  >
                    <option value="">-- Choose reason or type below --</option>
                    <option value="Direct Conflict of Interest with Promoter / Landowner">
                      Direct Conflict of Interest with Promoter / Landowner
                    </option>
                    <option value="SLA Timeline Unfeasible due to Registry Backlog">
                      SLA Timeline Unfeasible due to Registry Backlog
                    </option>
                    <option value="Jurisdiction / Geographic Inconvenience (Outside Pune Area)">
                      Jurisdiction / Geographic Inconvenience (Outside Pune Area)
                    </option>
                    <option value="Current Capacity / Active Case Load Ceiling Reached">
                      Current Capacity / Active Case Load Ceiling Reached
                    </option>
                    <option value="Sub-Registrar Haveli Office Certified Copy Boycott">
                      Sub-Registrar Haveli Office Certified Copy Boycott
                    </option>
                  </select>

                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Provide specific explanation for CPA records..."
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Decline & Return to CPA</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
