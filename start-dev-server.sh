#!/bin/bash

# Eco Donations Development Server Startup Script
# This script ensures the server always starts from the correct directory

echo "🚀 Starting Eco Donations Development Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# Check if index.html exists
if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo "❌ Error: index.html not found in $FRONTEND_DIR"
    exit 1
fi

# Kill any existing Python HTTP servers
echo "🧹 Cleaning up any existing servers..."
pkill -f "python3 -m http.server" 2>/dev/null || true

# Wait a moment for cleanup
sleep 1

# Change to frontend directory
cd "$FRONTEND_DIR"

# Get local IP for mobile access
LOCAL_IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')

echo "📁 Serving from: $FRONTEND_DIR"
echo "🌐 Desktop URL: http://localhost:8888"
echo "📱 Mobile URL: http://$LOCAL_IP:8888"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Server starting... Press Ctrl+C to stop"
echo ""

# Start the server
python3 -m http.server 8888
