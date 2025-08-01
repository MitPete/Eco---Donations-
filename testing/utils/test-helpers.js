const { ethers } = require("hardhat");

/**
 * Test Helper Utilities
 * Common functions used across multiple test files
 */

class TestHelpers {
  /**
   * Deploy all core contracts for testing
   * @param {Array} signers - Array of signers from ethers.getSigners()
   * @returns {Object} Deployed contract instances
   */
  static async deployAllContracts(signers) {
    const [owner, foundation1, foundation2, foundation3, foundation4, foundation5] = signers;

    // Deploy EcoCoin
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const maxSupply = ethers.utils.parseEther("1000000");
    const ecoCoin = await EcoCoin.deploy(maxSupply);
    await ecoCoin.deployed();

    // Deploy MultiSigWallet
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(
      [owner.address, foundation1.address, foundation2.address],
      2
    );
    await multiSigWallet.deployed();

    // Deploy SecurityConfig
    const SecurityConfig = await ethers.getContractFactory("SecurityConfig");
    const securityConfig = await SecurityConfig.deploy(multiSigWallet.address);
    await securityConfig.deployed();

    // Deploy DonationContract
    const DonationContract = await ethers.getContractFactory("DonationContract");
    const donation = await DonationContract.deploy(
      ecoCoin.address,
      foundation1.address,
      foundation2.address,
      foundation3.address,
      foundation4.address,
      foundation5.address
    );
    await donation.deployed();

    // Deploy EcoGovernance
    const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
    const proposalThreshold = ethers.utils.parseEther("100");
    const votingDelay = 1;
    const votingPeriod = 50;
    const governance = await EcoGovernance.deploy(
      ecoCoin.address,
      proposalThreshold,
      votingDelay,
      votingPeriod
    );
    await governance.deployed();

    // Deploy AutoDonation
    const AutoDonation = await ethers.getContractFactory("AutoDonationService");
    const autoDonation = await AutoDonation.deploy(donation.address, ecoCoin.address);
    await autoDonation.deployed();

    return {
      ecoCoin,
      multiSigWallet,
      securityConfig,
      donation,
      governance,
      autoDonation,
      owner,
      foundations: [foundation1, foundation2, foundation3, foundation4, foundation5]
    };
  }

  /**
   * Setup test accounts with ECO tokens and delegated voting power
   * @param {Object} ecoCoin - EcoCoin contract instance
   * @param {Array} accounts - Array of account signers
   * @param {Array} amounts - Array of token amounts to mint (in ETH units)
   */
  static async setupTestAccounts(ecoCoin, accounts, amounts) {
    for (let i = 0; i < accounts.length && i < amounts.length; i++) {
      const amount = ethers.utils.parseEther(amounts[i].toString());
      await ecoCoin.mintTokens(accounts[i].address, amount);
      await ecoCoin.connect(accounts[i]).delegate(accounts[i].address);
    }
  }

  /**
   * Create a sample governance proposal
   * @param {Object} governance - EcoGovernance contract instance
   * @param {Object} proposer - Signer who will create the proposal
   * @param {string} description - Proposal description
   * @returns {number} Proposal ID
   */
  static async createSampleProposal(governance, proposer, description = "Test Proposal") {
    const targets = [ethers.constants.AddressZero];
    const values = [0];
    const calldatas = ["0x"];

    const tx = await governance.connect(proposer).propose(targets, values, calldatas, description);
    const receipt = await tx.wait();
    const proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

    return proposalId;
  }

  /**
   * Setup auto-donation subscription for testing
   * @param {Object} autoDonation - AutoDonation contract instance
   * @param {Object} user - User signer
   * @param {string} type - "fixed" or "percentage"
   * @param {Object} params - Subscription parameters
   */
  static async setupAutoDonationSubscription(autoDonation, user, type, params) {
    if (type === "fixed") {
      await autoDonation.connect(user).subscribeFixedAmount(
        params.amount || ethers.utils.parseEther("0.01"),
        params.foundationIndex || 0,
        params.monthlyLimit || ethers.utils.parseEther("1.0"),
        params.minTransactionValue || ethers.utils.parseEther("0.1")
      );
    } else if (type === "percentage") {
      await autoDonation.connect(user).subscribePercentage(
        params.percentage || 50, // 0.5%
        params.foundationIndex || 0,
        params.monthlyLimit || ethers.utils.parseEther("1.0"),
        params.minTransactionValue || ethers.utils.parseEther("0.1"),
        params.maxSingleDonation || ethers.utils.parseEther("0.05")
      );
    }
  }

  /**
   * Fast forward time for testing time-dependent functionality
   * @param {number} seconds - Number of seconds to advance
   */
  static async advanceTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  /**
   * Advance to a specific block number
   * @param {number} blockNumber - Target block number
   */
  static async advanceToBlock(blockNumber) {
    const currentBlock = await ethers.provider.getBlockNumber();
    const blocksToAdvance = blockNumber - currentBlock;

    for (let i = 0; i < blocksToAdvance; i++) {
      await ethers.provider.send("evm_mine");
    }
  }

  /**
   * Get formatted balance for easier testing assertions
   * @param {string} address - Address to check balance for
   * @returns {string} Balance in ETH format
   */
  static async getFormattedBalance(address) {
    const balance = await ethers.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  /**
   * Setup multisig transaction for testing
   * @param {Object} multiSig - MultiSigWallet contract instance
   * @param {Object} submitter - Signer who submits the transaction
   * @param {string} target - Target address
   * @param {string} value - Value in ETH
   * @param {string} data - Transaction data
   * @returns {number} Transaction index
   */
  static async setupMultiSigTransaction(multiSig, submitter, target, value = "0", data = "0x") {
    const valueInWei = ethers.utils.parseEther(value);
    const tx = await multiSig.connect(submitter).submitTransaction(target, valueInWei, data);
    const receipt = await tx.wait();
    const txIndex = receipt.events.find(e => e.event === "SubmitTransaction").args.txIndex;
    return txIndex;
  }

  /**
   * Fund an address with ETH for testing
   * @param {Object} signer - Signer to send from
   * @param {string} target - Target address to fund
   * @param {string} amount - Amount in ETH
   */
  static async fundAddress(signer, target, amount) {
    await signer.sendTransaction({
      to: target,
      value: ethers.utils.parseEther(amount)
    });
  }

  /**
   * Calculate expected ECO token rewards for donation
   * @param {string} donationAmount - Donation amount in ETH
   * @param {number} rewardRate - Reward rate (default: 10 ECO per 1 ETH)
   * @returns {BigNumber} Expected ECO tokens
   */
  static calculateExpectedRewards(donationAmount, rewardRate = 10) {
    const donationInWei = ethers.utils.parseEther(donationAmount);
    const rewardInWei = donationInWei.mul(rewardRate);
    return rewardInWei;
  }

  /**
   * Setup emergency responders for SecurityConfig testing
   * @param {Object} securityConfig - SecurityConfig contract instance
   * @param {Object} owner - Owner signer
   * @param {Array} responders - Array of responder addresses
   */
  static async setupEmergencyResponders(securityConfig, owner, responders) {
    for (const responder of responders) {
      await securityConfig.connect(owner).setEmergencyResponder(responder, true);
    }
  }

  /**
   * Create sample donations for testing
   * @param {Object} donation - DonationContract instance
   * @param {Array} donors - Array of donor signers
   * @param {Array} amounts - Array of donation amounts in ETH
   * @param {Array} foundations - Array of foundation indices
   */
  static async createSampleDonations(donation, donors, amounts, foundations) {
    for (let i = 0; i < donors.length; i++) {
      const amount = ethers.utils.parseEther(amounts[i].toString());
      const foundationIndex = foundations[i] || 0;

      await donation.connect(donors[i]).donate(foundationIndex, { value: amount });
    }
  }

  /**
   * Check if transaction would revert without actually sending it
   * @param {Promise} transaction - Transaction promise
   * @returns {boolean} True if transaction would revert
   */
  static async wouldRevert(transaction) {
    try {
      await transaction;
      return false;
    } catch (error) {
      return true;
    }
  }

  /**
   * Generate random test data
   * @param {string} type - Type of data to generate ("address", "amount", "percentage")
   * @returns {string|number} Generated test data
   */
  static generateTestData(type) {
    switch (type) {
      case "address":
        return ethers.Wallet.createRandom().address;
      case "amount":
        return (Math.random() * 10).toFixed(4); // 0-10 ETH
      case "percentage":
        return Math.floor(Math.random() * 1000); // 0-10%
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }
  }
}

module.exports = {
  TestHelpers
};
