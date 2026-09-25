import React, { useState } from 'react';
import {
  Search,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Edit2,
  XCircle,
  Database,
  ArrowRight,
  Globe,
  FileText,
  Lock,
} from 'lucide-react';
import {
  DiscoveredBuilderData,
  DiscoveredFieldProvenance,
  FetchJob,
} from '../../types/discoveryTypes';
import { UserAccount, BuilderMaster } from '../../types/apfTransaction';
import { discoveryService } from '../../services/discoveryService';
import { masterStore } from '../../services/masterStore';

interface DiscoverBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onBuilderSaved: (savedBuilder: BuilderMaster, openProjectDiscovery?: boolean) => void;
  initialQuery?: string;
}

export const DiscoverBuilderModal: React.FC<DiscoverBuilderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBuilderSaved,
  initialQuery = '',
}) => {
  const [queryName, setQueryName] = useState(initialQuery);
  const [queryPan, setQueryPan] = useState('');
  const [queryCin, setQueryCin] = useState('');
  const [queryCity, setQueryCity] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [currentJob, setCurrentJob] = useState<FetchJob | null>(null);
  const [discoveredData, setDiscoveredData] = useState<DiscoveredBuilderData | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  // Field editing state
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');

  if (!isOpen) return null;

  const handleStartDiscovery = async (overrideQuery?: string) => {
    const q = overrideQuery || queryName;
    if (!q && !queryPan && !queryCin) return;

    setIsFetching(true);
    setDiscoveredData(null);
    setShowOverrideInput(false);

    try {
      const result = await discoveryService.discoverBuilder(
        {
          nameOrPan: q,
          pan: queryPan,
          cin: queryCin,
          city: queryCity,
        },
        (job) => {
          setCurrentJob({ ...job });
        }
      );
      setDiscoveredData(result);
    } catch (err) {
      console.error('Discovery error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldDecision = (
    fieldKey: string,
    decision: 'ACCEPT' | 'REJECT' | 'EDIT'
  ) => {
    if (!discoveredData) return;
    const field = discoveredData.fields[fieldKey];
    if (!field) return;

    if (decision === 'EDIT') {
      setEditingFieldKey(fieldKey);
      setEditInputValue(String(field.editedValue ?? field.value ?? ''));
      return;
    }

    const updatedFields = {
      ...discoveredData.fields,
      [fieldKey]: {
        ...field,
        decision,
        verificationStatus: (decision === 'ACCEPT' ? 'VERIFIED' : 'REJECTED') as 'VERIFIED' | 'REJECTED',
      },
    };

    setDiscoveredData({
      ...discoveredData,
      fields: updatedFields,
    });
  };

  const handleSaveFieldEdit = (fieldKey: string) => {
    if (!discoveredData) return;
    const field = discoveredData.fields[fieldKey];
    if (!field) return;

    const updatedFields = {
      ...discoveredData.fields,
      [fieldKey]: {
        ...field,
        editedValue: editInputValue,
        isEdited: true,
        decision: 'ACCEPT' as const,
        verificationStatus: 'EDITED' as const,
      },
    };

    setDiscoveredData({
      ...discoveredData,
      fields: updatedFields,
    });
    setEditingFieldKey(null);
  };

  const handleSaveBuilder = (proceedToProjects: boolean = false) => {
    if (!discoveredData) return;

    const saved = discoveryService.commitDiscoveredBuilder(discoveredData, currentUser);
    onBuilderSaved(saved, proceedToProjects);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Intelligent Builder Discovery & Auto-Fetch
                </h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  RBI Staged Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Orchestrates MCA, MahaRERA, Stock Exchange Disclosures, Corporate Filings & Credit Ratings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Search Inputs Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                Discovery Search Parameters
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span>Try Demo Entities:</span>
                {[
                  { label: 'Kolte-Patil', q: 'Kolte-Patil Developers Ltd' },
                  { label: 'Godrej Properties', q: 'Godrej Properties Ltd' },
                  { label: 'Lodha / Macrotech', q: 'Macrotech Developers Ltd' },
                  { label: 'Shapoorji Pallonji', q: 'Shapoorji Pallonji Real Estate' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setQueryName(preset.q);
                      handleStartDiscovery(preset.q);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Builder / Corporate Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    placeholder="e.g. Kolte-Patil Developers Ltd"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN (Optional)
                </label>
                <input
                  type="text"
                  value={queryPan}
                  onChange={(e) => setQueryPan(e.target.value.toUpperCase())}
                  placeholder="e.g. AAACK4812K"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / State
                </label>
                <input
                  type="text"
                  value={queryCity}
                  onChange={(e) => setQueryCity(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authoritative Priority: MCA Master Data &rarr; Charges &rarr; MahaRERA &rarr; BSE/NSE Filings</span>
              </div>
              <button
                onClick={() => handleStartDiscovery()}
                disabled={isFetching || (!queryName && !queryPan && !queryCin)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>FETCHING REGULATORY DATA...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>FETCH BUILDER DATA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Fetch Job UX & Source Progress */}
          {currentJob && (
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${currentJob.status === 'READY_FOR_REVIEW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {currentJob.status === 'READY_FOR_REVIEW' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">
                      Discovery Job: <span className="font-mono text-indigo-300">{currentJob.jobId}</span>
                    </div>
                    <div className="text-xs text-slate-400">{currentJob.currentStepMessage}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                    currentJob.status === 'READY_FOR_REVIEW'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {currentJob.status} ({currentJob.progressPct}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${currentJob.progressPct}%` }}
                />
              </div>

              {/* Source Checklist Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
                {currentJob.sources.map((src, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      src.status === 'COMPLETE'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : src.status === 'NOT_CONNECTED'
                        ? 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                        : src.status === 'SEARCHING' || src.status === 'FETCHING'
                        ? 'bg-indigo-950/40 border-indigo-700/60 text-indigo-300 animate-pulse'
                        : 'bg-slate-800/20 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="font-medium truncate flex items-center gap-1">
                        {src.isRestricted && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span className="truncate">{src.sourceName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {src.status === 'COMPLETE'
                          ? `✓ ${src.recordsFound} record(s)`
                          : src.status === 'NOT_CONNECTED'
                          ? 'Not Connected (Restricted)'
                          : src.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Resolution Warning Banner */}
          {discoveredData?.duplicateMatch?.isDuplicate && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900">
                    Existing Master Entity Resolution Triggered
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    {discoveredData.duplicateMatch.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const existing = masterStore.getBuilderById(
                          discoveredData.duplicateMatch!.existingBuilderId
                        );
                        if (existing) {
                          onBuilderSaved(existing, true);
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                    >
                      OPEN EXISTING RECORD ({discoveredData.duplicateMatch.existingBuilderId})
                    </button>
                    <button
                      onClick={() => {
                        handleSaveBuilder(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-amber-400 text-amber-900 hover:bg-amber-100 rounded text-xs font-semibold shadow-sm transition-colors"
                    >
                      MERGE DISCOVERED DATA WITH EXISTING
                    </button>
                    <button
                      onClick={() => setShowOverrideInput(!showOverrideInput)}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold transition-colors"
                    >
                      CREATE NEW WITH OVERRIDE
                    </button>
                  </div>

                  {showOverrideInput && (
                    <div className="mt-3 p-3 bg-white rounded border border-amber-200 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Regulatory Justification for Non-Merge / Distinct Entity
                      </label>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Distinct SPV entity incorporated under common group umbrella"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        disabled={!overrideReason.trim()}
                        onClick={() => handleSaveBuilder(true)}
                        className="px-3 py-1 bg-amber-600 disabled:opacity-50 text-white rounded text-xs font-semibold"
                      >
                        Confirm Override & Create
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discovered Field Review Table */}
          {discoveredData && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Discovered Regulatory Fields & Evidence Review</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-semibold">
                      {Object.keys(discoveredData.fields).length} Fields Extracted
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      (Overall Confidence: {(discoveredData.overallConfidence * 100).toFixed(0)}%)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized CPA / Risk Reviewer must accept, edit or reject each field before committing to Bank Master
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const updated = { ...discoveredData.fields };
                      Object.keys(updated).forEach((k) => {
                        updated[k].decision = 'ACCEPT';
                        updated[k].verificationStatus = 'VERIFIED';
                      });
                      setDiscoveredData({ ...discoveredData, fields: updated });
                    }}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors"
                  >
                    ACCEPT ALL FIELDS
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4 w-48">Field / Attribute</th>
                      <th className="py-2.5 px-4 min-w-[220px]">Discovered Value</th>
                      <th className="py-2.5 px-4 min-w-[200px]">Source & Reference</th>
                      <th className="py-2.5 px-4 w-28">Freshness</th>
                      <th className="py-2.5 px-4 w-24 text-center">Confidence</th>
                      <th className="py-2.5 px-4 w-44 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.values(discoveredData.fields).map((field) => {
                      const isEditing = editingFieldKey === field.fieldKey;

                      return (
                        <tr
                          key={field.fieldKey}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            field.decision === 'REJECT'
                              ? 'bg-rose-50/40 opacity-70'
                              : field.decision === 'ACCEPT'
                              ? 'bg-emerald-50/20'
                              : ''
                          }`}
                        >
                          {/* Label */}
                          <td className="py-3 px-4 font-semibold text-slate-800 align-top">
                            {field.label}
                          </td>

                          {/* Value */}
                          <td className="py-3 px-4 text-slate-900 align-top">
                            {isEditing ? (
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="text"
                                  value={editInputValue}
                                  onChange={(e) => setEditInputValue(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-indigo-400 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => handleSaveFieldEdit(field.fieldKey)}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingFieldKey(null)}
                                  className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div>
                                <span className={`font-medium ${field.isEdited ? 'text-indigo-700 font-bold' : ''}`}>
                                  {Array.isArray(field.editedValue ?? field.value)
                                    ? (field.editedValue ?? field.value).join(', ')
                                    : String(field.editedValue ?? field.value)}
                                </span>
                                {field.isEdited && (
                                  <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">
                                    EDITED
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Source & Reference */}
                          <td className="py-3 px-4 text-slate-600 align-top">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <span>{field.sourceName}</span>
                              {field.sourceUrl && (
                                <a
                                  href={field.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {field.documentId && <span>Doc: {field.documentId}</span>}
                              <span>As-of: {field.asOfDate}</span>
                            </div>
                          </td>

                          {/* Freshness Badge */}
                          <td className="py-3 px-4 align-top">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold font-mono inline-block ${
                                field.freshness === 'LIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : field.freshness === 'NEAR_REAL_TIME'
                                  ? 'bg-blue-100 text-blue-800'
                                  : field.freshness === 'PUBLIC_DISCLOSURE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {field.freshness}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td className="py-3 px-4 text-center align-top">
                            <span className="font-mono text-slate-700 font-semibold">
                              {(field.confidence * 100).toFixed(0)}%
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right align-top">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                title="Accept this value"
                                onClick={() => handleFieldDecision(field.fieldKey, 'ACCEPT')}
                                className={`p-1 rounded border transition-colors ${
                                  field.decision === 'ACCEPT'
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Edit this value"
                                onClick={() => handleFieldDecision(field.fieldKey, 'EDIT')}
                                className="p-1 rounded border bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Reject this field"
                                onClick={() => handleFieldDecision(field.fieldKey, 'REJECT')}
                                className={`p-1 rounded border transition-colors ${
                                  field.decision === 'REJECT'
                                    ? 'bg-rose-600 border-rose-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            CANCEL
          </button>

          <div className="flex items-center space-x-3">
            <button
              disabled={!discoveredData}
              onClick={() => handleSaveBuilder(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              SAVE TO BUILDER MASTER
            </button>
            <button
              disabled={!discoveredData}
              onClick={() => handleSaveBuilder(true)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>SAVE & FETCH PROJECTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
