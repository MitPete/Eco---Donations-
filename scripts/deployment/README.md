# Deployment Scripts

This directory contains all deployment scripts for the Eco Donations platform across different environments.

## Scripts

### Production Deployment

- `deploy-production.js` - Production deployment with security features
- `deploy-enhanced.js` - Enhanced deployment with additional features
- `deploy-organized.js` - Organized deployment script

### Network-Specific Deployment

- `deploy-sepolia.js` - Sepolia testnet deployment
- `deploy-testnet.js` - General testnet deployment
- `deploy-local.js` - Local development deployment

### Component Deployment

- `deploy.js` - Main deployment script
- `deployGovernance.js` - Governance system deployment
- `deploy-simple.js` - Simplified deployment script

## Usage

Each script can be run with Hardhat:

```bash
npx hardhat run scripts/deployment/[script-name].js --network [network-name]
```

## Network Configuration

Make sure your `hardhat.config.js` includes the target network configuration before deployment.

## Security Notes

- Always verify contract addresses after deployment
- Test on testnet before production deployment
- Keep deployment artifacts secure
