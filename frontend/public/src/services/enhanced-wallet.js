// Enhanced Wallet Integration Manager - DISABLED FOR DEBUGGING
class EnhancedWalletManager {
    constructor() {
        // Constructor disabled to prevent auto-initialization
        console.log('ℹ️ Enhanced Wallet Manager constructor disabled for debugging');
        return;

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
        // DISABLED FOR DEBUGGING - preventing auto-initialization errors
        console.log('ℹ️ Enhanced Wallet Manager initialization disabled for debugging');
        return;

        try {
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
        } catch (error) {
            console.log('⚠️ Enhanced Wallet Manager initialization warning:', error.message);
            // Continue initialization even if some parts fail
            this.updateWalletUI();
        }
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
        // Disable auto-connection for now to avoid startup errors
        console.log('ℹ️ Auto-connection disabled for debugging');

        // Clear any problematic saved connections
        const savedWallet = localStorage.getItem('connectedWallet');
        if (savedWallet) {
            console.log('ℹ️ Clearing saved wallet connection for clean start');
            this.clearWalletConnection();
        }
    }

    async connectWallet(walletType = null, showSelector = true) {
        try {
            // Check if we have any providers at all
            if (this.providers.size === 0) {
                throw new Error('No wallet providers available. Please install a Web3 wallet like MetaMask.');
            }

            // Show wallet selector if no specific wallet requested
            if (!walletType && showSelector && this.providers.size > 1) {
                walletType = await this.showWalletSelector();
            } else if (!walletType) {
                walletType = Array.from(this.providers.keys())[0];
            }

            if (!walletType || !this.providers.has(walletType)) {
                throw new Error('Selected wallet is not available');
            }

            const walletInfo = this.providers.get(walletType);
            console.log(`🔗 Connecting to ${walletInfo.name}...`);

            // Check if provider is accessible
            if (!walletInfo.provider || typeof walletInfo.provider.request !== 'function') {
                throw new Error(`${walletInfo.name} provider is not properly initialized`);
            }

            // Check if MetaMask is actually available (not just the provider)
            if (walletType === 'metamask' && (!window.ethereum || !window.ethereum.isMetaMask)) {
                throw new Error('MetaMask is not installed or not available');
            }

            // Request account access with timeout
            const accounts = await Promise.race([
                walletInfo.provider.request({
                    method: 'eth_requestAccounts'
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout - wallet may not be available')), 5000)
                )
            ]);

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found or access denied');
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

    clearWalletConnection() {
        // Clear any saved wallet connection data
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('autoConnectWallet');

        // Reset wallet state
        this.currentWallet = null;
        this.connectionStatus = 'disconnected';

        // Update UI
        this.updateWalletUI();

        console.log('🧹 Wallet connection data cleared');
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

// Global wallet manager instance - DISABLED for debugging
// window.walletManager = new EnhancedWalletManager();

// Ultra-simple MetaMask connection - standalone function
window.connectWallet = async function() {
    console.log('🔗 Simple wallet connection starting...');

    // Check if MetaMask exists
    if (!window.ethereum) {
        console.log('❌ No ethereum provider found');
        const message = 'MetaMask not found. Please install MetaMask extension.';
        window.showToast ? window.showToast(message, 'error') : alert(message);
        return null;
    }

    console.log('✅ Ethereum provider found');

    try {
        // Just request accounts - nothing else
        console.log('📝 Requesting accounts...');
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        console.log('📋 Got accounts:', accounts);

        if (accounts && accounts.length > 0) {
            const address = accounts[0];
            console.log('✅ Connected to address:', address);

            // Update just the connect button
            const connectBtn = document.querySelector('#connectButton');
            if (connectBtn) {
                connectBtn.textContent = '🦊 Connected';
                connectBtn.style.backgroundColor = '#059669';
                connectBtn.style.color = 'white';
            }

            // Show address if there's a display element
            const addressDisplay = document.querySelector('#walletAddress');
            if (addressDisplay) {
                addressDisplay.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
                addressDisplay.style.display = 'block';
            }

            // Show success toast instead of alert
            const successMessage = `Wallet connected! ${address.slice(0, 8)}...${address.slice(-6)}`;
            if (window.showToast) {
                window.showToast(successMessage, 'success');
            } else {
                console.log('✅', successMessage);
            }

            // Store connection for persistence
            localStorage.setItem('connectedWallet', 'metamask');
            localStorage.setItem('walletAddress', address);

            return address;
        } else {
            console.log('❌ No accounts returned');
            const message = 'No accounts found. Make sure MetaMask is unlocked.';
            window.showToast ? window.showToast(message, 'warning') : alert(message);
            return null;
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);

        let message = 'Failed to connect to MetaMask';
        if (error.code === 4001) {
            message = 'Connection cancelled by user.';
        } else if (error.code === -32002) {
            message = 'MetaMask is busy. Please check MetaMask and try again.';
        } else if (error.message.includes('extension not found')) {
            message = 'MetaMask extension issue. Try refreshing the page.';
        }

        window.showToast ? window.showToast(message, 'error') : alert(message);
        return null;
    }
};

// Network switching functions - DISABLED (wallet manager not available)
// window.switchToMainnet = () => window.walletManager.switchNetwork('mainnet');
// window.switchToSepolia = () => window.walletManager.switchNetwork('sepolia');
// window.switchToLocalhost = () => window.walletManager.switchNetwork('localhost');

// Simple helper functions for donations
window.isWalletConnected = async function() {
    try {
        if (typeof window.ethereum === 'undefined') return false;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts && accounts.length > 0;
    } catch (error) {
        return false;
    }
};

window.getConnectedWallet = async function() {
    try {
        if (typeof window.ethereum === 'undefined') return null;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
        return null;
    }
};

// Check for existing connection on page load
window.checkExistingWalletConnection = async function() {
    try {
        if (typeof window.ethereum === 'undefined') return;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts && accounts.length > 0) {
            const address = accounts[0];
            console.log('✅ Existing wallet connection found:', address);

            // Update UI to show connected state
            const connectBtn = document.querySelector('#connectButton');
            if (connectBtn) {
                connectBtn.textContent = '🦊 Connected';
                connectBtn.style.backgroundColor = '#059669';
                connectBtn.style.color = 'white';
            }

            const addressDisplay = document.querySelector('#walletAddress');
            if (addressDisplay) {
                addressDisplay.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
                addressDisplay.style.display = 'block';
            }

            return address;
        }
    } catch (error) {
        console.log('No existing wallet connection found');
    }
    return null;
};

// Debug function to check MetaMask status
window.checkMetaMaskStatus = function() {
    console.log('🔍 MetaMask Status Check:');
    console.log('- window.ethereum exists:', typeof window.ethereum !== 'undefined');
    console.log('- window.ethereum.isMetaMask:', window.ethereum?.isMetaMask);
    console.log('- MetaMask version:', window.ethereum?.version);
    console.log('- Provider ready:', window.ethereum?._state?.isConnected);
    console.log('- User agent:', navigator.userAgent);

    if (typeof window.ethereum === 'undefined') {
        console.log('❌ MetaMask not detected. Please install MetaMask extension.');
        return false;
    } else if (!window.ethereum.isMetaMask) {
        console.log('⚠️ Ethereum provider found but it\'s not MetaMask.');
        return false;
    } else {
        console.log('✅ MetaMask detected and ready.');
        return true;
    }
};

console.log('✅ Simple wallet functions loaded');

// Check for existing wallet connection when page loads
setTimeout(() => {
    window.checkExistingWalletConnection();
}, 1000);
