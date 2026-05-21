/**
 * Map panel — inline SVG of the Swiss river network for /forecast.
 * Spec: design-spec §5 (#map). Replaces MapLibre dep on this page so
 * the canvas renders deterministically server-side.
 */

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  bernTintAlpha: 'rgba(226,6,19,0.18)',
  canvasWarmer: '#F2F0EA',
  ocean: '#7FB6DD',
  oceanTint: '#E1F3FE',
  y: '#FBF3DB',
  yText: '#956400',
  surface: '#FFFFFF',
  surfaceShade: '#FAFAF9',
  hairlineStrong: '#DEDCD4',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

export default function MapPanel({ activeStationId }: { activeStationId: string }) {
  return (
    <section
      style={{
        gridColumn: '1 / span 7',
        gridRow: '1 / span 6',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      aria-labelledby="panel-map-title"
    >
      <header
        style={{
          padding: '11px 13px 0',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <span
          id="panel-map-title"
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          river network
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
          aare+rhine+reuss+limmat · 8
        </span>
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 6,
            fontFamily: T.mono,
            fontSize: 9,
            color: T.inkFaint,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: T.inkQuiet }}>#map</span>
        </span>
      </header>
      <div style={{ flex: 1, position: 'relative', background: T.canvasWarmer, marginTop: 6 }}>
        <svg
          viewBox="0 0 720 360"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}
          aria-hidden
        >
          <defs>
            <pattern id="impl-dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.6" fill={T.hairlineStrong} />
            </pattern>
          </defs>
          <rect width="720" height="360" fill="url(#impl-dotgrid)" />
          <path
            d="M55,180 C70,140 130,95 200,88 C260,82 310,65 370,70 C440,76 510,62 580,86 C640,108 690,148 690,200 C685,245 640,282 580,295 C520,313 460,295 400,308 C340,318 280,313 215,300 C155,287 95,265 65,238 C45,220 45,205 55,180 Z"
            fill={T.surface}
            stroke={T.hairlineStrong}
            strokeWidth="0.5"
          />
          {/* lakes */}
          <ellipse cx="200" cy="238" rx="32" ry="8" fill={T.oceanTint} stroke="#B7DDF4" strokeWidth="0.4" />
          <ellipse cx="265" cy="246" rx="20" ry="5" fill={T.oceanTint} stroke="#B7DDF4" strokeWidth="0.4" />
          <ellipse cx="360" cy="196" rx="26" ry="6.5" fill={T.oceanTint} stroke="#B7DDF4" strokeWidth="0.4" />
          <ellipse cx="500" cy="170" rx="18" ry="5" fill={T.oceanTint} stroke="#B7DDF4" strokeWidth="0.4" />
          <ellipse cx="580" cy="184" rx="20" ry="4.5" fill={T.oceanTint} stroke="#B7DDF4" strokeWidth="0.4" />
          {/* rivers */}
          <path
            d="M265,246 C250,238 230,234 215,234 M215,234 C235,225 260,215 285,205 C300,200 315,195 322,190 C330,184 345,184 358,184 M358,184 C400,182 420,180 470,178"
            fill="none"
            stroke={T.ocean}
            strokeWidth="1.4"
            opacity="0.85"
          />
          <path
            d="M580,184 C620,174 640,160 660,153 C660,153 640,144 600,134 C560,123 520,128 480,135 C440,144 410,154 385,160"
            fill="none"
            stroke={T.ocean}
            strokeWidth="1.9"
            opacity="0.85"
          />
          {/* topology */}
          <g stroke="#666A70" fill="none" opacity="0.5">
            <path d="M265,246 C250,228 230,210 215,205" strokeWidth="1.5" />
            <path d="M215,205 C235,196 260,188 285,185" strokeWidth="1.9" />
            <path d="M285,185 C305,184 325,184 345,185" strokeWidth="1.3" />
            <path d="M345,185 C400,178 470,160 500,154" strokeWidth="2.8" />
            <path d="M500,154 C540,144 600,144 645,154" strokeWidth="3.4" />
            <path d="M390,230 C390,210 392,196 385,188" strokeWidth="1.2" />
            <path d="M540,200 C535,182 525,170 520,165" strokeWidth="1.5" />
          </g>
          {/* stations */}
          {[
            { x: 285, y: 185, id: 'aare-bern', label: 'aare-bern·408', dy: -17, active: activeStationId === 'aare-bern' },
            { x: 215, y: 205, id: 'aare-thun', label: 'aare-thun', dy: 18 },
            { x: 345, y: 185, id: 'aare-hagneck', label: 'aare-hag.', dy: -13 },
            { x: 500, y: 154, id: 'rhine-basel', label: 'rhine-basel·1024', dy: -19, big: true },
            { x: 580, y: 164, id: 'rhine-rheinfelden', label: 'rhine-rh.·812', dy: 20, watch: true },
            { x: 390, y: 230, id: 'reuss-luzern', label: 'reuss-luzern', dy: 18 },
            { x: 540, y: 200, id: 'limmat-zurich', label: 'limmat-zur.', dy: 20 },
            { x: 265, y: 246, id: 'brienzersee', label: 'brienzersee', dy: -11 },
          ].map(s => (
            <g key={s.id} transform={`translate(${s.x},${s.y})`}>
              <circle
                r={s.active ? 13 : s.watch ? 12 : s.big ? 14 : 9}
                fill={s.active ? '#FAD9DC' : s.watch ? T.y : T.hairline}
                opacity={s.active ? 0.5 : s.watch ? 0.65 : 1}
              />
              <circle r={s.active ? 7.5 : s.big ? 7.5 : 5} fill={s.active ? '#FDEBEC' : T.canvasWarmer} />
              <circle r={s.active ? 3.4 : 2.4} fill={s.active ? T.bern : T.ink} />
              <text
                x={0}
                y={s.dy}
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fill={s.active ? T.ink : T.inkMuted}
                fontWeight={s.active ? 500 : 400}
              >
                {s.label}
              </text>
              {s.watch && (
                <text x={0} y={(s.dy ?? 0) + 10} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={T.yText} letterSpacing="0.3">
                  watch
                </text>
              )}
            </g>
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 13,
            display: 'flex',
            gap: 14,
            fontFamily: T.mono,
            fontSize: 9,
            color: T.inkFaint,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span>
            <i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: T.bern, marginRight: 5, verticalAlign: 'middle' }} />
            active
          </span>
          <span>
            <i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: T.ink, marginRight: 5, verticalAlign: 'middle' }} />
            obs
          </span>
          <span>
            <i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: T.y, border: `1px solid ${T.yText}`, marginRight: 5, verticalAlign: 'middle' }} />
            watch
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 13,
            fontFamily: T.mono,
            fontSize: 8.5,
            color: T.inkQuiet,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          swisstopo·1:500k
        </div>
      </div>
    </section>
  );
}
