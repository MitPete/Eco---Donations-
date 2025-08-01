/**
 * Production Monitoring Server for Eco Donations Platform
 * Comprehensive monitoring with dashboard and alerting
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const ProductionMonitor = require('./production-monitoring');

class MonitoringServer {
    constructor() {
        this.app = express();
        this.port = process.env.MONITORING_PORT || 3002;
        this.monitor = null;

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));

        // Basic authentication for dashboard
        this.app.use((req, res, next) => {
            if (req.path === '/dashboard' || req.path === '/') {
                const auth = req.headers.authorization;
                if (!auth) {
                    res.setHeader('WWW-Authenticate', 'Basic realm="Monitoring Dashboard"');
                    return res.status(401).send('Authentication required');
                }

                const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
                const username = credentials[0];
                const password = credentials[1];

                if (username !== process.env.DASHBOARD_USERNAME || password !== process.env.DASHBOARD_PASSWORD) {
                    return res.status(401).send('Invalid credentials');
                }
            }
            next();
        });
    }

    setupRoutes() {
        // Dashboard routes
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard.html'));
        });

        this.app.get('/dashboard', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard.html'));
        });

        // Health check endpoint (no auth required)
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: Date.now(),
                uptime: process.uptime(),
                version: '1.0.0'
            });
        });

        // Webhook endpoint for external alerts
        this.app.post('/webhook/alert', async (req, res) => {
            try {
                const { type, message, severity, source } = req.body;

                if (this.monitor) {
                    await this.monitor.sendAlert(
                        `EXTERNAL_${type}`,
                        `[${source}] ${message}`,
                        severity || 'warning'
                    );
                }

                res.json({ success: true });
            } catch (error) {
                console.error('Webhook error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Status endpoint for load balancers
        this.app.get('/status', (req, res) => {
            const summary = this.monitor ? this.monitor.getHealthSummary() : null;

            if (!summary || !summary.lastCheck || Date.now() - summary.lastCheck > 120000) {
                return res.status(503).json({ status: 'unhealthy', reason: 'monitoring_offline' });
            }

            const hasErrors = summary.recentAlerts.some(alert => alert.severity === 'error');

            res.status(hasErrors ? 503 : 200).json({
                status: hasErrors ? 'degraded' : 'healthy',
                summary
            });
        });

        // Metrics export for external monitoring
        this.app.get('/metrics', async (req, res) => {
            if (!this.monitor) {
                return res.status(503).text('Monitoring not available');
            }

            const metrics = this.monitor.metrics;
            const summary = this.monitor.getHealthSummary();

            // Prometheus-style metrics format
            const prometheusMetrics = this.formatPrometheusMetrics(metrics, summary);

            res.setHeader('Content-Type', 'text/plain');
            res.send(prometheusMetrics);
        });

        // Historical data endpoint
        this.app.get('/api/monitoring/history', async (req, res) => {
            try {
                const days = parseInt(req.query.days) || 7;
                const metricsDir = path.join(__dirname, '../metrics');

                const files = await fs.readdir(metricsDir);
                const dateFiles = files
                    .filter(file => file.startsWith('metrics-') && file.endsWith('.json'))
                    .sort()
                    .slice(-days);

                const history = [];
                for (const file of dateFiles) {
                    try {
                        const content = await fs.readFile(path.join(metricsDir, file), 'utf8');
                        const data = JSON.parse(content);
                        history.push({
                            date: file.replace('metrics-', '').replace('.json', ''),
                            ...data
                        });
                    } catch (error) {
                        console.error(`Error reading metrics file ${file}:`, error);
                    }
                }

                res.json(history);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    formatPrometheusMetrics(metrics, summary) {
        const lines = [];

        // System metrics
        lines.push(`# HELP eco_donations_uptime_seconds System uptime in seconds`);
        lines.push(`# TYPE eco_donations_uptime_seconds counter`);
        lines.push(`eco_donations_uptime_seconds ${Math.floor(summary.uptime / 1000)}`);

        // Network metrics
        if (metrics.networkStatus) {
            lines.push(`# HELP eco_donations_network_response_time_ms Network response time in milliseconds`);
            lines.push(`# TYPE eco_donations_network_response_time_ms gauge`);
            lines.push(`eco_donations_network_response_time_ms ${metrics.networkStatus.responseTime}`);
        }

        // Contract health
        if (metrics.contractHealth) {
            lines.push(`# HELP eco_donations_contract_healthy Contract health status (1=healthy, 0=unhealthy)`);
            lines.push(`# TYPE eco_donations_contract_healthy gauge`);

            for (const [name, status] of Object.entries(metrics.contractHealth)) {
                const healthy = status.status === 'healthy' ? 1 : 0;
                lines.push(`eco_donations_contract_healthy{contract="${name}"} ${healthy}`);
            }
        }

        // Gas price
        if (metrics.gasPrice) {
            lines.push(`# HELP eco_donations_gas_price_gwei Current gas price in gwei`);
            lines.push(`# TYPE eco_donations_gas_price_gwei gauge`);
            lines.push(`eco_donations_gas_price_gwei ${metrics.gasPrice.standard}`);
        }

        // Alert counts
        const alertCounts = {};
        if (metrics.alertHistory) {
            metrics.alertHistory.forEach(alert => {
                alertCounts[alert.severity] = (alertCounts[alert.severity] || 0) + 1;
            });

            lines.push(`# HELP eco_donations_alerts_total Total number of alerts by severity`);
            lines.push(`# TYPE eco_donations_alerts_total counter`);

            for (const [severity, count] of Object.entries(alertCounts)) {
                lines.push(`eco_donations_alerts_total{severity="${severity}"} ${count}`);
            }
        }

        return lines.join('\n') + '\n';
    }

    async start() {
        try {
            // Initialize monitoring system
            const monitorConfig = {
                checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS) || 30000,
                alertThresholds: {
                    maxGasPrice: parseInt(process.env.MAX_GAS_PRICE_GWEI) || 100,
                    minBalance: parseFloat(process.env.MIN_WALLET_BALANCE_ETH) || 0.1,
                    maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME_MS) || 5000
                },
                contracts: {
                    'Donation': process.env.DONATION_CONTRACT_ADDRESS,
                    'EcoCoin': process.env.ECOCOIN_CONTRACT_ADDRESS,
                    'Governance': process.env.GOVERNANCE_CONTRACT_ADDRESS,
                    'MultiSig': process.env.MULTISIG_WALLET_ADDRESS,
                    'AutoDonation': process.env.AUTO_DONATION_CONTRACT_ADDRESS
                },
                walletAddresses: {
                    'Foundation': process.env.FOUNDATION_WALLET,
                    'Treasury': process.env.TREASURY_WALLET,
                    'Operations': process.env.OPERATIONS_WALLET
                },
                notificationEndpoints: [
                    ...(process.env.SLACK_WEBHOOK_URL ? [{
                        type: 'slack',
                        webhook: process.env.SLACK_WEBHOOK_URL
                    }] : []),
                    ...(process.env.ALERT_EMAIL ? [{
                        type: 'email',
                        to: process.env.ALERT_EMAIL
                    }] : [])
                ],
                web3Provider: process.env.WEB3_PROVIDER_URL,
                frontendUrl: process.env.FRONTEND_URL
            };

            this.monitor = new ProductionMonitor(monitorConfig);

            // Setup monitoring API endpoints
            this.monitor.setupAPIEndpoints(this.app);

            // Start monitoring
            await this.monitor.start();

            // Start server
            this.server = this.app.listen(this.port, () => {
                console.log(`🔍 Monitoring Dashboard: http://localhost:${this.port}`);
                console.log(`📊 Metrics endpoint: http://localhost:${this.port}/metrics`);
                console.log(`💚 Health check: http://localhost:${this.port}/health`);
                console.log('');
                console.log('🔐 Dashboard credentials:');
                console.log(`   Username: ${process.env.DASHBOARD_USERNAME || 'admin'}`);
                console.log(`   Password: ${process.env.DASHBOARD_PASSWORD || '[set in .env]'}`);
            });

        } catch (error) {
            console.error('Failed to start monitoring server:', error);
            process.exit(1);
        }
    }

    async stop() {
        if (this.monitor) {
            await this.monitor.stop();
        }

        if (this.server) {
            this.server.close();
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down monitoring server...');
    if (global.monitoringServer) {
        await global.monitoringServer.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    if (global.monitoringServer) {
        await global.monitoringServer.stop();
    }
    process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
    const server = new MonitoringServer();
    global.monitoringServer = server;
    server.start().catch(console.error);
}

module.exports = MonitoringServer;
