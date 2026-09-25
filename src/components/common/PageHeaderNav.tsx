import React, { useState } from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { UnsavedChangesModal } from './UnsavedChangesModal';

interface PageHeaderNavProps {
  moduleName: string;
  pageTitle: string;
  subtitle?: string;
  badge?: string;
  onBack: () => void;
  onGoHome?: () => void;
  hasUnsavedChanges?: boolean;
  onSaveDraft?: () => void;
  rightActions?: React.ReactNode;
}

export const PageHeaderNav: React.FC<PageHeaderNavProps> = ({
  moduleName,
  pageTitle,
  subtitle,
  badge,
  onBack,
  onGoHome,
  hasUnsavedChanges = false,
  onSaveDraft,
  rightActions,
}) => {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  const handleGoHomeClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else if (onGoHome) {
      onGoHome();
    } else {
      onBack();
    }
  };

  return (
    <>
      <div className="bg-white px-3.5 py-2 rounded-lg border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3.5">
        {/* Left: Back button + Navigation breadcrumb tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mandatory Back Button */}
          <button
            type="button"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors shadow-2xs"
            title="Go back to previous screen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="h-3.5 w-px bg-slate-300 hidden sm:block" />

          {/* Navigation Bar: [ Home ] [ Module ] */}
          <nav className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleGoHomeClick}
              className="px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="bg-[#0c3148] text-white px-2.5 py-0.5 rounded font-semibold text-xs shadow-2xs">
              {moduleName}
            </span>
          </nav>

          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {badge}
            </span>
          )}
        </div>

        {/* Right Actions Slot */}
        {rightActions && (
          <div className="flex items-center gap-2 flex-wrap">{rightActions}</div>
        )}
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        pageTitle={pageTitle}
        onStay={() => setShowUnsavedModal(false)}
        onSaveDraftAndLeave={() => {
          if (onSaveDraft) onSaveDraft();
          setShowUnsavedModal(false);
          onBack();
        }}
        onDiscardAndLeave={() => {
          setShowUnsavedModal(false);
          onBack();
        }}
      />
    </>
  );
};
