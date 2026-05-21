// ──────────────────────────────────────────────────────────────
// LIULIAN — app shell · running header · sidebar · routing
//   New: Today landing · project switcher · Guides · collapsible
// ──────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#E20613",
  "density": "comfortable",
  "showMarginNotes": true,
  "agentOpenByDefault": false,
  "monoNumbers": true
}/*EDITMODE-END*/;

function App() {
  // The very first thing a visitor sees is the Doorway — no chrome.
  // After they pick (or "enter workspace"), the full app loads.
  const [entered, setEntered]       = React.useState(false);
  const [wizard, setWizard]         = React.useState(null); // null · "create-project" · "one-shot"
  const [page, setPage]             = React.useState("today");
  const [project, setProject]       = React.useState("aare-hydro");
  const [mode, setMode]             = React.useState("C");
  const [agentOpen, setAgentOpen]   = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [guidesOpen, setGuidesOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // global keyboard
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); return; }
      if (meta && e.key === "\\")              { e.preventDefault(); setSidebarCollapsed(c => !c); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setGuidesOpen(false); return; }
      if (e.key === "?")      { setGuidesOpen(o => !o); return; }
      if (!entered) return; // shortcuts below only after entering the workspace
      if (e.key.toLowerCase() === "b" && !meta) { setAgentOpen(o => !o); return; }
      const KEY_MAP = { "0": "today", "1": "live", "2": "data", "3": "visualize", "4": "train", "5": "predict", "6": "reports", "7": "models", "8": "library", "a": "agent", ",": "settings" };
      const target = KEY_MAP[e.key];
      if (target) { setPage(target); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--bern", t.accent);
  }, [t.accent]);

  const ctx = { nav: (p) => { setEntered(true); setPage(p); }, setAgent: setAgentOpen, setGuides: setGuidesOpen };
  const onAgent = () => setAgentOpen(true);
  const active = NAV.find(n => n.id === page) || NAV[0];

  function handleDoorwayPick(entryId) {
    if (entryId === "create-project") { setWizard("create-project"); return; }
    if (entryId === "one-shot")       { setWizard("one-shot"); return; }
    if (entryId === "open-recent")    { setEntered(true); setPage("today"); return; }
    if (entryId === "try-demo")       { setEntered(true); setPage("live"); return; }
  }
  function handleChat(text) {
    // route to a most-likely intent based on keywords.
    const t = (text || "").toLowerCase();
    if (/csv|drop|upload|import/.test(t))      { setEntered(true); setPage("data"); return; }
    if (/train|sweep|fork/.test(t))            { setEntered(true); setPage("train"); return; }
    if (/compare|chronos|patchtst/.test(t))    { setEntered(true); setPage("train"); setAgentOpen(true); return; }
    if (/anomaly|detect/.test(t))              { setEntered(true); setPage("data"); return; }
    if (/sketch|chart|visual/.test(t))         { setEntered(true); setPage("visualize"); return; }
    // default: open Today + agent
    setEntered(true); setPage("today"); setAgentOpen(true);
  }
  function handleWizardFinish(cfg) {
    setWizard(null);
    setEntered(true);
    setPage(cfg.kind === "one-shot" ? "live" : "today");
  }

  // —— DOORWAY (no chrome) ————————————————————————————————————————
  if (!entered) {
    return (
      <>
        <DoorwayPage
          onPick={handleDoorwayPick}
          onChat={handleChat}
          openSidebar={() => setEntered(true)}
          setGuidesOpen={setGuidesOpen}
          setPaletteOpen={setPaletteOpen}
        />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} ctx={ctx} />
        <GuidesModal    open={guidesOpen}  onClose={() => setGuidesOpen(false)}  nav={(p) => { setEntered(true); setPage(p); }} mode={mode} />
        {wizard && <SetupWizard kind={wizard} onClose={() => setWizard(null)} onFinish={handleWizardFinish} />}
      </>
    );
  }

  // —— FULL APP ——————————————————————————————————————————————————
  return (
    <>
      <RunningHeader
        page={active}
        project={PROJECTS.find(p => p.id === project)}
        setProject={setProject}
        mode={mode}
        setMode={setMode}
        setPaletteOpen={setPaletteOpen}
        setGuidesOpen={setGuidesOpen}
        onAgent={() => setAgentOpen(o => !o)}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(c => !c)}
        backToDoorway={() => setEntered(false)}
      />

      <div style={{ display: "grid", gridTemplateColumns: (sidebarCollapsed ? "44px" : "208px") + " 1fr", minHeight: `calc(100vh - var(--header-h))`, transition: "grid-template-columns 220ms var(--ease)" }}>
        <Sidebar page={page} setPage={setPage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} setGuidesOpen={setGuidesOpen} />
        <main style={{ overflowX: "hidden", minWidth: 0 }}>
          {page === "today"     && <TodayPage     onAgent={onAgent} nav={setPage} setGuides={setGuidesOpen} />}
          {page === "live"      && <ForecastPage  onAgent={onAgent} nav={setPage} />}
          {page === "data"      && <DataPage      onAgent={onAgent} nav={setPage} />}
          {page === "visualize" && <VisualizePage onAgent={onAgent} nav={setPage} />}
          {page === "train"     && <TrainPage     onAgent={onAgent} nav={setPage} />}
          {page === "models"    && <ModelsPage    onAgent={onAgent} nav={setPage} />}
          {page === "library"   && <LibraryPage   onAgent={onAgent} nav={setPage} />}
          {page === "predict"   && <InferencePage onAgent={onAgent} nav={setPage} />}
          {page === "reports"   && <ReportsPage   onAgent={onAgent} nav={setPage} />}
          {page === "agent"     && <AgentPage />}
          {page === "settings"  && <SettingsPage />}
        </main>
      </div>

      <AgentDrawer open={agentOpen} onClose={() => setAgentOpen(false)} page={active.label} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} ctx={ctx} />
      <GuidesModal    open={guidesOpen}  onClose={() => setGuidesOpen(false)}  nav={setPage} mode={mode} />
      {wizard && <SetupWizard kind={wizard} onClose={() => setWizard(null)} onFinish={handleWizardFinish} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand accent">
          <TweakColor label="Accent" value={t.accent} onChange={v => setTweak("accent", v)}
            options={["#E20613", "#0066B3", "#509A39", "#E6863A", "#131313"]} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakToggle label="Sidebar collapsed" value={sidebarCollapsed} onChange={setSidebarCollapsed} />
          <TweakSelect label="Density" value={t.density} onChange={v => setTweak("density", v)}
            options={["roomy", "comfortable", "tight"]} />
        </TweakSection>
        <TweakSection label="Doorway">
          <TweakButton label="Show Doorway again" onClick={() => setEntered(false)} />
          <TweakButton label="Open project setup wizard" onClick={() => setWizard("create-project")} />
        </TweakSection>
        <TweakSection label="Behaviour">
          <TweakToggle label="Margin notes"            value={t.showMarginNotes}    onChange={v => setTweak("showMarginNotes", v)} />
          <TweakToggle label="Mono numbers"            value={t.monoNumbers}        onChange={v => setTweak("monoNumbers", v)} />
          <TweakToggle label="Agent open by default"   value={t.agentOpenByDefault} onChange={v => setTweak("agentOpenByDefault", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// ──────────────────────────── running header ────────────────────────────
function RunningHeader({ page, project, setProject, mode, setMode, setPaletteOpen, setGuidesOpen, onAgent, sidebarCollapsed, toggleSidebar, backToDoorway }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [modeMenuOpen, setModeMenuOpen] = React.useState(false);
  return (
    <header style={{
      height: "var(--header-h)",
      borderBottom: "1px solid var(--hairline)",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      padding: "0 14px 0 8px",
      background: "var(--canvas-warm)",
      position: "sticky", top: 0, zIndex: 200,
    }}>
      {/* left: hamburger · brand · project · breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={toggleSidebar} className="btn ghost sm" title={(sidebarCollapsed ? "expand" : "collapse") + " sidebar (⌘\\)"} style={{ padding: "4px 7px" }}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            {sidebarCollapsed ? (
              <><line x1="1" y1="2"  x2="13" y2="2"  stroke="currentColor" strokeWidth="1.4" /><line x1="1" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.4" /><line x1="1" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.4" /></>
            ) : (
              <><line x1="1" y1="1"  x2="1"  y2="11" stroke="currentColor" strokeWidth="1.4" /><line x1="5" y1="2" x2="13" y2="2" stroke="currentColor" strokeWidth="1.4" /><line x1="5" y1="6"  x2="13" y2="6" stroke="currentColor" strokeWidth="1.4" /><line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.4" /></>
            )}
          </svg>
        </button>
        <a onClick={backToDoorway} title="back to the Doorway" style={{ display: "flex", alignItems: "baseline", gap: 1, cursor: "pointer", textDecoration: "none", color: "var(--ink)" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, fontVariationSettings: '"opsz" 24' }}>LI</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, fontVariationSettings: '"opsz" 24, "WONK" 1' }}>U</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, fontVariationSettings: '"opsz" 24' }}>LIAN</span>
        </a>
        <span style={{ color: "var(--ink-quiet)" }}>·</span>

        {/* project switcher */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setPickerOpen(o => !o)} className="btn ghost sm" style={{ padding: "3px 9px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--bern)" }} />
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ink)", letterSpacing: "0.02em" }}>{project.name}</span>
            <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>▾</span>
          </button>
          {pickerOpen && <ProjectPicker current={project.id} setProject={(p) => { setProject(p); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
        </div>

        <span style={{ color: "var(--ink-quiet)" }}>·</span>
        <span className="meta" style={{ color: "var(--ink-muted)" }}>{page.group}</span>
        <span style={{ color: "var(--ink-quiet)" }}>·</span>
        <span className="meta" style={{ color: "var(--ink)" }}>{page.label}</span>
      </div>

      {/* center */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
        <span className="pill live"><span style={{ width: 5, height: 5, borderRadius: 9999, background: "var(--bern)" }} />live</span>
        <span className="meta meta-strong"><LiveClock /></span>
        <span style={{ color: "var(--ink-quiet)" }}>·</span>
        <span className="meta">main</span>
      </div>

      {/* right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        <div style={{ position: "relative" }}>
          <button className="btn ghost sm" onClick={() => setModeMenuOpen(o => !o)} title="interaction mode">
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: mode === "C" ? "var(--bern)" : mode === "B" ? "var(--ink)" : "var(--ink-muted)" }} />
            <span className="meta" style={{ color: "var(--ink)" }}>mode · {mode}</span>
            <Icon name="chevron-down" size={10} color="var(--ink-faint)" />
          </button>
          {modeMenuOpen && (
            <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 32, right: 0, width: 280, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, boxShadow: "0 18px 40px rgba(19,19,19,0.14)", zIndex: 500, overflow: "hidden" }}>
              <div className="meta" style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)" }}>Interaction mode</div>
              {MODES.map(m => {
                const isCurrent = m.id === mode;
                return (
                  <div key={m.id} onClick={() => { setMode(m.id); setModeMenuOpen(false); }}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isCurrent ? "var(--surface-shade)" : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 13, color: isCurrent ? "var(--bern)" : "var(--ink)", fontWeight: 600 }}>{m.id}</span>
                      <span style={{ fontSize: 13, fontWeight: isCurrent ? 500 : 400 }}>{m.label}</span>
                      {m.id === "C" && <span className="meta" style={{ color: "var(--ink-faint)", marginLeft: 4 }}>default</span>}
                    </div>
                    <div className="meta" style={{ marginTop: 4, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{m.sub}</div>
                  </div>
                );
              })}
              <div style={{ padding: "10px 14px", background: "var(--surface-shade)" }} className="meta">switch any time · ⌘K · "mode"</div>
            </div>
          )}
        </div>
        <button className="btn ghost sm" onClick={() => setGuidesOpen(true)} title="user-story guides">
          <Icon name="help" size={13} />
          <span className="meta" style={{ color: "var(--ink-muted)" }}>guides</span>
        </button>
        <button className="btn ghost sm" onClick={() => setPaletteOpen(true)}>
          <kbd>⌘</kbd><kbd>K</kbd>
          <span className="meta" style={{ color: "var(--ink-muted)" }}>palette</span>
        </button>
        <button className="btn ghost sm" onClick={onAgent} disabled={mode === "A"} style={mode === "A" ? { opacity: 0.4, cursor: "not-allowed" } : {}}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--bern)" }} />
          <span className="meta" style={{ color: "var(--ink)" }}>agent</span>
          <kbd>b</kbd>
        </button>
        <span style={{ width: 26, height: 26, borderRadius: 9999, background: "var(--ink)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: 12, fontWeight: 500, fontVariationSettings: '"opsz" 12' }}>lj</span>
      </div>
    </header>
  );
}

function ProjectPicker({ current, setProject, onClose }) {
  React.useEffect(() => {
    const onClick = (e) => { if (!e.target.closest("[data-pp]")) onClose(); };
    setTimeout(() => window.addEventListener("click", onClick), 0);
    return () => window.removeEventListener("click", onClick);
  }, [onClose]);
  return (
    <div data-pp="1" style={{ position: "absolute", top: 32, left: 0, width: 320, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, boxShadow: "0 18px 40px rgba(19,19,19,0.14)", zIndex: 500 }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)" }} className="meta">Switch project · {PROJECTS.length} total</div>
      {PROJECTS.map(p => {
        const isCurrent = p.id === current;
        return (
          <div key={p.id} onClick={() => setProject(p.id)}
            style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isCurrent ? "var(--surface-shade)" : "transparent" }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: isCurrent ? "var(--bern)" : "transparent", marginLeft: 2, border: isCurrent ? "none" : "1px solid var(--hairline-strong)" }} />
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: isCurrent ? 500 : 400, color: "var(--ink)" }}>{p.name}</div>
              <div className="meta" style={{ marginTop: 2, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{p.sub}</div>
              <div className="meta" style={{ marginTop: 2 }}>{p.datasets} ds · {p.models} mdl · {p.runs} runs · {p.role}</div>
            </div>
            {isCurrent && <span className="meta" style={{ color: "var(--bern)" }}>active</span>}
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 6, padding: "10px 14px", background: "var(--surface-shade)" }}>
        <button className="btn sm" style={{ flex: 1, justifyContent: "center" }}>+ new project</button>
        <button className="btn sm ghost">manage</button>
      </div>
    </div>
  );
}

// ───────────────────────────── sidebar ─────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed, setGuidesOpen }) {
  const groups = ["", "Workspace", "Library", "System"];
  return (
    <nav style={{
      borderRight: "1px solid var(--hairline)",
      background: "var(--canvas-warm)",
      padding: 0,
      position: "sticky", top: "var(--header-h)",
      height: "calc(100vh - var(--header-h))",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* head */}
      {!collapsed ? (
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, fontVariationSettings: '"opsz" 24, "SOFT" 60', color: "var(--ink)" }}>Studio</div>
            <div className="meta" style={{ marginTop: 1 }}>R2026 · v0.4.1</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "14px 8px 12px", borderBottom: "1px solid var(--hairline)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, fontVariationSettings: '"opsz" 24, "WONK" 1' }}>S</div>
        </div>
      )}

      {/* nav body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {groups.map(g => (
          <div key={g || "_top"} style={{ padding: "8px 0 4px" }}>
            {!collapsed && g && <div className="meta" style={{ padding: "8px 16px 6px" }}>{g}</div>}
            {collapsed && g && <div style={{ height: 14, margin: "2px 12px", borderBottom: "1px dashed var(--hairline)" }} />}
            {NAV.filter(n => n.group === g).map(n => {
              const active = n.id === page;
              if (collapsed) {
                return (
                  <a key={n.id} onClick={() => setPage(n.id)} title={n.label} className={active ? "ribbon-left" : ""}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0", cursor: "pointer", background: active ? "var(--surface-shade)" : "transparent", textDecoration: "none", color: active ? "var(--ink)" : "var(--ink-muted)" }}>
                    <Icon name={n.icon} size={16} color={active ? "var(--bern)" : "var(--ink-muted)"} />
                  </a>
                );
              }
              return (
                <a key={n.id} onClick={() => setPage(n.id)} className={active ? "ribbon-left" : ""}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "18px 1fr",
                    alignItems: "center", gap: 10,
                    padding: "9px 16px",
                    cursor: "pointer",
                    color: active ? "var(--ink)" : "var(--ink-muted)",
                    fontWeight: active ? 500 : 400,
                    background: active ? "var(--surface-shade)" : "transparent",
                    fontSize: 13.5,
                    textDecoration: "none",
                  }}>
                  <Icon name={n.icon} size={15} color={active ? "var(--bern)" : "var(--ink-muted)"} strokeWidth={active ? 1.6 : 1.4} />
                  <span>{n.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </div>

      {/* footer */}
      {!collapsed ? (
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--hairline)", background: "var(--canvas-warm)" }}>
          <button onClick={() => setGuidesOpen(true)} className="btn ghost sm" style={{ width: "100%", justifyContent: "flex-start", padding: "6px 8px", marginBottom: 6 }}>
            <kbd>?</kbd>
            <span style={{ fontSize: 12 }}>Guides</span>
            <span style={{ flex: 1 }} />
            <span className="meta">7</span>
          </button>
          <div className="meta" style={{ marginBottom: 4 }}>cluster</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--green)" }} />
            <span className="mono" style={{ fontSize: 11, whiteSpace: "nowrap" }}>ubelix · gpu-h100</span>
          </div>
          <div className="meta" style={{ marginTop: 4, whiteSpace: "nowrap" }}>queue · 3 · running · 1</div>
        </div>
      ) : (
        <div style={{ padding: "10px 0", borderTop: "1px solid var(--hairline)", textAlign: "center" }}>
          <button onClick={() => setGuidesOpen(true)} className="btn ghost sm" style={{ padding: "4px 6px" }}><kbd>?</kbd></button>
          <div style={{ marginTop: 6 }}><span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--green)", display: "inline-block" }} /></div>
        </div>
      )}
    </nav>
  );
}

// ───────────────────────────── mount ─────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
