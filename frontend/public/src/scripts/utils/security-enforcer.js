/**
 * Security Enforcer Utility
 * Provides client-side security validations and protections
 */

class SecurityEnforcer {
  constructor() {
    this.maxTransactionValue = 1000; // ETH
    this.rateLimitWindow = 60000; // 1 minute
    this.maxTransactionsPerWindow = 5;
    this.transactionHistory = new Map();
    this.blockedAddresses = new Set();
  }

  /**
   * Validate transaction before processing
   */
  validateTransaction(txData) {
    const validations = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check transaction value
    if (txData.value > this.maxTransactionValue) {
      validations.warnings.push(`Large transaction amount: ${txData.value} ETH`);
    }

    // Check recipient address
    if (!this.isValidAddress(txData.to)) {
      validations.isValid = false;
      validations.errors.push('Invalid recipient address');
    }

    // Check for blocked addresses
    if (this.blockedAddresses.has(txData.to.toLowerCase())) {
      validations.isValid = false;
      validations.errors.push('Recipient address is blocked');
    }

    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(txData.from);
    if (!rateLimitResult.allowed) {
      validations.isValid = false;
      validations.errors.push(`Rate limit exceeded: ${rateLimitResult.count}/${this.maxTransactionsPerWindow} transactions in ${this.rateLimitWindow/1000}s`);
    }

    return validations;
  }

  /**
   * Check if address is valid Ethereum address
   */
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check rate limiting for address
   */
  checkRateLimit(address) {
    const now = Date.now();
    const userAddress = address.toLowerCase();

    if (!this.transactionHistory.has(userAddress)) {
      this.transactionHistory.set(userAddress, []);
    }

    const userTxs = this.transactionHistory.get(userAddress);

    // Remove old transactions outside window
    const recentTxs = userTxs.filter(tx => now - tx.timestamp < this.rateLimitWindow);
    this.transactionHistory.set(userAddress, recentTxs);

    return {
      allowed: recentTxs.length < this.maxTransactionsPerWindow,
      count: recentTxs.length,
      resetTime: recentTxs.length > 0 ? recentTxs[0].timestamp + this.rateLimitWindow : now
    };
  }

  /**
   * Record transaction for rate limiting
   */
  recordTransaction(txData) {
    const userAddress = txData.from.toLowerCase();
    const now = Date.now();

    if (!this.transactionHistory.has(userAddress)) {
      this.transactionHistory.set(userAddress, []);
    }

    this.transactionHistory.get(userAddress).push({
      timestamp: now,
      hash: txData.hash,
      value: txData.value
    });
  }

  /**
   * Add address to block list
   */
  blockAddress(address) {
    this.blockedAddresses.add(address.toLowerCase());
    console.warn(`Address blocked: ${address}`);
  }

  /**
   * Remove address from block list
   */
  unblockAddress(address) {
    this.blockedAddresses.delete(address.toLowerCase());
    console.info(`Address unblocked: ${address}`);
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Generate secure transaction nonce
   */
  generateSecureNonce() {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16)).join('');
  }

  /**
   * Validate smart contract interaction
   */
  validateContractCall(contractAddress, methodName, params) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check contract address
    if (!this.isValidAddress(contractAddress)) {
      validation.isValid = false;
      validation.errors.push('Invalid contract address');
    }

    // Check method name
    if (!methodName || typeof methodName !== 'string') {
      validation.isValid = false;
      validation.errors.push('Invalid method name');
    }

    // Validate parameters
    if (params && !Array.isArray(params)) {
      validation.isValid = false;
      validation.errors.push('Parameters must be an array');
    }

    // Check for dangerous methods
    const dangerousMethods = ['selfdestruct', 'delegatecall'];
    if (dangerousMethods.includes(methodName.toLowerCase())) {
      validation.isValid = false;
      validation.errors.push(`Dangerous method call detected: ${methodName}`);
    }

    return validation;
  }

  /**
   * Check if current environment is secure
   */
  checkEnvironmentSecurity() {
    const security = {
      isSecure: true,
      issues: []
    };

    // Check HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      security.isSecure = false;
      security.issues.push('Connection is not secure (HTTPS required)');
    }

    // Check for development tools
    if (typeof window.ethereum === 'undefined') {
      security.issues.push('No Web3 provider detected');
    }

    // Check for suspicious extensions
    if (window.ethereum && window.ethereum.isMetaMask !== true) {
      security.issues.push('Unknown Web3 provider detected');
    }

    return security;
  }

  /**
   * Get security status report
   */
  getSecurityStatus() {
    return {
      blockedAddresses: this.blockedAddresses.size,
      activeUsers: this.transactionHistory.size,
      rateLimitConfig: {
        maxTransactions: this.maxTransactionsPerWindow,
        windowSize: this.rateLimitWindow,
        maxValue: this.maxTransactionValue
      },
      environmentSecurity: this.checkEnvironmentSecurity()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityEnforcer;
} else {
  window.SecurityEnforcer = SecurityEnforcer;
}
