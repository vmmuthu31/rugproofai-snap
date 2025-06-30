/* eslint-disable @typescript-eslint/no-explicit-any */

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type RiskResultData = {
  level: string;
  score: number;
  detail?: string;
  moreLink?: string;
};

export type RiskResult = {
  success: boolean;
  data?: RiskResultData;
  error?: string;
};

/**
 * Analyze transaction risk using honeypot and contract analysis
 *
 * @param transaction - The transaction object to analyze
 * @param chainId - The blockchain chain ID
 * @param transactionOrigin - Origin of the transaction (optional)
 * @returns Promise resolving to risk analysis result
 */
export async function analyzeTransactionRisk(
  transaction: any,
  chainId: string,
  transactionOrigin?: string,
): Promise<RiskResult> {
  try {
    // Extract contract address from transaction
    const contractAddress = transaction.to;
    if (!contractAddress) {
      return {
        success: true,
        data: {
          level: RiskLevel.LOW,
          score: 10,
          detail: 'No contract interaction detected',
        },
      };
    }

    // Parallel API calls to honeypot and contract endpoints
    const [honeypotResult, contractResult] = await Promise.allSettled([
      fetch(
        `https://api.rugproof.ai/honeypot?address=${contractAddress}&chainId=${chainId}`,
      ),
      fetch(
        `https://api.rugproof.ai/contract?address=${contractAddress}&chainId=${chainId}`,
      ),
    ]);

    let honeypotData = null;
    let contractData = null;

    // Process honeypot result
    if (honeypotResult.status === 'fulfilled' && honeypotResult.value.ok) {
      honeypotData = await honeypotResult.value.json();
    }

    // Process contract result
    if (contractResult.status === 'fulfilled' && contractResult.value.ok) {
      contractData = await contractResult.value.json();
    }

    // Determine risk level based on available data
    let riskLevel = RiskLevel.LOW;
    let riskScore = 10;
    const details = [];

    // Check honeypot data first (highest priority)
    if (honeypotData?.isHoneypot) {
      riskLevel = RiskLevel.CRITICAL;
      riskScore = 95;
      details.push(
        '🚨 HONEYPOT DETECTED: This token prevents selling after purchase',
      );
    } else if (honeypotData?.sellTax && honeypotData.sellTax > 30) {
      riskLevel = RiskLevel.HIGH;
      riskScore = 80;
      details.push(
        `⚠️ HIGH SELL TAX: ${honeypotData.sellTax}% fee when selling`,
      );
    } else if (honeypotData?.buyTax && honeypotData.buyTax > 10) {
      riskLevel = RiskLevel.MEDIUM;
      riskScore = 50;
      details.push(`⚠️ HIGH BUY TAX: ${honeypotData.buyTax}% fee when buying`);
    }

    // Check contract verification status
    if (contractData && !contractData.isVerified) {
      if (riskLevel === RiskLevel.LOW) {
        riskLevel = RiskLevel.MEDIUM;
        riskScore = Math.max(riskScore, 40);
      }
      details.push('⚠️ UNVERIFIED CONTRACT: Source code not publicly verified');
    }

    // Add admin/owner risks
    if (contractData?.hasOwner) {
      details.push('⚠️ ADMIN CONTROL: Contract has owner privileges');
      riskScore = Math.max(riskScore, 30);
    }

    const finalDetail =
      details.length > 0
        ? details.join('\n\n')
        : 'Contract appears safe based on available data';

    const resultData: RiskResultData = {
      level: riskLevel,
      score: riskScore,
      detail: finalDetail,
    };

    if (transactionOrigin) {
      resultData.moreLink = `Analysis for transaction from ${transactionOrigin}`;
    }

    return {
      success: true,
      data: resultData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Risk analysis failed: ${error.message}`,
    };
  }
}
