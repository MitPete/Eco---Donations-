const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoGovernance", function () {
    let ecoGovernance, ecoCoin, owner, addr1, addr2;
    let proposalThreshold = ethers.utils.parseEther("1000");

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        
        // Deploy EcoCoin contract first
        const EcoCoinFactory = await ethers.getContractFactory("EcoCoin");
        
        // Use placeholder addresses for dependencies
        const donationAddress = addr2.address;
        const multiSigAddress = owner.address;
        
        // Deploy EcoCoin with placeholder dependencies
        ecoCoin = await EcoCoinFactory.deploy(donationAddress, multiSigAddress);
        
        // Deploy EcoGovernance contract
        const EcoGovernanceFactory = await ethers.getContractFactory("EcoGovernance");
        ecoGovernance = await EcoGovernanceFactory.deploy(ecoCoin.address);
        
        // Set up total supply for governance calculations (smaller for easier quorum)
        await ecoGovernance.updateTotalSupply(ethers.utils.parseEther("50000"));
        
        // Add owner as authorized minter and mint tokens for testing
        await ecoCoin.setAuthorizedMinter(owner.address, true);
        
        try {
            await ecoCoin.mint(addr1.address, ethers.utils.parseEther("15000")); // More tokens for quorum
            await ecoCoin.mint(addr2.address, ethers.utils.parseEther("5000"));
        } catch (error) {
            console.log("Note: Some minting may have been rate limited");
        }
    });

    describe("Deployment", function () {
        it("Should set the correct ECO token address", async function () {
            expect(await ecoGovernance.ecoCoin()).to.equal(ecoCoin.address);
        });

        it("Should set the correct proposal threshold", async function () {
            const params = await ecoGovernance.getGovernanceParams();
            expect(params[2]).to.equal(proposalThreshold); // propThreshold is 3rd parameter
        });

        it("Should set the correct minimum voting period", async function () {
            const params = await ecoGovernance.getGovernanceParams();
            expect(params[0]).to.equal(3 * 24 * 60 * 60); // 3 days in seconds
        });

        it("Should set the correct maximum voting period", async function () {
            const params = await ecoGovernance.getGovernanceParams();
            expect(params[1]).to.equal(14 * 24 * 60 * 60); // 14 days in seconds
        });
    });

    describe("Proposal Creation", function () {
        it("Should allow users with enough tokens to create proposals", async function () {
            const description = "Test proposal";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await expect(
                ecoGovernance.connect(addr1).createProposal(description, duration)
            ).to.emit(ecoGovernance, "ProposalCreated");
        });

        it("Should reject proposals from users without enough tokens", async function () {
            const description = "Test proposal";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await expect(
                ecoGovernance.connect(addr2).createProposal(description, duration)
            ).to.be.revertedWith("Insufficient ECO tokens");
        });

        it("Should reject empty proposals", async function () {
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await expect(
                ecoGovernance.connect(addr1).createProposal("", duration)
            ).to.be.revertedWith("Empty description");
        });

        it("Should reject invalid duration", async function () {
            const description = "Test proposal";
            const shortDuration = 1 * 60 * 60; // 1 hour (too short)
            
            await expect(
                ecoGovernance.connect(addr1).createProposal(description, shortDuration)
            ).to.be.revertedWith("Invalid duration");
        });
    });

    describe("Voting", function () {
        let proposalId = 0;

        beforeEach(async function () {
            const description = "Test proposal for voting";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await ecoGovernance.connect(addr1).createProposal(description, duration);
            // proposalId will be the current count minus 1
            proposalId = Number(await ecoGovernance.proposalCount()) - 1;
        });

        it("Should allow users to vote for proposals", async function () {
            await expect(
                ecoGovernance.connect(addr1).vote(proposalId, true)
            ).to.emit(ecoGovernance, "Voted");
        });

        it("Should allow users to vote against proposals", async function () {
            await expect(
                ecoGovernance.connect(addr1).vote(proposalId, false)
            ).to.emit(ecoGovernance, "Voted");
        });

        it("Should reject double voting", async function () {
            await ecoGovernance.connect(addr1).vote(proposalId, true);
            await expect(
                ecoGovernance.connect(addr1).vote(proposalId, true)
            ).to.be.revertedWith("Already voted");
        });

        it("Should reject voting on non-existent proposals", async function () {
            await expect(
                ecoGovernance.connect(addr1).vote(999, true)
            ).to.be.revertedWith("Invalid proposal ID");
        });

        it("Should count votes correctly", async function () {
            await ecoGovernance.connect(addr1).vote(proposalId, true);
            const proposal = await ecoGovernance.getProposal(proposalId);
            expect(proposal.votesFor).to.be.gt(0);
        });
    });

    describe("Proposal States", function () {
        let proposalId = 0;

        beforeEach(async function () {
            const description = "Test proposal for states";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await ecoGovernance.connect(addr1).createProposal(description, duration);
            proposalId = Number(await ecoGovernance.proposalCount()) - 1;
        });

        it("Should start in Active state", async function () {
            const state = await ecoGovernance.getProposalState(proposalId);
            expect(state).to.equal(0); // Active
        });

        it("Should show correct proposal information", async function () {
            const proposal = await ecoGovernance.getProposal(proposalId);
            expect(proposal.description).to.equal("Test proposal for states");
            expect(proposal.proposer).to.equal(addr1.address);
        });
    });

    describe("Proposal Execution", function () {
        let proposalId = 0;

        beforeEach(async function () {
            const description = "Test proposal for execution";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await ecoGovernance.connect(addr1).createProposal(description, duration);
            proposalId = Number(await ecoGovernance.proposalCount()) - 1;
            
            // Vote for the proposal with addr1 only (has sufficient tokens)
            await ecoGovernance.connect(addr1).vote(proposalId, true);
            
            // Fast forward past the deadline
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
            await ethers.provider.send("evm_mine");
        });

        it("Should allow execution of succeeded proposals", async function () {
            await expect(
                ecoGovernance.executeProposal(proposalId)
            ).to.emit(ecoGovernance, "ProposalExecuted");
        });

        it("Should move to Executed state after execution", async function () {
            await ecoGovernance.executeProposal(proposalId);
            const state = await ecoGovernance.getProposalState(proposalId);
            expect(state).to.equal(3); // Executed
        });

        it("Should reject double execution", async function () {
            await ecoGovernance.executeProposal(proposalId);
            await expect(
                ecoGovernance.executeProposal(proposalId)
            ).to.be.revertedWith("Already executed");
        });
    });

    describe("Governance Parameters", function () {
        it("Should return correct governance parameters", async function () {
            const params = await ecoGovernance.getGovernanceParams();
            expect(params[2]).to.equal(proposalThreshold); // proposal threshold
            expect(params[3]).to.equal(10); // quorum percent
        });

        it("Should track proposal count correctly", async function () {
            const initialCount = await ecoGovernance.proposalCount();
            
            const description = "Test proposal for count";
            const duration = 7 * 24 * 60 * 60; // 7 days
            await ecoGovernance.connect(addr1).createProposal(description, duration);
            
            const newCount = await ecoGovernance.proposalCount();
            expect(Number(newCount)).to.equal(Number(initialCount) + 1);
        });
    });

    describe("Security Features", function () {
        it("Should return correct contract version", async function () {
            const version = await ecoGovernance.version();
            expect(version).to.equal("2.0.0");
        });

        it("Should allow proposal cancellation by proposer", async function () {
            const description = "Test proposal for cancellation";
            const duration = 7 * 24 * 60 * 60; // 7 days
            
            await ecoGovernance.connect(addr1).createProposal(description, duration);
            const proposalId = Number(await ecoGovernance.proposalCount()) - 1;
            
            await expect(
                ecoGovernance.connect(addr1).cancelProposal(proposalId)
            ).to.emit(ecoGovernance, "ProposalCancelled");
        });
    });
});
