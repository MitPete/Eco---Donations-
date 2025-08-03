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
