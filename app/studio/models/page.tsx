/**
 * Studio · Models — the model catalog, served live from the engine's real adapter registry
 * (liulian-api GET /models, which auto-derives from liulian-python/liulian/models/torch/*).
 * A family filter uses the api's own ?family= query.
 */

import Link from 'next/link';
import type { ModelCard } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

const FAMILIES = [
  'all', 'classical', 'decomposition', 'efficient', 'patch',
  'mixture', 'state-space', 'llm-grounded', 'domain', 'foundation',
] as const;

async function fetchModels(family?: string): Promise<ModelCard[]> {
  const url =
    family && family !== 'all'
      ? `${BASE}/models?family=${encodeURIComponent(family)}`
      : `${BASE}/models`;
  try {
    const r = await fetch(url, { next: { revalidate: 30 } });
    if (!r.ok) return FALLBACK;
    return (await r.json()) as ModelCard[];
  } catch {
    return FALLBACK;
  }
}

const FALLBACK: ModelCard[] = [
  { id: 'lstm', name: 'LSTM', family: 'classical', capabilities: ['deterministic'], source: 'liulian-core' },
];

const CHOICES = ['ETTh1', 'weather', 'exchange_rate', 'electricity'];

interface LeaderRow {
  model: string;
  rmse: number;
  mae: number;
  nse: number;
}
interface Leaderboard {
  dataset_id: string;
  column: string;
  n_test: number;
  train_frac: number;
  board: LeaderRow[];
  note: string;
}

// SR-4: a fair CPU baseline leaderboard (GET /datasets/{id}/leaderboard) — same data/split/metric.
async function fetchLeaderboard(ds: string): Promise<Leaderboard | null> {
  try {
    const r = await fetch(`${BASE}/datasets/${ds}/leaderboard?train_frac=0.7`, { next: { revalidate: 120 } });
    if (!r.ok) return null;
    return (await r.json()) as Leaderboard;
  } catch {
    return null;
  }
}

export default async function StudioModels({ searchParams }: { searchParams: { family?: string; dataset?: string } }) {
  const active = searchParams.family ?? 'all';
  const dataset = CHOICES.includes(searchParams.dataset ?? '') ? searchParams.dataset! : 'ETTh1';
  const [models, lb] = await Promise.all([fetchModels(active), fetchLeaderboard(dataset)]);

  // Keep both filters sticky when either is clicked; omit defaults for clean URLs.
  const buildHref = (p: { family?: string; dataset?: string }) => {
    const q = new URLSearchParams();
    if (p.family && p.family !== 'all') q.set('family', p.family);
    if (p.dataset && p.dataset !== 'ETTh1') q.set('dataset', p.dataset);
    const s = q.toString();
    return s ? `/studio/models?${s}` : '/studio/models';
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
        Models
      </h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 24px' }}>
        {FAMILIES.map(f => (
          <Link
            key={f}
            href={buildHref({ family: f, dataset })}
            className="mono"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 6,
              textDecoration: 'none',
              border: '1px solid #EAEAEA',
              background: active === f ? '#111111' : 'transparent',
              color: active === f ? '#FFFFFF' : '#787774',
            }}
          >
            {f}
          </Link>
        ))}
      </div>
      <div className="studio-list-layout">
        <div className="studio-list-table">
          <div className="studio-list-table-header">
            <span>Model</span>
            <span>Family</span>
            <span>Source</span>
            <span>Paper</span>
          </div>
          {models.map(m => (
            <div key={m.id} className="studio-list-row">
              <span>
                {m.name}
                <span className="mono" style={{ marginLeft: 8 }}>{m.id}</span>
              </span>
              <span className="mono">{m.family}</span>
              <span className="mono">{m.source}</span>
              <span className="mono">
                {m.paper_url ? (
                  <a href={m.paper_url} target="_blank" rel="noreferrer">arXiv</a>
                ) : (
                  '—'
                )}
              </span>
            </div>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a model?</h2>
          <p>
            A LIULIAN model is a forecasting adapter the engine can load by
            name. This catalog is derived live from the engine&rsquo;s real
            adapter set, so it always matches what training and inference can
            actually run. Add an adapter to the engine and it appears here
            with no code change.
          </p>
          <p className="footnote">&#8984;K &rarr; &ldquo;run model&rdquo;</p>
        </aside>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Baseline leaderboard — a fair CPU comparison
        </h2>
        <p style={{ color: '#787774', maxWidth: '64ch', margin: '0 0 16px' }}>
          Several real baselines, each trained and evaluated on the same dataset, the same held-out span,
          and ranked by the same metric (NSE) — only the model differs. On a strongly autocorrelated series
          the naive persistence baseline is a strong contender, which is exactly the point.
        </p>
        <div style={{ display: 'flex', gap: 12, margin: '0 0 18px', flexWrap: 'wrap' }}>
          {CHOICES.map(c => (
            <Link key={c} href={buildHref({ family: active, dataset: c })} className="mono" style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #EAEAEA', borderRadius: 6, textDecoration: 'none', color: c === dataset ? '#111111' : '#787774', fontWeight: c === dataset ? 700 : 400 }}>{c}</Link>
          ))}
        </div>
        {lb && lb.board.length > 0 ? (
          <div style={{ border: '1px solid #EAEAEA', borderRadius: 8, padding: '20px 24px' }}>
            <p className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94989D', margin: '0 0 14px' }}>
              {lb.dataset_id} · column {lb.column} · test span {lb.n_test} pts · ranked by NSE
            </p>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr className="mono" style={{ color: '#94989D', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <td style={{ padding: '0 12px 6px 0' }}>#</td>
                  <td style={{ padding: '0 12px 6px' }}>model</td>
                  <td style={{ padding: '0 12px 6px', width: '38%' }}>nse — 0 = mean baseline, 1 = perfect</td>
                  <td style={{ padding: '0 12px 6px', textAlign: 'right' }}>rmse</td>
                  <td style={{ padding: '0 0 6px', textAlign: 'right' }}>mae</td>
                </tr>
              </thead>
              <tbody>
                {lb.board.map((row, i) => {
                  const w = Math.max(0, Math.min(1, row.nse)) * 100;
                  return (
                    <tr key={row.model} style={{ borderTop: '1px solid #F0F0EE' }}>
                      <td className="mono" style={{ padding: '7px 12px 7px 0', color: '#94989D' }}>{i + 1}</td>
                      <td style={{ padding: '7px 12px', fontWeight: i === 0 ? 700 : 400 }}>{row.model}</td>
                      <td style={{ padding: '7px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#F0F0EE', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${w}%`, height: '100%', background: i === 0 ? '#C8102E' : '#9AA0A6' }} />
                          </div>
                          <span className="mono" style={{ fontSize: 12, minWidth: 52, textAlign: 'right' }}>{row.nse}</span>
                        </div>
                      </td>
                      <td className="mono" style={{ padding: '7px 12px', textAlign: 'right' }}>{row.rmse}</td>
                      <td className="mono" style={{ padding: '7px 0', textAlign: 'right' }}>{row.mae}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: '#787774', margin: '14px 0 0', maxWidth: '64ch' }}>{lb.note}</p>
          </div>
        ) : (
          <p style={{ color: '#94989D' }}>Leaderboard unavailable (the API is not reachable).</p>
        )}
      </section>
    </div>
  );
}
