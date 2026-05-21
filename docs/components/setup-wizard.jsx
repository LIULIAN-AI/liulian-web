// ──────────────────────────────────────────────────────────────
// LIULIAN — Setup wizard
//   Domain → Task → Model → Data, layered.
//   Proactively offers options at each step (not blank inputs).
//   Reused by Create-project, One-shot, Train (new experiment).
// ──────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: "domain", label: "Domain" },
  { id: "task",   label: "Task" },
  { id: "model",  label: "Models" },
  { id: "data",   label: "Data" },
  { id: "review", label: "Review" },
];

function SetupWizard({ kind, onClose, onFinish }) {
  const [step, setStep]  = React.useState(0);
  const [domain, setDomain] = React.useState("time-series");
  const taskList = TASKS[domain] || [];
  const [task, setTask]     = React.useState(() => (TASKS["time-series"].find(t => t.default) || TASKS["time-series"][0]).id);
  const [modelIds, setModelIds] = React.useState(["patchtst"]);
  const [dataId, setDataId] = React.useState("swiss-river-1990");
  const [projectName, setProjectName] = React.useState(kind === "one-shot" ? "scratch · 2026-05-21" : "");

  const taskObj = (TASKS[domain] || []).find(t => t.id === task);
  const compatibleModels = (taskObj && taskObj.models) || [];
  const recommendedDatasets = DATASETS.filter(d => domain === "time-series");

  function toggleModel(id) {
    setModelIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  const stepId = WIZARD_STEPS[step].id;

  // when domain changes, reset task to that domain's default
  React.useEffect(() => {
    const list = TASKS[domain] || [];
    const def = (list.find(t => t.default) || list[0]);
    if (def) setTask(def.id);
  }, [domain]);

  // when task changes, reset models to the first recommended
  React.useEffect(() => {
    if (compatibleModels.length && !compatibleModels.includes(modelIds[0])) {
      setModelIds(compatibleModels.slice(0, 1));
    }
    // eslint-disable-next-line
  }, [task]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(19,19,19,0.36)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 980, maxWidth: "94vw", maxHeight: "90vh",
        background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14,
        boxShadow: "0 28px 64px rgba(19,19,19,0.20)", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <header style={{ padding: "20px 28px 16px", borderBottom: "1px solid var(--hairline)" }}>
          <div className="meta" style={{ marginBottom: 6 }}>{kind === "one-shot" ? "One-shot run · scaffold a default project" : "Create project · layered setup"}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <h2 className="display" style={{ fontSize: 28, margin: 0 }}>
              {stepId === "domain"  && "Pick a domain"}
              {stepId === "task"    && "Pick a task"}
              {stepId === "model"   && "Pick one or more models"}
              {stepId === "data"    && "Pick a dataset"}
              {stepId === "review"  && "Confirm and launch"}
            </h2>
            <span style={{ flex: 1 }} />
            <Stepper step={step} steps={WIZARD_STEPS} />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {stepId === "domain" && (
            <StepIntro line={`What kind of signal are you working with? LIULIAN's hierarchy mirrors liulian-python — domain shapes everything else.`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {DOMAINS.map(d => (
                  <ChoiceCard key={d.id} active={domain === d.id} onClick={() => !d.preview && setDomain(d.id)}
                    icon={d.icon} title={d.label} sub={d.sub} extra={d.examples} preview={d.preview}
                  />
                ))}
              </div>
            </StepIntro>
          )}

          {stepId === "task" && (
            <StepIntro line={<>Within <strong>{DOMAINS.find(d => d.id === domain).label}</strong>, what is the question?</>}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {taskList.map(t => (
                  <ChoiceCard key={t.id} active={task === t.id} onClick={() => !t.preview && setTask(t.id)}
                    title={t.label} sub={t.sub}
                    extra={`models · ${(t.models || []).slice(0, 4).join(" · ")}${(t.models || []).length > 4 ? " · …" : ""}`}
                    preview={t.preview}
                  />
                ))}
              </div>
            </StepIntro>
          )}

          {stepId === "model" && (
            <StepIntro line={<>For <strong>{taskObj && taskObj.label}</strong> on <strong>{DOMAINS.find(d => d.id === domain).label}</strong>, here's what LIULIAN trains well. Pick at least one; you can compare later.</>}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {compatibleModels.map(mid => {
                  const m = MODELS.find(x => x.id === mid) || { id: mid, family: "—", params: "—", ctx: "—", role: "supervised", status: "stable" };
                  const sel = modelIds.includes(mid);
                  return (
                    <button key={mid} onClick={() => toggleModel(mid)} style={{
                      textAlign: "left", padding: "12px 14px",
                      border: "1px solid " + (sel ? "var(--bern)" : "var(--hairline)"),
                      background: sel ? "var(--bern-tint)" : "var(--surface)",
                      borderRadius: 10, cursor: "pointer", fontFamily: "var(--sans)",
                      display: "grid", gridTemplateColumns: "12px 1fr auto", gap: 10, alignItems: "center",
                    }}>
                      <span style={{ width: 12, height: 12, border: "1.5px solid " + (sel ? "var(--bern)" : "var(--hairline-stronger)"), borderRadius: 3, background: sel ? "var(--bern)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9 }}>{sel ? "✓" : ""}</span>
                      <div>
                        <div className="mono" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{m.id}</div>
                        <div className="meta" style={{ marginTop: 2, letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)", color: "var(--ink-muted)" }}>{m.family} · {m.role === "zero-shot" ? "no training needed" : "trains per dataset"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{m.params} · ctx {m.ctx}</div>
                        <div className="meta" style={{ marginTop: 2 }}>{m.status}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 14 }} className="meta">selected · {modelIds.length} · or pick everything to run a sweep</div>
            </StepIntro>
          )}

          {stepId === "data" && (
            <StepIntro line={<>Datasets compatible with <strong>{taskObj && taskObj.label}</strong>. You can import your own below, or pick a benchmark.</>}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {recommendedDatasets.map(d => {
                  const sel = dataId === d.id;
                  return (
                    <button key={d.id} onClick={() => setDataId(d.id)} style={{
                      textAlign: "left", padding: "14px 16px",
                      border: "1px solid " + (sel ? "var(--bern)" : "var(--hairline)"),
                      background: sel ? "var(--bern-tint)" : "var(--surface)",
                      borderRadius: 10, cursor: "pointer", fontFamily: "var(--sans)",
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                        <span style={{ flex: 1 }} />
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{d.sha}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>{d.description}</div>
                      <div className="meta" style={{ marginTop: 8 }}>
                        {(d.rows / 1000).toFixed(0)}k rows · {d.stations} entities · {d.freq} · {d.size}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, padding: 14, border: "1px dashed var(--hairline-strong)", borderRadius: 10, background: "var(--canvas-warm)", display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="drop" size={20} color="var(--ink-muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>Or import your own — drop a CSV / Parquet here</div>
                  <div className="meta" style={{ marginTop: 3, letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)", color: "var(--ink-muted)" }}>The Annotated Drop will preview the schema with agent commentary anchored row-by-row.</div>
                </div>
                <button className="btn sm">Choose file</button>
              </div>
            </StepIntro>
          )}

          {stepId === "review" && (
            <StepIntro line="Last look before LIULIAN scaffolds the project.">
              {kind !== "one-shot" && (
                <div style={{ marginBottom: 18 }}>
                  <div className="meta" style={{ marginBottom: 6 }}>project name</div>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} autoFocus
                    placeholder="e.g. aare-hydro · summer-2026"
                    style={{ width: "100%", border: "1px solid var(--hairline)", borderRadius: 8, padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 14, outline: "none", background: "var(--surface)" }} />
                </div>
              )}
              <div className="card" style={{ padding: "18px 22px" }}>
                <div className="meta meta-strong" style={{ marginBottom: 12 }}>configuration</div>
                <Row k="kind"    v={kind === "one-shot" ? "One-shot · default project" : "Create project"} />
                <Row k="name"    v={projectName || <em style={{ color: "var(--ink-faint)" }}>—</em>} mono />
                <Row k="domain"  v={(DOMAINS.find(d => d.id === domain) || {}).label} />
                <Row k="task"    v={(taskObj || {}).label} />
                <Row k="models"  v={modelIds.join(" · ") || "—"} mono />
                <Row k="data"    v={(DATASETS.find(d => d.id === dataId) || {}).name || "—"} mono />
                <Row k="next steps · auto" v={
                  <span>
                    <strong style={{ color: "var(--ink)" }}>{kind === "one-shot" ? "1) preview data · 2) train baseline · 3) open canvas." : "1) create project · 2) preview data · 3) train baseline · 4) schedule production · 5) draft a brief."}</strong>
                  </span>
                } />
              </div>
              <div className="meta" style={{ marginTop: 14, color: "var(--ink-muted)" }}>You can revisit any of these layers later from the project's Settings.</div>
            </StepIntro>
          )}
        </div>

        <footer style={{ padding: "14px 28px", borderTop: "1px solid var(--hairline)", background: "var(--surface-shade)", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn ghost" onClick={onClose}>cancel</button>
          <span style={{ flex: 1 }} />
          {step > 0 && <button className="btn" onClick={() => setStep(s => s - 1)}>← back</button>}
          {step < WIZARD_STEPS.length - 1 && (
            <button className="btn primary" onClick={() => setStep(s => s + 1)}>next →</button>
          )}
          {step === WIZARD_STEPS.length - 1 && (
            <button className="btn primary" onClick={() => onFinish({ kind, projectName, domain, task, modelIds, dataId })}>
              {kind === "one-shot" ? "Launch one-shot →" : "Create project →"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Stepper({ step, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "2px 8px",
            background: i === step ? "var(--ink)" : i < step ? "var(--surface-shade)" : "transparent",
            color: i === step ? "#fff" : i < step ? "var(--ink-muted)" : "var(--ink-faint)",
            borderRadius: 4,
          }}>{(i + 1).toString().padStart(2, "0")} · {s.label}</span>
          {i < steps.length - 1 && <span style={{ color: "var(--ink-quiet)", fontSize: 10 }}>›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepIntro({ line, children }) {
  return (
    <>
      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", margin: "0 0 24px", maxWidth: "60ch" }}>{line}</p>
      {children}
    </>
  );
}

function ChoiceCard({ active, onClick, icon, title, sub, extra, preview }) {
  return (
    <button onClick={onClick} disabled={preview}
      style={{
        textAlign: "left", padding: "18px 18px 16px",
        border: "1px solid " + (active ? "var(--bern)" : "var(--hairline)"),
        background: active ? "var(--bern-tint)" : "var(--surface)",
        borderRadius: 10, cursor: preview ? "not-allowed" : "pointer", fontFamily: "var(--sans)",
        opacity: preview ? 0.55 : 1, position: "relative",
      }}>
      {preview && <span className="meta" style={{ position: "absolute", top: 12, right: 14, color: "var(--ink-muted)" }}>preview · soon</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {icon && <Icon name={icon} size={16} color={active ? "var(--bern)" : "var(--ink-muted)"} />}
        <div style={{ fontSize: 17, fontWeight: 500, fontFamily: "var(--serif)", fontVariationSettings: '"opsz" 22' }}>{title}</div>
        {active && <span className="meta" style={{ marginLeft: "auto", color: "var(--bern)" }}>● picked</span>}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 8 }}>{sub}</div>
      {extra && <div className="meta" style={{ color: "var(--ink-muted)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--sans)" }}>{extra}</div>}
    </button>
  );
}

function Row({ k, v, mono }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 12, padding: "7px 0", borderTop: "1px dashed var(--hairline)", alignItems: "baseline" }}>
      <span className="meta">{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: mono ? 13 : 14, color: "var(--ink-soft)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { SetupWizard });
