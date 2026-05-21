// ──────────────────────────────────────────────────────────────
// LIULIAN — Forecast canvas (live BI surface)
// ──────────────────────────────────────────────────────────────

function ForecastPage({ onAgent, nav }) {
  const [activeId, setActiveId] = React.useState("aare-bern");
  const active = STATIONS.find(s => s.id === activeId);
  const [model, setModel] = React.useState("patchtst");
  const [horizon, setHorizon] = React.useState("72h");
  const [overlay, setOverlay] = React.useState("none");

  return (
    <div className="page-enter" style={{
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 14, padding: 16, alignItems: "start",
    }}>
      {/* ───────────── station list ───────────── */}
      <nav className="card" style={{ padding: 0, maxHeight: "calc(100vh - var(--header-h) - var(--sub-h) - 32px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="meta">Stations · {STATIONS.length}</span>
          <span style={{ flex: 1 }} />
          <span className="meta" style={{ color: "var(--ink-faint)" }}><kbd>j</kbd> <kbd>k</kbd></span>
        </header>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--hairline)" }}>
          <input placeholder="Filter…" style={{ width: "100%", border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontSize: 12.5, fontFamily: "var(--sans)", outline: "none", background: "var(--canvas-warm)" }} />
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto" }}>
          {STATIONS.map(s => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id} onClick={() => setActiveId(s.id)}
                className={isActive ? "ribbon-left" : ""}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 6,
                  padding: "10px 14px 10px 16px", cursor: "pointer", borderBottom: "1px solid var(--hairline)",
                  background: isActive ? "var(--surface-shade)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}>
                <div>
                  <div style={{ fontSize: 13 }}>{s.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{s.id} · {s.alt} m</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 12, color: s.status === "elevated" ? "var(--bern-deep)" : s.status === "watch" ? "var(--amber)" : "var(--ink-muted)" }}>{s.mean.toFixed(0)}</div>
                  <div className="meta" style={{ fontSize: 9, marginTop: 1, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>m³/s</div>
                </div>
              </li>
            );
          })}
        </ul>
        <footer style={{ padding: "8px 14px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="meta" style={{ whiteSpace: "nowrap" }}>28 nodes · 35 edges</span>
        </footer>
      </nav>

      {/* ───────────── main column ───────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {/* title band */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="meta" style={{ marginBottom: 6 }}>Station · {active.id} · {active.alt} m · BAFU</div>
            <h1 className="display" style={{ fontSize: 44, margin: 0 }}>{active.name}</h1>
            <p className="display-italic" style={{ margin: "8px 0 0", fontSize: 16, color: "var(--ink-muted)" }}>
              {horizon} forecast with Q05–Q95 prediction intervals, in m³/s ·&nbsp;
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>forecast_at 2026-05-13 05:00 UTC</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Segmented options={["24h", "72h", "168h"]} value={horizon} onChange={setHorizon} />
            <Segmented options={[{ value: "patchtst", label: "PatchTST" }, { value: "chronos-2", label: "Chronos-2" }, { value: "lstm", label: "LSTM" }]} value={model} onChange={setModel} />
            <button className="btn">Compare</button>
            <button className="btn primary" onClick={onAgent}>Ask agent <kbd style={{ background: "rgba(255,255,255,.16)", color: "#fff", borderColor: "rgba(255,255,255,.24)" }}>b</kbd></button>
          </div>
        </div>

        {/* map + forecast chart row · chart is primary */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
          {/* small map · inset */}
          <div className="card" style={{ position: "relative", height: 412, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 12, left: 14, zIndex: 2 }}>
              <span className="meta">Swiss river network · 28 stations</span>
            </div>
            <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
              {/* country mass */}
              <path d="M 60,240 Q 50,200 80,160 Q 110,120 160,110 Q 220,98 280,108 Q 340,116 400,98 Q 460,80 520,92 Q 580,104 630,124 Q 690,148 720,190 Q 740,238 700,260 Q 640,278 560,272 Q 480,266 400,280 Q 320,294 240,282 Q 160,272 100,262 Z" fill="#F2F0EA" stroke="#DEDCD4" strokeWidth="1"/>
              {/* rivers */}
              <path d="M 100,240 Q 200,200 320,184 Q 440,170 540,140" stroke="#94989D" strokeWidth="1.2" fill="none"/>
              <path d="M 540,140 Q 600,138 660,150" stroke="#94989D" strokeWidth="1.4" fill="none"/>
              <path d="M 380,260 Q 320,250 240,238 Q 160,228 100,240" stroke="#94989D" strokeWidth="1" fill="none"/>
              <path d="M 280,140 Q 320,180 380,200 Q 460,220 540,210" stroke="#C0C2C5" strokeWidth="0.8" fill="none" strokeDasharray="3 3" />
              {/* contour-like alt rings */}
              <ellipse cx="400" cy="200" rx="200" ry="50" fill="none" stroke="#E8E7E2" strokeWidth="0.5" strokeDasharray="2 5" />
              <ellipse cx="400" cy="200" rx="280" ry="80" fill="none" stroke="#E8E7E2" strokeWidth="0.5" strokeDasharray="2 5" />

              {STATIONS.map(s => {
                const isActive = s.id === activeId;
                const color = s.status === "elevated" ? "#B00010" : s.status === "watch" ? "#946400" : "#131313";
                return (
                  <g key={s.id} onClick={() => setActiveId(s.id)} style={{ cursor: "pointer" }}>
                    {isActive && <circle cx={s.x} cy={s.y + 30} r="14" fill="none" stroke="#E20613" strokeWidth="1"/>}
                    <circle cx={s.x} cy={s.y + 30} r={isActive ? 5 : 3.5} fill={isActive ? "#E20613" : color} />
                    {isActive && <text x={s.x + 12} y={s.y + 34} fontSize="10" fontFamily="JetBrains Mono" fill="#131313">{s.id}</text>}
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", gap: 6 }}>
              <button className="btn sm ghost">+</button>
              <button className="btn sm ghost">−</button>
              <button className="btn sm ghost">⤢</button>
            </div>
          </div>

          {/* forecast chart — primary */}
          <div className="card" style={{ padding: "16px 20px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span className="display-italic" style={{ fontSize: 16 }}>72-hour forecast · {model}</span>
              <span className="meta" style={{ marginLeft: 10 }}>now · 05:00 UTC · refreshed 8 min ago</span>
              <span style={{ flex: 1 }} />
              <Segmented options={[{ value: "none", label: "—" }, { value: "obs", label: "+obs" }, { value: "compare", label: "+chronos" }]} value={overlay} onChange={setOverlay} size="sm" />
            </div>
            <ForecastChart id="fc-main" horizon={72} seed={(activeId + model).length * 7} baseValue={active.mean} height={380} />
          </div>
        </div>

        {/* KPI strip — only the three that matter */}
        <div className="card" style={{ display: "flex", padding: 0, overflow: "hidden" }}>
          <KPI label="MAE"           value="8.42"  unit="m³/s" sub="−0.37 vs lstm · run r-7c83" />
          <KPI label="RMSE"          value="11.27" unit="m³/s" sub="−1.92 vs lstm" />
          <KPI label="Coverage @ 90" value="88.5"  unit="%"    sub="target 90.0 · 14d rolling" />
        </div>

        {/* lower row · expanders */}
        <ExpandableRow
          title="Alerts"
          summary={<><strong style={{ color: "var(--bern-deep)" }}>1 critical</strong> <span className="meta">·</span> 1 watch <span className="meta">·</span> 1 elevated <span className="meta">· next firing window Thu 14:00</span></>}
          onAgent={onAgent}
        >
          {[
            { name: "Basel · watch",       sub: "rhine-basel",  segs: [{ kind: "watch",    l: 12, w: 18 }, { kind: "watch", l: 55, w: 9 }] },
            { name: "Bern · Q95 elevated", sub: "aare-bern",    segs: [{ kind: "elevated", l: 28, w: 14 }, { kind: "elevated", l: 64, w: 22 }] },
            { name: "Bern · Q95 critical", sub: "aare-bern",    segs: [{ kind: "critical", l: 72, w: 6 }] },
            { name: "Hagneck · low-flow",  sub: "aare-hagneck", segs: [{ kind: "watch",    l: 4,  w: 6 }] },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "220px 1fr", alignItems: "center", gap: 12, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: row.segs.some(s => s.kind !== "watch") ? 500 : 400, color: row.segs.some(s => s.kind === "elevated" || s.kind === "critical") ? "var(--bern-deep)" : "var(--ink)" }}>{row.name}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{row.sub}</div>
              </div>
              <div style={{ position: "relative", height: 14, background: "var(--surface-shade)", border: "1px solid var(--hairline)", borderRadius: 4, overflow: "hidden" }}>
                {Array.from({ length: 5 }, (_, k) => <div key={k} style={{ position: "absolute", left: `${k * 25}%`, top: 0, bottom: 0, width: 1, background: "var(--hairline)" }} />)}
                {row.segs.map((seg, k) => (
                  <div key={k} style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `${seg.l}%`, width: `${seg.w}%`,
                    background: seg.kind === "critical" ? "var(--bern)" : seg.kind === "elevated" ? "var(--bern-tint)" : "var(--amber-pale)",
                    border: "1px solid " + (seg.kind === "critical" ? "var(--bern-deep)" : seg.kind === "elevated" ? "var(--bern-deep)" : "var(--amber)"),
                  }} />
                ))}
              </div>
            </div>
          ))}
        </ExpandableRow>

        <ExpandableRow
          title="Upstream · downstream"
          summary={<><span className="mono">aare-thun ↑ 287</span> <span className="meta">·</span> <span className="mono">this 412</span> <span className="meta">·</span> <span className="mono">aare-hagneck ↓ 360</span> <span className="meta">·</span> <span className="mono">rhine-basel ↓ 1071</span></>}
        >
          {[
            { name: "Aare · Thun",     id: "aare-thun",     dir: "↑ up",   v: 287.0 },
            { name: "Aare · Bern",     id: "aare-bern",     dir: "● this", v: 412.4 },
            { name: "Aare · Hagneck",  id: "aare-hagneck",  dir: "↓ down", v: 360.2 },
            { name: "Rhine · Basel",   id: "rhine-basel",   dir: "↓ down", v: 1071  },
          ].map((row, i) => (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "12px 1fr 80px 70px", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)" }}>
              <span className="meta" style={{ color: row.dir.startsWith("●") ? "var(--bern)" : "var(--ink-faint)", letterSpacing: 0, fontFamily: "var(--mono)" }}>{row.dir.split(" ")[0]}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: row.dir.startsWith("●") ? 500 : 400 }}>{row.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{row.id}</div>
              </div>
              <Sparkline data={Array.from({ length: 24 }, (_, j) => row.v * (1 + Math.sin(j / 4 + i) * 0.08))} stroke="var(--ink)" lastDot />
              <div className="mono" style={{ fontSize: 12, textAlign: "right" }}>{row.v.toFixed(0)} <span style={{ color: "var(--ink-faint)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>m³/s</span></div>
            </div>
          ))}
        </ExpandableRow>

        <NextSteps title="Next from this station" items={[
          { lbl: "Save as report panel",     hint: "drop into the weekly brief", run: () => nav("reports") },
          { lbl: "Re-run with fresh data",   hint: "force inference now",        run: () => nav("inference") },
          { lbl: "Ask agent for commentary", hint: "agent will draft a paragraph", run: onAgent },
        ]} />
      </div>
    </div>
  );
}

// ── ExpandableRow — collapsible section with one-line summary ───────────
function ExpandableRow({ title, summary, children, onAgent }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="card" style={{ padding: "0" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", border: "none", background: "transparent",
        padding: "12px 18px", cursor: "pointer", textAlign: "left",
      }}>
        <span className="display-italic" style={{ fontSize: 16, color: "var(--ink)", minWidth: 200 }}>{title}</span>
        <span style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)" }}>{summary}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--hairline)" }}>{children}</div>}
    </div>
  );
}
Object.assign(window, { ForecastPage });
