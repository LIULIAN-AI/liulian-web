'use client';

/**
 * Station list — Linear-style dense, keyboard-first (j/k row nav).
 * Spec: PLATFORM_DESIGN.md §5.2 list-page archetype, scaled down to a
 * sidebar.
 *
 * Active row: 6×6 px UniBe red dot on the left (NOT a side-stripe,
 * per UI_AUDIT_CHECKLIST.md §F and ADR 0007).
 */

import { useEffect, useState, useCallback } from 'react';
import type { Station } from '../types';

export type StationListProps = {
  stations: Station[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  surface: '#FFFFFF',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

export default function StationList({ stations, activeId, onSelect }: StationListProps) {
  const [focusIdx, setFocusIdx] = useState(() =>
    Math.max(0, stations.findIndex(s => s.id === activeId))
  );

  const move = useCallback(
    (delta: number) => {
      setFocusIdx(prev => {
        const next = Math.max(0, Math.min(stations.length - 1, prev + delta));
        return next;
      });
    },
    [stations.length]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack when typing in inputs
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable) {
        return;
      }
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'Enter' || e.key === 'o') {
        e.preventDefault();
        const s = stations[focusIdx];
        if (s) onSelect(s.id);
      } else if (e.key === 'g' && (e as KeyboardEvent).shiftKey === false) {
        setTimeout(() => {
          const gg = (ev: KeyboardEvent) => {
            if (ev.key === 'g') {
              setFocusIdx(0);
              window.removeEventListener('keydown', gg);
            }
          };
          window.addEventListener('keydown', gg);
        }, 0);
      } else if (e.key === 'G') {
        setFocusIdx(stations.length - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusIdx, stations, move, onSelect]);

  return (
    <nav
      style={{
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        padding: '8px 0',
        height: '100%',
        overflowY: 'auto',
        fontFamily: T.body,
      }}
      aria-label="Stations"
    >
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          padding: '8px 16px 12px',
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        Stations · {stations.length} · <span style={{ color: T.inkMuted }}>j/k to nav · o to open</span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {stations.map((s, i) => {
          const active = s.id === activeId;
          const focused = i === focusIdx;
          return (
            <li
              key={s.id}
              onClick={() => onSelect(s.id)}
              onMouseEnter={() => setFocusIdx(i)}
              role="button"
              tabIndex={0}
              style={{
                display: 'grid',
                gridTemplateColumns: '16px 1fr auto',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                cursor: 'pointer',
                background: focused && !active ? '#FAFAF9' : 'transparent',
                borderLeft: 'none',
                fontSize: 14,
                color: T.ink,
                position: 'relative',
              }}
            >
              {/* Leading dot — 6×6 px, UniBe red, only on active. NOT a stripe. */}
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 9999,
                  background: active ? T.bern : 'transparent',
                  display: 'inline-block',
                  marginLeft: 5,
                }}
              />
              <span style={{ fontWeight: active ? 500 : 400 }}>{s.name}</span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                  fontFeatureSettings: "'tnum'",
                }}
              >
                {s.id}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
