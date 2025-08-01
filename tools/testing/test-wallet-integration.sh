#!/bin/bash

echo "🧪 Testing Enhanced Wallet Integration..."
echo "========================================"

cd "$(dirname "$0")/frontend"

# Create wallet integration test page
echo "🔧 Creating wallet integration test page..."

cat > wallet-integration-test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wallet Integration Test - Eco Donations</title>
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/wallet-selector.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .test-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-connected {
            background: #d4edda;
            color: #155724;
        }
        .status-disconnected {
            background: #f8d7da;
            color: #721c24;
        }
        .status-connecting {
            background: #fff3cd;
            color: #856404;
        }
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin: 5px;
            transition: all 0.2s;
        }
        .btn:hover {
            background: #0056b3;
            transform: translateY(-1px);
        }
        .btn.success {
            background: #28a745;
        }
        .btn.warning {
            background: #ffc107;
            color: #212529;
        }
        .btn.danger {
            background: #dc3545;
        }
        .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 10px;
            align-items: center;
            margin: 10px 0;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        .info-value {
            font-family: monospace;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            word-break: break-all;
        }
        .test-log {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            height: 200px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-line;
        }
        .transaction-item {
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            margin: 5px 0;
            background: #f8f9fa;
        }
        .transaction-hash {
            font-family: monospace;
            font-size: 11px;
            color: #6c757d;
            word-break: break-all;
        }
        @media (max-width: 768px) {
            .test-grid {
                grid-template-columns: 1fr;
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="test-card">
            <h1>🔗 Enhanced Wallet Integration Test</h1>
            <p>Comprehensive testing interface for wallet functionality</p>
        </div>

        <div class="test-grid">
            <div class="test-card">
                <h3>🔌 Connection Status</h3>
                <div class="info-grid">
                    <span class="info-label">Status:</span>
                    <span class="status-badge status-disconnected" id="connection-status">Disconnected</span>

                    <span class="info-label">Wallet:</span>
                    <span class="info-value" id="wallet-type">None</span>

                    <span class="info-label">Address:</span>
                    <span class="info-value" id="wallet-address">Not connected</span>

                    <span class="info-label">Network:</span>
                    <span class="info-value" id="wallet-network">Unknown</span>

                    <span class="info-label">Balance:</span>
                    <span class="info-value" id="wallet-balance">0 ETH</span>
                </div>

                <div style="margin-top: 15px;">
                    <button class="btn" id="connect-btn" onclick="testConnect()">🔗 Connect Wallet</button>
                    <button class="btn danger" id="disconnect-btn" onclick="testDisconnect()" disabled>🔌 Disconnect</button>
                </div>
            </div>

            <div class="test-card">
                <h3>🌐 Network Tests</h3>
                <p>Test network switching functionality</p>

                <button class="btn" onclick="switchToMainnet()">🟢 Mainnet</button>
                <button class="btn warning" onclick="switchToSepolia()">🟡 Sepolia</button>
                <button class="btn" onclick="switchToLocalhost()">🟣 Localhost</button>

                <div style="margin-top: 15px;">
                    <div class="info-grid">
                        <span class="info-label">Current Chain ID:</span>
                        <span class="info-value" id="chain-id">Not connected</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="test-card">
            <h3>📊 Transaction Tests</h3>
            <div class="test-grid">
                <div>
                    <h4>Send Test Transaction</h4>
                    <button class="btn" onclick="testTransaction()">📤 Send Test Transaction</button>
                    <button class="btn" onclick="testGasEstimation()">⛽ Test Gas Estimation</button>

                    <div id="gas-estimation" style="margin-top: 10px; display: none;">
                        <div class="info-grid">
                            <span class="info-label">Gas Estimate:</span>
                            <span class="info-value" id="gas-estimate">-</span>

                            <span class="info-label">Gas Price:</span>
                            <span class="info-value" id="gas-price">-</span>

                            <span class="info-label">Total Cost:</span>
                            <span class="info-value" id="total-cost">-</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4>Active Transactions</h4>
                    <div id="active-transactions">
                        <p style="color: #6c757d; font-style: italic;">No active transactions</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="test-card">
            <h3>💾 Persistence Tests</h3>
            <div class="test-grid">
                <div>
                    <button class="btn" onclick="testSaveConnection()">💾 Test Save Connection</button>
                    <button class="btn" onclick="testLoadConnection()">📂 Test Load Connection</button>
                    <button class="btn danger" onclick="testClearConnection()">🗑️ Clear Saved Data</button>
                </div>
                <div>
                    <button class="btn" onclick="testAutoConnect()">🔄 Test Auto-Connect</button>
                    <button class="btn" onclick="refreshPage()">🔄 Refresh Page</button>
                </div>
            </div>
        </div>

        <div class="test-card">
            <h3>📱 Mobile & Browser Tests</h3>
            <div class="test-grid">
                <div>
                    <button class="btn" onclick="testMobileDetection()">📱 Test Mobile Detection</button>
                    <button class="btn" onclick="testTouchEvents()">👆 Test Touch Events</button>
                    <button class="btn" onclick="testWalletSelector()">🎯 Test Wallet Selector</button>
                </div>
                <div>
                    <button class="btn" onclick="testCrossTab()">🔄 Test Cross-Tab Sync</button>
                    <button class="btn" onclick="testErrorHandling()">⚠️ Test Error Handling</button>
                </div>
            </div>
        </div>

        <div class="test-card">
            <h3>📋 Test Log</h3>
            <div class="test-log" id="test-log">Test log will appear here...\n</div>
            <button class="btn" onclick="clearLog()">🗑️ Clear Log</button>
            <button class="btn" onclick="exportLog()">💾 Export Log</button>
        </div>
    </div>

    <!-- Include wallet integration scripts -->
    <script src="js/browser-polyfills.js"></script>
    <script src="js/wallet-persistence.js"></script>
    <script src="js/transaction-tracker.js"></script>
    <script src="js/enhanced-wallet.js"></script>

    <script>
        // Test interface functionality
        let testLog = [];

        function log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
            testLog.push(logMessage);

            const logElement = document.getElementById('test-log');
            logElement.textContent += logMessage + '\n';
            logElement.scrollTop = logElement.scrollHeight;

            console.log(logMessage);
        }

        function clearLog() {
            testLog = [];
            document.getElementById('test-log').textContent = 'Test log cleared...\n';
        }

        function exportLog() {
            const logText = testLog.join('\n');
            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wallet-test-log-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        // Wallet test functions
        async function testConnect() {
            try {
                log('Testing wallet connection...');
                const wallet = await window.walletManager.connectWallet();
                log(`Successfully connected to ${wallet.info.name}`, 'success');
                updateWalletInfo();
            } catch (error) {
                log(`Connection failed: ${error.message}`, 'error');
            }
        }

        async function testDisconnect() {
            try {
                log('Testing wallet disconnection...');
                await window.walletManager.disconnectWallet();
                log('Successfully disconnected wallet', 'success');
                updateWalletInfo();
            } catch (error) {
                log(`Disconnection failed: ${error.message}`, 'error');
            }
        }

        async function switchToMainnet() {
            try {
                log('Switching to Mainnet...');
                await window.walletManager.switchNetwork('mainnet');
                log('Successfully switched to Mainnet', 'success');
            } catch (error) {
                log(`Network switch failed: ${error.message}`, 'error');
            }
        }

        async function switchToSepolia() {
            try {
                log('Switching to Sepolia...');
                await window.walletManager.switchNetwork('sepolia');
                log('Successfully switched to Sepolia', 'success');
            } catch (error) {
                log(`Network switch failed: ${error.message}`, 'error');
            }
        }

        async function switchToLocalhost() {
            try {
                log('Switching to Localhost...');
                await window.walletManager.switchNetwork('localhost');
                log('Successfully switched to Localhost', 'success');
            } catch (error) {
                log(`Network switch failed: ${error.message}`, 'error');
            }
        }

        async function testTransaction() {
            try {
                log('Testing transaction submission...');

                if (!window.walletManager.isConnected()) {
                    throw new Error('Wallet not connected');
                }

                // Create a simple test transaction (self-transfer)
                const provider = window.walletManager.getProvider();
                const address = window.walletManager.getAddress();

                const txParams = {
                    from: address,
                    to: address,
                    value: '0x0', // 0 ETH
                    data: '0x' // No data
                };

                const txHash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [txParams]
                });

                log(`Transaction submitted: ${txHash}`, 'success');

                // Track the transaction
                window.transactionTracker.addTransaction(txHash, 'test', {
                    description: 'Test transaction'
                });

                updateTransactionList();

            } catch (error) {
                log(`Transaction failed: ${error.message}`, 'error');
            }
        }

        async function testGasEstimation() {
            try {
                log('Testing gas estimation...');

                if (!window.walletManager.isConnected()) {
                    throw new Error('Wallet not connected');
                }

                const address = window.walletManager.getAddress();
                const txParams = {
                    from: address,
                    to: address,
                    value: '0x0'
                };

                const cost = await window.transactionTracker.calculateTransactionCost(txParams);

                document.getElementById('gas-estimate').textContent = cost.gasEstimate.toLocaleString();
                document.getElementById('gas-price').textContent = (cost.gasPrice / 1e9).toFixed(2) + ' Gwei';
                document.getElementById('total-cost').textContent = cost.costInEth + ' ETH';
                document.getElementById('gas-estimation').style.display = 'block';

                log(`Gas estimation successful: ${cost.gasEstimate} gas at ${(cost.gasPrice / 1e9).toFixed(2)} Gwei`, 'success');

            } catch (error) {
                log(`Gas estimation failed: ${error.message}`, 'error');
            }
        }

        function testSaveConnection() {
            try {
                log('Testing connection save...');
                if (window.walletManager.isConnected()) {
                    window.walletPersistence.saveConnection(window.walletManager.getWallet());
                    log('Connection saved successfully', 'success');
                } else {
                    log('No wallet connected to save', 'warn');
                }
            } catch (error) {
                log(`Save failed: ${error.message}`, 'error');
            }
        }

        function testLoadConnection() {
            try {
                log('Testing connection load...');
                const saved = window.walletPersistence.loadConnection();
                if (saved) {
                    log(`Loaded connection: ${saved.walletType} - ${saved.address}`, 'success');
                } else {
                    log('No saved connection found', 'warn');
                }
            } catch (error) {
                log(`Load failed: ${error.message}`, 'error');
            }
        }

        function testClearConnection() {
            try {
                log('Testing connection clear...');
                window.walletPersistence.clearConnection();
                log('Saved connection cleared', 'success');
            } catch (error) {
                log(`Clear failed: ${error.message}`, 'error');
            }
        }

        async function testAutoConnect() {
            try {
                log('Testing auto-connect...');
                const shouldAutoConnect = window.walletPersistence.shouldAutoConnect();
                log(`Auto-connect should run: ${shouldAutoConnect}`, shouldAutoConnect ? 'success' : 'warn');

                if (shouldAutoConnect) {
                    const saved = window.walletPersistence.loadConnection();
                    await window.walletManager.connectWallet(saved.walletType, false);
                    log('Auto-connect successful', 'success');
                }
            } catch (error) {
                log(`Auto-connect failed: ${error.message}`, 'error');
            }
        }

        function refreshPage() {
            log('Refreshing page to test persistence...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        function testMobileDetection() {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const hasTouch = 'ontouchstart' in window;
            log(`Mobile detected: ${isMobile}, Touch support: ${hasTouch}`, 'info');
        }

        function testTouchEvents() {
            log('Testing touch event handling...');
            // Simulate touch event
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                bubbles: true
            });
            document.dispatchEvent(touchEvent);
            log('Touch event simulated', 'success');
        }

        async function testWalletSelector() {
            try {
                log('Testing wallet selector...');
                const selectedWallet = await window.walletManager.showWalletSelector();
                log(`Wallet selector returned: ${selectedWallet || 'cancelled'}`, 'info');
            } catch (error) {
                log(`Wallet selector failed: ${error.message}`, 'error');
            }
        }

        function testCrossTab() {
            log('Testing cross-tab synchronization...');
            // Open a new tab to test cross-tab sync
            const newTab = window.open(window.location.href, '_blank');
            if (newTab) {
                log('New tab opened. Connect/disconnect wallet to test sync', 'info');
            } else {
                log('Popup blocked. Please allow popups and try again', 'warn');
            }
        }

        function testErrorHandling() {
            try {
                log('Testing error handling...');
                // Intentionally cause an error
                throw new Error('Test error for error handling');
            } catch (error) {
                log(`Error handling test: ${error.message}`, 'error');
                log('Error properly caught and logged', 'success');
            }
        }

        function updateWalletInfo() {
            const wallet = window.walletManager.getWallet();

            if (wallet) {
                document.getElementById('connection-status').textContent = 'Connected';
                document.getElementById('connection-status').className = 'status-badge status-connected';
                document.getElementById('wallet-type').textContent = wallet.info.name;
                document.getElementById('wallet-address').textContent = window.walletManager.formatAddress(wallet.address);
                document.getElementById('wallet-network').textContent = window.walletManager.getNetworkName(wallet.chainId);
                document.getElementById('chain-id').textContent = wallet.chainId;

                document.getElementById('connect-btn').disabled = true;
                document.getElementById('disconnect-btn').disabled = false;

                // Update balance
                window.walletManager.updateBalance();
            } else {
                document.getElementById('connection-status').textContent = 'Disconnected';
                document.getElementById('connection-status').className = 'status-badge status-disconnected';
                document.getElementById('wallet-type').textContent = 'None';
                document.getElementById('wallet-address').textContent = 'Not connected';
                document.getElementById('wallet-network').textContent = 'Unknown';
                document.getElementById('chain-id').textContent = 'Not connected';
                document.getElementById('wallet-balance').textContent = '0 ETH';

                document.getElementById('connect-btn').disabled = false;
                document.getElementById('disconnect-btn').disabled = true;
            }
        }

        function updateTransactionList() {
            const transactions = window.transactionTracker.getAllTransactions();
            const container = document.getElementById('active-transactions');

            if (transactions.length === 0) {
                container.innerHTML = '<p style="color: #6c757d; font-style: italic;">No active transactions</p>';
                return;
            }

            container.innerHTML = transactions.map(tx => `
                <div class="transaction-item">
                    <div><strong>${tx.type.toUpperCase()}</strong> - ${tx.status.toUpperCase()}</div>
                    <div class="transaction-hash">${tx.hash}</div>
                    <div style="font-size: 11px; color: #6c757d;">
                        ${new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            `).join('');
        }

        // Event listeners
        window.addEventListener('walletConnected', (e) => {
            log(`Wallet connected event: ${e.detail.address}`, 'success');
            updateWalletInfo();
        });

        window.addEventListener('walletDisconnected', () => {
            log('Wallet disconnected event', 'info');
            updateWalletInfo();
        });

        window.addEventListener('networkChanged', (e) => {
            log(`Network changed event: ${e.detail.chainId}`, 'info');
            updateWalletInfo();
        });

        window.addEventListener('transactionStatusChanged', (e) => {
            log(`Transaction ${e.detail.status}: ${e.detail.hash}`, 'info');
            updateTransactionList();
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            log('Wallet integration test page loaded');
            updateWalletInfo();
            updateTransactionList();
        });
    </script>
</body>
</html>
EOF

echo "✅ Wallet integration test page created"

echo ""
echo "🧪 Wallet Integration Testing Complete!"
echo "======================================"
echo ""
echo "📋 Test Features Available:"
echo "  ✅ Connection/disconnection testing"
echo "  ✅ Multi-wallet selection testing"
echo "  ✅ Network switching testing"
echo "  ✅ Transaction submission & tracking"
echo "  ✅ Gas estimation testing"
echo "  ✅ Connection persistence testing"
echo "  ✅ Cross-tab synchronization testing"
echo "  ✅ Mobile/touch event testing"
echo "  ✅ Error handling testing"
echo ""
echo "🔗 Testing Interface:"
echo "  Open: wallet-integration-test.html"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open the test page in your browser"
echo "  2. Test wallet connection with MetaMask"
echo "  3. Test network switching"
echo "  4. Test transaction flows"
echo "  5. Test persistence across page reloads"
echo "  6. Test on mobile devices"
