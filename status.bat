@echo off
title TikTok Hot Info - Service Status

echo.
echo ========================================
echo    TikTok B2B - Service Status Check
echo ========================================
echo.

:: Check backend
echo [Backend Service - Port 3000]
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Status: Running
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        echo    PID: %%a
    )
    echo    URL: http://localhost:3000/api
) else (
    echo [FAIL] Status: Not running
    echo    Please run start.bat to start services
)
echo.

:: Check frontend
echo [Frontend Service - Port 8080]
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Status: Running
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        echo    PID: %%a
    )
    echo    URL: http://127.0.0.1:8080/index-vue.html
) else (
    echo [FAIL] Status: Not running
    echo    Please run start.bat to start services
)
echo.

:: Test API
echo [API Connection Test]
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 2; Write-Host ' [OK] API Connection OK' } catch { Write-Host ' [FAIL] API Connection Failed' }" 2>nul

echo.
echo ========================================
echo.
echo Select an option:
echo   1. Open Frontend Page
echo   2. Start Services
echo   3. Stop Services
echo   4. Refresh Status
echo   0. Exit
echo.
set /p choice=Enter option (0-4):

if "%choice%"=="1" (
    echo Opening browser...
    start http://127.0.0.1:8080/index-vue.html
)
if "%choice%"=="2" (
    echo Starting services...
    call start.bat
)
if "%choice%"=="3" (
    echo Stopping services...
    call stop.bat
)
if "%choice%"=="4" (
    cls
    call status.bat
)
if "%choice%"=="0" (
    exit
)

pause
