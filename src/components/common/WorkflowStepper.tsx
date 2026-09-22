import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, User } from 'lucide-react';

export interface WorkflowStepItem {
  key: string;
  seq: number;
  label: string;
  role: string;
  description: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStepItem[];
  currentStepKey: string;
  onStepSelect?: (stepKey: string) => void;
  completedStepKeys?: string[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStepKey,
  onStepSelect,
  completedStepKeys = [],
}) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStepKey);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs p-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[900px] gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || completedStepKeys.includes(step.key);
          const isCurrent = step.key === currentStepKey;
          const isPending = idx > currentIndex;

          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => onStepSelect && onStepSelect(step.key)}
                className={`flex-1 text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#e8f1f5] border-[#19638c] shadow-xs'
                    : isCompleted
                    ? 'bg-[#f8fafc] border-[#cbd5e1] hover:border-[#94a3b8]'
                    : 'bg-white border-transparent text-[#94a3b8] hover:bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-[#137333] text-white'
                        : isCurrent
                        ? 'bg-[#19638c] text-white'
                        : 'bg-[#e2e8f0] text-[#627d98]'
                    }`}
                  >
                    {isCompleted ? '✓' : step.seq}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCurrent
                        ? 'bg-[#19638c] text-white'
                        : 'bg-[#f1f5f9] text-[#627d98]'
                    }`}
                  >
                    {step.role}
                  </span>
                </div>

                <div className="mt-1.5">
                  <div
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-[#102a43]'
                        : isCompleted
                        ? 'text-[#334e68]'
                        : 'text-[#94a3b8]'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-[#627d98] truncate">{step.description}</div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="text-[#cbd5e1] shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
