@echo off
REM ========================================
REM Install Dependencies (WSL)
REM ========================================

echo ========================================
echo Installing Dependencies in WSL
echo ========================================
echo.

set WSL_BASE_PATH=/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system

REM Check if WSL is available
where wsl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: WSL is not installed or not in PATH
    echo Please install WSL: https://docs.microsoft.com/windows/wsl/install
    pause
    exit /b 1
)

REM Install backend dependencies
echo [1/2] Installing Backend Dependencies...
echo Running: npm install in backend/
wsl -e bash -c "cd '%WSL_BASE_PATH%/backend' && npm install"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Backend dependencies installed successfully!
echo.

REM Install frontend dependencies
echo [2/2] Installing Frontend Dependencies...
echo Running: npm install in frontend/
wsl -e bash -c "cd '%WSL_BASE_PATH%/frontend' && npm install"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Frontend dependencies installed successfully!

echo.
echo ========================================
echo All dependencies installed!
echo ========================================
echo.
echo You can now run start-inventory-system.bat
echo.

pause
