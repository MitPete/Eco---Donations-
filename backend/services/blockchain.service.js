const ethers = require('ethers');
const { EventEmitter } = require('events');

/**
 * Blockchain Service
 * Handles all blockchain interactions and contract management
 */
class BlockchainService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Setup provider based on network
      if (this.config.network === 'localhost') {
        this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl || 'http://localhost:8545');
      } else {
        this.provider = new ethers.providers.InfuraProvider(this.config.network, this.config.infuraKey);
      }

      // Setup signer if private key provided
      if (this.config.privateKey) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
      }

      // Load contract instances
      await this.loadContracts();

      this.isConnected = true;
      this.emit('connected');

      console.log(`✅ Blockchain service connected to ${this.config.network}`);
    } catch (error) {
      console.error('❌ Blockchain service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load all contract instances
   */
  async loadContracts() {
    const contractConfigs = [
      { name: 'donation', address: this.config.contracts.donation, abi: require('../abis/DonationContract.json') },
      { name: 'ecoCoin', address: this.config.contracts.ecoCoin, abi: require('../abis/EcoCoin.json') },
      { name: 'governance', address: this.config.contracts.governance, abi: require('../abis/EcoGovernance.json') },
      { name: 'autoDonation', address: this.config.contracts.autoDonation, abi: require('../abis/AutoDonationService.json') },
      { name: 'multiSig', address: this.config.contracts.multiSig, abi: require('../abis/MultiSigWallet.json') },
      { name: 'securityConfig', address: this.config.contracts.securityConfig, abi: require('../abis/SecurityConfig.json') }
    ];

    for (const config of contractConfigs) {
      try {
        this.contracts[config.name] = new ethers.Contract(
          config.address,
          config.abi,
          this.signer || this.provider
        );
        console.log(`📋 Loaded ${config.name} contract at ${config.address}`);
      } catch (error) {
        console.error(`❌ Failed to load ${config.name} contract:`, error);
      }
    }
  }

  /**
   * Get donation history for a user
   */
  async getDonationHistory(userAddress, limit = 50) {
    try {
      const filter = this.contracts.donation.filters.DonationMade(userAddress);
      const events = await this.contracts.donation.queryFilter(filter, -10000); // Last 10k blocks

      return events.slice(-limit).map(event => ({
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        donor: event.args.donor,
        foundation: event.args.foundation,
        amount: ethers.utils.formatEther(event.args.amount),
        ecoReward: ethers.utils.formatEther(event.args.ecoReward),
        timestamp: null // Will be filled by separate call if needed
      }));
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw error;
    }
  }

  /**
   * Get user's ECO token balance
   */
  async getEcoBalance(userAddress) {
    try {
      const balance = await this.contracts.ecoCoin.balanceOf(userAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching ECO balance:', error);
      throw error;
    }
  }

  /**
   * Get auto-donation settings for user
   */
  async getAutoDonationSettings(userAddress) {
    try {
      const settings = await this.contracts.autoDonation.userSettings(userAddress);
      return {
        isActive: settings.isActive,
        usePercentage: settings.usePercentage,
        donationAmount: ethers.utils.formatEther(settings.donationAmount),
        donationPercentage: settings.donationPercentage.toString(),
        foundation: settings.foundation.toString(),
        monthlyLimit: ethers.utils.formatEther(settings.monthlyLimit),
        currentMonthSpent: ethers.utils.formatEther(settings.currentMonthSpent),
        minTransactionValue: ethers.utils.formatEther(settings.minTransactionValue),
        maxSingleDonation: ethers.utils.formatEther(settings.maxSingleDonation)
      };
    } catch (error) {
      console.error('Error fetching auto-donation settings:', error);
      throw error;
    }
  }

  /**
   * Get governance proposals
   */
  async getGovernanceProposals(limit = 20) {
    try {
      const filter = this.contracts.governance.filters.ProposalCreated();
      const events = await this.contracts.governance.queryFilter(filter, -10000);

      const proposals = [];
      for (const event of events.slice(-limit)) {
        const proposalId = event.args.proposalId;
        const state = await this.contracts.governance.state(proposalId);
        const votes = await this.contracts.governance.proposalVotes(proposalId);

        proposals.push({
          id: proposalId.toString(),
          proposer: event.args.proposer,
          description: event.args.description,
          state: this.getProposalStateName(state),
          forVotes: ethers.utils.formatEther(votes.forVotes),
          againstVotes: ethers.utils.formatEther(votes.againstVotes),
          abstainVotes: ethers.utils.formatEther(votes.abstainVotes),
          startBlock: event.args.startBlock?.toString(),
          endBlock: event.args.endBlock?.toString()
        });
      }

      return proposals.reverse(); // Most recent first
    } catch (error) {
      console.error('Error fetching governance proposals:', error);
      throw error;
    }
  }

  /**
   * Get foundation statistics
   */
  async getFoundationStats() {
    try {
      const foundations = [];
      const foundationNames = ['SaveTheOceans', 'ProtectTheRainforest', 'CleanEnergy', 'WildlifeProtection', 'ClimateAction'];

      for (let i = 0; i < foundationNames.length; i++) {
        const filter = this.contracts.donation.filters.DonationMade(null, i);
        const events = await this.contracts.donation.queryFilter(filter, -10000);

        const totalAmount = events.reduce((sum, event) => {
          return sum.add(event.args.amount);
        }, ethers.BigNumber.from(0));

        foundations.push({
          id: i,
          name: foundationNames[i],
          totalDonations: ethers.utils.formatEther(totalAmount),
          donationCount: events.length
        });
      }

      return foundations;
    } catch (error) {
      console.error('Error fetching foundation stats:', error);
      throw error;
    }
  }

  /**
   * Monitor blockchain events
   */
  startEventMonitoring() {
    if (!this.isConnected) {
      throw new Error('Blockchain service not connected');
    }

    // Monitor donations
    this.contracts.donation.on('DonationMade', (donor, foundation, amount, ecoReward, event) => {
      this.emit('donation', {
        donor,
        foundation: foundation.toString(),
        amount: ethers.utils.formatEther(amount),
        ecoReward: ethers.utils.formatEther(ecoReward),
        txHash: event.transactionHash
      });
    });

    // Monitor auto-donations
    this.contracts.autoDonation.on('AutoDonationTriggered', (user, amount, foundation, event) => {
      this.emit('autoDonation', {
        user,
        amount: ethers.utils.formatEther(amount),
        foundation: foundation.toString(),
        txHash: event.transactionHash
      });
    });

    // Monitor governance proposals
    this.contracts.governance.on('ProposalCreated', (proposalId, proposer, description, event) => {
      this.emit('proposal', {
        id: proposalId.toString(),
        proposer,
        description,
        txHash: event.transactionHash
      });
    });

    // Monitor security alerts
    this.contracts.securityConfig.on('SecurityAlert', (message, triggeredBy, event) => {
      this.emit('securityAlert', {
        message,
        triggeredBy,
        txHash: event.transactionHash,
        severity: 'high'
      });
    });

    console.log('🔍 Event monitoring started');
  }

  /**
   * Stop event monitoring
   */
  stopEventMonitoring() {
    Object.values(this.contracts).forEach(contract => {
      contract.removeAllListeners();
    });
    console.log('🛑 Event monitoring stopped');
  }

  /**
   * Get proposal state name
   */
  getProposalStateName(state) {
    const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
    return states[state] || 'Unknown';
  }

  /**
   * Get network status
   */
  async getNetworkStatus() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        network: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        connected: this.isConnected
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const network = await this.getNetworkStatus();
      const contractChecks = {};

      // Check each contract
      for (const [name, contract] of Object.entries(this.contracts)) {
        try {
          await contract.provider.getCode(contract.address);
          contractChecks[name] = 'healthy';
        } catch (error) {
          contractChecks[name] = 'error';
        }
      }

      return {
        status: 'healthy',
        network,
        contracts: contractChecks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = BlockchainService;
