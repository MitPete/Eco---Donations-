/**
 * Auto-Donation Module
 * Handles automatic micro-donations functionality
 */

class AutoDonationManager {
    constructor() {
        this.contract = null;
        this.userSettings = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized && this.contract) return;

        try {
            // Enhanced wallet component initialization with flexible detection
            const maxAttempts = 10;
            let attempts = 0;

            while (attempts < maxAttempts) {
                // Check for multiple ways the wallet might be available
                const hasEthereum = !!window.ethereum;
                const hasProvider = !!(window.provider || window.browserProvider);
                const hasSigner = !!(window.signer);
                const hasUserAddress = !!(window.userAddress);

                if (hasEthereum && hasProvider && hasSigner && hasUserAddress) {
                    console.log('Wallet components ready');
                    break;
                }

                if (attempts === maxAttempts - 1) {
                    console.log('Components status:', {
                        ethereum: hasEthereum,
                        provider: hasProvider,
                        signer: hasSigner,
                        userAddress: hasUserAddress,
                        windowProvider: !!window.provider,
                        windowBrowserProvider: !!window.browserProvider
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
                console.log('Waiting for wallet components... Attempt', attempts);
            }

            // Use the available provider/signer
            const provider = window.provider || window.browserProvider;
            const signer = window.signer;
            const userAddress = window.userAddress;

            if (!window.ethereum || !provider || !signer || !userAddress) {
                throw new Error('Wallet components not fully initialized');
            }            // Load contract address
            const response = await fetch('/src/contracts.json');
            if (!response.ok) {
                throw new Error('Failed to load contracts.json: ' + response.status);
            }
            const contracts = await response.json();
            if (!contracts.autoDonationService) {
                throw new Error('autoDonationService address missing in contracts.json');
            }

            // Load ABI
            const abiResponse = await fetch('/src/AutoDonationService.json');
            if (!abiResponse.ok) {
                throw new Error('Failed to load AutoDonationService.json: ' + abiResponse.status);
            }
            const abiData = await abiResponse.json();
            let abi;
            if (Array.isArray(abiData)) {
                abi = abiData;
            } else if (abiData.abi) {
                abi = abiData.abi;
            } else {
                throw new Error('Invalid ABI format in AutoDonationService.json');
            }
            if (!abi || !Array.isArray(abi) || abi.length === 0) {
                throw new Error('ABI is missing or empty');
            }

            // Initialize contract with the detected signer
            this.contract = new ethers.Contract(
                contracts.autoDonationService,
                abi,
                signer
            );
            if (!this.contract) {
                throw new Error('Failed to create contract instance');
            }

            this.isInitialized = true;
            console.log('AutoDonation service initialized with contract address:', contracts.autoDonationService);

            // Load user settings
            await this.loadUserSettings();

        } catch (error) {
            console.error('Failed to initialize auto-donation service:', error);
            if (typeof showNotification === 'function') {
                showNotification('Auto-donation init failed: ' + error.message, 'error');
            }
            this.isInitialized = false;
            this.contract = null;
            throw error;
        }
    }

    async loadUserSettings() {
        if (!this.contract || !window.userAddress) return null;

        try {
            const settings = await this.contract.getUserSettings(window.userAddress);
            this.userSettings = {
                isActive: settings.isActive,
                fixedAmount: ethers.utils.formatEther(settings.donationAmount),
                percentage: settings.donationPercentage.toNumber() / 100, // Contract stores as basis points
                monthlyLimit: ethers.utils.formatEther(settings.monthlyLimit),
                preferredCause: settings.preferredFoundation,
                monthlyDonated: ethers.utils.formatEther(settings.currentMonthSpent),
                lastResetMonth: settings.lastResetMonth.toNumber()
            };

            return this.userSettings;
        } catch (error) {
            console.error('Failed to load user settings:', error);
            return null;
        }
    }

    async subscribe(settings) {
        if (!this.contract) {
            try {
                await this.initialize();
            } catch (initErr) {
                throw new Error('Auto-donation service not initialized: ' + initErr.message);
            }
            if (!this.contract) {
                throw new Error('Auto-donation service not initialized (after forced init)');
            }
        }

        try {
            const tx = await this.contract.subscribe(
                ethers.utils.parseEther(settings.fixedAmount.toString()),
                Math.floor(settings.percentage * 100), // Convert to basis points
                ethers.utils.parseEther(settings.monthlyLimit.toString()),
                settings.preferredCause
            );

            await tx.wait();
            await this.loadUserSettings();

            return tx;
        } catch (error) {
            console.error('Failed to subscribe to auto-donation:', error);
            throw error;
        }
    }

    async updateSettings(settings) {
        if (!this.contract) {
            try {
                await this.initialize();
            } catch (initErr) {
                throw new Error('Auto-donation service not initialized: ' + initErr.message);
            }
            if (!this.contract) {
                throw new Error('Auto-donation service not initialized (after forced init)');
            }
        }

        try {
            const tx = await this.contract.updateSettings(
                ethers.utils.parseEther(settings.fixedAmount.toString()),
                Math.floor(settings.percentage * 100), // Convert to basis points
                ethers.utils.parseEther(settings.monthlyLimit.toString()),
                settings.preferredCause
            );

            await tx.wait();
            await this.loadUserSettings();

            return tx;
        } catch (error) {
            console.error('Failed to update auto-donation settings:', error);
            throw error;
        }
    }

    async unsubscribe() {
        if (!this.contract) {
            throw new Error('Auto-donation service not initialized');
        }

        try {
            const tx = await this.contract.unsubscribe();
            await tx.wait();
            await this.loadUserSettings();

            return tx;
        } catch (error) {
            console.error('Failed to unsubscribe from auto-donation:', error);
            throw error;
        }
    }

    async triggerAutoDonation(transactionValue = 0) {
        if (!this.contract || !this.userSettings || !this.userSettings.isActive) {
            return null;
        }

        try {
            // Calculate the donation amount
            let donationAmount;
            if (this.userSettings.percentage > 0) {
                donationAmount = (parseFloat(transactionValue) * this.userSettings.percentage / 100).toFixed(6);
            } else {
                donationAmount = this.userSettings.fixedAmount;
            }

            const tx = await this.contract.triggerAutoDonation(
                ethers.utils.parseEther(transactionValue.toString()),
                { value: ethers.utils.parseEther(donationAmount.toString()) }
            );

            await tx.wait();
            await this.loadUserSettings(); // Refresh settings after donation

            return tx;
        } catch (error) {
            console.error('Failed to trigger auto-donation:', error);
            throw error;
        }
    }

    async getStats() {
        if (!this.contract || !window.userAddress) return null;

        try {
            const stats = await this.contract.getUserStats(window.userAddress);
            return {
                totalDonated: ethers.utils.formatEther(stats.totalDonated),
                donationCount: stats.donationCount.toNumber(),
                monthlyDonated: ethers.utils.formatEther(stats.monthlyDonated),
                lastDonation: stats.lastDonation.toNumber()
            };
        } catch (error) {
            console.error('Failed to get auto-donation stats:', error);
            return null;
        }
    }

    formatSettings() {
        if (!this.userSettings) return null;

        return {
            ...this.userSettings,
            fixedAmountETH: parseFloat(this.userSettings.fixedAmount).toFixed(6),
            monthlyLimitETH: parseFloat(this.userSettings.monthlyLimit).toFixed(6),
            monthlyDonatedETH: parseFloat(this.userSettings.monthlyDonated).toFixed(6),
            remainingMonthly: (parseFloat(this.userSettings.monthlyLimit) - parseFloat(this.userSettings.monthlyDonated)).toFixed(6)
        };
    }
}

// Global instance
window.autoDonationManager = new AutoDonationManager();

// Auto-initialize when wallet is connected
document.addEventListener('walletConnected', async () => {
    try {
        await window.autoDonationManager.initialize();
    } catch (error) {
        console.error('Failed to initialize auto-donation on wallet connect:', error);
    }
});
