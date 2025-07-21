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
        if (this.isInitialized) return;

        try {
            if (!window.ethereum || !window.provider || !window.signer) {
                throw new Error('Wallet not connected');
            }

            // Load contract address
            const response = await fetch('/src/contracts.json');
            const contracts = await response.json();

            // Load ABI
            const abiResponse = await fetch('/src/AutoDonationService.json');
            const abi = await abiResponse.json();

            // Initialize contract
            this.contract = new ethers.Contract(
                contracts.autoDonationService,
                abi,
                window.signer
            );

            this.isInitialized = true;
            console.log('AutoDonation service initialized');

            // Load user settings
            await this.loadUserSettings();

        } catch (error) {
            console.error('Failed to initialize auto-donation service:', error);
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
            throw new Error('Auto-donation service not initialized');
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
            throw new Error('Auto-donation service not initialized');
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
