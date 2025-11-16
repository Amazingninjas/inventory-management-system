#!/bin/bash

# Automatically update frontend .env with current ngrok backend URL

PROJECT_DIR="/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system"
FRONTEND_ENV="$PROJECT_DIR/frontend/.env"

echo "======================================"
echo "Update Frontend API URL"
echo "======================================"
echo ""

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "❌ ngrok is not running!"
    echo "Start it with: ./start-with-ngrok.sh"
    exit 1
fi

echo "⏳ Waiting for ngrok to be ready..."
sleep 2

# Fetch tunnel information from ngrok API
TUNNELS=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$TUNNELS" ]; then
    echo "❌ Could not connect to ngrok API"
    echo "Make sure ngrok is running and try again in a few seconds"
    exit 1
fi

# Try to extract backend URL with jq if available
if command -v jq &> /dev/null; then
    BACKEND_URL=$(echo "$TUNNELS" | jq -r '.tunnels[] | select(.name=="backend") | .public_url')

    if [ -z "$BACKEND_URL" ] || [ "$BACKEND_URL" = "null" ]; then
        echo "❌ Could not find backend tunnel"
        echo "Make sure ngrok is running with backend tunnel"
        exit 1
    fi

    # Create or update .env file
    echo "📝 Updating frontend/.env..."
    echo "VITE_API_URL=$BACKEND_URL/api" > "$FRONTEND_ENV"

    echo "✅ Frontend configured!"
    echo ""
    echo "Backend URL: $BACKEND_URL"
    echo "API URL: $BACKEND_URL/api"
    echo ""
    echo "⚠️  IMPORTANT: You must restart the frontend server for changes to take effect!"
    echo "   Run: pkill -9 node && cd frontend && npm run dev"

else
    # Fallback: Manual instructions if jq not available
    echo "⚠️  jq is not installed. Manual configuration required."
    echo ""
    echo "1. Visit http://localhost:4040 to see your ngrok URLs"
    echo "2. Copy the backend URL (the one on port 5000)"
    echo "3. Edit frontend/.env and add:"
    echo "   VITE_API_URL=<your-backend-url>/api"
    echo ""
    echo "To install jq for automatic updates:"
    echo "   sudo apt install -y jq"
fi

echo "======================================"
