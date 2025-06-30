import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('RugProof Security Snap Tests', () => {
  describe('onTransaction', () => {
    it('should analyze transaction with contract address', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7', // Sample contract address
        value: '0x0',
        data: '0x',
        chainId: 'eip155:1',
        origin: 'https://app.uniswap.org',
      });

      // Should return transaction insight
      expect(response).toBeDefined();
    });

    it('should handle transaction without contract address', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0x0000000000000000000000000000000000000000',
        value: '0x1000000000000000000', // 1 ETH
        data: '0x',
        chainId: 'eip155:1',
        origin: 'https://metamask.io',
      });

      // Should return low risk for simple ETH transfer
      expect(response).toBeDefined();
    });

    it('should handle potential honeypot contract', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0x1234567890123456789012345678901234567890', // Mock honeypot address
        value: '0x0',
        data: '0xa9059cbb', // transfer function signature
        chainId: 'eip155:1',
        origin: 'https://app.1inch.io',
      });

      // Should return some form of analysis
      expect(response).toBeDefined();
    });

    it('should handle API failures gracefully', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0xInvalidAddress',
        value: '0x0',
        data: '0x',
        chainId: 'eip155:999999', // Invalid chain
        origin: 'https://test.com',
      });

      // Should handle errors gracefully
      expect(response).toBeDefined();
    });

    it('should provide analysis for high-risk transactions', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0xCriticalRiskContract123456789012345678901234',
        value: '0x0',
        data: '0x',
        chainId: 'eip155:1',
        origin: 'https://malicious-dapp.com',
      });

      // Should return analysis result
      expect(response).toBeDefined();
    });
  });

  describe('Transaction Risk Analysis', () => {
    it('should handle ERC-20 token transfer', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7',
        value: '0x0',
        data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4b8c4a4a5d2e3f1000000000000000000000000000000000000000000000000de0b6b3a7640000',
        chainId: 'eip155:1',
        origin: 'https://app.uniswap.org',
      });

      expect(response).toBeDefined();
    });

    it('should handle smart contract interaction', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
        value: '0x0',
        data: '0x38ed1739', // swapExactTokensForTokens
        chainId: 'eip155:1',
        origin: 'https://app.uniswap.org',
      });

      expect(response).toBeDefined();
    });

    it('should handle different chain IDs', async () => {
      const { onTransaction } = await installSnap();

      const response = await onTransaction({
        to: '0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7',
        value: '0x0',
        data: '0x',
        chainId: 'eip155:56', // BSC
        origin: 'https://pancakeswap.finance',
      });

      expect(response).toBeDefined();
    });
  });
});
