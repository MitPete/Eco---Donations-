// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

/**
 * @title IEcoGovernance
 * @dev Interface for the EcoGovernance contract
 */
interface IEcoGovernance {
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    enum VoteType {
        Against,
        For,
        Abstain
    }

    struct ProposalCore {
        uint256 id;
        address proposer;
        uint256 eta;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool canceled;
        bool executed;
    }

    // Events
    event ProposalCreated(
        uint256 id,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string description
    );

    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );

    event ProposalCanceled(uint256 id);
    event ProposalExecuted(uint256 id);
    event ProposalQueued(uint256 id, uint256 eta);

    // Core governance functions
    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256);

    function queue(uint256 proposalId) external;

    function execute(uint256 proposalId) external payable;

    function cancel(uint256 proposalId) external;

    function castVote(
        uint256 proposalId,
        uint8 support
    ) external returns (uint256);

    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string calldata reason
    ) external returns (uint256);

    function castVoteBySig(
        uint256 proposalId,
        uint8 support,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256);

    // View functions
    function state(uint256 proposalId) external view returns (ProposalState);

    function proposalSnapshot(
        uint256 proposalId
    ) external view returns (uint256);

    function proposalDeadline(
        uint256 proposalId
    ) external view returns (uint256);

    function getVotes(
        address account,
        uint256 blockNumber
    ) external view returns (uint256);

    function hasVoted(
        uint256 proposalId,
        address account
    ) external view returns (bool);

    function proposalThreshold() external view returns (uint256);

    function quorum(uint256 blockNumber) external view returns (uint256);

    // Settings
    function setVotingDelay(uint256 newVotingDelay) external;

    function setVotingPeriod(uint256 newVotingPeriod) external;

    function setProposalThreshold(uint256 newProposalThreshold) external;

    function updateQuorumNumerator(uint256 newQuorumNumerator) external;
}
