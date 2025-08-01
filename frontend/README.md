# Eco Donations Frontend

A modern, organized frontend for the Eco Donations platform built with vanilla JavaScript, CSS, and HTML.

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static files served directly
│   ├── *.html             # All page templates
│   ├── assets/            # Static assets (images, libraries)
│   └── contracts/         # Contract ABIs and addresses
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-specific logic
│   ├── services/          # Business logic (wallet, governance)
│   ├── styles/            # CSS stylesheets
│   └── config/            # Configuration files
├── js/                    # Legacy modular JavaScript (being integrated)
├── scripts/               # Build and utility scripts
├── tests/                 # Test files
├── docs/                  # Documentation
└── archive/               # Historical files
```

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📱 Pages

- **Home** (`index.html`) - Landing page and platform overview
- **Donate** (`donate.html`) - Make donations to foundations
- **Dashboard** (`dashboard.html`) - User dashboard and analytics
- **Governance** (`governance.html`) - DAO governance interface
- **History** (`history.html`) - Transaction history
- **Foundation** (`foundation.html`) - Foundation information
- **Whitepaper** (`whitepaper.html`) - Project documentation

## 🔧 Features

- **Wallet Integration** - MetaMask and WalletConnect support
- **Real-time Updates** - Live transaction tracking
- **Responsive Design** - Mobile-first approach
- **Modular Architecture** - Component-based structure
- **Performance Optimized** - Minified assets and lazy loading
- **Security Focused** - Safe contract interactions

## 🛠️ Development

### File Organization

- **Components**: Reusable UI elements in `src/components/`
- **Services**: Business logic in `src/services/`
- **Styles**: CSS organized by feature in `src/styles/`
- **Config**: Network and app configuration in `src/config/`

### Key Services

- `src/services/wallet.js` - Wallet connection and management
- `src/services/governance.js` - DAO governance functionality
- `src/config/network-config.js` - Blockchain network settings

### Styling

- Modular CSS with feature-specific stylesheets
- Responsive design with mobile-first approach
- Minified production builds for performance

## 🧪 Testing

```bash
# Run browser tests
npm run test:browser

# Run responsive tests
npm run test:responsive
```

## 🔧 Build Process

The build system uses Vite for:

- Module bundling
- CSS preprocessing
- Asset optimization
- Development server

## 📖 Documentation

- See `docs/` directory for detailed documentation
- `STRUCTURE.md` - Complete directory structure
- `docs/ARCHITECTURE.md` - Frontend architecture details

## 🌐 Deployment

1. Build production assets: `npm run build`
2. Deploy `dist/` directory to your web server
3. Configure `.htaccess` for proper routing

## 🤝 Contributing

1. Follow the established file structure
2. Use consistent naming conventions
3. Update documentation for new features
4. Test on multiple browsers and devices

## 📄 License

MIT License - see LICENSE file for details
