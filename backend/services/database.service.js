/**
 * Database Service
 * Handles data persistence, caching, and database operations
 */
class DatabaseService {
  constructor(config) {
    this.config = config;
    this.connected = false;
    this.cache = new Map();
    this.storage = new Map(); // In-memory storage for development
    this.indexes = {
      users: new Map(),
      donations: new Map(),
      proposals: new Map()
    };
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      // In production, this would connect to MongoDB, PostgreSQL, etc.
      // For now, using in-memory storage with file backup option

      if (this.config.type === 'file' && this.config.dataFile) {
        await this.loadFromFile();
      }

      this.connected = true;
      console.log('✅ Database service initialized');

      // Setup periodic backup if file storage enabled
      if (this.config.backupInterval && this.config.dataFile) {
        this.setupBackupSchedule();
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Save user profile data
   */
  async saveUser(address, userData) {
    try {
      const userId = address.toLowerCase();
      const user = {
        address: userId,
        ...userData,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.storage.set(`user:${userId}`, user);
      this.indexes.users.set(userId, Date.now());

      // Cache user data
      this.cache.set(`user:${userId}`, user);

      console.log(`💾 User ${userId} saved to database`);
      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  async getUser(address) {
    try {
      const userId = address.toLowerCase();

      // Check cache first
      if (this.cache.has(`user:${userId}`)) {
        return this.cache.get(`user:${userId}`);
      }

      // Get from storage
      const user = this.storage.get(`user:${userId}`);
      if (user) {
        this.cache.set(`user:${userId}`, user);
      }

      return user || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Save donation record
   */
  async saveDonation(donationData) {
    try {
      const donation = {
        id: `${donationData.txHash}_${donationData.donor}`,
        ...donationData,
        createdAt: new Date().toISOString()
      };

      this.storage.set(`donation:${donation.id}`, donation);
      this.indexes.donations.set(donation.id, {
        donor: donationData.donor.toLowerCase(),
        foundation: donationData.foundation,
        timestamp: Date.now(),
        amount: parseFloat(donationData.amount)
      });

      console.log(`💾 Donation ${donation.id} saved to database`);
      return donation;
    } catch (error) {
      console.error('Error saving donation:', error);
      throw error;
    }
  }

  /**
   * Get donations by user
   */
  async getUserDonations(address, limit = 50, offset = 0) {
    try {
      const userId = address.toLowerCase();
      const donations = [];

      for (const [donationId, indexData] of this.indexes.donations.entries()) {
        if (indexData.donor === userId) {
          const donation = this.storage.get(`donation:${donationId}`);
          if (donation) {
            donations.push(donation);
          }
        }
      }

      // Sort by timestamp, most recent first
      donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return donations.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting user donations:', error);
      throw error;
    }
  }

  /**
   * Get donations by foundation
   */
  async getFoundationDonations(foundationId, limit = 100, offset = 0) {
    try {
      const donations = [];

      for (const [donationId, indexData] of this.indexes.donations.entries()) {
        if (indexData.foundation.toString() === foundationId.toString()) {
          const donation = this.storage.get(`donation:${donationId}`);
          if (donation) {
            donations.push(donation);
          }
        }
      }

      donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return donations.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting foundation donations:', error);
      throw error;
    }
  }

  /**
   * Save governance proposal
   */
  async saveProposal(proposalData) {
    try {
      const proposal = {
        id: proposalData.id,
        ...proposalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.storage.set(`proposal:${proposal.id}`, proposal);
      this.indexes.proposals.set(proposal.id, {
        proposer: proposalData.proposer.toLowerCase(),
        state: proposalData.state,
        timestamp: Date.now()
      });

      console.log(`💾 Proposal ${proposal.id} saved to database`);
      return proposal;
    } catch (error) {
      console.error('Error saving proposal:', error);
      throw error;
    }
  }

  /**
   * Update proposal status
   */
  async updateProposal(proposalId, updates) {
    try {
      const existing = this.storage.get(`proposal:${proposalId}`);
      if (!existing) {
        throw new Error(`Proposal ${proposalId} not found`);
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.storage.set(`proposal:${proposalId}`, updated);

      // Update index
      const indexData = this.indexes.proposals.get(proposalId);
      if (indexData && updates.state) {
        indexData.state = updates.state;
      }

      console.log(`📝 Proposal ${proposalId} updated`);
      return updated;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  }

  /**
   * Get all proposals
   */
  async getProposals(limit = 50, offset = 0, filter = {}) {
    try {
      const proposals = [];

      for (const [proposalId, indexData] of this.indexes.proposals.entries()) {
        // Apply filters
        if (filter.proposer && indexData.proposer !== filter.proposer.toLowerCase()) {
          continue;
        }
        if (filter.state && indexData.state !== filter.state) {
          continue;
        }

        const proposal = this.storage.get(`proposal:${proposalId}`);
        if (proposal) {
          proposals.push(proposal);
        }
      }

      proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return proposals.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting proposals:', error);
      throw error;
    }
  }

  /**
   * Save analytics snapshot
   */
  async saveAnalyticsSnapshot(data) {
    try {
      const snapshot = {
        id: `analytics_${Date.now()}`,
        data,
        timestamp: new Date().toISOString()
      };

      this.storage.set(`analytics:${snapshot.id}`, snapshot);
      console.log(`📊 Analytics snapshot ${snapshot.id} saved`);
      return snapshot;
    } catch (error) {
      console.error('Error saving analytics snapshot:', error);
      throw error;
    }
  }

  /**
   * Get recent analytics snapshots
   */
  async getAnalyticsHistory(limit = 24) {
    try {
      const snapshots = [];

      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith('analytics:')) {
          snapshots.push(value);
        }
      }

      snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return snapshots.slice(0, limit);
    } catch (error) {
      console.error('Error getting analytics history:', error);
      throw error;
    }
  }

  /**
   * Search functionality
   */
  async search(query, type = 'all', limit = 20) {
    try {
      const results = [];
      const searchTerm = query.toLowerCase();

      if (type === 'all' || type === 'users') {
        for (const [key, user] of this.storage.entries()) {
          if (key.startsWith('user:') &&
              (user.address.toLowerCase().includes(searchTerm) ||
               (user.name && user.name.toLowerCase().includes(searchTerm)))) {
            results.push({ type: 'user', data: user });
          }
        }
      }

      if (type === 'all' || type === 'donations') {
        for (const [key, donation] of this.storage.entries()) {
          if (key.startsWith('donation:') && donation.txHash.toLowerCase().includes(searchTerm)) {
            results.push({ type: 'donation', data: donation });
          }
        }
      }

      if (type === 'all' || type === 'proposals') {
        for (const [key, proposal] of this.storage.entries()) {
          if (key.startsWith('proposal:') &&
              (proposal.description.toLowerCase().includes(searchTerm) ||
               proposal.proposer.toLowerCase().includes(searchTerm))) {
            results.push({ type: 'proposal', data: proposal });
          }
        }
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const stats = {
        users: 0,
        donations: 0,
        proposals: 0,
        analytics: 0,
        totalRecords: this.storage.size,
        cacheSize: this.cache.size,
        connected: this.connected
      };

      for (const key of this.storage.keys()) {
        if (key.startsWith('user:')) stats.users++;
        else if (key.startsWith('donation:')) stats.donations++;
        else if (key.startsWith('proposal:')) stats.proposals++;
        else if (key.startsWith('analytics:')) stats.analytics++;
      }

      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Database cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.cacheMaxSize || 1000,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  /**
   * File backup operations
   */
  async loadFromFile() {
    try {
      if (this.config.dataFile) {
        const fs = require('fs').promises;
        const data = await fs.readFile(this.config.dataFile, 'utf8');
        const parsed = JSON.parse(data);

        // Restore storage
        this.storage = new Map(parsed.storage);

        // Rebuild indexes
        this.rebuildIndexes();

        console.log(`📁 Data loaded from ${this.config.dataFile}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading from file:', error);
      }
    }
  }

  async saveToFile() {
    try {
      if (this.config.dataFile) {
        const fs = require('fs').promises;
        const data = {
          storage: Array.from(this.storage.entries()),
          timestamp: new Date().toISOString()
        };

        await fs.writeFile(this.config.dataFile, JSON.stringify(data, null, 2));
        console.log(`💾 Data saved to ${this.config.dataFile}`);
      }
    } catch (error) {
      console.error('Error saving to file:', error);
    }
  }

  setupBackupSchedule() {
    setInterval(() => {
      this.saveToFile();
    }, this.config.backupInterval || 300000); // Default 5 minutes

    console.log(`🔄 Backup schedule set for every ${(this.config.backupInterval || 300000) / 1000} seconds`);
  }

  rebuildIndexes() {
    this.indexes = {
      users: new Map(),
      donations: new Map(),
      proposals: new Map()
    };

    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('user:')) {
        this.indexes.users.set(value.address, Date.now());
      } else if (key.startsWith('donation:')) {
        this.indexes.donations.set(value.id, {
          donor: value.donor.toLowerCase(),
          foundation: value.foundation,
          timestamp: new Date(value.createdAt).getTime(),
          amount: parseFloat(value.amount)
        });
      } else if (key.startsWith('proposal:')) {
        this.indexes.proposals.set(value.id, {
          proposer: value.proposer.toLowerCase(),
          state: value.state,
          timestamp: new Date(value.createdAt).getTime()
        });
      }
    }

    console.log('🔧 Database indexes rebuilt');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const stats = await this.getStats();
      return {
        status: this.connected ? 'healthy' : 'disconnected',
        stats,
        cache: this.getCacheStats(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cleanup old records
   */
  async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    try {
      const cutoff = Date.now() - maxAge;
      let cleaned = 0;

      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith('analytics:')) {
          const recordTime = new Date(value.timestamp).getTime();
          if (recordTime < cutoff) {
            this.storage.delete(key);
            cleaned++;
          }
        }
      }

      console.log(`🧹 Database cleanup: removed ${cleaned} old records`);
      return cleaned;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;
