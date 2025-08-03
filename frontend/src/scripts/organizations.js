// Organizations page functionality
import {
  organizationCategories,
  organizations,
  getOrganizationsByCategory,
  getAllOrganizations
} from '../data/organizations.js';

class OrganizationsManager {
  constructor() {
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.loadOrganizations();
    this.setupFilters();
    this.updateStats();
  }

  setupFilters() {
    const filters = document.querySelectorAll('.category-filter');
    filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();

        // Update active filter
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        // Get category and load organizations
        const category = filter.dataset.category;
        this.currentFilter = category;
        this.loadOrganizations(category);
      });
    });
  }

  loadOrganizations(category = 'all') {
    const container = document.getElementById('organizationsContainer');

    if (category === 'all') {
      // Show all organizations grouped by category
      this.renderAllCategories(container);
    } else {
      // Show organizations for specific category
      this.renderCategoryOrganizations(container, category);
    }
  }

  renderAllCategories(container) {
    container.innerHTML = '';

    Object.keys(organizationCategories).forEach(categoryKey => {
      const categoryInfo = organizationCategories[categoryKey];
      const categoryOrgs = organizations[categoryKey] || [];

      if (categoryOrgs.length === 0) return;

      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';

      categorySection.innerHTML = `
        <div class="category-header">
          <div class="category-icon">
            <i class="${categoryInfo.icon}"></i>
          </div>
          <div>
            <h2>${categoryInfo.name}</h2>
            <p class="category-description">${categoryInfo.description}</p>
          </div>
        </div>
        <div class="organizations-grid">
          ${categoryOrgs.map(org => this.renderOrganizationCard(org)).join('')}
        </div>
      `;

      container.appendChild(categorySection);
    });
  }

  renderCategoryOrganizations(container, category) {
    const categoryInfo = organizationCategories[category];
    const categoryOrgs = organizations[category] || [];

    container.innerHTML = `
      <div class="category-section">
        <div class="category-header">
          <div class="category-icon">
            <i class="${categoryInfo.icon}"></i>
          </div>
          <div>
            <h2>${categoryInfo.name}</h2>
            <p class="category-description">${categoryInfo.description}</p>
          </div>
        </div>
        <div class="organizations-grid">
          ${categoryOrgs.map(org => this.renderOrganizationCard(org)).join('')}
        </div>
      </div>
    `;
  }

  renderOrganizationCard(org) {
    return `
      <div class="organization-card" data-org-id="${org.id}">
        <div class="org-header">
          <div class="org-logo">
            <i class="fas fa-heart"></i>
          </div>
          <div class="org-info">
            <h3>${org.name}</h3>
            ${org.verified ? `
              <div class="org-verified">
                <i class="fas fa-check-circle"></i>
                Verified Organization
              </div>
            ` : ''}
          </div>
        </div>

        <p class="org-description">${org.description}</p>

        <div class="org-stats">
          <div class="org-stat">
            <span class="org-stat-value">${org.stats.projectsActive}</span>
            <span class="org-stat-label">Active Projects</span>
          </div>
          <div class="org-stat">
            <span class="org-stat-value">${org.stats.impactValue}</span>
            <span class="org-stat-label">${org.stats.impactMetric}</span>
          </div>
        </div>

        <div class="org-causes">
          <h4>Focus Areas:</h4>
          <div class="cause-tags">
            ${org.causes.map(cause => `<span class="cause-tag">${cause}</span>`).join('')}
          </div>
        </div>

        <div class="org-actions">
          <a href="donate.html?org=${org.id}" class="org-action primary">
            <i class="fas fa-heart"></i>
            Donate Now
          </a>
          <a href="organization-detail.html?id=${org.id}" class="org-action secondary">
            <i class="fas fa-info-circle"></i>
            Learn More
          </a>
        </div>
      </div>
    `;
  }

  updateStats() {
    // Update global stats - this would come from blockchain data
    const totalOrgs = getAllOrganizations().length;
    const totalCategories = Object.keys(organizationCategories).length;

    // You can update any stats display here
    console.log(`Loaded ${totalOrgs} organizations across ${totalCategories} categories`);
  }

  // Method to add new organization (for admin use)
  addOrganization(category, orgData) {
    if (!organizations[category]) {
      organizations[category] = [];
    }

    organizations[category].push({
      id: orgData.id,
      name: orgData.name,
      description: orgData.description,
      website: orgData.website,
      verified: orgData.verified || false,
      ein: orgData.ein,
      logo: orgData.logo,
      stats: {
        projectsActive: orgData.projectsActive || 0,
        impactMetric: orgData.impactMetric || "Impact Created",
        impactValue: orgData.impactValue || 0,
        totalRaised: orgData.totalRaised || 0
      },
      causes: orgData.causes || [],
      locations: orgData.locations || []
    });

    // Refresh display if currently viewing this category
    if (this.currentFilter === category || this.currentFilter === 'all') {
      this.loadOrganizations(this.currentFilter);
    }
  }

  // Method to update organization stats (from blockchain data)
  updateOrganizationStats(orgId, stats) {
    const allOrgs = getAllOrganizations();
    const org = allOrgs.find(o => o.id === orgId);

    if (org) {
      Object.assign(org.stats, stats);

      // Refresh the display
      this.loadOrganizations(this.currentFilter);
    }
  }

  // Search functionality
  searchOrganizations(query) {
    const allOrgs = getAllOrganizations();
    const results = allOrgs.filter(org =>
      org.name.toLowerCase().includes(query.toLowerCase()) ||
      org.description.toLowerCase().includes(query.toLowerCase()) ||
      org.causes.some(cause => cause.toLowerCase().includes(query.toLowerCase()))
    );

    // Render search results
    const container = document.getElementById('organizationsContainer');
    container.innerHTML = `
      <div class="category-section">
        <div class="category-header">
          <div class="category-icon">
            <i class="fas fa-search"></i>
          </div>
          <div>
            <h2>Search Results</h2>
            <p class="category-description">Found ${results.length} organizations matching "${query}"</p>
          </div>
        </div>
        <div class="organizations-grid">
          ${results.map(org => this.renderOrganizationCard(org)).join('')}
        </div>
      </div>
    `;
  }
}

// Initialize the organizations manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.organizationsManager = new OrganizationsManager();
});

// Export for external use
export { OrganizationsManager };
