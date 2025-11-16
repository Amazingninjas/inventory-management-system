# Network Access Setup Guide

This guide explains how to configure the Inventory Management System for internet access.

## Quick Start

### 1. Find Your Server's IP Address

**Windows (WSL):**
```bash
# Get Windows host IP
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
# Look for inet address (usually starts with 192.168.x.x or 10.x.x.x)
```

### 2. Configure Backend

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

The default settings in `.env.example` already allow network access:
```env
PORT=5000
HOST=0.0.0.0          # Binds to all network interfaces
ALLOWED_ORIGINS=*      # Allows requests from any origin
```

**For production**, restrict CORS to specific origins:
```env
ALLOWED_ORIGINS=http://192.168.1.100:5173,http://your-domain.com
```

### 3. Configure Frontend

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and set the API URL to your server's IP:
```env
VITE_API_URL=http://192.168.1.100:5000/api
```

Replace `192.168.1.100` with your actual server IP address.

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Inventory Management API running on http://0.0.0.0:5000
📡 Network Access:
   Local:   http://localhost:5000/api
   Network: http://<your-ip>:5000/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### 5. Access from Other Devices

**On the same local network:**
- Frontend: `http://<server-ip>:5173`
- Backend API: `http://<server-ip>:5000/api`

## Firewall Configuration

Make sure your firewall allows incoming connections on the required ports:

**Windows Firewall:**
```powershell
# Allow port 5000 (backend)
netsh advfirewall firewall add rule name="Inventory Backend" dir=in action=allow protocol=TCP localport=5000

# Allow port 5173 (frontend dev server)
netsh advfirewall firewall add rule name="Inventory Frontend" dir=in action=allow protocol=TCP localport=5173
```

**Linux (ufw):**
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 5173/tcp
```

## Internet Access (Beyond Local Network)

To access from the internet, you have several options:

### Option 1: Port Forwarding
Configure your router to forward ports 5000 and 5173 to your server's local IP.

**Security Warning:** This exposes your application to the internet. Use strong authentication and HTTPS in production.

### Option 2: ngrok (Quick Testing)
```bash
# Install ngrok: https://ngrok.com/download

# Expose backend
ngrok http 5000

# Expose frontend (in another terminal)
ngrok http 5173
```

Update frontend `.env` with the ngrok URL:
```env
VITE_API_URL=https://abc123.ngrok.io/api
```

### Option 3: Cloud Deployment
Deploy to platforms like:
- **Vercel** (frontend) + **Railway** (backend)
- **Netlify** (frontend) + **Render** (backend)
- **AWS**, **Google Cloud**, **Azure**

## Vite Frontend Network Access

To access the Vite dev server from other devices on your network:

Edit `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Bind to all interfaces
    port: 5173,
  },
  // ... rest of config
})
```

Or run with CLI flag:
```bash
npm run dev -- --host 0.0.0.0
```

## Troubleshooting

### Cannot connect from another device

1. **Check firewall** - Ensure ports 5000 and 5173 are open
2. **Verify IP address** - Make sure you're using the correct server IP
3. **Check network** - Both devices must be on the same network (for local access)
4. **Test backend** - Visit `http://<server-ip>:5000/api/products` in a browser
5. **Check CORS** - Look for CORS errors in browser console

### CORS Errors

If you see CORS errors in the browser console:

1. Check `ALLOWED_ORIGINS` in backend `.env`
2. Ensure the frontend origin is included
3. Restart the backend after changing `.env`

Example:
```env
ALLOWED_ORIGINS=http://192.168.1.100:5173,http://localhost:5173
```

### Environment Variables Not Working

**Frontend:**
- Environment variables MUST start with `VITE_`
- Restart the dev server after changing `.env`
- Check browser console for the API URL log

**Backend:**
- Restart the server after changing `.env`
- Check the startup logs for configuration values

## Security Recommendations

For production deployment:

1. **Use HTTPS** - Never send credentials over HTTP
2. **Restrict CORS** - Don't use `ALLOWED_ORIGINS=*` in production
3. **Add authentication** - Protect your API with auth tokens
4. **Use environment variables** - Never commit `.env` files
5. **Rate limiting** - Add rate limiting to prevent abuse
6. **Input validation** - Already implemented, but review regularly
7. **Database backups** - Regularly backup `backend/data/db.json`

## Example Configurations

### Local Network Access
**Backend `.env`:**
```env
PORT=5000
HOST=0.0.0.0
ALLOWED_ORIGINS=*
```

**Frontend `.env`:**
```env
VITE_API_URL=http://192.168.1.100:5000/api
```

### Production (Single Domain)
**Backend `.env`:**
```env
PORT=5000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://inventory.yourdomain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Development + Remote Testing
**Backend `.env`:**
```env
PORT=5000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:5173,http://192.168.1.100:5173,http://192.168.1.50:5173
```

**Frontend `.env` (on each device):**
```env
VITE_API_URL=http://192.168.1.100:5000/api
```
