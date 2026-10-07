import React, { useState } from 'react';
import { UserAccount } from '../../types/apfTransaction';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  FileBarChart,
  Clock,
  DollarSign,
  Scale,
  FileSearch,
  Users2,
  Receipt,
  FileCode2,
  History,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';
import { Screen30_PortfolioIntelligence } from '../screens/Screen30_PortfolioIntelligence';

interface ReportsLandingViewProps {
  currentUser: UserAccount;
  onBack: () => void;
}

export const ReportsLandingView: React.FC<ReportsLandingViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    'PORTFOLIO_MIS' | 'SLA_TAT' | 'EXPOSURE' | 'LEGAL' | 'VALUATION' | 'VENDORS' | 'BILLING' | 'LOS' | 'AUDIT'
  >('PORTFOLIO_MIS');

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="Reports & Audit"
        pageTitle="Enterprise APF Management Information System (MIS) & Audit Desk"
        subtitle="Executive reporting • Regulatory audit logs • Vendor turnaround SLA • Exposure analytics"
        breadcrumbs={[{ label: 'Governance', onClick: onBack }, { label: 'Reports & Audit' }]}
        onBack={onBack}
        onGoHome={onBack}
        rightActions={
          <button
            type="button"
            onClick={() => alert('Exporting MIS Excel workbook...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MIS Pack</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'PORTFOLIO_MIS', label: 'Portfolio MIS', icon: FileBarChart },
          { id: 'SLA_TAT', label: 'SLA / TAT Analytics', icon: Clock },
          { id: 'EXPOSURE', label: 'Exposure Concentration', icon: DollarSign },
          { id: 'LEGAL', label: 'Legal Scrutiny MIS', icon: Scale },
          { id: 'VALUATION', label: 'Valuation Benchmarks', icon: FileSearch },
          { id: 'VENDORS', label: 'Vendor Performance', icon: Users2 },
          { id: 'BILLING', label: 'Billing & Payments', icon: Receipt },
          { id: 'LOS', label: 'LOS Integrations', icon: FileCode2 },
          { id: 'AUDIT', label: 'Regulatory Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'PORTFOLIO_MIS' && (
        <Screen30_PortfolioIntelligence />
      )}

      {activeTab === 'SLA_TAT' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            SLA & Turnaround Time (TAT) Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Average End-to-End APF TAT</span>
              <div className="text-xl font-bold text-slate-900 mt-1">6.4 Business Days</div>
              <span className="text-[10px] text-emerald-700 font-semibold">1.6 days faster than 8-day SLA benchmark</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Technical Valuation TAT</span>
              <div className="text-xl font-bold text-slate-900 mt-1">3.2 Business Days</div>
              <span className="text-[10px] text-slate-500 font-semibold">Target: 4.0 days</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Legal Due Diligence TAT</span>
              <div className="text-xl font-bold text-slate-900 mt-1">4.8 Business Days</div>
              <span className="text-[10px] text-slate-500 font-semibold">Target: 5.0 days</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Immutable Regulatory Audit Log (RBI & NHB Compliance)
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { time: 'Today 08:14', user: 'system.gateway', action: 'LOS Sanction Payload Dispatched', entity: 'APF-2026-0001', hash: 'SHA256:7a89f...21' },
              { time: 'Today 08:10', user: 'approver.sr01', action: 'Approved with Conditions', entity: 'APF-2026-0001', hash: 'SHA256:4b12c...99' },
              { time: 'Yesterday 17:30', user: 'credit.com01', action: 'Escalated to Approval Cockpit', entity: 'APF-2026-0001', hash: 'SHA256:3d81e...14' },
              { time: 'Yesterday 14:15', user: 'cpa.desk01', action: 'Valuation & Legal Scrutiny Synthesized', entity: 'APF-2026-0001', hash: 'SHA256:9182a...bc' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 text-[11px]">{log.time}</span>
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-slate-500 font-mono">({log.entity})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600">{log.user}</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {log.hash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
