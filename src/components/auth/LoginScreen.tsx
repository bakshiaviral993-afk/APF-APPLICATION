import React, { useState } from 'react';
import { apfStore } from '../../services/apfStore';
import { DemoCredentialsModal } from './DemoCredentialsModal';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Building2,
  Scale,
  Calculator,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  X,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export type PortalType = 'BANK' | 'VALUER' | 'LEGAL';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('BANK');
  const [username, setUsername] = useState('cpa01');
  const [password, setPassword] = useState('Demo@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  // Handle portal tab change
  const handlePortalChange = (portal: PortalType) => {
    setSelectedPortal(portal);
    setError(null);
    if (portal === 'BANK') {
      setUsername('cpa01');
      setPassword('Demo@123');
    } else if (portal === 'VALUER') {
      setUsername('valuer.ext01');
      setPassword('Demo@123');
    } else if (portal === 'LEGAL') {
      setUsername('legal.ext01');
      setPassword('Demo@123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = apfStore.login(username.trim(), password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSelectDemoPersona = (usr: string, portal: 'BANK' | 'VALUER' | 'LEGAL') => {
    setSelectedPortal(portal);
    setUsername(usr);
    setPassword('Demo@123');
    setIsDemoModalOpen(false);
    setError(null);
    const res = apfStore.login(usr, 'Demo@123');
    if (res.success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col justify-between font-sans relative selection:bg-sky-100">
      {/* Top Security & Utility Bar */}
      <header className="h-12 border-b border-[#DCE3EB] bg-white px-4 sm:px-8 flex items-center justify-between text-xs text-[#667085]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-[#172033]">PROVAL Core Gateway</span>
          <span className="text-slate-300">|</span>
          <span className="hidden sm:inline">Bank-Grade 256-Bit SSL Encrypted Session</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="hover:text-[#172033] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Need Help?</span>
          </button>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="inline-flex items-center gap-1 text-[#1667C1] hover:text-[#0B1F33] font-semibold transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
            <span>Demo Credentials</span>
          </button>
        </div>
      </header>

      {/* Main Centered Sign-In Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header Area */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1F33] text-white shadow-sm mb-2 border border-slate-700">
              <Building2 className="w-6 h-6 text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
              PROVAL APF Intelligence
            </h1>
            <p className="text-xs font-semibold text-[#1667C1] uppercase tracking-wide">
              Approved Project Financial Underwriting Platform
            </p>
            <p className="text-[11px] text-[#667085]">
              Banking, Legal, Valuation, Exposure & Vendor Operations Platform
            </p>
          </div>

          {/* Clean White Sign-In Card */}
          <div className="bg-white rounded-xl border border-[#DCE3EB] shadow-xs p-6 sm:p-8 space-y-5">
            {/* "Sign in to" Portal Selector (Clean Segmented Control) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Sign In To Portal
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handlePortalChange('BANK')}
                  className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedPortal === 'BANK'
                      ? 'bg-white text-[#0B1F33] shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className={`w-4 h-4 mb-0.5 ${selectedPortal === 'BANK' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="leading-tight">Bank Console</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalChange('VALUER')}
                  className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedPortal === 'VALUER'
                      ? 'bg-white text-[#0B1F33] shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calculator className={`w-4 h-4 mb-0.5 ${selectedPortal === 'VALUER' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="leading-tight">External Valuer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalChange('LEGAL')}
                  className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedPortal === 'LEGAL'
                      ? 'bg-white text-[#0B1F33] shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className={`w-4 h-4 mb-0.5 ${selectedPortal === 'LEGAL' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="leading-tight">External Legal</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in-50">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  {selectedPortal === 'BANK'
                    ? 'Username / Staff ID'
                    : selectedPortal === 'VALUER'
                    ? 'Valuer User ID / Empanelment ID'
                    : 'Advocate ID / Law Firm Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={
                      selectedPortal === 'BANK'
                        ? 'e.g. cpa01, com01'
                        : selectedPortal === 'VALUER'
                        ? 'e.g. valuer.ext01'
                        : 'e.g. legal.ext01'
                    }
                    className="block w-full pl-9 pr-3 py-2 text-xs font-medium rounded-md border border-[#DCE3EB] focus:ring-2 focus:ring-[#1667C1] focus:border-[#1667C1] focus:outline-none text-[#172033] placeholder:text-slate-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#172033]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-[11px] font-medium text-[#1667C1] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter security password"
                    className="block w-full pl-9 pr-10 py-2 text-xs font-medium rounded-md border border-[#DCE3EB] focus:ring-2 focus:ring-[#1667C1] focus:border-[#1667C1] focus:outline-none text-[#172033] placeholder:text-slate-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#DCE3EB] text-[#0B1F33] focus:ring-[#1667C1]"
                  />
                  <span className="text-xs text-[#667085]">Remember workstation session</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer active:scale-99"
              >
                <span>Authenticate & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quiet Demo Link */}
            <div className="pt-4 border-t border-[#DCE3EB] text-center">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="text-xs font-medium text-[#667085] hover:text-[#1667C1] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Need test credentials? <strong className="text-[#1667C1] font-semibold underline">Access Demo Personas</strong></span>
              </button>
            </div>
          </div>

          {/* Security & Access Notice */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#667085]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authorized Users Only · Role-Based Access Control</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unauthorized access to bank collateral data is punishable under the IT Act & Banking Regulations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#DCE3EB] bg-white px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#667085] gap-1">
        <div>
          © 2026 PROVAL APF Collateral Intelligence Platform • Enterprise Underwriting Edition
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsHelpModalOpen(true)} className="hover:text-slate-900 cursor-pointer">
            Support Desk
          </button>
          <span>·</span>
          <span>Security Policy</span>
          <span>·</span>
          <span>Privacy & Audit</span>
        </div>
      </footer>

      {/* Demo Credentials Modal */}
      <DemoCredentialsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectPersona={handleSelectDemoPersona}
        defaultPortal={selectedPortal}
      />

      {/* Help / Support Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DCE3EB] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Underwriting & IT Support</h3>
                  <p className="text-[11px] text-[#667085]">Help Desk & System Access Resolution</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-[#172033]">Bank Internal Staff (CPA / COM / Sanctions)</div>
                <p className="text-[11px]">Contact Central Underwriting Operations at ext. 4410 or email <code className="text-sky-700 font-mono">apf-desk@proval.bank.in</code></p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-[#172033]">Empanelled Valuers & Agencies</div>
                <p className="text-[11px]">For docket access, empanelment renewals, or billing queries, contact <code className="text-sky-700 font-mono">valuer.desk@proval.bank.in</code></p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-[#172033]">Empanelled Advocates & Law Firms</div>
                <p className="text-[11px]">For legal dockets, dual reviews, or title scrutiny portal support, contact <code className="text-sky-700 font-mono">legal.ops@proval.bank.in</code></p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-1.5 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DCE3EB] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Credential Recovery</h3>
                  <p className="text-[11px] text-[#667085]">Reset Underwriting Workstation Password</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordModalOpen(false);
                  setForgotPasswordSubmitted(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotPasswordSubmitted ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-[#172033]">Recovery Instructions Sent</h4>
                <p className="text-xs text-[#667085]">
                  If an active staff or empanelled user profile matches your username, a secure OTP link has been dispatched to your registered enterprise email and mobile number.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsForgotPasswordModalOpen(false);
                      setForgotPasswordSubmitted(false);
                    }}
                    className="px-4 py-1.5 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered Staff ID, Empanelled Valuer Code, or Advocate Username. System administrators enforce two-factor hardware token or corporate SSO verification.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Username / ID
                  </label>
                  <input
                    type="text"
                    defaultValue={username}
                    placeholder="e.g. cpa01"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#DCE3EB] focus:ring-2 focus:ring-[#1667C1] focus:outline-none"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordSubmitted(true)}
                    className="px-4 py-1.5 bg-[#0B1F33] hover:bg-[#1667C1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    Send Recovery Token
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
