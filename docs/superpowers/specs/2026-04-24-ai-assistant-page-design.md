# M3.1 AI Assistant Page — 设计规格

> Context-Reactive Dynamic Workspace · 上下文感知的智能工作台

## 目录

- [1. 概述](#1-概述)
- [2. 核心理念](#2-核心理念)
- [3. 三种工作模式](#3-三种工作模式)
- [4. 架构分层](#4-架构分层)
- [5. 模块详细设计](#5-模块详细设计)
  - [5.1 Layout Shell](#51-layout-shell)
  - [5.2 Chat Engine (三入口统一)](#52-chat-engine-三入口统一)
  - [5.3 Dynamic Canvas](#53-dynamic-canvas)
  - [5.4 BI 引擎](#54-bi-引擎)
  - [5.5 Widget 系统](#55-widget-系统)
  - [5.6 报告生成器](#56-报告生成器)
  - [5.7 Proactive Insights](#57-proactive-insights)
- [6. 数据流](#6-数据流)
- [7. 路由与认证](#7-路由与认证)
- [8. 现有组件复用清单](#8-现有组件复用清单)
- [9. 新增组件清单](#9-新增组件清单)
- [10. 分阶段交付计划](#10-分阶段交付计划)
- [11. 竞品差异化定位](#11-竞品差异化定位)
- [12. 风险与缓解](#12-风险与缓解)

---

## 1. 概述

将现有嵌入式 chatbot（ChatPanel + 23 个组件）升级为独立的 `/assistant` 全页面工作台。核心不是"聊天页面加了个面板"，而是一个**上下文驱动的动态工作台**：AI 对话实时驱动右侧 Canvas 的组件编排，Canvas 组件也能反向触发 AI 分析。整个系统双向交互，聊天 ↔ 面板 ↔ BI 图表 ↔ 平台控件，全部上下文贯通。

**目标用户**：银行业分析师、产品经理、投资人（演示场景）

**核心价值主张**：
- "说人话就能出图表" — 对话即 BI
- "AI 不只回答，还重新组织你的工作界面" — Context-Reactive Canvas
- "任何地方都能问 AI" — 组件级 Inline Chat
- "每条回答都有据可查" — 全链路数据溯源

## 2. 核心理念

### 2.1 Context-Reactive（上下文驱动）

系统的所有组件共享同一个上下文层。当用户在聊天中提到"ZA Bank"，Canvas 自动弹出 ZA Bank 卡片；当用户在 Canvas 上点击"Livi Bank 盈亏"，聊天自动追加分析。这种双向驱动是本设计与 ChatGPT Canvas（静态文档编辑器）的根本区别。

### 2.2 渐进披露（Progressive Disclosure）

默认展示最简洁的界面（两栏 Workspace），用户在需要时可以：
- 展开 Session 列表
- 切换到沉浸聊天模式
- 切换到 Canvas 焦点模式
- 在任意组件上唤出 Inline Chat

### 2.3 多入口统一 Session

三种聊天入口（Primary Chat / Inline Chat / Floating Bubble）共享同一个 `ChatContext` 和 Session 历史。用户无感知切换，所有对话上下文完整保留。

## 3. 三种工作模式

用户可随时通过工具栏或快捷键切换：

| 模式 | 布局 | 适用场景 | 快捷键 |
|------|------|----------|--------|
| **Workspace**（默认） | 聊天面板 + Dynamic Canvas 双栏 | 日常分析工作 | — |
| **沉浸聊天** | 全宽聊天流，图表/卡片/控件内嵌对话 | 深度对话分析 | `⌘⇧F` |
| **Canvas 焦点** | 全宽 Canvas，聊天收缩为 Inline Chat / 浮动气泡 | 专注数据可视化 | `⌘⇧C` |

### 3.1 Workspace 模式

```
┌──────┬───────────────────┬──────────────────────────┐
│ Icon │   Chat Panel      │    Dynamic Canvas        │
│ Bar  │   (Primary Chat)  │  ┌──────┬──────────┐     │
│      │                   │  │Bank  │ BI Chart │     │
│ ☰    │  [对话历史...]    │  │Card  │ (Radar)  │     │
│ ✚    │                   │  ├──────┼──────────┤     │
│ 🔍   │  [AI回答+图表]    │  │Next  │ Inline   │     │
│      │                   │  │Steps │ Chat ✨  │     │
│ 1◉   │  [输入框]         │  └──────┴──────────┘     │
│ 2    │                   │  [Canvas Toolbar]         │
│ 3    │                   │                           │
│ ⚙    │                   │                           │
└──────┴───────────────────┴──────────────────────────┘
```

- 左侧 Icon Bar：折叠的 Session 列表，点击 ☰ 展开完整列表
- 中间 Chat Panel：现有 ChatPanel 组件迁移，宽度固定 420px
- 右侧 Dynamic Canvas：react-mosaic 平铺布局，组件动态编排

### 3.2 沉浸聊天模式

```
┌──────┬──────────────────────────────────────────────┐
│ Icon │            Full-Width Chat                    │
│ Bar  │                                              │
│      │    [用户消息]                                │
│      │    [AI回答]                                  │
│      │    ┌── Inline Widget ──────────────────┐     │
│      │    │ 📊 交互式柱状图 (盈亏对比)       │     │
│      │    │ [柱状图] [饼图] [表格] 切换       │     │
│      │    │ [钻取] [导出] [加入报告]          │     │
│      │    └──────────────────────────────────┘     │
│      │    [银行卡片横向滚动条]                     │
│      │    [AI 分析总结]                            │
│      │    [输入框]                                 │
└──────┴──────────────────────────────────────────────┘
```

- 聊天区全宽展开（max-width: 900px 居中）
- BI 图表以交互式 Widget 形式嵌入对话流中
- 类似 Claude Artifacts 内联模式，但图表可直接编辑/钻取/导出

### 3.3 Canvas 焦点模式

```
┌──────┬──────────────────────────────────────────────┐
│ Icon │           Full-Width Canvas                   │
│ Bar  │  ┌─────────┬────────────┬───────────┐       │
│      │  │Bank Card│ BI Chart   │ Rankings  │       │
│      │  │(ZA Bank)│ (Comparison)│ (Table)  │       │
│      │  ├─────────┼────────────┤           │       │
│      │  │Products │ News Feed  │           │       │
│      │  │(23 items)│           │           │       │
│      │  └─────────┴────────────┴───────────┘       │
│      │                                    ┌────┐   │
│      │                                    │ 💬 │   │
│      │                                    └────┘   │
└──────┴──────────────────────────────────────────────┘
```

- Canvas 占据全宽
- 聊天收缩为右下角浮动气泡（复用 ChatBubble）
- 任意组件上可 ⌘K 唤出 Inline Chat

## 4. 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│  Layout Shell — 模式切换 · 响应式断点 · 键盘快捷键         │
├────────────────────┬────────────────────────────────────────┤
│  Chat Engine       │  Dynamic Canvas                       │
│  · Primary Chat    │  · react-mosaic Tiling Layout          │
│  · Inline Chat     │  · Widget Registry                    │
│  · Floating Bubble │  · Context-Reactive Orchestrator      │
│  · Slash Commands  │  · Smart Component Switcher           │
├────────────────────┴────────────────────────────────────────┤
│  Shared Context Layer — ChatContext + BankContext            │
│  + CanvasContext (new) + WidgetState (new)                   │
├─────────────────────────────────────────────────────────────┤
│  Data Bridge — Agent SSE · CSV Data · Clerk Auth            │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 新增 Context

#### CanvasContext

管理 Canvas 面板的状态：当前激活的 Widget 列表、布局配置、模式切换。

```typescript
interface CanvasState {
  mode: 'workspace' | 'immersive' | 'canvas-focus';
  activeWidgets: WidgetInstance[];
  layout: MosaicNode<string> | null; // react-mosaic 布局树
  widgetPriorityQueue: string[];     // 候选 widget 优先级
  sessionSidebarExpanded: boolean;
}
```

#### WidgetState (per widget)

```typescript
interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  props: Record<string, any>;   // 渲染参数
  contextTrigger?: string;      // 触发此 widget 的上下文关键词
  pinned: boolean;              // 用户手动固定
  priority: 'active' | 'contextual' | 'recent' | 'default';
}

type WidgetType =
  | 'bank-snapshot'       // 银行快照卡片
  | 'bi-chart'            // BI 图表 (ECharts)
  | 'comparison-table'    // 对比表格
  | 'product-list'        // 产品列表
  | 'news-feed'           // 新闻动态
  | 'management-list'     // 管理层列表
  | 'report-preview'      // 报告预览
  | 'ai-suggestions'      // AI 推荐下一步
  | 'platform-control';   // 平台控件 (from bank-info page)
```

## 5. 模块详细设计

### 5.1 Layout Shell

**职责**：顶层布局容器，管理三种模式的切换和响应式断点。

**关键行为**：
- 模式切换动画：使用 Framer Motion `AnimatePresence` + `layoutId`
- 响应式策略：
  - `≥1280px`：Workspace 双栏（Chat 420px + Canvas flex）
  - `1024-1279px`：Chat 压缩到 360px
  - `<1024px`：强制沉浸聊天模式（Canvas 不可见）
- 键盘快捷键注册（`⌘⇧F` / `⌘⇧C` / `⌘K`）

**文件**：`app/(default)/assistant/layout.tsx`

### 5.2 Chat Engine（三入口统一）

三种聊天入口共享同一个 `ChatContext` Provider 和 Session 历史。

#### 5.2.1 Primary Chat

现有 `ChatPanel` 组件迁移到 `/assistant` 页面，作为左侧面板。
- 保留所有现有功能（slash commands, persona, TTS, context injection）
- 新增："📌 固定到 Canvas"按钮（把对话中的图表/表格固定到右侧）
- 新增："📊 生成对比图"按钮（触发 BI 引擎生成图表）

#### 5.2.2 Inline Chat

VS Code Copilot Inline Chat 的银行分析版本。

**唤出方式**：
- Canvas 上任意组件的 💬 图标
- 键盘 `⌘K`（在最近聚焦的组件上弹出）
- 右键菜单 → "对此提问"

**行为**：
- 自动注入当前组件的数据为上下文（复用现有 `INJECT_CONTEXT` action）
- 回答实时同步到主 Session 历史（插入为 assistant message）
- 可选操作：固定到 Canvas / 复制 / 在主聊天展开
- ESC 关闭，⌘K 重新打开

**文件**：`components/chat/InlineChat.tsx`（新建）

#### 5.2.3 Floating Bubble

现有 `ChatBubble` 组件不变。在 Canvas 焦点模式下作为聊天入口，在其他页面（bank-info 等）继续作为悬浮入口。

### 5.3 Dynamic Canvas

基于 `react-mosaic` 的平铺式布局管理器。

**核心能力**：
- N 个 Widget 以 tile 形式平铺排列
- 用户可拖拽调整大小、重新排列
- AI 上下文触发自动编排（见 5.3.1）
- 每个 tile 顶部有标题栏 + 操作按钮（💬 Inline Chat / ⬜ 最大化 / ✕ 关闭）

#### 5.3.1 Context-Reactive Orchestrator

监听 `ChatContext` 的消息流，根据对话内容自动编排 Canvas 组件。

**触发规则**：

| 对话中的信号 | Canvas 动作 |
|-------------|------------|
| 提到银行名称（如"ZA Bank"） | 弹出该银行的 snapshot widget |
| 请求"对比" / "compare" | 弹出 comparison-table 或 radar chart widget |
| Agent 返回 structured data | 根据 data type 自动选择 widget 渲染 |
| 请求"产品" / "products" | 弹出 product-list widget |
| 请求"新闻" / "news" | 弹出 news-feed widget |

**编排逻辑**：
1. 新 widget 插入到优先级最低的 tile 位置（替换之，被替换的进入候选队列）
2. 用户手动 pinned 的 widget 不会被替换
3. 候选队列按键盘 ←→ 或鼠标滚轮快速切换

**文件**：`components/assistant/CanvasOrchestrator.tsx`（新建）

#### 5.3.2 Smart Component Switcher

当用户与 Widget A 交互（点击、Inline Chat）时，系统自动将与 A 相关的 Widget B 换入相邻位置。

**关联规则**（示例）：
- `bank-snapshot(ZA)` 激活 → 换入 `product-list(ZA)` 或 `bi-chart(ZA revenue)`
- `comparison-table(ZA vs Livi)` 激活 → 换入 `bi-chart(radar, ZA vs Livi)`
- `bi-chart(profit_loss)` 钻取某银行 → 换入该银行的 `bank-snapshot`

**候选切换 UI**：
- tile 底部显示分页指示器（dots）
- 键盘 ←→ 切换候选
- 鼠标悬停 tile 边缘显示 "→ 更多相关组件"

### 5.4 BI 引擎

AI 驱动的实时数据可视化生成系统。

#### 5.4.1 图表类型（Phase 1）

| 图表 | 触发信号 | 适用场景 |
|------|----------|----------|
| 柱状图 | "排名"/"rank"、数值列表 | 盈亏/营收/下载量排名 |
| 雷达图 | "对比"/"compare"、多维度 | 多维银行对比 |
| 表格 | 任何结构化数据返回 | 可排序/筛选数据展示 |
| 卡片组 | 银行名称提及 | 快照/指标摘要 |

Phase 2 扩展：趋势线（时序）、饼图、散点图

#### 5.4.2 生成流程

```
用户输入 → Agent 意图识别 → Agent 数据查询 → Agent 返回 structured JSON
→ 前端 BI 引擎接收 chart_spec → Widget Registry 匹配渲染器
→ 图表同时渲染到 Chat（inline widget）+ Canvas（tile）
```

#### 5.4.3 交互能力

- 点击柱子/数据点 → 钻取详情（触发新的 Agent 查询）
- 悬停 → Tooltip 详细数据
- 右键 → "对这个数据提问"（唤出 Inline Chat）
- 图表类型切换（柱状 ↔ 饼图 ↔ 表格）
- 导出：PNG / SVG / CSV

#### 5.4.4 技术选型

- **图表库**：Recharts（React 原生、TypeScript 友好、轻量、与 Next.js 兼容好）
- **数据格式**：Agent 返回 `chart_spec` JSON，前端 Widget Registry 匹配渲染器
- **响应式**：图表自动适配 react-mosaic tile 尺寸变化（`ResizeObserver`）

### 5.5 Widget 系统

#### 5.5.1 Widget Registry

集中注册所有可用的 Widget 类型，提供统一的渲染接口。

```typescript
interface WidgetRegistryEntry {
  type: WidgetType;
  component: React.ComponentType<WidgetProps>;
  defaultSize: { width: number; height: number };
  contextTriggers: string[];  // 触发此 widget 的关键词/意图
  relatedTypes: WidgetType[]; // 关联 widget（用于 smart switching）
}
```

**文件**：`components/assistant/widgets/registry.ts`

#### 5.5.2 Widget 通用 Props

```typescript
interface WidgetProps {
  instance: WidgetInstance;
  onInlineChat: (context: Record<string, any>) => void;
  onPin: () => void;
  onClose: () => void;
  onMaximize: () => void;
  isActive: boolean;
}
```

### 5.6 报告生成器

将对话分析一键导出为结构化报告。

**功能**：
- 对话中的图表/表格可通过"📄 加入报告"按钮添加到报告草稿
- 报告草稿作为一个特殊 Widget 显示在 Canvas 中
- 导出格式：Markdown（Phase 1）、PDF（Phase 2）
- 带 Nbanker 品牌水印

**投资人演示价值**：展示 AI 能自动输出"可交付物"，不只是聊天记录。

### 5.7 Proactive Insights

AI 主动推送的分析建议。

**触发场景**：
- 打开 Assistant 页面时：展示"今日发现"卡片（基于最近对话主题）
- 对话间隙：AI 主动推荐下一步分析方向
- 异常检测：数据中发现异常时主动提醒（Phase 2）

**实现方式**：
- Phase 1：基于规则的推荐（当前银行 → 推荐产品/新闻/对比）
- Phase 2：Agent 端实现真正的 proactive analysis

## 6. 数据流

### 6.1 聊天 → Canvas 数据流

```
ChatContext dispatch(SSE_RESPONSE)
  → CanvasOrchestrator 监听 message stream
  → 解析 message 中的实体（银行名称、意图、chart_spec）
  → 匹配 Widget Registry
  → 更新 CanvasContext.activeWidgets
  → react-mosaic 重新渲染布局
```

### 6.2 Canvas → 聊天 数据流

```
用户点击 Widget 上的操作按钮
  → Widget 调用 onInlineChat(context) 或直接 dispatch(INJECT_CONTEXT)
  → ChatContext 收到 INJECT_CONTEXT action
  → 自动发送带上下文的消息到 Agent
  → SSE 响应流回 ChatContext
  → 同时更新 Chat UI 和 Canvas
```

### 6.3 Inline Chat 数据流

```
用户在 Widget 上按 ⌘K
  → InlineChat 组件弹出，自动获取 widget.props 作为上下文
  → 用户输入问题
  → 复用 ChatContext.sendMessage()，附加 widget context
  → 回答同时显示在 InlineChat popup 和主 Chat 历史
```

## 7. 路由与认证

### 7.1 路由设计

```
app/(default)/assistant/
├── layout.tsx          # AssistantLayout — 三模式 Layout Shell
├── page.tsx            # /assistant 主页面
└── [sessionId]/
    └── page.tsx        # /assistant/:sessionId — 加载特定 session
```

- `/assistant` → 新建 session 或恢复最近 session
- `/assistant/:sessionId` → 加载指定的历史 session

### 7.2 认证

复用现有 Clerk 认证体系：
- `(default)` route group 已有 Clerk middleware 保护
- `/assistant` 放在 `(default)` 下，自动受保护
- 未登录用户重定向到登录页

### 7.3 与现有页面的关系

| 页面 | 变化 |
|------|------|
| `/bank-info/:slug/*` | 不变，保留 ChatBubble 悬浮入口 |
| `/homepage` | 不变，保留 ChatBubble |
| `/assistant` (新) | 全页面 AI 工作台 |
| 导航栏 | 新增"AI Assistant"入口 |

## 8. 现有组件复用清单

以下组件直接复用到 `/assistant` 页面，无需修改或仅需最小适配：

| 组件 | 复用方式 | 需要的适配 |
|------|----------|-----------|
| `ChatPanel.tsx` | Primary Chat 面板 | 提取为独立模式（不依赖 ChatBubble 触发） |
| `ChatInput.tsx` | 聊天输入框 | 无 |
| `ChatMessages.tsx` | 消息列表渲染 | 新增 inline widget 渲染分支 |
| `SlashAutocomplete.tsx` | 斜杠命令 | 无 |
| `CommandPalette.tsx` | 命令面板 | 无 |
| `ContextCard.tsx` | 上下文注入卡片 | 无 |
| `CodeBlock.tsx` | 代码块渲染 | 无 |
| `MarkdownView.tsx` | Markdown 渲染 | 无 |
| `TraceAccordion.tsx` | 追踪折叠面板 | 无 |
| `SourcesFooter.tsx` | 数据源脚注 | 无 |
| `ReliabilityBadge.tsx` | 可靠性标签 | 无 |
| `AssistantFeedback.tsx` | 反馈按钮 | 无 |
| `SuggestedChips.tsx` | 建议芯片 | 无 |
| `OnlineModeToggle.tsx` | 在线模式切换 | 无 |
| `ChatBubble.tsx` | Canvas 焦点模式下的浮动入口 | 无 |
| `InjectContextButton.tsx` | 组件注入按钮 | 扩展到 Canvas Widget |
| `ChatContext.tsx` | 聊天状态管理 | 扩展 action types |
| `BankContext.tsx` | 银行数据上下文 | 无 |

## 9. 新增组件清单

| 组件 | 职责 | 目录 |
|------|------|------|
| `AssistantLayout.tsx` | 三模式 Layout Shell + 模式切换 | `app/(default)/assistant/` |
| `AssistantPage.tsx` | 主页面容器 | `app/(default)/assistant/` |
| `SessionSidebar.tsx` | 折叠式 Session Icon Bar + 展开列表 | `components/assistant/` |
| `DynamicCanvas.tsx` | react-mosaic 容器 | `components/assistant/` |
| `CanvasOrchestrator.tsx` | 上下文驱动的 Widget 编排逻辑 | `components/assistant/` |
| `CanvasToolbar.tsx` | Canvas 顶部工具栏（模式/筛选/布局） | `components/assistant/` |
| `InlineChat.tsx` | VS Code 风格内联聊天弹窗 | `components/chat/` |
| `InlineBIWidget.tsx` | 对话流中的内嵌交互式图表 | `components/chat/` |
| `WidgetShell.tsx` | Widget 通用外壳（标题栏+操作按钮） | `components/assistant/widgets/` |
| `BankSnapshotWidget.tsx` | 银行快照卡片 Widget | `components/assistant/widgets/` |
| `BIChartWidget.tsx` | BI 图表 Widget（Recharts 渲染） | `components/assistant/widgets/` |
| `ComparisonTableWidget.tsx` | 对比表格 Widget | `components/assistant/widgets/` |
| `ProductListWidget.tsx` | 产品列表 Widget | `components/assistant/widgets/` |
| `NewsFeedWidget.tsx` | 新闻动态 Widget | `components/assistant/widgets/` |
| `AISuggestionsWidget.tsx` | AI 推荐下一步 Widget | `components/assistant/widgets/` |
| `ReportPreviewWidget.tsx` | 报告预览 Widget | `components/assistant/widgets/` |
| `CanvasContext.tsx` | Canvas 状态管理 | `contexts/` |
| `widgetRegistry.ts` | Widget 类型注册表 | `components/assistant/widgets/` |

## 10. 分阶段交付计划

### Phase 1A — 骨架 + 聊天迁移（~3 天）

- [ ] `/assistant` 路由 + Layout Shell（Workspace 模式 only）
- [ ] ChatPanel 独立化（不依赖 ChatBubble 触发）
- [ ] Session Icon Bar（折叠态，展开态列表）
- [ ] 右侧 Canvas 占位（静态 placeholder widgets）
- [ ] Clerk 认证验证
- [ ] 导航栏新增 "AI Assistant" 入口

### Phase 1B — Dynamic Canvas + Widget 系统（~4 天）

- [ ] react-mosaic 集成 + CanvasContext
- [ ] Widget Shell + Registry 架构
- [ ] BankSnapshotWidget（从 bank-info 页面数据复用）
- [ ] AISuggestionsWidget（基于规则的推荐）
- [ ] CanvasOrchestrator（基础上下文触发：银行名称 → 卡片）
- [ ] Smart Component Switcher（基础版：候选队列 + 切换 UI）

### Phase 1C — BI 引擎 + Inline Chat（~4 天）

- [ ] Recharts 集成 + BIChartWidget
- [ ] Agent 端 chart_spec 返回协议定义
- [ ] 柱状图 + 表格两种基础图表
- [ ] InlineChat 组件 + ⌘K 快捷键
- [ ] InlineBIWidget（对话流内嵌图表）
- [ ] 沉浸聊天模式切换

### Phase 2A — 进阶功能（~5 天，投资人演示前）

- [ ] 雷达图 + 趋势线图表
- [ ] 图表交互（钻取、类型切换、导出）
- [ ] ComparisonTableWidget + ProductListWidget
- [ ] 报告生成器（Markdown 导出）
- [ ] Canvas 焦点模式
- [ ] Proactive Insights（规则驱动的"今日发现"）

### Phase 2B — 打磨体验（~3 天）

- [ ] Framer Motion 过渡动画
- [ ] 键盘快捷键完整实现
- [ ] 移动端适配（强制沉浸模式）
- [ ] i18n（EN/zh-CN/zh-HK 三语）
- [ ] Storybook stories for 所有新组件

### Phase 3 — 扩展（后续迭代）

- [ ] 协作与共享（分享链接、团队标注）
- [ ] PDF 报告导出
- [ ] Agent 端 proactive analysis
- [ ] NewsFeedWidget + ManagementListWidget
- [ ] 异常检测预警
- [ ] 更多图表类型（散点图、热力图、桑基图）

## 11. 竞品差异化定位

| 能力维度 | ChatGPT / Claude | Bloomberg | FinChat.io | **Nbanker AI** |
|----------|-------------------|-----------|------------|----------------|
| 核心定位 | 通用 AI 对话 | 专业金融终端 | 投资者研究 AI | 银行业垂直分析工作台 |
| 数据来源 | 训练数据 | 实时市场数据 | 公开财报 | 自有数据 + Audit Trail |
| 动态面板 | Canvas (静态) | 固定多窗口 | 无 | **Context-Reactive Canvas** |
| Inline Chat | 无 | 无 | 无 | **组件级 AI (VS Code 风格)** |
| BI 图表 | Code Interpreter | 专业图表 | 预设图表 | **AI 自动生成 + 交互式** |
| 报告生成 | 文本导出 | 模板报告 | PDF 导出 | 对话 → 结构化报告 |
| 数据溯源 | 无 | 有 | Audit Trail | 每条回答标注来源 + 置信度 |
| 价格 | $20-200/月 | $24,000/年 | $29-249/月 | SaaS 分级定价 |
| 上手难度 | 极低 | 极高 | 低 | 低 (渐进披露) |

### 四大独特卖点（投资人演示重点）

1. **Context-Reactive Canvas** — 业界首个"对话驱动面板编排"。ChatGPT Canvas 是静态文档编辑器，我们是动态工作台
2. **组件级 Inline Chat** — 像 VS Code Copilot 一样在任何数据组件上直接提问。金融领域无竞品
3. **对话即 BI** — "说人话就能出图表"。数据分析师的效率，产品经理的门槛
4. **全链路数据可信** — Audit Trail + 置信度标签 + 数据源标注。合规证据

## 12. 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| react-mosaic 学习成本 | 开发周期 | 库成熟稳定、TypeScript 原生；Phase 1A 先静态布局 |
| Inline Chat + Primary Chat 状态同步 | 数据一致性 | 共享 ChatContext Provider，统一 dispatch |
| BI 引擎依赖 Agent 端 structured output | 后端联动 | Phase 1 先硬编码图表 spec，后续定义协议 |
| 首版 MVP 范围膨胀 | 交付延迟 | 严格 Phase 分期，每阶段可独立演示 |
| Canvas 焦点模式 + 沉浸模式切换的动画性能 | UX 卡顿 | Framer Motion `layoutId` + will-change 优化 |
| 移动端 Canvas 不适用 | 覆盖率 | 移动端强制沉浸聊天模式，不展示 Canvas |

---

*设计日期：2026-04-24*
*设计依据：用户需求对话 + 竞品调研（FinChat, Bloomberg, ChatGPT Canvas, VS Code Inline Chat, Observable Notebooks, OpenAI ChatKit）*
