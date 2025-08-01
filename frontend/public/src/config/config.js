/**
 * Configuration constants for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isVercel = window.location.hostname.includes('vercel.app');

// Contracts will be loaded dynamically
let contractsData = null;

// Network Configuration
export const NETWORK_CONFIG = {
  RPC_URL: 'http://localhost:8545',
  CHAIN_ID: '31337', // Default, will be updated when contracts load
  CHAIN_NAME: 'Localhost 31337'
};

// API Configuration
export const API_CONFIG = {
  base: isDevelopment ? 'http://localhost:3001' : '/api',
  feedback: isDevelopment ? 'http://localhost:3001/api/feedback' : '/api/feedback',
  health: isDevelopment ? 'http://localhost:3001/api/health' : '/api/health'
};

// Beta Testing Configuration
export const BETA_CONFIG = {
  enabled: true,
  feedbackCollection: true,
  userTracking: true,
  showWidget: true
};

// Contract Configuration
export const CONTRACT_CONFIG = {
  ECO_COIN_ADDRESS: null, // Will be loaded dynamically
  DONATION_ADDRESS: null, // Will be loaded dynamically
  ECO_COIN_ABI: ['function balanceOf(address) view returns (uint256)'],
  DONATION_ABI: [
    'function donate(uint8,string) payable',
    'event DonationMade(uint8 f,address sender,uint amount,string msg_)',
    'event TokenBalanceUpdated(address donor,uint256 balance)'
  ]
};

// Load contracts dynamically
async function loadContracts() {
  try {
    const response = await fetch('/contracts/contracts.json');
    contractsData = await response.json();

    // Update contract configuration
    CONTRACT_CONFIG.ECO_COIN_ADDRESS = contractsData.ecoCoin;
    CONTRACT_CONFIG.DONATION_ADDRESS = contractsData.donationContract;

    // Update network configuration
    NETWORK_CONFIG.CHAIN_ID = contractsData.chainId.toString();

    console.log('✅ Contracts loaded dynamically:', contractsData);
  } catch (error) {
    console.error('Failed to load contracts dynamically:', error);
    // Set fallback values
    CONTRACT_CONFIG.ECO_COIN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    CONTRACT_CONFIG.DONATION_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  }
}

// Initialize contracts when module loads
loadContracts();

// Foundation Configuration
export const FOUNDATION_CONFIG = {
  NAMES: ['Save The Oceans', 'Protect The Rainforest', 'Protect The Sequoias', 'Clean Energy'],
  IMPACT_MULTIPLIERS: {
    OCEAN_PLASTIC: 12, // tons per ETH
    FOREST_ACRES: 500, // acres per ETH
    ENERGY_MWH: 800, // MWh per ETH
    CARBON_OFFSET: 2.5, // tons CO2 per ETH
    ECO_TOKENS: 10 // ECO tokens per ETH
  },
  PROJECT_MULTIPLIERS: [3, 2, 4, 2] // projects per ETH for each foundation
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 2000,
  CHART_COLORS: ['#28c76f', '#0066ff', '#f59e0b', '#ef4444'],
  WALLET_STORAGE_KEY: 'walletAddress'
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_METAMASK: 'MetaMask not detected. Please install MetaMask to continue.',
  WRONG_NETWORK: 'Please switch MetaMask to Localhost 31337 and retry.',
  CONTRACT_NOT_FOUND: '⚠️ Contract not found on this chain.\n\nRun:\n  npx hardhat node\n  npx hardhat run scripts/deploy.js --network localhost\n\nthen refresh.',
  DONATION_FAILED: 'Donation failed. Please try again.',
  WALLET_CONNECTION_FAILED: 'Failed to connect wallet. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully!',
  DONATION_SUCCESS: 'Thank you for your donation!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed on blockchain!'
};
