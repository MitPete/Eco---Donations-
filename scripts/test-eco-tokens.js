const hre = require("hardhat");

async function main() {
    try {
        console.log("🧪 Testing ECO Token System...\n");

        // Get contracts
        const eco = await hre.ethers.getContractAt(
            "EcoCoin",
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        );

        const donation = await hre.ethers.getContractAt(
            "DonationContract",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        );

        // Get signers
        const [user1, user2] = await hre.ethers.getSigners();

        console.log("📊 Initial State:");
        const user1Balance = await eco.balanceOf(user1.address);
        const user2Balance = await eco.balanceOf(user2.address);
        const totalSupply = await eco.totalSupply();
        const maxSupply = await eco.maxSupply();

        console.log(`User1 ECO balance: ${hre.ethers.utils.formatEther(user1Balance)} ECO`);
        console.log(`User2 ECO balance: ${hre.ethers.utils.formatEther(user2Balance)} ECO`);
        console.log(`Total supply: ${hre.ethers.utils.formatEther(totalSupply)} ECO`);
        console.log(`Max supply: ${hre.ethers.utils.formatEther(maxSupply)} ECO\n`);

        // Test 1: Make another donation with user2
        console.log("🔄 Test 1: User2 makes donation...");
        const donationAmount = hre.ethers.utils.parseEther("0.5"); // 0.5 ETH

        const tx = await donation.connect(user2).donate(1, "Test donation from user2", {
            value: donationAmount
        });
        await tx.wait();

        const newUser2Balance = await eco.balanceOf(user2.address);
        console.log(`✅ User2 donated 0.5 ETH`);
        console.log(`💰 User2 ECO balance: ${hre.ethers.utils.formatEther(newUser2Balance)} ECO (should be 5.0)\n`);

        // Test 2: Check token supply limits
        console.log("📈 Test 2: Token supply verification...");
        const newTotalSupply = await eco.totalSupply();
        console.log(`Total supply after donation: ${hre.ethers.utils.formatEther(newTotalSupply)} ECO`);

        const remainingSupply = maxSupply.sub(newTotalSupply);
        console.log(`Remaining mintable supply: ${hre.ethers.utils.formatEther(remainingSupply)} ECO\n`);

        // Test 3: Check if ECO tokens are transferable
        console.log("🔄 Test 3: Testing ECO token transfer...");
        const transferAmount = hre.ethers.utils.parseEther("1.0");

        const txTransfer = await eco.connect(user1).transfer(user2.address, transferAmount);
        await txTransfer.wait();

        const finalUser1Balance = await eco.balanceOf(user1.address);
        const finalUser2Balance = await eco.balanceOf(user2.address);

        console.log(`✅ Transferred 1.0 ECO from User1 to User2`);
        console.log(`User1 final balance: ${hre.ethers.utils.formatEther(finalUser1Balance)} ECO`);
        console.log(`User2 final balance: ${hre.ethers.utils.formatEther(finalUser2Balance)} ECO\n`);

        // Test 4: Verify reward ratio (10 ECO per 1 ETH)
        console.log("🎯 Test 4: Reward ratio verification...");
        const totalDonated = hre.ethers.utils.parseEther("1.5"); // 1.0 + 0.5 ETH
        const expectedEcoRewards = totalDonated.mul(10); // Should be 15 ECO total
        const actualEcoMinted = newTotalSupply.sub(totalSupply);

        console.log(`Total ETH donated: ${hre.ethers.utils.formatEther(totalDonated)} ETH`);
        console.log(`Expected ECO rewards: ${hre.ethers.utils.formatEther(expectedEcoRewards)} ECO`);
        console.log(`Actual ECO minted: ${hre.ethers.utils.formatEther(actualEcoMinted)} ECO`);
        console.log(`✅ Reward ratio correct: ${actualEcoMinted.eq(expectedEcoRewards) ? 'YES' : 'NO'}\n`);

        console.log("🎉 ECO Token System Test Complete!");

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
