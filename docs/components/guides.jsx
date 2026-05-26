// ──────────────────────────────────────────────────────────────
// LIULIAN — Guides modal · the seven canonical user stories
//   Each story is named (codename), persona-led,
//   mode-tagged (A/B/C), and lists the F-principles it invokes.
// ──────────────────────────────────────────────────────────────

function GuidesModal({ open, onClose, nav, mode }) {
  const [active, setActive] = React.useState(null);
  const [tab, setTab] = React.useState("flows"); // flows · modes · principles

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const story = STORIES.find(s => s.id === active);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(19,19,19,0.32)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "6vh", zIndex: 9000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 960, maxWidth: "94vw", maxHeight: "88vh",
        background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14,
        boxShadow: "0 28px 64px rgba(19,19,19,0.20)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* header */}
        <header style={{ padding: "20px 28px 16px", borderBottom: "1px solid var(--hairline)" }}>
          <div className="meta" style={{ marginBottom: 6 }}>Guides</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <h2 className="display" style={{ fontSize: 30, margin: 0 }}>Seven flows · three modes</h2>
            <span style={{ flex: 1 }} />
            <Segmented size="sm" value={tab} onChange={setTab} options={[
              { value: "flows", label: "flows" },
              { value: "modes", label: "modes" },
              { value: "principles", label: "principles" },
            ]} />
          </div>
        </header>

        {/* body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {tab === "flows"      && <FlowsTab active={active} setActive={setActive} story={story} onClose={onClose} nav={nav} />}
          {tab === "modes"      && <ModesTab mode={mode} />}
          {tab === "principles" && <PrinciplesTab />}
        </div>

        {/* footer */}
        <footer style={{ padding: "10px 28px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="meta">esc to close</span>
          <span className="meta">·</span>
          <span className="meta">? to reopen</span>
          <span className="meta">·</span>
          <span className="meta">⌘K for the command palette</span>
          <span style={{ flex: 1 }} />
          <span className="meta" style={{ color: "var(--ink-muted)" }}>active mode · <span style={{ color: "var(--bern)", fontWeight: 600 }}>{(mode || "C") + " · " + (MODES.find(m => m.id === (mode || "C")) || {}).label}</span></span>
        </footer>
      </div>
    </div>
  );
}

function FlowsTab({ active, setActive, story, onClose, nav }) {
  return (
    <>
      <nav style={{ width: 280, borderRight: "1px solid var(--hairline)", overflowY: "auto" }}>
        {STORIES.map(s => {
          const isOpen = s.id === active;
          return (
            <div key={s.id} onClick={() => setActive(s.id)} className={isOpen ? "ribbon-left" : ""}
              style={{ padding: "14px 18px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isOpen ? "var(--surface-shade)" : "transparent" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10.5, color: isOpen ? "var(--bern)" : "var(--ink-faint)", width: 16 }}>{(s.code || "").padStart(2, "0")}</span>
                <span style={{ fontSize: 14, fontWeight: isOpen ? 500 : 400, flex: 1 }}>{s.title}</span>
                {s.cn && <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", fontSize: 13, fontVariationSettings: '"opsz" 18' }}>{s.cn}</span>}
              </div>
              <div className="meta" style={{ marginTop: 4, marginLeft: 24, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{s.persona}</div>
            </div>
          );
        })}
      </nav>
      <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
        {!story ? <EmptyGuide /> : <StoryDetail story={story} onClose={onClose} nav={nav} />}
      </div>
    </>
  );
}

function StoryDetail({ story, onClose, nav }) {
  return (
    <article>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span className="mono" style={{ color: "var(--bern)", fontSize: 11 }}>● {(story.code || "").padStart(2, "0")}</span>
        <span className="meta">guide · {story.duration}</span>
        <span style={{ flex: 1 }} />
        <span className="meta">modes · {story.modes.join(" / ")}</span>
        {story.principles && <span className="meta">principles · {story.principles.join(" · ")}</span>}
      </div>
      <h2 className="display" style={{ fontSize: 34, margin: 0, fontVariationSettings: '"opsz" 40' }}>
        {story.title}
        {story.cn && <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", fontSize: 22, marginLeft: 14, fontVariationSettings: '"opsz" 26' }}>{story.cn}</span>}
      </h2>
      <div className="display-italic" style={{ fontSize: 16, color: "var(--ink-muted)", marginTop: 8 }}>{story.persona}</div>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.55, color: "var(--ink-strong)", margin: "20px 0 28px", maxWidth: "58ch", fontStyle: "italic" }}>{story.setup}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
        <div>
          <RunningHead label="Steps" meta={`${story.steps.length} total`} />
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {story.steps.map((s, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", paddingTop: 2 }}>{(i + 1).toString().padStart(2, "0")}</span>
                <span style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside>
          <RunningHead label="Fused principles used" meta="hover for detail" />
          {(story.principles || []).map(pid => {
            const p = FUSED_PRINCIPLES.find(x => x.id === pid);
            if (!p) return null;
            return (
              <div key={pid} style={{ padding: "10px 0", borderTop: "1px dashed var(--hairline)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--bern)", fontWeight: 600 }}>{p.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--serif)" }}>{p.line}</div>
              </div>
            );
          })}
        </aside>
      </div>

      <div style={{ display: "flex", marginTop: 28, gap: 10, alignItems: "center", paddingTop: 18, borderTop: "1px solid var(--hairline)" }}>
        <button className="btn primary" onClick={() => { nav(story.start.page); onClose(); }}>Start the flow →</button>
        <span className="meta">{story.start.note}</span>
        <span style={{ flex: 1 }} />
        <button className="btn ghost sm">remind me later</button>
        <button className="btn ghost sm">copy steps</button>
      </div>
    </article>
  );
}

function ModesTab({ mode }) {
  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", flex: 1 }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", margin: "0 0 28px", maxWidth: "58ch", fontStyle: "italic" }}>
        Every flow is offered in three modes. The same goal, three interaction shapes. Mode C — Fused — is the default and the headline; modes A and B remain available for users who prefer pure controls or pure conversation.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {MODES.map(m => {
          const isActive = m.id === (mode || "C");
          return (
            <div key={m.id} className="card" style={{ padding: "20px 22px", borderColor: isActive ? "var(--bern)" : "var(--hairline)", borderWidth: isActive ? 1.5 : 1, background: isActive ? "var(--bern-tint)" : "var(--surface)", position: "relative" }}>
              {isActive && <span className="meta" style={{ position: "absolute", top: 12, right: 16, color: "var(--bern)" }}>● active</span>}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 24, fontWeight: 500, color: isActive ? "var(--bern-deep)" : "var(--ink)" }}>{m.id}</span>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, margin: 0, fontVariationSettings: '"opsz" 28' }}>{m.label}</h3>
              </div>
              <div className="meta" style={{ marginBottom: 12, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{m.sub}</div>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0 }}>{m.detail}</p>
              {m.id === "C" && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--hairline)" }}>
                  <div className="meta" style={{ marginBottom: 6 }}>Six principles</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {FUSED_PRINCIPLES.map(p => <span key={p.id} className="mono" style={{ fontSize: 10.5, padding: "2px 6px", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 4, color: "var(--ink-soft)" }}>{p.id}</span>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrinciplesTab() {
  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", flex: 1 }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", margin: "0 0 28px", maxWidth: "58ch", fontStyle: "italic" }}>
        Six principles distinguish the Fused mode from "chatbot in a sidebar plus controls in the middle". Every fused interaction in LIULIAN satisfies at least three of these.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {FUSED_PRINCIPLES.map(p => (
          <div key={p.id} className="card" style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 500, color: "var(--bern)" }}>{p.id}</span>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, margin: 0, fontVariationSettings: '"opsz" 24' }}>{p.name}</h3>
            </div>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0, maxWidth: "44ch" }}>{p.line}</p>
            <div className="meta" style={{ marginTop: 12, color: "var(--ink-muted)" }}>used in stories · {STORIES.filter(s => (s.principles || []).includes(p.id)).map(s => (s.code || "?").padStart(2, "0")).join(" · ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyGuide() {
  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="display" style={{ fontSize: 32, margin: 0, fontVariationSettings: '"opsz" 36' }}>Pick a flow on the left.</h2>
      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", margin: "20px 0", maxWidth: "56ch" }}>
        Each one is a canonical path through LIULIAN, persona-led, with concrete steps and the Fused-mode principles it invokes. Click <strong>Start</strong> to be dropped at the first step.
      </p>
      <div className="meta" style={{ marginBottom: 12 }}>Or browse the second + third tabs above</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)" }}>
        <li style={{ padding: "6px 0", borderTop: "1px dashed var(--hairline)" }}>· <strong>Modes</strong> — Classical (A) · AI-first (B) · Fused (C, default).</li>
        <li style={{ padding: "6px 0", borderTop: "1px dashed var(--hairline)" }}>· <strong>Principles</strong> — the six (F1–F6) that define what makes Fused different.</li>
      </ul>
    </div>
  );
}

Object.assign(window, { GuidesModal });
