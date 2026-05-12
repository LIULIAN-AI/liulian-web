import type { ChartSpec } from './chartTypes';

export const DEMO_BANK_COMPARISON: ChartSpec = {
  type: 'grouped-bar',
  title: 'HK Digital Banks — Key Metrics Comparison',
  xKey: 'name',
  series: [
    { dataKey: 'revenue', label: 'Revenue (HKD M)', color: '#ef4444' },
    { dataKey: 'assets', label: 'Total Assets (HKD B)', color: '#3b82f6' },
    { dataKey: 'deposits', label: 'Deposits (HKD B)', color: '#10b981' },
  ],
  data: [
    { name: 'HSBC HK', revenue: 128400, assets: 7824, deposits: 5612 },
    { name: 'StanChart', revenue: 86200, assets: 3156, deposits: 2340 },
    { name: 'BEA', revenue: 42800, assets: 1028, deposits: 786 },
    { name: 'ZA Bank', revenue: 1850, assets: 42, deposits: 31 },
    { name: 'Mox', revenue: 920, assets: 28, deposits: 19 },
    { name: 'Airstar', revenue: 680, assets: 18, deposits: 12 },
  ],
};

export const DEMO_FINANCIAL_TREND: ChartSpec = {
  type: 'line',
  title: 'Nova Horizon Bank — Financial Trend (FY2020–2025)',
  xKey: 'year',
  unit: '%',
  series: [
    { dataKey: 'profitMargin', label: 'Profit Margin', color: '#ef4444' },
    { dataKey: 'returnOnEquity', label: 'ROE', color: '#3b82f6' },
    { dataKey: 'returnOnAssets', label: 'ROA', color: '#10b981' },
    { dataKey: 'costToIncomeRatio', label: 'Cost/Income', color: '#f59e0b' },
  ],
  data: [
    { name: '2020', year: '2020', profitMargin: -12.4, returnOnEquity: -8.2, returnOnAssets: -1.8, costToIncomeRatio: 112 },
    { name: '2021', year: '2021', profitMargin: -5.1, returnOnEquity: -3.6, returnOnAssets: -0.9, costToIncomeRatio: 98 },
    { name: '2022', year: '2022', profitMargin: 2.3, returnOnEquity: 1.8, returnOnAssets: 0.3, costToIncomeRatio: 86 },
    { name: '2023', year: '2023', profitMargin: 8.7, returnOnEquity: 6.4, returnOnAssets: 1.1, costToIncomeRatio: 72 },
    { name: '2024', year: '2024', profitMargin: 14.2, returnOnEquity: 10.8, returnOnAssets: 2.0, costToIncomeRatio: 64 },
    { name: '2025', year: '2025', profitMargin: 18.6, returnOnEquity: 13.5, returnOnAssets: 2.6, costToIncomeRatio: 58 },
  ],
};

export const DEMO_BANK_HEALTH_RADAR: ChartSpec = {
  type: 'radar',
  title: 'Bank Health Profile — Nova Horizon vs Peer Avg',
  series: [
    { dataKey: 'bank', label: 'Nova Horizon', color: '#ef4444' },
    { dataKey: 'peerAvg', label: 'Peer Average', color: '#94a3b8' },
  ],
  data: [
    { name: 'Profit Margin', bank: 78, peerAvg: 65 },
    { name: 'ROE', bank: 72, peerAvg: 58 },
    { name: 'Asset Quality', bank: 85, peerAvg: 70 },
    { name: 'Capital Adequacy', bank: 90, peerAvg: 82 },
    { name: 'Liquidity', bank: 68, peerAvg: 75 },
    { name: 'Cost Efficiency', bank: 82, peerAvg: 60 },
  ],
};

export const DEMO_PRODUCT_DISTRIBUTION: ChartSpec = {
  type: 'donut',
  title: 'Product Portfolio — By Type',
  yKey: 'count',
  innerLabel: '24 Products',
  colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
  data: [
    { name: 'Deposit', count: 8 },
    { name: 'Card', count: 6 },
    { name: 'Loan', count: 5 },
    { name: 'Account', count: 3 },
    { name: 'Insurance', count: 2 },
  ],
};

export const DEMO_FUNDING_AREA: ChartSpec = {
  type: 'area',
  title: 'Cumulative Funding — Nova Horizon Bank (USD M)',
  xKey: 'round',
  yKey: 'cumulative',
  color: '#ef4444',
  unit: 'M',
  data: [
    { name: 'Seed', round: 'Seed', raised: 5, cumulative: 5 },
    { name: 'Series A', round: 'Series A', raised: 25, cumulative: 30 },
    { name: 'Series B', round: 'Series B', raised: 80, cumulative: 110 },
    { name: 'Series C', round: 'Series C', raised: 160, cumulative: 270 },
    { name: 'Series D', round: 'Series D', raised: 220, cumulative: 490 },
  ],
};

export const ALL_DEMO_CHARTS: ChartSpec[] = [
  DEMO_BANK_COMPARISON,
  DEMO_FINANCIAL_TREND,
  DEMO_BANK_HEALTH_RADAR,
  DEMO_PRODUCT_DISTRIBUTION,
  DEMO_FUNDING_AREA,
];
