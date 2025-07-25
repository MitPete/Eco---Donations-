/**
 * Production Monitoring System for Eco Donations Platform
 * Real-time monitoring with alerts and metrics tracking
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ProductionMonitor {
    constructor(config = {}) {
        this.config = {
            checkInterval: config.checkInterval || 30000, // 30 seconds
            alertThresholds: {
                maxGasPrice: config.maxGasPrice || 100, // gwei
                minBalance: config.minBalance || 0.1, // ETH
                maxResponseTime: config.maxResponseTime || 5000, // ms
                errorRate: config.errorRate || 0.05 // 5%
            },
            contracts: config.contracts || {},
            notificationEndpoints: config.notificationEndpoints || [],
            web3Provider: config.web3Provider,
            ...config
        };

        this.metrics = {
            contractHealth: {},
            networkStatus: {},
            alertHistory: [],
            uptime: Date.now(),
            lastCheck: null
        };

        this.isRunning = false;
        this.alertCooldowns = new Map();
    }

    async start() {
        if (this.isRunning) return;

        console.log('🔍 Starting Production Monitoring System...');
        this.isRunning = true;

        // Initial health check
        await this.performHealthCheck();

        // Start monitoring loop
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                console.error('Health check error:', error);
                await this.sendAlert('SYSTEM_ERROR', `Health check failed: ${error.message}`);
            }
        }, this.config.checkInterval);

        console.log(`✅ Monitoring started with ${this.config.checkInterval/1000}s interval`);
    }

    async stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        console.log('🛑 Production monitoring stopped');
    }

    async performHealthCheck() {
        const timestamp = Date.now();
        this.metrics.lastCheck = timestamp;

        const checks = await Promise.allSettled([
            this.checkNetworkHealth(),
            this.checkContractHealth(),
            this.checkGasPrices(),
            this.checkWalletBalances(),
            this.checkFrontendHealth()
        ]);

        // Process results and trigger alerts
        checks.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Health check ${index} failed:`, result.reason);
            }
        });

        // Save metrics
        await this.saveMetrics();
    }

    async checkNetworkHealth() {
        try {
            const Web3 = require('web3');
            const web3 = new Web3(this.config.web3Provider);

            const startTime = Date.now();
            const blockNumber = await web3.eth.getBlockNumber();
            const responseTime = Date.now() - startTime;

            const networkHealth = {
                blockNumber,
                responseTime,
                timestamp: Date.now(),
                status: responseTime < this.config.alertThresholds.maxResponseTime ? 'healthy' : 'slow'
            };

            this.metrics.networkStatus = networkHealth;

            if (responseTime > this.config.alertThresholds.maxResponseTime) {
                await this.sendAlert('NETWORK_SLOW',
                    `Network response time: ${responseTime}ms (threshold: ${this.config.alertThresholds.maxResponseTime}ms)`
                );
            }

            return networkHealth;
        } catch (error) {
            await this.sendAlert('NETWORK_ERROR', `Network check failed: ${error.message}`);
            throw error;
        }
    }

    async checkContractHealth() {
        const contractResults = {};

        for (const [name, address] of Object.entries(this.config.contracts)) {
            try {
                const Web3 = require('web3');
                const web3 = new Web3(this.config.web3Provider);

                // Check if contract exists
                const code = await web3.eth.getCode(address);
                const exists = code !== '0x';

                // Basic contract call test (assuming all have owner() function)
                let functional = false;
                try {
                    const contract = new web3.eth.Contract([
                        {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
                    ], address);

                    await contract.methods.owner().call();
                    functional = true;
                } catch (callError) {
                    console.warn(`Contract ${name} call test failed:`, callError.message);
                }

                contractResults[name] = {
                    address,
                    exists,
                    functional,
                    lastChecked: Date.now(),
                    status: exists && functional ? 'healthy' : 'error'
                };

                if (!exists) {
                    await this.sendAlert('CONTRACT_MISSING', `Contract ${name} not found at ${address}`);
                } else if (!functional) {
                    await this.sendAlert('CONTRACT_ERROR', `Contract ${name} not responding properly`);
                }

            } catch (error) {
                contractResults[name] = {
                    address,
                    error: error.message,
                    lastChecked: Date.now(),
                    status: 'error'
                };

                await this.sendAlert('CONTRACT_CHECK_FAILED',
                    `Failed to check contract ${name}: ${error.message}`
                );
            }
        }

        this.metrics.contractHealth = contractResults;
        return contractResults;
    }

    async checkGasPrices() {
        try {
            // Check current gas prices
            const gasResponse = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle');

            if (gasResponse.data && gasResponse.data.result) {
                const gasData = gasResponse.data.result;
                const standardGas = parseInt(gasData.StandardGasPrice);

                this.metrics.gasPrice = {
                    standard: standardGas,
                    fast: parseInt(gasData.FastGasPrice),
                    safe: parseInt(gasData.SafeGasPrice),
                    timestamp: Date.now()
                };

                if (standardGas > this.config.alertThresholds.maxGasPrice) {
                    await this.sendAlert('HIGH_GAS_PRICE',
                        `Current gas price: ${standardGas} gwei (threshold: ${this.config.alertThresholds.maxGasPrice} gwei)`
                    );
                }
            }
        } catch (error) {
            console.error('Gas price check failed:', error.message);
        }
    }

    async checkWalletBalances() {
        if (!this.config.walletAddresses) return;

        try {
            const Web3 = require('web3');
            const web3 = new Web3(this.config.web3Provider);

            const balanceChecks = {};

            for (const [name, address] of Object.entries(this.config.walletAddresses)) {
                const balanceWei = await web3.eth.getBalance(address);
                const balanceETH = parseFloat(web3.utils.fromWei(balanceWei, 'ether'));

                balanceChecks[name] = {
                    address,
                    balance: balanceETH,
                    timestamp: Date.now(),
                    status: balanceETH >= this.config.alertThresholds.minBalance ? 'healthy' : 'low'
                };

                if (balanceETH < this.config.alertThresholds.minBalance) {
                    await this.sendAlert('LOW_WALLET_BALANCE',
                        `Wallet ${name} balance: ${balanceETH.toFixed(4)} ETH (threshold: ${this.config.alertThresholds.minBalance} ETH)`
                    );
                }
            }

            this.metrics.walletBalances = balanceChecks;
        } catch (error) {
            await this.sendAlert('WALLET_CHECK_FAILED', `Wallet balance check failed: ${error.message}`);
        }
    }

    async checkFrontendHealth() {
        if (!this.config.frontendUrl) return;

        try {
            const startTime = Date.now();
            const response = await axios.get(this.config.frontendUrl, { timeout: 10000 });
            const responseTime = Date.now() - startTime;

            const frontendHealth = {
                url: this.config.frontendUrl,
                status: response.status,
                responseTime,
                timestamp: Date.now(),
                healthy: response.status === 200 && responseTime < 5000
            };

            this.metrics.frontendHealth = frontendHealth;

            if (response.status !== 200) {
                await this.sendAlert('FRONTEND_ERROR',
                    `Frontend returned status ${response.status}`
                );
            } else if (responseTime > 5000) {
                await this.sendAlert('FRONTEND_SLOW',
                    `Frontend response time: ${responseTime}ms`
                );
            }

        } catch (error) {
            await this.sendAlert('FRONTEND_DOWN',
                `Frontend health check failed: ${error.message}`
            );
        }
    }

    async sendAlert(type, message, severity = 'warning') {
        const alertKey = `${type}_${Date.now() - (Date.now() % 300000)}`; // 5-minute cooldown

        if (this.alertCooldowns.has(alertKey)) {
            return; // Skip duplicate alerts within cooldown period
        }

        this.alertCooldowns.set(alertKey, Date.now());

        const alert = {
            type,
            message,
            severity,
            timestamp: Date.now(),
            environment: 'production'
        };

        this.metrics.alertHistory.push(alert);

        // Keep only last 100 alerts
        if (this.metrics.alertHistory.length > 100) {
            this.metrics.alertHistory = this.metrics.alertHistory.slice(-100);
        }

        console.log(`🚨 [${severity.toUpperCase()}] ${type}: ${message}`);

        // Send to configured notification endpoints
        for (const endpoint of this.config.notificationEndpoints) {
            try {
                await this.sendNotification(endpoint, alert);
            } catch (error) {
                console.error('Failed to send notification:', error.message);
            }
        }
    }

    async sendNotification(endpoint, alert) {
        switch (endpoint.type) {
            case 'webhook':
                await axios.post(endpoint.url, {
                    platform: 'Eco Donations',
                    alert,
                    timestamp: new Date().toISOString()
                }, {
                    headers: endpoint.headers || {}
                });
                break;

            case 'email':
                // Email notification (would require email service integration)
                console.log(`📧 Email alert sent to ${endpoint.to}: ${alert.type}`);
                break;

            case 'slack':
                await axios.post(endpoint.webhook, {
                    text: `🚨 *Eco Donations Alert*\n*Type:* ${alert.type}\n*Message:* ${alert.message}\n*Severity:* ${alert.severity}\n*Time:* ${new Date(alert.timestamp).toISOString()}`
                });
                break;

            default:
                console.log(`Unknown notification type: ${endpoint.type}`);
        }
    }

    async saveMetrics() {
        try {
            const metricsDir = path.join(__dirname, '../metrics');
            await fs.mkdir(metricsDir, { recursive: true });

            const filename = `metrics-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(metricsDir, filename);

            await fs.writeFile(filepath, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.error('Failed to save metrics:', error.message);
        }
    }

    getHealthSummary() {
        return {
            uptime: Date.now() - this.metrics.uptime,
            lastCheck: this.metrics.lastCheck,
            network: this.metrics.networkStatus?.status || 'unknown',
            contracts: Object.values(this.metrics.contractHealth || {})
                .filter(c => c.status === 'healthy').length,
            totalContracts: Object.keys(this.metrics.contractHealth || {}).length,
            recentAlerts: this.metrics.alertHistory.slice(-5),
            gasPrice: this.metrics.gasPrice?.standard || 'unknown'
        };
    }

    // REST API endpoints for monitoring dashboard
    setupAPIEndpoints(app) {
        app.get('/api/monitoring/health', (req, res) => {
            res.json(this.getHealthSummary());
        });

        app.get('/api/monitoring/metrics', (req, res) => {
            res.json(this.metrics);
        });

        app.get('/api/monitoring/alerts', (req, res) => {
            const limit = parseInt(req.query.limit) || 50;
            res.json(this.metrics.alertHistory.slice(-limit));
        });
    }
}

module.exports = ProductionMonitor;
