// ──────────────────────────────────────────────────────────────
// LIULIAN — command palette  (⌘K)
// ──────────────────────────────────────────────────────────────
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM } = React;

function CommandPalette({ open, onClose, ctx }) {
  const [q, setQ] = useS("");
  const [sel, setSel] = useS(0);
  const inputRef = useR(null);

  useE(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const filtered = useM(() => {
    const t = q.trim().toLowerCase();
    if (!t) return COMMANDS;
    return COMMANDS.filter(c => (c.lbl + " " + c.group).toLowerCase().includes(t));
  }, [q]);

  const grouped = useM(() => {
    const g = {};
    filtered.forEach((c, i) => { (g[c.group] = g[c.group] || []).push({ ...c, _i: i }); });
    return g;
  }, [filtered]);

  useE(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(filtered.length - 1, s + 1)); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      else if (e.key === "Enter")     { e.preventDefault(); const c = filtered[sel]; if (c) { c.run(ctx); onClose(); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, sel, onClose, ctx]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(19,19,19,0.22)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh", zIndex: 9000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 640, maxWidth: "92vw", background: "var(--surface)",
        border: "1px solid var(--hairline)", borderRadius: 14,
        boxShadow: "0 28px 60px rgba(19,19,19,0.18)", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
          <span className="meta">⌘K</span>
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setSel(0); }}
            placeholder="Type a command, route, or model name…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontFamily: "var(--sans)", background: "transparent" }} />
          <span className="meta" style={{ color: "var(--ink-faint)" }}>↑↓ ↵ esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div style={{ padding: "10px 22px 4px", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{group}</div>
              {items.map((c, i) => {
                const active = c._i === sel;
                return (
                  <div key={c.lbl} onMouseEnter={() => setSel(c._i)} onClick={() => { c.run(ctx); onClose(); }}
                    style={{
                      display: "grid", gridTemplateColumns: "10px 1fr auto", alignItems: "center", gap: 14,
                      padding: "9px 22px", cursor: "pointer",
                      background: active ? "var(--canvas-warmer)" : "transparent",
                    }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, marginLeft: 2, background: active ? "var(--bern)" : "transparent" }} />
                    <span style={{ fontSize: 14 }}>{c.lbl}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>{c.kbd}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 22px", fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)" }}>No commands match. Try a different word.</div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 22px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
          <span className="meta">{filtered.length} commands</span>
          <span className="meta">⌘K to toggle · /<span style={{ color: "var(--ink)" }}>g</span> for guides</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette });
