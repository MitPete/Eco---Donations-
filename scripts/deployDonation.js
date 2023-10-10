const { ethers } = require("hardhat");

async function main() {
    // Get the deployed EcoCoin instance
    const ecoCoinAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace this with the actual address
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const ecoCoinInstance = await EcoCoin.attach(ecoCoinAddress);

    // Deploy DonationContract and pass EcoCoin address to its constructor
    const DonationContract = await ethers.getContractFactory("DonationContract");
    const saveTheOceansAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Address for SaveTheOceans foundation
    const protectTheRainforestAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Address for ProtectTheRainforest foundation
    const protectTheSequoiasAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Address for ProtectTheSequoias foundation
    const cleanEnergyAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"; // Address for CleanEnergy foundation

    const donationContractInstance = await DonationContract.deploy(
        ecoCoinAddress,
        saveTheOceansAddress,
        protectTheRainforestAddress,
        protectTheSequoiasAddress,
        cleanEnergyAddress
    );

    await donationContractInstance.deployed();
    console.log("DonationContract deployed to:", donationContractInstance.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
