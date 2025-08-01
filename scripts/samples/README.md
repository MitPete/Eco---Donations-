# Sample Data Scripts

This directory contains scripts for creating sample data and test scenarios.

## Sample Creation Scripts

### Donation Samples

- `create-sample-donations.js` - Create sample donation transactions
- `create-sample-auto-donations.js` - Create sample auto-donation setups

### Governance Samples

- `createSampleProposals.js` - Create sample governance proposals

## Usage

Run sample creation scripts:

```bash
npx hardhat run scripts/samples/[script-name].js --network [network-name]
```

## Purpose

These scripts help with:

- **Demo Preparation**: Create realistic sample data for demonstrations
- **Testing**: Generate test data for comprehensive testing scenarios
- **Development**: Populate contracts with sample data during development

## Sample Data Types

- **Donations**: Various donation amounts and recipient foundations
- **Auto-Donations**: Different subscription types and configurations
- **Governance Proposals**: Sample proposals for DAO testing

## Requirements

- Deployed contracts on target network
- Test accounts with sufficient ETH
- Proper network configuration in Hardhat

## Note

Sample scripts should only be used in development/testing environments, never in production.
