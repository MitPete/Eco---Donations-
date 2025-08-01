/**
 * Projects Utility
 * Handles project/foundation management and display functionality
 */

class ProjectsManager {
  constructor() {
    this.projects = new Map();
    this.categories = ['All', 'Ocean Conservation', 'Forest Protection', 'Renewable Energy', 'Wildlife Protection'];
    this.sortOptions = ['name', 'impact', 'donations', 'recent'];
    this.currentFilter = 'All';
    this.currentSort = 'impact';
  }

  /**
   * Initialize projects with default data
   */
  initialize() {
    // Initialize with foundation data
    this.projects.set('oceans', {
      id: 'oceans',
      name: 'Ocean Conservation Alliance',
      category: 'Ocean Conservation',
      description: 'Protecting marine ecosystems and reducing ocean pollution through innovative conservation strategies.',
      image: '/images/ocean-conservation.jpg',
      totalDonations: 156.8,
      donorCount: 234,
      impactScore: 95,
      lastDonation: new Date(Date.now() - 86400000), // 1 day ago
      goals: {
        current: 156.8,
        target: 500,
        description: 'Fund marine protected areas'
      },
      features: ['Coral reef restoration', 'Plastic cleanup', 'Marine research'],
      website: 'https://oceanconservation.org',
      verified: true
    });

    this.projects.set('rainforest', {
      id: 'rainforest',
      name: 'Rainforest Guardians',
      category: 'Forest Protection',
      description: 'Preserving critical rainforest habitats and supporting indigenous communities.',
      image: '/images/rainforest-protection.jpg',
      totalDonations: 89.2,
      donorCount: 167,
      impactScore: 88,
      lastDonation: new Date(Date.now() - 3600000), // 1 hour ago
      goals: {
        current: 89.2,
        target: 300,
        description: 'Protect 1000 hectares of rainforest'
      },
      features: ['Deforestation monitoring', 'Community support', 'Biodiversity research'],
      website: 'https://rainforestguardians.org',
      verified: true
    });

    this.projects.set('sequoias', {
      id: 'sequoias',
      name: 'Sequoia Preservation Society',
      category: 'Forest Protection',
      description: 'Protecting ancient sequoia groves and restoring forest ecosystems.',
      image: '/images/sequoia-protection.jpg',
      totalDonations: 203.4,
      donorCount: 312,
      impactScore: 92,
      lastDonation: new Date(Date.now() - 7200000), // 2 hours ago
      goals: {
        current: 203.4,
        target: 400,
        description: 'Restore damaged forest areas'
      },
      features: ['Ancient tree protection', 'Fire prevention', 'Ecosystem restoration'],
      website: 'https://sequoiapreservation.org',
      verified: true
    });

    this.projects.set('energy', {
      id: 'energy',
      name: 'Clean Energy Initiative',
      category: 'Renewable Energy',
      description: 'Accelerating the transition to clean, renewable energy sources worldwide.',
      image: '/images/clean-energy.jpg',
      totalDonations: 178.9,
      donorCount: 289,
      impactScore: 85,
      lastDonation: new Date(Date.now() - 10800000), // 3 hours ago
      goals: {
        current: 178.9,
        target: 600,
        description: 'Install 100 MW of solar capacity'
      },
      features: ['Solar installations', 'Wind projects', 'Energy storage'],
      website: 'https://cleanenergyinitiative.org',
      verified: true
    });

    console.log(`Initialized ${this.projects.size} projects`);
  }

  /**
   * Get all projects with optional filtering and sorting
   */
  getProjects(options = {}) {
    let projectList = Array.from(this.projects.values());

    // Apply category filter
    if (options.category && options.category !== 'All') {
      projectList = projectList.filter(project => project.category === options.category);
    }

    // Apply search filter
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      projectList = projectList.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.features.some(feature => feature.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    const sortBy = options.sort || this.currentSort;
    projectList.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'donations':
          return b.totalDonations - a.totalDonations;
        case 'recent':
          return b.lastDonation - a.lastDonation;
        case 'impact':
        default:
          return b.impactScore - a.impactScore;
      }
    });

    return projectList;
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Add or update project
   */
  updateProject(projectId, projectData) {
    if (this.projects.has(projectId)) {
      const existing = this.projects.get(projectId);
      this.projects.set(projectId, { ...existing, ...projectData });
    } else {
      this.projects.set(projectId, {
        id: projectId,
        ...projectData,
        donorCount: 0,
        totalDonations: 0,
        impactScore: 0,
        verified: false
      });
    }
  }

  /**
   * Record a new donation
   */
  recordDonation(projectId, amount, donor) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.totalDonations += parseFloat(amount);
    project.donorCount += 1;
    project.lastDonation = new Date();
    project.goals.current = project.totalDonations;

    // Update impact score based on progress
    const progressPercent = (project.goals.current / project.goals.target) * 100;
    project.impactScore = Math.min(100, Math.max(0, progressPercent * 0.8 + project.donorCount * 0.2));

    console.log(`Recorded donation of ${amount} ETH to ${project.name}`);
    return project;
  }

  /**
   * Get project statistics
   */
  getProjectStats(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const progressPercent = (project.goals.current / project.goals.target) * 100;
    const daysRemaining = this.calculateDaysRemaining(project);

    return {
      progressPercent: Math.min(100, progressPercent),
      averageDonation: project.donorCount > 0 ? project.totalDonations / project.donorCount : 0,
      daysRemaining,
      urgencyLevel: this.calculateUrgency(project),
      recentActivity: this.getRecentActivity(projectId)
    };
  }

  /**
   * Calculate project urgency level
   */
  calculateUrgency(project) {
    const progressPercent = (project.goals.current / project.goals.target) * 100;
    const daysSinceLastDonation = (Date.now() - project.lastDonation.getTime()) / (1000 * 60 * 60 * 24);

    if (progressPercent > 80) return 'low';
    if (daysSinceLastDonation > 7 && progressPercent < 50) return 'high';
    if (progressPercent < 25) return 'medium';
    return 'low';
  }

  /**
   * Calculate estimated days remaining
   */
  calculateDaysRemaining(project) {
    if (project.goals.current >= project.goals.target) return 0;

    const remaining = project.goals.target - project.goals.current;
    const dailyAverage = project.totalDonations / 30; // Assume 30-day average

    if (dailyAverage <= 0) return null;
    return Math.ceil(remaining / dailyAverage);
  }

  /**
   * Get recent activity for project
   */
  getRecentActivity(projectId) {
    // This would typically fetch from a backend API
    // For now, return mock data
    return [
      {
        type: 'donation',
        amount: 2.5,
        donor: '0x1234...5678',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        type: 'milestone',
        description: 'Reached 50% of funding goal',
        timestamp: new Date(Date.now() - 86400000)
      }
    ];
  }

  /**
   * Get trending projects
   */
  getTrendingProjects(limit = 3) {
    return this.getProjects({ sort: 'recent' }).slice(0, limit);
  }

  /**
   * Get projects by category
   */
  getProjectsByCategory() {
    const byCategory = {};

    for (const category of this.categories) {
      if (category === 'All') continue;
      byCategory[category] = this.getProjects({ category });
    }

    return byCategory;
  }

  /**
   * Search projects
   */
  searchProjects(query) {
    return this.getProjects({ search: query });
  }

  /**
   * Get project summary for dashboard
   */
  getProjectSummary() {
    const allProjects = Array.from(this.projects.values());

    return {
      totalProjects: allProjects.length,
      totalDonations: allProjects.reduce((sum, p) => sum + p.totalDonations, 0),
      totalDonors: allProjects.reduce((sum, p) => sum + p.donorCount, 0),
      averageImpact: allProjects.reduce((sum, p) => sum + p.impactScore, 0) / allProjects.length,
      categories: this.categories.slice(1), // Exclude 'All'
      mostActive: allProjects.sort((a, b) => b.donorCount - a.donorCount)[0],
      mostFunded: allProjects.sort((a, b) => b.totalDonations - a.totalDonations)[0]
    };
  }

  /**
   * Validate project data
   */
  validateProject(projectData) {
    const required = ['name', 'description', 'category', 'goals'];
    const missing = required.filter(field => !projectData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!this.categories.includes(projectData.category)) {
      throw new Error(`Invalid category: ${projectData.category}`);
    }

    if (projectData.goals && (!projectData.goals.target || projectData.goals.target <= 0)) {
      throw new Error('Invalid funding goal');
    }

    return true;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectsManager;
} else {
  window.ProjectsManager = ProjectsManager;
}
