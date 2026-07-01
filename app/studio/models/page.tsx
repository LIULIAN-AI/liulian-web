/**
 * Studio · Models — the model catalog, served live from the engine's real adapter registry
 * (liulian-api GET /models, which auto-derives from liulian-python/liulian/models/torch/*).
 */

import type { ModelCard } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchModels(): Promise<ModelCard[]> {
  try {
    const r = await fetch(`${BASE}/models`, { next: { revalidate: 30 } });
    if (!r.ok) return FALLBACK;
    return (await r.json()) as ModelCard[];
  } catch {
    return FALLBACK;
  }
}

const FALLBACK: ModelCard[] = [
  { id: 'lstm', name: 'LSTM', family: 'classical', capabilities: ['deterministic'], source: 'liulian-core' },
];

export default async function StudioModels() {
  const models = await fetchModels();

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Models
      </h1>
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
            actually run &mdash; add an adapter to the engine and it appears
            here with no code change.
          </p>
          <p className="footnote">&#8984;K &rarr; &ldquo;run model&rdquo;</p>
        </aside>
      </div>
    </div>
  );
}
