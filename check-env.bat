@echo off
title TikTok Hot Info - Environment Check

color 0B

echo.
echo ========================================
echo    TikTok B2B - Environment Checker
echo    Detects Missing Dependencies
echo ========================================
echo.

set "MISSING_COUNT=0"
set "NEED_NODE=0"
set "NEED_PYTHON=0"
set "NEED_RESTART=0"

:: Check Node.js
echo [CHECK 1/2] Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js is NOT installed
    echo        Required version: v16 or higher
    echo.
    set /p NODE_CHOICE=Do you want to install Node.js now? (Y/N):
    if /i "!NODE_CHOICE!"=="Y" (
        set "NEED_NODE=1"
        set /a MISSING_COUNT+=1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed
    echo     Version: %NODE_VERSION%

    :: Check version
    for /f "tokens=1,2 delims=." %%a in ("%NODE_VERSION:v=%") do (
        if %%a LSS 16 (
            echo [WARN] Node.js version is too old
            echo        Minimum required: v16.x
            echo        Your version: %NODE_VERSION%
            set /p UPGRADE_NODE=Do you want to upgrade? (Y/N):
            if /i "!UPGRADE_NODE!"=="Y" (
                set "NEED_NODE=1"
                set /a MISSING_COUNT+=1
            )
        )
    )
)
echo.

:: Check Python
echo [CHECK 2/2] Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Python is NOT installed
    echo        Required version: 3.7 or higher
    echo.
    set /p PYTHON_CHOICE=Do you want to install Python now? (Y/N):
    if /i "!PYTHON_CHOICE!"=="Y" (
        set "NEED_PYTHON=1"
        set /a MISSING_COUNT+=1
    )
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] Python is installed
    echo     Version: %PYTHON_VERSION%

    :: Check if PATH is set correctly
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] Python may not be in PATH
    )
)
echo.

:: Summary
echo ========================================
echo    SUMMARY
echo ========================================
echo.

if %MISSING_COUNT% GTR 0 (
    echo Missing Dependencies: %MISSING_COUNT%
    echo.
    if %NEED_NODE% EQU 1 (
        echo [-] Node.js needs to be installed
    )
    if %NEED_PYTHON% EQU 1 (
        echo [-] Python needs to be installed
    )
    echo.
    echo ========================================
    echo    Installation Options
    echo ========================================
    echo.
    echo 1. Run start-auto.bat (Automatic Installation)
    echo    - Downloads and installs everything
    echo    - Requires internet connection
    echo    - May require administrator privileges
    echo.
    echo 2. Manual Installation
    echo    - Node.js: https://nodejs.org/
    echo    - Python:  https://www.python.org/
    echo.
    echo 3. Run with Administrator privileges
    echo    - Right-click the script
    echo    - Select "Run as administrator"
    echo.

    set /p AUTO_INSTALL=Would you like to run automatic installation now? (Y/N):
    if /i "!AUTO_INSTALL!"=="Y" (
        echo.
        echo Starting automatic installation...
        call start-auto.bat
    ) else (
        echo.
        echo Please install the missing dependencies manually
        echo or run start-auto.bat when ready.
        echo.
    )
) else (
    echo [SUCCESS] All dependencies are installed!
    echo.
    echo You can now run start.bat to launch the application.
    echo.
    set /p LAUNCH_NOW=Would you like to start the application now? (Y/N):
    if /i "!LAUNCH_NOW!"=="Y" (
        call start.bat
    )
)

echo.
pause
