const hre = require("hardhat");

async function main() {
  const [deployer, saveTheOceans, protectTheRainforest, protectTheSequoias, cleanEnergy] = await hre.ethers.getSigners();

  const EcoCoin = await hre.ethers.getContractFactory("EcoCoin");
  const maxSupply = hre.ethers.utils.parseEther("1000000");
  const ecoCoin = await EcoCoin.deploy(maxSupply);
  await ecoCoin.deployed();
  console.log(`EcoCoin deployed to ${ecoCoin.address}`);

  const DonationContract = await hre.ethers.getContractFactory("DonationContract");
  const donation = await DonationContract.deploy(
    ecoCoin.address,
    saveTheOceans.address,
    protectTheRainforest.address,
    protectTheSequoias.address,
    cleanEnergy.address
  );
  await donation.deployed();
  console.log(`DonationContract deployed to ${donation.address}`);

  await ecoCoin.transferOwnership(donation.address);
  console.log("EcoCoin ownership transferred to DonationContract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
