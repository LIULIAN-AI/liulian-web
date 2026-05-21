/**
 * Station profile preview strip — 4 mini-cards with value + Δ + sparkbar.
 * Spec: design-spec §5 (#peek).
 */

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  surface: '#FFFFFF',
  watchBg: '#FBF8E8',
  bern: '#E20613',
  yText: '#956400',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  body: 'Switzer, system-ui, sans-serif',
};

type Card = {
  name: string;
  code: 'watch' | 'stable' | 'active';
  val: number;
  delta: number;
  meta: [string, string];
  spark: number[];
  highlight?: 'bern' | 'amber' | 'ink';
};

const CARDS: Card[] = [
  {
    name: 'rhine-rheinfelden',
    code: 'watch',
    val: 812,
    delta: 3.6,
    meta: ['q95 drift +3.6/24h', 'since 11:00'],
    spark: [12, 13, 12, 10, 11, 9, 8, 7, 6, 6, 5, 4],
    highlight: 'amber',
  },
  {
    name: 'rhine-basel',
    code: 'stable',
    val: 1024,
    delta: 2.1,
    meta: ['upstream', 'since boot'],
    spark: [10, 11, 10, 9, 10, 9, 10, 8, 9, 8, 8, 9],
    highlight: 'ink',
  },
  {
    name: 'brienzersee',
    code: 'stable',
    val: 142,
    delta: -0.4,
    meta: ['aare headwater', 'baseline'],
    spark: [10, 10, 11, 10, 11, 11, 10, 10, 11, 10, 10, 11],
    highlight: 'ink',
  },
  {
    name: 'aare-bern',
    code: 'active',
    val: 408,
    delta: -1.2,
    meta: ['72 h forecast pinned', 'patchtst'],
    spark: [11, 12, 11, 9, 10, 8, 7, 8, 7, 6, 7, 7],
    highlight: 'bern',
  },
];

function sparkPoints(spark: number[]): string {
  const w = 200;
  const h = 20;
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const span = max - min || 1;
  return spark
    .map((v, i) => {
      const x = (i / (spark.length - 1)) * w;
      const y = h - 2 - ((v - min) / span) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function PeekStrip() {
  return (
    <section
      style={{
        gridColumn: '1 / span 12',
        gridRow: '17 / span 2',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      aria-labelledby="panel-peek-title"
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span
          id="panel-peek-title"
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: T.ink }}
        >
          station profile · peek
        </span>
        <span
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkFaint }}
        >
          recent observations · 24 h delta · 7-day sparkbar
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 9, color: T.inkQuiet }}>#peek</span>
      </header>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {CARDS.map(c => (
          <div
            key={c.name}
            style={{
              padding: '9px 11px',
              border: `1px solid ${T.hairline}`,
              borderRadius: 5,
              background: c.code === 'watch' ? T.watchBg : T.surface,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: T.body, fontSize: 13, color: T.ink, fontWeight: 500 }}>{c.name}</span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                }}
              >
                {c.code}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 19,
                  color: T.ink,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {c.val}
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkFaint }}>m³/s</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: T.mono,
                  fontSize: 10,
                  color: c.code === 'watch' ? T.yText : T.inkFaint,
                }}
              >
                {c.delta > 0 ? '+' : ''}
                {c.delta.toFixed(1)}
              </span>
            </div>
            <div>
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 20 }} aria-hidden>
                <polyline
                  fill="none"
                  stroke={c.highlight === 'amber' ? T.yText : c.highlight === 'bern' ? T.bern : T.inkSoft}
                  strokeWidth="1.2"
                  points={sparkPoints(c.spark)}
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                color: T.inkFaint,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{c.meta[0]}</span>
              <span>{c.meta[1]}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
