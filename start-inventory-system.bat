@echo off
REM ========================================
REM Inventory Management System Launcher
REM (WSL Version)
REM ========================================

echo Starting Inventory Management System...
echo.

REM Convert Windows path to WSL path
REM C:\Users\Justin\Desktop\AI Projects\ -> /mnt/c/Users/Justin/Desktop/AI Projects/
set WSL_BASE_PATH=/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system

REM Start Backend Server in new window (WSL)
echo [1/2] Launching Backend Server (WSL)...
start "Inventory Backend" wsl -e bash -c "cd '%WSL_BASE_PATH%/backend' && npm run dev || (echo 'Backend failed to start. Press any key to close.'; read -n 1); exec bash"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start Frontend Server in new window (WSL)
echo [2/2] Launching Frontend Server (WSL)...
start "Inventory Frontend" wsl -e bash -c "cd '%WSL_BASE_PATH%/frontend' && npm run dev || (echo 'Frontend failed to start. Press any key to close.'; read -n 1); exec bash"

echo.
echo ========================================
echo Both servers are launching in WSL!
echo ========================================
echo Backend:  http://localhost:5000/api
echo Frontend: http://localhost:5173
echo.
echo Two WSL windows will open.
echo Close those windows to stop the servers.
echo ========================================
echo.
echo This window can be closed safely.
timeout /t 5
