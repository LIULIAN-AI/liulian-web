// ──────────────────────────────────────────────────────────────
// LIULIAN — Model registry
// ──────────────────────────────────────────────────────────────

function ModelsPage({ onAgent }) {
  const [filter, setFilter] = React.useState("all");
  const filtered = MODELS.filter(m => filter === "all" ? true : m.role === filter);
  const [activeId, setActiveId] = React.useState("patchtst");
  const active = MODELS.find(m => m.id === activeId);
  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle kicker="Catalog" title="Models" specimen={`${MODELS.length} models · ${MODELS.filter(m => m.status === "stable").length} stable · ${MODELS.filter(m => m.status === "preview").length} preview · ${MODELS.filter(m => m.status === "baseline").length} baseline`}
        right={<>
          <Segmented options={[{ value: "all", label: "all" }, { value: "supervised", label: "supervised" }, { value: "zero-shot", label: "zero-shot" }, { value: "few-shot", label: "few-shot" }]} value={filter} onChange={setFilter} />
          <button className="btn">+ Register model</button>
          <button className="btn primary" onClick={onAgent}>Ask agent</button>
        </>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map(m => {
          const r = rng(m.id.length * 13);
          const data = Array.from({ length: 30 }, (_, i) => 1.2 * Math.exp(-0.07 * i) + 0.1 + (r() - 0.5) * 0.04);
          const isActive = m.id === activeId;
          return (
            <div key={m.id} onClick={() => setActiveId(m.id)} className={`card ${isActive ? "ribbon-left" : ""}`} style={{ padding: "16px 18px", cursor: "pointer", background: isActive ? "var(--surface-shade)" : "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500 }}>{m.id}</div>
                  <div className="meta" style={{ marginTop: 3 }}>{m.family}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {m.status === "stable" && <span className="meta" style={{ color: "var(--ink)" }}>stable</span>}
                  {m.status === "preview" && <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", fontSize: 12 }}>preview</em>}
                  {m.status === "baseline" && <span className="meta" style={{ color: "var(--ink-faint)" }}>baseline</span>}
                </div>
              </div>
              <div className="display-italic" style={{ fontSize: 14, color: "var(--ink-soft)", margin: "6px 0 10px" }}>
                {m.role === "supervised" ? "Trains per dataset. Best when you have history." :
                 m.role === "zero-shot"  ? "No training needed. Drops in on any series." :
                 "Pre-trained; a handful of examples nudges it."}
              </div>
              <div style={{ height: 50, margin: "6px 0 10px", display: "flex", alignItems: "center" }}>
                <Sparkline data={data} width={240} height={48} stroke="var(--bern)" fill="var(--bern-tint)" lastDot />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <Stat k="params" v={m.params} />
                <Stat k="ctx"    v={m.ctx} />
                <Stat k="role"   v={m.role} />
              </div>
              <div style={{ display: "flex", marginTop: 10, gap: 6 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{m.paper}</span>
                <span style={{ flex: 1 }} />
                <button className="btn sm ghost" style={{ padding: "2px 6px" }}>train</button>
                <button className="btn sm ghost" style={{ padding: "2px 6px" }}>infer</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label={"Detail · " + active.id} meta={active.family} />
          <p className="display-italic" style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: "60ch" }}>
            {active.id === "patchtst" ? "Patches the input series, applies a vanilla Transformer; channels are independent. Strong baseline for medium-horizon multivariate forecasting." :
             active.id === "chronos-2" ? "Amazon's pre-trained foundation model. Treats numbers as tokens; tokenises the series, generates a probabilistic forecast. No fine-tuning required." :
             "See paper for full description."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 14 }}>
            <Stat k="paper"   v={active.paper} mono />
            <Stat k="params"  v={active.params} mono />
            <Stat k="ctx"     v={active.ctx + " tokens"} mono />
          </div>
          <div className="div-h" style={{ margin: "14px 0" }} />
          <RunningHead label="Hyperparameters · defaults" />
          <pre className="mono" style={{ margin: 0, padding: "12px 14px", background: "var(--surface-shade)", borderRadius: 8, fontSize: 11.5, lineHeight: 1.7 }}>{`patch_len:   16
stride:      8
d_model:     128
n_heads:     8
n_layers:    3
dropout:     0.1
lr:          1e-4
batch_size:  64`}</pre>
        </div>
        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Leaderboard on swiss-river-1990" meta="MAE · ↓" />
          {[
            { m: "patchtst",     mae: 8.42, italic: false },
            { m: "patchtst·embed", mae: 8.92, italic: false },
            { m: "timesnet",     mae: 9.18, italic: false },
            { m: "lstm",         mae: 11.84, italic: false },
            { m: "dlinear",      mae: 12.40, italic: false },
            { m: "chronos-2 · 0-shot", mae: 9.81, italic: true },
          ].sort((a, b) => a.mae - b.mae).map((row, i) => (
            <div key={row.m} style={{ display: "grid", gridTemplateColumns: "20px 1fr 80px", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 13 }}>
              <span className="mono" style={{ color: "var(--ink-faint)", fontSize: 10.5 }}>{(i + 1).toString().padStart(2, "0")}</span>
              <span style={{ fontStyle: row.italic ? "italic" : "normal", fontFamily: row.italic ? "var(--serif)" : "var(--mono)", fontSize: row.italic ? 13.5 : 12.5, fontWeight: i === 0 ? 600 : 400 }}>{row.m}</span>
              <span className="mono" style={{ textAlign: "right" }}>{row.mae.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Stat({ k, v, mono }) {
  return (
    <div>
      <div className="meta" style={{ marginBottom: 3 }}>{k}</div>
      <div className={mono ? "mono" : ""} style={{ fontSize: mono ? 12.5 : 13.5, color: "var(--ink-soft)" }}>{v}</div>
    </div>
  );
}
Object.assign(window, { ModelsPage });
