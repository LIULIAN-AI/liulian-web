/**
 * Studio · Outlook — a day-of-year climatology band (SR-1).
 *
 * Renders the real, torch-free `GET /datasets/{id}/outlook` band (empirical p10/p50/p90 across years)
 * as a server-side inline SVG. This is an EMPIRICAL climatology, not a model prediction interval — the
 * page states that plainly (it complements, without over-claiming, the engine's unimplemented
 * probabilistic output). Ported from the Swiss-River workbench's drought-portal-style outlook.
 */

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

interface Bucket {
  doy: number;
  p10: number;
  p50: number;
  p90: number;
  n: number;
}
interface Outlook {
  dataset_id: string;
  column: string;
  n_years: number;
  thresholds: number[];
  band: Bucket[];
  note: string;
}

const CHOICES = ['illness', 'exchange_rate', 'ETTh1', 'weather'];

async function fetchOutlook(dataset: string): Promise<Outlook | null> {
  try {
    const r = await fetch(`${BASE}/datasets/${dataset}/outlook`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as Outlook;
  } catch {
    return null;
  }
}

// SR-5: out-of-sample reliability of the climatology band (GET /datasets/{id}/coverage).
interface CoverageMonth {
  month: number;
  coverage: number;
  n: number;
}
interface Coverage {
  dataset_id: string;
  column: string;
  nominal: number;
  coverage: number;
  n_test: number;
  n_train_years: number;
  n_test_years: number;
  by_month: CoverageMonth[];
  note: string;
}

async function fetchCoverage(dataset: string): Promise<Coverage | null> {
  try {
    const r = await fetch(`${BASE}/datasets/${dataset}/coverage`, { next: { revalidate: 120 } });
    if (!r.ok) return null;
    return (await r.json()) as Coverage;
  } catch {
    return null;
  }
}

const MONTH_ABBR = ['Ja', 'Fe', 'Mr', 'Ap', 'My', 'Jn', 'Jl', 'Au', 'Se', 'Oc', 'No', 'De'];

// Rough day-of-year → month-start ticks for the x-axis.
const MONTHS: [number, string][] = [
  [1, 'Jan'], [32, 'Feb'], [60, 'Mar'], [91, 'Apr'], [121, 'May'], [152, 'Jun'],
  [182, 'Jul'], [213, 'Aug'], [244, 'Sep'], [274, 'Oct'], [305, 'Nov'], [335, 'Dec'],
];

export default async function StudioOutlook({
  searchParams,
}: {
  searchParams: { dataset?: string };
}) {
  const dataset = CHOICES.includes(searchParams.dataset ?? '') ? searchParams.dataset! : 'illness';
  const [o, cov] = await Promise.all([fetchOutlook(dataset), fetchCoverage(dataset)]);

  // SR-5 verdict: a static band that covers within 10pp of nominal is "calibrated"; a big shortfall means
  // the series is non-stationary (trend / regime shift), which a static interval cannot handle.
  const covCalibrated = cov ? cov.coverage - cov.nominal >= -0.1 : false;
  const covAccent = covCalibrated ? '#346538' : '#9F2F2D';

  const W = 880;
  const H = 340;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  let svg: React.ReactNode = null;

  if (o && o.band.length > 1) {
    const band = o.band;
    const ys = band.flatMap(b => [b.p10, b.p90]).concat(o.thresholds);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const yPad = (yMax - yMin) * 0.05 || 1;
    const x = (doy: number) => pad.l + ((doy - 1) / 365) * (W - pad.l - pad.r);
    const y = (v: number) =>
      H - pad.b - ((v - (yMin - yPad)) / (yMax + yPad - (yMin - yPad))) * (H - pad.t - pad.b);
    const top = band.map(b => `${x(b.doy).toFixed(1)},${y(b.p90).toFixed(1)}`);
    const bottom = [...band].reverse().map(b => `${x(b.doy).toFixed(1)},${y(b.p10).toFixed(1)}`);
    const areaPath = `M${top.join(' L')} L${bottom.join(' L')} Z`;
    const medianPath = `M${band.map(b => `${x(b.doy).toFixed(1)},${y(b.p50).toFixed(1)}`).join(' L')}`;
    const fmt = (v: number) => (Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(2));
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${dataset} climatology band`}>
        {/* y grid + labels */}
        {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--hairline)" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-faint)" className="mono">
              {fmt(v)}
            </text>
          </g>
        ))}
        {/* month ticks */}
        {MONTHS.map(([d, m]) => (
          <text key={m} x={x(d)} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--ink-faint)" className="mono">
            {m}
          </text>
        ))}
        {/* p10–p90 band */}
        <path d={areaPath} fill="var(--bern, #C8102E)" fillOpacity="0.12" stroke="none" />
        {/* median */}
        <path d={medianPath} fill="none" stroke="var(--bern, #C8102E)" strokeWidth="1.5" />
        {/* thresholds */}
        {o.thresholds.map((t, i) => (
          <line key={i} x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--ink)" strokeDasharray="4 3" strokeWidth="1" />
        ))}
      </svg>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
        Outlook
      </h1>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '68ch', margin: '0 0 18px' }}>
        A day-of-year climatology band, computed from the dataset's real history: for each calendar day,
        the p10, median, and p90 of the value across all years (aggregated to one value per day per year
        first). It answers "how high might it get, seasonally". This is an empirical climatology, not a
        model prediction. It is a meaningful seasonal outlook only for multi-year, roughly-seasonal data.
      </p>
      <div style={{ display: 'flex', gap: 12, margin: '0 0 20px', flexWrap: 'wrap' }}>
        {CHOICES.map(c => (
          <a
            key={c}
            href={`/studio/outlook?dataset=${c}`}
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
      {o ? (
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: '20px 24px' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
            {o.dataset_id} · column {o.column} · {o.n_years} years
          </p>
          {svg}
          <p className="footnote" style={{ marginTop: 12 }}>
            Band = p10–p90 across years. Line = median. {o.thresholds.length > 0 ? 'Dashed = thresholds.' : ''}
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '8px 0 0' }}>
            {o.note}
          </p>
        </div>
      ) : (
        <p style={{ color: 'var(--ink-faint)' }}>Outlook unavailable (the API is not reachable).</p>
      )}

      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Does the band actually cover? — out-of-sample reliability
        </h2>
        <p style={{ color: 'var(--ink-muted)', maxWidth: '68ch', margin: '0 0 16px' }}>
          A climatology band is only trustworthy if it covers future years. This fits the p10–p90 band on the
          earlier years and measures how much of the held-out later years actually falls inside — a
          leakage-free calibration check. A stationary seasonal series lands near the nominal 80%; a series
          with a trend or regime shift under-covers, which is what conformal calibration is for.
        </p>
        {cov ? (
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, flexWrap: 'wrap', margin: '0 0 16px' }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>empirical coverage</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: covAccent, lineHeight: 1.1 }}>{(cov.coverage * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>nominal</div>
                <div style={{ fontSize: 34, fontWeight: 400, color: 'var(--ink-muted)', lineHeight: 1.1 }}>{(cov.nominal * 100).toFixed(0)}%</div>
              </div>
              <div style={{ alignSelf: 'center', padding: '4px 12px', borderRadius: 9999, border: `1px solid ${covAccent}`, color: covAccent, fontSize: 12, fontWeight: 600 }}>
                {covCalibrated ? 'well-calibrated' : 'under-covers · non-stationary'}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', alignSelf: 'center' }}>
                trained on {cov.n_train_years} yrs · tested on {cov.n_test_years} · n={cov.n_test}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', margin: '4px 0' }}>
              {cov.by_month.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: 48, background: 'var(--hairline)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${Math.max(0, Math.min(1, m.coverage)) * 100}%`, background: m.coverage >= cov.nominal - 0.1 ? '#346538' : '#9F2F2D' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 8, color: 'var(--ink-faint)' }}>{MONTH_ABBR[m.month - 1]}</span>
                </div>
              ))}
            </div>
            <p className="footnote" style={{ marginTop: 8 }}>Per-month out-of-sample coverage (green = meets nominal, red = under-covers).</p>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '8px 0 0', maxWidth: '68ch' }}>{cov.note}</p>
          </div>
        ) : (
          <p style={{ color: 'var(--ink-faint)' }}>Coverage needs a multi-year seasonal series (or the API is unreachable).</p>
        )}
      </section>
    </div>
  );
}
