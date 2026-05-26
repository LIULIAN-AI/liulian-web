// ──────────────────────────────────────────────────────────────
// LIULIAN — Data workspace (the strengthened one)
//   Dataset list + detail · schema · table · quicklook · transform
//   · import · export · manifest · share
// ──────────────────────────────────────────────────────────────

function DataPage({ onAgent, nav }) {
  const [activeId, setActiveId] = React.useState("swiss-river-1990");
  const [view, setView]     = React.useState("overview"); // overview / schema / table / explore / pipeline / manifest / share
  const [showImport, setShowImport] = React.useState(false);
  const ds = DATASETS.find(d => d.id === activeId);

  return (
    <div className="page-enter" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, padding: 16, alignItems: "start" }}>
      <DatasetList activeId={activeId} setActiveId={setActiveId} onImport={() => setShowImport(true)} />

      <div style={{ minWidth: 0 }}>
        <DatasetHeader ds={ds} onImport={() => setShowImport(true)} onAgent={onAgent} />
        <SubNav view={view} setView={setView} ds={ds} />

        <div style={{ marginTop: 14 }}>
          {view === "overview" && <DatasetOverview ds={ds} />}
          {view === "schema"   && <DatasetSchema   ds={ds} />}
          {view === "table"    && <DatasetTable    ds={ds} />}
          {view === "explore"  && <DatasetExplore  ds={ds} />}
          {view === "pipeline" && <DatasetPipeline ds={ds} />}
          {view === "manifest" && <DatasetManifest ds={ds} />}
          {view === "share"    && <DatasetShare    ds={ds} />}
        </div>
        <DataNextSteps ds={ds} onAgent={onAgent} nav={nav} />
      </div>

      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
    </div>
  );
}

// next-step strip that appears at the bottom of each view
function DataNextSteps({ ds, onAgent, nav }) {
  return (
    <NextSteps title={`Next from ${ds.name}`} items={[
      { lbl: "Train a baseline",    hint: "patchtst on this dataset · ~ 1h compute", run: () => nav("train") },
      { lbl: "Open in Visualize",   hint: "start a new chart cell · scratch · auto-saved", run: () => nav("visualize") },
      { lbl: "Ask the agent",        hint: "describe what you want to know — agent will pick the chart", run: onAgent },
    ]} />
  );
}

// ─────────────────── left rail ───────────────────
function DatasetList({ activeId, setActiveId, onImport }) {
  const [q, setQ] = React.useState("");
  const filtered = DATASETS.filter(d => (d.name + " " + d.id + " " + d.domain).toLowerCase().includes(q.toLowerCase()));
  return (
    <nav className="card" style={{ padding: 0, maxHeight: "calc(100vh - var(--header-h) - var(--sub-h) - 32px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 14px", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span className="meta">Datasets · {DATASETS.length}</span>
          <span style={{ flex: 1 }} />
          <button className="btn sm" onClick={onImport}>+ import</button>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter · type to search"
          style={{ width: "100%", border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontSize: 12.5, fontFamily: "var(--sans)", outline: "none", background: "var(--canvas-warm)" }} />
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: 1 }}>
        {["hydrology", "energy", "traffic", "weather"].map(domain => {
          const inDomain = filtered.filter(d => d.domain === domain);
          if (!inDomain.length) return null;
          return (
            <li key={domain}>
              <div className="meta" style={{ padding: "10px 14px 4px", borderBottom: "1px solid var(--hairline)" }}>{domain} · {inDomain.length}</div>
              {inDomain.map(d => {
                const active = d.id === activeId;
                return (
                  <div key={d.id} onClick={() => setActiveId(d.id)} className={active ? "ribbon-left" : ""}
                    style={{ padding: "10px 14px 10px 16px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: active ? "var(--surface-shade)" : "transparent" }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>{d.name}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{d.sha}</span>
                      <span className="meta" style={{ fontSize: 9 }}>{(d.rows / 1000).toFixed(0)}k rows</span>
                    </div>
                  </div>
                );
              })}
            </li>
          );
        })}
      </ul>

      <footer style={{ padding: "8px 14px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 6, alignItems: "center" }}>
        <span className="meta" style={{ whiteSpace: "nowrap" }}>storage · s3</span>
        <span style={{ flex: 1 }} />
        <span className="meta">1.4 GB</span>
      </footer>
    </nav>
  );
}

// ─────────────────── header band ───────────────────
function DatasetHeader({ ds, onImport, onAgent }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", gap: 24, padding: "8px 0 22px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="meta" style={{ marginBottom: 6 }}>
          Dataset · {ds.domain} · manifest {ds.manifest}
          <span style={{ margin: "0 8px", color: "var(--ink-quiet)" }}>·</span>
          <span className="mono" style={{ color: "var(--ink-muted)" }}>sha256 {ds.sha}</span>
        </div>
        <h1 className="display" style={{ fontSize: 44, margin: 0 }}>{ds.name}</h1>
        <p className="display-italic" style={{ margin: "8px 0 0", fontSize: 15.5, color: "var(--ink-muted)", maxWidth: "60ch" }}>
          {ds.description}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn">Open in Visualize ↗</button>
        <button className="btn">Use in Train ↗</button>
        <div className="div-v" style={{ marginInline: 4 }} />
        <button className="btn" onClick={onImport}>+ Import</button>
        <button className="btn" title="Export"><span className="mono" style={{ fontSize: 11 }}>↓</span>&nbsp;Export</button>
        <button className="btn primary" onClick={onAgent}>Ask agent</button>
      </div>
    </header>
  );
}

// ─────────────────── sub-nav for the dataset surface ───────────────────
function SubNav({ view, setView, ds }) {
  const items = [
    { id: "overview", label: "Overview",   meta: `${ds.rows.toLocaleString()} rows`  },
    { id: "schema",   label: "Schema",     meta: `${ds.features + 2} fields` },
    { id: "table",    label: "Table",      meta: "preview" },
    { id: "explore",  label: "Explore",    meta: "quicklook" },
    { id: "pipeline", label: "Pipeline",   meta: "4 steps" },
    { id: "manifest", label: "Manifest",   meta: "yaml" },
    { id: "share",    label: "Share",      meta: "public" },
  ];
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: "1px solid var(--hairline)" }}>
      {items.map(it => {
        const active = it.id === view;
        return (
          <button key={it.id} onClick={() => setView(it.id)}
            style={{
              background: "transparent", border: "none", padding: "10px 14px",
              borderBottom: active ? "1px solid var(--bern)" : "1px solid transparent",
              marginBottom: -1, cursor: "pointer",
              fontFamily: "var(--sans)", fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? "var(--ink)" : "var(--ink-muted)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
            {it.label}
            <span className="meta" style={{ color: "var(--ink-faint)", fontSize: 9 }}>{it.meta}</span>
          </button>
        );
      })}
      <span style={{ flex: 1 }} />
      <span className="meta" style={{ paddingRight: 10 }}>updated {ds.updated} UTC</span>
    </nav>
  );
}

// ─────────────────── OVERVIEW ───────────────────
function DatasetOverview({ ds }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: 0, overflow: "hidden" }}>
          <KPI label="Rows"      value={(ds.rows / 1000).toFixed(0)} unit="k" sub={`${ds.freq} cadence`} />
          <KPI label="Entities"  value={ds.stations} sub={ds.domain === "hydrology" ? "stations · graph" : ds.domain === "energy" ? "series" : "sensors"} />
          <KPI label="Features"  value={ds.features} sub="incl. id + ts" />
          <KPI label="Quality"   value={(ds.quality * 100).toFixed(1)} unit="%" sub="null + bound checks" />
          <KPI label="Size"      value={ds.size.split(" ")[0]} unit={ds.size.split(" ")[1]} sub="parquet · zstd" />
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Coverage" meta={ds.range} />
          <div style={{ height: 110 }}>
            <GenericLine id="ovr-coverage" data={Array.from({ length: 60 }, (_, i) => 0.78 + Math.sin(i / 6) * 0.08 + (i > 50 ? -0.15 : 0))} color="#131313" fill="rgba(226,6,19,0.08)" height={110} />
          </div>
          <div className="meta" style={{ marginTop: 8 }}>0.984 rolling coverage · 12 gap-windows · longest gap 4 h on 2023-08-04 · imputed by linear</div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Quality findings" meta={`${ds.fields.length || ds.features} fields checked`} />
          {[
            { sev: "ok",   text: "All required fields present and typed.", at: "08:14" },
            { sev: "warn", text: "discharge: 0.012% nulls — within tolerance (≤ 0.1%).", at: "08:14" },
            { sev: "warn", text: "temperature: 0.041% nulls in winter blocks.",     at: "08:14" },
            { sev: "ok",   text: "ts monotonic; no duplicate keys across (ts, station_id).", at: "08:14" },
            { sev: "info", text: "11 outlier points beyond 5σ flagged but kept (storms).", at: "08:14" },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 60px", gap: 12, padding: "9px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: row.sev === "warn" ? 600 : 400, fontStyle: row.sev === "ok" ? "italic" : "normal", color: row.sev === "warn" ? "var(--bern-deep)" : row.sev === "info" ? "var(--ink-muted)" : "var(--ink)", fontFamily: row.sev === "ok" ? "var(--serif)" : "var(--sans)" }}>{row.sev}</span>
              <span style={{ fontSize: 13 }}>{row.text}</span>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", textAlign: "right" }}>{row.at}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Versions" meta="last 4" />
          {[
            { ver: "v3.2.1", sha: "b7f2a1ce", at: "2026-05-12 04:00", note: "Re-imported May BAFU snapshot. +14k rows." , author: "lj" },
            { ver: "v3.2.0", sha: "a8b211ef", at: "2026-04-21 11:30", note: "Add precip from ETH IDAweb mirror.",         author: "lj" },
            { ver: "v3.1.0", sha: "44c0b1ab", at: "2026-03-04 09:01", note: "Switch ts unit to UTC ISO-8601.",            author: "ms" },
            { ver: "v3.0.0", sha: "1ff03d22", at: "2026-01-14 17:22", note: "Initial manifest v3 — added is_snowmelt flag.", author: "lj" },
          ].map((v, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 90px 1fr 130px 60px", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 12.5 }}>
              <span className="mono" style={{ fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--ink)" : "var(--ink-muted)" }}>{v.ver}{i === 0 && <span className="meta" style={{ marginLeft: 6, color: "var(--bern)" }}>HEAD</span>}</span>
              <HashChip value={v.sha} />
              <span>{v.note}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{v.at}</span>
              <span className="meta" style={{ textAlign: "right" }}>@{v.author}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button className="btn sm">Compare v3.2.1 ↔ v3.2.0</button>
            <button className="btn sm ghost">view log</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="At a glance" />
          <DetailRow k="Source"   v={ds.source} />
          <DetailRow k="License"  v={ds.license} />
          <DetailRow k="Range"    v={ds.range} mono />
          <DetailRow k="Cadence"  v={ds.freq} mono />
          <DetailRow k="Horizon"  v={ds.horizon} mono />
          <DetailRow k="Stored"   v={"s3://liulian-warm/" + ds.id + "/v3"} mono />
          <DetailRow k="Format"   v="parquet · zstd · 128 MB shards" />
        </div>

        <MarginNote>
          A LIULIAN dataset is a folder of time-series shards plus a YAML manifest that pins schema, topology, and an integrity hash. The manifest is the contract; the shards are interchangeable. To break the contract, bump the manifest version.
          <div className="meta" style={{ marginTop: 12, fontStyle: "normal" }}>⌘K → "compare manifests"</div>
        </MarginNote>

        <div className="card" style={{ padding: "14px 18px" }}>
          <RunningHead label="Downstream uses" meta="6 last week" />
          {[
            { type: "Run",     name: "patchtst · seed=42",   meta: "r-7c83" },
            { type: "Run",     name: "lstm · seed=42",       meta: "r-7c89" },
            { type: "Report",  name: "Swiss-River · Overview", meta: "swiss-river-overview" },
            { type: "Chart",   name: "Q95 distribution",     meta: "cell-022" },
          ].map((u, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 10, padding: "7px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 12.5 }}>
              <span className="meta">{u.type}</span>
              <span>{u.name}</span>
              <HashChip value={u.meta} />
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "14px 18px" }}>
          <RunningHead label="Permissions" meta="2 viewers · 1 editor" />
          <div className="meta" style={{ marginTop: 2 }}>this dataset is internal to <span className="mono" style={{ color: "var(--ink)" }}>liulian/aare-hydro</span></div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button className="btn sm">+ invite</button>
            <button className="btn sm ghost">make public</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ k, v, mono }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, padding: "6px 0", fontSize: 13, alignItems: "baseline" }}>
      <span className="meta">{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: mono ? 12 : 13, color: "var(--ink-soft)" }}>{v}</span>
    </div>
  );
}

// ─────────────────── SCHEMA ───────────────────
function DatasetSchema({ ds }) {
  const fields = ds.fields.length ? ds.fields : [
    { name: "ts", type: "timestamp", null: 0, uniq: ds.rows, ex: "1990-01-01T00:00:00Z" },
    { name: "id", type: "string",    null: 0, uniq: ds.stations, ex: "sensor-0" },
  ];
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 110px 140px 1fr", padding: "12px 16px", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
        <span className="meta">#</span>
        <span className="meta">field · type</span>
        <span className="meta">null%</span>
        <span className="meta">unique</span>
        <span className="meta">range</span>
        <span className="meta">distribution</span>
        <span className="meta">example · unit</span>
      </div>
      {fields.map((f, i) => (
        <div key={f.name} style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 110px 140px 1fr", padding: "12px 16px", borderBottom: i === fields.length - 1 ? "none" : "1px solid var(--hairline)", alignItems: "center" }}>
          <span className="meta">{(i + 1).toString().padStart(2, "0")}</span>
          <div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
            <div className="meta" style={{ marginTop: 2 }}>{f.type}{f.unit ? ` · ${f.unit}` : ""}</div>
          </div>
          <span className="mono" style={{ fontSize: 12, color: f.null > 0.03 ? "var(--bern-deep)" : "var(--ink-muted)" }}>{(f.null * 100).toFixed(3)}%</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{f.uniq.toLocaleString()}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{f.min !== undefined ? `${f.min} – ${f.max}` : "—"}</span>
          {f.type === "float64" || f.type === "float32" ? <MiniHistogram seed={i * 7 + 3} color="var(--bern)" /> : f.type === "bool" ? <div style={{ display: "flex", gap: 2, alignItems: "center" }}><div style={{ width: 60, height: 16, background: "var(--bern-tint)", border: "1px solid var(--hairline)" }} /><div style={{ width: 14, height: 16, background: "var(--surface)", border: "1px solid var(--hairline)" }} /></div> : <div className="meta">—</div>}
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{f.ex}{f.unit ? <span style={{ color: "var(--ink-faint)" }}> · {f.unit}</span> : ""}</span>
        </div>
      ))}

      <div style={{ display: "flex", padding: "12px 16px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", gap: 8, alignItems: "center" }}>
        <button className="btn sm">+ add field</button>
        <button className="btn sm ghost">cast types</button>
        <button className="btn sm ghost">rename</button>
        <span style={{ flex: 1 }} />
        <span className="meta">edits land in pipeline · not on raw shards</span>
      </div>
    </div>
  );
}

// ─────────────────── TABLE ───────────────────
function DatasetTable({ ds }) {
  const [edit, setEdit] = React.useState(null); // {r,c}
  const [data, setData] = React.useState(TABLE_SAMPLE);
  const [sortBy, setSortBy] = React.useState(null);
  const [filter, setFilter] = React.useState("");

  const cols = [
    { k: "_i",          lbl: "#",            w: 48,  meta: "row",        align: "right", num: true },
    { k: "ts",          lbl: "ts",           w: 160, meta: "timestamp",  mono: true },
    { k: "station_id",  lbl: "station_id",   w: 130, meta: "string"     },
    { k: "discharge",   lbl: "discharge",    w: 130, meta: "float64 · m³/s", num: true, mono: true },
    { k: "temperature", lbl: "temperature",  w: 130, meta: "float32 · °C",   num: true, mono: true },
    { k: "precip",      lbl: "precip",       w: 110, meta: "float32 · mm/h", num: true, mono: true },
    { k: "is_snowmelt", lbl: "is_snowmelt",  w: 110, meta: "bool",       align: "center" },
  ];

  let rows = data;
  if (filter) {
    const t = filter.toLowerCase();
    rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(t));
  }
  if (sortBy) rows = [...rows].sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));

  function commit(rIdx, key, value) {
    setData(d => d.map((r, i) => i === rIdx ? { ...r, [key]: value } : r));
    setEdit(null);
  }

  return (
    <div>
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 0 14px" }}>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="filter — try `station_id = aare-bern`"
          style={{ flex: "0 0 320px", border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontSize: 12.5, fontFamily: "var(--sans)", outline: "none", background: "var(--surface)" }} />
        <button className="btn sm">+ filter</button>
        <button className="btn sm ghost">+ derived col</button>
        <button className="btn sm ghost">sample · 1k</button>
        <span style={{ flex: 1 }} />
        <span className="meta">{rows.length.toLocaleString()} of {ds.rows.toLocaleString()} · click cell to edit</span>
        <button className="btn sm">Export ↓</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "auto", maxHeight: "calc(100vh - 320px)" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--surface-shade)", zIndex: 2 }}>
            <tr>
              {cols.map(c => (
                <th key={c.k} onClick={() => setSortBy(c.k)} style={{
                  textAlign: c.align || "left",
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--hairline)",
                  borderRight: "1px solid var(--hairline)",
                  fontWeight: 500,
                  minWidth: c.w, width: c.w,
                  cursor: "pointer",
                  fontFamily: c.mono ? "var(--mono)" : "var(--sans)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: c.align === "right" ? "flex-end" : c.align === "center" ? "center" : "flex-start" }}>
                    <span>{c.lbl}</span>
                    {sortBy === c.k && <span className="meta">↑</span>}
                  </div>
                  <div className="meta" style={{ marginTop: 3, fontSize: 9, letterSpacing: "0.06em" }}>{c.meta}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 60).map((row, rIdx) => (
              <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "var(--surface)" : "var(--surface-shade)" }}>
                {cols.map(c => {
                  const editing = edit && edit.r === rIdx && edit.c === c.k;
                  const val = row[c.k];
                  return (
                    <td key={c.k}
                      onClick={() => c.k !== "_i" && setEdit({ r: rIdx, c: c.k })}
                      style={{
                        textAlign: c.align || (c.num ? "right" : "left"),
                        padding: editing ? 0 : "6px 12px",
                        borderBottom: "1px solid var(--hairline)",
                        borderRight: "1px solid var(--hairline)",
                        color: c.k === "_i" ? "var(--ink-faint)" : "var(--ink-soft)",
                        fontFamily: c.mono || c.num ? "var(--mono)" : "var(--sans)",
                        cursor: c.k === "_i" ? "default" : "text",
                        position: "relative",
                      }}>
                      {editing ? (
                        <input autoFocus defaultValue={val}
                          onBlur={e => commit(rIdx, c.k, c.num ? +e.target.value : e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { commit(rIdx, c.k, c.num ? +e.target.value : e.target.value); } if (e.key === "Escape") { setEdit(null); } }}
                          style={{ width: "100%", border: "2px solid var(--bern)", padding: "5px 10px", fontFamily: "inherit", fontSize: "inherit", textAlign: c.align || (c.num ? "right" : "left"), background: "var(--bern-tint)", outline: "none" }} />
                      ) : (
                        typeof val === "boolean" ? <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: val ? "var(--bern-deep)" : "var(--ink-faint)" }}>{val ? "true" : "false"}</span> :
                        typeof val === "number" ? val.toFixed(c.k === "discharge" || c.k === "temperature" ? 2 : 2) :
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
        <span className="meta">showing {Math.min(60, rows.length)} / {ds.rows.toLocaleString()}</span>
        <span style={{ flex: 1 }} />
        <button className="btn sm ghost" disabled>← prev</button>
        <button className="btn sm ghost">next →</button>
      </div>
    </div>
  );
}

// ─────────────────── EXPLORE (quicklook gallery) ───────────────────
function DatasetExplore({ ds }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <QuickCard title="discharge · all stations" sub="bandwidth, lin" mono="m³/s · 1h"><GenericLine id="ex-1" data={Array.from({ length: 96 }, (_, i) => 300 + Math.sin(i / 8) * 40 + Math.sin(i / 23) * 25 + (i / 4))} color="#131313" /></QuickCard>
        <QuickCard title="discharge · aare-bern" sub="last 7 days" mono="hourly"><GenericLine id="ex-2" data={Array.from({ length: 168 }, (_, i) => 412 + Math.sin(i / 6) * 30 + (i > 120 ? (i - 120) * 1.4 : 0))} color="#E20613" fill="rgba(226,6,19,0.10)" /></QuickCard>
        <QuickCard title="precip × discharge" sub="lagged correlation" mono="ρ = 0.62 @ lag 4h"><ScatterPlaceholder /></QuickCard>
        <QuickCard title="discharge by hour-of-day" sub="ridge" mono="24 ridges"><RidgePlaceholder /></QuickCard>
        <QuickCard title="missing-by-station" sub="heatmap" mono="28 × 365"><HeatmapPlaceholder /></QuickCard>
        <QuickCard title="discharge histogram" sub="Q05–Q95 marked" mono="binwidth 5"><MiniHistogram seed={9} color="var(--bern)" width={300} height={120} /></QuickCard>
      </div>
      <aside className="card" style={{ padding: "14px 18px" }}>
        <RunningHead label="Pick a chart" />
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", margin: "0 0 12px", fontSize: 14, lineHeight: 1.55 }}>
          What question are you asking? Pick the family — LIULIAN suggests a sensible default chart and pre-fills the spec.
        </p>
        {[
          ["Compare",      "bar · grouped, lollipop"],
          ["Trend",        "line · multi-line, step"],
          ["Distribution", "histogram · density · box · ridge"],
          ["Composition",  "stacked area · waffle"],
          ["Relationship", "scatter · bin-density · parallel"],
          ["Geo",          "choropleth · station map"],
        ].map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 14px", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", cursor: "pointer", fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{row[0]}</span>
            <span className="meta" style={{ letterSpacing: 0, textTransform: "none", color: "var(--ink-muted)" }}>{row[1]}</span>
            <span className="meta">›</span>
          </div>
        ))}
        <div className="meta" style={{ marginTop: 12 }}>or →</div>
        <button className="btn" style={{ width: "100%", marginTop: 6, justifyContent: "center" }}>Open Visualize Studio</button>
      </aside>
    </div>
  );
}

function QuickCard({ title, sub, mono, children }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
          <div className="meta" style={{ marginTop: 2 }}>{sub}</div>
        </div>
        <span className="meta" style={{ textAlign: "right" }}>{mono}</span>
      </div>
      <div style={{ height: 130, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>{children}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
        <button className="btn sm ghost" style={{ padding: "2px 6px", fontSize: 10 }}>edit spec</button>
        <button className="btn sm ghost" style={{ padding: "2px 6px", fontSize: 10 }}>pin to report</button>
        <span style={{ flex: 1 }} />
        <span className="meta">cell-{(title.length * 31 % 999).toString().padStart(3, "0")}</span>
      </div>
    </div>
  );
}
function ScatterPlaceholder() {
  const r = rng(5);
  const pts = Array.from({ length: 60 }, () => [r() * 280 + 10, 110 - r() * 90 - 10]);
  return <svg width="300" height="130" viewBox="0 0 300 130">{pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill="#131313" opacity={0.65} />)}<line x1="10" y1="100" x2="290" y2="32" stroke="#E20613" strokeDasharray="3 3" strokeWidth="1" /></svg>;
}
function RidgePlaceholder() {
  return <svg width="300" height="130" viewBox="0 0 300 130">{Array.from({ length: 6 }, (_, k) => {
    const y0 = 20 + k * 16;
    const r = rng(k + 21);
    const d = Array.from({ length: 60 }, (_, i) => {
      const x = i / 60;
      const peak = Math.exp(-Math.pow((x - 0.4 - k * 0.05) * 5, 2));
      return [i * 5, y0 - peak * 14 - r() * 1.5];
    });
    return <path key={k} d={d.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ") + ` L 300,${y0} L 0,${y0} Z`} fill="#FDEBEC" stroke="#E20613" strokeWidth="0.8" opacity={1 - k * 0.08} />;
  })}</svg>;
}
function HeatmapPlaceholder() {
  const r = rng(7);
  return <svg width="300" height="130" viewBox="0 0 300 130">{Array.from({ length: 24 }, (_, j) => Array.from({ length: 12 }, (_, i) => {
    const v = r();
    return <rect key={j + "-" + i} x={i * 25} y={j * 5.4} width={24} height={5} fill="#E20613" opacity={v * 0.7 + 0.05} />;
  }))}</svg>;
}

// ─────────────────── PIPELINE ───────────────────
function DatasetPipeline({ ds }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>
      <div className="card" style={{ padding: "16px 18px" }}>
        <RunningHead label="Pipeline" meta="4 steps · rebuilds in 38 s" />
        {[
          { idx: "01", name: "load",       fn: "read_parquet(s3://liulian-warm/swiss-river-1990/v3/*.parquet)", note: "412 MB · 1.84M rows" },
          { idx: "02", name: "cast",       fn: "cast(ts → datetime64[ns, UTC]); cast(discharge → float64)",      note: "0 errors" },
          { idx: "03", name: "impute",     fn: "linear_interpolate(temperature, max_gap='2h')",                  note: "1832 imputed" },
          { idx: "04", name: "flag",       fn: "is_snowmelt = (temperature > 0) & (precip == 0) & (alt > 1500)",  note: "computed" },
        ].map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 100px 1fr 110px 20px", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : "1px solid var(--hairline)", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>{s.idx}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 500 }}>{s.name}</span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-soft)", overflowWrap: "anywhere" }}>{s.fn}</span>
            <span className="meta">{s.note}</span>
            <button className="btn ghost sm" style={{ padding: "2px 6px" }}>edit</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <button className="btn sm">+ step</button>
          <button className="btn sm ghost">drag to reorder</button>
          <span style={{ flex: 1 }} />
          <button className="btn primary sm">Rebuild → v3.2.2</button>
        </div>
      </div>

      <MarginNote>
        The pipeline is the only writer. Raw shards are immutable; every transformation is a step here. Rebuild bumps a new manifest version — old downstream runs keep pointing at the version they were trained on.
      </MarginNote>
    </div>
  );
}

// ─────────────────── MANIFEST ───────────────────
function DatasetManifest({ ds }) {
  const yaml = `# liulian-manifest · v${ds.manifest.replace('v','')}
id: ${ds.id}
name: "${ds.name}"
domain: ${ds.domain}
license: ${ds.license}
source: ${ds.source}

range:
  start: 1990-01-01T00:00:00Z
  end:   2024-12-31T23:00:00Z
  cadence: 1h

shape:
  rows:    ${ds.rows}
  entities: ${ds.stations}
  features: ${ds.features}

schema:
  ts:           { type: timestamp, tz: UTC, required: true }
  station_id:   { type: string,    fk: stations.id }
  discharge:    { type: float64,   unit: "m³/s",  min: 0,  max: 4000 }
  temperature:  { type: float32,   unit: "°C",    min: -20, max: 40 }
  precip:       { type: float32,   unit: "mm/h",  min: 0,  max: 200 }
  is_snowmelt:  { type: bool }

topology:
  graph:        swiss-river-network/v2.0
  primary_key:  [ts, station_id]
  ordering:     ts ascending

quality:
  null_tolerance:   0.001
  monotonic_ts:     strict
  duplicate_keys:   forbid
  outlier_policy:   keep+flag (z>5)

storage:
  format:       parquet
  compression:  zstd
  shard_bytes:  128 MB
  uri:          s3://liulian-warm/${ds.id}/v3/

integrity:
  sha256:       ${ds.sha}...
  signed_by:    @lj  on  ${ds.updated}
`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="meta">manifest.yaml · {ds.manifest}</span>
          <span style={{ flex: 1 }} />
          <button className="btn sm ghost">copy</button>
          <button className="btn sm ghost">download</button>
          <button className="btn sm">edit</button>
        </div>
        <pre className="mono" style={{ margin: 0, padding: "16px 20px", fontSize: 12, lineHeight: 1.7, color: "var(--ink-soft)", overflowX: "auto", whiteSpace: "pre", maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>{yaml}</pre>
      </div>
      <MarginNote>
        The manifest is editable but versioned. Edits do not retroactively rewrite the shards — they create a candidate next version. Promotion to <em>HEAD</em> happens only after the integrity check passes.
      </MarginNote>
    </div>
  );
}

// ─────────────────── SHARE ───────────────────
function DatasetShare({ ds }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Public read access" meta="off · invite-only" />
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink-muted)", maxWidth: "52ch", marginTop: 0 }}>
            Public datasets can be read by anyone with the URL. Writes always require an editor role.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <code className="mono" style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--canvas-warm)", fontSize: 12 }}>https://liulian.app/d/{ds.id}</code>
            <button className="btn sm">copy</button>
            <button className="btn sm">make public</button>
          </div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Programmatic access" />
          <pre className="mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7, color: "var(--ink-soft)", padding: "12px 14px", background: "var(--surface-shade)", borderRadius: 8, overflowX: "auto" }}>{`from liulian import Dataset
ds = Dataset.load("${ds.id}", version="${ds.manifest}")
df = ds.read(stations=["aare-bern"], range="last:7d")
df.head()`}</pre>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <RunningHead label="Export" meta="parquet · csv · jsonl · ipc" />
          {[
            ["parquet · zstd", "412 MB · native"],
            ["csv · gzip",     "188 MB · 1.84M rows"],
            ["jsonl · gzip",   "240 MB · streamable"],
            ["arrow · ipc",    "402 MB · zero-copy"],
            ["webdataset · tar","ML-ready · sharded"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 10, padding: "9px 0", borderTop: i === 0 ? "none" : "1px dashed var(--hairline)", alignItems: "center", fontSize: 13 }}>
              <span>{k}</span>
              <span className="meta" style={{ color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none" }}>{v}</span>
              <button className="btn sm ghost" style={{ justifyContent: "flex-end" }}>download ↓</button>
            </div>
          ))}
        </div>
      </div>
      <MarginNote>
        Sharing a dataset shares the <em>contract</em>, not the bytes. Downstream consumers receive a verifiable manifest; the shards are streamed on demand from the warm tier.
      </MarginNote>
    </div>
  );
}

// ─────────────────── IMPORT DIALOG ───────────────────
function ImportDialog({ onClose }) {
  const [step, setStep] = React.useState("source"); // source · preview · finalize
  const [mode, setMode] = React.useState("file");
  const [drag, setDrag] = React.useState(false);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,19,19,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: step === "preview" ? 980 : 760, maxWidth: "94vw", maxHeight: "88vh", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, overflow: "hidden", boxShadow: "0 28px 60px rgba(19,19,19,0.18)", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "16px 22px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center" }}>
          <div>
            <div className="meta">Workspace · Data · The Annotated Drop</div>
            <h2 className="display" style={{ fontSize: 24, margin: "4px 0 0" }}>Import a dataset</h2>
          </div>
          <span style={{ flex: 1 }} />
          <div className="meta" style={{ marginRight: 16 }}>step {step === "source" ? "1" : step === "preview" ? "2" : "3"} of 3 · {step === "source" ? "source" : step === "preview" ? "preview" : "finalize"}</div>
          <button className="btn ghost" onClick={onClose}>esc</button>
        </header>
        {step === "source"   && <SourceStep   mode={mode} setMode={setMode} drag={drag} setDrag={setDrag} onPreview={() => setStep("preview")} onClose={onClose} />}
        {step === "preview"  && <PreviewStep  onBack={() => setStep("source")} onCommit={() => setStep("finalize")} />}
        {step === "finalize" && <FinalizeStep onClose={onClose} />}
      </div>
    </div>
  );
}

function SourceStep({ mode, setMode, drag, setDrag, onPreview, onClose }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", flex: 1, minHeight: 0 }}>
      <nav style={{ padding: "12px 0", borderRight: "1px solid var(--hairline)", overflowY: "auto" }}>
        {[
          { id: "file",  lbl: "Upload file",  meta: "csv · parquet · jsonl" },
          { id: "url",   lbl: "From URL",     meta: "http · s3 · gs" },
          { id: "sql",   lbl: "SQL query",    meta: "postgres · timescale" },
          { id: "hf",    lbl: "HuggingFace",  meta: "🤗 datasets" },
          { id: "paste", lbl: "Paste",        meta: "csv · markdown" },
          { id: "code",  lbl: "Code",         meta: "python · pandas" },
        ].map(m => {
          const active = m.id === mode;
          return (
            <div key={m.id} onClick={() => setMode(m.id)} className={active ? "ribbon-left" : ""}
              style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: active ? "var(--surface-shade)" : "transparent" }}>
              <div style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>{m.lbl}</div>
              <div className="meta" style={{ marginTop: 2 }}>{m.meta}</div>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: 22, overflowY: "auto", minHeight: 0 }}>
        {mode === "file" && (
          <div>
            <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); }}
              style={{ height: 220, border: "1px dashed " + (drag ? "var(--bern)" : "var(--hairline-strong)"), borderRadius: 10, background: drag ? "var(--bern-tint)" : "var(--canvas-warm)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "var(--ink-soft)" }}>Drop a CSV, Parquet, or JSONL file here</span>
              <span className="meta">or</span>
              <button className="btn">Choose file</button>
              <span className="meta" style={{ marginTop: 8, color: "var(--ink-faint)" }}>up to 5 GB · sharded automatically</span>
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Field label="dataset id"   placeholder="e.g. swiss-temp-2025" />
              <Field label="primary key"  placeholder="ts" />
              <Field label="entity column" placeholder="station_id" />
            </div>
          </div>
        )}
        {mode === "url" && (
          <div>
            <Field label="URL" placeholder="https://… or s3://…" full />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <Field label="auth header (optional)" placeholder="Bearer …" />
              <Field label="format" placeholder="auto-detect" />
            </div>
            <div className="meta" style={{ marginTop: 12 }}>LIULIAN will fetch the URL server-side, infer the schema, and present an annotated preview.</div>
          </div>
        )}
        {mode === "sql" && (
          <div>
            <Field label="connection" placeholder="postgres://…@db:5432/sensors" full />
            <div style={{ marginTop: 10 }}>
              <div className="meta" style={{ marginBottom: 6 }}>query</div>
              <textarea defaultValue={`SELECT ts, station_id, discharge\nFROM hydro_readings\nWHERE ts > now() - interval '7 days'`} rows={6} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 12, padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 8, background: "var(--canvas-warm)", outline: "none" }} />
            </div>
          </div>
        )}
        {mode === "hf"    && <div><Field label="repo" placeholder="autogluon/chronos_datasets" full /><Field label="config" placeholder="default" full /><div className="meta" style={{ marginTop: 12 }}>Streams via the 🤗 datasets server; cached locally as parquet.</div></div>}
        {mode === "paste" && <div><div className="meta" style={{ marginBottom: 6 }}>Paste a CSV, TSV or markdown table</div><textarea rows={10} placeholder={`ts, station, discharge\n2024-12-01 00:00, aare-bern, 412.4\n…`} style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 12, padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 8, background: "var(--canvas-warm)", outline: "none" }} /></div>}
        {mode === "code"  && <div><div className="meta" style={{ marginBottom: 6 }}>Write a Python expression that returns a DataFrame</div><pre className="mono" style={{ margin: 0, padding: "12px 14px", border: "1px solid var(--hairline)", borderRadius: 8, background: "var(--canvas-warm)", fontSize: 12, lineHeight: 1.7 }}>{`import pandas as pd\nurl = "https://example.org/data.csv"\ndf = pd.read_csv(url, parse_dates=["ts"])\ndf["station_id"] = df["station_id"].str.lower()\nreturn df`}</pre></div>}

        <div style={{ display: "flex", marginTop: 22, gap: 8, alignItems: "center" }}>
          <span className="meta">the agent will annotate the schema next, row by row</span>
          <span style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onClose}>cancel</button>
          <button className="btn primary" onClick={onPreview}>preview →</button>
        </div>
      </div>
    </div>
  );
}

// The headline of story 2 · The Annotated Drop.
// Schema on the left, agent annotations on the right, anchored row-by-row.
function PreviewStep({ onBack, onCommit }) {
  const [applied, setApplied] = React.useState({}); // annotation id → true
  const [dismissed, setDismissed] = React.useState({});

  const fields = [
    { name: "date",       type: "datetime",  null: "0 %",      uniq: "5,240",   ex: "2010-01-01", agent: null },
    { name: "station",    type: "string",    null: "0 %",      uniq: "3",       ex: "2091",       agent: { id: "a1", sev: "warn", line: "Only 3 unique values — consider category to save memory.", action: "cast: string → category", from: "string", to: "category" } },
    { name: "wt_C",       type: "float64",   null: "0.4 %",    uniq: "4,830",   ex: "5.83",       agent: { id: "a2", sev: "warn", line: "23 rows with NaN — agent marked them in the sample. Want to drop, interpolate, or keep?", action: "interpolate · linear", preview: "2,145 → 6.31 °C" } },
    { name: "flag",       type: "bool",      null: "0 %",      uniq: "2",       ex: "False",      agent: null },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* left · schema + sample */}
      <div style={{ padding: "20px 24px", overflowY: "auto", borderRight: "1px solid var(--hairline)" }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
          <div className="display-italic" style={{ fontSize: 17 }}>Inferred schema</div>
          <span className="meta" style={{ marginLeft: "auto" }}>swiss-temp-2025.csv · 5,240 rows · 2010-01-01 → 2024-12-31</span>
        </div>
        <div style={{ border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 90px 90px 1fr 18px", padding: "10px 14px", background: "var(--surface-shade)", borderBottom: "1px solid var(--hairline)" }}>
            {["", "field · type", "null %", "unique", "example", ""].map((h, i) => <span key={i} className="meta">{h}</span>)}
          </div>
          {fields.map((f, i) => {
            const hasAgent = !!f.agent && !applied[f.agent.id] && !dismissed[f.agent.id];
            return (
              <div key={f.name} data-anchor={f.agent ? f.agent.id : ""} style={{
                display: "grid", gridTemplateColumns: "32px 1fr 90px 90px 1fr 18px",
                padding: "12px 14px",
                borderBottom: i === fields.length - 1 ? "none" : "1px solid var(--hairline)",
                alignItems: "center",
                background: applied[f.agent && f.agent.id] ? "var(--bern-tint)" : hasAgent ? "var(--surface-shade)" : "transparent",
                position: "relative",
              }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>{(i + 1).toString().padStart(2, "0")}</span>
                <div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                  <div className="meta" style={{ marginTop: 2 }}>{applied[f.agent && f.agent.id] && f.agent.to ? `${f.agent.from} → ${f.agent.to}` : f.type}</div>
                </div>
                <span className="mono" style={{ fontSize: 12, color: f.null !== "0 %" ? "var(--bern-deep)" : "var(--ink-muted)" }}>{f.null}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{f.uniq}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{f.ex}</span>
                {hasAgent && <span style={{ width: 6, height: 6, borderRadius: 9999, background: "var(--bern)" }} title="agent has a comment" />}
                {applied[f.agent && f.agent.id] && <span className="meta" style={{ color: "var(--bern)" }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* sample preview with red-dot markers · F6 */}
        <div style={{ marginTop: 18 }}>
          <div className="display-italic" style={{ fontSize: 16, marginBottom: 8 }}>Sample · first 10 rows</div>
          <div style={{ border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "32px 100px 80px 70px 60px", padding: "8px 12px", background: "var(--surface-shade)", borderBottom: "1px solid var(--hairline)" }}>
              {["", "date", "station", "wt_C", "flag"].map((h, i) => <span key={i} className="meta">{h}</span>)}
            </div>
            {[
              { d: "2010-01-01", s: "2091", w: "5.83",  f: "F", nan: false },
              { d: "2010-01-01", s: "2034", w: "—",     f: "F", nan: true  },
              { d: "2010-01-01", s: "2009", w: "6.21",  f: "F", nan: false },
              { d: "2010-01-02", s: "2091", w: "5.79",  f: "F", nan: false },
              { d: "2010-01-02", s: "2034", w: "—",     f: "F", nan: true  },
              { d: "2010-01-02", s: "2009", w: "6.18",  f: "F", nan: false },
            ].map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 100px 80px 70px 60px", padding: "6px 12px", borderBottom: "1px solid var(--hairline)", alignItems: "center", fontFamily: "var(--mono)", fontSize: 11.5 }}>
                <span style={{ color: "var(--ink-faint)" }}>{(i + 1).toString().padStart(2, "0")}</span>
                <span>{r.d}</span>
                <span>{r.s}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: r.nan ? "var(--bern-deep)" : "var(--ink-soft)", fontStyle: r.nan ? "italic" : "normal" }}>
                  {r.nan && <span style={{ width: 5, height: 5, borderRadius: 9999, background: "var(--bern)" }} />}
                  {r.w}
                </span>
                <span style={{ color: "var(--ink-muted)" }}>{r.f}</span>
              </div>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 6 }}>● 2 cells flagged by the agent · 23 total in the full dataset</div>
        </div>
      </div>

      {/* right · agent annotations (anchored to schema rows · F1) */}
      <div style={{ padding: "20px 24px", overflowY: "auto", background: "var(--canvas-warm)" }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 14 }}>
          <div className="display-italic" style={{ fontSize: 17 }}>Agent · annotated drop</div>
          <span style={{ flex: 1 }} />
          <span className="meta" style={{ color: "var(--bern)" }}>● streaming · row-by-row</span>
        </div>

        <p style={{ fontFamily: "var(--serif)", fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-strong)", margin: "0 0 18px", fontVariationSettings: '"opsz" 18' }}>
          5,240 rows · 4 columns · 2010-01-01 → 2024-12-31. Looks like a <em>daily multi-station water-temperature series</em>. Two annotations to review.
        </p>

        {fields.filter(f => f.agent).map(f => {
          const a = f.agent;
          const isApplied = applied[a.id];
          const isDismissed = dismissed[a.id];
          if (isDismissed) return null;
          return (
            <div key={a.id} style={{
              padding: "12px 14px",
              border: "1px solid " + (isApplied ? "var(--bern-tint-2)" : "var(--hairline)"),
              background: isApplied ? "var(--bern-tint)" : "var(--surface)",
              borderRadius: 10, marginBottom: 12, position: "relative",
            }}>
              {/* anchor dot · F1 */}
              <span style={{ position: "absolute", left: -8, top: 18, width: 6, height: 6, borderRadius: 9999, background: "var(--bern)" }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--bern)", fontWeight: 600 }}>↳ {f.name}</span>
                <span className="meta" style={{ color: a.sev === "warn" ? "var(--amber)" : "var(--ink-muted)" }}>{a.sev}</span>
                <span style={{ flex: 1 }} />
                {isApplied && <span className="meta" style={{ color: "var(--bern)" }}>applied</span>}
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-strong)", margin: "0 0 10px" }}>{a.line}</p>
              {/* visible reasoning · F4 */}
              <div className="meta" style={{ marginBottom: 8, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>
                why · heuristic + LLM · evidence · <span className="mono" style={{ color: "var(--bern-deep)" }}>sample rows 2 & 5</span>
              </div>
              {a.preview && <div className="meta" style={{ marginBottom: 8, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none" }}>preview · {a.preview}</div>}
              {!isApplied && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn sm primary" onClick={() => setApplied(s => ({ ...s, [a.id]: true }))}>apply · {a.action}</button>
                  <button className="btn sm ghost" onClick={() => setDismissed(s => ({ ...s, [a.id]: true }))}>ignore</button>
                </div>
              )}
              {isApplied && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn sm ghost" onClick={() => setApplied(s => { const n = { ...s }; delete n[a.id]; return n; })}>undo</button>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(applied).length === Object.values(fields.filter(f => f.agent)).length && (
          <div style={{ padding: 14, border: "1px dashed var(--bern)", borderRadius: 10, background: "var(--bern-tint)", marginTop: 8 }}>
            <div className="meta" style={{ color: "var(--bern-deep)", marginBottom: 4 }}>all clear</div>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "var(--ink-strong)", margin: 0 }}>No remaining warnings. Ready to commit.</p>
          </div>
        )}
      </div>

      {/* footer · diff strip · F5 */}
      <div style={{ gridColumn: "1 / -1", padding: "10px 22px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center", gap: 12 }}>
        <span className="meta">diff · {Object.keys(applied).length} agent transform{Object.keys(applied).length === 1 ? "" : "s"} applied</span>
        {Object.keys(applied).length > 0 && <button className="btn sm ghost" onClick={() => setApplied({})}>undo all</button>}
        <span style={{ flex: 1 }} />
        <button className="btn ghost" onClick={onBack}>← back</button>
        <button className="btn primary" onClick={onCommit}>commit import →</button>
      </div>
    </div>
  );
}

function FinalizeStep({ onClose }) {
  return (
    <div style={{ padding: "36px 40px", textAlign: "left", flex: 1, overflowY: "auto" }}>
      <div className="meta" style={{ color: "var(--bern)", marginBottom: 8 }}>● committed</div>
      <h2 className="display" style={{ fontSize: 32, margin: 0 }}>swiss-temp-2025 is in.</h2>
      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)", margin: "16px 0", maxWidth: "56ch" }}>
        5,240 rows imported with 2 agent transforms (station → category · wt_C interpolated). The transforms are versioned on the manifest and undoable from the dataset's diff history.
      </p>
      <div className="div-h" style={{ margin: "22px 0" }} />
      <div className="meta" style={{ marginBottom: 12 }}>Next steps</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <button className="btn" style={{ justifyContent: "flex-start", padding: "12px 14px", textAlign: "left", fontWeight: 400 }}>
          <span style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Open the canvas — First Light</div>
            <div className="meta" style={{ marginTop: 4, letterSpacing: 0, textTransform: "none", color: "var(--ink-muted)" }}>narrated dashboard · ~8 s</div>
          </span>
          <span className="mono" style={{ color: "var(--bern)" }}>→</span>
        </button>
        <button className="btn" style={{ justifyContent: "flex-start", padding: "12px 14px", textAlign: "left", fontWeight: 400 }}>
          <span style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Train a baseline — PatchTST</div>
            <div className="meta" style={{ marginTop: 4, letterSpacing: 0, textTransform: "none", color: "var(--ink-muted)" }}>≈ 1 h on gpu-h100</div>
          </span>
          <span className="mono" style={{ color: "var(--bern)" }}>→</span>
        </button>
        <button className="btn" style={{ justifyContent: "flex-start", padding: "12px 14px", textAlign: "left", fontWeight: 400 }}>
          <span style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Schedule weekly append</div>
            <div className="meta" style={{ marginTop: 4, letterSpacing: 0, textTransform: "none", color: "var(--ink-muted)" }}>BAFU · Monday 06:00 UTC</div>
          </span>
          <span className="mono" style={{ color: "var(--bern)" }}>→</span>
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
        <button className="btn primary" onClick={onClose}>done</button>
      </div>
    </div>
  );
}
function Field({ label, placeholder, full }) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : undefined }}>
      <div className="meta" style={{ marginBottom: 6 }}>{label}</div>
      <input placeholder={placeholder} style={{ width: "100%", border: "1px solid var(--hairline)", borderRadius: 6, padding: "8px 10px", fontFamily: "var(--sans)", fontSize: 13, outline: "none", background: "var(--surface)" }} />
    </label>
  );
}

Object.assign(window, { DataPage });
