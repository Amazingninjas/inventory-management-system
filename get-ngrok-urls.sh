#!/bin/bash

# Get and display ngrok tunnel URLs

echo "======================================"
echo "Current ngrok Tunnel URLs"
echo "======================================"
echo ""

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "❌ ngrok is not running!"
    echo "Start it with: ./start-with-ngrok.sh"
    exit 1
fi

# Fetch tunnel information from ngrok API
TUNNELS=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$TUNNELS" ]; then
    echo "❌ Could not connect to ngrok API"
    echo "Make sure ngrok is running and try again in a few seconds"
    exit 1
fi

# Extract URLs (requires jq, or parse manually)
if command -v jq &> /dev/null; then
    echo "Backend URL:"
    echo "$TUNNELS" | jq -r '.tunnels[] | select(.name=="backend") | .public_url'
    echo ""
    echo "Frontend URL:"
    echo "$TUNNELS" | jq -r '.tunnels[] | select(.name=="frontend") | .public_url'
else
    echo "Raw tunnel data (install jq for formatted output):"
    echo "$TUNNELS"
fi

echo ""
echo "Or view in browser: http://localhost:4040"
echo "======================================"
