# Eco Donations - Project Structure Documentation

## 📁 Project Overview

This document outlines the organized, modular structure of the Eco Donations frontend application. The codebase has been refactored to follow modern web development best practices with clear separation of concerns.

## 🏗️ Directory Structure

```
frontend/
├── 📁 js/                          # JavaScript modules and logic
│   ├── 📄 app.js                   # Main application entry point
│   ├── 📄 config.js                # Configuration constants
│   ├── 📁 modules/                 # Feature-specific modules
│   │   ├── 📄 wallet.js           # Wallet management (connect, disconnect, balance)
│   │   ├── 📄 donation.js         # Donation handling (send, track, statistics)
│   │   └── 📄 home.js             # Home page functionality
│   └── 📁 utils/                   # Utility functions
│       └── 📄 helpers.js          # Helper functions (formatting, animations, etc.)
├── 📁 css/                         # Stylesheets
│   ├── 📄 base.css                 # Base styles, variables, utilities
│   ├── 📁 components/              # Component-specific styles
│   │   └── 📄 header.css          # Header component styles
│   └── 📁 pages/                   # Page-specific styles
├── 📁 assets/                      # Static assets
│   └── 📄 hero-bg.mp4             # Hero video background
├── 📁 abi/                         # Smart contract ABIs
├── 📁 src/                         # Source files
│   └── 📄 contracts.json          # Contract addresses and configuration
├── 📄 index.html                   # Home page
├── 📄 donate.html                  # Donation page
├── 📄 history.html                 # Donation history page
├── 📄 foundation.html              # Foundation details page
├── 📄 dashboard.html               # Dashboard page
├── 📄 css/                         # Modular CSS structure
│   ├── main.css                    # Main CSS entry point
│   ├── base.css                    # Variables, resets, utilities
│   ├── components/                 # Component styles
│   │   ├── header.css
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── forms.css
│   │   ├── tables.css
│   │   ├── footer.css
│   │   └── coin.css
│   └── pages/                      # Page-specific styles
│       ├── home.css
│       ├── donation.css
│       └── history.css
├── 📄 main.js                      # Legacy main file (to be removed)
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.js               # Build configuration
└── 📄 README.md                    # Project documentation
```

## 🔧 Module Architecture

### Core Modules

#### 1. **Application Core (`js/app.js`)**

- Main application initialization
- Page-specific routing and setup
- Global event handling
- Error management
- Backward compatibility for legacy code

#### 2. **Configuration (`js/config.js`)**

- Network settings (RPC URLs, Chain IDs)
- Contract addresses and ABIs
- Foundation configuration
- UI constants
- Error and success messages

#### 3. **Wallet Management (`js/modules/wallet.js`)**

- MetaMask connection/disconnection
- Wallet state management
- Balance tracking
- Event listeners for wallet changes
- Reconnection handling

#### 4. **Donation System (`js/modules/donation.js`)**

- Donation transaction handling
- Blockchain event processing
- Statistics calculation
- Impact metrics computation
- Donation history management

#### 5. **Page Controllers (`js/modules/home.js`)**

- Page-specific initialization
- Data loading and display
- User interaction handling
- Animation management

### Utility Functions (`js/utils/helpers.js`)

#### Formatting & Display

- `clipAddress()` - Shorten wallet addresses
- `formatNumber()` - Format numbers with commas
- `formatEther()` - Convert Wei to Ether
- `animateValue()` - Smooth number animations

#### UI Management

- `getElementById()` - Safe element selection
- `setButtonLoading()` - Loading state management
- `showToast()` - Notification system

#### Error Handling

- `handleAsync()` - Async error wrapper
- `ensureContract()` - Contract validation
- `debounce()` - Function debouncing

#### Validation

- `isValidAddress()` - Ethereum address validation

## 🎨 CSS Architecture

### Base Styles (`css/base.css`)

- CSS Custom Properties (Variables)
- Global resets and typography
- Utility classes
- Responsive breakpoints
- Dark mode support

### Component Styles (`css/components/`)

- Self-contained component styles
- BEM methodology
- Responsive design
- Accessibility features
- Animation definitions

### Page Styles (`css/pages/`)

- Page-specific layouts
- Grid systems
- Responsive adaptations

## 🔄 Data Flow

### 1. Application Initialization

```
User loads page → app.js initializes →
Reconnect wallet → Load page data →
Set up event listeners → Ready
```

### 2. Wallet Connection

```
User clicks connect → wallet.js handles →
MetaMask prompt → Connection established →
Update UI → Store connection →
Set up contract instances
```

### 3. Donation Process

```
User fills form → donation.js validates →
Send transaction → Wait for confirmation →
Update local state → Refresh page data →
Show success notification
```

### 4. Data Updates

```
Blockchain event → Process event →
Update statistics → Refresh UI →
Animate changes → Store state
```

## 📦 Build System

### Vite Configuration (`vite.config.js`)

- ES6 module support
- Multi-page application setup
- Path aliases for clean imports
- Development server configuration
- Production build optimization

### Scripts (`package.json`)

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Code linting
- `npm run format` - Code formatting

## 🔗 Module Dependencies

### Import/Export Pattern

```javascript
// Configuration
import { NETWORK_CONFIG, CONTRACT_CONFIG } from "../config.js";

// Utilities
import { showToast, handleAsync } from "../utils/helpers.js";

// Modules
import { connectWallet, getDonationContract } from "./wallet.js";
```

### Global Compatibility

Legacy functions are still available globally:

```javascript
window.connectWallet = connectWallet;
window.sendDonation = makeDonation;
window.quickDonate = quickDonate;
```

## 🎯 Key Features

### 1. **Modular Design**

- Clear separation of concerns
- Reusable components
- Easy to maintain and extend
- Testable modules

### 2. **Performance Optimized**

- Lazy loading capabilities
- Efficient state management
- Minimal bundle size
- Optimized asset loading

### 3. **Developer Experience**

- Hot module replacement
- Source maps
- Path aliases
- Comprehensive error handling

### 4. **Production Ready**

- Minified builds
- Tree shaking
- Asset optimization
- Environment configuration

## 🚀 Migration Notes

### From Legacy Structure

1. **JavaScript**: Moved from single `main.js` to modular `/js` structure
2. **CSS**: Began migration from single `style.css` to modular `/css` structure
3. **Configuration**: Centralized all config in `config.js`
4. **Build System**: Enhanced Vite configuration with aliases and optimization

### Backward Compatibility

- All legacy functions still work
- Gradual migration path
- No breaking changes to existing HTML

## 🔮 Future Enhancements

### Planned Improvements

1. **Complete CSS Migration**: Move all styles to modular CSS files
2. **Component Library**: Create reusable UI components
3. **Testing Suite**: Add unit and integration tests
4. **State Management**: Implement centralized state management
5. **PWA Features**: Add offline capabilities and app manifest
6. **Performance Monitoring**: Add metrics and monitoring
7. **CI/CD Pipeline**: Automated testing and deployment

### Technical Debt

1. **Legacy CSS**: `style.css` needs to be broken down
2. **Legacy JS**: `main.js` needs to be removed
3. **HTML Updates**: Update all HTML files to use new structure
4. **Documentation**: Add JSDoc comments to all modules

## 📋 Development Guidelines

### Code Style

- Use ES6+ features
- Follow modular patterns
- Add comprehensive error handling
- Include JSDoc comments
- Use consistent naming conventions

### CSS Guidelines

- Use CSS custom properties
- Follow BEM methodology
- Mobile-first responsive design
- Accessibility best practices
- Performance optimization

### Git Workflow

- Feature branches for new development
- Clean commit messages
- Code review process
- Automated testing before merge

---

This organized structure provides a solid foundation for continued development while maintaining the professional appearance and functionality of the Eco Donations platform.
