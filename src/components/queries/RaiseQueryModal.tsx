import React, { useState } from 'react';
import { UserAccount, UserRole } from '../../types/apfTransaction';
import { QueryCategory, QueryPriority } from '../../types/queryTypes';
import { queryStore } from '../../services/queryStore';
import {
  X,
  MessageSquarePlus,
  AlertTriangle,
  Send,
  Paperclip,
  Clock,
  Shield,
  Building,
  HelpCircle,
} from 'lucide-react';

interface RaiseQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  caseId: string;
  builderId: string;
  builderName: string;
  projectId: string;
  projectName: string;
  towerName?: string;
  phaseName?: string;
  defaultCategory?: QueryCategory;
  defaultModule?: string;
  defaultField?: string;
  onQueryCreated?: (queryId: string) => void;
}

export const RaiseQueryModal: React.FC<RaiseQueryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  caseId,
  builderId,
  builderName,
  projectId,
  projectName,
  towerName,
  phaseName,
  defaultCategory = 'Valuation',
  defaultModule,
  defaultField,
  onQueryCreated,
}) => {
  const [assignedRole, setAssignedRole] = useState<UserRole>(
    currentUser.role === 'CPA'
      ? 'EXTERNAL_VALUER'
      : currentUser.role === 'EXTERNAL_VALUER' || currentUser.role === 'INTERNAL_VALUER'
      ? 'CPA'
      : currentUser.role === 'COM'
      ? 'CPA'
      : 'COM'
  );
  const [assignedUserName, setAssignedUserName] = useState('');
  const [category, setCategory] = useState<QueryCategory>(defaultCategory);
  const [subject, setSubject] = useState('');
  const [queryText, setQueryText] = useState('');
  const [priority, setPriority] = useState<QueryPriority>('Normal');
  const [isBlocking, setIsBlocking] = useState(false);
  const [slaHours, setSlaHours] = useState(24);
  const [relatedModule, setRelatedModule] = useState(defaultModule || 'Valuation');
  const [relatedField, setRelatedField] = useState(defaultField || '');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a query subject.');
      return;
    }
    if (!queryText.trim()) {
      setError('Please describe the required input or query.');
      return;
    }

    const created = queryStore.raiseQuery({
      caseId,
      builderId,
      builderName,
      projectId,
      projectName,
      towerName,
      phaseName,
      currentUser,
      assignedToRole: assignedRole,
      assignedToUserName: assignedUserName || undefined,
      category,
      subject: subject.trim(),
      queryText: queryText.trim(),
      priority,
      isBlocking,
      slaHours,
      relatedModule: relatedModule || undefined,
      relatedField: relatedField || undefined,
      attachmentName: attachmentName || undefined,
    });

    if (onQueryCreated) {
      onQueryCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Navy Header */}
        <div className="bg-[#0a2540] text-white px-6 py-4 flex items-center justify-between border-b border-[#133d59]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Raise Query / Request Input
              </h2>
              <p className="text-[11px] text-sky-200/80 font-mono">
                {caseId} • {builderName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Context Banner */}
          <div className="bg-[#f0f4f8] p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Project</span>
              <span className="font-semibold text-slate-800">{projectName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Tower / Scope</span>
              <span className="font-semibold text-slate-800">{towerName || 'All Towers'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Raised By</span>
              <span className="font-semibold text-slate-800">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Workflow Status</span>
              <span className="font-bold text-sky-800">Live Case</span>
            </div>
          </div>

          {/* Target Role & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Assign to Role *
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              >
                <option value="EXTERNAL_VALUER">External Valuer</option>
                <option value="INTERNAL_VALUER">Internal Technical Officer</option>
                <option value="CPA">Credit Processing Associate (CPA)</option>
                <option value="COM">Credit Operations Manager (COM)</option>
                <option value="APPROVER">Sanctioning Authority / Approver</option>
                <option value="ADMIN">Master Admin / Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Query Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QueryCategory)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              >
                <option value="Valuation">Valuation</option>
                <option value="Technical">Technical</option>
                <option value="Exposure">Exposure</option>
                <option value="Builder Data">Builder Data</option>
                <option value="Project Data">Project Data</option>
                <option value="Tower Data">Tower Data</option>
                <option value="Legal">Legal</option>
                <option value="Documents">Documents</option>
                <option value="Approval">Approval</option>
                <option value="LOS">LOS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QueryPriority)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 font-bold bg-white text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Subject / Brief Heading *
            </label>
            <input
              type="text"
              placeholder="e.g. Clarification on Tower B slab casting progress or comparable rates"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              required
            />
          </div>

          {/* Query Text */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Query / Input Details Required *
            </label>
            <textarea
              rows={3}
              placeholder="Specify the exact documentation, numerical input, or clarification required from the recipient..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-none"
              required
            />
          </div>

          {/* Related Section & SLA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Related Module
              </label>
              <input
                type="text"
                placeholder="e.g. Valuation Report, Exposure 360"
                value={relatedModule}
                onChange={(e) => setRelatedModule(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Related Field / Parameter
              </label>
              <input
                type="text"
                placeholder="e.g. Adopted Base Rate / CC"
                value={relatedField}
                onChange={(e) => setRelatedField(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                SLA TAT (Hours)
              </label>
              <select
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value={12}>12 Hours (Urgent)</option>
                <option value={24}>24 Hours (Standard)</option>
                <option value={48}>48 Hours</option>
                <option value={72}>72 Hours</option>
              </select>
            </div>
          </div>

          {/* Blocking Query Toggle */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="blocking-toggle"
              checked={isBlocking}
              onChange={(e) => setIsBlocking(e.target.checked)}
              className="mt-1 w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="blocking-toggle" className="cursor-pointer text-[11px]">
              <span className="font-bold text-amber-900 block">
                Blocking Query (Stop Next Workflow Transition)
              </span>
              <span className="text-amber-800">
                If checked, the case sub-status will transition to{' '}
                <strong>INPUT_REQUIRED</strong> and subsequent approval or endorsement actions will be
                locked until this query is resolved or answered.
              </span>
            </label>
          </div>

          {/* Attachment upload simulation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Reference Attachment (Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Site_Observation_Snag_Photo.jpg or Deed_Reference.pdf"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <button
                type="button"
                onClick={() => setAttachmentName(`Evidence_Doc_${Date.now().toString().slice(-4)}.pdf`)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold whitespace-nowrap text-xs"
              >
                Attach File
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-notifies {assignedRole} • Updates Dashboard Need Input Card
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Query & Notify</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
