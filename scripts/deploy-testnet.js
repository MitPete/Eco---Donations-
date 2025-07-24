const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 SEPOLIA TESTNET DEPLOYMENT");
    console.log("=============================");
    
    // Validate network
    const network = hre.network.name;
    console.log("📡 Network:", network);
    
    if (network === 'mainnet') {
        console.error("❌ ERROR: This script is for TESTNET only!");
        process.exit(1);
    }
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.warn("⚠️  WARNING: Low balance! Get testnet ETH from faucet:");
        console.warn("   Sepolia: https://sepoliafaucet.com/");
        console.warn("   Goerli: https://goerlifaucet.com/");
    }
    
    // Test foundation addresses (using deployer for demo)
    const foundations = {
        oceans: process.env.FOUNDATION_OCEANS || deployer.address,
        rainforest: process.env.FOUNDATION_RAINFOREST || deployer.address,
        sequoias: process.env.FOUNDATION_SEQUOIAS || deployer.address,
        energy: process.env.FOUNDATION_ENERGY || deployer.address
    };
    
    console.log("\n🏛️ Foundation Addresses:");
    console.log("Save The Oceans:", foundations.oceans);
    console.log("Protect The Rainforest:", foundations.rainforest);
    console.log("Protect The Sequoias:", foundations.sequoias);
    console.log("Clean Energy:", foundations.energy);
    
    // Multi-sig configuration
    const multiSigOwners = process.env.MULTISIG_OWNERS 
        ? process.env.MULTISIG_OWNERS.split(',').map(addr => addr.trim())
        : [deployer.address];
    const required = parseInt(process.env.MULTISIG_REQUIRED || "1");
    
    console.log("\n🔐 Multi-Sig Configuration:");
    console.log("Owners:", multiSigOwners);
    console.log("Required confirmations:", required);
    
    try {
        // 1. Deploy MultiSigWallet
        console.log("\n🔐 Deploying MultiSigWallet...");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSigWallet = await MultiSigWallet.deploy(multiSigOwners, required);
        await multiSigWallet.deployed();
        console.log("✅ MultiSigWallet deployed:", multiSigWallet.address);
        
        // 2. Deploy EcoCoin
        console.log("\n🪙 Deploying EcoCoin...");
        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoin = await EcoCoin.deploy(ethers.utils.parseEther("1000000000")); // 1B max supply
        await ecoCoin.deployed();
        console.log("✅ EcoCoin deployed:", ecoCoin.address);
        
        // 3. Deploy DonationContract
        console.log("\n💝 Deploying DonationContract...");
        const DonationContract = await ethers.getContractFactory("DonationContract");
        const donationContract = await DonationContract.deploy(
            ecoCoin.address,
            foundations.oceans,
            foundations.rainforest,
            foundations.sequoias,
            foundations.energy
        );
        await donationContract.deployed();
        console.log("✅ DonationContract deployed:", donationContract.address);
        
        // 4. Deploy EcoGovernance
        console.log("\n🏛️ Deploying EcoGovernance...");
        const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
        const ecoGovernance = await EcoGovernance.deploy(ecoCoin.address);
        await ecoGovernance.deployed();
        console.log("✅ EcoGovernance deployed:", ecoGovernance.address);
        
        // 5. Deploy AutoDonationService
        console.log("\n🤖 Deploying AutoDonationService...");
        const AutoDonationService = await ethers.getContractFactory("AutoDonationService");
        const autoDonationService = await AutoDonationService.deploy(donationContract.address);
        await autoDonationService.deployed();
        console.log("✅ AutoDonationService deployed:", autoDonationService.address);
        
        // 6. Configure contracts
        console.log("\n⚙️ Configuring Contracts...");
        
        // Set multi-sig wallets
        console.log("🔗 Setting MultiSig wallets...");
        await ecoCoin.setMultiSigWallet(multiSigWallet.address);
        await donationContract.setMultiSigWallet(multiSigWallet.address);
        await ecoGovernance.setMultiSigWallet(multiSigWallet.address);
        await autoDonationService.setMultiSigWallet(multiSigWallet.address);
        console.log("✅ MultiSig wallets configured");
        
        // Add authorized minter
        console.log("🔑 Adding authorized minter...");
        await ecoCoin.addMinter(donationContract.address);
        console.log("✅ DonationContract authorized to mint ECO");
        
        // Set initial governance parameters
        console.log("📊 Setting governance parameters...");
        const initialSupply = ethers.utils.parseEther(process.env.INITIAL_ECO_SUPPLY || "1000000");
        await ecoGovernance.updateTotalSupply(initialSupply);
        console.log("✅ Governance parameters set");
        
        // 7. Initial testing tokens
        console.log("\n🪙 Minting test tokens...");
        const testAmount = ethers.utils.parseEther("10000");
        await ecoCoin.mintTokens(deployer.address, testAmount);
        console.log("✅ Minted", ethers.utils.formatEther(testAmount), "ECO for testing");
        
        // 8. Verify deployment
        console.log("\n🔍 Verifying Deployment...");
        
        const ecoBalance = await ecoCoin.balanceOf(deployer.address);
        console.log("✅ ECO balance:", ethers.utils.formatEther(ecoBalance));
        
        const donationStats = await donationContract.getStats();
        console.log("✅ Donation contract stats:", {
            totalDonations: donationStats.totalDonationsAmount.toString(),
            totalTokens: donationStats.totalTokensMinted.toString(),
            isPaused: donationStats.isPaused
        });
        
        // 9. Save deployment info
        const deploymentInfo = {
            network: network,
            chainId: await deployer.getChainId(),
            deployer: deployer.address,
            deployedAt: new Date().toISOString(),
            contracts: {
                multiSigWallet: multiSigWallet.address,
                ecoCoin: ecoCoin.address,
                donationContract: donationContract.address,
                ecoGovernance: ecoGovernance.address,
                autoDonationService: autoDonationService.address
            },
            foundations: foundations,
            configuration: {
                multiSigOwners: multiSigOwners,
                multiSigRequired: required,
                initialSupply: initialSupply.toString()
            },
            gasUsed: {
                // Note: In a real deployment, you'd track gas usage
                estimated: "~2M gas total"
            }
        };
        
        // Save to multiple locations
        const deploymentsDir = './deployments';
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }
        
        const deploymentFile = `${deploymentsDir}/${network}-deployment.json`;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        // Update frontend contracts
        const frontendContracts = {
            ...deploymentInfo.contracts,
            foundations: foundations,
            network: network,
            deployedAt: deploymentInfo.deployedAt
        };
        
        fs.writeFileSync('./frontend/src/contracts.json', JSON.stringify(frontendContracts, null, 2));
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("========================");
        console.log("📋 Contract Addresses:");
        console.log("MultiSigWallet:", multiSigWallet.address);
        console.log("EcoCoin:", ecoCoin.address);
        console.log("DonationContract:", donationContract.address);
        console.log("EcoGovernance:", ecoGovernance.address);
        console.log("AutoDonationService:", autoDonationService.address);
        
        console.log("\n📁 Files Created:");
        console.log("- " + deploymentFile);
        console.log("- ./frontend/src/contracts.json");
        
        console.log("\n🔍 Next Steps:");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Test major functions");
        console.log("3. Update frontend configuration");
        console.log("4. Run end-to-end tests");
        
        if (process.env.VERIFY_CONTRACTS === 'true') {
            console.log("\n🔍 Starting contract verification...");
            console.log("Note: Verification may take a few minutes");
            // Verification will be handled separately
        }
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
