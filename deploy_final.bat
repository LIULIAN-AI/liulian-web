@echo on
setlocal enabledelayedexpansion

:: 以管理员身份运行检查
NET SESSION >nul 2>&1
if %errorLevel% neq 0 (
    echo 请以管理员身份运行此脚本！
    pause
    exit /b 1
)

echo =======================================================
echo                LIULIAN 前端部署脚本

echo 当前用户: %USERNAME%
echo 当前目录: %CD%
echo 开始部署时间: %date% %time%
echo =======================================================

:: 1. 项目配置
set "PROJECT_NAME=liulian-web"
set "SOURCE_PATH=D:\liulian\liulian-web"
set "HONGKONG_BASE=D:\hongkong"
set "BACKUP_PATH=%HONGKONG_BASE%\backup\%PROJECT_NAME%"
set "DEPLOY_PATH=%HONGKONG_BASE%\var\www\%PROJECT_NAME%"
set "BUILD_PATH=%HONGKONG_BASE%\tmp\%PROJECT_NAME%_build"
set "LOG_FILE=%HONGKONG_BASE%\var\log\%PROJECT_NAME%_deploy.log"

echo.
echo [项目配置]
echo PROJECT_NAME: %PROJECT_NAME%
echo SOURCE_PATH: %SOURCE_PATH%
echo DEPLOY_PATH: %DEPLOY_PATH%
echo =======================================================

:: 2. 创建必要的目录结构 - 分步创建确保成功
echo.
echo [步骤1] 创建目录结构...

md "%HONGKONG_BASE%" >nul 2>&1 && echo 创建基础目录: %HONGKONG_BASE%
md "%BACKUP_PATH%" >nul 2>&1 && echo 创建备份目录: %BACKUP_PATH%
md "%DEPLOY_PATH%" >nul 2>&1 && echo 创建部署目录: %DEPLOY_PATH%
md "%BUILD_PATH%" >nul 2>&1 && echo 创建构建目录: %BUILD_PATH%

:: 3. 创建日志文件
md "%HONGKONG_BASE%\var\log" >nul 2>&1
if not exist "%LOG_FILE%" (
    echo 创建日志文件: %LOG_FILE%
    type nul > "%LOG_FILE%"
)

:: 4. 备份当前版本（如果存在）
echo.
echo [步骤2] 备份当前版本...
if exist "%DEPLOY_PATH%\.next" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set "backup_date=%%c%%a%%b")
    for /f "tokens=1-3 delims=:,." %%a in ('time /t') do (set "backup_time=%%a%%b")
    set "backup_dir=%BACKUP_PATH%\backup_%backup_date%_%backup_time%"
    
    echo 创建备份目录: !backup_dir!
    md "!backup_dir!" >nul 2>&1
    
    echo 开始复制文件到备份...
    xcopy "%DEPLOY_PATH%" "!backup_dir!" /s /e /i /y >nul 2>&1
    
    if %errorLevel% equ 0 (
        echo 备份完成！错误码=%errorLevel%
        echo [%date% %time%] 备份完成至 !backup_dir! >> "%LOG_FILE%"
    ) else (
        echo 警告：备份过程中出现错误！错误码=%errorLevel%
        echo [%date% %time%] 备份出错，错误码=%errorLevel% >> "%LOG_FILE%"
    )
) else (
    echo 没有找到已部署的版本，跳过备份
)

:: 5. 构建项目
echo.
echo [步骤3] 构建项目...
echo 进入源码目录: %SOURCE_PATH%
pushd "%SOURCE_PATH%"

echo 清理旧的构建文件...
if exist "%BUILD_PATH%" rd /s /q "%BUILD_PATH%"
mkdir "%BUILD_PATH%" >nul 2>&1

:: 5. 安装依赖（关键修复：使用call命令）
echo 安装项目依赖...
echo [%date% %time%] 开始安装依赖 >> "%LOG_FILE%"
echo 正在安装依赖...
call npm install >> "%LOG_FILE%" 2>&1
if %errorLevel% neq 0 (
    echo 依赖安装失败！错误码=%errorLevel%
    echo [%date% %time%] 依赖安装失败 >> "%LOG_FILE%"
    popd
    pause
    exit /b 1
)

:: 6. 构建项目（关键修复：使用call命令）
echo 构建项目...
echo [%date% %time%] 开始构建项目 >> "%LOG_FILE%"

call npm run build >> "%LOG_FILE%" 2>&1
if %errorLevel% neq 0 (
    echo 项目构建失败！错误码=%errorLevel%
    echo [%date% %time%] 项目构建失败 >> "%LOG_FILE%"
    popd
    pause
    exit /b 1
)
popd

echo 构建完成！错误码=%errorLevel%
echo [%date% %time%] 项目构建完成 >> "%LOG_FILE%"

:: 6. 部署项目 - 使用测试成功的复制逻辑
echo.
echo [步骤4] 部署项目...

:: 清理部署目录
if exist "%DEPLOY_PATH%" (
    echo 清理部署目录: %DEPLOY_PATH%
    rd /s /q "%DEPLOY_PATH%"
)
mkdir "%DEPLOY_PATH%" >nul 2>&1

echo 开始复制文件到部署目录...

:: 关键修复：确保使用测试成功的复制命令
:: 复制.next目录 - Next.js项目的核心构建文件
if exist "%SOURCE_PATH%\.next" (
    echo 正在复制.next目录...
    xcopy "%SOURCE_PATH%\.next" "%DEPLOY_PATH%\.next" /s /e /i /y >nul 2>&1
    echo 复制.next目录结果: 错误码=%errorLevel%
)

:: 复制public目录（如果存在）
if exist "%SOURCE_PATH%\public" (
    echo 正在复制public目录...
    xcopy "%SOURCE_PATH%\public" "%DEPLOY_PATH%\public" /s /e /i /y >nul 2>&1
    echo 复制public目录结果: 错误码=%errorLevel%
)

:: 复制根目录文件
if exist "%SOURCE_PATH%\package.json" (
    echo 正在复制package.json...
    copy "%SOURCE_PATH%\package.json" "%DEPLOY_PATH%\" >nul 2>&1
    echo 复制package.json结果: 错误码=%errorLevel%
)

if exist "%SOURCE_PATH%\package-lock.json" (
    echo 正在复制package-lock.json...
    copy "%SOURCE_PATH%\package-lock.json" "%DEPLOY_PATH%\" >nul 2>&1
    echo 复制package-lock.json结果: 错误码=%errorLevel%
)

:: 复制环境文件
if exist "%SOURCE_PATH%\.env.local" (
    echo 正在复制.env.local...
    copy "%SOURCE_PATH%\.env.local" "%DEPLOY_PATH%\.env.local" >nul 2>&1
    echo 复制.env.local结果: 错误码=%errorLevel%
)

:: 7. 验证部署结果
echo.
echo =======================================================
echo [步骤5] 验证部署结果:

set "deploy_success=true"

:: 检查关键文件和目录是否存在
echo 检查部署目录内容:
dir /b "%DEPLOY_PATH%"

if not exist "%DEPLOY_PATH%\.next" (
    echo ✗ 错误：.next目录未找到
    set "deploy_success=false"
) else (
    echo ✓ 成功：.next目录已部署
    dir /b "%DEPLOY_PATH%\.next" | findstr "server static" >nul
    if %errorLevel% equ 0 (
        echo    - .next目录包含必要的server和static子目录
    )
)

if not exist "%DEPLOY_PATH%\package.json" (
    echo ✗ 错误：package.json未找到
    set "deploy_success=false"
) else (
    echo ✓ 成功：package.json已部署
)

:: 8. 使用PM2部署应用
echo.
echo =======================================================
echo [步骤6] 使用PM2部署应用:

if "!deploy_success!" equ "true" (
    echo 进入部署目录安装生产依赖...
    pushd "%DEPLOY_PATH%"
    call npm install --production >> "%LOG_FILE%" 2>&1
    if %errorLevel% neq 0 (
        echo ✗ 错误：生产依赖安装失败！错误码=%errorLevel%
        echo [%date% %time%] 部署失败：生产依赖安装失败 >> "%LOG_FILE%"
        set "deploy_success=false"
    ) else (
        echo ✓ 成功：生产依赖安装完成
    )
    
    echo.
    echo 检查PM2是否已安装...
    where pm2 >nul 2>&1
    if %errorLevel% neq 0 (
        echo PM2未安装，正在全局安装PM2...
        npm install -g pm2
    )
    
    echo.
    echo 停止当前运行的应用（如果存在）...
    call pm2 stop %PROJECT_NAME% >nul 2>&1
    call pm2 delete %PROJECT_NAME% >nul 2>&1
    
    echo.
    echo 使用PM2启动应用...
    pushd "%DEPLOY_PATH%"
    @REM call pm2 start npm --name "%PROJECT_NAME%" -- run start
    call pm2 start "cmd" --name "%PROJECT_NAME%" -- /c "npm run start"
    popd
    
    if %errorLevel% equ 0 (
        echo PM2启动成功！
        echo 保存PM2进程列表，确保系统重启后自动恢复...
        call pm2 save
        
        echo.
        echo 当前PM2进程状态:
        call pm2 list | findstr "%PROJECT_NAME%"
        
        echo [%date% %time%] PM2部署成功 >> "%LOG_FILE%"
    ) else (
        echo ❌ PM2启动失败！错误码=%errorLevel%
        echo [%date% %time%] PM2启动失败 >> "%LOG_FILE%"
        set "deploy_success=false"
    )
    popd
)

:: 9. 完成部署
echo.
echo =======================================================
echo 部署完成时间: %date% %time%
echo =======================================================

if "!deploy_success!" equ "true" (
    echo ✅ 部署成功！
    echo [%date% %time%] 部署成功完成 >> "%LOG_FILE%"
    echo.
    echo 应用已通过PM2成功部署和管理
    echo 常用PM2命令:
    echo - 查看应用日志: pm2 logs %PROJECT_NAME%
    echo - 停止应用: pm2 stop %PROJECT_NAME%
    echo - 重启应用: pm2 restart %PROJECT_NAME%
    echo - 查看应用状态: pm2 describe %PROJECT_NAME%
) else (
    echo ❌ 部署失败！
    echo [%date% %time%] 部署失败 >> "%LOG_FILE%"
    echo 请查看日志文件: %LOG_FILE%
)

pause
endlocal