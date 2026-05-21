# Research synthesis — dashboard editing UX + chart picker + drawio embed

Date: 2026-05-21
Context: pre-R6/R7/R8 redesign of `/forecast`. User asked for:
1. real data dashboard (not BI eye-candy)
2. table-level data view + edit (add / modify / delete rows)
3. user-selectable visualisation (Power BI-style chart picker)
4. chat-bot one-shot edits (re-color, change type)
5. table → chart live binding (edit row → chart updates)
6. **twin editing tracks per chart**: (A) code/script visible + editable
   (Python / API call), (B) drawio-style vector canvas to nudge the SVG

This file synthesises the web research used in the R6-R8 design rounds.

## 1 · Dashboard editing patterns observed in 2026 BI tools

| Tool | Notable affordance |
|---|---|
| Power BI (Apr 2026) | In-visual style picker that persists with Format pane; Copilot lets users edit a visual by natural language and shows the resulting DAX/M code under "View as code" |
| Tableau Pulse (2026) | Generates narrative summaries + suggests chart type changes; users can click to accept/replace |
| Hex Magic / Deepnote AI | Notebook + chart side by side; chart is the rendered output of a cell, edit the cell and the chart updates. The AI proposes the cell code from a prompt |
| Looker Studio + Gemini | Natural-language chart edit; shows the underlying SQL when you click "View source" |
| Mode AI | Same pattern, with explicit "Open in editor" → code drawer slides over the chart |
| ThoughtSpot Sage | Natural-language → SQL → chart + explanation card |

**Common pattern** across all 2026 BI tools: **chart is the rendered output
of an editable spec** (DAX expression / SQL / VegaLite JSON / Python cell).
The chart is never directly editable as pixels — the *spec* is, and the
chart re-renders. The "AI edit by chat" is just the agent rewriting the spec.

Implication for LIULIAN: **the source of truth for a chart is a spec**
(LiulianChartSpec) — never the pixels. Twin-track editing = (A) edit the
spec as JSON/Python (visible at any time, code drawer pattern), (B) edit
the spec visually using a chart-config UI (picker for type, colour, fields).

## 2 · Chart picker UX

The picker maps high-level user intent ("compare", "trend", "distribution",
"composition", "relationship") to chart types. Power BI presents this as
a grid of icon tiles in the visualisations pane; user clicks a tile and
the current dataset re-renders. Vega-Lite's editor is grammar-based and
doesn't have a picker — you write the spec by hand or use Mark menu.

**LIULIAN's picker** (R6): tile grid grouped by intent, with both
*standard* (line, bar, area, scatter, table, heatmap) and *liulian-specific*
(fan chart Q05–Q95, severity ribbon, correlation matrix, river-network map,
multi-model overlay) tiles. The latter are the brand differentiation —
they aren't available in Power BI.

## 3 · Chart libraries — pick

| Library | License | Bundle | Strengths | Weaknesses |
|---|---|---|---|---|
| [Plotly.js](https://github.com/plotly/plotly.js) | MIT | ~1.8MB min | Rich chart types, well-known | Heavy |
| [react-chart-editor](https://github.com/plotly/react-chart-editor) | MIT | + plotly | Drop-in `<PlotlyEditor/>` for chart config UI | Last release 0.46.1 (Nov 2023) — moderately stale, but stable |
| [Vega-Lite](https://vega.github.io/vega-lite/) | BSD-3 | ~300KB | Grammar-based, JSON spec is portable, embeddable | Steeper learning curve, no built-in picker |
| [ECharts](https://echarts.apache.org/) | Apache-2 | ~700KB | Already used in LIULIAN; Q05-Q95 fan is straightforward | Spec is JS-object, less portable than JSON |
| [Observable Plot](https://observablehq.com/plot/) | ISC | ~400KB | Declarative D3 wrapper, lovely defaults | Less interactive |

**Pick (R6)**: keep **ECharts** as the rendering engine (already wired);
add a **LiulianChartSpec** layer that's *serialisable as JSON* and
*round-trippable to Python* (so the "code visible" track shows both a
JSON spec and a Python `plot()` call). Use react-chart-editor as the
**inspiration** but build our own simpler chart-config UI (≤ 4 panels:
Mark / Encoding / Style / Code).

## 4 · drawio embed — verdict

[drawio is open source](https://github.com/jgraph/drawio) (Apache-2.0),
client-side, embeds via an iframe with `embed=1` query param. Communication
is postMessage; the host sends a `load` action with XML/SVG payload; the
embedded editor sends `save`/`exit` events back.
[Embed FAQ](https://www.drawio.com/doc/faq/embed-mode) confirms the protocol;
`configure=1` lets the host inject fonts, palette and styles. There is no
public REST API — the integration is purely client-side via iframe.

Two embed targets relevant to us:

| Mode | URL | Use |
|---|---|---|
| Diagram editor | `https://embed.diagrams.net/?embed=1&proto=json&libraries=1&configure=1` | full editor; user draws/edits a diagram, host receives saved XML |
| Diagram viewer (read-only with limited edits) | `https://embed.diagrams.net/?lightbox=1&edit=_blank` | view-only |

Wrapper packages:
- [`embed-drawio`](https://www.npmjs.com/package/embed-drawio) (npm, 2k weekly) — provides `DiagramEditor` + `DiagramViewer` JS classes
- [`jgraph/drawio-integration`](https://github.com/jgraph/drawio-integration) — official integration examples

**Verdict for R7 twin-track-B**: embed drawio via iframe + postMessage.
Convert the LIULIAN chart's rendered SVG to a drawio XML on "Open canvas",
let user nudge nodes/colors visually, deserialise back into a
LiulianChartSpec on save. This is the most pragmatic path — no need to
build a vector canvas from scratch.

The alternative (build our own SVG editor) costs weeks and replicates
existing FOSS. drawio's only friction is the iframe — postMessage chatter
keeps the host in control.

## 5 · Persistence of edited charts

User wants to edit + save. R7 storage shape:

```python
class LiulianChartSpec:
    id: UUID
    chart_type: Literal['line', 'bar', 'area', 'scatter', 'table',
                        'heatmap', 'fan', 'severity', 'correlation',
                        'multi-model', 'map']
    dataset_ref: { dataset_id, station_ids, field, t_range }
    encoding: { x, y, color, ... }
    style: { palette, colors, axes, legend, title }
    annotations: list[Annotation]     # added in drawio track
    python_snippet: str               # auto-generated from the spec
    api_url: str                      # POST /charts/{id}/data
    updated_at, version: int
```

Save = POST/PATCH to `/charts/{id}`. The chart re-renders from spec
whenever the dataset / spec changes.

## 6 · Sources

- [GitHub: plotly/react-chart-editor (license, install, demo)](https://github.com/plotly/react-chart-editor)
- [GitHub: jgraph/drawio (Apache-2.0, client-side editor)](https://github.com/jgraph/drawio)
- [draw.io embed mode FAQ + protocol](https://www.drawio.com/doc/faq/embed-mode)
- [draw.io configure-diagram-editor](https://www.drawio.com/doc/faq/configure-diagram-editor)
- [npm: embed-drawio](https://www.npmjs.com/package/embed-drawio)
- [Vega Editor](https://vega.github.io/editor/) + grammar docs
- [Comparison: Plotly vs Vega-Lite](https://npm-compare.com/chart.js,d3,plotly.js,vega-lite)
- [Power BI April 2026 Feature Summary](https://powerbi.microsoft.com/en-us/blog/power-bi-april-2026-feature-summary/)
- [AI for Creating Dashboards in 2026 — Tools and Workflow](https://futureagi.com/blog/ai-for-creating-dashboards/)
- [Power BI / Tableau / Hex comparison](https://blog.learningcollider.org/power-bi-tableau-and-hex-oh-my-18a2246b4080)
- [How to choose the right chart for Power BI](https://zebrabi.com/how-to-choose-the-right-chart-power-bi/)
