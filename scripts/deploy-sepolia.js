const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Starting Sepolia deployment...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log("⚠️  Warning: Low balance! You may need more Sepolia ETH");
        console.log("🔗 Get Sepolia ETH: https://sepoliafaucet.com/");
    }
    
    console.log("\n📋 Deployment Plan:");
    console.log("1. Deploy EcoCoin-Hardened (Token)");
    console.log("2. Deploy MultiSigWallet");
    console.log("3. Deploy SecurityConfig");
    console.log("4. Deploy Donation-Hardened");
    console.log("5. Deploy AutoDonation-fixed");
    console.log("6. Configure permissions and settings");
    console.log("");
    
    const deployments = {};
    
    try {
        // 1. Deploy EcoCoin (Token)
        console.log("🪙 Deploying EcoCoin-Hardened...");
        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoin = await EcoCoin.deploy();
        await ecoCoin.deployed();
        deployments.EcoCoin = ecoCoin.address;
        console.log("✅ EcoCoin deployed to:", ecoCoin.address);
        
        // 2. Deploy MultiSigWallet (for governance)
        console.log("\n🔐 Deploying MultiSigWallet...");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const owners = [deployer.address]; // Start with deployer, can add more later
        const requiredConfirmations = 1; // For beta testing
        const multiSig = await MultiSigWallet.deploy(owners, requiredConfirmations);
        await multiSig.deployed();
        deployments.MultiSigWallet = multiSig.address;
        console.log("✅ MultiSigWallet deployed to:", multiSig.address);
        
        // 3. Deploy SecurityConfig
        console.log("\n🛡️ Deploying SecurityConfig...");
        const SecurityConfig = await ethers.getContractFactory("SecurityConfig");
        const securityConfig = await SecurityConfig.deploy(multiSig.address);
        await securityConfig.deployed();
        deployments.SecurityConfig = securityConfig.address;
        console.log("✅ SecurityConfig deployed to:", securityConfig.address);
        
        // 4. Deploy Donation Contract
        console.log("\n💚 Deploying Donation-Hardened...");
        const Donation = await ethers.getContractFactory("Donation");
        const donation = await Donation.deploy(
            ecoCoin.address,
            multiSig.address,
            securityConfig.address
        );
        await donation.deployed();
        deployments.Donation = donation.address;
        console.log("✅ Donation deployed to:", donation.address);
        
        // 5. Deploy AutoDonation
        console.log("\n⚡ Deploying AutoDonation-fixed...");
        const AutoDonation = await ethers.getContractFactory("AutoDonation");
        const autoDonation = await AutoDonation.deploy(
            donation.address,
            ecoCoin.address
        );
        await autoDonation.deployed();
        deployments.AutoDonation = autoDonation.address;
        console.log("✅ AutoDonation deployed to:", autoDonation.address);
        
        // Configuration phase
        console.log("\n⚙️ Configuring contracts...");
        
        // Set up roles and permissions
        console.log("🔑 Setting up access control...");
        
        // Grant donation contract permission to mint EcoCoins
        const MINTER_ROLE = await ecoCoin.MINTER_ROLE();
        await ecoCoin.grantRole(MINTER_ROLE, donation.address);
        console.log("✅ Granted minter role to Donation contract");
        
        // Configure security settings
        console.log("🛡️ Configuring security parameters...");
        
        // Set rate limits (for beta testing)
        await securityConfig.setDailyDonationLimit(ethers.utils.parseEther("100")); // 100 ETH daily limit
        await securityConfig.setMaxDonationAmount(ethers.utils.parseEther("10")); // 10 ETH max single donation
        console.log("✅ Security parameters configured");
        
        // Save deployment information
        const deploymentInfo = {
            network: "sepolia",
            deploymentDate: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deployments,
            configuration: {
                dailyLimit: "100 ETH",
                maxDonation: "10 ETH",
                multiSigOwners: [deployer.address],
                requiredConfirmations: 1
            },
            verification: {
                // Etherscan verification commands will be added here
            }
        };
        
        // Write to JSON file
        fs.writeFileSync(
            'deployments/sepolia-deployment.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Update frontend config
        const frontendConfig = {
            NETWORK: "sepolia",
            DONATION_CONTRACT: deployments.Donation,
            ECOCOIN_CONTRACT: deployments.EcoCoin,
            MULTISIG_CONTRACT: deployments.MultiSigWallet,
            AUTODONATION_CONTRACT: deployments.AutoDonation,
            SECURITY_CONFIG_CONTRACT: deployments.SecurityConfig,
            SEPOLIA_RPC_URL: "https://sepolia.infura.io/v3/YOUR_KEY",
            ETHERSCAN_URL: "https://sepolia.etherscan.io"
        };
        
        fs.writeFileSync(
            'frontend/contracts-sepolia.json',
            JSON.stringify(frontendConfig, null, 2)
        );
        
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("========================");
        console.log("📄 Contract Addresses:");
        console.log("  EcoCoin:", deployments.EcoCoin);
        console.log("  Donation:", deployments.Donation);
        console.log("  MultiSig:", deployments.MultiSigWallet);
        console.log("  AutoDonation:", deployments.AutoDonation);
        console.log("  SecurityConfig:", deployments.SecurityConfig);
        console.log("");
        console.log("📁 Files Created:");
        console.log("  deployments/sepolia-deployment.json");
        console.log("  frontend/contracts-sepolia.json");
        console.log("");
        console.log("🔗 Next Steps:");
        console.log("  1. Verify contracts on Etherscan");
        console.log("  2. Update frontend to use Sepolia contracts");
        console.log("  3. Test with Sepolia ETH");
        console.log("  4. Begin beta testing!");
        console.log("");
        console.log("🌐 Etherscan Links:");
        Object.entries(deployments).forEach(([name, address]) => {
            console.log(`  ${name}: https://sepolia.etherscan.io/address/${address}`);
        });
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
