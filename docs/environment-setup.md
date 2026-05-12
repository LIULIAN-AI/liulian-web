# 环境变量配置指南

## 概述

本项目使用环境变量来管理不同环境的配置，包括API端点、认证密钥、缓存设置等。

## 环境变量文件

### 1. 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，包含以下配置：

```bash
# 后端API配置
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080

# Chatbot链路配置（默认直连Agent）
NEXT_PUBLIC_CHAT_TRANSPORT=agent
NEXT_PUBLIC_AGENT_BASE_URL=http://localhost:8000

# 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# 缓存配置
NEXT_PUBLIC_CACHE_DURATION=300000
NEXT_PUBLIC_CACHE_CLEANUP_INTERVAL=60000

# 性能配置
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_PREFETCH_DELAY=30

# 开发配置
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true

# 日志配置
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 2. 生产环境配置

对于生产环境，创建 `.env.production` 文件：

```bash
# 后端API配置
NEXT_PUBLIC_BACKEND_API_URL=https://api.neobanker.com

# Chatbot链路配置（生产可按需改为backend代理）
NEXT_PUBLIC_CHAT_TRANSPORT=backend
NEXT_PUBLIC_AGENT_BASE_URL=https://agent.neobanker.com

# 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret

# 缓存配置
NEXT_PUBLIC_CACHE_DURATION=600000
NEXT_PUBLIC_CACHE_CLEANUP_INTERVAL=300000

# 性能配置
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_PREFETCH_DELAY=50

# 生产配置
NODE_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false

# 日志配置
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

## 环境变量说明

### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_BACKEND_API_URL` | 后端API基础URL | `http://localhost:8080` |
| `NEXT_PUBLIC_CHAT_TRANSPORT` | Chatbot请求链路（`agent`直连 / `backend`代理） | `agent` |
| `NEXT_PUBLIC_AGENT_BASE_URL` | Agent服务基础URL（transport=agent时生效） | `http://localhost:8000` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk认证公钥 | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk认证私钥 | `sk_test_...` |

### 可选配置

| 变量名 | 说明 | 默认值 | 单位 |
|--------|------|--------|------|
| `NEXT_PUBLIC_CACHE_DURATION` | 缓存持续时间 | `300000` | 毫秒 |
| `NEXT_PUBLIC_CACHE_CLEANUP_INTERVAL` | 缓存清理间隔 | `60000` | 毫秒 |
| `NEXT_PUBLIC_API_TIMEOUT` | API请求超时时间 | `10000` | 毫秒 |
| `NEXT_PUBLIC_PREFETCH_DELAY` | 预加载延迟时间 | `30` | 毫秒 |
| `NEXT_PUBLIC_DEBUG_MODE` | 调试模式 | `true` | 布尔值 |
| `NEXT_PUBLIC_LOG_LEVEL` | 日志级别 | `info` | 字符串 |
| `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING` | 性能监控 | `true` | 布尔值 |

## 使用方法

### 1. 在代码中使用配置

```typescript
import { config } from '@/config/environment';

// 使用配置
const apiUrl = config.backendApiUrl;
const timeout = config.apiTimeout;
```

### 2. 配置验证

配置会在开发环境下自动验证，确保所有必需的配置项都已设置。

## 安全注意事项

1. **不要提交敏感信息**: `.env.local` 文件已添加到 `.gitignore`，不会被提交到版本控制
2. **使用环境变量前缀**: 客户端可访问的变量使用 `NEXT_PUBLIC_` 前缀
3. **生产环境密钥**: 确保生产环境使用正确的密钥和URL

## Frontend-Only Chatbot Demo Bank Mode (No Backend Bank API Required)

Use this mode when you need to demo or test chatbot context injection on bank overview cards, but the backend bank-info endpoints are unavailable.

### 1. Route and identity

- Demo route sortId: `demo-bank`
- Demo route companyId: `demo-bank` (auto-filled by layout when missing)
- Recommended URL:

```text
/bank-info/demo-bank/overview
```

### 2. Data source

All demo content comes from:

```text
app/mock/demoBank.ts
```

This fixture file provides deterministic data for:

- header
- about + application
- licensing/jurisdiction
- marketing strategy
- financial summary
- products
- similar banks

### 3. Runtime behavior

When the page is in demo-bank route:

1. `BankContext` loads demo header directly (no header API call)
2. marketing API helpers return demo IDs/content
3. overview blocks load fixture data instead of backend responses
4. chatbot context buttons still inject context cards as usual

### 4. Chatbot context tracing

Each injected context card now includes:

- `source: "frontend_snapshot"`
- `sortId`
- `companyId`

This allows downstream chat handling and logs to identify the exact page snapshot source.

### 5. Scope note

This fallback is intentionally targeted at bank **overview** demoability and chatbot context testing. It is not a production data path.

## Chatbot 会话持久化与搜索（开发增强）

为解决刷新后会话丢失、历史上下文断裂问题，当前前端增加了以下行为：

1. **会话本地持久化**  
   - 存储位置：浏览器 `localStorage`  
   - Key：`neobanker_chat_state_v1`  
   - 内容：`conversationId`、最近消息、追问建议  
   - 刷新页面后会自动恢复会话内容（流式中间态不会恢复，避免脏状态）

2. **上下文保留策略（发送给 Agent）**  
   - 历史拼接不再只取最近 20 条  
   - 会额外保留最近的 context 卡片消息，降低“后续追问丢上下文”的概率

3. **聊天历史搜索**  
   - Chat 面板顶部新增搜索框  
   - 支持按关键字过滤当前会话中的 user / assistant / context 消息

4. **会话归档与切换**  
   - 支持一键 `New chat` 创建新会话  
   - 旧会话自动归档在本地，可通过下拉框切换回看

5. **交互路径注入**  
   - 前端会记录 `context_click / user_message / assistant_response` 路径  
   - 发送请求时附带最近交互路径摘要，帮助 Agent 做上下文连续理解

6. **回答导出**  
   - Assistant 消息支持 `Export` 按钮  
   - 可将当前回答（含 references）下载为 Markdown 文件，便于复盘与共享

> 说明：该持久化是浏览器本地能力，适用于开发调试和单机体验增强；服务端长期归档仍以 Agent 会话日志为准。

## 部署配置

### GitHub Actions + SSH 部署（当前主流程）

前端 CI/CD 工作流在 `.github/workflows/deploy.yml`，策略为：

- `push` 到 `main` 或 `chatbot` 时都会先跑验证（type-check + tests + build）
- 仅 `main` 分支自动执行部署
- `workflow_dispatch` 支持手动触发部署

需要在 GitHub 仓库中配置以下 Secrets：

| Secret 名称 | 用途 |
|------------|------|
| `SSH_HOST` | 部署服务器地址 |
| `SSH_PORT` | SSH 端口（如 `10022`） |
| `SSH_USERNAME` | SSH 用户名 |
| `DEPLOY_SSH_KEY` | 部署私钥 |

服务器上的 `~/neobanker/frontend/.env.local`（gitignore，不入库）建议至少包含：

```bash
NEXT_PUBLIC_BACKEND_API_URL=http://<backend-host>:8080/api
NEXT_PUBLIC_CHAT_TRANSPORT=backend
NEXT_PUBLIC_AGENT_BASE_URL=http://<agent-host>:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

这样可以保证线上运行链路与本地开发链路一致（只需按环境切换 `NEXT_PUBLIC_CHAT_TRANSPORT`）。

### Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所有必需的环境变量

### Docker 部署

在 Docker 构建时传入环境变量：

```dockerfile
ENV NEXT_PUBLIC_BACKEND_API_URL=https://api.neobanker.com
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_key
```

## 故障排除

### 常见问题

1. **配置未生效**: 确保重启开发服务器
2. **类型错误**: 检查环境变量类型转换
3. **验证失败**: 检查必需配置项是否已设置

### 调试方法

```typescript
import { config } from '@/config/environment';

// 在开发环境下打印配置
if (config.debugMode) {
  console.log('Environment config:', config);
}
```
