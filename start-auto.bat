@echo off
title TikTok Hot Info - Auto Setup & Launch

setlocal enabledelayedexpansion

:: Set download directory
set "DOWNLOAD_DIR=%TEMP%\tiktok-installer"
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"

echo.
echo ========================================
echo    TikTok B2B Platform - Auto Setup
echo    Intelligent Launcher v2.0
echo ========================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] No administrator privileges detected
    echo [INFO] Some operations may require elevation
    echo.
    echo Press any key to continue anyway...
    pause >nul
    echo.
)

:: =====================================================
:: Step 1: Check and Install Node.js
:: =====================================================
echo [1/6] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js not found. Downloading installer...
    echo.

    :: Set URLs
    set "NODE_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    set "NODE_INSTALLER=%DOWNLOAD_DIR%\node-installer.msi"

    echo [DOWNLOAD] Downloading Node.js v20.11.0...
    echo           Source: nodejs.org
    echo           Size: ~30 MB
    echo           Please wait...
    echo.

    :: Download using bitsadmin (more reliable)
    bitsadmin /transfer download /priority normal %NODE_URL% "%NODE_INSTALLER%"

    if exist "%NODE_INSTALLER%" (
        echo [OK] Download completed
        echo.
        echo [INSTALL] Installing Node.js...
        echo           This may take 1-2 minutes...
        echo           Please wait...
        echo.

        :: Install Node.js
        msiexec /i "%NODE_INSTALLER%" /quiet /norestart

        :: Wait for installation
        echo [INFO] Waiting for installation to complete...
        timeout /t 30 /nobreak >nul

        :: Refresh environment
        if defined REFRESH_ENV (
            call REFRESH_ENV
        )

        :: Check if installation succeeded
        where node >nul 2>&1
        if %errorlevel% equ 0 (
            echo.
            echo [SUCCESS] Node.js installed successfully!
            node --version
        ) else (
            echo.
            echo [WARN] Node.js installed but may need system restart
            echo.
            echo IMPORTANT: Please restart your computer and run this script again
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo [ERROR] Failed to download Node.js installer
        echo.
        echo Please try one of these options:
        echo   1. Run this script as administrator
        echo   2. Check your internet connection
        echo   3. Download manually from: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
) else (
    echo [OK] Node.js already installed
    node --version
)
echo.

:: =====================================================
:: Step 2: Check and Install Python
:: =====================================================
echo [2/6] Checking Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Python not found. Downloading installer...
    echo.

    :: Set URLs
    set "PYTHON_URL=https://www.python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe"
    set "PYTHON_INSTALLER=%DOWNLOAD_DIR%\python-installer.exe"

    echo [DOWNLOAD] Downloading Python 3.12.0...
    echo           Source: python.org
    echo           Size: ~25 MB
    echo           Please wait...
    echo.

    :: Download using bitsadmin
    bitsadmin /transfer download /priority normal %PYTHON_URL% "%PYTHON_INSTALLER%"

    if exist "%PYTHON_INSTALLER%" (
        echo [OK] Download completed
        echo.
        echo [INSTALL] Installing Python...
        echo           This may take 1-2 minutes...
        echo           Please wait...
        echo.

        :: Install Python silently with PATH
        "%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

        :: Wait for installation
        echo [INFO] Waiting for installation to complete...
        timeout /t 30 /nobreak >nul

        :: Refresh environment
        if defined REFRESH_ENV (
            call REFRESH_ENV
        )

        :: Check installation
        where python >nul 2>&1
        if %errorlevel% equ 0 (
            echo.
            echo [SUCCESS] Python installed successfully!
            python --version
        ) else (
            echo.
            echo [WARN] Python installed but may need system restart
            echo.
            echo IMPORTANT: Please restart your computer and run this script again
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo [ERROR] Failed to download Python installer
        echo.
        echo Please try one of these options:
        echo   1. Run this script as administrator
        echo   2. Check your internet connection
        echo   3. Download manually from: https://www.python.org/
        echo.
        pause
        exit /b 1
    )
) else (
    echo [OK] Python already installed
    python --version
)
echo.

:: =====================================================
:: Step 3: Navigate to Project Directory
:: =====================================================
echo [3/6] Setting up project directory...
cd /d "%~dp0"
echo [OK] Current directory: %CD%
echo.

:: =====================================================
:: Step 4: Kill Processes on Ports
:: =====================================================
echo [4/6] Checking port usage...

:: Kill port 3000
echo Checking port 3000 (Backend)...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 3000 is busy, closing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Process closed
) else (
    echo [OK] Port 3000 is available
)

:: Kill port 8080
echo Checking port 8080 (Frontend)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 8080 is busy, closing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Process closed
) else (
    echo [OK] Port 8080 is available
)
echo.

:: =====================================================
:: Step 5: Install Dependencies
:: =====================================================
echo [5/6] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    echo        This may take a few minutes on first run...
    echo.
    cd backend
    call npm install
    cd ..
    echo.
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already exist
)
echo.

:: =====================================================
:: Step 6: Start Services
:: =====================================================
echo [6/6] Starting services...
echo.
echo ========================================
echo    Starting Backend Server (Port 3000)
echo ========================================
cd backend
start "TikTok Backend" cmd /k "npm run dev"
cd %~dp0

echo [INFO] Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    Starting Frontend Server (Port 8080)
echo ========================================
cd web
start "TikTok Frontend" python -m http.server 8080 --bind 127.0.0.1
cd %~dp0

echo [INFO] Waiting for frontend to start (2 seconds)...
timeout /t 2 /nobreak >nul

:: Open browser
echo.
echo ========================================
echo    Opening Browser...
echo ========================================
timeout /t 1 /nobreak >nul
start http://127.0.0.1:8080/index-vue.html

:: Cleanup downloads
echo.
echo [CLEANUP] Removing installer files...
if exist "%DOWNLOAD_DIR%" rd /s /q "%DOWNLOAD_DIR%"

:: Success message
echo.
echo ========================================
echo    [SUCCESS] All Systems Go!
echo ========================================
echo.
echo Service URLs:
echo    Frontend: http://127.0.0.1:8080/index-vue.html
echo    Backend:  http://localhost:3000/api
echo.
echo Tips:
echo    - Closing this window won't stop services
echo    - To stop services, run stop.bat
echo    - Or close the opened command windows
echo.
echo ========================================
echo.
echo Press any key to exit this launcher (services continue running)...
pause >nul
