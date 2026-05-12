/**
 * /forecast — the BI canvas. Sprint Day 3 + Day 5 work.
 *
 * Spec: PLATFORM_DESIGN.md §4. Reuses the visual canon from
 * feat/gui-demo iteration 2.
 *
 * This page is server-rendered for SEO and initial paint; the chart
 * and chat sidebar are client components that take over once the JS
 * hydrates. Cross-filter (click station → filter canvas) is client-
 * side state via the URL ?station=… search param.
 */

import { Suspense } from 'react';

import ForecastChart from './components/ForecastChart';
import StationList from './components/StationList';
import KpiStrip from './components/KpiStrip';
import { api } from './lib/api';
import type { Station } from './types';

// Day-1 fallback stations (replaced once liulian-api ships /datasets/{id}/stations)
const FALLBACK_STATIONS: Station[] = [
  { id: 'aare-bern', name: 'Aare at Bern' },
  { id: 'aare-thun', name: 'Aare at Thun' },
  { id: 'rhine-basel', name: 'Rhine at Basel' },
  { id: 'reuss-luzern', name: 'Reuss at Luzern' },
  { id: 'limmat-zurich', name: 'Limmat at Zurich' },
];

const T = {
  canvas: '#FBFBFA',
  ink: '#131313',
  inkMuted: '#666A70',
  inkFaint: '#94989D',
  hairline: '#E8E7E2',
  bern: '#E20613',
  mono: 'JetBrains Mono, ui-monospace, monospace',
  body: 'Switzer, sans-serif',
  display: 'Fraunces, serif',
};

type SearchParams = { station?: string };

async function getForecast(station_id?: string) {
  try {
    const list = await api.forecasts.list(station_id);
    return list.items[0] ?? null;
  } catch {
    // liulian-api unreachable; render landing-style placeholder
    return null;
  }
}

export default async function ForecastPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const activeStationId = params.station ?? FALLBACK_STATIONS[0].id;
  const forecast = await getForecast(activeStationId);

  return (
    <main
      style={{
        background: T.canvas,
        minHeight: '100vh',
        color: T.ink,
        fontFamily: T.body,
      }}
    >
      {/* Scientific running header — PLATFORM_DESIGN §3.2 */}
      <header
        style={{
          height: 32,
          borderBottom: `1px solid ${T.hairline}`,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          background: T.canvas,
        }}
      >
        <span style={{ color: T.ink, fontWeight: 500 }}>LIULIAN</span>
        <span aria-hidden>·</span>
        <span>Forecast</span>
        <span aria-hidden>·</span>
        <span>{new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
        <span aria-hidden>·</span>
        <span>{forecast ? `${forecast.station_id} / ${forecast.model_id}` : activeStationId}</span>
        <span style={{ marginLeft: 'auto', color: T.inkMuted }}>⌘K palette · b BI agent</span>
      </header>

      {/* Canvas grid */}
      <section
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 24,
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 16,
          minHeight: 'calc(100vh - 32px)',
        }}
      >
        <Suspense fallback={null}>
          <StationListServer stations={FALLBACK_STATIONS} activeId={activeStationId} />
        </Suspense>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title band */}
          <div>
            <h1
              style={{
                fontFamily: T.display,
                fontSize: 38,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                margin: 0,
                color: T.ink,
              }}
            >
              {forecast ? `${forecast.station_id}` : activeStationId}
            </h1>
            <p
              style={{
                fontFamily: T.body,
                fontSize: 14,
                color: T.inkMuted,
                margin: '6px 0 0',
                fontStyle: 'italic',
              }}
            >
              {forecast
                ? `${forecast.horizon_hours}-hour forecast with Q05–Q95 prediction intervals · ${forecast.units}`
                : 'liulian-api unreachable; start it with `cd liulian-api && uv run liulian-api`'}
            </p>
          </div>

          {/* Forecast chart */}
          {forecast ? (
            <ForecastChart forecast={forecast} height={420} thresholds={[{ label: 'Elevated', value: 600 }]} />
          ) : (
            <div
              style={{
                border: `1px solid ${T.hairline}`,
                borderRadius: 10,
                padding: 40,
                background: '#fff',
                fontFamily: T.mono,
                fontSize: 12,
                color: T.inkFaint,
                textAlign: 'center',
              }}
            >
              No forecast available for {activeStationId}.
            </div>
          )}

          {/* KPI strip */}
          {forecast && <KpiStrip forecast={forecast} />}
        </div>
      </section>
    </main>
  );
}

/**
 * Server-rendered shell so the station list shows up before JS hydrates.
 * The interactive `StationList` (with j/k nav) is in client component
 * and re-hydrates over this same DOM.
 */
function StationListServer({ stations, activeId }: { stations: Station[]; activeId: string }) {
  return (
    <StationListClient stations={stations} activeId={activeId} />
  );
}

// Re-export the client-component as the client wrapper. Next 14 picks
// up the 'use client' directive in StationList.tsx.
import StationListClient from './components/StationList';

export const metadata = {
  title: 'LIULIAN · Forecast',
  description: 'Probabilistic streamflow forecasts with Q05–Q95 prediction intervals.',
};
