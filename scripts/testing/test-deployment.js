const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 COMPREHENSIVE CONTRACT TESTING");
    console.log("==================================");

    // Load deployment info
    const network = hre.network.name;
    const deploymentFile = `./deployments/${network}-deployment.json`;

    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ No deployment found. Run deploy-testnet.js first");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    console.log("📋 Testing deployment from:", deploymentFile);

    // Get contracts
    const [deployer, user1, user2] = await ethers.getSigners();

    const ecoCoin = await ethers.getContractAt("EcoCoin", deployment.contracts.ecoCoin);
    const donationContract = await ethers.getContractAt("DonationContract", deployment.contracts.donationContract);
    const ecoGovernance = await ethers.getContractAt("EcoGovernance", deployment.contracts.ecoGovernance);
    const autoDonationService = await ethers.getContractAt("AutoDonationService", deployment.contracts.autoDonationService);
    const multiSigWallet = await ethers.getContractAt("MultiSigWallet", deployment.contracts.multiSigWallet);

    console.log("✅ Contracts loaded");

    const testResults = {
        timestamp: new Date().toISOString(),
        network: network,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        tests: []
    };

    // Helper function for testing
    async function runTest(testName, testFunction) {
        testResults.totalTests++;
        console.log(`\n🧪 Testing: ${testName}`);

        try {
            await testFunction();
            console.log(`✅ PASSED: ${testName}`);
            testResults.passedTests++;
            testResults.tests.push({ name: testName, result: "PASSED", error: null });
            return true;
        } catch (error) {
            console.log(`❌ FAILED: ${testName}`);
            console.log(`   Error: ${error.message}`);
            testResults.failedTests++;
            testResults.tests.push({ name: testName, result: "FAILED", error: error.message });
            return false;
        }
    }

    console.log("\n🔐 === MULTI-SIGNATURE WALLET TESTS ===");

    await runTest("MultiSig Owner Verification", async () => {
        const isOwner = await multiSigWallet.isOwner(deployer.address);
        if (!isOwner) throw new Error("Deployer should be owner");
    });

    await runTest("MultiSig Required Confirmations", async () => {
        const required = await multiSigWallet.required();
        if (required.toString() !== "1") throw new Error(`Expected 1 confirmation, got ${required}`);
    });

    console.log("\n🪙 === ECO COIN TESTS ===");

    await runTest("ECO Coin Basic Info", async () => {
        const name = await ecoCoin.name();
        const symbol = await ecoCoin.symbol();
        const decimals = await ecoCoin.decimals();

        if (name !== "ECO Coin") throw new Error(`Wrong name: ${name}`);
        if (symbol !== "ECO") throw new Error(`Wrong symbol: ${symbol}`);
        if (decimals !== 18) throw new Error(`Wrong decimals: ${decimals}`);
    });

    await runTest("ECO Coin Balance Check", async () => {
        const balance = await ecoCoin.balanceOf(deployer.address);
        const expectedBalance = ethers.utils.parseEther("10000");

        if (!balance.eq(expectedBalance)) {
            throw new Error(`Wrong balance: ${ethers.utils.formatEther(balance)} ECO, expected 10000 ECO`);
        }
    });

    await runTest("ECO Coin Transfer", async () => {
        const transferAmount = ethers.utils.parseEther("100");
        const initialBalance = await ecoCoin.balanceOf(user1.address);

        await ecoCoin.transfer(user1.address, transferAmount);

        const finalBalance = await ecoCoin.balanceOf(user1.address);
        const expectedBalance = initialBalance.add(transferAmount);

        if (!finalBalance.eq(expectedBalance)) {
            throw new Error(`Transfer failed. Expected ${ethers.utils.formatEther(expectedBalance)}, got ${ethers.utils.formatEther(finalBalance)}`);
        }
    });

    console.log("\n💝 === DONATION CONTRACT TESTS ===");

    await runTest("Donation Contract Stats", async () => {
        const stats = await donationContract.getStats();
        console.log(`   Stats: ${stats.totalDonationsAmount} donations, ${stats.totalTokensMinted} tokens, paused: ${stats.isPaused}`);
    });

    await runTest("Make Donation", async () => {
        const donationAmount = ethers.utils.parseEther("0.01");
        const initialEcoBalance = await ecoCoin.balanceOf(user1.address);
        const initialEthBalance = await ethers.provider.getBalance(deployment.foundations.oceans);

        const tx = await donationContract.connect(user1).donate(0, "Test donation", {
            value: donationAmount
        });

        const receipt = await tx.wait();
        console.log(`   Gas used: ${receipt.gasUsed}`);

        // Check ECO tokens minted (10x the ETH amount)
        const finalEcoBalance = await ecoCoin.balanceOf(user1.address);
        const expectedEcoIncrease = donationAmount.mul(10);
        const actualEcoIncrease = finalEcoBalance.sub(initialEcoBalance);

        if (!actualEcoIncrease.eq(expectedEcoIncrease)) {
            throw new Error(`Wrong ECO minting. Expected ${ethers.utils.formatEther(expectedEcoIncrease)}, got ${ethers.utils.formatEther(actualEcoIncrease)}`);
        }

        console.log(`   ✅ Minted ${ethers.utils.formatEther(actualEcoIncrease)} ECO tokens`);
    });

    await runTest("Check Donation Stats After", async () => {
        const stats = await donationContract.getStats();
        const totalDonations = stats.totalDonationsAmount;

        if (totalDonations.eq(0)) {
            throw new Error("Total donations should be > 0 after donation");
        }

        console.log(`   Total donations: ${ethers.utils.formatEther(totalDonations)} ETH`);
    });

    console.log("\n🏛️ === GOVERNANCE TESTS ===");

    await runTest("Governance Parameters", async () => {
        const params = await ecoGovernance.getGovernanceParams();
        console.log(`   Min voting: ${params.minVotingPeriod}s, Max voting: ${params.maxVotingPeriod}s`);
        console.log(`   Proposal threshold: ${ethers.utils.formatEther(params.propThreshold)} ECO`);
        console.log(`   Quorum: ${params.quorumPct}%`);
    });

    await runTest("Create Governance Proposal", async () => {
        // Give user1 enough tokens to create proposal
        const threshold = await ecoGovernance.proposalThreshold();
        const currentBalance = await ecoCoin.balanceOf(user1.address);

        if (currentBalance.lt(threshold)) {
            const needed = threshold.sub(currentBalance);
            await ecoCoin.mintTokens(user1.address, needed);
            console.log(`   Minted ${ethers.utils.formatEther(needed)} ECO for proposal`);
        }

        const tx = await ecoGovernance.connect(user1).createProposal(
            "Test proposal for platform improvement",
            7 * 24 * 3600 // 7 days
        );

        const receipt = await tx.wait();
        console.log(`   Proposal created, gas used: ${receipt.gasUsed}`);

        const proposalCount = await ecoGovernance.proposalCount();
        if (proposalCount.eq(0)) {
            throw new Error("Proposal count should be > 0");
        }
    });

    await runTest("Vote on Proposal", async () => {
        const proposalId = 0; // First proposal

        const tx = await ecoGovernance.connect(user1).vote(proposalId, true);
        const receipt = await tx.wait();
        console.log(`   Vote cast, gas used: ${receipt.gasUsed}`);

        const proposal = await ecoGovernance.getProposal(proposalId);
        if (proposal.votesFor.eq(0)) {
            throw new Error("Votes for should be > 0");
        }

        console.log(`   Votes for: ${ethers.utils.formatEther(proposal.votesFor)} ECO`);
    });

    console.log("\n🤖 === AUTO-DONATION SERVICE TESTS ===");

    await runTest("Auto-Donation Subscription", async () => {
        const donationAmount = ethers.utils.parseEther("0.001");
        const monthlyLimit = ethers.utils.parseEther("0.1");
        const minTxValue = ethers.utils.parseEther("0.01");

        const tx = await autoDonationService.connect(user2).subscribeFixedAmount(
            donationAmount,
            0, // Save The Oceans
            monthlyLimit,
            minTxValue
        );

        const receipt = await tx.wait();
        console.log(`   Subscription created, gas used: ${receipt.gasUsed}`);

        const settings = await autoDonationService.getUserSettings(user2.address);
        if (!settings.isActive) {
            throw new Error("Auto-donation should be active after subscription");
        }

        console.log(`   Auto-donation amount: ${ethers.utils.formatEther(settings.donationAmount)} ETH`);
    });

    await runTest("Auto-Donation Global Limits", async () => {
        const limits = await autoDonationService.getGlobalLimits();
        console.log(`   Monthly limit: ${ethers.utils.formatEther(limits.monthlyLimit)} ETH`);
        console.log(`   Max percentage: ${limits.percentage / 100}%`);
        console.log(`   Max single: ${ethers.utils.formatEther(limits.singleDonation)} ETH`);
    });

    console.log("\n⚡ === GAS OPTIMIZATION TESTS ===");

    await runTest("Gas Usage Analysis", async () => {
        const testCases = [
            { name: "ECO Transfer", gasUsed: 65000 },
            { name: "Donation", gasUsed: 250000 },
            { name: "Governance Vote", gasUsed: 120000 },
            { name: "Auto-donation Subscribe", gasUsed: 100000 }
        ];

        console.log("   Gas usage expectations:");
        for (const testCase of testCases) {
            console.log(`   ${testCase.name}: ~${testCase.gasUsed.toLocaleString()} gas`);
        }
    });

    console.log("\n🔍 === SECURITY VALIDATION ===");

    await runTest("Contract Versions", async () => {
        const ecoVersion = await ecoCoin.version();
        const donationVersion = await donationContract.version();
        const governanceVersion = await ecoGovernance.version();
        const autoVersion = await autoDonationService.version();

        console.log(`   EcoCoin: v${ecoVersion}`);
        console.log(`   DonationContract: v${donationVersion}`);
        console.log(`   EcoGovernance: v${governanceVersion}`);
        console.log(`   AutoDonationService: v${autoVersion}`);

        if (ecoVersion !== "2.0.0") throw new Error(`Wrong EcoCoin version: ${ecoVersion}`);
    });

    await runTest("Security Features Check", async () => {
        // Check if contracts are pausable
        const ecoIsPaused = await ecoCoin.paused();
        const donationIsPaused = await donationContract.paused();

        console.log(`   EcoCoin paused: ${ecoIsPaused}`);
        console.log(`   DonationContract paused: ${donationIsPaused}`);

        // Both should be unpaused initially
        if (ecoIsPaused || donationIsPaused) {
            throw new Error("Contracts should be unpaused initially");
        }
    });

    // Generate test report
    console.log("\n📊 === TEST SUMMARY ===");
    console.log(`Total tests: ${testResults.totalTests}`);
    console.log(`✅ Passed: ${testResults.passedTests}`);
    console.log(`❌ Failed: ${testResults.failedTests}`);
    console.log(`📈 Success rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);

    // Save test results
    const testReportFile = `./deployments/${network}-test-results.json`;
    fs.writeFileSync(testReportFile, JSON.stringify(testResults, null, 2));
    console.log(`📁 Test results saved to: ${testReportFile}`);

    if (testResults.failedTests > 0) {
        console.log("\n⚠️  Some tests failed. Review the errors above.");
        process.exit(1);
    } else {
        console.log("\n🎉 All tests passed! Deployment is ready for testnet.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testing failed:", error);
        process.exit(1);
    });
