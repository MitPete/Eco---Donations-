# 🚀 Sepolia Testnet Deployment Guide

## Overview
This guide walks you through deploying the Eco Donations Platform to the Sepolia Ethereum testnet.

## Prerequisites

### 1. Get Sepolia ETH
You need at least **0.1 ETH** on Sepolia testnet for deployment. Get free testnet ETH from:

- **Primary**: https://sepoliafaucet.com/
- **Backup**: https://faucet.sepolia.dev/
- **Alternative**: https://sepolia-faucet.pk910.de/

### 2. Get RPC Access
Sign up for a free RPC provider:

- **Alchemy** (Recommended): https://alchemy.com/
  - Create account → Create app → Copy API key
  - URL format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

- **Infura**: https://infura.io/
  - URL format: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 3. Get Etherscan API Key
For contract verification:
- Go to: https://etherscan.io/apis
- Create account → API Keys → Generate key

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your values in `.env`:
```bash
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Deployment private key (use a dedicated deploy wallet!)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Foundation addresses (defaults to deployer)
FOUNDATION_OCEANS=0x...
FOUNDATION_RAINFOREST=0x...
FOUNDATION_SEQUOIAS=0x...
FOUNDATION_ENERGY=0x...

# Optional: Multi-sig configuration
MULTISIG_OWNERS=0xowner1,0xowner2,0xowner3
MULTISIG_REQUIRED=2
```

## Deployment Process

### 1. Deploy Contracts
```bash
npx hardhat run scripts/deploy-testnet.js --network sepolia
```

Expected output:
```
🧪 SEPOLIA TESTNET DEPLOYMENT
=============================
📡 Network: sepolia
🚀 Deploying with account: 0x...
💰 Account balance: 0.15 ETH

🔐 Deploying MultiSigWallet...
✅ MultiSigWallet deployed: 0x...

🪙 Deploying EcoCoin...
✅ EcoCoin deployed: 0x...

💝 Deploying DonationContract...
✅ DonationContract deployed: 0x...

🏛️ Deploying EcoGovernance...
✅ EcoGovernance deployed: 0x...

🤖 Deploying AutoDonationService...
✅ AutoDonationService deployed: 0x...

🎉 DEPLOYMENT SUCCESSFUL!
```

### 2. Test Deployment
```bash
npx hardhat run scripts/test-deployment.js --network sepolia
```

### 3. Verify Contracts (Optional)
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Post-Deployment

### 1. Update Frontend
The deployment script automatically updates:
- `./deployments/sepolia-deployment.json`
- `./frontend/src/contracts.json`

### 2. Test Major Functions
- Make a test donation
- Create governance proposal
- Set up auto-donation
- Test multi-sig operations

### 3. Configure Production
- Set real foundation addresses
- Configure proper multi-sig owners
- Set up monitoring and alerts

## Troubleshooting

### Rate Limits
If you see "Too Many Requests":
- Use paid RPC provider tier
- Add delays between transactions
- Use different RPC endpoints

### Gas Issues
If transactions fail due to gas:
- Increase gas limit in hardhat.config.js
- Check current gas prices on Etherscan
- Wait for lower congestion periods

### Private Key Issues
- Ensure no `0x` prefix in .env
- Use dedicated deploy wallet
- Keep private keys secure

## Security Checklist

- [ ] Deployer wallet has minimal ETH
- [ ] Private keys are secured
- [ ] Multi-sig owners are verified
- [ ] Foundation addresses are correct
- [ ] Emergency controls are tested
- [ ] Contract verification completed

## Gas Estimates

| Contract | Deployment Cost | Function Calls |
|----------|----------------|----------------|
| MultiSigWallet | ~2.1M gas | 50k-200k gas |
| EcoCoin | ~2.8M gas | 65k gas |
| DonationContract | ~3.2M gas | 150k-250k gas |
| EcoGovernance | ~4.1M gas | 100k-230k gas |
| AutoDonationService | ~2.9M gas | 80k-190k gas |
| **Total** | **~15M gas** | **Variable** |

At 20 gwei: ~0.3 ETH total deployment cost

## Next Steps

After successful Sepolia deployment:

1. **Frontend Integration**
   - Update network configuration
   - Test wallet connections
   - Verify all functions work

2. **User Testing**
   - Recruit beta testers
   - Create test scenarios
   - Collect feedback

3. **Security Audit**
   - Run automated scans
   - Manual code review
   - Penetration testing

4. **Production Prep**
   - Mainnet deployment planning
   - Legal compliance review
   - Marketing preparation

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Test on localhost first
4. Contact the development team

---

**⚠️ Important**: Always test thoroughly on testnet before mainnet deployment!
