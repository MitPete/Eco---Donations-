# 🚀 Scripts Directory

## 📁 Directory Structure

```
📁 scripts/
├── 📁 deployment/          # Contract deployment scripts
│   ├── deploy-production.js    # Production deployment
│   ├── deploy-sepolia.js       # Sepolia testnet
│   ├── deploy-local.js         # Local development
│   ├── deployGovernance.js     # Governance deployment
│   └── README.md               # Deployment documentation
│
├── 📁 testing/             # Testing scripts
│   ├── test-donation.js        # Test donation contracts
│   ├── test-auto-donations.js  # Test auto-donation system
│   ├── test-governance.js      # Test DAO governance
│   └── README.md               # Testing documentation
│
├── 📁 utils/               # Development utilities
│   ├── setup-user.js           # User account setup
│   ├── gas-analysis.js         # Gas usage analysis
│   ├── check-testnet-setup.js  # Network verification
│   └── README.md               # Utility documentation
│
├── 📁 samples/             # Sample data creation
│   ├── create-sample-donations.js     # Sample donations
│   ├── create-sample-auto-donations.js # Sample auto-donations
│   ├── createSampleProposals.js       # Sample proposals
│   └── README.md                      # Sample documentation
│
└── README.md               # This file
```

## Quick Reference

### Development

```bash
npm run dev:full          # Start contracts + frontend
npm run dev:contracts     # Local blockchain only
npm run dev:frontend      # Frontend development server
```

### Deployment

```bash
npm run deploy:local      # Deploy to local network
npm run deploy:testnet    # Deploy to Sepolia testnet
npm run deploy:production # Deploy to mainnet (with checks)
```

### Testing & Security

```bash
npm test                  # Run all tests
npm run security:analyze  # Security analysis
npm run test:coverage     # Coverage report
```

### Deployment Scripts (`scripts/deployment/`)

#### Local Development

- `deploy-local.js` - Deploy to local Hardhat network
- `deploy-organized.js` - Deploy with organized contract structure

#### Testnet Deployment

- `deploy-testnet.js` - Deploy to Sepolia testnet
- `deploy-sepolia.js` - Sepolia-specific deployment

#### Production Deployment

- `deploy-production.js` - Production deployment with safety checks
- `verify-contracts.js` - Contract verification on Etherscan

### Testing Scripts (`scripts/testing/`)

- `run-tests.js` - Custom test runner
- `coverage-report.js` - Generate coverage analysis
- `security-audit.js` - Security audit automation
- `stress-test.js` - Load and stress testing

### Utility Scripts (`scripts/utils/`)

- `setup-accounts.js` - Development account setup
- `gas-analysis.js` - Gas usage analysis
- `network-check.js` - Network connectivity validation
- `data-migration.js` - Data migration utilities

### Sample Data Scripts (`scripts/samples/`)

- `create-donations.js` - Generate sample donations
- `create-proposals.js` - Create governance proposals
- `populate-test-data.js` - Full test data population

## Script Usage

### Environment Setup

```bash
# First time setup
npm run setup:dev

# Account configuration
npm run setup:accounts

# Network validation
npm run check:network
```

### Development Workflow

```bash
# 1. Start local blockchain
npm run dev:contracts

# 2. Deploy contracts locally
npm run deploy:local

# 3. Start frontend development
npm run dev:frontend

# 4. Run tests
npm test
```

### Deployment Workflow

```bash
# 1. Run security analysis
npm run security:analyze

# 2. Deploy to testnet
npm run deploy:testnet

# 3. Verify contracts
npm run verify:sepolia

# 4. Run integration tests
npm run test:integration
```

## Configuration

### Network Configuration

Scripts read from `.env` file:

- `SEPOLIA_RPC_URL` - Testnet RPC endpoint
- `MAINNET_RPC_URL` - Mainnet RPC endpoint
- `PRIVATE_KEY` - Deployment wallet private key
- `ETHERSCAN_API_KEY` - Contract verification

### Gas Configuration

- `GAS_PRICE` - Gas price in gwei
- `MAX_FEE_PER_GAS` - Maximum fee per gas
- `MAX_PRIORITY_FEE_PER_GAS` - Priority fee

### Foundation Addresses

Update in `.env` before production deployment:

- `FOUNDATION_SAVE_THE_OCEANS`
- `FOUNDATION_PROTECT_RAINFOREST`
- `FOUNDATION_PROTECT_SEQUOIAS`
- `FOUNDATION_CLEAN_ENERGY`

## Security Guidelines

### Pre-Deployment Checklist

- [ ] Security analysis completed
- [ ] All tests passing
- [ ] Gas usage optimized
- [ ] Foundation addresses verified
- [ ] Multi-sig wallet configured
- [ ] Emergency procedures documented

### Production Deployment

1. **Never deploy directly to mainnet**
2. **Always test on testnet first**
3. **Use multi-signature wallet for admin functions**
4. **Verify all contract addresses**
5. **Document deployment for audit trail**

## Troubleshooting

### Common Issues

**"Network not found"**

- Check RPC URL in `.env`
- Verify network configuration in `hardhat.config.js`

**"Insufficient funds"**

- Ensure deployment wallet has enough ETH
- Check gas price settings

**"Contract verification failed"**

- Verify Etherscan API key
- Check contract source matches deployed bytecode

**"Transaction failed"**

- Check gas limits
- Verify contract dependencies are deployed

### Getting Help

1. Check script documentation
2. Review error logs in `logs/`
3. Validate environment configuration
4. Test on local network first

## Adding New Scripts

### Script Template

```javascript
// scripts/category/script-name.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Running script: script-name");

  // Script implementation

  console.log("✅ Script completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
```

### Adding to package.json

```json
{
  "scripts": {
    "script-name": "node scripts/category/script-name.js"
  }
}
```
