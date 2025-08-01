const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EcoGovernance", function () {
  let ecoGovernance, ecoCoin, owner, user1, user2, user3;
  const proposalThreshold = ethers.utils.parseEther("100"); // 100 ECO tokens
  const votingDelay = 1; // 1 block
  const votingPeriod = 50; // 50 blocks

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy EcoCoin
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const maxSupply = ethers.utils.parseEther("1000000");
    ecoCoin = await EcoCoin.deploy(maxSupply);
    await ecoCoin.deployed();

    // Deploy EcoGovernance
    const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
    ecoGovernance = await EcoGovernance.deploy(
      ecoCoin.address,
      proposalThreshold,
      votingDelay,
      votingPeriod
    );
    await ecoGovernance.deployed();

    // Mint tokens to users for testing
    await ecoCoin.mintTokens(user1.address, ethers.utils.parseEther("200"));
    await ecoCoin.mintTokens(user2.address, ethers.utils.parseEther("150"));
    await ecoCoin.mintTokens(user3.address, ethers.utils.parseEther("50"));

    // Delegate voting power to themselves
    await ecoCoin.connect(user1).delegate(user1.address);
    await ecoCoin.connect(user2).delegate(user2.address);
    await ecoCoin.connect(user3).delegate(user3.address);
  });

  describe("Deployment", function () {
    it("Should set the correct ECO token address", async function () {
      expect(await ecoGovernance.token()).to.equal(ecoCoin.address);
    });

    it("Should set the correct proposal threshold", async function () {
      expect(await ecoGovernance.proposalThreshold()).to.equal(proposalThreshold);
    });

    it("Should set the correct voting delay", async function () {
      expect(await ecoGovernance.votingDelay()).to.equal(votingDelay);
    });

    it("Should set the correct voting period", async function () {
      expect(await ecoGovernance.votingPeriod()).to.equal(votingPeriod);
    });
  });

  describe("Proposal Creation", function () {
    it("Should allow users with enough tokens to create proposals", async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Test Proposal #1";

      await expect(
        ecoGovernance.connect(user1).propose(targets, values, calldatas, description)
      ).to.emit(ecoGovernance, "ProposalCreated");
    });

    it("Should reject proposals from users without enough tokens", async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Test Proposal #1";

      await expect(
        ecoGovernance.connect(user3).propose(targets, values, calldatas, description)
      ).to.be.revertedWith("Proposer votes below proposal threshold");
    });

    it("Should reject empty proposals", async function () {
      await expect(
        ecoGovernance.connect(user1).propose([], [], [], "Empty Proposal")
      ).to.be.revertedWith("Empty proposal");
    });

    it("Should reject mismatched array lengths", async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0, 0]; // Different length
      const calldatas = ["0x"];
      const description = "Mismatched Proposal";

      await expect(
        ecoGovernance.connect(user1).propose(targets, values, calldatas, description)
      ).to.be.revertedWith("Array lengths must match");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      // Create a proposal
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Test Proposal for Voting";

      const tx = await ecoGovernance.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Advance past voting delay
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);
    });

    it("Should allow users to vote for proposals", async function () {
      await expect(
        ecoGovernance.connect(user2).castVote(proposalId, 1) // Vote FOR
      ).to.emit(ecoGovernance, "VoteCast");

      const hasVoted = await ecoGovernance.hasVoted(proposalId, user2.address);
      expect(hasVoted).to.be.true;
    });

    it("Should allow users to vote against proposals", async function () {
      await expect(
        ecoGovernance.connect(user2).castVote(proposalId, 0) // Vote AGAINST
      ).to.emit(ecoGovernance, "VoteCast");
    });

    it("Should allow users to abstain from voting", async function () {
      await expect(
        ecoGovernance.connect(user2).castVote(proposalId, 2) // ABSTAIN
      ).to.emit(ecoGovernance, "VoteCast");
    });

    it("Should reject double voting", async function () {
      await ecoGovernance.connect(user2).castVote(proposalId, 1);

      await expect(
        ecoGovernance.connect(user2).castVote(proposalId, 0)
      ).to.be.revertedWith("Vote already cast");
    });

    it("Should reject voting with invalid support values", async function () {
      await expect(
        ecoGovernance.connect(user2).castVote(proposalId, 3) // Invalid support
      ).to.be.revertedWith("Invalid vote type");
    });

    it("Should count votes correctly", async function () {
      await ecoGovernance.connect(user1).castVote(proposalId, 1); // FOR: 200 tokens
      await ecoGovernance.connect(user2).castVote(proposalId, 0); // AGAINST: 150 tokens
      await ecoGovernance.connect(user3).castVote(proposalId, 2); // ABSTAIN: 50 tokens

      const proposalVotes = await ecoGovernance.proposalVotes(proposalId);
      expect(proposalVotes.forVotes).to.equal(ethers.utils.parseEther("200"));
      expect(proposalVotes.againstVotes).to.equal(ethers.utils.parseEther("150"));
      expect(proposalVotes.abstainVotes).to.equal(ethers.utils.parseEther("50"));
    });
  });

  describe("Proposal States", function () {
    let proposalId;

    beforeEach(async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Test Proposal for States";

      const tx = await ecoGovernance.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;
    });

    it("Should start in Pending state", async function () {
      const state = await ecoGovernance.state(proposalId);
      expect(state).to.equal(0); // Pending
    });

    it("Should move to Active state after voting delay", async function () {
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);
      const state = await ecoGovernance.state(proposalId);
      expect(state).to.equal(1); // Active
    });

    it("Should move to Succeeded state with enough votes", async function () {
      // Move to active
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);

      // Vote with enough support
      await ecoGovernance.connect(user1).castVote(proposalId, 1); // 200 FOR
      await ecoGovernance.connect(user2).castVote(proposalId, 1); // 150 FOR

      // Move past voting period
      await time.advanceBlockTo(await time.latestBlock() + votingPeriod + 1);

      const state = await ecoGovernance.state(proposalId);
      expect(state).to.equal(4); // Succeeded
    });

    it("Should move to Defeated state without enough votes", async function () {
      // Move to active
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);

      // Vote against
      await ecoGovernance.connect(user1).castVote(proposalId, 0); // 200 AGAINST
      await ecoGovernance.connect(user2).castVote(proposalId, 0); // 150 AGAINST

      // Move past voting period
      await time.advanceBlockTo(await time.latestBlock() + votingPeriod + 1);

      const state = await ecoGovernance.state(proposalId);
      expect(state).to.equal(3); // Defeated
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Test Proposal for Execution";

      const tx = await ecoGovernance.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Move to active and vote
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);
      await ecoGovernance.connect(user1).castVote(proposalId, 1);
      await ecoGovernance.connect(user2).castVote(proposalId, 1);

      // Move past voting period
      await time.advanceBlockTo(await time.latestBlock() + votingPeriod + 1);
    });

    it("Should allow execution of succeeded proposals", async function () {
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Test Proposal for Execution"));

      await expect(
        ecoGovernance.execute(targets, values, calldatas, descriptionHash)
      ).to.emit(ecoGovernance, "ProposalExecuted");

      const state = await ecoGovernance.state(proposalId);
      expect(state).to.equal(7); // Executed
    });

    it("Should reject execution of defeated proposals", async function () {
      // Create a new proposal that will be defeated
      const targets = [ethers.constants.AddressZero];
      const values = [0];
      const calldatas = ["0x"];
      const description = "Defeated Proposal";

      const tx = await ecoGovernance.connect(user1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      const defeatedProposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

      // Vote against
      await time.advanceBlockTo(await time.latestBlock() + votingDelay + 1);
      await ecoGovernance.connect(user1).castVote(defeatedProposalId, 0);
      await ecoGovernance.connect(user2).castVote(defeatedProposalId, 0);
      await time.advanceBlockTo(await time.latestBlock() + votingPeriod + 1);

      const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));

      await expect(
        ecoGovernance.execute(targets, values, calldatas, descriptionHash)
      ).to.be.revertedWith("Proposal not in executable state");
    });
  });

  describe("Quorum", function () {
    it("Should calculate quorum correctly", async function () {
      const totalSupply = await ecoCoin.totalSupply();
      const expectedQuorum = totalSupply.div(10); // 10% quorum
      const actualQuorum = await ecoGovernance.quorum(await time.latestBlock());

      expect(actualQuorum).to.equal(expectedQuorum);
    });
  });

  describe("Voting Power", function () {
    it("Should use delegated voting power", async function () {
      // Delegate user3's votes to user1
      await ecoCoin.connect(user3).delegate(user1.address);

      const user1VotingPower = await ecoGovernance.getVotes(user1.address, await time.latestBlock());
      const expectedPower = ethers.utils.parseEther("250"); // 200 + 50 delegated

      expect(user1VotingPower).to.equal(expectedPower);
    });
  });
});
