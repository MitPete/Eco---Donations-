/**
 * Donation management module for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

import { ethers } from 'ethers';
import {
  FOUNDATION_CONFIG,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from '../config.js';
import {
  formatEther,
  setButtonLoading,
  showToast,
  handleAsync,
  getElementById
} from '../utils/helpers.js';
import {
  getDonationContract,
  getRpcProvider,
  isWalletConnected
} from './wallet.js';

/**
 * Donation Manager Class
 */
class DonationManager {
  constructor() {
    this.donations = [];
    this.totalDonated = 0;
    this.foundationTotals = [0, 0, 0, 0];
  }

  /**
   * Make a donation to a foundation
   * @param {number} foundationId - Foundation ID (0-3)
   * @param {string} amount - Amount in ETH
   * @param {string} message - Optional message
   * @returns {Promise<boolean>} Success status
   */
  async donate(foundationId, amount, message = '') {
    if (!isWalletConnected()) {
      showToast('Please connect your wallet first', 'error');
      return false;
    }

    if (foundationId < 0 || foundationId > 3) {
      showToast('Invalid foundation selected', 'error');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid donation amount', 'error');
      return false;
    }

    try {
      const donationContract = getDonationContract();
      if (!donationContract) {
        throw new Error('Donation contract not initialized');
      }

      // Convert amount to Wei
      const amountWei = ethers.parseEther(amount);

      // Send donation transaction
      const tx = await donationContract.donate(foundationId, message, {
        value: amountWei
      });

      showToast('Transaction sent! Waiting for confirmation...', 'info');

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showToast(SUCCESS_MESSAGES.DONATION_SUCCESS, 'success');
        showToast(SUCCESS_MESSAGES.TRANSACTION_CONFIRMED, 'success');

        // Update local state
        this.addDonation({
          foundationId,
          amount: parseFloat(amount),
          message,
          txHash: receipt.hash,
          timestamp: Date.now()
        });

        return true;
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('Donation failed:', error);
      showToast(ERROR_MESSAGES.DONATION_FAILED, 'error');
      return false;
    }
  }

  /**
   * Quick donation with predefined amounts
   * @param {number} foundationId - Foundation ID
   * @param {number} amount - Amount in ETH
   */
  async quickDonate(foundationId, amount) {
    const donateButton = getElementById('quickDonateBtn');
    setButtonLoading(donateButton, true, 'Donating...');

    try {
      const success = await this.donate(foundationId, amount.toString());

      if (success) {
        // Refresh page data
        this.refreshPageData();
      }
    } finally {
      setButtonLoading(donateButton, false);
    }
  }

  /**
   * Get all donations from blockchain
   * @returns {Promise<Array>} Array of donation events
   */
  async getAllDonations() {
    try {
      const provider = getRpcProvider();
      const donationContract = getDonationContract();

      if (!provider || !donationContract) {
        throw new Error('Provider or contract not initialized');
      }

      // Get all DonationMade events
      const filter = {
        fromBlock: 0,
        toBlock: 'latest'
      };

      const events = await provider.getLogs({
        address: donationContract.target,
        topics: ['0x' + ethers.id('DonationMade(uint8,address,uint256,string)').slice(2)],
        ...filter
      });

      // Process events
      const donations = events.map(log => {
        const [foundation, sender, amount, message] = ethers.AbiCoder.defaultAbiCoder().decode(
          ['uint8', 'address', 'uint256', 'string'],
          log.data
        );

        return {
          foundationId: Number(foundation),
          foundationName: FOUNDATION_CONFIG.NAMES[Number(foundation)],
          sender: sender.toLowerCase(),
          amount: Number(ethers.formatEther(amount)),
          message,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        };
      });

      this.donations = donations;
      this.calculateTotals();

      return donations;

    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  }

  /**
   * Get donations for a specific foundation
   * @param {number} foundationId - Foundation ID
   * @returns {Array} Filtered donations
   */
  getDonationsForFoundation(foundationId) {
    return this.donations.filter(donation => donation.foundationId === foundationId);
  }

  /**
   * Get donations from a specific address
   * @param {string} address - Donor address
   * @returns {Array} Filtered donations
   */
  getDonationsFromAddress(address) {
    return this.donations.filter(donation =>
      donation.sender.toLowerCase() === address.toLowerCase()
    );
  }

  /**
   * Calculate donation totals and statistics
   */
  calculateTotals() {
    this.totalDonated = this.donations.reduce((sum, donation) => sum + donation.amount, 0);

    // Reset foundation totals
    this.foundationTotals = [0, 0, 0, 0];

    // Calculate per-foundation totals
    this.donations.forEach(donation => {
      this.foundationTotals[donation.foundationId] += donation.amount;
    });
  }

  /**
   * Get donation statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const uniqueDonors = new Set(this.donations.map(d => d.sender)).size;
    const totalEcoMinted = this.totalDonated * FOUNDATION_CONFIG.IMPACT_MULTIPLIERS.ECO_TOKENS;
    const carbonOffset = this.totalDonated * FOUNDATION_CONFIG.IMPACT_MULTIPLIERS.CARBON_OFFSET;

    return {
      totalDonated: this.totalDonated,
      uniqueDonors,
      totalEcoMinted,
      carbonOffset,
      foundationTotals: [...this.foundationTotals],
      totalDonations: this.donations.length
    };
  }

  /**
   * Get impact calculations
   * @returns {Object} Impact metrics
   */
  getImpactMetrics() {
    const stats = this.getStatistics();

    return {
      oceanPlasticRemoved: this.foundationTotals[0] * FOUNDATION_CONFIG.IMPACT_MULTIPLIERS.OCEAN_PLASTIC,
      forestAcresProtected: this.foundationTotals[1] * FOUNDATION_CONFIG.IMPACT_MULTIPLIERS.FOREST_ACRES,
      energyGenerated: this.foundationTotals[3] * FOUNDATION_CONFIG.IMPACT_MULTIPLIERS.ENERGY_MWH,
      carbonOffset: stats.carbonOffset,
      totalEcoMinted: stats.totalEcoMinted
    };
  }

  /**
   * Get project counts for each foundation
   * @returns {Array} Project counts
   */
  getProjectCounts() {
    return this.foundationTotals.map((total, index) =>
      Math.floor(total * FOUNDATION_CONFIG.PROJECT_MULTIPLIERS[index]) + 1
    );
  }

  /**
   * Add a donation to local state
   * @param {Object} donation - Donation object
   */
  addDonation(donation) {
    this.donations.push(donation);
    this.calculateTotals();
  }

  /**
   * Refresh page data after donation
   */
  refreshPageData() {
    // Trigger page-specific refresh based on current page
    const currentPage = window.location.pathname;

    if (currentPage.includes('history')) {
      window.loadHistory?.();
    } else if (currentPage.includes('dashboard')) {
      window.loadDashboard?.();
    } else if (currentPage.includes('foundation')) {
      window.loadFoundationProfile?.();
    } else if (currentPage.includes('index') || currentPage === '/') {
      window.loadHomePage?.();
    }
  }

  /**
   * Get top donors
   * @param {number} limit - Number of top donors to return
   * @returns {Array} Top donors with their total donations
   */
  getTopDonors(limit = 10) {
    const donorTotals = {};

    this.donations.forEach(donation => {
      const address = donation.sender;
      donorTotals[address] = (donorTotals[address] || 0) + donation.amount;
    });

    return Object.entries(donorTotals)
      .map(([address, total]) => ({ address, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  /**
   * Get donation history for current user
   * @param {string} userAddress - User's wallet address
   * @returns {Array} User's donation history
   */
  getUserDonationHistory(userAddress) {
    return this.getDonationsFromAddress(userAddress)
      .sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
  }
}

// Create singleton instance
const donationManager = new DonationManager();

// Export wrapped functions for global access
export const makeDonation = handleAsync(
  (foundationId, amount, message) => donationManager.donate(foundationId, amount, message),
  ERROR_MESSAGES.DONATION_FAILED
);

export const quickDonate = (foundationId, amount) => donationManager.quickDonate(foundationId, amount);
export const getAllDonations = () => donationManager.getAllDonations();
export const getDonationsForFoundation = (foundationId) => donationManager.getDonationsForFoundation(foundationId);
export const getDonationsFromAddress = (address) => donationManager.getDonationsFromAddress(address);
export const getDonationStatistics = () => donationManager.getStatistics();
export const getImpactMetrics = () => donationManager.getImpactMetrics();
export const getProjectCounts = () => donationManager.getProjectCounts();
export const getTopDonors = (limit) => donationManager.getTopDonors(limit);
export const getUserDonationHistory = (address) => donationManager.getUserDonationHistory(address);

export default donationManager;
