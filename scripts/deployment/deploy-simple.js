const { ethers } = require("hardhat");

async function deploySimple() {
  console.log("🚀 Simple deployment to localhost...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Let's try to deploy just EcoCoin first
  console.log("Deploying EcoCoin...");
  const EcoCoin = await ethers.getContractFactory("EcoCoin");
  const maxSupply = ethers.utils.parseEther("1000000000");
  const ecoCoin = await EcoCoin.deploy(maxSupply);
  console.log("Waiting for deployment...");
  await ecoCoin.deployed();
  console.log("EcoCoin deployed to:", ecoCoin.address);

  return {
    ecoCoin: ecoCoin.address
  };
}

deploySimple()
  .then((addresses) => {
    console.log("✅ Deployment complete:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
