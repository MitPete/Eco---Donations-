/**
 * Enhanced Wallet Integration
 * Provides advanced wallet connection, management, and security features
 */

class EnhancedWallet {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.network = null;
    this.isConnected = false;
    this.supportedWallets = [
      'MetaMask',
      'WalletConnect',
      'Coinbase Wallet',
      'Trust Wallet'
    ];
    this.eventListeners = new Map();
    this.connectionHistory = [];
    this.securityChecks = true;
  }

  /**
   * Initialize wallet connection
   */
  async initialize() {
    try {
      // Check if Web3 is available
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.setupEventListeners();

        // Check if previously connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await this.connect();
        }

        console.log('Enhanced Wallet initialized');
        return true;
      } else {
        console.warn('No Web3 provider found');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      return false;
    }
  }

  /**
   * Connect to wallet
   */
  async connect() {
    try {
      if (!this.provider) {
        throw new Error('No Web3 provider available');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get signer and address
      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();

      // Get network information
      this.network = await this.provider.getNetwork();

      // Perform security checks
      if (this.securityChecks) {
        await this.performSecurityChecks();
      }

      this.isConnected = true;
      this.recordConnection();

      console.log(`Connected to wallet: ${this.address}`);
      this.notifyConnection();

      return {
        address: this.address,
        network: this.network,
        provider: this.getWalletInfo()
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect() {
    try {
      this.provider = null;
      this.signer = null;
      this.address = null;
      this.network = null;
      this.isConnected = false;

      console.log('Wallet disconnected');
      this.notifyDisconnection();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  /**
   * Get wallet information
   */
  getWalletInfo() {
    if (!window.ethereum) return null;

    return {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      isTrust: window.ethereum.isTrust,
      provider: this.detectWalletProvider()
    };
  }

  /**
   * Detect wallet provider type
   */
  detectWalletProvider() {
    if (window.ethereum?.isMetaMask) return 'MetaMask';
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
    if (window.ethereum?.isTrust) return 'Trust Wallet';
    if (window.ethereum?.isWalletConnect) return 'WalletConnect';
    return 'Unknown';
  }

  /**
   * Get account balance
   */
  async getBalance() {
    try {
      if (!this.provider || !this.address) {
        throw new Error('Wallet not connected');
      }

      const balance = await this.provider.getBalance(this.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction count (nonce)
   */
  async getTransactionCount() {
    try {
      if (!this.provider || !this.address) {
        throw new Error('Wallet not connected');
      }

      return await this.provider.getTransactionCount(this.address);
    } catch (error) {
      console.error('Failed to get transaction count:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(transaction) {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected');
      }

      const gasEstimate = await this.provider.estimateGas(transaction);
      const gasPrice = await this.provider.getGasPrice();

      return {
        gasLimit: gasEstimate,
        gasPrice: gasPrice,
        estimatedCost: gasEstimate.mul(gasPrice)
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Send transaction with enhanced security
   */
  async sendTransaction(transaction) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // Security validation
      await this.validateTransaction(transaction);

      // Add gas estimation if not provided
      if (!transaction.gasLimit) {
        const gasInfo = await this.estimateGas(transaction);
        transaction.gasLimit = gasInfo.gasLimit;
        transaction.gasPrice = gasInfo.gasPrice;
      }

      // Send transaction
      const tx = await this.signer.sendTransaction(transaction);
      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      return {
        hash: tx.hash,
        receipt: receipt,
        success: receipt.status === 1
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async signMessage(message) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const signature = await this.signer.signMessage(message);
      console.log('Message signed');

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      // Update network info
      this.network = await this.provider.getNetwork();
      console.log(`Switched to network: ${this.network.name}`);

      return this.network;
    } catch (error) {
      // Network doesn't exist, try to add it
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        console.error('Failed to switch network:', error);
        throw error;
      }
    }
  }

  /**
   * Add network to wallet
   */
  async addNetwork(chainId) {
    const networks = {
      1: {
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
      },
      11155111: {
        chainName: 'Sepolia Testnet',
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
      }
    };

    const networkData = networks[chainId];
    if (!networkData) {
      throw new Error(`Network ${chainId} not supported`);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        ...networkData
      }]
    });
  }

  /**
   * Validate transaction before sending
   */
  async validateTransaction(transaction) {
    // Check required fields
    if (!transaction.to) {
      throw new Error('Transaction recipient required');
    }

    if (!ethers.utils.isAddress(transaction.to)) {
      throw new Error('Invalid recipient address');
    }

    // Check balance
    if (transaction.value) {
      const balance = await this.getBalance();
      const value = ethers.utils.formatEther(transaction.value);

      if (parseFloat(value) > parseFloat(balance)) {
        throw new Error('Insufficient balance');
      }
    }

    // Check gas settings
    if (transaction.gasPrice) {
      const currentGasPrice = await this.provider.getGasPrice();
      const maxGasPrice = currentGasPrice.mul(2); // Max 2x current price

      if (transaction.gasPrice.gt(maxGasPrice)) {
        throw new Error('Gas price too high');
      }
    }

    return true;
  }

  /**
   * Perform security checks
   */
  async performSecurityChecks() {
    const checks = {
      networkSecurity: await this.checkNetworkSecurity(),
      walletSecurity: this.checkWalletSecurity(),
      connectionSecurity: this.checkConnectionSecurity()
    };

    const issues = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    if (issues.length > 0) {
      console.warn('Security issues detected:', issues);
    }

    return checks;
  }

  /**
   * Check network security
   */
  async checkNetworkSecurity() {
    try {
      // Check if on supported network
      const supportedNetworks = [1, 3, 4, 5, 42, 11155111]; // Mainnet, testnets
      const currentChainId = this.network?.chainId;

      return supportedNetworks.includes(currentChainId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check wallet security
   */
  checkWalletSecurity() {
    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return false;
    }

    // Check for known wallet providers
    const walletInfo = this.getWalletInfo();
    return this.supportedWallets.includes(walletInfo?.provider || '');
  }

  /**
   * Check connection security
   */
  checkConnectionSecurity() {
    // Check for suspicious activity
    const recentConnections = this.connectionHistory.slice(-5);
    const suspiciousPattern = recentConnections.length > 3 &&
      recentConnections.every(conn => Date.now() - conn.timestamp < 60000);

    return !suspiciousPattern;
  }

  /**
   * Setup event listeners
   */
  async setupEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.handleAccountChange(accounts[0]);
      }
    });

    window.ethereum.on('chainChanged', (chainId) => {
      this.handleNetworkChange(parseInt(chainId, 16));
    });

    window.ethereum.on('disconnect', () => {
      this.disconnect();
    });
  }

  /**
   * Handle account change
   */
  async handleAccountChange(newAccount) {
    try {
      this.address = newAccount;
      this.signer = this.provider.getSigner();

      console.log('Account changed:', newAccount);
      this.notifyAccountChange(newAccount);
    } catch (error) {
      console.error('Failed to handle account change:', error);
    }
  }

  /**
   * Handle network change
   */
  async handleNetworkChange(newChainId) {
    try {
      this.network = await this.provider.getNetwork();

      console.log('Network changed:', this.network.name);
      this.notifyNetworkChange(this.network);
    } catch (error) {
      console.error('Failed to handle network change:', error);
    }
  }

  /**
   * Record connection for security monitoring
   */
  recordConnection() {
    this.connectionHistory.push({
      timestamp: Date.now(),
      address: this.address,
      network: this.network?.chainId,
      provider: this.getWalletInfo()?.provider
    });

    // Keep only recent connections
    if (this.connectionHistory.length > 10) {
      this.connectionHistory = this.connectionHistory.slice(-10);
    }
  }

  /**
   * Event notification methods
   */
  notifyConnection() {
    this.emit('connected', {
      address: this.address,
      network: this.network,
      provider: this.getWalletInfo()
    });
  }

  notifyDisconnection() {
    this.emit('disconnected');
  }

  notifyAccountChange(newAccount) {
    this.emit('accountChanged', { address: newAccount });
  }

  notifyNetworkChange(newNetwork) {
    this.emit('networkChanged', { network: newNetwork });
  }

  /**
   * Event emitter functionality
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      address: this.address,
      network: this.network,
      provider: this.getWalletInfo(),
      securityChecks: this.securityChecks
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedWallet;
} else {
  window.EnhancedWallet = EnhancedWallet;
}
