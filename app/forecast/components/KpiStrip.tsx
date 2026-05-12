'use client';

/**
 * KPI strip — MAE / RMSE / CRPS / Coverage@90 per active model.
 *
 * Layout: four equal cells, hairline-separated. Numbers in JetBrains
 * Mono tabular nums; labels in Switzer Caption uppercase.
 *
 * NOT a hero-metric-template (per impeccable §absolute-bans). Avoids
 * giant numbers + sparklines + gradient accents.
 */

import type { ForecastSeries } from '../types';

type KpiStripProps = {
  forecast: ForecastSeries;
};

function mae(obs: (number | null)[], pred: number[]): number {
  const pairs = obs.map((o, i) => (o !== null ? [o, pred[i]] : null)).filter((p): p is [number, number] => p !== null);
  if (!pairs.length) return NaN;
  return pairs.reduce((s, [o, p]) => s + Math.abs(o - p), 0) / pairs.length;
}

function rmse(obs: (number | null)[], pred: number[]): number {
  const pairs = obs.map((o, i) => (o !== null ? [o, pred[i]] : null)).filter((p): p is [number, number] => p !== null);
  if (!pairs.length) return NaN;
  return Math.sqrt(pairs.reduce((s, [o, p]) => s + (o - p) ** 2, 0) / pairs.length);
}

function coverage(obs: (number | null)[], q05: number[], q95: number[]): number {
  const pairs = obs
    .map((o, i) => (o !== null ? [o, q05[i], q95[i]] : null))
    .filter((p): p is [number, number, number] => p !== null);
  if (!pairs.length) return NaN;
  const covered = pairs.filter(([o, lo, hi]) => lo <= o && o <= hi).length;
  return covered / pairs.length;
}

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  surface: '#FFFFFF',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

function Cell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{ padding: '14px 16px', flex: 1, borderRight: `1px solid ${T.hairline}` }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 22,
          fontWeight: 500,
          color: T.ink,
          fontFeatureSettings: "'tnum'",
          letterSpacing: '-0.01em',
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 12, color: T.inkMuted, marginLeft: 4, fontWeight: 400 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function KpiStrip({ forecast }: KpiStripProps) {
  const mae_v = mae(forecast.observed, forecast.mean);
  const rmse_v = rmse(forecast.observed, forecast.mean);
  const cov_v = coverage(forecast.observed, forecast.q05, forecast.q95);

  const fmt = (n: number, digits = 2) => (Number.isNaN(n) ? '—' : n.toFixed(digits));

  return (
    <div
      style={{
        display: 'flex',
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        background: T.surface,
        overflow: 'hidden',
      }}
    >
      <Cell label="MAE" value={fmt(mae_v)} unit={forecast.units} />
      <Cell label="RMSE" value={fmt(rmse_v)} unit={forecast.units} />
      <Cell label="Coverage @ 90" value={fmt(cov_v * 100, 1)} unit="%" />
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkFaint,
            marginBottom: 4,
          }}
        >
          Model · Horizon
        </div>
        <div style={{ fontSize: 14, color: T.ink }}>
          {forecast.model_id}
          <span style={{ color: T.inkMuted, fontFamily: T.mono, fontSize: 12, marginLeft: 8 }}>
            {forecast.horizon_hours}h
          </span>
        </div>
      </div>
    </div>
  );
}
