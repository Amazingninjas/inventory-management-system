#!/bin/bash
pkill -9 ngrok
sleep 2
cd "/mnt/c/Users/Justin/Desktop/AI Projects/inventory-management-system"
./ngrok http 5173 &
sleep 6
echo ""
echo "🌍 Your public URLs:"
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; [print(f'  {t[\"public_url\"]}') for t in json.load(sys.stdin).get('tunnels', [])]" 2>/dev/null || echo "  Check http://localhost:4040 for URLs"
echo ""
