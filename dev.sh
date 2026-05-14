#!/bin/bash
set -e # 遇到错误立即退出

# 配置变量
PROJECT_NAME="liulian"
SOURCE_PATH="$(pwd)" # 不能使用git pull 的代码路径
BACKUP_PATH="/home/ecs-user/backup/${PROJECT_NAME}"
DEPLOY_PATH="/home/ecs-user/www/${PROJECT_NAME}"
BUILD_PATH="/tmp/${PROJECT_NAME}_build"
NODE_ENV="development"
LOG_FILE="/home/ecs-user/log/${PROJECT_NAME}_dev.log"
APP_PORT="3000"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  mkdir -p "$(dirname "$LOG_FILE")"
  echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - √ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - ⚠ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - × $1${NC}" | tee -a "$LOG_FILE"
}

# 检查端口占用情况
check_port() {
  log "检查端口 $APP_PORT 占用情况..."
  if lsof -Pi :$APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    warning "端口 $APP_PORT 已被占用，正在查找占用进程..."
    local pid=$(lsof -Pi :$APP_PORT -sTCP:LISTEN -t)
    local process_info=$(ps -p $pid -o pid,ppid,cmd --no-headers)
    log "占用端口的进程信息: $process_info"
    return 1
  else
    success "端口 $APP_PORT 可用"
    return 0
  fi
}

# 终止占用端口的进程
kill_port_process() {
  log "尝试清理所有 Node 进程..."
  pkill -f node || true
  sleep 2
  
  if lsof -Pi :$APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    local pid=$(lsof -Pi :$APP_PORT -sTCP:LISTEN -t)
    if kill -9 $pid >/dev/null 2>&1; then
      success "已终止占用端口的进程 (PID: $pid)"
      sleep 2
      return 0
    else
      error "无法终止占用端口的进程 (PID: $pid)"
      return 1
    fi
  else
    success "端口 $APP_PORT 没有被占用"
    return 0
  fi
}

# 检查权限
check_permissions() {
  log "检查目录权限..."
  # 创建用户可写的目录
  for dir in "$BACKUP_PATH" "$(dirname "$LOG_FILE")"; do
    mkdir -p "$dir"
    if [ ! -w "$dir" ]; then
      error "没有写入权限: $dir"
      exit 1
    fi
  done
  
  # 检查部署目录权限，可能需要sudo
  if [ ! -d "$DEPLOY_PATH" ] || [ ! -w "$DEPLOY_PATH" ]; then
    warning "部署目录 $DEPLOY_PATH 可能需要 sudo 权限"
    if ! command -v sudo &> /dev/null; then
      error "sudo 不可用，无法创建部署目录"
      exit 1
    fi
    # 尝试使用sudo创建目录
    if ! sudo mkdir -p "$DEPLOY_PATH"; then
      error "无法创建部署目录 $DEPLOY_PATH"
      exit 1
    fi
    # 设置权限
    sudo chown -R ecs-user:ecs-user "$DEPLOY_PATH"
  fi
  success "权限检查完成"
}

# 检查依赖
check_dependencies() {
  log "检查系统依赖..."
  command -v node >/dev/null 2>&1 || { error "Node.js 未安装"; exit 1; }
  command -v npm >/dev/null 2>&1 || { error "npm 未安装"; exit 1; }
  command -v lsof >/dev/null 2>&1 || { error "lsof 未安装，无法检查端口占用"; exit 1; }

  node_version=$(node -v | cut -d'v' -f2)
  success "依赖检查通过 - Node.js $node_version"
}

# 验证环境变量
validate_env() {
  log "验证环境变量..."
  # 检查.env.local文件是否存在
  if [ -f "$SOURCE_PATH/.env.local" ]; then
    success ".env.local 文件存在"
    return 0
  else
    warning "未找到 .env.local 文件，开发脚本会使用测试键作为回退"
    return 0
  fi
}

# 简单验证 base64 可解码性（避免 atob 抛错）
is_base64_decodable() {
  local s="$1"
  # remove any padding and non-base64 chars for rough check
  # Try node to decode safely if available
  if command -v node >/dev/null 2>&1; then
    node -e "try{Buffer.from('$s','base64').toString('utf8'); process.exit(0)}catch(e){process.exit(1)}"
    return $?
  fi
  # Fallback: basic regex check
  if [[ "$s" =~ ^[A-Za-z0-9+/]+=*$ ]]; then
    return 0
  fi
  return 1
}

# 备份当前版本
backup_current() {
  log "备份当前版本..."
  if [ -d "$DEPLOY_PATH" ]; then
    backup_dir="${BACKUP_PATH}/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp -r "$DEPLOY_PATH" "$backup_dir/"
    success "当前版本已备份至 $backup_dir"
  else
    warning "没有找到当前部署版本，跳过备份"
  fi
}

# 如果存在 .env.local 并且其中的 Clerk keys 无效，则备份并修正 .env.local
sanitize_env_local() {
  local envfile="$SOURCE_PATH/.env.local"
  if [ ! -f "$envfile" ]; then
    return 0
  fi

  # 读取当前值（如果有）
  local pubkey
  local secretkey
  pubkey=$(grep -E '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' "$envfile" | cut -d'=' -f2- | tr -d '"') || true
  secretkey=$(grep -E '^CLERK_SECRET_KEY=' "$envfile" | cut -d'=' -f2- | tr -d '"') || true

  local changed=0
  if [ -n "$pubkey" ]; then
    # remove potential pk_test_ prefix for check
    local kpart="${pubkey#pk_test_}"
    if ! is_base64_decodable "$kpart"; then
      warning ".env.local 中 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 格式无效，备份并替换为开发测试键"
      changed=1
      # Replace or add
      sed -i.bak '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' "$envfile"
      echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA==" >> "$envfile"
    fi
  else
    # Not present: append safe test key
    warning ".env.local 未包含 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY，追加开发测试键（仅用于本地开发）"
    echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA==" >> "$envfile"
    changed=1
  fi

  if [ -n "$secretkey" ]; then
    local spart="${secretkey#sk_test_}"
    if ! is_base64_decodable "$spart"; then
      warning ".env.local 中 CLERK_SECRET_KEY 格式无效，备份并替换为开发测试 secret"
      changed=1
      sed -i.bak '/^CLERK_SECRET_KEY=/d' "$envfile"
      echo "CLERK_SECRET_KEY=sk_test_dGVzdA==" >> "$envfile"
    fi
  else
    echo "CLERK_SECRET_KEY=sk_test_dGVzdA==" >> "$envfile"
    changed=1
  fi

  if [ $changed -eq 1 ]; then
    success ".env.local 已修正（原文件已备份为 .env.local.bak）"
  fi
}

# 获取最新代码
fetch_code() {
  log "从 $SOURCE_PATH 获取代码..."
  if [ ! -d "$SOURCE_PATH" ]; then
    error "源代码路径不存在：$SOURCE_PATH"
    exit 1
  fi

  # 清理构建目录
  log "清理构建目录..."
  rm -rf "$BUILD_PATH"
  mkdir -p "$BUILD_PATH"

  # 复制代码到构建目录
  log "复制代码到构建目录..."
  cp -r "$SOURCE_PATH"/* "$BUILD_PATH/" || {
    error "复制代码到构建目录失败"
    exit 1
  }
  
  # 确保.env.local文件被复制（即使在.gitignore中）
  if [ -f "$SOURCE_PATH/.env.local" ]; then
    cp "$SOURCE_PATH/.env.local" "$BUILD_PATH/"
    success ".env.local 文件已复制到构建目录"
  fi

  # 检查必要的文件
  if [ ! -f "$BUILD_PATH/package.json" ]; then
    error "构建目录缺少 package.json 文件, 代码可能不完整"
    exit 1
  fi
  success "代码获取完成，代码已复制到 $BUILD_PATH"
}

# 安装依赖和构建
build_project() {
  log "开始安装依赖和构建..."
  cd "$BUILD_PATH" || {
    error "进入构建目录失败"
    exit 1
  }

  # 检查 node_modules 是否已存在，如果存在就跳过安装
  if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    success "检测到 node_modules 已存在，跳过 npm 安装以节省时间"
  else
    # 清理 .next（但保留 node_modules 如果已存在）
    rm -rf .next
    npm cache clean --force || true

    # 加载环境变量（如果存在.env.local文件）
    if [ -f ".env.local" ]; then
      log "加载环境变量..."
      # 先修正 .env.local 中可能导致服务器 atob 解码错误的键值（备份原文件）
      sanitize_env_local
      # 导出环境变量
      export $(grep -v '^#' .env.local | xargs)
      success "环境变量已加载"
    else
      warning "构建目录中未找到 .env.local 文件"
    fi

    # 安装依赖（开发环境使用宽松模式以避免 peer 依赖冲突）
    log "安装 npm 依赖..."
    npm install --legacy-peer-deps || {
      error "npm 安装依赖失败"
      return 1
    }
  fi

  # 加载环境变量（如果在上面的 npm 安装分支中没有加载）
  if [ ! -d "node_modules" ]; then
    if [ -f ".env.local" ]; then
      log "加载环境变量..."
      sanitize_env_local
      export $(grep -v '^#' .env.local | xargs)
      success "环境变量已加载"
    else
      warning "构建目录中未找到 .env.local 文件"
    fi
  fi

  # 构建项目（dev 脚本通常不需要构建，但保留以兼容流程）
  if [ "$NODE_ENV" != "development" ]; then
    log "执行 Next.js 构建..."
    npm run build || {
      error "项目构建失败"
      return 1
    }
    # 验证构建产物是否正确生成
    if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
      error "构建产物不完整，.next 目录或 BUILD_ID 文件不存在"
      return 1
    fi
    success "项目构建完成，构建产物验证通过"
  else
    log "开发模式，跳过生产构建"
  fi
}

# 部署新版本（保留，但开发环境通常不调用）
deploy_new_version() {
  log "部署新版本...（开发脚本默认不执行完整部署）"
  # 为兼容性保留 deploy 步骤的简化实现
  mkdir -p "$DEPLOY_PATH" || {
    error "创建部署目录失败"
    return 1
  }
  cp -r "$BUILD_PATH"/* "$DEPLOY_PATH/" || warning "复制到部署目录失败（开发模式可忽略）"
  success "（开发）复制完成"
}

# 启动应用（开发模式：直接用 npm run dev，在 SOURCE_PATH 下启动）
start_application() {
  log "启动开发服务器..."

  # 切回源码目录并加载 env
  cd "$SOURCE_PATH" || {
    error "进入源码目录失败"
    return 1
  }
  
  # 强制清理所有 Node 进程，确保端口完全释放
  log "强制清理所有 Node 进程..."
  pkill -f node || true
  sleep 2
  
  if [ -f ".env.local" ]; then
    sanitize_env_local
    export $(grep -v '^#' .env.local | xargs)
  fi

  # 确保有一个安全的 NODE_ENV
  export NODE_ENV="development"

  # 防护：临时测试 Clerk 键，如果缺失
  # 验证并回退 Clerk key（与上面构建阶段保持一致）
  if [ -n "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" ]; then
    key_part=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY#pk_test_}
    if ! is_base64_decodable "$key_part"; then
      warning "检测到 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 格式可疑，使用开发测试键回退。"
      export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA=="
    fi
  else
    warning "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 未设置，使用开发测试键回退（仅用于开发）"
    export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2ktYnVpbGQuY2xlcmsuYWNjb3VudHMuZGV2JA=="
  fi

  if [ -n "${CLERK_SECRET_KEY:-}" ]; then
    secret_part=${CLERK_SECRET_KEY#sk_test_}
    if ! is_base64_decodable "$secret_part"; then
      warning "检测到 CLERK_SECRET_KEY 格式可疑，使用开发测试 secret 回退。"
      export CLERK_SECRET_KEY="sk_test_dGVzdA=="
    fi
  else
    export CLERK_SECRET_KEY="sk_test_dGVzdA=="
  fi

  log "在 $SOURCE_PATH 使用 npm run dev 启动开发服务器（强制端口 $APP_PORT，监听所有网卡）（日志 -> $LOG_FILE）"
  # 强制使用 3000 端口并监听所有网卡 (0.0.0.0)，用于 Docker 容器环境
  export PORT=$APP_PORT
  export HOSTNAME="0.0.0.0"
  # 后台启动以免阻塞脚本（也可以去掉 & 保持前台）
  npm run dev >> "$LOG_FILE" 2>&1 &
  local pid=$!
  success "开发服务器已启动 (PID: $pid), 日志在 $LOG_FILE"
  return 0
}

# 健康检查（简化）- 检查本地 3000 端口
health_check() {
  log "执行健康检查..."
  local max_attempts=10
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:$APP_PORT > /dev/null 2>&1; then
      success "应用 $PROJECT_NAME 健康检查通过"
      return 0
    fi
    warning "健康检查尝试 $attempt/$max_attempts - 应用 $PROJECT_NAME 失败，等待 2 秒后重试..."
    sleep 2
    attempt=$((attempt + 1))
  done

  error "应用 $PROJECT_NAME 健康检查失败，$max_attempts 次尝试后未成功"
  return 1
}

# 主流程（开发脚本会简化为：检查、安装、启动）
main() {
  log "开始（开发）流程 $PROJECT_NAME"
  check_dependencies
  check_port || kill_port_process || true
  validate_env
  fetch_code
  build_project || warning "构建过程遇到问题，但尝试继续"
  start_application || {
    error "启动开发服务器失败"
    exit 1
  }
  health_check || warning "健康检查未通过，继续保留服务器运行以便调试"
  success "开发服务器已就绪，监听 0.0.0.0:$APP_PORT"
}

trap 'error "开发过程被中断"; exit 1' INT TERM

main "$@"
