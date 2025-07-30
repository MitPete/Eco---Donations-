// scripts/deploy.js
const fs   = require("fs");
const path = require("path");
const hre  = require("hardhat");

async function main() {
  /* ------------------------------------------------------------------
     1. Get signers (deployer + treasury + foundations)
  ------------------------------------------------------------------ */
  const [deployer, treasury, oceans, rainforest, sequoias, energy] =
        await hre.ethers.getSigners();
  console.log("⛓  deploying with account:", deployer.address);
  console.log("💰 treasury address     :", treasury.address);

  /* ------------------------------------------------------------------
     2. Deploy MultiSigWallet for governance
  ------------------------------------------------------------------ */
  const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
  const multiSig = await MultiSigWallet.deploy([deployer.address], 1);
  await multiSig.deployed();
  console.log("✅ MultiSigWallet   :", multiSig.address);

  /* ------------------------------------------------------------------
     3. Deploy EcoCoin with MultiSig governance
  ------------------------------------------------------------------ */
  const EcoCoin = await hre.ethers.getContractFactory("contracts/EcoCoin.sol:EcoCoin");
  const maxSupply = hre.ethers.utils.parseUnits("1000000000", 18); // 1 billion tokens
  const eco = await EcoCoin.deploy(maxSupply);
  await eco.deployed();
  console.log("✅ EcoCoin          :", eco.address);

  /* ------------------------------------------------------------------
     4. Deploy DonationContract with treasury and MultiSig
  ------------------------------------------------------------------ */
  const Donation = await hre.ethers.getContractFactory("contracts/Donation-Hardened.sol:DonationContract");

  // Set up foundation URIs for NFT metadata
  const uris = [
    "ipfs://QmSaveTheOceansMetadata",
    "ipfs://QmRainforestAllianceMetadata",
    "ipfs://QmSequoiaFoundationMetadata",
    "ipfs://QmGreenEnergyInitiativeMetadata"
  ];

  const donation = await Donation.deploy(
    eco.address,
    multiSig.address,
    treasury.address,  // Treasury address for platform fees
    uris
  );
  await donation.deployed();
  console.log("✅ DonationContract :", donation.address);

  /* ------------------------------------------------------------------
     5. Set up foundation addresses in the donation contract
  ------------------------------------------------------------------ */
  await donation.setFoundationAddress(0, oceans.address);     // SaveTheOceans
  await donation.setFoundationAddress(1, rainforest.address); // RainforestAlliance
  await donation.setFoundationAddress(2, sequoias.address);   // SequoiaFoundation
  await donation.setFoundationAddress(3, energy.address);     // GreenEnergyInitiative
  console.log("🏛  Foundation addresses set");

  /* ------------------------------------------------------------------
     6. Deploy AutoDonationService
  ------------------------------------------------------------------ */
  const AutoDonation = await hre.ethers.getContractFactory("AutoDonationService");
  const autoDonation = await AutoDonation.deploy(donation.address);
  await autoDonation.deployed();
  console.log("✅ AutoDonationService :", autoDonation.address);

  /* ------------------------------------------------------------------
     7. Authorize donation contract to mint ECO tokens
  ------------------------------------------------------------------ */
  await eco.addMinter(donation.address);
  console.log("🔑 Authorized DonationContract to mint ECO tokens");

  /* ------------------------------------------------------------------
     8. Persist addresses for the front-end
  ------------------------------------------------------------------ */
  const frontDir = path.join(__dirname, "../frontend/src");
  fs.mkdirSync(frontDir, { recursive: true });

  const out = {
    ecoCoin:             eco.address,
    donationContract:    donation.address,
    autoDonationService: autoDonation.address,
    multiSigWallet:      multiSig.address,
    treasuryAddress:     treasury.address,
    chainId:             hre.network.config.chainId || 31337,
    platformFeePercentage: 3.0  // For frontend display
  };
  fs.writeFileSync(
    path.join(frontDir, "contracts.json"),
    JSON.stringify(out, null, 2)
  );
  console.log("📝  Wrote addresses →", path.join(frontDir, "contracts.json"));

  /* ------------------------------------------------------------------
     9. Copy fresh ABIs into the front-end
  ------------------------------------------------------------------ */
  const ecoArtifact = await hre.artifacts.readArtifact("contracts/EcoCoin.sol:EcoCoin");
  const donationArtifact = await hre.artifacts.readArtifact("contracts/Donation-Hardened.sol:DonationContract");
  const multiSigArtifact = await hre.artifacts.readArtifact("MultiSigWallet");

  fs.writeFileSync(
    path.join(frontDir, "EcoCoin.json"),
    JSON.stringify(ecoArtifact, null, 2)
  );
  fs.writeFileSync(
    path.join(frontDir, "DonationContract.json"),
    JSON.stringify(donationArtifact, null, 2)
  );
  fs.writeFileSync(
    path.join(frontDir, "MultiSigWallet.json"),
    JSON.stringify(multiSigArtifact, null, 2)
  );
  console.log("📝  Wrote ABIs → EcoCoin.json, DonationContract.json, MultiSigWallet.json");

  /* ------------------------------------------------------------------
     10. Display deployment summary with fee information
  ------------------------------------------------------------------ */
  console.log("\n🎉 DEPLOYMENT COMPLETE");
  console.log("================================");
  console.log("💰 Platform Fee: 3% of all donations");
  console.log("🏛  Foundation receives: 97% of donations");
  console.log("💎 ECO tokens minted: 10x net donation amount");
  console.log("🔐 Treasury controlled by MultiSig governance");
  console.log("================================");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
