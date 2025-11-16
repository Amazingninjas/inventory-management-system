# Quick Start - Remote Access

Get your Inventory Management System online in 5 minutes!

## Setup (One Time Only)

### 1. Get ngrok Auth Token
1. Visit https://ngrok.com/signup and create a free account
2. After login, go to https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken (looks like: `2abc...xyz123`)

### 2. Configure ngrok
1. Open `ngrok.yml` in this folder
2. Replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your actual token:
   ```yaml
   authtoken: 2abc...xyz123
   ```
3. Save the file

## Start the System

### Option 1: Windows (Easy)
Double-click: **`start-with-ngrok.bat`**

### Option 2: Command Line
```bash
./start-with-ngrok.sh
```

## Get Your Public URLs

Open in your browser: **http://localhost:4040**

You'll see:
- **Backend URL**: `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app`
- **Frontend URL**: `https://yyyy-yy-yy-yyy-yyy.ngrok-free.app`

Share the **Frontend URL** with anyone to demo your app!

## ⚠️ Important: Configure Frontend API

The frontend needs to know where the backend is. You have two options:

### Option A: Automatic (Recommended)
```bash
./update-frontend-url.sh
```
Then restart the frontend server.

### Option B: Manual
1. Copy your **Backend URL** from http://localhost:4040
2. Create/edit `frontend/.env`:
   ```
   VITE_API_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/api
   ```
3. Restart the frontend

## Stop the System

Double-click: **`stop-with-ngrok.bat`**

Or run:
```bash
./stop-with-ngrok.sh
```

## Free Plan Limitations

ngrok's free plan has:
- ✅ Unlimited bandwidth
- ✅ HTTPS encryption
- ⚠️ Only **1 tunnel at a time**
- ⚠️ URLs **change on each restart**

### Workaround for 1 Tunnel Limit

**Recommended Setup:**
1. Use ngrok for **backend only**
2. Keep frontend on localhost or use your local IP
3. Access frontend at `http://YOUR_IP:5173`

To configure:
Edit `start-with-ngrok.sh`, line 52:
```bash
# Change from:
"$NGROK_BIN" start --all --config="$NGROK_CONFIG"

# To (backend only):
"$NGROK_BIN" start backend --config="$NGROK_CONFIG"
```

## Desktop Shortcut

1. Right-click Desktop → New → Shortcut
2. Enter path:
   ```
   C:\Users\Justin\Desktop\AI Projects\inventory-management-system\start-with-ngrok.bat
   ```
3. Name it: "Inventory System (Remote)"

## Troubleshooting

**"ngrok auth token not configured"**
- Edit `ngrok.yml` and add your token

**"tunnel limit exceeded"**
- Free plan allows 1 tunnel
- Stop existing ngrok: `pkill -9 ngrok`
- Or upgrade at https://ngrok.com/pricing

**Frontend can't connect to backend**
- Run `./update-frontend-url.sh`
- Or manually update `frontend/.env`
- Restart frontend server

**Slow performance**
- Normal - ngrok adds latency
- Use localhost URLs when possible

## Next Steps

- 📖 Full guide: [REMOTE_ACCESS_SETUP.md](REMOTE_ACCESS_SETUP.md)
- 🔒 Security tips in the full guide
- 💰 Upgrade to paid plan for 2+ tunnels

## Files Reference

- `ngrok.yml` - Configuration file (add your token here)
- `start-with-ngrok.bat` - Windows launcher
- `start-with-ngrok.sh` - WSL startup script
- `stop-with-ngrok.bat` - Stop all services
- `update-frontend-url.sh` - Auto-configure frontend API URL
- `get-ngrok-urls.sh` - Display current URLs
