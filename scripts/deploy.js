// scripts/deploy.js
const fs   = require("fs");
const path = require("path");
const hre  = require("hardhat");

async function main() {
  /* ------------------------------------------------------------------
     1. Get five signers (owner + four foundations)
  ------------------------------------------------------------------ */
  const [deployer, oceans, rainforest, sequoias, energy] =
        await hre.ethers.getSigners();
  console.log("⛓  deploying with account:", deployer.address);

  /* ------------------------------------------------------------------
     2. Deploy EcoCoin (constructor(uint256 _maxSupply) ERC20("ECO Coin", "ECO"))
  ------------------------------------------------------------------ */
  const EcoCoin = await hre.ethers.getContractFactory("EcoCoin");
  const maxSupply = hre.ethers.utils.parseUnits("1000000", 18);
  const eco       = await EcoCoin.deploy(maxSupply);
  await eco.deployed();
  console.log("✅ EcoCoin          :", eco.address);

  /* ------------------------------------------------------------------
     3. Deploy DonationContract (constructor args unchanged)
  ------------------------------------------------------------------ */
  const Donation = await hre.ethers.getContractFactory("DonationContract");
  const donation = await Donation.deploy(
    eco.address,
    oceans.address,
    rainforest.address,
    sequoias.address,
    energy.address
  );
  await donation.deployed();
  console.log("✅ DonationContract :", donation.address);

  /* ------------------------------------------------------------------
     4. Deploy AutoDonationService
  ------------------------------------------------------------------ */
  const AutoDonation = await hre.ethers.getContractFactory("AutoDonationService");
  const autoDonation = await AutoDonation.deploy(donation.address);
  await autoDonation.deployed();
  console.log("✅ AutoDonationService :", autoDonation.address);

  /* ------------------------------------------------------------------
     5. Transfer EcoCoin ownership to DonationContract
  ------------------------------------------------------------------ */
  await (await eco.transferOwnership(donation.address)).wait();
  console.log("🔑 EcoCoin owner    → DonationContract");

  /* ------------------------------------------------------------------
     6. Persist addresses for the front-end
  ------------------------------------------------------------------ */
  const frontDir = path.join(__dirname, "../frontend/src");
  fs.mkdirSync(frontDir, { recursive: true });

  const out = {
    ecoCoin:          eco.address,
    donationContract: donation.address,
    autoDonationService: autoDonation.address,
    chainId:          hre.network.config.chainId || 31337
  };
  fs.writeFileSync(
    path.join(frontDir, "contracts.json"),
    JSON.stringify(out, null, 2)
  );
  console.log("📝  Wrote addresses →", path.join(frontDir, "contracts.json"));

  /* ------------------------------------------------------------------
     6. Copy fresh ABIs into the front-end
  ------------------------------------------------------------------ */
  const ecoArtifact     = await hre.artifacts.readArtifact("EcoCoin");
  const donationArtifact = await hre.artifacts.readArtifact("DonationContract");

  fs.writeFileSync(
    path.join(frontDir, "EcoCoin.json"),
    JSON.stringify(ecoArtifact, null, 2)
  );
  fs.writeFileSync(
    path.join(frontDir, "DonationContract.json"),
    JSON.stringify(donationArtifact, null, 2)
  );
  console.log("📝  Wrote ABIs → EcoCoin.json, DonationContract.json");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
