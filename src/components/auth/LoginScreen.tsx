import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { DEMO_USERS } from '../../data/centralMasterData';
import { ShieldCheck, Lock, User, ArrowRight, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('cpa01');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = apfStore.login(username, password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleQuickLogin = (usr: string) => {
    setUsername(usr);
    setPassword('Demo@123');
    const res = apfStore.login(usr, 'Demo@123');
    if (res.success) {
      onLoginSuccess();
    }
  };

  const demoAccounts = [
    {
      key: 'cpa01',
      title: '1. CPA (Credit Processing Associate)',
      name: 'Rohan Deshmukh',
      dept: 'Pune Retail Branch',
      role: 'CPA',
      allowedActions: 'Initiate APF, Assign Valuer, Review Valuation, Send to LOS',
      badgeColor: 'bg-[#e8f1f5] text-[#19638c]',
    },
    {
      key: 'valuer.ext01',
      title: '2. External Valuer (Panel)',
      name: 'M. K. Kulkarni',
      dept: 'Knight Frank Valuation Services LLP',
      role: 'EXTERNAL_VALUER',
      allowedActions: 'Accept Assignment, GPS Mobile Site Visit, Submit Valuation Report',
      badgeColor: 'bg-[#fef7e0] text-[#b06000]',
    },
    {
      key: 'valuer.int01',
      title: '3. Internal Technical Valuer',
      name: 'Ar. Rajesh Deshpande',
      dept: 'Direct Valuation Cell',
      role: 'INTERNAL_VALUER',
      allowedActions: 'Internal Technical Appraisal & Site Visit',
      badgeColor: 'bg-[#f1f5f9] text-[#475569]',
    },
    {
      key: 'com01',
      title: '4. COM (Credit Operations Manager)',
      name: 'Amitav Sen',
      dept: 'Supervisory & Risk Ops Hub',
      role: 'COM',
      allowedActions: 'Supervisory Review, Exposure Check, Endorse to Approver',
      badgeColor: 'bg-[#e8f1f5] text-[#19638c]',
    },
    {
      key: 'approver01',
      title: '5. Approving Manager (Zonal Head)',
      name: 'Priya Sharma',
      dept: 'Credit Risk & Sanctions Bureau',
      role: 'APPROVER',
      allowedActions: 'Decision Cockpit: Approve, Conditional Approve, Reject',
      badgeColor: 'bg-[#e6f4ea] text-[#137333]',
    },
    {
      key: 'committee01',
      title: '6. Committee Member (ZCC)',
      name: 'Vikram Malhotra',
      dept: 'Zonal Credit Committee',
      role: 'COMMITTEE',
      allowedActions: 'Committee Quorum Review & Sanction Voting',
      badgeColor: 'bg-[#e6f4ea] text-[#137333]',
    },
    {
      key: 'admin01',
      title: '7. System Administrator',
      name: 'Siddharth Rao',
      dept: 'IT & Risk Governance',
      role: 'ADMIN',
      allowedActions: 'System Audit Trail, Master Maintenance, LOS Gateway Monitor',
      badgeColor: 'bg-[#f1f5f9] text-[#334e68]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f6f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0c3148] text-white shadow-md">
          <Building2 className="w-8 h-8 text-[#8bb3cb]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#102a43]">
          PROVAL APF Intelligence
        </h1>
        <p className="text-xs font-semibold text-[#627d98] tracking-wide uppercase">
          Approved Project Financial Underwriting Platform • Bank Core Login
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-[#cbd5e1] grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Credential Login Form */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-[#edf2f7] pb-3 mb-4">
                <h2 className="text-base font-bold text-[#102a43]">Sign in to Bank Console</h2>
                <p className="text-xs text-[#627d98]">
                  Enter assigned staff or valuer credentials to access your task dashboard.
                </p>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#334e68] uppercase tracking-wider mb-1">
                    Username / Staff ID
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#627d98]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. cpa01"
                      className="block w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#19638c] focus:outline-none text-[#102a43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334e68] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#627d98]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Demo@123"
                      className="block w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#19638c] focus:outline-none text-[#102a43]"
                    />
                  </div>
                  <span className="text-[11px] text-[#627d98] mt-1 block">Default demo password: <strong>Demo@123</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-[#0c3148] hover:bg-[#19638c] focus:outline-none transition-colors"
                >
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-[#edf2f7] text-[11px] text-[#627d98] space-y-1">
              <div className="flex items-center gap-1.5 text-[#137333] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Role-Based Access Control Enforced</span>
              </div>
              <p>Actions are strictly bound to the authenticated role. Sessions are preserved across logout/login.</p>
            </div>
          </div>

          {/* Right: Quick Demo Persona Switcher */}
          <div className="lg:col-span-7 bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#102a43]">
                  1-Click Demo Persona Login
                </h3>
                <p className="text-[11px] text-[#627d98]">
                  Click any role card below to instantly sign in and test the handoff lifecycle:
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f1f5] text-[#19638c]">
                7 Bank Roles
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.key}
                  onClick={() => handleQuickLogin(acc.key)}
                  className="p-3 bg-white hover:bg-[#f1f5f9] rounded-xl border border-[#cbd5e1] hover:border-[#19638c] transition-all cursor-pointer shadow-2xs space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102a43] group-hover:text-[#19638c]">
                      {acc.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#627d98]">
                    <span>User: <strong>{acc.name}</strong> • {acc.dept}</span>
                    <span className="font-mono text-[10px] text-[#829ab1]">Login: {acc.key}</span>
                  </div>

                  <p className="text-[11px] text-[#334e68] italic pt-1 border-t border-[#edf2f7]">
                    Permitted: {acc.allowedActions}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
