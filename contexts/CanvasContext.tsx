'use client';

import React, { createContext, useCallback, useReducer, type ReactNode } from 'react';
import type {
  CanvasState,
  CanvasAction,
  CanvasContextValue,
  WidgetInstance,
  Toast,
} from '@/components/assistant/types';

export const initialCanvasState: CanvasState = {
  chatCollapsed: false,
  canvasCollapsed: false,
  activeWidgets: [],
  widgetPriorityQueue: [],
  sessionSidebarExpanded: false,
  canvasLayout: 'grid',
  configPanelWidgetId: null,
  maximizedWidgetId: null,
  toasts: [],
  canvasBadgeCount: 0,
  aiUnavailable: false,
};

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'TOGGLE_CHAT_PANEL': {
      const willCollapse = !state.chatCollapsed;
      if (willCollapse && state.canvasCollapsed) {
        return { ...state, chatCollapsed: true, canvasCollapsed: false };
      }
      return { ...state, chatCollapsed: willCollapse };
    }

    case 'SET_CHAT_PANEL':
      if (action.collapsed && state.canvasCollapsed) {
        return { ...state, chatCollapsed: true, canvasCollapsed: false };
      }
      return { ...state, chatCollapsed: action.collapsed };

    case 'TOGGLE_CANVAS_PANEL': {
      const willCollapse = !state.canvasCollapsed;
      if (willCollapse && state.chatCollapsed) {
        return { ...state, canvasCollapsed: true, chatCollapsed: false };
      }
      return { ...state, canvasCollapsed: willCollapse };
    }

    case 'SET_CANVAS_PANEL':
      if (action.collapsed && state.chatCollapsed) {
        return { ...state, canvasCollapsed: true, chatCollapsed: false };
      }
      return { ...state, canvasCollapsed: action.collapsed };

    case 'ADD_WIDGET': {
      const exists = state.activeWidgets.some((w) => w.id === action.widget.id);
      if (exists) return state;
      return { ...state, activeWidgets: [...state.activeWidgets, action.widget] };
    }

    case 'REMOVE_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.filter((w) => w.id !== action.widgetId),
        configPanelWidgetId:
          state.configPanelWidgetId === action.widgetId ? null : state.configPanelWidgetId,
        maximizedWidgetId:
          state.maximizedWidgetId === action.widgetId ? null : state.maximizedWidgetId,
      };

    case 'PIN_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.map((w) =>
          w.id === action.widgetId ? { ...w, pinned: true } : w,
        ),
      };

    case 'UNPIN_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.map((w) =>
          w.id === action.widgetId ? { ...w, pinned: false } : w,
        ),
      };

    case 'SET_ACTIVE_WIDGETS':
      return { ...state, activeWidgets: action.widgets };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sessionSidebarExpanded: !state.sessionSidebarExpanded };

    case 'SET_SIDEBAR':
      return { ...state, sessionSidebarExpanded: action.expanded };

    case 'SET_CANVAS_LAYOUT':
      return { ...state, canvasLayout: action.layout };

    case 'RESET_CANVAS':
      return { ...state, activeWidgets: [], configPanelWidgetId: null };

    case 'OPEN_CONFIG_PANEL':
      return { ...state, configPanelWidgetId: action.widgetId };

    case 'CLOSE_CONFIG_PANEL':
      return { ...state, configPanelWidgetId: null };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };

    case 'SET_CANVAS_BADGE':
      return { ...state, canvasBadgeCount: action.count };

    case 'UPDATE_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.map((w) =>
          w.id === action.widgetId ? { ...w, ...action.updates } : w,
        ),
      };

    case 'SET_AI_UNAVAILABLE':
      return { ...state, aiUnavailable: action.unavailable };

    case 'MAXIMIZE_WIDGET':
      return { ...state, maximizedWidgetId: action.widgetId };

    case 'RESTORE_WIDGET':
      return { ...state, maximizedWidgetId: null };

    default:
      return state;
  }
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);

  const toggleChatPanel = useCallback(
    () => dispatch({ type: 'TOGGLE_CHAT_PANEL' }),
    [],
  );

  const toggleCanvasPanel = useCallback(
    () => dispatch({ type: 'TOGGLE_CANVAS_PANEL' }),
    [],
  );

  const toggleSidebar = useCallback(
    () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    [],
  );

  const addWidget = useCallback(
    (widget: WidgetInstance) => dispatch({ type: 'ADD_WIDGET', widget }),
    [],
  );

  const removeWidget = useCallback(
    (widgetId: string) => dispatch({ type: 'REMOVE_WIDGET', widgetId }),
    [],
  );

  const pinWidget = useCallback(
    (widgetId: string) => dispatch({ type: 'PIN_WIDGET', widgetId }),
    [],
  );

  const unpinWidget = useCallback(
    (widgetId: string) => dispatch({ type: 'UNPIN_WIDGET', widgetId }),
    [],
  );

  const showToast = useCallback(
    (message: string, undoAction?: () => void) => {
      const toast: Toast = {
        id: `toast-${Date.now()}`,
        message,
        undoAction,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_TOAST', toast });
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: toast.id });
      }, 4000);
    },
    [],
  );

  const resetCanvas = useCallback(
    () => dispatch({ type: 'RESET_CANVAS' }),
    [],
  );

  return (
    <CanvasContext.Provider
      value={{
        state,
        dispatch,
        toggleChatPanel,
        toggleCanvasPanel,
        toggleSidebar,
        addWidget,
        removeWidget,
        pinWidget,
        unpinWidget,
        showToast,
        resetCanvas,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
