// ──────────────────────────────────────────────────────────────
// LIULIAN — atom components shared across pages
// ──────────────────────────────────────────────────────────────
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/** A tiny seeded RNG so generated visuals are stable across renders. */
function rng(seed) {
  return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
}

/** Pure SVG sparkline. */
function Sparkline({ data, width = 80, height = 22, stroke = "currentColor", fill, dashed = false, lastDot = false }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => [i * stepX, height - 2 - ((v - min) / span) * (height - 4)]);
  const d = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = fill ? d + ` L ${width},${height} L 0,${height} Z` : null;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {fill && <path d={area} fill={fill} opacity={0.18} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "3 3" : undefined} />
      {lastDot && <circle cx={last[0]} cy={last[1]} r={1.8} fill={stroke} />}
    </svg>
  );
}

/** Column-level mini histogram, hairline bars. */
function MiniHistogram({ buckets = 16, seed = 1, color = "var(--ink)", width = 80, height = 22 }) {
  const r = useMemo(() => rng(seed), [seed]);
  const bars = useMemo(() => Array.from({ length: buckets }, () => 0.3 + Math.abs(r() - 0.5) * 1.6), [buckets, seed]);
  const max = Math.max(...bars);
  const gap = 1;
  const bw = (width - gap * (buckets - 1)) / buckets;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {bars.map((b, i) => {
        const h = (b / max) * (height - 2);
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} fill={color} opacity={0.85} />;
      })}
    </svg>
  );
}

/** Status by typography — italic running, bold failed, muted otherwise. */
function StatusLabel({ value }) {
  if (value === "running")  return <em style={{ color: "var(--ink)", fontStyle: "italic", fontVariationSettings: '"opsz" 14', fontFamily: "var(--serif)" }}>running</em>;
  if (value === "failed")   return <strong style={{ color: "var(--bern-deep)", fontWeight: 600 }}>failed</strong>;
  if (value === "pending")  return <span style={{ color: "var(--ink-faint)" }}>pending</span>;
  if (value === "queued")   return <span style={{ color: "var(--ink-faint)" }}>queued</span>;
  if (value === "completed")return <span style={{ color: "var(--ink-muted)" }}>completed</span>;
  return <span style={{ color: "var(--ink-muted)" }}>{value}</span>;
}

/** Section heading — Fraunces with a tiny scientific specimen line beneath. */
function PageTitle({ title, kicker, specimen, right }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "8px 0 22px", gap: 24 }}>
      <div>
        {kicker && <div className="meta" style={{ marginBottom: 8 }}>{kicker}</div>}
        <h1 className="display" style={{ fontSize: 44, margin: 0, fontVariationSettings: '"opsz" 48' }}>
          {title}
        </h1>
        {specimen && <div className="meta" style={{ marginTop: 10, color: "var(--ink-muted)" }}>{specimen}</div>}
      </div>
      {right && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{right}</div>}
    </header>
  );
}

/** Section divider with running serif label and right-aligned mono meta. */
function RunningHead({ label, meta, italicLabel = true }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingBottom: 8, marginBottom: 14, borderBottom: "1px solid var(--hairline)" }}>
      <div className={italicLabel ? "display-italic" : "display"} style={{ fontSize: 18 }}>{label}</div>
      {meta && <div className="meta" style={{ marginLeft: "auto" }}>{meta}</div>}
    </div>
  );
}

/** Square segmented control. */
function Segmented({ options, value, onChange, size = "md" }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--hairline-strong)", borderRadius: 6, overflow: "hidden", background: "var(--surface)" }}>
      {options.map((o, i) => {
        const v = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            border: "none",
            background: active ? "var(--ink)" : "transparent",
            color: active ? "#fff" : "var(--ink-muted)",
            fontFamily: "var(--mono)",
            fontSize: size === "sm" ? 10 : 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            padding: size === "sm" ? "3px 8px" : "5px 12px",
            cursor: "pointer",
            borderRight: i < options.length - 1 ? "1px solid var(--hairline-strong)" : "none",
            transition: "background 150ms var(--ease)",
          }}>{lbl}</button>
        );
      })}
    </div>
  );
}

/** Margin-note: Tufte-style. */
function MarginNote({ children }) {
  return (
    <aside style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)", paddingLeft: 14, borderLeft: "1px solid var(--hairline)" }}>
      {children}
    </aside>
  );
}

/** Rose-curve loader — math-curve aesthetic from the references. */
function RoseLoader({ size = 14, color = "var(--bern)" }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ animation: "spin 2.4s linear infinite" }}>
      <path d="M 0 0 Q 6 -6 8 0 Q 6 6 0 0 Q -6 6 -8 0 Q -6 -6 0 0 Z" fill="none" stroke={color} strokeWidth="1.1" />
    </svg>
  );
}

/** Big number block (KPI). */
function KPI({ label, value, unit, sub, accent }) {
  return (
    <div style={{ padding: "16px 18px", flex: 1, borderRight: "1px solid var(--hairline)", minWidth: 0 }}>
      <div className="meta" style={{ marginBottom: 6 }}>{label}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 500, color: accent || "var(--ink)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {value}{unit && <span style={{ fontSize: 12, color: "var(--ink-muted)", marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </div>
      {sub && <div className="meta" style={{ marginTop: 4, color: "var(--ink-muted)", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
    </div>
  );
}

/** A 6-char hash chip. */
function HashChip({ value, prefix = "" }) {
  return <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{prefix}{value}</span>;
}

/** Resource-name with id underneath. */
function NameWithId({ name, id, idLabel }) {
  return (
    <div>
      <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{name}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>{idLabel ? idLabel + " · " : ""}{id}</div>
    </div>
  );
}

/** Live clock — UTC, ticks every second. */
function LiveClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const iso = t.toISOString();
  return <span>{iso.slice(0, 10)} {iso.slice(11, 19)} UTC</span>;
}

Object.assign(window, {
  Sparkline, MiniHistogram, StatusLabel, PageTitle, RunningHead, Segmented,
  MarginNote, RoseLoader, KPI, HashChip, NameWithId, LiveClock, rng,
});
