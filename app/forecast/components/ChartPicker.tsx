'use client';

/**
 * Chart-type picker strip — #picker.
 * Spec: §5 panel-id contract. Tiles split into library (stock chart types)
 * and liulian-specific.
 */

import { useState } from 'react';

const T = {
  ink: '#131313',
  inkSoft: '#34373B',
  inkFaint: '#767A7E',
  hairline: '#EAEAEA',
  surface: '#FFFFFF',
  canvasWarmer: '#F2F0EA',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

type Tile = { id: string; label: string; lib?: boolean; icon: React.ReactNode };

const TILES: Tile[] = [
  {
    id: 'fan',
    label: 'fan Q5–95',
    icon: (
      <svg viewBox="0 0 54 18" preserveAspectRatio="none">
        <path
          d="M2,15 L8,13 L14,12 L20,10 L26,9 L32,7 L38,5 L44,4 L50,3 L52,3 L52,9 L50,8 L44,8 L38,9 L32,10 L26,11 L20,11 L14,11 L8,12 L2,13 Z"
          fill="#FDEBEC"
        />
        <polyline
          fill="none"
          stroke="#E20613"
          strokeWidth="1"
          strokeDasharray="2 1"
          points="2,12 8,11 14,10 20,9 26,8 32,7 38,6 44,5 50,4"
        />
      </svg>
    ),
  },
  {
    id: 'line',
    label: 'line',
    lib: true,
    icon: (
      <svg viewBox="0 0 54 18">
        <polyline fill="none" stroke="#131313" strokeWidth="1.2" points="2,15 9,12 16,13 23,9 30,11 37,6 44,8 51,4" />
      </svg>
    ),
  },
  {
    id: 'area',
    label: 'area',
    lib: true,
    icon: (
      <svg viewBox="0 0 54 18">
        <path d="M2,15 L9,12 L16,13 L23,9 L30,11 L37,6 L44,8 L51,4 L51,17 L2,17 Z" fill="#EAEAEA" />
      </svg>
    ),
  },
  {
    id: 'bar',
    label: 'bar',
    lib: true,
    icon: (
      <svg viewBox="0 0 54 18">
        <g fill="#131313">
          <rect x="3" y="10" width="5" height="6" />
          <rect x="11" y="8" width="5" height="8" />
          <rect x="19" y="6" width="5" height="10" />
          <rect x="27" y="11" width="5" height="5" />
          <rect x="35" y="4" width="5" height="12" />
          <rect x="43" y="9" width="5" height="7" />
        </g>
      </svg>
    ),
  },
  {
    id: 'scatter',
    label: 'scatter',
    lib: true,
    icon: (
      <svg viewBox="0 0 54 18">
        <g fill="#131313">
          <circle cx="6" cy="13" r="1.5" />
          <circle cx="14" cy="9" r="1.5" />
          <circle cx="22" cy="11" r="1.5" />
          <circle cx="30" cy="6" r="1.5" />
          <circle cx="38" cy="10" r="1.5" />
          <circle cx="46" cy="4" r="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: 'multi-model',
    label: 'multi-model',
    icon: (
      <svg viewBox="0 0 54 18">
        <polyline fill="none" stroke="#E20613" strokeWidth="0.9" points="2,10 9,11 16,9 23,7 30,9 37,5 44,7 51,4" />
        <polyline fill="none" stroke="#0066B3" strokeWidth="0.9" points="2,12 9,12 16,11 23,9 30,11 37,8 44,9 51,7" />
        <polyline fill="none" stroke="#509A39" strokeWidth="0.9" points="2,14 9,13 16,12 23,11 30,12 37,10 44,11 51,9" />
      </svg>
    ),
  },
  {
    id: 'heatmap',
    label: 'heatmap',
    icon: (
      <svg viewBox="0 0 54 18">
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = (i % 6) * 8 + 2;
            const y = i < 6 ? 2 : 10;
            const bg = ['#FDEBEC', '#FAD9DC', '#FDEBEC', '#EAEAEA', '#FAFAF9', '#F2F0EA', '#FAD9DC', '#E20613', '#FAD9DC', '#EAEAEA', '#FBFBFA', '#FAFAF9'][i];
            return <rect key={i} x={x} y={y} width="6" height="6" fill={bg} />;
          })}
        </g>
      </svg>
    ),
  },
];

export type ChartType = (typeof TILES)[number]['id'];

export default function ChartPicker({
  active = 'fan',
  onSelect,
}: {
  active?: string;
  onSelect?: (id: string) => void;
}) {
  const [picked, setPicked] = useState(active);
  return (
    <div
      style={{
        gridColumn: '6 / span 7',
        gridRow: '1 / span 1',
        display: 'flex',
        gap: 8,
        padding: 0,
        alignItems: 'center',
        overflowX: 'auto',
      }}
      role="tablist"
      aria-label="Chart type picker"
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          paddingRight: 6,
        }}
      >
        vis as
      </span>
      {TILES.map(tile => {
        const isActive = picked === tile.id;
        return (
          <button
            key={tile.id}
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => {
              setPicked(tile.id);
              onSelect?.(tile.id);
            }}
            style={{
              border: `1px solid ${isActive ? T.ink : T.hairline}`,
              borderRadius: 6,
              padding: '6px 10px',
              minWidth: 88,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              cursor: 'pointer',
              background: isActive ? T.bernTint : tile.lib ? T.canvasWarmer : T.surface,
            }}
          >
            <div style={{ width: 54, height: 18 }}>{tile.icon}</div>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isActive ? T.ink : T.inkSoft,
              }}
            >
              {tile.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
