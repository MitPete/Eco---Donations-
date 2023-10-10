const { expect } = require("chai");

describe("EcoCoin Deployment", function () {
    it("Should deploy EcoCoin contract", async function () {
        // Provide the _maxSupply argument for the constructor
        const maxSupply = 1000000; // Set the desired max supply value

        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        // Pass the _maxSupply argument during deployment
        const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();

        // Check if the contract address is non-null
        expect(ecoCoinInstance.address).to.not.equal(null);
    });
});


describe("DonationContract Deployment", function () {
    it("Should deploy DonationContract contract", async function () {
        // Get the deployed EcoCoin contract address
        const ecoCoinAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace this with the actual deployed EcoCoin contract address

        // Addresses for foundations
        const saveTheOceansAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const protectTheRainforestAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
        const protectTheSequoiasAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
        const cleanEnergyAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

        const DonationContract = await ethers.getContractFactory("DonationContract");

        // Pass the required arguments during deployment
        const donationContractInstance = await DonationContract.deploy(
            ecoCoinAddress,
            saveTheOceansAddress,
            protectTheRainforestAddress,
            protectTheSequoiasAddress,
            cleanEnergyAddress
        );
        await donationContractInstance.deployed();

        // Check if the contract address is non-null
        expect(donationContractInstance.address).to.not.equal(null);
    });
});

