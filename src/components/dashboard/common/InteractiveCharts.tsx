import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

/* =========================================================================
   ChartCard Container
   ========================================================================= */

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  headerRight,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            {actionLabel && onActionClick && (
              <button
                type="button"
                onClick={onActionClick}
                className="text-[11px] font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================================
   Line Trend Chart (SVG)
   ========================================================================= */

interface TrendPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineTrendChartProps {
  data: TrendPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  lineColor?: string;
  secondaryLineColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  height = 140,
  valuePrefix = '',
  valueSuffix = '',
  lineColor = '#1667C1',
  secondaryLineColor = '#0EA5E9',
  primaryLabel = 'Primary',
  secondaryLabel = 'Benchmark',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 10) * 1.15;
  const minVal = 0;

  const width = 400;
  const padX = 28;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const getX = (index: number) => padX + (index / (data.length - 1)) * chartW;
  const getY = (val: number) => padY + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Build path strings
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${padY + chartH} L ${getX(0)},${padY + chartH} Z`;

  // Secondary line if provided
  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secondaryPoints = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`)
    : [];
  const secondaryLinePath = hasSecondary ? `M ${secondaryPoints.join(' L ')}` : '';

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={`grad-${lineColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const y = padY + chartH * (1 - pct);
          const gridVal = Math.round(minVal + (maxVal - minVal) * pct);
          return (
            <g key={pct}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padX - 4}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${lineColor.replace('#', '')})`} />

        {/* Secondary benchmark line */}
        {hasSecondary && (
          <path
            d={secondaryLinePath}
            fill="none"
            stroke={secondaryLineColor}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {/* Primary line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Dots */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoverIndex === i;
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 3.5}
                fill="#FFFFFF"
                stroke={lineColor}
                strokeWidth={isHovered ? 2.5 : 2}
                className="transition-all duration-150"
              />
              {/* Invisible wider target for hover */}
              <circle cx={cx} cy={cy} r={14} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between items-center px-4 mt-1 text-[10px] text-slate-500 font-medium">
        {data.map((d, i) => (
          <span
            key={i}
            className={`transition-colors ${hoverIndex === i ? 'font-bold text-slate-900' : ''}`}
          >
            {d.label}
          </span>
        ))}
      </div>

      {/* Tooltip on hover */}
      {hoverIndex !== null && (
        <div className="mt-2 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-sm flex items-center justify-between gap-3 animate-fade-in">
          <span className="font-semibold">{data[hoverIndex].label}</span>
          <div className="flex items-center gap-3">
            <span>
              {primaryLabel}: <strong className="font-bold text-sky-400">{valuePrefix}{data[hoverIndex].value}{valueSuffix}</strong>
            </span>
            {data[hoverIndex].secondaryValue !== undefined && (
              <span>
                {secondaryLabel}: <strong className="font-bold text-slate-300">{valuePrefix}{data[hoverIndex].secondaryValue}{valueSuffix}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   Bar / Stacked Bar Chart (SVG)
   ========================================================================= */

interface BarItem {
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
  secondaryValue?: number;
  onClick?: () => void;
}

interface BarChartProps {
  data: BarItem[];
  height?: number;
  layout?: 'vertical' | 'horizontal';
  showValues?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 140,
  layout = 'vertical',
  showValues = true,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value + (d.secondaryValue || 0)), 1);

  if (layout === 'horizontal') {
    return (
      <div className="space-y-2 text-xs">
        {data.map((item, idx) => {
          const pct = Math.min((item.value / maxVal) * 100, 100);
          const color = item.color || '#1667C1';
          return (
            <div
              key={idx}
              onClick={item.onClick}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`space-y-1 ${item.onClick ? 'cursor-pointer group' : ''}`}
            >
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-800 group-hover:text-sky-800 transition-colors">
                  {item.label}
                </span>
                <span className="font-bold text-slate-700 font-mono">
                  {valuePrefix}{item.value}{valueSuffix}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  className="h-full rounded-full transition-all duration-500 ease-out"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical layout
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2 pt-2 px-1" style={{ height }}>
        {data.map((item, idx) => {
          const pct = Math.min((item.value / maxVal) * 100, 100);
          const color = item.color || '#1667C1';
          const isHovered = hoverIdx === idx;
          return (
            <div
              key={idx}
              onClick={item.onClick}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex-1 flex flex-col items-center justify-end h-full group ${
                item.onClick ? 'cursor-pointer' : ''
              }`}
            >
              {showValues && (
                <span
                  className={`text-[9px] font-bold font-mono mb-1 transition-opacity ${
                    isHovered ? 'text-sky-900 opacity-100' : 'text-slate-500 opacity-80'
                  }`}
                >
                  {valuePrefix}{item.value}
                </span>
              )}
              <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                <div
                  style={{ height: `${pct}%`, backgroundColor: color }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isHovered ? 'brightness-110' : ''
                  }`}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1.5 truncate max-w-full text-center group-hover:text-slate-900">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      {hoverIdx !== null && data[hoverIdx].sublabel && (
        <div className="text-[10px] text-slate-500 text-center font-medium">
          {data[hoverIdx].label}: {data[hoverIdx].sublabel}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   Donut Chart (SVG)
   ========================================================================= */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  onClick?: () => void;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 140,
  thickness = 18,
  centerLabel = 'Total',
  centerValue,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((seg, idx) => {
            const pct = seg.value / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;
            const isHovered = activeIdx === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={isHovered ? thickness + 3 : thickness}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={seg.onClick}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-sm font-extrabold text-slate-900 leading-none">
            {activeIdx !== null ? data[activeIdx].value : centerValue || total}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider">
            {activeIdx !== null ? data[activeIdx].label : centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 text-xs w-full sm:w-auto">
        {data.map((seg, idx) => (
          <div
            key={idx}
            onClick={seg.onClick}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            className={`flex items-center justify-between gap-3 p-1 rounded-md transition-colors ${
              seg.onClick ? 'cursor-pointer hover:bg-slate-50' : ''
            } ${activeIdx === idx ? 'bg-slate-50 font-bold' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] text-slate-700">{seg.label}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <strong className="text-slate-900">{seg.value}</strong>
              <span className="text-slate-400 text-[10px]">({Math.round((seg.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   Funnel Chart (APF Lifecycle)
   ========================================================================= */

interface FunnelStage {
  stage: string;
  count: number;
  conversionPct?: number;
  color?: string;
  onClick?: () => void;
}

interface FunnelChartProps {
  stages: FunnelStage[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ stages }) => {
  if (!stages || stages.length === 0) return null;
  const maxVal = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-1.5 pt-1">
      {stages.map((st, i) => {
        const widthPct = Math.max((st.count / maxVal) * 100, 15);
        return (
          <div
            key={i}
            onClick={st.onClick}
            className={`space-y-1 ${st.onClick ? 'cursor-pointer group' : ''}`}
          >
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-700 group-hover:text-sky-800 transition-colors">
                {st.stage}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <strong className="text-slate-900">{st.count} cases</strong>
                {st.conversionPct !== undefined && (
                  <span className="text-[10px] text-slate-400">({st.conversionPct}%)</span>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: st.color || '#1667C1',
                }}
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================================
   Heatmap Grid (SLA Ageing & Risk Concentration)
   ========================================================================= */

interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  status: 'clean' | 'watch' | 'breached';
}

interface HeatmapGridProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  onCellClick?: (cell: HeatmapCell) => void;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  rows,
  cols,
  cells,
  onCellClick,
}) => {
  const getCellColor = (status: 'clean' | 'watch' | 'breached', value: number) => {
    if (value === 0) return 'bg-slate-50 text-slate-400 border-slate-100';
    switch (status) {
      case 'breached':
        return 'bg-rose-100 text-rose-950 border-rose-300 font-bold';
      case 'watch':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
      case 'clean':
      default:
        return 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="py-1 px-2 text-left text-[10px] uppercase font-bold text-slate-400" />
            {cols.map((col, idx) => (
              <th
                key={idx}
                className="py-1.5 px-2 text-center text-[10px] uppercase font-bold text-slate-500 font-sans"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              <td className="py-1.5 px-2 text-left font-semibold text-slate-700 whitespace-nowrap text-[11px]">
                {row}
              </td>
              {cols.map((col, cIdx) => {
                const cell = cells.find((c) => c.row === row && c.col === col) || {
                  row,
                  col,
                  value: 0,
                  status: 'clean' as const,
                };
                return (
                  <td key={cIdx} className="p-1 text-center">
                    <button
                      type="button"
                      disabled={cell.value === 0}
                      onClick={() => onCellClick?.(cell)}
                      className={`w-full py-1.5 px-2 rounded border text-center transition-transform ${
                        cell.value > 0 ? 'cursor-pointer hover:scale-105 shadow-2xs' : 'cursor-default'
                      } ${getCellColor(cell.status, cell.value)}`}
                    >
                      {cell.value}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
