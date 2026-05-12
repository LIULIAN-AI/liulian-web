'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ChartSpec, SeriesConfig } from './chartTypes';
import { BRAND_COLORS } from './chartTypes';

interface ChartRendererProps {
  spec: ChartSpec;
  height?: number | `${number}%`;
  compact?: boolean;
}

const AXIS_STYLE = { fontSize: 11, fill: '#64748b' };
const GRID_STYLE = { strokeDasharray: '3 3' as const, stroke: '#f1f5f9' };
const TOOLTIP_STYLE = {
  fontSize: 11,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};
const LEGEND_STYLE = { fontSize: 10, color: 'var(--text-secondary, #6b7280)' };

function getSeries(spec: ChartSpec): SeriesConfig[] {
  if (spec.series && spec.series.length > 0) return spec.series;
  const yKey = spec.yKey ?? 'value';
  return [{ dataKey: yKey, label: yKey, color: spec.color ?? BRAND_COLORS[0] }];
}

function renderDonutLabel(entry: { name?: string; percent?: number }) {
  return `${entry.name} ${((entry.percent ?? 0) * 100).toFixed(0)}%`;
}

export default function ChartRenderer({ spec, height = '100%', compact = false }: ChartRendererProps) {
  if (!spec.data || spec.data.length === 0) return null;

  const chartType = spec.type ?? 'bar';
  const xKey = spec.xKey ?? 'name';
  const series = getSeries(spec);
  const margin = { top: 4, right: compact ? 4 : 12, left: 0, bottom: 4 };
  const yWidth = compact ? 32 : 44;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === 'line' ? (
        <LineChart data={spec.data} margin={margin}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={yWidth} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {!compact && <Legend wrapperStyle={LEGEND_STYLE} />}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      ) : chartType === 'area' ? (
        <AreaChart data={spec.data} margin={margin}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={yWidth} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {!compact && series.length > 1 && <Legend wrapperStyle={LEGEND_STYLE} />}
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      ) : chartType === 'radar' ? (
        <RadarChart data={spec.data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border-color, #e5e7eb)" />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-secondary, #6b7280)' }} />
          <PolarRadiusAxis tick={{ fontSize: 8, fill: 'var(--text-secondary, #6b7280)' }} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {!compact && <Legend wrapperStyle={LEGEND_STYLE} />}
          {series.map((s) => (
            <Radar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      ) : chartType === 'donut' ? (
        <PieChart>
          <Pie
            data={spec.data}
            dataKey={spec.yKey ?? 'value'}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={compact ? 30 : 50}
            outerRadius={compact ? 55 : 80}
            paddingAngle={2}
            label={compact ? undefined : renderDonutLabel}
            labelLine={!compact}
          >
            {spec.data.map((_, i) => (
              <Cell key={i} fill={(spec.colors ?? BRAND_COLORS)[i % (spec.colors ?? BRAND_COLORS).length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {!compact && <Legend wrapperStyle={LEGEND_STYLE} />}
        </PieChart>
      ) : (
        <BarChart data={spec.data} margin={margin}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={yWidth} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {!compact && series.length > 1 && <Legend wrapperStyle={LEGEND_STYLE} />}
          {series.map((s) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.label} fill={s.color} radius={0} />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
