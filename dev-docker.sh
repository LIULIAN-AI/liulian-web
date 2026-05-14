#!/usr/bin/env bash

# This script runs on the docker container to set up the development environment

set -e

echo "=== 1. 系统依赖 ==="
apt update
apt install -y \
  git \
  curl \
  vim \
  build-essential \
  ca-certificates \
  python3 \
  python3-pip \
  lsof \
  iproute2

echo "=== 2. Node.js (via nvm) ==="
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"

nvm install --lts
nvm use --lts

echo "Node version:"
node -v
npm -v

echo "=== 3. 全局工具 ==="
npm install -g pm2

echo "PM2 version:"
pm2 -v

echo "=== 4. 项目依赖 ==="
npm install

echo "=== 5. 启动前端项目 ==="
chmod +x repos/liulian-web/dev.sh
cd repos/liulian-web/
# Ensure Clerk env vars are valid before starting (prevents atob errors at module load)
export NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
export NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
export NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
export NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

# Start frontend dev script
./dev.sh

echo "=== 6. 端口检查 ==="
ss -ltnp | grep 3000 || echo "3000 not found"






apt install -y jq net-tools iproute2

# 安装 uv CLI（官方安装器）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 确保 uv 在 PATH（安装器一般把可执行放到 ~/.local/bin）
export PATH="$HOME/.local/bin:$PATH"

# uv installer already puts uv in ~/.local/bin; ensure it's on PATH
export PATH="$HOME/.local/bin:$PATH"

# 验证 uv（如果可用）
if command -v uv >/dev/null 2>&1; then
  uv --version || true
fi

cd /workspace/repos/liulian-agent

# 在当前工程创建虚拟环境（会创建 .venv）
uv venv
# 激活（可选，uv run 会自动为脚本管理 env，但若要手动进入）
source .venv/bin/activate

# 同步依赖（如果想同时安装可选 dev extras）
uv sync --all-extras

# 或仅 sync（根据项目情况）
uv sync

# 创建 Agent 日志目录（统一放在 liulian-agent 仓库内）
mkdir -p /workspace/repos/liulian-agent/logs/runtime
mkdir -p /workspace/repos/liulian-agent/logs/sessions
mkdir -p /workspace/logs

# 迁移旧路径日志（若存在）
if [ -f /workspace/logs/agent.log ] && [ ! -f /workspace/repos/liulian-agent/logs/runtime/agent.log ]; then
  mv /workspace/logs/agent.log /workspace/repos/liulian-agent/logs/runtime/agent.log
fi
if [ -f /workspace/logs/agent.pid ] && [ ! -f /workspace/repos/liulian-agent/logs/runtime/agent.pid ]; then
  mv /workspace/logs/agent.pid /workspace/repos/liulian-agent/logs/runtime/agent.pid
fi

# 会话日志目录默认落到 agent 仓库
export AGENT_SESSION_LOG_DIR=/workspace/repos/liulian-agent/logs/sessions

# 用 uv 运行 uvicorn（热重载），并放后台；把 PID 写入文件
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /workspace/repos/liulian-agent/logs/runtime/agent.log 2>&1 &
echo $! > /workspace/repos/liulian-agent/logs/runtime/agent.pid

# 保留旧路径为软链接，兼容现有查看命令
ln -sfn /workspace/repos/liulian-agent/logs/runtime/agent.log /workspace/logs/agent.log
ln -sfn /workspace/repos/liulian-agent/logs/runtime/agent.pid /workspace/logs/agent.pid

# 查看后台进程
ps aux | grep -E 'uvicorn|uv run' | grep -v grep

# 检查端口监听
ss -ltnp | grep ':8000' || netstat -ltnp | grep ':8000'

# 访问 health endpoint（应返回 JSON）
curl -sS http://127.0.0.1:8000/health | jq . || curl -sS http://127.0.0.1:8000/health

# 查看最近日志输出
tail -n 200 /workspace/repos/liulian-agent/logs/runtime/agent.log


# 推荐
ss -ltnp | grep ':8000' || true

# 备用（如果安装了 net-tools）
netstat -ltnp | grep ':8000' || true

# 或用 lsof（若已安装）
sudo lsof -nP -iTCP:8000 -sTCP:LISTEN || true

# 查看进程命令行
ps -fp 11981
# 或按 uv/uvicorn 名称查找
ps aux | grep -E 'uv run|uvicorn' | grep -v grep

# 推荐查看统一路径
tail -n 200 /workspace/repos/liulian-agent/logs/runtime/agent.log

# 如果没有日志文件，查看 nohup.out（若用 nohup）
tail -n 200 nohup.out || true


# =====================================================================
# 可选：Swagger UI（Agent FastAPI）
# 用法：SETUP_SWAGGER=1 bash dev-docker.sh
# Swagger 已内置于 FastAPI；这里只是确保 .env 中开启了开关。
# 访问地址：http://127.0.0.1:8000/docs   (ReDoc: /redoc)
# =====================================================================
if [ "${SETUP_SWAGGER:-0}" = "1" ]; then
  echo "=== [Optional] 启用 Agent Swagger UI ==="
  AGENT_ENV=/workspace/repos/liulian-agent/.env
  if [ -f "$AGENT_ENV" ]; then
    if grep -q '^AGENT_ENABLE_SWAGGER=' "$AGENT_ENV"; then
      sed -i 's/^AGENT_ENABLE_SWAGGER=.*/AGENT_ENABLE_SWAGGER=true/' "$AGENT_ENV"
    else
      echo 'AGENT_ENABLE_SWAGGER=true' >> "$AGENT_ENV"
    fi
    echo "Swagger 已开启 (AGENT_ENABLE_SWAGGER=true in $AGENT_ENV)"
  else
    echo "⚠ $AGENT_ENV 不存在，跳过 .env 写入；运行 agent 前请手动设置 AGENT_ENABLE_SWAGGER=true"
  fi
  echo "→ 重启 agent 后访问 http://127.0.0.1:8000/docs"
fi


# =====================================================================
# 可选：Storybook（Frontend）
# 用法：SETUP_STORYBOOK=1 bash dev-docker.sh
# 默认端口 6006（需 docker run 时映射 -p 6006:6006）
# 启动：cd repos/liulian-web && npm run storybook
# =====================================================================
if [ "${SETUP_STORYBOOK:-0}" = "1" ]; then
  echo "=== [Optional] 安装 Storybook ==="
  cd /workspace/repos/liulian-web || exit 1
  if [ ! -d ".storybook" ]; then
    # --skip-install: storybook 自带 npm install 会和我们的 lockfile 打架
    npx --yes storybook@latest init --type nextjs --skip-install --yes || true
    npm install --legacy-peer-deps
  else
    echo "Storybook 已存在，跳过 init"
  fi
  echo "→ 启动: npm run storybook   (端口 6006)"
  echo "→ 注意：docker 容器需要映射 -p 6006:6006 才能从宿主机访问"
fi
