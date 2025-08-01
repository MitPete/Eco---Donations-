const { ethers } = require("hardhat");

/**
 * Contract Deployment Utilities
 * Centralized deployment functions for consistent testing
 */

class DeploymentHelpers {
  /**
   * Deploy EcoCoin contract with specified parameters
   * @param {string} donationAddress - Address of donation contract
   * @param {string} multiSigAddress - Address of multisig wallet
   * @returns {Object} Deployed EcoCoin contract
   */
  static async deployEcoCoin(donationAddress, multiSigAddress) {
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const ecoCoin = await EcoCoin.deploy(donationAddress, multiSigAddress);
    await ecoCoin.deployed();
    return ecoCoin;
  }

  /**
   * Deploy MultiSigWallet with specified owners and required confirmations
   * @param {Array} owners - Array of owner addresses
   * @param {number} requiredConfirmations - Number of required confirmations
   * @returns {Object} Deployed MultiSigWallet contract
   */
  static async deployMultiSigWallet(owners, requiredConfirmations = 2) {
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSig = await MultiSigWallet.deploy(owners, requiredConfirmations);
    await multiSig.deployed();
    return multiSig;
  }

  /**
   * Deploy SecurityConfig with MultiSigWallet integration
   * @param {string} multiSigAddress - Address of deployed MultiSigWallet
   * @returns {Object} Deployed SecurityConfig contract
   */
  static async deploySecurityConfig(multiSigAddress) {
    const SecurityConfig = await ethers.getContractFactory("SecurityConfig");
    const securityConfig = await SecurityConfig.deploy(multiSigAddress);
    await securityConfig.deployed();
    return securityConfig;
  }

  /**
   * Deploy DonationContract with all foundation addresses
   * @param {string} ecoTokenAddress - Address of deployed EcoCoin
   * @param {string} multiSigAddress - Address of MultiSigWallet
   * @param {string} treasuryAddress - Address of treasury
   * @param {Array} foundationUris - Array of foundation URIs
   * @returns {Object} Deployed DonationContract
   */
  static async deployDonationContract(ecoTokenAddress, multiSigAddress, treasuryAddress, foundationUris = []) {
    const DonationContract = await ethers.getContractFactory("DonationContract");

    // Default URIs for foundations
    const defaultUris = [
      "https://example.com/ocean.json",
      "https://example.com/forest.json",
      "https://example.com/wildlife.json",
      "https://example.com/climate.json"
    ];

    const uris = foundationUris.length >= 4 ? foundationUris.slice(0, 4) : defaultUris;

    const donation = await DonationContract.deploy(
      ecoTokenAddress,
      multiSigAddress,
      treasuryAddress,
      uris
    );
    await donation.deployed();

    return donation;
  }

  /**
   * Deploy EcoGovernance with specified parameters
   * @param {string} ecoTokenAddress - Address of deployed EcoCoin
   * @returns {Object} Deployed EcoGovernance contract
   */
  static async deployEcoGovernance(ecoTokenAddress) {
    const EcoGovernance = await ethers.getContractFactory("EcoGovernance");
    const governance = await EcoGovernance.deploy(ecoTokenAddress);
    await governance.deployed();
    return governance;
  }

  /**
   * Deploy AutoDonationContract
   * @param {string} donationAddress - Address of deployed DonationContract
   * @param {string} ecoTokenAddress - Address of deployed EcoCoin
   * @param {string} multiSigAddress - Address of deployed MultiSigWallet
   * @returns {Object} Deployed AutoDonationContract contract
   */
  static async deployAutoDonation(donationAddress, ecoTokenAddress, multiSigAddress) {
    const AutoDonation = await ethers.getContractFactory("AutoDonationContract");
    const autoDonation = await AutoDonation.deploy(donationAddress, ecoTokenAddress, multiSigAddress);
    await autoDonation.deployed();
    return autoDonation;
  }

  /**
   * Deploy complete ecosystem with all contracts
   * @param {Array} signers - Array of signers for foundations
   * @param {Object} params - Deployment parameters
   * @returns {Object} All deployed contracts with metadata
   */
  static async deployCompleteEcosystem(signers, params = {}) {
    const [owner, ...foundations] = signers;

    if (foundations.length < 3) {
      throw new Error("At least 4 signers required (1 owner + 3 foundations)");
    }

    // Extract deployment parameters
    const {
      multiSigOwners = [owner.address, foundations[0].address, foundations[1].address],
      multiSigRequired = 2
    } = params;

    console.log("🚀 Deploying complete Eco Donations ecosystem...");

    // 1. Deploy MultiSigWallet first (no dependencies)
    console.log("1️⃣ Deploying MultiSigWallet...");
    const multiSigWallet = await this.deployMultiSigWallet(multiSigOwners, multiSigRequired);

    // 2. Deploy SecurityConfig (depends on MultiSig)
    console.log("2️⃣ Deploying SecurityConfig...");
    const securityConfig = await this.deploySecurityConfig(multiSigWallet.address);

    // 3. Create a placeholder DonationContract to resolve circular dependency
    console.log("3️⃣ Deploying placeholder DonationContract...");
    const PlaceholderContract = await ethers.getContractFactory("MultiSigWallet"); // Use any simple contract as placeholder
    const placeholder = await PlaceholderContract.deploy([owner.address], 1);
    await placeholder.deployed();

    // 4. Deploy EcoCoin with placeholder address
    console.log("4️⃣ Deploying EcoCoin...");
    const ecoCoin = await this.deployEcoCoin(placeholder.address, multiSigWallet.address);

    // 5. Deploy real DonationContract now that we have EcoCoin
    console.log("5️⃣ Deploying DonationContract...");
    const donation = await this.deployDonationContract(
      ecoCoin.address,
      multiSigWallet.address,
      owner.address
    );

    // 5a. Set foundation addresses for testing
    console.log("📍 Setting foundation addresses...");
    const foundationAddrs = foundations.slice(0, 4).map(f => f.address);
    for (let i = 0; i < 4; i++) {
      await donation.connect(owner).setFoundationAddress(i, foundationAddrs[i]);
    }

    // 5b. Authorize donation contract to mint ECO tokens
    console.log("🔑 Authorizing donation contract to mint ECO tokens...");
    await ecoCoin.connect(owner).setAuthorizedMinter(donation.address, true);

    // 6. Deploy EcoGovernance
    console.log("6️⃣ Deploying EcoGovernance...");
    const governance = await this.deployEcoGovernance(ecoCoin.address);

    // 7. Deploy AutoDonation
    console.log("7️⃣ Deploying AutoDonation...");
    const autoDonation = await this.deployAutoDonation(donation.address, ecoCoin.address, multiSigWallet.address);

    console.log("✅ Complete ecosystem deployed successfully!");

    return {
      contracts: {
        ecoCoin,
        multiSigWallet,
        securityConfig,
        donation,
        governance,
        autoDonation
      },
      accounts: {
        owner,
        foundations: foundations.slice(0, 3),
        multiSigOwners: multiSigOwners.map(addr =>
          signers.find(s => s.address === addr)
        ).filter(Boolean)
      },
      addresses: {
        ecoCoin: ecoCoin.address,
        multiSigWallet: multiSigWallet.address,
        securityConfig: securityConfig.address,
        donation: donation.address,
        governance: governance.address,
        autoDonation: autoDonation.address
      },
      deploymentInfo: {
        timestamp: Date.now(),
        network: (await ethers.provider.getNetwork()).name,
        deployer: owner.address
      }
    };
  }

  /**
   * Deploy minimal test setup (just core contracts)
   * @param {Array} signers - Array of signers
   * @returns {Object} Minimal contract deployment
   */
  static async deployMinimalSetup(signers) {
    const [owner, foundation1, foundation2] = signers;

    const multiSig = await this.deployMultiSigWallet([owner.address, foundation1.address], 2);

    // Use placeholder for EcoCoin deployment
    const placeholder = await this.deployMultiSigWallet([owner.address], 1);
    const ecoCoin = await this.deployEcoCoin(placeholder.address, multiSig.address);

    const donation = await this.deployDonationContract(
      ecoCoin.address,
      multiSig.address,
      owner.address
    );

    return {
      ecoCoin,
      multiSig,
      donation,
      owner,
      foundation1,
      foundation2
    };
  }

  /**
   * Verify deployment by checking basic contract functionality
   * @param {Object} contracts - Deployed contracts object
   * @returns {Object} Verification results
   */
  static async verifyDeployment(contracts) {
    const results = {
      ecoCoin: false,
      multiSigWallet: false,
      securityConfig: false,
      donation: false,
      governance: false,
      autoDonation: false
    };

    try {
      // Verify EcoCoin
      if (contracts.ecoCoin) {
        const maxSupply = await contracts.ecoCoin.maxSupply();
        results.ecoCoin = maxSupply.gt(0);
      }

      // Verify MultiSigWallet
      if (contracts.multiSigWallet) {
        const owners = await contracts.multiSigWallet.getOwners();
        results.multiSigWallet = owners.length > 0;
      }

      // Verify SecurityConfig
      if (contracts.securityConfig) {
        const params = await contracts.securityConfig.securityParams();
        results.securityConfig = params.maxTransactionAmount.gt(0);
      }

      // Verify DonationContract
      if (contracts.donation) {
        const ecoToken = await contracts.donation.ecoToken();
        results.donation = ecoToken !== ethers.constants.AddressZero;
      }

      // Verify EcoGovernance
      if (contracts.governance) {
        const token = await contracts.governance.token();
        results.governance = token !== ethers.constants.AddressZero;
      }

      // Verify AutoDonation
      if (contracts.autoDonation) {
        const donationContract = await contracts.autoDonation.donationContract();
        results.autoDonation = donationContract !== ethers.constants.AddressZero;
      }

    } catch (error) {
      console.error("Verification error:", error.message);
    }

    return results;
  }

  /**
   * Get deployment gas costs
   * @param {Object} deploymentTx - Deployment transaction
   * @returns {Object} Gas cost information
   */
  static async getDeploymentCosts(deploymentTx) {
    const receipt = await deploymentTx.wait();
    const gasUsed = receipt.gasUsed;
    const gasPrice = deploymentTx.gasPrice;
    const cost = gasUsed.mul(gasPrice);

    return {
      gasUsed: gasUsed.toString(),
      gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
      costWei: cost.toString(),
      costEth: ethers.utils.formatEther(cost)
    };
  }
}

module.exports = {
  DeploymentHelpers
};
