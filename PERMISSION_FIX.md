# 🔧 RugProof Snap Permission Error Fix

## Problem

```
An error happened: http://localhost:8000 does not have permission to invoke local:http://localhost:8080 snap.
```

## Root Cause

This error occurs because:

1. The snap manifest was configured for NPM distribution instead of local development
2. Servers need to be started in the correct order with proper configuration
3. MetaMask Flask needs to see the snap as a local development snap

## ✅ Solution Steps

### Step 1: Fix Snap Manifest (Already Done)

The snap manifest has been updated to use local development mode:

```json
"source": {
  "location": {
    "local": {
      "filePath": "dist/bundle.js",
      "iconPath": "images/icon.svg"
    }
  }
}
```

### Step 2: Start Servers in Correct Order

#### Option A: Manual Start (Recommended)

```bash
# 1. Stop all existing servers
pkill -f "gatsby\|yarn\|node" 2>/dev/null || true

# 2. Build the snap
cd packages/snap
yarn build

# 3. Start snap server (in new terminal tab/window)
yarn serve
# This should show: "Snap server listening on http://localhost:8080"

# 4. In another terminal, start the site
cd packages/site
SNAP_ORIGIN="local:http://localhost:8080" yarn start
# This should start Gatsby on http://localhost:8000
```

#### Option B: Using Script

```bash
./start-dev.sh
```

### Step 3: Verify Servers Are Running

Check snap server:

```bash
curl http://localhost:8080/snap.manifest.json
```

Should return JSON manifest, not HTML.

Check site server:

```bash
curl -I http://localhost:8000
```

Should return 200 OK.

### Step 4: Test Connection

1. **Clear MetaMask Flask Data** (Important!)

   - MetaMask Flask → Settings → Advanced → Reset Account
   - This clears cached snap data

2. **Open Site**

   - Navigate to http://localhost:8000
   - You should see "RugProof Security Snap" interface

3. **Connect Snap**
   - Click "Connect" button
   - MetaMask Flask should prompt for snap installation
   - Approve the connection

## 🚨 Common Issues & Fixes

### Issue 1: Snap Server Returns HTML Instead of Manifest

**Problem**: `curl http://localhost:8080/snap.manifest.json` returns HTML
**Solution**:

- Stop servers: `pkill -f "gatsby\|yarn\|node"`
- Use `yarn serve` instead of `yarn start` for snap
- Make sure you're in `packages/snap` directory

### Issue 2: Site Can't Connect to Snap

**Problem**: Permission error persists
**Solution**:

- Ensure SNAP_ORIGIN environment variable is set
- Restart MetaMask Flask browser extension
- Clear browser cache and cookies

### Issue 3: MetaMask Flask Not Detecting Snap

**Problem**: No installation prompt appears
**Solution**:

- Make sure you're using MetaMask Flask, not regular MetaMask
- Check that both servers are running on correct ports
- Try in an incognito/private browser window

### Issue 4: "Method not found" Error

**Problem**: Snap connects but RPC methods fail
**Solution**:

- Rebuild snap: `cd packages/snap && yarn build`
- Restart snap server
- Reconnect in MetaMask Flask

## 🔍 Debug Steps

### Check Server Status

```bash
# Check what's running on port 8080
lsof -i :8080

# Check what's running on port 8000
lsof -i :8000

# Check server responses
curl -v http://localhost:8080/snap.manifest.json
curl -v http://localhost:8000
```

### Check Environment Variables

```bash
# In the site directory
cd packages/site
echo $SNAP_ORIGIN
# Should show: local:http://localhost:8080
```

### MetaMask Flask Debug

1. Open DevTools in browser
2. Go to MetaMask Flask → Settings → Advanced → Developer Options
3. Enable "Show test networks"
4. Check for errors in console

## 🎯 Final Test

Once everything is working:

1. Go to http://localhost:8000
2. Connect the snap
3. Enter test address: `0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7`
4. Click "🍯 Check Honeypot"
5. You should see a security analysis dialog

## 📞 Still Having Issues?

If the problem persists:

1. Check that you're using MetaMask Flask (not regular MetaMask)
2. Try a different browser
3. Make sure no firewall is blocking localhost connections
4. Check the browser console for JavaScript errors

The key is making sure the snap server is properly serving the manifest file and the site is configured to use the correct snap origin.

---

**🚀 Once fixed, your RugProof Security Snap will work perfectly!**
