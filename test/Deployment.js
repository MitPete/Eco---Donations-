const { expect } = require("chai");

describe("EcoCoin Deployment", function () {
    it("Should deploy EcoCoin contract", async function () {
        const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)

        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();

        expect(ecoCoinInstance.address).to.not.equal(null);
    });
});

describe("DonationContract Deployment", function () {
    it("Should deploy DonationContract contract", async function () {
        const maxSupply = ethers.utils.parseEther("1000000"); // Set the max supply for EcoCoin contract

        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();

        const saveTheOceansAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const protectTheRainforestAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
        const protectTheSequoiasAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
        const cleanEnergyAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

        const DonationContract = await ethers.getContractFactory("DonationContract");
        const donationContract = await DonationContract.deploy(
            ecoCoinInstance.address,
            saveTheOceansAddress,
            protectTheRainforestAddress,
            protectTheSequoiasAddress,
            cleanEnergyAddress
        );
        await donationContract.deployed();

        expect(donationContract.address).to.not.equal(null);
    });
});

describe("DonationContract", function () {
    let DonationContract;
    let donationContract;
    let owner;
    let user;
    let EcoCoin;
    let ecoCoinInstance;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const maxSupply = ethers.utils.parseEther("1000000"); // Set the max supply for EcoCoin contract

        // Deploy EcoCoin contract
        EcoCoin = await ethers.getContractFactory("EcoCoin");
        ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();

        // Deploy DonationContract with the address of the deployed EcoCoin contract
        DonationContract = await ethers.getContractFactory("DonationContract");
        donationContract = await DonationContract.deploy(
            ecoCoinInstance.address,
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // saveTheOceansAddress
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // protectTheRainforestAddress
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // protectTheSequoiasAddress
            "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"  // cleanEnergyAddress
        );
        await donationContract.deployed();
    });

    it("should allow a user to make a donation and receive EcoCoin tokens", async function () {
        const initialBalance = await ecoCoinInstance.balanceOf(user.address);
        const donationAmount = ethers.utils.parseEther("1"); // 1 Ether, adjust as needed
    
        await owner.sendTransaction({ to: user.address, value: donationAmount }); // Send Ether to user for donation
    
        const foundation = 0; // Assume SaveTheOceans foundation for this test
        const tx = await donationContract.connect(user).donate(foundation, "Test Donation", {
            value: donationAmount,
        });
    
        const receipt = await tx.wait();
        const newBalance = await ecoCoinInstance.balanceOf(user.address);
        const expectedBalance = initialBalance.add(donationAmount.mul(10)); // Assuming 1 Ether = 10 EcoCoin tokens
    
        expect(newBalance).to.equal(expectedBalance);
    
        // Check if the correct event was emitted
        let eventFound = false;
        receipt.events.forEach((event) => {
            if (event.event === "DonationMade" && event.args.foundation === foundation
                && event.args.sender === user.address && event.args.amount.eq(donationAmount) && event.args.message === "Test Donation") {
                eventFound = true;
            }
        });
    
        expect(eventFound).to.equal(true);
    });
});

