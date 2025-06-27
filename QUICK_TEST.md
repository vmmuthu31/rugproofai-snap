# Quick Test Guide - RugProof Security Snap

## 🚀 Ready to Test!

Your development environment is **RUNNING**:

- ✅ Site: http://localhost:8000
- ✅ Snap Server: http://localhost:8080

## Immediate Testing Steps

### 1. Open MetaMask Flask

- Install [MetaMask Flask](https://metamask.io/flask/) if not already installed
- Open Flask browser extension

### 2. Open Test Site

Navigate to: **http://localhost:8000**

### 3. Connect Snap

1. Click **"Connect"** button on the site
2. Approve the snap installation in MetaMask Flask
3. Grant required permissions

### 4. Test Features Immediately

#### Test Honeypot Detection

```
Address: 0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7
Chain ID: 1
Click: 🍯 Check Honeypot
```

#### Test Contract Analysis

```
Address: 0xE592427A0AEce92De3Edee1F18E0157C05861564
Chain ID: 1
Click: 🔍 Analyze Contract
```

#### Test Wallet Scan

```
Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Chain ID: 1
Click: 🔒 Scan Wallet
```

## What You Should See

### Success Indicators:

- 🔗 Snap connects successfully
- 📊 Security analysis dialogs appear
- 🎯 Risk levels display correctly
- ✅ API responses show real data

### In Browser Console:

- Look for API calls to `api.rugproofai.com`
- Check for successful responses
- Monitor for any errors

## Transaction Testing

1. Try making a transaction to any contract in MetaMask Flask
2. **Before signing**, you should see a RugProof security analysis popup
3. This tests the real-time transaction insight feature

## Troubleshooting

### If Snap Won't Connect:

```bash
# Restart servers
yarn build && yarn start
```

### If API Errors:

- Check internet connection
- Open browser DevTools → Network tab
- Look for blocked requests

### If No Dialogs Appear:

- Check MetaMask Flask notifications
- Look in browser console for errors
- Ensure Flask has snap permissions

## Next Steps

Once basic testing works:

1. Try different contract addresses
2. Test various chain IDs
3. Monitor API response accuracy
4. Test transaction insights with real transactions

---

**🔥 Your RugProof Security Snap is ready for testing!**
