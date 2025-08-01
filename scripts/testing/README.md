# Testing Scripts

This directory contains comprehensive testing scripts for all platform components.

## Test Scripts

### Core Contract Testing

- `test-donation.js` - Test donation contract functionality
- `test-eco-tokens.js` - Test ECO token contract
- `test-governance.js` - Test DAO governance system
- `test-auto-donations.js` - Test auto-donation service

### Integration Testing

- `test-deployment.js` - Test deployment process
- `test-local-donation.js` - Test local donation flows

## Usage

Run tests with Hardhat:

```bash
# Run specific test
npx hardhat run scripts/testing/[test-name].js

# Run with specific network
npx hardhat run scripts/testing/[test-name].js --network localhost
```

## Test Categories

- **Unit Tests**: Individual contract function testing
- **Integration Tests**: Cross-contract interaction testing
- **End-to-End Tests**: Complete user flow testing
- **Security Tests**: Security vulnerability testing

## Requirements

- Local Hardhat node running for integration tests
- Test accounts with sufficient ETH
- Deployed contracts for integration testing
