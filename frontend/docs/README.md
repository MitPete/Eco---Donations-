# Eco Donations Frontend

A modern, responsive frontend for the Eco Donations blockchain-powered environmental donation platform.

## 🌱 About

Eco Donations is a decentralized application (DApp) that allows users to make environmental donations using Ethereum and earn ECO tokens as rewards. The frontend provides an intuitive interface for connecting wallets, making donations, viewing impact metrics, and tracking donation history.

## 🚀 Features

- **Wallet Integration**: MetaMask wallet connection with automatic reconnection
- **Donation Management**: Easy donation interface with multiple foundation options
- **Impact Tracking**: Real-time visualization of environmental impact
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Modular Architecture**: Clean, maintainable code structure
- **Dark Mode Support**: Automatic theme switching based on user preference

## 🏗️ Architecture

The frontend follows a modular architecture with clear separation of concerns:

```
frontend/
├── js/
│   ├── app.js                 # Main application entry point
│   ├── config.js              # Configuration constants
│   ├── modules/               # Feature modules
│   │   ├── wallet.js         # Wallet management
│   │   ├── donation.js       # Donation handling
│   │   └── home.js           # Home page functionality
│   └── utils/                 # Utility functions
│       └── helpers.js        # Helper functions
├── css/
│   ├── base.css              # Base styles and variables
│   ├── components/           # Component-specific styles
│   │   └── header.css        # Header component styles
│   └── pages/                # Page-specific styles
├── assets/                   # Static assets
├── *.html                    # HTML pages
└── package.json              # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Blockchain**: Ethers.js v6
- **Styling**: Custom CSS with CSS Variables
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/eco-donations/frontend.git
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Configuration

The application configuration is centralized in `js/config.js`:

```javascript
// Network configuration
export const NETWORK_CONFIG = {
  RPC_URL: "http://localhost:8545",
  CHAIN_ID: "31337",
  CHAIN_NAME: "Localhost 31337",
};

// Contract addresses
export const CONTRACT_CONFIG = {
  ECO_COIN_ADDRESS: "0x...",
  DONATION_ADDRESS: "0x...",
};
```

### Module System

The application uses ES6 modules with clear imports/exports:

```javascript
// Import specific functions
import { connectWallet, isWalletConnected } from "./modules/wallet.js";
import { makeDonation, getAllDonations } from "./modules/donation.js";

// Use in your code
if (isWalletConnected()) {
  await makeDonation(foundationId, amount, message);
}
```

## 🎨 Styling

### CSS Architecture

The styling follows a component-based approach with CSS custom properties:

```css
/* CSS Variables for consistency */
:root {
  --brand-primary: #28c76f;
  --brand-secondary: #0066ff;
  --border-radius: 14px;
  --transition: 0.25s ease;
}

/* Component styling */
.component {
  background: var(--brand-primary);
  border-radius: var(--border-radius);
  transition: var(--transition);
}
```

### Responsive Design

Mobile-first approach with breakpoints:

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🔗 Smart Contract Integration

The frontend integrates with Ethereum smart contracts using Ethers.js:

```javascript
// Contract initialization
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Making a donation
const tx = await contract.donate(foundationId, message, {
  value: ethers.parseEther(amount),
});
```

## 📱 Pages

### Home Page (`index.html`)

- Hero section with video background
- Statistics banner
- Impact metrics
- Foundation showcase
- How it works section

### Donation Page (`donate.html`)

- Foundation selection
- Amount input with quick options
- Message input
- Transaction confirmation

### History Page (`history.html`)

- Donation history table
- Statistics dashboard
- Impact metrics
- Donor rankings

### Foundation Page (`foundation.html`)

- Foundation details
- Impact statistics
- Donation history
- Foundation-specific metrics

## 🔐 Security

- Client-side validation for all inputs
- Secure wallet connection handling
- Transaction confirmation flows
- Error handling for blockchain interactions

## 🌍 Environment Variables

Create a `.env` file for environment-specific configurations:

```env
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
VITE_ECO_COIN_ADDRESS=0x...
VITE_DONATION_ADDRESS=0x...
```

## 📊 Performance

- Lazy loading for components
- Optimized asset loading
- Efficient state management
- Minimal bundle size

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Configure environment variables** for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ethereum Foundation for blockchain infrastructure
- MetaMask for wallet integration
- Vite for build tooling
- Inter font family for typography

---

**Built with ❤️ for the environment 🌍**
