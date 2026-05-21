// ──────────────────────────────────────────────────────────────
// LIULIAN — Inference batches
// ──────────────────────────────────────────────────────────────

function InferencePage({ onAgent }) {
  const items = [
    { id: "f-7c83", station: "aare-bern",    model: "patchtst",  h: "72h", at: "2026-05-13 05:00", mean: 412.4, q95: 437.1 },
    { id: "f-7c84", station: "aare-bern",    model: "chronos-2", h: "72h", at: "2026-05-13 05:00", mean: 408.9, q95: 434.6 },
    { id: "f-7c85", station: "aare-thun",    model: "patchtst",  h: "72h", at: "2026-05-13 05:00", mean: 287.0, q95: 311.0 },
    { id: "f-7c86", station: "rhine-basel",  model: "patchtst",  h: "72h", at: "2026-05-13 05:00", mean: 1071,  q95: 1190 },
    { id: "f-7c87", station: "reuss-luzern", model: "patchtst",  h: "72h", at: "2026-05-13 05:00", mean: 290.7, q95: 318.4 },
    { id: "f-7c88", station: "limmat-zurich",model: "patchtst",  h: "72h", at: "2026-05-13 05:00", mean: 230.5, q95: 252.0 },
  ];
  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle kicker="Studio · Inference" title="Forecast batches"
        specimen="auto-runs every 60 min · last batch 05:08 UTC · 28 forecasts emitted"
        right={<>
          <button className="btn">+ Schedule batch</button>
          <button className="btn">Run zero-shot now</button>
          <button className="btn primary" onClick={onAgent}>Ask agent</button>
        </>} />

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", display: "flex", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)", alignItems: "center" }}>
            <span className="meta">{items.length} forecasts · {new Set(items.map(i => i.station)).size} stations · 2 models</span>
            <span style={{ flex: 1 }} />
            <Segmented size="sm" options={["recent", "by q95", "by station"]} value="recent" onChange={() => {}} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 100px 70px 130px 100px 100px 70px", padding: "10px 16px", borderBottom: "1px solid var(--hairline)" }}>
            {["forecast", "model", "h", "at (UTC)", "mean", "Q95", "preview"].map((h, i) => <span key={i} className="meta">{h}</span>)}
          </div>
          {items.map((it, i) => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 100px 70px 130px 100px 100px 70px", padding: "12px 16px", borderBottom: i === items.length - 1 ? "none" : "1px solid var(--hairline)", alignItems: "center" }}>
              <NameWithId name={it.station} id={it.id} idLabel="forecast" />
              <span className="mono" style={{ fontSize: 12 }}>{it.model}</span>
              <span className="mono" style={{ fontSize: 12 }}>{it.h}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{it.at}</span>
              <span className="mono" style={{ fontSize: 12, textAlign: "right" }}>{it.mean.toFixed(1)}</span>
              <span className="mono" style={{ fontSize: 12, textAlign: "right", color: it.q95 > 1100 ? "var(--bern-deep)" : it.q95 > 430 ? "var(--bern-deep)" : "var(--ink-soft)", fontWeight: it.q95 > 430 ? 500 : 400 }}>{it.q95.toFixed(1)}</span>
              <Sparkline data={Array.from({ length: 24 }, (_, j) => it.mean + Math.sin(j / 4) * (it.q95 - it.mean) * 0.4)} stroke="var(--bern)" lastDot width={60} />
            </div>
          ))}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center" }}>
            <span className="meta">batch · b-2026-05-13-05 · 1m 22s</span>
            <span style={{ flex: 1 }} />
            <button className="btn sm">Open in Forecast canvas →</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: "14px 18px" }}>
            <RunningHead label="Schedule" meta="cron-style" />
            {[
              { name: "swiss-river · hourly",       cron: "0 * * * *",  next: "06:00", state: "active" },
              { name: "etth1 · daily backfill",     cron: "15 2 * * *", next: "02:15", state: "active" },
              { name: "weather-jena · 6h",          cron: "0 */6 * * *",next: "06:00", state: "paused" },
            ].map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 50px", gap: 8, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 12.5 }}>
                <span>{s.name}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{s.cron}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>next {s.next}</span>
                <span style={{ fontStyle: s.state === "active" ? "normal" : "italic", color: s.state === "active" ? "var(--ink)" : "var(--ink-muted)" }}>{s.state}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "14px 18px" }}>
            <RunningHead label="Skill drift" meta="MAE rolling · 14d" />
            <GenericLine id="drift-1" data={Array.from({ length: 30 }, (_, i) => 8 + Math.sin(i / 4) * 0.5 + (i > 20 ? (i - 20) * 0.18 : 0))} color="#E20613" fill="rgba(226,6,19,0.08)" height={130} />
            <div className="meta" style={{ marginTop: 8 }}>↑ 0.74 vs. previous 14 days · consider re-train</div>
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { InferencePage });
