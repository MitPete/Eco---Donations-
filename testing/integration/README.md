# Integration Tests

This directory contains comprehensive integration tests that verify contract interactions and system-wide functionality.

## Test Files

### automated-full-system-test.js

**Purpose**: Comprehensive automated testing of the complete integrated system

**Test Categories**:

#### 🔗 Core Contract Integration

- Verifies all contracts are properly connected
- Tests contract address references and dependencies
- Validates permission systems and access controls
- Ensures proper ownership and role assignments

#### 💰 Donation Flow Integration

- Tests donation processing across multiple users
- Verifies ECO token reward integration
- Validates foundation fund distribution
- Tests edge cases and error conditions

#### 🔄 Auto-Donation System Integration

- Tests auto-donation integration with donation contract
- Verifies ECO reward integration for auto-donations
- Tests percentage-based donations with limits
- Validates monthly limit tracking and enforcement

#### 🗳️ Governance System Integration

- Tests governance integration with ECO token voting power
- Verifies proposal creation, voting, and execution
- Tests governance parameter updates
- Handles proposal execution failures gracefully

#### 🔐 Security System Integration

- Tests SecurityConfig integration with MultiSigWallet
- Verifies emergency alert systems
- Tests emergency pause scenarios across contracts
- Validates security parameter management

#### 📊 System Performance and Limits

- Tests high-volume operations efficiency
- Verifies system limits and constraints enforcement
- Validates ECO token supply limits
- Tests auto-donation monthly limits

#### 🔄 Cross-Contract State Consistency

- Verifies state consistency across all contracts
- Tests integrated operations maintain proper state
- Validates counter and balance accuracy
- Ensures data integrity across transactions

## Key Integration Points Tested

### Contract Dependencies

- **DonationContract ↔ EcoCoin**: Token rewards for donations
- **AutoDonation ↔ DonationContract**: Auto-donation execution
- **AutoDonation ↔ EcoCoin**: Token rewards for auto-donations
- **Governance ↔ EcoCoin**: Voting power from token holdings
- **SecurityConfig ↔ MultiSigWallet**: Security operations
- **All Contracts ↔ Access Control**: Permission systems

### Data Flow Integration

- **Donation Flow**: ETH → Foundation, ECO → Donor
- **Auto-Donation Flow**: Trigger → Donation → Rewards
- **Governance Flow**: Proposal → Voting → Execution
- **Security Flow**: Alert → Response → Action

### State Synchronization

- Total donation counters
- ECO token supply management
- User balance tracking
- Foundation fund accumulation
- Voting power calculations
- Security parameter consistency

## Test Scenarios

### Multi-User Operations

- Concurrent donations from multiple users
- Simultaneous auto-donation triggering
- Parallel governance participation
- Multi-sig operations with multiple signers

### Cross-Contract Workflows

- Donation → ECO minting → Governance participation
- Auto-donation → Foundation funding → Security monitoring
- Governance → Security parameter updates → Multi-sig execution
- Emergency scenarios → Pause propagation → System recovery

### System Limits Testing

- ECO token maximum supply enforcement
- Auto-donation monthly limits
- Governance proposal thresholds
- Multi-sig confirmation requirements

## Performance Testing

### Load Testing

- Multiple rapid donations
- Concurrent auto-donation triggers
- High-frequency governance voting
- Bulk operations efficiency

### Gas Optimization

- Transaction cost monitoring
- Contract interaction efficiency
- State update optimization
- Event emission costs

### Scalability Testing

- Large user base simulation
- High transaction volume
- Complex proposal execution
- Extended operation periods

## Usage

### Run Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npx hardhat test testing/integration/automated-full-system-test.js

# Run with gas reporting
npx hardhat test testing/integration/automated-full-system-test.js --gas

# Run with coverage
npx hardhat coverage --testfiles testing/integration/
```

### Test Environment Setup

```bash
# Start local hardhat node
npx hardhat node

# Deploy contracts for testing
npx hardhat run scripts/deployment/deploy-local.js --network localhost

# Run integration tests
npm run test:integration
```

## Expected Results

### Successful Integration

- All contract connections verified
- Cross-contract operations function correctly
- State consistency maintained across operations
- Performance meets expectations
- System limits properly enforced

### Test Metrics

- **Contract Coverage**: 100% of integration points tested
- **User Scenarios**: Multiple user types and behaviors
- **Transaction Volume**: High-load performance validated
- **Error Handling**: Edge cases and failures managed
- **State Validation**: Data integrity verified

## Monitoring and Validation

### Integration Health Checks

- Contract connectivity status
- Permission system integrity
- State synchronization accuracy
- Performance benchmarks
- Resource utilization

### Failure Detection

- Transaction reversion handling
- State inconsistency detection
- Performance degradation alerts
- Resource exhaustion warnings
- Security parameter violations

### Recovery Testing

- System recovery from failures
- State restoration procedures
- Emergency operation modes
- Graceful degradation handling

## Integration Report

The test suite generates a comprehensive integration report including:

- **System Overview**: All contract addresses and status
- **Integration Status**: Connection verification results
- **Performance Metrics**: Transaction costs and timing
- **State Summary**: Final system state after testing
- **Recommendations**: Any issues or optimizations identified

## Continuous Integration

### Automated Testing

- Run on every commit
- Full system deployment and testing
- Performance regression detection
- Integration point validation

### Test Data Management

- Consistent test environments
- Reproducible test scenarios
- Clean state initialization
- Deterministic outcomes

## Notes

- Tests are designed to run against a complete deployed system
- All integration points between contracts are validated
- Performance characteristics are monitored and reported
- Tests simulate realistic production load patterns
- Results provide confidence for production deployment
