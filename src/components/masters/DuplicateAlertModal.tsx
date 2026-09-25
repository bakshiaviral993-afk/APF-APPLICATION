import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, ShieldAlert, X } from 'lucide-react';

interface DuplicateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  matchingField?: string;
  existingRecordName?: string;
  existingRecordId?: string;
  onOpenExisting?: () => void;
  onContinueWithOverride: (reason: string) => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  matchingField,
  existingRecordName,
  existingRecordId,
  onOpenExisting,
  onContinueWithOverride,
}) => {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  if (!isOpen) return null;

  const handleOverrideSubmit = () => {
    if (!overrideReason.trim()) {
      alert('Please state an authorized business reason for overriding the duplicate check (e.g. Special Purpose Vehicle / SPV, Joint Venture entity, separate phase entity).');
      return;
    }
    onContinueWithOverride(overrideReason.trim());
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-amber-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-600">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-amber-100 font-medium">Bank Master Data Integrity & Deduplication Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Collision detected on {matchingField || 'Unique Identifier'}
            </p>
            <p className="text-xs text-amber-800">{message}</p>
          </div>

          {existingRecordId && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Existing Matching Record in Master:
              </span>
              <p className="text-slate-800 font-bold mt-0.5 text-sm">{existingRecordName || existingRecordId}</p>
              <p className="text-slate-500 font-mono text-[11px]">System ID: {existingRecordId}</p>
            </div>
          )}

          {!showOverrideInput ? (
            <div className="space-y-2 pt-2">
              {onOpenExisting && (
                <button
                  type="button"
                  onClick={onOpenExisting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0c3148] text-white text-xs font-bold hover:bg-[#15496b] transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Existing Master Record Instead
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowOverrideInput(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-amber-400 text-amber-900 text-xs font-bold hover:bg-amber-50 transition-all text-center"
              >
                Proceed with Authorized Management Override
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                Cancel & Review Form Data
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Authorized Override Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Valid separate SPV entity with distinct corporate registration or legal structure..."
                  className="w-full p-2.5 text-xs rounded-lg border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-amber-50/30"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This justification will be permanently stamped on the master audit trail.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOverrideSubmit}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Authorized Override
                </button>
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-100"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
