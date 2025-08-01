# Utility Scripts

This directory contains utility scripts for development, setup, and analysis.

## Setup Scripts

- `setup-user.js` - Set up test user accounts
- `setup-test-account.js` - Configure test accounts
- `setup-governance-testing.js` - Set up governance testing environment

## Network & Environment

- `check-testnet-setup.js` - Verify testnet configuration
- `dev-aliases.sh` - Development command aliases

## Analysis & Monitoring

- `gas-analysis.js` - Analyze gas usage patterns

## Usage

### JavaScript Utilities

```bash
npx hardhat run scripts/utils/[script-name].js
```

### Shell Scripts

```bash
chmod +x scripts/utils/dev-aliases.sh
source scripts/utils/dev-aliases.sh
```

## Purpose

These utilities help with:

- Development environment setup
- Testing account configuration
- Network connectivity verification
- Performance analysis
- Development workflow automation

## Dependencies

Most scripts require:

- Hardhat environment
- Network configuration
- Appropriate permissions for account setup
