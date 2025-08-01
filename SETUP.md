# 🚀 Eco Donations Platform - Setup Guide

## 📋 Quick Start (5 minutes)

```bash
# 1. Clone and setup
git clone https://github.com/MitPete/Eco---Donations-.git
cd Eco---Donations-
npm run setup:dev

# 2. Configure environment
cp .env.comprehensive .env
# Edit .env with your API keys

# 3. Start development
npm run dev:full
```

## 📁 Project Overview

This is a comprehensive blockchain-powered environmental donation platform with:

- **Smart Contracts**: Solidity contracts for donations, governance, and token management
- **Frontend**: Modern web interface with Vite.js
- **Testing**: Comprehensive test suite with security analysis
- **Scripts**: Automated deployment and utility scripts

## 🛠️ Prerequisites

### Required

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** or Web3 wallet

### Optional (for advanced features)

- **Python 3** (for Slither security analysis)
- **Docker** (for containerized development)

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/MitPete/Eco---Donations-.git
cd Eco---Donations-
```

### 2. Install Dependencies

```bash
# Install all dependencies (contracts + frontend)
npm run setup:dev

# Or install separately
npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.comprehensive .env

# Edit with your configuration
nano .env  # or your preferred editor
```

### Required Environment Variables

```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
LOCAL_RPC_URL=http://127.0.0.1:8545

# Deployment wallet
PRIVATE_KEY=your_private_key_here

# Contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Foundation addresses (update with real addresses)
FOUNDATION_SAVE_THE_OCEANS=0x1111...
FOUNDATION_PROTECT_RAINFOREST=0x2222...
```

## 🚀 Development Workflow

### Start Development Environment

```bash
# Start everything (recommended)
npm run dev:full

# Or start components separately
npm run dev:contracts          # Local blockchain
npm run dev:frontend          # Frontend dev server
```

### Deploy Contracts

```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet

# Verify contracts
npm run verify:sepolia
```

### Run Tests

```bash
# All tests
npm test

# Specific test categories
npm run test:unit             # Unit tests
npm run test:integration      # Integration tests
npm run test:security         # Security tests
npm run test:coverage         # Coverage report
```

## 📂 Project Structure

```
📁 Eco---Donations-/
├── 📄 package.json           # Main project configuration
├── 📄 hardhat.config.js      # Hardhat blockchain configuration
├── 📄 .env                   # Environment variables (create from template)
├── 📄 PROJECT_STRUCTURE.md   # Detailed project organization
│
├── 📁 contracts/             # Smart contracts
│   ├── 📁 core/              # Production contracts
│   ├── 📁 interfaces/        # Contract interfaces
│   └── 📁 versions/          # Version history
│
├── 📁 frontend/              # Web application
│   ├── 📁 src/               # Source code
│   ├── 📁 public/            # Static assets
│   └── 📄 vite.config.js     # Frontend build configuration
│
├── 📁 testing/               # Test suite
│   ├── 📁 unit/              # Unit tests
│   ├── 📁 integration/       # Integration tests
│   ├── 📁 security/          # Security tests
│   └── 📁 e2e/               # End-to-end tests
│
├── 📁 scripts/               # Development scripts
│   ├── 📁 deployment/        # Deployment scripts
│   ├── 📁 testing/           # Testing utilities
│   └── 📁 utils/             # Utility scripts
│
└── 📁 docs/                  # Documentation
```

## 🧪 Testing

### Test Categories

- **Unit Tests**: Individual contract functions
- **Integration Tests**: Contract interactions
- **Security Tests**: Vulnerability analysis
- **E2E Tests**: Complete user workflows

### Running Tests

```bash
# Quick test
npm test

# Comprehensive testing
npm run test:unit && npm run test:integration && npm run test:security

# With coverage
npm run test:coverage

# Gas analysis
npm run test:gas
```

## 🔒 Security

### Security Analysis

```bash
# Run security analysis
npm run security:analyze

# Slither static analysis (requires Python)
npm run security:slither

# Generate security report
npm run security:audit
```

### Security Features

- ✅ Reentrancy protection
- ✅ Access controls
- ✅ Multi-signature wallet
- ✅ Pausable contracts
- ✅ Input validation
- ✅ Integer overflow protection

## 🌐 Deployment

### Local Development

```bash
# Start local blockchain
npm run dev:contracts

# Deploy contracts
npm run deploy:local

# Access frontend
open http://localhost:8888
```

### Testnet Deployment

```bash
# Configure testnet RPC in .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Deploy to testnet
npm run deploy:testnet

# Verify on Etherscan
npm run verify:sepolia
```

### Production Deployment

```bash
# Security checklist first!
npm run security:analyze

# Deploy to mainnet (with confirmation prompts)
npm run deploy:production
```

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**"Network connection failed"**

```bash
# Check RPC URL in .env
# Verify API key is valid
npm run check:network
```

**"Transaction failed"**

```bash
# Check gas settings
# Verify account has sufficient funds
# Review transaction parameters
```

**"Contract verification failed"**

```bash
# Verify Etherscan API key
# Check contract compilation settings
# Ensure source code matches deployed bytecode
```

### Getting Help

1. **Check Documentation**: `docs/` folder
2. **Review Project Structure**: `PROJECT_STRUCTURE.md`
3. **Test Issues**: `testing/README.md`
4. **Script Issues**: `scripts/README.md`
5. **Create Issue**: GitHub Issues

## 📚 Additional Resources

### Documentation

- [Smart Contracts](contracts/CONTRACTS_README.md)
- [Frontend Guide](frontend/FRONTEND_ORGANIZATION.md)
- [Testing Guide](testing/TESTING_ORGANIZATION.md)
- [Security Analysis](security-reports/)

### External Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Community

- GitHub: [Eco Donations Repository](https://github.com/MitPete/Eco---Donations-)
- Discord: [Join Community](https://discord.gg/ecodonations) _(if available)_

---

## 🎯 Next Steps

After setup:

1. **Explore the Code**: Review contract interfaces and frontend components
2. **Run Tests**: Ensure everything works in your environment
3. **Deploy Locally**: Test the full system locally
4. **Contribute**: Check issues and contribution guidelines

Happy coding! 🌱💚
