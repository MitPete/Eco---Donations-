const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying EcoCoin from account:", deployer.address);

  const EcoCoin = await ethers.getContractFactory("EcoCoin");
  const ecoCoin = await EcoCoin.deploy(1000000); // Set the max supply during deployment

  console.log("EcoCoin address:", ecoCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
