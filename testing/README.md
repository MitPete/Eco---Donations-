# 🧪 Testing Documentation

## Quick Start

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:e2e          # End-to-end tests

# Coverage and analysis
npm run test:coverage      # Generate coverage report
npm run test:gas          # Gas usage analysis
```

## Test Structure

### Unit Tests (`testing/unit/`) ✅

Tests individual contract functions in isolation:

- `DonationContract.test.js` ✅ - Core donation functionality
- `EcoCoin.test.js` ✅ - Token contract tests
- `EcoGovernance.test.js` ✅ - DAO governance tests
- `AutoDonation.test.js` ✅ - Auto-donation mechanism
- `MultiSigWallet.test.js` ✅ - Multi-signature wallet
- `SecurityConfig.test.js` ✅ - Security configuration system

### Integration Tests (`testing/integration/`)

Tests interactions between contracts:

- `automated-full-system-test.js` ✅ - Complete system test
- `donation-flow.test.js` - Complete donation process
- `governance-flow.test.js` - DAO voting workflow
- `token-economics.test.js` - Token minting/burning
- `multi-contract.test.js` - Cross-contract interactions

### Security Tests (`testing/security/`) ✅

Vulnerability and attack vector testing:

- `SecurityTests.js` ✅ - General security tests
- `ComprehensiveSecurityTests.js` ✅ - Thorough security analysis
- `reentrancy.test.js` - Reentrancy attack prevention
- `access-control.test.js` - Permission system tests

### Testing Utilities (`testing/utils/`) ✅

Comprehensive testing utilities and helpers:

- `test-helpers.js` ✅ - Common testing functions and setup utilities
- `deployment-helpers.js` ✅ - Contract deployment utilities
- `README.md` ✅ - Utility documentation and usage guide

### End-to-End Tests (`testing/e2e/`)

Complete user journey testing:

- `user-journey.test.js` - Full user workflows
- `frontend-backend.test.js` - Frontend-contract integration

## Test Configuration

### Coverage Targets

- **Unit Tests**: >90% coverage
- **Integration Tests**: >80% coverage
- **Security Tests**: 100% critical paths

### Performance Targets

- Test suite completes in <5 minutes
- Individual tests complete in <30 seconds
- Gas usage within expected limits

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Start local blockchain
npm run dev:contracts
```

### Test Commands

```bash
# Basic testing
npm test                   # All contract tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:security     # Security tests

# Advanced testing
npm run test:coverage     # Coverage report
npm run test:gas         # Gas analysis
npm run security:analyze  # Security analysis
```

### Test Reports

- Coverage reports: `coverage/`
- Gas reports: `testing/reports/gas-report.txt`
- Security reports: `security-reports/`

## Writing Tests

### Test File Template

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractName", function () {
  let contract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  describe("Function Name", function () {
    it("Should do something", async function () {
      // Test implementation
      expect(await contract.someFunction()).to.equal(expectedValue);
    });
  });
});
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch commits
- Release tags

CI Configuration: `.github/workflows/test.yml`
