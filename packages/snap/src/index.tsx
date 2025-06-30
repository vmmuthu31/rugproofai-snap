/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import {
  panel,
  text,
  heading,
  divider,
  SeverityLevel,
} from '@metamask/snaps-sdk';

import { analyzeTransactionRisk, type RiskResultData } from './apis/risk';
import { fetchError, guardError } from './components/error';

/**
 * Get risk level emoji and color
 *
 * @param riskLevel - The risk level to get the emoji and color for
 * @returns The emoji and color for the risk level
 */
function getRiskIndicator(riskLevel: string): { emoji: string; color: string } {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return { emoji: '🚨', color: '#ff0000' };
    case 'high':
      return { emoji: '🔴', color: '#ff4444' };
    case 'medium':
      return { emoji: '⚠️', color: '#ffaa00' };
    case 'low':
      return { emoji: '✅', color: '#44ff44' };
    default:
      return { emoji: '❓', color: '#888888' };
  }
}

/**
 * Component for displaying risk analysis results
 *
 * @param data - The risk result data to display
 * @returns Panel component with risk analysis information
 */
function riskResultComponent(data: RiskResultData) {
  const { emoji } = getRiskIndicator(data.level);

  const content = [
    heading('🔒 RugProof Real-Time Protection'),
    divider(),
    text(`${emoji} **Risk Level**: ${data.level}`),
    text(`📊 **Risk Score**: ${data.score}/100`),
  ];

  if (data.detail) {
    content.push(divider(), text('**Security Analysis:**'), text(data.detail));
  }

  if (data.moreLink) {
    content.push(divider(), text('🔗 **Learn More:**'), text(data.moreLink));
  }

  content.push(divider(), text('🔒 Powered by RugProof AI'));

  return panel(content);
}

/**
 * Real-time transaction security analysis.
 * Automatically protects users from spam tokens and honeypots.
 *
 * @param options - Transaction handler options
 * @param options.transaction - The transaction to analyze
 * @param options.chainId - The blockchain chain ID
 * @param options.transactionOrigin - Origin of the transaction
 * @returns Transaction insight result
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  try {
    // Use the new API for real-time transaction analysis
    const risk = await analyzeTransactionRisk(
      transaction,
      chainId,
      transactionOrigin,
    );

    if (risk.success && risk.data) {
      // Show critical warning for high-risk transactions
      return risk.data.level === 'CRITICAL'
        ? {
            severity: SeverityLevel.Critical,
            content: riskResultComponent(risk.data),
          }
        : { content: riskResultComponent(risk.data) };
    }

    return {
      content: guardError(risk.error),
    };
  } catch (error: any) {
    return {
      content: fetchError(error),
    };
  }
};
