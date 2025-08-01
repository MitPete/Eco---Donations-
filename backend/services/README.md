# Backend Services Architecture

This directory contains the complete backend service layer for the EcoDonations platform. The services are designed to work together to provide a comprehensive blockchain donation management system.

## Services Overview

### 🔗 Service Manager (`index.js`)

The central coordinator that manages all backend services and provides a unified interface.

**Features:**

- Service initialization and lifecycle management
- Inter-service communication and event handling
- Health monitoring and status reporting
- Graceful shutdown and service restart capabilities
- Unified API for accessing all services

### ⛓️ Blockchain Service (`blockchain.service.js`)

Handles all blockchain interactions, contract management, and Web3 operations.

**Features:**

- Smart contract interaction (Donation, EcoCoin, Governance, etc.)
- Real-time event monitoring and processing
- Transaction management and validation
- Network status monitoring
- Multi-network support

**Key Methods:**

- `monitorDonations()` - Real-time donation tracking
- `getDonationDetails()` - Retrieve donation information
- `getFoundationInfo()` - Foundation data management
- `executeTransaction()` - Transaction execution with validation

### 📊 Analytics Service (`analytics.service.js`)

Provides real-time analytics, metrics collection, and trend analysis.

**Features:**

- Real-time donation tracking and statistics
- Foundation performance metrics
- User behavior analytics
- Governance participation tracking
- Trend analysis and forecasting

**Key Metrics:**

- Total donations and volume
- Active users and foundations
- Governance participation rates
- Performance trends over time

### 💾 Database Service (`database.service.js`)

Manages data persistence, caching, and database operations.

**Features:**

- User profile management
- Donation history tracking
- Governance proposal storage
- Analytics data persistence
- Search and indexing capabilities
- Automatic backup and recovery

**Data Types:**

- User profiles and preferences
- Donation records and history
- Governance proposals and votes
- Analytics snapshots

### 🔔 Notification Service (`notification.service.js`)

Handles all types of notifications including email, SMS, and push notifications.

**Features:**

- Multi-channel notification support (Email, SMS, Push)
- Template-based notification system
- User preference management
- Rate limiting and spam protection
- Event-driven notification triggers

**Notification Types:**

- Donation confirmations
- Governance updates
- Security alerts
- Auto-donation notifications
- System maintenance notices

### 🛡️ Security Service (`security.service.js`)

Provides comprehensive security monitoring, threat detection, and fraud prevention.

**Features:**

- Real-time transaction monitoring
- Threat pattern detection
- Rate limiting and abuse prevention
- Security event logging and analysis
- Risk scoring and automated responses

**Security Monitoring:**

- Large amount alerts
- Rapid transaction detection
- Governance manipulation prevention
- Address reputation checking
- Flash loan attack detection

## Service Architecture

```
┌─────────────────────┐
│   Service Manager   │
│      (index.js)     │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │  Events   │
    │  & API    │
    └─────┬─────┘
          │
┌─────────┼─────────┐
│         │         │
▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│Blockchain│Analytics│Database│
└──────┘ └──────┘ └──────┘
          │         │
          ▼         ▼
     ┌──────┐ ┌──────┐
     │Notification│Security│
     └──────┘ └──────┘
```

## Usage Examples

### Initialize Services

```javascript
const ServiceManager = require("./backend/services");

const config = {
  blockchain: {
    rpcUrl: "http://localhost:8545",
    networkId: 31337,
  },
  database: {
    type: "file",
    dataFile: "./data/app.json",
  },
  notification: {
    email: { enabled: true },
    frontendUrl: "http://localhost:3000",
  },
};

const serviceManager = new ServiceManager(config);
await serviceManager.initialize();
```

### Process a Donation

```javascript
// Process donation with full security and analytics
const result = await serviceManager.processDonation(txHash);

// Result includes:
// - Donation data
// - Security risk assessment
// - Database storage confirmation
// - Notification delivery status
```

### Get Dashboard Data

```javascript
const dashboard = await serviceManager.getDashboardData();

// Returns comprehensive dashboard with:
// - Analytics metrics
// - Security status
// - Database statistics
// - Blockchain status
// - Notification statistics
```

### Subscribe to Notifications

```javascript
await serviceManager.subscribeToNotifications("0x123...", {
  email: true,
  emailAddress: "user@example.com",
  donations: true,
  governance: true,
  security: true,
});
```

## Configuration

### Environment Variables

```bash
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK_ID=31337

# Database Configuration
DATABASE_TYPE=file
DATABASE_FILE=./data/app.json
DATABASE_BACKUP_INTERVAL=300000

# Security Configuration
SECURITY_LARGE_AMOUNT_THRESHOLD=10
SECURITY_AUTO_BLOCK=false
SECURITY_RATE_LIMIT=5

# Notification Configuration
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_SMS_ENABLED=false
NOTIFICATION_PUSH_ENABLED=false
FRONTEND_URL=http://localhost:3000
```

### Service Dependencies

1. **Node.js** >= 14.0.0
2. **ethers.js** for blockchain interaction
3. **Optional**: External notification providers (SendGrid, Twilio, etc.)
4. **Optional**: External database (MongoDB, PostgreSQL)

## Monitoring and Health Checks

Each service provides health check endpoints:

```javascript
// Get overall service status
const status = await serviceManager.getServiceStatus();

// Get specific service health
const blockchain = serviceManager.getService("blockchain");
const health = await blockchain.healthCheck();
```

Health checks include:

- Service availability
- Connection status
- Performance metrics
- Error rates
- Resource usage

## Security Considerations

- All services implement rate limiting
- Transaction monitoring with risk scoring
- Event logging for audit trails
- Secure configuration management
- Graceful error handling and recovery

## Production Deployment

For production deployment:

1. Configure external database (MongoDB/PostgreSQL)
2. Set up notification providers (SendGrid, Twilio)
3. Configure monitoring and alerting
4. Set up backup and recovery procedures
5. Implement proper logging and audit trails

## API Integration

Services integrate with the API layer in `../api/`:

- Health check endpoints
- Feedback collection
- Real-time status monitoring
- Administrative functions

This architecture provides a robust, scalable, and secure foundation for the EcoDonations platform's backend operations.
