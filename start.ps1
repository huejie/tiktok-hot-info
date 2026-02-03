# TikTok B2B 工厂出口信息平台 - PowerShell 启动脚本
# 使用方法：右键点击 -> 使用 PowerShell 运行

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色设置
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorInfo = "Cyan"
$colorHeader = "Magenta"

# 清屏并显示标题
Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  TikTok B2B 工厂出口信息平台" -ForegroundColor $colorHeader
Write-Host "  一键启动脚本 (PowerShell) v1.0" -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host ""

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# 函数：检查命令是否存在
function Test-Command {
    param([string]$Command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $Command) { return $true }
    }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# 函数：停止指定端口的进程
function Stop-PortProcess {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess |
                Select-Object -Unique
    if ($process) {
        Write-Host "  ⚠️  发现占用端口的进程，正在关闭..." -ForegroundColor $colorWarning
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ 进程已关闭" -ForegroundColor $colorSuccess
        return $true
    }
    return $false
}

# 步骤 1: 检查 Node.js
Write-Host "[1/5] 检查 Node.js 环境..." -ForegroundColor $colorInfo
if (Test-Command "node") {
    Write-Host "  ✅ Node.js 已安装" -ForegroundColor $colorSuccess
    $nodeVersion = node --version
    Write-Host "     版本: $nodeVersion" -ForegroundColor $colorSuccess
} else {
    Write-Host "  ❌ 错误: 未找到 Node.js" -ForegroundColor $colorError
    Write-Host "  请访问 https://nodejs.org/ 安装 Node.js" -ForegroundColor $colorWarning
    Read-Host "按任意键退出"
    exit 1
}
Write-Host ""

# 步骤 2: 检查 Python
Write-Host "[2/5] 检查 Python 环境..." -ForegroundColor $colorInfo
if (Test-Command "python") {
    Write-Host "  ✅ Python 已安装" -ForegroundColor $colorSuccess
    $pythonVersion = python --version
    Write-Host "     版本: $pythonVersion" -ForegroundColor $colorSuccess
} else {
    Write-Host "  ❌ 错误: 未找到 Python" -ForegroundColor $colorError
    Write-Host "  请访问 https://www.python.org/ 安装 Python" -ForegroundColor $colorWarning
    Read-Host "按任意键退出"
    exit 1
}
Write-Host ""

# 步骤 3: 检查端口占用
Write-Host "[3/5] 检查端口占用..." -ForegroundColor $colorInfo
Write-Host "  检查端口 3000 (后端)..." -ForegroundColor $colorInfo
Stop-PortProcess -Port 3000
if (-not $?) {
    Write-Host "  ✅ 端口 3000 可用" -ForegroundColor $colorSuccess
}

Write-Host "  检查端口 8080 (前端)..." -ForegroundColor $colorInfo
Stop-PortProcess -Port 8080
if (-not $?) {
    Write-Host "  ✅ 端口 8080 可用" -ForegroundColor $colorSuccess
}
Write-Host ""

# 步骤 4: 检查依赖
Write-Host "[4/5] 检查后端依赖..." -ForegroundColor $colorInfo
if (!(Test-Path "backend\node_modules")) {
    Write-Host "  📦 正在安装后端依赖..." -ForegroundColor $colorWarning
    Set-Location backend
    npm install
    Set-Location $scriptPath
    Write-Host "  ✅ 后端依赖安装完成" -ForegroundColor $colorSuccess
} else {
    Write-Host "  ✅ 后端依赖已存在" -ForegroundColor $colorSuccess
}
Write-Host ""

# 步骤 5: 启动服务
Write-Host "[5/5] 启动服务..." -ForegroundColor $colorInfo
Write-Host ""

Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  正在启动后端服务 (端口 3000)..." -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd backend && npm run dev" -PassThru -WindowStyle Normal
Write-Host "  ✅ 后端服务已启动 (PID: $($backendProcess.Id))" -ForegroundColor $colorSuccess
Write-Host ""

Write-Host "⏳ 等待后端服务启动 (5秒)..." -ForegroundColor $colorWarning
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  正在启动前端服务 (端口 8080)..." -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd web && python -m http.server 8080 --bind 127.0.0.1" -PassThru -WindowStyle Normal
Write-Host "  ✅ 前端服务已启动 (PID: $($frontendProcess.Id))" -ForegroundColor $colorSuccess
Write-Host ""

Write-Host "⏳ 等待前端服务启动 (2秒)..." -ForegroundColor $colorWarning
Start-Sleep -Seconds 2

# 打开浏览器
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  正在打开浏览器..." -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:8080/index-vue.html"

# 显示成功信息
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host "  ✅ 所有服务启动成功！" -ForegroundColor $colorSuccess
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "📍 服务地址:" -ForegroundColor $colorInfo
Write-Host "   • 前端页面: http://127.0.0.1:8080/index-vue.html" -ForegroundColor $colorSuccess
Write-Host "   • 后端 API: http://localhost:3000/api" -ForegroundColor $colorSuccess
Write-Host "   • Vue 版本: http://127.0.0.1:8080/index-vue.html" -ForegroundColor $colorSuccess
Write-Host "   • HTML 版本: http://127.0.0.1:8080/index.html" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor $colorInfo
Write-Host "   • 关闭此窗口不会停止服务" -ForegroundColor $colorWarning
Write-Host "   • 如需停止服务，请运行 stop.bat" -ForegroundColor $colorWarning
Write-Host "   • 或手动关闭打开的命令行窗口" -ForegroundColor $colorWarning
Write-Host ""
Write-Host "🎉 享受使用 TikTok B2B 平台！" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host ""

# 保存进程 ID 到文件（用于停止脚本）
@($backendProcess.Id, $frontendProcess.Id) | Out-File -FilePath ".pids" -Encoding UTF8

Write-Host "按任意键退出此启动器（服务将继续运行）..." -ForegroundColor $colorWarning
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
