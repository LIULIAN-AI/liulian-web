export type ChartType = 'bar' | 'grouped-bar' | 'line' | 'area' | 'radar' | 'donut';

export interface ChartDataRow {
  name: string;
  [key: string]: string | number | null;
}

export interface ChartSpec {
  type: ChartType;
  title?: string;
  data: ChartDataRow[];
  xKey?: string;
  yKey?: string;
  series?: SeriesConfig[];
  color?: string;
  colors?: string[];
  unit?: string;
  innerLabel?: string;
}

export interface SeriesConfig {
  dataKey: string;
  label: string;
  color: string;
}

export const BRAND_COLORS = [
  '#1e40af', // deep blue — primary metric
  '#0d9488', // teal — secondary metric
  '#7c3aed', // violet — third metric
  '#d97706', // amber — fourth metric
  '#64748b', // slate — fifth metric
  '#0891b2', // cyan — sixth metric
];

export const CHART_SEMANTIC = {
  positive: '#0d9488',
  negative: '#dc2626',
  neutral: '#64748b',
  benchmark: '#94a3b8',
};
