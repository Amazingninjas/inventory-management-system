#!/bin/bash

# Stop all inventory system and ngrok processes

echo "Stopping all servers..."
pkill -9 node 2>/dev/null || true
pkill -9 ngrok 2>/dev/null || true

echo "✅ All servers stopped."
