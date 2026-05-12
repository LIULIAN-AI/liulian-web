# M3.1 AI Assistant Page — 功能测试指南

> **入口**: `http://localhost:3000/assistant`
>
> **前置条件**: `npm run dev` 运行中（端口 3000）

---

## 目录

- [1. 页面加载与默认状态](#1-页面加载与默认状态)
- [2. 三种工作模式切换](#2-三种工作模式切换)
- [3. 聊天面板](#3-聊天面板)
- [4. BI 图表系统（5 种图表）](#4-bi-图表系统5-种图表)
- [5. 银行快照 Widget](#5-银行快照-widget)
- [6. AI 建议 Widget](#6-ai-建议-widget)
- [7. Session 侧边栏](#7-session-侧边栏)
- [8. Inline Chat（Widget 内聊天）](#8-inline-chatwidget-内聊天)
- [9. Canvas 编排器（自动 Widget）](#9-canvas-编排器自动-widget)
- [10. 键盘快捷键](#10-键盘快捷键)
- [11. Widget 拖拽与布局](#11-widget-拖拽与布局)
- [12. Widget 关闭与固定](#12-widget-关闭与固定)

---

## 1. 页面加载与默认状态

**测试步骤**:
1. 访问 `http://localhost:3000/assistant`
2. 等待页面加载完成

**预期结果**:
- 左侧：聊天面板（含输入框、消息历史）
- 右侧：Canvas 区域，显示 4 个默认 Widget：
  - AI Suggestions（左上）
  - Bank Snapshot（右上）
  - BI Chart（左下）
  - Comparison（右下，显示 "即将上线"）
- 顶部 Canvas 工具栏显示 "工作区 / 沉浸式 / 画布焦点" 三个 Tab
- 左边缘：Session 侧边栏图标条（☰、+、🔍、数字）

**相关文件**: `app/(assistant)/assistant/page.tsx`

---

## 2. 三种工作模式切换

### 2a. 工作区模式（Workspace）— 默认

**测试步骤**: 点击 Canvas 工具栏的 "工作区" Tab

**预期结果**: 左右分栏布局 — 聊天面板 + Canvas 并排显示

### 2b. 沉浸模式（Immersive）

**测试步骤**: 点击 "沉浸式" Tab

**预期结果**:
- Canvas 消失，聊天面板全屏居中（最大宽度 900px）
- 顶部仍显示模式切换 Tab
- 过渡动画：150ms 淡入淡出

### 2c. 画布焦点模式（Canvas Focus）

**测试步骤**: 点击 "画布焦点" Tab

**预期结果**:
- 聊天面板消失，Canvas 全屏显示
- 所有 Widget 占满整个页面
- 可通过 Widget 上的 💬 按钮使用 Inline Chat

**相关文件**: `app/(assistant)/assistant/page.tsx`（ModeSwitcher 组件）

---

## 3. 聊天面板

### 3a. 发送消息

**测试步骤**:
1. 在输入框输入文字
2. 按 Enter 或点击发送按钮

**预期结果**: 消息出现在聊天区域，AI 流式回复

### 3b. 上下文卡片

**测试步骤**: 在 demo-bank 路由下发送消息

**预期结果**: 用户消息上方显示 "已附加上下文 — 关于 Nova Horizon Bank (Demo)" 卡片

### 3c. Inline Chat 链接

**测试步骤**: 查看 AI 回复消息

**预期结果**: 消息下方显示 "Inline-chat >" 链接（点击可跳转到对应 Widget）

**相关文件**: `components/chat/ChatPanel.tsx`

---

## 4. BI 图表系统（5 种图表）

**位置**: Canvas 区域的 "BI Chart" Widget

### 4a. 分组柱状图（Grouped Bar）

**测试步骤**: Widget 默认显示此图表（或点击 "Grouped Bar" chip）

**预期结果**:
- 标题: "HK Digital Banks — Key Metrics Comparison"
- 6 家银行（HSBC HK、StanChart、BEA、ZA Bank、Mox、Airstar）
- 3 色柱状图：Revenue（红）、Assets（蓝）、Deposits（绿）
- 底部显示图例

### 4b. 折线图（Line）

**测试步骤**: 点击 "Line" chip

**预期结果**:
- 标题: "Nova Horizon Bank — Financial Trend (FY2020–2025)"
- 4 条曲线：Profit Margin、ROE、ROA、Cost/Income
- X 轴：2020→2025，Y 轴自适应
- Cost/Income 从 112% 下降到 58%（绿线），Profit Margin 从 -12% 上升到 18%（红线）

### 4c. 雷达图（Radar）

**测试步骤**: 点击 "Radar" chip

**预期结果**:
- 标题: "Bank Health Profile — Nova Horizon vs Peer Avg"
- 六维蛛网图：Profit Margin、ROE、Asset Quality、Capital Adequacy、Liquidity、Cost Efficiency
- 红色区域（Nova Horizon）vs 灰色区域（Peer Average）
- 0-100 分刻度

### 4d. 环形图（Donut）

**测试步骤**: 点击 "Donut" chip

**预期结果**:
- 标题: "Product Portfolio — By Type"
- 5 个扇区：Deposit 33%、Card 25%、Loan 21%、Account 13%、Insurance 8%
- 中空环形设计，带百分比标签
- 底部彩色图例

### 4e. 面积图（Area）

**测试步骤**: 点击 "Area" chip

**预期结果**:
- 标题: "Cumulative Funding — Nova Horizon Bank (USD M)"
- X 轴：Seed → Series A → Series B → Series C → Series D
- 面积填充从 5M 增长到 490M
- 红色线条 + 浅红色半透明填充

### 4f. 图表/表格切换

**测试步骤**: 点击 Widget 右上角的 📋 按钮

**预期结果**: 切换为数据表格视图（带表头、斑马条纹行）

**相关文件**: `components/assistant/widgets/BIChartWidget.tsx`, `components/assistant/widgets/ChartRenderer.tsx`, `components/assistant/widgets/chartMockData.ts`

---

## 5. 银行快照 Widget

**位置**: Canvas 右上角 "Bank Snapshot"

### 5a. 无银行选中状态

**测试步骤**: 直接访问 `/assistant`（不通过 bank-info 页面）

**预期结果**: 显示 🏦 图标 + "未选择银行" 空状态

### 5b. 有银行数据状态

**测试步骤**: 先访问 `/bank-info/demo-bank/overview`，再切换到 `/assistant`

**预期结果**:
- 显示银行名称（Nova Horizon Bank）
- 📍 位置（Hong Kong）
- 状态指示点 + 状态文字
- 标签列表（Digital Bank、SME Focus、Retail）
- 🌐 网站链接

**相关文件**: `components/assistant/widgets/BankSnapshotWidget.tsx`

---

## 6. AI 建议 Widget

**位置**: Canvas 左上角 "AI Suggestions"

**测试步骤**: 查看建议列表

**预期结果**: 3 条建议（图标 + 文字），如：
- 🔍 Search for a bank to analyze
- 🏛️ Compare digital banks in Hong Kong
- 🌐 Show market overview

**交互测试**: 点击任一建议

**预期结果**: 建议文字自动发送到聊天面板

**相关文件**: `components/assistant/widgets/AISuggestionsWidget.tsx`

---

## 7. Session 侧边栏

### 7a. 图标栏

**位置**: 页面最左边的窄图标条

**测试步骤**: 观察图标条

**预期结果**: 从上到下：☰ 展开按钮、+ 新聊天、🔍 搜索、分割线、数字 1-4（会话列表）、⚙ 设置

### 7b. 展开侧边栏

**测试步骤**: 点击 ☰ 按钮

**预期结果**:
- 侧边栏从左侧滑出（弹簧动画）
- 显示 "Neobanker 智能助手" 标题
- 当前会话信息
- 历史会话列表（带日期和标题摘要）

### 7c. 收起侧边栏

**测试步骤**: 点击侧边栏外的遮罩区域 或 点击关闭按钮

**预期结果**: 侧边栏滑回收起

**相关文件**: `components/assistant/SessionSidebar.tsx`

---

## 8. Inline Chat（Widget 内聊天）

**测试步骤**:
1. 点击任意 Widget 标题栏的 💬 按钮
2. 在弹出的输入框中输入问题
3. 按 Enter 发送

**预期结果**:
- Widget 上方出现半透明遮罩 + 底部输入栏
- 输入栏显示 "Context: {Widget 标题}"
- 输入文字后按 Enter：消息连同 Widget 上下文一起发送到聊天
- 输入栏自动关闭

**关闭方式**: ESC 键 / 点击遮罩 / 发送消息后自动关闭

**相关文件**: `components/chat/InlineChat.tsx`

---

## 9. Canvas 编排器（自动 Widget）

**测试步骤**:
1. 在聊天中发送包含触发词的消息，如 "compare HSBC and BEA"
2. 观察 Canvas 区域

**预期结果**: Canvas 自动添加对应的 Widget（如 bi-chart 或 comparison-table）

**触发词对照表**:
| 关键词 | 触发 Widget |
|--------|------------|
| compare, rank, chart | BI Chart |
| compare, versus, vs | Comparison Table |
| product, products | Product List |
| news, update | News Feed |
| management, director, ceo | Management List |
| report | Report Preview |

**注意**: 同类型 Widget 不会重复添加；Canvas 最多 4 个 Widget（超出时自动移除优先级最低的）

**相关文件**: `components/assistant/CanvasOrchestrator.tsx`

---

## 10. 键盘快捷键

| 快捷键 | 功能 | 测试方法 |
|--------|------|---------|
| `Cmd/Ctrl + Shift + W` | 切换到工作区模式 | 在任意模式下按此组合键 |
| `Cmd/Ctrl + Shift + F` | 切换到沉浸模式 | 同上 |
| `Cmd/Ctrl + Shift + C` | 切换到画布焦点模式 | 同上 |

**注意**: 在输入框聚焦时快捷键不生效（避免与文字输入冲突）

**相关文件**: `components/assistant/hooks/useKeyboardShortcuts.ts`

---

## 11. Widget 拖拽与布局

**测试步骤**:
1. 将鼠标移到两个 Widget 之间的分隔线上
2. 拖动分隔线

**预期结果**: Widget 大小实时调整，松手后保持新布局

**布局规则**:
- 1 个 Widget: 全屏
- 2 个 Widget: 左右 50/50
- 3 个 Widget: 左 50% + 右侧上下各 50%
- 4+ 个 Widget: 2x2 网格

**相关文件**: `components/assistant/DynamicCanvas.tsx`（react-mosaic-component）

---

## 12. Widget 关闭与固定

### 12a. 关闭 Widget

**测试步骤**: 点击 Widget 右上角 ✕ 按钮

**预期结果**: Widget 从 Canvas 移除，剩余 Widget 自动重新布局

### 12b. 固定 Widget（Pin）

**功能说明**: Widget 可被标记为 "固定"，固定后不会被自动移除（Canvas 编排器不会驱逐 pinned widget）

**相关文件**: `components/assistant/widgets/WidgetShell.tsx`

---

## Mock 数据说明

所有图表使用的 demo 数据位于 `components/assistant/widgets/chartMockData.ts`，字段名对齐后端 API DTO：

| 图表 | 对应后端接口 | Mock 数据内容 |
|------|-------------|-------------|
| Grouped Bar | `GET /financials/{id}/getFinancials` | 6 家 HK 银行：revenue、assets、deposits |
| Line | `GET /financials/getListById` | FY2020-2025 财务指标：profitMargin、ROE、ROA、costToIncomeRatio |
| Radar | `GET /financials/{id}/getFinancials` | 6 维评分：利润率、ROE、资产质量、资本充足率、流动性、成本效率 |
| Donut | `POST /companyproduct/getProductByCompanyId` | 5 类产品分布：Deposit、Card、Loan、Account、Insurance |
| Area | `GET /ffunding/{id}/getFunding` | Seed→D 轮累计融资 |

接通后端后只需替换数据源（`chartMockData.ts` → API 调用），ChartRenderer 和 ChartSpec 接口无需修改。
