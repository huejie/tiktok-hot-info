@echo off
title TikTok Hot Info - Show IP Address

color 0E

echo.
echo ========================================
echo    TikTok B2B - Network Information
echo ========================================
echo.

echo [INFO] Getting network information...
echo.

:: Show local IP addresses
echo Your IP Addresses:
echo.
echo 1. Localhost (this computer only):
echo    http://127.0.0.1:8080/index-vue.html
echo    http://localhost:8080/index-vue.html
echo.

echo 2. Network (other devices on same network):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr /v "127.0.0.1"') do (
    echo    http://%%a:8080/index-vue.html
    echo    Backend: http://%%a:3000/api
    echo.
)

echo ========================================
echo    Firewall Configuration
echo ========================================
echo.
echo If other devices cannot access, you may need to:
echo.
echo Option 1: Allow through Windows Firewall
echo   1. Open Windows Defender Firewall
echo   2. Click "Advanced Settings"
echo   3. Click "Inbound Rules"
echo   4. Click "New Rule"
echo   5. Select "Port"
echo   6. Enter ports: 8080, 3000
echo   7. Select "Allow the connection"
echo   8. Name it "TikTok B2B Platform"
echo   9. Click "Finish"
echo.

echo Option 2: Temporarily disable firewall (NOT RECOMMENDED)
echo   1. Open Windows Defender Firewall
echo   2. Click "Turn Windows Defender Firewall on or off"
echo   3. Turn OFF for private networks
echo   4. Remember to turn it back on later!
echo.

echo Option 3: Use command line (Administrator)
echo   Run these commands as Administrator:
echo.
echo   netsh advfirewall firewall add rule name="TikTok Backend" dir=in action=allow protocol=TCP localport=3000
echo   netsh advfirewall firewall add rule name="TikTok Frontend" dir=in action=allow protocol=TCP localport=8080
echo.

echo ========================================
echo.

pause
