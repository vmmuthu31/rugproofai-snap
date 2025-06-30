import { useState, useEffect } from 'react';
import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  WalletScanButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { useMetaMask, useMetaMaskContext, useRequestSnap } from '../hooks';
import {
  isLocalSnap,
  shouldDisplayReconnectButton,
  debugSnapConnection,
  testSnapServer,
  checkMetaMaskFlask,
} from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const TestSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 2rem;
`;

const TestSectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
  color: ${(props) => props.theme.colors.text?.default};
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 60rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border?.default};
  border-radius: ${(props) => props.theme.radii.default};
  background-color: ${(props) => props.theme.colors.background?.default};
  color: ${(props) => props.theme.colors.text?.default};
  font-size: ${({ theme }) => theme.fontSizes.text};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary?.default};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.text?.muted};
  }
`;

const TestAddressButton = styled.button`
  background: ${(props) => props.theme.colors.background?.alternative};
  border: 1px solid ${(props) => props.theme.colors.border?.default};
  color: ${(props) => props.theme.colors.text?.default};
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border-radius: ${(props) => props.theme.radii.default};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.small};

  &:hover {
    background: ${(props) => props.theme.colors.background?.default};
  }
`;

const ResultContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 1.5rem;
  margin-top: 1rem;
  max-width: 60rem;
  width: 100%;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

// Test addresses for demonstration
const TEST_ADDRESSES = {
  SAFE_WALLET: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  USDC_CONTRACT: '0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7',
  CRITICAL_HONEYPOT: '0x1234567890123456789012345678901234567890', // Mock critical honeypot
  HIGH_TAX_TOKEN: '0xabcdef1234567890123456789012345678901234', // Mock high tax token
};

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();

  const [testAddress, setTestAddress] = useState('');
  const [chainId, setChainId] = useState('1');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  // Debug information on page load
  useEffect(() => {
    debugSnapConnection();
    testSnapServer().catch(console.error);
    checkMetaMaskFlask().catch(console.error);
  }, []);

  const handleWalletScan = async () => {
    if (!testAddress) {
      // Use a more appropriate notification method instead of alert()
      setScanResult({
        riskLevel: 'ERROR',
        analysis: 'Please enter a wallet address',
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Map chain ID to chain name
      const getChainName = (id: string) => {
        const chainMapping: Record<string, string> = {
          '1': 'eth-mainnet',
          '56': 'bsc-mainnet',
          '137': 'matic-mainnet',
          '8453': 'base-mainnet',
          '10': 'optimism-mainnet',
        };
        return chainMapping[id] ?? 'eth-mainnet';
      };

      let walletData;
      let isApiAvailable = true;

      try {
        // Try to call the actual RugProof wallet security API
        const response = await fetch(
          'https://api.rugproofai.com/api/v1/security/wallet', // Use localhost for development
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer rp_2f81c4226dc01e8d4908880f8bacba4db76cd7fbb82a5779532c7d1a8efb650f', // API key
            },
            body: JSON.stringify({
              address: testAddress,
              chain: getChainName(chainId),
            }),
          },
        );

        if (!response.ok) {
          throw new Error('API not available');
        }

        walletData = await response.json();

        if (!walletData.success) {
          throw new Error(walletData.error?.message || 'Wallet scan failed');
        }
      } catch (apiError) {
        // API not available, use mock data for demo
        isApiAvailable = false;
        console.warn('API not available, using mock data:', apiError);

        // Generate mock data based on test address
        if (testAddress === TEST_ADDRESSES.CRITICAL_HONEYPOT) {
          walletData = {
            success: true,
            data: {
              wallet: {
                address: testAddress,
                totalTokens: 5,
                safeTokens: 2,
                spamTokens: 3,
                totalNfts: 2,
                safeNfts: 1,
                spamNfts: 1,
              },
              chain: {
                id: getChainName(chainId),
                name: 'Ethereum Mainnet',
              },
              security: {
                riskLevel: 'high',
                riskScore: 95,
                threats: ['SPAM_TOKENS', 'HIGH_SPAM_CONCENTRATION'],
              },
              analysis: {
                spamTokenPercentage: 60,
                spamNftPercentage: 50,
                recommendations: [
                  'Do NOT interact with identified spam tokens',
                  'Do NOT approve any transactions requested by spam contracts',
                  'Consider using a separate wallet for future transactions',
                ],
              },
              detectedThreats: [
                {
                  type: 'spam_token',
                  address: '0x1234567890123456789012345678901234567890',
                  name: 'SCAM Token',
                  symbol: 'SCAM',
                  reason: 'Flagged as honeypot spam token',
                  risk: 'high',
                },
                {
                  type: 'spam_token',
                  address: '0xabcdef1234567890123456789012345678901234',
                  name: 'FAKE Token',
                  symbol: 'FAKE',
                  reason: 'Flagged as spam by blockchain analysis',
                  risk: 'high',
                },
              ],
              lastUpdated: new Date().toISOString(),
            },
          };
        } else if (testAddress === TEST_ADDRESSES.HIGH_TAX_TOKEN) {
          walletData = {
            success: true,
            data: {
              wallet: {
                address: testAddress,
                totalTokens: 8,
                safeTokens: 6,
                spamTokens: 2,
                totalNfts: 3,
                safeNfts: 3,
                spamNfts: 0,
              },
              chain: {
                id: getChainName(chainId),
                name: 'Ethereum Mainnet',
              },
              security: {
                riskLevel: 'medium',
                riskScore: 40,
                threats: ['SPAM_TOKENS'],
              },
              analysis: {
                spamTokenPercentage: 25,
                spamNftPercentage: 0,
                recommendations: [
                  'Review identified spam tokens',
                  'Avoid interacting with suspicious contracts',
                ],
              },
              detectedThreats: [
                {
                  type: 'spam_token',
                  address: '0xabcdef1234567890123456789012345678901234',
                  name: 'High Tax Token',
                  symbol: 'HIGHTAX',
                  reason: 'Excessive transaction fees detected',
                  risk: 'medium',
                },
              ],
              lastUpdated: new Date().toISOString(),
            },
          };
        } else {
          // Safe wallet mock data
          walletData = {
            success: true,
            data: {
              wallet: {
                address: testAddress,
                totalTokens: 12,
                safeTokens: 11,
                spamTokens: 1,
                totalNfts: 5,
                safeNfts: 5,
                spamNfts: 0,
              },
              chain: {
                id: getChainName(chainId),
                name: 'Ethereum Mainnet',
              },
              security: {
                riskLevel: 'low',
                riskScore: 15,
                threats: [],
              },
              analysis: {
                spamTokenPercentage: 8,
                spamNftPercentage: 0,
                recommendations: [
                  'Your wallet appears clean - continue following security best practices',
                ],
              },
              detectedThreats: [
                {
                  type: 'spam_token',
                  address: '0x9999999999999999999999999999999999999999',
                  name: 'Old Token',
                  symbol: 'OLD',
                  reason: 'Outdated token contract',
                  risk: 'low',
                },
              ],
              lastUpdated: new Date().toISOString(),
            },
          };
        }
      }

      const { data } = walletData;

      // Map the API response to our display format
      let riskLevel = 'LOW';
      const { riskScore: initialRiskScore } = data.security;
      let riskScore = initialRiskScore;

      // Convert API risk level to our format
      switch (data.security.riskLevel.toLowerCase()) {
        case 'high':
          riskLevel = 'HIGH';
          break;
        case 'medium':
          riskLevel = 'MEDIUM';
          break;
        default:
          riskLevel = 'LOW';
      }

      // If there are critical threats, upgrade to CRITICAL
      const hasCriticalThreats = data.detectedThreats.some((threat: any) => {
        const { risk, type } = threat;
        return risk === 'high' && type === 'spam_token';
      });
      if (hasCriticalThreats) {
        riskLevel = 'CRITICAL';
        riskScore = Math.max(riskScore, 85);
      }

      // Build threats array for display
      const threats = data.detectedThreats.map((threat: any) => {
        const { type, symbol, name, risk } = threat;
        return {
          type: type.replace('_', ' ').toUpperCase(),
          name: symbol ?? name,
          risk: risk.toUpperCase(),
        };
      });

      // Generate analysis text based on the results
      const { spamTokenPercentage } = data.analysis;
      let analysis = '';
      if (riskLevel === 'CRITICAL') {
        analysis =
          '🚨 CRITICAL RISK: This wallet contains high-risk spam tokens or suspicious contracts. Immediate action recommended!';
      } else if (riskLevel === 'HIGH') {
        analysis = `⚠️ HIGH RISK: ${spamTokenPercentage}% spam tokens detected. Exercise extreme caution.`;
      } else if (riskLevel === 'MEDIUM') {
        analysis = `⚠️ MEDIUM RISK: Some spam tokens detected (${spamTokenPercentage}%). Review your holdings.`;
      } else {
        analysis =
          '✅ LOW RISK: Wallet appears clean with minimal security threats detected.';
      }

      const { wallet, chain, lastUpdated, analysis: analysisData } = data;
      setScanResult({
        riskLevel,
        riskScore,
        totalTokens: wallet.totalTokens,
        spamTokens: wallet.spamTokens,
        totalNfts: wallet.totalNfts,
        spamNfts: wallet.spamNfts,
        threats,
        analysis: isApiAvailable
          ? analysis
          : `${analysis} (Demo Mode - API not available)`,
        recommendations: analysisData.recommendations,
        apiData: {
          fullResponse: data,
          chain,
          lastUpdated,
          isDemo: !isApiAvailable,
        },
      });
    } catch (scanError: any) {
      console.error('Wallet scan error:', scanError);
      setScanResult({
        riskLevel: 'ERROR',
        analysis: `Failed to scan wallet: ${scanError.message}. Please check the address and try again.`,
        error: true,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fillTestAddress = (address: string) => {
    setTestAddress(address);
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>RugProof Security Snap</Span>
      </Heading>
      <Subtitle>
        Real-time transaction protection with automatic spam token detection,
        honeypot warnings, and comprehensive security analysis
      </Subtitle>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the RugProof Security snap.',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
      </CardContainer>

      {installedSnap && (
        <Notice>
          <p>
            <b>🔒 Real-Time Protection Active!</b>
          </p>
          <p>
            Your RugProof Snap is now protecting you automatically. Every
            transaction will be analyzed for:
          </p>
          <ul>
            <li>
              🚨 <strong>Honeypot Detection</strong> - Instant warnings for
              tokens that prevent selling
            </li>
            <li>
              🔍 <strong>Contract Security</strong> - Verification status and
              admin permissions
            </li>
            <li>
              ⚠️ <strong>High Tax Warnings</strong> - Alerts for excessive
              buy/sell taxes
            </li>
            <li>
              🛡️ <strong>Spam Protection</strong> - Automatic detection of
              malicious contracts
            </li>
          </ul>
          <p>
            <strong>Try it now:</strong> Attempt any transaction to{' '}
            {TEST_ADDRESSES.CRITICAL_HONEYPOT} and see the critical risk
            warning!
          </p>
        </Notice>
      )}

      {installedSnap && (
        <TestSection>
          <TestSectionTitle>🔍 Test Wallet Security Scanner</TestSectionTitle>

          <InputContainer>
            <Input
              type="text"
              placeholder="Enter wallet address (0x...)"
              value={testAddress}
              onChange={(event) => setTestAddress(event.target.value)}
            />
            <Input
              type="text"
              placeholder="Chain ID (default: 1 for Ethereum)"
              value={chainId}
              onChange={(event) => setChainId(event.target.value)}
            />
          </InputContainer>

          <div style={{ marginBottom: '1rem' }}>
            <p>
              <strong>Quick Test Addresses:</strong>
            </p>
            <TestAddressButton
              onClick={() => fillTestAddress(TEST_ADDRESSES.SAFE_WALLET)}
            >
              ✅ Safe Wallet
            </TestAddressButton>
            <TestAddressButton
              onClick={() => fillTestAddress(TEST_ADDRESSES.CRITICAL_HONEYPOT)}
            >
              🚨 Critical Honeypot
            </TestAddressButton>
            <TestAddressButton
              onClick={() => fillTestAddress(TEST_ADDRESSES.HIGH_TAX_TOKEN)}
            >
              ⚠️ High Tax Token
            </TestAddressButton>
            <TestAddressButton
              onClick={() => fillTestAddress(TEST_ADDRESSES.USDC_CONTRACT)}
            >
              🪙 USDC Contract
            </TestAddressButton>
          </div>

          <CardContainer>
            <Card
              content={{
                title: 'Wallet Security Scan',
                description:
                  'Comprehensive scan for spam tokens, NFTs, and security threats in your wallet.',
                button: (
                  <WalletScanButton
                    onClick={handleWalletScan}
                    disabled={!installedSnap || !testAddress || isScanning}
                  />
                ),
              }}
              disabled={!installedSnap || !testAddress}
            />
          </CardContainer>

          {isScanning && (
            <ResultContainer>
              <p>🔍 Scanning wallet for security threats...</p>
            </ResultContainer>
          )}

          {scanResult && !scanResult.error && (
            <ResultContainer>
              <h3>
                🔍 Wallet Security Report{' '}
                {scanResult.apiData?.isDemo && '(Demo Mode)'}
              </h3>
              <p>
                <strong>Risk Level:</strong> {scanResult.riskLevel} (
                {scanResult.riskScore}/100)
              </p>
              <p>
                <strong>Total Tokens:</strong> {scanResult.totalTokens} (Spam:{' '}
                {scanResult.spamTokens})
              </p>
              <p>
                <strong>Total NFTs:</strong> {scanResult.totalNfts} (Spam:{' '}
                {scanResult.spamNfts})
              </p>

              <h4>🚨 Detected Threats:</h4>
              {scanResult.threats?.length > 0 ? (
                scanResult.threats.map((threat: any, index: number) => (
                  <p key={index}>
                    • <strong>{threat.type}:</strong> {threat.name} (
                    {threat.risk} risk)
                  </p>
                ))
              ) : (
                <p>• No major threats detected</p>
              )}

              <h4>📊 Security Analysis:</h4>
              <p>{scanResult.analysis}</p>

              {scanResult.recommendations &&
                scanResult.recommendations.length > 0 && (
                  <>
                    <h4>💡 Recommendations:</h4>
                    {scanResult.recommendations.map(
                      (rec: string, index: number) => (
                        <p key={index}>• {rec}</p>
                      ),
                    )}
                  </>
                )}

              {scanResult.apiData && (
                <details style={{ marginTop: '1rem' }}>
                  <summary>
                    <strong>🔧 API Response Data</strong>
                  </summary>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    <p>
                      <strong>Chain:</strong> {scanResult.apiData.chain?.name} (
                      {scanResult.apiData.chain?.id})
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{' '}
                      {new Date(
                        scanResult.apiData.lastUpdated,
                      ).toLocaleString()}
                    </p>
                    <details style={{ marginTop: '0.5rem' }}>
                      <summary>Raw API Response</summary>
                      <pre
                        style={{
                          background: '#f5f5f5',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '0.8em',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(
                          scanResult.apiData.fullResponse,
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </div>
                </details>
              )}
            </ResultContainer>
          )}

          {scanResult?.error && (
            <ErrorMessage>
              <b>Scan Error:</b> {scanResult.error}
            </ErrorMessage>
          )}
        </TestSection>
      )}

      <Notice>
        <p>
          <b>RugProof Security Snap Features:</b>
        </p>
        <ul>
          <li>
            ⚡ <strong>Real-Time Protection:</strong> Automatic security
            analysis for every transaction before you sign
          </li>
          <li>
            🚨 <strong>Spam Token Warnings:</strong> Instant alerts for spam
            tokens and honeypots during transactions
          </li>
          <li>
            🔒 <strong>Zero-Click Protection:</strong> Works automatically in
            the background - no manual checking needed
          </li>
          <li>
            🛡️ <strong>Transaction Insights:</strong> Shows security details
            before you confirm any transaction
          </li>
          <li>
            🎯 <strong>Smart Risk Scoring:</strong> Clear risk levels from LOW
            to CRITICAL with detailed explanations
          </li>
        </ul>
        <p>
          <strong>Test Critical Honeypot Detection:</strong>
          <br />
          Try sending any transaction to:{' '}
          <code>{TEST_ADDRESSES.CRITICAL_HONEYPOT}</code>
          <br />
          You'll see a CRITICAL risk warning before signing!
        </p>
      </Notice>
    </Container>
  );
};

export default Index;
