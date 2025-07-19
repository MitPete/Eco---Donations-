/**
 * Main application entry point for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

// Import modules
import { connectWallet, reconnectWallet } from './modules/wallet.js';
import { makeDonation, quickDonate } from './modules/donation.js';
import { loadHomePage, setupHeroVideo } from './modules/home.js';
import { showToast } from './utils/helpers.js';

/**
 * Application Class
 */
class EcoDonationsApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('%c🌱 Eco Donations DApp v1.0.0', 'color: #28c76f; font-weight: bold; font-size: 16px;');
      console.log('🔗 Initializing application...');

      // Set up global error handling
      this.setupErrorHandling();

      // Attempt to reconnect wallet
      await reconnectWallet();

      // Initialize page-specific functionality
      await this.initializePage();

      // Set up global event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('✅ Application initialized successfully');

    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      showToast('Application failed to initialize', 'error');
    }
  }

  /**
   * Get current page name
   * @returns {string} Current page name
   */
  getCurrentPage() {
    const path = window.location.pathname;

    if (path.includes('index') || path === '/' || path === '') {
      return 'home';
    } else if (path.includes('donate')) {
      return 'donate';
    } else if (path.includes('history')) {
      return 'history';
    } else if (path.includes('foundation')) {
      return 'foundation';
    } else if (path.includes('dashboard')) {
      return 'dashboard';
    }

    return 'unknown';
  }

  /**
   * Initialize page-specific functionality
   */
  async initializePage() {
    console.log(`🔄 Initializing ${this.currentPage} page...`);

    switch (this.currentPage) {
      case 'home':
        await this.initializeHomePage();
        break;
      case 'donate':
        await this.initializeDonatePage();
        break;
      case 'history':
        await this.initializeHistoryPage();
        break;
      case 'foundation':
        await this.initializeFoundationPage();
        break;
      case 'dashboard':
        await this.initializeDashboardPage();
        break;
      default:
        console.log('ℹ️ Unknown page, skipping page-specific initialization');
    }
  }

  /**
   * Initialize home page
   */
  async initializeHomePage() {
    setupHeroVideo();
    await loadHomePage();
  }

  /**
   * Initialize donate page
   */
  async initializeDonatePage() {
    // Load donate page functionality
    if (window.loadDonatePage) {
      await window.loadDonatePage();
    }
  }

  /**
   * Initialize history page
   */
  async initializeHistoryPage() {
    // Load history page functionality
    if (window.loadHistory) {
      await window.loadHistory();
    }
  }

  /**
   * Initialize foundation page
   */
  async initializeFoundationPage() {
    // Load foundation page functionality
    if (window.loadFoundationProfile) {
      await window.loadFoundationProfile();
    }
  }

  /**
   * Initialize dashboard page
   */
  async initializeDashboardPage() {
    // Load dashboard functionality
    if (window.loadDashboard) {
      await window.loadDashboard();
    }
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Wallet connection events
    const connectButton = document.getElementById('connectButton');
    if (connectButton && !connectButton.hasAttribute('data-listener')) {
      connectButton.addEventListener('click', connectWallet);
      connectButton.setAttribute('data-listener', 'true');
    }

    // Page navigation events
    this.setupNavigationListeners();

    // Form submission events
    this.setupFormListeners();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Set up navigation listeners
   */
  setupNavigationListeners() {
    // Handle nav link clicks with smooth transitions
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      if (!link.hasAttribute('data-listener')) {
        link.addEventListener('click', (e) => {
          // Add active state
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
        link.setAttribute('data-listener', 'true');
      }
    });
  }

  /**
   * Set up form listeners
   */
  setupFormListeners() {
    // Donation form
    const donationForm = document.getElementById('donationForm');
    if (donationForm && !donationForm.hasAttribute('data-listener')) {
      donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(donationForm);
        const foundationId = parseInt(formData.get('foundation'));
        const amount = formData.get('amount');
        const message = formData.get('message') || '';

        await makeDonation(foundationId, amount, message);
      });
      donationForm.setAttribute('data-listener', 'true');
    }

    // Quick donation buttons
    const quickDonateButtons = document.querySelectorAll('[data-quick-donate]');
    quickDonateButtons.forEach(button => {
      if (!button.hasAttribute('data-listener')) {
        button.addEventListener('click', async (e) => {
          const foundationId = parseInt(button.dataset.foundation);
          const amount = parseFloat(button.dataset.amount);

          if (!isNaN(foundationId) && !isNaN(amount)) {
            await quickDonate(foundationId, amount);
          }
        });
        button.setAttribute('data-listener', 'true');
      }
    });
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + W: Connect wallet
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        connectWallet();
      }

      // Ctrl/Cmd + D: Go to donate page
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        window.location.href = 'donate.html';
      }

      // Ctrl/Cmd + H: Go to history page
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        window.location.href = 'history.html';
      }
    });
  }

  /**
   * Set up global error handling
   */
  setupErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      showToast('An unexpected error occurred', 'error');
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      showToast('An unexpected error occurred', 'error');
    });
  }

  /**
   * Refresh current page
   */
  async refresh() {
    await this.initializePage();
  }
}

// Create and initialize app instance
const app = new EcoDonationsApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});

// Make functions globally available for backward compatibility
window.connectWallet = connectWallet;
window.sendDonation = makeDonation;
window.quickDonate = quickDonate;
window.loadHomePage = loadHomePage;
window.app = app;

// Export for module usage
export default app;
