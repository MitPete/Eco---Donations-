// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IEcoCoin {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title EcoGovernance
 * @dev Enhanced governance contract with security features and multi-sig support
 * Implements democratic proposal creation and voting using ECO token balance
 */
contract EcoGovernance is Pausable, ReentrancyGuard, Ownable {
    enum ProposalState {
        Active,
        Defeated,
        Succeeded,
        Executed,
        Cancelled
    }

    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        uint256 quorum; // Required minimum votes
        bool executed;
        bool cancelled;
        address proposer;
        uint256 createdAt;
    }

    IEcoCoin public ecoCoin;
    address public multiSigWallet;
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voterWeights; // Track vote weights

    // Governance parameters
    uint256 public minimumVotingPeriod = 3 days;
    uint256 public maximumVotingPeriod = 14 days;
    uint256 public proposalThreshold = 1000 * 10 ** 18; // 1000 ECO tokens to create proposal
    uint256 public quorumPercent = 10; // 10% of total supply needed for quorum
    uint256 public totalEcoSupply; // Updated by contract owner

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string description,
        uint256 deadline,
        uint256 quorum
    );
    event Voted(
        uint256 indexed id,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed id, bool passed);
    event ProposalCancelled(uint256 indexed id, address indexed canceller);
    event QuorumUpdated(uint256 oldPercent, uint256 newPercent);
    event ProposalThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event EmergencyPause(address indexed account);
    event EmergencyUnpause(address indexed account);
    event TotalSupplyUpdated(uint256 newSupply);

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Only MultiSig or Owner"
        );
        _;
    }

    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposals.length, "Invalid proposal ID");
        _;
    }

    constructor(address _ecoCoin) {
        require(_ecoCoin != address(0), "Invalid EcoCoin address");
        ecoCoin = IEcoCoin(_ecoCoin);
        totalEcoSupply = 0; // Will be updated by admin
    }

    /**
     * @dev Set the multi-signature wallet address
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "Invalid address");
        multiSigWallet = _multiSigWallet;
    }

    /**
     * @dev Update total ECO supply for quorum calculations
     */
    function updateTotalSupply(
        uint256 _totalSupply
    ) external onlyMultiSigOrOwner {
        totalEcoSupply = _totalSupply;
        emit TotalSupplyUpdated(_totalSupply);
    }

    /**
     * @dev Update governance parameters
     */
    function setQuorumPercent(uint256 _percent) external onlyMultiSigOrOwner {
        require(_percent >= 1 && _percent <= 50, "Invalid quorum percent");
        uint256 oldPercent = quorumPercent;
        quorumPercent = _percent;
        emit QuorumUpdated(oldPercent, _percent);
    }

    function setProposalThreshold(
        uint256 _threshold
    ) external onlyMultiSigOrOwner {
        uint256 oldThreshold = proposalThreshold;
        proposalThreshold = _threshold;
        emit ProposalThresholdUpdated(oldThreshold, _threshold);
    }

    /**
     * @dev Create a new proposal (open to token holders)
     */
    function createProposal(
        string calldata description,
        uint256 durationSeconds
    ) external whenNotPaused nonReentrant {
        require(bytes(description).length > 0, "Empty description");
        require(
            durationSeconds >= minimumVotingPeriod &&
                durationSeconds <= maximumVotingPeriod,
            "Invalid duration"
        );

        uint256 proposerBalance = ecoCoin.balanceOf(msg.sender);
        require(
            proposerBalance >= proposalThreshold,
            "Insufficient ECO tokens"
        );

        uint256 quorum = (totalEcoSupply * quorumPercent) / 100;
        uint256 deadline = block.timestamp + durationSeconds;

        proposals.push(
            Proposal({
                description: description,
                votesFor: 0,
                votesAgainst: 0,
                deadline: deadline,
                quorum: quorum,
                executed: false,
                cancelled: false,
                proposer: msg.sender,
                createdAt: block.timestamp
            })
        );

        emit ProposalCreated(
            proposals.length - 1,
            msg.sender,
            description,
            deadline,
            quorum
        );
    }

    /**
     * @dev Vote on a proposal
     */
    function vote(
        uint256 proposalId,
        bool support
    ) external whenNotPaused nonReentrant validProposal(proposalId) {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp < prop.deadline, "Voting period ended");
        require(!prop.cancelled, "Proposal cancelled");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = ecoCoin.balanceOf(msg.sender);
        require(weight > 0, "No ECO tokens");

        hasVoted[proposalId][msg.sender] = true;
        voterWeights[proposalId][msg.sender] = weight;

        if (support) {
            prop.votesFor += weight;
        } else {
            prop.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    /**
     * @dev Execute a proposal after voting period
     */
    function executeProposal(
        uint256 proposalId
    ) external whenNotPaused nonReentrant validProposal(proposalId) {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp >= prop.deadline, "Voting still active");
        require(!prop.executed, "Already executed");
        require(!prop.cancelled, "Proposal cancelled");

        uint256 totalVotes = prop.votesFor + prop.votesAgainst;
        require(totalVotes >= prop.quorum, "Quorum not reached");

        prop.executed = true;
        bool passed = prop.votesFor > prop.votesAgainst;

        emit ProposalExecuted(proposalId, passed);

        // Future: Add actual execution logic based on proposal type
    }

    /**
     * @dev Cancel a proposal (only by proposer or admin)
     */
    function cancelProposal(
        uint256 proposalId
    ) external whenNotPaused validProposal(proposalId) {
        Proposal storage prop = proposals[proposalId];
        require(
            msg.sender == prop.proposer ||
                msg.sender == owner() ||
                msg.sender == multiSigWallet,
            "Not authorized"
        );
        require(!prop.executed, "Already executed");
        require(!prop.cancelled, "Already cancelled");

        prop.cancelled = true;
        emit ProposalCancelled(proposalId, msg.sender);
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyMultiSigOrOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    /**
     * @dev Emergency unpause function
     */
    function emergencyUnpause() external onlyMultiSigOrOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Get proposal state
     */
    function getProposalState(
        uint256 proposalId
    ) external view validProposal(proposalId) returns (ProposalState) {
        Proposal storage prop = proposals[proposalId];

        if (prop.cancelled) return ProposalState.Cancelled;
        if (prop.executed) return ProposalState.Executed;
        if (block.timestamp < prop.deadline) return ProposalState.Active;

        uint256 totalVotes = prop.votesFor + prop.votesAgainst;
        if (totalVotes < prop.quorum) return ProposalState.Defeated;

        return
            prop.votesFor > prop.votesAgainst
                ? ProposalState.Succeeded
                : ProposalState.Defeated;
    }

    /**
     * @dev Get detailed proposal information
     */
    function getProposal(
        uint256 proposalId
    )
        external
        view
        validProposal(proposalId)
        returns (
            string memory description,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 deadline,
            uint256 quorum,
            bool executed,
            bool cancelled,
            address proposer,
            uint256 createdAt
        )
    {
        Proposal storage prop = proposals[proposalId];
        return (
            prop.description,
            prop.votesFor,
            prop.votesAgainst,
            prop.deadline,
            prop.quorum,
            prop.executed,
            prop.cancelled,
            prop.proposer,
            prop.createdAt
        );
    }

    /**
     * @dev Get voting statistics
     */
    function getVotingStats(
        uint256 proposalId
    )
        external
        view
        validProposal(proposalId)
        returns (
            uint256 totalVotes,
            uint256 participationRate,
            bool quorumReached
        )
    {
        Proposal storage prop = proposals[proposalId];
        totalVotes = prop.votesFor + prop.votesAgainst;
        participationRate = totalEcoSupply > 0
            ? (totalVotes * 100) / totalEcoSupply
            : 0;
        quorumReached = totalVotes >= prop.quorum;

        return (totalVotes, participationRate, quorumReached);
    }

    /**
     * @dev Get governance parameters
     */
    function getGovernanceParams()
        external
        view
        returns (
            uint256 minVotingPeriod,
            uint256 maxVotingPeriod,
            uint256 propThreshold,
            uint256 quorumPct,
            uint256 totalSupply
        )
    {
        return (
            minimumVotingPeriod,
            maximumVotingPeriod,
            proposalThreshold,
            quorumPercent,
            totalEcoSupply
        );
    }

    /**
     * @dev Get total number of proposals
     */
    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @dev Get contract version
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
