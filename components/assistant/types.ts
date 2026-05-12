export type WidgetType =
  | 'bank-snapshot'
  | 'bi-chart'
  | 'comparison-table'
  | 'product-list'
  | 'news-feed'
  | 'management-list'
  | 'report-preview'
  | 'ai-suggestions'
  | 'watchlist'
  | 'proactive-insights'
  | 'leadership'
  | 'platform-embed'
  | 'fluent-about'
  | 'placeholder';

export type WidgetPriority = 'active' | 'contextual' | 'recent' | 'default';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  props: Record<string, any>;
  contextTrigger?: string;
  pinned: boolean;
  priority: WidgetPriority;
}

export type CanvasLayout = 'grid' | 'list';

export interface Toast {
  id: string;
  message: string;
  undoAction?: () => void;
  timestamp: number;
}

export interface CanvasState {
  chatCollapsed: boolean;
  canvasCollapsed: boolean;
  activeWidgets: WidgetInstance[];
  widgetPriorityQueue: string[];
  sessionSidebarExpanded: boolean;
  canvasLayout: CanvasLayout;
  configPanelWidgetId: string | null;
  maximizedWidgetId: string | null;
  toasts: Toast[];
  canvasBadgeCount: number;
  aiUnavailable: boolean;
}

export type CanvasAction =
  | { type: 'TOGGLE_CHAT_PANEL' }
  | { type: 'SET_CHAT_PANEL'; collapsed: boolean }
  | { type: 'TOGGLE_CANVAS_PANEL' }
  | { type: 'SET_CANVAS_PANEL'; collapsed: boolean }
  | { type: 'ADD_WIDGET'; widget: WidgetInstance }
  | { type: 'REMOVE_WIDGET'; widgetId: string }
  | { type: 'PIN_WIDGET'; widgetId: string }
  | { type: 'UNPIN_WIDGET'; widgetId: string }
  | { type: 'SET_ACTIVE_WIDGETS'; widgets: WidgetInstance[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; expanded: boolean }
  | { type: 'SET_CANVAS_LAYOUT'; layout: CanvasLayout }
  | { type: 'RESET_CANVAS' }
  | { type: 'OPEN_CONFIG_PANEL'; widgetId: string }
  | { type: 'CLOSE_CONFIG_PANEL' }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; toastId: string }
  | { type: 'SET_CANVAS_BADGE'; count: number }
  | { type: 'UPDATE_WIDGET'; widgetId: string; updates: Partial<WidgetInstance> }
  | { type: 'SET_AI_UNAVAILABLE'; unavailable: boolean }
  | { type: 'MAXIMIZE_WIDGET'; widgetId: string }
  | { type: 'RESTORE_WIDGET' };

export interface CanvasContextValue {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  toggleChatPanel: () => void;
  toggleCanvasPanel: () => void;
  toggleSidebar: () => void;
  addWidget: (widget: WidgetInstance) => void;
  removeWidget: (widgetId: string) => void;
  pinWidget: (widgetId: string) => void;
  unpinWidget: (widgetId: string) => void;
  showToast: (message: string, undoAction?: () => void) => void;
  resetCanvas: () => void;
}

export interface WidgetProps {
  instance: WidgetInstance;
  onInlineChat: (context: Record<string, any>) => void;
  onPin: () => void;
  onClose: () => void;
  onMaximize: () => void;
  onConfigure?: () => void;
  isActive: boolean;
}

export interface WidgetRegistryEntry {
  type: WidgetType;
  component: React.ComponentType<WidgetProps>;
  defaultTitle: string;
  contextTriggers: string[];
  relatedTypes: WidgetType[];
}
