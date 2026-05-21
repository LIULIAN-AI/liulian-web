// ──────────────────────────────────────────────────────────────
// LIULIAN — Today (the new default landing — triage briefing)
// ──────────────────────────────────────────────────────────────

function TodayPage({ onAgent, nav, setGuides }) {
  const now = new Date();
  const dateLine = now.toUTCString().replace("GMT", "UTC");
  return (
    <div className="page-enter" style={{ padding: "40px 56px 64px", maxWidth: 1100, margin: "0 auto" }}>
      {/* hero */}
      <header style={{ marginBottom: 32 }}>
        <div className="meta" style={{ marginBottom: 12 }}>
          Today · {dateLine.slice(0, 22)} · project · <span style={{ color: "var(--ink)" }}>aare-hydro</span>
        </div>
        <h1 className="display" style={{ fontSize: 52, margin: 0, fontVariationSettings: '"opsz" 64' }}>
          Good morning,{" "}
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontVariationSettings: '"opsz" 64, "SOFT" 50' }}>Linlin</span>.
        </h1>
      </header>

      {/* agent's morning note */}
      <section style={{ marginBottom: 40, paddingBottom: 36, borderBottom: "1px solid var(--hairline)", display: "grid", gridTemplateColumns: "1fr 240px", gap: 32 }}>
        <div>
          <div className="meta" style={{ marginBottom: 12, color: "var(--bern)" }}>● agent · morning note · drafted 06:00</div>
          <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.45, color: "var(--ink-strong)", margin: 0, fontVariationSettings: '"opsz" 22', maxWidth: "44ch", textWrap: "pretty" }}>
            Overnight the Aare basin held steady. <em>Bern's Q95 has begun a slow rise</em> — the next 36 hours look manageable, but a single threshold crossing is projected for Thursday afternoon. Two models disagree on Basel by more than 60 m³/s; worth a glance.
          </p>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: "var(--ink-muted)", margin: "14px 0 0", maxWidth: "52ch" }}>
            Three runs finished while you slept. Your sweep on PatchTST is 3 of 12 trials in. The weekly brief draft is ready for your review.
          </p>
        </div>
        <aside style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="meta" style={{ marginBottom: 6 }}>Agent suggests</div>
          <SuggestRow icon="→" lbl="Read Bern's 72h forecast"     hint="Q95 critical · Thu 14:00" onClick={() => nav("forecast")} />
          <SuggestRow icon="→" lbl="Open the weekly brief draft"  hint="2 panels need review"   onClick={() => nav("reports")} />
          <SuggestRow icon="→" lbl="Compare PatchTST vs Chronos-2 on Basel" hint="disagreement 64 m³/s" onClick={onAgent} />
        </aside>
      </section>

      {/* triage strip */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 44 }}>
        <TriageColumn label="Attention" count={3} accent="bern" hint="needs your eyes">
          <AlertRow severity="critical" name="Bern · Q95 projected critical" sub="aare-bern · Thu 14:00 UTC" age="6h" onClick={() => nav("forecast")} />
          <AlertRow severity="watch"    name="Basel · sustained watch band"   sub="rhine-basel · since Mon 18:00" age="12h" onClick={() => nav("forecast")} />
          <AlertRow severity="run"      name="r-7c87 · iTransformer failed"   sub="CUDA OOM at step 4096"        age="2d" onClick={() => nav("train")} />
        </TriageColumn>
        <TriageColumn label="In flight" count={4} accent="ink" hint="running now">
          <FlightRow lbl="Sweep · patchtst" sub="3 / 12 trials · ETA 1h 14m" pct={25} />
          <FlightRow lbl="Re-import · BAFU daily" sub="ingested 14k rows · 89%" pct={89} />
          <FlightRow lbl="Weekly brief · auto-draft" sub="agent · 2/5 panels" pct={40} />
          <FlightRow lbl="r-7c8a · patchtst" sub="step 18,200 / 24,000" pct={76} italic />
        </TriageColumn>
        <TriageColumn label="Continue" count={4} accent="muted" hint="picked up last">
          <ContinueRow kind="dataset"  lbl="Swiss-River 1990 · manifest"  sub="you edited the pipeline · 17:42 yesterday" onClick={() => nav("data")} />
          <ContinueRow kind="cell"     lbl="Bern · 7-day discharge"        sub="cell-001 · 1 unsaved change"             onClick={() => nav("visualize")} />
          <ContinueRow kind="report"   lbl="Bern Q95 · Watchdog"           sub="draft · 3 panels"                        onClick={() => nav("reports")} />
          <ContinueRow kind="agent"    lbl="Compare PatchTST vs Chronos-2"  sub="thread th-001 · 14 messages"            onClick={onAgent} />
        </TriageColumn>
      </section>

      {/* recently activity feed */}
      <section style={{ marginBottom: 32 }}>
        <RunningHead label="Recently" meta="last 24 h · this project" />
        <div>
          {[
            { at: "08:14", who: "agent",   verb: "ingested",  what: "BAFU snapshot · +14,121 rows on swiss-river-1990 v3.2.1", k: "data" },
            { at: "07:02", who: "cron",    verb: "ran",       what: "swiss-river · hourly · 28 forecasts emitted",            k: "run"  },
            { at: "06:00", who: "agent",   verb: "drafted",   what: "weekly brief — 2 panels still need your review",         k: "report"},
            { at: "Mon 21:14", who: "@lj", verb: "promoted",  what: "patchtst.v3.2 → Library · scope team-shared",            k: "model" },
            { at: "Mon 18:30", who: "alert",verb: "fired",     what: "Basel · watch band · rhine-basel",                       k: "alert"},
            { at: "Mon 17:42", who: "@lj", verb: "edited",    what: "pipeline · step 04 (flag is_snowmelt) on swiss-river-1990",k:"data" },
          ].map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 60px 70px 1fr", gap: 14, padding: "10px 0", borderTop: i === 0 ? "1px solid var(--hairline)" : "1px dashed var(--hairline)", alignItems: "baseline", fontSize: 13.5 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>{e.at}</span>
              <span className="meta" style={{ color: "var(--ink-muted)" }}>{e.who}</span>
              <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--ink-muted)" }}>{e.verb}</em>
              <span>{e.what}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SuggestRow({ icon, lbl, hint, onClick }) {
  return (
    <button onClick={onClick} className="btn" style={{
      justifyContent: "flex-start",
      width: "100%",
      padding: "10px 12px",
      textAlign: "left",
      borderColor: "var(--hairline)",
      fontWeight: 400,
    }}>
      <span className="mono" style={{ color: "var(--bern)", fontSize: 11 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
        <div className="meta" style={{ marginTop: 2, color: "var(--ink-faint)", letterSpacing: 0, textTransform: "none" }}>{hint}</div>
      </span>
    </button>
  );
}

function TriageColumn({ label, count, accent, hint, children }) {
  const color = accent === "bern" ? "var(--bern)" : accent === "ink" ? "var(--ink)" : "var(--ink-muted)";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 8, marginBottom: 14, borderBottom: "1px solid var(--hairline)" }}>
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: color }} />
        <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontVariationSettings: '"opsz" 20, "SOFT" 60', fontSize: 18 }}>{label}</span>
        <span className="meta" style={{ color: "var(--ink-faint)" }}>·</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink)" }}>{count}</span>
        <span style={{ flex: 1 }} />
        <span className="meta">{hint}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function AlertRow({ severity, name, sub, age, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "grid", gridTemplateColumns: "10px 1fr auto", alignItems: "center", gap: 10,
      padding: "10px 12px",
      background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
      cursor: "pointer", textAlign: "left", fontFamily: "var(--sans)",
      borderLeftWidth: 2,
      borderLeftColor: severity === "critical" ? "var(--bern)" : severity === "watch" ? "var(--amber)" : "var(--ink)",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: severity === "critical" ? "var(--bern)" : severity === "watch" ? "var(--amber)" : "var(--ink-quiet)" }} />
      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: severity === "critical" ? "var(--bern-deep)" : "var(--ink)", fontWeight: severity === "critical" ? 600 : 500, fontStyle: severity === "run" ? "italic" : "normal", fontFamily: severity === "run" ? "var(--serif)" : "var(--sans)" }}>{name}</div>
        <div className="meta" style={{ marginTop: 3, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none" }}>{sub}</div>
      </span>
      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{age}</span>
    </button>
  );
}

function FlightRow({ lbl, sub, pct, italic }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, fontFamily: italic ? "var(--serif)" : "var(--sans)", fontStyle: italic ? "italic" : "normal" }}>{lbl}</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: "var(--surface-shade)", borderRadius: 9999, overflow: "hidden", margin: "4px 0 6px" }}>
        <div style={{ height: "100%", width: pct + "%", background: "var(--ink)" }} />
      </div>
      <div className="meta" style={{ color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none" }}>{sub}</div>
    </div>
  );
}

function ContinueRow({ kind, lbl, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "grid", gridTemplateColumns: "70px 1fr 12px", alignItems: "center", gap: 10,
      padding: "10px 12px",
      background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
      cursor: "pointer", textAlign: "left", fontFamily: "var(--sans)",
    }}>
      <span className="meta">{kind}</span>
      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
        <div className="meta" style={{ marginTop: 3, color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none" }}>{sub}</div>
      </span>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>›</span>
    </button>
  );
}

function StoryCard({ story, onStart }) {
  const cnGlyph = story.cn ? story.cn : "";
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 0, position: "relative", overflow: "hidden" }}>
      {/* CN glyph as background watermark */}
      {cnGlyph && (
        <span style={{ position: "absolute", right: 14, top: 8, fontFamily: "var(--serif)", fontSize: 38, color: "var(--canvas-warmer)", lineHeight: 1, fontVariationSettings: '"opsz" 48', pointerEvents: "none", userSelect: "none" }}>
          {cnGlyph}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, position: "relative" }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>{(story.code || "").padStart(2, "0")}</span>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 500, margin: 0, fontVariationSettings: '"opsz" 24' }}>{story.title}</h3>
        <span style={{ flex: 1 }} />
        <span className="meta">{story.duration}</span>
      </div>
      <div className="meta" style={{ color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)", marginBottom: 10, position: "relative" }}>
        {story.persona}
      </div>
      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "var(--ink-soft)", margin: "0 0 12px", maxWidth: "46ch", position: "relative" }}>
        {story.setup}
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", position: "relative" }}>
        {story.steps.slice(0, 3).map((s, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 8, padding: "4px 0", fontSize: 12.5, color: "var(--ink-soft)" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{(i + 1).toString().padStart(2, "0")}</span>
            <span>{s}</span>
          </li>
        ))}
        {story.steps.length > 3 && <li style={{ color: "var(--ink-faint)", fontSize: 11, marginTop: 3, paddingLeft: 28 }}>… +{story.steps.length - 3} more</li>}
      </ol>
      <div style={{ display: "flex", marginTop: 14, gap: 8, alignItems: "center", position: "relative" }}>
        <button className="btn primary sm" onClick={onStart}>Start →</button>
        <span className="meta">{story.start.note}</span>
        <span style={{ flex: 1 }} />
        {story.principles && story.principles.length > 0 && (
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>
            {story.principles.join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TodayPage });
