// ──────────────────────────────────────────────────────────────
// LIULIAN — agent drawer (right-side persistent assistant)
// ──────────────────────────────────────────────────────────────
const { useState: useSt, useRef: useRf2, useEffect: useEf2 } = React;

const AGENT_MODELS = [
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", note: "default · fastest" },
  { id: "deepseek-chat",    name: "DeepSeek-V3.2",    provider: "DeepSeek",  note: "long-context cheap" },
  { id: "glm-4.6",          name: "GLM-4.6",          provider: "Zhipu",     note: "zh-native" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google",    note: "multimodal" },
  { id: "ollama:qwen3",     name: "Qwen3 (local)",    provider: "Ollama",    note: "offline · 14B" },
];

const SEED_THREAD = [
  { role: "system-band", text: "thread · forecast.canvas · aare-bern · patchtst" },
  { role: "agent", text: "I'm reading aare-bern's last 72 h of observations and the most recent PatchTST forecast. Want me to flag anomalies against the Chronos-2 zero-shot baseline first, or just summarise the run?" },
  { role: "user", text: "Show Bern Q95 next 72 hours" },
  { role: "tool", name: "query_forecasts", input: { action: "summary", station_id: "aare-bern", model_id: "patchtst" },
    output: { mean_at_h24: 412.4, q05_at_h24: 388.0, q95_at_h24: 437.1, observed_recent_mean: 408.2, units: "m³/s" } },
  { role: "agent", text: "Bern's 24-hour forecast: mean 412.4 m³/s, 90% CI [388.0, 437.1]. The upper bound sits 6.7% above the recent observed mean — within historical range, no alert thresholds projected to fire in the next 72 h." },
  { role: "plan", items: [
    { done: true,  label: "Pull Bern · 24h mean + CI"   },
    { done: true,  label: "Compare against rolling 7-day mean" },
    { done: false, label: "Project alert-threshold crossings (72h)" },
    { done: false, label: "Cross-check with Chronos-2 zero-shot" },
  ] },
];

function AgentDrawer({ open, onClose, page }) {
  const [model, setModel] = useSt(AGENT_MODELS[0].id);
  const [thread, setThread] = useSt(SEED_THREAD);
  const [input, setInput] = useSt("");
  const [thinking, setThinking] = useSt(false);
  const [showModelMenu, setShowModelMenu] = useSt(false);
  const streamRef = useRf2(null);

  useEf2(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; }, [thread, thinking]);

  function send() {
    const t = input.trim();
    if (!t) return;
    setInput("");
    setThread(th => [...th, { role: "user", text: t }]);
    setThinking(true);
    setTimeout(() => {
      setThread(th => [...th, {
        role: "tool", name: "search_runs", input: { query: t, top_k: 3 },
        output: { matched: 3, top: ["r-7c89 · lstm · MAE 11.84", "r-7c84 · patchtst · MAE 8.92", "r-7c83 · patchtst · MAE 8.42"] }
      }]);
    }, 600);
    setTimeout(() => {
      setThread(th => [...th, { role: "agent", text: "I checked the runs index. PatchTST consistently beats LSTM by ~3 MAE on swiss-river-1990; the best is `r-7c83` (MAE 8.42). Want me to open it in the Train tab, or queue a re-run with the same config?" }]);
      setThinking(false);
    }, 1500);
  }

  if (!open) return null;

  const selectedModel = AGENT_MODELS.find(m => m.id === model);

  return (
    <aside style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 400, zIndex: 600,
      background: "var(--surface)", borderLeft: "1px solid var(--hairline)",
      display: "flex", flexDirection: "column",
      boxShadow: "-12px 0 36px rgba(19,19,19,0.06)",
      animation: "fadeUp 220ms var(--ease)",
    }}>
      {/* head */}
      <header style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 8 }}>
        <div className="meta" style={{ color: "var(--bern)" }}>● agent</div>
        <div className="meta" style={{ color: "var(--ink-muted)" }}>· {page || "context"}</div>
        <div style={{ flex: 1 }} />
        <button className="btn ghost sm" onClick={() => setShowModelMenu(s => !s)} title="Switch model">
          <span className="mono" style={{ fontSize: 10.5 }}>{selectedModel.name}</span>
          <span style={{ color: "var(--ink-faint)", marginLeft: 2 }}>▾</span>
        </button>
        <button className="btn ghost sm" onClick={onClose} title="Close (b)"><kbd>b</kbd></button>
        {showModelMenu && (
          <div style={{ position: "absolute", top: 42, right: 12, width: 280, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, boxShadow: "0 16px 36px rgba(19,19,19,0.12)", zIndex: 10 }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--hairline)" }} className="meta">model · provider</div>
            {AGENT_MODELS.map(m => (
              <div key={m.id} onClick={() => { setModel(m.id); setShowModelMenu(false); }}
                style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "12px 1fr auto", alignItems: "center", gap: 8, cursor: "pointer", borderBottom: "1px solid var(--hairline)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: m.id === model ? "var(--bern)" : "transparent", marginLeft: 3 }} />
                <div>
                  <div style={{ fontSize: 13 }}>{m.name}</div>
                  <div className="meta" style={{ marginTop: 2 }}>{m.provider} · {m.note}</div>
                </div>
                {m.id === model && <span className="meta" style={{ color: "var(--bern)" }}>active</span>}
              </div>
            ))}
            <div style={{ padding: "8px 12px" }} className="meta">via liulian-agent · :8000</div>
          </div>
        )}
      </header>

      {/* context strip */}
      <div style={{ padding: "8px 14px", display: "flex", gap: 6, alignItems: "center", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)", overflowX: "auto" }}>
        <span className="meta">context</span>
        <span className="pill">@dataset · swiss-river-1990</span>
        <span className="pill">@station · aare-bern</span>
        <span className="pill">@model · patchtst</span>
      </div>

      {/* stream */}
      <div ref={streamRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", fontSize: 13, lineHeight: 1.55 }}>
        {thread.map((m, i) => {
          if (m.role === "system-band") {
            return <div key={i} className="meta" style={{ paddingBottom: 10, borderBottom: "1px dashed var(--hairline)", marginBottom: 10 }}>{m.text}</div>;
          }
          if (m.role === "user") {
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div className="meta" style={{ marginBottom: 4 }}>you</div>
                <div style={{ color: "var(--ink)" }}>{m.text}</div>
              </div>
            );
          }
          if (m.role === "agent") {
            return (
              <div key={i} style={{ marginBottom: 16 }}>
                <div className="meta" style={{ marginBottom: 4, color: "var(--bern)" }}>agent</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-strong)", maxWidth: "44ch" }}>{m.text}</div>
              </div>
            );
          }
          if (m.role === "tool") {
            return (
              <details key={i} open style={{ marginBottom: 12, background: "var(--surface-shade)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "6px 10px" }}>
                <summary style={{ cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--bern)" }}>↳ tool</span>
                  <span style={{ color: "var(--ink)" }}>{m.name}</span>
                  <span style={{ flex: 1 }} />
                  <span className="meta" style={{ color: "var(--ink-faint)" }}>{Object.keys(m.input).length} args</span>
                </summary>
                <pre className="mono" style={{ margin: "8px 0 4px", fontSize: 10.5, color: "var(--ink-muted)", whiteSpace: "pre-wrap" }}>{JSON.stringify(m.input, null, 2)}</pre>
                <div className="meta" style={{ marginTop: 6 }}>→ output</div>
                <pre className="mono" style={{ margin: "4px 0 0", fontSize: 10.5, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{JSON.stringify(m.output, null, 2)}</pre>
              </details>
            );
          }
          if (m.role === "plan") {
            return (
              <div key={i} style={{ marginBottom: 14, padding: 12, border: "1px solid var(--hairline)", borderRadius: 8 }}>
                <div className="meta" style={{ marginBottom: 8 }}>plan · {m.items.filter(x => x.done).length}/{m.items.length}</div>
                {m.items.map((it, k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12.5 }}>
                    <span style={{ width: 12, height: 12, border: "1px solid var(--hairline-stronger)", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", background: it.done ? "var(--ink)" : "transparent", color: "#fff", fontSize: 10 }}>{it.done ? "✓" : ""}</span>
                    <span style={{ color: it.done ? "var(--ink-faint)" : "var(--ink)", textDecoration: it.done ? "line-through" : "none" }}>{it.label}</span>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
        {thinking && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <RoseLoader size={14} />
            <span className="meta">thinking…</span>
          </div>
        )}

        {/* suggestions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {["Compare PatchTST vs Chronos-2 for Bern", "Schedule a re-run with seed=7", "Open the failed run’s last 20 log lines"].map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              textAlign: "left", padding: "8px 10px", background: "transparent",
              border: "1px solid var(--hairline)", borderRadius: 6, color: "var(--ink-muted)",
              fontSize: 12, fontFamily: "var(--sans)", cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* composer */}
      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: 10, borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <span className="pill dim">/run</span>
          <span className="pill dim">/compare</span>
          <span className="pill dim">/cite</span>
          <span style={{ flex: 1 }} />
          <span className="meta">⌥↵ newline · ↵ send</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.altKey && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={2} placeholder="Ask the agent — try “@aare-bern compare patchtst with chronos-2 zero-shot”"
            style={{ flex: 1, resize: "none", border: "1px solid var(--hairline)", borderRadius: 8, padding: "8px 10px", fontFamily: "var(--sans)", fontSize: 13, outline: "none", background: "var(--surface)" }} />
          <button type="submit" className="btn primary" style={{ alignSelf: "flex-end" }}>Ask</button>
        </div>
      </form>
    </aside>
  );
}

Object.assign(window, { AgentDrawer, AGENT_MODELS });
