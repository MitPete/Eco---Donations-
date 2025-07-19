/**
 * Home page functionality for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

import { UI_CONFIG } from '../config.js';
import {
  animateValue,
  getElementById,
  formatNumber
} from '../utils/helpers.js';
import {
  getAllDonations,
  getDonationStatistics,
  getImpactMetrics,
  getProjectCounts
} from '../modules/donation.js';

/**
 * Home Page Manager Class
 */
class HomePageManager {
  constructor() {
    this.isLoaded = false;
  }

  /**
   * Initialize home page
   */
  async initialize() {
    if (this.isLoaded) return;

    try {
      // Load donation data
      await getAllDonations();

      // Update all sections
      await this.updateStatsBanner();
      await this.updateImpactMetrics();
      await this.updateFoundationCards();

      // Set up video controls
      this.setupHeroVideo();

      this.isLoaded = true;

    } catch (error) {
      console.error('Error initializing home page:', error);
    }
  }

  /**
   * Update stats banner with animated values
   */
  async updateStatsBanner() {
    const stats = getDonationStatistics();

    const kpiElements = [
      { id: 'kpiTotalDonated', value: stats.totalDonated, suffix: ' ETH' },
      { id: 'kpiCarbon', value: stats.carbonOffset, suffix: ' tons' },
      { id: 'kpiDonors', value: stats.uniqueDonors, suffix: '' },
      { id: 'kpiEcoMinted', value: stats.totalEcoMinted, suffix: ' ECO' }
    ];

    kpiElements.forEach(({ id, value, suffix }) => {
      const element = getElementById(id);
      if (element) {
        animateValue(element, 0, value, UI_CONFIG.ANIMATION_DURATION, suffix);
      }
    });
  }

  /**
   * Update impact metrics section
   */
  async updateImpactMetrics() {
    const impact = getImpactMetrics();

    const impactElements = [
      { id: 'oceanImpact', value: impact.oceanPlasticRemoved, suffix: ' tons' },
      { id: 'forestImpact', value: impact.forestAcresProtected, suffix: ' acres' },
      { id: 'energyImpact', value: impact.energyGenerated, suffix: ' MWh' }
    ];

    impactElements.forEach(({ id, value, suffix }) => {
      const element = getElementById(id);
      if (element) {
        animateValue(element, 0, value, UI_CONFIG.ANIMATION_DURATION, suffix);
      }
    });
  }

  /**
   * Update foundation cards with current data
   */
  async updateFoundationCards() {
    const stats = getDonationStatistics();
    const projectCounts = getProjectCounts();
    const impact = getImpactMetrics();

    // Update foundation badges (raised amounts)
    const badgeElements = [
      { id: 'badge-oceans', value: stats.foundationTotals[0] },
      { id: 'badge-forest', value: stats.foundationTotals[1] },
      { id: 'badge-sequoia', value: stats.foundationTotals[2] },
      { id: 'badge-energy', value: stats.foundationTotals[3] }
    ];

    badgeElements.forEach(({ id, value }) => {
      const element = getElementById(id);
      if (element) {
        element.textContent = `Raised ${formatNumber(value, 2)} ETH`;
      }
    });

    // Update project counts
    const projectElements = [
      { id: 'oceans-projects', value: projectCounts[0] },
      { id: 'forest-projects', value: projectCounts[1] },
      { id: 'sequoia-projects', value: projectCounts[2] },
      { id: 'energy-projects', value: projectCounts[3] }
    ];

    projectElements.forEach(({ id, value }) => {
      const element = getElementById(id);
      if (element) {
        animateValue(element, 0, value, 1500);
      }
    });

    // Update impact stats
    const impactStats = [
      { id: 'oceans-impact', value: impact.oceanPlasticRemoved },
      { id: 'forest-impact', value: impact.forestAcresProtected },
      { id: 'sequoia-impact', value: Math.floor(stats.foundationTotals[2] * 1000) }, // Trees protected
      { id: 'energy-impact', value: impact.energyGenerated }
    ];

    impactStats.forEach(({ id, value }) => {
      const element = getElementById(id);
      if (element) {
        animateValue(element, 0, value, 1800);
      }
    });
  }

  /**
   * Set up hero video controls
   */
  setupHeroVideo() {
    const video = getElementById('heroVideo');
    if (!video) return;

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const trimSeconds = 2;

      video.addEventListener('timeupdate', () => {
        if (video.currentTime >= duration - trimSeconds) {
          video.currentTime = 0;
        }
      });
    });

    // Handle video loading errors
    video.addEventListener('error', (e) => {
      console.warn('Hero video failed to load:', e);
      // Hide video container or show fallback
      const videoContainer = video.parentElement;
      if (videoContainer) {
        videoContainer.style.display = 'none';
      }
    });
  }

  /**
   * Handle foundation card clicks
   * @param {number} foundationId - Foundation ID to navigate to
   */
  navigateToFoundation(foundationId) {
    window.location.href = `foundation.html?id=${foundationId}`;
  }

  /**
   * Handle donate button clicks
   * @param {number} foundationId - Foundation ID to donate to
   */
  navigateToDonate(foundationId) {
    window.location.href = `donate.html?foundation=${foundationId}`;
  }

  /**
   * Refresh page data
   */
  async refresh() {
    this.isLoaded = false;
    await this.initialize();
  }
}

// Create singleton instance
const homePageManager = new HomePageManager();

// Export functions for global access
export const loadHomePage = () => homePageManager.initialize();
export const refreshHomePage = () => homePageManager.refresh();
export const setupHeroVideo = () => homePageManager.setupHeroVideo();
export const navigateToFoundation = (id) => homePageManager.navigateToFoundation(id);
export const navigateToDonate = (id) => homePageManager.navigateToDonate(id);

export default homePageManager;
