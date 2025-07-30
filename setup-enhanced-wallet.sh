#!/bin/bash

echo "🔗 Setting up Enhanced Wallet Integration..."
echo "==========================================="

cd "$(dirname "$0")/frontend"

# Create enhanced wallet manager
echo "💼 Creating enhanced wallet management system..."

cat > js/enhanced-wallet.js << 'EOF'
// Enhanced Wallet Integration Manager
class EnhancedWalletManager {
    constructor() {
        this.currentWallet = null;
        this.providers = new Map();
        this.connectionStatus = 'disconnected';
        this.networkConfig = {
            mainnet: { chainId: '0x1', name: 'Ethereum Mainnet' },
            sepolia: { chainId: '0xaa36a7', name: 'Sepolia Testnet' },
            localhost: { chainId: '0x7a69', name: 'Localhost 8545' }
        };

        this.init();
    }

    async init() {
        console.log('🔗 Initializing Enhanced Wallet Manager...');

        // Register available wallet providers
        await this.registerProviders();

        // Check for existing connections
        await this.checkExistingConnections();

        // Set up event listeners
        this.setupEventListeners();

        // Update UI
        this.updateWalletUI();

        console.log('✅ Enhanced Wallet Manager initialized');
    }

    async registerProviders() {
        // MetaMask
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            this.providers.set('metamask', {
                name: 'MetaMask',
                provider: window.ethereum,
                icon: '🦊',
                mobile: window.ethereum.isMobile || false,
                desktop: !window.ethereum.isMobile
            });
        }

        // Coinbase Wallet
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
            this.providers.set('coinbase', {
                name: 'Coinbase Wallet',
                provider: window.ethereum,
                icon: '🟦',
                mobile: true,
                desktop: true
            });
        }

        // WalletConnect (would need WalletConnect library in real implementation)
        if (typeof window.WalletConnect !== 'undefined') {
            this.providers.set('walletconnect', {
                name: 'WalletConnect',
                provider: window.WalletConnect,
                icon: '🔗',
                mobile: true,
                desktop: true
            });
        }

        // Generic Web3 Provider
        if (typeof window.ethereum !== 'undefined' && !this.providers.has('metamask') && !this.providers.has('coinbase')) {
            this.providers.set('generic', {
                name: 'Web3 Wallet',
                provider: window.ethereum,
                icon: '💼',
                mobile: true,
                desktop: true
            });
        }

        console.log(`📱 Registered ${this.providers.size} wallet providers:`, Array.from(this.providers.keys()));
    }

    async checkExistingConnections() {
        const savedWallet = localStorage.getItem('connectedWallet');
        const autoConnect = localStorage.getItem('autoConnectWallet') === 'true';

        if (savedWallet && autoConnect && this.providers.has(savedWallet)) {
            try {
                await this.connectWallet(savedWallet, false);
            } catch (error) {
                console.log('Failed to auto-reconnect wallet:', error.message);
                this.clearWalletConnection();
            }
        }
    }

    async connectWallet(walletType = null, showSelector = true) {
        try {
            // Show wallet selector if no specific wallet requested
            if (!walletType && showSelector && this.providers.size > 1) {
                walletType = await this.showWalletSelector();
            } else if (!walletType) {
                walletType = Array.from(this.providers.keys())[0];
            }

            if (!walletType || !this.providers.has(walletType)) {
                throw new Error('Wallet not available');
            }

            const walletInfo = this.providers.get(walletType);
            console.log(`🔗 Connecting to ${walletInfo.name}...`);

            // Request account access
            const accounts = await walletInfo.provider.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            // Get network info
            const chainId = await walletInfo.provider.request({
                method: 'eth_chainId'
            });

            // Set current wallet
            this.currentWallet = {
                type: walletType,
                address: accounts[0],
                chainId: chainId,
                provider: walletInfo.provider,
                info: walletInfo
            };

            this.connectionStatus = 'connected';

            // Save connection for auto-reconnect
            localStorage.setItem('connectedWallet', walletType);
            localStorage.setItem('autoConnectWallet', 'true');

            // Update UI
            this.updateWalletUI();

            // Trigger connection event
            this.dispatchWalletEvent('walletConnected', {
                wallet: this.currentWallet,
                address: accounts[0],
                chainId: chainId
            });

            console.log(`✅ Connected to ${walletInfo.name}: ${accounts[0]}`);
            this.showToast(`Connected to ${walletInfo.name}`, 'success');

            return this.currentWallet;

        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.connectionStatus = 'failed';
            this.showToast(`Failed to connect wallet: ${error.message}`, 'error');
            throw error;
        }
    }

    async disconnectWallet() {
        if (this.currentWallet) {
            console.log(`🔌 Disconnecting from ${this.currentWallet.info.name}...`);

            this.currentWallet = null;
            this.connectionStatus = 'disconnected';

            // Clear saved connection
            localStorage.removeItem('connectedWallet');
            localStorage.removeItem('autoConnectWallet');

            // Update UI
            this.updateWalletUI();

            // Trigger disconnection event
            this.dispatchWalletEvent('walletDisconnected', {});

            this.showToast('Wallet disconnected', 'info');
        }
    }

    async switchNetwork(networkName) {
        if (!this.currentWallet) {
            throw new Error('No wallet connected');
        }

        const network = this.networkConfig[networkName];
        if (!network) {
            throw new Error('Network not supported');
        }

        try {
            console.log(`🔄 Switching to ${network.name}...`);

            await this.currentWallet.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.chainId }]
            });

            this.currentWallet.chainId = network.chainId;
            this.updateWalletUI();

            this.dispatchWalletEvent('networkChanged', {
                chainId: network.chainId,
                networkName: network.name
            });

            console.log(`✅ Switched to ${network.name}`);
            this.showToast(`Switched to ${network.name}`, 'success');

        } catch (error) {
            console.error('Network switch failed:', error);
            this.showToast(`Failed to switch network: ${error.message}`, 'error');
            throw error;
        }
    }

    async addNetwork(networkConfig) {
        if (!this.currentWallet) {
            throw new Error('No wallet connected');
        }

        try {
            await this.currentWallet.provider.request({
                method: 'wallet_addEthereumChain',
                params: [networkConfig]
            });

            console.log(`✅ Added network: ${networkConfig.chainName}`);
            this.showToast(`Added ${networkConfig.chainName} network`, 'success');

        } catch (error) {
            console.error('Add network failed:', error);
            this.showToast(`Failed to add network: ${error.message}`, 'error');
            throw error;
        }
    }

    async getBalance() {
        if (!this.currentWallet) {
            return '0';
        }

        try {
            const balance = await this.currentWallet.provider.request({
                method: 'eth_getBalance',
                params: [this.currentWallet.address, 'latest']
            });

            // Convert from Wei to ETH
            return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }

    async showWalletSelector() {
        return new Promise((resolve) => {
            // Create wallet selector modal
            const modal = document.createElement('div');
            modal.className = 'wallet-selector-modal';
            modal.innerHTML = `
                <div class="wallet-selector-overlay"></div>
                <div class="wallet-selector-content">
                    <h3>🔗 Connect Wallet</h3>
                    <p>Choose your preferred wallet to connect:</p>
                    <div class="wallet-options">
                        ${Array.from(this.providers.entries()).map(([key, wallet]) => `
                            <button class="wallet-option" data-wallet="${key}">
                                <span class="wallet-icon">${wallet.icon}</span>
                                <span class="wallet-name">${wallet.name}</span>
                                ${wallet.mobile && /Mobi|Android/i.test(navigator.userAgent) ?
                                    '<span class="wallet-badge">📱</span>' : ''}
                            </button>
                        `).join('')}
                    </div>
                    <button class="wallet-cancel">Cancel</button>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle wallet selection
            modal.addEventListener('click', (e) => {
                if (e.target.closest('.wallet-option')) {
                    const walletType = e.target.closest('.wallet-option').dataset.wallet;
                    document.body.removeChild(modal);
                    resolve(walletType);
                } else if (e.target.closest('.wallet-cancel') || e.target.classList.contains('wallet-selector-overlay')) {
                    document.body.removeChild(modal);
                    resolve(null);
                }
            });
        });
    }

    setupEventListeners() {
        // Listen for account changes
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else if (this.currentWallet && accounts[0] !== this.currentWallet.address) {
                    this.currentWallet.address = accounts[0];
                    this.updateWalletUI();
                    this.dispatchWalletEvent('accountChanged', { address: accounts[0] });
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', (chainId) => {
                if (this.currentWallet) {
                    this.currentWallet.chainId = chainId;
                    this.updateWalletUI();
                    this.dispatchWalletEvent('networkChanged', { chainId });
                }
            });

            // Listen for disconnection
            window.ethereum.on('disconnect', () => {
                this.disconnectWallet();
            });
        }
    }

    updateWalletUI() {
        // Update wallet address display
        const addressElements = document.querySelectorAll('#walletAddress, .wallet-address');
        addressElements.forEach(el => {
            if (this.currentWallet) {
                el.textContent = this.formatAddress(this.currentWallet.address);
                el.style.display = 'block';
            } else {
                el.textContent = '';
                el.style.display = 'none';
            }
        });

        // Update wallet balance
        this.updateBalance();

        // Update connect button
        const connectButtons = document.querySelectorAll('#connectButton, .connect-wallet-btn');
        connectButtons.forEach(btn => {
            if (this.currentWallet) {
                btn.textContent = `${this.currentWallet.info.icon} Connected`;
                btn.classList.add('connected');
            } else {
                btn.textContent = '🔗 Connect Wallet';
                btn.classList.remove('connected');
            }
        });

        // Update network indicator
        const networkElements = document.querySelectorAll('.network-indicator');
        networkElements.forEach(el => {
            if (this.currentWallet) {
                const networkName = this.getNetworkName(this.currentWallet.chainId);
                el.textContent = networkName;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }

    async updateBalance() {
        const balanceElements = document.querySelectorAll('#walletBalance, .wallet-balance');

        if (this.currentWallet) {
            try {
                const balance = await this.getBalance();
                balanceElements.forEach(el => {
                    el.textContent = `${balance} ETH`;
                    el.style.display = 'block';
                });
            } catch (error) {
                balanceElements.forEach(el => {
                    el.textContent = 'Balance unavailable';
                });
            }
        } else {
            balanceElements.forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Mainnet',
            '0xaa36a7': 'Sepolia',
            '0x7a69': 'Localhost'
        };
        return networks[chainId] || 'Unknown Network';
    }

    dispatchWalletEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public API methods
    isConnected() {
        return this.connectionStatus === 'connected' && this.currentWallet !== null;
    }

    getWallet() {
        return this.currentWallet;
    }

    getProvider() {
        return this.currentWallet?.provider || null;
    }

    getAddress() {
        return this.currentWallet?.address || null;
    }

    getChainId() {
        return this.currentWallet?.chainId || null;
    }
}

// Global wallet manager instance
window.walletManager = new EnhancedWalletManager();

// Enhanced wallet connection function for backward compatibility
window.connectWallet = async function() {
    try {
        await window.walletManager.connectWallet();
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    }
};

// Network switching functions
window.switchToMainnet = () => window.walletManager.switchNetwork('mainnet');
window.switchToSepolia = () => window.walletManager.switchNetwork('sepolia');
window.switchToLocalhost = () => window.walletManager.switchNetwork('localhost');

console.log('✅ Enhanced Wallet Manager loaded');
EOF

echo "✅ Enhanced wallet manager created"

# Create wallet selector CSS
echo "🎨 Creating wallet selector styles..."

cat > css/wallet-selector.css << 'EOF'
/* Wallet Selector Modal Styles */
.wallet-selector-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wallet-selector-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

.wallet-selector-content {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

.wallet-selector-content h3 {
    margin: 0 0 15px 0;
    text-align: center;
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 600;
}

.wallet-selector-content p {
    margin: 0 0 25px 0;
    text-align: center;
    color: #666;
    font-size: 16px;
}

.wallet-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.wallet-option {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 16px 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
    position: relative;
}

.wallet-option:hover {
    border-color: #0066cc;
    background: #f8fbff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
}

.wallet-option:active {
    transform: translateY(0);
}

.wallet-icon {
    font-size: 24px;
    width: 32px;
    text-align: center;
}

.wallet-name {
    flex: 1;
}

.wallet-badge {
    font-size: 14px;
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
}

.wallet-cancel {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    background: white;
    color: #666;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.wallet-cancel:hover {
    border-color: #999;
    color: #333;
}

/* Enhanced wallet connection status */
.wallet-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
}

.wallet-status.connected {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.wallet-status.connecting {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.wallet-status.disconnected {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.network-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.network-indicator.mainnet {
    background: #e8f5e8;
    color: #2e7d32;
}

.network-indicator.testnet {
    background: #fff3e0;
    color: #f57c00;
}

.network-indicator.localhost {
    background: #f3e5f5;
    color: #7b1fa2;
}

/* Connect button enhancements */
.connect-wallet-btn {
    position: relative;
    overflow: hidden;
}

.connect-wallet-btn.connected {
    background: linear-gradient(135deg, #4caf50, #66bb6a);
    border-color: #4caf50;
}

.connect-wallet-btn.connected:hover {
    background: linear-gradient(135deg, #45a049, #5cb85c);
}

.connect-wallet-btn.connecting {
    background: linear-gradient(135deg, #ff9800, #ffb74d);
    border-color: #ff9800;
}

.connect-wallet-btn.connecting::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 1.5s infinite;
}

/* Animations */
@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .wallet-selector-content {
        margin: 20px;
        padding: 25px 20px;
    }

    .wallet-option {
        padding: 14px 16px;
    }

    .wallet-icon {
        font-size: 20px;
        width: 28px;
    }
}

/* Accessibility */
.wallet-option:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
}

.wallet-cancel:focus {
    outline: 2px solid #666;
    outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .wallet-selector-content {
        background: #2d2d2d;
        color: white;
    }

    .wallet-selector-content h3 {
        color: white;
    }

    .wallet-option {
        background: #3d3d3d;
        border-color: #555;
        color: white;
    }

    .wallet-option:hover {
        background: #4d4d4d;
        border-color: #0088ff;
    }

    .wallet-cancel {
        background: #3d3d3d;
        border-color: #555;
        color: #ccc;
    }
}
EOF

echo "✅ Wallet selector styles created"

# Create wallet connection persistence
echo "💾 Creating wallet connection persistence..."

cat > js/wallet-persistence.js << 'EOF'
// Wallet Connection Persistence Manager
class WalletPersistence {
    constructor() {
        this.storageKey = 'walletConnection';
        this.settingsKey = 'walletSettings';
        this.connectionTimeout = 30000; // 30 seconds
    }

    // Save wallet connection state
    saveConnection(walletData) {
        try {
            const connectionData = {
                walletType: walletData.type,
                address: walletData.address,
                chainId: walletData.chainId,
                timestamp: Date.now(),
                autoConnect: true
            };

            localStorage.setItem(this.storageKey, JSON.stringify(connectionData));
            console.log('💾 Wallet connection saved');
        } catch (error) {
            console.error('Failed to save wallet connection:', error);
        }
    }

    // Load saved wallet connection
    loadConnection() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;

            const connectionData = JSON.parse(saved);

            // Check if connection is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - connectionData.timestamp > maxAge) {
                this.clearConnection();
                return null;
            }

            return connectionData;
        } catch (error) {
            console.error('Failed to load wallet connection:', error);
            return null;
        }
    }

    // Clear saved connection
    clearConnection() {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ Wallet connection cleared');
    }

    // Save wallet settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save wallet settings:', error);
        }
    }

    // Load wallet settings
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load wallet settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            autoConnect: true,
            showBalance: true,
            preferredNetwork: 'sepolia',
            notifications: true
        };
    }

    // Check if should auto-connect
    shouldAutoConnect() {
        const connection = this.loadConnection();
        const settings = this.loadSettings();

        return connection &&
               connection.autoConnect &&
               settings.autoConnect &&
               this.isConnectionRecent(connection);
    }

    isConnectionRecent(connection) {
        const recentThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
        return Date.now() - connection.timestamp < recentThreshold;
    }

    // Cross-tab synchronization
    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                if (e.newValue === null) {
                    // Connection was cleared in another tab
                    window.dispatchEvent(new CustomEvent('walletDisconnectedExternal'));
                } else {
                    // Connection was updated in another tab
                    const connectionData = JSON.parse(e.newValue);
                    window.dispatchEvent(new CustomEvent('walletConnectedExternal', {
                        detail: connectionData
                    }));
                }
            }
        });
    }
}

// Initialize persistence manager
window.walletPersistence = new WalletPersistence();
window.walletPersistence.setupCrossTabSync();

console.log('💾 Wallet persistence manager loaded');
EOF

echo "✅ Wallet persistence manager created"

# Create transaction status tracker
echo "📊 Creating transaction status tracker..."

cat > js/transaction-tracker.js << 'EOF'
// Transaction Status Tracker
class TransactionTracker {
    constructor() {
        this.transactions = new Map();
        this.listeners = new Set();
        this.pollInterval = 2000; // 2 seconds
        this.maxRetries = 30; // 1 minute max polling
    }

    // Add a transaction to track
    addTransaction(txHash, type = 'unknown', metadata = {}) {
        const transaction = {
            hash: txHash,
            type: type,
            status: 'pending',
            timestamp: Date.now(),
            retries: 0,
            metadata: metadata,
            events: []
        };

        this.transactions.set(txHash, transaction);
        this.startTracking(txHash);
        this.notifyListeners('added', transaction);

        console.log(`📊 Tracking transaction: ${txHash}`);
        return transaction;
    }

    // Start tracking a specific transaction
    async startTracking(txHash) {
        const transaction = this.transactions.get(txHash);
        if (!transaction) return;

        const pollTransaction = async () => {
            try {
                if (!window.walletManager?.isConnected()) {
                    this.updateTransaction(txHash, 'failed', 'Wallet disconnected');
                    return;
                }

                const provider = window.walletManager.getProvider();
                const receipt = await provider.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                });

                if (receipt) {
                    // Transaction mined
                    const status = receipt.status === '0x1' ? 'confirmed' : 'failed';
                    const gasUsed = parseInt(receipt.gasUsed, 16);

                    this.updateTransaction(txHash, status, null, {
                        blockNumber: parseInt(receipt.blockNumber, 16),
                        gasUsed: gasUsed,
                        effectiveGasPrice: receipt.effectiveGasPrice ?
                            parseInt(receipt.effectiveGasPrice, 16) : null
                    });

                    console.log(`✅ Transaction ${status}: ${txHash}`);
                } else {
                    // Still pending, continue polling
                    transaction.retries++;

                    if (transaction.retries >= this.maxRetries) {
                        this.updateTransaction(txHash, 'timeout', 'Transaction timeout');
                    } else {
                        setTimeout(pollTransaction, this.pollInterval);
                    }
                }
            } catch (error) {
                console.error('Error polling transaction:', error);
                transaction.retries++;

                if (transaction.retries >= this.maxRetries) {
                    this.updateTransaction(txHash, 'failed', error.message);
                } else {
                    setTimeout(pollTransaction, this.pollInterval * 2); // Backoff
                }
            }
        };

        // Start polling
        setTimeout(pollTransaction, 1000); // Wait 1s before first poll
    }

    // Update transaction status
    updateTransaction(txHash, status, error = null, additionalData = {}) {
        const transaction = this.transactions.get(txHash);
        if (!transaction) return;

        transaction.status = status;
        transaction.error = error;
        transaction.updatedAt = Date.now();

        // Merge additional data
        Object.assign(transaction, additionalData);

        // Add event
        transaction.events.push({
            status: status,
            timestamp: Date.now(),
            error: error
        });

        this.notifyListeners('updated', transaction);

        // Show notification
        this.showTransactionNotification(transaction);

        // Clean up completed transactions after 5 minutes
        if (['confirmed', 'failed', 'timeout'].includes(status)) {
            setTimeout(() => {
                this.removeTransaction(txHash);
            }, 5 * 60 * 1000);
        }
    }

    // Remove transaction from tracking
    removeTransaction(txHash) {
        const transaction = this.transactions.get(txHash);
        if (transaction) {
            this.transactions.delete(txHash);
            this.notifyListeners('removed', transaction);
            console.log(`🗑️ Stopped tracking transaction: ${txHash}`);
        }
    }

    // Get transaction status
    getTransaction(txHash) {
        return this.transactions.get(txHash);
    }

    // Get all transactions
    getAllTransactions() {
        return Array.from(this.transactions.values());
    }

    // Get transactions by status
    getTransactionsByStatus(status) {
        return this.getAllTransactions().filter(tx => tx.status === status);
    }

    // Add status listener
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove status listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners
    notifyListeners(event, transaction) {
        this.listeners.forEach(callback => {
            try {
                callback(event, transaction);
            } catch (error) {
                console.error('Error in transaction listener:', error);
            }
        });
    }

    // Show transaction notification
    showTransactionNotification(transaction) {
        const messages = {
            pending: `Transaction submitted: ${this.formatTxType(transaction.type)}`,
            confirmed: `✅ Transaction confirmed: ${this.formatTxType(transaction.type)}`,
            failed: `❌ Transaction failed: ${this.formatTxType(transaction.type)}`,
            timeout: `⏰ Transaction timeout: ${this.formatTxType(transaction.type)}`
        };

        const message = messages[transaction.status] || `Transaction ${transaction.status}`;
        const type = transaction.status === 'confirmed' ? 'success' :
                    transaction.status === 'pending' ? 'info' : 'error';

        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('transactionStatusChanged', {
            detail: transaction
        }));
    }

    formatTxType(type) {
        const typeMap = {
            'donation': 'Donation',
            'governance': 'Governance Vote',
            'approval': 'Token Approval',
            'transfer': 'Token Transfer',
            'unknown': 'Transaction'
        };
        return typeMap[type] || type;
    }

    // Estimate gas for transaction
    async estimateGas(transactionParams) {
        try {
            if (!window.walletManager?.isConnected()) {
                throw new Error('Wallet not connected');
            }

            const provider = window.walletManager.getProvider();
            const gasEstimate = await provider.request({
                method: 'eth_estimateGas',
                params: [transactionParams]
            });

            return parseInt(gasEstimate, 16);
        } catch (error) {
            console.error('Gas estimation failed:', error);
            throw error;
        }
    }

    // Get current gas price
    async getGasPrice() {
        try {
            if (!window.walletManager?.isConnected()) {
                throw new Error('Wallet not connected');
            }

            const provider = window.walletManager.getProvider();
            const gasPrice = await provider.request({
                method: 'eth_gasPrice',
                params: []
            });

            return parseInt(gasPrice, 16);
        } catch (error) {
            console.error('Failed to get gas price:', error);
            throw error;
        }
    }

    // Calculate transaction cost
    async calculateTransactionCost(transactionParams) {
        try {
            const [gasEstimate, gasPrice] = await Promise.all([
                this.estimateGas(transactionParams),
                this.getGasPrice()
            ]);

            const totalCost = gasEstimate * gasPrice;
            const costInEth = totalCost / Math.pow(10, 18);

            return {
                gasEstimate,
                gasPrice,
                totalCost,
                costInEth: costInEth.toFixed(6)
            };
        } catch (error) {
            console.error('Failed to calculate transaction cost:', error);
            throw error;
        }
    }
}

// Initialize transaction tracker
window.transactionTracker = new TransactionTracker();

console.log('📊 Transaction tracker loaded');
EOF

echo "✅ Transaction tracker created"

echo ""
echo "🔗 Enhanced Wallet Integration Setup Complete!"
echo "=============================================="
echo ""
echo "📋 Features Implemented:"
echo "  ✅ Multi-wallet support (MetaMask, Coinbase, WalletConnect)"
echo "  ✅ Network switching (Mainnet, Sepolia, Localhost)"
echo "  ✅ Connection persistence across page reloads"
echo "  ✅ Transaction status tracking with notifications"
echo "  ✅ Cross-tab synchronization"
echo "  ✅ Mobile wallet optimizations"
echo "  ✅ Gas estimation and cost calculation"
echo ""
echo "🧰 Available Components:"
echo "  1. js/enhanced-wallet.js - Core wallet management"
echo "  2. css/wallet-selector.css - Wallet selector UI"
echo "  3. js/wallet-persistence.js - Connection persistence"
echo "  4. js/transaction-tracker.js - Transaction monitoring"
echo ""
echo "🔧 Next Steps:"
echo "  1. Include wallet files in HTML pages"
echo "  2. Test wallet connection flows"
echo "  3. Test network switching"
echo "  4. Test transaction tracking"
echo "  5. Verify mobile wallet compatibility"
