'use client';

/**
 * Cmd+K command palette — the PRIMARY navigation in /studio per ADR 0007.
 *
 * Light-weight: avoids the `cmdk` npm dep on Day 1; ~150 LOC pure
 * React + keyboard handlers. Swap in `cmdk` (Vercel's) at M2 if we
 * outgrow this.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  canvas: '#FBFBFA',
  surface: '#FFFFFF',
  surfaceShade: '#FAFAF9',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  display: 'Fraunces, serif',
};

export type Command = {
  id: string;
  label: string;
  section: string;
  shortcut?: string;
  action: () => void;
};

export type CommandPaletteProps = {
  commands: Command[];
};

export default function CommandPalette({ commands }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global ⌘K / Ctrl-K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setFocusIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      c => c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const m = new Map<string, Command[]>();
    for (const c of filtered) {
      if (!m.has(c.section)) m.set(c.section, []);
      m.get(c.section)!.push(c);
    }
    return [...m.entries()];
  }, [filtered]);

  const flatOrder = useMemo(() => grouped.flatMap(([, cs]) => cs), [grouped]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx(i => Math.min(flatOrder.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const c = flatOrder[focusIdx];
        if (c) {
          c.action();
          setOpen(false);
        }
      }
    },
    [flatOrder, focusIdx]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(19, 19, 19, 0.20)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 600,
          maxWidth: '92vw',
          background: T.surface,
          border: `1px solid ${T.hairline}`,
          borderRadius: 14,
          boxShadow: '0 24px 48px rgba(19,19,19,0.12)',
          overflow: 'hidden',
          fontFamily: T.body,
          color: T.ink,
        }}
      >
        <div style={{ borderBottom: `1px solid ${T.hairline}` }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setFocusIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              padding: '18px 22px',
              fontSize: 18,
              fontFamily: T.body,
              color: T.ink,
              background: 'transparent',
            }}
          />
        </div>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {grouped.length === 0 && (
            <div
              style={{
                padding: '20px 22px',
                fontFamily: T.display,
                fontStyle: 'italic',
                color: T.inkMuted,
              }}
            >
              No commands match "{query}". Press Esc to close.
            </div>
          )}
          {grouped.map(([section, cs]) => (
            <div key={section}>
              <div
                style={{
                  padding: '8px 22px 4px',
                  fontFamily: T.mono,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                }}
              >
                {section}
              </div>
              {cs.map(c => {
                const idx = flatOrder.findIndex(x => x.id === c.id);
                const focused = idx === focusIdx;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      c.action();
                      setOpen(false);
                    }}
                    onMouseEnter={() => setFocusIdx(idx)}
                    role="option"
                    aria-selected={focused}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '16px 1fr auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 22px',
                      background: focused ? T.surfaceShade : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 9999,
                        background: focused ? T.bern : 'transparent',
                        marginLeft: 5,
                      }}
                    />
                    <span style={{ fontSize: 14 }}>{c.label}</span>
                    {c.shortcut && (
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 11,
                          color: T.inkFaint,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {c.shortcut}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 22px',
            borderTop: `1px solid ${T.hairline}`,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: T.inkFaint,
            background: T.surfaceShade,
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span>⌘K toggle</span>
        </footer>
      </div>
    </div>
  );
}
