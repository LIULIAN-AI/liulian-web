#!/bin/bash
set -e # 遇到错误立即退出

# 配置变量
PROJECT_NAME="neobanker"
SOURCE_PATH="$(pwd)" # 不能使用git pull 的代码路径
BACKUP_PATH="/home/ecs-user/backup/${PROJECT_NAME}"
DEPLOY_PATH="/home/ecs-user/www/${PROJECT_NAME}"
BUILD_PATH="/tmp/${PROJECT_NAME}_build"
NODE_ENV="production"
LOG_FILE="/home/ecs-user/log/${PROJECT_NAME}_deploy.log"
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
  log "尝试终止占用端口 $APP_PORT 的进程..."
  if lsof -Pi :$APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    local pid=$(lsof -Pi :$APP_PORT -sTCP:LISTEN -t)
    if kill -9 $pid >/dev/null 2>&1; then
      success "已终止占用端口的进程 (PID: $pid)"
      # 等待进程完全终止
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
  command -v pm2 >/dev/null 2>&1 || { error "pm2 未安装"; exit 1; }
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
    # 检查是否包含必要的环境变量
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$SOURCE_PATH/.env.local" && \
       grep -q "CLERK_SECRET_KEY" "$SOURCE_PATH/.env.local"; then
      success "必要的Clerk环境变量已配置"
      return 0
    else
      warning ".env.local 文件缺少必要的Clerk环境变量"
      # 尝试从文件中提取密钥（仅用于验证，不会记录完整密钥）
      local publishable_key=$(grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$SOURCE_PATH/.env.local" | cut -d'=' -f2 | tr -d ' ')
      local secret_key=$(grep "CLERK_SECRET_KEY" "$SOURCE_PATH/.env.local" | cut -d'=' -f2 | tr -d ' ')
      
      if [ -z "$publishable_key" ]; then
        error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 未设置"
        return 1
      fi
      if [ -z "$secret_key" ]; then
        error "CLERK_SECRET_KEY 未设置"
        return 1
      fi
    fi
  else
    error "未找到 .env.local 文件，这可能导致构建失败"
    return 1
  fi
  success "环境变量验证通过"
  return 0
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

  # 清理 node_modules 和缓存
  rm -rf node_modules .next
  npm cache clean --force

  # 加载环境变量（如果存在.env.local文件）
  if [ -f ".env.local" ]; then
    log "加载环境变量..."
    # 导出环境变量
    export $(grep -v '^#' .env.local | xargs)
    success "环境变量已加载"
  else
    warning "构建目录中未找到 .env.local 文件"
  fi

  # 安装依赖
  log "安装 npm 依赖..."
  npm install || {
    error "npm 安装依赖失败"
    return 1
  }

  # 构建项目
  log "执行 Next.js 构建..."
  # 再次确保环境变量可用
  if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
  fi
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
}

# 部署新版本
deploy_new_version() {
  log "部署新版本..."

  # 创建部署目录
  log "创建部署目录..."
  mkdir -p "$DEPLOY_PATH" || {
    error "创建部署目录失败"
    return 1
  }
  log "部署目录权限检查: $(ls -la "$(dirname "$DEPLOY_PATH")")"

  # 检查并停止任何现有的PM2进程
  if pm2 describe "$PROJECT_NAME" > /dev/null 2>&1; then
    log "停止当前应用..."
    pm2 stop "$PROJECT_NAME" || {
      warning "停止当前应用出现问题，尝试强制停止"
      pm2 delete "$PROJECT_NAME" || true
    }
    success "当前应用已停止"
  else
    warning "没有找到当前运行的应用 $PROJECT_NAME，跳过停止"
  fi

  # 删除旧版本文件（保留 node_modules 可优化）
  log "清理旧版本文件..."
  find "$DEPLOY_PATH" -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec rm -rf {} + || {
    error "清理旧版本文件失败"
    return 1
  }
  log "旧版本文件清理完成"

  # 复制新版本文件 - 使用更可靠的方法
  log "开始复制新版本文件..."
  log "构建目录内容: $(ls -la "$BUILD_PATH")"
  
  # 先复制非隐藏文件和目录
  cp -r "$BUILD_PATH"/* "$DEPLOY_PATH/" || {
    error "复制主要文件失败"
    return 1
  }
  
  # 单独处理public目录，确保它被正确复制
  if [ -d "$BUILD_PATH/public" ]; then
    log "单独复制 public 目录..."
    # 删除可能存在的旧public目录
    rm -rf "$DEPLOY_PATH/public"
    # 使用更可靠的复制命令
    cp -a "$BUILD_PATH/public" "$DEPLOY_PATH/" || {
      error "public 目录复制失败"
      return 1
    }
    # 设置正确的权限
    chmod -R 755 "$DEPLOY_PATH/public"
    # 处理navbar目录大小写问题 - 创建大小写兼容的符号链接
    if [ -d "$DEPLOY_PATH/public/images/navbar" ] && [ ! -d "$DEPLOY_PATH/public/images/navBar" ]; then
      log "为navbar目录创建大小写兼容的符号链接..."
      cd "$DEPLOY_PATH/public/images"
      ln -s navbar navBar 2>/dev/null || true
      cd - >/dev/null
      log "已创建navBar符号链接指向navbar目录"
    fi
    log "public 目录复制完成，内容: $(ls -la "$DEPLOY_PATH/public")"
    # 显示images目录的具体内容以验证
    if [ -d "$DEPLOY_PATH/public/images" ]; then
      log "public/images目录内容: $(ls -la "$DEPLOY_PATH/public/images" | head -10)"
    else
      error "public/images目录不存在！"
    fi
  else
    error "构建目录中不存在 public 目录！"
    return 1
  fi
  
  # 单独复制 .next 目录以确保它被正确复制
  log "单独复制 .next 目录..."
  if [ -d "$BUILD_PATH/.next" ]; then
    log ".next 目录内容: $(ls -la "$BUILD_PATH/.next")"
    cp -r "$BUILD_PATH/.next" "$DEPLOY_PATH/" || {
      error ".next 目录复制失败"
      return 1
    }
    log ".next 目录复制完成"
  else
    error "构建目录中不存在 .next 目录"
    return 1
  fi
  
  # 确保.env.local文件被复制到部署目录
  if [ -f "$BUILD_PATH/.env.local" ]; then
    cp "$BUILD_PATH/.env.local" "$DEPLOY_PATH/"
    success ".env.local 文件已复制到部署目录"
  fi

  # 验证部署目录中的构建产物
  log "验证部署目录内容: $(ls -la "$DEPLOY_PATH")"
  if [ ! -d "$DEPLOY_PATH/.next" ]; then
    error "部署失败：.next 目录未成功复制到部署目录"
    return 1
  fi
  
  # 验证public目录和images子目录
  if [ ! -d "$DEPLOY_PATH/public" ]; then
    error "部署失败：public 目录未成功复制到部署目录！"
    return 1
  else
    success "public 目录验证通过"
  fi
  
  if [ ! -d "$DEPLOY_PATH/public/images" ]; then
    error "部署失败：public/images 目录不存在！"
    return 1
  else
    success "public/images 目录验证通过"
  fi
  
  if [ ! -f "$DEPLOY_PATH/.next/BUILD_ID" ]; then
    error "部署失败：BUILD_ID 文件未成功复制到部署目录"
    log "部署目录中 .next 内容: $(ls -la "$DEPLOY_PATH/.next" 2>/dev/null || echo "无内容")"
    return 1
  fi

  cd "$DEPLOY_PATH" || {
    error "进入部署目录失败"
    return 1
  }
  success "新版本文件已经移入部署路径，构建产物验证通过"
}

# 启动应用
start_application() {
  log "启动应用程序..."
  cd "$DEPLOY_PATH" || {
    error "进入部署目录失败"
    return 1
  }

  # 检查端口占用并尝试清理
  check_port || {
    warning "端口被占用，尝试清理..."
    kill_port_process || {
      error "无法清理端口占用，请手动检查端口 $APP_PORT"
      return 1
    }
  }

  # 加载环境变量用于启动
  if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
  fi

  # 确保public目录权限正确
  if [ -d "public" ]; then
    log "设置public目录权限..."
    chmod -R 755 "public"
    success "public目录权限已设置"
  fi

  # 使用 pm2 启动，显式指定端口
  if ! pm2 describe "$PROJECT_NAME" > /dev/null 2>&1; then
    log "创建新的 pm2 进程..."
    pm2 start "npm run start" --name "$PROJECT_NAME" -- -p "$APP_PORT" || {
      error "pm2 启动应用失败"
      return 1
    }
    success "应用已启动"
  else
    log "重启 pm2 进程..."
    pm2 restart "$PROJECT_NAME" || {
      error "pm2 重启应用失败"
      return 1
    }
    success "应用已重启"
  fi

  # 保存pm2 配置
  pm2 save || {
    error "保存 pm2 配置失败"
    return 1
  }

  # 等待应用启动并监控状态变化
  log "等待应用启动并监控状态..."
  local max_attempts=15  # 增加尝试次数
  local attempt=1
  local consecutive_online=0
  local status_check_interval=2  # 缩短检查间隔以捕获状态变化

  while [ $attempt -le $max_attempts ]; do
    # 获取PM2状态信息并记录
    local pm2_status=$(pm2 describe "$PROJECT_NAME")
    log "PM2状态检查 (尝试 $attempt/$max_attempts):"
    echo "$pm2_status" | tee -a "$LOG_FILE"
    
    # 检查是否为online状态
    if echo "$pm2_status" | grep -q "online"; then
      log "检测到应用为online状态"
      consecutive_online=$((consecutive_online + 1))
      
      # 如果连续3次检测都是online，则认为稳定启动
      if [ $consecutive_online -ge 3 ]; then
        success "应用 $PROJECT_NAME 已稳定启动"
        return 0
      fi
    else
      # 如果状态不是online，重置连续计数
      log "检测到应用非online状态"
      consecutive_online=0
      
      # 检查是否有错误信息
      if echo "$pm2_status" | grep -q "error"; then
        error "应用 $PROJECT_NAME 启动失败，PM2报告错误"
        # 获取应用日志的最后几行用于诊断
        log "应用日志最后20行:"
        pm2 logs "$PROJECT_NAME" --lines 20 | tee -a "$LOG_FILE"
        return 1
      fi
    fi
    
    sleep $status_check_interval
    attempt=$((attempt + 1))
  done

  # 如果超时，获取详细日志
  error "应用 $PROJECT_NAME 启动超时或状态不稳定"
  log "最终PM2状态:"
  echo "$pm2_status" | tee -a "$LOG_FILE"
  log "应用日志最后20行:"
  pm2 logs "$PROJECT_NAME" --lines 20 | tee -a "$LOG_FILE"
  return 1
}


# 启动应用
start_application() {
  log "启动应用程序..."
  cd "$DEPLOY_PATH" || {
    error "进入部署目录失败"
    return 1
  }

  # 检查端口占用并尝试清理
  check_port || {
    warning "端口被占用，尝试清理..."
    kill_port_process || {
      error "无法清理端口占用，请手动检查端口 $APP_PORT"
      return 1
    }
  }

  # 加载环境变量用于启动
  if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
  fi

  # 使用 pm2 启动，显式指定端口
  if ! pm2 describe "$PROJECT_NAME" > /dev/null 2>&1; then
    log "创建新的 pm2 进程..."
    pm2 start "npm run start" --name "$PROJECT_NAME" -- -p "$APP_PORT" || {
      error "pm2 启动应用失败"
      return 1
    }
    success "应用已启动"
  else
    log "重启 pm2 进程..."
    pm2 restart "$PROJECT_NAME" || {
      error "pm2 重启应用失败"
      return 1
    }
    success "应用已重启"
  fi

  # 保存pm2 配置
  pm2 save || {
    error "保存 pm2 配置失败"
    return 1
  }

  # 等待应用启动并监控状态变化
  log "等待应用启动并监控状态..."
  local max_attempts=15  # 增加尝试次数
  local attempt=1
  local consecutive_online=0
  local status_check_interval=2  # 缩短检查间隔以捕获状态变化

  while [ $attempt -le $max_attempts ]; do
    # 获取PM2状态信息并记录
    local pm2_status=$(pm2 describe "$PROJECT_NAME")
    log "PM2状态检查 (尝试 $attempt/$max_attempts):"
    echo "$pm2_status" | tee -a "$LOG_FILE"
    
    # 检查是否为online状态
    if echo "$pm2_status" | grep -q "online"; then
      log "检测到应用为online状态"
      consecutive_online=$((consecutive_online + 1))
      
      # 如果连续3次检测都是online，则认为稳定启动
      if [ $consecutive_online -ge 3 ]; then
        success "应用 $PROJECT_NAME 已稳定启动"
        return 0
      fi
    else
      # 如果状态不是online，重置连续计数
      log "检测到应用非online状态"
      consecutive_online=0
      
      # 检查是否有错误信息
      if echo "$pm2_status" | grep -q "error"; then
        error "应用 $PROJECT_NAME 启动失败，PM2报告错误"
        # 获取应用日志的最后几行用于诊断
        log "应用日志最后20行:"
        pm2 logs "$PROJECT_NAME" --lines 20 | tee -a "$LOG_FILE"
        return 1
      fi
    fi
    
    sleep $status_check_interval
    attempt=$((attempt + 1))
  done

  # 如果超时，获取详细日志
  error "应用 $PROJECT_NAME 启动超时或状态不稳定"
  log "最终PM2状态:"
  echo "$pm2_status" | tee -a "$LOG_FILE"
  log "应用日志最后20行:"
  pm2 logs "$PROJECT_NAME" --lines 20 | tee -a "$LOG_FILE"
  return 1
}

# 健康检查
health_check() {
  log "执行健康检查..."
  local max_attempts=10
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:$APP_PORT > /dev/null 2>&1; then
      success "应用 $PROJECT_NAME 健康检查通过"
      return 0
    fi
    warning "健康检查尝试 $attempt/$max_attempts - 应用 $PROJECT_NAME 失败，等待 5 秒后重试..."
    sleep 5
    attempt=$((attempt + 1))
  done

  error "应用 $PROJECT_NAME 健康检查失败，$max_attempts 次尝试后未成功"
  return 1
}

# 回滚到上一个版本
rollback() {
  error "开始回滚到上一个版本..."
  # 检查是否有备份
  if [ ! -d "$BACKUP_PATH" ]; then
    error "没有找到备份目录 $BACKUP_PATH"
    return 1
  fi

  # 查找最新备份
  latest_backup=$(ls -td "$BACKUP_PATH"/backup_* 2>/dev/null | head -n 1)
  if [ -z "$latest_backup" ]; then
    error "没有找到任何备份"
    return 1
  fi

  # 回滚到最新备份
  log "回滚到备份 $latest_backup..."

  # 停止当前应用
  if pm2 describe "$PROJECT_NAME" > /dev/null 2>&1; then
    log "停止当前应用..."
    pm2 stop "$PROJECT_NAME" || {
      warning "停止当前应用出现问题，尝试强制停止"
      pm2 delete "$PROJECT_NAME" || true
    }
    success "当前应用已停止"
  else
    warning "没有找到当前运行的应用 $PROJECT_NAME，跳过停止"
  fi

  # 清理端口占用
  kill_port_process || true

  # 恢复备份
  log "恢复备份 $latest_backup..."
  rm -rf "$DEPLOY_PATH"
  cp -r "$latest_backup"/$PROJECT_NAME "$DEPLOY_PATH" || {
    error "恢复备份 $latest_backup 失败"
    return 1
  }
  success "已恢复备份 $latest_backup"

  # 启动应用
  cd "$DEPLOY_PATH" || {
    error "进入部署目录失败"
    return 1
  }
  pm2 start "npm run start" --name "$PROJECT_NAME" -- -p "$APP_PORT" || {
    error "pm2 启动应用失败"
    return 1
  }
  success "应用已启动, 回滚完成"
}

# 清理旧备份和临时文件
cleanup() {
  log "清理旧文件..."

  # 保留最近 5 个备份
  ls -dt "${BACKUP_PATH}/backup_"* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

  # 清理构建临时文件
  rm -rf "$BUILD_PATH"
  success "清理完成"
}

# 主部署流程
main() {
  log "开始部署 $PROJECT_NAME"

  # 执行部署步骤
  check_dependencies
  # 检查并清理端口占用
  check_port || {
    warning "端口被占用，尝试清理..."
    kill_port_process
  }
  # check_permissions
  validate_env || {
    warning "环境变量验证失败，但将继续部署流程"
  }
  backup_current
  fetch_code
  build_project || {
    error "构建项目失败，执行回滚"
    rollback
    exit 1
  }
  deploy_new_version || {
    error "部署新版本失败，执行回滚"
    rollback
    exit 1
  }
  start_application || {
    error "启动应用失败，执行回滚"
    rollback
    exit 1
  }
  health_check || {
    error "健康检查失败，执行回滚"
    rollback
    exit 1
  }
  cleanup
  success "🎉 $PROJECT_NAME 部署完成！"
}

# 信号处理
trap 'error "部署过程被中断"; rollback; exit 1' INT TERM

# 运行主函数
main "$@"