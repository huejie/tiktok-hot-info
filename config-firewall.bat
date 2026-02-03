@echo off
title TikTok Hot Info - Configure Firewall

color 0E

echo.
echo ========================================
echo    TikTok B2B - Firewall Configuration
echo    Allow Network Access
echo ========================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Administrator privileges required!
    echo.
    echo Please:
echo   1. Right-click this file
echo   2. Select "Run as administrator"
echo   3. Try again
    echo.
    pause
    exit /b 1
)

echo [OK] Running as administrator
echo.

echo ========================================
echo    Adding Firewall Rules
echo ========================================
echo.

echo [1/2] Adding rule for Backend (Port 3000)...
netsh advfirewall firewall add rule name="TikTok Backend" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Rule added successfully
) else (
    echo [INFO] Rule may already exist
)
echo.

echo [2/2] Adding rule for Frontend (Port 8080)...
netsh advfirewall firewall add rule name="TikTok Frontend" dir=in action=allow protocol=TCP localport=8080 profile=any >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Rule added successfully
) else (
    echo [INFO] Rule may already exist
)
echo.

echo ========================================
echo    [SUCCESS] Firewall Configured!
echo ========================================
echo.
echo 📍 Rules added:
echo    • Port 3000 (Backend API) - Allowed
echo    • Port 8080 (Frontend Web) - Allowed
echo.
echo 💡 Other devices can now access your application!
echo.
echo How to access from other devices:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr /v "127.0.0.1"') do (
    echo   Open browser and visit:
    echo   http://%%a:8080/index-vue.html
    echo.
)
echo ========================================
echo.

pause
