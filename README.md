# 🌍 Eco Donations Platform

> **Empowering environmental change through blockchain technology and transparent donations**

A comprehensive decentralized application (dApp) that revolutionizes environmental fundraising through blockchain technology, featuring automated micro-donations, transparent impact tracking, and a governance-driven ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-orange)](https://hardhat.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🚀 **Key Features**

### 💚 **Smart Donation System**

- **Direct Impact Donations**: Support verified environmental foundations with transparent fund allocation
- **ECO Token Rewards**: Earn governance tokens for every donation (10 ECO per 1 ETH)
- **Auto-Donation Technology**: Revolutionary micro-donation system that automatically contributes to causes with every blockchain transaction
- **Multi-Foundation Support**: Choose from Ocean Cleanup, Reforestation, Wildlife Conservation, and Renewable Energy initiatives

### � **Bridging the Gap: Zero-Crypto Nonprofit Integration**

- **Automatic Wallet Management**: Organizations receive crypto donations without any blockchain knowledge
- **Seamless Fiat Conversion**: Automated ETH-to-bank-account transfers with 3% platform fee
- **Professional Admin Dashboard**: Complete wallet management and conversion tools for administrators
- **Organization Onboarding**: Traditional nonprofits can receive crypto donations with zero technical setup
- **📖 [Full Documentation](docs/technical/BRIDGING_THE_GAP.md)**

### �🏛️ **DAO Governance**

- **Community-Driven Decisions**: Holders of ECO tokens can vote on platform improvements and fund allocations
- **Proposal System**: Submit and vote on new environmental initiatives
- **Transparent Governance**: All decisions recorded on-chain for complete transparency

### 📊 **Professional Dashboard**

- **Real-Time Impact Tracking**: Visual progress indicators showing your environmental contributions
- **Donation History**: Comprehensive transaction history with professional table styling
- **Achievement System**: Unlock badges and milestones based on your giving patterns
- **Statistics Overview**: Track total donations, ECO balance, and environmental impact metrics

### 🔐 **Advanced Wallet Integration**

- **Persistent Connection**: Seamless wallet connectivity across all platform pages
- **Multi-Network Support**: Works with Ethereum mainnet, testnets, and local development networks
- **MetaMask Optimization**: Enhanced integration with the most popular Web3 wallet

### 🎨 **Modern User Experience**

- **Professional UI/UX**: Modern design with smooth animations and responsive layouts
- **Mobile-First Design**: Optimized for all devices and screen sizes
- **Accessibility**: WCAG compliant interface ensuring inclusive access
- **Progressive Web App**: Fast loading with offline capabilities

## 🏗️ **Architecture Overview**

### **Smart Contract Layer**

```
📦 Smart Contracts
├── 🪙 EcoCoin.sol                 # ERC20 governance token with minting controls
├── 💝 Donation.sol               # Core donation logic with foundation management
├── 🤖 AutoDonation.sol           # Automated micro-donation subscription service
└── 🏛️ EcoGovernance.sol          # DAO governance and proposal management
```

### **Frontend Architecture**

```
📦 Frontend Application
├── 🏠 index.html                 # Landing page with hero section
├── 💖 donate.html                # Interactive donation interface
├── 📊 dashboard.html             # Personal impact dashboard
├── 📜 history.html               # Transaction history viewer
├── 🏢 foundation.html            # Foundation profiles and information
├── 🗳️ governance.html            # DAO governance interface
├── 🎨 css/                       # Modular CSS architecture
├── ⚡ js/modules/                # Modular JavaScript components
└── 📱 assets/                    # Images, videos, and static resources
```

### **Backend Infrastructure**

```
📦 Development Environment
├── ⚙️ hardhat.config.js          # Blockchain development configuration
├── 🚀 scripts/deploy.js          # Smart contract deployment automation
├── 🧪 test/                      # Comprehensive test suite
├── 📋 create-sample-*.js         # Demo data generation scripts
└── 🔧 network-config.js          # Multi-network deployment settings
```

## 🛠️ **Technology Stack**

### **Blockchain & Smart Contracts**

- **Solidity ^0.8.0**: Latest security features and gas optimizations
- **Hardhat**: Professional Ethereum development environment
- **OpenZeppelin**: Battle-tested smart contract libraries
- **Ethers.js v5**: Modern Ethereum library for blockchain interactions

### **Frontend Technologies**

- **Vanilla JavaScript**: Lightweight, fast, and SEO-friendly
- **Modern CSS3**: Advanced animations, grid layouts, and responsive design
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Vite**: Lightning-fast development server and build tool

### **Development Tools**

- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **GitHub Actions**: Continuous integration and deployment
- **Hardhat Network**: Local blockchain for development and testing

## 🚀 **Quick Start Guide**

### **Prerequisites**

- Node.js 18+ and npm
- MetaMask browser extension
- Git for version control

### **1. Installation**

```bash
# Clone the repository
git clone https://github.com/MitPete/Eco---Donations-
cd Eco---Donations-

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### **2. Local Development Setup**

```bash
# Start local blockchain (Terminal 1)
npx hardhat node

# Deploy contracts to local network (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend development server (Terminal 3)
cd frontend
npm start
```

### **3. Access the Application**

- **Frontend**: http://localhost:5173
- **Local Blockchain**: http://127.0.0.1:8545
- **Chain ID**: 31337 (for MetaMask configuration)

### **4. MetaMask Configuration**

Add local network to MetaMask:

- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Currency Symbol**: ETH

## 📖 **User Guide**

### **Making Your First Donation**

1. **Connect Wallet**: Click "Connect Wallet" on any page
2. **Choose Foundation**: Select from our verified environmental partners
3. **Set Amount**: Enter your donation amount in ETH
4. **Add Message**: Include an optional message for transparency
5. **Confirm Transaction**: Sign the transaction in MetaMask
6. **Earn Rewards**: Receive ECO tokens automatically

### **Setting Up Auto-Donations**

1. **Access Dashboard**: Navigate to your personal dashboard
2. **Find Auto-Donation Section**: Scroll to the automated giving section
3. **Configure Settings**: Choose fixed amount or percentage-based donations
4. **Set Limits**: Establish monthly spending caps for protection
5. **Select Cause**: Pick your preferred environmental focus
6. **Activate**: Save settings and start effortless giving

### **Participating in Governance**

1. **Hold ECO Tokens**: Ensure you have governance tokens from donations
2. **View Proposals**: Check active proposals on the governance page
3. **Research & Discuss**: Review proposal details and community feedback
4. **Cast Vote**: Submit your vote using your ECO token voting power
5. **Track Results**: Monitor proposal outcomes and implementation

## 🧪 **Testing & Quality Assurance**

### **Running Tests**

```bash
# Run all smart contract tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/DonationContract.js

# Run tests on specific network
npx hardhat test --network localhost
```

### **Test Coverage**

- ✅ **Unit Tests**: Individual contract function testing
- ✅ **Integration Tests**: Cross-contract interaction testing
- ✅ **Edge Case Testing**: Boundary condition and error handling
- ✅ **Gas Optimization**: Cost analysis and optimization verification

### **Security Auditing**

- **Slither Analysis**: Automated vulnerability detection
- **OpenZeppelin Standards**: Industry-standard security practices
- **Manual Review**: Line-by-line security assessment
- **Community Testing**: Open-source transparency and peer review

## 🔐 **Security Features**

### **Smart Contract Security**

- **Reentrancy Protection**: OpenZeppelin's ReentrancyGuard implementation
- **Access Control**: Role-based permissions and ownership patterns
- **Input Validation**: Comprehensive parameter checking and sanitization
- **Safe Math Operations**: Overflow/underflow protection with Solidity 0.8+

### **Frontend Security**

- **CSP Headers**: Content Security Policy for XSS prevention
- **Input Sanitization**: Client-side validation and encoding
- **Secure Communication**: HTTPS enforcement and secure headers
- **Wallet Security**: Best practices for private key protection

## 🌐 **Deployment Guide**

### **Testnet Deployment (Sepolia)**

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### **Mainnet Deployment**

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Set up production environment
npm run build
npm run deploy:production
```

### **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Configure required variables
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 📊 **Platform Metrics**

### **Environmental Impact**

- **Total Donations**: $XXX,XXX+ in environmental funding
- **Foundations Supported**: 4 verified environmental organizations
- **Trees Planted**: XXX,XXX+ through reforestation initiatives
- **Ocean Areas Protected**: XXX+ square kilometers
- **Carbon Offset**: XXX+ tons of CO₂ equivalent

### **Platform Statistics**

- **Active Users**: XXX+ verified donors
- **Transactions**: XXX,XXX+ completed donations
- **ECO Tokens Distributed**: XXX,XXX+ governance tokens
- **Auto-Donations**: XXX+ automated micro-donations
- **Governance Proposals**: XX+ community decisions

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

### **Development Contributions**

1. **Fork the Repository**: Create your own copy for development
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your improvements with tests
4. **Run Tests**: Ensure all tests pass and coverage is maintained
5. **Submit Pull Request**: Describe your changes and their impact

### **Bug Reports & Feature Requests**

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Documentation**: Help improve our documentation and guides
- **Testing**: Participate in beta testing and provide feedback
- **Community**: Join our Discord for discussions and support

### **Development Guidelines**

- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Include tests for all new features and bug fixes
- **Documentation**: Update relevant documentation for changes
- **Security**: Follow security best practices and report vulnerabilities

## 📜 **License & Legal**

### **Open Source License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Third-Party Licenses**

- **OpenZeppelin**: MIT License
- **Ethers.js**: MIT License
- **Hardhat**: MIT License
- **Node.js**: MIT License

### **Disclaimer**

This software is provided "as is" without warranty. Users are responsible for their own due diligence when interacting with smart contracts and blockchain technology.

## 🔗 **Links & Resources**

### **Official Links**

- **Website**: https://eco-donations.vercel.app
- **GitHub**: https://github.com/MitPete/Eco---Donations-
- **Documentation**: Coming soon
- **Community Discord**: Coming soon

### **Partner Organizations**

- **Ocean Cleanup Foundation**: Ocean plastic removal initiatives
- **Reforestation Alliance**: Global tree planting and forest restoration
- **Wildlife Conservation Society**: Endangered species protection
- **Renewable Energy Coalition**: Clean energy development projects

### **Technical Resources**

- **Ethereum Documentation**: https://ethereum.org/developers
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin**: https://openzeppelin.com/contracts
- **Ethers.js**: https://docs.ethers.io

---

## 🙏 **Acknowledgments**

Special thanks to:

- **Environmental Partners**: For their crucial work in protecting our planet
- **Open Source Community**: For the tools and libraries that make this possible
- **Early Contributors**: For testing, feedback, and improvements
- **Web3 Ecosystem**: For building the infrastructure for decentralized applications

---

<div align="center">

**Together, we can create a sustainable future through technology and transparency.**

[🌍 Visit Platform](https://eco-donations.vercel.app) | [📖 Documentation](./docs) | [💬 Community](https://discord.gg/eco-donations)

</div>
