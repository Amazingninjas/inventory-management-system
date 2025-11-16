@echo off
REM Stop all inventory system and ngrok processes

echo Stopping all servers...
wsl -e bash "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/stop-with-ngrok.sh"
echo.
echo All servers stopped.
pause
