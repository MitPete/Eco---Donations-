// Test script for local donation flow
const { ethers } = require("hardhat");
const fs = require("fs");

async function testDonationFlow() {
    console.log("🧪 Testing Local Donation Flow...\n");

    // Get the deployed contract addresses
    const contracts = JSON.parse(fs.readFileSync("./frontend/src/contracts.json", "utf8"));
    console.log("📋 Contract Addresses:");
    console.log("  • EcoCoin:", contracts.ecoCoin);
    console.log("  • DonationContract:", contracts.donationContract);
    console.log("  • AutoDonationService:", contracts.autoDonationService);
    console.log("  • MultiSigWallet:", contracts.multiSigWallet);
    console.log("  • Treasury:", contracts.treasuryAddress);
    console.log();

    // Get signers
    const [deployer, donor, foundation] = await ethers.getSigners();
    console.log("👥 Test Accounts:");
    console.log("  • Deployer:", deployer.address);
    console.log("  • Donor:", donor.address);
    console.log("  • Foundation:", foundation.address);
    console.log();

    // Connect to deployed contracts
    const EcoCoin = await ethers.getContractFactory("contracts/EcoCoin.sol:EcoCoin");
    const ecoCoin = EcoCoin.attach(contracts.ecoCoin);

    const Donation = await ethers.getContractFactory("contracts/Donation-Hardened.sol:DonationContract");
    const donation = Donation.attach(contracts.donationContract);

    // Test donation flow
    console.log("💰 Testing Donation Flow...");

    // Check initial balances
    const initialBalance = await ethers.provider.getBalance(donor.address);
    console.log(`  • Donor initial ETH balance: ${ethers.utils.formatEther(initialBalance)} ETH`);

    const initialEcoBalance = await ecoCoin.balanceOf(donor.address);
    console.log(`  • Donor initial ECO balance: ${ethers.utils.formatUnits(initialEcoBalance, 18)} ECO`);

    // Make a donation (0.1 ETH to foundation 0)
    const donationAmount = ethers.utils.parseEther("0.1");
    console.log(`  • Making donation of ${ethers.utils.formatEther(donationAmount)} ETH...`);

    try {
        const tx = await donation.connect(donor).donate(0, "Test donation from local network", {
            value: donationAmount
        });
        await tx.wait();
        console.log("  ✅ Donation successful! Transaction:", tx.hash);

        // Check balances after donation
        const finalEcoBalance = await ecoCoin.balanceOf(donor.address);
        const ecoReward = finalEcoBalance.sub(initialEcoBalance);
        console.log(`  • ECO tokens received: ${ethers.utils.formatUnits(ecoReward, 18)} ECO`);

        // Check donation total
        const totalDonations = await donation.getTotalDonations();
        console.log(`  • Total platform donations: ${ethers.utils.formatEther(totalDonations)} ETH`);

    } catch (error) {
        console.log("  ❌ Donation failed:", error.message);
    }

    console.log("\n🎉 Local Integration Test Complete!");
}

testDonationFlow()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
