// ──────────────────────────────────────────────────────────────
// LIULIAN — Reports (saved BI canvases)
// ──────────────────────────────────────────────────────────────

function ReportsPage({ onAgent }) {
  const [active, setActive] = React.useState("swiss-river-overview");
  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle kicker="Catalog" title="Reports"
        specimen={`${REPORTS.length} reports · 2 public · last updated 2026-05-12`}
        right={<><button className="btn">+ New report</button><button className="btn primary" onClick={onAgent}>Ask agent to draft one</button></>} />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)" }}>
            <span className="meta">{REPORTS.length} reports</span>
          </div>
          {REPORTS.map(r => {
            const isActive = r.id === active;
            return (
              <div key={r.id} onClick={() => setActive(r.id)} className={isActive ? "ribbon-left" : ""}
                style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isActive ? "var(--surface-shade)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, flex: 1 }}>{r.name}</div>
                  {r.public ? <span className="meta" style={{ color: "var(--bern)" }}>● public</span> : <span className="meta">private</span>}
                </div>
                <div className="meta" style={{ marginTop: 4 }}>{r.panels} panels · {r.viewers} viewers · {r.updated}</div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: "0" }}>
          {/* report header — looks like an editorial masthead */}
          <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--hairline)", background: "var(--canvas-warm)" }}>
            <div className="meta" style={{ marginBottom: 8 }}>LIULIAN · public report · swiss-river-overview · since 2026-05-12</div>
            <h2 className="display" style={{ fontSize: 38, margin: 0 }}>Swiss-River · Overview</h2>
            <p className="display-italic" style={{ margin: "10px 0 0", fontSize: 16, color: "var(--ink-muted)", maxWidth: "60ch" }}>
              A weekly running brief of the 28-station forecast set. Updated every Monday at 06:00 UTC by the BI agent. Read-only for the public link below.
            </p>
            <div style={{ display: "flex", marginTop: 14, gap: 8, alignItems: "center" }}>
              <code className="mono" style={{ flex: "0 0 auto", padding: "5px 8px", border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", fontSize: 11.5 }}>https://liulian.app/r/swiss-river-overview</code>
              <button className="btn sm">copy</button>
              <button className="btn sm">↓ PDF</button>
              <button className="btn sm">↓ PNG</button>
              <span style={{ flex: 1 }} />
              <span className="meta">14 unique viewers · 7d</span>
            </div>
          </div>

          {/* report body — bento of panels */}
          <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 14 }}>
            <div className="card" style={{ padding: 14, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
                <div className="meta meta-strong">Panel 01 · Network overview · 28 stations · 7-day discharge</div>
                <span style={{ flex: 1 }} />
                <span className="meta">updated 05:08</span>
              </div>
              <GenericLine id="rp-1" data={Array.from({ length: 168 }, (_, i) => 500 + Math.sin(i / 8) * 60 + Math.sin(i / 23) * 40)} color="#131313" fill="rgba(226,6,19,0.08)" height={170} />
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="meta meta-strong" style={{ marginBottom: 10 }}>Panel 02 · Bern Q95 (72 h)</div>
              <ForecastChart id="rp-2" height={200} seed={92} baseValue={412.4} />
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="meta meta-strong" style={{ marginBottom: 10 }}>Panel 03 · Basel watch-band</div>
              <ForecastChart id="rp-3" height={200} seed={1011} baseValue={1071} />
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="meta meta-strong" style={{ marginBottom: 10 }}>Panel 04 · Skill drift · MAE</div>
              <GenericLine id="rp-4" data={Array.from({ length: 30 }, (_, i) => 8 + Math.sin(i / 4) * 0.5 + (i > 20 ? (i - 20) * 0.18 : 0))} color="#E20613" fill="rgba(226,6,19,0.08)" height={200} />
            </div>

            <div className="card" style={{ padding: "14px 18px", gridColumn: "1 / -1" }}>
              <div className="meta meta-strong" style={{ marginBottom: 10 }}>Panel 05 · Agent commentary (auto)</div>
              <p style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0, maxWidth: "70ch" }}>
                Discharge across the Aare basin sits 6.4 % above the trailing 7-day mean. Bern's Q95 forecast trends gently up over the next 36 hours — the 90 % band tops out at 437 m³/s, well below the watch threshold of 600. <br /><br />
                Basel's <em>watch</em> band remains active intermittently; the next likely re-entry window is between Thursday 14:00 and 18:00 UTC. PatchTST's projected MAE has risen 0.74 over the past two weeks; the agent recommends queuing a re-train against the new May shard.
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
                <span className="meta">drafted by · agent · Claude Haiku 4.5</span>
                <span style={{ flex: 1 }} />
                <button className="btn sm">edit text</button>
                <button className="btn sm">regenerate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsPage });
