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
     2. Deploy EcoCoin (now with a maxSupply arg)
        constructor(uint256 _maxSupply) ERC20("ECO Coin", "ECO")
  ------------------------------------------------------------------ */
  const EcoCoin = await hre.ethers.getContractFactory("EcoCoin");
  // set your max supply (e.g. 1 000 000 tokens, 18 decimals)
  const maxSupply = hre.ethers.utils.parseUnits("1000000", 18);
  const eco       = await EcoCoin.deploy(maxSupply);
  await eco.deployed();
  console.log("✅ EcoCoin          :", eco.address);

  /* ------------------------------------------------------------------
     3. Deploy DonationContract (5-arg constructor)
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
     4. Transfer EcoCoin ownership to DonationContract
  ------------------------------------------------------------------ */
  await (await eco.transferOwnership(donation.address)).wait();
  console.log("🔑 EcoCoin owner    → DonationContract");

  /* ------------------------------------------------------------------
     5. Persist addresses for the front-end
  ------------------------------------------------------------------ */
  const out = {
    ecoCoin:          eco.address,
    donationContract: donation.address,
    chainId:          31337
  };
  const outfile = path.join(__dirname, "../frontend/src/contracts.json");
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, JSON.stringify(out, null, 2));
  console.log("📝  Wrote addresses →", outfile);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
