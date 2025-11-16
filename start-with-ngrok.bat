@echo off
REM Inventory Management System - Remote Access Launcher (Windows)
REM This launches the system with ngrok tunnels for remote access

echo ======================================
echo Inventory System - Remote Access Mode
echo ======================================
echo.

REM Check if WSL is installed
wsl --list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: WSL is not installed!
    echo Please install WSL first: https://docs.microsoft.com/en-us/windows/wsl/install
    pause
    exit /b 1
)

REM Make scripts executable
wsl -e chmod +x "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/start-with-ngrok.sh"
wsl -e chmod +x "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/stop-with-ngrok.sh"

REM Launch the startup script in WSL
echo Starting servers with ngrok tunnels...
echo.
wsl -e bash "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/start-with-ngrok.sh"

pause
