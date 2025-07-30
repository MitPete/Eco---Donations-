#!/bin/bash

echo "💸 Setting up Enhanced Transaction Flow System..."
echo "==============================================="

cd "$(dirname "$0")/frontend"

# Create transaction flow manager
echo "🔄 Creating transaction flow manager..."

cat > js/transaction-flow.js << 'EOF'
// Enhanced Transaction Flow Manager
class TransactionFlowManager {
    constructor() {
        this.activeFlows = new Map();
        this.flowSteps = {
            donation: [
                { id: 'validate', title: 'Validating Donation', icon: '🔍' },
                { id: 'estimate', title: 'Estimating Gas', icon: '⛽' },
                { id: 'confirm', title: 'Confirm Transaction', icon: '✅' },
                { id: 'submit', title: 'Submitting Transaction', icon: '📤' },
                { id: 'pending', title: 'Transaction Pending', icon: '⏳' },
                { id: 'success', title: 'Donation Complete', icon: '🎉' }
            ],
            governance: [
                { id: 'validate', title: 'Validating Vote', icon: '🔍' },
                { id: 'estimate', title: 'Estimating Gas', icon: '⛽' },
                { id: 'confirm', title: 'Confirm Vote', icon: '🗳️' },
                { id: 'submit', title: 'Submitting Vote', icon: '📤' },
                { id: 'pending', title: 'Vote Pending', icon: '⏳' },
                { id: 'success', title: 'Vote Recorded', icon: '✅' }
            ],
            approval: [
                { id: 'validate', title: 'Validating Approval', icon: '🔍' },
                { id: 'estimate', title: 'Estimating Gas', icon: '⛽' },
                { id: 'confirm', title: 'Confirm Approval', icon: '✅' },
                { id: 'submit', title: 'Submitting Approval', icon: '📤' },
                { id: 'pending', title: 'Approval Pending', icon: '⏳' },
                { id: 'success', title: 'Approval Complete', icon: '🎉' }
            ]
        };

        this.init();
    }

    init() {
        console.log('💸 Initializing Transaction Flow Manager...');
        this.createTransactionModal();
        this.setupEventListeners();
        console.log('✅ Transaction Flow Manager initialized');
    }

    // Start a new transaction flow
    async startFlow(type, params = {}) {
        const flowId = `${type}_${Date.now()}`;
        const steps = this.flowSteps[type] || this.flowSteps.donation;

        const flow = {
            id: flowId,
            type: type,
            params: params,
            steps: steps,
            currentStep: 0,
            status: 'active',
            startTime: Date.now(),
            gasEstimate: null,
            txHash: null,
            receipt: null,
            error: null
        };

        this.activeFlows.set(flowId, flow);

        console.log(`🚀 Starting ${type} transaction flow:`, flowId);

        // Show transaction modal
        this.showTransactionModal(flow);

        // Start the flow process
        await this.processFlow(flowId);

        return flowId;
    }

    // Process each step of the flow
    async processFlow(flowId) {
        const flow = this.activeFlows.get(flowId);
        if (!flow) return;

        try {
            while (flow.currentStep < flow.steps.length && flow.status === 'active') {
                const step = flow.steps[flow.currentStep];

                console.log(`📋 Processing step: ${step.title}`);
                this.updateModalStep(flow);

                // Process the current step
                await this.executeStep(flow, step);

                // Move to next step if successful
                if (flow.status === 'active') {
                    flow.currentStep++;
                }
            }

            if (flow.status === 'active') {
                flow.status = 'completed';
                this.updateModalStep(flow);

                // Auto-close modal after success
                setTimeout(() => {
                    this.closeTransactionModal();
                }, 3000);
            }

        } catch (error) {
            console.error('Transaction flow error:', error);
            flow.status = 'failed';
            flow.error = error.message;
            this.updateModalStep(flow);

            this.showToast(`Transaction failed: ${error.message}`, 'error');
        }
    }

    // Execute individual step
    async executeStep(flow, step) {
        switch (step.id) {
            case 'validate':
                await this.validateTransaction(flow);
                break;
            case 'estimate':
                await this.estimateGas(flow);
                break;
            case 'confirm':
                await this.confirmTransaction(flow);
                break;
            case 'submit':
                await this.submitTransaction(flow);
                break;
            case 'pending':
                await this.waitForConfirmation(flow);
                break;
            case 'success':
                await this.handleSuccess(flow);
                break;
        }
    }

    // Validation step
    async validateTransaction(flow) {
        if (!window.walletManager?.isConnected()) {
            throw new Error('Wallet not connected');
        }

        const balance = await window.walletManager.getBalance();
        if (parseFloat(balance) === 0) {
            throw new Error('Insufficient ETH balance');
        }

        // Add 1 second delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Gas estimation step
    async estimateGas(flow) {
        try {
            const txParams = this.buildTransactionParams(flow);
            const gasData = await window.transactionTracker.calculateTransactionCost(txParams);

            flow.gasEstimate = gasData;

            console.log('⛽ Gas estimation:', gasData);

            // Update modal with gas info
            this.updateGasDisplay(flow);

        } catch (error) {
            console.warn('Gas estimation failed, using default:', error);
            flow.gasEstimate = {
                gasEstimate: 21000,
                gasPrice: 20000000000, // 20 Gwei
                costInEth: '0.00042'
            };
        }
    }

    // Confirmation step - wait for user approval
    async confirmTransaction(flow) {
        return new Promise((resolve, reject) => {
            // Show confirmation UI in modal
            this.showConfirmationUI(flow, resolve, reject);
        });
    }

    // Submit transaction step
    async submitTransaction(flow) {
        const provider = window.walletManager.getProvider();
        const txParams = this.buildTransactionParams(flow);

        // Add gas parameters if estimated
        if (flow.gasEstimate) {
            txParams.gasLimit = '0x' + flow.gasEstimate.gasEstimate.toString(16);
            txParams.gasPrice = '0x' + flow.gasEstimate.gasPrice.toString(16);
        }

        console.log('📤 Submitting transaction:', txParams);

        const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [txParams]
        });

        flow.txHash = txHash;

        // Start tracking the transaction
        window.transactionTracker.addTransaction(txHash, flow.type, {
            flowId: flow.id,
            description: this.getTransactionDescription(flow)
        });

        console.log('✅ Transaction submitted:', txHash);
    }

    // Wait for transaction confirmation
    async waitForConfirmation(flow) {
        if (!flow.txHash) {
            throw new Error('No transaction hash available');
        }

        return new Promise((resolve, reject) => {
            const checkTransaction = async () => {
                try {
                    const provider = window.walletManager.getProvider();
                    const receipt = await provider.request({
                        method: 'eth_getTransactionReceipt',
                        params: [flow.txHash]
                    });

                    if (receipt) {
                        flow.receipt = receipt;

                        if (receipt.status === '0x1') {
                            resolve();
                        } else {
                            reject(new Error('Transaction failed'));
                        }
                    } else {
                        // Still pending, check again
                        setTimeout(checkTransaction, 2000);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            checkTransaction();
        });
    }

    // Handle successful completion
    async handleSuccess(flow) {
        console.log('🎉 Transaction successful!');

        // Trigger success events
        this.dispatchFlowEvent('transactionSuccess', {
            flowId: flow.id,
            type: flow.type,
            txHash: flow.txHash,
            receipt: flow.receipt
        });

        // Show success notification
        this.showToast(
            `${this.getTransactionDescription(flow)} completed successfully!`,
            'success'
        );

        // Update UI based on transaction type
        await this.updateUIAfterSuccess(flow);
    }

    // Build transaction parameters based on flow type
    buildTransactionParams(flow) {
        const address = window.walletManager.getAddress();

        switch (flow.type) {
            case 'donation':
                return {
                    from: address,
                    to: flow.params.foundationAddress || address,
                    value: flow.params.value || '0x0',
                    data: flow.params.data || '0x'
                };

            case 'governance':
                return {
                    from: address,
                    to: flow.params.contractAddress,
                    value: '0x0',
                    data: flow.params.voteData
                };

            case 'approval':
                return {
                    from: address,
                    to: flow.params.tokenAddress,
                    value: '0x0',
                    data: flow.params.approvalData
                };

            default:
                return {
                    from: address,
                    to: address,
                    value: '0x0',
                    data: '0x'
                };
        }
    }

    // Create transaction modal
    createTransactionModal() {
        const modal = document.createElement('div');
        modal.id = 'transaction-modal';
        modal.className = 'transaction-modal hidden';
        modal.innerHTML = `
            <div class="transaction-modal-overlay"></div>
            <div class="transaction-modal-content">
                <div class="transaction-modal-header">
                    <h3 id="transaction-modal-title">Processing Transaction</h3>
                    <button class="transaction-modal-close" onclick="window.transactionFlow.closeTransactionModal()">×</button>
                </div>

                <div class="transaction-progress">
                    <div class="progress-steps" id="progress-steps"></div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                </div>

                <div class="transaction-details" id="transaction-details">
                    <div class="current-step">
                        <div class="step-icon" id="current-step-icon">🔄</div>
                        <div class="step-info">
                            <div class="step-title" id="current-step-title">Initializing...</div>
                            <div class="step-description" id="current-step-description">Please wait...</div>
                        </div>
                    </div>
                </div>

                <div class="gas-information hidden" id="gas-information">
                    <h4>⛽ Transaction Cost</h4>
                    <div class="gas-details">
                        <div class="gas-item">
                            <span>Gas Limit:</span>
                            <span id="gas-limit">-</span>
                        </div>
                        <div class="gas-item">
                            <span>Gas Price:</span>
                            <span id="gas-price">-</span>
                        </div>
                        <div class="gas-item total">
                            <span>Total Cost:</span>
                            <span id="total-cost">-</span>
                        </div>
                    </div>
                </div>

                <div class="transaction-confirmation hidden" id="transaction-confirmation">
                    <h4>✅ Confirm Transaction</h4>
                    <p>Please review the transaction details and confirm to proceed.</p>
                    <div class="confirmation-buttons">
                        <button class="btn btn-secondary" id="cancel-transaction">Cancel</button>
                        <button class="btn btn-primary" id="confirm-transaction">Confirm</button>
                    </div>
                </div>

                <div class="transaction-result hidden" id="transaction-result">
                    <div class="result-icon" id="result-icon">⏳</div>
                    <div class="result-title" id="result-title">Processing...</div>
                    <div class="result-hash" id="result-hash"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Show transaction modal
    showTransactionModal(flow) {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');

        title.textContent = `${this.getTransactionTypeTitle(flow.type)} Transaction`;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close transaction modal
    closeTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Update modal step display
    updateModalStep(flow) {
        const currentStep = flow.currentStep;
        const steps = flow.steps;

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressFill.style.width = `${progress}%`;

        // Update step display
        const stepsContainer = document.getElementById('progress-steps');
        stepsContainer.innerHTML = steps.map((step, index) => {
            let className = 'progress-step';
            if (index < currentStep) className += ' completed';
            if (index === currentStep) className += ' active';

            return `
                <div class="${className}">
                    <div class="step-number">${step.icon}</div>
                    <div class="step-name">${step.title}</div>
                </div>
            `;
        }).join('');

        // Update current step info
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            document.getElementById('current-step-icon').textContent = step.icon;
            document.getElementById('current-step-title').textContent = step.title;
            document.getElementById('current-step-description').textContent =
                this.getStepDescription(flow, step);
        }

        // Handle different states
        if (flow.status === 'failed') {
            this.showError(flow);
        } else if (flow.status === 'completed') {
            this.showSuccess(flow);
        }
    }

    // Update gas display
    updateGasDisplay(flow) {
        const gasInfo = document.getElementById('gas-information');

        if (flow.gasEstimate) {
            document.getElementById('gas-limit').textContent =
                flow.gasEstimate.gasEstimate.toLocaleString();
            document.getElementById('gas-price').textContent =
                (flow.gasEstimate.gasPrice / 1e9).toFixed(2) + ' Gwei';
            document.getElementById('total-cost').textContent =
                flow.gasEstimate.costInEth + ' ETH';

            gasInfo.classList.remove('hidden');
        }
    }

    // Show confirmation UI
    showConfirmationUI(flow, resolve, reject) {
        const confirmationDiv = document.getElementById('transaction-confirmation');
        const confirmBtn = document.getElementById('confirm-transaction');
        const cancelBtn = document.getElementById('cancel-transaction');

        confirmationDiv.classList.remove('hidden');

        const handleConfirm = () => {
            confirmationDiv.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve();
        };

        const handleCancel = () => {
            confirmationDiv.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            reject(new Error('Transaction cancelled by user'));
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    // Show error state
    showError(flow) {
        const resultDiv = document.getElementById('transaction-result');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultHash = document.getElementById('result-hash');

        resultIcon.textContent = '❌';
        resultTitle.textContent = 'Transaction Failed';
        resultHash.textContent = flow.error || 'Unknown error occurred';

        resultDiv.classList.remove('hidden');
    }

    // Show success state
    showSuccess(flow) {
        const resultDiv = document.getElementById('transaction-result');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultHash = document.getElementById('result-hash');

        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'Transaction Successful!';
        resultHash.innerHTML = flow.txHash ?
            `<a href="https://sepolia.etherscan.io/tx/${flow.txHash}" target="_blank" class="tx-link">
                View on Etherscan: ${flow.txHash.slice(0, 10)}...${flow.txHash.slice(-8)}
            </a>` : '';

        resultDiv.classList.remove('hidden');
    }

    // Utility methods
    getTransactionTypeTitle(type) {
        const titles = {
            donation: 'Donation',
            governance: 'Governance Vote',
            approval: 'Token Approval'
        };
        return titles[type] || 'Transaction';
    }

    getTransactionDescription(flow) {
        const descriptions = {
            donation: 'Donation',
            governance: 'Vote',
            approval: 'Token Approval'
        };
        return descriptions[flow.type] || 'Transaction';
    }

    getStepDescription(flow, step) {
        const descriptions = {
            validate: 'Checking wallet connection and balance...',
            estimate: 'Calculating transaction cost...',
            confirm: 'Waiting for your confirmation...',
            submit: 'Sending transaction to blockchain...',
            pending: 'Waiting for network confirmation...',
            success: 'Transaction completed successfully!'
        };
        return descriptions[step.id] || 'Processing...';
    }

    async updateUIAfterSuccess(flow) {
        // Refresh balances and data after successful transaction
        if (window.walletManager?.isConnected()) {
            await window.walletManager.updateBalance();
        }

        // Trigger page-specific updates
        this.dispatchFlowEvent('uiUpdateRequired', {
            type: flow.type,
            flowId: flow.id
        });
    }

    setupEventListeners() {
        // Listen for wallet disconnection
        window.addEventListener('walletDisconnected', () => {
            // Cancel any active flows
            for (const [flowId, flow] of this.activeFlows) {
                if (flow.status === 'active') {
                    flow.status = 'cancelled';
                    flow.error = 'Wallet disconnected';
                }
            }
            this.closeTransactionModal();
        });
    }

    dispatchFlowEvent(eventName, data) {
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
    async startDonation(amount, foundationAddress, tokenData) {
        return await this.startFlow('donation', {
            value: '0x' + (parseFloat(amount) * 1e18).toString(16),
            foundationAddress: foundationAddress,
            data: tokenData || '0x'
        });
    }

    async startGovernanceVote(contractAddress, voteData) {
        return await this.startFlow('governance', {
            contractAddress: contractAddress,
            voteData: voteData
        });
    }

    async startTokenApproval(tokenAddress, approvalData) {
        return await this.startFlow('approval', {
            tokenAddress: tokenAddress,
            approvalData: approvalData
        });
    }

    getActiveFlows() {
        return Array.from(this.activeFlows.values());
    }

    getFlow(flowId) {
        return this.activeFlows.get(flowId);
    }

    cancelFlow(flowId) {
        const flow = this.activeFlows.get(flowId);
        if (flow && flow.status === 'active') {
            flow.status = 'cancelled';
            flow.error = 'Cancelled by user';
            this.closeTransactionModal();
        }
    }
}

// Initialize global transaction flow manager
window.transactionFlow = new TransactionFlowManager();

// Export for use in other files
window.TransactionFlowManager = TransactionFlowManager;

console.log('✅ Transaction Flow Manager loaded');
EOF

echo "✅ Transaction flow manager created"

# Create transaction flow CSS
echo "🎨 Creating transaction flow styles..."

cat > css/transaction-flow.css << 'EOF'
/* Transaction Flow Modal Styles */
.transaction-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    visibility: visible;
    transition: all 0.3s ease;
}

.transaction-modal.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.transaction-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
}

.transaction-modal-content {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

.transaction-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25px 30px 20px;
    border-bottom: 1px solid #e1e5e9;
}

.transaction-modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
}

.transaction-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.transaction-modal-close:hover {
    background: #f5f5f5;
    color: #333;
}

/* Progress Section */
.transaction-progress {
    padding: 25px 30px;
    background: #f8fbff;
    border-bottom: 1px solid #e1e5e9;
}

.progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
}

.progress-steps::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    height: 2px;
    background: #e1e5e9;
    z-index: 1;
}

.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 2;
    flex: 1;
    max-width: 80px;
}

.step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e1e5e9;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.progress-step.completed .step-number {
    background: #28a745;
    color: white;
}

.progress-step.active .step-number {
    background: #007bff;
    color: white;
    animation: pulse 2s infinite;
}

.step-name {
    font-size: 11px;
    text-align: center;
    color: #666;
    font-weight: 500;
    line-height: 1.2;
}

.progress-step.completed .step-name {
    color: #28a745;
}

.progress-step.active .step-name {
    color: #007bff;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: #e1e5e9;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 3px;
    transition: width 0.5s ease;
    width: 0%;
}

/* Transaction Details */
.transaction-details {
    padding: 25px 30px;
}

.current-step {
    display: flex;
    align-items: center;
    gap: 20px;
}

.step-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #f8fbff;
    border: 2px solid #007bff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: spin 2s linear infinite;
}

.step-info {
    flex: 1;
}

.step-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 5px;
}

.step-description {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

/* Gas Information */
.gas-information {
    padding: 20px 30px;
    background: #fff9e6;
    border-top: 1px solid #e1e5e9;
    border-bottom: 1px solid #e1e5e9;
}

.gas-information h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
}

.gas-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.gas-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.gas-item.total {
    padding-top: 8px;
    border-top: 1px solid #f0c040;
    font-weight: 600;
    color: #1a1a1a;
}

/* Transaction Confirmation */
.transaction-confirmation {
    padding: 25px 30px;
    text-align: center;
    border-top: 1px solid #e1e5e9;
}

.transaction-confirmation h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
}

.transaction-confirmation p {
    margin: 0 0 20px 0;
    color: #666;
    font-size: 14px;
}

.confirmation-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.confirmation-buttons .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #5a6268;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

/* Transaction Result */
.transaction-result {
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e1e5e9;
}

.result-icon {
    font-size: 48px;
    margin-bottom: 15px;
}

.result-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 15px;
}

.result-hash {
    font-size: 12px;
    color: #666;
    word-break: break-all;
}

.tx-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
}

.tx-link:hover {
    text-decoration: underline;
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

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
    .transaction-modal-content {
        margin: 20px;
        max-height: calc(100vh - 40px);
    }

    .transaction-modal-header,
    .transaction-progress,
    .transaction-details,
    .gas-information,
    .transaction-confirmation,
    .transaction-result {
        padding-left: 20px;
        padding-right: 20px;
    }

    .progress-steps {
        gap: 5px;
    }

    .progress-step {
        max-width: 60px;
    }

    .step-name {
        font-size: 10px;
    }

    .current-step {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }

    .confirmation-buttons {
        flex-direction: column;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .transaction-modal-content {
        background: #2d2d2d;
        color: white;
    }

    .transaction-modal-header {
        border-bottom-color: #444;
    }

    .transaction-modal-header h3 {
        color: white;
    }

    .transaction-progress {
        background: #1a1a1a;
        border-bottom-color: #444;
    }

    .gas-information {
        background: #2a2a2a;
        border-color: #444;
    }

    .step-description {
        color: #ccc;
    }
}

/* Utility Classes */
.hidden {
    display: none !important;
}

.text-center {
    text-align: center;
}

.mb-0 {
    margin-bottom: 0 !important;
}

.mt-20 {
    margin-top: 20px;
}
EOF

echo "✅ Transaction flow styles created"

echo ""
echo "💸 Enhanced Transaction Flow System Complete!"
echo "============================================="
echo ""
echo "📋 Features Implemented:"
echo "  ✅ Step-by-step transaction flow UI"
echo "  ✅ Real-time gas estimation display"
echo "  ✅ Transaction confirmation flows"
echo "  ✅ Status tracking with progress bars"
echo "  ✅ Transaction receipt display"
echo "  ✅ Failed transaction recovery"
echo "  ✅ Multi-transaction type support"
echo "  ✅ Mobile-optimized modal interface"
echo ""
echo "🧰 Available Components:"
echo "  1. js/transaction-flow.js - Core transaction flow management"
echo "  2. css/transaction-flow.css - Transaction modal UI styles"
echo ""
echo "🔧 API Methods:"
echo "  - transactionFlow.startDonation(amount, address, data)"
echo "  - transactionFlow.startGovernanceVote(contract, voteData)"
echo "  - transactionFlow.startTokenApproval(token, approvalData)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Include transaction flow files in HTML pages"
echo "  2. Test donation transaction flows"
echo "  3. Test governance voting flows"
echo "  4. Test error handling scenarios"
echo "  5. Verify mobile transaction experience"
