# Fluent 组件架构 vs 原始 Platform 架构 — 技术对比文档

## 1. 架构概述

### 原始 Platform 架构（`app/(default)/bank-info/[sortId]/overview/`）

- **单体页面组件**：`page.tsx`（926 行）包含 6 个内联组件定义（`OverviewAboutAndApplication`、`LicensingAndOperatingJurisdiction`、`Marketing`、`FinancialPerformance`、`ProductAndWeb`、`SwiperCarousel`），全部定义在同一个文件内
- **数据获取**：每个组件独立调用后端 API（`postCompanyOverviewById`、`getPieChartData`、`getCompanySortId` 等），demo 路由有 `isDemoBankRoute()` 分支逻辑
- **样式**：`overview.module.css`（独立 CSS Module）
- **路由**：`/bank-info/[sortId]/overview`，在 `(default)` route group 内
- **上下文**：直接使用 `useBankContext` + `useChatContext`
- **AI 注入**：`chatStyles.botIcon` 按钮 + `ProfessionalPersonaIcon` + `injectContext()`

### Fluent 架构（`components/assistant/fluent/`）

- **可组合组件**：每个组件一个文件（`FluentAbout.tsx` 83 行），通过 props 接收数据而非内部 fetch
- **数据层**：`assistantDataService.ts` → `mockBanks.ts`，统一 `USE_MOCK` 开关
- **样式**：`fluent.module.css`（独立 CSS Module，像素级复制原始样式）
- **路由**：`FluentOverview.tsx` 可作为独立页面组件渲染
- **Canvas 嵌入**：`FluentAboutWidget.tsx` 包裹 `FluentAbout` 在 `WidgetShell` 内
- **AI 注入**：保留完整的 `chatStyles.botIcon` + `ProfessionalPersonaIcon` + `injectContext()` 机制

---

## 2. 文件结构对比

| 维度 | 原始 Platform | Fluent |
|------|--------------|--------|
| 核心文件 | `overview/page.tsx` (926行，6个内联组件) | `FluentAbout.tsx` (182行) + `FluentOverview.tsx` (60行) |
| 样式文件 | `overview.module.css` | `fluent.module.css` (176行，像素级复制) |
| Widget 包装 | 无 | `FluentAboutWidget.tsx` (67行) |
| 注册文件 | 无 (非 Canvas 组件) | `registry.ts` 中注册 `fluent-about` |
| 类型定义 | 内联 `interface Owner` / `AboutData` | `FluentAboutProps` export interface |
| 数据来源 | 后端 API + `demoBank.ts` 分支 | `mockBanks.ts` → `assistantDataService.ts` |

---

## 3. 关键技术差异

### 3.1 数据流

**原始**：
```
page.tsx → useCallback(async () => { ... API calls ... }) → useState → 子组件 props
                                    ↓
                        isDemoBankRoute() ? demoBank fixture : API
```
每个内联组件独立 fetch，重复 demo-bank 判断逻辑。

**Fluent**：
```
FluentOverview → getMockBank(sortId) → FluentAbout(props)
                                                    ↓
FluentAboutWidget → getMockBank(sortId) → FluentAbout(props, compact=true)
```
组件不 fetch 数据——调用方负责注入。`assistantDataService.ts` 的 `USE_MOCK` 开关未来可一键切换到后端 API。

### 3.2 组件复用模式

**原始**：`OverviewAboutAndApplication` 是 `page.tsx` 内部定义的函数组件，无法在其他页面复用。

**Fluent**：`FluentAbout` 是独立 export 的组件，通过 `compact` prop 适配两种场景：
- **独立页面**：`FluentOverview` 渲染完整尺寸（font-size 16px/24px）
- **Canvas Widget**：`FluentAboutWidget` 传入 `compact` prop，触发 `.aboutCompact` CSS 修饰器（font-size 13px/14px/16px）

### 3.3 AI 聊天注入

两种架构使用完全相同的注入模式：

| 机制 | 原始 | Fluent |
|------|------|--------|
| 容器 class | `chatStyles.botIconContainer` | `chatStyles.botIconContainer` |
| 按钮 class | `chatStyles.botIcon` | `chatStyles.botIcon` |
| 图标 | `ProfessionalPersonaIcon` (随机 persona) | `ProfessionalPersonaIcon` (随机 persona) |
| 注入 API | `injectContext('about', { ... })` | `injectContext('about', { ... })` |
| 注入字段 | source, sortId, companyId, bankName, ceo, location, revenue, companySize, bankCode, bankSwift | 完全相同 |

Fluent 额外保留了 Establishment section 的第二个注入按钮（founder + owners 数据），与原始行为一致。

### 3.4 样式像素级对比

`fluent.module.css` 复制了 `overview.module.css` 中 About 部分的所有关键样式值：

| 属性 | overview.module.css | fluent.module.css |
|------|-------------------|-------------------|
| `.overviewTitle` / `.aboutTitle` font-size | 24px | 24px |
| `.overviewSubTitle` / `.aboutSubTitle` font-size | 22px | 22px |
| `.overviewItem` / `.aboutItem` margin-top | 14px | 14px |
| `.overviewItemLast` / `.aboutItemLast` margin-bottom | 46px | 46px |
| `.overviewItemTitle` / `.aboutItemTitle` color | #71717A | #71717A |
| `.overviewItemContent` / `.aboutItemContent` color | #18181B | #18181B |
| Owner top color | rgba(105, 69, 69, 1) | rgba(105, 69, 69, 1) |
| Owner top text-decoration | underline, solid, skip-ink none | underline, solid, skip-ink none |

唯一的差异是 class 命名（`overview*` → `about*`），用于与 CSS Module 作用域隔离。

---

## 4. 修改文件清单

### 新增文件

| 文件 | 用途 |
|------|------|
| `components/assistant/fluent/FluentAbout.tsx` | 可组合 About 组件（独立页面 + Canvas 嵌入） |
| `components/assistant/fluent/FluentOverview.tsx` | 组合 FluentAbout 成完整 overview 页面 |
| `components/assistant/fluent/fluent.module.css` | About 区域样式（像素级复制原始） |
| `components/assistant/widgets/FluentAboutWidget.tsx` | WidgetShell 包装器，注册为 Canvas widget |

### 修改文件

| 文件 | 变更内容 |
|------|---------|
| `components/assistant/types.ts` | 新增 `'fluent-about'` 到 WidgetType 联合类型 |
| `components/assistant/widgets/registry.ts` | 导入 + 注册 `FluentAboutWidget`，contextTriggers: `['about', 'establishment', 'founder', 'owner']` |
| `components/assistant/data/mockBanks.ts` | MockBankData 新增 `owners` 字段；4 个 mock bank 各添加 2 个 owner |

### 未修改文件

| 文件 | 原因 |
|------|------|
| `app/(default)/bank-info/[sortId]/overview/page.tsx` | 原始页面保持不变，不受影响 |
| `overview.module.css` | 原始样式保持不变 |
| `contexts/BankContext.tsx` | Fluent 组件复用已有 context，无需修改 |
| `components/chat/chat.module.css` | 复用已有的 `.botIcon` / `.botIconContainer` 样式 |

---

## 5. 数据调用链

### 独立页面模式
```
FluentOverview
  → getSelectedBankSortId()        // localStorage 或 fallback 'demo-bank'
  → getMockBank(sortId)            // mockBanks.ts 查找
  → loadHeaderInfo(sortId)         // BankContext.loadHeaderInfo
  → <FluentAbout {...about} owners={owners} />
      → useChatContext().injectContext('about', { ... })    // 机器人按钮
      → useChatContext().injectContext('establishment', { ... })  // 机器人按钮
```

### Canvas Widget 模式
```
FluentAboutWidget (registered as 'fluent-about' in REGISTRY)
  → instance.props?.bankSortId ?? getSelectedBankSortId()
  → getMockBank(sortId)
  → <WidgetShell title=... accentColor="#6366f1" onInlineChat=...>
      → <FluentAbout {...about} owners={owners} compact />
          → 使用 .aboutCompact CSS 修饰器缩小字体
          → 两个 injectContext 按钮仍然可用
  </WidgetShell>
```

### CanvasOrchestrator 自动触发
```
用户发送消息 → ChatContext messages 更新
  → CanvasOrchestrator useEffect
  → 检测 assistant 消息中的关键词 ('about', 'establishment', 'founder', 'owner')
  → 匹配 REGISTRY['fluent-about'].contextTriggers
  → 如果 canvas 中没有同类型 widget → addWidget({ type: 'fluent-about', ... })
```

---

## 6. 切换到后端 API 的路径

当前：`assistantDataService.ts` 中 `USE_MOCK = true`

未来切换到后端：
1. 将 `USE_MOCK` 改为 `false`
2. 实现 `assistantDataService.ts` 中每个函数的 `else` 分支（已有占位）
3. 后端 API 返回的 `owners` 字段需符合 `{ name: string; percent: number; website?: string }[]` 格式
4. `FluentAbout` 和 `FluentAboutWidget` 无需修改——它们只接收 props
