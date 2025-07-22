const hre = require("hardhat");

async function main() {
    try {
        // Get the contracts
        const donation = await hre.ethers.getContractAt(
            "DonationContract",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        );

        // Get signers
        const [user] = await hre.ethers.getSigners();

        // Make a donation with ETH
        console.log(`Making donation from ${user.address}`);
        const donationAmount = hre.ethers.utils.parseEther("1.0"); // 1 ETH

        // Create transaction
        const tx = await donation.donate(0, {
            value: donationAmount
        });
        await tx.wait();

        console.log(`✅ Donated ${hre.ethers.utils.formatEther(donationAmount)} ETH`);

        // Get ECO token contract
        const eco = await hre.ethers.getContractAt(
            "EcoCoin",
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        );

        // Get ECO balance
        const balance = await eco.balanceOf(user.address);
        console.log(`💰 Current ECO balance: ${hre.ethers.utils.formatEther(balance)} ECO`);
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
