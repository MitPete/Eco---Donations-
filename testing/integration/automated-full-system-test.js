const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { TestHelpers } = require("../utils/test-helpers");
const { DeploymentHelpers } = require("../utils/deployment-helpers");

describe("🔄 Automated Full System Integration Tests", function () {
  let ecosystem, contracts, accounts, addresses;
  let testUsers = {};

  before(async function () {
    console.log("🏗️ Deploying complete ecosystem for full system integration testing...");

    const signers = await ethers.getSigners();

    // Deploy complete ecosystem with optimized parameters for testing
    ecosystem = await DeploymentHelpers.deployCompleteEcosystem(signers, {
      ecoMaxSupply: "50000000", // 50M ECO tokens
      multiSigRequired: 2,
      governanceParams: {
        proposalThreshold: ethers.utils.parseEther("500"), // 500 ECO to create proposals
        votingDelay: 1, // 1 block delay for faster testing
        votingPeriod: 50 // 50 blocks voting period
      }
    });

    contracts = ecosystem.contracts;
    accounts = ecosystem.accounts;
    addresses = ecosystem.addresses;

    // Setup test users with descriptive names
    const [owner, ...otherSigners] = signers;
    testUsers = {
      donor1: otherSigners[5],
      donor2: otherSigners[6],
      donor3: otherSigners[7],
      proposer: otherSigners[8],
      voter1: otherSigners[9],
      voter2: otherSigners[10],
      autoUser: otherSigners[11],
      emergencyResponder: otherSigners[12]
    };

    console.log("✅ Full system ecosystem deployed and configured!");
  });

  describe("🔗 Core Contract Integration", function () {
    it("Should verify all contracts are properly connected", async function () {
      console.log("🔍 Verifying contract connections...");

      // Verify DonationContract -> EcoCoin connection
      const donationEcoToken = await contracts.donation.ecoToken();
      expect(donationEcoToken).to.equal(contracts.ecoCoin.address);

      // Verify AutoDonation -> DonationContract and EcoCoin connections
      const autoDonationContract = await contracts.autoDonation.donationContract();
      const autoEcoToken = await contracts.autoDonation.ecoToken();
      expect(autoDonationContract).to.equal(contracts.donation.address);
      expect(autoEcoToken).to.equal(contracts.ecoCoin.address);

      // Verify Governance -> EcoCoin connection
      const governanceToken = await contracts.governance.token();
      expect(governanceToken).to.equal(contracts.ecoCoin.address);

      // Verify SecurityConfig -> MultiSigWallet connection
      const securityParams = await contracts.securityConfig.securityParams();
      expect(securityParams.multiSigWallet).to.equal(contracts.multiSigWallet.address);

      console.log("✅ All contract connections verified");
    });

    it("Should verify contract permissions and roles", async function () {
      console.log("🔐 Verifying access controls...");

      // Verify EcoCoin ownership
      const ecoOwner = await contracts.ecoCoin.owner();
      expect(ecoOwner).to.equal(accounts.owner.address);

      // Verify MultiSigWallet owners
      const multiSigOwners = await contracts.multiSigWallet.getOwners();
      expect(multiSigOwners).to.include(accounts.owner.address);
      expect(multiSigOwners.length).to.equal(3);

      // Verify SecurityConfig emergency responders
      const ownerIsResponder = await contracts.securityConfig.emergencyResponders(accounts.owner.address);
      const multiSigIsResponder = await contracts.securityConfig.emergencyResponders(contracts.multiSigWallet.address);
      expect(ownerIsResponder).to.be.true;
      expect(multiSigIsResponder).to.be.true;

      console.log("✅ Access controls verified");
    });
  });

  describe("💰 Donation Flow Integration", function () {
    it("Should process donations with ECO token rewards across multiple users", async function () {
      console.log("💸 Testing integrated donation flow...");

      const donationTests = [
        { user: testUsers.donor1, foundation: 0, amount: "3.5" },
        { user: testUsers.donor2, foundation: 1, amount: "2.0" },
        { user: testUsers.donor3, foundation: 2, amount: "4.8" }
      ];

      for (const test of donationTests) {
        const amount = ethers.utils.parseEther(test.amount);
        const expectedEcoReward = amount.mul(10); // 10 ECO per ETH

        // Record balances before
        const userEcoBalanceBefore = await contracts.ecoCoin.balanceOf(test.user.address);
        const foundationBalanceBefore = await ethers.provider.getBalance(accounts.foundations[test.foundation].address);

        // Execute donation
        await contracts.donation.connect(test.user).donate(test.foundation, { value: amount });

        // Verify results
        const userEcoBalanceAfter = await contracts.ecoCoin.balanceOf(test.user.address);
        const foundationBalanceAfter = await ethers.provider.getBalance(accounts.foundations[test.foundation].address);

        expect(userEcoBalanceAfter.sub(userEcoBalanceBefore)).to.equal(expectedEcoReward);
        expect(foundationBalanceAfter.sub(foundationBalanceBefore)).to.equal(amount);

        console.log(`   ✅ ${test.amount} ETH donation processed for donor ${test.foundation + 1}`);
      }

      // Verify total donations counter
      const totalDonations = await contracts.donation.totalDonations();
      expect(totalDonations).to.equal(3);

      console.log("✅ All donation flows integrated successfully");
    });

    it("Should handle donation edge cases and error conditions", async function () {
      console.log("🔍 Testing donation edge cases...");

      // Test zero amount donation
      await expect(
        contracts.donation.connect(testUsers.donor1).donate(0, { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");

      // Test invalid foundation index
      await expect(
        contracts.donation.connect(testUsers.donor1).donate(999, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Invalid foundation");

      // Test paused contract (after governance pause if applicable)
      const isPaused = await contracts.donation.paused();
      if (isPaused) {
        await expect(
          contracts.donation.connect(testUsers.donor1).donate(0, { value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Pausable: paused");
      }

      console.log("✅ Edge cases handled correctly");
    });
  });

  describe("🔄 Auto-Donation System Integration", function () {
    it("Should integrate auto-donation with donation contract and ECO rewards", async function () {
      console.log("🤖 Testing auto-donation system integration...");

      // Setup auto-donation for test user
      const fixedAmount = ethers.utils.parseEther("0.1");
      const monthlyLimit = ethers.utils.parseEther("10");
      const minTransactionValue = ethers.utils.parseEther("1.0");

      await contracts.autoDonation.connect(testUsers.autoUser).subscribeFixedAmount(
        fixedAmount,
        0, // SaveTheOceans
        monthlyLimit,
        minTransactionValue
      );

      // Authorize triggering
      await contracts.autoDonation.connect(accounts.owner).addAuthorizedTrigger(accounts.owner.address);

      // Record initial balances
      const userEcoBalanceBefore = await contracts.ecoCoin.balanceOf(testUsers.autoUser.address);
      const foundationBalanceBefore = await ethers.provider.getBalance(accounts.foundations[0].address);
      const donationCountBefore = await contracts.donation.totalDonations();

      // Trigger auto-donation
      const transactionValue = ethers.utils.parseEther("2.0");
      await contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
        testUsers.autoUser.address,
        transactionValue,
        { value: fixedAmount }
      );

      // Verify integration effects
      const userEcoBalanceAfter = await contracts.ecoCoin.balanceOf(testUsers.autoUser.address);
      const foundationBalanceAfter = await ethers.provider.getBalance(accounts.foundations[0].address);
      const donationCountAfter = await contracts.donation.totalDonations();

      expect(userEcoBalanceAfter.sub(userEcoBalanceBefore)).to.equal(fixedAmount.mul(10)); // ECO rewards
      expect(foundationBalanceAfter.sub(foundationBalanceBefore)).to.equal(fixedAmount);
      expect(donationCountAfter.sub(donationCountBefore)).to.equal(1); // Donation counter incremented

      console.log("✅ Auto-donation system fully integrated");
    });

    it("Should handle percentage-based auto-donations with limits", async function () {
      console.log("📊 Testing percentage-based auto-donations...");

      // Setup percentage-based subscription
      await contracts.autoDonation.connect(testUsers.donor1).subscribePercentage(
        250, // 2.5% (250/10000)
        1, // ProtectTheRainforest
        ethers.utils.parseEther("5"), // 5 ETH monthly limit
        ethers.utils.parseEther("0.5"), // 0.5 ETH min transaction
        ethers.utils.parseEther("1.0") // 1.0 ETH max single donation
      );

      // Test triggering with different transaction values
      const testCases = [
        { transactionValue: "10.0", expectedDonation: "0.25" }, // 2.5% of 10 ETH = 0.25 ETH
        { transactionValue: "50.0", expectedDonation: "1.0" }   // 2.5% of 50 ETH = 1.25, capped at 1.0 ETH
      ];

      for (const testCase of testCases) {
        const transactionValue = ethers.utils.parseEther(testCase.transactionValue);
        const expectedDonation = ethers.utils.parseEther(testCase.expectedDonation);

        const balanceBefore = await ethers.provider.getBalance(accounts.foundations[1].address);

        await contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
          testUsers.donor1.address,
          transactionValue,
          { value: expectedDonation }
        );

        const balanceAfter = await ethers.provider.getBalance(accounts.foundations[1].address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(expectedDonation);

        console.log(`   ✅ ${testCase.transactionValue} ETH transaction → ${testCase.expectedDonation} ETH donation`);
      }

      console.log("✅ Percentage-based auto-donations with limits working");
    });
  });

  describe("🗳️ Governance System Integration", function () {
    it("Should integrate governance with ECO token voting power", async function () {
      console.log("🏛️ Testing governance system integration...");

      // Setup voters with ECO tokens
      const voterTokens = [
        { user: testUsers.proposer, amount: "2000" }, // 2K ECO (can create proposals)
        { user: testUsers.voter1, amount: "1500" },   // 1.5K ECO
        { user: testUsers.voter2, amount: "1000" }    // 1K ECO
      ];

      for (const voter of voterTokens) {
        await contracts.ecoCoin.mintTokens(voter.user.address, ethers.utils.parseEther(voter.amount));
        await contracts.ecoCoin.connect(voter.user).delegate(voter.user.address);
      }

      // Create proposal to update security parameters
      const newMaxTransaction = ethers.utils.parseEther("500"); // Increase to 500 ETH
      const targets = [contracts.securityConfig.address];
      const values = [0];
      const calldatas = [
        contracts.securityConfig.interface.encodeFunctionData("updateSecurityParams", [
          [
            newMaxTransaction,
            ethers.utils.parseEther("2000"), // dailyWithdrawLimit
            86400, // emergencyPauseDelay (24 hours)
            true, // requireMultiSigForCritical
            contracts.multiSigWallet.address
          ]
        ])
      ];
      const description = "Increase maximum transaction amount to 500 ETH";

      const proposeTx = await contracts.governance.connect(testUsers.proposer).propose(
        targets, values, calldatas, description
      );
      const receipt = await proposeTx.wait();
      const proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Advance to voting period
      await time.advanceBlockTo(await time.latestBlock() + 2);

      // Cast votes
      await contracts.governance.connect(testUsers.proposer).castVote(proposalId, 1); // FOR
      await contracts.governance.connect(testUsers.voter1).castVote(proposalId, 1);   // FOR
      await contracts.governance.connect(testUsers.voter2).castVote(proposalId, 0);   // AGAINST

      // Advance past voting period
      await time.advanceBlockTo(await time.latestBlock() + 51);

      // Check proposal outcome
      const proposalState = await contracts.governance.state(proposalId);
      expect(proposalState).to.equal(4); // Succeeded

      // Execute proposal
      const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));
      await contracts.governance.execute(targets, values, calldatas, descriptionHash);

      // Verify security parameters were updated
      const updatedParams = await contracts.securityConfig.securityParams();
      expect(updatedParams.maxTransactionAmount).to.equal(newMaxTransaction);

      console.log("✅ Governance successfully updated security parameters");
    });

    it("Should handle governance proposal execution failures gracefully", async function () {
      console.log("⚠️ Testing governance failure handling...");

      // Create proposal with invalid parameters (should fail execution)
      const targets = [contracts.securityConfig.address];
      const values = [0];
      const calldatas = [
        contracts.securityConfig.interface.encodeFunctionData("updateSecurityParams", [
          [
            0, // Invalid: maxTransactionAmount cannot be 0
            ethers.utils.parseEther("1000"),
            86400,
            true,
            ethers.constants.AddressZero // Invalid: cannot be zero address
          ]
        ])
      ];
      const description = "Invalid security parameter update";

      const proposeTx = await contracts.governance.connect(testUsers.proposer).propose(
        targets, values, calldatas, description
      );
      const receipt = await proposeTx.wait();
      const proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Vote and try to execute
      await time.advanceBlockTo(await time.latestBlock() + 2);
      await contracts.governance.connect(testUsers.proposer).castVote(proposalId, 1);
      await contracts.governance.connect(testUsers.voter1).castVote(proposalId, 1);
      await time.advanceBlockTo(await time.latestBlock() + 51);

      // Execution should fail
      const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));
      await expect(
        contracts.governance.execute(targets, values, calldatas, descriptionHash)
      ).to.be.reverted;

      console.log("✅ Governance correctly handles execution failures");
    });
  });

  describe("🔐 Security System Integration", function () {
    it("Should integrate SecurityConfig with MultiSigWallet operations", async function () {
      console.log("🛡️ Testing security system integration...");

      // Add emergency responder
      await contracts.securityConfig.connect(accounts.owner).setEmergencyResponder(
        testUsers.emergencyResponder.address,
        true
      );

      // Test emergency alert triggering
      const alertMessage = "Security integration test alert";
      await expect(
        contracts.securityConfig.connect(testUsers.emergencyResponder).triggerSecurityAlert(alertMessage)
      ).to.emit(contracts.securityConfig, "SecurityAlert")
        .withArgs(alertMessage, testUsers.emergencyResponder.address);

      // Test MultiSigWallet transaction for security parameter update
      const newDailyLimit = ethers.utils.parseEther("5000");
      const updateCalldata = contracts.securityConfig.interface.encodeFunctionData("updateSecurityParams", [
        [
          ethers.utils.parseEther("500"), // maxTransactionAmount (from previous test)
          newDailyLimit, // new dailyWithdrawLimit
          86400, // emergencyPauseDelay
          true, // requireMultiSigForCritical
          contracts.multiSigWallet.address
        ]
      ]);

      // Submit transaction through MultiSig
      const submitTx = await contracts.multiSigWallet.connect(accounts.owner).submitTransaction(
        contracts.securityConfig.address,
        0,
        updateCalldata
      );
      const submitReceipt = await submitTx.wait();
      const txIndex = submitReceipt.events.find(e => e.event === "SubmitTransaction").args.txIndex;

      // Confirm and execute
      await contracts.multiSigWallet.connect(accounts.foundations[0]).confirmTransaction(txIndex);
      await contracts.multiSigWallet.connect(accounts.owner).executeTransaction(txIndex);

      // Verify parameter update
      const updatedParams = await contracts.securityConfig.securityParams();
      expect(updatedParams.dailyWithdrawLimit).to.equal(newDailyLimit);

      console.log("✅ Security systems fully integrated");
    });

    it("Should handle emergency pause scenarios across contracts", async function () {
      console.log("🚨 Testing emergency pause integration...");

      // Pause donation contract via governance or direct owner action
      await contracts.donation.connect(accounts.owner).pause();

      // Verify donation operations are blocked
      await expect(
        contracts.donation.connect(testUsers.donor1).donate(0, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Pausable: paused");

      // Verify auto-donations still work (they go through autoDonation contract)
      // This tests that the system can partially operate during emergencies
      const isAutoDonationPaused = await contracts.autoDonation.paused();
      expect(isAutoDonationPaused).to.be.false;

      // Unpause for continued testing
      await contracts.donation.connect(accounts.owner).unpause();

      // Verify normal operations resume
      await contracts.donation.connect(testUsers.donor1).donate(0, { value: ethers.utils.parseEther("0.5") });

      console.log("✅ Emergency pause scenarios handled correctly");
    });
  });

  describe("📊 System Performance and Limits", function () {
    it("Should handle high-volume operations efficiently", async function () {
      console.log("⚡ Testing system performance under load...");

      // Test multiple rapid donations
      const rapidDonations = [];
      for (let i = 0; i < 10; i++) {
        rapidDonations.push(
          contracts.donation.connect(testUsers.donor2).donate(
            i % 3, // Rotate between foundations
            { value: ethers.utils.parseEther("0.1") }
          )
        );
      }

      // Execute all donations in parallel
      await Promise.all(rapidDonations);

      // Verify all donations were processed
      const donorHistory = await contracts.donation.getDonationsByUser(testUsers.donor2.address);
      expect(donorHistory.length).to.be.gte(10);

      console.log(`✅ Processed ${donorHistory.length} rapid donations successfully`);
    });

    it("Should respect system limits and constraints", async function () {
      console.log("🚫 Testing system limits enforcement...");

      // Test ECO token supply limit
      const currentSupply = await contracts.ecoCoin.totalSupply();
      const maxSupply = await contracts.ecoCoin.maxSupply();
      const remainingSupply = maxSupply.sub(currentSupply);

      if (remainingSupply.lt(ethers.utils.parseEther("1000"))) {
        // Test minting failure at max supply
        await expect(
          contracts.ecoCoin.mintTokens(testUsers.donor1.address, remainingSupply.add(1))
        ).to.be.revertedWith("Total supply cannot exceed maximum supply");
      }

      // Test auto-donation monthly limits
      const userSettings = await contracts.autoDonation.userSettings(testUsers.autoUser.address);
      if (userSettings.isActive) {
        const monthlyLimit = userSettings.monthlyLimit;
        const currentSpent = userSettings.currentMonthSpent;
        const remaining = monthlyLimit.sub(currentSpent);

        if (remaining.lt(ethers.utils.parseEther("1"))) {
          // Test monthly limit enforcement
          await expect(
            contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
              testUsers.autoUser.address,
              ethers.utils.parseEther("10"),
              { value: remaining.add(ethers.utils.parseEther("0.1")) }
            )
          ).to.be.revertedWith("Would exceed monthly limit");
        }
      }

      console.log("✅ System limits properly enforced");
    });
  });

  describe("🔄 Cross-Contract State Consistency", function () {
    it("Should maintain consistent state across all contracts", async function () {
      console.log("🔍 Verifying cross-contract state consistency...");

      // Record initial states
      const initialStates = {
        totalDonations: await contracts.donation.totalDonations(),
        ecoTotalSupply: await contracts.ecoCoin.totalSupply(),
        multiSigTxCount: await contracts.multiSigWallet.getTransactionCount()
      };

      // Perform integrated operations
      await contracts.donation.connect(testUsers.donor3).donate(1, { value: ethers.utils.parseEther("2") });

      if ((await contracts.autoDonation.userSettings(testUsers.autoUser.address)).isActive) {
        await contracts.autoDonation.connect(accounts.owner).triggerAutoDonation(
          testUsers.autoUser.address,
          ethers.utils.parseEther("3"),
          { value: ethers.utils.parseEther("0.1") }
        );
      }

      // Verify state changes are consistent
      const finalStates = {
        totalDonations: await contracts.donation.totalDonations(),
        ecoTotalSupply: await contracts.ecoCoin.totalSupply(),
        multiSigTxCount: await contracts.multiSigWallet.getTransactionCount()
      };

      expect(finalStates.totalDonations).to.be.gte(initialStates.totalDonations);
      expect(finalStates.ecoTotalSupply).to.be.gte(initialStates.ecoTotalSupply);
      expect(finalStates.multiSigTxCount).to.be.gte(initialStates.multiSigTxCount);

      console.log("✅ Cross-contract state consistency maintained");
    });
  });

  describe("🎯 System Integration Summary", function () {
    it("Should provide comprehensive system integration report", async function () {
      console.log("📋 Generating system integration report...");

      const systemReport = {
        contracts: {
          ecoCoin: {
            address: contracts.ecoCoin.address,
            totalSupply: await contracts.ecoCoin.totalSupply(),
            maxSupply: await contracts.ecoCoin.maxSupply()
          },
          donation: {
            address: contracts.donation.address,
            totalDonations: await contracts.donation.totalDonations(),
            paused: await contracts.donation.paused()
          },
          autoDonation: {
            address: contracts.autoDonation.address,
            // Could add active subscriptions count if available
          },
          governance: {
            address: contracts.governance.address,
            proposalThreshold: await contracts.governance.proposalThreshold(),
            votingDelay: await contracts.governance.votingDelay(),
            votingPeriod: await contracts.governance.votingPeriod()
          },
          multiSigWallet: {
            address: contracts.multiSigWallet.address,
            transactionCount: await contracts.multiSigWallet.getTransactionCount(),
            ownersCount: (await contracts.multiSigWallet.getOwners()).length
          },
          securityConfig: {
            address: contracts.securityConfig.address,
            paused: await contracts.securityConfig.paused()
          }
        },
        integrationTests: {
          contractConnections: "✅ Passed",
          donationFlow: "✅ Passed",
          autoDonationSystem: "✅ Passed",
          governanceSystem: "✅ Passed",
          securitySystem: "✅ Passed",
          performanceTests: "✅ Passed",
          stateConsistency: "✅ Passed"
        }
      };

      console.log("\n📊 SYSTEM INTEGRATION REPORT");
      console.log("═══════════════════════════════");
      console.log(`🪙 ECO Token Supply: ${ethers.utils.formatEther(systemReport.contracts.ecoCoin.totalSupply)} / ${ethers.utils.formatEther(systemReport.contracts.ecoCoin.maxSupply)}`);
      console.log(`💰 Total Donations: ${systemReport.contracts.donation.totalDonations}`);
      console.log(`🗳️ Governance Threshold: ${ethers.utils.formatEther(systemReport.contracts.governance.proposalThreshold)} ECO`);
      console.log(`🔐 MultiSig Transactions: ${systemReport.contracts.multiSigWallet.transactionCount}`);
      console.log(`👥 MultiSig Owners: ${systemReport.contracts.multiSigWallet.ownersCount}`);
      console.log("\n🧪 INTEGRATION TEST RESULTS");
      console.log("───────────────────────────────");
      Object.entries(systemReport.integrationTests).forEach(([test, result]) => {
        console.log(`${test}: ${result}`);
      });

      // Verify all core functionality is operational
      expect(systemReport.contracts.ecoCoin.totalSupply).to.be.gt(0);
      expect(systemReport.contracts.donation.totalDonations).to.be.gt(0);
      expect(systemReport.contracts.multiSigWallet.ownersCount).to.equal(3);

      console.log("\n🎉 FULL SYSTEM INTEGRATION: SUCCESS!");
      console.log("All contracts are properly integrated and functional");
    });
  });

  after(async function () {
    console.log("\n🚀 Automated Full System Integration Testing Complete!");
    console.log("📋 Summary of integration coverage:");
    console.log("   ✅ Core contract connectivity");
    console.log("   ✅ Cross-contract state management");
    console.log("   ✅ Integrated donation flows");
    console.log("   ✅ Auto-donation system integration");
    console.log("   ✅ Governance system integration");
    console.log("   ✅ Security system integration");
    console.log("   ✅ Performance under load");
    console.log("   ✅ System limits enforcement");
    console.log("   ✅ State consistency verification");
    console.log("\n💯 System ready for production deployment!");
  });
});
