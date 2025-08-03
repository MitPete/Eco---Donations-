// ORGANIZATION DATA AND MANAGER - Combined for Browser Compatibility
// This combines data and functionality to avoid ES6 module import issues

// Organization Categories
const organizationCategories = {
  ocean: {
    name: "Ocean Conservation",
    icon: "fas fa-water",
    description: "Protecting marine ecosystems and ocean life",
    color: "#0ea5e9"
  },
  forest: {
    name: "Forest Protection",
    icon: "fas fa-tree",
    description: "Preserving forests and biodiversity",
    color: "#22c55e"
  },
  climate: {
    name: "Climate Action",
    icon: "fas fa-globe-americas",
    description: "Fighting climate change and global warming",
    color: "#ef4444"
  },
  energy: {
    name: "Clean Energy",
    icon: "fas fa-solar-panel",
    description: "Promoting renewable and sustainable energy",
    color: "#f59e0b"
  },
  wildlife: {
    name: "Wildlife Protection",
    icon: "fas fa-paw",
    description: "Protecting endangered species and habitats",
    color: "#8b5cf6"
  },
  water: {
    name: "Clean Water",
    icon: "fas fa-tint",
    description: "Ensuring access to clean water worldwide",
    color: "#06b6d4"
  }
};

// Organizations Data
const organizations = {
  ocean: [
    {
      id: "ocean_cleanup_foundation",
      name: "Ocean Cleanup Foundation",
      description: "Developing advanced technologies to rid the world's oceans of plastic waste.",
      website: "https://theoceancleanup.com",
      logoUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=center",
      causes: ["Ocean Cleanup", "Plastic Pollution", "Marine Life Protection"],
      locations: ["Pacific Ocean", "Atlantic Ocean", "Mediterranean Sea"],
      totalRaised: 250000,
      totalDonated: 240000,
      donorCount: 1850,
      projectsActive: 12,
      verified: true,
      impactMetric: "Plastic Removed (kg)",
      impactValue: 85000
    }
  ],
  forest: [
    {
      id: "rainforest_alliance",
      name: "Rainforest Alliance",
      description: "Working to conserve biodiversity and ensure sustainable livelihoods.",
      website: "https://www.rainforest-alliance.org",
      logoUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop&crop=center",
      causes: ["Forest Conservation", "Biodiversity Protection", "Sustainable Agriculture"],
      locations: ["Amazon Basin", "Central America", "Southeast Asia"],
      totalRaised: 180000,
      totalDonated: 175000,
      donorCount: 1200,
      projectsActive: 8,
      verified: true,
      impactMetric: "Trees Protected",
      impactValue: 500000
    }
  ],
  climate: [
    {
      id: "climate_action_network",
      name: "Climate Action Network",
      description: "Leading global action on climate change through policy and advocacy.",
      website: "https://climatenetwork.org",
      logoUrl: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=100&h=100&fit=crop&crop=center",
      causes: ["Climate Policy", "Renewable Energy Advocacy", "Carbon Reduction"],
      locations: ["Global", "Europe", "North America"],
      totalRaised: 320000,
      totalDonated: 310000,
      donorCount: 2400,
      projectsActive: 15,
      verified: true,
      impactMetric: "CO2 Reduced (tons)",
      impactValue: 15000
    }
  ],
  energy: [
    {
      id: "solar_sister",
      name: "Solar Sister",
      description: "Eradicating energy poverty by empowering women with economic opportunity.",
      website: "https://solarsister.org",
      logoUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop&crop=center",
      causes: ["Solar Energy", "Women Empowerment", "Rural Development"],
      locations: ["Africa", "Nigeria", "Tanzania", "Uganda"],
      totalRaised: 95000,
      totalDonated: 90000,
      donorCount: 680,
      projectsActive: 6,
      verified: true,
      impactMetric: "Solar Systems Distributed",
      impactValue: 12000
    }
  ],
  wildlife: [
    {
      id: "world_wildlife_fund",
      name: "World Wildlife Fund",
      description: "Working to conserve nature and reduce the most pressing threats to biodiversity.",
      website: "https://www.worldwildlife.org",
      logoUrl: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=100&h=100&fit=crop&crop=center",
      causes: ["Species Protection", "Habitat Conservation", "Anti-Poaching"],
      locations: ["Global", "Africa", "Asia", "Americas"],
      totalRaised: 450000,
      totalDonated: 435000,
      donorCount: 3200,
      projectsActive: 25,
      verified: true,
      impactMetric: "Species Protected",
      impactValue: 180
    }
  ],
  water: [
    {
      id: "charity_water",
      name: "charity: water",
      description: "Bringing clean and safe drinking water to people in developing countries.",
      website: "https://www.charitywater.org",
      logoUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=center",
      causes: ["Clean Water Access", "Well Construction", "Water Purification"],
      locations: ["Sub-Saharan Africa", "Southeast Asia", "Central America"],
      totalRaised: 380000,
      totalDonated: 370000,
      donorCount: 2800,
      projectsActive: 18,
      verified: true,
      impactMetric: "People Served",
      impactValue: 125000
    }
  ]
};

// Helper Functions
function getOrganizationsByCategory(category) {
  return organizations[category] || [];
}

function getAllOrganizations() {
  const allOrgs = [];
  Object.keys(organizations).forEach(category => {
    allOrgs.push(...organizations[category]);
  });
  return allOrgs;
}

// Organizations Manager Class
class OrganizationsManager {
  constructor() {
    this.categories = organizationCategories;
    console.log('OrganizationsManager constructor called');
    const storedData = this.loadFromStorage();

    if (storedData) {
      console.log('Using stored data from localStorage');
      this.organizations = storedData;
    } else {
      console.log('No stored data found, using default data and saving to storage');
      this.organizations = organizations;
      this.saveToStorage(); // Only save if no data was found
    }

    console.log('Using organizations data:', this.organizations);
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('ecocoin_organizations');
      console.log('Loading from localStorage:', stored ? 'Found data' : 'No data found');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed data:', parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.warn('Error loading organizations from storage:', error);
      return null;
    }
  }

  saveToStorage() {
    try {
      console.log('Saving to localStorage:', this.organizations);
      localStorage.setItem('ecocoin_organizations', JSON.stringify(this.organizations));
      console.log('Save successful');
    } catch (error) {
      console.warn('Error saving organizations to storage:', error);
    }
  }

  addOrganization(orgData) {
    try {
      // Validate required fields
      if (!orgData.name || !orgData.category || !orgData.description) {
        throw new Error('Missing required fields: name, category, or description');
      }

      if (!orgData.causes || orgData.causes.length === 0) {
        throw new Error('At least one cause is required');
      }

      if (!orgData.locations || orgData.locations.length === 0) {
        throw new Error('At least one location is required');
      }

      // Generate ID from name
      const id = orgData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Create organization object
      const newOrg = {
        id: id,
        name: orgData.name,
        description: orgData.description,
        website: orgData.website || '',
        logoUrl: orgData.logoUrl || '',
        causes: orgData.causes,
        locations: orgData.locations,
        totalRaised: orgData.totalDonated || 0,
        totalDonated: orgData.totalDonated || 0,
        donorCount: orgData.donorCount || 0,
        projectsActive: orgData.projectsActive || 0,
        verified: orgData.verified || false,
        impactMetric: orgData.impactMetric || 'Impact Created',
        impactValue: orgData.impactValue || 0
      };

      // Add to the appropriate category
      const category = orgData.category;
      if (!this.organizations[category]) {
        this.organizations[category] = [];
      }

      this.organizations[category].push(newOrg);

      // Save to localStorage
      this.saveToStorage();

      console.log('Organization added successfully:', newOrg);
      return newOrg;

    } catch (error) {
      console.error('Error adding organization:', error);
      throw error;
    }
  }

  getOrganizations(category = null) {
    if (category) {
      return this.organizations[category] || [];
    }
    return getAllOrganizations();
  }

  getCategories() {
    return this.categories;
  }

  // Organizations page functionality
  init() {
    this.currentFilter = 'all';
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
    if (!container) return; // Exit if not on organizations page

    if (category === 'all') {
      // Show all organizations grouped by category
      this.renderAllCategories(container);
    } else {
      // Show organizations for specific category
      this.renderCategoryOrganizations(container, category);
    }
  }

  renderAllCategories(container) {
    console.log('renderAllCategories called');
    console.log('Current organizations data:', this.organizations);
    let html = '';

    Object.keys(this.categories).forEach(categoryKey => {
      const categoryOrgs = this.organizations[categoryKey] || [];
      console.log(`Category ${categoryKey} has ${categoryOrgs.length} organizations:`, categoryOrgs);
      if (categoryOrgs.length === 0) return;

      const category = this.categories[categoryKey];
      html += `
        <div class="category-section">
          <h2 class="category-title">
            <i class="${category.icon}"></i>
            ${category.name}
          </h2>
          <p class="category-description">${category.description}</p>
          <div class="organizations-grid">
            ${categoryOrgs.map(org => this.renderOrganizationCard(org)).join('')}
          </div>
        </div>
      `;
    });

    console.log('Generated HTML length:', html.length);
    container.innerHTML = html;
  }

  renderCategoryOrganizations(container, categoryKey) {
    const categoryOrgs = this.organizations[categoryKey] || [];
    const category = this.categories[categoryKey];

    let html = `
      <div class="category-section">
        <h2 class="category-title">
          <i class="${category.icon}"></i>
          ${category.name}
        </h2>
        <p class="category-description">${category.description}</p>
        <div class="organizations-grid">
          ${categoryOrgs.map(org => this.renderOrganizationCard(org)).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  renderOrganizationCard(org) {
    const logoHtml = org.logoUrl ?
      `<img src="${org.logoUrl}" alt="${org.name}" class="org-logo" onerror="this.style.display='none'">` :
      `<div class="org-logo-placeholder"><i class="fas fa-leaf"></i></div>`;

    const websiteHtml = org.website ?
      `<a href="${org.website.startsWith('http') ? org.website : 'https://' + org.website}" target="_blank" class="org-website">
        <i class="fas fa-external-link-alt"></i> Visit Website
      </a>` : '';

    return `
      <div class="organization-card" data-org-id="${org.id}">
        <div class="org-header">
          ${logoHtml}
          <div class="org-info">
            <h3 class="org-name">${org.name}</h3>
            ${org.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
          </div>
        </div>

        <p class="org-description">${org.description}</p>

        <div class="org-causes">
          <strong>Focus Areas:</strong>
          <div class="causes-tags">
            ${org.causes.map(cause => `<span class="cause-tag">${cause.trim()}</span>`).join('')}
          </div>
        </div>

        <div class="org-locations">
          <strong>Active in:</strong> ${org.locations.join(', ')}
        </div>

        <div class="org-stats">
          <div class="stat">
            <span class="stat-value">$${org.totalDonated.toLocaleString()}</span>
            <span class="stat-label">Total Donated</span>
          </div>
          <div class="stat">
            <span class="stat-value">${org.donorCount.toLocaleString()}</span>
            <span class="stat-label">Donors</span>
          </div>
          <div class="stat">
            <span class="stat-value">${org.projectsActive}</span>
            <span class="stat-label">Active Projects</span>
          </div>
        </div>

        ${org.impactMetric && org.impactMetric !== 'Impact Created' ? `
        <div class="org-impact">
          <strong>${org.impactMetric}:</strong> ${org.impactValue.toLocaleString()}
        </div>
        ` : ''}

        <div class="org-actions">
          <button class="btn-primary org-donate-btn" onclick="window.location.href='donate.html?org=${org.id}'">
            <i class="fas fa-heart"></i> Donate Now
          </button>
          ${websiteHtml}
        </div>
      </div>
    `;
  }

  updateStats() {
    // Update overall statistics if there are stat elements on the page
    const allOrgs = getAllOrganizations();
    const totalOrgs = allOrgs.length;
    const totalDonated = allOrgs.reduce((sum, org) => sum + (org.totalDonated || 0), 0);
    const totalDonors = allOrgs.reduce((sum, org) => sum + (org.donorCount || 0), 0);

    // Update DOM elements if they exist
    const statsElements = {
      'total-organizations': totalOrgs,
      'total-donated': `$${totalDonated.toLocaleString()}`,
      'total-donors': totalDonors.toLocaleString()
    };

    Object.keys(statsElements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = statsElements[id];
      }
    });
  }
}

// Helper Functions that use the manager
function getOrganizationsByCategory(category) {
  const manager = window.organizationsManager || new OrganizationsManager();
  return manager.organizations[category] || [];
}

function getAllOrganizations() {
  const manager = window.organizationsManager || new OrganizationsManager();
  const allOrgs = [];
  Object.keys(manager.organizations).forEach(category => {
    allOrgs.push(...manager.organizations[category]);
  });
  return allOrgs;
}

// Create global instance and make data available
console.log('Creating global OrganizationsManager instance');
// Don't create a new instance if one already exists
if (!window.organizationsManager) {
  window.organizationsManager = new OrganizationsManager();
} else {
  console.log('Reusing existing OrganizationsManager instance');
  // Reload data from localStorage in case it was updated
  const storedData = window.organizationsManager.loadFromStorage();
  if (storedData) {
    window.organizationsManager.organizations = storedData;
    console.log('Reloaded data from localStorage');
  }
}

window.OrganizationsManager = OrganizationsManager;
window.organizationCategories = organizationCategories;

// Make organizations a getter so it always returns current data
Object.defineProperty(window, 'organizations', {
  get: function() {
    return window.organizationsManager.organizations;
  }
});

window.getOrganizationsByCategory = getOrganizationsByCategory;
window.getAllOrganizations = getAllOrganizations;

console.log('Global variables set. Ocean organizations:', window.organizations.ocean);

// Debug functions for testing
window.debugLocalStorage = function() {
  console.log('=== DEBUG LOCALSTORAGE ===');
  const stored = localStorage.getItem('ecocoin_organizations');
  console.log('Raw localStorage:', stored);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('Parsed localStorage:', parsed);
      console.log('Ocean orgs in storage:', parsed.ocean);
    } catch (e) {
      console.error('Error parsing localStorage:', e);
    }
  }
  console.log('Current manager organizations:', window.organizationsManager.organizations);
  console.log('Current ocean orgs:', window.organizationsManager.organizations.ocean);
};

window.clearLocalStorage = function() {
  localStorage.removeItem('ecocoin_organizations');
  console.log('localStorage cleared');
};

window.reloadManager = function() {
  window.organizationsManager = new OrganizationsManager();
  window.organizations = window.organizationsManager.organizations;
  console.log('Manager reloaded. Ocean orgs:', window.organizations.ocean);
};

// Initialize organizations page functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  // Only initialize if we're on the organizations page
  if (document.getElementById('organizationsContainer')) {
    console.log('Organizations container found, initializing page');
    window.organizationsManager.init();
  } else {
    console.log('Organizations container not found, not initializing page');
  }
});
