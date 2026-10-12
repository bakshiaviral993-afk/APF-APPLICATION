import React, { useState } from 'react';
import { userManagementStore } from '../../../services/userManagementStore';
import { Layers, Activity, Search, Shield, CheckCircle2 } from 'lucide-react';

export const ModuleOperationMasterView: React.FC = () => {
  const [subTab, setSubTab] = useState<'MODULES' | 'OPERATIONS'>('MODULES');
  const [searchTerm, setSearchTerm] = useState('');

  const modules = userManagementStore.getModules();
  const operations = userManagementStore.getOperations();

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOperations = operations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sub Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSubTab('MODULES')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'MODULES'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>Central Module Master ({modules.length})</span>
          </button>
          <button
            onClick={() => setSubTab('OPERATIONS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'OPERATIONS'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operation / Action Master ({operations.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={subTab === 'MODULES' ? 'Search modules...' : 'Search operations...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Module Master Table */}
      {subTab === 'MODULES' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="p-3 w-12 text-center">Order</th>
                  <th className="p-3">Module ID</th>
                  <th className="p-3">Module Name</th>
                  <th className="p-3">Module Group</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Supported Operations</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                      {m.sortOrder}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {m.id}
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {m.groupName}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">{m.description}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {m.supportedOperations.map((op) => (
                          <span
                            key={op}
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operation Master Table */}
      {subTab === 'OPERATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="p-3">Operation ID</th>
                  <th className="p-3">Operation Name</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOperations.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {op.id}
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      {op.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {op.isSensitive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Sensitive / Financial Authority
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          Standard Operation
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-md">{op.description}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
