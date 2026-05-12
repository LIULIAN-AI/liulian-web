import type { WidgetType, WidgetRegistryEntry } from '../types';
import PlaceholderWidget from './PlaceholderWidget';
import BankSnapshotWidget from './BankSnapshotWidget';
import AISuggestionsWidget from './AISuggestionsWidget';
import BIChartWidget from './BIChartWidget';
import ComparisonTableWidget from './ComparisonTableWidget';
import ProductListWidget from './ProductListWidget';
import WatchlistWidget from './WatchlistWidget';
import ProactiveInsightsWidget from './ProactiveInsightsWidget';
import LeadershipWidget from './LeadershipWidget';
import PlatformEmbedWidget from './PlatformEmbedWidget';
import FluentAboutWidget from './FluentAboutWidget';

const REGISTRY: Record<WidgetType, WidgetRegistryEntry> = {
  'bank-snapshot': {
    type: 'bank-snapshot',
    component: BankSnapshotWidget,
    defaultTitle: 'Bank Overview',
    contextTriggers: [],
    relatedTypes: ['product-list', 'bi-chart', 'leadership', 'fluent-about'],
  },
  'bi-chart': {
    type: 'bi-chart',
    component: BIChartWidget,
    defaultTitle: 'Analytics',
    contextTriggers: ['compare', 'rank', 'chart'],
    relatedTypes: ['comparison-table', 'bank-snapshot'],
  },
  'comparison-table': {
    type: 'comparison-table',
    component: ComparisonTableWidget,
    defaultTitle: 'Peer Comparison',
    contextTriggers: ['compare', 'versus', 'vs'],
    relatedTypes: ['bi-chart', 'bank-snapshot'],
  },
  'product-list': {
    type: 'product-list',
    component: ProductListWidget,
    defaultTitle: 'Products',
    contextTriggers: ['product', 'products'],
    relatedTypes: ['bank-snapshot'],
  },
  'news-feed': {
    type: 'news-feed',
    component: PlaceholderWidget,
    defaultTitle: 'News Feed',
    contextTriggers: ['news', 'update'],
    relatedTypes: ['bank-snapshot'],
  },
  'management-list': {
    type: 'management-list',
    component: LeadershipWidget,
    defaultTitle: 'Management',
    contextTriggers: ['management', 'director', 'ceo'],
    relatedTypes: ['bank-snapshot'],
  },
  'report-preview': {
    type: 'report-preview',
    component: PlaceholderWidget,
    defaultTitle: 'Report Preview',
    contextTriggers: ['report'],
    relatedTypes: [],
  },
  'ai-suggestions': {
    type: 'ai-suggestions',
    component: AISuggestionsWidget,
    defaultTitle: 'Recommended',
    contextTriggers: [],
    relatedTypes: [],
  },
  'watchlist': {
    type: 'watchlist',
    component: WatchlistWidget,
    defaultTitle: 'Watchlist',
    contextTriggers: ['watch', 'monitor', 'alert'],
    relatedTypes: ['bi-chart', 'bank-snapshot'],
  },
  'proactive-insights': {
    type: 'proactive-insights',
    component: ProactiveInsightsWidget,
    defaultTitle: 'Insights',
    contextTriggers: ['insight', 'anomaly', 'alert', 'risk'],
    relatedTypes: ['bi-chart', 'watchlist'],
  },
  'leadership': {
    type: 'leadership',
    component: LeadershipWidget,
    defaultTitle: 'Leadership',
    contextTriggers: ['management', 'director', 'ceo', 'leadership', 'team'],
    relatedTypes: ['bank-snapshot'],
  },
  'platform-embed': {
    type: 'platform-embed',
    component: PlatformEmbedWidget,
    defaultTitle: 'Platform Components',
    contextTriggers: ['platform', 'bank-info', 'overview', 'embed'],
    relatedTypes: ['bank-snapshot', 'product-list', 'comparison-table'],
  },
  'fluent-about': {
    type: 'fluent-about',
    component: FluentAboutWidget,
    defaultTitle: 'Bank About',
    contextTriggers: ['about', 'establishment', 'founder', 'owner'],
    relatedTypes: ['bank-snapshot', 'leadership', 'platform-embed'],
  },
  placeholder: {
    type: 'placeholder',
    component: PlaceholderWidget,
    defaultTitle: 'Widget',
    contextTriggers: [],
    relatedTypes: [],
  },
};

export function getWidgetEntry(type: WidgetType): WidgetRegistryEntry {
  return REGISTRY[type] ?? REGISTRY.placeholder;
}

export function getAllWidgetTypes(): WidgetType[] {
  return Object.keys(REGISTRY) as WidgetType[];
}

export default REGISTRY;
