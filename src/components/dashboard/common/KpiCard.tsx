import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useCountUp } from './useCountUp';

export interface KpiCardProps {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean; // up could be bad if SLA breaches increased
  };
  contextNote?: string;
  drillDownLabel?: string;
  onDrillDown?: () => void;
  icon?: React.ReactNode;
  riskSeverity?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  badgeText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  contextNote,
  drillDownLabel = 'View details',
  onDrillDown,
  icon,
  riskSeverity = 'none',
  badgeText,
}) => {
  // If value is numeric, animate it with useCountUp
  const isNumeric = typeof value === 'number';
  const animatedNumber = useCountUp(isNumeric ? (value as number) : 0);
  const displayVal = isNumeric ? animatedNumber : value;

  const getBorderColor = () => {
    switch (riskSeverity) {
      case 'critical':
        return 'border-rose-300 hover:border-rose-400 bg-rose-50/20';
      case 'high':
        return 'border-amber-300 hover:border-amber-400 bg-amber-50/20';
      case 'medium':
        return 'border-sky-300 hover:border-sky-400';
      default:
        return 'border-slate-200/90 hover:border-slate-300 bg-white';
    }
  };

  return (
    <div
      onClick={onDrillDown}
      className={`rounded-xl border p-3.5 sm:p-4 shadow-2xs transition-all duration-200 flex flex-col justify-between group ${getBorderColor()} ${
        onDrillDown ? 'cursor-pointer hover:shadow-xs' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
            {label}
          </span>
          {icon && (
            <div className="text-slate-400 group-hover:text-sky-700 transition-colors shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          {prefix && <span className="text-base sm:text-lg font-bold text-slate-700">{prefix}</span>}
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {displayVal}
          </div>
          {suffix && <span className="text-xs sm:text-sm font-semibold text-slate-500">{suffix}</span>}
          {badgeText && (
            <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {badgeText}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
        {trend && (
          <div className="flex items-center gap-1.5 font-medium">
            {trend.direction === 'up' ? (
              <TrendingUp
                className={`w-3.5 h-3.5 ${
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              />
            ) : trend.direction === 'down' ? (
              <TrendingDown
                className={`w-3.5 h-3.5 ${
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              />
            ) : null}
            <span
              className={
                trend.isPositive === undefined
                  ? 'text-slate-600'
                  : trend.isPositive
                  ? 'text-emerald-800'
                  : 'text-rose-800'
              }
            >
              {trend.value}
            </span>
          </div>
        )}

        {contextNote && (
          <div className="text-slate-500 line-clamp-1">{contextNote}</div>
        )}

        {onDrillDown && (
          <div className="mt-0.5 flex items-center justify-between text-sky-800 font-semibold group-hover:text-sky-950 transition-colors">
            <span>{drillDownLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};

export const TrendKpiCard: React.FC<KpiCardProps> = (props) => <KpiCard {...props} />;
export const RiskKpiCard: React.FC<KpiCardProps> = (props) => (
  <KpiCard
    {...props}
    icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
    riskSeverity={props.riskSeverity || 'high'}
  />
);
