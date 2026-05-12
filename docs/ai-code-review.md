# AI 代码审查工具集成 / AI Code Review Toolchain

> 适用范围：`neobanker-frontend-MVP-V3`、`neobanker-backend-MVP-V2`、`neobanker-agent`。

## 一、已自动接入（无需操作）

| 能力 | 工具 | 触发 | 输出 | 费用 |
|------|------|------|------|------|
| 静态安全分析 | GitHub CodeQL | push/PR/每周一 03:30 UTC | Security → Code scanning | 公仓免费；私仓需 GHAS |
| 依赖许可门禁 | `dependency-review-action` | PR 触发 | PR 评论 + 失败/通过 | 完全免费 |
| 漏洞依赖扫描 | `dependency-review-action`（同上） | PR 触发 | 同上 | 完全免费 |
| 许可/版权深度扫描 | ScanCode Toolkit | PR 触发 | Actions Artifact（HTML+JSON） | 完全免费 |

工作流文件：
- 前端：`.github/workflows/code-scanning.yml`、`.github/workflows/license-and-supply-chain.yml`
- 后端：`.github/workflows/code-scanning.yml`
- Agent：`.github/workflows/code-scanning.yml`

## 二、需要手动操作

### 1. 启用 GitHub Advanced Security（私仓必需，公仓可跳过）

GitHub.com → 仓库 Settings → **Code security and analysis** → 找到 **GitHub Advanced Security** → Enable。
- 自动激活：CodeQL、Secret scanning、Push protection。
- 三个仓库分别开启：`neobanker-frontend-MVP-V3`、`neobanker-backend-MVP-V2`、`neobanker-agent`。

### 2. 启用 Copilot Code Referencing（用户已订阅 Copilot）

GitHub.com → 个人 Settings → **Copilot** → **Policies** → **Suggestions matching public code** → 选择 `Allow with reference`。
- 效果：Copilot 建议命中公共代码时附带源链接和许可证；可在评审时核对来源。

### 3. 可选：FOSSA SaaS 增强 SBOM（免费层 5 个仓）

如未来需要更细的 SBOM/SPDX 输出：
1. 注册 https://app.fossa.com（免费层）。
2. 仓库 Settings → Secrets → 添加 `FOSSA_API_KEY`。
3. 在 `.github/workflows/license-and-supply-chain.yml` 的 `scancode` 后追加：
   ```yaml
   fossa:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: fossas/fossa-action@v1
         with:
           api-key: ${{ secrets.FOSSA_API_KEY }}
   ```

### 4. 可选：Snyk 增强（如团队购买）

Snyk 免费层个人可用，企业需要付费。如需启用：
1. 仓库 Settings → Secrets → 添加 `SNYK_TOKEN`。
2. 新增 `.github/workflows/snyk.yml`，参考官方模板。
3. 与 CodeQL 互补：CodeQL 偏代码缺陷，Snyk 偏依赖 CVE。

## 三、本地预提交校验

任何分支提交前，可本地运行：

```bash
# 前端
cd repos/neobanker-frontend-MVP-V3
npm run lint
act -j check                      # 用 act 模拟 GitHub Actions

# Agent
cd repos/neobanker-agent
uv run ruff format --check .
uv run pytest -v

# 后端
cd repos/neobanker-backend-MVP-V2
mvn test
```

> 与本仓 `MEMORY.md` 中"提交前先用 act 跑 CI"的规则一致。

## 四、ScanCode 报告下载

PR 跑完后：
1. 进入 PR → Checks tab → `License & Supply Chain` → `scancode` job。
2. 滚到底部 **Artifacts** → 下载 `scancode-report` zip。
3. 解压后用浏览器打开 `scancode-report.html`，按文件分组查看许可证/版权。

## 五、Roadmap

- 当 GHAS 启用后，配置 **Required status checks** 强制 PR 通过 CodeQL。
- 评估 SonarQube Cloud 免费层（每月 50K LOC 免费）作为代码异味补充。
- 评估 OSS Review Toolkit (ORT) 替换 ScanCode（功能更全但配置更重）。
