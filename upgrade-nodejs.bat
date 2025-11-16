@echo off
REM ========================================
REM Upgrade Node.js in WSL
REM ========================================

echo ========================================
echo Node.js Upgrade Script for WSL
echo ========================================
echo.
echo This will upgrade Node.js to version 20.x (LTS)
echo Current version: 18.20.8
echo Required version: 20.19+ or 22.12+
echo.
pause

echo.
echo Step 1: Installing NVM (Node Version Manager)...
wsl -e bash -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"

echo.
echo Step 2: Loading NVM...
wsl -e bash -c "export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && nvm --version"

echo.
echo Step 3: Installing Node.js 20 LTS...
wsl -e bash -c "export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && nvm install 20 && nvm use 20 && nvm alias default 20"

echo.
echo Step 4: Verifying installation...
wsl -e bash -c "export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && node --version && npm --version"

echo.
echo ========================================
echo Node.js upgrade complete!
echo ========================================
echo.
echo IMPORTANT: You may need to close and reopen WSL terminals
echo for the changes to take effect.
echo.
echo After upgrading, run install-dependencies.bat again.
echo.
pause
