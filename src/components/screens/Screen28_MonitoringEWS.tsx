import React, { useState } from 'react';
import { useAPF } from '../../context/APFContext';

interface AlertItem {
  id: string;
  projectOrBuilder: string;
  issue: string;
  exposure: string;
  severity: 'Critical' | 'High' | 'Medium';
  severityBadge: string;
  expectedProgress?: string;
  actualProgress?: string;
  variance?: string;
  previousVariance?: string;
  retailLinkedExposure?: string;
  nextInspection?: string;
  recommendedAction: string;
}

export const Screen28_MonitoringEWS: React.FC = () => {
  const { addAuditLog } = useAPF();
  const [selectedAlertId, setSelectedAlertId] = useState<string>('alpha-towers');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const alerts: AlertItem[] = [
    {
      id: 'beta-greens',
      projectOrBuilder: 'Beta Greens',
      issue: 'RERA registration expired',
      exposure: '₹176 Cr',
      severity: 'Critical',
      severityBadge: 'bg-[#c53b47] text-white',
      expectedProgress: '90%',
      actualProgress: '84%',
      variance: '-6 pp',
      previousVariance: '-4 pp',
      retailLinkedExposure: '₹176 Cr',
      nextInspection: '25 Sep 2026',
      recommendedAction: 'Serve notice to developer to furnish MahaRERA renewal receipt within 7 business days.',
    },
    {
      id: 'alpha-towers',
      projectOrBuilder: 'Alpha Towers',
      issue: 'Construction delay > planned tolerance',
      exposure: '₹214 Cr',
      severity: 'High',
      severityBadge: 'bg-[#c88a1b] text-white',
      expectedProgress: '82%',
      actualProgress: '76%',
      variance: '-6 pp',
      previousVariance: '-3 pp',
      retailLinkedExposure: '₹214 Cr',
      nextInspection: '30 Sep 2026',
      recommendedAction: 'Increase technical monitoring to fortnightly and retain stage-linked disbursement control.',
    },
    {
      id: 'abc-dev',
      projectOrBuilder: 'ABC Developers',
      issue: 'Group exposure crossed 80% threshold',
      exposure: '₹710 Cr',
      severity: 'High',
      severityBadge: 'bg-[#c88a1b] text-white',
      expectedProgress: 'N/A',
      actualProgress: 'N/A',
      variance: '+4.2 pp',
      previousVariance: '+1.5 pp',
      retailLinkedExposure: '₹710 Cr',
      nextInspection: '15 Oct 2026',
      recommendedAction: 'Place cap on fresh developer sanctions across all zonal approval committees.',
    },
    {
      id: 'gamma-city',
      projectOrBuilder: 'Gamma City',
      issue: 'Sales velocity down 32% QoQ',
      exposure: '₹112 Cr',
      severity: 'Medium',
      severityBadge: 'bg-[#19638c] text-white',
      expectedProgress: '60%',
      actualProgress: '58%',
      variance: '-2 pp',
      previousVariance: '-1 pp',
      retailLinkedExposure: '₹112 Cr',
      nextInspection: '10 Oct 2026',
      recommendedAction: 'Review builder cash flows and verify escrow receivables coverage.',
    },
    {
      id: 'delta-res',
      projectOrBuilder: 'Delta Residences',
      issue: 'Valuation decline >8%',
      exposure: '₹74 Cr',
      severity: 'Medium',
      severityBadge: 'bg-[#19638c] text-white',
      expectedProgress: '70%',
      actualProgress: '69%',
      variance: '-1 pp',
      previousVariance: '0 pp',
      retailLinkedExposure: '₹74 Cr',
      nextInspection: '20 Oct 2026',
      recommendedAction: 'Commission desktop valuation audit across micro-market comparables.',
    },
  ];

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[1];

  const handleCreateAction = () => {
    addAuditLog('CREATE_EWS_ACTION', selectedAlert.projectOrBuilder, selectedAlert.recommendedAction);
    setActionSuccess(`Action task initiated for ${selectedAlert.projectOrBuilder}!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Monitoring &amp; Early Warning</h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Continuous post-approval surveillance across project, builder and exposure
          </p>
        </div>
        <div className="text-xs text-[#627d98] font-medium flex items-center gap-1.5">
          <span>Bank POC</span>
          <span>|</span>
          <span>Relationship Manager</span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Alerts */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Active Alerts</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">27</h2>
            <span className="text-xs font-bold text-[#c53030]">8 high/critical</span>
          </div>
        </div>

        {/* Projects on Watchlist */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Projects on Watchlist</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">14</h2>
            <span className="text-xs font-bold text-[#b7791f]">₹682 Cr linked</span>
          </div>
        </div>

        {/* Construction Delays */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">Construction Delays</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">7</h2>
            <span className="text-xs font-bold text-[#b7791f]">&gt;90 days</span>
          </div>
        </div>

        {/* RERA / Legal Events */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs text-[#627d98] font-medium">RERA / Legal Events</p>
          <div className="flex items-baseline justify-between mt-2">
            <h2 className="text-2xl font-bold text-[#102a43] tracking-tight">5</h2>
            <span className="text-xs font-bold text-[#c53030]">2 critical</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Early Warning Queue & Selected Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Early Warning Queue */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
          <h3 className="text-sm font-bold text-[#102a43] mb-4">Early Warning Queue</h3>
          <div className="divide-y divide-[#edf2f7]">
            {alerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`py-3.5 px-3 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${
                    isSelected ? 'bg-[#f1f5f9]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md min-w-[62px] text-center ${alert.severityBadge}`}
                    >
                      {alert.severity}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#102a43]">{alert.projectOrBuilder}</h4>
                      <p className="text-[11px] text-[#627d98] mt-0.5">{alert.issue}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#102a43]">{alert.exposure}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Details */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102a43]">Selected Alert</h3>
            <div className="mt-2 mb-4">
              <h4 className="text-base font-bold text-[#102a43]">{selectedAlert.projectOrBuilder}</h4>
              <p className="text-xs font-bold text-[#b06000] mt-0.5">
                {selectedAlert.id === 'alpha-towers' ? 'Construction Delay' : selectedAlert.issue}
              </p>
            </div>

            <div className="divide-y divide-[#edf2f7] text-xs">
              <div className="py-2 flex justify-between items-center first:pt-0">
                <span className="text-[#627d98] font-medium">Expected progress</span>
                <span className="text-[#102a43] font-bold">{selectedAlert.expectedProgress}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Actual progress</span>
                <span className="text-[#102a43] font-bold">{selectedAlert.actualProgress}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Variance</span>
                <span className="text-[#c53030] font-bold">{selectedAlert.variance}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Previous variance</span>
                <span className="text-[#102a43] font-medium">{selectedAlert.previousVariance}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-[#627d98] font-medium">Retail linked exposure</span>
                <span className="text-[#102a43] font-bold">{selectedAlert.retailLinkedExposure}</span>
              </div>
              <div className="py-2 flex justify-between items-center last:pb-0">
                <span className="text-[#627d98] font-medium">Next inspection</span>
                <span className="text-[#102a43] font-medium">{selectedAlert.nextInspection}</span>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
              <p className="text-xs text-[#334155] leading-relaxed">
                <span className="font-bold text-[#102a43]">Recommended action: </span>
                {selectedAlert.recommendedAction}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleCreateAction}
              className="w-full bg-[#19638c] hover:bg-[#145070] text-white py-2.5 rounded-md text-xs font-medium transition-colors shadow-sm"
            >
              Create Monitoring Action
            </button>
            {actionSuccess && (
              <p className="text-center text-xs text-[#137333] font-semibold mt-2 animate-fade-in">
                ✓ {actionSuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
