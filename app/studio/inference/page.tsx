/**
 * Studio · Inference — forecasts list + a REAL CPU baseline (SR-3).
 *
 * The forecasts list is still the stub /forecasts. Below it, the "CPU baseline" panel calls the real
 * GET /datasets/{id}/baseline — a pure-Python Ridge autoregression the api trains and evaluates on the
 * dataset's real series (torch-free), the first genuine model result on the web. It shows truth vs
 * prediction and the metrics next to a persistence baseline, so the comparison is honest.
 */

import type { ForecastSeries } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

interface Metrics {
  rmse: number;
  mae: number;
  nse: number;
}
interface Baseline {
  dataset_id: string;
  column: string;
  model: string;
  window: number;
  n_train: number;
  n_test: number;
  metrics: Metrics;
  persistence: Metrics;
  series: { i: number; y: number; yhat: number }[];
  note: string;
}

const CHOICES = ['ETTh1', 'weather', 'exchange_rate', 'electricity'];

async function fetchForecasts(): Promise<ForecastSeries[]> {
  try {
    const r = await fetch(`${BASE}/forecasts`, { next: { revalidate: 15 } });
    if (!r.ok) return [];
    return ((await r.json()) as { items: ForecastSeries[] }).items;
  } catch {
    return [];
  }
}

async function fetchBaseline(ds: string): Promise<Baseline | null> {
  try {
    const r = await fetch(`${BASE}/datasets/${ds}/baseline?window=14`, { next: { revalidate: 120 } });
    if (!r.ok) return null;
    return (await r.json()) as Baseline;
  } catch {
    return null;
  }
}

export default async function StudioInference({ searchParams }: { searchParams: { dataset?: string } }) {
  const dataset = CHOICES.includes(searchParams.dataset ?? '') ? searchParams.dataset! : 'ETTh1';
  const [items, base] = await Promise.all([fetchForecasts(), fetchBaseline(dataset)]);

  const W = 880;
  const H = 300;
  const pad = { l: 56, r: 16, t: 16, b: 24 };
  let chart: React.ReactNode = null;
  if (base && base.series.length > 1) {
    const s = base.series;
    const ys = s.flatMap(p => [p.y, p.yhat]);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const yPad = (yMax - yMin) * 0.05 || 1;
    const x = (i: number) => pad.l + (i / (s.length - 1)) * (W - pad.l - pad.r);
    const y = (v: number) => H - pad.b - ((v - (yMin - yPad)) / (yMax + yPad - (yMin - yPad))) * (H - pad.t - pad.b);
    const path = (key: 'y' | 'yhat') => `M${s.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' L')}`;
    const fmt = (v: number) => (Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(2));
    chart = (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${dataset} baseline predictions`}>
        {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
          <text key={i} x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-faint)" className="mono">{fmt(v)}</text>
        ))}
        <path d={path('y')} fill="none" stroke="var(--ink-muted, #6b7178)" strokeWidth="1" />
        <path d={path('yhat')} fill="none" stroke="var(--bern, #C8102E)" strokeWidth="1.25" />
      </svg>
    );
  }

  const mrow = (label: string, m: Metrics, strong = false) => (
    <tr style={{ fontWeight: strong ? 700 : 400 }}>
      <td style={{ padding: '4px 16px 4px 0' }}>{label}</td>
      <td className="mono" style={{ padding: '4px 16px', textAlign: 'right' }}>{m.rmse}</td>
      <td className="mono" style={{ padding: '4px 16px', textAlign: 'right' }}>{m.mae}</td>
      <td className="mono" style={{ padding: '4px 0', textAlign: 'right' }}>{m.nse}</td>
    </tr>
  );

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Inference
      </h1>
      <div className="studio-list-layout">
        <div className="studio-list-table">
          <div className="studio-list-table-header">
            <span>Forecast</span>
            <span>Model</span>
            <span>Horizon</span>
            <span>At (UTC)</span>
          </div>
          {items.length === 0 && (
            <div style={{ padding: 24, fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: '#94989D' }}>
              No forecasts yet. ⌘K → "zero-shot forecast" (Chronos-2).
            </div>
          )}
          {items.map(f => (
            <div key={f.id} className="studio-list-row">
              <span>{f.station_id}<span className="mono" style={{ marginLeft: 8 }}>{f.id.slice(0, 8)}</span></span>
              <span className="mono">{f.model_id}</span>
              <span className="mono">{f.horizon_hours}h</span>
              <span className="mono">{f.forecast_at.slice(0, 16).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a forecast?</h2>
          <p>A forecast is a triplet: a model, a dataset, and a future window. It carries the predicted mean and Q05–Q95 prediction intervals at every horizon step.</p>
          <p className="footnote">⌘K → "open in BI canvas"</p>
        </aside>
      </div>

      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          CPU baseline — a real train / evaluate
        </h2>
        <p style={{ color: 'var(--ink-muted)', maxWidth: '64ch', margin: '0 0 16px' }}>
          The API trains a real model on this dataset's history and evaluates it on a held-out split: a
          pure-Python Ridge autoregression, no GPU and no heavy engine. Its error is shown next to a
          persistence (last-value) baseline, an honest yardstick.
        </p>
        <div style={{ display: 'flex', gap: 12, margin: '0 0 18px', flexWrap: 'wrap' }}>
          {CHOICES.map(c => (
            <a key={c} href={`/studio/inference?dataset=${c}`} className="mono" style={{ fontSize: 12, padding: '4px 10px', border: '1px solid var(--hairline)', borderRadius: 6, textDecoration: 'none', color: c === dataset ? 'var(--ink)' : 'var(--ink-muted)', fontWeight: c === dataset ? 700 : 400 }}>{c}</a>
          ))}
        </div>
        {base ? (
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: '20px 24px' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
              {base.dataset_id} · column {base.column} · {base.model} · train {base.n_train} / test {base.n_test}
            </p>
            {chart}
            <p className="footnote" style={{ marginTop: 8 }}>Grey = actual. Red = prediction (test split).</p>
            <table style={{ fontSize: 13, borderCollapse: 'collapse', margin: '12px 0 0' }}>
              <thead>
                <tr style={{ color: 'var(--ink-faint)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <td style={{ padding: '0 16px 6px 0' }}>model</td>
                  <td style={{ padding: '0 16px 6px', textAlign: 'right' }}>rmse</td>
                  <td style={{ padding: '0 16px 6px', textAlign: 'right' }}>mae</td>
                  <td style={{ padding: '0 0 6px', textAlign: 'right' }}>nse</td>
                </tr>
              </thead>
              <tbody>
                {mrow(base.model, base.metrics, true)}
                {mrow('persistence (last value)', base.persistence)}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '12px 0 0', maxWidth: '64ch' }}>{base.note}</p>
          </div>
        ) : (
          <p style={{ color: 'var(--ink-faint)' }}>Baseline unavailable (the API is not reachable).</p>
        )}
      </section>
    </div>
  );
}
