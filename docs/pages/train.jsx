// ──────────────────────────────────────────────────────────────
// LIULIAN — Training hub
// ──────────────────────────────────────────────────────────────

function TrainPage({ onAgent, nav }) {
  const [selectedIds, setSelectedIds] = React.useState(new Set(["r-7c83", "r-7c89", "r-7c84"]));
  const [activeId, setActiveId] = React.useState("r-7c8a");
  const active = RUNS.find(r => r.id === activeId);

  function toggle(id) {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle
        kicker="Studio · Train"
        title="Experiment runs"
        specimen={`${RUNS.length} runs · 1 running · 1 failed · 5 completed · sorted by recency`}
        right={<><button className="btn">+ Experiment</button><button className="btn">Queue zero-shot</button><button className="btn primary" onClick={onAgent}>Ask agent</button></>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        {/* leaderboard */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
            <span className="meta">Runs · ⌘O open · ⌘D diff · ⌘. requeue</span>
            <span style={{ flex: 1 }} />
            <Segmented size="sm" options={["recent", "by mae", "by rmse"]} value="recent" onChange={() => {}} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "26px minmax(220px,1.6fr) 100px 90px 70px 70px 70px 90px", padding: "10px 16px", borderBottom: "1px solid var(--hairline)" }}>
            {["", "run", "entity·seed", "status", "MAE", "RMSE", "cov@90", "started"].map((h, i) => (
              <span key={i} className="meta" style={{ textAlign: i >= 4 && i <= 6 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {RUNS.map((r, i) => {
            const isActive = r.id === activeId;
            const isSelected = selectedIds.has(r.id);
            return (
              <div key={r.id} onClick={() => setActiveId(r.id)} className={isActive ? "ribbon-left" : ""}
                style={{ display: "grid", gridTemplateColumns: "26px minmax(220px,1.6fr) 100px 90px 70px 70px 70px 90px", padding: "12px 16px", borderBottom: i === RUNS.length - 1 ? "none" : "1px solid var(--hairline)", alignItems: "center", cursor: "pointer", background: isActive ? "var(--surface-shade)" : "transparent" }}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(r.id)} onClick={e => e.stopPropagation()} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.dataset} <span style={{ color: "var(--ink-faint)" }}>/</span> <span className="mono" style={{ fontSize: 12 }}>{r.model}</span></div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 2 }}>{r.id} · @{r.owner}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{r.entity} · {r.seed}</span>
                <span style={{ fontSize: 13 }}><StatusLabel value={r.status} /></span>
                <span className="mono" style={{ fontSize: 12, textAlign: "right", color: r.mae == null ? "var(--ink-faint)" : "var(--ink-soft)" }}>{r.mae == null ? "—" : r.mae.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: 12, textAlign: "right", color: r.rmse == null ? "var(--ink-faint)" : "var(--ink-soft)" }}>{r.rmse == null ? "—" : r.rmse.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: 12, textAlign: "right", color: r.cov90 == null ? "var(--ink-faint)" : "var(--ink-soft)" }}>{r.cov90 == null ? "—" : r.cov90.toFixed(1)}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", textAlign: "right", whiteSpace: "nowrap" }}>{r.started === "—" ? "—" : r.started.slice(5)}</span>
              </div>
            );
          })}
          <div style={{ padding: "10px 16px", display: "flex", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", alignItems: "center" }}>
            <span className="meta">{selectedIds.size} selected</span>
            <span style={{ flex: 1 }} />
            <button className="btn sm">Compare ({selectedIds.size})</button>
            <button className="btn sm ghost">Export CSV</button>
          </div>
        </div>

        {/* right: parallel coords + loss curves + run detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: "14px 16px" }}>
            <RunningHead label="Hyperparameter sweep" meta="patchtst · 28 trials" />
            <ParallelHParams id="par-train" height={220} />
            <div className="meta" style={{ marginTop: 6 }}>brush any axis to highlight ·  ⌘click to invert</div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <RunningHead label="Loss curves · selected" meta={[...selectedIds].slice(0, 3).join(" · ")} />
            <LossCurves height={200} runs={["patchtst", "lstm", "dlinear"]} />
          </div>

          <div className="card" style={{ padding: "14px 18px" }}>
            <RunningHead label={active.status === "running" ? "Live · " + active.id : active.id} meta={`${active.model} · ${active.dataset}`} />
            <DetailRow k="status"  v={<StatusLabel value={active.status} />} />
            <DetailRow k="started" v={active.started} mono />
            <DetailRow k="duration" v={active.dur} mono />
            <DetailRow k="owner"   v={"@" + active.owner} />
            {active.err && <DetailRow k="error" v={<span style={{ color: "var(--bern-deep)" }}>{active.err}</span>} mono />}
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button className="btn sm">Open detail ↗</button>
              <button className="btn sm ghost">Re-queue</button>
              {active.status === "running" && <button className="btn sm danger">Stop</button>}
            </div>
          </div>
        </div>
      </div>
      <NextSteps title="Next from Train" items={[
        { lbl: "Fork the best run",     hint: "tweak hyperparams · launch a sweep", run: onAgent },
        { lbl: "Promote to Library",    hint: "make it reusable across projects",   run: () => nav("library") },
        { lbl: "Compare against baseline", hint: "chronos-2 zero-shot · MAE 9.81",   run: onAgent },
      ]} />
    </div>
  );
}

function DetailRow({ k, v, mono }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "6px 0", fontSize: 13, alignItems: "baseline" }}>
      <span className="meta">{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: mono ? 12 : 13, color: "var(--ink-soft)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { TrainPage });
