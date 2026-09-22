import React from 'react';
import { useAPF } from '../../context/APFContext';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface TourStepMeta {
  step: number;
  title: string;
  screenId: string;
  narrative: string;
  keyTarget: string;
}

const TOUR_STEPS: TourStepMeta[] = [
  {
    step: 1,
    title: 'Search & Duplicate Check',
    screenId: '02',
    narrative: 'Search Apex Habitat / ABC Developers with PAN/CIN duplicate check & entity resolution.',
    keyTarget: 'Duplicate & Watchlist Checks',
  },
  {
    step: 2,
    title: 'Builder 360 Overview',
    screenId: '03',
    narrative: 'Single source of truth: Direct exposure vs retail-linked project exposure, promoter network & risk score.',
    keyTarget: 'Exposure Partitioning',
  },
  {
    step: 3,
    title: 'Exposure Reconciliation (₹42 Cr Discrepancy)',
    screenId: '07',
    narrative: 'Key POC Differentiator: Uncover ₹42 Cr undeclared Piramal NBFC term borrowing discovered from MCA charge & CRILC.',
    keyTarget: 'Golden Record Matcher',
  },
  {
    step: 4,
    title: 'Project 360 (Alpha Towers)',
    screenId: '12',
    narrative: 'Digital twin of Apex Greens: ₹214 Cr internal retail exposure, 6 towers, and physical delay signals.',
    keyTarget: 'Retail + Project Debt',
  },
  {
    step: 5,
    title: 'Tower Exposure Heatmap',
    screenId: '15',
    narrative: 'Interactive 400-unit matrix: drill down to delinquent units (Tower B) and loan-level details.',
    keyTarget: 'Unit-Level Risk Visual',
  },
  {
    step: 6,
    title: 'AI Underwriter Workspace',
    screenId: '25',
    narrative: 'Evidence-first AI findings with Accept, Edit, and Reject governance. Every claim cites primary documents.',
    keyTarget: 'Human-in-the-Loop AI',
  },
  {
    step: 7,
    title: 'Committee Decision Cockpit',
    screenId: '26',
    narrative: 'One-screen decision pack showing exposure before/after approval, policy exceptions, and authority limits.',
    keyTarget: 'Executive Decision Pack',
  },
  {
    step: 8,
    title: 'Approval & Conditions Maker-Checker',
    screenId: '27',
    narrative: 'Enforce mandatory conditions precedent (NBFC NOC & promoter guarantee) and maker-checker validation.',
    keyTarget: 'Governed Workflow',
  },
  {
    step: 9,
    title: 'Monitoring & Early Warning (EWS)',
    screenId: '28',
    narrative: 'Continuous surveillance: trigger construction delay alert (62.4% vs 78.0%) and convert into an assigned task.',
    keyTarget: 'Event-Driven Surveillance',
  },
];

export const DemoTourBar: React.FC = () => {
  const { tourStep, isTourOpen, setIsTourOpen, goToTourStep, nextTourStep, prevTourStep } = useAPF();

  if (!isTourOpen) return null;

  const currentStepData = TOUR_STEPS[tourStep - 1] || TOUR_STEPS[0];

  return (
    <div className="bg-indigo-950 border-b border-indigo-800/80 px-4 py-2 text-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      {/* Left: Step indicator & Title */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 shadow-xs">
          <Compass className="w-3.5 h-3.5" />
          <span>Demo Step {tourStep} of 9</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate text-xs sm:text-sm">
              {currentStepData.title}
            </span>
            <span className="hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded bg-indigo-900 border border-indigo-700 text-indigo-300 font-mono">
              Screen {currentStepData.screenId}
            </span>
          </div>
          <p className="text-[11px] text-indigo-200/80 line-clamp-1">
            {currentStepData.narrative}
          </p>
        </div>
      </div>

      {/* Middle: Step Dots / Progress */}
      <div className="hidden lg:flex items-center gap-1">
        {TOUR_STEPS.map((s) => (
          <button
            key={s.step}
            onClick={() => goToTourStep(s.step)}
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
              s.step === tourStep
                ? 'bg-white text-indigo-950 ring-2 ring-indigo-400 scale-110'
                : s.step < tourStep
                ? 'bg-indigo-700 text-indigo-200'
                : 'bg-indigo-900 text-indigo-400 hover:bg-indigo-800'
            }`}
            title={`Step ${s.step}: ${s.title}`}
          >
            {s.step}
          </button>
        ))}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          onClick={prevTourStep}
          disabled={tourStep === 1}
          className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-900 border border-indigo-700 text-indigo-200 hover:bg-indigo-800 disabled:opacity-40 text-xs transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          onClick={nextTourStep}
          disabled={tourStep === 9}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-white font-medium disabled:opacity-40 text-xs shadow-xs transition-colors"
        >
          <span>Next Step</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsTourOpen(false)}
          className="p-1 text-indigo-300 hover:text-white rounded hover:bg-indigo-900 transition-colors ml-1"
          title="Close Tour Guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
