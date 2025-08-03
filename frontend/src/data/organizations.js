// DYNAMIC ORGANIZATION DATA STRUCTURE
// This will eventually be pulled from a database/API

export const organizationCategories = {
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
    description: "Renewable energy and sustainability",
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
    description: "Access to clean water and sanitation",
    color: "#06b6d4"
  }
};

export const organizations = {
  // OCEAN CONSERVATION ORGANIZATIONS
  ocean: [
    {
      id: "ocean_conservancy",
      name: "Ocean Conservancy",
      description: "Working to protect the ocean from today's greatest global challenges",
      website: "https://oceanconservancy.org",
      verified: true,
      ein: "23-7245152", // Real EIN for tax receipts
      logo: "/images/orgs/ocean-conservancy.png",
      stats: {
        projectsActive: 25,
        impactMetric: "Tons of Trash Removed",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Marine debris", "Ocean acidification", "Arctic conservation"],
      locations: ["Global", "United States", "Arctic"]
    },
    {
      id: "surfrider_foundation",
      name: "Surfrider Foundation",
      description: "Dedicated to the protection and enjoyment of our world's ocean, waves and beaches",
      website: "https://surfrider.org",
      verified: true,
      ein: "95-3941826",
      logo: "/images/orgs/surfrider.png",
      stats: {
        projectsActive: 18,
        impactMetric: "Beaches Protected",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Beach protection", "Water quality", "Coastal preservation"],
      locations: ["United States", "Europe", "Japan", "Australia"]
    },
    {
      id: "coral_restoration",
      name: "Coral Restoration Foundation",
      description: "Restoring coral reefs through research, restoration, and education",
      website: "https://coralrestoration.org",
      verified: true,
      ein: "65-0397875",
      logo: "/images/orgs/coral-restoration.png",
      stats: {
        projectsActive: 12,
        impactMetric: "Corals Planted",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Coral restoration", "Marine research", "Ocean education"],
      locations: ["Florida", "Caribbean"]
    }
  ],

  // FOREST PROTECTION ORGANIZATIONS
  forest: [
    {
      id: "rainforest_alliance",
      name: "Rainforest Alliance",
      description: "Working to conserve biodiversity and ensure sustainable livelihoods",
      website: "https://rainforest-alliance.org",
      verified: true,
      ein: "13-3377893",
      logo: "/images/orgs/rainforest-alliance.png",
      stats: {
        projectsActive: 35,
        impactMetric: "Acres Protected",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Rainforest conservation", "Sustainable agriculture", "Climate action"],
      locations: ["Amazon", "Central America", "Africa", "Asia"]
    },
    {
      id: "american_forests",
      name: "American Forests",
      description: "Creating healthy and resilient forests from cities to wilderness",
      website: "https://americanforests.org",
      verified: true,
      ein: "53-0196544",
      logo: "/images/orgs/american-forests.png",
      stats: {
        projectsActive: 22,
        impactMetric: "Trees Planted",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Forest restoration", "Urban forestry", "Wildfire recovery"],
      locations: ["United States", "Urban areas"]
    }
  ],

  // CLIMATE ACTION ORGANIZATIONS
  climate: [
    {
      id: "350_org",
      name: "350.org",
      description: "Building a global climate movement to solve the climate crisis",
      website: "https://350.org",
      verified: true,
      ein: "26-2238241",
      logo: "/images/orgs/350-org.png",
      stats: {
        projectsActive: 45,
        impactMetric: "Campaigns Active",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Climate activism", "Fossil fuel divestment", "Renewable energy"],
      locations: ["Global", "188 countries"]
    },
    {
      id: "environmental_defense_fund",
      name: "Environmental Defense Fund",
      description: "Finding practical solutions to environmental problems",
      website: "https://edf.org",
      verified: true,
      ein: "11-6107128",
      logo: "/images/orgs/edf.png",
      stats: {
        projectsActive: 28,
        impactMetric: "CO2 Tons Reduced",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Climate policy", "Carbon markets", "Environmental law"],
      locations: ["United States", "China", "Mexico", "Europe"]
    }
  ],

  // CLEAN ENERGY ORGANIZATIONS
  energy: [
    {
      id: "solar_sister",
      name: "Solar Sister",
      description: "Eradicating energy poverty through women's entrepreneurship",
      website: "https://solarsister.org",
      verified: true,
      ein: "27-3669071",
      logo: "/images/orgs/solar-sister.png",
      stats: {
        projectsActive: 15,
        impactMetric: "Women Entrepreneurs",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Solar energy", "Women empowerment", "Energy access"],
      locations: ["Africa", "Nigeria", "Tanzania", "Uganda"]
    },
    {
      id: "grid_alternatives",
      name: "GRID Alternatives",
      description: "Making renewable energy technology accessible to underserved communities",
      website: "https://gridalternatives.org",
      verified: true,
      ein: "68-0538803",
      logo: "/images/orgs/grid-alternatives.png",
      stats: {
        projectsActive: 20,
        impactMetric: "Solar Installations",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Solar installations", "Job training", "Community development"],
      locations: ["United States", "Mexico", "Nicaragua"]
    }
  ],

  // WILDLIFE PROTECTION ORGANIZATIONS
  wildlife: [
    {
      id: "defenders_of_wildlife",
      name: "Defenders of Wildlife",
      description: "Protecting native animals and plants in their natural communities",
      website: "https://defenders.org",
      verified: true,
      ein: "53-0183181",
      logo: "/images/orgs/defenders.png",
      stats: {
        projectsActive: 30,
        impactMetric: "Species Protected",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Endangered species", "Habitat protection", "Wildlife corridors"],
      locations: ["United States", "Mexico"]
    },
    {
      id: "world_wildlife_fund",
      name: "World Wildlife Fund",
      description: "Working to conserve nature and reduce threats to biodiversity",
      website: "https://worldwildlife.org",
      verified: true,
      ein: "52-1693387",
      logo: "/images/orgs/wwf.png",
      stats: {
        projectsActive: 60,
        impactMetric: "Protected Areas",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Species conservation", "Habitat protection", "Climate adaptation"],
      locations: ["Global", "100+ countries"]
    }
  ],

  // CLEAN WATER ORGANIZATIONS
  water: [
    {
      id: "charity_water",
      name: "charity: water",
      description: "Bringing clean and safe drinking water to people in developing countries",
      website: "https://charitywater.org",
      verified: true,
      ein: "22-3936753",
      logo: "/images/orgs/charity-water.png",
      stats: {
        projectsActive: 40,
        impactMetric: "People Served",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Clean water access", "Sanitation", "Hygiene education"],
      locations: ["Sub-Saharan Africa", "Southeast Asia", "Central America"]
    },
    {
      id: "water_org",
      name: "Water.org",
      description: "Providing access to safe water and sanitation through innovative financing",
      website: "https://water.org",
      verified: true,
      ein: "58-2060131",
      logo: "/images/orgs/water-org.png",
      stats: {
        projectsActive: 25,
        impactMetric: "Water Access Projects",
        impactValue: 0,
        totalRaised: 0
      },
      causes: ["Water access", "Microfinance", "Sanitation"],
      locations: ["13 countries", "Asia", "Africa", "Latin America"]
    }
  ]
};

// Helper functions for the frontend
export const getOrganizationsByCategory = (category) => {
  return organizations[category] || [];
};

export const getAllOrganizations = () => {
  return Object.values(organizations).flat();
};

export const getOrganizationById = (id) => {
  return getAllOrganizations().find(org => org.id === id);
};

export const getCategoryInfo = (category) => {
  return organizationCategories[category];
};

// For blockchain integration - organization addresses will be added here
export const getOrganizationWalletAddress = (orgId) => {
  // This will eventually pull from a secure database
  // For now, return placeholder addresses
  const addresses = {
    ocean_conservancy: "0x1234567890123456789012345678901234567890",
    surfrider_foundation: "0x2345678901234567890123456789012345678901",
    // ... more addresses
  };
  return addresses[orgId];
};
