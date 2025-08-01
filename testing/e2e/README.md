# End-to-End User Journey Tests

This directory contains comprehensive end-to-end tests that simulate real user interactions with the complete Eco Donations platform.

## Test File

### e2e-user-journey-tests.js

**Purpose**: Comprehensive user journey testing from a user's perspective

**Test Scenarios**:

#### 👤 User Journey 1: New User Complete Donation Flow

- First-time user (Alice) makes donation
- Receives ECO token rewards
- Verifies foundation receives funds
- Checks donation history tracking

#### 🔄 User Journey 2: Auto-Donation Setup and Execution

- User (Bob) sets up auto-donation subscription
- Configures fixed amount with monthly limits
- Tests auto-donation triggering
- Verifies ECO rewards for auto-donations

#### 🗳️ User Journey 3: DAO Governance Participation

- User (Charlie) creates governance proposal
- Multiple users vote on proposal
- Tests proposal execution
- Verifies governance state transitions

#### 🔐 User Journey 4: Multi-Signature Security Operations

- Security team uses multi-sig wallet
- Creates and confirms transactions
- Tests execution with required signatures
- Verifies security operations

#### 🔄 User Journey 5: Complete Platform Integration

- User (Emma) engages with all platform features
- Multiple donations across foundations
- Auto-donation setup and triggering
- Governance participation
- Comprehensive platform utilization

#### 📊 Platform Health Check

- Overall platform status verification
- Contract operational status
- System integrity validation

## Key Features Tested

### User Experience Flow

- **Onboarding**: New user first interaction
- **Core Features**: Donation, auto-donation, governance
- **Advanced Features**: Multi-sig operations, security
- **Integration**: Cross-feature functionality

### Real-World Scenarios

- **Multiple Users**: Concurrent user interactions
- **Various Amounts**: Different donation sizes
- **Time Dependencies**: Governance voting periods
- **Error Handling**: Edge cases and failures

### Platform Validation

- **State Consistency**: Data integrity across interactions
- **Event Emissions**: Proper event logging
- **Balance Tracking**: Accurate fund management
- **Permission Systems**: Access control validation

## Usage

### Run E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run with detailed output
npx hardhat test testing/e2e/e2e-user-journey-tests.js --verbose

# Run on specific network
npx hardhat test testing/e2e/e2e-user-journey-tests.js --network localhost
```

### Test Environment Requirements

- **Local Hardhat Network**: For consistent testing environment
- **Multiple Test Accounts**: Minimum 15 accounts for all user roles
- **Sufficient ETH**: Test accounts need ETH for transactions
- **Clean State**: Fresh deployment for each test run

## Test Data and Scenarios

### User Personas

- **Alice**: First-time donor, simple usage
- **Bob**: Auto-donation user, recurring giving
- **Charlie**: DAO participant, governance focused
- **David**: Multi-sig recipient, security operations
- **Emma**: Power user, full platform engagement

### Foundation Distribution

- Foundation 0: SaveTheOceans
- Foundation 1: ProtectTheRainforest
- Foundation 2: CleanEnergy
- Foundation 3: Wildlife Protection
- Foundation 4: Climate Action

### Test Amounts

- Small donations: 0.05 - 0.5 ETH
- Medium donations: 1.0 - 5.0 ETH
- Large donations: 10+ ETH
- Auto-donations: 0.01 - 0.1 ETH per trigger

## Expected Outcomes

### Successful Test Run

- All user journeys complete without errors
- Proper ECO token distribution
- Accurate fund transfers to foundations
- Correct governance proposal lifecycle
- Valid multi-sig operations
- Platform health verification passes

### Performance Expectations

- Fast transaction processing
- Efficient gas usage
- Minimal state bloat
- Consistent response times

## Monitoring and Validation

### Balance Tracking

- ETH balances for all parties
- ECO token distribution accuracy
- Foundation fund accumulation

### Event Verification

- Donation events emitted correctly
- Governance events tracked
- Security alerts logged
- Multi-sig events recorded

### State Verification

- Consistent contract states
- Proper permission maintenance
- Accurate counters and limits
- Valid configuration parameters

## Notes

- Tests simulate realistic user behavior patterns
- Includes both happy path and edge case scenarios
- Validates entire user journey from start to finish
- Ensures platform readiness for production deployment
- Tests are designed to be repeatable and deterministic
