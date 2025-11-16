#!/bin/bash

# Inventory Management System - Remote Access Launcher with ngrok
# This script starts both backend and frontend servers, then creates ngrok tunnels

set -e

PROJECT_DIR="/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGROK_BIN="$PROJECT_DIR/ngrok"
NGROK_CONFIG="$PROJECT_DIR/ngrok.yml"

echo "======================================"
echo "Inventory System - Remote Access Mode"
echo "======================================"
echo ""

# Check if ngrok auth token is configured
if grep -q "YOUR_NGROK_AUTH_TOKEN_HERE" "$NGROK_CONFIG"; then
    echo "⚠️  ERROR: ngrok auth token not configured!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Sign up for free at: https://ngrok.com/signup"
    echo "2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Edit ngrok.yml and replace YOUR_NGROK_AUTH_TOKEN_HERE with your token"
    echo ""
    exit 1
fi

# Kill any existing Node.js processes
echo "🧹 Cleaning up existing processes..."
pkill -9 node 2>/dev/null || true
pkill -9 ngrok 2>/dev/null || true
sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd "$BACKEND_DIR"
npm run dev > /tmp/inventory-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server..."
cd "$FRONTEND_DIR"
npm run dev > /tmp/inventory-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

# Start ngrok tunnels
echo "🌐 Starting ngrok tunnels..."
cd "$PROJECT_DIR"
"$NGROK_BIN" start --all --config="$NGROK_CONFIG" > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "   ngrok PID: $NGROK_PID"

# Wait for ngrok to initialize
echo ""
echo "⏳ Waiting for ngrok to establish tunnels..."
sleep 5

# Get ngrok URLs
echo ""
echo "======================================"
echo "🎉 System is running!"
echo "======================================"
echo ""
echo "📊 Local Access:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🌍 Remote Access (from anywhere):"
echo "   Get your public URLs at: http://localhost:4040"
echo "   Or run: curl http://localhost:4040/api/tunnels"
echo ""
echo "📝 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo "   ngrok: $NGROK_PID"
echo ""
echo "🛑 To stop all servers, run:"
echo "   ./stop-with-ngrok.sh"
echo "   or: pkill -9 node && pkill -9 ngrok"
echo ""
echo "======================================"
echo ""

# Keep script running
echo "Press Ctrl+C to stop all servers..."
trap "echo ''; echo 'Stopping servers...'; pkill -9 node; pkill -9 ngrok; exit 0" INT TERM

# Wait indefinitely
tail -f /dev/null
