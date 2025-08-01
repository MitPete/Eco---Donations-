# Frontend Directory Structure

## Organized Frontend Architecture

### 📁 **public/** - Static public assets served directly

- `index.html` - Main entry point
- `dashboard.html` - Dashboard page
- `donate.html` - Donation page
- `foundation.html` - Foundation information
- `governance.html` - Governance interface
- `history.html` - Transaction history
- `whitepaper.html` - Project documentation
- `donate-alt.html` - Alternative donate layout
- `history-alt.html` - Alternative history layout

#### 📁 **public/assets/** - Static assets

- `ethers.umd.min.js` - Ethers.js library
- `badges/` - Achievement and status badges
- Images, icons, and other static files

#### 📁 **public/contracts/** - Contract artifacts for production

- `contracts.json` - Production contract addresses
- `contracts-testnet.json` - Testnet contract addresses
- `AutoDonationService.json` - Auto donation contract ABI
- `DonationContract.json` - Main donation contract ABI
- `EcoCoin.json` - ECO token contract ABI
- `MultiSigWallet.json` - MultiSig wallet contract ABI

### 📁 **src/** - Source code

#### 📁 **src/components/** - Reusable UI components

- React/Vue components or vanilla JS modules

#### 📁 **src/pages/** - Page-specific code

- Page-specific JavaScript and components

#### 📁 **src/services/** - Business logic and API calls

- `wallet.js` - Wallet connection and management
- `governance.js` - Governance functionality

#### 📁 **src/utils/** - Utility functions

- Helper functions and common utilities

#### 📁 **src/styles/** - CSS and styling

- `app.css` - Main application styles
- `base.css` - Base styles
- `dashboard.css` - Dashboard styles
- `donate.css` - Donation page styles
- `foundation.css` - Foundation page styles
- `governance.css` - Governance page styles
- `history.css` - History page styles
- `home.css` - Home page styles
- `mobile.css` - Mobile responsive styles
- `whitepaper.css` - Whitepaper styles
- And minified versions (.min.css)

#### 📁 **src/config/** - Configuration files

- `network-config.js` - Network and blockchain configuration

#### 📁 **src/scripts/** - Source scripts

- Build and development scripts

### 📁 **js/** - Legacy JavaScript modules (to be integrated)

- Existing modular JavaScript code

### 📁 **scripts/** - Build and utility scripts

- `optimize.sh` - Optimization script
- `server.cjs` - Server script
- `web-server.js` - Web server

### 📁 **tests/** - Test files

- `automated-browser-tests.js` - Browser automation tests
- `test-responsive.js` - Responsive design tests

### 📁 **docs/** - Documentation

- `ARCHITECTURE.md` - Frontend architecture documentation
- `CLEANUP_REPORT.md` - Cleanup process report
- `FRONTEND_CLEANUP_COMPLETED.md` - Cleanup completion status
- `FRONTEND_ORGANIZATION.md` - Organization guidelines
- `README.md` - Frontend documentation
- `REORGANIZATION_PLAN.md` - This reorganization plan

### 📁 **archive/** - Historical and backup files

- Cleaned up archive of old files

### 📄 **Root Configuration Files**

- `package.json` - NPM package configuration
- `package-lock.json` - Dependency lock file
- `vite.config.js` - Vite build configuration
- `.htaccess` - Server configuration

## Benefits of New Structure

1. **Clear Separation of Concerns**: Public assets, source code, and documentation are clearly separated
2. **Better Development Experience**: Easier to find and modify files
3. **Improved Build Process**: Clear distinction between source and built files
4. **Scalability**: Structure supports growth and additional features
5. **Maintainability**: Consistent organization makes the codebase easier to maintain
6. **Production Ready**: Clear separation between development and production assets

## Next Steps

1. Update import paths in HTML and JavaScript files
2. Configure build process to handle new structure
3. Update server configuration for new paths
4. Test all functionality after reorganization
5. Update any documentation that references old paths
