# Security Contracts

This directory contains security-focused smart contracts that provide critical security infrastructure for the Eco Donations platform.

## Contracts

### SecurityConfig.sol

- **Purpose**: Centralized security configuration for all platform contracts
- **Key Features**:
  - Configurable transaction limits and daily withdraw limits
  - Emergency pause mechanisms with configurable delays
  - Multi-signature requirement management
  - Emergency responder management system
  - Security alert system for threat detection

### MultiSigWallet.sol

- **Purpose**: Multi-signature wallet for secure administrative operations
- **Key Features**:
  - Requires multiple signatures for critical functions
  - Transaction proposal and confirmation system
  - Revocation capabilities for pending transactions
  - Secure fund management for admin operations

## Security Architecture

These contracts work together to provide:

1. **Defense in Depth**: Multiple layers of security controls
2. **Emergency Response**: Quick reaction capabilities for security incidents
3. **Access Control**: Multi-signature requirements for critical operations
4. **Monitoring**: Event logging for security auditing
5. **Configuration Management**: Centralized security parameter control

## Integration

- SecurityConfig is referenced by other core contracts for security parameters
- MultiSigWallet is used for administrative functions requiring enhanced security
- Both contracts emit events for monitoring and alerting systems

## Development Notes

- All security contracts should undergo thorough security audits
- Emergency procedures should be documented and tested
- Security parameters should be carefully configured for production environments
