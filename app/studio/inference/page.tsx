/**
 * Studio · Inference — forecasts list.
 */

import type { ForecastSeries } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchForecasts(): Promise<ForecastSeries[]> {
  try {
    const r = await fetch(`${BASE}/forecasts`, { next: { revalidate: 15 } });
    if (!r.ok) return [];
    const body = (await r.json()) as { items: ForecastSeries[] };
    return body.items;
  } catch {
    return [];
  }
}

export default async function StudioInference() {
  const items = await fetchForecasts();
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
              <span>
                {f.station_id}
                <span className="mono" style={{ marginLeft: 8 }}>{f.id.slice(0, 8)}</span>
              </span>
              <span className="mono">{f.model_id}</span>
              <span className="mono">{f.horizon_hours}h</span>
              <span className="mono">{f.forecast_at.slice(0, 16).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a forecast?</h2>
          <p>
            A forecast is a triplet: a model, a dataset, and a future
            window. It carries the predicted mean and Q05–Q95
            prediction intervals at every horizon step.
          </p>
          <p>
            Open the BI canvas (/forecast) to overlay multiple
            forecasts on the same station, or compare a model against
            Chronos-2 zero-shot for an apples-to-apples baseline.
          </p>
          <p className="footnote">⌘K → "open in BI canvas"</p>
        </aside>
      </div>
    </div>
  );
}
