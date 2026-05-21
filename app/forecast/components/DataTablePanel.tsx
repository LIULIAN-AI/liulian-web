'use client';

/**
 * Editable data table panel — #table.
 * Spec: docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md §5
 * Reads real swiss-river-1990 timeseries from
 *   GET /datasets/swiss-river-1990/timeseries?station_id=X&days=60
 * Allows in-place cell edits to a sandboxed draft.
 */

import { useEffect, useState } from 'react';
import type { TimeseriesPoint } from '../types';

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  surface: '#FFFFFF',
  canvasWarmer: '#F2F0EA',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  green: '#509A39',
  ocean: '#0066B3',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  body: 'Switzer, system-ui, sans-serif',
};

type Row = { date: string; v: number | null; dirty?: boolean };

export default function DataTablePanel({
  stationId,
  initialPoints,
}: {
  stationId: string;
  initialPoints: TimeseriesPoint[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initialPoints.map(p => ({ date: p.t.slice(0, 10), v: p.v })),
  );
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<string>('');

  // Resync if station changes
  useEffect(() => {
    setRows(initialPoints.map(p => ({ date: p.t.slice(0, 10), v: p.v })));
    setEditingIdx(null);
  }, [initialPoints]);

  const dirtyCount = rows.filter(r => r.dirty).length;

  const startEdit = (i: number) => {
    setEditingIdx(i);
    setDraft(rows[i]?.v?.toString() ?? '');
  };

  const commitEdit = () => {
    if (editingIdx == null) return;
    const num = parseFloat(draft);
    if (Number.isNaN(num)) {
      setEditingIdx(null);
      return;
    }
    setRows(prev =>
      prev.map((r, j) => (j === editingIdx ? { ...r, v: num, dirty: true } : r)),
    );
    setEditingIdx(null);
    // R8: dispatch event so the FanPanel can refit
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('liulian:table-edit', {
          detail: { stationId, rows: rows.map((r, j) => (j === editingIdx ? { ...r, v: num } : r)) },
        }),
      );
    }
  };

  const cancelEdit = () => setEditingIdx(null);

  return (
    <section
      style={{
        gridColumn: '1 / span 5',
        gridRow: '1 / span 7',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 6,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
      }}
      aria-labelledby="table-title"
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span
          id="table-title"
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: T.ink }}
        >
          data · station {stationId}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkFaint }}>
          wt °C · daily · last {rows.length} d
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ocean, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            → syncs to #fan
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.inkQuiet }}>#table</span>
        </span>
      </header>

      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '7px 0',
          borderBottom: `1px solid ${T.hairline}`,
          marginBottom: 4,
        }}
      >
        <ToolBtn primary>+ row</ToolBtn>
        <ToolBtn>delete</ToolBtn>
        <ToolBtn>filter</ToolBtn>
        <ToolBtn>sort</ToolBtn>
        <ToolBtn>export csv</ToolBtn>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.inkFaint,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            paddingTop: 5,
          }}
        >
          <b style={{ color: T.inkSoft }}>{dirtyCount} edit{dirtyCount === 1 ? '' : 's'}</b> · sandbox draft
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          padding: '4px 0 8px',
          fontFamily: T.mono,
          fontSize: 9,
          color: T.inkFaint,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderBottom: `1px solid ${T.hairline}`,
          marginBottom: 2,
        }}
      >
        <span><b style={{ color: T.inkSoft, fontWeight: 500 }}>schema</b></span>
        <span>date <span style={{ color: T.inkQuiet }}>date</span></span>
        <span>wt <span style={{ color: T.inkQuiet }}>float32 °C</span></span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.mono }}>
          <thead>
            <tr>
              <Th>date</Th>
              <Th right>
                wt °C <span style={{ color: T.inkFaint, fontSize: 8 }}>f32</span>
              </Th>
              <Th right>Δprev</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const prev = rows[i - 1]?.v;
              const delta = r.v !== null && prev !== null && prev !== undefined ? r.v - prev : null;
              return (
                <tr
                  key={r.date}
                  style={{
                    background: r.dirty ? '#FAFFEA' : 'transparent',
                  }}
                >
                  <td
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11.5,
                      padding: '4px 8px',
                      color: T.ink,
                      borderBottom: `1px dashed ${T.hairline}`,
                    }}
                  >
                    {r.date}
                  </td>
                  <td
                    onDoubleClick={() => startEdit(i)}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11.5,
                      padding: '4px 8px',
                      textAlign: 'right',
                      color: T.inkSoft,
                      fontVariantNumeric: 'tabular-nums',
                      borderBottom: `1px dashed ${T.hairline}`,
                      cursor: 'cell',
                    }}
                  >
                    {editingIdx === i ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit();
                          else if (e.key === 'Escape') cancelEdit();
                        }}
                        aria-label={`Edit value for ${r.date}`}
                        style={{
                          font: 'inherit',
                          color: T.ink,
                          border: `1px solid ${T.bern}`,
                          padding: '1px 4px',
                          width: 64,
                          textAlign: 'right',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <span title="double-click to edit">{r.v?.toFixed(2) ?? '—'}</span>
                    )}
                  </td>
                  <td
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11,
                      padding: '4px 8px',
                      textAlign: 'right',
                      color: delta == null ? T.inkQuiet : delta >= 0 ? T.inkSoft : T.ocean,
                      fontVariantNumeric: 'tabular-nums',
                      borderBottom: `1px dashed ${T.hairline}`,
                    }}
                  >
                    {delta === null ? '—' : (delta >= 0 ? '+' : '') + delta.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={3}
                style={{
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  padding: '6px 8px',
                  color: T.inkFaint,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderTop: `1px solid ${T.hairline}`,
                  background: T.surface,
                }}
              >
                {rows.length} rows · 2 cols · {dirtyCount} dirty · double-click cell to edit · ⏎ commit · esc cancel
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      style={{
        position: 'sticky',
        top: 0,
        background: T.canvasWarmer,
        fontFamily: T.mono,
        fontSize: 9,
        color: T.inkSoft,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textAlign: right ? 'right' : 'left',
        fontWeight: 500,
        padding: '5px 8px 4px',
        borderBottom: `1px solid ${T.hairline}`,
      }}
    >
      {children}
    </th>
  );
}

function ToolBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      style={{
        fontFamily: T.mono,
        fontSize: 9,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        border: `1px solid ${primary ? T.ink : T.hairline}`,
        borderRadius: 3,
        color: primary ? '#FBFBFA' : T.inkSoft,
        background: primary ? T.ink : T.surface,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
