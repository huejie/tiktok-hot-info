@echo off
title TikTok Hot Info - Stop Services

color 0C

echo.
echo ========================================
echo    TikTok B2B - Stop All Services
echo ========================================
echo.

echo Stopping Backend Server (Port 3000)...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        echo   Closing process PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Backend server stopped
) else (
    echo [INFO] Backend server not running
)
echo.

echo Stopping Frontend Server (Port 8080)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        echo   Closing process PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Frontend server stopped
) else (
    echo [INFO] Frontend server not running
)
echo.

echo ========================================
echo    [SUCCESS] All Services Stopped
echo ========================================
echo.
timeout /t 2 /nobreak >nul
