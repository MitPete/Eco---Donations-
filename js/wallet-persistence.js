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
