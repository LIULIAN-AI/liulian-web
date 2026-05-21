// ──────────────────────────────────────────────────────────────
// LIULIAN — Settings
// ──────────────────────────────────────────────────────────────

function SettingsPage() {
  return (
    <div className="page-enter" style={{ padding: 16, maxWidth: 1100 }}>
      <PageTitle kicker="System" title="Settings" specimen="workspace · agent providers · storage · keyboard · permissions" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <Section title="Workspace">
          <Row k="name"    v={<input defaultValue="liulian / aare-hydro" style={inp} />} />
          <Row k="region"  v={<input defaultValue="europe-west6 · Zürich" style={inp} />} />
          <Row k="theme"   v={<Segmented size="sm" options={["paper", "ink"]} value="paper" onChange={() => {}} />} />
          <Row k="density" v={<Segmented size="sm" options={["roomy", "comfortable", "tight"]} value="comfortable" onChange={() => {}} />} />
        </Section>

        <Section title="Agent providers">
          {AGENT_MODELS.map((m, i) => (
            <Row key={m.id} k={m.name} v={<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input placeholder="API key …" defaultValue={i === 0 ? "sk-···" : ""} style={{ ...inp, flex: 1 }} />
              <span className="meta">{m.provider}</span>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: i < 3 ? "var(--bern)" : "var(--ink-quiet)" }} />
            </div>} />
          ))}
        </Section>

        <Section title="Storage">
          <Row k="warm tier" v={<><span className="mono">s3://liulian-warm</span> <span className="meta">· 1.4 GB / 50 GB</span></>} />
          <Row k="cold tier" v={<><span className="mono">s3://liulian-cold</span> <span className="meta">· 38 GB / 1 TB</span></>} />
          <Row k="compute"   v={<><span className="mono">UBELIX · gpu-h100 / gpu-a100</span> <span className="meta">· paygo</span></>} />
        </Section>

        <Section title="Keyboard">
          <Row k="palette"      v={<><kbd>⌘</kbd> <kbd>K</kbd></>} />
          <Row k="agent"        v={<kbd>b</kbd>} />
          <Row k="quick nav"    v={<><kbd>1</kbd>-<kbd>8</kbd></>} />
          <Row k="next station" v={<><kbd>j</kbd>/<kbd>k</kbd></>} />
          <Row k="open run"     v={<><kbd>⌘</kbd> <kbd>O</kbd></>} />
          <Row k="diff"         v={<><kbd>⌘</kbd> <kbd>D</kbd></>} />
        </Section>

        <Section title="Permissions">
          <Row k="role"      v={<>editor · @lj</>} />
          <Row k="invites"   v={<><span className="meta">2 pending</span> <button className="btn sm" style={{ marginLeft: 8 }}>+ invite</button></>} />
          <Row k="public"    v={<>off — set per-resource</>} />
        </Section>

        <Section title="Service health">
          <Row k="liulian-api"   v={<><span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 12 }}>● healthy</span> <span className="meta">2.4ms p50</span></>} />
          <Row k="liulian-agent" v={<><span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 12 }}>● healthy</span> <span className="meta">SSE on</span></>} />
          <Row k="liulian-ingest"v={<><em style={{ color: "var(--ink-muted)", fontFamily: "var(--serif)" }}>running</em> <span className="meta">next 06:00</span></>} />
          <Row k="ubelix"        v={<><span style={{ color: "var(--amber)", fontFamily: "var(--mono)", fontSize: 12 }}>● queue 3</span> <span className="meta">gpu-h100</span></>} />
        </Section>
      </div>
    </div>
  );
}
const inp = { border: "1px solid var(--hairline)", borderRadius: 6, padding: "6px 10px", fontFamily: "var(--sans)", fontSize: 13, outline: "none", background: "var(--surface)" };

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <RunningHead label={title} />
      {children}
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "8px 0", borderTop: "1px dashed var(--hairline)", alignItems: "center" }}>
      <span className="meta">{k}</span>
      <div style={{ fontSize: 13 }}>{v}</div>
    </div>
  );
}
Object.assign(window, { SettingsPage });
