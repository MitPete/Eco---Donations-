const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts to localhost...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy MultiSigWallet
  console.log("\n📦 Deploying MultiSigWallet...");
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multiSigWallet = await MultiSigWallet.deploy([deployer.address], 1);
  await multiSigWallet.deployed();
  console.log("✅ MultiSigWallet deployed to:", multiSigWallet.address);

  // Deploy EcoCoin
  console.log("\n📦 Deploying EcoCoin...");
  const EcoCoin = await ethers.getContractFactory("EcoCoin");
  const maxSupply = ethers.utils.parseEther("1000000000"); // 1 billion ECO tokens
  const ecoCoin = await EcoCoin.deploy(maxSupply);
  await ecoCoin.deployed();
  console.log("✅ EcoCoin deployed to:", ecoCoin.address);

  // Deploy DonationContract
  console.log("\n📦 Deploying DonationContract...");
  const DonationContract = await ethers.getContractFactory("DonationContract");
  // Use different addresses for foundations for local testing
  const accounts = await ethers.getSigners();
  const donation = await DonationContract.deploy(
    ecoCoin.address,
    accounts[1].address, // oceans
    accounts[2].address, // rainforest
    accounts[3].address, // sequoias
    accounts[4].address  // energy
  );
  await donation.deployed();
  console.log("✅ DonationContract deployed to:", donation.address);

  // Deploy EcoGovernance
  console.log("\n📦 Deploying EcoGovernance...");
  const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
  const ecoGovernance = await EcoGovernance.deploy(ecoCoin.address);
  await ecoGovernance.deployed();
  console.log("✅ EcoGovernance deployed to:", ecoGovernance.address);

  // Deploy AutoDonationService
  console.log("\n📦 Deploying AutoDonationService...");
  const AutoDonationService = await ethers.getContractFactory("AutoDonationService");
  const autoDonation = await AutoDonationService.deploy(donation.address);
  await autoDonation.deployed();
  console.log("✅ AutoDonationService deployed to:", autoDonation.address);

  // Update the frontend contracts.json file
  const contractsConfig = {
    "ecoCoin": ecoCoin.address,
    "donationContract": donation.address,
    "autoDonationService": autoDonation.address,
    "multiSigWallet": multiSigWallet.address,
    "ecoGovernance": ecoGovernance.address,
    "treasuryAddress": accounts[1].address,
    "chainId": 31337,
    "platformFeePercentage": 3
  };

  const fs = require('fs');
  const path = require('path');

  // Write to src/frontend/src/contracts.json
  const contractsPath = path.join(__dirname, '../src/frontend/src/contracts.json');
  fs.writeFileSync(contractsPath, JSON.stringify(contractsConfig, null, 2));

  // Also write to src/frontend/contracts.json
  const frontendContractsPath = path.join(__dirname, '../src/frontend/contracts.json');
  fs.writeFileSync(frontendContractsPath, JSON.stringify(contractsConfig, null, 2));

  console.log("\n🎉 Deployment Summary:");
  console.log("- MultiSigWallet:", multiSigWallet.address);
  console.log("- EcoCoin:", ecoCoin.address);
  console.log("- DonationContract:", donation.address);
  console.log("- EcoGovernance:", ecoGovernance.address);
  console.log("- AutoDonation:", autoDonation.address);
  console.log("\n📄 Contracts configuration updated in frontend files");

  return contractsConfig;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
