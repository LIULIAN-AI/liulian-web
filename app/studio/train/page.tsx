/**
 * Studio · Train — experiment runs list + the real training-configuration options.
 *
 * The "Training configuration" panel server-fetches the engine's real catalogs (identifier modes and
 * their tunable ranges from /identifier-modes; losses/metrics from /task-options; plus model and
 * dataset counts). This is the web half of coverage-matrix rows 7 and 8: the catalogs are no longer
 * just readable on the api, they render live here.
 */

import type { Experiment } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${BASE}${path}`, { next: { revalidate: 30 } });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

async function fetchExperiments(): Promise<Experiment[]> {
  const body = await fetchJson<{ items?: Experiment[] }>('/experiments', {});
  return body.items ?? [];
}

interface IdentifierMode {
  id: string;
  name: string;
  description: string;
  param_space: Record<string, { dist?: string; low?: number; high?: number }>;
}
interface TaskOptions {
  losses: string[];
  default_loss: string;
  metrics: string[];
  default_metrics: string[];
  descriptions: Record<string, string>;
}

function paramLabel(space: IdentifierMode['param_space']): string {
  const keys = Object.keys(space ?? {});
  if (keys.length === 0) return 'no tunable parameters';
  return keys
    .map(k => {
      const p = space[k];
      return p && p.low != null && p.high != null ? `${k} ${p.low}–${p.high}` : k;
    })
    .join(', ');
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
  const [items, idModes, task, models, datasets] = await Promise.all([
    fetchExperiments(),
    fetchJson<{ items?: IdentifierMode[] }>('/identifier-modes', {}),
    fetchJson<TaskOptions>('/task-options', {
      losses: [],
      default_loss: '',
      metrics: [],
      default_metrics: [],
      descriptions: {},
    }),
    fetchJson<unknown[]>('/models', []),
    fetchJson<{ total?: number; items?: unknown[] }>('/datasets', {}),
  ]);

  const modes = idModes.items ?? [];
  const nModels = Array.isArray(models) ? models.length : 0;
  const nDatasets = datasets.total ?? datasets.items?.length ?? 0;
  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--hairline)',
    borderRadius: 8,
    padding: '18px 20px',
    background: 'var(--surface, #fff)',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-faint)',
    margin: '0 0 12px',
  };

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

      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Training configuration
        </h2>
        <p style={{ color: 'var(--ink-muted)', maxWidth: '60ch', margin: '0 0 20px' }}>
          The real options the engine accepts, served live from the API. A new experiment picks one
          value from each; the API rejects any choice these lists do not contain.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={cardStyle}>
            <p style={labelStyle}>Entity-identifier modes</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13, lineHeight: 1.7 }}>
              {modes.map(m => (
                <li key={m.id}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span className="mono" style={{ marginLeft: 8, color: 'var(--ink-faint)' }}>{paramLabel(m.param_space)}</span>
                </li>
              ))}
              {modes.length === 0 && <li style={{ color: 'var(--ink-faint)' }}>catalog unavailable</li>}
            </ul>
          </div>
          <div style={cardStyle}>
            <p style={labelStyle}>Loss &amp; metrics</p>
            <p style={{ fontSize: 13, margin: '0 0 8px' }}>
              Loss: {task.losses.map(l => (
                <span key={l} className="mono" style={{ marginRight: 8, fontWeight: l === task.default_loss ? 700 : 400 }}>{l}</span>
              ))}
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              Metrics: {task.metrics.map(mt => (
                <span key={mt} className="mono" style={{ marginRight: 8, fontWeight: task.default_metrics.includes(mt) ? 700 : 400 }}>{mt}</span>
              ))}
            </p>
            <p className="footnote" style={{ marginTop: 10 }}>bold = default</p>
          </div>
          <div style={cardStyle}>
            <p style={labelStyle}>Catalog size</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 600 }}>{nModels}</span> models
              <br />
              <span className="mono" style={{ fontSize: 20, fontWeight: 600 }}>{nDatasets}</span> datasets
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
