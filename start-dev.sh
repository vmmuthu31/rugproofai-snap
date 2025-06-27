#!/bin/bash

# RugProof Snap Development Server Startup Script

echo "🚀 Starting RugProof Security Snap Development Environment..."

# Kill any existing processes
echo "🔄 Stopping existing servers..."
pkill -f "gatsby\|yarn\|node" 2>/dev/null || true
sleep 2

# Build the snap first
echo "🔨 Building snap..."
cd packages/snap
yarn build
cd ../..

# Start snap development server in background
echo "📦 Starting snap server on port 8080..."
cd packages/snap
yarn start &
SNAP_PID=$!
cd ../..

# Wait for snap server to start
echo "⏳ Waiting for snap server to start..."
sleep 5

# Verify snap server is running
if curl -s http://localhost:8080/snap.manifest.json > /dev/null; then
    echo "✅ Snap server running at http://localhost:8080"
else
    echo "❌ Snap server failed to start"
    exit 1
fi

# Start site development server with correct environment
echo "🌐 Starting site server on port 8000..."
cd packages/site
SNAP_ORIGIN="local:http://localhost:8080" yarn start &
SITE_PID=$!
cd ../..

# Wait for site server to start
echo "⏳ Waiting for site server to start..."
sleep 10

# Verify site server is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Site server running at http://localhost:8000"
else
    echo "❌ Site server failed to start"
    exit 1
fi

echo ""
echo "🎉 Development environment ready!"
echo "📖 Open http://localhost:8000 in your browser"
echo "🦊 Make sure MetaMask Flask is installed and active"
echo ""
echo "To stop servers, run: pkill -f \"gatsby\\|yarn\\|node\""
echo ""
echo "Press Ctrl+C to stop this script (servers will continue running)"

# Keep script running
wait 