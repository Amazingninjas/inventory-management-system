# WSL Setup Guide

The Inventory Management System is configured to run in Windows Subsystem for Linux (WSL). This guide explains the setup and launcher scripts.

## Why WSL?

WSL provides a Linux environment on Windows, which is better for Node.js development:
- Better npm compatibility
- Faster file system operations
- Consistent with production Linux environments
- No Windows path issues

## Prerequisites

### 1. WSL Must Be Installed

Check if WSL is installed:
```cmd
wsl --version
```

If not installed, install WSL:
```cmd
wsl --install
```

Or manually:
1. Open PowerShell as Administrator
2. Run: `wsl --install -d Ubuntu`
3. Restart your computer
4. Set up your Ubuntu username and password

### 2. Node.js in WSL

Check if Node.js is installed in WSL:
```cmd
wsl -e bash -c "node --version"
```

If not installed:
```cmd
wsl -e bash -c "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
```

### 3. Install Dependencies

**Option A: Use the install script (Easiest)**
```cmd
Double-click: install-dependencies.bat
```

**Option B: Manual installation**
```cmd
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/backend' && npm install"
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/frontend' && npm install"
```

## Launcher Scripts (WSL-Compatible)

All launcher scripts have been updated to work with WSL:

### 🚀 start-inventory-system.bat
Launches both backend and frontend servers in WSL terminals.

**What it does:**
1. Opens a new WSL terminal for the backend
2. Navigates to `backend/` directory in WSL
3. Runs `npm run dev` in WSL
4. Opens another WSL terminal for the frontend
5. Navigates to `frontend/` directory in WSL
6. Runs `npm run dev` in WSL

**WSL Path Translation:**
- Windows: `C:\Users\Justin\Desktop\AI Projects\inventory-management-system`
- WSL: `/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system`

### 🚀 start-inventory-system.ps1
PowerShell version with better error handling and colored output.

### 🛑 stop-inventory-system.bat
Stops all Node.js processes (both WSL and Windows).

### ✅ check-setup.bat
Verifies your WSL and dependencies are properly configured.

Checks:
1. WSL is installed
2. Node.js is installed in WSL
3. npm is installed in WSL
4. Backend directory exists
5. Frontend directory exists
6. Dependencies are installed
7. Database file exists

### 📦 install-dependencies.bat
Installs all dependencies for both backend and frontend in WSL.

## Desktop Shortcut Setup

### Quick Method
1. Navigate to: `C:\Users\Justin\Desktop\AI Projects\inventory-management-system`
2. Right-click `start-inventory-system.bat`
3. Select **Send to** → **Desktop (create shortcut)**

### Manual Method
1. Right-click Desktop → **New** → **Shortcut**
2. Enter location:
   ```
   C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-inventory-system.bat
   ```
3. Click **Next** → Name it "Start Inventory System" → **Finish**

## Usage

### First Time Setup
1. **Install WSL** (if not already installed)
   ```cmd
   wsl --install
   ```

2. **Install Node.js in WSL** (if not already installed)
   ```cmd
   wsl -e bash -c "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
   ```

3. **Run the setup checker**
   ```cmd
   Double-click: check-setup.bat
   ```

4. **Install dependencies** (if needed)
   ```cmd
   Double-click: install-dependencies.bat
   ```

### Daily Usage
1. **Double-click** your desktop shortcut or `start-inventory-system.bat`
2. **Wait** for both terminals to open and servers to start (~10 seconds)
3. **Open browser** to http://localhost:5173
4. **Work** with the inventory system
5. **Close** the two WSL terminal windows when done

## What Happens When You Launch

```
┌─────────────────────────────────────┐
│  start-inventory-system.bat         │
│  (Windows Batch Script)             │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌─────────┐         ┌─────────┐
│   WSL   │         │   WSL   │
│ Backend │         │Frontend │
│ Terminal│         │Terminal │
└────┬────┘         └────┬────┘
     │                   │
     ▼                   ▼
  npm run dev        npm run dev
     │                   │
     ▼                   ▼
Port 5000            Port 5173
(API Server)      (Dev Server)
```

## Troubleshooting

### "WSL not found" error
**Problem:** WSL is not installed or not in PATH

**Solution:**
```cmd
wsl --install
```
Then restart your computer.

### "Node.js not found in WSL"
**Problem:** Node.js is not installed inside your WSL environment

**Solution:**
```cmd
wsl -e bash -c "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
```

### "Cannot find module" errors
**Problem:** Dependencies not installed

**Solution:**
```cmd
Double-click: install-dependencies.bat
```

Or manually:
```cmd
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/backend' && npm install"
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/frontend' && npm install"
```

### Port already in use
**Problem:** Servers already running or port blocked

**Solution:**
1. Close any open WSL terminals running the servers
2. Run `stop-inventory-system.bat`
3. Try launching again

To check what's using a port:
```cmd
wsl -e bash -c "lsof -i :5000"  # Check backend port
wsl -e bash -c "lsof -i :5173"  # Check frontend port
```

### Terminals close immediately
**Problem:** Error during startup (dependency missing, syntax error, etc.)

**Solution:**
1. Run `check-setup.bat` to verify everything is configured
2. Manually run the commands to see the error:
   ```cmd
   wsl
   cd /mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/backend
   npm run dev
   ```

### Permission denied errors in WSL
**Problem:** File permissions in WSL

**Solution:**
```cmd
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system' && chmod -R 755 ."
```

## Understanding WSL Paths

| Windows Path | WSL Path |
|--------------|----------|
| `C:\` | `/mnt/c/` |
| `C:\Users` | `/mnt/c/Users` |
| `D:\Projects` | `/mnt/d/Projects` |

Your project:
- **Windows:** `C:\Users\Justin\Desktop\AI Projects\inventory-management-system`
- **WSL:** `/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system`

## Accessing Files

### From Windows
Use Windows File Explorer as normal:
```
C:\Users\Justin\Desktop\AI Projects\inventory-management-system
```

### From WSL Terminal
```bash
cd /mnt/c/Users/Justin/Desktop/AI\ Projects/inventory-management-system
```

### WSL Home Directory
Your WSL home directory is separate from Windows:
```bash
cd ~  # Goes to /home/your-username
```

## Tips

1. **Keep terminals open** - Don't close the WSL terminals while using the app
2. **View logs** - Watch the terminal output for errors and debugging info
3. **Use Ctrl+C** in a terminal to stop that specific server
4. **Multiple projects** - Each WSL terminal is independent
5. **Fast restart** - Close terminals and relaunch to restart servers

## Advanced: Running Directly in WSL

If you prefer working entirely in WSL:

1. **Open WSL Terminal**
   ```cmd
   wsl
   ```

2. **Navigate to project**
   ```bash
   cd /mnt/c/Users/Justin/Desktop/AI\ Projects/inventory-management-system
   ```

3. **Start backend** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```

4. **Start frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```

## Quick Reference Commands

```cmd
# Check WSL is installed
wsl --version

# Check Node.js in WSL
wsl -e bash -c "node --version"

# Check npm in WSL
wsl -e bash -c "npm --version"

# Install dependencies
install-dependencies.bat

# Check setup
check-setup.bat

# Start servers
start-inventory-system.bat

# Stop servers
stop-inventory-system.bat

# Open WSL terminal
wsl

# Run backend in WSL (manual)
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/backend' && npm run dev"

# Run frontend in WSL (manual)
wsl -e bash -c "cd '/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system/frontend' && npm run dev"
```

## File Locations

All scripts are in the project root:
```
inventory-management-system/
├── start-inventory-system.bat     ← Main launcher (WSL)
├── start-inventory-system.ps1     ← PowerShell launcher (WSL)
├── stop-inventory-system.bat      ← Stop all servers
├── check-setup.bat                ← Verify WSL setup
├── install-dependencies.bat       ← Install deps in WSL
├── WSL_SETUP.md                   ← This file
├── LAUNCHER_SETUP.md              ← General launcher docs
└── NETWORK_SETUP.md               ← Network access guide
```
