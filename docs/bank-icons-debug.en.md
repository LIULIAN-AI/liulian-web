# Bank Icon Loading Debug Guide

> Symptom: some bank logos render fine, others fall back to `defaultBank.svg`.
> Server is up, yet some icons 404 / fail to fetch — this doc gives the full call chain + DevTools recipe.

## 1. Call chain (FE ↔ BE ↔ asset origin)

```mermaid
flowchart LR
  Browser[Browser]
  FE[Next.js frontend\nrepos/neobanker-frontend-MVP-V3]
  BE[Spring Boot backend\n/api/* endpoints]
  MinIOIntern[Internal MinIO\n124.193.170.132:9000\nLAN-only]
  MinIOPublic[Public MinIO\n47.83.183.119:9000\npublicly reachable]

  Browser -->|GET page HTML| FE
  FE -->|server-side fetch /api/homepage/our-partner etc| BE
  BE -->|JSON: { logoLink: 'http://internal/...' }| FE
  FE -->|HTML + image src| Browser
  Browser -->|GET image| MinIOIntern
  Browser -->|GET image only after resolveAssetUrl rewrite| MinIOPublic
```

Key insight: **the backend often returns `logoLink` pointing at the internal MinIO host**, which external browsers cannot reach. The frontend must rewrite `124.193.170.132:9000` to the public mirror `47.83.183.119:9000` (overridable via `NEXT_PUBLIC_PUBLIC_ASSET_ORIGIN`).

## 2. Which surfaces apply the rewrite, which don't

| Surface | File | Calls `resolveAssetUrl`? | Risk |
|---|---|---|---|
| Homepage partner carousel | `app/(default)/homepage/page.tsx:74` | ✅ Yes | Low |
| About Us partners | `app/(default)/about-us/page.tsx:1234` | ✅ Yes | Low |
| Bank statistics list `/banks-statistics` | `app/(default)/banks-statistics/page.tsx:25-34` | ❌ **No** (only checks http prefix) | **High** — internal URLs render directly |
| Hot search words | `components/HotSearchWords.tsx:135` | ❌ No | High |
| Popular Banks ticker | `components/popularBanks/index.tsx:96` | ❌ No | High |
| Bank menu options | `components/BankMenuOption.tsx`, `BankMenuOption2.tsx` | ❌ No | Medium — depends on payload |
| Tab components | `components/tab.tsx`, `tab-backup.tsx`, `tab-optimized.tsx` | ❌ No | Medium |
| Bank Info subpages (Overview/Products/Marketing) | `app/(default)/bank-info/[sortId]/*` | ❌ No | Medium |

**This is the root cause of the "some load, some don't" symptom**: same backend payload, but only Homepage / About Us rewrite. Other surfaces consume internal URLs directly and inevitably fail off-LAN.

`resolveAssetUrl` lives at `utils/resolveAssetUrl.ts`. The rewrite table covers `124.193.170.132:9000` → `NEXT_PUBLIC_PUBLIC_ASSET_ORIGIN` (default `http://47.83.183.119:9000`). Other hosts pass through untouched.

## 3. Next.js Image config

`next.config.js:62-72` sets:
- `unoptimized: true` — bypasses `/_next/image` proxy
- `remotePatterns: { protocol: 'https', hostname: '**' }` — only HTTPS allowed
- `domains` includes only `localhost` and `47.83.183.119:8080`

That means `<Image>` components hitting **HTTP** images on hosts not in `domains` **get rejected by Next.js** (runtime: `next/image Un-configured Host`). `/banks-statistics` uses `next/image`, so even after rewriting to public MinIO, the URL is still `http://`, and you must verify the `domains` list covers it.

## 4. Browser DevTools recipe

> Test from a machine that **can** reach the public internet but **cannot** reach the `124.193.170.132` LAN.

### Step 1 — Inspect Network panel for image requests

1. F12 → **Network** → filter **Img**
2. Hard reload the page (Cmd/Ctrl + Shift + R)
3. Sort by **Status**. Anything red/grey (pending, (failed), ERR_TIMED_OUT, ERR_NAME_NOT_RESOLVED, 404) is a failed image.

### Step 2 — Compare working vs failing URLs

Open a failed request → **Headers → General → Request URL**:
- `http://124.193.170.132:9000/...` → **rewrite was not applied** (one of the ❌ surfaces above)
- `http://47.83.183.119:9000/...` → rewrite applied, but the public MinIO is missing the object — backend ops needs to sync
- `https://...other-domain/...` → third-party CDN failure

### Step 3 — Check the Console

```
GET http://124.193.170.132:9000/.../logo.png net::ERR_NAME_NOT_RESOLVED
```
→ DNS resolution failed; no external route to 124.193.170.132. **Definitely an unrewritten URL.**

```
hostname "..." is not configured under images in your `next.config.js`
```
→ Next.js Image's allow-list doesn't cover this host; either add to `domains` or switch to plain `<img>`.

### Step 4 — Inspect the raw backend payload

1. Network → filter **Fetch/XHR**
2. Find responses for `/homepage/our-partner`, `/banks-statistics/list`, `/homepage/hot-search-words`
3. Open **Response → JSON** and look at `logoLink` / `logoUrl`

Example:
```json
{
  "name": "ZA Bank",
  "logoLink": "http://124.193.170.132:9000/cms/banks/za.png"
}
```

Any `124.193.170.132:9000` here means the data source still writes internal addresses, so the frontend **must** rewrite.

### Step 5 — Verify the public MinIO has the object

Lift the failing path onto the public MinIO host:

```bash
curl -I http://47.83.183.119:9000/cms/banks/za.png
```
- `HTTP/1.1 200 OK` → object exists publicly; frontend just needs to rewrite
- `HTTP/1.1 404 Not Found` → backend ops needs to upload / sync the object

## 5. Three common failure modes

| Mode | Symptom | Fix direction |
|---|---|---|
| 1. Surface skips `resolveAssetUrl` | Browser requests `http://124.193.170.132:9000/...` and errors | Wrap that surface's URL with `resolveAssetUrl(url, config.backendApiUrl)` |
| 2. Public MinIO is missing the object | Reaches `47.83.183.119:9000` but 404s | Backend ops uploads / syncs the missing object |
| 3. `next/image` domain not whitelisted | Console: `hostname not configured` | Add to `next.config.js → images.domains`, or switch to `<img>` |

## 6. Suggested fixes (await sign-off before touching UI)

Per [`MEMORY.md`](../../.claude/projects/-home-jajupmochi-copilot/memory/MEMORY.md)'s "ask before frontend UI changes" rule, only directions are listed — **don't apply yet**:

1. **Centralize** — replace every `<img src={item.logoLink}>` with `<img src={resolveAssetUrl(item.logoLink, config.backendApiUrl)}>` (or normalize at the API layer like `app/(default)/homepage/page.tsx:74` does)
2. **API-layer guard** — in aggregators like `app/api/homepage/index.ts`, run `resolveAssetUrl` over response mappings so consumers stay untouched
3. **Final fix at backend** — backend writes the public URL into the DB, so the rewrite table can disappear

## 7. Related files

- `utils/resolveAssetUrl.ts` — host-rewrite implementation + table
- `config/environment.ts` — `backendApiUrl` and `publicAssetOrigin` env vars
- `next.config.js` — Image allow-list
- `app/(default)/homepage/page.tsx` — example of correct `resolveAssetUrl` use
- `app/(default)/banks-statistics/page.tsx` — example of the missing rewrite
