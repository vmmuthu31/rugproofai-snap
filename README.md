# RugProof MetaMask Snap Integration Guide

This guide will help you integrate RugProof's security analysis directly into MetaMask using Snaps.

## 🎯 What We've Built

### ✅ **1. Wallet Scanning API**

Created a new endpoint at `/api/v1/security/wallet` that:

- Scans wallets for spam tokens and NFTs
- Provides comprehensive security analysis
- Returns detailed threat information
- Costs 2 credits per scan (due to comprehensive analysis)

### ✅ **2. MetaMask Snap Foundation**

Built a complete MetaMask Snap with:

- Real-time transaction analysis
- Honeypot detection
- Contract security analysis
- Wallet scanning functionality
- AI-powered insights (coming soon)

## 🚀 Quick Start

### 1. Test the New Wallet API

```bash
curl -X POST https://api.rugproofai.com/v1/security/wallet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chain": "1"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "address": "0x...",
      "totalTokens": 25,
      "safeTokens": 20,
      "spamTokens": 5,
      "totalNfts": 10,
      "spamNfts": 2
    },
    "security": {
      "riskLevel": "medium",
      "riskScore": 25,
      "threats": ["SPAM_TOKENS", "SPAM_NFTS"]
    },
    "analysis": {
      "spamTokenPercentage": 20,
      "spamNftPercentage": 20,
      "recommendations": [
        "Do NOT interact with identified spam tokens",
        "Avoid interacting with suspicious NFT collections"
      ]
    },
    "detectedThreats": [
      {
        "type": "spam_token",
        "address": "0x...",
        "name": "Suspicious Token",
        "symbol": "SCAM",
        "reason": "Flagged as spam by blockchain analysis",
        "risk": "high"
      }
    ]
  }
}
```

### 2. Install MetaMask Snap Development Environment

```bash
# Navigate to snap directory
cd snap

# Install dependencies
npm install

# Build the snap
npm run build

# Start development server
npm run serve
```

### 3. Install MetaMask Flask

Download [MetaMask Flask](https://metamask.io/flask/) (required for Snap development)

## 🔧 API Endpoints Summary

| Endpoint                | Purpose                 | Credits | Features                                            |
| ----------------------- | ----------------------- | ------- | --------------------------------------------------- |
| `/v1/security/contract` | Contract analysis       | 1       | Verification, proxy detection, permissions          |
| `/v1/security/honeypot` | Honeypot detection      | 1       | Trading taxes, honeypot detection, risk scoring     |
| `/v1/security/wallet`   | **NEW** Wallet scanning | 2       | Spam detection, NFT analysis, comprehensive threats |

## 🛡️ MetaMask Snap Features

### Automatic Transaction Analysis

When users sign transactions, the Snap automatically:

```javascript
// This runs automatically when users sign transactions
export const onTransaction = async ({ transaction, chainId }) => {
  // Analyze the contract being interacted with
  const contractAnalysis = await analyzeContract(transaction.to, chainId);
  const honeypotAnalysis = await checkHoneypot(transaction.to, chainId);

  // Show security warnings in MetaMask UI
  return {
    content: panel([
      heading("🛡️ RugProof Security Analysis"),
      text(`Risk Level: ${contractAnalysis.security.riskLevel}`),
      text(`Honeypot: ${honeypotAnalysis.security.isHoneypot ? "YES" : "No"}`),
      // ... more security info
    ]),
  };
};
```

### Custom RPC Methods

The Snap exposes these methods for dApps:

```javascript
// 1. Honeypot Check
await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "@rugproofai/snap",
    request: {
      method: "rugproof_honeypot_check",
      params: { address: "0x...", chainId: "1" },
    },
  },
});

// 2. Contract Analysis
await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "@rugproofai/snap",
    request: {
      method: "rugproof_contract_analysis",
      params: { address: "0x...", chainId: "1" },
    },
  },
});

// 3. Wallet Scan (NEW!)
await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "@rugproofai/snap",
    request: {
      method: "rugproof_wallet_scan",
      params: { address: "0x...", chainId: "1" },
    },
  },
});

// 4. AI Summary (Coming Soon)
await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "@rugproofai/snap",
    request: {
      method: "rugproof_ai_summary",
      params: { address: "0x...", chainId: "1" },
    },
  },
});
```

## 🎨 Integration Examples

### 1. Add "Scan Wallet" Button to Your dApp

```javascript
async function addScanWalletButton() {
  const scanButton = document.createElement("button");
  scanButton.textContent = "🔍 Scan Wallet with RugProof";
  scanButton.onclick = async () => {
    try {
      const userAccount = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const result = await window.ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: "@rugproofai/snap",
          request: {
            method: "rugproof_wallet_scan",
            params: { address: userAccount[0] },
          },
        },
      });

      console.log("Wallet scan result:", result);
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  document.body.appendChild(scanButton);
}
```

### 2. Pre-Transaction Security Check

```javascript
async function checkBeforeTransaction(toAddress) {
  try {
    // Check if it's a contract
    const contractResult = await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: "@rugproofai/snap",
        request: {
          method: "rugproof_contract_analysis",
          params: { address: toAddress },
        },
      },
    });

    // Check if it's a honeypot token
    const honeypotResult = await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: "@rugproofai/snap",
        request: {
          method: "rugproof_honeypot_check",
          params: { address: toAddress },
        },
      },
    });

    if (honeypotResult.isHoneypot) {
      alert("⚠️ WARNING: This token is detected as a honeypot!");
    }

    if (contractResult.riskLevel === "high") {
      alert("🚨 HIGH RISK: This contract has security concerns!");
    }
  } catch (error) {
    console.error("Security check failed:", error);
  }
}
```

## 📝 Next Steps

### 1. **Immediate Actions**

- [ ] Test the new wallet scanning API
- [ ] Set up MetaMask Flask for Snap development
- [ ] Build and test the Snap locally

### 2. **Development Tasks**

- [ ] Replace `YOUR_API_KEY` with secure key management
- [ ] Add proper error handling for API rate limits
- [ ] Implement caching for repeated requests
- [ ] Add support for more blockchain networks

### 3. **Production Deployment**

- [ ] Publish Snap to npm registry
- [ ] Submit to MetaMask Snap directory
- [ ] Update website with Snap integration instructions
- [ ] Create user documentation

### 4. **Advanced Features**

- [ ] Integrate with your AI agent API for smart summaries
- [ ] Add real-time notifications for wallet threats
- [ ] Implement batch scanning for multiple addresses
- [ ] Add transaction simulation and risk prediction

## 🔐 Security Configuration

### API Key Management

```javascript
// In production, use secure key management
const API_KEY = process.env.RUGPROOF_API_KEY || "your-secure-api-key";

// Never hardcode API keys in the Snap source code
const RUGPROOF_API_BASE = "https://api.rugproofai.com/v1/security";
```

### Rate Limiting

The APIs have different credit costs:

- Contract analysis: 1 credit
- Honeypot check: 1 credit
- Wallet scan: 2 credits (comprehensive analysis)

### Supported Networks

- Ethereum (chainId: "1")
- BSC (chainId: "56")
- Polygon (chainId: "137")
- Base (chainId: "8453")
- Optimism (chainId: "10")
- Arbitrum (chainId: "42161")

## 📚 Resources

- [MetaMask Snaps Documentation](https://docs.metamask.io/snaps/)
- [MetaMask Flask Download](https://metamask.io/flask/)
- [RugProof API Documentation](https://api.rugproofai.com/docs)
- [Snap Development Guide](https://docs.metamask.io/snaps/how-to/develop-a-snap/)

## 🎉 Success!

You now have:
✅ **Complete wallet scanning API** - Comprehensive security analysis
✅ **MetaMask Snap foundation** - Real-time transaction protection  
✅ **Integration examples** - Easy to implement in your dApps
✅ **Security features** - Honeypot detection, contract analysis, wallet scanning
✅ **Developer tools** - Ready for testing and deployment

Your users will now have **real-time crypto security protection** directly in their MetaMask wallet! 🛡️
