/**
 * Notification Service
 * Handles all notification types including email, SMS, push notifications, and in-app alerts
 */
class NotificationService {
  constructor(config) {
    this.config = config;
    this.providers = {
      email: null,
      sms: null,
      push: null
    };
    this.templates = new Map();
    this.queue = [];
    this.subscriptions = new Map();
    this.rateLimits = new Map();
    this.initialized = false;
  }

  /**
   * Initialize notification service with providers
   */
  async initialize() {
    try {
      // Initialize notification templates
      this.setupTemplates();

      // Setup providers (placeholder for production services)
      if (this.config.email?.enabled) {
        await this.initializeEmailProvider();
      }

      if (this.config.sms?.enabled) {
        await this.initializeSMSProvider();
      }

      if (this.config.push?.enabled) {
        await this.initializePushProvider();
      }

      // Start processing queue
      this.startQueueProcessor();

      this.initialized = true;
      console.log('🔔 Notification service initialized');
    } catch (error) {
      console.error('❌ Notification service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup notification templates
   */
  setupTemplates() {
    // Donation notifications
    this.templates.set('donation_received', {
      subject: '💚 Thank you for your donation!',
      email: `
        <h2>Your donation has been received!</h2>
        <p>Dear {{donorName}},</p>
        <p>Thank you for your generous donation of <strong>{{amount}} {{currency}}</strong> to {{foundationName}}.</p>
        <p><strong>Transaction Details:</strong></p>
        <ul>
          <li>Amount: {{amount}} {{currency}}</li>
          <li>Transaction Hash: {{txHash}}</li>
          <li>Foundation: {{foundationName}}</li>
          <li>Date: {{date}}</li>
        </ul>
        <p>Your contribution makes a real difference in environmental conservation efforts.</p>
        <p>Best regards,<br>The EcoDonations Team</p>
      `,
      sms: 'Thank you for donating {{amount}} {{currency}} to {{foundationName}}! Your contribution helps protect our environment. Tx: {{txHash}}',
      push: {
        title: 'Donation Confirmed 💚',
        body: 'Your {{amount}} {{currency}} donation to {{foundationName}} has been confirmed!'
      }
    });

    this.templates.set('donation_foundation_alert', {
      subject: '🎉 New donation received!',
      email: `
        <h2>New Donation Alert!</h2>
        <p>Your foundation has received a new donation:</p>
        <p><strong>Donation Details:</strong></p>
        <ul>
          <li>Amount: {{amount}} {{currency}}</li>
          <li>Donor: {{donorAddress}}</li>
          <li>Transaction Hash: {{txHash}}</li>
          <li>Date: {{date}}</li>
        </ul>
        <p>Thank you for your continued environmental work!</p>
      `,
      push: {
        title: 'New Donation Received! 🎉',
        body: '{{amount}} {{currency}} donated to your foundation'
      }
    });

    // Governance notifications
    this.templates.set('proposal_created', {
      subject: '📋 New Governance Proposal',
      email: `
        <h2>New Proposal Created</h2>
        <p>A new governance proposal has been submitted:</p>
        <p><strong>Proposal #{{proposalId}}: {{title}}</strong></p>
        <p>{{description}}</p>
        <p>Proposed by: {{proposer}}</p>
        <p>Voting ends: {{endDate}}</p>
        <p><a href="{{governanceUrl}}">View and Vote on Proposal</a></p>
      `,
      push: {
        title: 'New Proposal 📋',
        body: 'Proposal #{{proposalId}}: {{title}}'
      }
    });

    this.templates.set('proposal_status_change', {
      subject: '📊 Proposal Status Update',
      email: `
        <h2>Proposal Status Update</h2>
        <p>Proposal #{{proposalId}} status has changed to: <strong>{{newStatus}}</strong></p>
        <p><strong>{{title}}</strong></p>
        {{#if executed}}
        <p>The proposal has been executed successfully!</p>
        {{/if}}
        <p><a href="{{governanceUrl}}">View Proposal Details</a></p>
      `,
      push: {
        title: 'Proposal Update 📊',
        body: 'Proposal #{{proposalId}} is now {{newStatus}}'
      }
    });

    // Security notifications
    this.templates.set('security_alert', {
      subject: '🚨 Security Alert',
      email: `
        <h2 style="color: #e74c3c;">Security Alert</h2>
        <p><strong>Alert Type:</strong> {{alertType}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p><strong>Affected Address:</strong> {{address}}</p>
        <p>Please review your account security and contact support if needed.</p>
      `,
      sms: 'SECURITY ALERT: {{alertType}} detected on your EcoDonations account. Please check your email for details.',
      push: {
        title: 'Security Alert 🚨',
        body: '{{alertType}} detected on your account'
      }
    });

    // Auto-donation notifications
    this.templates.set('auto_donation_executed', {
      subject: '🔄 Automated Donation Executed',
      email: `
        <h2>Automated Donation Completed</h2>
        <p>Your scheduled donation has been executed:</p>
        <ul>
          <li>Amount: {{amount}} {{currency}}</li>
          <li>Foundation: {{foundationName}}</li>
          <li>Schedule: {{schedule}}</li>
          <li>Next donation: {{nextDate}}</li>
        </ul>
        <p>Thank you for your ongoing support!</p>
      `,
      push: {
        title: 'Auto-Donation Complete 🔄',
        body: '{{amount}} {{currency}} donated to {{foundationName}}'
      }
    });

    // System notifications
    this.templates.set('system_maintenance', {
      subject: '🔧 Scheduled Maintenance',
      email: `
        <h2>Scheduled Maintenance Notice</h2>
        <p>We will be performing scheduled maintenance on our platform:</p>
        <p><strong>Start:</strong> {{startTime}}</p>
        <p><strong>Expected Duration:</strong> {{duration}}</p>
        <p><strong>Services Affected:</strong> {{services}}</p>
        <p>We apologize for any inconvenience.</p>
      `,
      push: {
        title: 'Maintenance Notice 🔧',
        body: 'Scheduled maintenance starting {{startTime}}'
      }
    });

    console.log(`📝 ${this.templates.size} notification templates loaded`);
  }

  /**
   * Subscribe user to notification types
   */
  async subscribe(address, preferences) {
    try {
      const userAddress = address.toLowerCase();
      const subscription = {
        address: userAddress,
        preferences: {
          email: preferences.email || false,
          sms: preferences.sms || false,
          push: preferences.push || false,
          donations: preferences.donations !== false, // Default true
          governance: preferences.governance !== false, // Default true
          security: preferences.security !== false, // Default true
          autodonations: preferences.autodonations !== false, // Default true
          system: preferences.system || false
        },
        contacts: {
          email: preferences.emailAddress,
          phone: preferences.phoneNumber,
          pushToken: preferences.pushToken
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.subscriptions.set(userAddress, subscription);
      console.log(`🔔 User ${userAddress} subscribed to notifications`);
      return subscription;
    } catch (error) {
      console.error('Error subscribing user:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(address, updates) {
    try {
      const userAddress = address.toLowerCase();
      const existing = this.subscriptions.get(userAddress);

      if (!existing) {
        throw new Error('User not subscribed');
      }

      const updated = {
        ...existing,
        preferences: { ...existing.preferences, ...updates.preferences },
        contacts: { ...existing.contacts, ...updates.contacts },
        updatedAt: new Date().toISOString()
      };

      this.subscriptions.set(userAddress, updated);
      console.log(`✏️ Notification preferences updated for ${userAddress}`);
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Send donation confirmation notification
   */
  async notifyDonationReceived(donationData) {
    try {
      const { donor, amount, currency, foundationName, txHash } = donationData;

      const data = {
        donorName: donationData.donorName || 'Donor',
        amount,
        currency: currency || 'ETH',
        foundationName,
        txHash,
        date: new Date().toLocaleDateString(),
        donorAddress: donor
      };

      await this.sendNotification(donor, 'donation_received', data, ['donations']);
      console.log(`📧 Donation confirmation sent to ${donor}`);
    } catch (error) {
      console.error('Error sending donation notification:', error);
    }
  }

  /**
   * Notify foundation of new donation
   */
  async notifyFoundationDonation(donationData, foundationContact) {
    try {
      const { donor, amount, currency, txHash } = donationData;

      const data = {
        amount,
        currency: currency || 'ETH',
        donorAddress: donor,
        txHash,
        date: new Date().toLocaleDateString()
      };

      if (foundationContact) {
        await this.sendDirectNotification(foundationContact, 'donation_foundation_alert', data);
      }
      console.log(`📧 Foundation notification sent for donation ${txHash}`);
    } catch (error) {
      console.error('Error sending foundation notification:', error);
    }
  }

  /**
   * Send governance proposal notification
   */
  async notifyProposalCreated(proposalData) {
    try {
      const data = {
        proposalId: proposalData.id,
        title: proposalData.title || `Proposal #${proposalData.id}`,
        description: proposalData.description,
        proposer: proposalData.proposer,
        endDate: new Date(proposalData.endTime * 1000).toLocaleDateString(),
        governanceUrl: `${this.config.frontendUrl}/governance`
      };

      // Notify all users interested in governance
      await this.broadcastNotification('proposal_created', data, ['governance']);
      console.log(`📢 Proposal creation broadcasted: ${proposalData.id}`);
    } catch (error) {
      console.error('Error sending proposal notification:', error);
    }
  }

  /**
   * Send proposal status change notification
   */
  async notifyProposalStatusChange(proposalData, newStatus) {
    try {
      const data = {
        proposalId: proposalData.id,
        title: proposalData.title || `Proposal #${proposalData.id}`,
        newStatus,
        executed: newStatus === 'Executed',
        governanceUrl: `${this.config.frontendUrl}/governance`
      };

      await this.broadcastNotification('proposal_status_change', data, ['governance']);
      console.log(`📢 Proposal status change broadcasted: ${proposalData.id} -> ${newStatus}`);
    } catch (error) {
      console.error('Error sending proposal status notification:', error);
    }
  }

  /**
   * Send security alert
   */
  async notifySecurityAlert(address, alertType, description) {
    try {
      const data = {
        alertType,
        description,
        timestamp: new Date().toISOString(),
        address
      };

      await this.sendNotification(address, 'security_alert', data, ['security'], true); // High priority
      console.log(`🚨 Security alert sent to ${address}: ${alertType}`);
    } catch (error) {
      console.error('Error sending security alert:', error);
    }
  }

  /**
   * Send auto-donation notification
   */
  async notifyAutoDonationExecuted(donationData) {
    try {
      const data = {
        amount: donationData.amount,
        currency: donationData.currency || 'ETH',
        foundationName: donationData.foundationName,
        schedule: donationData.schedule,
        nextDate: donationData.nextDate
      };

      await this.sendNotification(donationData.donor, 'auto_donation_executed', data, ['autodonations']);
      console.log(`🔄 Auto-donation notification sent to ${donationData.donor}`);
    } catch (error) {
      console.error('Error sending auto-donation notification:', error);
    }
  }

  /**
   * Send system maintenance notification
   */
  async notifySystemMaintenance(maintenanceData) {
    try {
      const data = {
        startTime: new Date(maintenanceData.startTime).toLocaleString(),
        duration: maintenanceData.duration,
        services: maintenanceData.services.join(', ')
      };

      await this.broadcastNotification('system_maintenance', data, ['system']);
      console.log(`🔧 System maintenance notification broadcasted`);
    } catch (error) {
      console.error('Error sending maintenance notification:', error);
    }
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(address, templateId, data, categories = [], highPriority = false) {
    try {
      const userAddress = address.toLowerCase();
      const subscription = this.subscriptions.get(userAddress);

      if (!subscription) {
        console.log(`⚠️ User ${userAddress} not subscribed to notifications`);
        return;
      }

      // Check if user wants notifications for these categories
      const wantsNotification = categories.some(cat => subscription.preferences[cat]);
      if (!wantsNotification && !highPriority) {
        return;
      }

      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Check rate limits
      if (!this.checkRateLimit(userAddress, templateId)) {
        console.log(`⏰ Rate limit exceeded for ${userAddress}:${templateId}`);
        return;
      }

      const notification = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipient: userAddress,
        templateId,
        data,
        channels: this.getEnabledChannels(subscription),
        priority: highPriority ? 'high' : 'normal',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      this.queue.push(notification);
      console.log(`📬 Notification queued for ${userAddress}: ${templateId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send direct notification (bypass subscription check)
   */
  async sendDirectNotification(contact, templateId, data) {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const notification = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipient: contact,
        templateId,
        data,
        channels: ['email'], // Default to email for direct notifications
        priority: 'normal',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      this.queue.push(notification);
      console.log(`📬 Direct notification queued: ${templateId}`);
    } catch (error) {
      console.error('Error sending direct notification:', error);
    }
  }

  /**
   * Broadcast notification to all subscribed users
   */
  async broadcastNotification(templateId, data, categories = []) {
    try {
      let recipients = 0;

      for (const [address, subscription] of this.subscriptions.entries()) {
        const wantsNotification = categories.length === 0 ||
          categories.some(cat => subscription.preferences[cat]);

        if (wantsNotification) {
          await this.sendNotification(address, templateId, data, categories);
          recipients++;
        }
      }

      console.log(`📢 Broadcast notification sent to ${recipients} recipients: ${templateId}`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  /**
   * Get enabled notification channels for user
   */
  getEnabledChannels(subscription) {
    const channels = [];

    if (subscription.preferences.email && subscription.contacts.email) {
      channels.push('email');
    }
    if (subscription.preferences.sms && subscription.contacts.phone) {
      channels.push('sms');
    }
    if (subscription.preferences.push && subscription.contacts.pushToken) {
      channels.push('push');
    }

    return channels;
  }

  /**
   * Check rate limits
   */
  checkRateLimit(address, templateId) {
    const key = `${address}:${templateId}`;
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit) {
      this.rateLimits.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }

    if (now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + 60000 });
      return true;
    }

    if (limit.count >= (this.config.rateLimit || 5)) {
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * Process notification queue
   */
  startQueueProcessor() {
    setInterval(async () => {
      if (this.queue.length === 0) return;

      const notification = this.queue.shift();
      try {
        await this.processNotification(notification);
      } catch (error) {
        console.error('Error processing notification:', error);
        // Re-queue failed notifications (with retry logic)
        if (!notification.retries) notification.retries = 0;
        if (notification.retries < 3) {
          notification.retries++;
          this.queue.push(notification);
        }
      }
    }, 1000); // Process every second

    console.log('⚙️ Notification queue processor started');
  }

  /**
   * Process individual notification
   */
  async processNotification(notification) {
    try {
      const template = this.templates.get(notification.templateId);
      const processedData = this.processTemplate(template, notification.data);

      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            await this.sendEmail(notification.recipient, processedData);
            break;
          case 'sms':
            await this.sendSMS(notification.recipient, processedData);
            break;
          case 'push':
            await this.sendPushNotification(notification.recipient, processedData);
            break;
        }
      }

      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();
      console.log(`✅ Notification sent: ${notification.id}`);
    } catch (error) {
      notification.status = 'failed';
      notification.error = error.message;
      throw error;
    }
  }

  /**
   * Process template with data
   */
  processTemplate(template, data) {
    const processed = {};

    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'string') {
        processed[key] = this.replaceTemplateVars(value, data);
      } else if (typeof value === 'object') {
        processed[key] = {};
        for (const [subKey, subValue] of Object.entries(value)) {
          processed[key][subKey] = this.replaceTemplateVars(subValue, data);
        }
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Replace template variables
   */
  replaceTemplateVars(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Provider initialization methods (placeholder implementations)
   */
  async initializeEmailProvider() {
    // In production, integrate with SendGrid, Mailgun, AWS SES, etc.
    console.log('📧 Email provider initialized (mock)');
  }

  async initializeSMSProvider() {
    // In production, integrate with Twilio, AWS SNS, etc.
    console.log('📱 SMS provider initialized (mock)');
  }

  async initializePushProvider() {
    // In production, integrate with Firebase, OneSignal, etc.
    console.log('📲 Push notification provider initialized (mock)');
  }

  /**
   * Send methods (placeholder implementations)
   */
  async sendEmail(recipient, data) {
    // Mock email sending
    console.log(`📧 Email sent to ${recipient.email || recipient}: ${data.subject}`);
  }

  async sendSMS(recipient, data) {
    // Mock SMS sending
    console.log(`📱 SMS sent to ${recipient.phone || recipient}: ${data.sms}`);
  }

  async sendPushNotification(recipient, data) {
    // Mock push notification
    console.log(`📲 Push sent to ${recipient.pushToken || recipient}: ${data.push.title}`);
  }

  /**
   * Get notification history for user
   */
  async getNotificationHistory(address, limit = 50) {
    // In production, this would query from database
    return [];
  }

  /**
   * Get notification statistics
   */
  async getStats() {
    return {
      subscriptions: this.subscriptions.size,
      queueSize: this.queue.length,
      templates: this.templates.size,
      rateLimits: this.rateLimits.size,
      initialized: this.initialized
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const stats = await this.getStats();
      return {
        status: this.initialized ? 'healthy' : 'not_initialized',
        stats,
        providers: {
          email: this.providers.email ? 'connected' : 'disabled',
          sms: this.providers.sms ? 'connected' : 'disabled',
          push: this.providers.push ? 'connected' : 'disabled'
        },
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

module.exports = NotificationService;
