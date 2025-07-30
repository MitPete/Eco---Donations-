# 🧪 TESTNET DEPLOYMENT GUIDE

## Overview
This guide covers the deployment of ECO-Donations contracts to Sepolia testnet.

## Prerequisites
1. **Testnet ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Alchemy API Key**: Sign up at [Alchemy](https://alchemy.com/)
3. **Etherscan API Key**: Get from [Etherscan](https://etherscan.io/apis)

## Environment Setup
```bash
# Copy and configure environment
cp .env.example .env

# Add your keys:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
```

## Deployment Commands
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy-testnet.js --network sepolia

# Verify contracts
npx hardhat run scripts/verify-contracts.js --network sepolia

# Test deployment
npx hardhat run scripts/test-deployment.js --network sepolia
```

## Post-Deployment Checklist
- [ ] Update frontend/contracts.json with testnet addresses
- [ ] Test all contract functions via frontend
- [ ] Verify gas costs are reasonable
- [ ] Test auto-donation functionality
- [ ] Verify governance voting works
- [ ] Document any issues found

## Gas Cost Estimates (Sepolia)
- EcoCoin Deployment: ~1,200,000 gas
- DonationContract: ~2,500,000 gas
- Governance: ~1,800,000 gas
- MultiSig: ~800,000 gas
- AutoDonation: ~1,000,000 gas
- **Total Estimated**: ~7,300,000 gas (~0.15 ETH at 20 gwei)

## Contract Addresses (Testnet)
*Updated after deployment*

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contracts": {
    "ecoCoin": "TBD",
    "donationContract": "TBD", 
    "ecoGovernance": "TBD",
    "multiSigWallet": "TBD",
    "autoDonationService": "TBD"
  }
}
```

## Testing Guide
1. Connect MetaMask to Sepolia
2. Get test ETH from faucet
3. Test donation flow end-to-end
4. Verify ECO token balance updates
5. Test governance proposal creation
6. Validate auto-donation triggers

## Troubleshooting
- **Out of gas**: Increase gas limit in hardhat.config.js
- **Nonce issues**: Reset MetaMask account
- **RPC errors**: Check Alchemy URL and limits
- **Verification fails**: Ensure contract source matches
