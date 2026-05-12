# Neobanker Frontend

Next.js 14 前端，包含 AI 银行分析聊天助手、多语言(EN/zh-CN/zh-HK)支持、银行信息展示页面。

## 快速开始

```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 (localhost:3000) |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | Vitest 单元/组件测试 (274 tests) |
| `npm run test:watch` | Vitest 监视模式 |
| `npm run test:e2e` | Playwright E2E 测试 |
| `npm run storybook` | Storybook 组件预览 (localhost:6006) |

## 服务器部署

> 部署手动操作清单（包含前端 + Agent + GitHub 设置）：
> **[`neobanker-agent/docs/deployment.md` §0](../neobanker-agent/docs/deployment.md)**

前端部署需要：

1. 创建 `.env.local` 并填入：
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk 认证公钥
   - `CLERK_SECRET_KEY` — Clerk 认证私钥
   - `NEXT_PUBLIC_AGENT_BASE_URL` — Agent 服务地址（如 `http://agent-host:8000`）
2. `npm run build` 构建
3. 配置反向代理（Nginx/Caddy）指向 3000 端口

## Demo 路由（无需后端）

```
/bank-info/demo-bank/overview
```

使用 `app/mock/demoBank.ts` 的固定数据，可验证聊天助手上下文注入功能。

## 测试

- **单元/组件测试**：Vitest + @testing-library/react，37 个测试文件
- **E2E 测试**：Playwright (Chromium)，需要 dev server 运行
- **Storybook**：所有 `components/chat/` 组件都有 stories

## 项目结构

```
app/                    # Next.js App Router 页面
components/chat/        # 聊天助手组件（23 个）
contexts/               # React Context (ChatContext, BankContext)
utils/                  # 工具函数
messages/               # i18n 翻译文件 (EN/zh-CN/zh-HK)
__tests__/              # Vitest 测试
e2e/                    # Playwright E2E 测试
```
