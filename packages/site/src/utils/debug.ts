import { defaultSnapOrigin } from '../config';

export const debugSnapConnection = () => {
  console.log('=== RugProof Snap Debug Info ===');
  console.log('Snap Origin:', defaultSnapOrigin);
  console.log('Current URL:', window.location.href);
  console.log('MetaMask Available:', Boolean(window.ethereum));
  console.log('Time:', new Date().toISOString());
  console.log('================================');
};

export const testSnapServer = async () => {
  try {
    const response = await fetch('http://localhost:8080/snap.manifest.json');
    const manifest = await response.json();
    console.log('✅ Snap server is running');
    console.log('Snap manifest:', manifest);
    return true;
  } catch (error) {
    console.error('❌ Snap server not accessible:', error);
    return false;
  }
};

export const checkMetaMaskFlask = async () => {
  if (!window.ethereum) {
    console.error('❌ MetaMask not detected');
    return false;
  }

  try {
    const clientVersion = await window.ethereum.request({
      method: 'web3_clientVersion',
    });

    const isFlask = (clientVersion as string[])?.includes('flask');

    if (isFlask) {
      console.log('✅ MetaMask Flask detected');
    } else {
      console.warn('⚠️ Regular MetaMask detected (Flask required for Snaps)');
    }

    return isFlask;
  } catch (error) {
    console.error('❌ Error checking MetaMask version:', error);
    return false;
  }
};
