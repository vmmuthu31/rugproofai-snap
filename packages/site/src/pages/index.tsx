import { useState, useEffect } from 'react';
import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  HoneypotCheckButton,
  ContractAnalysisButton,
  WalletScanButton,
  AISummaryButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
} from '../hooks';
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

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const [testAddress, setTestAddress] = useState('');
  const [chainId, setChainId] = useState('1');

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  // Debug information on page load
  useEffect(() => {
    debugSnapConnection();
    testSnapServer().catch(console.error);
    checkMetaMaskFlask().catch(console.error);
  }, []);

  const handleHoneypotCheck = async () => {
    if (!testAddress) {
      console.warn('Please enter a contract/token address');
      return;
    }
    try {
      const result = await invokeSnap({
        method: 'rugproof_honeypot_check',
        params: { address: testAddress, chainId },
      });
      console.log('Honeypot check result:', result);
    } catch (honeypotError) {
      console.error('Honeypot check error:', honeypotError);
    }
  };

  const handleContractAnalysis = async () => {
    if (!testAddress) {
      console.warn('Please enter a contract address');
      return;
    }
    try {
      const result = await invokeSnap({
        method: 'rugproof_contract_analysis',
        params: { address: testAddress, chainId },
      });
      console.log('Contract analysis result:', result);
    } catch (contractError) {
      console.error('Contract analysis error:', contractError);
    }
  };

  const handleWalletScan = async () => {
    if (!testAddress) {
      console.warn('Please enter a wallet address');
      return;
    }
    try {
      const result = await invokeSnap({
        method: 'rugproof_wallet_scan',
        params: { address: testAddress, chainId },
      });
      console.log('Wallet scan result:', result);
    } catch (walletError) {
      console.error('Wallet scan error:', walletError);
    }
  };

  const handleAISummary = async () => {
    if (!testAddress) {
      console.warn('Please enter an address');
      return;
    }
    try {
      const result = await invokeSnap({
        method: 'rugproof_ai_summary',
        params: { address: testAddress, chainId },
      });
      console.log('AI summary result:', result);
    } catch (aiError) {
      console.error('AI summary error:', aiError);
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>RugProof Security Snap</Span>
      </Heading>
      <Subtitle>
        Real-time crypto security analysis with honeypot detection, contract
        verification, and wallet scanning
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
        <TestSection>
          <TestSectionTitle>🔒 RugProof Security Testing</TestSectionTitle>

          <InputContainer>
            <Input
              type="text"
              placeholder="Enter contract/wallet address (0x...)"
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

          <CardContainer>
            <Card
              content={{
                title: 'Honeypot Detection',
                description:
                  'Check if a token is a honeypot with buy/sell tax analysis and trading restrictions.',
                button: (
                  <HoneypotCheckButton
                    onClick={handleHoneypotCheck}
                    disabled={!installedSnap || !testAddress}
                  />
                ),
              }}
              disabled={!installedSnap || !testAddress}
            />

            <Card
              content={{
                title: 'Contract Analysis',
                description:
                  'Analyze smart contract security, verification status, and potential risks.',
                button: (
                  <ContractAnalysisButton
                    onClick={handleContractAnalysis}
                    disabled={!installedSnap || !testAddress}
                  />
                ),
              }}
              disabled={!installedSnap || !testAddress}
            />

            <Card
              content={{
                title: 'Wallet Security Scan',
                description:
                  'Scan wallet for spam tokens, NFTs, and potential security threats.',
                button: (
                  <WalletScanButton
                    onClick={handleWalletScan}
                    disabled={!installedSnap || !testAddress}
                  />
                ),
              }}
              disabled={!installedSnap || !testAddress}
            />

            <Card
              content={{
                title: 'AI Security Summary',
                description:
                  'Get an AI-powered comprehensive security analysis summary (Coming Soon).',
                button: (
                  <AISummaryButton
                    onClick={handleAISummary}
                    disabled={!installedSnap || !testAddress}
                  />
                ),
              }}
              disabled={!installedSnap || !testAddress}
            />
          </CardContainer>
        </TestSection>
      )}

      <Notice>
        <p>
          <b>RugProof Security Snap Features:</b>
        </p>
        <ul>
          <li>
            🍯 <strong>Honeypot Detection:</strong> Identify tokens that prevent
            selling
          </li>
          <li>
            🔍 <strong>Contract Analysis:</strong> Verify smart contract
            security and permissions
          </li>
          <li>
            🔒 <strong>Wallet Scanning:</strong> Detect spam tokens and
            suspicious assets
          </li>
          <li>
            ⚡ <strong>Transaction Insights:</strong> Real-time security
            analysis before signing
          </li>
          <li>
            🤖 <strong>AI Analysis:</strong> Comprehensive security summaries
            (Coming Soon)
          </li>
        </ul>
        <p>
          <strong>Test Addresses:</strong>
          <br />• USDC Contract:{' '}
          <code>0xA0b86a33E6441c8C100a9c6F78D3c9F5067a8cc7</code>
          <br />• Sample Wallet:{' '}
          <code>0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code>
        </p>
      </Notice>
    </Container>
  );
};

export default Index;
