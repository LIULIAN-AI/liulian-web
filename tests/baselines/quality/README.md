# Quality + Security Baselines (Frontend)

> Standard: [`<workspace-root>/repos/liulian-agent/docs/standards/code-quality-and-security-tools.md`](../../../../liulian-agent/docs/standards/code-quality-and-security-tools.md)

## Files

| File | Tool | Coverage | Refresh |
|---|---|---|---|
| `npm-audit.json` | `npm audit` (CVE scan) | npm dependency tree | every R cycle |
| `lighthouse-<route>.json` | Lighthouse CI (R11) | each route in §2.2 | per release |
| `eslint-summary.json` | eslint(jsx-a11y / next) | tracked separately via lint output |

## R10-L baseline snapshot (2026-04-21)

### npm-audit

| Severity | Count |
|---|---|
| critical | 5 |
| high | 8 |
| moderate | 19 |
| low | 7 |
| info | 0 |
| **total** | **39** |

> R10-L baseline only — does NOT block. Triage in R11 to identify which are real risks (transitive vs direct, dev vs prod).

### Lighthouse

`lighthouse-*.json` files **not yet collected** — requires running dev server. Pending R10-L Phase 3 (manual run with `npm run dev` + `npx lhci autorun --collect.url=http://127.0.0.1:3000/homepage`).

## How to refresh npm-audit

```bash
docker exec my-ubuntu-dev bash -lc '
  cd /workspace/repos/liulian-web
  npm audit --json > tests/baselines/quality/npm-audit.json 2>/dev/null
'
```

## How to run Lighthouse (manual, R10-L Phase 3 pending)

```bash
# Terminal A: start dev server
docker exec my-ubuntu-dev bash -lc 'cd /workspace/repos/liulian-web && npm run dev'

# Terminal B: run LHCI
docker exec my-ubuntu-dev bash -lc '
  cd /workspace/repos/liulian-web
  npx -y @lhci/cli@0.13 autorun \
    --collect.url=http://127.0.0.1:3000/homepage \
    --collect.url=http://127.0.0.1:3000/bank-info/demo-bank/overview \
    --upload.target=filesystem \
    --upload.outputDir=tests/baselines/quality/lhci
'
```

## Gate thresholds

See [`<workspace-root>/repos/liulian-agent/docs/standards/code-quality-and-security-tools.md` §2.1](../../../../liulian-agent/docs/standards/code-quality-and-security-tools.md).
