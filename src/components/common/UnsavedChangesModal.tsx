import React from 'react';
import { AlertTriangle, X, Save, ArrowLeft, Trash2 } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onSaveDraftAndLeave: () => void;
  onDiscardAndLeave: () => void;
  pageTitle?: string;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onStay,
  onSaveDraftAndLeave,
  onDiscardAndLeave,
  pageTitle = 'this form',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-amber-500 text-slate-950 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-slate-950" />
            <span>Unsaved Changes Detected</span>
          </div>
          <button
            type="button"
            onClick={onStay}
            className="p-1 rounded-lg hover:bg-black/10 text-slate-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900 text-sm">
            You have unsaved edits in {pageTitle}.
          </p>
          <p>
            Leaving without saving may discard changes you made to fields, valuation parameters, or master data records. How would you like to proceed?
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onStay}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
          >
            Stay on Page
          </button>
          <button
            type="button"
            onClick={onDiscardAndLeave}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard & Go Back</span>
          </button>
          <button
            type="button"
            onClick={onSaveDraftAndLeave}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0c3148] hover:bg-[#19638c] text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft & Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
