# ========================================
# Inventory Management System Launcher
# PowerShell Script (WSL Version)
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Inventory Management System Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"

# Convert Windows path to WSL path
# C:\Users\Justin\Desktop\AI Projects\ -> /mnt/c/Users/Justin/Desktop/AI Projects/
$WslBasePath = "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system"
$WslBackendPath = "$WslBasePath/backend"
$WslFrontendPath = "$WslBasePath/frontend"

# Check if directories exist
if (-not (Test-Path $BackendDir)) {
    Write-Host "ERROR: Backend directory not found at: $BackendDir" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

if (-not (Test-Path $FrontendDir)) {
    Write-Host "ERROR: Frontend directory not found at: $FrontendDir" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if node_modules exist
$BackendNodeModules = Join-Path $BackendDir "node_modules"
$FrontendNodeModules = Join-Path $FrontendDir "node_modules"

if (-not (Test-Path $BackendNodeModules)) {
    Write-Host "WARNING: Backend dependencies not installed." -ForegroundColor Yellow
    Write-Host "Run 'npm install' in the backend directory first." -ForegroundColor Yellow
    Write-Host ""
}

if (-not (Test-Path $FrontendNodeModules)) {
    Write-Host "WARNING: Frontend dependencies not installed." -ForegroundColor Yellow
    Write-Host "Run 'npm install' in the frontend directory first." -ForegroundColor Yellow
    Write-Host ""
}

# Launch Backend Server in WSL
Write-Host "[1/2] Launching Backend Server (WSL)..." -ForegroundColor Green
Start-Process wsl -ArgumentList "-e", "bash", "-c", "cd '$WslBackendPath' && echo -e '\033[0;36mInventory Backend Server\033[0m' && npm run dev; exec bash"

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Launch Frontend Server in WSL
Write-Host "[2/2] Launching Frontend Server (WSL)..." -ForegroundColor Green
Start-Process wsl -ArgumentList "-e", "bash", "-c", "cd '$WslFrontendPath' && echo -e '\033[0;36mInventory Frontend Server\033[0m' && npm run dev; exec bash"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Both servers are launching in WSL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  " -NoNewline
Write-Host "http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "Frontend: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Two WSL terminal windows will open." -ForegroundColor Gray
Write-Host "Close those windows to stop the servers." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This window will close in 5 seconds..." -ForegroundColor Gray

Start-Sleep -Seconds 5
