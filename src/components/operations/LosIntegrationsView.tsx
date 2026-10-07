import React, { useState } from 'react';
import { UserAccount, APFCase } from '../../types/apfTransaction';
import { apfStore } from '../../services/apfStore';
import {
  getBuilderById,
  getProjectById,
  getTowerById,
} from '../../data/centralMasterData';
import { PageHeaderNav } from '../common/PageHeaderNav';
import {
  FileCode2,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Code2,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { LOSPayloadViewer } from '../common/LOSPayloadViewer';

interface LosIntegrationsViewProps {
  currentUser: UserAccount;
  onBack: () => void;
  onOpenCase?: (caseId: string) => void;
}

export const LosIntegrationsView: React.FC<LosIntegrationsViewProps> = ({
  currentUser,
  onBack,
  onOpenCase,
}) => {
  const [cases] = useState<APFCase[]>(() => apfStore.getAllCases());
  const [activeTab, setActiveTab] = useState<
    'PENDING' | 'PREVIEW' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'RETRY_QUEUE' | 'LOGS'
  >('PENDING');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'APF-2026-0001');

  const activeCase = apfStore.getCaseById(selectedCaseId) || cases[0];

  const handleDispatch = (caseId: string) => {
    apfStore.updateCaseStatus(
      caseId,
      'SENT_TO_LOS',
      'APF Sanction payload successfully dispatched to Core Bank Loan Origination System (LOS)'
    );
    alert(`Case ${caseId} dispatched to LOS Gateway. Response: HTTP 200 OK (LOS Ack #ACK-2026-9812).`);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <PageHeaderNav
        moduleName="LOS / Integrations"
        pageTitle="Loan Origination System (LOS) Integration Engine"
        subtitle="Core Banking STP Dispatch • JSON/XML Payload Generation • Gateway Acknowledgment Queue"
        breadcrumbs={[{ label: 'Operations', onClick: onBack }, { label: 'LOS / Integrations' }]}
        onBack={onBack}
        onGoHome={onBack}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Pending Dispatch</div>
          <div className="text-xl font-bold text-amber-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Dispatched & Acknowledged</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">
            {cases.filter((c) => c.currentStatus === 'SENT_TO_LOS' || c.currentStatus === 'APF_ACTIVE').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700">Failed / Retry Queue</div>
          <div className="text-xl font-bold text-rose-900 mt-1">0</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-700">Gateway Latency</div>
          <div className="text-xl font-bold text-sky-900 mt-1 font-mono">142 ms</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700">STP Success Rate</div>
          <div className="text-xl font-bold text-purple-900 mt-1">99.8%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'PENDING', label: 'Pending LOS Dispatch' },
          { id: 'PREVIEW', label: 'Payload Preview & Schema' },
          { id: 'SENT', label: 'Sent & Dispatched' },
          { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
          { id: 'LOGS', label: 'Integration Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'PENDING' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Approved Dockets Ready for LOS STP Dispatch
          </h3>

          <div className="space-y-2">
            {cases.map((c) => {
              const proj = getProjectById(c.projectId);
              const bld = getBuilderById(c.builderId);
              const twr = c.selectedTowerIds[0] ? getTowerById(c.selectedTowerIds[0]) : undefined;
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{c.id}</span>
                      <span className="font-semibold text-slate-800">{proj?.projectName || 'Project'}</span>
                      <span className="text-slate-500">({bld?.legalName || 'Builder'})</span>
                    </div>
                    <div className="text-slate-500 mt-0.5 text-[11px]">
                      Tower: {twr?.towerName || 'Sanctioned Towers'} · Sanction APF Rate: ₹7,200/sq.ft · Status: {c.currentStatus}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setActiveTab('PREVIEW');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
                    >
                      View JSON Payload
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDispatch(c.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch to LOS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'PREVIEW' && activeCase && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/90">
            <div className="text-xs font-semibold text-slate-700">
              Active Case: <strong className="text-slate-900 font-bold">{activeCase.id} ({getProjectById(activeCase.projectId)?.projectName || 'Project'})</strong>
            </div>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="h-8 px-2 text-xs font-bold rounded-lg border border-slate-300 bg-white"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {getProjectById(c.projectId)?.projectName || 'Project'}
                </option>
              ))}
            </select>
          </div>

          <LOSPayloadViewer
            payload={
              activeCase.losPayload || {
                apfCaseId: activeCase.id,
                apfNumber: activeCase.apfNumber || `APF/PUN/2026/${activeCase.id.slice(-4)}`,
                builderLegalName: getBuilderById(activeCase.builderId)?.legalName || 'Builder',
                projectName: getProjectById(activeCase.projectId)?.projectName || 'Project',
                currentStatus: activeCase.currentStatus,
                technicalGrade: activeCase.valuationReport?.technicalGrade || 'A',
                approvedValuationRate: activeCase.valuationReport?.recommendedApfRateSqFt || 7200,
                dispatchedBy: currentUser.email,
                dispatchTimestamp: new Date().toISOString(),
              }
            }
          />
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gateway Dispatch Stream</span>
            </span>
            <span>HTTP/2 TLS 1.3 Active</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div>[2026-10-06 08:14:02] INFO: Connecting to CBS / LOS Bridge at gateway.internal.bank:8443...</div>
            <div>[2026-10-06 08:14:03] INFO: Handshake verified. Mutual TLS certificate CN=PROVAL-APF-APPLET</div>
            <div>[2026-10-06 08:14:05] POST /api/v2/los/apf-sanctions/APF-2026-0001 &rarr; HTTP 200 OK (114ms)</div>
            <div>[2026-10-06 08:14:05] ACK received: los_app_id=LOS-2026-MUM-892110, status=APF_CODE_MAPPED</div>
            <div>[2026-10-06 08:14:06] INFO: Retail branch retail-los-portal updated with APF Rate: ₹7,200/sq.ft</div>
          </div>
        </div>
      )}
    </div>
  );
};
