/**
 * Configuration for RugProof API
 */

// Note: In production, API key should be injected via build process or secure storage
const API_KEY =
  'rp_2f81c4226dc01e8d4908880f8bacba4db76cd7fbb82a5779532c7d1a8efb650f';

export const RUGPROOF_CONFIG = {
  API_BASE: 'https://api.rugproofai.com/v1/security',
  API_KEY,
  TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
} as const;

/**
 * Validate that API key is available
 *
 * @returns True if API key is valid, false otherwise
 */
export function validateApiKey(): boolean {
  if (!RUGPROOF_CONFIG.API_KEY) {
    console.error('API key is not configured');
    return false;
  }

  if (RUGPROOF_CONFIG.API_KEY.length < 32) {
    console.error('API key appears to be invalid (too short)');
    return false;
  }

  return true;
}

/**
 * Get authorization header for API requests
 * @returns Authorization header string
 */
export function getAuthHeader(): string {
  return `Bearer ${RUGPROOF_CONFIG.API_KEY}`;
}
