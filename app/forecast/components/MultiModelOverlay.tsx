'use client';

/**
 * Multi-model overlay — compare 2-3 forecasts in one chart.
 * Spec: PLATFORM_DESIGN §4.2 panel 3.
 *
 * Each model gets its own colour family (UniBe red / UniBe ocean /
 * UniBe green). Observed series is rendered once in ink-charcoal.
 * Toggle: 'overlay' (default) | 'diff' (residual from ground truth).
 */

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ForecastSeries } from '../types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  surface: '#FFFFFF',
  bern: '#E20613',
  bernTint: 'rgba(226, 6, 19, 0.18)',
  ocean: '#0066B3',
  oceanTint: 'rgba(0, 102, 179, 0.18)',
  green: '#509A39',
  greenTint: 'rgba(80, 154, 57, 0.18)',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

const COLORS = [
  { mean: T.bern,  fan: T.bernTint  },
  { mean: T.ocean, fan: T.oceanTint },
  { mean: T.green, fan: T.greenTint },
];

export type MultiModelOverlayProps = {
  forecasts: ForecastSeries[];
  height?: number;
};

type Mode = 'overlay' | 'diff';

export default function MultiModelOverlay({ forecasts, height = 360 }: MultiModelOverlayProps) {
  const [mode, setMode] = useState<Mode>('overlay');

  const option = useMemo(() => {
    if (!forecasts.length) return null;
    const t = forecasts[0].timestamps;
    const observed = forecasts[0].observed;

    const series: Record<string, unknown>[] = [];

    if (mode === 'overlay') {
      // Observed once
      series.push({
        name: 'Observed',
        type: 'line',
        data: observed,
        connectNulls: false,
        symbol: 'none',
        lineStyle: { color: T.ink, width: 1.5 },
        z: 10,
      });
      forecasts.forEach((f, i) => {
        const c = COLORS[i % COLORS.length];
        // Lower band invisible filler
        series.push({
          name: `${f.model_id} Q05`,
          type: 'line',
          data: f.q05,
          lineStyle: { opacity: 0 },
          stack: `fan-${i}`,
          symbol: 'none',
          silent: true,
        });
        // Upper band fill region
        series.push({
          name: `${f.model_id} Q95`,
          type: 'line',
          data: f.q95.map((hi, k) => hi - f.q05[k]),
          lineStyle: { opacity: 0 },
          areaStyle: { color: c.fan },
          stack: `fan-${i}`,
          symbol: 'none',
          silent: true,
        });
        series.push({
          name: f.model_id,
          type: 'line',
          data: f.mean,
          symbol: 'none',
          lineStyle: { color: c.mean, width: 1.5, type: 'dashed' },
          z: 5 + i,
        });
      });
    } else {
      // Diff mode: residual = observation - prediction; flat 0-line is ground truth
      series.push({
        name: 'Zero',
        type: 'line',
        data: t.map(() => 0),
        symbol: 'none',
        lineStyle: { color: T.inkFaint, type: 'dotted', width: 1 },
        z: 1,
      });
      forecasts.forEach((f, i) => {
        const c = COLORS[i % COLORS.length];
        const residual = observed.map((o, k) => (o === null ? null : o - f.mean[k]));
        series.push({
          name: `${f.model_id} residual`,
          type: 'line',
          data: residual,
          connectNulls: false,
          symbol: 'none',
          lineStyle: { color: c.mean, width: 1.5 },
          z: 5 + i,
        });
      });
    }

    return {
      grid: { left: 56, right: 16, top: 36, bottom: 32 },
      animation: true,
      animationDuration: 400,
      animationEasing: 'quartOut',
      textStyle: { fontFamily: T.body, color: T.ink },
      legend: {
        data: mode === 'overlay'
          ? ['Observed', ...forecasts.map(f => f.model_id)]
          : forecasts.map(f => `${f.model_id} residual`),
        top: 4,
        textStyle: { color: T.inkMuted, fontFamily: T.mono, fontSize: 11 },
        icon: 'roundRect',
        itemWidth: 18,
        itemHeight: 4,
      },
      tooltip: { trigger: 'axis', backgroundColor: T.surface, borderColor: T.hairline },
      xAxis: {
        type: 'category',
        data: t,
        axisLine: { lineStyle: { color: T.hairline } },
        axisTick: { show: false },
        axisLabel: { color: T.inkMuted, fontSize: 10, fontFamily: T.mono, formatter: (v: string) => v.slice(5, 10) },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: mode === 'diff' ? `Residual (${forecasts[0].units})` : forecasts[0].units,
        nameTextStyle: { color: T.inkFaint, fontFamily: T.mono, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: T.inkMuted, fontSize: 11, fontFamily: T.mono },
        splitLine: { lineStyle: { color: T.hairline, type: 'dashed' } },
      },
      series,
    };
  }, [forecasts, mode]);

  if (!forecasts.length) {
    return (
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.hairline}`,
          borderRadius: 10,
          padding: '40px 24px',
          color: T.inkMuted,
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        No forecasts to compare. Add via Cmd+K → "Add panel · compare models".
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        padding: '14px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 500,
            fontSize: 18,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Model comparison ({forecasts.length})
        </h3>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      {option && <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />}
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 0,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        overflow: 'hidden',
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {(['overlay', 'diff'] as Mode[]).map(m => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          style={{
            border: 'none',
            background: mode === m ? T.ink : T.surface,
            color: mode === m ? T.surface : T.inkMuted,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
