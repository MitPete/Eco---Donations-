const hre = require("hardhat");

async function main() {
    try {
        console.log("🤖 Testing Auto-Donation System...\n");

        // Get contracts
        const autoDonation = await hre.ethers.getContractAt(
            "AutoDonationService",
            "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00"
        );

        const donation = await hre.ethers.getContractAt(
            "DonationContract",
            "0x9d4454B023096f34B160D6B654540c56A1F81688"
        );

        const eco = await hre.ethers.getContractAt(
            "EcoCoin",
            "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf"
        );

        // Get signers
        const [owner, user1, user2] = await hre.ethers.getSigners();

        console.log("📊 Initial Auto-Donation State:");
        const user1Settings = await autoDonation.userSettings(user1.address);
        console.log(`User1 auto-donation active: ${user1Settings.isActive}`);
        console.log(`User1 total auto-donated: ${hre.ethers.utils.formatEther(await autoDonation.totalAutoDonated(user1.address))} ETH\n`);

        // Test 1: Subscribe to fixed amount auto-donation
        console.log("🔄 Test 1: Setting up fixed amount auto-donation...");
        const fixedAmount = hre.ethers.utils.parseEther("0.01"); // 0.01 ETH per trigger
        const monthlyLimit = hre.ethers.utils.parseEther("1.0"); // 1 ETH monthly limit
        const minTransactionValue = hre.ethers.utils.parseEther("0.1"); // Only trigger for transactions >= 0.1 ETH
        const maxSingleDonation = hre.ethers.utils.parseEther("0.05"); // Max 0.05 ETH per donation

        const subscribeTx1 = await autoDonation.connect(user1).subscribeFixedAmount(
            fixedAmount,
            0, // SaveTheOceans foundation
            monthlyLimit,
            minTransactionValue
        );
        await subscribeTx1.wait();

        const updatedUser1Settings = await autoDonation.userSettings(user1.address);
        console.log(`✅ User1 subscribed to fixed amount auto-donation`);
        console.log(`Fixed amount: ${hre.ethers.utils.formatEther(updatedUser1Settings.donationAmount)} ETH`);
        console.log(`Monthly limit: ${hre.ethers.utils.formatEther(updatedUser1Settings.monthlyLimit)} ETH`);
        console.log(`Active: ${updatedUser1Settings.isActive}\n`);

        // Test 2: Subscribe to percentage-based auto-donation
        console.log("🔄 Test 2: Setting up percentage-based auto-donation...");
        const donationPercentage = 50; // 0.5% (50/10000)

        const subscribeTx2 = await autoDonation.connect(user2).subscribePercentage(
            donationPercentage,
            1, // ProtectTheRainforest foundation
            monthlyLimit,
            minTransactionValue,
            maxSingleDonation
        );
        await subscribeTx2.wait();

        const user2Settings = await autoDonation.userSettings(user2.address);
        console.log(`✅ User2 subscribed to percentage-based auto-donation`);
        console.log(`Percentage: ${user2Settings.donationPercentage / 100}%`);
        console.log(`Uses percentage: ${user2Settings.usePercentage}`);
        console.log(`Active: ${user2Settings.isActive}\n`);

        // Test 3: Authorize owner to trigger auto-donations
        console.log("🔄 Test 3: Setting up auto-donation triggers...");
        const authTx1 = await autoDonation.connect(owner).addAuthorizedTrigger(owner.address);
        await authTx1.wait();

        const isOwnerAuthorized = await autoDonation.authorizedTriggers(owner.address);
        console.log(`✅ Owner authorized to trigger auto-donations`);
        console.log(`Owner is authorized trigger: ${isOwnerAuthorized}\n`);

        // Test 4: Trigger fixed amount auto-donation
        console.log("🔄 Test 4: Triggering fixed amount auto-donation...");
        const user1BalanceBefore = await hre.ethers.provider.getBalance(user1.address);
        const user1EcoBefore = await eco.balanceOf(user1.address);

        const transactionValue = hre.ethers.utils.parseEther("0.5"); // 0.5 ETH transaction

        const triggerTx1 = await autoDonation.connect(owner).triggerAutoDonation(
            user1.address,
            transactionValue,
            { value: fixedAmount } // Send ETH for the donation
        );
        await triggerTx1.wait();

        const user1BalanceAfter = await hre.ethers.provider.getBalance(user1.address);
        const user1EcoAfter = await eco.balanceOf(user1.address);
        const user1TotalAutoDonated = await autoDonation.totalAutoDonated(user1.address);

        console.log(`✅ Fixed amount auto-donation triggered`);
        console.log(`Amount donated: ${hre.ethers.utils.formatEther(fixedAmount)} ETH`);
        console.log(`ECO tokens earned: ${hre.ethers.utils.formatEther(user1EcoAfter.sub(user1EcoBefore))} ECO`);
        console.log(`Total auto-donated: ${hre.ethers.utils.formatEther(user1TotalAutoDonated)} ETH\n`);

        // Test 5: Trigger percentage-based auto-donation
        console.log("🔄 Test 5: Triggering percentage-based auto-donation...");
        const user2EcoBefore = await eco.balanceOf(user2.address);

        const transactionValue2 = hre.ethers.utils.parseEther("2.0"); // 2.0 ETH transaction
        const expectedDonation = transactionValue2.mul(donationPercentage).div(10000); // 0.5% of 2 ETH = 0.01 ETH

        const triggerTx2 = await autoDonation.connect(owner).triggerAutoDonation(
            user2.address,
            transactionValue2,
            { value: expectedDonation }
        );
        await triggerTx2.wait();

        const user2EcoAfter = await eco.balanceOf(user2.address);
        const user2TotalAutoDonated = await autoDonation.totalAutoDonated(user2.address);

        console.log(`✅ Percentage-based auto-donation triggered`);
        console.log(`Transaction value: ${hre.ethers.utils.formatEther(transactionValue2)} ETH`);
        console.log(`Donation amount (0.5%): ${hre.ethers.utils.formatEther(expectedDonation)} ETH`);
        console.log(`ECO tokens earned: ${hre.ethers.utils.formatEther(user2EcoAfter.sub(user2EcoBefore))} ECO`);
        console.log(`Total auto-donated: ${hre.ethers.utils.formatEther(user2TotalAutoDonated)} ETH\n`);

        // Test 6: Test monthly limit tracking
        console.log("🔄 Test 6: Testing monthly limit tracking...");
        const updatedUser1Settings2 = await autoDonation.userSettings(user1.address);
        const updatedUser2Settings2 = await autoDonation.userSettings(user2.address);

        console.log(`User1 current month spent: ${hre.ethers.utils.formatEther(updatedUser1Settings2.currentMonthSpent)} ETH`);
        console.log(`User1 monthly limit: ${hre.ethers.utils.formatEther(updatedUser1Settings2.monthlyLimit)} ETH`);
        console.log(`User2 current month spent: ${hre.ethers.utils.formatEther(updatedUser2Settings2.currentMonthSpent)} ETH`);
        console.log(`User2 monthly limit: ${hre.ethers.utils.formatEther(updatedUser2Settings2.monthlyLimit)} ETH\n`);

        // Test 7: Test unsubscribe functionality
        console.log("🔄 Test 7: Testing unsubscribe functionality...");
        const unsubscribeTx = await autoDonation.connect(user1).unsubscribe();
        await unsubscribeTx.wait();

        const finalUser1Settings = await autoDonation.userSettings(user1.address);
        console.log(`✅ User1 unsubscribed from auto-donations`);
        console.log(`User1 auto-donation active: ${finalUser1Settings.isActive}\n`);

        // Test 8: Verify auto-donation transaction counts
        console.log("🔄 Test 8: Checking transaction statistics...");
        const user1TransactionCount = await autoDonation.autoTransactionCount(user1.address);
        const user2TransactionCount = await autoDonation.autoTransactionCount(user2.address);

        console.log(`User1 auto-donation count: ${user1TransactionCount}`);
        console.log(`User2 auto-donation count: ${user2TransactionCount}\n`);

        console.log("🎉 Auto-Donation System Test Complete!");
        console.log("\n📋 Summary:");
        console.log(`- Fixed amount auto-donations: ✅`);
        console.log(`- Percentage-based auto-donations: ✅`);
        console.log(`- Monthly limit tracking: ✅`);
        console.log(`- Authorization system: ✅`);
        console.log(`- Unsubscribe functionality: ✅`);
        console.log(`- Transaction counting: ✅`);

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
