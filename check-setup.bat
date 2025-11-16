@echo off
REM ========================================
REM Inventory System Setup Checker (WSL)
REM ========================================

echo ========================================
echo Inventory System Setup Checker (WSL)
echo ========================================
echo.

set WSL_BASE_PATH=/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system
set ERRORS=0

REM Check WSL
echo [1/6] Checking WSL installation...
where wsl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] WSL is not installed or not in PATH
    echo   Please install WSL: https://docs.microsoft.com/windows/wsl/install
    set /a ERRORS+=1
    goto :skip_wsl_checks
) else (
    echo   [OK] WSL found
)

REM Check Node.js in WSL
echo [2/6] Checking Node.js installation in WSL...
wsl -e bash -c "command -v node" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Node.js is not installed in WSL
    echo   Install: wsl -e bash -c "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('wsl -e bash -c "node --version"') do set NODE_VERSION=%%i
    echo   [OK] Node.js %NODE_VERSION% found in WSL
)

REM Check npm in WSL
echo [3/6] Checking npm installation in WSL...
wsl -e bash -c "command -v npm" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] npm is not installed in WSL
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('wsl -e bash -c "npm --version"') do set NPM_VERSION=%%i
    echo   [OK] npm %NPM_VERSION% found in WSL
)

:skip_wsl_checks

REM Check backend directory in WSL
echo [4/6] Checking backend directory in WSL...
wsl -e bash -c "test -d '%WSL_BASE_PATH%/backend'" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Backend directory not found in WSL
    set /a ERRORS+=1
) else (
    echo   [OK] Backend directory exists

    wsl -e bash -c "test -d '%WSL_BASE_PATH%/backend/node_modules'" 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo   [WARNING] Backend dependencies not installed
        echo   Run: wsl -e bash -c "cd '%WSL_BASE_PATH%/backend' && npm install"
    ) else (
        echo   [OK] Backend dependencies installed
    )
)

REM Check frontend directory in WSL
echo [5/6] Checking frontend directory in WSL...
wsl -e bash -c "test -d '%WSL_BASE_PATH%/frontend'" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Frontend directory not found in WSL
    set /a ERRORS+=1
) else (
    echo   [OK] Frontend directory exists

    wsl -e bash -c "test -d '%WSL_BASE_PATH%/frontend/node_modules'" 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo   [WARNING] Frontend dependencies not installed
        echo   Run: wsl -e bash -c "cd '%WSL_BASE_PATH%/frontend' && npm install"
    ) else (
        echo   [OK] Frontend dependencies installed
    )
)

REM Check database
echo [6/6] Checking database file in WSL...
wsl -e bash -c "test -f '%WSL_BASE_PATH%/backend/data/db.json'" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [INFO] Database will be created on first run
) else (
    echo   [OK] Database file exists
)

echo.
echo ========================================
if %ERRORS% EQU 0 (
    echo Setup Check Complete: ALL SYSTEMS GO!
    echo You can run start-inventory-system.bat
) else (
    echo Setup Check Complete: %ERRORS% ERROR(S) FOUND
    echo Please fix the errors above before launching
)
echo ========================================
echo.

pause
