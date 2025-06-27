# RugProof Security Snap - Testing Guide

This guide will help you test the RugProof Security Snap functionality through the web interface and MetaMask Flask.

## Prerequisites

### 1. Install MetaMask Flask

- Download and install [MetaMask Flask](https://metamask.io/flask/) (Developer preview version)
- **Important**: Flask is a separate browser extension from regular MetaMask
- Create or import a wallet in Flask for testing

### 2. Setup Development Environment

```bash
# Clone and install dependencies
git clone <your-repo-url>
cd rugproof-snap
yarn install
```

## Running the Development Environment

### 1. Start Development Servers

```bash
# Build and start both snap and site
yarn build
yarn start
```

This will start:

- **Snap Development Server**: `http://localhost:8080` (snap bundle)
- **Site Development Server**: `http://localhost:8000` (web interface)

### 2. Access the Testing Interface

Open your browser and navigate to: `http://localhost:8000`

## Testing the Snap Functionality

### Step 1: Install the Snap

1. Make sure MetaMask Flask is installed and running
2. Open `http://localhost:8000` in your browser
3. Click "Connect" to install the RugProof Security Snap
4. Approve the connection and permissions in MetaMask Flask

### Step 2: Test Individual Features

#### 🍯 Honeypot Detection

Test if a token is a honeypot scam:

**Sample Addresses to Test:**

- USDC (Safe): `0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7`
- Sample Token: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`

**Steps:**

1. Enter a token contract address in the input field
2. Set Chain ID (1 for Ethereum mainnet)
3. Click "🍯 Check Honeypot"
4. Review the security analysis dialog

**Expected Results:**

- Risk level indicator (🚨 High, ⚠️ Medium, ✅ Low)
- Honeypot status (Yes/No)
- Buy/Sell tax percentages
- Risk score out of 100

#### 🔍 Contract Analysis

Analyze smart contract security:

**Sample Addresses:**

- Uniswap V3 Router: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- OpenSea: `0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC`

**Steps:**

1. Enter a contract address
2. Click "🔍 Analyze Contract"
3. Review security findings

**Expected Results:**

- Contract verification status
- Proxy contract detection
- Admin functions presence
- Security risk assessment

#### 🔒 Wallet Security Scan

Scan wallet for spam tokens and threats:

**Sample Wallet:**

- Vitalik's Address: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`

**Steps:**

1. Enter a wallet address
2. Click "🔒 Scan Wallet"
3. Review security findings

**Expected Results:**

- Total tokens and NFTs count
- Spam detection statistics
- Security threat analysis
- Risk assessment

#### 🤖 AI Summary

Test the AI-powered analysis (Coming Soon):

**Steps:**

1. Enter any address
2. Click "🤖 AI Summary"
3. See placeholder message for future feature

### Step 3: Test Transaction Insights

The snap also provides real-time transaction analysis:

1. Try to make a transaction to a contract using MetaMask Flask
2. Before signing, you should see a RugProof security analysis
3. The analysis will show:
   - Contract security assessment
   - Honeypot detection results
   - Risk warnings and recommendations

## Testing Different Scenarios

### Safe Interactions

Test with known safe contracts:

- **USDC**: `0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7`
- **Ethereum Name Service**: `0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85`

### Risky Interactions

Test with contracts that might show warnings:

- Enter random contract addresses
- Test with unverified contracts
- Use contracts with high permissions

### Different Networks

Test on different networks by changing the Chain ID:

- **Ethereum Mainnet**: `1`
- **Polygon**: `137`
- **BSC**: `56`
- **Arbitrum**: `42161`

## API Testing

The snap uses RugProof API endpoints. You can monitor API calls:

### Check Network Requests

1. Open browser Developer Tools
2. Go to Network tab
3. Perform snap operations
4. Look for requests to `api.rugproofai.com`

### API Endpoints Being Used

- `POST /v1/security/contract` - Contract analysis
- `POST /v1/security/honeypot` - Honeypot detection
- `POST /v1/security/wallet` - Wallet scanning

## Troubleshooting

### Common Issues

#### 1. Snap Won't Install

- Ensure MetaMask Flask is installed (not regular MetaMask)
- Check that development servers are running
- Try refreshing the page and reconnecting

#### 2. API Errors

- Check internet connection
- Verify API endpoints are accessible
- Look for CORS issues in browser console

#### 3. Development Server Issues

```bash
# Restart development servers
yarn build
yarn start
```

#### 4. Permission Errors

- Check that Flask has the required permissions
- Try disconnecting and reconnecting the snap

### Debug Information

#### Check Snap Status

In MetaMask Flask:

1. Settings → Advanced → Manage Snaps
2. Look for "RugProof Security Snap"
3. Check permissions and status

#### Browser Console Logs

Check for:

- API response errors
- Snap invocation failures
- Network connectivity issues

#### Test API Directly

```bash
curl -X POST https://api.rugproofai.com/v1/security/contract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"address":"0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7","chain":"1"}'
```

## Production Testing

### Before Deployment

1. Test all RPC methods work correctly
2. Verify transaction insights appear for various contract interactions
3. Test error handling with invalid addresses
4. Confirm UI responsiveness and user experience

### Performance Testing

1. Test with multiple concurrent requests
2. Monitor API response times
3. Check snap memory usage
4. Test with slow network conditions

## Security Considerations

### During Testing

- Use test wallets, not main wallets
- Don't sign real transactions during testing
- Be cautious with unknown contract addresses
- Monitor for any unexpected behavior

### API Key Security

- The current API key is for demo purposes only
- In production, implement secure key management
- Consider rate limiting and usage monitoring

## Support

If you encounter issues during testing:

1. Check the browser console for errors
2. Review MetaMask Flask logs
3. Verify development server status
4. Test API endpoints independently

For additional support or questions about the RugProof Security Snap, please refer to the project documentation or contact the development team.

---

**Happy Testing! 🔒**
