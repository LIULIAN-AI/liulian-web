# 银行图标加载问题排查指南 / Bank Icon Loading Debug

> 现象：部分银行的 logo 能正常显示，部分显示为默认银行图标 `defaultBank.svg`。
> 服务端在线，部分图标却 404 / 网络失败 — 本文给出完整调用链 + DevTools 调查步骤。

## 一、调用链总览（FE ↔ BE ↔ 资源源站）

```mermaid
flowchart LR
  Browser[浏览器]
  FE[Next.js 前端\nrepos/neobanker-frontend-MVP-V3]
  BE[Spring Boot 后端\n/api/* 接口]
  MinIOIntern[内网 MinIO\n124.193.170.132:9000\n仅内网可达]
  MinIOPublic[公网 MinIO\n47.83.183.119:9000\n外网可达]

  Browser -->|GET /homepage 等页面 HTML| FE
  FE -->|server-side fetch /api/homepage/our-partner 等| BE
  BE -->|JSON: { logoLink: 'http://内网/...' }| FE
  FE -->|HTML + 图片 src| Browser
  Browser -->|GET 图片| MinIOIntern
  Browser -->|GET 图片（仅经 resolveAssetUrl 重写后）| MinIOPublic
```

关键点：**后端返回的 `logoLink` 经常指向内网 MinIO 主机**，外网用户的浏览器无法直接访问。前端需要把 `124.193.170.132:9000` 重写成公网镜像 `47.83.183.119:9000`（环境变量 `NEXT_PUBLIC_PUBLIC_ASSET_ORIGIN` 可覆盖）。

## 二、当前哪些页面做了重写、哪些没有

| 调用点 | 文件 | 是否调用 `resolveAssetUrl` | 风险 |
|---|---|---|---|
| 首页轮播合作银行 | `app/(default)/homepage/page.tsx:74` | ✅ 是 | 低 |
| About Us 合作银行 | `app/(default)/about-us/page.tsx:1234` | ✅ 是 | 低 |
| 银行统计列表 `/banks-statistics` | `app/(default)/banks-statistics/page.tsx:25-34` | ❌ **否**（只判断 http 前缀） | **高** — 内网 URL 直接出图 |
| 热门搜索词 | `components/HotSearchWords.tsx:135` | ❌ 否 | 高 |
| Popular Banks 滚动条 | `components/popularBanks/index.tsx:96` | ❌ 否 | 高 |
| 银行菜单选项 | `components/BankMenuOption.tsx`、`BankMenuOption2.tsx` | ❌ 否 | 中 — 视具体接口数据 |
| Tab 组件 | `components/tab.tsx`、`tab-backup.tsx`、`tab-optimized.tsx` | ❌ 否 | 中 |
| Bank Info 子页（Overview/Products/Marketing） | `app/(default)/bank-info/[sortId]/*` | ❌ 否 | 中 |

**这就是"部分能加载、部分不能"的根因**：同一份后端数据，仅在首页 / About Us 被重写，其他页面直接消费内网 URL，外网用户必然失败。

`resolveAssetUrl` 的实现位于 `utils/resolveAssetUrl.ts`，重写表只覆盖 `124.193.170.132:9000` → `NEXT_PUBLIC_PUBLIC_ASSET_ORIGIN`（默认 `http://47.83.183.119:9000`）。其它任意主机不动。

## 三、Next.js Image 配置

`next.config.js:62-72` 设置：
- `unoptimized: true` — 不走 `/_next/image` 代理
- `remotePatterns: { protocol: 'https', hostname: '**' }` — 仅允许 HTTPS
- `domains` 列表只含 `localhost` 与 `47.83.183.119:8080`

这意味着 `<Image>` 组件碰到 **HTTP** 协议且不在 `domains` 白名单的图片，**会被 Next.js 拒绝**（运行时报 `next/image Un-configured Host`）。`/banks-statistics` 用的就是 `next/image`。所以即便重写到公网 MinIO，公网仍是 `http://`，需要确认 `domains` 是否覆盖。

## 四、浏览器 DevTools 排查步骤

> 测试环境：在能访问公网但**不能访问 124.193.170.132 内网**的电脑上打开页面。

### Step 1 — 看 Network 面板里图片请求

1. F12 → **Network** → 过滤 **Img**
2. 刷新页面（Cmd/Ctrl + Shift + R 强刷）
3. 按 **Status** 列排序，红色或灰色（pending、(failed)、ERR_TIMED_OUT、ERR_NAME_NOT_RESOLVED、404）的就是失败图

### Step 2 — 对比成功 vs 失败的 URL

点开某个失败图片请求，看 **Headers → General → Request URL**：
- 如果是 `http://124.193.170.132:9000/...` → **重写没生效**（即上文表格里的"❌"调用点）
- 如果是 `http://47.83.183.119:9000/...` → 重写到了公网，但公网 MinIO 上没有对应对象，需要后端运维补
- 如果是 `https://...其他域名/...` → 第三方 CDN 失效

### Step 3 — 看 Console 报错

```
GET http://124.193.170.132:9000/.../logo.png net::ERR_NAME_NOT_RESOLVED
```
→ DNS 解析失败，外网无 `124.193.170.132` 路由。**必然是未重写。**

```
Image with src "http://..." has either width or height modified, but not the other.
```
或
```
hostname "..." is not configured under images in your `next.config.js`
```
→ Next.js Image 白名单没收录这个 host，需要补 `domains` 或换成 `<img>`。

### Step 4 — 看后端返回的原始数据

1. Network → 过滤 **Fetch/XHR**
2. 找到 `/homepage/our-partner`、`/banks-statistics/list`、`/homepage/hot-search-words` 这类响应
3. 看 **Response → JSON**，找 `logoLink` / `logoUrl` 字段

例：

```json
{
  "name": "ZA Bank",
  "logoLink": "http://124.193.170.132:9000/cms/banks/za.png"
}
```

只要看到 `124.193.170.132:9000` 就说明数据源仍在写内网地址，前端**必须**走重写。

### Step 5 — 直接用 curl 验证公网 MinIO 是否有对象

把失败 URL 的路径拼到公网 MinIO：

```bash
curl -I http://47.83.183.119:9000/cms/banks/za.png
```
- `HTTP/1.1 200 OK` → 公网有，前端只差重写
- `HTTP/1.1 404 Not Found` → 后端运维需要把对象同步到公网 MinIO

## 五、最常见的 3 种失败模式

| 失败模式 | 现象 | 修复方向 |
|---|---|---|
| 1. 调用点没走 `resolveAssetUrl` | 浏览器请求 `http://124.193.170.132:9000/...` 走 ERR | 在该调用点上 `resolveAssetUrl(url, config.backendApiUrl)` |
| 2. 公网 MinIO 缺对象 | 走到 `47.83.183.119:9000` 但 404 | 后端把缺失对象上传 / 同步到公网 MinIO |
| 3. `next/image` 域名未白名单 | Console 报 `hostname not configured` | `next.config.js → images.domains` 追加，或改用 `<img>` |

## 六、修复建议（待业务确认后再动 UI）

按 [`MEMORY.md`](../../.claude/projects/-home-jajupmochi-copilot/memory/MEMORY.md) 的"修改前端 UI 前先问"规则，下面只列方向，**不要直接动**：

1. **统一收口** — 把所有 `<img src={item.logoLink}>` 替换成 `<img src={resolveAssetUrl(item.logoLink, config.backendApiUrl)}>`（或在 API 层一次性重写，参考 `app/(default)/homepage/page.tsx:74` 的写法）
2. **API 层兜底** — 在 `app/api/homepage/index.ts` 等聚合层的响应映射里统一调用 `resolveAssetUrl`，下游消费方零改动
3. **后端最终修复** — 让后端写库时直接存公网 URL，前端重写表清零

## 七、相关文件索引

- `utils/resolveAssetUrl.ts` — 主机重写实现 + 重写表
- `config/environment.ts` — `backendApiUrl` 与 `publicAssetOrigin` 环境变量
- `next.config.js` — Image 白名单
- `app/(default)/homepage/page.tsx` — 已正确接入 `resolveAssetUrl` 的范例
- `app/(default)/banks-statistics/page.tsx` — 未接入的典型反例
