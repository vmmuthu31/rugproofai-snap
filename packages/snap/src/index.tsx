/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { panel, text, heading, divider, copyable } from '@metamask/snaps-sdk';

import { RUGPROOF_CONFIG, getAuthHeader, validateApiKey } from './config';

declare const snap: {
  request: (args: { method: string; params: any }) => Promise<any>;
};

// Types for RugProof API responses
type ContractAnalysis = {
  contract: {
    address: string;
    isVerified: boolean;
    isProxy: boolean;
    hasPermissions: boolean;
  };
  security: {
    riskLevel: 'low' | 'medium' | 'high';
    risks: string[];
  };
};

type HoneypotAnalysis = {
  security: {
    isHoneypot: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
  };
  trading: {
    buyTax: number;
    sellTax: number;
  };
  flags: string[];
};

type WalletAnalysis = {
  wallet: {
    totalTokens: number;
    spamTokens: number;
    totalNfts: number;
    spamNfts: number;
  };
  security: {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    threats: string[];
  };
  detectedThreats: {
    type: string;
    address: string;
    name: string;
    risk: 'low' | 'medium' | 'high';
  }[];
};

type SnapParams = {
  address: string;
  chainId?: string;
};

/**
 * @description Analyze contract security using RugProof API
 * Analyze contract security using RugProof API
 * @param address - The address of the contract to analyze
 * @param chainId - The chain ID of the contract
 * @returns The contract analysis or null if the analysis fails
 */
async function analyzeContract(
  address: string,
  chainId: string,
): Promise<ContractAnalysis | null> {
  if (!validateApiKey()) {
    return null;
  }

  try {
    const response = await fetch(`${RUGPROOF_CONFIG.API_BASE}/contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        address,
        chain: chainId,
      }),
    });

    if (!response.ok) {
      console.error('Contract analysis failed:', response.statusText);
      return null;
    }
    const data = (await response.json()) as { data: ContractAnalysis };
    return data.data;
  } catch (error) {
    console.error('Error analyzing contract:', error);
    return null;
  }
}

/**
 * @description Check if token is honeypot using RugProof API
 * @param address - The address of the token to check
 * @param chainId - The chain ID of the token
 * @returns The honeypot analysis or null if the analysis fails
 */
async function checkHoneypot(
  address: string,
  chainId: string,
): Promise<HoneypotAnalysis | null> {
  if (!validateApiKey()) {
    return null;
  }

  try {
    const response = await fetch(`${RUGPROOF_CONFIG.API_BASE}/honeypot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        address,
        chain: chainId,
      }),
    });

    if (!response.ok) {
      console.error('Honeypot check failed:', response.statusText);
      return null;
    }

    const data = (await response.json()) as { data: HoneypotAnalysis };
    return data.data;
  } catch (error) {
    console.error('Error checking honeypot:', error);
    return null;
  }
}

/**
 * @description Scan wallet for spam tokens using RugProof API
 * @param address - The address of the wallet to scan
 * @param chainId - The chain ID of the wallet
 * @returns The wallet analysis or null if the analysis fails
 */
async function scanWallet(
  address: string,
  chainId: string,
): Promise<WalletAnalysis | null> {
  if (!validateApiKey()) {
    return null;
  }

  try {
    const response = await fetch(`${RUGPROOF_CONFIG.API_BASE}/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        address,
        chain: chainId,
      }),
    });

    if (!response.ok) {
      console.error('Wallet scan failed:', response.statusText);
      return null;
    }

    const data = (await response.json()) as { data: WalletAnalysis };
    return data.data;
  } catch (error) {
    console.error('Error scanning wallet:', error);
    return null;
  }
}

/**
 * @description Get risk level emoji and color
 * @param riskLevel - The risk level to get the emoji and color for
 * @returns The emoji and color for the risk level
 */
function getRiskIndicator(riskLevel: string): { emoji: string; color: string } {
  switch (riskLevel) {
    case 'high':
      return { emoji: '🚨', color: '#ff4444' };
    case 'medium':
      return { emoji: '⚠️', color: '#ffaa00' };
    case 'low':
      return { emoji: '✅', color: '#44ff44' };
    default:
      return { emoji: '❓', color: '#888888' };
  }
}

/**
 * @description Handle transaction analysis before signing
 * @param params - The transaction parameters
 * @param params.transaction - The transaction to analyze
 * @param params.chainId - The chain ID of the transaction
 * @returns The transaction analysis or null if the analysis fails
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  try {
    const toAddress = transaction.to;
    if (!toAddress) {
      return {
        content: panel([
          heading('RugProof Security Check'),
          text('⚠️ Transaction to unknown address detected.'),
          text('Please verify the transaction details carefully.'),
        ]),
      };
    }

    // Analyze the contract being interacted with
    const contractAnalysis = await analyzeContract(toAddress, chainId);
    const honeypotAnalysis = await checkHoneypot(toAddress, chainId);

    if (!contractAnalysis && !honeypotAnalysis) {
      return {
        content: panel([
          heading('RugProof Security Check'),
          text('🔍 Unable to analyze contract security.'),
          text('Proceed with caution and DYOR.'),
        ]),
      };
    }

    const riskLevel =
      contractAnalysis?.security.riskLevel ??
      honeypotAnalysis?.security.riskLevel ??
      'unknown';
    const { emoji } = getRiskIndicator(riskLevel);

    const warnings: string[] = [];

    // Add contract-specific warnings
    if (contractAnalysis?.security.risks) {
      warnings.push(...contractAnalysis.security.risks);
    }

    // Add honeypot warnings
    if (honeypotAnalysis?.security.isHoneypot) {
      warnings.push('HONEYPOT_DETECTED');
    }
    if (honeypotAnalysis?.flags) {
      warnings.push(...honeypotAnalysis.flags);
    }

    const content = [
      heading('RugProof Security Analysis'),
      divider(),
      text(`${emoji} **Risk Level**: ${riskLevel.toUpperCase()}`),
      text(`📍 **Contract**: ${toAddress}`),
    ];

    if (contractAnalysis) {
      content.push(
        divider(),
        text('**Contract Analysis:**'),
        text(
          `✅ Verified: ${contractAnalysis.contract.isVerified ? 'Yes' : 'No'}`,
        ),
        text(`🔄 Proxy: ${contractAnalysis.contract.isProxy ? 'Yes' : 'No'}`),
        text(
          `🔐 Admin Functions: ${
            contractAnalysis.contract.hasPermissions ? 'Yes' : 'No'
          }`,
        ),
      );
    }

    if (honeypotAnalysis) {
      content.push(
        divider(),
        text('**Token Analysis:**'),
        text(
          `🍯 Honeypot: ${honeypotAnalysis.security.isHoneypot ? 'YES' : 'No'}`,
        ),
        text(`💰 Buy Tax: ${honeypotAnalysis.trading.buyTax}%`),
        text(`💸 Sell Tax: ${honeypotAnalysis.trading.sellTax}%`),
      );
    }

    if (warnings.length > 0) {
      content.push(divider(), text('**⚠️ Security Warnings:**'));
      warnings.slice(0, 3).forEach((warning) => {
        content.push(text(`• ${warning.replace(/_/gu, ' ')}`));
      });
    }

    content.push(divider(), text('🔒 **Powered by RugProof AI**'));

    return {
      content: panel(content),
    };
  } catch (error) {
    console.error('Transaction analysis error:', error);
    return {
      content: panel([
        heading('RugProof Security Check'),
        text('❌ Error analyzing transaction security.'),
        text('Please proceed with extreme caution.'),
      ]),
    };
  }
};

/**
 * @description Handle RPC requests for custom functionality
 * @param request - The RPC request
 * @param request.request - The request object containing method and params
 * @returns The RPC response
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'rugproof_honeypot_check':
      return await handleHoneypotCheck(request.params as unknown as SnapParams);

    case 'rugproof_contract_analysis':
      return await handleContractAnalysis(
        request.params as unknown as SnapParams,
      );

    case 'rugproof_wallet_scan':
      return await handleWalletScan(request.params as unknown as SnapParams);

    case 'rugproof_ai_summary':
      return await handleAISummary(request.params as unknown as SnapParams);

    default:
      throw new Error('Method not found.');
  }
};

/**
 * @description Handle honeypot check RPC request
 * @param params - The parameters for the honeypot check
 * @param params.address - The address of the token to check
 * @param params.chainId - The chain ID of the token
 * @returns The honeypot check result
 */
async function handleHoneypotCheck(params: SnapParams): Promise<{
  isHoneypot: boolean;
  riskLevel: string;
  riskScore: number;
  buyTax: number;
  sellTax: number;
}> {
  const { address, chainId } = params;

  if (!address) {
    throw new Error('Address parameter is required');
  }

  const analysis = await checkHoneypot(address, chainId ?? '1');

  if (!analysis) {
    throw new Error('Unable to analyze token');
  }

  const { emoji } = getRiskIndicator(analysis.security.riskLevel);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('🍯 Honeypot Analysis'),
        divider(),
        text(
          `${emoji} **Risk Level**: ${analysis.security.riskLevel.toUpperCase()}`,
        ),
        text(`🍯 **Honeypot**: ${analysis.security.isHoneypot ? 'YES' : 'No'}`),
        text(`💰 **Buy Tax**: ${analysis.trading.buyTax}%`),
        text(`💸 **Sell Tax**: ${analysis.trading.sellTax}%`),
        text(`📊 **Risk Score**: ${analysis.security.riskScore}/100`),
        divider(),
        copyable(address),
        text('🔒 Powered by RugProof AI'),
      ]),
    },
  });

  return {
    isHoneypot: analysis.security.isHoneypot,
    riskLevel: analysis.security.riskLevel,
    riskScore: analysis.security.riskScore,
    buyTax: analysis.trading.buyTax,
    sellTax: analysis.trading.sellTax,
  };
}

/**
 * @description Handle contract analysis RPC request
 * @param params - The parameters for the contract analysis
 * @param params.address - The address of the contract to analyze
 * @param params.chainId - The chain ID of the contract
 * @returns The contract analysis result
 */
async function handleContractAnalysis(params: SnapParams): Promise<{
  riskLevel: string;
  isVerified: boolean;
  isProxy: boolean;
  hasPermissions: boolean;
  risks: string[];
}> {
  const { address, chainId } = params;

  if (!address) {
    throw new Error('Address parameter is required');
  }

  const analysis = await analyzeContract(address, chainId ?? '1');

  if (!analysis) {
    throw new Error('Unable to analyze contract');
  }

  const { emoji } = getRiskIndicator(analysis.security.riskLevel);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('🔍 Contract Analysis'),
        divider(),
        text(
          `${emoji} **Risk Level**: ${analysis.security.riskLevel.toUpperCase()}`,
        ),
        text(`✅ **Verified**: ${analysis.contract.isVerified ? 'Yes' : 'No'}`),
        text(
          `🔄 **Proxy Contract**: ${analysis.contract.isProxy ? 'Yes' : 'No'}`,
        ),
        text(
          `🔐 **Admin Functions**: ${
            analysis.contract.hasPermissions ? 'Yes' : 'No'
          }`,
        ),
        divider(),
        copyable(address),
        text('🔒 Powered by RugProof AI'),
      ]),
    },
  });

  return {
    riskLevel: analysis.security.riskLevel,
    isVerified: analysis.contract.isVerified,
    isProxy: analysis.contract.isProxy,
    hasPermissions: analysis.contract.hasPermissions,
    risks: analysis.security.risks,
  };
}

/**
 * @description Handle wallet scan RPC request
 * @param params - The parameters for the wallet scan
 * @param params.address - The address of the wallet to scan
 * @param params.chainId - The chain ID of the wallet
 * @returns The wallet scan result
 */
async function handleWalletScan(params: SnapParams): Promise<{
  riskLevel: string;
  riskScore: number;
  totalTokens: number;
  spamTokens: number;
  totalNfts: number;
  spamNfts: number;
  threats: string[];
}> {
  const { address, chainId } = params;

  if (!address) {
    throw new Error('Address parameter is required');
  }

  const analysis = await scanWallet(address, chainId ?? '1');

  if (!analysis) {
    throw new Error('Unable to scan wallet');
  }

  const { emoji } = getRiskIndicator(analysis.security.riskLevel);
  const spamPercentage =
    analysis.wallet.totalTokens > 0
      ? Math.round(
          (analysis.wallet.spamTokens / analysis.wallet.totalTokens) * 100,
        )
      : 0;

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('🔍 Wallet Security Scan'),
        divider(),
        text(
          `${emoji} **Risk Level**: ${analysis.security.riskLevel.toUpperCase()}`,
        ),
        text(`📊 **Risk Score**: ${analysis.security.riskScore}/100`),
        divider(),
        text('**Token Analysis:**'),
        text(`🪙 Total Tokens: ${analysis.wallet.totalTokens}`),
        text(
          `🚨 Spam Tokens: ${analysis.wallet.spamTokens} (${spamPercentage}%)`,
        ),
        text(`🖼️ Total NFTs: ${analysis.wallet.totalNfts}`),
        text(`🚨 Spam NFTs: ${analysis.wallet.spamNfts}`),
        divider(),
        copyable(address),
        text('🔒 Powered by RugProof AI'),
      ]),
    },
  });

  return {
    riskLevel: analysis.security.riskLevel,
    riskScore: analysis.security.riskScore,
    totalTokens: analysis.wallet.totalTokens,
    spamTokens: analysis.wallet.spamTokens,
    totalNfts: analysis.wallet.totalNfts,
    spamNfts: analysis.wallet.spamNfts,
    threats: analysis.security.threats,
  };
}

/**
 * @description Handle AI summary RPC request (placeholder for future AI integration)
 * @param params - The parameters for the AI summary
 * @param params.address - The address of the wallet to summarize
 * @returns The AI summary result
 */
async function handleAISummary(
  params: SnapParams,
): Promise<{ message: string }> {
  const { address } = params;

  if (!address) {
    throw new Error('Address parameter is required');
  }

  // This would integrate with your AI agent API
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('🤖 AI Security Summary'),
        divider(),
        text('🚧 Coming Soon!'),
        text(
          'AI-powered security analysis will be available in a future update.',
        ),
        divider(),
        copyable(address),
        text('🔒 Powered by RugProof AI'),
      ]),
    },
  });

  return { message: 'AI summary feature coming soon!' };
}
