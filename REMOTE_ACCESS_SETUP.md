# Remote Access Setup Guide

This guide explains how to make your Inventory Management System accessible from anywhere on the internet using ngrok.

## Overview

ngrok creates secure tunnels from public URLs to your local servers, allowing you to:
- Access your application from any device on any network
- Share your demo with others without deploying to the cloud
- Test your app on mobile devices or from different locations
- Keep the application running on your computer

## Prerequisites

- Windows Subsystem for Linux (WSL) installed
- Node.js 20+ installed in WSL
- Internet connection
- Free ngrok account

## One-Time Setup

### Step 1: Sign Up for ngrok (Free)

1. Go to https://ngrok.com/signup
2. Sign up for a free account (supports 1 online connection at a time)
3. After signing in, go to https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken (looks like: `2abc...xyz123`)

### Step 2: Configure ngrok

1. Open `ngrok.yml` in this directory
2. Replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your actual authtoken:

```yaml
version: "2"
authtoken: 2abc...xyz123  # Your actual token here
tunnels:
  backend:
    proto: http
    addr: 5000
    inspect: true
  frontend:
    proto: http
    addr: 5173
    inspect: true
```

3. Save the file

## Usage

### Starting the System with Remote Access

**Option 1: Double-click (Windows)**
1. Double-click `start-with-ngrok.bat`
2. Wait for servers to start (about 10 seconds)
3. The console will display your public URLs

**Option 2: Command Line (WSL)**
```bash
./start-with-ngrok.sh
```

### Getting Your Public URLs

After starting, you can access your public URLs in several ways:

**1. View in ngrok Web Interface** (Recommended)
- Open http://localhost:4040 in your browser
- You'll see a dashboard with both tunnel URLs
- Includes request inspection and replay tools

**2. Command Line**
```bash
./get-ngrok-urls.sh
```

**3. API Request**
```bash
curl http://localhost:4040/api/tunnels
```

### Accessing the Application

Once running, you'll have:

**Local Access** (same as before)
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Remote Access** (from anywhere)
- Frontend: https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
- Backend: https://yyyy-yy-yy-yyy-yyy.ngrok-free.app

**Important:** The URLs change each time you restart ngrok (unless you have a paid plan with reserved domains).

### Stopping the System

**Option 1: Windows**
```
Double-click: stop-with-ngrok.bat
```

**Option 2: WSL**
```bash
./stop-with-ngrok.sh
```

**Option 3: Manual**
```bash
pkill -9 node && pkill -9 ngrok
```

## Configuring Frontend to Use ngrok Backend

When running with ngrok, you need to tell the frontend to use the ngrok backend URL instead of localhost.

### Option 1: Environment Variable (Recommended for Production)

1. Create `frontend/.env` (if it doesn't exist)
2. Add your ngrok backend URL:

```env
VITE_API_URL=https://yyyy-yy-yy-yyy-yyy.ngrok-free.app/api
```

3. Restart the frontend server

### Option 2: Update at Runtime

The frontend will need to use the ngrok backend URL. You can either:
- Update `VITE_API_URL` in `frontend/.env` with your ngrok backend URL
- Or modify `frontend/src/api.ts` to use the ngrok URL directly

**Note:** Since ngrok URLs change on each restart with the free plan, you'll need to update this each time.

## ngrok Free Plan Limitations

- **1 online connection** at a time (only 1 tunnel can be active)
- **Random URLs** that change on each restart
- **60 requests per minute** rate limit
- **No custom domains**

### Workaround for Free Plan (One Tunnel at a Time)

Since the free plan only allows 1 tunnel, you have two options:

**Option A: Frontend Only (Recommended for Demos)**
- Use ngrok to expose only the frontend
- Update backend to bind to 0.0.0.0:5000 (already configured)
- Access backend through your local IP on the same network

**Option B: Backend Only**
- Use ngrok for backend only
- Access frontend via localhost:5173 or your local IP
- Good for API testing from external services

To use single tunnel mode, edit `start-with-ngrok.sh` and change:
```bash
"$NGROK_BIN" start backend --config="$NGROK_CONFIG"
# or
"$NGROK_BIN" start frontend --config="$NGROK_CONFIG"
```

### Upgrading to Paid Plan

If you need both tunnels simultaneously, consider upgrading:
- **Personal Plan** ($10/month): 3 tunnels, custom domains, more connections
- Visit: https://ngrok.com/pricing

## Security Considerations

### Important Security Notes

1. **Your app is publicly accessible** - Anyone with the URL can access it
2. **No authentication** - The current app has no login system
3. **Database is local** - Changes are saved to your local db.json file
4. **HTTPS by default** - ngrok provides SSL/TLS encryption

### Recommended Precautions

1. **Share URLs carefully** - Only give the URL to trusted people
2. **Monitor access** - Use ngrok dashboard at http://localhost:4040 to see all requests
3. **Use for demos only** - This setup is not recommended for production use
4. **Stop when not needed** - Run `stop-with-ngrok.sh` when you're done
5. **Rotate authtoken** - If URLs are leaked, regenerate your authtoken at https://dashboard.ngrok.com

### Adding Basic Protection

Consider adding to ngrok.yml:
```yaml
tunnels:
  frontend:
    proto: http
    addr: 5173
    inspect: true
    basic_auth:
      - "username:password"  # Optional: adds basic HTTP auth
```

## Troubleshooting

### "ngrok auth token not configured" error
- You need to edit `ngrok.yml` and add your authtoken from https://dashboard.ngrok.com

### ngrok URLs not working
- Make sure both backend and frontend servers are running
- Check logs: `tail -f /tmp/inventory-backend.log` and `tail -f /tmp/inventory-frontend.log`
- Verify ngrok is running: `pgrep ngrok`

### "ERR_NGROK_3200" or "tunnel limit exceeded"
- Free plan only allows 1 tunnel at a time
- Stop other ngrok instances: `pkill -9 ngrok`
- Or upgrade to a paid plan

### Frontend can't connect to backend
- Update `frontend/.env` with your ngrok backend URL
- Make sure CORS is configured (already done in this project)
- Check backend is responding: `curl http://localhost:5000/api/products`

### Slow performance
- ngrok adds network latency (requests go: your device → ngrok → your computer → app)
- Use local URLs when possible (localhost:5173)
- Consider cloud deployment for production use

## Alternatives to ngrok

If ngrok doesn't meet your needs, consider:

1. **Cloudflare Tunnel** (Free, unlimited tunnels, more complex setup)
2. **localtunnel** (Free, simpler but less reliable)
3. **Tailscale** (Free VPN-based access, requires client installation)
4. **Cloud deployment** (Vercel, Railway, Render - for permanent hosting)

## Files Created

This setup created the following files:
- `ngrok.yml` - ngrok configuration with tunnel definitions
- `start-with-ngrok.sh` - WSL script to start everything
- `start-with-ngrok.bat` - Windows launcher
- `stop-with-ngrok.sh` - Script to stop all services
- `stop-with-ngrok.bat` - Windows stop script
- `get-ngrok-urls.sh` - Helper to display current URLs
- `ngrok` - ngrok binary (executable)
- `REMOTE_ACCESS_SETUP.md` - This guide

## Next Steps

1. Complete the one-time setup above
2. Run `start-with-ngrok.bat` to test
3. Open http://localhost:4040 to see your public URLs
4. Access the frontend URL from any device
5. Share the URL with others for demos

## Support

- ngrok documentation: https://ngrok.com/docs
- ngrok dashboard: https://dashboard.ngrok.com
- Check ngrok status: https://status.ngrok.com
