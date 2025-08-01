# 📄 Smart Contracts Organization

## 🎯 **Production Contracts** (Latest & Secure)

### **Core Contracts** (Ready for deployment)

These are the security-hardened, production-ready versions:

- `Donation-Hardened.sol` → **Main donation contract** (v0.8.19)
- `EcoCoin-Hardened.sol` → **ECO token contract** (security hardened)
- `AutoDonation-fixed.sol` → **Auto-donation system** (fixed version)
- `EcoGovernance.sol` → **DAO governance contract**
- `MultiSigWallet.sol` → **Multi-signature wallet**
- `SecurityConfig.sol` → **Security configuration contract**

## 📂 **Contract Directory Structure**

```
📁 contracts/
├── 📁 core/                    # Production-ready contracts
│   ├── Donation.sol            # Main donation (hardened version)
│   ├── EcoCoin.sol             # ECO token (hardened version)
│   ├── AutoDonation.sol        # Auto-donation (fixed version)
│   └── EcoGovernance.sol       # DAO governance
│
├── 📁 security/                # Security infrastructure
│   ├── MultiSigWallet.sol      # Multi-sig wallet
│   ├── SecurityConfig.sol      # Security config
│   └── SECURITY_README.md      # Security documentation
│
├── 📁 interfaces/              # Contract interfaces
│   ├── IDonation.sol           # Donation interface
│   ├── IEcoCoin.sol           # Token interface
│   └── IGovernance.sol        # Governance interface
│
├── 📁 libraries/               # Shared libraries
│   ├── SafeMath.sol           # Math operations
│   ├── SecurityLib.sol        # Security utilities
│   └── GovernanceLib.sol      # Governance utilities
│
└── 📁 versions/                # Version history
    ├── v1.0/                  # Original versions
    ├── v1.1/                  # First iteration
    └── v2.0/                  # Current hardened versions
```

## 🔄 **Migration Plan**

### Step 1: Move Production Contracts

- Move hardened versions to `core/`
- Rename to standard names (remove suffixes)
- Update import paths

### Step 2: Archive Old Versions

- Move original versions to `versions/v1.0/`
- Move intermediate versions to appropriate version folders
- Keep backup in `contracts-backup/` (unchanged)

### Step 3: Create Missing Files

- Create interface files for better modularity
- Add shared libraries for common functions
- Add deployment documentation

## 🛡️ **Security Features**

### **Donation-Hardened.sol**

- ✅ Reentrancy protection
- ✅ Pausable functionality
- ✅ Multi-signature requirement
- ✅ Input validation
- ✅ Gas optimization
- ✅ Event logging

### **EcoCoin-Hardened.sol**

- ✅ Mint/burn controls
- ✅ Transfer restrictions
- ✅ Supply limits
- ✅ Governance integration

### **AutoDonation-fixed.sol**

- ✅ Overflow protection
- ✅ Rate limiting
- ✅ Emergency stops
- ✅ Fee validation

## 📋 **Contract Dependencies**

```
Donation → EcoCoin, MultiSigWallet, SecurityConfig
EcoCoin → OpenZeppelin (ERC20, Ownable)
AutoDonation → Donation, EcoCoin
EcoGovernance → EcoCoin
MultiSigWallet → SecurityConfig
```

## 🚀 **Deployment Order**

1. **SecurityConfig** (base security settings)
2. **EcoCoin** (governance token)
3. **MultiSigWallet** (security layer)
4. **Donation** (main contract)
5. **AutoDonation** (automated features)
6. **EcoGovernance** (DAO functionality)

## 📊 **Contract Sizes & Gas**

| Contract       | Size (KB) | Deployment Gas | Main Functions Gas |
| -------------- | --------- | -------------- | ------------------ |
| Donation       | ~15       | ~2.5M          | donate: ~150k      |
| EcoCoin        | ~8        | ~1.5M          | transfer: ~50k     |
| AutoDonation   | ~12       | ~2.0M          | trigger: ~120k     |
| EcoGovernance  | ~10       | ~1.8M          | vote: ~80k         |
| MultiSigWallet | ~6        | ~1.2M          | execute: ~100k     |

_Estimated values - run gas reporter for exact numbers_

## 🔧 **Development Commands**

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

## ⚠️ **Important Notes**

1. **Always use hardened versions** for any deployment
2. **Test thoroughly** before mainnet deployment
3. **Run security analysis** before each deployment
4. **Update documentation** when contracts change
5. **Backup old versions** before making changes

---

_Last updated: July 31, 2025_
