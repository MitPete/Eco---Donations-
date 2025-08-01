# Testing Utilities

This directory contains utility functions and helpers for comprehensive testing across the Eco Donations platform.

## Files

### test-helpers.js

**Purpose**: Common testing utilities and helper functions

**Key Features**:

- Complete contract deployment setup
- Test account configuration with ECO tokens
- Auto-donation subscription setup
- Time manipulation for testing
- Balance checking utilities
- Multisig transaction helpers
- Sample data generation

**Usage**:

```javascript
const { TestHelpers } = require("../utils/test-helpers");

// Deploy all contracts
const contracts = await TestHelpers.deployAllContracts(signers);

// Setup test accounts with tokens
await TestHelpers.setupTestAccounts(ecoCoin, [user1, user2], ["100", "200"]);

// Create sample proposal
const proposalId = await TestHelpers.createSampleProposal(governance, user1);
```

### deployment-helpers.js

**Purpose**: Centralized contract deployment utilities

**Key Features**:

- Individual contract deployment functions
- Complete ecosystem deployment
- Minimal setup for focused testing
- Deployment verification
- Gas cost analysis

**Usage**:

```javascript
const { DeploymentHelpers } = require("../utils/deployment-helpers");

// Deploy individual contracts
const ecoCoin = await DeploymentHelpers.deployEcoCoin("1000000");
const multiSig = await DeploymentHelpers.deployMultiSigWallet(owners, 2);

// Deploy complete ecosystem
const ecosystem = await DeploymentHelpers.deployCompleteEcosystem(signers);

// Verify deployment
const verification = await DeploymentHelpers.verifyDeployment(
  ecosystem.contracts
);
```

## Common Testing Patterns

### Contract Setup

```javascript
// Standard setup for most tests
beforeEach(async function () {
  const signers = await ethers.getSigners();
  const contracts = await TestHelpers.deployAllContracts(signers);

  // Extract for easier access
  ({ ecoCoin, donation, governance } = contracts);
  [owner, user1, user2] = signers;
});
```

### Time-based Testing

```javascript
// For governance voting periods
await TestHelpers.advanceTime(86400); // 1 day
await TestHelpers.advanceToBlock(100); // Specific block
```

### Auto-donation Testing

```javascript
// Setup subscription
await TestHelpers.setupAutoDonationSubscription(autoDonation, user1, "fixed", {
  amount: ethers.utils.parseEther("0.01"),
});
```

### Multisig Testing

```javascript
// Setup multisig transaction
const txIndex = await TestHelpers.setupMultiSigTransaction(
  multiSig,
  owner,
  recipient.address,
  "1.0"
);
```

## Best Practices

1. **Consistent Setup**: Use helper functions for consistent test environments
2. **Isolated Tests**: Each test should be independent and not rely on previous test state
3. **Meaningful Data**: Use realistic values that reflect actual usage
4. **Error Testing**: Test both success and failure scenarios
5. **Gas Efficiency**: Monitor gas usage in deployment and execution

## Testing Categories

### Unit Tests

Use minimal setups focusing on single contract functionality:

```javascript
const { ecoCoin, owner, user1 } = await DeploymentHelpers.deployMinimalSetup(
  signers
);
```

### Integration Tests

Use complete ecosystem for cross-contract testing:

```javascript
const ecosystem = await DeploymentHelpers.deployCompleteEcosystem(signers);
```

### Performance Tests

Monitor gas costs and execution efficiency:

```javascript
const costs = await DeploymentHelpers.getDeploymentCosts(deploymentTx);
console.log(`Deployment cost: ${costs.costEth} ETH`);
```

## Environment Requirements

- **Hardhat**: Testing framework and local blockchain
- **Chai**: Assertion library for test expectations
- **Ethers.js**: Ethereum interaction library
- **Hardhat Network Helpers**: Time manipulation utilities

## Usage Notes

- Always call `deployed()` after contract deployment
- Use `parseEther()` for ETH amounts in tests
- Use `formatEther()` for readable balance assertions
- Handle async/await properly in all test functions
- Clean up state between tests using `beforeEach()`
