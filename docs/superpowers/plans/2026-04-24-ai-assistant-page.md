# M3.1 AI Assistant Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-page AI Assistant workspace at `/assistant` with a dynamic canvas that reacts to chat context, inline chat (VS Code style), and BI chart generation.

**Architecture:** Three-layer system — Layout Shell manages work modes (Workspace/Immersive/Canvas Focus), Chat Engine provides three unified chat entry points sharing one ChatContext, and Dynamic Canvas uses react-mosaic tiling with a Widget Registry to auto-arrange data panels based on conversation context.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, react-mosaic-component, Recharts (already installed), Framer Motion (already installed), Antd (already installed), next-intl (already installed), Clerk auth (already installed), CSS Modules

**Spec:** `docs/superpowers/specs/2026-04-24-ai-assistant-page-design.md`

---

## File Map

### New files (Phase 1A)

| File | Responsibility |
|------|----------------|
| `components/assistant/types.ts` | All assistant-specific TypeScript types (WidgetInstance, WidgetType, CanvasState, etc.) |
| `contexts/CanvasContext.tsx` | React Context + useReducer for Canvas state (mode, activeWidgets, layout, sidebar) |
| `components/assistant/hooks/useCanvasContext.ts` | Typed hook to consume CanvasContext |
| `components/assistant/SessionSidebar.tsx` | Collapsed icon bar + expandable session list overlay |
| `components/assistant/DynamicCanvas.tsx` | react-mosaic container that renders WidgetShell tiles |
| `components/assistant/CanvasToolbar.tsx` | Toolbar above canvas: widget type tabs + mode/layout controls |
| `components/assistant/widgets/WidgetShell.tsx` | Standard tile wrapper: title bar, inline-chat/maximize/close buttons |
| `components/assistant/widgets/PlaceholderWidget.tsx` | Temporary widget showing "coming soon" content |
| `components/assistant/widgets/registry.ts` | Maps WidgetType → component + metadata |
| `components/assistant/assistant.module.css` | CSS Module for all assistant-specific styles |
| `app/(default)/assistant/layout.tsx` | Assistant route layout — hides NavBar footer, mounts Canvas provider |
| `app/(default)/assistant/page.tsx` | Main assistant page wiring everything together |

### New files (Phase 1B)

| File | Responsibility |
|------|----------------|
| `components/assistant/widgets/BankSnapshotWidget.tsx` | Bank profile snapshot card widget |
| `components/assistant/widgets/AISuggestionsWidget.tsx` | AI-generated next-step suggestion list |
| `components/assistant/CanvasOrchestrator.tsx` | Watches ChatContext messages, triggers widget insertions |
| `components/assistant/hooks/useKeyboardShortcuts.ts` | Central keyboard shortcut registry (mode switches, inline chat) |

### New files (Phase 1C)

| File | Responsibility |
|------|----------------|
| `components/chat/InlineChat.tsx` | VS Code-style popup chat on Canvas widgets |
| `components/chat/InlineBIWidget.tsx` | Inline interactive chart embedded in chat messages |
| `components/assistant/widgets/BIChartWidget.tsx` | Recharts-based chart tile on Canvas |
| `components/assistant/widgets/ComparisonTableWidget.tsx` | Side-by-side bank comparison table |

### Modified files

| File | Change |
|------|--------|
| `components/ui/NavBar.tsx:64-85` | Add "AI Assistant" entry to `navBarLeftItems` |
| `messages/en.json` | Add `Assistant.*` and `Navigation.assistant` keys |
| `messages/zh-CN.json` | Add `Assistant.*` and `Navigation.assistant` keys |
| `messages/zh-HK.json` | Add `Assistant.*` and `Navigation.assistant` keys |
| `package.json` | Add `react-mosaic-component` dependency |
| `components/chat/ChatPanel.tsx` | Add optional `standalone` prop to skip ChatBubble-dependent behavior |

---

## Phase 1A: Skeleton + Chat Migration

### Task 1: Install react-mosaic and create directory structure

**Files:**
- Modify: `package.json`
- Create: `components/assistant/types.ts`

- [ ] **Step 1: Install react-mosaic-component**

```bash
npm install react-mosaic-component --legacy-peer-deps
```

Expected: package.json updated, node_modules populated, no errors.

- [ ] **Step 2: Create the assistant directory structure**

```bash
mkdir -p components/assistant/widgets
mkdir -p components/assistant/hooks
```

- [ ] **Step 3: Create assistant types**

Create `components/assistant/types.ts`:

```typescript
import type { MosaicNode } from 'react-mosaic-component';

export type WidgetType =
  | 'bank-snapshot'
  | 'bi-chart'
  | 'comparison-table'
  | 'product-list'
  | 'news-feed'
  | 'management-list'
  | 'report-preview'
  | 'ai-suggestions'
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

export type AssistantMode = 'workspace' | 'immersive' | 'canvas-focus';

export interface CanvasState {
  mode: AssistantMode;
  activeWidgets: WidgetInstance[];
  layout: MosaicNode<string> | null;
  widgetPriorityQueue: string[];
  sessionSidebarExpanded: boolean;
}

export type CanvasAction =
  | { type: 'SET_MODE'; mode: AssistantMode }
  | { type: 'SET_LAYOUT'; layout: MosaicNode<string> | null }
  | { type: 'ADD_WIDGET'; widget: WidgetInstance }
  | { type: 'REMOVE_WIDGET'; widgetId: string }
  | { type: 'PIN_WIDGET'; widgetId: string }
  | { type: 'UNPIN_WIDGET'; widgetId: string }
  | { type: 'SET_ACTIVE_WIDGETS'; widgets: WidgetInstance[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; expanded: boolean };

export interface CanvasContextValue {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  setMode: (mode: AssistantMode) => void;
  toggleSidebar: () => void;
  addWidget: (widget: WidgetInstance) => void;
  removeWidget: (widgetId: string) => void;
  pinWidget: (widgetId: string) => void;
  unpinWidget: (widgetId: string) => void;
}

export interface WidgetProps {
  instance: WidgetInstance;
  onInlineChat: (context: Record<string, any>) => void;
  onPin: () => void;
  onClose: () => void;
  onMaximize: () => void;
  isActive: boolean;
}

export interface WidgetRegistryEntry {
  type: WidgetType;
  component: React.ComponentType<WidgetProps>;
  defaultTitle: string;
  contextTriggers: string[];
  relatedTypes: WidgetType[];
}
```

- [ ] **Step 4: Run lint to verify types compile**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to the new types file.

- [ ] **Step 5: Commit**

```bash
git add components/assistant/types.ts package.json package-lock.json
git commit -m "feat(assistant): install react-mosaic + define assistant types"
```

---

### Task 2: Create CanvasContext

**Files:**
- Create: `contexts/CanvasContext.tsx`
- Create: `components/assistant/hooks/useCanvasContext.ts`

- [ ] **Step 1: Write the test for CanvasContext reducer**

Create `__tests__/CanvasContext.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

// We test the reducer directly since it's a pure function
// Import will work after we export it from the context file
const { canvasReducer, initialCanvasState } = await import('@/contexts/CanvasContext');

describe('canvasReducer', () => {
  it('sets mode', () => {
    const state = canvasReducer(initialCanvasState, { type: 'SET_MODE', mode: 'immersive' });
    expect(state.mode).toBe('immersive');
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

  it('sets layout', () => {
    const layout = { direction: 'row' as const, first: 'a', second: 'b', splitPercentage: 50 };
    const state = canvasReducer(initialCanvasState, { type: 'SET_LAYOUT', layout });
    expect(state.layout).toEqual(layout);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/CanvasContext.test.ts 2>&1 | tail -10
```

Expected: FAIL — cannot find module `@/contexts/CanvasContext`.

- [ ] **Step 3: Implement CanvasContext**

Create `contexts/CanvasContext.tsx`:

```typescript
'use client';

import React, { createContext, useCallback, useReducer, type ReactNode } from 'react';
import type {
  CanvasState,
  CanvasAction,
  CanvasContextValue,
  AssistantMode,
  WidgetInstance,
} from '@/components/assistant/types';

export const initialCanvasState: CanvasState = {
  mode: 'workspace',
  activeWidgets: [],
  layout: null,
  widgetPriorityQueue: [],
  sessionSidebarExpanded: false,
};

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_LAYOUT':
      return { ...state, layout: action.layout };

    case 'ADD_WIDGET': {
      const exists = state.activeWidgets.some((w) => w.id === action.widget.id);
      if (exists) return state;
      return { ...state, activeWidgets: [...state.activeWidgets, action.widget] };
    }

    case 'REMOVE_WIDGET':
      return {
        ...state,
        activeWidgets: state.activeWidgets.filter((w) => w.id !== action.widgetId),
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

    default:
      return state;
  }
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);

  const setMode = useCallback(
    (mode: AssistantMode) => dispatch({ type: 'SET_MODE', mode }),
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

  return (
    <CanvasContext.Provider
      value={{
        state,
        dispatch,
        setMode,
        toggleSidebar,
        addWidget,
        removeWidget,
        pinWidget,
        unpinWidget,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
```

- [ ] **Step 4: Create the useCanvasContext hook**

Create `components/assistant/hooks/useCanvasContext.ts`:

```typescript
'use client';

import { useContext } from 'react';
import { CanvasContext } from '@/contexts/CanvasContext';
import type { CanvasContextValue } from '@/components/assistant/types';

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return ctx;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run __tests__/CanvasContext.test.ts 2>&1 | tail -10
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add contexts/CanvasContext.tsx components/assistant/hooks/useCanvasContext.ts __tests__/CanvasContext.test.ts
git commit -m "feat(assistant): add CanvasContext with reducer + useCanvasContext hook"
```

---

### Task 3: Create Widget Shell + Registry + Placeholder

**Files:**
- Create: `components/assistant/widgets/WidgetShell.tsx`
- Create: `components/assistant/widgets/PlaceholderWidget.tsx`
- Create: `components/assistant/widgets/registry.ts`
- Create: `components/assistant/assistant.module.css`

- [ ] **Step 1: Create CSS Module for assistant components**

Create `components/assistant/assistant.module.css`:

```css
/* === Layout Shell === */
.assistantRoot {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary, #f5f5f7);
}

.iconBar {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  background: var(--bg-secondary, #ffffff);
  border-right: 1px solid var(--border, #e5e5e5);
}

.iconBarButton {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary, #666);
  transition: background 0.15s, color 0.15s;
}

.iconBarButton:hover {
  background: var(--bg-tertiary, #f0f0f0);
  color: var(--text-primary, #1d1d1f);
}

.iconBarButtonActive {
  background: var(--accent, #0071e3);
  color: white;
}

.iconBarButtonActive:hover {
  background: var(--accent-hover, #0077ed);
  color: white;
}

.iconBarSpacer {
  flex: 1;
}

.iconBarDivider {
  width: 24px;
  height: 1px;
  background: var(--border, #e5e5e5);
}

/* === Chat Panel Column === */
.chatColumn {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border, #e5e5e5);
  overflow: hidden;
}

@media (max-width: 1279px) {
  .chatColumn {
    width: 360px;
  }
}

@media (max-width: 1023px) {
  .chatColumn {
    width: 100%;
  }
}

/* === Canvas Area === */
.canvasArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* === Canvas Toolbar === */
.canvasToolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-secondary, #ffffff);
  border-bottom: 1px solid var(--border, #e5e5e5);
  flex-shrink: 0;
  font-size: 12px;
}

.canvasToolbarTitle {
  font-weight: 600;
  font-size: 13px;
}

.canvasToolbarDivider {
  width: 1px;
  height: 16px;
  background: var(--border, #e5e5e5);
}

.canvasToolbarTab {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border, #e5e5e5);
  background: var(--bg-primary, #f5f5f7);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.canvasToolbarTab:hover {
  border-color: var(--accent, #0071e3);
}

.canvasToolbarTabActive {
  background: var(--accent, #0071e3);
  color: white;
  border-color: var(--accent, #0071e3);
}

/* === Widget Shell === */
.widgetShell {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary, #ffffff);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border, #e5e5e5);
}

.widgetHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #e5e5e5);
  flex-shrink: 0;
}

.widgetHeaderTitle {
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.widgetHeaderActions {
  display: flex;
  gap: 4px;
}

.widgetHeaderAction {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary, #666);
  transition: background 0.15s;
}

.widgetHeaderAction:hover {
  background: var(--bg-tertiary, #f0f0f0);
}

.widgetBody {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.widgetAccentBar {
  height: 3px;
  flex-shrink: 0;
}

/* === Placeholder Widget === */
.placeholderContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text-secondary, #666);
}

.placeholderIcon {
  font-size: 32px;
  opacity: 0.4;
}

.placeholderLabel {
  font-size: 12px;
}

/* === Session Sidebar Overlay === */
.sidebarOverlay {
  position: absolute;
  top: 0;
  left: 48px;
  width: 260px;
  height: 100%;
  background: var(--bg-secondary, #ffffff);
  border-right: 1px solid var(--border, #e5e5e5);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.sidebarTitle {
  font-weight: 600;
  font-size: 14px;
}

.sidebarList {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sidebarItem {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  border: 1px solid transparent;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.sidebarItem:hover {
  background: var(--bg-tertiary, #f0f0f0);
}

.sidebarItemActive {
  background: var(--accent, #0071e3);
  color: white;
}

.sidebarItemTitle {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebarItemMeta {
  font-size: 10px;
  color: var(--text-secondary, #666);
  margin-top: 2px;
}

.sidebarItemActive .sidebarItemMeta {
  color: rgba(255, 255, 255, 0.7);
}
```

- [ ] **Step 2: Create WidgetShell**

Create `components/assistant/widgets/WidgetShell.tsx`:

```typescript
'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Tooltip } from 'antd';
import styles from '../assistant.module.css';

interface WidgetShellProps {
  title: string;
  accentColor?: string;
  onInlineChat?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  children: ReactNode;
}

export default function WidgetShell({
  title,
  accentColor,
  onInlineChat,
  onMaximize,
  onClose,
  children,
}: WidgetShellProps) {
  const t = useTranslations('Assistant');

  return (
    <div className={styles.widgetShell}>
      {accentColor && (
        <div className={styles.widgetAccentBar} style={{ background: accentColor }} />
      )}
      <div className={styles.widgetHeader}>
        <div className={styles.widgetHeaderTitle}>{title}</div>
        <div className={styles.widgetHeaderActions}>
          {onInlineChat && (
            <Tooltip title={t('widget.inlineChat')}>
              <button
                className={styles.widgetHeaderAction}
                onClick={onInlineChat}
                aria-label={t('widget.inlineChat')}
              >
                💬
              </button>
            </Tooltip>
          )}
          {onMaximize && (
            <Tooltip title={t('widget.maximize')}>
              <button
                className={styles.widgetHeaderAction}
                onClick={onMaximize}
                aria-label={t('widget.maximize')}
              >
                ⬜
              </button>
            </Tooltip>
          )}
          {onClose && (
            <Tooltip title={t('widget.close')}>
              <button
                className={styles.widgetHeaderAction}
                onClick={onClose}
                aria-label={t('widget.close')}
              >
                ✕
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className={styles.widgetBody}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create PlaceholderWidget**

Create `components/assistant/widgets/PlaceholderWidget.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

const ICONS: Record<string, string> = {
  'bank-snapshot': '🏦',
  'bi-chart': '📊',
  'comparison-table': '⚖️',
  'product-list': '🏷️',
  'news-feed': '📰',
  'ai-suggestions': '💡',
  'report-preview': '📄',
  placeholder: '🧩',
};

export default function PlaceholderWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
}: WidgetProps) {
  const t = useTranslations('Assistant');

  return (
    <WidgetShell
      title={instance.title}
      accentColor="var(--border)"
      onInlineChat={() => onInlineChat(instance.props)}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.placeholderContent}>
        <div className={styles.placeholderIcon}>{ICONS[instance.type] ?? '🧩'}</div>
        <div className={styles.placeholderLabel}>
          {t('widget.comingSoon', { type: instance.type })}
        </div>
      </div>
    </WidgetShell>
  );
}
```

- [ ] **Step 4: Create Widget Registry**

Create `components/assistant/widgets/registry.ts`:

```typescript
import type { WidgetType, WidgetRegistryEntry } from '../types';
import PlaceholderWidget from './PlaceholderWidget';

const REGISTRY: Record<WidgetType, WidgetRegistryEntry> = {
  'bank-snapshot': {
    type: 'bank-snapshot',
    component: PlaceholderWidget,
    defaultTitle: '🏦 Bank Snapshot',
    contextTriggers: [],
    relatedTypes: ['product-list', 'bi-chart'],
  },
  'bi-chart': {
    type: 'bi-chart',
    component: PlaceholderWidget,
    defaultTitle: '📊 BI Chart',
    contextTriggers: ['compare', 'rank', 'chart'],
    relatedTypes: ['comparison-table', 'bank-snapshot'],
  },
  'comparison-table': {
    type: 'comparison-table',
    component: PlaceholderWidget,
    defaultTitle: '⚖️ Comparison',
    contextTriggers: ['compare', 'versus', 'vs'],
    relatedTypes: ['bi-chart', 'bank-snapshot'],
  },
  'product-list': {
    type: 'product-list',
    component: PlaceholderWidget,
    defaultTitle: '🏷️ Products',
    contextTriggers: ['product', 'products'],
    relatedTypes: ['bank-snapshot'],
  },
  'news-feed': {
    type: 'news-feed',
    component: PlaceholderWidget,
    defaultTitle: '📰 News',
    contextTriggers: ['news', 'update'],
    relatedTypes: ['bank-snapshot'],
  },
  'management-list': {
    type: 'management-list',
    component: PlaceholderWidget,
    defaultTitle: '👥 Management',
    contextTriggers: ['management', 'director', 'ceo'],
    relatedTypes: ['bank-snapshot'],
  },
  'report-preview': {
    type: 'report-preview',
    component: PlaceholderWidget,
    defaultTitle: '📄 Report',
    contextTriggers: ['report'],
    relatedTypes: [],
  },
  'ai-suggestions': {
    type: 'ai-suggestions',
    component: PlaceholderWidget,
    defaultTitle: '💡 Suggestions',
    contextTriggers: [],
    relatedTypes: [],
  },
  placeholder: {
    type: 'placeholder',
    component: PlaceholderWidget,
    defaultTitle: '🧩 Widget',
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
```

- [ ] **Step 5: Commit**

```bash
git add components/assistant/
git commit -m "feat(assistant): add WidgetShell, PlaceholderWidget, registry, and CSS Module"
```

---

### Task 4: Create SessionSidebar

**Files:**
- Create: `components/assistant/SessionSidebar.tsx`

- [ ] **Step 1: Create SessionSidebar component**

Create `components/assistant/SessionSidebar.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import { useCanvasContext } from './hooks/useCanvasContext';
import styles from './assistant.module.css';

export default function SessionSidebar() {
  const t = useTranslations('Assistant');
  const { state: chatState, startNewChat, loadArchive } = useChatContext();
  const { state: canvasState, toggleSidebar } = useCanvasContext();

  return (
    <>
      {/* Collapsed Icon Bar — always visible */}
      <div className={styles.iconBar}>
        <button
          className={styles.iconBarButton}
          onClick={toggleSidebar}
          aria-label={t('sidebar.toggle')}
          title={t('sidebar.toggle')}
        >
          ☰
        </button>
        <button
          className={styles.iconBarButton}
          onClick={startNewChat}
          aria-label={t('sidebar.newChat')}
          title={t('sidebar.newChat')}
        >
          <PlusOutlined />
        </button>
        <button
          className={styles.iconBarButton}
          aria-label={t('sidebar.search')}
          title={t('sidebar.search')}
        >
          <SearchOutlined />
        </button>

        <div className={styles.iconBarDivider} />

        {/* Session number indicators */}
        <button
          className={`${styles.iconBarButton} ${styles.iconBarButtonActive}`}
          aria-label={t('sidebar.currentSession')}
          title={chatState.conversationTitle ?? t('sidebar.currentSession')}
        >
          1
        </button>
        {chatState.archives.slice(0, 3).map((archive, i) => (
          <button
            key={archive.conversationId}
            className={styles.iconBarButton}
            onClick={() => loadArchive(archive.conversationId)}
            aria-label={archive.title}
            title={archive.title}
          >
            {i + 2}
          </button>
        ))}

        <div className={styles.iconBarSpacer} />

        <button
          className={styles.iconBarButton}
          aria-label={t('sidebar.settings')}
          title={t('sidebar.settings')}
        >
          ⚙
        </button>
      </div>

      {/* Expanded Overlay — slides in from left */}
      <AnimatePresence>
        {canvasState.sessionSidebarExpanded && (
          <motion.div
            className={styles.sidebarOverlay}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>{t('sidebar.title')}</div>
              <button
                className={styles.widgetHeaderAction}
                onClick={toggleSidebar}
                aria-label={t('sidebar.close')}
              >
                <CloseOutlined />
              </button>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <button
                className={styles.iconBarButton}
                onClick={() => {
                  startNewChat();
                  toggleSidebar();
                }}
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: 12 }}
              >
                <PlusOutlined /> {t('sidebar.newChat')}
              </button>
            </div>

            <div className={styles.sidebarList}>
              {/* Current session */}
              <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                <div className={styles.sidebarItemTitle}>
                  {chatState.conversationTitle ?? t('sidebar.currentSession')}
                </div>
                <div className={styles.sidebarItemMeta}>
                  {t('sidebar.messageCount', { count: chatState.messages.length })}
                </div>
              </div>

              {/* Archived sessions */}
              {chatState.archives.map((archive) => (
                <div
                  key={archive.conversationId}
                  className={styles.sidebarItem}
                  onClick={() => {
                    loadArchive(archive.conversationId);
                    toggleSidebar();
                  }}
                >
                  <div className={styles.sidebarItemTitle}>
                    {archive.pinned ? '📌 ' : ''}{archive.title}
                  </div>
                  <div className={styles.sidebarItemMeta}>
                    {t('sidebar.messageCount', { count: archive.messages.length })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/assistant/SessionSidebar.tsx
git commit -m "feat(assistant): add SessionSidebar with icon bar + expandable overlay"
```

---

### Task 5: Create DynamicCanvas + CanvasToolbar

**Files:**
- Create: `components/assistant/DynamicCanvas.tsx`
- Create: `components/assistant/CanvasToolbar.tsx`

- [ ] **Step 1: Create CanvasToolbar**

Create `components/assistant/CanvasToolbar.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useCanvasContext } from './hooks/useCanvasContext';
import styles from './assistant.module.css';

export default function CanvasToolbar() {
  const t = useTranslations('Assistant');
  const { state, setMode } = useCanvasContext();

  return (
    <div className={styles.canvasToolbar}>
      <span className={styles.canvasToolbarTitle}>🧩 Canvas</span>
      <div className={styles.canvasToolbarDivider} />

      <button
        className={`${styles.canvasToolbarTab} ${
          state.mode === 'workspace' ? styles.canvasToolbarTabActive : ''
        }`}
        onClick={() => setMode('workspace')}
      >
        {t('toolbar.workspace')}
      </button>
      <button
        className={`${styles.canvasToolbarTab} ${
          state.mode === 'immersive' ? styles.canvasToolbarTabActive : ''
        }`}
        onClick={() => setMode('immersive')}
      >
        {t('toolbar.immersive')}
      </button>
      <button
        className={`${styles.canvasToolbarTab} ${
          state.mode === 'canvas-focus' ? styles.canvasToolbarTabActive : ''
        }`}
        onClick={() => setMode('canvas-focus')}
      >
        {t('toolbar.canvasFocus')}
      </button>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
        {t('toolbar.widgetCount', { count: state.activeWidgets.length })}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create DynamicCanvas**

Create `components/assistant/DynamicCanvas.tsx`:

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import { Mosaic, MosaicWindow, type MosaicNode } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getWidgetEntry } from './widgets/registry';
import type { WidgetInstance } from './types';
import CanvasToolbar from './CanvasToolbar';
import styles from './assistant.module.css';

function generateDefaultLayout(widgetIds: string[]): MosaicNode<string> | null {
  if (widgetIds.length === 0) return null;
  if (widgetIds.length === 1) return widgetIds[0];
  if (widgetIds.length === 2) {
    return { direction: 'row', first: widgetIds[0], second: widgetIds[1], splitPercentage: 50 };
  }
  if (widgetIds.length === 3) {
    return {
      direction: 'row',
      first: widgetIds[0],
      second: {
        direction: 'column',
        first: widgetIds[1],
        second: widgetIds[2],
        splitPercentage: 50,
      },
      splitPercentage: 50,
    };
  }
  // 4+ widgets: 2x2 grid
  return {
    direction: 'row',
    first: {
      direction: 'column',
      first: widgetIds[0],
      second: widgetIds[2] ?? widgetIds[0],
      splitPercentage: 50,
    },
    second: {
      direction: 'column',
      first: widgetIds[1],
      second: widgetIds[3] ?? widgetIds[1],
      splitPercentage: 50,
    },
    splitPercentage: 50,
  };
}

export default function DynamicCanvas() {
  const { state, dispatch } = useCanvasContext();

  const widgetMap = useMemo(() => {
    const map = new Map<string, WidgetInstance>();
    for (const w of state.activeWidgets) {
      map.set(w.id, w);
    }
    return map;
  }, [state.activeWidgets]);

  const layout = useMemo(() => {
    if (state.layout) return state.layout;
    return generateDefaultLayout(state.activeWidgets.map((w) => w.id));
  }, [state.layout, state.activeWidgets]);

  const handleLayoutChange = useCallback(
    (newLayout: MosaicNode<string> | null) => {
      dispatch({ type: 'SET_LAYOUT', layout: newLayout });
    },
    [dispatch],
  );

  const renderTile = useCallback(
    (id: string) => {
      const instance = widgetMap.get(id);
      if (!instance) return <div>Unknown widget</div>;

      const entry = getWidgetEntry(instance.type);
      const Component = entry.component;

      return (
        <Component
          instance={instance}
          onInlineChat={() => {
            /* Phase 1C: open InlineChat */
          }}
          onPin={() => dispatch({ type: 'PIN_WIDGET', widgetId: id })}
          onClose={() => dispatch({ type: 'REMOVE_WIDGET', widgetId: id })}
          onMaximize={() => {
            /* Phase 2A: maximize widget */
          }}
          isActive={false}
        />
      );
    },
    [widgetMap, dispatch],
  );

  if (state.activeWidgets.length === 0 || !layout) {
    return (
      <div className={styles.canvasArea}>
        <CanvasToolbar />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: 14,
          }}
        >
          Canvas is empty. Start chatting to populate widgets.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.canvasArea}>
      <CanvasToolbar />
      <div style={{ flex: 1, position: 'relative' }}>
        <Mosaic<string>
          renderTile={(id) => renderTile(id)}
          value={layout}
          onChange={handleLayoutChange}
          className="mosaic-blueprint-theme"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/assistant/DynamicCanvas.tsx components/assistant/CanvasToolbar.tsx
git commit -m "feat(assistant): add DynamicCanvas (react-mosaic) + CanvasToolbar"
```

---

### Task 6: Make ChatPanel work standalone

**Files:**
- Modify: `components/chat/ChatPanel.tsx`

Currently ChatPanel only renders when triggered by ChatBubble (which controls `panelState`). For the Assistant page, ChatPanel needs to render directly without depending on ChatBubble's toggle.

- [ ] **Step 1: Add `standalone` prop to ChatPanel**

In `components/chat/ChatPanel.tsx`, change the interface and the component opening:

Find `interface ChatPanelProps` (line 51):

```typescript
interface ChatPanelProps {
  persona: PersonaType;
}
```

Replace with:

```typescript
interface ChatPanelProps {
  persona: PersonaType;
  standalone?: boolean;
}
```

Find `export default function ChatPanel({ persona }: ChatPanelProps)` (line 80):

Replace with:

```typescript
export default function ChatPanel({ persona, standalone }: ChatPanelProps) {
```

- [ ] **Step 2: Skip the overlay/backdrop behavior in standalone mode**

In the ChatPanel return JSX, the panel currently renders as a fixed overlay. In standalone mode it should render as a plain flex column. Find the root `motion.section` element and wrap its className/style to conditionally apply overlay styles.

Find the line that contains `className={styles.panel}` in the return statement and add an override:

The panel root should conditionally drop its fixed-position overlay class when `standalone` is true. Add this near the top of the component body (after the existing state declarations):

```typescript
const panelClassName = standalone
  ? `${styles.panel} ${styles.panelStandalone}`
  : styles.panel;
```

Then add to `components/chat/chat.module.css` at the end:

```css
/* Standalone mode: ChatPanel fills its container instead of floating */
.panelStandalone {
  position: relative !important;
  bottom: auto !important;
  right: auto !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
```

Use `panelClassName` instead of `styles.panel` in the JSX.

- [ ] **Step 3: In standalone mode, auto-open the panel**

The panel checks `state.panelState` to decide whether to show. In standalone mode, it should always be visible. Add an effect at the top of the component:

```typescript
useEffect(() => {
  if (standalone && state.panelState === 'closed') {
    setPanelState('default');
  }
}, [standalone, state.panelState, setPanelState]);
```

- [ ] **Step 4: Run lint to verify no regressions**

```bash
npm run lint 2>&1 | tail -5
```

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add components/chat/ChatPanel.tsx components/chat/chat.module.css
git commit -m "feat(chat): add standalone prop to ChatPanel for assistant page"
```

---

### Task 7: Create Assistant layout + page

**Files:**
- Create: `app/(default)/assistant/layout.tsx`
- Create: `app/(default)/assistant/page.tsx`

- [ ] **Step 1: Create assistant layout**

Create `app/(default)/assistant/layout.tsx`:

```typescript
'use client';

import type { ReactNode } from 'react';
import { CanvasProvider } from '@/contexts/CanvasContext';

export default function AssistantLayout({ children }: { children: ReactNode }) {
  return (
    <CanvasProvider>
      {children}
    </CanvasProvider>
  );
}
```

- [ ] **Step 2: Create assistant page**

Create `app/(default)/assistant/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ChatPanel from '@/components/chat/ChatPanel';
import { pickRandomPersona, type PersonaType } from '@/components/chat/ProfessionalPersonaIcon';
import SessionSidebar from '@/components/assistant/SessionSidebar';
import DynamicCanvas from '@/components/assistant/DynamicCanvas';
import { useCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import type { WidgetInstance } from '@/components/assistant/types';
import styles from '@/components/assistant/assistant.module.css';

const DEFAULT_WIDGETS: WidgetInstance[] = [
  {
    id: 'welcome-suggestions',
    type: 'ai-suggestions',
    title: '💡 AI Suggestions',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-placeholder-1',
    type: 'bank-snapshot',
    title: '🏦 Bank Snapshot',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-placeholder-2',
    type: 'bi-chart',
    title: '📊 BI Chart',
    props: {},
    pinned: false,
    priority: 'default',
  },
  {
    id: 'welcome-placeholder-3',
    type: 'comparison-table',
    title: '⚖️ Comparison',
    props: {},
    pinned: false,
    priority: 'default',
  },
];

export default function AssistantPage() {
  const t = useTranslations('Assistant');
  const [persona] = useState<PersonaType>(() => pickRandomPersona());
  const { state, dispatch } = useCanvasContext();

  useEffect(() => {
    if (state.activeWidgets.length === 0) {
      dispatch({ type: 'SET_ACTIVE_WIDGETS', widgets: DEFAULT_WIDGETS });
    }
  }, []);

  if (state.mode === 'immersive') {
    return (
      <div className={styles.assistantRoot}>
        <SessionSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatPanel persona={persona} standalone />
        </div>
      </div>
    );
  }

  if (state.mode === 'canvas-focus') {
    return (
      <div className={styles.assistantRoot}>
        <SessionSidebar />
        <DynamicCanvas />
      </div>
    );
  }

  // Default: workspace mode
  return (
    <div className={styles.assistantRoot}>
      <SessionSidebar />
      <div className={styles.chatColumn}>
        <ChatPanel persona={persona} standalone />
      </div>
      <DynamicCanvas />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(default\)/assistant/
git commit -m "feat(assistant): add /assistant route with layout + page"
```

---

### Task 8: Add NavBar link + i18n keys

**Files:**
- Modify: `components/ui/NavBar.tsx:64-85`
- Modify: `messages/en.json`
- Modify: `messages/zh-CN.json`
- Modify: `messages/zh-HK.json`

- [ ] **Step 1: Add AI Assistant to NavBar items**

In `components/ui/NavBar.tsx`, find the `navBarLeftItems` array (line 64) and add a new entry before the `about-us` item:

Find:
```typescript
    {
      href: "/about-us",
      label: "about",
      icon: "",
    },
```

Insert before it:
```typescript
    {
      href: "/assistant",
      label: "assistant",
      icon: "",
    },
```

- [ ] **Step 2: Add i18n keys to EN**

In `messages/en.json`, add to the `Navigation` section:

```json
"assistant": "AI Assistant"
```

Add a new top-level `Assistant` section:

```json
"Assistant": {
  "pageTitle": "AI Assistant",
  "sidebar": {
    "toggle": "Toggle sessions",
    "newChat": "New Chat",
    "search": "Search history",
    "currentSession": "Current Session",
    "settings": "Settings",
    "title": "Sessions",
    "close": "Close sidebar",
    "messageCount": "{count} messages"
  },
  "toolbar": {
    "workspace": "Workspace",
    "immersive": "Immersive Chat",
    "canvasFocus": "Canvas Focus",
    "widgetCount": "{count} widgets"
  },
  "widget": {
    "inlineChat": "Ask about this",
    "maximize": "Maximize",
    "close": "Close",
    "comingSoon": "{type} (coming soon)"
  }
}
```

- [ ] **Step 3: Add i18n keys to zh-CN**

In `messages/zh-CN.json`, add matching keys:

Navigation section:
```json
"assistant": "AI 助手"
```

Top-level `Assistant` section:
```json
"Assistant": {
  "pageTitle": "AI 助手",
  "sidebar": {
    "toggle": "切换会话列表",
    "newChat": "新建会话",
    "search": "搜索历史",
    "currentSession": "当前会话",
    "settings": "设置",
    "title": "会话列表",
    "close": "关闭侧栏",
    "messageCount": "{count} 条消息"
  },
  "toolbar": {
    "workspace": "工作台",
    "immersive": "沉浸聊天",
    "canvasFocus": "Canvas 焦点",
    "widgetCount": "{count} 个组件"
  },
  "widget": {
    "inlineChat": "对此提问",
    "maximize": "最大化",
    "close": "关闭",
    "comingSoon": "{type}（即将推出）"
  }
}
```

- [ ] **Step 4: Add i18n keys to zh-HK**

In `messages/zh-HK.json`, add matching keys:

Navigation section:
```json
"assistant": "AI 助手"
```

Top-level `Assistant` section:
```json
"Assistant": {
  "pageTitle": "AI 助手",
  "sidebar": {
    "toggle": "切換會話列表",
    "newChat": "新建會話",
    "search": "搜索歷史",
    "currentSession": "當前會話",
    "settings": "設定",
    "title": "會話列表",
    "close": "關閉側欄",
    "messageCount": "{count} 條消息"
  },
  "toolbar": {
    "workspace": "工作台",
    "immersive": "沉浸聊天",
    "canvasFocus": "Canvas 焦點",
    "widgetCount": "{count} 個組件"
  },
  "widget": {
    "inlineChat": "對此提問",
    "maximize": "最大化",
    "close": "關閉",
    "comingSoon": "{type}（即將推出）"
  }
}
```

- [ ] **Step 5: Run lint**

```bash
npm run lint 2>&1 | tail -5
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add components/ui/NavBar.tsx messages/en.json messages/zh-CN.json messages/zh-HK.json
git commit -m "feat(assistant): add NavBar link + i18n keys (EN/zh-CN/zh-HK)"
```

---

### Task 9: Browser verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server if not running**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to /assistant in browser**

Open `http://localhost:3000/assistant` and verify:

1. Page loads without errors
2. Left icon bar visible with session numbers
3. Chat panel renders in the middle column
4. Dynamic Canvas renders on the right with 4 placeholder widgets in a mosaic layout
5. Click ☰ to expand session sidebar overlay
6. Mode switch buttons in canvas toolbar work (Workspace / Immersive / Canvas Focus)
7. Immersive mode shows full-width chat
8. Canvas Focus mode hides chat panel
9. NavBar shows "AI Assistant" link
10. Chat input works — can send messages and receive responses

- [ ] **Step 3: Take a screenshot for verification**

- [ ] **Step 4: Commit all remaining changes if any**

```bash
git status
# If any unstaged changes, add and commit
```

---

## Phase 1B: Dynamic Canvas + Widget System (outline)

### Task 10: BankSnapshotWidget

**Files:**
- Create: `components/assistant/widgets/BankSnapshotWidget.tsx`
- Modify: `components/assistant/widgets/registry.ts`

Implement a real bank snapshot card using data from BankContext. Display: bank name, revenue, profit/loss, app rating, user count. Register in widget registry replacing the placeholder for `bank-snapshot` type.

### Task 11: AISuggestionsWidget

**Files:**
- Create: `components/assistant/widgets/AISuggestionsWidget.tsx`
- Modify: `components/assistant/widgets/registry.ts`

Implement AI suggestion list widget. Rule-based: when current chat mentions a bank, suggest related analysis actions (compare products, view news, management comparison). Each suggestion is a clickable item that sends a message via ChatContext.

### Task 12: CanvasOrchestrator

**Files:**
- Create: `components/assistant/CanvasOrchestrator.tsx`
- Modify: `app/(default)/assistant/page.tsx`

Watch `ChatContext.state.messages` for new assistant responses. Parse for bank names and intent signals. When detected, create appropriate WidgetInstance and dispatch `ADD_WIDGET` to CanvasContext, replacing lowest-priority unpinned widget.

### Task 13: Keyboard shortcuts

**Files:**
- Create: `components/assistant/hooks/useKeyboardShortcuts.ts`
- Modify: `app/(default)/assistant/page.tsx`

Register global keyboard handlers: `⌘⇧F` → immersive mode, `⌘⇧C` → canvas focus, `⌘K` → inline chat (Phase 1C placeholder).

---

## Phase 1C: BI Engine + Inline Chat (outline)

### Task 14: BIChartWidget (Recharts)

Implement chart widget using Recharts. Support bar chart and table views. Accept `chart_spec` JSON in widget props. Responsive to tile resize via ResizeObserver.

### Task 15: InlineChat component

Create VS Code-style inline chat popup. Appears on ⌘K or widget 💬 button. Auto-injects widget props as INJECT_CONTEXT. Renders inline in an absolutely-positioned popup over the widget. ESC to close.

### Task 16: InlineBIWidget (chat-embedded charts)

Extend ChatMessages to detect `chart_spec` in assistant responses and render inline interactive charts within the conversation flow.

### Task 17: Immersive mode refinement

Polish immersive chat mode: max-width 900px centered, inline widgets in conversation, mode switch animation with Framer Motion.

---

## Phase 2A: Advanced Features (outline)

### Task 18: Radar chart + trend line
### Task 19: Chart interactions (drill-down, type switching, export)
### Task 20: ComparisonTableWidget
### Task 21: ProductListWidget
### Task 22: Report generator (Markdown export)
### Task 23: Canvas Focus mode
### Task 24: Proactive Insights widget

---

## Phase 2B: Polish (outline)

### Task 25: Framer Motion transitions between modes
### Task 26: Full keyboard shortcut implementation
### Task 27: Mobile responsive (force immersive)
### Task 28: Storybook stories for all new components
### Task 29: Full test coverage for assistant components

---

## Phase 3: Extensions (outline)

### Task 30: Collaboration & sharing
### Task 31: PDF report export
### Task 32: Agent-side proactive analysis
### Task 33: NewsFeedWidget + ManagementListWidget
### Task 34: Additional chart types
