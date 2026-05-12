import { describe, it, expect } from 'vitest';

const { canvasReducer, initialCanvasState } = await import('@/contexts/CanvasContext');

describe('canvasReducer', () => {
  it('toggles chat panel', () => {
    const state = canvasReducer(initialCanvasState, { type: 'TOGGLE_CHAT_PANEL' });
    expect(state.chatCollapsed).toBe(true);
    const state2 = canvasReducer(state, { type: 'TOGGLE_CHAT_PANEL' });
    expect(state2.chatCollapsed).toBe(false);
  });

  it('sets chat panel collapsed state', () => {
    const state = canvasReducer(initialCanvasState, { type: 'SET_CHAT_PANEL', collapsed: true });
    expect(state.chatCollapsed).toBe(true);
  });

  it('toggles canvas panel', () => {
    const state = canvasReducer(initialCanvasState, { type: 'TOGGLE_CANVAS_PANEL' });
    expect(state.canvasCollapsed).toBe(true);
  });

  it('sets canvas panel collapsed state', () => {
    const state = canvasReducer(initialCanvasState, { type: 'SET_CANVAS_PANEL', collapsed: true });
    expect(state.canvasCollapsed).toBe(true);
  });

  it('toggles sidebar', () => {
    const state1 = canvasReducer(initialCanvasState, { type: 'TOGGLE_SIDEBAR' });
    expect(state1.sessionSidebarExpanded).toBe(true);
    const state2 = canvasReducer(state1, { type: 'TOGGLE_SIDEBAR' });
    expect(state2.sessionSidebarExpanded).toBe(false);
  });

  it('adds a widget', () => {
    const widget = {
      id: 'w1',
      type: 'placeholder' as const,
      title: 'Test',
      props: {},
      pinned: false,
      priority: 'default' as const,
    };
    const state = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    expect(state.activeWidgets).toHaveLength(1);
    expect(state.activeWidgets[0].id).toBe('w1');
  });

  it('removes a widget', () => {
    const widget = {
      id: 'w1',
      type: 'placeholder' as const,
      title: 'Test',
      props: {},
      pinned: false,
      priority: 'default' as const,
    };
    const withWidget = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    const state = canvasReducer(withWidget, { type: 'REMOVE_WIDGET', widgetId: 'w1' });
    expect(state.activeWidgets).toHaveLength(0);
  });

  it('pins a widget', () => {
    const widget = {
      id: 'w1',
      type: 'placeholder' as const,
      title: 'Test',
      props: {},
      pinned: false,
      priority: 'default' as const,
    };
    const withWidget = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    const state = canvasReducer(withWidget, { type: 'PIN_WIDGET', widgetId: 'w1' });
    expect(state.activeWidgets[0].pinned).toBe(true);
  });

  it('unpins a widget', () => {
    const widget = {
      id: 'w1',
      type: 'placeholder' as const,
      title: 'Test',
      props: {},
      pinned: true,
      priority: 'default' as const,
    };
    const withWidget = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    const state = canvasReducer(withWidget, { type: 'UNPIN_WIDGET', widgetId: 'w1' });
    expect(state.activeWidgets[0].pinned).toBe(false);
  });

  it('sets canvas layout', () => {
    const state = canvasReducer(initialCanvasState, { type: 'SET_CANVAS_LAYOUT', layout: 'list' });
    expect(state.canvasLayout).toBe('list');
  });

  it('resets canvas', () => {
    const widget = {
      id: 'w1',
      type: 'placeholder' as const,
      title: 'Test',
      props: {},
      pinned: false,
      priority: 'default' as const,
    };
    const withWidget = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    const state = canvasReducer(withWidget, { type: 'RESET_CANVAS' });
    expect(state.activeWidgets).toHaveLength(0);
    expect(state.configPanelWidgetId).toBeNull();
  });

  it('opens and closes config panel', () => {
    const state1 = canvasReducer(initialCanvasState, { type: 'OPEN_CONFIG_PANEL', widgetId: 'w1' });
    expect(state1.configPanelWidgetId).toBe('w1');
    const state2 = canvasReducer(state1, { type: 'CLOSE_CONFIG_PANEL' });
    expect(state2.configPanelWidgetId).toBeNull();
  });

  it('adds and removes toasts', () => {
    const toast = { id: 't1', message: 'Test toast', timestamp: Date.now() };
    const state1 = canvasReducer(initialCanvasState, { type: 'ADD_TOAST', toast });
    expect(state1.toasts).toHaveLength(1);
    const state2 = canvasReducer(state1, { type: 'REMOVE_TOAST', toastId: 't1' });
    expect(state2.toasts).toHaveLength(0);
  });

  it('sets canvas badge count', () => {
    const state = canvasReducer(initialCanvasState, { type: 'SET_CANVAS_BADGE', count: 3 });
    expect(state.canvasBadgeCount).toBe(3);
  });

  it('updates widget properties', () => {
    const widget = {
      id: 'w1',
      type: 'bi-chart' as const,
      title: 'Test',
      props: { chartType: 'bar' },
      pinned: false,
      priority: 'default' as const,
    };
    const withWidget = canvasReducer(initialCanvasState, { type: 'ADD_WIDGET', widget });
    const state = canvasReducer(withWidget, {
      type: 'UPDATE_WIDGET',
      widgetId: 'w1',
      updates: { props: { chartType: 'line' } },
    });
    expect(state.activeWidgets[0].props.chartType).toBe('line');
  });

  it('sets AI unavailable state', () => {
    expect(initialCanvasState.aiUnavailable).toBe(false);
    const state = canvasReducer(initialCanvasState, { type: 'SET_AI_UNAVAILABLE', unavailable: true });
    expect(state.aiUnavailable).toBe(true);
    const state2 = canvasReducer(state, { type: 'SET_AI_UNAVAILABLE', unavailable: false });
    expect(state2.aiUnavailable).toBe(false);
  });
});
