#!/bin/bash

# RugProof Security Snap - Simulator Testing Setup
echo "🚀 Starting RugProof Security Snap for Simulator Testing..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Port $1 is already in use"
        return 0
    else
        echo "❌ Port $1 is not in use"
        return 1
    fi
}

# Build and serve the snap
echo "📦 Building snap..."
cd packages/snap
yarn build

echo "🌐 Starting snap server on port 8080..."
yarn serve &
SNAP_PID=$!

# Wait a moment for the server to start
sleep 3

# Check if snap server is running
if check_port 8080; then
    echo "✅ Snap server is running at http://localhost:8080"
else
    echo "❌ Failed to start snap server"
    exit 1
fi

echo ""
echo "🧪 SIMULATOR TESTING READY!"
echo ""
echo "📋 Next Steps:"
echo "1. Open the MetaMask Snaps Simulator: https://metamask.github.io/snaps/snaps-simulator/latest/"
echo "2. Load your snap from: http://localhost:8080"
echo "3. Use the test data from: SIMULATOR_TESTING_GUIDE.md"
echo ""
echo "🔧 Available RPC Methods to test:"
echo "   • rugproof_honeypot_check"
echo "   • rugproof_contract_analysis" 
echo "   • rugproof_wallet_scan"
echo "   • rugproof_ai_summary"
echo ""
echo "📊 Sample Test Parameters:"
echo "   Address: 0x1234567890123456789012345678901234567890"
echo "   Chain ID: 1"
echo ""
echo "⚠️  Note: API calls will fail without valid credentials (this is expected)"
echo "   The simulator will show proper error handling and UI dialogs"
echo ""
echo "Press Ctrl+C to stop the snap server..."

# Keep the script running
wait $SNAP_PID 