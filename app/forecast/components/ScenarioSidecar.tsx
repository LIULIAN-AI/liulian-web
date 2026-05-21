'use client';

/**
 * Scenario sidecar — 4 counterfactual sliders + Δ diff readout.
 * Spec: design-spec §5 (#scn). Local state only for now; future work
 * pipes Δ into #fan via a shared context.
 */

import { useState } from 'react';

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  hairlineStrong: '#DEDCD4',
  surface: '#FFFFFF',
  surfaceShade: '#FAFAF9',
  bern: '#E20613',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

type Field = { id: string; label: string; value: number; unit: string; min: number; max: number; step: number };

const FIELDS: Field[] = [
  { id: 'precip', label: 'precip Δ', value: 18, unit: '%', min: -30, max: 50, step: 1 },
  { id: 'temp', label: 'temp Δ', value: 2.4, unit: '°C', min: -3, max: 6, step: 0.1 },
  { id: 'upstream', label: 'upstream Δ', value: 4, unit: '%', min: -20, max: 30, step: 1 },
  { id: 'horizon', label: 'horizon', value: 72, unit: 'h', min: 6, max: 120, step: 6 },
];

export default function ScenarioSidecar() {
  const [state, setState] = useState(() => Object.fromEntries(FIELDS.map(f => [f.id, f.value])) as Record<string, number>);

  // Toy diff: scale precip + upstream by horizon
  const meanDelta = ((state.precip ?? 0) * 0.65 + (state.upstream ?? 0) * 1.2) * ((state.horizon ?? 72) / 72);
  const q95Delta = meanDelta * 2.4;
  const elevCross = q95Delta > 200;

  return (
    <section
      style={{
        gridColumn: '8 / span 5',
        gridRow: '10 / span 2',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      aria-labelledby="panel-scn-title"
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span
          id="panel-scn-title"
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: T.ink }}
        >
          scenario · counterfactual
        </span>
        <span
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkFaint }}
        >
          overlaid as Δ in #fan
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 9, color: T.inkQuiet }}>#scn</span>
      </header>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px 14px',
          alignItems: 'end',
        }}
      >
        {FIELDS.map(f => {
          const v = state[f.id] ?? f.value;
          const pos = ((v - f.min) / (f.max - f.min)) * 100;
          const baselinePos = ((0 - f.min) / (f.max - f.min)) * 100;
          const fillLeft = Math.min(baselinePos, pos);
          const fillWidth = Math.abs(pos - baselinePos);
          return (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor={`scn-${f.id}`}
                style={{
                  display: 'block',
                  fontFamily: T.mono,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                  marginBottom: 3,
                }}
              >
                {f.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: T.mono, fontSize: 14, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {v > 0 ? '+' : ''}
                  {Number.isInteger(f.step) ? v.toFixed(0) : v.toFixed(1)}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.inkFaint }}>{f.unit}</span>
              </div>
              <div
                style={{
                  marginTop: 3,
                  height: 4,
                  background: T.surfaceShade,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -1,
                    bottom: -1,
                    background: T.ink,
                    borderRadius: 2,
                    left: `${fillLeft}%`,
                    width: `${fillWidth}%`,
                  }}
                />
              </div>
              <input
                id={`scn-${f.id}`}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={v}
                onChange={e => setState(s => ({ ...s, [f.id]: Number(e.target.value) }))}
                style={{ marginTop: 4, width: '100%', accentColor: T.bern }}
              />
            </div>
          );
        })}
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: T.inkFaint,
            paddingTop: 6,
            borderTop: `1px dashed ${T.hairline}`,
            marginTop: 2,
            flexWrap: 'wrap',
          }}
        >
          <span>Δ vs baseline</span>
          <span>
            mean{' '}
            <b style={{ color: T.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>
              {meanDelta >= 0 ? '+' : ''}
              {meanDelta.toFixed(1)}
            </b>{' '}
            <span style={{ color: T.inkFaint, fontSize: 10 }}>m³/s @+72h</span>
          </span>
          <span style={{ color: T.inkQuiet }}>·</span>
          <span>
            Q95 ceiling{' '}
            <b style={{ color: T.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums', fontSize: 11.5 }}>
              {q95Delta >= 0 ? '+' : ''}
              {q95Delta.toFixed(0)}
            </b>{' '}
            <span style={{ color: T.inkFaint, fontSize: 10 }}>m³/s</span>
          </span>
          <span style={{ color: T.inkQuiet }}>·</span>
          <span>
            elev cross{' '}
            <b style={{ color: elevCross ? T.bern : T.ink, fontWeight: 500 }}>{elevCross ? 'yes' : 'no'}</b>
          </span>
        </div>
      </div>
    </section>
  );
}
