# 开发更新日志（Frontend）

> 统一滚动日志：按日期归档；同日多次更新使用 `v1 / v2 / v3` 递增记录。
> **路线图索引**：所有变更对应 [MASTER_PLAN.md](../../../neobanker-agent/docs/workspace/plans/MASTER_PLAN.md) 的 H/M/G/T 层级。当前焦点：H0-M0.2（工程化 Harness）。

## 2026-04-26

### v1 `[NEW]` WF-B6 数据导出为报表 — 完整实现 + AI 增强路径

#### 背景

实现设计规范 `docs/superpowers/specs/2026-04-25-platform-comprehensive-redesign.md` 中 WF-B6（数据导出为报表）的全部传统操作路径（5 步）和 AI 增强路径（3 步）。报告内容采用专业模版，包含丰富 mock 数据、内联 SVG 图表、多银行对比表。

#### 变更

**核心文件**：

- `[NEW/REWRITE]` `components/assistant/ReportBuilder.tsx`（~430 行）
  - 原有 163 行基础 widget 列表导出器，完全重写为双面板报告构建器
  - 类型定义：`ReportSection`（id / type / title / enabled / notes），8 个 section 类型（cover / summary / overview / financials / products / comparison / leadership / ownership）
  - `mapWidgetTypesToSections()` — 根据当前 Canvas widget 类型自动勾选相关报告章节
  - `generateSVGBarChart()` / `generateSVGLineChart()` — 内联 SVG 图表生成器（自包含 HTML，无外部依赖）
  - `generateReportHTML()` — 生成完整自包含 HTML 报告（专业排版 + CSS + 表格 + 图表 + 指标卡片）
  - 章节编号使用 `§N§` 占位符 → 仅对 enabled 章节按序替换，避免禁用章节导致编号断档
  - 左面板：checkbox 控制章节启用、拖拽手柄调序、内联标题编辑、分析师备注
  - 右面板：iframe 实时预览（`srcdoc` 注入生成的 HTML）
  - 监听 `reportBuilderCommand` CustomEvent 支持 AI 路径（标题修改 / 格式 / 导出）
  - HTML 导出（Blob → download）、PDF 导出（`window.open` + `window.print`）

- `[CHANGED]` `components/assistant/CanvasOrchestrator.tsx`
  - `[NEW]` `detectReportRequest()` — 识别 "generate report" / "create report" 等指令，提取格式偏好
  - `[NEW]` `detectReportTitleChange()` — 识别 "change/set/rename title to ..." 指令
  - `[NEW]` `detectExportCommand()` — 识别 "export as pdf/html" 指令
  - 调用链：`chatState.messages → detectReportRequest() → CustomEvent('openReportBuilder') → DynamicCanvas handler → setReportOpen(true)`
  - 标题修改链：`detectReportTitleChange() → CustomEvent('reportBuilderCommand', { title }) → ReportBuilder useEffect listener → setReportTitle()`
  - 导出链：`detectExportCommand() → CustomEvent('reportBuilderCommand', { format, exportNow }) → ReportBuilder handler → exportHTML/PDF`

- `[CHANGED]` `components/assistant/DynamicCanvas.tsx`
  - 新增 `openReportBuilder` CustomEvent 监听器（useEffect），接收 AI 触发的 `title` / `autoSelect` 参数
  - 两处 `<ReportBuilder>` 实例均传入 `aiTitle` / `aiAutoSelect` props

- `[CHANGED]` `components/assistant/assistant.module.css`（~150 行新增）
  - `[NEW]` `.reportBuilderPanelWide`（width: min(95vw, 1100px)）
  - `[NEW]` `.reportBuilderSplit`（flex 双面板布局）
  - `[CHANGED]` `.reportBuilderBody`（flex: 0 0 380px，左侧章节列表）
  - `[NEW]` `.reportPreviewPanel` / `.reportPreviewHeader` / `.reportPreviewFrame`（右侧预览面板）
  - `[NEW]` `.reportSectionItem*`（可拖拽章节行、checkbox 双色态、内联编辑输入框）
  - `[NEW]` `.reportNoteBtn*` / `.reportNoteInput`（分析师备注按钮+展开文本域）
  - `[REMOVED]` 旧版 `.reportWidgetItem*` / `.reportCheckIcon` 样式

#### Mock 说明

| 组件/数据 | 数据来源 | Mock 状态 |
|---|---|---|
| 银行基础信息（名称、CEO、地区等） | `data/mockBanks.ts` | ✅ Mock（4 家虚拟银行） |
| 财务指标（总资产、收入、ROE、NPL 等） | `mockBanks.ts → finances` | ✅ Mock（含季度数据） |
| 产品列表（零售/对公） | `mockBanks.ts → products` | ✅ Mock |
| 管理层信息 | `mockBanks.ts → management` | ✅ Mock |
| 股权结构 | `mockBanks.ts → ownership` | ✅ Mock |
| 营销活动 | `mockBanks.ts → campaigns` | ✅ Mock |
| SVG 图表（季度收入柱状图、ROE 趋势线图） | 代码内联生成 | ✅ Mock 数据驱动 |
| 同业对比表（4 家银行横向比较） | `getAllMockBanks()` | ✅ Mock |
| AI 分析叙述（Executive Summary 段落） | 模版字符串 | ✅ Mock（基于 mock 数据的自动生成叙述） |

**未来真实数据接入点**：替换 `getMockBank()` / `getAllMockBanks()` 为后端 API 调用（`/api/bank/{sortId}`），报告内容将自动切换为真实数据。

#### WF-B6 步骤与高级交互设计映射

##### 传统操作路径（5 步）— 全部已实现 ✅

| 步骤 | 操作 | 实现 | 对应 §4 高级交互设计 |
|------|------|------|------|
| 1 | Canvas 工具栏 → "📄 生成报告" | `CanvasToolbar` → `onOpenReport` → `DynamicCanvas.setReportOpen(true)` | — （基础 UI 操作） |
| 2 | 勾选/取消报告章节 | `ReportSection.enabled` toggle → iframe 实时预览 | — （基础 UI 操作） |
| 3 | 拖拽调整章节顺序 | HTML5 drag-and-drop（`onDragStart/Over/End`） | — （基础 UI 操作） |
| 4 | 编辑章节标题 / 添加分析师备注 | 内联 `<input>` + 可展开 `<textarea>` → 实时注入 HTML | — （基础 UI 操作） |
| 5 | 选择 HTML/PDF 格式 → 导出 | HTML: Blob download / PDF: window.open + print | — （基础 UI 操作） |

##### AI 增强路径（3 步）— 步骤 1 已验证，步骤 2-3 代码已实现

| 步骤 | 操作 | 实现 | 对应 §4 高级交互设计 |
|------|------|------|------|
| 1 | "Generate a report for [Bank]" | `CanvasOrchestrator.detectReportRequest()` → `CustomEvent('openReportBuilder', { autoSelect: true })` → 银行上下文切换 + 报告构建器自动打开 + 所有章节预选 | **§4.4 Inline Chat 业务流融合** — 聊天指令直接驱动 Canvas 编排动作（报告生成器打开），体现"问→做"模式 |
| 2 | "Change the title to '...'" | `CanvasOrchestrator.detectReportTitleChange()` → `CustomEvent('reportBuilderCommand', { title })` → `ReportBuilder` 内 listener 更新标题 | **§4.4 Inline Chat 业务流融合** — 聊天持续指令修改 Canvas 组件状态，体现多轮控制能力 |
| 3 | "Export as PDF" | `CanvasOrchestrator.detectExportCommand()` → `CustomEvent('reportBuilderCommand', { format, exportNow })` → 触发 PDF 导出 | **§4.4 Inline Chat 业务流融合** — 最终导出操作也通过聊天完成，形成完整闭环 |

##### 高级交互设计在 WF-B6 中的具体体现

| §4 设计 | 在 WF-B6 中的体现 | 状态 |
|---|---|---|
| **§4.1 Smart Component Switcher** | 报告构建器通过 `mapWidgetTypesToSections()` 自动将 Canvas 中已有 Widget 映射为报告章节并预选 → 类似"智能推荐下一步"逻辑 | ✅ 已实现（自动映射） |
| **§4.2 Platform Component Embedding** | 报告预览使用 iframe 嵌入完整 HTML 预览 → 类似"平台组件嵌入到 Canvas 中"的模式 | ✅ 已实现（iframe 预览） |
| **§4.3 Chat Embedded Widgets** | CanvasOrchestrator 在 AI 回复中检测到报告相关关键词时可触发 `report-preview` widget 出现在 Canvas → 双态组件雏形 | ⚠️ 部分（registry 已注册 `report-preview` 类型，但尚未实现完整的 Chat 内嵌预览卡片） |
| **§4.4 Inline Chat 业务流融合** | AI 增强路径全 3 步均通过 Chat 指令 → CanvasOrchestrator → CustomEvent → ReportBuilder 闭环控制 → 最典型的"聊天驱动 Canvas 编排"案例 | ✅ 已实现（核心体现） |

#### 验证

| 验证项 | 方法 | 结果 |
|---|---|---|
| 传统路径 Step 1（报告构建器打开） | Chrome MCP 点击工具栏 Report 按钮 | ✅ 面板滑出 |
| 传统路径 Step 2（章节 toggle） | Chrome MCP 取消勾选 Product Portfolio → 观察预览 | ✅ 预览实时更新，章节编号连续（无断档） |
| 传统路径 Step 3（拖拽排序） | 视觉确认拖拽手柄可见 | ✅ GripVertical 图标显示 |
| 传统路径 Step 4（备注编辑） | Chrome MCP 点击备注图标 → 输入文字 | ✅ 备注保存到报告 HTML |
| 传统路径 Step 5（HTML 导出） | Chrome MCP 点击 Download HTML | ✅ 文件下载 |
| AI 路径 Step 1（聊天触发报告） | Chrome MCP 发送 "Generate a report for Nova Horizon Bank" | ✅ 银行切换 + 报告构建器打开 + 全选 |
| 章节编号连续性 | 禁用中间章节后检查编号序列 | ✅ 4→5→6（无断档） |

#### 风险

- ⚠️ AI 路径 Step 2-3 需要报告构建器已打开才能接收 `reportBuilderCommand` 事件；如果用户关闭后再发聊天指令，事件会丢失。未来可改为 Step 2-3 也先触发 `openReportBuilder` 再执行命令。
- ⚠️ 拖拽排序暂无持久化（刷新后恢复默认顺序）
- ⚠️ PDF 导出依赖浏览器 print dialog，样式在不同浏览器间可能有细微差异

#### ⚙️ 需手动配置

- 无

#### 🐞 本版未解决

- AI 路径 Step 2-3 的 `reportBuilderCommand` 事件在构建器关闭时不生效
- 拖拽排序的视觉反馈（半透明拖拽影像）在 CSS Modules 环境下样式可能丢失

#### ➡️ 下一步方向

- **短期**：AI 路径 Step 2-3 改为先 reopen builder 再执行命令
- **中期**：接入后端 API 替换 mock 数据；添加 Recharts 交互式图表替代静态 SVG
- **长期**：实现 §4.3 Chat Embedded Widgets 的完整双态（缩略图/完整）报告预览卡片

---

### v2 `[NEW]` 4 项交互修复 — Widget 放大/缩小、3 态布局、InlineBIWidget 图表切换、Open in Canvas

#### 背景

修复 AI Assistant 页面 4 个交互 bug，增强 Canvas Widget 操作性和 Chat+Canvas 布局灵活性。

#### 变更

**核心文件**：

- `[CHANGED]` `components/assistant/types.ts`
  - 新增 `maximizedWidgetId: string | null` 到 `CanvasState`
  - 新增 `MAXIMIZE_WIDGET` / `RESTORE_WIDGET` 两个 action 类型到 `CanvasAction` union

- `[CHANGED]` `contexts/CanvasContext.tsx`
  - 新增 `maximizedWidgetId: null` 到 `initialCanvasState`
  - 新增 `MAXIMIZE_WIDGET` / `RESTORE_WIDGET` reducer case
  - `[NEW]` 布局折叠守卫逻辑：`TOGGLE_CHAT_PANEL` / `TOGGLE_CANVAS_PANEL` / `SET_CHAT_PANEL` / `SET_CANVAS_PANEL` 四个 case 均增加双面板折叠防护——如果折叠操作会导致两个面板都隐藏，则自动展开另一个面板
  - `REMOVE_WIDGET` 清除 `maximizedWidgetId`

- `[CHANGED]` `components/assistant/DynamicCanvas.tsx`
  - `onMaximize` 从 `() => {}` 改为 `MAXIMIZE_WIDGET` / `RESTORE_WIDGET` toggle
  - `isActive` 从 `false` 改为 `state.maximizedWidgetId === instance.id`
  - 新增放大模式渲染：maximized widget 填满整个 Canvas 区域，顶部显示"Restore"还原按钮

- `[CHANGED]` `components/assistant/widgets/WidgetShell.tsx`
  - 新增 `Minimize2` 图标导入
  - maximize 按钮图标根据 `isMaximized` 状态在 `Maximize2` / `Minimize2` 之间切换

- `[CHANGED]` `app/(assistant)/assistant/page.tsx`
  - 新增 Canvas 面板 header（标题 + 折叠按钮，与 Chat 面板 header 对称）
  - 新增折叠还原栏：被折叠的面板在底部中央显示还原按钮（Chat / Canvas）
  - 新增 `chatPanelFull` 样式：当 Canvas 折叠时 Chat 面板自动全宽展开

- `[CHANGED]` `components/chat/InlineBIWidget.tsx`
  - 新增 `localChartType` state + `CHART_TYPE_OPTIONS`（Bar/Line/Area/Radar）
  - wide 模式新增图表类型工具栏（4 按钮切换图表类型）
  - `handleOpenInCanvas` 新增：如果 Canvas 处于折叠状态，自动 dispatch `SET_CANVAS_PANEL collapsed:false` 展开 Canvas
  - narrow 模式按钮文案从 "Pin" 改为 "Open in Canvas"

- `[CHANGED]` `components/assistant/assistant.module.css`
  - `[NEW]` `.canvasPanelHeader` / `.canvasPanelTitle`
  - `[NEW]` `.canvasMaximized` / `.canvasRestoreBtn` / `.canvasMaximizedWidget`
  - `[NEW]` `.collapsedBar` / `.collapsedBarBtn`
  - `[NEW]` `.chatPanelFull`

- `[CHANGED]` `components/chat/chat.module.css`
  - `[NEW]` `.inlineBIWidgetHeader` / `.inlineBIChartToolbar`
  - `[NEW]` `.inlineBIChartTypeBtn` / `.inlineBIChartTypeBtnActive`

#### 调用链

**Bug 1（Widget 放大/缩小）**：
`WidgetShell Maximize 按钮 → page.tsx onMaximize() → dispatch('MAXIMIZE_WIDGET') → CanvasContext reducer 设置 maximizedWidgetId → DynamicCanvas 条件渲染（maximizedWidget ? 全屏 : 网格）`

**Bug 2（3 态布局）**：
`panelCollapseBtn → toggleChatPanel/toggleCanvasPanel → CanvasContext reducer 守卫逻辑（如果双折叠则自动展开对方）→ page.tsx 条件渲染 chatPanel/canvasPanel → collapsedBar 显示还原按钮`

**Bug 3（InlineBIWidget 图表切换）**：
`CHART_TYPE_OPTIONS 按钮 → setLocalChartType(opt.value) → activeSpec = { ...spec, type: localChartType } → ChartRenderer 使用 activeSpec 重渲染`

**Bug 4（Open in Canvas）**：
`handleOpenInCanvas → addWidget(widget) → if(canvasCollapsed) dispatch('SET_CANVAS_PANEL', collapsed:false) → showToast()`

#### 验证

| 验证项 | 方法 | 结果 |
|---|---|---|
| Bug 1 — Widget 放大 | Playwright MCP 点击 Bank Overview 的 Maximize 按钮 | ✅ Widget 填满整个 Canvas，顶部显示 Restore 按钮 |
| Bug 1 — Widget 还原 | Playwright MCP 点击 Restore 按钮 | ✅ 返回网格布局 |
| Bug 2 — Canvas-only 模式 | Playwright MCP 点击 Collapse chat | ✅ Chat 折叠，Canvas 全宽，底部显示 Chat 还原按钮 |
| Bug 2 — 守卫逻辑 | 在 Canvas-only 模式下点击 Collapse canvas | ✅ 自动展开 Chat（Chat-only 模式），不出现双折叠 |
| Bug 2 — Chat-only 全宽 | 观察 Chat-only 模式布局 | ✅ Chat 面板自动全宽展开（chatPanelFull 生效） |
| Bug 2 — 还原按钮 | 点击底部 Canvas 还原按钮 | ✅ 恢复 Chat+Canvas 双面板 |
| Bug 3 — 图表类型切换 | 代码审查（demo 后端不产生 chart 数据块） | ✅ 代码正确：localChartType + toolbar + activeSpec |
| Bug 4 — Open in Canvas | 代码审查（依赖 InlineBIWidget 渲染） | ✅ 代码正确：SET_CANVAS_PANEL collapsed:false |

#### 风险

- ⚠️ Bug 3/4 无法浏览器实测：demo 后端不在 AI 回复中返回 ````chart` 数据块，因此 InlineBIWidget 在 demo 模式下不会渲染。接入真实 Agent 后可验证。

#### ⚙️ 需手动配置

- 无

#### 🐞 本版未解决

- 无

#### ➡️ 下一步方向

- **短期**：Agent 后端添加 ````chart` 数据块到 comparison 类回复，使 InlineBIWidget 在 demo 模式下可见
- **中期**：Widget 拖拽排序（react-mosaic 集成）

---

## 2026-04-21

### v2 `[CHANGED]` R10-L baseline + ESLint 9→8.57.1 降版(`next lint` 恢复)+ npm-audit baseline

#### 背景
1. agent 仓库 R10-L 标准化"免费工具基线"(`docs/standards/code-quality-and-security-tools.md`),前端侧需要落地 `npm audit` baseline + 降级 ESLint 解锁 `next lint`
2. ESLint 9 + Next 14 不兼容(`Unknown options: useEslintrc`)— v1 标记为 open issue,本次解决
3. plan 体系重构(R10-M)写入 master plan;前端 devlog 留索引

#### 变更
- `[CHANGED]` `package.json`:`eslint: ^9.36.0` → `^8.57.1` + 新增 `eslint-config-next: ^14.2.0`(对齐 Next 14)
- `[CHANGED]` `package-lock.json`:`npm install --legacy-peer-deps` 后重锁(138 added / 11 removed / 12 changed)
- `[NEW]` `tests/baselines/quality/npm-audit.json`(39 issues:5 critical / 8 high / 19 moderate / 7 low — R10-L baseline,R11 triage)
- `[NEW]` `tests/baselines/quality/README.md`(刷新 SOP + Lighthouse 手动 run 命令)
- `[CHANGED]` `.gitignore` 已在 v1 调过(`__tests__/*` + 白名单);`tests/baselines/` 不在 ignore 范围内,正常 track

#### 验证
- `npm run lint` 现可执行:✅ 无 useEslintrc 报错(stdout 输出大量 pre-existing lint warnings 属正常,本次不修)
- `npm audit --json > tests/baselines/quality/npm-audit.json` 跑通(39906 字节 JSON)
- 与 agent baseline 互相 cross-link(标准 + README 双向引用)

#### 风险
- ⚠️ Pre-existing lint errors(unused-vars / no-explicit-any / jsx-a11y)未修;若启用 hard hook 需要先 triage
- ⚠️ Lighthouse 实跑未做(需 dev server + LHCI):`README.md` 内已写命令,留 R10-L Phase 3 manual
- ⚠️ npm audit 5 critical + 8 high 是已知历史值(基线快照),R11 拆 transitive vs direct + dev vs prod
- ⚠️ Storybook 8 vs 10 peer-dep 冲突仍在(用 `--legacy-peer-deps` 绕过),不阻断 build,留 R11 清理

#### ⚙️ Manual Reconfig
| 操作 | 位置 | 命令 / 步骤 |
|---|---|---|
| Lighthouse baseline 实跑 | dev 机器 | 终端 A:`npm run dev`;终端 B:`npx -y @lhci/cli@0.13 autorun --collect.url=http://127.0.0.1:3000/homepage --upload.target=filesystem --upload.outputDir=tests/baselines/quality/lhci`(详见 `tests/baselines/quality/README.md`) |
| ESLint 升级路径(R12+) | `package.json` | 等 Next 15 + ESLint 9 兼容(目前 Next 14 不行);用 ESLint 8.57.1 撑过 R10/R11 |
| 清理 `package-new.json` / `package-lock-new.json` / `temp` | 仓库根 | 用户 04-12 旧 WIP;若不再需要 → `rm package-new.json package-lock-new.json temp`(本次未触碰) |

#### 🐞 Open Issues
- 5 critical npm vulns 待 triage(转发给 R11)
- Pre-existing lint errors 未清(超 100 条;不属本次范围)
- Storybook 10 升级需要 reset peer-deps 表(R11 / R12)
- `components/chat/**` stories 覆盖率仍 < 30%(R11 必修,R10-K v1 已记)

#### ➡️ Next Direction
1. **R10-K Phase 4 / #202**:批量翻译 R10-K + R10-L CN 改动到 `*.en.md`
2. **#197 Storybook**:5 关键组件落地(MarkdownView / ChatInput / MessageActions / CommandPalette / SlashAutocomplete)
3. **#198 回归用例**:从 R7-R9 commit 描述里挑 2 个高频 bug,落 `__tests__/regression/`
4. **R11 quality-gate.yml**:把 npm audit + ESLint + Lighthouse 进 GitHub Actions(warn-only 起步)
5. **修 critical npm vulns**:R11 优先(triage → upgrade → reset baseline)

---

### v1 `[CHANGED]` R10-K 跨项目文档系统全量审计 — 前端侧仅文档同步

#### 背景
R10-K 由 agent 仓库主导(`repos/neobanker-agent/docs/developer-updates.md` 同日 v1)。前端侧本次只同步以下两处:
1. agent 仓库新增的 `docs/standards/` 跨项目硬规则集对前端有适用范围,前端 `docs/ai-code-review.md` 已是规则的实例落地之一
2. 已知技术债 `*.stories.tsx` 缺、ESLint 9 + Next 14 兼容性需要在前端 devlog 留档,避免 R11 起 Storybook hard rule 生效时被 hook 阻断

#### 变更
- `[CHANGED]` 仅本 devlog 增加 R10-K 同步条目(无代码修改)
- 引用:agent `docs/standards/dev-tooling-discipline.md`(R11 起 `components/chat/**` 必须有同名 `.stories.tsx`,本仓负责落地)
- 引用:agent `docs/standards/test-discipline.md`(`__tests__/regression/<short_id>.test.tsx` 路径约定;本仓尚无该目录,R10-K Phase 5 创建)

#### 验证
- 不涉及代码,`npm run build` 不受影响
- ESLint 9 兼容性问题(预存)与本批无关

#### 风险
- `components/chat/**` 33 个组件中,只有少数已有 stories;R11 起会被 hook 阻断 — 须在 R11 切换前批量回填
- `__tests__/regression/` 目录尚未创建,本批仅文档说明

#### ⚙️ Manual Reconfig
- 无前端侧 server-env 变化(本批文档同步)
- 若仓库尚未启用 GHAS:GitHub 仓库 Settings → Code security and analysis → 启用 Code scanning(本仓与 agent 仓共用 GHAS 启用流程)

#### 🐞 Open Issues
- `components/chat/**` 33 个组件 stories 覆盖率 < 30%(待批量回填)
- ESLint 9 + Next 14 兼容性(`Unknown options: useEslintrc`):`next lint` 在 ESLint 9 下报错,生产 build 不受影响,但 PR-time lint 会失败 — 需要单独修
- `__tests__/regression/` 目录待创建 + 历史已修 bug 待回填用例

#### ➡️ Next Direction
1. R10-K Phase 5:创建 `__tests__/regression/` + 给 R7-R8 已修 chatbot 退化各加一条用例(test-discipline.md §11.2 SOP)
2. 批量补齐 `components/chat/**` 同名 `.stories.tsx`(R11 hard 之前完成)
3. ESLint 9 兼容修复(单独 commit,不混进 R10-K)

---

## 2026-04-18

### v2 `[NEW]` R8 客户验收回合 — 命令面板居中 / Revert 虚线即显即隐 / 金融化耗时词 / Chip 下落+输入框接收 / 间距收紧 / 滚动链不停 / 第二轮 Orchestration 渲染 / 斜杠列表自动滚动 / 银行图标定位文档

#### 背景
R7 上线后客户给出 R8 9 项反馈，覆盖 4 个层面：交互手感（命令面板/分隔线/chip 飞行/滚动链）、文案专业度、二次会话渲染稳定性、运维可见度（银行图标）。

#### 变更

##### v2-R8-1 `[CHANGED]` Cmd+K 命令面板居中到屏幕（撤销 R7-6）
- `[CHANGED]` `components/chat/CommandPalette.tsx`：把面板 + 背景蒙层 `createPortal` 到 `document.body`。父级 `motion.div` 的 transform 形成新 containing block，导致 `position: fixed` 的居中错位；portal 后定位锚点回到视口。
- `[CHANGED]` `components/chat/MessageBubble.tsx` + `chat.module.css`：`.assistantMetaRow` 还原 `justify-content: flex-start` —— R7-6 原本是误把"工具栏居中"做成了"屏幕居中"，回退。

##### v2-R8-2 `[CHANGED]` Revert 虚线 hover 即显、移开即隐（无延迟、无常驻虚线）
- `[CHANGED]` `chat.module.css`：删除 `.revertSeparator::before` 常驻虚线；`.revertSeparator` 默认 18px 透明热区，hover 时 `data-phase='hinted'` 升至 36px 才出现 dashed 提示框。
- 行为不变：单击进入 armed 阶段（红色"Click again to revert"），再次单击执行；离开热区任意时点立即清空 timer 回 idle。

##### v2-R8-3 `[CHANGED]` "Answered in Xs" → "Resolved in Xs" 金融化措辞
- `[CHANGED]` `components/chat/MessageBubble.tsx`：`Resolved in <1s` / `Resolved in {n}s`，与金融客服/工单处置语义对齐，去除"答题"色彩。

##### v2-R8-4 `[NEW]` Chip 飞行重设计：下落 + 输入框接收脉冲
- `[CHANGED]` `components/chat/ChipFlyOverlay.tsx`：移除 `arcLift`，chip 从源 rect 直线下落到输入框（`top: to.y + 6`），320ms 内伴随 scaleY 1→1→0.85 的"落地挤压"+ 透明度逐帧淡出。R8 反馈："上抛弧线像弹回，不像交付"。
- `[NEW]` `components/chat/ChatInput.tsx`：新增 `chipCatchKey?: number` prop；每次值递增触发 460ms 的 `inputCatchPulse` keyframe（border 红框闪 + 顶部内阴影"接住"+ 微 scaleY），与 chip 下落末尾对齐。`reduceMotion` 下跳过。
- `[CHANGED]` `components/chat/ChatPanel.tsx`：`chipCatchKey` state 在 `handleChipFlyComplete` 中递增；通过 prop 传给 `ChatInput`。
- `[NEW]` `chat.module.css`：`@keyframes inputCatchPulse` 定义 0%→35%→100% 的 border-color / box-shadow / transform 三轨。

##### v2-R8-5 `[CHANGED]` 输入区与输出工具栏间距收紧
- `[CHANGED]` `chat.module.css`：`.messagesArea` `padding-bottom: 16→6`、`.chipsContainer` `6/16/8 → 4/16/4`、`.inputArea` `12/16 → 8/16/10`。整体节省 ~14px 垂直空隙，回答 → 工具栏 → chips → 输入紧贴成一组。

##### v2-R8-6 `[NEW]` Orchestration 滚动链路连续不停顿
- `[NEW]` `components/chat/TraceAccordion.tsx`：`useEffect` 在 scroll 模式下挂 `wheel` listener，inner 触底/触顶且方向继续时直接把 `deltaY` 加到 `closest('.messagesArea').scrollTop` 并 `preventDefault`。CSS 的 `overscroll-behavior-y: auto` 仍然是默认行为，但接管了 release 时机后没有"等一帧"的停顿感。

##### v2-R8-7 `[CHANGED]` 第二轮起 Orchestration 在 thinking 中可见
- `[CHANGED]` `components/chat/ChatMessages.tsx`：流式 `<TraceAccordion>` 渲染条件由 `activeTraces.length > 0 && isStreaming` 放宽到 `isStreaming`。Agent 在某些回合先发 chunk 再发 trace，旧条件让 trace 出现前面板始终隐身。
- `[CHANGED]` `components/chat/TraceAccordion.tsx`：`if (traces.length === 0) return null` 调整为仅 `!isStreaming` 时返回；空态展示 `Starting orchestration…` 占位（spin + 标题改为 "Orchestrating · starting…"），用户每次发送都立刻看到面板。

##### v2-R8-8 `[NEW]` 斜杠菜单 / 命令面板键盘选择自动滚动
- `[NEW]` `components/chat/SlashAutocomplete.tsx` + `components/chat/CommandPalette.tsx`：每行收 `ref`，`useEffect` 监听 `safeIndex / activeIndex` 变化时调 `scrollIntoView({ block: 'nearest' })`。↓ 高亮越界即时跟进，菜单不再"卡"在可见区域顶部/底部。

##### v2-R8-9 `[NEW]` 银行图标加载排查文档
- `[NEW]` `docs/bank-icons-debug.md` + `docs/bank-icons-debug.en.md`：完整 FE↔BE↔MinIO 调用链 + 重写表 + 5 步浏览器 DevTools recipe + 3 类失败模式 + 修复方向（先文档，UI 改动按 MEMORY 规则待审）。
- 关键发现：仅 `homepage` 与 `about-us` 调用 `resolveAssetUrl`；`/banks-statistics`、`HotSearchWords`、`popularBanks`、`BankMenuOption*`、`tab*`、`bank-info/[sortId]/*` 均直接消费内网 `124.193.170.132:9000` URL，外网用户必然失败 → "部分图标能加载部分不能"的根因。

#### 验证
- `npx tsc --noEmit` 生产代码 0 报错（`__tests__/` 残留 vitest/缺 id 的预存错误，非本轮引入）。
- `npm run lint` 触发预存的 ESLint 9 与 Next 14 不兼容（与 R7 同一阻塞），不归本轮。

#### 风险
- v2-R8-7 把 streaming TraceAccordion 改为 `isStreaming` 即渲染，可能让"零 trace 极速回答"也短暂闪一帧 "Starting orchestration…" 占位（<200ms）。如客户反感，下一轮可加 `setTimeout(150ms)` 延后挂载。

---

### v1 `[NEW]` R7 客户验收回合 — Orchestration 滚动链 / 多轮渲染 / Revert 虚线可见 / 工具栏布局 / AI 代码审查工具链

#### 背景
v10 上线后客户在 R7 给出 8 项反馈：内嵌 Orchestration 在 panel 内"卡边"、第二轮起不渲染、Revert 虚线不可见、Check Online 按钮过大、工具栏间距 / 居中、引入免费 AI 代码审查工具链、银行图标回归排查。

#### 变更

##### v1-R7-1 `[CHANGED]` Orchestration 滚动到边缘可链至外层
- `[CHANGED]` `chat.module.css`：`.thinkingBodyScroll` `overscroll-behavior` `contain → auto`，触底后外层 `.messagesArea` 接力滚动。

##### v1-R7-2 `[CHANGED]` 第二轮 Orchestration 强制 fresh mount
- `[CHANGED]` `components/chat/ChatMessages.tsx`：完成态与流式态 `<TraceAccordion>` 各自指定显式 `key`（`completed-${msgId}` / `streaming-${latestMsgId}`），避免 React 复用上一轮实例导致 mode/openSteps 状态污染。

##### v1-R7-3 `[CHANGED]` Revert 虚线即时可见
- `[CHANGED]` `chat.module.css`：（首版 R7-3 是常驻 dashed `::before`，**R8-2 已撤回**为 hover-only 方案，本节保留作为审计记录。）

##### v1-R7-4 `[CHANGED]` Check Online 按钮缩小
- `[CHANGED]` `chat.module.css`：`.offerWebSearchBtn` padding `6/12 → 3/9`、字号 12→11、border-radius 8→6，与同行小药丸尺寸对齐。

##### v1-R7-5 `[CHANGED]` Assistant 工具栏按钮间距统一
- `[CHANGED]` `chat.module.css`：删除 `.assistantFeedback` 的 `margin-left: 4px`，全行统一靠 flex `gap: 12px`。

##### v1-R7-6 `[CHANGED]` （已被 R8-1 撤回）Assistant 工具栏居中
- `[CHANGED]` `chat.module.css`：原方案把 `.assistantMetaRow` 改 `justify-content: center`；R8-1 客户澄清"居中目标是 Cmd+K 命令面板而非工具栏"，撤回。

##### v1-R7-7 `[NEW]` AI 代码审查工具链（CodeQL + ScanCode + Copilot）跨 3 仓部署
- `[NEW]` `.github/workflows/code-scanning.yml`（前端 `javascript-typescript`、后端 `java-kotlin`、Agent `python`）。
- `[NEW]` 前端 `.github/workflows/license-and-supply-chain.yml`：`dependency-review-action` deny GPL/AGPL/LGPL；ScanCode 输出 HTML+JSON artifact。
- `[NEW]` `docs/ai-code-review.md`：自动接入清单、GHAS / Copilot Code Referencing / FOSSA / Snyk 手动开启步骤、本地 `act` 预演、Roadmap。

##### v1-R7-8 `[CHANGED]` 银行图标回归 deep-dive
- `[CHANGED]` 调查结论：本轮所有 commit 均未触碰图标加载链路；现象 = 后端持续返回内网 MinIO URL + 多数前端调用点未走 `resolveAssetUrl`。详见 R8-9 文档。

#### 验证
- 生产代码 typecheck 通过；test 文件预存错误未在本轮引入。

#### 风险
- v10/R7 期间发现 ESLint 9 与 Next 14 `next lint` 命令不兼容（`Unknown options: useEslintrc, ...`），是 Next.js 升级遗留问题，不阻塞 CI 但本地 `npm run lint` 失败 —— 留下一轮处理。

## 2026-04-17

### v10 `[NEW]` Chatbot 14 项现代化修复 — 动画提速 / TTS 多语种 / 语音输入修复 / 现代布局 / 历史回放 / 跨页跳源 / 响应式 / 设计 token

#### 背景
v9 上线后客户给出 14 项体验反馈，核心痛点：
1. **动画过慢** — 面板展开/折叠、按钮 hover、tip 飞入输入框都明显拖沓。
2. **TTS 仅支持英文** — 中英混排或粤语回答只能用英文嗓子读。
3. **语音输入按钮一闪即灭** — Web Speech 实例每帧重建。
4. **header persona 文案** — "female" 字样在金融场景下不专业。
5. **按钮风格割裂** — 输入工具栏 vs assistant 工具栏样式与定位不一致。
6. **Context Card 跳源不灵** — 用户离开页面后无法回到原始卡片。
7. **斜杠菜单 / 输入历史** — 缺少键盘上下导航。
8. **"Performing deep thinking"** — 不论快慢一律弹出，提示挤占视野。
9. **Revert 虚线点击无效** — 用户点击虚线没有任何反馈。
10. **响应式空白** — 小屏 / 超宽屏下面板尺寸失控。
11. **配色不统一** — accent / success / danger 散落多处硬编码色值。

本轮一次性补齐 + 新增设计 token 层 + 全套响应式断点。

#### 变更（按 14 个修复点对应顺序）

##### v10-1 `[NEW]` 动画体系全面提速
- `[CHANGED]` `components/chat/motion.ts`：`springSnappy` stiffness 420→520、mass 0.9→0.7；`springSilky` 240→320；`panelSlide` 由 spring 改 0.18s tween；bubble 入场去掉 scale，y 8px、x 10px。
- `[CHANGED]` `components/chat/ChatPanel.tsx`：**移除** motion.div 的 `layout: true` —— 它是 v9 "everything feels slow" 的根因，每次 state 变化都强制 layout re-tween。
- `[CHANGED]` `components/chat/chat.module.css`：`.panel` 自带 0.22s iOS-easing 的 width/height/inset CSS transition，CSS 主导默认↔展开尺寸 morph，framer-motion 仅做 fade+scale。

##### v10-2 `[CHANGED]` 移除 header persona 徽章
- `[CHANGED]` `components/chat/ChatPanel.tsx`：删除 `<span className={styles.personaBadge}><ThunderboltOutlined/> {persona}</span>`，header 不再展示 "female / male" 字样。

##### v10-3 `[CHANGED]` Tip 飞入输入框动画放慢 + 弧形轨迹
- `[CHANGED]` `components/chat/ChipFlyOverlay.tsx`：~280ms spring → 620ms tween；引入 `arcLift = clamp(travel × 0.12, 18, 46)` 让 chip 沿弧线飞行；keyframes 同时驱动 top/scale/opacity 数组。
- `[CHANGED]` `chat.module.css` `.chipFlyGhost` 切到 token 化背景。

##### v10-4 `[NEW]` TTS 多语种自动切音
- `[NEW]` `components/chat/tts-lang.ts`：纯脚本检测 BCP-47（CJK→zh-CN，traditional bias→zh-HK，假名→ja-JP，韩语→ko-KR，西里尔→ru-RU，阿拉伯/印地/泰/希伯来/希腊/拉丁均覆盖）+ `splitForTts()` 按字符脚本切段 + `pickVoiceForLang()` 按 exact→prefix→Cantonese fallback 选嗓子。
- `[CHANGED]` `components/chat/AssistantFeedback.tsx`：`useEffect` 监听 `voiceschanged` 异步事件；`handleReadAloud()` 把消息切段、按段挑嗓子、逐段 enqueue；最后一段 `onend` 才 reset `isSpeaking`。

##### v10-5 `[CHANGED]` 语音输入按钮稳定化
- `[CHANGED]` `components/chat/hooks/useVoiceInput.ts`：原 `useEffect` 把 `onTranscript` 放进 dependency，导致每次 render 都 abort+重建 SpeechRecognition（"一闪即灭" 根因）。改为 callback ref 模式，effect 仅依赖 `lang`；新增 `onError(reason, raw)` 回调，区分 `not-allowed / no-speech / audio-capture / network / aborted / unsupported / unknown`。
- `[CHANGED]` `components/chat/ChatInput.tsx`：传 `onError` → antd `message.warning` 浮提（除 aborted）。

##### v10-6 `[CHANGED]` 输入 vs 输出按钮风格统一
- `[CHANGED]` `chat.module.css`：新增统一规则把 `.assistantActionBtn / .voiceBtn / .sendBtn / .stopBtn` 全部规整为 30px 圆形、`var(--nbk-line-strong)` 描边、hover 同色 accent；用户消息工具栏从「气泡左侧」改为「气泡下方」(`messageRowUserStack` flex-direction: column)。
- `[CHANGED]` `components/chat/MessageBubble.tsx`：用户消息行 DOM 顺序调整（气泡先出，工具栏后出），新增 `messageRowUserStack` className。

##### v10-7 `[NEW]` Context Card 跳回原始页面
- `[CHANGED]` `components/chat/types.ts`：`ContextMessage.sourcePath?` 与 `INJECT_CONTEXT.sourcePath?` 落库；`injectContext(component, data, sourceId, sourcePath)` 签名扩展。
- `[CHANGED]` `contexts/ChatContext.tsx`：reducer 把 `sourcePath` 写入 message。
- `[CHANGED]` `components/chat/InjectContextButton.tsx`：点击 / 拖放时填入 `window.location.pathname + search`；`sourceId` 由随机 UUID 改为 **基于 `component + data 标识字段` 的确定性 hash**，跨页面 re-mount 也能匹配。
- `[CHANGED]` `components/chat/ContextCard.tsx`：reveal 按钮 → 优先本页 highlight；找不到则 `router.push(sourcePath)` + `requestAnimationFrame` 轮询 1.5s 等新页面挂载后再 highlight；`antdMessage.loading` 浮提。

##### v10-8 `[VERIFIED]` 斜杠命令上下键导航
- 已实现：`ChatInput.tsx` 监听 ArrowUp/ArrowDown 在 `slashOpen && matches.length>0` 时更新 `slashIndex`；`SlashAutocomplete.tsx` 受控 activeIndex 高亮。本轮 v10-9 复审通过。

##### v10-9 `[NEW]` 输入框上下键 recall 历史 prompt
- `[CHANGED]` `components/chat/ChatInput.tsx`：新增 `history?: string[]` prop（最近在尾）；ArrowUp 倒序回放、ArrowDown 顺序前进、Esc 退出（在斜杠菜单关闭时才生效，避免冲突）；`historyIdxRef` 跟踪游标，`draftRef` 暂存当前未发送内容；用户手动改字自动退出 history mode。
- `[CHANGED]` `components/chat/ChatPanel.tsx`：`useMemo` 派生 `promptHistory`（去重，按发送先后），传入 `<ChatInput history={...} />`。

##### v10-10 `[NEW]` 现代消息布局（user 右侧窄、assistant 全宽无气泡）
- `[CHANGED]` `chat.module.css`：`.messageBubbleUser` `max-width: 72%` 圆角气泡；`.messageBubbleAssistant` `max-width: 100%` 去背景去阴影，左侧 2px accent 浅色 border 区分；`.panelExpanded` 下用户气泡进一步收窄至 56%。
- 长 markdown / 表格在 assistant 列里彻底铺开，长答可读性显著提升。

##### v10-11 `[NEW]` 深度思考提示延迟 + 完成时嵌入耗时
- `[CHANGED]` `components/chat/ChatMessages.tsx`：active streaming 的 `<ResponseNotice deferAfterSeconds={4}>` 仅当流耗时 ≥ 4s 才淡入；`isStreaming=false` 时整块隐藏。每条 assistant 历史消息**不再**展示 banner（仅保留 `<TraceAccordion>` 折叠面板）。
- `[CHANGED]` `components/chat/MessageBubble.tsx`：根据 `message.traces` 首末时间戳计算 `elapsedSeconds`，>0 时在气泡底部渲染 `Answered in Xs` 小药丸（`.elapsedBadge` token 化样式）。

##### v10-12 `[CHANGED]` Revert 虚线点击即响应
- `[CHANGED]` `components/chat/RevertSeparator.tsx`：hint 阶段从 `<motion.div>` 升级为 `<motion.button>`，文案 "Hold to revert" → "Click to revert"；`handleHintClick` 直接推进到 armed phase（不再要求悬停 700ms）。
- `[CHANGED]` `chat.module.css`：`.revertSeparatorHint` 重置 button 原生样式，加 hover/focus-visible 状态。

##### v10-13 `[NEW]` 响应式断点（mobile / tablet / desktop / wide）
- `[CHANGED]` `chat.module.css`：
  - `.panelDefault` 宽度 `clamp(320px, 30vw, 420px)`、高度 `clamp(440px, 70vh, 640px)`；
  - `.panelExpanded` 宽度 `clamp(720px, 70vw, 1180px)`；
  - `@media (max-width: 480px)` —— 整屏 sheet `100dvh`，气泡 86%；
  - `@media (481–768px)` —— 平板底部 sheet `min(94vw, 520px)`；
  - `@media (769–1279px)` —— 桌面 expanded `min(80vw, 980px)`；
  - `@media (≥1280px)` —— 宽屏 expanded 内 `messagesArea` 限 `88ch` 居中（避免长行不可读）；
  - `@media (≥1920px)` —— 超宽屏进一步收紧至 `min(60vw, 1180px)`；
  - `@media (prefers-reduced-motion: reduce)` —— 关掉所有 transition。

##### v10-14 `[NEW]` 设计 token 层（颜色 + 圆角 + 阴影）
- `[CHANGED]` `chat.module.css` 顶部新增 token 块：`--nbk-accent / --nbk-accent-soft / --nbk-accent-strong / --nbk-success / --nbk-success-soft / --nbk-danger / --nbk-danger-soft / --nbk-muted / --nbk-line / --nbk-line-strong / --nbk-radius-{sm,md,lg} / --nbk-shadow-{soft,lift}`。统一散落的 `color-mix()` 与硬编码 `#ef4444 / #16a34a / #b8413f`。

#### 验证

```bash
# 1) 类型检查（生产代码 0 错误；__tests__ 缺 vitest 类型为先存在）
npx tsc --noEmit

# 2) 启动 dev server，浏览器检查
docker exec my-ubuntu-dev bash -lc 'cd repos/neobanker-frontend-MVP-V3 && npm run dev'
curl -I http://127.0.0.1:3000/bank-info/demo-bank/overview
```

UI 验收清单见 `docs/client-demo-guide.md` v10 段。

#### 风险
- v10-13 移动端 100dvh 在不支持 dvh 的旧 Safari 上回退为 `100vh`，地址栏切换时可能闪 1 帧。
- v10-7 跨页 reveal 依赖 router.push 后 ≤1.5s 的轮询，弱网下可能错过；后续可改 `MutationObserver`。
- v10-4 浏览器 `getVoices()` 在 Linux 上可能返回 0；做了空数组兜底但听感会用浏览器默认嗓。

---

## 2026-04-16

### v9 `[NEW]` Chatbot 现代化整体升级 — 编辑/分支 / 斜杠命令 / Cmd+K / 语音输入 / 拖放注入 / 安全 Markdown / 反馈与朗读

#### 背景
v8 之后 chatbot 已经具备桌面级动画质感与上下文卡片，但仍缺三大「现代 chatbot」主线：
1. **可逆消息治理** — 不能编辑、回滚或重新生成；revert 失误成本高且没有审计留痕。
2. **键盘原生流** — 没有 `/` 命令、没有 Cmd+K 调色板、没有快捷键加速；演示要靠手型 + 鼠标。
3. **现代化富交互** — 缺 thumbs-up/down、朗读、语音输入、拖放上下文、长消息折叠、citation 跳源、人设/区域徽章、空状态引导卡。

本轮一次性补齐，并按用户要求把动画/物理调优 **限定在 chatbot 内**，其余组件零回归。

#### 变更

##### Schema / 状态层（保持 v1 schema 向后兼容，旧消息懒补 id）
- `[CHANGED]` `components/chat/types.ts`：`MessageBase` 新增 `id`、`supersededAt?`、`branchId?`；`AssistantMessage.feedback?`、`ContextMessage.sourceId?`、`ChatSessionArchive.pinned?`、`ChatState.conversationTitle?`、`InteractionStep.type` 增 `'branch'`；新增 `RENAME_SESSION` / `TRUNCATE_FROM` / `SET_FEEDBACK` / `TOGGLE_PIN_ARCHIVE` 四个 action + 对应 context callbacks。
- `[CHANGED]` `contexts/ChatContext.tsx`：`generateId()` 共享给 message + conversation；`hydrateMessage()` 给老消息懒补 id；新增 `markSupersededFrom()` 仅打标不删除（审计完整保留）；持久化 payload 增加 `conversationTitle`。

##### 用户消息三件套 + 危险区 revert（防误触三段式）
- `[NEW]` `components/chat/MessageActions.tsx`：用户气泡左侧 hover 浮出 Copy / Edit&Resend / Regenerate 三枚 icon 按钮；rich tooltip 微文案（"Edit & resend — forks a new branch from here" 等）；按钮 24/26px 视觉密度。
- `[NEW]` `components/chat/EditMessageModal.tsx`：⌘/Ctrl+Enter 发送、Esc 取消；明示「将隐藏 N 条下游消息（审计保留）」。
- `[NEW]` `components/chat/RevertSeparator.tsx`：消息之间的 hover 三段进度 — `idle`(invisible 6px) → `hinted`(300ms 虚线 + "Hold to revert") → `armed`(1000ms 琥珀 danger 带 + "Discard N messages")；Esc/mouseleave 任意时刻撤销。
- `[CHANGED]` `components/chat/MessageBubble.tsx`：`onRequestRevert` / `onRequestEdit` / `onRequestRegenerate` props 串到外层；删去废弃 `simpleMarkdown`；长答案（>1400 字符）折叠 + 展开按钮。

##### 安全 Markdown + Citation 跳源 + 代码块复制
- `[NEW]` `components/chat/MarkdownView.tsx`：react-markdown + remark-gfm + rehype-raw + rehype-sanitize（`data-citation` / `language-` 白名单）；`[N]` / `[citation:N]` → 可点击 pill 徽章。
- `[NEW]` `components/chat/CodeBlock.tsx`：暗色面板 + 语言标签 + Copy（成功状态 1.5s 反馈，复用 `useActionFeedback`）。
- `[CHANGED]` `components/chat/SourcesFooter.tsx`：每行加 `data-source-row={i+1}`，配合 `MessageBubble.handleCitationJump` 滚动到行 + 1.2s 高亮脉冲。

##### 助手反馈 / 朗读 / 长消息折叠
- `[NEW]` `components/chat/AssistantFeedback.tsx`：thumbs up / down 双按钮（互斥 toggle）+ TTS 朗读（Web Speech `speechSynthesis`，再次点击停止）。

##### 斜杠命令 + Cmd+K 调色板 + 键盘快捷键
- `[NEW]` `components/chat/commands.ts`：通用 `/summary /rename /clear /pin /expand /collapse /copy /export` 与 Neobanker 专属 `/compare /find /attach /persona /region /tier /source /audit /explain /idp` 共 17 项；`parseSlashInput()` / `matchSlashCommands()` / `matchPaletteCommands()` 三件套。
- `[NEW]` `components/chat/SlashAutocomplete.tsx`：输入 `/` 即弹出，方向键导航 + Tab/Enter 选择 + Esc 关闭。
- `[NEW]` `components/chat/CommandPalette.tsx`：⌘/Ctrl+K 切换；分组（General / Neobanker）；fuzzy 匹配；Esc/Enter/方向键。
- `[CHANGED]` `components/chat/ChatPanel.tsx`：`useEffect` 监听 ⌘/Ctrl+K → 打开 palette；⌘/Ctrl+/ → 直接把输入设为 `/`。

##### 语音输入（Web Speech API）
- `[NEW]` `components/chat/hooks/useVoiceInput.ts`：封装 `SpeechRecognition` / `webkitSpeechRecognition`；交互式更新 input field；recording 状态翻为 active 视觉。
- `[CHANGED]` `components/chat/ChatInput.tsx`：左侧增加 voice 按钮（仅在 `supported` 时显示）；recording 时 1.06× 缩放呼吸；同时挂载 SlashAutocomplete + 键盘事件路由。

##### 拖放上下文卡片 + 滚动「N 条新消息」按钮 + 空态引导
- `[CHANGED]` `components/chat/InjectContextButton.tsx`：button 外包 `<span draggable onDragStart>`，`dataTransfer.setData('application/x-neobanker-context', payload)` 序列化 component/data/sourceId；保留点击注入。
- `[CHANGED]` `components/chat/ChatPanel.tsx`：panel 容器 `onDragOver/onDrop`，识别同 mime → `injectContext()`；拖入时显示半透明虚线 drop zone 提示。
- `[NEW]` `components/chat/EmptyStateGuides.tsx`：4 张 starter 卡片（Bank overview / Compare / Find a card / Explain a process），点击直接 `sendMessage()`。
- `[CHANGED]` `components/chat/ChatMessages.tsx`：滚动到非底部时显示「N 条新消息 ↓」浮窗，点击平滑回滚到底；`React.Fragment + RevertSeparator` 在每条用户消息之后渲染（仅当下游 > 0）。

##### Pin / Persona / 工具栏微文案 sweep
- `[CHANGED]` `components/chat/ChatPanel.tsx`：toolbar 增加 Pin 切换 button、palette 入口（⚡）、persona badge；session select 按 pinned 优先排序，加 📌 前缀。
- `[CHANGED]` 全 chat 目录：所有 Tooltip 文案改写为「行为 + 价值」格式（如 "Edit & resend — forks a new branch from here"）。

##### CSS（皆只影响 chat 组件 scope）
- `[NEW]` `components/chat/chat.module.css`：追加 ~430 行 — `userActions` / `userActionBtn` / `assistantFeedback` / `actionBtnDanger/Active` / `revertSeparator{,Hint,Armed}` / `editModal{Backdrop,Header,...}` / `citationBadge` / `nbkSourceRowFlash` keyframes / `newMessagesIndicator` / `longMessage{Wrap,Collapsed,Toggle}` / `dropZoneOverlay` / `personaBadge` / `slashMenu*` / `commandPalette*` / `voiceBtn(Active)` / `emptyStateGrid/Card` / `pinnedSessionPin` + `pinToggleBtn` / `branchNav`。

#### 验证
```bash
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc \
  "npx tsc --noEmit 2>&1 | grep -E 'error TS' | grep -v __tests__"   # ✅ no production errors
curl -I http://127.0.0.1:3000/homepage                                # 200
```

#### 风险
- `useVoiceInput` 在非 Chromium 浏览器（Safari Tech Preview 之外）可能 silently 不显示按钮，符合预期但需在 demo guide 中点名。
- `truncateFrom` 仅打 `supersededAt`；后端目前不消费这个字段，audit log 完整但 UI 隐藏 — 后端补齐前请勿用作合规凭证。
- TTS 用浏览器默认 voice，不同 OS 音色差异大，演示前要预听一次。
- Cmd+K 与浏览器搜索栏重合 — 我们 `preventDefault()`，但 macOS Safari 仍可能拦截，已用 ⌘/Ctrl+/ 作为副入口。

---

### v4 `[NEW]` Session Summary v1 按钮

#### 背景
Agent 侧 meta-query 通道（v4）已经支持「summarize our chat」从请求 history 直接作答，但入口还是要用户亲自打字。客户/合规 audit 场景要一键触发。

#### 变更
- `[NEW]` `components/chat/ChatPanel.tsx`：`compactToolbar` 在 New-session 按钮之后、Session-select 之前新增 📄 `FileTextOutlined` 按钮；`handleSummarize()` → `useSSE.sendMessage('Summarize our conversation so far with key topics and decisions.')`；`disabled={isStreaming || !hasConversation}`。
- `[NEW]` `components/chat/chat.module.css`：`.compactSummaryBtn` 使用 `var(--primary, #2563eb)` 描边白底，hover 翻转；与红色 `.compactNewBtn` 形成语义分层（新建=警示红；摘要=主色蓝）。

#### 验证
```bash
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc 'npx eslint components/chat/ChatPanel.tsx'   # ✅ clean
docker exec -w /workspace/repos/neobanker-frontend-MVP-V3 my-ubuntu-dev bash -lc 'npx tsc --noEmit 2>&1 | grep components/chat'   # ✅ no errors
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/homepage   # 200
```

#### 风险
- Summary prompt 是英文 hard-code；中文会话下 agent 仍会以中文作答，但触发气泡显示英文——v2 补 i18n。
- 无 rate-limit；依赖 `isStreaming` 阻断快速连点。

### v3 `[NEW]` T5 打磨：Context 卡片红橙专业风 / Chips 自动换行 / Sources 类型内容分层 / Check-online 静默触发

#### 背景
v2 上线后收到当面评审反馈，问题集中在四处：
1. Context 气泡绿色过于淡、没有「专属卡片」质感；尝试彩虹渐变又过于花哨。需要红+橙的金融专业感、对比更克制。
2. Chips 做成横向滚动被否决——要「多行换行」，不要滚动条，chip 本身视觉不变。
3. Sources 小节在虚线上方多了一排蓝色 reference Tag，以及下方 item 的类型（Internal DB / Wikipedia …）与内容（`management` / 文章标题）混在一起读着乱。
4. 「Check online」按钮期望静默触发 web 搜索，不要向消息流里再塞一条「Yes, please check online …」的用户气泡。

另外两处 bug：
- `useChatContext().sendMessage` 只 `dispatch(SEND_MESSAGE)`，从未 `fetch` 后端——所以 v2 的 Check online 按钮从 UI 点过去根本没走通（此前只用 curl 验证过 SSE，未点过按钮）。
- Message 气泡渲染逻辑没有 `hidden` 概念，无法实现「消息进历史但不显示」。

#### 变更
- `[CHANGED]` `components/chat/chat.module.css`
  - Context 气泡：最终走「warm-red + amber」渐变头 + 低饱和背景；`.contextCardHeader` 标题加上 `PushpinFilled` 图钉。
  - Chips：`flex-wrap: wrap; overflow: hidden`——多行换行、不出滚动条；chip 尺寸/字号不变。
  - Sources：删除虚线上方的蓝色 reference Tag 行；item 内从左至右依次为 tier 圆点 + `.sourcesFooterType` pill（类型，按 tier 着色）+ `.sourcesFooterContent`（内容，加粗 600）+ 可选的 `.sourcesFooterDomain`（域名 monospace pill，warm-red 边框）。
- `[CHANGED]` `components/chat/ContextCard.tsx`
  - 拆出 header / body：header 永远显示 `[attached]` 标题，body 内是 summary + 可展开 detail。
- `[CHANGED]` `components/chat/SourcesFooter.tsx`
  - `typeLabel(provider)` 映射 provider → 短类型标签（`Internal DB` / `Wikipedia` / `Web` / `Context card` …）。
  - `contentLabel(source)` 针对 database / frontend_context 截取标题中 `—` 右半部分作为「内容」（如 `management`）；其余 provider 用标题或域名兜底。
- `[NEW] / [CHANGED]` `components/chat/MessageBubble.tsx`
  - 改为直接 `useSSE()` 取 `sendMessage`（此前误用的 `useChatContext().sendMessage` 是个不走网络的僵尸方法）。
  - `message.type === 'user' && message.hidden` 直接 `return null`，保持消息进 state/history，但不在界面渲染。
  - Check online 按钮改为发送 `{ hidden: true }` 的静默跟进消息，不再污染聊天流。
- `[CHANGED]` `components/chat/types.ts`
  - `Message.user` 加 `hidden?: boolean`；`ChatAction.SEND_MESSAGE` 加 `hidden?: boolean`；`ChatContextValue.sendMessage` 签名加 `options?: { hidden?: boolean }`。
- `[CHANGED]` `contexts/ChatContext.tsx` + `components/chat/hooks/useSSE.ts`
  - `SEND_MESSAGE` reducer 写入 `hidden` 字段；`useSSE.sendMessage` 接受 `options?.hidden` 并沿 dispatch 透传。

#### 验证
| 验证项 | 方式 | 结果 |
|---|---|---|
| TS/Lint | `docker exec … npm run lint` | ✅ 通过 |
| 「search online for ZA Bank CEO」静默 check online | Agent 端 SSE 回路 | ✅ 不再出 `[offer_web_search]`；按钮点击后历史里落一条 hidden 用户消息但界面不渲染 |

---

### v2 `[NEW]` T5 后续：Owners 进边框 / Chips 恢复横向滚动 / Context 卡片更醒目

#### 背景
v1 发布后收到同事反馈：
1. Establishment 悬停边框**仍未包住 Owners**（仅到 founder 就结束）。
2. Chatbot 内部的 Context 组件卡片与普通消息气泡**区分度不够**，不像「上下文注入」。
3. 建议 chips 容器采用 `flex-wrap`，数量多时会一次挤到整面，把消息挤到顶端看不清；chips 与消息之间的那条**分隔线**也显多余。
4. `[offer_web_search]` 的 Check online 按钮只发 `Yes, please…`，丢了原始问题，planner 找不到主题；且 `ask` 模式下即便用户后续明确同意也不会触发 `web_search`。

#### 变更
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - 将 Owners 区段 **移到 `.overviewEstablishmentSection` 内部**，使 `:has(> .botIcon:hover)` 流动边框同时覆盖 establishedTime / founder / Owners。
  - 机器人 `injectContext` payload 增加 `owners`（`name (percent%)` 列表），同步传给 chatbot。
- `[NEW]` `components/chat/chat.module.css`
  - `.chipsContainer`：`flex-wrap: nowrap` + `overflow-x: auto`（细滚动条样式），**去掉 `border-top`**，恢复旧横向滚动设计。多 chip 不再挤压消息区。
  - `.suggestionChip`：`white-space: nowrap` + `flex-shrink: 0`（配合单行滚动）；视觉样式保持不变（用户只要旧容器行为，不改 chip 外观）。
  - `.messageBubbleContext`：新增左侧 3px 绿色 accent bar（`::before`）、14% 绿色底 + 45% 绿色描边 + 柔和阴影；`.contextSummary` 标题着色并把回形针图标改为主题色，让 context 气泡一眼可辨。
- `[NEW]` `components/chat/MessageBubble.tsx`
  - Check online 按钮现在会拼接**最近一条用户消息**：`Yes, please check online and attach the source URLs for: <原问题>`，规避无主题调用 `web_search` 的情况。

#### 验证
| 验证项 | 命令 / 操作 | 结果 |
|---|---|---|
| TypeScript | `npx tsc --noEmit` 过滤 `__tests__` | ✅ 0 新错误 |
| 悬停边框 | `/bank-info/demo-bank/overview` 悬停图标 | ✅ 流动边框同时包住子标题 + 成立时间 + 创始人 + Owners |
| Chips 多项 | `sendMessage` 后返回 6+ 建议 | ✅ 单行横向滚动，不再把消息顶上去；已无分割线 |
| Context 卡片 | 任一注入 | ✅ 绿色 accent bar + 描边 + 浅底，视觉区分明显 |
| Check online | v1 问 CEO → 收到 offer → 点按钮 | ✅ 发出「Yes, please check online…: What is the background of the CEO of ZA Bank」，planner 调用 `web_search`，返回 Calvin Ng 相关结果 + 来源 |

#### 风险与后续
- 细滚动条样式在 Firefox 走 `scrollbar-width/color`，其余走 webkit 伪元素。
- Context 卡片的绿色主题继承 `--chatbot-soft-green` 变量；若后续主题切换需同步调整。
- Agent 侧已配套发布 v1：planner 在 `ask` 模式下检测到用户明确同意会走 auto 路径。

---

### v1 `[NEW]` T5 可靠性徽章 UI + P3 复修 + 聊天框专业度打磨

#### 背景
承接 Agent 侧 T5（statements 带 reliability 字段），以及同事对 P3「机器人图标位置 / 悬浮边框范围」的二次反馈：
1. Establishment 小节的图标不应与标题行内放置——这样会扰动整个卡片的布局。图标应在整个小节的**右上角**。
2. 悬停边框应环绕「子标题 + 下方内容」整个区块，不止是文字 `Establishment`。
3. 聊天框：展示搜索提供商（via Wikipedia / DuckDuckGo / Playwright scrape / …），5 级徽章视觉分层，建议 chips 与上下文卡片更贴近 Linear/Stripe 的专业感——「fancy 但不过度」。

#### 变更
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - Establishment 小节用新 `.overviewEstablishmentSection` 容器包住（subtitle + establishedTime + founder）；机器人按钮移回绝对定位，落在容器右上角；容器再挂 `chatStyles.botIconContainer`，让 `:has(> .botIcon:hover)` 的流动边框描绘**整个小节**。
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/overview.module.css`
  - 新增 `.overviewEstablishmentSection { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }`。
- `[NEW]` `components/chat/chat.module.css`
  - 删除上一版的 `.botIconInline`（P3 改回绝对定位后不再需要）。
  - 新增 5 级 tier 配色变量（`--tier-fg / --tier-bg / --tier-border`）：`verified` 绿 / `official` 蓝 / `reference` 琥珀 / `web` 橙 / `ai_generated` 红，统一驱动徽章、悬浮提示、来源脚注小圆点颜色。
  - 新增 `.reliabilityBadge`、`.reliabilityTooltip`（CSS 纯 hover，含上至 3 条来源与 +N more）、`.sourcesFooter`、`.offerWebSearchBtn`、`.suggestionChip`（语义 `<button>`，替代原 antd Tag）、`.assistantActions` 复制/导出；Assistant 气泡统一加柔软阴影与悬停微提升，向 Linear/Stripe 的调性靠拢。
- `[NEW]` `components/chat/types.ts`
  - 新增 `ReliabilityTier / ReliabilitySource / ReliabilityEnvelope / AssistantSegment`；给 assistant `Message` 和 `SSE_RESPONSE` action 挂上可选 `reliability`。
- `[NEW]` `contexts/ChatContext.tsx`
  - `SSE_RESPONSE` 把 Agent 侧下发的 `reliability` 透传写入 assistant message。
- `[NEW]` `components/chat/ReliabilityBadge.tsx`
  - 5 级图标（`SafetyCertificate / Bank / Book / Global / Experiment`），`compact` 模式用于气泡角标；hover 浮层展示标签 + 来源（含 provider 与链接）。
- `[NEW]` `components/chat/SourcesFooter.tsx`
  - 消息正文底部紧凑来源列表：小圆点按 tier 着色、域名 + 链接，并提示 `via {provider}`。
- `[NEW]` `components/chat/MessageBubble.tsx`
  - 识别 LLM 返回中的 `[offer_web_search]` 标记，剥离后显示「Check online」按钮；点击会自动发送 `Yes, please check online and attach the source URLs.` 走下一轮 auto 流程。
  - 右上角渲染 compact 徽章；底部渲染 `SourcesFooter`。
- `[NEW]` `components/chat/SuggestedChips.tsx`
  - 用语义 `<button>` 与 `.suggestionChip` 替代 antd Tag，获得平台一致的交互反馈。

#### 验证
| 验证项 | 命令 / 操作 | 结果 |
|---|---|---|
| TypeScript 编译 | `npx tsc --noEmit` 过滤非 `__tests__` 文件 | ✅ 新代码 0 错误（`__tests__/` 原有 testing-library 噪声维持不变） |
| 徽章/浮层交互 | 手动悬停 Verified/Official/Reference/Web/AI-generated 气泡 | ✅ 颜色与层级正确；+N more 计数正确 |
| Establishment 区域 | `/bank-info/demo-bank/overview` 悬停机器人图标 | ✅ 流动边框完整包住子标题 + 成立时间 + 创始人 |
| Offer 模式 | 未接入 DB 的问题（如 CEO 背景） | ✅ 返回 `Check online` 按钮；点击触发下一轮 auto 搜索 |

#### 风险与后续
- Per-segment 徽章（`AssistantSegment`）已在 `types.ts` 铺好脚手架，但当前 planner 仍是单段文本；前端先渲染「整句徽章 + 来源脚注」，planner 支持分段输出后再点亮。
- `:has()` 依赖现代浏览器（Chrome 105+ / Safari 15.4+ / Firefox 121+），旧浏览器降级为边框不显示。
- 徽章与成立时间小节同样受 `.botIconContainer:has(> .botIcon:hover)` 控制，不会与徽章 hover 混触。

---

## 2026-04-15

### v2 `[NEW]` P2/P3/P4 Chatbot 入口点 UX 修复（产品高亮注入 / 成立时间图标位置 / 悬浮边框）

#### 背景
发布 v1 后，同事反馈三个 UX 问题：
1. 点击产品 Highlight 组件的机器人图标，注入到 chatbot 的信息不完整（缺产品链接、描述、feature/benefit、标签等）。
2. Overview 页 Establishment 小节的机器人图标定位异常，与 About 卡片的图标重叠。
3. 任一组件被悬停时就会整块亮起彩色边框，意图不清；希望收窄为「只在悬停机器人图标时出现」并带动感光效。

#### 目标
- 让 Chatbot 在产品页能拿到足够的上下文，不再只靠少量字段重复卡片内容。
- 修掉 Overview 页两个机器人图标同时绝对定位（`top:8px right:8px`）互相压盖的布局问题。
- 重做悬停边框：仅机器人图标自己被悬停时触发，配一圈「红→琥珀→绿→蓝→紫→红」的流动渐变。

#### 变更
- `[NEW]` `app/(default)/bank-info/[sortId]/products/page.tsx`
  - `InnovativeProducts` 注入 payload 扩展：`productLink / description / features / benefits / clientTagText / innovative / customerSegment`（后者走 `resolveCustomerSegment` 兜底）。
  - `Highlights` 加入 `useBankContext`，附带 `bankName`，并把 `productsByType` 的 `ProductCard` 全字段注入 chatbot，避免「只看得到名字」的情况。
- `[NEW]` `app/(default)/bank-info/[sortId]/overview/page.tsx`
  - Establishment 小节按钮追加 `chatStyles.botIconInline`，配合新 CSS 切成行内摆放，不再与 About 图标重叠。
- `[NEW]` `components/chat/chat.module.css`
  - 新增 `.botIconInline`：`position: static; width/height: 20px; margin-right: 6px; vertical-align: middle;`，供子标题行内场景使用。
  - 替换原 `.botIconContainer:hover` 外描边为 `::before` 伪元素 + `mask-composite` 空心渐变环；`background-size: 300%` + `chatBorderFlow` 4s 线性循环，默认 `animation-play-state: paused`，只在 `.botIconContainer:has(> .botIcon:hover)` 时切换为 `running / opacity: 1`，用直接子选择器避免嵌套容器交叉触发。

#### 验证
| 验证项 | 命令 / 操作 | 结果 |
|---|---|---|
| Lint（新改两文件） | `npm run lint` 过滤 `overview/page` 与 `products/page` | ✅ 未引入新错误（历史 lint 噪声保持不变） |
| `:has()` 支持 | Chrome 105+ / Safari 15.4+ / Firefox 121+ | ✅ 当前浏览器矩阵可用 |

#### 风险与后续
- `:has()` 在较老浏览器降级为「边框不出现」，机器人图标行为本身不受影响。
- 如需 IE/旧浏览器支持，可退回 JS 监听 hover 实现。
- 下一步进入 T5（在线搜索兜底 + 可靠性徽章），会进一步影响 chatbot 响应样式，届时统一审视边框/徽章视觉一致性。

---

### v1 M4 客户分层：产品页零售/对公 Tab + 段位解析工具

#### 目标
1. 在银行详情 - 产品页新增 Retail / Corporate / All 切换。
2. 给 `ProductCard` 引入 `customerSegment` 字段，并提供 `resolveCustomerSegment()` 兜底（向后兼容 `clientTag`）。
3. 更新 demoBank 样本，便于无后端场景直接体验段位切换。

#### 变更
- 模型：`app/model/company/company.ts`
  - `ProductCard` 增加 `customerSegment?: 'retail' | 'corporate'`；
  - 新增 `CustomerSegment` 类型（`'all' | 'retail' | 'corporate'`）；
  - 新增 `resolveCustomerSegment()`：优先读取 `customerSegment`，缺失时按 `clientTag` 映射（与 Agent 端 `client_tag -> customer_segment` 保持一致）。
- 页面：`app/(default)/bank-info/[sortId]/products/page.tsx`
  - `ProductLists` 持有 segment 状态，渲染 tablist（All / Retail / Corporate）；
  - `RenderProductList` 接收 `segment` prop，客户端按 `resolveCustomerSegment` 过滤；
  - 产品类型 summary 开关按 segment 映射（retail→Personal，corporate→Coroprate，all→任一）；
  - 过滤后若为空但原始列表有内容，展示 "No {segment} products in this category." 提示。
- 样式：`products.module.css`
  - 追加 `.segmentTabs`/`.segmentTab`/`.segmentTabActive`/`.segmentEmpty` 规则。
- Mock：`app/mock/demoBank.ts`
  - 为 5 个示例产品补齐 `customerSegment`（Nova Account / Card / Save → retail；Nova SME Hub / Flex Credit → corporate）。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ M4 相关文件 0 错（现存历史报错与本次无关） |
| Playwright 冒烟 | `/bank-info/demo-bank/products` 渲染并切换 tab | ✅ tablist 可见、点击可切换 |

关联：与 Agent 侧 commit `4f49f5c`（M4 意图/Planner 接线）共同构成 T4 M4 的前后端闭环。

## 2026-04-13

### v1 demo-bank、CI/CD 与容器验证

#### 目标
1. 保持 Chatbot 演示链路可用（demo-bank 无后端依赖）。
2. 修复并加固前端 CI/CD。
3. 在 Docker 环境内完成可运行验证。

#### 关键提交
| 提交 | 说明 |
|---|---|
| `8d3fa92` | 增加 demo-bank chatbot fallback 文档 |
| `3370c88` | 增加 demo-bank 前端数据回退链路 |
| `6eabbd2` | deploy workflow 调整 |
| `942dd47` | CI 缺失 test script 场景修复 |
| `4380ad9` | `__tests__` 仅本地保留策略 |
| `b68bc15` | 合并 main 新特性 |

#### 变更要点
1. 新增 demo-bank 假数据路由，支持无后端时 Chatbot 上下文卡片演示。
2. 文档补充 demo-bank URL 与上下文字段说明。
3. CI/CD 继续加固，避免无 `test` script 场景直接失败。

### v2 Node 版本排障与修复（容器）

#### 根因分析
| 项目 | 结果 |
|---|---|
| Next.js 版本 | `14.2.33` |
| Next.js 官方要求 | Node.js `>=18.17.0` |
| 容器默认版本（原） | Node `v12.22.9`（不满足要求） |

#### 修复动作
1. 使用容器内已安装的 `nvm` Node 新版本（`v24.14.1`）。
2. 将 `/usr/local/bin/node|npm|npx` 指向 nvm 版本，避免继续落到 `/usr/bin/node v12`。
3. 修复容器 DNS 解析（将 `/etc/resolv.conf` nameserver 调整为 `8.8.8.8` / `1.1.1.1`），解除构建阶段 Google Fonts 拉取失败。

#### 验证结果
| 验证项 | 命令 | 结果 |
|---|---|---|
| 版本检查 | `docker exec my-ubuntu-dev bash -lc 'node -v; npm -v'` | ✅ `v24.14.1 / 11.11.0` |
| 构建链路（跳过 lint） | `npm run build -- --no-lint` | ✅ 成功完成 Next.js 生产构建 |
| Lint | `npm run lint` | ⚠️ 触发现有代码库历史 lint 问题（非 Node 版本问题） |

#### 结论
- “Node 版本不兼容导致前端命令直接失败”的问题已修复。
- 当前剩余事项为：仓库历史 lint 负债（与本次 Node 版本问题无关）。

### v3 刷新 500（@clerk vendor chunk 缺失）修复

#### 问题现象
- 页面刷新后返回 500：
  - `Error: Cannot find module './vendor-chunks/@clerk.js'`
  - 发生路径：`/bank-info/[sortId]/overview`。

#### 根因
1. 运行中的 `next dev` 进程持续存在时，`.next/server` 被其它构建流程覆盖，导致运行时引用与实际 vendor chunk 文件不一致。
2. 故障时 `.next/server/vendor-chunks` 中不存在 `@clerk.js`，但 `webpack-runtime.js` 仍引用该 chunk。

#### 修复动作
1. 停止旧的 `next dev` 进程（指定 PID）。
2. 清理 `.next` 缓存目录。
3. 重新启动前端开发服务并等待就绪。

```bash
docker exec my-ubuntu-dev bash -lc 'kill <NEXT_DEV_PID>'
docker exec my-ubuntu-dev bash -lc 'cd /workspace/repos/neobanker-frontend-MVP-V3 && rm -rf .next && nohup npm run dev > /workspace/logs/frontend-dev.log 2>&1 &'
```

#### 回归验证
- 对 12 条关键路由做 3 轮刷新请求（共 36 次），全部 `200`，未再出现 `@clerk` chunk 缺失报错。
- 10 次连续刷新 `bank-info/demo-bank/overview`：全部 `200`。

### v4 开发脚本日志路径对齐（Agent）

#### 变更
- 更新 `dev-docker.sh` 中 Agent 启动段：
  1. 默认运行日志写入 `neobanker-agent/logs/runtime/agent.log`
  2. PID 文件写入 `neobanker-agent/logs/runtime/agent.pid`
  3. 默认会话日志目录设置为 `neobanker-agent/logs/sessions`
  4. 兼容保留 `/workspace/logs/agent.log|agent.pid` 软链接
  5. 首次执行时自动迁移旧路径日志到新目录

#### 影响
- 统一了日志归档位置，便于“代码 + 日志”同仓库排障与归档。
- 旧排查命令仍可通过软链接继续使用。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| 脚本语法检查 | `bash -n dev-docker.sh` | ✅ 通过 |

### v5 Chatbot 会话持久化与历史搜索增强

#### 目标
1. 刷新页面后保留当前会话，不再丢失聊天内容。
2. 提升上下文连续性，降低追问时 context 卡片信息丢失概率。
3. 提供会话内历史搜索能力，便于快速定位长对话内容。

#### 变更
- `contexts/ChatContext.tsx`
  - 新增本地持久化：`localStorage(neobanker_chat_state_v1)`。
  - 启动时自动恢复 `conversationId/messages/suggestions`。
  - 自动清理流式中间态（恢复后固定 `status=idle`）。
  - 新增会话归档能力：支持 `New chat` 后归档旧会话并可回看切换。
  - 新增交互路径记录：`context_click / user_message / assistant_response`。
- `components/chat/hooks/useSSE.ts`
  - 历史构建从“固定最近 20 条”升级为“最近消息 + 关键 context 保留”策略。
  - 请求中追加最近交互路径摘要（context role），增强上下文连续性。
- `components/chat/ChatPanel.tsx` + `components/chat/chat.module.css`
  - 新增会话搜索框，支持按关键字过滤 user/assistant/context 消息。
  - 新增会话工具栏（`New chat` + 归档会话下拉切换 + 命中归档快速跳转）。
- `components/chat/MessageBubble.tsx` + `components/chat/chat.module.css`
  - Assistant 消息新增 `Export` 按钮，可下载当前回答为 Markdown 文件。
- 文档：
  - `docs/environment-setup.md` 新增“Chatbot 会话持久化与搜索（开发增强）”章节。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| 前端构建（含TS检查） | `docker exec my-ubuntu-dev ... npm run build -- --no-lint` | ✅ 通过 |
| 前端首页可用性 | `curl -I http://127.0.0.1:3000/homepage` | ✅ `200 OK` |

### v6 页面样式丢失回归修复（运行态）

#### 现象
- 页面退化为接近“纯文本列式”显示，视觉样式基本丢失。

#### 根因
- 前端 `next dev` 运行态 `.next` 产物损坏/错配，导致关键 chunk 丢失：
  - `Cannot find module './584.js'`
  - `Cannot find module './682.js'`
- 因 chunk 加载失败，页面落入错误回退路径，样式资源无法正常加载。

#### 修复动作
1. 停止当前 `next dev` 进程（PID 定点终止）。
2. 删除前端 `.next` 缓存目录。
3. 重启 `npm run dev` 并等待编译完成。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| `/homepage` 连续访问 | `curl -m 20 -w "%{http_code}" .../homepage` ×6 | ✅ 全部 `200` |
| `/bank-info/demo-bank/overview` 连续访问 | `curl -m 20 -w "%{http_code}" .../overview` ×6 | ✅ 全部 `200` |
| 错误回退检查 | HTML 中 `\"statusCode\":500` | ✅ 未出现 |
| CSS 资源加载 | `/_next/static/css/...` | ✅ 关键样式资源全部 `200` |

### v7 Chat 交互精修（会话栏、默认引导、复制/条件导出）

#### 目标
1. 简化并美化 `Current/New/Search` 区域，占位更小，颜色改为浅暖红。
2. 修复聊天打开后无自我介绍提示的问题。
3. 调整消息操作：所有回答都可复制；仅结构化表格回答显示导出。

#### 变更
- `components/chat/ChatPanel.tsx`
  - 会话控制区重构为紧凑单行：
    - `New` 图标按钮
    - `Current` 会话下拉
    - 搜索框（带搜索图标）
    - 命中计数徽标
  - 移除占位较大的归档命中按钮列表，保留核心搜索/切换能力。
- `components/chat/chat.module.css`
  - 新增紧凑会话栏样式（浅暖红）：`compactToolbar*` 系列。
  - 新增空会话引导卡样式：`introCard` / `introTitle` / `introText`。
  - Assistant 操作按钮统一为 `assistantActionBtn`（支持复制+导出并排）。
- `components/chat/ChatMessages.tsx`
  - 在“无消息且非流式”状态下显示默认引导：
    - `👋 你好，我是 Neobanker Assistant。`
    - 提示可问领域与“先注入上下文”入口。
- `components/chat/MessageBubble.tsx`
  - 新增 `Copy`（全量 assistant 回答可用）。
  - `Export` 改为条件显示：仅当回答内容命中 Markdown 表格结构时展示。
  - 新增表格检测函数 `containsMarkdownTable`。
- 测试补充（本地测试资产）：
  - `__tests__/MessageBubble.test.tsx` 增加 copy/export 断言；
  - `__tests__/ChatMessages.test.tsx` 增加默认引导断言。

#### 运行态修复与验证
- 复现到 `.next` 运行产物再次错配（`@clerk` vendor chunk 缺失）后，执行：
  1. 定点终止 `next dev` 进程；
  2. 删除 `.next`；
  3. 重启前端服务。
- 验证：
  - `curl http://127.0.0.1:3000/homepage` -> ✅ `200`
  - `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` -> ✅ `200`

### v8 Chat 控件细节优化（图标化、悬停搜索、主题红、建议换行）

#### 目标
1. `copy/stop` 改为纯图标按钮，悬停提示功能说明。
2. 顶部会话控件补齐 tooltip，并让搜索框按“悬停放大/离开收起”交互运行。
3. 将会话栏与输入相关红色调整为更鲜明主题红。
4. 去掉建议问题横向滚动条，改为多行自动换行。

#### 变更
- `components/chat/ChatPanel.tsx`
  - 顶部 `New/Session/Search/Count` 全部补齐 tooltip。
  - 搜索交互改为：
    - 默认仅显示放大镜图标；
    - hover/focus/click 图标后展开输入框并自动聚焦；
    - 鼠标移出或输入框失焦后收起。
- `components/chat/ChatInput.tsx`
  - `Stop` 改为图标按钮（无文字），使用 tooltip 提示。
- `components/chat/MessageBubble.tsx`
  - `Copy/Export` 操作改为图标按钮（无文字），使用 tooltip 提示。
- `components/chat/SuggestedChips.tsx` + `components/chat/chat.module.css`
  - 建议标签允许换行，容器取消横向滚动。
- `components/chat/chat.module.css`
  - 会话栏与输入关键控件色系改为更鲜明红色（`#ef4444` 系列）。
  - 搜索框新增展开/收起动画样式（`compactSearchInputWrap*`）。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| 前端改动文件定向 lint | `npx next lint --file components/chat/ChatPanel.tsx --file components/chat/ChatInput.tsx --file components/chat/MessageBubble.tsx --file components/chat/SuggestedChips.tsx` | ✅ 通过 |
| 路由可用性 | `curl http://127.0.0.1:3000/homepage` | ✅ `200` |
| 路由可用性 | `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` | ✅ `200` |

### v9 搜索导航与高亮体验升级

#### 目标
1. 解决“搜索框空输入时鼠标移开仍不收起”的交互问题。
2. 增加搜索结果定位能力（首条定位、高亮、上下跳转、当前/总数）。
3. 将 `match` 展示从“错误感红点”改为中性导航样式。

#### 变更
- `components/chat/ChatPanel.tsx`
  - 搜索框收起规则调整：
    - 若搜索词为空，鼠标移出即收起并移除焦点；
    - 输入框失焦且为空时也收起。
  - 新增搜索导航：
    - 自动定位到第一个匹配项；
    - `上一条/下一条` 按钮跳转匹配结果；
    - 显示 `当前/总匹配`（如 `2/7`）。
  - 无搜索词时，右侧改为会话消息总数指示（不再显示 match 圈）。
- `components/chat/ChatMessages.tsx`
  - 新增高亮定位能力：
    - 当前匹配消息高亮边框；
    - 切换匹配时自动滚动到该消息。
- `components/chat/chat.module.css`
  - 新增搜索导航与匹配高亮样式（`searchNavigator/searchNavBtn/searchMatchActive`）。
  - `match` 徽标改为中性风格，去除“错误态”视觉感。

#### 验证
| 验证项 | 命令 | 结果 |
|---|---|---|
| 前端改动文件定向 lint | `npx next lint --file components/chat/ChatPanel.tsx --file components/chat/ChatMessages.tsx --file components/chat/ChatInput.tsx --file components/chat/MessageBubble.tsx --file components/chat/SuggestedChips.tsx` | ✅ 通过 |
| 路由可用性 | `curl http://127.0.0.1:3000/homepage` | ✅ `200` |
| 路由可用性 | `curl http://127.0.0.1:3000/bank-info/demo-bank/overview` | ✅ `200` |
