// ──────────────────────────────────────────────────────────────
// LIULIAN — The Doorway (initial landing)
//   Shown when there is no active project / first-time visit.
//   Minimal chrome: brand top-left · palette + guides top-right.
//   Three to four panels for concrete next actions; chat composer
//   below them; everything else hidden.
// ──────────────────────────────────────────────────────────────

function DoorwayPage({ onPick, onChat, openWizard, openSidebar, setGuidesOpen, setPaletteOpen }) {
  const [hoverId, setHoverId] = React.useState(null);
  const [input, setInput] = React.useState("");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      background: "var(--canvas-warm)",
    }}>
      {/* slim chrome — brand · palette · guides · skip-into-app */}
      <header style={{
        height: 56, padding: "0 32px",
        display: "flex", alignItems: "center", gap: 16,
        borderBottom: "1px solid var(--hairline)",
      }}>
        <a style={{ display: "flex", alignItems: "baseline", gap: 1, color: "var(--ink)", textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, fontVariationSettings: '"opsz" 28' }}>LI</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, fontVariationSettings: '"opsz" 28, "WONK" 1' }}>U</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, fontVariationSettings: '"opsz" 28' }}>LIAN</span>
        </a>
        <span style={{ flex: 1 }} />
        <button className="btn ghost sm" onClick={() => setGuidesOpen(true)}>
          <Icon name="help" size={13} />
          <span className="meta" style={{ color: "var(--ink-muted)" }}>guides</span>
        </button>
        <button className="btn ghost sm" onClick={() => setPaletteOpen(true)}>
          <kbd>⌘</kbd><kbd>K</kbd>
          <span className="meta" style={{ color: "var(--ink-muted)" }}>palette</span>
        </button>
        <button className="btn ghost sm" onClick={openSidebar} title="enter the workspace">
          <span className="meta" style={{ color: "var(--ink-muted)" }}>enter workspace</span>
          <Icon name="arrow-right" size={12} />
        </button>
      </header>

      {/* hero · single Fraunces sentence */}
      <main style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "8vh 32px 6vh",
        maxWidth: 1080, margin: "0 auto", width: "100%",
      }}>
        <div className="meta" style={{ marginBottom: 14, color: "var(--ink-muted)" }}>The Doorway</div>
        <h1 className="display" style={{
          fontSize: 52, margin: 0, textAlign: "center",
          fontVariationSettings: '"opsz" 64',
          maxWidth: "20ch", lineHeight: 1.08,
        }}>
          What brings you here{" "}
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontVariationSettings: '"opsz" 64, "SOFT" 50' }}>today</span>?
        </h1>
        <p style={{
          fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, lineHeight: 1.55,
          color: "var(--ink-muted)", maxWidth: "52ch", textAlign: "center", margin: "16px 0 44px",
        }}>
          Pick a route, drop a file, or just describe what you want to do. We'll set the rest up.
        </p>

        {/* four panels */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
          width: "100%",
        }}>
          {ENTRIES.map(e => {
            const hovered = hoverId === e.id;
            return (
              <button key={e.id} onClick={() => onPick(e.id)}
                onMouseEnter={() => setHoverId(e.id)} onMouseLeave={() => setHoverId(null)}
                style={{
                  textAlign: "left",
                  background: hovered ? "var(--surface)" : "var(--surface)",
                  border: "1px solid " + (hovered ? "var(--bern)" : "var(--hairline)"),
                  borderRadius: 12,
                  padding: "22px 22px 20px",
                  cursor: "pointer",
                  fontFamily: "var(--sans)", fontSize: 14,
                  color: "var(--ink)",
                  display: "flex", flexDirection: "column",
                  transition: "border-color 150ms var(--ease), background 150ms var(--ease)",
                  minHeight: 240,
                  position: "relative",
                }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: hovered ? "var(--bern-tint)" : "var(--surface-shade)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: hovered ? "var(--bern)" : "var(--ink-muted)",
                  }}>
                    <Icon name={e.icon} size={18} strokeWidth={1.5} />
                  </span>
                  <span style={{ flex: 1 }} />
                  <span className="meta">{e.duration}</span>
                </div>
                <h3 className="display" style={{ fontSize: 22, margin: 0, fontVariationSettings: '"opsz" 28' }}>{e.title}</h3>
                <p style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-soft)", margin: "8px 0 12px" }}>{e.sub}</p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)", margin: 0, flex: 1 }}>{e.body}</p>
                <div style={{ display: "flex", alignItems: "center", marginTop: 14, gap: 8 }}>
                  <span className="meta" style={{ color: hovered ? "var(--bern)" : "var(--ink-muted)", letterSpacing: "0.04em" }}>{e.cta}</span>
                  <span style={{ flex: 1 }} />
                  <span className="meta" style={{ color: "var(--ink-faint)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>needs · {e.needs}</span>
                </div>
              </button>
            );
          })}
        </section>

        {/* OR · chat composer */}
        <section style={{ width: "100%", marginTop: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            <span className="meta">or — tell the agent</span>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>
          <form onSubmit={e => { e.preventDefault(); onChat(input); }} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 30, height: 30, borderRadius: 9999, background: "var(--bern)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", flex: "0 0 auto" }}>
              <Icon name="agent" size={14} color="#fff" />
            </span>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="e.g.  I have a CSV with daily water-temperature for three stations · train forecasting models on it"
              style={{
                flex: 1, border: "1px solid var(--hairline-strong)", borderRadius: 10,
                padding: "14px 16px", fontFamily: "var(--sans)", fontSize: 15,
                outline: "none", background: "var(--surface)",
              }} />
            <button type="submit" className="btn primary" style={{ padding: "12px 18px" }} disabled={!input.trim()}>
              Ask <Icon name="arrow-right" size={11} color="#fff" />
            </button>
          </form>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, justifyContent: "center" }}>
            {[
              "I have a CSV with daily water-temp for 3 stations",
              "Train a forecasting model on swiss-river-1990",
              "Compare PatchTST and Chronos-2 zero-shot",
              "Detect anomalies in last week's traffic data",
            ].map(s => (
              <button key={s} onClick={() => { setInput(s); onChat(s); }}
                style={{
                  fontFamily: "var(--sans)", fontSize: 12.5,
                  padding: "5px 10px", border: "1px solid var(--hairline-strong)",
                  borderRadius: 9999, background: "var(--surface)", color: "var(--ink-muted)",
                  cursor: "pointer",
                }}>{s}</button>
            ))}
          </div>
        </section>
      </main>

      {/* footer note · what is this? */}
      <footer style={{
        padding: "16px 32px", borderTop: "1px solid var(--hairline)",
        display: "flex", alignItems: "center", gap: 12, color: "var(--ink-muted)", fontSize: 12,
      }}>
        <span className="meta">LIULIAN</span>
        <span className="meta">·</span>
        <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--ink-soft)" }}>An ML platform for time series, tabular, graph, and beyond — built around natural interaction.</span>
        <span style={{ flex: 1 }} />
        <a onClick={() => setGuidesOpen(true)} style={{ cursor: "pointer", color: "var(--ink-muted)" }}>
          <span className="meta">how this works <Icon name="arrow-right" size={10} /></span>
        </a>
      </footer>
    </div>
  );
}

Object.assign(window, { DoorwayPage });
