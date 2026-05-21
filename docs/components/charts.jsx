// ──────────────────────────────────────────────────────────────
// ECharts helpers + reusable chart components
// ──────────────────────────────────────────────────────────────
const { useEffect: useEf, useRef: useRf } = React;

const LIULIAN_BASE_OPTION = {
  textStyle: { fontFamily: "Switzer, sans-serif", color: "#131313" },
  tooltip: {
    trigger: "axis",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E7E2",
    textStyle: { color: "#131313", fontFamily: "JetBrains Mono", fontSize: 11 },
    extraCssText: "box-shadow: 0 8px 24px rgba(19,19,19,0.08); border-radius:8px; padding:8px 10px;",
  },
  grid: { left: 56, right: 18, top: 18, bottom: 38, containLabel: false },
  xAxis: {
    type: "category",
    axisLine: { lineStyle: { color: "#E8E7E2" } },
    axisTick: { show: false },
    axisLabel: { color: "#666A70", fontSize: 10, fontFamily: "JetBrains Mono" },
    splitLine: { show: false },
  },
  yAxis: {
    type: "value",
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#666A70", fontSize: 10, fontFamily: "JetBrains Mono" },
    splitLine: { lineStyle: { color: "#E8E7E2", type: "dashed" } },
  },
};

function useECharts(option, deps = []) {
  const ref = useRf(null);
  useEf(() => {
    if (!ref.current) return;
    const chart = window.echarts.init(ref.current);
    chart.setOption(option);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); chart.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Forecast chart with Q05–Q95 fan, mean, observed. */
function ForecastChart({ id = "fc-1", horizon = 72, seed = 42, baseValue = 408.2, height = 300 }) {
  const r = rng(seed);
  const baseTs = new Date("2026-05-13T05:00:00Z").getTime();
  const t = Array.from({ length: horizon }, (_, i) =>
    new Date(baseTs + (i - 24) * 3600 * 1000).toISOString().slice(0, 13).replace("T", " "));
  const mean = Array.from({ length: horizon }, (_, i) => baseValue + 0.4 * (i - 24) + (r() - 0.5) * 8.5);
  const halfWidth = Array.from({ length: horizon }, (_, i) => Math.max(4, 8.5 * (1 + Math.max(0, i - 24) / horizon) * 1.96));
  const q05 = mean.map((m, i) => m - halfWidth[i]);
  const q95 = mean.map((m, i) => m + halfWidth[i]);
  const observed = t.map((_, i) => i < 24 ? baseValue + Math.sin(i / 4) * 14 + (r() - 0.5) * 4 : null);

  const option = {
    ...LIULIAN_BASE_OPTION,
    grid: { left: 58, right: 24, top: 20, bottom: 50 },
    xAxis: { ...LIULIAN_BASE_OPTION.xAxis, data: t,
      axisLabel: { ...LIULIAN_BASE_OPTION.xAxis.axisLabel, formatter: v => v.slice(5) },
      markLine: undefined,
    },
    yAxis: { ...LIULIAN_BASE_OPTION.yAxis, name: "m³/s", nameTextStyle: { color: "#94989D", fontFamily: "JetBrains Mono", fontSize: 10 } },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", height: 14, bottom: 8, borderColor: "#E8E7E2", fillerColor: "rgba(226,6,19,0.16)", handleStyle: { color: "#B00010" }, textStyle: { color: "#94989D", fontFamily: "JetBrains Mono", fontSize: 10 } },
    ],
    series: [
      { name: "Q05",  type: "line", data: q05, lineStyle: { opacity: 0 }, stack: "fan", symbol: "none", silent: true },
      { name: "fan",  type: "line", data: q95.map((hi, i) => hi - q05[i]), lineStyle: { opacity: 0 }, areaStyle: { color: "rgba(226,6,19,0.16)" }, stack: "fan", symbol: "none", silent: true },
      { name: "Mean (forecast)", type: "line", data: mean.map((v, i) => i < 23 ? null : v), smooth: false, symbol: "none", lineStyle: { color: "#E20613", width: 1.6, type: "dashed" }, z: 5, connectNulls: false },
      { name: "Observed", type: "line", data: observed, smooth: false, symbol: "none", lineStyle: { color: "#131313", width: 1.6 }, z: 6 },
      { name: "now", type: "line", data: [], markLine: { silent: true, symbol: "none", lineStyle: { color: "#B00010", width: 1, type: "solid", opacity: 0.4 }, label: { formatter: "now", color: "#B00010", fontFamily: "JetBrains Mono", fontSize: 10, position: "insideEndTop" }, data: [{ xAxis: 23 }] } },
    ],
  };
  const ref = useECharts(option, [seed, horizon, baseValue]);
  return <div ref={ref} id={id} style={{ width: "100%", height }} />;
}

/** Loss-curve overlay for training. */
function LossCurves({ id = "loss-1", height = 220, runs = ["patchtst", "lstm", "dlinear"] }) {
  const steps = Array.from({ length: 80 }, (_, i) => (i * 250).toString());
  const series = runs.map((m, idx) => {
    const r = rng(13 + idx * 7);
    const decay = idx === 0 ? 0.06 : idx === 1 ? 0.045 : 0.032;
    const data = steps.map((_, i) => +(1.2 * Math.exp(-decay * i / 4) + 0.05 + (r() - 0.5) * 0.05).toFixed(3));
    return { name: m, type: "line", data, smooth: true, symbol: "none", lineStyle: { width: 1.4, color: ["#E20613", "#0066B3", "#509A39", "#E6863A"][idx % 4] } };
  });
  const option = {
    ...LIULIAN_BASE_OPTION,
    legend: { top: 0, right: 8, textStyle: { color: "#666A70", fontFamily: "JetBrains Mono", fontSize: 10 }, itemHeight: 6, itemWidth: 12 },
    grid: { left: 50, right: 18, top: 30, bottom: 32 },
    xAxis: { ...LIULIAN_BASE_OPTION.xAxis, data: steps, axisLabel: { ...LIULIAN_BASE_OPTION.xAxis.axisLabel, formatter: v => +v >= 1000 ? (+v / 1000).toFixed(0) + "k" : v } },
    yAxis: { ...LIULIAN_BASE_OPTION.yAxis, name: "val/loss", nameTextStyle: { color: "#94989D", fontFamily: "JetBrains Mono", fontSize: 10 } },
    series,
  };
  const ref = useECharts(option, [runs.join("|")]);
  return <div ref={ref} id={id} style={{ width: "100%", height }} />;
}

/** Parallel coordinates for hyperparameter sweep. */
function ParallelHParams({ id = "par-1", height = 260 }) {
  const r = rng(11);
  const N = 28;
  const data = Array.from({ length: N }, () => {
    const lr = +(0.0001 + r() * 0.01).toFixed(5);
    const ctx = [128, 256, 336, 512, 720][Math.floor(r() * 5)];
    const heads = [2, 4, 8, 16][Math.floor(r() * 4)];
    const dropout = +(r() * 0.4).toFixed(2);
    const mae = +(8 + r() * 6 + (lr > 0.005 ? 4 : 0)).toFixed(2);
    return [lr, ctx, heads, dropout, mae];
  });
  const option = {
    parallelAxis: [
      { dim: 0, name: "lr",       nameLocation: "start", inverse: false, type: "log" },
      { dim: 1, name: "ctx",      nameLocation: "start", inverse: false },
      { dim: 2, name: "heads",    nameLocation: "start" },
      { dim: 3, name: "dropout",  nameLocation: "start" },
      { dim: 4, name: "MAE ↓",    nameLocation: "start", nameTextStyle: { color: "#E20613" } },
    ].map(a => ({ ...a, nameTextStyle: { color: "#666A70", fontFamily: "JetBrains Mono", fontSize: 10, ...a.nameTextStyle }, axisLine: { lineStyle: { color: "#C0C2C5" } }, axisLabel: { color: "#94989D", fontFamily: "JetBrains Mono", fontSize: 9 } })),
    parallel: { left: 60, right: 60, top: 30, bottom: 28, parallelAxisDefault: { axisLine: { lineStyle: { color: "#C0C2C5" } } } },
    series: [{
      type: "parallel",
      lineStyle: { color: "#E20613", opacity: 0.42, width: 1 },
      smooth: false, data,
      inactiveOpacity: 0.06, activeOpacity: 0.9,
    }],
  };
  const ref = useECharts(option, []);
  return <div ref={ref} id={id} style={{ width: "100%", height }} />;
}

/** Column-distribution preview for the data page (smoothed histogram). */
function ColumnDistribution({ id = "col-1", height = 120, seed = 1, color = "#E20613" }) {
  const r = rng(seed);
  const N = 60;
  const data = Array.from({ length: N }, (_, i) => {
    const x = i / N;
    const peak = Math.exp(-Math.pow((x - 0.45) * 4, 2)) * 60;
    return +(peak + r() * 6).toFixed(2);
  });
  const option = {
    ...LIULIAN_BASE_OPTION,
    grid: { left: 40, right: 12, top: 10, bottom: 24 },
    xAxis: { ...LIULIAN_BASE_OPTION.xAxis, data: data.map((_, i) => i), show: false, axisLabel: { show: false } },
    yAxis: { ...LIULIAN_BASE_OPTION.yAxis, show: false, axisLabel: { show: false } },
    series: [{
      type: "bar", data, itemStyle: { color, opacity: 0.78 }, barCategoryGap: "12%",
    }],
  };
  const ref = useECharts(option, [seed]);
  return <div ref={ref} id={id} style={{ width: "100%", height }} />;
}

/** Generic line chart from data array. */
function GenericLine({ id, data, height = 180, color = "#131313", fill = "rgba(226,6,19,0.10)" }) {
  const xs = data.map((_, i) => i);
  const option = {
    ...LIULIAN_BASE_OPTION,
    grid: { left: 40, right: 8, top: 8, bottom: 24 },
    xAxis: { ...LIULIAN_BASE_OPTION.xAxis, data: xs, axisLabel: { show: false } },
    yAxis: { ...LIULIAN_BASE_OPTION.yAxis },
    series: [{ type: "line", data, smooth: true, symbol: "none", lineStyle: { color, width: 1.4 }, areaStyle: fill ? { color: fill } : undefined }],
  };
  const ref = useECharts(option, [data.join("|"), color]);
  return <div ref={ref} id={id} style={{ width: "100%", height }} />;
}

Object.assign(window, { ForecastChart, LossCurves, ParallelHParams, ColumnDistribution, GenericLine, LIULIAN_BASE_OPTION });
