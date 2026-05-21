/**
 * /forecast — the BI canvas. Redesign R8 (2026-05-21).
 * Spec: docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md
 *
 * Real swiss-river-1990 data: 28 stations, water-temperature °C.
 * Default station: 2091 (Aare reach near Bern), the benchmark canonical.
 */

import { Suspense } from 'react';

import ForecastChart from './components/ForecastChart';
import KpiStrip from './components/KpiStrip';
import MultiModelOverlay from './components/MultiModelOverlay';
import AlertRibbon from './components/AlertRibbon';
import ChatSidebar from './components/ChatSidebar';
import NarrativeBand from './components/NarrativeBand';
import MapPanel from './components/MapPanel';
import StationsTable from './components/StationsTable';
import CorrelationPanel from './components/CorrelationPanel';
import DataTablePanel from './components/DataTablePanel';
import ChartPicker from './components/ChartPicker';
import { api } from './lib/api';
import type { ForecastSeries, StationCard, TimeseriesPoint } from './types';

const T = {
  canvas: '#FBFBFA',
  canvasWarmer: '#F2F0EA',
  ink: '#131313',
  inkSoft: '#34373B',
  inkMuted: '#5C6066',
  inkFaint: '#767A7E',
  inkQuiet: '#B6B9BD',
  hairline: '#EAEAEA',
  hairlineStrong: '#DEDCD4',
  bern: '#E20613',
  bernTint: '#FDEBEC',
  green: '#509A39',
  surface: '#FFFFFF',
  serif: 'Fraunces, Georgia, serif',
  sans: 'Switzer, system-ui, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, monospace',
};

const FALLBACK_STATION_ID = '2091';

type SearchParams = { station?: string };

async function getForecast(stationId: string): Promise<ForecastSeries | null> {
  try {
    const list = await api.forecasts.list(stationId);
    return list.items[0] ?? null;
  } catch {
    return null;
  }
}

async function getMultiModel(stationId: string): Promise<ForecastSeries[]> {
  try {
    const list = await api.forecasts.list(stationId);
    return list.items;
  } catch {
    return [];
  }
}

async function getStations(): Promise<StationCard[]> {
  try {
    return await api.datasets.stations('swiss-river-1990');
  } catch {
    return [];
  }
}

async function getTimeseries(stationId: string, days = 60): Promise<TimeseriesPoint[]> {
  try {
    const r = await api.datasets.timeseries('swiss-river-1990', stationId, days);
    return r.points;
  } catch {
    return [];
  }
}

export default async function ForecastPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const activeStationId = params.station ?? FALLBACK_STATION_ID;

  const [forecast, multiModelForecasts, stations, tablePoints] = await Promise.all([
    getForecast(activeStationId),
    getMultiModel(activeStationId),
    getStations(),
    getTimeseries(activeStationId, 60),
  ]);

  const unit = forecast?.units ?? '°C';
  const stationsRows = stations.slice(0, 14).map(s => ({
    id: s.id,
    name: s.id,
    q: s.latest_value ?? 0,
    delta: s.delta_7d ?? 0,
    watch: s.id === activeStationId,
  }));

  const stamp = forecast
    ? forecast.forecast_at.slice(0, 16).replace('T', ' · ')
    : new Date().toISOString().slice(0, 16).replace('T', ' · ');

  const alertWindowStart = forecast ? new Date(forecast.timestamps[0]) : new Date(Date.now() - 24 * 3600 * 1000);
  const alertWindowEnd = forecast
    ? new Date(forecast.timestamps[Math.min(27, forecast.timestamps.length - 1)])
    : new Date();
  const alertWindow = {
    start: alertWindowStart.toISOString(),
    end: alertWindowEnd.toISOString(),
    t: (frac: number) =>
      new Date(alertWindowStart.getTime() + (alertWindowEnd.getTime() - alertWindowStart.getTime()) * frac).toISOString(),
  };

  return (
    <main
      style={{
        background: T.canvas,
        minHeight: '100vh',
        color: T.ink,
        fontFamily: T.sans,
        fontFeatureSettings: '"ss01" 1, "cv11" 1',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 32,
          borderBottom: `1px solid ${T.hairline}`,
          background: T.canvas,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: T.inkFaint,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 10,
        }}
      >
        <span style={{ color: T.ink, fontWeight: 600, letterSpacing: '0.04em' }}>
          LI
          <span
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontVariationSettings: '"WONK" 1, "opsz" 24, "wght" 700',
              color: T.bern,
              fontSize: 14,
              lineHeight: 0,
              position: 'relative',
              top: 1,
            }}
          >
            U
          </span>
          LIAN
        </span>
        <Sep />
        <span>Forecast · station {activeStationId}</span>
        <Sep />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: T.inkSoft }}>
          <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, boxShadow: `0 0 0 3px rgba(80,154,57,0.18)`, display: 'inline-block' }} />
          {stamp} UTC
        </span>
        <Sep />
        <span>swiss-river-1990 / wt {unit} / patchtst</span>
        {forecast?.real_data && (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: T.green,
              border: `1px solid ${T.green}`,
              borderRadius: 9999,
              padding: '1px 6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            real CSV
          </span>
        )}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.inkSoft,
            border: `1px solid ${T.inkFaint}`,
            borderRadius: 9999,
            padding: '1px 6px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          dashboard v1 · unsaved
        </span>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }} aria-label="keyboard shortcuts">
          <span><Kbd>⌘K</Kbd></span>
          <span><Kbd>b</Kbd>agent</span>
          <span><Kbd>t</Kbd>table</span>
          <span><Kbd>p</Kbd>picker</span>
          <span><Kbd>s</Kbd>save</span>
          <span><Kbd>?</Kbd></span>
        </nav>
      </header>

      <NarrativeBand activeStationId={activeStationId} forecast={forecast} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '268px minmax(0, 1fr) 376px',
          gap: 1,
          background: T.hairline,
          minHeight: 'calc(100vh - 32px - 96px)',
        }}
      >
        <div style={{ background: T.canvas }}>
          <Suspense fallback={null}>
            <StationsTable activeId={activeStationId} rows={stationsRows} unit={unit} />
          </Suspense>
        </div>

        <main
          style={{
            background: T.canvas,
            padding: '16px 18px 26px',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 52,
            gap: 12,
          }}
        >
          <DataTablePanel stationId={activeStationId} initialPoints={tablePoints} />

          <ChartPicker active="fan" />

          <section
            style={{
              gridColumn: '6 / span 7',
              gridRow: '2 / span 6',
              background: T.surface,
              border: `1px solid ${T.ink}`,
              borderRadius: 6,
              padding: '11px 15px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
            aria-labelledby="panel-fan-title"
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: `1px solid ${T.hairline}`, margin: '0 -15px 9px', padding: '0 15px 10px' }}>
              <h2
                id="panel-fan-title"
                style={{
                  fontFamily: T.serif,
                  fontVariationSettings: '"opsz" 56, "wght" 500',
                  fontSize: 30,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: T.ink,
                  margin: 0,
                }}
              >
                station {activeStationId}
              </h2>
              <p
                style={{
                  fontFamily: T.serif,
                  fontStyle: 'italic',
                  fontVariationSettings: '"opsz" 20, "wght" 400',
                  fontSize: 14,
                  color: T.inkMuted,
                  margin: 0,
                }}
              >
                Daily water-temperature with Q05–Q95 extrapolation
              </p>
              <div
                style={{
                  marginLeft: 'auto',
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                  textAlign: 'right',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ color: forecast?.real_data ? T.green : T.inkFaint }}>
                  {forecast?.real_data ? 'live → real CSV' : 'synthetic'}
                </div>
                <div>last obs {stamp} · {forecast?.horizon_hours ?? 0}h horizon · {unit}</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 4 }}>
                  <EditBtn title="open spec drawer (R8 spec — slide-over JSON / Python / API)" active>{'</>'}</EditBtn>
                  <EditBtn title="open vector canvas (drawio)">⌗</EditBtn>
                  <EditBtn title="palette">●●</EditBtn>
                  <EditBtn title="download SVG">↓</EditBtn>
                </div>
              </div>
            </div>
            {forecast ? (
              <div style={{ flex: 1, minHeight: 0 }}>
                <ForecastChart forecast={forecast} height={300} thresholds={[{ label: 'Summer ceil', value: 18 }]} withChrome={false} />
              </div>
            ) : (
              <ApiOffline />
            )}
          </section>

          <section style={panelStyle(['1 / span 5', '8 / span 4'])}>
            <PanelHeader title="forecast quality" sub={`station ${activeStationId} · ${unit}`} idTag="#kpi" kbd="k" />
            {forecast ? (
              <div style={{ flex: 1, minHeight: 0 }}>
                <KpiStrip forecast={forecast} />
              </div>
            ) : (
              <ApiOffline />
            )}
          </section>

          <section style={panelStyle(['6 / span 7', '8 / span 4'])}>
            <PanelHeader title="multi-model overlay" sub="patchtst · chronos-2" idTag="#mm" kbd="c" />
            {multiModelForecasts.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0 }}>
                <MultiModelOverlay forecasts={multiModelForecasts} height={200} />
              </div>
            ) : (
              <ApiOffline />
            )}
          </section>

          <MapPanel activeStationId={activeStationId} />

          <CorrelationPanel />

          <section style={panelStyle(['1 / span 12', '12 / span 5'])}>
            <PanelHeader title="alert severity · 24 h" sub="3 rules · click segment · SOP" idTag="#sev" kbd="a" />
            <div style={{ flex: 1, minHeight: 0 }}>
              <AlertRibbon
                rows={[
                  {
                    rule_id: 'wt-summer',
                    rule_name: `wt > 15 °C · any station (summer)`,
                    segments: [],
                  },
                  {
                    rule_id: 'wt-anomaly',
                    rule_name: `wt anomaly z > 2.5`,
                    segments: [{ start: alertWindow.t(0.5), end: alertWindow.t(0.6), severity: 'watch' }],
                  },
                  {
                    rule_id: 'cold-front',
                    rule_name: `cold front · Δ7d < −3 °C`,
                    segments: [
                      { start: alertWindow.t(0.1), end: alertWindow.t(0.25), severity: 'watch' },
                      { start: alertWindow.t(0.4), end: alertWindow.t(0.5), severity: 'elevated' },
                      { start: alertWindow.t(0.65), end: alertWindow.t(0.72), severity: 'critical' },
                    ],
                  },
                ]}
                windowStart={alertWindow.start}
                windowEnd={alertWindow.end}
              />
            </div>
          </section>

          <button
            style={{
              gridColumn: '1 / -1',
              gridRow: 'auto',
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              padding: '0 16px',
              border: `1px dashed ${T.hairlineStrong}`,
              borderRadius: 5,
              color: T.inkFaint,
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: T.serif, fontSize: 19, fontStyle: 'italic', color: T.ink }}>+</span>
            <span>add panel</span>
            <span style={{ display: 'flex', gap: 8 }}>
              {['scenario', 'peek strip', 'cohort by basin', 'report'].map(s => (
                <b
                  key={s}
                  style={{
                    color: T.inkSoft,
                    fontWeight: 500,
                    padding: '2px 7px',
                    border: `1px solid ${T.hairline}`,
                    borderRadius: 9999,
                    margin: '0 4px',
                    background: T.canvas,
                  }}
                >
                  {s}
                </b>
              ))}
            </span>
          </button>
        </main>

        <aside
          style={{
            background: T.canvas,
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 32,
            height: 'calc(100vh - 32px)',
          }}
        >
          <div
            style={{
              padding: '11px 17px 10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              alignItems: 'center',
              borderBottom: `1px solid ${T.hairline}`,
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.inkFaint,
                marginRight: 4,
              }}
            >
              pinned
            </span>
            {[`#table ${activeStationId}`, `#fan 14d`, `#mm 2 models`].map(c => (
              <span
                key={c}
                style={{
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  padding: '2px 7px',
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 9999,
                  color: T.inkSoft,
                  letterSpacing: '0.04em',
                  background: T.surface,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span
                  style={{
                    color: T.bern,
                    fontFamily: T.serif,
                    fontStyle: 'italic',
                    fontSize: 11,
                    lineHeight: 0,
                    position: 'relative',
                    top: 1,
                  }}
                >
                  ·
                </span>
                {c}
              </span>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatSidebar persona="bi" />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Sep() {
  return (
    <span aria-hidden style={{ color: T.inkQuiet }}>
      ·
    </span>
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

function EditBtn({ children, active, title }: { children: React.ReactNode; active?: boolean; title?: string }) {
  return (
    <button
      title={title}
      aria-label={title}
      style={{
        fontFamily: T.mono,
        fontSize: 10,
        padding: '1px 5px',
        border: `1px solid ${active ? T.ink : T.hairline}`,
        borderRadius: 3,
        color: active ? '#FBFBFA' : T.inkSoft,
        background: active ? T.ink : T.surface,
        cursor: 'pointer',
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function panelStyle(grid: [string, string]): React.CSSProperties {
  return {
    gridColumn: grid[0],
    gridRow: grid[1],
    background: T.surface,
    border: `1px solid ${T.hairline}`,
    borderRadius: 6,
    padding: '11px 13px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  };
}

function PanelHeader({ title, sub, idTag, kbd }: { title: string; sub: string; idTag: string; kbd?: string }) {
  return (
    <header style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: T.ink }}>{title}</span>
      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkFaint }}>{sub}</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.inkQuiet, letterSpacing: '0.04em' }}>{idTag}</span>
        {kbd && <Kbd>{kbd}</Kbd>}
      </span>
    </header>
  );
}

function ApiOffline() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.mono,
        fontSize: 11,
        color: T.inkFaint,
        textAlign: 'center',
        padding: 24,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      liulian-api offline · start with{' '}
      <code style={{ color: T.ink, marginLeft: 6 }}>bash start-local.sh</code>
    </div>
  );
}

export const metadata = {
  title: 'LIULIAN · Forecast',
  description: 'Probabilistic streamflow forecasts with Q05–Q95 prediction intervals.',
};
