const hre = require("hardhat");

async function main() {
    try {
        console.log("🔧 Setting up governance for testing...\n");

        // Get contracts
        const governance = await hre.ethers.getContractAt(
            "EcoGovernance",
            "0x809d550fca64d94Bd9F66E60752A544199cfAC3D"
        );

        const eco = await hre.ethers.getContractAt(
            "EcoCoin",
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        );

        const donation = await hre.ethers.getContractAt(
            "DonationContract",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        );

        // Get signers
        const [owner, user1] = await hre.ethers.getSigners();

        console.log("📊 Current governance settings:");
        const currentThreshold = await governance.proposalThreshold();
        console.log(`Current proposal threshold: ${hre.ethers.utils.formatEther(currentThreshold)} ECO`);

        const user1Balance = await eco.balanceOf(user1.address);
        console.log(`User1 ECO balance: ${hre.ethers.utils.formatEther(user1Balance)} ECO\n`);

        // Option 1: Lower the threshold for testing
        console.log("🔄 Lowering proposal threshold for testing...");
        const newThreshold = hre.ethers.utils.parseEther("10"); // 10 ECO tokens
        const thresholdTx = await governance.connect(owner).setProposalThreshold(newThreshold);
        await thresholdTx.wait();

        const updatedThreshold = await governance.proposalThreshold();
        console.log(`✅ New proposal threshold: ${hre.ethers.utils.formatEther(updatedThreshold)} ECO\n`);

        // Option 2: Make user1 have enough tokens by making a big donation
        if (user1Balance.lt(newThreshold)) {
            console.log("🔄 Making additional donation to get more ECO tokens...");
            const additionalDonation = hre.ethers.utils.parseEther("5.0"); // 5 ETH -> 50 ECO

            const donationTx = await donation.connect(user1).donate(0, "Large donation for governance testing", {
                value: additionalDonation
            });
            await donationTx.wait();

            const newUser1Balance = await eco.balanceOf(user1.address);
            console.log(`✅ User1 new ECO balance: ${hre.ethers.utils.formatEther(newUser1Balance)} ECO\n`);
        }

        console.log("🎉 Governance setup complete!");
        console.log("✅ User1 can now create proposals");

    } catch (error) {
        console.error("❌ Error:", error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
