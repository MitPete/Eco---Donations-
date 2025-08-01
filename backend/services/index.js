/**
 * Service Manager
 * Coordinates all backend services and provides unified interface
 */
class ServiceManager {
  constructor(config = {}) {
    this.config = config;
    this.services = {};
    this.serviceStatus = {};
    this.initialized = false;
    this.healthCheckInterval = null;
  }

  /**
   * Initialize all services
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Service Manager...');

      // Import service classes
      const BlockchainService = require('./blockchain.service');
      const AnalyticsService = require('./analytics.service');
      const DatabaseService = require('./database.service');
      const NotificationService = require('./notification.service');
      const SecurityService = require('./security.service');

      // Initialize database service first
      this.services.database = new DatabaseService({
        type: this.config.database?.type || 'memory',
        dataFile: this.config.database?.dataFile,
        backupInterval: this.config.database?.backupInterval,
        cacheMaxSize: this.config.database?.cacheMaxSize || 1000
      });
      await this.services.database.initialize();

      // Initialize blockchain service
      this.services.blockchain = new BlockchainService({
        rpcUrl: this.config.blockchain?.rpcUrl || 'http://localhost:8545',
        contracts: this.config.blockchain?.contracts || {},
        networkId: this.config.blockchain?.networkId || 31337
      });
      await this.services.blockchain.initialize();

      // Initialize security service
      this.services.security = new SecurityService({
        largeAmountThreshold: this.config.security?.largeAmountThreshold || 10,
        autoBlock: this.config.security?.autoBlock || false,
        rateLimit: this.config.security?.rateLimit || 5
      });
      await this.services.security.initialize();

      // Initialize analytics service
      this.services.analytics = new AnalyticsService({
        updateInterval: this.config.analytics?.updateInterval || 60000,
        historyLimit: this.config.analytics?.historyLimit || 1000
      });
      await this.services.analytics.initialize();

      // Initialize notification service
      this.services.notification = new NotificationService({
        email: this.config.notification?.email || { enabled: false },
        sms: this.config.notification?.sms || { enabled: false },
        push: this.config.notification?.push || { enabled: false },
        frontendUrl: this.config.frontendUrl || 'http://localhost:3000',
        rateLimit: this.config.notification?.rateLimit || 5
      });
      await this.services.notification.initialize();

      // Set up service connections
      await this.connectServices();

      // Start health monitoring
      this.startHealthMonitoring();

      this.initialized = true;
      console.log('✅ All services initialized successfully');

      return this.getServiceStatus();
    } catch (error) {
      console.error('❌ Service Manager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Connect services and set up event handlers
   */
  async connectServices() {
    try {
      // Connect blockchain events to other services
      this.services.blockchain.on('donation', async (donationData) => {
        try {
          // Security monitoring
          const securityEvent = await this.services.security.monitorTransaction(donationData);

          // Only proceed if security check passes
          if (securityEvent.riskLevel !== 'critical') {
            // Save to database
            await this.services.database.saveDonation(donationData);

            // Update analytics
            await this.services.analytics.recordDonation(donationData);

            // Send notifications
            await this.services.notification.notifyDonationReceived(donationData);
          } else {
            console.log(`🛑 Donation blocked due to security risk: ${donationData.txHash}`);
          }
        } catch (error) {
          console.error('Error processing donation event:', error);
        }
      });

      this.services.blockchain.on('proposal', async (proposalData) => {
        try {
          // Security monitoring for governance
          await this.services.security.monitorGovernance(proposalData, 'create');

          // Save to database
          await this.services.database.saveProposal(proposalData);

          // Update analytics
          await this.services.analytics.recordProposal(proposalData);

          // Send notifications
          await this.services.notification.notifyProposalCreated(proposalData);
        } catch (error) {
          console.error('Error processing proposal event:', error);
        }
      });

      this.services.blockchain.on('proposalStatusChange', async (proposalData, newStatus) => {
        try {
          // Update database
          await this.services.database.updateProposal(proposalData.id, { state: newStatus });

          // Update analytics
          await this.services.analytics.updateProposalStatus(proposalData.id, newStatus);

          // Send notifications
          await this.services.notification.notifyProposalStatusChange(proposalData, newStatus);
        } catch (error) {
          console.error('Error processing proposal status change:', error);
        }
      });

      // Connect analytics to database for historical data
      this.services.analytics.setDatabaseService(this.services.database);

      console.log('🔗 Services connected successfully');
    } catch (error) {
      console.error('Error connecting services:', error);
      throw error;
    }
  }

  /**
   * Start health monitoring for all services
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      await this.updateServiceStatus();
    }, 30000); // Check every 30 seconds

    console.log('❤️ Health monitoring started');
  }

  /**
   * Update status of all services
   */
  async updateServiceStatus() {
    try {
      for (const [serviceName, service] of Object.entries(this.services)) {
        if (service && typeof service.healthCheck === 'function') {
          try {
            this.serviceStatus[serviceName] = await service.healthCheck();
          } catch (error) {
            this.serviceStatus[serviceName] = {
              status: 'error',
              error: error.message,
              timestamp: new Date().toISOString()
            };
          }
        }
      }
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  }

  /**
   * Get overall service status
   */
  async getServiceStatus() {
    await this.updateServiceStatus();

    const overallStatus = Object.values(this.serviceStatus).every(status =>
      ['healthy', 'monitoring', 'connected'].includes(status.status)
    ) ? 'healthy' : 'degraded';

    return {
      overall: overallStatus,
      initialized: this.initialized,
      services: this.serviceStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get specific service
   */
  getService(serviceName) {
    if (!this.initialized) {
      throw new Error('Service Manager not initialized');
    }

    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    return service;
  }

  /**
   * Process donation transaction
   */
  async processDonation(txHash) {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      // Get transaction details from blockchain
      const donationData = await this.services.blockchain.getDonationDetails(txHash);

      if (!donationData) {
        throw new Error('Donation transaction not found');
      }

      // Security check
      const securityEvent = await this.services.security.monitorTransaction(donationData);

      if (securityEvent.riskLevel === 'critical') {
        throw new Error('Transaction blocked due to security concerns');
      }

      // Save to database
      const savedDonation = await this.services.database.saveDonation(donationData);

      // Update analytics
      await this.services.analytics.recordDonation(donationData);

      // Send notifications
      await this.services.notification.notifyDonationReceived(donationData);

      return {
        success: true,
        donation: savedDonation,
        security: {
          riskLevel: securityEvent.riskLevel,
          riskScore: securityEvent.riskScore
        }
      };
    } catch (error) {
      console.error('Error processing donation:', error);
      throw error;
    }
  }

  /**
   * Get user profile with all related data
   */
  async getUserProfile(address) {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      // Get user data from database
      const user = await this.services.database.getUser(address);

      // Get user donations
      const donations = await this.services.database.getUserDonations(address);

      // Get security report
      const securityReport = await this.services.security.getAddressSecurityReport(address);

      // Get analytics for user
      const userAnalytics = await this.services.analytics.getUserAnalytics(address);

      return {
        user: user || { address },
        donations,
        security: securityReport,
        analytics: userAnalytics,
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData() {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      // Get analytics data
      const analytics = await this.services.analytics.getAnalytics();

      // Get security dashboard
      const security = await this.services.security.getSecurityDashboard();

      // Get database stats
      const dbStats = await this.services.database.getStats();

      // Get blockchain status
      const blockchain = await this.services.blockchain.getNetworkStatus();

      // Get notification stats
      const notifications = await this.services.notification.getStats();

      return {
        analytics,
        security,
        database: dbStats,
        blockchain,
        notifications,
        services: await this.getServiceStatus()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to notifications
   */
  async subscribeToNotifications(address, preferences) {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      // Subscribe to notifications
      const subscription = await this.services.notification.subscribe(address, preferences);

      // Save user preferences to database
      await this.services.database.saveUser(address, {
        notificationPreferences: preferences,
        subscribedAt: new Date().toISOString()
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Search across all services
   */
  async search(query, filters = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      const results = {
        users: [],
        donations: [],
        proposals: [],
        security: []
      };

      // Search database
      if (!filters.service || filters.service === 'database') {
        const dbResults = await this.services.database.search(query, filters.type);

        for (const result of dbResults) {
          if (results[result.type + 's']) {
            results[result.type + 's'].push(result.data);
          }
        }
      }

      // Search security events
      if (!filters.service || filters.service === 'security') {
        // Security service would need search implementation
        // Placeholder for now
      }

      return results;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Export service data
   */
  async exportData(format = 'json', filters = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Services not initialized');
      }

      const data = {
        analytics: await this.services.analytics.getAnalytics(),
        security: await this.services.security.getSecurityDashboard(),
        database: await this.services.database.getStats(),
        timestamp: new Date().toISOString()
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        // Would implement CSV conversion
        throw new Error('CSV export not implemented yet');
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown() {
    try {
      console.log('🛑 Shutting down Service Manager...');

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Shutdown services in reverse order
      const serviceNames = Object.keys(this.services).reverse();

      for (const serviceName of serviceNames) {
        const service = this.services[serviceName];
        if (service && typeof service.shutdown === 'function') {
          try {
            await service.shutdown();
            console.log(`✅ ${serviceName} service shut down`);
          } catch (error) {
            console.error(`❌ Error shutting down ${serviceName}:`, error);
          }
        }
      }

      this.initialized = false;
      this.services = {};
      this.serviceStatus = {};

      console.log('✅ Service Manager shut down complete');
    } catch (error) {
      console.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Restart specific service
   */
  async restartService(serviceName) {
    try {
      if (!this.services[serviceName]) {
        throw new Error(`Service '${serviceName}' not found`);
      }

      console.log(`🔄 Restarting ${serviceName} service...`);

      // Shutdown service
      const service = this.services[serviceName];
      if (typeof service.shutdown === 'function') {
        await service.shutdown();
      }

      // Reinitialize service
      if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      console.log(`✅ ${serviceName} service restarted`);
      return await this.getServiceStatus();
    } catch (error) {
      console.error(`Error restarting ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      ...this.config,
      initialized: this.initialized,
      services: Object.keys(this.services)
    };
  }

  /**
   * Update service configuration
   */
  async updateConfig(updates) {
    try {
      this.config = { ...this.config, ...updates };

      // Update individual service configs if needed
      for (const [serviceName, serviceConfig] of Object.entries(updates)) {
        if (this.services[serviceName] && typeof this.services[serviceName].updateConfig === 'function') {
          await this.services[serviceName].updateConfig(serviceConfig);
        }
      }

      console.log('🔧 Service Manager configuration updated');
      return this.config;
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }
}

module.exports = ServiceManager;
