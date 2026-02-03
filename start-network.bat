@echo off
title TikTok Hot Info - Network Launch

color 0B

echo.
echo ========================================
echo    TikTok B2B - Network Access Mode
echo    LAN/IP Shared Access
echo ========================================
echo.

:: Get local IP address
echo [INFO] Detecting local IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
)

if defined LOCAL_IP (
    echo [OK] Local IP Address: %LOCAL_IP%
) else (
    echo [WARN] Could not detect IP address
    echo [INFO] Using default address 0.0.0.0
    set LOCAL_IP=0.0.0.0
)
echo.

echo [INFO] Starting services in NETWORK MODE...
echo        Other devices can access via: http://%LOCAL_IP%:8080
echo.

:: Kill processes on ports
echo [1/3] Checking port usage...

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

:: Start services
echo [2/3] Starting services...
echo.
echo ========================================
echo    Starting Backend Server (Port 3000)
echo ========================================
echo [INFO] Listening on: http://0.0.0.0:3000
echo        Accessible via: http://%LOCAL_IP%:3000
echo.

cd backend
start "TikTok Backend" cmd /k "npm run dev"
cd %~dp0

echo [INFO] Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    Starting Frontend Server (Port 8080)
echo ========================================
echo [INFO] Listening on: http://0.0.0.0:8080
echo        Accessible via: http://%LOCAL_IP%:8080
echo.

cd web
start "TikTok Frontend" python -m http.server 8080 --bind 0.0.0.0
cd %~dp0

echo [INFO] Waiting for frontend to start (2 seconds)...
timeout /t 2 /nobreak >nul

:: Show access information
echo.
echo ========================================
echo    [SUCCESS] Services Started!
echo ========================================
echo.
echo 📍 Access Addresses:
echo.
echo    Local (this computer):
echo       http://localhost:8080/index-vue.html
echo       http://127.0.0.1:8080/index-vue.html
echo.
echo    Network (other devices):
echo       http://%LOCAL_IP%:8080/index-vue.html
echo       http://%LOCAL_IP%:8080/index.html
echo.
echo    Backend API:
echo       http://localhost:3000/api
echo       http://%LOCAL_IP%:3000/api
echo.
echo 💡 How to access from other devices:
echo.
echo    1. Make sure both devices are on the SAME network
echo       (e.g., same WiFi or Ethernet)
echo.
echo    2. On other devices, open browser and visit:
echo       http://%LOCAL_IP%:8080/index-vue.html
echo.
echo    3. If not accessible:
echo       - Check Windows Firewall settings
echo       - Make sure port 8080 and 3000 are allowed
echo       - Try disabling VPN temporarily
echo.
echo ========================================
echo.
echo Press any key to exit this launcher (services continue running)...
pause >nul
