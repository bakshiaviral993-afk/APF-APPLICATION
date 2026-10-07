import React, { useState } from 'react';
import {
  LegalQueryItem,
  LegalQueryCategory,
  LegalQueryStatus,
} from '../../types/legalDueDiligence';
import { legalStore } from '../../services/legalStore';
import { UserAccount } from '../../types/apfTransaction';
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Paperclip,
  User,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface LegalQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  reviewId: string;
  vendorId?: string;
  currentUser: UserAccount;
  activeQuery?: LegalQueryItem | null;
  onQueryUpdated?: () => void;
}

const QUERY_CATEGORIES: LegalQueryCategory[] = [
  'Missing Certified Deed',
  'Latest Search Report',
  'Lender NOC',
  'Landowner Confirmation',
  'Revised RERA Document',
  'Clarification of Survey Number',
  'Authority Document',
  'Revenue Map Mismatch',
  'Other',
];

export const LegalQueryModal: React.FC<LegalQueryModalProps> = ({
  isOpen,
  onClose,
  caseId,
  reviewId,
  vendorId,
  currentUser,
  activeQuery,
  onQueryUpdated,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(!activeQuery);
  const [category, setCategory] = useState<LegalQueryCategory>(
    activeQuery?.category || 'Missing Certified Deed'
  );
  const [subject, setSubject] = useState(activeQuery?.subject || '');
  const [inputRequired, setInputRequired] = useState(activeQuery?.inputRequired || '');
  const [assignedTo, setAssignedTo] = useState<'CPA' | 'COM' | 'Developer'>(
    (activeQuery?.assignedTo as any) || 'CPA'
  );
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    activeQuery?.priority || 'HIGH'
  );
  const [relatedSection, setRelatedSection] = useState<any>(
    activeQuery?.relatedLegalSection || 'Title Chain'
  );
  const [dueDate, setDueDate] = useState(
    activeQuery?.dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [attachmentName, setAttachmentName] = useState(activeQuery?.attachmentName || '');
  const [replyMessage, setReplyMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Query Subject is required.');
      return;
    }
    if (!inputRequired.trim()) {
      setError('Please specify the exact clarification or document required.');
      return;
    }

    try {
      legalStore.raiseQuery({
        caseId,
        reviewId,
        vendorId: vendorId || currentUser.vendorId || 'VND-LEGAL-001',
        category,
        subject,
        inputRequired,
        assignedTo,
        priority,
        dueDate,
        relatedLegalSection: relatedSection,
        raisedBy: currentUser.name,
        raisedByRole: currentUser.roleLabel || currentUser.role,
        attachmentName: attachmentName || undefined,
      });

      if (onQueryUpdated) onQueryUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to raise query');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery) return;
    if (!replyMessage.trim()) return;

    try {
      legalStore.respondQuery(
        activeQuery.id,
        replyMessage,
        currentUser.name,
        currentUser.roleLabel || currentUser.role,
        attachmentName || undefined
      );
      setReplyMessage('');
      setAttachmentName('');
      if (onQueryUpdated) onQueryUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to post response');
    }
  };

  const handleCloseQuery = () => {
    if (!activeQuery) return;
    try {
      legalStore.closeQuery(activeQuery.id);
      if (onQueryUpdated) onQueryUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to close query');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in-50 my-6 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  {isCreatingNew ? 'Request Input / Raise Legal Clarification' : `Query Thread: ${activeQuery?.id}`}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {caseId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bank CPA & Developer Input Protocol
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

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {isCreatingNew ? (
          <form onSubmit={handleCreateQuery} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Query Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LegalQueryCategory)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  {QUERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Related Legal Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={relatedSection}
                  onChange={(e) => setRelatedSection(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="Title Chain">Section 5: Title Chain Review</option>
                  <option value="Ownership">Section 6: Ownership Verification</option>
                  <option value="Development Rights">Section 7: Development Rights (DA/POA)</option>
                  <option value="Encumbrance">Section 8: Encumbrance & Charges</option>
                  <option value="Litigation">Section 9: Litigation Scrutiny</option>
                  <option value="RERA">Section 10: RERA & Plan Approvals</option>
                  <option value="Document Checklist">Section 3: Document Checklist</option>
                  <option value="Exceptions & Conditions">Section 11/12: Exceptions & Conditions</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Subject Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Request for certified copy of 2011 Partition Deed Schedule B"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Input Required / Specific Clarification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={inputRequired}
                onChange={(e) => setInputRequired(e.target.value)}
                placeholder="Detail the exact missing instrument, revenue clarification, or NOC condition needed to clear title scrutiny..."
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Assign To Action Cell
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="CPA">Credit Processing Associate (CPA)</option>
                  <option value="COM">Credit Operations Manager (COM)</option>
                  <option value="Developer">Developer / Builder Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (SLA Impacting)</option>
                  <option value="CRITICAL">Critical (Title Blocking)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Required Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Supporting Attachment (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. Haveli_Registry_Excerpt_Doc4912.pdf"
                  className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setAttachmentName('Extract_Notice_Document_Scrutiny.pdf')}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach Sample</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Query to CPA</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Existing Query Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {activeQuery?.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeQuery?.status === 'INPUT_RECEIVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeQuery?.status === 'CLOSED'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeQuery?.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{activeQuery?.subject}</h4>
              <p className="text-slate-600 text-xs">{activeQuery?.inputRequired}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Raised by: {activeQuery?.raisedBy}</span>
                <span>•</span>
                <span>Assigned to: {activeQuery?.assignedTo}</span>
                <span>•</span>
                <span>Due: {activeQuery?.dueDate}</span>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-800 block">Clarification Thread</span>
              <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                {activeQuery?.responses?.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-lg border text-xs ${
                      r.senderRole?.includes('CPA') || r.senderRole?.includes('COM')
                        ? 'bg-sky-50/70 border-sky-200 ml-4'
                        : 'bg-white border-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px]">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {r.sender} ({r.senderRole})
                      </span>
                      <span className="text-slate-400">{r.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{r.message}</p>
                    {r.attachmentName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono text-sky-700">
                        <Paperclip className="w-3 h-3" />
                        <span>{r.attachmentName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Response Input */}
            {activeQuery?.status !== 'CLOSED' && (
              <form onSubmit={handleSendReply} className="space-y-2.5 pt-2 border-t border-slate-200">
                <textarea
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type advocate response or acknowledge document receipt..."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCloseQuery}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Query as Resolved</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
