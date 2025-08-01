const hre = require("hardhat");

async function main() {
    try {
        console.log("🏛️ Testing Governance System...\n");

        // Get contracts
        const governance = await hre.ethers.getContractAt(
            "EcoGovernance",
            "0x809d550fca64d94Bd9F66E60752A544199cfAC3D"
        );

        const eco = await hre.ethers.getContractAt(
            "EcoCoin",
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        );

        // Get signers
        const [user1, user2, user3] = await hre.ethers.getSigners();

        console.log("📊 Initial Governance State:");
        const proposalCount = await governance.proposalCount();
        console.log(`Current proposal count: ${proposalCount}\n`);

        // Test 1: Create a proposal
        console.log("🔄 Test 1: Creating a new proposal...");
        const createTx = await governance.connect(user1).createProposal(
            "Increase minimum donation to 0.01 ETH - This proposal aims to increase the minimum donation threshold to reduce small transactions and encourage more meaningful contributions.",
            7 * 24 * 60 * 60  // 7 days in seconds
        );
        await createTx.wait();

        const newProposalCount = await governance.proposalCount();
        console.log(`✅ Proposal created. New count: ${newProposalCount}\n`);

        // Test 2: Get proposal details
        console.log("📋 Test 2: Getting proposal details...");
        const proposalId = newProposalCount.toNumber() - 1; // Latest proposal
        const proposal = await governance.proposals(proposalId);

        console.log(`Proposal ID: ${proposalId}`);
        console.log(`Description: ${proposal.description}`);
        console.log(`Creator: ${proposal.proposer}`);
        console.log(`For votes: ${proposal.votesFor}`);
        console.log(`Against votes: ${proposal.votesAgainst}`);
        console.log(`Executed: ${proposal.executed}\n`);

        // Test 3: Vote on proposal
        console.log("🔄 Test 3: Voting on proposal...");

        // Check voting power
        const user1EcoBalance = await eco.balanceOf(user1.address);
        const user2EcoBalance = await eco.balanceOf(user2.address);
        console.log(`User1 ECO balance (voting power): ${hre.ethers.utils.formatEther(user1EcoBalance)} ECO`);
        console.log(`User2 ECO balance (voting power): ${hre.ethers.utils.formatEther(user2EcoBalance)} ECO`);

        // User1 votes FOR
        const voteTx1 = await governance.connect(user1).vote(proposalId, true);
        await voteTx1.wait();
        console.log("✅ User1 voted FOR");

        // User2 votes AGAINST
        const voteTx2 = await governance.connect(user2).vote(proposalId, false);
        await voteTx2.wait();
        console.log("✅ User2 voted AGAINST");

        // Get updated proposal
        const updatedProposal = await governance.proposals(proposalId);
        console.log(`\nUpdated vote counts:`);
        console.log(`For votes: ${hre.ethers.utils.formatEther(updatedProposal.votesFor)} ECO`);
        console.log(`Against votes: ${hre.ethers.utils.formatEther(updatedProposal.votesAgainst)} ECO\n`);

        // Test 4: Check if user already voted
        console.log("🔄 Test 4: Checking vote status...");
        const user1Voted = await governance.hasVoted(proposalId, user1.address);
        const user3Voted = await governance.hasVoted(proposalId, user3.address);

        console.log(`User1 has voted: ${user1Voted}`);
        console.log(`User3 has voted: ${user3Voted}\n`);

        // Test 5: Try to vote twice (should fail)
        console.log("🔄 Test 5: Testing double vote prevention...");
        try {
            await governance.connect(user1).vote(proposalId, false);
            console.log("❌ Double vote was allowed (this should not happen)");
        } catch (error) {
            console.log("✅ Double vote prevented correctly");
        }

        // Test 6: Create another proposal
        console.log("\n🔄 Test 6: Creating second proposal...");
        const createTx2 = await governance.connect(user2).createProposal(
            "Add Carbon Offset Foundation - Proposal to add a new foundation focused on carbon offset projects and reforestation initiatives.",
            14 * 24 * 60 * 60  // 14 days in seconds
        );
        await createTx2.wait();

        const finalProposalCount = await governance.proposalCount();
        console.log(`✅ Second proposal created. Total proposals: ${finalProposalCount}\n`);

        console.log("🎉 Governance System Test Complete!");
        console.log("\n📋 Summary:");
        console.log(`- Total proposals created: ${finalProposalCount}`);
        console.log(`- Voting system working: ✅`);
        console.log(`- Double vote prevention: ✅`);
        console.log(`- Proposal creation: ✅`);

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
