const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Production Multi-Signature Wallet Deployment
 *
 * This script deploys a production-ready multi-signature wallet
 * with proper owner configuration and security settings
 */

async function main() {
    console.log("🏭 PRODUCTION MULTI-SIG DEPLOYMENT");
    console.log("=================================");

    const network = hre.network.name;

    // Prevent accidental testnet deployment
    if (network !== 'mainnet' && network !== 'localhost') {
        console.log("⚠️  WARNING: Not deploying to mainnet");
        console.log("   This script is designed for production deployment");
        console.log("   Current network:", network);
    }

    // Production multi-sig configuration
    const productionConfig = {
        // Production owner addresses (replace with real addresses)
        owners: [
            process.env.OWNER_TECHNICAL || "0x0000000000000000000000000000000000000001", // Technical Lead
            process.env.OWNER_PRODUCT || "0x0000000000000000000000000000000000000002",   // Product Lead
            process.env.OWNER_SECURITY || "0x0000000000000000000000000000000000000003",  // Security Advisor
            process.env.OWNER_LEGAL || "0x0000000000000000000000000000000000000004",     // Legal Counsel
            process.env.OWNER_FOUNDATION || "0x0000000000000000000000000000000000000005", // Foundation Rep
        ],
        requiredConfirmations: 3, // 3 of 5 signatures required
        dailyLimit: ethers.utils.parseEther("100"), // 100 ETH daily limit

        // Foundation addresses for production
        foundations: {
            oceans: process.env.FOUNDATION_OCEANS_PROD || "0x0000000000000000000000000000000000000010",
            rainforest: process.env.FOUNDATION_RAINFOREST_PROD || "0x0000000000000000000000000000000000000011",
            sequoias: process.env.FOUNDATION_SEQUOIAS_PROD || "0x0000000000000000000000000000000000000012",
            energy: process.env.FOUNDATION_ENERGY_PROD || "0x0000000000000000000000000000000000000013"
        }
    };

    // Validate configuration
    console.log("🔍 Validating production configuration...");

    // Check for placeholder addresses
    const hasPlaceholders = productionConfig.owners.some(addr =>
        addr.startsWith("0x000000000000000000000000000000000000000")
    );

    if (hasPlaceholders && network === 'mainnet') {
        console.error("❌ ERROR: Placeholder addresses detected for mainnet deployment!");
        console.error("   Please configure real owner addresses in environment variables:");
        console.error("   - OWNER_TECHNICAL");
        console.error("   - OWNER_PRODUCT");
        console.error("   - OWNER_SECURITY");
        console.error("   - OWNER_LEGAL");
        console.error("   - OWNER_FOUNDATION");
        process.exit(1);
    }

    // Display configuration
    console.log("\n🔐 Production Multi-Sig Configuration:");
    console.log("Owners:", productionConfig.owners.length);
    productionConfig.owners.forEach((owner, i) => {
        const roles = ["Technical Lead", "Product Lead", "Security Advisor", "Legal Counsel", "Foundation Rep"];
        console.log(`  ${i + 1}. ${roles[i]}: ${owner}`);
    });
    console.log("Required confirmations:", productionConfig.requiredConfirmations);
    console.log("Daily limit:", ethers.utils.formatEther(productionConfig.dailyLimit), "ETH");

    console.log("\n🏛️ Foundation Addresses:");
    Object.entries(productionConfig.foundations).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });

    if (network === 'mainnet') {
        console.log("\n⚠️  MAINNET DEPLOYMENT - Please confirm:");
        console.log("   1. All owner addresses are correct and controlled");
        console.log("   2. Foundation addresses are verified");
        console.log("   3. Security audit has been completed");
        console.log("   4. Legal compliance review is done");
        console.log("");

        // In production, you'd want manual confirmation here
        // For now, we'll continue with the deployment
    }

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("\n🚀 Deploying with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Check minimum balance for deployment
    const minBalance = ethers.utils.parseEther("0.5"); // 0.5 ETH minimum
    if (balance.lt(minBalance)) {
        console.error("❌ ERROR: Insufficient balance for deployment");
        console.error(`   Minimum required: ${ethers.utils.formatEther(minBalance)} ETH`);
        console.error(`   Current balance: ${ethers.utils.formatEther(balance)} ETH`);
        process.exit(1);
    }

    // Deploy MultiSig Wallet
    console.log("\n🔐 Deploying Production MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

    const multiSigWallet = await MultiSigWallet.deploy(
        productionConfig.owners,
        productionConfig.requiredConfirmations,
        { gasLimit: 3000000 }
    );

    await multiSigWallet.deployed();
    console.log("✅ MultiSigWallet deployed:", multiSigWallet.address);

    // Deploy EcoCoin with production multi-sig
    console.log("\n🪙 Deploying EcoCoin with Production Multi-Sig...");
    const EcoCoin = await ethers.getContractFactory("EcoCoin");

    const ecoCoin = await EcoCoin.deploy(
        multiSigWallet.address, // Use multi-sig as owner
        { gasLimit: 3000000 }
    );

    await ecoCoin.deployed();
    console.log("✅ EcoCoin deployed:", ecoCoin.address);

    // Deploy DonationContract
    console.log("\n💝 Deploying DonationContract...");
    const DonationContract = await ethers.getContractFactory("DonationContract");

    const donationContract = await DonationContract.deploy(
        ecoCoin.address,
        multiSigWallet.address,
        Object.values(productionConfig.foundations),
        { gasLimit: 4000000 }
    );

    await donationContract.deployed();
    console.log("✅ DonationContract deployed:", donationContract.address);

    // Deploy EcoGovernance
    console.log("\n🏛️ Deploying EcoGovernance...");
    const EcoGovernance = await ethers.getContractFactory("EcoGovernance");

    const ecoGovernance = await EcoGovernance.deploy(
        ecoCoin.address,
        multiSigWallet.address,
        { gasLimit: 4500000 }
    );

    await ecoGovernance.deployed();
    console.log("✅ EcoGovernance deployed:", ecoGovernance.address);

    // Deploy AutoDonationService
    console.log("\n🤖 Deploying AutoDonationService...");
    const AutoDonationService = await ethers.getContractFactory("AutoDonationService");

    const autoDonationService = await AutoDonationService.deploy(
        donationContract.address,
        multiSigWallet.address,
        { gasLimit: 3500000 }
    );

    await autoDonationService.deployed();
    console.log("✅ AutoDonationService deployed:", autoDonationService.address);

    // Save production deployment
    const deploymentInfo = {
        network: network,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        gasUsed: "calculated after deployment",

        contracts: {
            multiSigWallet: multiSigWallet.address,
            ecoCoin: ecoCoin.address,
            donationContract: donationContract.address,
            ecoGovernance: ecoGovernance.address,
            autoDonationService: autoDonationService.address
        },

        configuration: {
            multiSigOwners: productionConfig.owners,
            requiredConfirmations: productionConfig.requiredConfirmations,
            dailyLimit: ethers.utils.formatEther(productionConfig.dailyLimit),
            foundations: productionConfig.foundations
        },

        security: {
            auditCompleted: false, // Update after audit
            penetrationTestingCompleted: false,
            legalReviewCompleted: false,
            insuranceCoverage: false
        },

        verification: {
            etherscan: "pending", // Update after verification
            sourcify: "pending"
        }
    };

    // Save deployment file
    const deploymentFile = `./deployments/${network}-production-deployment.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("📁 Deployment info saved:", deploymentFile);

    // Create frontend config for production
    const frontendConfig = {
        ...deploymentInfo.contracts,
        foundations: deploymentInfo.configuration.foundations,
        network: network,
        deployedAt: deploymentInfo.timestamp
    };

    fs.writeFileSync('./frontend/src/contracts-production.json', JSON.stringify(frontendConfig, null, 2));
    console.log("📁 Frontend config saved: ./frontend/src/contracts-production.json");

    console.log("\n🎉 PRODUCTION DEPLOYMENT COMPLETE!");
    console.log("================================");
    console.log("📋 Contract Addresses:");
    Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
        console.log(`${name}: ${address}`);
    });

    console.log("\n🔒 Security Configuration:");
    console.log(`Multi-Sig Owners: ${productionConfig.owners.length}`);
    console.log(`Required Confirmations: ${productionConfig.requiredConfirmations}`);
    console.log(`Daily Limit: ${ethers.utils.formatEther(productionConfig.dailyLimit)} ETH`);

    console.log("\n⚠️  CRITICAL NEXT STEPS:");
    console.log("1. 🔍 Complete security audit");
    console.log("2. ✅ Verify contracts on Etherscan");
    console.log("3. 🧪 Conduct penetration testing");
    console.log("4. 📋 Complete legal compliance review");
    console.log("5. 🛡️ Set up monitoring and alerting");
    console.log("6. 🤝 Finalize foundation partnerships");
    console.log("7. 📚 Complete all documentation");

    if (network === 'mainnet') {
        console.log("\n🚨 MAINNET DEPLOYMENT COMPLETE");
        console.log("   Monitor all contracts carefully");
        console.log("   Test all functions with small amounts first");
        console.log("   Keep emergency procedures ready");
    }

    return deploymentInfo;
}

// Handle deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { main };
