import React from 'react';
import { useAPF } from '../../context/APFContext';
import { HardHat, MapPin, Camera, AlertTriangle, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export const Screen19_TechnicalAI: React.FC = () => {
  const { setCurrentScreen, selectedProject, setActiveEvidence } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Technical AI Site Inspection Workspace</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20">
              Physical Progress Audit
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Empanelled Engineer: Consulting Engineers Association of India (CEAI) • Visit Date: 2026-09-02 • Geo-tagged Inspection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('20')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Valuation Intelligence (Screen 20) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Progress Slip Card */}
      <div className="bg-[#fef7e0]/60 p-6 rounded-xl border border-[#b06000]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#fef7e0] text-[#b06000] border border-[#b06000]/30 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#102a43] text-sm sm:text-base">
              Construction Progress Slip Detected: -15.6% Variance (4.2 Months Delay)
            </h3>
            <p className="text-xs text-[#486581] mt-1 max-w-2xl leading-relaxed">
              Target physical milestone for September 2026 was 78.0% (18th slab completed across Towers A & B). Actual inspected progress stands at 62.4% (Tower A at 16th slab, Tower B at 14th slab).
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setActiveEvidence({
              sourceType: 'Site Inspection Report',
              sourceId: 'TECH-VISIT-2026-09',
              documentTitle: 'CEAI Geo-Tagged Site Inspection Report.pdf',
              pageOrSection: 'Section 3.2 (Slab Casting Audit)',
              asOfDate: '2026-09-02',
              extractedField: 'Actual Progress: 62.4% | Scheduled: 78.0% | Variance: -15.6%',
              snippet:
                'Site engineer physical inspection confirms Tower A has completed casting up to 16th floor RCC slab. Tower B stands at 14th slab. Sourcing can continue with milestone-linked disbursement checks...',
              confidenceScore: 0.99,
            })
          }
          className="px-4 py-2 bg-[#b06000] hover:bg-[#8f4e00] text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors"
        >
          View Technical Proof
        </button>
      </div>

      {/* Tower Stage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-[#102a43] text-sm">Tower A - Physical Progress</h4>
            <span className="font-mono font-bold text-xs text-[#137333]">68.0% (16th Slab)</span>
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-2.5">
            <div className="bg-[#137333] h-2.5 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="text-xs text-[#627d98] space-y-1">
            <div className="flex justify-between">
              <span>RERA Registered Handover:</span>
              <span className="font-mono font-medium text-[#102a43]">June 2027</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery Slip:</span>
              <span className="font-medium text-[#137333]">Within 60-day Grace Period</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-[#102a43] text-sm">Tower B - Physical Progress</h4>
            <span className="font-mono font-bold text-xs text-[#b06000]">56.8% (14th Slab)</span>
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-2.5">
            <div className="bg-[#b06000] h-2.5 rounded-full" style={{ width: '56.8%' }} />
          </div>
          <div className="text-xs text-[#627d98] space-y-1">
            <div className="flex justify-between">
              <span>Target Handover:</span>
              <span className="font-mono font-medium text-[#102a43]">December 2027</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery Slip:</span>
              <span className="font-medium text-[#b06000]">+4.2 Months Delay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
