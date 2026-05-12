'use client';

/**
 * Station map — MapLibre + swisstopo tiles.
 *
 * Spec: PLATFORM_DESIGN §4.2 panel 1.
 * Day 3: stations rendered as concentric SVG circles overlaid on the
 * MapLibre raster basemap. Topology overlay (edges) lands at M2.
 *
 * Active station = unibe-red inner dot + ring; otherwise charcoal.
 * Click → calls `onSelect(stationId)` which the parent uses to
 * cross-filter the canvas.
 */

import { useEffect, useRef, useState } from 'react';

type StationMarker = {
  id: string;
  name: string;
  /** WGS84: [lon, lat] */
  coord: [number, number];
  /** Forecast uncertainty proxy: Q95-Q05 normalised 0..1 → outer ring width */
  uncertainty?: number;
};

export type StationMapProps = {
  markers: StationMarker[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
};

const T = {
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  canvas: '#FBFBFA',
  surface: '#FFFFFF',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

export default function StationMap({
  markers,
  activeId,
  onSelect,
  height = 360,
}: StationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapErr, setMapErr] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: { remove: () => void } | null = null;
    let dispose = false;

    (async () => {
      try {
        // Lazy-load to avoid SSR pain + heavy initial bundle
        const maplibregl = (await import('maplibre-gl')).default;
        if (dispose) return;
        const m = new maplibregl.Map({
          container: containerRef.current!,
          // swisstopo lightbase (CC BY 3.0; attribution baked into the bottom-right footer)
          style: {
            version: 8,
            sources: {
              swisstopo: {
                type: 'raster',
                tiles: [
                  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
                ],
                tileSize: 256,
                attribution: '© swisstopo',
              },
            },
            layers: [{ id: 'swisstopo', type: 'raster', source: 'swisstopo' }],
          },
          center: [7.6, 46.85],
          zoom: 7.4,
          attributionControl: true,
        });
        m.on('load', () => !dispose && setMapLoaded(true));
        map = m;
      } catch (e) {
        if (!dispose) setMapErr(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      dispose = true;
      map?.remove();
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        overflow: 'hidden',
        height,
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {/* Static SVG overlay for station markers. Positioned in % of viewport;
          coordinate → pixel conversion lands when we wire `map.project()` at M2. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        {markers.map(m => {
          const [lon, lat] = m.coord;
          // CH bounding box approx: lon 5.95..10.5, lat 45.8..47.8 → map to 0..100
          const x = ((lon - 5.95) / (10.5 - 5.95)) * 100;
          const y = ((47.8 - lat) / (47.8 - 45.8)) * 100;
          const active = m.id === activeId;
          const u = Math.max(0, Math.min(1, m.uncertainty ?? 0));
          return (
            <g
              key={m.id}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={() => onSelect?.(m.id)}
            >
              {/* Outer uncertainty ring */}
              <circle
                cx={x}
                cy={y}
                r={0.7 + 0.8 * u}
                fill="none"
                stroke={active ? T.bern : T.inkMuted}
                strokeOpacity={0.6}
                strokeWidth={0.18}
              />
              {/* Inner observation dot */}
              <circle
                cx={x}
                cy={y}
                r={0.45}
                fill={active ? T.bern : T.ink}
              />
              <title>{m.name}</title>
            </g>
          );
        })}
      </svg>

      {/* Running header — newspaper of record */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.ink,
          background: 'rgba(251, 251, 250, 0.85)',
          padding: '3px 8px',
          borderRadius: 4,
          border: `1px solid ${T.hairline}`,
        }}
      >
        Swiss River Network · {markers.length} stations
      </div>

      {!mapLoaded && !mapErr && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            color: T.inkMuted,
            background: T.canvas,
          }}
        >
          Loading swisstopo tiles…
        </div>
      )}
      {mapErr && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: T.mono,
            fontSize: 11,
            color: T.bern,
            background: T.canvas,
            padding: 24,
            textAlign: 'center',
          }}
        >
          Map unavailable: {mapErr}
          <br />
          (run <code>pnpm add maplibre-gl</code> inside the workspace)
        </div>
      )}
    </div>
  );
}
