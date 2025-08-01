const EventEmitter = require('events');

/**
 * Analytics Service
 * Handles data analytics, metrics collection, and reporting
 */
class AnalyticsService extends EventEmitter {
  constructor(blockchainService, databaseService) {
    super();
    this.blockchain = blockchainService;
    this.database = databaseService;
    this.metrics = {
      donations: new Map(),
      users: new Map(),
      foundations: new Map(),
      governance: new Map(),
      realtime: {
        totalDonations: 0,
        totalVolume: 0,
        activeUsers: new Set(),
        recentActivity: []
      }
    };

    this.setupEventListeners();
  }

  /**
   * Setup blockchain event listeners for real-time analytics
   */
  setupEventListeners() {
    this.blockchain.on('donation', (data) => {
      this.processDonationEvent(data);
    });

    this.blockchain.on('autoDonation', (data) => {
      this.processAutoDonationEvent(data);
    });

    this.blockchain.on('proposal', (data) => {
      this.processProposalEvent(data);
    });
  }

  /**
   * Process donation events for analytics
   */
  processDonationEvent(data) {
    const { donor, foundation, amount, ecoReward, txHash } = data;

    // Update real-time metrics
    this.metrics.realtime.totalDonations++;
    this.metrics.realtime.totalVolume += parseFloat(amount);
    this.metrics.realtime.activeUsers.add(donor);

    // Add to recent activity
    this.metrics.realtime.recentActivity.unshift({
      type: 'donation',
      donor,
      foundation,
      amount,
      timestamp: Date.now(),
      txHash
    });

    // Keep only last 100 activities
    if (this.metrics.realtime.recentActivity.length > 100) {
      this.metrics.realtime.recentActivity.pop();
    }

    // Update foundation metrics
    if (!this.metrics.foundations.has(foundation)) {
      this.metrics.foundations.set(foundation, {
        totalDonations: 0,
        totalVolume: 0,
        uniqueDonors: new Set()
      });
    }

    const foundationData = this.metrics.foundations.get(foundation);
    foundationData.totalDonations++;
    foundationData.totalVolume += parseFloat(amount);
    foundationData.uniqueDonors.add(donor);

    // Update user metrics
    if (!this.metrics.users.has(donor)) {
      this.metrics.users.set(donor, {
        totalDonations: 0,
        totalVolume: 0,
        ecoEarned: 0,
        firstDonation: Date.now(),
        lastActivity: Date.now()
      });
    }

    const userData = this.metrics.users.get(donor);
    userData.totalDonations++;
    userData.totalVolume += parseFloat(amount);
    userData.ecoEarned += parseFloat(ecoReward);
    userData.lastActivity = Date.now();

    // Emit analytics event
    this.emit('donationAnalytics', {
      type: 'donation',
      data: {
        donor,
        foundation,
        amount,
        totalDonations: this.metrics.realtime.totalDonations,
        totalVolume: this.metrics.realtime.totalVolume
      }
    });
  }

  /**
   * Process auto-donation events
   */
  processAutoDonationEvent(data) {
    const { user, amount, foundation, txHash } = data;

    this.metrics.realtime.recentActivity.unshift({
      type: 'autoDonation',
      user,
      foundation,
      amount,
      timestamp: Date.now(),
      txHash
    });

    // Update user auto-donation metrics
    if (!this.metrics.users.has(user)) {
      this.metrics.users.set(user, {
        totalDonations: 0,
        totalVolume: 0,
        ecoEarned: 0,
        autoDonations: 0,
        autoVolume: 0,
        firstDonation: Date.now(),
        lastActivity: Date.now()
      });
    }

    const userData = this.metrics.users.get(user);
    userData.autoDonations = (userData.autoDonations || 0) + 1;
    userData.autoVolume = (userData.autoVolume || 0) + parseFloat(amount);
    userData.lastActivity = Date.now();

    this.emit('autoDonationAnalytics', { user, amount, foundation });
  }

  /**
   * Process governance proposal events
   */
  processProposalEvent(data) {
    const { id, proposer, description, txHash } = data;

    this.metrics.realtime.recentActivity.unshift({
      type: 'proposal',
      proposer,
      proposalId: id,
      description: description.substring(0, 100) + '...',
      timestamp: Date.now(),
      txHash
    });

    // Update governance metrics
    if (!this.metrics.governance.has('proposals')) {
      this.metrics.governance.set('proposals', {
        total: 0,
        creators: new Set()
      });
    }

    const govData = this.metrics.governance.get('proposals');
    govData.total++;
    govData.creators.add(proposer);

    this.emit('governanceAnalytics', { proposer, proposalId: id });
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeDashboard() {
    return {
      totalDonations: this.metrics.realtime.totalDonations,
      totalVolume: Math.round(this.metrics.realtime.totalVolume * 1000) / 1000,
      activeUsers: this.metrics.realtime.activeUsers.size,
      recentActivity: this.metrics.realtime.recentActivity.slice(0, 20),
      topFoundations: this.getTopFoundations(),
      userGrowth: this.getUserGrowthStats(),
      timestamp: Date.now()
    };
  }

  /**
   * Get foundation analytics
   */
  getFoundationAnalytics() {
    const foundationNames = ['SaveTheOceans', 'ProtectTheRainforest', 'CleanEnergy', 'WildlifeProtection', 'ClimateAction'];

    return Array.from(this.metrics.foundations.entries()).map(([id, data]) => ({
      id: parseInt(id),
      name: foundationNames[parseInt(id)] || `Foundation ${id}`,
      totalDonations: data.totalDonations,
      totalVolume: Math.round(data.totalVolume * 1000) / 1000,
      uniqueDonors: data.uniqueDonors.size,
      averageDonation: data.totalDonations > 0 ?
        Math.round((data.totalVolume / data.totalDonations) * 1000) / 1000 : 0
    })).sort((a, b) => b.totalVolume - a.totalVolume);
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(limit = 100) {
    return Array.from(this.metrics.users.entries())
      .map(([address, data]) => ({
        address,
        totalDonations: data.totalDonations,
        totalVolume: Math.round(data.totalVolume * 1000) / 1000,
        ecoEarned: Math.round(data.ecoEarned * 1000) / 1000,
        autoDonations: data.autoDonations || 0,
        autoVolume: Math.round((data.autoVolume || 0) * 1000) / 1000,
        daysSinceFirst: Math.floor((Date.now() - data.firstDonation) / (1000 * 60 * 60 * 24)),
        daysSinceLast: Math.floor((Date.now() - data.lastActivity) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }

  /**
   * Get governance analytics
   */
  getGovernanceAnalytics() {
    const proposalsData = this.metrics.governance.get('proposals') || { total: 0, creators: new Set() };

    return {
      totalProposals: proposalsData.total,
      uniqueCreators: proposalsData.creators.size,
      averageProposalsPerCreator: proposalsData.creators.size > 0 ?
        Math.round((proposalsData.total / proposalsData.creators.size) * 100) / 100 : 0
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateReport(timeframe = '24h') {
    const endTime = Date.now();
    const startTime = this.getStartTimeForTimeframe(endTime, timeframe);

    // Filter activities by timeframe
    const periodActivity = this.metrics.realtime.recentActivity.filter(
      activity => activity.timestamp >= startTime && activity.timestamp <= endTime
    );

    const report = {
      timeframe,
      period: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString()
      },
      summary: {
        totalDonations: this.metrics.realtime.totalDonations,
        totalVolume: Math.round(this.metrics.realtime.totalVolume * 1000) / 1000,
        activeUsers: this.metrics.realtime.activeUsers.size,
        periodActivity: periodActivity.length
      },
      foundations: this.getFoundationAnalytics(),
      topUsers: this.getUserAnalytics(10),
      governance: this.getGovernanceAnalytics(),
      trends: this.calculateTrends(periodActivity),
      recentActivity: periodActivity.slice(0, 50)
    };

    // Add blockchain data if available
    try {
      const blockchainStats = await this.getBlockchainAnalytics();
      report.blockchain = blockchainStats;
    } catch (error) {
      console.error('Error fetching blockchain analytics:', error);
    }

    return report;
  }

  /**
   * Get blockchain-specific analytics
   */
  async getBlockchainAnalytics() {
    try {
      const networkStatus = await this.blockchain.getNetworkStatus();
      const foundationStats = await this.blockchain.getFoundationStats();

      return {
        network: networkStatus,
        foundations: foundationStats,
        contracts: {
          donation: this.blockchain.contracts.donation?.address,
          ecoCoin: this.blockchain.contracts.ecoCoin?.address,
          governance: this.blockchain.contracts.governance?.address,
          autoDonation: this.blockchain.contracts.autoDonation?.address
        }
      };
    } catch (error) {
      console.error('Error getting blockchain analytics:', error);
      return null;
    }
  }

  /**
   * Calculate trends from activity data
   */
  calculateTrends(activities) {
    const hourlyActivity = new Map();

    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      if (!hourlyActivity.has(hour)) {
        hourlyActivity.set(hour, { donations: 0, volume: 0 });
      }

      const hourData = hourlyActivity.get(hour);
      if (activity.type === 'donation' || activity.type === 'autoDonation') {
        hourData.donations++;
        hourData.volume += parseFloat(activity.amount);
      }
    });

    return {
      hourlyActivity: Array.from(hourlyActivity.entries()).map(([hour, data]) => ({
        hour,
        donations: data.donations,
        volume: Math.round(data.volume * 1000) / 1000
      })),
      peakHour: this.findPeakHour(hourlyActivity),
      growthRate: this.calculateGrowthRate(activities)
    };
  }

  /**
   * Helper methods
   */
  getTopFoundations(limit = 5) {
    return this.getFoundationAnalytics().slice(0, limit);
  }

  getUserGrowthStats() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    let newUsersToday = 0;
    let newUsersThisWeek = 0;
    let activeToday = 0;

    this.metrics.users.forEach((userData) => {
      if (userData.firstDonation >= oneDayAgo) newUsersToday++;
      if (userData.firstDonation >= oneWeekAgo) newUsersThisWeek++;
      if (userData.lastActivity >= oneDayAgo) activeToday++;
    });

    return {
      newUsersToday,
      newUsersThisWeek,
      activeToday,
      totalUsers: this.metrics.users.size
    };
  }

  getStartTimeForTimeframe(endTime, timeframe) {
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    return endTime - (timeframes[timeframe] || timeframes['24h']);
  }

  findPeakHour(hourlyActivity) {
    let peakHour = 0;
    let maxActivity = 0;

    hourlyActivity.forEach((data, hour) => {
      if (data.donations > maxActivity) {
        maxActivity = data.donations;
        peakHour = hour;
      }
    });

    return { hour: peakHour, activity: maxActivity };
  }

  calculateGrowthRate(activities) {
    if (activities.length < 2) return 0;

    const midpoint = Math.floor(activities.length / 2);
    const firstHalf = activities.slice(0, midpoint).length;
    const secondHalf = activities.slice(midpoint).length;

    if (firstHalf === 0) return 0;

    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  }

  /**
   * Reset metrics (for testing or maintenance)
   */
  resetMetrics() {
    this.metrics = {
      donations: new Map(),
      users: new Map(),
      foundations: new Map(),
      governance: new Map(),
      realtime: {
        totalDonations: 0,
        totalVolume: 0,
        activeUsers: new Set(),
        recentActivity: []
      }
    };

    console.log('📊 Analytics metrics reset');
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      foundations: Array.from(this.metrics.foundations.entries()),
      users: Array.from(this.metrics.users.entries()).map(([address, data]) => [
        address,
        { ...data, uniqueDonors: undefined } // Remove Set objects
      ]),
      governance: Array.from(this.metrics.governance.entries()),
      realtime: {
        ...this.metrics.realtime,
        activeUsers: Array.from(this.metrics.realtime.activeUsers)
      },
      exportTime: Date.now()
    };
  }
}

module.exports = AnalyticsService;
