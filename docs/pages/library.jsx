// ──────────────────────────────────────────────────────────────
// LIULIAN — Library (cross-project catalog)
//   Models · viz cells · pipelines · agent threads
//   that are scoped beyond the current project.
// ──────────────────────────────────────────────────────────────

const LIBRARY_ITEMS = [
  { kind: "model",    id: "patchtst.v3.3",     name: "patchtst.v3.3",    origin: "aare-hydro / r-7c83",   scope: "team-shared", forks: 4, owner: "@lj",    by: "promoted Mon",       sub: "MAE 8.42 on swiss-river-1990" },
  { kind: "model",    id: "chronos-2.bench",   name: "chronos-2 · bench",origin: "etth-bench / r-3001",   scope: "team-shared", forks: 9, owner: "@ms",    by: "promoted 2026-04-29", sub: "zero-shot baseline" },
  { kind: "model",    id: "dlinear.v2",        name: "dlinear.v2",       origin: "aare-hydro / r-7a01",   scope: "org-public",  forks: 22,owner: "@lj",    by: "promoted 2026-02-11", sub: "the linear baseline · 0.04 M params" },
  { kind: "cell",     id: "cell-bern-7d",      name: "Bern · 7-day discharge", origin: "aare-hydro / scratch", scope: "team-shared", forks: 2, owner: "@lj", by: "shared 04-28",  sub: "line · station filter" },
  { kind: "cell",     id: "cell-hourly-ridge", name: "Hour-of-day ridges",     origin: "aare-hydro / scratch", scope: "team-shared", forks: 5, owner: "@lj", by: "shared 03-20",  sub: "ridge · 24 ridges · ts→hour" },
  { kind: "cell",     id: "cell-skill-drift",  name: "Skill drift · MAE rolling", origin: "ops",              scope: "org-public",  forks: 11,owner: "@ms", by: "shared 03-04",  sub: "line · 14d rolling window" },
  { kind: "pipeline", id: "pl-hydro-clean",    name: "hydrology · standard clean", origin: "aare-hydro / pipeline-04", scope: "team-shared", forks: 3, owner: "@lj", by: "shared 04-12", sub: "load · cast · impute · flag" },
  { kind: "pipeline", id: "pl-energy-resample",name: "energy · resample 15 → 60", origin: "demo-energy",         scope: "team-shared", forks: 1, owner: "@ms", by: "shared 02-08",  sub: "resample mean · drop na" },
  { kind: "agent",    id: "ag-alerts",         name: "alert-watcher agent",      origin: "aare-hydro / system", scope: "team-shared", forks: 0, owner: "@lj",    by: "shared 03-02", sub: "polls thresholds · pages on-call" },
  { kind: "agent",    id: "ag-brief",          name: "weekly-brief agent",       origin: "aare-hydro / system", scope: "org-public",  forks: 6, owner: "@lj",    by: "shared 03-02", sub: "drafts Monday 06:00 UTC" },
];

function LibraryPage({ onAgent, nav }) {
  const [kind, setKind] = React.useState("all");
  const [scope, setScope] = React.useState("all");
  const [active, setActive] = React.useState("patchtst.v3.3");
  const filtered = LIBRARY_ITEMS.filter(it =>
    (kind === "all" || it.kind === kind) &&
    (scope === "all" || it.scope === scope)
  );
  const it = LIBRARY_ITEMS.find(x => x.id === active) || filtered[0];

  return (
    <div className="page-enter" style={{ padding: 16 }}>
      <PageTitle
        kicker="Library · cross-project"
        title="Catalog"
        specimen={`${LIBRARY_ITEMS.length} entries · forkable across every project in the workspace`}
        right={<>
          <Segmented options={[
            { value: "all", label: "all" },
            { value: "model", label: "models" },
            { value: "cell", label: "cells" },
            { value: "pipeline", label: "pipelines" },
            { value: "agent", label: "agents" },
          ]} value={kind} onChange={setKind} />
          <button className="btn">+ Promote from this project</button>
        </>}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--hairline)", marginBottom: 0 }}>
        <span className="meta">Scope</span>
        <Segmented size="sm" options={[
          { value: "all",         label: "all" },
          { value: "private",     label: "private" },
          { value: "team-shared", label: "team" },
          { value: "org-public",  label: "org" },
        ]} value={scope} onChange={setScope} />
        <span className="meta" style={{ marginLeft: 12 }}>Origin</span>
        <Segmented size="sm" options={["all projects", "aare-hydro", "rhone-basin", "etth-bench"]} value="all projects" onChange={() => {}} />
        <span style={{ flex: 1 }} />
        <input placeholder="search the library…" style={{ flex: "0 0 260px", border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontSize: 12.5, outline: "none", background: "var(--surface)", fontFamily: "var(--sans)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "start", marginTop: 18 }}>
        {/* list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 130px 110px 70px", padding: "10px 16px", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
            {["kind", "name · origin", "scope", "owner · age", "forks"].map(h => <span key={h} className="meta">{h}</span>)}
          </div>
          {filtered.map((row, i) => {
            const isActive = row.id === (it && it.id);
            return (
              <div key={row.id} onClick={() => setActive(row.id)} className={isActive ? "ribbon-left" : ""}
                style={{ display: "grid", gridTemplateColumns: "80px 1fr 130px 110px 70px", padding: "13px 16px", borderBottom: i === filtered.length - 1 ? "none" : "1px solid var(--hairline)", alignItems: "center", cursor: "pointer", background: isActive ? "var(--surface-shade)" : "transparent" }}>
                <span className="meta" style={{ color: "var(--ink-muted)" }}>{row.kind}</span>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500 }}>{row.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>↳ {row.origin}</span>
                    <span className="meta" style={{ color: "var(--ink-faint)" }}>·</span>
                    <span className="meta" style={{ color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{row.sub}</span>
                  </div>
                </div>
                <ScopeChip scope={row.scope} />
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{row.owner}</div>
                  <div className="meta" style={{ marginTop: 2 }}>{row.by}</div>
                </div>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "right" }}>{row.forks}</span>
              </div>
            );
          })}
        </div>

        {/* detail panel */}
        <aside className="card" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span className="meta">{it.kind}</span>
            <ScopeChip scope={it.scope} />
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{it.forks} forks · {it.owner}</span>
          </div>
          <h3 className="display" style={{ fontSize: 28, margin: 0 }}>{it.name}</h3>
          <p className="display-italic" style={{ fontSize: 15, color: "var(--ink-muted)", margin: "8px 0 0", maxWidth: "44ch" }}>{it.sub}</p>

          <div className="div-h" style={{ margin: "16px 0" }} />

          <RunningHead label="Provenance" />
          <ProvRow k="origin"     v={it.origin} mono />
          <ProvRow k="promoted"   v={it.by} mono />
          <ProvRow k="lineage"    v={<span>{it.kind === "model" ? "trained on swiss-river-1990 v3.2.0 · 18,000 steps" : "—"}</span>} />
          <ProvRow k="signed"     v={<span><span className="mono">b7f2a1ce</span> by {it.owner}</span>} />

          <div className="div-h" style={{ margin: "16px 0" }} />

          <RunningHead label="Use in this project" />
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", fontSize: 14, lineHeight: 1.55, margin: "0 0 12px", maxWidth: "44ch" }}>
            Forking creates a project-local copy with lineage preserved. Changes don't ripple back unless you re-promote.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary">Fork into aare-hydro</button>
            <button className="btn">Open original ↗</button>
          </div>

          <div className="div-h" style={{ margin: "16px 0" }} />

          <RunningHead label="Used by" meta="4 places" />
          {[
            { proj: "aare-hydro",  what: "Forecast canvas · production",     at: "since 05-12" },
            { proj: "rhone-basin", what: "Training run · r-9c01 · pending",  at: "today 03:14" },
            { proj: "etth-bench",  what: "Comparison report · monthly",       at: "since 04-21" },
            { proj: "demo-energy", what: "Scratch · cell-014",                at: "since 04-08" },
          ].map((u, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 70px", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 12.5 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{u.proj}</span>
              <span>{u.what}</span>
              <span className="meta" style={{ textAlign: "right" }}>{u.at}</span>
            </div>
          ))}
        </aside>
      </div>

      <NextSteps title="Next steps from Library"
        items={[
          { lbl: "Open it in Train",          hint: "fork → adapt → re-train", run: () => nav("train") },
          { lbl: "Pin it to Today",            hint: "you'll see new forks fly by", run: () => nav("today") },
          { lbl: "Ask the agent to compare",   hint: "vs. your current project's best", run: onAgent },
        ]} />
    </div>
  );
}

function ScopeChip({ scope }) {
  const label = scope === "team-shared" ? "team" : scope === "org-public" ? "org" : scope === "private" ? "private" : scope;
  const color = scope === "team-shared" ? "var(--ink)" : scope === "org-public" ? "var(--bern)" : "var(--ink-muted)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "1px 7px", border: "1px solid var(--hairline-strong)", borderRadius: 9999,
      fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
      color, background: scope === "org-public" ? "var(--bern-tint)" : "var(--surface)",
    }}>{label}</span>
  );
}

function ProvRow({ k, v, mono }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "5px 0", fontSize: 13, alignItems: "baseline" }}>
      <span className="meta">{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: mono ? 12 : 13, color: "var(--ink-soft)" }}>{v}</span>
    </div>
  );
}

// ── shared next-step strip — used across pages ────────────────
function NextSteps({ title, items }) {
  return (
    <section style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--hairline)" }}>
      <div className="meta" style={{ marginBottom: 12, color: "var(--bern)" }}>{title || "Next"}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12 }}>
        {items.map((it, i) => (
          <button key={i} onClick={it.run} className="btn" style={{
            justifyContent: "flex-start", padding: "12px 14px", textAlign: "left", fontWeight: 400,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500, marginBottom: 4 }}>{it.lbl}</div>
              <div className="meta" style={{ letterSpacing: 0, textTransform: "none", color: "var(--ink-muted)" }}>{it.hint}</div>
            </span>
            <span className="mono" style={{ color: "var(--bern)", fontSize: 12 }}>→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { LibraryPage, NextSteps, ScopeChip });
