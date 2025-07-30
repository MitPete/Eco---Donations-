/**
 * ECO Donations - Analytics Implementation
 * Complete tracking setup for beta testing phase
 */

class ECOAnalytics {
    constructor(gaTrackingId) {
        this.gaTrackingId = gaTrackingId;
        this.isInitialized = false;
        this.sessionId = this.generateSessionId();
        this.init();
    }

    // Initialize Google Analytics 4
    init() {
        if (this.isInitialized) return;

        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaTrackingId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', this.gaTrackingId, {
            'session_id': this.sessionId,
            'custom_map': {
                'custom_parameter_1': 'user_type',
                'custom_parameter_2': 'wallet_connected',
                'custom_parameter_3': 'network_type'
            }
        });

        this.isInitialized = true;
        console.log('📊 ECO Analytics initialized');
    }

    // Generate unique session ID
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Track page views
    trackPageView(pageName, additionalData = {}) {
        if (!this.isInitialized) return;

        gtag('event', 'page_view', {
            'page_title': pageName,
            'page_location': window.location.href,
            'session_id': this.sessionId,
            'user_type': additionalData.userType || 'unknown',
            'wallet_connected': !!window.ethereum?.selectedAddress,
            'network_type': additionalData.network || 'unknown',
            ...additionalData
        });

        console.log(`📄 Page view tracked: ${pageName}`);
    }

    // Wallet connection tracking
    trackWalletConnection(walletType, userAddress, networkId) {
        if (!this.isInitialized) return;

        gtag('event', 'wallet_connected', {
            'event_category': 'wallet',
            'wallet_type': walletType,
            'user_address_prefix': userAddress ? userAddress.substring(0, 10) + '...' : '',
            'network_id': networkId,
            'session_id': this.sessionId,
            'value': 1
        });

        console.log(`💳 Wallet connection tracked: ${walletType}`);
    }

    trackWalletDisconnection() {
        if (!this.isInitialized) return;

        gtag('event', 'wallet_disconnected', {
            'event_category': 'wallet',
            'session_id': this.sessionId,
            'value': 1
        });

        console.log('💳 Wallet disconnection tracked');
    }

    // Donation tracking
    trackDonationStarted(foundation, amount, currency = 'ETH') {
        if (!this.isInitialized) return;

        gtag('event', 'begin_checkout', {
            'event_category': 'donation',
            'currency': currency,
            'value': parseFloat(amount),
            'items': [{
                'item_id': foundation,
                'item_name': `${foundation} Donation`,
                'item_category': 'Environmental Foundation',
                'quantity': 1,
                'price': parseFloat(amount)
            }]
        });

        gtag('event', 'donation_started', {
            'event_category': 'donation',
            'foundation': foundation,
            'amount': parseFloat(amount),
            'currency': currency,
            'session_id': this.sessionId,
            'value': parseFloat(amount)
        });

        console.log(`💚 Donation started: ${amount} ${currency} to ${foundation}`);
    }

    trackDonationCompleted(foundation, amount, txHash, ecoTokensEarned, currency = 'ETH') {
        if (!this.isInitialized) return;

        // E-commerce purchase event
        gtag('event', 'purchase', {
            'transaction_id': txHash,
            'value': parseFloat(amount),
            'currency': currency,
            'items': [{
                'item_id': foundation,
                'item_name': `${foundation} Donation`,
                'item_category': 'Environmental Foundation',
                'quantity': 1,
                'price': parseFloat(amount)
            }]
        });

        // Custom donation completed event
        gtag('event', 'donation_completed', {
            'event_category': 'donation',
            'foundation': foundation,
            'amount': parseFloat(amount),
            'currency': currency,
            'eco_tokens_earned': parseFloat(ecoTokensEarned),
            'transaction_hash': txHash,
            'session_id': this.sessionId,
            'value': parseFloat(amount)
        });

        console.log(`🎉 Donation completed: ${amount} ${currency} to ${foundation}`);
    }

    trackDonationFailed(foundation, amount, errorMessage, currency = 'ETH') {
        if (!this.isInitialized) return;

        gtag('event', 'donation_failed', {
            'event_category': 'error',
            'foundation': foundation,
            'amount': parseFloat(amount),
            'currency': currency,
            'error_message': errorMessage.substring(0, 100), // Limit length
            'session_id': this.sessionId,
            'value': 0
        });

        console.log(`❌ Donation failed: ${errorMessage}`);
    }

    // Governance tracking
    trackProposalView(proposalId, proposalTitle, proposalCategory) {
        if (!this.isInitialized) return;

        gtag('event', 'proposal_viewed', {
            'event_category': 'governance',
            'proposal_id': proposalId,
            'proposal_title': proposalTitle.substring(0, 100),
            'proposal_category': proposalCategory,
            'session_id': this.sessionId,
            'value': 1
        });

        console.log(`🗳️ Proposal viewed: ${proposalId}`);
    }

    trackVoteCast(proposalId, voteChoice, tokenAmount) {
        if (!this.isInitialized) return;

        gtag('event', 'vote_cast', {
            'event_category': 'governance',
            'proposal_id': proposalId,
            'vote_choice': voteChoice,
            'token_amount': parseFloat(tokenAmount),
            'session_id': this.sessionId,
            'value': parseFloat(tokenAmount)
        });

        console.log(`🗳️ Vote cast: ${voteChoice} on proposal ${proposalId}`);
    }

    trackProposalCreated(proposalId, proposalCategory, tokenDeposit) {
        if (!this.isInitialized) return;

        gtag('event', 'proposal_created', {
            'event_category': 'governance',
            'proposal_id': proposalId,
            'proposal_category': proposalCategory,
            'token_deposit': parseFloat(tokenDeposit),
            'session_id': this.sessionId,
            'value': 10 // High engagement value
        });

        console.log(`📝 Proposal created: ${proposalId}`);
    }

    // Auto-donation tracking
    trackAutoDonationSetup(foundation, amount, frequency, currency = 'ETH') {
        if (!this.isInitialized) return;

        gtag('event', 'auto_donation_setup', {
            'event_category': 'auto_donation',
            'foundation': foundation,
            'amount': parseFloat(amount),
            'frequency': frequency,
            'currency': currency,
            'session_id': this.sessionId,
            'value': parseFloat(amount)
        });

        console.log(`🤖 Auto-donation setup: ${frequency} ${amount} ${currency} to ${foundation}`);
    }

    trackAutoDonationExecution(foundation, amount, currency = 'ETH') {
        if (!this.isInitialized) return;

        gtag('event', 'auto_donation_executed', {
            'event_category': 'auto_donation',
            'foundation': foundation,
            'amount': parseFloat(amount),
            'currency': currency,
            'session_id': this.sessionId,
            'value': parseFloat(amount)
        });

        console.log(`🤖 Auto-donation executed: ${amount} ${currency} to ${foundation}`);
    }

    // Error tracking
    trackError(errorType, errorMessage, location, isFatal = false) {
        if (!this.isInitialized) return;

        gtag('event', 'exception', {
            'description': errorMessage.substring(0, 150),
            'fatal': isFatal,
            'event_category': 'error',
            'error_type': errorType,
            'location': location,
            'session_id': this.sessionId
        });

        console.error(`🐛 Error tracked: ${errorType} - ${errorMessage}`);
    }

    trackTransactionError(action, errorMessage, gasUsed = 0) {
        if (!this.isInitialized) return;

        gtag('event', 'transaction_error', {
            'event_category': 'blockchain',
            'action': action,
            'error_message': errorMessage.substring(0, 100),
            'gas_used': gasUsed,
            'session_id': this.sessionId,
            'value': 0
        });

        console.error(`⛽ Transaction error: ${action} - ${errorMessage}`);
    }

    // Performance tracking
    trackPerformanceMetric(metricName, value, url = window.location.pathname) {
        if (!this.isInitialized) return;

        gtag('event', metricName.toLowerCase(), {
            'event_category': 'Web Vitals',
            'value': Math.round(value),
            'event_label': url,
            'session_id': this.sessionId
        });

        console.log(`⚡ Performance metric: ${metricName} = ${value}ms`);
    }

    // Custom event tracking
    trackCustomEvent(eventName, category, parameters = {}) {
        if (!this.isInitialized) return;

        gtag('event', eventName, {
            'event_category': category,
            'session_id': this.sessionId,
            ...parameters
        });

        console.log(`📊 Custom event tracked: ${eventName}`);
    }

    // User engagement tracking
    trackEngagement(engagementType, duration = 0) {
        if (!this.isInitialized) return;

        gtag('event', 'engagement', {
            'event_category': 'user_engagement',
            'engagement_type': engagementType,
            'engagement_time_msec': duration,
            'session_id': this.sessionId,
            'value': Math.ceil(duration / 1000) // Convert to seconds
        });

        console.log(`👥 Engagement tracked: ${engagementType} (${duration}ms)`);
    }

    // Feature usage tracking
    trackFeatureUsage(featureName, featureCategory, additionalData = {}) {
        if (!this.isInitialized) return;

        gtag('event', 'feature_usage', {
            'event_category': 'features',
            'feature_name': featureName,
            'feature_category': featureCategory,
            'session_id': this.sessionId,
            'value': 1,
            ...additionalData
        });

        console.log(`🎯 Feature usage tracked: ${featureName}`);
    }
}

// Auto-initialize Web Vitals tracking
function initWebVitalsTracking(analytics) {
    // Core Web Vitals tracking
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            analytics.trackPerformanceMetric('LCP', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                analytics.trackPerformanceMetric('FID', entry.processingStart - entry.startTime);
            });
        }).observe({entryTypes: ['first-input']});

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            for (const entry of entryList.getEntries()) {
                clsValue += entry.value;
            }
            analytics.trackPerformanceMetric('CLS', clsValue * 1000);
        }).observe({entryTypes: ['layout-shift']});
    }
}

// Usage example:
/*
// Initialize analytics (replace with your GA4 tracking ID)
const analytics = new ECOAnalytics('G-XXXXXXXXXX');

// Track page views
analytics.trackPageView('Homepage', { userType: 'beta_tester' });

// Track wallet connection
analytics.trackWalletConnection('MetaMask', '0x123...', '11155111');

// Track donations
analytics.trackDonationStarted('SaveTheOceans', '0.01');
analytics.trackDonationCompleted('SaveTheOceans', '0.01', '0xabc...', '0.1');

// Track governance
analytics.trackProposalView('PROP-001', 'Add Solar Foundation', 'foundation');
analytics.trackVoteCast('PROP-001', 'yes', '100');

// Track errors
analytics.trackError('wallet_connection', 'MetaMask not found', 'homepage');

// Initialize Web Vitals tracking
initWebVitalsTracking(analytics);
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ECOAnalytics, initWebVitalsTracking };
}
