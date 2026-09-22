import React from 'react';
import { useAPF } from '../../context/APFContext';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';

export const Screen29_RenewalSuspension: React.FC = () => {
  const { setCurrentScreen, addAuditLog } = useAPF();

  const expiringCases = [
    { code: 'APF-2025-BLR-0419', project: 'Apex Skyline', city: 'Bengaluru', daysLeft: 34, exposure: '₹98.4 Cr', status: 'Annual Review Pending' },
    { code: 'APF-2025-PUN-0711', project: 'Emerald Park', city: 'Pune', daysLeft: 48, exposure: '₹145.0 Cr', status: 'Checklist In Progress' },
    { code: 'APF-2025-HYD-0192', project: 'Cyber Heights', city: 'Hyderabad', daysLeft: 71, exposure: '₹84.0 Cr', status: 'Documents Awaited' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Annual APF Renewal & Suspension Workspace</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20">
              90-Day Expiry Clock
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Proactive tracking of 12-month APF certificates requiring RERA milestone, NOC, and legal title refresh before expiry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('30')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Portfolio Intelligence (Screen 30) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* Expiring Cases Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#edf2f7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a43]">APF Certificates Expiring in &lt; 90 Days</h3>
          <span className="text-xs text-[#627d98]">Automated Trigger System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-[#627d98] font-medium border-b border-[#edf2f7]">
              <tr>
                <th className="py-3 px-4">APF Code</th>
                <th className="py-3 px-4">Project & Location</th>
                <th className="py-3 px-4">Days to Expiry</th>
                <th className="py-3 px-4">Retail Exposure</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[#102a43]">
              {expiringCases.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#19638c]">{c.code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#102a43] block">{c.project}</span>
                    <span className="text-[11px] text-[#627d98]">{c.city}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#b06000]">{c.daysLeft} Days</td>
                  <td className="py-3.5 px-4 font-bold text-[#102a43]">{c.exposure}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fef7e0] text-[#b06000]">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        addAuditLog('INITIATE_ANNUAL_RENEWAL', c.code, 'Triggered annual APF technical and legal renewal review');
                        setCurrentScreen('12');
                      }}
                      className="px-3 py-1 bg-[#19638c] hover:bg-[#145070] text-white rounded text-xs font-semibold shadow-xs"
                    >
                      Initiate Renewal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
