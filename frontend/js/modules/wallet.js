/**
 * Wallet management module for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

import { ethers } from 'ethers';
import {
  NETWORK_CONFIG,
  CONTRACT_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../config.js';
import {
  clipAddress,
  ensureContract,
  getElementById,
  showToast,
  handleAsync
} from '../utils/helpers.js';

/**
 * Wallet Manager Class
 */
class WalletManager {
  constructor() {
    this.browserProvider = null;
    this.signer = null;
    this.rpcProvider = new ethers.JsonRpcProvider(NETWORK_CONFIG.RPC_URL);
    this.donateContract = null;
    this.ecoContract = null;
    this.isConnected = false;
  }

  /**
   * Initialize wallet connection
   */
  async connect() {
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error(ERROR_MESSAGES.NO_METAMASK);
      }

      // Check network
      if (window.ethereum.networkVersion !== NETWORK_CONFIG.CHAIN_ID) {
        throw new Error(ERROR_MESSAGES.WRONG_NETWORK);
      }

      // Connect to MetaMask
      this.browserProvider = new ethers.BrowserProvider(window.ethereum);
      await this.browserProvider.send('eth_requestAccounts', []);
      this.signer = await this.browserProvider.getSigner();

      // Ensure contracts are deployed
      await ensureContract(CONTRACT_CONFIG.DONATION_ADDRESS, this.rpcProvider);

      // Initialize contracts
      this.donateContract = new ethers.Contract(
        CONTRACT_CONFIG.DONATION_ADDRESS,
        CONTRACT_CONFIG.DONATION_ABI,
        this.signer
      );

      this.ecoContract = new ethers.Contract(
        CONTRACT_CONFIG.ECO_COIN_ADDRESS,
        CONTRACT_CONFIG.ECO_COIN_ABI,
        this.signer
      );

      // Set up event listeners
      this.setupEventListeners();

      // Update UI
      await this.updateUI();

      // Store connection
      const address = await this.signer.getAddress();
      localStorage.setItem(UI_CONFIG.WALLET_STORAGE_KEY, address);
      this.isConnected = true;

      showToast(SUCCESS_MESSAGES.WALLET_CONNECTED, 'success');

      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      showToast(error.message, 'error');
      return false;
    }
  }

  /**
   * Attempt to reconnect wallet from localStorage
   */
  async reconnect() {
    const savedAddress = localStorage.getItem(UI_CONFIG.WALLET_STORAGE_KEY);

    if (!savedAddress || !window.ethereum) {
      return false;
    }

    try {
      this.browserProvider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.browserProvider.getSigner();

      const currentAddress = await this.signer.getAddress();

      if (currentAddress.toLowerCase() === savedAddress.toLowerCase()) {
        // Ensure contracts are deployed
        await ensureContract(CONTRACT_CONFIG.DONATION_ADDRESS, this.rpcProvider);

        // Initialize contracts
        this.donateContract = new ethers.Contract(
          CONTRACT_CONFIG.DONATION_ADDRESS,
          CONTRACT_CONFIG.DONATION_ABI,
          this.signer
        );

        this.ecoContract = new ethers.Contract(
          CONTRACT_CONFIG.ECO_COIN_ADDRESS,
          CONTRACT_CONFIG.ECO_COIN_ABI,
          this.signer
        );

        // Set up event listeners
        this.setupEventListeners();

        // Update UI
        await this.updateUI();
        this.isConnected = true;

        return true;
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      localStorage.removeItem(UI_CONFIG.WALLET_STORAGE_KEY);
    }

    return false;
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.browserProvider = null;
    this.signer = null;
    this.donateContract = null;
    this.ecoContract = null;
    this.isConnected = false;

    localStorage.removeItem(UI_CONFIG.WALLET_STORAGE_KEY);
    this.updateDisconnectedUI();
  }

  /**
   * Get current wallet address
   */
  async getAddress() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  /**
   * Get ECO token balance
   */
  async getEcoBalance() {
    if (!this.ecoContract || !this.signer) return '0';

    try {
      const address = await this.signer.getAddress();
      const balance = await this.ecoContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting ECO balance:', error);
      return '0';
    }
  }

  /**
   * Set up contract event listeners
   */
  setupEventListeners() {
    if (!this.donateContract) return;

    this.donateContract.on('TokenBalanceUpdated', async (donor, balance) => {
      const currentAddress = await this.signer.getAddress();
      if (currentAddress.toLowerCase() === donor.toLowerCase()) {
        const balanceElement = getElementById('walletBalance');
        if (balanceElement) {
          balanceElement.textContent = ethers.formatEther(balance) + ' ECO';
        }
      }
    });
  }

  /**
   * Update UI with wallet information
   */
  async updateUI() {
    if (!this.signer) return;

    try {
      const address = await this.signer.getAddress();
      const balance = await this.getEcoBalance();

      // Update connect button
      const connectButton = getElementById('connectButton');
      if (connectButton) {
        connectButton.textContent = clipAddress(address);
        connectButton.classList.add('connected');
      }

      // Update wallet address display
      const walletAddress = getElementById('walletAddress');
      if (walletAddress) {
        walletAddress.textContent = clipAddress(address);
      }

      // Update balance display
      const walletBalance = getElementById('walletBalance');
      if (walletBalance) {
        walletBalance.textContent = balance + ' ECO';
      }

    } catch (error) {
      console.error('Error updating UI:', error);
    }
  }

  /**
   * Update UI for disconnected state
   */
  updateDisconnectedUI() {
    const connectButton = getElementById('connectButton');
    if (connectButton) {
      connectButton.textContent = 'Connect Wallet';
      connectButton.classList.remove('connected');
    }

    const walletAddress = getElementById('walletAddress');
    if (walletAddress) {
      walletAddress.textContent = '';
    }

    const walletBalance = getElementById('walletBalance');
    if (walletBalance) {
      walletBalance.textContent = '';
    }
  }

  /**
   * Check if wallet is connected
   */
  get connected() {
    return this.isConnected && this.signer !== null;
  }

  /**
   * Get donation contract instance
   */
  getDonationContract() {
    return this.donateContract;
  }

  /**
   * Get ECO contract instance
   */
  getEcoContract() {
    return this.ecoContract;
  }

  /**
   * Get RPC provider for read-only operations
   */
  getRpcProvider() {
    return this.rpcProvider;
  }
}

// Create singleton instance
const walletManager = new WalletManager();

// Export wrapped functions for global access
export const connectWallet = handleAsync(
  () => walletManager.connect(),
  ERROR_MESSAGES.WALLET_CONNECTION_FAILED
);

export const reconnectWallet = () => walletManager.reconnect();
export const disconnectWallet = () => walletManager.disconnect();
export const getWalletAddress = () => walletManager.getAddress();
export const getEcoBalance = () => walletManager.getEcoBalance();
export const isWalletConnected = () => walletManager.connected;
export const getDonationContract = () => walletManager.getDonationContract();
export const getEcoContract = () => walletManager.getEcoContract();
export const getRpcProvider = () => walletManager.getRpcProvider();

export default walletManager;
