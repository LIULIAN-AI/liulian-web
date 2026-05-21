'use client';

/**
 * Stations rail as a dense table.
 * Spec: docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md §5.
 * Now driven by real data from /datasets/swiss-river-1990/stations.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Row = { id: string; name: string; q: number; delta: number; watch?: boolean };

// Legacy fallback when the api is offline or returns nothing
const FALLBACK_ROWS: Row[] = [
  { id: '2091', name: '2091', q: 5.83, delta: -2.1, watch: true },
  { id: '2009', name: '2009', q: 4.0, delta: -2.1 },
  { id: '2016', name: '2016', q: 6.47, delta: -1.75 },
  { id: '2018', name: '2018', q: 6.12, delta: -1.65 },
  { id: '2019', name: '2019', q: 4.02, delta: -1.37 },
  { id: '2029', name: '2029', q: 6.63, delta: -0.89 },
  { id: '2030', name: '2030', q: 7.04, delta: -0.92 },
  { id: '2034', name: '2034', q: 4.5, delta: -3.07 },
];

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  surface: '#FFFFFF',
  y: '#FBF3DB',
  yText: '#956400',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  body: 'Switzer, system-ui, sans-serif',
};

export default function StationsTable({
  activeId,
  rows: rowsProp,
  unit = '°C',
}: {
  activeId: string;
  rows?: Row[];
  unit?: string;
}) {
  const router = useRouter();
  const rows = rowsProp && rowsProp.length > 0 ? rowsProp : FALLBACK_ROWS;
  const [focusIdx, setFocusIdx] = useState(() => Math.max(0, rows.findIndex(r => r.id === activeId)));

  const go = useCallback(
    (id: string) => router.push(`/forecast?station=${encodeURIComponent(id)}`),
    [router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(rows.length - 1, i + 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter' || e.key === 'o') {
        const r = rows[focusIdx];
        if (r) go(r.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusIdx, go, rows]);

  return (
    <aside
      style={{
        padding: '16px 14px 18px 20px',
        overflow: 'auto',
        background: 'transparent',
        fontFamily: T.body,
      }}
      aria-label="Stations"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          paddingBottom: 10,
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <span>
          <b style={{ color: T.inkSoft, fontWeight: 500 }}>Stations</b> {rows.length}
        </span>
        <span style={{ display: 'flex', gap: 4 }}>
          <Kbd>j</Kbd>
          <Kbd>k</Kbd>
          <Kbd>o</Kbd>
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 7 }}>
        <thead>
          <tr>
            <Th>station</Th>
            <Th right>{unit} now</Th>
            <Th right>Δ7d</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const active = r.id === activeId;
            const focused = i === focusIdx;
            return (
              <tr
                key={r.id}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => go(r.id)}
                style={{
                  cursor: 'pointer',
                  background: active ? T.bernTint : focused ? T.surface : 'transparent',
                }}
              >
                <td
                  style={{
                    padding: '7px 4px 7px 6px',
                    borderBottom: `1px solid ${T.hairline}`,
                    fontSize: 12,
                    color: active ? T.ink : T.inkSoft,
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {r.name}
                </td>
                <Td>{r.q.toFixed(1)}</Td>
                <Td color={r.watch ? T.yText : T.inkFaint}>
                  {r.delta > 0 ? '+' : ''}
                  {r.delta.toFixed(1)}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Topology />
    </aside>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: T.mono,
        fontSize: 9,
        color: T.inkMuted,
        border: `1px solid ${T.hairline}`,
        borderRadius: 2,
        padding: '0 4px',
        background: T.surface,
      }}
    >
      {children}
    </kbd>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      style={{
        fontFamily: T.mono,
        fontSize: 9,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: T.inkFaint,
        textAlign: right ? 'right' : 'left',
        fontWeight: 500,
        padding: right ? '6px 4px 5px' : '6px 4px 5px 6px',
        borderBottom: `1px solid ${T.hairline}`,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <td
      style={{
        fontFamily: T.mono,
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        color: color ?? T.inkSoft,
        fontSize: 10,
        padding: '7px 4px',
        borderBottom: `1px solid ${T.hairline}`,
      }}
    >
      {children}
    </td>
  );
}

function Topology() {
  return (
    <div
      style={{
        marginTop: 11,
        paddingTop: 11,
        borderTop: `1px solid ${T.hairline}`,
        fontFamily: T.mono,
        fontSize: 9,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: T.inkFaint,
        lineHeight: 1.6,
      }}
    >
      <div style={{ color: T.inkSoft, marginBottom: 5 }}>data source</div>
      <div>dataset/swiss_river/swiss-1990_*.csv</div>
      <div>field: wt (water-temperature °C)</div>
      <div>range: 1990-01-01 → 2020-12-31</div>
      <div style={{ marginTop: 11, color: T.inkSoft }}>filters</div>
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        basin:&nbsp;<Kbd>aare</Kbd> <Kbd>rhine</Kbd> <Kbd>reuss</Kbd>
      </div>
    </div>
  );
}
