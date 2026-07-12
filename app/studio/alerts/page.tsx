/**
 * Studio · Alerts — threshold-exceedance timeline (SR-2).
 *
 * Composes two real, torch-free api endpoints: GET /datasets/{id}/series (run #9, the downsampled
 * history) and POST /alerts/evaluate (run #10, a real threshold evaluation on that series). The page
 * server-renders the series as an inline SVG with the threshold line and the actual firing points
 * marked. Ported from the Swiss-River workbench's threshold-exceedance analysis. No mocked data.
 */

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

interface Pt {
  t: string;
  v: number;
}
interface Series {
  column: string;
  points: Pt[];
  n_total: number;
}
interface Evaluation {
  column: string;
  n_checked: number;
  n_fired: number;
  firings: Pt[];
  note: string | null;
}

const CHOICES = ['ETTh1', 'weather', 'exchange_rate', 'illness'];

async function fetchSeries(ds: string): Promise<Series | null> {
  try {
    const r = await fetch(`${BASE}/datasets/${ds}/series?limit=500`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as Series;
  } catch {
    return null;
  }
}

async function postEvaluate(ds: string, column: string, value: number): Promise<Evaluation | null> {
  try {
    const r = await fetch(`${BASE}/alerts/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expr: { kind: 'threshold', field: 'observation', operator: '>', value },
        dataset_id: ds,
        column,
        limit: 500,
      }),
      next: { revalidate: 60 },
    });
    if (!r.ok) return null;
    return (await r.json()) as Evaluation;
  } catch {
    return null;
  }
}

function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (q / 100) * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export default async function StudioAlerts({
  searchParams,
}: {
  searchParams: { dataset?: string; threshold?: string };
}) {
  const dataset = CHOICES.includes(searchParams.dataset ?? '') ? searchParams.dataset! : 'ETTh1';
  const series = await fetchSeries(dataset);
  const column = series?.column ?? 'OT';

  // Default threshold = the 75th percentile of the series, so the demo always fires on a real level.
  const vals = (series?.points ?? []).map(p => p.v).filter(v => typeof v === 'number').sort((a, b) => a - b);
  const parsed = Number(searchParams.threshold);
  const threshold = Number.isFinite(parsed) ? parsed : Number(percentile(vals, 75).toFixed(4));

  const evalr = series ? await postEvaluate(dataset, column, threshold) : null;
  const firedAt = new Set((evalr?.firings ?? []).map(f => f.t));

  const W = 880;
  const H = 320;
  const pad = { l: 56, r: 16, t: 16, b: 26 };
  let svg: React.ReactNode = null;
  if (series && series.points.length > 1) {
    const pts = series.points;
    const ys = pts.map(p => p.v).concat(threshold);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const yPad = (yMax - yMin) * 0.05 || 1;
    const x = (i: number) => pad.l + (i / (pts.length - 1)) * (W - pad.l - pad.r);
    const y = (v: number) =>
      H - pad.b - ((v - (yMin - yPad)) / (yMax + yPad - (yMin - yPad))) * (H - pad.t - pad.b);
    const line = `M${pts.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' L')}`;
    const fmt = (v: number) => (Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(2));
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${dataset} exceedance timeline`}>
        {[yMin, threshold, yMax].map((v, i) => (
          <text key={i} x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-faint)" className="mono">
            {fmt(v)}
          </text>
        ))}
        {/* series line */}
        <path d={line} fill="none" stroke="var(--ink-muted, #6b7178)" strokeWidth="1" />
        {/* threshold */}
        <line x1={pad.l} x2={W - pad.r} y1={y(threshold)} y2={y(threshold)} stroke="var(--bern, #C8102E)" strokeDasharray="5 3" strokeWidth="1.25" />
        {/* firing points */}
        {pts.map((p, i) =>
          firedAt.has(p.t) ? <circle key={i} cx={x(i)} cy={y(p.v)} r="2.2" fill="var(--bern, #C8102E)" /> : null,
        )}
      </svg>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
        Alerts
      </h1>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '68ch', margin: '0 0 18px' }}>
        A threshold-exceedance timeline, computed on the dataset's real series: the points where the
        value crosses a threshold are marked. The rule is evaluated by the API against real data, not a
        mock. The default threshold is the 75th percentile of the series; append ?threshold=N to set it.
      </p>
      <div style={{ display: 'flex', gap: 12, margin: '0 0 20px', flexWrap: 'wrap' }}>
        {CHOICES.map(c => (
          <a
            key={c}
            href={`/studio/alerts?dataset=${c}`}
            className="mono"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              border: '1px solid var(--hairline)',
              borderRadius: 6,
              textDecoration: 'none',
              color: c === dataset ? 'var(--ink)' : 'var(--ink-muted)',
              fontWeight: c === dataset ? 700 : 400,
            }}
          >
            {c}
          </a>
        ))}
      </div>
      {series && evalr ? (
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: '20px 24px' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
            {dataset} · column {column} · rule value &gt; {threshold}
          </p>
          {svg}
          <p style={{ fontSize: 13, margin: '12px 0 0' }}>
            <span className="mono" style={{ fontWeight: 700 }}>{evalr.n_fired}</span> of{' '}
            <span className="mono">{evalr.n_checked}</span> checked points exceed the threshold (dashed
            line); each is marked. {evalr.note ? <span style={{ color: 'var(--ink-muted)' }}>{evalr.note}</span> : null}
          </p>
        </div>
      ) : (
        <p style={{ color: 'var(--ink-faint)' }}>Alerts unavailable (the API is not reachable).</p>
      )}
    </div>
  );
}
