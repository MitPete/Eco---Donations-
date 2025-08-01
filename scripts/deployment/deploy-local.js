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

  // First deploy a placeholder EcoCoin to get an address
  console.log("\n📦 Deploying EcoCoin...");
  const EcoCoin = await ethers.getContractFactory("EcoCoin");

  // Create a temporary address for initial deployment (we'll use multiSig as placeholder)
  const tempEcoCoin = await EcoCoin.deploy(
    multiSigWallet.address, // temporary donation contract address
    multiSigWallet.address  // multisig wallet address
  );
  await tempEcoCoin.deployed();
  console.log("✅ EcoCoin deployed to:", tempEcoCoin.address);

  // Deploy DonationContract with real EcoCoin address
  console.log("\n📦 Deploying DonationContract...");
  const DonationContract = await ethers.getContractFactory("DonationContract");
  // Use different addresses for foundations for local testing
  const accounts = await ethers.getSigners();

  // Create foundation URIs
  const foundationUris = [
    "https://example.com/ocean.json",
    "https://example.com/forest.json",
    "https://example.com/wildlife.json",
    "https://example.com/climate.json"
  ];

  const donation = await DonationContract.deploy(
    tempEcoCoin.address,
    multiSigWallet.address,
    accounts[0].address, // treasury (deployer for testing)
    foundationUris
  );
  await donation.deployed();
  console.log("✅ DonationContract deployed to:", donation.address);

  // Now deploy the final EcoCoin with correct donation contract address
  console.log("\n📦 Deploying final EcoCoin...");
  const ecoCoin = await EcoCoin.deploy(
    donation.address, // donation contract address
    multiSigWallet.address // multisig wallet address
  );
  await donation.deployed();
  console.log("✅ DonationContract deployed to:", donation.address);

  // Deploy EcoGovernance
  console.log("\n📦 Deploying EcoGovernance...");
  const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
  const ecoGovernance = await EcoGovernance.deploy(ecoCoin.address);
  await ecoGovernance.deployed();
  console.log("✅ EcoGovernance deployed to:", ecoGovernance.address);

  // Deploy AutoDonationContract
  console.log("\n📦 Deploying AutoDonationContract...");
  const AutoDonationContract = await ethers.getContractFactory("AutoDonationContract");
  const autoDonation = await AutoDonationContract.deploy(donation.address, ecoCoin.address, multiSigWallet.address);
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

  // Write to frontend/public/contracts/contracts.json
  const contractsPath = path.join(__dirname, '../../frontend/public/contracts/contracts.json');
  fs.writeFileSync(contractsPath, JSON.stringify(contractsConfig, null, 2));

  // Also write to frontend/contracts.json for backup
  const backupContractsPath = path.join(__dirname, '../../frontend/contracts.json');
  fs.writeFileSync(backupContractsPath, JSON.stringify(contractsConfig, null, 2));

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
