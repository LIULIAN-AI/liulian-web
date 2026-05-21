/**
 * Correlation panel — 8×8 Spearman ρ grid, topology-ordered.
 * Spec: design-spec §5 (#corr). Static values for now; replace with
 * `GET /stations/correlation?days=30` when the endpoint lands.
 */

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  surface: '#FFFFFF',
  canvasWarmer: '#F2F0EA',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

const LABELS = ['thun', 'bern', 'hagneck', 'basel', 'rh.fld', 'luzern', 'zurich', 'brienz.'] as const;
const SHORT = ['thun', 'bern', 'hag.', 'basel', 'rh.fld', 'luzern', 'zurich', 'brz.'] as const;

// Upper-triangle Spearman ρ — symmetric. Picked to match the canon in the design rounds.
const M: number[][] = [
  [1.0, 0.92, 0.81, 0.71, 0.42, 0.38, 0.21, 0.74],
  [0.92, 1.0, 0.94, 0.77, 0.45, 0.41, 0.24, 0.69],
  [0.81, 0.94, 1.0, 0.88, 0.49, 0.46, 0.22, 0.62],
  [0.71, 0.77, 0.88, 1.0, 0.91, 0.74, 0.39, 0.41],
  [0.42, 0.45, 0.49, 0.91, 1.0, 0.83, 0.37, 0.33],
  [0.38, 0.41, 0.46, 0.74, 0.83, 1.0, 0.52, 0.36],
  [0.21, 0.24, 0.22, 0.39, 0.37, 0.52, 1.0, 0.38],
  [0.74, 0.69, 0.62, 0.41, 0.33, 0.36, 0.38, 1.0],
];

function ramp(v: number): string {
  if (v >= 0.95) return T.canvasWarmer;
  if (v >= 0.9) return '#FAD9DC';
  if (v >= 0.8) return '#FDEBEC';
  if (v >= 0.65) return '#FBEEF0';
  if (v >= 0.45) return '#FAFAF9';
  if (v >= 0.3) return '#FBFBFA';
  return '#F2F0EA';
}

export default function CorrelationPanel() {
  return (
    <section
      style={{
        gridColumn: '1 / span 5',
        gridRow: '12 / span 5',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      aria-labelledby="panel-corr-title"
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span
          id="panel-corr-title"
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          correlation · Spearman ρ
        </span>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          30 d · topology-ordered
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 9, color: T.inkQuiet, letterSpacing: '0.04em' }}>
          #corr
        </span>
      </header>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '80px repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          columnGap: 1,
          rowGap: 1,
          background: T.hairline,
          border: `1px solid ${T.hairline}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {M.map((row, i) => (
          <>
            <div
              key={`y-${i}`}
              style={{
                background: T.surface,
                fontFamily: T.mono,
                fontSize: 9.5,
                color: T.inkSoft,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 6,
              }}
            >
              {LABELS[i]}
            </div>
            {row.map((v, j) => {
              const diag = i === j;
              return (
                <div
                  key={`c-${i}-${j}`}
                  style={{
                    background: diag ? T.canvasWarmer : ramp(v),
                    fontFamily: T.mono,
                    fontSize: 9.5,
                    color: diag ? T.inkFaint : T.inkSoft,
                    fontVariantNumeric: 'tabular-nums',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {diag ? '1.00' : v.toFixed(2).replace(/^0/, '')}
                </div>
              );
            })}
          </>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(8, 1fr)',
          marginTop: 6,
        }}
      >
        <div />
        {SHORT.map(l => (
          <div
            key={l}
            style={{
              fontFamily: T.mono,
              fontSize: 9.5,
              color: T.inkFaint,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </section>
  );
}
