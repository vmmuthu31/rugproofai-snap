// Quick test script for RugProof Security Snap
const testRequests = [
  {
    method: 'rugproof_honeypot_check',
    params: {
      address: '0x1234567890123456789012345678901234567890',
      chainId: '1',
    },
  },
  {
    method: 'rugproof_contract_analysis',
    params: {
      address: '0xA0b86a33E6441E2a4A7d3A5f2f5e1a8e1b2c3d4e',
      chainId: '1',
    },
  },
  {
    method: 'rugproof_wallet_scan',
    params: {
      address: '0x27E3FfEe60f242A9296Aa4780989E4bE74d680d1',
      chainId: '1',
    },
  },
  {
    method: 'rugproof_ai_summary',
    params: {
      address: '0x742d35Cc6634C0532925a3b8D4b8c4a4A5d2e3f1',
    },
  },
];

console.log('🧪 RugProof Security Snap Test Cases');
console.log('=====================================');
console.log('');
console.log('📋 Copy these requests into the MetaMask Snaps Simulator:');
console.log('🔗 https://metamask.github.io/snaps/snaps-simulator/latest/');
console.log('');

testRequests.forEach((test, index) => {
  console.log(
    `${index + 1}. ${test.method.replace('rugproof_', '').replace('_', ' ').toUpperCase()}`,
  );
  console.log(
    JSON.stringify(
      {
        jsonrpc: '2.0',
        id: index + 1,
        ...test,
      },
      null,
      2,
    ),
  );
  console.log('');
});

console.log('✅ Expected Results:');
console.log('- All methods should return success responses with mock data');
console.log('- Dialog boxes should appear with security analysis');
console.log('- No "Method not found" or "n is not a function" errors');
console.log('');
console.log('🚀 Your snap is ready for testing!');
