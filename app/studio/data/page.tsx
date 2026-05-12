/**
 * Studio · Data — datasets list with manifests.
 * Asymmetric two-column archetype (PLATFORM_DESIGN §5.2).
 */

import type { DatasetCard } from '../../forecast/types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchDatasets(): Promise<DatasetCard[]> {
  try {
    const r = await fetch(`${BASE}/datasets`, { next: { revalidate: 30 } });
    if (!r.ok) return FALLBACK;
    const body = (await r.json()) as { items: DatasetCard[] };
    return body.items;
  } catch {
    return FALLBACK;
  }
}

const FALLBACK: DatasetCard[] = [
  { id: 'swiss-river-1990', name: 'Swiss-River 1990', manifest_path: 'manifests/swiss_river/swiss-river-1990.yaml', n_stations: 28, n_features: 5, horizon_hours: 168, span_start: '1989-01-01T00:00:00Z' as unknown as Date, span_end: '2024-12-31T00:00:00Z' as unknown as Date, integrity_hash: 'sha256:7af1…' } as unknown as DatasetCard,
];

export default async function StudioData() {
  const datasets = await fetchDatasets();

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Data
      </h1>
      <div className="studio-list-layout">
        <div className="studio-list-table">
          <div className="studio-list-table-header">
            <span>Manifest</span>
            <span>Stations</span>
            <span>Features</span>
            <span>Horizon</span>
          </div>
          {datasets.map(d => (
            <div key={d.id} className="studio-list-row">
              <span>
                {d.name}
                <span className="mono" style={{ marginLeft: 8 }}>{d.id}</span>
              </span>
              <span className="mono">{d.n_stations}</span>
              <span className="mono">{d.n_features}</span>
              <span className="mono">{d.horizon_hours}h</span>
            </div>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a dataset?</h2>
          <p>
            A LIULIAN dataset is a folder of time-series shards plus a
            YAML manifest that pins the schema, topology, and an
            integrity hash. The manifest is the contract; the shards
            are interchangeable.
          </p>
          <p>
            Click any row to inspect the manifest, see field types
            with example values, and the SHA-256 of the data behind
            this version of the contract.
          </p>
          <p className="footnote">⌘K → "new dataset"</p>
        </aside>
      </div>
    </div>
  );
}
