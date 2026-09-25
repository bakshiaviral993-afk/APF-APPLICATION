import React from 'react';
import { ShieldAlert, Lock, AlertOctagon, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../types/apfTransaction';

/**
 * Strict RBAC Policy for Exposure Reports in APF:
 * - Exposure report access is granted ONLY to: CPA, COM, ACOM, RCOM, ZCOM, NCOM (and authorized credit governance roles / admins).
 * - Under NO circumstances does any Valuer (Internal or External Panel Valuer) have access to developer exposure reports.
 */
export const EXPOSURE_ALLOWED_ROLES: readonly UserRole[] = [
  'CPA',
  'COM',
  'ACOM',
  'RCOM',
  'ZCOM',
  'NCOM',
  'APPROVER',
  'COMMITTEE',
  'ADMIN',
] as const;

/**
 * Validates whether the role has permission to access the Exposure 360 report.
 * Returns false for any Valuer role.
 */
export function canAccessExposureReport(role?: UserRole | string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();

  // STRICT PROHIBITION: Valuers have zero access to financial debt and exposure reports
  if (
    normalized === 'INTERNAL_VALUER' ||
    normalized === 'EXTERNAL_VALUER' ||
    normalized.includes('VALUER')
  ) {
    return false;
  }

  return (
    normalized === 'CPA' ||
    normalized === 'COM' ||
    normalized === 'ACOM' ||
    normalized === 'RCOM' ||
    normalized === 'ZCOM' ||
    normalized === 'NCOM' ||
    normalized === 'APPROVER' ||
    normalized === 'COMMITTEE' ||
    normalized === 'ADMIN'
  );
}

/**
 * Checks if the role is a Valuer (Internal or External).
 */
export function isValuerRole(role?: UserRole | string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return (
    normalized === 'INTERNAL_VALUER' ||
    normalized === 'EXTERNAL_VALUER' ||
    normalized.includes('VALUER')
  );
}

interface ExposureAccessRestrictedCardProps {
  currentRole?: string;
  userName?: string;
  onNavigateBack?: () => void;
  onNavigateToValuation?: () => void;
}

/**
 * High-visibility enterprise security barrier when an unauthorized role (e.g., Valuer)
 * attempts to view or navigate to Exposure 360 or multilateral debt reports.
 */
export const ExposureAccessRestrictedCard: React.FC<ExposureAccessRestrictedCardProps> = ({
  currentRole,
  userName,
  onNavigateBack,
  onNavigateToValuation,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-xl overflow-hidden max-w-4xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Red Alert Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-7 flex items-start gap-4">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0 border border-white/20 shadow-md">
          <ShieldAlert className="w-8 h-8 text-rose-300 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 border border-rose-300/40 text-rose-100 text-[11px] font-black uppercase tracking-wider">
              Confidential Credit Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wide">
              Access Restricted
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            Exposure Report Access Restricted
          </h2>
          <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
            Per Bank Credit Policy and APF Underwriting Framework, exposure reports and group debt positions are strictly classified and unavailable to Valuers.
          </p>
        </div>
      </div>

      {/* Main Body Notice */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Role-Based Confidentiality Enforcement</span>
          </div>
          <p className="text-xs leading-relaxed text-rose-900">
            Current Logged-in Role: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-rose-300">{currentRole || 'VALUER'}</strong>
            {userName && <span> ({userName})</span>}. Valuers (Internal Technical Cell & External Empanelled Valuers) are assigned exclusively to physical site inspection, geo-tagging, civil progress, and technical valuation of units/towers.
          </p>
        </div>

        {/* Authorized Roles Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Authorized Roles with Exposure Report Access:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
              <span className="text-xs font-black text-sky-950 block">CPA</span>
              <span className="text-[10px] text-sky-700 block mt-0.5 leading-tight">
                Credit Processing Associate
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-sky-200 text-sky-900 rounded">
                Maker
              </span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
              <span className="text-xs font-black text-sky-950 block">COM</span>
              <span className="text-[10px] text-sky-700 block mt-0.5 leading-tight">
                Credit Operations Manager
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-sky-200 text-sky-900 rounded">
                Checker
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs font-black text-emerald-950 block">ACOM</span>
              <span className="text-[10px] text-emerald-700 block mt-0.5 leading-tight">
                Area Credit Ops Manager
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-200 text-emerald-900 rounded">
                Area Approver
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs font-black text-emerald-950 block">RCOM</span>
              <span className="text-[10px] text-emerald-700 block mt-0.5 leading-tight">
                Regional Credit Ops Manager
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-200 text-emerald-900 rounded">
                Regional Head
              </span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <span className="text-xs font-black text-purple-950 block">ZCOM</span>
              <span className="text-[10px] text-purple-700 block mt-0.5 leading-tight">
                Zonal Credit Ops Manager
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-purple-200 text-purple-900 rounded">
                Zonal Committee
              </span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <span className="text-xs font-black text-purple-950 block">NCOM</span>
              <span className="text-[10px] text-purple-700 block mt-0.5 leading-tight">
                National Credit Ops Manager
              </span>
              <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-purple-200 text-purple-900 rounded">
                Apex Committee
              </span>
            </div>
          </div>
        </div>

        {/* Valuer Scope explanation */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Valuer Responsibilities & Segregation of Duties:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
            <li>Valuers conduct independent technical site inspection and verify on-ground construction progress.</li>
            <li>Valuers capture geotagged, timestamped site photos within the 500m geofence perimeter.</li>
            <li>Commercial developer borrowing liabilities, banking consortium lines, and MCA debt filings are audited solely by Credit Operations.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          )}

          {onNavigateToValuation && (
            <button
              type="button"
              onClick={onNavigateToValuation}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0c3148] hover:bg-[#082030] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Go to Valuation & Inspection Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
