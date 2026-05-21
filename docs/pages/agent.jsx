// ──────────────────────────────────────────────────────────────
// LIULIAN — Full Agent console (page)
//   Three columns: thread list · chat thread · artifacts/memory
// ──────────────────────────────────────────────────────────────

const THREADS = [
  { id: "th-001", title: "Compare PatchTST vs Chronos-2 on Bern",         updated: "05:14", msgs: 14, active: true,  model: "claude-haiku-4-5" },
  { id: "th-002", title: "Why did r-7c87 OOM?",                            updated: "Mon",   msgs:  7, active: false, model: "deepseek-chat" },
  { id: "th-003", title: "Draft the May model shoot-out report",          updated: "Mon",   msgs: 22, active: false, model: "claude-haiku-4-5" },
  { id: "th-004", title: "Bafu BAFU URL → preview schema",                  updated: "Sun",   msgs:  4, active: false, model: "claude-haiku-4-5" },
  { id: "th-005", title: "Explain DLinear like I'm an SRE",                updated: "2w",    msgs:  9, active: false, model: "glm-4.6" },
];

const ARTIFACTS = [
  { kind: "chart",   id: "cell-114", title: "Bern · 7-day discharge",       at: "05:14" },
  { kind: "dataset", id: "swiss-river-2026-05",   title: "Filtered Bern May",  at: "05:13" },
  { kind: "run",     id: "r-7c8a",   title: "patchtst · queued by agent",     at: "05:12" },
  { kind: "report",  id: "draft-014",title: "Bern Q95 · 72h brief",            at: "05:08" },
];

function AgentPage({ onClose }) {
  const [activeThread, setActiveThread] = React.useState("th-001");
  const [model, setModel] = React.useState("claude-haiku-4-5");
  const [input, setInput] = React.useState("");

  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle kicker="Catalog" title="Agent console" specimen="full-page workspace · multi-thread · multi-provider"
        right={<><button className="btn">+ New thread</button><button className="btn">Memory ↗</button></>} />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", gap: 14, alignItems: "stretch", minHeight: "calc(100vh - 220px)" }}>
        {/* threads */}
        <nav className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="meta">Threads · {THREADS.length}</span>
            <span style={{ flex: 1 }} />
            <span className="meta" style={{ color: "var(--ink-faint)" }}>⌘N</span>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {THREADS.map(t => {
              const isActive = t.id === activeThread;
              return (
                <div key={t.id} onClick={() => setActiveThread(t.id)} className={isActive ? "ribbon-left" : ""}
                  style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isActive ? "var(--surface-shade)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, flex: 1 }}>{t.title}</span>
                    <span className="meta" style={{ marginLeft: 6 }}>{t.updated}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{t.id} · {t.msgs} msgs</span>
                    <span style={{ flex: 1 }} />
                    <span className="meta">{t.model.replace("claude-haiku-4-5","claude").replace("deepseek-chat","deepseek").replace("glm-4.6","glm")}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid var(--hairline)" }}>
            <input placeholder="search threads…" style={{ width: "100%", border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontSize: 12, background: "var(--canvas-warm)", outline: "none", fontFamily: "var(--sans)" }} />
          </div>
        </nav>

        {/* thread body */}
        <section className="card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <header style={{ padding: "12px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, fontVariationSettings: '"opsz" 28' }}>Compare PatchTST vs Chronos-2 on Bern</div>
              <div className="meta" style={{ marginTop: 2 }}>th-001 · 14 messages · started 2026-05-13 04:42</div>
            </div>
            <span style={{ flex: 1 }} />
            <Segmented size="sm" options={AGENT_MODELS.map(m => ({ value: m.id, label: m.name.replace("Claude Haiku 4.5", "Claude").replace("DeepSeek-V3.2","DeepSeek").replace("Gemini 2.5 Flash","Gemini").replace("Qwen3 (local)","Qwen") }))} value={model} onChange={setModel} />
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", fontSize: 14, lineHeight: 1.6 }}>
            <Msg role="agent">
              I'll work through this in three passes: pull the latest 72-h forecast from both models, score against the rolling observation, and then draft a one-paragraph verdict. Is the priority point forecast or interval calibration?
            </Msg>
            <Msg role="user">Both. But weight calibration if they disagree.</Msg>

            <ToolCall name="query_forecasts" input={{ station_id: "aare-bern", models: ["patchtst", "chronos-2"], horizon: "72h" }} output={{ patchtst: { mae: 8.42, rmse: 11.27, cov90: 88.5 }, "chronos-2": { mae: 9.81, rmse: 13.04, cov90: 91.2 } }} />

            <Msg role="agent">
              <p style={{ marginTop: 0 }}>Quick read:</p>
              <ul>
                <li><strong>Point</strong>: PatchTST is sharper (MAE 8.42 vs 9.81 — 16% lower).</li>
                <li><strong>Interval calibration</strong>: Chronos-2 is closer to nominal at the 90 % level (91.2 % vs 88.5 %).</li>
              </ul>
              <p>By your preference, Chronos-2 wins for risk-bounded decisions. PatchTST wins for "best-estimate" point forecasts. Want me to draft this as a 3-panel report?</p>
            </Msg>

            <PlanBlock items={[
              { done: true,  label: "Pull both forecasts at h=72" },
              { done: true,  label: "Score MAE / RMSE against held-out obs" },
              { done: true,  label: "Score Q05/Q95 coverage vs nominal 90%" },
              { done: false, label: "Render a 3-panel comparison (point · interval · residual)" },
              { done: false, label: "Save as report → bern-model-shootout" },
            ]} />

            <Msg role="user">Yes — draft the report. Public link.</Msg>

            <ToolCall name="create_report" input={{ title: "Bern · model shootout · May 2026", panels: 3, public: true }} output={{ id: "draft-014", url: "https://liulian.app/r/draft-014" }} />

            <Msg role="agent">
              <em>Drafted.</em> draft-014 is ready at <a href="#" style={{ color: "var(--bern-deep)", borderBottom: "1px solid var(--bern-tint-2)" }}>liulian.app/r/draft-014</a>. I left it unpublished — promote it from <kbd>Reports</kbd> when you've read through.
            </Msg>
          </div>

          {/* composer */}
          <form onSubmit={e => { e.preventDefault(); setInput(""); }} style={{ padding: 12, borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              <span className="meta">@</span>
              <span className="pill">@dataset · swiss-river-1990</span>
              <span className="pill">@station · aare-bern</span>
              <span className="pill">@run · r-7c83</span>
              <button className="btn sm ghost" style={{ padding: "2px 6px" }}>+</button>
              <span style={{ flex: 1 }} />
              <button className="btn ghost sm">/ slash commands</button>
              <button className="btn ghost sm">attach</button>
              <span className="meta">tokens · 12,421 / 200k</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="Reply to the agent · ⌘↵ to send"
                style={{ flex: 1, border: "1px solid var(--hairline)", borderRadius: 8, padding: "10px 12px", fontFamily: "var(--sans)", fontSize: 13.5, outline: "none", background: "var(--surface)", resize: "none" }} />
              <button type="submit" className="btn primary" style={{ alignSelf: "flex-end" }}>Send</button>
            </div>
          </form>
        </section>

        {/* artifacts + memory */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: "14px 16px" }}>
            <RunningHead label="Artifacts" meta="created in thread" />
            {ARTIFACTS.map((a, i) => (
              <div key={a.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 50px", gap: 8, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center" }}>
                <span className="meta">{a.kind}</span>
                <div>
                  <div style={{ fontSize: 13 }}>{a.title}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{a.id}</div>
                </div>
                <span className="meta" style={{ textAlign: "right" }}>{a.at}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <RunningHead label="Long-term memory" meta="7 facts" />
            {[
              "Prefers risk-bounded decisions; weight interval calibration over point.",
              "BAFU data drops at 04:00 UTC. Re-imports auto-trigger at 04:15.",
              "Default report audience: 2 colleagues + a public link, never deeper share.",
              "Avoid emoji and gradient charts; UniBe red is the only brand color.",
              "Prefers MAE over MAPE; weights tail errors with quantile loss when asked.",
            ].map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 6, padding: "6px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", fontSize: 12.5 }}>
                <span style={{ width: 4, height: 4, background: "var(--ink)", borderRadius: 9999, marginTop: 8 }} />
                <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-soft)", lineHeight: 1.5 }}>{m}</span>
              </div>
            ))}
            <button className="btn sm ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>edit memory</button>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <RunningHead label="Tools" meta="8 enabled" />
            {["query_forecasts", "search_runs", "create_chart", "create_report", "schedule_batch", "compare_models", "fetch_url", "read_dataset"].map((t, i) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "12px 1fr 50px", gap: 6, padding: "5px 0", fontSize: 12, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, background: "var(--bern)", borderRadius: 9999, marginLeft: 3 }} />
                <span className="mono" style={{ fontSize: 11.5 }}>{t}</span>
                <span className="meta" style={{ textAlign: "right" }}>on</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Msg({ role, children }) {
  if (role === "user") {
    return (
      <div style={{ marginBottom: 18 }}>
        <div className="meta" style={{ marginBottom: 6 }}>you</div>
        <div style={{ color: "var(--ink)", fontSize: 14.5 }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="meta" style={{ marginBottom: 6, color: "var(--bern)" }}>agent</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-strong)", maxWidth: "60ch" }}>{children}</div>
    </div>
  );
}

function ToolCall({ name, input, output }) {
  return (
    <details open style={{ marginBottom: 18, background: "var(--surface-shade)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "8px 12px", maxWidth: "60ch" }}>
      <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: "var(--mono)", fontSize: 11.5, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ color: "var(--bern)" }}>↳ tool</span>
        <span style={{ color: "var(--ink)" }}>{name}</span>
        <span style={{ flex: 1 }} />
        <span className="meta">{Object.keys(input).length} args → {Object.keys(output).length} result</span>
      </summary>
      <pre className="mono" style={{ margin: "8px 0 4px", fontSize: 11, lineHeight: 1.6, color: "var(--ink-muted)", whiteSpace: "pre-wrap" }}>{JSON.stringify(input, null, 2)}</pre>
      <div className="meta" style={{ marginTop: 4 }}>→ output</div>
      <pre className="mono" style={{ margin: "4px 0 0", fontSize: 11, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{JSON.stringify(output, null, 2)}</pre>
    </details>
  );
}

function PlanBlock({ items }) {
  return (
    <div style={{ marginBottom: 18, padding: 14, border: "1px solid var(--hairline)", borderRadius: 8, maxWidth: "60ch" }}>
      <div className="meta" style={{ marginBottom: 8 }}>plan · {items.filter(i => i.done).length}/{items.length}</div>
      {items.map((it, k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
          <span style={{ width: 13, height: 13, border: "1px solid var(--hairline-stronger)", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", background: it.done ? "var(--ink)" : "transparent", color: "#fff", fontSize: 10 }}>{it.done ? "✓" : ""}</span>
          <span style={{ color: it.done ? "var(--ink-faint)" : "var(--ink)", textDecoration: it.done ? "line-through" : "none" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { AgentPage });
