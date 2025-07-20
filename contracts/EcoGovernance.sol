// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEcoCoin {
    function balanceOf(address account) external view returns (uint256);
}

contract EcoGovernance {
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    IEcoCoin public ecoCoin;
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    address public owner;

    event ProposalCreated(
        uint256 indexed id,
        string description,
        uint256 deadline
    );
    event Voted(
        uint256 indexed id,
        address voter,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed id, bool passed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _ecoCoin) {
        ecoCoin = IEcoCoin(_ecoCoin);
        owner = msg.sender;
    }

    function createProposal(
        string calldata description,
        uint256 durationSeconds
    ) external onlyOwner {
        proposals.push(
            Proposal({
                description: description,
                votesFor: 0,
                votesAgainst: 0,
                deadline: block.timestamp + durationSeconds,
                executed: false
            })
        );
        emit ProposalCreated(
            proposals.length - 1,
            description,
            block.timestamp + durationSeconds
        );
    }

    function vote(uint256 proposalId, bool support) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp < prop.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        uint256 weight = ecoCoin.balanceOf(msg.sender);
        require(weight > 0, "No ECO tokens");
        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            prop.votesFor += weight;
        } else {
            prop.votesAgainst += weight;
        }
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp >= prop.deadline, "Voting not ended");
        require(!prop.executed, "Already executed");
        prop.executed = true;
        bool passed = prop.votesFor > prop.votesAgainst;
        emit ProposalExecuted(proposalId, passed);
        // Add logic for actual execution if needed
    }

    function getProposal(
        uint256 proposalId
    )
        external
        view
        returns (
            string memory description,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 deadline,
            bool executed
        )
    {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage prop = proposals[proposalId];
        return (
            prop.description,
            prop.votesFor,
            prop.votesAgainst,
            prop.deadline,
            prop.executed
        );
    }

    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
