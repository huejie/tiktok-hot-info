@echo off
title TikTok Hot Info - Quick Start

color 0A

echo.
echo ========================================
echo    TikTok B2B Platform Launcher
echo    One-Click Start Script v1.0
echo ========================================
echo.

:: Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js not found
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed
node --version
echo.

:: Check Python
echo [2/5] Checking Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python not found
    echo Please install Python from: https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python installed
python --version
echo.

:: Go to project directory
cd /d "%~dp0"
echo [INFO] Current directory: %CD%
echo.

:: Kill processes on ports
echo [3/5] Checking port usage...
echo Checking port 3000 (Backend)...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 3000 is busy, closing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Process closed
)

echo Checking port 8080 (Frontend)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 8080 is busy, closing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Process closed
)
echo.

:: Check dependencies
echo [4/5] Checking dependencies...
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies exist
)
echo.

:: Start services
echo [5/5] Starting services...
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

:: Success message
echo.
echo ========================================
echo    [SUCCESS] All Services Started!
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
