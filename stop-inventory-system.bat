@echo off
REM ========================================
REM Stop Inventory Management System
REM ========================================

echo Stopping Inventory Management System...
echo.

REM Kill all node processes (this will stop both frontend and backend)
echo Terminating Node.js processes...
taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Servers stopped successfully!
    echo ========================================
) else (
    echo.
    echo No running servers found.
)

echo.
timeout /t 3
