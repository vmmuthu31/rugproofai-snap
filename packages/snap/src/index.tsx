/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { panel, text, heading, divider } from '@metamask/snaps-sdk';

// RugProof API configuration
const RUGPROOF_API_BASE = 'https://rugproofai.vercel.app/api/v1/security';
const API_KEY =
  'rp_2f81c4226dc01e8d4908880f8bacba4db76cd7fbb82a5779532c7d1a8efb650f';

// Types for RugProof API responses and RPC parameters
interface SnapParams {
  address: string;
  chainId?: string;
}

/**
 * Make API request with proper error handling and timeout
 */
async function makeApiRequest(endpoint: string, body: object): Promise<any> {
  const url = `${RUGPROOF_API_BASE}/${endpoint}`;

  try {
    console.log(`Making API request to: ${url}`);
    console.log('Request body:', JSON.stringify(body));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error(
        `API returned unsuccessful response: ${JSON.stringify(data)}`,
      );
    }
  } catch (error: any) {
    console.error('API request error:', error);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }

    // Re-throw with more context
    throw new Error(`Network request failed: ${error.message}`);
  }
}

/**
 * Get risk level emoji
 */
function getRiskEmoji(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'high':
      return '🚨';
    case 'medium':
      return '⚠️';
    case 'low':
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Handle transaction analysis before signing
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  console.log('Transaction insight triggered');
  console.log('Transaction:', transaction);
  console.log('Chain ID:', chainId);

  try {
    // Extract contract address from transaction
    const contractAddress = transaction.to;
    if (!contractAddress) {
      return {
        content: panel([
          heading('RugProof Security Check'),
          text('⚠️ No contract address found in transaction'),
        ]),
      };
    }

    // Quick honeypot check for the contract
    try {
      const honeypotData = await makeApiRequest('honeypot', {
        address: contractAddress,
        chain: chainId || '1',
      });

      const riskEmoji = getRiskEmoji(honeypotData.security?.riskLevel);
      const isHoneypot = honeypotData.security?.isHoneypot;
      const buyTax = honeypotData.trading?.buyTax || 0;
      const sellTax = honeypotData.trading?.sellTax || 0;

      return {
        content: panel([
          heading('🛡️ RugProof Security Analysis'),
          divider(),
          text(`**Contract:** ${contractAddress}`),
          text(
            `**Security Status:** ${riskEmoji} ${honeypotData.security?.riskLevel?.toUpperCase() || 'UNKNOWN'}`,
          ),
          text(
            `**Honeypot Risk:** ${isHoneypot ? '🚨 HIGH RISK' : '✅ Low Risk'}`,
          ),
          text(`**Buy Tax:** ${buyTax}%`),
          text(`**Sell Tax:** ${sellTax}%`),
          divider(),
          text(
            isHoneypot
              ? '⚠️ **WARNING:** This contract may be a honeypot. Proceed with extreme caution!'
              : '✅ Contract appears safe based on initial analysis.',
          ),
        ]),
      };
    } catch (apiError: any) {
      console.error('API error in transaction insight:', apiError);
      return {
        content: panel([
          heading('🛡️ RugProof Security Check'),
          text(`**Contract:** ${contractAddress}`),
          text('⚠️ Unable to perform security analysis'),
          text(`Error: ${apiError.message}`),
          text('Please verify the contract manually before proceeding.'),
        ]),
      };
    }
  } catch (error: any) {
    console.error('Transaction insight error:', error);
    return {
      content: panel([
        heading('🛡️ RugProof Security Check'),
        text('❌ Security analysis failed'),
        text(`Error: ${error.message}`),
        text('Please verify the transaction manually.'),
      ]),
    };
  }
};

/**
 * Handle RPC requests
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  console.log('RPC request received:', request.method);
  console.log('RPC params:', request.params);

  try {
    switch (request.method) {
      case 'rugproof_honeypot_check':
        return await handleHoneypotCheck(
          request.params as unknown as SnapParams,
        );

      case 'rugproof_contract_analysis':
        return await handleContractAnalysis(
          request.params as unknown as SnapParams,
        );

      case 'rugproof_wallet_scan':
        return await handleWalletScan(request.params as unknown as SnapParams);

      case 'rugproof_ai_summary':
        return await handleAISummary(request.params as unknown as SnapParams);

      default:
        throw new Error(`Unsupported RPC method: ${request.method}`);
    }
  } catch (error: any) {
    console.error(`RPC method ${request.method} failed:`, error);
    throw new Error(`RPC method failed: ${error.message}`);
  }
};

/**
 * Handle honeypot check
 */
async function handleHoneypotCheck(params: SnapParams): Promise<{
  isHoneypot: boolean;
  riskLevel: string;
  riskScore: number;
  buyTax: number;
  sellTax: number;
}> {
  console.log('Handling honeypot check for:', params);

  if (!params?.address) {
    throw new Error('Address parameter is required');
  }

  try {
    const data = await makeApiRequest('honeypot', {
      address: params.address,
      chain: params.chainId || '1',
    });

    return {
      isHoneypot: data.security?.isHoneypot || false,
      riskLevel: data.security?.riskLevel || 'unknown',
      riskScore: data.security?.riskScore || 0,
      buyTax: data.trading?.buyTax || 0,
      sellTax: data.trading?.sellTax || 0,
    };
  } catch (error: any) {
    console.error('Honeypot check failed:', error);
    throw new Error(`Honeypot analysis failed: ${error.message}`);
  }
}

/**
 * Handle contract analysis
 */
async function handleContractAnalysis(params: SnapParams): Promise<{
  riskLevel: string;
  isVerified: boolean;
  isProxy: boolean;
  hasPermissions: boolean;
  risks: string[];
}> {
  console.log('Handling contract analysis for:', params);

  if (!params?.address) {
    throw new Error('Address parameter is required');
  }

  try {
    const data = await makeApiRequest('contract', {
      address: params.address,
      chain: params.chainId || '1',
    });

    return {
      riskLevel: data.security?.riskLevel || 'unknown',
      isVerified: data.contract?.isVerified || false,
      isProxy: data.contract?.isProxy || false,
      hasPermissions: data.contract?.hasPermissions || false,
      risks: data.security?.risks || [],
    };
  } catch (error: any) {
    console.error('Contract analysis failed:', error);
    throw new Error(`Contract analysis failed: ${error.message}`);
  }
}

/**
 * Handle wallet scan
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
  console.log('Handling wallet scan for:', params);

  if (!params?.address) {
    throw new Error('Address parameter is required');
  }

  try {
    const data = await makeApiRequest('wallet', {
      address: params.address,
      chain: params.chainId || '1',
    });

    return {
      riskLevel: data.security?.riskLevel || 'unknown',
      riskScore: data.security?.riskScore || 0,
      totalTokens: data.wallet?.totalTokens || 0,
      spamTokens: data.wallet?.spamTokens || 0,
      totalNfts: data.wallet?.totalNfts || 0,
      spamNfts: data.wallet?.spamNfts || 0,
      threats: data.security?.threats || [],
    };
  } catch (error: any) {
    console.error('Wallet scan failed:', error);
    throw new Error(`Wallet scan failed: ${error.message}`);
  }
}

/**
 * Handle AI summary generation
 */
async function handleAISummary(
  params: SnapParams,
): Promise<{ message: string }> {
  console.log('Handling AI summary for:', params);

  if (!params?.address) {
    throw new Error('Address parameter is required');
  }

  try {
    // For now, return a simple summary. In the future, this could call an AI endpoint
    const contractData = await makeApiRequest('contract', {
      address: params.address,
      chain: params.chainId || '1',
    });

    const honeypotData = await makeApiRequest('honeypot', {
      address: params.address,
      chain: params.chainId || '1',
    });

    const riskLevel =
      contractData.security?.riskLevel ||
      honeypotData.security?.riskLevel ||
      'unknown';
    const isHoneypot = honeypotData.security?.isHoneypot;
    const isVerified = contractData.contract?.isVerified;

    let summary = `Security Analysis Summary for ${params.address}:\n\n`;
    summary += `🛡️ Overall Risk Level: ${riskLevel.toUpperCase()}\n`;
    summary += `🔍 Contract Verified: ${isVerified ? 'Yes' : 'No'}\n`;
    summary += `🍯 Honeypot Risk: ${isHoneypot ? 'HIGH RISK' : 'Low Risk'}\n`;

    if (honeypotData.trading) {
      summary += `💰 Buy Tax: ${honeypotData.trading.buyTax || 0}%\n`;
      summary += `💰 Sell Tax: ${honeypotData.trading.sellTax || 0}%\n`;
    }

    if (contractData.security?.risks?.length > 0) {
      summary += `\n⚠️ Identified Risks:\n`;
      contractData.security.risks.forEach((risk: string) => {
        summary += `• ${risk}\n`;
      });
    }

    return { message: summary };
  } catch (error: any) {
    console.error('AI summary failed:', error);
    return {
      message: `Unable to generate summary: ${error.message}. Please try again or check the address manually.`,
    };
  }
}
