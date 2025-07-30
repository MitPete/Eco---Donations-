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
