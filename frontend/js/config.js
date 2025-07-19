/**
 * Configuration constants for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

import contracts from '../contracts.json';

// Network Configuration
export const NETWORK_CONFIG = {
  RPC_URL: 'http://localhost:8545',
  CHAIN_ID: contracts.chainId.toString(),
  CHAIN_NAME: 'Localhost 31337'
};

// Contract Configuration
export const CONTRACT_CONFIG = {
  ECO_COIN_ADDRESS: contracts.ecoCoin,
  DONATION_ADDRESS: contracts.donationContract,
  ECO_COIN_ABI: ['function balanceOf(address) view returns (uint256)'],
  DONATION_ABI: [
    'function donate(uint8,string) payable',
    'event DonationMade(uint8 f,address sender,uint amount,string msg_)',
    'event TokenBalanceUpdated(address donor,uint256 balance)'
  ]
};

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
