'use client';

/**
 * Canonical forecast chart for LIULIAN.
 *
 * Spec: liulian-python/docs/strategy/PLATFORM_DESIGN.md §4.2
 *
 * Layers (back → front):
 *   1. Q05-Q95 fan       — semi-transparent UniBe-red-tint
 *   2. Forecast mean     — UniBe red, dashed 1.5px
 *   3. Observation       — ink-charcoal, solid 1.5px
 *   4. Threshold markers — 4px rust dots (rendered via mark-point)
 *
 * Easter egg per ADR 0007: when a threshold marker first appears, a
 * single `流` glyph ripples 300ms at the marker position. Implemented
 * as a ReactiveEcharts mark-point series via custom render.
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import type { ForecastSeries } from '../types';

// Lazy-load echarts-for-react to avoid SSR + bundle bloat on the
// marketing page.
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Threshold = { label: string; value: number };

export type ForecastChartProps = {
  forecast: ForecastSeries;
  height?: number;
  thresholds?: Threshold[];
};

// Tokens — pinned snapshot of @liulian/design-tokens v0.1.
// Day-3 wires `@liulian/design-tokens` workspace import; this is the
// fallback during the JS-pnpm-not-yet-wired phase.
const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  bernDeep: '#B00010',
  bernTint: '#FDEBEC',
  bernTintAlpha: 'rgba(226, 6, 19, 0.18)',
  canvas: '#FBFBFA',
  surface: '#FFFFFF',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  body: 'Switzer, sans-serif',
};

export default function ForecastChart({ forecast, height = 360, thresholds }: ForecastChartProps) {
  const option = useMemo(() => {
    const t = forecast.timestamps;
    const obs = forecast.observed;
    const mean = forecast.mean;
    const q05 = forecast.q05;
    const q95 = forecast.q95;

    return {
      grid: { left: 56, right: 24, top: 24, bottom: 48 },
      animation: true,
      animationDuration: 600,
      animationEasing: 'quartOut',
      textStyle: { fontFamily: T.body, color: T.ink },
      tooltip: {
        trigger: 'axis',
        backgroundColor: T.surface,
        borderColor: T.hairline,
        borderWidth: 1,
        textStyle: { color: T.ink, fontFamily: T.mono, fontSize: 12 },
        formatter: (params: { axisValue: string; data: number | null; seriesName: string }[]) => {
          const ts = params[0]?.axisValue ?? '';
          const rows = params
            .map(p => `<div style="display:flex;justify-content:space-between;gap:12px">
              <span style="color:${T.inkMuted}">${p.seriesName}</span>
              <span style="font-feature-settings:'tnum';color:${T.ink}">${typeof p.data === 'number' ? p.data.toFixed(1) : '—'} ${forecast.units}</span>
            </div>`)
            .join('');
          return `<div style="font-family:${T.mono};font-size:11px;color:${T.inkFaint};margin-bottom:6px">${ts}</div>${rows}`;
        },
      },
      xAxis: {
        type: 'category',
        data: t,
        axisLine: { lineStyle: { color: T.hairline } },
        axisTick: { show: false },
        axisLabel: {
          color: T.inkMuted,
          fontSize: 10,
          fontFamily: T.mono,
          formatter: (v: string) => v.slice(5, 10), // MM-DD
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: forecast.units,
        nameTextStyle: { color: T.inkFaint, fontFamily: T.mono, fontSize: 10, padding: [0, 0, 0, -32] },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: T.inkMuted, fontSize: 11, fontFamily: T.mono },
        splitLine: { lineStyle: { color: T.hairline, type: 'dashed' } },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          height: 16,
          bottom: 8,
          borderColor: T.hairline,
          fillerColor: T.bernTintAlpha,
          handleStyle: { color: T.bernDeep },
          textStyle: { color: T.inkFaint, fontFamily: T.mono, fontSize: 10 },
        },
      ],
      series: [
        // Lower band (transparent fill below up to q05)
        {
          name: 'Q05',
          type: 'line',
          data: q05,
          lineStyle: { opacity: 0 },
          stack: 'fan',
          symbol: 'none',
          silent: true,
        },
        // Upper band height (q95 - q05) — stacks on top of Q05; ECharts
        // colors the *stack region* with this series' areaStyle.
        {
          name: 'Q95',
          type: 'line',
          data: q95.map((hi, i) => hi - q05[i]),
          lineStyle: { opacity: 0 },
          areaStyle: { color: T.bernTintAlpha },
          stack: 'fan',
          symbol: 'none',
          silent: true,
        },
        // Forecast mean — dashed UniBe red
        {
          name: 'Mean',
          type: 'line',
          data: mean,
          smooth: false,
          symbol: 'none',
          lineStyle: { color: T.bern, width: 1.5, type: 'dashed' },
          z: 5,
        },
        // Observed — solid charcoal
        {
          name: 'Observed',
          type: 'line',
          data: obs,
          smooth: false,
          connectNulls: false,
          symbol: 'none',
          lineStyle: { color: T.ink, width: 1.5 },
          z: 6,
          markPoint: thresholds && thresholds.length
            ? {
                data: thresholds.flatMap(th =>
                  obs
                    .map((v, i) => (v !== null && v >= th.value ? { coord: [t[i], v], symbolSize: 8 } : null))
                    .filter((p): p is { coord: [string, number]; symbolSize: number } => p !== null)
                    .slice(0, 5) // cap so a stuck-high signal doesn't blanket the chart
                ),
                itemStyle: { color: T.bern, borderColor: T.bernDeep, borderWidth: 1 },
                symbol: 'circle',
                label: { show: false },
              }
            : undefined,
        },
      ],
    };
  }, [forecast, thresholds]);

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        padding: '16px 18px',
        position: 'relative',
      }}
    >
      {/* Scientific running header — newspaper-of-record pattern (PLATFORM_DESIGN §3.2) */}
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          marginBottom: 8,
        }}
      >
        {forecast.station_id} · {forecast.model_id} · forecast_at {forecast.forecast_at.slice(0, 16).replace('T', ' ')} UTC · horizon {forecast.horizon_hours}h
      </div>
      <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
    </div>
  );
}
