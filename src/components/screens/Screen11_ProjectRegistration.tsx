import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';
import { Building, MapPin, Calendar, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export const Screen11_ProjectRegistration: React.FC = () => {
  const { setCurrentScreen, selectedProject, selectedCompany, addAuditLog } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Project Registration & RERA Master</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              New APF Proposal
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Capture project metadata, MahaRERA registration number, micro-market coordinates and bank escrow accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('12')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Project 360 (Screen 12) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Main Registration Form Card */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-[#102a43]">Project Identity & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">Project Name</label>
            <input
              type="text"
              readOnly
              value="Alpha Towers - Pune (Apex Greens)"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#102a43] font-bold"
            />
          </div>
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">Developer / SPV</label>
            <input
              type="text"
              readOnly
              value="ABC Developers Pvt. Ltd. (Apex Habitat)"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#102a43] font-semibold"
            />
          </div>
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">RERA Registration No</label>
            <input
              type="text"
              readOnly
              value="P52100012345 (MahaRERA)"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#19638c] font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">City & Micro-Market</label>
            <input
              type="text"
              readOnly
              value="Pune West, Hinjawadi Phase 1"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#102a43] font-medium"
            />
          </div>
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">Total Towers / Phases</label>
            <input
              type="text"
              readOnly
              value="3 Towers (A, B, C) • 286 Total Units"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#102a43] font-medium"
            />
          </div>
          <div>
            <label className="text-[#627d98] block mb-1 font-medium">Total Project Cost</label>
            <input
              type="text"
              readOnly
              value="₹420.0 Cr"
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-[#137333] font-bold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#edf2f7] flex justify-end gap-3">
          <button
            onClick={() => {
              addAuditLog('VALIDATE_RERA', selectedProject.name, 'Validated MahaRERA registration status: ACTIVE');
              setCurrentScreen('12');
            }}
            className="px-5 py-2.5 bg-[#19638c] hover:bg-[#145070] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Confirm RERA & Proceed to Project 360
          </button>
        </div>
      </div>
    </div>
  );
};
