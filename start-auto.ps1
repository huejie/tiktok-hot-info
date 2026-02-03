# TikTok B2B Platform - Automatic Setup & Launch
# Run with PowerShell (Right-click -> Run with PowerShell)

# Set encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Color scheme
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorInfo = "Cyan"
$colorHeader = "Magenta"

# Clear screen
Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  TikTok B2B Platform - Auto Setup" -ForegroundColor $colorHeader
Write-Host "  Intelligent Launcher v2.0" -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host ""

# Function: Download file with progress
function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath
    )

    try {
        Write-Host "Downloading..." -ForegroundColor $colorInfo
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $OutputPath)
        $webClient.Dispose()
        return $true
    }
    catch {
        Write-Host "Failed: $_" -ForegroundColor $colorError
        return $false
    }
}

# Function: Install Node.js
function Install-NodeJs {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $colorHeader
    Write-Host "  Installing Node.js" -ForegroundColor $colorHeader
    Write-Host "========================================" -ForegroundColor $colorHeader
    Write-Host ""

    $nodeVersion = "v20.11.0"
    $nodeUrl = "https://nodejs.org/dist/$nodeVersion/node-v20.11.0-x64.msi"
    $installerPath = "$env:TEMP\node-installer.msi"

    Write-Host "Version: $nodeVersion" -ForegroundColor $colorInfo
    Write-Host "Source: $nodeUrl" -ForegroundColor $colorInfo
    Write-Host ""

    Write-Host "Downloading installer (approx. 30MB)..." -ForegroundColor $colorWarning
    if (Download-File -Url $nodeUrl -OutputPath $installerPath) {
        Write-Host "[OK] Download completed" -ForegroundColor $colorSuccess
        Write-Host ""

        Write-Host "Installing Node.js..." -ForegroundColor $colorInfo
        Write-Host "This may take 1-2 minutes..." -ForegroundColor $colorWarning
        Write-Host ""

        $installArgs = @(
            "/i"
            $installerPath
            "/quiet"
            "/norestart"
        )

        $process = Start-Process "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru

        if ($process.ExitCode -eq 0) {
            Write-Host "[SUCCESS] Node.js installed!" -ForegroundColor $colorSuccess

            # Refresh environment
            Write-Host "Refreshing environment variables..." -ForegroundColor $colorInfo
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

            # Wait for PATH to update
            Start-Sleep -Seconds 5

            # Verify installation
            $nodePath = Join-Path $env:ProgramFiles "nodejs\node.exe"
            if (Test-Path $nodePath) {
                $version = & $nodePath --version
                Write-Host "Version: $version" -ForegroundColor $colorSuccess
                return $true
            } else {
                Write-Host "[WARN] Node.js installed but not in PATH yet" -ForegroundColor $colorWarning
                Write-Host "Please restart your computer and run this script again" -ForegroundColor $colorWarning
                return $false
            }
        } else {
            Write-Host "[ERROR] Installation failed with exit code: $($process.ExitCode)" -ForegroundColor $colorError
            return $false
        }
    } else {
        Write-Host "[ERROR] Failed to download installer" -ForegroundColor $colorError
        Write-Host "Please download manually from: https://nodejs.org/" -ForegroundColor $colorInfo
        return $false
    }

    # Cleanup
    if (Test-Path $installerPath) {
        Remove-Item $installerPath -Force
    }
}

# Function: Install Python
function Install-Python {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $colorHeader
    Write-Host "  Installing Python" -ForegroundColor $colorHeader
    Write-Host "========================================" -ForegroundColor $colorHeader
    Write-Host ""

    $pythonVersion = "3.12.0"
    $pythonUrl = "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-amd64.exe"
    $installerPath = "$env:TEMP\python-installer.exe"

    Write-Host "Version: $pythonVersion" -ForegroundColor $colorInfo
    Write-Host "Source: $pythonUrl" -ForegroundColor $colorInfo
    Write-Host ""

    Write-Host "Downloading installer (approx. 25MB)..." -ForegroundColor $colorWarning
    if (Download-File -Url $pythonUrl -OutputPath $installerPath) {
        Write-Host "[OK] Download completed" -ForegroundColor $colorSuccess
        Write-Host ""

        Write-Host "Installing Python..." -ForegroundColor $colorInfo
        Write-Host "This may take 1-2 minutes..." -ForegroundColor $colorWarning
        Write-Host ""

        $installArgs = @(
            "/quiet"
            "InstallAllUsers=1"
            "PrependPath=1"
            "Include_test=0"
        )

        $process = Start-Process $installerPath -ArgumentList $installArgs -Wait -PassThru

        if ($process.ExitCode -eq 0) {
            Write-Host "[SUCCESS] Python installed!" -ForegroundColor $colorSuccess

            # Refresh environment
            Write-Host "Refreshing environment variables..." -ForegroundColor $colorInfo
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

            # Wait for PATH to update
            Start-Sleep -Seconds 5

            # Verify installation
            $pythonPath = Join-Path $env:ProgramFiles "Python312\python.exe"
            if (Test-Path $pythonPath) {
                $version = & $pythonPath --version
                Write-Host "Version: $version" -ForegroundColor $colorSuccess
                return $true
            } else {
                Write-Host "[WARN] Python installed but not in PATH yet" -ForegroundColor $colorWarning
                Write-Host "Please restart your computer and run this script again" -ForegroundColor $colorWarning
                return $false
            }
        } else {
            Write-Host "[ERROR] Installation failed with exit code: $($process.ExitCode)" -ForegroundColor $colorError
            return $false
        }
    } else {
        Write-Host "[ERROR] Failed to download installer" -ForegroundColor $colorError
        Write-Host "Please download manually from: https://www.python.org/" -ForegroundColor $colorInfo
        return $false
    }

    # Cleanup
    if (Test-Path $installerPath) {
        Remove-Item $installerPath -Force
    }
}

# Check administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[WARN] Not running as administrator" -ForegroundColor $colorWarning
    Write-Host "       Some operations may require elevation" -ForegroundColor $colorInfo
    Write-Host ""
    $response = Read-Host "Continue anyway? (Y/N)"
    if ($response -ne "Y") {
        exit
    }
    Write-Host ""
}

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# =====================================================
# Step 1: Check Node.js
# =====================================================
Write-Host "[1/6] Checking Node.js..." -ForegroundColor $colorInfo

$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Node.js is installed" -ForegroundColor $colorSuccess
        Write-Host "     Version: $nodeVersion" -ForegroundColor $colorSuccess

        # Check version
        $versionParts = $nodeVersion.Replace("v", "").Split(".")
        $majorVersion = [int]$versionParts[0]
        if ($majorVersion -lt 16) {
            Write-Host "[WARN] Node.js version is too old (v16+ required)" -ForegroundColor $colorWarning
            $response = Read-Host "Upgrade to latest version? (Y/N)"
            if ($response -eq "Y") {
                $nodeInstalled = Install-NodeJs
            }
        } else {
            $nodeInstalled = $true
        }
    }
} catch {
    # Node not found
}

if (-not $nodeInstalled) {
    Write-Host "[FAIL] Node.js is not installed" -ForegroundColor $colorError
    Write-Host ""
    $response = Read-Host "Install Node.js automatically? (Y/N)"

    if ($response -eq "Y") {
        $nodeInstalled = Install-NodeJs
        if (-not $nodeInstalled) {
            Write-Host ""
            Write-Host "Please restart your computer and run this script again" -ForegroundColor $colorWarning
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "Node.js is required to run this application" -ForegroundColor $colorError
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor $colorInfo
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

# =====================================================
# Step 2: Check Python
# =====================================================
Write-Host "[2/6] Checking Python..." -ForegroundColor $colorInfo

$pythonInstalled = $false
try {
    $pythonVersion = python --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Python is installed" -ForegroundColor $colorSuccess
        Write-Host "     Version: $pythonVersion" -ForegroundColor $colorSuccess
        $pythonInstalled = $true
    }
} catch {
    # Python not found
}

if (-not $pythonInstalled) {
    Write-Host "[FAIL] Python is not installed" -ForegroundColor $colorError
    Write-Host ""
    $response = Read-Host "Install Python automatically? (Y/N)"

    if ($response -eq "Y") {
        $pythonInstalled = Install-Python
        if (-not $pythonInstalled) {
            Write-Host ""
            Write-Host "Please restart your computer and run this script again" -ForegroundColor $colorWarning
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "Python is required to run this application" -ForegroundColor $colorError
        Write-Host "Download from: https://www.python.org/" -ForegroundColor $colorInfo
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

# =====================================================
# Step 3: Navigate to project directory
# =====================================================
Write-Host "[3/6] Setting up project directory..." -ForegroundColor $colorInfo
Write-Host "     Location: $scriptPath" -ForegroundColor $colorSuccess
Write-Host ""

# =====================================================
# Step 4: Check and kill port processes
# =====================================================
Write-Host "[4/6] Checking port usage..." -ForegroundColor $colorInfo

function Stop-PortProcess {
    param([int]$Port)

    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess |
                Select-Object -Unique

    if ($process) {
        Write-Host "  [WARN] Port $Port is busy, closing..." -ForegroundColor $colorWarning
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Process closed" -ForegroundColor $colorSuccess
        Start-Sleep -Milliseconds 500
        return $true
    }
    return $false
}

Write-Host "  Checking port 3000 (Backend)..." -ForegroundColor $colorInfo
Stop-PortProcess -Port 3000
if (-not $?) {
    Write-Host "  [OK] Port 3000 is available" -ForegroundColor $colorSuccess
}

Write-Host "  Checking port 8080 (Frontend)..." -ForegroundColor $colorInfo
Stop-PortProcess -Port 8080
if (-not $?) {
    Write-Host "  [OK] Port 8080 is available" -ForegroundColor $colorSuccess
}
Write-Host ""

# =====================================================
# Step 5: Install dependencies
# =====================================================
Write-Host "[5/6] Checking dependencies..." -ForegroundColor $colorInfo

if (!(Test-Path "backend\node_modules")) {
    Write-Host "  [INFO] Installing backend dependencies..." -ForegroundColor $colorWarning
    Write-Host "         This may take a few minutes..." -ForegroundColor $colorWarning
    Write-Host ""

    Push-Location backend
    npm install
    Pop-Location

    Write-Host ""
    Write-Host "  [OK] Dependencies installed" -ForegroundColor $colorSuccess
} else {
    Write-Host "  [OK] Dependencies already exist" -ForegroundColor $colorSuccess
}
Write-Host ""

# =====================================================
# Step 6: Start services
# =====================================================
Write-Host "[6/6] Starting services..." -ForegroundColor $colorInfo
Write-Host ""

Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  Starting Backend Server (Port 3000)" -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader

$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd backend && npm run dev" -PassThru -WindowStyle Normal
Write-Host "  [OK] Backend started (PID: $($backendProcess.Id))" -ForegroundColor $colorSuccess

Write-Host ""
Write-Host "[INFO] Waiting for backend to initialize..." -ForegroundColor $colorInfo
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  Starting Frontend Server (Port 8080)" -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader

$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c cd web && python -m http.server 8080 --bind 127.0.0.1" -PassThru -WindowStyle Normal
Write-Host "  [OK] Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor $colorSuccess

Write-Host ""
Write-Host "[INFO] Waiting for frontend to initialize..." -ForegroundColor $colorInfo
Start-Sleep -Seconds 2

# Open browser
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorHeader
Write-Host "  Opening Browser..." -ForegroundColor $colorHeader
Write-Host "========================================" -ForegroundColor $colorHeader
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:8080/index-vue.html"

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host "  [SUCCESS] All Systems Operational!" -ForegroundColor $colorSuccess
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor $colorInfo
Write-Host "  • Frontend: " -NoNewline -ForegroundColor $colorInfo
Write-Host "http://127.0.0.1:8080/index-vue.html" -ForegroundColor $colorSuccess
Write-Host "  • Backend:  " -NoNewline -ForegroundColor $colorInfo
Write-Host "http://localhost:3000/api" -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "Tips:" -ForegroundColor $colorInfo
Write-Host "  • Closing this window won't stop services" -ForegroundColor $colorWarning
Write-Host "  • To stop services, run stop.bat or stop.ps1" -ForegroundColor $colorWarning
Write-Host "  • Or manually close the opened command windows" -ForegroundColor $colorWarning
Write-Host ""
Write-Host "========================================" -ForegroundColor $colorSuccess
Write-Host ""

# Save process IDs
@($backendProcess.Id, $frontendProcess.Id) | Out-File -FilePath ".pids" -Encoding UTF8

Write-Host "Press any key to exit this launcher..." -ForegroundColor $colorWarning
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
