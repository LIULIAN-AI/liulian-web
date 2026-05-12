'use client';

/**
 * Alert severity ribbon — Datadog-lineage UX, restyled per
 * PLATFORM_DESIGN.md §4.2 panel 5.
 *
 * Each row = one alert rule; each segment = one firing window. Colour
 * scale: pastel-yellow (watch) → unibe-red-tint (elevated) →
 * unibe-red (critical). Severity is *additionally* encoded in the
 * row's leading label weight (Switzer regular → bold → italic) so
 * colour isn't the only signal.
 */

type Severity = 'watch' | 'elevated' | 'critical';

export type AlertSegment = {
  start: string; // ISO 8601
  end: string;   // ISO 8601
  severity: Severity;
  forecast_id?: string;
};

export type AlertRow = {
  rule_id: string;
  rule_name: string;
  station_id?: string;
  segments: AlertSegment[];
};

export type AlertRibbonProps = {
  rows: AlertRow[];
  /** Range of the ribbon, ISO 8601 timestamps. */
  windowStart: string;
  windowEnd: string;
  onSegmentClick?: (row: AlertRow, segment: AlertSegment) => void;
};

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  surface: '#FFFFFF',
  surfaceShade: '#FAFAF9',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  bernDeep: '#B00010',
  yellowPale: '#FBF1D9',
  amber: '#946400',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

const SEVERITY: Record<Severity, { bg: string; fg: string; weight: number; italic: boolean }> = {
  watch:     { bg: T.yellowPale, fg: T.amber,    weight: 400, italic: false },
  elevated:  { bg: T.bernTint,   fg: T.bernDeep, weight: 600, italic: false },
  critical:  { bg: T.bern,       fg: T.surface,  weight: 600, italic: true  },
};

function pct(t: string, start: number, end: number): number {
  const x = new Date(t).getTime();
  return Math.max(0, Math.min(100, ((x - start) / (end - start)) * 100));
}

export default function AlertRibbon({
  rows,
  windowStart,
  windowEnd,
  onSegmentClick,
}: AlertRibbonProps) {
  const start = new Date(windowStart).getTime();
  const end = new Date(windowEnd).getTime();

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        padding: '14px 18px',
        fontFamily: T.body,
        color: T.ink,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18, margin: 0, letterSpacing: '-0.01em' }}>
          Alert timeline
        </h3>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.inkFaint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {windowStart.slice(0, 10)} → {windowEnd.slice(0, 10)} · {rows.length} rules
        </span>
      </div>

      {rows.length === 0 ? (
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: T.inkMuted, padding: '24px 0' }}>
          No active alert rules. Press ⌘K → "create alert rule" or ask the BI agent.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(row => (
            <RowView
              key={row.rule_id}
              row={row}
              start={start}
              end={end}
              onSegmentClick={onSegmentClick}
            />
          ))}
        </div>
      )}

      {/* Time axis */}
      <div style={{ marginTop: 16, position: 'relative', height: 16 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <span
            key={p}
            style={{
              position: 'absolute',
              left: `${p * 100}%`,
              transform: 'translateX(-50%)',
              fontFamily: T.mono,
              fontSize: 10,
              color: T.inkFaint,
              letterSpacing: '0.04em',
            }}
          >
            {new Date(start + (end - start) * p).toISOString().slice(5, 10)}
          </span>
        ))}
      </div>
    </div>
  );
}

function RowView({
  row,
  start,
  end,
  onSegmentClick,
}: {
  row: AlertRow;
  start: number;
  end: number;
  onSegmentClick?: (row: AlertRow, segment: AlertSegment) => void;
}) {
  // Pick the row's worst severity for the label weight
  const worst = row.segments.reduce<Severity>(
    (acc, s) => (rank(s.severity) > rank(acc) ? s.severity : acc),
    'watch'
  );
  const style = SEVERITY[worst];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontWeight: style.weight,
          fontStyle: style.italic ? 'italic' : 'normal',
          fontSize: 13,
          color: T.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {row.rule_name}
        {row.station_id && (
          <span style={{ marginLeft: 6, fontFamily: T.mono, fontSize: 10, color: T.inkFaint }}>
            {row.station_id}
          </span>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          height: 14,
          background: T.surfaceShade,
          border: `1px solid ${T.hairline}`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {row.segments.map((seg, i) => {
          const left = pct(seg.start, start, end);
          const right = pct(seg.end, start, end);
          const w = Math.max(1, right - left);
          const sty = SEVERITY[seg.severity];
          return (
            <button
              key={i}
              onClick={() => onSegmentClick?.(row, seg)}
              title={`${seg.severity} · ${seg.start.slice(0, 16)} → ${seg.end.slice(0, 16)}`}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${w}%`,
                top: 0,
                bottom: 0,
                background: sty.bg,
                border: seg.severity === 'critical' ? 'none' : `1px solid ${sty.fg}`,
                cursor: 'pointer',
                padding: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function rank(s: Severity): number {
  return s === 'critical' ? 3 : s === 'elevated' ? 2 : 1;
}
