/**
 * Security Monitoring Service
 * Handles security monitoring, threat detection, and security analytics
 */
class SecurityService {
  constructor(config) {
    this.config = config;
    this.securityEvents = [];
    this.alertRules = new Map();
    this.threatPatterns = new Map();
    this.rateLimiters = new Map();
    this.suspiciousAddresses = new Set();
    this.securityMetrics = {
      totalEvents: 0,
      alerts: 0,
      blockedTransactions: 0,
      suspiciousActivity: 0
    };
    this.monitoring = false;
  }

  /**
   * Initialize security monitoring
   */
  async initialize() {
    try {
      this.setupSecurityRules();
      this.setupThreatPatterns();
      this.startMonitoring();

      console.log('🛡️ Security monitoring service initialized');
    } catch (error) {
      console.error('❌ Security service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup security alert rules
   */
  setupSecurityRules() {
    // Large donation alerts
    this.alertRules.set('large_donation', {
      type: 'amount_threshold',
      threshold: this.config.largeAmountThreshold || 10, // 10 ETH
      severity: 'medium',
      action: 'alert'
    });

    // Rapid donation alerts
    this.alertRules.set('rapid_donations', {
      type: 'frequency',
      maxCount: 5,
      timeWindow: 300000, // 5 minutes
      severity: 'high',
      action: 'alert_and_limit'
    });

    // Suspicious foundation activity
    this.alertRules.set('foundation_anomaly', {
      type: 'behavioral',
      threshold: 3, // Standard deviations
      severity: 'high',
      action: 'alert'
    });

    // Failed transaction patterns
    this.alertRules.set('failed_tx_pattern', {
      type: 'failure_rate',
      maxFailures: 5,
      timeWindow: 600000, // 10 minutes
      severity: 'medium',
      action: 'monitor'
    });

    // Governance manipulation attempts
    this.alertRules.set('governance_manipulation', {
      type: 'governance',
      rapidProposals: 3,
      timeWindow: 3600000, // 1 hour
      severity: 'critical',
      action: 'alert_and_block'
    });

    console.log(`🔒 ${this.alertRules.size} security rules configured`);
  }

  /**
   * Setup threat detection patterns
   */
  setupThreatPatterns() {
    // MEV bot detection
    this.threatPatterns.set('mev_bot', {
      pattern: 'rapid_sequential_txs',
      indicators: ['same_block_transactions', 'gas_price_manipulation'],
      riskLevel: 'medium'
    });

    // Sybil attack detection
    this.threatPatterns.set('sybil_attack', {
      pattern: 'multiple_addresses_same_source',
      indicators: ['funding_correlation', 'timing_correlation'],
      riskLevel: 'high'
    });

    // Flash loan attacks
    this.threatPatterns.set('flash_loan', {
      pattern: 'complex_defi_interaction',
      indicators: ['lending_protocol_interaction', 'large_temporary_balance'],
      riskLevel: 'critical'
    });

    // Phishing attempts
    this.threatPatterns.set('phishing', {
      pattern: 'approval_farming',
      indicators: ['excessive_approvals', 'unknown_contracts'],
      riskLevel: 'high'
    });

    console.log(`🎯 ${this.threatPatterns.size} threat patterns loaded`);
  }

  /**
   * Monitor transaction for security issues
   */
  async monitorTransaction(txData) {
    try {
      const securityEvent = {
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'transaction_monitor',
        timestamp: new Date().toISOString(),
        txHash: txData.hash,
        from: txData.from,
        to: txData.to,
        value: txData.value,
        gasPrice: txData.gasPrice,
        data: txData.data,
        alerts: [],
        riskScore: 0
      };

      // Check amount threshold
      await this.checkAmountThreshold(securityEvent, txData);

      // Check frequency patterns
      await this.checkFrequencyPatterns(securityEvent, txData);

      // Check against known threat patterns
      await this.checkThreatPatterns(securityEvent, txData);

      // Check address reputation
      await this.checkAddressReputation(securityEvent, txData);

      // Calculate overall risk score
      this.calculateRiskScore(securityEvent);

      // Store security event
      this.securityEvents.push(securityEvent);
      this.securityMetrics.totalEvents++;

      // Process alerts if any
      if (securityEvent.alerts.length > 0) {
        await this.processSecurityAlerts(securityEvent);
      }

      return securityEvent;
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      throw error;
    }
  }

  /**
   * Check amount threshold alerts
   */
  async checkAmountThreshold(event, txData) {
    const rule = this.alertRules.get('large_donation');
    const amount = parseFloat(txData.value || 0);

    if (amount >= rule.threshold) {
      event.alerts.push({
        type: 'large_donation',
        severity: rule.severity,
        message: `Large donation amount detected: ${amount} ETH`,
        threshold: rule.threshold,
        actualValue: amount
      });

      event.riskScore += 30;
    }
  }

  /**
   * Check frequency patterns
   */
  async checkFrequencyPatterns(event, txData) {
    const rule = this.alertRules.get('rapid_donations');
    const address = txData.from.toLowerCase();
    const now = Date.now();

    // Get rate limiter for address
    if (!this.rateLimiters.has(address)) {
      this.rateLimiters.set(address, []);
    }

    const transactions = this.rateLimiters.get(address);

    // Remove old transactions outside time window
    const cutoff = now - rule.timeWindow;
    const recentTxs = transactions.filter(tx => tx.timestamp > cutoff);

    // Add current transaction
    recentTxs.push({ timestamp: now, txHash: txData.hash });
    this.rateLimiters.set(address, recentTxs);

    if (recentTxs.length > rule.maxCount) {
      event.alerts.push({
        type: 'rapid_donations',
        severity: rule.severity,
        message: `Rapid donation pattern detected: ${recentTxs.length} transactions in ${rule.timeWindow / 1000} seconds`,
        count: recentTxs.length,
        timeWindow: rule.timeWindow
      });

      event.riskScore += 50;

      if (rule.action === 'alert_and_limit') {
        this.suspiciousAddresses.add(address);
      }
    }
  }

  /**
   * Check threat patterns
   */
  async checkThreatPatterns(event, txData) {
    // Check for MEV bot patterns
    if (await this.detectMEVBot(txData)) {
      event.alerts.push({
        type: 'mev_bot',
        severity: 'medium',
        message: 'Potential MEV bot activity detected',
        pattern: 'rapid_sequential_txs'
      });
      event.riskScore += 25;
    }

    // Check for flash loan patterns
    if (await this.detectFlashLoan(txData)) {
      event.alerts.push({
        type: 'flash_loan',
        severity: 'critical',
        message: 'Potential flash loan attack detected',
        pattern: 'complex_defi_interaction'
      });
      event.riskScore += 80;
    }

    // Check for approval farming
    if (await this.detectApprovalFarming(txData)) {
      event.alerts.push({
        type: 'phishing',
        severity: 'high',
        message: 'Potential approval farming detected',
        pattern: 'excessive_approvals'
      });
      event.riskScore += 60;
    }
  }

  /**
   * Check address reputation
   */
  async checkAddressReputation(event, txData) {
    const fromAddress = txData.from.toLowerCase();
    const toAddress = txData.to?.toLowerCase();

    // Check if address is on suspicious list
    if (this.suspiciousAddresses.has(fromAddress)) {
      event.alerts.push({
        type: 'suspicious_address',
        severity: 'high',
        message: 'Transaction from previously flagged address',
        address: fromAddress
      });
      event.riskScore += 40;
    }

    // Check against known bad addresses (would be external service in production)
    const badAddresses = await this.checkExternalThreatFeeds([fromAddress, toAddress].filter(Boolean));

    for (const badAddress of badAddresses) {
      event.alerts.push({
        type: 'blacklisted_address',
        severity: 'critical',
        message: 'Transaction involving blacklisted address',
        address: badAddress
      });
      event.riskScore += 90;
    }
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(event) {
    // Cap risk score at 100
    event.riskScore = Math.min(event.riskScore, 100);

    // Determine risk level
    if (event.riskScore >= 80) {
      event.riskLevel = 'critical';
    } else if (event.riskScore >= 60) {
      event.riskLevel = 'high';
    } else if (event.riskScore >= 40) {
      event.riskLevel = 'medium';
    } else if (event.riskScore >= 20) {
      event.riskLevel = 'low';
    } else {
      event.riskLevel = 'minimal';
    }
  }

  /**
   * Process security alerts
   */
  async processSecurityAlerts(event) {
    try {
      this.securityMetrics.alerts++;

      for (const alert of event.alerts) {
        console.log(`🚨 Security Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);

        // Critical alerts require immediate action
        if (alert.severity === 'critical') {
          await this.handleCriticalAlert(event, alert);
        }

        // Log alert for audit trail
        await this.logSecurityAlert(event, alert);
      }

      // Notify security team if risk score is high
      if (event.riskScore >= 60) {
        await this.notifySecurityTeam(event);
      }
    } catch (error) {
      console.error('Error processing security alerts:', error);
    }
  }

  /**
   * Handle critical security alerts
   */
  async handleCriticalAlert(event, alert) {
    try {
      // Add to suspicious addresses
      this.suspiciousAddresses.add(event.from.toLowerCase());

      // Block future transactions if configured
      if (this.config.autoBlock && alert.type === 'flash_loan') {
        this.securityMetrics.blockedTransactions++;
        console.log(`🛑 Auto-blocked address: ${event.from}`);
      }

      // Immediate notification
      console.log(`🚨 CRITICAL SECURITY ALERT: ${alert.message}`);

    } catch (error) {
      console.error('Error handling critical alert:', error);
    }
  }

  /**
   * Log security alert for audit
   */
  async logSecurityAlert(event, alert) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      alertType: alert.type,
      severity: alert.severity,
      message: alert.message,
      txHash: event.txHash,
      address: event.from,
      riskScore: event.riskScore
    };

    // In production, this would be sent to a security SIEM system
    console.log('📋 Security audit log:', JSON.stringify(auditLog, null, 2));
  }

  /**
   * Notify security team
   */
  async notifySecurityTeam(event) {
    // In production, this would send alerts to security team via multiple channels
    console.log(`🔔 Security team notified of high-risk transaction: ${event.txHash}`);
  }

  /**
   * Monitor governance activities
   */
  async monitorGovernance(proposalData, action) {
    try {
      const securityEvent = {
        id: `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'governance_monitor',
        timestamp: new Date().toISOString(),
        proposalId: proposalData.id,
        proposer: proposalData.proposer,
        action: action, // 'create', 'vote', 'execute'
        alerts: [],
        riskScore: 0
      };

      // Check for rapid proposal creation
      if (action === 'create') {
        await this.checkRapidProposals(securityEvent, proposalData);
      }

      // Check for vote manipulation
      if (action === 'vote') {
        await this.checkVoteManipulation(securityEvent, proposalData);
      }

      // Store governance event
      this.securityEvents.push(securityEvent);

      return securityEvent;
    } catch (error) {
      console.error('Error monitoring governance:', error);
      throw error;
    }
  }

  /**
   * Check for rapid proposal creation
   */
  async checkRapidProposals(event, proposalData) {
    const rule = this.alertRules.get('governance_manipulation');
    const proposer = proposalData.proposer.toLowerCase();
    const now = Date.now();

    // Count recent proposals by this proposer
    const recentProposals = this.securityEvents.filter(e =>
      e.type === 'governance_monitor' &&
      e.proposer?.toLowerCase() === proposer &&
      e.action === 'create' &&
      (now - new Date(e.timestamp).getTime()) < rule.timeWindow
    );

    if (recentProposals.length >= rule.rapidProposals) {
      event.alerts.push({
        type: 'governance_manipulation',
        severity: rule.severity,
        message: `Rapid proposal creation detected: ${recentProposals.length} proposals in ${rule.timeWindow / 3600000} hours`,
        count: recentProposals.length
      });

      event.riskScore += 70;
      this.suspiciousAddresses.add(proposer);
    }
  }

  /**
   * Check for vote manipulation
   */
  async checkVoteManipulation(event, proposalData) {
    // This would implement sophisticated vote pattern analysis
    // For now, placeholder implementation
    console.log(`🗳️ Monitoring vote for proposal ${proposalData.id}`);
  }

  /**
   * Threat detection methods
   */
  async detectMEVBot(txData) {
    // Simple heuristic: high gas price + rapid transactions
    const gasPrice = parseInt(txData.gasPrice || 0);
    const avgGasPrice = 20000000000; // 20 gwei baseline

    return gasPrice > avgGasPrice * 2; // More than 2x average
  }

  async detectFlashLoan(txData) {
    // Check if transaction data contains flash loan patterns
    const data = txData.data || '';
    const flashLoanSignatures = [
      '0x1749e1e3', // flashLoan function
      '0x5cffe9de', // executeOperation
      '0xab9c4b5d'  // onFlashLoan
    ];

    return flashLoanSignatures.some(sig => data.includes(sig));
  }

  async detectApprovalFarming(txData) {
    // Check for approve function calls to unknown contracts
    const data = txData.data || '';
    const approveSignature = '0x095ea7b3'; // approve(address,uint256)

    return data.startsWith(approveSignature);
  }

  /**
   * Check external threat feeds
   */
  async checkExternalThreatFeeds(addresses) {
    // In production, this would query external threat intelligence feeds
    // like Chainalysis, TRM Labs, etc.

    // Mock implementation - return empty array
    return [];
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard() {
    try {
      const now = Date.now();
      const last24h = now - 24 * 60 * 60 * 1000;
      const last7d = now - 7 * 24 * 60 * 60 * 1000;

      const recent24h = this.securityEvents.filter(e =>
        new Date(e.timestamp).getTime() > last24h
      );

      const recent7d = this.securityEvents.filter(e =>
        new Date(e.timestamp).getTime() > last7d
      );

      const alertsByType = {};
      const alertsBySeverity = {};

      for (const event of recent24h) {
        for (const alert of event.alerts) {
          alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
          alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
        }
      }

      return {
        metrics: this.securityMetrics,
        summary: {
          totalEvents: this.securityEvents.length,
          events24h: recent24h.length,
          events7d: recent7d.length,
          suspiciousAddresses: this.suspiciousAddresses.size,
          alertsByType,
          alertsBySeverity
        },
        recentAlerts: recent24h
          .filter(e => e.alerts.length > 0)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting security dashboard:', error);
      throw error;
    }
  }

  /**
   * Get security report for address
   */
  async getAddressSecurityReport(address) {
    try {
      const userAddress = address.toLowerCase();
      const userEvents = this.securityEvents.filter(e =>
        e.from?.toLowerCase() === userAddress ||
        e.proposer?.toLowerCase() === userAddress
      );

      const alerts = userEvents.flatMap(e => e.alerts);
      const riskScores = userEvents.map(e => e.riskScore).filter(score => score > 0);
      const avgRiskScore = riskScores.length > 0 ?
        riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length : 0;

      return {
        address: userAddress,
        isSuspicious: this.suspiciousAddresses.has(userAddress),
        totalEvents: userEvents.length,
        totalAlerts: alerts.length,
        averageRiskScore: Math.round(avgRiskScore),
        alertsByType: alerts.reduce((acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        }, {}),
        recentActivity: userEvents
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting address security report:', error);
      throw error;
    }
  }

  /**
   * Update security configuration
   */
  async updateSecurityConfig(updates) {
    try {
      this.config = { ...this.config, ...updates };

      // Reapply rules if thresholds changed
      if (updates.largeAmountThreshold) {
        const rule = this.alertRules.get('large_donation');
        rule.threshold = updates.largeAmountThreshold;
      }

      console.log('🔧 Security configuration updated');
      return this.config;
    } catch (error) {
      console.error('Error updating security config:', error);
      throw error;
    }
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    this.monitoring = true;

    // Clean up old events periodically
    setInterval(() => {
      this.cleanupOldEvents();
    }, 3600000); // Every hour

    console.log('👁️ Security monitoring started');
  }

  /**
   * Cleanup old security events
   */
  cleanupOldEvents() {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    const before = this.securityEvents.length;

    this.securityEvents = this.securityEvents.filter(e =>
      new Date(e.timestamp).getTime() > cutoff
    );

    const removed = before - this.securityEvents.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old security events`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      return {
        status: this.monitoring ? 'monitoring' : 'stopped',
        metrics: this.securityMetrics,
        rules: this.alertRules.size,
        patterns: this.threatPatterns.size,
        events: this.securityEvents.length,
        suspiciousAddresses: this.suspiciousAddresses.size,
        rateLimiters: this.rateLimiters.size,
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
}

module.exports = SecurityService;
