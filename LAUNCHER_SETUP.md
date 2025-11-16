# Desktop Launcher Setup Guide

This guide shows you how to set up one-click desktop shortcuts to launch your Inventory Management System.

## Available Scripts

I've created several launcher scripts for you:

1. **start-inventory-system.bat** - Windows batch file (simple, reliable)
2. **start-inventory-system.ps1** - PowerShell script (better error handling)
3. **stop-inventory-system.bat** - Stops all running servers

## Option 1: Using the Batch File (Recommended)

### Quick Setup - Create Desktop Shortcut

1. **Right-click on your Desktop** → Select **New** → **Shortcut**

2. **For the location, enter:**
   ```
   C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-inventory-system.bat
   ```

3. **Click Next**

4. **Name it:** `Start Inventory System`

5. **Click Finish**

### Optional: Customize the Shortcut Icon

1. Right-click the shortcut → **Properties**
2. Click **Change Icon...**
3. Choose an icon (or browse for a custom .ico file)
4. Under **Run:**, select **Minimized** if you don't want to see the launcher window
5. Click **OK**

### Run It!

Double-click the desktop shortcut and two command windows will open:
- **Inventory Backend** - Backend API server
- **Inventory Frontend** - Frontend development server

## Option 2: Using the PowerShell Script

### Enable PowerShell Scripts (One-Time Setup)

PowerShell scripts require execution permission. Run this **once** as Administrator:

1. **Right-click Start Menu** → **Terminal (Admin)** or **PowerShell (Admin)**
2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **Type `Y` and press Enter**

### Create Desktop Shortcut for PowerShell Script

1. **Right-click on your Desktop** → **New** → **Shortcut**

2. **For the location, enter:**
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-inventory-system.ps1"
   ```

3. **Click Next**

4. **Name it:** `Start Inventory System`

5. **Click Finish**

### Benefits of PowerShell Version:
- Validates that directories exist
- Checks if dependencies are installed
- Color-coded output
- Better error messages

## Stopping the Servers

### Method 1: Close the Windows
Simply close the two command/PowerShell windows that opened.

### Method 2: Use the Stop Script
Double-click `stop-inventory-system.bat` or create a desktop shortcut for it.

**Desktop shortcut location:**
```
C:\Users\Justin\Desktop\AI Projects\inventory-management-system\stop-inventory-system.bat
```

⚠️ **Warning:** This will stop ALL Node.js processes on your computer, not just the inventory system.

## Accessing the Application

Once the servers start:

**Local Access:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

**Network Access (from other devices):**
- **Frontend:** http://YOUR_IP:5173
- **Backend API:** http://YOUR_IP:5000/api

To find your IP: Open Command Prompt and type `ipconfig`

## Troubleshooting

### "Dependencies not installed" error

Run these commands first:

```bash
cd "C:\Users\Justin\Desktop\AI Projects\inventory-management-system\backend"
npm install

cd "C:\Users\Justin\Desktop\AI Projects\inventory-management-system\frontend"
npm install
```

### Port already in use

If you see "Port 5000 is already in use" or "Port 5173 is already in use":

1. Close any running instances of the servers
2. Or use the `stop-inventory-system.bat` script
3. Try launching again

### Backend or Frontend fails to start

1. Make sure you're in the correct directory
2. Verify Node.js is installed: `node --version`
3. Verify npm is installed: `npm --version`
4. Check the console output for specific error messages

### PowerShell script won't run

If you get a "scripts are disabled" error:
1. Run PowerShell as Administrator
2. Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Try again

## Creating a More Polished Shortcut

### Custom Icon
You can download or create a custom .ico file and apply it to your shortcut:
1. Right-click shortcut → Properties → Change Icon
2. Browse to your .ico file

### Run Minimized
To hide the launcher window:
1. Right-click shortcut → Properties
2. Under "Run:", select "Minimized"

### Pin to Taskbar
1. Create the desktop shortcut
2. Right-click it → Pin to taskbar

## Advanced: Auto-Start on Login

To automatically start the system when you log in to Windows:

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Copy your shortcut into this folder

The inventory system will now start automatically when you log in.

⚠️ **Note:** This will consume system resources. Only enable if you use the system frequently.

## Environment Variables

If you need to use custom environment variables (like a different API URL):

### For Batch File:
Edit `start-inventory-system.bat` and add before the `start` commands:
```batch
set VITE_API_URL=http://192.168.1.100:5000/api
set PORT=5000
```

### For PowerShell:
Edit `start-inventory-system.ps1` and add after the directory checks:
```powershell
$env:VITE_API_URL = "http://192.168.1.100:5000/api"
$env:PORT = "5000"
```

### Better Method: Use .env Files
Create `.env` files as described in `NETWORK_SETUP.md` for persistent configuration.

## What Happens When You Launch

1. **Launcher script runs**
2. **Backend server starts** (takes ~2-5 seconds)
   - Loads database from `backend/data/db.json`
   - Starts Express server on port 5000
   - Binds to 0.0.0.0 (network access enabled)
3. **Frontend server starts** (takes ~3-10 seconds)
   - Vite dev server compiles React app
   - Opens on port 5173
   - Hot reload enabled for development
4. **Your browser** - Navigate to http://localhost:5173

## Tips

- Keep the command/PowerShell windows open while using the app
- Watch these windows for error messages or logs
- Use `Ctrl+C` in a window to stop that specific server
- Close windows or use stop script to shut down completely

## Quick Reference

| Script | Purpose |
|--------|---------|
| `start-inventory-system.bat` | Launch both servers (Batch) |
| `start-inventory-system.ps1` | Launch both servers (PowerShell) |
| `stop-inventory-system.bat` | Stop all servers |

| Shortcut Location Template |
|----------------------------|
| `C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-inventory-system.bat` |
| `powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-inventory-system.ps1"` |
