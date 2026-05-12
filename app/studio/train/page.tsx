/**
 * Studio · Train — experiment runs list.
 */

import type { Experiment } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchExperiments(): Promise<Experiment[]> {
  try {
    const r = await fetch(`${BASE}/experiments`, { next: { revalidate: 15 } });
    if (!r.ok) return [];
    const body = (await r.json()) as { items: Experiment[] };
    return body.items;
  } catch {
    return [];
  }
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending',
  queued: 'status-pending',
  running: 'status-running',
  failed: 'status-failed',
  completed: 'status-completed',
  aborted: 'status-failed',
};

export default async function StudioTrain() {
  const items = await fetchExperiments();
  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Train
      </h1>
      <div className="studio-list-layout">
        <div className="studio-list-table">
          <div className="studio-list-table-header">
            <span>Run</span>
            <span>Model</span>
            <span>Status</span>
            <span>Started</span>
          </div>
          {items.length === 0 && (
            <div style={{ padding: 24, fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: '#94989D' }}>
              No experiments yet. ⌘K → "new experiment".
            </div>
          )}
          {items.map(e => (
            <div key={e.id} className="studio-list-row">
              <span>
                {e.name}
                <span className="mono" style={{ marginLeft: 8 }}>seed</span>
              </span>
              <span className="mono">{e.model_id}</span>
              <span className={STATUS_CLASS[e.status] ?? ''}>{e.status}</span>
              <span className="mono">{e.created_at.slice(5, 16).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a run?</h2>
          <p>
            A run is one training trial. Created by an experiment
            (which packages config + hyperparameter search). Compare
            them in the table to the left; ⌘O on the focused row to
            open the run's loss curves and metrics.
          </p>
          <p>
            Status uses typography, not colour: <em>italic</em> is
            running, <strong>bold</strong> is failed.
          </p>
          <p className="footnote">⌘K → "compare runs"</p>
        </aside>
      </div>
    </div>
  );
}
