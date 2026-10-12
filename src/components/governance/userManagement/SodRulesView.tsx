import React, { useState } from 'react';
import { userManagementStore } from '../../../services/userManagementStore';
import { UserAccount } from '../../../types/apfTransaction';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck,
  Search,
  Scale,
} from 'lucide-react';

interface SodRulesViewProps {
  currentUser: UserAccount;
}

export const SodRulesView: React.FC<SodRulesViewProps> = ({ currentUser }) => {
  const sodRules = userManagementStore.getSodRules();
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Live SoD Conflict Simulator
  const allRoles = userManagementStore.getRoles();
  const [testSelectedRoles, setTestSelectedRoles] = useState<string[]>(['BILLING_MAKER', 'BILLING_CHECKER']);

  const simResult = userManagementStore.checkSodConflicts(testSelectedRoles);

  const toggleTestRole = (roleKey: string) => {
    setTestSelectedRoles((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const filteredRules = sodRules.filter(
    (r) =>
      r.ruleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rationale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roleA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roleB.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              RBI Fraud Prevention & Governance
            </span>
            <span className="text-xs text-slate-500 font-mono">{sodRules.length} Enforcement Rules</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-700" />
            <span>Segregation of Duties (SoD) Framework</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict matrix rules preventing toxic combinations of conflicting operational and financial roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✓ Real-time Enforcement Active
          </span>
        </div>
      </div>

      {/* Interactive SoD Simulator Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <strong className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Interactive Role Conflict Simulator</span>
            </strong>
            <p className="text-xs text-slate-300 mt-0.5">
              Select multiple roles to simulate real-time Segregation of Duties validation before user assignment.
            </p>
          </div>

          <div>
            {simResult.hasCriticalConflict ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                CRITICAL CONFLICT DETECTED
              </span>
            ) : simResult.conflicts.length > 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                POLICY WARNING
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PERMISSIBLE COMBINATION
              </span>
            )}
          </div>
        </div>

        {/* Roles Toggle Chips */}
        <div className="flex flex-wrap gap-2">
          {allRoles.map((r) => {
            const isSelected = testSelectedRoles.includes(r.roleKey);
            return (
              <button
                key={r.id}
                onClick={() => toggleTestRole(r.roleKey)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r.name}
              </button>
            );
          })}
        </div>

        {/* Conflicts Breakdown in Simulator */}
        {simResult.conflicts.length > 0 && (
          <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700 space-y-2 text-xs">
            <strong className="text-amber-400 block text-xs">Detected Rule Infringements:</strong>
            <div className="space-y-1.5">
              {simResult.conflicts.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-slate-200 text-[11px]">
                  <span className="font-mono font-bold text-rose-400 shrink-0">[{c.ruleCode}]</span>
                  <div>
                    <span className="font-semibold">{c.description}</span> —{' '}
                    <span className="text-slate-400">{c.rationale}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SoD Rules Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Configured Enterprise SoD Rules Matrix</h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SoD rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <th className="p-3">Rule Code</th>
                <th className="p-3">Conflicting Role A</th>
                <th className="p-3">Conflicting Role B</th>
                <th className="p-3">Severity & Action</th>
                <th className="p-3">Policy Rationale & Defense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {rule.ruleCode}
                  </td>
                  <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {rule.roleA}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {rule.roleB}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {rule.severity === 'CRITICAL_BLOCK' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <Lock className="w-3 h-3 text-rose-600" />
                        Hard Block (No Save)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Warning w/ Override
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 max-w-md">
                    <div className="font-semibold text-slate-800">{rule.description}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 italic">{rule.rationale}</div>
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
