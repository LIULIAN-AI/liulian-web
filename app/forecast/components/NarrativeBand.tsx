/**
 * Narrative band — editorial Fraunces lead + tabular pulse strip.
 * Spec: docs/superpowers/specs/2026-05-20-forecast-redesign-design.md §4.
 */

import type { ForecastSeries } from '../types';

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  hairline: '#EAEAEA',
  bern: '#E20613',
  canvas: '#FBFBFA',
  serif: 'Fraunces, Georgia, serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

export default function NarrativeBand({
  activeStationId,
  forecast,
  stationCount = 8,
  watch = 1,
  elev = 0,
  crit = 0,
  models = 3,
}: {
  activeStationId: string;
  forecast: ForecastSeries | null;
  stationCount?: number;
  watch?: number;
  elev?: number;
  crit?: number;
  models?: number;
}) {
  const units = forecast?.units ?? '°C';
  const q95Peak = forecast ? Math.max(...forecast.q95.filter(v => Number.isFinite(v))) : 0;
  const q95Label = Number.isFinite(q95Peak) && q95Peak !== 0
    ? `${q95Peak.toFixed(1)} ${units}`
    : `— ${units}`;
  const latestObs = forecast?.observed?.filter(v => v != null).slice(-1)?.[0];
  const latestLabel = latestObs != null ? `${(latestObs as number).toFixed(2)} ${units}` : `— ${units}`;
  const stamp = forecast ? forecast.forecast_at.slice(0, 16).replace('T', ' · ') + ' UTC' : '—';
  const horizonH = forecast?.horizon_hours ?? 0;
  const horizonLabel = horizonH >= 48 ? `${Math.round(horizonH / 24)} d` : `${horizonH} h`;

  return (
    <section
      style={{
        borderBottom: `1px solid ${T.hairline}`,
        padding: '16px 24px 18px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'end',
        gap: 32,
        background: T.canvas,
      }}
    >
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          lineHeight: 1.5,
        }}
      >
        <b style={{ color: T.inkSoft, fontWeight: 500 }}>{stamp}</b>
        <br />canvas summary
      </div>
      <p
        style={{
          fontFamily: T.serif,
          fontVariationSettings: '"opsz" 56, "wght" 400',
          fontSize: 23,
          lineHeight: 1.32,
          letterSpacing: '-0.014em',
          color: T.ink,
          maxWidth: '84ch',
          margin: 0,
        }}
      >
        Station <span style={{ color: T.bern, fontStyle: 'italic', fontVariationSettings: '"opsz" 56, "wght" 600, "WONK" 1', fontFeatureSettings: '"tnum" 1' }}>{activeStationId}</span> measures <span style={{ color: T.bern, fontStyle: 'italic', fontVariationSettings: '"opsz" 56, "wght" 600, "WONK" 1', fontFeatureSettings: '"tnum" 1' }}>{latestLabel}</span> at the latest <em style={{ fontStyle: 'italic', fontVariationSettings: '"opsz" 56, "wght" 500, "WONK" 1' }}>real observation</em>, with a forecast Q95 ceiling near <span style={{ color: T.bern, fontStyle: 'italic', fontVariationSettings: '"opsz" 56, "wght" 600, "WONK" 1', fontFeatureSettings: '"tnum" 1' }}>{q95Label}</span> across the next {horizonLabel}.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 18,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.inkFaint,
        }}
      >
        {[
          ['stations', stationCount],
          ['watch', watch],
          ['elev', elev],
          ['crit', crit],
          ['models', models],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
            {label}
            <strong
              style={{
                color: T.ink,
                fontSize: 14,
                letterSpacing: 0,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500,
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
