// ──────────────────────────────────────────────────────────────
// LIULIAN — mock data shared across pages
// ──────────────────────────────────────────────────────────────
const STATIONS = [
  { id: "aare-bern",       name: "Aare at Bern",        x: 320, y: 138, alt: 502,  q95: 437.1, mean: 412.4, status: "elevated" },
  { id: "aare-thun",       name: "Aare at Thun",        x: 290, y: 148, alt: 558,  q95: 311.0, mean: 287.0, status: "ok" },
  { id: "aare-hagneck",    name: "Aare at Hagneck",     x: 380, y: 125, alt: 433,  q95: 388.6, mean: 360.2, status: "ok" },
  { id: "rhine-basel",     name: "Rhine at Basel",      x: 600, y: 110, alt: 252,  q95: 1190,  mean: 1071,  status: "watch" },
  { id: "rhine-rekingen",  name: "Rhine at Rekingen",   x: 660, y: 120, alt: 343,  q95: 612.5, mean: 580.3, status: "ok" },
  { id: "reuss-luzern",    name: "Reuss at Luzern",     x: 420, y: 155, alt: 432,  q95: 318.4, mean: 290.7, status: "ok" },
  { id: "limmat-zurich",   name: "Limmat at Zurich",    x: 540, y: 135, alt: 406,  q95: 252.0, mean: 230.5, status: "ok" },
  { id: "inn-martina",     name: "Inn at Martina",      x: 680, y: 155, alt: 1030, q95: 188.2, mean: 162.0, status: "ok" },
  { id: "rhone-porte",     name: "Rhône at Porte-du-Sex",x:180, y: 195, alt: 374,  q95: 700.0, mean: 615.3, status: "ok" },
  { id: "brienzersee",     name: "Brienzersee",          x: 350, y: 158, alt: 564,  q95: 142.0, mean: 130.1, status: "ok" },
];

const DATASETS = [
  {
    id: "swiss-river-1990",
    name: "Swiss-River 1990",
    sha: "b7f2a1ce", domain: "hydrology",
    rows: 1840320, stations: 28, features: 5, horizon: "168h",
    freq: "1h", range: "1990-01-01 → 2024-12-31", size: "412 MB",
    license: "CC-BY 4.0", source: "BAFU · swisstopo",
    updated: "2026-05-12 04:00", manifest: "v3.2.1",
    description: "Hourly discharge (m³/s), water temperature (°C), precipitation (mm) for 28 Swiss river stations. 1990–2024.",
    quality: 0.984,
    fields: [
      { name: "ts",          type: "timestamp", null: 0,     uniq: 1840320, ex: "1990-01-01T00:00:00Z" },
      { name: "station_id",  type: "string",    null: 0,     uniq: 28,      ex: "aare-bern" },
      { name: "discharge",   type: "float64",   null: 0.012, uniq: 1683112, ex: "412.4",  unit: "m³/s",  min: 12.3, max: 2104.0, mean: 287.4 },
      { name: "temperature", type: "float32",   null: 0.041, uniq: 4811,    ex: "8.2",    unit: "°C",     min: -0.4, max: 27.1, mean: 9.8 },
      { name: "precip",      type: "float32",   null: 0.003, uniq: 6022,    ex: "0.12",   unit: "mm/h",   min: 0,    max: 84.2, mean: 0.11 },
      { name: "is_snowmelt", type: "bool",      null: 0,     uniq: 2,       ex: "false" },
    ],
  },
  { id: "swiss-river-2010", name: "Swiss-River 2010", sha: "8c0e44a2", domain: "hydrology",
    rows: 3149280, stations: 45, features: 5, horizon: "168h", freq: "1h",
    range: "2010-01-01 → 2024-12-31", size: "684 MB", license: "CC-BY 4.0", source: "BAFU · swisstopo",
    updated: "2026-05-12 04:00", manifest: "v2.1.0", quality: 0.991,
    description: "Extended 45-station benchmark, 2010 onward. Includes upstream/downstream graph.", fields: [] },
  { id: "electricity", name: "Electricity Load (UCI)", sha: "21de9a3f", domain: "energy",
    rows: 26304, stations: 321, features: 1, horizon: "96h", freq: "1h",
    range: "2011-01-01 → 2014-12-31", size: "47 MB", license: "Open Data Commons", source: "UCI ML Repository",
    updated: "2026-04-21 12:00", manifest: "v1.0.4", quality: 1.0,
    description: "321 client kWh load curves, 2011–2014.", fields: [] },
  { id: "etth1", name: "ETT-h1", sha: "55cc1190", domain: "energy",
    rows: 17420, stations: 1, features: 7, horizon: "720h", freq: "1h",
    range: "2016-07-01 → 2018-06-26", size: "1.4 MB", license: "MIT", source: "ETDataset · Zhou et al.",
    updated: "2026-04-21 12:00", manifest: "v1.0.0", quality: 1.0,
    description: "Electricity Transformer Temperature, hourly long-horizon benchmark.", fields: [] },
  { id: "traffic", name: "PEMS-Bay", sha: "70b1abc2", domain: "traffic",
    rows: 52116, stations: 325, features: 1, horizon: "24h", freq: "5min",
    range: "2017-01-01 → 2017-06-30", size: "238 MB", license: "Public Domain", source: "CalTrans PeMS",
    updated: "2026-03-08 09:00", manifest: "v1.1.0", quality: 0.967,
    description: "Bay-area highway sensors, 5-minute intervals.", fields: [] },
  { id: "weather-jena", name: "Weather · Jena", sha: "9012f3a4", domain: "weather",
    rows: 52704, stations: 1, features: 21, horizon: "96h", freq: "10min",
    range: "2020-01-01 → 2021-12-31", size: "11 MB", license: "CC-BY 4.0", source: "MPI Jena",
    updated: "2026-03-08 09:00", manifest: "v1.0.2", quality: 0.999,
    description: "MPI Jena meteorological station, 21 variables, 10-min sampling.", fields: [] },
];

const MODELS = [
  { id: "patchtst",     family: "Transformer (patched)", paper: "arxiv:2211.14730",   params: "8.4M",  ctx: "512",  status: "stable",   role: "supervised" },
  { id: "itransformer", family: "Inverted Transformer",  paper: "arxiv:2310.06625",   params: "11.2M", ctx: "512",  status: "stable",   role: "supervised" },
  { id: "timesnet",     family: "Temporal 2D-Vision",    paper: "arxiv:2210.02186",   params: "6.7M",  ctx: "336",  status: "stable",   role: "supervised" },
  { id: "dlinear",      family: "Linear",                paper: "arxiv:2205.13504",   params: "0.04M", ctx: "336",  status: "baseline", role: "supervised" },
  { id: "mamba",        family: "State-space",           paper: "arxiv:2312.00752",   params: "12.1M", ctx: "2048", status: "stable",   role: "supervised" },
  { id: "chronos-2",    family: "Pretrained FM",         paper: "amazon-science",     params: "200M",  ctx: "2048", status: "stable",   role: "zero-shot" },
  { id: "timemoe",      family: "Mixture-of-Experts FM", paper: "Maple728/TimeMoE-50M",params:"50M",   ctx: "2048", status: "preview",  role: "zero-shot" },
  { id: "time-llm",     family: "LLM-reprogrammed",      paper: "arxiv:2310.01728",   params: "7B",    ctx: "1024", status: "preview",  role: "few-shot" },
  { id: "etsformer",    family: "Exponential smoothing", paper: "arxiv:2202.01381",   params: "5.2M",  ctx: "336",  status: "stable",   role: "supervised" },
  { id: "lstm",         family: "Recurrent",             paper: "—",                  params: "0.8M",  ctx: "168",  status: "baseline", role: "supervised" },
];

const RUNS = [
  { id: "r-7c8a", dataset: "swiss-river-1990", model: "patchtst",     entity: "none",   seed: 42, status: "running",   started: "2026-05-13 04:21", dur: "39m", mae: null,  rmse: null,  cov90: null, owner: "lj" },
  { id: "r-7c89", dataset: "swiss-river-1990", model: "lstm",         entity: "none",   seed: 42, status: "completed", started: "2026-05-12 14:38", dur: "1h 12m", mae: 11.84, rmse: 16.92, cov90: 82.1, owner: "lj" },
  { id: "r-7c88", dataset: "swiss-river-1990", model: "chronos-2",    entity: "none",   seed: 0,  status: "pending",   started: "—",                dur: "—",   mae: null,  rmse: null,  cov90: null, owner: "lj" },
  { id: "r-7c87", dataset: "swiss-river-1990", model: "itransformer", entity: "hash",   seed: 7,  status: "failed",    started: "2026-05-12 22:04", dur: "12m", mae: null,  rmse: null,  cov90: null, owner: "lj", err: "CUDA OOM at step 4096 / 18000" },
  { id: "r-7c86", dataset: "etth1",            model: "timesnet",     entity: "onehot", seed: 1,  status: "completed", started: "2026-05-11 19:17", dur: "2h 04m", mae: 0.428, rmse: 0.611, cov90: 89.4, owner: "ms" },
  { id: "r-7c85", dataset: "electricity",      model: "mamba",        entity: "embed",  seed: 42, status: "completed", started: "2026-05-10 11:02", dur: "3h 47m", mae: 0.087, rmse: 0.142, cov90: 91.0, owner: "lj" },
  { id: "r-7c84", dataset: "swiss-river-1990", model: "patchtst",     entity: "embed",  seed: 1,  status: "completed", started: "2026-05-09 09:11", dur: "1h 38m", mae:  8.92, rmse: 12.04, cov90: 87.8, owner: "lj" },
  { id: "r-7c83", dataset: "swiss-river-1990", model: "patchtst",     entity: "none",   seed: 2,  status: "completed", started: "2026-05-08 16:42", dur: "1h 41m", mae:  8.42, rmse: 11.27, cov90: 88.5, owner: "lj" },
];

const REPORTS = [
  { id: "swiss-river-overview", name: "Swiss-River · Overview",     panels: 6, public: true,  updated: "2026-05-12", owner: "Linlin Jia", viewers: 14 },
  { id: "bern-q95-watchdog",    name: "Bern Q95 · Watchdog",        panels: 3, public: true,  updated: "2026-05-11", owner: "Linlin Jia", viewers: 8 },
  { id: "model-shootout-may",   name: "Model shoot-out — May 2026", panels: 8, public: false, updated: "2026-05-10", owner: "Linlin Jia", viewers: 3 },
  { id: "rhine-basel-handoff",  name: "Rhine·Basel handoff brief",  panels: 4, public: false, updated: "2026-05-07", owner: "M. Steiner",  viewers: 2 },
];

const NAV = [
  { id: "today",     label: "Today",      icon: "sunrise",   group: "" },
  { id: "data",      label: "Data",       icon: "database",  group: "Workspace" },
  { id: "visualize", label: "Visualize",  icon: "bar-chart", group: "Workspace" },
  { id: "train",     label: "Train",      icon: "sparkles",  group: "Workspace" },
  { id: "predict",   label: "Predict",    icon: "broadcast", group: "Workspace" },
  { id: "live",      label: "Live",       icon: "activity",  group: "Workspace" },
  { id: "reports",   label: "Reports",    icon: "newspaper", group: "Workspace" },
  { id: "models",    label: "Models",     icon: "box",       group: "Library" },
  { id: "library",   label: "Library",    icon: "library",   group: "Library" },
  { id: "agent",     label: "Agent",      icon: "agent",     group: "Library" },
  { id: "settings",  label: "Settings",   icon: "sliders",   group: "System" },
];

// hierarchical config — the four layers any ML use-case sits inside.
// Mirrors liulian-python's domain / task / model / data layering.
const DOMAINS = [
  { id: "time-series", label: "Time series",        sub: "ordered observations · t-indexed",                examples: "river · energy · traffic · weather · transactions", icon: "activity",  default: true  },
  { id: "tabular",     label: "Tabular",            sub: "rows × columns · independent observations",        examples: "customers · transactions · sensors snapshot",        icon: "database",  default: false },
  { id: "graph",       label: "Graph",              sub: "nodes + edges · relational",                       examples: "river network · social · molecules",                   icon: "graft",      default: false },
  { id: "vision",      label: "Vision",             sub: "images · spatial signal",                          examples: "satellite · medical · documents",                       icon: "easel",      default: false, preview: true },
  { id: "text",        label: "Text",               sub: "natural-language sequences",                       examples: "logs · documents · captions",                            icon: "newspaper",  default: false, preview: true },
];

const TASKS = {
  "time-series": [
    { id: "forecast",   label: "Forecasting",         sub: "predict future values from history",       models: ["patchtst", "chronos-2", "timesnet", "itransformer", "lstm", "dlinear"], default: true  },
    { id: "anomaly",    label: "Anomaly detection",   sub: "flag points that don't fit the pattern",   models: ["isolation-forest", "patchtst", "lstm-ae"],                            default: false },
    { id: "classify",   label: "Classification",       sub: "label each window or series",              models: ["rocket", "inception-time", "patchtst-cls"],                           default: false },
    { id: "impute",     label: "Imputation",           sub: "fill missing observations",                models: ["brits", "saits", "linear"],                                            default: false },
    { id: "causal",     label: "Causal / intervention", sub: "estimate the effect of an action",         models: ["double-ml", "synth-control"],                                          default: false, preview: true },
  ],
  "tabular": [
    { id: "regress",  label: "Regression",      sub: "predict a continuous target",        models: ["xgboost", "lightgbm", "tabnet"], default: true },
    { id: "classify", label: "Classification",   sub: "predict a label",                    models: ["xgboost", "lightgbm", "tabnet"], default: false },
    { id: "rank",     label: "Ranking",          sub: "order items by relevance",           models: ["lightgbm-ranker"],                default: false },
  ],
  "graph":  [
    { id: "node-cls", label: "Node classification", sub: "label nodes",        models: ["gcn", "gat", "graphsage"], default: true },
    { id: "link",     label: "Link prediction",     sub: "predict edges",      models: ["gcn", "gat"],              default: false },
  ],
  "vision": [{ id: "image-cls", label: "Image classification", sub: "label images", models: ["resnet", "vit"], default: true }],
  "text":   [{ id: "text-cls",  label: "Text classification",  sub: "label spans",  models: ["bert", "roberta"], default: true }],
};

// quick-start templates exposed on the Doorway.
const ENTRIES = [
  {
    id: "create-project",
    title: "Create a project",
    sub: "Structured workspace · datasets · models · runs · reports · scheduling.",
    body: "Pick a domain and a task; LIULIAN scaffolds the rest. Suited for long-running work and teams.",
    cta: "Set up →",
    duration: "≈ 2 min setup",
    needs: "domain · task · data",
    icon: "doorway",
  },
  {
    id: "one-shot",
    title: "One-shot run",
    sub: "Drop data, pick a task, see results. We'll keep it in a default project.",
    body: "For exploration, demos, or testing an idea. Project ceremony optional; you can promote later.",
    cta: "Start one-shot →",
    duration: "≈ 60 s",
    needs: "data · task",
    icon: "drop",
  },
  {
    id: "open-recent",
    title: "Open a recent",
    sub: "Pick up exactly where you left off.",
    body: "aare-hydro (yesterday 17:42) · rhone-basin (Mon) · etth-bench (last week).",
    cta: "Resume →",
    duration: "instant",
    needs: "—",
    icon: "library",
  },
  {
    id: "try-demo",
    title: "Try a live demo",
    sub: "Swiss-River 1990 · 28 stations · 30 years of hourly discharge.",
    body: "The canvas lights up in 6 seconds. You'll land in First Light — the narrated dashboard.",
    cta: "Load demo →",
    duration: "6 seconds",
    needs: "—",
    icon: "light",
  },
];

const PROJECTS = [
  { id: "aare-hydro",   name: "aare-hydro",   sub: "Swiss-River · BAFU",      role: "editor", current: true,  datasets: 6, models: 5, runs: 18 },
  { id: "rhone-basin",  name: "rhone-basin",  sub: "Rhône tributaries · v0",  role: "owner",  current: false, datasets: 2, models: 1, runs: 4 },
  { id: "etth-bench",   name: "etth-bench",   sub: "ETT-h1/h2 benchmarks",    role: "viewer", current: false, datasets: 2, models: 8, runs: 31 },
  { id: "demo-energy",  name: "demo-energy",  sub: "Electricity Load sandbox",role: "owner",  current: false, datasets: 1, models: 3, runs: 9 },
];

// modes — the three interaction shapes the platform supports.
// C (Fused) is the default and the headline.
const MODES = [
  { id: "A", label: "Classical", sub: "no-bot · pure controls"            , detail: "Hands-on. The agent rail is hidden; the canvas behaves like a mature BI tool." },
  { id: "B", label: "AI-first",  sub: "all-bot · conversation"            , detail: "Controls collapse; everything happens in the agent. Demos well, intimidating for first-time visitors." },
  { id: "C", label: "Fused",     sub: "controls + agent · spatially anchored", detail: "The headline mode. Agent speaks from where you look. F1 anchoring · F2 prefetch · F3 spec sync · F4 visible reasoning · F5 reversible · F6 shared cursor." },
];

const FUSED_PRINCIPLES = [
  { id: "F1", name: "Spatial anchoring",       line: "Agent speaks AT the canvas — anchored to the cell, panel, or stroke. Never in a side rail." },
  { id: "F2", name: "Predictive prefetch",     line: "Dwell → preload. The next click renders from cache, not from the wire." },
  { id: "F3", name: "Bidirectional spec sync", line: "Edit the control or the spec — either is canonical, neither is second-class." },
  { id: "F4", name: "Visible reasoning",       line: "Every suggestion carries a one-sentence why + a clickable footnote that scrolls to the source data." },
  { id: "F5", name: "Reversible by default",   line: "Every agent change shows a diff and a one-click undo. Refuse after the fact, not only before." },
  { id: "F6", name: "Shared cursor",           line: "Agent has a pencil. It marks cells, draws on the chart, highlights strokes — alongside yours, in a distinct color." },
];

// Seven canonical user stories. Story 0 is Today (Morning watch); 1-6 are the upstream stories.
const STORIES = [
  {
    id: "morning-watch",
    code: "0",
    title: "Morning watch",
    cn: "晨阅",
    persona: "Maria · BAFU analyst",
    setup: "Monday 07:00. Brief the team in two hours. What changed overnight?",
    modes: ["A", "B", "C"],
    principles: ["F1", "F4"],
    steps: [
      "Open Today — read the agent's anchored morning note",
      "Tap the critical alert · Bern Q95 — jump to Forecast",
      "Ask the agent · draft a one-paragraph brief",
      "Pin to this week's report · publish",
    ],
    start: { page: "today", note: "you're already here" },
    duration: "≈ 6 minutes",
  },
  {
    id: "doorway",
    code: "1",
    title: "The Doorway",
    cn: "门厅",
    persona: "First-time visitor · 20-second budget",
    setup: "Reached liulian.app from an advisor's link. Half data person, half domain expert. Has 20–60 s before they bounce.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F2", "F4", "F6"],
    steps: [
      "Land on / · three cards: Create project · Import data · Run a model",
      "Hover Import for 1.5 s · agent's anchored bubble offers swiss-river-1990 (28 stations, 6 s)",
      "While you read, agent prefetches the dataset's stations + recent observations",
      "Click — the canvas is already warm; transitions in under 300 ms",
      "Agent migrates from corner chip to canvas rail; first canvas message ready",
    ],
    start: { page: "today", note: "demoed on the Today landing" },
    duration: "≈ 20 seconds to first action",
  },
  {
    id: "annotated-drop",
    code: "2",
    title: "The Annotated Drop",
    cn: "落档",
    persona: "Researcher · CSV in hand",
    setup: "A CSV with daily water-temperature for three stations, 2010 → 2024. Verify the schema is right before it touches anything.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F4", "F5", "F6"],
    steps: [
      "Data → + Import · drop the CSV",
      "Schema renders left; agent annotations stream on the right, anchored row-by-row",
      "Agent says: station has 3 unique values — consider category · click [apply: category]",
      "23 rows with NaN wt_C — agent marks them with a red dot inline · pick interpolate · preview",
      "Commit · transforms are stored on the dataset version, undoable from the diff strip",
    ],
    start: { page: "data", note: "click + Import on the dataset rail" },
    duration: "≈ 4 minutes",
  },
  {
    id: "first-light",
    code: "3",
    title: "First Light",
    cn: "亮起",
    persona: "Analyst · canvas just opened",
    setup: "Dataset just landed. The canvas is about to light up — opinionated default, narrated, inspectable.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F2", "F4", "F6"],
    steps: [
      "Panels stagger in 0.2 s apart — stations rail, then fan, then table, then map, then KPIs",
      "Each panel arrives with a one-sentence callout from the agent, anchored to the panel",
      "Every callout has a clickable footnote that scrolls to the source data",
      "After 8 s the agent falls silent — the lead is yours",
      "Hover any panel for 1 s · agent prefetches the drill-down; click is instant",
    ],
    start: { page: "forecast", note: "land after import" },
    duration: "≈ 8 seconds of narration, then yours",
  },
  {
    id: "pencil",
    code: "4",
    title: "The Pencil",
    cn: "改笔",
    persona: "Researcher · spots a sensor glitch",
    setup: "A 28.4 °C reading in November for a mountain station. Edit one cell — and find every other one like it.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F2", "F3", "F4", "F5", "F6"],
    steps: [
      "Double-click the cell · type 7.92 · enter",
      "Within 300 ms the agent infers \"outlier removal\" and offers 23 more candidates (z > 2.5)",
      "Click [show them] — agent outlines all 23 in dotted red in the table",
      "Pick an action: null · interpolate · keep · or refine the rule with three sliders",
      "Preview layer renders against fan + KPIs; commit makes it the dirty layer · still undoable",
    ],
    start: { page: "data", note: "Table tab · click any value" },
    duration: "≈ 90 seconds for 24 edits",
  },
  {
    id: "graft",
    code: "5",
    title: "The Graft",
    cn: "嫁接",
    persona: "Researcher · needs more material",
    setup: "Needs precipitation from MeteoSwiss to explain the cold-front anomalies. And a derived column. And next week's rows when they land.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F3", "F4", "F6"],
    steps: [
      "Data → + extend dataset · three tabs: append rows · derived column · external join",
      "Agent suggests MeteoSwiss precip + ERA5 soil-moisture from the domain catalog",
      "Pick precip — two-track alignment canvas opens · agent aligns on date by default",
      "Drag the lower track ±2 days · correlation recomputes in real time · agent annotates mis-alignment",
      "Commit at +1 d (corr 0.73 vs 0.71 at 0 d) · column joins · #picker includes precip overlay",
    ],
    start: { page: "data", note: "Pipeline tab · + step" },
    duration: "≈ 6 minutes",
  },
  {
    id: "easel",
    code: "6",
    title: "The Easel",
    cn: "画板",
    persona: "Researcher · wants the 11th chart",
    setup: "No template covers it. Author it three ways — Code · Canvas · Sketch — and the agent fills in.",
    modes: ["A", "B", "C"],
    principles: ["F1", "F3", "F4", "F5", "F6"],
    steps: [
      "Visualize → + author chart · pick Sketch",
      "Draw a downward curve · agent's ghost stroke overlays in dashed red within 600 ms",
      "Anchored bubble: \"line chart, time on x, declining y?\" · [yes — render]",
      "Sketch fades · real chart bound to data takes its place",
      "Draw a 3×3 grid icon · agent offers \"convert to small multiples · group by station\"",
      "Commit · the LiulianChartSpec is the canonical artifact; the original sketch is kept as metadata",
    ],
    start: { page: "visualize", note: "Sketch tab is the headline" },
    duration: "≈ 3 minutes",
  },
];

const COMMANDS = [
  { group: "Navigate", lbl: "Today · morning watch",     icon: "sunrise",   run: ({nav}) => nav("today") },
  { group: "Navigate", lbl: "Forecast canvas",           icon: "activity",  run: ({nav}) => nav("forecast") },
  { group: "Navigate", lbl: "Workspace · Data",          icon: "database",  run: ({nav}) => nav("data") },
  { group: "Navigate", lbl: "Workspace · Visualize",     icon: "bar-chart", run: ({nav}) => nav("visualize") },
  { group: "Navigate", lbl: "Workspace · Train",         icon: "sparkles",  run: ({nav}) => nav("train") },
  { group: "Navigate", lbl: "Workspace · Inference",     icon: "broadcast", run: ({nav}) => nav("inference") },
  { group: "Navigate", lbl: "Workspace · Reports",       icon: "newspaper", run: ({nav}) => nav("reports") },
  { group: "Navigate", lbl: "Library · Models",          icon: "box",       run: ({nav}) => nav("models") },
  { group: "Navigate", lbl: "Library · Catalog",         icon: "library",   run: ({nav}) => nav("library") },
  { group: "Navigate", lbl: "Library · Agent",           icon: "agent",     run: ({nav}) => nav("agent") },
  { group: "Project",  lbl: "Switch project · aare-hydro",   run: () => {} },
  { group: "Project",  lbl: "Switch project · rhone-basin",  run: () => {} },
  { group: "Project",  lbl: "New project…",                  run: () => {} },
  { group: "Mode",     lbl: "Switch to Fused mode (C) · default", run: () => {} },
  { group: "Mode",     lbl: "Switch to Classical (A) · no-bot",  run: () => {} },
  { group: "Mode",     lbl: "Switch to AI-first (B) · all-bot",  run: () => {} },
  { group: "Guides",   lbl: "Open guides — seven canonical flows", run: ({setGuides}) => setGuides(true) },
  { group: "Action",   lbl: "New dataset · import (Annotated Drop)", kbd: "⌘N", run: ({nav}) => nav("data") },
  { group: "Action",   lbl: "Fork best run on this dataset",         kbd: "⌘F", run: ({nav}) => nav("train") },
  { group: "Action",   lbl: "Run zero-shot Chronos-2",               kbd: "⌘Z", run: () => {} },
  { group: "Action",   lbl: "Compare two runs",                      kbd: "⌘M", run: () => {} },
  { group: "Action",   lbl: "New chart cell · Easel",                kbd: "⌘⇧C",run: ({nav}) => nav("visualize") },
  { group: "Action",   lbl: "Save current view as report",           kbd: "⌘S", run: () => {} },
  { group: "Action",   lbl: "Export PDF",                            kbd: "⌘P", run: () => window.print && window.print() },
  { group: "Agent",    lbl: "Ask BI agent",                          kbd: "B",  run: ({setAgent}) => setAgent(true) },
  { group: "Agent",    lbl: "Switch model · DeepSeek",               run: () => {} },
  { group: "Agent",    lbl: "Switch model · Claude Haiku 4.5",       run: () => {} },
  { group: "Agent",    lbl: "Switch model · Gemini 2.5 Flash",       run: () => {} },
];


function makeTableSample() {
  const rows = [];
  const r = (s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; })(42);
  const stationIds = STATIONS.slice(0, 6).map(s => s.id);
  const start = new Date("2024-12-29T00:00:00Z").getTime();
  for (let i = 0; i < 120; i++) {
    const ts = new Date(start + i * 3600 * 1000);
    const sid = stationIds[i % stationIds.length];
    const base = sid === "rhine-basel" ? 1071 : sid === "aare-bern" ? 412 : 280 + (sid.length * 12);
    rows.push({
      _i: i + 1,
      ts: ts.toISOString().replace("T", " ").slice(0, 16),
      station_id: sid,
      discharge: +(base + (r() - 0.5) * 60 + Math.sin(i / 8) * 25).toFixed(2),
      temperature: +(7 + (r() - 0.5) * 4).toFixed(2),
      precip: +Math.max(0, r() < 0.18 ? r() * 8 : 0).toFixed(2),
      is_snowmelt: r() < 0.08,
    });
  }
  return rows;
}
const TABLE_SAMPLE = makeTableSample();

Object.assign(window, { STATIONS, DATASETS, MODELS, RUNS, REPORTS, NAV, PROJECTS, DOMAINS, TASKS, ENTRIES, STORIES, MODES, FUSED_PRINCIPLES, TABLE_SAMPLE, COMMANDS });
