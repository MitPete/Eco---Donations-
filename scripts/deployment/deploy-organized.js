// Deploy script for Eco Donations Platform
// Using organized contract structure

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Eco Donations Platform...");
    console.log("=====================================");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Deployment configuration
    const config = {
        tokenName: "EcoCoin",
        tokenSymbol: "ECO",
        tokenDecimals: 18,
        initialSupply: ethers.utils.parseEther("1000000"), // 1M ECO tokens
        maxSupply: ethers.utils.parseEther("10000000"), // 10M ECO tokens max
        ecoTokensPerEth: ethers.utils.parseEther("10"), // 10 ECO per 1 ETH donation

        // Foundation addresses (update these with real addresses)
        foundations: {
            SaveTheOceans: "0x1111111111111111111111111111111111111111",
            ProtectTheRainforest: "0x2222222222222222222222222222222222222222",
            ProtectTheSequoias: "0x3333333333333333333333333333333333333333",
            CleanEnergy: "0x4444444444444444444444444444444444444444"
        },

        // Governance settings
        votingDelay: 1, // 1 block
        votingPeriod: 45818, // ~1 week in blocks (assuming 13.3s blocks)
        proposalThreshold: ethers.utils.parseEther("1000"), // 1000 ECO to propose
        quorumPercentage: 4 // 4% quorum
    };

    console.log("\n📋 Deployment Configuration:");
    console.log("   Token Name:", config.tokenName);
    console.log("   Token Symbol:", config.tokenSymbol);
    console.log("   Initial Supply:", ethers.utils.formatEther(config.initialSupply), "ECO");
    console.log("   Max Supply:", ethers.utils.formatEther(config.maxSupply), "ECO");
    console.log("   ECO per ETH:", ethers.utils.formatEther(config.ecoTokensPerEth));

    // Step 1: Deploy SecurityConfig
    console.log("\n🔒 Step 1: Deploying SecurityConfig...");
    const SecurityConfig = await ethers.getContractFactory("contracts/core/SecurityConfig.sol:SecurityConfig");
    const securityConfig = await SecurityConfig.deploy();
    await securityConfig.deployed();
    console.log("✅ SecurityConfig deployed to:", securityConfig.address);

    // Step 2: Deploy EcoCoin
    console.log("\n🪙 Step 2: Deploying EcoCoin...");
    const EcoCoin = await ethers.getContractFactory("contracts/core/EcoCoin.sol:EcoCoin");
    const ecoCoin = await EcoCoin.deploy(
        config.tokenName,
        config.tokenSymbol,
        config.initialSupply,
        config.maxSupply
    );
    await ecoCoin.deployed();
    console.log("✅ EcoCoin deployed to:", ecoCoin.address);

    // Step 3: Deploy MultiSigWallet
    console.log("\n🔐 Step 3: Deploying MultiSigWallet...");
    const MultiSigWallet = await ethers.getContractFactory("contracts/core/MultiSigWallet.sol:MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(
        [deployer.address], // Initial owners (add more in production)
        1 // Required confirmations (increase in production)
    );
    await multiSigWallet.deployed();
    console.log("✅ MultiSigWallet deployed to:", multiSigWallet.address);

    // Step 4: Deploy Donation Contract
    console.log("\n💝 Step 4: Deploying Donation Contract...");
    const Donation = await ethers.getContractFactory("contracts/core/Donation.sol:DonationContract");
    const donation = await Donation.deploy(
        ecoCoin.address,
        multiSigWallet.address,
        config.ecoTokensPerEth
    );
    await donation.deployed();
    console.log("✅ Donation Contract deployed to:", donation.address);

    // Step 5: Deploy AutoDonation
    console.log("\n🤖 Step 5: Deploying AutoDonation...");
    const AutoDonation = await ethers.getContractFactory("contracts/core/AutoDonation.sol:AutoDonation");
    const autoDonation = await AutoDonation.deploy(
        donation.address,
        ecoCoin.address
    );
    await autoDonation.deployed();
    console.log("✅ AutoDonation deployed to:", autoDonation.address);

    // Step 6: Deploy EcoGovernance
    console.log("\n🏛️ Step 6: Deploying EcoGovernance...");
    const EcoGovernance = await ethers.getContractFactory("contracts/core/EcoGovernance.sol:EcoGovernance");
    const ecoGovernance = await EcoGovernance.deploy(
        ecoCoin.address,
        config.votingDelay,
        config.votingPeriod,
        config.proposalThreshold,
        config.quorumPercentage
    );
    await ecoGovernance.deployed();
    console.log("✅ EcoGovernance deployed to:", ecoGovernance.address);

    // Post-deployment setup
    console.log("\n⚙️ Post-Deployment Setup...");

    // Add donation contract as minter for EcoCoin
    console.log("   Adding Donation contract as EcoCoin minter...");
    await ecoCoin.addMinter(donation.address);

    // Add auto-donation contract as minter
    console.log("   Adding AutoDonation contract as EcoCoin minter...");
    await ecoCoin.addMinter(autoDonation.address);

    // Set foundation addresses
    console.log("   Setting foundation addresses...");
    await donation.setFoundationAddress(0, config.foundations.SaveTheOceans);
    await donation.setFoundationAddress(1, config.foundations.ProtectTheRainforest);
    await donation.setFoundationAddress(2, config.foundations.ProtectTheSequoias);
    await donation.setFoundationAddress(3, config.foundations.CleanEnergy);

    // Create deployment summary
    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        gasUsed: {
            // These will be calculated during actual deployment
        },
        contracts: {
            SecurityConfig: securityConfig.address,
            EcoCoin: ecoCoin.address,
            MultiSigWallet: multiSigWallet.address,
            Donation: donation.address,
            AutoDonation: autoDonation.address,
            EcoGovernance: ecoGovernance.address
        },
        config: config
    };

    // Save deployment info
    const fs = require('fs');
    const deploymentPath = `./deployments/${hre.network.name}-deployment.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n✅ Deployment Complete!");
    console.log("========================");
    console.log("📄 Deployment summary saved to:", deploymentPath);
    console.log("\n📋 Contract Addresses:");
    console.log("   SecurityConfig:", securityConfig.address);
    console.log("   EcoCoin:", ecoCoin.address);
    console.log("   MultiSigWallet:", multiSigWallet.address);
    console.log("   Donation:", donation.address);
    console.log("   AutoDonation:", autoDonation.address);
    console.log("   EcoGovernance:", ecoGovernance.address);

    console.log("\n🔧 Next Steps:");
    console.log("1. Update frontend/contracts.json with new addresses");
    console.log("2. Run security analysis: ./run-security-analysis.sh");
    console.log("3. Test all contract interactions");
    console.log("4. Update foundation addresses with real values");
    console.log("5. Set up proper multi-sig owners for production");

    console.log("\n⚠️ Important:");
    console.log("- Foundation addresses are currently placeholder values");
    console.log("- Multi-sig has only 1 owner and 1 confirmation (change for production)");
    console.log("- Run full testing before mainnet deployment");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
