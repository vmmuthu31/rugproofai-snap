import { panel, heading, divider, text } from '@metamask/snaps-sdk';

/**
 * Component for displaying fetch errors
 *
 * @param error - The error object to display
 * @returns Panel component with error information
 */
export function fetchError(error: any) {
  return panel([
    heading('🚨 RugProof Security Check Failed'),
    divider(),
    text('❌ Unable to analyze transaction security.'),
    text(`Error: ${error?.message ?? 'Unknown error occurred'}`),
    text('Please proceed with extreme caution and DYOR.'),
    divider(),
    text('🔒 Powered by RugProof AI'),
  ]);
}

/**
 * Component for displaying general guard errors
 *
 * @param error - The error object to display
 * @returns Panel component with guard error information
 */
export function guardError(error?: any) {
  return panel([
    heading('⚠️ RugProof Security Alert'),
    divider(),
    text('🔍 Security analysis encountered an issue.'),
    text(error?.message ?? 'Unable to complete security check.'),
    text('Please verify transaction details carefully.'),
    divider(),
    text('🔒 Powered by RugProof AI'),
  ]);
}
