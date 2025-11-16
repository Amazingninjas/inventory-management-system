@echo off
REM ========================================
REM Simple Node.js Upgrade for WSL
REM ========================================

echo ========================================
echo Upgrading Node.js to version 20.x LTS
echo ========================================
echo.
echo Current version: 18.20.8
echo Target version: 20.x (latest LTS)
echo.
echo This will take 2-3 minutes...
echo.
pause

echo.
echo Updating package lists...
wsl -e bash -c "sudo apt update"

echo.
echo Removing old Node.js...
wsl -e bash -c "sudo apt remove -y nodejs npm"

echo.
echo Adding NodeSource repository for Node.js 20...
wsl -e bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"

echo.
echo Installing Node.js 20...
wsl -e bash -c "sudo apt install -y nodejs"

echo.
echo Verifying installation...
wsl -e bash -c "node --version && npm --version"

echo.
echo ========================================
echo Node.js upgrade complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: install-dependencies.bat
echo 2. Then run: start-inventory-system.bat
echo.
pause
