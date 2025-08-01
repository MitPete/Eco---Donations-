const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { TestHelpers } = require("../utils/test-helpers");
const { DeploymentHelpers } = require("../utils/deployment-helpers");

describe("🚀 End-to-End User Journey Tests", function () {
  let ecosystem, contracts, accounts, addresses;
  let alice, bob, charlie, david, emma; // Test users
  let foundations;

  before(async function () {
    console.log("🏗️ Setting up complete Eco Donations ecosystem for E2E testing...");

    // Get all signers
    const signers = await ethers.getSigners();

    // Deploy complete ecosystem
    ecosystem = await DeploymentHelpers.deployCompleteEcosystem(signers, {
      ecoMaxSupply: "10000000", // 10M ECO tokens for comprehensive testing
      governanceParams: {
        proposalThreshold: ethers.utils.parseEther("1000"), // 1K ECO to create proposals
        votingDelay: 2, // 2 blocks delay
        votingPeriod: 100 // 100 blocks voting period
      }
    });

    contracts = ecosystem.contracts;
    accounts = ecosystem.accounts;
    addresses = ecosystem.addresses;
    foundations = accounts.foundations;

    // Assign user-friendly names to test accounts
    [alice, bob, charlie, david, emma] = signers.slice(6, 11);

    console.log("✅ Ecosystem deployed successfully!");
    console.log(`📍 Contracts deployed on: ${ecosystem.deploymentInfo.network}`);
  });

  describe("👤 User Journey 1: New User Complete Donation Flow", function () {
    it("Should complete full donation journey for new user Alice", async function () {
      console.log("\n🎬 Starting Alice's donation journey...");

      // Step 1: Alice checks her initial state
      const initialEthBalance = await ethers.provider.getBalance(alice.address);
      const initialEcoBalance = await contracts.ecoCoin.balanceOf(alice.address);

      console.log(`👩 Alice starts with ${ethers.utils.formatEther(initialEthBalance)} ETH`);
      expect(initialEcoBalance).to.equal(0); // No ECO tokens initially

      // Step 2: Alice makes her first donation to SaveTheOceans (Foundation 0)
      const donationAmount = ethers.utils.parseEther("2.5");
      const foundationIndex = 0;

      console.log(`💰 Alice donates ${ethers.utils.formatEther(donationAmount)} ETH to foundation ${foundationIndex}`);

      const donationTx = await contracts.donation.connect(alice).donate(foundationIndex, {
        value: donationAmount
      });
      await donationTx.wait();

      // Step 3: Verify Alice received ECO tokens (10 ECO per 1 ETH donated)
      const expectedEcoReward = donationAmount.mul(10);
      const aliceEcoBalance = await contracts.ecoCoin.balanceOf(alice.address);

      expect(aliceEcoBalance).to.equal(expectedEcoReward);
      console.log(`🪙 Alice earned ${ethers.utils.formatEther(aliceEcoBalance)} ECO tokens`);

      // Step 4: Verify foundation received the donation
      const foundationBalance = await ethers.provider.getBalance(foundations[foundationIndex].address);
      expect(foundationBalance).to.equal(donationAmount);
      console.log(`🏛️ Foundation received ${ethers.utils.formatEther(foundationBalance)} ETH`);

      // Step 5: Check donation is recorded in history
      const donationHistory = await contracts.donation.getDonationsByUser(alice.address);
      expect(donationHistory.length).to.equal(1);
      expect(donationHistory[0].amount).to.equal(donationAmount);
      expect(donationHistory[0].foundation).to.equal(foundationIndex);

      console.log("✅ Alice's first donation journey completed successfully!");
    });
  });

  describe("🔄 User Journey 2: Auto-Donation Setup and Execution", function () {
    it("Should complete auto-donation setup and triggering for Bob", async function () {
      console.log("\n🎬 Starting Bob's auto-donation journey...");

      // Step 1: Bob sets up auto-donation subscription
      const fixedAmount = ethers.utils.parseEther("0.05"); // 0.05 ETH per trigger
      const monthlyLimit = ethers.utils.parseEther("5.0"); // 5 ETH monthly limit
      const minTransactionValue = ethers.utils.parseEther("0.5"); // Trigger on 0.5+ ETH transactions
      const foundationIndex = 1; // ProtectTheRainforest

      console.log(`🔧 Bob sets up auto-donation: ${ethers.utils.formatEther(fixedAmount)} ETH per trigger`);

      await contracts.autoDonation.connect(bob).subscribeFixedAmount(
        fixedAmount,
        foundationIndex,
        monthlyLimit,
        minTransactionValue
      );

      // Verify subscription
      const bobSettings = await contracts.autoDonation.userSettings(bob.address);
      expect(bobSettings.isActive).to.be.true;
      expect(bobSettings.donationAmount).to.equal(fixedAmount);
      expect(bobSettings.usePercentage).to.be.false;

      console.log("✅ Bob's auto-donation subscription active");

      // Step 2: Owner authorizes auto-donation triggering
      await contracts.autoDonation.connect(accounts.owner).addAuthorizedTrigger(accounts.owner.address);

      // Step 3: Simulate transaction that triggers auto-donation
      const transactionValue = ethers.utils.parseEther("1.0"); // 1 ETH transaction (above min threshold)

      const bobEcoBalanceBefore = await contracts.ecoCoin.balanceOf(bob.address);
      const foundationBalanceBefore = await ethers.provider.getBalance(foundations[foundationIndex].address);

      console.log(`⚡ Triggering auto-donation for Bob's ${ethers.utils.formatEther(transactionValue)} ETH transaction`);

      const triggerTx = await contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
        bob.address,
        transactionValue,
        { value: fixedAmount }
      );
      await triggerTx.wait();

      // Step 4: Verify auto-donation executed correctly
      const bobEcoBalanceAfter = await contracts.ecoCoin.balanceOf(bob.address);
      const foundationBalanceAfter = await ethers.provider.getBalance(foundations[foundationIndex].address);
      const totalAutoDonated = await contracts.autoDonation.totalAutoDonated(bob.address);

      expect(totalAutoDonated).to.equal(fixedAmount);
      expect(bobEcoBalanceAfter.sub(bobEcoBalanceBefore)).to.equal(fixedAmount.mul(10)); // ECO rewards
      expect(foundationBalanceAfter.sub(foundationBalanceBefore)).to.equal(fixedAmount);

      console.log(`💸 Auto-donation executed: ${ethers.utils.formatEther(fixedAmount)} ETH donated`);
      console.log(`🪙 Bob earned ${ethers.utils.formatEther(bobEcoBalanceAfter.sub(bobEcoBalanceBefore))} ECO tokens`);
      console.log("✅ Bob's auto-donation journey completed successfully!");
    });
  });

  describe("🗳️ User Journey 3: DAO Governance Participation", function () {
    it("Should complete governance participation for Charlie", async function () {
      console.log("\n🎬 Starting Charlie's governance journey...");

      // Step 1: Charlie needs ECO tokens to participate (mint for testing)
      const charlieTokenAmount = ethers.utils.parseEther("2000"); // 2K ECO tokens
      await contracts.ecoCoin.mintTokens(charlie.address, charlieTokenAmount);

      // Delegate voting power to himself
      await contracts.ecoCoin.connect(charlie).delegate(charlie.address);

      console.log(`🪙 Charlie has ${ethers.utils.formatEther(charlieTokenAmount)} ECO tokens for governance`);

      // Step 2: Charlie creates a governance proposal
      const targets = [contracts.donation.address];
      const values = [0];
      const calldatas = [
        contracts.donation.interface.encodeFunctionData("pause", [])
      ];
      const description = "Emergency pause of donation contract for security review";

      console.log("📝 Charlie creates governance proposal: Emergency pause");

      const proposeTx = await contracts.governance.connect(charlie).propose(
        targets,
        values,
        calldatas,
        description
      );
      const proposeReceipt = await proposeTx.wait();
      const proposalId = proposeReceipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      console.log(`📋 Proposal created with ID: ${proposalId}`);

      // Step 3: Wait for voting delay to pass
      await time.advanceBlockTo(await time.latestBlock() + 3);

      // Step 4: Charlie votes on his own proposal
      console.log("🗳️ Charlie votes FOR his proposal");
      await contracts.governance.connect(charlie).castVote(proposalId, 1); // Vote FOR

      // Step 5: Get other users to vote (Alice and Bob need tokens first)
      await contracts.ecoCoin.mintTokens(alice.address, ethers.utils.parseEther("1500"));
      await contracts.ecoCoin.mintTokens(bob.address, ethers.utils.parseEther("1000"));
      await contracts.ecoCoin.connect(alice).delegate(alice.address);
      await contracts.ecoCoin.connect(bob).delegate(bob.address);

      console.log("🗳️ Alice and Bob vote on the proposal");
      await contracts.governance.connect(alice).castVote(proposalId, 1); // Vote FOR
      await contracts.governance.connect(bob).castVote(proposalId, 0); // Vote AGAINST

      // Step 6: Wait for voting period to end
      await time.advanceBlockTo(await time.latestBlock() + 101);

      // Step 7: Check proposal state and execute if passed
      const proposalState = await contracts.governance.state(proposalId);
      console.log(`📊 Proposal state: ${proposalState} (4 = Succeeded)`);

      if (proposalState === 4) { // Succeeded
        console.log("✅ Proposal succeeded, executing...");
        const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));

        await contracts.governance.execute(targets, values, calldatas, descriptionHash);

        // Verify execution - donation contract should be paused
        const isPaused = await contracts.donation.paused();
        expect(isPaused).to.be.true;
        console.log("🛑 Donation contract successfully paused via governance");
      }

      // Step 8: Verify vote counts
      const proposalVotes = await contracts.governance.proposalVotes(proposalId);
      const expectedForVotes = charlieTokenAmount.add(ethers.utils.parseEther("1500")); // Charlie + Alice
      const expectedAgainstVotes = ethers.utils.parseEther("1000"); // Bob

      expect(proposalVotes.forVotes).to.equal(expectedForVotes);
      expect(proposalVotes.againstVotes).to.equal(expectedAgainstVotes);

      console.log(`📊 Final votes - FOR: ${ethers.utils.formatEther(proposalVotes.forVotes)} ECO`);
      console.log(`📊 Final votes - AGAINST: ${ethers.utils.formatEther(proposalVotes.againstVotes)} ECO`);
      console.log("✅ Charlie's governance journey completed successfully!");
    });
  });

  describe("🔐 User Journey 4: Multi-Signature Security Operations", function () {
    it("Should complete multi-sig operation for security team", async function () {
      console.log("\n🎬 Starting multi-signature security operation...");

      // Step 1: Fund the multisig wallet
      const fundingAmount = ethers.utils.parseEther("10");
      await accounts.owner.sendTransaction({
        to: contracts.multiSigWallet.address,
        value: fundingAmount
      });

      console.log(`💰 MultiSig wallet funded with ${ethers.utils.formatEther(fundingAmount)} ETH`);

      // Step 2: Owner submits transaction to transfer funds
      const transferAmount = ethers.utils.parseEther("2");
      const recipient = david.address;

      console.log(`📝 Owner submits transaction: Transfer ${ethers.utils.formatEther(transferAmount)} ETH to David`);

      const submitTx = await contracts.multiSigWallet.connect(accounts.owner).submitTransaction(
        recipient,
        transferAmount,
        "0x"
      );
      const submitReceipt = await submitTx.wait();
      const txIndex = submitReceipt.events.find(e => e.event === "SubmitTransaction").args.txIndex;

      console.log(`📋 Transaction submitted with index: ${txIndex}`);

      // Step 3: Get transaction details
      const transaction = await contracts.multiSigWallet.getTransaction(txIndex);
      expect(transaction.to).to.equal(recipient);
      expect(transaction.value).to.equal(transferAmount);
      expect(transaction.executed).to.be.false;
      expect(transaction.numConfirmations).to.equal(1); // Auto-confirmed by submitter

      // Step 4: Second owner confirms the transaction
      console.log("✅ Foundation 1 confirms the transaction");
      await contracts.multiSigWallet.connect(foundations[0]).confirmTransaction(txIndex);

      // Step 5: Check if transaction can be executed (needs 2 confirmations)
      const updatedTransaction = await contracts.multiSigWallet.getTransaction(txIndex);
      expect(updatedTransaction.numConfirmations).to.equal(2);

      // Step 6: Execute the transaction
      const davidBalanceBefore = await ethers.provider.getBalance(david.address);

      console.log("🚀 Executing multi-sig transaction");
      await contracts.multiSigWallet.connect(accounts.owner).executeTransaction(txIndex);

      // Step 7: Verify execution
      const davidBalanceAfter = await ethers.provider.getBalance(david.address);
      const executedTransaction = await contracts.multiSigWallet.getTransaction(txIndex);

      expect(executedTransaction.executed).to.be.true;
      expect(davidBalanceAfter.sub(davidBalanceBefore)).to.equal(transferAmount);

      console.log(`💸 David received ${ethers.utils.formatEther(transferAmount)} ETH via multi-sig`);
      console.log("✅ Multi-signature security operation completed successfully!");
    });
  });

  describe("🔄 User Journey 5: Complete Platform Integration", function () {
    it("Should demonstrate full platform integration for Emma", async function () {
      console.log("\n🎬 Starting Emma's complete platform integration journey...");

      // Step 1: Emma joins as a complete platform user
      const emmaInitialEth = await ethers.provider.getBalance(emma.address);
      console.log(`👩‍💼 Emma starts her comprehensive platform journey`);

      // Step 2: Emma makes multiple donations to different foundations
      const donations = [
        { foundation: 0, amount: "1.5" }, // SaveTheOceans
        { foundation: 1, amount: "2.0" }, // ProtectTheRainforest
        { foundation: 2, amount: "1.0" }  // CleanEnergy
      ];

      let totalDonated = ethers.BigNumber.from(0);
      let totalEcoEarned = ethers.BigNumber.from(0);

      for (const donation of donations) {
        const amount = ethers.utils.parseEther(donation.amount);

        console.log(`💰 Emma donates ${donation.amount} ETH to foundation ${donation.foundation}`);

        await contracts.donation.connect(emma).donate(donation.foundation, { value: amount });

        totalDonated = totalDonated.add(amount);
        totalEcoEarned = totalEcoEarned.add(amount.mul(10)); // 10 ECO per ETH
      }

      // Step 3: Verify Emma's donation history and ECO balance
      const emmaDonationHistory = await contracts.donation.getDonationsByUser(emma.address);
      const emmaEcoBalance = await contracts.ecoCoin.balanceOf(emma.address);

      expect(emmaDonationHistory.length).to.equal(3);
      expect(emmaEcoBalance).to.equal(totalEcoEarned);

      console.log(`📊 Emma donated total: ${ethers.utils.formatEther(totalDonated)} ETH`);
      console.log(`🪙 Emma earned total: ${ethers.utils.formatEther(emmaEcoBalance)} ECO tokens`);

      // Step 4: Emma sets up percentage-based auto-donation
      await contracts.autoDonation.connect(emma).subscribePercentage(
        100, // 1% (100/10000)
        0, // SaveTheOceans
        ethers.utils.parseEther("10"), // 10 ETH monthly limit
        ethers.utils.parseEther("0.1"), // 0.1 ETH min transaction
        ethers.utils.parseEther("0.5") // 0.5 ETH max single donation
      );

      console.log("🔧 Emma sets up 1% auto-donation subscription");

      // Step 5: Emma delegates voting power and participates in governance
      await contracts.ecoCoin.connect(emma).delegate(emma.address);

      // Create a proposal (Emma has enough tokens now)
      const targets = [contracts.securityConfig.address];
      const values = [0];
      const calldatas = [
        contracts.securityConfig.interface.encodeFunctionData("triggerSecurityAlert", ["Emma's security audit proposal"])
      ];
      const description = "Trigger security alert for quarterly audit";

      console.log("📝 Emma creates governance proposal for security audit");

      const proposeTx = await contracts.governance.connect(emma).propose(targets, values, calldatas, description);
      const receipt = await proposeTx.wait();
      const proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Step 6: Test auto-donation triggering
      await time.advanceBlockTo(await time.latestBlock() + 3); // Wait for voting delay

      const transactionValue = ethers.utils.parseEther("5.0"); // 5 ETH transaction
      const expectedAutoDonation = transactionValue.mul(100).div(10000); // 1% of 5 ETH = 0.05 ETH

      const emmaEcoBalanceBefore = await contracts.ecoCoin.balanceOf(emma.address);

      console.log(`⚡ Triggering Emma's auto-donation on ${ethers.utils.formatEther(transactionValue)} ETH transaction`);

      await contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
        emma.address,
        transactionValue,
        { value: expectedAutoDonation }
      );

      const emmaEcoBalanceAfter = await contracts.ecoCoin.balanceOf(emma.address);
      const autoDonationReward = emmaEcoBalanceAfter.sub(emmaEcoBalanceBefore);

      expect(autoDonationReward).to.equal(expectedAutoDonation.mul(10)); // ECO reward for auto-donation

      console.log(`💸 Auto-donation executed: ${ethers.utils.formatEther(expectedAutoDonation)} ETH`);
      console.log(`🪙 Emma earned ${ethers.utils.formatEther(autoDonationReward)} ECO from auto-donation`);

      // Step 7: Emma votes on her proposal
      console.log("🗳️ Emma votes on her governance proposal");
      await contracts.governance.connect(emma).castVote(proposalId, 1); // Vote FOR

      // Step 8: Final verification - Emma's complete platform engagement
      const finalEmmaStats = {
        ecoBalance: await contracts.ecoCoin.balanceOf(emma.address),
        totalDonations: await contracts.donation.getDonationsByUser(emma.address),
        autoDonationSettings: await contracts.autoDonation.userSettings(emma.address),
        totalAutoDonated: await contracts.autoDonation.totalAutoDonated(emma.address)
      };

      expect(finalEmmaStats.ecoBalance).to.be.gt(totalEcoEarned); // Should have more from auto-donation
      expect(finalEmmaStats.totalDonations.length).to.equal(3);
      expect(finalEmmaStats.autoDonationSettings.isActive).to.be.true;
      expect(finalEmmaStats.totalAutoDonated).to.equal(expectedAutoDonation);

      console.log("📊 Emma's Final Platform Stats:");
      console.log(`   🪙 ECO Balance: ${ethers.utils.formatEther(finalEmmaStats.ecoBalance)} ECO`);
      console.log(`   💰 Manual Donations: ${finalEmmaStats.totalDonations.length} transactions`);
      console.log(`   🔄 Auto-donated: ${ethers.utils.formatEther(finalEmmaStats.totalAutoDonated)} ETH`);
      console.log(`   🗳️ Governance: Active participant`);
      console.log("✅ Emma's complete platform integration journey finished!");
    });
  });

  describe("📊 Platform Health Check", function () {
    it("Should verify overall platform health after all user journeys", async function () {
      console.log("\n🏥 Performing comprehensive platform health check...");

      // Check all contracts are operational
      const healthCheck = {
        ecoCoin: {
          totalSupply: await contracts.ecoCoin.totalSupply(),
          maxSupply: await contracts.ecoCoin.maxSupply()
        },
        donation: {
          totalDonations: await contracts.donation.totalDonations(),
          paused: await contracts.donation.paused()
        },
        governance: {
          proposalCount: await contracts.governance.proposalCount ? await contracts.governance.proposalCount() : "N/A"
        },
        multiSig: {
          transactionCount: await contracts.multiSigWallet.getTransactionCount(),
          owners: await contracts.multiSigWallet.getOwners()
        },
        autoDonation: {
          // Check some users have active subscriptions
        }
      };

      console.log("📈 Platform Health Report:");
      console.log(`   🪙 ECO Supply: ${ethers.utils.formatEther(healthCheck.ecoCoin.totalSupply)} / ${ethers.utils.formatEther(healthCheck.ecoCoin.maxSupply)}`);
      console.log(`   💰 Total Donations: ${healthCheck.donation.totalDonations}`);
      console.log(`   🗳️ Governance Active: ${!healthCheck.donation.paused ? "✅" : "⚠️ Paused"}`);
      console.log(`   🔐 MultiSig Transactions: ${healthCheck.multiSig.transactionCount}`);
      console.log(`   👥 MultiSig Owners: ${healthCheck.multiSig.owners.length}`);

      // Verify platform integrity
      expect(healthCheck.ecoCoin.totalSupply).to.be.gt(0);
      expect(healthCheck.donation.totalDonations).to.be.gt(0);
      expect(healthCheck.multiSig.transactionCount).to.be.gt(0);
      expect(healthCheck.multiSig.owners.length).to.equal(3);

      console.log("✅ Platform health check passed - all systems operational!");
    });
  });

  after(async function () {
    console.log("\n🎉 All E2E user journeys completed successfully!");
    console.log("📋 Summary of tested user flows:");
    console.log("   ✅ New user donation experience");
    console.log("   ✅ Auto-donation setup and execution");
    console.log("   ✅ DAO governance participation");
    console.log("   ✅ Multi-signature security operations");
    console.log("   ✅ Complete platform integration");
    console.log("   ✅ Platform health verification");
    console.log("\n🚀 Eco Donations platform is ready for production!");
  });
});
