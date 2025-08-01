# 🌐 Frontend Organization Guide

## 📋 **Current Reorganization Status**

**Last Updated:** July 31, 2025
**Status:** 🟡 In Progress - Organizing Section 3

---

## 🏗️ **New Frontend Structure**

```
📁 frontend/
├── 📄 package.json              # Dependencies & scripts
├── 📄 vite.config.js           # Vite configuration
├── 📄 index.html               # Main entry point
├── 📄 .env.local               # Frontend environment vars
│
├── 📁 src/                     # Source code (organized)
│   ├── 📁 pages/               # Page components
│   │   ├── 📄 home.html        # Landing page
│   │   ├── 📄 donate.html      # Donation interface
│   │   ├── 📄 dashboard.html   # User dashboard
│   │   ├── 📄 governance.html  # DAO governance
│   │   ├── 📄 history.html     # Transaction history
│   │   ├── 📄 foundation.html  # Foundation details
│   │   └── 📄 whitepaper.html  # Project documentation
│   │
│   ├── 📁 components/          # Reusable components
│   │   ├── 📄 wallet-connect.js   # Wallet connection
│   │   ├── 📄 donation-form.js    # Donation form
│   │   ├── 📄 transaction-status.js # Transaction tracking
│   │   ├── 📄 governance-vote.js   # Voting interface
│   │   └── 📄 foundation-card.js   # Foundation display
│   │
│   ├── 📁 scripts/             # JavaScript modules
│   │   ├── 📄 app.js           # Main application
│   │   ├── 📄 wallet.js        # Wallet integration
│   │   ├── 📄 contracts.js     # Contract interactions
│   │   ├── 📄 governance.js    # DAO functionality
│   │   ├── 📄 utils.js         # Utility functions
│   │   └── 📄 config.js        # Configuration
│   │
│   ├── 📁 styles/              # CSS organization
│   │   ├── 📄 main.css         # Main stylesheet
│   │   ├── 📄 components.css   # Component styles
│   │   ├── 📄 pages.css        # Page-specific styles
│   │   ├── 📄 mobile.css       # Mobile responsive
│   │   └── 📄 variables.css    # CSS variables
│   │
│   └── 📁 assets/              # Static assets
│       ├── 📁 images/          # Images & icons
│       ├── 📁 fonts/           # Web fonts
│       └── 📁 data/            # JSON data files
│
├── 📁 public/                  # Public assets
│   ├── 📄 favicon.ico          # Site favicon
│   ├── 📄 manifest.json        # PWA manifest
│   └── 📁 icons/               # App icons
│
├── 📁 tests/                   # Frontend tests
│   ├── 📄 unit/                # Unit tests
│   ├── 📄 integration/         # Integration tests
│   └── 📄 e2e/                 # End-to-end tests
│
├── 📁 docs/                    # Frontend documentation
│   ├── 📄 SETUP.md             # Setup instructions
│   ├── 📄 DEPLOYMENT.md        # Deployment guide
│   └── 📄 COMPONENTS.md        # Component documentation
│
└── 📁 archive/                 # Old/backup files
    ├── 📁 backup-html/         # Original HTML files
    ├── 📁 old-js/              # Legacy JavaScript
    └── 📁 test-files/          # Development test files
```

---

## 🔄 **Migration Plan**

### **Phase 1: Archive & Backup** ✅

- Move all `.bak` files to `archive/backup-html/`
- Move test HTML files to `archive/test-files/`
- Keep original structure as backup

### **Phase 2: Organize Core Files** 🔄

- Move main HTML pages to `src/pages/`
- Organize JavaScript modules in `src/scripts/`
- Consolidate CSS files in `src/styles/`
- Create component structure

### **Phase 3: Update Configuration** ⏳

- Update `package.json` scripts
- Create Vite configuration
- Set up environment variables
- Update build process

### **Phase 4: Testing & Validation** ⏳

- Move test files to proper test structure
- Create integration tests
- Validate all functionality
- Performance optimization

---

## 📄 **Page Organization**

### **Main Application Pages**

| Current File      | New Location                | Status | Notes               |
| ----------------- | --------------------------- | ------ | ------------------- |
| `index.html`      | `src/pages/home.html`       | ⏳     | Landing page        |
| `donate.html`     | `src/pages/donate.html`     | ⏳     | Donation interface  |
| `dashboard.html`  | `src/pages/dashboard.html`  | ⏳     | User dashboard      |
| `governance.html` | `src/pages/governance.html` | ⏳     | DAO voting          |
| `history.html`    | `src/pages/history.html`    | ⏳     | Transaction history |
| `foundation.html` | `src/pages/foundation.html` | ⏳     | Foundation info     |
| `whitepaper.html` | `src/pages/whitepaper.html` | ⏳     | Documentation       |

### **Archive Files**

| File Pattern       | Archive Location       | Reason            |
| ------------------ | ---------------------- | ----------------- |
| `*.bak`            | `archive/backup-html/` | Backup files      |
| `*-test.html`      | `archive/test-files/`  | Development tests |
| `header-temp.html` | `archive/temp/`        | Temporary files   |

---

## 💻 **JavaScript Module Organization**

### **Core Modules**

```javascript
// src/scripts/app.js - Main application entry
import { WalletManager } from "./wallet.js";
import { ContractManager } from "./contracts.js";
import { Router } from "./router.js";

// src/scripts/wallet.js - Wallet integration
export class WalletManager {
  // Centralized wallet functionality
}

// src/scripts/contracts.js - Smart contract interactions
export class ContractManager {
  // Contract interaction methods
}
```

### **Component Architecture**

```javascript
// src/components/donation-form.js
export class DonationForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    // Component HTML generation
  }
}
```

---

## 🎨 **CSS Organization**

### **Style Architecture**

```css
/* src/styles/variables.css - CSS Custom Properties */
:root {
  --primary-color: #2d5016;
  --secondary-color: #4a7c59;
  --accent-color: #8fbc8f;
  /* ... */
}

/* src/styles/main.css - Main stylesheet */
@import "./variables.css";
@import "./components.css";
@import "./pages.css";
@import "./mobile.css";
```

### **Component-Based Styling**

- Each component has its own CSS section
- Mobile-first responsive design
- CSS Grid and Flexbox layouts
- Consistent color scheme and typography

---

## ⚙️ **Development Configuration**

### **Vite Configuration**

```javascript
// vite.config.js
export default {
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 8888,
    host: true,
  },
};
```

### **Environment Variables**

```bash
# .env.local
VITE_CONTRACT_ADDRESS_DONATION=0x...
VITE_CONTRACT_ADDRESS_ECOCOIN=0x...
VITE_NETWORK_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**

- Component functionality
- Utility functions
- Contract interaction methods

### **Integration Tests**

- Wallet connection flow
- Transaction processes
- Page navigation

### **E2E Tests**

- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness

---

## 🚀 **Deployment Process**

### **Development**

```bash
npm run dev          # Start development server
npm run lint         # Code linting
npm run format       # Code formatting
```

### **Production**

```bash
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to hosting
```

---

## 📊 **Performance Optimization**

### **Current Optimizations**

- ✅ Minified CSS files available
- ✅ Code splitting implemented
- ✅ Image optimization
- ✅ Lazy loading

### **Planned Improvements**

- ⏳ Bundle size optimization
- ⏳ Service worker implementation
- ⏳ PWA features
- ⏳ Performance monitoring

---

## 🔧 **Quick Commands**

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build production

# Testing
npm run test         # Run tests
npm run test:e2e     # End-to-end tests
npm run lint         # Code quality

# Deployment
npm run preview      # Preview build
npm run deploy       # Deploy to production
```

---

_Frontend organization guide - Updated as we progress through reorganization_
