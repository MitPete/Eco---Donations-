const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Enhanced Smart Contract Deployment");
    console.log("===============================================");

    // Get signers
    const [deployer, foundation1, foundation2, foundation3, foundation4] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Foundation addresses
    const foundations = {
        oceans: foundation1.address,
        rainforest: foundation2.address,
        sequoias: foundation3.address,
        energy: foundation4.address
    };

    console.log("\n📋 Foundation Addresses:");
    console.log("Save The Oceans:", foundations.oceans);
    console.log("Protect The Rainforest:", foundations.rainforest);
    console.log("Protect The Sequoias:", foundations.sequoias);
    console.log("Clean Energy:", foundations.energy);

    // 1. Deploy MultiSigWallet first
    console.log("\n🔐 Deploying MultiSigWallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const owners = [deployer.address]; // Add more owners as needed
    const required = 1; // Number of confirmations required

    const multiSigWallet = await MultiSigWallet.deploy(owners, required);
    await multiSigWallet.deployed();
    console.log("✅ MultiSigWallet deployed to:", multiSigWallet.address);
    console.log("   Owners:", owners);
    console.log("   Required confirmations:", required);

    // 2. Deploy EcoCoin
    console.log("\n🪙 Deploying EcoCoin...");
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const ecoCoin = await EcoCoin.deploy();
    await ecoCoin.deployed();
    console.log("✅ EcoCoin deployed to:", ecoCoin.address);

    // Set MultiSig wallet for EcoCoin
    console.log("🔗 Setting MultiSig wallet for EcoCoin...");
    await ecoCoin.setMultiSigWallet(multiSigWallet.address);
    console.log("✅ MultiSig wallet set for EcoCoin");

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
    console.log("✅ DonationContract deployed to:", donationContract.address);

    // Set MultiSig wallet for DonationContract
    console.log("🔗 Setting MultiSig wallet for DonationContract...");
    await donationContract.setMultiSigWallet(multiSigWallet.address);
    console.log("✅ MultiSig wallet set for DonationContract");

    // 4. Deploy EcoGovernance
    console.log("\n🏛️ Deploying EcoGovernance...");
    const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
    const ecoGovernance = await EcoGovernance.deploy(ecoCoin.address);
    await ecoGovernance.deployed();
    console.log("✅ EcoGovernance deployed to:", ecoGovernance.address);

    // Set MultiSig wallet for EcoGovernance
    console.log("🔗 Setting MultiSig wallet for EcoGovernance...");
    await ecoGovernance.setMultiSigWallet(multiSigWallet.address);
    console.log("✅ MultiSig wallet set for EcoGovernance");

    // 5. Deploy AutoDonationService
    console.log("\n🤖 Deploying AutoDonationService...");
    const AutoDonationService = await ethers.getContractFactory("AutoDonationService");
    const autoDonationService = await AutoDonationService.deploy(donationContract.address);
    await autoDonationService.deployed();
    console.log("✅ AutoDonationService deployed to:", autoDonationService.address);

    // Set MultiSig wallet for AutoDonationService
    console.log("🔗 Setting MultiSig wallet for AutoDonationService...");
    await autoDonationService.setMultiSigWallet(multiSigWallet.address);
    console.log("✅ MultiSig wallet set for AutoDonationService");

    // 6. Configure contract permissions
    console.log("\n⚙️ Configuring Contract Permissions...");

    // Add DonationContract as authorized minter for EcoCoin
    console.log("🔑 Adding DonationContract as authorized minter...");
    await ecoCoin.addAuthorizedMinter(donationContract.address);
    console.log("✅ DonationContract authorized to mint ECO tokens");

    // Add AutoDonationService as authorized trigger
    console.log("🔑 Adding AutoDonationService as authorized trigger...");
    await autoDonationService.addAuthorizedTrigger(autoDonationService.address);
    console.log("✅ AutoDonationService authorized");

    // 7. Initial configuration
    console.log("\n🎯 Initial Configuration...");

    // Set initial total supply for governance calculations
    const initialSupply = ethers.utils.parseEther("1000000"); // 1M ECO tokens
    console.log("📊 Setting initial total supply for governance...");
    await ecoGovernance.updateTotalSupply(initialSupply);
    console.log("✅ Total supply set to:", ethers.utils.formatEther(initialSupply), "ECO");

    // Mint some initial tokens for testing
    console.log("🪙 Minting initial tokens for deployer...");
    const initialMintAmount = ethers.utils.parseEther("10000"); // 10K ECO tokens
    await ecoCoin.mintTokens(deployer.address, initialMintAmount);
    console.log("✅ Minted", ethers.utils.formatEther(initialMintAmount), "ECO tokens to deployer");

    // 8. Verify deployment
    console.log("\n🔍 Verifying Deployment...");

    // Check EcoCoin
    const ecoBalance = await ecoCoin.balanceOf(deployer.address);
    console.log("✅ EcoCoin balance for deployer:", ethers.utils.formatEther(ecoBalance), "ECO");

    // Check governance parameters
    const [minVoting, maxVoting, propThreshold, quorumPct] = await ecoGovernance.getGovernanceParams();
    console.log("✅ Governance parameters:");
    console.log("   Min voting period:", minVoting.toString(), "seconds");
    console.log("   Max voting period:", maxVoting.toString(), "seconds");
    console.log("   Proposal threshold:", ethers.utils.formatEther(propThreshold), "ECO");
    console.log("   Quorum percentage:", quorumPct.toString(), "%");

    // Check auto-donation limits
    const [monthlyLimit, maxPercentage, maxSingle] = await autoDonationService.getGlobalLimits();
    console.log("✅ Auto-donation limits:");
    console.log("   Max monthly limit:", ethers.utils.formatEther(monthlyLimit), "ETH");
    console.log("   Max percentage:", maxPercentage.toString() / 100, "%");
    console.log("   Max single donation:", ethers.utils.formatEther(maxSingle), "ETH");

    // 9. Generate deployment summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("====================");
    console.log("MultiSigWallet:", multiSigWallet.address);
    console.log("EcoCoin:", ecoCoin.address);
    console.log("DonationContract:", donationContract.address);
    console.log("EcoGovernance:", ecoGovernance.address);
    console.log("AutoDonationService:", autoDonationService.address);

    console.log("\n🏦 Foundation Addresses:");
    console.log("Save The Oceans:", foundations.oceans);
    console.log("Protect The Rainforest:", foundations.rainforest);
    console.log("Protect The Sequoias:", foundations.sequoias);
    console.log("Clean Energy:", foundations.energy);

    // Save contract addresses for frontend
    const contractAddresses = {
        multiSigWallet: multiSigWallet.address,
        ecoCoin: ecoCoin.address,
        donationContract: donationContract.address,
        ecoGovernance: ecoGovernance.address,
        autoDonationService: autoDonationService.address,
        foundations: foundations,
        network: hre.network.name,
        deployedAt: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
        './frontend/src/contracts.json',
        JSON.stringify(contractAddresses, null, 2)
    );

    console.log("\n✅ Contract addresses saved to frontend/src/contracts.json");
    console.log("🎉 Deployment completed successfully!");
    console.log("\n🔥 NEXT STEPS:");
    console.log("1. Test the contracts on testnet");
    console.log("2. Update frontend configuration");
    console.log("3. Perform security audit");
    console.log("4. Deploy to mainnet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
