// ──────────────────────────────────────────────────────────────
// LIULIAN — Visualize Studio
//   Cell-based: each chart cell has SPEC (JSON, Vega-Lite-style)
//   ↔ CODE (JS canvas/echarts) ↔ CANVAS (no-code visual editor)
// ──────────────────────────────────────────────────────────────

const SAMPLE_CELLS = [
  {
    id: "cell-001",
    title: "Bern · 7-day discharge",
    sub: "line · observed only",
    spec: {
      "mark": "line",
      "data": { "ref": "swiss-river-1990", "filter": { "station_id": "aare-bern", "ts.last": "7d" } },
      "encoding": {
        "x": { "field": "ts",        "type": "temporal", "axis": { "format": "%a %d" } },
        "y": { "field": "discharge", "type": "quantitative", "title": "m³/s" },
        "color": { "value": "#131313" }
      },
      "layer": [{ "mark": { "type": "point", "size": 14, "filled": true } }]
    },
    code: `// JS / ECharts cell — runs in sandbox, can read any LIULIAN dataset.
const df = ll.dataset("swiss-river-1990").filter({ station_id: "aare-bern" }).tail("7d");
return {
  series: [{
    type: "line",
    data: df.column("discharge"),
    smooth: false,
    lineStyle: { color: "#131313", width: 1.4 }
  }],
  xAxis: { type: "category", data: df.column("ts") },
  yAxis: { type: "value" }
};`,
    kind: "spec",
  },
  {
    id: "cell-002",
    title: "Discharge distribution",
    sub: "histogram · annotated",
    spec: {
      "mark": "bar",
      "data": { "ref": "swiss-river-1990" },
      "transform": [{ "bin": { "field": "discharge", "step": 25 } }],
      "encoding": { "x": "bin_discharge", "y": "count", "color": { "value": "#E20613" } }
    },
    code: `// histogram, with vertical Q95 marker
const df = ll.dataset("swiss-river-1990");
const hist = df.histogram("discharge", { binwidth: 25 });
return {
  series: [{ type: "bar", data: hist.bars, itemStyle: { color: "#E20613" } }],
  xAxis: { type: "category", data: hist.bins },
  yAxis: { type: "value" }
};`,
    kind: "code",
  },
];

function VisualizePage({ onAgent }) {
  const [active, setActive] = React.useState("cell-001");
  const [cells, setCells] = React.useState(SAMPLE_CELLS);
  const cell = cells.find(c => c.id === active);

  function updateCell(patch) {
    setCells(cs => cs.map(c => c.id === active ? { ...c, ...patch } : c));
  }

  return (
    <div className="page-enter" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, padding: 16, alignItems: "start" }}>
      {/* cell list */}
      <nav className="card" style={{ padding: 0, maxHeight: "calc(100vh - var(--header-h) - var(--sub-h) - 32px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "12px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="meta">Cells · {cells.length}</span>
          <span style={{ flex: 1 }} />
          <button className="btn sm">+ cell</button>
        </header>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: 1 }}>
          {cells.map(c => {
            const isActive = c.id === active;
            return (
              <li key={c.id} onClick={() => setActive(c.id)} className={isActive ? "ribbon-left" : ""}
                style={{ padding: "10px 14px 10px 16px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", background: isActive ? "var(--surface-shade)" : "transparent" }}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 500 : 400 }}>{c.title}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{c.id}</span>
                  <span className="meta">· {c.sub}</span>
                </div>
              </li>
            );
          })}
          {[
            { id: "cell-003", title: "Precip × discharge", sub: "scatter · lagged 4h" },
            { id: "cell-004", title: "Hour-of-day ridges", sub: "ridge · 24" },
            { id: "cell-005", title: "Q95 by station",    sub: "bar · sorted" },
            { id: "cell-006", title: "Forecast skill",    sub: "line · MAE per h" },
            { id: "cell-007", title: "Station map",       sub: "geo · scattermap" },
          ].map(c => (
            <li key={c.id} style={{ padding: "10px 14px 10px 16px", cursor: "pointer", borderBottom: "1px solid var(--hairline)", color: "var(--ink-muted)" }}>
              <div style={{ fontSize: 13 }}>{c.title}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{c.id}</span>
                <span className="meta">· {c.sub}</span>
              </div>
            </li>
          ))}
        </ul>
        <footer style={{ padding: "8px 14px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 6, alignItems: "center" }}>
          <span className="meta">scratch · auto-saved</span>
        </footer>
      </nav>

      <div style={{ minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "flex-end", gap: 24, padding: "8px 0 22px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="meta" style={{ marginBottom: 6 }}>Cell · {cell.id} · scratch/visualize</div>
            <input value={cell.title} onChange={e => updateCell({ title: e.target.value })} className="display" style={{ fontSize: 44, margin: 0, border: "none", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
            <p className="display-italic" style={{ margin: "8px 0 0", fontSize: 15.5, color: "var(--ink-muted)" }}>{cell.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Segmented options={[{ value: "spec", label: "Spec" }, { value: "canvas", label: "Canvas" }, { value: "code", label: "Code" }]} value={cell.kind} onChange={k => updateCell({ kind: k })} />
            <div className="div-v" style={{ marginInline: 4 }} />
            <button className="btn">Save → cell</button>
            <button className="btn">Pin to report</button>
            <button className="btn primary" onClick={onAgent}>Ask agent to refine</button>
          </div>
        </header>

        <CellEditor cell={cell} updateCell={updateCell} />
      </div>
    </div>
  );
}

function CellEditor({ cell, updateCell }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(380px, 1fr) minmax(420px, 1.4fr) 240px", gap: 14, alignItems: "stretch" }}>
      {/* left: spec / code / canvas controls */}
      <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 560 }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="meta">{cell.kind} · {cell.kind === "spec" ? "vega-lite-shaped" : cell.kind === "code" ? "javascript · echarts dialect" : "no-code editor"}</span>
          <span style={{ flex: 1 }} />
          <button className="btn ghost sm">⌘↵ run</button>
        </div>
        {cell.kind === "spec"   && <SpecEditor   cell={cell} updateCell={updateCell} />}
        {cell.kind === "code"   && <CodeEditor   cell={cell} updateCell={updateCell} />}
        {cell.kind === "canvas" && <CanvasEditor cell={cell} updateCell={updateCell} />}
      </div>

      {/* middle: live preview */}
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", minHeight: 560 }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
          <span className="display-italic" style={{ fontSize: 18 }}>{cell.title}</span>
          <span style={{ flex: 1 }} />
          <span className="meta">preview · 96 dpi · 800×420</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--hairline)", background: "var(--canvas-soft)", padding: 18 }}>
          {cell.id === "cell-001" ? (
            <GenericLine id="prev-1" data={Array.from({ length: 168 }, (_, i) => 412 + Math.sin(i / 6) * 30 + (i > 130 ? (i - 130) * 1.6 : 0))} color="#131313" fill={null} height={380} />
          ) : (
            <MiniHistogram seed={9} color="var(--bern)" width={520} height={380} />
          )}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
          <span className="meta">data · swiss-river-1990 · 23,184 rows after filter</span>
          <span style={{ flex: 1 }} />
          <button className="btn sm ghost">↗ open large</button>
          <button className="btn sm ghost">↓ png</button>
          <button className="btn sm ghost">↓ svg</button>
          <button className="btn sm">share ✓</button>
        </div>
      </div>

      {/* right: inspector */}
      <aside className="card" style={{ padding: "14px 16px", minHeight: 560 }}>
        <RunningHead label="Inspector" meta="properties" />
        <PropRow k="mark"   v={cell.spec.mark || "—"} mono />
        <PropRow k="x"      v={cell.spec.encoding && cell.spec.encoding.x ? (cell.spec.encoding.x.field || cell.spec.encoding.x) : "—"} mono />
        <PropRow k="y"      v={cell.spec.encoding && cell.spec.encoding.y ? (cell.spec.encoding.y.field || cell.spec.encoding.y) : "—"} mono />
        <PropRow k="color"  v={(cell.spec.encoding && cell.spec.encoding.color && cell.spec.encoding.color.value) || "—"} />
        <PropRow k="width"  v="800 px" />
        <PropRow k="height" v="420 px" />
        <div className="div-h" style={{ margin: "12px 0" }} />
        <RunningHead label="Style" />
        {[["typeface","Switzer · 11px"], ["axis", "hairline · #E8E7E2"], ["grid", "dashed · y only"], ["legend", "top-right · mono"], ["palette", "ink + UniBe red"]].map(([k,v]) => <PropRow key={k} k={k} v={v} />)}
        <div className="div-h" style={{ margin: "12px 0" }} />
        <RunningHead label="Annotations" meta="0" />
        <button className="btn sm ghost" style={{ width: "100%", justifyContent: "center" }}>+ add note</button>
        <div className="meta" style={{ marginTop: 8, color: "var(--ink-faint)" }}>click any data point in preview to anchor a margin note.</div>
      </aside>
    </div>
  );
}

function PropRow({ k, v, mono }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", padding: "5px 0", fontSize: 12.5, alignItems: "baseline" }}>
      <span className="meta">{k}</span>
      <span className={mono ? "mono" : ""} style={{ color: "var(--ink-soft)", fontSize: mono ? 11.5 : 12.5 }}>{v}</span>
    </div>
  );
}

function SpecEditor({ cell, updateCell }) {
  const [text, setText] = React.useState(JSON.stringify(cell.spec, null, 2));
  React.useEffect(() => setText(JSON.stringify(cell.spec, null, 2)), [cell.id]);
  return (
    <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false}
      style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, resize: "none", background: "var(--surface)", color: "var(--ink-soft)" }} />
  );
}

function CodeEditor({ cell, updateCell }) {
  const [text, setText] = React.useState(cell.code);
  React.useEffect(() => setText(cell.code), [cell.id]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false}
        style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, resize: "none", background: "var(--surface)", color: "var(--ink-soft)" }} />
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)" }}>
        <div className="meta" style={{ marginBottom: 4 }}>console</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--green)" }}>✓ ran in 184 ms · 23,184 rows · 0 warnings</div>
      </div>
    </div>
  );
}

function CanvasEditor({ cell, updateCell }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <FieldGroup title="Mark">
        <Segmented size="sm" options={["line", "bar", "area", "point", "rect"]} value="line" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup title="X axis · ts">
        <DropPill field="ts" type="temporal" />
        <FieldRow k="format" v="%a %d" />
        <FieldRow k="last"   v="7d" />
      </FieldGroup>
      <FieldGroup title="Y axis · discharge">
        <DropPill field="discharge" type="quantitative" unit="m³/s" />
        <FieldRow k="aggregate" v="none" />
        <FieldRow k="scale"     v="linear" />
      </FieldGroup>
      <FieldGroup title="Color">
        <DropPill field="—" type="constant" color="#131313" />
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {["#131313", "#E20613", "#0066B3", "#509A39", "#E6863A"].map(c => <button key={c} title={c} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: c === "#131313" ? "2px solid var(--bern)" : "1px solid var(--hairline)", cursor: "pointer" }} />)}
        </div>
      </FieldGroup>
      <FieldGroup title="Filter">
        <div style={{ display: "flex", gap: 6 }}>
          <DropPill field="station_id = aare-bern" type="filter" small />
          <button className="btn sm ghost">+ filter</button>
        </div>
      </FieldGroup>
      <FieldGroup title="Layers">
        <FieldRow k="Layer 1" v="line · ink" />
        <FieldRow k="Layer 2" v="point · ink · size 14" />
        <button className="btn sm ghost" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>+ layer</button>
      </FieldGroup>
    </div>
  );
}

function FieldGroup({ title, children }) {
  return (
    <div style={{ borderTop: "1px dashed var(--hairline)", paddingTop: 10 }}>
      <div className="meta" style={{ marginBottom: 8 }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}
function DropPill({ field, type, unit, color, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: small ? "3px 8px" : "5px 10px",
      borderRadius: 6, border: "1px solid var(--hairline-strong)",
      background: "var(--canvas-warm)", fontSize: 12.5,
    }}>
      {color && <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} />}
      <span className="mono" style={{ fontSize: 11.5 }}>{field}</span>
      <span className="meta" style={{ fontSize: 9 }}>{type}{unit ? ` · ${unit}` : ""}</span>
    </span>
  );
}
function FieldRow({ k, v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, padding: "4px 0", fontSize: 12, alignItems: "center" }}>
      <span className="meta">{k}</span>
      <span className="mono" style={{ color: "var(--ink-soft)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { VisualizePage });
