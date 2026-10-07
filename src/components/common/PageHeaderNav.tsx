import React, { useState } from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { UnsavedChangesModal } from './UnsavedChangesModal';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderNavProps {
  moduleName: string;
  pageTitle: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
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
  breadcrumbs,
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
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3">
        {/* Left: Back button + Navigation breadcrumb tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            title="Go back to previous screen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Navigation Bar / Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs flex-wrap">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label + idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                    {isLast ? (
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-semibold text-xs shadow-2xs">
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={crumb.onClick || handleGoHomeClick}
                        className="px-1.5 py-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoHomeClick}
                  className="px-2 py-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace</span>
                </button>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-md font-semibold text-xs shadow-2xs">
                  {moduleName}
                </span>
              </>
            )}
          </nav>

          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
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
