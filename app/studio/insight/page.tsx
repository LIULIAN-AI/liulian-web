/**
 * Studio · Insight — saved BI reports.
 */

type Report = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  public: boolean;
  panels: { id: string; kind: string }[];
  created_at: string;
  updated_at: string;
};

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

async function fetchReports(): Promise<Report[]> {
  try {
    const r = await fetch(`${BASE}/reports`, { next: { revalidate: 30 } });
    if (!r.ok) return [];
    const body = (await r.json()) as { items: Report[] };
    return body.items;
  } catch {
    return [];
  }
}

export default async function StudioInsight() {
  const items = await fetchReports();
  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Insight
      </h1>
      <div className="studio-list-layout">
        <div className="studio-list-table">
          <div className="studio-list-table-header">
            <span>Report</span>
            <span>Panels</span>
            <span>Public</span>
            <span>Updated</span>
          </div>
          {items.length === 0 && (
            <div style={{ padding: 24, fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: '#94989D' }}>
              No reports yet. Save a BI canvas layout from /forecast to make one.
            </div>
          )}
          {items.map(r => (
            <a key={r.id} className="studio-list-row" href={`/forecast/r/${r.slug}`}>
              <span>
                {r.name}
                <span className="mono" style={{ marginLeft: 8 }}>{r.slug}</span>
              </span>
              <span className="mono">{r.panels.length}</span>
              <span className="mono">{r.public ? 'yes' : 'no'}</span>
              <span className="mono">{r.updated_at.slice(5, 16).replace('T', ' ')}</span>
            </a>
          ))}
        </div>
        <aside className="studio-list-explainer">
          <h2>What is a report?</h2>
          <p>
            A report is a saved BI canvas layout: panels + filters +
            an optional public-share slug. It freezes a question in a
            way that anyone with the URL can re-open.
          </p>
          <p>
            Build one in /forecast, then "Save report" from the
            toolbar. Public reports are read-only; the same URL
            renders both the live data and a PDF on demand.
          </p>
          <p className="footnote">⌘K → "export PDF"</p>
        </aside>
      </div>
    </div>
  );
}
