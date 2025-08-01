// contract-fix.js - Utility functions and fixes

/**
 * Clips/truncates an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @param {number} startChars - Number of characters to show at the start
 * @param {number} endChars - Number of characters to show at the end
 * @returns {string} - Truncated address
 */
function clip(address, startChars = 6, endChars = 4) {
  if (!address || typeof address !== 'string') {
    return '0x...';
  }

  // Ensure address is valid format
  if (!address.startsWith('0x') || address.length !== 42) {
    return address; // Return as-is if not a valid address
  }

  if (address.length <= startChars + endChars) {
    return address; // Return full address if it's already short
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid address
 */
function isValidAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if it's a valid hex string with 0x prefix and 42 characters total
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Safely format Ether amount with proper decimal places
 * @param {string|number} wei - Amount in wei
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} - Formatted ether amount
 */
function formatEtherSafe(wei, decimals = 4) {
  try {
    if (!wei || wei === '0') return '0.0000';

    // Use ethers formatEther if available
    if (window.ethers && window.ethers.utils) {
      const ether = window.ethers.utils.formatEther(wei.toString());
      return parseFloat(ether).toFixed(decimals);
    }

    // Fallback manual conversion
    const etherValue = wei / Math.pow(10, 18);
    return etherValue.toFixed(decimals);
  } catch (error) {
    console.error('Error formatting ether amount:', error);
    return '0.0000';
  }
}

/**
 * Safely format token amount with proper decimal places
 * @param {string|number} amount - Token amount
 * @param {number} decimals - Token decimals (default 18)
 * @param {number} displayDecimals - Number of decimal places to show
 * @returns {string} - Formatted token amount
 */
function formatTokenSafe(amount, decimals = 18, displayDecimals = 2) {
  try {
    if (!amount || amount === '0') return '0.00';

    // Use ethers formatUnits if available
    if (window.ethers && window.ethers.utils) {
      const formatted = window.ethers.utils.formatUnits(amount.toString(), decimals);
      return parseFloat(formatted).toFixed(displayDecimals);
    }

    // Fallback manual conversion
    const tokenValue = amount / Math.pow(10, decimals);
    return tokenValue.toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0.00';
  }
}

/**
 * Safe contract address getter with validation
 * @param {object} contracts - Contracts configuration object
 * @param {string} contractName - Name of the contract
 * @returns {string|null} - Contract address or null if invalid
 */
function getContractAddress(contracts, contractName) {
  try {
    if (!contracts || typeof contracts !== 'object') {
      console.error('Invalid contracts object');
      return null;
    }

    const address = contracts[contractName];
    if (!isValidAddress(address)) {
      console.error(`Invalid address for contract ${contractName}:`, address);
      return null;
    }

    return address;
  } catch (error) {
    console.error(`Error getting contract address for ${contractName}:`, error);
    return null;
  }
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initialize auto-donation manager when wallet is connected
 */
async function initializeAutoDonation() {
  try {
    if (window.autoDonationManager && window.userAddress && window.provider) {
      await window.autoDonationManager.initialize();
      console.log('[Auto-Donation] Service initialized');
    }
  } catch (error) {
    console.warn('[Auto-Donation] Failed to initialize:', error.message);
  }
}

// Global export
if (typeof window !== 'undefined') {
  window.clip = clip;
  window.isValidAddress = isValidAddress;
  window.formatEtherSafe = formatEtherSafe;
  window.formatTokenSafe = formatTokenSafe;
  window.getContractAddress = getContractAddress;
  window.debounce = debounce;
  window.initializeAutoDonation = initializeAutoDonation;

  // Auto-initialize when wallet connects
  document.addEventListener('walletConnected', initializeAutoDonation);
}

console.log('[contract-fix.js] Utility functions loaded');
