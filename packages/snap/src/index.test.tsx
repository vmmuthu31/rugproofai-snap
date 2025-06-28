import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('RugProof Security Snap Tests', () => {
  describe('onRpcRequest', () => {
    describe('rugproof_honeypot_check', () => {
      it('should return error when API is unavailable', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_honeypot_check',
          params: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: '1',
          },
        });

        // Should return an error response when API is unavailable
        expect(response).toRespondWithError({
          code: -32603,
          message: 'Unable to analyze token',
          stack: expect.any(String),
        });
      });

      it('should require address parameter', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_honeypot_check',
          params: {},
        });

        expect(response).toRespondWithError({
          code: -32603,
          message: 'Address parameter is required',
          stack: expect.any(String),
        });
      });
    });

    describe('rugproof_contract_analysis', () => {
      it('should return error when API is unavailable', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_contract_analysis',
          params: {
            address: '0xA0b86a33E6441E2a4A7d3A5f2f5e1a8e1b2c3d4e',
            chainId: '1',
          },
        });

        // Should return an error response when API is unavailable
        expect(response).toRespondWithError({
          code: -32603,
          message: 'Unable to analyze contract',
          stack: expect.any(String),
        });
      });

      it('should require address parameter', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_contract_analysis',
          params: {},
        });

        expect(response).toRespondWithError({
          code: -32603,
          message: 'Address parameter is required',
          stack: expect.any(String),
        });
      });
    });

    describe('rugproof_wallet_scan', () => {
      it('should return error when API is unavailable', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_wallet_scan',
          params: {
            address: '0x742d35Cc6634C0532925a3b8D4b8c4a4A5d2e3f1',
            chainId: '1',
          },
        });

        // Should return an error response when API is unavailable
        expect(response).toRespondWithError({
          code: -32603,
          message: 'Unable to scan wallet',
          stack: expect.any(String),
        });
      });

      it('should require address parameter', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_wallet_scan',
          params: {},
        });

        expect(response).toRespondWithError({
          code: -32603,
          message: 'Address parameter is required',
          stack: expect.any(String),
        });
      });
    });

    describe('rugproof_ai_summary', () => {
      it('should show AI summary coming soon message', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_ai_summary',
          params: {
            address: '0x742d35Cc6634C0532925a3b8D4b8c4a4A5d2e3f1',
          },
        });

        expect(response).toRespondWith({
          message: 'AI summary feature coming soon!',
        });
      }, 10000); // 10 second timeout

      it('should require address parameter', async () => {
        const { request } = await installSnap();

        const response = await request({
          method: 'rugproof_ai_summary',
          params: {},
        });

        expect(response).toRespondWithError({
          code: -32603,
          message: 'Address parameter is required',
          stack: expect.any(String),
        });
      });
    });

    it('should throw an error for unknown methods', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'unknown_method',
      });

      expect(response).toRespondWithError({
        code: -32603,
        message: 'Method not found.',
        stack: expect.any(String),
      });
    });
  });
});
